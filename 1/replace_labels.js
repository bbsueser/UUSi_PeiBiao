import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const dynamicLabelReplacement = `                                    {/* Data Label */}
                                    {(() => {
                                      const pConf = sceneObjectPropertyConfig[obj.id];
                                      
                                      const vConf = pConf?.voiceConfig;
                                      const showVoice = vConf?.applied && vConf.showBtn;
                                      const voiceIcon = vConf?.applied ? <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 p-1 bg-[#10A66A] rounded-full shadow-lg z-20"><Volume2 className="w-3 h-3 text-white" /></div> : null;

                                      const aConf = pConf?.anchorConfig;
                                      const anchorIcon = aConf?.applied ? <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 p-1 bg-[#007BFF] rounded-full shadow-lg z-20"><MapPin className="w-3 h-3 text-white" /></div> : null;

                                      if (pConf?.labelConfig?.applied && pConf.labelConfig.enabled) {
                                        const lc = pConf.labelConfig;
                                        const jc = pConf?.jumpButtonConfig?.applied && pConf?.jumpButtonConfig?.enabled ? pConf.jumpButtonConfig : null;
                                        
                                        return (
                                          <>
                                            {voiceIcon}
                                            {anchorIcon}
                                            <div className={\`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 \${lc.style === '透明样式' ? 'bg-[#16181E]/30' : 'bg-[#1A1B23]/95'} border \${isSelected ? 'border-[#10A66A]' : 'border-[#2A2D39]'} rounded shadow-xl min-w-[120px] z-10 flex flex-col items-center pointer-events-auto whitespace-nowrap\`}>
                                                <div className="flex flex-col w-full text-left gap-1">
                                                    <span className="text-[10px] font-bold text-white flex items-center justify-between border-b border-[#2A2D39] pb-1">{lc.title} {lc.showIcon && <Settings className="w-3 h-3 text-zinc-500" />}</span>
                                                    <span className="text-xs text-[#10A66A] font-bold mt-0.5">{lc.content}</span>
                                                    {lc.showDevice && <span className="text-[9px] text-zinc-400">设备: {obj.name}</span>}
                                                    {lc.showTime && <span className="text-[9px] text-zinc-500">更新: 10:40:20</span>}
                                                    {jc && (
                                                      <button 
                                                        className="mt-1.5 w-full py-1 bg-[#10A66A]/20 hover:bg-[#10A66A]/30 border border-[#10A66A]/30 text-[#10A66A] rounded text-[9px] transition-colors font-bold pointer-events-auto"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTargetPanelVisible({
                                                              title: jc.target,
                                                              visible: true,
                                                              data: { name: obj.name, id: obj.id }
                                                            });
                                                            setDesignerToast("已打开" + jc.target);
                                                            setTimeout(() => setDesignerToast(""), 3000);
                                                        }}
                                                      >{jc.btnName}</button>
                                                    )}
                                                    {showVoice && (
                                                      <button 
                                                        className="mt-1 w-full py-1 bg-[#007BFF]/20 hover:bg-[#007BFF]/30 border border-[#007BFF]/30 text-[#4da3ff] rounded text-[9px] transition-colors font-bold pointer-events-auto flex items-center justify-center gap-1"
                                                        onClick={(e) => { e.stopPropagation(); setDesignerToast("播放语音"); setTimeout(() => setDesignerToast(""), 3000); }}
                                                      ><Volume2 className="w-3 h-3" />播放语音</button>
                                                    )}
                                                </div>
                                            </div>
                                          </>
                                        );
                                      }

                                      // fallback to original static / dynamic logic if labelConfig isn't applied
                                      const conf = sceneObjectDataConfig[obj.id];
                                      if (!conf || !conf.applied) return (
                                        <>
                                          {voiceIcon}
                                          {anchorIcon}
                                        </>
                                      );
                                      
                                      if (conf.dataMode === '静态数据' && conf.staticDataConfig) {
                                        const sc = conf.staticDataConfig;
                                        const colClass = sc.color === '绿色' ? 'text-[#10A66A]' : sc.color === '橙色' ? 'text-orange-400' : sc.color === '浅红色' ? 'text-red-500' : 'text-zinc-300';
                                        return (
                                          <>
                                          {voiceIcon}
                                          {anchorIcon}
                                          <div className={\`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1.5 bg-[#16181E]/90 border \${isSelected ? 'border-[#10A66A]' : 'border-[#2A2D39]'} rounded shadow-xl min-w-[80px] z-10 flex flex-col items-center pointer-events-none whitespace-nowrap\`}>
                                            <div className="text-[10px] text-zinc-400">{sc.name || '数据'}</div>
                                            <div className={\`text-xs font-bold font-mono \${colClass}\`}>{sc.val || '-'} <span className="text-[9px] font-normal">{sc.unit}</span></div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                              <div className={\`w-1.5 h-1.5 rounded-full \${sc.color === '绿色' ? 'bg-[#10A66A]' : 'bg-zinc-500'}\`}></div>
                                              <div className={\`text-[9px] \${colClass}\`}>{sc.status || '正常'}</div>
                                            </div>
                                          </div>
                                          </>
                                        );
                                      } else if (conf.dataMode === '动态数据' && conf.dynamicDataConfig) {
                                        const dyn = conf.dynamicDataConfig;
                                        const devMeta = CLOUD_DEVICES.find(d => d.id === dyn.deviceId);
                                        const propMeta = devMeta?.props.find(p => p.id === dyn.propertyId);
                                        const val = dyn.deviceId ? (cloudDeviceData[dyn.deviceId]?.[dyn.propertyId] ?? '-') : '-';
                                        
                                        const now = new Date();
                                        const timeStr = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}:\${now.getSeconds().toString().padStart(2, '0')}\`;
                                        
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
                                      }
                                      return (
                                          <>
                                          {voiceIcon}
                                          {anchorIcon}
                                          </>
                                      );
                                    })()}`;

const startMarker = '{/* Data Label */}';
const endMarker = '                                    })()}';
const sIdx = txt.indexOf(startMarker);
const eIdx = txt.indexOf(endMarker, sIdx);
if (sIdx > -1 && eIdx > -1) {
    txt = txt.substring(0, sIdx) + dynamicLabelReplacement + txt.substring(eIdx + endMarker.length);
    fs.writeFileSync(file, txt);
    console.log("Replaced labels logic");
} else {
    console.log("Could not find start/end.");
}
