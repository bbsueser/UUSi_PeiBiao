const fs = require('fs');
let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');
txt = txt.replace(/\\\$/g, '$');
txt = txt.replace(/\\`/g, '`');
fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
