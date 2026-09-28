const fs = require('fs');
let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const newStats = `          <div className="flex items-center gap-6 px-2 overflow-x-auto no-scrollbar">
             <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px]">当前应用</span>
                <span className="text-white text-xs font-bold mt-0.5">工程设备运行监控看板</span>
             </div>
             <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px]">数据源</span>
                <span className="text-white text-xs font-bold mt-0.5">工程虚拟仿真平台</span>
             </div>
             <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px]">连接状态</span>
                <div className="flex items-center gap-1 mt-0.5">
                   <div className={\`w-1.5 h-1.5 rounded-full \${cloudConnected ? 'bg-emerald-500' : 'bg-red-500'}\`}></div>
                   <span className="text-zinc-300 text-xs font-bold">{cloudConnected ? '已连接' : '未连接'}</span>
                </div>
             </div>
             <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px]">当前仿真项目</span>
                <span className="text-zinc-300 text-xs mt-0.5 font-mono">智能产线虚拟仿真</span>
             </div>
             <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px]">当前仿真场景</span>
                <span className="text-zinc-300 text-xs mt-0.5 font-mono">产线设备运行监测</span>
             </div>
             <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px]">接入仿真设备</span>
                <span className="text-zinc-300 text-xs mt-0.5 font-mono">6 台</span>
             </div>
             <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px]">实时数据状态</span>
                <span className={\`text-xs mt-0.5 font-mono \${realTimeRunning ? 'text-emerald-400' : 'text-zinc-500'}\`}>{realTimeRunning ? '接收中' : '未开启'}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px]">最近刷新</span>
                <span className="text-zinc-400 text-xs mt-0.5 font-mono">{realTimeRunning ? '刚刚' : '-'}</span>
             </div>
          </div>`;

const statsSearchStart = '<div className="flex items-center gap-6 px-2 overflow-x-auto no-scrollbar">';
const start = txt.indexOf(statsSearchStart);
const end = txt.indexOf('</div>\n          </div>\n       </header>', start);

if (start !== -1 && end !== -1) {
    txt = txt.substring(0, start) + newStats + txt.substring(end + 6);
    fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
    console.log("top stats replaced!");
} else {
    console.log("could not find top stats", start, end);
}
