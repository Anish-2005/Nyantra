/*
 * i18n-group.js
 * Heuristic grouping: move keys under extracted.* into simple namespaces based on file paths.
 * This script creates a new locales file backup and writes grouped keys.
 */
const fs = require('fs');
const path = require('path');

const enPath = path.resolve(__dirname, '../src/locales/en.json');
const hiPath = path.resolve(__dirname, '../src/locales/hi.json');

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJson(p, obj) { fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8'); }

const en = readJson(enPath);
const hi = readJson(hiPath);

if (!en.extracted) {
  console.log('No extracted namespace found, aborting.');
  process.exit(0);
}

// Very small heuristic: keys containing 'dashboard' -> dashboard.*, 'login' -> auth.* etc.
function guessNamespace(key) {
  const k = key.toLowerCase();
  if (k.includes('login') || k.includes('sign_in') || k.includes('email') || k.includes('password')) return 'auth';
  if (k.includes('dashboard') || k.includes('applicant') || k.includes('nyantra')) return 'dashboard';
  if (k.includes('sidebar') || k.includes('open_sidebar') || k.includes('close_sidebar')) return 'sidebar';
  if (k.includes('grievance') || k.includes('grievances')) return 'grievance';
  if (k.includes('disbursement') || k.includes('disbursements')) return 'disbursement';
  if (k.includes('beneficiary') || k.includes('beneficiaries')) return 'beneficiary';
  if (k.includes('integration') || k.includes('integrations') || k.includes('nsdl')) return 'integrations';
  if (k.includes('footer') || k.includes('copyright') || k.includes('developed')) return 'footer';
  if (k.includes('hero') || k.includes('apply')) return 'hero';
  if (k.includes('nav') || k.includes('getstarted') || k.includes('features')) return 'nav';
  return 'misc';
}

const groupedEn = { ...en };
const groupedHi = { ...hi };

groupedEn.extracted_grouped = {};
groupedHi.extracted_grouped = {};

for (const [key, val] of Object.entries(en.extracted)) {
  const ns = guessNamespace(key);
  groupedEn.extracted_grouped[ns] = groupedEn.extracted_grouped[ns] || {};
  groupedEn.extracted_grouped[ns][key] = val;
  groupedHi.extracted_grouped[ns] = groupedHi.extracted_grouped[ns] || {};
  groupedHi.extracted_grouped[ns][key] = hi.extracted ? (hi.extracted[key] || '') : '';
  // leave original extracted in place for backward compatibility
}

// Backup
fs.copyFileSync(enPath, enPath + '.grouped.bak');
fs.copyFileSync(hiPath, hiPath + '.grouped.bak');

writeJson(enPath, groupedEn);
writeJson(hiPath, groupedHi);
console.log('Created extracted_grouped namespace and backed up originals to .grouped.bak');
