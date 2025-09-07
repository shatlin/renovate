const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Ultra-bold, high-contrast design like Google/Gmail/YouTube icons
const svgContent = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- White background for maximum contrast -->
  <rect width="32" height="32" fill="white" />
  
  <!-- Ultra-bold house shape with vibrant colors -->
  <defs>
    <linearGradient id="boldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5B21B6" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
  </defs>
  
  <!-- Very bold, simplified house that fills the entire space -->
  <!-- Roof - large triangle -->
  <path d="M 2 16 L 16 3 L 30 16 L 27 16 L 27 29 L 5 29 L 5 16 Z" 
        fill="#7C3AED" 
        stroke="#5B21B6" 
        stroke-width="0.5" />
  
  <!-- Wall - bold rectangle -->
  <rect x="5" y="16" width="22" height="13" fill="#3B82F6" />
  
  <!-- Door - large and bold -->
  <rect x="12" y="20" width="8" height="9" fill="#DC2626" />
  
  <!-- Windows - large and bright -->
  <rect x="7" y="18" width="4" height="4" fill="#FCD34D" />
  <rect x="21" y="18" width="4" height="4" fill="#FCD34D" />
  
  <!-- Door knob -->
  <circle cx="18" cy="24.5" r="0.8" fill="#FFF" />
</svg>`;

// Even bolder version with just the house shape
const svgContentUltraBold = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Ultra minimalist for 16x16 -->
  <rect width="16" height="16" fill="white" />
  
  <!-- Single bold house shape with vibrant gradient -->
  <defs>
    <linearGradient id="ultraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1" />
      <stop offset="50%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
  </defs>
  
  <!-- House silhouette that fills the entire 16x16 space -->
  <path d="M 1 8 L 8 1 L 15 8 L 14 8 L 14 15 L 2 15 L 2 8 Z" 
        fill="url(#ultraGrad)" />
  
  <!-- Door -->
  <rect x="6" y="10" width="4" height="5" fill="#1F2937" opacity="0.3" />
  
  <!-- Windows -->
  <rect x="3" y="9" width="2" height="2" fill="#FFF" opacity="0.9" />
  <rect x="11" y="9" width="2" height="2" fill="#FFF" opacity="0.9" />
</svg>`;

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  console.log('Generating ultra-bold icon files for maximum visibility...');
  
  // Use ultra-bold version for 16x16
  const svgBuffer16 = Buffer.from(svgContentUltraBold);
  await sharp(svgBuffer16)
    .resize(16, 16, {
      kernel: sharp.kernel.nearest
    })
    .png({
      compressionLevel: 0 // No compression for sharper pixels
    })
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('✓ Generated favicon-16x16.png (ultra-bold)');

  // Use bold version for 32x32
  const svgBuffer32 = Buffer.from(svgContent);
  await sharp(svgBuffer32)
    .resize(32, 32, {
      kernel: sharp.kernel.nearest
    })
    .png({
      compressionLevel: 0
    })
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✓ Generated favicon-32x32.png (bold)');

  // Generate ICO with both sizes
  await sharp(svgBuffer32)
    .resize(32, 32, {
      kernel: sharp.kernel.nearest
    })
    .png({
      compressionLevel: 0
    })
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ Generated favicon.ico (bold)');

  // Also update the main SVG favicon
  await fs.writeFile(
    path.join(publicDir, 'favicon.svg'),
    svgContent,
    'utf8'
  );
  console.log('✓ Updated favicon.svg');

  console.log('\nUltra-bold favicon generation complete!');
  console.log('Clear your browser cache and reload to see the new bold favicon.');
}

generateIcons().catch(console.error);