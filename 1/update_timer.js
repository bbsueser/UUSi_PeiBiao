import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

const updatedTimerLogic = `
    const timer = setInterval(() => {
      let updatedDataRef = {};
      setVirtualDeviceData(prevData => {
        const newData = { ...prevData };
        Object.keys(newData).forEach(devId => {
          newData[devId] = { ...newData[devId] };
          Object.keys(newData[devId]).forEach(propId => {
            if (typeof newData[devId][propId] === 'number') {
              let val = newData[devId][propId];
              val += (Math.random() * 2 - 1);
              newData[devId][propId] = parseFloat(val.toFixed(1));
            } else if (typeof newData[devId][propId] === 'string' && ['on', 'off'].includes(newData[devId][propId])) {
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
`;

const timerLogicOld = `const timer = setInterval(() => {
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

    }, 2000);`;

txt = txt.replace(timerLogicOld, updatedTimerLogic);
fs.writeFileSync(file, txt);
console.log("Timer updated.");
