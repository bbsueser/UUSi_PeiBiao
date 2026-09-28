const fs = require('fs');

let txt = fs.readFileSync('src/components/TwoDDesigner.tsx', 'utf-8');

// replace some global UI strings
txt = txt.replace(/"物联网监控看板"/g, '"工程设备运行监控看板"');
txt = txt.replace(/>物联网监控看板</g, '>工程设备运行监控看板<');
txt = txt.replace(/云平台配置/g, '工程仿真数据');
txt = txt.replace(/云平台连接状态/g, '平台连接状态');
txt = txt.replace(/物联网综合实训云平台/g, '工程虚拟仿真平台');
txt = txt.replace(/环境监测终端/g, '智能产线虚拟仿真');
txt = txt.replace(/云平台数据绑定日志/g, '仿真数据同步记录');
txt = txt.replace(/云平台已连接/g, '工程虚拟仿真平台连接成功');
txt = txt.replace(/云平台设备数据/g, '仿真设备数据');

// top bar titles
txt = txt.replace(/<span>当前应用：<\/span>/, '<span>当前应用：</span>');
// just standard replacements
txt = txt.replace(/<span className="text-white font-bold text-sm">物联网监控看板<\/span>/g, '<span className="text-white font-bold text-sm">工程设备运行监控看板</span>');
txt = txt.replace(/<span className="text-emerald-500 font-bold bg-emerald-500\/10 px-2 py-0.5 rounded ml-2 text-xs">云平台已连接<\/span>/g, '<span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded ml-2 text-xs">已连接</span>');
txt = txt.replace(/<span className="text-white">云平台已连接<\/span>/g, '<span className="text-white">已连接</span>');

// left layer panel replacements
// replace initial LayerList
const newLayerList = `  const [layerList, setLayerList] = useState([
    { id: 'layer-title', name: '页面标题卡片', type: '文本卡片', groupId: 'group-bg', visible: true, locked: true },
    { id: 'layer-conn', name: '仿真平台连接状态卡片', type: '状态卡片', groupId: 'group-data', visible: true, locked: false },
    { id: 'layer-temp', name: '输送带速度卡片', type: '数值卡片', groupId: 'group-data', visible: true, locked: false },
    { id: 'layer-hum', name: '风机转速卡片', type: '数值卡片', groupId: 'group-data', visible: true, locked: false },
    { id: 'layer-relay', name: '阀门开度卡片', type: '数值卡片', groupId: 'group-data', visible: true, locked: false },
    { id: 'layer-fan', name: '水泵压力卡片', type: '数值卡片', groupId: 'group-data', visible: true, locked: false },
    { id: 'layer-gw', name: '机械臂状态卡片', type: '状态卡片', groupId: 'group-data', visible: true, locked: false },
    { id: 'layer-chart1', name: '设备运行趋势图', type: '图表组件', groupId: 'group-data', visible: true, locked: false },
    { id: 'layer-table', name: '仿真设备状态表格', type: '表格组件', groupId: 'group-data', visible: true, locked: false },
    { id: 'layer-alarm', name: '设备告警信息卡片', type: '告警组件', groupId: 'group-data', visible: true, locked: false },
    { id: 'layer-topo', name: '设备拓扑示意图', type: '图片组件', groupId: 'group-bg', visible: true, locked: true }
  ]);`;
const layerStart = txt.indexOf('  const [layerList, setLayerList]');
const layerEnd = txt.indexOf('  const [selectedLayerId', layerStart);
txt = txt.substring(0, layerStart) + newLayerList + '\n\n' + txt.substring(layerEnd);

// right dataConfig properties
txt = txt.replace(/温湿度采集终端 TH-001/g, '输送带设备 CONVEYOR-01');

// dataSource configuration panel string
txt = txt.replace(/>产品名称</g, '>当前项目<');
txt = txt.replace(/>设备名称</g, '>当前场景<');
txt = txt.replace(/测试连接<\/button>/g, '测试连接</button>\n                       <button onClick={syncCloudDevices} className="py-2 bg-[#1E1E1E] hover:bg-[#2A2D2E] text-zinc-300 border border-[#333] rounded text-xs font-bold transition-colors">同步仿真设备</button>');

fs.writeFileSync('src/components/TwoDDesigner.tsx', txt);
console.log('UI updated');
