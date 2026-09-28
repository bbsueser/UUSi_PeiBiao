import React, { useState, useEffect, useRef } from "react";
import { 
  Home, RotateCcw, Power, Maximize2, Minimize2, Monitor, FilePlus, 
  Upload, Download, Undo, Redo, ZoomIn, Search, ChevronDown, 
  ChevronRight, Send, Camera, Layers, Settings, X, BookOpen, Clock, 
  User, Eye, EyeOff, FileText, AlertCircle, Plus, Trash2, 
  CheckCircle2, PlayCircle, Activity, Sliders, Bell, Cpu, 
  RefreshCw, TrendingUp, LayoutDashboard, Play, Square
} from "lucide-react";
import { deviceLibraryData, categoryConfig } from "../data/deviceLibrary";
import type { DeviceLibraryItem } from "../data/deviceLibrary";

interface ExperimentEnvironmentClientProps {
  envId: string;
  onClose?: () => void;
  showToast: (msg: string) => void;
  isEmbedded?: boolean;
}

interface ScreenshotRecord {
  id: string;
  name: string;
  time: string;
  source: string;
}

interface ApplicationItem {
  id: string;
  name: string;
  description: string;
  type: "数据监控" | "智能控制" | "环境集成";
  status: "草稿" | "已发布";
  createTime: string;
  config: {
    title: string;
    refreshRate: number;
    sensorBind: string;
    showChart: boolean;
    showControl: boolean;
    thresholdValue: number;
    alarmTriggered: boolean;
  }
}

export default function ExperimentEnvironmentClient({ 
  envId, 
  onClose, 
  showToast,
  isEmbedded = false
}: ExperimentEnvironmentClientProps) {
  
  // 1. Core view states
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState<boolean>(false);
  const [isNavHidden, setIsNavHidden] = useState<boolean>(false);
  const [isManualHidden, setIsManualHidden] = useState<boolean>(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);
  
  // 2. Local interactive states
  const [environmentStatus, setEnvironmentStatus] = useState<"运行中" | "已关闭" | "启动中">("运行中");
  const [sessionDuration, setSessionDuration] = useState<number>(764); // 00:12:44
  const [selectedManualTab, setSelectedManualTab] = useState<string>("intro");
  const [learningNotes, setLearningNotes] = useState<string>("【实验笔记】\n工程离线仿真连线完成，已配置Modbus控制器。\n- 温湿度采集频率正常，状态反馈良好。\n");
  const [showCloseConfirm, setShowCloseConfirm] = useState<boolean>(false);
  const [activeScreenshotPreview, setActiveScreenshotPreview] = useState<ScreenshotRecord | null>(null);
  const [expandedCats, setExpandedCats] = useState<string[]>(["⭐ 当前场景推荐设备", "传感器", "环境参数"]);
  
  // 3. Simulated Device Attributes State
  const [selectedNode, setSelectedNode] = useState<string>("温湿度传感器");
  const [deviceIp, setDeviceIp] = useState<string>("192.168.1.18");
  const [baudRate, setBaudRate] = useState<string>("9600");
  const [reportInterval, setReportInterval] = useState<number>(1000);
  const [gpioPin, setGpioPin] = useState<string>("GPIO_PIN_1");
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  // 4. Custom Wiring History
  const [wires, setWires] = useState<string[]>([
    "Modbus网关 ──► 温湿度仿真控制器 [通道1: 正常]",
    "控制器 DATA ──► 网关 GPIO_PIN_1 [已校验通]"
  ]);

  // 5. Screenshot tracking list
  const [screenshotRecords, setScreenshotRecords] = useState<ScreenshotRecord[]>([
    {
      id: "sc-1",
      name: "工程虚拟仿真_截屏_001",
      time: "2026-06-03 10:35:20",
      source: "工程虚拟仿真实验环境"
    }
  ]);

  // 6. AI assistant interactive logs
  const [aiInput, setAiInput] = useState<string>("");
  const [aiMessages, setAiMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "同学你好，我是实验智能助手。在工程仿真实训中如果遇到连线或芯片通道配置疑问，都可以向我提问！" }
  ]);

  // 7. Console Terminal Tabs
  const [activeConsoleTab, setActiveConsoleTab] = useState<"comm" | "wires" | "logs" | "checkLogs">("comm");
  const [isConsoleExpanded, setIsConsoleExpanded] = useState<boolean>(true);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[SYSTEM] 适配驱动库: modbus_rtu_master 启动完成",
    "[INFO] [校验端口] 连接正常. 节点 192.168.1.1 正在推送环境参数",
    "[DATA] 传递状态：200 OK | 当前时间差：0ms | 输出数据流：HEX [1A 2B 3C ... ]",
    "[WARN] 通讯周期暂无超时响应. 正在等待下一数据帧 (1000ms)"
  ]);

  // === 连线检测相关本地状态 ===
  const [lineValidationEnabled, setLineValidationEnabled] = useState<boolean>(true);
  const [lineCheckStatus, setLineCheckStatus] = useState<"未检测" | "检测中" | "检测完成" | "验证已关闭">("未检测");
  const [hasRepaired, setHasRepaired] = useState<boolean>(false);
  const [selectedConnId, setSelectedConnId] = useState<string | null>(null);
  const [showRepairCard, setShowRepairCard] = useState<boolean>(false);
  const [locateHighlighted, setLocateHighlighted] = useState<boolean>(false);
  const [repairAnimationActive, setRepairAnimationActive] = useState<boolean>(false);

  // 用户指定的本地状态定义
  interface ConnectionItem {
    id: string;
    status: "正常" | "异常" | "待复检";
    fromDev: string;
    fromPort: string;
    toDev: string;
    toPort: string;
    checkResult: "通过" | "未通过";
    detail: string;
    advice: string;
  }

  const initialConnections: ConnectionItem[] = [
    { id: "conn-1", status: "正常", fromDev: "温湿度传感器", fromPort: "DATA", toDev: "Modbus网关", toPort: "DI1", checkResult: "通过", detail: "数据线连接正确", advice: "无需处理" },
    { id: "conn-2", status: "正常", fromDev: "光照传感器", fromPort: "AO", toDev: "Modbus网关", toPort: "AI1", checkResult: "通过", detail: "模拟量输入连接正确", advice: "无需处理" },
    { id: "conn-3", status: "正常", fromDev: "Modbus网关", fromPort: "MQTT", toDev: "云平台节点", toPort: "Topic", checkResult: "通过", detail: "通信链路连接正确", advice: "无需处理" },
    { id: "conn-4", status: "异常", fromDev: "继电器", fromPort: "OUT", toDev: "风机", toPort: "IN", checkResult: "未通过", detail: "风机缺少供电线路", advice: "请将电源模块 VCC、GND 分别连接到风机供电端" }
  ];

  const [connectionList, setConnectionList] = useState<ConnectionItem[]>(initialConnections);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionItem | null>(null);
  const [highlightedConnectionId, setHighlightedConnectionId] = useState<string | null>(null);
  const [repairSuggestions, setRepairSuggestions] = useState<string>("");

  const [operationLogs, setOperationLogs] = useState<string[]>([
    "10:25:01｜开启虚拟仿真实验环境",
    "10:25:30｜加载‘智慧温室自动化控制工程’模板"
  ]);

  const addOperationLog = (msg: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setOperationLogs(prev => [`${timeStr}｜${msg}`, ...prev]);
  };

  // === 传感器模拟数据生成相关本地状态 ===
  const [selectedSensor, setSelectedSensor] = useState<string>("温湿度传感器");
  
  // 基础元数据
  const SENSOR_META: Record<string, {
    type: string;
    code: string;
    protocol: string;
    unit: Record<string, string>;
    items: string[];
  }> = {
    "温湿度传感器": {
      type: "有线传感器",
      code: "sensor-temp-001",
      protocol: "RS485",
      unit: { "温度": "℃", "湿度": "%" },
      items: ["温度", "湿度"]
    },
    "光照传感器": {
      type: "本安型传感器",
      code: "sensor-light-001",
      protocol: "AO信号/模拟电压",
      unit: { "光照强度": "Lux" },
      items: ["光照强度"]
    },
    "二氧化碳传感器": {
      type: "红外分析传感器",
      code: "sensor-co2-001",
      protocol: "Modbus RTU",
      unit: { "二氧化碳浓度": "ppm" },
      items: ["二氧化碳浓度"]
    },
    "土壤湿度传感器": {
      type: "高灵敏度传感器",
      code: "sensor-soil-001",
      protocol: "AI模拟量输出",
      unit: { "土壤湿度": "%" },
      items: ["土壤湿度"]
    },
    "烟雾传感器": {
      type: "电化学式传感器",
      code: "sensor-smoke-001",
      protocol: "开关量/模拟量",
      unit: { "烟雾浓度": "mg/m³" },
      items: ["烟雾浓度"]
    }
  };

  interface SensorConfig {
    mode: "定值" | "随机值" | "循环值";
    // 定值
    fixedTemp: number;
    fixedHum: number;
    fixedLight: number;
    fixedCo2: number;
    fixedSoil: number;
    fixedSmoke: number;
    // 随机值
    tempMin: number;
    tempMax: number;
    humMin: number;
    humMax: number;
    lightMin: number;
    lightMax: number;
    co2Min: number;
    co2Max: number;
    soilMin: number;
    soilMax: number;
    smokeMin: number;
    smokeMax: number;
    decimals: number;
    // 循环值
    tempSeq: number[];
    humSeq: number[];
    lightSeq: number[];
    co2Seq: number[];
    soilSeq: number[];
    smokeSeq: number[];
    interval: number; // 秒为单位
  }

  const defaultSensorDataConfig: Record<string, SensorConfig> = {
    "温湿度传感器": {
      mode: "定值",
      fixedTemp: 24.6,
      fixedHum: 58.0,
      fixedLight: 450,
      fixedCo2: 620,
      fixedSoil: 36,
      fixedSmoke: 0.03,
      tempMin: 20,
      tempMax: 35,
      humMin: 40,
      humMax: 80,
      lightMin: 100,
      lightMax: 1000,
      co2Min: 400,
      co2Max: 1200,
      soilMin: 20,
      soilMax: 60,
      smokeMin: 0.01,
      smokeMax: 0.15,
      decimals: 1,
      tempSeq: [22, 24, 26, 28, 26, 24],
      humSeq: [50, 55, 60, 65, 60, 55],
      lightSeq: [200, 400, 600, 800, 600, 400],
      co2Seq: [450, 550, 650, 750, 850, 950],
      soilSeq: [30, 35, 40, 45, 50, 55],
      smokeSeq: [0.02, 0.04, 0.06, 0.08, 0.10, 0.05],
      interval: 2
    },
    "光照传感器": {
      mode: "定值",
      fixedTemp: 24.6,
      fixedHum: 58.0,
      fixedLight: 450,
      fixedCo2: 620,
      fixedSoil: 36,
      fixedSmoke: 0.03,
      tempMin: 20,
      tempMax: 35,
      humMin: 40,
      humMax: 80,
      lightMin: 100,
      lightMax: 1000,
      co2Min: 400,
      co2Max: 1200,
      soilMin: 20,
      soilMax: 60,
      smokeMin: 0.01,
      smokeMax: 0.15,
      decimals: 1,
      tempSeq: [22, 24, 26, 28, 26, 24],
      humSeq: [50, 55, 60, 65, 60, 55],
      lightSeq: [200, 400, 600, 800, 600, 400],
      co2Seq: [450, 550, 650, 750, 850, 950],
      soilSeq: [30, 35, 40, 45, 50, 55],
      smokeSeq: [0.02, 0.04, 0.06, 0.08, 0.10, 0.05],
      interval: 2
    },
    "二氧化碳传感器": {
      mode: "定值",
      fixedTemp: 24.6,
      fixedHum: 58.0,
      fixedLight: 450,
      fixedCo2: 620,
      fixedSoil: 36,
      fixedSmoke: 0.03,
      tempMin: 20,
      tempMax: 35,
      humMin: 40,
      humMax: 80,
      lightMin: 100,
      lightMax: 1000,
      co2Min: 400,
      co2Max: 1200,
      soilMin: 20,
      soilMax: 60,
      smokeMin: 0.01,
      smokeMax: 0.15,
      decimals: 1,
      tempSeq: [22, 24, 26, 28, 26, 24],
      humSeq: [50, 55, 60, 65, 60, 55],
      lightSeq: [200, 400, 600, 800, 600, 400],
      co2Seq: [450, 550, 650, 750, 850, 950],
      soilSeq: [30, 35, 40, 45, 50, 55],
      smokeSeq: [0.02, 0.04, 0.06, 0.08, 0.10, 0.05],
      interval: 2
    },
    "土壤湿度传感器": {
      mode: "定值",
      fixedTemp: 24.6,
      fixedHum: 58.0,
      fixedLight: 450,
      fixedCo2: 620,
      fixedSoil: 36,
      fixedSmoke: 0.03,
      tempMin: 20,
      tempMax: 35,
      humMin: 40,
      humMax: 80,
      lightMin: 100,
      lightMax: 1000,
      co2Min: 400,
      co2Max: 1200,
      soilMin: 20,
      soilMax: 60,
      smokeMin: 0.01,
      smokeMax: 0.15,
      decimals: 1,
      tempSeq: [22, 24, 26, 28, 26, 24],
      humSeq: [50, 55, 60, 65, 60, 55],
      lightSeq: [200, 400, 600, 800, 600, 400],
      co2Seq: [450, 550, 650, 750, 850, 950],
      soilSeq: [30, 35, 40, 45, 50, 55],
      smokeSeq: [0.02, 0.04, 0.06, 0.08, 0.10, 0.05],
      interval: 2
    },
    "烟雾传感器": {
      mode: "定值",
      fixedTemp: 24.6,
      fixedHum: 58.0,
      fixedLight: 450,
      fixedCo2: 620,
      fixedSoil: 36,
      fixedSmoke: 0.03,
      tempMin: 20,
      tempMax: 35,
      humMin: 40,
      humMax: 80,
      lightMin: 100,
      lightMax: 1000,
      co2Min: 400,
      co2Max: 1200,
      soilMin: 20,
      soilMax: 60,
      smokeMin: 0.01,
      smokeMax: 0.15,
      decimals: 1,
      tempSeq: [22, 24, 26, 28, 26, 24],
      humSeq: [50, 55, 60, 65, 60, 55],
      lightSeq: [200, 400, 600, 800, 600, 400],
      co2Seq: [450, 550, 650, 750, 850, 950],
      soilSeq: [30, 35, 40, 45, 50, 55],
      smokeSeq: [0.02, 0.04, 0.06, 0.08, 0.10, 0.05],
      interval: 2
    }
  };

  const [sensorDataConfig, setSensorDataConfig] = useState<Record<string, SensorConfig>>(defaultSensorDataConfig);
  const [dataGenerationMode, setDataGenerationMode] = useState<"定值" | "随机值" | "循环值">("定值");
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({
    "温湿度传感器": false,
    "光照传感器": false,
    "二氧化碳传感器": false,
    "土壤湿度传感器": false,
    "烟雾传感器": false
  });

  interface GeneratedDataRecord {
    id: string;
    time: string;
    device: string;
    item: string;
    value: string;
    mode: string;
    status: string;
  }
  const [generatedDataList, setGeneratedDataList] = useState<GeneratedDataRecord[]>([]);

  interface CommMsg {
    time: string;
    device: string;
    gateway: string;
    protocol: string;
    addr: string;
    dir: "上行" | "下行" | "已转发";
    payload: string;
    status: string;
  }
  
  const initialCommMessages: CommMsg[] = [
    { time: "10:24:00", device: "温湿度传感器", gateway: "Modbus网关", protocol: "RS485", addr: "0x01", dir: "上行", payload: '{"temp":25.4,"hum":60.1}', status: "已发送" },
    { time: "10:24:02", device: "Modbus网关", gateway: "云平台节点", protocol: "MQTT", addr: "/greenhouse/tempHum", dir: "已转发", payload: '{"device":"sensor-temp-001","temp":25.4,"hum":60.1}', status: "已转发" },
    { time: "10:24:05", device: "光照传感器", gateway: "Modbus网关", protocol: "RS485", addr: "0x02", dir: "上行", payload: '{"light":450}', status: "已发送" }
  ];
  const [communicationMessages, setCommunicationMessages] = useState<CommMsg[]>(initialCommMessages);

  // 默认数值
  const [sensorCurrentValues, setSensorCurrentValues] = useState<Record<string, Record<string, number>>>({
    "温湿度传感器": { "温度": 24.6, "湿度": 58.0 },
    "光照传感器": { "光照强度": 450 },
    "二氧化碳传感器": { "二氧化碳浓度": 620 },
    "土壤湿度传感器": { "土壤湿度": 36 },
    "烟雾传感器": { "烟雾浓度": 0.03 }
  });

  const [cycleIndexes, setCycleIndexes] = useState<Record<string, number>>({
    "温湿度传感器": 0,
    "光照传感器": 0,
    "二氧化碳传感器": 0,
    "土壤湿度传感器": 0,
    "烟雾传感器": 0
  });

  const [pulseSensor, setPulseSensor] = useState<Record<string, boolean>>({});

  // 引用保证 Timer 里的闭包可以读取最新配置
  const configRef = useRef(sensorDataConfig);
  const cycleIndexesRef = useRef(cycleIndexes);
  const currentValuesRef = useRef(sensorCurrentValues);
  const isGeneratingRef = useRef(isGenerating);

  useEffect(() => {
    configRef.current = sensorDataConfig;
  }, [sensorDataConfig]);

  useEffect(() => {
    cycleIndexesRef.current = cycleIndexes;
  }, [cycleIndexes]);

  useEffect(() => {
    currentValuesRef.current = sensorCurrentValues;
  }, [sensorCurrentValues]);

  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  // 定时器管理
  const timersRef = useRef<Record<string, any>>({});

  // 清除定时器
  const clearTimerFor = (sensorName: string) => {
    if (timersRef.current[sensorName]) {
      clearInterval(timersRef.current[sensorName]);
      timersRef.current[sensorName] = null;
    }
  };

  useEffect(() => {
    return () => {
      Object.keys(timersRef.current).forEach(key => {
        if (timersRef.current[key]) {
          clearInterval(timersRef.current[key]);
        }
      });
    };
  }, []);

  // 产生一次数据并追加和记录
  const generateOnceAndCommit = (sensorName: string, mode: "定值" | "随机值" | "循环值") => {
    const config = configRef.current[sensorName];
    const newValues: Record<string, number> = {};
    const meta = SENSOR_META[sensorName];
    
    if (mode === "定值") {
      if (sensorName === "温湿度传感器") {
        newValues["温度"] = config.fixedTemp;
        newValues["湿度"] = config.fixedHum;
      } else if (sensorName === "光照传感器") {
        newValues["光照强度"] = config.fixedLight;
      } else if (sensorName === "二氧化碳传感器") {
        newValues["二氧化碳浓度"] = config.fixedCo2;
      } else if (sensorName === "土壤湿度传感器") {
        newValues["土壤湿度"] = config.fixedSoil;
      } else if (sensorName === "烟雾传感器") {
        newValues["烟雾浓度"] = config.fixedSmoke;
      }
    } else if (mode === "随机值") {
      const getRand = (min: number, max: number, decimals: number) => {
        const val = Math.random() * (max - min) + min;
        return Number(val.toFixed(decimals));
      };
      if (sensorName === "温湿度传感器") {
        newValues["温度"] = getRand(config.tempMin, config.tempMax, 1);
        newValues["湿度"] = getRand(config.humMin, config.humMax, 1);
      } else if (sensorName === "光照传感器") {
        newValues["光照强度"] = Math.round(getRand(config.lightMin, config.lightMax, 0));
      } else if (sensorName === "二氧化碳传感器") {
        newValues["二氧化碳浓度"] = Math.round(getRand(config.co2Min, config.co2Max, 0));
      } else if (sensorName === "土壤湿度传感器") {
        newValues["土壤湿度"] = Math.round(getRand(config.soilMin, config.soilMax, 0));
      } else if (sensorName === "烟雾传感器") {
        newValues["烟雾浓度"] = getRand(config.smokeMin, config.smokeMax, 3);
      }
    } else if (mode === "循环值") {
      const getNextAndCycle = (seq: number[], sName: string) => {
        const curIdx = cycleIndexesRef.current[sName] || 0;
        const val = seq[curIdx % seq.length];
        return { val, nextIdx: (curIdx + 1) % seq.length };
      };
      let nextIndex = 0;
      if (sensorName === "温湿度传感器") {
        const tResult = getNextAndCycle(config.tempSeq, "温湿度传感器");
        const hResult = getNextAndCycle(config.humSeq, "温湿度传感器");
        newValues["温度"] = tResult.val;
        newValues["湿度"] = hResult.val;
        nextIndex = tResult.nextIdx;
      } else if (sensorName === "光照传感器") {
        const r = getNextAndCycle(config.lightSeq, "光照传感器");
        newValues["光照强度"] = r.val;
        nextIndex = r.nextIdx;
      } else if (sensorName === "二氧化碳传感器") {
        const r = getNextAndCycle(config.co2Seq, "二氧化碳传感器");
        newValues["二氧化碳浓度"] = r.val;
        nextIndex = r.nextIdx;
      } else if (sensorName === "土壤湿度传感器") {
        const r = getNextAndCycle(config.soilSeq, "土壤湿度传感器");
        newValues["土壤湿度"] = r.val;
        nextIndex = r.nextIdx;
      } else if (sensorName === "烟雾传感器") {
        const r = getNextAndCycle(config.smokeSeq, "烟雾传感器");
        newValues["烟雾浓度"] = r.val;
        nextIndex = r.nextIdx;
      }
      setCycleIndexes(prev => ({
        ...prev,
        [sensorName]: nextIndex
      }));
    }

    // 更新当前传感器数据值
    setSensorCurrentValues(prev => ({
      ...prev,
      [sensorName]: {
        ...prev[sensorName],
        ...newValues
      }
    }));

    // 触发轻微的更新高亮 pulsate 呼吸
    setPulseSensor(prev => ({ ...prev, [sensorName]: true }));
    setTimeout(() => {
      setPulseSensor(prev => ({ ...prev, [sensorName]: false }));
    }, 450);

    // 1. 实时数据表记录多条 (按数据项)
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const newRecords: GeneratedDataRecord[] = Object.entries(newValues).map(([item, val]) => ({
      id: `data-${Date.now()}-${item}-${Math.random()}`,
      time: timeStr,
      device: sensorName,
      item: item,
      value: `${val} ${meta.unit[item]}`,
      mode: mode,
      status: "已生成"
    }));
    setGeneratedDataList(prev => [...newRecords, ...prev].slice(0, 20));

    // 2. 通信消息面板追加上行和云端转发报文
    const KEY_MAP: Record<string, string> = { "温度": "temp", "湿度": "hum", "光照强度": "light", "二氧化碳浓度": "co2", "土壤湿度": "soil", "烟雾浓度": "smoke" };
    const payloadShort: Record<string, number> = {};
    Object.entries(newValues).forEach(([k, v]) => {
      payloadShort[KEY_MAP[k] || k] = v;
    });
    const payloadStr1 = JSON.stringify(payloadShort);
    const payloadStr2 = JSON.stringify({ device: meta.code, ...payloadShort });

    const addrHex = sensorName === "温湿度传感器" ? "0x01" : sensorName === "光照传感器" ? "0x02" : sensorName === "二氧化碳传感器" ? "0x03" : sensorName === "土壤湿度传感器" ? "0x04" : "0x05";

    const msg1: CommMsg = {
      time: timeStr,
      device: sensorName,
      gateway: "Modbus网关",
      protocol: meta.protocol,
      addr: addrHex,
      dir: "上行",
      payload: payloadStr1,
      status: "已发送"
    };

    const msg2: CommMsg = {
      time: "Modbus网关", // 根据十一点示例：10:34:03｜Modbus网关｜云平台节点... 我们用对象里的 device 刚好对应
      device: "Modbus网关",
      gateway: "云平台节点",
      protocol: "MQTT",
      addr: `/greenhouse/${KEY_MAP[Object.keys(newValues)[0]] || "data"}`,
      dir: "已转发",
      payload: payloadStr2,
      status: "已转发"
    };
    // 放入 communicationMessages (以 10:34:03 | Modbus网关 | 云平台节点 | MQTT 格式，可以用一串自定义数组让渲染支持各种列)
    // 为了渲染安全，在表格里展现，首两行加入到通讯列表：
    setCommunicationMessages(prev => [
      { ...msg2, time: timeStr }, // 让 forwarding time 和上行一致
      msg1, 
      ...prev
    ].slice(0, 30));

    // 3. 操作日志追加
    const valDetailStr = Object.entries(newValues).map(([k, v]) => `${k} ${v}${meta.unit[k]}`).join("，");
    addOperationLog(`发送数据：${valDetailStr}`);
  };

  // 启动生成
  const handleStartGeneration = (sensorName: string) => {
    // 先停止已有的，以防重复启动
    clearTimerFor(sensorName);
    
    const config = sensorDataConfig[sensorName];
    setIsGenerating(prev => {
      const nextGen = { ...prev, [sensorName]: true };
      isGeneratingRef.current = nextGen; // 同步更新 Ref 确保立即生效
      return nextGen;
    });

    addOperationLog(`${sensorName}开始生成${config.mode}数据`);
    showToast(`${sensorName}已开始生成${config.mode}数据。`);

    // 立即执行一次
    generateOnceAndCommit(sensorName, config.mode);

    // 轮询建立，周期为 config.interval 秒
    const intervalMs = (config.interval || 2) * 1000;
    
    timersRef.current[sensorName] = setInterval(() => {
      // 检查当前是否仍然处于生成状态，增加双重防线
      if (isGeneratingRef.current[sensorName]) {
        generateOnceAndCommit(sensorName, configRef.current[sensorName].mode);
      }
    }, intervalMs);
  };

  // 停止生成
  const handleStopGeneration = (sensorName: string) => {
    clearTimerFor(sensorName);
    setIsGenerating(prev => {
      const nextGen = { ...prev, [sensorName]: false };
      isGeneratingRef.current = nextGen;
      return nextGen;
    });
    addOperationLog("停止数据生成");
    showToast(`${sensorName}已停止数据生成。`);
  };

  // 发送一次数据
  const handleSendOnce = (sensorName: string) => {
    const config = configRef.current[sensorName];
    generateOnceAndCommit(sensorName, config.mode);
    addOperationLog(`发送一次数据`);
    showToast(`${sensorName}单次上报数据发送成功。`);
  };

  // 重置配置
  const handleResetConfig = (sensorName: string) => {
    clearTimerFor(sensorName);
    setIsGenerating(prev => {
      const nextGen = { ...prev, [sensorName]: false };
      isGeneratingRef.current = nextGen;
      return nextGen;
    });
    
    // 恢复默认配置
    setSensorDataConfig(prev => ({
      ...prev,
      [sensorName]: { ...defaultSensorDataConfig[sensorName] }
    }));
    
    // 恢复默认仪表数值
    const initialValues: Record<string, Record<string, number>> = {
      "温湿度传感器": { "温度": 24.6, "湿度": 58.0 },
      "光照传感器": { "光照强度": 450 },
      "二氧化碳传感器": { "二氧化碳浓度": 620 },
      "土壤湿度传感器": { "土壤湿度": 36 },
      "烟雾传感器": { "烟雾浓度": 0.03 }
    };
    
    setSensorCurrentValues(prev => ({
      ...prev,
      [sensorName]: { ...initialValues[sensorName] }
    }));
    
    showToast("模拟数据配置已重置。");
    addOperationLog(`模拟数据配置已重置`);
  };
  
  const [lineCheckLogs, setLineCheckLogs] = useState<Array<{
    time: string;
    project: string;
    total: number | string;
    normal: number | string;
    abnormal: number | string;
    enabled: string;
    operator: string;
    result: string;
  }>>([
    {
      time: "10:30:12",
      project: "智慧温室自动化控制工程",
      total: 4,
      normal: 3,
      abnormal: 1,
      enabled: "已开启",
      operator: "学生1",
      result: "发现异常"
    }
  ]);

  const [rightPanelTab, setRightPanelTab] = useState<"params" | "wires" | "cloud">("wires");

  // === 云平台控制对接本地状态 ===
  const [cloudConnectionStatus, setCloudConnectionStatus] = useState<"已连接" | "未连接">("已连接");
  const [isPumpOnline, setIsPumpOnline] = useState<boolean>(true); // 水泵在线/离线演示状态
  const [selectedCloudRecord, setSelectedCloudRecord] = useState<any | null>(null); // 控制详情弹窗
  
  const [actuatorStates, setActuatorStates] = useState<Record<string, string>>({
    fan: "关闭",     // 运行中, 关闭
    pump: "关闭",    // 运行中, 关闭, 离线
    light: "关闭",   // 开启, 关闭
    alarm: "未触发", // 报警中, 未触发
    relay: "断开"    // 闭合, 断开
  });

  const [highlightedDevices, setHighlightedDevices] = useState<Record<string, boolean>>({
    cloud: false,
    gateway: false,
    relay: false,
    fan: false,
    pump: false,
    light: false,
    alarm: false
  });

  const [cloudRecords, setCloudRecords] = useState<any[]>([
    {
      time: "10:42:20",
      source: "云平台",
      target: "风机",
      code: "fan-001",
      command: "开启",
      result: "执行成功",
      state: "运行中",
      operator: "学生1",
      payload: '{\n  "device": "fan-001",\n  "switch": "on"\n}',
      link: "云平台节点 → Modbus网关 → 继电器 → 风机"
    },
    {
      time: "10:40:12",
      source: "云平台",
      target: "风机",
      code: "fan-001",
      command: "关闭",
      result: "执行成功",
      state: "关闭",
      operator: "学生1",
      payload: '{\n  "device": "fan-001",\n  "switch": "off"\n}',
      link: "云平台节点 → Modbus网关 → 继电器 → 风机"
    }
  ]);

  const handleLocateDevice = (deviceName: string) => {
    let nodeKey = "";
    if (deviceName.includes("风机")) nodeKey = "风机";
    else if (deviceName.includes("水泵")) nodeKey = "水泵";
    else if (deviceName.includes("补光")) nodeKey = "补光灯";
    else if (deviceName.includes("报警")) nodeKey = "报警器";
    else if (deviceName.includes("继电")) nodeKey = "继电器";
    else if (deviceName.includes("网关")) nodeKey = "Modbus网关";
    else if (deviceName.includes("云平台")) nodeKey = "云平台节点";
    else nodeKey = deviceName;

    setSelectedNode(nodeKey);
    setIsRightPanelOpen(true);
    showToast(`正在仿真画布中定位：${nodeKey}`);
    
    // Pulse animation
    let lookupKey = nodeKey.toLowerCase();
    if (nodeKey === "补光灯") lookupKey = "light";
    else if (nodeKey === "报警器") lookupKey = "alarm";
    else if (nodeKey === "Modbus网关" || nodeKey === "网关") lookupKey = "gateway";
    else if (nodeKey === "云平台节点") lookupKey = "cloud";
    
    setHighlightedDevices(prev => ({ ...prev, [lookupKey]: true }));
    setTimeout(() => {
      setHighlightedDevices(prev => ({ ...prev, [lookupKey]: false }));
    }, 2000);
  };

  const handleCloudControl = (deviceKey: string, command: "开启" | "关闭" | "触发报警" | "解除报警" | "闭合" | "断开") => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const plus1sSec = (now.getSeconds() + 1) % 60;
    const plus2sSec = (now.getSeconds() + 2) % 60;
    const plus1sMin = now.getMinutes() + (now.getSeconds() + 1 >= 60 ? 1 : 0);
    const plus2sMin = now.getMinutes() + (now.getSeconds() + 2 >= 60 ? 1 : 0);
    
    const timePlus1s = `${now.getHours().toString().padStart(2, '0')}:${plus1sMin.toString().padStart(2, '0')}:${plus1sSec.toString().padStart(2, '0')}`;
    const timePlus2s = `${now.getHours().toString().padStart(2, '0')}:${plus2sMin.toString().padStart(2, '0')}:${plus2sSec.toString().padStart(2, '0')}`;

    if (deviceKey === "pump" && !isPumpOnline) {
      showToast("水泵当前离线，控制指令未执行。");
      
      setOperationLogs(prev => [
        `${timeStr}｜[错误] 水泵设备无响应，控制指令执行失败`,
        `${timeStr}｜云平台下发水泵${command}指令`,
        ...prev
      ]);

      const mqttMsg: CommMsg = {
        time: timeStr,
        device: "云平台节点",
        gateway: "Modbus网关",
        protocol: "MQTT",
        addr: "/greenhouse/pump/control",
        dir: "下行",
        payload: JSON.stringify({ device: "pump-001", switch: command === "开启" ? "on" : "off" }),
        status: "已发送"
      };
      
      const failMsg: CommMsg = {
        time: timePlus1s,
        device: "Modbus网关",
        gateway: "水泵",
        protocol: "Modbus",
        addr: "0x06",
        dir: "设备间",
        payload: JSON.stringify({ error: "device_offline" }),
        status: "执行失败"
      };

      setCommunicationMessages(prev => [mqttMsg, failMsg, ...prev]);

      const newRecord = {
        time: timeStr,
        source: "云平台",
        target: "水泵",
        code: "pump-001",
        command: command,
        result: "执行失败",
        state: "离线",
        operator: "学生1",
        payload: JSON.stringify({ device: "pump-001", switch: command === "开启" ? "on" : "off", error: "offline" }, null, 2),
        link: "云平台节点 -x Modbus网关 -x 水泵"
      };
      
      setCloudRecords(prev => [newRecord, ...prev]);
      
      setHighlightedDevices(prev => ({ ...prev, cloud: true }));
      setTimeout(() => {
        setHighlightedDevices(prev => ({ ...prev, cloud: false }));
      }, 1200);
      
      return;
    }

    let targetState = "关闭";
    let devCode = "";
    let devName = "";
    let ioAddr = "";
    let payloadCmd = "";
    let relayRel = "";
    let execStatus = "";
    let linkStr = "";

    if (deviceKey === "fan") {
      targetState = command === "开启" ? "运行中" : "关闭";
      devCode = "fan-001";
      devName = "风机";
      ioAddr = "OUT1";
      payloadCmd = command === "开启" ? "on" : "off";
      relayRel = command === "开启" ? "close" : "open";
      execStatus = command === "开启" ? "running" : "off";
      linkStr = "云平台节点 → Modbus网关 → 继电器 → 风机";
    } else if (deviceKey === "pump") {
      targetState = command === "开启" ? "运行中" : "关闭";
      devCode = "pump-001";
      devName = "水泵";
      ioAddr = "OUT2";
      payloadCmd = command === "开启" ? "on" : "off";
      relayRel = command === "开启" ? "close" : "open";
      execStatus = command === "开启" ? "running" : "off";
      linkStr = "云平台节点 → Modbus网关 → 水泵";
    } else if (deviceKey === "light") {
      targetState = command === "开启" ? "开启" : "关闭";
      devCode = "light-001";
      devName = "补光灯";
      ioAddr = "OUT3";
      payloadCmd = command === "开启" ? "on" : "off";
      relayRel = command === "开启" ? "close" : "open";
      execStatus = command === "开启" ? "on" : "off";
      linkStr = "云平台节点 → Modbus网关 → 补光灯";
    } else if (deviceKey === "alarm") {
      targetState = command === "触发报警" ? "报警中" : "未触发";
      devCode = "alarm-001";
      devName = "报警器";
      ioAddr = "OUT4";
      payloadCmd = command === "触发报警" ? "trigger" : "clear";
      relayRel = command === "触发报警" ? "close" : "open";
      execStatus = command === "触发报警" ? "alarm" : "clear";
      linkStr = "云平台节点 → Modbus网关 → 报警器";
    } else if (deviceKey === "relay") {
      targetState = command === "闭合" ? "闭合" : "断开";
      devCode = "relay-001";
      devName = "继电器";
      ioAddr = "CN1";
      payloadCmd = command === "闭合" ? "close" : "open";
      relayRel = command === "闭合" ? "close" : "open";
      execStatus = command === "闭合" ? "closed" : "broken";
      linkStr = "云平台节点 → Modbus网关 → 继电器";
    }

    setActuatorStates(prev => ({ ...prev, [deviceKey]: targetState }));
    showToast(`云平台已下发${devName}${command}指令。`);

    setHighlightedDevices(prev => ({
      ...prev,
      cloud: true,
      gateway: true,
      relay: deviceKey === "fan" || deviceKey === "relay",
      [deviceKey]: true
    }));
    setTimeout(() => {
      setHighlightedDevices(prev => ({
        ...prev,
        cloud: false,
        gateway: false,
        relay: false,
        [deviceKey]: false
      }));
    }, 1500);

    setOperationLogs(prev => {
      let logsToAdd = [];
      if (deviceKey === "fan") {
        logsToAdd = [
          `${timePlus2s}｜风机状态更新为${targetState}`,
          `${timePlus1s}｜Modbus网关转发控制指令`,
          `${timeStr}｜云平台下发风机${command}指令`
        ];
      } else if (deviceKey === "pump") {
        logsToAdd = [
          `${timePlus2s}｜水泵状态更新为${targetState}`,
          `${timePlus1s}｜Modbus网关下发水泵控制指令`,
          `${timeStr}｜云平台下发水泵${command}指令`
        ];
      } else if (deviceKey === "light") {
        logsToAdd = [
          `${timePlus2s}｜补光灯状态更新为${targetState}`,
          `${timePlus1s}｜Modbus网关下发补光灯控制指令`,
          `${timeStr}｜云平台下发补光灯${command}指令`
        ];
      } else if (deviceKey === "alarm") {
        logsToAdd = [
          `${timePlus2s}｜报警器状态更新为${targetState}`,
          `${timePlus1s}｜Modbus网关转发报警遥控报文`,
          `${timeStr}｜云平台下发报警器${command}指令`
        ];
      } else if (deviceKey === "relay") {
        logsToAdd = [
          `${timePlus2s}｜继电器状态更新为${targetState}`,
          `${timePlus1s}｜Modbus网关发送引脚驱动报文`,
          `${timeStr}｜云平台下发继电器${command}指令`
        ];
      }
      return [...logsToAdd, ...prev];
    });

    const mqttMsg: CommMsg = {
      time: timeStr,
      device: "云平台节点",
      gateway: "Modbus网关",
      protocol: "MQTT",
      addr: `/greenhouse/${deviceKey}/control`,
      dir: "下行",
      payload: JSON.stringify({ device: devCode, switch: payloadCmd }),
      status: "已发送"
    };

    const modbusMsg: CommMsg = {
      time: timePlus1s,
      device: "Modbus网关",
      gateway: deviceKey === "fan" || deviceKey === "relay" ? "继电器" : devName,
      protocol: "Modbus",
      addr: "0x05",
      dir: "设备间",
      payload: JSON.stringify({ relay: relayRel }),
      status: "已转发"
    };

    const ioMsg: CommMsg = {
      time: timePlus2s,
      device: deviceKey === "fan" || deviceKey === "relay" ? "继电器" : "Modbus网关",
      gateway: devName,
      protocol: deviceKey === "fan" ? "I/O" : "Modbus",
      addr: ioAddr,
      dir: "设备间",
      payload: JSON.stringify({ [`${deviceKey}Status`]: execStatus }),
      status: "已执行"
    };

    setCommunicationMessages(prev => [mqttMsg, modbusMsg, ioMsg, ...prev]);

    const newRecord = {
      time: timeStr,
      source: "云平台",
      target: devName,
      code: devCode,
      command: command,
      result: "执行成功",
      state: targetState,
      operator: "学生1",
      payload: JSON.stringify({ device: devCode, switch: payloadCmd }, null, 2),
      link: linkStr
    };

    setCloudRecords(prev => [newRecord, ...prev]);
  };

  // 8. Application Management States
  const [apps, setApps] = useState<ApplicationItem[]>([
    {
      id: "app-1",
      name: "车间温湿度数据监控终端",
      description: "连接网关温湿度采集节点，实现不间断监控反馈以及高规格折线运行图态势展示。",
      type: "数据监控",
      status: "已发布",
      createTime: "2026-06-03 10:25:00",
      config: {
        title: "车间一号温湿度实时态势大盘",
        refreshRate: 1000,
        sensorBind: "温湿度传感器",
        showChart: true,
        showControl: false,
        thresholdValue: 28,
        alarmTriggered: false
      }
    },
    {
      id: "app-2",
      name: "冷感排风自动联动控制微件",
      description: "在设定温度过载时自动向Modbus网关投递高电平GPIO继电器动作控制指令，进行排风冷却。",
      type: "智能控制",
      status: "草稿",
      createTime: "2026-06-03 10:38:12",
      config: {
        title: "智能联动控制系统终端",
        refreshRate: 1500,
        sensorBind: "温湿度传感器",
        showChart: true,
        showControl: true,
        thresholdValue: 27,
        alarmTriggered: true
      }
    }
  ]);

  const [showAppManagement, setShowAppManagement] = useState<boolean>(false);
  const [showCreateAppModal, setShowCreateAppModal] = useState<boolean>(false);
  const [newAppName, setNewAppName] = useState<string>("");
  const [newAppDesc, setNewAppDesc] = useState<string>("");
  const [newAppType, setNewAppType] = useState<"数据监控" | "智能控制" | "环境集成">("数据监控");

  const [activeAppDesign, setActiveAppDesign] = useState<ApplicationItem | null>(null);
  const [activeAppPreview, setActiveAppPreview] = useState<ApplicationItem | null>(null);

  // Designer State
  const [designTitle, setDesignTitle] = useState<string>("");
  const [designRate, setDesignRate] = useState<number>(1000);
  const [designSensor, setDesignSensor] = useState<string>("温湿度传感器");
  const [designShowChart, setDesignShowChart] = useState<boolean>(true);
  const [designShowControl, setDesignShowControl] = useState<boolean>(false);
  const [designThreshold, setDesignThreshold] = useState<number>(28);

  // Telemetry dynamic variables
  const [telemetryTemp, setTelemetryTemp] = useState<number>(25.4);
  const [telemetryHumi, setTelemetryHumi] = useState<number>(60.1);
  const [relayActive, setRelayActive] = useState<boolean>(false);

  // === Scene Switches and Custom Background States ===
  const [currentScene, setCurrentScene] = useState<string>("智慧温室");
  const [currentBackground, setCurrentBackground] = useState<"default" | "custom">("default");
  const [customBackgroundName, setCustomBackgroundName] = useState<string>("智慧农业实训背景");
  const [backgroundType, setBackgroundType] = useState<string>("渐变背景");
  const [backgroundColor, setBackgroundColor] = useState<string>("浅绿色");
  const [customBackgroundColorHex, setCustomBackgroundColorHex] = useState<string>("#EAF8F1");
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<string>("中网格");
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(40);
  const [showSceneSettings, setShowSceneSettings] = useState<boolean>(false);

  // Device Library Simulation local states
  const [deviceCategories] = useState(categoryConfig);
  const [deviceLibrary] = useState<DeviceLibraryItem[]>(deviceLibraryData);
  const [selectedDeviceCategory, setSelectedDeviceCategory] = useState<string>("全部设备");
  const [deviceSearchKeyword, setDeviceSearchKeyword] = useState<string>("");
  const [selectedDeviceDetail, setSelectedDeviceDetail] = useState<DeviceLibraryItem | null>(null);
  const [canvasDevices, setCanvasDevices] = useState<any[]>([]);
  const [searchInputValue, setSearchInputValue] = useState<string>("");

  const handleCategoryClick = (catName: string) => {
    setSelectedDeviceCategory(catName);
    addOperationLog(`切换分类｜当前分类：${catName}`);
  };

  const handleSearchSubmit = () => {
    setDeviceSearchKeyword(searchInputValue);
    const matched = deviceLibrary.filter((item) => {
      const matchesCategory = selectedDeviceCategory === "全部设备" || item.category === selectedDeviceCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchInputValue.toLowerCase()) ||
                            item.code.toLowerCase().includes(searchInputValue.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    addOperationLog(`设备库搜索｜关键词：${searchInputValue || "全部"}，匹配 ${matched.length} 种设备`);
  };

  const handleSearchReset = () => {
    setSearchInputValue("");
    setDeviceSearchKeyword("");
    setSelectedDeviceCategory("全部设备");
    addOperationLog(`重置设备库搜索并恢复全部设备分类`);
  };

  const handleAddToCanvas = (dev: DeviceLibraryItem) => {
    const newId = `canvas-dev-${dev.id}-${Date.now()}`;
    const newDeviceNode = {
      ...dev,
      canvasId: newId,
      isHighlighted: true,
      x: 340 + (canvasDevices.length % 4) * 45,
      y: 110 + (canvasDevices.length % 3) * 45,
    };
    
    setCanvasDevices(prev => [...prev, newDeviceNode]);
    setSelectedNode(dev.name); 
    
    setTimeout(() => {
      setCanvasDevices(prev => 
        prev.map(d => d.canvasId === newId ? { ...d, isHighlighted: false } : d)
      );
    }, 1500);
    
    showToast(`已添加设备：${dev.name}`);
    addOperationLog(`添加设备｜${dev.name}已添加到画布`);
    addLog(`添加虚拟设备节点：${dev.name}`);
  };

  const sceneRecommendedDevices: Record<string, string[]> = {
    "智慧牧场": ["温湿度传感器", "氨气传感器", "风机", "摄像头", "饲喂控制器", "边缘网关"],
    "智慧家居": ["人体传感器", "门磁传感器", "智能灯光", "智能插座", "继电器", "家庭网关"],
    "智慧温室": ["温湿度传感器", "光照传感器", "二氧化碳传感器", "水泵", "风机", "边缘网关"],
    "智慧矿山": ["甲烷传感器", "粉尘传感器", "定位终端", "报警器", "通风设备", "工业网关"]
  };

  const getRecommendedDevices = () => {
    return sceneRecommendedDevices[currentScene] || [];
  };

  const colorMap: Record<string, string> = {
    "浅绿色": "#EAF8F1",
    "浅灰色": "#F4F4F5",
    "浅米色": "#FAF7F2",
    "浅蓝灰": "#F0F4F8",
    "自定义颜色": customBackgroundColorHex
  };

  const handleSceneSwitch = (sceneName: string) => {
    setCurrentScene(sceneName);
    setCurrentBackground("default");
    showToast(`已切换到${sceneName}场景。`);
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setTerminalLogs(prev => [`${timeStr}｜场景切换｜当前场景已切换为${sceneName}`, ...prev].slice(0, 30));
  };

  const handleApplyCustomBackground = () => {
    setCurrentBackground("custom");
    showToast("自定义背景已应用。");
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setTerminalLogs(prev => [`${timeStr}｜背景设置｜已应用自定义背景：${customBackgroundName}`, ...prev].slice(0, 30));
  };

  const handleRestoreDefaultBackground = () => {
    setCurrentBackground("default");
    showToast("已恢复当前场景默认背景。");
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setTerminalLogs(prev => [`${timeStr}｜背景设置｜已恢复当前场景默认背景`, ...prev].slice(0, 30));
  };

  const handleAddDevice = (item: string, isFromRecommendation: boolean) => {
    setSelectedNode(item);
    showToast(`已将节点 [${item}] 挂接到工程模拟拓扑中！`);
    if (isFromRecommendation) {
      addLog(`已添加${currentScene}推荐设备：${item}。`);
    } else {
      addLog(`添加仿真元器件引脚: ${item}`);
    }
  };

  // SVGs for scene backgrounds
  const renderRanchBackground = () => (
    <svg width="100%" height="100%" viewBox="0 0 800 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#10A66A]">
      <path d="M-100 480 C 150 420, 300 490, 500 440 C 650 400, 800 470, 900 450 L 900 600 L -100 600 Z" fill="currentColor" fillOpacity="0.015" stroke="currentColor" strokeWidth="1" strokeOpacity="0.08" />
      <path d="M-50 420 C 200 460, 450 390, 600 430 C 750 460, 850 410, 950 430 Q 1000 450 1000 450" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.1" />
      <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.12" fill="none">
        <line x1="120" y1="360" x2="280" y2="360" />
        <line x1="120" y1="370" x2="280" y2="370" />
        <line x1="140" y1="350" x2="140" y2="380" />
        <line x1="180" y1="350" x2="180" y2="380" />
        <line x1="220" y1="350" x2="220" y2="380" />
        <line x1="260" y1="350" x2="260" y2="380" />
      </g>
      <rect x="550" y="240" width="160" height="100" rx="4" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.15" fill="none" />
      <path d="M540 240 L630 180 L720 240" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.15" fill="none" />
      <rect x="610" y="280" width="40" height="60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" fill="none" />
      <line x1="610" y1="280" x2="650" y2="340" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <line x1="650" y1="280" x2="610" y2="340" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <circle cx="200" cy="200" r="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.1" />
      <circle cx="200" cy="200" r="3" fill="currentColor" fillOpacity="0.2" />
      <circle cx="630" cy="140" r="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.1" />
      <circle cx="630" cy="140" r="3" fill="currentColor" fillOpacity="0.2" />
      <text x="180" y="230" fill="currentColor" fillOpacity="0.3" fontSize="10" fontWeight="bold">牧区环境传感器 A 点</text>
      <text x="610" y="170" fill="currentColor" fillOpacity="0.3" fontSize="10" fontWeight="bold">棚顶气象站 B 点</text>
    </svg>
  );

  const renderHomeBackground = () => (
    <svg width="100%" height="100%" viewBox="0 0 800 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#10A66A]">
      <g stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.15" fill="none">
        <rect x="150" y="80" width="500" height="300" rx="2" />
        <rect x="150" y="80" width="220" height="180" />
        <rect x="150" y="260" width="120" height="120" />
        <rect x="470" y="80" width="180" height="140" />
        <line x1="370" y1="180" x2="370" y2="260" />
      </g>
      <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" fill="none">
        <path d="M 370 180 A 40 40 0 0 0 330 220" />
        <path d="M 270 320 A 40 40 0 0 0 310 360" />
      </g>
      <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" fill="none">
        <rect x="170" y="100" width="100" height="120" />
        <rect x="180" y="100" width="35" height="20" />
        <rect x="225" y="100" width="35" height="20" />
        <rect x="420" y="300" width="180" height="40" />
        <line x1="450" y1="370" x2="570" y2="370" strokeWidth="3" />
      </g>
      <text x="210" y="150" fill="currentColor" fillOpacity="0.3" fontSize="10" fontWeight="bold">卧室温控点</text>
      <text x="500" y="320" fill="currentColor" fillOpacity="0.3" fontSize="10" fontWeight="bold">门磁/人体传感 A 圈</text>
      <text x="525" y="130" fill="currentColor" fillOpacity="0.3" fontSize="10" fontWeight="bold">智能厨房联动区</text>
    </svg>
  );

  const renderGreenhouseBackground = () => (
    <svg width="100%" height="100%" viewBox="0 0 800 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#10A66A]">
      <path d="M100 380 L100 220 C100 100, 300 100, 300 220 L300 380" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.15" fill="none" />
      <path d="M120 380 L120 230 C120 120, 280 120, 280 230 L280 380" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.1" fill="none" />
      <path d="M400 380 L400 220 C400 100, 600 100, 600 220 L600 380" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.15" fill="none" />
      <path d="M420 380 L420 230 C420 120, 580 120, 580 230 L580 380" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.1" fill="none" />
      <g stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.12" fill="none">
        <line x1="140" y1="380" x2="160" y2="280" />
        <line x1="180" y1="380" x2="190" y2="280" />
        <line x1="220" y1="380" x2="220" y2="280" />
        <line x1="260" y1="380" x2="250" y2="280" />
        <line x1="440" y1="380" x2="460" y2="280" />
        <line x1="480" y1="380" x2="490" y2="280" />
        <line x1="520" y1="380" x2="520" y2="280" />
        <line x1="560" y1="380" x2="550" y2="280" />
      </g>
      <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" fill="none">
        <circle cx="200" cy="160" r="10" strokeDasharray="2 2" />
        <line x1="200" y1="140" x2="200" y2="130" />
        <line x1="200" y1="180" x2="200" y2="190" />
        <line x1="180" y1="160" x2="170" y2="160" />
        <line x1="220" y1="160" x2="230" y2="160" />
      </g>
      <text x="160" y="190" fill="currentColor" fillOpacity="0.3" fontSize="10" fontWeight="bold">光照调节传感器1</text>
      <text x="460" y="190" fill="currentColor" fillOpacity="0.3" fontSize="10" fontWeight="bold">土壤温湿度探头2</text>
      <text x="480" y="300" fill="currentColor" fillOpacity="0.25" fontSize="10" fontWeight="bold">自动水泵喷淋区域</text>
    </svg>
  );

  const renderMineBackground = () => (
    <svg width="100%" height="100%" viewBox="0 0 800 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-zinc-500">
      <path d="M-50 130 C 200 100, 450 150, 900 90 L 900 0 L -50 0 Z" fill="currentColor" fillOpacity="0.015" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <g stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.15" fill="none">
        <line x1="250" y1="100" x2="250" y2="430" />
        <line x1="320" y1="100" x2="320" y2="430" />
        <path d="M 100 220 L 250 220 M 320 220 L 700 220" />
        <path d="M 100 260 L 250 260 M 320 260 L 700 260" />
        <path d="M 80 340 L 250 340 M 320 340 L 720 340" />
        <path d="M 80 380 L 250 380 M 320 380 L 720 380" />
      </g>
      <rect x="260" y="230" width="50" height="40" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" fill="none" />
      <line x1="260" y1="250" x2="310" y2="250" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <circle cx="600" cy="240" r="12" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.15" />
      <path d="M600 228 L600 252 M588 240 L612 240" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.15" />
      <text x="110" y="210" fill="currentColor" fillOpacity="0.3" fontSize="10" fontWeight="bold">一号采煤工作面</text>
      <text x="360" y="320" fill="currentColor" fillOpacity="0.3" fontSize="10" fontWeight="bold">主皮带传送联动区</text>
      <text x="490" y="205" fill="currentColor" fillOpacity="0.3" fontSize="10" fontWeight="bold">瓦斯/甲烷传感器集中监测点</text>
    </svg>
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const envName = "工程虚拟仿真";

  // Dynamic increment for time counters
  useEffect(() => {
    let timer: any = null;
    if (environmentStatus === "运行中") {
      timer = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [environmentStatus]);

  // Synchronize dynamic previewing temperature
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTemp(prev => {
        const delta = (Math.random() - 0.48) * 0.4;
        const next = prev + delta;
        if (activeAppPreview) {
          if (next > activeAppPreview.config.thresholdValue) {
            setRelayActive(true);
          } else if (next < activeAppPreview.config.thresholdValue - 1.5) {
            setRelayActive(false);
          }
        }
        return Math.max(16, Math.min(42, next));
      });
      setTelemetryHumi(prev => {
        const delta = (Math.random() - 0.5) * 0.8;
        return Math.max(20, Math.min(95, prev + delta));
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [activeAppPreview]);

  // Manage platform navigation header display
  useEffect(() => {
    const navElement = document.getElementById("u-platform-nav");
    if (navElement) {
      navElement.style.display = isHeaderHidden ? "none" : "block";
    }
    return () => {
      if (navElement) navElement.style.display = "block";
    };
  }, [isHeaderHidden]);

  // Handle local simulation log feed
  const addLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [`[${timeStr}] ${msg}`, ...prev].slice(0, 30));
  };

  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
      setIsHeaderHidden(true);
      setIsNavHidden(true);
      setIsManualHidden(true);
      showToast("已启用网页内全屏。");
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
      showToast("已退出全屏。");
    }
  };

  // === 连线验证数据获取与计算 ===
  const getConnectionData = () => {
    const base = [
      { id: "conn-1", status: "正常", fromDev: "温湿度传感器", fromPort: "DATA", toDev: "Modbus网关", toPort: "DI1", checkResult: "通过", detail: "数据线连接正确", advice: "无需处理" },
      { id: "conn-2", status: "正常", fromDev: "光照传感器", fromPort: "AO", toDev: "Modbus网关", toPort: "AI1", checkResult: "通过", detail: "模拟量输入连接正确", advice: "无需处理" },
      { id: "conn-3", status: "正常", fromDev: "Modbus网关", fromPort: "MQTT", toDev: "云平台节点", toPort: "Topic", checkResult: "通过", detail: "通信链路连接正确", advice: "无需处理" },
      { 
        id: "conn-4", 
        status: hasRepaired ? "正常" : "异常", 
        fromDev: "继电器", 
        fromPort: "OUT", 
        toDev: "风机", 
        toPort: "IN", 
        checkResult: hasRepaired ? "通过" : "未通过", 
        detail: hasRepaired ? "风机供电及控制链路均已连接正常" : "风机缺少供电线路与电源回路", 
        advice: hasRepaired ? "无需处理" : "请将电源模块 VCC、GND 分别连接到风机供电端" 
      }
    ];

    if (hasRepaired) {
      base.push(
        { id: "conn-5", status: "正常", fromDev: "电源模块", fromPort: "VCC", toDev: "风机", toPort: "VCC", checkResult: "通过", detail: "VCC 供电线路连接正确", advice: "无需处理" },
        { id: "conn-6", status: "正常", fromDev: "电源模块", fromPort: "GND", toDev: "风机", toPort: "GND", checkResult: "通过", detail: "GND 供电线路连接正确", advice: "无需处理" }
      );
    }
    return base;
  };

  const handleToggleLineValidation = () => {
    const nextEnabled = !lineValidationEnabled;
    setLineValidationEnabled(nextEnabled);
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    if (!nextEnabled) {
      setLineCheckStatus("验证已关闭");
      setLocateHighlighted(false);
      setHighlightedConnectionId(null);
      showToast("已关闭连线验证");
      
      addOperationLog("已关闭连线验证");
      setTerminalLogs(prev => [`${timeStr}｜连线验证｜已关闭连线验证`, ...prev].slice(0, 30));
      
      setLineCheckLogs(prev => [
        {
          time: timeStr,
          project: "智慧温室自动化控制工程",
          total: 4,
          normal: "-",
          abnormal: "-",
          enabled: "已关闭",
          operator: "学生1",
          result: "验证已关闭"
        },
        ...prev
      ].slice(0, 20));
    } else {
      setLineCheckStatus("未检测");
      showToast("已开启连线验证");
      addOperationLog("开启连线验证");
      setTerminalLogs(prev => [`${timeStr}｜开启连线验证`, ...prev].slice(0, 30));
    }
  };

  const handleStartLineCheck = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    if (!lineValidationEnabled) {
      showToast("连线验证已关闭，请开启后再进行检测。");
      return;
    }

    setLineCheckStatus("检测中");
    showToast("正在建立连通路径检测...");

    setTimeout(() => {
      setLineCheckStatus("检测完成");
      setRightPanelTab("wires");
      setIsRightPanelOpen(true);
      
      if (!hasRepaired) {
        showToast("连线检测完成，发现 1 条异常连线。");
        addOperationLog("执行连线检测，发现 1 条异常连线");
        setTerminalLogs(prev => [
          `${timeStr}｜执行连线检测，发现 1 条异常连线`,
          ...prev
        ].slice(0, 30));
        
        setLineCheckLogs(prev => [
          {
            time: timeStr,
            project: "智慧温室自动化控制工程",
            total: 4,
            normal: 3,
            abnormal: 1,
            enabled: "已开启",
            operator: "学生1",
            result: "发现异常"
          },
          ...prev
        ].slice(0, 20));
      } else {
        showToast("连线检测通过，未发现异常。");
        addOperationLog("重新检测，全部连线通过");
        setTerminalLogs(prev => [
          `${timeStr}｜重新检测，全部连线通过`,
          ...prev
        ].slice(0, 30));
        
        // 彻底修好，把所有连线项设定为正常
        setConnectionList(prev => prev.map(c => ({
          ...c,
          status: "正常" as const,
          checkResult: "通过" as const
        })));

        setLineCheckLogs(prev => [
          {
            time: timeStr,
            project: "智慧温室自动化控制工程",
            total: 6,
            normal: 6,
            abnormal: 0,
            enabled: "已开启",
            operator: "学生1",
            result: "检测通过"
          },
          ...prev
        ].slice(0, 20));
      }
    }, 400);
  };

  const handleAutoCompleteRepair = () => {
    addOperationLog("自动补全风机供电连线");
    setTerminalLogs(prev => [
      `[INFO] ${new Date().toLocaleTimeString()} 回路智能补全: 已成功自愈闭合 VCC 供电相 及 GND 地层总线。`,
      `[INFO] ${new Date().toLocaleTimeString()} 全网连线自检通过。异常清零。正在等待启动复检。`,
      ...prev
    ]);
    
    setConnectionList(prev => {
      const hasAdded = prev.some(c => c.id === "conn-5");
      const updated = prev.map(c => c.id === "conn-4" ? { 
        ...c, 
        status: "待复检"  as const, 
        checkResult: "未通过" as const,
        detail: "控制端通信配线正常，但动力电源尚未完成复检过电",
      } : c);
      if (!hasAdded) {
        return [
          ...updated,
          { id: "conn-5", status: "待复检" as const, fromDev: "电源模块", fromPort: "VCC", toDev: "风机", toPort: "VCC", checkResult: "通过", detail: "电源DC_VCC连接到了风机VCC", advice: "无需处理" },
          { id: "conn-6", status: "待复检" as const, fromDev: "电源模块", fromPort: "GND", toDev: "风机", toPort: "GND", checkResult: "通过", detail: "电源GND连接到了风机GND", advice: "无需处理" }
        ];
      }
      return updated;
    });
    setHasRepaired(true);
    showToast("已自动补全风机供电连线。回路更改已生效，请重新 [开始检测] 进行复查。");
  };

  const handleMarkAsProcessed = () => {
    setConnectionList(prev => prev.map(c => c.id === "conn-4" ? { ...c, status: "待复检" as const } : c));
    showToast("已标记处理，请重新执行连线检测。");
    addOperationLog("标记已处理：继电器 OUT → 风机 IN");
  };

  const handleCaptureScreen = () => {
    if (environmentStatus !== "运行中") {
      showToast("仿真环境状态未就绪，无法截屏！");
      return;
    }
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const nextSeq = screenshotRecords.length + 1;
    const newRecord: ScreenshotRecord = {
      id: `sc-${Date.now()}`,
      name: `工程虚拟仿真_截屏_00${nextSeq}`,
      time: formattedDate,
      source: "工程虚拟仿真实验环境"
    };

    setScreenshotRecords(prev => [newRecord, ...prev]);
    showToast("当前实验环境画面已成功截屏。");
    addLog(`保存系统截屏: 工程虚拟仿真_截屏_00${nextSeq}.png`);
    setSelectedManualTab("screenshot");
    if (isManualHidden) setIsManualHidden(false);
  };

  const handleResetView = () => {
    setIsHeaderHidden(false);
    setIsNavHidden(false);
    setIsManualHidden(false);
    setIsFullscreen(false);
    setIsRightPanelOpen(true);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    showToast("已重置所有隐藏区域，还原布局。");
  };

  const handleCloseEnvironment = () => setShowCloseConfirm(true);

  const handleConfirmClose = () => {
    setEnvironmentStatus("已关闭");
    setShowCloseConfirm(false);
    showToast("当前沙箱环境已关闭。");
  };

  const handleRebootEnvironment = () => {
    setEnvironmentStatus("启动中");
    setTimeout(() => {
      setEnvironmentStatus("运行中");
      setSessionDuration(0);
      showToast("沙箱重新启动就绪！");
    }, 800);
  };

  const handleInsertNote = (recordName: string) => {
    setLearningNotes(prev => `${prev}\n[已关联截屏: ${recordName}]`);
    setSelectedManualTab("notes");
    showToast(`截屏【${recordName}】已追加至您的笔记！`);
  };

  const handleDeleteRecord = (id: string) => {
    setScreenshotRecords(prev => prev.filter(item => item.id !== id));
    showToast("截屏已删除");
  };

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = { sender: "user" as const, text: aiInput };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput("");

    setTimeout(() => {
      let res = "收到提问！您可以利用左侧仿真指南步骤进行操作，在左侧的设备分类上双击即可连线。";
      if (aiInput.includes("连线") || aiInput.includes("温湿度")) {
        res = "连线时：把温湿度仿真的输出引脚接到 Modbus 网关的 GPIO 采集端口，并确保通信校验已打开。";
      } else if (aiInput.includes("应用")) {
        res = "点击顶部的 [应用管理] 即可从右侧侧边栏新建您专属的低代码大屏。可配置报警阈值，并进行实时波动预览发布。";
      }
      setAiMessages(prev => [...prev, { sender: "ai", text: res }]);
    }, 400);
  };

  // Format Helper: total seconds -> HH:mm:ss
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Application creation & design actions
  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) {
      showToast("请输入大屏应用名称");
      return;
    }
    const newApp: ApplicationItem = {
      id: `app-${Date.now()}`,
      name: newAppName,
      description: newAppDesc || "低代码拖贴组网仿真仪表盘监控系统。",
      type: newAppType,
      status: "草稿",
      createTime: new Date().toISOString().replace("T", " ").substring(0, 19),
      config: {
        title: newAppName,
        refreshRate: 1000,
        sensorBind: "温湿度传感器",
        showChart: true,
        showControl: true,
        thresholdValue: 28,
        alarmTriggered: false
      }
    };
    setApps(prev => [...prev, newApp]);
    setNewAppName("");
    setNewAppDesc("");
    setShowCreateAppModal(false);
    showToast(`创建应用 "${newAppName}" 成功！`);
    addLog(`在应用仓库中注册了新大屏监控程序: ${newAppName}`);
  };

  const handleDeleteApp = (id: string, name: string) => {
    setApps(prev => prev.filter(app => app.id !== id));
    showToast(`应用 "${name}" 已成功移除`);
    addLog(`注销应用: ${name}`);
  };

  const handleOpenDesigner = (app: ApplicationItem) => {
    setActiveAppDesign(app);
    setDesignTitle(app.config.title);
    setDesignRate(app.config.refreshRate);
    setDesignSensor(app.config.sensorBind);
    setDesignShowChart(app.config.showChart);
    setDesignShowControl(app.config.showControl);
    setDesignThreshold(app.config.thresholdValue);
  };

  const handleSaveDesign = () => {
    if (!activeAppDesign) return;
    setApps(prev => prev.map(app => {
      if (app.id === activeAppDesign.id) {
        return {
          ...app,
          config: {
            title: designTitle,
            refreshRate: designRate,
            sensorBind: designSensor,
            showChart: designShowChart,
            showControl: designShowControl,
            thresholdValue: designThreshold,
            alarmTriggered: app.config.alarmTriggered
          }
        };
      }
      return app;
    }));
    setActiveAppDesign(null);
    showToast("应用配置更新成功！");
    addLog(`调整并刷新了大屏应用 [${activeAppDesign.name}] 的可视化图元配置`);
  };

  const handlePublishApp = (id: string, name: string) => {
    setApps(prev => prev.map(app => {
      if (app.id === id) {
        return { ...app, status: "已发布" };
      }
      return app;
    }));
    showToast(`应用 "${name}" 成功发布到智慧物联大屏仓库！`);
    addLog(`发布了大屏应用并在平台部署: ${name}`);
  };

  const categories = [
    { name: "⭐ 当前场景推荐设备", items: getRecommendedDevices() },
    { name: "传感器", items: ["温湿度传感器", "光照传感器", "烟雾传感器", "人体红外"] },
    { name: "采集器", items: ["Modbus采集器", "CAN采集器"] },
    { name: "RFID", items: ["125K读卡器", "13.56M读卡器"] },
    { name: "其他设备", items: ["继电器", "蜂鸣器", "LED灯"] },
    { name: "环境参数", items: ["环境温度", "环境湿度"] }
  ];

  return (
    <div 
      ref={containerRef}
      className={`${
        isFullscreen 
          ? "fixed inset-0 z-50 bg-[#F8FAF9] flex flex-col overflow-hidden" 
          : "h-[calc(100vh-56px)] max-h-[calc(100vh-56px)] flex flex-col bg-[#F8FAF9] overflow-hidden select-none"
      } text-zinc-800 font-sans`}
    >
      
      {/* 1. 实验环境状态栏 (48px - 56px, 白底, 浅灰边框) */}
      <div className="bg-white border-b border-zinc-200 px-5 flex items-center justify-between select-none h-[52px] shrink-0 text-xs font-semibold text-zinc-650 overflow-hidden shadow-xs">
        <div className="flex items-center gap-5 whitespace-nowrap overflow-hidden">
          <div className="truncate flex items-center gap-1">
            <span className="text-zinc-400">实验环境：</span>
            <span className="text-zinc-850 font-extrabold">{envName}</span>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="truncate flex items-center gap-1">
            <span className="text-zinc-400">当前用户：</span>
            <span className="text-zinc-850 font-bold flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              学生1
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="truncate flex items-center gap-1">
            <span className="text-zinc-400">启动时间：</span>
            <span className="text-zinc-500">2026-06-03 10:20:00</span>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="truncate flex items-center gap-1">
            <span className="text-zinc-400">环境状态：</span>
            <span className="inline-flex items-center gap-1 bg-[#EAF8F1] text-[#10A66A] border border-[#CFEFE0] px-2 py-0.5 rounded text-[11px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10A66A] animate-ping" />
              运行中
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="truncate flex items-center gap-1">
            <span className="text-[#10A66A] font-bold">本次使用时长：</span>
            <span className="font-mono text-[#10A66A] font-extrabold text-sm">{formatTime(sessionDuration)}</span>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="truncate flex items-center gap-1">
            <span className="text-zinc-400">累计使用时长：</span>
            <span className="text-zinc-850 font-bold">50677 小时</span>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="truncate flex items-center gap-1">
            <span className="text-zinc-400">累计访问量：</span>
            <span className="text-zinc-850 font-bold">1595 次</span>
          </div>
        </div>
      </div>

      {/* 2. 仿真工具栏 (44px) */}
      <div className="bg-white border-b border-zinc-200 px-5 flex items-center justify-between h-11 shrink-0 text-xs text-zinc-600 select-none overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {/* 全屏 */}
          <button 
            type="button"
            onClick={handleToggleFullscreen}
            className={`h-7 px-3 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border ${
              isFullscreen 
                ? "bg-amber-50 text-amber-600 border-amber-200" 
                : "bg-[#EAF8F1] text-[#10A66A] border-[#CFEFE0] hover:bg-[#D5EFE1]"
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? "退出全屏" : "全屏"}</span>
          </button>

          {/* 截屏 */}
          <button 
            type="button"
            onClick={handleCaptureScreen}
            className="h-7 px-3 bg-[#10A66A] hover:bg-emerald-600 text-white rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>截屏</span>
          </button>

          <div className="w-px h-4 bg-zinc-200 mx-1" />

          {/* 隐藏头部 */}
          <button 
            type="button"
            onClick={() => setIsHeaderHidden(!isHeaderHidden)}
            className={`h-7 px-2.5 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border ${
              isHeaderHidden ? "bg-zinc-150 text-zinc-700 border-zinc-300" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            <span>{isHeaderHidden ? "显示头部" : "隐藏头部"}</span>
          </button>

          {/* 隐藏导航 */}
          <button 
            type="button"
            onClick={() => setIsNavHidden(!isNavHidden)}
            className={`h-7 px-2.5 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border ${
              isNavHidden ? "bg-zinc-150 text-zinc-700 border-zinc-300" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            <span>{isNavHidden ? "显示导航" : "隐藏导航"}</span>
          </button>

          {/* 隐藏手册 */}
          <button 
            type="button"
            onClick={() => setIsManualHidden(!isManualHidden)}
            className={`h-7 px-2.5 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border ${
              isManualHidden ? "bg-zinc-150 text-zinc-700 border-zinc-300" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            <span>{isManualHidden ? "显示手册" : "隐藏手册"}</span>
          </button>

          <div className="w-px h-4 bg-zinc-200 mx-1" />

          {/* 重置视图 */}
          <button 
            type="button"
            onClick={handleResetView}
            className="h-7 px-2.5 bg-white text-zinc-650 border border-zinc-200 hover:bg-zinc-50 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>重置视图</span>
          </button>

          <div className="w-px h-5 bg-zinc-300 mx-2" />

          {/* 连线验证开关 */}
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleToggleLineValidation}
              className={`h-7 px-3 rounded-full text-[11.5px] font-black flex items-center gap-1.5 transition cursor-pointer border shadow-sm ${
                lineValidationEnabled 
                  ? "bg-[#EAF8F1] text-[#10A66A] border-emerald-300" 
                  : "bg-zinc-100 text-zinc-500 border-zinc-350"
              }`}
            >
              {/* Dynamic toggle circle switch */}
              <div className={`w-7 h-4 rounded-full flex items-center p-0.5 transition-all duration-300 ${lineValidationEnabled ? 'bg-[#10A66A]' : 'bg-zinc-300'}`}>
                <div className={`bg-white w-3 h-3 rounded-full shadow-inner transform transition-all duration-300 ${lineValidationEnabled ? 'translate-x-3' : 'translate-x-0'}`} />
              </div>
              <span className="tracking-wide">
                {lineValidationEnabled ? "连线验证已开启" : "连线验证已关闭"}
              </span>
            </button>

            {/* 开始检测按钮 */}
            <button
              type="button"
              onClick={handleStartLineCheck}
              disabled={lineCheckStatus === "检测中"}
              className="h-7 px-4 bg-[#10A66A] hover:bg-emerald-600 disabled:bg-zinc-400 text-white rounded text-[11px] font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${lineCheckStatus === "检测中" ? "animate-spin" : ""}`} />
              <span>开始检测</span>
            </button>
          </div>

          <div className="w-px h-5 bg-zinc-300 mx-2" />

          {/* 应用管理 */}
          <button 
            type="button"
            onClick={() => setShowAppManagement(!showAppManagement)}
            className={`h-7 px-3 border rounded text-[11px] font-black flex items-center gap-1.5 transition cursor-pointer ${
              showAppManagement 
                ? "bg-[#EAF8F1] text-[#10A66A] border-[#10A66A] shadow-inner font-black" 
                : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span>应用管理</span>
            {apps.length > 0 && (
              <span className="bg-[#10A66A] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                {apps.length}
              </span>
            )}
          </button>

          {/* 场景设置 */}
          <button 
            type="button"
            onClick={() => {
              setIsRightPanelOpen(true);
              showToast("已定位至右侧面板：您可在此处自由切换实训场景并自定义画底背景！");
            }}
            className="h-7 px-3 bg-[#EAF8F1] text-[#10A66A] border border-emerald-200 hover:bg-emerald-50 rounded text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>场景切换：{currentScene}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isFullscreen && (
            <span className="text-[10px] text-amber-600 bg-amber-50 font-black px-2 py-0.5 rounded border border-amber-200 hidden md:inline-block">
              全屏激活
            </span>
          )}
          <button 
            type="button"
            onClick={handleCloseEnvironment}
            className="h-7 px-3 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Power className="w-3 h-3" />
            <span>关闭环境</span>
          </button>
        </div>
      </div>

      {/* 3. 中间大模块主要区域 */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* A. 侧有一级高密度导航栏 */}
        {!isNavHidden && (
          <div className="w-14 bg-zinc-900 text-zinc-400 flex flex-col items-center py-4 shrink-0 border-r border-zinc-800 gap-5 select-none h-full overflow-y-auto">
             <div className="w-8 h-8 rounded bg-[#10A66A] flex items-center justify-center text-white mb-2 shadow" title="实训系统">
                <Monitor className="w-4 h-4" />
             </div>
             <div className="flex flex-col gap-5 text-center w-full grow">
                <div onClick={handleResetView} className="flex flex-col items-center gap-1 cursor-pointer hover:text-white group">
                   <div className="w-7 h-7 rounded bg-zinc-800 flex items-center justify-center text-emerald-400 group-hover:bg-zinc-700 transition">
                      <Home className="w-3.5 h-3.5" />
                   </div>
                   <span className="text-[8px] font-bold">工作台</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-white group">
                   <div className="w-7 h-7 rounded bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-300" />
                   </div>
                   <span className="text-[8px] font-bold">手册</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-white group">
                   <div className="w-7 h-7 rounded bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition">
                      <User className="w-3.5 h-3.5 text-zinc-300" />
                   </div>
                   <span className="text-[8px] font-bold">我的</span>
                </div>
             </div>
          </div>
        )}

        {/* B. 左侧学习手册区 - 宽度固定在 270px (260px - 300px 内) */}
        {!isManualHidden && (
          <div className="w-[270px] bg-white border-r border-zinc-200 flex flex-col shrink-0 h-full overflow-hidden animate-in slide-in-from-left duration-200">
            <div className="bg-zinc-50 p-3 pb-2 border-b border-zinc-200">
               <div className="flex items-center gap-1.5 mb-1.5">
                 <FileText className="w-4 h-4 text-[#10A66A]" />
                 <span className="text-xs font-black text-zinc-850">实验指南 & 笔记</span>
               </div>
               <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold">
                  {[
                    { id: "intro", label: "简介" },
                    { id: "guide", label: "指导书" },
                    { id: "notes", label: "笔记" },
                    { id: "ai", label: "AI助教" },
                    { id: "screenshot", label: "截图" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedManualTab(tab.id)}
                      className={`px-2 py-0.5 rounded cursor-pointer transition whitespace-nowrap border shrink-0 ${
                        selectedManualTab === tab.id 
                          ? "bg-[#EAF8F1] text-[#10A66A] border-[#CFEFE0]" 
                          : "bg-white text-zinc-500 border-zinc-200 hover:text-zinc-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 text-xs leading-relaxed space-y-3">
              {selectedManualTab === "intro" && (
                <div className="space-y-2">
                  <h3 className="font-extrabold text-[#10A66A] border-b pb-1">实验核心机制</h3>
                  <p className="text-zinc-600">本仿真通过配置 Modbus 网关协议并动态连接温湿度传感器等物理通道，构建边缘物联网数据监控大盘。</p>
                </div>
              )}
              {selectedManualTab === "guide" && (
                <div className="space-y-2 text-zinc-650">
                  <h3 className="font-extrabold text-[#10A66A] border-b pb-1">基本操作实训</h3>
                  <div className="space-y-1 text-[11px]">
                    <div><b>步骤1.</b> 双击设备树上的“温湿度传感器”向画布加载。</div>
                    <div><b>步骤2.</b> 将传感器输出引脚绑定 Modbus 网关 GPIO 端口。</div>
                    <div><b>步骤3.</b> 查验底端沙箱日志查看动态周期报文。</div>
                    <div><b>步骤4.</b> 点击“截屏”，一键保存并写入笔记。</div>
                  </div>
                </div>
              )}
              {selectedManualTab === "notes" && (
                <div className="flex flex-col h-full space-y-2">
                   <textarea
                     value={learningNotes}
                     onChange={(e) => setLearningNotes(e.target.value)}
                     className="w-full flex-1 min-h-[140px] bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 outline-none focus:ring-1 focus:ring-[#10A66A]"
                   />
                   <div className="flex justify-between text-[9px] text-zinc-400 font-bold">
                     <span>自动存盘中</span>
                     <span>共 {learningNotes.length} 字符</span>
                   </div>
                </div>
              )}
              {selectedManualTab === "ai" && (
                <div className="flex flex-col h-full space-y-2">
                  <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded p-2.5 space-y-2.5 overflow-y-auto max-h-[180px]">
                     {aiMessages.map((m, i) => (
                       <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                         <span className={`p-2 rounded-lg max-w-[85%] text-[10.5px] ${m.sender === "user" ? "bg-[#10A66A] text-white" : "bg-white text-zinc-700 border border-zinc-150"}`}>
                           {m.text}
                         </span>
                       </div>
                     ))}
                  </div>
                  <form onSubmit={handleSendAiMessage} className="flex gap-1">
                     <input 
                       value={aiInput} 
                       onChange={(e) => setAiInput(e.target.value)}
                       placeholder="提问智能助手..."
                       className="flex-1 border rounded px-2 py-1 text-xs outline-none"
                     />
                     <button type="submit" className="bg-[#10A66A] text-white p-1 rounded px-2"><Send className="w-3.5 h-3.5" /></button>
                  </form>
                </div>
              )}
              {selectedManualTab === "screenshot" && (
                <div className="space-y-2">
                  {screenshotRecords.map(r => (
                    <div key={r.id} className="bg-zinc-50 border border-zinc-200 rounded p-2 text-[10.5px] space-y-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>{r.name}</span>
                        <span className="text-[8.5px] text-zinc-400">{r.time.split(" ")[1]}</span>
                      </div>
                      <div className="flex gap-2 justify-end pt-1 border-t border-zinc-200 text-[10px]">
                        <button onClick={() => handleInsertNote(r.name)} className="text-[#10A66A] hover:underline">插至学记</button>
                        <button onClick={() => handleDeleteRecord(r.id)} className="text-red-500 hover:underline">删除</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* C. 智能硬件设备库 - 宽度固定 230px */}
        <div className="w-[230px] bg-white border-r border-zinc-200 flex flex-col shrink-0 h-full overflow-hidden select-none">
           {/* Top Title Bar */}
           <div className="p-3 bg-zinc-50 border-b border-zinc-250 font-bold text-xs text-zinc-800 flex items-center justify-between">
             <div className="flex items-center gap-1.5">
               <span className="text-[#10A66A] font-extrabold">★</span>
               <span>智能硬件设备库</span>
             </div>
             <span className="text-[10px] bg-[#EAF8F1] border border-[#CFEFE0] text-[#10A66A] font-black px-1.5 py-0.5 rounded-full animate-pulse">
               在线
             </span>
           </div>

           {/* Statistics Grid Banner */}
           <div className="bg-[#FAFBFB] p-2.5 border-b border-zinc-150 space-y-1.5 text-[11px] font-medium text-zinc-700">
             <div className="grid grid-cols-2 gap-1 bg-white border border-zinc-200 rounded p-1.5 text-center shadow-2xs">
               <div className="border-r border-zinc-100 pr-1">
                 <span className="text-[10px] text-zinc-400 font-bold block leading-none pb-1">设备总数</span>
                 <span className="font-black text-zinc-800">230 <span className="text-[#10A66A]">种</span></span>
               </div>
               <div className="pl-1">
                 <span className="text-[10px] text-zinc-400 font-bold block leading-none pb-1">设备分类</span>
                 <span className="font-black text-zinc-850">10 类</span>
               </div>
             </div>
             
             {/* Dynamic context statistics */}
             <div className="space-y-0.5 pt-0.5 text-[10.5px]">
               <div className="flex justify-between">
                 <span className="text-zinc-400 font-semibold">当前分类:</span>
                 <span className="text-[#10A66A] font-black">{selectedDeviceCategory}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-zinc-400 font-semibold">当前匹配:</span>
                 <span className="text-zinc-750 font-black">
                   {deviceLibrary.filter((item) => {
                     const catMatch = selectedDeviceCategory === "全部设备" || item.category === selectedDeviceCategory;
                     const searchMatch = deviceSearchKeyword === "" || 
                       item.name.toLowerCase().includes(deviceSearchKeyword.toLowerCase()) || 
                       item.code.toLowerCase().includes(deviceSearchKeyword.toLowerCase());
                     return catMatch && searchMatch;
                   }).length} 种
                 </span>
               </div>
             </div>
           </div>

           {/* Fuzzy Search and Actions */}
           <div className="p-2 border-b border-zinc-200 bg-zinc-50/50 space-y-1.5">
             <div className="relative">
                <input 
                  type="text" 
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                  }}
                  placeholder="搜索设备名称/编号..."
                  className="w-full bg-white border border-zinc-200 rounded px-2 text-[10.5px] py-1 pl-6 focus:border-[#10A66A] outline-none placeholder:text-zinc-300"
                />
                <Search className="absolute left-2 top-2 w-3 h-3 text-zinc-400" />
             </div>
             <div className="flex gap-1">
               <button 
                 onClick={handleSearchSubmit} 
                 className="flex-grow bg-[#10A66A] hover:bg-[#0E905A] text-white text-[10.5px] font-extrabold py-1 rounded transition text-center cursor-pointer active:scale-95 shadow-2xs"
               >
                 搜索
               </button>
               <button 
                 onClick={handleSearchReset} 
                 className="bg-white hover:bg-zinc-50 text-zinc-550 border border-zinc-200 text-[10.5px] font-bold px-2 py-1 rounded transition text-center cursor-pointer active:scale-95"
               >
                 重置
               </button>
             </div>
           </div>

           {/* Scrollable Categories selectors */}
           <div className="flex h-[110px] shrink-0 overflow-y-auto bg-zinc-50 border-b border-zinc-200 p-1.5 flex-col gap-0.5 scrollbar-thin">
             <div className="text-[9.5px] text-zinc-400 font-bold px-1.5 pb-0.5">设备分类：</div>
             <button
               onClick={() => handleCategoryClick("全部设备")}
               className={`flex items-center justify-between text-[10.5px] px-2 py-1 rounded border transition-all text-left cursor-pointer font-bold ${
                 selectedDeviceCategory === "全部设备" 
                   ? "bg-[#EAF8F1] text-[#10A66A] border-[#CFEFE0]" 
                   : "bg-white text-zinc-650 border-zinc-150 hover:bg-zinc-100"
               }`}
             >
               <span>全部设备</span>
               <span className="text-[8.5px] font-black opacity-80">230</span>
             </button>
             {deviceCategories.map((cat) => {
               const isSelected = selectedDeviceCategory === cat.name;
               return (
                 <button
                   key={cat.name}
                   onClick={() => handleCategoryClick(cat.name)}
                   className={`flex items-center justify-between text-[10.5px] px-2 py-1 rounded border transition-all text-left cursor-pointer font-bold ${
                     isSelected 
                       ? "bg-[#EAF8F1] text-[#10A66A] border-[#CFEFE0]" 
                       : "bg-white text-zinc-650 border-zinc-150 hover:bg-zinc-100"
                   }`}
                 >
                   <span className="truncate max-w-[130px]">{cat.name}</span>
                   <span className="text-[8.5px] font-black opacity-80">{cat.count}</span>
                 </button>
               );
             })}
           </div>

           {/* Scrollable Matching Devices List */}
           <div className="flex-grow overflow-y-auto p-2 space-y-1.5 bg-[#FCFDFD] scrollbar-thin">
             <div className="text-[9.5px] text-zinc-400 font-bold px-1 flex justify-between items-center pb-0.5">
               <span>匹配设备列表：</span>
               <span className="font-mono text-zinc-400">
                 ({
                   deviceLibrary.filter((item) => {
                     const catMatch = selectedDeviceCategory === "全部设备" || item.category === selectedDeviceCategory;
                     const searchMatch = deviceSearchKeyword === "" || 
                       item.name.toLowerCase().includes(deviceSearchKeyword.toLowerCase()) || 
                       item.code.toLowerCase().includes(deviceSearchKeyword.toLowerCase());
                     return catMatch && searchMatch;
                   }).length
                 } 种)
               </span>
             </div>
             
             {deviceLibrary.filter((item) => {
                const catMatch = selectedDeviceCategory === "全部设备" || item.category === selectedDeviceCategory;
                const searchMatch = deviceSearchKeyword === "" || 
                  item.name.toLowerCase().includes(deviceSearchKeyword.toLowerCase()) || 
                  item.code.toLowerCase().includes(deviceSearchKeyword.toLowerCase());
                return catMatch && searchMatch;
             }).length === 0 ? (
               <div className="text-center py-6 text-zinc-400 text-[10.5px] font-medium">
                 暂无匹配设备
               </div>
             ) : (
               deviceLibrary.filter((item) => {
                  const catMatch = selectedDeviceCategory === "全部设备" || item.category === selectedDeviceCategory;
                  const searchMatch = deviceSearchKeyword === "" || 
                    item.name.toLowerCase().includes(deviceSearchKeyword.toLowerCase()) || 
                    item.code.toLowerCase().includes(deviceSearchKeyword.toLowerCase());
                  return catMatch && searchMatch;
               }).map((dev) => (
                 <div
                   key={dev.id}
                   onClick={() => {
                     setSelectedDeviceDetail(dev);
                     setSelectedNode(dev.name);
                   }}
                   className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 text-left group ${
                     selectedNode === dev.name
                       ? "bg-[#EAF8F1]/50 border-[#10A66A] text-[#10A66A]" 
                       : "bg-white border border-zinc-150 hover:border-zinc-300"
                   }`}
                 >
                   {/* Name & Badge */}
                   <div className="flex items-start justify-between">
                     <span className="text-[11px] font-black text-zinc-805 leading-tight group-hover:text-[#10A66A] transition-colors break-words max-w-[130px]" title={dev.name}>
                       {dev.name}
                     </span>
                     <span className="px-1 py-0.2 rounded text-[7.5px] font-black scale-90 bg-zinc-100 text-zinc-500 whitespace-nowrap">
                       {dev.comm}
                     </span>
                   </div>
                   
                   {/* Serial identifier */}
                   <div className="flex justify-between items-center text-[9px] font-mono font-bold text-zinc-400">
                     <span>{dev.code}</span>
                     <span className="text-[8.5px] bg-[#EAF8F1] border border-[#CFEFE0] text-[#10A66A] scale-90 rounded px-1 font-black shrink-0 origin-right">
                       在线
                     </span>
                   </div>
                   
                   {/* Pins count and Category tag */}
                   <div className="flex justify-between items-center text-[7.5px] text-zinc-500 border-t border-zinc-150 pt-1.5 leading-none mt-0.5">
                     <span className="truncate max-w-[85px] font-black border border-zinc-200 rounded px-1 py-0.2 bg-zinc-50 scale-95 origin-left">
                       {dev.category}
                     </span>
                     <span className="font-bold scale-95 origin-right text-zinc-455">
                       接线点:{dev.inputs.length + dev.outputs.length}
                     </span>
                   </div>

                   {/* Micro Actions Block */}
                   <div className="flex gap-1.5 pt-1.5 mt-0.5 border-t border-dashed border-zinc-150">
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         handleAddToCanvas(dev);
                       }}
                       className="flex-1 bg-[#10A66A] hover:bg-[#0E905A] text-white font-extrabold text-[8.5px] py-1 rounded transition text-center cursor-pointer shadow-3xs"
                     >
                       添加至画布
                     </button>
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedDeviceDetail(dev);
                         setSelectedNode(dev.name);
                       }}
                       className="px-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-650 font-bold text-[8.5px] py-1 rounded transition text-center cursor-pointer"
                     >
                       详情
                     </button>
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>

        {/* C. 设备树区域放在学习手册区右侧 - 宽度固定 230px (220px - 260px 内) */}
        <div style={{ display: "none" }} className="w-[230px] bg-white border-r border-zinc-200 flex flex-col shrink-0 h-full overflow-hidden">
           <div className="p-3 bg-zinc-50 border-b border-zinc-250 font-bold text-xs text-zinc-800">
             操作节点设备树
           </div>
           <div className="p-2 border-b border-zinc-100">
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="搜索网关传感器"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 text-[11px] py-1 pl-6 focus:bg-white outline-none"
                />
                <Search className="absolute left-2 top-2.5 w-3 h-3 text-zinc-400" />
             </div>
           </div>
           <div className="flex-grow overflow-y-auto p-1.5 space-y-1">
              {categories.map((cat, i) => (
                <div key={i} className="space-y-0.5">
                  <div 
                    onClick={() => toggleCat(cat.name)}
                    className="flex justify-between items-center py-1.5 px-2 hover:bg-zinc-50 rounded cursor-pointer text-xs font-bold text-zinc-700"
                  >
                    <span className="flex items-center gap-1">
                      {expandedCats.includes(cat.name) ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
                      {cat.name}
                    </span>
                    <span className="text-[10px] bg-zinc-100 px-1.5 py-0.2 rounded text-zinc-400">{cat.items.length}</span>
                  </div>
                  {expandedCats.includes(cat.name) && (
                    <div className="pl-4 space-y-0.5 pb-1">
                      {cat.items.map((item, j) => (
                        <div 
                          key={j}
                          onClick={() => handleAddDevice(item, cat.name === "⭐ 当前场景推荐设备")}
                          className="py-1 px-2.5 hover:bg-[#EAF8F1] hover:text-[#10A66A] rounded text-[11px] font-medium text-zinc-500 cursor-pointer flex items-center gap-1.5"
                        >
                          <div className="w-1.5 h-1.5 bg-[#10A66A] rounded-full opacity-65" />
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
           </div>
        </div>

        {/* D. 中间仿真画布区域 (占据剩余主要宽度) */}
        <div className="flex-grow flex flex-col overflow-hidden h-full bg-white select-none min-w-[500px]">
          
          {/* Canvas Micro Toolbar Controller */}
          <div className="bg-zinc-50 border-b border-zinc-200 px-3 py-1 flex items-center justify-between shrink-0 select-none text-[10.5px]">
            <div className="flex items-center gap-1">
               {[
                 { icon: FilePlus, label: "新建连线" },
                 { icon: Upload, label: "载入配置" },
                 { icon: Download, label: "输出报告" },
               ].map((b, idx) => (
                 <button key={idx} onClick={() => {
                   showToast(`已执行：${b.label}`);
                   addLog(`控制栏操作: ${b.label}`);
                 }} className="p-1 px-2 hover:bg-[#EAF8F1] hover:text-[#10A66A] rounded text-zinc-500 transition-all flex flex-col items-center gap-0.5">
                   <b.icon className="w-3.5 h-3.5" />
                   <span className="text-[8px] font-bold">{b.label}</span>
                 </button>
               ))}
               <div className="w-px h-5 bg-zinc-200 mx-1" />
               <button onClick={() => {
                 showToast("画布重算，缩放适配完成");
                 addLog("调整画布自适应大小: 100%");
               }} className="p-1 px-2 hover:bg-[#EAF8F1] hover:text-[#10A66A] rounded text-zinc-500 flex flex-col items-center gap-0.5">
                 <ZoomIn className="w-3.5 h-3.5" />
                 <span className="text-[8.5px] font-black">缩放100%</span>
               </button>
            </div>
            
            <div className="text-[10px] text-zinc-400 font-bold truncate max-w-[150px] hidden sm:block">
              当前网络：对等总线逻辑
            </div>
          </div>

          {/* Core Grid Canvas Area */}
          <div 
            id="v-canvas-stage animate-fade-in"
            className="flex-1 relative p-4 overflow-hidden flex items-center justify-center border-b border-zinc-250 cursor-grab"
            style={(() => {
              let bgImage = "none";
              let bgSize = "25px 25px";
              let bgColor = "#F9FAFA";

              const baseColor = currentBackground === "custom" ? (colorMap[backgroundColor] || "#F9FAFA") : "#F8FAF9";

              let gridDotColor = "#e2e8f0";
              if (gridSize === "小网格") {
                bgSize = "15px 15px";
                gridDotColor = "#e2e8f0";
              } else if (gridSize === "大网格") {
                bgSize = "40px 40px";
                gridDotColor = "#cbd5e1";
              } else {
                bgSize = "25px 25px";
                gridDotColor = "#cbd5e1";
              }

              const gridPart = `radial-gradient(${gridDotColor} 1.5px, transparent 0)`;

              if (currentBackground === "custom") {
                if (backgroundType === "纯色背景") {
                  bgColor = baseColor;
                  bgImage = showGrid ? gridPart : "none";
                } else if (backgroundType === "渐变背景") {
                  let gradientPart = `linear-gradient(135deg, #FFFFFF 0%, ${baseColor} 100%)`;
                  bgImage = showGrid ? `${gridPart}, ${gradientPart}` : gradientPart;
                } else if (backgroundType === "网格背景") {
                  bgColor = baseColor;
                  bgImage = gridPart; 
                } else if (backgroundType === "图片背景") {
                  let imagePlaceholderPart = `linear-gradient(rgba(16, 166, 106, 0.02), rgba(16, 166, 106, 0.02))`;
                  bgImage = showGrid ? `${gridPart}, ${imagePlaceholderPart}` : imagePlaceholderPart;
                  bgColor = baseColor;
                }
              } else {
                bgImage = showGrid ? gridPart : "none";
                bgColor = "#F9FAFA";
              }

              return {
                backgroundColor: bgColor,
                backgroundImage: bgImage,
                backgroundSize: bgSize,
              };
            })()}
          >
             {/* Scene Background Illustration Overlay */}
             <div 
               className="absolute inset-0 pointer-events-none z-0 select-none flex items-center justify-center overflow-hidden transition-all duration-300"
               style={{ opacity: currentBackground === "custom" ? (backgroundOpacity / 100) : 0.4 }}
             >
                {currentBackground === "default" ? (
                  <>
                    {currentScene === "智慧牧场" && renderRanchBackground()}
                    {currentScene === "智慧家居" && renderHomeBackground()}
                    {currentScene === "智慧温室" && renderGreenhouseBackground()}
                    {currentScene === "智慧矿山" && renderMineBackground()}
                  </>
                ) : (
                  <div className="text-zinc-600 font-bold max-w-md text-center flex flex-col items-center gap-3 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-zinc-200/50 shadow-md transform scale-95">
                    <Sliders className="w-8 h-8 text-[#10A66A] animate-pulse" />
                    <div className="space-y-1">
                      <span className="text-xs text-zinc-400 block font-mono">CUSTOM BACKGROUND ACTIVATED</span>
                      <span className="text-sm text-zinc-850 font-extrabold block">{customBackgroundName}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-mono border">
                        类型: {backgroundType}
                      </span>
                      <span className="text-[10px] bg-zinc-100 text-[#10A66A] px-2 py-0.5 rounded font-mono border border-emerald-100">
                        颜色: {backgroundColor}
                      </span>
                    </div>
                  </div>
                )}
             </div>

             {/* Dynamic Status Assist HUD */}
             <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 text-[10px] font-bold select-none pointer-events-auto">
                <div className="text-zinc-700 bg-white/95 p-3.5 rounded-xl border border-zinc-200/80 shadow-md space-y-1.5 w-[180px] hover:shadow-lg transition-all duration-150">
                   <div className="flex items-center gap-1.5 pb-1 border-b border-zinc-150 text-[10.5px]">
                     <span className="w-2 h-2 rounded-full bg-[#10A66A]" />
                     <span className="text-zinc-500 font-extrabold uppercase">画布环境状态</span>
                   </div>
                   <div className="space-y-0.5">
                     <div className="flex justify-between">
                       <span className="text-zinc-400 font-semibold">当前场景:</span>
                       <span className="text-[#10A66A] font-black">{currentScene}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-zinc-400 font-semibold">背景样式:</span>
                       <span className="text-zinc-750 font-black truncate max-w-[90px]" title={currentBackground === "default" ? "默认背景" : customBackgroundName}>
                         {currentBackground === "default" ? "默认背景" : customBackgroundName}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-zinc-400 font-semibold">画布缩放:</span>
                       <span className="text-zinc-500 font-mono">100%</span>
                     </div>
                   </div>
                </div>
                
                <div className={`flex items-[#10A66A] items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-lg border shadow-xs w-[180px] transition-all duration-300 ${
                  lineCheckStatus === "检测完成"
                    ? (hasRepaired ? "text-[#10A66A] border-[#CFEFE0]" : "text-rose-500 border-rose-200")
                    : lineCheckStatus === "检测中"
                      ? "text-amber-500 border-amber-200"
                      : "text-[#10A66A] border-[#CFEFE0]"
                }`}>
                   <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                     lineCheckStatus === "检测完成"
                       ? (hasRepaired ? "bg-[#10A66A]" : "bg-rose-500")
                       : lineCheckStatus === "检测中"
                         ? "bg-amber-500 animate-spin"
                         : "bg-[#10A66A]"
                   }`} />
                   <span>
                      自动连线：{
                        lineCheckStatus === "检测完成"
                          ? (hasRepaired ? "已校验·全正常" : "发现 1 处异常")
                          : lineCheckStatus === "检测中"
                            ? "连线拓扑重算中"
                            : "待启动验证检测"
                      }
                    </span>
                </div>
             </div>

             {/* Canvas Drawing Devices representing Gateway & Sensor (Centered placeholder) */}
             {/* Center Board Simulator Container */}
              <div id="physical-nodes-canvas-board" className="w-[760px] h-[350px] shrink-0 relative bg-zinc-50/5 rounded-2xl border border-zinc-200/40 p-4 select-none animate-in fade-in duration-300">
                 
                 {/* Live SVG Connection lines overlay */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="context-stroke" />
                      </marker>
                    </defs>

                    {/* Wire 1: 温湿度传感器 -> Modbus网关 */}
                    <path 
                      id="wire-sn1"
                      d="M 140 180 C 190 180, 200 110, 250 110" 
                      stroke="#10A66A" 
                      strokeWidth="2" 
                      fill="none" 
                      markerEnd="url(#arrow)"
                      className="transition-all duration-300"
                    />
                    <circle r="2.5" fill="#10A66A">
                      <animateMotion path="M 140 180 C 190 180, 200 110, 250 110" dur="3s" repeatCount="indefinite" />
                    </circle>

                    {/* Wire 2: 光照传感器 -> Modbus网关 */}
                    <path 
                      id="wire-sn2"
                      d="M 140 295 C 190 295, 200 150, 250 150" 
                      stroke="#10A66A" 
                      strokeWidth="2" 
                      fill="none" 
                      markerEnd="url(#arrow)"
                      className="transition-all duration-300"
                    />
                    <circle r="2.5" fill="#10A66A">
                      <animateMotion path="M 140 295 C 190 295, 200 150, 250 150" dur="3.5s" repeatCount="indefinite" />
                    </circle>

                    {/* Wire 3: Modbus网关 -> 云平台节点 */}
                     <path 
                       id="wire-mqtt-cloud-gw"
                       d="M 410 160 C 395 160, 405 130, 390 130" 
                       stroke={highlightedDevices.cloud || highlightedDevices.gateway ? "#10A66A" : "#10A66A"} 
                       strokeWidth={highlightedDevices.cloud || highlightedDevices.gateway ? "3.5" : "2"} 
                       strokeDasharray="5 3"
                       fill="none" 
                       markerEnd="url(#arrow)"
                       className="transition-all duration-300"
                     />
                     <circle r="3" fill="#10A66A">
                       <animateMotion path="M 410 160 C 395 160, 405 130, 390 130" dur="2.5s" repeatCount="indefinite" />
                     </circle>

                     {/* Modbus Gateway -> Relay (Modbus Control) */}
                     <path 
                       id="wire-gw-relay"
                       d="M 320 185 L 320 215" 
                       stroke={highlightedDevices.gateway || highlightedDevices.relay ? "#10A66A" : "#10A66A"} 
                       strokeWidth={highlightedDevices.gateway || highlightedDevices.relay ? "3.5" : "2"} 
                       fill="none" 
                       markerEnd="url(#arrow)"
                       className="transition-all duration-300"
                     />
                     <circle r="3" fill="#059669">
                       <animateMotion path="M 320 185 L 320 215" dur="1.8s" repeatCount="indefinite" />
                     </circle>

                     {/* Relay -> Fan execution output */}
                     <path 
                       id="wire-relay-fan-new"
                       d="M 390 235 C 470 235, 470 50, 580 50" 
                       stroke={actuatorStates.fan === "运行中" ? "#10A66A" : (highlightedDevices.fan ? "#10A66A" : "#E4E4E7")} 
                       strokeWidth={highlightedDevices.fan ? "3" : "2"} 
                       fill="none" 
                       markerEnd="url(#arrow)"
                       className="transition-all duration-300"
                     />
                     {actuatorStates.fan === "运行中" && (
                       <circle r="2.5" fill="#10A66A">
                         <animateMotion path="M 390 235 C 470 235, 470 50, 580 50" dur="2s" repeatCount="indefinite" />
                       </circle>
                     )}

                     {/* Relay -> Pump execution output */}
                     <path 
                       id="wire-relay-pump"
                       d="M 390 245 C 470 245, 470 130, 580 130" 
                       stroke={actuatorStates.pump === "运行中" ? "#10A66A" : (highlightedDevices.pump ? "#10A66A" : "#E4E4E7")} 
                       strokeWidth={highlightedDevices.pump ? "3" : "2"} 
                       fill="none" 
                       markerEnd="url(#arrow)"
                       className="transition-all duration-300"
                     />
                     {actuatorStates.pump === "运行中" && (
                       <circle r="2.5" fill="#10A66A">
                         <animateMotion path="M 390 245 C 470 245, 470 130, 580 130" dur="2s" repeatCount="indefinite" />
                       </circle>
                     )}

                     {/* Relay -> Light execution output */}
                     <path 
                       id="wire-relay-light"
                       d="M 390 255 C 470 255, 470 210, 580 210" 
                       stroke={actuatorStates.light === "开启" ? "#10A66A" : (highlightedDevices.light ? "#10A66A" : "#E4E4E7")} 
                       strokeWidth={highlightedDevices.light ? "3" : "2"} 
                       fill="none" 
                       markerEnd="url(#arrow)"
                       className="transition-all duration-300"
                     />
                     {actuatorStates.light === "开启" && (
                       <circle r="2.5" fill="#10A66A">
                         <animateMotion path="M 390 255 C 470 255, 470 210, 580 210" dur="2s" repeatCount="indefinite" />
                       </circle>
                     )}

                     {/* Relay -> Alarm execution output */}
                     <path 
                       id="wire-relay-alarm"
                       d="M 390 265 C 470 265, 470 290, 580 290" 
                       stroke={actuatorStates.alarm === "报警中" ? "#EF4444" : (highlightedDevices.alarm ? "#10A66A" : "#E4E4E7")} 
                       strokeWidth={highlightedDevices.alarm ? "3" : "2"} 
                       fill="none" 
                       markerEnd="url(#arrow)"
                       className="transition-all duration-300"
                     />
                     {actuatorStates.alarm === "报警中" && (
                       <circle r="2.5" fill="#EF4444">
                         <animateMotion path="M 390 265 C 470 265, 470 290, 580 290" dur="1.2s" repeatCount="indefinite" />
                       </circle>
                     )}

                     {/* Labels on flow wires */}
                     <text x="350" y="115" fill="#10A66A" fontSize="7.5" fontWeight="bold" className="pointer-events-none" textAnchor="middle">MQTT 控制链路</text>
                     <text x="280" y="205" fill="#059669" fontSize="7.5" fontWeight="bold" className="pointer-events-none" textAnchor="middle">Modbus 控制</text>
                     <text x="440" y="275" fill="#71717A" fontSize="7.5" fontWeight="black" className="pointer-events-none" textAnchor="middle">继电器 ➔ 执行输出</text>

                     {/* Additional repair VCC & GND wire overlays */}
                     {hasRepaired && (
                       <>
                         <path 
                           id="wire-vcc"
                           d="M 140 40 C 350 10, 350 45, 580 45" 
                           stroke="#EF4444" 
                           strokeWidth="2" 
                           fill="none" 
                           markerEnd="url(#arrow)"
                           className="animate-in fade-in duration-300"
                         />
                         <circle r="2.5" fill="#EF4444">
                           <animateMotion path="M 140 40 C 350 10, 350 45, 580 45" dur="2.8s" repeatCount="indefinite" />
                         </circle>

                         <path 
                           id="wire-gnd"
                           d="M 140 60 C 350 30, 350 50, 580 50" 
                           stroke="#3B82F6" 
                           strokeWidth="2" 
                           fill="none" 
                           markerEnd="url(#arrow)"
                           className="animate-in fade-in duration-300"
                         />
                         <circle r="2.5" fill="#3B82F6">
                           <animateMotion path="M 140 60 C 350 30, 350 50, 580 50" dur="2.8s" repeatCount="indefinite" />
                         </circle>
                       </>
                     )}

                     {/* Additional repair GND wire overlay */}
                     {hasRepaired && (
                       <>
                         <path 
                           id="wire-gnd-extra"
                           d="M 140 70 C 350 50, 350 55, 580 55" 
                           stroke="#3B82F6" 
                           strokeWidth="2" 
                           fill="none" 
                           markerEnd="url(#arrow)"
                           className="animate-in fade-in duration-300"
                         />
                         <circle r="2.5" fill="#3B82F6">
                           <animateMotion path="M 140 70 C 350 50, 350 55, 580 55" dur="3s" repeatCount="indefinite" />
                         </circle>
                       </>
                     )}
                  </svg>

                 {/* Absolute Card 1: 电源模块 */}
                 <div 
                   style={{ left: "20px", top: "15px" }} 
                   onClick={() => setSelectedNode("电源模块")}
                   className={`absolute w-[120px] h-[75px] bg-white border-2 rounded-xl p-2 shadow-sm flex flex-col gap-1 cursor-pointer transition-all z-10 ${
                     selectedNode === "电源模块" ? "border-amber-500 ring-2 ring-amber-100" : "border-zinc-200 hover:border-zinc-300"
                   }`}
                 >
                    <div className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded text-center truncate">
                      电源模块
                    </div>
                    <div className="text-[8px] text-zinc-400 font-mono text-center">
                      Output: DC 12V/24V
                    </div>
                    <div className="flex justify-between text-[8.5px] font-mono text-zinc-400 border-t border-zinc-100 pt-1 mt-0.5 font-bold">
                      <span className="text-red-500">VCC</span>
                      <span className="text-blue-500">GND</span>
                    </div>
                 </div>

                 {/* Absolute Card 2: 温湿度传感器 */}
                 <div 
                   style={{ left: "15px", top: "105px" }} 
                   onClick={() => { setSelectedNode("温湿度传感器"); setSelectedSensor("温湿度传感器"); }}
                   className={`absolute w-[110px] h-[105px] bg-white border-2 rounded-xl p-2 shadow-xs flex flex-col gap-1 cursor-pointer transition-all duration-300 z-10 ${
                     pulseSensor["温湿度传感器"] ? "scale-102 border-[#10A66A] shadow-md ring-2 ring-emerald-500/20" : ""
                   } ${
                     selectedNode === "温湿度传感器" ? "border-[#10A66A] ring-2 ring-[#10A66A]/20 shadow-md" : "border-zinc-200 hover:border-zinc-300"
                   }`}
                 >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-zinc-800 leading-tight">温湿度</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                    <div className="text-[8px] text-zinc-400 leading-none">有线传感器</div>
                    
                    <div className="text-[9.2px] font-mono font-bold text-zinc-700 space-y-0.5 pt-1 grow">
                      <div className="flex justify-between">
                        <span className="text-zinc-400 font-medium font-sans">温:</span>
                        <span>{sensorCurrentValues["温湿度传感器"]?.["温度"]?.toFixed(1) ?? "24.6"} ℃</span>
                      </div>
                      <div className="flex justify-between border-t border-zinc-50 pt-0.5">
                        <span className="text-zinc-400 font-medium font-sans">湿:</span>
                        <span>{sensorCurrentValues["温湿度传感器"]?.["湿度"]?.toFixed(1) ?? "58.0"} %</span>
                      </div>
                    </div>
                    
                    <div className="pt-1 mt-auto border-t border-zinc-100 flex items-center justify-between text-[7px] leading-none">
                      {isGenerating["温湿度传感器"] ? (
                        <span className="bg-[#EAF8F1] text-[#10A66A] px-1 py-0.5 rounded font-black animate-pulse flex items-center gap-0.5 border border-[#CFEFE0]">
                          生成中
                        </span>
                      ) : (
                        <span className="bg-zinc-50 text-zinc-400 px-1 py-0.5 rounded font-bold border border-zinc-100">
                          已停止
                        </span>
                      )}
                      <span className="text-zinc-300 font-bold">DATA</span>
                    </div>
                 </div>

                 {/* Absolute Card 3: 光照传感器 */}
                 <div 
                   style={{ left: "15px", top: "225px" }} 
                   onClick={() => { setSelectedNode("光照传感器"); setSelectedSensor("光照传感器"); }}
                   className={`absolute w-[110px] h-[95px] bg-white border-2 rounded-xl p-2 shadow-xs flex flex-col gap-1 cursor-pointer transition-all duration-300 z-10 ${
                     pulseSensor["光照传感器"] ? "scale-102 border-[#10A66A] shadow-md ring-2 ring-emerald-500/20" : ""
                   } ${
                     selectedNode === "光照传感器" ? "border-[#10A66A] ring-2 ring-[#10A66A]/20 shadow-md" : "border-zinc-200 hover:border-zinc-300"
                   }`}
                 >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-zinc-800 leading-tight">光照强度</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                    <div className="text-[8px] text-zinc-400 leading-none">本安型传感器</div>
                    
                    <div className="text-[9.2px] font-mono font-bold text-zinc-700 space-y-0.5 pt-2 grow">
                      <div className="flex justify-between">
                        <span className="text-zinc-400 font-medium font-sans">光强:</span>
                        <span className="text-emerald-700 font-black">{Math.round(sensorCurrentValues["光照传感器"]?.["光照强度"] ?? 450)} lx</span>
                      </div>
                    </div>
                    
                    <div className="pt-1 mt-auto border-t border-zinc-100 flex items-center justify-between text-[7px] leading-none">
                      {isGenerating["光照传感器"] ? (
                        <span className="bg-[#EAF8F1] text-[#10A66A] px-1 py-0.5 rounded font-black animate-pulse flex items-center gap-0.5 border border-[#CFEFE0]">
                          生成中
                        </span>
                      ) : (
                        <span className="bg-zinc-50 text-zinc-400 px-1 py-0.5 rounded font-bold border border-zinc-100">
                          已停止
                        </span>
                      )}
                      <span className="text-zinc-300 font-bold">AO</span>
                    </div>
                 </div>

                 {/* Absolute Card: 二氧化碳传感器 */}
                 <div 
                   style={{ left: "135px", top: "105px" }} 
                   onClick={() => { setSelectedNode("二氧化碳传感器"); setSelectedSensor("二氧化碳传感器"); }}
                   className={`absolute w-[105px] h-[75px] bg-white border-2 rounded-xl p-2 shadow-xs flex flex-col gap-1 cursor-pointer transition-all duration-300 z-10 ${
                     pulseSensor["二氧化碳传感器"] ? "scale-102 border-[#10A66A] shadow-md ring-2 ring-emerald-500/20" : ""
                   } ${
                     selectedNode === "二氧化碳传感器" ? "border-[#10A66A] ring-2 ring-[#10A66A]/20 shadow-md" : "border-zinc-200 hover:border-zinc-300"
                   }`}
                 >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-zinc-800 leading-tight font-sans">二氧化碳</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                    <div className="text-[8px] text-zinc-400 leading-none">红外分析式</div>
                    
                    <div className="text-[9.2px] font-mono font-bold text-zinc-700 space-y-0.5 pt-1.5 grow">
                      <div className="flex justify-between">
                        <span className="text-zinc-400 font-medium font-sans">CO2:</span>
                        <span>{Math.round(sensorCurrentValues["二氧化碳传感器"]?.["二氧化碳浓度"] ?? 620)} ppm</span>
                      </div>
                    </div>
                    
                    <div className="pt-1 mt-auto border-t border-zinc-100 flex items-center justify-between text-[7px] leading-none">
                      {isGenerating["二氧化碳传感器"] ? (
                        <span className="bg-[#EAF8F1] text-[#10A66A] px-1 py-0.5 rounded font-black animate-pulse flex items-center gap-0.5 border border-[#CFEFE0]">
                          生成中
                        </span>
                      ) : (
                        <span className="bg-zinc-50 text-zinc-400 px-1 py-0.5 rounded font-bold border border-zinc-100">
                          已停止
                        </span>
                      )}
                      <span className="text-zinc-300 font-bold">RTU</span>
                    </div>
                 </div>

                 {/* Absolute Card: 土壤湿度传感器 */}
                 <div 
                   style={{ left: "135px", top: "185px" }} 
                   onClick={() => { setSelectedNode("土壤湿度传感器"); setSelectedSensor("土壤湿度传感器"); }}
                   className={`absolute w-[105px] h-[75px] bg-white border-2 rounded-xl p-2 shadow-xs flex flex-col gap-1 cursor-pointer transition-all duration-300 z-10 ${
                     pulseSensor["土壤湿度传感器"] ? "scale-102 border-[#10A66A] shadow-md ring-2 ring-emerald-500/20" : ""
                   } ${
                     selectedNode === "土壤湿度传感器" ? "border-[#10A66A] ring-2 ring-[#10A66A]/20 shadow-md" : "border-zinc-200 hover:border-zinc-300"
                   }`}
                 >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-zinc-800 leading-tight">土壤湿度</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                    <div className="text-[8px] text-zinc-400 leading-none">电容式探针</div>
                    
                    <div className="text-[9.2px] font-mono font-bold text-zinc-700 space-y-0.5 pt-1.5 grow">
                      <div className="flex justify-between">
                        <span className="text-zinc-400 font-medium font-sans">湿度:</span>
                        <span>{Math.round(sensorCurrentValues["土壤湿度传感器"]?.["土壤湿度"] ?? 36)} %</span>
                      </div>
                    </div>
                    
                    <div className="pt-1 mt-auto border-t border-zinc-100 flex items-center justify-between text-[7px] leading-none">
                      {isGenerating["土壤湿度传感器"] ? (
                        <span className="bg-[#EAF8F1] text-[#10A66A] px-1 py-0.5 rounded font-black animate-pulse flex items-center gap-0.5 border border-[#CFEFE0]">
                          生成中
                        </span>
                      ) : (
                        <span className="bg-zinc-50 text-zinc-400 px-1 py-0.5 rounded font-bold border border-zinc-100">
                          已停止
                        </span>
                      )}
                      <span className="text-zinc-300 font-bold">AI</span>
                    </div>
                 </div>

                 {/* Absolute Card: 烟雾传感器 */}
                 <div 
                   style={{ left: "135px", top: "265px" }} 
                   onClick={() => { setSelectedNode("烟雾传感器"); setSelectedSensor("烟雾传感器"); }}
                   className={`absolute w-[105px] h-[75px] bg-white border-2 rounded-xl p-2 shadow-xs flex flex-col gap-1 cursor-pointer transition-all duration-300 z-10 ${
                     pulseSensor["烟雾传感器"] ? "scale-102 border-[#10A66A] shadow-md ring-2 ring-emerald-500/20" : ""
                   } ${
                     selectedNode === "烟雾传感器" ? "border-[#10A66A] ring-2 ring-[#10A66A]/20 shadow-md" : "border-zinc-200 hover:border-zinc-300"
                   }`}
                 >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-zinc-800 leading-tight">烟雾探测</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                    <div className="text-[8px] text-zinc-400 leading-none">气体分析半导体</div>
                    
                    <div className="text-[9.2px] font-mono font-bold text-zinc-700 space-y-0.5 pt-1.5 grow">
                      <div className="flex justify-between">
                        <span className="text-zinc-400 font-medium font-sans">浓度:</span>
                        <span>{(sensorCurrentValues["烟雾传感器"]?.["烟雾浓度"] ?? 0.03).toFixed(3)} mg</span>
                      </div>
                    </div>
                    
                    <div className="pt-1 mt-auto border-t border-zinc-100 flex items-center justify-between text-[7px] leading-none">
                      {isGenerating["烟雾传感器"] ? (
                        <span className="bg-[#EAF8F1] text-[#10A66A] px-1 py-0.5 rounded font-black animate-pulse flex items-center gap-0.5 border border-[#CFEFE0]">
                          生成中
                        </span>
                      ) : (
                        <span className="bg-zinc-50 text-zinc-400 px-1 py-0.5 rounded font-bold border border-zinc-100">
                          已停止
                        </span>
                      )}
                      <span className="text-zinc-300 font-bold">DIN</span>
                    </div>
                 </div>

                 {/* Absolute Card 4: Modbus网关 */}
                  <div 
                    style={{ left: "250px", top: "80px" }} 
                    onClick={() => { setSelectedNode("Modbus网关"); setSelectedDeviceDetail(deviceLibrary.find(d => d.name === "Modbus网关") || null); }}
                    className={`absolute w-[140px] h-[105px] bg-white border-2 rounded-xl p-2 shadow-xs flex flex-col gap-1 cursor-pointer transition-all duration-300 z-10 ${
                      highlightedDevices.gateway 
                        ? "border-[#10A66A] ring-4 ring-[#10A66A]/20 scale-102"
                        : selectedNode === "Modbus网关" 
                        ? "border-[#10A66A] ring-2 ring-[#10A66A]/20" 
                        : "border-zinc-200 hover:border-[#10A66A]/30"
                    }`}
                  >
                     <div className="bg-[#10A66A] text-white text-[9px] font-black px-1 rounded text-center truncate">
                       Modbus网关
                     </div>
                     <div className="text-[8px] text-zinc-400 font-mono text-center pt-0.5">
                       IP: 192.168.1.18
                     </div>
                     <div className="flex items-center gap-1 justify-center py-0.5 border-t border-b border-zinc-100 my-0.5 shrink-0">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                        <span className="text-[8px] font-bold text-emerald-600 font-mono scale-95">FLOW ACTIVE</span>
                     </div>
                     <div className="flex justify-between text-[7.5px] font-mono font-bold text-zinc-400 mt-auto">
                       <span>DI1/AI1</span>
                       <span className="text-[#10A66A]">MQTT 网关</span>
                     </div>
                  </div>

                  {/* Absolute Card 5: 继电器 */}
                  <div 
                    style={{ left: "250px", top: "215px" }} 
                    onClick={() => { setSelectedNode("继电器"); setSelectedDeviceDetail(deviceLibrary.find(d => d.name === "智能继电器") || null); }}
                    className={`absolute w-[140px] h-[100px] bg-white border-2 rounded-xl p-2 shadow-xs flex flex-col gap-1 cursor-pointer transition-all duration-300 z-10 ${
                      highlightedDevices.relay 
                        ? "border-[#10A66A] ring-4 ring-[#10A66A]/20 scale-102"
                        : selectedNode === "继电器" 
                        ? "border-[#10A66A] ring-2 ring-[#10A66A]/20 font-extrabold shadow-sm"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                     <div className="bg-[#10A66A] text-white text-[9px] font-black px-1 rounded text-center truncate">
                       智能继电器 (Relay)
                     </div>
                     <div className="text-[8px] text-zinc-400 font-mono text-center">
                       ID: relay-001
                     </div>
                     <div className="text-[9px] font-bold text-zinc-500 text-center py-1">
                       控制状态: <span className={`font-black ${actuatorStates.relay === "闭合" ? "text-[#10A66A]" : "text-zinc-400"}`}>
                         {actuatorStates.relay === "闭合" ? "● CLOSED [闭合]" : "○ OPEN [断开]"}
                       </span>
                     </div>
                     <div className="flex justify-between text-[7px] font-mono font-bold text-zinc-400 border-t border-zinc-100 pt-1 mt-auto">
                       <span>IN 接收</span>
                       <span className={actuatorStates.relay === "闭合" ? "text-[#10A66A]" : "text-zinc-400"}>OUT 常开</span>
                     </div>
                  </div>

                  {/* Absolute Card 6: 云平台节点 */}
                  <div 
                    style={{ left: "410px", top: "115px" }} 
                    onClick={() => { setSelectedNode("云平台节点"); }}
                    className={`absolute w-[130px] h-[95px] bg-white border-2 rounded-xl p-2.5 shadow-xs flex flex-col gap-1 cursor-pointer transition-all duration-300 z-15 ${
                      highlightedDevices.cloud 
                        ? "border-emerald-500 ring-4 ring-emerald-500/20 scale-102"
                        : selectedNode === "云平台节点" 
                        ? "border-[#10A66A] ring-2 ring-[#10A66A]/20 shadow-sm" 
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                     <div className="bg-[#10A66A] text-white text-[9px] font-black px-1 py-0.5 rounded text-center truncate">
                       物联网云平台
                     </div>
                     <div className="text-[7.5px] text-zinc-400 font-mono text-center pt-0.5">
                       iot.integrated.edu
                     </div>
                     <div className="text-[8.5px] font-bold text-center text-zinc-500 pt-1 grow">
                       状态: <span className="text-[#10A66A] font-black">● 已连接正常</span>
                     </div>
                     <div className="flex justify-start text-[7px] font-mono font-bold text-zinc-400 border-t border-zinc-100 pt-1 mt-auto">
                       <span className="text-emerald-600">MQTT TLS</span>
                     </div>
                  </div>

                  {/* Absolute Card 7: 风机 */}
                  <div 
                    style={{ left: "580px", top: "15px" }} 
                    onClick={() => { setSelectedNode("风机"); }}
                    className={`absolute w-[145px] h-[72px] bg-white border-2 rounded-xl p-2 shadow-xs flex flex-col gap-1 cursor-pointer transition-all duration-300 z-10 ${
                      highlightedDevices.fan 
                        ? "border-emerald-500 ring-4 ring-emerald-500/20 scale-102 shadow-md"
                        : selectedNode === "风机" 
                        ? "border-[#10A66A] ring-2 ring-[#10A66A]/20 shadow-sm" 
                        : actuatorStates.fan === "运行中"
                        ? "border-emerald-500/50 bg-[#EAF8F1]/10"
                        : (locateHighlighted && !hasRepaired ? "border-rose-500 ring-2 ring-rose-300 bg-rose-50/10 animate-pulse" : "border-zinc-200 hover:border-zinc-300")
                    }`}
                  >
                     <div className="flex items-center justify-between">
                       <span className="text-[9.5px] font-black text-zinc-800 leading-none">风机控制器</span>
                       <span className="text-[7.5px] text-zinc-400 font-mono">D_01</span>
                     </div>
                     <div className="flex items-center justify-between py-0.5 border-b border-t border-zinc-100 my-0.5 grow">
                       <span className="text-[8.5px] font-bold text-zinc-400">转速:</span>
                       <span className={`font-mono text-[9px] font-extrabold ${actuatorStates.fan === "运行中" ? "text-emerald-600 animate-pulse" : "text-zinc-400"}`}>
                         {actuatorStates.fan === "运行中" ? "2400 RPM" : "0 RPM (停止)"}
                       </span>
                     </div>
                     <div className="flex justify-between text-[7px] font-mono text-zinc-400 leading-none">
                       <span className="text-red-500 font-bold">VCC</span>
                       <span className={`px-1 rounded text-[7px] font-bold leading-none ${actuatorStates.fan === "运行中" ? "bg-emerald-50 text-emerald-800" : "bg-zinc-100 text-zinc-500"}`}>
                         {actuatorStates.fan}
                       </span>
                       <span className="text-blue-500 font-bold">GND</span>
                     </div>
                  </div>

                  {/* Absolute Card 8: 水泵 */}
                  <div 
                    style={{ left: "580px", top: "95px" }} 
                    onClick={() => { setSelectedNode("水泵"); }}
                    className={`absolute w-[145px] h-[72px] bg-white border-2 rounded-xl p-2 shadow-xs flex flex-col gap-1 cursor-pointer transition-all duration-300 z-10 ${
                      highlightedDevices.pump 
                        ? "border-emerald-500 ring-4 ring-emerald-500/20 scale-102 shadow-md"
                        : selectedNode === "水泵" 
                        ? "border-[#10A66A] ring-2 ring-[#10A66A]/20 shadow-sm" 
                        : actuatorStates.pump === "运行中"
                        ? "border-emerald-500/50 bg-[#EAF8F1]/15"
                        : !isPumpOnline
                        ? "border-rose-400/50 bg-rose-50/15"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                     <div className="flex items-center justify-between">
                       <span className="text-[9.5px] font-black text-zinc-800 leading-none">智慧水泵 (Pump)</span>
                       <span className="text-[7.5px] text-zinc-400 font-mono">D_02</span>
                     </div>
                     <div className="flex items-center justify-between py-0.5 border-b border-t border-zinc-100 my-0.5 grow">
                       <span className="text-[8.5px] font-bold text-zinc-400">状态:</span>
                       <span className={`font-mono text-[9px] font-extrabold ${
                         !isPumpOnline ? "text-rose-500" : actuatorStates.pump === "运行中" ? "text-emerald-600 animate-pulse" : "text-zinc-400"
                       }`}>
                         {!isPumpOnline ? "● 离线 (异常)" : actuatorStates.pump === "运行中" ? "● 排水中" : "○ 已关闭"}
                       </span>
                     </div>
                     <div className="flex justify-between text-[7px] font-mono text-zinc-450 leading-none">
                       <span>ADDR: 0x06</span>
                       <span className={`px-1 rounded text-[7px] font-bold leading-none ${
                         !isPumpOnline ? "bg-rose-50 text-rose-700" : actuatorStates.pump === "运行中" ? "bg-emerald-50 text-emerald-800" : "bg-zinc-100 text-zinc-500"
                       }`}>
                         {!isPumpOnline ? "FAIL" : actuatorStates.pump}
                       </span>
                     </div>
                  </div>

                  {/* Absolute Card 9: 补光灯 */}
                  <div 
                    style={{ left: "580px", top: "175px" }} 
                    onClick={() => { setSelectedNode("补光灯"); }}
                    className={`absolute w-[145px] h-[72px] bg-white border-2 rounded-xl p-2 shadow-xs flex flex-col gap-1 cursor-pointer transition-all duration-300 z-10 ${
                      highlightedDevices.light 
                        ? "border-emerald-500 ring-4 ring-emerald-500/20 scale-102 shadow-md"
                        : selectedNode === "补光灯" 
                        ? "border-[#10A66A] ring-2 ring-[#10A66A]/20 shadow-sm" 
                        : actuatorStates.light === "开启"
                        ? "border-emerald-500/50 bg-[#EAF8F1]/15"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                     <div className="flex items-center justify-between">
                       <span className="text-[9.5px] font-black text-zinc-800 leading-none">补光灯控制器</span>
                       <span className="text-[7.5px] text-zinc-400 font-mono">D_03</span>
                     </div>
                     <div className="flex items-center justify-between py-0.5 border-b border-t border-zinc-100 my-0.5 grow">
                       <span className="text-[8.5px] font-bold text-zinc-400">亮度:</span>
                       <span className={`font-mono text-[9px] font-extrabold ${actuatorStates.light === "开启" ? "text-emerald-600 animate-pulse" : "text-zinc-400"}`}>
                         {actuatorStates.light === "开启" ? "100% [发光]" : "0% [熄灭]"}
                       </span>
                     </div>
                     <div className="flex justify-between text-[7px] font-mono text-zinc-400 leading-none">
                       <span>PORT: OUT3</span>
                       <span className={`px-1 rounded text-[7px] font-bold leading-none ${actuatorStates.light === "开启" ? "bg-emerald-50 text-emerald-800" : "bg-zinc-100 text-zinc-500"}`}>
                         {actuatorStates.light}
                       </span>
                     </div>
                  </div>

                  {/* Absolute Card 10: 报警器 */}
                  <div 
                    style={{ left: "580px", top: "255px" }} 
                    onClick={() => { setSelectedNode("报警器"); }}
                    className={`absolute w-[145px] h-[72px] bg-white border-2 rounded-xl p-2 shadow-xs flex flex-col gap-1 cursor-pointer transition-all duration-300 z-10 ${
                      highlightedDevices.alarm 
                        ? "border-rose-450 ring-4 ring-rose-450/20 scale-102"
                        : selectedNode === "报警器" 
                        ? "border-[#10A66A] ring-2 ring-[#10A66A]/20 shadow-sm" 
                        : actuatorStates.alarm === "报警中"
                        ? "border-rose-400 bg-rose-50/15 animate-pulse"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                     <div className="flex items-center justify-between">
                       <span className="text-[9.5px] font-black text-zinc-800 leading-none">智慧报警器</span>
                       <span className="text-[7.5px] text-zinc-400 font-mono">ALARM_04</span>
                     </div>
                     <div className="flex items-center justify-between py-0.5 border-b border-t border-zinc-100 my-0.5 grow">
                       <span className="text-[8.5px] font-bold text-zinc-400">状态:</span>
                       <span className={`font-mono text-[9px] font-extrabold ${actuatorStates.alarm === "报警中" ? "text-rose-500" : "text-zinc-400"}`}>
                         {actuatorStates.alarm === "报警中" ? "🚨 报警激活" : "✓ 监视就绪"}
                       </span>
                     </div>
                     <div className="flex justify-between text-[7px] font-mono text-zinc-400 leading-none">
                       <span>PORT: OUT4</span>
                       <span className={`px-1 rounded text-[7px] font-bold leading-none ${actuatorStates.alarm === "报警中" ? "bg-rose-50 text-rose-700" : "bg-zinc-100 text-zinc-500"}`}>
                         {actuatorStates.alarm === "报警中" ? "ACTIVE" : "NORMAL"}
                       </span>
                     </div>
                  </div>

                  {/* Dynamic Added Devices */}{/* Dynamic Added Devices */}
                 {canvasDevices.map((dev) => {
                   const isSelected = selectedNode === dev.name;
                   return (
                     <div 
                       key={dev.canvasId} 
                       style={{ left: `${dev.x}px`, top: `${dev.y}px` }} 
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedNode(dev.name); 
                         setSelectedDeviceDetail(dev);
                       }}
                       className={`absolute w-[140px] bg-white border-2 rounded-xl p-2.5 shadow-sm flex flex-col gap-1.5 cursor-pointer select-none transition-all duration-300 z-25 ${
                         dev.isHighlighted 
                           ? "border-[#10A66A] ring-4 ring-[#10A66A]/30 scale-105 shadow-md animate-pulse" 
                           : isSelected 
                           ? "border-[#10A66A] ring-2 ring-[#10A66A]/20 shadow-md scale-102" 
                           : "border-zinc-200 hover:border-[#10A66A]/50 hover:shadow-xs hover:scale-101"
                       }`}
                     >
                       {/* Top Name and Online circle */}
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-zinc-800 leading-tight truncate max-w-[90px]" title={dev.name}>
                           {dev.name}
                         </span>
                         <span className="flex h-1.5 w-1.5 relative shrink-0">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                         </span>
                       </div>
                       
                       {/* Classification Tag */}
                       <div className="flex items-center justify-between text-[7.5px] leading-none">
                         <span className="bg-[#EAF8F1] text-[#10A66A] border border-[#CFEFE0] px-1 py-0.5 rounded font-black max-w-full truncate">
                           {dev.category}
                         </span>
                         <span className="text-zinc-400 font-bold whitespace-nowrap">在线</span>
                       </div>
                       
                       {/* Divider */}
                       <div className="w-full h-px bg-zinc-100" />
                       
                       {/* Ports / Pins */}
                       <div className="text-[7.5px] font-mono text-zinc-500 leading-normal bg-zinc-50 p-1 rounded border border-zinc-100/50 flex flex-wrap justify-center gap-1">
                         {dev.inputs.concat(dev.outputs).slice(0, 4).map((p, idx) => (
                           <span key={idx} className="bg-white border border-zinc-250 px-0.5 rounded font-semibold whitespace-nowrap text-zinc-650 scale-95 origin-center">
                             {p}
                           </span>
                         ))}
                       </div>
                       
                       {/* Current Operational Status */}
                       <div className="text-[7.5px] leading-tight flex items-center justify-between text-zinc-400 mt-auto pt-0.5 border-t border-zinc-50 font-bold">
                         <span>状态:</span>
                         <span className="text-emerald-700 font-extrabold">正常</span>
                       </div>
                     </div>
                   );
                 })}

              </div>

              <div className="hidden">
                
                {/* Modbus Gateway Card */}
                <div onClick={() => setSelectedNode("Modbus网关")} className={`bg-white border-2 rounded-xl p-3 w-[150px] shadow-sm flex flex-col gap-2 cursor-pointer transition ${selectedNode === "Modbus网关" ? "border-[#10A66A] bg-emerald-50/10 ring-1 ring-[#10A66A]" : "border-zinc-200 hover:border-zinc-300"}`}>
                   <div className="bg-[#10A66A] text-white text-[10px] font-black px-2 py-1 rounded text-center">
                     Modbus网关
                   </div>
                   <div className="text-[9.5px] text-zinc-400 font-mono text-center truncate">
                     IP: 192.168.1.1
                   </div>
                   <div className="flex gap-1.5 justify-center pt-1 pb-0.5 border-t border-zinc-100">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                     <span className="text-[8px] font-bold text-zinc-400">GPIO ACTIVE</span>
                   </div>
                </div>

                {/* Connecting wire vector */}
                <div className="flex-1 h-0.5 border-t-2 border-dashed border-[#10A66A] relative flex items-center justify-center font-bold text-[8.5px] text-[#10A66A]">
                  <div className="absolute top-1 bg-white px-1.5 rounded-full border text-[8px] font-bold shadow-xs">
                    9600 bps
                  </div>
                </div>

                {/* Temperature Sensor Card */}
                <div onClick={() => setSelectedNode("温湿度传感器")} className={`bg-white border-2 rounded-xl p-3 w-[160px] shadow-sm flex flex-col gap-2 cursor-pointer transition ${selectedNode === "温湿度传感器" ? "border-[#10A66A] bg-emerald-50/10 ring-1 ring-[#10A66A]" : "border-zinc-200 hover:border-zinc-300"}`}>
                   <div className="bg-[#10A66A] text-white text-[10px] font-black px-2 py-1 rounded text-center">
                     温湿度传感器
                   </div>
                   <div className="text-[10px] font-semibold text-zinc-600 space-y-1 py-1">
                      <div className="flex justify-between">
                        <span>测量温度:</span>
                        <span className="font-mono text-zinc-800 font-bold">25.4 ℃</span>
                      </div>
                      <div className="flex justify-between">
                        <span>测量湿度:</span>
                        <span className="font-mono text-zinc-800 font-bold">60.1 %RH</span>
                      </div>
                   </div>
                   <div className="pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[8px] text-zinc-400">
                     <span>单总线通信</span>
                     <span className="text-[#10A66A] font-extrabold">STATUS: OK</span>
                   </div>
                </div>

             </div>

             {/* Absolute Layout canvas help widgets */}
             <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10 select-none">
                <button onClick={() => {
                  showToast("已成功向画布添加温湿度检测新引脚");
                  addLog("添加新引脚绑定");
                }} className="h-7 w-7 bg-white border border-zinc-200 rounded flex items-center justify-center text-zinc-500 hover:text-[#10A66A] cursor-pointer"><Settings className="w-3.5 h-3.5" /></button>
                <button onClick={handleResetView} className="h-7 w-7 bg-white border border-zinc-200 rounded flex items-center justify-center text-zinc-500 hover:text-[#10A66A] cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /></button>
             </div>
          </div>

          {/* E. 底部日志 / 通信控制台 (固定在仿真画布底部, 140px - 180px, 默认显示 160px) */}
          <div className={`${isConsoleExpanded ? "h-[160px]" : "h-9"} bg-white border-t border-zinc-200 flex flex-col shrink-0 select-none relative transition-all duration-200 overflow-hidden`}>
             {/* Tab header controller */}
             <div className="px-4 py-1.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-[11px] font-bold text-zinc-700 shrink-0 h-9">
                <div className="flex items-center gap-1">
                  {[
                    { id: "comm" as const, label: "通信消息" },
                    { id: "wires" as const, label: "连线记录" },
                    { id: "checkLogs" as const, label: "连线检测记录" },
                    { id: "logs" as const, label: "操作日志" }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => {
                        setActiveConsoleTab(tab.id);
                        if (!isConsoleExpanded) setIsConsoleExpanded(true);
                      }}
                      className={`px-3 py-1 rounded cursor-pointer ${activeConsoleTab === tab.id ? "bg-white border border-zinc-250 text-[#10A66A] font-black" : "text-zinc-500 hover:text-zinc-800"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                   <div className="font-mono text-[9px] text-zinc-400 hidden sm:block">BAUD: 9600 | DB: CONNECTED</div>
                   <button 
                     onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                     className="p-1 hover:bg-zinc-200 rounded text-zinc-400 cursor-pointer"
                   >
                     {isConsoleExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                   </button>
                </div>
             </div>

             {/* Inner Console scroll body */}
             {isConsoleExpanded && (
               <div className="flex-1 overflow-y-auto p-3 font-mono text-[10.5px] text-zinc-500 space-y-1 bg-[#FAFBFB]">
                  {activeConsoleTab === "comm" && (
                    <div className="space-y-0.5">
                      <div className="text-zinc-400 font-bold text-[9px] border-b border-zinc-100 pb-1 select-none flex items-center justify-between">
                        <span>▼ COMMUNICATIONS REALTIME MESSAGE STREAM (MODBUS-RTU / MQTT)</span>
                        <span className="text-[#10A66A] animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10A66A]" />
                          通道监听中
                        </span>
                      </div>
                      <div className="text-emerald-600">[Modbus RTU] tx ► 01 03 00 00 00 02 C4 0B</div>
                      <div className="text-zinc-500">[Modbus RTU] rx ◄ 01 03 04 01 0E 02 54 89 FA (Temp: 25.4℃, Humi: 60.1%)</div>
                      <div className="text-purple-600">[CLOUD MQTT] publish to topic "/industrial/sensors/v1" data: {"{"}"id":"sn-01","temp":25.4,"humi":60.1{"}"}</div>
                      
                      {/* Dynamic IoT Sensor Stream Messaging */}
                      {communicationMessages.map((msg, idx) => {
                        const isTx = msg.dir === "上行";
                        const isMqtt = msg.dir === "已转发";
                        const content = isTx 
                          ? `[Modbus RTU] tx ► 01 03 00 00 00 02 C4 0B | rx ◄ ${msg.payload} (${msg.device})`
                          : `[CLOUD MQTT] publish to topic "${msg.addr}" data: ${msg.payload}`;
                        return (
                          <div 
                            key={msg.id || `${msg.time}-${idx}`} 
                            className={`animate-in fade-in slide-in-from-bottom-1 duration-300 font-mono text-[10.5px] ${
                              isTx 
                                ? "text-emerald-600 font-semibold" 
                                : isMqtt 
                                ? "text-purple-600 font-semibold" 
                                : "text-zinc-600"
                            }`}
                          >
                            [{msg.time}] {content}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeConsoleTab === "wires" && (
                    <div className="space-y-2 text-xs select-none">
                      {!lineValidationEnabled ? (
                        <div className="py-6 text-center text-zinc-400 font-bold flex items-center justify-center gap-1.5">
                           <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
                           <span>[物理校验断连] 顶部连线验证开关未开启。当前未启用拓扑检测中间件，请激活以开始监控。</span>
                        </div>
                      ) : (
                        <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-3xs max-w-4xl">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] text-zinc-400 font-black uppercase">
                                    <th className="p-1 px-2.5 w-[140px]">检测时间</th>
                                    <th className="p-1 w-[200px]">物理链路 (Link)</th>
                                    <th className="p-1 w-[90px]">安全状态</th>
                                    <th className="p-1">阻抗评估 / 指引建议</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-150 text-[11px] font-semibold text-zinc-600">
                                 <tr>
                                    <td className="p-1 px-2.5 font-mono text-zinc-400">{(new Date()).toLocaleDateString()} 12:00:24</td>
                                    <td>温湿度传感器 ➔ Modbus网关</td>
                                    <td className="text-emerald-600">🟢 合格</td>
                                    <td className="text-zinc-500">1-Wire单总线传输时序对焦 0.98ms，合格</td>
                                 </tr>
                                 <tr>
                                    <td className="p-1 px-2.5 font-mono text-zinc-400">{(new Date()).toLocaleDateString()} 12:00:25</td>
                                    <td>光照传感器 ➔ Modbus网关</td>
                                    <td className="text-emerald-600">🟢 合格</td>
                                    <td className="text-zinc-500">模拟ADC引脚压差曲线符合 0-5V，无溢出</td>
                                 </tr>
                                 <tr>
                                    <td className="p-1 px-2.5 font-mono text-zinc-400">{(new Date()).toLocaleDateString()} 12:00:25</td>
                                    <td>Modbus网关 ➔ 云平台节点</td>
                                    <td className="text-emerald-600">🟢 合格</td>
                                    <td className="text-zinc-500">云平台TCP心跳帧正常, 延迟 12ms</td>
                                 </tr>
                                 <tr className={!hasRepaired ? "bg-rose-50/10 text-rose-950 animate-pulse" : ""}>
                                    <td className="p-1 px-2.5 font-mono text-zinc-400">
                                       {(new Date()).toLocaleDateString()} {hasRepaired ? "12:04:18" : "12:00:26"}
                                    </td>
                                    <td className="font-bold">智能继电器 ➔ 风机控制器</td>
                                    <td>
                                       <span className={hasRepaired ? "text-emerald-600 font-bold" : "text-rose-500 font-black"}>
                                          {hasRepaired ? "🟢 已自愈" : "🔴 缺损报警"}
                                       </span>
                                    </td>
                                    <td className={hasRepaired ? "text-[#10A66A]" : "text-rose-805 text-rose-500"}>
                                       {hasRepaired 
                                         ? "✓ 动力电回路已建立(2400 RPM)。电压：12V(1.2A)，正常运转。" 
                                         : "⚠️ VCC/GND双极浮空断路！风机无法取电。推荐使用一键自愈引擎一秒极速补线。"}
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                      )}
                    </div>
                  )}

                  {activeConsoleTab === "logs" && (
                    <div className="space-y-0.5">
                      {terminalLogs.map((log, i) => (
                        <div key={i} className={log.includes("[WARN]") ? "text-amber-500" : log.includes("[INFO]") ? "text-emerald-600" : ""}>{log}</div>
                      ))}
                    </div>
                  )}
               </div>
             )}
          </div>

        </div>

        {/* F. 右侧属性面板 / 状态面板 */}
        {isRightPanelOpen ? (
          <div className="w-[290px] bg-white border-l border-zinc-200 flex flex-col shrink-0 h-full overflow-hidden animate-in slide-in-from-right duration-250">
             <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between font-bold text-xs text-zinc-800">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-[#10A66A]" />
                  2. 仿真节点属性控制
                </span>
                <button onClick={() => setIsRightPanelOpen(false)} className="text-[10px] text-zinc-400 hover:text-zinc-700">折叠 ❯</button>
             </div>
             
             {/* Panel Tabs for Node parameters and Connection Validation */}
             <div id="right-sidebar-validation-tabs" className="grid grid-cols-3 text-center text-[10.5px] font-bold border-b border-zinc-200 bg-zinc-50/55 shrink-0 select-none border-b border-zinc-200">
                <button
                  onClick={() => setRightPanelTab("params")}
                  className={`py-2.5 border-b-2 transition cursor-pointer ${
                    rightPanelTab === "params"
                      ? "border-[#10A66A] text-[#10A66A] bg-white font-extrabold"
                      : "border-transparent text-zinc-500 hover:text-[#10A66A]/80 font-semibold"
                  }`}
                >
                  配置参数
                </button>
                <button
                  onClick={() => {
                    setRightPanelTab("wires");
                    if (!lineValidationEnabled) {
                      addLog("[提示] 切换至连线校验面板。当前系统尚未开启全局连线验证开关。");
                    }
                  }}
                  className={`py-2.5 border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
                    rightPanelTab === "wires"
                      ? "border-[#10A66A] text-[#10A66A] bg-white font-extrabold"
                      : "border-transparent text-zinc-500 hover:text-[#10A66A]/80 font-semibold"
                  }`}
                >
                  <span>连线校验</span>
                  {lineCheckStatus === "检测完成" && !hasRepaired && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setRightPanelTab("cloud");
                    addLog("[提示] 切换至物联网云平台管理面板。");
                  }}
                  className={`py-2.5 border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
                    rightPanelTab === "cloud"
                      ? "border-[#10A66A] text-[#10A66A] bg-white font-extrabold"
                      : "border-transparent text-zinc-500 hover:text-[#10A66A]/80 font-semibold"
                  }`}
                >
                  物联网云平台
                </button>
             </div>

             {/* Selected node editable sheet */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {rightPanelTab === "params" ? (
                  selectedDeviceDetail ? (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center bg-[#FAFBFB] border border-zinc-150 p-2.5 rounded-lg">
                        <div>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase block">设备库详情</span>
                          <span className="font-extrabold text-[#15803d] text-[13px]">{selectedDeviceDetail.name}</span>
                        </div>
                        <button 
                          onClick={() => setSelectedDeviceDetail(null)} 
                          className="text-zinc-450 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 p-1 rounded-full cursor-pointer transition-colors"
                          title="关闭详情"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-lg space-y-2 text-[11px] leading-relaxed">
                        <div className="flex justify-between border-b border-zinc-100 pb-1.5"><span className="text-zinc-400 font-bold">设备分类:</span><span className="text-zinc-800 font-bold">{selectedDeviceDetail.category}</span></div>
                        <div className="flex justify-between border-b border-zinc-100 pb-1.5"><span className="text-zinc-400 font-bold">设备编号:</span><span className="text-zinc-750 font-mono">{selectedDeviceDetail.code}</span></div>
                        <div className="flex justify-between border-b border-zinc-100 pb-1.5"><span className="text-zinc-400 font-bold">通信方式:</span><span className="text-zinc-755 font-semibold">{selectedDeviceDetail.comm}</span></div>
                        <div className="flex justify-between border-b border-zinc-100 pb-1.5"><span className="text-zinc-400 font-bold">支持协议:</span><span className="text-zinc-755 font-semibold">{selectedDeviceDetail.protocol}</span></div>
                        <div className="flex justify-between border-b border-zinc-100 pb-1.5"><span className="text-zinc-400 font-bold">输入节点:</span><span className="text-zinc-755 font-semibold">{selectedDeviceDetail.inputs.join("、") || "无"}</span></div>
                        <div className="flex justify-between border-b border-zinc-100 pb-1.5"><span className="text-zinc-400 font-bold">输出节点:</span><span className="text-zinc-755 font-semibold">{selectedDeviceDetail.outputs.join("、") || "无"}</span></div>
                        <div className="flex flex-col gap-1 border-b border-zinc-100 pb-1.5 font-sans">
                          <span className="text-zinc-400 font-bold">适用场景:</span>
                          <span className="text-zinc-700 font-medium">{selectedDeviceDetail.scenarios.join("、")}</span>
                        </div>
                        <div className="flex flex-col gap-1 font-sans">
                          <span className="text-zinc-400 font-bold">可连接设备:</span>
                          <span className="text-zinc-700 font-medium">{selectedDeviceDetail.connectable.join("、")}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex gap-2">
                        <button 
                          onClick={() => {
                            handleAddToCanvas(selectedDeviceDetail);
                          }} 
                          className="flex-1 bg-[#10A66A] text-white py-2 px-3 rounded-lg font-extrabold text-[11px] hover:bg-[#0E905A] transition shadow-xs cursor-pointer text-center"
                        >
                          添加到画布
                        </button>
                        <button 
                          onClick={() => setSelectedDeviceDetail(null)} 
                          className="bg-zinc-100 text-zinc-650 py-2 px-3 rounded-lg font-bold text-[11px] hover:bg-zinc-200 transition border border-zinc-200 cursor-pointer text-center"
                        >
                          关闭详情
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                    <div className="space-y-1 bg-[#FAFBFB] border border-zinc-150 p-2.5 rounded-lg">
                   <span className="text-[10px] text-zinc-400 font-bold uppercase block">当前聚焦部件</span>
                   <div className="flex items-center justify-between">
                     <span className="font-extrabold text-[#10A66A] text-[13px]">{selectedNode}</span>
                     {["温湿度传感器", "光照传感器", "二氧化碳传感器", "土壤湿度传感器", "烟雾传感器"].includes(selectedNode) && (
                       <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black ${
                         isGenerating[selectedNode]
                           ? "bg-[#EAF8F1] text-[#10A66A] animate-pulse border border-[#CFEFE0]"
                           : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                       }`}>
                         <span className={`w-1 h-1 rounded-full ${isGenerating[selectedNode] ? "bg-[#10A66A]" : "bg-zinc-400"}`} />
                         {isGenerating[selectedNode] ? "数据生成中" : "已停止"}
                       </span>
                     )}
                   </div>
                </div>

                {["温湿度传感器", "光照传感器", "二氧化碳传感器", "土壤湿度传感器", "烟雾传感器"].includes(selectedNode) ? (
                   <div className="space-y-3 pb-4">
                      {/* 设备基础参数详情 */}
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1.5 text-[11px] leading-none">
                        <div className="flex justify-between"><span className="text-zinc-400 font-bold">设备名称:</span><span className="text-zinc-800 font-extrabold">{selectedNode}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-400 font-bold">设备类型:</span><span className="text-zinc-750 font-semibold">{SENSOR_META[selectedNode].type}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-400 font-bold">设备编号:</span><span className="text-zinc-650 font-mono">{SENSOR_META[selectedNode].code}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-400 font-bold">通信协议:</span><span className="text-zinc-650 font-mono">{SENSOR_META[selectedNode].protocol}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-400 font-bold">设备状态:</span><span className="text-emerald-600 font-extrabold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />在线接通</span></div>
                      </div>

                      {/* 模拟数据模式切换 */}
                      <div className="space-y-1.5">
                         <label className="text-zinc-550 font-bold block">1. 模拟数据模式方式：</label>
                         <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                           {(["定值", "随机值", "循环值"] as const).map(m => (
                             <button
                               key={m}
                               type="button"
                               onClick={() => {
                                 setSensorDataConfig(prev => ({
                                   ...prev,
                                   [selectedNode]: {
                                     ...prev[selectedNode],
                                     mode: m
                                   }
                                 }));
                                 addOperationLog(`切换模式为：${m}`);
                               }}
                               className={`flex-1 py-1 px-1.5 rounded-md text-[10.5px] font-bold text-center cursor-pointer transition-all ${
                                 sensorDataConfig[selectedNode].mode === m
                                   ? "bg-white text-[#10A66A] shadow-xs border border-zinc-150 font-black"
                                   : "text-zinc-500 hover:text-zinc-800"
                               }`}
                             >
                               {m}
                             </button>
                           ))}
                         </div>
                      </div>

                      {/* 动态配置项参数字段 */}
                      <div className="p-3 bg-white border border-zinc-150 rounded-lg space-y-3">
                        {sensorDataConfig[selectedNode].mode === "定值" && (
                          <div className="space-y-3">
                            <span className="text-[10px] text-zinc-400 font-black block border-b border-zinc-100 pb-1">定值数据输入配置</span>
                            {selectedNode === "温湿度传感器" ? (
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                  <label className="text-zinc-550 font-bold text-[10px]">定值温度 (℃)：</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={sensorDataConfig[selectedNode].fixedTemp}
                                    onChange={(e) => setSensorDataConfig(prev => ({
                                      ...prev,
                                      [selectedNode]: { ...prev[selectedNode], fixedTemp: Number(e.target.value) }
                                    }))}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 outline-none text-zinc-805 font-mono text-[11px] focus:bg-white focus:border-[#10A66A]"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-zinc-550 font-bold text-[10px]">定值湿度 (%)：</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={sensorDataConfig[selectedNode].fixedHum}
                                    onChange={(e) => setSensorDataConfig(prev => ({
                                      ...prev,
                                      [selectedNode]: { ...prev[selectedNode], fixedHum: Number(e.target.value) }
                                    }))}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 outline-none text-zinc-805 font-mono text-[11px] focus:bg-white focus:border-[#10A66A]"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <label className="text-zinc-550 font-bold text-[10px]">
                                  定值 {SENSOR_META[selectedNode].items[0]} ({SENSOR_META[selectedNode].unit[SENSOR_META[selectedNode].items[0]]})：
                                </label>
                                <input
                                  type="number"
                                  step={selectedNode === "烟雾传感器" ? "0.001" : "1"}
                                  value={
                                    selectedNode === "光照传感器" ? sensorDataConfig[selectedNode].fixedLight :
                                    selectedNode === "二氧化碳传感器" ? sensorDataConfig[selectedNode].fixedCo2 :
                                    selectedNode === "土壤湿度传感器" ? sensorDataConfig[selectedNode].fixedSoil :
                                    sensorDataConfig[selectedNode].fixedSmoke
                                  }
                                  onChange={(e) => setSensorDataConfig(prev => {
                                    const next = { ...prev[selectedNode] };
                                    const val = Number(e.target.value);
                                    if (selectedNode === "光照传感器") next.fixedLight = val;
                                    else if (selectedNode === "二氧化碳传感器") next.fixedCo2 = val;
                                    else if (selectedNode === "土壤湿度传感器") next.fixedSoil = val;
                                    else next.fixedSmoke = val;
                                    return { ...prev, [selectedNode]: next };
                                  })}
                                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-0.5 outline-none text-zinc-855 font-mono text-[11px] focus:bg-white focus:border-[#10A66A]"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {sensorDataConfig[selectedNode].mode === "随机值" && (
                          <div className="space-y-3">
                            <span className="text-[10px] text-zinc-400 font-black block border-b border-zinc-100 pb-1">随机值振荡范围配置</span>
                            {selectedNode === "温湿度传感器" ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-0.5">
                                    <label className="text-zinc-555 font-bold text-[10px]">温度 Min (℃)：</label>
                                    <input
                                      type="number"
                                      value={sensorDataConfig[selectedNode].tempMin}
                                      onChange={(e) => setSensorDataConfig(prev => ({
                                        ...prev,
                                        [selectedNode]: { ...prev[selectedNode], tempMin: Number(e.target.value) }
                                      }))}
                                      className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 outline-none font-mono text-[11px] focus:bg-white focus:border-[#10A66A]"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <label className="text-zinc-550 font-bold text-[10px]">温度 Max (℃)：</label>
                                    <input
                                      type="number"
                                      value={sensorDataConfig[selectedNode].tempMax}
                                      onChange={(e) => setSensorDataConfig(prev => ({
                                        ...prev,
                                        [selectedNode]: { ...prev[selectedNode], tempMax: Number(e.target.value) }
                                      }))}
                                      className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 outline-none font-mono text-[11px] focus:bg-white focus:border-[#10A66A]"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 border-t pt-2 border-zinc-100">
                                  <div className="space-y-0.5">
                                    <label className="text-zinc-555 font-bold text-[10px]">湿度 Min (%)：</label>
                                    <input
                                      type="number"
                                      value={sensorDataConfig[selectedNode].humMin}
                                      onChange={(e) => setSensorDataConfig(prev => ({
                                        ...prev,
                                        [selectedNode]: { ...prev[selectedNode], humMin: Number(e.target.value) }
                                      }))}
                                      className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 outline-none font-mono text-[11px] focus:bg-white focus:border-[#10A66A]"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <label className="text-zinc-550 font-bold text-[10px]">湿度 Max (%)：</label>
                                    <input
                                      type="number"
                                      value={sensorDataConfig[selectedNode].humMax}
                                      onChange={(e) => setSensorDataConfig(prev => ({
                                        ...prev,
                                        [selectedNode]: { ...prev[selectedNode], humMax: Number(e.target.value) }
                                      }))}
                                      className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 outline-none font-mono text-[11px] focus:bg-white focus:border-[#10A66A]"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                  <label className="text-zinc-555 font-bold text-[10px]">振荡下限 Min：</label>
                                  <input
                                    type="number"
                                    step={selectedNode === "烟雾传感器" ? "0.01" : "1"}
                                    value={
                                      selectedNode === "光照传感器" ? sensorDataConfig[selectedNode].lightMin :
                                      selectedNode === "二氧化碳传感器" ? sensorDataConfig[selectedNode].co2Min :
                                      selectedNode === "土壤湿度传感器" ? sensorDataConfig[selectedNode].soilMin :
                                      sensorDataConfig[selectedNode].smokeMin
                                    }
                                    onChange={(e) => setSensorDataConfig(prev => {
                                      const next = { ...prev[selectedNode] };
                                      const val = Number(e.target.value);
                                      if (selectedNode === "光照传感器") next.lightMin = val;
                                      else if (selectedNode === "二氧化碳传感器") next.co2Min = val;
                                      else if (selectedNode === "土壤湿度传感器") next.soilMin = val;
                                      else next.smokeMin = val;
                                      return { ...prev, [selectedNode]: next };
                                    })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 outline-none font-mono text-[11px] focus:bg-white"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-zinc-550 font-bold text-[10px]">振荡上限 Max：</label>
                                  <input
                                    type="number"
                                    step={selectedNode === "烟雾传感器" ? "0.01" : "1"}
                                    value={
                                      selectedNode === "光照传感器" ? sensorDataConfig[selectedNode].lightMax :
                                      selectedNode === "二氧化碳传感器" ? sensorDataConfig[selectedNode].co2Max :
                                      selectedNode === "土壤湿度传感器" ? sensorDataConfig[selectedNode].soilMax :
                                      sensorDataConfig[selectedNode].smokeMax
                                    }
                                    onChange={(e) => setSensorDataConfig(prev => {
                                      const next = { ...prev[selectedNode] };
                                      const val = Number(e.target.value);
                                      if (selectedNode === "光照传感器") next.lightMax = val;
                                      else if (selectedNode === "二氧化碳传感器") next.co2Max = val;
                                      else if (selectedNode === "土壤湿度传感器") next.soilMax = val;
                                      else next.smokeMax = val;
                                      return { ...prev, [selectedNode]: next };
                                    })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 outline-none font-mono text-[11px] focus:bg-white"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {sensorDataConfig[selectedNode].mode === "循环值" && (
                          <div className="space-y-3">
                            <span className="text-[10px] text-zinc-400 font-black block border-b border-zinc-100 pb-1">序列循环数据轮播配置</span>
                            {selectedNode === "温湿度传感器" ? (
                              <div className="space-y-2">
                                <div className="space-y-0.5">
                                  <label className="text-zinc-550 font-bold text-[9.5px]">温度循环序列 (英标逗号分隔)：</label>
                                  <input
                                    type="text"
                                    value={sensorDataConfig[selectedNode].tempSeq.join(", ")}
                                    onChange={(e) => {
                                      const val = e.target.value.split(/[,，]/).map(x => Number(x.trim())).filter(x => !isNaN(x));
                                      setSensorDataConfig(prev => ({
                                        ...prev,
                                        [selectedNode]: { ...prev[selectedNode], tempSeq: val }
                                      }));
                                    }}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-0.5 outline-none text-zinc-750 font-mono text-[11px] focus:bg-white focus:border-[#10A66A]"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-zinc-550 font-bold text-[9.5px]">湿度循环序列 (英标逗号分隔)：</label>
                                  <input
                                    type="text"
                                    value={sensorDataConfig[selectedNode].humSeq.join(", ")}
                                    onChange={(e) => {
                                      const val = e.target.value.split(/[,，]/).map(x => Number(x.trim())).filter(x => !isNaN(x));
                                      setSensorDataConfig(prev => ({
                                        ...prev,
                                        [selectedNode]: { ...prev[selectedNode], humSeq: val }
                                      }));
                                    }}
                                    className="w-full bg-[#FCFDFD] border border-zinc-200 rounded px-2.5 py-0.5 outline-none text-zinc-750 font-mono text-[11px] focus:bg-white focus:border-[#10A66A]"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <label className="text-zinc-550 font-bold text-[9.5px]">轮播循环序列 (英标逗号分隔)：</label>
                                <input
                                  type="text"
                                  value={
                                    selectedNode === "光照传感器" ? sensorDataConfig[selectedNode].lightSeq.join(", ") :
                                    selectedNode === "二氧化碳传感器" ? sensorDataConfig[selectedNode].co2Seq.join(", ") :
                                    selectedNode === "土壤湿度传感器" ? sensorDataConfig[selectedNode].soilSeq.join(", ") :
                                    sensorDataConfig[selectedNode].smokeSeq.join(", ")
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value.split(/[,，]/).map(x => Number(x.trim())).filter(x => !isNaN(x));
                                    setSensorDataConfig(prev => {
                                      const next = { ...prev[selectedNode] };
                                      if (selectedNode === "光照传感器") next.lightSeq = val;
                                      else if (selectedNode === "二氧化碳传感器") next.co2Seq = val;
                                      else if (selectedNode === "土壤湿度传感器") next.soilSeq = val;
                                      else next.smokeSeq = val;
                                      return { ...prev, [selectedNode]: next };
                                    });
                                  }}
                                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-0.5 outline-none text-zinc-700 font-mono text-[11px] focus:bg-white focus:border-[#10A66A]"
                                />
                              </div>
                            )}

                            {/* 现在的序号跟踪器 */}
                            <div className="flex justify-between items-center bg-[#EAF8F1] text-[#10A66A] p-2 rounded-lg border border-[#CFEFE0] font-semibold text-[10px]">
                              <span>当前轮轮播序号：</span>
                              <span className="font-mono bg-[#10A66A] text-white px-2 py-0.5 rounded leading-none text-[9.5px] font-black">
                                {cycleIndexes[selectedNode] + 1} / {
                                  selectedNode === "温湿度传感器" ? sensorDataConfig[selectedNode].tempSeq.length :
                                  selectedNode === "光照传感器" ? sensorDataConfig[selectedNode].lightSeq.length :
                                  selectedNode === "二氧化碳传感器" ? sensorDataConfig[selectedNode].co2Seq.length :
                                  selectedNode === "土壤湿度传感器" ? sensorDataConfig[selectedNode].soilSeq.length :
                                  sensorDataConfig[selectedNode].smokeSeq.length
                                } 组
                              </span>
                            </div>
                          </div>
                        )}

                        {/* 推送间隔调节 */}
                        <div className="space-y-0.5 block border-t pt-2 border-zinc-100">
                          <label className="text-zinc-550 font-bold text-[10px]">推送上报周期间隔 (秒)：</label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={sensorDataConfig[selectedNode].interval}
                            onChange={(e) => {
                              const v = Math.max(1, Number(e.target.value));
                              setSensorDataConfig(prev => ({
                                ...prev,
                                [selectedNode]: { ...prev[selectedNode], interval: v }
                              }));
                            }}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 outline-none font-mono text-[11px] focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* 四颗控制行动按钮 */}
                      <div className="grid grid-cols-2 gap-2 text-center pt-1">
                        <button
                          type="button"
                          onClick={() => handleStartGeneration(selectedNode)}
                          disabled={isGenerating[selectedNode]}
                          className="py-2 px-1 bg-[#10A66A] text-white rounded-lg hover:bg-[#0E8F5B] disabled:bg-zinc-100 disabled:text-zinc-400 font-extrabold text-[11.5px] flex items-center justify-center gap-1 cursor-pointer transition shadow-xs active:scale-95 text-center"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>开始生成</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStopGeneration(selectedNode)}
                          disabled={!isGenerating[selectedNode]}
                          className="py-2 px-1 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-zinc-100 disabled:text-zinc-400 font-extrabold text-[11.5px] flex items-center justify-center gap-1 cursor-pointer transition shadow-xs active:scale-95 text-center"
                        >
                          <Square className="w-3.5 h-3.5" />
                          <span>停止生成</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendOnce(selectedNode)}
                          className="py-2 px-1 bg-white text-[#10A66A] border border-[#10A66A] hover:bg-[#EAF8F1] rounded-lg font-black text-[11.5px] flex items-center justify-center gap-1 cursor-pointer transition scale-100 active:scale-95 text-center"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>发送一次</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResetConfig(selectedNode)}
                          className="py-2 px-1 bg-zinc-100 border border-zinc-200 text-zinc-650 hover:bg-zinc-200 rounded-lg font-bold text-[11.5px] flex items-center justify-center gap-1 cursor-pointer transition scale-100 active:scale-95 text-center"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>重置配置</span>
                        </button>
                      </div>

                      {/* 实时数据上报区域 */}
                      <div className="border-t border-zinc-200 pt-3 mt-1.5 space-y-1.5">
                        <span className="font-extrabold text-[11px] text-zinc-700 block text-left">实时上报数据流 (限高轮播)：</span>
                        <div className="border border-zinc-150 rounded-lg overflow-hidden bg-zinc-50 max-h-[145px] overflow-y-auto shadow-inner">
                          <table className="w-full text-[10px] text-left border-collapse">
                            <thead className="bg-zinc-150 text-zinc-550 font-black border-b border-zinc-200 sticky top-0 text-[8.5px]">
                              <tr>
                                <th className="py-1 px-1.5">时间</th>
                                <th className="py-1 px-1.5">数据项</th>
                                <th className="py-1 px-1.5">数值</th>
                                <th className="py-1 px-1.5">状态</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200/60 text-zinc-700 leading-relaxed font-semibold">
                              {generatedDataList.filter(item => item.device === selectedNode).length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="py-6 text-center text-zinc-400 font-bold select-none text-[10.5px]">
                                    暂无上报，请点击“开始生成”
                                  </td>
                                </tr>
                              ) : (
                                generatedDataList
                                  .filter(item => item.device === selectedNode)
                                  .map(item => (
                                    <tr key={item.id} className="hover:bg-amber-50/10">
                                      <td className="py-1 px-1.5 font-mono text-zinc-400">{item.time}</td>
                                      <td className="py-1 px-1.5">{item.item}</td>
                                      <td className="py-1 px-1.5 font-mono font-black text-emerald-600">{item.value}</td>
                                      <td className="py-1 px-1.5">
                                        <span className="bg-[#EAF8F1] text-[#10A66A] px-1 py-0.2 rounded-sm text-[8px] font-black border border-[#CFEFE0]">
                                          已上报
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                   </div>
                ) : (
                <>
                {selectedNode === "温湿度传感器" ? (
                  <div className="space-y-3">
                     <div className="space-y-1">
                        <label className="text-zinc-500 font-bold">主芯片上传IP：</label>
                        <input 
                          type="text" 
                          value={deviceIp} 
                          onChange={(e) => setDeviceIp(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1 focus:bg-white outline-none"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-zinc-500 font-bold">串口波特率：</label>
                        <select 
                          value={baudRate} 
                          onChange={(e) => setBaudRate(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 outline-none text-zinc-700"
                        >
                          <option>9600</option>
                          <option>115200</option>
                          <option>4800</option>
                        </select>
                     </div>
                     <div className="space-y-1">
                        <label className="text-zinc-500 font-bold">通信引脚引出：</label>
                        <select 
                          value={gpioPin} 
                          onChange={(e) => setGpioPin(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 outline-none text-zinc-700"
                        >
                          <option>GPIO_PIN_1</option>
                          <option>GPIO_PIN_2</option>
                          <option>ADC_CH_0</option>
                        </select>
                     </div>
                     <div className="space-y-1">
                        <label className="text-zinc-500 font-bold">推送上报频率 (ms)：</label>
                        <input 
                          type="number" 
                          value={reportInterval} 
                          onChange={(e) => {
                            setReportInterval(Number(e.target.value));
                            addLog(`将传感器频率调整为: ${e.target.value} ms`);
                          }}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1 focus:bg-white outline-none"
                        />
                     </div>
                     <div className="space-y-2 pt-2 border-t border-zinc-100 flex items-center justify-between">
                        <span className="font-bold text-zinc-650">物联网上云握手同步：</span>
                        <input 
                          type="checkbox" 
                          checked={isCloudConnected} 
                          onChange={(e) => {
                            setIsCloudConnected(e.target.checked);
                            addLog(`物联网上云状态切换为: ${e.target.checked}`);
                            showToast(e.target.checked ? "已成功建立工业物联云平台MQTT同步！" : "已断开与远程物联服务器的心跳。");
                          }}
                          className="rounded text-[#10A66A] focus:ring-[#10A66A]"
                        />
                     </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                     <span className="font-bold text-zinc-700 block">Modbus 主站参数：</span>
                     <div className="p-3 bg-zinc-50 border border-zinc-150 rounded text-[11px] text-zinc-500 font-semibold space-y-1 leading-relaxed">
                        <div>• 设备地址: 0x01 (默认Master)</div>
                        <div>• 连接端口: RTU / COM1 插座</div>
                        <div>• 云握手心跳: LED-RUN 常亮</div>
                        <div>• 校验方式: RTU-CRC16 双端自动</div>
                     </div>
                     <p className="text-[11px] text-zinc-400">目前 Modbus 主机正常运转，正在侦听以 GPIO_PIN 为索引的所有传感器上部总线报文。</p>
                  </div>
                )}</>)}
                
                {/* Visual guidance for AI tool */}
                <div className="bg-[#EAF8F1] border border-[#CFEFE0] p-3 rounded-lg text-[#10A66A] font-medium leading-relaxed mt-2 text-[11px]">
                  <strong>智慧教育平台支架提示：</strong>配置变更后，沙箱内部的 HEX 进制控制流将按指定配置重置，您可在底栏查核波形或数据报。
                </div>

                {/* 场景与画布背景设置面板 */}
                <div className="border-t border-zinc-200 pt-4 mt-2 space-y-3">
                   <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-[11px] pb-1 border-b border-zinc-100">
                      <Layers className="w-3.5 h-3.5 text-[#10A66A]" />
                      <span>3. 场景与画布背景设置</span>
                   </div>

                   {/* 场景切换 */}
                   <div className="space-y-1.5">
                      <label className="text-zinc-500 font-bold block">实训场景切换：</label>
                      <div className="grid grid-cols-2 gap-1.5">
                         {[
                           { name: "智慧牧场", icon: "🌱" },
                           { name: "智慧家居", icon: "🏠" },
                           { name: "智慧温室", icon: "🌾" },
                           { name: "智慧矿山", icon: "⛰️" }
                         ].map(sc => (
                            <button
                              key={sc.name}
                              type="button"
                              onClick={() => handleSceneSwitch(sc.name)}
                              className={`py-1.5 px-2 rounded-lg border text-left flex items-center gap-1.5 transition cursor-pointer ${
                                currentScene === sc.name 
                                  ? "bg-[#EAF8F1] border-[#10A66A] text-[#10A66A] font-extrabold shadow-sm" 
                                  : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700"
                              }`}
                            >
                               <span className="text-sm">{sc.icon}</span>
                               <span className="text-[10.5px] truncate">{sc.name}</span>
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* 自定义背景设置 */}
                   <div className="bg-zinc-50/50 p-3 rounded-lg border border-zinc-200/60 space-y-3.5">
                      <div className="flex items-center justify-between">
                         <span className="font-bold text-zinc-700">自定义画布背景：</span>
                         <span className="text-[10px] text-zinc-400 font-mono">STATE: {currentBackground === "default" ? "DEFAULT" : "CUSTOM"}</span>
                      </div>

                      <div className="space-y-2">
                         <div className="space-y-1">
                            <label className="text-zinc-400 font-bold text-[10px]">背景图层命名：</label>
                            <input 
                              type="text"
                              value={customBackgroundName}
                              onChange={(e) => setCustomBackgroundName(e.target.value)}
                              placeholder="例如：智慧工厂实训平面图"
                              className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1 text-[11px] focus:border-[#10A66A] outline-none"
                            />
                         </div>

                         <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                               <label className="text-zinc-400 font-bold text-[10px]">背景渲染模式：</label>
                               <select 
                                 value={backgroundType}
                                 onChange={(e) => setBackgroundType(e.target.value)}
                                 className="w-full bg-white border border-zinc-200 rounded px-1.5 py-1 text-[10.5px] outline-none text-zinc-700 font-semibold"
                               >
                                 <option>纯色背景</option>
                                 <option>渐变背景</option>
                                 <option>网格背景</option>
                                 <option>图片背景</option>
                               </select>
                            </div>
                            <div className="space-y-1">
                               <label className="text-zinc-400 font-bold text-[10px]">画纸主题色彩：</label>
                               <select 
                                 value={backgroundColor}
                                 onChange={(e) => setBackgroundColor(e.target.value)}
                                 className="w-full bg-white border border-zinc-200 rounded px-1.5 py-1 text-[10.5px] outline-none text-zinc-700 font-semibold"
                               >
                                 <option>浅绿色</option>
                                 <option>浅灰色</option>
                                 <option>浅米色</option>
                                 <option>浅蓝灰</option>
                                 <option>自定义颜色</option>
                               </select>
                            </div>
                         </div>

                         {backgroundColor === "自定义颜色" && (
                            <div className="flex items-center gap-2 bg-white p-1.5 rounded border border-zinc-150 animate-in fade-in duration-100 font-bold">
                               <input 
                                 type="color"
                                 value={customBackgroundColorHex}
                                 onChange={(e) => setCustomBackgroundColorHex(e.target.value)}
                                 className="w-8 h-6 border-0 p-0 cursor-pointer rounded"
                               />
                               <span className="font-mono text-[10px] text-zinc-400 uppercase">{customBackgroundColorHex}</span>
                            </div>
                         )}

                         <div className="grid grid-cols-2 gap-2 pt-1 font-bold">
                            <label className="flex items-center gap-1.5 cursor-pointer text-zinc-650 text-[10.5px]">
                               <input 
                                 type="checkbox"
                                 checked={showGrid}
                                 onChange={(e) => setShowGrid(e.target.checked)}
                                 className="rounded text-[#10A66A] focus:ring-[#10A66A] w-3.5 h-3.5"
                               />
                               <span>可见衬底网格</span>
                            </label>
                            
                            <select 
                              value={gridSize}
                              onChange={(e) => setGridSize(e.target.value)}
                              disabled={!showGrid}
                              className="bg-white border border-zinc-200 rounded px-1.5 py-0.5 text-[10px] outline-none text-zinc-650 disabled:opacity-50 font-bold text-zinc-600"
                            >
                              <option>小网格</option>
                              <option>中网格</option>
                              <option>大网格</option>
                            </select>
                         </div>

                         <div className="space-y-1 pt-1 font-bold">
                            <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                               <span>前景背景混合不透明度:</span>
                               <span>{backgroundOpacity}%</span>
                            </div>
                            <input 
                              type="range"
                              min="10"
                              max="100"
                              step="5"
                              value={backgroundOpacity}
                              onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
                              className="w-full accent-[#10A66A]"
                            />
                         </div>

                         <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={handleApplyCustomBackground}
                              className="flex-1 bg-[#10A66A] hover:bg-[#0E8F5C] text-white font-extrabold py-1.5 px-2 rounded text-[10.5px] text-center shadow-xs cursor-pointer transition"
                            >
                              应用自定义
                            </button>
                            <button
                              type="button"
                              onClick={handleRestoreDefaultBackground}
                              className="bg-white hover:bg-zinc-50 hover:text-zinc-800 text-zinc-500 font-bold py-1.5 px-2 rounded border border-zinc-250 text-[10.5px] text-center cursor-pointer transition"
                            >
                              重置默认
                            </button>
                         </div>
                       </div>
                    </div>
                </div>
                    </>
                )) : rightPanelTab === "wires" ? (
                  // Right Sidebar Validation tab layout
                  <div className="space-y-4 animate-in fade-in duration-200 font-bold select-none text-xs">
                     
                     {/* Switch Validation Status Alert */}
                     {!lineValidationEnabled ? (
                        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-center space-y-3">
                           <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-450 mx-auto animate-pulse">
                              <AlertCircle className="w-5 h-5 text-zinc-500" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="font-extrabold text-[#10A66A] text-[11.5px]">连线验证功能未启用</h4>
                              <p className="text-[10.5px] text-zinc-400 leading-relaxed font-semibold">
                                 当前物理仿真沙箱未挂载校验中间件，无法评估拓扑连接安全。请在顶部工具栏或点击下方按钮开启检验开关。
                              </p>
                           </div>
                           <button
                             type="button"
                             onClick={handleToggleLineValidation}
                             className="w-full bg-[#10A66A] hover:bg-[#0E8F5C] text-white font-extrabold py-2 px-3 rounded-lg text-xs cursor-pointer shadow-xs transition"
                           >
                              一键使能连线检测开关
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           {/* Status Statistics card */}
                           <div className="bg-[#FAFBFB] border border-zinc-200 rounded-xl p-3 space-y-2.5">
                              <div className="flex items-center justify-between">
                                 <span className="text-zinc-400 font-bold text-[10px]">全局检测状态</span>
                                 <span className={`px-2 py-0.5 rounded text-[9.5px] font-black ${
                                   lineCheckStatus === "检测完成"
                                     ? (hasRepaired ? "bg-emerald-50 text-[#10A66A] border border-[#CFEFE0]" : "bg-rose-50 text-rose-500 border border-rose-100 animate-pulse")
                                     : lineCheckStatus === "检测中"
                                       ? "bg-amber-50 text-amber-500 border border-amber-100 animate-pulse"
                                       : "bg-zinc-100 text-zinc-500"
                                 }`}>
                                    {lineCheckStatus}
                                 </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 font-bold text-center">
                                 <div className="bg-white border border-zinc-150 p-2 rounded-lg">
                                    <div className="text-[10px] text-zinc-400 font-bold">环网回路占比</div>
                                    <div className="text-[13px] font-black font-mono text-[#10A66A] pt-0.5">
                                       {lineCheckStatus === "检测完成" ? (hasRepaired ? "100%" : "75%") : "待检测"}
                                    </div>
                                 </div>
                                 <div className="bg-white border border-[#E4E4E7] p-2 rounded-lg">
                                    <div className="text-[10px] text-zinc-400 font-bold">异常断连数量</div>
                                    <div className={`text-[13px] font-black font-mono pt-0.5 ${
                                      lineCheckStatus === "检测完成" && !hasRepaired ? "text-rose-500 animate-bounce" : "text-zinc-750"
                                    }`}>
                                       {lineCheckStatus === "检测完成" ? (hasRepaired ? "0 处" : "1 处") : "待检测"}
                                    </div>
                                 </div>
                              </div>

                              {lineCheckStatus === "未检测" && (
                                 <button
                                   type="button"
                                   onClick={handleStartLineCheck}
                                   className="w-full bg-[#10A66A] hover:bg-[#0E8F5C] text-white font-extrabold py-2 px-3 rounded-lg text-xs cursor-pointer shadow-xs transition animate-bounce"
                                 >
                                    一键开始全量安全检测
                                 </button>
                              )}

                              {lineCheckStatus === "检测中" && (
                                 <div className="w-full bg-white border border-zinc-250 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-zinc-500 text-xs font-bold select-none">
                                    <div className="w-3.5 h-3.5 border-2 border-[#10A66A] border-t-transparent rounded-full animate-spin" />
                                    <span>拓扑控制流配对检测中...</span>
                                 </div>
                              )}
                           </div>

                           {/* Connection validation check list */}
                           {lineCheckStatus !== "未检测" && (
                              <div className="space-y-3 font-bold">
                                 <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 pt-0.5">
                                    <h4 className="text-zinc-500 font-extrabold text-[10px] uppercase tracking-wider block">物理拓扑连线检测结果</h4>
                                    <span className="text-[9px] font-bold text-zinc-450 bg-zinc-100 px-1.5 py-0.5 rounded">总共 {connectionList.length} 条</span>
                                 </div>

                                 <div className="space-y-2">
                                   {connectionList.map((conn) => {
                                     const isAbnormal = conn.status === "异常";
                                     const isToInspect = conn.status === "待复检";
                                     
                                     return (
                                       <div 
                                         key={conn.id}
                                         onClick={() => {
                                           setSelectedConnection(conn);
                                           setSelectedConnId(conn.id);
                                           if (isAbnormal) {
                                             addOperationLog(`定位排查线路：${conn.fromDev} → ${conn.toDev}`);
                                           }
                                         }}
                                         className={`border rounded-xl p-2.5 flex flex-col gap-1.5 cursor-pointer transition ${
                                           selectedConnId === conn.id
                                             ? (isAbnormal ? "bg-rose-50/15 border-rose-300 shadow-xs" : "bg-emerald-50/15 border-[#10A66A] shadow-xs")
                                             : isAbnormal 
                                               ? "bg-rose-50/15 border-rose-200 hover:bg-rose-50/25 animate-pulse" 
                                               : isToInspect 
                                                 ? "bg-amber-50/15 border-amber-300 hover:bg-amber-50/25"
                                                 : "bg-white border-zinc-200 hover:border-zinc-300"
                                         }`}
                                       >
                                          <div className="flex items-center justify-between gap-1">
                                             <div className="space-y-0.5 min-w-0 flex-1">
                                                <div className="font-extrabold text-[11px] text-zinc-800 truncate">
                                                   {conn.fromDev} ➔ {conn.toDev}
                                                </div>
                                                <div className="text-[9px] text-zinc-400 font-mono">
                                                   引脚配对：{conn.fromPort} ➔ {conn.toPort}
                                                </div>
                                             </div>
                                             <span className={`text-[9.5px] font-black shrink-0 px-1.5 py-0.5 rounded border ${
                                               isAbnormal 
                                                  ? "text-rose-500 bg-rose-550/10 border-rose-100" 
                                                  : isToInspect
                                                    ? "text-amber-600 bg-amber-50 border-amber-200"
                                                    : "text-[#10A66A] bg-emerald-50/70 border-[#CFEFE0]"
                                             }`}>
                                                {conn.status}
                                             </span>
                                          </div>

                                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9.5px] text-zinc-500 border-t border-dashed border-zinc-100 pt-1.5 mt-0.5 font-medium">
                                            <div><span className="text-zinc-400">检测：</span><span className={isAbnormal ? "text-rose-500 font-bold" : "text-[#10A66A]"}>{conn.checkResult}</span></div>
                                            <div><span className="text-zinc-400">问题：</span><span className="truncate block font-bold" title={conn.detail}>{conn.detail}</span></div>
                                          </div>
                                       </div>
                                     );
                                   })}
                                 </div>

                                 {/* 对应第四条异常连接的超详细排查和四合一操作板 (点到第四条或还未修复时自动强提示展开) */}
                                 {(selectedConnId === "conn-4" || (!hasRepaired && selectedConnId === null)) && (
                                    <div className="bg-white border border-rose-200 rounded-xl p-3 space-y-3 shadow-2xs animate-in slide-in-from-top duration-300">
                                       <div className="border-b border-zinc-100 pb-1.5 flex items-center justify-between">
                                          <h5 className="text-[11px] font-black text-rose-500 flex items-center gap-1">
                                             <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                                             <span>异常连线排障诊断详情</span>
                                          </h5>
                                          <span className="text-[9px] font-extrabold text-rose-450 bg-rose-50 border border-rose-100 px-1.5 rounded">故障编码 ERROR_02</span>
                                       </div>

                                       <div className="space-y-2 text-[10.5px] leading-relaxed text-zinc-650">
                                          <div>
                                             <span className="text-zinc-400 font-bold block">异常环路：</span>
                                             <span className="font-extrabold text-zinc-800 bg-zinc-50 px-1.5 py-0.5 rounded font-mono">继电器 OUT ➔ 风机 IN</span>
                                          </div>
                                          <div>
                                             <span className="text-zinc-400 font-bold block">错误类型：</span>
                                             <span className="font-extrabold text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">动力主干线未通电 / 双极空中虚接</span>
                                          </div>
                                          <div>
                                             <span className="text-zinc-400 font-bold block">排障原因：</span>
                                             <span className="text-zinc-600 bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-150 block font-medium">
                                                继电器 COM 触点未引入电源主干道 VCC 输出，风机 GND 动力地线悬空！处于双极无源浮空状态，导致负载无法启动通电。
                                             </span>
                                          </div>
                                          <div>
                                             <span className="text-[#10A66A] font-bold block">工艺标准白皮书：</span>
                                             <p className="bg-emerald-50/20 border border-emerald-100 p-2 rounded-lg text-emerald-800 text-[10px] space-y-0.5 font-bold">
                                                电源 VCC 应串入继电器 COM/NO 常开端子至风机电源输入极，风机 GND 端引回系统总接地层，闭合电源传输强电环。
                                             </p>
                                          </div>
                                       </div>

                                       {/* 修复建议卡片 (第七点) */}
                                       {repairSuggestions && (
                                          <div className="bg-emerald-50 border border-[#CFEFE0] p-2.5 rounded-lg space-y-1 animate-in fade-in duration-200">
                                             <div className="font-extrabold text-[#10A66A] flex items-center gap-1 text-[10.5px]">
                                                <span>💡 在线故障诊断大师：</span>
                                             </div>
                                             <p className="text-zinc-650 font-bold text-[10px] leading-relaxed p-1 bg-white/70 rounded border border-[#CFEFE0]/50">{repairSuggestions}</p>
                                          </div>
                                       )}

                                       {/* 修复链路 4 按钮群组 (第七/八点) */}
                                       <div className="grid grid-cols-3 gap-1.5 pt-1">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setLocateHighlighted(true);
                                              setHighlightedConnectionId("relay_fan");
                                              showToast("已在画布上红光高亮：继电器 OUT ➔ 风机 IN");
                                              addOperationLog("定位异常连线：继电器 OUT → 风机 IN");
                                              setTimeout(() => {
                                                setLocateHighlighted(false);
                                                setHighlightedConnectionId(null);
                                              }, 3000);
                                            }}
                                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-650 py-2 rounded flex flex-col items-center justify-center gap-1 border border-zinc-200 cursor-pointer shadow-3xs transition"
                                          >
                                             <Eye className="w-3.5 h-3.5 text-[#10A66A]" />
                                             <span>定位连线</span>
                                          </button>
                                          
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setRepairSuggestions("请开启自愈组件，或将电源模块的 VCC、GND 引脚分别连接至风机的正负极，补充动力源输入线。");
                                              showToast("已成功生成排障修复路径及工艺方案。");
                                              addOperationLog("生成修复建议");
                                            }}
                                            className="bg-emerald-50 hover:bg-emerald-100 text-[#10A66A] py-2 rounded flex flex-col items-center justify-center gap-1 border border-[#CFEFE0] cursor-pointer shadow-3xs transition"
                                          >
                                             <Cpu className="w-3.5 h-3.5 text-[#10A66A]" />
                                             <span>修复建议</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={handleMarkAsProcessed}
                                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 py-2 rounded flex flex-col items-center justify-center gap-1 border border-amber-250 cursor-pointer shadow-3xs transition"
                                          >
                                             <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                                             <span>标记已处理</span>
                                          </button>
                                       </div>

                                       {/* 自动补全修复连线 (第八点) */}
                                       <button
                                         type="button"
                                         onClick={handleAutoCompleteRepair}
                                         className="w-full bg-[#10A66A] hover:bg-[#0E8F5C] text-white py-2.5 rounded-lg font-black text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1 border border-transparent transition"
                                       >
                                          <CheckCircle2 className="w-4 h-4 text-white" />
                                          <span>自动补全修复连线</span>
                                       </button>
                                    </div>
                                 )}

                              </div>
                           )}

                        </div>
                     )}

                  </div>
                ) : (
                  // 物联网云平台 (Cloud tab layout)
                  <div className="space-y-4 animate-in fade-in duration-200 font-bold text-xs select-none">
                     {/* Cloud connection Status card */}
                     <div className="bg-[#FAFBFB] border border-zinc-200 rounded-xl p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                           <span className="text-zinc-400 font-bold text-[10px]">物联网服务链路</span>
                           <span className={`px-2 py-0.5 rounded text-[9.5px] font-black cursor-pointer border ${
                             cloudConnectionStatus === "已连接"
                               ? "bg-emerald-50 text-[#10A66A] border-[#CFEFE0]"
                               : "bg-rose-50 text-rose-500 border-rose-100 animate-pulse"
                           }`}
                           onClick={() => {
                             const nextStatus = cloudConnectionStatus === "已连接" ? "未连接" : "已连接";
                             setCloudConnectionStatus(nextStatus);
                             addLog(`[云平台] 物联网服务链路手动切换为：${nextStatus}`);
                             showToast(`物联网云平台服务器已${nextStatus === "已连接" ? "上线" : "离线"}`);
                           }}
                           >
                              {cloudConnectionStatus}
                           </span>
                        </div>

                        <div className="p-2 border border-zinc-150 rounded-lg space-y-1.5 text-[10px] font-mono leading-relaxed bg-white">
                           <div className="flex justify-between"><span className="text-zinc-400 font-bold">MQTT Broker:</span><span className="text-zinc-800 font-bold">iot.integrated.edu</span></div>
                           <div className="flex justify-between"><span className="text-zinc-400 font-bold">Client ID:</span><span className="text-zinc-700">stud_usr_01</span></div>
                           <div className="flex justify-between"><span className="text-zinc-400 font-bold">协议通道:</span><span className="text-zinc-700">MQTT Over TLS (8883)</span></div>
                        </div>

                        {/* Pump simulation online/offline switch */}
                        <div className="flex items-center justify-between border-t border-zinc-100 pt-2 border-dashed">
                           <div className="flex flex-col gap-0.5">
                              <span className="text-zinc-650 font-bold text-[10.5px]">仿真水泵在线状态</span>
                              <span className="text-[9px] text-zinc-400">控制水泵是否具备远程心跳响应</span>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                 type="checkbox" 
                                 checked={isPumpOnline}
                                 onChange={(e) => {
                                    setIsPumpOnline(e.target.checked);
                                    addLog(`[设备模拟] 水泵在线心跳状态更改为: ${e.target.checked ? "在线" : "离线"}`);
                                    showToast(e.target.checked ? "水泵物联网心跳正常接入" : "模拟切断水泵的控制心跳(离线模式)");
                                 }}
                                 className="sr-only peer"
                              />
                              <div className="w-8 h-4 bg-zinc-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#10A66A]"></div>
                           </label>
                        </div>
                     </div>

                     {/* Cloud Remote Execution Commands */}
                     <div className="bg-[#FAFBFB] border border-zinc-200 rounded-xl p-3 space-y-3">
                        <h4 className="text-zinc-500 font-extrabold text-[10px] uppercase tracking-wider block border-b border-zinc-100 pb-1.5 pt-0.5">
                           云端远程执行组件 (下发 MQTT 控制报文)
                        </h4>

                        <div className="space-y-2.5 text-[10.5px]">
                           {/* Fan block */}
                           <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-150">
                              <div className="flex flex-col">
                                 <span className="font-extrabold text-zinc-800">1. 常规风机</span>
                                 <span className="text-[9px] text-zinc-400">负载引脚: OUT1 | {actuatorStates.fan}</span>
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                 <button
                                    onClick={() => handleCloudControl("fan", "开启")}
                                    className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer border transition-colors ${
                                      actuatorStates.fan === "运行中"
                                         ? "bg-[#10A66A] text-white border-transparent"
                                         : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                                    }`}
                                 >
                                    常开
                                 </button>
                                 <button
                                    onClick={() => handleCloudControl("fan", "关闭")}
                                    className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer border transition-colors ${
                                      actuatorStates.fan === "关闭"
                                         ? "bg-zinc-800 text-white border-transparent"
                                         : "bg-zinc-50 text-zinc-600 border-zinc-205 hover:bg-zinc-100"
                                    }`}
                                 >
                                    分断
                                 </button>
                              </div>
                           </div>

                           {/* Pump block */}
                           <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-150">
                              <div className="flex flex-col">
                                 <span className="font-extrabold text-zinc-800">2. 灌溉水泵</span>
                                 <span className="text-[9px] text-zinc-400">负载引脚: OUT2 | {isPumpOnline ? actuatorStates.pump : "已离线"}</span>
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                 <button
                                    onClick={() => handleCloudControl("pump", "开启")}
                                    className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer border transition-colors ${
                                      actuatorStates.pump === "运行中" && isPumpOnline
                                         ? "bg-[#10A66A] text-white border-transparent"
                                         : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                                    }`}
                                 >
                                    开启
                                 </button>
                                 <button
                                    onClick={() => handleCloudControl("pump", "关闭")}
                                    className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer border transition-colors ${
                                      actuatorStates.pump === "关闭" && isPumpOnline
                                         ? "bg-zinc-800 text-white border-transparent"
                                         : "bg-zinc-50 text-zinc-600 border-zinc-205 hover:bg-zinc-100"
                                    }`}
                                 >
                                    停机
                                 </button>
                              </div>
                           </div>

                           {/* Light block */}
                           <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-150">
                              <div className="flex flex-col">
                                 <span className="font-extrabold text-zinc-800">3. 补光灯顶标</span>
                                 <span className="text-[9px] text-zinc-400">负载引脚: OUT3 | {actuatorStates.light}</span>
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                 <button
                                    onClick={() => handleCloudControl("light", "开启")}
                                    className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer border transition-colors ${
                                      actuatorStates.light === "开启"
                                         ? "bg-[#10A66A] text-white border-transparent"
                                         : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                                    }`}
                                 >
                                    开启
                                 </button>
                                 <button
                                    onClick={() => handleCloudControl("light", "关闭")}
                                    className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer border transition-colors ${
                                      actuatorStates.light === "关闭"
                                         ? "bg-zinc-800 text-white border-transparent"
                                         : "bg-zinc-50 text-zinc-600 border-zinc-205 hover:bg-zinc-100"
                                    }`}
                                 >
                                    全关
                                 </button>
                              </div>
                           </div>

                           {/* Relay block */}
                           <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-150">
                              <div className="flex flex-col">
                                 <span className="font-extrabold text-zinc-800">4. 智能继电器</span>
                                 <span className="text-[9px] text-zinc-400">信号回路: CN1 | {actuatorStates.relay}</span>
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                 <button
                                    onClick={() => handleCloudControl("relay", "闭合")}
                                    className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer border transition-colors ${
                                      actuatorStates.relay === "闭合"
                                         ? "bg-[#10A66A] text-white border-transparent"
                                         : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                                    }`}
                                 >
                                    闭合
                                 </button>
                                 <button
                                    onClick={() => handleCloudControl("relay", "断开")}
                                    className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer border transition-colors ${
                                      actuatorStates.relay === "断开"
                                         ? "bg-zinc-800 text-white border-transparent"
                                         : "bg-zinc-50 text-zinc-600 border-zinc-205 hover:bg-zinc-100"
                                    }`}
                                 >
                                    分断
                                 </button>
                              </div>
                           </div>

                           {/* Alarm block */}
                           <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-150">
                              <div className="flex flex-col">
                                 <span className="font-extrabold text-zinc-800">5. 报警控制终端</span>
                                 <span className="text-[9px] text-zinc-400 font-bold">负载引脚: OUT4 | {actuatorStates.alarm}</span>
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                 <button
                                    onClick={() => handleCloudControl("alarm", "触发报警")}
                                    className={`px-1.5 py-1 rounded text-[10px] font-black cursor-pointer border transition-colors ${
                                      actuatorStates.alarm === "报警中"
                                         ? "bg-rose-500 text-white border-transparent animate-pulse"
                                         : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                                    }`}
                                 >
                                    强启
                                 </button>
                                 <button
                                    onClick={() => handleCloudControl("alarm", "解除报警")}
                                    className={`px-1.5 py-1 rounded text-[10px] font-black cursor-pointer border transition-colors ${
                                      actuatorStates.alarm === "未触发"
                                         ? "bg-zinc-800 text-white border-transparent"
                                         : "bg-zinc-50 text-zinc-600 border-zinc-205 hover:bg-zinc-100"
                                    }`}
                                 >
                                    静音
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Telemetry log history */}
                     <div className="bg-[#FAFBFB] border border-zinc-200 rounded-xl p-3 space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 pt-0.5">
                           <h4 className="text-zinc-500 font-extrabold text-[10px] uppercase tracking-wider block">云端下发控制指令报文 (MQTT)</h4>
                           <span className="text-[9px] font-bold text-zinc-450 bg-zinc-100 px-1.5 py-0.5 rounded">
                              近期 {cloudRecords.length} 项
                           </span>
                        </div>

                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5 font-bold">
                           {cloudRecords.length === 0 ? (
                              <div className="text-center font-bold text-zinc-400 py-6 text-[10.5px]">
                                 暂无任何云指令下发记录
                              </div>
                           ) : (
                             cloudRecords.map((rec, idx) => (
                               <div 
                                 key={idx}
                                 className="border rounded-xl p-2.5 flex flex-col gap-1.5 bg-white border-zinc-205 cursor-pointer hover:border-zinc-350 transition duration-150 animate-in fade-in"
                                 onClick={() => {
                                   setSelectedCloudRecord(selectedCloudRecord === rec ? null : rec);
                                   addOperationLog(`查看云指令报文：${rec.target} | ${rec.command}`);
                                 }}
                               >
                                  <div className="flex items-center justify-between text-[10.5px]">
                                     <div className="space-y-0.5">
                                        <div className="text-zinc-800 font-black">
                                           {rec.target} ➔ {rec.command}
                                        </div>
                                        <div className={`text-[9.2px] font-mono leading-none ${rec.result === '执行成功' ? 'text-[#10A66A]' : 'text-rose-500'}`}>
                                           {rec.result}
                                        </div>
                                     </div>
                                     <span className="text-[9px] font-mono text-zinc-455 font-normal">
                                        {rec.time}
                                     </span>
                                  </div>

                                  <div className="text-[9px] text-zinc-500 border-t border-dashed border-zinc-100 pt-1.5 flex items-center justify-between">
                                     <span>单元: {rec.code}</span>
                                     <span className="text-[#10A66A] font-bold flex items-center gap-0.5 text-[8.5px]">
                                        {selectedCloudRecord === rec ? "收起" : "展开"} Payload ↓
                                     </span>
                                  </div>

                                  {(selectedCloudRecord === rec) && (
                                     <div className="text-[9px] border-t border-zinc-100 pt-1.5 mt-0.5 space-y-1.5 animate-in slide-in-from-top duration-200">
                                        <div className="text-zinc-400 font-bold block">MQTT Message Payload:</div>
                                        <pre className="bg-zinc-900 border border-zinc-800 text-[#10A66A] p-2 rounded text-[8.5px] font-mono whitespace-pre-wrap overflow-x-auto leading-normal">
                                           {rec.payload}
                                        </pre>
                                        <div className="text-zinc-450 text-[8.5px] font-sans flex flex-col gap-0.5 pt-1.5 border-t border-zinc-100/50 mt-1">
                                           <div><span className="text-zinc-400">通信路径：</span>{rec.link}</div>
                                           <div><span className="text-zinc-400">责任源：</span>{rec.operator || "MQTT Dashboard Client"}</div>
                                        </div>
                                     </div>
                                  )}
                               </div>
                             ))
                           )}
                        </div>
                     </div>
                  </div>
                )}
             </div>
          </div>
        ) : (
          <div className="w-10 bg-white border-l border-zinc-200 flex flex-col items-center py-4 shrink-0 h-full">
            <button 
              onClick={() => setIsRightPanelOpen(true)}
              className="text-xs font-black text-zinc-500 hover:text-[#10A66A] cursor-pointer tracking-widest [writing-mode:vertical-lr]"
            >
              ◀ 展开属性
            </button>
          </div>
        )}

        {/* G. 应用管理低代码大屏仓库 - 右侧抽屉 Drawer (宽度 420px, z-30) */}
        {showAppManagement && (
          <div className="w-[420px] bg-white border-l border-zinc-200 flex flex-col shrink-0 h-full shadow-2xl z-30 animate-in slide-in-from-right duration-200 relative">
            
            {/* If design mode is active inside Drawer */}
            {activeAppDesign ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between shrink-0 h-14">
                  <span className="flex items-center gap-1.5 font-extrabold text-xs text-zinc-800">
                    <Sliders className="w-4 h-4 text-[#10A66A]" />
                    <span>设计器：{activeAppDesign.name}</span>
                  </span>
                  <button onClick={() => setActiveAppDesign(null)} className="p-1 hover:bg-zinc-200 rounded text-zinc-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500">可视化展示标题：</label>
                    <input 
                      type="text" 
                      value={designTitle} 
                      onChange={(e) => setDesignTitle(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-250 rounded px-2.5 py-1.5 focus:border-[#10A66A] focus:bg-white outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500">关联物理传感器源：</label>
                    <select 
                      value={designSensor} 
                      onChange={(e) => setDesignSensor(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-250 rounded px-2 py-1.5 outline-none text-zinc-700 font-semibold"
                    >
                      <option>温湿度传感器</option>
                      <option>光照传感器</option>
                      <option>烟雾传感器</option>
                      <option>环境温度</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-500">接口轮询周期 (ms)：</label>
                      <input 
                        type="number" 
                        value={designRate} 
                        onChange={(e) => setDesignRate(Number(e.target.value))}
                        className="w-full bg-zinc-50 border border-zinc-250 rounded px-2.5 py-1.5 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-500">高温警报自动阈值 (℃)：</label>
                      <input 
                        type="number" 
                        value={designThreshold} 
                        onChange={(e) => setDesignThreshold(Number(e.target.value))}
                        className="w-full bg-zinc-50 border border-zinc-250 rounded px-2.5 py-1.5 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-zinc-100 font-bold text-zinc-700">
                    <span className="text-[11px] font-bold text-zinc-500 block">配置展示版图</span>
                    <label className="flex items-center gap-2 cursor-pointer py-1 block">
                      <input 
                        type="checkbox" 
                        checked={designShowChart} 
                        onChange={(e) => setDesignShowChart(e.target.checked)}
                        className="rounded text-[#10A66A] focus:ring-[#10A66A]"
                      />
                      <span>加载历史 Telemetry 曲线分析表</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer py-1 block">
                      <input 
                        type="checkbox" 
                        checked={designShowControl} 
                        onChange={(e) => setDesignShowControl(e.target.checked)}
                        className="rounded text-[#10A66A] focus:ring-[#10A66A]"
                      />
                      <span>开启远程继电器边缘动作强制开关</span>
                    </label>
                  </div>
                  <div className="bg-emerald-50/40 p-3 rounded-lg border border-[#CFEFE0] text-[#10A66A] leading-relaxed">
                    <b>低代码提示：</b>您当前配置的大屏应用在发布后，将独立搭载在智慧教育物联网看板中心，支持远程调试查看。
                  </div>
                </div>
                <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-2.5 shrink-0">
                  <button 
                    onClick={() => setActiveAppDesign(null)}
                    className="h-8 px-4 bg-zinc-200 rounded text-zinc-650 font-bold hover:bg-zinc-300 transition cursor-pointer"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleSaveDesign}
                    className="h-8 px-4 bg-[#10A66A] hover:bg-emerald-600 text-white font-extrabold rounded transition cursor-pointer"
                  >
                    保存配置
                  </button>
                </div>
              </div>
            ) : activeAppPreview ? (
              // If preview mode is active inside Drawer
              <div className="flex-1 flex flex-col overflow-hidden bg-zinc-50">
                <div className="p-4 bg-white border-b border-zinc-200 flex items-center justify-between shrink-0 h-14 shadow-xs">
                  <span className="flex items-center gap-1.5 font-extrabold text-xs text-zinc-800">
                    <LayoutDashboard className="w-4 h-4 text-[#10A66A]" />
                    <span>大屏动态预览：{activeAppPreview.config.title}</span>
                  </span>
                  <button onClick={() => setActiveAppPreview(null)} className="p-1 hover:bg-zinc-200 rounded text-zinc-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-4 shadow-xs">
                     <div className="flex justify-between items-center pb-2 border-b">
                        <span className="font-extrabold text-[#10A66A] text-xs pb-0.5">{activeAppPreview.config.title}</span>
                        <div className="flex items-center gap-1 bg-emerald-50 text-[#10A66A] border border-[#CFEFE0] px-2 py-0.5 rounded text-[9.5px]">
                          <span className="w-1.5 h-1.5 bg-[#10A66A] rounded-full animate-pulse" />
                          Live Streaming
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3.5 text-center">
                        <div className="bg-[#FAFBFB] p-3 rounded-lg border border-zinc-150 shadow-inner">
                           <span className="text-[10px] text-zinc-400 font-bold block pb-1">室温测量 (IP: .18)</span>
                           <span className="text-xl font-mono text-emerald-600 font-bold">{telemetryTemp.toFixed(1)} ℃</span>
                        </div>
                        <div className="bg-[#FAFBFB] p-3 rounded-lg border border-zinc-150 shadow-inner">
                           <span className="text-[10px] text-zinc-400 font-bold block pb-1">湿度测量 (RTU)</span>
                           <span className="text-xl font-mono text-zinc-700 font-bold">{telemetryHumi.toFixed(1)} %RH</span>
                        </div>
                     </div>

                     {activeAppPreview.config.showControl && (
                       <div className="bg-zinc-100/50 p-3 rounded-lg border border-zinc-200 space-y-2 text-xs">
                          <div className="flex justify-between font-bold">
                            <span className="text-zinc-600 flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-zinc-400" />微网继电器命令：</span>
                            <span className={relayActive ? "text-amber-600" : "text-zinc-400"}>{relayActive ? "触合打开 (FAN RED)" : "分断停止"}</span>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => {
                               setRelayActive(true);
                               addLog("远程APP触发继电器驱动开启");
                               showToast("大屏下发人工强制开启继电器指令");
                             }} className={`flex-grow py-1.5 text-[10.5px] rounded border font-bold ${relayActive ? "bg-[#10A66A] text-white border-transparent" : "bg-white border-zinc-205"}`}>强启</button>
                             <button onClick={() => {
                               setRelayActive(false);
                               addLog("远程APP触发继电器分断");
                               showToast("大屏下发继电器分断断开指令");
                             }} className={`flex-grow py-1.5 text-[10.5px] rounded border font-bold ${!relayActive ? "bg-zinc-750 bg-zinc-800 text-white border-transparent" : "bg-white border-zinc-205"}`}>停止</button>
                          </div>
                       </div>
                     )}

                     {activeAppPreview.config.showChart && (
                       <div className="space-y-1.5 p-2 bg-[#FAFBFB] rounded border">
                         <span className="text-[9.5px] text-zinc-400 font-bold"> telemetry 波动趋势线</span>
                         <div className="h-[90px] w-full flex items-end">
                            <svg className="w-full h-11 text-[#10A66A]" viewBox="0 0 300 50" fill="none">
                               <path d="M0 45 Q 75 25 150 40 T 300 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                               <path d="M0 45 Q 75 25 150 40 T 300 15 L 300 50 L 0 50 Z" fill="currentColor" fillOpacity="0.04" />
                            </svg>
                         </div>
                       </div>
                     )}

                     {telemetryTemp > activeAppPreview.config.thresholdValue && (
                       <div className="bg-red-50 border border-red-200 p-2 text-red-800 text-[10.5px] font-bold rounded flex items-center gap-1 animate-pulse">
                          <Bell className="w-3.5 h-3.5 text-red-500" />
                          <span>高温联动阀爆：温度 {telemetryTemp.toFixed(1)}℃ 超越报警限！已全载排风！</span>
                       </div>
                     )}
                  </div>
                </div>
                <div className="p-4 bg-white border-t border-zinc-200 flex justify-between items-center shrink-0">
                  <span className="text-[10px] text-zinc-400 font-bold">频率: {activeAppPreview.config.refreshRate}ms</span>
                  <button onClick={() => setActiveAppPreview(null)} className="h-8 px-4 bg-[#10A66A] text-white rounded font-bold text-xs hover:bg-emerald-600 cursor-pointer">完成预览</button>
                </div>
              </div>
            ) : (
              // Default App List within the Drawer
              <div className="flex-grow flex flex-col overflow-hidden">
                <div className="p-4 bg-zinc-50 border-b border-zinc-205 flex items-center justify-between shrink-0 h-14">
                  <span className="flex items-center gap-1.5 font-extrabold text-xs text-zinc-800">
                    <LayoutDashboard className="w-4.5 h-4.5 text-[#10A66A]" />
                    <span>大屏应用低代码监控管理仓库</span>
                  </span>
                  <button onClick={() => setShowAppManagement(false)} className="p-1 hover:bg-zinc-200 rounded text-zinc-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-white border-b border-zinc-150 flex items-center justify-between shrink-0">
                  <span className="text-zinc-400 text-[10px] font-bold">本地已挂载大屏: {apps.length} 款</span>
                  <button 
                    onClick={() => setShowCreateAppModal(true)}
                    className="h-7 px-3 bg-[#10A66A] hover:bg-emerald-600 text-white rounded text-[11px] font-black flex items-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>创建新大屏</span>
                  </button>
                </div>

                {/* List container scroll block */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {apps.map(app => (
                    <div key={app.id} className="bg-[#FAFBFB] hover:bg-white transition-[background-color] duration-150 border border-zinc-200 hover:border-[#CFEFE0] rounded-xl p-3 space-y-2 text-xs shadow-xs">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-zinc-800 text-[11.5px] block">{app.name}</span>
                          <span className="text-[10px] text-zinc-400 block font-mono">创建于：{app.createTime}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${app.status === "已发布" ? "bg-[#EAF8F1] text-[#10A66A] border border-[#CFEFE0]" : "bg-zinc-150 text-zinc-500"}`}>
                           {app.status}
                        </span>
                      </div>
                      <p className="text-zinc-500 leading-normal text-[11px]">{app.description}</p>
                      <div className="pt-2 border-t border-zinc-150 flex items-center justify-between select-none">
                         <div className="text-[10.5px] text-[#10A66A] font-bold">
                           绑定: {app.config.sensorBind} ({app.config.refreshRate}ms)
                         </div>
                         <div className="flex gap-2.5 font-bold text-[10.5px]">
                            <button onClick={() => handleOpenDesigner(app)} className="text-[#10A66A] hover:underline cursor-pointer">设计</button>
                            <button onClick={() => {
                              setSelectedApp(app);
                              setActiveAppPreview(app);
                            }} className="text-[#10A66A] hover:underline cursor-pointer">动态预览</button>
                            {app.status === "草稿" && (
                              <button onClick={() => handlePublishApp(app.id, app.name)} className="text-zinc-650 hover:underline cursor-pointer">发布</button>
                            )}
                            <button onClick={() => handleDeleteApp(app.id, app.name)} className="text-red-500 hover:underline cursor-pointer">删除</button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Confirmation Closure Sandbox Modal dialog */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-zinc-850">确认关闭当前实验沙箱环境吗？</h4>
                <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                  关闭后，所有挂载设备运行计时将被保存，直到下一次重新启动。
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
               <button 
                 onClick={() => setShowCloseConfirm(false)}
                 className="h-8 px-3.5 bg-zinc-100 border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-200 transition text-[11px] rounded cursor-pointer"
               >
                 取消
               </button>
               <button 
                 onClick={handleConfirmClose}
                 className="h-8 px-3.5 bg-[#10A66A] hover:bg-emerald-600 text-white font-black text-[11px] rounded cursor-pointer"
               >
                 确认关闭
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Application Dialog Modal */}
      {showCreateAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form onSubmit={handleCreateApp} className="bg-white border border-zinc-200 rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
             <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                <span className="font-extrabold text-xs text-zinc-850">创建智慧低代码大屏监控应用</span>
                <button type="button" onClick={() => setShowCreateAppModal(false)} className="p-1 hover:bg-zinc-100 rounded text-zinc-400">
                   <X className="w-4 h-4" />
                </button>
             </div>
             
             <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                   <label className="text-[11px] font-bold text-zinc-500">大屏监控应用名称：</label>
                   <input 
                     type="text" 
                     required
                     value={newAppName}
                     onChange={(e) => setNewAppName(e.target.value)}
                     placeholder="例如: 智能温室监控面板一号"
                     className="w-full bg-zinc-50 border border-zinc-250 rounded px-2.5 py-1.5 outline-none focus:bg-white focus:border-[#10A66A]"
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[11px] font-bold text-zinc-500">应用划分类型：</label>
                   <select 
                     value={newAppType}
                     onChange={(e: any) => setNewAppType(e.target.value)}
                     className="w-full bg-zinc-50 border border-zinc-250 rounded px-2 py-1.5 outline-none font-medium text-zinc-700"
                   >
                     <option>数据监控</option>
                     <option>智能控制</option>
                     <option>环境集成</option>
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[11px] font-bold text-zinc-500">大屏描述介绍：</label>
                   <textarea 
                     value={newAppDesc}
                     onChange={(e) => setNewAppDesc(e.target.value)}
                     placeholder="简述可视化应用的数据流走向及阀爆响应策略。"
                     className="w-full bg-zinc-50 border border-zinc-250 rounded p-2 text-xs outline-none focus:bg-white focus:border-[#10A66A] min-h-[60px]"
                   />
                </div>
             </div>

             <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100 shrink-0 select-none">
                <button 
                  type="button" 
                  onClick={() => setShowCreateAppModal(false)}
                  className="h-8 px-3.5 bg-zinc-100 border border-zinc-200 rounded text-zinc-600 font-bold hover:bg-zinc-200 transition text-[11px]"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="h-8 px-4 bg-[#10A66A] hover:bg-emerald-600 text-white font-black rounded text-[11px] shadow-xs"
                >
                  确定创建
                </button>
             </div>
          </form>
        </div>
      )}

    </div>
  );
}
