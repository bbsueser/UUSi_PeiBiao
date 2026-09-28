import fs from 'fs';

const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Bottom Canvas Overlays \(Logs and Objects List\) \*\/\}\s*<div className="absolute bottom-4 left-4 right-4 z-10 flex gap-4 h-48">[\s\S]*?(?=\{\/\* Right Property Panel \*\/)/;

const newContent = `{/* Bottom Canvas Overlays (Logs and Objects List) */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-4 h-48">
                   
                   {/* Object List */}
                   <div className="w-1/3 bg-[#1A1B23]/90 backdrop-blur border border-[#2A2D39] rounded-lg flex flex-col overflow-hidden shadow-2xl">
                     <div className="bg-[#16181E] px-3 py-2 border-b border-[#2A2D39] flex items-center justify-between text-xs">
                        <span className="font-bold text-white">场景对象</span>
                        <div className="flex gap-2">
                           <button className="text-zinc-400 hover:text-white"><Filter className="w-3.5 h-3.5" /></button>
                           <button className="text-zinc-400 hover:text-white"><Search className="w-3.5 h-3.5" /></button>
                        </div>
                     </div>
                     <div className="flex-1 overflow-x-auto overflow-y-auto">
                        <table className="w-full text-left text-[9px] border-collapse border-[#2A2D39] min-w-[500px]">
                          <thead className="bg-[#16181E]/50 sticky top-0 border-b border-[#2A2D39]">
                            <tr className="text-zinc-500">
                              <th className="font-medium p-2">对象名称</th>
                              <th className="font-medium p-2">对象类型</th>
                              <th className="font-medium p-2">绑定平台</th>
                              <th className="font-medium p-2">绑定设备</th>
                              <th className="font-medium p-2">绑定数据项</th>
                              <th className="font-medium p-2">当前值</th>
                              <th className="font-medium p-2">数据状态</th>
                              <th className="font-medium p-2 text-right">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2A2D39]">
                            {threeDSceneObjects.map(obj => {
                              const conf = sceneObjectDataConfig[obj.id];
                              const isVirtual = conf?.dataMode === '动态数据' && conf?.dynamicDataConfig?.sourceType === '工程虚拟仿真平台数据';
                              const bindDevice = isVirtual ? conf?.dynamicDataConfig?.deviceId : "-";
                              const bindPlatform = isVirtual ? "工程虚拟仿真平台" : "-";
                              const fields = isVirtual ? (conf?.dynamicDataConfig?.fields || []) : [];
                              const dataMode = conf?.dataMode || "-";
                              const receives = isVirtual ? virtualSimulationReceiveStatus : '-';
                              
                              let currentValues = '-';
                              if (isVirtual && fields.length > 0) {
                                  currentValues = fields.map((f: string) => {
                                      const pData = VIRTUAL_DEVICES.find(d => d.id === bindDevice)?.props.find((p:any) => p.id === f);
                                      if (!pData) return '-';
                                      let val = virtualDeviceData[bindDevice]?.[f] ?? '-';
                                      if (pData.type === '枚举') val = val === 'on' ? '运行中' : '已关闭';
                                      return \`\${val}\${pData.unit! !== '-' ? pData.unit : ''}\`;
                                  }).join(' / ');
                              }

                              return (
                              <tr 
                                key={obj.id} 
                                className={\`text-zinc-300 hover:bg-[#2A2D39]/50 cursor-pointer \${selectedSceneObject?.id === obj.id ? 'bg-[#10A66A]/10 text-white' : ''}\`}
                                onClick={() => setSelectedSceneObject(obj)}
                              >
                                <td className="p-2 font-bold truncate max-w-[80px]" title={obj.name}>{obj.name}</td>
                                <td className="p-2 text-zinc-500">{obj.category || obj.type}</td>
                                <td className="p-2 text-zinc-400">{bindPlatform}</td>
                                <td className="p-2 font-mono text-[#10A66A]">{bindDevice}</td>
                                <td className="p-2 text-[#10A66A]">{fields.join('、') || '-'}</td>
                                <td className="p-2 font-mono text-zinc-300">{currentValues}</td>
                                <td className="p-2">
                                   <span className={\`px-1 rounded text-[9px] \${receives === '接收中' ? 'bg-[#10A66A]/10 text-[#10A66A]' : 'bg-[#2A2D39] text-zinc-400'}\`}>
                                      {receives !== '-' ? receives : dataMode === '动态数据' ? '接收中' : '静态'}
                                   </span>
                                </td>
                                <td className="p-2 text-right"><button className="text-[#10A66A] hover:text-white" onClick={(e) => { e.stopPropagation(); setSelectedSceneObject(obj); showToast("正在定位"); }}>定位</button></td>
                              </tr>
                            )})}
                            {threeDSceneObjects.length === 0 && (
                               <tr><td colSpan={8} className="p-4 text-center text-zinc-600">暂无场景对象</td></tr>
                            )}
                          </tbody>
                        </table>
                     </div>
                   </div>

                   {/* Data Receive Records */}
                   <div className="w-1/3 bg-[#1A1B23]/90 backdrop-blur border border-[#2A2D39] rounded-lg flex flex-col overflow-hidden shadow-2xl">
                     <div className="bg-[#16181E] px-3 py-2 border-b border-[#2A2D39] flex items-center justify-between text-xs">
                        <span className="font-bold text-white">工程虚拟仿真数据接收记录</span>
                        <div className="flex gap-2">
                          <button className="text-zinc-400 hover:text-white text-[10px]" onClick={() => setDataReceiveRecords([])}>清空</button>
                        </div>
                     </div>
                     <div className="flex-1 overflow-x-auto overflow-y-auto">
                        <table className="w-full text-left text-[9px] border-collapse min-w-[500px]">
                          <thead className="bg-[#16181E]/50 sticky top-0 border-b border-[#2A2D39]">
                            <tr className="text-zinc-500">
                              <th className="font-medium p-1.5 font-mono whitespace-nowrap">接收时间</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">模型名称</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">仿真设备</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">设备编号</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">数据项</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">数据值</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">单位</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">数据来源</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">接收状态</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2A2D39]">
                            {virtualDataReceiveRecords.map((rec, i) => (
                              <tr key={i} className="text-zinc-300 hover:bg-[#2A2D39]/50">
                                <td className="p-1.5 font-mono text-zinc-500 whitespace-nowrap">{rec.time}</td>
                                <td className="p-1.5 truncate max-w-[80px]" title={rec.modelName}>{rec.modelName}</td>
                                <td className="p-1.5 truncate max-w-[80px]">{rec.targetDeviceName}</td>
                                <td className="p-1.5 text-zinc-400 font-mono">{rec.deviceId}</td>
                                <td className="p-1.5 font-mono text-[#10A66A]">{rec.field}</td>
                                <td className="p-1.5 font-mono text-white">{rec.val}</td>
                                <td className="p-1.5 text-zinc-500">{rec.unit}</td>
                                <td className="p-1.5 text-zinc-400">{rec.source}</td>
                                <td className="p-1.5 text-[#10A66A] break-keep whitespace-nowrap bg-[#10A66A]/10 px-1 rounded-sm border border-[#10A66A]/20">{rec.type}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                     </div>
                   </div>

                   {/* Operation Logs & Config Records */}
                   <div className="w-1/3 bg-[#1A1B23]/90 backdrop-blur border border-[#2A2D39] rounded-lg flex flex-col overflow-hidden shadow-2xl">
                     <div className="bg-[#16181E] px-3 py-2 border-b border-[#2A2D39] flex items-center justify-between text-xs">
                        <div className="flex gap-4">
                            <button className="font-bold text-white border-b-2 border-[#10A66A] pb-1.5 -mb-2">配置记录</button>
                            <button className="font-bold text-zinc-500 hover:text-zinc-300 pb-1.5 -mb-2">操作记录</button>
                        </div>
                     </div>
                     <div className="flex-1 overflow-x-auto overflow-y-auto">
                        <table className="w-full text-left text-[9px] border-collapse min-w-[300px]">
                          <thead className="bg-[#16181E]/50 sticky top-0 border-b border-[#2A2D39]">
                            <tr className="text-zinc-500">
                              <th className="font-medium p-1.5 font-mono">时间</th>
                              <th className="font-medium p-1.5">模型</th>
                              <th className="font-medium p-1.5">配置类型</th>
                              <th className="font-medium p-1.5">内容</th>
                              <th className="font-medium p-1.5">结果</th>
                              <th className="font-medium p-1.5">操作人</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2A2D39]">
                            {propertyConfigRecords.map((rec, i) => (
                              <tr key={i} className="text-zinc-300 hover:bg-[#2A2D39]/50 whitespace-nowrap">
                                <td className="p-1.5 font-mono text-zinc-500">{rec.time}</td>
                                <td className="p-1.5">{rec.modelName}</td>
                                <td className="p-1.5 text-zinc-400">{rec.type}</td>
                                <td className="p-1.5 text-zinc-400 max-w-[120px] truncate" title={rec.content}>{rec.content}</td>
                                <td className="p-1.5 font-bold text-[#10A66A]">{rec.result}</td>
                                <td className="p-1.5 text-zinc-500">{rec.user}</td>
                              </tr>
                            ))}
                            {propertyConfigRecords.length === 0 && (
                               <tr><td colSpan={6} className="p-4 text-center text-zinc-600">暂无配置记录</td></tr>
                            )}
                          </tbody>
                        </table>
                     </div>
                   </div>

                </div>
`;

if (txt.match(regex)) {
   txt = txt.replace(regex, newContent);
   console.log('Restored bottom layout successfully');
} else {
   console.log('Failed to match bottom layout');
}

fs.writeFileSync(file, txt);

