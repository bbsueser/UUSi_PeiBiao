import fs from 'fs';

const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// The required manual replacements
txt = txt.replace(/行业云数据接收记录/g, '工程虚拟仿真数据接收记录');
txt = txt.replace(/已连接平台/g, '工程虚拟仿真平台已连接');
txt = txt.replace(/数据来源：云平台/g, '数据来源：工程虚拟仿真平台');
txt = txt.replace(/平台数据/g, '工程虚拟仿真平台数据');

// Only replace '设备数据' if it's not already '仿真设备数据' and not in variable names.
txt = txt.replace(/设备数据/g, '仿真设备数据');
txt = txt.replace(/网络仿真设备数据/g, '网络设备数据'); // Fix if it got replaced inappropriately
txt = txt.replace(/仿真仿真/g, '仿真');

fs.writeFileSync(file, txt);
