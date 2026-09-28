import fs from 'fs';

const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const regex = /<div className="space-y-3 pt-2">\s*<div className="text-\[10px\] text-zinc-500 uppercase font-bold border-b border-\[#2A2D39\] pb-1 mb-2">工程虚拟仿真平台数据配置<\/div>[\s\S]*?(?=<div className="text-\[10px\] text-zinc-500 uppercase font-bold border-b border-\[#2A2D39\] pb-1 mt-4 mb-2">字段映射配置<\/div>)/;

const newBlock = `<div className="space-y-3 pt-2">
                                     <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mb-2">工程虚拟仿真平台数据源</div>

                                     <div className="space-y-1 mt-2">
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
                                         <span className="text-[10px] text-zinc-400">数据来源</span>
                                         <span className="text-[11px] text-[#10A66A] font-bold">工程虚拟仿真平台数据</span>
                                       </div>
                                       <div className="flex justify-between items-center border-b border-[#2A2D39] pb-1">
                                         <span className="text-[10px] text-zinc-400">平台名称</span>
                                         <span className="text-xs text-white">工程虚拟仿真平台</span>
                                       </div>
                                       <div className="flex justify-between items-center border-b border-[#2A2D39] pb-1">
                                         <span className="text-[10px] text-zinc-400">当前仿真工程</span>
                                         <span className="text-xs text-zinc-300 truncate max-w-[150px]" title={virtualSimulationProject}>{virtualSimulationProject}</span>
                                       </div>
                                       <div className="flex justify-between items-center">
                                         <span className="text-[10px] text-zinc-400">当前仿真场景</span>
                                         <span className="text-xs text-zinc-300">{virtualSimulationScene}</span>
                                       </div>
                                       <div className="flex justify-between items-center">
                                         <span className="text-[10px] text-zinc-400">连接状态</span>
                                         <span className={\`text-xs font-bold \${virtualSimulationConnectionStatus === '接收中' || virtualSimulationConnectionStatus === '已连接' ? 'text-[#10A66A]' : 'text-zinc-500'}\`}>{virtualSimulationConnectionStatus}</span>
                                       </div>
                                       <div className="flex justify-between items-center border-t border-[#2A2D39] pt-1">
                                         <span className="text-[10px] text-zinc-400">数据接收状态</span>
                                         <span className={\`text-xs font-bold \${virtualSimulationReceiveStatus === '接收中' ? 'text-[#10A66A]' : virtualSimulationReceiveStatus === '已暂停' ? 'text-zinc-500' : 'text-zinc-500'}\`}>{virtualSimulationReceiveStatus === '接收中' ? '接收中' : virtualSimulationReceiveStatus === '已暂停' ? '已暂停' : '未接收'}</span>
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
                                         <button className={\`py-1.5 border rounded text-xs transition-colors \${virtualSimulationConnectionStatus !== '未连接' ? 'bg-[#10A66A]/20 text-[#10A66A] border-[#10A66A]/30 font-bold' : 'bg-[#2A2D39] hover:bg-[#3A3D49] border-[#3A3D49] text-white'}\`}
                                           onClick={() => {
                                             showToast("工程虚拟仿真平台连接成功。");
                                             setVirtualSimulationConnectionStatus("已连接");
                                             addLog("连接工程虚拟仿真平台成功");
                                           }}
                                         >{virtualSimulationConnectionStatus !== '未连接' ? '已连接' : '连接工程虚拟仿真平台'}</button>
                                         <button className="py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white rounded text-xs transition-colors"
                                           onClick={() => { showToast("已刷新工程虚拟仿真平台设备列表。"); addLog("刷新工程虚拟仿真平台设备列表成功")}}>
                                           刷新仿真设备
                                         </button>
                                         <button className={\`py-1.5 border rounded text-[10px] transition-colors \${virtualSimulationReceiveStatus === '接收中' ? 'bg-[#10A66A] text-white border-[#10A66A]' : 'bg-[#2A2D39] text-zinc-300 border-[#3A3D49] hover:bg-[#3A3D49]'}\`}
                                           onClick={() => {
                                             showToast("开始接收工程虚拟仿真平台数据。");
                                             setVirtualSimulationReceiveStatus("接收中");
                                             setVirtualSimulationConnectionStatus("已连接");
                                             addLog("开始接收工程虚拟仿真平台数据");
                                           }}>
                                           开始接收
                                         </button>
                                         <button className={\`py-1.5 border rounded text-[10px] transition-colors \${virtualSimulationReceiveStatus === '已暂停' ? 'bg-zinc-700 text-white border-zinc-600' : 'bg-[#2A2D39] text-zinc-300 border-[#3A3D49] hover:bg-[#3A3D49]'}\`}
                                           onClick={() => {
                                             showToast("已暂停接收工程虚拟仿真平台数据。");
                                             setVirtualSimulationReceiveStatus("已暂停");
                                             addLog("暂停接收工程虚拟仿真平台数据");
                                           }}>
                                           暂停接收
                                         </button>
                                       </div>
                                     </div>

                                     <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pt-2 pb-1 mb-2">仿真设备绑定</div>

                                     <div className="bg-[#16181E] border border-[#2A2D39] rounded p-2 mb-2">
                                        <div className="flex justify-between items-center mb-1">
                                           <span className="text-[10px] text-zinc-400">已绑定仿真设备</span>
                                           <span className="text-[11px] text-[#10A66A] font-bold font-mono">{devMeta?.name} {dyn.deviceId}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                           <span className="text-[10px] text-zinc-400">设备来源</span>
                                           <span className="text-[10px] text-zinc-300">工程虚拟仿真平台</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                           <span className="text-[10px] text-zinc-400">所属工程</span>
                                           <span className="text-[10px] text-zinc-300 truncate max-w-[120px]">{virtualSimulationProject}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                           <span className="text-[10px] text-zinc-400">设备状态</span>
                                           <span className="text-[10px] text-[#10A66A]">在线</span>
                                        </div>
                                        <div className="flex justify-between items-start mt-1 pt-1 border-t border-[#2A2D39]">
                                           <span className="text-[10px] text-zinc-400">最新数据</span>
                                           <span className="text-[10px] text-zinc-300 max-w-[120px] text-right truncate">
                                             {devMeta?.props.filter(p => selectedFields.includes(p.id)).map(p => \`\${p.name} \${virtualDeviceData[dyn.deviceId]?.[p.id] ?? '-'}\${p.unit !== '-' ? p.unit : ''}\`).join('，') || '暂无'}
                                           </span>
                                        </div>
                                     </div>

                                     <div className="space-y-1">
                                       <label className="text-[10px] text-zinc-400">切换当前设备</label>
                                       <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-[11px] font-mono text-[#10A66A] outline-none custom-select"
                                          value={dyn.deviceId || VIRTUAL_DEVICES[0].id}
                                          onChange={e => {
                                            const dev = VIRTUAL_DEVICES.find(d => d.id === e.target.value);
                                            const firstProp = dev?.props[0].id;
                                            updateConfig((c:any) => ({...c, dynamicDataConfig: {...(c.dynamicDataConfig||{}), deviceId: dev?.id, deviceName: dev?.name, fields: [firstProp]}}));
                                            addLog(\`绑定仿真设备 \${dev?.name} \${dev?.id}\`);
                                          }}>
                                          {VIRTUAL_DEVICES.map(d => <option key={d.id} value={d.id}>{d.name} {d.id}</option>)}
                                       </select>
                                     </div>

                                     <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pt-2 pb-1 mb-2">仿真数据项绑定</div>

                                     <div className="space-y-1">
                                       <label className="text-[10px] text-zinc-400">已选择数据项</label>
                                       <div className="space-y-2 mb-2">
                                          {selectedFields.length > 0 ? selectedFields.map(fId => {
                                              const pData = devMeta?.props.find(p => p.id === fId);
                                              if (!pData) return null;
                                              let currentVal = virtualDeviceData[dyn.deviceId]?.[fId] ?? '-';
                                              if (pData.type === '枚举') {
                                                  currentVal = currentVal === 'on' ? '运行中' : '已关闭';
                                              }
                                              return (
                                                  <div key={fId} className="bg-[#16181E] border border-[#2A2D39] rounded p-2">
                                                    <div className="flex justify-between items-center border-b border-[#2A2D39] pb-1 mb-1">
                                                      <span className="text-xs font-mono text-[#10A66A] font-bold">{fId}</span>
                                                      <span className="text-[9px] text-[#10A66A] bg-[#10A66A]/10 px-1 rounded">工程虚拟仿真平台</span>
                                                    </div>
                                                    <div className="flex justify-between items-center mb-0.5">
                                                      <span className="text-[10px] text-zinc-400">显示名称</span>
                                                      <span className="text-[10px] text-white">{pData.name}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center mb-0.5">
                                                      <span className="text-[10px] text-zinc-400">当前值</span>
                                                      <span className="text-[10px] text-white font-mono">{currentVal}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                      <span className="text-[10px] text-zinc-400">单位</span>
                                                      <span className="text-[10px] text-white">{pData.unit}</span>
                                                    </div>
                                                  </div>
                                              )
                                          }) : <div className="text-[10px] text-zinc-600 bg-[#16181E] p-2 rounded text-center">暂未选择数据项</div>}
                                       </div>

                                       <label className="text-[10px] text-zinc-400">可选数据项</label>
                                       <div className="bg-[#16181E] border border-[#2A2D39] rounded p-2 max-h-32 overflow-y-auto space-y-1">
                                          {devMeta?.props.map(p => (
                                            <label key={p.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-[#2A2D39] rounded transition-colors group">
                                              <input type="checkbox" className="accent-[#10A66A]" 
                                                  checked={selectedFields.includes(p.id)}
                                                  onChange={e => {
                                                     let nextFields = [...selectedFields];
                                                     if (e.target.checked) nextFields.push(p.id);
                                                     else nextFields = nextFields.filter(f => f !== p.id);
                                                     updateConfig((c:any) => ({...c, dynamicDataConfig: {...(c.dynamicDataConfig||{}), fields: nextFields}}));
                                                     addLog(\`绑定仿真数据项：\${nextFields.join('、')}\`);
                                                  }}
                                              />
                                              <span className="text-xs text-zinc-300 font-mono flex-1 group-hover:text-white transition-colors">{p.id}</span>
                                              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors">{p.name} {p.type === '数值' ? \`[\${p.val}\${p.unit !== '-' ? p.unit : ''}]\` : \`[\${p.val === 'on' ? '运行中' : '已关闭'}]\`}</span>
                                            </label>
                                          ))}
                                       </div>
                                     </div>
                                     `;

if (txt.match(regex)) {
    txt = txt.replace(regex, newBlock);
    fs.writeFileSync(file, txt);
    console.log("Panel layout replaced successfully");
} else {
    console.log("Could not find regex match");
}
