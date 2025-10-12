/*
 * check-i18n-imports.js
 * Ensure any file that contains t('...') also imports useLocale or declares t locally.
 * Exit non-zero when violations are found (for CI/linting).
 */
const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === '.next' || file === 'dist') continue;
      walk(full, files);
    } else if (/\.(tsx|ts|jsx|js)$/.test(file)) {
      files.push(full);
    }
  }
  return files;
}

const root = path.resolve(__dirname, '../src');
const files = walk(root);
let violations = [];

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  if (!/\bt\(\s*['\"]/.test(src)) continue; // no t('') usage

  // allow if file defines const { t } = useLocale or imports useLocale
  const hasUseLocaleImport = /useLocale\s*\}|useLocale\s*from\s+['\"]/m.test(src) || /from\s+['\"]@\/context\/LocaleContext['\"]/.test(src);
  const hasTDeclared = /const\s*\{\s*t\s*\}/.test(src) || /function\s+t\(/.test(src) || /const\s+t\s*=/.test(src);
  if (!hasUseLocaleImport && !hasTDeclared) {
    violations.push(f);
  }
}

if (violations.length) {
  console.error('i18n import checker found files that use t() but do not import/use useLocale or declare t:');
  violations.forEach(v => console.error(' -', v));
  process.exit(2);
}
console.log('i18n import checker passed.');
process.exit(0);
