import fs from 'fs';

const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const regexLabel = /<div className=\{`absolute bottom-full left-1\/2 -translate-x-1\/2 mb-2 p-1\.5 bg-\[#16181E\]\/90 border \$\{isSelected \? 'border-\[#10A66A\]' : 'border-\[#2A2D39\]'\} rounded shadow-xl min-w-\[100px\] z-10 flex flex-col items-center pointer-events-none whitespace-nowrap animate-in fade-in duration-500`\}>[\s\S]*?(?=<\/div>\s*<\/>\s*\);)/;

const newLabelContent = `<div className={\`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-[#16181E]/90 border \${isSelected ? 'border-[#10A66A]' : 'border-[#2A2D39]'} rounded shadow-xl min-w-[120px] z-10 flex flex-col items-center pointer-events-none whitespace-nowrap animate-in fade-in duration-500\`}>
                                                <div className="text-[11px] text-zinc-300 font-bold border-b border-[#2A2D39] pb-1 mb-1.5 w-full text-center truncate">{devMeta?.name?.split(' ')[0] || (devMeta?.name || dyn.deviceId)}</div>
                                                {(dyn.fields || []).map((fId: string) => {
                                                   const propMeta = devMeta?.props.find((p:any) => p.id === fId);
                                                   let val = dyn.deviceId ? (virtualDeviceData[dyn.deviceId]?.[fId] ?? '-') : '-';
                                                   if (propMeta?.type === '枚举') {
                                                      val = val === 'on' ? '运行中' : '已关闭';
                                                   }
                                                   return (
                                                     <div key={fId} className="flex justify-between items-center w-full gap-4 px-1 my-0.5">
                                                       <span className="text-[9px] text-zinc-400">{propMeta?.name || fId}：</span>
                                                       <span className="text-[10px] font-bold font-mono text-[#10A66A]">{val} <span className="text-[8px] font-normal">{propMeta?.unit !== '-' ? propMeta?.unit : ''}</span></span>
                                                     </div>
                                                   );
                                                })}
                                                <div className="flex justify-between items-center w-full mt-1.5 gap-4 px-1">
                                                   <span className="text-[9px] text-zinc-400">来源：</span>
                                                   <span className="text-[9px] text-zinc-300">工程虚拟仿真平台</span>
                                                </div>
                                                <div className="flex justify-between items-center w-full gap-4 px-1">
                                                   <span className="text-[9px] text-zinc-400">状态：</span>
                                                   <div className="flex items-center gap-1">
                                                     <div className={\`w-1.5 h-1.5 rounded-full \${indicatorColor}\`}></div>
                                                     <div className={\`text-[9px] \${textColor}\`}>{statusStatus}</div>
                                                   </div>
                                                </div>
                                                <div className="flex justify-between items-center w-full gap-4 px-1">
                                                   <span className="text-[9px] text-zinc-400 border-[#2A2D39] pt-0.5">更新时间：</span>
                                                   <span className="text-[9px] text-zinc-500 font-mono pt-0.5">{isReceiving || isPaused ? (virtualDataReceiveRecords[0]?.time || timeStr) : '--:--:--'}</span>
                                                </div>`;

if (txt.match(regexLabel)) {
    txt = txt.replace(regexLabel, newLabelContent);
    console.log("Canvas label replaced.");
} else {
    console.log("Canvas label regex missed.");
}


const regexStatusBar = /\{\/\* Right Top Canvas Overlays \*\/\}\s*<div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2 text-xs">/;

const newStatusBar = `{/* Right Top Canvas Overlays */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-xs">
                   <div className="bg-[#1A1B23]/90 backdrop-blur border border-[#10A66A]/30 rounded-full px-5 py-2 flex items-center justify-between min-w-[300px] shadow-lg shadow-[#10A66A]/10">
                      <div className="flex items-center gap-2 mr-6">
                        <div className={\`w-2 h-2 rounded-full animate-pulse \${virtualSimulationReceiveStatus === '接收中' ? 'bg-[#10A66A]' : virtualSimulationConnectionStatus === '已连接' ? 'bg-[#10A66A]/50' : 'bg-zinc-600'}\`}></div>
                        <span className={\`font-bold whitespace-nowrap \${virtualSimulationReceiveStatus === '接收中' ? 'text-[#10A66A]' : virtualSimulationConnectionStatus === '已连接' ? 'text-[#10A66A]/70' : 'text-zinc-500'}\`}>工程虚拟仿真平台数据接入中</span>
                      </div>
                      <div className="flex gap-4 text-[10px] text-zinc-400">
                        <span className="truncate max-w-[120px]">当前工程：{virtualSimulationProject}</span>
                        <span>已接收设备：{VIRTUAL_DEVICES.length} 台</span>
                        <span>刷新频率：2 秒</span>
                      </div>
                   </div>
                </div>

                {/* Old Top Right Overlays */}
                <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2 text-xs">`;

if (txt.match(regexStatusBar)) {
    txt = txt.replace(regexStatusBar, newStatusBar);
    console.log("Status bar added.");
} else {
    console.log("Status bar regex missed.");
}

fs.writeFileSync(file, txt);
