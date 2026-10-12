import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = new URL('../public/images/be-brave-ink/', import.meta.url);
const image = readFileSync(new URL('bark.webp', root)).toString('base64');
// Mirrored neighboring halves have identical edge pixels. The native wrapper
// provides a seam-free vertical repeat without modifying any carving geometry.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="720" height="960" viewBox="0 0 720 960"><defs><image id="bark" width="720" height="480" href="data:image/webp;base64,${image}"/></defs><use href="#bark"/><use href="#bark" transform="translate(0 960) scale(1 -1)"/></svg>\n`;
writeFileSync(fileURLToPath(new URL('bark-repeat.svg', root)), svg);
