"""Synthesizes the soundtrack: music bed + SFX cues from sfx.json → audio.wav (no samples, nothing licensed).
    python gen_audio.py out-916/sfx.json out-916/audio.wav
"""
import json, sys, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(11)
cue = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'out-916/sfx.json', encoding='utf-8'))
DUR = cue['dur']
N = int(DUR * SR) + SR
music = np.zeros((N, 2))
fx = np.zeros((N, 2))
verb_send = np.zeros((N, 2))


def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR


def add(buf, t0, sig, pan=0.0, gain=1.0):
    """mix a mono (n,) or stereo (n,2) signal into buf at time t0"""
    i = int(t0 * SR)
    if i >= len(buf) or i < 0: return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l, sig * r], 1) * np.sqrt(2)
    n = min(len(sig), len(buf) - i)
    buf[i:i + n] += sig[:n] * gain


def onepole_lp(x, cut):
    """one-pole low-pass; cut may be an array (Hz per sample)"""
    cut = np.broadcast_to(np.asarray(cut, float), x.shape)
    a = np.exp(-2 * np.pi * cut / SR)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y


# ── music: 120 BPM, C – G – Am – F ───────────────────────────────────────────
M = cue['music']
BEAT = M.get('beat', 0.5)
GROOVE0 = M['groove0']               # logo reveal: drums start
LIFT = tuple(M['lift'])              # 16th hats (mobile apps)
BUILD = tuple(M['build'])            # kick drops out, snare roll into the end card
OUTRO = M['outro']                   # end card hit
GROOVE_END = OUTRO + 8 * BEAT        # two more bars under the end card
CHORD_LEN = 8 * BEAT
CHORDS = [  # (bass root, pad voicing)
    (36, [55, 59, 60, 64]),    # Cmaj7
    (43, [55, 59, 62, 67]),    # G
    (45, [57, 60, 64, 67]),    # Am7
    (41, [57, 60, 64, 65]),    # Fmaj7
]
def chord_at(t):
    """the intro sits on F (IV) and resolves to C on the drop; the end card lands on C again"""
    if t >= OUTRO - .01: return CHORDS[0]
    return CHORDS[int(np.floor((t - GROOVE0 + .01) / CHORD_LEN)) % 4]

# pad: one segment per chord
bounds = [0.0] + [GROOVE0 + k * CHORD_LEN for k in range(int((OUTRO - GROOVE0) / CHORD_LEN) + 1)
                  if GROOVE0 + k * CHORD_LEN < OUTRO - .01] + [OUTRO, DUR]
for a, b in zip(bounds[:-1], bounds[1:]):
    root, notes = chord_at(a + .02)
    d = (b - a) + 0.8
    t = tt(d)
    env = np.minimum(1, t / (1.6 if a < GROOVE0 else .4)) * np.clip((d - t) / 0.8, 0, 1)
    for m in notes:
        f = midi(m)
        for det, pan in ((-7, -.6), (7, .6)):
            fd = f * 2 ** (det / 1200)
            sig = sum(np.sin(2 * np.pi * fd * h * t + h) / h * np.exp(-h * .5) for h in range(1, 7))
            sig *= env * (0.85 + 0.15 * np.sin(2 * np.pi * 0.25 * t + m))
            add(music, a, sig, pan, 0.03)
            add(verb_send, a, sig, pan, 0.012)


def kick(g=1.0):
    t = tt(.4)
    f = 48 + 120 * np.exp(-t / .03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .14) * g
def clap():
    t = tt(.25)
    n = rng.standard_normal(len(t))
    n = n - onepole_lp(n, 900)
    e = np.exp(-t / .06) + .6 * np.exp(-np.maximum(0, t - .012) / .02) * (t > .012)
    return n * e * .5 + np.sin(2 * np.pi * 200 * t) * np.exp(-t / .035) * .3
def snare(g=1.0):
    t = tt(.18); n = rng.standard_normal(len(t)); n = n - onepole_lp(n, 1200)
    return (n * np.exp(-t / .05) * .5 + np.sin(2 * np.pi * 210 * t) * np.exp(-t / .03) * .35) * g
def hat(d=.04):
    t = tt(d * 3)
    n = rng.standard_normal(len(t))
    n = np.diff(np.diff(n, prepend=0), prepend=0)
    return n * np.exp(-t / d) * .16
def pluck(m, d=.7):
    t = tt(d); f = midi(m)
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t) + .08 * np.sin(6 * np.pi * f * t)) \
        * np.exp(-t / .17) * np.minimum(1, t / .003)
def crash(d=2.4):
    t = tt(d); n = rng.standard_normal(len(t))
    n = np.diff(n, prepend=0)
    return n * np.exp(-t / .75) * .25

KICK, CLAP = kick(), clap()
ARP = [0, 2, 1, 3, 2, 1, 3, 2]
for k in range(-16, int((GROOVE_END - GROOVE0) / (BEAT / 2)) + 1):     # 8th notes
    t0 = GROOVE0 + k * BEAT / 2
    if t0 < 0: continue
    if t0 >= GROOVE_END: break
    on_beat = k % 2 == 0
    beat_in_bar = (k // 2) % 4
    root, notes = chord_at(t0)
    if t0 < GROOVE0:                                  # intro: soft arp only, fading in
        m = notes[ARP[k % 8]] + 12
        g = .055 * min(1, t0 / 2.5)
        add(music, t0, pluck(m), (-.4 if k % 2 else .4), g)
        add(verb_send, t0, pluck(m), (-.4 if k % 2 else .4), .05)
        continue
    build = BUILD[0] <= t0 < BUILD[1]
    lift = LIFT[0] <= t0 < LIFT[1]
    late_build = build and t0 >= BUILD[1] - 4 * BEAT
    if on_beat and not late_build:
        add(music, t0, KICK, 0, .55)
    if on_beat and beat_in_bar in (1, 3) and not build:
        add(music, t0, CLAP, .1, .3); add(verb_send, t0, CLAP, .1, .12)
    if not on_beat:
        add(music, t0, hat(), .35, .9)
    if lift or build:
        add(music, t0 + BEAT / 4, hat(.02), -.35, .55)
    if not late_build:                                # bass: short 8th pump on the root
        t = tt(.24); f = midi(root)
        b = (np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t)) * np.exp(-t / .14) * np.minimum(1, t / .005)
        add(music, t0, b, 0, .22 if on_beat else .14)
    m = notes[ARP[k % 8]] + 12 + (12 if lift else 0)
    p = pluck(m)
    add(music, t0, p, (-.4 if k % 2 else .4), .055)
    add(verb_send, t0, p, (-.4 if k % 2 else .4), .045)
    add(music, t0 + BEAT * .75, p, (.5 if k % 2 else -.5), .018)   # dotted echo

# snare roll into the end card
n_roll = 16
for i in range(n_roll):
    x = i / n_roll
    t0 = BUILD[1] - 2 * BEAT + x * 2 * BEAT
    add(music, t0, snare(), .05, .12 + .3 * x)

for t0 in (GROOVE0, OUTRO):
    add(music, t0, crash(), 0, .5); add(verb_send, t0, crash(), 0, .2)

# ── SFX ──────────────────────────────────────────────────────────────────────
def bell(f, d=1.2, dec=.5):
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / .15)
            + .12 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / .07)) * np.exp(-t / dec) * np.minimum(1, t / .002)

def s_whoosh(d=.55, lo=300, hi=3200, big=False):
    t = tt(d); x = t / d
    n = rng.standard_normal(len(t))
    cut = lo + (hi - lo) * np.sin(np.pi * np.clip(x * 1.1, 0, 1)) ** 2
    y = onepole_lp(n, cut); y = onepole_lp(y, cut)
    y *= np.sin(np.pi * x) ** 1.5 * .9
    if big:
        y += np.sin(2 * np.pi * np.cumsum(70 + 50 * x) / SR) * np.sin(np.pi * x) * .5
    pan = np.clip(0.7 - 1.4 * x, -1, 1)            # right → left, with the RTL motion
    return np.stack([y * np.cos((pan + 1) * np.pi / 4), y * np.sin((pan + 1) * np.pi / 4)], 1) * 1.4

def s_tap():
    t = tt(.09)
    return (np.sin(2 * np.pi * 1700 * t) * np.exp(-t / .008) * .5 + np.sin(2 * np.pi * 420 * t) * np.exp(-t / .025) * .6)

def s_type():
    t = tt(.04); n = rng.standard_normal(len(t)); n = np.diff(n, prepend=0)
    return n * np.exp(-t / .005) * .35 + np.sin(2 * np.pi * rng.uniform(900, 1300) * t) * np.exp(-t / .006) * .25

def s_pop():
    t = tt(.16); f = 520 + 520 * np.exp(-t / .03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .05) * .7

def s_blip():
    t = tt(.12)
    return np.sin(2 * np.pi * 1320 * t) * np.sin(np.pi * np.clip(t / .09, 0, 1)) * .35

def s_tick():
    t = tt(.03)
    return np.sin(2 * np.pi * 2800 * t) * np.exp(-t / .006) * .3

def s_riser(d=1.4):
    t = tt(d); x = t / d
    n = rng.standard_normal(len(t))
    y = onepole_lp(n, 200 + 7000 * x ** 2) * (x ** 2) * .9
    y += np.sin(2 * np.pi * np.cumsum(220 * 4 ** x) / SR) * x ** 2 * .25
    return y

def s_lock():
    out = np.zeros(int(.6 * SR))
    for i, f in enumerate((880, 1318.5)):
        t = tt(.45); s = (np.sin(2 * np.pi * f * t) + .2 * np.sin(4 * np.pi * f * t)) * np.exp(-t / .14) * np.minimum(1, t / .004)
        j = int(i * .09 * SR); out[j:j + len(s)] += s[:len(out) - j] * .5
    return out

def s_arp(notes, gap, d=1.4, dec=.5, g=.35):
    out = np.zeros(int((d + gap * len(notes)) * SR))
    for i, m in enumerate(notes):
        s = bell(midi(m), d, dec) * g
        j = int(i * gap * SR); out[j:j + len(s)] += s
    return out

def s_impact():
    t = tt(1.8); f = 32 + 55 * np.exp(-t / .12)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .55) * .9
    n = rng.standard_normal(len(t)); y += onepole_lp(n, 700) * np.exp(-t / .12) * .9
    return y

def s_shimmer():
    t = tt(1.6); n = rng.standard_normal(len(t)); n = np.diff(n, prepend=0)
    y = n * np.sin(np.pi * t / 1.6) ** 2 * .06
    a = s_arp([84, 88, 91, 96], .06, 1.2, .35, .12)
    y[:min(len(a), len(y))] += a[:len(y)]
    return y

def s_cash():
    out = s_arp([96, 100], .07, .9, .25, .3)
    t = tt(.08); n = rng.standard_normal(len(t)); n = np.diff(n, prepend=0)
    out[:len(t)] += n * np.exp(-t / .01) * .25
    return out

SFX = {
    'whoosh': lambda: s_whoosh(), 'whooshBig': lambda: s_whoosh(.9, 150, 4000, True),
    'swipe': lambda: s_whoosh(.32, 700, 5200) * .6,
    'tap': s_tap, 'type': s_type, 'pop': s_pop, 'blip': s_blip, 'tick': s_tick, 'lock': s_lock,
    'riser': s_riser, 'cash': s_cash,
    'chime': lambda: s_arp([84, 88, 91], .07, 1.3, .45, .3),
    'success': lambda: s_arp([84, 88, 91, 96], .09, 1.6, .6, .32),
    'notif': lambda: s_arp([86, 91], .13, 1.0, .3, .45),
    'sparkle': lambda: s_arp([91, 93, 96, 98, 100, 103], .045, 1.0, .3, .2),
    'impact': s_impact, 'shimmer': s_shimmer,
}
WET = {'chime', 'success', 'notif', 'sparkle', 'shimmer', 'impact', 'lock', 'pop', 'cash'}
for c in cue['sfx']:
    s = SFX[c['name']]()
    add(fx, c['t'], s, 0, c['vol'])
    if c['name'] in WET: add(verb_send, c['t'], s, 0, c['vol'] * .35)

# ── reverb (FFT convolution with a synthetic decaying IR) ───────────────────
ir_t = tt(2.2)
ir = rng.standard_normal((len(ir_t), 2)) * np.exp(-ir_t / .55)[:, None]
ir[:, 0] = onepole_lp(ir[:, 0], 5000); ir[:, 1] = onepole_lp(ir[:, 1], 5000)
ir /= np.sqrt((ir ** 2).sum(0))
L = 1 << int(np.ceil(np.log2(N + len(ir))))
wet = np.stack([np.fft.irfft(np.fft.rfft(verb_send[:, c], L) * np.fft.rfft(ir[:, c], L), L)[:N] for c in range(2)], 1)

# ── mix ──────────────────────────────────────────────────────────────────────
t = np.arange(N) / SR
mgain = np.minimum(1, t / 1.0)                                    # fade in
mgain *= np.clip((DUR - t) / 3.0, 0, 1)                           # fade out over the end card
mix = music * mgain[:, None] + fx * 0.95 + wet * 0.9 * np.maximum(mgain, .5)[:, None]
mix = mix[:int(DUR * SR)]
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix *= 0.93 / np.abs(mix).max()
pcm = (mix * 32767).astype('<i2')
with wave.open(sys.argv[2] if len(sys.argv) > 2 else 'out-916/audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('audio ok', DUR, 's, sfx cues:', len(cue['sfx']))
