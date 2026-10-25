/** MGSF x MAF M1.8 bridge, transparent local image-statistics baseline.
 * No ML inference, no network upload, no similarity/confidence probabilities.
 * MAF profile palette snapshot: madowaku-cockpit PR #3 / commit 62ba331.
 * Image evidence represents only the locally bundled sample sprites.
 */
export type VisualEvidence = {
  sampleCount: number;
  sampledPixels: number;
  visiblePixels: number;
  transparentRatio: number;
  colorBuckets: number;
  meanSaturation: number;
  meanLuminance: number;
  colors: string[];
};
export type MafProfileId = 'pixel' | 'storybook' | 'lowpoly' | 'comic';
export const MAF_PALETTE_SNAPSHOT: Readonly<Record<MafProfileId, { label: string; colors: readonly string[] }>> = {
  pixel: { label: 'Moonlit Pixel', colors: ['#171c33','#495474','#8a8eb0','#e0c8a2'] },
  storybook: { label: 'Twilight Storybook', colors: ['#21283e','#6f7997','#c78a87','#e8cfaa'] },
  lowpoly: { label: 'Cozy Miniature', colors: ['#34516b','#73a9ad','#e6c99c','#ed8d76'] },
  comic: { label: 'Ink & Shade', colors: ['#282b38','#697b86','#de846e','#eecfaf'] }
};

/** Quantized visible color analysis (up to 48 x 48 samples per source image). */
export function analyzeRgba(rgba: Uint8ClampedArray, sampleCount = 1): VisualEvidence {
  if (rgba.length % 4 !== 0) throw new Error('RGBA bytes must be divisible by 4');
  const bins = new Map<string, number>();
  const sampledPixels = rgba.length / 4;
  let visiblePixels = 0, saturation = 0, luminance = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    const [r,g,b,a] = [rgba[i],rgba[i+1],rgba[i+2],rgba[i+3]];
    if (a < 64) continue;
    visiblePixels++;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    saturation += max === 0 ? 0 : (max-min)/max;
    luminance += (0.2126*r + 0.7152*g + 0.0722*b)/255;
    const key = [r,g,b].map(x => Math.min(255, Math.round(x/32)*32).toString(16).padStart(2,'0')).join('');
    bins.set(key, (bins.get(key) ?? 0) + 1);
  }
  return {
    sampleCount, sampledPixels, visiblePixels,
    transparentRatio: sampledPixels ? Number((1-visiblePixels/sampledPixels).toFixed(3)) : 0,
    colorBuckets: bins.size,
    meanSaturation: visiblePixels ? Number((saturation/visiblePixels).toFixed(3)) : 0,
    meanLuminance: visiblePixels ? Number((luminance/visiblePixels).toFixed(3)) : 0,
    colors: [...bins.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([hex])=>'#'+hex)
  };
}

function rgb(hex: string): [number,number,number] {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error('Invalid palette color');
  return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)) as [number,number,number];
}
function distance(a: string, b: string) {
  const x=rgb(a),y=rgb(b);
  return Math.sqrt(x.reduce((s,v,i)=>s+(v-y[i])**2,0));
}

/** A lower RGB distance means closer sample colors to MAF's palette, not visual quality. */
export function compareMafPalettes(evidence: VisualEvidence) {
  if (evidence.colors.length === 0) return [];
  return (Object.entries(MAF_PALETTE_SNAPSHOT) as [MafProfileId,typeof MAF_PALETTE_SNAPSHOT[MafProfileId]][])
    .map(([id, profile]) => ({
      id, label: profile.label, palette: profile.colors,
      meanDistance: Math.round(evidence.colors.reduce(
        (sum,color)=>sum+Math.min(...profile.colors.map(ref=>distance(color,ref))),0
      )/evidence.colors.length)
    }))
    .sort((a,b)=>a.meanDistance-b.meanDistance || a.id.localeCompare(b.id));
}

/** Read local same-origin assets only. No network upload and no untrusted image URLs. */
export async function analyzeLocalPreviews(urls: readonly string[]): Promise<VisualEvidence> {
  if (!urls.length || urls.length > 4) throw new Error('Expected 1–4 sample images');
  const chunks: Uint8ClampedArray[] = [];
  for (const url of urls) {
    if (!/^\/asset-previews\/kenney\/[a-z0-9-]+\.png$/.test(url)) throw new Error('Only curated local Kenney preview paths are allowed');
    const img = new Image();
    img.src = url;
    await new Promise<void>((resolve,reject) => {
      if (img.complete) { img.naturalWidth > 0 ? resolve() : reject(new Error('Image unavailable')); return; }
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image unavailable'));
    });
    const canvas = document.createElement('canvas');
    canvas.width = 48; canvas.height = 48;
    const ctx = canvas.getContext('2d',{willReadFrequently:true});
    if (!ctx) throw new Error('Canvas unavailable');
    ctx.clearRect(0,0,48,48);
    ctx.imageSmoothingEnabled = false;
    const scale = Math.min(canvas.width/img.naturalWidth,canvas.height/img.naturalHeight);
    const w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));
    ctx.drawImage(img, Math.floor((48-w)/2),Math.floor((48-h)/2),w,h);
    chunks.push(ctx.getImageData(0,0,48,48).data);
  }
  const rgba = new Uint8ClampedArray(chunks.reduce((sum,c)=>sum+c.length,0));
  let offset=0;
  for(const chunk of chunks) { rgba.set(chunk,offset);offset+=chunk.length; }
  return analyzeRgba(rgba, chunks.length);
}
