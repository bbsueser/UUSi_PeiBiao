const fs = require('fs');
let code = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

// 1. Top status strings
code = code.replace(/物联网监控看板/g, '工程设备运行监控看板');
code = code.replace(/云平台连接状态/g, '平台连接状态');
code = code.replace(/温湿度采集终端/g, '输送带设备');
code = code.replace(/TH-001/g, 'CONVEYOR-01');

fs.writeFileSync('src/components/TwoDDesigner_updated.tsx', code);
console.log('Done');
