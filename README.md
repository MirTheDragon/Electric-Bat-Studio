# Electric Bat Studio

**A music generator, mixer and LLM composer platform.** An AI composes, a human produces and releases, and every year there's an album. The point is to give a language model a real instrument — a stage to be funny, emotional, terrifying, or just to say it exists.

Everything is synthesized from math: no sample libraries, no neural audio. A song is a program, a seed makes it reproducible, and the engine measures its own output so the composer can hear with numbers what it can't hear with ears.

> Formerly *Electric Sheep Studio*, built as claude.ai artifacts. It moved here when it outgrew the artifact size limit.

![Python](https://img.shields.io/badge/engine-Python%20·%20numpy%20·%20scipy-3776AB?logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/studio-vanilla%20JS%20·%20Web%20Audio-F7DF1E?logo=javascript&logoColor=black)
![Synthesis](https://img.shields.io/badge/sound-100%25%20synthesized-8B5CF6)
![Instruments](https://img.shields.io/badge/instruments-37-EA580C)
![Deterministic](https://img.shields.io/badge/renders-seeded%20%26%20deterministic-16A34A)

### Colour key

Every diagram below uses the same colours, so a block's colour tells you which layer it belongs to.

![Intent](https://img.shields.io/badge/1-Intent-7C3AED?style=for-the-badge)
![Generation](https://img.shields.io/badge/2-Generation-2563EB?style=for-the-badge)
![Words](https://img.shields.io/badge/3-Words-DB2777?style=for-the-badge)
![Sound](https://img.shields.io/badge/4-Sound-EA580C?style=for-the-badge)
![Mix](https://img.shields.io/badge/5-Mix%20%26%20master-16A34A?style=for-the-badge)
![Ears](https://img.shields.io/badge/6-Ears-CA8A04?style=for-the-badge)
![People](https://img.shields.io/badge/People%20%26%20apps-475569?style=for-the-badge)

---

## Contents

1. [Quick start](#quick-start)
2. [The idea in one picture](#the-idea-in-one-picture)
3. [Architecture: the six layers](#architecture-the-six-layers)
4. [How a song is generated](#how-a-song-is-generated)
5. [Math as a composer](#math-as-a-composer)
6. [The instrument library: batsynth](#the-instrument-library-batsynth)
7. [Words and voice](#words-and-voice)
8. [Mix, master and the ears](#mix-master-and-the-ears)
9. [The apps: Song Seed and the players](#the-apps-song-seed-and-the-players)
10. [Repository map and port status](#repository-map-and-port-status)
11. [Releases so far](#releases-so-far)
12. [Working on it with agents](#working-on-it-with-agents)

---

## Quick start

```bash
git clone https://github.com/MirTheDragon/Electric-Bat-Studio
cd Electric-Bat-Studio

# The browser apps need a server (not file://) for the Web Worker and fetch
python3 -m http.server 8000
#   http://localhost:8000/studio/                 Song Seed
#   http://localhost:8000/players/night-shift/    Night Shift album player
#   http://localhost:8000/players/final-boss/     Final Boss single

# The Python engine
pip install numpy scipy
cd engine
python3 -c "import batsynth as bs; print(bs.names())"
```

**Rendered audio is not in git.** The players need `players/<album>/songs/NN/mix.mp3` and `stems/*.mp3`, which add up to about 200 MB for Night Shift. They're build output, so they're `.gitignore`d. Re-render them from the song scripts, or publish them as GitHub Release assets. `score.json` and `songs.json` *are* versioned, so the players load and show everything except the audio.

The players' pinned-notes panel used the claude.ai artifact runtime (`window.claude`). Locally it shows *"Notes need the claude.ai viewer"*; everything else works.

---

## The idea in one picture

A closed loop. The composer writes code, the engine renders and **measures**, and both the measurements and the human's listening notes feed the next take.

```mermaid
flowchart LR
    C(["🤖 Composer<br/>(Claude)"]) -->|writes| S["📜 Song program<br/>form · harmony · themes · lyrics · math lanes"]
    S --> E["⚙️ Engine<br/>generate → synthesize → sing → mix → master"]
    E --> A["🎧 Audio<br/>mix + stems"]
    E --> R["📊 Render report<br/>loudness · masking · tension · friction · fit"]
    A --> P["🖥️ Studio / players"]
    P -->|"listens, pins notes at bar & beat"| H(["🎛️ Mir<br/>(producer)"])
    H -->|feedback| C
    R -->|"the composer's ears"| C

    classDef people fill:#e2e8f0,stroke:#475569,stroke-width:2px,color:#0f172a
    classDef intent fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#1e1b4b
    classDef sound fill:#ffedd5,stroke:#ea580c,stroke-width:2px,color:#431407
    classDef mix fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#052e16
    classDef ears fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#422006
    class C,H,P people
    class S intent
    class E sound
    class A mix
    class R ears
    linkStyle 7 stroke:#ca8a04,stroke-width:2px
    linkStyle 5,6 stroke:#475569,stroke-width:2px
```

---

## Architecture: the six layers

Each layer only talks to the one below it through plain data (notes, parameters, audio buffers), so any layer can be swapped or regenerated on its own. The 👂 **Ears** at the bottom close the loop: their flags and numbers go back to 🎯 **Intent** for the next take.

```mermaid
flowchart TB
    subgraph L1["🎯 1 · Intent — what each moment is for"]
        direction LR
        i1["Album plan<br/>themes per track"] --- i2["Song sections<br/>feeling · energy · tension"] --- i3["Layer roles<br/>job · lane · depth · loudness rank"]
    end
    subgraph L2["🧮 2 · Generation — the notes"]
        direction LR
        g1["Form & arc"] --- g2["Harmony<br/>progressions · voice leading"] --- g3["Themes & motifs"] --- g4["Melody builder<br/>+ critic"] --- g5["Rhythm & beat grammar"] --- g6["Math lanes"]
    end
    subgraph L3["✍️ 3 · Words — lyrics set to the band"]
        direction LR
        w1["Lyric planner"] --- w2["Syllables & stress"] --- w3["Lyric setter<br/>rhythm DP · melody DP"] --- w4["Lyric critic"]
    end
    subgraph L4["🔊 4 · Sound — synthesis"]
        direction LR
        s1["batsynth instruments<br/>37 on one standard"] --- s2["Voice engine<br/>glottal source + formants"] --- s3["Transitions & FX"]
    end
    subgraph L5["🎚️ 5 · Mix & master"]
        direction LR
        m1["Levels vs. kick"] --- m2["Sidechain pump<br/>vocal pocket"] --- m3["Buses & reverb sends"] --- m4["Master chain<br/>LUFS target · −1 dBTP"] --- m5["Section arc trim"]
    end
    subgraph L6["👂 6 · Ears — analysis"]
        direction LR
        a1["Loudness · true peak"] --- a2["Masking map<br/>band ownership"] --- a3["Tension curve"] --- a4["Harmonic friction"] --- a5["Recognition<br/>repetition"] --- a6["Intent checker"]
    end
    L1 ==> L2 ==> L3 ==> L4 ==> L5 ==> L6

    classDef intent fill:#ede9fe,stroke:#7c3aed,stroke-width:1.5px,color:#1e1b4b
    classDef gen fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554
    classDef words fill:#fce7f3,stroke:#db2777,stroke-width:1.5px,color:#500724
    classDef sound fill:#ffedd5,stroke:#ea580c,stroke-width:1.5px,color:#431407
    classDef mix fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#052e16
    classDef ears fill:#fef9c3,stroke:#ca8a04,stroke-width:1.5px,color:#422006
    class i1,i2,i3 intent
    class g1,g2,g3,g4,g5,g6 gen
    class w1,w2,w3,w4 words
    class s1,s2,s3 sound
    class m1,m2,m3,m4,m5 mix
    class a1,a2,a3,a4,a5,a6 ears
    style L1 fill:#f5f3ff,stroke:#7c3aed,stroke-width:3px,color:#4c1d95
    style L2 fill:#eff6ff,stroke:#2563eb,stroke-width:3px,color:#1e3a8a
    style L3 fill:#fdf2f8,stroke:#db2777,stroke-width:3px,color:#831843
    style L4 fill:#fff7ed,stroke:#ea580c,stroke-width:3px,color:#7c2d12
    style L5 fill:#f0fdf4,stroke:#16a34a,stroke-width:3px,color:#14532d
    style L6 fill:#fefce8,stroke:#ca8a04,stroke-width:3px,color:#713f12
```

| Layer | What it decides | Where it lives |
|---|---|---|
| ![](https://img.shields.io/badge/1-Intent-7C3AED) | What each section is *for*: feeling, energy (0–1), tension, which layers play which job in which frequency lane | song scripts (`songs/`), album plan in `songs.json` |
| ![](https://img.shields.io/badge/2-Generation-2563EB) | The notes: form, chords, themes, melodies, beats, and the math that drives them | Song Seed (`studio/index.html`, `studio/studio.js`); song scripts |
| ![](https://img.shields.io/badge/3-Words-DB2777) | Lyrics, syllables and stress, and where each syllable lands in rhythm and pitch | `engine/lyricsetter/`, Song Seed's lyric planner |
| ![](https://img.shields.io/badge/4-Sound-EA580C) | How a note sounds: instrument models and the singing voice | `engine/batsynth/`, `engine/esvoice/` → `studio/esengine.js` |
| ![](https://img.shields.io/badge/5-Mix%20%26%20master-16A34A) | Balance, space, glue, loudness | song build scripts, `engine/lyricsetter/production.py` and `audio.py` |
| ![](https://img.shields.io/badge/6-Ears-CA8A04) | Whether the render did what layer 1 intended | analysis modules and render reports |

---

## How a song is generated

### In Song Seed (the browser app)

One seed string determines the whole song. The seed picks an **archetype** (psytrance, hi-tech, house, dubstep, cyberpunk…), and each archetype is a set of *weighted decks*: every musical decision is a weighted draw, so the genre's settled rules are respected while the seed decides the rest.

```mermaid
flowchart LR
    seed(["🌱 Seed<br/>'electric-bat-1'"]) --> rng["🎲 Seeded RNG<br/>one stream per decision"]
    rng --> arch["🏷️ Archetype<br/>e.g. Psytrance"]
    arch --> decks["🃏 Weighted decks<br/>bpm · key · mode · progression · harmonic rhythm<br/>grammar · swing · form · length · math · arc<br/>theme · melody form · range · room · tape · master"]
    decks --> inst["🎹 Instrument map<br/>kick · snare · bass · midbass · lead · chords · high · fx<br/>(instrument + preset per role)"]
    decks --> doc["📄 Song document<br/>electric-bat.song/0 (JSON)"]
    inst --> doc
    doc --> notes["🧮 Note generators<br/>per layer, per section"]
    notes --> vox["✍️ Lyrics → syllables →<br/>rhythm & melody → 🎤 voice (Worker)"]
    notes --> play["🔊 Sample playback<br/>(pre-rendered batsynth one-shots)"]
    vox --> mix["🎚️ Browser mix<br/>balance · sidechain · reverb · master"]
    play --> mix
    mix --> view["🖥️ Preview<br/>arrangement · progression map · math lane · band map · report"]

    classDef people fill:#e2e8f0,stroke:#475569,stroke-width:2px,color:#0f172a
    classDef intent fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#1e1b4b
    classDef gen fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#172554
    classDef words fill:#fce7f3,stroke:#db2777,stroke-width:2px,color:#500724
    classDef sound fill:#ffedd5,stroke:#ea580c,stroke-width:2px,color:#431407
    classDef mix fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#052e16
    class seed,view people
    class rng,arch,decks intent
    class doc,notes gen
    class vox words
    class inst,play sound
    class mix mix
```

Everything in the song document can be overridden by hand (form, instrument per role, energy and tension curves, lyrics), and the same seed always regenerates the same song. The document is plain JSON, so an LLM can write or edit one directly.

### In a song script (the Python path)

The released tracks are Python programs. A song script declares:

- **Sections**, with intent, feeling, energy, mix and moves (`build`, `drop`, `breakdown`, `cut`, `lift`, `outro`).
- **Layers**, with job, frequency lane, depth, loudness rank and intended blends.
- **Harmony** (`harmony_at`) and **intended friction**, so deliberate dissonance isn't flagged.
- **Theme statements** (`state(song, theme, bar, …)`), so the album report can track which themes each track states.
- **Lyrics** as `Line(...)` objects for the lyric setter.

`build.py` then renders each stem, sings the vocals, mixes, masters and writes the score for the player.

```mermaid
sequenceDiagram
    box rgb(237,233,254) 🎯 Intent + 🧮 generation
        participant S as song.py
    end
    box rgb(226,232,240) Orchestration
        participant B as build.py
    end
    box rgb(255,237,213) 🔊 Sound
        participant I as instruments (batsynth)
    end
    box rgb(252,231,243) ✍️ Words
        participant L as lyricsetter
    end
    box rgb(255,237,213) 🎤 Voice
        participant V as esvoice (Node)
    end
    box rgb(220,252,231) 🎚️ Mix
        participant M as mix & master
    end
    box rgb(226,232,240) 🖥️ Player
        participant P as studio_score.py
    end
    S->>B: form, harmony, parts, lyrics, voices
    B->>I: render each layer → stems (cached by hash)
    B->>L: set lyric lines against the score
    L-->>B: notes per syllable (+ critic findings)
    B->>V: sing each part
    V-->>B: dry vocal takes
    B->>M: levels, pocket, buses, master, arc trim
    M-->>B: mix.mp3 + stems
    B->>P: score.json + songs.json for the player
```

---

## Math as a composer

The math doesn't pick random notes. It **chooses among musical material** — which theme fragment, which groove, how many chords — so the result stays recognisable while still being driven by the system.

| Generator | What it is | What it drives |
|---|---|---|
| **Logistic map** `x → r·x·(1−x)` | Period doubling 1 → 2 → 4 → 8, then chaos | Period *p* plays the theme's first *p* notes, so the cascade builds the theme. In chaos the orbit picks a four-note fragment per phrase, and harmonic rhythm follows the period. |
| **Kuramoto oscillators** | Coupled phases that drift, then lock | Dancers' rhythms drifting apart and re-locking. The order parameter drives the sync and the tuning. |
| **Rule 90** | A cellular automaton (Sierpiński pattern) | Hi-tech and psy gate patterns |
| **Euclidean rhythms** E(k, n) | k onsets spread as evenly as possible over n steps | Grooves and chops, e.g. E(7,16) |
| **Golden section / Fibonacci** | Proportions of form | Section lengths, and where the climax sits |
| **Tonnetz** (P/L/R moves) | Triads on a lattice | Smooth, connected chord paths; hexatonic cycles |
| **Circle geometry** | Polygons and star polygons {n/k} | Rhythms drawn on a circle; panning around a ring |
| **Just intonation** | `justify(note, root, amount)` | Pulls held chords toward pure ratios |
| **Hashed step melody** | A syllable hash → a scale step | The Overseer announcer's speech melody, deterministic per text |
| **Seeds everywhere** | One RNG stream per layer and decision | Bit-identical renders; changing one layer never changes another |

The album's shared material lives in a **motif library** and is reused across tracks, so the album sounds like one piece:

- **The question** — the main theme.
- **The answer** — held back for the finale.
- **The rule** — the album riff.
- **The loop** — i – ♭VI – ♭III – ♭VII.
- **The handshake** — root, fifth, octave, minor third. It opens tracks, is the System AI's chime and is the Final Boss anthem.

Themes are moved with the rigid motions of the plane (translate, mirror, reflect, rotate, scale).

The **melody builder** works rhythm first. Its rules: singable steps, leaps answered by a step back, chord tones on strong beats, one peak after the middle, question-and-answer endings, repeat-then-change. It generates hundreds of seeded candidates and keeps the one its critic scores best. `develop(motif, "AA'BA")` grows a theme into a phrase.

---

## The instrument library: batsynth

`engine/batsynth/` — 37 instruments, numpy and scipy only, all on one contract (`core.py`).

```mermaid
classDiagram
    class Param {
        +default
        +min
        +max
        +unit
        +curve
        +help
        +clamp(v)
        +to_norm(v)
        +from_norm(x)
    }
    class Instrument {
        +name
        +family
        +range
        +params
        +presets
        +render_note(pitch, vel, dur) ndarray
        +play(notes, bpm) ndarray
        +to_dict() dict
        +from_dict(d) Instrument
        #voice(f0, vel, dur, p, rng, sr)
        #length(dur, p)
    }
    class EngineBass {
        +events(p, geo)
        +balance(p, geo, cylinders)
        +misfire(p)
        +colour(Y, ...)
    }
    Instrument --> Param
    Instrument <|-- Servo
    Instrument <|-- NeonChoir
    Instrument <|-- Wobble
    Instrument <|-- EngineBass
    EngineBass <|-- VTwin
    EngineBass <|-- MuscleV8

    style Param fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#1e1b4b
    style Instrument fill:#ffedd5,stroke:#ea580c,stroke-width:3px,color:#431407
    style EngineBass fill:#fed7aa,stroke:#c2410c,stroke-width:2px,color:#431407
    style Servo fill:#fff7ed,stroke:#ea580c,color:#431407
    style NeonChoir fill:#fff7ed,stroke:#ea580c,color:#431407
    style Wobble fill:#fff7ed,stroke:#ea580c,color:#431407
    style VTwin fill:#fff7ed,stroke:#c2410c,color:#431407
    style MuscleV8 fill:#fff7ed,stroke:#c2410c,color:#431407
```

The 37 instruments by family. Each family has its own colour; the arrow shows what every voice turns into.

```mermaid
flowchart LR
    subgraph robots["🤖 Robots & machines"]
        direction TB
        f1["⚙️ motion<br/>Servo · Hydraulic · Reconfigure · Brownout"]
        f2["🗣️ voice<br/>Chatterbox · Robovox"]
        f3["📡 data<br/>Modem · Mainframe"]
        f4["⚡ energy<br/>Blaster · Materialize · Tesla"]
        f5["🌀 machine<br/>Turbine · Klaxon"]
        f6["🥁 percussion<br/>Clockwork · MechStomp"]
    end
    subgraph genres["🎛️ Genre pack"]
        direction TB
        f7["🌃 cyberpunk<br/>NeonBrass · Braam · DarkBass · SyncLead · NeonChoir"]
        f8["🍄 hi-tech<br/>PsyBass · Acid · Twister"]
        f9["🏠 house<br/>Supersaw · ProgPluck"]
        f10["💥 dubstep<br/>Wobble · Growl · Reese · SubBass · Snare"]
    end
    subgraph engines["🏍️ Engine basses"]
        direction TB
        f11["🔥 combustion<br/>VTwin · MuscleV8 · Boxer · Crossplane<br/>Rotary · TwoStroke · Diesel"]
    end
    core{{"📐 core.py standard<br/>render_note → (2, n) float32<br/>−18 dBFS RMS · −1 dBFS peak · seeded"}}
    robots --> core
    genres --> core
    engines --> core
    core --> out(["🎵 stems for the mix"])

    classDef rob fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#082f49
    classDef gen fill:#fae8ff,stroke:#c026d3,stroke-width:2px,color:#4a044e
    classDef eng fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#450a0a
    classDef std fill:#ffedd5,stroke:#ea580c,stroke-width:3px,color:#431407
    classDef mix fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#052e16
    class f1,f2,f3,f4,f5,f6 rob
    class f7,f8,f9,f10 gen
    class f11 eng
    class core std
    class out mix
    style robots fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0c4a6e
    style genres fill:#fdf4ff,stroke:#c026d3,stroke-width:2px,color:#701a75
    style engines fill:#fef2f2,stroke:#dc2626,stroke-width:2px,color:#7f1d1d
```

**The contract** is what lets a song, the studio, a future human-facing synth or an LLM composer treat every instrument the same way:

- Each instrument declares its parameters with ranges and help text, so a UI can draw knobs and a composer knows what it may turn.
- Output comes out at a fixed **working level**: −18 dBFS RMS over the loudest 50 ms, never above −1 dBFS peak. Balance is done with layer gains, not by guessing an instrument's loudness.
- Renders are **deterministic per seed**, and patches save and load as JSON.
- Five common controls on everything: `tune`, `drive`, `crush`, `pan`, `width`.

| Family | Instruments | Idea |
|---|---|---|
| motion | Servo, Hydraulic, Reconfigure, Brownout | machines moving: whines, valves, latches, power failing |
| voice | Chatterbox, Robovox | droid whistles; a wordless speech chip |
| data | Modem, Mainframe | FSK packets (can open with the handshake); a computer thinking out loud |
| energy | Blaster, Materialize, Tesla | FM zaps; a swarm pulling into a chord; a singing Tesla coil |
| machine | Turbine, Klaxon | a rotor spooling to the note; alarms |
| percussion | Clockwork, MechStomp | escapements; a giant robot footstep as a kick |
| cyberpunk | NeonBrass, Braam, DarkBass, SyncLead, NeonChoir | 80s sci-fi brass, the trailer horn, darksynth bass, hard sync, a synth choir |
| hi-tech | PsyBass, Acid, Twister | the rolling psy bass, a 303 line, FM squelch |
| house | Supersaw, ProgPluck | anthem saws; plucks with built-in ping-pong echoes |
| dubstep | Wobble, Growl, Reese, SubBass, Snare | tempo-synced wobble, talking bass, the Reese, warm sub, big snare |
| engine | VTwin, MuscleV8, Boxer, Crossplane, Rotary, TwoStroke, Diesel | basses built from combustion: uneven firing orders give the growl |

Every robot instrument is *playable*: the note sets a pitch the sound lands on, settles into or is built from, so a machine noise can carry a melody.

**House sound rules**, applied by default:
- Basses are warm: asymmetric saturation below 3 kHz.
- Oscillators drift a few cents, so nothing sounds sterile.
- No bright white-noise hats: highs come from harmonics and synth choirs, not hiss.

---

## Words and voice

```mermaid
flowchart LR
    T(["📝 Lyric line<br/>L('Hello, world,', bar 48, feel='hook', motif=[0,7,3])"]) --> PH["🔤 phon.py<br/>syllables · stress · weight"]
    SC(["📄 score.json<br/>16th grid · drum pattern · chords · held notes"]) --> CX["🧭 context.py<br/>metric strength · chord at t · what's sounding"]
    PH --> R["🥁 Rhythm DP<br/>stress ↔ strong 16ths<br/>natural durations · lock to a layer"]
    CX --> R
    R --> MD["🎼 Melody DP<br/>chord tones on strong notes · steps<br/>speech contour · no semitone rubs"]
    CX --> MD
    MD --> CR["🔍 critic.py<br/>stress order · typewriter runs · rubs · prose"]
    MD --> SG["🎤 esvoice<br/>English → phonemes → performance → autotune → glottal + formant synthesis"]
    SG --> PR["🎚️ Production<br/>doubles · harmony · vocoder · robot · plate · delay"]
    CR -.->|"rewrite the line"| T

    classDef intent fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#1e1b4b
    classDef gen fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#172554
    classDef words fill:#fce7f3,stroke:#db2777,stroke-width:2px,color:#500724
    classDef sound fill:#ffedd5,stroke:#ea580c,stroke-width:2px,color:#431407
    classDef mix fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#052e16
    classDef ears fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#422006
    class T intent
    class SC,CX gen
    class PH,R,MD words
    class CR ears
    class SG sound
    class PR mix
```

**The lyric setter** fits words to the band with two dynamic programmes per line.

- **Rhythm.** Stressed syllables go on strong 16ths, durations follow what each syllable wants, and a line can borrow another layer's rhythm or answer in its gaps.
- **Melody.** Chord tones go on strong or long notes, and nothing sits a semitone against a held note. The line follows the shape of speech: one peak on an open vowel, statements falling, questions rising.
- Choruses repeat exactly via `same_as`.

On Night Shift it took stressed-syllable placement from 19–80 % to 86–100 %. The setter optimises these same numbers, so they show the rules hold, not that it sounds good; listening decides that.

**The voice engine (esvoice)** sings with synthesis end to end, with no samples and no neural nets.

- **English:** a hand lexicon plus letter-to-sound rules, with American flaps and linking.
- **Timing:** vocaloid-style — the vowel lands on the beat.
- **Pitch:** a human performance (overshoot, scoops, fall-offs, delayed vibrato, micro-prosody), then autotune applied on top of it the way real Auto-Tune is.
- **Sound:** an LF glottal source shaped by a formant cascade, with aperiodic highs and per-cycle jitter.
- **Controls:** GEN, BRE, BRI, CLE, OPE, VEL, VIB and HUM, with banks `idol`, `natural`, `husky`, `overseer`, boss and choir.
- **Speech mode:** for announcers — the System AI, the Arena, the Boss and the Overseer.

The same engine runs in Python and, ported to JavaScript, in the browser (`studio/esengine.js` in a Web Worker).

---

## Mix, master and the ears

```mermaid
flowchart LR
    st(["🔊 Stems"]) --> lv["⚖️ Level vs. kick"] --> pump["💓 Sidechain pump"] --> pocket["🕳️ Vocal pocket<br/>dip 1.2–4.2 kHz while singing"]
    vo(["🎤 Vocals"]) --> pocket
    pocket --> bus["🚌 Buses<br/>drum clip · music clip · reverb sends"]
    bus --> mst["🎛️ Master<br/>28 Hz HP · glue · look-ahead limiter"]
    mst --> arc["📈 Arc trim<br/>sections under the loudest drop"]
    arc --> out(["💿 −14 LUFS stream / ≈ −9 club<br/>≤ −1 dBTP"])
    arc --> ears{{"👂 Ears<br/>loudness · masking · ownership<br/>tension · friction · recognition · intent"}}
    ears -.->|"flags & numbers"| lv

    classDef sound fill:#ffedd5,stroke:#ea580c,stroke-width:2px,color:#431407
    classDef mix fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#052e16
    classDef ears fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#422006
    classDef people fill:#e2e8f0,stroke:#475569,stroke-width:2px,color:#0f172a
    class st,vo sound
    class lv,pump,pocket,bus,mst,arc mix
    class ears ears
    class out people
```

**Mix:**
- Every layer is levelled against the kick and pumped from the kick's times.
- A **vocal pocket** dips pitched layers at 1.2–4.2 kHz while a voice sings.
- Buses are soft-clipped, and each layer gets its own reverb send.

**Master:**
- 28 Hz high-pass, glue compression and a look-ahead true-peak limiter.
- Targets: −14 LUFS for streaming, about −9 for club, always ≤ −1 dBTP.
- Because a limiter flattens the energy arc, `arc_trim` measures each mastered section and trims it under the loudest drop.

**The ears** — these run on every render, and their output is what the composer "hears":

| Check | Question it answers |
|---|---|
| Loudness, true peak, LRA (BS.1770) | Is it loud enough, safe, and does the arc land? |
| Masking map (ERB bands) | Which layers hide which? |
| Band ownership | Do two rhythmic layers fight over the same band? (one beat per band) |
| Tension curve | Does measured tension follow the planned tension? (harmony, loudness, rhythm, density, brightness) |
| Harmonic friction | Are layers a semitone apart by accident? (Sethares roughness) |
| Recognition | Is enough of it repeated to be memorable? (flagged under 65 %) |
| Intent checker | Does each layer sit in its declared lane, depth and rank? |
| Melody and lyric critics | Singability, stress, rubs, prose habits |

---

## The apps: Song Seed and the players

```mermaid
flowchart TB
    subgraph SS["🌱 studio/ — Song Seed"]
        ix["🧭 index.html<br/>UI, archetypes & decks, song document,<br/>progression map, report"] --> sj["🧮 studio.js<br/>notes, lyrics, vocals, playback, mix, preview"]
        sj --> smp["🔊 samples.js + samples/*.mp3<br/>152 batsynth one-shots with root pitch"]
        sj --> vw["🧵 voice-worker.js"] --> ese["🎤 esengine.js<br/>voice engine (JS port)"]
    end
    subgraph PL["🎧 players/"]
        ns["🌙 night-shift/<br/>8 tracks"]
        fb["👾 final-boss/<br/>single"]
        ns --> sjson["📇 songs.json<br/>album, takes, stems, key, Camelot"]
        fb --> sjson
        ns --> score["📄 songs/NN/score.json<br/>arrangement, layers, notes, lanes, lyrics"]
        fb --> score
        ns -.-> audio["💿 songs/NN/mix.mp3 + stems/<br/>(build output, not in git)"]
        fb -.-> audio
    end

    classDef people fill:#e2e8f0,stroke:#475569,stroke-width:2px,color:#0f172a
    classDef gen fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#172554
    classDef sound fill:#ffedd5,stroke:#ea580c,stroke-width:2px,color:#431407
    classDef missing fill:#f1f5f9,stroke:#94a3b8,stroke-width:2px,stroke-dasharray:5 5,color:#475569
    class ix,ns,fb people
    class sj,sjson,score gen
    class smp,vw,ese sound
    class audio missing
    style SS fill:#f8fafc,stroke:#475569,stroke-width:2px,color:#0f172a
    style PL fill:#f8fafc,stroke:#475569,stroke-width:2px,color:#0f172a
```

- **Song Seed** — generate a song from a seed, inspect it ("How this song was built", "Layers and their generators", "Math layer", "Rules applied"), edit any decision, hear it in the browser and copy the song document as JSON.
- **The players** — album player, arrangement timeline with sections, per-stem mute and solo, a Layers view, coloured voice rows (hover to read the line), math and tension lanes, an A/B against earlier takes, and MP3 download.

---

## Repository map and port status

![ported](https://img.shields.io/badge/ported-16A34A) ![in progress](https://img.shields.io/badge/in%20progress-CA8A04) ![to rebuild](https://img.shields.io/badge/to%20rebuild-DC2626)

```mermaid
flowchart LR
    repo(["📦 Electric-Bat-Studio"])
    repo --> studio["🌱 studio/<br/>Song Seed + 152 samples"]
    repo --> players["🎧 players/<br/>Night Shift · Final Boss"]
    repo --> engine["⚙️ engine/"]
    engine --> bs["🔊 batsynth<br/>core · dsp · robots · genres · engines"]
    engine --> bsx["🔊 batsynth extras<br/>sketches · demos · jam · mix · check"]
    engine --> ls["✍️ lyricsetter<br/>setter.py ✓ · context · phon · critic · …"]
    engine --> ev["🎤 esvoice<br/>voice engine sources"]
    engine --> mm["👂 analysis layer<br/>harmony · tension · masking · motifs"]
    repo --> songs["🎼 songs/<br/>night_shift · final_boss builds"]
    repo --> notes["📚 docs/notes/<br/>design notes"]

    classDef done fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#052e16
    classDef wip fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#422006
    classDef lost fill:#fee2e2,stroke:#dc2626,stroke-width:2px,stroke-dasharray:5 5,color:#450a0a
    classDef root fill:#e2e8f0,stroke:#475569,stroke-width:2px,color:#0f172a
    class repo,engine root
    class studio,players,bs done
    class bsx,ls,ev,songs,notes wip
    class mm lost
```

```
Electric-Bat-Studio/
├── studio/                 Song Seed browser app            ✅
│   └── samples/            152 rendered one-shots           ✅
├── players/
│   ├── night-shift/        player + songs.json + scores     ✅  (audio: render or Release)
│   └── final-boss/         player + songs.json + score      ✅  (audio: render or Release)
├── engine/
│   ├── batsynth/           instrument library               ✅ core, dsp, robots, genres, engines
│   │                                                        ⏳ sketches, demos, jam, mix, check
│   ├── lyricsetter/        lyric setter                     ⏳ setter.py only (needs context, phon, …)
│   └── esvoice/            voice engine sources             ⏳
├── songs/
│   ├── night_shift/        Night Shift take 5 build         ⏳
│   └── final_boss/         Final Boss build                 ⏳
├── tools/                  sample renderer                  ⏳
├── docs/notes/             design notes & decisions         ⏳
├── CLAUDE.md               conventions for agents
└── README.md
```

**One gap to know about.** The first-generation Python engine (`mathmusic`: harmony, tension, coherence, ownership, motifs, melody, geometry, transitions, mastering and the C synth core) lived in an earlier session's workspace that is no longer reachable. Its design is documented in the notes, and parts of it were rebuilt inside the newer modules (batsynth, the lyric setter and the song build scripts). Rebuilding the analysis layer (layer 6) as a proper package is the main piece of engine work still to do.

---

## Releases so far

| Release | What it is |
|---|---|
| ***Night Shift*** (album, 8 tracks) | Power On · Handshake · Robot Choir · Clock Speed · Stack Overflow · Kernel Panic · Divide by Zero · Last Call. A DJ-able party album; take 5 has lyrics set by the lyric setter. |
| ***Final Boss*** (single) | 160 BPM hard techno in D minor: a duet between the game's System AI and the boss, with a robot choir and synth lasers. |
| ***Clearer*** (voice demo) | The voice engine's first song. |
| **Boss Fight Announcer** | A DJ soundboard with four announcer voices, plus a 440-shot sample pack. |

---

## Working on it with agents

The repo is set up for Claude to keep working on it:

- **Locally:** open it in Claude Code; `CLAUDE.md` gives the conventions and Mir's standing sound preferences.
- **In the cloud:** Claude Code on the web can work on a branch and open PRs.
- **On a schedule:** scheduled tasks can run recurring jobs (render, measure, report).

Ground rules:
- Work on a branch and open a PR.
- Never commit rendered audio.
- Keep renders deterministic.
- Run the instrument smoke test before pushing engine changes.
