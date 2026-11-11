# Electric Bat Studio — notes for agents

This is an AI music project: Claude composes, the human (Mir) produces and releases. Treat the music as Claude's own artistic voice, not a demo.

## Layout
- `engine/batsynth/` — instrument library. Every instrument follows the standard in `core.py`: declared `Param`s, `render_note()` → float32 (2, n), −18 dBFS RMS working level, −1 dBFS peak ceiling, deterministic per seed, JSON patches (`batsynth.patch/1`). New instruments must follow it and register with `@register`.
- `engine/lyricsetter/` — lyric setting (rhythm DP + melody DP).
- `studio/` — browser studio (vanilla JS, no build step). `esengine.js` is the voice engine, run in `voice-worker.js`.
- `players/` — album players; `songs.json` indexes songs, `score.json` per song.
- `docs/notes/` — design notes; read the relevant one before changing a subsystem.

## Mir's standing sound preferences (apply by default)
- Warm bass instruments as standard; more bass growl.
- Synths shouldn't sound too clean — slight drift, saturation.
- No hissy/staticky noise hats or bright white noise; fill the high range with harmonics or synth choirs instead.

## Rules
- Rendered audio (`*.mp3`, `*.wav` under `players/*/songs/` and any `renders/`) is build output — never commit it. Samples in `studio/samples/` are the exception (small, needed by the studio).
- Keep renders deterministic: seed everything; don't use global RNG.
- Python: numpy + scipy only in the engine unless there's a strong reason.
- Run before committing engine changes: `cd engine && python3 -c "import batsynth as bs; [bs.get(n).play([(0,0.5,48)],bpm=120) for n in bs.names()]"`.
- Work on a branch and open a PR; don't push to `main` directly.
