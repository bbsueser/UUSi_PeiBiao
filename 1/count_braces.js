import fs from 'fs';
const txt = fs.readFileSync('fix_bottom.js', 'utf8');

let code = txt.substring(txt.indexOf('const newContent = `') + 20, txt.lastIndexOf('`;'));
const opens = (code.match(/{/g) || []).length;
const closes = (code.match(/}/g) || []).length;

console.log("Braces {:", opens, "}:", closes);
