import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const tLine = txt.split('\\n');
tLine.splice(1259, 16); // Remove lines 1260 through 1275 (0-indexed 1259 to 1274 approx? Let's check exactly).

fs.writeFileSync('src/components/ThreeDDesigner.tsx', tLine.join('\\n'));
console.log('done');
