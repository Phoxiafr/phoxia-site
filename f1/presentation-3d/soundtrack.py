# Bande son de la présentation (52 s) : nappes, souffles, battements, déclics des LED,
# impact de révélation, démarrage et montées en régime du moteur. Tout est synthétisé.
import numpy as np, wave, sys
from scipy.signal import lfilter, butter, sosfilt

SR = 48000; D = 52.0; N = int(SR * D)
t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(11)

def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR / 2.2), 'low', fs=SR, output='sos'), x)
def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)
def vlp(x, fc):
    # passe-bas à fréquence variable (un pôle, bloc de 64 échantillons)
    y = np.empty_like(x); z = 0.0
    for i in range(0, len(x), 64):
        a = np.exp(-2 * np.pi * fc[i] / SR)
        seg, zi = lfilter([1 - a], [1, -a], x[i:i + 64], zi=[z * a])
        y[i:i + 64] = seg; z = seg[-1]
    return y
def add(sig, t0, pan=0.0, g=1.0):
    i = int(t0 * SR); n = min(len(sig), N - i)
    if n <= 0: return
    pan = np.broadcast_to(pan, sig.shape)[:n]
    L[i:i + n] += sig[:n] * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2) * g
    R[i:i + n] += sig[:n] * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2) * g
def env(n, a, r):
    e = np.ones(n); ai = int(a * SR); ri = int(r * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return e
def sec(d): return np.arange(int(d * SR)) / SR

# ---------- nappe grave (Ré mineur), tout le long, plus présente après la révélation
def drone(t0, t1, notes, g, cut):
    tt = sec(t1 - t0); x = np.zeros(len(tt))
    for f in notes:
        for det in (-0.003, 0.0, 0.004):
            x += 2 * ((tt * f * (1 + det) + rng.random()) % 1) - 1
    x = lp(x, cut) * (1 + 0.15 * np.sin(2 * np.pi * 0.13 * tt))
    return x / len(notes) * g * env(len(tt), 2.0, 2.0)
add(drone(0, 15.9, [36.7, 55.0, 73.4], 0.22, 380), 0, -0.2)
add(drone(0, 15.9, [36.7, 55.0, 87.3], 0.18, 420), 0, 0.2)
add(drone(17.9, 52, [36.7, 73.4, 110, 146.8], 0.16, 900), 17.9, -0.25)
add(drone(17.9, 52, [43.7, 87.3, 130.8, 174.6], 0.14, 900), 17.9, 0.25)

# ---------- battement de cœur pendant les teasers
def thump(g=1.0):
    tt = sec(0.5)
    return np.sin(2 * np.pi * (38 * tt + 40 * (1 - np.exp(-tt * 25)) / 25)) * np.exp(-tt * 10) * g
for b in np.arange(0.8, 13.2, 1.1):
    add(thump(0.8), b); add(thump(0.5), b + 0.24)

# ---------- souffles sur les coupes
def whoosh(d=0.9, g=0.5, up=True):
    tt = sec(d); n = rng.standard_normal(len(tt)); k = tt / d
    fc = 300 + 5000 * (k if up else 1 - k) ** 2
    return vlp(n, fc) * np.sin(np.pi * k) ** 2 * g
for c in (3.2, 5.8, 8.4, 11.0):
    add(whoosh(0.8, 0.45), c - 0.55, np.linspace(-0.7, 0.7, int(0.8 * SR)))

# ---------- scintillement métallique sur les balayages de lumière
def shimmer(d, g):
    tt = sec(d); x = np.zeros(len(tt))
    for f in (2093, 2637, 3136, 4186):
        x += np.sin(2 * np.pi * f * tt + rng.random() * 6)
    return x * env(len(tt), d * 0.4, d * 0.5) * g * 0.05
for s in (3.3, 5.9, 8.5, 11.1):
    add(shimmer(2.2, 1), s, rng.uniform(-0.5, 0.5))

# ---------- feu de pluie : bips courts
for b in np.arange(11.1, 13.3, 1 / 2.2):
    tt = sec(0.06); add(np.sin(2 * np.pi * 1760 * tt) * np.exp(-tt * 50) * 0.08, b + 0.02, -0.3)

# ---------- montée vers le titre, puis impact
tt = sec(2.0); k = tt / 2.0
riser = vlp(rng.standard_normal(len(tt)), 200 + 7000 * k ** 2) * k ** 2.5 * 0.6
riser += np.sin(2 * np.pi * (60 * tt + 200 * tt ** 2)) * k ** 2 * 0.25
add(riser, 11.6)
def impact(g=1.0, tail=2.5):
    tt = sec(tail)
    boom = np.sin(2 * np.pi * (34 * tt + 90 * (1 - np.exp(-tt * 14)) / 14)) * np.exp(-tt * 2.2)
    crack = hp(rng.standard_normal(len(tt)), 900) * np.exp(-tt * 14) * 0.5
    verb = lp(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 1.6) * 0.18
    return (boom + crack + verb) * g
add(impact(0.9), 13.6)

# ---------- déclics des barres LED (ordre angulaire identique à l'image)
times = sorted({round(16.0 + abs(np.arctan2(np.sin(a - np.pi), np.cos(a - np.pi))) * 0.45, 3) for a in np.arange(36) / 36 * 2 * np.pi})
for i, c in enumerate(times):
    tt = sec(0.25)
    clk = hp(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 70) * 0.35
    thud = np.sin(2 * np.pi * 70 * tt) * np.exp(-tt * 18) * 0.3
    add(clk + thud, c, (-1) ** i * min(0.9, i * 0.08))
# souffle ascendant avant l'allumage principal
tt = sec(1.2); k = tt / 1.2
add(vlp(rng.standard_normal(len(tt)), 300 + 6000 * k ** 2) * k ** 3 * 0.5, 16.75)

# ---------- révélation : grand impact
add(impact(1.25, 3.5), 17.95)

# ---------- moteur (V6 hybride) : démarreur, allumage, ralenti, coups de gaz
f0 = np.full(N, 0.0); amp = np.zeros(N)
def seg(a, b): return slice(int(a * SR), int(b * SR))
s = seg(18.4, 19.2); tt = t[s] - 18.4
f0[s] = 25 + 40 * tt; amp[s] = 0.12 * (tt / 0.8)
s = seg(19.2, 52); tt = t[s] - 19.2
f = 95 + 4 * np.sin(tt * 3)
# coups de gaz : (instant, montée, retombée, pic)
for tb, up, down, pk in ((19.35, 0.18, 0.7, 420), (20.6, 0.22, 0.8, 560), (21.6, 0.3, 1.0, 700),
                         (40.3, 0.25, 0.8, 520), (41.4, 0.3, 0.9, 650), (42.6, 0.35, 1.1, 760)):
    x = tt - (tb - 19.2)
    shape = np.where(x < 0, 0, np.where(x < up, x / up, np.exp(-(x - up) / (down / 3))))
    f = f + (pk - 95) * shape
f0[s] = f
a = np.full(len(tt), 0.13)
a = np.where(tt + 19.2 > 22.6, 0.13 * np.clip(1 - (tt + 19.2 - 22.6) / 3, 0.35, 1), a)
a = np.where((tt + 19.2 > 39.8) & (tt + 19.2 < 44.2), 0.14, a)
a = np.where(tt + 19.2 > 44.2, 0.05 * np.clip(1 - (tt + 19.2 - 44.2) / 4, 0, 1), a)
amp[s] = a * (1 + 1.6 * np.clip((f - 95) / 600, 0, 1))
ph = np.cumsum(2 * np.pi * f0 / SR)
eng = np.zeros(N)
for k in range(1, 16):
    eng += np.sin(k * ph + rng.uniform(0, 6)) / k ** 0.8
eng += 0.6 * np.sin(ph / 2) + 0.3 * np.sin(ph / 3)
eng = np.tanh(1.8 * eng)
eng += lp(rng.standard_normal(N), 1500) * 0.25
eng = vlp(eng, np.clip(f0 * 8, 500, 10000)) * amp
# démarreur (gémissement électrique)
tt = sec(0.9); add(np.sin(2 * np.pi * (300 * tt + 500 * tt ** 2)) * env(len(tt), 0.05, 0.2) * 0.05, 18.35, 0.1)
L += eng * 1.6; R += eng * 1.6

# ---------- pulsation rythmique après la révélation (96 bpm)
beat = 60 / 96
def kick():
    tt = sec(0.4); return np.sin(2 * np.pi * (42 * tt + 120 * (1 - np.exp(-tt * 28)) / 28)) * np.exp(-tt * 8)
def tick():
    tt = sec(0.05); return hp(rng.standard_normal(len(tt)), 6000) * np.exp(-tt * 80) * 0.2
roots = [36.7, 29.1, 43.7, 32.7]
b = 22.0; i = 0
while b < 44.0:
    g = 0.5 + 0.3 * min(1, (b - 22) / 6)
    add(kick(), b, 0, 0.8 * g)
    if i % 2: add(tick(), b, 0.4, g)
    add(tick(), b + beat / 2, -0.4, g * 0.7)
    tt = sec(beat * 0.9)
    f = roots[(i // 8) % 4] * 2
    bass = np.tanh(2.5 * np.sin(2 * np.pi * f * tt)) * np.exp(-tt * 3.5) * 0.28
    add(bass, b + beat / 2, 0, g)
    b += beat; i += 1
# accents sur les coupes des plans pleins feux
for c in (22.0, 28.0, 32.0, 36.0, 40.0):
    add(impact(0.35, 1.5), c)
add(impact(1.0, 4.0), 44.0)
add(impact(0.7, 3.5), 48.4)

# ---------- master
m = np.stack([L, R], 1)
m = hp(m.T, 25).T
m = np.tanh(m / np.max(np.abs(m)) * 1.8)
m *= np.clip((D - t) / 1.2, 0, 1)[:, None] * np.clip(t / 0.3, 0, 1)[:, None]
m = m / np.max(np.abs(m)) * 0.9
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((m * 32767).astype('<i2').tobytes())
print('ok')
