"""batsynth.genres: signature sounds of four genres, on the same standard.

    cyberpunk   NeonBrass, Braam, DarkBass, SyncLead, NeonChoir
    hi-tech     PsyBass, Acid, Twister
    house       Supersaw, ProgPluck
    dubstep     Wobble, Growl, Reese, SubBass, Snare

Mir's standing sound rules apply to every one: basses are warm by default
(asymmetric saturation below 3 kHz), oscillators drift a few cents so nothing
sounds sterile, and no sound relies on bright white noise. Highs come from
harmonics and choirs, not hiss.

Helpers for writing parts: `acid_line()` turns a step pattern into notes with
slides and accents, and `psy_roll()` writes the rolling off-beat psy bass.
"""
from __future__ import annotations

import numpy as np
from scipy import signal

from . import dsp
from .core import Instrument, Param, register
from .robots import into

TAU = dsp.TAU

# ------------------------------------------------------------------ helpers

DIVISIONS = {"1/1": 4.0, "1/2": 2.0, "1/4": 1.0, "3/16": 0.75, "1/8": 0.5, "1/8T": 1 / 3,
             "1/16": 0.25, "1/16T": 1 / 6, "1/32": 0.125}


def tempo_hz(bpm: float, division: str) -> float:
    """Cycles per second of a note division at a tempo."""
    return bpm / 60.0 / DIVISIONS[division]


def drift(n, sr, rng, cents=5.0, rate=0.6):
    """Slow analog pitch wander, as a frequency ratio curve."""
    return 2.0 ** (cents / 1200.0 * dsp.smooth_random(n, sr, rate, rng))


def lp24(x, f, res=0.0, sr=dsp.SR):
    """A 24 dB/oct resonant low-pass (two biquads, resonance on the second)."""
    y = dsp.filt(x, "lp", f, 0.54, sr)
    return dsp.filt(y, "lp", f, 0.6 + 12.0 * res ** 1.5, sr)


def warm(x, amount, sr=dsp.SR):
    """Parallel asymmetric saturation below 3 kHz: body and even harmonics, not fizz."""
    if amount <= 0:
        return x
    pk = np.abs(x).max() + 1e-12
    sat = np.tanh(2.2 * x / pk + 0.25) - np.tanh(0.25)
    sat = dsp.lp(sat, 3000.0, sr)
    sat = dsp.hp(sat, 30.0, sr)
    return x + amount * sat * (dsp.rms(x) / (dsp.rms(sat) + 1e-12))


def chorus(x, sr=dsp.SR, depth_ms=3.0, rate=0.6, mix=0.5, base_ms=12.0, phase0=0.0):
    n = len(x)
    i = np.arange(n, dtype=float)
    d = (base_ms + depth_ms * np.sin(TAU * rate * i / sr + phase0)) * 1e-3 * sr
    return (1.0 - mix) * x + mix * np.interp(i - d, i, x, left=0.0)


def saws(f, sr, rng, voices=3, cents=12.0, side=0.7, spread=0.85, drift_cents=4.0):
    """Detuned saws spread across the stereo field: (2, n)."""
    n = len(f)
    out = np.zeros((2, n))
    offs = np.linspace(-1.0, 1.0, voices) if voices > 1 else np.zeros(1)
    for o in offs:
        dr = drift(n, sr, rng, drift_cents, rng.uniform(0.3, 0.9))
        s = dsp.saw(f * 2.0 ** (o * cents / 1200.0) * dr, sr, rng.uniform(0, 1))
        g = 1.0 if abs(o) < 1e-9 else side
        pan = o * spread
        out[0] += g * s * np.sqrt((1.0 - pan) / 2.0)
        out[1] += g * s * np.sqrt((1.0 + pan) / 2.0)
    return out


def fm_guard(idx, f, ratio, limit=18000.0):
    """Cap an FM index so the sidebands (Carson's rule) stay below `limit`."""
    cap = (limit - f) / (np.maximum(f * ratio, 1.0)) - 1.0
    return np.minimum(idx, np.maximum(cap, 0.0))


def lfo(t, rate, shape="sine"):
    """0..1, starting at 0 (closed) for sine, triangle and saw-up; square starts open."""
    ph = (t * rate) % 1.0
    if shape == "sine":
        return 0.5 - 0.5 * np.cos(TAU * ph)
    if shape == "triangle":
        return 2.0 * np.minimum(ph, 1.0 - ph)
    if shape == "saw-down":
        return 1.0 - ph
    if shape == "saw-up":
        return ph
    return (ph < 0.5).astype(float)


_CHOIR = {  # five formants (Hz), choir-like
    "a": (800, 1150, 2900, 3900, 4950), "o": (450, 800, 2830, 3800, 4950),
    "u": (325, 700, 2700, 3800, 4950), "e": (400, 1600, 2700, 3300, 4950),
    "i": (270, 2140, 2950, 3900, 4950),
}


def vowel_path(letters: str, n: int, span: int | None = None) -> np.ndarray:
    """Formant frequencies (n, 5) gliding through the vowels over `span` samples."""
    pts = np.log(np.array([_CHOIR[v] for v in letters], dtype=float))
    span = n if span is None else max(2, min(n, span))
    if len(letters) == 1:
        return np.exp(np.repeat(pts, n, axis=0))
    x = np.minimum(np.arange(n) / span, 1.0) * (len(letters) - 1)
    out = np.empty((n, 5))
    for k in range(5):
        out[:, k] = np.interp(x, np.arange(len(letters)), pts[:, k])
    return np.exp(out)


def formants(src, F, sr=dsp.SR, bws=(80, 90, 120, 130, 140), gains=(1.0, 0.5, 0.25, 0.2, 0.1), k=5):
    y = np.zeros(len(src))
    for j in range(k):
        fj = np.minimum(F[:, j], 0.45 * sr)
        y += gains[j] * dsp.filt(src, "bp", fj, fj / bws[j], sr)
    return y


def yow(x, sr, amount, n_note, rng):
    """A per-note 'yow': two formants opening and closing, mixed with the dry sound."""
    if amount <= 0:
        return x
    n = len(x)
    F = vowel_path("oao", n, n_note)
    y = formants(x, F, sr, bws=(70, 90), gains=(1.0, 0.7), k=2)
    y = np.tanh(2.0 * dsp.unit(y))
    return (1.0 - amount) * x + amount * y * dsp.rms(x)


def stereo_apply(x, fn):
    return np.vstack([fn(x[0], 0), fn(x[1], 1)])


# ------------------------------------------------------------------ part writers

def acid_line(steps, root: int, step: float = 0.25, start: float = 0.0, gate: float = 0.55):
    """A 303-style line from steps.

    Each step is None (rest) or (semitones, flags) where flags may contain
    'a' (accent) and 's' (slide into this note from the previous one).
    Returns notes for Acid.play (times in beats).
    """
    notes, prev = [], None
    for i, s in enumerate(steps):
        if s is None:
            prev = None
            continue
        semi, flags = (s, "") if isinstance(s, (int, float)) else s
        pitch = root + semi
        vel = 0.95 if "a" in flags else 0.75
        extra = {}
        if "s" in flags and prev is not None:
            extra["slide"] = float(np.clip(prev[2] - pitch, -24, 24))
            notes[-1] = (prev[0], step * 1.05, prev[2], prev[3], prev[4])  # tie into the slide
        note = (start + i * step, step * gate, pitch, vel, extra)
        notes.append(note)
        prev = note
    return notes


def psy_roll(bars: int, pitches, start: float = 0.0, pattern: str = "-bbb", vel: float = 0.85):
    """Rolling psy bass: per beat, 'b' plays a 16th and '-' leaves room for the kick.

    `pitches` is one MIDI pitch, or one per bar.
    """
    if isinstance(pitches, (int, float)):
        pitches = [pitches] * bars
    notes = []
    for b in range(bars):
        for beat in range(4):
            for k, c in enumerate(pattern):
                if c == "b":
                    notes.append((start + b * 4 + beat + k * 0.25, 0.2, pitches[b % len(pitches)], vel))
    return notes


# ================================================================== cyberpunk

@register
class NeonBrass(Instrument):
    name = "NeonBrass"
    family = "cyberpunk"
    blurb = ("A polysynth brass in the style of rain-soaked 80s sci-fi scores: two drifting saws and a "
             "pulse, a brassy filter swell, a ribbon slide into the note and late vibrato.")
    range = (36, 84)
    params = {
        "brass": Param(0.6, 0, 1, help="How far the filter swells open: the brassiness."),
        "swell": Param(0.25, 0.005, 3, "s", "log", help="Attack of the swell."),
        "bend": Param(1.0, 0, 7, "st", help="Slide up into the note from this far below."),
        "vibrato": Param(18.0, 0, 60, "cents", help="Vibrato depth."),
        "vib_rate": Param(5.2, 3, 8, "Hz", help="Vibrato speed."),
        "vib_delay": Param(0.35, 0, 2, "s", help="How long before the vibrato arrives."),
        "detune": Param(9.0, 0, 40, "cents", help="Spread between the two saws."),
        "bright": Param(700.0, 150, 4000, "Hz", "log", help="Resting filter cutoff."),
        "sub": Param(0.25, 0, 1, help="Sub-octave sine."),
        "chorus": Param(0.5, 0, 1, help="Stereo chorus."),
        "release": Param(0.7, 0.05, 4, "s", "log", help="Fade after the note."),
    }
    presets = {
        "Rain brass": dict(swell=0.6, bend=2.0, vibrato=28, vib_delay=0.5, brass=0.55, chorus=0.7, release=1.4),
        "Rooftop fanfare": dict(brass=0.95, swell=0.04, bend=0.5, vibrato=10, bright=1200, release=0.4),
        "Neon haze": dict(brass=0.3, swell=1.6, bend=0.0, vibrato=8, detune=16, bright=500, chorus=0.9, release=2.5),
        "Noir horn": dict(brass=0.4, swell=0.15, bend=1.5, vibrato=22, bright=380, sub=0.4, release=0.8),
    }

    def length(self, dur, p):
        return dur + p.release + 0.05

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        glide = 0.06 + 0.15 * p.swell
        bend = -p.bend * (1.0 - dsp.ramp(n, sr, 0.0, glide))
        vib = p.vibrato / 1200.0 * np.sin(TAU * p.vib_rate * t) * dsp.ramp(n, sr, p.vib_delay, 0.5)
        f = f0 * 2.0 ** (bend / 12.0 + vib)
        src = saws(f, sr, rng, 2, p.detune, side=1.0, spread=0.6)
        mono = 0.5 * dsp.square(f * drift(n, sr, rng, 4.0), sr, 0.42) + p.sub * np.sin(TAU * dsp.phase(f / 2, sr))
        src += mono[None, :]
        envf = dsp.adsr(n, sr, dur, max(0.01, 0.6 * p.swell), 0.5, 0.45, p.release)
        cut = np.minimum(p.bright * (1.0 + 7.0 * p.brass * envf * (0.5 + 0.5 * vel)), 16000.0)
        out = stereo_apply(src, lambda x, c: lp24(x, cut, 0.12, sr))
        out *= dsp.adsr(n, sr, dur, max(0.005, p.swell), 0.4, 0.85, p.release)
        if p.chorus > 0:
            out = stereo_apply(out, lambda x, c: chorus(x, sr, 3.0, 0.5, 0.5 * p.chorus, 12.0, np.pi * c))
        return warm(out, 0.25, sr)


_STACKS = {"octaves": (0, -12, 12), "fifth": (0, 7, -12), "power": (0, 7, 12, -12), "unison": (0,)}


@register
class Braam(Instrument):
    name = "Braam"
    family = "cyberpunk"
    blurb = ("The trailer horn: stacked distorted brass saws with a flutter growl, a filter that blasts "
             "open and slowly closes, a sub under it and a tail that rolls on.")
    range = (28, 60)
    params = {
        "stack": Param("octaves", curve="choice", choices=tuple(_STACKS), help="Intervals stacked on the note."),
        "growl": Param(0.5, 0, 1, help="Flutter-tongue amplitude growl."),
        "growl_hz": Param(24.0, 8, 45, "Hz", help="Speed of the growl."),
        "grit": Param(0.5, 0, 1, help="Distortion of the brass stack."),
        "open": Param(0.12, 0.01, 1.5, "s", "log", help="How fast the filter blasts open."),
        "tail": Param(2.0, 0.2, 6, "s", "log", help="How long it rolls on after the note."),
        "sub": Param(0.6, 0, 1, help="Sub sine under the horn."),
        "impact": Param(0.5, 0, 1, help="A low boom at the start."),
    }
    presets = {
        "Braam": dict(),
        "Distant horn": dict(growl=0.25, grit=0.25, open=0.6, tail=3.5, sub=0.3, impact=0.1),
        "Tectonic": dict(stack="power", growl=0.6, grit=0.8, open=0.05, tail=3.0, sub=1.0, impact=1.0, drive=0.3),
        "Warning tone": dict(stack="fifth", growl=0.85, growl_hz=32, grit=0.6, open=0.08, tail=1.2, sub=0.4, impact=0.3),
    }

    def length(self, dur, p):
        return dur + p.tail

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        src = np.zeros((2, n))
        for st in _STACKS[p.stack]:
            f = np.full(n, f0 * 2.0 ** (st / 12.0))
            src += saws(f, sr, rng, 3, 18.0, side=0.8) * (1.0 if st == 0 else 0.7)
        src = np.tanh(src / (np.abs(src).max() + 1e-9) * (1.0 + 10.0 * p.grit))
        rate = p.growl_hz * (1.0 + 0.08 * dsp.smooth_random(n, sr, 3.0, rng))
        src *= 1.0 - p.growl * 0.7 * (0.5 + 0.5 * np.sin(TAU * dsp.phase(rate, sr)))
        openv = dsp.ramp(n, sr, 0.0, p.open) * np.exp(-np.maximum(t - p.open, 0.0) / (0.6 * dur + 0.4 * p.tail + 0.1))
        cut = 150.0 + 6000.0 * openv
        out = stereo_apply(src, lambda x, c: lp24(x, cut, 0.2, sr))
        out *= dsp.adsr(n, sr, dur, 0.02, 0.3, 0.8, p.tail)
        if p.sub > 0:
            fs = into(f0, 30.0, 60.0)
            sub = np.sin(TAU * dsp.phase(fs * 2.0 ** (0.5 * np.exp(-t / 0.08)), sr)) * dsp.adsr(n, sr, dur, 0.01, 0.4, 0.8, p.tail * 0.7)
            out += 0.8 * p.sub * dsp.rms(out) / 0.5 * sub[None, :]
        if p.impact > 0:
            m = int(0.8 * sr)
            tt = dsp.times(m, sr)
            boom = np.sin(TAU * np.cumsum(40.0 * 2.0 ** (1.5 * np.exp(-tt / 0.03))) / sr) * np.exp(-tt / 0.25)
            boom += 0.3 * dsp.lp(rng.standard_normal(m) * np.exp(-tt / 0.05), 1800.0, sr)
            b = np.zeros(n)
            dsp.place(b, np.tanh(2.0 * boom), 0.0, sr)
            out += 2.0 * p.impact * dsp.rms(out) * b[None, :]
        return warm(out, 0.3, sr)


@register
class DarkBass(Instrument):
    name = "DarkBass"
    family = "cyberpunk"
    blurb = ("Darksynth bass: a saw and a detuned pulse overdriven into a resonant 24 dB filter with a "
             "snappy envelope, a sub-octave and an optional growl. Warm by default.")
    range = (24, 60)
    params = {
        "cutoff": Param(180.0, 40, 3000, "Hz", "log", help="Resting filter cutoff."),
        "env": Param(0.6, 0, 1, help="Filter envelope amount (up to 5 octaves)."),
        "decay": Param(0.18, 0.02, 2, "s", "log", help="Filter envelope decay."),
        "res": Param(0.25, 0, 1, help="Filter resonance."),
        "grit": Param(0.45, 0, 1, help="Overdrive before the filter."),
        "sub": Param(0.5, 0, 1, help="Square sub-octave."),
        "punch": Param(0.3, 0, 1, help="A tiny pitch drop at the attack."),
        "growl": Param(0.0, 0, 1, help="A 'yow' formant on every note."),
    }
    presets = {
        "Outrun": dict(cutoff=200, env=0.55, decay=0.12, res=0.3, grit=0.35, sub=0.5),
        "Overdrive": dict(cutoff=260, env=0.5, decay=0.25, res=0.2, grit=0.9, sub=0.6, drive=0.3),
        "Chrome": dict(cutoff=420, env=0.75, decay=0.15, res=0.6, grit=0.3, sub=0.3, punch=0.5),
        "Gutter": dict(cutoff=90, env=0.45, decay=0.35, res=0.35, grit=0.6, sub=0.8, growl=0.6),
    }

    def length(self, dur, p):
        return dur + 0.2

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        f = f0 * drift(n, sr, rng, 5.0) * 2.0 ** (p.punch * np.exp(-t / 0.012))
        src = dsp.saw(f, sr) + 0.45 * dsp.square(f * 1.004, sr, 0.3) + 0.8 * p.sub * dsp.square(f / 2, sr, 0.5)
        src = np.tanh(src * (1.0 + 6.0 * p.grit))
        cut = np.minimum(p.cutoff * 2.0 ** (p.env * 5.0 * np.exp(-t / p.decay) * (0.6 + 0.4 * vel)), 15000.0)
        y = lp24(src, cut, p.res, sr)
        y = yow(y, sr, p.growl, int(dur * sr), rng)
        y *= dsp.adsr(n, sr, dur, 0.002, 0.1, 0.9, 0.05)
        return warm(y, 0.4, sr)


@register
class SyncLead(Instrument):
    name = "SyncLead"
    family = "cyberpunk"
    blurb = ("A hard-sync lead: a slave saw reset by the note, its ratio swept by an envelope and an LFO, "
             "rendered 4× oversampled. Screams down from bright into the note; can glide between notes.")
    range = (48, 96)
    params = {
        "sync": Param(3.0, 0, 8, help="How far the slave runs above the note (sync ratio minus 1)."),
        "sweep": Param(0.35, 0.02, 3, "s", "log", help="Time for the sync sweep to fall back."),
        "lfo": Param(0.15, 0, 1, help="LFO movement of the sync ratio."),
        "lfo_hz": Param(4.0, 0.1, 20, "Hz", "log", help="LFO speed."),
        "bright": Param(7000.0, 800, 14000, "Hz", "log", help="Low-pass after the oscillators."),
        "glide": Param(0.0, -24, 24, "st", help="Per note: slide into the note from this far away."),
        "glide_time": Param(0.08, 0.01, 1, "s", "log", help="Length of the glide."),
        "vibrato": Param(12.0, 0, 60, "cents", help="Delayed vibrato."),
        "release": Param(0.2, 0.02, 2, "s", "log", help="Fade after the note."),
    }
    presets = {
        "Neon chase": dict(),
        "Screamer": dict(sync=6.5, sweep=0.12, lfo=0.6, lfo_hz=11, bright=6500, vibrato=0, drive=0.3),
        "Glass sync": dict(sync=1.2, sweep=1.2, lfo=0.1, lfo_hz=0.5, bright=11000, vibrato=8, release=0.6),
        "Night drive": dict(sync=2.5, sweep=1.5, lfo=0.3, lfo_hz=0.8, bright=5000, glide=-5, glide_time=0.15, vibrato=25),
    }

    def length(self, dur, p):
        return dur + p.release + 0.02

    def voice(self, f0, vel, dur, p, rng, sr):
        os_ = 8 if p.sync > 3.5 else 4
        srs = sr * os_
        n = int(self.length(dur, p) * sr)
        m = n * os_
        t = np.arange(m) / srs
        semis = p.glide * np.exp(-t / (p.glide_time / 3.0))
        vib = p.vibrato / 1200.0 * np.sin(TAU * 5.6 * t) * np.clip((t - 0.25) / 0.4, 0.0, 1.0)
        f = f0 * 2.0 ** (semis / 12.0 + vib) * drift(m, srs, rng, 3.0)
        mph = dsp.phase(f, srs)
        ratio = 1.0 + p.sync * (0.25 + 0.75 * np.exp(-t / p.sweep)) * (1.0 + p.lfo * 0.5 * np.sin(TAU * p.lfo_hz * t))
        slave = 2.0 * (((mph % 1.0) * np.maximum(ratio, 1.0)) % 1.0) - 1.0
        body = dsp.saw(f * 2.0 ** (7.0 / 1200.0), srs)
        x = 0.7 * slave + 0.3 * body
        x = signal.resample_poly(x, 1, os_)[:n]
        y = dsp.lp(x, min(p.bright, 0.45 * sr), sr, 4)
        y *= dsp.adsr(n, sr, dur, 0.004, 0.2, 0.85, p.release)
        return warm(y, 0.2, sr)


_CHOIR_PATHS = {"ah": "a", "oo-ah": "ua", "ah-ee": "ai", "oh": "o", "ee-oo": "iu", "oo": "u"}


@register
class NeonChoir(Instrument):
    name = "NeonChoir"
    family = "cyberpunk"
    blurb = ("A synth choir for the high range: detuned singers, each with its own vibrato and drift, "
             "through five choir formants along a vowel path. No breath noise.")
    range = (48, 84)
    params = {
        "vowels": Param("oo-ah", curve="choice", choices=tuple(_CHOIR_PATHS), help="The vowel path over the note."),
        "singers": Param(4, 1, 8, curve="int", help="Singers per note."),
        "spread": Param(12.0, 0, 40, "cents", help="Tuning spread between singers."),
        "vibrato": Param(18.0, 0, 50, "cents", help="Vibrato depth."),
        "vib_rate": Param(5.0, 3, 7, "Hz", help="Average vibrato speed."),
        "shimmer": Param(0.3, 0, 1, help="An octave-up voice per singer, to fill the top."),
        "attack": Param(0.35, 0.01, 3, "s", "log", help="Fade in."),
        "release": Param(1.2, 0.05, 5, "s", "log", help="Fade out."),
    }
    presets = {
        "Neon choir": dict(),
        "Cathedral": dict(vowels="ah", singers=6, spread=8, vibrato=14, shimmer=0.1, attack=0.9, release=2.5),
        "Ghost voices": dict(vowels="oo", singers=5, spread=28, vibrato=30, vib_rate=4.2, shimmer=0.0, attack=1.2, release=3.0),
        "Ice": dict(vowels="ah-ee", singers=4, spread=10, vibrato=10, shimmer=0.8, attack=0.4, release=1.5),
    }

    def length(self, dur, p):
        return dur + p.release + 0.05

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        src = np.zeros((2, n))
        for s in range(p.singers):
            cents = rng.uniform(-p.spread, p.spread)
            vr = p.vib_rate * rng.uniform(0.85, 1.15)
            vib = p.vibrato / 1200.0 * np.sin(TAU * vr * t + rng.uniform(0, TAU)) * dsp.ramp(n, sr, 0.15, 0.6)
            f = f0 * 2.0 ** (cents / 1200.0 + vib) * drift(n, sr, rng, 4.0)
            v = dsp.saw(f, sr, rng.uniform(0, 1)) + 0.3 * dsp.square(f, sr, 0.3, rng.uniform(0, 1))
            if p.shimmer > 0:
                v += 0.5 * p.shimmer * dsp.saw(2.0 * f, sr, rng.uniform(0, 1))
            pan = rng.uniform(-0.7, 0.7)
            src[0] += v * np.sqrt((1.0 - pan) / 2.0)
            src[1] += v * np.sqrt((1.0 + pan) / 2.0)
        F = vowel_path(_CHOIR_PATHS[p.vowels], n, int(dur * sr))
        out = stereo_apply(src, lambda x, c: formants(x, F, sr) + 0.12 * dsp.lp(x, 2500.0, sr))
        out = stereo_apply(out, lambda x, c: dsp.lp(x, 9000.0, sr))
        return out * dsp.adsr(n, sr, dur, p.attack, 0.3, 1.0, p.release)


# ================================================================== hi-tech

@register
class PsyBass(Instrument):
    name = "PsyBass"
    family = "hi-tech"
    blurb = ("The rolling psytrance bass: short 16ths with a snappy 24 dB filter envelope and a click "
             "of pitch, built to sit in the gaps after the kick (see psy_roll).")
    range = (24, 52)
    params = {
        "cutoff": Param(140.0, 40, 1500, "Hz", "log", help="Resting filter cutoff."),
        "env": Param(0.55, 0, 1, help="Filter envelope amount (up to 6 octaves)."),
        "decay": Param(0.045, 0.01, 0.4, "s", "log", help="Filter envelope decay."),
        "res": Param(0.3, 0, 1, help="Filter resonance."),
        "punch": Param(0.4, 0, 1, help="Pitch click at the attack."),
        "shape": Param(0.0, 0, 1, help="0 is saw, 1 is square."),
        "sub": Param(0.3, 0, 1, help="Clean sine under it."),
    }
    presets = {
        "Rolling": dict(),
        "Hi-tech": dict(cutoff=220, env=0.75, decay=0.025, res=0.45, punch=0.6, sub=0.2),
        "Dark forest": dict(cutoff=90, env=0.5, decay=0.06, res=0.7, punch=0.3, shape=0.4, sub=0.3),
        "Fat": dict(cutoff=160, env=0.45, decay=0.07, res=0.15, punch=0.3, sub=0.6, drive=0.2),
    }

    def length(self, dur, p):
        return dur + 0.05

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        f = f0 * drift(n, sr, rng, 3.0) * 2.0 ** (p.punch * 0.5 * np.exp(-t / 0.006))
        src = (1.0 - p.shape) * dsp.saw(f, sr) + p.shape * dsp.square(f, sr, 0.5)
        cut = np.minimum(p.cutoff * 2.0 ** (p.env * 6.0 * np.exp(-t / p.decay)), 15000.0)
        y = lp24(src, cut, p.res, sr)
        y = dsp.unit(y) + 0.9 * p.sub * dsp.unit(np.sin(TAU * dsp.phase(f, sr)))
        y *= dsp.adsr(n, sr, dur, 0.001, 0.08, 0.8, 0.015)
        return warm(y, 0.3, sr)


@register
class Acid(Instrument):
    name = "Acid"
    family = "hi-tech"
    blurb = ("A 303-style acid line: saw or square into a squelching resonant filter, accents that open it "
             "further, slides between notes, and a distortion pedal after it (see acid_line).")
    range = (28, 64)
    params = {
        "wave": Param("saw", curve="choice", choices=("saw", "square"), help="Oscillator."),
        "cutoff": Param(320.0, 60, 3000, "Hz", "log", help="Resting filter cutoff."),
        "res": Param(0.7, 0, 1, help="Resonance: the squelch."),
        "env": Param(0.55, 0, 1, help="Filter envelope amount."),
        "decay": Param(0.2, 0.03, 1.5, "s", "log", help="Filter envelope decay."),
        "accent": Param(0.6, 0, 1, help="How much accented notes (velocity above 0.85) open and punch."),
        "slide": Param(0.0, -24, 24, "st", help="Per note: slide from this far away (acid_line sets it)."),
        "slide_time": Param(0.06, 0.01, 0.4, "s", "log", help="Length of a slide."),
        "grit": Param(0.4, 0, 1, help="Distortion after the filter."),
    }
    presets = {
        "Squelch": dict(),
        "Acid rain": dict(cutoff=250, res=0.45, env=0.4, decay=0.5, accent=0.4, grit=0.2),
        "Scream": dict(cutoff=500, res=0.9, env=0.8, decay=0.15, accent=0.9, grit=0.8, drive=0.3),
        "Rubber": dict(wave="square", cutoff=180, res=0.55, env=0.5, decay=0.12, accent=0.5, grit=0.3),
    }

    def length(self, dur, p):
        return dur + 0.08

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        a = p.accent if vel > 0.85 else 0.0
        semis = p.slide * np.exp(-t / (p.slide_time / 3.0))
        f = f0 * 2.0 ** (semis / 12.0) * drift(n, sr, rng, 2.0)
        src = dsp.saw(f, sr) if p.wave == "saw" else dsp.square(f, sr, 0.5)
        envf = np.exp(-t / (p.decay * (1.0 - 0.5 * a)))
        cut = np.minimum(p.cutoff * 2.0 ** ((p.env * 4.0 + 2.0 * a) * envf), 14000.0)
        y = lp24(src, cut, min(1.0, p.res + 0.15 * a), sr)
        y = np.tanh(dsp.unit(y) * (1.0 + 8.0 * p.grit))
        y *= dsp.adsr(n, sr, dur, 0.002, 0.2, 0.75 + 0.25 * a, 0.02) * (1.0 + 0.4 * a)
        return warm(dsp.lp(y, 10000.0, sr), 0.25, sr)


@register
class Twister(Instrument):
    name = "Twister"
    family = "hi-tech"
    blurb = ("Hi-tech FM squelch: an FM tone whose index and pitch are twisted by a fast LFO, through a "
             "resonant band sweeping on the same cycle. Bubbles, lasers and gargles in key.")
    range = (48, 96)
    params = {
        "index": Param(4.0, 0, 12, help="FM depth."),
        "ratio": Param(2.0, 0.5, 8, help="FM modulator ratio."),
        "lfo_hz": Param(14.0, 1, 40, "Hz", "log", help="Twist speed."),
        "lfo_depth": Param(0.7, 0, 1, help="How much the twist moves the FM depth."),
        "warble": Param(1.5, 0, 12, "st", help="How far the twist moves the pitch."),
        "sweep": Param(2.0, 0, 4, "oct", help="Range of the resonant band's sweep."),
        "res": Param(0.5, 0, 1, help="Resonance of the band."),
        "decay": Param(0.0, 0, 2, "s", help="Amplitude decay; 0 holds for the note."),
    }
    presets = {
        "Twister": dict(),
        "Bubbles": dict(index=1.5, ratio=1.0, lfo_hz=22, lfo_depth=0.4, warble=4.0, sweep=3.0, res=0.8, decay=0.15),
        "Laser rain": dict(index=4.5, ratio=3.0, lfo_hz=30, lfo_depth=0.8, warble=7.0, sweep=1.0, res=0.3, decay=0.08),
        "Alien gargle": dict(index=8.0, ratio=0.5, lfo_hz=9, lfo_depth=1.0, warble=0.5, sweep=2.5, res=0.9),
    }

    def length(self, dur, p):
        return dur + 0.04

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        ph0 = rng.uniform(0, TAU)
        tw = np.sin(TAU * p.lfo_hz * t + ph0)
        f = f0 * 2.0 ** (p.warble * tw / 12.0)
        idx = fm_guard(p.index * (1.0 + p.lfo_depth * tw), f, p.ratio, 12000.0)
        car = np.sin(TAU * dsp.phase(f, sr) + idx * np.sin(TAU * dsp.phase(f * p.ratio, sr)))
        centre = np.minimum(f0 * 2.0 * 2.0 ** (p.sweep * (0.5 + 0.5 * np.sin(TAU * p.lfo_hz * 0.5 * t + ph0))), 12000.0)
        band = dsp.filt(car, "bp", centre, 1.0 + 12.0 * p.res, sr)
        y = 0.5 * dsp.unit(car) + dsp.unit(band)
        env = dsp.window(n, sr, 0.0, dur, 0.003)
        if p.decay > 0:
            env *= np.exp(-t / p.decay)
        return dsp.lp(y * env, 10000.0, sr, 4)


# ================================================================== house

@register
class Supersaw(Instrument):
    name = "Supersaw"
    family = "house"
    blurb = ("The progressive-house and trance supersaw: up to eleven drifting saws spread wide, with a "
             "filter envelope, for anthem leads, big chords and pads.")
    range = (36, 96)
    params = {
        "voices": Param(7, 3, 11, curve="int", help="Number of saws."),
        "detune": Param(0.45, 0, 1, help="Spread of the saws (up to 60 cents)."),
        "mix": Param(0.7, 0, 1, help="Level of the outer saws against the centre one."),
        "cutoff": Param(2500.0, 200, 14000, "Hz", "log", help="Resting filter cutoff."),
        "env": Param(0.3, 0, 1, help="Filter envelope amount."),
        "attack": Param(0.01, 0.001, 3, "s", "log", help="Fade in."),
        "release": Param(0.4, 0.02, 5, "s", "log", help="Fade out."),
        "sub": Param(0.2, 0, 1, help="Sine an octave down."),
    }
    presets = {
        "Anthem": dict(),
        "Big chords": dict(voices=9, detune=0.55, mix=0.8, cutoff=1800, env=0.4, release=0.6),
        "Trance pad": dict(voices=11, detune=0.35, mix=0.9, cutoff=1200, env=0.1, attack=1.0, release=2.5, sub=0.0),
        "Festival stab": dict(voices=7, detune=0.6, mix=0.75, cutoff=900, env=0.9, attack=0.002, release=0.15),
    }

    def length(self, dur, p):
        return dur + p.release + 0.02

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        f = np.full(n, f0)
        out = saws(f, sr, rng, p.voices, 60.0 * p.detune ** 1.5, side=p.mix, spread=0.9)
        if p.sub > 0:
            out += 1.5 * p.sub * np.sin(TAU * dsp.phase(f / 2, sr))[None, :]
        envf = dsp.adsr(n, sr, dur, max(0.002, p.attack * 0.5), 0.35, 0.2, p.release)
        cut = np.minimum(p.cutoff * 2.0 ** (p.env * 4.0 * envf), 14000.0)
        out = stereo_apply(out, lambda x, c: dsp.filt(x, "lp", cut, 0.8, sr))
        out *= dsp.adsr(n, sr, dur, p.attack, 0.3, 0.9, p.release)
        return warm(out, 0.2, sr)


@register
class ProgPluck(Instrument):
    name = "ProgPluck"
    family = "house"
    blurb = ("A progressive-house pluck with its echoes built in: detuned saws snapped shut by the filter, "
             "then tempo-synced ping-pong repeats that darken as they fade.")
    range = (52, 96)
    params = {
        "decay": Param(0.18, 0.03, 1.2, "s", "log", help="How fast the pluck closes."),
        "bright": Param(5000.0, 500, 12000, "Hz", "log", help="How far the filter opens at the pluck."),
        "detune": Param(10.0, 0, 40, "cents", help="Spread of the three saws."),
        "echo": Param("3/16", curve="choice", choices=("off", "1/8", "3/16", "1/4"), help="Echo time."),
        "feedback": Param(0.5, 0, 0.85, help="How much each echo keeps."),
        "bpm": Param(128.0, 60, 200, "BPM", help="Tempo the echoes follow."),
        "damp": Param(0.7, 0, 1, help="How quickly the echoes darken."),
    }
    presets = {
        "Prog pluck": dict(),
        "Glass keys": dict(decay=0.08, bright=9000, detune=6, echo="1/8", feedback=0.35, damp=0.4),
        "Long echo": dict(decay=0.25, bright=4000, detune=12, echo="1/4", feedback=0.75, damp=0.8),
        "Stab": dict(decay=0.12, bright=3500, detune=18, echo="off", drive=0.2),
    }

    def _echoes(self, p):
        if p.echo == "off":
            return 0, 0.0
        k = int(min(10, np.ceil(np.log(0.03) / np.log(max(p.feedback, 0.05)))))
        return k, DIVISIONS[p.echo] * 60.0 / p.bpm

    def length(self, dur, p):
        k, T = self._echoes(p)
        return dur + p.decay * 4.0 + k * T + 0.05

    def voice(self, f0, vel, dur, p, rng, sr):
        L = int((dur + p.decay * 4.0) * sr)
        t = dsp.times(L, sr)
        f = np.full(L, f0)
        src = saws(f, sr, rng, 3, p.detune, side=0.8, spread=0.5)
        src += 0.4 * dsp.square(f * drift(L, sr, rng, 3.0), sr, 0.35)[None, :]
        cut = 250.0 + p.bright * np.exp(-t / p.decay) * (0.6 + 0.4 * vel)
        dry = stereo_apply(src, lambda x, c: dsp.filt(x, "lp", cut, 0.9, sr))
        dry *= np.exp(-t / (p.decay * 1.6)) * dsp.window(L, sr, 0.0, dur + p.decay * 4.0, 0.002)
        dry = warm(dry, 0.15, sr)
        k, T = self._echoes(p)
        n = int(self.length(dur, p) * sr)
        out = np.zeros((2, n))
        dsp.place(out, dry, 0.0, sr)
        mono = dry.mean(axis=0)
        for i in range(1, k + 1):
            fc = 8000.0 * (1.0 - 0.6 * p.damp) ** i + 400.0
            e = dsp.lp(mono, fc, sr) * p.feedback ** i
            side = 0.75 if i % 2 else -0.75
            dsp.place(out[0], e * np.sqrt((1.0 - side) / 2.0) * 1.2, i * T, sr)
            dsp.place(out[1], e * np.sqrt((1.0 + side) / 2.0) * 1.2, i * T, sr)
        return out


# ================================================================== dubstep

@register
class Wobble(Instrument):
    name = "Wobble"
    family = "dubstep"
    blurb = ("The dubstep wobble: drifting saws and a pulse, overdriven, through a resonant filter swung "
             "by a tempo-synced LFO. Change the rate per note to write the wobble pattern.")
    range = (24, 60)
    params = {
        "bpm": Param(140.0, 60, 200, "BPM", help="Tempo the LFO follows."),
        "rate": Param("1/8", curve="choice", choices=("1/2", "1/4", "1/8", "1/8T", "1/16", "1/16T", "1/32"),
                      help="LFO rate as a note division. Change it per note for patterns."),
        "shape": Param("sine", curve="choice", choices=("sine", "triangle", "saw-down", "saw-up", "square"),
                       help="LFO shape."),
        "low": Param(90.0, 30, 1000, "Hz", "log", help="Filter cutoff at the bottom of the wobble."),
        "high": Param(2400.0, 300, 9000, "Hz", "log", help="Filter cutoff at the top of the wobble."),
        "res": Param(0.45, 0, 1, help="Filter resonance."),
        "grit": Param(0.5, 0, 1, help="Overdrive before the filter."),
        "fm": Param(0.2, 0, 1, help="FM growl moving with the wobble."),
        "sub": Param(0.6, 0, 1, help="Clean sine sub that does not wobble."),
    }
    presets = {
        "Classic wobble": dict(),
        "Triplet womp": dict(rate="1/8T", shape="sine", low=70, high=1800, res=0.55, grit=0.6, fm=0.3),
        "Stutter": dict(rate="1/16", shape="square", low=120, high=3000, res=0.3, grit=0.5, fm=0.0),
        "Yawn": dict(rate="1/2", shape="saw-up", low=60, high=2200, res=0.65, grit=0.4, fm=0.4),
        "Riddim": dict(rate="1/4", shape="square", low=150, high=1400, res=0.2, grit=0.9, fm=0.0, sub=0.8, drive=0.3),
    }

    def length(self, dur, p):
        return dur + 0.08

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        l = lfo(t, tempo_hz(p.bpm, p.rate), p.shape)
        if p.shape == "square":
            l = dsp.lp(l, 80.0, sr)
        f = np.full(n, f0) * drift(n, sr, rng, 4.0)
        src = saws(f, sr, rng, 3, 14.0, side=0.7, spread=0.5)
        src += 0.5 * dsp.square(f, sr, 0.5)[None, :]
        if p.fm > 0:
            idx = fm_guard(4.0 * p.fm * l, f, 2.0)
            src += 0.6 * np.sin(TAU * dsp.phase(f, sr) + idx * np.sin(TAU * dsp.phase(2.0 * f, sr)))[None, :]
        src = np.tanh(src / (np.abs(src).max() + 1e-9) * (1.0 + 8.0 * p.grit))
        cut = p.low * (max(p.high, p.low) / p.low) ** l
        y = stereo_apply(src, lambda x, c: lp24(x, cut, p.res, sr))
        if p.sub > 0:
            y += 0.9 * p.sub * dsp.rms(y) / 0.7 * np.sin(TAU * dsp.phase(f, sr))[None, :]
        y *= dsp.adsr(n, sr, dur, 0.003, 0.05, 1.0, 0.04)
        return warm(y, 0.35, sr)


_GROWL_PATHS = {"yoi": "oi", "wow": "uau", "yeah": "iea", "rawr": "aou", "lfo": "oi"}


@register
class Growl(Instrument):
    name = "Growl"
    family = "dubstep"
    blurb = ("A talking bass: FM through a wavefolder, then formants moving along a vowel path, so each "
             "note says 'yoi', 'wow' or 'yeah'. The lfo path talks in time with the tempo.")
    range = (24, 60)
    params = {
        "vowels": Param("yoi", curve="choice", choices=tuple(_GROWL_PATHS), help="What each note says."),
        "index": Param(3.0, 0, 10, help="FM depth."),
        "ratio": Param(1.0, 0.5, 4, help="FM modulator ratio."),
        "fold": Param(0.5, 0, 1, help="Wavefolding: more fold is more teeth."),
        "speed": Param(0.0, 0, 2, "s", help="Time to say the vowel path; 0 uses the note length."),
        "bpm": Param(140.0, 60, 200, "BPM", help="Tempo for the lfo path."),
        "rate": Param("1/16", curve="choice", choices=("1/4", "1/8", "1/8T", "1/16", "1/32"), help="Talk rate for the lfo path."),
        "grit": Param(0.5, 0, 1, help="Distortion after the formants."),
        "sub": Param(0.5, 0, 1, help="Clean sine sub."),
    }
    presets = {
        "Yoi": dict(),
        "Wow": dict(vowels="wow", index=2.0, ratio=2.0, fold=0.35, grit=0.4),
        "Talker": dict(vowels="lfo", rate="1/16", index=3.5, fold=0.6, grit=0.6),
        "Gnarl": dict(vowels="rawr", index=7.0, ratio=1.5, fold=1.0, grit=0.9, sub=0.6, drive=0.3),
    }

    def length(self, dur, p):
        return dur + 0.06

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        f = np.full(n, f0) * drift(n, sr, rng, 4.0)
        if p.vowels == "lfo":
            mov = lfo(t, tempo_hz(p.bpm, p.rate), "triangle")
            F = np.exp(np.log(vowel_path("o", n)) * (1.0 - mov[:, None]) + np.log(vowel_path("i", n)) * mov[:, None])
        else:
            span = int((p.speed if p.speed > 0 else dur) * sr)
            F = vowel_path(_GROWL_PATHS[p.vowels], n, span)
            mov = np.minimum(np.arange(n) / max(span, 1), 1.0)
            mov = np.sin(np.pi * mov)
        idx = fm_guard(p.index * (0.6 + 0.4 * mov), f, p.ratio)
        car = np.sin(TAU * dsp.phase(f, sr) + idx * np.sin(TAU * dsp.phase(f * p.ratio, sr)))
        car += 0.5 * dsp.saw(f, sr)
        g = 1.0 + 6.0 * p.fold * (0.5 + 0.5 * mov)
        y = np.sin(0.5 * np.pi * g * car / (np.abs(car).max() + 1e-9))
        vf = formants(y, F, sr, bws=(60, 80, 100), gains=(1.0, 0.7, 0.4), k=3)
        y = 0.3 * dsp.unit(y) + 0.9 * dsp.unit(vf)
        y = np.tanh(y * (0.5 + 3.0 * p.grit))
        y = dsp.lp(y, 9000.0, sr)
        if p.sub > 0:
            fs = f if f0 < 70 else f / 2.0
            y += 0.9 * p.sub * dsp.rms(y) / 0.7 * np.sin(TAU * dsp.phase(fs, sr))
        y *= dsp.adsr(n, sr, dur, 0.004, 0.05, 1.0, 0.03)
        return warm(y, 0.3, sr)


@register
class Reese(Instrument):
    name = "Reese"
    family = "dubstep"
    blurb = ("The Reese: detuned saws beating against each other, with a moving phaser for neuro "
             "motion, a low-pass and a clean sub. Warm by default.")
    range = (24, 60)
    params = {
        "voices": Param(3, 2, 5, curve="int", help="Number of saws."),
        "detune": Param(22.0, 2, 60, "cents", help="Detune: sets how fast it beats."),
        "phaser": Param(0.5, 0, 1, help="Depth of the moving notches."),
        "phaser_hz": Param(0.3, 0.05, 8, "Hz", "log", help="Speed of the notches."),
        "cutoff": Param(1600.0, 200, 8000, "Hz", "log", help="Low-pass cutoff."),
        "grit": Param(0.4, 0, 1, help="Distortion."),
        "sub": Param(0.5, 0, 1, help="Clean sine sub."),
        "release": Param(0.15, 0.02, 2, "s", "log", help="Fade after the note."),
    }
    presets = {
        "Reese": dict(),
        "Neuro": dict(voices=4, detune=30, phaser=0.9, phaser_hz=2.5, cutoff=2600, grit=0.7, sub=0.4),
        "Deep": dict(voices=2, detune=12, phaser=0.2, phaser_hz=0.15, cutoff=700, grit=0.2, sub=0.8, release=0.4),
        "Tearout": dict(voices=5, detune=45, phaser=0.7, phaser_hz=6.0, cutoff=4000, grit=1.0, sub=0.5, drive=0.4),
    }

    def length(self, dur, p):
        return dur + p.release + 0.02

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        f = np.full(n, f0)
        src = saws(f, sr, rng, p.voices, p.detune / 2.0, side=1.0, spread=0.4)
        src = np.tanh(src / (np.abs(src).max() + 1e-9) * (1.0 + 6.0 * p.grit))
        sweep = 300.0 * 2.0 ** (3.0 * (0.5 + 0.5 * np.sin(TAU * p.phaser_hz * t)))

        def phase_and_cut(x, c):
            y = x
            for k in (1.0, 1.8, 3.1, 4.6):
                y = dsp.filt(y, "notch", np.minimum(sweep * k * (1.0 + 0.07 * c), 16000.0), 1.2, sr)
            y = (1.0 - p.phaser) * x + p.phaser * y
            return lp24(y, p.cutoff, 0.15, sr)

        out = stereo_apply(src, phase_and_cut)
        if p.sub > 0:
            fs = f if f0 < 70 else f / 2.0
            out += 0.9 * p.sub * dsp.rms(out) / 0.7 * np.sin(TAU * dsp.phase(fs, sr))[None, :]
        out *= dsp.adsr(n, sr, dur, 0.01, 0.2, 1.0, p.release)
        return warm(out, 0.35, sr)


@register
class SubBass(Instrument):
    name = "SubBass"
    family = "dubstep"
    blurb = ("A sine sub to sit under everything: warmth adds harmonics you hear on small speakers, "
             "an optional 808-style pitch drop and decay, and glides between notes.")
    range = (21, 52)
    params = {
        "warmth": Param(0.35, 0, 1, help="Harmonics from gentle saturation."),
        "drop": Param(0.0, 0, 2, "oct", help="Pitch drop onto the note at the attack (808 style)."),
        "decay": Param(0.0, 0, 4, "s", help="Amplitude decay; 0 holds for the note."),
        "glide": Param(0.0, -24, 24, "st", help="Per note: slide in from this far away."),
        "glide_time": Param(0.1, 0.01, 1, "s", "log", help="Length of the glide."),
        "release": Param(0.08, 0.01, 2, "s", "log", help="Fade after the note."),
    }
    presets = {
        "Clean sub": dict(warmth=0.1),
        "Warm sub": dict(),
        "808": dict(warmth=0.7, drop=0.6, decay=1.2, release=0.3, drive=0.2),
        "Glide sub": dict(warmth=0.4, glide=-7, glide_time=0.18),
    }

    def length(self, dur, p):
        return dur + p.release + 0.02

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        semis = p.glide * np.exp(-t / (p.glide_time / 3.0)) + 12.0 * p.drop * np.exp(-t / 0.035)
        y = np.sin(TAU * dsp.phase(f0 * 2.0 ** (semis / 12.0), sr))
        g = 1.0 + 4.0 * p.warmth
        y = (np.tanh(g * y + 0.25 * p.warmth) - np.tanh(0.25 * p.warmth)) / np.tanh(g)
        env = dsp.adsr(n, sr, dur, 0.006, 0.05, 1.0, p.release)
        if p.decay > 0:
            env *= np.exp(-t / p.decay)
        return y * env


@register
class Snare(Instrument):
    name = "Snare"
    family = "dubstep"
    blurb = ("A big snare or clap: a tuned body with a pitch drop, a band-passed (not hissy) rattle, an "
             "optional multi-burst clap and a short room tail. For half-time drops and hard techno.")
    range = (48, 72)
    pitched = True
    params = {
        "body": Param(0.6, 0, 1, help="Level of the tuned drum body."),
        "tone": Param(2600.0, 1000, 6000, "Hz", "log", help="Centre of the rattle."),
        "snap": Param(0.12, 0.02, 0.6, "s", "log", help="Decay of the rattle."),
        "clap": Param(0.0, 0, 1, help="Clap bursts before the hit."),
        "crack": Param(0.5, 0, 1, help="Transient crack."),
        "tail": Param(0.35, 0.05, 2, "s", "log", help="Room tail."),
    }
    presets = {
        "Dubstep crack": dict(body=0.6, tone=2300, snap=0.18, clap=0.3, crack=0.8, tail=0.6, drive=0.3),
        "Cyber snare": dict(body=0.8, tone=3000, snap=0.1, clap=0.0, crack=0.6, tail=0.25),
        "Clap": dict(body=0.15, tone=1600, snap=0.15, clap=1.0, crack=0.3, tail=0.4),
        "Tight": dict(body=0.5, tone=3400, snap=0.06, clap=0.0, crack=0.4, tail=0.1),
    }

    def length(self, dur, p):
        return p.tail + 0.35

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        fb = into(f0, 140.0, 300.0)
        bend = 2.0 ** (0.6 * np.exp(-t / 0.015))
        body = (np.sin(TAU * dsp.phase(fb * bend, sr)) + 0.5 * np.sin(TAU * dsp.phase(fb * 1.6 * bend, sr))) * np.exp(-t / 0.09)
        noise = rng.standard_normal(n)
        rattle = dsp.lp(dsp.filt(noise, "bp", p.tone, 0.8, sr), 7500.0, sr, 4) * np.exp(-t / p.snap)
        y = p.body * dsp.unit(body) * 0.9 + dsp.unit(rattle)
        if p.clap > 0:
            burst = dsp.lp(dsp.filt(noise, "bp", 1300.0, 1.2, sr), 6000.0, sr) * np.exp(-t / 0.008)
            burst = dsp.unit(burst)
            for k, at in enumerate((0.0, 0.009, 0.019)):
                dsp.place(y, 1.2 * p.clap * burst * (0.7 + 0.1 * k), at, sr)
        if p.crack > 0:
            cr = dsp.lp(dsp.hp(noise * np.exp(-t / 0.002), 1500.0, sr), 7000.0, sr, 4)
            y += 2.0 * p.crack * dsp.unit(cr) * np.exp(-t / 0.004)
        room = dsp.lp(rng.standard_normal(n), 5000.0, sr, 4) * np.exp(-t / (p.tail / 3.0)) * dsp.ramp(n, sr, 0.005, 0.02)
        room = dsp.filt(room, "bp", p.tone * 0.7, 0.7, sr)
        return y + 0.5 * dsp.unit(room) * dsp.rms(y) / 0.6
