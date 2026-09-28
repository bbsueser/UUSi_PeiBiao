import fs from 'fs';

const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Fix button texts
txt = txt.replace(
    /virtualSimulationConnectionStatus !== '未连接' \? '已连接' : '连接虚拟仿真平台'/g,
    "virtualSimulationConnectionStatus !== '未连接' ? '工程虚拟仿真平台已连接' : '连接工程虚拟仿真平台'"
);

txt = txt.replace(
    /virtualSimulationConnectionStatus !== '未处理' \? '已连接' : '连接虚拟仿真平台'/g,
    "virtualSimulationConnectionStatus !== '未处理' ? '工程虚拟仿真平台已连接' : '连接工程虚拟仿真平台'"
);

txt = txt.replace(/>连接虚拟仿真平台</g, ">连接工程虚拟仿真平台<");

// Check if any "云平台" occurrences
txt = txt.replace(/>云平台</g, ">工程虚拟仿真平台<");
txt = txt.replace(/'云平台'/g, "'工程虚拟仿真平台'");

fs.writeFileSync(file, txt);
