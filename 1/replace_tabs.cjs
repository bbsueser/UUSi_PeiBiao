const fs = require('fs');
let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

txt = txt.replace(/>数据源<\/button>/g, '>工程仿真数据</button>');
txt = txt.replace(/>数据配置<\/button>/g, '>设备绑定</button>');
txt = txt.replace(/>模型名称：<\/div>/g, '>当前组件：</div>');
txt = txt.replace(/>模型类型：<\/div>/g, '>组件类型：</div>');
txt = txt.replace(/<div className="text-zinc-500 text-\[10px\] mt-1">所属图层：\{getGroupName/g, '<div className="text-zinc-500 text-[10px] mt-1">当前值：{isDynamic ? (realTimeData[cConfig.dataPoint] || "-") : (cConfig.staticValue || "-")} {isDynamic ? "" : cConfig.staticUnit}</div>\n                       <div className="text-zinc-500 text-[10px] mt-1">绑定状态：{cConfig.deviceId ? <span className="text-emerald-400">已绑定</span> : <span className="text-zinc-500">未绑定</span>}</div>\n                       <div className="hidden text-zinc-500 text-[10px] mt-1">所属图层：{getGroupName');

txt = txt.replace(/云平台数据源参数/g, '工程虚拟仿真平台数据');
txt = txt.replace(/平台名称<\/label>/g, '平台名称</label>');
txt = txt.replace(/物联网综合实训云平台/g, '工程虚拟仿真平台');
txt = txt.replace(/设备运行监测/g, '产线设备运行监测');

// change some canvas default text
txt = txt.replace(/<div className="absolute inset-0 bg-[#0F0F11] overflow-hidden">/g, 
  '<div className="absolute inset-0 bg-[#0F0F11] overflow-hidden" style={{transform: `scale(${scale})`, transformOrigin: "top left"}}>\n' + 
  '<div className="text-white text-3xl font-bold absolute top-10 left-1/2 -translate-x-1/2">工程设备运行监控看板</div>\n' +
  '<div className="absolute top-10 right-10 bg-[#1E1E1E] p-4 text-emerald-400 font-bold border-l-4 border-emerald-500 shadow-xl rounded"><p className="text-zinc-400 text-xs mb-1">平台连接状态</p>工程虚拟仿真平台：已连接</div>\n');

// the "scale" is already applied to the outer div in original code? Wait, maybe I just replace something simpler. Let's not mess up the canvas rendering yet. I'll just use the right panel replacement first.
fs.writeFileSync('src/components/TwoDDesigner_tabs.tsx', txt);
