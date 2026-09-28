import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const replacementBlock = `                               {mode === "动态数据" && (() => {
                                 const dyn = config.dynamicDataConfig || {};
                                 const sourceType = dyn.sourceType || '工程虚拟仿真平台数据';
                                 
                                 if (sourceType === '行业云平台设备数据' || sourceType === '行业云数据仿真任务数据' || sourceType === '行业云设备管理数据') {
                                   const devMeta = CLOUD_DEVICES.find(d => d.id === dyn.deviceId) || CLOUD_DEVICES[0];
                                   const propMeta = devMeta?.props.find(p => p.id === dyn.propertyId) || devMeta?.props[0];
                                   return (
                                     <div className="space-y-3 pt-2">
                                       <div className="space-y-1">
                                         <label className="text-[10px] text-zinc-400">数据源类型</label>
                                         <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select"
                                            value={dyn.sourceType || '工程虚拟仿真平台数据'}
                                            onChange={e => updateConfig((c:any) => ({...c, dynamicDataConfig: {...(c.dynamicDataConfig||{}), sourceType: e.target.value}}))} >
                                            <option value="工程虚拟仿真平台数据">工程虚拟仿真平台数据</option>
                                            <option value="行业云平台设备数据">行业云平台设备数据</option>
                                            <option value="本地测试数据">本地测试数据</option>
                                         </select>
                                       </div>
                                       <div className="text-[10px] text-zinc-500 bg-[#16181E] p-2 rounded leading-relaxed mb-3">行业云平台旧版兼容模式，请切换至工程虚拟仿真平台数据。</div>
                                     </div>
                                   );
                                 }

                                 const devMeta = VIRTUAL_DEVICES.find(d => d.id === dyn.deviceId) || VIRTUAL_DEVICES[0];
                                 const selectedFields = dyn.fields || ['temperature', 'humidity'];

                                 return (
                                 <div className="space-y-3 pt-2">
                                   <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mb-2">工程虚拟仿真平台数据配置</div>

                                   <div className="space-y-1">
                                     <label className="text-[10px] text-zinc-400">数据源类型</label>
                                     <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select"
                                        value={dyn.sourceType || '工程虚拟仿真平台数据'}
                                        onChange={e => updateConfig((c:any) => ({...c, dynamicDataConfig: {...(c.dynamicDataConfig||{}), sourceType: e.target.value}}))} >
                                        <option value="工程虚拟仿真平台数据">工程虚拟仿真平台数据</option>
                                        <option value="行业云平台设备数据">行业云平台设备数据</option>
                                        <option value="本地测试数据">本地测试数据</option>
                                     </select>
                                   </div>
                                   
                                   <div className="bg-[#16181E] border border-[#2A2D39] rounded p-2 space-y-2">
                                     <div className="flex justify-between items-center border-b border-[#2A2D39] pb-1">
                                       <span className="text-[10px] text-zinc-400">平台名称</span>
                                       <span className="text-xs text-white">工程虚拟仿真平台</span>
                                     </div>
                                     <div className="flex justify-between items-center">
                                       <span className="text-[10px] text-zinc-400">当前工程</span>
                                       <span className="text-xs text-zinc-300">{virtualSimulationProject}</span>
                                     </div>
                                     <div className="flex justify-between items-center">
                                       <span className="text-[10px] text-zinc-400">当前场景</span>
                                       <span className="text-xs text-zinc-300">{virtualSimulationScene}</span>
                                     </div>
                                     <div className="flex justify-between items-center">
                                       <span className="text-[10px] text-zinc-400">连接状态</span>
                                       <span className={\`text-xs font-bold \${virtualSimulationConnectionStatus === '接收中' ? 'text-[#10A66A]' : virtualSimulationConnectionStatus === '已连接' ? 'text-[#10A66A]' : 'text-zinc-500'}\`}>{virtualSimulationConnectionStatus}</span>
                                     </div>
                                     <div className="flex justify-between items-center border-t border-[#2A2D39] pt-1">
                                       <span className="text-[10px] text-zinc-400">数据接收状态</span>
                                       <span className={\`text-xs font-bold \${virtualSimulationReceiveStatus === '接收中' ? 'text-[#10A66A]' : 'text-zinc-500'}\`}>{virtualSimulationReceiveStatus}</span>
                                     </div>
                                     <div className="flex justify-between items-center">
                                       <span className="text-[10px] text-zinc-400">最近更新时间</span>
                                       <span className="text-[10px] text-zinc-500 font-mono">{virtualDataReceiveRecords[0]?.time || '--:--:--'}</span>
                                     </div>
                                     <div className="flex justify-between items-center">
                                       <span className="text-[10px] text-zinc-400">刷新频率</span>
                                       <span className="text-[10px] text-zinc-500">2 秒</span>
                                     </div>
                                     <div className="grid grid-cols-2 gap-2 pt-2">
                                       <button className={\`py-1.5 border rounded text-xs transition-colors \${virtualSimulationConnectionStatus !== '未连接' ? 'bg-[#10A66A]/20 text-[#10A66A] border-[#10A66A]/30' : 'bg-[#2A2D39] hover:bg-[#3A3D49] border-[#3A3D49] text-white'}\`}
                                         onClick={() => {
                                           showToast("工程虚拟仿真平台连接成功。");
                                           setVirtualSimulationConnectionStatus("已连接");
                                           addLog("连接工程虚拟仿真平台成功");
                                         }}
                                       >{virtualSimulationConnectionStatus !== '未连接' ? '已连接平台' : '连接平台'}</button>
                                       <button className="py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white rounded text-xs transition-colors"
                                         onClick={() => { showToast("设备已刷新"); addLog("刷新工程虚拟仿真设备成功")}}>
                                         刷新设备
                                       </button>
                                     </div>
                                   </div>

                                   <div className="space-y-1">
                                     <label className="text-[10px] text-zinc-400">绑定仿真设备</label>
                                     <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-[11px] font-mono text-[#10A66A] outline-none custom-select"
                                        value={dyn.deviceId || VIRTUAL_DEVICES[0].id}
                                        onChange={e => {
                                          const dev = VIRTUAL_DEVICES.find(d => d.id === e.target.value);
                                          const firstProp = dev?.props[0].id;
                                          updateConfig((c:any) => ({...c, dynamicDataConfig: {...(c.dynamicDataConfig||{}), deviceId: dev?.id, deviceName: dev?.name, fields: [firstProp]}}));
                                          addLog(\`绑定仿真设备 \${e.target.value}\`);
                                        }}>
                                        {VIRTUAL_DEVICES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                     </select>
                                   </div>

                                   <div className="space-y-1">
                                     <label className="text-[10px] text-zinc-400">数据项绑定 (多选)</label>
                                     <div className="bg-[#16181E] border border-[#2A2D39] rounded p-2 max-h-32 overflow-y-auto space-y-1">
                                        {devMeta?.props.map(p => (
                                          <label key={p.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-[#2A2D39] rounded">
                                            <input type="checkbox" className="accent-[#10A66A]" 
                                                checked={selectedFields.includes(p.id)}
                                                onChange={e => {
                                                   let nextFields = [...selectedFields];
                                                   if (e.target.checked) nextFields.push(p.id);
                                                   else nextFields = nextFields.filter(f => f !== p.id);
                                                   updateConfig((c:any) => ({...c, dynamicDataConfig: {...(c.dynamicDataConfig||{}), fields: nextFields}}));
                                                }}
                                            />
                                            <span className="text-xs text-zinc-300 font-mono flex-1">{p.id}</span>
                                            <span className="text-[10px] text-zinc-500">{p.name} [{p.val}{p.unit !== '-' ? p.unit : ''}]</span>
                                          </label>
                                        ))}
                                     </div>
                                   </div>

                                   <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mt-4 mb-2">字段映射配置</div>
                                   
                                   {selectedFields.length > 0 ? selectedFields.map(fId => {
                                      const pData = devMeta?.props.find(p => p.id === fId);
                                      if (!pData) return null;
                                      return (
                                        <div key={fId} className="bg-[#16181E] border border-[#2A2D39] rounded p-2 mb-2">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-mono text-[#10A66A]">{fId}</span>
                                            <span className="text-[10px] text-zinc-500">{pData.name}</span>
                                          </div>
                                          {pData.type === '数值' ? (
                                              <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] text-zinc-500">正常范围</label>
                                                  <input type="text" defaultValue="20 - 30" className="w-full bg-[#1A1B23] border border-[#2A2D39] rounded px-1.5 py-1 text-[10px] text-[#10A66A] text-center font-mono outline-none" />
                                                </div>
                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] text-zinc-500">预警范围</label>
                                                  <input type="text" defaultValue="30 - 35" className="w-full bg-[#1A1B23] border border-[#2A2D39] rounded px-1.5 py-1 text-[10px] text-orange-400 text-center font-mono outline-none" />
                                                </div>
                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] text-zinc-500">异常范围</label>
                                                  <input type="text" defaultValue="> 35" className="w-full bg-[#1A1B23] border border-[#2A2D39] rounded px-1.5 py-1 text-[10px] text-red-500 text-center font-mono outline-none" />
                                                </div>
                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] text-zinc-500">小数位</label>
                                                  <input type="text" defaultValue="1" className="w-full bg-[#1A1B23] border border-[#2A2D39] rounded px-1.5 py-1 text-[10px] text-zinc-300 text-center outline-none" />
                                                </div>
                                              </div>
                                          ) : (
                                              <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] text-zinc-500">开启状态文本</label>
                                                  <input type="text" defaultValue="运行中" className="w-full bg-[#1A1B23] border border-[#2A2D39] rounded px-1.5 py-1 text-[10px] text-[#10A66A] text-center outline-none" />
                                                </div>
                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] text-zinc-500">关闭状态文本</label>
                                                  <input type="text" defaultValue="已关闭" className="w-full bg-[#1A1B23] border border-[#2A2D39] rounded px-1.5 py-1 text-[10px] text-zinc-500 text-center outline-none" />
                                                </div>
                                              </div>
                                          )}
                                        </div>
                                      );
                                   }) : <div className="text-[10px] text-zinc-500 text-center py-2">请先选择数据项</div>}

                                   <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mt-4 mb-2">展示样式配置</div>
                                   <div className="flex gap-2 mb-3">
                                     <label className="flex items-center gap-1 cursor-pointer">
                                       <input type="radio" name="displayStyle" defaultChecked className="accent-[#10A66A] cursor-pointer" />
                                       <span className="text-[11px] text-zinc-300">悬浮多行标签</span>
                                     </label>
                                     <label className="flex items-center gap-1 cursor-pointer">
                                       <input type="checkbox" defaultChecked className="accent-[#10A66A] cursor-pointer" />
                                       <span className="text-[11px] text-zinc-300">状态灯提示</span>
                                     </label>
                                   </div>

                                   <div className="pt-2 flex flex-col gap-2">
                                     <button className="py-1.5 w-full bg-[#1A1B23] hover:bg-[#2A2D39] border border-[#2A2D39] text-[#10A66A] rounded text-xs transition-colors mb-2"
                                        onClick={() => {
                                          updateConfig((c:any) => ({...c, applied: true}));
                                          showToast("展示样式及字段映射已应用");
                                          addLog(\`已绑定工程虚拟仿真平台数据项 \${selectedFields.join('、')}\`);
                                        }}>
                                        应用字段映射
                                     </button>

                                      <div className="flex gap-2">
                                        <button className={\`flex-1 py-1.5 rounded text-xs font-bold transition-colors \${virtualSimulationReceiveStatus === '接收中' ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' : 'bg-[#10A66A] hover:bg-[#0c8a58] text-white'}\`}
                                          onClick={() => {
                                              if(virtualSimulationReceiveStatus !== '接收中'){
                                                // Make sure device is selected
                                                if(!dyn.deviceId) {
                                                   updateConfig((c:any) => ({...c, applied: true, dynamicDataConfig: {...dyn, deviceId: devMeta?.id, fields: [devMeta?.props[0].id]}}));
                                                }
                                                updateConfig((c:any) => ({...c, applied: true, dataMode: '动态数据'}));
                                                handleStartVirtualData();
                                              }
                                          }}>
                                          开始接收
                                        </button>
                                        <button className={\`flex-1 py-1.5 rounded text-xs transition-colors \${virtualSimulationReceiveStatus === '接收中' ? 'bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}\`}
                                          onClick={() => virtualSimulationReceiveStatus === '接收中' && handlePauseVirtualData()}>
                                          暂停接收
                                        </button>
                                      </div>
                                   </div>

                                   {/* Data Preview */}
                                   <div className="mt-4 border-t border-[#2A2D39] pt-2">
                                      <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2">实时数据预览</div>
                                      
                                      <div className="space-y-2">
                                        {selectedFields.length > 0 ? selectedFields.map(fId => {
                                          const pData = devMeta?.props.find(p => p.id === fId);
                                          const val = virtualDeviceData[dyn.deviceId]?.[fId] ?? '-';
                                          return (
                                            <div key={fId} className="bg-[#16181E] border border-[#2A2D39] rounded p-2 text-[10px]">
                                               <div className="flex justify-between mb-1">
                                                  <span className="text-zinc-500">属性: {fId} ({pData?.name})</span>
                                                  <span className="text-[#10A66A] font-bold font-mono text-xs">
                                                    {pData?.type === '枚举' ? (val === 'on' ? '运行中' : '已关闭') : val} <span className="text-[9px] font-normal">{pData?.unit !== '-' ? pData?.unit : ''}</span>
                                                  </span>
                                               </div>
                                               <div className="flex justify-between items-center text-[9px]">
                                                  <span className="text-zinc-500">时间: {virtualSimulationReceiveStatus === '接收中' ? virtualDataReceiveRecords[0]?.time || '--:--:--' : '--:--:--'}</span>
                                                  <span className="text-[#10A66A]">正常</span>
                                               </div>
                                            </div>
                                          );
                                        }) : <div className="text-[10px] text-zinc-500 text-center py-2">暂无预览</div>}
                                      </div>
                                   </div>
                                 </div>
                                 );
                               })()}`;

const mIdx1 = txt.indexOf('{mode === "动态数据" && (() => {');
const mIdx2 = txt.indexOf('                             </div>\\n                              );\\n                            })()}');

if (mIdx1 !== -1 && mIdx2 !== -1) {
    txt = txt.substring(0, mIdx1) + replacementBlock + '\\n' + txt.substring(mIdx2);
    fs.writeFileSync(file, txt);
    console.log("Config UI replaced");
} else {
    console.log("Could not find config ui block");
}
