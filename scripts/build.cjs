const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const curriculum = JSON.parse(fs.readFileSync(path.join(root, 'curriculum.json'), 'utf8'));
if (curriculum.exercises.length !== 48) throw Error('Expected 48 new exercises');
if (new Set(curriculum.path).size !== 60 || curriculum.path.some(id => id < 0 || id >= 60)) throw Error('Invalid learning path');
for (const [i,e] of curriculum.exercises.entries()) {
  if(e.id!==i+12 || !e.stage || !e.title || !e.find || !e.sql || !e.starter || !e.tip || !e.wrong || !e.sort || !e.columns?.length || e.hints?.length!==3 || !e.terms?.length) throw Error('Incomplete exercise '+e.id);
}
const file = path.join(root, 'index.html');
const html = fs.readFileSync(file, 'utf8');
if(!html.includes('<script id="curriculum" type="application/json">')) throw Error('Missing curriculum embed');
const embedded = '<script id="curriculum" type="application/json">\n' + JSON.stringify(curriculum).replace(/</g, '\\u003c') + '\n</script>';
fs.writeFileSync(file, html.replace(/<script id="curriculum" type="application\/json">[\s\S]*?<\/script>/, () => embedded));
console.log('Embedded 48 exercises; 60 stable IDs in learning order.');
