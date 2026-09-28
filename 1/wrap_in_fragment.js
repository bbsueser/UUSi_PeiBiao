import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Replace '{threeDDesignerView === "editor" && (' with '{threeDDesignerView === "editor" && (<>'
txt = txt.replace(/\{threeDDesignerView === "editor" && \(\s*/, '{threeDDesignerView === "editor" && (<>\n');

// Replace the end of the editor view with '</>)}'
// We know it's at ')}' right before '{/* Target Panel Mock */}'
txt = txt.replace(/(\s*)\)\}\s*\{\/\* Target Panel Mock \*\/\}/, '$1</>\n)}\n\n      {/* Target Panel Mock */}');

fs.writeFileSync('src/components/ThreeDDesigner.tsx', txt);
console.log("Wrapped in <> </>");
