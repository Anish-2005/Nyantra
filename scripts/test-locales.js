/*
 * test-locales.js
 * Ensure en.json and hi.json have matching keys under the same structure
 * and report missing translations (empty strings) in hi.json.
 */
const fs = require('fs');
const path = require('path');

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

const enPath = path.resolve(__dirname, '../src/locales/en.json');
const hiPath = path.resolve(__dirname, '../src/locales/hi.json');

const en = readJson(enPath);
const hi = readJson(hiPath);

function collectKeys(obj, prefix = '') {
  const keys = [];
  if (typeof obj === 'string') {
    keys.push(prefix.slice(0, -1));
    return keys;
  }
  for (const k of Object.keys(obj)) {
    keys.push(...collectKeys(obj[k], prefix + k + '.'));
  }
  return keys;
}

const enKeys = new Set(collectKeys(en));
const hiKeys = new Set(collectKeys(hi));

const missingInHi = [...enKeys].filter(k => !hiKeys.has(k));
const extraInHi = [...hiKeys].filter(k => !enKeys.has(k));

const emptyInHi = [];
for (const k of enKeys) {
  const parts = k.split('.');
  let cursor = hi;
  for (const p of parts) {
    if (cursor && typeof cursor === 'object' && p in cursor) cursor = cursor[p];
    else { cursor = undefined; break; }
  }
  if (typeof cursor === 'string' && cursor === '') emptyInHi.push(k);
}

if (missingInHi.length || extraInHi.length || emptyInHi.length) {
  if (missingInHi.length) {
    console.error('Keys present in en.json but missing in hi.json:', missingInHi.length);
    missingInHi.slice(0, 20).forEach(k => console.error(' -', k));
  }
  if (extraInHi.length) {
    console.error('Keys present in hi.json but missing in en.json:', extraInHi.length);
    extraInHi.slice(0, 20).forEach(k => console.error(' -', k));
  }
  if (emptyInHi.length) {
    console.error('Keys in hi.json that are empty (need translation):', emptyInHi.length);
    emptyInHi.slice(0, 20).forEach(k => console.error(' -', k));
  }
  process.exit(2);
}
console.log('Locale parity test passed: keys match and no empty hi.json values.');
process.exit(0);
