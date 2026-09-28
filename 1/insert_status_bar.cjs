const fs = require('fs');

let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const statusBarStr = `      {/* 工程虚拟仿真数据顶栏状态 */}
      <div className="bg-[#111] px-4 py-1.5 flex items-center gap-6 border-b border-[#333] text-[10px] text-zinc-400 shrink-0">
         <div>当前应用：<span className="text-white font-bold">工程设备运行监控大屏</span></div>
         <div>数据源：<span className="text-white">工程虚拟仿真平台</span></div>
         <div className="flex items-center gap-1.5">连接状态：<span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,166,106,0.8)]"></span><span className="text-emerald-400">已连接</span></div>
         <div>当前仿真项目：<span className="text-white">智能生产线虚拟仿真</span></div>
         <div>当前仿真场景：<span className="text-white">生产线设备运行监控</span></div>
         <div>已连接仿真设备：<span className="text-blue-400 font-mono font-bold">6 </span> 台</div>
         <div className="flex items-center gap-1.5 flex-1 justify-end">
           <span>实时数据状态：</span><span className="text-emerald-400">接收中</span>
           <span className="ml-2">最后刷新时间：</span><span className="text-zinc-300">{realTimeRunning ? "刚刚" : "2 秒前"}</span>
         </div>
      </div>
`;
const insertPosStr = '         </div>\n      </div>\n\n      <div className="flex-1 flex overflow-hidden relative">';

txt = txt.replace('         </div>\n      </div>\n\n      <div className="flex-1 flex overflow-hidden relative">', '         </div>\n      </div>\n\n' + statusBarStr + '      <div className="flex-1 flex overflow-hidden relative">');

fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
console.log('Inserted status bar successfully.');
