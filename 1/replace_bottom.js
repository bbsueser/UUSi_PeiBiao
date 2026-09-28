import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Replace standard scene list with wider version + new columns
const newSceneObjBlock = `                   {/* Object List */}
                   <div className="w-1/3 bg-[#1A1B23]/90 backdrop-blur border border-[#2A2D39] rounded-lg flex flex-col overflow-hidden shadow-2xl">
                     <div className="bg-[#16181E] px-3 py-2 border-b border-[#2A2D39] flex items-center justify-between text-xs">
                        <span className="font-bold text-white">场景对象</span>
                        <span className="text-zinc-500 text-[10px]">{threeDSceneObjects.length} 个对象</span>
                     </div>
                     <div className="flex-1 overflow-x-auto overflow-y-auto">
                        <table className="w-full text-left text-[10px] border-collapse min-w-[500px]">
                          <thead className="bg-[#16181E]/50 sticky top-0 border-b border-[#2A2D39]">
                            <tr className="text-zinc-500 whitespace-nowrap">
                              <th className="font-medium p-2">对象名称</th>
                              <th className="font-medium p-2">对象类型</th>
                              <th className="font-medium p-2">显示标签</th>
                              <th className="font-medium p-2">跳转按钮</th>
                              <th className="font-medium p-2">导航锚点</th>
                              <th className="font-medium p-2">语音配置</th>
                              <th className="font-medium p-2">状态</th>
                              <th className="font-medium p-2 text-right">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2A2D39]">
                            {threeDSceneObjects.map(obj => {
                              const pConf = sceneObjectPropertyConfig[obj.id] || {};
                              const lConf = pConf.labelConfig?.applied;
                              const jConf = pConf.jumpButtonConfig?.applied;
                              const aConf = pConf.anchorConfig?.applied;
                              const vConf = pConf.voiceConfig?.applied;
                              return (
                              <tr 
                                key={obj.id} 
                                className={\`text-zinc-300 hover:bg-[#2A2D39]/50 cursor-pointer whitespace-nowrap \${selectedSceneObject?.id === obj.id ? 'bg-[#10A66A]/10 text-white' : ''}\`}
                                onClick={() => setSelectedSceneObject(obj)}
                              >
                                <td className="p-2 font-bold max-w-[80px] truncate" title={obj.name}>{obj.name}</td>
                                <td className="p-2 text-zinc-500">{obj.category || obj.type}</td>
                                <td className="p-2"><span className={lConf ? "text-[#10A66A]" : "text-zinc-600"}>{lConf ? "已启用" : "未配置"}</span></td>
                                <td className="p-2"><span className={jConf ? "text-[#10A66A]" : "text-zinc-600"}>{jConf ? "已配置" : "未配置"}</span></td>
                                <td className="p-2"><span className={aConf ? "text-[#10A66A]" : "text-zinc-600"}>{aConf ? "已配置" : "未配置"}</span></td>
                                <td className="p-2"><span className={vConf ? "text-[#10A66A]" : "text-zinc-600"}>{vConf ? "已配置" : "未配置"}</span></td>
                                <td className="p-2"><span className="text-[#10A66A]">正常</span></td>
                                <td className="p-2 text-right"><button className="text-[#10A66A] hover:text-white" onClick={(e) => { e.stopPropagation(); setSelectedSceneObject(obj); setDesignerToast("正在定位"); setTimeout(() => setDesignerToast(""), 3000); }}>定位</button></td>
                              </tr>
                            )})}
                            {threeDSceneObjects.length === 0 && (
                               <tr><td colSpan={8} className="p-4 text-center text-zinc-600">暂无场景对象</td></tr>
                            )}
                          </tbody>
                        </table>
                     </div>
                   </div>`;

const logBlock = `                   {/* Operation Logs & Config Records */}
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
                   </div>`;

const oldObjStartStr = `{/* Object List */}`;
const oldObjEndStr = `                   </div>`;

const lines = txt.split('\\n');
let startObj = lines.findIndex(l => l.includes('{/* Object List */}'));
let endObj = lines.findIndex((l, i) => i > startObj && l.includes('{/* Data Receive Records */}')) - 2;

let startLog = lines.findIndex(l => l.includes('{/* Operation Logs */}'));
let endLog = lines.findIndex((l, i) => i > startLog && l.includes('</div>')) + 9;

// To be safe, just string replace via regex or split
// Wait, replacing Object List is easy.
let updatedTxt = txt;

const oldSceneListRegex = /\{\/\* Object List \*\/\}[\s\S]*?暂无场景对象.*?<\/table>\s*<\/div>\s*<\/div>/g;
updatedTxt = updatedTxt.replace(oldSceneListRegex, newSceneObjBlock);

const oldLogListRegex = /\{\/\* Operation Logs \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
updatedTxt = updatedTxt.replace(oldLogListRegex, logBlock);

fs.writeFileSync(file, updatedTxt);
