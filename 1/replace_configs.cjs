const fs = require('fs');
let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const newConfigs = `  const [componentConfigs, setComponentConfigs] = useState<Record<string, any>>({
     'layer-conn': { dataMode: 'dynamic', dataSource: 'cloud-001', deviceId: '', dataPoint: '' },
     'layer-temp': { dataMode: 'dynamic', dataSource: 'cloud-001', deviceId: 'conveyor-01', dataPoint: 'speed' },
     'layer-hum': { dataMode: 'dynamic', dataSource: 'cloud-001', deviceId: 'fan-01', dataPoint: 'speed' },
     'layer-relay': { dataMode: 'dynamic', dataSource: 'cloud-001', deviceId: 'valve-01', dataPoint: 'openRate' },
     'layer-fan': { dataMode: 'dynamic', dataSource: 'cloud-001', deviceId: 'pump-01', dataPoint: 'pressure' },
     'layer-gw': { dataMode: 'dynamic', dataSource: 'cloud-001', deviceId: 'robot-01', dataPoint: 'action' },
     'layer-alarm': { dataMode: 'dynamic', dataSource: 'cloud-001', deviceId: 'light-01', dataPoint: 'alarm' }
  });`;

const start = txt.indexOf('  const [componentConfigs, setComponentConfigs] = useState<Record<string, any>>({');
const end = txt.indexOf('  });', start);

if (start !== -1 && end !== -1) {
    txt = txt.substring(0, start) + newConfigs + txt.substring(end + 5);
    fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
    console.log('updated initial configs');
}
