const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [svg, outdir] = process.argv.slice(2);
  const logo = 'data:image/svg+xml;base64,' + fs.readFileSync(svg).toString('base64');
  const sizes = [
    ['1920x1080', 1920, 1080, 0.30], ['2560x1440', 2560, 1440, 0.30], ['3840x2160-4K', 3840, 2160, 0.30],
    ['1920x1200', 1920, 1200, 0.30], ['2560x1600-MacBook', 2560, 1600, 0.30],
    ['1080x1920-vertical', 1080, 1920, 0.62], ['1170x2532-iPhone', 1170, 2532, 0.62],
  ];
  const b = await chromium.launch();
  for (const [name, w, h, r] of sizes) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.setContent(`<body style="margin:0;width:${w}px;height:${h}px;background:#14213D;display:flex;align-items:center;justify-content:center"><img src="${logo}" style="width:${Math.round(w * r)}px;height:auto"></body>`);
    await p.waitForTimeout(200);
    await p.screenshot({ path: `${outdir}/PF-fond-ecran-bleu-marine-${name}.png` });
    await p.close();
  }
  await b.close();
})();
