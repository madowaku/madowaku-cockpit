"""Render a deterministic 8-second pixel-art opening. Requires Pillow.

Run:
  python -m pip install Pillow
  python lab/pixel-motion-studio/render.py
"""
from __future__ import annotations

import argparse
import math
from pathlib import Path

from PIL import Image, ImageDraw

WIDTH, HEIGHT, SCALE = 160, 90, 4
FPS, DURATION = 12, 8
COLORS = ('#252a5e', '#2b316d', '#363a7b', '#474585',
          '#5f508a', '#86618e', '#ad7999', '#df9d9d')
STARS = ((12,12),(26,26),(43,13),(58,25),(78,12),(110,18),
         (127,8),(146,29),(139,45),(21,49),(103,33))
FONT = {
 'A': ('01110','10001','10001','11111','10001','10001','10001'),
 'D': ('11110','10001','10001','10001','10001','10001','11110'),
 'K': ('10001','10010','10100','11000','10100','10010','10001'),
 'M': ('10001','11011','10101','10101','10001','10001','10001'),
 'O': ('01110','10001','10001','10001','10001','10001','01110'),
 'U': ('10001','10001','10001','10001','10001','10001','01110'),
 'W': ('10001','10001','10001','10101','10101','10101','01010'),
}

def ease(value: float) -> float:
    n = max(0.0, min(1.0, value))
    return n*n*(3-2*n)

def frame(seconds: float) -> Image.Image:
    """At the same timestamp, always draw the same frame."""
    img = Image.new('RGB', (WIDTH, HEIGHT), COLORS[0])
    d = ImageDraw.Draw(img)

    def box(x: int, y: int, w: int, h: int, color: str) -> None:
        if w > 0 and h > 0:
            d.rectangle((x,y,x+w-1,y+h-1),fill=color)

    for i, color in enumerate(COLORS):
        box(0,i*10,WIDTH,12,color)
    for i,(x,y) in enumerate(STARS):
        box(x,y,2 if i%3==0 else 1,1,'#fff4dc')
    box(0,74,WIDTH,16,'#2f4862')
    for x in range(0,WIDTH,5):
        box(x,74-round(3*math.sin(x*.07)),5,6,'#2f4862')
    box(0,82,WIDTH,8,'#223a4d')

    rise = ease((seconds-.7)/1.4)
    shift = round((1-rise)*44)
    def y(v: int) -> int:
        return v+shift
    box(44,y(44),72,35,'#e4cbb9')
    box(49,y(47),62,32,'#f1dcca')
    for x in range(41,117,4):
        box(x,y(42-round((38-abs(x-79))*.39)),4,4,'#5f405b')
    box(39,y(44),80,5,'#6b425e')
    box(51,y(60),4,19,'#8f6681')
    box(106,y(60),4,19,'#8f6681')

    opening=ease((seconds-2.1)/1.4)
    glow=ease((seconds-2.2)/1.2)
    if glow>0:
        overlay=Image.new('RGB',img.size,'#ffd98a')
        for r in (16,12,8,4):
            mask=Image.new('L',img.size)
            ImageDraw.Draw(mask).rectangle(
                (80-r,y(54-r),80+r,y(54+r)),fill=round(9*glow))
            img.paste(overlay,(0,0),mask)
        d=ImageDraw.Draw(img)
    box(67,y(47),26,23,'#4c3155')
    box(70,y(50),20,17,'#ffd98a')
    box(71,y(51),18,6,'#b57fa6')
    box(71,y(57),18,5,'#5d8493')
    box(71,y(62),18,4,'#3e7d6b')
    if opening>.75:
        box(78,y(59),6,7,'#283e55')
        box(78,y(57),2,3,'#283e55')
        box(82,y(57),2,3,'#283e55')
        box(79,y(61),1,1,'#ffd98a')
        box(82,y(61),1,1,'#ffd98a')
    slide=round(opening*10)
    box(70-slide,y(50),10,17,'#80546d')
    box(80+slide,y(50),10,17,'#80546d')
    box(73-slide,y(54),2,7,'#b78b83')
    box(85+slide,y(54),2,7,'#b78b83')
    box(65,y(45),30,3,'#5f405b')
    box(65,y(69),30,3,'#72516b')
    box(80,y(72),2,7,'#a36b7d')
    for x,pos in ((53,78),(107,78),(119,80)):
        box(x,y(pos-8),2,9,'#3e7d6b')
        box(x-3,y(pos-9),8,4,'#4c9479')

    if seconds>4.9:
        overlay=Image.new('RGB',img.size)
        o=ImageDraw.Draw(overlay)
        mask=Image.new('L',img.size)
        m=ImageDraw.Draw(mask)
        opacity=round(255*ease((seconds-4.9)/1.1))
        for i,ch in enumerate('MADOWAKU'):
            for gy,row in enumerate(FONT[ch]):
                for gx,bit in enumerate(row):
                    if bit=='1':
                        px,py=32+(i*6+gx)*2,11+gy*2
                        o.rectangle((px,py,px+1,py+1),fill='#fff4dc')
                        m.rectangle((px,py,px+1,py+1),fill=opacity)
        o.rectangle((53,29,106,29),fill='#ffd98a')
        m.rectangle((53,29,106,29),fill=opacity)
        img.paste(overlay,(0,0),mask)
    if seconds<.9:
        black=Image.new('RGB',img.size,'#171b3a')
        img=Image.blend(img,black,1-ease(seconds/.9))
    return img.resize((WIDTH*SCALE,HEIGHT*SCALE),Image.Resampling.NEAREST)

def export(out: Path) -> None:
    out.mkdir(parents=True,exist_ok=True)
    frames=[frame(i/FPS) for i in range(FPS*DURATION)]
    frames[0].save(out/'opening.gif',save_all=True,
                   append_images=frames[1:],duration=round(1000/FPS),
                   loop=0,optimize=False)
    frames[-1].save(out/'poster.png')
    print(f'Generated {FPS*DURATION} frames ({DURATION}s): {out}')

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out',type=Path,
                        default=Path(__file__).parent/'outputs')
    export(parser.parse_args().out)
