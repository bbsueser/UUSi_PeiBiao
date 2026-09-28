const fs = require('fs');
let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

txt = txt.replace(/const \[selectedLayerId, setSelectedLayerId\] = useState<string \| null>\("layer-temp-card"\);/, 'const [selectedLayerId, setSelectedLayerId] = useState<string | null>("layer-temp");');

fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
console.log('replace sel layer id');
