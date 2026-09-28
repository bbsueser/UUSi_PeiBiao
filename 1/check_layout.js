import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Bottom Canvas Overlays \(Logs and Objects List\) \*\/\}/g;
let match;
while ((match = regex.exec(txt)) !== null) {
  console.log("Found Bottom Canvas Overlays at index", match.index);
}

const regex2 = /\{\/\* Right Property Panel \*\/\}/g;
while ((match = regex2.exec(txt)) !== null) {
  console.log("Found Right Property Panel at index", match.index);
}

const snippet = txt.substring(txt.indexOf("Bottom Canvas Overlays"), txt.indexOf("Right Property Panel")).split('\n').slice(-15).join('\n');
console.log("--- End of Bottom Canvas Overlays ---");
console.log(snippet);
console.log("---");

const endSnippet = txt.split('\n').slice(2550, 2565).join('\n');
console.log("--- Lines 2550-2565 ---");
console.log(endSnippet);

