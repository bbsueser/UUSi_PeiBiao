const fs = require('fs');

let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const newCode = `               {rightTab === "pageConfig" && (
                 <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-400 mb-2 block">页面名称</label>
                      <input type="text" value={activeApp?.name || "未命名主页"} readOnly className="w-full bg-[#1E1E1E] border border-[#333] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#10A66A]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-zinc-400 mb-2 block">画布宽度 (px)</label>
                        <input type="number" readOnly value="1920" className="w-full bg-[#1E1E1E] border border-[#333] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#10A66A]" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-400 mb-2 block">画布高度 (px)</label>
                        <input type="number" readOnly value="1080" className="w-full bg-[#1E1E1E] border border-[#333] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#10A66A]" />
                      </div>
                    </div>
                 </div>
               )}

               {rightTab === "dataConfig" && (() => {
                  const compLayer = getLayer(selectedLayerId || "");
                  if (!compLayer) return (
                     <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3 border-2 border-dashed border-[#333] rounded-lg p-5">
                       <Box className="w-8 h-8 opacity-50" />
                       <span className="text-xs">请在中央画布点击组件以配置数据</span>
                     </div>
                  );
                  
                  const cConfig = componentConfigs[compLayer.id] || { dataMode: 'dynamic', staticValue: '', staticUnit: '', dataSource: 'cloud-001', deviceId: '', dataPoint: '' };
                  const isDynamic = cConfig.dataMode === 'dynamic';
                  const isLayerTitle = compLayer.type === "标题组件" || compLayer.id === "layer-title";

                  return (
                 <div className="space-y-4">
                    <div className="bg-[#1A1C1E] border border-[#333] p-3 rounded">
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>当前组件</span> <span className="text-white font-bold">{compLayer.name}</span></div>
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>组件类型</span> <span className="text-white">{compLayer.type}</span></div>
                       {!isLayerTitle && (
                          <>
                             <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>绑定平台</span> <span className="text-white">工程虚拟仿真平台</span></div>
                             <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>绑定设备</span> <span className="text-white">{deviceList.find(d => d.id === cConfig.deviceId)?.name || '-'}</span></div>
                             <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>绑定数据点</span> <span className="text-emerald-400 font-mono">{cConfig.dataPoint || '-'}</span></div>
                             <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>当前值</span> <span className="text-amber-400 font-mono">{isDynamic ? (realTimeData[cConfig.dataPoint] || "-") : (cConfig.staticValue || "-")} {isDynamic && cConfig.dataPoint && deviceList.find(d => d.id === cConfig.deviceId) ? deviceList.find(d => d.id === cConfig.deviceId)?.dataPoints.find((dp: any) => dp.key === cConfig.dataPoint)?.unit : ""}</span></div>
                             <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>刷新方式</span> <span className="text-emerald-400 px-1 py-0.5 bg-emerald-900/40 rounded text-[10px]">实时刷新</span></div>
                             <div className="text-xs text-zinc-400 flex justify-between items-center"><span className="font-bold text-amber-500">绑定状态</span> {cConfig.deviceId ? <span className="text-emerald-400">已绑定</span> : <span className="text-zinc-500">未绑定</span>}</div>
                          </>
                       )}
                    </div>

                    {!isLayerTitle && (
                       <div className="flex bg-[#1E1E1E] border border-[#333] p-1 rounded">
                          <button onClick={() => {
                             setComponentConfigs(prev => ({ ...prev, [compLayer.id]: { ...cConfig, dataMode: 'static' } }));
                             showToast("已切换静态数据配置表单");
                             addCloudLog("切换数据模式", compLayer.name, "静态数据", "手动配置", "-");
                          }} className={\`flex-1 py-1.5 text-xs font-bold rounded transition-colors \${!isDynamic ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-500 hover:text-white'}\`}>静态数据</button>
                          <button onClick={() => {
                             setComponentConfigs(prev => ({ ...prev, [compLayer.id]: { ...cConfig, dataMode: 'dynamic' } }));
                             showToast("已切换动态数据配置表单");
                             addCloudLog("切换数据模式", compLayer.name, "动态数据", "仿真设备数据", "-");
                          }} className={\`flex-1 py-1.5 text-xs font-bold rounded transition-colors \${isDynamic ? 'bg-amber-500/20 text-amber-500' : 'text-zinc-500 hover:text-white'}\`}>动态数据</button>
                       </div>
                    )}
                    
                    {!isLayerTitle && isDynamic && (
                       <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                          <div>
                            <label className="text-xs font-bold text-zinc-400 mb-1 block">选择仿真设备</label>
                            <select value={cConfig.deviceId || ''} onChange={e => setComponentConfigs(prev => ({ ...prev, [compLayer.id]: { ...cConfig, deviceId: e.target.value, dataPoint: '' } }))} className="w-full bg-[#1A1A1A] border border-[#444] rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500 cursor-pointer">
                               <option value="">- 请选择设备 -</option>
                               {deviceList.map(dev => <option key={dev.id} value={dev.id}>{dev.name}</option>)}
                            </select>
                          </div>
                          
                          {cConfig.deviceId && (
                            <div>
                              <label className="text-xs font-bold text-zinc-400 mb-1 block">选择数据点</label>
                              <select value={cConfig.dataPoint || ''} onChange={e => setComponentConfigs(prev => ({ ...prev, [compLayer.id]: { ...cConfig, dataPoint: e.target.value } }))} className="w-full bg-[#1A1A1A] border border-[#444] rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500 cursor-pointer">
                                 <option value="">- 请选择数据点 -</option>
                                 {deviceList.find(d => d.id === cConfig.deviceId)?.dataPoints.map((dp: any) => (
                                     <option key={dp.key} value={dp.key}>{dp.key}｜{dp.name}｜{dp.typeDesc} {(dp.unit ? \`｜\${dp.unit}\` : '')}</option>
                                 ))}
                              </select>
                            </div>
                          )}

                          <div className="flex flex-col gap-2 pt-4 border-t border-[#333]">
                             <button onClick={() => {
                                if (!cConfig.deviceId || !cConfig.dataPoint) { showToast("请先选择设备和数据点"); return; }
                                showToast("仿真设备数据绑定成功！");
                                const devObj = deviceList.find(d => d.id === cConfig.deviceId);
                                addCloudLog("绑定设备数据", compLayer.name, "动态数据", "工程平台", (devObj?.name || cConfig.deviceId) + " / " + cConfig.dataPoint);
                             }} className="py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/50 rounded shadow shadow-amber-500/10 text-xs font-bold transition-all transform hover:scale-[1.02]">绑定到组件</button>
                             <button onClick={() => {
                                setComponentConfigs(prev => ({ ...prev, [compLayer.id]: { ...cConfig, deviceId: '', dataPoint: '' } }));
                                showToast("已解除组件数据绑定");
                                addCloudLog("解除绑定", compLayer.name, "-", "-", "-");
                             }} className="py-2.5 bg-[#1A1A1A] hover:bg-[#2A2D2E] text-zinc-300 border border-[#333] rounded text-xs transition-colors">解除绑定</button>
                          </div>
                       </div>
                    )}
                    
                    {!isLayerTitle && !isDynamic && (
                       <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                          <div>
                            <label className="text-xs font-bold text-zinc-400 mb-1 block">静态值</label>
                            <input type="text" value={cConfig.staticValue} onChange={e => setComponentConfigs(prev => ({ ...prev, [compLayer.id]: { ...cConfig, staticValue: e.target.value } }))} className="w-full bg-[#1E1E1E] border border-[#333] rounded px-3 py-2 text-xs text-white outline-none focus:border-blue-500" placeholder="固定数值" />
                          </div>
                       </div>
                    )}
                 </div>
                 );
               })()}

               {rightTab === "dataSource" && (
                 <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="text-sm font-bold text-blue-400 border-b border-blue-500/30 pb-2 mb-4 flex items-center gap-2">工程虚拟仿真平台数据</div>
                    
                    <div className="bg-[#1A1A1A] p-3 rounded border border-[#333] space-y-2 text-xs">
                       <div className="flex justify-between items-center text-zinc-300 pb-2 border-b border-[#333]">
                         <span className="font-bold flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-400" />仿真平台状态</span>
                         <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded shadow">已连接</span>
                       </div>
                       <div className="flex justify-between items-center pt-1"><span className="text-zinc-500">当前项目：</span><span className="text-white">智能生产线虚拟仿真</span></div>
                       <div className="flex justify-between items-center"><span className="text-zinc-500">当前场景：</span><span className="text-white">生产线设备运行监控</span></div>
                       <div className="flex justify-between items-center"><span className="text-zinc-500">已连接仿真设备：</span><span className="text-white">6 台</span></div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                       <div className="text-xs text-zinc-400 font-bold mb-2">可绑定的仿真设备列表（支持实时数据下发）</div>
                       {deviceList.map(dev => (
                         <div key={dev.id} className="bg-[#1A1A1A] p-2 rounded border border-[#333] hover:border-[#10A66A]/50 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-center mb-1">
                               <div className="text-white font-mono text-xs">{dev.name}</div>
                               <div className="text-[10px] bg-[#10A66A]/20 text-[#10A66A] px-1.5 py-0.5 rounded">{dev.status}</div>
                            </div>
                            <div className="text-zinc-500 text-[10px] break-all">{dev.dataPoints.map(dp => dp.key).join(', ')}</div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

`;

const startStr = '               {rightTab === "pageConfig" && (';
const endStr = '               {rightTab === "historyQuery" && (';
const start = txt.indexOf(startStr);
const end = txt.indexOf(endStr);

if (start !== -1 && end !== -1) {
    txt = txt.substring(0, start) + newCode + txt.substring(end);
    fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
    console.log('Successfully structured right tabs');
} else {
    console.log('Failed', start, end);
}
