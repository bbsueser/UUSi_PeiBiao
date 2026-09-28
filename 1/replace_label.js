import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const replacementBlock = `                                      } else if (conf.dataMode === '动态数据' && conf.dynamicDataConfig) {
                                        const dyn = conf.dynamicDataConfig;
                                        const isVirtual = dyn.sourceType === '工程虚拟仿真平台数据';
                                        
                                        const now = new Date();
                                        const timeStr = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}:\${now.getSeconds().toString().padStart(2, '0')}\`;

                                        if (isVirtual) {
                                            const devMeta = VIRTUAL_DEVICES.find(d => d.id === dyn.deviceId);
                                            const statusStatus = virtualSimulationReceiveStatus === '接收中' ? '接收中' : virtualSimulationReceiveStatus === '已暂停' ? '已暂停' : '已连接';
                                            const isReceiving = virtualSimulationReceiveStatus === '接收中';
                                            const isPaused = virtualSimulationReceiveStatus === '已暂停';
                                            
                                            let indicatorColor = isReceiving ? 'bg-[#10A66A]' : isPaused ? 'bg-zinc-500' : 'bg-[#10A66A]';
                                            let textColor = isReceiving ? 'text-[#10A66A]' : isPaused ? 'text-zinc-500' : 'text-[#10A66A]';

                                            return (
                                              <>
                                              {voiceIcon}
                                              {anchorIcon}
                                              <div className={\`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1.5 bg-[#16181E]/90 border \${isSelected ? 'border-[#10A66A]' : 'border-[#2A2D39]'} rounded shadow-xl min-w-[100px] z-10 flex flex-col items-center pointer-events-none whitespace-nowrap\`}>
                                                <div className="text-[10px] text-zinc-400 border-b border-[#2A2D39] pb-0.5 mb-1 w-full text-center truncate px-2">{devMeta?.name || dyn.deviceId}</div>
                                                {(dyn.fields || []).map(fId => {
                                                   const propMeta = devMeta?.props.find(p => p.id === fId);
                                                   let val = dyn.deviceId ? (virtualDeviceData[dyn.deviceId]?.[fId] ?? '-') : '-';
                                                   if (propMeta?.type === '枚举') {
                                                      val = val === 'on' ? '运行中' : '已关闭';
                                                   }
                                                   return (
                                                     <div key={fId} className="flex justify-between items-center w-full gap-3 px-1 my-0.5">
                                                       <span className="text-[9px] text-zinc-400">{propMeta?.name || fId}</span>
                                                       <span className="text-[10px] font-bold font-mono text-[#10A66A]">{val} <span className="text-[8px] font-normal">{propMeta?.unit !== '-' ? propMeta?.unit : ''}</span></span>
                                                     </div>
                                                   );
                                                })}
                                                <div className="flex justify-between items-center w-full mt-1 border-t border-[#2A2D39] pt-1 px-1">
                                                  <div className="flex items-center gap-1">
                                                    <div className={\`w-1.5 h-1.5 rounded-full \${indicatorColor}\`}></div>
                                                    <div className={\`text-[8px] \${textColor}\`}>{statusStatus}</div>
                                                  </div>
                                                  <div className="text-[8px] text-zinc-500 font-mono">{isReceiving || isPaused ? (virtualDataReceiveRecords[0]?.time || timeStr) : '--:--:--'}</div>
                                                </div>
                                              </div>
                                              </>
                                            );
                                        }

                                        const devMeta = CLOUD_DEVICES.find(d => d.id === dyn.deviceId);
                                        const propMeta = devMeta?.props.find(p => p.id === dyn.propertyId);
                                        const val = dyn.deviceId ? (cloudDeviceData[dyn.deviceId]?.[dyn.propertyId] ?? '-') : '-';
                                        
                                        return (
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

const startIdx = txt.indexOf("                                      } else if (conf.dataMode === '动态数据' && conf.dynamicDataConfig) {");
const endIdxStr = "                                      return (\\n                                          <>\\n                                          {voiceIcon}";
const mIdx2 = txt.indexOf(endIdxStr, startIdx);

if (startIdx !== -1 && mIdx2 !== -1) {
    txt = txt.substring(0, startIdx) + replacementBlock + '\\n' + txt.substring(mIdx2);
    fs.writeFileSync(file, txt);
    console.log("Label rendering replaced.");
} else {
    console.log("Could not find label rendering boundaries.");
}
