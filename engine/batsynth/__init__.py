"""batsynth: the Electric Bat instrument library.

    import batsynth as bs
    servo = bs.get("Servo", preset="Heavy arm")
    audio = servo.play([(0, 0.5, 64), (0.5, 0.5, 67)], bpm=120)   # (2, n) float32

    bs.names()               # every instrument
    bs.names("percussion")   # one family
    bs.catalog()             # parameter schemas and presets, for a UI or a composer

See core.py for the standard every instrument follows.
"""
from .core import (COMMON, PATCH_FORMAT, Instrument, Note, Param, REGISTRY,
                   catalog, get, names, register)
from . import dsp
from . import robots  # registers the robot instruments
from . import genres  # registers the genre pack
from . import engines  # registers the engine basses
from .genres import acid_line, psy_roll, tempo_hz

__version__ = "0.3.0"
__all__ = ["COMMON", "PATCH_FORMAT", "Instrument", "Note", "Param", "REGISTRY",
           "catalog", "get", "names", "register", "dsp", "robots", "genres", "engines",
           "acid_line", "psy_roll", "tempo_hz"]
