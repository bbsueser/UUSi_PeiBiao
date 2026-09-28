const fs = require('fs');
let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const tableStr = `                   {activeBottomTab === "bindingRelations" && (
                     <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-[#252526] sticky top-0 border-b border-[#333] z-10">
                           <tr>
                              <th className="p-2 pl-4 text-zinc-500 font-medium">画布组件</th>
                              <th className="p-2 text-zinc-500 font-medium">仿真设备</th>
                              <th className="p-2 text-zinc-500 font-medium">数据点</th>
                              <th className="p-2 text-zinc-500 font-medium">当前值</th>
                              <th className="p-2 text-zinc-500 font-medium">展示方式</th>
                              <th className="p-2 text-zinc-500 font-medium">状态</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-[#333] bg-[#1E1E1E]">
                           {Object.entries(componentConfigs).filter(([_, conf]: any) => conf.dataMode === 'dynamic').map(([compId, conf]: any, idx) => {
                             const dev = deviceList.find(d => d.id === conf.deviceId);
                             const dpInfo = dev ? dev.dataPoints.find((dp: any) => dp.key === conf.dataPoint) : null;
                             const val = realTimeData[conf.dataPoint] || '-';
                             const displayValue = val !== '-' && dpInfo ? \`\${val} \${dpInfo.unit}\` : val;
                             
                             const devName = dev?.name.split(' ')[0] || conf.deviceId || '全部设备';
                             const comp = layerList.find(l => l.id === compId);
                             const compName = comp?.name || compId;
                             const compType = comp?.type || '-';
                             return (
                             <tr key={idx} className="hover:bg-[#2A2D2E] transition-colors font-mono">
                               <td className="p-2 pl-4 text-white font-bold max-w-[150px] truncate" title={compName}>{compName}</td>
                               <td className="p-2 text-zinc-300 max-w-[150px] truncate" title={devName}>{devName}</td>
                               <td className="p-2 text-blue-400 max-w-[150px] truncate" title={conf.dataPoint}>{conf.dataPoint || '运行状态'}</td>
                               <td className="p-2 text-amber-400 max-w-[150px] truncate">{displayValue}</td>
                               <td className="p-2 text-zinc-400 max-w-[150px] truncate">{compType}</td>
                               <td className="p-2 text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/>已绑定</td>
                             </tr>
                             )
                           })}
                        </tbody>
                     </table>
                   )}`;

const start = txt.indexOf('                   {activeBottomTab === "bindingRelations" && (');
const end = txt.indexOf('                   {activeBottomTab === "layerRecords" && (', start);

if (start !== -1 && end !== -1) {
    txt = txt.substring(0, start) + tableStr + '\n\n' + txt.substring(end);
    fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
    console.log('updated table!');
}
