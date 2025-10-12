#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const EN_FILE = path.join(SRC, 'locales', 'en.json');
const HI_FILE = path.join(SRC, 'locales', 'hi.json');

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 60);
}

async function readJson(file) {
  try {
    const txt = await fs.readFile(file, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    return {};
  }
}

async function writeJson(file, obj) {
  const txt = JSON.stringify(obj, null, 2) + '\n';
  await fs.writeFile(file, txt, 'utf8');
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

function extractStrings(content) {
  const found = new Set();

  // JSX text nodes: >some text<
  const textRe = />\s*([^<>\n]{4,200}?)\s*</g;
  let m;
  while ((m = textRe.exec(content))) {
    const s = m[1].trim();
    if (s && /[a-zA-Z]/.test(s) && s.length > 2) found.add(s);
  }

  // Common attributes
  const attrRe = /(?:alt|placeholder|aria-label|title|label)=\s*(?:\{\s*)?(?:"|')([^"'\\<>]{2,200})(?:"|')(?:\s*\})?/g;
  while ((m = attrRe.exec(content))) {
    const s = m[1].trim();
    if (s && /[a-zA-Z]/.test(s) && s.length > 1) found.add(s);
  }

  // aria-labels inside JSX spread or double quotes too
  return Array.from(found).filter(Boolean);
}

async function main() {
  console.log('Scanning source files for translatable strings...');
  const files = await walk(SRC);
  const en = await readJson(EN_FILE);
  const hi = await readJson(HI_FILE);
  en.extracted = en.extracted || {};
  hi.extracted = hi.extracted || {};

  const existing = new Set(Object.values(en).flatMap(v => typeof v === 'object' ? Object.values(v) : [v]));

  let added = 0;
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const strings = extractStrings(content);
    for (const str of strings) {
      // skip if this exact string is already present anywhere in en.json
      const already = Object.values(en).flatMap(v => typeof v === 'object' ? Object.values(v) : [v]).includes(str) || Object.values(en.extracted || {}).includes(str);
      if (already) continue;

      // generate a key
      const base = slugify(str).replace(/^_+|_+$/g, '') || 'text';
      let key = base;
      let idx = 1;
      while (en.extracted[key]) {
        key = `${base}_${idx++}`;
      }

      en.extracted[key] = str;
      hi.extracted[key] = '';
      added++;
      console.log(`[32mAdded key: extracted.${key}[0m -> "${str}" (from ${path.relative(ROOT, file)})`);
    }
  }

  if (added > 0) {
    await writeJson(EN_FILE, en);
    await writeJson(HI_FILE, hi);
    console.log(`
Wrote ${added} new extracted strings to:
  - ${path.relative(ROOT, EN_FILE)}
  - ${path.relative(ROOT, HI_FILE)}
`);
  } else {
    console.log('No new strings found.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
