const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Simplified, bolder SVG for better visibility at small sizes
const svgContent = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Simplified bold house for favicon visibility -->
  <defs>
    <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="50%" stop-color="#7C3AED" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
  </defs>
  
  <!-- White background circle for contrast -->
  <circle cx="50" cy="50" r="48" fill="white" />
  
  <!-- Bold house silhouette -->
  <g transform="translate(50, 50) scale(1.8)">
    <!-- Roof -->
    <path d="M -20 0 L 0 -15 L 20 0 L 15 0 L 15 20 L -15 20 L -15 0 Z" 
          fill="url(#mainGrad)" 
          stroke="url(#mainGrad)" 
          stroke-width="2" 
          stroke-linejoin="round" />
    
    <!-- Chimney -->
    <rect x="8" y="-10" width="6" height="10" fill="#6B7280" />
    
    <!-- Door -->
    <rect x="-4" y="8" width="8" height="12" fill="#F97316" />
    
    <!-- Windows -->
    <rect x="-12" y="2" width="6" height="6" fill="#FCD34D" />
    <rect x="6" y="2" width="6" height="6" fill="#FCD34D" />
  </g>
</svg>`;

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Icon sizes to generate with the simplified design
  const iconSizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon.ico', size: 32 }, // Update the main favicon.ico
  ];

  console.log('Generating simplified icon files for better visibility...');
  
  const svgBuffer = Buffer.from(svgContent);
  
  for (const icon of iconSizes) {
    try {
      await sharp(svgBuffer)
        .resize(icon.size, icon.size, {
          kernel: sharp.kernel.nearest // Use nearest neighbor for sharp pixels at small sizes
        })
        .png()
        .toFile(path.join(publicDir, icon.name));
      console.log(`✓ Generated ${icon.name}`);
    } catch (error) {
      console.error(`✗ Failed to generate ${icon.name}:`, error.message);
    }
  }

  console.log('\nSimplified favicon generation complete!');
}

generateIcons().catch(console.error);