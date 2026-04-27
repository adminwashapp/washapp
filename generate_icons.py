"""
Generate Washapp icons — 1024x1024 PNG
- Washer : black background #000000
- Client : white background #FFFFFF
3 blue water drops, premium glossy style
"""

import math
from PIL import Image, ImageDraw, ImageFilter

SIZE = 1024

def draw_drop(draw, cx, cy, r, color_main, color_highlight, color_dark):
    """Draw a single teardrop shape (pointed top, round bottom)."""
    pts = []
    # Bottom half = semicircle
    for a in range(180, 361):
        rad = math.radians(a)
        pts.append((cx + r * math.cos(rad), cy + r * math.sin(rad)))
    # Top point (tip)
    pts.append((cx, cy - r * 1.55))
    draw.polygon(pts, fill=color_main)

    # Inner glossy highlight (top-left)
    hw = int(r * 0.42)
    hh = int(r * 0.36)
    hx = int(cx - r * 0.22)
    hy = int(cy - r * 0.55)
    draw.ellipse([hx - hw, hy - hh, hx + hw, hy + hh], fill=color_highlight)

    # Small sparkle dot
    sx, sy, sr = int(cx + r * 0.28), int(cy - r * 0.35), int(r * 0.10)
    draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(255, 255, 255, 180))

def create_icon(bg_color, filename):
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")

    # ── Background ──────────────────────────────────────────────
    bg = Image.new("RGBA", (SIZE, SIZE), bg_color)

    # Rounded square mask for background
    mask = Image.new("L", (SIZE, SIZE), 0)
    md = ImageDraw.Draw(mask)
    corner = int(SIZE * 0.22)
    md.rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=corner, fill=255)
    bg.putalpha(mask)
    img.paste(bg, (0, 0), bg)

    draw = ImageDraw.Draw(img, "RGBA")

    # ── Drop colours ──────────────────────────────────────────────
    # Rich blue gradient via layered draws
    # Main fill: deep blue with slight purple
    DROP_MAIN   = (20,  110, 220, 245)
    DROP_MID    = (40,  150, 255, 235)
    DROP_DARK   = (10,   70, 160, 255)
    DROP_GLOW   = (120, 200, 255, 200)
    HILIGHT     = (210, 240, 255, 220)
    HILIGHT2    = (255, 255, 255, 180)

    # ── Layout: 3 drops ──────────────────────────────────────────
    # Centre big drop slightly above centre
    # Two smaller drops flanking below-left / below-right
    cx = SIZE // 2
    cy = int(SIZE * 0.50)

    big_r   = int(SIZE * 0.175)   # 179 px
    small_r = int(SIZE * 0.115)   # 118 px

    left_cx  = cx - int(SIZE * 0.185)
    left_cy  = cy + int(SIZE * 0.095)
    right_cx = cx + int(SIZE * 0.185)
    right_cy = cy + int(SIZE * 0.095)

    # Subtle glow behind each drop
    def glow(x, y, r, col):
        gr = int(r * 1.55)
        g_img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        g_draw = ImageDraw.Draw(g_img, "RGBA")
        g_draw.ellipse([x - gr, y - gr + int(r * 0.2), x + gr, y + gr + int(r * 0.2)], fill=col)
        blurred = g_img.filter(ImageFilter.GaussianBlur(radius=int(gr * 0.55)))
        img.alpha_composite(blurred)

    glow(left_cx,  left_cy,  small_r, (50, 130, 255, 60))
    glow(right_cx, right_cy, small_r, (50, 130, 255, 60))
    glow(cx,       cy,       big_r,   (80, 170, 255, 80))

    def full_drop(d, cx_, cy_, r_):
        """Layer multiple passes for a glossy 3-D look."""
        # Shadow layer
        for i in range(6, 0, -1):
            alpha = int(90 - i * 10)
            draw_drop(d, cx_ + i, cy_ + i + 4, r_, (0, 40, 120, alpha), (0,0,0,0), (0,0,0,0))
        # Dark base
        draw_drop(d, cx_, cy_, r_, DROP_DARK, (0,0,0,0), (0,0,0,0))
        # Main colour
        draw_drop(d, cx_, cy_, r_, DROP_MAIN, (0,0,0,0), (0,0,0,0))
        # Mid lighter pass
        draw_drop(d, cx_, cy_, int(r_ * 0.88), DROP_MID, (0,0,0,0), (0,0,0,0))
        # Glow inner
        draw_drop(d, cx_, cy_ - int(r_*0.04), int(r_ * 0.72), DROP_GLOW, (0,0,0,0), (0,0,0,0))
        # Highlight streak (ellipse left-top)
        hw = int(r_ * 0.38); hh = int(r_ * 0.30)
        hx = cx_ - int(r_ * 0.20); hy = cy_ - int(r_ * 0.52)
        d.ellipse([hx-hw, hy-hh, hx+hw, hy+hh], fill=HILIGHT)
        # Tiny sparkle
        sx = cx_ + int(r_*0.30); sy = cy_ - int(r_*0.38); sr = max(4, int(r_*0.09))
        d.ellipse([sx-sr, sy-sr, sx+sr, sy+sr], fill=HILIGHT2)
        # Bottom rim highlight
        bw = int(r_*0.55); bh = int(r_*0.14)
        bx = cx_; by = cy_ + int(r_*0.62)
        d.ellipse([bx-bw, by-bh, bx+bw, by+bh], fill=(180, 220, 255, 80))

    draw = ImageDraw.Draw(img, "RGBA")
    full_drop(draw, left_cx,  left_cy,  small_r)
    full_drop(draw, right_cx, right_cy, small_r)
    full_drop(draw, cx,       cy,       big_r)

    # Apply overall rounded mask to final image
    final_mask = Image.new("L", (SIZE, SIZE), 0)
    fm_draw = ImageDraw.Draw(final_mask)
    corner = int(SIZE * 0.22)
    fm_draw.rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=corner, fill=255)
    result = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    result.paste(img, mask=final_mask)

    result.save(filename, "PNG")
    print(f"Saved: {filename}")

BASE = r"C:\Users\CELLIER\.verdent\verdent-projects\new-project-2a8b0cd9\Washapp"

# Washer — black bg
create_icon((0, 0, 0, 255),     BASE + r"\mobile-washer\assets\icon.png")
create_icon((0, 0, 0, 255),     BASE + r"\mobile-washer\assets\adaptive-icon.png")

# Client — white bg
create_icon((255, 255, 255, 255), BASE + r"\mobile-client\assets\icon.png")
create_icon((255, 255, 255, 255), BASE + r"\mobile-client\assets\adaptive-icon.png")

# Splash screens (same style)
create_icon((0, 0, 0, 255),       BASE + r"\mobile-washer\assets\splash.png")
create_icon((255, 255, 255, 255), BASE + r"\mobile-client\assets\splash.png")

print("All icons generated.")
