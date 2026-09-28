import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
const txt = fs.readFileSync(file, 'utf8');

const tsxCode = txt.substring(txt.indexOf('{threeDDesignerView === "editor"'), txt.indexOf('{/* Target Panel Mock */}'));

let openDivs = 0;
let closeDivs = 0;

const opens = (tsxCode.match(/<div(\s|>)/g) || []).length;
const closes = (tsxCode.match(/<\/div>/g) || []).length;

console.log("Opens:", opens, "Closes:", closes);

