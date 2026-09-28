const fs = require('fs');
let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const newButtons = `            <button onClick={() => setRightTab("dataSource")} className="px-3 py-1.5 bg-[#2A2D2E] hover:bg-[#333] border border-[#333] text-zinc-300 text-xs rounded transition-colors flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5"/><span>工程仿真数据</span>
            </button>
            <button onClick={() => setRightTab("dataSource")} className="px-3 py-1.5 bg-[#2A2D2E] hover:bg-[#333] border border-[#333] text-zinc-300 text-xs rounded transition-colors flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5"/><span>数据源</span>
            </button>
            <button onClick={() => setRightTab("dataConfig")} className="px-3 py-1.5 bg-[#2A2D2E] hover:bg-[#333] border border-[#333] text-zinc-300 text-xs rounded transition-colors flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5"/><span>设备绑定</span>
            </button>
            <button onClick={realTimeRunning ? pauseRealtimeData : startRealtimeData} className={\`px-3 py-1.5 border text-xs rounded transition-colors flex items-center gap-1.5 \${realTimeRunning ? 'bg-amber-600/20 text-amber-500 border-amber-600/50 hover:bg-amber-600/30' : 'bg-emerald-600/20 text-emerald-400 border-emerald-600/50 hover:bg-emerald-600/30'}\`}>
              <Zap className="w-3.5 h-3.5"/><span>实时刷新</span>
            </button>
            <button onClick={() => { showToast("2D 大屏应用更新成功"); addCloudLog("保存配置", "所有模型", "混合模式", "全部数据源", "全部绑定"); }} className="px-3 py-1.5 bg-[#37373D] hover:bg-[#47474D] border border-[#444] text-white text-xs rounded transition-colors flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5"/><span>保存</span>
            </button>
            <button onClick={() => { showToast("正在打开预览..."); addCloudLog("预览应用", "所有模型", "混合模式", "全部数据源", "全部绑定"); setPreviewMode(true); }} className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-600/50 hover:bg-indigo-600/30 text-xs rounded transition-colors flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5"/><span>预览</span>
            </button>
            <button className="px-4 py-1.5 bg-[#10A66A] hover:bg-[#0c8a58] text-white font-bold text-xs rounded transition-colors shadow-sm">发布</button>`;

const start = txt.indexOf('<button onClick={() => setRightTab("cloudConfig")');
const end = txt.indexOf('</button>', txt.indexOf('发布应用</button>')) + 9;

if (start !== -1 && end !== -1) {
    txt = txt.substring(0, start) + newButtons + txt.substring(end);
    fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
    console.log("top buttons replaced!");
} else {
    console.log("could not find top buttons");
}
