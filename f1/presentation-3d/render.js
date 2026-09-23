// Serveur local + Chromium (WebGL logiciel) : rend chaque image puis encode en MP4.
const http = require('http'), fs = require('fs'), path = require('path');
const { spawn } = require('child_process');
const { chromium } = require(process.env.NODE_PATH_PW);
const ROOT = __dirname, FPS = 24, DUR = 52;
const OUT = process.argv[2], AUDIO = process.argv[3];
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
const START = +(process.env.START || 0), END = +(process.env.END || DUR * FPS);
const types = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css' };
const srv = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
}).listen(0, async () => {
  const port = srv.address().port;
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-driver-bug-workarounds'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('page:', m.text().slice(0, 300)); });
  p.on('pageerror', (e) => console.log('pageerror:', e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html`);
  await p.waitForFunction('window.READY === true', null, { timeout: 180000 });
  const snap = async (f) => { await p.evaluate(([t, f]) => window.renderAt(t, f), [f / FPS, f]); return p.screenshot({ type: 'jpeg', quality: 93 }); };
  if (ONLY) {
    for (const s of ONLY) { const t0 = Date.now(); fs.writeFileSync(`${OUT}-${String(s).replace('.', '_')}.jpg`, await snap(Math.round(s * FPS))); console.log('aperçu', s, Date.now() - t0, 'ms'); }
  } else {
    const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-'];
    if (AUDIO) args.push('-i', AUDIO);
    args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-tune', 'film');
    if (AUDIO) args.push('-c:a', 'aac', '-b:a', '256k', '-shortest');
    args.push('-movflags', '+faststart', OUT);
    const ff = spawn(process.env.FFMPEG, args, { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = START; f < END; f++) {
      const buf = await snap(f);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (f % 24 === 0) console.log(`image ${f}/${END}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
    ff.stdin.end(); await new Promise((r) => ff.on('close', r));
    console.log('terminé', OUT);
  }
  await b.close(); srv.close();
});
