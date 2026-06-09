const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SIZE = 600;
const dirs = ['idle', 'rasca', 'asiente', 'libreta', 'gametime'];
const base = path.join(__dirname, '..', 'src', 'assets', 'animations');

(async () => {
  for (const dir of dirs) {
    const folder = path.join(base, dir);
    if (!fs.existsSync(folder)) {
      console.log(`⚠  Skipping ${dir} — folder not found`);
      continue;
    }

    const files = fs.readdirSync(folder).filter(f => f.endsWith('.png')).sort();
    console.log(`\n${dir}: ${files.length} frames`);

    for (const file of files) {
      const input = path.join(folder, file);
      const meta  = await sharp(input).metadata();
      if (file === files[0] || file === files[files.length - 1]) {
        console.log(`  ${file}: ${meta.width}×${meta.height}`);
      }

      const tmp = input + '.tmp.png';
      // trim() removes transparent borders before scaling so the duck fills
      // the canvas regardless of how much padding the source PNG has.
      await sharp(input)
        .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 })
        .resize(SIZE, SIZE, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(tmp);

      fs.renameSync(tmp, input);
    }
    console.log(`  ✓ all ${files.length} frames → ${SIZE}×${SIZE}`);
  }
  console.log('\nDone.');
})();
