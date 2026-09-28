import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// The end of Editor view with fragment:
// 2556|  
// 2557|            </div>
// 2558|          </div>
// 2559|        </>
// 2560|  )}

// Let's just remove the </>, the extra </div>s, and fix the syntax nicely!
// We'll replace the chunk from right after Right Property Panel to Target Panel Mock

const regex = /\{\/\* Right Property Panel \*\/\}[\s\S]*?(?=\{\/\* Target Panel Mock \*\/\})/;

let match = txt.match(regex);
if (match) {
    let block = match[0];
    
    // We want the end of the editor view to be perfectly valid.
    // Right Property Panel ends with:
    //                   </div>
    //                 )}
    //              </div>
    //           </div>
    //         )}
    //       </div>

    // We'll replace the end with whatever is actually needed.
    // But since esbuild tells us exactly which ones are mismatched, we can just trial and error.
    
    // Let's remove the <> we added.
    txt = txt.replace('{threeDDesignerView === "editor" && (<>\n', '{threeDDesignerView === "editor" && (\n');
    txt = txt.replace('</>\n)}\n\n      {/* Target Panel Mock */}', ')}\n\n      {/* Target Panel Mock */}');
    
    fs.writeFileSync('src/components/ThreeDDesigner.tsx', txt);
}
