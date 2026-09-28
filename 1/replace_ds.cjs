const fs = require('fs');
let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const newRenderStr = `                 <div className="space-y-4">
                    <div className="bg-[#1A1C1E] border border-[#333] p-3 rounded">
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>当前组件</span> <span className="text-white font-bold">{compLayer.name}</span></div>
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>组件类型</span> <span className="text-white">{compLayer.type}</span></div>
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>绑定平台</span> <span className="text-white">工程虚拟仿真平台</span></div>
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>绑定设备</span> <span className="text-white">{deviceList.find(d => d.id === cConfig.deviceId)?.name || '-'}</span></div>
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>绑定数据点</span> <span className="text-emerald-400 font-mono">{cConfig.dataPoint || '-'}</span></div>
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>当前值</span> <span className="text-amber-400 font-mono">{isDynamic ? (realTimeData[cConfig.dataPoint] || "-") : (cConfig.staticValue || "-")} {isDynamic && cConfig.dataPoint && deviceList.find(d => d.id === cConfig.deviceId) ? deviceList.find(d => d.id === cConfig.deviceId)?.dataPoints.find((dp: any) => dp.key === cConfig.dataPoint)?.unit : ""}</span></div>
                       <div className="text-xs text-zinc-400 mb-1 flex justify-between"><span>刷新方式</span> <span className="text-white">实时刷新</span></div>
                       <div className="text-xs text-zinc-400 flex justify-between items-center"><span>绑定状态</span> {cConfig.deviceId ? <span className="text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 rounded">已绑定</span> : <span className="text-zinc-500">未绑定</span>}</div>
                    </div>`;

const start = txt.indexOf('                 <div className="space-y-5">');
const end = txt.indexOf('                    <div className="flex bg-[#1E1E1E] border border-[#333] p-1 rounded">');

if (start !== -1 && end !== -1) {
    txt = txt.substring(0, start) + newRenderStr + '\n\n' + txt.substring(end);
    fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
    console.log('replaced data config info');
} else {
    console.log('failed', start, end);
}
