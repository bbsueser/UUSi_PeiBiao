import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const mIdx1 = txt.indexOf('{mode === "动态数据" && (() => {');
const mIdx2 = txt.indexOf('{activePropertyTab === "显示标签" && (() => {', mIdx1);

console.log("Indexes:", mIdx1, mIdx2);
