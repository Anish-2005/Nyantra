const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const pagePath = path.join(repoRoot, 'src', 'app', 'dashboard', 'beneficiaries', 'page.tsx');
const enPath = path.join(repoRoot, 'src', 'locales', 'en.json');
const hiPath = path.join(repoRoot, 'src', 'locales', 'hi.json');

function readFile(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function setNested(obj, pathArr, value) {
  let cur = obj;
  for (let i = 0; i < pathArr.length - 1; i++) {
    const k = pathArr[i];
    if (typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {};
    cur = cur[k];
  }
  const last = pathArr[pathArr.length - 1];
  if (cur[last] === undefined) {
    cur[last] = value;
    return true;
  }
  return false;
}

function humanize(keyPart) {
  if (!keyPart) return keyPart;
  // Replace common patterns and camel/case
  let s = keyPart.replace(/[_\-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
  // Title case small
  s = s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return s;
}

function extractKeysFromPage(content) {
  const re = /t\(\s*['"]([^'"]+)['"]\s*\)/g;
  const keys = new Set();
  let m;
  while ((m = re.exec(content)) !== null) keys.add(m[1]);
  return Array.from(keys);
}

function main() {
  const page = readFile(pagePath);
  if (!page) {
    console.error('Page file not found:', pagePath);
    process.exit(2);
  }

  const enRaw = readFile(enPath);
  const hiRaw = readFile(hiPath);
  if (!enRaw || !hiRaw) {
    console.error('Locale files not found at', enPath, 'or', hiPath);
    process.exit(2);
  }

  let enJson, hiJson;
  try {
    enJson = JSON.parse(enRaw);
    hiJson = JSON.parse(hiRaw);
  } catch (e) {
    console.error('Failed to parse locale JSON:', e.message);
    process.exit(2);
  }

  const keys = extractKeysFromPage(page);
  const added = [];

  for (const key of keys) {
    const parts = key.split('.');
    // Try to set placeholder in enJson under the correct nested path
    const placeholder = humanize(parts[parts.length - 1]);
    const hiPlaceholder = `TODO: HI: ${placeholder}`;
    const enAdded = setNested(enJson, parts, placeholder);
    const hiAdded = setNested(hiJson, parts, hiPlaceholder);
    if (enAdded || hiAdded) added.push({ key, enAdded, hiAdded });
  }

  if (added.length === 0) {
    console.log('No missing keys detected. Nothing changed.');
    return;
  }

  // Backup originals
  fs.copyFileSync(enPath, enPath + '.bak');
  fs.copyFileSync(hiPath, hiPath + '.bak');

  writeJson(enPath, enJson);
  writeJson(hiPath, hiJson);

  console.log(`Added ${added.length} keys (or confirmed existing). Backups written to .bak files.`);
  // Print sample of added keys
  for (const a of added.slice(0, 200)) {
    console.log(`${a.key} -> en:${a.enAdded} hi:${a.hiAdded}`);
  }
  if (added.length > 200) console.log(`...and ${added.length - 200} more`);
}

main();
