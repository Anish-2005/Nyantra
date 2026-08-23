const fs = require('fs');
for (const f of ['en.json', 'hi.json']) {
  const src = fs.readFileSync('./src/locales/' + f, 'utf8');
  const lines = src.split('\n');
  const stack = [];
  const seen = new Map();
  lines.forEach((line, i) => {
    const m = line.match(/^(\s*)"([^"]+)":\s*[{\[]?\s*$/);
    if (m) {
      const indent = m[1].length;
      const key = m[2];
      while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
      const pathStr = [...stack.map(s => s.key), key].join('.');
      if (seen.has(pathStr)) console.log(f, 'DUP:', pathStr, 'at lines', seen.get(pathStr), 'and', i + 1);
      seen.set(pathStr, i + 1);
      stack.push({ key, indent });
    }
  });
}
console.log('done');
