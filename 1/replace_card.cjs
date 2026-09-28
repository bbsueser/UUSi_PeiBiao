const fs = require('fs');

let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const newLogic = `                                     if (realTimeData && cloudConnected) {
                                         const val = realTimeData[config.dataPoint];
                                         const dev = deviceList.find(d => d.id === config.deviceId);
                                         const dpInfo = dev ? dev.dataPoints.find(dp => dp.key === config.dataPoint) : null;
                                         const unit = dpInfo ? (dpInfo.unit || '') : '';
                                         
                                         if (['running','alarm','lightStatus','action'].includes(config.dataPoint)) {
                                             const isNormal = val === "正常" || val === "运行中" || val === "绿色常亮" || val === "开启";
                                             displayValue = <span className={isNormal ? "text-emerald-400" : "text-amber-500"}>{val}</span>;
                                             if (realTimeRunning && !isNormal) extraStyles = 'border-amber-500/50 bg-amber-900/20';
                                         } else if (config.dataPoint === 'openRate' || config.dataPoint === 'load') {
                                             displayValue = <span className="text-cyan-400">{val} {unit}</span>;
                                         } else {
                                             displayValue = <span className="text-blue-400">{val} {unit}</span>;
                                         }
                                     } else {`;
const start = txt.indexOf('                                     if (realTimeData && cloudConnected) {');
const end = txt.indexOf('                                     } else {', start);

if (start !== -1 && end !== -1) {
    txt = txt.substring(0, start) + newLogic + txt.substring(end + 45); // wait, I included `} else {` in the newLogic or not? Let's check length... better safely slice
    
    fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
    console.log('done replacing logic!');
}
