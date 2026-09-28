import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const oldRegex = /\{mode === "动态数据" && \(\(\) => \{[\s\S]*?                                \} \/\* End of dataMode 动态数据 \*\/ \)\}/;
/* Actually, I didn't see the comment "End of dataMode". Let's figure out the exact block.
In my previous view call, I have lines ~1534 to ~...
Let's see the end of the `mode === "动态数据"` block in the file.
*/
console.log("ready");
