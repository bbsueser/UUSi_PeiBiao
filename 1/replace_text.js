import fs from 'fs';

const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/'已连接平台'/g, "'工程虚拟仿真平台已连接'");
txt = txt.replace(/>已连接平台</g, ">工程虚拟仿真平台已连接<");
txt = txt.replace(/'已连接'/g, "'工程虚拟仿真平台已连接'");
txt = txt.replace(/>已连接</g, ">工程虚拟仿真平台已连接<");

// Revert string literals for states like "已连接" to "已连接" if any problem. Let's not blindly replace '已连接'
fs.writeFileSync(file, txt);
