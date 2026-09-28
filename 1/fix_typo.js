import fs from 'fs';

const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/工程虚拟仿真工程虚拟仿真/g, '工程虚拟仿真');
txt = txt.replace(/工程虚拟仿真平台工程虚拟仿真平台/g, '工程虚拟仿真平台');
txt = txt.replace(/工程虚拟仿真平台仿真设备数据/g, '行业云平台仿真设备数据');

fs.writeFileSync(file, txt);
