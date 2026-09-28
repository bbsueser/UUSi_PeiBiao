const fs = require('fs');

let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const oldLogicStr = `                                     if (realTimeData && cloudConnected) {
                                         if (config.dataPoint === "temperature") displayValue = <span className="text-blue-400">{realTimeData.temperature} ℃</span>;
                                         else if (config.dataPoint === "humidity") displayValue = <span className="text-cyan-400">{realTimeData.humidity} %</span>;
                                         else if (config.dataPoint === "relayStatus") displayValue = <span className={realTimeData.relayStatus ? "text-emerald-400" : "text-zinc-500"}>{realTimeData.relayStatus ? "继电器：开启" : "继电器：关闭"}</span>;
                                         else if (config.dataPoint === "fanSpeed") displayValue = <span className="text-blue-400">风扇：{realTimeData.fanSpeed}</span>;
                                         else if (config.dataPoint === "gatewayOnline") displayValue = <span className={realTimeData.gatewayOnline ? "text-emerald-400" : "text-red-500"}>{realTimeData.gatewayOnline ? "网关：在线" : "网关：离线"}</span>;
                                         else displayValue = <span className="text-emerald-400">{realTimeData[config.dataPoint]}</span>;
                                         
                                         if (realTimeRunning && config.dataPoint?.includes('relay') && realTimeData.relayStatus) {
                                             extraStyles = 'border-emerald-500/50 bg-emerald-900/20';
                                         }
                                     }`;

const newLogicStr = `                                     if (realTimeData && cloudConnected) {
                                         const val = realTimeData[config.dataPoint];
                                         const dev = deviceList.find(d => d.id === config.deviceId);
                                         const dpInfo = dev ? dev.dataPoints.find(dp => dp.key === config.dataPoint) : null;
                                         const unit = dpInfo ? (dpInfo.unit || '') : '';
                                         
                                         if (['running','alarm','lightStatus','action', 'status'].includes(config.dataPoint)) {
                                             const isNormal = val === "正常" || val === "运行中" || val === "绿色常亮" || val === "开启";
                                             displayValue = <span className={isNormal ? "text-emerald-400" : "text-amber-500"}>{val}</span>;
                                             if (realTimeRunning && !isNormal) extraStyles = 'border-amber-500/50 bg-amber-900/20';
                                         } else if (config.dataPoint === 'openRate' || config.dataPoint === 'load') {
                                             displayValue = <span className="text-cyan-400">{val} {unit}</span>;
                                         } else {
                                             displayValue = <span className="text-blue-400">{val} {unit}</span>;
                                         }
                                     }`;

txt = txt.replace(oldLogicStr, newLogicStr);

// I should also render the chart, table, image, title component. Currently there are stub renders for 'bg' and 'header' etc.
// Let's add them. 
const oldStubs = `                              {/* Content stub representing the component */}
                              {l.id.includes('bg') && <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-[#0E121E]"></div>}
                              {l.id.includes('header') && <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDE5MjAsMCAxOTIwLDgwIDExMDAsODAgMTA1MCw0MCA4NzAsNDAgODIwLDgwIDAsODAiIGZpbGw9IiMxMUE2NkEvMTAiIHN0cm9rZT0iIzExQTY2QS8zMCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')]"></div>}
                              {l.id.includes('grid') && <div className="absolute inset-0 bg-[linear-gradient(to_right,#10A66A20_1px,transparent_1px),linear-gradient(to_bottom,#10A66A20_1px,transparent_1px)] bg-[size:100px_100px] opacity-30"></div>}`;

const newStubsStr = `                              {/* Content stub representing the component */}
                              {l.id === 'layer-title' && <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold tracking-widest bg-black/40 backdrop-blur border-b border-[#333]">{l.name} {cloudConnected ? " - 实时更新中" : ""}</div>}
                              {l.id === 'layer-topo' && <div className="w-full h-full border border-dashed border-[#555] bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden"><div className="absolute inset-0 bg-[linear-gradient(to_right,#10A66A20_1px,transparent_1px),linear-gradient(to_bottom,#10A66A20_1px,transparent_1px)] bg-[size:20px_20px]"></div><span className="text-zinc-500 font-mono text-xl z-10 flex flex-col items-center gap-2"><Map className="w-12 h-12"/> 设备拓扑结构图</span></div>}
                              {l.id === 'layer-table' && (
                                <div className="w-full h-full bg-[#1E1E1E]/90 border border-[#333] flex flex-col pt-2 shadow-lg rounded">
                                  <div className="px-3 pb-2 border-b border-[#333] text-sm font-bold text-white flex justify-between items-center">
                                    <span>仿真设备状态表</span>
                                    <span className="text-emerald-400 text-xs px-2 py-0.5 bg-emerald-500/10 rounded">实时更新</span>
                                  </div>
                                  <table className="w-full text-left text-xs bg-[#1E1E1E]">
                                    <thead className="bg-[#2A2D2B]">
                                      <tr><th className="p-2">设备名称</th><th className="p-2">状态</th><th className="p-2">更新时长</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#333]">
                                      {deviceList.map(d => (
                                        <tr key={d.id} className="text-zinc-300">
                                          <td className="p-2 truncate max-w-[120px]">{d.name}</td>
                                          <td className="p-2"><span className="text-emerald-400 px-1 py-0.5 bg-emerald-900/20 rounded">{d.status}</span></td>
                                          <td className="p-2 text-zinc-500">{realTimeRunning ? '刚刚' : '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                              {l.id === 'layer-chart1' && (
                                <div className="w-full h-full bg-[#1A1A1A] border border-[#333] p-3 rounded shadow-lg flex flex-col relative overflow-hidden">
                                   <div className="absolute top-2 right-2 flex items-center gap-2">
                                      <span className="text-[10px] text-zinc-400">仿真设备实时趋势</span>
                                      <span className="bg-blue-500/20 text-blue-400 px-2 rounded-sm text-[10px] font-mono">实时</span>
                                   </div>
                                   <div className="flex-1 w-full border-t border-[#333] mt-6 flex items-end justify-between px-2 pt-2 gap-1">
                                      {[...Array(20)].map((_, i) => (
                                          <div key={i} className="flex-1 bg-indigo-500/30 border border-indigo-500/50 transition-all duration-300" style={{ height: \`\${Math.max(20, Math.random() * 100)}%\`}}></div>
                                      ))}
                                   </div>
                                </div>
                              )}
                              {l.id === 'layer-alarm' && (
                                <div className="w-full h-full bg-[#1A1A1A] border border-red-500/30 p-3 flex flex-col gap-2 rounded shadow-lg">
                                  <div className="text-red-400 font-bold text-sm bg-red-900/20 p-2 rounded shadow flex items-center justify-between">
                                     <span>最近设备告警</span> 
                                     <span className="text-xs bg-red-500 text-white px-2 rounded">未确认 (0)</span>
                                  </div>
                                  <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-sm border-2 border-dashed border-[#333] bg-[#111]">
                                    无未处理的告警
                                  </div>
                                </div>
                              )}`;

txt = txt.replace(oldStubs, newStubsStr);

fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
console.log('done!');
