import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/(\s+)<\/div>\s+<\/div>\s+\{\/\* Right Property Panel \*\/\}/, '$1</div>$1</div>$1</div>\n\n             {/* Right Property Panel */}');

fs.writeFileSync(file, txt);
console.log("Replaced!");
