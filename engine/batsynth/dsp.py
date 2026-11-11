"""batsynth.dsp: vectorised building blocks, numpy and scipy only.

Everything here works on whole buffers. Frequencies may be curves (one value
per sample), so glides, sweeps and vibrato come for free.

Time-varying filters run block-wise: coefficients are recomputed every
`block` samples (64 by default, 1.3 ms at 48 kHz) and the filter state carries
across blocks. That is smooth enough for sweeps and formant moves, and keeps
the library free of compiled code so it runs anywhere Python does.
"""
from __future__ import annotations

import numpy as np
from scipy import signal

SR = 48000
TAU = 2.0 * np.pi


# ---------------------------------------------------------------- basics

def midi_hz(m):
    return 440.0 * 2.0 ** ((np.asarray(m, dtype=float) - 69.0) / 12.0)


def times(n: int, sr: int = SR) -> np.ndarray:
    return np.arange(n) / sr


def curve(v, n: int) -> np.ndarray:
    """A scalar or an array of any length, stretched to n samples."""
    a = np.asarray(v, dtype=float)
    if a.ndim == 0:
        return np.full(n, float(a))
    if len(a) == n:
        return a
    return np.interp(np.linspace(0.0, 1.0, n), np.linspace(0.0, 1.0, len(a)), a)


def phase(freq: np.ndarray, sr: int = SR, phase0: float = 0.0) -> np.ndarray:
    """Running phase in cycles for a frequency curve, starting at phase0."""
    f = np.asarray(freq, dtype=float)
    ph = np.cumsum(f) / sr
    return ph - f[0] / sr + phase0


# ---------------------------------------------------------------- oscillators

def _blep(t: np.ndarray, dt: np.ndarray) -> np.ndarray:
    out = np.zeros_like(t)
    m = t < dt
    x = t[m] / dt[m]
    out[m] = x + x - x * x - 1.0
    m = t > 1.0 - dt
    x = (t[m] - 1.0) / dt[m]
    out[m] = x * x + x + x + 1.0
    return out


def sine(freq, sr: int = SR, phase0: float = 0.0) -> np.ndarray:
    return np.sin(TAU * phase(freq, sr, phase0))


def saw(freq, sr: int = SR, phase0: float = 0.0) -> np.ndarray:
    """Band-limited (PolyBLEP) sawtooth."""
    f = np.asarray(freq, dtype=float)
    ph = phase(f, sr, phase0) % 1.0
    dt = np.clip(np.abs(f) / sr, 1e-9, 0.5)
    return 2.0 * ph - 1.0 - _blep(ph, dt)


def square(freq, sr: int = SR, pw=0.5, phase0: float = 0.0) -> np.ndarray:
    """Band-limited (PolyBLEP) pulse with pulse width pw (scalar or curve)."""
    f = np.asarray(freq, dtype=float)
    n = len(f)
    ph = phase(f, sr, phase0) % 1.0
    dt = np.clip(np.abs(f) / sr, 1e-9, 0.5)
    w = np.clip(curve(pw, n), 0.02, 0.98)
    y = np.where(ph < w, 1.0, -1.0)
    y += _blep(ph, dt)
    y -= _blep((ph - w) % 1.0, dt)
    return y - (2.0 * w - 1.0)


def additive(freq, amps, sr: int = SR, phase0: float = 0.0, ratios=None) -> np.ndarray:
    """Sum of partials k*f (or ratios[k]*f) with amplitudes amps[k].

    Partials fade out as they approach Nyquist, per sample, so a sweeping
    fundamental never aliases.
    """
    f = np.asarray(freq, dtype=float)
    ph = phase(f, sr, phase0)
    ratios = np.arange(1, len(amps) + 1) if ratios is None else np.asarray(ratios, float)
    out = np.zeros_like(f)
    lim = 0.45 * sr
    for a, r in zip(amps, ratios):
        if a == 0.0:
            continue
        guard = np.clip((lim - r * f) / (0.05 * sr), 0.0, 1.0)
        if not guard.any():
            continue
        out += a * guard * np.sin(TAU * r * ph)
    return out


def white(n: int, rng: np.random.Generator) -> np.ndarray:
    return rng.standard_normal(n) * 0.5


def pink(n: int, rng: np.random.Generator) -> np.ndarray:
    """Pink (1/f) noise by spectral shaping, normalised to unit RMS."""
    if n < 4:
        return np.zeros(n)
    spec = np.fft.rfft(rng.standard_normal(n))
    k = np.arange(len(spec), dtype=float)
    k[0] = 1.0
    spec /= np.sqrt(k)
    spec[0] = 0.0
    y = np.fft.irfft(spec, n)
    return y / (np.sqrt(np.mean(y * y)) + 1e-12)


def smooth_random(n: int, sr: int, rate: float, rng: np.random.Generator) -> np.ndarray:
    """A random wander in [-1, 1]: new values `rate` times per second, cosine-interpolated."""
    if n == 0:
        return np.zeros(0)
    pts = int(np.ceil(n / sr * rate)) + 2
    v = rng.uniform(-1.0, 1.0, pts)
    x = np.arange(n) / sr * rate
    i = np.floor(x).astype(int)
    fr = x - i
    w = 0.5 - 0.5 * np.cos(np.pi * fr)
    return v[i] * (1.0 - w) + v[i + 1] * w


# ---------------------------------------------------------------- filters

def biquad(kind: str, f: float, q: float = 0.707, sr: int = SR, gain_db: float = 0.0):
    """RBJ cookbook coefficients: lp, hp, bp (0 dB peak), notch, peak."""
    f = float(np.clip(f, 10.0, 0.49 * sr))
    q = max(float(q), 0.05)
    w0 = TAU * f / sr
    c, s = np.cos(w0), np.sin(w0)
    al = s / (2.0 * q)
    if kind == "lp":
        b = [(1 - c) / 2, 1 - c, (1 - c) / 2]
        a = [1 + al, -2 * c, 1 - al]
    elif kind == "hp":
        b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
        a = [1 + al, -2 * c, 1 - al]
    elif kind == "bp":
        b = [al, 0.0, -al]
        a = [1 + al, -2 * c, 1 - al]
    elif kind == "notch":
        b = [1.0, -2 * c, 1.0]
        a = [1 + al, -2 * c, 1 - al]
    elif kind == "peak":
        A = 10.0 ** (gain_db / 40.0)
        b = [1 + al * A, -2 * c, 1 - al * A]
        a = [1 + al / A, -2 * c, 1 - al / A]
    else:
        raise ValueError(f"unknown filter kind {kind!r}")
    b = np.asarray(b) / a[0]
    a = np.asarray(a) / a[0]
    return b, a


def filt(x, kind: str, f, q=0.707, sr: int = SR, gain_db: float = 0.0, block: int = 64) -> np.ndarray:
    """Biquad filter. f and q may be curves; then it runs block-wise."""
    x = np.asarray(x, dtype=float)
    n = len(x)
    fa = np.asarray(f, dtype=float)
    qa = np.asarray(q, dtype=float)
    if fa.ndim == 0 and qa.ndim == 0:
        b, a = biquad(kind, float(fa), float(qa), sr, gain_db)
        return signal.lfilter(b, a, x)
    fa = curve(fa, n)
    qa = curve(qa, n)
    y = np.empty(n)
    zi = np.zeros(2)
    for s0 in range(0, n, block):
        e = min(n, s0 + block)
        m = (s0 + e) // 2
        b, a = biquad(kind, fa[m], qa[m], sr, gain_db)
        y[s0:e], zi = signal.lfilter(b, a, x[s0:e], zi=zi)
    return y


def lp(x, f, sr: int = SR, poles: int = 2, q: float = 0.707) -> np.ndarray:
    y = x
    for _ in range(max(1, poles // 2)):
        y = filt(y, "lp", f, q, sr)
    return y


def hp(x, f, sr: int = SR, poles: int = 2, q: float = 0.707) -> np.ndarray:
    y = x
    for _ in range(max(1, poles // 2)):
        y = filt(y, "hp", f, q, sr)
    return y


def dc_block(x: np.ndarray, sr: int = SR, f: float = 12.0) -> np.ndarray:
    r = np.exp(-TAU * f / sr)
    return signal.lfilter([1.0, -1.0], [1.0, -r], x, axis=-1)


def resonate(x, freqs, qs, gains, sr: int = SR) -> np.ndarray:
    """Static band-pass bank: noise in, a chord of resonances out."""
    out = np.zeros(len(x))
    for f, q, g in zip(freqs, np.broadcast_to(qs, len(freqs)), np.broadcast_to(gains, len(freqs))):
        if f < 0.45 * sr:
            out += g * filt(x, "bp", f, q, sr)
    return out


# ---------------------------------------------------------------- envelopes and shaping

def adsr(n: int, sr: int, gate: float, a=0.005, d=0.1, s=0.8, r=0.1) -> np.ndarray:
    t = times(n, sr)
    a = max(a, 1e-4)
    d = max(d, 1e-4)
    r = max(r, 1e-4)

    def held(tt):
        return np.where(tt < a, tt / a, s + (1.0 - s) * np.exp(-(tt - a) / (d / 3.0)))

    env = held(t)
    g_level = float(held(np.array([gate]))[0])
    rel = t >= gate
    env[rel] = g_level * np.exp(-(t[rel] - gate) / (r / 3.0))
    return env


def decay(n: int, sr: int, tau: float, start: float = 0.0) -> np.ndarray:
    t = times(n, sr) - start
    return np.where(t >= 0.0, np.exp(-np.maximum(t, 0.0) / max(tau, 1e-5)), 0.0)


def ramp(n: int, sr: int, start: float, length: float) -> np.ndarray:
    """0 before start, rising with a raised cosine to 1 over length."""
    t = times(n, sr)
    x = np.clip((t - start) / max(length, 1e-5), 0.0, 1.0)
    return 0.5 - 0.5 * np.cos(np.pi * x)


def window(n: int, sr: int, start: float, length: float, fade: float = 0.01) -> np.ndarray:
    """1 from start to start+length with raised-cosine edges, 0 elsewhere."""
    fade = min(fade, length / 2.0)
    return ramp(n, sr, start, fade) * (1.0 - ramp(n, sr, start + length - fade, fade))


def fade_out(x: np.ndarray, sr: int, length: float = 0.005) -> np.ndarray:
    m = min(x.shape[-1], int(length * sr))
    if m > 1:
        x[..., -m:] *= np.linspace(1.0, 0.0, m)
    return x


def delay(x: np.ndarray, seconds: float, sr: int = SR) -> np.ndarray:
    k = int(round(seconds * sr))
    if k <= 0:
        return x.copy()
    y = np.zeros_like(x)
    y[..., k:] = x[..., :-k]
    return y


def place(buf: np.ndarray, y: np.ndarray, at: float, sr: int = SR, gain: float = 1.0) -> None:
    """Add y into buf starting at `at` seconds (clipped to the buffer)."""
    s0 = int(round(at * sr))
    if s0 >= buf.shape[-1] or s0 + y.shape[-1] <= 0:
        return
    a0 = max(0, -s0)
    s0 = max(0, s0)
    m = min(buf.shape[-1] - s0, y.shape[-1] - a0)
    buf[..., s0:s0 + m] += gain * y[..., a0:a0 + m]


def softclip(x: np.ndarray, drive: float) -> np.ndarray:
    g = 1.0 + drive
    return np.tanh(g * x) / np.tanh(g)


def crush(x: np.ndarray, bits: float, hold: int = 1) -> np.ndarray:
    y = x
    if hold > 1:
        n = y.shape[-1]
        idx = (np.arange(n) // hold) * hold
        y = y[..., idx]
    if bits < 16:
        levels = 2.0 ** (bits - 1)
        y = np.round(y * levels) / levels
    return y


def rms(x: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(x)) + 1e-20))


def unit(x: np.ndarray) -> np.ndarray:
    """Scale to unit RMS (silence stays silent)."""
    r = rms(x)
    return x / r if r > 1e-9 else x
