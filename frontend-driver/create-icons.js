const fs = require('fs');
const path = require('path');

// Créer des fichiers PNG placeholder basiques (data URL)
const createPlaceholderPNG = (size) => {
  // Canvas minimal - PNG 1x1 transparent
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return Buffer.from(pngBase64, 'base64');
};

// Pour le moment, créer des placeholders
const sizes = [192, 512];
sizes.forEach(size => {
  const placeholder = createPlaceholderPNG(size);
  fs.writeFileSync(path.join(__dirname, 'public', `icon-${size}.png`), placeholder);
  console.log(`Created icon-${size}.png`);
});

console.log('\n⚠️  Note: Les icônes sont des placeholders.');
console.log('Pour de vraies icônes, utilisez un outil comme:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://progressier.com/pwa-manifest-generator');
