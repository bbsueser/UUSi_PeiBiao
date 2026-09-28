import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const virtualSimState = `
  // Engineering Virtual Simulation Data State
  const [virtualSimulationProject, setVirtualSimulationProject] = useState("智慧温室自动化控制工程");
  const [virtualSimulationScene, setVirtualSimulationScene] = useState("智慧温室");
  const [virtualSimulationConnectionStatus, setVirtualSimulationConnectionStatus] = useState<"未连接" | "已连接" | "接收中" | "已暂停">("为连接");
  const [virtualSimulationReceiveStatus, setVirtualSimulationReceiveStatus] = useState<"未连接" | "已连接" | "接收中" | "已暂停">("未连接");
  const [virtualDataReceiveRecords, setVirtualDataReceiveRecords] = useState<any[]>([]);
  const [virtualDeviceData, setVirtualDeviceData] = useState<Record<string, Record<string, string | number>>>({
    temp01: { temperature: 24.6, humidity: 58 },
    light01: { light: 450 },
    co201: { co2: 620 },
    fan01: { fanStatus: 'on' },
    relay01: { relayStatus: 'on' },
    gw01: { gatewayStatus: 'online' },
    pump01: { pumpStatus: 'on' },
    lamp01: { lampStatus: 'off' }
  });

  const VIRTUAL_DEVICES = useMemo(() => [
    { id: 'temp01', name: '温湿度传感器 temp01', type: '传感器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'temperature', name: '温度', unit: '℃', val: 24.6, type: '数值' }, { id: 'humidity', name: '湿度', unit: '%', val: 58, type: '数值' }] },
    { id: 'light01', name: '光照传感器 light01', type: '传感器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'light', name: '光照', unit: 'Lux', val: 450, type: '数值' }] },
    { id: 'co201', name: '二氧化碳传感器 co201', type: '传感器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'co2', name: 'CO2', unit: 'ppm', val: 620, type: '数值' }] },
    { id: 'fan01', name: '风机 fan01', type: '执行器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'fanStatus', name: '风机状态', unit: '-', val: 'on', type: '枚举' }] },
    { id: 'relay01', name: '继电器 relay01', type: '执行器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'relayStatus', name: '继电器状态', unit: '-', val: 'on', type: '枚举' }] },
    { id: 'gw01', name: 'Modbus网关 gw01', type: '网关', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'gatewayStatus', name: '网关状态', unit: '-', val: 'online', type: '枚举' }] },
    { id: 'pump01', name: '水泵 pump01', type: '执行器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'pumpStatus', name: '水泵状态', unit: '-', val: 'on', type: '枚举' }] },
    { id: 'lamp01', name: '补光灯 lamp01', type: '执行器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'lampStatus', name: '补光灯状态', unit: '-', val: 'off', type: '枚举' }] }
  ], []);

  const [virtualFieldMappingConfig, setVirtualFieldMappingConfig] = useState<Record<string, Record<string, any>>>({});

  const handleStartVirtualData = () => {
    if (virtualSimulationReceiveStatus === "接收中") return;
    setVirtualSimulationReceiveStatus("接收中");
    setVirtualSimulationConnectionStatus("接收中");
    showToast("开始接收工程虚拟仿真平台数据。");
    addLog("开始接收工程虚拟仿真平台数据");
    
    // add initial log
    setVirtualDataReceiveRecords(prev => {
        let rs = [...prev];
        threeDSceneObjects.forEach(obj => {
           const conf = sceneObjectDataConfig[obj.id];
           if (conf?.dataMode === '动态数据' && conf.dynamicDataConfig?.sourceType === '工程虚拟仿真平台数据' && conf.dynamicDataConfig.deviceId) {
              const dyn = conf.dynamicDataConfig;
              (dyn.fields || []).forEach((field: string) => {
                 const nowStr = \`\${new Date().getHours().toString().padStart(2, '0')}:\${new Date().getMinutes().toString().padStart(2, '0')}:\${new Date().getSeconds().toString().padStart(2, '0')}\`;
                 rs.unshift({ time: nowStr, modelName: obj.name, targetDeviceName: dyn.deviceName || dyn.deviceId, deviceId: dyn.deviceId, field: field, val: virtualDeviceData[dyn.deviceId]?.[field], unit: '', type: '已接收', source: '工程虚拟仿真平台' });
              });
           }
        });
        return rs;
    });

    const timer = setInterval(() => {
      setVirtualDeviceData(prevData => {
        const newData = { ...prevData };
        Object.keys(newData).forEach(devId => {
          newData[devId] = { ...newData[devId] };
          Object.keys(newData[devId]).forEach(propId => {
            if (typeof newData[devId][propId] === 'number') {
              let val = newData[devId][propId] as number;
              val += (Math.random() * 2 - 1);
              newData[devId][propId] = parseFloat(val.toFixed(1));
            } else if (typeof newData[devId][propId] === 'string' && ['on', 'off'].includes(newData[devId][propId] as string)) {
              if (Math.random() > 0.8) {
                newData[devId][propId] = newData[devId][propId] === 'on' ? 'off' : 'on';
              }
            }
          });
        });
        return newData;
      });
      
      setDataRefreshCounter(c => c + 1);

      setVirtualDataReceiveRecords(prevRecords => {
         const newRecs = [...prevRecords];
         threeDSceneObjects.forEach(obj => {
           const conf = sceneObjectDataConfig[obj.id];
           if (conf?.dataMode === '动态数据' && conf.dynamicDataConfig?.sourceType === '工程虚拟仿真平台数据' && conf.dynamicDataConfig.deviceId) {
              const dyn = conf.dynamicDataConfig;
              (dyn.fields || []).forEach((field: string) => {
                 const nowStr = \`\${new Date().getHours().toString().padStart(2, '0')}:\${new Date().getMinutes().toString().padStart(2, '0')}:\${new Date().getSeconds().toString().padStart(2, '0')}\`;
                 newRecs.unshift({ 
                   time: nowStr, modelName: obj.name, targetDeviceName: dyn.deviceName || dyn.deviceId, 
                   deviceId: dyn.deviceId, field: field, val: '更新', unit: '', type: '已接收', source: '工程虚拟仿真平台' 
                 });
              });
           }
        });
        return newRecs;
      });

    }, 2000);
    setDataReceiveTimer(timer);
  };
`;

txt = txt.replace('const [dataReceiveStatus, setDataReceiveStatus] = useState<"未连接" | "已连接" | "接收中">("未连接");', virtualSimState + '\\n  const [dataReceiveStatus, setDataReceiveStatus] = useState<"未连接" | "已连接" | "接收中">("未连接");');

fs.writeFileSync(file, txt);
console.log("Virtual State injected.");
