import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/\\n  const \[dataReceiveStatus/g, '\n  const [dataReceiveStatus');
fs.writeFileSync(file, txt);
console.log("Fixed newline.");
