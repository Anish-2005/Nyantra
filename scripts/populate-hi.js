/**
 * populate-hi.js
 * Copy English values into hi.json where entries are missing or empty.
 */
const fs = require('fs');
const path = require('path');

const enPath = path.resolve(__dirname, '../src/locales/en.json');
const hiPath = path.resolve(__dirname, '../src/locales/hi.json');

function mergeEnToHi(en, hi) {
  if (typeof en === 'string') {
    // If hi missing/empty, use en
    if (typeof hi !== 'string' || hi === '') return en;
    return hi;
  }
  if (Array.isArray(en)) {
    // Copy array shape
    if (!Array.isArray(hi)) return en;
    return en.map((item, i) => mergeEnToHi(item, hi[i]));
  }
  // object
  const out = {};
  for (const key of Object.keys(en)) {
    out[key] = mergeEnToHi(en[key], hi && typeof hi === 'object' ? hi[key] : undefined);
  }
  // also preserve any extra keys in hi that en doesn't have
  if (hi && typeof hi === 'object') {
    for (const key of Object.keys(hi)) {
      if (!(key in out)) out[key] = hi[key];
    }
  }
  return out;
}

try {
  const enRaw = fs.readFileSync(enPath, 'utf8');
  const hiRaw = fs.readFileSync(hiPath, 'utf8');
  const en = JSON.parse(enRaw);
  const hi = JSON.parse(hiRaw);

  const merged = mergeEnToHi(en, hi);

  // backup hi
  fs.copyFileSync(hiPath, hiPath + '.bak');

  fs.writeFileSync(hiPath, JSON.stringify(merged, null, 2), 'utf8');
  console.log('hi.json updated with English placeholders where missing. Backup at hi.json.bak');
  process.exit(0);
} catch (err) {
  console.error('populate-hi failed:', err);
  process.exit(2);
}
