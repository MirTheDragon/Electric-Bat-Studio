"""batsynth.engines: bass instruments built from combustion engines.

Seven engines, all basses, all on the instrument standard:

    VTwin       45° big twin: the potato growl
    MuscleV8    crossplane V8 burble, one cylinder bank per stereo side
    Boxer       flat four with unequal-length headers: the boxer rumble
    Crossplane  inline four, from flatplane to crossplane
    Rotary      Wankel rotary: square port pulses and the idle brap
    TwoStroke   single-cylinder two-stroke with an expansion chamber
    Diesel      big diesel: injector knock and turbo, down to a ship engine

How the growl is made
---------------------
An engine's exhaust is a train of pressure pulses, one per firing. Each pulse
is asymmetric: a sharp positive peak as the valve opens, then a broad,
shallow trough as the wave reflects back up the pipe (equal area, so no DC).
The firing pattern is asymmetric too: a 45° V-twin fires 315° then 405°
apart, and each bank of a crossplane V8 fires unevenly. Uneven spacing puts
energy at half and quarter orders below the firing rate: the growl, lope and
burble.

The note sets the average firing rate, so the engine plays in tune. The extra
orders are harmonics of the engine cycle, a fundamental one to three octaves
below the note, so they stay consonant with it.

* `asym` morphs every engine from even firing (0) to its most uneven layout (1).
* `rev` turns the engine over 1–3 octaves slower while the `pipe`, a feedback
  comb tuned to the note, keeps ringing on the right pitch, so a slow idle
  becomes a rhythmic, pitched lope.
* `growl` is an asymmetric waveshaper that drives the pressure peaks harder
  than the troughs, adding even harmonics.

After that come a muffler low-pass, intake roar, an optional turbo, and
overrun crackle after the note. No bright noise: the pops and the blow-off are
low-passed below 4 kHz.
"""
from __future__ import annotations

from dataclasses import replace

import numpy as np
from scipy import signal

from . import dsp
from .core import Instrument, Param, register
from .genres import lp24, warm

TAU = dsp.TAU

ENGINE_PARAMS = {
    "asym": Param(0.5, 0, 1, help="Uneven firing: 0 fires evenly, 1 is this engine's most uneven layout. This is the growl."),
    "throttle": Param(0.6, 0, 1, help="Load: sharper, harder combustion pulses and a brighter exhaust."),
    "lope": Param(0.2, 0, 1, help="Cycle-to-cycle variation and idle hunting: a big cam's lumpy idle."),
    "rev": Param(0, 0, 3, "oct", "int", help="Octaves below the note the engine turns. The pipe stays tuned to the note, "
                                             "so higher values sound slower and more rhythmic."),
    "pipe": Param(0.35, 0, 0.95, help="Exhaust resonance tuned to the note: more is more tonal, less is rawer."),
    "muffler": Param(1500.0, 150, 8000, "Hz", "log", help="Muffler cutoff."),
    "growl": Param(0.5, 0, 1, help="Asymmetric overdrive: drives the pressure peaks harder than the troughs."),
    "sub": Param(0.3, 0, 1, help="Clean sine at the note, for weight."),
    "blip": Param(0.0, 0, 12, "st", help="Throttle blip: the pitch jumps up and settles at the start of the note."),
    "glide": Param(0.0, -24, 24, "st", help="Per note: rev into the note from this far away."),
    "crackle": Param(0.0, 0, 1, help="Overrun pops after the note ends. Low-passed, not hissy."),
    "turbo": Param(0.0, 0, 1, help="Turbo whine spooling up with the note, and blow-off flutter at the release."),
    "release": Param(0.15, 0.02, 2, "s", "log", help="How long the engine winds down after the note."),
}


def engine_params(**defaults) -> dict:
    """The shared engine parameters with this engine's own defaults."""
    return {k: replace(v, default=defaults[k]) if k in defaults else v for k, v in ENGINE_PARAMS.items()}


# ------------------------------------------------------------------ building blocks

def fire_trains(fc, events, banks, sr, rng, amp, lope=0.0, gains=None, skip=0.0):
    """Impulse trains, one per exhaust bank, placed with sub-sample accuracy.

    fc      engine-cycle frequency curve (one value per sample)
    events  (fraction of the cycle, bank, cylinder) for every firing in one cycle
    amp     per-sample throttle curve, sampled at each firing
    """
    n = len(fc)
    ph = np.cumsum(fc) / sr - fc[0] / sr - 1e-9
    trains = np.zeros((banks, n + 2))
    for frac, bank, cyl in events:
        u = ph - frac
        k = np.floor(u)
        idx = np.nonzero(np.diff(k) > 0)[0] + 1
        if len(idx) == 0:
            continue
        past = (u[idx] - k[idx]) / np.maximum(u[idx] - u[idx - 1], 1e-12)
        pos = np.clip(idx - past, 0.0, n - 1.0)
        a = amp[idx].copy()
        if gains is not None:
            a *= gains[cyl]
        if lope > 0:
            a *= np.clip(1.0 + 0.35 * lope * rng.standard_normal(len(idx)), 0.25, 2.0)
        if skip > 0:
            a *= rng.random(len(idx)) >= skip
        i0 = np.floor(pos).astype(int)
        fr = pos - i0
        np.add.at(trains[bank], i0, a * (1.0 - fr))
        np.add.at(trains[bank], i0 + 1, a * fr)
    return trains[:, :n]


def exhaust_pulse(sr, rise_ms, decay_ms, ref_ms, square_ms=0.0, length=0.045):
    """One asymmetric pressure pulse: a sharp peak, then a broad reflected trough of equal area."""
    m = int(length * sr)
    t = dsp.times(m, sr)
    rise, dec = rise_ms * 1e-3, decay_ms * 1e-3
    if square_ms > 0:  # a rotary's exhaust port snaps open and shut
        w = square_ms * 1e-3
        k = dsp.window(m, sr, 0.0, w, min(2.0 * rise, w / 3.0)) * np.exp(-t / (1.5 * w))
    else:
        k = (1.0 - np.exp(-t / rise)) * np.exp(-t / dec)
    k /= k.max() + 1e-12
    trough = np.zeros(m)
    dsp.place(trough, dsp.lp(k, 900.0, sr), ref_ms * 1e-3, sr)
    trough = np.maximum(dsp.lp(trough, 600.0, sr), 0.0)
    trough *= k.sum() / (trough.sum() + 1e-12)
    return k - trough


def tuned_pipe(x, f, g, sr, damp=0.3):
    """Feedback comb tuned to f: a pipe resonating on every harmonic of the note."""
    if g <= 0:
        return x
    L = sr / f - damp  # the taps add `damp` samples of delay on top of D + d
    D = max(3, int(np.floor(L)))
    d = float(np.clip(L - D, 0.0, 1.0))
    taps = np.convolve([1.0 - d, d], [1.0 - damp, damp])
    P = 3
    y = np.concatenate([np.zeros(P), np.asarray(x, dtype=float)])
    n = len(y)
    for s in range(P + D, n, D):
        e = min(n, s + D)
        acc = taps[0] * y[s - D:e - D] + taps[1] * y[s - D - 1:e - D - 1] + taps[2] * y[s - D - 2:e - D - 2]
        y[s:e] += g * acc
    return y[P:]


def asym_drive(x, amount):
    """Asymmetric saturation: positive pressure peaks clip before the troughs do."""
    if amount <= 0:
        return x
    ref = np.percentile(np.abs(x), 99.5) + 1e-12
    g = 1.0 + 6.0 * amount
    b = 0.3 * amount
    return (np.tanh(g * (x / ref + b)) - np.tanh(g * b)) * ref


def pop(sr, rng, length=0.06):
    """An overrun pop: a dark burst and a low thump."""
    m = int(length * sr)
    t = dsp.times(m, sr)
    burst = dsp.lp(rng.standard_normal(m) * np.exp(-t / 0.003), 3000.0, sr, 4)
    burst /= np.abs(burst).max() + 1e-9
    f = rng.uniform(70.0, 120.0)
    thump = np.sin(TAU * f * t) * np.exp(-t / 0.018)
    return burst + 0.7 * thump


def harmonic_below(f0, mult, ceiling):
    """The largest harmonic multiple of f0 at mult, halved by octaves until under ceiling."""
    m = float(mult)
    while f0 * m > ceiling and m > 1.0:
        m /= 2.0
    return m


# ------------------------------------------------------------------ the shared engine voice

class EngineBass(Instrument):
    family = "engine"
    range = (24, 55)
    banks = 1
    rise_ms, decay_ms, ref_ms, square_ms = 0.3, 2.0, 3.0, 0.0
    intake = 0.12
    params = engine_params()

    # --- what each engine defines

    def events(self, p, geo):
        """(fraction of the engine cycle, bank, cylinder) for every firing in one cycle."""
        raise NotImplementedError

    def balance(self, p, geo, cylinders):
        """Per-cylinder pulse strength. Real engines are never perfectly even."""
        return 1.0 + 0.05 * geo.standard_normal(cylinders)

    def misfire(self, p):
        return 0.0

    def colour(self, Y, trains, f0, f_note, p, rng, sr, dur):
        """Engine-specific additions after the muffler. Y is (banks, n)."""
        return Y

    # --- the shared voice

    def length(self, dur, p):
        return dur + p.release + 0.12 + 0.45 * (p.crackle > 0) + 0.35 * (p.turbo > 0)

    def voice(self, f0, vel, dur, p, rng, sr):
        n = int(self.length(dur, p) * sr)
        t = dsp.times(n, sr)
        after = np.maximum(t - dur, 0.0)
        rel = max(p.release, 0.02)
        # the engine's speed: blip, glide, coasting down after the note, idle hunting
        semis = p.glide * np.exp(-t / 0.04)
        if p.blip > 0:
            semis = semis + p.blip * (1.0 - np.exp(-t / 0.018)) * np.exp(-t / 0.16)
        semis = semis - 1.2 * (1.0 - np.exp(-after / rel))
        if p.lope > 0:
            semis = semis + 0.15 * p.lope * dsp.smooth_random(n, sr, 2.5, rng)
        f_note = f0 * 2.0 ** (semis / 12.0)
        # the engine's geometry is fixed per seed, so every note is the same engine
        geo = np.random.default_rng([self.seed, 7919])
        ev = self.events(p, geo)
        cylinders = max(c for _, _, c in ev) + 1
        fc = f_note / 2.0 ** p.rev / len(ev)
        throttle = np.where(t < dur, 1.0, 0.35 * np.exp(-after / rel))
        trains = fire_trains(fc, ev, self.banks, sr, rng, throttle, p.lope,
                             self.balance(p, geo, cylinders), self.misfire(p))
        th = p.throttle
        cut = min(p.muffler * 2.0 ** (1.2 * (th - 0.5)), 0.4 * sr)
        Y = np.zeros((self.banks, n))
        for b in range(self.banks):
            k = exhaust_pulse(sr, self.rise_ms * (1.7 - 1.2 * th), self.decay_ms * (1.5 - 0.8 * th),
                              self.ref_ms + 0.4 * b, self.square_ms)
            x = dsp.dc_block(signal.fftconvolve(trains[b], k)[:n], sr)
            x = tuned_pipe(x, f0, p.pipe, sr)
            x = asym_drive(x, p.growl)
            Y[b] = lp24(x, cut, 0.1, sr) * (1.0 if b == 0 else 0.95)
        Y = self.colour(Y, trains, f0, f_note, p, rng, sr, dur)
        gate = t < dur
        lvl = dsp.rms(Y[:, gate]) if gate.any() else dsp.rms(Y)
        # intake roar, following the exhaust
        if self.intake > 0:
            for b in range(self.banks):
                env = dsp.lp(np.abs(Y[b]), 30.0, sr)
                roar = dsp.unit(dsp.filt(dsp.pink(n, rng), "bp", 250.0 + 650.0 * th, 1.0, sr))
                Y[b] += self.intake * (0.4 + th) * roar * env
        if p.sub > 0:
            Y += 1.2 * p.sub * lvl * np.sin(TAU * dsp.phase(f_note, sr))
        Y *= dsp.adsr(n, sr, dur, 0.004, 0.08, 1.0, 1.3 * rel)
        # turbo: whine on a power-of-two harmonic of the note (in tune), then blow-off
        if p.turbo > 0:
            spool_end = 1.0 - np.exp(-dur / 0.45)
            spool = np.where(t < dur, 1.0 - np.exp(-t / 0.45), spool_end * np.exp(-after / 0.3))
            m = harmonic_below(f0, 16, 2500.0)
            whine = np.sin(TAU * dsp.phase(f_note * m * (0.75 + 0.25 * spool), sr)) * spool ** 2
            Y += 0.35 * p.turbo * lvl * whine
            flutter = dsp.filt(dsp.pink(n, rng), "bp", 1400.0, 1.3, sr)
            flutter *= (0.5 + 0.5 * np.sin(TAU * 17.0 * after)) ** 2 * np.exp(-after / 0.3) * (t >= dur)
            flutter = dsp.lp(dsp.unit(flutter), 3800.0, sr, 4) * spool_end
            Y += 0.9 * p.turbo * lvl * flutter
        # overrun crackle
        if p.crackle > 0:
            count = int(rng.poisson(p.crackle * 7.0 * (rel + 0.35))) + (1 if p.crackle >= 0.3 else 0)
            for _ in range(count):
                at = dur + rng.uniform(0.02, rel + 0.35)
                pk = pop(sr, rng) * rng.uniform(0.4, 1.0) * 2.2 * p.crackle * lvl
                pan = rng.uniform(-0.5, 0.5)
                for b in range(self.banks):
                    g = 1.0 if self.banks == 1 else np.sqrt((1.0 + (pan if b else -pan)) / 2.0)
                    dsp.place(Y[b], pk * g, at, sr)
        Y = warm(Y if self.banks > 1 else Y[0], 0.3, sr)
        return Y


# ================================================================== the engines

@register
class VTwin(EngineBass):
    name = "VTwin"
    blurb = ("A big V-twin: two firings per cycle, 315° and 405° apart at the 45° default. The uneven gap "
             "puts a sub-octave under every note: the potato growl. Asym runs from an even 360° twin to a 90° L-twin.")
    rise_ms, decay_ms, ref_ms = 0.35, 2.6, 3.4
    params = engine_params(asym=0.5, throttle=0.6, lope=0.25, pipe=0.3, muffler=1100.0, growl=0.6, sub=0.35, release=0.2)
    presets = {
        "Big twin": dict(),
        "Potato idle": dict(rev=2, lope=0.6, pipe=0.8, muffler=800, throttle=0.4, sub=0.4, release=0.35),
        "L-twin": dict(asym=1.0, throttle=0.8, muffler=2200, growl=0.5, pipe=0.25, blip=3),
        "Straight pipes": dict(asym=0.6, throttle=0.9, muffler=3500, growl=0.85, pipe=0.15, crackle=0.7,
                               release=0.4, drive=0.2),
    }

    def events(self, p, geo):
        return [(0.0, 0, 0), ((360.0 + 90.0 * p.asym) / 720.0, 0, 1)]

    def balance(self, p, geo, cylinders):
        return np.array([1.0, 0.9]) * (1.0 + 0.04 * geo.standard_normal(2))


@register
class MuscleV8(EngineBass):
    name = "MuscleV8"
    blurb = ("A crossplane V8 burble. Each cylinder bank fires unevenly (the engine fires L-R-R-L-R-L-L-R), and "
             "each bank has its own exhaust, here one per stereo side. Asym 0 is a flatplane V8's even scream.")
    banks = 2
    rise_ms, decay_ms, ref_ms = 0.3, 2.2, 3.0
    params = {**engine_params(asym=1.0, throttle=0.55, lope=0.35, pipe=0.3, muffler=900.0, growl=0.55, sub=0.3),
              "whine": Param(0.0, 0, 1, help="Supercharger whine, gear-driven and locked to the engine speed.")}
    presets = {
        "Muscle burble": dict(),
        "Lumpy cam": dict(rev=1, lope=0.85, muffler=700, pipe=0.45, throttle=0.45, crackle=0.3, release=0.4),
        "Supercharged": dict(whine=0.6, throttle=0.85, muffler=1800, growl=0.7, blip=2),
        "Flatplane": dict(asym=0.0, throttle=0.9, muffler=4500, growl=0.4, pipe=0.2, lope=0.1),
    }

    def events(self, p, geo):
        a = p.asym
        left = [0, 180 + 90 * a, 360 + 90 * a, 540]
        right = [90, 270 - 90 * a, 450 - 90 * a, 630]
        return [(x / 720.0, 0, i) for i, x in enumerate(left)] + [(x / 720.0, 1, 4 + i) for i, x in enumerate(right)]

    def colour(self, Y, trains, f0, f_note, p, rng, sr, dur):
        if p.whine > 0:
            m = harmonic_below(f0, 12, 3000.0)
            n = Y.shape[1]
            w = np.sin(TAU * dsp.phase(f_note * m, sr)) * dsp.adsr(n, sr, dur, 0.05, 0.1, 1.0, 0.1)
            Y = Y + 0.3 * p.whine * dsp.rms(Y) * w
        return Y


@register
class Boxer(EngineBass):
    name = "Boxer"
    blurb = ("A flat four that fires evenly, but its unequal-length headers deliver the pulses to the collector "
             "unevenly: the boxer rumble. Low and round by default.")
    rise_ms, decay_ms, ref_ms = 0.4, 2.4, 3.8
    intake = 0.16
    params = engine_params(asym=0.7, throttle=0.55, lope=0.25, pipe=0.35, muffler=750.0, growl=0.5, sub=0.35)
    presets = {
        "Boxer rumble": dict(),
        "Rally": dict(turbo=0.7, crackle=0.8, throttle=0.85, muffler=1600, release=0.5, growl=0.7),
        "Air-cooled": dict(asym=0.4, muffler=1300, throttle=0.5, lope=0.5, pipe=0.45, growl=0.4, rev=1),
        "Deep rumble": dict(asym=1.0, muffler=450, pipe=0.5, sub=0.6, growl=0.6),
    }

    def events(self, p, geo):
        offs = np.array([0.0, 38.0, 9.0, 52.0]) * p.asym
        return [((180.0 * i + offs[i]) / 720.0, 0, i) for i in range(4)]


@register
class Crossplane(EngineBass):
    name = "Crossplane"
    blurb = ("An inline four. Flatplane (asym 0) fires every 180° and screams; crossplane (asym 1) fires "
             "270-180-90-180 and growls like a small V8. Sharp and bright for a bass.")
    range = (28, 64)
    rise_ms, decay_ms, ref_ms = 0.2, 1.5, 2.4
    params = engine_params(asym=0.85, throttle=0.75, lope=0.15, pipe=0.4, muffler=2500.0, growl=0.5, sub=0.25)
    presets = {
        "Crossplane": dict(),
        "Flatplane four": dict(asym=0.0, throttle=0.9, muffler=4000, growl=0.35),
        "Track day": dict(throttle=0.95, muffler=3500, crackle=0.85, blip=5, release=0.45, growl=0.7),
        "Superbike idle": dict(rev=2, lope=0.45, throttle=0.35, muffler=1500, pipe=0.75, sub=0.35),
    }

    def events(self, p, geo):
        a = p.asym
        return [(x / 720.0, 0, i) for i, x in enumerate([0, 180 + 90 * a, 360 + 90 * a, 540])]


@register
class Rotary(EngineBass):
    name = "Rotary"
    blurb = ("A Wankel rotary: the exhaust port snaps open and shut, so each pulse is nearly square and the "
             "tone is buzzy. Brap adds misfires, for the lumpy idle of a ported rotary.")
    range = (28, 64)
    rise_ms, decay_ms, ref_ms, square_ms = 0.08, 1.0, 2.0, 1.6
    params = {**engine_params(asym=0.3, throttle=0.7, lope=0.2, pipe=0.25, muffler=2200.0, growl=0.6, sub=0.3),
              "rotors": Param(2, 1, 4, curve="int", help="Number of rotors."),
              "brap": Param(0.1, 0, 1, help="Misfires: the brap-brap idle.")}
    presets = {
        "Two-rotor": dict(),
        "Bridgeport": dict(brap=0.45, rev=1, lope=0.7, crackle=0.6, muffler=1800, release=0.4, pipe=0.55),
        "Three-rotor": dict(rotors=3, throttle=0.95, muffler=4500, asym=0.1, growl=0.45),
        "Brap idle": dict(rev=2, brap=0.35, lope=0.6, throttle=0.4, pipe=0.8, sub=0.4),
    }

    def events(self, p, geo):
        r = p.rotors
        return [((k / r + 0.06 * p.asym * (k % 2)) % 1.0, 0, k) for k in range(r)]

    def misfire(self, p):
        return 0.45 * p.brap


@register
class TwoStroke(EngineBass):
    name = "TwoStroke"
    blurb = ("A single-cylinder two-stroke with an expansion chamber that rings on a harmonic of the note. "
             "Asym makes it four-stroke (skip every other firing), the ring-ding of a two-stroke off the pipe.")
    range = (28, 64)
    rise_ms, decay_ms, ref_ms = 0.12, 0.9, 1.8
    intake = 0.08
    params = {**engine_params(asym=0.2, throttle=0.7, lope=0.15, pipe=0.2, muffler=3000.0, growl=0.5, sub=0.25),
              "chamber": Param(4, 2, 10, curve="int", help="The harmonic of the note the expansion chamber rings on."),
              "ring": Param(0.5, 0, 1, help="How strongly the chamber rings.")}
    presets = {
        "Dirt bike": dict(),
        "Ring-ding": dict(rev=1, asym=0.8, lope=0.5, throttle=0.35, ring=0.7, muffler=2200),
        "Chainsaw": dict(chamber=6, ring=0.8, throttle=1.0, growl=0.85, muffler=4500, drive=0.2),
        "Expansion": dict(chamber=3, ring=0.7, pipe=0.5, throttle=0.8, blip=4, sub=0.4),
    }

    def events(self, p, geo):
        return [(0.0, 0, 0), (0.5, 0, 1)]

    def balance(self, p, geo, cylinders):
        return np.array([1.0, 1.0 - 0.85 * p.asym])

    def colour(self, Y, trains, f0, f_note, p, rng, sr, dur):
        if p.ring > 0:
            fch = f0 * harmonic_below(f0, p.chamber, 3000.0)
            for b in range(Y.shape[0]):
                r = dsp.filt(Y[b], "bp", fch, 6.0, sr)
                Y[b] = Y[b] + 1.5 * p.ring * r * dsp.rms(Y[b]) / (dsp.rms(r) + 1e-12)
        return Y


@register
class Diesel(EngineBass):
    name = "Diesel"
    blurb = ("A big diesel: long, heavy pulses, injector knock on every firing, uneven injectors as the asym, "
             "and a turbo by default. From a two-cylinder tractor down to a ship engine's slow thump.")
    range = (21, 52)
    rise_ms, decay_ms, ref_ms = 0.5, 4.0, 4.5
    intake = 0.14
    params = {**engine_params(asym=0.4, throttle=0.6, lope=0.2, pipe=0.35, muffler=700.0, growl=0.55, sub=0.4, turbo=0.3),
              "cylinders": Param(6, 1, 8, curve="int", help="Number of cylinders."),
              "knock": Param(0.4, 0, 1, help="Injector knock: a short metallic ring on every firing.")}
    presets = {
        "Big rig": dict(),
        "Tractor": dict(cylinders=2, rev=1, knock=0.5, asym=0.6, muffler=600, turbo=0.0, lope=0.4),
        "Rolling coal": dict(turbo=0.9, throttle=1.0, growl=0.85, muffler=1200, knock=0.6, blip=3, release=0.5),
        "Ship engine": dict(rev=3, muffler=300, pipe=0.8, knock=0.15, lope=0.15, turbo=0.0, sub=0.6, release=0.8),
    }

    def events(self, p, geo):
        c = p.cylinders
        offs = 0.012 * p.asym * geo.standard_normal(c)
        return [((k / c + offs[k]) % 1.0, 0, k) for k in range(c)]

    def balance(self, p, geo, cylinders):
        return np.clip(1.0 + 0.3 * p.asym * geo.standard_normal(cylinders), 0.4, 1.6)

    def colour(self, Y, trains, f0, f_note, p, rng, sr, dur):
        if p.knock > 0:
            m = int(0.02 * sr)
            t = dsp.times(m, sr)
            for b in range(Y.shape[0]):
                fk = rng.uniform(1500.0, 2300.0)
                kern = np.sin(TAU * fk * t) * np.exp(-t / 0.0035) + 0.5 * np.sin(TAU * fk * 1.47 * t) * np.exp(-t / 0.002)
                kn = dsp.lp(signal.fftconvolve(trains[b], kern)[:Y.shape[1]], 4000.0, sr, 4)
                Y[b] = Y[b] + 0.5 * p.knock * dsp.rms(Y[b]) * dsp.unit(kn)
        return Y
