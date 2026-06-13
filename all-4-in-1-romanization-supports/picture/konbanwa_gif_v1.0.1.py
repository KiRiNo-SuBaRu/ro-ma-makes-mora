#!/usr/bin/env python3
"""
KonBanWa Animated GIF Generator
==================================
720×240px · 20fps · 4-second infinite loop

Beat schedule:
  Phase0  0.0–0.6s  static base
  Beat 0  0.6–1.2s  Ko / こ
  Beat 1  1.2–1.8s  n  / ん
  Beat 2  1.8–2.4s  Ba / ば
  Beat 3  2.4–3.0s  n  / ん
  Beat 4  3.0–3.6s  Wa / は
  Wait    3.6–4.0s  static base → loop
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
import os

# ═══════════════════════════════════════════════════════════
#  CONFIG
# ═══════════════════════════════════════════════════════════
W, H     = 720, 240
BG_COLOR = (245, 245, 245)
FPS      = 20
N_FRAMES = 80   # 4.0 s × 20 fps

Y_ROMAN  = 80   # vertical center – roman row
Y_KANA   = 162  # vertical center – kana row

BEATS = ['Ko', 'n', 'Ba', 'n', 'Wa']
KANA  = ['こ', 'ん', 'ば', 'ん', 'は']
SEP   = '｜'

# Palette
C_DIM   = (175, 175, 175)   # inactive text
C_LIT   = (22,  22,  22 )   # active text (near-black)
C_SEP   = (210, 210, 210)   # separator normal
C_SEP_A = (115, 115, 115)   # separator near active beat
C_BAND  = (218, 228, 248)   # band fill (light indigo-grey)

# Font sizes
R_SZ = 62   # roman
K_SZ = 56   # kana
S_SZ = 48   # separator

# ═══════════════════════════════════════════════════════════
#  FONTS
# ═══════════════════════════════════════════════════════════
_FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
RF = ImageFont.truetype(_FONT, R_SZ, index=0)
KF = ImageFont.truetype(_FONT, K_SZ, index=0)
SF = ImageFont.truetype(_FONT, S_SZ, index=0)
print(f"Font: {_FONT}")

# ═══════════════════════════════════════════════════════════
#  LAYOUT  – computed once from actual glyph metrics
# ═══════════════════════════════════════════════════════════
def _tw(text, font):
    d = ImageDraw.Draw(Image.new('L', (3000, 300)))
    b = d.textbbox((0, 0), text, font=font)
    return b[2] - b[0]

rw = [_tw(b, RF) for b in BEATS]
kw = [_tw(k, KF) for k in KANA]
sw = _tw(SEP, SF)

COL_PAD = 12
cw      = [max(rw[i], kw[i]) + COL_PAD for i in range(5)]
total_w = sum(cw) + 4 * sw
margin  = (W - total_w) / 2

bcx, scx = [], []   # beat center X, separator center X
x = margin
for i in range(5):
    bcx.append(x + cw[i] / 2)
    x += cw[i]
    if i < 4:
        scx.append(x + sw / 2)
        x += sw

print(f"Col widths  : {cw}")
print(f"Beat  cx    : {[f'{c:.0f}' for c in bcx]}")
print(f"Sep   cx    : {[f'{c:.0f}' for c in scx]}")
print(f"Total text  : {total_w:.0f} px  margin {margin:.0f} px")

# ═══════════════════════════════════════════════════════════
#  ANIMATION CURVES  (per beat, 12 frames = 0.6 s)
# ═══════════════════════════════════════════════════════════
# bf 0–1   : band fades in  (0 → 1),  glow starts
# bf 2–7   : band full,  glow full
# bf 8–10  : band fades out,  glow lingers
# bf 11    : band gone,  glow fading

BAND_C = [0.30, 0.70, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 0.65, 0.35, 0.10, 0.00]
GLOW_C = [0.00, 0.28, 0.68, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 0.85, 0.55, 0.22]


def beat_state(frame):
    """Return (beat_idx, band_α, glow_α).  beat_idx == -1 → silent."""
    if frame < 12 or frame >= 72:
        return -1, 0.0, 0.0
    rel = frame - 12
    bi  = rel // 12
    bf  = rel % 12
    return bi, BAND_C[bf], GLOW_C[bf]

# ═══════════════════════════════════════════════════════════
#  DRAWING UTILITIES
# ═══════════════════════════════════════════════════════════
def draw_cx(draw, cx, cy, text, font, fill):
    """Draw text horizontally + vertically centred at (cx, cy)."""
    b = draw.textbbox((0, 0), text, font=font)
    x = cx - (b[2] - b[0]) / 2 - b[0]
    y = cy - (b[3] - b[1]) / 2 - b[1]
    draw.text((x, y), text, font=font, fill=fill)


def lerpc(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def make_glow(bi, ga):
    """
    Dual-pass blur glow for 'light-background karaoke' style.
    Outer pass (large blur)  → soft dark haze, sets depth.
    Inner pass (tight blur)  → crisp dark halo just around glyph edges.
    Both alpha-scaled by ga, composited BEFORE the sharp text is redrawn.
    """
    if bi < 0 or ga <= 0.0:
        return Image.new('RGBA', (W, H), (0, 0, 0, 0))

    src = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d   = ImageDraw.Draw(src)
    gc  = (28, 30, 55, 210)   # dark indigo-blue source
    draw_cx(d, bcx[bi], Y_ROMAN, BEATS[bi], RF, gc)
    draw_cx(d, bcx[bi], Y_KANA,  KANA[bi],  KF, gc)

    b_out  = src.filter(ImageFilter.GaussianBlur(radius=18))  # outer haze
    b_in   = src.filter(ImageFilter.GaussianBlur(radius=5))   # inner ring

    a_o = np.array(b_out, dtype=np.float32)
    a_i = np.array(b_in,  dtype=np.float32)

    combo       = a_o * 0.38 + a_i * 0.62
    combo[..., 3] *= ga * 0.58          # scale: max ≈ 58 %
    np.clip(combo, 0, 255, out=combo)

    return Image.fromarray(combo.astype(np.uint8), 'RGBA')

# ═══════════════════════════════════════════════════════════
#  RENDER ONE FRAME
# ═══════════════════════════════════════════════════════════
def render_frame(frame):
    bi, ba, ga = beat_state(frame)

    img = Image.new('RGBA', (W, H), BG_COLOR + (255,))

    # ── Band ───────────────────────────────────────────────
    if bi >= 0 and ba > 0.0:
        bx  = bcx[bi]
        bw  = cw[bi] + 30
        by1 = Y_ROMAN - 36
        by2 = Y_KANA  + 36

        bl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        bd = ImageDraw.Draw(bl)
        # max α ≈ 15 % – whisper-quiet
        bd.rounded_rectangle(
            [bx - bw / 2, by1, bx + bw / 2, by2],
            radius=20,
            fill=C_BAND + (int(ba * 38),)
        )
        img = Image.alpha_composite(img, bl)

    draw = ImageDraw.Draw(img)

    # ── Roman row ──────────────────────────────────────────
    for i in range(5):
        col = lerpc(C_DIM, C_LIT, ga) if bi == i else C_DIM
        draw_cx(draw, bcx[i], Y_ROMAN, BEATS[i], RF, col)

    # ── Kana row ───────────────────────────────────────────
    for i in range(5):
        col = lerpc(C_DIM, C_LIT, ga) if bi == i else C_DIM
        draw_cx(draw, bcx[i], Y_KANA, KANA[i], KF, col)

    # ── Separators ─────────────────────────────────────────
    # Darken the separator to the right of the active beat (= sep[bi]).
    # For the last beat (は, i=4) which has no right sep, darken sep[3].
    for i, sx in enumerate(scx):
        darken = (bi == i) or (bi == 4 and i == 3)
        col    = lerpc(C_SEP, C_SEP_A, ga) if darken else C_SEP
        draw_cx(draw, sx, Y_KANA, SEP, SF, col)

    # ── Glow overlay + crisp redraw ────────────────────────
    if bi >= 0 and ga > 0.0:
        img  = Image.alpha_composite(img, make_glow(bi, ga))
        draw = ImageDraw.Draw(img)
        col  = lerpc(C_DIM, C_LIT, ga)
        draw_cx(draw, bcx[bi], Y_ROMAN, BEATS[bi], RF, col)
        draw_cx(draw, bcx[bi], Y_KANA,  KANA[bi],  KF, col)

    return img.convert('RGB')

# ═══════════════════════════════════════════════════════════
#  GENERATE FRAMES + SAVE
# ═══════════════════════════════════════════════════════════
print(f"\nGenerating {N_FRAMES} frames @ {FPS} fps …")
frames = []
for f in range(N_FRAMES):
    frames.append(render_frame(f))
    if f % 20 == 0:
        print(f"  [{f:3d}/{N_FRAMES}]")

OUT = '/mnt/user-data/outputs/konbanwa.gif'
MS  = int(1000 / FPS)   # 50 ms / frame

print(f"\nSaving → {OUT}")
frames[0].save(
    OUT,
    save_all      = True,
    append_images = frames[1:],
    loop          = 0,
    duration      = MS,
    optimize      = False,
)
size_kb = os.path.getsize(OUT) / 1024
print(f"✓  {N_FRAMES} frames × {MS} ms  ({FPS} fps)  →  {size_kb:.0f} KB")
