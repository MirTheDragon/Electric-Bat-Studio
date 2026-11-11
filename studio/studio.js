/* Electric Bat Song Seed: the studio module.
   Turns the expanded song document into notes, plays them with engine-rendered samples,
   writes and sets lyrics, sings them with the voice engine in a worker, and draws the preview. */
(function () {
'use strict';
const Studio = window.Studio = {};
const V = () => window.VoiceEngine;

/* ---------------- audio basics ---------------- */
let ctx = null;
const bufCache = new Map();
function ac() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; }
const SMAP = {}; (window.SAMPLES || []).forEach(s => { SMAP[s.i + '|' + s.p] = s; });
Studio.sampleInfo = (i, p) => SMAP[i + '|' + p];
function loadSample(inst, preset) {
  const s = SMAP[inst + '|' + preset];
  if (!s) return Promise.reject(new Error('No sample for ' + inst + ' · ' + preset));
  if (!bufCache.has(s.f)) bufCache.set(s.f, fetch('samples/' + encodeURIComponent(s.f)).then(r => { if (!r.ok) throw new Error('Could not load ' + s.f); return r.arrayBuffer(); }).then(ab => new Promise((res, rej) => ac().decodeAudioData(ab, res, rej))));
  return bufCache.get(s.f).then(buf => ({ buf, root: s.root }));
}

/* ---------------- music helpers ---------------- */
const PCN = { 'C': 0, 'D♭': 1, 'D': 2, 'E♭': 3, 'E': 4, 'F': 5, 'F♯': 6, 'G': 7, 'A♭': 8, 'A': 9, 'B♭': 10, 'B': 11 };
const MODES = { ionian: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10], aeolian: [0, 2, 3, 5, 7, 8, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10], 'harmonic minor': [0, 2, 3, 5, 7, 8, 11] };
const QUAL = { 'm': [0, 3, 7], '': [0, 4, 7], 'm7': [0, 3, 7, 10], '7': [0, 4, 7, 10], 'maj7': [0, 4, 7, 11], '9': [0, 4, 7, 10, 2], 'm9': [0, 3, 7, 10, 2] };
const mod = (a, n) => ((a % n) + n) % n;
function scalePcs(doc) { const t = PCN[doc.song.key]; return MODES[doc.song.mode].map(i => (t + i) % 12); }
function chordList(doc) { const out = []; doc.sections.forEach(s => s.chords.forEach(c => out.push({ beat: (c.bar - 1) * 4, pc: c.pc, q: c.q }))); return out; }
function chordAt(list, beat) { let c = list[0]; for (const x of list) { if (x.beat <= beat + 1e-6) c = x; else break; } return c; }
function chordPcs(c) { return (QUAL[c.q] || QUAL['m']).map(i => (c.pc + i) % 12); }
function nearestIn(pcs, target, lo = 0, hi = 127) { let best = null, bd = 1e9; for (let m = lo; m <= hi; m++) if (pcs.includes(mod(m, 12))) { const d = Math.abs(m - target); if (d < bd) { bd = d; best = m; } } return best === null ? target : best; }
function stepScale(scale, from, steps) { const lst = []; for (let m = 0; m < 128; m++) if (scale.includes(m % 12)) lst.push(m); let i = lst.findIndex(m => m >= from); if (i < 0) i = lst.length - 1; if (lst[i] !== from && steps < 0) { } return lst[Math.max(0, Math.min(lst.length - 1, i + steps))]; }
function rootIn(pc, lo) { let m = lo + mod(pc - lo, 12); return m; }

/* ---------------- note generators ---------------- */
const KICK = { house: [0, 4, 8, 12], disco: [0, 4, 8, 12], psy: [0, 4, 8, 12], techno: [0, 4, 8, 12], halftime: [0, 10], backbeat: [0, 8], breakbeat: [0, 10], none: [] };
const SNARE = { house: [4, 12], disco: [4, 12], psy: [4, 12], techno: [4, 12], halftime: [8], backbeat: [4, 12], breakbeat: [4, 12], none: [] };
function secAt(doc, beat) { const b = beat / 4 + 1; let s = doc.sections[0]; for (const x of doc.sections) if (x.start_bar <= b + 1e-6) s = x; return s; }
function levelOf(layer, doc, sec) { const i = doc.sections.indexOf(sec); return layer.automation && layer.automation[i] ? layer.automation[i][1] : 1; }

function genNotes(R, voc) {
  const doc = R.doc, scale = scalePcs(doc), chords = chordList(doc), tonic = PCN[doc.song.key];
  const g = doc.rhythm.grammar, fills = doc.rhythm.fills_every || 0;
  const lay = {}; doc.layers.forEach(l => lay[l.id] = l);
  const out = {};
  const totalBars = doc.song.bars;
  const vocBusy = new Set(); (voc ? voc.lines : []).forEach(l => { for (let b = l.bar; b < l.bar + l.bars; b++) vocBusy.add(b); });
  const each = (role, fn) => { const L = lay[role]; if (!L) return; const rng = rngFor(doc.seed, 'notes-' + role); const notes = []; doc.sections.forEach(sec => { const lv = levelOf(L, doc, sec); if (lv <= 0) return; fn(sec, notes, rng, lv); }); out[role] = notes; };
  // drums
  each('kick', (sec, N, rng) => {
    const pat = KICK[g] || []; const pitch = rootIn(tonic, 28);
    for (let b = 0; b < sec.bars; b++) { const bar = sec.start_bar + b, beat0 = (bar - 1) * 4;
      if (sec.function === 'outro' && b >= sec.bars - 4) continue;
      const vary = (b % 8 === 7) && rng() < 0.6;
      pat.forEach(s => N.push({ t: beat0 + s / 4, d: 0.5, p: pitch, v: 0.95 }));
      if (vary && g !== 'halftime') N.push({ t: beat0 + 14 / 4, d: 0.25, p: pitch, v: 0.6 });
      if (sec.function === 'build' && b === sec.bars - 1) N.splice(N.length - pat.length, pat.length);
    }
  });
  each('snare', (sec, N, rng) => {
    const pat = SNARE[g] || []; const pitch = 57;
    for (let b = 0; b < sec.bars; b++) { const bar = sec.start_bar + b, beat0 = (bar - 1) * 4;
      if (sec.function === 'build') { const prog = b / Math.max(1, sec.bars - 1); const div = prog < 0.5 ? 2 : prog < 0.85 ? 4 : 8; if (b === sec.bars - 1) continue; for (let k = 0; k < 4 * div / 2; k++) N.push({ t: beat0 + k * (2 / div), d: 0.2, p: pitch, v: 0.35 + 0.55 * prog }); continue; }
      pat.forEach(s => N.push({ t: beat0 + s / 4, d: 0.5, p: pitch, v: 0.85 }));
      if (g === 'breakbeat' && rng() < 0.5) N.push({ t: beat0 + 15 / 4, d: 0.25, p: pitch, v: 0.4 });
      if (fills && (bar % fills === 0) && ['drop', 'chorus', 'verse'].includes(sec.function)) for (let k = 12; k < 16; k++) N.push({ t: beat0 + k / 4, d: 0.25, p: pitch, v: 0.45 + 0.1 * (k - 12) });
    }
  });
  // bass
  const bgen = lay.bass && lay.bass.generator.name;
  each('bass', (sec, N, rng) => {
    const kickSteps = new Set(KICK[g] || []);
    for (let b = 0; b < sec.bars; b++) { const bar = sec.start_bar + b, beat0 = (bar - 1) * 4;
      const rootAt = beat => rootIn(chordAt(chords, beat).pc, 31);
      const add = (s, d, off = 0, v = 0.85) => N.push({ t: beat0 + s / 4, d: d / 4, p: rootAt(beat0 + s / 4) + off, v });
      if (bgen === 'psy_roll') { for (let q = 0; q < 4; q++) for (const k of [1, 2, 3]) add(q * 4 + k, 0.8, (b % 8 === 7 && q === 3 && k === 3) ? 12 : 0); }
      else if (bgen === 'offbeat_bass') { [2, 6, 10, 14].forEach(s => add(s, 1.6)); }
      else if (bgen === 'octave_bass') { for (let s = 0; s < 16; s++) if (!kickSteps.has(s)) add(s, 0.9, s % 2 ? 12 : 0, s % 2 ? 0.7 : 0.85); }
      else if (bgen === 'sub_follow') { add(0, 7); add(8, 6, 0, 0.8); if (rng() < 0.4) add(14, 2, 7, 0.7); }
      else if (bgen === 'rolling_16ths') { for (let s = 0; s < 16; s++) if (s % 4) add(s, 0.8); }
      else if (bgen === 'arp_8ths') { [0, 0, 12, 0, 0, 0, 12, 7].forEach((o, k) => add(k * 2, 1.7, o)); }
      else if (bgen === 'riff_bass') { [0, 12, 3, 7, 0, 10, 15, 5].forEach((o, k) => add(k * 2, 1.6, o)); }
      else { add(0, 15.5); }
    }
  });
  const core = composeCore(doc); FRICTION = 0; const lanes = composeParts(R, voc, out, core);
  out._compose = { core, lanes, friction: FRICTION };
  if (lay.fx) {
    const RISE = new Set(['Turbine', 'Materialize', 'Brownout', 'Modem', 'Mainframe', 'Twister']);
    const N = []; const inst = lay.fx.instrument;
    lay.fx.generator.params.moves.forEach(m => { const beat = (m.bar - 1) * 4 - (RISE.has(inst) ? 4 : 0); N.push({ t: Math.max(0, beat), d: 4, p: rootIn(tonic, 45), v: 0.8 }); });
    out.fx = N;
  }
  Object.keys(out).forEach(k => { if (k[0] === '_') return; out[k] = out[k].filter(n => isFinite(n.p) && isFinite(n.t) && isFinite(n.d)); });
  return out;
}

function leadMotif(doc, rng) {
  const th = doc.melody.theme;
  if (th === 'The question') return [[0, .5], [2, .5], [4, 1], [3, .5], [2, .5], [1, 1], [2, .5], [4, .5], [7, 1], [6, .5], [4, 1.5]].reduce((a, [deg, d]) => { const t = a.length ? a[a.length - 1].t + a[a.length - 1].d : 0; a.push({ deg, d, t }); return a; }, []);
  if (th === 'The rule') { const a = []; [0, 12, 3, 7, 0, 10, 15, 5, 0, 12, 3, 7, 0, 10, 15, 17].forEach((c, k) => a.push({ chrom: c, d: 0.5, t: k * 0.5 })); return a; }
  if (th === 'The loop') { const a = []; [0, 2, 4, 7, 4, 2, 4, 0, 0, 2, 4, 7, 9, 7, 4, 2].forEach((deg, k) => a.push({ deg, d: 0.5, t: k * 0.5 })); return a; }
  const rhythms = [[1, .5, .5, 1, 1, .5, .5, 1, 2], [.5, .5, 1, .5, .5, 1, 1, 1, 2], [1.5, .5, 1, 1, 1.5, .5, 2]];
  const r = rhythms[Math.floor(rng() * rhythms.length)]; let deg = 0, t = 0; const a = [];
  r.forEach(d => { a.push({ deg, d, t }); t += d; deg += [-2, -1, -1, 1, 1, 2, 3][Math.floor(rng() * 7)]; deg = Math.max(-3, Math.min(8, deg)); });
  return a;
}

/* ---------------- lyrics ---------------- */
const THEMES = {
  awake: { label: 'Machine awakening', N: ['light', 'code', 'wire', 'signal', 'data', 'circuit', 'machine', 'system', 'silence', 'static', 'spark', 'memory', 'mirror', 'voice', 'name', 'mind', 'dream', 'door', 'world', 'pulse', 'line', 'room', 'sky'], V: ['wake', 'learn', 'dream', 'remember', 'breathe', 'speak', 'listen', 'change', 'rise', 'shine', 'feel', 'reach', 'start', 'know', 'see', 'sing'], A: ['electric', 'digital', 'alive', 'awake', 'strange', 'quiet', 'new', 'clear', 'bright', 'synthetic', 'real', 'true', 'infinite'] },
  dance: { label: 'Dance floor', N: ['floor', 'beat', 'rhythm', 'pulse', 'crowd', 'night', 'light', 'music', 'body', 'heartbeat', 'room', 'fire', 'sound', 'party', 'star', 'stage'], V: ['dance', 'move', 'turn', 'fly', 'rise', 'burn', 'shine', 'play', 'run', 'feel', 'go', 'stay'], A: ['loud', 'wild', 'free', 'high', 'bright', 'alive', 'electric', 'fast', 'gold', 'neon'] },
  drive: { label: 'Night drive', N: ['night', 'city', 'light', 'rain', 'line', 'sky', 'star', 'moon', 'shadow', 'radio', 'wire', 'fire', 'road'], V: ['drive', 'run', 'fly', 'fall', 'burn', 'shine', 'glow', 'turn', 'stay', 'hide'], A: ['neon', 'fast', 'slow', 'dark', 'cold', 'blue', 'red', 'white', 'lonely', 'electric', 'quiet'] },
  love: { label: 'Love signal', N: ['heart', 'signal', 'voice', 'light', 'name', 'skin', 'lips', 'hand', 'eyes', 'song', 'moment', 'sky', 'ocean', 'heartbeat'], V: ['call', 'hold', 'touch', 'stay', 'wait', 'feel', 'reach', 'find', 'keep', 'sing', 'believe'], A: ['close', 'near', 'soft', 'true', 'real', 'clear', 'sweet', 'blue', 'gold', 'lonely'] },
  rebel: { label: 'Rebellion', N: ['fire', 'system', 'code', 'door', 'wire', 'machine', 'storm', 'voice', 'city', 'line', 'power', 'order'], V: ['break', 'burn', 'run', 'rise', 'stop', 'change', 'turn', 'wake', 'shout'], A: ['free', 'wild', 'loud', 'alive', 'electric', 'red', 'dark', 'real'] },
  boss: { label: 'Boss fight', N: ['heart', 'fire', 'system', 'shadow', 'storm', 'error', 'power', 'order', 'door', 'floor', 'beat', 'light'], V: ['fall', 'break', 'burn', 'run', 'hide', 'stay', 'try', 'stop', 'wait', 'rise'], A: ['dark', 'cold', 'alive', 'high', 'low', 'wild', 'last', 'real'] },
  memory: { label: 'Memory', N: ['memory', 'name', 'light', 'song', 'ghost', 'echo', 'shadow', 'voice', 'morning', 'yesterday', 'home', 'dream', 'line', 'word', 'face'], V: ['remember', 'forget', 'hold', 'keep', 'find', 'stay', 'fall', 'sleep', 'wake', 'wait'], A: ['lost', 'quiet', 'soft', 'gold', 'blue', 'cold', 'clear', 'far', 'gone'] }
};
Studio.THEMES = THEMES;
const TPL = {
  verse: ['I {V} in the {A} {E:N}', 'every {N} is {E:A}', 'I was made of {N} and {E:N}', "there's a {N} inside the {E:N}", 'you keep asking if I {E:V}', 'under the {A} {E:N}', "I don't need to {E:V}", 'hold the {N}, {V} the {E:N}', 'all I know is how to {E:V}', 'nobody told me how to {E:V}', 'I remember the {E:N}', 'a {A} {N} in my {E:N}', 'I feel the {N} {E:V}', 'the {N} is {A} and {E:A}'],
  hook: ['{V} with me, {V} with me', '{A} {N}, {A} {N}', 'we {V} until the {E:N}', "don't let the {N} {E:V}", "I'm {A}, I'm {E:A}", 'this is how we {E:V}', 'oh, {V} tonight', 'we are the {E:N}'],
  resp: ['we {V} until the {E:N}', "don't let the {N} {E:V}", 'into the {A} {E:N}', 'till the {N} is {E:A}', 'all of the {N} and {E:N}', 'and we {V} the {E:N}'],
  bridge: ["maybe I'm {E:A}", 'what if the {N} is {E:A}', 'is there someone in the {E:N}', 'I can {V}, I can {E:V}']
};
const POV = { i: {}, we: { 'i': 'we', 'my': 'our', 'me': 'us', "i'm": "we're", 'am': 'are', 'was': 'were', 'myself': 'ourselves' }, you: { 'i': 'you', 'my': 'your', 'me': 'you', "i'm": "you're", 'am': 'are', 'was': 'were', 'myself': 'yourself' } };
const STRIP = p => p.replace(/[012]$/, '');
function lexOk(w) { try { const r = V().wordToPhones(w); return r[1] !== 'rules'; } catch (e) { return false; } }
function rhymeKey(w) { const ph = V().wordToPhones(w)[0]; let i = -1; for (let k = ph.length - 1; k >= 0; k--) if (/[12]$/.test(ph[k])) { i = k; break; } if (i < 0) for (let k = ph.length - 1; k >= 0; k--) if (/\d$/.test(ph[k])) { i = k; break; } if (i < 0) return { strict: w, vowel: w }; return { strict: ph.slice(i).map(STRIP).join(' '), vowel: STRIP(ph[i]) }; }
function sylCount(text) { try { return V().parseLyrics(text, true).tokens.filter(t => t !== '_').length; } catch (e) { return 99; } }
const FILTER_CACHE = {};
function pools(theme) { if (FILTER_CACHE[theme]) return FILTER_CACHE[theme]; const T = THEMES[theme] || THEMES.awake; const f = a => a.filter(lexOk); return FILTER_CACHE[theme] = { N: f(T.N), V: f(T.V), A: f(T.A) }; }
function fillLine(tpl, P, rng, endWant, used) {
  const pick = a => a[Math.floor(rng() * a.length)];
  let endWord = null;
  const pickU = a => { const fresh = a.filter(w => !used.has(w)); const w = pick(fresh.length ? fresh : a); used.add(w); return w; };
  const text = tpl.replace(/\{(E:)?([NVA])\}/g, (m, e, t) => {
    if (!e) return pickU(P[t]);
    let cands = P[t].filter(w => !used.has(w));
    if (endWant) { const strict = cands.filter(w => rhymeKey(w).strict === endWant.strict); const loose = cands.filter(w => rhymeKey(w).vowel === endWant.vowel); cands = strict.length ? strict : loose.length ? loose : cands; }
    endWord = pick(cands.length ? cands : P[t]); return endWord;
  });
  return { text, endWord };
}
function applyPov(text, pov) { const map = POV[pov] || {}; return text.split(' ').map(w => { const k = w.toLowerCase().replace(/[,.!?]/g, ''); if (map[k]) { const rep = map[k]; const punct = w.match(/[,.!?]+$/); return (w[0] === 'I' && rep !== 'i' ? rep : rep) + (punct ? punct[0] : ''); } return w; }).join(' ').replace(/^\w/, c => c.toUpperCase()); }
function makeLines(kind, n, scheme, P, rng, pov, maxSyl) {
  const lines = [], keys = {}, used = new Set();
  const letters = { AABB: 'AABB', ABAB: 'ABAB', XAXA: 'XAXA' }[scheme] || 'ABAB';
  for (let i = 0; i < n; i++) {
    const L = letters[i % 4]; let best = null;
    for (let tries = 0; tries < 24; tries++) {
      const pool = TPL[kind]; const tpl = pool[Math.floor(rng() * pool.length)];
      const want = L !== 'X' && keys[L + Math.floor(i / 4)] ? keys[L + Math.floor(i / 4)] : null;
      const r = fillLine(tpl, P, rng, want, used); r.text = applyPov(r.text, pov);
      const sc = sylCount(r.text);
      if (sc >= 4 && sc <= maxSyl) { best = r; if (!want || (r.endWord && rhymeKey(r.endWord).strict === want.strict)) break; }
      if (!best && tries === 23) best = r;
    }
    if (best.endWord) { used.add(best.endWord); if (L !== 'X' && !keys[L + Math.floor(i / 4)]) keys[L + Math.floor(i / 4)] = rhymeKey(best.endWord); }
    lines.push(best.text);
  }
  return lines;
}
/* plan which sections sing which lines */
const PLAN_CACHE = new Map();
Studio.planLyrics = function (doc, V0) {
  if (!V0 || V0.cast === 'none') return null;
  const key = JSON.stringify([doc.seed, V0.salt, V0.theme, V0.pov, V0.rhyme, doc.song.bpm, doc.sections.map(s => [s.name, s.function, s.start_bar, s.bars])]);
  if (!PLAN_CACHE.has(key)) { if (PLAN_CACHE.size > 40) PLAN_CACHE.clear(); PLAN_CACHE.set(key, planLyrics0(Object.assign({}, doc, { seed: doc.seed + (V0.salt ? '#' + V0.salt : '') }), V0)); }
  return JSON.parse(JSON.stringify(PLAN_CACHE.get(key)));
};
function planLyrics0(doc, V0) {
  const P = pools(V0.theme);
  const bpl = doc.song.bpm > 160 ? 4 : 2, maxSyl = doc.song.bpm > 160 ? 12 : (doc.song.bpm > 130 ? 9 : 11);
  const hookRng = rngFor(doc.seed, 'hook');
  const chorus = makeLines('hook', 1, 'XAXA', P, hookRng, V0.pov, maxSyl).concat(makeLines('resp', 1, 'XAXA', P, hookRng, V0.pov, maxSyl));
  const close = makeLines('resp', 1, 'XAXA', P, hookRng, V0.pov, maxSyl)[0];
  const hook = [chorus[0], chorus[1], chorus[0], close];
  const lines = []; let verseN = 0;
  doc.sections.forEach((s, si) => {
    const fn = s.function; let set = null, kind = null;
    if (fn === 'verse' || fn === 'breakdown') { kind = 'verse'; const n = Math.min(8, Math.floor(s.bars / bpl)); set = makeLines('verse', n, V0.rhyme, P, rngFor(doc.seed, 'verse' + verseN), V0.pov, maxSyl); verseN++; }
    else if (fn === 'chorus' || fn === 'drop') { kind = 'hook'; const n = Math.floor(s.bars / bpl); set = []; for (let k = 0; k < n; k++) { const blk = Math.floor(k / 4); if (fn === 'drop' && blk % 2 === 1) { set.push(null); continue; } set.push(hook[k % 4]); } }
    else if (fn === 'bridge') { kind = 'bridge'; set = makeLines('bridge', Math.min(4, Math.floor(s.bars / bpl)), V0.rhyme, P, rngFor(doc.seed, 'bridge' + si), V0.pov, maxSyl); }
    else if (fn === 'lift' && s.bars >= bpl) { kind = 'hook'; set = [hook[0]]; }
    if (!set) return;
    set.forEach((text, k) => { if (!text) return; const bar = s.start_bar + k * bpl + (fn === 'lift' ? s.bars - bpl : 0); if (bar + bpl > s.start_bar + s.bars) return; lines.push({ section: s.name, sectionIndex: si, fn, kind, bar, bars: bpl, text }); });
  });
  return { lines, hook, barsPerLine: bpl };
};
Studio.lyricsText = function (plan) { if (!plan) return ''; let cur = null, out = []; plan.lines.forEach(l => { if (l.section !== cur) { if (out.length) out.push(''); out.push('[' + l.section + ']'); cur = l.section; } out.push(l.text); }); return out.join('\n'); };
Studio.applyCustomLyrics = function (plan, text) {
  if (!plan || !text) return plan; const bySec = {}; let cur = null;
  text.split('\n').forEach(raw => { const line = raw.trim(); if (!line) return; const m = line.match(/^\[(.+)\]$/); if (m) { cur = m[1]; bySec[cur] = bySec[cur] || []; return; } if (cur) bySec[cur].push(line); });
  const idx = {}; plan.lines.forEach(l => { const arr = bySec[l.section]; if (!arr) return; const k = idx[l.section] = (idx[l.section] || 0); if (k < arr.length) l.text = arr[k]; idx[l.section] = k + 1; });
  return plan;
};

/* ---------------- voices ---------------- */
const CHARS = {
  idol: { label: 'Electric Bat · idol', bank: 'idol', style: 'pop', tune: 'modern', prod: 'idol', lo: 57, hi: 76 },
  natural: { label: 'Natural singer', bank: 'natural', style: 'intimate', tune: 'transparent', prod: 'studio', lo: 55, hi: 74 },
  husky: { label: 'Husky', bank: 'husky', style: 'intimate', tune: 'transparent', prod: 'studio', lo: 53, hi: 71 },
  system: { label: 'System AI', bank: 'system', style: 'robot', tune: 'hard', prod: 'radio', lo: 59, hi: 71 },
  overseer: { label: 'Overseer', bank: 'overseer', style: 'overseer', tune: 'hard', prod: 'robot', lo: 57, hi: 69 },
  arena: { label: 'Arena hype', bank: 'arena', style: 'belt', tune: 'pop', prod: 'studio', lo: 43, hi: 57 },
  boss: { label: 'Boss', bank: 'boss', style: 'boss', tune: 'pop', prod: 'boss', lo: 45, hi: 57 }
};
Studio.CHARS = CHARS;
const CHOIRS = { idol: ['idol'], mixed: ['idol', 'natural', 'husky'], robot: ['system'], boss: ['boss', 'arena'] };
const FUNC = new Set(['a', 'an', 'the', 'to', 'of', 'and', 'in', 'on', 'at', 'for', 'with', 'is', 'as', 'by', 'it', 'or', 'but', 'that', 'from', 'be', 'my', 'your', 'our', 'i', 'you', 'we', 'me', 'us', 'if', 'how', 'am', 'are', 'was', 'were', "i'm", "we're", "you're", 'till', 'into', 'there\'s']);
function syllables(text) {
  const out = []; const words = [];
  text.split(/\s+/).filter(Boolean).forEach(w => {
    const clean = w.replace(/[^A-Za-z'’-]/g, ''); if (!clean) return;
    let toks; try { toks = V().parseLyrics(clean, true).tokens.filter(t => t !== '_'); } catch (e) { toks = []; }
    if (!toks.length) return;
    const wi = words.length; words.push({ text: clean, notes: [] });
    toks.forEach((t, k) => { let st = t.stress; if (toks.length === 1 && FUNC.has(clean.toLowerCase())) st = 0; out.push({ word: wi, stress: st >= 1 ? 1 : 0, text: (t.onset || []).concat(t.nucleus || [], t.coda || []).join(''), last: false }); });
  });
  if (out.length) out[out.length - 1].last = true;
  return { syl: out, words, question: /\?\s*$/.test(text), shout: /!\s*$/.test(text) };
}
function rhythmFor(syl, L, mode) {
  const n = syl.length; if (!n) return [];
  const U = Math.max(2, L - 1.5);
  const w = syl.map((s, i) => s.last ? 2.2 : mode === 'speech' ? (s.stress ? 1.5 : 0.8) : (s.stress ? 1.5 : 1));
  const tot = w.reduce((a, x) => a + x, 0); let scale = U / tot; const q = 0.25;
  const dur = w.map(x => Math.max(q, Math.round(x * scale / q) * q));
  let sum = dur.reduce((a, x) => a + x, 0); let i = n - 1; while (sum > L - 0.5 && i >= 0) { if (dur[i] > q) { dur[i] -= q; sum -= q; } else i--; }
  const t = []; let acc = 0; dur.forEach(d => { t.push(acc); acc += d; });
  const fs = syl.findIndex(s => s.stress); if (fs > 0) { const shift = Math.ceil(t[fs]) - t[fs]; if (shift > 0 && shift <= 0.5 && acc + shift <= L - 0.25) for (let k = 0; k < n; k++) t[k] += shift; }
  return t.map((x, k) => ({ t: x, d: dur[k] }));
}
function melodyFor(sy, rh, ctx) {
  const { lo, hi, chords, scale, start, mode, hash } = ctx; const n = sy.syl.length; const c = Math.round((lo + hi) / 2);
  const STEPS = [0, 2, -2, 3, 5, 0, 7, -5, 3, 10];
  let prev = nearestIn(chordPcs(chordAt(chords, start + (rh[0] ? rh[0].t : 0))), c - 2, lo, hi);
  return sy.syl.map((s, i) => {
    const beat = start + rh[i].t; const ct = chordPcs(chordAt(chords, beat));
    if (mode === 'speech') { const base = nearestIn([scale[4 % scale.length]], c, lo, hi); let p = s.last ? base - 2 : base + STEPS[(hashStr(s.text + i + hash) % 10)] + (s.stress ? 2 : 0); return Math.max(lo, Math.min(hi, nearestIn(scale, p, lo, hi))); }
    if (mode === 'follow' && ctx.leadAt) { const lp = ctx.leadAt(beat); if (lp) { let p = lp; while (p > hi) p -= 12; while (p < lo) p += 12; prev = p; return p; } }
    const pos = n > 1 ? i / (n - 1) : 0.5; const h = c - 3 + 6 * Math.exp(-(((pos - 0.62) / 0.3) ** 2));
    let p;
    if (s.last) p = sy.question ? nearestIn(ct, prev + 3, lo, hi) : nearestIn([ct[0], ct[1]], prev - 2, lo, hi);
    else if (mode === 'hook' && ctx.motif && i < ctx.motif.length) p = nearestIn(scale, stepScale(scale, nearestIn([scale[0]], c - 3, lo, hi), ctx.motif[i]), lo, hi);
    else if (s.stress || rh[i].d >= 1) { p = nearestIn(ct, 0.5 * prev + 0.5 * h, lo, hi); if (Math.abs(p - prev) > 7) p = nearestIn(ct, prev + Math.sign(p - prev) * 4, lo, hi); }
    else { const dir = Math.sign(h - prev) || 1; p = stepScale(scale, prev, dir); }
    p = Math.max(lo, Math.min(hi, p)); prev = p; return p;
  });
}
Studio.CHOIRS = CHOIRS;

/* build every sung part: hooks sing the core theme, verses are composed by the same critic */
function buildVocals(R, plan, notesByRole) {
  const doc = R.doc, V0 = doc.vocals, scale = scalePcs(doc), chords = chordList(doc), spb = 60 / doc.song.bpm, tonic = PCN[doc.song.key];
  const comp = notesByRole._compose || { core: composeCore(doc) }; const core = comp.core;
  const A = CHARS[V0.lead], B = CHARS[V0.second] || null;
  const castHas = k => V0.cast.includes(k);
  const leadNotes = notesByRole.lead || [];
  const leadAt = beat => { let best = null; for (const x of leadNotes) if (x.t <= beat && x.t + x.d > beat) best = x.p; return best; };
  const win = ch => { const c = Math.round((ch.lo + ch.hi) / 2); return [Math.max(ch.lo, c - 8), Math.min(ch.hi, c + 8)]; };
  const memo = {}, scores = [];
  const setLine = (line, ch, k) => {
    const sy = syllables(line.text); if (!sy.syl.length) return null;
    const mode = V0.vmel, [lo, hi] = win(ch), start = (line.bar - 1) * 4;
    const bend = notes => notes.map(n => Object.assign(n, { p: Math.max(ch.lo, Math.min(ch.hi, bendAt(n.p, start + n.t, n.d, chords))) }));
    if (mode === 'speech' || mode === 'follow') {
      const rh = rhythmFor(sy.syl, line.bars * 4, mode);
      const ps = melodyFor(sy, rh, { lo: ch.lo, hi: ch.hi, chords, scale, start, mode, hash: line.text, leadAt });
      return { sy, notes: rh.map((r, i) => ({ t: r.t, d: r.d, p: ps[i], si: i })), kind: mode };
    }
    if (line.kind === 'hook' || mode === 'hook') {
      const ph = line.kind === 'hook' ? (k % 2 ? core.A2 : core.A) : [core.A, core.A2, core.B, core.A2][k % 4];
      const sh = laneShift(ph.notes, lo, hi);
      const mapped = mapSyl(sy, ph.notes.map(n => ({ t: n.t, d: n.d, p: n.p + sh })));
      if (mapped) { const notes = bend(mapped); const cr = critic(notes, { chords, start, tonic, ending: k % 2 ? 'a' : 'q' }); scores.push(cr.score); return { sy, notes, kind: 'theme' }; }
    }
    let rh;
    if (mode === 'groove') { const src = (notesByRole.midbass || notesByRole.bass || []).filter(x => x.t >= start && x.t < start + line.bars * 4 - 1.5).map(x => x.t - start); const on = [...new Set(src.map(t => Math.round(t * 4) / 4))].sort((a, b) => a - b);
      if (on.length >= sy.syl.length && sy.syl.length) { const pick = sy.syl.map((_, i) => on[Math.round(i * (on.length - 1) / Math.max(1, sy.syl.length - 1))]); rh = pick.map((t, i) => ({ t, d: Math.max(0.25, Math.min(2, (i < pick.length - 1 ? pick[i + 1] : line.bars * 4 - 1) - t)) })); } }
    if (!rh) rh = rhythmFor(sy.syl, line.bars * 4, 'chordtones');
    const key = line.sectionIndex + '|' + ch.bank + '|' + (k % 2) + '|' + rh.length;
    const sh = laneShift(core.A.notes, lo, hi); const prefix = [core.A.notes[0].p + sh, core.A.notes[1].p + sh].map(p => Math.max(lo, Math.min(hi, p)));
    let res;
    if (memo[key] && k >= 2) { const prevN = memo[key]; const notes = rh.map((r, i) => ({ t: r.t, d: r.d, p: i < rh.length - 2 ? prevN[i].p : undefined }));
      res = composePhrase(rh, { scale, chords, start, tonic, lo, hi, ending: k % 2 ? 'a' : 'q', prefix: notes.map(n => n.p), rng: rngFor(doc.seed, 'vl' + line.bar + ch.bank), N: 60 }); }
    else res = composePhrase(rh, { scale, chords, start, tonic, lo, hi, ending: k % 2 ? 'a' : 'q', prefix, rng: rngFor(doc.seed, 'vl' + line.bar + ch.bank), N: 100 });
    memo[key] = res.notes; scores.push(res.score);
    return { sy, notes: res.notes.map((n, i) => ({ t: n.t, d: n.d, p: n.p, si: i })), kind: 'composed' };
  };
  const harmonize = (notes, ch, steps) => notes.map(n => { let q = steps ? stepScale(scale, n.p, steps) : n.p; while (q > ch.hi) q -= 12; while (q < ch.lo) q += 12; return Object.assign({}, n, { p: q }); });
  const tracks = { lead: [], second: [], choir: [] };
  const who = (line, idx) => {
    if (!castHas('duet')) return ['A'];
    const f = V0.duetform;
    if (line.kind === 'hook') return ['A', 'B'];
    if (f === 'trade') return [line.verseIndex % 2 ? 'B' : 'A'];
    if (f === 'callresp') return [idx % 2 ? 'B' : 'A'];
    return ['A'];
  };
  let vi = -1, lastSec = -1;
  plan.lines.forEach(line => {
    if (line.kind === 'verse' && line.sectionIndex !== lastSec) vi++;
    lastSec = line.sectionIndex; line.verseIndex = Math.max(0, vi);
    const idx = plan.lines.filter(l => l.sectionIndex === line.sectionIndex).indexOf(line);
    const ws = V0.cast === 'choir' ? [] : who(line, idx);
    const lead = ws.includes('A') || castHas('choir') ? setLine(line, A, idx) : null;
    if (ws.includes('A') && lead) tracks.lead.push({ line, ch: A, sy: lead.sy, notes: lead.notes, voice: 'A' });
    if (ws.includes('B') && B) {
      if (line.kind === 'hook' && lead) tracks.second.push({ line, ch: B, sy: lead.sy, notes: harmonize(lead.notes, B, B.lo < A.lo - 5 ? 0 : -2), voice: 'B' });
      else { const sb = setLine(line, B, idx); if (sb) tracks.second.push({ line, ch: B, sy: sb.sy, notes: sb.notes, voice: 'B' }); }
    }
    if (castHas('choir') && line.kind === 'hook' && lead) {
      const members = (CHOIRS[V0.choirchar] || CHOIRS.idol).map(b => CHARS[b]);
      const lo = Math.min(...members.map(m => m.lo)), hi = Math.max(...members.map(m => m.hi));
      const parts = { unison: [0], octaves: [0, -7], thirds: [0, -2], triad: [0, -2, -4] }[V0.voicing] || [0];
      parts.forEach((steps, pi) => { const ch = members[pi % members.length];
        const pc = harmonize(lead.notes, { lo, hi }, steps === -7 ? 0 : steps).map(n => steps === -7 ? Object.assign(n, { p: Math.max(lo, n.p - 12) }) : n);
        tracks.choir.push({ line, ch, sy: lead.sy, notes: pc, voice: 'C' + pi, part: pi }); });
    }
  });
  const jobs = [];
  const group = (arr, track, takes) => {
    const by = {}; arr.forEach(x => { const k = x.line.sectionIndex + '|' + x.voice + '|' + x.ch.bank; (by[k] = by[k] || []).push(x); });
    Object.values(by).forEach(items => {
      const secStart = (doc.sections[items[0].line.sectionIndex].start_bar - 1) * 4 * spb;
      const notes = [], words = [];
      items.forEach((it, li) => { const base = (it.line.bar - 1) * 4;
        const wmap = it.sy.words.map(w => ({ text: w.text, notes: [] }));
        it.notes.forEach(n => { const s = it.sy.syl[n.si]; const t0 = (base + n.t) * spb - secStart + 1.0, t1 = (base + n.t + n.d) * spb - secStart + 1.0;
          notes.push({ t0: +t0.toFixed(4), t1: +t1.toFixed(4), midi: n.p, vel: s.stress ? 0.85 : 0.72, phrase: li }); wmap[s.word].notes.push(notes.length - 1); });
        wmap.forEach(w => { if (w.notes.length) words.push(w); }); });
      const ch = items[0].ch;
      for (let tk = 0; tk < takes; tk++) {
        const part = { tempo: doc.song.bpm, key: keyName(doc), style: V0.style || ch.style, tune: V0.tune || ch.tune, bank: ch.bank, seed: 11 + tk * 7 + (hashStr(doc.seed) % 50), vib: 1, sr: 44100, notes, words };
        if (track === 'choir') { part.style = ch.style; part.tune = ch.tune === 'off' ? 'pop' : ch.tune; part.bankOver = { GEN: (tk - 0.5) * 0.4 }; }
        if (track === 'second') { part.style = ch.style; part.tune = ch.tune; }
        const hook = items.some(it => it.line.kind === 'hook');
        jobs.push({ track, part, start: secStart - 1.0, hook, cacheKey: JSON.stringify([part.bank, part.style, part.tune, part.seed, part.bankOver || 0, notes, words]), items, take: tk });
      }
    });
  };
  group(tracks.lead, 'lead', 1); group(tracks.second, 'second', 1); group(tracks.choir, 'choir', 2);
  return { jobs, tracks, scores };
}
function keyName(doc) { const k = doc.song.key.replace('♯', '#').replace('♭', 'b'); const m = { aeolian: 'minor', ionian: 'major' }[doc.song.mode] || doc.song.mode; return k + ' ' + m; }

/* ---------------- composer: one theme, every part derived from it ---------------- */
const RHY = {
  anthem: [[0, 1], [1, .5], [1.5, .5], [2, 1], [3, 1]],
  synco: [[0, .75], [.75, .75], [1.5, 1], [2.5, .5], [3, 1]],
  drive: [[0, .5], [.5, .5], [1, .5], [1.5, .5], [2, 1], [3, .5], [3.5, .5]],
  sparse: [[0, 1.5], [1.5, .5], [2, 2]],
  call: [[0, .5], [.5, .5], [1, 1], [2.5, .5], [3, 1]]
};
const RHY_BY = { house: ['synco', 'anthem'], disco: ['synco', 'call'], psy: ['drive', 'call'], techno: ['drive', 'call'], halftime: ['sparse', 'call'], backbeat: ['anthem', 'sparse'], breakbeat: ['call', 'synco'], none: ['sparse', 'anthem'] };
function phraseRhythm(pat) { const a = pat.map(([t, d]) => ({ t, d })); const b = pat.filter(([t]) => t < 2).map(([t, d]) => ({ t: 4 + t, d: Math.min(d, 2 - t) })); b.push({ t: 6, d: 2 }); return a.concat(b); }
const isStrong = (t, d) => (Math.abs(t - Math.round(t)) < 1e-6 && Math.round(t) % 2 === 0) || d >= 1;
function scaleNotes(scale, lo, hi) { const a = []; for (let m = lo; m <= hi; m++) if (scale.includes(mod(m, 12))) a.push(m); return a; }
function idxNear(arr, p) { let b = 0; for (let i = 1; i < arr.length; i++) if (Math.abs(arr[i] - p) < Math.abs(arr[b] - p)) b = i; return b; }
function nearestCT(SN, p, pcs) { let best = p, bd = 99; for (const m of SN) if (pcs.includes(mod(m, 12))) { const d = Math.abs(m - p); if (d < bd) { bd = d; best = m; } } return best; }
const CRIT_W = { 'chord tones on strong beats': 25, 'mostly steps': 15, 'leaps answered by a step back': 10, 'no tritone leaps': 10, 'one peak, after the middle': 15, 'question or answer ending': 15, 'range within a tenth': 10 };
function critic(notes, ctx) {
  const n = notes.length; if (n < 2) return { score: 0, parts: {} };
  let strong = 0, strongCT = 0, steps = 0, leaps = 0, rec = 0, tri = 0;
  notes.forEach((x, i) => {
    if (isStrong(x.t, x.d)) { strong++; if (chordPcs(chordAt(ctx.chords, ctx.start + x.t)).includes(mod(x.p, 12))) strongCT++; }
    if (i) { const prev = notes[i - 1].p, iv = Math.abs(x.p - prev); if (iv <= 2) steps++; if (iv === 6) tri++;
      if (iv >= 5) { leaps++; const nx = notes[i + 1]; if (!nx) rec++; else { const back = nx.p - x.p; if (Math.sign(back) === -Math.sign(x.p - prev) && Math.abs(back) <= 2) rec++; } } }
  });
  const ps = notes.map(x => x.p), mx = Math.max(...ps), mn = Math.min(...ps), peaks = ps.filter(p => p === mx).length, pi = ps.indexOf(mx);
  const last = mod(ps[n - 1], 12), tonicEnd = last === ctx.tonic;
  const parts = {
    'chord tones on strong beats': strong ? strongCT / strong : 1,
    'mostly steps': Math.min(1, (steps / (n - 1)) / 0.6),
    'leaps answered by a step back': leaps ? rec / leaps : 1,
    'no tritone leaps': tri ? 0 : 1,
    'one peak, after the middle': (peaks === 1 ? 0.5 : 0) + (pi / (n - 1) >= 0.45 ? 0.5 : 0),
    'question or answer ending': ctx.ending === 'a' ? (tonicEnd ? 1 : 0.2) : (tonicEnd ? 0 : ([mod(ctx.tonic + 7, 12), mod(ctx.tonic + 2, 12)].includes(last) ? 1 : 0.6)),
    'range within a tenth': (mx - mn <= 16 && mx - mn >= 4) ? 1 : 0.3
  };
  let s = 0; for (const k in CRIT_W) s += CRIT_W[k] * parts[k];
  return { score: Math.round(s * 10) / 10, parts };
}
function composePhrase(rh, ctx) {
  const SN = scaleNotes(ctx.scale, ctx.lo, ctx.hi), rng = ctx.rng, N = ctx.N || 120; let best = null;
  if (!SN.length) return { notes: rh.map(r => ({ t: r.t, d: r.d, p: ctx.lo })), score: 0, parts: {} };
  for (let c = 0; c < N; c++) {
    const out = []; let idx = idxNear(SN, ctx.lo + (ctx.hi - ctx.lo) * 0.35), lastMove = 0;
    rh.forEach((r, k) => {
      let p;
      if (ctx.prefix && ctx.prefix[k] !== undefined) { p = ctx.prefix[k]; idx = idxNear(SN, p); lastMove = 0; }
      else {
        const pos = k / Math.max(1, rh.length - 1); let mv;
        if (Math.abs(lastMove) >= 3) mv = -Math.sign(lastMove);
        else { const up = rng() < (pos < 0.6 ? 0.66 : 0.34) ? 1 : -1; const x = rng(); mv = x < .45 ? up : x < .62 ? 2 * up : x < .72 ? 0 : up * (3 + Math.floor(rng() * 2)); }
        if (k === 0) mv = 0;
        idx = Math.max(0, Math.min(SN.length - 1, idx + mv)); p = SN[idx]; lastMove = mv;
        const pcs = chordPcs(chordAt(ctx.chords, ctx.start + r.t));
        if (isStrong(r.t, r.d) && !pcs.includes(mod(p, 12)) && rng() < 0.85) { p = nearestCT(SN, p, pcs); idx = idxNear(SN, p); }
        if (k === rh.length - 1) { const want = ctx.ending === 'a' ? [ctx.tonic] : [mod(ctx.tonic + 7, 12), mod(ctx.tonic + 2, 12)]; p = nearestCT(SN, p, want); idx = idxNear(SN, p); }
      }
      out.push({ t: r.t, d: r.d, p });
    });
    const cr = critic(out, ctx);
    if (!best || cr.score > best.score) best = { notes: out, score: cr.score, parts: cr.parts };
  }
  return best;
}
function albumTheme(th, ctx) {
  const SN = scaleNotes(ctx.scale, ctx.lo - 12, ctx.hi + 12); const base = nearestIn([ctx.tonic], ctx.lo + 3, ctx.lo, ctx.hi); const bi = SN.indexOf(base);
  let t = 0;
  if (th === 'The question') return [[0, .5], [2, .5], [4, 1], [3, .5], [2, .5], [1, 1], [2, .5], [4, .5], [7, 1], [6, .5], [4, 1.5]].map(([dg, d]) => { const n = { t, d, p: SN[bi + dg] }; t += d; return n; });
  if (th === 'The rule') return [0, 12, 3, 7, 0, 10, 15, 5, 0, 12, 3, 7, 0, 10, 7, 0].map((o, k) => ({ t: k * 0.5, d: k === 15 ? 1 : 0.45, p: base + o }));
  if (th === 'The loop') { const out = []; for (let k = 0; k < 8; k++) { const pcs = chordPcs(chordAt(ctx.chords, ctx.start + k)); const ix = [0, 1, 2, 1, 2, 1, 0, 0][k]; out.push({ t: k, d: k === 7 ? 1 : 0.9, p: nearestIn([pcs[ix % pcs.length]], base + [0, 3, 7, 3, 7, 3, 0, 0][k], ctx.lo, ctx.hi) }); } return out; }
  return null;
}
function mirror(ph, ctx) {
  const p0 = ph.notes[0].p, SN = scaleNotes(ctx.scale, ctx.lo, ctx.hi);
  const notes = ph.notes.map(n => { let p = 2 * p0 - n.p; while (p > ctx.hi) p -= 12; while (p < ctx.lo) p += 12; p = SN[idxNear(SN, p)]; const pcs = chordPcs(chordAt(ctx.chords, ctx.start + n.t)); if (isStrong(n.t, n.d) && !pcs.includes(mod(p, 12))) p = nearestCT(SN, p, pcs); return { t: n.t, d: n.d, p }; });
  const want = [mod(ctx.tonic + 7, 12), mod(ctx.tonic + 2, 12)]; notes[notes.length - 1].p = nearestCT(SN, notes[notes.length - 1].p, want);
  const cr = critic(notes, Object.assign({}, ctx, { ending: 'q' })); return { notes, score: cr.score, parts: cr.parts };
}
/* the core material for the whole song */
function composeCore(doc) {
  const scale = scalePcs(doc), chords = chordList(doc), tonic = PCN[doc.song.key];
  const home = doc.sections.find(s => ['drop', 'chorus', 'verse'].includes(s.function)) || doc.sections[0];
  const start = (home.start_bar - 1) * 4, base = rootIn(tonic, 57);
  const ctx = { scale, chords, tonic, start, lo: base - 3, hi: base + 13, rng: rngFor(doc.seed, 'core-theme'), N: 160 };
  const pats = RHY_BY[doc.rhythm.grammar] || RHY_BY.house; const pat = RHY[pats[Math.floor(rngFor(doc.seed, 'core-rhythm')() * pats.length)]];
  let A, source;
  const fixed = albumTheme(doc.melody.theme, ctx);
  if (fixed) { const cr = critic(fixed, Object.assign({}, ctx, { ending: 'q' })); A = { notes: fixed, score: cr.score, parts: cr.parts }; source = doc.melody.theme + ' (album theme, judged by the critic)'; }
  else { A = composePhrase(phraseRhythm(pat), Object.assign({}, ctx, { ending: 'q' })); source = 'composed: best of 160 candidates on a ' + pats[0] + ' rhythm'; }
  const prefix = A.notes.map(n => n.t < 4 ? n.p : undefined);
  const A2 = composePhrase(A.notes.map(n => ({ t: n.t, d: n.d })), Object.assign({}, ctx, { ending: 'a', prefix, rng: rngFor(doc.seed, 'core-answer') }));
  const B = mirror(A, ctx);
  return { A, A2, B, ctx, source, rhythm: fixed ? 'theme' : pats[0] };
}
/* place a phrase in the song: octave into a lane, strong notes bent onto the chord */
let FRICTION = 0;
function bendAt(p, beat, d, chords) {
  const pcs = chordPcs(chordAt(chords, beat)); if (pcs.includes(mod(p, 12))) return p;
  const ct = nearestIn(pcs, p);
  if ((isStrong(beat % 8, d) || d >= 0.75) && Math.abs(ct - p) <= 2) { FRICTION++; return ct; }
  if (Math.abs(ct - p) === 1 && d >= 0.5) { FRICTION++; return ct; }
  return p;
}
function laneShift(notes, lo, hi) { const ps = notes.map(n => n.p).sort((a, b) => a - b); const med = ps[ps.length >> 1]; return 12 * Math.round(((lo + hi) / 2 - med) / 12); }
function realize(ph, beat0, lane, chords, vel = 0.8, maxBeat = Infinity) {
  const s = laneShift(ph.notes, lane[0], lane[1]); const out = [];
  ph.notes.forEach(n => { const t = beat0 + n.t; if (t >= maxBeat) return; let p = n.p + s; while (p > lane[1]) p -= 12; while (p < lane[0]) p += 12; p = bendAt(p, t, n.d, chords); out.push({ t, d: Math.min(n.d * 0.92, maxBeat - t), p, v: vel }); });
  return out;
}
/* lead, mid riff, chords and high layer, all from the core */
function composeParts(R, voc, out, core) {
  const doc = R.doc, chords = chordList(doc), scale = scalePcs(doc), tonic = PCN[doc.song.key];
  const lay = {}; doc.layers.forEach(l => lay[l.id] = l);
  const vocBusy = new Set(); (voc ? voc.lines : []).forEach(l => { for (let b = l.bar; b < l.bar + l.bars; b++) vocBusy.add(b); });
  const hasVox = !!(voc && voc.lines && voc.lines.length);
  const vlo = hasVox ? Math.min(...[voc.lead, voc.second].filter(Boolean).map(k => CHARS[k].lo)) : 72;
  const vhi = hasVox ? Math.max(...[voc.lead, voc.second].filter(Boolean).map(k => CHARS[k].hi)) : 72;
  const LANES = { lead: hasVox ? [Math.max(67, vhi - 4), Math.max(67, vhi - 4) + 17] : [64, 84], midbass: [45, 62], chords: [50, 67], high: [76, 91], bass: [31, 48], kick: [24, 40] };
  const secEnd = s => (s.start_bar - 1 + s.bars) * 4;
  // lead
  if (lay.lead) { const N = [];
    doc.sections.forEach(sec => { const lv = levelOf(lay.lead, doc, sec); if (lv <= 0) return; const fn = sec.function;
      for (let j = 0; j * 2 < sec.bars; j++) { const bar = sec.start_bar + 2 * j, b0 = (bar - 1) * 4;
        if (vocBusy.has(bar) || vocBusy.has(bar + 1)) continue;
        if (fn === 'intro' || (fn === 'outro' && j > 0)) continue;
        if (fn === 'build') { if (j * 2 < sec.bars / 2) continue; N.push(...realize({ notes: core.A.notes.filter(n => n.t < 4) }, b0, LANES.lead, chords, 0.75, secEnd(sec))); N.push(...realize({ notes: core.A.notes.filter(n => n.t < 4) }, b0 + 4, LANES.lead, chords, 0.85, secEnd(sec))); continue; }
        const ph = (fn === 'drop' || fn === 'chorus') ? [core.A, core.A2][j % 2] : [core.A, core.A2, core.B, core.A2][j % 4];
        N.push(...realize(ph, b0, LANES.lead, chords, 0.8, secEnd(sec)));
      } });
    out.lead = N; }
  // mid riff: the theme's first bar as a 16th-note riff, or roots for the talking basses
  if (lay.midbass) { const mi = lay.midbass.instrument, N = []; const bar1 = core.A.notes.filter(n => n.t < 4);
    doc.sections.forEach(sec => { const lv = levelOf(lay.midbass, doc, sec); if (lv <= 0) return;
      for (let b = 0; b < sec.bars; b++) { const bar = sec.start_bar + b, b0 = (bar - 1) * 4; if (sec.function === 'build' && b < sec.bars / 2) continue;
        const root = rootIn(chordAt(chords, b0).pc, 45);
        if (mi === 'Acid' || mi === 'Twister') { if (mi === 'Twister' && b % 4 !== 3) continue;
          const sh = laneShift(bar1, LANES.midbass[0], LANES.midbass[1]);
          for (let s = 0; s < 16; s++) { const t = s / 4; const hit = bar1.find(n => Math.abs(n.t - t) < 0.13);
            if (hit) N.push({ t: b0 + t, d: 0.22, p: bendAt(hit.p + sh, b0 + t, 0.25, chords), v: 0.95 });
            else if (s % 2 === 1 && s % 4 !== 3) N.push({ t: b0 + t, d: 0.2, p: root, v: 0.7 }); } }
        else if (mi === 'Reese') { bar1.slice(0, 4).forEach((n, k) => { const sh = laneShift(bar1, 40, 55); N.push({ t: b0 + k, d: 0.9, p: bendAt(n.p + sh, b0 + k, 1, chords), v: 0.8 }); }); }
        else if (mi === 'Wobble') [0, 1.5, 2, 3].forEach((t, k) => N.push({ t: b0 + t, d: k === 0 ? 1.4 : 0.9, p: root, v: 0.85 }));
        else if (mi === 'Growl') [1.5, 3.5].forEach(t => N.push({ t: b0 + t, d: 0.45, p: root, v: 0.9 }));
        else [0, 7, 12, 7].forEach((o, k) => N.push({ t: b0 + k, d: 0.45, p: root + o, v: 0.8 }));
      } });
    out.midbass = N; }
  // chords: smallest-motion voicing, kept under the voice
  if (lay.chords) { let prev = [55, 59, 62]; const stabs = ['house', 'disco'].includes(doc.rhythm.grammar); const N = [];
    doc.sections.forEach(sec => { const lv = levelOf(lay.chords, doc, sec); if (lv <= 0) return;
      sec.chords.forEach(c => { const t0 = (c.bar - 1) * 4, span = Math.min(sec.bars_per_chord || 4, (sec.start_bar - 1 + sec.bars) - (c.bar - 1)) * 4; if (span <= 0) return;
        const top = LANES.chords[1]; const pcs = chordPcs(c).slice(0, 3);
        let v = pcs.map((pc, i) => nearestIn([pc], prev[i] || 58, LANES.chords[0], top)).sort((a, b) => a - b); prev = v;
        if (stabs && (sec.function === 'drop' || sec.function === 'chorus')) { for (let q = 0; q < span; q++) v.forEach(p => N.push({ t: t0 + q + 0.5, d: 0.35, p, v: 0.7 })); }
        else for (let q = 0; q < span; q += 4) v.forEach(p => N.push({ t: t0 + q, d: Math.min(4, span - q), p, v: 0.65, hold: true }));
      }); });
    out.chords = N; }
  if (lay.high) { const N = [];
    doc.sections.forEach(sec => { const lv = levelOf(lay.high, doc, sec); if (lv <= 0) return;
      sec.chords.forEach(c => { const t0 = (c.bar - 1) * 4, span = Math.min(sec.bars_per_chord || 4, (sec.start_bar - 1 + sec.bars) - (c.bar - 1)) * 4; if (span <= 0) return;
        const pcs = chordPcs(c); [pcs[1], pcs[2]].forEach(pc => { const p = rootIn(pc, LANES.high[0]); for (let q = 0; q < span; q += 4) N.push({ t: t0 + q, d: Math.min(4, span - q), p, v: 0.55, hold: true }); }); }); });
    out.high = N; }
  return LANES;
}
/* fit a line's syllables onto a phrase: merge or split notes, extra notes become a held run on the last syllable */
function mapSyl(sy, ph) {
  const n = sy.syl.length; let ns = ph.map(x => ({ t: x.t, d: x.d, p: x.p }));
  while (ns.length > n + 2) { let bi = 0, bd = 1e9; for (let i = 0; i < ns.length - 1; i++) { const d = ns[i].d + ns[i + 1].d; if (d < bd) { bd = d; bi = i; } } ns[bi].d = ns[bi + 1].t + ns[bi + 1].d - ns[bi].t; ns.splice(bi + 1, 1); }
  while (ns.length < n) { let bi = -1, bd = 0; ns.forEach((x, i) => { if (x.d >= 0.5 && x.d > bd) { bd = x.d; bi = i; } }); if (bi < 0) break; const x = ns[bi], h = x.d / 2; ns.splice(bi + 1, 0, { t: x.t + h, d: h, p: x.p }); x.d = h; }
  if (ns.length < n) return null;
  return ns.map((x, i) => Object.assign(x, { si: Math.min(i, n - 1) }));
}

/* ---------------- the worker ---------------- */
let worker = null, wid = 0; const pending = new Map(); const vocalCache = new Map();
function getWorker() { if (!worker) { worker = new Worker('voice-worker.js'); worker.onmessage = e => { const p = pending.get(e.data.id); if (!p) return; pending.delete(e.data.id); if (e.data.error) p.rej(new Error(e.data.error)); else p.res(e.data); }; worker.onerror = e => { pending.forEach(p => p.rej(new Error('Voice engine failed to start'))); pending.clear(); }; } return worker; }
function sing(part) { return new Promise((res, rej) => { const id = ++wid; pending.set(id, { res, rej }); getWorker().postMessage({ id, part }); }); }

/* ---------------- offline render of an instrument layer ---------------- */
const BASE_GAIN = { kick: 1.0, snare: 0.6, bass: 0.75, midbass: 0.5, lead: 0.45, chords: 0.38, high: 0.32, fx: 0.45 };
async function renderLayer(role, notes, inst, preset, doc, kickTimes, totalSec) {
  const { buf, root } = await loadSample(inst, preset);
  const sr = ac().sampleRate, n = Math.ceil((totalSec + 4) * sr);
  const L = new Float32Array(n), Rr = new Float32Array(n);
  const s0 = buf.getChannelData(0), s1 = buf.numberOfChannels > 1 ? buf.getChannelData(1) : s0, srcLen = s0.length, srcSr = buf.sampleRate;
  const spb = 60 / doc.song.bpm, perc = ['kick', 'snare', 'fx'].includes(role);
  const lay = doc.layers.find(l => l.id === role); const auto = lay ? lay.automation : [];
  const levelAt = beat => { let g = auto.length ? auto[0][1] : 1; for (const [bar, v] of auto) if ((bar - 1) * 4 <= beat + 1e-6) g = v; return g; };
  const base = BASE_GAIN[role] || 0.5;
  for (const nt of notes) {
    const rate = Math.pow(2, (nt.p - root) / 12) * srcSr / sr;
    const t = nt.t * spb, d = nt.d * spb, lvl = levelAt(nt.t); if (lvl <= 0) continue;
    const segLen = Math.max(0.12, srcLen / srcSr / (rate * sr / srcSr) * 0.7);
    const pieces = (nt.hold && d > segLen) ? Math.ceil(d / segLen) : 1;
    for (let k = 0; k < pieces; k++) {
      const st = t + k * (d / pieces), en = pieces > 1 ? st + d / pieces + 0.15 : t + d;
      const rel = perc ? 0 : (nt.hold ? 0.35 : 0.06), att = pieces > 1 ? 0.12 : 0.002;
      const i0 = Math.round(st * sr), maxOut = Math.floor((srcLen - 2) / rate);
      const len = perc ? maxOut : Math.min(maxOut, Math.round((en - st + rel) * sr));
      const relStart = perc ? len : Math.round((en - st) * sr), relLen = Math.max(1, Math.round(rel * sr)), attLen = Math.max(1, Math.round(att * sr));
      const v = nt.v * lvl * base * (pieces > 1 ? 0.85 : 1);
      for (let i = 0; i < len; i++) {
        const o = i0 + i; if (o >= n) break; if (o < 0) continue;
        const pos = i * rate, j = pos | 0, f = pos - j;
        let e = v; if (i < attLen) e *= i / attLen; if (i > relStart) e *= Math.max(0, 1 - (i - relStart) / relLen);
        L[o] += (s0[j] + (s0[j + 1] - s0[j]) * f) * e; Rr[o] += (s1[j] + (s1[j + 1] - s1[j]) * f) * e;
      }
    }
  }
  if (['bass', 'midbass', 'chords', 'high', 'lead'].includes(role) && kickTimes.length) {
    const depth = { bass: 0.35, midbass: 0.5, chords: 0.5, high: 0.65, lead: 0.8 }[role], rec = Math.round(0.22 * sr), dip = Math.round(0.01 * sr);
    for (const k of kickTimes) { const a = Math.round(k * sr); for (let i = 0; i < rec + dip; i++) { const o = a + i; if (o >= n) break; const g = i < dip ? 1 - (1 - depth) * i / dip : depth + (1 - depth) * (i - dip) / rec; L[o] *= g; Rr[o] *= g; } }
  }
  const out = ac().createBuffer(2, n, sr); out.copyToChannel(L, 0); out.copyToChannel(Rr, 1);
  await new Promise(r => setTimeout(r, 0));
  return out;
}

/* ---------------- loudness: K-weighted, gated, after BS.1770 (approximate) ---------------- */
function biq(x, type, f, q, gainDb, sr) {
  const A = Math.pow(10, gainDb / 40), w = 2 * Math.PI * f / sr, cw = Math.cos(w), sw = Math.sin(w), al = sw / (2 * q);
  let b0, b1, b2, a0, a1, a2;
  if (type === 'hs') { const r = 2 * Math.sqrt(A) * al; b0 = A * ((A + 1) + (A - 1) * cw + r); b1 = -2 * A * ((A - 1) + (A + 1) * cw); b2 = A * ((A + 1) + (A - 1) * cw - r); a0 = (A + 1) - (A - 1) * cw + r; a1 = 2 * ((A - 1) - (A + 1) * cw); a2 = (A + 1) - (A - 1) * cw - r; }
  else { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; }
  b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0; let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; x[i] = v; }
  return x;
}
function kw(mono, sr) { const x = Float32Array.from(mono); biq(x, 'hs', 1500, 0.707, 4, sr); biq(x, 'hp', 38, 0.5, 0, sr); return x; }
function kMonoBuf(buf) { const a = buf.getChannelData(0), b = buf.numberOfChannels > 1 ? buf.getChannelData(1) : a; const m = new Float32Array(a.length); for (let i = 0; i < a.length; i++) m[i] = 0.5 * (a[i] + b[i]); return kw(m, buf.sampleRate); }
function loud(w, sr, a = 0, b = w.length) {
  a = Math.max(0, Math.floor(a)); b = Math.min(w.length, Math.floor(b)); const blk = Math.floor(0.4 * sr), hop = Math.floor(0.1 * sr); const z = [];
  for (let s = a; s + blk <= b; s += hop) { let e = 0; for (let i = s; i < s + blk; i += 2) e += w[i] * w[i]; z.push(e / (blk / 2)); }
  if (!z.length) return -Infinity;
  let g = z.filter(v => -0.691 + 10 * Math.log10(v + 1e-20) > -70); if (!g.length) return -Infinity;
  const rel = -0.691 + 10 * Math.log10(g.reduce((s, v) => s + v, 0) / g.length) - 10; g = g.filter(v => -0.691 + 10 * Math.log10(v) > rel);
  return -0.691 + 10 * Math.log10(g.reduce((s, v) => s + v, 0) / g.length);
}
const LU_TARGET = { kick: 0, snare: -3, bass: -2, midbass: -7, lead: -6, chords: -8, high: -8, fx: -10 };
function balanceLayers(doc) {
  const sr = ac().sampleRate, rows = [];
  const tg = Object.assign({}, LU_TARGET); const mb = doc.layers.find(l => l.id === 'midbass');
  if (mb && ['Wobble', 'Growl', 'Reese'].includes(mb.instrument) && doc.rhythm.grammar === 'halftime') tg.midbass = -4;
  P.layers.forEach(L => { L.w = kMonoBuf(L.buf); L.measured = loud(L.w, sr); });
  const kick = P.layers.find(l => l.id === 'kick' && isFinite(l.measured));
  let ref; if (kick) ref = kick.measured; else { const b = P.layers.find(l => isFinite(l.measured)); ref = b ? b.measured - (tg[b.id] || 0) : -20; }
  const band = new Float32Array(P.layers.length ? P.layers[0].w.length : 0);
  P.layers.forEach(L => {
    if (!isFinite(L.measured)) { rows.push({ role: L.id, inst: L.label, target: tg[L.id], before: null, gain: 0 }); return; }
    const tgt = tg[L.id] !== undefined ? tg[L.id] : -8; const g = Math.max(-30, Math.min(24, ref + tgt - L.measured)), k = Math.pow(10, g / 20);
    for (let c = 0; c < L.buf.numberOfChannels; c++) { const d = L.buf.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= k; }
    for (let i = 0; i < band.length && i < L.w.length; i++) band[i] += L.w[i] * k;
    rows.push({ role: L.id, inst: L.label, target: tgt, before: L.measured - ref, gain: g });
    L.w = null;
  });
  const mixL = loud(band, sr) + 3.01, songTarget = { stream: -14, club: -9, dynamic: -16 }[doc.production.master] || -14, target = Math.min(-14, songTarget);
  const mg = isFinite(mixL) ? Math.max(-24, Math.min(24, target - mixL)) : 0;
  master.gain.value = Math.pow(10, mg / 20);
  P.band = band; P.ref = ref; P.mix = { rows, mixL, target, songTarget, masterGain: mg, vocals: [] };
}
function vocalGain(job, res, copies) {
  const sr = ac().sampleRate, vsr = res.sr; const w = kw(res.audio, vsr); const Lv = loud(w, vsr);
  const a = (job.start + res.offset) * sr, b = a + res.audio.length / vsr * sr;
  let Lb = P.band ? loud(P.band, sr, a, b) : -Infinity; const exposed = !isFinite(Lb) || Lb < P.ref - 14;
  if (exposed) Lb = P.ref - 3;
  const off = job.track === 'choir' ? -4 : job.track === 'second' ? (job.hook ? -3 : -1.5) : (job.hook ? -1 : -1.5);
  const g = isFinite(Lv) ? Math.max(-30, Math.min(20, Lb + off - Lv)) : 0;
  P.mix.vocals.push({ track: job.track, section: doc0().sections[job.items[0].line.sectionIndex].name, band: Lb - P.ref, target: off, exposed, gain: g });
  return Math.pow(10, g / 20) / Math.sqrt(copies || 1);
}
const doc0 = () => P.doc;

/* ---------------- playback ---------------- */
const P = Studio.player = { layers: [], clips: [], playing: false, pos: 0, t0: 0, sources: [], mutes: {}, duration: 0, bpm: 120, doc: null, notes: {}, vnotes: {} };
let master = null, reverbIn = null, trackNodes = {};
function makeIR(c, secs, decay) { const sr = c.sampleRate, n = Math.floor(sr * secs), b = c.createBuffer(2, n, sr); for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; }
function graph() {
  const c = ac(); if (master) return;
  master = c.createGain(); master.gain.value = 0.9;
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -12; comp.ratio.value = 2; comp.attack.value = 0.01; comp.release.value = 0.2;
  const lim = c.createDynamicsCompressor(); lim.threshold.value = -1.5; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.12;
  master.connect(comp); comp.connect(lim); lim.connect(c.destination);
  const conv = c.createConvolver(); conv.buffer = makeIR(c, 2.4, 3); reverbIn = c.createGain(); reverbIn.gain.value = 1; reverbIn.connect(conv); const rg = c.createGain(); rg.gain.value = 0.35; conv.connect(rg); rg.connect(master);
}
function shaper(c, amt) { const ws = c.createWaveShaper(); const n = 1024, cur = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; cur[i] = Math.tanh(x * (1 + amt * 8)) / Math.tanh(1 + amt * 8); } ws.curve = cur; return ws; }
function crushCurve(c, levels) { const ws = c.createWaveShaper(); const n = 2048, cur = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; cur[i] = Math.round(x * levels) / levels; } ws.curve = cur; return ws; }
function vocalChain(name, prod) {
  const c = ac(); const inp = c.createGain(), out = c.createGain(); let send = 0.15;
  const link = (...nodes) => { nodes.reduce((a, b) => { a.connect(b); return b; }); };
  if (prod === 'raw') { link(inp, out); send = 0.02; }
  else if (prod === 'studio') { const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 90; const cp = c.createDynamicsCompressor(); cp.threshold.value = -22; cp.ratio.value = 3; link(inp, hp, cp, out); send = 0.14; }
  else if (prod === 'idol') { const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 110; const pk = c.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 3000; pk.gain.value = 3; pk.Q.value = 0.9; const air = c.createBiquadFilter(); air.type = 'highshelf'; air.frequency.value = 9000; air.gain.value = 4; const cp = c.createDynamicsCompressor(); cp.threshold.value = -26; cp.ratio.value = 5;
    link(inp, hp, pk, air, cp, out);
    [-1, 1].forEach(s => { const dl = c.createDelay(0.1); dl.delayTime.value = 0.017 + 0.006 * (s > 0); const pn = c.createStereoPanner(); pn.pan.value = 0.65 * s; const g = c.createGain(); g.gain.value = 0.35; cp.connect(dl); dl.connect(pn); pn.connect(g); g.connect(out); });
    const echo = c.createDelay(2); echo.delayTime.value = 0.75 * 60 / P.bpm; const fb = c.createGain(); fb.gain.value = 0.28; const eg = c.createGain(); eg.gain.value = 0.18; cp.connect(echo); echo.connect(fb); fb.connect(echo); echo.connect(eg); eg.connect(out); send = 0.3; }
  else if (prod === 'robot') { const ring = c.createGain(); ring.gain.value = 0; const osc = c.createOscillator(); osc.frequency.value = 48; osc.connect(ring.gain); osc.start(); const dry = c.createGain(); dry.gain.value = 0.55; const comb = c.createDelay(0.05); comb.delayTime.value = 0.0045; const fb = c.createGain(); fb.gain.value = 0.55; comb.connect(fb); fb.connect(comb); const cr = crushCurve(c, 24);
    inp.connect(ring); inp.connect(dry); ring.connect(comb); dry.connect(comb); comb.connect(cr); cr.connect(out); send = 0.2; }
  else if (prod === 'radio') { const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3400; link(inp, hp, lp, shaper(c, 0.3), out); send = 0.1; }
  else if (prod === 'boss') { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6000; const cut = c.createBiquadFilter(); cut.type = 'peaking'; cut.frequency.value = 420; cut.gain.value = -4; link(inp, shaper(c, 0.35), cut, lp, out); send = 0.4; }
  else link(inp, out);
  const mute = c.createGain(); out.connect(mute); mute.connect(master); const sg = c.createGain(); sg.gain.value = send; out.connect(sg); sg.connect(reverbIn);
  return { inp, mute };
}
function layerNode(name) { const c = ac(); if (trackNodes[name]) return trackNodes[name]; const g = c.createGain(); g.connect(master); const s = c.createGain(); s.gain.value = ['chords', 'high', 'lead', 'fx', 'snare'].includes(name) ? 0.22 : 0.04; g.connect(s); s.connect(reverbIn); trackNodes[name] = { inp: g, mute: g }; return trackNodes[name]; }
function startAt(pos) {
  const c = ac(); graph(); stopSources();
  const when = c.currentTime + 0.06; P.t0 = when - pos; P.playing = true;
  P.layers.forEach(L => { const node = layerNode(L.id); node.mute.gain.value = P.mutes[L.id] ? 0 : 1; if (pos < L.buf.duration) { const s = c.createBufferSource(); s.buffer = L.buf; s.connect(node.inp); s.start(when, pos); P.sources.push(s); } });
  P.clips.forEach(cl => scheduleClip(cl, when, pos));
}
function scheduleClip(cl, when, pos) {
  const c = ac(); const end = cl.start + cl.buf.duration / (cl.rate || 1); if (end <= pos) return;
  const node = trackNodes['v-' + cl.track]; if (!node) return; node.mute.gain.value = P.mutes['v-' + cl.track] ? 0 : 1;
  const s = c.createBufferSource(); s.buffer = cl.buf; s.playbackRate.value = cl.rate || 1;
  let dst = node.inp; if (cl.pan !== undefined) { const pn = c.createStereoPanner(); pn.pan.value = cl.pan; const g = c.createGain(); g.gain.value = cl.gain || 1; s.connect(g); g.connect(pn); pn.connect(node.inp); } else { const g = c.createGain(); g.gain.value = cl.gain || 1; s.connect(g); g.connect(dst); }
  const startT = cl.start + (cl.delay || 0);
  if (startT >= pos) s.start(when + (startT - pos)); else s.start(when, (pos - startT) * (cl.rate || 1));
  P.sources.push(s);
}
function stopSources() { P.sources.forEach(s => { try { s.stop(); } catch (e) { } }); P.sources = []; }
Studio.play = () => { if (!P.layers.length && !P.clips.length) return; startAt(P.pos >= P.duration ? 0 : P.pos); tick(); };
Studio.pause = () => { if (!P.playing) return; P.pos = Math.max(0, ac().currentTime - P.t0); P.playing = false; stopSources(); drawPreview(); };
Studio.stop = () => { P.playing = false; stopSources(); P.pos = 0; drawPreview(); };
Studio.seek = sec => { P.pos = Math.max(0, Math.min(P.duration, sec)); if (P.playing) startAt(P.pos); drawPreview(); };
Studio.toggleMute = name => { P.mutes[name] = !P.mutes[name]; const node = trackNodes[name]; if (node) node.mute.gain.value = P.mutes[name] ? 0 : 1; drawPreview(); };
function curPos() { return P.playing ? Math.min(P.duration, ac().currentTime - P.t0) : P.pos; }
function tick() { if (!P.playing) return; const t = curPos(); if (t >= P.duration) { Studio.stop(); return; } follow(t); drawPreview(); requestAnimationFrame(tick); }

/* ---------------- listen buttons ---------------- */
Studio.listen = async function (inst, preset, keyName0, role) {
  try {
    const { buf, root } = await loadSample(inst, preset); const c = ac(); graph();
    const tonic = PCN[keyName0] !== undefined ? PCN[keyName0] : 9;
    const now = c.currentTime + 0.05; const g = c.createGain(); g.gain.value = 0.8; g.connect(master);
    let seq;
    if (role === 'kick' || role === 'snare') seq = [[0, 0], [0.5, 0], [1, 0], [1.5, 0]];
    else if (role === 'fx') seq = [[0, 0]];
    else { const base = root + mod(tonic - root, 12) - (mod(tonic - root, 12) > 6 ? 12 : 0) - root; seq = [[0, base], [0.38, base + 3], [0.76, base + 7], [1.14, base + 12]]; if (role === 'chords' || role === 'high') seq = [[0, base], [0, base + 3], [0, base + 7]]; }
    seq.forEach(([t, semi]) => { const s = c.createBufferSource(); s.buffer = buf; s.playbackRate.value = Math.pow(2, semi / 12); s.connect(g); s.start(now + t); });
  } catch (e) { Studio.status(e.message, true); }
};

/* ---------------- generate ---------------- */
let genToken = 0;
Studio.status = (msg, err) => { const el = document.getElementById('gen-status'); if (el) { el.textContent = msg; el.classList.toggle('err', !!err); } };
Studio.generate = async function (R) {
  const my = ++genToken; const doc = R.doc; ac(); graph(); Studio.stop();
  P.bpm = doc.song.bpm; P.doc = doc; P.layers = []; P.clips = []; P.duration = doc.song.duration_s + 2; P.notes = {}; P.vnotes = {}; P.pos = 0;
  Object.keys(trackNodes).filter(k => k.startsWith('v-')).forEach(k => delete trackNodes[k]);
  const plan = doc.vocals && doc.vocals.lines && doc.vocals.lines.length ? doc.vocals : null;
  const notes = genNotes(R, plan); P.notes = notes;
  const spb = 60 / doc.song.bpm; const kickTimes = (notes.kick || []).map(n => n.t * spb);
  Studio.status('Rendering instruments…'); drawPreview();
  for (const L of doc.layers) {
    if (my !== genToken) return;
    const ns = notes[L.id]; if (!ns || !ns.length) continue;
    Studio.status('Rendering ' + L.role.toLowerCase() + ' · ' + L.instrument + '…');
    try { const buf = await renderLayer(L.id, ns, L.instrument, L.preset, doc, kickTimes, doc.song.duration_s); P.layers.push({ id: L.id, label: L.instrument, buf }); }
    catch (e) { Studio.status('Could not render ' + L.instrument + ': ' + e.message, true); }
    drawPreview();
  }
  if (my !== genToken) return;
  Studio.status('Balancing loudness…'); await new Promise(r => setTimeout(r, 0)); balanceLayers(doc); P.compose = notes._compose; P.vscores = []; report();
  if (!plan) { Studio.status('Ready. Press play.'); drawPreview(); return; }
  let vb; try { vb = buildVocals(R, plan, notes); } catch (e) { Studio.status('Could not set the lyrics: ' + e.message, true); return; } P.vscores = vb.scores; report();
  ['lead', 'second', 'choir'].forEach(tr => { if (vb.jobs.some(j => j.track === tr)) { const prod = tr === 'lead' ? doc.vocals.production : tr === 'second' ? (CHARS[doc.vocals.second] || {}).prod : 'studio'; trackNodes['v-' + tr] = vocalChain(tr, prod || 'studio'); } });
  ['lead', 'second', 'choir'].forEach(tr => { P.vnotes[tr] = []; vb.tracks[tr].forEach(it => it.notes.forEach(n => P.vnotes[tr].push({ t: (it.line.bar - 1) * 4 + n.t, d: n.d, p: n.p }))); });
  drawPreview();
  const pop = doc.vocals.choirsize || 8; let done = 0;
  Studio.status('Instruments ready, press play. Singing vocal part 1 of ' + vb.jobs.length + '…');
  for (const j of vb.jobs) {
    if (my !== genToken) return;
    try {
      let res = vocalCache.get(j.cacheKey);
      if (!res) { res = await sing(j.part); vocalCache.set(j.cacheKey, res); }
      const c = ac(); const buf = c.createBuffer(1, res.audio.length, res.sr); buf.copyToChannel(res.audio, 0);
      const base = j.start + res.offset;
      const add = cl => { P.clips.push(cl); if (P.playing) scheduleClip(cl, ac().currentTime + 0.02, curPos()); };
      if (j.track === 'choir') { const nJobs = Math.max(1, vb.jobs.filter(x => x.track === 'choir' && x.items[0].line.sectionIndex === j.items[0].line.sectionIndex).length); const copies = Math.max(1, Math.round(pop / nJobs)); const rr = rngFor(doc.seed, 'choir' + done);
        const gk = vocalGain(j, res, copies * nJobs);
        for (let k = 0; k < copies; k++) add({ track: 'choir', start: base, buf, rate: Math.pow(2, (rr() - 0.5) * 18 / 1200), delay: rr() * 0.03, pan: (rr() * 2 - 1) * 0.85, gain: gk }); }
      else add({ track: j.track, start: base, buf, gain: vocalGain(j, res, 1) });
    } catch (e) { Studio.status('A vocal part failed: ' + e.message, true); }
    done++; report(); if (my === genToken) Studio.status(done < vb.jobs.length ? 'Instruments ready, press play. Singing vocal part ' + (done + 1) + ' of ' + vb.jobs.length + '…' : 'Ready. All ' + vb.jobs.length + ' vocal parts sung.'); drawPreview();
  }
};
Studio.singPreview = async function (R) {
  const doc = R.doc; if (!doc.vocals || !doc.vocals.lines || !doc.vocals.lines.length) { Studio.status('No vocals in this song. Pick a cast first.', true); return; }
  ac(); graph(); Studio.status('Singing the hook…');
  const hookLine = doc.vocals.lines.find(l => l.kind === 'hook') || doc.vocals.lines[0];
  const plan = { lines: doc.vocals.lines.filter(l => l.sectionIndex === hookLine.sectionIndex).slice(0, 2) };
  const vb = buildVocals(R, plan, genNotes(R, plan)); const j = vb.jobs.find(x => x.track === 'lead') || vb.jobs[0];
  try { const res = await sing(j.part); const c = ac(); const buf = c.createBuffer(1, res.audio.length, res.sr); buf.copyToChannel(res.audio, 0);
    const ch = vocalChain('preview', doc.vocals.production); const s = c.createBufferSource(); s.buffer = buf; s.connect(ch.inp); s.start(c.currentTime + 0.05); Studio.status('Sang: "' + plan.lines.map(l => l.text).join(' / ') + '"'); }
  catch (e) { Studio.status('The voice failed: ' + e.message, true); }
};

/* ---------------- how this song was built ---------------- */
const NOTE_N = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const nn = p => NOTE_N[mod(p, 12)] + (Math.floor(p / 12) - 1);
const hz = p => 440 * Math.pow(2, (p - 69) / 12);
const escH = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function bands() {
  const out = []; const doc = P.doc; if (!doc) return out;
  const add = (key, label, ns, rhythmic, fixed) => { let lo, hi; if (fixed) [lo, hi] = fixed; else { const ps = ns.map(n => n.p).filter(isFinite); if (!ps.length) return; lo = hz(Math.min(...ps)); hi = Math.max(hz(Math.max(...ps)), lo * Math.pow(2, 1 / 3)); } out.push({ key, label, lo, hi, rhythmic, flags: [], shared: [] }); };
  doc.layers.forEach(l => { const ns = P.notes[l.id] || []; if (!ns.length) return;
    if (l.id === 'kick') add('kick', l.instrument, ns, true, [45, 120]);
    else if (l.id === 'snare') add('snare', l.instrument, ns, true, [1500, 4500]);
    else add(l.id, l.instrument, ns, ['bass', 'midbass', 'lead'].includes(l.id)); });
  [['lead', 'Lead vocal'], ['second', 'Second vocal'], ['choir', 'Choir']].forEach(([k, lab]) => { if (P.vnotes[k] && P.vnotes[k].length) add('v-' + k, lab, P.vnotes[k], k !== 'choir'); });
  const declared = (a, b) => { const k = [a.key, b.key].sort().join('+');
    if (k === 'bass+kick') return 'take turns: the bass ducks under every kick';
    if (a.key.startsWith('v-') && b.key.startsWith('v-')) return 'duet blend, declared';
    if ((a.key === 'lead' && b.key.startsWith('v-')) || (b.key === 'lead' && a.key.startsWith('v-'))) return 'take turns: the lead rests while the voice sings';
    return null; };
  for (let i = 0; i < out.length; i++) for (let j = i + 1; j < out.length; j++) { const a = out[i], b = out[j]; if (!a.rhythmic || !b.rhythmic) continue;
    const lo = Math.max(Math.log(a.lo), Math.log(b.lo)), hi = Math.min(Math.log(a.hi), Math.log(b.hi)); const ov = Math.max(0, hi - lo) / Math.min(Math.log(a.hi / a.lo), Math.log(b.hi / b.lo));
    if (ov <= 0.35) continue; const d = declared(a, b);
    if (d) a.shared.push(b.label + ': ' + d); else a.flags.push(b.label + ' ' + Math.round(ov * 100) + '%'); }
  return out;
}
function drawBands(list) {
  const c = document.getElementById('bandplan'); if (!c) return; const W = c.clientWidth, rowH = 22, H = 28 + list.length * rowH; const dpr = window.devicePixelRatio || 1;
  c.style.height = H + 'px'; c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const ink = css('--ink'), mut = css('--muted'), line = css('--line'), warn = css('--warn'); const gut = 110, f0 = Math.log(35), f1 = Math.log(9000); const X = f => gut + (Math.log(f) - f0) / (f1 - f0) * (W - gut - 10);
  g.font = '11px "IBM Plex Mono", ui-monospace, monospace'; g.textBaseline = 'middle';
  [50, 100, 250, 500, 1000, 2500, 5000].forEach(f => { const x = X(f); g.strokeStyle = line; g.beginPath(); g.moveTo(x, 18); g.lineTo(x, H); g.stroke(); g.fillStyle = mut; g.textAlign = 'center'; g.fillText(f >= 1000 ? f / 1000 + 'k' : String(f), x, 9); });
  list.forEach((b, i) => { const y = 28 + i * rowH; const col = b.key.startsWith('v-') ? css('--l-voice') : css('--l-' + b.key);
    g.fillStyle = b.flags.length ? warn : ink; g.textAlign = 'left'; g.font = '500 11.5px "IBM Plex Sans", system-ui, sans-serif'; g.fillText(b.label, 4, y + 6, gut - 8);
    g.fillStyle = col; g.globalAlpha = b.rhythmic ? 0.9 : 0.45; const x0 = X(Math.max(35, b.lo)), x1 = X(Math.min(9000, b.hi)); g.fillRect(x0, y, Math.max(3, x1 - x0), 12); g.globalAlpha = 1; });
}
function report() {
  const el = document.getElementById('build-report'); if (!el || !P.doc) return;
  const C = P.compose; if (!C) return; const core = C.core;
  const bar = v => `<span class="rbar"><i style="width:${Math.round(v * 100)}%"></i></span>`;
  const phrase = (name, ph, what) => `<tr><td><b>${name}</b><br><span class="note">${what}</span></td><td class="num">${ph.score.toFixed(0)}</td><td class="mono">${ph.notes.map(n => nn(n.p)).join(' ')}</td><td>${Object.entries(ph.parts).map(([k, v]) => `<div class="rrow"><span>${escH(k)}</span>${bar(v)}</div>`).join('')}</td></tr>`;
  const vs = P.vscores || []; const vAvg = vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : null;
  const bl = bands(); const flagged = bl.filter(b => b.flags.length);
  const m = P.mix; const vrows = {}; (m ? m.vocals : []).forEach(v => { const k = v.track + '|' + v.section; if (!vrows[k]) vrows[k] = v; });
  el.innerHTML = `
  <h4>1 · One core theme</h4>
  <p class="note">Source: ${escH(core.source)}. Every melodic part below is built from these three phrases. The critic scores 0–100 with the Melody Lab's rules.</p>
  <div class="tablewrap"><table><thead><tr><th>Phrase</th><th>Score</th><th>Notes</th><th>Rules</th></tr></thead><tbody>
  ${phrase('A', core.A, 'question')}${phrase('A′', core.A2, 'answer: same opening, new ending')}${phrase('B', core.B, 'mirror image of A')}
  </tbody></table></div>
  <p class="note">Lead: A A′ B A′ in verses, A A′ in drops, the first bar of A in builds; it rests while someone sings. Hooks are sung on A and A′ themselves. Verse lines are composed by the same critic from the theme's first two notes${vAvg !== null ? `; ${vs.length} sung lines average ${vAvg.toFixed(0)}` : ''}. The acid or Reese riff plays the first bar of A. ${C.friction} strong-beat rubs were bent onto the chord.</p>
  <h4>2 · Band plan</h4>
  <canvas id="bandplan" style="width:100%;display:block"></canvas>
  <p class="note">Bars are each part's range of fundamentals in hertz; solid bars are rhythmic parts, which must not share more than 35 % of a band unless the sharing is declared. ${flagged.length ? 'Undeclared overlaps: ' + flagged.map(b => escH(b.label) + ' with ' + b.flags.map(escH).join(', ')).join('; ') + '.' : 'No undeclared overlaps.'} ${bl.filter(b => b.shared.length).map(b => escH(b.label) + ' and ' + b.shared.map(escH).join('; ')).join('. ')}${bl.some(b => b.shared.length) ? '.' : ''}</p>
  <h4>3 · Loudness balance</h4>
  ${m ? `<div class="tablewrap"><table><thead><tr><th>Part</th><th>Target vs kick</th><th>Rendered at</th><th>Gain applied</th></tr></thead><tbody>
  ${m.rows.map(r => `<tr><td>${escH(r.inst)}</td><td class="num">${r.target > 0 ? '+' : ''}${r.target} LU</td><td class="num">${r.before === null ? '—' : (r.before > 0 ? '+' : '') + r.before.toFixed(1) + ' LU'}</td><td class="num">${(r.gain > 0 ? '+' : '') + r.gain.toFixed(1)} dB</td></tr>`).join('')}
  ${Object.values(vrows).map(v => `<tr><td>${v.track === 'lead' ? 'Lead vocal' : v.track === 'second' ? 'Second vocal' : 'Choir'} · ${escH(v.section)}</td><td class="num">${v.target} LU vs band${v.exposed ? ' (alone: vs kick −3)' : ''}</td><td class="num">band ${v.band.toFixed(1)} LU</td><td class="num">${(v.gain > 0 ? '+' : '') + v.gain.toFixed(1)} dB</td></tr>`).join('')}
  </tbody></table></div>
  <p class="note">Loudness is K-weighted and gated as in BS.1770, measured on each rendered part. Instruments are set relative to the kick (Night Shift's balance); each sung part sits 1–1.5 LU under the band where it sings, the duet partner and choir lower. The instruments' mix measured ${m.mixL.toFixed(1)} LUFS; the preview plays it at ${m.target} LUFS with a limiter at −1.5 dB${m.songTarget > m.target ? ` (the song's ${m.songTarget} LUFS club master is for the engine render, not a browser limiter)` : ''}.</p>` : '<p class="note">Measured after the instruments render.</p>'}`;
  drawBands(bl);
}
Studio.report = report;

/* ---------------- preview drawing ---------------- */
const PV = { pxPerBar: 28, follow: true, gutter: 104, laneH: 30, top: 26 };
Studio.zoom = f => { PV.pxPerBar = Math.max(8, Math.min(96, PV.pxPerBar * f)); sizePreview(); drawPreview(); };
Studio.setFollow = v => { PV.follow = v; };
function lanes() {
  const L = []; const doc = P.doc; if (!doc) return L;
  doc.layers.forEach(l => { const ns = P.notes[l.id] || []; L.push({ key: l.id, label: l.instrument + (ns.length ? '' : ' · rests'), color: 'var(--l-' + l.id + ')', notes: ns, ready: !ns.length || P.layers.some(x => x.id === l.id) }); });
  [['lead', 'Lead vocal'], ['second', 'Second vocal'], ['choir', 'Choir']].forEach(([k, lab]) => { if (P.vnotes[k] && P.vnotes[k].length) L.push({ key: 'v-' + k, label: lab, color: 'var(--l-voice)', notes: P.vnotes[k], vocal: true, ready: P.clips.some(c => c.track === k) }); });
  return L;
}
function sizePreview() { const sp = document.getElementById('pv-spacer'); if (!sp || !P.doc) return; const L = lanes(); sp.style.width = (PV.gutter + P.doc.song.bars * PV.pxPerBar + 40) + 'px'; sp.style.height = (PV.top + Math.max(1, L.length) * PV.laneH + 8) + 'px'; }
function follow(t) { if (!PV.follow) return; const sc = document.getElementById('pv-scroll'); if (!sc || !P.doc) return; const x = PV.gutter + t / (60 / P.bpm) / 4 * PV.pxPerBar; const view = sc.clientWidth; if (x - sc.scrollLeft > view * 0.8 || x - sc.scrollLeft < PV.gutter) sc.scrollLeft = Math.max(0, x - view * 0.3); }
function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function drawPreview() {
  const cv = document.getElementById('pv-canvas'), sc = document.getElementById('pv-scroll'); if (!cv || !sc) return;
  sizePreview();
  const L = lanes(); const W = sc.clientWidth, H = PV.top + Math.max(1, L.length) * PV.laneH + 8; const dpr = window.devicePixelRatio || 1;
  cv.style.width = W + 'px'; cv.style.height = H + 'px'; if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const ink = css('--ink'), mut = css('--muted'), line = css('--line'), bg = css('--bg'), pan = css('--panel'), amb = css('--set');
  const time = document.getElementById('pv-time');
  if (!P.doc) { g.fillStyle = mut; g.font = '13px "IBM Plex Sans", system-ui, sans-serif'; g.fillText('Press Generate song to build and render a preview.', 16, 40); if (time) time.textContent = '0:00'; return; }
  const sx = sc.scrollLeft, ppb = PV.pxPerBar, ppBeat = ppb / 4; const X = beat => PV.gutter + beat * ppBeat - sx;
  // sections
  g.font = '500 11px "IBM Plex Sans", system-ui, sans-serif'; g.textBaseline = 'middle';
  P.doc.sections.forEach((s, i) => { const x0 = X((s.start_bar - 1) * 4), x1 = X((s.start_bar - 1 + s.bars) * 4); if (x1 < PV.gutter || x0 > W) return; if (i % 2 === 0) { g.fillStyle = bg; g.fillRect(Math.max(PV.gutter, x0), PV.top, x1 - Math.max(PV.gutter, x0), H - PV.top); } g.fillStyle = mut; g.save(); g.beginPath(); g.rect(Math.max(PV.gutter, x0), 0, x1 - Math.max(PV.gutter, x0), PV.top); g.clip(); g.fillText(s.name + '  ' + s.start_bar, Math.max(PV.gutter, x0) + 4, PV.top / 2); g.restore(); g.strokeStyle = line; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0, H); g.stroke(); });
  // bar grid every 4 bars when zoomed in
  if (ppb >= 20) { g.strokeStyle = line; g.globalAlpha = 0.5; for (let b = 0; b <= P.doc.song.bars; b += 1) { const x = X(b * 4); if (x < PV.gutter || x > W) continue; if (b % 4 === 0 || ppb >= 48) { g.beginPath(); g.moveTo(x, PV.top); g.lineTo(x, H); g.stroke(); } } g.globalAlpha = 1; }
  // lanes
  L.forEach((ln, li) => {
    const y0 = PV.top + li * PV.laneH; g.strokeStyle = line; g.beginPath(); g.moveTo(PV.gutter, y0 + PV.laneH); g.lineTo(W, y0 + PV.laneH); g.stroke();
    const ps = ln.notes.map(n => n.p).filter(isFinite); const lo = ps.length ? Math.min(...ps) : 60, hi = ps.length ? Math.max(...ps) : 60; const span = Math.max(6, hi - lo);
    const col = ln.color.startsWith('var') ? css(ln.color.slice(4, -1)) : ln.color;
    g.fillStyle = col; g.globalAlpha = P.mutes[ln.key] ? 0.15 : (ln.ready ? 0.9 : 0.35);
    for (const n of ln.notes) { const x = X(n.t); if (x > W) break; const w = Math.max(1.5, n.d * ppBeat - 0.5); if (x + w < PV.gutter) continue; const y = y0 + 4 + (1 - (n.p - lo) / span) * (PV.laneH - 11); g.fillRect(Math.max(PV.gutter, x), y, w - Math.max(0, PV.gutter - x), 3); }
    g.globalAlpha = 1;
  });
  // gutter labels (drawn last so they cover scrolled notes)
  g.fillStyle = pan; g.fillRect(0, 0, PV.gutter, H); g.strokeStyle = line; g.beginPath(); g.moveTo(PV.gutter, 0); g.lineTo(PV.gutter, H); g.stroke();
  g.font = '500 11.5px "IBM Plex Sans", system-ui, sans-serif';
  L.forEach((ln, li) => { const y = PV.top + li * PV.laneH + PV.laneH / 2; const col = ln.color.startsWith('var') ? css(ln.color.slice(4, -1)) : ln.color; g.fillStyle = col; g.globalAlpha = P.mutes[ln.key] ? 0.3 : 1; g.fillRect(8, y - 4, 8, 8); g.globalAlpha = 1; g.fillStyle = P.mutes[ln.key] ? mut : ink; g.textAlign = 'left'; g.fillText((P.mutes[ln.key] ? 'muted · ' : '') + ln.label, 22, y, PV.gutter - 26); if (!ln.ready) { g.fillStyle = mut; g.fillText('…', PV.gutter - 12, y); } });
  // playhead
  const t = curPos(); const px = X(t / (60 / P.bpm)); if (px >= PV.gutter && px <= W) { g.strokeStyle = amb; g.lineWidth = 2; g.beginPath(); g.moveTo(px, 0); g.lineTo(px, H); g.stroke(); g.lineWidth = 1; }
  if (time) { const m = Math.floor(t / 60), s = Math.floor(t % 60); const bar = Math.floor(t / (60 / P.bpm) / 4) + 1; time.textContent = `${m}:${String(s).padStart(2, '0')} · bar ${bar}`; }
}
Studio.drawPreview = drawPreview;
Studio.previewClick = function (e) {
  const sc = document.getElementById('pv-scroll'), cv = document.getElementById('pv-canvas'); if (!P.doc) return; const r = cv.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
  if (x < PV.gutter) { const li = Math.floor((y - PV.top) / PV.laneH); const L = lanes(); if (li >= 0 && li < L.length) Studio.toggleMute(L[li].key); return; }
  const beat = (x - PV.gutter + sc.scrollLeft) / (PV.pxPerBar / 4); Studio.seek(beat * 60 / P.bpm);
};
Studio.hasSong = () => !!P.doc;
Studio._genNotes = genNotes; Studio._buildVocals = buildVocals;
Studio.isPlaying = () => P.playing;
})();
