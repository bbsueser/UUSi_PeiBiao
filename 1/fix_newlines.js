import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/\\\\n/g, '\\n');

fs.writeFileSync(file, txt);
console.log("Fixed line endings.");
