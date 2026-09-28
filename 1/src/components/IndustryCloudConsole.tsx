import React, { useState, useEffect } from "react";
import { 
  Home, Cpu, Sliders, Bell, LayoutDashboard, Database, HardDrive, 
  Layers, Settings, Play, Pause, RefreshCw, Send, CheckCircle2, 
  AlertCircle, ChevronRight, X, Eye, FileText, Server, Clock, 
  User, Check, PlayCircle, Network, ArrowRight, HelpCircle,
  Zap, Plus, Trash2, Copy, Power, Edit, Box, Activity
} from "lucide-react";

// Definitions of shared structures
interface SharedCloudState {
  isConnected: boolean;
  isSynced: boolean;
  isReporting: boolean;
  todayReportCount: number;
  latestValues: {
    temp: number;
    hum: number;
    light: number;
    co2: number;
    fanStatus: string;
    relayStatus: string;
    waterPumpStatus: string;
  };
  uploadRecords: Array<{
    id: string;
    time: string;
    device: string;
    topic: string;
    payload: string;
    status: string;
  }>;
  lastReportTime: string;
}

const defaultSharedState: SharedCloudState = {
  isConnected: false,
  isSynced: false,
  isReporting: false,
  todayReportCount: 12,
  latestValues: {
    temp: 24.6,
    hum: 58,
    light: 450,
    co2: 620,
    fanStatus: "关闭",
    relayStatus: "关闭",
    waterPumpStatus: "关闭"
  },
  uploadRecords: [
    {
      id: "rec-1",
      time: "10:35:20",
      device: "温湿度传感器",
      topic: "/greenhouse/tempHum",
      payload: `{"temp":24.6,"hum":58}`,
      status: "已上报"
    },
    {
      id: "rec-2",
      time: "10:35:22",
      device: "光照传感器",
      topic: "/greenhouse/light",
      payload: `{"light":450}`,
      status: "已上报"
    },
    {
      id: "rec-3",
      time: "10:35:24",
      device: "二氧化碳传感器",
      topic: "/greenhouse/co2",
      payload: `{"co2":620}`,
      status: "已上报"
    },
    {
      id: "rec-4",
      time: "10:35:24",
      device: "Modbus网关",
      topic: "/gateway/status",
      payload: `{"status":"online"}`,
      status: "已上报"
    }
  ],
  lastReportTime: "10:35:25"
};

const getSharedCloudState = (): SharedCloudState => {
  if (typeof window !== "undefined") {
    if (!(window as any).CLOUD_SHARED_STATE) {
      (window as any).CLOUD_SHARED_STATE = JSON.parse(JSON.stringify(defaultSharedState));
    }
    return (window as any).CLOUD_SHARED_STATE;
  }
  return defaultSharedState;
};

const setSharedCloudState = (state: Partial<SharedCloudState>) => {
  if (typeof window !== "undefined") {
    const current = getSharedCloudState();
    (window as any).CLOUD_SHARED_STATE = {
      ...current,
      ...state
    };
  }
};

interface IndustryCloudConsoleProps {
  onClose?: () => void;
  showToast: (msg: string) => void;
  onOpen3DDesigner?: (options?: { view?: "appList" | "editor" }) => void;
  onOpen2DDesigner?: (options?: { view?: "appList" | "editor" }) => void;
}

export default function IndustryCloudConsole({ onClose, showToast, onOpen3DDesigner, onOpen2DDesigner }: IndustryCloudConsoleProps) {
  // Navigation active tab
  const [activeMenu, setActiveMenu] = useState<string>("overview"); // overview, product, device, simulation, others
  
  // Local state synced from window.CLOUD_SHARED_STATE
  const [sharedState, setSharedState] = useState<SharedCloudState>(getSharedCloudState());
  const [selectedDeviceDetails, setSelectedDeviceDetails] = useState<any | null>(null);

  // Simulation specific states
  // Data Simulation States
  const [simulationDevices] = useState([
    { id: "temp01", name: "温湿度传感器", code: "temp01", product: "智慧温室传感器产品", type: "传感器", status: "在线", tmCount: 2 },
    { id: "light01", name: "光照传感器", code: "light01", product: "智慧温室传感器产品", type: "传感器", status: "在线", tmCount: 1 },
    { id: "co201", name: "二氧化碳传感器", code: "co201", product: "智慧温室传感器产品", type: "传感器", status: "在线", tmCount: 1 },
    { id: "gw01", name: "Modbus网关", code: "gw01", product: "智慧网关产品", type: "网关", status: "在线", tmCount: 3 },
    { id: "relay01", name: "继电器", code: "relay01", product: "智慧风机控制产品", type: "继电器", status: "在线", tmCount: 1 },
    { id: "fan01", name: "风机", code: "fan01", product: "智慧风机控制产品", type: "负载", status: "在线", tmCount: 1 }
  ]);
  const [selectedSimulationDevices, setSelectedSimulationDevices] = useState(["temp01", "light01"]);
  const [deviceThingModels, setDeviceThingModels] = useState({
    temp01: [
      { id: "temperature", name: "温度", type: "数值型", unit: "℃", val: "24.6", enabled: true },
      { id: "humidity", name: "湿度", type: "数值型", unit: "%", val: "58", enabled: true }
    ],
    light01: [
      { id: "light", name: "光照", type: "数值型", unit: "Lux", val: "450", enabled: true }
    ],
    co201: [
      { id: "co2", name: "二氧化碳", type: "数值型", unit: "ppm", val: "620", enabled: true }
    ],
    gw01: [
      { id: "gatewayStatus", name: "网关状态", type: "枚举型", unit: "-", val: "online", enabled: true }
    ],
    relay01: [
      { id: "relayStatus", name: "继电器状态", type: "枚举型", unit: "-", val: "off", enabled: true }
    ],
    fan01: [
      { id: "fanStatus", name: "风机状态", type: "枚举型", unit: "-", val: "off", enabled: true }
    ]
  });
  
  const [valueMode, setValueMode] = useState("固定值");
  const [fixedValueConfig, setFixedValueConfig] = useState({ temperature: "26", humidity: "60", light: "500", fanStatus: "on", co2: "800", gatewayStatus: "online", relayStatus: "on" });
  const [randomValueConfig, setRandomValueConfig] = useState({
    temperature: { min: "20", max: "35", dec: "1" },
    humidity: { min: "45", max: "80", dec: "0" },
    light: { min: "300", max: "800", dec: "0" },
    co2: { min: "500", max: "900", dec: "0" }
  });
  const [cycleValueConfig, setCycleValueConfig] = useState({
    temperature: { vals: "24, 25, 26, 27, 26, 25", interval: "2" },
    humidity: { vals: "55, 58, 60, 62, 59", interval: "2" },
    light: { vals: "300, 450, 600, 750, 500", interval: "2" },
    fanStatus: { vals: "off, on, on, off", interval: "2" }
  });
  
  const [executionMode, setExecutionMode] = useState("单次执行");
  const [loopExecutionConfig, setLoopExecutionConfig] = useState({ interval: "2", count: "10", continuous: "否" });
  const [simTaskActive, setSimTaskActive] = useState(false);
  
  // --- Device Task Management States ---
  const [taskTargetType, setTaskTargetType] = useState("设备");
  const [selectedTaskDevices, setSelectedTaskDevices] = useState<string[]>(["temp01", "relay01", "fan01"]);
  const [selectedTaskProducts, setSelectedTaskProducts] = useState<string[]>(["p1"]);
  
  const [taskActionType, setTaskActionType] = useState("属性下发");
  const [propertyDownlinkConfig, setPropertyDownlinkConfig] = useState({
    property: "fanStatus",
    value: "on",
    strategy: "立即下发",
    timeout: "30",
    retry: false
  });
  const [serviceCallConfig, setServiceCallConfig] = useState({
    serviceName: "readDeviceStatus",
    params: '{\n  "deviceId": "gw01"\n}',
    strategy: "批量调用",
    timeout: "30",
    retry: true
  });

  const [scheduleType, setScheduleType] = useState("每日");
  const [singleDayScheduleConfig, setSingleDayScheduleConfig] = useState({ date: "2026-06-08", time: "10:30" });
  const [dailyScheduleConfig, setDailyScheduleConfig] = useState({ time: "08:00", startDate: "2026-06-08", endDate: "2026-06-30" });
  const [weeklyScheduleConfigObj, setWeeklyScheduleConfigObj] = useState({ days: ["周一", "周三", "周五"], time: "18:00" });
  const [intervalScheduleConfig, setIntervalScheduleConfig] = useState({ unit: "分钟", value: "30", startTime: "08:00", endTime: "18:00", count: "20" });

  const [deviceTasks, setDeviceTasks] = useState([
    { id: "dt-1", name: "温室风机定时开启", target: "风机 fan01、继电器 relay01", targetType: "设备", actionType: "属性下发", scheduleType: "每日", content: "fanStatus = on", status: "已启用", lastExecuteTime: "08:00:00" },
    { id: "dt-2", name: "补光灯单日关闭", target: "智慧温室控制产品", targetType: "产品", actionType: "属性下发", scheduleType: "单日", content: "lightSwitch = off", status: "已启用", lastExecuteTime: "10:30:00" },
    { id: "dt-3", name: "网关状态周期读取", target: "Modbus网关 gw01", targetType: "设备", actionType: "服务调用", scheduleType: "循环间隔", content: "readDeviceStatus", status: "已启用", lastExecuteTime: "10:45:20" },
    { id: "dt-4", name: "每周通风模式切换", target: "智慧风机控制产品", targetType: "产品", actionType: "服务调用", scheduleType: "每周", content: "setVentilationMode", status: "未启用", lastExecuteTime: "暂无" },
  ]);

  const [taskExecutionRecords, setTaskExecutionRecords] = useState([
    { id: "er-1", time: "08:00:00", name: "温室风机定时开启", target: "风机 fan01", actionType: "属性下发", scheduleType: "每日", content: "fanStatus = on", result: "成功", detail: "风机状态已更新为运行中" },
    { id: "er-2", time: "10:30:00", name: "补光灯单日关闭", target: "智慧温室控制产品", actionType: "属性下发", scheduleType: "单日", content: "lightSwitch = off", result: "成功", detail: "产品下 2 台设备已执行" },
    { id: "er-3", time: "10:45:20", name: "网关状态周期读取", target: "Modbus网关 gw01", actionType: "服务调用", scheduleType: "循环间隔", content: "readDeviceStatus", result: "成功", detail: "设备状态在线" },
    { id: "er-4", time: "18:00:00", name: "每周通风模式切换", target: "智慧风机控制产品", actionType: "服务调用", scheduleType: "每周", content: "setVentilationMode", result: "等待执行", detail: "任务等待下次执行" },
  ]);

  const [taskLogs, setTaskLogs] = useState([
    { id: "tl-1", time: "10:20:00", name: "温室风机定时开启", opType: "创建任务", target: "风机 fan01", result: "成功", detail: "任务已创建", operator: "学生1" },
    { id: "tl-2", time: "10:21:10", name: "温室风机定时开启", opType: "启用任务", target: "风机 fan01", result: "成功", detail: "任务已启用", operator: "学生1" },
    { id: "tl-3", time: "10:30:00", name: "补光灯单日关闭", opType: "属性下发", target: "智慧温室控制产品", result: "成功", detail: "lightSwitch = off", operator: "学生1" },
    { id: "tl-4", time: "10:45:20", name: "网关状态周期读取", opType: "服务调用", target: "Modbus网关 gw01", result: "成功", detail: "readDeviceStatus 调用成功", operator: "学生1" },
  ]);

  const [cloudProducts] = useState([
    { id: "p1", name: "智慧风机控制产品", type: "执行器产品", nodeType: "网关子设备", protocol: "Modbus", deviceCount: 2, status: "已启用" },
    { id: "p2", name: "智慧温室传感器产品", type: "传感器产品", nodeType: "直连设备", protocol: "MQTT", deviceCount: 3, status: "已启用" },
    { id: "p3", name: "智慧网关产品", type: "网关产品", nodeType: "网关设备", protocol: "MQTT", deviceCount: 1, status: "已启用" }
  ]);

  const [cloudDevices, setCloudDevices] = useState([
    { id: "d1", code: "temp01", name: "温湿度传感器", product: "智慧温室传感器产品", type: "传感器", status: "在线", latestData: "温度 24.6℃，湿度 58%" },
    { id: "d2", code: "light01", name: "光照传感器", product: "智慧温室传感器产品", type: "传感器", status: "在线", latestData: "光照 450 Lux" },
    { id: "d3", code: "co201", name: "二氧化碳传感器", product: "智慧温室传感器产品", type: "传感器", status: "在线", latestData: "CO₂ 620 ppm" },
    { id: "d4", code: "relay01", name: "继电器", product: "智慧风机控制产品", type: "继电器", status: "在线", latestData: "关闭" },
    { id: "d5", code: "fan01", name: "风机", product: "智慧风机控制产品", type: "负载", status: "在线", latestData: "停止" }
  ]);

  const [simulationTasks, setSimulationTasks] = useState([
    { id: "task-1", name: "温室环境数据任务", devices: "温湿度传感器、光照传感器", props: "temperature、humidity、light", vMode: "随机值", eMode: "循环执行", status: "运行中", lastTime: "10:45:20" },
    { id: "task-2", name: "风机状态测试任务", devices: "风机", props: "fanStatus", vMode: "循环值", eMode: "单次执行", status: "已完成", lastTime: "10:42:00" },
    { id: "task-3", name: "CO₂ 浓度上报任务", devices: "二氧化碳传感器", props: "co2", vMode: "固定值", eMode: "定时执行", status: "等待执行", lastTime: "10:50:00" }
  ]);
  
  const [simulationPreviewData, setSimulationPreviewData] = useState([
    { id: 1, time: "10:45:20", devName: "温湿度传感器", devCode: "temp01", prop: "temperature", val: "24.8", unit: "℃", vMode: "随机值", eMode: "循环执行", status: "已产生" },
    { id: 2, time: "10:45:20", devName: "温湿度传感器", devCode: "temp01", prop: "humidity", val: "58", unit: "%", vMode: "随机值", eMode: "循环执行", status: "已产生" },
    { id: 3, time: "10:45:22", devName: "光照传感器", devCode: "light01", prop: "light", val: "465", unit: "Lux", vMode: "随机值", eMode: "循环执行", status: "已产生" },
    { id: 4, time: "10:45:24", devName: "风机", devCode: "fan01", prop: "fanStatus", val: "on", unit: "-", vMode: "循环值", eMode: "单次执行", status: "已产生" },
  ]);
  
  const [simulationExecutionRecords, setSimulationExecutionRecords] = useState([
    { id: "rec-1", time: "10:45:20", name: "温室环境数据任务", devCount: 2, propCount: 3, vMode: "随机值", eMode: "循环执行", result: "成功", operator: "学生1" },
    { id: "rec-2", time: "10:42:00", name: "风机状态测试任务", devCount: 1, propCount: 1, vMode: "循环值", eMode: "单次执行", result: "成功", operator: "学生1" },
    { id: "rec-3", time: "10:40:00", name: "CO₂ 浓度上报任务", devCount: 1, propCount: 1, vMode: "固定值", eMode: "定时执行", result: "等待执行", operator: "学生1" },
  ]);

  // Scene Linkage States
  const [deviceEvents, setDeviceEvents] = useState([
    { id: "e-1", time: "10:45:20", name: "温度过高事件", source: "物模型事件", deviceName: "温湿度传感器", deviceCode: "temp01", product: "智慧温室传感器产品", type: "温度异常", level: "重要", syncStatus: "已同步", processStatus: "待处理", condition: "temperature > 30 ℃", content: "温湿度传感器上报温度 32.4 ℃，超过设定阈值 30 ℃。", rawData: "{\n  \"deviceId\": \"temp01\",\n  \"event\": \"temperatureHigh\",\n  \"temperature\": 32.4,\n  \"threshold\": 30,\n  \"time\": \"10:45:20\"\n}", suggestion: "请检查温室通风设备状态，必要时开启风机。" },
    { id: "e-2", time: "10:46:10", name: "网关离线事件", source: "物模型事件", deviceName: "Modbus网关", deviceCode: "gw01", product: "智慧网关产品", type: "设备离线", level: "紧急", syncStatus: "已同步", processStatus: "处理中", condition: "gateway.status == offline", content: "设备在线状态变更为离线。", rawData: "{\n  \"deviceId\": \"gw01\",\n  \"event\": \"gatewayOffline\",\n  \"status\": \"offline\",\n  \"time\": \"10:46:10\"\n}", suggestion: "请检查网关网络连接和供电情况。" },
    { id: "e-3", time: "10:47:05", name: "CO₂ 超限事件", source: "物模型事件", deviceName: "二氧化碳传感器", deviceCode: "co201", product: "智慧温室传感器产品", type: "CO₂ 超限", level: "重要", syncStatus: "已同步", processStatus: "待处理", condition: "co2 > 800", content: "二氧化碳传感器上报 CO₂ 浓度 850 ppm，超过设定阈值 800 ppm。", rawData: "{\n  \"deviceId\": \"co201\",\n  \"event\": \"co2Limit\",\n  \"co2\": 850,\n  \"threshold\": 800,\n  \"time\": \"10:47:05\"\n}", suggestion: "请检查温室换气系统，开启风机进行通风。" },
    { id: "e-4", time: "10:48:30", name: "风机状态变更", source: "设备状态事件", deviceName: "风机", deviceCode: "fan01", product: "智慧风机控制产品", type: "状态变更", level: "一般", syncStatus: "已同步", processStatus: "已处理", condition: "-", content: "风机设备状态发生变更。", rawData: "{\n  \"deviceId\": \"fan01\",\n  \"event\": \"statusChanged\",\n  \"status\": \"on\",\n  \"time\": \"10:48:30\"\n}", suggestion: "状态更新，无需特殊处理。" },
    { id: "e-5", time: "10:50:00", name: "继电器执行事件", source: "服务调用事件", deviceName: "继电器", deviceCode: "relay01", product: "智慧风机控制产品", type: "服务调用事件", level: "一般", syncStatus: "未同步", processStatus: "已处理", condition: "-", content: "收到服务端调用指令。", rawData: "{\n  \"deviceId\": \"relay01\",\n  \"event\": \"serviceInvoked\",\n  \"serviceName\": \"turnOn\",\n  \"time\": \"10:50:00\"\n}", suggestion: "执行记录，无需特殊处理。" },
    { id: "e-6", time: "10:52:12", name: "烟雾告警事件", source: "物模型事件", deviceName: "烟雾传感器", deviceCode: "smoke01", product: "智慧温室传感器产品", type: "告警事件", level: "紧急", syncStatus: "已同步", processStatus: "待处理", condition: "smoke == true", content: "烟雾传感器触发告警状态。", rawData: "{\n  \"deviceId\": \"smoke01\",\n  \"event\": \"smokeAlarm\",\n  \"smoke\": true,\n  \"time\": \"10:52:12\"\n}", suggestion: "请立即核实温室现场情况，排除火灾隐患。" },
  ]);

  const [thingModelEventConfigs, setThingModelEventConfigs] = useState([
    { id: "c-1", product: "智慧温室传感器产品", deviceType: "传感器", name: "温度过高事件", identifier: "temperatureHigh", level: "重要", condition: "temperature > 30 ℃", description: "温度超过阈值时自动生成事件记录。", syncStatus: "开启", enableStatus: "已启用" },
    { id: "c-2", product: "智慧温室传感器产品", deviceType: "传感器", name: "湿度过低事件", identifier: "humidityLow", level: "一般", condition: "humidity < 40 %", description: "湿度低于阈值时记录事件。", syncStatus: "开启", enableStatus: "已启用" },
    { id: "c-3", product: "智慧温室传感器产品", deviceType: "传感器", name: "CO₂ 超限事件", identifier: "co2Limit", level: "重要", condition: "co2 > 800 ppm", description: "CO₂ 浓度超过设定的上限值。", syncStatus: "开启", enableStatus: "已启用" },
    { id: "c-4", product: "智慧网关产品", deviceType: "网关", name: "网关离线事件", identifier: "gatewayOffline", level: "紧急", condition: "gateway.status == offline", description: "网关设备掉线时触发。", syncStatus: "开启", enableStatus: "已启用" },
    { id: "c-5", product: "智慧风机控制产品", deviceType: "执行器", name: "风机状态变更", identifier: "fanStatusChanged", level: "一般", condition: "-", description: "记录设备状态变化。", syncStatus: "开启", enableStatus: "已启用" },
    { id: "c-6", product: "智慧风机控制产品", deviceType: "执行器", name: "服务调用失败", identifier: "serviceCallFailed", level: "重要", condition: "-", description: "服务端调用指令下发失败时记录。", syncStatus: "关闭", enableStatus: "未启用" },
  ]);

  const [eventProcessingRecords, setEventProcessingRecords] = useState([
    { id: "pr-1", time: "10:46:00", name: "温度过高事件", deviceName: "温湿度传感器", action: "标记处理中", result: "成功", detail: "已通知温室管理员", operator: "学生1" },
    { id: "pr-2", time: "10:48:20", name: "风机状态变更", deviceName: "风机", action: "标记已处理", result: "成功", detail: "风机状态已确认", operator: "学生1" },
    { id: "pr-3", time: "10:49:30", name: "网关离线事件", deviceName: "Modbus网关", action: "生成处理记录", result: "成功", detail: "等待设备恢复在线", operator: "学生1" },
  ]);

  const [eventSyncRecords, setEventSyncRecords] = useState([
    { id: "sr-1", time: "10:40:00", product: "智慧温室传感器产品", name: "温度过高事件", identifier: "temperatureHigh", action: "开启同步", result: "成功", operator: "学生1" },
    { id: "sr-2", time: "10:41:00", product: "智慧温室传感器产品", name: "CO₂ 超限事件", identifier: "co2Limit", action: "开启同步", result: "成功", operator: "学生1" },
    { id: "sr-3", time: "10:42:30", product: "智慧网关产品", name: "网关离线事件", identifier: "gatewayOffline", action: "开启同步", result: "成功", operator: "学生1" },
    { id: "sr-4", time: "10:44:00", product: "智慧风机控制产品", name: "服务调用失败", identifier: "serviceCallFailed", action: "关闭同步", result: "成功", operator: "学生1" },
  ]);

  const [eventFilters, setEventFilters] = useState({
    device: "全部设备", type: "全部类型", level: "全部等级", processStatus: "全部状态", syncStatus: "全部", keyword: ""
  });

  const [selectedDeviceEvent, setSelectedDeviceEvent] = useState(deviceEvents[0]);
  const [editingThingModelEvent, setEditingThingModelEvent] = useState<any>(null);

  const filteredDeviceEvents = deviceEvents.filter(e => {
    if (eventFilters.device !== "全部设备" && e.deviceName !== eventFilters.device) return false;
    if (eventFilters.type !== "全部类型" && e.type !== eventFilters.type) return false;
    if (eventFilters.level !== "全部等级" && e.level !== eventFilters.level) return false;
    if (eventFilters.processStatus !== "全部状态" && e.processStatus !== eventFilters.processStatus) return false;
    if (eventFilters.syncStatus !== "全部" && eventFilters.syncStatus === "已同步" && e.syncStatus !== "已同步") return false;
    if (eventFilters.syncStatus !== "全部" && eventFilters.syncStatus === "未同步" && e.syncStatus !== "未同步") return false;
    if (eventFilters.keyword && !(e.deviceName.includes(eventFilters.keyword) || e.name.includes(eventFilters.keyword) || e.content.includes(eventFilters.keyword))) return false;
    return true;
  });

  const eventCenterStats = {
    total: deviceEvents.length,
    today: deviceEvents.filter(e => e.time.startsWith("10:")).length,
    pending: deviceEvents.filter(e => e.processStatus === "待处理").length,
    processed: deviceEvents.filter(e => e.processStatus === "已处理" || e.processStatus === "已忽略").length,
    synced: deviceEvents.filter(e => e.syncStatus === "已同步").length,
    urgent: deviceEvents.filter(e => e.level === "紧急").length,
  };

  const handleTriggerEvent = (type: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    let newEvent: any = null;
    let logMsg = "";
    
    if (type === "temperatureHigh") {
      newEvent = { id: `e-new-${Date.now()}`, time: timeStr, name: "温度过高事件", source: "物模型事件", deviceName: "温湿度传感器", deviceCode: "temp01", product: "智慧温室传感器产品", type: "温度异常", level: "重要", syncStatus: "已同步", processStatus: "待处理", condition: "temperature > 30 ℃", content: "温湿度传感器上报温度 33.1 ℃，超过设定阈值 30 ℃。", rawData: "{\n  \"deviceId\": \"temp01\",\n  \"event\": \"temperatureHigh\",\n  \"temperature\": 33.1,\n  \"threshold\": 30,\n  \"time\": \"" + timeStr + "\"\n}", suggestion: "请检查温室通风设备状态，必要时开启风机。" };
      logMsg = "触发温度过高事件";
    } else if (type === "gatewayOffline") {
      newEvent = { id: `e-new-${Date.now()}`, time: timeStr, name: "网关离线事件", source: "物模型事件", deviceName: "Modbus网关", deviceCode: "gw01", product: "智慧网关产品", type: "设备离线", level: "紧急", syncStatus: "已同步", processStatus: "待处理", condition: "gateway.status == offline", content: "设备在线状态变更为离线。", rawData: "{\n  \"deviceId\": \"gw01\",\n  \"event\": \"gatewayOffline\",\n  \"status\": \"offline\",\n  \"time\": \"" + timeStr + "\"\n}", suggestion: "请检查网关网络连接和供电情况。" };
      logMsg = "触发网关离线事件";
    } else if (type === "co2Limit") {
      newEvent = { id: `e-new-${Date.now()}`, time: timeStr, name: "CO₂ 超限事件", source: "物模型事件", deviceName: "二氧化碳传感器", deviceCode: "co201", product: "智慧温室传感器产品", type: "CO₂ 超限", level: "重要", syncStatus: "已同步", processStatus: "待处理", condition: "co2 > 800", content: "二氧化碳传感器上报 CO₂ 浓度 820 ppm，超过设定阈值 800 ppm。", rawData: "{\n  \"deviceId\": \"co201\",\n  \"event\": \"co2Limit\",\n  \"co2\": 820,\n  \"threshold\": 800,\n  \"time\": \"" + timeStr + "\"\n}", suggestion: "请检查温室换气系统，开启风机进行通风。" };
      logMsg = "触发 CO₂ 超限事件";
    } else if (type === "smokeAlarm") {
      newEvent = { id: `e-new-${Date.now()}`, time: timeStr, name: "烟雾告警事件", source: "物模型事件", deviceName: "烟雾传感器", deviceCode: "smoke01", product: "智慧温室传感器产品", type: "告警事件", level: "紧急", syncStatus: "已同步", processStatus: "待处理", condition: "smoke == true", content: "烟雾传感器触发告警状态。", rawData: "{\n  \"deviceId\": \"smoke01\",\n  \"event\": \"smokeAlarm\",\n  \"smoke\": true,\n  \"time\": \"" + timeStr + "\"\n}", suggestion: "请立即核实温室现场情况，排除火灾隐患。" };
      logMsg = "触发烟雾告警事件";
    }
    
    if (newEvent) {
      setDeviceEvents([newEvent, ...deviceEvents]);
      setSelectedDeviceEvent(newEvent);
      
      setEventSyncRecords([{ id: `sr-new-${Date.now()}`, time: timeStr, product: newEvent.product, name: newEvent.name, identifier: type, action: "自动触发同步", result: "成功", operator: "系统" }, ...eventSyncRecords]);
      
      const newLog = { id: `tl-new-${Date.now()}`, time: timeStr, name: newEvent.name, opType: "模拟触发", target: newEvent.deviceName, result: "成功", detail: logMsg, operator: "系统测试" };
      setTaskLogs([newLog, ...taskLogs]);
    }
  };

  const handleProcessEvent = (action: string) => {
    if (!selectedDeviceEvent) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    let newProcessStatus = selectedDeviceEvent.processStatus;
    if (action === "标记处理中") newProcessStatus = "处理中";
    else if (action === "标记已处理") newProcessStatus = "已处理";
    else if (action === "忽略事件") newProcessStatus = "已忽略";
    
    if (newProcessStatus !== selectedDeviceEvent.processStatus) {
      const newEvents = deviceEvents.map(e => e.id === selectedDeviceEvent.id ? { ...e, processStatus: newProcessStatus } : e);
      setDeviceEvents(newEvents);
      setSelectedDeviceEvent({ ...selectedDeviceEvent, processStatus: newProcessStatus });
      
      let detail = "";
      if (action === "标记处理中") detail = "已标记为处理中";
      else if (action === "标记已处理") detail = "已处理完成";
      else if (action === "忽略事件") detail = "事件已忽略";
      else detail = "生成记录";

      setEventProcessingRecords([{ id: `pr-new-${Date.now()}`, time: timeStr, name: selectedDeviceEvent.name, deviceName: selectedDeviceEvent.deviceName, action: action, result: "成功", detail: detail, operator: "学生1" }, ...eventProcessingRecords]);
      
      const newLog = { id: `tl-new-${Date.now()}`, time: timeStr, name: selectedDeviceEvent.name, opType: "事件处理", target: selectedDeviceEvent.deviceName, result: "成功", detail: `事件状态更新为${newProcessStatus}`, operator: "学生1" };
      setTaskLogs([newLog, ...taskLogs]);
    }
  };

  const [threeDApps, setThreeDApps] = useState([
    { id: "3d-1", name: "智慧温室 3D 监控应用", type: "三维场景", scene: "智慧温室", devices: 6, components: 18, status: "已发布", lastUpdated: "2026-06-08 10:20" },
    { id: "3d-2", name: "智慧矿山 3D 运维应用", type: "三维场景", scene: "智慧矿山", devices: 8, components: 25, status: "草稿", lastUpdated: "2026-06-07 16:30" },
    { id: "3d-3", name: "智慧家居 3D 展示应用", type: "三维场景", scene: "智慧家居", devices: 5, components: 14, status: "已发布", lastUpdated: "2026-06-06 09:10" },
    { id: "3d-4", name: "智慧牧场 3D 看板应用", type: "三维场景", scene: "智慧牧场", devices: 7, components: 20, status: "未发布", lastUpdated: "2026-06-05 14:00" },
  ]);

  const [selectedThreeDApp, setSelectedThreeDApp] = useState(threeDApps[0]);
  const [importExportRecords, setImportExportRecords] = useState([
    { id: "ie-1", time: "10:50:20", type: "导出应用", appName: "智慧温室 3D 监控应用", file: "greenhouse_3d_app_v1.0.0.zip", format: "3D 应用包", result: "成功", operator: "学生1" },
    { id: "ie-2", time: "10:42:10", type: "导入应用", appName: "智慧矿山 3D 运维应用", file: "mine_3d_app.zip", format: "ZIP 资源包", result: "成功", operator: "学生1" },
    { id: "ie-3", time: "10:35:30", type: "解析应用包", appName: "智慧温室 3D 监控应用 - 导入版", file: "greenhouse_3d_app.zip", format: "3D 应用包", result: "成功", operator: "学生1" },
    { id: "ie-4", time: "10:30:00", type: "导出应用", appName: "智慧家居 3D 展示应用", file: "home_3d_app.json", format: "JSON 配置包", result: "成功", operator: "学生1" },
  ]);

  const [importConfig, setImportConfig] = useState({
    appName: "智慧温室 3D 监控应用 - 导入版",
    target: "新建应用",
    conflict: "自动重命名",
    models: true,
    devices: true,
    dataSources: true,
    scripts: true,
    parsed: false
  });

  const [exportConfig, setExportConfig] = useState({
    scene: true,
    models: true,
    components: true,
    devices: true,
    dataSources: true,
    scripts: true,
    meta: true,
    format: "3D 应用包"
  });

  const [exportResult, setExportResult] = useState<any>(null);
  const [importValidationResults, setImportValidationResults] = useState<any>(null);

  const threeDAppStats = {
    total: threeDApps.length,
    published: threeDApps.filter(a => a.status === "已发布").length,
    drafts: threeDApps.filter(a => a.status === "草稿" || a.status === "未发布").length,
    recentImports: importExportRecords.filter(r => r.type === "导入应用").length,
    recentExports: importExportRecords.filter(r => r.type === "导出应用").length,
  };

  const [sceneLinkageRules, setSceneLinkageRules] = useState([
    {
      id: "rule-1",
      name: "温室高温自动通风",
      scene: "智慧温室",
      conditionRelation: "满足全部条件执行", // 满足部分条件执行 | 满足全部条件执行
      triggerType: "设备数据触发", // 设备数据触发, 定时触发, 设备状态触发, 设备事件触发
      status: "已启用",
      action: "开启风机",
      todayCount: 5,
      lastTime: "10:42:20"
    },
    {
      id: "rule-2",
      name: "每日定时补光",
      scene: "智慧温室",
      conditionRelation: "满足部分条件执行",
      triggerType: "定时触发",
      status: "已启用",
      action: "开启补光灯",
      todayCount: 2,
      lastTime: "08:00:00"
    },
    {
      id: "rule-3",
      name: "网关离线告警",
      scene: "设备运维",
      conditionRelation: "满足全部条件执行",
      triggerType: "设备状态触发",
      status: "已启用",
      action: "生成告警记录",
      todayCount: 1,
      lastTime: "09:15:30"
    },
    {
      id: "rule-4",
      name: "门禁异常事件联动",
      scene: "智慧园区",
      conditionRelation: "满足部分条件执行",
      triggerType: "设备事件触发",
      status: "未启用",
      action: "推送事件通知",
      todayCount: 0,
      lastTime: "暂无"
    }
  ]);
  const [selectedSceneLinkageRule, setSelectedSceneLinkageRule] = useState<any>(sceneLinkageRules[0]);
  const [linkageTriggerRecords, setLinkageTriggerRecords] = useState([
    { id: "rd-1", time: "10:42:20", ruleName: "温室高温自动通风", type: "设备数据触发", relation: "满足全部条件执行", condition: "temperature > 30℃，light < 300Lux", action: "开启风机", result: "成功" },
    { id: "rd-2", time: "08:00:00", ruleName: "每日定时补光", type: "定时触发", relation: "满足部分条件执行", condition: "每天 08:00", action: "开启补光灯", result: "成功" },
    { id: "rd-3", time: "09:15:30", ruleName: "网关离线告警", type: "设备状态触发", relation: "满足全部条件执行", condition: "gw01 离线 30 秒", action: "生成告警", result: "成功" },
    { id: "rd-4", time: "11:05:12", ruleName: "门禁异常事件联动", type: "设备事件触发", relation: "满足部分条件执行", condition: "异常开门事件", action: "推送通知", result: "待处理" }
  ]);

  // Synchronize state with global shared state regularly to support real-time simulation updates
  useEffect(() => {
    // Initial fetch
    const syncWithGlobal = () => {
      const globalState = getSharedCloudState();
      setSharedState({ ...globalState });

      // If simulated data is receiving locally, update values
      if (globalState.isReporting) {
        // Automatically fetch live reported records to lists as well
        setSharedState(prev => {
          const freshGlobal = getSharedCloudState();
          return { ...freshGlobal };
        });
      }
    };

    syncWithGlobal();
    const interval = setInterval(syncWithGlobal, 1000);
    return () => clearInterval(interval);
  }, []);

  // Data simulation loop logic hook
  useEffect(() => {
    let timer: any = null;
    if (simTaskActive) {
      if (executionMode === "循环执行") {
         const intervalMs = (parseInt(loopExecutionConfig.interval) || 2) * 1000;
         let currentCount = 0;
         const maxCount = parseInt(loopExecutionConfig.count) || 10;
         const isContinuous = loopExecutionConfig.continuous === "是";

         timer = setInterval(() => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            
            // Just generate some generic data for preview
            const newData = selectedSimulationDevices.flatMap((devCode, idx) => {
               const devName = simulationDevices.find(d => d.code === devCode)?.name || devCode;
               const props = (deviceThingModels as any)[devCode]?.filter((p: any) => p.enabled) || [];
               return props.map((prop: any) => {
                  let val = prop.val;
                  if (valueMode === "随机值") {
                     const rConfig = (randomValueConfig as any)[prop.id] || { min: 0, max: 100, dec: 0 };
                     const min = parseFloat(rConfig.min);
                     const max = parseFloat(rConfig.max);
                     const ran = min + Math.random() * (max - min);
                     val = ran.toFixed(parseInt(rConfig.dec) || 0);
                  } else if (valueMode === "固定值") {
                     val = (fixedValueConfig as any)[prop.id] || val;
                  } else if (valueMode === "循环值") {
                     const cConfig = (cycleValueConfig as any)[prop.id];
                     if (cConfig && cConfig.vals) {
                        const vals = cConfig.vals.split(',').map((v: string) => v.trim());
                        if (vals.length > 0) {
                           val = vals[currentCount % vals.length];
                        }
                     }
                  }
                  return {
                     id: Date.now() + Math.random(),
                     time: timeStr,
                     devName,
                     devCode,
                     prop: prop.id,
                     val,
                     unit: prop.unit,
                     vMode: valueMode,
                     eMode: executionMode,
                     status: "已产生"
                  };
               });
            });

            setSimulationPreviewData(prev => [...newData, ...prev].slice(0, 50));
            setSimulationExecutionRecords(prev => [{ id: `rec-${Date.now()}`, time: timeStr, name: "循环产生仿真数据", devCount: selectedSimulationDevices.length, propCount: newData.length, vMode: valueMode, eMode: "循环执行", result: "成功", operator: "系统任务" }, ...prev].slice(0, 20));
            
            currentCount++;
            if (!isContinuous && currentCount >= maxCount) {
               setSimTaskActive(false);
               showToast(`循环执行任务完成（${maxCount}次）`);
               clearInterval(timer);
            }
         }, intervalMs);
      }
    }
    return () => clearInterval(timer);
  }, [simTaskActive, executionMode, loopExecutionConfig, selectedSimulationDevices, simulationDevices, deviceThingModels, valueMode, randomValueConfig, fixedValueConfig]);


  // Devices mapping list based on SYNC status
  const getDeviceList = () => {
    if (!sharedState.isSynced) {
      return [];
    }
    return [
      {
        id: "temp01",
        name: "温湿度传感器",
        code: "temp01",
        product: "智慧温室传感器产品",
        type: "传感器",
        protocol: "MQTT",
        status: sharedState.isReporting ? "在线" : "离线",
        data: `温度 ${sharedState.latestValues.temp}℃，湿度 ${sharedState.latestValues.hum}%`,
        time: sharedState.lastReportTime,
        values: [
          { name: "温度", key: "temp", val: sharedState.latestValues.temp, unit: "℃" },
          { name: "湿度", key: "hum", val: sharedState.latestValues.hum, unit: "%" }
        ],
        records: [
          { time: sharedState.lastReportTime, key: "temperature", val: sharedState.latestValues.temp, unit: "℃", status: "已上报" },
          { time: sharedState.lastReportTime, key: "humidity", val: sharedState.latestValues.hum, unit: "%", status: "已上报" }
        ]
      },
      {
        id: "light01",
        name: "光照传感器",
        code: "light01",
        product: "智慧温室传感器产品",
        type: "传感器",
        protocol: "MQTT",
        status: sharedState.isReporting ? "在线" : "离线",
        data: `光照 ${sharedState.latestValues.light} Lux`,
        time: sharedState.lastReportTime,
        values: [
          { name: "光照", key: "light", val: sharedState.latestValues.light, unit: "Lux" }
        ],
        records: [
          { time: sharedState.lastReportTime, key: "light", val: sharedState.latestValues.light, unit: "Lux", status: "已上报" }
        ]
      },
      {
        id: "co201",
        name: "二氧化碳传感器",
        code: "co201",
        product: "智慧温室传感器产品",
        type: "传感器",
        protocol: "MQTT",
        status: sharedState.isReporting ? "在线" : "离线",
        data: `CO₂ ${sharedState.latestValues.co2} ppm`,
        time: sharedState.lastReportTime,
        values: [
          { name: "二氧化碳浓度", key: "co2", val: sharedState.latestValues.co2, unit: "ppm" }
        ],
        records: [
          { time: sharedState.lastReportTime, key: "co2", val: sharedState.latestValues.co2, unit: "ppm", status: "已上报" }
        ]
      },
      {
        id: "gw01",
        name: "Modbus网关",
        code: "gw01",
        product: "智慧网关产品",
        type: "网关",
        protocol: "MQTT",
        status: "在线",
        data: "网关在线",
        time: sharedState.lastReportTime,
        values: [
          { name: "核心状态", key: "status", val: "在线", unit: "" }
        ],
        records: [
          { time: sharedState.lastReportTime, key: "status", val: "online", unit: "", status: "已上报" }
        ]
      },
      {
        id: "relay01",
        name: "继电器",
        code: "relay01",
        product: "智慧风机控制产品",
        type: "继电器",
        protocol: "Modbus",
        status: sharedState.isReporting ? "在线" : "离线",
        data: sharedState.latestValues.relayStatus === "开启" ? "打开" : "关闭",
        time: sharedState.lastReportTime,
        values: [
          { name: "线圈状态", key: "relay", val: sharedState.latestValues.relayStatus === "开启" ? "吸合" : "释放", unit: "" }
        ],
        records: [
          { time: sharedState.lastReportTime, key: "relay", val: sharedState.latestValues.relayStatus === "开启" ? "1" : "0", unit: "", status: "已上报" }
        ]
      },
      {
        id: "fan01",
        name: "风机",
        code: "fan01",
        product: "智慧风机控制产品",
        type: "负载",
        protocol: "I/O",
        status: sharedState.isReporting ? "在线" : "离线",
        data: sharedState.latestValues.fanStatus === "运行中" ? "运行" : "停止",
        time: sharedState.lastReportTime,
        values: [
          { name: "风机状态", key: "fan", val: sharedState.latestValues.fanStatus === "运行中" ? "运行中" : "停止", unit: "" }
        ],
        records: [
          { time: sharedState.lastReportTime, key: "fan", val: sharedState.latestValues.fanStatus === "运行中" ? "running" : "stopped", unit: "", status: "已上报" }
        ]
      }
    ];
  };

  const devices = getDeviceList();

  return (
    <div className="flex h-full w-full bg-[#FAFBFB] text-zinc-800 font-sans select-none overflow-hidden" id="industry-cloud-console-root">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className="w-[220px] bg-white border-r border-zinc-200 flex flex-col h-full shrink-0">
        
        {/* LOGO AREA */}
        <div className="h-[52px] border-b border-zinc-200 px-5 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#10A66A] flex items-center justify-center text-white font-extrabold text-xs">
            云
          </div>
          <span className="font-bold text-zinc-800 text-[13px] tracking-wide">行业云平台控制台</span>
        </div>

        {/* SIDEBAR MENUS */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-none text-[12px]">
          
          <button 
            onClick={() => setActiveMenu("overview")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold transition-all ${
              activeMenu === "overview" 
                ? "bg-[#EAF8F1] text-[#10A66A] border-r-4 border-[#10A66A]" 
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>平台总览</span>
          </button>

          {/* Group 1: Device Access */}
          <div className="pt-2">
            <span className="px-3 text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">设备接入</span>
            <button 
              onClick={() => setActiveMenu("product")}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMenu === "product" 
                  ? "bg-[#EAF8F1] text-[#10A66A] border-r-4 border-[#10A66A]" 
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>产品管理</span>
            </button>
            <button 
              onClick={() => setActiveMenu("device")}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMenu === "device" 
                  ? "bg-[#EAF8F1] text-[#10A66A] border-r-4 border-[#10A66A]" 
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <Server className="w-4 h-4" />
              <span>设备管理</span>
            </button>
            <button 
              onClick={() => setActiveMenu("asset")}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 font-medium transition-all ${
                activeMenu === "asset" ? "bg-[#EAF8F1] text-[#10A66A]" : ""
              }`}
            >
              <HardDrive className="w-4 h-4 text-zinc-400" />
              <span>资产管理</span>
            </button>
          </div>

          {/* Group 2: App Access */}
          <div className="pt-2">
            <span className="px-3 text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">应用接入</span>
            <button 
              onClick={() => setActiveMenu("project")}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 font-medium transition-all ${
                activeMenu === "project" ? "bg-[#EAF8F1] text-[#10A66A]" : ""
              }`}
            >
              <Layers className="w-4 h-4 text-zinc-400" />
              <span>项目管理</span>
            </button>
          </div>

          {/* Group 3: App Design */}
          <div className="pt-2">
            <span className="px-3 text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">应用设计</span>
            <button 
              onClick={() => {
                setActiveMenu("design-2d");
                if (onOpen2DDesigner) onOpen2DDesigner({ view: "appList" });
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 font-medium transition-all"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              <span>2D 应用设计</span>
            </button>
            <button 
              onClick={() => setActiveMenu("design-3d")}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 font-medium transition-all"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              <span>3D 应用设计</span>
            </button>
            <button 
              onClick={() => setActiveMenu("design-virtual")}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 font-medium transition-all"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              <span>虚拟仿真</span>
            </button>
          </div>

          {/* Group 4: Device Ops */}
          <div className="pt-2">
            <span className="px-3 text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">设备运维</span>
            <button 
              onClick={() => setActiveMenu("dev-debug")}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 font-medium transition-all ${
                activeMenu === "dev-debug" ? "bg-[#EAF8F1] text-[#10A66A]" : ""
              }`}
            >
              <Sliders className="w-4 h-4 text-zinc-400" />
              <span>设备调试</span>
            </button>
            <button 
              onClick={() => setActiveMenu("simulation")}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeMenu === "simulation" 
                  ? "bg-[#EAF8F1] text-[#10A66A] border-r-4 border-[#10A66A]" 
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>数据仿真</span>
            </button>
            <button 
              onClick={() => setActiveMenu("api-debug")}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 font-medium transition-all ${
                activeMenu === "api-debug" ? "bg-[#EAF8F1] text-[#10A66A]" : ""
              }`}
            >
              <Network className="w-4 h-4 text-zinc-400" />
              <span>接口调试</span>
            </button>
          </div>

          {/* Group 5: Device Tasks */}
          <div className="pt-2">
            <span className="px-3 text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">设备任务</span>
            <button 
              onClick={() => setActiveMenu("task-mgr")}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 font-medium transition-all"
            >
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>任务管理</span>
            </button>
            <button 
              onClick={() => setActiveMenu("task-log")}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 font-medium transition-all"
            >
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>任务日志</span>
            </button>
          </div>

          {/* Group 6: Event Center */}
          <div className="pt-2">
            <span className="px-3 text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">事件中心</span>
            <button 
              onClick={() => setActiveMenu("event-mgr")}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 font-medium transition-all"
            >
              <Bell className="w-4 h-4 text-zinc-400" />
              <span>事件管理</span>
            </button>
            <button 
              onClick={() => setActiveMenu("trigger-mgr")}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 font-medium transition-all"
            >
              <Settings className="w-4 h-4 text-zinc-400" />
              <span>触发器管理</span>
            </button>
            <button 
              onClick={() => setActiveMenu("scene-linkage")}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMenu === "scene-linkage" ? "bg-[#EAF8F1] text-[#10A66A]" : "text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <Zap className="w-4 h-4 text-zinc-400" />
              <span>场景联动</span>
            </button>
          </div>

        </div>

        {/* BOTTOM EXIT */}
        <div className="p-3 border-t border-zinc-200">
          <button 
            onClick={onClose}
            className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-650 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border border-zinc-200"
          >
            返回课程实训 ➔
          </button>
        </div>
      </div>

      {/* MAIN WRAPPER CONTAINER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP COMPACT NAV BAR */}
        <div className="h-[52px] bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
            <span>首页</span>
            <ChevronRight className="w-3 h-3 text-zinc-405" />
            <span className="text-[#10A66A]">
              {activeMenu === "overview" && "平台总览"}
              {activeMenu === "product" && "产品管理"}
              {activeMenu === "device" && "设备管理"}
              {activeMenu === "asset" && "资产管理"}
              {activeMenu === "project" && "项目管理"}
              {activeMenu === "simulation" && "数据仿真"}
              {activeMenu === "dev-debug" && "设备调试"}
              {activeMenu === "api-debug" && "接口调试"}
              {activeMenu === "scene-linkage" && "场景联动"}
              {activeMenu === "event-mgr" && "事件中心"}
              {!["overview", "product", "device", "asset", "project", "simulation", "dev-debug", "api-debug", "scene-linkage", "event-mgr"].includes(activeMenu) && "业务视图"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-zinc-600">
            {/* Status alerts */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">平台通信:</span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                sharedState.isReporting 
                  ? "bg-emerald-50 text-[#10A66A] border border-emerald-150 animate-pulse" 
                  : sharedState.isConnected
                    ? "bg-emerald-50 text-[#10A66A] border border-emerald-150"
                    : "bg-zinc-50 text-zinc-400 border border-zinc-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sharedState.isConnected ? "bg-[#10A66A]" : "bg-zinc-405"}`} />
                {sharedState.isReporting ? "上报中" : sharedState.isConnected ? "已连接" : "未连接"}
              </span>
            </div>

            <div className="h-4 w-px bg-zinc-200" />

            <div className="flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#10A66A] flex items-center justify-center font-bold text-[10px]">1</span>
              <span>学生1</span>
            </div>
          </div>
        </div>

        {/* WORKSPACE VIEW CONTENT SCROLLER */}
        <div className="flex-grow overflow-y-auto p-6 scrollbar-thin">
          
          {/* ===================================== */}
          {/* A. 平台总览 (OVERVIEW) */}
          {/* ===================================== */}
          {activeMenu === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* STATISTICS CARDS */}
              <div className="grid grid-cols-7 gap-4">
                
                <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between h-[96px] bg-gradient-to-br from-white to-[#FAFDFB]">
                  <span className="text-[11px] text-zinc-400 font-bold block">产品总数</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-[#10A66A]">16</span>
                    <span className="w-6 h-6 rounded bg-[#EAF8F1] text-[#10A66A] flex items-center justify-center"><Database className="w-3.5 h-3.5" /></span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between h-[96px] bg-gradient-to-br from-white to-[#FAFDFB]">
                  <span className="text-[11px] text-zinc-400 font-bold block">设备总数</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-[#10A66A]">{sharedState.isSynced ? 16 : 10}</span>
                    <span className="w-6 h-6 rounded bg-[#EAF8F1] text-[#10A66A] flex items-center justify-center"><Server className="w-3.5 h-3.5" /></span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between h-[96px] bg-gradient-to-br from-white to-[#FAFDFB]">
                  <span className="text-[11px] text-zinc-400 font-bold block">项目总数</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-[#10A66A]">1</span>
                    <span className="w-6 h-6 rounded bg-[#EAF8F1] text-[#10A66A] flex items-center justify-center"><Layers className="w-3.5 h-3.5" /></span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between h-[96px] bg-gradient-to-br from-white to-[#FAFDFB]">
                  <span className="text-[11px] text-zinc-400 font-bold block">场景联动</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-[#10A66A]">2</span>
                    <span className="w-6 h-6 rounded bg-[#EAF8F1] text-[#10A66A] flex items-center justify-center"><Sliders className="w-3.5 h-3.5" /></span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between h-[96px] bg-gradient-to-br from-white to-[#FAFDFB]">
                  <span className="text-[11px] text-zinc-400 font-bold block">2D 应用设计</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-[#10A66A]">2</span>
                    <span className="w-6 h-6 rounded bg-[#EAF8F1] text-[#10A66A] flex items-center justify-center"><span className="text-[10px] font-bold">2D</span></span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between h-[96px] bg-gradient-to-br from-white to-[#FAFDFB]">
                  <span className="text-[11px] text-zinc-400 font-bold block">3D 应用设计</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-[#10A66A]">1</span>
                    <span className="w-6 h-6 rounded bg-[#EAF8F1] text-[#10A66A] flex items-center justify-center"><span className="text-[10px] font-bold">3D</span></span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between h-[96px] bg-gradient-to-br from-white to-[#FAFDFB]">
                  <span className="text-[11px] text-zinc-400 font-bold block">虚拟仿真</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-[#10A66A]">1</span>
                    <span className="w-6 h-6 rounded bg-[#EAF8F1] text-[#10A66A] flex items-center justify-center"><Cpu className="w-3.5 h-3.5" /></span>
                  </div>
                </div>

              </div>

              {/* TWO COLUMNS BODY */}
              <div className="grid grid-cols-3 gap-6">
                
                {/* LEFT: DEV WIZARD FLOW */}
                <div className="col-span-2 space-y-6">
                  
                  <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs space-y-4">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-100">
                      <Sliders className="w-4.5 h-4.5 text-[#10A66A]" />
                      <h3 className="text-sm font-bold text-zinc-800">开发向导</h3>
                    </div>

                    {/* HORIZONTAL FLOWCHART */}
                    <div className="flex items-center justify-between gap-1 overflow-x-auto py-3 scrollbar-thin">
                      
                      {/* Step 1 */}
                      <div className={`p-3 rounded-lg border flex-1 text-center font-sans ${
                        !sharedState.isSynced 
                          ? "bg-emerald-50 border-[#10A66A]/30 text-[#10A66A]" 
                          : "bg-zinc-50 border-zinc-150 text-zinc-500"
                      }`}>
                        <div className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Step 01</div>
                        <div className="text-[12px] font-black mt-1">创建设备产品</div>
                      </div>

                      <div className="text-[#10A66A] shrink-0 font-extrabold px-1 text-[13px]">➔</div>

                      {/* Step 2 */}
                      <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-lg flex-1 text-center">
                        <div className="text-[11px] font-bold text-zinc-450">Step 02</div>
                        <div className="text-[12px] font-black mt-1 text-zinc-600">选择联网方式</div>
                        <div className="flex items-center gap-1 justify-center mt-1 text-[9.5px] scale-90 text-zinc-400 font-bold whitespace-nowrap">
                          <span className="bg-zinc-100 px-1 py-0.5 rounded border border-zinc-200">直连</span>
                          <span className="bg-zinc-100 px-1 py-0.5 rounded border border-zinc-200">网关子设备</span>
                        </div>
                      </div>

                      <div className="text-[#10A66A] shrink-0 font-extrabold px-1 text-[13px]">➔</div>

                      {/* Step 3 */}
                      <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-lg flex-1 text-center">
                        <div className="text-[11px] font-bold text-zinc-450">Step 03</div>
                        <div className="text-[12px] font-black mt-1 text-zinc-600">定义物模型</div>
                      </div>

                      <div className="text-[#10A66A] shrink-0 font-extrabold px-1 text-[13px]">➔</div>

                      {/* Step 4 */}
                      <div className={`p-3 rounded-lg border flex-1 text-center ${
                        sharedState.isSynced && !sharedState.isReporting 
                          ? "bg-emerald-50 border-[#10A66A]/30 text-[#10A66A]" 
                          : "bg-zinc-50 border-zinc-150 text-zinc-500"
                      }`}>
                        <div className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Step 04</div>
                        <div className="text-[12px] font-black mt-1">对接 SDK</div>
                      </div>

                      <div className="text-[#10A66A] shrink-0 font-extrabold px-1 text-[13px]">➔</div>

                      {/* Step 5 */}
                      <div className={`p-3 rounded-lg border flex-1 text-center ${
                        sharedState.isSynced && !sharedState.isReporting 
                          ? "bg-emerald-50 border-[#10A66A]/30 text-[#10A66A]" 
                          : "bg-zinc-50 border-zinc-150 text-zinc-500"
                      }`}>
                        <div className="text-[11px] font-bold text-zinc-455">Step 05</div>
                        <div className="text-[12px] font-black mt-1">设备管理</div>
                      </div>

                      <div className="text-[#10A66A] shrink-0 font-extrabold px-1 text-[13px]">➔</div>

                      {/* Step 6 */}
                      <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-lg flex-1 text-center">
                        <div className="text-[11px] font-bold text-zinc-455">Step 06</div>
                        <div className="text-[12px] font-black mt-1 text-zinc-600">添加/调试设备</div>
                      </div>

                      <div className="text-[#10A66A] shrink-0 font-extrabold px-1 text-[13px]">➔</div>

                      {/* Step 7 */}
                      <div className={`p-3 rounded-lg border flex-1 text-center ${
                        sharedState.isReporting 
                          ? "bg-emerald-50 text-[#10A66A] border-[#10A66A] animate-pulse" 
                          : "bg-zinc-50 border-zinc-150 text-zinc-500"
                      }`}>
                        <div className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Step 07</div>
                        <div className="text-[12px] font-black mt-1">设备上线</div>
                      </div>

                    </div>
                  </div>

                  {/* QUICK ALERTS & MOCK LOGS IN OVERVIEW */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-4.5 h-4.5 text-[#10A66A]" />
                        <h3 className="text-sm font-bold text-zinc-800">最新消息与报警事件</h3>
                      </div>
                      <span className="text-[10px] text-zinc-400">实时过滤</span>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {sharedState.isReporting ? (
                        <>
                          <div className="flex items-start gap-2.5 p-2.5 bg-[#FAFDFB] border border-emerald-100 rounded-lg text-xs">
                            <span className="w-2 h-2 rounded-full bg-[#10A66A] shrink-0 mt-1.5" />
                            <div className="space-y-1">
                              <p className="font-bold text-zinc-700">物模型温室仿真数据自动格式化解析成功</p>
                              <p className="text-[11px] text-zinc-500 leading-relaxed">
                                主题: <code className="bg-zinc-100 px-1 rounded">/greenhouse/tempHum</code> 
                                当前值: 温度 {sharedState.latestValues.temp}℃, 湿度 {sharedState.latestValues.hum}% | 上报正常。
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2.5 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
                            <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0 mt-1.5" />
                            <div className="space-y-1">
                              <p className="font-bold text-zinc-650">继电器/排风机联动策略轮询已下发</p>
                              <p className="text-[11px] text-zinc-500">
                                策略驱动状态：温度安全区间，排风负载当前处于 [{sharedState.latestValues.fanStatus}] 状态运行。
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="py-8 text-center text-zinc-400 text-xs">
                          <AlertCircle className="w-8 h-8 text-zinc-300 mx-auto mb-1.5" />
                          <span>在线通信隧道未启动。请前往“工程虚拟仿真”开启数据上报以同步最新数据事件。</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* RIGHT STATS COLUMN */}
                <div className="space-y-6">
                  
                  {/* 今日数据统计 */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3.5">
                    <h4 className="text-xs font-black text-zinc-700 border-b border-zinc-100 pb-1.5 flex items-center justify-between">
                      <span>今日数据统计</span>
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    </h4>
                    
                    <div className="space-y-2 text-xs">
                      
                      <div className="flex items-center justify-between p-2 bg-[#F8FAF9] rounded-lg border border-zinc-100">
                        <span className="text-zinc-500">新增设备</span>
                        <span className="font-black text-[#10A66A] text-sm">{sharedState.isSynced ? 6 : 0} <span className="text-[10px] text-zinc-400">台</span></span>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-[#F8FAF9] rounded-lg border border-zinc-100">
                        <span className="text-zinc-500">新增产品</span>
                        <span className="font-black text-[#10A66A] text-sm">0 <span className="text-[10px] text-zinc-400">个</span></span>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-[#F8FAF9] rounded-lg border border-zinc-100">
                        <span className="text-zinc-500">任务执行次数</span>
                        <span className="font-black text-[#10A66A] text-sm">{sharedState.isReporting ? sharedState.todayReportCount : 0} <span className="text-[10px] text-zinc-400">次</span></span>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-[#F8FAF9] rounded-lg border border-zinc-100">
                        <span className="text-zinc-500">触发场景联动</span>
                        <span className="font-black text-[#10A66A] text-sm">{sharedState.isReporting ? 2 : 0} <span className="text-[10px] text-zinc-400">次</span></span>
                      </div>

                    </div>
                  </div>

                  {/* 常用入口 */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3">
                    <h4 className="text-xs font-black text-zinc-700 border-b border-zinc-100 pb-1.5">常用入口</h4>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-zinc-650">
                      
                      <button 
                        onClick={() => setActiveMenu("project")}
                        className="p-2.5 rounded-lg border border-zinc-150 hover:bg-[#EAF8F1] hover:text-[#10A66A] text-center bg-zinc-50 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                      >
                        <Layers className="w-4 h-4 text-zinc-400" />
                        <span>项目管理</span>
                      </button>

                      <button 
                        onClick={() => {
                          setActiveMenu("design-2d");
                          if (onOpen2DDesigner) onOpen2DDesigner({ view: "appList" });
                        }}
                        className="p-2.5 rounded-lg border border-zinc-150 hover:bg-[#EAF8F1] hover:text-[#10A66A] text-center bg-zinc-50 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                      >
                        <span className="text-zinc-400 font-extrabold leading-none">2D</span>
                        <span>2D 应用设计</span>
                      </button>

                      <button 
                        onClick={() => setActiveMenu("design-3d")}
                        className="p-2.5 rounded-lg border border-zinc-150 hover:bg-[#EAF8F1] hover:text-[#10A66A] text-center bg-zinc-50 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                      >
                        <span className="text-zinc-400 font-extrabold leading-none">3D</span>
                        <span>3D 应用设计</span>
                      </button>

                      <button 
                        onClick={() => setActiveMenu("simulation")}
                        className="p-2.5 rounded-lg border border-zinc-150 hover:bg-[#EAF8F1] hover:text-[#10A66A] text-center bg-zinc-50 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                      >
                        <Cpu className="w-4 h-4 text-zinc-400" />
                        <span>虚拟仿真</span>
                      </button>

                    </div>
                  </div>

                  {/* 设备在线统计 */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3">
                    <h4 className="text-xs font-black text-zinc-700 border-b border-zinc-100 pb-1.5">设备在线统计</h4>
                    
                    <div className="space-y-4">
                      {/* Stacked indicator bar */}
                      <div className="h-4.5 rounded-full bg-zinc-100 overflow-hidden flex w-full border border-zinc-200">
                        {sharedState.isReporting ? (
                          <>
                            <div className="bg-[#10A66A] h-full" style={{ width: "37.5%" }} title="在线设备 6 台" />
                            <div className="bg-zinc-350 h-full" style={{ width: "62.5%" }} title="离线设备 10 台" />
                          </>
                        ) : (
                          <div className="bg-zinc-350 h-full w-full" title="离线设备 16 台" />
                        )}
                      </div>

                      <div className="grid grid-cols-2 text-[11px] gap-2">
                        <div className="p-2 bg-emerald-50 rounded-lg text-center border border-emerald-100">
                          <span className="text-zinc-450 font-medium block mb-0.5">在线设备数</span>
                          <span className="text-lg font-black text-[#10A66A]">{sharedState.isReporting ? 6 : 0}</span>
                        </div>
                        <div className="p-2 bg-zinc-50 rounded-lg text-center border border-zinc-150">
                          <span className="text-zinc-455 font-medium block mb-0.5">离线设备数</span>
                          <span className="text-lg font-black text-zinc-500">{sharedState.isReporting ? 10 : 16}</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ===================================== */}
          {/* B. 产品管理 (PRODUCT MANAGEMENT) */}
          {/* ===================================== */}
          {activeMenu === "product" && (
            <div className="space-y-5 animate-in fade-in duration-200" id="u-product-mgr-view">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <h2 className="text-[15px] font-black text-zinc-800">产品管理</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => showToast("新增产品向导正在生成...")}
                    className="px-3.5 py-1.5 bg-[#10A66A] hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    + 新增产品
                  </button>
                  <button 
                    onClick={() => showToast("请选择需要批量上传的产品JSON描述文件...")}
                    className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-xs text-zinc-650 font-bold rounded-lg transition-all cursor-pointer"
                  >
                    批量导入
                  </button>
                  <button 
                    onClick={() => showToast("产品索引重载完成")}
                    className="p-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg text-zinc-500 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SEARCH FILTER BOX */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 grid grid-cols-4 gap-4 text-xs font-semibold text-zinc-600">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">产品名称/Key</label>
                  <input type="text" placeholder="输入产品名称检索" className="w-full border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-[#10A66A] bg-[#FDFDFD]" />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">节点类型</label>
                  <select className="w-full border border-zinc-200 rounded-lg px-2 py-1.5 focus:outline-[#10A66A] bg-white">
                    <option>全部类型</option>
                    <option>传感器产品</option>
                    <option>执行器产品</option>
                    <option>网关产品</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">通信协议</label>
                  <select className="w-full border border-zinc-200 rounded-lg px-2 py-1.5 focus:outline-[#10A66A] bg-white">
                    <option>全部协议</option>
                    <option>MQTT</option>
                    <option>Modbus</option>
                    <option>CoAP</option>
                  </select>
                </div>
                <div className="flex items-end select-none">
                  <button className="w-full py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border border-zinc-200 rounded-lg font-bold cursor-pointer transition-all">
                    查询产品
                  </button>
                </div>
              </div>

              {/* TABLE PRODUCTS LIST */}
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs divide-y divide-zinc-100">
                  <thead className="bg-[#FAFDFB] text-zinc-405 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3">产品名称</th>
                      <th className="px-4 py-3">产品类型</th>
                      <th className="px-4 py-3">节点类型</th>
                      <th className="px-4 py-3">通信协议</th>
                      <th className="px-4 py-3">设备数量</th>
                      <th className="px-4 py-3">创建时间</th>
                      <th className="px-4 py-3">状态</th>
                      <th className="px-5 py-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-650">
                    
                    <tr className="hover:bg-zinc-50/50">
                      <td className="px-5 py-3.5 font-bold text-zinc-800">智慧温室传感器产品</td>
                      <td className="px-4 py-3.5">传感器产品</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 text-[10px] font-bold">直连设备</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[#10A66A]">MQTT</td>
                      <td className="px-4 py-3.5 font-black text-zinc-800">{sharedState.isSynced ? 3 : 0}</td>
                      <td className="px-4 py-3.5 text-zinc-450 font-mono">2026-06-04</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10.5px]">
                          <span className="w-1.5 h-1.5 bg-[#10A66A] rounded-full" />
                          已启用
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold">
                        <button onClick={() => { setActiveMenu("device"); showToast("已筛选智慧温室传感器产品下挂载的设备。"); }} className="text-[#10A66A] hover:text-emerald-700 cursor-pointer text-xs">
                          查看设备
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-zinc-50/50">
                      <td className="px-5 py-3.5 font-bold text-zinc-800">智慧风机控制产品</td>
                      <td className="px-4 py-3.5">执行器产品</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded border border-purple-100 text-[10px] font-bold">网关子设备</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-zinc-500">Modbus</td>
                      <td className="px-4 py-3.5 font-black text-zinc-800">{sharedState.isSynced ? 2 : 0}</td>
                      <td className="px-4 py-3.5 text-zinc-450 font-mono">2026-06-04</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10.5px]">
                          <span className="w-1.5 h-1.5 bg-[#10A66A] rounded-full" />
                          已启用
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold">
                        <button onClick={() => { setActiveMenu("device"); showToast("已匹配智慧风机控制产品设备列表。"); }} className="text-[#10A66A] hover:text-emerald-700 cursor-pointer text-xs">
                          查看设备
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-zinc-50/50">
                      <td className="px-5 py-3.5 font-bold text-zinc-800">智慧网关产品</td>
                      <td className="px-4 py-3.5">网关产品</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-[#EAF8F1] text-[#10A66A] px-2 py-0.5 rounded border border-emerald-100 text-[10px] font-bold">网关设备</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[#10A66A]">MQTT</td>
                      <td className="px-4 py-3.5 font-black text-zinc-800">{sharedState.isSynced ? 1 : 0}</td>
                      <td className="px-4 py-3.5 text-zinc-450 font-mono">2026-06-04</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10.5px]">
                          <span className="w-1.5 h-1.5 bg-[#10A66A] rounded-full" />
                          已启用
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold">
                        <button onClick={() => { setActiveMenu("device"); showToast("查看智慧网关产品。"); }} className="text-[#10A66A] hover:text-emerald-700 cursor-pointer text-xs">
                          查看设备
                        </button>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================== */}
          {/* C. 设备管理 (DEVICE MANAGEMENT) & DETAILED VIEW DRAWER */}
          {/* ===================================== */}
          {activeMenu === "device" && (
            <div className="space-y-5 animate-in fade-in duration-200" id="u-device-mgr-view">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <h2 className="text-[15px] font-black text-zinc-800">设备管理</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => showToast("请选择添加产品模型以进行设备绑定实例化...")}
                    className="px-3.5 py-1.5 bg-[#10A66A] hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    + 新增设备
                  </button>
                  <button 
                    onClick={() => {
                      if (!sharedState.isSynced) {
                        setSharedCloudState({ isSynced: true, isConnected: true });
                        showToast("已成功同步 6 台仿真设备底座！");
                      } else {
                        showToast("仿真物理拓扑对应的 6 台设备已经是同步状态。");
                      }
                    }}
                    className="px-3 py-1.5 bg-white border border-[#10A66A] hover:bg-emerald-50 text-xs text-[#10A66A] font-bold rounded-lg transition-all cursor-pointer"
                  >
                    同步仿真设备
                  </button>
                  <button 
                    onClick={() => showToast("全端设备心跳轮询状态核对完毕。")}
                    className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-xs text-zinc-650 font-bold rounded-lg transition-all cursor-pointer"
                  >
                    刷新状态
                  </button>
                </div>
              </div>

              {/* SEARCH CONFIG */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 grid grid-cols-4 gap-4 text-xs font-semibold text-zinc-600">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">设备名称 / Key</label>
                  <input type="text" placeholder="输入设备名称或设备UUID" className="w-full border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-[#10A66A] bg-[#FDFDFD]" />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">所属产品</label>
                  <select className="w-full border border-zinc-200 rounded-lg px-2 py-1.5 focus:outline-[#10A66A] bg-white">
                    <option>全部产品</option>
                    <option>智慧温室传感器产品</option>
                    <option>智慧网关产品</option>
                    <option>智慧风机控制产品</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">设备状态</label>
                  <select className="w-full border border-zinc-200 rounded-lg px-2 py-1.5 focus:outline-[#10A66A] bg-white">
                    <option>全部状态</option>
                    <option>在线</option>
                    <option>离线</option>
                  </select>
                </div>
                <div className="flex items-end select-none">
                  <button className="w-full py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border border-zinc-200 rounded-lg font-bold cursor-pointer transition-all">
                    数据检索
                  </button>
                </div>
              </div>

              {/* SPLIT VIEW (LEFT TABLE / RIGHT DRAWER DETAIL) */}
              <div className="grid grid-cols-10 gap-5 items-start">
                
                {/* DEVICE LIST CONTAINER */}
                <div className={`bg-white border border-zinc-200 rounded-xl overflow-hidden transition-all duration-300 shadow-2xs ${
                  selectedDeviceDetails ? "col-span-6" : "col-span-10"
                }`}>
                  
                  {devices.length === 0 ? (
                    <div className="p-12 text-center text-zinc-400 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-250 flex items-center justify-center text-zinc-400 mx-auto">
                        <Server className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-extrabold text-zinc-800 text-[13px]">暂无已同步的行业云本地设备</p>
                        <p className="text-[11px] text-zinc-550 max-w-md mx-auto leading-relaxed">
                          当前云平台尚未连接同步。请在“实验大厅”进入“工程虚拟仿真”实训，在右下角的“云平台对接”面板中点击【🌐 同步设备到云平台】后即可载入真实的 6 个智能节点拓扑！
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setSharedCloudState({ isSynced: true, isConnected: true });
                          showToast("已成功启动全局同步！6台物联网节点注册上线完毕。");
                        }} 
                        className="px-4 py-2 bg-[#10A66A] hover:bg-emerald-600 text-white font-extrabold text-[11px] rounded-lg cursor-pointer shadow-sm transition-all"
                      >
                        直接在本页紧急同步仿真设备
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs divide-y divide-zinc-100">
                      <thead className="bg-[#FAFDFB] text-zinc-405 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-4 py-3">设备名称</th>
                          <th className="px-3 py-3">设备编号</th>
                          <th className="px-3 py-3">所属产品</th>
                          <th className="px-3 py-3">通信协议</th>
                          <th className="px-3 py-3">在线状态</th>
                          <th className="px-3 py-3">最新数据</th>
                          <th className="px-3 py-3">上报时间</th>
                          <th className="px-4 py-3 text-right">数据操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-zinc-650">
                        {devices.map((device) => (
                          <tr key={device.id} className={`hover:bg-zinc-50/70 transition-all ${
                            selectedDeviceDetails?.id === device.id ? "bg-[#F3FAF6]" : ""
                          }`}>
                            <td className="px-4 py-3.5 font-bold text-zinc-800">{device.name}</td>
                            <td className="px-3 py-3.5 font-mono text-zinc-450">{device.code}</td>
                            <td className="px-3 py-3.5 text-zinc-500 text-[11px] font-medium">{device.product}</td>
                            <td className="px-3 py-3.5 font-mono text-[#10A66A]">{device.protocol}</td>
                            <td className="px-3 py-3.5">
                              <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                                device.status === "在线" 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-150" 
                                  : "bg-zinc-50 text-zinc-400 border-zinc-150"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${device.status === "在线" ? "bg-[#10A66A] animate-pulse" : "bg-zinc-400"}`} />
                                {device.status}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 font-mono font-bold text-zinc-700 bg-zinc-50/30 max-w-[140px] truncate" title={device.data}>
                              {device.data}
                            </td>
                            <td className="px-3 py-3.5 text-zinc-400 font-mono text-[10.5px]">{device.time || "-"}</td>
                            <td className="px-4 py-3.5 text-right font-bold">
                              <button 
                                onClick={() => setSelectedDeviceDetails(device)}
                                className="text-zinc-600 hover:text-[#10A66A] flex items-center gap-1 ml-auto text-[11px] bg-zinc-50 hover:bg-emerald-50 px-2 py-1 rounded border border-zinc-200 hover:border-emerald-150 transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>数据视图</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                </div>

                {/* RIGHT DETAILED DRAWER (IF ACTIVE SELECTED) */}
                {selectedDeviceDetails && (
                  <div className="col-span-4 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-5 animate-in slide-in-from-right-4 duration-300">
                    
                    {/* Header Controls */}
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-150">
                      <div className="space-y-0.5">
                        <h4 className="font-black text-zinc-800 text-xs">设备数据详情</h4>
                        <p className="text-[10px] text-zinc-405 font-mono">ID: {selectedDeviceDetails.code}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedDeviceDetails(null)}
                        className="p-1 text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 rounded transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Meta Fields Table */}
                    <div className="bg-[#FAFDFB] border border-[#CFEFE0]/50 rounded-xl p-3.5 space-y-2.5 text-xs text-zinc-650">
                      
                      <div className="flex justify-between border-b border-dashed border-zinc-200/50 pb-1.5">
                        <span className="text-zinc-400">设备名称</span>
                        <span className="font-extrabold text-zinc-700">{selectedDeviceDetails.name}</span>
                      </div>

                      <div className="flex justify-between border-b border-dashed border-zinc-200/50 pb-1.5">
                        <span className="text-zinc-400">所属产品</span>
                        <span className="font-extrabold text-zinc-700">{selectedDeviceDetails.product}</span>
                      </div>

                      <div className="flex justify-between border-b border-dashed border-zinc-200/50 pb-1.5">
                        <span className="text-zinc-400">通信协议</span>
                        <span className="font-mono text-[#10A66A] font-extrabold">{selectedDeviceDetails.protocol}</span>
                      </div>

                      <div className="flex justify-between border-b border-dashed border-zinc-200/50 pb-1.5">
                        <span className="text-zinc-400">设备状态</span>
                        <span className={`font-bold ${selectedDeviceDetails.status === "在线" ? "text-[#10A66A] animate-pulse" : "text-zinc-400"}`}>{selectedDeviceDetails.status}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-zinc-400">最后上报时间</span>
                        <span className="font-mono text-zinc-500 font-bold">{selectedDeviceDetails.time || "本周期无数据"}</span>
                      </div>

                    </div>

                    {/* Realtime dynamic values */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">上电通道物理遥测</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {selectedDeviceDetails.values.map((v: any, index: number) => (
                          <div key={index} className="p-3 bg-zinc-50 border border-zinc-150 rounded-lg">
                            <span className="text-[10px] text-zinc-400 block font-semibold">{v.name}</span>
                            <span className="text-[15px] font-mono font-black text-zinc-800 mt-1 block">
                              {sharedState.isReporting ? (
                                <>
                                  {v.key === "temp" && `${sharedState.latestValues.temp}`}
                                  {v.key === "hum" && `${sharedState.latestValues.hum}`}
                                  {v.key === "light" && `${sharedState.latestValues.light}`}
                                  {v.key === "co2" && `${sharedState.latestValues.co2}`}
                                  {v.key !== "temp" && v.key !== "hum" && v.key !== "light" && v.key !== "co2" && `${v.val}`}
                                </>
                              ) : (
                                v.val
                              )}
                              <span className="text-[11px] text-zinc-450 ml-0.5 font-normal">{v.unit}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Historical telemetry logs inside the detailed drawer */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">历史遥测记录 (20s)</span>
                        <span className="text-[9px] bg-[#EAF8F1] text-[#10A66A] font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">MQTT TCP</span>
                      </div>

                      <div className="border border-zinc-150 rounded-lg overflow-hidden text-[10.5px]">
                        <table className="w-full text-left col-span-2 divide-y divide-zinc-100">
                          <thead className="bg-[#FAFDFB] text-zinc-450 font-black">
                            <tr>
                              <th className="px-2.5 py-1.5">时间</th>
                              <th className="px-2 py-1.5">数据项</th>
                              <th className="px-2 py-1.5">数值</th>
                              <th className="px-2 py-1.5">单位</th>
                              <th className="px-2.5 py-1.5 text-right">状态</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 text-zinc-650 bg-white">
                            
                            {sharedState.isReporting ? (
                              // Map live dynamic logs if active
                              <>
                                <tr>
                                  <td className="px-2.5 py-1.5 font-mono text-zinc-400">{sharedState.lastReportTime}</td>
                                  <td className="px-2 py-1.5 font-mono text-zinc-600">
                                    {selectedDeviceDetails.id === "temp01" ? "temperature" : 
                                     selectedDeviceDetails.id === "light01" ? "lightValue" :
                                     selectedDeviceDetails.id === "co201" ? "co2Concentration" : 
                                     selectedDeviceDetails.id === "relay01" ? "relayCoil" : "fanSpeed"}
                                  </td>
                                  <td className="px-2 py-1.5 font-mono font-bold text-zinc-700">
                                    {selectedDeviceDetails.id === "temp01" && `${sharedState.latestValues.temp}`}
                                    {selectedDeviceDetails.id === "light01" && `${sharedState.latestValues.light}`}
                                    {selectedDeviceDetails.id === "co201" && `${sharedState.latestValues.co2}`}
                                    {selectedDeviceDetails.id === "relay01" && `${sharedState.latestValues.relayStatus === "开启" ? "1" : "0"}`}
                                    {selectedDeviceDetails.id === "fan01" && `${sharedState.latestValues.fanStatus === "运行中" ? "2400" : "0"}`}
                                  </td>
                                  <td className="px-2 py-1.5 text-zinc-400">{selectedDeviceDetails.values[0]?.unit || "-"}</td>
                                  <td className="px-2.5 py-1.5 text-right font-bold text-[#10A66A]">已上报</td>
                                </tr>
                                <tr>
                                  <td className="px-2.5 py-1.5 font-mono text-zinc-400">10:35:20</td>
                                  <td className="px-2 py-1.5 font-mono text-zinc-500">
                                    {selectedDeviceDetails.id === "temp01" ? "humidity" : "heartbeat"}
                                  </td>
                                  <td className="px-2 py-1.5 font-mono text-zinc-600">
                                    {selectedDeviceDetails.id === "temp01" ? `${sharedState.latestValues.hum}` : "1"}
                                  </td>
                                  <td className="px-2 py-1.5 text-zinc-400">
                                    {selectedDeviceDetails.id === "temp01" ? "%" : ""}
                                  </td>
                                  <td className="px-2.5 py-1.5 text-right font-bold text-[#10A66A]">已上报</td>
                                </tr>
                              </>
                            ) : (
                              // Static historical records
                              selectedDeviceDetails.records.map((r: any, rIdx: number) => (
                                <tr key={rIdx}>
                                  <td className="px-2.5 py-1.5 font-mono text-zinc-400">{r.time}</td>
                                  <td className="px-2 py-1.5 font-mono text-zinc-500">{r.key}</td>
                                  <td className="px-2 py-1.5 font-mono text-zinc-650 font-bold">{r.val}</td>
                                  <td className="px-2 py-1.5 text-zinc-400">{r.unit || "-"}</td>
                                  <td className="px-2.5 py-1.5 text-right font-bold text-[#10A66A]">{r.status}</td>
                                </tr>
                              ))
                            )}

                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* ===================================== */}
          {/* D. 数据仿真运营中心 (DATA SIMULATION) */}
          {/* ===================================== */}
          {activeMenu === "simulation" && (
            <div className="space-y-5 animate-in fade-in duration-200" id="u-datasim-mgr-view">
              
              {/* Header block */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div className="space-y-0.5">
                  <h2 className="text-[15px] font-black text-zinc-800">数据仿真</h2>
                  <p className="text-[11px] text-zinc-450 font-bold">以设备为单位配置物模型属性取值规则，用于产生设备上报数据并查看任务执行结果。</p>
                </div>
              </div>

              {/* 1. Stats row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "仿真任务总数", value: simulationTasks.length },
                  { label: "运行中任务", value: simulationTasks.filter(t => t.status === "运行中").length },
                  { label: "已选设备", value: selectedSimulationDevices.length },
                  { label: "今日产生数据", value: 128 }
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#10A66A]">{stat.value}</span>
                      <Activity className="w-5 h-5 text-[#10A66A] opacity-30" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-12 gap-5 items-start font-sans">
                
                {/* Left Side: Devices & Properties */}
                <div className="col-span-8 flex flex-col gap-5">
                  
                  {/* 2. Device Selection */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                      <div>
                        <h3 className="text-xs font-black text-zinc-800">选择设备</h3>
                        <p className="text-[10px] items-center text-zinc-400 mt-0.5">可选择单个或多个设备作为数据仿真对象。</p>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <button 
                          className="px-2 py-1 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded hover:bg-zinc-100 font-semibold"
                          onClick={() => setSelectedSimulationDevices(simulationDevices.map(d => d.code))}
                        >
                          全选设备
                        </button>
                        <button 
                          className="px-2 py-1 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded hover:bg-zinc-100 font-semibold"
                          onClick={() => setSelectedSimulationDevices([])}
                        >
                          取消选择
                        </button>
                        <button className="px-2 py-1 bg-zinc-50 border border-zinc-200 text-[#10A66A] rounded hover:bg-emerald-50 font-semibold">
                          刷新设备
                        </button>
                      </div>
                    </div>

                    <div className="border border-zinc-150 rounded-lg overflow-hidden text-[11px] max-h-48 overflow-y-auto">
                      <table className="w-full text-left divide-y divide-zinc-100 flex-1">
                        <thead className="bg-[#FAFDFB] text-zinc-500 font-bold sticky top-0 border-b border-zinc-100">
                          <tr>
                            <th className="px-3 py-2 w-10 text-center">选择</th>
                            <th className="px-3 py-2">设备名称</th>
                            <th className="px-3 py-2">设备编号</th>
                            <th className="px-3 py-2">所属产品</th>
                            <th className="px-3 py-2">设备类型</th>
                            <th className="px-3 py-2">在线状态</th>
                            <th className="px-3 py-2 text-center">物模型数量</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 bg-white text-zinc-600 font-medium">
                          {simulationDevices.map(dev => {
                            const isSelected = selectedSimulationDevices.includes(dev.code);
                            return (
                              <tr key={dev.id} className={`hover:bg-emerald-50/30 cursor-pointer ${isSelected ? "bg-emerald-50/20" : ""}`} onClick={() => {
                                if (isSelected) {
                                  setSelectedSimulationDevices(prev => prev.filter(c => c !== dev.code));
                                } else {
                                  setSelectedSimulationDevices(prev => [...prev, dev.code]);
                                }
                              }}>
                                <td className="px-3 py-2 text-center">
                                  <input type="checkbox" className="accent-[#10A66A]" checked={isSelected} readOnly />
                                </td>
                                <td className="px-3 py-2 font-bold text-zinc-800">{dev.name}</td>
                                <td className="px-3 py-2 font-mono text-zinc-500">{dev.code}</td>
                                <td className="px-3 py-2">{dev.product}</td>
                                <td className="px-3 py-2">{dev.type}</td>
                                <td className="px-3 py-2 text-[#10A66A]">{dev.status}</td>
                                <td className="px-3 py-2 text-center font-mono">{dev.tmCount}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 3. ThingModel Properties */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                     <div className="pb-2 border-b border-zinc-100">
                        <h3 className="text-xs font-black text-zinc-800">物模型属性配置</h3>
                        <p className="text-[10px] items-center text-zinc-400 mt-0.5">为已选设备配置需要产生数据的物模型属性。</p>
                     </div>

                     <div className="space-y-4 overflow-y-auto max-h-[300px]">
                        {selectedSimulationDevices.length === 0 ? (
                           <div className="text-center text-zinc-400 py-8 text-xs font-medium border border-dashed border-zinc-200 rounded-lg">
                              请先在上方勾选需要仿真的设备
                           </div>
                        ) : (
                           selectedSimulationDevices.map(devCode => {
                              const dev = simulationDevices.find(d => d.code === devCode);
                              const props = (deviceThingModels as any)[devCode] || [];
                              if (!dev) return null;
                              return (
                                 <div key={devCode} className="border border-emerald-100 rounded-lg overflow-hidden">
                                    <div className="bg-emerald-50/50 px-3 py-2 border-b border-emerald-100 flex items-center gap-2">
                                       <Box className="w-4 h-4 text-[#10A66A]" />
                                       <span className="text-xs font-bold text-zinc-700">设备：{dev.name} <span className="font-mono text-zinc-400">({dev.code})</span></span>
                                    </div>
                                    <div className="p-3 bg-white">
                                       {props.length === 0 ? (
                                          <div className="text-[11px] text-zinc-400">暂无物模型属性配置。</div>
                                       ) : (
                                          <div className="grid grid-cols-2 gap-3">
                                             {props.map((p: any, i: number) => (
                                                <div key={i} className="border border-zinc-150 rounded bg-zinc-50/50 p-2 text-[11px]">
                                                   <div className="flex items-center justify-between font-bold mb-1.5">
                                                      <div className="flex items-center gap-1.5">
                                                         <input type="checkbox" checked={p.enabled} onChange={() => {
                                                            setDeviceThingModels(prev => ({
                                                               ...prev,
                                                               [devCode]: (prev as any)[devCode].map((x: any) => x.id === p.id ? { ...x, enabled: !x.enabled } : x)
                                                            }))
                                                         }} className="accent-[#10A66A]" />
                                                         <span className="font-mono text-zinc-700">{p.id}</span>
                                                      </div>
                                                      <span className="text-[10px] text-zinc-400 font-normal">{p.enabled ? "已启用" : "已停用"}</span>
                                                   </div>
                                                   <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-zinc-600 mt-1">
                                                      <span>显示名称：{p.name}</span>
                                                      <span>数据类型：<span className="text-zinc-500">{p.type}</span></span>
                                                      <span>当前值：<span className="font-mono font-bold text-[#10A66A]">{p.val}</span></span>
                                                      <span>单位：{p.unit}</span>
                                                   </div>
                                                </div>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              );
                           })
                        )}
                     </div>
                  </div>

                </div>

                {/* Right Side: Execution & Values */}
                <div className="col-span-4 flex flex-col gap-5">
                  
                  {/* 4. Value Mode */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                     <div className="pb-2 border-b border-zinc-100">
                        <h3 className="text-xs font-black text-zinc-800">取值方式</h3>
                     </div>

                     <div className="flex gap-2">
                        {["固定值", "随机值", "循环值"].map(mode => (
                           <button 
                              key={mode} 
                              className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${valueMode === mode ? "bg-emerald-50 text-[#10A66A] border-emerald-200" : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"}`}
                              onClick={() => setValueMode(mode)}
                           >
                              {mode}
                           </button>
                        ))}
                     </div>

                     <div className="pt-2 text-[11px] min-h-[140px]">
                        {valueMode === "固定值" && (
                           <div className="space-y-3 animate-in fade-in">
                              <p className="text-zinc-500 text-[10px] mb-2 leading-relaxed">说明：每次执行任务时，上传固定配置的常量数值。</p>
                              {Object.entries(fixedValueConfig).map(([k, v]) => (
                                 <div key={k} className="flex items-center gap-2">
                                    <span className="w-20 truncate font-mono text-zinc-600 font-bold text-right">{k}:</span>
                                    <input type="text" value={v as string} onChange={(e) => setFixedValueConfig(p => ({ ...p, [k]: e.target.value }))} className="flex-1 border border-zinc-200 rounded px-2 py-1 outline-none focus:border-[#10A66A] transition-colors" />
                                 </div>
                              ))}
                           </div>
                        )}
                        {valueMode === "随机值" && (
                           <div className="space-y-3 animate-in fade-in">
                              <p className="text-zinc-500 text-[10px] mb-2 leading-relaxed">说明：每次执行任务时，在设置范围内随机生成属性值。</p>
                              {Object.entries(randomValueConfig).map(([k, v]) => {
                                 const rval = v as any;
                                 return (
                                 <div key={k} className="flex flex-col gap-1.5 p-2 bg-zinc-50 rounded border border-zinc-100">
                                    <span className="font-mono text-zinc-700 font-bold">{k}</span>
                                    <div className="flex items-center gap-1">
                                       <input type="number" value={rval.min} onChange={(e) => setRandomValueConfig(pr => ({ ...pr, [k]: { ...(pr as any)[k], min: e.target.value } }))} placeholder="Min" className="w-14 border border-zinc-200 rounded px-1.5 py-0.5 outline-none focus:border-[#10A66A] text-center bg-white" />
                                       <span className="text-zinc-400">-</span>
                                       <input type="number" value={rval.max} onChange={(e) => setRandomValueConfig(pr => ({ ...pr, [k]: { ...(pr as any)[k], max: e.target.value } }))} placeholder="Max" className="w-14 border border-zinc-200 rounded px-1.5 py-0.5 outline-none focus:border-[#10A66A] text-center bg-white" />
                                       <span className="text-zinc-400 w-10 text-right">小数:</span>
                                       <input type="number" value={rval.dec} onChange={(e) => setRandomValueConfig(pr => ({ ...pr, [k]: { ...(pr as any)[k], dec: e.target.value } }))} className="w-8 border border-zinc-200 rounded px-1.5 py-0.5 outline-none focus:border-[#10A66A] text-center bg-white" />
                                    </div>
                                 </div>
                                 );
                              })}
                           </div>
                        )}
                        {valueMode === "循环值" && (
                           <div className="space-y-3 animate-in fade-in">
                              <p className="text-zinc-500 text-[10px] mb-2 leading-relaxed">说明：任务执行时按配置顺序依次产生属性值，执行到最后从头开始。</p>
                              {Object.entries(cycleValueConfig).map(([k, v]) => {
                                 const cval = v as any;
                                 return (
                                 <div key={k} className="flex flex-col gap-1">
                                    <span className="font-mono text-zinc-600 font-bold">{k}:</span>
                                    <input type="text" value={cval.vals} onChange={(e) => setCycleValueConfig(pr => ({ ...pr, [k]: { ...(pr as any)[k], vals: e.target.value } }))} className="w-full border border-zinc-200 rounded px-2 py-1 outline-none focus:border-[#10A66A] text-xs font-mono tracking-wider" />
                                 </div>
                                 );
                              })}
                           </div>
                        )}
                     </div>
                  </div>

                  {/* 5. Execution Mode */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                     <div className="pb-2 border-b border-zinc-100">
                        <h3 className="text-xs font-black text-zinc-800">任务执行方式</h3>
                     </div>

                     <div className="flex gap-2">
                        {["单次执行", "循环执行", "定时执行"].map(mode => (
                           <button 
                              key={mode} 
                              className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${executionMode === mode ? "bg-emerald-50 text-[#10A66A] border-emerald-200" : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"}`}
                              onClick={() => setExecutionMode(mode)}
                           >
                              {mode}
                           </button>
                        ))}
                     </div>

                     <div className="pt-2 text-[11px] min-h-[140px] flex flex-col justify-between">
                        {executionMode === "单次执行" && (
                           <div className="space-y-2 animate-in fade-in h-full flex flex-col justify-between">
                              <p className="text-zinc-500">说明：点击执行后，只产生一次设备属性数据。</p>
                              <button className="w-full py-2 bg-[#10A66A] text-white rounded-lg font-bold hover:bg-emerald-600 transition" onClick={() => {
                                 const now = new Date();
                                 const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                                 const newData = selectedSimulationDevices.flatMap((devCode, idx) => {
                                    const devName = simulationDevices.find(d => d.code === devCode)?.name || devCode;
                                    const props = (deviceThingModels as any)[devCode]?.filter((p: any) => p.enabled) || [];
                                    return props.map((prop: any) => {
                                       let val = prop.val;
                                       if (valueMode === "随机值") {
                                          const rConfig = (randomValueConfig as any)[prop.id] || { min: 0, max: 100, dec: 0 };
                                          val = (parseFloat(rConfig.min) + Math.random() * (parseFloat(rConfig.max) - parseFloat(rConfig.min))).toFixed(parseInt(rConfig.dec) || 0);
                                       } else if (valueMode === "固定值") {
                                          val = (fixedValueConfig as any)[prop.id] || val;
                                       } else if (valueMode === "循环值") {
                                          const cConfig = (cycleValueConfig as any)[prop.id];
                                          if (cConfig && cConfig.vals) {
                                             const vals = cConfig.vals.split(',').map((v: string) => v.trim());
                                             if (vals.length > 0) val = vals[0];
                                          }
                                       }
                                       return { id: Date.now() + Math.random(), time: timeStr, devName, devCode, prop: prop.id, val, unit: prop.unit, vMode: valueMode, eMode: "单次执行", status: "已产生" };
                                    });
                                 });
                                 setSimulationPreviewData(prev => [...newData, ...prev].slice(0, 50));
                                 setSimulationExecutionRecords(prev => [{ id: `rec-${Date.now()}`, time: timeStr, name: "手动触发单次仿真", devCount: selectedSimulationDevices.length, propCount: newData.length, vMode: valueMode, eMode: "单次执行", result: "成功", operator: "开发调试" }, ...prev].slice(0, 20));
                                 showToast("已触发单次执行");
                              }}>
                                 立即执行
                              </button>
                           </div>
                        )}
                        {executionMode === "循环执行" && (
                           <div className="space-y-3 animate-in fade-in flex flex-col h-full">
                              <div className="space-y-2 flex-1">
                                 <div className="flex items-center justify-between">
                                    <span className="text-zinc-600 font-bold text-[10px]">执行间隔：</span>
                                    <div className="flex items-center gap-1">
                                       <input type="text" value={loopExecutionConfig.interval} onChange={(e) => setLoopExecutionConfig(p => ({ ...p, interval: e.target.value }))} className="w-12 border px-1 border-zinc-200 text-center rounded outline-none h-6" /> 秒
                                    </div>
                                 </div>
                                 <div className="flex items-center justify-between">
                                    <span className="text-zinc-600 font-bold text-[10px]">循环次数：</span>
                                    <div className="flex items-center gap-1">
                                       <input type="text" value={loopExecutionConfig.count} onChange={(e) => setLoopExecutionConfig(p => ({ ...p, count: e.target.value }))} className="w-12 border px-1 border-zinc-200 text-center rounded outline-none h-6" /> 次
                                    </div>
                                 </div>
                                 <div className="flex items-center justify-between">
                                    <span className="text-zinc-600 font-bold text-[10px]">是否持续运行：</span>
                                    <select value={loopExecutionConfig.continuous} onChange={(e) => setLoopExecutionConfig(p => ({ ...p, continuous: e.target.value }))} className="w-16 border px-1 border-zinc-200 rounded outline-none h-6 text-center">
                                       <option>否</option>
                                       <option>是</option>
                                    </select>
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-4">
                                 {simTaskActive ? (
                                    <>
                                       <button className="py-2 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-lg font-bold hover:bg-yellow-100 transition" onClick={() => { setSimTaskActive(false); showToast("任务已暂停"); }}>暂停执行</button>
                                       <button className="py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-bold hover:bg-rose-100 transition" onClick={() => { setSimTaskActive(false); showToast("任务已停止"); }}>停止执行</button>
                                    </>
                                 ) : (
                                    <button className="col-span-2 py-2 bg-[#10A66A] text-white rounded-lg font-bold hover:bg-emerald-600 transition" onClick={() => { setSimTaskActive(true); showToast("开始执行"); }}>
                                       开始执行
                                    </button>
                                 )}
                              </div>
                           </div>
                        )}
                        {executionMode === "定时执行" && (
                           <div className="space-y-3 animate-in fade-in h-full flex flex-col justify-between">
                              <div className="space-y-2">
                                 <div className="flex items-center gap-2">
                                    <span className="text-zinc-500 w-16 text-right">时间:</span>
                                    <input type="time" defaultValue="10:30" className="border px-2 py-1 rounded" />
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <span className="text-zinc-500 w-16 text-right">重复:</span>
                                    <select className="border px-2 py-1 rounded flex-1 bg-white">
                                       <option>不重复</option>
                                       <option>每天</option>
                                       <option>每周</option>
                                    </select>
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                 <button className="py-2 bg-zinc-50 text-zinc-600 border border-zinc-200 rounded-lg font-bold hover:bg-zinc-100 transition" onClick={() => showToast("已触发测试")}>立即测试</button>
                                 <button className="py-2 bg-[#10A66A] text-white rounded-lg font-bold hover:bg-emerald-600 transition" onClick={() => showToast("定时任务已保存")}>保存定时任务</button>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                </div>
              </div>

              {/* 6. Task List */}
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4 font-sans">
                 <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                    <h3 className="text-xs font-black text-zinc-800">仿真任务列表</h3>
                    <div className="flex gap-2 text-xs">
                       <button className="px-3 py-1.5 bg-[#10A66A] text-white rounded hover:bg-emerald-600 font-bold flex items-center gap-1.5" onClick={() => showToast("新建任务准备就绪")}>
                          新建任务
                       </button>
                       <button className="px-3 py-1.5 bg-zinc-50 text-zinc-600 border border-zinc-200 rounded hover:bg-zinc-100 font-bold">
                          保存任务
                       </button>
                    </div>
                 </div>

                 <div className="border border-zinc-150 rounded-lg overflow-hidden text-[11px]">
                    <table className="w-full text-left divide-y divide-zinc-100">
                       <thead className="bg-[#FAFDFB] text-zinc-500 font-bold">
                          <tr>
                             <th className="px-3 py-2">任务名称</th>
                             <th className="px-3 py-2">设备范围</th>
                             <th className="px-3 py-2">物模型属性</th>
                             <th className="px-3 py-2">取值方式</th>
                             <th className="px-3 py-2">执行方式</th>
                             <th className="px-3 py-2">执行状态</th>
                             <th className="px-3 py-2">最近执行时间</th>
                             <th className="px-3 py-2">操作</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-zinc-100 bg-white text-zinc-600 mt-[1px]">
                          {simulationTasks.map(task => {
                             let statusColor = "text-zinc-400";
                             if (task.status === "运行中" || task.status === "已完成") statusColor = "text-[#10A66A]";
                             if (task.status === "等待执行") statusColor = "text-amber-500";
                             if (task.status === "已暂停" || task.status === "已停止") statusColor = "text-zinc-500";
                             return (
                                <tr key={task.id} className="hover:bg-zinc-50">
                                   <td className="px-3 py-2 font-bold text-zinc-800">{task.name}</td>
                                   <td className="px-3 py-2 min-w-[120px] max-w-[200px] truncate" title={task.devices}>{task.devices}</td>
                                   <td className="px-3 py-2 truncate max-w-[150px] font-mono">{task.props}</td>
                                   <td className="px-3 py-2">{task.vMode}</td>
                                   <td className="px-3 py-2">{task.eMode}</td>
                                   <td className={`px-3 py-2 font-black ${statusColor} flex items-center gap-1`}>
                                      {task.status === "运行中" && <span className="w-1.5 h-1.5 rounded-full bg-[#10A66A] animate-pulse" />}
                                      {task.status}
                                   </td>
                                   <td className="px-3 py-2 font-mono">{task.lastTime}</td>
                                   <td className="px-3 py-2">
                                      <div className="flex items-center gap-2 text-[#10A66A] font-bold">
                                         <button className="hover:underline">执行</button>
                                         <button className="text-yellow-600 hover:underline">暂停</button>
                                         <button className="text-zinc-400 hover:text-zinc-600">删除</button>
                                      </div>
                                   </td>
                                </tr>
                             );
                          })}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Bottom Row: Data Preview & Logs */}
              <div className="grid grid-cols-12 gap-5 items-start font-sans">
                 
                 {/* 7. Data Preview */}
                 <div className="col-span-7 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="pb-2 border-b border-zinc-100">
                       <h3 className="text-xs font-black text-zinc-800">数据预览区</h3>
                    </div>
                    <div className="border border-zinc-150 rounded-lg overflow-hidden text-[10.5px]">
                       <table className="w-full text-left divide-y divide-zinc-100">
                          <thead className="bg-[#FAFDFB] text-zinc-500 font-bold">
                             <tr>
                                <th className="px-2.5 py-1.5 w-16">时间</th>
                                <th className="px-2.5 py-1.5">设备/属性</th>
                                <th className="px-2.5 py-1.5 text-right w-16">数值</th>
                                <th className="px-2.5 py-1.5 w-16">方式</th>
                                <th className="px-2.5 py-1.5 font-bold text-[#10A66A] text-right">状态</th>
                             </tr>
                          </thead>
                       </table>
                       <div className="max-h-56 overflow-y-auto bg-white dev-scrollbar">
                          <table className="w-full text-left divide-y divide-zinc-100 mt-[-1px]">
                             <tbody className="divide-y divide-zinc-50 font-medium">
                                {simulationPreviewData.map(log => (
                                   <tr key={log.id} className="hover:bg-zinc-50">
                                      <td className="px-2.5 py-1.5 font-mono text-zinc-400 w-16 whitespace-nowrap">{log.time}</td>
                                      <td className="px-2.5 py-1.5">
                                         <div className="flex flex-col">
                                            <span className="text-zinc-700">{log.devName}</span>
                                            <span className="font-mono text-[9px] text-zinc-400">{log.prop}</span>
                                         </div>
                                      </td>
                                      <td className="px-2.5 py-1.5 text-right w-16">
                                         <span className="font-mono font-bold text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded mr-0.5">{log.val}</span>
                                         <span className="text-zinc-400 text-[9px]">{log.unit}</span>
                                      </td>
                                      <td className="px-2.5 py-1.5 text-zinc-500 text-[9px] w-16 leading-tight">
                                         <span className="block">{log.vMode}</span>
                                         <span className="block text-zinc-400">{log.eMode}</span>
                                      </td>
                                      <td className="px-2.5 py-1.5 text-right font-black text-[#10A66A]">{log.status}</td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </div>

                 {/* 8. Execution Records */}
                 <div className="col-span-5 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                       <h3 className="text-xs font-black text-zinc-800">任务执行记录</h3>
                       <button className="text-[10px] text-zinc-400 hover:text-zinc-600 font-bold">查看全部</button>
                    </div>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                       {simulationExecutionRecords.map(rec => (
                          <div key={rec.id} className="flex gap-3 items-start p-3 bg-zinc-50/50 border border-zinc-100 rounded-lg hover:bg-zinc-100/50">
                             <span className="font-mono text-[10px] text-zinc-400 pt-0.5 whitespace-nowrap">{rec.time}</span>
                             <div className="flex-1 space-y-1">
                                <p className="text-[11px] font-bold text-zinc-800 flex justify-between items-center">
                                   {rec.name}
                                   <span className={`text-[10px] ${rec.result === "成功" ? "text-[#10A66A] bg-emerald-50 border border-emerald-100" : "text-amber-600 bg-amber-50 border border-amber-100"} px-1.5 py-0.5 rounded`}>
                                      {rec.result}
                                   </span>
                                </p>
                                <p className="text-[10px] text-zinc-500">
                                   {rec.devCount}台设备 · {rec.propCount}个属性 · {rec.vMode} · {rec.eMode}
                                </p>
                                <p className="text-[9px] text-zinc-400">操作人: {rec.operator}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

            </div>
          )}

          {/* ===================================== */}
          {/* F. SCENE LINKAGE VIEW */}
          {/* ===================================== */}
          {activeMenu === "scene-linkage" && (
            <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto w-full animate-in fade-in duration-200">
               {/* Stats Cards */}
               <div className="grid grid-cols-4 gap-4">
                 {[
                   { label: "场景联动总数", value: sceneLinkageRules.length },
                   { label: "已启用", value: sceneLinkageRules.filter(r => r.status === "已启用").length },
                   { label: "今日触发", value: sceneLinkageRules.reduce((a,b) => a+b.todayCount, 0) },
                   { label: "待处理事件", value: 1 }
                 ].map((stat, i) => (
                   <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col gap-1">
                     <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                     <div className="flex items-center justify-between">
                       <span className="text-2xl font-black text-[#10A66A]">{stat.value}</span>
                       <Zap className="w-5 h-5 text-[#10A66A]/30" />
                     </div>
                   </div>
                 ))}
               </div>

               {/* Main Configuration Layout */}
               <div className="grid grid-cols-12 gap-6 flex-1 min-h-[500px]">
                 
                 {/* Left Column: Rule List */}
                 <div className="col-span-4 flex flex-col bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden h-full">
                   <div className="p-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
                     <h3 className="font-extrabold text-[13px] text-zinc-800">联动规则列表</h3>
                     <button 
                       onClick={() => {
                          const newRule = { id: `rule-${Date.now()}`, name: "新建联动规则", scene: "智慧温室", conditionRelation: "满足部分条件执行", triggerType: "设备数据触发", status: "未启用", action: "无执行动作", todayCount: 0, lastTime: "暂无" };
                          setSceneLinkageRules(p => [newRule, ...p]);
                          setSelectedSceneLinkageRule(newRule);
                       }}
                       className="px-2 py-1 bg-white border border-zinc-200 hover:bg-[#10A66A] hover:text-white hover:border-[#10A66A] text-zinc-600 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                     >
                       <Plus className="w-3 h-3" /> 新增
                     </button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-2 space-y-2">
                     {sceneLinkageRules.map(rule => (
                       <div 
                         key={rule.id}
                         onClick={() => setSelectedSceneLinkageRule(rule)}
                         className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedSceneLinkageRule?.id === rule.id ? "bg-[#EAF8F1] border-[#10A66A] shadow-sm" : "bg-white border-zinc-200 hover:border-zinc-300"}`}
                       >
                         <div className="flex items-center justify-between mb-2">
                           <span className={`font-bold text-xs ${selectedSceneLinkageRule?.id === rule.id ? "text-zinc-900" : "text-zinc-700"}`}>{rule.name}</span>
                           <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${rule.status === "已启用" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>{rule.status}</span>
                         </div>
                         <div className="text-[11px] text-zinc-500 space-y-1">
                           <div className="flex justify-between"><span>应用场景:</span><span className="font-medium text-zinc-700">{rule.scene}</span></div>
                           <div className="flex justify-between"><span>触发方式:</span><span className="font-medium text-zinc-700">{rule.triggerType}</span></div>
                         </div>
                         <div className="mt-2 flex gap-1 justify-end">
                           <button onClick={(e) => { e.stopPropagation(); setSceneLinkageRules(p => p.map(r => r.id === rule.id ? {...r, status: r.status === "已启用" ? "未启用" : "已启用"} : r)); if(selectedSceneLinkageRule?.id === rule.id) setSelectedSceneLinkageRule((prev:any) => ({...prev, status: prev.status === "已启用" ? "未启用" : "已启用"})) }} className="px-1.5 py-0.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 text-[10px] transition-all"><Power className="w-3 h-3 inline-block" /> {rule.status === "已启用" ? "停用" : "启用"}</button>
                           <button onClick={(e) => { e.stopPropagation(); setSceneLinkageRules(p => [{...rule, id: `rule-${Date.now()}`, name: `${rule.name} 副本`}, ...p]); }} className="px-1.5 py-0.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 text-[10px] transition-all"><Copy className="w-3 h-3 inline-block" /> 复制</button>
                           <button onClick={(e) => { e.stopPropagation(); setSceneLinkageRules(p => p.filter(r => r.id !== rule.id)); if(selectedSceneLinkageRule?.id === rule.id) setSelectedSceneLinkageRule(null); }} className="px-1.5 py-0.5 rounded hover:bg-red-50 text-zinc-500 hover:text-red-500 text-[10px] transition-all"><Trash2 className="w-3 h-3 inline-block" /> 删除</button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Right Column: Rule Config */}
                 <div className="col-span-8 flex flex-col gap-4 overflow-y-auto h-full pr-1">
                   {selectedSceneLinkageRule ? (
                     <>
                       {/* Rule Info */}
                       <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col gap-4 relative">
                          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                            <h3 className="font-extrabold text-[13px] text-zinc-800">联动基础信息</h3>
                            <button onClick={() => {
                               setSceneLinkageRules(p => p.map(r => r.id === selectedSceneLinkageRule.id ? {...r, status: r.status === "已启用" ? "未启用" : "已启用"} : r));
                               setSelectedSceneLinkageRule((p: any) => ({...p, status: p.status === "已启用" ? "未启用" : "已启用"}));
                            }} className={`px-2 py-1 text-[11px] font-bold rounded cursor-pointer transition-all ${selectedSceneLinkageRule.status === "已启用" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-[#10A66A] text-white hover:bg-emerald-600"}`}>
                              {selectedSceneLinkageRule.status === "已启用" ? "停用此规则" : "启用此规则"}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-zinc-500 mb-1">规则名称</label>
                              <input type="text" value={selectedSceneLinkageRule.name} onChange={e => setSelectedSceneLinkageRule((p:any) => ({...p, name: e.target.value}))} className="w-full h-8 px-2 border border-zinc-200 rounded text-xs text-zinc-800 focus:outline-none focus:border-[#10A66A] focus:ring-1 focus:ring-[#10A66A]/20 transition-all font-medium" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-zinc-500 mb-1">应用场景</label>
                              <select value={selectedSceneLinkageRule.scene} onChange={e => setSelectedSceneLinkageRule((p:any) => ({...p, scene: e.target.value}))} className="w-full h-8 px-2 border border-zinc-200 rounded text-xs text-zinc-800 focus:outline-none focus:border-[#10A66A] focus:ring-1 focus:ring-[#10A66A]/20 transition-all font-medium cursor-pointer">
                                <option>智慧温室</option>
                                <option>智慧家居</option>
                                <option>智慧牧场</option>
                                <option>智慧矿山</option>
                                <option>设备运维</option>
                                <option>智慧园区</option>
                              </select>
                            </div>
                          </div>

                          <div className="mt-1 text-xs">
                             <label className="block text-[11px] font-bold text-zinc-500 mb-2">条件关系</label>
                             <div className="flex gap-6">
                               <label className="flex items-center gap-2 cursor-pointer group">
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${selectedSceneLinkageRule.conditionRelation === "满足部分条件执行" ? "border-[#10A66A] bg-[#10A66A]" : "border-zinc-300 group-hover:border-[#10A66A]"}`}>
                                    {selectedSceneLinkageRule.conditionRelation === "满足部分条件执行" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                  </div>
                                  <span className={`font-bold transition-all ${selectedSceneLinkageRule.conditionRelation === "满足部分条件执行" ? "text-zinc-800" : "text-zinc-600"}`}>满足部分条件执行</span>
                               </label>
                               <label className="flex items-center gap-2 cursor-pointer group">
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${selectedSceneLinkageRule.conditionRelation === "满足全部条件执行" ? "border-[#10A66A] bg-[#10A66A]" : "border-zinc-300 group-hover:border-[#10A66A]"}`}>
                                    {selectedSceneLinkageRule.conditionRelation === "满足全部条件执行" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                  </div>
                                  <span className={`font-bold transition-all ${selectedSceneLinkageRule.conditionRelation === "满足全部条件执行" ? "text-zinc-800" : "text-zinc-600"}`}>满足全部条件执行</span>
                               </label>
                               <span className="text-[10px] text-zinc-400 font-normal">({selectedSceneLinkageRule.conditionRelation === "满足部分条件执行" ? "任意一个触发条件成立即可执行联动动作" : "所有触发条件同时成立才执行联动动作"})</span>
                             </div>
                          </div>
                       </div>

                       {/* Trigger Configuration */}
                       <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
                          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                            <h3 className="font-extrabold text-[13px] text-zinc-800">触发源配置</h3>
                          </div>
                          <div>
                             <label className="block text-[11px] font-bold text-zinc-500 mb-2">触发方式</label>
                             <div className="flex gap-2">
                               {["设备数据触发", "定时触发", "设备状态触发", "设备事件触发"].map(type => (
                                 <button
                                   key={type}
                                   onClick={() => setSelectedSceneLinkageRule((p:any) => ({...p, triggerType: type}))}
                                   className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${selectedSceneLinkageRule.triggerType === type ? "bg-[#EAF8F1] text-[#10A66A] border border-[#10A66A] shadow-sm" : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
                                 >{type}</button>
                               ))}
                             </div>
                          </div>

                          <div className="mt-2 bg-zinc-50/80 border border-zinc-200 rounded px-4 py-3">
                            {selectedSceneLinkageRule.triggerType === "设备数据触发" && (
                              <div className="space-y-3">
                                <div className="flex gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                   <span className="flex-1">设备</span>
                                   <span className="flex-1">数据项</span>
                                   <span className="w-20">比较方式</span>
                                   <span className="w-20">阈值</span>
                                   <span className="w-12">单位</span>
                                   <span className="w-24">持续时间(秒)</span>
                                   <span className="w-8"></span>
                                </div>
                                <div className="flex gap-2 items-center">
                                   <select className="flex-1 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>温湿度传感器 temp01</option><option>光照传感器 light01</option><option>二氧化碳传感器 co01</option></select>
                                   <select className="flex-1 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>temperature</option><option>humidity</option><option>light</option><option>co2</option></select>
                                   <select className="w-20 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none"><option>大于</option><option>小于</option><option>等于</option></select>
                                   <input type="text" defaultValue="30" className="w-20 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none" />
                                   <input type="text" defaultValue="℃" className="w-12 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none text-center" />
                                   <input type="text" defaultValue="60" className="w-24 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none text-center" />
                                   <button className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="flex gap-2 items-center">
                                   <select defaultValue="光照传感器 light01" className="flex-1 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>温湿度传感器 temp01</option><option>光照传感器 light01</option><option>二氧化碳传感器 co01</option></select>
                                   <select defaultValue="light" className="flex-1 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>temperature</option><option>humidity</option><option>light</option><option>co2</option></select>
                                   <select defaultValue="小于" className="w-20 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none"><option>大于</option><option>小于</option><option>等于</option></select>
                                   <input type="text" defaultValue="300" className="w-20 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none" />
                                   <input type="text" defaultValue="Lux" className="w-12 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none text-center" />
                                   <input type="text" defaultValue="30" className="w-24 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none text-center" />
                                   <button className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <button className="text-[11px] font-bold text-[#10A66A] flex items-center justify-center gap-1 mt-3 w-full hover:bg-[#EAF8F1] border border-transparent hover:border-[#10A66A]/30 py-1.5 rounded transition-all cursor-pointer bg-white shadow-xs"><Plus className="w-3 h-3" /> 添加设备数据条件</button>
                              </div>
                            )}

                            {selectedSceneLinkageRule.triggerType === "定时触发" && (
                               <div className="space-y-3">
                                 <div className="grid grid-cols-3 gap-4">
                                   <div>
                                     <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase">触发类型</label>
                                     <select className="w-full h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>每天</option><option>每周</option><option>指定日期</option><option>间隔执行</option></select>
                                   </div>
                                   <div>
                                     <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase">执行时间</label>
                                     <input type="time" defaultValue="08:00" className="w-full h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-text" />
                                   </div>
                                   <div>
                                     <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase">重复周期</label>
                                     <select className="w-full h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>每天</option><option>工作日</option><option>节假日</option></select>
                                   </div>
                                 </div>
                                 <div className="p-2 border border-[#10A66A]/20 bg-[#EAF8F1] rounded text-[11px] text-emerald-800 font-bold flex items-center gap-2">
                                     <Clock className="w-3.5 h-3.5" /> 预览: 每天 08:00 自动执行
                                 </div>
                               </div>
                            )}

                            {selectedSceneLinkageRule.triggerType === "设备状态触发" && (
                              <div className="space-y-3">
                                <div className="flex gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                   <span className="flex-1">设备</span>
                                   <span className="flex-1">状态条件</span>
                                   <span className="w-24">持续时间(秒)</span>
                                   <span className="w-8"></span>
                                </div>
                                <div className="flex gap-2 items-center">
                                   <select className="flex-1 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>Modbus网关 gw01</option><option>风机</option><option>继电器</option></select>
                                   <select className="flex-1 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>离线</option><option>在线</option><option>故障</option><option>恢复在线</option></select>
                                   <input type="text" defaultValue="30" className="w-24 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none text-center" />
                                   <button className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <button className="text-[11px] font-bold text-[#10A66A] flex items-center justify-center gap-1 mt-3 w-full hover:bg-[#EAF8F1] border border-transparent hover:border-[#10A66A]/30 py-1.5 rounded transition-all cursor-pointer bg-white shadow-xs"><Plus className="w-3 h-3" /> 添加状态条件</button>
                              </div>
                            )}

                            {selectedSceneLinkageRule.triggerType === "设备事件触发" && (
                              <div className="space-y-3">
                                <div className="flex gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                   <span className="flex-1">事件来源</span>
                                   <span className="flex-1">事件类型</span>
                                   <span className="w-24">事件等级</span>
                                   <span className="w-8"></span>
                                </div>
                                <div className="flex gap-2 items-center">
                                   <select className="flex-1 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>门禁控制器</option><option>烟雾传感器</option><option>水浸传感器</option><option>温湿度传感器</option></select>
                                   <select className="flex-1 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>异常开门</option><option>烟雾告警</option><option>水浸告警</option><option>温度异常</option><option>设备故障</option></select>
                                   <select className="w-24 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>紧急</option><option>重要</option><option>一般</option></select>
                                   <button className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <button className="text-[11px] font-bold text-[#10A66A] flex items-center justify-center gap-1 mt-3 w-full hover:bg-[#EAF8F1] border border-transparent hover:border-[#10A66A]/30 py-1.5 rounded transition-all cursor-pointer bg-white shadow-xs"><Plus className="w-3 h-3" /> 添加事件条件</button>
                              </div>
                            )}
                          </div>
                       </div>

                       {/* Action Configuration */}
                       <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
                          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                            <h3 className="font-extrabold text-[13px] text-zinc-800">执行动作</h3>
                            <button className="text-[11px] font-bold text-[#10A66A] flex items-center gap-1 hover:bg-[#EAF8F1] px-2 py-1 rounded transition-all cursor-pointer border border-[#10A66A]/20 bg-[#EAF8F1]/50"><Plus className="w-3 h-3" /> 添加动作</button>
                          </div>
                          <div className="space-y-2">
                             <div className="flex gap-2 items-center p-2.5 border border-zinc-200 rounded bg-white shadow-xs">
                               <select className="w-32 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>控制设备</option><option>发送通知</option><option>生成告警</option><option>更新设备状态</option><option>记录事件日志</option></select>
                               <select className="flex-1 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer">
                                 <option>风机 fan01</option>
                                 <option>补光灯 light01</option>
                                 <option>继电器 relay01</option>
                               </select>
                               <select className="w-24 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>开启</option><option>关闭</option><option>重启</option></select>
                               <button className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"><Trash2 className="w-4 h-4" /></button>
                             </div>
                             <div className="flex gap-2 items-center p-2.5 border border-zinc-200 rounded bg-white shadow-xs">
                               <select defaultValue="生成告警" className="w-32 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>控制设备</option><option>发送通知</option><option>生成告警</option><option>更新设备状态</option><option>记录事件日志</option></select>
                               <input type="text" defaultValue="高温告警" className="flex-1 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none" />
                               <select defaultValue="重要" className="w-24 h-8 px-2 border border-zinc-200 rounded text-xs font-medium focus:border-[#10A66A] focus:outline-none cursor-pointer"><option>一般</option><option>重要</option><option>紧急</option></select>
                               <button className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </div>
                       </div>

                       {/* Rule Summary & Actions */}
                       <div className="bg-[#EAF8F1] border border-[#10A66A]/20 rounded-xl p-4 shadow-sm relative overflow-hidden">
                          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#10A66A]/5 rounded-full blur-xl pointer-events-none"></div>
                          <h3 className="font-extrabold text-[12px] text-[#10A66A] mb-3 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> 规则摘要及提交</h3>
                          <div className="text-[11px] text-zinc-700 leading-relaxed space-y-1.5 bg-white/60 p-3 rounded-lg border border-white/50 backdrop-blur-sm">
                             <p><strong className="text-zinc-900">规则名称：</strong>{selectedSceneLinkageRule.name}</p>
                             <p><strong className="text-zinc-900">触发逻辑：</strong>{selectedSceneLinkageRule.conditionRelation === "满足部分条件执行" ? "当任意一个触发条件成立时，系统将执行联动动作。" : "当满足全部条件执行时，系统将同时判断配置的各个条件。"}</p>
                             <p><strong className="text-zinc-900">触发方式：</strong>{selectedSceneLinkageRule.triggerType}</p>
                             <p><strong className="text-zinc-900">执行动作：</strong>按照配置顺序执行后续指令（开启风机 fan01 等）。</p>
                             <p><strong className="text-zinc-900">当前状态：</strong><span className={selectedSceneLinkageRule.status === "已启用" ? "text-[#10A66A] font-bold" : "text-zinc-500 font-bold"}>{selectedSceneLinkageRule.status}</span></p>
                          </div>
                          <div className="mt-4 flex gap-3 justify-end relative z-10">
                             <button onClick={() => {
                                 const newLog = {
                                   id: `rd-${Date.now()}`,
                                   time: new Date().toLocaleTimeString(),
                                   ruleName: selectedSceneLinkageRule.name,
                                   type: selectedSceneLinkageRule.triggerType,
                                   relation: selectedSceneLinkageRule.conditionRelation,
                                   condition: selectedSceneLinkageRule.triggerType === "定时触发" ? "每天 08:00" : (selectedSceneLinkageRule.triggerType === "设备数据触发" ? "temperature > 30℃" : "本地测试触发"),
                                   action: "开启风机 fan01",
                                   result: "成功"
                                 };
                                 setLinkageTriggerRecords(p => [newLog, ...p]);
                                 showToast("场景联动规则已触发，动作下发成功");
                             }} className="px-5 py-2.5 bg-white border border-[#10A66A]/20 text-[#10A66A] font-bold text-xs rounded-lg shadow-sm hover:bg-emerald-50 hover:border-[#10A66A]/40 transition-all cursor-pointer flex items-center gap-1">
                               <Play className="w-3.5 h-3.5 fill-current" /> 测试触发
                             </button>
                             <button onClick={() => {
                                  setSceneLinkageRules(p => p.map(r => r.id === selectedSceneLinkageRule.id ? selectedSceneLinkageRule : r));
                                  showToast("联动规则保存成功");
                             }} className="px-5 py-2.5 bg-[#10A66A] text-white font-bold text-xs rounded-lg shadow-sm hover:bg-emerald-600 transition-all cursor-pointer flex items-center gap-1 text-center">
                               <Check className="w-3.5 h-3.5" /> 保存规则配置
                             </button>
                          </div>
                       </div>

                     </>
                   ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 bg-white border border-zinc-200 rounded-xl shadow-sm">
                       <Zap className="w-12 h-12 mb-3 text-zinc-200 opacity-50" />
                       <p className="font-bold text-sm tracking-wide">请在左侧选择一条联动规则</p>
                     </div>
                   )}
                 </div>
               </div>

               {/* Trigger Records bottom table */}
               <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-extrabold text-[13px] text-zinc-800">联动触发记录</h3>
                     <button className="text-[11px] font-bold text-[#10A66A] hover:bg-[#EAF8F1] px-2 py-1 rounded transition-all flex items-center gap-1 cursor-pointer"><RefreshCw className="w-3 h-3" /> 刷新纪录</button>
                  </div>
                  <div className="overflow-x-auto border border-zinc-100 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50/80 text-zinc-500 border-b border-zinc-200">
                          <th className="p-3 font-bold whitespace-nowrap hidden lg:table-cell">记录ID</th>
                          <th className="p-3 font-bold whitespace-nowrap">触发时间</th>
                          <th className="p-3 font-bold whitespace-nowrap">规则名称</th>
                          <th className="p-3 font-bold whitespace-nowrap">触发方式</th>
                          <th className="p-3 font-bold whitespace-nowrap hidden md:table-cell">条件关系</th>
                          <th className="p-3 font-bold truncate max-w-[200px]">触发条件</th>
                          <th className="p-3 font-bold whitespace-nowrap">执行动作</th>
                          <th className="p-3 font-bold whitespace-nowrap text-right">执行结果</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linkageTriggerRecords.map((log) => (
                          <tr key={log.id} className="border-b border-zinc-100 hover:bg-[#EAF8F1]/40 transition-colors">
                            <td className="p-3 text-zinc-400 font-mono text-[10px] hidden lg:table-cell">{log.id}</td>
                            <td className="p-3 text-zinc-500 font-mono font-medium whitespace-nowrap">{log.time}</td>
                            <td className="p-3 font-bold text-zinc-800 whitespace-nowrap">{log.ruleName}</td>
                            <td className="p-3 text-zinc-600 whitespace-nowrap text-[11px]"><span className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600 font-medium">{log.type}</span></td>
                            <td className="p-3 text-zinc-600 whitespace-nowrap hidden md:table-cell text-[11px]">{log.relation}</td>
                            <td className="p-3 text-zinc-600 truncate max-w-[200px] font-mono text-[11px]">{log.condition}</td>
                            <td className="p-3 text-zinc-800 font-bold whitespace-nowrap text-[11px]">{log.action}</td>
                            <td className="p-3 text-right">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold ${log.result === '成功' ? 'bg-[#EAF8F1] text-[#10A66A] border border-[#10A66A]/20' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                {log.result}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {linkageTriggerRecords.length === 0 && (
                          <tr><td colSpan={8} className="p-6 text-center text-zinc-400 text-xs">暂无触发记录</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {/* ===================================== */}
          {/* G. OTHER BLANK CHANNELS (PREVENTING WHITE SCREEN) */}
          {/* ===================================== */}
          {/* ===================================== */}
          {/* G. 设备任务调度面板 (DEVICE TASKS) */}
          {/* ===================================== */}
          {activeMenu === "task-mgr" && (
            <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto w-full animate-in fade-in duration-200">
               {/* Header */}
               <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                 <div className="space-y-0.5">
                   <h2 className="text-[15px] font-black text-zinc-800">设备任务调度</h2>
                   <p className="text-[11px] text-zinc-450 font-bold">按设备或产品配置属性下发、服务调用任务，并支持单日、每日、每周、循环间隔等定时执行方式。</p>
                 </div>
               </div>

               {/* Stats Cards */}
               <div className="grid grid-cols-4 gap-4">
                 {[
                   { label: "任务总数", value: deviceTasks.length },
                   { label: "启用任务", value: deviceTasks.filter(t => t.status === "已启用").length },
                   { label: "今日执行", value: 16 },
                   { label: "执行异常", value: 1 }
                 ].map((stat, i) => (
                   <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col gap-1">
                     <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                     <div className="flex items-center justify-between">
                       <span className={`text-2xl font-black ${i === 3 && stat.value > 0 ? "text-rose-500" : "text-[#10A66A]"}`}>{stat.value}</span>
                       <Clock className={`w-5 h-5 opacity-30 ${i === 3 && stat.value > 0 ? "text-rose-500" : "text-[#10A66A]"}`} />
                     </div>
                   </div>
                 ))}
               </div>

               <div className="grid grid-cols-12 gap-5 items-start font-sans">
                  
                  {/* Left Column: Configuration */}
                  <div className="col-span-8 flex flex-col gap-5">
                    
                    {/* Object Configuration */}
                    <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                        <div>
                          <h3 className="text-xs font-black text-zinc-800">任务对象</h3>
                          <p className="text-[10px] items-center text-zinc-400 mt-0.5">当前任务对象：{taskTargetType}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {["设备", "产品"].map(type => (
                           <button 
                              key={type} 
                              className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${taskTargetType === type ? "bg-[#EAF8F1] text-[#10A66A] border-[#10A66A]" : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"}`}
                              onClick={() => setTaskTargetType(type)}
                           >
                              {type}
                           </button>
                        ))}
                      </div>

                      <div className="border border-zinc-150 rounded-lg overflow-hidden text-[11px] max-h-48 overflow-y-auto">
                        {taskTargetType === "设备" ? (
                          <table className="w-full text-left divide-y divide-zinc-100 flex-1">
                            <thead className="bg-[#FAFDFB] text-zinc-500 font-bold sticky top-0 border-b border-zinc-100">
                              <tr>
                                <th className="px-3 py-2 w-10 text-center">选择</th>
                                <th className="px-3 py-2">设备名称</th>
                                <th className="px-3 py-2">设备编号</th>
                                <th className="px-3 py-2">所属产品</th>
                                <th className="px-3 py-2">设备类型</th>
                                <th className="px-3 py-2">在线状态</th>
                                <th className="px-3 py-2 text-right">最新数据</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 bg-white text-zinc-600 font-medium">
                              {cloudDevices.map(dev => {
                                const isSelected = selectedTaskDevices.includes(dev.code);
                                return (
                                  <tr key={dev.id} className={`hover:bg-emerald-50/30 cursor-pointer ${isSelected ? "bg-emerald-50/20" : ""}`} onClick={() => {
                                    if (isSelected) {
                                      setSelectedTaskDevices(prev => prev.filter(c => c !== dev.code));
                                    } else {
                                      setSelectedTaskDevices(prev => [...prev, dev.code]);
                                    }
                                  }}>
                                    <td className="px-3 py-2 text-center">
                                      <input type="checkbox" className="accent-[#10A66A]" checked={isSelected} readOnly />
                                    </td>
                                    <td className="px-3 py-2 font-bold text-zinc-800">{dev.name}</td>
                                    <td className="px-3 py-2 font-mono text-zinc-500">{dev.code}</td>
                                    <td className="px-3 py-2">{dev.product}</td>
                                    <td className="px-3 py-2">{dev.type}</td>
                                    <td className="px-3 py-2 text-[#10A66A]">{dev.status}</td>
                                    <td className="px-3 py-2 text-right truncate max-w-[120px]" title={dev.latestData}>{dev.latestData}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : (
                          <table className="w-full text-left divide-y divide-zinc-100 flex-1">
                            <thead className="bg-[#FAFDFB] text-zinc-500 font-bold sticky top-0 border-b border-zinc-100">
                              <tr>
                                <th className="px-3 py-2 w-10 text-center">选择</th>
                                <th className="px-3 py-2">产品名称</th>
                                <th className="px-3 py-2">产品类型</th>
                                <th className="px-3 py-2">节点类型</th>
                                <th className="px-3 py-2">通信协议</th>
                                <th className="px-3 py-2 text-center">设备数量</th>
                                <th className="px-3 py-2">状态</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 bg-white text-zinc-600 font-medium">
                              {cloudProducts.map(prod => {
                                const isSelected = selectedTaskProducts.includes(prod.id);
                                return (
                                  <tr key={prod.id} className={`hover:bg-emerald-50/30 cursor-pointer ${isSelected ? "bg-emerald-50/20" : ""}`} onClick={() => {
                                    if (isSelected) {
                                      setSelectedTaskProducts(prev => prev.filter(c => c !== prod.id));
                                    } else {
                                      setSelectedTaskProducts(prev => [...prev, prod.id]);
                                    }
                                  }}>
                                    <td className="px-3 py-2 text-center">
                                      <input type="checkbox" className="accent-[#10A66A]" checked={isSelected} readOnly />
                                    </td>
                                    <td className="px-3 py-2 font-bold text-zinc-800">{prod.name}</td>
                                    <td className="px-3 py-2">{prod.type}</td>
                                    <td className="px-3 py-2">{prod.nodeType}</td>
                                    <td className="px-3 py-2">{prod.protocol}</td>
                                    <td className="px-3 py-2 text-center font-mono">{prod.deviceCount}</td>
                                    <td className="px-3 py-2 text-[#10A66A]">{prod.status}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                    {/* Task Type & Content Configuration */}
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex divide-x divide-zinc-200">
                       {/* Task Type Sidebar */}
                       <div className="w-48 bg-zinc-50/50 p-4 shrink-0 flex flex-col gap-2">
                          <h3 className="text-xs font-black text-zinc-800 mb-2">任务类型</h3>
                          {["属性下发", "服务调用"].map(type => (
                             <button
                                key={type}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${taskActionType === type ? "bg-white text-[#10A66A] shadow-sm border border-zinc-100" : "text-zinc-600 hover:bg-zinc-100 border border-transparent"}`}
                                onClick={() => setTaskActionType(type)}
                             >
                                {type}
                             </button>
                          ))}
                       </div>
                       
                       {/* Content Panel */}
                       <div className="flex-1 p-5">
                          {taskActionType === "属性下发" ? (
                             <div className="space-y-4 animate-in fade-in h-auto">
                                <div className="pb-2 border-b border-zinc-100">
                                   <h3 className="text-xs font-black text-zinc-800">属性下发配置</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                   <div className="space-y-1">
                                      <label className="text-zinc-500 font-bold">下发对象</label>
                                      <div className="w-full border border-zinc-200 rounded-lg p-2 bg-zinc-50 text-zinc-600">
                                         {taskTargetType}，已选 {taskTargetType === "设备" ? selectedTaskDevices.length : selectedTaskProducts.length} 个
                                      </div>
                                   </div>
                                   <div className="space-y-1">
                                      <label className="text-zinc-500 font-bold">物模型属性</label>
                                      <select 
                                         value={propertyDownlinkConfig.property} 
                                         onChange={(e) => setPropertyDownlinkConfig({...propertyDownlinkConfig, property: e.target.value})}
                                         className="w-full border border-zinc-200 rounded-lg p-2 outline-none focus:border-[#10A66A]"
                                      >
                                         <option value="fanStatus">fanStatus</option>
                                         <option value="relayStatus">relayStatus</option>
                                         <option value="lightSwitch">lightSwitch</option>
                                         <option value="targetTemperature">targetTemperature</option>
                                         <option value="ventilationMode">ventilationMode</option>
                                      </select>
                                   </div>
                                   <div className="space-y-1">
                                      <label className="text-zinc-500 font-bold">下发值</label>
                                      <input 
                                         type="text" 
                                         value={propertyDownlinkConfig.value} 
                                         onChange={(e) => setPropertyDownlinkConfig({...propertyDownlinkConfig, value: e.target.value})}
                                         className="w-full border border-zinc-200 rounded-lg p-2 outline-none focus:border-[#10A66A] font-mono"
                                      />
                                   </div>
                                   <div className="space-y-1">
                                      <label className="text-zinc-500 font-bold">下发策略</label>
                                      <select 
                                         value={propertyDownlinkConfig.strategy}
                                         onChange={(e) => setPropertyDownlinkConfig({...propertyDownlinkConfig, strategy: e.target.value})}
                                         className="w-full border border-zinc-200 rounded-lg p-2 outline-none focus:border-[#10A66A]"
                                      >
                                         <option>立即下发</option>
                                         <option>按计划下发</option>
                                      </select>
                                   </div>
                                   <div className="space-y-1">
                                      <label className="text-zinc-500 font-bold">超时时间(秒)</label>
                                      <input 
                                         type="number" 
                                         value={propertyDownlinkConfig.timeout}
                                         onChange={(e) => setPropertyDownlinkConfig({...propertyDownlinkConfig, timeout: e.target.value})}
                                         className="w-full border border-zinc-200 rounded-lg p-2 outline-none focus:border-[#10A66A]" 
                                      />
                                   </div>
                                   <div className="space-y-1 flex flex-col justify-end pb-2">
                                      <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-500">
                                         <input 
                                           type="checkbox" 
                                           checked={propertyDownlinkConfig.retry}
                                           onChange={() => setPropertyDownlinkConfig({...propertyDownlinkConfig, retry: !propertyDownlinkConfig.retry})}
                                           className="accent-[#10A66A]" 
                                         />
                                         失败重试
                                      </label>
                                   </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                   <button 
                                      className="px-4 py-1.5 bg-[#EAF8F1] text-[#10A66A] rounded hover:bg-emerald-100 font-bold text-xs"
                                      onClick={() => {
                                         const now = new Date();
                                         const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                                         let updatedDeviceCount = 0;
                                         
                                         if (taskTargetType === "设备") {
                                            const updatedDevices = cloudDevices.map(d => {
                                               if (selectedTaskDevices.includes(d.code)) {
                                                  updatedDeviceCount++;
                                                  return { ...d, latestData: `${propertyDownlinkConfig.property} = ${propertyDownlinkConfig.value}` };
                                               }
                                               return d;
                                            });
                                            setCloudDevices(updatedDevices);
                                         }
                                         
                                         setTaskExecutionRecords(prev => [{
                                            id: `er-test-${Date.now()}`, 
                                            time: timeStr, 
                                            name: "测试下发", 
                                            target: `${taskTargetType} ( ${updatedDeviceCount || selectedTaskProducts.length} 个 )`, 
                                            actionType: "属性下发", 
                                            scheduleType: "单次测试", 
                                            content: `${propertyDownlinkConfig.property} = ${propertyDownlinkConfig.value}`, 
                                            result: "成功", 
                                            detail: "属性测试下发成功"
                                         }, ...prev].slice(0, 20));
                                         showToast("属性测试下发已触发，可查看执行记录与设备最新数据。");
                                      }}
                                   >
                                      测试下发
                                   </button>
                                </div>
                             </div>
                          ) : (
                             <div className="space-y-4 animate-in fade-in h-auto">
                                <div className="pb-2 border-b border-zinc-100">
                                   <h3 className="text-xs font-black text-zinc-800">服务调用配置</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs items-start">
                                   <div className="space-y-4">
                                      <div className="space-y-1">
                                         <label className="text-zinc-500 font-bold">服务名称</label>
                                         <select 
                                            value={serviceCallConfig.serviceName}
                                            onChange={(e) => setServiceCallConfig({...serviceCallConfig, serviceName: e.target.value})}
                                            className="w-full border border-zinc-200 rounded-lg p-2 outline-none focus:border-[#10A66A]"
                                         >
                                            <option value="openFan">openFan</option>
                                            <option value="closeFan">closeFan</option>
                                            <option value="setRelay">setRelay</option>
                                            <option value="setVentilationMode">setVentilationMode</option>
                                            <option value="readDeviceStatus">readDeviceStatus</option>
                                            <option value="restartGateway">restartGateway</option>
                                         </select>
                                      </div>
                                      <div className="space-y-1">
                                         <label className="text-zinc-500 font-bold">服务说明</label>
                                         <div className="w-full text-zinc-400 text-[11px] leading-relaxed p-2 bg-zinc-50 rounded">
                                            调用指定网关或直连设备内置服务，并获取返回结果。当前支持异步回调。
                                         </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-zinc-500 font-bold">调用策略</label>
                                            <select 
                                              value={serviceCallConfig.strategy}
                                              onChange={(e) => setServiceCallConfig({...serviceCallConfig, strategy: e.target.value})}
                                              className="w-full border border-zinc-200 rounded p-1.5 outline-none focus:border-[#10A66A]"
                                            >
                                              <option>单设备调用</option>
                                              <option>批量调用</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-zinc-500 font-bold">失败重试</label>
                                            <select 
                                              value={serviceCallConfig.retry ? "开启" : "关闭"}
                                              onChange={(e) => setServiceCallConfig({...serviceCallConfig, retry: e.target.value === "开启"})}
                                              className="w-full border border-zinc-200 rounded p-1.5 outline-none focus:border-[#10A66A]"
                                            >
                                              <option>开启</option>
                                              <option>关闭</option>
                                            </select>
                                        </div>
                                      </div>
                                   </div>
                                   <div className="space-y-1 h-full flex flex-col">
                                      <label className="text-zinc-500 font-bold">服务参数 (JSON)</label>
                                      <textarea 
                                         value={serviceCallConfig.params}
                                         onChange={(e) => setServiceCallConfig({...serviceCallConfig, params: e.target.value})}
                                         className="w-full border border-zinc-200 rounded-lg p-2 outline-none focus:border-[#10A66A] font-mono flex-1 min-h-[140px] whitespace-pre text-[11px]" 
                                         spellCheck={false}
                                      />
                                   </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                   <button 
                                      className="px-4 py-1.5 bg-[#EAF8F1] text-[#10A66A] rounded hover:bg-emerald-100 font-bold text-xs"
                                      onClick={() => {
                                         const now = new Date();
                                         const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                                         
                                         if (taskTargetType === "设备") {
                                            const updatedDevices = cloudDevices.map(d => {
                                               if (selectedTaskDevices.includes(d.code)) {
                                                  // Service call can also update latest data with execution log 
                                                  return { ...d, latestData: `${serviceCallConfig.serviceName} 调用成功` };
                                               }
                                               return d;
                                            });
                                            setCloudDevices(updatedDevices);
                                         }

                                         setTaskExecutionRecords(prev => [{
                                            id: `er-test-${Date.now()}`, 
                                            time: timeStr, 
                                            name: "测试服务调用", 
                                            target: `${taskTargetType}`, 
                                            actionType: "服务调用", 
                                            scheduleType: "单次测试", 
                                            content: serviceCallConfig.serviceName, 
                                            result: "成功", 
                                            detail: "服务调用测试返回成功状态码 200"
                                         }, ...prev].slice(0, 20));
                                         showToast("服务测试调用成功。");
                                      }}
                                   >
                                      测试调用
                                   </button>
                                </div>
                             </div>
                          )}
                       </div>
                    </div>
                  </div>

                  {/* Right Column: Schedule Configuration */}
                  <div className="col-span-4 flex flex-col gap-5">
                    
                    <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                       <div className="pb-2 border-b border-zinc-100">
                          <h3 className="text-xs font-black text-zinc-800">定时类型</h3>
                       </div>

                       <div className="grid grid-cols-2 gap-2">
                          {["单日", "每日", "每周", "循环间隔"].map(type => (
                             <button 
                                key={type} 
                                className={`py-1.5 rounded-lg text-xs font-bold border transition ${scheduleType === type ? "bg-[#EAF8F1] text-[#10A66A] border-[#10A66A]" : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"}`}
                                onClick={() => setScheduleType(type)}
                             >
                                {type}
                             </button>
                          ))}
                       </div>

                       <div className="pt-2 text-[11px] min-h-[160px]">
                          {scheduleType === "单日" && (
                             <div className="space-y-4 animate-in fade-in">
                                <div className="space-y-2">
                                   <div className="flex items-center gap-2">
                                      <span className="text-zinc-500 w-16 text-right font-bold">执行日期:</span>
                                      <input type="date" value={singleDayScheduleConfig.date} onChange={e => setSingleDayScheduleConfig({...singleDayScheduleConfig, date: e.target.value})} className="border px-2 py-1 rounded flex-1 outline-none text-zinc-700" />
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-zinc-500 w-16 text-right font-bold">执行时间:</span>
                                      <input type="time" value={singleDayScheduleConfig.time} onChange={e => setSingleDayScheduleConfig({...singleDayScheduleConfig, time: e.target.value})} className="border px-2 py-1 rounded flex-1 outline-none text-zinc-700" />
                                   </div>
                                </div>
                                <p className="text-zinc-400 leading-relaxed text-[10px]">执行说明：<br/>仅在指定日期和时间执行一次任务。</p>
                             </div>
                          )}
                          {scheduleType === "每日" && (
                             <div className="space-y-4 animate-in fade-in">
                                <div className="space-y-2">
                                   <div className="flex items-center gap-2">
                                      <span className="text-zinc-500 w-16 text-right font-bold">执行时间:</span>
                                      <input type="time" value={dailyScheduleConfig.time} onChange={e => setDailyScheduleConfig({...dailyScheduleConfig, time: e.target.value})} className="border px-2 py-1 rounded flex-1 outline-none text-zinc-700" />
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-zinc-500 w-16 text-right font-bold">开始:</span>
                                      <input type="date" value={dailyScheduleConfig.startDate} onChange={e => setDailyScheduleConfig({...dailyScheduleConfig, startDate: e.target.value})} className="border px-2 py-1 rounded w-[110px] outline-none text-zinc-700" />
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-zinc-500 w-16 text-right font-bold">结束:</span>
                                      <input type="date" value={dailyScheduleConfig.endDate} onChange={e => setDailyScheduleConfig({...dailyScheduleConfig, endDate: e.target.value})} className="border px-2 py-1 rounded w-[110px] outline-none text-zinc-700" />
                                   </div>
                                </div>
                                <p className="text-zinc-400 leading-relaxed text-[10px]">执行说明：<br/>在生效日期范围内每天按指定时间执行任务。</p>
                             </div>
                          )}
                          {scheduleType === "每周" && (
                             <div className="space-y-4 animate-in fade-in">
                                <div className="space-y-2">
                                   <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-zinc-500 w-16 text-right font-bold shrink-0">执行星期:</span>
                                      <div className="flex flex-wrap gap-1">
                                      {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map(day => {
                                         const isActive = weeklyScheduleConfigObj.days.includes(day);
                                         return (
                                            <button key={day} 
                                              onClick={() => {
                                                const newDays = isActive ? weeklyScheduleConfigObj.days.filter(d => d !== day) : [...weeklyScheduleConfigObj.days, day];
                                                setWeeklyScheduleConfigObj({...weeklyScheduleConfigObj, days: newDays});
                                              }}
                                              className={`px-1.5 py-0.5 border rounded text-[10px] ${isActive ? 'bg-[#10A66A] text-white border-[#10A66A]' : 'bg-white text-zinc-500'}`}
                                            >
                                               {day}
                                            </button>
                                         );
                                      })}
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2 mt-2">
                                      <span className="text-zinc-500 w-16 text-right font-bold">执行时间:</span>
                                      <input type="time" value={weeklyScheduleConfigObj.time} onChange={e => setWeeklyScheduleConfigObj({...weeklyScheduleConfigObj, time: e.target.value})} className="border px-2 py-1 rounded flex-1 outline-none text-zinc-700" />
                                   </div>
                                </div>
                                <p className="text-zinc-400 leading-relaxed text-[10px]">执行说明：<br/>每周在指定星期和时间执行任务。</p>
                             </div>
                          )}
                          {scheduleType === "循环间隔" && (
                             <div className="space-y-4 animate-in fade-in">
                                <div className="space-y-2">
                                   <div className="flex items-center gap-2">
                                      <span className="text-zinc-500 w-16 text-right font-bold">间隔频率:</span>
                                      <input type="text" value={intervalScheduleConfig.value} onChange={e => setIntervalScheduleConfig({...intervalScheduleConfig, value: e.target.value})} className="w-12 border px-1 border-zinc-200 text-center rounded outline-none h-6" />
                                      <select value={intervalScheduleConfig.unit} onChange={e => setIntervalScheduleConfig({...intervalScheduleConfig, unit: e.target.value})} className="border px-1 border-zinc-200 rounded outline-none h-6 bg-white text-zinc-700">
                                         <option>秒</option>
                                         <option>分钟</option>
                                         <option>小时</option>
                                      </select>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-zinc-500 w-16 text-right font-bold">时段:</span>
                                      <input type="time" value={intervalScheduleConfig.startTime} onChange={e => setIntervalScheduleConfig({...intervalScheduleConfig, startTime: e.target.value})} className="border px-1 py-1 rounded min-w-0 outline-none text-zinc-700 h-6 text-center" />
                                      <span className="text-zinc-400">-</span>
                                      <input type="time" value={intervalScheduleConfig.endTime} onChange={e => setIntervalScheduleConfig({...intervalScheduleConfig, endTime: e.target.value})} className="border px-1 py-1 rounded min-w-0 outline-none text-zinc-700 h-6 text-center" />
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-zinc-500 w-16 text-right font-bold">循环次数:</span>
                                      <input type="number" value={intervalScheduleConfig.count} onChange={e => setIntervalScheduleConfig({...intervalScheduleConfig, count: e.target.value})} className="w-16 border px-2 border-zinc-200 text-center rounded outline-none h-6" />
                                   </div>
                                </div>
                                <p className="text-zinc-400 leading-relaxed text-[10px]">执行说明：<br/>在指定时间段内按固定间隔循环执行任务。</p>
                             </div>
                          )}
                       </div>
                    </div>

                    {/* Rule Summary */}
                    <div className="bg-[#FAFDFB] border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                       <div className="pb-2 border-b border-zinc-100 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-[#10A66A]" />
                          <h3 className="text-xs font-black text-zinc-800">任务规则摘要</h3>
                       </div>
                       <div className="text-[10px] leading-relaxed text-zinc-600 space-y-1">
                          {scheduleType === "单日" && (
                            <p><strong>执行时间：</strong> {singleDayScheduleConfig.date} {singleDayScheduleConfig.time}</p>
                          )}
                          {scheduleType === "每日" && (
                            <p><strong>执行时间：</strong> 每天 {dailyScheduleConfig.time}</p>
                          )}
                          {scheduleType === "每周" && (
                            <p><strong>执行时间：</strong> 每{weeklyScheduleConfigObj.days.join('、')} {weeklyScheduleConfigObj.time}</p>
                          )}
                          {scheduleType === "循环间隔" && (
                            <p><strong>执行时间：</strong> 每天 {intervalScheduleConfig.startTime} 至 {intervalScheduleConfig.endTime}，每隔 {intervalScheduleConfig.value} {intervalScheduleConfig.unit}执行一次</p>
                          )}
                          
                          <p className="mt-2 text-[#10A66A]">
                            <strong>执行效果：</strong>任务触发后，{taskActionType === "属性下发" ? `系统将向选定对象下发 \`${propertyDownlinkConfig.property} = ${propertyDownlinkConfig.value}\`` : `系统调用 \`${serviceCallConfig.serviceName}\` 服务`}，并记录任务执行结果。
                          </p>
                       </div>
                    </div>

                  </div>
               </div>

               {/* Task List and Execution Records Row */}
               <div className="grid grid-cols-12 gap-5 items-start font-sans pb-4">
                  
                  {/* Task List */}
                  <div className="col-span-7 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4 min-h-[350px]">
                     <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                        <h3 className="text-xs font-black text-zinc-800">设备任务列表</h3>
                        <div className="flex gap-2 text-xs">
                           <button className="px-3 py-1.5 bg-[#10A66A] text-white rounded hover:bg-emerald-600 font-bold flex items-center gap-1.5" onClick={() => showToast("已准备新建任务界面")}>
                              新建任务
                           </button>
                           <button className="px-3 py-1.5 bg-zinc-50 text-zinc-600 border border-zinc-200 rounded hover:bg-zinc-100 font-bold">
                              保存任务
                           </button>
                        </div>
                     </div>

                     <div className="border border-zinc-150 rounded-lg overflow-hidden text-[11px] h-full overflow-y-auto">
                        <table className="w-full text-left divide-y divide-zinc-100">
                           <thead className="bg-[#FAFDFB] text-zinc-500 font-bold sticky top-0">
                              <tr>
                                 <th className="px-2 py-2">任务名称</th>
                                 <th className="px-2 py-2">类型</th>
                                 <th className="px-2 py-2">定时</th>
                                 <th className="px-2 py-2">执行内容</th>
                                 <th className="px-2 py-2 text-center">状态</th>
                                 <th className="px-2 py-2 text-right">操作</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-zinc-100 bg-white text-zinc-600 font-medium whitespace-nowrap">
                              {deviceTasks.map(task => (
                                 <tr key={task.id} className="hover:bg-zinc-50 group">
                                    <td className="px-2 py-2.5 font-bold text-zinc-800 max-w-[100px] truncate" title={task.name}>{task.name}</td>
                                    <td className="px-2 py-2.5">
                                      <span className="bg-zinc-100 px-1 border border-zinc-200 rounded flex-inline items-center justify-center font-mono text-[9px] mr-1">{task.targetType}</span>
                                      {task.actionType}
                                    </td>
                                    <td className="px-2 py-2.5">{task.scheduleType}</td>
                                    <td className="px-2 py-2.5 font-mono text-zinc-500 max-w-[100px] truncate" title={task.content}>{task.content}</td>
                                    <td className="px-2 py-2.5 text-center font-black">
                                      <span className={`${task.status === '已启用' ? "text-[#10A66A] bg-emerald-50 border border-emerald-100" : "text-zinc-500 bg-zinc-100 border border-zinc-200"} px-1.5 py-0.5 rounded text-[10px]`}>
                                        {task.status}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2.5 text-right space-x-2 text-[#10A66A] font-bold">
                                       <button className="hover:underline" onClick={() => {
                                          const now = new Date();
                                          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                                          setTaskExecutionRecords(prev => [{
                                            id: `er-run-${Date.now()}`, time: timeStr, name: task.name, target: task.target, actionType: task.actionType, scheduleType: "手动执行", content: task.content, result: "成功", detail: "已立即触发执行一次"
                                          }, ...prev].slice(0, 20));
                                          showToast(`已立即执行任务：${task.name}`);
                                       }}>执行</button>
                                       <button className="hover:underline" onClick={() => {
                                          setDeviceTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, status: t.status === "已启用" ? "未启用" : "已启用" } : t));
                                       }}>{task.status === "已启用" ? <span className="text-zinc-400">停用</span> : "启用"}</button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Execution Records */}
                  <div className="col-span-5 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4 min-h-[350px]">
                     <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                        <h3 className="text-xs font-black text-zinc-800">任务执行记录</h3>
                        <button className="text-[10px] text-zinc-400 hover:text-zinc-600 font-bold bg-zinc-50 px-2 py-0.5 border rounded" onClick={() => setTaskExecutionRecords([])}>清空记录</button>
                     </div>
                     <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {taskExecutionRecords.map(rec => (
                           <div key={rec.id} className="flex gap-3 items-start p-3 bg-zinc-50/50 border border-zinc-100 rounded-lg hover:bg-zinc-100/50">
                              <span className="font-mono text-[10px] text-zinc-400 pt-0.5 whitespace-nowrap">{rec.time}</span>
                              <div className="flex-1 space-y-1">
                                 <p className="text-[11px] font-bold text-zinc-800 flex justify-between items-center">
                                    {rec.name}
                                    <span className={`text-[10px] font-bold ${rec.result === "成功" ? "text-[#10A66A]" : "text-amber-500"} px-1.5 py-0.5 rounded border ${rec.result === "成功" ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"}`}>
                                       {rec.result}
                                    </span>
                                 </p>
                                 <p className="text-[10px] text-zinc-500">
                                    {rec.target} · {rec.actionType}
                                 </p>
                                 <p className="text-[9px] text-zinc-400 font-mono break-all">{rec.content}</p>
                                 <p className={`text-[9px] mt-1 ${rec.result === "成功" ? "text-[#10A66A]" : "text-amber-600"}`}>&gt; {rec.detail}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* ===================================== */}
          {/* H. 任务日志页面 (TASK LOGS) */}
          {/* ===================================== */}
          {activeMenu === "task-log" && (
            <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto w-full animate-in fade-in duration-200">
               {/* Header */}
               <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                 <div className="space-y-0.5">
                   <h2 className="text-[15px] font-black text-zinc-800">任务日志</h2>
                   <p className="text-[11px] text-zinc-450 font-bold">查看设备任务调度相关的操作与系统自动执行日志。</p>
                 </div>
                 <button className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded hover:bg-zinc-100 font-bold text-xs" onClick={() => showToast("日志刷新成功")}>
                    刷新日志
                 </button>
               </div>

               <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex-1 font-sans flex flex-col">
                  {/* Filters could go here */}
                  <div className="flex items-center gap-4 mb-4 text-xs font-bold text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span>时间范围：</span>
                      <input type="date" className="border px-2 py-1 rounded outline-none" defaultValue={"2026-06-08"}/>
                    </div>
                    <div className="flex items-center gap-2">
                       <span>状态：</span>
                       <select className="border px-2 py-1 rounded outline-none w-24">
                          <option>全部</option>
                          <option>成功</option>
                          <option>异常</option>
                       </select>
                    </div>
                  </div>

                  <div className="border border-zinc-150 rounded-lg overflow-hidden text-[11px] flex-1">
                     <table className="w-full text-left divide-y divide-zinc-100 h-full">
                        <thead className="bg-[#FAFDFB] text-zinc-500 font-bold">
                           <tr>
                              <th className="px-4 py-3">日志时间</th>
                              <th className="px-4 py-3">任务名称</th>
                              <th className="px-4 py-3">操作类型</th>
                              <th className="px-4 py-3">操作对象</th>
                              <th className="px-4 py-3">执行结果</th>
                              <th className="px-4 py-3">详细信息</th>
                              <th className="px-4 py-3 text-right">操作人</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 bg-white text-zinc-600 font-medium whitespace-nowrap">
                           {taskLogs.map(log => (
                              <tr key={log.id} className="hover:bg-zinc-50">
                                 <td className="px-4 py-3 font-mono text-zinc-500">{log.time}</td>
                                 <td className="px-4 py-3 font-bold text-zinc-800">{log.name}</td>
                                 <td className="px-4 py-3">{log.opType}</td>
                                 <td className="px-4 py-3 max-w-[200px] truncate" title={log.target}>{log.target}</td>
                                 <td className="px-4 py-3 font-black">
                                    <span className={`${log.result === '成功' ? "text-[#10A66A]" : "text-amber-500"} flex items-center gap-1.5`}>
                                      {log.result === '成功' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                      {log.result}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3 font-mono text-zinc-500 max-w-[200px] truncate" title={log.detail}>{log.detail}</td>
                                 <td className="px-4 py-3 text-right font-bold text-zinc-400">{log.operator}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

          {/* ===================================== */}
          {/* H. 事件中心 (EVENT MANAGER) */}
          {/* ===================================== */}
          {activeMenu === "event-mgr" && (
            <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto w-full animate-in fade-in duration-200">
               {/* Header */}
               <div className="flex items-center justify-between pb-3 border-b border-zinc-200 shrink-0">
                 <div className="space-y-0.5">
                   <h2 className="text-[15px] font-black text-zinc-800">事件中心</h2>
                   <p className="text-[11px] text-zinc-450 font-bold">统一管理设备触发事件，查看已同步到事件中心的物模型事件及处理记录。</p>
                 </div>
                 <div className="flex gap-2 items-center">
                   <button onClick={() => handleTriggerEvent("temperatureHigh")} className="px-3 py-1.5 text-xs font-bold text-[#10A66A] bg-[#10A66A]/10 hover:bg-[#10A66A]/20 rounded-md transition-colors">触发温度过高事件</button>
                   <button onClick={() => handleTriggerEvent("gatewayOffline")} className="px-3 py-1.5 text-xs font-bold text-[#10A66A] bg-[#10A66A]/10 hover:bg-[#10A66A]/20 rounded-md transition-colors">触发网关离线事件</button>
                   <button onClick={() => handleTriggerEvent("co2Limit")} className="px-3 py-1.5 text-xs font-bold text-[#10A66A] bg-[#10A66A]/10 hover:bg-[#10A66A]/20 rounded-md transition-colors">触发 CO₂ 超限事件</button>
                   <button onClick={() => handleTriggerEvent("smokeAlarm")} className="px-3 py-1.5 text-xs font-bold text-[#10A66A] bg-[#10A66A]/10 hover:bg-[#10A66A]/20 rounded-md transition-colors">触发烟雾告警事件</button>
                 </div>
               </div>

               {/* Stats Cards */}
               <div className="grid grid-cols-6 gap-4 shrink-0">
                 {[
                   { label: "事件总数", value: eventCenterStats.total },
                   { label: "今日新增", value: eventCenterStats.today },
                   { label: "待处理", value: eventCenterStats.pending, color: "text-orange-600 bg-orange-50 border border-orange-200" },
                   { label: "已处理", value: eventCenterStats.processed },
                   { label: "已同步物模型事件", value: eventCenterStats.synced },
                   { label: "紧急事件", value: eventCenterStats.urgent, color: "text-red-500 bg-red-50 border border-red-200" }
                 ].map((stat, i) => (
                   <div key={i} className={`bg-white border border-zinc-200 rounded-xl p-4 flex flex-col gap-1 shadow-2xs ${stat.color || ''}`}>
                     <span className="text-[10px] text-zinc-500 font-bold">{stat.label}</span>
                     <div className="flex items-center justify-between">
                       <span className={`text-2xl font-black ${stat.color ? stat.color.split(' ')[0] : 'text-[#10A66A]'}`}>{stat.value}</span>
                     </div>
                   </div>
                 ))}
               </div>

               {/* Content Layout */}
               <div className="flex flex-col xl:flex-row gap-6 pb-8">
                 {/* Left Column: Device Events */}
                 <div className="flex-1 flex flex-col gap-6">
                   <div className="bg-white border border-zinc-200 rounded-xl flex flex-col shadow-2xs">
                     <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                       <h3 className="text-sm font-bold text-zinc-800">设备事件列表</h3>
                       <div className="flex items-center gap-2">
                         <select className="px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white outline-none focus:border-[#10A66A]" value={eventFilters.device} onChange={e => setEventFilters({...eventFilters, device: e.target.value})}>
                           <option value="全部设备">全部设备</option>
                           <option value="温湿度传感器">温湿度传感器</option>
                           <option value="光照传感器">光照传感器</option>
                           <option value="二氧化碳传感器">二氧化碳传感器</option>
                           <option value="Modbus网关">Modbus网关</option>
                           <option value="继电器">继电器</option>
                           <option value="风机">风机</option>
                           <option value="门禁控制器">门禁控制器</option>
                           <option value="烟雾传感器">烟雾传感器</option>
                           <option value="水浸传感器">水浸传感器</option>
                         </select>
                         <select className="px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white outline-none focus:border-[#10A66A]" value={eventFilters.type} onChange={e => setEventFilters({...eventFilters, type: e.target.value})}>
                           <option value="全部类型">全部类型</option>
                           <option value="温度异常">温度异常</option>
                           <option value="湿度异常">湿度异常</option>
                           <option value="光照异常">光照异常</option>
                           <option value="CO₂ 超限">CO₂ 超限</option>
                           <option value="设备离线">设备离线</option>
                           <option value="设备故障">设备故障</option>
                           <option value="状态变更">状态变更</option>
                           <option value="告警事件">告警事件</option>
                           <option value="服务调用事件">服务调用事件</option>
                         </select>
                         <select className="px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white outline-none focus:border-[#10A66A]" value={eventFilters.processStatus} onChange={e => setEventFilters({...eventFilters, processStatus: e.target.value})}>
                           <option value="全部状态">全部状态</option>
                           <option value="待处理">待处理</option>
                           <option value="处理中">处理中</option>
                           <option value="已处理">已处理</option>
                           <option value="已忽略">已忽略</option>
                         </select>
                         <select className="px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white outline-none focus:border-[#10A66A]" value={eventFilters.syncStatus} onChange={e => setEventFilters({...eventFilters, syncStatus: e.target.value})}>
                           <option value="全部">同步状态: 全部</option>
                           <option value="已同步">已同步</option>
                           <option value="未同步">未同步</option>
                         </select>
                       </div>
                     </div>
                     <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                       <table className="w-full text-left border-collapse">
                         <thead className="sticky top-0 bg-zinc-50 z-10 shadow-sm border-b border-zinc-100">
                           <tr>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">触发时间</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">事件名称</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">事件来源</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">设备</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">事件等级</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">同步状态</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">处理状态</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">操作</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-zinc-100/80 bg-white">
                           {filteredDeviceEvents.map((evt) => (
                             <tr key={evt.id} className={`group hover:bg-zinc-50/80 cursor-pointer ${selectedDeviceEvent?.id === evt.id ? 'bg-[#10A66A]/5' : ''}`} onClick={() => setSelectedDeviceEvent(evt)}>
                               <td className="p-3 text-xs font-medium text-zinc-600">{evt.time}</td>
                               <td className="p-3 text-xs text-zinc-700 font-bold">{evt.name}</td>
                               <td className="p-3 text-[11px] text-zinc-500">{evt.source}</td>
                               <td className="p-3 text-[11px] text-zinc-600">
                                 <div>{evt.deviceName}</div>
                                 <div className="text-[10px] text-zinc-400">{evt.deviceCode}</div>
                               </td>
                               <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${evt.level === '紧急' ? 'bg-red-50 text-red-600 border border-red-200' : evt.level === '重要' ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                                    {evt.level}
                                  </span>
                               </td>
                               <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${evt.syncStatus === '已同步' ? 'bg-[#EAF8F1] text-[#10A66A] border border-[#10A66A]/20' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>
                                    {evt.syncStatus}
                                  </span>
                               </td>
                               <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${evt.processStatus === '待处理' ? 'bg-orange-50 text-orange-600 border border-orange-200' : evt.processStatus === '处理中' ? 'bg-blue-50 text-blue-600 border border-blue-200' : evt.processStatus === '已处理' ? 'bg-[#EAF8F1] text-[#10A66A] border border-[#10A66A]/20' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>
                                    {evt.processStatus}
                                  </span>
                               </td>
                               <td className="p-3 text-right">
                                 <button className="text-[11px] font-bold text-[#10A66A] hover:text-[#0c8a58] px-2 py-1 rounded hover:bg-[#10A66A]/10 transition-colors">查看</button>
                               </td>
                             </tr>
                           ))}
                           {filteredDeviceEvents.length === 0 && (
                             <tr><td colSpan={8} className="p-8 text-center text-zinc-400 text-xs">暂无符合条件的事件记录</td></tr>
                           )}
                         </tbody>
                       </table>
                     </div>
                   </div>

                   {/* Thing Model Event Config */}
                   <div className="bg-white border border-zinc-200 rounded-xl flex flex-col shadow-2xs">
                     <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                       <h3 className="text-sm font-bold text-zinc-800 mb-1">物模型事件配置</h3>
                       <p className="text-[11px] text-zinc-500">配置设备物模型事件是否同步到事件中心，开启后事件触发时将自动生成事件记录。</p>
                     </div>
                     <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                       <table className="w-full text-left border-collapse">
                         <thead className="sticky top-0 bg-zinc-50 z-10 shadow-sm border-b border-zinc-100">
                           <tr>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">产品名称</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">物模型事件</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">事件标识符</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">事件等级</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">同步到事件中心</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">状态</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">操作</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-zinc-100/80 bg-white">
                           {thingModelEventConfigs.map((cfg) => (
                             <tr key={cfg.id} className="group hover:bg-zinc-50/80">
                               <td className="p-3 text-[11px] text-zinc-600">{cfg.product}</td>
                               <td className="p-3 text-xs text-zinc-700 font-bold">{cfg.name}</td>
                               <td className="p-3 text-[11px] font-mono text-zinc-500">{cfg.identifier}</td>
                               <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cfg.level === '紧急' ? 'bg-red-50 text-red-600 border border-red-200' : cfg.level === '重要' ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                                    {cfg.level}
                                  </span>
                               </td>
                               <td className="p-3">
                                 <button 
                                   onClick={() => {
                                      const newConfig = {...cfg, syncStatus: cfg.syncStatus === '开启' ? '关闭' : '开启'};
                                      setThingModelEventConfigs(thingModelEventConfigs.map(c => c.id === cfg.id ? newConfig : c));
                                      const now = new Date();
                                      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                                      setEventSyncRecords([{ id: `sr-new-${Date.now()}`, time: timeStr, product: cfg.product, name: cfg.name, identifier: cfg.identifier, action: newConfig.syncStatus === '开启' ? '开启同步' : '关闭同步', result: "成功", operator: "学生1" }, ...eventSyncRecords]);
                                      const newLog = { id: `tl-new-${Date.now()}`, time: timeStr, name: "物模型事件配置", opType: "规则变更", target: cfg.name, result: "成功", detail: `设为${newConfig.syncStatus}同步`, operator: "学生1" };
                                      setTaskLogs([newLog, ...taskLogs]);
                                   }}
                                   className={`w-9 h-5 rounded-full relative transition-colors focus:outline-none flex ${cfg.syncStatus === '开启' ? 'bg-[#10A66A]' : 'bg-zinc-300'}`}
                                 >
                                   <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow tracking-wide transition-transform ${cfg.syncStatus === '开启' ? 'translate-x-4' : 'translate-x-0'}`} />
                                 </button>
                               </td>
                               <td className="p-3">
                                 <div className="flex items-center gap-1.5">
                                   <div className={`w-1.5 h-1.5 rounded-full ${cfg.enableStatus === '已启用' ? 'bg-[#10A66A]' : 'bg-zinc-300'}`} />
                                   <span className="text-[11px] text-zinc-600">{cfg.enableStatus}</span>
                                 </div>
                               </td>
                               <td className="p-3 text-right">
                                 <button 
                                   onClick={() => setEditingThingModelEvent(cfg)}
                                   className="text-[11px] font-bold text-[#10A66A] hover:text-[#0c8a58] px-2 py-1 rounded hover:bg-[#10A66A]/10 transition-colors"
                                 >
                                    编辑
                                 </button>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </div>
                   
                   {/* Records Grid */}
                   <div className="grid grid-cols-2 gap-6">
                      {/* Processing Records */}
                      <div className="bg-white border border-zinc-200 rounded-xl flex flex-col shadow-2xs max-h-64 overflow-y-auto">
                        <div className="p-3 border-b border-zinc-100 bg-zinc-50/50 sticky top-0">
                          <h3 className="text-sm font-bold text-zinc-800">事件处理记录</h3>
                        </div>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-100">
                               <th className="p-2 pl-3 text-[10px] font-bold text-zinc-500">时间</th>
                               <th className="p-2 text-[10px] font-bold text-zinc-500">事件名称</th>
                               <th className="p-2 text-[10px] font-bold text-zinc-500">设备</th>
                               <th className="p-2 text-[10px] font-bold text-zinc-500">动作</th>
                               <th className="p-2 text-[10px] font-bold text-zinc-500">结果</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100/80 bg-white">
                            {eventProcessingRecords.map(r => (
                              <tr key={r.id}>
                                <td className="p-2 pl-3 text-[10px] font-medium text-zinc-500">{r.time}</td>
                                <td className="p-2 text-[11px] text-zinc-700">{r.name}</td>
                                <td className="p-2 text-[11px] text-zinc-600">{r.deviceName}</td>
                                <td className="p-2 text-[11px] text-[#10A66A] font-bold">{r.action}</td>
                                <td className="p-2 text-[10px] text-zinc-500">{r.result}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Sync Records */}
                      <div className="bg-white border border-zinc-200 rounded-xl flex flex-col shadow-2xs max-h-64 overflow-y-auto">
                        <div className="p-3 border-b border-zinc-100 bg-zinc-50/50 sticky top-0">
                          <h3 className="text-sm font-bold text-zinc-800">最近同步记录</h3>
                        </div>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-100">
                               <th className="p-2 pl-3 text-[10px] font-bold text-zinc-500">时间</th>
                               <th className="p-2 text-[10px] font-bold text-zinc-500">产品</th>
                               <th className="p-2 text-[10px] font-bold text-zinc-500">物模型事件</th>
                               <th className="p-2 text-[10px] font-bold text-zinc-500">同步动作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100/80 bg-white">
                            {eventSyncRecords.map(r => (
                              <tr key={r.id}>
                                <td className="p-2 pl-3 text-[10px] font-medium text-zinc-500">{r.time}</td>
                                <td className="p-2 text-[11px] text-zinc-700">{r.product}</td>
                                <td className="p-2 text-[11px] text-zinc-600">{r.name}</td>
                                <td className="p-2 text-[11px] text-[#10A66A] font-bold">{r.action}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </div>

                 </div>

                 {/* Right Column: Event Detail & Editing */}
                 <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-6">
                    {/* Event Detail */}
                    {selectedDeviceEvent ? (
                      <div className="bg-white border border-[#10A66A]/20 rounded-xl flex flex-col shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-[#10A66A]/10 bg-[#10A66A]/[0.02]">
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="text-sm font-bold text-zinc-800">事件详情</h3>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedDeviceEvent.level === '紧急' ? 'bg-red-50 text-red-600 border border-red-200' : selectedDeviceEvent.level === '重要' ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                               {selectedDeviceEvent.level}
                             </span>
                          </div>
                          <div className="text-xl font-bold text-zinc-900 mb-1">{selectedDeviceEvent.name}</div>
                          <div className="text-[11px] text-zinc-500">触发时间: {selectedDeviceEvent.time}</div>
                        </div>
                        <div className="p-4 space-y-4">
                           <div className="grid grid-cols-2 gap-3 text-xs">
                             <div><span className="text-zinc-500">设备名称</span><div className="font-bold text-zinc-800">{selectedDeviceEvent.deviceName}</div></div>
                             <div><span className="text-zinc-500">设备编号</span><div className="font-bold text-zinc-800">{selectedDeviceEvent.deviceCode}</div></div>
                             <div><span className="text-zinc-500">所属产品</span><div className="font-medium text-zinc-800">{selectedDeviceEvent.product}</div></div>
                             <div><span className="text-zinc-500">事件类型</span><div className="font-medium text-zinc-800">{selectedDeviceEvent.type}</div></div>
                             <div><span className="text-zinc-500">同步状态</span><div className="font-bold text-[#10A66A]">{selectedDeviceEvent.syncStatus}</div></div>
                             <div>
                               <span className="text-zinc-500">处理状态</span>
                               <div className={`font-bold ${selectedDeviceEvent.processStatus === '待处理' ? 'text-orange-600' : selectedDeviceEvent.processStatus === '已处理' ? 'text-[#10A66A]' : selectedDeviceEvent.processStatus === '处理中' ? 'text-blue-600' : 'text-zinc-500'}`}>
                                 {selectedDeviceEvent.processStatus}
                               </div>
                             </div>
                           </div>

                           <div className="space-y-1">
                             <span className="text-[10px] font-bold text-zinc-500 uppercase">触发条件</span>
                             <div className="text-xs bg-zinc-50 p-2 border border-zinc-100 rounded text-zinc-700 font-mono">{selectedDeviceEvent.condition}</div>
                           </div>
                           
                           <div className="space-y-1">
                             <span className="text-[10px] font-bold text-zinc-500 uppercase">事件内容</span>
                             <div className="text-xs text-zinc-700">{selectedDeviceEvent.content}</div>
                           </div>

                           <div className="space-y-1">
                             <span className="text-[10px] font-bold text-zinc-500 uppercase">处理建议</span>
                             <div className="text-xs text-orange-700 bg-orange-50 p-2 rounded border border-orange-100">{selectedDeviceEvent.suggestion}</div>
                           </div>

                           <div className="space-y-1">
                             <span className="text-[10px] font-bold text-zinc-500 uppercase">原始数据</span>
                             <pre className="text-[10px] bg-zinc-800 text-zinc-200 p-3 border border-zinc-700 rounded font-mono overflow-x-auto">
                               {selectedDeviceEvent.rawData}
                             </pre>
                           </div>

                           <div className="pt-3 border-t border-zinc-100 flex flex-wrap gap-2">
                             {selectedDeviceEvent.processStatus === '待处理' && (
                                <button onClick={() => handleProcessEvent("标记处理中")} className="flex-1 px-3 py-1.5 text-[11px] font-bold text-[#10A66A] bg-[#10A66A]/10 hover:bg-[#10A66A]/20 rounded transition-colors">标记处理中</button>
                             )}
                             {(selectedDeviceEvent.processStatus === '待处理' || selectedDeviceEvent.processStatus === '处理中') && (
                                <button onClick={() => handleProcessEvent("标记已处理")} className="flex-1 px-3 py-1.5 text-[11px] font-bold text-white bg-[#10A66A] hover:bg-[#0c8a58] rounded shadow-sm transition-colors">标记已处理</button>
                             )}
                             {selectedDeviceEvent.processStatus !== '已处理' && selectedDeviceEvent.processStatus !== '已忽略' && (
                                <button onClick={() => handleProcessEvent("忽略事件")} className="px-3 py-1.5 text-[11px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors">忽略</button>
                             )}
                             <button className="px-3 py-1.5 text-[11px] font-bold text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 rounded transition-colors">定位设备</button>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-xl flex items-center justify-center h-64 text-zinc-400 text-sm">
                        请选择一条设备事件查看详情
                      </div>
                    )}

                    {/* Editor Drawer / Box */}
                    {editingThingModelEvent && (
                      <div className="bg-white border border-blue-200 rounded-xl flex flex-col shadow-2xs overflow-hidden animate-in fade-in slide-in-from-right-4">
                        <div className="p-3 border-b border-blue-100 bg-blue-50/50 flex justify-between items-center">
                          <h3 className="text-sm font-bold text-zinc-800">编辑物模型事件配置</h3>
                          <button onClick={() => setEditingThingModelEvent(null)} className="text-zinc-400 hover:text-zinc-600 font-bold px-1">&times;</button>
                        </div>
                        <div className="p-4 space-y-4">
                           <div className="space-y-1 text-xs">
                             <div className="text-zinc-500 mb-1">产品名称: <span className="font-bold text-zinc-800">{editingThingModelEvent.product}</span></div>
                             <div className="text-zinc-500 mb-1">物模型事件: <span className="font-bold text-zinc-800">{editingThingModelEvent.name} ({editingThingModelEvent.identifier})</span></div>
                           </div>

                           <div className="space-y-1.5">
                             <label className="text-[10px] font-bold text-zinc-500 uppercase">同步到事件中心</label>
                             <div className="flex gap-2">
                               <button 
                                 onClick={() => setEditingThingModelEvent({...editingThingModelEvent, syncStatus: '开启'})}
                                 className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${editingThingModelEvent.syncStatus === '开启' ? 'bg-[#10A66A] text-white shadow-sm' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                               >
                                 开启
                               </button>
                               <button 
                                 onClick={() => setEditingThingModelEvent({...editingThingModelEvent, syncStatus: '关闭'})}
                                 className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${editingThingModelEvent.syncStatus === '关闭' ? 'bg-zinc-600 text-white shadow-sm' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                               >
                                 关闭
                               </button>
                             </div>
                           </div>

                           <div className="space-y-1.5">
                             <label className="text-[10px] font-bold text-zinc-500 uppercase">事件等级</label>
                             <select 
                               className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded bg-white outline-none focus:border-[#10A66A]"
                               value={editingThingModelEvent.level}
                               onChange={(e) => setEditingThingModelEvent({...editingThingModelEvent, level: e.target.value})}
                             >
                                <option value="一般">一般</option>
                                <option value="重要">重要</option>
                                <option value="紧急">紧急</option>
                             </select>
                           </div>

                           <div className="space-y-1.5">
                             <label className="text-[10px] font-bold text-zinc-500 uppercase">事件说明</label>
                             <textarea 
                               className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded bg-white outline-none focus:border-[#10A66A] min-h-[60px]"
                               value={editingThingModelEvent.description}
                               onChange={(e) => setEditingThingModelEvent({...editingThingModelEvent, description: e.target.value})}
                             />
                           </div>

                           <div className="pt-2 flex gap-2">
                             <button 
                               className="flex-1 py-1.5 rounded text-xs font-bold bg-[#10A66A] text-white hover:bg-[#0c8a58] transition-colors"
                               onClick={() => {
                                 setThingModelEventConfigs(thingModelEventConfigs.map(c => c.id === editingThingModelEvent.id ? editingThingModelEvent : c));
                                 setEditingThingModelEvent(null);
                                 alert("物模型事件配置已保存");
                               }}
                             >
                               保存配置
                             </button>
                             <button 
                               className="px-4 py-1.5 rounded text-xs font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
                               onClick={() => setEditingThingModelEvent(null)}
                             >
                               取消
                             </button>
                           </div>
                        </div>
                      </div>
                    )}
                 </div>
               </div>
            </div>
          )}

          {/* ===================================== */}
          {/* I. 3D 应用设计 (3D App Design) */}
          {/* ===================================== */}
          {activeMenu === "design-3d" && (
            <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto w-full animate-in fade-in duration-200">
               {/* Header */}
               <div className="flex items-center justify-between pb-3 border-b border-zinc-200 shrink-0">
                 <div className="space-y-0.5">
                   <h2 className="text-[15px] font-black text-zinc-800">3D 应用设计</h2>
                   <p className="text-[11px] text-zinc-450 font-bold">管理 3D 可视化应用，支持应用创建、设计、导入和导出。</p>
                 </div>
                 <div className="flex gap-2 items-center">
                   <button className="px-3 py-1.5 text-xs font-bold text-white bg-[#10A66A] hover:bg-[#0c8a58] rounded shadow-sm transition-colors">新建 3D 应用</button>
                   <button className="px-3 py-1.5 text-xs font-bold text-[#10A66A] bg-[#10A66A]/10 hover:bg-[#10A66A]/20 rounded transition-colors">导入应用</button>
                   <button className="px-3 py-1.5 text-xs font-bold text-[#10A66A] bg-[#10A66A]/10 hover:bg-[#10A66A]/20 rounded transition-colors">导出应用</button>
                   <button className="px-3 py-1.5 text-xs font-bold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 rounded transition-colors">复制应用</button>
                   <button className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors">删除应用</button>
                 </div>
               </div>

               {/* Stats Cards */}
               <div className="grid grid-cols-5 gap-4 shrink-0">
                 {[
                   { label: "3D 应用总数", value: threeDAppStats.total },
                   { label: "已发布应用", value: threeDAppStats.published },
                   { label: "草稿应用", value: threeDAppStats.drafts },
                   { label: "最近导入", value: threeDAppStats.recentImports },
                   { label: "最近导出", value: threeDAppStats.recentExports }
                 ].map((stat, i) => (
                   <div key={i} className={`bg-white border border-zinc-200 rounded-xl p-4 flex flex-col gap-1 shadow-2xs`}>
                     <span className="text-[10px] text-zinc-500 font-bold">{stat.label}</span>
                     <div className="flex items-center justify-between">
                       <span className="text-2xl font-black text-[#10A66A]">{stat.value}</span>
                     </div>
                   </div>
                 ))}
               </div>

               {/* Content Layout */}
               <div className="flex flex-col gap-6 pb-8">
                 
                 {/* 3D Apps List */}
                 <div className="bg-white border border-zinc-200 rounded-xl flex flex-col shadow-2xs shrink-0">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                       <h3 className="text-sm font-bold text-zinc-800">3D 应用列表</h3>
                    </div>
                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                       <table className="w-full text-left border-collapse">
                         <thead className="sticky top-0 bg-zinc-50 z-10 shadow-sm border-b border-zinc-100">
                           <tr>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">应用名称</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">应用类型</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">关联场景</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">设备数量</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">组件数量</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">应用状态</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">最近更新时间</th>
                             <th className="p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">操作</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-zinc-100/80 bg-white">
                           {threeDApps.map((app) => (
                             <tr key={app.id} className={`group hover:bg-zinc-50/80 cursor-pointer ${selectedThreeDApp?.id === app.id ? 'bg-[#10A66A]/5' : ''}`} onClick={() => setSelectedThreeDApp(app)}>
                               <td className="p-3 text-xs text-zinc-700 font-bold">{app.name}</td>
                               <td className="p-3 text-xs text-zinc-500">{app.type}</td>
                               <td className="p-3 text-xs text-zinc-600">{app.scene}</td>
                               <td className="p-3 text-xs font-mono text-zinc-600">{app.devices}</td>
                               <td className="p-3 text-xs font-mono text-zinc-600">{app.components}</td>
                               <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${app.status === '已发布' ? 'bg-[#EAF8F1] text-[#10A66A] border border-[#10A66A]/20' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>
                                    {app.status}
                                  </span>
                               </td>
                               <td className="p-3 text-[11px] text-zinc-500">{app.lastUpdated}</td>
                               <td className="p-3 text-right">
                                 <div className="flex justify-end gap-2">
                                     <button 
                                        className="text-[11px] font-bold text-[#10A66A] hover:text-[#0c8a58] px-2 py-1 rounded hover:bg-[#10A66A]/10 transition-colors"
                                        onClick={(e) => { e.stopPropagation(); onOpen3DDesigner?.({ view: 'editor' }); }}
                                     >设计</button>
                                     <button className="text-[11px] font-bold text-zinc-600 hover:text-zinc-800 px-2 py-1 rounded hover:bg-zinc-100 transition-colors">预览</button>
                                     <button 
                                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                        onClick={(e) => { e.stopPropagation(); setSelectedThreeDApp(app); }}
                                     >
                                        导出
                                     </button>
                                 </div>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                    </div>
                 </div>

                 {/* Import / Export Side by Side */}
                 <div className="flex flex-col xl:flex-row gap-6">
                   {/* Import Panel */}
                   <div className="flex-1 bg-white border border-[#10A66A]/30 rounded-xl flex flex-col shadow-2xs overflow-hidden h-[600px]">
                     <div className="p-4 border-b border-[#10A66A]/10 bg-[#10A66A]/5">
                        <h3 className="text-sm font-bold text-[#10A66A] mb-1">导入应用</h3>
                        <p className="text-[11px] text-zinc-500">上传或选择 3D 应用包，将场景、模型、组件、设备绑定和页面配置导入到当前平台。</p>
                     </div>
                     <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-5">
                       
                       {/* Upload Area */}
                       <div>
                          <div className="border border-dashed border-zinc-300 bg-zinc-50 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-zinc-100 transition-colors cursor-pointer">
                             <div className="w-10 h-10 rounded-full bg-[#EAF8F1] text-[#10A66A] flex items-center justify-center mb-2">
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                             </div>
                             <div className="text-xs font-bold text-zinc-700 mb-1">拖拽应用包到此处，或点击选择文件</div>
                             <div className="text-[10px] text-zinc-400">支持格式: 3D 应用包、JSON 配置包、ZIP 资源包</div>
                             <div className="mt-2 text-[10px] font-mono text-[#10A66A] bg-[#EAF8F1] px-2 py-0.5 rounded">greenhouse_3d_app.zip</div>
                          </div>
                          <div className="flex gap-2 mt-3">
                             <button 
                               className="flex-1 py-1.5 rounded text-xs font-bold bg-[#10A66A] text-white hover:bg-[#0c8a58] transition-colors"
                               onClick={() => {
                                  setImportConfig({...importConfig, parsed: true});
                                  setImportValidationResults({
                                    status: "校验通过",
                                    items: [
                                      { name: "应用配置文件", result: "通过" },
                                      { name: "3D 场景文件", result: "通过" },
                                      { name: "模型资源文件", result: "通过" },
                                      { name: "组件配置文件", result: "通过" },
                                      { name: "设备绑定关系", result: "通过" },
                                      { name: "数据源配置", result: "通过" },
                                      { name: "场景脚本", result: "通过" }
                                    ],
                                    warnings: [
                                      { content: "历史模型资源缺失", action: "提示", result: "已使用默认占位模型替换" }
                                    ]
                                  });
                                  const now = new Date();
                                  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                                  setImportExportRecords([{ id: `ie-new-${Date.now()}`, time: timeStr, type: "解析应用包", appName: importConfig.appName, file: "greenhouse_3d_app.zip", format: "3D 应用包", result: "成功", operator: "学生1" }, ...importExportRecords]);
                               }}
                             >
                               解析应用包
                             </button>
                             <button className="flex-1 py-1.5 rounded text-xs font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors">选择示例应用包</button>
                          </div>
                       </div>

                       {/* Configs */}
                       <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 text-xs">
                              <label className="text-zinc-500 font-bold block mb-1">应用名称</label>
                              <input 
                                type="text" 
                                className="w-full px-2 py-1.5 border border-zinc-200 rounded bg-white outline-none focus:border-[#10A66A] text-zinc-800" 
                                value={importConfig.appName}
                                onChange={(e) => setImportConfig({...importConfig, appName: e.target.value})}
                              />
                            </div>
                            <div className="space-y-1 text-xs">
                              <label className="text-zinc-500 font-bold block mb-1">导入目标</label>
                              <select 
                                className="w-full px-2 py-1.5 border border-zinc-200 rounded bg-white outline-none focus:border-[#10A66A] text-zinc-800"
                                value={importConfig.target}
                                onChange={(e) => setImportConfig({...importConfig, target: e.target.value})}
                              >
                                <option value="新建应用">新建应用</option>
                                <option value="覆盖已有应用">覆盖已有应用</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-xs">
                             <label className="text-zinc-500 font-bold block mb-1">冲突处理</label>
                             <div className="flex gap-4">
                               {["自动重命名", "覆盖配置", "跳过冲突项"].map(opt => (
                                 <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                                   <input 
                                     type="radio" 
                                     name="conflict" 
                                     value={opt} 
                                     checked={importConfig.conflict === opt}
                                     onChange={(e) => setImportConfig({...importConfig, conflict: e.target.value})}
                                     className="accent-[#10A66A]"
                                   />
                                   <span className="text-zinc-700">{opt}</span>
                                 </label>
                               ))}
                             </div>
                          </div>

                          <div className="pt-2 border-t border-zinc-200 grid grid-cols-2 gap-y-2">
                             {[
                               {k: "models", label: "导入模型资源"},
                               {k: "devices", label: "导入设备绑定"},
                               {k: "dataSources", label: "导入数据源配置"},
                               {k: "scripts", label: "导入场景脚本"}
                             ].map((item) => (
                               <div key={item.k} className="flex justify-between items-center pr-4">
                                 <span className="text-xs text-zinc-600">{item.label}</span>
                                 <button 
                                   onClick={() => setImportConfig({...importConfig, [item.k]: !(importConfig as any)[item.k]})}
                                   className={`w-7 h-4 rounded-full relative transition-colors focus:outline-none flex ${(importConfig as any)[item.k] ? 'bg-[#10A66A]' : 'bg-zinc-300'}`}
                                 >
                                   <span className={`absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-white shadow transition-transform ${(importConfig as any)[item.k] ? 'translate-x-[12px]' : 'translate-x-0'}`} />
                                 </button>
                               </div>
                             ))}
                          </div>
                       </div>
                       
                       <div className="mt-auto flex gap-2">
                          <button 
                            className={`flex-1 py-2 rounded text-xs font-bold transition-colors ${importConfig.parsed ? 'bg-[#10A66A] text-white hover:bg-[#0c8a58] shadow-sm' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                            disabled={!importConfig.parsed}
                            onClick={() => {
                               const now = new Date();
                               const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                               
                               const newApp = {
                                 id: `3d-new-${Date.now()}`,
                                 name: importConfig.appName,
                                 type: "三维场景",
                                 scene: "智慧温室",
                                 devices: 6,
                                 components: 18,
                                 status: "草稿",
                                 lastUpdated: timeStr
                               };
                               setThreeDApps([newApp, ...threeDApps]);
                               setImportExportRecords([{ id: `ie-new2-${Date.now()}`, time: timeStr, type: "导入应用", appName: importConfig.appName, file: "greenhouse_3d_app.zip", format: "3D 应用包", result: "成功", operator: "学生1" }, ...importExportRecords]);
                               
                               alert("应用导入成功");
                            }}
                          >
                            确认导入
                          </button>
                          <button 
                            className="px-4 py-2 rounded text-xs font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
                            onClick={() => { setImportConfig({...importConfig, parsed: false}); setImportValidationResults(null); }}
                          >
                            取消导入
                          </button>
                       </div>
                     </div>
                   </div>

                   {/* Import Validation & Package Content */}
                   <div className="w-full xl:w-[320px] flex gap-6 flex-col">
                      <div className="flex-1 bg-white border border-zinc-200 rounded-xl flex flex-col shadow-2xs overflow-hidden h-[300px]">
                         <div className="p-3 border-b border-zinc-100 bg-zinc-50/50 relative">
                           <div className="absolute right-3 text-[10px] text-zinc-400 font-mono">v1.0.0</div>
                           <h3 className="text-sm font-bold text-zinc-800 mb-0.5">应用包内容预览</h3>
                           <p className="text-[11px] text-[#10A66A] font-bold truncate pr-10">智慧温室 3D 监控应用</p>
                         </div>
                         <div className="p-3 overflow-y-auto space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                              <div><span className="text-zinc-500">应用类型:</span> <span className="font-bold text-zinc-800">3D 可视化应用</span></div>
                              <div><span className="text-zinc-500">场景数量:</span> <span className="font-bold text-zinc-800">1</span></div>
                              <div><span className="text-zinc-500">模型资源:</span> <span className="font-bold text-zinc-800">12 个</span></div>
                              <div><span className="text-zinc-500">组件数量:</span> <span className="font-bold text-zinc-800">18 个</span></div>
                              <div><span className="text-zinc-500">设备绑定:</span> <span className="font-bold text-zinc-800">6 个</span></div>
                              <div><span className="text-zinc-500">数据源:</span> <span className="font-bold text-zinc-800">4 个</span></div>
                              <div><span className="text-zinc-500">场景脚本:</span> <span className="font-bold text-zinc-800">3 个</span></div>
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">应用包内容清单</div>
                              {[
                                { file: "scene.json", type: "场景配置", status: "已识别" },
                                { file: "models/greenhouse.glb", type: "温室模型", status: "已识别" },
                                { file: "models/fan.glb", type: "风机模型", status: "已识别" },
                                { file: "components/dashboard.json", type: "数据面板组件", status: "已识别" },
                                { file: "bindings/devices.json", type: "设备绑定配置", status: "已识别" },
                                { file: "scripts/interaction.js", type: "交互脚本", status: "已识别" },
                              ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[10px] p-1.5 bg-zinc-50 border border-zinc-100 rounded">
                                  <div className="flex flex-col">
                                    <span className="font-mono text-zinc-700">{item.file}</span>
                                    <span className="text-zinc-400">{item.type}</span>
                                  </div>
                                  <span className="px-1.5 py-0.5 rounded bg-[#EAF8F1] text-[#10A66A] font-bold">{item.status}</span>
                                </div>
                              ))}
                            </div>
                         </div>
                      </div>

                      <div className="bg-white border border-zinc-200 rounded-xl flex flex-col shadow-2xs h-[276px]">
                         <div className="p-3 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                           <h3 className="text-sm font-bold text-zinc-800">导入校验结果</h3>
                           {importValidationResults && (
                             <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF8F1] text-[#10A66A]">{importValidationResults.status}</span>
                           )}
                         </div>
                         <div className="p-3 flex-1 overflow-y-auto">
                            {!importValidationResults ? (
                               <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-xs">
                                 <div>等待解析应用包...</div>
                               </div>
                            ) : (
                               <div className="space-y-4">
                                 <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                                     {importValidationResults.items.map((it:any, idx:number) => (
                                       <div key={idx} className="flex justify-between items-center text-[10px] bg-zinc-50 p-1.5 rounded border border-zinc-100">
                                          <span className="text-zinc-600 font-medium">{it.name}</span>
                                          <span className="font-bold text-[#10A66A]">{it.result}</span>
                                       </div>
                                     ))}
                                 </div>
                                 <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-orange-600 uppercase">校验提示</div>
                                    {importValidationResults.warnings.map((w:any, idx:number) => (
                                      <div key={idx} className="bg-orange-50 border border-orange-100 p-2 rounded flex flex-col gap-1">
                                         <div className="flex justify-between items-start">
                                           <span className="text-[11px] font-bold text-orange-800">{w.content}</span>
                                           <span className="text-[9px] px-1 bg-orange-100 text-orange-600 rounded">{w.action}</span>
                                         </div>
                                         <span className="text-[10px] text-orange-600">{w.result}</span>
                                      </div>
                                    ))}
                                 </div>
                                 <div className="flex gap-2">
                                    <button className="flex-1 py-1.5 rounded text-[11px] font-bold border border-[#10A66A]/30 text-[#10A66A] bg-[#10A66A]/5 hover:bg-[#10A66A]/10 transition-colors">重新校验</button>
                                    <button className="flex-1 py-1.5 rounded text-[11px] font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors">查看详情</button>
                                 </div>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>

                   {/* Export Panel */}
                   <div className="flex-1 bg-white border border-blue-200 rounded-xl flex flex-col shadow-2xs overflow-hidden h-[600px]">
                      <div className="p-4 border-b border-blue-100 bg-blue-50/30">
                        <h3 className="text-sm font-bold text-blue-600 mb-1">导出应用</h3>
                        <p className="text-[11px] text-zinc-500">将当前 3D 应用的场景、模型、组件、设备绑定和数据源配置打包导出。</p>
                      </div>
                      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-5">
                         
                         {/* Selection Target */}
                         <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                            <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">当前选中应用</div>
                            <div className="text-sm font-bold text-zinc-800">{selectedThreeDApp?.name || "-"}</div>
                            <div className="text-[11px] text-zinc-500 mt-0.5">包含完整场景和资源配置。</div>
                         </div>
                         
                         {/* Export Options */}
                         <div className="space-y-3">
                            <div className="text-xs font-bold text-zinc-700">导出内容</div>
                            <div className="grid grid-cols-2 gap-3 text-xs text-zinc-600">
                               {[
                                 {k: "scene", label: "场景配置 (1)"},
                                 {k: "models", label: `3D 模型资源 (${selectedThreeDApp?.components || 0})`},
                                 {k: "components", label: `组件配置 (${selectedThreeDApp?.components || 0})`},
                                 {k: "devices", label: `设备绑定 (${selectedThreeDApp?.devices || 0})`},
                                 {k: "dataSources", label: "数据源配置"},
                                 {k: "scripts", label: "场景脚本"},
                                 {k: "meta", label: "应用元信息"},
                               ].map((item) => (
                                 <label key={item.k} className="flex items-center gap-2 cursor-pointer">
                                   <input 
                                     type="checkbox" 
                                     className="w-3.5 h-3.5 accent-[#10A66A] rounded-sm" 
                                     checked={(exportConfig as any)[item.k]}
                                     onChange={(e) => setExportConfig({...exportConfig, [item.k]: e.target.checked})}
                                   />
                                   <span>{item.label}</span>
                                 </label>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-3">
                            <div className="text-xs font-bold text-zinc-700">导出格式</div>
                            <div className="flex gap-4">
                               {["3D 应用包", "JSON 配置包", "ZIP 资源包"].map(opt => (
                                 <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-xs">
                                   <input 
                                     type="radio" 
                                     name="exportFormat" 
                                     value={opt} 
                                     checked={exportConfig.format === opt}
                                     onChange={(e) => setExportConfig({...exportConfig, format: e.target.value})}
                                     className="accent-[#10A66A]"
                                   />
                                   <span className="text-zinc-700">{opt}</span>
                                 </label>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">导出文件名</label>
                            <input 
                              type="text" 
                              className="w-full px-2 py-1.5 text-xs font-mono border border-zinc-200 rounded bg-zinc-50 outline-none text-zinc-600" 
                              readOnly
                              value={`${selectedThreeDApp ? selectedThreeDApp.name.replace(/\s/g, '_').toLowerCase() : 'app'}_v1.0.0${exportConfig.format === 'JSON 配置包' ? '.json' : '.zip'}`}
                            />
                            <div className="text-[10px] text-zinc-400">版本号: v1.0.0</div>
                         </div>
                         
                         <div className="mt-auto">
                            {!exportResult ? (
                              <button 
                                className="w-full py-2 rounded text-xs font-bold bg-[#10A66A] text-white hover:bg-[#0c8a58] transition-colors shadow-sm"
                                disabled={!selectedThreeDApp}
                                onClick={() => {
                                  const now = new Date();
                                  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                                  setExportResult({
                                    status: "已生成",
                                    time: timeStr,
                                    size: "18.6 MB",
                                    fileName: `${selectedThreeDApp.name.replace(/\s/g, '_').toLowerCase()}_v1.0.0${exportConfig.format === 'JSON 配置包' ? '.json' : '.zip'}`,
                                    validation: "导出包完整"
                                  });
                                }}
                              >
                                {selectedThreeDApp ? "生成导出包" : "请先选择应用"}
                              </button>
                            ) : (
                              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 space-y-3">
                                 <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-zinc-800">导出已就绪</span>
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EAF8F1] text-[#10A66A]">已生成</span>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div><span className="text-zinc-500">文件名称:</span> <div className="font-mono text-zinc-700 truncate" title={exportResult.fileName}>{exportResult.fileName}</div></div>
                                    <div><span className="text-zinc-500">文件大小:</span> <div className="font-bold text-zinc-800">{exportResult.size}</div></div>
                                    <div><span className="text-zinc-500">生成时间:</span> <div className="font-bold text-zinc-800">{exportResult.time}</div></div>
                                    <div><span className="text-zinc-500">校验结果:</span> <div className="font-bold text-[#10A66A]">{exportResult.validation}</div></div>
                                 </div>
                                 <div className="flex gap-2 pt-1 border-t border-zinc-200">
                                    <button 
                                      className="flex-1 py-1.5 rounded text-xs font-bold bg-[#10A66A] text-white hover:bg-[#0c8a58] transition-colors shadow-sm"
                                      onClick={() => {
                                          const now = new Date();
                                          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                                          setImportExportRecords([{ id: `ie-new3-${Date.now()}`, time: timeStr, type: "导出应用", appName: selectedThreeDApp.name, file: exportResult.fileName, format: exportConfig.format, result: "成功", operator: "学生1" }, ...importExportRecords]);
                                          alert("导出包已准备完成");
                                          setExportResult(null);
                                      }}
                                    >
                                      下载导出包
                                    </button>
                                    <button 
                                      className="flex-1 py-1.5 rounded text-xs font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
                                      onClick={() => {
                                        alert("导出信息已复制");
                                      }}
                                    >
                                      复制信息
                                    </button>
                                 </div>
                              </div>
                            )}
                         </div>

                      </div>
                   </div>
                 </div>

                 {/* Import Export Records */}
                 <div className="bg-white border border-zinc-200 rounded-xl flex flex-col shadow-2xs shrink-0">
                    <div className="p-3 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                       <h3 className="text-sm font-bold text-zinc-800">导入导出记录</h3>
                       <div className="text-[10px] text-zinc-400">仅展示最近 50 条操作记录</div>
                    </div>
                    <div className="overflow-x-auto max-h-[240px] overflow-y-auto">
                       <table className="w-full text-left border-collapse">
                         <thead className="sticky top-0 bg-white z-10 shadow-sm border-b border-zinc-100">
                           <tr>
                             <th className="p-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-4">时间</th>
                             <th className="p-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">操作类型</th>
                             <th className="p-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">应用名称</th>
                             <th className="p-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">文件名称</th>
                             <th className="p-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">文件格式</th>
                             <th className="p-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">操作人</th>
                             <th className="p-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">结果</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-zinc-100/80 bg-white">
                           {importExportRecords.map((r) => (
                             <tr key={r.id} className="hover:bg-zinc-50/50">
                               <td className="p-2.5 text-xs text-zinc-500 font-medium pl-4">{r.time}</td>
                               <td className="p-2.5 text-xs font-bold text-[#10A66A]">{r.type}</td>
                               <td className="p-2.5 text-[11px] text-zinc-700 font-bold">{r.appName}</td>
                               <td className="p-2.5 text-[11px] font-mono text-zinc-500">{r.file}</td>
                               <td className="p-2.5 text-[11px] text-zinc-600">{r.format}</td>
                               <td className="p-2.5 text-[11px] text-zinc-600">{r.operator}</td>
                               <td className="p-2.5">
                                 <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EAF8F1] text-[#10A66A]">
                                   {r.result}
                                 </span>
                               </td>
                             </tr>
                           ))}
                           {importExportRecords.length === 0 && (
                             <tr><td colSpan={7} className="p-8 text-center text-zinc-400 text-xs">暂无操作记录</td></tr>
                           )}
                         </tbody>
                       </table>
                    </div>
                 </div>

               </div>
            </div>
          )}

          {!["overview", "product", "device", "simulation", "scene-linkage", "task-mgr", "task-log", "event-mgr", "design-3d"].includes(activeMenu) && (
            <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center max-w-xl mx-auto shadow-2xs space-y-4 my-8 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#10A66A] border border-emerald-150/40 flex items-center justify-center mx-auto text-xl font-bold">
                i
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-zinc-800">
                  {activeMenu === "asset" && "资产管理控制台"}
                  {activeMenu === "project" && "项目管理（应用接入）"}
                  {activeMenu === "design-2d" && "2D 应用可视化设计空间"}
                  {activeMenu === "design-3d" && "3D 工业应用编辑器"}
                  {activeMenu === "design-virtual" && "虚拟应用及仿真组态"}
                  {activeMenu === "dev-debug" && "物理网关设备调试中心"}
                  {activeMenu === "api-debug" && "接口能力与调试代理"}
                  {activeMenu === "task-mgr" && "任务分配与批处理"}
                  {activeMenu === "task-log" && "系统离线物理任务历史日志"}
                  {activeMenu === "event-mgr" && "联动拦截器与报警策略事件"}
                  {activeMenu === "trigger-mgr" && "触发器控制链管理器"}
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  当前处于实训大纲推荐的教学体验范围。你可以随时使用顶部的“平台总览”、“产品管理”、“设备管理”以及“数据仿真”页面，它们已完整打模并对接了底层的工程物理运动模拟环境。
                </p>
              </div>
              <div className="pt-2 select-none">
                <button 
                  onClick={() => setActiveMenu("overview")}
                  className="px-4.5 py-2 bg-[#10A66A] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-lg cursor-pointer transition-all shadow-xs"
                >
                  返回平台总览
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
