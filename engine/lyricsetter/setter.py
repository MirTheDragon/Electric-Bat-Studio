"""Set words to the band: rhythm from the groove, melody from the harmony and the hook.

Two dynamic programmes per line.

**Rhythm.** Every syllable gets an onset on the song's 16th grid. The cost of a choice is
how badly it fights English and the band:
  * a stressed syllable on a weak 16th, or an unstressed one stealing the beat from its
    stressed neighbour (the 'AI singing' tell: sig-NAL, in-TO);
  * durations far from what the syllable wants (stressed and long vowels long, the little
    words short, the line's last word held), so lines stop sounding typed;
  * onsets that ignore the groove: optionally the line borrows the rhythm of a layer
    (the arp, the stabs, the clap) or answers in its gaps;
  * odd lengths and odd 16ths, which a singer only uses on purpose.

**Melody.** Every note gets a pitch from the key and the chord under it:
  * chord tones where the note is strong or long, passing tones in between, never a
    semitone against something the pad or lead is holding;
  * mostly steps, leaps answered by a step back;
  * the shape of speech: stressed syllables a little higher, the line falling to its end
    (or rising for a question), one peak on an open vowel;
  * close vowels (ee, oo) kept off long high notes;
  * optional: open with a motif's intervals, shadow a layer's pitches (sing the hook),
    or copy an earlier line's tune (a chorus that repeats).
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

import numpy as np

from .context import METRIC, Song
from .phon import Syl, syllables

INF = 1e9


@dataclass
class Line:
    text: str
    bar: float                    # window start (0-based bar)
    bars: float = 2.0             # window length
    part: str = "lead"            # which sung part (one voice stem per part)
    feel: str = "sing"            # sing | hook | chant | speak | robot
    pickup: int = 2               # 16ths allowed before the window (an upbeat)
    lock: str | None = None       # borrow this layer's rhythm ('arp_a', 'stabs', 'clap', ...)
    lock_amt: float = 0.5         # >0 sing with it, <0 answer in its gaps
    ending: str = "fall"          # fall | rise | hang | hold
    lo: int = 57
    hi: int = 72
    follow: str | None = None     # shadow this layer's pitches (octave or a third away)
    follow_amt: float = 0.8
    motif: list | None = None     # opening intervals in semitones, e.g. [0, 7, 12, 3]
    same_as: str | None = None    # copy rhythm and tune of the line with this name
    name: str | None = None
    fill: float = 0.9             # how much of the window the line fills
    end_beats: float | None = None  # how long to hold the last note (beats), default by feel
    flags: dict = field(default_factory=dict)  # syllable index -> note flags ('!', '~', 'v', ...)
    center: float | None = None   # pitch centre of the line (MIDI), default middle of lo..hi
    shape: str = "arch"           # arch | fall | rise | flat
    pin: dict = field(default_factory=dict)    # syllable index -> MIDI pitch that must be sung
    waive: set = field(default_factory=set)    # critic rules this line breaks on purpose


@dataclass
class Note:
    t0: float
    t1: float
    k: int            # onset in 16ths (absolute)
    d: int            # steps to the next onset (or held length for the last)
    midi: int = 60
    syl: Syl | None = None
    flags: str = ""
    word: int = 0     # word index within the line
    strength: float = 0.0


# ------------------------------------------------------------------ helpers
def _punct_after(text: str) -> list[bool]:
    """For each word: is it followed by a comma, dash or other breath mark?"""
    out = []
    for w in re.findall(r"[^\s{}]+(?:\{[^}]*\})?", text):
        if re.search(r"[A-Za-z{]", w):
            out.append(bool(re.search(r"[,;:.!?…—–]$", re.sub(r"\{.*\}", "", w))))
    return out


FEEL = {
    #          beats per syllable (target), final hold (beats), odd-16th penalty, groove blend
    "sing":   dict(spb=0.75, hold=1.5, odd=0.35, groove=0.25, rep0=0.35),
    "hook":   dict(spb=1.0, hold=2.0, odd=0.45, groove=0.3, rep0=0.25),
    "chant":  dict(spb=0.5, hold=1.0, odd=0.2, groove=0.35, rep0=0.0),
    "speak":  dict(spb=0.5, hold=0.75, odd=0.1, groove=0.2, rep0=0.0),
    "robot":  dict(spb=0.5, hold=1.0, odd=0.6, groove=0.4, rep0=0.0),
}

ALLOWED_D = {1: 0.25, 2: 0.0, 3: 0.08, 4: 0.0, 5: 0.5, 6: 0.1, 7: 0.6, 8: 0.0, 9: 0.6, 10: 0.5, 11: 0.8,
             12: 0.15, 13: 0.9, 14: 0.6, 15: 0.9, 16: 0.1, 20: 0.4, 24: 0.3, 32: 0.3}


def _strengths(song: Song, ks: np.ndarray, d: int, groove: float) -> np.ndarray:
    """Strength of a note at onsets ks lasting d steps: onset weight, or the weight of a beat it
    ties across within two 16ths (a pushed note keeps the beat it anticipates)."""
    w0 = np.array([song.weight(int(k), groove) for k in ks])
    best = w0.copy()
    for j in (1, 2):
        if d > j:
            wj = np.array([song.weight(int(k) + j, 0.0) for k in ks])
            best = np.maximum(best, (0.92 if j == 1 else 0.85) * wj)
    return best


# ------------------------------------------------------------------ rhythm
def set_rhythm(song: Song, syls: list[Syl], line: Line) -> list[Note]:
    F = FEEL[line.feel]
    n = len(syls)
    S0 = int(round(line.bar * 16))
    Sstart = S0 - line.pickup
    S1 = int(round((line.bar + line.bars) * 16))
    K = S1 - Sstart + 1
    ks = np.arange(Sstart, S1 + 1)
    step_s = song.step_s
    pauses = _punct_after(line.text)

    # minimum IOI: vowel >= 70 ms plus the consonants around it
    mind = []
    for i, s in enumerate(syls):
        nxt = syls[i + 1] if i + 1 < n else None
        need = 0.075 + 0.035 * len(s.coda) + (0.03 * len(nxt.onset) if nxt else 0)
        mind.append(max(1, int(np.ceil(need / step_s - 0.25))))

    # target IOI per syllable, from a speech-duration model scaled to the window
    w = np.array([0.55 + 0.9 * s.weight + 0.18 * (s.vowel in ("AY", "AW", "OY", "OW", "EY", "IY", "UW", "AA", "AO"))
                  + 0.12 * len(s.coda) for s in syls])
    for i, s in enumerate(syls):
        if s.last and pauses[s.wi] and i < n - 1:
            w[i] += 0.9                                    # a breath after a comma
    hold_steps = 4 * (line.end_beats if line.end_beats is not None else F["hold"])
    avail = (S1 - S0) * line.fill - hold_steps
    per = 4 * F["spb"]
    scale = min(per, max(1.0, avail / max(w[:-1].sum(), 1e-6))) if n > 1 else per
    target = np.maximum(w * scale, 1.0)
    target[-1] = max(hold_steps, 2)

    lock = np.zeros(K)
    if line.lock:
        if line.lock in song.drum_on:
            on = song.drum_on[line.lock]
        else:
            on = np.zeros(len(song.push))
            for a, d, p, v in song.layers[line.lock]["notes"]:
                k = int(round(a / step_s))
                if 0 <= k < len(on):
                    on[k] = 1
        # the layer's rhythm in this window, or (if silent here) its rhythm one bar-pattern earlier
        seg = np.array([on[k] if 0 <= k < len(on) else 0 for k in ks])
        if seg.sum() == 0:
            for back in (16, 32, 64, 128):
                seg = np.array([on[k - back] if 0 <= k - back < len(on) else 0 for k in ks])
                if seg.sum():
                    break
        lock = seg

    Dmax = 32
    Ds = [d for d in range(1, Dmax + 1)]
    oddpen = np.array([F["odd"] if (k % 2) else 0.0 for k in ks])
    # V[i][d] : array over k (index in ks) of best cost with syllable i at k lasting d
    V = [dict() for _ in range(n)]
    B = [dict() for _ in range(n)]
    Sarr = {}
    for d in Ds:
        Sarr[d] = _strengths(song, ks, d, F["groove"])

    for i, s in enumerate(syls):
        T = s.weight
        last = i == n - 1
        for d in Ds:
            if d < mind[i] and not last:
                continue
            if last and d < 2:
                continue
            if not last and d > max(16, int(target[i] * 3)):
                continue
            st = Sarr[d]
            u = np.zeros(K)
            # stress against strength
            u += (3.2 if T >= 0.5 else 1.4) * np.maximum(0, T - st) ** 2
            u += 0.9 * np.maximum(0, st - T - 0.55) ** 2
            # duration against what the syllable wants
            u += (0.9 if not last else 0.5) * (np.log2(d) - np.log2(target[i])) ** 2
            u += ALLOWED_D.get(d, 1.0) * 0.6
            # odd 16ths, unless the groove pushes there or it is light and fast
            relief = 0.6 * np.array([min(1, song.push[k]) if 0 <= k < len(song.push) else 0 for k in ks])
            if line.lock and line.lock_amt > 0:
                relief = np.maximum(relief, lock * min(1.0, 1.5 * line.lock_amt))
            u += oddpen * (0.5 + T) * (1 - relief)
            # long notes on close vowels or on light little words
            if d * step_s > 0.45 and s.vclass == "close" and not last:
                u += 0.6
            if d >= 6 and T < 0.3 and not last and not (s.last and pauses[s.wi]):
                u += 0.5
            # groove: borrow (or dodge) the lock layer's onsets
            if line.lock:
                u -= line.lock_amt * (0.35 + 0.65 * max(T, 0.3)) * lock
            # window: a note may not run past the end of the window
            over = (ks + d) > S1 + (0 if not last else 0)
            u = np.where(over, INF, u)
            if last:
                # the line's last note: on a strong position, held
                u += 0.7 * np.maximum(0, hold_steps - d) / max(hold_steps, 1)
                if line.ending in ("fall", "hold"):
                    u += 0.6 * np.maximum(0, 0.7 - st)
            if i == 0:
                # start near the window's start; an upbeat only for light syllables
                u += 0.04 * np.abs(ks - S0) + np.where(ks < S0, 0.4 * T, 0.0)
                V[0][d] = u
                B[0][d] = None
                continue
            best = np.full(K, INF)
            arg = np.zeros((K, 2), dtype=int)
            for dp, vprev in V[i - 1].items():
                if dp > K:
                    continue
                # previous syllable at k - dp
                prev = np.full(K, INF)
                prev[dp:] = vprev[:K - dp]
                if not np.isfinite(prev).any():
                    continue
                sp = np.full(K, 0.0)
                sp[dp:] = Sarr[dp][:K - dp]
                Tp = syls[i - 1].weight
                pair = np.zeros(K)
                if abs(T - Tp) >= 0.45:
                    wrong = np.sign(T - Tp) != np.sign(st - sp)
                    pair += np.where(wrong & (np.abs(st - sp) > 0.04), 2.2 * (0.3 + np.abs(st - sp)), 0.0)
                # a typewriter: the same short value again and again
                if d == dp and d <= 2 and not last:
                    pair += 0.08
                tot = prev + pair
                better = tot + u < best
                best = np.where(better, tot + u, best)
                arg[better, 0] = dp
            V[i][d] = best
            B[i][d] = arg[:, 0].copy()
    # pick the best final state
    bd, bk, bv = None, None, INF
    for d, arr in V[n - 1].items():
        j = int(np.argmin(arr))
        if arr[j] < bv:
            bv, bd, bk = arr[j], d, j
    if bd is None or bv >= INF / 2:
        raise ValueError(f"cannot fit '{line.text}' ({n} syllables) into {line.bars} bars at bar {line.bar}")
    # backtrack
    ds, kidx = [bd], [bk]
    for i in range(n - 1, 0, -1):
        dp = int(B[i][ds[-1]][kidx[-1]])
        kidx.append(kidx[-1] - dp)
        ds.append(dp)
    ds.reverse()
    kidx.reverse()
    notes = []
    for i, s in enumerate(syls):
        k = int(ks[kidx[i]])
        d = int(ds[i])
        t0 = k * step_s
        rest = 0
        if s.last and pauses[s.wi] and i < n - 1 and d >= 3:
            rest = 1 if d < 6 else 2
        t1 = (k + d - rest) * step_s
        notes.append(Note(t0, t1, k, d, syl=s, word=s.wi, strength=float(Sarr[d][kidx[i]])))
    return notes


# ------------------------------------------------------------------ melody
STEP_COST = {0: 0.35, 1: 0.12, 2: 0.0, 3: 0.22, 4: 0.32, 5: 0.5, 6: 2.6, 7: 0.75, 8: 1.3, 9: 1.3,
             10: 2.3, 11: 2.6, 12: 1.5}


def set_melody(song: Song, notes: list[Note], line: Line, ref: list[Note] | None = None,
               prev_pitch: int | None = None) -> list[Note]:
    n = len(notes)
    lo, hi = line.lo, line.hi
    scale = set(song.scale)
    cand = []
    for p in range(lo, hi + 1):
        cand.append(p)
    P = np.array(cand)
    C = len(P)
    beat = song.spb

    # what else is holding a note during each sung note
    others = []
    for x in notes:
        held = song.sounding(x.t0, x.t1, roles=("pad", "harmony", "lead", "hook"))
        dur = max(x.t1 - x.t0, 1e-3)
        others.append([(p % 12, ov / dur) for (_, _, p, ov) in held])
    follow = []
    if line.follow:
        for x in notes:
            follow.append(song.layer_pitch_at(line.follow, x.t0 + 0.01, tol=0.09))

    # intonation target
    center = line.center if line.center is not None else (lo + hi) / 2.0
    pos = np.linspace(0, 1, n) if n > 1 else np.array([0.5])
    if line.shape == "arch":
        base = center + 1.5 - 4.5 * (pos - 0.55) ** 2 * 4 / 1.2
    elif line.shape == "fall":
        base = center + 2.0 - 4.0 * pos
    elif line.shape == "rise":
        base = center - 2.0 + 4.0 * pos
    else:
        base = np.full(n, center)
    weights = np.array([x.syl.weight if x.syl else 0.0 for x in notes])
    tgt = base + 2.0 * (weights - 0.5)
    cands = [i for i in range(int(0.35 * n), max(int(0.85 * n), 1)) if notes[i].syl and notes[i].syl.weight >= 0.5
             and notes[i].syl.vclass != "close"]
    if cands and line.shape == "arch":
        pk = max(cands, key=lambda i: (notes[i].d, notes[i].strength))
        tgt[pk] += 2.5
    if line.ending == "rise" and n >= 2:
        tgt[-1] += 3.0
        tgt[-2] += 1.0
    if line.ending == "fall":
        tgt[-1] -= 1.5

    U = np.zeros((n, C))
    for i, x in enumerate(notes):
        c = song.chord_at(x.t0 + 0.02)
        cp = set(c.pcs) if c else scale
        dur = x.t1 - x.t0
        strong = x.strength >= 0.5 or dur >= 0.95 * beat or i == n - 1
        for j, p in enumerate(P):
            pc = p % 12
            cost = 0.0
            if pc not in scale and pc not in cp:
                cost += 4.0
            if strong:
                if pc not in cp:
                    cost += 1.1 * (0.6 + min(dur / beat, 2.0) / 2)
            elif pc not in cp:
                cost += 0.12
            for opc, frac in others[i]:
                iv = min((pc - opc) % 12, (opc - pc) % 12)
                if iv == 1 and frac >= 0.3:
                    cost += 1.6 * frac * (1.0 if dur > 0.2 else 0.5)
                elif iv == 6 and frac >= 0.5 and strong:
                    cost += 0.4
            cost += 0.06 * (p - tgt[i]) ** 2
            s = x.syl
            if s is not None and s.vclass == "close" and p >= 71 and dur > 0.35:
                cost += 0.9
            if line.follow and follow[i] is not None:
                iv = (p - follow[i]) % 12
                if iv == 0:
                    cost -= line.follow_amt
                elif iv in (3, 4, 8, 9):
                    cost -= 0.5 * line.follow_amt
            if ref is not None and len(ref) == n:
                cost += 0.9 * abs(p - ref[i].midi)
            if i == n - 1:
                rootpc = c.root if c else song.tonic
                third = [q for q in (c.pcs if c else []) if (q - rootpc) % 12 in (3, 4)]
                if line.ending == "fall" and pc not in ({song.tonic, rootpc} | set(third)):
                    cost += 0.6
                if line.ending == "hang" and pc in ({song.tonic} if song.tonic != rootpc else set()):
                    cost += 0.4
            if i == 0 and prev_pitch is not None:
                cost += 0.08 * abs(p - prev_pitch)
            pin = line.pin.get(i if i >= 0 else n + i, line.pin.get(i - n))
            if pin is not None and p != pin:
                cost += 50.0
            U[i, j] = cost

    # transition costs, with gaps (breaths) making leaps cheaper
    def trans(i):
        gap = notes[i].t0 - notes[i - 1].t1
        f = 0.5 if gap > 0.4 * beat else 1.0
        D = np.abs(P[None, :] - P[:, None])
        T = np.vectorize(lambda d: STEP_COST.get(int(d), 6.0))(D) * f
        if line.feel in ("chant", "robot", "speak"):
            T[D == 0] = 0.0
        elif notes[i].syl is not None and notes[i - 1].syl is not None and notes[i].syl.wi != notes[i - 1].syl.wi:
            T[D == 0] = 0.55     # a new word on the same note again: allowed, but it flattens the tune
        # stressed syllable should not drop far below the light one before it
        if notes[i].syl and notes[i - 1].syl and notes[i].syl.weight >= 0.5 and notes[i - 1].syl.weight < 0.5:
            drop = (P[:, None] - P[None, :])  # prev - cur
            T += np.where(drop > 2, 0.25, 0.0)
        return T

    # first-order DP with a second-order fix-up for unresolved leaps
    V = U[0].copy()
    Bk = np.zeros((n, C), dtype=int)
    Vprev_iv = np.zeros(C)  # interval used to reach each state
    for i in range(1, n):
        T = trans(i)
        if line.motif and i < len(line.motif):
            want = line.motif[i] - line.motif[i - 1]
            T = T + 0.8 * np.abs((P[None, :] - P[:, None]) - want)
        tot = V[:, None] + T
        # leap resolution: after a leap of >=5, going on in the same direction costs extra
        moved = P[None, :] - P[:, None]
        same_dir = (np.sign(moved) == np.sign(Vprev_iv)[:, None]) & (np.abs(Vprev_iv)[:, None] >= 5) & (moved != 0)
        tot = tot + np.where(same_dir, 0.7, 0.0)
        Bk[i] = np.argmin(tot, axis=0)
        V = tot[Bk[i], np.arange(C)] + U[i]
        Vprev_iv = P - P[Bk[i]]
    j = int(np.argmin(V))
    path = [j]
    for i in range(n - 1, 0, -1):
        j = int(Bk[i][j])
        path.append(j)
    path.reverse()
    for x, j in zip(notes, path):
        x.midi = int(P[j])
    return notes


# ------------------------------------------------------------------ the whole line
def set_line(song: Song, line: Line, lexicon: dict, refs: dict, prev_pitch: int | None = None) -> list[Note]:
    syls = syllables(line.text, lexicon)
    ref = refs.get(line.same_as) if line.same_as else None
    if ref is not None and len(ref) == len(syls) and all(a.syl.weight == b.weight for a, b in zip(ref, syls)):
        # an exact repeat: same rhythm and tune, moved to this window
        off = int(round(line.bar * 16)) - ref.S0
        notes = [Note(r.t0 + off * song.step_s, r.t1 + off * song.step_s, r.k + off, r.d, r.midi, s, r.flags, s.wi,
                      r.strength) for r, s in zip(ref, syls)]
        notes = set_melody(song, notes, line, ref=ref, prev_pitch=prev_pitch)
    else:
        notes = set_rhythm(song, syls, line)
        notes = set_melody(song, notes, line, prev_pitch=prev_pitch)
    for i, x in enumerate(notes):
        x.flags = line.flags.get(i, x.flags or "")
    if not line.flags.get(len(notes) - 1):
        last = notes[-1]
        if line.feel in ("sing", "hook") and last.t1 - last.t0 > 0.5:
            last.flags = "~" if line.feel == "hook" else ("v" if line.ending == "fall" else "")
    if line.feel == "robot":
        for x in notes:
            x.flags = (x.flags or "") + ("=" if "=" not in (x.flags or "") else "")
    notes = NoteList(notes)
    notes.S0 = int(round(line.bar * 16))
    if line.name:
        refs[line.name] = notes
    return notes


class NoteList(list):
    S0: int = 0
