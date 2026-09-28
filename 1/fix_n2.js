import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/\\n  const handleStartReceive/g, '\n  const handleStartReceive');
fs.writeFileSync(file, txt);
console.log("Fixed newline 2.");
