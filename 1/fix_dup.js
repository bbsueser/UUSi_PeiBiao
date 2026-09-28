import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const strToRemove = `                                       return (
                                          <>
                                          {voiceIcon}
                                          {anchorIcon}
                                          <div className={\`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1.5 bg-[#16181E]/90 border \${isSelected ? 'border-[#10A66A]' : 'border-[#2A2D39]'} rounded shadow-xl min-w-[80px] z-10 flex flex-col items-center pointer-events-none whitespace-nowrap\`}>
                                            <div className="text-[10px] text-zinc-400">{propMeta?.name || '数据'}</div>
                                            <div className="text-xs font-bold font-mono text-[#10A66A]">{val} <span className="text-[9px] font-normal">{propMeta?.unit}</span></div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                              <div className={\`w-1.5 h-1.5 rounded-full \${dataReceiveStatus === '接收中' ? 'bg-[#10A66A]' : 'bg-zinc-500'}\`}></div>
                                              <div className={\`text-[9px] \${dataReceiveStatus === '接收中' ? 'text-[#10A66A]' : 'text-zinc-500'}\`}>{dataReceiveStatus === '接收中' ? '在线' : '已连接'}</div>
                                            </div>
                                            <div className="text-[8px] text-zinc-500 mt-0.5 font-mono">更新时间: {dataReceiveStatus === '接收中' ? timeStr : '--:--:--'}</div>
                                          </div>
                                          </>
                                        );
                                      }`;

let i = txt.indexOf(strToRemove);
if (i !== -1) {
    txt = txt.substring(0, i) + txt.substring(i + strToRemove.length);
    fs.writeFileSync(file, txt);
    console.log("Removed duplicate.");
} else {
    console.log("Not found.");
}
