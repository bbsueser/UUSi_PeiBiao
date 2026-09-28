import fs from 'fs';

const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const regex1 = /const \[virtualSimulationConnectionStatus, setVirtualSimulationConnectionStatus\] = useState<.*?>\(.*\);/;
const regex2 = /const \[virtualSimulationReceiveStatus, setVirtualSimulationReceiveStatus\] = useState<.*?>\(.*\);/;
const regex3 = /const \[virtualDataReceiveRecords, setVirtualDataReceiveRecords\] = useState<any\[\]>\(\[\]\);/;

txt = txt.replace(regex1, 'const [virtualSimulationConnectionStatus, setVirtualSimulationConnectionStatus] = useState<"未连接" | "已连接" | "接收中" | "已暂停">("已连接");');
txt = txt.replace(regex2, 'const [virtualSimulationReceiveStatus, setVirtualSimulationReceiveStatus] = useState<"未连接" | "已连接" | "接收中" | "已暂停">("接收中");');
txt = txt.replace(regex3, `const [virtualDataReceiveRecords, setVirtualDataReceiveRecords] = useState<any[]>([
    { time: '10:52:24', modelName: '风机模型', targetDeviceName: '风机', deviceId: 'fan01', field: 'fanStatus', val: 'running', unit: '-', source: '工程虚拟仿真平台', type: '已接收' },
    { time: '10:52:22', modelName: '光照传感器模型', targetDeviceName: '光照传感器', deviceId: 'light01', field: 'light', val: '450', unit: 'Lux', source: '工程虚拟仿真平台', type: '已接收' },
    { time: '10:52:20', modelName: '温湿度传感器模型', targetDeviceName: '温湿度传感器', deviceId: 'temp01', field: 'humidity', val: '58', unit: '%', source: '工程虚拟仿真平台', type: '已接收' },
    { time: '10:52:20', modelName: '温湿度传感器模型', targetDeviceName: '温湿度传感器', deviceId: 'temp01', field: 'temperature', val: '24.6', unit: '℃', source: '工程虚拟仿真平台', type: '已接收' },
  ]);`);
  
const regexLog = /const \[sceneObjectLogs, setSceneObjectLogs\] = useState\(\[\s*{\s*time:.*?}\s*\]\);/;
txt = txt.replace(regexLog, `const [sceneObjectLogs, setSceneObjectLogs] = useState([
    { time: "10:53:00", msg: "暂停接收工程虚拟仿真平台数据" },
    { time: "10:52:22", msg: "接收仿真数据：humidity = 58 %" },
    { time: "10:52:20", msg: "接收仿真数据：temperature = 24.6 ℃" },
    { time: "10:52:00", msg: "开始接收工程虚拟仿真平台数据" },
    { time: "10:51:20", msg: "绑定仿真数据项：temperature、humidity" },
    { time: "10:51:00", msg: "绑定仿真设备：温湿度传感器 temp01" },
    { time: "10:50:40", msg: "刷新工程虚拟仿真平台设备列表" },
    { time: "10:50:20", msg: "连接工程虚拟仿真平台成功" },
    { time: "10:50:00", msg: "进入 3D 应用设计工作台" }
  ]);`);

fs.writeFileSync(file, txt);
console.log('Fixed states');
