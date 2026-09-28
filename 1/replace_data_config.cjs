const fs = require('fs');

let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const newRenderStr = `               {rightTab === "dataConfig" && (() => {
                  const compLayer = getLayer(selectedLayerId || "");
                  if (!compLayer) return (
                     <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3 border-2 border-dashed border-[#333] rounded-lg p-5">
                       <Box className="w-8 h-8 opacity-50" />
                       <span className="text-xs">请在中央画布点击组件以配置数据</span>
                     </div>
                  );
                  
                  const cConfig = componentConfigs[compLayer.id] || { dataMode: 'dynamic', staticValue: '', staticUnit: '', dataSource: 'cloud-001', deviceId: '', dataPoint: '' };
                  const isDynamic = cConfig.dataMode === 'dynamic';

                  return (
                 <div className="space-y-4">
                    <div className="bg-[#1A1C1E] border border-[#333] p-3 rounded">
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>当前组件</span> <span className="text-white font-bold">{compLayer.name}</span></div>
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>组件类型</span> <span className="text-white">{compLayer.type}</span></div>
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>绑定平台</span> <span className="text-white">工程虚拟仿真平台</span></div>
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>绑定设备</span> <span className="text-white">{deviceList.find(d => d.id === cConfig.deviceId)?.name || '-'}</span></div>
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>绑定数据点</span> <span className="text-emerald-400 font-mono">{cConfig.dataPoint || '-'}</span></div>
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>当前值</span> <span className="text-amber-400 font-mono">{isDynamic ? (realTimeData[cConfig.dataPoint] || "-") : (cConfig.staticValue || "-")} {isDynamic && cConfig.dataPoint && deviceList.find(d => d.id === cConfig.deviceId) ? deviceList.find(d => d.id === cConfig.deviceId)?.dataPoints.find((dp: any) => dp.key === cConfig.dataPoint)?.unit : ""}</span></div>
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>刷新方式</span> <span className="text-white">实时刷新</span></div>
                       <div className="text-xs text-zinc-400 flex justify-between items-center"><span>绑定状态</span> {cConfig.deviceId ? <span className="text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 rounded">已绑定</span> : <span className="text-zinc-500">未绑定</span>}</div>
                    </div>
                    
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                       <div>
                         <label className="text-xs font-bold text-zinc-400 mb-1 block">选择仿真设备</label>
                         <select value={cConfig.deviceId || ''} onChange={e => setComponentConfigs(prev => ({ ...prev, [compLayer.id]: { ...cConfig, deviceId: e.target.value, dataPoint: '' } }))} className="w-full bg-[#1E1E1E] border border-[#333] rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500">
                            <option value="">- 请选择设备 -</option>
                            {deviceList.map(dev => <option key={dev.id} value={dev.id}>{dev.name}</option>)}
                         </select>
                       </div>
                       
                       {cConfig.deviceId && (
                         <div>
                           <label className="text-xs font-bold text-zinc-400 mb-1 block">选择数据点</label>
                           <select value={cConfig.dataPoint || ''} onChange={e => setComponentConfigs(prev => ({ ...prev, [compLayer.id]: { ...cConfig, dataPoint: e.target.value } }))} className="w-full bg-[#1E1E1E] border border-[#333] rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500">
                              <option value="">- 请选择数据点 -</option>
                              {deviceList.find(d => d.id === cConfig.deviceId)?.dataPoints.map((dp: any) => (
                                  <option key={dp.key} value={dp.key}>{dp.key}｜{dp.name}｜{dp.typeDesc} {(dp.unit ? \`｜\${dp.unit}\` : '')}</option>
                              ))}
                           </select>
                         </div>
                       )}

                       <div className="flex flex-col gap-2 pt-4">
                          <button onClick={() => {
                             if (!cConfig.deviceId || !cConfig.dataPoint) { showToast("请先选择设备和数据点"); return; }
                             showToast("仿真设备数据已绑定");
                             const devObj = deviceList.find(d => d.id === cConfig.deviceId);
                             addCloudLog("绑定设备数据", compLayer.name, "动态数据", "工程虚拟仿真平台", (devObj?.name || cConfig.deviceId) + " / " + cConfig.dataPoint);
                          }} className="py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-500 border border-amber-600/50 rounded text-xs font-bold transition-colors">绑定到组件</button>
                          <button onClick={() => {
                             setComponentConfigs(prev => ({ ...prev, [compLayer.id]: { ...cConfig, deviceId: '', dataPoint: '' } }));
                             showToast("已解除绑定");
                          }} className="py-2 bg-[#1E1E1E] hover:bg-[#2A2D2E] text-zinc-300 border border-[#333] rounded text-xs transition-colors">解除绑定</button>
                       </div>
                    </div>
                 </div>
                 );
               })}`;

const start = txt.indexOf('               {rightTab === "dataConfig" && (() => {');
const end = txt.indexOf('               {rightTab === "dataSource" && (', start);

if (start !== -1 && end !== -1) {
    txt = txt.substring(0, start) + newRenderStr + '\n' + txt.substring(end);
    fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
    console.log('replaced data config block perfectly');
}
