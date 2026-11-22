import { useEffect, useRef, useState } from 'react';

const times = {
  day: { label: '朝', top: '#7eb6ad', bottom: '#eedca5', orb: '#fff1ac', far: '#799a85', hill: '#446f60', water: '#86a397', near: '#244e44' },
  dusk: { label: '夕', top: '#536c75', bottom: '#f6bd78', orb: '#ffe0a0', far: '#9b8c73', hill: '#527b68', water: '#648882', near: '#254e44' },
  night: { label: '夜', top: '#162847', bottom: '#576681', orb: '#ede3bd', far: '#485370', hill: '#2b4e56', water: '#3d6372', near: '#182f36' }
} as const;
type Time = keyof typeof times;
const sceneDescriptions: Record<Time, string> = {
  day: '青緑の空の下、淡い光が小屋と水辺、重なる丘を照らしています。',
  dusk: '金色の空に低い夕日が浮かび、小屋の向こうに水辺と丘が見えます。',
  night: '星と月明かりの下、小屋と水辺、重なる丘が静かに見えます。'
};

function drawWindow(ctx: CanvasRenderingContext2D, time: Time, lamp: boolean) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const sky = times[time];
  function rect(x: number, y: number, width: number, height: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  }
  function polygon(points: [number, number][], color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    ctx.fill();
  }
  function circle(x: number, y: number, radius: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  const glow = ctx.createLinearGradient(0, 0, 0, h);
  glow.addColorStop(0, sky.top);
  glow.addColorStop(0.73, sky.bottom);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  circle(115, time === 'dusk' ? 74 : 51, time === 'night' ? 15 : 25, sky.orb);
  if (time === 'night') {
    for (let i = 0; i < 37; i += 1) rect((i * 71) % w, 5 + (i * 31) % 76, i % 7 ? 1 : 2, 1, '#f6e6bd');
  } else {
    ctx.globalAlpha = 0.23;
    rect(13, 51, 69, 3, '#fff0cb');
    rect(168, 39, 90, 4, '#fff0cb');
    rect(273, 67, 69, 3, '#fff0cb');
    ctx.globalAlpha = 1;
  }
  polygon([[0, 112], [0, 86], [34, 70], [61, 78], [99, 111], [145, 104], [175, 83], [207, 79], [251, 110], [288, 91], [360, 106], [360, 153], [0, 153]], sky.far);
  polygon([[0, 142], [0, 104], [46, 105], [80, 121], [116, 126], [174, 119], [222, 108], [274, 125], [317, 111], [360, 122], [360, 160], [0, 160]], sky.hill);
  rect(0, 135, w, 59, sky.water);
  ctx.globalAlpha = 0.43;
  for (let i = 0; i < 25; i += 1) {
    rect((i * 47) % w, 140 + (i * 19) % 53, 10 + (i * 9) % 47, i % 4 ? 1 : 2, i % 2 ? sky.orb : sky.top);
  }
  ctx.globalAlpha = 1;
  polygon([[146, 194], [189, 176], [205, 155], [239, 150], [269, 157], [307, 146], [360, 153], [360, 194]], sky.near);
  polygon([[188, 194], [229, 168], [251, 160], [262, 164], [237, 176], [217, 194]], time === 'night' ? '#706257' : '#ac9265');
  for (let i = 0; i < 12; i += 1) {
    const x = i < 6 ? 151 + i * 11 : 282 + (i - 6) * 12;
    const y = 149 - (i * 13) % 14;
    rect(x + 4, y + 5, 2, 21, '#382f2c');
    polygon([[x - 3, y + 18], [x + 5, y - 7], [x + 13, y + 18]], i % 2 ? sky.hill : sky.near);
  }
  rect(226, 123, 48, 34, time === 'night' ? '#806956' : '#d4b582');
  rect(258, 109, 5, 10, '#654d40');
  polygon([[219, 126], [250, 104], [281, 126]], time === 'night' ? '#503c43' : '#925943');
  polygon([[221, 126], [250, 107], [279, 126], [273, 126], [250, 111], [228, 126]], '#b77451');
  rect(247, 141, 8, 16, '#654d40');
  if (lamp) {
    const warm = ctx.createRadialGradient(252, 138, 4, 252, 138, 34);
    warm.addColorStop(0, '#ffc97aa6');
    warm.addColorStop(1, '#ffc97a00');
    ctx.fillStyle = warm;
    ctx.fillRect(218, 107, 70, 66);
  }
  for (const x of [232, 260]) {
    rect(x, 133, 10, 10, lamp ? '#ffe195' : '#3f514e');
    rect(x + 4, 133, 1, 10, '#795944');
    rect(x, 137, 10, 1, '#795944');
  }
  const texture = ctx.createImageData(w, h);
  for (let pixel = 0; pixel < w * h; pixel += 1) {
    const seed = Math.imul(pixel, 1597334677) >>> 0;
    const value = seed % 13 > 6 ? 255 : 0;
    const index = pixel * 4;
    texture.data.set([value, value, value, seed % 17], index);
  }
  const grain = document.createElement('canvas');
  grain.width = w;
  grain.height = h;
  grain.getContext('2d')?.putImageData(texture, 0, 0);
  ctx.drawImage(grain, 0, 0);
}

export function PocketWindow() {
  const [time, setTime] = useState<Time>('dusk');
  const [lamp, setLamp] = useState(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (ctx) drawWindow(ctx, time, lamp);
  }, [time, lamp]);

  return (
    <figure className="pocket-window" id="pocket-window" aria-label="触れる試作 Pocket Window">
      <div className="pocket-frame">
        <canvas ref={canvas} width={360} height={194} role="img" aria-label={`${times[time].label}の海辺の工房。 ${sceneDescriptions[time]} 灯りは${lamp ? '点灯中' : '消灯中'}。`}>
          海辺の工房の風景。Canvas 2D 対応ブラウザーで表示できます。
        </canvas>
      </div>
      <figcaption className="pocket-controls">
        <span>Pocket Window</span>
        <div role="group" aria-label="窓の時間帯">
          {(Object.keys(times) as Time[]).map((key) => (
            <button key={key} type="button" aria-pressed={time === key} onClick={() => setTime(key)}>{times[key].label}</button>
          ))}
          <button type="button" aria-pressed={lamp} onClick={() => setLamp((on) => !on)}>灯り</button>
        </div>
      </figcaption>
    </figure>
  );
}
