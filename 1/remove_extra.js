import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/<\/div>\n          <\/div>\n        <\/div>\n\{\/\* Right Property Panel \*\/\}/, '</div>\n{/* Right Property Panel */}');

fs.writeFileSync(file, txt);
console.log("Removed extra divs");
