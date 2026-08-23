const fs = require('fs');
const path = require('path');

const en = require('../src/locales/en.json');
const hi = require('../src/locales/hi.json');

function get(obj, keyPath) {
  const parts = keyPath.split('.');
  let node = obj;
  for (const p of parts) {
    if (node && typeof node === 'object' && p in node) node = node[p];
    else return undefined;
  }
  return node;
}

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    const st = fs.statSync(fp);
    if (st.isDirectory()) walk(fp, out);
    else if (/\.tsx?$/.test(f)) out.push(fp);
  }
  return out;
}

const srcDir = path.join(__dirname, '..', 'src');
const files = walk(srcDir).filter((f) => !f.includes('locales'));

const usedKeys = new Map(); // key -> [file:line]
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    // match t('key'), t("key"), t(`key`) only when literal
    const re = /\bt\(\s*(['"])((?:(?!\1)[^\\])*)\1/g;
    let m;
    while ((m = re.exec(line)) !== null) {
      const key = m[2];
      if (!key.trim()) continue;
      if (!usedKeys.has(key)) usedKeys.set(key, []);
      usedKeys.get(key).push(`${path.relative(srcDir, file)}:${i + 1}`);
    }
  });
}

const missingEn = [];
const missingHi = [];
const emptyHi = [];
for (const [key, locs] of [...usedKeys.entries()].sort()) {
  const ev = get(en, key);
  const hv = get(hi, key);
  if (ev === undefined) missingEn.push({ key, locs });
  if (hv === undefined) missingHi.push({ key, locs });
  else if (typeof hv === 'string' && hv.trim() === '') emptyHi.push({ key, locs });
}

console.log('=== MISSING IN en.json (' + missingEn.length + ') ===');
missingEn.forEach(({ key, locs }) => console.log(key, '<-', locs.slice(0, 3).join(', ')));
console.log('\n=== MISSING/EMPTY IN hi.json (' + missingHi.length + ' missing, ' + emptyHi.length + ' empty) ===');
missingHi.forEach(({ key, locs }) => console.log(key, '<-', locs.slice(0, 3).join(', ')));
console.log('\n=== EMPTY STRING IN hi.json (' + emptyHi.length + ') ===');
emptyHi.forEach(({ key }) => console.log(key));

fs.writeFileSync(
  path.join(__dirname, 'missing-keys-report.json'),
  JSON.stringify({ missingEn, missingHi, emptyHi }, null, 2)
);
