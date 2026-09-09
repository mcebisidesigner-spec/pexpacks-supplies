const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const logoSvgPath = path.join(rootDir, 'public', 'images', 'logo.svg');
  const logoWhiteSvgPath = path.join(rootDir, 'public', 'images', 'logo-white.svg');
  const logoSvgContent = fs.readFileSync(logoSvgPath, 'utf8');

  console.log('1. Generating 300dpi letterhead PNG and base64...');
  // 300dpi render of logo.svg -> 914 x 356
  const letterheadPngBuffer = await sharp(logoSvgPath, { density: 300 })
    .png()
    .toBuffer();

  const letterheadPngPath = path.join(rootDir, 'public', 'images', 'pexpacks-letterhead-logo.png');
  fs.writeFileSync(letterheadPngPath, letterheadPngBuffer);
  console.log('   Saved', letterheadPngPath, `(${letterheadPngBuffer.length} bytes)`);

  const letterheadBase64 = `data:image/png;base64,${letterheadPngBuffer.toString('base64')}`;
  const letterheadTsPath = path.join(rootDir, 'components', 'pdf', 'letterhead-logo.ts');
  const tsContent = `// Auto-generated 300dpi crisp Pexpacks logo base64 for PDF letterhead\nexport const PEXPACKS_LETTERHEAD_LOGO_BASE64 =\n  "${letterheadBase64}";\n`;
  fs.writeFileSync(letterheadTsPath, tsContent, 'utf8');
  console.log('   Updated', letterheadTsPath);

  // Update public/images/PexLogo.png as well
  const pexLogoPngPath = path.join(rootDir, 'public', 'images', 'PexLogo.png');
  fs.writeFileSync(pexLogoPngPath, letterheadPngBuffer);
  console.log('   Updated', pexLogoPngPath);

  console.log('2. Extracting standalone Logo Icon SVG...');
  // In logo.svg, the 3rd group is the emblem icon mark
  const groups = logoSvgContent.split(/<g>/);
  if (groups.length < 4) {
    throw new Error('Could not find icon group in logo.svg');
  }
  const iconGroup = groups[3].split('</g>')[0];

  // The icon coordinates in logo.svg:
  // x: ~1.2 to ~49.39 (width ~48.2)
  // y: ~3.26 to ~81.63 (height ~78.4)
  // Total viewBox in logo.svg is 219.42 x 85.5.
  // For a tight icon SVG:
  const iconTightSvg = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50.59 85.5">
<style type="text/css">
\t.st0{fill:#1A2A40;}
\t.st1{fill:#FF6F59;}
\t.st2{fill:#219E9A;}
</style>
<g>
${iconGroup}
</g>
</svg>`;

  const iconSvgPath = path.join(rootDir, 'public', 'images', 'logo-icon.svg');
  fs.writeFileSync(iconSvgPath, iconTightSvg, 'utf8');
  console.log('   Saved', iconSvgPath);

  // Square SVG with icon centered for square app icons:
  // Width 85.5, Height 85.5. Offset x = (85.5 - 50.59) / 2 = 17.455.
  const iconSquareSvg = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85.5 85.5">
<style type="text/css">
\t.st0{fill:#1A2A40;}
\t.st1{fill:#FF6F59;}
\t.st2{fill:#219E9A;}
</style>
<g transform="translate(17.455, 0)">
${iconGroup}
</g>
</svg>`;

  console.log('3. Generating PWA and Next.js App Icons...');
  const iconSquareBuffer = Buffer.from(iconSquareSvg);

  // app/icon.png: 192x192 transparent
  const appIconPath = path.join(rootDir, 'app', 'icon.png');
  await sharp(iconSquareBuffer, { density: 600 })
    .resize(192, 192)
    .png()
    .toFile(appIconPath);
  console.log('   Generated', appIconPath);

  // app/apple-icon.png: 180x180 transparent
  const appAppleIconPath = path.join(rootDir, 'app', 'apple-icon.png');
  await sharp(iconSquareBuffer, { density: 600 })
    .resize(180, 180)
    .png()
    .toFile(appAppleIconPath);
  console.log('   Generated', appAppleIconPath);

  // public/icons/apple-touch-icon.png: 180x180 on white background with 10% padding
  const appleTouchPath = path.join(rootDir, 'public', 'icons', 'apple-touch-icon.png');
  const appleTouchInner = await sharp(iconSquareBuffer, { density: 600 })
    .resize(150, 150, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: appleTouchInner, gravity: 'center' }])
    .png()
    .toFile(appleTouchPath);
  console.log('   Generated', appleTouchPath);

  // public/icons/icon-192.png: 192x192 on white background with 12% padding
  const icon192Path = path.join(rootDir, 'public', 'icons', 'icon-192.png');
  const icon192Inner = await sharp(iconSquareBuffer, { density: 600 })
    .resize(160, 160, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: icon192Inner, gravity: 'center' }])
    .png()
    .toFile(icon192Path);
  console.log('   Generated', icon192Path);

  // public/icons/icon-512.png: 512x512 on white background
  const icon512Path = path.join(rootDir, 'public', 'icons', 'icon-512.png');
  const icon512Inner = await sharp(iconSquareBuffer, { density: 600 })
    .resize(420, 420, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: icon512Inner, gravity: 'center' }])
    .png()
    .toFile(icon512Path);
  console.log('   Generated', icon512Path);

  // public/icons/icon-maskable-512.png: 512x512 maskable (safe area is 80% circle/inner box = ~330px)
  const iconMaskablePath = path.join(rootDir, 'public', 'icons', 'icon-maskable-512.png');
  const iconMaskableInner = await sharp(iconSquareBuffer, { density: 600 })
    .resize(330, 330, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: iconMaskableInner, gravity: 'center' }])
    .png()
    .toFile(iconMaskablePath);
  console.log('   Generated', iconMaskablePath);

  console.log('Brand asset generation completed successfully!');
}

main().catch((err) => {
  console.error('Error generating brand assets:', err);
  process.exit(1);
});
