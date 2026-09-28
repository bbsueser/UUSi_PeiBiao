import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const targetStr = `{activePropertyTab === "设备绑定" && (
                             <div className="text-zinc-500 text-xs text-center mt-10">设备绑定功能可通过数据配置面板操作。</div>
                           )}
                           {activePropertyTab === "交互动作" && (
                             <div className="text-zinc-500 text-xs text-center mt-10">未配置交互动作。</div>
                           )}`;
                           
const lines = txt.split('\n');
const start = lines.findIndex(l => l.includes('{activePropertyTab === "设备绑定"'));
const end = lines.findIndex(l => l.includes('未配置交互动作。'));

console.log("Start:", start, "End:", end);
