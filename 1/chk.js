import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const sIdx = txt.indexOf('1841:');
const startMatch = txt.indexOf('mode === "动态数据"');
console.log(startMatch);

// lets regex the end
const reg = /\{\s*activePropertyTab === "显示标签"/;
const endM = txt.match(reg);
console.log(endM?.index);
