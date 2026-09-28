import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const tableBlock = `
                                   {/* Receive Records Table */}
                                   <div className="mt-6 border-t border-[#2A2D39] pt-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="text-[10px] text-zinc-500 uppercase font-bold">仿真数据接收记录</div>
                                        <button className="text-[9px] text-zinc-500 hover:text-zinc-300 transition-colors" onClick={() => setVirtualDataReceiveRecords([])}>清空记录</button>
                                      </div>
                                      <div className="bg-[#16181E] border border-[#2A2D39] rounded overflow-hidden">
                                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                          <table className="w-full text-left border-collapse">
                                            <thead className="bg-[#1A1B23] sticky top-0 z-10 border-b border-[#2A2D39]">
                                              <tr>
                                                <th className="text-[9px] font-medium text-zinc-400 p-2 whitespace-nowrap">时间</th>
                                                <th className="text-[9px] font-medium text-zinc-400 p-2 whitespace-nowrap">模型</th>
                                                <th className="text-[9px] font-medium text-zinc-400 p-2 whitespace-nowrap">仿真设备</th>
                                                <th className="text-[9px] font-medium text-zinc-400 p-2 whitespace-nowrap">字段</th>
                                                <th className="text-[9px] font-medium text-zinc-400 p-2 whitespace-nowrap">数值</th>
                                                <th className="text-[9px] font-medium text-zinc-400 p-2 whitespace-nowrap">状态</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#2A2D39]">
                                              {virtualDataReceiveRecords.length > 0 ? virtualDataReceiveRecords.map((r, i) => (
                                                <tr key={i} className="hover:bg-[#1A1B23] transition-colors">
                                                  <td className="text-[9px] text-zinc-500 p-2 font-mono whitespace-nowrap">{r.time}</td>
                                                  <td className="text-[9px] text-zinc-300 p-2 truncate max-w-[50px]" title={r.modelName}>{r.modelName}</td>
                                                  <td className="text-[9px] text-zinc-300 p-2 truncate max-w-[60px]" title={r.targetDeviceName}>{r.targetDeviceName}</td>
                                                  <td className="text-[9px] text-[#10A66A] p-2 font-mono">{r.field}</td>
                                                  <td className="text-[9px] text-white p-2 font-mono">{r.val}{r.unit}</td>
                                                  <td className="text-[9px] text-zinc-400 p-2">{r.type}</td>
                                                </tr>
                                              )) : (
                                                <tr>
                                                  <td colSpan={6} className="text-[10px] text-zinc-600 text-center py-4">暂无数据接收记录</td>
                                                </tr>
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                   </div>
`;

txt = txt.replace('                                      </div>\\n                                   </div>\\n                                 </div>\\n                                 );\\n                               })()}', 
'                                      </div>\\n                                   </div>\\n' + tableBlock + '\\n                                 </div>\\n                                 );\\n                               })()}');

fs.writeFileSync(file, txt);
console.log("Records table appended.");
