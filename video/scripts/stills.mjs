// Render nhanh ảnh chụp ở nhiều thời điểm (bundle 1 lần) để soát hình.
// node scripts/stills.mjs <compositionId> <giây1,giây2,...> [thư mục ra]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [id = 'VinhBacBo', times = '1', outDir = 'out/stills'] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id, browserExecutable: fs.existsSync(browserExecutable) ? browserExecutable : null});
fs.mkdirSync(outDir, {recursive: true});
for (const t of times.split(',')) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(Number(t) * comp.fps));
  const output = path.join(outDir, `${id}-${String(frame).padStart(5, '0')}.jpg`);
  await renderStill({serveUrl, composition: comp, frame, output, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable: fs.existsSync(browserExecutable) ? browserExecutable : null});
  console.log(output);
}
