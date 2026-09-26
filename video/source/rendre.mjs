// Rendu image par image du film Phoxia, puis encodage MP4 avec la bande son.
//
//   node rendre.mjs 1920x1080 [fps]      -> ../phoxia-film-16x9.mp4
//   node rendre.mjs 1080x1920 [fps]      -> ../phoxia-film-9x16.mp4
//   node rendre.mjs 1920x1080 apercu     -> une image par plan dans ./apercus/
//   FILM=voyages node rendre.mjs ...      -> film Phoxavels (voyages.html, bande-son-voyages.wav)
//
// Prérequis : Playwright (Chromium) et ffmpeg. FFMPEG peut pointer vers un binaire précis.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ici = path.dirname(fileURLToPath(import.meta.url));
const [w, h] = (process.argv[2] || '1920x1080').split('x').map(Number);
const mode = process.argv[3] || '30';
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const film = process.env.FILM || 'film';
const prefixe = film === 'film' ? 'phoxia-film' : 'phoxavels-film';
const son = film === 'film' ? 'bande-son.wav' : `bande-son-${film}.wav`;

const navigateur = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
  args: ['--allow-file-access-from-files', '--force-color-profile=srgb'],
});
const page = await navigateur.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
await page.goto(`file://${ici}/${film}.html?rendu&w=${w}&h=${h}`);
await page.evaluate(() => window.pret);
const duree = await page.evaluate(() => window.DUREE);
const intro = await page.evaluate(() => window.INTRO || 0);
const scene = page.locator('#scene');

if (mode === 'apercu') {
  mkdirSync(path.join(ici, 'apercus'), { recursive: true });
  const instants = (process.argv[4] || '3.8,8.9,11.4,14.5,20.5,27.6,33.9,38.9,44').split(',').map(Number);
  for (const t of instants) {
    await page.evaluate(t => window.seek(t), t);
    await scene.screenshot({ path: path.join(ici, 'apercus', `${film}-${w}x${h}-${String(t).padStart(5, '0')}.png`) });
  }
  await navigateur.close();
  process.exit(0);
}

const fps = Number(mode);
const nom = w > h ? '16x9' : h > w ? '9x16' : '1x1';
const sortie = path.join(ici, '..', `${prefixe}-${nom}.mp4`);
const enc = spawn(ffmpeg, [
  '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-i', path.join(ici, son),
  ...(intro ? ['-af', `adelay=${Math.round(intro * 1000)}:all=1`] : []),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-tune', 'animation',
  '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', sortie,
], { stdio: ['pipe', 'inherit', 'inherit'] });

const total = Math.round(duree * fps);
for (let i = 0; i < total; i++) {
  await page.evaluate(t => window.seek(t), i / fps);
  const img = await page.screenshot({ type: 'jpeg', quality: 96, clip: { x: 0, y: 0, width: w, height: h } });
  if (!enc.stdin.write(img)) await new Promise(r => enc.stdin.once('drain', r));
  if (i % fps === 0) process.stderr.write(`\r${nom} : ${i}/${total} images`);
}
enc.stdin.end();
await new Promise(r => enc.on('close', r));
await navigateur.close();
console.error(`\n${sortie}`);
