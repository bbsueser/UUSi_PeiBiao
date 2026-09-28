import fs from 'fs';
const file = 'src/components/ThreeDDesigner.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace('const [threeDDesignerView, setThreeDDesignerView] = useState<"appList" | "editor">(initialView);', 'const [threeDDesignerView, setThreeDDesignerView] = useState<"appList" | "editor">("editor");');

txt = txt.replace('const [threeDSceneObjects, setThreeDSceneObjects] = useState<any[]>([]);', \`const [threeDSceneObjects, setThreeDSceneObjects] = useState<any[]>([
    { id: 'obj_init_1', name: '温湿度传感器', type: '感知类设备', scene: '智慧农业', category: '设备模型' },
    { id: 'obj_init_2', name: '风机', type: '控制类设备', scene: '智慧农业', category: '电器模型' },
    { id: 'obj_init_3', name: '能耗看板', type: '数据组件', scene: '智慧大屏', category: '数据组件' }
  ]);\`);

txt = txt.replace('const [selectedSceneObject, setSelectedSceneObject] = useState<any>(null);', \`const [selectedSceneObject, setSelectedSceneObject] = useState<any>({ id: 'obj_init_1', name: '温湿度传感器', type: '感知类设备', scene: '智慧农业', category: '设备模型' });\`);

txt = txt.replace('const [sceneObjectPropertyConfig, setSceneObjectPropertyConfig] = useState<Record<string, any>>({});', \`const [sceneObjectPropertyConfig, setSceneObjectPropertyConfig] = useState<Record<string, any>>({
    obj_init_1: {
      labelConfig: { enabled: true, title: '温湿度传感器', content: '温度 24.6 ℃，湿度 58%', type: '名称标签', position: '模型上方', style: '卡片样式', showIcon: true, showDevice: true, showTime: true, applied: true },
      jumpButtonConfig: { enabled: true, btnName: '查看设备详情', position: '标签下方', jumpType: '数据详情', target: '设备详情面板', openType: '右侧面板打开', applied: true },
      anchorConfig: { enabled: true, name: '温室环境监测点', type: '设备锚点', posX: 120, posY: 0, posZ: 80, rotX: 0, rotY: 45, rotZ: 0, scale: 1.2, desc: '快速定位到温室环境监测设备区域。', applied: true },
      voiceConfig: { enabled: true, name: '温湿度传感器语音说明', type: '模型说明', source: '上传语音文件', file: {name: 'sensor_intro.mp3', format: 'mp3', size: '1.8 MB', duration: '12 秒'}, text: '这是温湿度传感器', playMode: '点击模型播放', showBtn: true, parseStatus: '解析成功', playStatus: '未播放', progress: '00:00 / 00:12', applied: true }
    },
    obj_init_2: {
      labelConfig: { applied: true }, anchorConfig: { applied: true }
    },
    obj_init_3: {
      labelConfig: { applied: true }, jumpButtonConfig: { applied: true }
    }
  });\`);

txt = txt.replace('const [propertyConfigRecords, setPropertyConfigRecords] = useState<any[]>([]);', \`const [propertyConfigRecords, setPropertyConfigRecords] = useState<any[]>([
    { time: '10:45:10', modelName: '温湿度传感器', type: '显示标签', content: '模型上方卡片标签', result: '成功', user: '学生1' },
    { time: '10:46:20', modelName: '温湿度传感器', type: '跳转按钮', content: '查看设备详情', result: '成功', user: '学生1' },
    { time: '10:47:30', modelName: '温湿度传感器', type: '导航锚点', content: '温室环境监测点', result: '成功', user: '学生1' },
    { time: '10:48:40', modelName: '温湿度传感器', type: '语音配置', content: 'sensor_intro.mp3', result: '成功', user: '学生1' }
  ]);\`);


fs.writeFileSync(file, txt);
console.log("Mock data prepopulated.");
