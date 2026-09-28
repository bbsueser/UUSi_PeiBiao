import fs from 'fs';

const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const regex1 = /const handleStartVirtualData = \(\) => \{[\s\S]*?(?=const \[dataReceiveStatus)/;

const newBlock = `const handleStartVirtualData = () => {
    if (virtualSimulationReceiveStatus === "接收中") return;
    setVirtualSimulationReceiveStatus("接收中");
    setVirtualSimulationConnectionStatus("已连接");
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
                 let devInfo = VIRTUAL_DEVICES.find(d => d.id === dyn.deviceId);
                 let propInfo = devInfo?.props.find(p => p.id === field);
                 rs.unshift({ time: nowStr, modelName: obj.name, targetDeviceName: devInfo?.name || dyn.deviceId, deviceId: dyn.deviceId, field: field, val: virtualDeviceData[dyn.deviceId]?.[field], unit: propInfo?.unit || '', type: '已接收', source: '工程虚拟仿真平台' });
              });
           }
        });
        return rs;
    });

    const sequenceMap: Record<string, string[] | number[]> = {
      temperature: [24.6, 24.8, 25.1, 25.0],
      humidity: [58, 59, 57, 60],
      light: [450, 465, 472, 460],
      co2: [620, 635, 650, 628],
      fanStatus: ['off', 'running', 'running', 'off'],
      relayStatus: ['off', 'on', 'on', 'off']
    };
    
    let counter = 0;
    const timer = setInterval(() => {
      counter++;
      let updatedDataRef: any = {};
      setVirtualDeviceData(prevData => {
        const newData = { ...prevData };
        Object.keys(newData).forEach(devId => {
          newData[devId] = { ...newData[devId] };
          Object.keys(newData[devId]).forEach(propId => {
            if (sequenceMap[propId]) {
              const seq = sequenceMap[propId];
              newData[devId][propId] = seq[counter % seq.length];
            } else if (typeof newData[devId][propId] === 'number') {
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
        updatedDataRef = newData;
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
                 
                 let devInfo = VIRTUAL_DEVICES.find(d => d.id === dyn.deviceId);
                 let propInfo = devInfo?.props.find(p => p.id === field);

                 const lastVal = updatedDataRef[dyn.deviceId]?.[field] ?? '-';

                 newRecs.unshift({ 
                   time: nowStr, modelName: obj.name, targetDeviceName: devInfo?.name || dyn.deviceId, 
                   deviceId: dyn.deviceId, field: field, val: lastVal, unit: propInfo?.unit || '', type: '已接收', source: '工程虚拟仿真平台' 
                 });
              });
           }
         });
         return newRecs.slice(0, 50); // limit 50
      });

    }, 2000);

    setDataReceiveTimer(timer);
  };

  `;

txt = txt.replace(regex1, newBlock);
fs.writeFileSync(file, txt);
console.log('Fixed handleStartVirtualData');
