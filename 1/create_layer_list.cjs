const fs = require('fs');
let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

const newLayerList = `  const [layerList, setLayerList] = useState([
    { id: 'layer-title', name: '页面标题卡片', type: '标题组件', groupId: 'group-bg', visible: true, locked: true, x: 50, y: 30, width: 600, height: 60, zIndex: 10 },
    { id: 'layer-conn', name: '仿真平台连接状态卡片', type: '状态卡片', groupId: 'group-data', visible: true, locked: false, x: 50, y: 120, width: 350, height: 100, zIndex: 11 },
    { id: 'layer-temp', name: '输送带速度卡片', type: '数值卡片', groupId: 'group-data', visible: true, locked: false, x: 50, y: 240, width: 350, height: 120, zIndex: 12 },
    { id: 'layer-hum', name: '风机转速卡片', type: '数值卡片', groupId: 'group-data', visible: true, locked: false, x: 50, y: 380, width: 350, height: 120, zIndex: 13 },
    { id: 'layer-relay', name: '阀门开度卡片', type: '进度卡片', groupId: 'group-data', visible: true, locked: false, x: 50, y: 520, width: 350, height: 120, zIndex: 14 },
    { id: 'layer-fan', name: '水泵压力卡片', type: '数值卡片', groupId: 'group-data', visible: true, locked: false, x: 50, y: 660, width: 350, height: 120, zIndex: 15 },
    { id: 'layer-gw', name: '机械臂状态卡片', type: '状态卡片', groupId: 'group-data', visible: true, locked: false, x: 50, y: 800, width: 350, height: 120, zIndex: 16 },
    { id: 'layer-chart1', name: '设备运行趋势图', type: '图表组件', groupId: 'group-data', visible: true, locked: false, x: 450, y: 660, width: 900, height: 260, zIndex: 18 },
    { id: 'layer-table', name: '仿真设备状态表格', type: '表格组件', groupId: 'group-data', visible: true, locked: false, x: 1400, y: 120, width: 450, height: 400, zIndex: 19 },
    { id: 'layer-alarm', name: '设备告警信息卡片', type: '告警组件', groupId: 'group-data', visible: true, locked: false, x: 1400, y: 540, width: 450, height: 380, zIndex: 20 },
    { id: 'layer-topo', name: '设备拓扑示意图', type: '图片组件', groupId: 'group-bg', visible: true, locked: true, x: 450, y: 120, width: 900, height: 500, zIndex: 5 }
  ]);`;

const layerStart = txt.indexOf('  const [layerList, setLayerList]');
const layerEnd = txt.indexOf('  const [selectedLayerId', layerStart);
txt = txt.substring(0, layerStart) + newLayerList + '\n\n' + txt.substring(layerEnd);

fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
console.log('layers generated');
