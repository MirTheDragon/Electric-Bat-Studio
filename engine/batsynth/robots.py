"""batsynth.robots: mechanical, sci-fi and robotic instruments.

Fifteen instruments, all on the standard in core.py. Every one is playable:
the note sets a pitch the sound lands on, settles into or is built from,
so a machine noise can carry a melody, a bass line or a chord.

Families
    motion      Servo, Hydraulic, Reconfigure, Brownout
    voice       Chatterbox, Robovox
    data        Modem, Mainframe
    energy      Blaster, Materialize, Tesla
    machine     Turbine, Klaxon
    percussion  Clockwork, MechStomp
"""
from __future__ import annotations

import numpy as np
from scipy import signal

from . import dsp
from .core import Instrument, Param, register

TAU = dsp.TAU

SCALES = {
    "pentatonic": (0, 3, 5, 7, 10),
    "minor": (0, 2, 3, 5, 7, 8, 10),
    "major": (0, 2, 4, 5, 7, 9, 11),
    "phrygian": (0, 1, 3, 5, 7, 8, 10),
    "chromatic": tuple(range(12)),
}
SCALE_CHOICES = ("pentatonic", "minor", "major", "phrygian", "chromatic", "free")


def snap(semis, scale: str):
    """Snap semitone offsets from the note onto a scale built on the note."""
    s = np.asarray(semis, dtype=float)
    if scale == "free":
        return s
    deg = np.array(list(SCALES[scale]) + [12], dtype=float)
    octv = np.floor(s / 12.0)
    pc = s - 12.0 * octv
    idx = np.abs(pc[..., None] - deg).argmin(-1)
    return 12.0 * octv + deg[idx]


def into(f: float, lo: float, hi: float) -> float:
    """Move a frequency by octaves into [lo, hi)."""
    while f < lo:
        f *= 2.0
    while f >= hi:
        f /= 2.0
    return f


# ------------------------------------------------------------------ shared parts

def clack(sr, f, rng, metal=0.6, length=0.07):
    """A small mechanical impact: an impulse click plus a few metal modes."""
    n = max(8, int(length * sr))
    t = dsp.times(n, sr)
    ratios = np.array([1.0, 1.47, 2.09, 2.56, 3.31]) * (1.0 + rng.normal(0.0, 0.015, 5))
    taus = length * np.array([0.3, 0.22, 0.15, 0.1, 0.07])
    amps = np.array([1.0, 0.7, 0.55, 0.4, 0.3])
    ring = np.zeros(n)
    for r, tau, a in zip(ratios, taus, amps):
        if f * r < 0.45 * sr:
            ring += a * np.exp(-t / tau) * np.sin(TAU * f * r * t + rng.uniform(0, TAU))
    click = dsp.hp(rng.standard_normal(n) * np.exp(-t / 0.0012), 1200.0, sr)
    ring /= np.abs(ring).max() + 1e-9
    click /= np.abs(click).max() + 1e-9
    return metal * ring + (1.0 - 0.6 * metal) * click


_HARM = np.arange(1, 9, dtype=float)
_BAR = np.array([1.0, 2.756, 5.404, 8.933, 13.344, 18.64, 24.81, 31.87])


def clang(sr, f, rng, inharm=0.5, length=1.0, bright=0.5):
    """A tuned metal strike. inharm 0 is a harmonic bell, 1 is a free bar."""
    n = int(length * sr)
    t = dsp.times(n, sr)
    ratios = _HARM ** (1.0 - inharm) * _BAR ** inharm
    amps = 1.0 / _HARM ** (1.4 - bright)
    taus = length / 3.0 / (1.0 + 0.7 * (_HARM - 1.0))
    y = np.zeros(n)
    for r, a, tau in zip(ratios, amps, taus):
        fr = f * r * (1.0 + rng.normal(0.0, 0.002))
        if fr < 0.45 * sr:
            y += a * np.exp(-t / tau) * np.sin(TAU * fr * t + rng.uniform(0, TAU))
    y /= np.abs(y).max() + 1e-9
    strike = dsp.hp(rng.standard_normal(n) * np.exp(-t / 0.004), 800.0, sr)
    return y + 0.25 * strike / (np.abs(strike).max() + 1e-9)


def thunk(sr, f, rng, length=0.3, drop=1.5):
    """A low impact: a sine falling onto f, saturated."""
    n = int(length * sr)
    t = dsp.times(n, sr)
    fc = f * 2.0 ** (drop * np.exp(-t / 0.025))
    y = np.sin(TAU * np.cumsum(fc) / sr) * np.exp(-t / (length / 3.0))
    return np.tanh(2.0 * y)


def motor(f, sr, rng, chatter=0.4, brush=0.3, housing=2400.0):
    """A small electric motor on a speed (frequency) curve."""
    n = len(f)
    core = 0.6 * dsp.saw(f, sr) + 0.4 * dsp.square(2.0 * f, sr, 0.3)
    grind = (0.5 + 0.5 * np.sin(TAU * dsp.phase(0.25 * f, sr))) ** 3
    core = core * ((1.0 - 0.75 * chatter) + 1.5 * chatter * grind)
    sparks = (0.5 + 0.5 * np.sin(TAU * dsp.phase(2.0 * f, sr))) ** 6
    bn = dsp.filt(rng.standard_normal(n) * sparks, "bp", min(housing * 1.6, 0.4 * sr), 0.9, sr)
    y = dsp.unit(core) + 1.2 * brush * dsp.unit(bn)
    y = dsp.filt(y, "peak", housing, 3.0, sr, gain_db=10.0)
    y = dsp.hp(y, 120.0, sr)
    return dsp.lp(y, 9000.0, sr)


def noise_burst(sr, rng, length, f_lo=1500.0, tau=None):
    n = max(8, int(length * sr))
    t = dsp.times(n, sr)
    y = rng.standard_normal(n) * np.exp(-t / (tau or length / 4.0))
    return dsp.hp(y, f_lo, sr)


# ================================================================== motion

@register
class Servo(Instrument):
    name = "Servo"
    family = "motion"
    blurb = ("A servo motor moving into position: the whine rises with its speed, "
             "the gears chatter, and it stops with a clack. The whine cruises at the note.")
    range = (48, 96)
    params = {
        "sweep": Param(1.5, 0, 4, "oct", help="How far below the note the whine starts and ends."),
        "accel": Param(0.12, 0.01, 1.0, "s", "log", help="Time to reach full speed."),
        "chatter": Param(0.4, 0, 1, help="Gear grind: a pulsing quarter-speed rattle."),
        "brush": Param(0.25, 0, 1, help="Brush sparks inside the motor, as noise."),
        "strain": Param(0.2, 0, 1, help="Pitch sag and wobble under load."),
        "housing": Param(2400.0, 400, 8000, "Hz", "log", help="Resonance of the casing."),
        "clack": Param(0.6, 0, 1, help="The gear stop at the end of travel."),
        "bounce": Param(0.0, 0, 1, help="A small move back after the stop."),
    }
    presets = {
        "Micro servo": dict(sweep=1.8, accel=0.05, chatter=0.5, brush=0.2, housing=3200, clack=0.7),
        "Heavy arm": dict(sweep=1.2, accel=0.3, chatter=0.7, brush=0.2, strain=0.6, housing=900,
                          clack=0.8, drive=0.3),
        "Gimbal": dict(sweep=0.6, accel=0.4, chatter=0.1, brush=0.05, strain=0.05, housing=1800, clack=0.1),
        "Twitchy joint": dict(sweep=2.4, accel=0.02, chatter=0.6, brush=0.3, strain=0.3, clack=0.9, bounce=0.7),
    }

    def length(self, dur, p):
        return dur + 0.25 + 0.45 * p.bounce

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        travel = max(dur, 0.04)
        acc = min(p.accel, travel / 2.5)
        speed = dsp.ramp(n, sr, 0.0, acc) * (1.0 - dsp.ramp(n, sr, travel - acc, acc))
        back_at, back_len = travel + 0.05, 0.12 + 0.25 * p.bounce
        if p.bounce > 0:
            b = back_len / 3.0
            speed = speed + 0.6 * p.bounce * dsp.ramp(n, sr, back_at, b) * (
                1.0 - dsp.ramp(n, sr, back_at + back_len - b, b))
        speed = np.clip(speed, 0.0, 1.0)
        wob = dsp.smooth_random(n, sr, 7.0, rng)
        f = f0 * 2.0 ** (-p.sweep * (1.0 - speed)) * (1.0 - p.strain * 0.06 * (1.0 + wob) * speed)
        y = motor(f, sr, rng, p.chatter, p.brush, p.housing) * speed ** 0.6
        if p.clack > 0:
            dsp.place(y, 3.0 * p.clack * clack(sr, p.housing * 1.3, rng, 0.7, 0.09), travel - 0.004, sr)
            if p.bounce > 0:
                dsp.place(y, 1.6 * p.clack * clack(sr, p.housing * 1.5, rng, 0.6, 0.06),
                          back_at + back_len - 0.004, sr)
        return y


@register
class Hydraulic(Instrument):
    name = "Hydraulic"
    family = "motion"
    blurb = ("A hydraulic piston: valve click, pressurised flow tuned to the note's harmonics, "
             "a thunk at the end stop and a hiss as the pressure lets go.")
    range = (36, 84)
    params = {
        "tone": Param(0.6, 0, 1, help="How pitched the flow is: 0 is air, 1 is a clear note."),
        "sweep": Param(0.7, 0, 1, help="How far the flow's bright band travels during the stroke."),
        "rise": Param(1.0, -1, 1, help="Stroke direction: 1 extends (rises), -1 retracts (falls)."),
        "release": Param(0.5, 0, 1, help="The pressure release after the stroke."),
        "thunk": Param(0.6, 0, 1, help="The piston hitting its end stop."),
        "valve": Param(0.5, 0, 1, help="Valve clicks at the start and end."),
    }
    presets = {
        "Piston": dict(),
        "Airlock": dict(tone=0.25, sweep=0.4, rise=-1, release=1.0, thunk=0.8, valve=0.8),
        "Mech knee": dict(tone=0.5, sweep=0.9, release=0.3, thunk=1.0, valve=0.6, drive=0.2),
        "Pneumatic stab": dict(tone=0.9, sweep=0.5, release=0.15, thunk=0.2, valve=0.3),
    }

    def length(self, dur, p):
        return dur + 0.15 + 0.7 * p.release

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        stroke = max(dur, 0.06)
        noise = rng.standard_normal(n)
        ks = np.arange(1, 9)
        bank = dsp.resonate(noise, f0 * ks, 8.0 + 90.0 * p.tone ** 1.5, 1.0 / ks ** 0.6, sr)
        prog = np.clip(t / stroke, 0.0, 1.0)
        pos = 0.5 + p.rise * (prog - 0.5)
        centre = 450.0 * 2.0 ** (p.sweep * 4.0 * pos) * (f0 / 220.0) ** 0.3
        air = dsp.filt(noise, "bp", centre, 1.2, sr)
        tonal = 0.5 * dsp.unit(bank) + dsp.unit(dsp.filt(bank, "bp", centre, 0.8, sr))
        flow = (1.0 - p.tone) * dsp.unit(air) + p.tone * dsp.unit(tonal)
        env = dsp.ramp(n, sr, 0.0, 0.02) * (1.0 - dsp.ramp(n, sr, stroke - 0.03, 0.03)) * (0.75 + 0.25 * prog)
        y = flow * env
        # pressure release
        rs = stroke + 0.06
        rel_len = 0.1 + 0.6 * p.release
        rel_prog = np.clip((t - rs) / rel_len, 0.0, 1.0)
        rel = dsp.filt(dsp.hp(noise, 900.0, sr), "bp", 4200.0 * 2.0 ** (-1.6 * rel_prog), 1.1, sr)
        rel_env = dsp.ramp(n, sr, rs, 0.005) * dsp.decay(n, sr, 0.06 + 0.3 * p.release, rs)
        y += 1.6 * p.release * dsp.unit(rel) * rel_env
        if p.thunk > 0:
            dsp.place(y, 4.0 * p.thunk * thunk(sr, into(f0, 40.0, 90.0), rng, 0.35, 1.0), stroke, sr)
            dsp.place(y, 2.0 * p.thunk * clack(sr, into(f0 * 4, 700, 1400), rng, 0.8, 0.12), stroke, sr)
        if p.valve > 0:
            dsp.place(y, 2.5 * p.valve * clack(sr, 2600.0, rng, 0.4, 0.04), 0.0, sr)
            dsp.place(y, 2.0 * p.valve * clack(sr, 3100.0, rng, 0.4, 0.04), stroke + 0.04, sr)
        return dsp.lp(y, 9000.0, sr)


@register
class Reconfigure(Instrument):
    name = "Reconfigure"
    family = "motion"
    blurb = ("A machine changing shape: a cascade of servo moves climbing a pentatonic arpeggio, "
             "ratchets and latches, ending in a clang tuned to the note.")
    range = (45, 84)
    params = {
        "parts": Param(6, 2, 16, curve="int", help="Number of moving parts in the sequence."),
        "accel": Param(0.5, 0, 1, help="How much the moves speed up towards the end."),
        "climb": Param(12.0, 0, 24, "st", help="How far below the note the servo arpeggio starts."),
        "whine": Param(0.7, 0, 1, help="Servo whines."),
        "ratchet": Param(0.6, 0, 1, help="Ratchet clicks inside each move."),
        "clank": Param(0.7, 0, 1, help="The final tuned clang."),
        "metal": Param(0.5, 0, 1, help="0 is a harmonic bell, 1 is inharmonic metal."),
    }
    presets = {
        "Unfold": dict(),
        "Armor up": dict(parts=10, accel=0.8, climb=19, whine=0.6, ratchet=0.9, clank=1.0, metal=0.7, drive=0.25),
        "Lockdown": dict(parts=4, accel=0.1, climb=7, whine=0.4, ratchet=1.0, clank=0.9, metal=0.85),
        "Tiny gadget": dict(parts=8, accel=0.6, climb=12, whine=0.9, ratchet=0.4, clank=0.4, metal=0.2),
    }

    def length(self, dur, p):
        return dur + 0.2 + 1.2 * p.clank

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        y = np.zeros(n)
        k = p.parts
        r = 1.0 - 0.75 * p.accel
        gaps = r ** np.arange(k)
        gaps = gaps / gaps.sum() * dur * 0.92
        starts = np.concatenate([[0.0], np.cumsum(gaps)[:-1]])
        offs = snap(np.linspace(-p.climb, 0.0, k + 1)[:-1] + rng.normal(0, 0.6, k), "pentatonic")
        for i in range(k):
            L = min(gaps[i] * 0.95, 0.35)
            fi = into(f0 * 2.0 ** (offs[i] / 12.0), 180.0, 2400.0)
            m = max(16, int(L * sr))
            prog = np.arange(m) / m
            fcur = fi * 2.0 ** (-0.8 * (1.0 - prog) ** 2)
            wh = motor(fcur, sr, rng, 0.5, 0.25, 2600.0) * np.sin(np.pi * prog) ** 0.5
            dsp.place(y, p.whine * wh, starts[i], sr)
            for c in range(int(rng.integers(2, 6))):
                dsp.place(y, 2.0 * p.ratchet * clack(sr, rng.uniform(2500, 4500), rng, 0.5, 0.035),
                          starts[i] + L * 0.55 + c / 55.0, sr)
            dsp.place(y, 2.5 * clack(sr, rng.uniform(900, 1600), rng, 0.8, 0.08), starts[i] + L, sr)
        if p.clank > 0:
            cl = clang(sr, into(f0, 220.0, 880.0), rng, p.metal, 0.5 + 1.0 * p.clank, 0.6)
            dsp.place(y, 4.0 * p.clank * cl, dur, sr)
            dsp.place(y, 3.0 * p.clank * thunk(sr, into(f0, 40.0, 100.0), rng, 0.45, 1.5), dur, sr)
        return y


@register
class Brownout(Instrument):
    name = "Brownout"
    family = "motion"
    blurb = ("A machine losing power: its hum slows and darkens, the arcs crackle and a relay "
             "drops out. Also runs forwards as a boot-up, or both as a reboot.")
    range = (36, 84)
    params = {
        "direction": Param("down", curve="choice", choices=("down", "up", "reboot"),
                           help="Power down, boot up, or down and back up."),
        "fall": Param(2.5, 0.2, 5, "oct", help="Octaves the machine falls (or rises)."),
        "time": Param(0.0, 0, 8, "s", help="Length of the fall; 0 follows the note."),
        "curve": Param(0.5, 0, 1, help="0 slows evenly; 1 holds on, then dies suddenly."),
        "crackle": Param(0.4, 0, 1, help="Arcing pops as the power fails."),
        "clunk": Param(0.6, 0, 1, help="The relay at the end (or start)."),
        "body": Param(0.5, 0, 1, help="0 is a thin hum, 1 is a thick stack of oscillators."),
    }
    presets = {
        "Power down": dict(),
        "Boot up": dict(direction="up", fall=2.0, curve=0.3, crackle=0.2, clunk=0.7),
        "Reboot": dict(direction="reboot", fall=3.0, curve=0.6, crackle=0.5, clunk=0.8),
        "Dying battery": dict(fall=1.2, curve=0.9, crackle=0.8, clunk=0.3, body=0.2, crush=0.18),
    }

    def length(self, dur, p):
        T = p.time if p.time > 0 else dur
        return max(T, dur) + 0.4

    def voice(self, f0, vel, dur, p, rng, sr):
        T = p.time if p.time > 0 else dur
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        e = 1.0 + 4.0 * p.curve
        clunks = []
        if p.direction == "down":
            prog = np.clip(t / T, 0.0, 1.0)
            s = np.where(t < T, 1.0 - prog ** e, 0.0)
            clunks.append(T)
        elif p.direction == "up":
            hold = max(T, dur)
            prog = np.clip(t / T, 0.0, 1.0)
            s = (1.0 - (1.0 - prog) ** e) * (1.0 - dsp.ramp(n, sr, hold, 0.06))
            s = np.where(t < 0.004, 0.0, s)
            clunks.append(0.0)
        else:
            half, gap = T / 2.0, 0.12
            p1 = np.clip(t / half, 0.0, 1.0)
            p2 = np.clip((t - half - gap) / half, 0.0, 1.0)
            down = np.where(t < half, 1.0 - p1 ** e, 0.0)
            up = np.where(t >= half + gap, 1.0 - (1.0 - p2) ** e, 0.0) * (1.0 - dsp.ramp(n, sr, T + gap, 0.06))
            s = down + up
            clunks += [half, half + gap]
        f = f0 * 2.0 ** (-p.fall * (1.0 - s))
        src = dsp.saw(f, sr) + p.body * (0.5 * dsp.saw(f * 1.5 * 1.003, sr) + 0.6 * dsp.square(f * 0.5, sr, 0.5))
        cut = 150.0 + 7000.0 * s ** 1.5
        src = dsp.filt(dsp.filt(src, "lp", cut, 0.6, sr), "lp", cut, 0.9, sr)
        amp = np.sqrt(np.clip(s, 0.0, 1.0)) * dsp.ramp(n, sr, 0.0, 0.004)
        y = dsp.unit(src) * amp
        if p.crackle > 0:
            density = 40.0 * p.crackle * (0.15 + (1.0 - s)) * (s > 0.02)
            imp = (rng.random(n) < density / sr) * rng.uniform(0.3, 1.0, n)
            kern = dsp.lp(noise_burst(sr, rng, 0.006, 1200.0, 0.0015), 7000.0, sr)
            pops = signal.fftconvolve(imp, kern)[:n]
            y += 4.0 * p.crackle * pops
        if p.clunk > 0:
            for at in clunks:
                dsp.place(y, 3.0 * p.clunk * clack(sr, 1100.0, rng, 0.6, 0.08), at, sr)
                dsp.place(y, 2.5 * p.clunk * thunk(sr, into(f0, 45.0, 90.0), rng, 0.2, 1.0), at, sr)
        return y


# ================================================================== voice

@register
class Chatterbox(Instrument):
    name = "Chatterbox"
    family = "voice"
    blurb = ("A droid talking in whistles and buzzes. Syllables glide between notes of a scale "
             "built on the note, and the phrase always ends on the note.")
    range = (60, 96)
    params = {
        "rate": Param(9.0, 2, 30, "syll/s", "log", help="Syllables per second."),
        "range": Param(9.0, 0, 24, "st", help="How far the chirps roam around the note."),
        "mood": Param(0.3, -1, 1, help="-1 is sad (falling, slow), +1 is excited (rising, fast)."),
        "warble": Param(0.4, 0, 1, help="Fast vibrato inside syllables."),
        "buzz": Param(0.2, 0, 1, help="0 is a pure whistle, 1 is a buzzy square."),
        "legato": Param(0.4, 0, 1, help="0 leaves gaps between syllables, 1 slides through."),
        "scale": Param("pentatonic", curve="choice", choices=SCALE_CHOICES,
                       help="Chirp targets snap to this scale on the note."),
    }
    presets = {
        "Curious": dict(),
        "Excited": dict(rate=16, range=12, mood=0.9, warble=0.7, buzz=0.15, legato=0.3),
        "Sad beeps": dict(rate=4, range=7, mood=-0.8, warble=0.15, buzz=0.05, legato=0.7, scale="minor"),
        "Arguing": dict(rate=20, range=14, mood=0.2, warble=0.5, buzz=0.7, legato=0.15, scale="chromatic"),
        "Lullaby": dict(rate=3, range=5, mood=-0.2, warble=0.1, buzz=0.0, legato=1.0, scale="major"),
    }

    def length(self, dur, p):
        return dur + 0.12

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        rate = p.rate * 2.0 ** (0.4 * p.mood)
        k = max(1, int(round(rate * dur)))
        w = rng.uniform(0.5, 1.6, k)
        edges = np.concatenate([[0.0], np.cumsum(w) / w.sum() * dur])
        bias = p.mood * p.range * 0.3
        targets = snap(rng.uniform(-p.range, p.range, k) * 0.8 + bias, p.scale)
        targets[-1] = 0.0
        starts = np.roll(targets, 1)
        starts[0] = targets[0] + rng.uniform(-3.0, 3.0)
        semis = np.zeros(n)
        amp = np.zeros(n)
        index = np.zeros(n)
        ratio = np.ones(n)
        for i in range(k):
            a, b = int(edges[i] * sr), min(n, int(edges[i + 1] * sr))
            L = b - a
            if L < 16:
                continue
            on = max(8, int(L * (1.0 - (1.0 - p.legato) * 0.45)))
            x = np.linspace(0.0, 1.0, on)
            shape = rng.choice([0.3, 1.0, 3.0])
            cont = starts[i] + (targets[i] - starts[i]) * x ** shape
            flick = p.mood * rng.uniform(0.0, 4.0) * x ** 4
            vib = p.warble * 1.2 * rng.uniform(0.3, 1.0) * np.sin(TAU * rng.uniform(12, 26) * np.arange(on) / sr)
            semis[a:a + on] = cont + flick + vib
            semis[a + on:b] = semis[a + on - 1]
            amp[a:a + on] = np.minimum(1.0, x / 0.06) * np.minimum(1.0, (1.0 - x) / 0.12) * rng.uniform(0.7, 1.0)
            index[a:b] = rng.uniform(0.0, 1.0 + 3.0 * p.buzz)
            ratio[a:b] = rng.choice([0.5, 1.0, 2.0, 3.0])
        end = min(n - 1, int(edges[-1] * sr))
        semis[end:] = semis[max(0, end - 1)]
        semis = dsp.lp(semis, 80.0 if p.legato > 0.5 else 200.0, sr)
        index = dsp.lp(index, 40.0, sr)
        f = f0 * 2.0 ** (semis / 12.0)
        car = np.sin(TAU * dsp.phase(f, sr) + index * np.sin(TAU * dsp.phase(f * ratio, sr)))
        bz = dsp.lp(dsp.square(f, sr, 0.3), 3500.0, sr)
        return amp * ((1.0 - p.buzz) * car + p.buzz * 0.8 * bz)


_VOWELS = {"a": (730, 1090, 2440), "e": (530, 1840, 2480), "i": (270, 2290, 3010),
           "o": (570, 840, 2410), "u": (300, 870, 2240)}


@register
class Robovox(Instrument):
    name = "Robovox"
    family = "voice"
    blurb = ("A wordless speech chip: a buzz through stepped vowel formants at a low frame rate, "
             "with noise consonants, optional ring modulation and a crude DAC.")
    range = (40, 76)
    params = {
        "frames": Param(18.0, 4, 60, "frames/s", "log", help="Speech frame rate. Low is chunky, high is smoother."),
        "vowels": Param("random", curve="choice", choices=("random", "aeiou", "wah", "monotone"),
                        help="Which vowels it says."),
        "inflection": Param(3.0, 0, 12, "st", help="How far each frame's pitch steps around the note."),
        "consonants": Param(0.35, 0, 1, help="Noise consonants between vowels."),
        "ring": Param(0.0, 0, 1, help="Ring modulation: the metallic robot-voice warble."),
        "ring_hz": Param(38.0, 10, 400, "Hz", "log", help="Ring modulator frequency."),
        "bits": Param(8.0, 3, 16, "bits", help="The speech chip's resolution."),
        "chip_khz": Param(10.0, 4, 48, "kHz", "log", help="The speech chip's sample rate."),
    }
    presets = {
        "Speech chip": dict(),
        "Ring-mod overlord": dict(frames=14, inflection=1, consonants=0.5, ring=0.9, ring_hz=32, bits=10, chip_khz=16, drive=0.3),
        "Chip singer": dict(frames=10, vowels="aeiou", inflection=0, consonants=0.1, bits=10, chip_khz=12),
        "Broken unit": dict(frames=7, inflection=9, consonants=0.7, ring=0.3, ring_hz=90, bits=4, chip_khz=6),
        "Wah bot": dict(frames=24, vowels="wah", inflection=2, consonants=0.0, bits=12, chip_khz=22),
    }

    def length(self, dur, p):
        return dur + 0.08

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        nf = max(1, int(np.ceil(dur * p.frames)))
        if p.vowels == "random":
            seq, cur = [], rng.choice(list("aeiou"))
            while len(seq) < nf:
                seq += [cur] * int(rng.integers(1, 5))
                cur = rng.choice([v for v in "aeiou" if v != cur])
            seq = seq[:nf]
        elif p.vowels == "aeiou":
            seq = [("aeiou")[(i // 2) % 5] for i in range(nf)]
        elif p.vowels == "wah":
            pat = "uoaaao"
            seq = [pat[i % len(pat)] for i in range(nf)]
        else:
            seq = ["a"] * nf
        F = np.array([_VOWELS[v] for v in seq], dtype=float)
        semis = snap(rng.integers(-int(p.inflection), int(p.inflection) + 1, nf), "pentatonic")
        if nf > 2:
            semis[-2:] -= 2.0
        unv = np.zeros(nf, dtype=bool)
        for i in range(1, nf):
            if seq[i] != seq[i - 1] and rng.random() < p.consonants:
                unv[i] = True
        lvl = rng.uniform(0.75, 1.0, nf)
        idx = np.minimum((t * p.frames).astype(int), nf - 1)
        f = f0 * 2.0 ** (semis[idx] / 12.0)
        frame_pos = t * p.frames - np.floor(t * p.frames)
        umask = (unv[idx] & (frame_pos < 0.5)).astype(float)
        vmask = 1.0 - umask
        src = dsp.saw(f, sr) + 0.05 * rng.standard_normal(n)
        y = np.zeros(n)
        for k, (bw, g) in enumerate(zip((90.0, 110.0, 170.0), (1.0, 0.6, 0.35))):
            fk = F[idx, k]
            y += g * dsp.filt(src, "bp", fk, fk / bw, sr)
        y = dsp.unit(y) * vmask + 0.8 * dsp.unit(dsp.hp(rng.standard_normal(n), 3000.0, sr)) * umask
        y *= lvl[idx] * dsp.window(n, sr, 0.0, dur, 0.004)
        if p.ring > 0:
            y *= (1.0 - p.ring) + p.ring * np.sin(TAU * p.ring_hz * t)
        hold = max(1, int(round(sr / (p.chip_khz * 1000.0))))
        y = dsp.crush(y / (np.abs(y).max() + 1e-9), p.bits, hold)
        return dsp.lp(y, min(0.45 * sr, p.chip_khz * 500.0), sr)


# ================================================================== data

_HANDSHAKE = (0, 7, 12, 15)


@register
class Modem(Instrument):
    name = "Modem"
    family = "data"
    blurb = ("Data as sound: frequency-shift keying between the note and a second tone, in packets, "
             "over an optional telephone line. Can open with the album's handshake.")
    range = (55, 90)
    params = {
        "baud": Param(60.0, 4, 1200, "bit/s", "log", help="Bits per second. Low is musical beeping, high is screech."),
        "interval": Param(7, 1, 12, "st", curve="int", help="Interval between the 0 and 1 tones."),
        "packet": Param(0.5, 0.05, 4, "s", "log", help="Length of each burst of data."),
        "gap": Param(0.08, 0, 1, "s", help="Silence between bursts."),
        "scramble": Param(0.2, 0, 1, help="Scrambled noise mixed into the data."),
        "line": Param(0.5, 0, 1, help="Telephone line: 300 Hz to 3.4 kHz with a little distortion."),
        "wave": Param(0.2, 0, 1, help="0 is sine tones, 1 is square tones."),
        "greeting": Param("off", curve="choice", choices=("off", "on"),
                          help="Open with the handshake: root, fifth, octave, minor third."),
    }
    presets = {
        "Telemetry": dict(),
        "Dial-up": dict(baud=600, interval=5, packet=1.5, gap=0.0, scramble=0.6, line=1.0, wave=0.1),
        "Packet burst": dict(baud=240, interval=12, packet=0.12, gap=0.06, scramble=0.1, line=0.2, wave=0.6),
        "Handshake": dict(baud=30, interval=7, packet=0.4, gap=0.1, scramble=0.0, line=0.3, greeting="on"),
    }

    def length(self, dur, p):
        return dur + 0.08

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        semis = np.zeros(n)
        gate = np.zeros(n)
        pos = 0.0
        if p.greeting == "on":
            for st in _HANDSHAKE:
                a, b = int(pos * sr), min(n, int((pos + 0.11) * sr))
                semis[a:b] = st
                gate += dsp.window(n, sr, pos, 0.1, 0.004)
                pos += 0.12
            pos += 0.04
        while pos < dur - 0.01:
            plen = min(p.packet, dur - pos)
            a = int(pos * sr)
            m = min(n - a, int(plen * sr))
            nb = max(1, int(np.ceil(plen * p.baud)))
            bits = rng.integers(0, 2, nb)
            bi = np.minimum((np.arange(m) * p.baud / sr).astype(int), nb - 1)
            semis[a:a + m] = bits[bi] * p.interval
            gate += dsp.window(n, sr, pos, plen, 0.003)
            pos += plen + p.gap
        semis = dsp.lp(semis, min(p.baud * 2.0, 4000.0), sr)
        f = f0 * 2.0 ** (semis / 12.0)
        tone = (1.0 - p.wave) * dsp.sine(f, sr) + p.wave * 0.7 * dsp.square(f, sr)
        y = dsp.unit(tone)
        if p.scramble > 0:
            scr = dsp.filt(rng.standard_normal(n), "bp", f0 * 2.0 ** (p.interval / 24.0), 1.2, sr)
            chop = dsp.lp((dsp.smooth_random(n, sr, max(2.0, p.baud / 4.0), rng) > 0.2).astype(float), 200.0, sr)
            y = y + 1.5 * p.scramble * dsp.unit(scr) * chop
        y = y * np.clip(gate, 0.0, 1.0)
        if p.line > 0:
            yl = dsp.lp(dsp.hp(y, 300.0, sr, 4), 3400.0, sr, 4)
            yl = dsp.softclip(yl / (np.abs(yl).max() + 1e-9), 2.0)
            y = (1.0 - p.line) * y + p.line * yl * (dsp.rms(y) / dsp.rms(yl))
        return y


@register
class Mainframe(Instrument):
    name = "Mainframe"
    family = "data"
    blurb = ("A computer thinking out loud: stepped pulse-wave bleeps on a scale built on the note, "
             "looping like a program, with relay clicks and a transformer hum.")
    range = (60, 96)
    params = {
        "rate": Param(12.0, 2, 40, "steps/s", "log", help="Steps per second."),
        "density": Param(0.75, 0, 1, help="Share of steps that bleep."),
        "range": Param(12.0, 0, 24, "st", help="How far bleeps roam above and below the note."),
        "scale": Param("pentatonic", curve="choice", choices=SCALE_CHOICES, help="Scale on the note."),
        "loop": Param(8, 0, 16, curve="int", help="Repeat the pattern every n steps; 0 never repeats."),
        "pw": Param(0.25, 0.05, 0.5, help="Pulse width of the bleeps."),
        "relay": Param(0.3, 0, 1, help="Relay clicks between bleeps."),
        "hum": Param(0.2, 0, 1, help="A transformer hum two octaves under the note."),
    }
    presets = {
        "Calculating": dict(),
        "Error loop": dict(rate=16, density=1.0, range=3, scale="chromatic", loop=3, pw=0.5, relay=0.1, hum=0.4),
        "Tape bank": dict(rate=6, density=0.6, range=19, scale="minor", loop=0, pw=0.12, relay=0.8, hum=0.3),
        "Retro console": dict(rate=24, density=0.9, range=12, scale="major", loop=16, pw=0.125, relay=0.0, hum=0.0),
    }

    def length(self, dur, p):
        return dur + 0.1

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        step = 1.0 / p.rate
        k = max(1, int(np.ceil(dur * p.rate)))
        L = p.loop if p.loop > 0 else k
        pat_semis = snap(rng.uniform(-p.range, p.range, L), p.scale)
        pat_semis[0] = 0.0
        pat_on = rng.random(L) < p.density
        pat_on[0] = True
        pat_len = rng.uniform(0.35, 0.9, L)
        semis = np.zeros(n)
        env = np.zeros(n)
        for i in range(k):
            j = i % L
            a = int(i * step * sr)
            if a >= n:
                break
            if pat_on[j]:
                semis[a:] = pat_semis[j]
                env += dsp.window(n, sr, i * step, min(pat_len[j] * step, dur - i * step), 0.002)
        f = f0 * 2.0 ** (semis / 12.0)
        y = dsp.lp(dsp.square(f, sr, p.pw), 4500.0, sr) * np.clip(env, 0.0, 1.0)
        y = dsp.unit(y)
        if p.relay > 0:
            for i in range(k):
                if rng.random() < p.relay * 0.6:
                    dsp.place(y, 2.5 * p.relay * clack(sr, rng.uniform(900, 1400), rng, 0.3, 0.03), i * step, sr)
        if p.hum > 0:
            fh = f0 / 4.0 if f0 > 160 else f0 / 2.0
            fhc = np.full(n, fh)
            hum = dsp.sine(fhc, sr) + 0.4 * dsp.sine(2 * fhc, sr) + 0.2 * dsp.sine(3 * fhc, sr)
            y += 0.6 * p.hum * hum * dsp.adsr(n, sr, dur, 0.02, 0.1, 1.0, 0.06)
        return y


# ================================================================== energy

@register
class Blaster(Instrument):
    name = "Blaster"
    family = "energy"
    blurb = ("An energy shot: an FM zap that falls onto the note, with a crack and a ringing tail. "
             "Negative drop turns it into a charge-up that fires at the end.")
    range = (48, 96)
    params = {
        "drop": Param(3.0, -4, 6, "oct", help="Octaves the zap falls onto the note; negative rises (a charge-up)."),
        "sweep": Param(0.18, 0.02, 2.0, "s", "log", help="How long the fall takes."),
        "fm": Param(2.0, 0, 10, help="FM index: 0 is a clean whistle, high is a buzzing beam."),
        "ratio": Param(1.5, 0.25, 4, help="FM modulator ratio."),
        "crack": Param(0.3, 0, 1, help="A noise crack as it fires."),
        "ring": Param(0.3, 0, 1, help="How long the note rings after the sweep lands."),
        "repeats": Param(0, 0, 6, curve="int", help="Echo shots after the first."),
        "spacing": Param(0.09, 0.02, 0.5, "s", "log", help="Time between echo shots."),
    }
    presets = {
        "Pew": dict(),
        "Heavy cannon": dict(drop=2.0, sweep=0.45, fm=5.0, ratio=0.5, crack=0.9, ring=0.6, drive=0.5),
        "Ricochet": dict(drop=4.5, sweep=0.08, fm=1.0, ratio=2.0, crack=0.2, ring=0.15, repeats=3, spacing=0.11),
        "Charge shot": dict(drop=-3.0, sweep=0.9, fm=3.0, ratio=1.0, crack=0.8, ring=0.5),
        "Laser harp": dict(drop=1.0, sweep=0.05, fm=0.6, ratio=2.0, crack=0.0, ring=1.0),
    }

    def length(self, dur, p):
        return p.repeats * p.spacing + p.sweep + 0.1 + 1.2 * p.ring

    def _shot(self, n, f0, p, rng, sr):
        t = dsp.times(n, sr)
        T = p.sweep
        prog = np.clip(t / T, 0.0, 1.0)
        f = np.minimum(f0 * 2.0 ** (p.drop * (1.0 - prog) ** 2.2), 10000.0)
        idx = p.fm * (1.0 - 0.75 * prog) * np.clip(1.0 - f * (1.0 + p.ratio) / 20000.0, 0.0, 1.0)
        car = np.sin(TAU * dsp.phase(f, sr) + idx * np.sin(TAU * dsp.phase(f * p.ratio, sr)))
        body = car + 0.25 * dsp.saw(f, sr)
        tail = np.exp(-np.maximum(t - T, 0.0) / (0.03 + 0.9 * p.ring))
        if p.drop >= 0:
            amp = np.where(t < T, 1.0 - 0.3 * prog, 0.7 * tail)
            crack_at = 0.0
        else:
            amp = np.where(t < T, 0.15 + 0.6 * prog ** 1.5, 1.0 * tail)
            crack_at = T
        amp *= dsp.ramp(n, sr, 0.0, 0.0015)
        y = amp * body
        if p.crack > 0:
            cr = dsp.lp(noise_burst(sr, rng, 0.03, 1200.0, 0.006), 6000.0, sr, 4)
            dsp.place(y, 2.5 * p.crack * cr / (np.abs(cr).max() + 1e-9), crack_at, sr)
        return y

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        y = np.zeros(n)
        m = int((p.sweep + 0.1 + 1.2 * p.ring) * sr)
        for k in range(p.repeats + 1):
            fk = f0 * 2.0 ** (rng.normal(0.0, 0.05) / 12.0)
            dsp.place(y, 0.7 ** k * self._shot(m, fk, p, rng, sr), k * p.spacing, sr)
        return y


_CHORDS = {
    "harmonic": (1, 2, 3, 4, 5, 6, 8),
    "octaves": (0.5, 1, 2, 4),
    "fifth": (1, 1.5, 2, 3, 4),
    "minor": (1, 1.2, 1.5, 2, 2.4, 3, 4),
    "major": (1, 1.25, 1.5, 2, 2.5, 3, 4),
}


@register
class Materialize(Instrument):
    name = "Materialize"
    family = "energy"
    blurb = ("A swarm of voices scattered across the spectrum that pull into a pure-tuned chord "
             "on the note, flickering and glittering until they lock.")
    range = (36, 72)
    params = {
        "voices": Param(24, 4, 48, curve="int", help="Number of voices in the swarm."),
        "converge": Param(1.5, 0.05, 8, "s", "log", help="Time for the swarm to pull into tune."),
        "scatter": Param(1.5, 0, 4, "oct", help="How far apart the voices start."),
        "shimmer": Param(0.6, 0, 1, help="Flicker while the swarm is still scattered."),
        "sparkle": Param(0.3, 0, 1, help="High glitter that fades as it materialises."),
        "detune": Param(6.0, 0, 40, "cents", help="Chorus left in the final chord."),
        "chord": Param("harmonic", curve="choice", choices=tuple(_CHORDS), help="What the swarm becomes."),
        "release": Param(1.2, 0.05, 6, "s", "log", help="Fade after the note ends."),
    }
    presets = {
        "Beam in": dict(),
        "Hologram": dict(voices=16, converge=0.4, scatter=0.6, shimmer=0.9, sparkle=0.6, detune=14, chord="fifth"),
        "Crystal lattice": dict(voices=32, converge=3.0, scatter=2.5, shimmer=0.3, sparkle=0.8, detune=2, chord="major"),
        "Ghost signal": dict(voices=12, converge=5.0, scatter=3.5, shimmer=0.8, sparkle=0.1, detune=25, chord="minor"),
    }

    def length(self, dur, p):
        return dur + p.release + 0.1

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        targets = _CHORDS[p.chord]
        out = np.zeros((2, n))
        for j in range(p.voices):
            ratio = targets[j % len(targets)] * (2.0 if rng.random() < 0.12 else 1.0)
            ft = f0 * ratio
            if ft > 0.4 * sr or ft < 20.0:
                continue
            l_t = np.log2(ft) + rng.normal(0.0, p.detune) / 1200.0
            l_s = np.log2(ft) + rng.uniform(-p.scatter, p.scatter)
            tau = p.converge * rng.uniform(0.35, 1.0) / 3.0
            f = np.minimum(2.0 ** (l_t + (l_s - l_t) * np.exp(-t / tau)), 0.45 * sr)
            sh = 1.0 - p.shimmer * 0.8 * np.exp(-t / (p.converge * 0.6)) * (
                0.5 + 0.5 * np.sin(TAU * rng.uniform(5, 15) * t + rng.uniform(0, TAU)))
            osc = np.sin(TAU * dsp.phase(f, sr, rng.uniform(0, 1))) * sh / np.sqrt(ratio) * rng.uniform(0.6, 1.0)
            pan = rng.uniform(-0.8, 0.8)
            out[0] += osc * np.sqrt((1.0 - pan) / 2.0)
            out[1] += osc * np.sqrt((1.0 + pan) / 2.0)
        env = dsp.adsr(n, sr, dur, min(0.3, 0.25 * p.converge + 0.02), 0.2, 1.0, p.release)
        out *= env
        if p.sparkle > 0:
            lvl = dsp.rms(out)
            for c in range(2):
                gr = dsp.lp((dsp.smooth_random(n, sr, 40.0, rng) > 0.55).astype(float), 120.0, sr)
                sp = dsp.unit(dsp.filt(rng.standard_normal(n), "bp", 7000.0, 2.0, sr)) * gr
                out[c] += 1.5 * p.sparkle * lvl * sp * np.exp(-t / (p.converge * 0.8 + 0.05)) * env
        return out


@register
class Tesla(Instrument):
    name = "Tesla"
    family = "energy"
    blurb = ("A singing Tesla coil: sparks fired at the note's frequency, so the arc itself is the "
             "tone. Low notes crackle, high notes buzz.")
    range = (28, 84)
    params = {
        "spark": Param(0.8, 0.1, 5, "ms", "log", help="Length of each spark."),
        "buzz": Param(0.5, 0, 1, help="Tonal body under the sparks."),
        "crackle": Param(0.4, 0, 1, help="Random big cracks and pitch jitter."),
        "misfire": Param(0.15, 0, 1, help="Missed pulses: the arc stutters."),
        "flare": Param(0.4, 0, 1, help="Slow random swells of the arc."),
        "bright": Param(5000.0, 1500, 16000, "Hz", "log", help="Brightness of the sparks."),
    }
    presets = {
        "Singing coil": dict(),
        "Arc welder": dict(spark=2.5, buzz=0.3, crackle=0.9, misfire=0.5, flare=0.8, bright=4000),
        "Thunder lab": dict(spark=4.0, buzz=0.2, crackle=1.0, misfire=0.3, flare=0.6, bright=2500, drive=0.4),
        "Plasma lead": dict(spark=0.3, buzz=1.0, crackle=0.15, misfire=0.0, flare=0.2, bright=6500),
    }

    def length(self, dur, p):
        return dur + 0.06

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        ng = min(n, int(dur * sr))
        f = f0 * (1.0 + 0.006 * p.crackle * dsp.smooth_random(n, sr, 30.0, rng))
        ph = dsp.phase(f, sr)
        on = np.concatenate([[0], np.nonzero(np.diff(np.floor(ph)) > 0)[0] + 1])
        on = on[on < ng]
        on = on[rng.random(len(on)) >= p.misfire * 0.5]
        swell = 1.0 - p.flare * 0.6 * (0.5 + 0.5 * dsp.smooth_random(n, sr, 4.0, rng))
        lvl = swell[on] * rng.uniform(0.8, 1.0, len(on))
        lvl *= np.where(rng.random(len(on)) < p.crackle * 0.04, 2.2, 1.0)
        pans = rng.uniform(-0.6, 0.6, len(on))
        kind = rng.integers(0, 4, len(on))
        out = np.zeros((2, n))
        sl = p.spark * 1e-3
        for k in range(4):
            m = max(8, int(sl * 4.0 * sr))
            kt = dsp.times(m, sr)
            kern = rng.standard_normal(m) * np.exp(-kt / (sl / 2.0))
            kern = dsp.hp(dsp.lp(kern, min(p.bright, 0.45 * sr), sr, 4), 300.0, sr)
            kern /= np.abs(kern).max() + 1e-9
            sel = kind == k
            for c, g in ((0, np.sqrt((1.0 - pans[sel]) / 2.0)), (1, np.sqrt((1.0 + pans[sel]) / 2.0))):
                imp = np.zeros(n)
                imp[on[sel]] = lvl[sel] * g
                out[c] += signal.fftconvolve(imp, kern)[:n]
        if p.buzz > 0:
            bz = dsp.lp(dsp.square(f, sr, 0.1), 4000.0, sr) * dsp.window(n, sr, 0.0, dur, 0.004)
            bz = dsp.unit(bz) * dsp.rms(out) * 1.2 * p.buzz
            out += bz
        return out


# ================================================================== machine

@register
class Turbine(Instrument):
    name = "Turbine"
    family = "machine"
    blurb = ("A rotor spooling up to the note and holding it as a drone: blade-pass harmonics, "
             "rotor wobble, a high compressor whine and air roar. Spools down on release.")
    range = (36, 72)
    params = {
        "spin_up": Param(1.2, 0.05, 8, "s", "log", help="Time to spool up."),
        "spin_down": Param(1.5, 0.05, 8, "s", "log", help="Time to spool down after the note."),
        "spin": Param(2.5, 0.5, 5, "oct", help="Octaves the pitch climbs while spooling up."),
        "blades": Param(11, 3, 24, curve="int", help="Blade count: the wobble beats at the note divided by this."),
        "wobble": Param(0.3, 0, 1, help="Rotor imbalance."),
        "whine": Param(0.35, 0, 1, help="A high compressor stage at inharmonic ratios."),
        "roar": Param(0.35, 0, 1, help="Air roar, brighter as it spins faster."),
        "tilt": Param(1.2, 0.5, 2.5, help="Harmonic tilt: lower is brighter."),
    }
    presets = {
        "Jet spool": dict(),
        "Power core": dict(spin_up=3.0, spin_down=4.0, spin=1.5, blades=7, wobble=0.6, whine=0.1, roar=0.15, tilt=1.6),
        "Hover drone": dict(spin_up=0.3, spin_down=0.4, spin=0.8, blades=4, wobble=0.8, whine=0.2, roar=0.5, tilt=1.0),
        "Warp nacelle": dict(spin_up=5.0, spin_down=6.0, spin=3.5, blades=19, wobble=0.2, whine=0.7, roar=0.3, tilt=0.9),
    }

    def length(self, dur, p):
        return dur + p.spin_down + 0.1

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        up = 1.0 - np.exp(-t / (p.spin_up / 3.0))
        up_g = 1.0 - np.exp(-dur / (p.spin_up / 3.0))
        speed = np.where(t < dur, up, up_g * np.exp(-(t - dur) / (p.spin_down / 3.0)))
        f = f0 * 2.0 ** (-p.spin * (1.0 - speed))
        body = dsp.additive(f, 1.0 / np.arange(1, 25) ** p.tilt, sr)
        body *= 1.0 + p.wobble * 0.45 * np.sin(TAU * dsp.phase(f / p.blades, sr))
        wh = dsp.additive(f, [1.0, 0.6, 0.4], sr, ratios=[3.73, 5.21, 7.66]) * speed ** 2
        amp = speed ** 0.7 * dsp.ramp(n, sr, 0.0, 0.03)
        mono = dsp.unit(body) + 0.8 * p.whine * dsp.unit(wh)
        out = np.zeros((2, n))
        for c in range(2):
            roar = dsp.filt(dsp.pink(n, rng), "lp", 300.0 + 4000.0 * speed ** 1.5, 0.7, sr)
            out[c] = amp * (mono + p.roar * dsp.unit(roar) * speed)
        return out


@register
class Klaxon(Instrument):
    name = "Klaxon"
    family = "machine"
    blurb = ("An alarm: whoop, two-tone, wail or pulse between the note and an interval above it, "
             "through a horn, with a rotating beacon.")
    range = (48, 84)
    params = {
        "mode": Param("whoop", curve="choice", choices=("whoop", "two-tone", "wail", "pulse"),
                      help="The alarm pattern."),
        "interval": Param(7, 1, 12, "st", curve="int", help="Interval from the note to the top tone."),
        "rate": Param(1.6, 0.2, 12, "Hz", "log", help="Cycles per second."),
        "horn": Param(0.6, 0, 1, help="Horn resonance."),
        "distort": Param(0.4, 0, 1, help="Overdriven speaker."),
        "beacon": Param(0.3, 0, 1, help="A rotating beacon's tremolo."),
    }
    presets = {
        "Red alert": dict(),
        "Evacuate": dict(mode="two-tone", interval=4, rate=1.2, horn=0.8, distort=0.6, beacon=0.5),
        "Reactor breach": dict(mode="wail", interval=12, rate=0.35, horn=0.5, distort=0.8, beacon=0.2, drive=0.3),
        "Proximity": dict(mode="pulse", interval=12, rate=6.0, horn=0.2, distort=0.1, beacon=0.0),
    }

    def length(self, dur, p):
        return dur + 0.12

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        cyc = (t * p.rate) % 1.0
        g = np.ones(n)
        if p.mode == "whoop":
            semis = p.interval * np.clip(cyc / 0.8, 0.0, 1.0) ** 0.6
            g = np.clip((0.8 - cyc) / 0.03, 0.0, 1.0) * np.clip(cyc / 0.01, 0.0, 1.0)
        elif p.mode == "two-tone":
            semis = dsp.lp(p.interval * (cyc >= 0.5).astype(float), 40.0, sr)
        elif p.mode == "wail":
            semis = p.interval * (0.5 - 0.5 * np.cos(TAU * p.rate * t))
        else:
            semis = np.zeros(n)
            g = dsp.lp((cyc < 0.45).astype(float), 300.0, sr)
        f = f0 * 2.0 ** (semis / 12.0)
        src = 0.6 * dsp.saw(f, sr) + 0.4 * dsp.square(f, sr, 0.4)
        y = dsp.filt(src, "peak", 1100.0, 2.0, sr, gain_db=9.0 * p.horn)
        y = dsp.filt(y, "peak", 2500.0, 3.0, sr, gain_db=6.0 * p.horn)
        y = dsp.softclip(dsp.unit(y) * 0.5, 1.0 + 8.0 * p.distort)
        y *= 1.0 - p.beacon * 0.6 * (0.5 + 0.5 * np.cos(TAU * 1.3 * t))
        return y * g * dsp.window(n, sr, 0.0, dur, 0.01)


# ================================================================== percussion

@register
class Clockwork(Instrument):
    name = "Clockwork"
    family = "percussion"
    blurb = ("An escapement ticking: tick on the note, tock on an interval, with metal ringing, "
             "worn-gear jitter and a gear train behind it. Can wind up or run down.")
    range = (60, 100)
    params = {
        "rate": Param(4.0, 0.5, 40, "ticks/s", "log", help="Ticks per second."),
        "tock": Param(-5.0, -12, 12, "st", help="Pitch of every second tick, relative to the note."),
        "wind": Param(0.0, -1, 1, help="-1 runs down (slows), +1 winds up (speeds up) across the note."),
        "jitter": Param(0.1, 0, 1, help="Timing and level wobble of worn gears."),
        "metal": Param(0.7, 0, 1, help="0 is a dry click, 1 is a ringing metal part."),
        "decay": Param(0.15, 0.01, 1.5, "s", "log", help="How long each tick rings."),
        "gears": Param(0.2, 0, 1, help="A faint, faster gear train behind the escapement."),
    }
    presets = {
        "Pocket watch": dict(rate=6, tock=-2, metal=0.5, decay=0.05, gears=0.3),
        "Tower gear": dict(rate=1.0, tock=-7, metal=1.0, decay=1.2, jitter=0.05, gears=0.0, drive=0.15),
        "Wind-up toy": dict(rate=14, tock=5, wind=-0.9, jitter=0.4, metal=0.4, decay=0.04, gears=0.6),
        "Escapement": dict(),
    }

    def length(self, dur, p):
        return dur + 1.5 * p.decay + 0.05

    def _tick(self, f, p, rng, sr):
        m = max(16, int((p.decay * 1.4 + 0.01) * sr))
        t = dsp.times(m, sr)
        modes = np.zeros(m)
        for r, a, d in zip((1.0, 2.756, 5.404, 8.933), (1.0, 0.5, 0.35, 0.2), (1.0, 0.55, 0.3, 0.18)):
            if f * r < 0.45 * sr:
                modes += a * np.exp(-t / (p.decay * d / 2.0)) * np.sin(TAU * f * r * t + rng.uniform(0, TAU))
        modes /= np.abs(modes).max() + 1e-9
        click = dsp.filt(rng.standard_normal(m) * np.exp(-t / 0.0015), "bp", float(np.clip(f * 3, 800, 6000)), 2.5, sr)
        click /= np.abs(click).max() + 1e-9
        return p.metal * modes + (1.0 - 0.7 * p.metal) * click

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        ng = int(dur * sr)
        tg = dsp.times(ng, sr)
        r = p.rate * 2.0 ** (p.wind * 1.5 * tg / dur)
        ph = np.cumsum(r) / sr
        on = np.concatenate([[0], np.nonzero(np.diff(np.floor(ph)) > 0)[0] + 1])
        kits = {0: [self._tick(f0, p, rng, sr) for _ in range(3)],
                1: [self._tick(f0 * 2.0 ** (p.tock / 12.0), p, rng, sr) for _ in range(3)]}
        y = np.zeros(n)
        for i, s in enumerate(on):
            at = s / sr + rng.normal(0.0, p.jitter * 0.12) / r[s]
            g = 1.0 - p.jitter * 0.4 * rng.random()
            dsp.place(y, g * kits[i % 2][int(rng.integers(0, 3))], max(0.0, at), sr)
        if p.gears > 0:
            gk = [dsp.filt(noise_burst(sr, rng, 0.01, 1000.0, 0.001), "bp", rng.uniform(2200, 3400), 2.0, sr) for _ in range(3)]
            gk = [g / (np.abs(g).max() + 1e-9) for g in gk]
            g_rate = p.rate * 3.0
            for i in range(int(dur * g_rate)):
                dsp.place(y, 0.35 * p.gears * gk[i % 3] * rng.uniform(0.6, 1.0), i / g_rate, sr)
        return dsp.lp(y, 9000.0, sr)


@register
class MechStomp(Instrument):
    name = "MechStomp"
    family = "percussion"
    blurb = ("A giant robot's footstep, playable as a kick: a thud falling onto the note, a metal "
             "foot plate, loose rattles, hydraulics settling and a servo lifting the leg.")
    range = (24, 60)
    params = {
        "weight": Param(0.6, 0, 1, help="Size of the thud: longer and deeper."),
        "drop": Param(2.0, 0, 4, "oct", help="Pitch drop of the thud onto the note."),
        "punch": Param(0.5, 0, 1, help="Attack click."),
        "clank": Param(0.5, 0, 1, help="Metal ringing from the foot plate."),
        "rattle": Param(0.4, 0, 1, help="Loose parts rattling after the impact."),
        "hiss": Param(0.2, 0, 1, help="Hydraulics settling."),
        "servo": Param(0.0, 0, 1, help="A servo whine as the leg lifts again."),
    }
    presets = {
        "Mech stomp": dict(),
        "Titan step": dict(weight=1.0, drop=1.5, punch=0.3, clank=0.8, rattle=0.8, hiss=0.7, servo=0.6, drive=0.3),
        "Robot kick": dict(weight=0.35, drop=2.5, punch=0.7, clank=0.15, rattle=0.0, hiss=0.0, servo=0.0),
        "Clank kick": dict(weight=0.25, drop=2.0, punch=0.6, clank=1.0, rattle=0.3, hiss=0.1, servo=0.0),
    }

    def length(self, dur, p):
        return 0.5 + 0.9 * p.weight + 0.45 * p.servo

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        tau = 0.08 + 0.45 * p.weight
        fc = f0 * 2.0 ** (p.drop * np.exp(-t / 0.02))
        y = np.tanh(2.5 * np.sin(TAU * np.cumsum(fc) / sr) * np.exp(-t / tau))
        if p.punch > 0:
            click = dsp.lp(noise_burst(sr, rng, 0.01, 1500.0, 0.0015), 7000.0, sr, 4)
            tone = np.sin(TAU * 1800.0 * dsp.times(len(click), sr)) * np.exp(-dsp.times(len(click), sr) / 0.004)
            dsp.place(y, 0.9 * p.punch * (click / (np.abs(click).max() + 1e-9) + 0.5 * tone), 0.0, sr)
        if p.clank > 0:
            cl = clang(sr, into(f0, 250.0, 500.0), rng, 0.7, 0.3 + 0.5 * p.weight, 0.6)
            dsp.place(y, 0.6 * p.clank * cl, 0.003, sr)
        if p.rattle > 0:
            m = int(0.5 * sr)
            tt = dsp.times(m, sr)
            gr = dsp.lp((dsp.smooth_random(m, sr, 35.0, rng) > 0.3).astype(float), 300.0, sr)
            rt = dsp.unit(dsp.filt(rng.standard_normal(m), "bp", 500.0, 0.8, sr)) * gr * np.exp(-tt / 0.12)
            dsp.place(y, 0.35 * p.rattle * rt, 0.015, sr)
        if p.hiss > 0:
            m = int(0.6 * sr)
            tt = dsp.times(m, sr)
            hs = dsp.filt(dsp.hp(rng.standard_normal(m), 900.0, sr), "bp", 4000.0 * 2.0 ** (-1.5 * tt / 0.6), 1.1, sr)
            hs = dsp.unit(hs) * dsp.ramp(m, sr, 0.0, 0.03) * np.exp(-tt / 0.22)
            dsp.place(y, 0.25 * p.hiss * hs, 0.08, sr)
        if p.servo > 0:
            m = int(0.3 * sr)
            pr = np.arange(m) / m
            sv = motor(300.0 * 2.0 ** (1.2 * pr), sr, rng, 0.5, 0.3, 2200.0) * np.sin(np.pi * pr) ** 0.5
            dsp.place(y, 0.18 * p.servo * dsp.unit(sv), 0.4 + 0.3 * p.weight, sr)
        return y
