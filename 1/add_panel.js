import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const targetPanelBlock = `
      {/* Target Panel Mock */}
      {targetPanelVisible && targetPanelVisible.visible && (
        <div className="absolute right-[320px] top-[100px] w-72 bg-[#1A1B23]/95 backdrop-blur border border-[#2A2D39] rounded-lg flex flex-col overflow-hidden shadow-2xl z-50 animate-in slide-in-from-right">
          <div className="bg-[#16181E] px-4 py-3 border-b border-[#2A2D39] flex items-center justify-between">
             <span className="font-bold text-white text-sm">{targetPanelVisible.title}</span>
             <button className="text-zinc-500 hover:text-white" onClick={() => setTargetPanelVisible(null)}><X className="w-4 h-4" /></button>
          </div>
          <div className="p-4 space-y-4 text-xs">
             <div className="flex justify-between">
                <span className="text-zinc-500">设备名称:</span>
                <span className="text-white font-bold">{targetPanelVisible.data?.name || '-'}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-zinc-500">设备编号:</span>
                <span className="text-zinc-300 font-mono">temp01</span>
             </div>
             <div className="flex justify-between">
                <span className="text-zinc-500">数据来源:</span>
                <span className="text-zinc-400">行业云平台设备数据</span>
             </div>
             <div className="flex justify-between border-t border-[#2A2D39] pt-3">
                <span className="text-zinc-500">当前数据:</span>
                <span className="text-[#10A66A] font-bold">温度 24.6 ℃，湿度 58%</span>
             </div>
             <div className="flex justify-between">
                <span className="text-zinc-500">最近更新时间:</span>
                <span className="text-zinc-500 font-mono">10:40:20</span>
             </div>
          </div>
        </div>
      )}
`;

const anchor = '{/* Import Package Drawer */}';
if (txt.includes(anchor)) {
    txt = txt.replace(anchor, targetPanelBlock + '\\n      ' + anchor);
    fs.writeFileSync(file, txt);
    console.log("Mock panel added.");
} else {
    console.log("Anchor not found.");
}
