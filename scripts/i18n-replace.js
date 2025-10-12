#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const EN_FILE = path.join(SRC, 'locales', 'en.json');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function readJson(file) {
  try {
    const txt = await fs.readFile(file, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    return {};
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const res = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === '.next') continue;
      files.push(...(await walk(res)));
    } else if (/\.(jsx|tsx|js|ts)$/.test(ent.name)) {
      files.push(res);
    }
  }
  return files;
}

function isSafeString(s) {
  if (typeof s !== 'string') return false;
  if (!/[A-Za-z0-9]/.test(s)) return false; // must contain letters/numbers
  if (s.length < 2 || s.length > 200) return false;
  // disallow values that look like code or JSX
  if (/[{}<>`$]/.test(s)) return false;
  if (/^\s*\/\*/.test(s)) return false;
  return true;
}

async function main() {
  console.log('Loading extracted keys from', EN_FILE);
  const en = await readJson(EN_FILE);
  const extracted = (en && en.extracted) ? en.extracted : {};
  const safeKeys = Object.entries(extracted).filter(([k, v]) => isSafeString(v));
  console.log(`Found ${Object.keys(extracted).length} extracted keys, ${safeKeys.length} considered safe for automated replacement.`);

  const files = await walk(SRC);
  let totalReplacements = 0;
  const modifiedFiles = new Map();

  for (const file of files) {
    let content = await fs.readFile(file, 'utf8');
    let original = content;
    for (const [key, val] of safeKeys) {
      const v = String(val).trim();
      if (!v) continue;

      // Skip if already contains t('extracted.key') to avoid double replacing
      const alreadyMarker = `t('extracted.${key}')`;
      if (content.includes(alreadyMarker)) continue;

      // Replace attribute occurrences: attr="VALUE" or attr='VALUE'
      const attrPattern = new RegExp(`(=(?:\"|\')${escapeRegex(v)}(?:\"|\'))`, 'g');
      // We need to be more specific: only replace in JSX attribute contexts like alt="..." or aria-label="..."
      const jsxAttrPattern = new RegExp(`(alt|placeholder|aria-label|title|label|aria-describedby|aria-labelledby)=(?:\"|\')${escapeRegex(v)}(?:\"|\')`, 'g');
      content = content.replace(jsxAttrPattern, (m, p1) => `${p1}={t('extracted.${key}')}`);

      // Replace JSX text nodes: >VALUE< (allow whitespace/newlines)
      const textPattern = new RegExp(`(>\s*)${escapeRegex(v)}(\s*<)`, 'g');
      content = content.replace(textPattern, (m, p1, p2) => `${p1}{t('extracted.${key}')} ${p2}`);

      // Count replacements for this key in the file
    }

    if (content !== original) {
      // quick heuristic: do not modify files that contain JSX comments we replaced incorrectly
      await fs.writeFile(file, content, 'utf8');
      modifiedFiles.set(file, true);
      totalReplacements += 1;
      console.log(`Modified: ${path.relative(ROOT, file)}`);
    }
  }

  console.log(`Automated replacement finished. ${modifiedFiles.size} files modified (${totalReplacements} files rewritten).`);
  console.log('Please review changes and run the project build/tests.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
