"""batsynth.core: the instrument standard.

One contract for every instrument, so a song, the Studio or a future
human-facing synth can treat them all the same way.

An instrument
-------------
* **declares its parameters** as `Param` objects: default, range, unit,
  curve and a one-line help text. That is enough for a UI to draw a knob,
  for a preset to be validated, and for an AI composer to know what it may
  turn. Every instrument also has the five common parameters in `COMMON`.
* **renders a note**: `render_note(pitch, vel, dur)` returns a float32
  stereo array, shape (2, n). Pitch is a MIDI number (floats allowed for
  microtones); duration is the gate in seconds, and the instrument adds
  its own tail.
* **plays a part**: `play(notes, bpm=…)` takes `Note`s (or tuples
  `(start, dur, pitch, vel, {per-note params})`) and returns one buffer.
* **comes out at the working level**: −18 dBFS RMS over its loudest 50 ms
  at velocity 1, and never above −1 dBFS peak. Balance is done with layer
  gains, never by guessing an instrument's loudness.
* **is deterministic**: the same seed gives a bit-identical render.
* **saves and loads patches** as JSON (`to_dict`, `from_dict`), in the
  format `batsynth.patch/1`.

Registering a class with `@register` makes it available by name through
`get()`, `names()` and `catalog()`.
"""
from __future__ import annotations

import json
import zlib
from dataclasses import dataclass, field
from types import SimpleNamespace
from typing import Any, Iterable

import numpy as np

from . import dsp

PATCH_FORMAT = "batsynth.patch/1"
WORKING_RMS_DB = -18.0
PEAK_CEILING_DB = -1.0


@dataclass(frozen=True)
class Param:
    default: Any
    min: float = 0.0
    max: float = 1.0
    unit: str = ""
    curve: str = "lin"  # lin | log | int | choice
    choices: tuple = ()
    help: str = ""

    def clamp(self, v):
        if self.curve == "choice":
            if isinstance(v, (int, np.integer)) and not isinstance(v, bool) and v not in self.choices:
                v = self.choices[int(v) % len(self.choices)]
            if v not in self.choices:
                raise ValueError(f"{v!r} is not one of {self.choices}")
            return v
        v = float(np.clip(float(v), self.min, self.max))
        return int(round(v)) if self.curve == "int" else v

    def to_norm(self, v) -> float:
        """Value to a 0..1 knob position."""
        if self.curve == "choice":
            return self.choices.index(v) / max(1, len(self.choices) - 1)
        if self.curve == "log" and self.min > 0:
            return float(np.log(v / self.min) / np.log(self.max / self.min))
        return float((v - self.min) / (self.max - self.min))

    def from_norm(self, x: float):
        """A 0..1 knob position to a value."""
        x = float(np.clip(x, 0.0, 1.0))
        if self.curve == "choice":
            return self.choices[int(round(x * (len(self.choices) - 1)))]
        if self.curve == "log" and self.min > 0:
            return self.clamp(self.min * (self.max / self.min) ** x)
        return self.clamp(self.min + x * (self.max - self.min))

    def describe(self) -> dict:
        d = {"default": self.default, "min": self.min, "max": self.max,
             "unit": self.unit, "curve": self.curve, "help": self.help}
        if self.curve == "choice":
            d["choices"] = list(self.choices)
            d.pop("min")
            d.pop("max")
        return d


COMMON = {
    "tune": Param(0.0, -1200, 1200, "cents", help="Detune the whole instrument."),
    "drive": Param(0.0, 0, 1, help="Saturation after the voice. 0 is clean."),
    "crush": Param(0.0, 0, 1, help="Bit and sample-rate reduction. 0 is off; 1 is 3-bit at 1/16 the rate."),
    "pan": Param(0.0, -1, 1, help="Left (-1) to right (+1)."),
    "width": Param(0.5, 0, 1, help="Stereo spread. 0 is mono."),
}


@dataclass
class Note:
    start: float
    dur: float
    pitch: float
    vel: float = 0.8
    params: dict = field(default_factory=dict)

    @classmethod
    def of(cls, x) -> "Note":
        if isinstance(x, Note):
            return x
        if isinstance(x, dict):
            return cls(**x)
        x = tuple(x)
        if len(x) == 5:
            return cls(x[0], x[1], x[2], x[3], dict(x[4]))
        return cls(*x)


REGISTRY: dict[str, type] = {}


def register(cls):
    REGISTRY[cls.name] = cls
    return cls


def get(name: str, preset: str | None = None, seed: int = 0, **overrides) -> "Instrument":
    try:
        cls = REGISTRY[name]
    except KeyError:
        raise KeyError(f"no instrument {name!r}; have {sorted(REGISTRY)}") from None
    return cls(preset=preset, seed=seed, **overrides)


def names(family: str | None = None) -> list[str]:
    return [k for k, c in REGISTRY.items() if family is None or c.family == family]


def catalog() -> list[dict]:
    return [c.describe() for c in REGISTRY.values()]


class Instrument:
    name = "Instrument"
    family = "misc"
    blurb = ""
    pitched = True
    params: dict[str, Param] = {}
    presets: dict[str, dict] = {}
    tail = 0.3
    range = (36, 96)  # comfortable MIDI range, for UIs and composers

    def __init__(self, preset: str | None = None, seed: int = 0, **overrides):
        self.seed = int(seed)
        self.values = {k: p.default for k, p in self.schema().items()}
        self.preset = None
        if preset is not None:
            self.load_preset(preset)
        self.set(**overrides)

    # ------------------------------------------------------------ parameters

    @classmethod
    def schema(cls) -> dict[str, Param]:
        return {**COMMON, **cls.params}

    def set(self, **kw) -> "Instrument":
        sch = self.schema()
        for k, v in kw.items():
            if k not in sch:
                raise KeyError(f"{self.name} has no parameter {k!r}; it has {sorted(sch)}")
            self.values[k] = sch[k].clamp(v)
        return self

    def load_preset(self, name: str) -> "Instrument":
        if name not in self.presets:
            raise KeyError(f"{self.name} has no preset {name!r}; it has {list(self.presets)}")
        self.values = {k: p.default for k, p in self.schema().items()}
        self.set(**self.presets[name])
        self.preset = name
        return self

    def _resolve(self, expr: dict) -> SimpleNamespace:
        vals = dict(self.values)
        sch = self.schema()
        for k, v in expr.items():
            if k not in sch:
                raise KeyError(f"{self.name} has no parameter {k!r}")
            vals[k] = sch[k].clamp(v)
        return SimpleNamespace(**vals)

    # ------------------------------------------------------------ patches

    def to_dict(self) -> dict:
        return {"format": PATCH_FORMAT, "instrument": self.name, "preset": self.preset,
                "seed": self.seed, "params": dict(self.values)}

    def to_json(self, **kw) -> str:
        return json.dumps(self.to_dict(), **kw)

    @staticmethod
    def from_dict(d: dict) -> "Instrument":
        if d.get("format") != PATCH_FORMAT:
            raise ValueError(f"not a {PATCH_FORMAT} patch")
        inst = get(d["instrument"], seed=d.get("seed", 0))
        inst.set(**d.get("params", {}))
        inst.preset = d.get("preset")
        return inst

    @classmethod
    def describe(cls) -> dict:
        return {"name": cls.name, "family": cls.family, "blurb": cls.blurb,
                "pitched": cls.pitched, "range": list(cls.range),
                "params": {k: p.describe() for k, p in cls.schema().items()},
                "presets": cls.presets}

    # ------------------------------------------------------------ rendering

    def length(self, dur: float, p: SimpleNamespace) -> float:
        """Seconds to render for a note of gate `dur` (gate plus tail)."""
        return dur + self.tail

    def voice(self, f0: float, vel: float, dur: float, p: SimpleNamespace,
              rng: np.random.Generator, sr: int) -> np.ndarray:
        """Subclasses: return mono (n,) or stereo (2, n) at any scale."""
        raise NotImplementedError

    def _rng(self, seed, index) -> np.random.Generator:
        return np.random.default_rng([int(seed), int(index), zlib.crc32(self.name.encode())])

    def render_note(self, pitch: float, vel: float = 0.8, dur: float = 0.5, sr: int = dsp.SR,
                    seed: int | None = None, index: int = 0, **expr) -> np.ndarray:
        p = self._resolve(expr)
        f0 = float(dsp.midi_hz(pitch)) * 2.0 ** (p.tune / 1200.0)
        rng = self._rng(self.seed if seed is None else seed, index)
        dur = max(float(dur), 0.005)
        y = np.asarray(self.voice(f0, vel, dur, p, rng, sr), dtype=float)
        y = np.nan_to_num(y, nan=0.0, posinf=0.0, neginf=0.0)
        if y.ndim == 1:
            y = y[None, :]
        y = dsp.dc_block(y, sr)
        pk = np.abs(y).max()
        if pk < 1e-12:
            return np.zeros((2, y.shape[1]), dtype=np.float32)
        y = y / pk
        if p.drive > 0:
            y = dsp.softclip(y, 12.0 * p.drive ** 1.5)
        if p.crush > 0:
            y = dsp.crush(y, 16.0 - 13.0 * p.crush, 1 + int(round(15 * p.crush ** 2)))
        # stereo
        if y.shape[0] == 1:
            m = y[0]
            s = p.width * 0.6 * 0.5 * (dsp.delay(m, 0.011, sr) - dsp.delay(m, 0.007, sr))
        else:
            m = 0.5 * (y[0] + y[1])
            s = 0.5 * (y[0] - y[1]) * (2.0 * p.width)
        # working level, judged on the mid signal
        win = max(1, int(0.05 * sr))
        sq = np.concatenate([[0.0], np.cumsum(m * m)])
        if len(m) > win:
            loud = np.sqrt((sq[win:] - sq[:-win]).max() / win)
        else:
            loud = np.sqrt(sq[-1] / max(1, len(m)))
        target = 10.0 ** (WORKING_RMS_DB / 20.0) * max(vel, 0.0) ** 1.5
        g = target / max(loud, 1e-9)
        out = np.vstack([m + s, m - s]) * g
        ceiling = 10.0 ** (PEAK_CEILING_DB / 20.0) * max(vel, 0.0) ** 1.5
        pk = np.abs(out).max()
        if pk > ceiling:
            out *= ceiling / pk
        if p.pan:
            out[0] *= np.sqrt(np.clip(1.0 - p.pan, 0.0, 1.0))
            out[1] *= np.sqrt(np.clip(1.0 + p.pan, 0.0, 1.0))
        dsp.fade_out(out, sr, 0.005)
        return out.astype(np.float32)

    def play(self, notes: Iterable, sr: int = dsp.SR, bpm: float | None = None,
             length: float | None = None) -> np.ndarray:
        """Render a part. With bpm, note starts and durations are in beats."""
        spb = 60.0 / bpm if bpm else 1.0
        parts = []
        for i, x in enumerate(notes):
            nt = Note.of(x)
            y = self.render_note(nt.pitch, nt.vel, nt.dur * spb, sr, index=i, **nt.params)
            parts.append((nt.start * spb, y))
        end = max([s + y.shape[1] / sr for s, y in parts], default=0.0)
        n = int(np.ceil((length if length is not None else end) * sr))
        out = np.zeros((2, n), dtype=np.float32)
        for s, y in parts:
            dsp.place(out, y, s, sr)
        return out

    def __repr__(self):
        return f"<{self.name} preset={self.preset!r} seed={self.seed}>"
