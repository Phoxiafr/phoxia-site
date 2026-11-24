"""Placement de la barre sur des géométries shapely (unités PF Biais)."""
from biais import H, K, profile

def after(geo, gap, w):
    best = -1e9
    for i in range(141):
        y = H * i / 140; r = profile(geo, y, 'r')
        if r is not None: best = max(best, r - y * K)
    return best + gap

def glyph_after_bar(geo, x0, w, gap):
    best = -1e9
    for i in range(141):
        y = H * i / 140; l = profile(geo, y, 'l')
        if l is not None: best = max(best, x0 + w + y * K - l)
    return best + gap
