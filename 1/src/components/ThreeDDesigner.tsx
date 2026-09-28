import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, Search, MoreHorizontal, LayoutTemplate, Copy, Trash2, Download, Upload, 
  Settings, Play, Save, RotateCcw, Box, Home, Cpu, Lightbulb, Hexagon,
  Image as ImageIcon, HardDrive, MonitorPlay, ChevronDown, Check, X, User,
  FileBox, Info, ShieldCheck, CheckCircle2, CopyIcon, Filter, MapPin, Volume2,
  Fan, Bell, Network, Droplets, Activity, RefreshCw, Lock, Unlock, GripVertical
} from "lucide-react";

const DEVICE_MODELS = [
  ...['温湿度传感器', '光照传感器', 'CO₂ 传感器', '土壤湿度传感器', '土壤温度传感器', '空气质量传感器', 'PM2.5 传感器', '烟雾传感器', '水浸传感器', '人体红外传感器', '门磁传感器', '压力传感器', '液位传感器', '风速传感器', '雨量传感器'].map(name => ({ name, type: '感知类设备', scene: '智慧家居、智慧农业', bindStatus: '可添加', category: '设备模型' })),
  ...['继电器', '多路继电器', '调光控制器', '窗帘控制器', '灯光控制器', '风机控制器', '水泵控制器', '阀门控制器', '温控面板', '情景模式开关', '三位智能开关', '红外转发器', '电机控制器', '门禁控制器', '灌溉控制器'].map(name => ({ name, type: '控制类设备', scene: '智慧家居、智慧农业、智慧园区', bindStatus: '未绑定', category: '设备模型' })),
  ...['物联网网关', 'Modbus 网关', 'MQTT 网关', 'LoRa 网关', 'ZigBee 网关', '边缘计算网关', '串口服务器', '协议转换器', '数据采集器', '无线通信模块'].map(name => ({ name, type: '网关与通信类设备', scene: '智慧家居、智慧工业、智慧园区', bindStatus: '可添加', category: '设备模型' })),
  ...['声光报警器', '摄像头', '红外摄像机', '门禁读卡器', '电子围栏', '紧急按钮', '烟感报警器', '可燃气体报警器', '入侵探测器', '人脸识别终端'].map(name => ({ name, type: '安防类设备', scene: '智慧安防、智慧社区', bindStatus: '未绑定', category: '设备模型' })),
  ...['智能电表', '智能水表', '智能气表', '能耗采集终端', '配电监测终端', '电流互感器', '电压采集模块', '用电安全监测器', '配电柜监控器', '能耗数据网关'].map(name => ({ name, type: '能耗与仪表类设备', scene: '智慧能耗、智慧园区', bindStatus: '未绑定', category: '设备模型' }))
];

const ELECTRICAL_MODELS = [
  '智能空调', '智能落地扇', '智能水箱', '智能洗衣机', '智能热水器', '智能微波炉', '投影幕布', '幕布控制器', '投影控制器', '音箱', '音箱功放主机', '补光灯', '水泵', '风机', '新风机', '加湿器', '除湿机', '智能照明灯'
].map(name => ({ name, type: '智能电器', scene: '智慧家居、智慧园区', bindStatus: '未绑定', category: '电器模型' }));

const SOFT_MODELS = [
  '窗帘', '窗户', '入户门', '沙发', '茶几', '电视柜', '桌子', '椅子', '床', '货架', '展示柜', '植物盆栽'
].map(name => ({ name, type: '居室软装', scene: '所有场景', bindStatus: '不可绑定', category: '软装单体' }));

const ROS_MODELS = [
  'ROS机械小车', 'ROS翻斗小车', 'ROS地图', 'ROS路灯', 'ROS交通灯', 'ROS水果篮'
].map(name => ({ name, type: 'ROS仿真模型', scene: 'ROS仿真', bindStatus: '可添加', category: 'ROS小车' }));

const ALL_LIBRARY_MODELS = [...DEVICE_MODELS, ...ELECTRICAL_MODELS, ...SOFT_MODELS, ...ROS_MODELS];

export function ThreeDDesigner({ onClose, initialView = "appList" }: { onClose?: () => void, initialView?: "appList" | "editor" }) {
  const [threeDDesignerView, setThreeDDesignerView] = useState<"appList" | "editor">("editor");
  
  // App List Data
  const [threeDAppList, setThreeDAppList] = useState([
    { 
      id: "3d-1", 
      name: "智慧温室 3D 监控应用", 
      createTime: "2026-06-08 10:11:09",
      status: "未发布", 
      cover: "greenhouse" 
    },
    { 
      id: "3d-2", 
      name: "智慧家居 3D 展示应用", 
      createTime: "2026-06-08 10:20:30",
      status: "已发布", 
      cover: "home" 
    }
  ]);

  const [selectedThreeDApp, setSelectedThreeDApp] = useState<any>(null);

  // Import/Export States
  const [importDrawerVisible, setImportDrawerVisible] = useState(false);
  const [exportDrawerVisible, setExportDrawerVisible] = useState(false);
  
  const [selectedImportFile, setSelectedImportFile] = useState<string | null>(null);
  const [importPackageInfo, setImportPackageInfo] = useState<any>(null);
  const [importValidationResults, setImportValidationResults] = useState<any>(null);
  const [importConfig, setImportConfig] = useState({
    appName: "智慧温室 3D 监控应用 - 导入版",
    importMethod: "新建应用",
    conflictStrategy: "自动重命名",
    contents: { scene: true, models: true, components: true, bindings: true, ds: true, scripts: true, meta: true }
  });

  const [exportConfig, setExportConfig] = useState({
    exportApp: null as any,
    format: "3D 应用包",
    contents: { scene: true, models: true, components: true, bindings: true, ds: true, scripts: true, meta: true },
    filename: "greenhouse_3d_app_v1.0.0.zip",
    version: "v1.0.0"
  });
  const [exportResult, setExportResult] = useState<any>(null);
  
  const [importExportRecords, setImportExportRecords] = useState([
    { id: 1, time: "10:50:20", type: "导出应用", appName: "智慧温室 3D 监控应用", filename: "greenhouse_3d_app_v1.0.0.zip", format: "3D 应用包", status: "成功", user: "学生1" },
    { id: 2, time: "10:42:10", type: "导入应用", appName: "智慧家居 3D 展示应用", filename: "home_3d_app.zip", format: "ZIP 资源包", status: "成功", user: "学生1" },
    { id: 3, time: "10:35:30", type: "解析应用包", appName: "智慧温室 3D 监控应用 - 导入版", filename: "greenhouse_3d_app.zip", format: "3D 应用包", status: "成功", user: "学生1" },
    { id: 4, time: "10:30:00", type: "下载导出包", appName: "智慧家居 3D 展示应用", filename: "home_3d_app.json", format: "JSON 配置包", status: "成功", user: "学生1" }
  ]);
  
  // Designer States
  const [selectedDesignerTool, setSelectedDesignerTool] = useState("模型库");
  const [selectedResourceCategory, setSelectedResourceCategory] = useState("智慧家居");
  const [threeDSceneObjects, setThreeDSceneObjects] = useState<any[]>([
    { id: 'obj_init_1', name: '温湿度传感器', type: '感知类设备', scene: '智慧农业', category: '设备模型' },
    { id: 'obj_init_2', name: '风机', type: '控制类设备', scene: '智慧农业', category: '电器模型' },
    { id: 'obj_init_3', name: '水泵', type: '控制类设备', scene: '智慧农业', category: '电器模型' },
    { id: 'obj_init_4', name: '补光灯', type: '控制类设备', scene: '智慧农业', category: '电器模型' },
    { id: 'obj_init_5', name: 'Modbus网关', type: '通信设备', scene: '智慧农业', category: '网关' },
    { id: 'obj_init_6', name: '报警灯', type: '控制类设备', scene: '智慧农业', category: '电器模型' }
  ]);
  const [selectedSceneObject, setSelectedSceneObject] = useState<any>({ id: 'obj_init_2', name: '风机', type: '控制类设备', scene: '智慧农业', category: '电器模型' });
  const [sceneObjectLogs, setSceneObjectLogs] = useState([
    { time: "10:53:00", msg: "暂停接收工程虚拟仿真平台数据" },
    { time: "10:52:22", msg: "接收仿真数据：humidity = 58 %" },
    { time: "10:52:20", msg: "接收仿真数据：temperature = 32.5 ℃" },
    { time: "10:52:00", msg: "开始接收工程虚拟仿真平台数据" },
    { time: "10:51:20", msg: "绑定仿真数据项：temperature、humidity" },
    { time: "10:51:00", msg: "绑定仿真设备：风机 fan01" },
    { time: "10:50:40", msg: "刷新工程虚拟仿真平台设备列表" },
    { time: "10:50:20", msg: "连接工程虚拟仿真平台成功" },
    { time: "10:50:00", msg: "进入 3D 应用设计工作台" }
  ]);
  const [currentSceneName, setCurrentSceneName] = useState("主场景");
  const [designerSearchKeyword, setDesignerSearchKeyword] = useState("");
  
  // Model Library States
  const [modelTypeFilter, setModelTypeFilter] = useState("全部");
  const [modelSceneFilter, setModelSceneFilter] = useState("全部");
  const [modelStatusFilter, setModelStatusFilter] = useState("全部");
  const [modelSearchKeyword, setModelSearchKeyword] = useState("");
  const [selectedModel, setSelectedModel] = useState<any>(null);
  
  // Data Configuration States
  const [dataReceiveRecords, setDataReceiveRecords] = useState<any[]>([]);
  const [activePropertyTab, setActivePropertyTab] = useState<"基础属性" | "数据配置" | "显示标签" | "状态动效" | "跳转按钮" | "导航锚点" | "语音配置">("状态动效");
  const [sceneObjectPropertyConfig, setSceneObjectPropertyConfig] = useState<Record<string, any>>({
    obj_init_1: {
      labelConfig: { enabled: true, title: '温湿度传感器', content: '温度 32.5 ℃，湿度 58%', type: '名称标签', position: '模型上方', style: '卡片样式', showIcon: true, showDevice: true, showTime: true, applied: true },
      jumpButtonConfig: { enabled: true, btnName: '查看设备详情', position: '标签下方', jumpType: '数据详情', target: '设备详情面板', openType: '右侧面板打开', applied: true },
      anchorConfig: { enabled: true, name: '温室环境监测点', type: '设备锚点', posX: 120, posY: 0, posZ: 80, rotX: 0, rotY: 45, rotZ: 0, scale: 1.2, desc: '快速定位到温室环境监测设备区域。', applied: true },
      voiceConfig: { enabled: true, name: '温湿度传感器语音说明', type: '模型说明', source: '上传语音文件', file: {name: 'sensor_intro.mp3', format: 'mp3', size: '1.8 MB', duration: '12 秒'}, text: '这是温湿度传感器...', playMode: '点击模型播放', showBtn: true, parseStatus: '解析成功', playStatus: '未播放', progress: '00:00 / 00:12', applied: true }
    },
    obj_init_2: {
      labelConfig: { enabled: true, title: '风机', content: '运行中', type: '名称标签', position: '模型上方', style: '卡片样式', showIcon: true, showDevice: true, showTime: true, applied: true },
      anchorConfig: { applied: true }
    },
    obj_init_3: {
      labelConfig: { enabled: true, title: '水泵', content: '运行中', type: '名称标签', position: '模型上方', style: '卡片样式', showIcon: true, showDevice: true, showTime: true, applied: true },
      jumpButtonConfig: { applied: true }
    },
    obj_init_4: {
      labelConfig: { enabled: true, title: '补光灯', content: '开启 | 亮度 85%', type: '名称标签', position: '模型上方', style: '卡片样式', showIcon: true, showDevice: true, showTime: true, applied: true }
    },
    obj_init_5: {
      labelConfig: { enabled: true, title: 'Modbus网关', content: '在线', type: '名称标签', position: '模型上方', style: '卡片样式', showIcon: true, showDevice: true, showTime: true, applied: true }
    },
    obj_init_6: {
      labelConfig: { enabled: true, title: '报警灯', content: '正常', type: '名称标签', position: '模型上方', style: '卡片样式', showIcon: true, showDevice: true, showTime: true, applied: true }
    }
  });
  const [propertyConfigRecords, setPropertyConfigRecords] = useState<any[]>([
    { time: '10:45:10', modelName: '温湿度传感器', type: '显示标签', content: '模型上方卡片标签', result: '成功', user: '学生1' },
    { time: '10:46:20', modelName: '温湿度传感器', type: '跳转按钮', content: '查看设备详情', result: '成功', user: '学生1' },
    { time: '10:47:30', modelName: '温湿度传感器', type: '导航锚点', content: '温室环境监测点', result: '成功', user: '学生1' },
    { time: '10:48:40', modelName: '温湿度传感器', type: '语音配置', content: 'sensor_intro.mp3', result: '成功', user: '学生1' }
  ]);
  const [targetPanelVisible, setTargetPanelVisible] = useState<{ visible: boolean, title: string, data: any } | null>(null);
  const [navigationAnchors, setNavigationAnchors] = useState<any[]>([]);
  
  // Draggable Canvas Data Widgets States
  const [canvasDataWidgets, setCanvasDataWidgets] = useState<any[]>([
    {
      id: "widget-temp01",
      objectId: "obj_init_1",
      modelName: "温湿度传感器",
      dataSource: "工程虚拟仿真平台",
      deviceId: "temp01",
      fields: ["temperature", "humidity"],
      x: 420,
      y: 210,
      zIndex: 12,
      isDragging: false,
      locked: false,
      followModel: true
    },
    {
      id: "widget-fan01",
      objectId: "obj_init_2",
      modelName: "风机",
      dataSource: "工程虚拟仿真平台",
      deviceId: "fan01",
      fields: ["fanStatus"],
      x: 560,
      y: 260,
      zIndex: 12,
      isDragging: false,
      locked: false,
      followModel: true
    },
    {
      id: "widget-lamp01",
      objectId: "obj_init_4",
      modelName: "补光灯",
      dataSource: "工程虚拟仿真平台",
      deviceId: "lamp01",
      fields: ["lampStatus", "brightness"],
      x: 680,
      y: 190,
      zIndex: 12,
      isDragging: false,
      locked: false,
      followModel: true
    }
  ]);
  const [draggingDataWidgetId, setDraggingDataWidgetId] = useState<string | null>(null);
  const [selectedDataWidgetId, setSelectedDataWidgetId] = useState<string | null>(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState<"config" | "operation">("config");
  const [operationRecords, setOperationRecords] = useState<any[]>([
    { id: 1, time: "10:50:00", modelName: "温湿度传感器", type: "数据标签", content: "已添加默认温度、湿度标签", result: "成功", user: "学生1" },
    { id: 2, time: "10:50:15", modelName: "风机", type: "数据标签", content: "已添加默认风机状态标签", result: "成功", user: "学生1" },
    { id: 3, time: "10:50:30", modelName: "补光灯", type: "数据标签", content: "已添加默认补光灯状态标签", result: "成功", user: "学生1" }
  ]);

  const [tempWidgetX, setTempWidgetX] = useState<number>(460);
  const [tempWidgetY, setTempWidgetY] = useState<number>(220);
  const [tempWidgetZ, setTempWidgetZ] = useState<number>(12);
  const [tempWidgetFollow, setTempWidgetFollow] = useState<boolean>(true);
  const [tempWidgetLocked, setTempWidgetLocked] = useState<boolean>(false);

  useEffect(() => {
    if (selectedSceneObject) {
      const w = canvasDataWidgets.find(x => x.objectId === selectedSceneObject.id);
      if (w) {
        setTempWidgetX(Math.round(w.x));
        setTempWidgetY(Math.round(w.y));
        setTempWidgetZ(w.zIndex ?? 12);
        setTempWidgetFollow(w.followModel ?? true);
        setTempWidgetLocked(w.locked ?? false);
      } else {
        setTempWidgetX(460);
        setTempWidgetY(220);
        setTempWidgetZ(12);
        setTempWidgetFollow(true);
        setTempWidgetLocked(false);
      }
    }
  }, [selectedSceneObject, canvasDataWidgets]);

  const handleWidgetPointerDown = (e: React.PointerEvent, widgetId: string) => {
    const widget = canvasDataWidgets.find(w => w.id === widgetId);
    if (!widget || widget.locked) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedDataWidgetId(widgetId);
    
    const obj = threeDSceneObjects.find(o => o.id === widget.objectId);
    if (obj) {
      setSelectedSceneObject(obj);
    }
    
    // Log start drag
    const timeStr = new Date().toTimeString().split(' ')[0];
    const startMsg = `开始拖动${widget.modelName}数据标签`;
    setOperationRecords(prev => [
      {
        id: Date.now(),
        time: timeStr,
        modelName: widget.modelName,
        type: "拖动开始",
        content: startMsg,
        result: "进行中",
        user: "学生1"
      },
      ...prev
    ]);

    const initialMouseX = e.clientX;
    const initialMouseY = e.clientY;
    const initialWidgetX = widget.x;
    const initialWidgetY = widget.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      
      const dx = moveEvent.clientX - initialMouseX;
      const dy = moveEvent.clientY - initialMouseY;
      
      let nextX = initialWidgetX + dx;
      let nextY = initialWidgetY + dy;
      
      // Constrain to container
      const container = document.getElementById("three-d-canvas-container");
      if (container) {
        const rect = container.getBoundingClientRect();
        const widgetWidth = 160;
        const widgetHeight = 120;
        nextX = Math.max(0, Math.min(nextX, rect.width - widgetWidth));
        nextY = Math.max(0, Math.min(nextY, rect.height - widgetHeight));
      }
      
      setCanvasDataWidgets(prev => prev.map(w => 
        w.id === widgetId 
          ? { ...w, x: nextX, y: nextY, isDragging: true }
          : w
      ));
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      upEvent.preventDefault();
      upEvent.stopPropagation();
      
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      
      setCanvasDataWidgets(prev => {
        const updated = prev.map(w => 
          w.id === widgetId 
            ? { ...w, isDragging: false }
            : w
        );
        
        const widgetState = updated.find(w => w.id === widgetId);
        if (widgetState) {
          const timeStrUp = new Date().toTimeString().split(' ')[0];
          const endMsg = `${widgetState.modelName}数据标签移动到 X:${Math.round(widgetState.x)} Y:${Math.round(widgetState.y)}`;
          // Add end log
          setOperationRecords(prevLogs => [
            {
              id: Date.now(),
              time: timeStrUp,
              modelName: widgetState.modelName,
              type: "拖动结束",
              content: endMsg,
              result: "成功",
              user: "学生1"
            },
            ...prevLogs
          ]);
          showToast(endMsg);
        }
        return updated;
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp, { passive: false });
  };
  const [sceneObjectDataConfig, setSceneObjectDataConfig] = useState<Record<string, any>>({
    obj_init_1: { dataMode: '动态数据', dynamicDataConfig: { sourceType: '工程虚拟仿真平台数据', deviceId: 'temp01', fields: ['temperature', 'humidity'] }, applied: true },
    obj_init_2: { dataMode: '动态数据', dynamicDataConfig: { sourceType: '工程虚拟仿真平台数据', deviceId: 'fan01', fields: ['fanStatus'] }, applied: true },
    obj_init_3: { dataMode: '动态数据', dynamicDataConfig: { sourceType: '工程虚拟仿真平台数据', deviceId: 'pump01', fields: ['pumpStatus'] }, applied: true },
    obj_init_4: { dataMode: '动态数据', dynamicDataConfig: { sourceType: '工程虚拟仿真平台数据', deviceId: 'lamp01', fields: ['lampStatus', 'brightness'] }, applied: true },
    obj_init_5: { dataMode: '动态数据', dynamicDataConfig: { sourceType: '工程虚拟仿真平台数据', deviceId: 'gw01', fields: ['gatewayStatus'] }, applied: true },
    obj_init_6: { dataMode: '动态数据', dynamicDataConfig: { sourceType: '工程虚拟仿真平台数据', deviceId: 'alarm01', fields: ['alarmStatus'] }, applied: true }
  });
  const [cloudDeviceData, setCloudDeviceData] = useState<Record<string, Record<string, string | number>>>({
    temp01: { temperature: 32.5, humidity: 58 },
    light01: { light: 450 },
    co201: { co2: 620 },
    fan01: { fanStatus: 'running' },
    relay01: { relayStatus: 'on' },
    gw01: { gatewayStatus: 'online' },
    pump01: { pumpStatus: 'running' },
    lamp01: { lampStatus: 'on', brightness: 85 },
    alarm01: { alarmStatus: 'normal' }
  });

  
  // Engineering Virtual Simulation Data State
  const [virtualSimulationProject, setVirtualSimulationProject] = useState("智慧温室自动化控制工程");
  const [virtualSimulationScene, setVirtualSimulationScene] = useState("智慧温室");
  const [virtualSimulationConnectionStatus, setVirtualSimulationConnectionStatus] = useState<"未连接" | "已连接" | "接收中" | "已暂停">("已连接");
  const [virtualSimulationReceiveStatus, setVirtualSimulationReceiveStatus] = useState<"未连接" | "已连接" | "接收中" | "已暂停">("接收中");
  const [virtualDataReceiveRecords, setVirtualDataReceiveRecords] = useState<any[]>([
    { time: '10:55:20', modelName: '风机模型', targetDeviceName: '风机', deviceId: 'fan01', field: 'fanStatus', val: 'running', unit: '-', source: '工程虚拟仿真平台', type: '已接收' },
    { time: '10:55:22', modelName: '补光灯模型', targetDeviceName: '补光灯', deviceId: 'lamp01', field: 'lampStatus', val: 'on', unit: '-', source: '工程虚拟仿真平台', type: '已接收' },
    { time: '10:55:24', modelName: '水泵模型', targetDeviceName: '水泵', deviceId: 'pump01', field: 'pumpStatus', val: 'running', unit: '-', source: '工程虚拟仿真平台', type: '已接收' },
    { time: '10:55:26', modelName: '温湿度传感器模型', targetDeviceName: '温湿度传感器', deviceId: 'temp01', field: 'temperature', val: '32.5', unit: '℃', source: '工程虚拟仿真平台', type: '已接收' }
  ]);
  const [virtualDeviceData, setVirtualDeviceData] = useState<Record<string, Record<string, string | number>>>({
    temp01: { temperature: 32.5, humidity: 58 },
    light01: { light: 450 },
    co201: { co2: 620 },
    fan01: { fanStatus: 'running' },
    relay01: { relayStatus: 'on' },
    gw01: { gatewayStatus: 'online' },
    pump01: { pumpStatus: 'running' },
    lamp01: { lampStatus: 'on', brightness: 85 },
    alarm01: { alarmStatus: 'normal' }
  });

  const VIRTUAL_DEVICES = useMemo(() => [
    { id: 'temp01', name: '温湿度传感器 temp01', type: '传感器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'temperature', name: '温度', unit: '℃', val: 32.5, type: '数值' }, { id: 'humidity', name: '湿度', unit: '%', val: 58, type: '数值' }] },
    { id: 'light01', name: '光照传感器 light01', type: '传感器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'light', name: '光照', unit: 'Lux', val: 450, type: '数值' }] },
    { id: 'co201', name: '二氧化碳传感器 co201', type: '传感器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'co2', name: 'CO2', unit: 'ppm', val: 620, type: '数值' }] },
    { id: 'fan01', name: '风机 fan01', type: '执行器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'fanStatus', name: '风机状态', unit: '-', val: 'running', type: '枚举' }] },
    { id: 'relay01', name: '继电器 relay01', type: '执行器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'relayStatus', name: '继电器状态', unit: '-', val: 'on', type: '枚举' }] },
    { id: 'gw01', name: 'Modbus网关 gw01', type: '网关', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'gatewayStatus', name: '网关状态', unit: '-', val: 'online', type: '枚举' }] },
    { id: 'pump01', name: '水泵 pump01', type: '执行器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'pumpStatus', name: '水泵状态', unit: '-', val: 'running', type: '枚举' }] },
    { id: 'lamp01', name: '补光灯 lamp01', type: '执行器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'lampStatus', name: '补光灯状态', unit: '-', val: 'on', type: '枚举' }, { id: 'brightness', name: '亮度', unit: '%', val: 85, type: '数值' }] },
    { id: 'alarm01', name: '报警灯 alarm01', type: '执行器', project: '智慧温室自动化控制工程', bind: '未绑定', props: [{ id: 'alarmStatus', name: '报警状态', unit: '-', val: 'normal', type: '枚举' }] }
  ], []);

  const [virtualFieldMappingConfig, setVirtualFieldMappingConfig] = useState<Record<string, Record<string, any>>>({});
  
  // Custom Status Animation Coordination States
  const [virtualSimulationDevices, setVirtualSimulationDevices] = useState<any[]>(VIRTUAL_DEVICES);
  const [selectedVirtualDevice, setSelectedVirtualDevice] = useState<string>("fan01");
  const [selectedDeviceProperty, setSelectedDeviceProperty] = useState<string>("fanStatus");
  const [devicePropertyValue, setDevicePropertyValue] = useState<any>("running");
  const [rightLogTab, setRightLogTab] = useState<"statusHistory" | "configHistory" | "operationHistory">("statusHistory");
  const [modelAnimationPreviewStatus, setModelAnimationPreviewStatus] = useState<Record<string, "idle" | "previewing">>({
    temp01: "idle",
    fan01: "idle",
    pump01: "idle",
    lamp01: "idle",
    gw01: "idle",
    alarm01: "idle"
  });
  const [sceneObjectAnimationStates, setSceneObjectAnimationStates] = useState<Record<string, any>>({});
  const [animationChangeRecords, setAnimationChangeRecords] = useState<any[]>([
    { id: 1, time: "10:55:20", modelName: "风机", deviceId: "fan01", propName: "fanStatus", val: "running", status: "运行中", anim: "扇叶旋转", source: "工程虚拟仿真平台" },
    { id: 2, time: "10:55:22", modelName: "补光灯", deviceId: "lamp01", propName: "lampStatus", val: "on", status: "开启", anim: "发光动效", source: "工程虚拟仿真平台" },
    { id: 3, time: "10:55:24", modelName: "水泵", deviceId: "pump01", propName: "pumpStatus", val: "running", status: "运行中", anim: "水流线条", source: "工程虚拟仿真平台" },
    { id: 4, time: "10:55:26", modelName: "温湿度传感器", deviceId: "temp01", propName: "temperature", val: "32.5", status: "预警", anim: "橙色标签", source: "工程虚拟仿真平台" }
  ]);

  const [modelAnimationRules, setModelAnimationRules] = useState<Record<string, Array<{val: string, stateName: string, animType: string, desc: string, color: string, enabled: boolean}>>>({
    fan01_fanStatus: [
      { val: "off", stateName: "停止", animType: "停止旋转", desc: "风机扇叶静止", color: "灰色", enabled: true },
      { val: "running", stateName: "运行中", animType: "扇叶旋转", desc: "风机扇叶持续旋转", color: "绿色", enabled: true },
      { val: "fault", stateName: "故障", animType: "抖动告警", desc: "模型轻微抖动并显示告警标识", color: "浅红色", enabled: true }
    ],
    pump01_pumpStatus: [
      { val: "off", stateName: "停止", animType: "静止", desc: "水泵电机静止", color: "灰色", enabled: true },
      { val: "running", stateName: "运行中", animType: "水流线条动效", desc: "管道循环流动效果", color: "绿色", enabled: true },
      { val: "fault", stateName: "故障", animType: "红色闪烁变温", desc: "故障灯闪烁警告", color: "浅红色", enabled: true }
    ],
    lamp01_lampStatus: [
      { val: "off", stateName: "关闭", animType: "灯光关闭", desc: "光源熄灭效果", color: "灰色", enabled: true },
      { val: "on", stateName: "开启", animType: "灯光发光", desc: "黄色光源发光光效", color: "绿色", enabled: true }
    ],
    temp01_temperature: [
      { val: "20 - 30", stateName: "正常", animType: "绿色标签", desc: "温度在舒适区间", color: "绿色", enabled: true },
      { val: "30 - 35", stateName: "预警", animType: "橙色标签", desc: "温度略高，发布警示", color: "橙色", enabled: true },
      { val: "大于 35", stateName: "异常", animType: "浅红色闪烁标签", desc: "温度过高完毕报警", color: "浅红色", enabled: true }
    ],
    gw01_gatewayStatus: [
      { val: "online", stateName: "在线", animType: "绿色状态点", desc: "网络连接正常", color: "绿色", enabled: true },
      { val: "offline", stateName: "离线", animType: "灰色离线", desc: "网络连接关闭", color: "灰色", enabled: true },
      { val: "fault", stateName: "异常", animType: "红色闪烁", desc: "Modbus 通讯故障", color: "浅红色", enabled: true }
    ],
    alarm01_alarmStatus: [
      { val: "normal", stateName: "正常", animType: "绿色常亮", desc: "系统稳定无报警", color: "绿色", enabled: true },
      { val: "warning", stateName: "故障边缘", animType: "橙色闪烁", desc: "边缘设备闪烁提醒", color: "橙色", enabled: true },
      { val: "alarm", stateName: "紧急报警", animType: "红色快速闪烁", desc: "红灯急促闪烁警告", color: "浅红色", enabled: true }
    ]
  });

  const [modelAnimationConfig, setModelAnimationConfig] = useState<Record<string, any>>({
    fan01: { name: "扇叶旋转", type: "旋转动效", field: "fanStatus", triggerVal: "running", speed: "中速", loop: true, showStatusLight: true, showLabel: true, labelContent: "运行中", color: "绿色" },
    pump01: { name: "水流线条", type: "流动线条", field: "pumpStatus", triggerVal: "running", speed: "中速", loop: true, showStatusLight: true, showLabel: true, labelContent: "运行中", color: "绿色" },
    lamp01: { name: "灯光发光", type: "呼吸光效", field: "lampStatus", triggerVal: "on", speed: "中速", loop: true, showStatusLight: true, showLabel: true, labelContent: "开启", color: "黄色" },
    temp01: { name: "预警标签", type: "数值标签变化", field: "temperature", triggerVal: "32.5", speed: "慢速", loop: true, showStatusLight: false, showLabel: true, labelContent: "预警", color: "橙色" },
    gw01: { name: "状态指示灯", type: "状态灯变化", field: "gatewayStatus", triggerVal: "online", speed: "中速", loop: true, showStatusLight: true, showLabel: true, labelContent: "在线", color: "绿色" },
    alarm01: { name: "闪烁告警", type: "闪烁动效", field: "alarmStatus", triggerVal: "alarm", speed: "快速", loop: true, showStatusLight: true, showLabel: true, labelContent: "紧急报警", color: "红色" }
  });

  // Setup reactive syncing for testing selection
  useEffect(() => {
    if (selectedSceneObject) {
      const name = selectedSceneObject.name || "";
      let devId = "fan01";
      if (name.includes("传感器") || name.includes("温湿度")) devId = "temp01";
      else if (name.includes("风机")) devId = "fan01";
      else if (name.includes("水泵")) devId = "pump01";
      else if (name.includes("补光灯") || name.includes("灯")) devId = "lamp01";
      else if (name.includes("网关") || name.includes("Modbus")) devId = "gw01";
      else if (name.includes("报警灯")) devId = "alarm01";
      setSelectedVirtualDevice(devId);
    }
  }, [selectedSceneObject]);

  useEffect(() => {
    if (selectedVirtualDevice) {
      let propId = "fanStatus";
      if (selectedVirtualDevice === "fan01") propId = "fanStatus";
      else if (selectedVirtualDevice === "temp01") propId = "temperature";
      else if (selectedVirtualDevice === "pump01") propId = "pumpStatus";
      else if (selectedVirtualDevice === "lamp01") propId = "lampStatus";
      else if (selectedVirtualDevice === "gw01") propId = "gatewayStatus";
      else if (selectedVirtualDevice === "relay01") propId = "relayStatus";
      else if (selectedVirtualDevice === "alarm01") propId = "alarmStatus";
      setSelectedDeviceProperty(propId);
      
      const val = virtualDeviceData[selectedVirtualDevice]?.[propId] ?? "running";
      setDevicePropertyValue(val);
    }
  }, [selectedVirtualDevice]);

  const handleStartVirtualData = () => {
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
                 const nowStr = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}:${new Date().getSeconds().toString().padStart(2, '0')}`;
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
                 const nowStr = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}:${new Date().getSeconds().toString().padStart(2, '0')}`;
                 
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

  const [dataReceiveStatus, setDataReceiveStatus] = useState<"未连接" | "已连接" | "接收中">("未连接");
  const [dataReceiveTimer, setDataReceiveTimer] = useState<NodeJS.Timeout | null>(null);

  const CLOUD_DEVICES = useMemo(() => [
    { id: 'temp01', name: '温湿度传感器 temp01', props: [{ id: 'temperature', name: '温度', unit: '℃' }, { id: 'humidity', name: '湿度', unit: '%' }] },
    { id: 'light01', name: '光照传感器 light01', props: [{ id: 'light', name: '光照', unit: 'Lux' }] },
    { id: 'co201', name: '二氧化碳传感器 co201', props: [{ id: 'co2', name: 'CO2', unit: 'ppm' }] },
    { id: 'fan01', name: '风机 fan01', props: [{ id: 'fanStatus', name: '风机状态', unit: '' }] },
    { id: 'relay01', name: '继电器 relay01', props: [{ id: 'relayStatus', name: '继电器状态', unit: '' }] },
    { id: 'gw01', name: 'Modbus网关 gw01', props: [{ id: 'gatewayStatus', name: '网关状态', unit: '' }] }
  ], []);

  // Use this to trigger re-renders on live data update
  const [dataRefreshCounter, setDataRefreshCounter] = useState(0);

  useEffect(() => {
    return () => {
      if (dataReceiveTimer) clearInterval(dataReceiveTimer);
    };
  }, [dataReceiveTimer]);

  
  const handlePauseVirtualData = () => {
    setVirtualSimulationReceiveStatus("已暂停");
    setVirtualSimulationConnectionStatus("已连接");
    if (dataReceiveTimer) clearInterval(dataReceiveTimer);
    setDataReceiveTimer(null);
    showToast("已暂停接收工程虚拟仿真平台数据。");
    addLog("已暂停接收工程虚拟仿真平台数据");
  };

  const handleStartReceive = () => {
    if (dataReceiveStatus === "接收中") return;
    setDataReceiveStatus("接收中");
    showToast("开始接收行业云平台仿真设备数据。");
    addLog("开始接收行业云平台仿真设备数据。");
    
    const timer = setInterval(() => {
      setCloudDeviceData(prev => {
        const newData = { ...prev };
        const sharedState = typeof window !== 'undefined' ? (window as any).CLOUD_SHARED_STATE : null;
        
        if (sharedState && sharedState.latestValues) {
          const vals = sharedState.latestValues;
          if (newData.temp01) {
            newData.temp01.temperature = vals.temp;
            newData.temp01.humidity = vals.hum;
          }
          if (newData.light01) {
            newData.light01.light = vals.light;
          }
          if (newData.co201) {
            newData.co201.co2 = vals.co2;
          }
          if (newData.fan01) {
            newData.fan01.fanStatus = vals.fanStatus === '关闭' ? 'off' : 'on';
          }
          if (newData.relay01) {
            newData.relay01.relayStatus = vals.relayStatus === '关闭' ? 'off' : 'on';
          }
        } else {
          if (newData.temp01) {
            newData.temp01.temperature = Number((prev.temp01.temperature as number) >= 25.2 ? 24.6 : (prev.temp01.temperature as number) + 0.3).toFixed(1) as any;
            newData.temp01.humidity = prev.temp01.humidity === 58 ? 59 : prev.temp01.humidity === 59 ? 57 : prev.temp01.humidity === 57 ? 60 : 58;
          }
          if (newData.light01) {
            newData.light01.light = prev.light01.light === 450 ? 465 : prev.light01.light === 465 ? 480 : prev.light01.light === 480 ? 455 : 450;
          }
          if (newData.co201) {
            newData.co201.co2 = prev.co201.co2 === 620 ? 635 : prev.co201.co2 === 635 ? 650 : prev.co201.co2 === 650 ? 628 : 620;
          }
          if (newData.fan01) {
            newData.fan01.fanStatus = prev.fan01.fanStatus === 'off' ? 'on' : 'off';
          }
          if (newData.relay01) {
            newData.relay01.relayStatus = prev.relay01.relayStatus === 'off' ? 'on' : 'off';
          }
        }
        return newData;
      });
      setDataRefreshCounter(c => c + 1);
      
      // Add receive records
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setThreeDSceneObjects(objects => {
        const newRecords: any[] = [];
        objects.forEach(obj => {
          // access current state from outside might not be ideal without refs, but we can do it locally inside setThreeDSceneObjects callback or better outside
        });
        return objects;
      });
      
    }, 2000);
    setDataReceiveTimer(timer);
  };

  const handlePauseReceive = () => {
    setDataReceiveStatus("已连接");
    addLog("已暂停接收行业云平台仿真设备数据。");
    showToast("已暂停接收行业云平台仿真设备数据。");
    if (dataReceiveTimer) {
      clearInterval(dataReceiveTimer);
      setDataReceiveTimer(null);
    }
  };

  useEffect(() => {
    // Whenever cloudDeviceData changes, if we are in receiving mode, map new values to records
    if (dataReceiveStatus === "接收中") {
       const now = new Date();
       const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
       const newRecords: any[] = [];
       
       threeDSceneObjects.forEach(obj => {
         const objConfig = sceneObjectDataConfig[obj.id];
         if (objConfig && objConfig.dataMode === '动态数据' && objConfig.dynamicDataConfig?.deviceId && objConfig.dynamicDataConfig?.propertyId) {
            const devId = objConfig.dynamicDataConfig.deviceId;
            const propId = objConfig.dynamicDataConfig.propertyId;
            const deviceMeta = CLOUD_DEVICES.find(d => d.id === devId);
            const propMeta = deviceMeta?.props.find(p => p.id === propId);
            
            const val = cloudDeviceData[devId]?.[propId];
            if (val !== undefined) {
               newRecords.push({
                 id: Date.now() + Math.random(),
                 time: timeStr,
                 modelName: obj.name,
                 deviceName: deviceMeta?.name || devId,
                 deviceCode: devId,
                 propertyId: propId,
                 value: val,
                 unit: propMeta?.unit || '',
                 source: '行业云平台仿真设备数据',
                 status: '已接收'
               });
            }
         }
       });
       if (newRecords.length > 0) {
         setDataReceiveRecords(prev => [...newRecords, ...prev].slice(0, 50));
       }
    }
  }, [dataRefreshCounter]);

  const handleRefreshData = () => {
    showToast("仿真设备数据已刷新");
    setDataRefreshCounter(c => c + 1);
  };

  // Import/Export and UI States
  const [importModelInfo, setImportModelInfo] = useState<any>(null);
  const [designerToast, setDesignerToast] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [propertyPanelCollapsed, setPropertyPanelCollapsed] = useState(false);

  // Helper for Toast
  const showToast = (msg: string) => {
    setDesignerToast(msg);
    setTimeout(() => setDesignerToast(""), 3000);
  };

  const addLog = (msg: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSceneObjectLogs(prev => [{ time: timeStr, msg }, ...prev]);
  };

  const getObjectAnimationState = (obj: any) => {
    if (!obj) return { stateName: '正常', animType: '无', color: 'green', val: '-', propName: '-', statusColor: 'emerald' };
    
    // Determine bound virtual device ID based on model name
    let devId = "";
    if (obj.name.includes("传感器") || obj.name.includes("温湿度")) devId = "temp01";
    else if (obj.name.includes("风机")) devId = "fan01";
    else if (obj.name.includes("水泵")) devId = "pump01";
    else if (obj.name.includes("补光灯") || obj.name.includes("灯")) devId = "lamp01";
    else if (obj.name.includes("网关") || obj.name.includes("Modbus")) devId = "gw01";
    else if (obj.name.includes("报警灯")) devId = "alarm01";

    if (!devId) return { stateName: '无', animType: '无', color: 'gray', val: '-', propName: '-', statusColor: 'zinc' };

    const isPreviewing = modelAnimationPreviewStatus[devId] === "previewing";
    
    if (devId === 'fan01') {
      const val = isPreviewing ? "running" : (virtualDeviceData.fan01?.fanStatus ?? "off");
      if (val === 'running') return { stateName: '运行中', animType: '扇叶旋转', color: 'green', val, propName: 'fanStatus', statusColor: 'emerald' };
      if (val === 'fault') return { stateName: '故障', animType: '抖动告警', color: 'red', val, propName: 'fanStatus', statusColor: 'red' };
      return { stateName: '停止', animType: '停止旋转', color: 'gray', val, propName: 'fanStatus', statusColor: 'zinc' };
    }
    
    if (devId === 'pump01') {
      const val = isPreviewing ? "running" : (virtualDeviceData.pump01?.pumpStatus ?? "off");
      if (val === 'running') return { stateName: '运行中', animType: '水流线条', color: 'green', val, propName: 'pumpStatus', statusColor: 'emerald' };
      if (val === 'fault') return { stateName: '故障', animType: '红色闪烁', color: 'red', val, propName: 'pumpStatus', statusColor: 'red' };
      return { stateName: '停止', animType: '静止', color: 'gray', val, propName: 'pumpStatus', statusColor: 'zinc' };
    }
    
    if (devId === 'lamp01') {
      const val = isPreviewing ? "on" : (virtualDeviceData.lamp01?.lampStatus ?? "off");
      const brightness = virtualDeviceData.lamp01?.brightness ?? 85;
      if (val === 'on') {
        if (brightness > 80) return { stateName: '开启', animType: '高亮光效', color: 'yellow', val: `${val} (${brightness}%)`, propName: 'lampStatus', statusColor: 'amber' };
        return { stateName: '开启', animType: '发光动效', color: 'green', val: `${val} (${brightness}%)`, propName: 'lampStatus', statusColor: 'emerald' };
      }
      return { stateName: '关闭', animType: '灯光关闭', color: 'gray', val, propName: 'lampStatus', statusColor: 'zinc' };
    }
    
    if (devId === 'temp01') {
      const temp = Number(virtualDeviceData.temp01?.temperature ?? 32.5);
      if (temp > 35) return { stateName: '异常', animType: '浅红色闪烁标签', color: 'red', val: `${temp} ℃`, propName: 'temperature', statusColor: 'red' };
      if (temp >= 30) return { stateName: '预警', animType: '橙色标签', color: 'orange', val: `${temp} ℃`, propName: 'temperature', statusColor: 'orange' };
      return { stateName: '正常', animType: '绿色标签', color: 'green', val: `${temp} ℃`, propName: 'temperature', statusColor: 'emerald' };
    }
    
    if (devId === 'gw01') {
      const val = isPreviewing ? "online" : (virtualDeviceData.gw01?.gatewayStatus ?? "online");
      if (val === 'online') return { stateName: '在线', animType: '绿色状态点', color: 'green', val, propName: 'gatewayStatus', statusColor: 'emerald' };
      if (val === 'offline') return { stateName: '离线', animType: '灰色离线', color: 'gray', val, propName: 'gatewayStatus', statusColor: 'zinc' };
      return { stateName: '故障', animType: '红色闪烁', color: 'red', val, propName: 'gatewayStatus', statusColor: 'red' };
    }
    
    if (devId === 'alarm01') {
      const val = isPreviewing ? "alarm" : (virtualDeviceData.alarm01?.alarmStatus ?? "normal");
      if (val === 'alarm') return { stateName: '紧急报警', animType: '红色快速闪烁', color: 'red', val, propName: 'alarmStatus', statusColor: 'red' };
      if (val === 'warning') return { stateName: '故障边缘', animType: '橙色闪烁', color: 'orange', val, propName: 'alarmStatus', statusColor: 'orange' };
      return { stateName: '正常', animType: '绿色常亮', color: 'green', val, propName: 'alarmStatus', statusColor: 'emerald' };
    }
    
    return { stateName: '正常', animType: '无', color: 'green', val: '-', propName: '-', statusColor: 'emerald' };
  };

  const addRecord = (type: string, appName: string, filename: string, format: string, status: string = '成功') => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setImportExportRecords(prev => [{
      id: Date.now(), time: timeStr, type, appName, filename, format, status, user: "学生1"
    }, ...prev]);
  };

  const handleAppAction = (action: string, app: any) => {
    if (action === '设计') {
      setSelectedThreeDApp(app);
      setThreeDDesignerView("editor");
      addLog(`打开应用：${app.name}`);
    } else if (action === '预览') {
      showToast(`正在打开 ${app.name} 预览...`);
    } else if (action === '发布') {
      setThreeDAppList(prev => prev.map(a => a.id === app.id ? { ...a, status: '已发布' } : a));
      showToast(`${app.name} 发布成功`);
    } else if (action === '复制') {
      const copy = { ...app, id: `3d-${Date.now()}`, name: `${app.name} 副本`, createTime: new Date().toLocaleString() };
      setThreeDAppList(prev => [copy, ...prev]);
      showToast(`已复制 ${app.name}`);
    } else if (action === '导入配置') {
      setImportDrawerVisible(true);
    } else if (action === '导出应用') {
      setExportConfig(prev => ({ ...prev, exportApp: app }));
      setExportResult(null);
      setExportDrawerVisible(true);
    } else if (action === '删除') {
      if (window.confirm(`确定要删除应用 ${app.name} 吗？`)) {
        setThreeDAppList(prev => prev.filter(a => a.id !== app.id));
        showToast(`已删除 ${app.name}`);
      }
    }
  };

  const handleParseImportPackage = () => {
    showToast("应用包解析成功");
    setImportPackageInfo({
      appName: "智慧温室 3D 监控应用",
      version: "v1.0.0",
      appType: "3D 可视化应用",
      sceneCount: 1,
      modelCount: 12,
      componentCount: 18,
      bindingCount: 6,
      dsCount: 4,
      scriptCount: 3,
      resources: [
        { name: "scene.json", type: "场景配置", status: "已识别", color: "text-[#10A66A]" },
        { name: "models/greenhouse.glb", type: "温室模型", status: "已识别", color: "text-[#10A66A]" },
        { name: "models/fan.glb", type: "风机模型", status: "已识别", color: "text-[#10A66A]" },
        { name: "models/sensor.glb", type: "传感器模型", status: "已识别", color: "text-[#10A66A]" },
        { name: "models/history_model.glb", type: "历史模型资源", status: "已使用占位模型替换", color: "text-[#ef4444]" },
        { name: "components/dashboard.json", type: "数据面板组件", status: "已识别", color: "text-[#10A66A]" },
        { name: "bindings/devices.json", type: "设备绑定配置", status: "已识别", color: "text-[#10A66A]" },
        { name: "datasource/cloud.json", type: "数据源配置", status: "已识别", color: "text-[#10A66A]" },
        { name: "scripts/interaction.js", type: "场景交互脚本", status: "已识别", color: "text-[#10A66A]" }
      ]
    });
    setImportValidationResults({
      status: "校验通过",
      items: [
        { name: "应用配置文件", status: "通过" },
        { name: "3D 场景文件", status: "通过" },
        { name: "模型资源文件", status: "通过" },
        { name: "组件配置文件", status: "通过" },
        { name: "设备绑定关系", status: "通过" },
        { name: "数据源配置", status: "通过" },
        { name: "场景脚本", status: "通过" }
      ],
      notice: "历史模型资源缺失，已使用占位模型替换。"
    });
    addRecord("解析应用包", "智慧温室 3D 监控应用 - 导入版", "greenhouse_3d_app.zip", "3D 应用包");
  };

  const handleConfirmImport = () => {
    const newApp = { 
      id: `3d-${Date.now()}`, 
      name: importConfig.appName, 
      createTime: new Date().toLocaleString(),
      status: "未发布",
      cover: "greenhouse" 
    };
    setThreeDAppList([newApp, ...threeDAppList]);
    showToast("应用导入成功");
    addRecord("导入应用", importConfig.appName, "greenhouse_3d_app.zip", "3D 应用包");
    setImportDrawerVisible(false);
  };

  const handleGenerateExport = () => {
    setExportResult({
      status: "已生成",
      filename: exportConfig.filename,
      size: "18.6 MB",
      time: "2026-06-08 10:50:20",
      contentStr: "场景配置、3D 模型资源、组件配置、设备绑定、数据源配置、场景脚本、应用元信息",
      validation: "通过"
    });
    addRecord("导出应用", exportConfig.exportApp?.name || "未知应用", exportConfig.filename, exportConfig.format);
  };

  const handleAddObject = (itemData: any) => {
    const newObj = {
      id: `obj-${Date.now()}`,
      name: itemData.name,
      type: itemData.type,
      category: itemData.category || itemData.type,
      bind: itemData.bind || "-",
      status: "已添加",
      posX: 0,
      posY: 0,
      posZ: 0,
      rotX: 0, rotY: 0, rotZ: 0,
      sclX: 1, sclY: 1, sclZ: 1
    };
    setThreeDSceneObjects([...threeDSceneObjects, newObj]);
    addLog(`添加 ${itemData.name} 到场景`);
    showToast(`模型已添加到场景`);
    setSelectedSceneObject(newObj);
  };

  const filteredModels = useMemo(() => {
    let list = ALL_LIBRARY_MODELS;
    
    // Category Filter based on Tool or Explicit Filter
    let activeCategory = selectedDesignerTool === "模型库" ? null : selectedDesignerTool;
    
    if (activeCategory && activeCategory !== "导入" && activeCategory !== "全部分类") {
       if (activeCategory === "设备模型" || activeCategory === "电器模型" || activeCategory === "软装单体" || activeCategory === "ROS小车") {
         list = list.filter(m => m.category === activeCategory);
       }
    }

    // Type Filter
    if (modelTypeFilter !== "全部") {
      list = list.filter(m => m.type.includes(modelTypeFilter) || m.category === modelTypeFilter);
    }

    // Keyword Search
    if (modelSearchKeyword) {
      list = list.filter(m => m.name.toLowerCase().includes(modelSearchKeyword.toLowerCase()));
    }

    // Scene Filter
    if (modelSceneFilter !== "全部") {
      list = list.filter(m => m.scene.includes(modelSceneFilter));
    }

    // Status Filter
    if (modelStatusFilter !== "全部") {
       if (modelStatusFilter === "已添加") {
         list = list.filter(m => threeDSceneObjects.some(obj => obj.name === m.name));
       } else {
         list = list.filter(m => m.bindStatus === modelStatusFilter);
       }
    }

    return list;
  }, [selectedDesignerTool, modelTypeFilter, modelSceneFilter, modelStatusFilter, modelSearchKeyword, threeDSceneObjects]);

  const modelStats = useMemo(() => {
    return {
      total: ALL_LIBRARY_MODELS.length,
      device: DEVICE_MODELS.length,
      electrical: ELECTRICAL_MODELS.length,
      soft: SOFT_MODELS.length,
      other: ROS_MODELS.length
    }
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#1A1B23] text-zinc-300 font-sans relative z-50">
      
      {/* Toast */}
      {designerToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[100] bg-zinc-800 text-white px-4 py-2 rounded shadow-lg border border-zinc-700/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-[#10A66A]" />
          <span className="text-sm">{designerToast}</span>
        </div>
      )}

      {/* --- View: App List --- */}
      {threeDDesignerView === "appList" && (
        <>
          {/* Top Header */}
          <div className="h-14 bg-[#14151B] border-b border-zinc-800 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
              <div 
                className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                onClick={onClose}
              >
                智慧教育综合实训平台 <span className="mx-1 text-zinc-700">/</span> 应用设计器 3D
              </div>
              <h1 className="text-base font-black text-white">3D 应用设计器</h1>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="flex gap-2">
                 <button 
                   className="px-3 py-1.5 text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors flex items-center gap-1.5"
                   onClick={() => setImportDrawerVisible(true)}
                 >
                   <Upload className="w-3.5 h-3.5" /> 导入应用
                 </button>
                 <button 
                   className="px-3 py-1.5 text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors flex items-center gap-1.5"
                   onClick={() => {
                     setExportConfig({ ...exportConfig, exportApp: threeDAppList[0] || null });
                     setExportResult(null);
                     setExportDrawerVisible(true);
                   }}
                 >
                   <Download className="w-3.5 h-3.5" /> 导出应用
                 </button>
               </div>
               <div className="w-px h-4 bg-zinc-700"></div>
               <div className="flex items-center gap-2 text-sm text-zinc-400">
                 <div className="w-7 h-7 rounded-full bg-[#10A66A]/20 text-[#10A66A] flex items-center justify-center font-bold">小</div>
                 <span>学生1</span>
               </div>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Menu */}
            <div className="w-48 bg-[#1A1B23] border-r border-zinc-800 flex flex-col py-4 shrink-0">
               <div className="px-4 text-[10px] font-bold text-zinc-500 uppercase mb-2">控制台</div>
               <button className="w-full text-left px-5 py-2.5 bg-[#10A66A]/10 text-[#10A66A] border-r-2 border-[#10A66A] text-sm font-bold flex items-center gap-2">
                 <LayoutTemplate className="w-4 h-4" /> 全部应用
               </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-[#111217] p-6 overflow-y-auto">
               
               <div className="flex items-center justify-between mb-6">
                 <button 
                   className="px-4 py-2 bg-[#10A66A] hover:bg-[#0c8a58] text-white text-sm font-bold rounded flex items-center gap-2 transition-colors shadow-lg shadow-[#10A66A]/20"
                   onClick={() => {
                     const newApp = { 
                       id: `3d-${Date.now()}`, 
                       name: "新建 3D 应用", 
                       createTime: "刚创建",
                       status: "草稿",
                       cover: "empty" 
                     };
                     setThreeDAppList([newApp, ...threeDAppList]);
                   }}
                 >
                   <Plus className="w-4 h-4" /> 添加
                 </button>

                 <div className="relative">
                   <input 
                     type="text" 
                     placeholder="请输入应用名称" 
                     className="w-64 bg-[#1A1B23] border border-zinc-800 rounded px-3 py-1.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#10A66A] transition-colors"
                     value={designerSearchKeyword}
                     onChange={e => setDesignerSearchKeyword(e.target.value)}
                   />
                   <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {threeDAppList.filter(app => app.name.includes(designerSearchKeyword)).map(app => (
                   <div key={app.id} className="bg-[#1A1B23] border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-600 transition-colors flex flex-col">
                     <div className="h-32 bg-zinc-900 border-b border-zinc-800 relative flex items-center justify-center overflow-hidden">
                       {app.cover === 'greenhouse' && <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-green-900/20 opacity-50"></div>}
                       {app.cover === 'home' && <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-blue-900/20 opacity-50"></div>}
                       {app.cover === 'empty' && <div className="w-full h-full bg-zinc-900"></div>}
                       
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px] transition-opacity gap-3">
                          <button 
                            className="px-4 py-1.5 bg-[#10A66A] text-white text-xs font-bold rounded"
                            onClick={() => {
                              setSelectedThreeDApp(app);
                              setThreeDDesignerView("editor");
                              addLog(`打开应用：${app.name}`);
                            }}
                          >
                            设计
                          </button>
                       </div>
                       
                       <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-bold">
                         {app.status === '已发布' ? <span className="text-[#10A66A]">已发布</span> : <span className="text-zinc-400">{app.status}</span>}
                       </div>
                     </div>
                     <div className="p-4 flex flex-col gap-2">
                       <h3 className="text-sm font-bold text-white truncate" title={app.name}>{app.name}</h3>
                       <div className="text-[11px] text-zinc-500">创建时间：{app.createTime}</div>
                       <div className="pt-3 border-t border-zinc-800/50 flex justify-between items-center">
                         <div className="flex gap-2">
                           <button className="text-zinc-400 hover:text-white text-xs transition-colors" onClick={(e) => { e.stopPropagation(); handleAppAction('发布', app); }}>发布</button>
                           <button className="text-zinc-400 hover:text-white text-xs transition-colors" onClick={(e) => { e.stopPropagation(); handleAppAction('导出应用', app); }}>导出</button>
                         </div>
                         <button className="text-zinc-500 hover:text-white p-1 transition-colors group relative cursor-pointer">
                           <MoreHorizontal className="w-4 h-4" />
                           <div className="absolute bottom-full right-0 mb-1 w-24 bg-zinc-800 border border-zinc-700 rounded shadow-xl hidden group-hover:block z-10 py-1">
                             <div className="px-3 py-1.5 hover:bg-zinc-700 text-xs text-zinc-300" onClick={(e) => { e.stopPropagation(); handleAppAction('设计', app); }}>设计</div>
                             <div className="px-3 py-1.5 hover:bg-zinc-700 text-xs text-zinc-300" onClick={(e) => { e.stopPropagation(); handleAppAction('预览', app); }}>预览</div>
                             <div className="px-3 py-1.5 hover:bg-zinc-700 text-xs text-zinc-300" onClick={(e) => { e.stopPropagation(); handleAppAction('发布', app); }}>发布</div>
                             <div className="px-3 py-1.5 hover:bg-zinc-700 text-xs text-zinc-300" onClick={(e) => { e.stopPropagation(); handleAppAction('复制', app); }}>复制</div>
                             <div className="px-3 py-1.5 hover:bg-zinc-700 text-xs text-zinc-300" onClick={(e) => { e.stopPropagation(); handleAppAction('导入配置', app); }}>导入配置</div>
                             <div className="px-3 py-1.5 hover:bg-zinc-700 text-xs text-zinc-300" onClick={(e) => { e.stopPropagation(); handleAppAction('导出应用', app); }}>导出应用</div>
                             <div className="px-3 py-1.5 hover:bg-zinc-700 text-xs text-red-400" onClick={(e) => { e.stopPropagation(); handleAppAction('删除', app); }}>删除</div>
                           </div>
                         </button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>

               {/* Import / Export Records */}
               <div className="mt-8 bg-[#1A1B23] border border-zinc-800 rounded-lg overflow-hidden flex flex-col shrink-0">
                 <div className="bg-[#14151B] px-4 py-2 flex items-center justify-between border-b border-zinc-800">
                   <span className="text-sm font-bold text-white flex items-center gap-2"><HardDrive className="w-4 h-4 text-zinc-400" />导入导出记录</span>
                 </div>
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-xs whitespace-nowrap">
                     <thead className="bg-[#14151B]/50 text-zinc-500 border-b border-zinc-800">
                       <tr>
                         <th className="px-4 py-2 font-medium">操作时间</th>
                         <th className="px-4 py-2 font-medium">操作类型</th>
                         <th className="px-4 py-2 font-medium">应用名称</th>
                         <th className="px-4 py-2 font-medium">文件名称</th>
                         <th className="px-4 py-2 font-medium">文件格式</th>
                         <th className="px-4 py-2 font-medium">操作结果</th>
                         <th className="px-4 py-2 font-medium">操作人</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-800 text-zinc-400">
                       {importExportRecords.map(record => (
                         <tr key={record.id} className="hover:bg-zinc-800/30 transition-colors">
                           <td className="px-4 py-2">{record.time}</td>
                           <td className="px-4 py-2">{record.type}</td>
                           <td className="px-4 py-2 text-zinc-300 font-medium">{record.appName}</td>
                           <td className="px-4 py-2 font-mono text-[11px] text-[#10A66A]">{record.filename}</td>
                           <td className="px-4 py-2"><span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[10px]">{record.format}</span></td>
                           <td className="px-4 py-2">
                             {record.status === '成功' ? 
                               <span className="text-[#10A66A] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />成功</span> : 
                               <span className="text-[#ef4444]">{record.status}</span>}
                           </td>
                           <td className="px-4 py-2">{record.user}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>

               {/* Pagination Component */}
               <div className="mt-auto pt-6 flex items-center justify-between text-xs text-zinc-500">
                  <div>共 {threeDAppList.length} 条</div>
                  <div className="flex items-center gap-4">
                     <select className="bg-[#1A1B23] border border-zinc-800 rounded px-2 py-1 outline-none text-zinc-300">
                       <option>10 条/页</option>
                       <option>20 条/页</option>
                     </select>
                     <div className="flex gap-1 items-center">
                        <button className="px-2 py-1 bg-[#1A1B23] border border-zinc-800 rounded hover:text-white transition-colors disabled:opacity-50">上一页</button>
                        <button className="px-2 py-1 bg-[#10A66A] text-white rounded font-bold">1</button>
                        <button className="px-2 py-1 bg-[#1A1B23] border border-zinc-800 rounded hover:text-white transition-colors disabled:opacity-50">下一页</button>
                     </div>
                     <div className="flex items-center gap-1">
                       <span>前往</span>
                       <input type="text" className="w-8 px-1 py-0.5 bg-[#1A1B23] border border-zinc-800 rounded text-center outline-none text-white" defaultValue="1" />
                       <span>页</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </>
      )}

      {/* --- View: Editor --- */}
      {threeDDesignerView === "editor" && (
<div className="flex flex-col h-full overflow-hidden">
          {/* Editor Header */}
          <div className="h-12 bg-[#1B1D25] border-b border-[#2A2D39] flex items-center justify-between px-4 shrink-0">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setThreeDDesignerView("appList")}>
                   <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition-colors">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                   </div>
                   <div className="text-[12px] font-bold text-zinc-500 group-hover:text-zinc-300">管理列表</div>
                </div>
                <div className="w-px h-4 bg-zinc-700"></div>
                <div className="text-[13px] font-black text-white flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={onClose}>
                   智慧教育综合实训平台 <span className="text-zinc-600">/</span> 应用设计器 3D
                </div>
             </div>

             <div className="text-[13px] font-bold text-zinc-300">
                当前应用：<span className="text-[#10A66A]">{selectedThreeDApp?.name}</span>
             </div>

             <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1 text-xs font-bold bg-[#2A2D39] text-zinc-300 hover:text-white hover:bg-zinc-600 rounded transition-colors flex items-center gap-1.5"
                    onClick={() => {
                      if(window.confirm("确定要清除画布吗？")) {
                        setThreeDSceneObjects([]);
                        addLog("清除场景");
                        setSelectedSceneObject(null);
                        showToast("画布已清除");
                      }
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> 清除
                  </button>
                  <button 
                    className="px-3 py-1 text-xs font-bold bg-[#2A2D39] text-zinc-300 hover:text-white hover:bg-zinc-600 rounded transition-colors flex items-center gap-1.5"
                    onClick={() => {
                       showToast("保存成功");
                       addLog("保存应用成功");
                    }}
                  >
                    <Save className="w-3.5 h-3.5" /> 保存
                  </button>
                  <button 
                    className="px-3 py-1 text-xs font-bold bg-[#2A2D39] text-zinc-300 hover:text-white hover:bg-zinc-600 rounded transition-colors flex items-center gap-1.5"
                    onClick={() => setPreviewVisible(true)}
                  >
                    <Play className="w-3.5 h-3.5" /> 预览
                  </button>
                  <button 
                    className="px-4 py-1 text-xs font-bold bg-[#10A66A] text-white hover:bg-[#0c8a58] rounded transition-colors flex items-center gap-1.5"
                    onClick={() => {
                      setThreeDAppList(threeDAppList.map(a => a.id === selectedThreeDApp.id ? {...a, status: '已发布'} : a));
                      showToast("发布成功");
                      addLog("发布应用");
                    }}
                  >
                    <Check className="w-3.5 h-3.5" /> 发布
                  </button>
                </div>
                <div className="w-px h-4 bg-zinc-700"></div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <User className="w-4 h-4" />
                  <span className="text-xs">学生1</span>
                </div>
             </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
             
             {/* Left Toolbar */}
             <div className="w-16 bg-[#16181E] border-r border-[#2A2D39] flex flex-col py-2 shrink-0 items-center gap-2 z-10">
                {[
                  { id: "模块", icon: Box },
                  { id: "智慧场景", icon: ImageIcon },
                  { id: "设备模型", icon: Cpu },
                  { id: "电器模型", icon: Lightbulb },
                  { id: "软装单体", icon: Home },
                  { id: "ROS小车", icon: MonitorPlay },
                  { id: "导入", icon: Upload },
                ].map(tool => (
                  <button 
                    key={tool.id}
                    className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${selectedDesignerTool === tool.id ? 'bg-[#2A2D39] text-[#10A66A]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#2A2D39]/50'}`}
                    onClick={() => {
                       setSelectedDesignerTool(tool.id);
                       setSelectedResourceCategory(
                         tool.id === "智慧场景" ? "智慧家居" : 
                         tool.id === "软装单体" ? "五金构件" :
                         tool.id === "电器模型" ? "智能家居" :
                         tool.id === "导入" ? "全部" :
                         ""
                       );
                    }}
                  >
                    <tool.icon className="w-4 h-4" />
                    <span className="text-[9px] font-bold scale-90">{tool.id}</span>
                  </button>
                ))}
             </div>

             {/* Resource Panel */}
             <div className="w-80 bg-[#1B1D25] border-r border-[#2A2D39] flex flex-col shrink-0 z-10 shadow-xl shadow-black/20">
                
                {["设备模型", "电器模型", "软装单体", "ROS小车", "导入", "模型库"].includes(selectedDesignerTool) ? (
                  // === 新模型库 UI ===
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-[#2A2D39] bg-[#16181E] shrink-0">
                       <h3 className="text-base font-bold text-white mb-1">模型库</h3>
                       <p className="text-xs text-zinc-500">按类型选择模型，可快速添加到 3D 场景画布。</p>
                       
                       {/* 统计信息 */}
                       <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
                         <span className="bg-[#2A2D39] px-2 py-1 rounded text-zinc-300">模型总数：<span className="font-bold text-white">{modelStats.total}</span></span>
                         <span className="bg-[#2A2D39] px-2 py-1 rounded text-zinc-300">设备模型：<span className="font-bold text-[#10A66A]">{modelStats.device}</span></span>
                         <span className="bg-[#2A2D39] px-2 py-1 rounded text-zinc-300">电器模型：<span className="font-bold text-white">{modelStats.electrical}</span></span>
                         <span className="bg-[#2A2D39] px-2 py-1 rounded text-zinc-300">软装单体：<span className="font-bold text-white">{modelStats.soft}</span></span>
                         <span className="bg-[#2A2D39] px-2 py-1 rounded text-zinc-300">其他模型：<span className="font-bold text-white">{modelStats.other}</span></span>
                       </div>
                    </div>

                    <div className="p-3 bg-[#1A1B23] shrink-0 space-y-3">
                       {/* 分类标签 */}
                       <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                         {["全部", "设备模型", "电器模型", "软装单体", "ROS小车", "导入模型"].map(cat => (
                           <button 
                             key={cat}
                             className={`shrink-0 px-3 py-1.5 text-xs rounded transition-colors ${
                               (selectedDesignerTool === "模型库" && cat === "全部") || selectedDesignerTool === cat || (selectedDesignerTool === "导入" && cat === "导入模型")
                                 ? 'bg-[#10A66A] text-white font-bold' 
                                 : 'bg-[#16181E] text-zinc-400 hover:bg-[#2A2D39] hover:text-zinc-200 border border-zinc-800'
                             }`}
                             onClick={() => {
                               setSelectedDesignerTool(cat === "导入模型" ? "导入" : cat === "全部" ? "模型库" : cat);
                             }}
                           >
                             {cat}
                           </button>
                         ))}
                       </div>

                       {/* 搜索与筛选 */}
                       <div className="bg-[#16181E] border border-[#2A2D39] rounded px-3 py-2 flex items-center gap-2">
                         <Search className="w-4 h-4 text-zinc-500" />
                         <input type="text" placeholder="请输入模型名称" className="bg-transparent border-none outline-none text-xs text-white w-full placeholder-zinc-600" value={modelSearchKeyword} onChange={e => setModelSearchKeyword(e.target.value)} />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-2">
                         <select className="col-span-2 bg-[#16181E] text-zinc-300 text-[11px] border border-[#2A2D39] rounded px-2 py-1.5 outline-none custom-select" value={modelStatusFilter} onChange={e => setModelStatusFilter(e.target.value)}>
                           <option value="全部">模型状态: 全部</option>
                           <option value="可添加">可添加</option>
                           <option value="已添加">已添加</option>
                           <option value="未绑定">未绑定</option>
                         </select>
                         <select className="bg-[#16181E] text-zinc-300 text-[11px] border border-[#2A2D39] rounded px-2 py-1.5 outline-none custom-select" value={modelTypeFilter} onChange={e => setModelTypeFilter(e.target.value)}>
                           <option value="全部">模型类型: 全部</option>
                           <option value="传感器">传感器</option>
                           <option value="控制器">控制器</option>
                           <option value="网关">网关</option>
                           <option value="执行器">执行器</option>
                           <option value="安防设备">安防设备</option>
                           <option value="能耗设备">能耗设备</option>
                           <option value="环境设备">环境设备</option>
                           <option value="感知类设备">感知类设备</option>
                           <option value="控制类设备">控制类设备</option>
                           <option value="网关与通信类设备">网关与通信类设备</option>
                           <option value="安防类设备">安防类设备</option>
                           <option value="能耗与仪表类设备">能耗与仪表类设备</option>
                         </select>
                         <select className="bg-[#16181E] text-zinc-300 text-[11px] border border-[#2A2D39] rounded px-2 py-1.5 outline-none custom-select" value={modelSceneFilter} onChange={e => setModelSceneFilter(e.target.value)}>
                           <option value="全部">适用场景: 全部</option>
                           <option value="智慧家居">智慧家居</option>
                           <option value="智慧农业">智慧农业</option>
                           <option value="智慧安防">智慧安防</option>
                           <option value="智慧交通">智慧交通</option>
                           <option value="智慧园区">智慧园区</option>
                           <option value="智慧能耗">智慧能耗</option>
                         </select>
                       </div>
                    </div>

                    {/* 卡片列表 */}
                    <div className="flex-1 overflow-y-auto p-3 bg-[#1A1B23]">
                      {filteredModels.length === 0 ? (
                        <div className="text-center text-zinc-500 text-xs mt-10">暂无符合条件的模型</div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {filteredModels.map((m, idx) => {
                             const isAdded = threeDSceneObjects.some(obj => obj.name === m.name);
                             return (
                               <div key={idx} className="bg-[#16181E] border border-zinc-800 hover:border-[#10A66A] rounded-lg overflow-hidden flex flex-col group cursor-pointer transition-colors" onClick={() => setSelectedModel(m)}>
                                 <div className="aspect-[4/3] bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                                   {m.category === "设备模型" ? <Cpu className="w-8 h-8 text-zinc-700 group-hover:text-[#10A66A]/50 transition-colors" /> :
                                    m.category === "电器模型" ? <Lightbulb className="w-8 h-8 text-zinc-700 group-hover:text-[#10A66A]/50 transition-colors" /> :
                                    m.category === "ROS小车" ? <MonitorPlay className="w-8 h-8 text-zinc-700 group-hover:text-[#10A66A]/50 transition-colors" /> :
                                    <Box className="w-8 h-8 text-zinc-700 group-hover:text-[#10A66A]/50 transition-colors" />}
                                   <div className="absolute bottom-1 right-1 text-[8px] text-zinc-600">模型预览</div>
                                 </div>
                                 <div className="p-2 flex flex-col gap-1.5 bg-[#1B1D25]">
                                   <div className="text-xs font-bold text-white truncate" title={m.name}>{m.name}</div>
                                   <div className="text-[9px] text-zinc-400 bg-zinc-800/50 px-1.5 py-0.5 rounded w-max truncate max-w-full">{m.type}</div>
                                   <div className="flex justify-between items-center mt-1">
                                     <span className={`text-[9px] px-1 py-0.5 rounded ${isAdded ? 'bg-[#10A66A]/10 text-[#10A66A]' : m.bindStatus === '未绑定' ? 'bg-zinc-800 text-zinc-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                       {isAdded ? "已添加" : m.bindStatus}
                                     </span>
                                     <button 
                                       className="w-5 h-5 rounded hover:bg-[#10A66A] hover:text-white text-zinc-500 flex items-center justify-center transition-colors"
                                       title="添加到场景"
                                       onClick={(e) => { e.stopPropagation(); handleAddObject(m); }}
                                     >
                                       <Plus className="w-3.5 h-3.5" />
                                     </button>
                                   </div>
                                 </div>
                               </div>
                             );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // === 旧的其他工具 UI ===
                  <>
                    <div className="p-3 border-b border-[#2A2D39] bg-[#16181E]">
                       <h3 className="text-sm font-bold text-white">{selectedDesignerTool}</h3>
                    </div>

                    {/* Subcategories (Only for old modules) */}
                    {selectedDesignerTool === "智慧场景" && (
                       <div className="px-2 pt-2 grid grid-cols-2 gap-1 mb-2">
                          {["智慧家居", "智慧农业", "智慧安防", "智慧交通", "智慧社区", "智慧能耗"].map(cat => (
                            <button 
                              key={cat}
                              className={`text-xs py-1.5 rounded transition-colors ${selectedResourceCategory === cat ? 'bg-[#10A66A]/20 text-[#10A66A] font-bold' : 'text-zinc-400 hover:bg-[#2A2D39]'}`}
                              onClick={() => setSelectedResourceCategory(cat)}
                            >
                              {cat}
                            </button>
                          ))}
                       </div>
                    )}
                    
                    {selectedDesignerTool === "模块" && (
                       <div className="px-3 py-2">
                          <div className="bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-zinc-500" />
                            <input type="text" placeholder="请输入关键词" className="bg-transparent border-none outline-none text-xs text-white w-full placeholder-zinc-600" />
                          </div>
                       </div>
                    )}

                    {/* Resource List for old modules */}
                    <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 content-start">
                       {/* 模块 Tool */}
                       {selectedDesignerTool === "模块" && ["智慧家居3D", "智慧能耗3D概览"].map(item => (
                         <div key={item} className="bg-[#2A2D39] border border-[#3A3D49] rounded aspect-square flex flex-col p-2 cursor-pointer hover:border-[#10A66A] transition-colors group" onClick={() => handleAddObject({ name: item, type: "模块" })}>
                           <div className="flex-1 bg-zinc-800 rounded flex items-center justify-center overflow-hidden relative">
                              <Hexagon className="w-8 h-8 text-zinc-600 opacity-20" />
                              <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           </div>
                           <div className="text-[10px] text-center mt-2 font-bold text-zinc-300 truncate w-full" title={item}>{item}</div>
                         </div>
                       ))}

                       {/* 智慧场景 Tool */}
                       {selectedDesignerTool === "智慧场景" && selectedResourceCategory === "智慧家居" && ["家居场景", "娱乐影音"].map(item => (
                         <div key={item} className="bg-[#2A2D39] border border-[#3A3D49] rounded flex flex-col p-2 cursor-pointer hover:border-[#10A66A] transition-colors aspect-square" onClick={() => {
                            handleAddObject({ name: item, type: "智慧场景" });
                            setCurrentSceneName(item);
                         }}>
                           <div className="flex-1 bg-zinc-800 rounded flex items-center justify-center"><ImageIcon className="w-6 h-6 text-zinc-600" /></div>
                           <div className="text-[10px] text-center mt-2 font-bold text-zinc-300">{item}</div>
                         </div>
                       ))}
                    </div>
                  </>
                )}
             </div>

             {/* Canvas Area */}
             <div className="flex-1 bg-black relative flex flex-col overflow-hidden">
                {/* 3D Scene Simulation */}
                <div className="absolute inset-0 flex flex-col z-0">
                  <div className="h-2/5 bg-gradient-to-b from-[#1c2c4d] via-[#1a233a] to-[#202124]"></div>
                  <div className="h-3/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-800 to-zinc-900 border-t border-zinc-700/50 shadow-[inset_0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center perspective-[1800px] overflow-hidden">
                     
                     <div className="relative w-full h-full transform-style-3d flex items-center justify-center" style={{ transform: 'rotateX(40deg) scale(1.15)', transformStyle: 'preserve-3d' }}>
                       {/* Grid lines */}
                       <div className="absolute w-[800px] h-[800px] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                       {/* Scene Objects Simulation */}
                       {threeDSceneObjects.length === 0 ? (
                         <div className="absolute -translate-y-10 text-zinc-400 font-bold bg-[#1a1b23]/80 px-4 py-2 rounded-lg backdrop-blur shadow-2xl border border-zinc-700" style={{ transform: 'rotateX(-40deg)' }}>
                           请从左侧资源面板选择场景、设备或模型添加到画布
                         </div>
                       ) : (
                         <div className="absolute inset-0 flex items-center justify-center">
                            {threeDSceneObjects.map((obj, i) => {
                               const isSelected = selectedSceneObject?.id === obj.id;
                               const offsetX = ((i * 120) % 400) - 150;
                               const offsetY = ((i * 80) % 300) - 100;
                               return (
                                 <div 
                                   key={obj.id}
                                   className="absolute cursor-pointer group flex flex-col items-center justify-center transform-style-3d"
                                   style={{ transform: `translate3d(${offsetX}px, ${offsetY}px, 0)` }}
                                   onClick={() => setSelectedSceneObject(obj)}
                                 >
                                    {/* 3D Base Pedestal - Lies flat on the grid floor */}
                                    <div className={`absolute w-24 h-12 rounded-full bg-[radial-gradient(ellipse,_rgba(16,166,106,0.25)_0%,_transparent_75%)] border ${isSelected ? 'border-[#10A66A] opacity-100 shadow-[0_0_12px_rgba(16,166,106,0.5)]' : 'border-zinc-700/30'} pointer-events-none`} style={{ transform: 'rotateX(0deg) translateZ(-5px)' }}></div>
                                    <div className={`absolute w-16 h-8 rounded-full bg-[#16181E]/80 border ${isSelected ? 'border-[#10A66A]' : 'border-zinc-805'} pointer-events-none`} style={{ transform: 'rotateX(0deg) translateZ(0px)' }}></div>

                                    {/* Upright Device Billboard - tilted back to meet perspective perfectly */}
                                    <div 
                                      className="transform-style-3d flex flex-col items-center relative"
                                      style={{ transform: 'rotateX(-45deg) translate3d(0, -15px, 10px)', transformOrigin: 'bottom center' }}
                                    >
                                       <div className={`w-16 h-16 bg-[#16181E] rounded-xl flex flex-col items-center justify-center shadow-2xl transition-all relative ${(() => {
                                           const animState = getObjectAnimationState(obj);
                                           const isBlinkingVal = animState.animType === "浅红色闪烁标签" || animState.animType === "闪烁告警" || animState.animType === "红色快速闪烁" || animState.animType === "红色闪烁" || animState.stateName === "紧急报警" || animState.stateName === "异常";
                                           const isVibrating = animState.animType === "抖动告警" || animState.stateName === "故障" || animState.stateName === "异常";
                                           return `${isSelected ? 'border-2 border-[#10A66A] shadow-[#10A66A]/45 ring-1 ring-[#10A66A]' : 'border border-zinc-700/60 hover:border-zinc-500'} ${isVibrating ? 'animate-[bounce_0.6s_infinite_alternate]' : ''} ${isBlinkingVal ? 'ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)]' : ''}`;
                                        })()}`}>
                                      {(() => {
                                        const animState = getObjectAnimationState(obj);
                                        const isSpinning = animState.animType === "扇叶旋转" || animState.animType === "旋转动效" || animState.stateName === "运行中" && obj.name.includes("风机");
                                        const isPulsing = animState.animType === "发光动效" || animState.animType === "呼吸光效" || animState.animType === "灯光发光" || animState.stateName === "开启" || animState.stateName === "高亮发光";
                                        const isFlowing = animState.animType === "水流线条" || animState.animType === "水流线条动效" || animState.stateName === "运行中" && obj.name.includes("水泵");
                                        const isBlinkingVal = animState.animType === "浅红色闪烁标签" || animState.animType === "闪烁告警" || animState.animType === "红色快速闪烁" || animState.animType === "红色闪烁" || animState.stateName === "紧急报警" || animState.stateName === "异常";
                                        
                                        let indicatorBg = "bg-zinc-500";
                                        if (animState.color === "green") indicatorBg = "bg-emerald-500";
                                        else if (animState.color === "orange") indicatorBg = "bg-orange-500";
                                        else if (animState.color === "red") indicatorBg = "bg-red-500 animate-pulse";
                                        else if (animState.color === "yellow") indicatorBg = "bg-yellow-400 animate-pulse";

                                        let ModelComponent = <Box className="w-6 h-6 text-zinc-400" />;
                                        if (obj.name.includes("风机")) {
                                          ModelComponent = <Fan className={`w-8 h-8 transition-transform duration-[400ms] ${isSpinning ? 'animate-spin text-[#10A66A]' : animState.color === 'red' ? 'text-red-500 animate-[bounce_0.6s_infinite]' : 'text-zinc-500'}`} style={{ animationDuration: isSpinning ? '0.6s' : undefined }} />;
                                        } else if (obj.name.includes("水泵")) {
                                          ModelComponent = <Droplets className={`w-8 h-8 transition-all duration-300 ${isFlowing ? 'text-sky-400 animate-bounce' : animState.color === 'red' ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`} />;
                                        } else if (obj.name.includes("补光灯")) {
                                          ModelComponent = <Lightbulb className={`w-7 h-7 transition-all duration-300 ${isPulsing ? 'text-yellow-400 filter drop-shadow-[0_0_15px_rgba(250,204,21,0.95)] scale-110' : 'text-zinc-650'}`} />;
                                        } else if (obj.name.includes("传感器") || obj.name.includes("温湿度")) {
                                          ModelComponent = <Cpu className={`w-7 h-7 transition-all duration-300 ${animState.color === 'red' ? 'text-red-500 animate-pulse' : animState.color === 'orange' ? 'text-orange-400 font-bold' : 'text-emerald-400'}`} />;
                                        } else if (obj.name.includes("网关")) {
                                          ModelComponent = <Network className={`w-7 h-7 transition-all duration-300 ${animState.color === 'red' ? 'text-red-500' : 'text-emerald-400'}`} />;
                                        } else if (obj.name.includes("报警灯")) {
                                          ModelComponent = <Bell className={`w-7 h-7 transition-all duration-300 ${isBlinkingVal ? 'text-red-500 animate-bounce' : 'text-zinc-400'}`} />;
                                        } else {
                                          ModelComponent = obj.category === '设备模型' ? <Cpu className="w-6 h-6 text-zinc-400" /> : <Box className="w-6 h-6 text-zinc-400" />;
                                        }

                                        return (
                                          <>
                                            {ModelComponent}
                                            <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-black/35 ${indicatorBg}`} />
                                          </>
                                        );
                                      })()}
                                    </div>
                                    <div className={`text-[10px] text-center mt-1 font-bold bg-[#1A1B23]/90 px-1 py-0.5 rounded ${isSelected ? 'text-[#10A66A]' : 'text-white'}`}>{obj.name}</div>
                                    
                                                                        {/* Data Label */}
                                    {(() => {
                                      const animState = getObjectAnimationState(obj);
                                      const hasDraggableWidget = canvasDataWidgets.some(w => w.objectId === obj.id);
                                      if (hasDraggableWidget) return null;
                                      if (animState.propName !== '-') {
                                          const isSelected = selectedSceneObject?.id === obj.id;
                                          let indicatorBg = "bg-zinc-500";
                                          if (animState.color === "green") indicatorBg = "bg-[#10A66A]";
                                          else if (animState.color === "orange") indicatorBg = "bg-orange-500";
                                          else if (animState.color === "red") indicatorBg = "bg-red-500 animate-pulse";
                                          else if (animState.color === "yellow") indicatorBg = "bg-yellow-400 animate-pulse";

                                          const colorText = animState.color === 'green' ? 'text-[#10A66A]' : animState.color === 'orange' ? 'text-orange-400 font-bold' : animState.color === 'red' ? 'text-red-400 animate-pulse font-bold' : animState.color === 'yellow' ? 'text-yellow-400 font-bold' : 'text-zinc-400';
                                          const borderClr = isSelected ? 'border-[#10A66A] ring-1 ring-[#10A66A]' : 'border-[#2D303D]';
                                          
                                          return (
                                            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 p-2 bg-[#12131A]/95 border ${borderClr} rounded-lg shadow-[0_4px_22px_rgba(0,0,0,0.65)] min-w-[130px] z-10 flex flex-col items-start pointer-events-auto whitespace-nowrap`}>
                                              <div className="flex items-center gap-1.5 justify-between w-full border-b border-[#2A2D39]/60 pb-1 mb-1">
                                                <span className="text-[10px] font-bold text-white font-mono truncate max-w-[85px]">{obj.name}</span>
                                                <span className={`w-2 h-2 rounded-full ${indicatorBg}`} />
                                              </div>
                                              <div className="flex flex-col gap-0.5 text-left w-full">
                                                <div className="flex items-center gap-1 text-[9px]">
                                                  <span className="text-zinc-500 col-span-1">状态：</span>
                                                  <span className={`col-span-1 font-bold ${colorText}`}>{animState.stateName}</span>
                                                </div>
                                                <div className="flex flex-col text-[8.5px] text-zinc-400 font-mono mt-0.5 leading-tight">
                                                  <span>采集：{animState.propName}</span>
                                                  <span className="text-zinc-200 font-bold">数值：{animState.val}</span>
                                                </div>
                                                <div className="text-[7.5px] text-zinc-500 font-sans mt-1 pt-0.5 border-t border-[#2A2D39]/30 w-full flex justify-between items-center">
                                                  <span>仿真源:</span>
                                                  <span className="text-zinc-400 font-mono font-bold scale-90">仿真平台</span>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                       }
                                       const pConf = sceneObjectPropertyConfig[obj.id];
                                      
                                      const vConf = pConf?.voiceConfig;
                                      const showVoice = vConf?.applied && vConf.showBtn;
                                      const voiceIcon = vConf?.applied ? <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 p-1 bg-[#10A66A] rounded-full shadow-lg z-20"><Volume2 className="w-3 h-3 text-white" /></div> : null;

                                      const aConf = pConf?.anchorConfig;
                                      const anchorIcon = aConf?.applied ? <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 p-1 bg-[#007BFF] rounded-full shadow-lg z-20"><MapPin className="w-3 h-3 text-white" /></div> : null;

                                      if (pConf?.labelConfig?.applied && pConf.labelConfig.enabled) {
                                        const lc = pConf.labelConfig;
                                        const jc = pConf?.jumpButtonConfig?.applied && pConf?.jumpButtonConfig?.enabled ? pConf.jumpButtonConfig : null;
                                        
                                        return (
                                          <>
                                            {voiceIcon}
                                            {anchorIcon}
                                            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 ${lc.style === '透明样式' ? 'bg-[#16181E]/30' : 'bg-[#1A1B23]/95'} border ${isSelected ? 'border-[#10A66A]' : 'border-[#2A2D39]'} rounded shadow-xl min-w-[120px] z-10 flex flex-col items-center pointer-events-auto whitespace-nowrap`}>
                                                <div className="flex flex-col w-full text-left gap-1">
                                                    <span className="text-[10px] font-bold text-white flex items-center justify-between border-b border-[#2A2D39] pb-1">{lc.title} {lc.showIcon && <Settings className="w-3 h-3 text-zinc-500" />}</span>
                                                    <span className="text-xs text-[#10A66A] font-bold mt-0.5">{lc.content}</span>
                                                    {lc.showDevice && <span className="text-[9px] text-zinc-400">设备: {obj.name}</span>}
                                                    {lc.showTime && <span className="text-[9px] text-zinc-500">更新: 10:40:20</span>}
                                                    {jc && (
                                                      <button 
                                                        className="mt-1.5 w-full py-1 bg-[#10A66A]/20 hover:bg-[#10A66A]/30 border border-[#10A66A]/30 text-[#10A66A] rounded text-[9px] transition-colors font-bold pointer-events-auto"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTargetPanelVisible({
                                                              title: jc.target,
                                                              visible: true,
                                                              data: { name: obj.name, id: obj.id }
                                                            });
                                                            setDesignerToast("已打开" + jc.target);
                                                            setTimeout(() => setDesignerToast(""), 3000);
                                                        }}
                                                      >{jc.btnName}</button>
                                                    )}
                                                    {showVoice && (
                                                      <button 
                                                        className="mt-1 w-full py-1 bg-[#007BFF]/20 hover:bg-[#007BFF]/30 border border-[#007BFF]/30 text-[#4da3ff] rounded text-[9px] transition-colors font-bold pointer-events-auto flex items-center justify-center gap-1"
                                                        onClick={(e) => { e.stopPropagation(); setDesignerToast("播放语音"); setTimeout(() => setDesignerToast(""), 3000); }}
                                                      ><Volume2 className="w-3 h-3" />播放语音</button>
                                                    )}
                                                </div>
                                            </div>
                                          </>
                                        );
                                      }

                                      // fallback to original static / dynamic logic if labelConfig isn't applied
                                      const conf = sceneObjectDataConfig[obj.id];
                                      if (!conf || !conf.applied) return (
                                        <>
                                          {voiceIcon}
                                          {anchorIcon}
                                        </>
                                      );
                                      
                                      if (conf.dataMode === '静态数据' && conf.staticDataConfig) {
                                        const sc = conf.staticDataConfig;
                                        const colClass = sc.color === '绿色' ? 'text-[#10A66A]' : sc.color === '橙色' ? 'text-orange-400' : sc.color === '浅红色' ? 'text-red-500' : 'text-zinc-300';
                                        return (
                                          <>
                                          {voiceIcon}
                                          {anchorIcon}
                                          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1.5 bg-[#16181E]/90 border ${isSelected ? 'border-[#10A66A]' : 'border-[#2A2D39]'} rounded shadow-xl min-w-[80px] z-10 flex flex-col items-center pointer-events-none whitespace-nowrap`}>
                                            <div className="text-[10px] text-zinc-400">{sc.name || '数据'}</div>
                                            <div className={`text-xs font-bold font-mono ${colClass}`}>{sc.val || '-'} <span className="text-[9px] font-normal">{sc.unit}</span></div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                              <div className={`w-1.5 h-1.5 rounded-full ${sc.color === '绿色' ? 'bg-[#10A66A]' : 'bg-zinc-500'}`}></div>
                                              <div className={`text-[9px] ${colClass}`}>{sc.status || '正常'}</div>
                                            </div>
                                          </div>
                                          </>
                                        );
                                      } else if (conf.dataMode === '动态数据' && conf.dynamicDataConfig) {
                                        const dyn = conf.dynamicDataConfig;
                                        const isVirtual = dyn.sourceType === '工程虚拟仿真平台数据';
                                        
                                        const now = new Date();
                                        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

                                        if (isVirtual) {
                                            const devMeta = VIRTUAL_DEVICES.find(d => d.id === dyn.deviceId);
                                            const statusStatus = virtualSimulationReceiveStatus === '接收中' ? '接收中' : virtualSimulationReceiveStatus === '已暂停' ? '已暂停' : '未接收';
                                            const isReceiving = virtualSimulationReceiveStatus === '接收中';
                                            const isPaused = virtualSimulationReceiveStatus === '已暂停';
                                            
                                            let indicatorColor = isReceiving ? 'bg-[#10A66A]' : isPaused ? 'bg-orange-400' : 'bg-zinc-500';
                                            let textColor = isReceiving ? 'text-[#10A66A]' : isPaused ? 'text-orange-400' : 'text-zinc-500';

                                            return (
                                              <>
                                              {voiceIcon}
                                              {anchorIcon}
                                              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-[#16181E]/90 border ${isSelected ? 'border-[#10A66A]' : 'border-[#2A2D39]'} rounded shadow-xl min-w-[120px] z-10 flex flex-col items-center pointer-events-none whitespace-nowrap animate-in fade-in duration-500`}>
                                                <div className="text-[11px] text-zinc-300 font-bold border-b border-[#2A2D39] pb-1 mb-1.5 w-full text-center truncate">{devMeta?.name?.split(' ')[0] || (devMeta?.name || dyn.deviceId)}</div>
                                                {(dyn.fields || []).map((fId: string) => {
                                                   const propMeta = devMeta?.props.find((p:any) => p.id === fId);
                                                   let val = dyn.deviceId ? (virtualDeviceData[dyn.deviceId]?.[fId] ?? '-') : '-';
                                                   if (propMeta?.type === '枚举') {
                                                      val = val === 'on' ? '运行中' : '已关闭';
                                                   }
                                                   return (
                                                     <div key={fId} className="flex justify-between items-center w-full gap-4 px-1 my-0.5">
                                                       <span className="text-[9px] text-zinc-400">{propMeta?.name || fId}：</span>
                                                       <span className="text-[10px] font-bold font-mono text-[#10A66A]">{val} <span className="text-[8px] font-normal">{propMeta?.unit !== '-' ? propMeta?.unit : ''}</span></span>
                                                     </div>
                                                   );
                                                })}
                                                <div className="flex justify-between items-center w-full mt-1.5 gap-4 px-1">
                                                   <span className="text-[9px] text-zinc-400">来源：</span>
                                                   <span className="text-[9px] text-zinc-300">工程虚拟仿真平台</span>
                                                </div>
                                                <div className="flex justify-between items-center w-full gap-4 px-1">
                                                   <span className="text-[9px] text-zinc-400">状态：</span>
                                                   <div className="flex items-center gap-1">
                                                     <div className={`w-1.5 h-1.5 rounded-full ${indicatorColor}`}></div>
                                                     <div className={`text-[9px] ${textColor}`}>{statusStatus}</div>
                                                   </div>
                                                </div>
                                                <div className="flex justify-between items-center w-full gap-4 px-1">
                                                   <span className="text-[9px] text-zinc-400 border-[#2A2D39] pt-0.5">更新时间：</span>
                                                   <span className="text-[9px] text-zinc-500 font-mono pt-0.5">{isReceiving || isPaused ? (virtualDataReceiveRecords[0]?.time || timeStr) : '--:--:--'}</span>
                                                </div></div>
                                              </>
                                            );
                                        }

                                        const devMeta = CLOUD_DEVICES.find(d => d.id === dyn.deviceId);
                                        const propMeta = devMeta?.props.find(p => p.id === dyn.propertyId);
                                        const val = dyn.deviceId ? (cloudDeviceData[dyn.deviceId]?.[dyn.propertyId] ?? '-') : '-';
                                        
 
                                      return (
                                          <>
                                          {voiceIcon}
                                          {anchorIcon}
                                          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1.5 bg-[#16181E]/90 border ${isSelected ? 'border-[#10A66A]' : 'border-[#2A2D39]'} rounded shadow-xl min-w-[80px] z-10 flex flex-col items-center pointer-events-none whitespace-nowrap`}>
                                            <div className="text-[10px] text-zinc-400">{propMeta?.name || '数据'}</div>
                                            <div className="text-xs font-bold font-mono text-[#10A66A]">{val} <span className="text-[9px] font-normal">{propMeta?.unit}</span></div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                              <div className={`w-1.5 h-1.5 rounded-full ${dataReceiveStatus === '接收中' ? 'bg-[#10A66A]' : 'bg-zinc-500'}`}></div>
                                              <div className={`text-[9px] ${dataReceiveStatus === '接收中' ? 'text-[#10A66A]' : 'text-zinc-500'}`}>{dataReceiveStatus === '接收中' ? '在线' : '已连接'}</div>
                                            </div>
                                            <div className="text-[8px] text-zinc-500 mt-0.5 font-mono">更新时间: {dataReceiveStatus === '接收中' ? timeStr : '--:--:--'}</div>
                                          </div>
                                          </>
                                        );
                                      }
                                      return (
                                          <>
                                          {voiceIcon}
                                          {anchorIcon}
                                          </>
                                      );
                                    })()}
                                    </div>
                                  </div>
                                )
                            })}
                         </div>
                       )}
                     </div>

                  </div>
                </div>

                 {/* Draggable Data Widgets Overlays Layer */}
                 <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                   {canvasDataWidgets.map((widget) => {
                     const isSelected = selectedSceneObject?.id === widget.objectId;
                     const isWidgetSelected = selectedDataWidgetId === widget.id;
                     const animState = getObjectAnimationState({ id: widget.objectId, name: widget.modelName } as any);
                     const fields = widget.fields;
                     
                     let indicatorBg = "bg-zinc-500";
                     if (animState.color === "green") indicatorBg = "bg-[#10A66A]";
                     else if (animState.color === "orange") indicatorBg = "bg-orange-500";
                     else if (animState.color === "red") indicatorBg = "bg-red-500 animate-pulse";
                     else if (animState.color === "yellow") indicatorBg = "bg-yellow-400 animate-pulse";

                     const colorText = animState.color === 'green' ? 'text-[#10A66A]' : animState.color === 'orange' ? 'text-orange-400 font-bold' : animState.color === 'red' ? 'text-red-400 animate-pulse font-bold' : animState.color === 'yellow' ? 'text-yellow-400 font-bold' : 'text-zinc-400';
                     const borderClr = isSelected || isWidgetSelected 
                       ? 'border-[#10A66A] ring-2 ring-[#10A66A]/40' 
                       : widget.isDragging 
                         ? 'border-[#10A66A] ring-2 ring-[#10A66A]' 
                         : 'border-[#2D303D]';
                     
                     return (
                       <div
                         key={widget.id}
                         id={widget.id}
                         style={{ 
                           left: `${widget.x}px`, 
                           top: `${widget.y}px`, 
                           zIndex: widget.zIndex || 12 
                         }}
                         className={`absolute p-2.5 bg-[#12131A]/95 border ${borderClr} rounded-lg shadow-[0_4px_22px_rgba(0,0,0,0.65)] min-w-[140px] pointer-events-auto transition-transform active:scale-[1.01] flex flex-col items-start select-none ${widget.isDragging ? 'opacity-85 ring-2 ring-[#10A66A]' : ''}`}
                         onClick={(e) => {
                           e.stopPropagation();
                           setSelectedDataWidgetId(widget.id);
                           const relativeObj = threeDSceneObjects.find(obj => obj.id === widget.objectId);
                           if (relativeObj) {
                             setSelectedSceneObject(relativeObj);
                           }
                         }}
                       >
                         {/* Drag Handle & Control Bar */}
                         <div className="flex items-center gap-1.5 justify-between w-full border-b border-[#2A2D39]/60 pb-1 mb-1.5 cursor-grab active:cursor-grabbing hover:bg-zinc-800/40 rounded px-1 -mx-1"
                           onPointerDown={(e) => handleWidgetPointerDown(e, widget.id)}
                         >
                           <div className="flex items-center gap-1 min-w-0">
                             <GripVertical className="w-3 h-3 text-zinc-500 shrink-0" />
                             <span className="text-[10px] font-bold text-white font-mono truncate" title={widget.modelName}>
                               {widget.modelName}
                             </span>
                           </div>
                           
                           <div className="flex items-center gap-1 shrink-0">
                             <span className={`w-2 h-2 rounded-full ${indicatorBg}`} />
                             <button 
                               className="text-zinc-500 hover:text-white p-0.5 transition-colors"
                               title={widget.locked ? "已锁定坐标" : "锁定位置"}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 const timeNow = new Date().toTimeString().split(' ')[0];
                                 const operationType = widget.locked ? "解除锁定" : "锁定位置";
                                 const logMsg = `数据标签 ${widget.modelName} ${operationType}`;
                                 
                                 setOperationRecords(prevLogs => [
                                   {
                                     id: Date.now(),
                                     time: timeNow,
                                     modelName: widget.modelName,
                                     type: operationType,
                                     content: logMsg,
                                     result: "成功",
                                     user: "学生1"
                                   },
                                   ...prevLogs
                                 ]);
                                 showToast(logMsg);

                                 setCanvasDataWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, locked: !w.locked } : w));
                               }}
                             >
                               {widget.locked ? <Lock className="w-3 h-3 text-[#10A66A]" /> : <Unlock className="w-3 h-3 block" />}
                             </button>
                           </div>
                         </div>

                         {/* Real-time Data Display Rows */}
                         <div className="flex flex-col gap-1 text-left w-full">
                           <div className="flex items-center justify-between text-[9px] text-zinc-400">
                             <span>当前状态:</span>
                             <span className={`font-bold ${colorText}`}>{animState.stateName}</span>
                           </div>
                           
                           {fields.map((f: string) => {
                             const pData = VIRTUAL_DEVICES.find(d => d.id === widget.deviceId)?.props.find((p:any) => p.id === f);
                             let valStr = virtualDeviceData[widget.deviceId]?.[f] ?? '-';
                             if (pData?.type === '枚举') valStr = valStr === 'on' ? '运行中' : '已关闭';
                             const labelStr = pData?.name || (f === 'temperature' ? '温度' : f === 'humidity' ? '湿度' : f === 'fanStatus' ? '发热状态' : f);
                             const unitStr = (pData?.unit && pData.unit !== '-') ? pData.unit : '';

                             return (
                               <div key={f} className="flex justify-between items-center text-[9px] font-mono leading-none py-0.5 border-t border-[#2A2D39]/30">
                                 <span className="text-zinc-500">{labelStr}:</span>
                                 <span className="text-zinc-200 font-bold">{valStr} <span className="text-[7.5px] text-zinc-500 font-normal">{unitStr}</span></span>
                               </div>
                             );
                           })}

                           <div className="text-[7.5px] text-zinc-500 font-sans mt-1.5 pt-1 border-t border-[#2A2D39]/30 w-full flex justify-between items-center">
                             <span>仿真源:</span>
                             <span className="text-[#10A66A] font-mono font-bold scale-90 bg-[#10A66A]/10 px-1 rounded-sm">仿真平台</span>
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>

                {/* Right Top Canvas Overlays */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-xs">
                   <div className="bg-[#1A1B23]/90 backdrop-blur border border-[#10A66A]/30 rounded-full px-5 py-2 flex items-center justify-between min-w-[300px] shadow-lg shadow-[#10A66A]/10">
                      <div className="flex items-center gap-2 mr-6">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${virtualSimulationReceiveStatus === '接收中' ? 'bg-[#10A66A]' : virtualSimulationConnectionStatus === '已连接' ? 'bg-[#10A66A]/50' : 'bg-zinc-600'}`}></div>
                        <span className={`font-bold whitespace-nowrap ${virtualSimulationReceiveStatus === '接收中' ? 'text-[#10A66A]' : virtualSimulationConnectionStatus === '已连接' ? 'text-[#10A66A]/70' : 'text-zinc-500'}`}>工程虚拟仿真平台数据接入中</span>
                      </div>
                      <div className="flex gap-4 text-[10px] text-zinc-400">
                        <span className="truncate max-w-[120px]">当前工程：{virtualSimulationProject}</span>
                        <span>已接收设备：{VIRTUAL_DEVICES.length} 台</span>
                        <span>刷新频率：2 秒</span>
                      </div>
                   </div>
                </div>

                {/* Old Top Right Overlays */}
                <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2 text-xs">
                   <div className="bg-[#1A1B23]/80 backdrop-blur border border-[#2A2D39] rounded px-3 py-1.5 flex items-center justify-between min-w-[150px]">
                      <span className="font-bold text-zinc-300 truncate w-24">当前：{currentSceneName}</span>
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                      <select 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        value={currentSceneName}
                        onChange={e => {
                          setCurrentSceneName(e.target.value);
                          addLog(`切换场景至 ${e.target.value}`);
                        }}
                      >
                        <option>主场景</option>
                        <option>智慧温室场景</option>
                        <option>智慧家居场景</option>
                        <option>智慧矿山场景</option>
                        <option>智慧牧场场景</option>
                      </select>
                   </div>
                </div>

                {/* Bottom Canvas Overlays (Logs and Objects List) */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-4 h-48">
                   
                   {/* Object List */}
                   <div className="w-1/3 bg-[#1A1B23]/90 backdrop-blur border border-[#2A2D39] rounded-lg flex flex-col overflow-hidden shadow-2xl">
                     <div className="bg-[#16181E] px-3 py-2 border-b border-[#2A2D39] flex items-center justify-between text-xs">
                        <span className="font-bold text-white">场景对象</span>
                        <div className="flex gap-2">
                           <button className="text-zinc-400 hover:text-white"><Filter className="w-3.5 h-3.5" /></button>
                           <button className="text-zinc-400 hover:text-white"><Search className="w-3.5 h-3.5" /></button>
                        </div>
                     </div>
                     <div className="flex-1 overflow-x-auto overflow-y-auto">
                        <table className="w-full text-left text-[9px] border-collapse border-[#2A2D39] min-w-[500px]">
                          <thead className="bg-[#16181E]/50 sticky top-0 border-b border-[#2A2D39]">
                            <tr className="text-zinc-500">
                              <th className="font-medium p-2">对象名称</th>
                              <th className="font-medium p-2">对象类型</th>
                              <th className="font-medium p-2">绑定仿真设备</th>
                              <th className="font-medium p-2">绑定属性</th>
                              <th className="font-medium p-2">当前属性值</th>
                              <th className="font-medium p-2 text-white font-bold">当前动效</th>
                              <th className="font-medium p-2">当前状态</th>
                              <th className="font-medium p-2 text-right">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2A2D39]">
                            {threeDSceneObjects.map(obj => {
                              const conf = sceneObjectDataConfig[obj.id];
                              const isVirtual = conf?.dataMode === '动态数据' && conf?.dynamicDataConfig?.sourceType === '工程虚拟仿真平台数据';
                              const bindDevice = isVirtual ? conf?.dynamicDataConfig?.deviceId : "-";
                              const bindPlatform = isVirtual ? "工程虚拟仿真平台" : "-";
                              const fields = isVirtual ? (conf?.dynamicDataConfig?.fields || []) : [];
                              const dataMode = conf?.dataMode || "-";
                              const receives = isVirtual ? virtualSimulationReceiveStatus : '-';
                              
                              let currentValues = '-';
                              if (isVirtual && fields.length > 0) {
                                  currentValues = fields.map((f: string) => {
                                      const pData = VIRTUAL_DEVICES.find(d => d.id === bindDevice)?.props.find((p:any) => p.id === f);
                                      if (!pData) return '-';
                                      let val = virtualDeviceData[bindDevice]?.[f] ?? '-';
                                      if (pData.type === '枚举') val = val === 'on' ? '运行中' : '已关闭';
                                      return `${val}${pData.unit! !== '-' ? pData.unit : ''}`;
                                  }).join(' / ');
                              }

                              return (
                              <tr 
                                key={obj.id} 
                                className={`text-zinc-300 hover:bg-[#2A2D39]/50 cursor-pointer ${selectedSceneObject?.id === obj.id ? 'bg-[#10A66A]/10 text-white' : ''}`}
                                onClick={() => setSelectedSceneObject(obj)}
                              >
                                {(() => {
                                  const animState = getObjectAnimationState(obj);
                                  
                                  // Determine bound virtual device ID based on model name
                                  let devId = "-";
                                  if (obj.name.includes("传感器") || obj.name.includes("温湿度")) devId = "temp01";
                                  else if (obj.name.includes("风机")) devId = "fan01";
                                  else if (obj.name.includes("水泵")) devId = "pump01";
                                  else if (obj.name.includes("补光灯") || obj.name.includes("灯")) devId = "lamp01";
                                  else if (obj.name.includes("网关") || obj.name.includes("Modbus")) devId = "gw01";
                                  else if (obj.name.includes("报警灯")) devId = "alarm01";

                                  return (
                                    <>
                                      <td className="p-2 font-bold truncate max-w-[80px]" title={obj.name}>{obj.name}</td>
                                      <td className="p-2 text-zinc-500">{obj.category || obj.type}</td>
                                      <td className="p-2 font-mono text-zinc-400">{devId}</td>
                                      <td className="p-2 text-zinc-400 font-mono">{animState.propName}</td>
                                      <td className="p-2 font-mono text-[#10A66A] font-bold">{animState.val}</td>
                                      <td className="p-2 font-bold text-[#10A66A]">{animState.animType}</td>
                                      <td className="p-2">
                                         <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                                           animState.color === 'green' ? 'bg-[#10A66A]/10 text-[#10A66A]' : 
                                           animState.color === 'orange' ? 'bg-orange-500/10 text-orange-400' : 
                                           animState.color === 'red' ? 'bg-red-500/10 text-red-550 animate-pulse' : 
                                           animState.color === 'yellow' ? 'bg-yellow-400/10 text-yellow-500' : 'bg-[#2A2D39] text-zinc-400'
                                         }`}>
                                           {animState.stateName}
                                         </span>
                                      </td>
                                      <td className="p-2 text-right"><button className="text-[#10A66A] hover:text-white font-bold" onClick={(e) => { e.stopPropagation(); setSelectedSceneObject(obj); showToast("已定位至 " + obj.name); }}>定位</button></td>
                                    </>
                                  );
                                })()}
                              </tr>
                            )})}
                            {threeDSceneObjects.length === 0 && (
                               <tr><td colSpan={8} className="p-4 text-center text-zinc-600">暂无场景对象</td></tr>
                            )}
                          </tbody>
                        </table>
                     </div>
                   </div>

                   {/* Data Receive Records */}
                   <div className="w-1/3 bg-[#1A1B23]/90 backdrop-blur border border-[#2A2D39] rounded-lg flex flex-col overflow-hidden shadow-2xl">
                     <div className="bg-[#16181E] px-3 py-2 border-b border-[#2A2D39] flex items-center justify-between text-xs">
                        <span className="font-bold text-white">工程虚拟仿真数据接收记录</span>
                        <div className="flex gap-2">
                          <button className="text-zinc-400 hover:text-white text-[10px]" onClick={() => setDataReceiveRecords([])}>清空</button>
                        </div>
                     </div>
                     <div className="flex-1 overflow-x-auto overflow-y-auto">
                        <table className="w-full text-left text-[9px] border-collapse min-w-[500px]">
                          <thead className="bg-[#16181E]/50 sticky top-0 border-b border-[#2A2D39]">
                            <tr className="text-zinc-500">
                              <th className="font-medium p-1.5 font-mono whitespace-nowrap">接收时间</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">模型名称</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">仿真设备</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">设备编号</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">数据项</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">数据值</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">单位</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">数据来源</th>
                              <th className="font-medium p-1.5 whitespace-nowrap">接收状态</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2A2D39]">
                            {virtualDataReceiveRecords.map((rec, i) => (
                              <tr key={i} className="text-zinc-300 hover:bg-[#2A2D39]/50">
                                <td className="p-1.5 font-mono text-zinc-500 whitespace-nowrap">{rec.time}</td>
                                <td className="p-1.5 truncate max-w-[80px]" title={rec.modelName}>{rec.modelName}</td>
                                <td className="p-1.5 truncate max-w-[80px]">{rec.targetDeviceName}</td>
                                <td className="p-1.5 text-zinc-400 font-mono">{rec.deviceId}</td>
                                <td className="p-1.5 font-mono text-[#10A66A]">{rec.field}</td>
                                <td className="p-1.5 font-mono text-white">{rec.val}</td>
                                <td className="p-1.5 text-zinc-500">{rec.unit}</td>
                                <td className="p-1.5 text-zinc-400">{rec.source}</td>
                                <td className="p-1.5 text-[#10A66A] break-keep whitespace-nowrap bg-[#10A66A]/10 px-1 rounded-sm border border-[#10A66A]/20">{rec.type}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                     </div>
                   </div>

                   {/* Operation Logs & Config Records */}
                   <div className="w-1/3 bg-[#1A1B23]/90 backdrop-blur border border-[#2A2D39] rounded-lg flex flex-col overflow-hidden shadow-2xl">
                     <div className="bg-[#16181E] px-3 py-2 border-b border-[#2A2D39] flex items-center justify-between text-xs">
                        <div className="flex gap-4">
                            <button 
                              className={`font-bold pb-1.5 -mb-2 transition-colors ${activeHistoryTab === "config" ? "text-white border-b-2 border-[#10A66A]" : "text-zinc-500 hover:text-zinc-300"}`}
                              onClick={() => setActiveHistoryTab("config")}
                            >
                              配置记录
                            </button>
                            <button 
                              className={`font-bold pb-1.5 -mb-2 transition-colors ${activeHistoryTab === "operation" ? "text-white border-b-2 border-[#10A66A]" : "text-zinc-500 hover:text-zinc-300"}`}
                              onClick={() => setActiveHistoryTab("operation")}
                            >
                              操作记录
                            </button>
                        </div>
                     </div>
                     <div className="flex-1 overflow-x-auto overflow-y-auto">
                        <table className="w-full text-left text-[9px] border-collapse min-w-[300px]">
                          <thead className="bg-[#16181E]/50 sticky top-0 border-b border-[#2A2D39]">
                            <tr className="text-zinc-500">
                              <th className="font-medium p-1.5 font-mono">时间</th>
                              <th className="font-medium p-1.5">模型</th>
                              <th className="font-medium p-1.5">配置类型</th>
                              <th className="font-medium p-1.5">内容</th>
                              <th className="font-medium p-1.5">结果</th>
                              <th className="font-medium p-1.5">操作人</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2A2D39]">
                            {activeHistoryTab === "config" ? (
                              propertyConfigRecords.map((rec, i) => (
                                <tr key={i} className="text-zinc-300 hover:bg-[#2A2D39]/50 whitespace-nowrap">
                                  <td className="p-1.5 font-mono text-zinc-500">{rec.time}</td>
                                  <td className="p-1.5">{rec.modelName}</td>
                                  <td className="p-1.5 text-zinc-400">{rec.type}</td>
                                  <td className="p-1.5 text-zinc-400 max-w-[120px] truncate" title={rec.content}>{rec.content}</td>
                                  <td className="p-1.5 font-bold text-[#10A66A]">{rec.result}</td>
                                  <td className="p-1.5 text-zinc-500">{rec.user}</td>
                                </tr>
                              ))
                            ) : (
                              operationRecords.map((rec, i) => (
                                <tr key={i} className="text-zinc-300 hover:bg-[#2A2D39]/50 whitespace-nowrap">
                                  <td className="p-1.5 font-mono text-zinc-500">{rec.time}</td>
                                  <td className="p-1.5">{rec.modelName}</td>
                                  <td className="p-1.5 text-zinc-400">{rec.type}</td>
                                  <td className="p-1.5 text-zinc-300 max-w-[120px] truncate" title={rec.content}>{rec.content}</td>
                                  <td className="p-1.5 font-bold text-[#10A66A]">{rec.result}</td>
                                  <td className="p-1.5 text-zinc-400">{rec.user}</td>
                                </tr>
                              ))
                            )}
                            {((activeHistoryTab === "config" && propertyConfigRecords.length === 0) || 
                              (activeHistoryTab === "operation" && operationRecords.length === 0)) && (
                               <tr><td colSpan={6} className="p-4 text-center text-zinc-600">暂无记录</td></tr>
                            )}
                          </tbody>
                        </table>
                     </div>
                   </div>

                </div>
</div>
{/* Right Property Panel */}
             <div className={`bg-[#1B1D25] border-l border-[#2A2D39] flex flex-col transition-all z-20 ${propertyPanelCollapsed ? 'w-10 cursor-pointer' : 'w-64'} shrink-0`} onClick={() => propertyPanelCollapsed && setPropertyPanelCollapsed(false)}>
                <div className="h-10 border-b border-[#2A2D39] flex items-center justify-between px-3 shrink-0 bg-[#16181E]">
                   {!propertyPanelCollapsed && <h3 className="text-xs font-bold text-white">{selectedModel ? "模型详情" : "属性设置"}</h3>}
                   <button 
                     className="text-zinc-500 hover:text-white p-1 ml-auto"
                     onClick={(e) => { e.stopPropagation(); setPropertyPanelCollapsed(!propertyPanelCollapsed); }}
                   >
                     {propertyPanelCollapsed ? <ChevronDown className="w-4 h-4 rotate-90" /> : <ChevronDown className="w-4 h-4 -rotate-90" />}
                   </button>
                </div>
                
                {!propertyPanelCollapsed && (
                  <div className="flex-1 overflow-y-auto p-4">
                     {selectedModel ? (
                       // ===== 模型详情 =====
                       <div className="space-y-4">
                         <div className="space-y-1">
                           <label className="text-[10px] text-zinc-500 uppercase font-bold">模型名称</label>
                           <div className="text-xs font-bold text-white mb-2">{selectedModel.name}</div>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[10px] text-zinc-500 uppercase font-bold">模型分类</label>
                           <div className="text-[11px] text-zinc-300">{selectedModel.category} / {selectedModel.type}</div>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[10px] text-zinc-500 uppercase font-bold">适用场景</label>
                           <div className="text-[11px] text-zinc-300">{selectedModel.scene}</div>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[10px] text-zinc-500 uppercase font-bold">模型状态</label>
                           <div>
                             <span className={`text-[10px] px-1.5 py-0.5 rounded ${threeDSceneObjects.some(obj => obj.name === selectedModel.name) ? 'bg-[#10A66A]/10 text-[#10A66A]' : 'bg-blue-500/10 text-blue-400'}`}>
                               {threeDSceneObjects.some(obj => obj.name === selectedModel.name) ? "已添加" : selectedModel.bindStatus}
                             </span>
                           </div>
                         </div>

                         <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2A2D39]">
                           <div className="space-y-1">
                             <label className="text-[10px] text-zinc-500 uppercase font-bold">默认尺寸</label>
                             <div className="text-[10px] text-zinc-400 font-mono">X:1 Y:1 Z:1</div>
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] text-zinc-500 uppercase font-bold">默认位置</label>
                             <div className="text-[10px] text-zinc-400 font-mono">X:0 Y:0 Z:0</div>
                           </div>
                         </div>

                         <div className="space-y-1 pt-2 border-t border-[#2A2D39]">
                           <label className="text-[10px] text-zinc-500 uppercase font-bold">可绑定设备</label>
                           <div className="text-[11px] text-zinc-400 font-mono">temp01, sensor01, device01</div>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[10px] text-zinc-500 uppercase font-bold">数据项</label>
                           <div className="text-[11px] text-zinc-400 font-mono">temperature, humidity</div>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[10px] text-zinc-500 uppercase font-bold">说明</label>
                           <div className="text-[10px] text-zinc-400 leading-relaxed bg-[#16181E] p-2 rounded border border-[#2A2D39]">
                             用于展示{selectedModel.scene.split('、')[0] || '默认'}场景下的{selectedModel.name}设备模型。
                           </div>
                         </div>

                         <div className="pt-4 flex flex-col gap-2">
                           <button 
                             className="w-full py-1.5 bg-[#10A66A] hover:bg-[#0c8a58] text-white rounded text-xs transition-colors font-bold flex items-center justify-center gap-1"
                             onClick={() => {
                               handleAddObject(selectedModel);
                               setSelectedModel(null);
                             }}
                           >
                             <Plus className="w-4 h-4" /> 添加到场景
                           </button>
                           <button className="w-full py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white rounded text-xs transition-colors">
                             绑定设备
                           </button>
                           <button className="w-full py-1.5 bg-transparent hover:bg-[#2A2D39] border border-[#2A2D39] text-[#10A66A] font-bold rounded text-xs transition-colors">
                             收藏模型
                           </button>
                         </div>
                       </div>
                     ) : !selectedSceneObject ? (
                       <div className="text-zinc-500 text-xs text-center mt-10">请选择画布中的对象，或在左侧模型库选择模型查看属性。</div>
                     ) : (
                       // ===== 场景对象属性 =====
                       <div className="flex flex-col h-full">
                         {/* Tabs */}
                         <div className="flex bg-[#16181E] p-1 rounded-md border border-[#2A2D39] shrink-0 mb-4 overflow-x-auto no-scrollbar">
                           {["基础属性", "数据配置", "显示标签", "跳转按钮", "导航锚点", "语音配置"].map(tab => (
                             <button
                               key={tab}
                               className={`flex-1 text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap transition-colors ${
                                 activePropertyTab === tab ? "bg-[#2A2D39] text-[#10A66A]" : "text-zinc-500 hover:text-zinc-300"
                               }`}
                               onClick={() => setActivePropertyTab(tab as any)}
                             >
                               {tab}
                             </button>
                           ))}
                         </div>
                         
                         <div className="flex-1 overflow-y-auto no-scrollbar">
                           {activePropertyTab === "基础属性" && (
                             <div className="space-y-4">
                               <div className="space-y-1">
                                 <label className="text-[10px] text-zinc-500 uppercase font-bold">对象名称</label>
                                 <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none" value={selectedSceneObject.name} readOnly />
                               </div>
                               <div className="space-y-1">
                                 <label className="text-[10px] text-zinc-500 uppercase font-bold">对象类型</label>
                                 <div className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-zinc-400">{selectedSceneObject.type}</div>
                               </div>
                               
                               <div className="grid grid-cols-1 gap-2 pt-2 border-t border-[#2A2D39]">
                                  {["位置", "旋转", "缩放"].map((prop, idx) => (
                                    <div key={prop} className="space-y-1 pb-2">
                                       <label className="text-[10px] text-zinc-500 font-bold">{prop}</label>
                                       <div className="flex gap-1">
                                         <div className="flex-1 bg-[#16181E] border border-[#2A2D39] rounded flex items-center px-1">
                                           <span className="text-[9px] text-[#ef4444] font-bold w-3">X</span>
                                           <input type="text" className="w-full bg-transparent outline-none text-[10px] text-zinc-300" defaultValue={prop === "缩放" ? "1" : (idx===0 ? "120" : "0")} />
                                         </div>
                                         <div className="flex-1 bg-[#16181E] border border-[#2A2D39] rounded flex items-center px-1">
                                           <span className="text-[9px] text-[#22c55e] font-bold w-3">Y</span>
                                           <input type="text" className="w-full bg-transparent outline-none text-[10px] text-zinc-300" defaultValue={prop === "缩放" ? "1" : (idx===1 ? "45" : "0")} />
                                         </div>
                                         <div className="flex-1 bg-[#16181E] border border-[#2A2D39] rounded flex items-center px-1">
                                           <span className="text-[9px] text-[#3b82f6] font-bold w-3">Z</span>
                                           <input type="text" className="w-full bg-transparent outline-none text-[10px] text-zinc-300" defaultValue={prop === "缩放" ? "1" : (idx===0 ? "80" : "0")} />
                                         </div>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                               
                               <div className="pt-4 flex flex-col gap-2">
                                  <button 
                                    className="w-full py-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/40 rounded text-xs transition-colors"
                                    onClick={() => {
                                      if(window.confirm("确定删除该对象？")) {
                                        setThreeDSceneObjects(threeDSceneObjects.filter(o => o.id !== selectedSceneObject.id));
                                        addLog(`删除 ${selectedSceneObject.name}`);
                                        setSelectedSceneObject(null);
                                      }
                                    }}
                                  >
                                    删除对象
                                  </button>
                               </div>
                             </div>
                           )}

                           {activePropertyTab === "数据配置" && (() => {
                             const config = sceneObjectDataConfig[selectedSceneObject.id] || { dataMode: '动态数据' };
                             const updateConfig = (updater: any) => {
                               const objId = selectedSceneObject.id;
                               setSceneObjectDataConfig(prev => {
                                 const oldConf = prev[objId] || { dataMode: '动态数据' };
                                 return { ...prev, [objId]: updater(oldConf) };
                               });
                             };
                             const mode = config.dataMode || "动态数据";
                             
                             return (
                             <div className="space-y-4">
                               <div className="bg-[#16181E] border border-[#2A2D39] rounded p-2 mb-2">
                                 <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1 border-b border-[#2A2D39] pb-1">当前模型</div>
                                 <div className="text-xs text-white font-bold">{selectedSceneObject.name}</div>
                                 <div className="flex gap-2 mt-1">
                                   <div className="text-[10px] text-zinc-400">模型类型: {selectedSceneObject.type}</div>
                                   <div className="text-[10px] text-[#10A66A]">绑定状态: {selectedSceneObject.bind !== "-" ? '已绑定' : '已绑定'}</div>
                                 </div>
                               </div>

                               <div className="space-y-2">
                                 <label className="text-[10px] text-zinc-500 uppercase font-bold">数据类型</label>
                                 <div className="flex bg-[#16181E] border border-[#2A2D39] rounded p-1">
                                   {["静态数据", "动态数据"].map(typ => (
                                     <button
                                       key={typ}
                                       className={`flex-1 py-1 text-xs rounded transition-colors ${mode === typ ? 'bg-[#2A2D39] text-[#10A66A] font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                                       onClick={() => {
                                         updateConfig((c: any) => ({ ...c, dataMode: typ }));
                                         addLog(`切换 ${selectedSceneObject.name} 为${typ}`);
                                       }}
                                     >
                                       {typ}
                                     </button>
                                   ))}
                                 </div>
                               </div>

                               {mode === "静态数据" && (
                                 <div className="space-y-3 pt-2">
                                   <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mb-2">静态数据配置</div>
                                   
                                   <div className="space-y-1">
                                     <label className="text-[10px] text-zinc-400">显示名称</label>
                                     <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none" 
                                        value={config.staticDataConfig?.name ?? '温度'} 
                                        onChange={e => updateConfig((c:any) => ({...c, staticDataConfig: {...(c.staticDataConfig||{}), name: e.target.value}})) } />
                                   </div>
                                   <div className="space-y-1">
                                     <label className="text-[10px] text-zinc-400">显示值</label>
                                     <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none" 
                                        value={config.staticDataConfig?.val ?? '26.5'} 
                                        onChange={e => updateConfig((c:any) => ({...c, staticDataConfig: {...(c.staticDataConfig||{}), val: e.target.value}})) } />
                                   </div>
                                   <div className="grid grid-cols-2 gap-2">
                                     <div className="space-y-1">
                                       <label className="text-[10px] text-zinc-400">单位</label>
                                       <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none" 
                                          value={config.staticDataConfig?.unit ?? '℃'} 
                                          onChange={e => updateConfig((c:any) => ({...c, staticDataConfig: {...(c.staticDataConfig||{}), unit: e.target.value}})) } />
                                     </div>
                                     <div className="space-y-1">
                                       <label className="text-[10px] text-zinc-400">显示状态</label>
                                       <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none" 
                                          value={config.staticDataConfig?.status ?? '正常'} 
                                          onChange={e => updateConfig((c:any) => ({...c, staticDataConfig: {...(c.staticDataConfig||{}), status: e.target.value}})) } />
                                     </div>
                                   </div>
                                   <div className="grid grid-cols-2 gap-2">
                                     <div className="space-y-1">
                                       <label className="text-[10px] text-zinc-400">显示颜色</label>
                                       <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select"
                                          value={config.staticDataConfig?.color ?? '绿色'}
                                          onChange={e => updateConfig((c:any) => ({...c, staticDataConfig: {...(c.staticDataConfig||{}), color: e.target.value}})) } >
                                          <option value="绿色">绿色</option>
                                          <option value="蓝色">蓝色</option>
                                          <option value="橙色">橙色</option>
                                          <option value="浅红色">浅红色</option>
                                          <option value="灰色">灰色</option>
                                       </select>
                                     </div>
                                     <div className="space-y-1">
                                       <label className="text-[10px] text-zinc-400">刷新方式</label>
                                       <div className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-zinc-500">固定显示</div>
                                     </div>
                                   </div>
                                   
                                   <div className="text-[10px] text-zinc-500 bg-[#16181E] p-2 rounded">
                                     说明：用于在 3D 场景中展示固定文本、数值或状态。
                                   </div>

                                   <div className="pt-2 flex gap-2">
                                      <button className="flex-1 py-1.5 bg-[#10A66A] hover:bg-[#0c8a58] text-white rounded text-xs transition-colors"
                                        onClick={() => {
                                          updateConfig((c:any) => ({...c, applied: true}));
                                          showToast("静态数据已应用");
                                          addLog(`已为${selectedSceneObject.name}配置静态数据`);
                                        }}>
                                        应用静态数据
                                      </button>
                                      <button className="py-1.5 px-3 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-zinc-300 rounded text-xs transition-colors"
                                        onClick={() => {
                                          updateConfig((c:any) => ({...c, applied: false, staticDataConfig: null}));
                                        }}>清空</button>
                                   </div>
                                 </div>
                               )}

                               {mode === "动态数据" && (() => {
                                 const dyn = config.dynamicDataConfig || {};
                                 const sourceType = dyn.sourceType || '工程虚拟仿真平台数据';
                                 
                                 if (sourceType === '行业云平台仿真设备数据' || sourceType === '行业云数据仿真任务数据' || sourceType === '行业云设备管理数据') {
                                   const devMeta = CLOUD_DEVICES.find(d => d.id === dyn.deviceId) || CLOUD_DEVICES[0];
                                   const propMeta = devMeta?.props.find(p => p.id === dyn.propertyId) || devMeta?.props[0];
                                   return (
                                     <div className="space-y-3 pt-2">
                                       <div className="space-y-1">
                                         <label className="text-[10px] text-zinc-400">数据源类型</label>
                                         <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select"
                                            value={dyn.sourceType || '工程虚拟仿真平台数据'}
                                            onChange={e => updateConfig((c:any) => ({...c, dynamicDataConfig: {...(c.dynamicDataConfig||{}), sourceType: e.target.value}}))} >
                                            <option value="工程虚拟仿真平台数据">工程虚拟仿真平台数据</option>
                                            <option value="行业云平台仿真设备数据">行业云平台仿真设备数据</option>
                                            <option value="本地测试数据">本地测试数据</option>
                                         </select>
                                       </div>
                                       <div className="text-[10px] text-zinc-500 bg-[#16181E] p-2 rounded leading-relaxed mb-3">行业云平台旧版兼容模式，请切换至工程虚拟仿真平台数据。</div>
                                     </div>
                                   );
                                 }

                                 const devMeta = VIRTUAL_DEVICES.find(d => d.id === dyn.deviceId) || VIRTUAL_DEVICES[0];
                                 const selectedFields = dyn.fields || ['temperature', 'humidity'];

                                 return (
                                 <div className="space-y-3 pt-2">
                                     <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mb-2">工程虚拟仿真平台数据源</div>

                                     <div className="space-y-1 mt-2">
                                       <label className="text-[10px] text-zinc-400">数据源类型</label>
                                       <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select"
                                          value={dyn.sourceType || '工程虚拟仿真平台数据'}
                                          onChange={e => updateConfig((c:any) => ({...c, dynamicDataConfig: {...(c.dynamicDataConfig||{}), sourceType: e.target.value}}))} >
                                          <option value="工程虚拟仿真平台数据">工程虚拟仿真平台数据</option>
                                          <option value="行业云平台仿真设备数据">行业云平台仿真设备数据</option>
                                          <option value="本地测试数据">本地测试数据</option>
                                       </select>
                                     </div>

                                     <div className="bg-[#16181E] border border-[#2A2D39] rounded p-2 space-y-2">
                                       <div className="flex justify-between items-center border-b border-[#2A2D39] pb-1">
                                         <span className="text-[10px] text-zinc-400">数据来源</span>
                                         <span className="text-[11px] text-[#10A66A] font-bold">工程虚拟仿真平台数据</span>
                                       </div>
                                       <div className="flex justify-between items-center border-b border-[#2A2D39] pb-1">
                                         <span className="text-[10px] text-zinc-400">平台名称</span>
                                         <span className="text-xs text-white">工程虚拟仿真平台</span>
                                       </div>
                                       <div className="flex justify-between items-center border-b border-[#2A2D39] pb-1">
                                         <span className="text-[10px] text-zinc-400">当前仿真工程</span>
                                         <span className="text-xs text-zinc-300 truncate max-w-[150px]" title={virtualSimulationProject}>{virtualSimulationProject}</span>
                                       </div>
                                       <div className="flex justify-between items-center">
                                         <span className="text-[10px] text-zinc-400">当前仿真场景</span>
                                         <span className="text-xs text-zinc-300">{virtualSimulationScene}</span>
                                       </div>
                                       <div className="flex justify-between items-center">
                                         <span className="text-[10px] text-zinc-400">连接状态</span>
                                         <span className={`text-xs font-bold ${virtualSimulationConnectionStatus === '接收中' || virtualSimulationConnectionStatus === '已连接' ? 'text-[#10A66A]' : 'text-zinc-500'}`}>{virtualSimulationConnectionStatus}</span>
                                       </div>
                                       <div className="flex justify-between items-center border-t border-[#2A2D39] pt-1">
                                         <span className="text-[10px] text-zinc-400">数据接收状态</span>
                                         <span className={`text-xs font-bold ${virtualSimulationReceiveStatus === '接收中' ? 'text-[#10A66A]' : virtualSimulationReceiveStatus === '已暂停' ? 'text-zinc-500' : 'text-zinc-500'}`}>{virtualSimulationReceiveStatus === '接收中' ? '接收中' : virtualSimulationReceiveStatus === '已暂停' ? '已暂停' : '未接收'}</span>
                                       </div>
                                       <div className="flex justify-between items-center">
                                         <span className="text-[10px] text-zinc-400">最近更新时间</span>
                                         <span className="text-[10px] text-zinc-500 font-mono">{virtualDataReceiveRecords[0]?.time || '--:--:--'}</span>
                                       </div>
                                       <div className="flex justify-between items-center">
                                         <span className="text-[10px] text-zinc-400">刷新频率</span>
                                         <span className="text-[10px] text-zinc-500">2 秒</span>
                                       </div>
                                       <div className="grid grid-cols-2 gap-2 pt-2">
                                         <button className={`py-1.5 border rounded text-xs transition-colors ${virtualSimulationConnectionStatus !== '未连接' ? 'bg-[#10A66A]/20 text-[#10A66A] border-[#10A66A]/30 font-bold' : 'bg-[#2A2D39] hover:bg-[#3A3D49] border-[#3A3D49] text-white'}`}
                                           onClick={() => {
                                             showToast("工程虚拟仿真平台连接成功。");
                                             setVirtualSimulationConnectionStatus("已连接");
                                             addLog("连接工程虚拟仿真平台成功");
                                           }}
                                         >{virtualSimulationConnectionStatus !== '未连接' ? '已连接' : '连接工程虚拟仿真平台'}</button>
                                         <button className="py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white rounded text-xs transition-colors"
                                           onClick={() => { showToast("已刷新工程虚拟仿真平台设备列表。"); addLog("刷新工程虚拟仿真平台设备列表成功")}}>
                                           刷新仿真设备
                                         </button>
                                         <button className={`py-1.5 border rounded text-[10px] transition-colors ${virtualSimulationReceiveStatus === '接收中' ? 'bg-[#10A66A] text-white border-[#10A66A]' : 'bg-[#2A2D39] text-zinc-300 border-[#3A3D49] hover:bg-[#3A3D49]'}`}
                                           onClick={() => {
                                             showToast("开始接收工程虚拟仿真平台数据。");
                                             setVirtualSimulationReceiveStatus("接收中");
                                             setVirtualSimulationConnectionStatus("已连接");
                                             addLog("开始接收工程虚拟仿真平台数据");
                                           }}>
                                           开始接收
                                         </button>
                                         <button className={`py-1.5 border rounded text-[10px] transition-colors ${virtualSimulationReceiveStatus === '已暂停' ? 'bg-zinc-700 text-white border-zinc-600' : 'bg-[#2A2D39] text-zinc-300 border-[#3A3D49] hover:bg-[#3A3D49]'}`}
                                           onClick={() => {
                                             showToast("已暂停接收工程虚拟仿真平台数据。");
                                             setVirtualSimulationReceiveStatus("已暂停");
                                             addLog("暂停接收工程虚拟仿真平台数据");
                                           }}>
                                           暂停接收
                                         </button>
                                       </div>
                                     </div>

                                     <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pt-2 pb-1 mb-2">仿真设备绑定</div>

                                     <div className="bg-[#16181E] border border-[#2A2D39] rounded p-2 mb-2">
                                        <div className="flex justify-between items-center mb-1">
                                           <span className="text-[10px] text-zinc-400">已绑定仿真设备</span>
                                           <span className="text-[11px] text-[#10A66A] font-bold font-mono">{devMeta?.name} {dyn.deviceId}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                           <span className="text-[10px] text-zinc-400">设备来源</span>
                                           <span className="text-[10px] text-zinc-300">工程虚拟仿真平台</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                           <span className="text-[10px] text-zinc-400">所属工程</span>
                                           <span className="text-[10px] text-zinc-300 truncate max-w-[120px]">{virtualSimulationProject}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                           <span className="text-[10px] text-zinc-400">设备状态</span>
                                           <span className="text-[10px] text-[#10A66A]">在线</span>
                                        </div>
                                        <div className="flex justify-between items-start mt-1 pt-1 border-t border-[#2A2D39]">
                                           <span className="text-[10px] text-zinc-400">最新数据</span>
                                           <span className="text-[10px] text-zinc-300 max-w-[120px] text-right truncate">
                                             {devMeta?.props.filter(p => selectedFields.includes(p.id)).map(p => `${p.name} ${virtualDeviceData[dyn.deviceId]?.[p.id] ?? '-'}${p.unit !== '-' ? p.unit : ''}`).join('，') || '暂无'}
                                           </span>
                                        </div>
                                     </div>

                                     <div className="space-y-1">
                                       <label className="text-[10px] text-zinc-400">切换当前设备</label>
                                       <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-[11px] font-mono text-[#10A66A] outline-none custom-select"
                                          value={dyn.deviceId || VIRTUAL_DEVICES[0].id}
                                          onChange={e => {
                                            const dev = VIRTUAL_DEVICES.find(d => d.id === e.target.value);
                                            const firstProp = dev?.props[0].id;
                                            updateConfig((c:any) => ({...c, dynamicDataConfig: {...(c.dynamicDataConfig||{}), deviceId: dev?.id, deviceName: dev?.name, fields: [firstProp]}}));
                                            addLog(`绑定仿真设备 ${dev?.name} ${dev?.id}`);
                                          }}>
                                          {VIRTUAL_DEVICES.map(d => <option key={d.id} value={d.id}>{d.name} {d.id}</option>)}
                                       </select>
                                     </div>

                                     <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pt-2 pb-1 mb-2">仿真数据项绑定</div>

                                     <div className="space-y-1">
                                       <div className="flex justify-between items-center bg-[#16181E] p-1.5 rounded border border-[#2A2D39] mb-2">
                                          <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${virtualSimulationReceiveStatus === '接收中' ? 'bg-[#10A66A] animate-pulse' : 'bg-zinc-600'}`}></div>
                                            <span className="text-[10px] font-bold text-white">实时仿真数据预览</span>
                                          </div>
                                          <span className="text-[9px] text-[#10A66A] bg-[#10A66A]/10 px-1 rounded">工程虚拟仿真平台</span>
                                       </div>
                                       
                                       <label className="text-[10px] text-zinc-400">已选择数据项</label>
                                       <div className="space-y-2 mb-2">
                                          {selectedFields.length > 0 ? selectedFields.map((fId: string) => {
                                              const pData = devMeta?.props.find((p:any) => p.id === fId);
                                              if (!pData) return null;
                                              let currentVal = virtualDeviceData[dyn.deviceId]?.[fId] ?? '-';
                                              if (pData.type === '枚举') {
                                                  currentVal = currentVal === 'on' ? '运行中' : '已关闭';
                                              }
                                              return (
                                                  <div key={fId} className="bg-[#1A1B23] border border-[#2A2D39] rounded p-2">
                                                    <div className="flex justify-between items-center border-b border-[#2A2D39] pb-1 mb-1">
                                                      <span className="text-[10px] font-mono text-zinc-300 font-bold">{pData.name} ({fId})</span>
                                                    </div>
                                                    <div className="flex justify-between items-baseline mb-0.5">
                                                      <span className="text-[10px] text-zinc-400">实时数值</span>
                                                      <span className="text-sm text-[#10A66A] font-mono font-bold">{currentVal} <span className="text-[10px] text-zinc-500 font-normal">{pData.unit !== '-' ? pData.unit : ''}</span></span>
                                                    </div>
                                                  </div>
                                              )
                                          }) : <div className="text-[10px] text-zinc-600 bg-[#16181E] p-2 rounded text-center">暂未选择数据项</div>}
                                       </div>

                                       <label className="text-[10px] text-zinc-400">可选数据项</label>
                                       <div className="bg-[#16181E] border border-[#2A2D39] rounded p-2 max-h-32 overflow-y-auto space-y-1">
                                          {devMeta?.props.map(p => (
                                            <label key={p.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-[#2A2D39] rounded transition-colors group">
                                              <input type="checkbox" className="accent-[#10A66A]" 
                                                  checked={selectedFields.includes(p.id)}
                                                  onChange={e => {
                                                     let nextFields = [...selectedFields];
                                                     if (e.target.checked) nextFields.push(p.id);
                                                     else nextFields = nextFields.filter(f => f !== p.id);
                                                     updateConfig((c:any) => ({...c, dynamicDataConfig: {...(c.dynamicDataConfig||{}), fields: nextFields}}));
                                                     addLog(`绑定仿真数据项：${nextFields.join('、')}`);
                                                  }}
                                              />
                                              <span className="text-xs text-zinc-300 font-mono flex-1 group-hover:text-white transition-colors">{p.id}</span>
                                              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors">{p.name} {p.type === '数值' ? `[${p.val}${p.unit !== '-' ? p.unit : ''}]` : `[${p.val === 'on' ? '运行中' : '已关闭'}]`}</span>
                                            </label>
                                          ))}
                                       </div>
                                     </div>
                                     <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mt-4 mb-2">字段映射配置</div>
                                   
                                   {selectedFields.length > 0 ? selectedFields.map(fId => {
                                      const pData = devMeta?.props.find(p => p.id === fId);
                                      if (!pData) return null;
                                      return (
                                        <div key={fId} className="bg-[#16181E] border border-[#2A2D39] rounded p-2 mb-2">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-mono text-[#10A66A]">{fId}</span>
                                            <span className="text-[10px] text-zinc-500">{pData.name} {pData.unit !== '-' ? '('+pData.unit+')' : ''}</span>
                                          </div>
                                          {pData.type === '数值' ? (
                                              <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] text-zinc-500">正常范围</label>
                                                  <input type="text" defaultValue="20 - 30" className="w-full bg-[#1A1B23] border border-[#2A2D39] rounded px-1.5 py-1 text-[10px] text-[#10A66A] text-center font-mono outline-none" />
                                                </div>
                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] text-zinc-500">预警范围</label>
                                                  <input type="text" defaultValue="30 - 35" className="w-full bg-[#1A1B23] border border-[#2A2D39] rounded px-1.5 py-1 text-[10px] text-orange-400 text-center font-mono outline-none" />
                                                </div>
                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] text-zinc-500">异常范围</label>
                                                  <input type="text" defaultValue="> 35" className="w-full bg-[#1A1B23] border border-[#2A2D39] rounded px-1.5 py-1 text-[10px] text-red-500 text-center font-mono outline-none" />
                                                </div>
                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] text-zinc-500">小数位</label>
                                                  <input type="text" defaultValue="1" className="w-full bg-[#1A1B23] border border-[#2A2D39] rounded px-1.5 py-1 text-[10px] text-zinc-300 text-center outline-none" />
                                                </div>
                                              </div>
                                          ) : (
                                              <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] text-zinc-500">开启状态文本</label>
                                                  <input type="text" defaultValue="运行中" className="w-full bg-[#1A1B23] border border-[#2A2D39] rounded px-1.5 py-1 text-[10px] text-[#10A66A] text-center outline-none" />
                                                </div>
                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] text-zinc-500">关闭状态文本</label>
                                                  <input type="text" defaultValue="已关闭" className="w-full bg-[#1A1B23] border border-[#2A2D39] rounded px-1.5 py-1 text-[10px] text-zinc-500 text-center outline-none" />
                                                </div>
                                              </div>
                                          )}
                                        </div>
                                      );
                                   }) : <div className="text-[10px] text-zinc-500 text-center py-2">请先选择数据项</div>}

                                   <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mt-4 mb-2">展示样式配置</div>
                                   <div className="flex gap-2 mb-3">
                                     <label className="flex items-center gap-1 cursor-pointer">
                                       <input type="radio" name="displayStyle" defaultChecked className="accent-[#10A66A] cursor-pointer" />
                                       <span className="text-[11px] text-zinc-300">悬浮多行标签</span>
                                     </label>
                                     <label className="flex items-center gap-1 cursor-pointer">
                                       <input type="checkbox" defaultChecked className="accent-[#10A66A] cursor-pointer" />
                                       <span className="text-[11px] text-zinc-300">状态灯提示</span>
                                     </label>
                                   </div>

                                   <div className="pt-2 flex flex-col gap-2">
                                     <button className="py-1.5 w-full bg-[#1A1B23] hover:bg-[#2A2D39] border border-[#2A2D39] text-[#10A66A] rounded text-xs transition-colors mb-2"
                                        onClick={() => {
                                          updateConfig((c:any) => ({...c, applied: true, dataMode: '动态数据'}));
                                          showToast("展示样式及字段映射已应用");
                                          addLog(`已应用字段映射: ${selectedFields.join('、')}`);
                                        }}>
                                        应用字段映射
                                     </button>

                                      <div className="flex gap-2">
                                        <button className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${virtualSimulationReceiveStatus === '接收中' ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' : 'bg-[#10A66A] hover:bg-[#0c8a58] text-white'}`}
                                          onClick={() => {
                                              if(virtualSimulationReceiveStatus !== '接收中'){
                                                // Make sure device is selected
                                                if(!dyn.deviceId) {
                                                   updateConfig((c:any) => ({...c, applied: true, dataMode: '动态数据', dynamicDataConfig: {...dyn, deviceId: devMeta?.id, fields: [devMeta?.props[0].id]}}));
                                                }
                                                updateConfig((c:any) => ({...c, applied: true, dataMode: '动态数据'}));
                                                handleStartVirtualData();
                                              }
                                          }}>
                                          开始接收
                                        </button>
                                        <button className={`flex-1 py-1.5 rounded text-xs transition-colors ${virtualSimulationReceiveStatus === '接收中' ? 'bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                                          onClick={() => virtualSimulationReceiveStatus === '接收中' && handlePauseVirtualData()}>
                                          暂停接收
                                        </button>
                                      </div>
                                   </div>

                                   {/* Data Preview */}
                                   <div className="mt-4 border-t border-[#2A2D39] pt-2">
                                      <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2">实时数据预览</div>
                                      
                                      <div className="space-y-2">
                                        {selectedFields.length > 0 ? selectedFields.map(fId => {
                                          const pData = devMeta?.props.find(p => p.id === fId);
                                          const val = virtualDeviceData[dyn.deviceId]?.[fId] ?? pData?.val ?? '-';
                                          return (
                                            <div key={fId} className="bg-[#16181E] border border-[#2A2D39] rounded p-2 text-[10px] animate-in fade-in duration-500">
                                               <div className="flex justify-between mb-1">
                                                  <span className="text-zinc-500">属性: {fId} ({pData?.name})</span>
                                                  <span className="text-[#10A66A] font-bold font-mono text-xs">
                                                    {pData?.type === '枚举' ? (val === 'on' ? '运行中' : '已关闭') : val} <span className="text-[9px] font-normal">{pData?.unit !== '-' ? pData?.unit : ''}</span>
                                                  </span>
                                               </div>
                                               <div className="flex justify-between items-center text-[9px]">
                                                  <span className="text-zinc-500">时间: {virtualSimulationReceiveStatus === '接收中' ? virtualDataReceiveRecords[0]?.time || '--:--:--' : '--:--:--'}</span>
                                                  <span className="text-[#10A66A]">正常</span>
                                               </div>
                                            </div>
                                          );
                                        }) : <div className="text-[10px] text-zinc-500 text-center py-2">暂无预览</div>}
                                      </div>
                                   </div>
                                 </div>
                                 );
                               })()}
                             </div>
                              );
                            })()}
                            {activePropertyTab === "显示标签" && (() => {
                             const conf = sceneObjectPropertyConfig[selectedSceneObject.id]?.labelConfig || {
                               enabled: true,
                               title: '温湿度传感器',
                               content: '温度 24.6 ℃，湿度 58%',
                               type: '名称标签',
                               position: '模型上方',
                               style: '卡片样式',
                               showIcon: true,
                               showDevice: true,
                               showTime: true,
                               applied: false
                             };
                             const updateConf = (updater) => {
                               setSceneObjectPropertyConfig(prev => ({
                                 ...prev,
                                 [selectedSceneObject.id]: {
                                   ...(prev[selectedSceneObject.id] || {}),
                                   labelConfig: updater(prev[selectedSceneObject.id]?.labelConfig || conf)
                                 }
                               }));
                             };
                             return (
                               <div className="space-y-4">
                                  <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mb-2">显示标签配置</div>
                                  <div className="text-[10px] text-zinc-400">说明：为模型配置名称、状态、数据、说明等可视化标签。</div>
                                  
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-zinc-400">是否显示标签</label>
                                    <button
                                      className={`w-8 h-4 rounded-full relative transition-colors ${conf.enabled ? 'bg-[#10A66A]' : 'bg-zinc-600'}`}
                                      onClick={() => updateConf(c => ({...c, enabled: !c.enabled}))}
                                    >
                                      <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all ${conf.enabled ? 'right-0.5' : 'left-0.5'}`} />
                                    </button>
                                  </div>
                                  
                                  {conf.enabled && (
                                    <>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">标签标题</label>
                                        <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#10A66A]" value={conf.title} onChange={e => updateConf(c => ({...c, title: e.target.value}))} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">标签内容</label>
                                        <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#10A66A]" value={conf.content} onChange={e => updateConf(c => ({...c, content: e.target.value}))} />
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">标签类型</label>
                                          <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.type} onChange={e => updateConf(c => ({...c, type: e.target.value}))}>
                                            <option>名称标签</option><option>状态标签</option><option>数据标签</option><option>说明标签</option><option>告警标签</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">标签位置</label>
                                          <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.position} onChange={e => updateConf(c => ({...c, position: e.target.value}))}>
                                            <option>模型上方</option><option>模型下方</option><option>模型左侧</option><option>模型右侧</option><option>跟随模型</option>
                                          </select>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">标签样式</label>
                                        <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.style} onChange={e => updateConf(c => ({...c, style: e.target.value}))}>
                                          <option>简洁样式</option><option>卡片样式</option><option>透明样式</option><option>状态灯样式</option>
                                        </select>
                                      </div>
                                      
                                      <div className="space-y-2 pt-2 border-t border-[#2A2D39]">
                                        <div className="flex items-center justify-between">
                                          <label className="text-[10px] text-zinc-400">是否显示图标</label>
                                          <button className={`w-8 h-4 rounded-full relative transition-colors ${conf.showIcon ? 'bg-[#10A66A]' : 'bg-zinc-600'}`} onClick={() => updateConf(c => ({...c, showIcon: !c.showIcon}))}>
                                            <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all ${conf.showIcon ? 'right-0.5' : 'left-0.5'}`} />
                                          </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <label className="text-[10px] text-zinc-400">是否显示绑定设备</label>
                                          <button className={`w-8 h-4 rounded-full relative transition-colors ${conf.showDevice ? 'bg-[#10A66A]' : 'bg-zinc-600'}`} onClick={() => updateConf(c => ({...c, showDevice: !c.showDevice}))}>
                                            <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all ${conf.showDevice ? 'right-0.5' : 'left-0.5'}`} />
                                          </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <label className="text-[10px] text-zinc-400">是否显示更新时间</label>
                                          <button className={`w-8 h-4 rounded-full relative transition-colors ${conf.showTime ? 'bg-[#10A66A]' : 'bg-zinc-600'}`} onClick={() => updateConf(c => ({...c, showTime: !c.showTime}))}>
                                            <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all ${conf.showTime ? 'right-0.5' : 'left-0.5'}`} />
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="pt-2 flex gap-2">
                                        <button className="flex-1 py-1.5 bg-[#10A66A] hover:bg-[#0c8a58] text-white rounded text-xs transition-colors" onClick={() => {
                                          updateConf(c => ({...c, applied: true}));
                                          setDesignerToast("显示标签配置已应用");
                                          setTimeout(() => setDesignerToast(""), 3000);
                                          setPropertyConfigRecords(prev => [{
                                            time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '显示标签', content: `${conf.position}${conf.style}`, result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>应用标签配置</button>
                                        <button className="py-1.5 px-3 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-zinc-300 rounded text-xs transition-colors" onClick={() => updateConf(c => ({...c, applied: false}))}>重置标签配置</button>
                                      </div>
                                    </>
                                  )}

                                  {/* 数据标签位置 Config Block */}
                                  <div className="pt-4 border-t border-[#2A2D39] mt-4 space-y-3">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39]/60 pb-1 mb-2 flex items-center justify-between">
                                      <span>数据标签位置配置</span>
                                      <span className="text-[9px] text-[#10A66A] font-mono">X-Y Coords</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">标签 X 坐标</label>
                                        <input 
                                          type="number" 
                                          className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none focus:border-[#10A66A]" 
                                          value={tempWidgetX} 
                                          onChange={e => setTempWidgetX(Number(e.target.value))} 
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">标签 Y 坐标</label>
                                        <input 
                                          type="number" 
                                          className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none focus:border-[#10A66A]" 
                                          value={tempWidgetY} 
                                          onChange={e => setTempWidgetY(Number(e.target.value))} 
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">层级 (zIndex)</label>
                                        <input 
                                          type="number" 
                                          className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none focus:border-[#10A66A]" 
                                          value={tempWidgetZ} 
                                          onChange={e => setTempWidgetZ(Number(e.target.value))} 
                                        />
                                      </div>
                                      
                                      <div className="flex flex-col justify-end pb-1">
                                        <div className="flex items-center justify-between">
                                          <label className="text-[10px] text-zinc-400">锁定位置</label>
                                          <button
                                            className={`w-8 h-4 rounded-full relative transition-colors ${tempWidgetLocked ? 'bg-[#10A66A]' : 'bg-zinc-600'}`}
                                            onClick={() => setTempWidgetLocked(!tempWidgetLocked)}
                                          >
                                            <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all ${tempWidgetLocked ? 'right-0.5' : 'left-0.5'}`} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                      <label className="text-[10px] text-zinc-400">跟随模型</label>
                                      <button
                                        className={`w-8 h-4 rounded-full relative transition-colors ${tempWidgetFollow ? 'bg-[#10A66A]' : 'bg-zinc-600'}`}
                                        onClick={() => setTempWidgetFollow(!tempWidgetFollow)}
                                      >
                                        <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all ${tempWidgetFollow ? 'right-0.5' : 'left-0.5'}`} />
                                      </button>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                      <button 
                                        className="flex-1 py-1 px-2.5 bg-[#10A66A] hover:bg-[#0c8a58] text-white rounded text-[10px] font-bold transition-colors"
                                        onClick={() => {
                                          const exists = canvasDataWidgets.some(w => w.objectId === selectedSceneObject.id);
                                          const timeNow = new Date().toTimeString().split(' ')[0];
                                          const logMsg = `已更新${selectedSceneObject.name}数据标签位置`;
                                          setOperationRecords(prevLogs => [
                                            {
                                              id: Date.now(),
                                              time: timeNow,
                                              modelName: selectedSceneObject.name,
                                              type: "位置应用",
                                              content: logMsg + ` 为 X:${tempWidgetX} Y:${tempWidgetY}`,
                                              result: "成功",
                                              user: "学生1"
                                            },
                                            ...prevLogs
                                          ]);
                                          showToast(logMsg);
                                          
                                          setCanvasDataWidgets(prev => {
                                            if (exists) {
                                              return prev.map(w => w.objectId === selectedSceneObject.id ? { 
                                                ...w, 
                                                x: tempWidgetX, 
                                                y: tempWidgetY, 
                                                zIndex: tempWidgetZ,
                                                locked: tempWidgetLocked,
                                                followModel: tempWidgetFollow
                                              } : w);
                                            } else {
                                              return [...prev, {
                                                id: `widget-${selectedSceneObject.id}`,
                                                objectId: selectedSceneObject.id,
                                                modelName: selectedSceneObject.name,
                                                dataSource: "工程虚拟仿真平台",
                                                deviceId: selectedSceneObject.id.includes("init_1") ? "temp01" : selectedSceneObject.name.includes("风机") ? "fan01" : selectedSceneObject.name.includes("水泵") ? "pump01" : selectedSceneObject.name.includes("补光灯") ? "lamp01" : selectedSceneObject.name.includes("网关") ? "gw01" : "alarm01",
                                                fields: selectedSceneObject.id.includes("init_1") ? ["temperature", "humidity"] : selectedSceneObject.name.includes("风机") ? ["fanStatus"] : ["status"],
                                                x: tempWidgetX,
                                                y: tempWidgetY,
                                                zIndex: tempWidgetZ,
                                                isDragging: false,
                                                locked: tempWidgetLocked,
                                                followModel: tempWidgetFollow
                                              }];
                                            }
                                          });
                                        }}
                                      >
                                        应用位置
                                      </button>
                                      <button 
                                        className="flex-1 py-1 px-2.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-zinc-300 rounded text-[10px] font-bold transition-colors"
                                        onClick={() => {
                                          let defaultX = 460;
                                          let defaultY = 220;
                                          if (selectedSceneObject.name.includes("传感器") || selectedSceneObject.name.includes("温湿度")) {
                                            defaultX = 420;
                                            defaultY = 210;
                                          } else if (selectedSceneObject.name.includes("风机")) {
                                            defaultX = 560;
                                            defaultY = 260;
                                          } else if (selectedSceneObject.name.includes("补光灯")) {
                                            defaultX = 680;
                                            defaultY = 190;
                                          }
                                          
                                          setTempWidgetX(defaultX);
                                          setTempWidgetY(defaultY);
                                          setTempWidgetZ(12);
                                          setTempWidgetFollow(true);
                                          setTempWidgetLocked(false);
                                          
                                          const timeNow = new Date().toTimeString().split(' ')[0];
                                          const logMsg = `已恢复${selectedSceneObject.name}数据标签默认位置`;
                                          setOperationRecords(prevLogs => [
                                            {
                                              id: Date.now(),
                                              time: timeNow,
                                              modelName: selectedSceneObject.name,
                                              type: "恢复默认",
                                              content: logMsg,
                                              result: "成功",
                                              user: "学生1"
                                            },
                                            ...prevLogs
                                          ]);
                                          showToast(logMsg);

                                          setCanvasDataWidgets(prev => {
                                            const exists = prev.some(w => w.objectId === selectedSceneObject.id);
                                            if (exists) {
                                              return prev.map(w => w.objectId === selectedSceneObject.id ? { 
                                                ...w, 
                                                x: defaultX, 
                                                y: defaultY, 
                                                zIndex: 12,
                                                locked: false,
                                                followModel: true
                                              } : w);
                                            } else {
                                              return [...prev, {
                                                id: `widget-${selectedSceneObject.id}`,
                                                objectId: selectedSceneObject.id,
                                                modelName: selectedSceneObject.name,
                                                dataSource: "工程虚拟仿真平台",
                                                deviceId: selectedSceneObject.id.includes("init_1") ? "temp01" : selectedSceneObject.name.includes("风机") ? "fan01" : selectedSceneObject.name.includes("水泵") ? "pump01" : selectedSceneObject.name.includes("补光灯") ? "lamp01" : selectedSceneObject.name.includes("网关") ? "gw01" : "alarm01",
                                                fields: selectedSceneObject.id.includes("init_1") ? ["temperature", "humidity"] : selectedSceneObject.name.includes("风机") ? ["fanStatus"] : ["status"],
                                                x: defaultX,
                                                y: defaultY,
                                                zIndex: 12,
                                                isDragging: false,
                                                locked: false,
                                                followModel: true
                                              }];
                                            }
                                          });
                                        }}
                                      >
                                        恢复默认位置
                                      </button>
                                    </div>
                                  </div>
                               </div>
                             );
                           })()}
                           
                           {activePropertyTab === "跳转按钮" && (() => {
                             const conf = sceneObjectPropertyConfig[selectedSceneObject.id]?.jumpButtonConfig || {
                               enabled: true,
                               btnName: '查看设备详情',
                               position: '标签下方',
                               jumpType: '数据详情',
                               target: '设备详情面板',
                               openType: '右侧面板打开',
                               applied: false
                             };
                             const updateConf = (updater) => {
                               setSceneObjectPropertyConfig(prev => ({
                                 ...prev,
                                 [selectedSceneObject.id]: {
                                   ...(prev[selectedSceneObject.id] || {}),
                                   jumpButtonConfig: updater(prev[selectedSceneObject.id]?.jumpButtonConfig || conf)
                                 }
                               }));
                             };
                             return (
                               <div className="space-y-4">
                                  <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mb-2">跳转按钮配置</div>
                                  <div className="text-[10px] text-zinc-400">说明：为模型配置可点击按钮，点击后可跳转到指定页面、场景、数据面板或外部链接占位。</div>
                                  
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-zinc-400">是否启用跳转按钮</label>
                                    <button className={`w-8 h-4 rounded-full relative transition-colors ${conf.enabled ? 'bg-[#10A66A]' : 'bg-zinc-600'}`} onClick={() => updateConf(c => ({...c, enabled: !c.enabled}))}>
                                      <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all ${conf.enabled ? 'right-0.5' : 'left-0.5'}`} />
                                    </button>
                                  </div>
                                  
                                  {conf.enabled && (
                                    <>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">按钮名称</label>
                                        <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#10A66A]" value={conf.btnName} onChange={e => updateConf(c => ({...c, btnName: e.target.value}))} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">按钮位置</label>
                                        <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.position} onChange={e => updateConf(c => ({...c, position: e.target.value}))}>
                                          <option>标签下方</option><option>模型右侧</option><option>模型上方</option><option>悬浮显示</option>
                                        </select>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">跳转类型</label>
                                        <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.jumpType} onChange={e => updateConf(c => ({...c, jumpType: e.target.value}))}>
                                          <option>页面跳转</option><option>场景跳转</option><option>面板跳转</option><option>数据详情</option><option>外部链接占位</option>
                                        </select>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">跳转目标</label>
                                          <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.target} onChange={e => updateConf(c => ({...c, target: e.target.value}))}>
                                            <option>设备详情面板</option><option>行业云设备管理</option><option>数据接收记录</option><option>智慧温室场景</option><option>主场景</option><option>能耗监测面板</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">打开方式</label>
                                          <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.openType} onChange={e => updateConf(c => ({...c, openType: e.target.value}))}>
                                            <option>当前页面打开</option><option>右侧面板打开</option><option>底部面板打开</option><option>新面板打开</option>
                                          </select>
                                        </div>
                                      </div>
                                      
                                      <div className="pt-2 flex gap-2">
                                        <button className="flex-1 py-1.5 bg-[#10A66A] hover:bg-[#0c8a58] text-white rounded text-xs transition-colors" onClick={() => {
                                          updateConf(c => ({...c, applied: true}));
                                          setDesignerToast("跳转按钮配置已应用");
                                          setTimeout(() => setDesignerToast(""), 3000);
                                          setPropertyConfigRecords(prev => [{
                                            time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '跳转按钮', content: `${conf.btnName}`, result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>应用跳转配置</button>
                                        <button className="flex-1 py-1.5 bg-[#007BFF] hover:bg-[#0069d9] text-white rounded text-xs transition-colors" onClick={() => {
                                          setDesignerToast("已打开" + conf.target);
                                          setTimeout(() => setDesignerToast(""), 3000);
                                          setTargetPanelVisible({
                                            visible: true,
                                            title: conf.target,
                                            data: {
                                              name: selectedSceneObject.name,
                                              id: selectedSceneObject.id,
                                            }
                                          });
                                          setPropertyConfigRecords(prev => [{
                                            time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '跳转测试', content: `跳转到：${conf.target}`, result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>测试跳转</button>
                                      </div>
                                    </>
                                  )}
                               </div>
                             );
                           })()}

                           {activePropertyTab === "导航锚点" && (() => {
                             const conf = sceneObjectPropertyConfig[selectedSceneObject.id]?.anchorConfig || {
                               enabled: true,
                               name: '温室环境监测点',
                               type: '设备锚点',
                               posX: 120, posY: 0, posZ: 80,
                               rotX: 0, rotY: 45, rotZ: 0,
                               scale: 1.2,
                               desc: '快速定位到温室环境监测设备区域。',
                               applied: false
                             };
                             const updateConf = (updater) => {
                               setSceneObjectPropertyConfig(prev => ({
                                 ...prev,
                                 [selectedSceneObject.id]: {
                                   ...(prev[selectedSceneObject.id] || {}),
                                   anchorConfig: updater(prev[selectedSceneObject.id]?.anchorConfig || conf)
                                 }
                               }));
                             };
                             return (
                               <div className="space-y-4">
                                  <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mb-2">导航锚点配置</div>
                                  <div className="text-[10px] text-zinc-400">说明：为模型设置导航锚点，用于在 3D 场景中快速定位、切换视角或进入指定区域。</div>
                                  
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-zinc-400">是否启用导航锚点</label>
                                    <button className={`w-8 h-4 rounded-full relative transition-colors ${conf.enabled ? 'bg-[#10A66A]' : 'bg-zinc-600'}`} onClick={() => updateConf(c => ({...c, enabled: !c.enabled}))}>
                                      <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all ${conf.enabled ? 'right-0.5' : 'left-0.5'}`} />
                                    </button>
                                  </div>
                                  
                                  {conf.enabled && (
                                    <>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">锚点名称</label>
                                        <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#10A66A]" value={conf.name} onChange={e => updateConf(c => ({...c, name: e.target.value}))} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">锚点类型</label>
                                        <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.type} onChange={e => updateConf(c => ({...c, type: e.target.value}))}>
                                          <option>模型锚点</option><option>场景锚点</option><option>视角锚点</option><option>区域锚点</option><option>设备锚点</option>
                                        </select>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1"><label className="text-[10px] text-zinc-400">锚点位置 X</label><input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none" value={conf.posX} onChange={e => updateConf(c => ({...c, posX: parseFloat(e.target.value)}))} /></div>
                                        <div className="space-y-1"><label className="text-[10px] text-zinc-400">Y</label><input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none" value={conf.posY} onChange={e => updateConf(c => ({...c, posY: parseFloat(e.target.value)}))} /></div>
                                        <div className="space-y-1"><label className="text-[10px] text-zinc-400">Z</label><input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none" value={conf.posZ} onChange={e => updateConf(c => ({...c, posZ: parseFloat(e.target.value)}))} /></div>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1"><label className="text-[10px] text-zinc-400">视角方向 X</label><input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none" value={conf.rotX} onChange={e => updateConf(c => ({...c, rotX: parseFloat(e.target.value)}))} /></div>
                                        <div className="space-y-1"><label className="text-[10px] text-zinc-400">Y</label><input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none" value={conf.rotY} onChange={e => updateConf(c => ({...c, rotY: parseFloat(e.target.value)}))} /></div>
                                        <div className="space-y-1"><label className="text-[10px] text-zinc-400">Z</label><input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1 text-xs text-white outline-none" value={conf.rotZ} onChange={e => updateConf(c => ({...c, rotZ: parseFloat(e.target.value)}))} /></div>
                                      </div>
                                      
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">缩放级别</label>
                                        <input type="number" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none" value={conf.scale} onChange={e => updateConf(c => ({...c, scale: parseFloat(e.target.value)}))} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">导航说明</label>
                                        <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none" value={conf.desc} onChange={e => updateConf(c => ({...c, desc: e.target.value}))} />
                                      </div>
                                      
                                      <div className="pt-2 flex gap-2">
                                        <button className="flex-1 py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] text-white rounded text-xs transition-colors" onClick={() => {
                                          updateConf(c => ({...c, posX: 120, posY: 0, posZ: 80, rotX: 0, rotY: 45, rotZ: 0}));
                                          setDesignerToast("已获取当前位置");
                                          setTimeout(() => setDesignerToast(""), 3000);
                                        }}>获取当前位置</button>
                                        <button className="flex-1 py-1.5 bg-[#10A66A] hover:bg-[#0c8a58] text-white rounded text-xs transition-colors" onClick={() => {
                                          updateConf(c => ({...c, applied: true}));
                                          setNavigationAnchors(prev => {
                                            const existing = prev.filter(x => x.id !== selectedSceneObject.id);
                                            return [{
                                              id: selectedSceneObject.id,
                                              name: conf.name, model: selectedSceneObject.name, type: conf.type,
                                              pos: `X${conf.posX} Y${conf.posY} Z${conf.posZ}`, rot: `Y${conf.rotY}`
                                            }, ...existing];
                                          });
                                          setDesignerToast("导航锚点已保存");
                                          setTimeout(() => setDesignerToast(""), 3000);
                                          setPropertyConfigRecords(prev => [{
                                            time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '导航锚点', content: `${conf.name}`, result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>保存锚点</button>
                                        <button className="flex-1 py-1.5 bg-[#007BFF] hover:bg-[#0069d9] text-white rounded text-xs transition-colors" onClick={() => {
                                          setDesignerToast("已定位到导航锚点");
                                          setTimeout(() => setDesignerToast(""), 3000);
                                          setPropertyConfigRecords(prev => [{
                                            time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '定位锚点', content: `${conf.name}`, result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>定位锚点</button>
                                      </div>
                                    </>
                                  )}
                               </div>
                             );
                           })()}

                           {activePropertyTab === "语音配置" && (() => {
                             const conf = sceneObjectPropertyConfig[selectedSceneObject.id]?.voiceConfig || {
                               enabled: true,
                               name: '温湿度传感器语音说明',
                               type: '模型说明',
                               source: '上传语音文件',
                               file: null,
                               text: '这是温湿度传感器，用于采集环境温度和湿度数据。',
                               playMode: '点击模型播放',
                               showBtn: true,
                               parseStatus: '待解析',
                               playStatus: '未播放',
                               progress: '00:00 / 00:12',
                               applied: false
                             };
                             const updateConf = (updater) => {
                               setSceneObjectPropertyConfig(prev => ({
                                 ...prev,
                                 [selectedSceneObject.id]: {
                                   ...(prev[selectedSceneObject.id] || {}),
                                   voiceConfig: updater(prev[selectedSceneObject.id]?.voiceConfig || conf)
                                 }
                               }));
                             };
                             return (
                               <div className="space-y-4">
                                  <div className="text-[10px] text-zinc-500 uppercase font-bold border-b border-[#2A2D39] pb-1 mb-2">语音配置</div>
                                  <div className="text-[10px] text-zinc-400">说明：为模型配置语音说明，可通过上传语音文件或输入语音文本完成配置。</div>
                                  
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-zinc-400">是否启用语音</label>
                                    <button className={`w-8 h-4 rounded-full relative transition-colors ${conf.enabled ? 'bg-[#10A66A]' : 'bg-zinc-600'}`} onClick={() => updateConf(c => ({...c, enabled: !c.enabled}))}>
                                      <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all ${conf.enabled ? 'right-0.5' : 'left-0.5'}`} />
                                    </button>
                                  </div>
                                  
                                  {conf.enabled && (
                                    <>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">语音名称</label>
                                        <input type="text" className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#10A66A]" value={conf.name} onChange={e => updateConf(c => ({...c, name: e.target.value}))} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">语音类型</label>
                                        <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.type} onChange={e => updateConf(c => ({...c, type: e.target.value}))}>
                                          <option>模型说明</option><option>操作提示</option><option>告警提示</option><option>导航讲解</option><option>设备状态播报</option>
                                        </select>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] text-zinc-400">语音来源</label>
                                        <div className="flex bg-[#16181E] border border-[#2A2D39] rounded p-1">
                                          {["上传语音文件", "输入语音文本"].map(typ => (
                                            <button key={typ} className={`flex-1 py-1 text-xs rounded transition-colors ${conf.source === typ ? 'bg-[#2A2D39] text-[#10A66A] font-bold' : 'text-zinc-500 hover:text-zinc-300'}`} onClick={() => updateConf(c => ({...c, source: typ}))}>{typ}</button>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      {conf.source === '上传语音文件' && (
                                        <div className="space-y-2">
                                          {!conf.file ? (
                                            <div className="border border-dashed border-zinc-700 hover:border-[#10A66A] rounded bg-[#16181E] p-4 flex flex-col items-center justify-center cursor-pointer transition-colors" onClick={() => updateConf(c => ({...c, file: {name: 'sensor_intro.mp3', format: 'mp3', size: '1.8 MB', duration: '12 秒'}}))}>
                                              <Upload className="w-6 h-6 text-zinc-500 mb-2" />
                                              <p className="text-xs font-bold text-zinc-300">拖拽语音文件到此处，或点击选择文件</p>
                                              <p className="text-[10px] text-zinc-500 mt-1">支持格式：mp3、wav、ogg</p>
                                              <button className="mt-2 px-3 py-1 bg-[#2A2D39] hover:bg-[#3A3D49] text-white text-xs rounded transition-colors">选择语音文件</button>
                                            </div>
                                          ) : (
                                            <div className="border border-[#2A2D39] bg-[#16181E] rounded p-3">
                                              <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                  <Volume2 className="w-6 h-6 text-[#10A66A]" />
                                                  <div>
                                                    <div className="text-xs font-bold text-white">{conf.file.name}</div>
                                                    <div className="text-[10px] text-zinc-500">格式：{conf.file.format} | 大小：{conf.file.size} | 时长：{conf.file.duration}</div>
                                                  </div>
                                                </div>
                                                <button className="text-[10px] text-zinc-500 hover:text-red-400" onClick={() => updateConf(c => ({...c, file: null, parseStatus: '待解析'}))}>移除</button>
                                              </div>
                                              <div className="flex justify-between items-center text-[10px]">
                                                <span className={`${conf.parseStatus === '解析成功' ? 'text-[#10A66A]' : 'text-zinc-500'}`}>状态：{conf.parseStatus}</span>
                                                {conf.parseStatus !== '解析成功' && (
                                                  <button className="text-[#10A66A] hover:text-[#0c8a58] font-bold" onClick={() => {
                                                    updateConf(c => ({...c, parseStatus: '解析成功'}));
                                                    setDesignerToast("语音文件解析成功");
                                                    setTimeout(() => setDesignerToast(""), 3000);
                                                    setPropertyConfigRecords(prev => [{
                                                        time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '文件解析', content: 'sensor_intro.mp3', result: '成功', user: '学生1'
                                                    }, ...prev]);
                                                  }}>解析语音文件</button>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {conf.source === '输入语音文本' && (
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">语音文本</label>
                                          <textarea className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#10A66A] h-20" value={conf.text} onChange={e => updateConf(c => ({...c, text: e.target.value}))}></textarea>
                                        </div>
                                      )}

                                      <div className="grid grid-cols-2 gap-2 pt-2">
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">播放方式</label>
                                          <select className="w-full bg-[#16181E] border border-[#2A2D39] rounded px-2 py-1.5 text-xs text-white outline-none custom-select focus:border-[#10A66A]" value={conf.playMode} onChange={e => updateConf(c => ({...c, playMode: e.target.value}))}>
                                            <option>点击模型播放</option><option>进入场景自动播放</option><option>点击按钮播放</option><option>触发事件播放</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-zinc-400">显示播放按钮</label>
                                          <button className={`w-full h-[28px] mt-0.5 rounded flex items-center justify-center transition-colors ${conf.showBtn ? 'bg-[#2A2D39] text-[#10A66A]' : 'bg-[#16181E] border border-[#2A2D39] text-zinc-500'}`} onClick={() => updateConf(c => ({...c, showBtn: !c.showBtn}))}>
                                            {conf.showBtn ? '已开启' : '已关闭'}
                                          </button>
                                        </div>
                                      </div>

                                      <div className="pt-3 pb-1 border-t border-[#2A2D39]">
                                          <div className="flex items-center justify-between text-[10px] mb-2">
                                            <span className="text-zinc-400">试听状态: <span className={`font-bold ${conf.playStatus === '播放完成' ? 'text-[#10A66A]' : conf.playStatus === '播放中' ? 'text-[#007BFF]' : 'text-zinc-500'}`}>{conf.playStatus}</span></span>
                                            <span className="text-zinc-500 font-mono">{conf.progress}</span>
                                          </div>
                                          <div className="w-full h-1 bg-[#16181E] rounded overflow-hidden">
                                            <div className="h-full bg-[#10A66A] transition-all duration-1000" style={{ width: conf.playStatus === '播放完成' ? '100%' : conf.playStatus === '播放中' ? '50%' : '0%' }}></div>
                                          </div>
                                      </div>
                                      
                                      <div className="pt-2 flex gap-2 flex-wrap">
                                        <button className="flex-1 py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-zinc-300 rounded text-xs transition-colors" onClick={() => {
                                          updateConf(c => ({...c, playStatus: '播放中'}));
                                          setTimeout(() => updateConf(c => ({...c, playStatus: '播放完成'})), 2000);
                                          setPropertyConfigRecords(prev => [{
                                              time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '语音试听', content: '播放完成', result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>试听语音</button>
                                        <button className="flex-1 py-1.5 bg-[#10A66A] hover:bg-[#0c8a58] text-white rounded text-xs transition-colors" onClick={() => {
                                          updateConf(c => ({...c, applied: true}));
                                          setDesignerToast("语音配置已应用");
                                          setTimeout(() => setDesignerToast(""), 3000);
                                          setPropertyConfigRecords(prev => [{
                                              time: new Date().toTimeString().split(' ')[0], modelName: selectedSceneObject.name, type: '语音配置', content: `${conf.file?.name || '文本语音'}`, result: '成功', user: '学生1'
                                          }, ...prev]);
                                        }}>应用语音配置</button>
                                        <button className="w-full py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs transition-colors" onClick={() => updateConf(c => ({...c, applied: false, playStatus: '未播放'}))}>清除语音</button>
                                      </div>
                                    </>
                                  )}
                               </div>
                             );
                           })()}
                         </div>
                       </div>
                     )}
                  </div>
                )}
             </div>

          </div>
        </div>
      )}

      {/* Target Panel Mock */}
      {targetPanelVisible && targetPanelVisible.visible && (
        <div className="absolute right-[320px] top-[100px] w-72 bg-[#1A1B23]/95 backdrop-blur border border-[#2A2D39] rounded-lg flex flex-col overflow-hidden shadow-2xl z-50 animate-in slide-in-from-right">
          <div className="bg-[#16181E] px-4 py-3 border-b border-[#2A2D39] flex items-center justify-between">
             <span className="font-bold text-white text-sm">{targetPanelVisible.title}</span>
             <button className="text-zinc-500 hover:text-white" onClick={() => setTargetPanelVisible(null)}><X className="w-4 h-4" /></button>
          </div>
          <div className="p-4 space-y-4 text-xs">
             <div className="flex justify-between">
                <span className="text-zinc-500">设备名称:</span>
                <span className="text-white font-bold">{targetPanelVisible.data?.name || '-'}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-zinc-500">设备编号:</span>
                <span className="text-zinc-300 font-mono">temp01</span>
             </div>
             <div className="flex justify-between">
                <span className="text-zinc-500">数据来源:</span>
                <span className="text-zinc-400">行业云平台仿真设备数据</span>
             </div>
             <div className="flex justify-between border-t border-[#2A2D39] pt-3">
                <span className="text-zinc-500">当前数据:</span>
                <span className="text-[#10A66A] font-bold">温度 24.6 ℃，湿度 58%</span>
             </div>
             <div className="flex justify-between">
                <span className="text-zinc-500">最近更新时间:</span>
                <span className="text-zinc-500 font-mono">10:40:20</span>
             </div>
          </div>
        </div>
      )}
      {/* Import Package Drawer */}
      {importDrawerVisible && (
        <div className="absolute inset-0 bg-black/60 z-[200] flex justify-end animate-in fade-in">
          <div className="w-[500px] h-full bg-[#1A1B23] border-l border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="h-14 border-b border-zinc-800 flex justify-between items-center px-6 shrink-0 bg-[#16181E]">
              <div>
                <h3 className="text-white font-bold">导入应用</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">导入 3D 应用包，系统将解析应用配置、场景资源、模型资源、设备绑定和数据源配置。</p>
              </div>
              <button className="text-zinc-500 hover:text-white transition-colors" onClick={() => setImportDrawerVisible(false)}><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Upload Area */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">上传应用包文件</label>
                {!selectedImportFile ? (
                  <div className="border border-dashed border-zinc-700 hover:border-[#10A66A] rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors" onClick={() => setSelectedImportFile("greenhouse_3d_app.zip")}>
                    <Upload className="w-8 h-8 text-zinc-500 mb-3" />
                    <p className="text-sm font-bold text-zinc-300">拖拽 3D 应用包到此处，或点击选择文件</p>
                    <p className="text-xs text-zinc-500 mt-2">支持 .zip, .json, .glb, .gltf 格式文件</p>
                    <button className="mt-4 px-4 py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] text-white text-xs rounded transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedImportFile("greenhouse_3d_app.zip"); }}>选择文件</button>
                  </div>
                ) : (
                  <div className="border border-zinc-700 bg-[#16181E] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FileBox className="w-8 h-8 text-[#10A66A]" />
                        <div>
                          <div className="text-sm font-bold text-white">{selectedImportFile}</div>
                          <div className="text-xs text-zinc-500">已就绪，等待解析</div>
                        </div>
                      </div>
                      <button className="text-zinc-500 hover:text-white text-xs" onClick={() => { setSelectedImportFile(null); setImportPackageInfo(null); setImportValidationResults(null); }}>移除</button>
                    </div>
                    <button className="w-full py-2 bg-[#10A66A] hover:bg-[#0c8a58] text-white text-sm font-bold rounded transition-colors" onClick={handleParseImportPackage}>解析应用包</button>
                  </div>
                )}
              </div>

              {/* Import Config */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h4 className="text-sm font-bold text-white">导入配置</h4>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">应用名称</label>
                    <input type="text" className="bg-[#16181E] border border-zinc-700 outline-none rounded px-3 py-1.5 text-sm text-white focus:border-[#10A66A]" value={importConfig.appName} onChange={e => setImportConfig({...importConfig, appName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-zinc-400">导入方式</label>
                      <select className="bg-[#16181E] border border-zinc-700 outline-none rounded px-3 py-1.5 text-sm text-white focus:border-[#10A66A]" value={importConfig.importMethod} onChange={e => setImportConfig({...importConfig, importMethod: e.target.value})}>
                        <option>新建应用</option>
                        <option>覆盖已有应用</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-zinc-400">冲突处理</label>
                      <select className="bg-[#16181E] border border-zinc-700 outline-none rounded px-3 py-1.5 text-sm text-white focus:border-[#10A66A]" value={importConfig.conflictStrategy} onChange={e => setImportConfig({...importConfig, conflictStrategy: e.target.value})}>
                        <option>自动重命名</option>
                        <option>覆盖配置</option>
                        <option>跳过冲突项</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">导入内容</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                       {Object.entries({ scene: '场景配置', models: '3D 模型资源', components: '组件配置', bindings: '设备绑定', ds: '数据源配置', scripts: '场景脚本', meta: '应用元信息' }).map(([k, v]) => (
                         <label key={k} className="flex items-center gap-2 cursor-pointer group">
                           <input type="checkbox" checked={(importConfig.contents as any)[k]} onChange={() => false} className="accent-[#10A66A] w-3.5 h-3.5 bg-[#16181E] border-zinc-700" />
                           <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">{v}</span>
                         </label>
                       ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Preview */}
              {importPackageInfo && (
                <div className="space-y-4 pt-4 border-t border-zinc-800 animate-in fade-in slide-in-from-bottom-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    应用包内容预览
                  </h4>
                  <div className="bg-[#16181E] border border-zinc-800 rounded p-4 text-xs space-y-4">
                     <div className="grid grid-cols-2 gap-y-3">
                       <div className="text-zinc-500">应用名称：<span className="text-white">{importPackageInfo.appName}</span></div>
                       <div className="text-zinc-500">应用版本：<span className="text-white">{importPackageInfo.version}</span></div>
                       <div className="text-zinc-500">应用类型：<span className="text-white">{importPackageInfo.appType}</span></div>
                       <div className="text-zinc-500">场景数量：<span className="text-white">{importPackageInfo.sceneCount}</span></div>
                       <div className="text-zinc-500">模型资源：<span className="text-white">{importPackageInfo.modelCount} 个</span></div>
                       <div className="text-zinc-500">组件数量：<span className="text-white">{importPackageInfo.componentCount} 个</span></div>
                       <div className="text-zinc-500">设备绑定：<span className="text-white">{importPackageInfo.bindingCount} 个</span></div>
                       <div className="text-zinc-500">数据源：<span className="text-white">{importPackageInfo.dsCount} 个</span></div>
                       <div className="text-zinc-500">场景脚本：<span className="text-white">{importPackageInfo.scriptCount} 个</span></div>
                     </div>
                     <div className="border-t border-zinc-800 pt-3">
                       <div className="text-zinc-400 mb-2 font-bold font-mono">资源清单：</div>
                       <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-[11px]">
                          {importPackageInfo.resources.map((res: any, idx: number) => (
                             <div key={idx} className="flex gap-2">
                               <span className="truncate w-36 text-zinc-300" title={res.name}>{res.name}</span>
                               <span className="text-zinc-500">｜</span>
                               <span className="w-16 shrink-0 text-zinc-400">{res.type}</span>
                               <span className="text-zinc-500">｜</span>
                               <span className={`${res.color} shrink-0`}>{res.status}</span>
                             </div>
                          ))}
                       </div>
                     </div>
                  </div>
                </div>
              )}

              {/* Validation Results */}
              {importValidationResults && (
                <div className="space-y-4 pt-4 border-t border-zinc-800 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">校验结果</h4>
                    <span className="text-xs font-bold bg-[#10A66A]/10 text-[#10A66A] px-2 py-1 rounded border border-[#10A66A]/20">校验状态：{importValidationResults.status}</span>
                  </div>
                  <div className="bg-[#16181E] border border-zinc-800 rounded p-4 text-xs space-y-3">
                     <div className="grid grid-cols-2 gap-2 text-[11px]">
                       {importValidationResults.items.map((item: any, idx: number) => (
                         <div key={idx} className="flex justify-between border-b border-zinc-800/50 pb-1">
                           <span className="text-zinc-400">{item.name}</span>
                           <span className="text-[#10A66A]">{item.status}</span>
                         </div>
                       ))}
                     </div>
                     {importValidationResults.notice && (
                       <div className="mt-2 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] p-2 rounded flex gap-2 items-start">
                         <Info className="w-4 h-4 shrink-0 mt-0.5" />
                         <span>提示项：{importValidationResults.notice}</span>
                       </div>
                     )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-[#16181E] flex justify-end gap-3 shrink-0">
               {importValidationResults && (
                 <button className="px-4 py-2 text-xs font-bold text-[#10A66A] border border-[#10A66A] rounded hover:bg-[#10A66A]/10 transition-colors" onClick={() => { showToast("重新校验完成"); addRecord("重新校验应用包", "智慧温室 3D 监控应用", "greenhouse_3d_app.zip", "3D 应用包"); }}>重新校验</button>
               )}
               <button className="px-4 py-2 text-xs font-bold text-zinc-300 bg-[#2A2D39] hover:bg-[#3A3D49] rounded transition-colors" onClick={() => setImportDrawerVisible(false)}>取消</button>
               <button className="px-4 py-2 text-xs font-bold text-white bg-[#10A66A] hover:bg-[#0c8a58] rounded transition-colors disabled:opacity-50" disabled={!importValidationResults} onClick={handleConfirmImport}>确认导入</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Package Drawer */}
      {exportDrawerVisible && (
        <div className="absolute inset-0 bg-black/60 z-[200] flex justify-end animate-in fade-in">
          <div className="w-[450px] h-full bg-[#1A1B23] border-l border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="h-14 border-b border-zinc-800 flex justify-between items-center px-6 shrink-0 bg-[#16181E]">
              <div>
                <h3 className="text-white font-bold">导出应用</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">将 3D 应用的场景配置、模型资源、组件配置、设备绑定和数据源配置打包导出。</p>
              </div>
              <button className="text-zinc-500 hover:text-white transition-colors" onClick={() => setExportDrawerVisible(false)}><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white">导出配置</h4>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">当前导出应用</label>
                    <div className="bg-[#16181E] border border-zinc-700 rounded px-3 py-2 text-sm text-[#10A66A] font-bold">{exportConfig.exportApp?.name || "智慧温室 3D 监控应用"}</div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">导出格式</label>
                    <select className="bg-[#16181E] border border-zinc-700 outline-none rounded px-3 py-1.5 text-sm text-white focus:border-[#10A66A]" value={exportConfig.format} onChange={e => setExportConfig({...exportConfig, format: e.target.value})}>
                      <option>3D 应用包</option>
                      <option>JSON 配置包</option>
                      <option>ZIP 资源包</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">导出文件名</label>
                    <input type="text" className="bg-[#16181E] border border-zinc-700 outline-none rounded px-3 py-1.5 text-sm text-white focus:border-[#10A66A] font-mono" value={exportConfig.filename} onChange={e => setExportConfig({...exportConfig, filename: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">版本号</label>
                    <input type="text" className="bg-[#16181E] border border-zinc-700 outline-none rounded px-3 py-1.5 text-sm text-white focus:border-[#10A66A] font-mono" value={exportConfig.version} onChange={e => setExportConfig({...exportConfig, version: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">导出内容</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                       {Object.entries({ scene: '场景配置', models: '3D 模型资源', components: '组件配置', bindings: '设备绑定', ds: '数据源配置', scripts: '场景脚本', meta: '应用元信息' }).map(([k, v]) => (
                         <label key={k} className="flex items-center gap-2 cursor-pointer group">
                           <input type="checkbox" checked={(exportConfig.contents as any)[k]} onChange={() => false} className="accent-[#10A66A] w-3.5 h-3.5 bg-[#16181E] border-zinc-700" />
                           <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">{v}</span>
                         </label>
                       ))}
                    </div>
                  </div>
                  <div className="bg-[#16181E] border border-zinc-800 p-3 rounded text-xs text-zinc-400">
                    <span className="font-bold text-zinc-300">导出说明：</span>包含当前 3D 应用的完整场景、模型、组件、设备绑定和数据源配置。
                  </div>
                </div>
              </div>

              {/* Export Result */}
              {exportResult && (
                <div className="space-y-4 pt-4 border-t border-zinc-800 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">导出结果</h4>
                    <span className="text-xs font-bold bg-[#10A66A]/10 text-[#10A66A] px-2 py-1 rounded border border-[#10A66A]/20">状态：{exportResult.status}</span>
                  </div>
                  <div className="bg-[#16181E] border border-[#10A66A]/30 rounded p-4 text-xs space-y-3 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-16 h-16 bg-[#10A66A]/10 rounded-bl-full -mr-8 -mt-8"></div>
                     <div className="grid grid-cols-1 gap-y-2">
                       <div className="text-zinc-500">文件名称：<span className="text-white font-mono">{exportResult.filename}</span></div>
                       <div className="text-zinc-500">文件大小：<span className="text-white font-mono">{exportResult.size}</span></div>
                       <div className="text-zinc-500">导出时间：<span className="text-white font-mono">{exportResult.time}</span></div>
                       <div className="text-zinc-500">导出内容：<span className="text-white leading-relaxed">{exportResult.contentStr}</span></div>
                       <div className="text-zinc-500 flex items-center gap-2">完整性校验：<span className="text-[#10A66A] font-bold"><Check className="w-3 h-3 inline mr-1"/>{exportResult.validation}</span></div>
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-[#16181E] flex justify-end gap-3 shrink-0">
               {exportResult ? (
                 <>
                   <button className="px-4 py-2 text-xs font-bold text-[#10A66A] border border-[#10A66A] rounded hover:bg-[#10A66A]/10 transition-colors flex gap-1.5 items-center" onClick={() => { showToast("导出信息已复制"); }}><CopyIcon className="w-3.5 h-3.5" /> 复制导出信息</button>
                   <button className="px-4 py-2 text-xs font-bold text-white bg-[#10A66A] hover:bg-[#0c8a58] rounded transition-colors flex gap-1.5 items-center" onClick={() => { showToast("导出包已准备完成"); addRecord("下载导出包", exportConfig.exportApp?.name, exportResult.filename, exportConfig.format); setExportDrawerVisible(false); }}><Download className="w-3.5 h-3.5" /> 下载导出包</button>
                 </>
               ) : (
                 <>
                   <button className="px-4 py-2 text-xs font-bold text-zinc-300 bg-[#2A2D39] hover:bg-[#3A3D49] rounded transition-colors" onClick={() => setExportDrawerVisible(false)}>取消</button>
                   <button className="px-4 py-2 text-xs font-bold text-white bg-[#10A66A] hover:bg-[#0c8a58] rounded transition-colors" onClick={handleGenerateExport}>生成导出包</button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}