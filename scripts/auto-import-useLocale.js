/*
 * auto-import-useLocale.js
 * Conservative codemod: for files that use t('...') but don't import/use useLocale,
 * insert `import { useLocale } from '@/context/LocaleContext';` and `const { t } = useLocale();`
 * at the top of the component function (best-effort). This modifies files in-place.
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
    } else if (/\.(tsx|jsx|ts|js)$/.test(file)) {
      files.push(full);
    }
  }
  return files;
}

const root = path.resolve(__dirname, '../src');
const files = walk(root);
let modified = 0;

for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  if (!/\bt\(\s*['\"]/.test(src)) continue; // no t usage
  if (/useLocale/.test(src) || /const\s*\{\s*t\s*\}/.test(src)) continue; // already present

  // insert import after first import block
  const importMatch = src.match(/(^[\s\S]*?import[\s\S]*?;\s*)/m);
  let newSrc = src;
  const importLine = "import { useLocale } from '@/context/LocaleContext';\n";
  if (importMatch) {
    const idx = importMatch.index + importMatch[0].length;
    newSrc = src.slice(0, idx) + importLine + src.slice(idx);
  } else {
    newSrc = importLine + src;
  }

  // try to find function component body start 'export default function X(' or const X = ( ... ) => {
  const funcMatch = newSrc.match(/export\s+default\s+function[\s\S]*?\{/) || newSrc.match(/const\s+[A-Za-z0-9_]+\s*=\s*\([\s\S]*?=>\s*\{/) || newSrc.match(/function\s+[A-Za-z0-9_]+\s*\([\s\S]*?\)\s*\{/);
  if (funcMatch) {
    const insertPos = funcMatch.index + funcMatch[0].length;
    const tLine = '\n  const { t } = useLocale();\n';
    newSrc = newSrc.slice(0, insertPos) + tLine + newSrc.slice(insertPos);
  } else {
    // fallback: add const at top after imports
    const topInsert = importMatch ? importMatch.index + importMatch[0].length : 0;
    newSrc = newSrc.slice(0, topInsert) + '\nconst { t } = useLocale();\n' + newSrc.slice(topInsert);
  }

  if (newSrc !== src) {
    fs.copyFileSync(f, f + '.autofix.bak');
    fs.writeFileSync(f, newSrc, 'utf8');
    modified++;
    console.log('Auto-fixed:', f);
  }
}

console.log('Auto-import run complete. Files modified:', modified);
