# Electric Bat Studio

Music generator, mixer and LLM composer platform — an experiment in giving an AI a free stage to make its own music. Formerly "Electric Sheep Studio" (claude.ai artifacts); this repo is its new home now that the project outgrew the artifact size limit.

## What's here

| Path | What it is | Runs with |
|---|---|---|
| `studio/` | **Song Seed** — the browser studio: song structure, instrument map, lyrics, sung voice (`esengine.js` in a Web Worker) and 152 rendered instrument samples | any static web server |
| `players/night-shift/` | Album player for *Night Shift* (8 tracks): song list, scores, per-stem mixer | static server + rendered audio |
| `players/final-boss/` | Player for the *Final Boss* single | static server + rendered audio |
| `engine/batsynth/` | The instrument library: 37 instruments (robots, genre pack, engine basses) on one standard — params, presets, patches, deterministic renders | Python 3.10+, numpy, scipy |
| `engine/lyricsetter/` | Sets lyrics to the band: rhythm and melody DPs (porting in progress) | Python |
| `docs/notes/` | Design notes and decisions from the claude.ai project (porting in progress) | — |

## Run it locally

```bash
git clone https://github.com/MirTheDragon/Electric-Bat-Studio
cd Electric-Bat-Studio

# Web studio and players (needs a server, not file://, because of the Web Worker and fetch)
python3 -m http.server 8000
#   → http://localhost:8000/studio/
#   → http://localhost:8000/players/night-shift/

# Python engine
pip install numpy scipy
cd engine && python3 -c "import batsynth as bs; print(bs.names())"
```

### Rendered audio is not in git

The players expect `players/<album>/songs/NN/mix.mp3` and `stems/*.mp3` (~200 MB for Night Shift). Those are build output: they're `.gitignore`d and should be regenerated from the song scripts, or published as GitHub Release assets. Scores (`score.json`) and `songs.json` *are* versioned. Without the audio the players load but have nothing to play.

The players' pinned notes / requests panel used the claude.ai artifact runtime (`window.claude`); locally it shows "Notes need the claude.ai viewer" and everything else works.

## Status of the port

- [x] Song Seed studio + samples
- [x] Night Shift and Final Boss player pages, song index and scores
- [x] `batsynth` core, dsp, robots, genres, engines (smoke-tested: all 37 instruments render)
- [ ] `batsynth` extras: sketches, demos, jam, mix, check, README
- [ ] `lyricsetter` (only `setter.py` so far — it won't import until `context.py` and `phon.py` land)
- [ ] `esvoice` (the voice engine sources behind `studio/esengine.js`)
- [ ] Song build scripts: Night Shift take 5, Final Boss
- [ ] Design notes

## Working on it with agents

See [`CLAUDE.md`](CLAUDE.md) for the conventions any agent (Claude Code locally, Claude Code on the web, or a scheduled task) should follow.
