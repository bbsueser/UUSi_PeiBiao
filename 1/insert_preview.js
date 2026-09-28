import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const previewBlock = `
                          {/* Config Preview */}
                          <div className="shrink-0 mt-4 border-t border-[#2A2D39] pt-4">
                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2">配置预览</div>
                            <div className="bg-[#16181E] border border-[#2A2D39] rounded p-2 text-[10px] space-y-1">
                              <div className="flex justify-between">
                                <span className="text-zinc-500">模型名称:</span>
                                <span className="text-zinc-300 truncate max-w-[120px]">{selectedSceneObject.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">显示标签:</span>
                                <span className={sceneObjectPropertyConfig[selectedSceneObject.id]?.labelConfig?.applied ? "text-[#10A66A]" : "text-zinc-500"}>
                                  {sceneObjectPropertyConfig[selectedSceneObject.id]?.labelConfig?.applied 
                                    ? \`已启用｜\${sceneObjectPropertyConfig[selectedSceneObject.id].labelConfig.position}｜\${sceneObjectPropertyConfig[selectedSceneObject.id].labelConfig.style}\` 
                                    : "未配置"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">跳转按钮:</span>
                                <span className={sceneObjectPropertyConfig[selectedSceneObject.id]?.jumpButtonConfig?.applied ? "text-[#10A66A]" : "text-zinc-500"}>
                                  {sceneObjectPropertyConfig[selectedSceneObject.id]?.jumpButtonConfig?.applied 
                                    ? \`已启用｜\${sceneObjectPropertyConfig[selectedSceneObject.id].jumpButtonConfig.btnName}｜\${sceneObjectPropertyConfig[selectedSceneObject.id].jumpButtonConfig.target}\` 
                                    : "未配置"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">导航锚点:</span>
                                <span className={sceneObjectPropertyConfig[selectedSceneObject.id]?.anchorConfig?.applied ? "text-[#10A66A]" : "text-zinc-500"}>
                                  {sceneObjectPropertyConfig[selectedSceneObject.id]?.anchorConfig?.applied 
                                    ? \`已启用｜\${sceneObjectPropertyConfig[selectedSceneObject.id].anchorConfig.name}｜X\${sceneObjectPropertyConfig[selectedSceneObject.id].anchorConfig.posX} Y\${sceneObjectPropertyConfig[selectedSceneObject.id].anchorConfig.posY} Z\${sceneObjectPropertyConfig[selectedSceneObject.id].anchorConfig.posZ}\` 
                                    : "未配置"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">语音配置:</span>
                                <span className={sceneObjectPropertyConfig[selectedSceneObject.id]?.voiceConfig?.applied ? "text-[#10A66A]" : "text-zinc-500"}>
                                  {sceneObjectPropertyConfig[selectedSceneObject.id]?.voiceConfig?.applied 
                                    ? \`已启用｜\${sceneObjectPropertyConfig[selectedSceneObject.id].voiceConfig.file?.name || '文本语音'}｜\${sceneObjectPropertyConfig[selectedSceneObject.id].voiceConfig.playMode}\` 
                                    : "未配置"}
                                </span>
                              </div>
                            </div>
                          </div>
`;

let lines = txt.split('\\n');
// Find where tabs container ends
let targetLine = lines.findIndex(l => l.includes('                           {activePropertyTab === "语音配置" && (() => {'));
if (targetLine === -1) {
    console.log("Could not find 语音配置 block");
    process.exit(1);
}

// Find matching ending div for the tabs container.
let endOfTabsBlock = targetLine;
while (!lines[endOfTabsBlock].includes('                         </div>')) {
    endOfTabsBlock++;
    if (endOfTabsBlock >= lines.length) {
        console.log("Could not find end of tab block");
        process.exit(1);
    }
}
// Actually, look for the closing div of `<div className="flex-1 overflow-y-auto no-scrollbar">`
// Wait! `</div>` on line 2068

const newLines = [
    ...lines.slice(0, endOfTabsBlock + 1),
    previewBlock,
    ...lines.slice(endOfTabsBlock + 1)
];

fs.writeFileSync(file, newLines.join('\\n'));
console.log("Inserted preview block.");
