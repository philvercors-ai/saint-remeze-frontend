const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const INPUT_LOGO = path.join(__dirname, '../public/logo-base.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🎨 Génération des icônes PWA...\n');

async function generateIcons() {
  if (!fs.existsSync(INPUT_LOGO)) {
    console.error('❌ Logo non trouvé:', INPUT_LOGO);
    console.log('\n💡 Créez public/logo-base.png ou téléchargez-le depuis Downloads');
    process.exit(1);
  }

  try {
    for (const size of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
      
      await sharp(INPUT_LOGO)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png({ quality: 100 })
        .toFile(outputPath);
      
      console.log(`✅ icon-${size}x${size}.png`);
    }

    const faviconPath = path.join(__dirname, '../public/favicon.png');
    await sharp(INPUT_LOGO)
      .resize(32, 32)
      .png()
      .toFile(faviconPath);
    
    console.log('✅ favicon.png');
    console.log('\n🎉 Toutes les icônes générées !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

generateIcons();
