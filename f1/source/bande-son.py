# Bande son synthétisée : nappe, montée, impacts, pulsation, moteur V6 hybride (arrivée, ralenti, départ).
import numpy as np, wave, sys
SR = 48000; D = 24.0; N = int(SR * D)
t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(3)

def lp(x, fc):
    # passe-bas un pôle (fc scalaire ou tableau)
    a = np.exp(-2 * np.pi * np.broadcast_to(fc, x.shape) / SR)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s; y[i] = s
    return y

def seg(t0, t1):
    return slice(int(t0 * SR), min(N, int(t1 * SR)))

def add(sig, t0, pan=0.0, g=1.0):
    i = int(t0 * SR); n = min(len(sig), N - i)
    if n <= 0: return
    gl = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); gr = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    pl = np.broadcast_to(gl, sig.shape)[:n]; pr = np.broadcast_to(gr, sig.shape)[:n]
    L[i:i + n] += sig[:n] * pl * g; R[i:i + n] += sig[:n] * pr * g

def saw(f, dur, det=0.0):
    tt = np.arange(int(dur * SR)) / SR
    return 2 * ((tt * f * (1 + det)) % 1) - 1

# ---------- nappe (accords La mineur / Fa / Do / Sol), filtrée
chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 261.6, 329.6], [196, 246.9, 293.7]]
def pad(t0, t1, gain, cutoff):
    dur = t1 - t0; out = np.zeros(int(dur * SR)); tt = np.arange(len(out)) / SR
    for k in range(len(out) // (SR * 2) + 1):
        a = int(k * 2 * SR); b = min(len(out), a + 2 * SR)
        if a >= len(out): break
        for f in chords[k % 4]:
            for d in (-0.004, 0.004):
                out[a:b] += saw(f / 2, (b - a) / SR, d)[: b - a] * 0.12
    env = np.minimum(1, tt / 1.2) * np.minimum(1, (dur - tt) / 1.5)
    return lp(out, cutoff) * env * gain

p = pad(0, 3.3, 0.5, 900); add(p, 0, -0.3, 1); add(p, 0, 0.3, 0.8)
p = pad(19.4, 24, 0.55, 1300); add(p, 19.4, -0.3, 1); add(p, 19.4, 0.3, 0.8)

# ---------- montée de bruit avant la révélation
dur = 1.6; tt = np.arange(int(dur * SR)) / SR
riser = lp(rng.standard_normal(len(tt)), 300 + 5000 * (tt / dur) ** 2) * (tt / dur) ** 2 * 0.5
add(riser, 1.4, -0.5 + tt / dur)

# ---------- impacts
def impact(g=1.0):
    tt = np.arange(int(1.8 * SR)) / SR
    boom = np.sin(2 * np.pi * (48 * tt + 60 * (1 - np.exp(-tt * 18)) / 18)) * np.exp(-tt * 3.2)
    noise = lp(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 9) * 0.6
    return (boom + noise) * g
add(impact(0.9), 3.0); add(impact(0.8), 19.5)

# ---------- pulsation 120 bpm (grosse caisse, basse, charleston) de 3 s à 19.5 s
def kick():
    tt = np.arange(int(0.35 * SR)) / SR
    return np.sin(2 * np.pi * (45 * tt + 110 * (1 - np.exp(-tt * 30)) / 30)) * np.exp(-tt * 9)
def hat():
    tt = np.arange(int(0.06 * SR)) / SR
    x = rng.standard_normal(len(tt)); x = x - lp(x, 7000)
    return x * np.exp(-tt * 60) * 0.25
roots = [55, 43.65, 65.4, 49]
beat = 0.5
b = 3.0; i = 0
while b < 19.4:
    g = 0.55 if b < 6.4 else 0.8
    add(kick(), b, 0, g)
    add(hat(), b + beat / 2, 0.35, g)
    f = roots[(i // 4) % 4]
    tt = np.arange(int(0.22 * SR)) / SR
    bass = np.tanh(2.2 * np.sin(2 * np.pi * f * tt)) * np.exp(-tt * 6) * 0.35
    add(bass, b + beat / 2, 0, g)
    b += beat; i += 1

# ---------- moteur : série d'harmoniques sur une fréquence d'allumage variable
# arrivée 2.85 s -> 6.3 s, rétrogradages
s = seg(2.6, 6.8); tt = t[s]; p = np.clip((tt - 2.85) / 3.45, 0, 1)
f0 = 290 + 330 * (1 - p) ** 0.8
for tb in (3.9, 4.6, 5.3):
    f0 += np.where(tt > tb, 110 * np.exp(-(tt - tb) / 0.16), 0)
f0 = np.where(tt > 6.3, 290 - (tt - 6.3) * 300, f0).clip(95)
dist = 2100 * (1 - (1 - (1 - p) ** 4))
amp = 0.55 / (1 + (dist / 700) ** 2) * np.clip((tt - 2.6) / 0.2, 0, 1)
pan = np.zeros(N); f0f = np.full(N, 90.0); ampf = np.zeros(N)
f0f[s] = f0; ampf[s] = amp; pan[s] = np.clip(dist / 2100, 0, 1) * 0.9

# ralenti 6.3 s -> 18.3 s
s2 = seg(6.3, 18.4); tt2 = t[s2]
f0f[s2] = np.maximum(f0f[s2], 88 + 6 * np.sin(tt2 * 3.1))
ampf[s2] = np.maximum(ampf[s2], 0.13 * np.clip((tt2 - 6.3) / 0.5, 0, 1))

# départ 18.3 s -> 20.2 s, montée en régime puis passage de rapport
s3 = seg(18.3, 21.0); tt3 = t[s3]; q = np.clip((tt3 - 18.3) / 1.6, 0, 1)
f3 = 110 + 620 * q ** 0.6
f3 = np.where(tt3 > 19.0, f3 - 170 * np.exp(-(tt3 - 19.0) / 0.25), f3)
d3 = 2600 * q ** 3
f0f[s3] = f3; ampf[s3] = 0.6 / (1 + (d3 / 900) ** 2) * np.clip(1 - (tt3 - 20.2) / 0.6, 0, 1)
pan[s3] = -np.clip(d3 / 2600, 0, 1) * 0.9

# moteur rendu en mono puis panoramique variable
ph = np.cumsum(2 * np.pi * f0f / SR)
x = np.zeros(N)
for k in range(1, 14):
    x += np.sin(k * ph + rng.uniform(0, 6)) / k ** 0.85
x += 0.5 * np.sin(ph / 2)
x = np.tanh(1.6 * x)
x = lp(x + lp(rng.standard_normal(N), 1800) * 0.2, np.clip(f0f * 7, 600, 9000)) * ampf
gl = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); gr = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
L += x * gl * 1.4; R += x * gr * 1.4

# ---------- master : limiteur doux, normalisation, fondu final
m = np.stack([L, R], 1)
m = np.tanh(m / np.max(np.abs(m)) * 1.6)
m *= np.clip((D - t) / 0.7, 0, 1)[:, None]
m = m / np.max(np.abs(m)) * 0.89
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((m * 32767).astype('<i2').tobytes())
print('ok')
