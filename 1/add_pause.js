import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const additionalFc = `
  const handlePauseVirtualData = () => {
    setVirtualSimulationReceiveStatus("已暂停");
    setVirtualSimulationConnectionStatus("已连接");
    if (dataReceiveTimer) clearInterval(dataReceiveTimer);
    setDataReceiveTimer(null);
    showToast("已暂停接收工程虚拟仿真平台数据。");
    addLog("已暂停接收工程虚拟仿真平台数据");
  };
`;

txt = txt.replace('const handleStartReceive = () => {', additionalFc + '\\n  const handleStartReceive = () => {');
fs.writeFileSync(file, txt);
console.log("Pause func added.");
