"""Bande son originale du film Phoxavels (agence de voyage), entièrement synthétisée (aucun échantillon externe).

100 BPM, une mesure = 2,4 s : chaque changement de plan tombe sur un temps.
Progression Fa, Do, Ré mineur, Si bémol, plus lumineuse. Impact sur la marque (4,8 s), pulsation à 7,2 s, un déclic par destination
de 9,6 à 28,8 s, impact final sur la signature (40,8 s).

    python3 bande_son_voyages.py   ->  bande-son-voyages.wav (48 s, stéréo, 44,1 kHz)
"""
import wave
import numpy as np

SR = 44100
DUREE = 48.0
FIN = 40.8  # arrivée de la signature
BPM = 100
TEMPS = 60 / BPM
MESURE = 4 * TEMPS
N = int(SR * DUREE)
t_all = np.arange(N) / SR
rng = np.random.default_rng(7)

G = np.zeros((2, N))


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def ajoute(sig, debut, gain=1.0, pan=0.0):
    i = int(debut * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    g = gain * np.array([np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)]) * np.sqrt(2)
    G[0, i : i + len(sig)] += sig * g[0]
    G[1, i : i + len(sig)] += sig * g[1]


def enveloppe(n, a, r, sustain=True):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr and sustain:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def passe_bas(x, fc):
    """Filtre passe-bas à un pôle, fc pouvant varier dans le temps."""
    fc = np.broadcast_to(np.asarray(fc, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


# Accords (MIDI) : Dm, Bb, F, C
ACCORDS = [
    [53, 57, 60, 65],  # Fa
    [48, 52, 55, 60],  # Do
    [50, 53, 57, 62],  # Ré mineur
    [46, 50, 53, 58],  # Si bémol
]
BASSES = [41, 36, 38, 34]
NB_MESURES = int(np.ceil(DUREE / MESURE))

# ---------- Nappe : dents de scie désaccordées et filtrées ----------
nappe = np.zeros(N)
for m in range(NB_MESURES):
    acc = ACCORDS[m % 4]
    d0 = m * MESURE
    long = MESURE + 0.6
    n = int(long * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for note in acc:
        for det in (-0.09, 0.0, 0.11):
            f = hz(note + det)
            ph = rng.uniform(0, 1)
            s += 2 * ((f * tt + ph) % 1) - 1
    s *= enveloppe(n, 0.5, 0.6) / 12
    i = int(d0 * SR)
    j = min(N, i + n)
    nappe[i:j] += s[: j - i]
# ouverture du filtre au fil du film
fc = 700 + 1900 * np.clip((t_all - 2) / 26, 0, 1) ** 1.3
fc = np.where(t_all > FIN, 2600 - 1800 * np.clip((t_all - FIN) / 8, 0, 1), fc)
nappe = passe_bas(passe_bas(nappe, fc), fc)
vol_nappe = 0.55 + 0.25 * np.clip((t_all - 4.8) / 2, 0, 1)
vol_nappe *= np.clip(t_all / 2.5, 0, 1)
G += nappe * vol_nappe * 0.5

# ---------- Basse ----------
for m in range(3, 17):
    for b in range(4):
        d = m * MESURE + b * TEMPS
        if d >= FIN:
            break
        n = int(TEMPS * SR * 0.95)
        tt = np.arange(n) / SR
        f = hz(BASSES[m % 4])
        s = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)
        s *= np.exp(-tt * 3.2) * enveloppe(n, 0.005, 0.03)
        ajoute(s, d, 0.30)

# ---------- Grosse caisse, claquement, charleston ----------
def grosse_caisse():
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    f = 45 + 110 * np.exp(-tt * 38)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * 7.5)


def claquement():
    n = int(0.3 * SR)
    tt = np.arange(n) / SR
    bruit = rng.standard_normal(n)
    bruit = bruit - passe_bas(bruit, 900)
    return (bruit * np.exp(-tt * 18) + 0.4 * np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 30)) * 0.6


def charleston(ouvert=False):
    n = int((0.2 if ouvert else 0.06) * SR)
    tt = np.arange(n) / SR
    bruit = rng.standard_normal(n)
    bruit = bruit - passe_bas(bruit, 6500)
    return bruit * np.exp(-tt * (14 if ouvert else 70))


GC, CL = grosse_caisse(), claquement()
for m in range(3, 17):
    for b in range(4):
        d = m * MESURE + b * TEMPS
        if d >= FIN - 0.01:
            continue
        # respiration : pas de grosse caisse sur la dernière mesure avant la signature
        if d < FIN - 1.2:
            ajoute(GC, d, 0.9)
        if b in (1, 3) and m >= 4:
            ajoute(CL, d, 0.22, pan=0.1)
        if m >= 4:
            ajoute(charleston(ouvert=(b == 3)), d + TEMPS / 2, 0.10, pan=0.35)
            ajoute(charleston(), d + TEMPS / 4 * 3, 0.05, pan=-0.35)

# ---------- Arpège en pizzicato (entre à 4,8 s) ----------
MOTIF = [0, 2, 1, 3, 2, 1, 3, 2]
for m in range(1, 17):
    acc = ACCORDS[m % 4]
    for k in range(16):
        d = m * MESURE + k * TEMPS / 4
        if d >= FIN:
            break
        note = acc[MOTIF[k % 8] % 4] + 12 + (12 if k % 8 == 7 else 0)
        n = int(0.35 * SR)
        tt = np.arange(n) / SR
        f = hz(note)
        s = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * np.sin(2 * np.pi * 3 * f * tt))
        s *= np.exp(-tt * 11) * enveloppe(n, 0.002, 0.02)
        vel = 0.75 + 0.25 * (k % 4 == 0)
        gain = 0.055 if m < 4 else 0.075
        ajoute(s, d, gain * vel, pan=0.45 * np.sin(k * 0.8))

# ---------- Montées de bruit avant les deux temps forts ----------
def montee(long):
    n = int(long * SR)
    tt = np.arange(n) / SR
    bruit = rng.standard_normal(n)
    fc = 300 + 7000 * (tt / long) ** 2
    s = passe_bas(bruit, fc)
    s = s - passe_bas(s, 200)
    return s * (tt / long) ** 2.2


ajoute(montee(2.4), 4.8 - 2.4, 0.3, pan=-0.2)
ajoute(montee(2.4), FIN - 2.4, 0.3, pan=0.2)

# Déclic d'obturateur sur chaque photo du montage des voyages
def declic():
    n = int(0.05 * SR)
    tt = np.arange(n) / SR
    b = rng.standard_normal(n)
    return (b - passe_bas(b, 3000)) * np.exp(-tt * 120)


for i in range(16):
    ajoute(declic(), 9.6 + i * 1.2 + (0 if i == 0 else -0.3), 0.18, pan=0.3 * (1 if i % 2 else -1))
for i in range(3):  # les trois photos personnelles
    ajoute(declic(), 31.25 + i * 0.22, 0.2, pan=0.4 * (i - 1))

# ---------- Souffles sur les balayages ----------
def souffle(long=1.2):
    n = int(long * SR)
    tt = np.arange(n) / SR
    bruit = rng.standard_normal(n)
    forme = np.sin(np.pi * tt / long) ** 2
    fc = 300 + 2200 * forme
    return passe_bas(bruit, fc) * forme


for c in (7.2, 28.8, 31.2, 33.6):
    ajoute(souffle(), c - 0.6, 0.13, pan=-0.5)
    ajoute(souffle(), c - 0.55, 0.13, pan=0.5)

# ---------- Impacts ----------
def impact(long=4.0):
    n = int(long * SR)
    tt = np.arange(n) / SR
    f = 38 + 60 * np.exp(-tt * 9)
    boum = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.6)
    bruit = passe_bas(rng.standard_normal(n), 2500) * np.exp(-tt * 5)
    return boum + 0.35 * bruit


ajoute(impact(), 4.8, 0.75)
ajoute(impact(6.0), FIN, 0.85)

# Accord final tenu, cloche aiguë sur la devise
for note in (53, 60, 65, 69, 72):
    n = int(8.4 * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(note) * tt) + 0.2 * np.sin(2 * np.pi * hz(note + 12) * tt)
    s *= np.exp(-tt * 0.35) * enveloppe(n, 0.02, 1.0)
    ajoute(s, FIN, 0.06, pan=(note - 60) / 20)
for i, note in enumerate((77, 81, 84)):
    n = int(3 * SR)
    tt = np.arange(n) / SR
    s = (np.sin(2 * np.pi * hz(note) * tt) + 0.25 * np.sin(2 * np.pi * hz(note) * 2.76 * tt)) * np.exp(-tt * 1.8)
    ajoute(s, FIN + 1.3 + i * 0.3, 0.07, pan=0.3 * (i - 1))

# ---------- Réverbération (convolution par un bruit à décroissance exponentielle) ----------
def reverb(x, duree=2.6, humide=0.28):
    n = int(duree * SR)
    tt = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-tt * 3.0)
    ir = passe_bas(ir, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    L = len(x) + n - 1
    nf = 1 << int(np.ceil(np.log2(L)))
    y = np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(ir, nf), nf)[: len(x)]
    return (1 - humide) * x + humide * y


G = np.stack([reverb(G[0]), reverb(G[1])])

# ---------- Mastering : compression douce, fondu final, normalisation ----------
G = np.tanh(G * 1.3) / np.tanh(1.3)
fin = np.clip((DUREE - t_all) / 1.6, 0, 1)
G *= fin
G *= np.clip(t_all / 0.05, 0, 1)
G /= np.max(np.abs(G)) / 0.89

pcm = (G.T * 32767).astype(np.int16)
with wave.open('bande-son-voyages.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('bande-son-voyages.wav', DUREE, 's')
