/*
 * test-locales.js
 * Ensure en.json and hi.json have matching keys under the same structure
 * and report missing translations (empty strings) in hi.json.
 * Excludes template strings which should remain empty.
 */
const fs = require('fs');
const path = require('path');

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

const enPath = path.resolve(__dirname, '../src/locales/en.json');
const hiPath = path.resolve(__dirname, '../src/locales/hi.json');

const en = readJson(enPath);
const hi = readJson(hiPath);

// Function to check if a string is a template string or comment (not translatable)
function isTemplateString(value) {
  return typeof value === 'string' &&
         (value.includes("{t('") || value.includes('{t("') || value.includes('{timeRange') || value.includes('{period.') ||
          value.includes('{mode.') || value.includes('{type.') || value.includes('{/*') || value.includes('*/}') ||
          value.includes('{act}') || value.includes('{sortOrder') || value.includes('{chartType') ||
          value.includes('{Math.round') || value.includes('{currentPage') || value.includes('{isSubmitting') ||
          value.includes('{loading') || value.startsWith('{') && value.includes('&&') ||
          value.startsWith('{') && value.includes('?') || value.includes('{category') ||
          value.includes('{percentage') || value.includes('{metric') || value.includes('{stat') ||
          value.includes('{pageNum') || value.includes('{beneficiary') || value.includes('{district') ||
          value.includes('a + b') || value.includes('Math.round') || value.includes('toFixed') ||
          value.includes('{initialData') || value.includes('{toastMessage') || value.includes('{confirmModalMessage'));
}

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
  let cursorEn = en;
  let cursorHi = hi;
  for (const p of parts) {
    if (cursorEn && typeof cursorEn === 'object' && p in cursorEn) cursorEn = cursorEn[p];
    else { cursorEn = undefined; break; }
    if (cursorHi && typeof cursorHi === 'object' && p in cursorHi) cursorHi = cursorHi[p];
    else { cursorHi = undefined; break; }
  }
  // Only consider it empty if it's not a template string
  if (typeof cursorHi === 'string' && cursorHi === '' && !isTemplateString(cursorEn)) {
    emptyInHi.push(k);
  }
}

if (missingInHi.length || extraInHi.length) {
  if (missingInHi.length) {
    console.error('Keys present in en.json but missing in hi.json:', missingInHi.length);
    missingInHi.slice(0, 20).forEach(k => console.error(' -', k));
  }
  if (extraInHi.length) {
    console.error('Keys present in hi.json but missing in en.json:', extraInHi.length);
    extraInHi.slice(0, 20).forEach(k => console.error(' -', k));
  }
  process.exit(2);
}

// Report empty translations as warnings, not errors
if (emptyInHi.length) {
  console.warn('Keys in hi.json that are empty (need translation):', emptyInHi.length);
  emptyInHi.slice(0, 20).forEach(k => console.warn(' -', k));
  console.log('\nLocale structure test passed: keys match (empty translations allowed).');
} else {
  console.log('Locale parity test passed: keys match and no empty hi.json values.');
}
process.exit(0);
