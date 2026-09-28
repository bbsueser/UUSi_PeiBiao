import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const replacement = `                           {activePropertyTab === "显示标签" && (() => {
                             const conf = sceneObjectPropertyConfig[selectedSceneObject.id]?.labelConfig || {
                               enabled: true,
                               title: '温湿度传感器',
                               content: '温度 24.6 ℃，湿度 58%',
                               type: '名称标签',
                               position: '模型上方',
                               style: '卡片样式',
                               showIcon: true,
                               showDevice: true,
                               showTime: true,
                               applied: false
                             };
                             const updateConf = (updater) => {
                               setSceneObjectPropertyConfig(prev => ({
                                 ...prev,
                                 [selectedSceneObject.id]: {
                                   ...(prev[selectedSceneObject.id] || {}),
                                   labelConfig: updater(prev[selectedSceneObject.id]?.labelConfig || conf)
                                 }
                               }));
                             };
                             return (
                               <div className="space-y-4">
                                  <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mb-2">显示标签配置</div>
                                  <div className="text-[10px] text-zinc-400">说明：为模型配置名称、状态、数据、说明等可视化标签。</div>
                                  
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-zinc-400">是否显示标签</label>
                                    <button
                                      className={\`w-8 h-4 rounded-full relative transition-colors \${conf.enabled ? 'bg-[#10A66A]' : 'bg-zinc-600'}\`}
                                      onClick={() => updateConf(c => ({...c, enabled: !c.enabled}))}
                                    >
                                      <div className={\`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all \${conf.enabled ? 'right-0.5' : 'left-0.5'}\`} />
                                    </button>
                                  </div>
                                  
                                  {conf.enabled && (
                                    <>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">标签标题</label>
                                        <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#10A66A]" value={conf.title} onChange={e => updateConf(c => ({...c, title: e.target.value}))} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">标签内容</label>
                                        <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#10A66A]" value={conf.content} onChange={e => updateConf(c => ({...c, content: e.target.value}))} />
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">标签类型</label>
                                          <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.type} onChange={e => updateConf(c => ({...c, type: e.target.value}))}>
                                            <option>名称标签</option><option>状态标签</option><option>数据标签</option><option>说明标签</option><option>告警标签</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">标签位置</label>
                                          <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.position} onChange={e => updateConf(c => ({...c, position: e.target.value}))}>
                                            <option>模型上方</option><option>模型下方</option><option>模型左侧</option><option>模型右侧</option><option>跟随模型</option>
                                          </select>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">标签样式</label>
                                        <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.style} onChange={e => updateConf(c => ({...c, style: e.target.value}))}>
                                          <option>简洁样式</option><option>卡片样式</option><option>透明样式</option><option>状态灯样式</option>
                                        </select>
                                      </div>
                                      
                                      <div className="space-y-2 pt-2 border-t border-[#2A2D39]">
                                        <div className="flex items-center justify-between">
                                          <label className="text-[10px] text-zinc-400">是否显示图标</label>
                                          <button className={\`w-8 h-4 rounded-full relative transition-colors \${conf.showIcon ? 'bg-[#10A66A]' : 'bg-zinc-600'}\`} onClick={() => updateConf(c => ({...c, showIcon: !c.showIcon}))}>
                                            <div className={\`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all \${conf.showIcon ? 'right-0.5' : 'left-0.5'}\`} />
                                          </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <label className="text-[10px] text-zinc-400">是否显示绑定设备</label>
                                          <button className={\`w-8 h-4 rounded-full relative transition-colors \${conf.showDevice ? 'bg-[#10A66A]' : 'bg-zinc-600'}\`} onClick={() => updateConf(c => ({...c, showDevice: !c.showDevice}))}>
                                            <div className={\`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all \${conf.showDevice ? 'right-0.5' : 'left-0.5'}\`} />
                                          </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <label className="text-[10px] text-zinc-400">是否显示更新时间</label>
                                          <button className={\`w-8 h-4 rounded-full relative transition-colors \${conf.showTime ? 'bg-[#10A66A]' : 'bg-zinc-600'}\`} onClick={() => updateConf(c => ({...c, showTime: !c.showTime}))}>
                                            <div className={\`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all \${conf.showTime ? 'right-0.5' : 'left-0.5'}\`} />
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="pt-2 flex gap-2">
                                        <button className="flex-1 py-1.5 bg-[#10A66A] hover:bg-[#0c8a58] text-white rounded text-xs transition-colors" onClick={() => {
                                          updateConf(c => ({...c, applied: true}));
                                          setDesignerToast("显示标签配置已应用");
                                          setTimeout(() => setDesignerToast(""), 3000);
                                          setPropertyConfigRecords(prev => [{
                                            time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '显示标签', content: \`\${conf.position}\${conf.style}\`, result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>应用标签配置</button>
                                        <button className="py-1.5 px-3 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-zinc-300 rounded text-xs transition-colors" onClick={() => updateConf(c => ({...c, applied: false}))}>重置标签配置</button>
                                      </div>
                                    </>
                                  )}
                               </div>
                             );
                           })()}
                           
                           {activePropertyTab === "跳转按钮" && (() => {
                             const conf = sceneObjectPropertyConfig[selectedSceneObject.id]?.jumpButtonConfig || {
                               enabled: true,
                               btnName: '查看设备详情',
                               position: '标签下方',
                               jumpType: '数据详情',
                               target: '设备详情面板',
                               openType: '右侧面板打开',
                               applied: false
                             };
                             const updateConf = (updater) => {
                               setSceneObjectPropertyConfig(prev => ({
                                 ...prev,
                                 [selectedSceneObject.id]: {
                                   ...(prev[selectedSceneObject.id] || {}),
                                   jumpButtonConfig: updater(prev[selectedSceneObject.id]?.jumpButtonConfig || conf)
                                 }
                               }));
                             };
                             return (
                               <div className="space-y-4">
                                  <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mb-2">跳转按钮配置</div>
                                  <div className="text-[10px] text-zinc-400">说明：为模型配置可点击按钮，点击后可跳转到指定页面、场景、数据面板或外部链接占位。</div>
                                  
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-zinc-400">是否启用跳转按钮</label>
                                    <button className={\`w-8 h-4 rounded-full relative transition-colors \${conf.enabled ? 'bg-[#10A66A]' : 'bg-zinc-600'}\`} onClick={() => updateConf(c => ({...c, enabled: !c.enabled}))}>
                                      <div className={\`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all \${conf.enabled ? 'right-0.5' : 'left-0.5'}\`} />
                                    </button>
                                  </div>
                                  
                                  {conf.enabled && (
                                    <>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">按钮名称</label>
                                        <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#10A66A]" value={conf.btnName} onChange={e => updateConf(c => ({...c, btnName: e.target.value}))} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">按钮位置</label>
                                        <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.position} onChange={e => updateConf(c => ({...c, position: e.target.value}))}>
                                          <option>标签下方</option><option>模型右侧</option><option>模型上方</option><option>悬浮显示</option>
                                        </select>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">跳转类型</label>
                                        <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.jumpType} onChange={e => updateConf(c => ({...c, jumpType: e.target.value}))}>
                                          <option>页面跳转</option><option>场景跳转</option><option>面板跳转</option><option>数据详情</option><option>外部链接占位</option>
                                        </select>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">跳转目标</label>
                                          <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.target} onChange={e => updateConf(c => ({...c, target: e.target.value}))}>
                                            <option>设备详情面板</option><option>行业云设备管理</option><option>数据接收记录</option><option>智慧温室场景</option><option>主场景</option><option>能耗监测面板</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">打开方式</label>
                                          <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.openType} onChange={e => updateConf(c => ({...c, openType: e.target.value}))}>
                                            <option>当前页面打开</option><option>右侧面板打开</option><option>底部面板打开</option><option>新面板打开</option>
                                          </select>
                                        </div>
                                      </div>
                                      
                                      <div className="pt-2 flex gap-2">
                                        <button className="flex-1 py-1.5 bg-[#10A66A] hover:bg-[#0c8a58] text-white rounded text-xs transition-colors" onClick={() => {
                                          updateConf(c => ({...c, applied: true}));
                                          setDesignerToast("跳转按钮配置已应用");
                                          setTimeout(() => setDesignerToast(""), 3000);
                                          setPropertyConfigRecords(prev => [{
                                            time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '跳转按钮', content: \`\${conf.btnName}\`, result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>应用跳转配置</button>
                                        <button className="flex-1 py-1.5 bg-[#007BFF] hover:bg-[#0069d9] text-white rounded text-xs transition-colors" onClick={() => {
                                          setDesignerToast("已打开" + conf.target);
                                          setTimeout(() => setDesignerToast(""), 3000);
                                          setTargetPanelVisible({
                                            visible: true,
                                            title: conf.target,
                                            data: {
                                              name: selectedSceneObject.name,
                                              id: selectedSceneObject.id,
                                            }
                                          });
                                          setPropertyConfigRecords(prev => [{
                                            time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '跳转测试', content: \`跳转到：\${conf.target}\`, result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>测试跳转</button>
                                      </div>
                                    </>
                                  )}
                               </div>
                             );
                           })()}

                           {activePropertyTab === "导航锚点" && (() => {
                             const conf = sceneObjectPropertyConfig[selectedSceneObject.id]?.anchorConfig || {
                               enabled: true,
                               name: '温室环境监测点',
                               type: '设备锚点',
                               posX: 120, posY: 0, posZ: 80,
                               rotX: 0, rotY: 45, rotZ: 0,
                               scale: 1.2,
                               desc: '快速定位到温室环境监测设备区域。',
                               applied: false
                             };
                             const updateConf = (updater) => {
                               setSceneObjectPropertyConfig(prev => ({
                                 ...prev,
                                 [selectedSceneObject.id]: {
                                   ...(prev[selectedSceneObject.id] || {}),
                                   anchorConfig: updater(prev[selectedSceneObject.id]?.anchorConfig || conf)
                                 }
                               }));
                             };
                             return (
                               <div className="space-y-4">
                                  <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mb-2">导航锚点配置</div>
                                  <div className="text-[10px] text-zinc-400">说明：为模型设置导航锚点，用于在 3D 场景中快速定位、切换视角或进入指定区域。</div>
                                  
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-zinc-400">是否启用导航锚点</label>
                                    <button className={\`w-8 h-4 rounded-full relative transition-colors \${conf.enabled ? 'bg-[#10A66A]' : 'bg-zinc-600'}\`} onClick={() => updateConf(c => ({...c, enabled: !c.enabled}))}>
                                      <div className={\`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all \${conf.enabled ? 'right-0.5' : 'left-0.5'}\`} />
                                    </button>
                                  </div>
                                  
                                  {conf.enabled && (
                                    <>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">锚点名称</label>
                                        <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#10A66A]" value={conf.name} onChange={e => updateConf(c => ({...c, name: e.target.value}))} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">锚点类型</label>
                                        <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.type} onChange={e => updateConf(c => ({...c, type: e.target.value}))}>
                                          <option>模型锚点</option><option>场景锚点</option><option>视角锚点</option><option>区域锚点</option><option>设备锚点</option>
                                        </select>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1"><label className="text-[10px] text-zinc-400">锚点位置 X</label><input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none" value={conf.posX} onChange={e => updateConf(c => ({...c, posX: parseFloat(e.target.value)}))} /></div>
                                        <div className="space-y-1"><label className="text-[10px] text-zinc-400">Y</label><input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none" value={conf.posY} onChange={e => updateConf(c => ({...c, posY: parseFloat(e.target.value)}))} /></div>
                                        <div className="space-y-1"><label className="text-[10px] text-zinc-400">Z</label><input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none" value={conf.posZ} onChange={e => updateConf(c => ({...c, posZ: parseFloat(e.target.value)}))} /></div>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1"><label className="text-[10px] text-zinc-400">视角方向 X</label><input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none" value={conf.rotX} onChange={e => updateConf(c => ({...c, rotX: parseFloat(e.target.value)}))} /></div>
                                        <div className="space-y-1"><label className="text-[10px] text-zinc-400">Y</label><input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none" value={conf.rotY} onChange={e => updateConf(c => ({...c, rotY: parseFloat(e.target.value)}))} /></div>
                                        <div className="space-y-1"><label className="text-[10px] text-zinc-400">Z</label><input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none" value={conf.rotZ} onChange={e => updateConf(c => ({...c, rotZ: parseFloat(e.target.value)}))} /></div>
                                      </div>
                                      
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">缩放级别</label>
                                        <input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none" value={conf.scale} onChange={e => updateConf(c => ({...c, scale: parseFloat(e.target.value)}))} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">导航说明</label>
                                        <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none" value={conf.desc} onChange={e => updateConf(c => ({...c, desc: e.target.value}))} />
                                      </div>
                                      
                                      <div className="pt-2 flex gap-2">
                                        <button className="flex-1 py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] text-white rounded text-xs transition-colors" onClick={() => {
                                          updateConf(c => ({...c, posX: 120, posY: 0, posZ: 80, rotX: 0, rotY: 45, rotZ: 0}));
                                          setDesignerToast("已获取当前位置");
                                          setTimeout(() => setDesignerToast(""), 3000);
                                        }}>获取当前位置</button>
                                        <button className="flex-1 py-1.5 bg-[#10A66A] hover:bg-[#0c8a58] text-white rounded text-xs transition-colors" onClick={() => {
                                          updateConf(c => ({...c, applied: true}));
                                          setNavigationAnchors(prev => {
                                            const existing = prev.filter(x => x.id !== selectedSceneObject.id);
                                            return [{
                                              id: selectedSceneObject.id,
                                              name: conf.name, model: selectedSceneObject.name, type: conf.type,
                                              pos: \`X\${conf.posX} Y\${conf.posY} Z\${conf.posZ}\`, rot: \`Y\${conf.rotY}\`
                                            }, ...existing];
                                          });
                                          setDesignerToast("导航锚点已保存");
                                          setTimeout(() => setDesignerToast(""), 3000);
                                          setPropertyConfigRecords(prev => [{
                                            time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '导航锚点', content: \`\${conf.name}\`, result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>保存锚点</button>
                                        <button className="flex-1 py-1.5 bg-[#007BFF] hover:bg-[#0069d9] text-white rounded text-xs transition-colors" onClick={() => {
                                          setDesignerToast("已定位到导航锚点");
                                          setTimeout(() => setDesignerToast(""), 3000);
                                          setPropertyConfigRecords(prev => [{
                                            time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '定位锚点', content: \`\${conf.name}\`, result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>定位锚点</button>
                                      </div>
                                    </>
                                  )}
                               </div>
                             );
                           })()}

                           {activePropertyTab === "语音配置" && (() => {
                             const conf = sceneObjectPropertyConfig[selectedSceneObject.id]?.voiceConfig || {
                               enabled: true,
                               name: '温湿度传感器语音说明',
                               type: '模型说明',
                               source: '上传语音文件',
                               file: null,
                               text: '这是温湿度传感器，用于采集环境温度和湿度数据。',
                               playMode: '点击模型播放',
                               showBtn: true,
                               parseStatus: '待解析',
                               playStatus: '未播放',
                               progress: '00:00 / 00:12',
                               applied: false
                             };
                             const updateConf = (updater) => {
                               setSceneObjectPropertyConfig(prev => ({
                                 ...prev,
                                 [selectedSceneObject.id]: {
                                   ...(prev[selectedSceneObject.id] || {}),
                                   voiceConfig: updater(prev[selectedSceneObject.id]?.voiceConfig || conf)
                                 }
                               }));
                             };
                             return (
                               <div className="space-y-4">
                                  <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mb-2">语音配置</div>
                                  <div className="text-[10px] text-zinc-400">说明：为模型配置语音说明，可通过上传语音文件或输入语音文本完成配置。</div>
                                  
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-zinc-400">是否启用语音</label>
                                    <button className={\`w-8 h-4 rounded-full relative transition-colors \${conf.enabled ? 'bg-[#10A66A]' : 'bg-zinc-600'}\`} onClick={() => updateConf(c => ({...c, enabled: !c.enabled}))}>
                                      <div className={\`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all \${conf.enabled ? 'right-0.5' : 'left-0.5'}\`} />
                                    </button>
                                  </div>
                                  
                                  {conf.enabled && (
                                    <>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">语音名称</label>
                                        <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#10A66A]" value={conf.name} onChange={e => updateConf(c => ({...c, name: e.target.value}))} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">语音类型</label>
                                        <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.type} onChange={e => updateConf(c => ({...c, type: e.target.value}))}>
                                          <option>模型说明</option><option>操作提示</option><option>告警提示</option><option>导航讲解</option><option>设备状态播报</option>
                                        </select>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] text-zinc-400">语音来源</label>
                                        <div className="flex bg-[#16181E] border border-[#2A2D39] rounded p-1">
                                          {["上传语音文件", "输入语音文本"].map(typ => (
                                            <button key={typ} className={\`flex-1 py-1 text-xs rounded transition-colors \${conf.source === typ ? 'bg-[#2A2D39] text-[#10A66A] font-bold' : 'text-zinc-500 hover:text-zinc-300'}\`} onClick={() => updateConf(c => ({...c, source: typ}))}>{typ}</button>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      {conf.source === '上传语音文件' && (
                                        <div className="space-y-2">
                                          {!conf.file ? (
                                            <div className="border border-dashed border-zinc-700 hover:border-[#10A66A] rounded bg-[#16181E] p-4 flex flex-col items-center justify-center cursor-pointer transition-colors" onClick={() => updateConf(c => ({...c, file: {name: 'sensor_intro.mp3', format: 'mp3', size: '1.8 MB', duration: '12 秒'}}))}>
                                              <Upload className="w-6 h-6 text-zinc-500 mb-2" />
                                              <p className="text-xs font-bold text-zinc-300">拖拽语音文件到此处，或点击选择文件</p>
                                              <p className="text-[10px] text-zinc-500 mt-1">支持格式：mp3、wav、ogg</p>
                                              <button className="mt-2 px-3 py-1 bg-[#2A2D39] hover:bg-[#3A3D49] text-white text-xs rounded transition-colors">选择语音文件</button>
                                            </div>
                                          ) : (
                                            <div className="border border-[#2A2D39] bg-[#16181E] rounded p-3">
                                              <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                  <Volume2 className="w-6 h-6 text-[#10A66A]" />
                                                  <div>
                                                    <div className="text-xs font-bold text-white">{conf.file.name}</div>
                                                    <div className="text-[10px] text-zinc-500">格式：{conf.file.format} | 大小：{conf.file.size} | 时长：{conf.file.duration}</div>
                                                  </div>
                                                </div>
                                                <button className="text-[10px] text-zinc-500 hover:text-red-400" onClick={() => updateConf(c => ({...c, file: null, parseStatus: '待解析'}))}>移除</button>
                                              </div>
                                              <div className="flex justify-between items-center text-[10px]">
                                                <span className={\`\${conf.parseStatus === '解析成功' ? 'text-[#10A66A]' : 'text-zinc-500'}\`}>状态：{conf.parseStatus}</span>
                                                {conf.parseStatus !== '解析成功' && (
                                                  <button className="text-[#10A66A] hover:text-[#0c8a58] font-bold" onClick={() => {
                                                    updateConf(c => ({...c, parseStatus: '解析成功'}));
                                                    setDesignerToast("语音文件解析成功");
                                                    setTimeout(() => setDesignerToast(""), 3000);
                                                    setPropertyConfigRecords(prev => [{
                                                        time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '文件解析', content: 'sensor_intro.mp3', result: '成功', user: '学生1'
                                                    }, ...prev]);
                                                  }}>解析语音文件</button>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {conf.source === '输入语音文本' && (
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">语音文本</label>
                                          <textarea className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#10A66A] h-20" value={conf.text} onChange={e => updateConf(c => ({...c, text: e.target.value}))}></textarea>
                                        </div>
                                      )}

                                      <div className="grid grid-cols-2 gap-2 pt-2">
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">播放方式</label>
                                          <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.playMode} onChange={e => updateConf(c => ({...c, playMode: e.target.value}))}>
                                            <option>点击模型播放</option><option>进入场景自动播放</option><option>点击按钮播放</option><option>触发事件播放</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">显示播放按钮</label>
                                          <button className={\`w-full h-[28px] mt-0.5 rounded flex items-center justify-center transition-colors \${conf.showBtn ? 'bg-[#2A2D39] text-[#10A66A]' : 'bg-[#16181E] border border-[#2A2D39] text-zinc-500'}\`} onClick={() => updateConf(c => ({...c, showBtn: !c.showBtn}))}>
                                            {conf.showBtn ? '已开启' : '已关闭'}
                                          </button>
                                        </div>
                                      </div>

                                      <div className="pt-3 pb-1 border-t border-[#2A2D39]">
                                          <div className="flex items-center justify-between text-[10px] mb-2">
                                            <span className="text-zinc-400">试听状态: <span className={\`font-bold \${conf.playStatus === '播放完成' ? 'text-[#10A66A]' : conf.playStatus === '播放中' ? 'text-[#007BFF]' : 'text-zinc-500'}\`}>{conf.playStatus}</span></span>
                                            <span className="text-zinc-500 font-mono">{conf.progress}</span>
                                          </div>
                                          <div className="w-full h-1 bg-[#16181E] rounded overflow-hidden">
                                            <div className="h-full bg-[#10A66A] transition-all duration-1000" style={{ width: conf.playStatus === '播放完成' ? '100%' : conf.playStatus === '播放中' ? '50%' : '0%' }}></div>
                                          </div>
                                      </div>
                                      
                                      <div className="pt-2 flex gap-2 flex-wrap">
                                        <button className="flex-1 py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-zinc-300 rounded text-xs transition-colors" onClick={() => {
                                          updateConf(c => ({...c, playStatus: '播放中'}));
                                          setTimeout(() => updateConf(c => ({...c, playStatus: '播放完成'})), 2000);
                                          setPropertyConfigRecords(prev => [{
                                              time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '语音试听', content: '播放完成', result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>试听语音</button>
                                        <button className="flex-1 py-1.5 bg-[#10A66A] hover:bg-[#0c8a58] text-white rounded text-xs transition-colors" onClick={() => {
                                          updateConf(c => ({...c, applied: true}));
                                          setDesignerToast("语音配置已应用");
                                          setTimeout(() => setDesignerToast(""), 3000);
                                          setPropertyConfigRecords(prev => [{
                                              time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '语音配置', content: \`\${conf.file?.name || '文本语音'}\`, result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>应用语音配置</button>
                                        <button className="w-full py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs transition-colors" onClick={() => updateConf(c => ({...c, applied: false, playStatus: '未播放'}))}>清除语音</button>
                                      </div>
                                    </>
                                  )}
                               </div>
                             );
                           })()}`;

const lines = txt.split('\n');
const start = lines.findIndex(l => l.includes('{activePropertyTab === "设备绑定"'));
let end = lines.findIndex(l => l.includes('未配置交互动作。'));

// find next )}
while (!lines[end].includes(')}')) {
    end++;
}

console.log("Replacing from", start, "to", end);

const newLines = [
    ...lines.slice(0, start),
    replacement,
    ...lines.slice(end + 1)
];

fs.writeFileSync(file, newLines.join('\n'));
console.log("Done.");
