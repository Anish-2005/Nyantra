/*
 * export-i18n-csv.js
 * Export all keys into CSV and JSON for translators: key,en,hi
 */
const fs = require('fs');
const path = require('path');

const enPath = path.resolve(__dirname, '../src/locales/en.json');
const hiPath = path.resolve(__dirname, '../src/locales/hi.json');

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

const en = readJson(enPath);
const hi = readJson(hiPath);

function collect(obj, prefix = '') {
  const rows = [];
  if (typeof obj === 'string') {
    rows.push({ key: prefix.slice(0, -1), val: obj });
    return rows;
  }
  for (const k of Object.keys(obj)) {
    rows.push(...collect(obj[k], prefix + k + '.'));
  }
  return rows;
}

const enRows = collect(en);
const hiMap = new Map(collect(hi).map(r => [r.key, r.val]));

const outCsv = ['key,en,hi'];
for (const r of enRows) {
  const hiVal = hiMap.get(r.key) ?? '';
  // escape quotes
  const enEsc = String(r.val).replace(/"/g, '""');
  const hiEsc = String(hiVal).replace(/"/g, '""');
  outCsv.push(`"${r.key}","${enEsc}","${hiEsc}"`);
}

const outDir = path.resolve(__dirname, '../i18n_exports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
fs.writeFileSync(path.join(outDir, 'i18n.csv'), outCsv.join('\n'), 'utf8');
fs.writeFileSync(path.join(outDir, 'i18n.json'), JSON.stringify(enRows.map(r => ({ key: r.key, en: r.val, hi: hiMap.get(r.key) ?? '' })), null, 2), 'utf8');
console.log('Exported i18n CSV / JSON to i18n_exports/');
