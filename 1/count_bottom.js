import fs from 'fs';
const txt = fs.readFileSync('fix_bottom.js', 'utf8');

const opens = (txt.match(/<div(\s|>)/g) || []).length;
const closes = (txt.match(/<\/div>/g) || []).length;

console.log("In fix_bottom.js newContent, Opens:", opens, "Closes:", closes);
