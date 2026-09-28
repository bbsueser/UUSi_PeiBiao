import fs from 'fs';

const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const regex = /<div className="text-\[10px\] text-zinc-500 uppercase font-bold border-b border-\[#2A2D39\] pt-2 pb-1 mb-2">仿真数据项绑定<\/div>[\s\S]*?(?=<label className="text-\[10px\] text-zinc-400">可选数据项<\/label>)/;

const newContent = `<div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pt-2 pb-1 mb-2">仿真数据项绑定</div>

                                     <div className="space-y-1">
                                       <div className="flex justify-between items-center bg-[#16181E] p-1.5 rounded border border-[#2A2D39] mb-2">
                                          <div className="flex items-center gap-2">
                                            <div className={\`w-1.5 h-1.5 rounded-full \${virtualSimulationReceiveStatus === '接收中' ? 'bg-[#10A66A] animate-pulse' : 'bg-zinc-600'}\`}></div>
                                            <span className="text-[10px] font-bold text-white">实时仿真数据预览</span>
                                          </div>
                                          <span className="text-[9px] text-[#10A66A] bg-[#10A66A]/10 px-1 rounded">工程虚拟仿真平台</span>
                                       </div>
                                       
                                       <label className="text-[10px] text-zinc-400">已选择数据项</label>
                                       <div className="space-y-2 mb-2">
                                          {selectedFields.length > 0 ? selectedFields.map((fId: string) => {
                                              const pData = devMeta?.props.find((p:any) => p.id === fId);
                                              if (!pData) return null;
                                              let currentVal = virtualDeviceData[dyn.deviceId]?.[fId] ?? '-';
                                              if (pData.type === '枚举') {
                                                  currentVal = currentVal === 'on' ? '运行中' : '已关闭';
                                              }
                                              return (
                                                  <div key={fId} className="bg-[#1A1B23] border border-[#2A2D39] rounded p-2">
                                                    <div className="flex justify-between items-center border-b border-[#2A2D39] pb-1 mb-1">
                                                      <span className="text-[10px] font-mono text-zinc-300 font-bold">{pData.name} ({fId})</span>
                                                    </div>
                                                    <div className="flex justify-between items-baseline mb-0.5">
                                                      <span className="text-[10px] text-zinc-400">实时数值</span>
                                                      <span className="text-sm text-[#10A66A] font-mono font-bold">{currentVal} <span className="text-[10px] text-zinc-500 font-normal">{pData.unit !== '-' ? pData.unit : ''}</span></span>
                                                    </div>
                                                  </div>
                                              )
                                          }) : <div className="text-[10px] text-zinc-600 bg-[#16181E] p-2 rounded text-center">暂未选择数据项</div>}
                                       </div>

                                       `;

if (txt.match(regex)) {
    txt = txt.replace(regex, newContent);
    console.log("Updated data item bindings preview");
}

fs.writeFileSync(file, txt);
