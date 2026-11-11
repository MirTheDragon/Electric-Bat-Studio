importScripts('esengine.js');
const V = self.VoiceEngine;
self.onmessage = e => {
  const { id, part } = e.data;
  try {
    const out = sing(part);
    self.postMessage({ id, audio: out.audio, sr: out.sr, offset: out.offset }, [out.audio.buffer]);
  } catch (err) {
    self.postMessage({ id, error: String((err && err.message) || err) });
  }
};
function sing(part) {
  const sc = new V.Score(part.tempo, part.key || null);
  for (const w of part.words) {
    const { tokens } = V.parseLyrics(w.text, true);
    const sylls = tokens.filter(t => t !== '_');
    w.notes.forEach((ni, j) => {
      const n = part.notes[ni];
      const syl = j < sylls.length ? sylls[j] : null;
      sc.notes.push({ t0: n.t0, t1: n.t1, midi: n.midi, flags: n.flags || '', syl, velocity: n.vel === undefined ? 0.8 : n.vel, phrase: n.phrase || 0, idx: ni, params: {} });
    });
  }
  sc.notes.sort((a, b) => a.t0 - b.t0);
  let idx = 0, last = null, prevSyl = null;
  for (const n of sc.notes) {
    if (last === null || n.phrase !== last.phrase) { idx = 0; prevSyl = null; }
    n.idx = idx++;
    if (n.syl && prevSyl && !n.flags.includes('h')) V.link(prevSyl, n.syl);
    if (n.syl) prevSyl = n.syl;
    last = n;
  }
  if (!sc.notes.length) throw new Error('Nothing to sing');
  const off = Math.max(0, Math.min(...sc.notes.map(n => n.t0)) - 1.0);
  for (const n of sc.notes) { n.t0 -= off; n.t1 -= off; }
  const bank = V.makeBank(part.bank || 'idol', part.bankOver || {});
  const out = V.render(sc, { style: part.style || 'pop', tune: part.tune || 'off', seed: part.seed || 1, bank, vibScale: part.vib === undefined ? 1 : part.vib, sr: part.sr || 44100 });
  const a = out.audio; let e = 0, n = 0, pk = 0;
  for (let i = 0; i < a.length; i++) { const v = Math.abs(a[i]); if (v > pk) pk = v; if (v > 1e-3) { e += a[i] * a[i]; n++; } }
  const rms = n ? Math.sqrt(e / n) : 1, g = Math.min(0.12 / Math.max(rms, 1e-6), 0.9 / Math.max(pk, 1e-6));
  for (let i = 0; i < a.length; i++) a[i] *= g;
  return { audio: a, sr: out.sr, offset: off };
}
