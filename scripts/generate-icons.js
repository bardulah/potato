#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 *
 * This script generates PNG icons from the SVG icon for PWA support.
 * Requires: No external dependencies - provides instructions only
 *
 * For actual icon generation, use one of these methods:
 *
 * Method 1 - Using ImageMagick (if installed):
 *   convert public/icon.svg -resize 192x192 public/pwa-192x192.png
 *   convert public/icon.svg -resize 512x512 public/pwa-512x512.png
 *
 * Method 2 - Online tool:
 *   1. Go to https://realfavicongenerator.net/
 *   2. Upload public/icon.svg
 *   3. Download generated icons
 *   4. Place in public/ directory
 *
 * Method 3 - Using sharp (npm package):
 *   npm install -D sharp
 *   node scripts/generate-icons-sharp.js
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 PWA Icon Generator\n');

const publicDir = path.join(__dirname, '..', 'public');
const iconPath = path.join(publicDir, 'icon.svg');

// Check if SVG exists
if (!fs.existsSync(iconPath)) {
  console.error('❌ icon.svg not found in public/ directory');
  process.exit(1);
}

console.log('✅ Found icon.svg');
console.log('\nTo generate PNG icons, use one of these methods:\n');

console.log('📦 Method 1 - ImageMagick (recommended if installed):');
console.log('  convert public/icon.svg -resize 192x192 public/pwa-192x192.png');
console.log('  convert public/icon.svg -resize 512x512 public/pwa-512x512.png\n');

console.log('🌐 Method 2 - Online tool:');
console.log('  https://realfavicongenerator.net/\n');

console.log('📚 Method 3 - Using sharp package:');
console.log('  npm install -D sharp');
console.log('  node scripts/generate-icons-sharp.js\n');

// Create placeholder PNGs with instructions
const createPlaceholderImage = (size) => {
  const canvas = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#000"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#00ffff" text-anchor="middle" dominant-baseline="middle">
        ${size}x${size}
      </text>
    </svg>
  `;

  const filename = `pwa-${size}x${size}.png`;
  const filepath = path.join(publicDir, filename);

  // Check if already exists
  if (fs.existsSync(filepath)) {
    console.log(`✅ ${filename} already exists`);
    return true;
  }

  return false;
};

const icons = [192, 512];
let allExist = true;

icons.forEach((size) => {
  if (!createPlaceholderImage(size)) {
    allExist = false;
    console.log(`⚠️  ${size}x${size} PNG needs to be generated`);
  }
});

if (allExist) {
  console.log('\n✅ All required icons exist!');
} else {
  console.log('\n⚠️  Some icons are missing. Please generate them using one of the methods above.');
}

console.log('\n📝 After generating icons, run: npm run build');
