import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace('FileBox, Info, ShieldCheck, CheckCircle2, CopyIcon, Filter', 'FileBox, Info, ShieldCheck, CheckCircle2, CopyIcon, Filter, MapPin, Volume2');

fs.writeFileSync(file, txt);
console.log("Imports added.");
