import fs from 'fs';
const txt = fs.readFileSync('fix_bottom.js', 'utf8');

// Find all <div> and </div> in the newContent string
let code = txt.substring(txt.indexOf('const newContent = `') + 20, txt.lastIndexOf('`;'));
let openTags = code.match(/<div(\s|>)/g)?.length || 0;
let closeTags = code.match(/<\/div>/g)?.length || 0;
let openTds = code.match(/<td(\s|>)/g)?.length || 0;
let closeTds = code.match(/<\/td>/g)?.length || 0;
let openTrs = code.match(/<tr(\s|>)/g)?.length || 0;
let closeTrs = code.match(/<\/tr>/g)?.length || 0;
let openThs = code.match(/<th(\s|>)/g)?.length || 0;
let closeThs = code.match(/<\/th>/g)?.length || 0;

console.log("<div>:", openTags, "</div>:", closeTags);
console.log("<td>:", openTds, "</td>:", closeTds);
console.log("<tr>:", openTrs, "</tr>:", closeTrs);
console.log("<th>:", openThs, "</th>:", closeThs);

