import React, { useState, useEffect, useRef } from "react";
import { 
  Home, RotateCcw, Power, Maximize2, Minimize2, Monitor, FilePlus, 
  Upload, Download, Undo, Redo, ZoomIn, Search, ChevronDown, 
  ChevronRight, Send, Camera, Layers, Settings, X, BookOpen, Clock, 
  User, Eye, EyeOff, FileText, AlertCircle, Plus, Trash2, 
  CheckCircle2, PlayCircle, Activity, Sliders, Bell, Cpu, 
  RefreshCw, TrendingUp, LayoutDashboard, Play, Pause, WifiOff, FileSearch,
  Copy, MapPin, Sparkles, Share2, CheckCircle, Network
} from "lucide-react";
import EmbeddedSimulationClient from "./EmbeddedSimulationClient";
import JupyterSimulationClient from "./JupyterSimulationClient";
import BlockchainSimulationClient from "./BlockchainSimulationClient";

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

interface SimMessage {
  id: string;
  time: string;
  source: string;
  target: string;
  protocol: string;
  topicOrAddr: string;
  direction: string;
  content: string;
  status: string;
  detailText?: string;
  resultText?: string;
  errorReason?: string;
  advice?: string;
}

const presetMessages = [
  {
    source: "温湿度传感器",
    target: "Modbus网关",
    protocol: "RS485",
    topicOrAddr: "0x01",
    direction: "上行",
    content: '{"temp":25.4,"hum":60.1}',
    status: "已发送",
    detailText: "温湿度传感器通过串行RS485差分时序链路，向网关汇总当下测温数值。",
    resultText: "网关寄存器成功载入"
  },
  {
    source: "光照传感器",
    target: "Modbus网关",
    protocol: "RS485",
    topicOrAddr: "0x02",
    direction: "上行",
    content: '{"light":450}',
    status: "已发送",
    detailText: "光照变送探针采集实时漫辐射照数值换算输出，以485十六进制包交接。",
    resultText: "数据校验合格无包损"
  },
  {
    source: "温湿度传感器",
    target: "Modbus网关",
    protocol: "RS485",
    topicOrAddr: "0x01",
    direction: "上行",
    content: '{"temp":null,"hum":60.1}',
    status: "异常",
    detailText: "采集芯片于极短时隙内发生数据突发溢出错误，热电对偶断路探针反馈为空值，触发异常报警。",
    resultText: "温度字段为空，数据格式校验未通过",
    errorReason: "温湿度传感器上报数据中 temp 字段为空。",
    advice: "请检查传感器模拟数据配置，确认温度数据生成方式是否启用。"
  },
  {
    source: "Modbus网关",
    target: "云平台节点",
    protocol: "MQTT",
    topicOrAddr: "/greenhouse/temp",
    direction: "网关转发",
    content: '{"device":"temp01","temp":25.4,"hum":60.1}',
    status: "已转发",
    detailText: "由于底层RS485寄存器捕获有效荷载，Modbus网关程序进行边缘拆包，完成MQTT封包交付。",
    resultText: "云物联网平台应答接纳"
  },
  {
    source: "云平台节点",
    target: "Modbus网关",
    protocol: "MQTT",
    topicOrAddr: "/greenhouse/fan/control",
    direction: "云端下发",
    content: '{"fan":"on"}',
    status: "已发送",
    detailText: "云端专家策略处理器判定当下空气闷热度超标，启动降温连环机制，下传风机激活信号。",
    resultText: "指令下发，边缘网关确认执行"
  },
  {
    source: "云平台节点",
    target: "Modbus网关",
    protocol: "MQTT",
    topicOrAddr: "/greenhouse/waterPump/control",
    direction: "云端下发",
    content: '{"pump":"off"}',
    status: "已发送",
    detailText: "云控制器根据土壤湿度大盘采集结果认定含水饱和，及时中断给水通路以减缓根部浸泡。",
    resultText: "执行命令送达指定线圈"
  },
  {
    source: "Modbus网关",
    target: "继电器",
    protocol: "Modbus",
    topicOrAddr: "0x05",
    direction: "设备间",
    content: '{"relay":"on"}',
    status: "已执行",
    detailText: "边缘层成功执行强电逻辑分配，下发动作将继电器吸合电荷推高，开始大负荷联动。",
    resultText: "触点开闭自锁反馈完成"
  },
  {
    source: "继电器",
    target: "风机",
    protocol: "I/O",
    topicOrAddr: "OUT1",
    direction: "设备间",
    content: '{"fanStatus":"running"}',
    status: "已执行",
    detailText: "继电器闭合后使得常开高VCC触点闭路，强电通电，引燃风机定子气膜，风机成功低速冷启动。",
    resultText: "转速提升，风机恢复运转状态"
  },
  {
    source: "Modbus网关",
    target: "温湿度传感器",
    protocol: "Modbus",
    topicOrAddr: "0x01",
    direction: "下行",
    content: '{"ack":true,"seq":2048}',
    status: "已接收",
    detailText: "网关反馈主站握手报文，向子部同步底层网络时基频率偏转。",
    resultText: "同步帧锁定完成"
  }
];

const initialMessagesList: SimMessage[] = [
  {
    id: "init-24",
    time: "10:30:09",
    source: "温湿度传感器",
    target: "Modbus网关",
    protocol: "RS485",
    topicOrAddr: "0x01",
    direction: "上行",
    content: '{"temp":null,"hum":58}',
    status: "异常",
    detailText: "由于底层传感器探头处于潮湿热失控微环境，物理ADC引脚电平瞬态断连，导致上报温湿度包中temp属性未通过CRC16验证产生空值。",
    resultText: "未能通过Modbus主控端CRC闭环规则，数据已被网关注销丢弃。",
    errorReason: "温度字段为空，数据格式校验未通过。",
    advice: "请检查传感器模拟数据配置，确认温度数据生成方式是否启用。"
  },
  {
    id: "init-23",
    time: "10:30:08",
    source: "云平台节点",
    target: "Modbus网关",
    protocol: "MQTT",
    topicOrAddr: "/greenhouse/waterPump/control",
    direction: "云端下发",
    content: '{"pump":"off"}',
    status: "已发送",
    detailText: "云物联网规则指令分发。根据土壤传感器测定的高含水均值大盘，智慧中枢判定灌溉足够，自动发出水泵分断指令，避免产生淤积涝害。",
    resultText: "指令成功经过TLS隧道投递至边缘设备"
  },
  {
    id: "init-22",
    time: "10:30:07",
    source: "Modbus网关",
    target: "云平台节点",
    protocol: "MQTT",
    topicOrAddr: "/greenhouse/light",
    direction: "网关转发",
    content: '{"device":"light01","value":450}',
    status: "已转发",
    detailText: "Modbus网关汇聚到RS485二号从节点的明文光强数值并组装成JSON。通过网关外链以MQTT上行发布，同步云端监测数字孪生视图。",
    resultText: "云平台核心节点签收成功"
  },
  {
    id: "init-21",
    time: "10:30:06",
    source: "光照传感器",
    target: "Modbus网关",
    protocol: "RS485",
    topicOrAddr: "0x02",
    direction: "上行",
    content: '{"light":450}',
    status: "已发送",
    detailText: "硅光敏感变送芯片输出电磁压差经由片上高精ADC完成量化积分，获得当前物理光强系数。并封装成从机报文通过屏蔽双绞线上送网关。",
    resultText: "网关串口接收缓冲校验及接收无误"
  },
  {
    id: "init-20",
    time: "10:30:05",
    source: "继电器",
    target: "风机",
    protocol: "I/O",
    topicOrAddr: "OUT1",
    direction: "设备间",
    content: '{"fanStatus":"running"}',
    status: "已执行",
    detailText: "继电器释放强电开路触点导通，直流12V大负荷动力主干道与风机供电极相连，主轴电励偏转，开始进行叶片风冷运转反馈。",
    resultText: "风机速度控制器返回正常转速字节"
  },
  {
    id: "init-19",
    time: "10:30:04",
    source: "Modbus网关",
    target: "继电器",
    protocol: "Modbus",
    topicOrAddr: "0x05",
    direction: "设备间",
    content: '{"relay":"on"}',
    status: "已执行",
    detailText: "网关边缘控制器在提取完远程策略后，动作GPIO输出脉冲去触发多路排风继电器。将电荷状态置为HIGH高电平吸合。",
    resultText: "端子线圈通电动作完成，无断连告警"
  },
  {
    id: "init-18",
    time: "10:30:03",
    source: "云平台节点",
    target: "Modbus网关",
    protocol: "MQTT",
    topicOrAddr: "/greenhouse/fan/control",
    direction: "云端下发",
    content: '{"fan":"on"}',
    status: "已发送",
    detailText: "云物联网决策中心判定环境热浪值达到触发上限（>25 ℃），根据实训场景定义的逻辑链，连锁分发冷却下行控制动作流。",
    resultText: "在15毫秒内完成隧道分发"
  },
  {
    id: "init-17",
    time: "10:30:02",
    source: "Modbus网关",
    target: "云平台节点",
    protocol: "MQTT",
    topicOrAddr: "/greenhouse/temp",
    direction: "网关转发",
    content: '{"device":"temp01","temp":24.6,"hum":58}',
    status: "已转发",
    detailText: "网关对下连接口的数据采集。采用CRC16过滤冗余位，提取有用温度24.6度以及湿度58%，重打包利用MQTT协议发向云服务器。",
    resultText: "MQTT云接入点确认接收并记录"
  },
  {
    id: "init-16",
    time: "10:30:01",
    source: "温湿度传感器",
    target: "Modbus网关",
    protocol: "RS485",
    topicOrAddr: "0x01",
    direction: "上行",
    content: '{"temp":24.6,"hum":58}',
    status: "已发送",
    detailText: "高聚湿敏芯片将大气水分压力等电容常数在主轴上折合为数字时序，并利用差分通信线抛投给网关总站。",
    resultText: "包文首字节及接收匹配正常，CRC确认无误"
  },
  {
    id: "init-15",
    time: "10:29:59",
    source: "二氧化碳传感器",
    target: "Modbus网关",
    protocol: "RS485",
    topicOrAddr: "0x03",
    direction: "上行",
    content: '{"co2":810}',
    status: "已发送",
    detailText: "采用双波束红外红敏分析法采集温室二氧化碳空间浓度。消息利用RS485由从机0x03节点自动打包返回网关。",
    resultText: "符合Modbus协议时序，网关成功转入"
  },
  {
    id: "init-14",
    time: "10:29:55",
    source: "Modbus网关",
    target: "云平台节点",
    protocol: "MQTT",
    topicOrAddr: "/greenhouse/sys/heartbeat",
    direction: "网关转发",
    content: '{"status":"online","rssi":-45}',
    status: "已接收",
    detailText: "Modbus网关上报自身应用服务存活的心跳报文，内容包含无线信号能量(RSSI)及边缘处理器负荷比率。",
    resultText: "检测健康，暂无延迟响应"
  },
  {
    id: "init-13",
    time: "10:29:50",
    source: "云平台节点",
    target: "Modbus网关",
    protocol: "MQTT",
    topicOrAddr: "/greenhouse/sys/config",
    direction: "云端下发",
    content: '{"interval":2000}',
    status: "已接收",
    detailText: "云配置组件更新时隙周期。将温室中温、温、光各个传感测点轮询采集频次由1秒统筹更改为安全长运行的2秒采集周期。",
    resultText: "边缘处理器读取重载，暂无超时"
  },
  {
    id: "init-12",
    time: "10:29:45",
    source: "温湿度传感器",
    target: "Modbus网关",
    protocol: "RS485",
    topicOrAddr: "0x01",
    direction: "上行",
    content: '{"temp":24.5,"hum":59}',
    status: "已接收",
    detailText: "大棚温湿度探头稳定侦测、常规数据定时上传。大气气团流动稳定。无参数超限风险。",
    resultText: "成功保存在网关的二号临时状态通道中"
  },
  {
    id: "init-11",
    time: "10:29:40",
    source: "光照传感器",
    target: "Modbus网关",
    protocol: "RS485",
    topicOrAddr: "0x02",
    direction: "上行",
    content: '{"light":440}',
    status: "已接收",
    detailText: "光敏传感器读取当前棚内日光过滤后透过照度为440Lux。上行至控制器完成多级存储。",
    resultText: "边缘网关数据接收和验证正常"
  },
  {
    id: "init-10",
    time: "10:29:35",
    source: "Modbus网关",
    target: "继电器",
    protocol: "Modbus",
    topicOrAddr: "0x05",
    direction: "设备间",
    content: '{"relay":"off"}',
    status: "已执行",
    detailText: "根据降温结束状态释放继电器电极驱动。动作将其控制端置位复位状态，使强电回路与电机降级断连。",
    resultText: "低电平释放响应正确"
  },
  {
    id: "init-9",
    time: "10:29:30",
    source: "继电器",
    target: "风机",
    protocol: "I/O",
    topicOrAddr: "OUT1",
    direction: "设备间",
    content: '{"fanStatus":"stopping"}',
    status: "已执行",
    detailText: "磁回路因掉电释放衔铁，风叶电励减退，阻尼增强并逐步开始进入滑行停转期。当前电机转速缓速下坠。",
    resultText: "转速仪表反馈至0"
  },
  {
    id: "init-8",
    time: "10:29:25",
    source: "云平台节点",
    target: "Modbus网关",
    protocol: "MQTT",
    topicOrAddr: "/greenhouse/pump/control",
    direction: "云端下发",
    content: '{"pump":"on"}',
    status: "已发送",
    detailText: "由于底层上传土壤墒情低于38.0%警界红线，云决策器自动调拨，向给水加压回路发出高电度导通电流指示。",
    resultText: "边缘控制器正确译码"
  },
  {
    id: "init-7",
    time: "10:29:20",
    source: "二氧化碳传感器",
    target: "Modbus网关",
    protocol: "RS485",
    topicOrAddr: "0x03",
    direction: "上行",
    content: '{"co2":790}',
    status: "已发送",
    detailText: "气体浓度传感器向主站同步当时温室内的二氧化碳状态数值。气流状态稳定无外溢。",
    resultText: "报文头核验无伪包，无错误丢弃"
  },
  {
    id: "init-6",
    time: "10:29:15",
    source: "Modbus网关",
    target: "云平台节点",
    protocol: "MQTT",
    topicOrAddr: "/greenhouse/sys/ack",
    direction: "设备间",
    content: '{"status":"ready"}',
    status: "已发送",
    detailText: "网关自身固件及物联网代理探针运行安全。主动向外侧云池发送当前全套运行设备集群就绪状态标识。",
    resultText: "云会话层解析及加载完毕"
  },
  {
    id: "init-5",
    time: "10:29:10",
    source: "温湿度传感器",
    target: "Modbus网关",
    protocol: "RS485",
    topicOrAddr: "0x01",
    direction: "上行",
    content: '{"temp":24.4,"hum":60}',
    status: "已接收",
    detailText: "上报大气常态分子游离密度测温数据包。RS485屏蔽线在重轨段受干扰小，电平变化无溢出或波段重叠。",
    resultText: "PLC/网关寄存器高速映射无延时"
  },
  {
    id: "init-4",
    time: "10:29:05",
    source: "光照传感器",
    target: "Modbus网关",
    protocol: "RS485",
    topicOrAddr: "0x02",
    direction: "上行",
    content: '{"light":430}',
    status: "已接收",
    detailText: "光伏阻膜上报当前棚温滤光照度，向边缘转发中心传输第一顺位原始AD转换帧。",
    resultText: "字符验证正常，时序无包重发"
  },
  {
    id: "init-3",
    time: "10:29:00",
    source: "Modbus网关",
    target: "温湿度传感器",
    protocol: "Modbus",
    topicOrAddr: "0x01",
    direction: "设备间",
    content: '{"cmd":"read"}',
    status: "已接收",
    detailText: "网关依据采集表向主路分送读轮询指令，读取底层各通道温湿度集成传感器的数据寄存空间。",
    resultText: "温度从芯片捕获握手脉冲"
  },
  {
    id: "init-2",
    time: "10:28:55",
    source: "云平台节点",
    target: "Modbus网关",
    protocol: "HTTP",
    topicOrAddr: "/api/device/ping",
    direction: "下行",
    content: '{"ping":"test"}',
    status: "已接收",
    detailText: "云自修复及连通性探针网络针对边缘WEB服务，抛送网络层连通字节PING，用以下达路由活跃周期判决。",
    resultText: "网关内置服务正确回拨200状态状态字"
  },
  {
    id: "init-1",
    time: "10:28:50",
    source: "Modbus网关",
    target: "云平台节点",
    protocol: "MQTT",
    topicOrAddr: "/greenhouse/sys/log",
    direction: "上行",
    content: '{"boot":"ok","system":"v2.1"}',
    status: "已接收",
    detailText: "网关引导及自配置服务完成后，将自身芯片寄存器配置、物理IO通道口映射表汇总上传云端记录。",
    resultText: "解析日志大盘装载成功"
  }
];

export default function ExperimentEnvironmentClient({ 
  envId, 
  onClose, 
  showToast,
  isEmbedded = false
}: ExperimentEnvironmentClientProps) {
  
  if (envId === "renode" || isEmbedded) {
    return <EmbeddedSimulationClient onClose={onClose || (() => {})} showToast={showToast} />;
  }
  
  if (envId === "jupyter") {
    return <JupyterSimulationClient onClose={onClose || (() => {})} showToast={showToast} />;
  }
  
  if (envId === "blockchain-basic-simulation") {
    return <BlockchainSimulationClient onClose={onClose || (() => {})} showToast={showToast} />;
  }
  
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

  // === 通信消息实训新增 state ===
  const [communicationStatus, setCommunicationStatus] = useState<"通信中" | "已暂停" | "未启动">("未启动");
  const [messageFilters, setMessageFilters] = useState({
    device: "全部设备",
    protocol: "全部协议",
    direction: "全部",
    status: "全部",
    searchKeyword: ""
  });
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [messagePresetIndex, setMessagePresetIndex] = useState<number>(0);
  const [isTestMessageAdded, setIsTestMessageAdded] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [messageStats, setMessageStats] = useState({
    total: 24,
    sent: 12,
    received: 8,
    executed: 4,
    error: 1
  });
  const [messageList, setMessageList] = useState<any[]>(initialMessagesList);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [activeAnomalyDetail, setActiveAnomalyDetail] = useState<any | null>(null);

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

  const [rightPanelTab, setRightPanelTab] = useState<"attributes" | "lineCheck" | "params" | "wires" | "cloud" | "aiHelper">("aiHelper");

  // === AI工程助手状态 ===
  const [activeProjectMode, setActiveProjectMode] = useState<"normal" | "ai">("ai");
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>(
    "创建一个智慧温室自动化控制工程，包含温湿度传感器、光照传感器、二氧化碳传感器、Modbus网关、继电器、风机、水泵和云平台，实现环境数据采集、设备联动控制 and 数据上报。"
  );
  const [generatedProject, setGeneratedProject] = useState<{
    name: string;
    scene: string;
    objective: string;
    status: "已完成" | "进行中" | "未启动";
  }>({
    name: "智慧温室自动化控制工程",
    scene: "智慧温室",
    objective: "实现温湿度、光照、二氧化碳等环境数据采集，并通过 Modbus网关上报云平台，同时支持继电器控制风机和水泵。",
    status: "已完成"
  });
  const [generatedDevices, setGeneratedDevices] = useState<string[]>([
    "温湿度传感器",
    "光照传感器",
    "二氧化碳传感器",
    "Modbus网关",
    "继电器",
    "风机",
    "水泵",
    "云平台节点"
  ]);
  const [generatedConnections, setGeneratedConnections] = useState<Array<{ from: string; to: string }>>([
    { from: "温湿度传感器 DATA", to: "Modbus网关 DI1" },
    { from: "光照传感器 AO", to: "Modbus网关 AI1" },
    { from: "二氧化碳传感器 DATA", to: "Modbus网关 DI2" },
    { from: "Modbus网关 MQTT", to: "云平台节点 Topic" },
    { from: "继电器 OUT1", to: "风机 IN" },
    { from: "继电器 OUT2", to: "水泵 IN" }
  ]);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<Array<{ from: string; to: string }>>([
    { from: "电源模块 VCC", to: "风机 VCC" },
    { from: "电源模块 GND", to: "风机 GND" },
    { from: "电源模块 VCC", to: "水泵 VCC" },
    { from: "电源模块 GND", to: "水泵 GND" }
  ]);
  const [canvasDevices, setCanvasDevices] = useState<string[]>([
    "温湿度传感器",
    "光照传感器",
    "二氧化碳传感器",
    "Modbus网关",
    "继电器",
    "风机",
    "水泵",
    "云平台节点",
    "电源模块"
  ]);
  const [canvasConnections, setCanvasConnections] = useState<Array<{ from: string; to: string }>>([
    { from: "温湿度传感器 DATA", to: "Modbus网关 DI1" },
    { from: "光照传感器 AO", to: "Modbus网关 AI1" },
    { from: "二氧化碳传感器 DATA", to: "Modbus网关 DI2" },
    { from: "Modbus网关 MQTT", to: "云平台节点 Topic" },
    { from: "继电器 OUT1", to: "风机 IN" },
    { from: "继电器 OUT2", to: "水泵 IN" }
  ]);
  const [operationLogs, setOperationLogs] = useState<string[]>([
    "10:50:01｜输入自然语言需求",
    "10:50:03｜识别场景：智慧温室",
    "10:50:04｜匹配设备：温湿度传感器、光照传感器、二氧化碳传感器、Modbus网关、继电器、风机、水泵、云平台节点",
    "10:50:05｜生成基础连线 6 条",
    "10:50:06｜生成供电连线建议 4 条",
    "10:50:07｜仿真工程创建完成"
  ]);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  // === 云平台对接仿真本地状态 ===
  const [cloudConnectionStatus, setCloudConnectionStatus] = useState<"未连接" | "已连接" | "数据上报中">("已连接");
  const [syncedDevices, setSyncedDevices] = useState<number>(0);
  const [cloudUploadTime, setCloudUploadTime] = useState<string>("10:35:20");
  const [cloudRecords, setCloudRecords] = useState<any[]>([
    {
      time: "10:35:20",
      device: "温湿度传感器",
      topic: "/greenhouse/tempHum",
      payload: `{"temp":25.4,"hum":60.1}`,
      status: "已接收"
    },
    {
      time: "10:35:22",
      device: "光照传感器",
      topic: "/greenhouse/light",
      payload: `{"light":450}`,
      status: "已接收"
    },
    {
      time: "10:35:24",
      device: "Modbus网关",
      topic: "/gateway/status",
      payload: `{"status":"online"}`,
      status: "已接收"
    }
  ]); // 云平台记录
  const [cloudViewMode, setCloudViewMode] = useState<boolean>(false); // 切换云平台大屏数据视图
  const [todayReportCount, setTodayReportCount] = useState<number>(12); // 今日上报条数 (初始12条)
  
  // 趋势图更新使用的数据历史：各保存 6 个点，用来绘制折线图。
  const [tempTrend, setTempTrend] = useState<number[]>([23.5, 23.9, 24.1, 24.6, 24.3, 25.4]);
  const [humTrend, setHumTrend] = useState<number[]>([55, 56, 58, 57, 59, 60.1]);
  const [lightTrend, setLightTrend] = useState<number[]>([420, 435, 440, 450, 445, 450]);
  const [co2Trend, setCo2Trend] = useState<number[]>([590, 605, 610, 620, 615, 620]);

  const [cloudLatestValues, setCloudLatestValues] = useState({
    temp: 25.4,
    hum: 60.1,
    light: 450,
    co2: 620,
    fanStatus: "运行中"
  });

  const addCloudRecord = (device: string, topic: string, payload: string, status: string = "已接收") => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const newRecord = {
      time: timeStr,
      device: device || "云平台节点",
      topic: topic || "/greenhouse/data",
      payload: payload || "{}",
      status: status || "已接收"
    };
    setCloudRecords(prev => [newRecord, ...prev]);
  };

  const addCloudRecordObject = (rec: {time: string, device: string, topic: string, payload: string, status: string}) => {
    setCloudRecords(prev => [rec, ...prev]);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const globalState = (window as any).CLOUD_SHARED_STATE || {};
      (window as any).CLOUD_SHARED_STATE = {
         ...globalState,
         isConnected: cloudConnectionStatus !== "未连接",
         isSynced: syncedDevices > 0,
         isReporting: cloudConnectionStatus === "数据上报中",
         todayReportCount: todayReportCount,
         latestValues: {
            temp: cloudLatestValues.temp,
            hum: cloudLatestValues.hum,
            light: cloudLatestValues.light,
            co2: cloudLatestValues.co2,
            fanStatus: cloudLatestValues.fanStatus,
            relayStatus: cloudLatestValues.fanStatus === "运行中" ? "开启" : "关闭",
            waterPumpStatus: "关闭"
         },
         uploadRecords: cloudRecords.map((r, i) => ({
           id: "rec-" + i,
           time: r.time,
           device: r.device,
           topic: r.topic,
           payload: r.payload,
           status: r.status
         })).slice(0, 50),
         lastReportTime: cloudUploadTime
      };
    }
  }, [cloudConnectionStatus, syncedDevices, todayReportCount, cloudLatestValues, cloudRecords, cloudUploadTime]);

  // == 云平台对接每两秒定时更新设备数据及通信联动 ==
  useEffect(() => {
    let timer: any = null;
    if (cloudConnectionStatus === "数据上报中") {
      let step = 0;
      timer = setInterval(() => {
        setCloudLatestValues(prev => {
          let nextTemp = prev.temp;
          let nextHum = prev.hum;
          let nextLight = prev.light;
          let nextCo2 = prev.co2;
          
          if (step === 0) {
            nextTemp = 24.8;
            nextHum = 59;
            nextLight = 465;
            nextCo2 = 635;
            step = 1;
          } else if (step === 1) {
            nextTemp = 25.1;
            nextHum = 57;
            nextLight = 472;
            nextCo2 = 628;
            step = 2;
          } else {
            nextTemp = 24.6;
            nextHum = 58;
            nextLight = 450;
            nextCo2 = 620;
            step = 0;
          }

          setTempTrend(t => [...t.slice(1), nextTemp]);
          setHumTrend(h => [...h.slice(1), nextHum]);
          setLightTrend(l => [...l.slice(1), nextLight]);
          setCo2Trend(c => [...c.slice(1), nextCo2]);
          
          setTodayReportCount(count => count + 4);

          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          setCloudUploadTime(timeStr);

          // 添加云平台记录
          addCloudRecord("温湿度传感器", "/greenhouse/tempHum", `{"temp":${nextTemp},"hum":${nextHum}}`);
          addCloudRecord("光照传感器", "/greenhouse/light", `{"light":${nextLight}}`);

          // 联动追加到最新通信消息里面！
          const baseMsgId = Date.now();
          const newCommMsgs = [
            {
              id: `cloud_msg_1_${baseMsgId}`,
              time: timeStr,
              source: "温湿度传感器",
              target: "Modbus网关",
              protocol: "RS485",
              topicOrAddr: "0x01",
              direction: "上行",
              content: `{"temp":${nextTemp},"hum":${nextHum}}`,
              originalHex: `01 03 04 ${(Math.round(nextTemp*10)).toString(16).padStart(4, '0')} ${(Math.round(nextHum*10)).toString(16).padStart(4, '0')}`,
              status: "已发送"
            },
            {
              id: `cloud_msg_2_${baseMsgId}`,
              time: timeStr,
              source: "Modbus网关",
              target: "云平台节点",
              protocol: "MQTT",
              topicOrAddr: "/greenhouse/tempHum",
              direction: "上行",
              content: `{"device":"sensor-temp-001","temp":${nextTemp},"hum":${nextHum}}`,
              originalHex: "-",
              status: "已上报"
            },
            {
              id: `cloud_msg_3_${baseMsgId}`,
              time: timeStr,
              source: "光照传感器",
              target: "Modbus网关",
              protocol: "RS485",
              topicOrAddr: "0x02",
              direction: "上行",
              content: `{"light":${nextLight}}`,
              originalHex: `02 03 02 ${(Math.round(nextLight)).toString(16).padStart(4, '0')}`,
              status: "已发送"
            },
            {
              id: `cloud_msg_4_${baseMsgId}`,
              time: timeStr,
              source: "Modbus网关",
              target: "云平台节点",
              protocol: "MQTT",
              topicOrAddr: "/greenhouse/light",
              direction: "上行",
              content: `{"device":"sensor-light-001","value":${nextLight}}`,
              originalHex: "-",
              status: "已上报"
            }
          ];

          setMessageList(mList => [
            ...newCommMsgs,
            ...mList
          ].slice(0, 80));

          return {
            ...prev,
            temp: nextTemp,
            hum: nextHum,
            light: nextLight,
            co2: nextCo2
          };
        });
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cloudConnectionStatus]);

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

  // 通信消息自动追加定时器
  useEffect(() => {
    let timer: any = null;
    if (communicationStatus === "通信中") {
      timer = setInterval(() => {
        setMessagePresetIndex(prevIndex => {
          const template = presetMessages[prevIndex];
          const nextIndex = (prevIndex + 1) % presetMessages.length;

          // 构造仿真消息时间
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

          const newMsg = {
            id: `auto-${Date.now()}-${prevIndex}`,
            time: timeStr,
            source: template.source,
            target: template.target,
            protocol: template.protocol,
            topicOrAddr: template.topicOrAddr,
            direction: template.direction,
            content: template.content,
            status: template.status,
            detailText: template.detailText,
            resultText: template.resultText,
            errorReason: template.errorReason,
            advice: template.advice
          };

          // 追加到列表顶部
          setMessageList(prev => [newMsg, ...prev]);

          // 同步递增状态
          setMessageStats(prev => {
            const nextStats = { ...prev };
            nextStats.total += 1;
            if (newMsg.status === "已发送") nextStats.sent += 1;
            if (newMsg.status === "已接收") nextStats.received += 1;
            if (newMsg.status === "已转发") nextStats.sent += 1; // 转发归为发送类
            if (newMsg.status === "已执行") nextStats.executed += 1;
            if (newMsg.status === "异常") nextStats.error += 1;
            return nextStats;
          });

          // 画布端设备闪烁高亮联动
          const pulseNodes = [newMsg.source, newMsg.target];
          setHighlightedNodes(pulseNodes);
          // 在 1.2 秒后清除高亮闪烁，产生逼真的动态呼吸灯响应效果
          setTimeout(() => {
             setHighlightedNodes([]);
          }, 1200);

          // 联动操作日志
          if (newMsg.status === "异常") {
            addLog(`${newMsg.time}｜发现通信异常：温湿度传感器上报数据格式异常`);
          } else if (newMsg.source === "温湿度传感器") {
            addLog("温湿度传感器上报数据");
          } else if (newMsg.source === "继电器") {
            addLog("继电器执行控制命令");
          } else if (newMsg.source === "云平台节点" && newMsg.topicOrAddr.includes("fan")) {
            addLog("云平台下发风机开启命令");
          }

          return nextIndex;
        });
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [communicationStatus]);

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
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    let logLine = "";
    if (msg.includes("｜")) {
      logLine = msg;
    } else {
      logLine = `${timeStr}｜${msg}`;
    }
    setTerminalLogs(prev => [logLine, ...prev].slice(0, 30));
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
      showToast("已关闭连线验证");
      
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
      setRightPanelTab("lineCheck");
      setIsRightPanelOpen(true);
      
      if (!hasRepaired) {
        showToast("连线检测完成，发现 1 条异常连线。");
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
        setTerminalLogs(prev => [
          `${timeStr}｜重新检测，全部连线通过`,
          ...prev
        ].slice(0, 30));
        
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

        {/* C. 设备树区域放在学习手册区右侧 - 宽度固定 230px (220px - 260px 内) */}
        <div className="w-[230px] bg-white border-r border-zinc-200 flex flex-col shrink-0 h-full overflow-hidden">
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
        {cloudViewMode ? (
          <div className="flex-grow flex flex-col overflow-hidden h-full bg-[#FAFBFB] select-none min-w-[500px] p-4 overflow-y-auto animate-in fade-in duration-200">
              
              {/* 顶部标题与返回控制 */}
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-[#10A66A]">
                    <Share2 className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-[14px] font-black text-zinc-800">星链云端数字孪生大盘</h2>
                    <p className="text-[10px] text-zinc-400 font-bold">行业物联网底座平台 ──── 智慧温室自动化工程实时监控视图</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setCloudViewMode(false);
                    addLog("[提示] 已返回物理拓扑仿真画布。");
                  }}
                  className="bg-white border border-[#10A66A] hover:bg-emerald-50 text-[#10A66A] font-extrabold px-3 py-1.5 rounded-lg text-[10.5px] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>返回拓扑仿真画布 ➔</span>
                </button>
              </div>

              {/* 核心数值展示卡片 (3 个) */}
              <div className="grid grid-cols-5 gap-3 mb-4 text-[10.5px]">
                <div className="bg-white border border-zinc-150 p-3 rounded-xl shadow-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-bold block">今日接收包数</span>
                    <span className="text-[18px] font-mono font-black text-zinc-800">{todayReportCount} <span className="text-[10px] text-zinc-400">个</span></span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-white border border-zinc-150 p-3 rounded-xl shadow-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-bold block">同步活跃节点</span>
                    <span className="text-[18px] font-mono font-black text-[#10A66A]">{syncedDevices} <span className="text-[10px] text-zinc-400">台</span></span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-white border border-zinc-150 p-3 rounded-xl shadow-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-bold block">边缘上行丢包率</span>
                    <span className="text-[18px] font-mono font-black text-zinc-800">0.00%</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                    <Network className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-white border border-zinc-150 p-3 rounded-xl shadow-xs flex items-center justify-between col-span-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-bold block">星链云服务器状态</span>
                    <span className="text-[11px] font-extrabold text-[#10A66A] inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      EAST-CHINA INTEL HIGH LIVE
                    </span>
                    <span className="text-[9.5px] text-zinc-400 font-mono block">延时: 12ms | 负载: 4%</span>
                  </div>
                </div>
              </div>

              {/* 核心分栏 */}
              <div className="grid grid-cols-3 gap-3 flex-grow overflow-hidden text-[10.5px]">
                
                {/* 左列: 设备实时监控块 */}
                <div className="col-span-1 space-y-3 flex flex-col justify-between">
                  
                  {/* 温湿度传感器监视卡片 */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col justify-between flex-1 space-y-1">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                      <span className="font-extrabold text-[11.5px] text-zinc-700 flex items-center gap-1">
                        <span className="inline-block w-1 h-3.5 bg-[#10A66A] rounded-full" />
                        温湿度传感器 [temp01]
                      </span>
                      <span className="font-mono text-[9px] text-[#10A66A] font-bold">ONLINE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-1">
                      <div className="bg-zinc-50 border border-zinc-150 p-2 rounded-lg text-center">
                        <div className="text-[9px] text-zinc-400 font-bold">温度读取值</div>
                        <div className="text-[16px] font-mono font-extrabold text-zinc-800 pt-0.5">
                          {cloudConnectionStatus === "数据上报中" ? cloudLatestValues.temp : "25.4"}<span className="text-[10px] font-sans text-zinc-400 ml-0.5">℃</span>
                        </div>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-150 p-2 rounded-lg text-center">
                        <div className="text-[9px] text-zinc-400 font-bold">湿度读取值</div>
                        <div className="text-[16px] font-mono font-extrabold text-zinc-800 pt-0.5">
                          {cloudConnectionStatus === "数据上报中" ? cloudLatestValues.hum : "60.1"}<span className="text-[10px] font-sans text-zinc-400 ml-0.5">%</span>
                        </div>
                      </div>
                    </div>
                    {/* SVG 趋势监控微折线图 */}
                    <div className="h-10 bg-emerald-50/10 border border-zinc-100 p-1 rounded-lg flex items-center justify-center relative">
                       <span className="absolute top-1 left-1.5 text-[7.5px] font-bold text-zinc-400 font-mono">温度物理数据历史趋势(2s采样)</span>
                       <svg className="w-full h-full pt-2" viewBox="0 0 100 20" preserveAspectRatio="none">
                         <path
                           d={`M ${tempTrend.map((val, idx) => `${idx * 20}, ${(28 - val) * 4 + 8}`).join(' L ')}`}
                           fill="none"
                           stroke="#10A66A"
                           strokeWidth="1.5"
                           strokeLinecap="round"
                         />
                         {tempTrend.map((val, idx) => (
                           <circle key={idx} cx={idx * 20} cy={(28 - val) * 4 + 8} r="1.5" fill="#0E8F5C" />
                         ))}
                       </svg>
                    </div>
                  </div>

                  {/* 光强传感器监测 */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col justify-between flex-1 space-y-1">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                      <span className="font-extrabold text-[11.5px] text-zinc-700 flex items-center gap-1">
                        <span className="inline-block w-1 h-3.5 bg-[#10A66A] rounded-full" />
                        光照传感器 [light01]
                      </span>
                      <span className="font-mono text-[9px] text-[#10A66A] font-bold">ONLINE</span>
                    </div>
                    <div className="grid grid-cols-1 py-1">
                      <div className="bg-zinc-50 border border-zinc-150 p-2 rounded-lg text-center">
                        <div className="text-[9px] text-zinc-400 font-bold">环境光照度检测值</div>
                        <div className="text-[16px] font-mono font-extrabold text-[#10A66A] pt-0.5">
                          {cloudConnectionStatus === "数据上报中" ? cloudLatestValues.light : "450"}<span className="text-[10px] font-sans text-zinc-400 ml-1">Lux</span>
                        </div>
                      </div>
                    </div>
                    {/* SVG 智能折线 */}
                    <div className="h-10 bg-emerald-50/10 border border-zinc-100 p-1 rounded-lg flex items-center justify-center relative">
                       <span className="absolute top-1 left-1.5 text-[7.5px] font-bold text-zinc-400 font-mono">照度流式时序拓扑</span>
                       <svg className="w-full h-full pt-2" viewBox="0 0 100 20" preserveAspectRatio="none">
                         <path
                           d={`M ${lightTrend.map((val, idx) => `${idx * 20}, ${(480 - val) / 3.5 + 8}`).join(' L ')}`}
                           fill="none"
                           stroke="#10A66A"
                           strokeWidth="1.5"
                           strokeLinecap="round"
                         />
                         {lightTrend.map((val, idx) => (
                           <circle key={idx} cx={idx * 20} cy={(480 - val) / 3.5 + 8} r="1.5" fill="#0E8F5C" />
                         ))}
                       </svg>
                    </div>
                  </div>

                </div>

                {/* 右列: 大屏趋势可视化 (折线趋势) */}
                <div className="col-span-2 bg-white border border-zinc-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2 shrink-0">
                    <div>
                      <h4 className="font-black text-zinc-700 text-[11.5px]">双通道物联网时序波动监控 (星链底层采样)</h4>
                      <p className="text-[9px] text-zinc-400 font-bold">高精度流式并排比照，直观感知大棚温湿度微动态</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-55 bg-emerald-50 text-[#10A66A] rounded text-[9px] font-extrabold">物联动态图态</span>
                  </div>

                  {/* SVG 手作双轴拟真大图表 */}
                  <div className="flex-grow flex flex-col justify-between py-2 relative border border-zinc-100 bg-zinc-50/25 rounded-xl p-3 min-h-[140px]">
                    <div className="absolute left-2.5 top-2.5 text-[8px] text-zinc-400 font-bold font-mono">
                      Y1轴(℃): 15-35 | Y2轴(%): 40-70
                    </div>

                    <svg className="w-full h-full mt-4 min-h-[100px]" viewBox="0 0 300 80" preserveAspectRatio="none">
                      <line x1="0" y1="20" x2="300" y2="20" stroke="#E4E4E7" strokeWidth="0.5" strokeDasharray="2,2" />
                      <line x1="0" y1="40" x2="300" y2="40" stroke="#E4E4E7" strokeWidth="0.5" strokeDasharray="2,2" />
                      <line x1="0" y1="60" x2="300" y2="60" stroke="#E4E4E7" strokeWidth="0.5" strokeDasharray="2,2" />

                      {/* 温度折线(绿色) */}
                      <path
                        d={`M ${tempTrend.map((v, i) => `${i * 60}, ${80 - (v - 18) * 6}`).join(' L ')}`}
                        fill="none"
                        stroke="#10A66A"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                      {tempTrend.map((v, i) => (
                        <circle key={`t-${i}`} cx={i * 60} cy={80 - (v - 18) * 6} r="3.5" fill="#0E8F5C" />
                      ))}

                      {/* 湿度折线(墨绿色) */}
                      <path
                        d={`M ${humTrend.map((v, i) => `${i * 60}, ${80 - (v - 45) * 2.2}`).join(' L ')}`}
                        fill="none"
                        stroke="#0D5C3A"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="4,2"
                        className="transition-all duration-300"
                      />
                      {humTrend.map((v, i) => (
                        <rect key={`h-${i}`} x={i * 60 - 2.5} y={80 - (v - 45) * 2.2 - 2.5} width="5" height="5" fill="#0D5C3A" />
                      ))}
                    </svg>

                    {/* 曲线图例 */}
                    <div className="flex items-center justify-center gap-4 border-t border-zinc-100 pt-2 shrink-0">
                      <div className="flex items-center gap-1.5 text-[9px] text-zinc-550">
                        <span className="w-3 h-1.5 bg-[#10A66A] rounded-full inline-block" />
                        <span className="font-bold">气温物理读取 (°C)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-zinc-550">
                        <span className="w-3 h-1 bg-[#0D5C3A] border-dashed border-t rounded-full inline-block" />
                        <span className="font-bold">环境湿度反馈 (%RH)</span>
                      </div>
                    </div>
                  </div>

                  {/* 平台下行命令队列 */}
                  <div className="border-t border-zinc-100 pt-2 shrink-0">
                     <span className="text-[9.5px] text-zinc-400 font-bold tracking-wider uppercase block">云平台实时下行命令队列 Command Queue</span>
                     <div className="bg-zinc-50 border border-zinc-150 p-2 rounded-lg font-mono text-[9px] text-zinc-500 mt-1 flex items-center justify-between">
                       <span>{cloudConnectionStatus === "数据上报中" ? `[下行轮询 ok] TOPIC: /greenhouse/control ── CMD: 智能继电器双向开启命令` : `[通道监听中] 等待边缘网关汇聚后发起下行推送`}</span>
                       <span className="text-[8.5px] font-bold text-indigo-600">{cloudConnectionStatus === "数据上报中" ? "HEARTBEAT SUCCESS" : "LISTENING"}</span>
                     </div>
                  </div>

                </div>

              </div>
              
              {/* 底部上标详细表格监控 */}
              <div className="border border-zinc-200 bg-white rounded-xl p-3 mt-4 shrink-0 overflow-hidden text-[10.5px]">
                <div className="flex justify-between items-center mb-1.5 border-b border-zinc-100 pb-1.5">
                  <span className="font-extrabold text-[12px] text-zinc-700 flex items-center gap-1">最新云端时钟消息解析栈 (Message Decryption)</span>
                  <span className="text-[9px] text-[#10A66A] font-black">TCP信道正常 ────── 2s/次轮询</span>
                </div>
                <div className="max-h-[110px] overflow-y-auto">
                   <table className="w-full text-left text-zinc-650 border-collapse">
                      <thead>
                         <tr className="bg-zinc-50 text-[9.5px] text-zinc-400 font-bold border-b border-zinc-150">
                            <th className="p-1 px-2">时间</th>
                            <th className="p-1 px-2">消息流水ID</th>
                            <th className="p-1 px-2">订阅/发布主题</th>
                            <th className="p-1 px-2">数据有效负载 (Mqtt JSON Payload)</th>
                            <th className="p-1 px-2 text-right">链路Qos信标</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-[9px] font-mono">
                         {cloudConnectionStatus === "数据上报中" ? (
                            <>
                              <tr className="hover:bg-zinc-50/50">
                                 <td className="p-1.5 px-2 text-zinc-400">{cloudUploadTime}</td>
                                 <td className="p-1.5 px-2 text-zinc-450">msg_tx_094a_{Date.now().toString().slice(-4)}</td>
                                 <td className="p-1.5 px-2 text-emerald-600 font-bold">/greenhouse/temp01</td>
                                 <td className="p-1.5 px-2 text-zinc-700 font-semibold">{`{"device":"temp01","temperature":${cloudLatestValues.temp},"humidity":${cloudLatestValues.hum}}`}</td>
                                 <td className="p-1.5 px-2 text-right text-indigo-650 font-bold">QoS 1 (ACK)</td>
                              </tr>
                              <tr className="hover:bg-zinc-50/50">
                                 <td className="p-1.5 px-2 text-zinc-400">{cloudUploadTime}</td>
                                 <td className="p-1.5 px-2 text-zinc-450">msg_tx_094b_{Date.now().toString().slice(-4)}</td>
                                 <td className="p-1.5 px-2 text-emerald-600 font-bold">/greenhouse/light01</td>
                                 <td className="p-1.5 px-2 text-zinc-700 font-semibold">{`{"device":"light01","lux":${cloudLatestValues.light}}`}</td>
                                 <td className="p-1.5 px-2 text-right text-indigo-150 font-bold">QoS 1 (ACK)</td>
                              </tr>
                            </>
                         ) : (
                            <tr>
                               <td colSpan={5} className="p-6 text-center text-zinc-400 font-bold font-sans">
                                 当前温室环网数据未上报自中央云，信道常空。请在右侧“云平台对接”面板中点击“开始上报设备数据”启动。
                               </td>
                            </tr>
                         )}
                      </tbody>
                   </table>
                </div>
              </div>

          </div>
        ) : (
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
                      id="wire-mqtt"
                      d="M 400 135 C 465 135, 465 125, 530 125" 
                      stroke="#10A66A" 
                      strokeWidth="2" 
                      fill="none" 
                      markerEnd="url(#arrow)"
                      className="transition-all duration-300"
                    />
                    <circle r="2.5" fill="#059669">
                      <animateMotion path="M 400 135 C 465 135, 465 125, 530 125" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <text x="465" y="115" fill="#10A66A" fontSize="8" fontWeight="black" textAnchor="middle" className="pointer-events-none select-none">
                      MQTT 上报链路
                    </text>

                    {/* Wire 4 (Relay -> Fan): ABNORMAL OR CORRECTED */}
                    <path 
                      id="wire-relay-fan"
                      d="M 400 275 C 465 275, 465 255, 530 255" 
                      stroke={
                        lineCheckStatus === "检测完成" 
                          ? (hasRepaired ? "#10A66A" : "#EF4444") 
                          : "#A7D2BE"
                      } 
                      strokeWidth="2" 
                      strokeDasharray={(!hasRepaired && lineCheckStatus === "检测完成") ? "5 4" : "none"}
                      fill="none" 
                      markerEnd="url(#arrow)"
                      className={`transition-all duration-300 ${
                        locateHighlighted && !hasRepaired ? "stroke-[4px]" : ""
                      }`}
                    />
                    
                    {/* Pulse Glow when locating */}
                    {locateHighlighted && !hasRepaired && (
                      <path 
                        d="M 400 275 C 465 275, 465 255, 530 255" 
                        stroke="#EF4444" 
                        strokeWidth="8" 
                        fill="none" 
                        className="animate-ping opacity-35"
                      />
                    )}

                    {/* Signal dot on Wire 4 when healthy */}
                    {hasRepaired && (
                      <circle r="2.5" fill="#10A66A">
                        <animateMotion path="M 400 275 C 465 275, 465 255, 530 255" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Additional repair VCC wire overlay */}
                    {hasRepaired && (
                      <>
                        <path 
                          id="wire-vcc"
                          d="M 140 40 C 330 10, 330 285, 530 285" 
                          stroke="#EF4444" 
                          strokeWidth="2" 
                          fill="none" 
                          markerEnd="url(#arrow)"
                          className="animate-in fade-in duration-300"
                        />
                        <circle r="2.5" fill="#EF4444">
                          <animateMotion path="M 140 40 C 330 10, 330 285, 530 285" dur="2.8s" repeatCount="indefinite" />
                        </circle>
                      </>
                    )}

                    {/* Additional repair GND wire overlay */}
                    {hasRepaired && (
                      <>
                        <path 
                          id="wire-gnd"
                          d="M 140 70 C 330 50, 330 315, 530 315" 
                          stroke="#3B82F6" 
                          strokeWidth="2" 
                          fill="none" 
                          markerEnd="url(#arrow)"
                          className="animate-in fade-in duration-300"
                        />
                        <circle r="2.5" fill="#3B82F6">
                          <animateMotion path="M 140 70 C 330 50, 330 315, 530 315" dur="3s" repeatCount="indefinite" />
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
                   style={{ left: "20px", top: "115px" }} 
                   onClick={() => setSelectedNode("温湿度传感器")}
                   className={`absolute w-[120px] h-[95px] bg-white border-2 rounded-xl p-2 shadow-sm flex flex-col gap-1 cursor-pointer transition-all z-10 ${
                     selectedNode === "温湿度传感器" ? "border-[#10A66A] ring-2 ring-[#10A66A]/20" : (highlightedNodes.includes("温湿度传感器") ? "border-emerald-500 ring-4 ring-emerald-400 bg-emerald-50/10 scale-102 animate-pulse" : "border-zinc-200 hover:border-zinc-300")
                   }`}
                 >
                    <div className="bg-[#10A66A] text-white text-[9px] font-black px-1.5 py-0.5 rounded text-center truncate">
                      温湿度传感器
                    </div>
                    <div className="text-[10px] font-bold text-zinc-650 space-y-0.5 pt-0.5">
                       <div className="flex justify-between">
                         <span className="text-zinc-400 font-medium">温度:</span>
                         <span className="font-mono text-zinc-800">25.4 ℃</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-zinc-400 font-medium">湿度:</span>
                         <span className="font-mono text-zinc-800">60.1%</span>
                       </div>
                    </div>
                    <div className="flex justify-end text-[8.5px] text-zinc-400 border-t border-zinc-100 pt-1 font-mono font-bold">
                      <span className="text-[#10A66A]">DATA</span>
                    </div>
                 </div>

                 {/* Absolute Card 3: 光照传感器 */}
                 <div 
                   style={{ left: "20px", top: "235px" }} 
                   onClick={() => setSelectedNode("光照传感器")}
                   className={`absolute w-[120px] h-[85px] bg-white border-2 rounded-xl p-2 shadow-sm flex flex-col gap-1 cursor-pointer transition-all z-10 ${
                     selectedNode === "光照传感器" ? "border-[#10A66A] ring-2 ring-[#10A66A]/20" : (highlightedNodes.includes("光照传感器") ? "border-emerald-500 ring-4 ring-emerald-400 bg-emerald-50/10 scale-102 animate-pulse" : "border-zinc-200 hover:border-zinc-300")
                   }`}
                 >
                    <div className="bg-[#10A66A] text-white text-[9px] font-black px-1.5 py-0.5 rounded text-center truncate">
                      光照传感器
                    </div>
                    <div className="text-[10px] py-0.5">
                      <div className="flex justify-between font-bold font-mono">
                        <span className="text-zinc-400 font-medium">光强:</span>
                        <span className="text-zinc-800">450 Lux</span>
                      </div>
                    </div>
                    <div className="flex justify-end text-[8.5px] text-zinc-400 border-t border-zinc-100 pt-1 font-mono font-bold">
                      <span className="text-emerald-600">AO 信号口</span>
                    </div>
                 </div>

                 {/* Absolute Card 4: Modbus网关 */}
                 <div 
                   style={{ left: "250px", top: "80px" }} 
                   onClick={() => setSelectedNode("Modbus网关")}
                   className={`absolute w-[150px] h-[115px] bg-white border-2 rounded-xl p-2.5 shadow-sm flex flex-col gap-1 cursor-pointer transition-all z-10 ${
                     selectedNode === "Modbus网关" ? "border-[#10A66A] ring-2 ring-[#10A66A]/20" : (highlightedNodes.includes("Modbus网关") ? "border-emerald-500 ring-4 ring-emerald-400 bg-emerald-50/10 scale-102 animate-pulse" : "border-zinc-200 hover:border-zinc-300")
                   }`}
                 >
                    <div className="bg-emerald-700 text-white text-[9.5px] font-black px-1.5 py-0.5 rounded text-center">
                      Modbus网关
                    </div>
                    <div className="text-[8.5px] text-zinc-400 font-mono text-center pt-0.5">
                      IP: 192.168.1.18
                    </div>
                    <div className="flex items-center gap-1.5 justify-center py-1 border-t border-b border-zinc-100 my-0.5">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                       <span className="text-[8px] font-bold text-emerald-600 font-mono">{highlightedNodes.includes("Modbus网关") ? "TRANSMITTING" : "FLOW ACTIVE"}</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono font-bold text-zinc-400">
                      <span>DI1 / AI1</span>
                      <span className="text-[#10A66A]">MQTT</span>
                    </div>
                 </div>

                 {/* Absolute Card 5: 继电器 */}
                 <div 
                   style={{ left: "250px", top: "225px" }} 
                   onClick={() => setSelectedNode("继电器")}
                   className={`absolute w-[150px] h-[85px] bg-white border-2 rounded-xl p-2.5 shadow-sm flex flex-col gap-1 cursor-pointer transition-all z-10 ${
                     selectedNode === "继电器" 
                       ? "border-[#10A66A] ring-2 ring-[#10A66A]/20" 
                       : (highlightedNodes.includes("继电器") ? "border-emerald-500 ring-4 ring-emerald-400 bg-emerald-50/10 scale-102" : (locateHighlighted && !hasRepaired ? "border-rose-300 ring-2 ring-rose-105" : "border-zinc-200 hover:border-zinc-300"))
                   }`}
                 >
                    <div className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded text-center">
                      智能继电器
                    </div>
                    <div className="text-[9px] font-bold text-zinc-500 text-center py-1">
                      控制状态: <span className="text-[#10A66A] font-extrabold">{(communicationStatus === "通信中" && messageList.some(m => m.source === "继电器" || m.target === "继电器")) ? "已执行 (ACTIVE)" : "CLOSED [接通]"}</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono font-bold text-zinc-400 border-t border-zinc-100 pt-0.5">
                      <span>IN 接收</span>
                      <span className="text-emerald-600">OUT 常开端</span>
                    </div>
                 </div>

                 {/* Absolute Card 6: 云平台节点 */}
                 <div 
                  style={{ left: "530px", top: "75px" }}                   onClick={() => setSelectedNode("云平台节点")}
                   className={`absolute w-[130px] h-[95px] bg-white border-2 rounded-xl p-2.5 shadow-sm flex flex-col gap-1 cursor-pointer transition-all z-15 ${
                     selectedNode === "云平台节点" ? "border-indigo-500 ring-2 ring-indigo-100" : (highlightedNodes.includes("云平台节点") ? "border-emerald-500 ring-4 ring-emerald-400 bg-emerald-50/10 scale-102 animate-pulse" : "border-zinc-200 hover:border-zinc-300")
                   }`}
                 >
                    <div className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded text-center truncate">
                      云平台节点
                    </div>
                    <div className="text-[8.5px] text-zinc-400 font-mono text-center pt-0.5">
                      设备标识: cloud-001
                    </div>
                    <div className="text-[9px] font-bold text-center text-zinc-500 pt-1">
                      状态: <span className="text-[#10A66A] font-black">已连接</span>
                    </div>
                    <div className="flex justify-start text-[8px] font-mono font-bold text-zinc-400 border-t border-zinc-100 pt-0.5 mt-0.5">
                      <span className="text-[#10A66A] font-black text-center w-full">Topic: /greenhouse/data</span>
                    </div>
                 </div>

                 {/* Absolute Card 7: 风机 (负载设备) */}
                 <div 
                   style={{ left: "530px", top: "210px" }}                   onClick={() => setSelectedNode("风机")}
                   className={`absolute w-[140px] h-[105px] bg-white border-2 rounded-xl p-2.5 shadow-sm flex flex-col gap-1 cursor-pointer transition-all duration-300 z-10 ${
                     selectedNode === "风机" 
                       ? "border-sky-500 ring-2 ring-sky-100" 
                       : (highlightedNodes.includes("风机") ? "border-emerald-500 ring-4 ring-emerald-400 bg-emerald-50/10 scale-102" : (locateHighlighted && !hasRepaired ? "border-rose-500 ring-2 ring-rose-300 bg-rose-50/10 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse" : "border-zinc-200 hover:border-zinc-300"))
                   }`}
                 >
                    <div className="bg-sky-500 text-white text-[9.5px] font-black px-1.5 py-0.5 rounded text-center">
                      风机控制器
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                      <span className="text-[9px] font-bold text-zinc-400">运行转速:</span>
                      <span className="font-mono text-[10px] font-black text-sky-600 animate-pulse">
                        {hasRepaired || (communicationStatus === "通信中" && messageList.some(m => m.source === "风机" || m.target === "风机")) ? "运行中 (2400 RPM)" : "0 RPM (动力端未连线)"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono font-bold text-zinc-400 pt-1">
                      <span className="text-red-500">VCC</span>
                      <span className="text-blue-500 font-bold">GND</span>
                    </div>
                    <div className="flex justify-center pt-0.5">
                      <span className="text-[8px] font-mono font-bold text-emerald-600">IN (接收)</span>
                    </div>
                 </div>

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
          <div className={`${isConsoleExpanded ? "h-[220px]" : "h-9"} bg-white border-t border-zinc-200 flex flex-col shrink-0 select-none relative transition-all duration-200 overflow-hidden`}>
             {/* Tab header controller */}
             <div className="px-4 py-1.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-[11px] font-bold text-zinc-700 shrink-0 h-9">
                <div className="flex items-center gap-1">
                  {[
                    { id: "comm" as const, label: "通信消息" },
                    { id: "wires" as const, label: "连线记录" },
                    { id: "logs" as const, label: "操作日志" },
                    { id: "cloud_records" as const, label: "云平台记录" }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => {
                        setActiveConsoleTab(tab.id as any);
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
                     <div className="flex flex-col h-full text-zinc-700 font-sans select-none overflow-hidden pb-1">
                        {/* 1. 顶部控制栏与全局过滤器 */}
                        <div className="flex flex-wrap items-center justify-between gap-1 border-b border-zinc-100 pb-1.5 mb-1.5 bg-[#FAFBFB]">
                           <div className="flex items-center gap-1.5 shrink-0">
                              {/* 运行状态指示 */}
                              <div className="flex items-center bg-white px-2 py-0.5 rounded border border-zinc-200 shrink-0">
                                 <span className="text-zinc-400 font-bold mr-1 text-[9px]">网络引擎:</span>
                                 <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                    communicationStatus === "通信中" ? "bg-emerald-500 animate-ping" : 
                                    communicationStatus === "已暂停" ? "bg-amber-400" : "bg-zinc-300"
                                 }`} />
                                 <span className={`font-black text-[9px] ${
                                    communicationStatus === "通信中" ? "text-emerald-600" : 
                                    communicationStatus === "已暂停" ? "text-amber-500" : "text-zinc-500"
                                 }`}>{communicationStatus}</span>
                              </div>

                              {/* 核心动作按钮组合 */}
                              <div className="flex items-center bg-white rounded border border-zinc-200 p-0.5 shadow-xs gap-0.5 shrink-0">
                                 {communicationStatus !== "通信中" ? (
                                    <button
                                       onClick={() => {
                                          setCommunicationStatus("通信中");
                                          addLog("启动物联网全链设备通信引擎");
                                          showToast("已启动通信消息自动追加 (默认2秒/条)");
                                       }}
                                       className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 hover:bg-[#10A66A] hover:text-white text-[#10A66A] rounded text-[9px] font-black cursor-pointer transition border border-emerald-200 shrink-0"
                                    >
                                       <Play className="w-2.5 h-2.5" />
                                       <span>开始通信</span>
                                    </button>
                                 ) : (
                                    <button
                                       onClick={() => {
                                          setCommunicationStatus("已暂停");
                                          addLog("暂停设备通讯监听及管道推送");
                                          showToast("物联网通信已暂停监听");
                                       }}
                                       className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-600 rounded text-[9px] font-black cursor-pointer transition border border-amber-200 shrink-0"
                                    >
                                       <Pause className="w-2.5 h-2.5" />
                                       <span>暂停监听</span>
                                    </button>
                                 )}

                                 <button
                                    onClick={() => {
                                       // 注入一条测试数据包
                                       const template = presetMessages[messagePresetIndex % presetMessages.length];
                                       const now = new Date();
                                       const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                                       
                                       const manualMsg = {
                                          id: `test-${Date.now()}`,
                                          time: timeStr,
                                          source: template.source,
                                          target: template.target,
                                          protocol: template.protocol,
                                          topicOrAddr: template.topicOrAddr,
                                          direction: template.direction,
                                          content: template.content,
                                          status: template.status,
                                          detailText: template.detailText,
                                          resultText: template.resultText,
                                          errorReason: template.errorReason,
                                          advice: template.advice
                                       };

                                       setMessageList(prev => [manualMsg, ...prev]);
                                       setMessagePresetIndex(prev => prev + 1);
                                       if (manualMsg.status === "异常") {
                                          addLog(`${timeStr}｜发现通信异常：温湿度传感器上报数据格式异常`);
                                       } else {
                                          addLog(`手动发送调试命令至 ${template.target}`);
                                       }
                                       showToast("已注入单次发送测试报文块");

                                       // 联动闪烁高亮
                                       setHighlightedNodes([template.source, template.target]);
                                       setTimeout(() => setHighlightedNodes([]), 1200);
                                    }}
                                    className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-zinc-100 rounded text-zinc-650 text-[9px] font-bold cursor-pointer transition shrink-0"
                                 >
                                    <Send className="w-2.5 h-2.5 text-[#10A66A]" />
                                    <span>发送测试帧</span>
                                 </button>

                                 <button
                                    onClick={() => {
                                       setMessageList([]);
                                       setSelectedMessage(null);
                                       addLog("清空通讯监听日志及管道缓存");
                                       showToast("已清空通信消息记录");
                                    }}
                                    className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded text-[9px] font-bold cursor-pointer transition shrink-0"
                                 >
                                    <Trash2 className="w-2.5 h-2.5" />
                                    <span>清空状态</span>
                                 </button>
                              </div>
                           </div>

                           {/* 筛选控制器 */}
                           <div className="flex items-center gap-1 shrink-0">
                              <select 
                                 value={messageFilters.device}
                                 onChange={(e) => setMessageFilters(prev => ({ ...prev, device: e.target.value }))}
                                 className="bg-white border border-zinc-200 text-[9px] font-bold text-zinc-650 px-1 py-0.2 rounded outline-none cursor-pointer focus:border-[#10A66A]"
                              >
                                 <option value="全部设备">所有设备</option>
                                 <option value="温湿度传感器">温湿度传感器</option>
                                 <option value="继电器">继电器</option>
                                 <option value="Modbus网关">Modbus网关</option>
                                 <option value="云平台节点">云平台节点</option>
                                 <option value="风机">风机控制器</option>
                              </select>

                              <select 
                                 value={messageFilters.protocol}
                                 onChange={(e) => setMessageFilters(prev => ({ ...prev, protocol: e.target.value }))}
                                 className="bg-white border border-zinc-200 text-[9px] font-bold text-zinc-650 px-1 py-0.2 rounded outline-none cursor-pointer focus:border-[#10A66A]"
                              >
                                 <option value="全部协议">所有协议</option>
                                 <option value="Modbus RTU">Modbus RTU</option>
                                 <option value="MQTT">MQTT</option>
                                 <option value="GPIO控制">GPIO控制</option>
                              </select>

                              <select 
                                 value={messageFilters.status}
                                 onChange={(e) => setMessageFilters(prev => ({ ...prev, status: e.target.value }))}
                                 className="bg-white border border-zinc-200 text-[9px] font-bold text-zinc-650 px-1 py-0.2 rounded outline-none cursor-pointer focus:border-[#10A66A]"
                              >
                                 <option value="全部">所有状态</option>
                                 <option value="已发送">已发送</option>
                                 <option value="已接收">已接收</option>
                                 <option value="已执行">已执行</option>
                                 <option value="已转发">已转发</option>
                                 <option value="异常">异常通信</option>
                              </select>

                              <div className="relative">
                                 <input 
                                    type="text" 
                                    value={messageFilters.searchKeyword}
                                    onChange={(e) => setMessageFilters(prev => ({ ...prev, searchKeyword: e.target.value }))}
                                    placeholder="检索字段..."
                                    className="bg-white border border-zinc-200 text-[8.5px] pl-4 pr-1 py-0.2 rounded outline-none w-20 placeholder-zinc-400 focus:border-[#10A66A]"
                                 />
                                 <Search className="w-2.5 h-2.5 absolute left-1 top-1 text-zinc-400" />
                              </div>
                           </div>
                        </div>

                        {/* 2. 主体区：左流水列表，右精细分析卡 */}
                        <div className="flex-1 flex gap-2 overflow-hidden h-[165px]">
                           {/* 左侧消息流水列表 */}
                           <div className="flex-1 border border-zinc-150 rounded bg-white overflow-hidden flex flex-col">
                              {/* 快速统计条 */}
                              <div className="grid grid-cols-5 text-[8.5px] font-bold border-b border-zinc-100 bg-zinc-50 text-zinc-500 py-0.5 text-center shrink-0">
                                 <div 
                                    onClick={() => setMessageFilters(prev => ({ ...prev, status: "全部" }))}
                                    className="border-r border-zinc-100 cursor-pointer hover:bg-zinc-150/40 transition py-0.5"
                                 >
                                    监测包: <b className="text-zinc-800 font-mono">{messageList.length}</b>
                                 </div>
                                 <div 
                                    onClick={() => setMessageFilters(prev => ({ ...prev, status: "已发送" }))}
                                    className="border-r border-zinc-100 text-[#10A66A] cursor-pointer hover:bg-zinc-150/40 transition py-0.5"
                                 >
                                    已发送: <b className="font-mono">{messageStats.sent}</b>
                                 </div>
                                 <div 
                                    onClick={() => setMessageFilters(prev => ({ ...prev, status: "已接收" }))}
                                    className="border-r border-zinc-100 text-indigo-600 cursor-pointer hover:bg-zinc-150/40 transition py-0.5"
                                 >
                                    已接收: <b className="font-mono">{messageStats.received}</b>
                                 </div>
                                 <div 
                                    onClick={() => setMessageFilters(prev => ({ ...prev, status: "已执行" }))}
                                    className="border-r border-zinc-100 text-blue-600 font-extrabold cursor-pointer hover:bg-zinc-150/40 transition py-0.5"
                                 >
                                    已执行: <b className="font-mono">{messageStats.executed}</b>
                                 </div>
                                 <div 
                                    onClick={() => setMessageFilters(prev => ({ ...prev, status: "异常" }))}
                                    className="text-rose-500 font-extrabold cursor-pointer hover:bg-rose-100/30 transition py-0.5 animate-pulse"
                                 >
                                    异常消息: <b className="font-mono">{messageList.filter(m => m.status === "异常").length} 条</b>
                                 </div>
                              </div>

                              <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 text-[9.5px]">
                                 {messageList.filter(msg => {
                                    if (messageFilters.device !== "全部设备" && msg.source !== messageFilters.device && msg.target !== messageFilters.device) return false;
                                    if (messageFilters.protocol !== "全部协议" && msg.protocol !== messageFilters.protocol) return false;
                                    if (messageFilters.status !== "全部" && msg.status !== messageFilters.status) return false;
                                    if (messageFilters.searchKeyword && !msg.content.toLowerCase().includes(messageFilters.searchKeyword.toLowerCase()) && !msg.topicOrAddr.toLowerCase().includes(messageFilters.searchKeyword.toLowerCase())) return false;
                                    return true;
                                 }).length === 0 ? (
                                    <div className="py-8 text-center text-zinc-450 italic font-medium flex flex-col items-center justify-center gap-1">
                                       <WifiOff className="w-5 h-5 text-zinc-300" />
                                       <span>暂无筛选匹配消息</span>
                                    </div>
                                 ) : (
                                    messageList.filter(msg => {
                                       if (messageFilters.device !== "全部设备" && msg.source !== messageFilters.device && msg.target !== messageFilters.device) return false;
                                       if (messageFilters.protocol !== "全部协议" && msg.protocol !== messageFilters.protocol) return false;
                                       if (messageFilters.status !== "全部" && msg.status !== messageFilters.status) return false;
                                       if (messageFilters.searchKeyword && !msg.content.toLowerCase().includes(messageFilters.searchKeyword.toLowerCase()) && !msg.topicOrAddr.toLowerCase().includes(messageFilters.searchKeyword.toLowerCase())) return false;
                                       return true;
                                    }).map((msg) => {
                                        const isErr = msg.status === "异常";
                                        return (
                                           <div 
                                              key={msg.id}
                                              onClick={() => {
                                                 if (!isErr) {
                                                    setSelectedMessage(msg);
                                                 }
                                              }}
                                              className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer transition border-b border-zinc-50 ${
                                                 isErr 
                                                    ? "bg-rose-50/40 hover:bg-rose-50 border-l-2 border-rose-400" 
                                                    : selectedMessage?.id === msg.id 
                                                      ? "bg-[#EAF8F1]/50 border-l-2 border-[#10A66A]" 
                                                      : "hover:bg-zinc-50"
                                              }`}
                                           >
                                              {/* 流量方向 */}
                                              <div className={`shrink-0 w-8 text-center font-bold px-1 py-0.1 rounded text-[7px] ${
                                                 isErr ? "bg-rose-100 text-rose-700 font-extrabold" :
                                                 msg.status === "已执行" ? "bg-sky-100 text-sky-700" :
                                                 msg.status === "已转发" ? "bg-amber-100 text-amber-700" :
                                                 msg.direction === "tx" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"
                                              }`}>
                                                 {isErr ? "ERR" : msg.direction.toUpperCase()}
                                              </div>

                                              {/* 时间 */}
                                              <div className="shrink-0 font-mono text-zinc-400 text-[8px] w-10">{msg.time}</div>
                                              <span className="text-zinc-200 text-[8px] shrink-0 select-none">｜</span>

                                              {/* 发端 */}
                                              <div className="shrink-0 font-bold text-zinc-700 text-[8.5px] w-16 truncate" title={msg.source}>{msg.source}</div>
                                              <span className="text-zinc-200 text-[8px] shrink-0 select-none">｜</span>

                                              {/* 宿端 */}
                                              <div className="shrink-0 font-bold text-zinc-650 text-[8.5px] w-16 truncate" title={msg.target}>{msg.target}</div>
                                              <span className="text-zinc-200 text-[8px] shrink-0 select-none">｜</span>

                                              {/* 校验协议 */}
                                              <div className="shrink-0 font-mono text-[7px] text-zinc-500 w-12 truncate">{msg.protocol}</div>
                                              <span className="text-zinc-200 text-[8px] shrink-0 select-none">｜</span>

                                              {/* Topic/地址 */}
                                              <div className="shrink-0 font-mono text-[#10A66A] text-[7.5px] w-14 truncate" title={msg.topicOrAddr}>{msg.topicOrAddr}</div>
                                              <span className="text-zinc-200 text-[8px] shrink-0 select-none">｜</span>

                                              {/* 方向 */}
                                              <div className="shrink-0 text-zinc-500 text-[7.5px] w-10 text-center select-none">
                                                 {msg.direction === "tx" || msg.direction === "下行" ? "下行" : "上行"}
                                              </div>
                                              <span className="text-zinc-200 text-[8px] shrink-0 select-none">｜</span>

                                              {/* 原始消息摘要 */}
                                              <div className="flex-1 font-mono text-zinc-500 truncate text-[8px] pl-1" title={msg.content}>{msg.content}</div>
                                              <span className="text-zinc-200 text-[8px] shrink-0 select-none">｜</span>

                                              {/* 状态列 */}
                                              <div className="shrink-0 w-12 text-center select-none">
                                                 {isErr ? (
                                                    <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 font-extrabold text-[7.5px] rounded border border-rose-200">异常</span>
                                                 ) : (
                                                    <span className={`px-1.5 py-0.5 text-[7.5px] font-bold rounded border ${
                                                       msg.status === "已执行" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                       msg.status === "已转发" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                       "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    }`}>{msg.status}</span>
                                                 )}
                                              </div>
                                              <span className="text-zinc-200 text-[8px] shrink-0 select-none">｜</span>

                                              {/* 操作列动作 */}
                                              <div className="shrink-0 flex items-center gap-1 select-none">
                                                 {isErr ? (
                                                    <button
                                                       onClick={(e) => {
                                                          e.stopPropagation();
                                                          const now = new Date();
                                                          const logTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                                                          addLog(`${logTime}｜查看通信异常详情`);
                                                          setActiveAnomalyDetail(msg);
                                                       }}
                                                       className="px-1.5 py-0.5 font-bold border border-rose-350 text-rose-600 rounded text-[7.5px] bg-white hover:bg-rose-50 cursor-pointer transition shrink-0 shadow-xs"
                                                    >
                                                       查看异常
                                                    </button>
                                                 ) : (
                                                    <button
                                                       onClick={(e) => {
                                                          e.stopPropagation();
                                                          setSelectedMessage(msg);
                                                       }}
                                                       className="px-1.5 py-0.5 font-bold border border-emerald-250 hover:bg-emerald-50 text-[#10A66A] rounded text-[7.5px] bg-white cursor-pointer transition shrink-0 shadow-xs"
                                                    >
                                                       查看
                                                    </button>
                                                 )}
                                                 
                                                 <button
                                                    onClick={(e) => {
                                                       e.stopPropagation();
                                                       setSelectedNode(msg.source);
                                                       setHighlightedNodes([msg.source]);
                                                       setTimeout(() => setHighlightedNodes([]), 1500);
                                                       addLog(`定位并高亮闪烁设备：${msg.source}`);
                                                       showToast(`已画布高亮：${msg.source}`);
                                                    }}
                                                    className="px-1.5 py-0.5 font-bold border border-zinc-200 text-zinc-500 rounded text-[7.5px] bg-white hover:bg-zinc-50 cursor-pointer transition shrink-0"
                                                 >
                                                    定位
                                                 </button>
                                              </div>
                                           </div>
                                        );
                                     })
                                 )}
                              </div>
                           </div>

                           {/* 右侧极其高品质的协议分析与详情检测结果面板 */}
                           <div className="w-[30%] border border-zinc-150 rounded bg-white p-2 flex flex-col overflow-y-auto scrollbar-thin shrink-0 select-none">
                              {selectedMessage ? (
                                 <div className="flex-1 flex flex-col justify-between text-[9.5px]">
                                    <div>
                                       {/* 报文头和协议 */}
                                       <div className="flex items-center justify-between border-b border-zinc-150 pb-0.8 mb-1 shrink-0">
                                          <div className="flex items-center gap-1">
                                             <span className="w-1.5 h-1.5 bg-[#10A66A] rounded-full" />
                                             <span className="font-extrabold text-[10px] text-zinc-800">协议报文解析</span>
                                          </div>
                                          <span className="font-mono text-[8px] font-black bg-emerald-50 text-[#10A66A] px-1.2 py-0.1 rounded border border-emerald-100">{selectedMessage.protocol}</span>
                                       </div>

                                       {/* 链路信息 */}
                                       <div className="text-[9px] space-y-0.5 text-zinc-650 bg-zinc-50 p-1 rounded border border-zinc-150 mb-1 font-bold leading-tight">
                                          <div className="flex justify-between">
                                             <span className="text-zinc-400 font-medium font-sans">发端:</span>
                                             <span className="text-zinc-850 font-black">{selectedMessage.source}</span>
                                          </div>
                                          <div className="flex justify-between">
                                             <span className="text-zinc-400 font-medium font-sans">宿端:</span>
                                             <span className="text-zinc-850 font-black">{selectedMessage.target}</span>
                                          </div>
                                          <div className="flex justify-between">
                                             <span className="text-zinc-400 font-medium font-sans">标识/Topic:</span>
                                             <span className="font-mono text-[#10A66A] break-all">{selectedMessage.topicOrAddr}</span>
                                          </div>
                                       </div>

                                       {/* 报文原始HEX */}
                                       <div className="space-y-0.5 mb-1 shrink-0">
                                          <div className="text-[8px] font-black text-zinc-400">Payload 载荷</div>
                                          <div className="bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono text-[8.5px] p-1.2 rounded break-all font-black text-center tracking-wider leading-none">
                                             {selectedMessage.content}
                                          </div>
                                       </div>

                                       {/* 解析出的含义 */}
                                       <div className="space-y-0.5 pt-0.5 shrink-0">
                                          <div className="text-[8px] font-black text-zinc-400">数据字典翻译</div>
                                          <div className="text-zinc-650 bg-zinc-50 p-1.2 rounded border border-zinc-150 font-medium leading-normal text-[9px]">
                                             {selectedMessage.detailText || "暂未捕获解析状态"}
                                          </div>
                                       </div>

                                       {/* 产生异常时的错误成因和修复建议 */}
                                       {selectedMessage.status === "异常" && (
                                          <div className="bg-rose-50 border border-rose-150 text-rose-700 rounded p-1.2 mt-1 space-y-0.5 leading-normal text-[9px]">
                                             <div className="flex items-center gap-0.5 font-black text-rose-800">
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                                                <span>报文异常成因: {selectedMessage.errorReason}</span>
                                             </div>
                                             <div className="text-[8.5px] font-medium text-rose-650 leading-relaxed pt-0.2">
                                                <b>推荐排错:</b> {selectedMessage.advice}
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              ) : (
                                 <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-450 select-none h-full py-2">
                                    <FileSearch className="w-4 h-4 text-zinc-300 mb-0.5" />
                                    <span className="text-[9px] font-bold text-zinc-650">双击或选中某条通信消息</span>
                                    <span className="text-[8px] text-zinc-400 mt-0.5">可展示报文包结构解析</span>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  )}
                  {false && (
                    <div className="space-y-0.5">
                      <div className="text-emerald-600">[Modbus RTU] tx ► 01 03 00 00 00 02 C4 0B</div>
                      <div className="text-zinc-500">[Modbus RTU] rx ◄ 01 03 04 01 0E 02 54 89 FA (Temp: 25.4℃, Humi: 60.1%)</div>
                      <div className="text-emerald-600">[Modbus RTU] tx ► 01 03 00 00 00 02 C4 0B</div>
                      <div className="text-purple-600">[CLOUD MQTT] publish to topic "/industrial/sensors/v1" data: {"{"}"id":"sn-01","temp":25.4,"humi":60.1{"}"}</div>
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

                  {activeConsoleTab === "cloud_records" && (
                     <div className="flex flex-col h-full font-sans select-none overflow-y-auto pb-1 max-h-[170px] bg-white border border-zinc-150 rounded">
                        <table className="w-full text-left text-zinc-650 border-collapse">
                           <thead>
                              <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-550 border-solid">
                                 <th className="p-2 w-16">时间</th>
                                 <th className="p-2 w-20">操作类型</th>
                                 <th className="p-2 w-24">平台名称</th>
                                 <th className="p-2 w-28">设备名称</th>
                                 <th className="p-2">数据内容</th>
                                 <th className="p-2 w-16">状态</th>
                                 <th className="p-2 w-16">操作人</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-zinc-100 text-[10px]">
                              {cloudRecords.length === 0 ? (
                                 <tr>
                                    <td colSpan={7} className="p-6 text-center text-zinc-400 font-bold">
                                       暂无云平台推送与连接历史记录，请先在右侧“云平台对接”面板中启动连接并上报数据
                                    </td>
                                 </tr>
                              ) : (
                                 cloudRecords.map((rec, i) => (
                                    <tr key={i} className="hover:bg-zinc-50/50">
                                       <td className="p-2 font-mono text-zinc-400">{rec.time}</td>
                                       <td className="p-2">
                                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                             rec.type === "连接平台" ? "bg-emerald-50 text-[#10A66A]" : 
                                             rec.type === "断开连接" ? "bg-[#FFF1F2] text-rose-650" :
                                             rec.type === "同步设备" ? "bg-indigo-50 text-indigo-600" :
                                             rec.type === "数据上报" ? "bg-emerald-50 text-[#10A66A]" :
                                             "bg-zinc-100 text-zinc-500"
                                          }`}>{rec.type}</span>
                                       </td>
                                       <td className="p-2 text-zinc-500">{rec.platform}</td>
                                       <td className="p-2 font-semibold text-zinc-700">{rec.device || "—"}</td>
                                       <td className="p-2 font-mono text-zinc-600 truncate max-w-[200px]">{rec.content || "—"}</td>
                                       <td className="p-2">
                                          <span className="text-[9.5px] font-bold text-emerald-600">✓ {rec.status}</span>
                                       </td>
                                       <td className="p-2 text-zinc-400">{rec.operator}</td>
                                    </tr>
                                 ))
                              )}
                           </tbody>
                        </table>
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
      )}

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
             <div id="right-sidebar-validation-tabs" className="grid grid-cols-4 text-center text-[10px] font-bold border-b border-zinc-200 bg-zinc-50/55 shrink-0 select-none">
                <button
                  onClick={() => {
                    setRightPanelTab("params");
                    setActiveProjectMode("normal");
                  }}
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
                    setActiveProjectMode("normal");
                    if (!lineValidationEnabled) {
                      addLog("[提示] 切换至连线校验面板。当前系统尚未开启全局连线验证开关。");
                    }
                  }}
                  className={`py-2.5 border-b-2 transition flex items-center justify-center gap-0.5 cursor-pointer ${
                    rightPanelTab === "wires"
                      ? "border-[#10A66A] text-[#10A66A] bg-white font-extrabold"
                      : "border-transparent text-zinc-500 hover:text-[#10A66A]/80 font-semibold"
                  }`}
                >
                  <span>连线校验</span>
                  {lineCheckStatus === "检测完成" && !hasRepaired && (
                    <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setRightPanelTab("cloud");
                    setActiveProjectMode("normal");
                    addLog("[提示] 切换至云平台对接面板。");
                  }}
                  className={`py-2.5 border-b-2 transition flex items-center justify-center gap-0.5 cursor-pointer ${
                    rightPanelTab === "cloud"
                      ? "border-[#10A66A] text-[#10A66A] bg-white font-extrabold"
                      : "border-transparent text-zinc-500 hover:text-[#10A66A]/80 font-semibold"
                  }`}
                >
                  <span>云平台对接</span>
                  {cloudConnectionStatus === "未连接" && (
                    <span className="w-1 h-1 rounded-full bg-[#10A66A] animate-pulse shrink-0" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setRightPanelTab("aiHelper");
                    setActiveProjectMode("ai");
                    addLog("[提示] 切换至AI工程智能助手，已载入自然语言创建工程仿真。");
                  }}
                  className={`py-2.5 border-b-2 transition flex items-center justify-center gap-0.5 cursor-pointer ${
                    rightPanelTab === "aiHelper"
                      ? "border-[#10A66A] text-[#10A66A] bg-white font-extrabold"
                      : "border-transparent text-zinc-500 hover:text-[#10A66A]/80 font-semibold"
                  }`}
                >
                  <span>AI工程助手</span>
                </button>
             </div>

             {/* Selected node editable sheet */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {rightPanelTab === "params" && (<>
                <div className="space-y-1 bg-[#FAFBFB] border border-zinc-150 p-2.5 rounded-lg">
                   <span className="text-[10px] text-zinc-400 font-bold uppercase block">当前聚焦部件</span>
                   <span className="font-extrabold text-[#10A66A] text-[13px]">{selectedNode}</span>
                </div>

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
                )}
                
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
                )}

                {rightPanelTab === "wires" && (
                  // Right Sidebar Validation tab layout
                  <div className="space-y-4 animate-in fade-in duration-200">
                     
                     {/* Switch Validation Status Alert */}
                     {!lineValidationEnabled ? (
                        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-center space-y-3">
                           <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-450 mx-auto">
                              <AlertCircle className="w-5 h-5 text-zinc-500" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="font-extrabold text-zinc-700 text-[11.5px]">连线验证功能未启用</h4>
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
                                    <div className="text-[10px] text-zinc-400 font-bold">回路异常断连</div>
                                    <div className={`text-[13px] font-black font-mono pt-0.5 ${
                                      lineCheckStatus === "检测完成" && !hasRepaired ? "text-rose-500 animate-bounce" : "text-zinc-700"
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
                                    <span>智慧控制流配对中...</span>
                                 </div>
                              )}
                           </div>

                           {/* Connection validation check list */}
                           {lineCheckStatus !== "未检测" && (
                              <div className="space-y-2 select-none font-bold">
                                 <h4 className="text-zinc-400 font-extrabold text-[10px] uppercase tracking-wider block">物理拓扑连线列表 ({hasRepaired ? "4/4" : "3/4"})</h4>
                                 <div className="space-y-1.5">
                                    
                                    {/* Link 1: Temp sensor data */}
                                    <div className="bg-white border border-zinc-200 rounded-lg p-2.5 flex items-center justify-between shadow-xs">
                                       <div className="space-y-0.5 min-w-0">
                                          <div className="font-extrabold text-[11px] text-zinc-750 truncate animate-in fade-in duration-200">温湿度传感器 ➔ Modbus网关</div>
                                          <div className="text-[9px] text-[#10A66A] font-bold">1-Wire 单总线状态 [已校验]</div>
                                       </div>
                                       <span className="text-[10px] font-bold text-[#10A66A] bg-emerald-50 px-1.5 py-0.5 rounded border border-[#CFEFE0]">合格</span>
                                    </div>

                                    {/* Link 2: Light sensor input */}
                                    <div className="bg-white border border-zinc-200 rounded-lg p-2.5 flex items-center justify-between shadow-xs">
                                       <div className="space-y-0.5 min-w-0">
                                          <div className="font-extrabold text-[11px] text-zinc-755 truncate">光照传感器 ➔ Modbus网关</div>
                                          <div className="text-[9px] text-[#10A66A] font-bold">ADC 模拟信号状态 [已校验]</div>
                                       </div>
                                       <span className="text-[10px] font-bold text-[#10A66A] bg-emerald-50 px-1.5 py-0.5 rounded border border-[#CFEFE0]">合格</span>
                                    </div>

                                    {/* Link 3: Modbus to server node */}
                                    <div className="bg-white border border-zinc-200 rounded-lg p-2.5 flex items-center justify-between shadow-xs">
                                       <div className="space-y-0.5 min-w-0 flex-1">
                                          <div className="font-extrabold text-[11px] text-zinc-755 truncate animate-in fade-in duration-250">Modbus网关 ➔ 云平台节点</div>
                                          <div className="text-[9px] text-[#10A66A] font-bold">MQTT 工业协议发布 [已校验]</div>
                                       </div>
                                       <span className="text-[10px] font-bold text-[#10A66A] bg-emerald-50 px-1.5 py-0.5 rounded border border-[#CFEFE0]">合格</span>
                                    </div>

                                    {/* Link 4: Relay to Fan load power loop */}
                                    <div 
                                      onClick={() => setSelectedConnId("relay_fan")}
                                      className={`border rounded-xl p-2.5 flex flex-col gap-1.5 cursor-pointer transition ${
                                        selectedConnId === "relay_fan"
                                          ? "bg-zinc-50 border-[#10A66A] shadow-sm animate-in fade-in duration-200"
                                          : hasRepaired ? "bg-white border-zinc-200 hover:border-zinc-300" : "bg-rose-50/20 border-rose-300 hover:bg-rose-50/40 animate-pulse animate-in duration-100"
                                      }`}
                                    >
                                       <div className="flex items-center justify-between">
                                          <div className="space-y-0.5 min-w-0 flex-1">
                                             <div className="font-extrabold text-[11px] text-zinc-800 truncate">继电器 ➔ 风机控制器</div>
                                             <div className={`text-[9px] font-bold ${hasRepaired ? "text-[#10A66A]" : "text-rose-500 font-extrabold"}`}>
                                                动力引出: COM 12V 动力配电物理导线
                                             </div>
                                          </div>
                                          <span className={`text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded border ${
                                            hasRepaired 
                                              ? "text-[#10A66A] bg-emerald-50 border-[#CFEFE0]" 
                                              : "text-rose-500 bg-rose-50 border-rose-100"
                                          }`}>
                                             {hasRepaired ? "合格" : "断连"}
                                          </span>
                                       </div>

                                       {/* Detailed panel when clicked or abnormal */}
                                       {(!hasRepaired || selectedConnId === "relay_fan") && (
                                          <div className="border-t border-dashed border-zinc-200 pt-2 mt-1 space-y-2 text-[10px] leading-relaxed text-zinc-500">
                                             <div className="bg-white p-2.5 rounded-lg border border-zinc-150 space-y-1.5 shadow-2xs">
                                                <div>
                                                   <span className="font-extrabold text-rose-500">排查原因：</span>
                                                   <span className="font-medium text-zinc-600">继电器 COM 触点未引接电源主干道输出，风机地层端虚接，气流负载无法正常带电冷启动。</span>
                                                </div>
                                                <div>
                                                   <span className="font-extrabold text-zinc-700">工艺标准：</span>
                                                   <span className="font-medium text-zinc-600">电源DC_VCC应连接继电器COM极，将NO常开触点串接至风机VCC电源端，闭环回路。</span>
                                                </div>
                                                <div>
                                                   <span className="font-extrabold text-[#10A66A]">排障建议：</span>
                                                   <span className="font-medium text-zinc-650 font-bold">检测到控制端子掉电，建议执行 Auto-Complete 智能化自动配线，重新打通配电闭环。</span>
                                                </div>
                                             </div>

                                             {/* Mini action Buttons inside detail card */}
                                             <div className="flex gap-1.5 font-bold">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLocateHighlighted(true);
                                                    showToast("已经通过红色高亮在画布标记故障风机连接电路！");
                                                    addLog("[故障排查] 定位故障部件: 风机控制器(0 RPM) 与 继电器(COM) 连接线高亮指示。");
                                                    setTimeout(() => setLocateHighlighted(false), 3000);
                                                  }}
                                                  className="hover:bg-zinc-200 bg-zinc-100 rounded text-[10.5px] py-1 text-zinc-600 transition flex items-center justify-center gap-1 border border-zinc-205 flex-1"
                                                >
                                                   <Eye className="w-3.5 h-3.5 text-[#10A66A]" />
                                                   <span>定位连线</span>
                                                </button>
                                                
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowRepairCard(true);
                                                    showToast("物联星链云诊断导入完毕...已自生成继电通路自闭修复方案");
                                                    addLog("[自愈建议] 针对 relay_fan 双侧 VCC/GND 缺失，已设计补全跳线网络。");
                                                  }}
                                                  className="hover:bg-emerald-100 bg-emerald-50 rounded text-[10.5px] py-1 text-[#10A66A] transition flex items-center justify-center gap-1 border border-[#CFEFE0] flex-1"
                                                >
                                                   <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                                                   <span>生成方案</span>
                                                </button>
                                             </div>

                                             {/* Loading Repair state */}
                                             {showRepairCard && (
                                                <div className="bg-emerald-50 border border-[#CFEFE0] p-2.5 rounded-lg space-y-1.5 animate-in slide-in-from-top duration-300">
                                                   <div className="flex items-center gap-1 font-extrabold text-[#10A66A] text-[10.5px]">
                                                      <Sparkles className="w-3.5 h-3.5 text-[#10A66A] animate-bounce" />
                                                      <span>在线实训自愈修复算法就绪：</span>
                                                   </div>
                                                   <div className="text-[9.5px] text-zinc-500 font-bold leading-normal">
                                                      诊断系统检测到缺失两根配电动力连接。可使用一键自动直连修复，强行闭合。
                                                   </div>
                                                   {!hasRepaired ? (
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          // Call dynamic repair demo
                                                          setRepairAnimationActive(true);
                                                          addLog("[操作] 执行在线一键回路配电补全及公共接地重整。");
                                                          showToast("智能化铜介质自愈布线生成中...");
                                                          setTimeout(() => {
                                                            setHasRepaired(true);
                                                            setRepairAnimationActive(false);
                                                            // Insert logs
                                                            setTerminalLogs(prev => [
                                                              `[INFO] ${new Date().toLocaleTimeString()} 回路智能补全: 已成功闭合 VCC 供电相 及 GND 地层总线。`,
                                                              `[INFO] ${new Date().toLocaleTimeString()} 指示灯点亮。风机成功冷启动，转速反馈: 2400 RPM。`,
                                                              `[INFO] ${new Date().toLocaleTimeString()} 全网连线自检通过。异常清零。`,
                                                              ...prev
                                                            ]);
                                                            // Add new wires to bottom console Wires Tab
                                                            setWires(prev => [
                                                              "智慧布线：继电器(COM) ➔ 电源模块(VCC) [自愈成功]",
                                                              "智慧地线：风机机组(GND) ➔ 系统公共接地 [自愈成功]",
                                                              ...prev
                                                            ]);
                                                            showToast("✨ 一键自动补全连线修复成功！VCC/GND 动力线已敷设重组通电，风机正常运转！");
                                                            addLog("[物联检测] 回路修护动作完成。故障警报消除。检测健康率达 100%。");
                                                          }, 1100);
                                                        }}
                                                        className="w-full bg-[#10A66A] text-white py-1.5 rounded text-[10px] font-black hover:bg-[#0E8F5C] cursor-pointer transition flex items-center justify-center gap-1 shadow-xs"
                                                      >
                                                         {repairAnimationActive ? (
                                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                         ) : (
                                                            <span>一键自愈修复导线 ➔</span>
                                                         )}
                                                      </button>
                                                   ) : (
                                                      <div className="text-[9.5px] text-[#10A66A] font-black flex items-center gap-1 bg-white px-2 py-1.5 rounded-lg border border-emerald-250">
                                                         <span>✓ 配电和地线已补全，设备启动，当前风机在 2400 RPM 下带载运行！</span>
                                                      </div>
                                                   )}
                                                </div>
                                             )}

                                          </div>
                                       )}
                                    </div>

                                 </div>
                              </div>
                           )}

                        </div>
                     )}

                  </div>
                )}

                {rightPanelTab === "cloud" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-3 bg-emerald-50 text-[11px] font-medium text-emerald-850 rounded-lg border border-emerald-200 leading-relaxed">
                       <span className="font-extrabold block mb-0.5">☁ 云平台对接与数字孪生</span>
                       将当前仿真工程中的物理参数与状态设备上报至行业云平台，完成物理数字孪生联动。
                    </div>

                    {/* 状态徽章区 */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-2.5">
                       <div className="flex items-center justify-between">
                          <span className="text-zinc-500 font-bold">云平台状态</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black ${
                             cloudConnectionStatus === "数据上报中" 
                               ? "bg-emerald-100 text-emerald-700 animate-pulse border border-emerald-200" 
                               : cloudConnectionStatus === "已连接"
                                 ? "bg-emerald-50 text-emerald-600 border border-emerald-150"
                                 : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                          }`}>
                             <span className={`w-1.5 h-1.5 rounded-full ${
                                cloudConnectionStatus === "数据上报中" 
                                  ? "bg-emerald-500 animate-ping" 
                                  : cloudConnectionStatus === "已连接"
                                    ? "bg-emerald-400"
                                    : "bg-zinc-400"
                             }`} />
                             {cloudConnectionStatus === "数据上报中" ? "实时上报中" : cloudConnectionStatus}
                          </span>
                       </div>

                       <div className="space-y-1 text-[10.5px] border-t border-dashed border-zinc-250 pt-2 text-zinc-650">
                          <div className="flex justify-between">
                             <span className="text-zinc-400 font-medium">行业网关:</span>
                             <span className="font-bold text-zinc-700 text-right">星链物联网底层平台 (v4.2)</span>
                          </div>
                          <div className="flex justify-between">
                             <span className="text-zinc-400 font-medium">信道协议:</span>
                             <span className="font-mono font-bold text-zinc-700">MQTT over TCP (1883)</span>
                          </div>
                          <div className="flex justify-between">
                             <span className="text-zinc-400 font-medium">同步设备数:</span>
                             <span className="font-bold text-zinc-700">{syncedDevices}/6台</span>
                          </div>
                          <div className="flex justify-between">
                             <span className="text-zinc-400 font-medium">最近上报时间:</span>
                             <span className="font-mono font-bold text-[#10A66A]">{cloudUploadTime}</span>
                          </div>
                       </div>
                    </div>

                    {/* 按钮大矩阵 (三大高级联动控制按钮) */}
                    <div className="space-y-2">
                       <span className="text-[10px] text-zinc-400 font-bold uppercase block tracking-wider">录屏演示控制链路</span>
                       <div className="flex flex-col gap-2">
                          
                          {/* 按钮1: 同步设备到云平台 */}
                          <button
                            type="button"
                            onClick={() => {
                              setSyncedDevices(6);
                              setCloudConnectionStatus("已连接");
                              
                              // 向云日志与通信日志双重追加
                              addCloudRecord("同步设备", "温湿度传感器", "映射设备 (temp01) [已映射已就绪]");
                              addCloudRecord("同步设备", "光照传感器", "映射设备 (light01) [已映射已就绪]");
                              addCloudRecord("同步设备", "二氧化碳传感器", "映射设备 (co201) [已映射已就绪]");
                              addCloudRecord("同步设备", "Modbus网关", "映射网关 (gw01) [通道就绪]");
                              addCloudRecord("同步设备", "继电器", "设备 (relay01) [状态侦听就绪]");
                              addCloudRecord("同步设备", "排风风机", "风机 (fan01) [动力映射就绪]");
                              
                              addLog("[云平台对接] 操作: 同步拓扑仿真设备。已同步 6 台物理芯片级节点到星链行业云平台中。");
                              showToast("设备已同步到云平台！");
                            }}
                            className="w-full bg-[#10A66A] hover:bg-[#0E8F5C] text-white py-2 rounded-lg font-extrabold text-[10.5px] transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            🌐 同步设备到云平台
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            
                            {/* 按钮2: 上报模拟数据 */}
                            <button
                              type="button"
                              onClick={() => {
                                if (syncedDevices < 6) {
                                  showToast("请先点击[同步设备到云平台]！");
                                  return;
                                }
                                setCloudConnectionStatus("数据上报中");
                                
                                // 仿真产生最新数值震荡
                                const nTemp = (24.2 + Math.random() * 2.5).toFixed(1);
                                const nHum = (58.4 + Math.random() * 5.0).toFixed(1);
                                const nLight = Math.floor(410 + Math.random() * 80).toString();
                                const nCo2 = Math.floor(610 + Math.random() * 40).toString();

                                setCloudLatestValues({
                                  temp: nTemp,
                                  hum: nHum,
                                  light: nLight,
                                  co2: nCo2
                                });
                                setTodayReportCount(prev => prev + 2);
                                
                                // 时间刷新
                                const now = new Date();
                                const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                                setCloudUploadTime(timeStr);

                                // 1) 写入云层记录 (CloudRecord)
                                addCloudRecord("设备上报", "温湿度传感器", "报送: 温度 " + nTemp + "℃ | 湿度 " + nHum + "%");
                                addCloudRecord("设备上报", "智能排风风机", "报送: 当前转速 " + (hasRepaired ? '2400' : '0') + " RPM, 接通正常");
                                
                                // 2) 向底部通信消息面板 (messageList) 注入两条真实的 MQTT 上行 JSON
                                const mqttMsg1 = {
                                  id: Date.now().toString() + "-1",
                                  time: timeStr,
                                  source: "Modbus网关",
                                  target: "云平台节点",
                                  protocol: "MQTT",
                                  topicOrAddr: "/greenhouse/data",
                                  direction: "上行",
                                  content: '{"deviceId":"sn-temp-001","temp":' + nTemp + ',"hum":' + nHum + ',"light":' + nLight + ',"co2":' + nCo2 + ',"time":"' + timeStr + '"}',
                                  status: "已发送",
                                  detailText: "设备封装上行遥测 JSON 数据，经由 Modbus 边缘网关并基于 MQTT over TCP 信道打包发布至默认订阅节点。",
                                  resultText: "云平台网关解析校验成功，将数值注入实时数字孪生大盘进行展示。"
                                };
                                const mqttMsg2 = {
                                  id: Date.now().toString() + "-2",
                                  time: timeStr,
                                  source: "风机控制器",
                                  target: "云平台节点",
                                  protocol: "MQTT",
                                  topicOrAddr: "/greenhouse/status",
                                  direction: "上行",
                                  content: '{"deviceId":"load-fan-001","speed":' + (hasRepaired ? '2400' : '0') + ',"volt":220,"status":"running"}',
                                  status: "已发送",
                                  detailText: "执行负载控制器以上行推送状态遥测数据帧，报告动力连线通断及当前运行的RPM转速数值。",
                                  resultText: "云端规则引擎自动识别状态改变，记录动作日志并更新数字孪生模型控制状态。"
                                };

                                setMessageList(prev => [mqttMsg1, mqttMsg2, ...prev]);

                                // 3) 追加操作日志
                                addLog("[云平台记录] 物联网数据上报成功！主题: /greenhouse/data | 载荷: " + nTemp + "℃, " + nHum + "%, " + nLight + "Lux, " + nCo2 + "ppm");
                                
                                showToast("模拟物联网数据已上报云平台！");
                              }}
                              className="bg-white border border-[#10A66A] hover:bg-emerald-50 text-[#10A66A] py-1.5 rounded-lg font-extrabold text-[10px] transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                              🚀 上报模拟数据
                            </button>

                            {/* 按钮3: 查看云平台数据 */}
                            <button
                              type="button"
                              onClick={() => {
                                if (syncedDevices < 6) {
                                  showToast("请先完成物理设备同步！");
                                  return;
                                }
                                setCloudViewMode(true);
                                addLog("[云平台对接] 查看云端孪生视图。成功开启星链云端数字孪生全景监控看板大屏。");
                                showToast("已成功切换至数字孪生看板大屏！");
                              }}
                              className="bg-white border border-indigo-400 hover:bg-slate-50 text-indigo-600 py-1.5 rounded-lg font-extrabold text-[10px] transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                              ⭐ 查看云平台数据
                            </button>
                          </div>
                       </div>
                    </div>

                    {/* 设备列表展现区块 (高度互动的物联网孪生列表) */}
                    <div className="space-y-4 pt-1">
                       <span className="text-[10px] text-zinc-400 font-bold uppercase block tracking-wider">
                         云端设备拓扑映射状态
                       </span>
                       <div className="bg-white border border-zinc-200 rounded-xl p-2.5 space-y-1.5 max-h-[160px] overflow-y-auto font-sans">
                         {syncedDevices === 0 ? (
                           <div className="text-center py-4 text-zinc-400 font-extrabold leading-relaxed text-[10px]">
                             尚未同步拓扑映射设备。<br/>请点击 [🌐 同步设备到云平台] 后激活上报。
                           </div>
                         ) : (
                           <div className="space-y-1.5 divide-y divide-zinc-100 uppercase">
                             
                             <div className="flex items-center justify-between pt-1">
                               <div className="space-y-0.5">
                                 <div className="font-extrabold text-zinc-700 text-[10px] flex items-center gap-1">
                                   🌡️ 温湿度传感器
                                   <span className="text-[8.5px] font-mono text-zinc-400 font-normal">sn-temp-001</span>
                                 </div>
                                 <div className="text-[9.5px] text-[#10A66A] font-bold font-mono">
                                   数据: {cloudLatestValues.temp}℃ / {cloudLatestValues.hum}%
                                 </div>
                               </div>
                               <span className="text-[9.5px] font-black text-[#10A66A] bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100">
                                 <span className="w-1 h-3 rounded-full bg-[#10A66A] inline-block animate-pulse shrink-0" />
                                 在线 ●
                               </span>
                             </div>

                             <div className="flex items-center justify-between pt-1.5">
                               <div className="space-y-0.5">
                                 <div className="font-extrabold text-zinc-700 text-[10px] flex items-center gap-1">
                                   ☀️ 光照传感器
                                   <span className="text-[8.5px] font-mono text-zinc-400 font-normal">sn-light-001</span>
                                 </div>
                                 <div className="text-[9.5px] text-[#10A66A] font-bold font-mono">
                                   数据: {cloudLatestValues.light} Lux
                                 </div>
                               </div>
                               <span className="text-[9.5px] font-black text-[#10A66A] bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100">
                                 <span className="w-1 h-3 rounded-full bg-[#10A66A] inline-block animate-pulse shrink-0" />
                                 在线 ●
                               </span>
                             </div>

                             <div className="flex items-center justify-between pt-1.5">
                               <div className="space-y-0.5">
                                 <div className="font-extrabold text-zinc-700 text-[10px] flex items-center gap-1">
                                   ☘️ 二氧化碳传感器
                                   <span className="text-[8.5px] font-mono text-zinc-400 font-normal">sn-co2-001</span>
                                 </div>
                                 <div className="text-[9.5px] text-[#10A66A] font-bold font-mono">
                                   数据: {cloudLatestValues.co2} ppm
                                 </div>
                               </div>
                               <span className="text-[9.5px] font-black text-[#10A66A] bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100">
                                 <span className="w-1 h-3 rounded-full bg-[#10A66A] inline-block animate-pulse shrink-0" />
                                 在线 ●
                               </span>
                             </div>

                             <div className="flex items-center justify-between pt-1.5">
                               <div className="space-y-0.5">
                                 <div className="font-extrabold text-zinc-700 text-[10px] flex items-center gap-1">
                                   🖥️ Modbus边缘网关
                                   <span className="text-[8.5px] font-mono text-zinc-400 font-normal">gw-modbus-001</span>
                                 </div>
                                 <div className="text-[9px] text-zinc-500 font-bold font-mono">
                                   底座信道: TCP 边缘服务正常
                                 </div>
                               </div>
                               <span className="text-[9.5px] font-black text-[#10A66A] bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100">
                                 <span className="w-1 h-3 rounded-full bg-[#10A66A] inline-block animate-pulse shrink-0" />
                                 在线 ●
                               </span>
                             </div>

                             <div className="flex items-center justify-between pt-1.5">
                               <div className="space-y-0.5">
                                 <div className="font-extrabold text-zinc-700 text-[10px] flex items-center gap-1">
                                   🔌 智能继电器
                                   <span className="text-[8.5px] font-mono text-zinc-400 font-normal">act-relay-001</span>
                                 </div>
                                 <div className="text-[9px] text-zinc-500 font-bold font-mono">
                                   状态: CLOSED [常开端接通]
                                 </div>
                               </div>
                               <span className="text-[9.5px] font-black text-[#10A66A] bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100">
                                 <span className="w-1 h-3 rounded-full bg-[#10A66A] inline-block animate-pulse shrink-0" />
                                 在线 ●
                               </span>
                             </div>

                             <div className="flex items-center justify-between pt-1.5">
                               <div className="space-y-0.5">
                                 <div className="font-extrabold text-zinc-700 text-[10px] flex items-center gap-1">
                                   🌀 末端排风风机
                                   <span className="text-[8.5px] font-mono text-zinc-400 font-normal">load-fan-001</span>
                                 </div>
                                 <div className="text-[9.5px] text-[#10A66A] font-bold font-mono">
                                   功率: {hasRepaired ? "2400 RPM 正常" : "0 RPM (动力断线)"}
                                 </div>
                               </div>
                               <span className="text-[9.5px] font-black text-[#10A66A] bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100">
                                 <span className="w-1 h-3 rounded-full bg-[#10A66A] inline-block shrink-0 animate-pulse" />
                                 在线 ●
                               </span>
                             </div>

                           </div>
                         )}
                       </div>
                    </div>

                    {/* C. 云端大屏缩略看板 (Mini Data Stream Card) */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-[#10A66A] font-bold uppercase block tracking-wider">
                        云端实时孪生数据看板
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-zinc-700 font-sans">
                        
                        <div className="bg-white border border-zinc-200 rounded-lg p-2.5 flex flex-col gap-0.5 shadow-2xs">
                          <span className="text-[9px] font-bold text-zinc-400 block truncate">🌡️ 孪生实时温度</span>
                          <span className="text-[14px] font-mono font-black text-[#10A66A]">{syncedDevices === 6 ? `${cloudLatestValues.temp} ℃` : "──  ℃"}</span>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-lg p-2.5 flex flex-col gap-0.5 shadow-2xs">
                          <span className="text-[9px] font-bold text-zinc-400 block truncate">💧 孪生实时湿度</span>
                          <span className="text-[14px] font-mono font-black text-[#10A66A]">{syncedDevices === 6 ? `${cloudLatestValues.hum} %` : "──  %"}</span>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-lg p-2.5 flex flex-col gap-0.5 shadow-2xs">
                          <span className="text-[9px] font-bold text-zinc-400 block truncate">☀️ 孪生实时光强</span>
                          <span className="text-[14px] font-mono font-black text-[#10A66A]">{syncedDevices === 6 ? `${cloudLatestValues.light} Lux` : "──  Lux"}</span>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-lg p-2.5 flex flex-col gap-0.5 shadow-2xs">
                          <span className="text-[9px] font-bold text-zinc-400 block truncate">☘️ 二氧化碳浓度</span>
                          <span className="text-[14px] font-mono font-black text-[#10A66A]">{syncedDevices === 6 ? `${cloudLatestValues.co2} ppm` : "──  ppm"}</span>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {rightPanelTab === "aiHelper" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* A. 头部宣传与说明 */}
                    <div className="p-3 bg-emerald-50 text-[11px] font-medium text-emerald-850 rounded-lg border border-emerald-200 leading-relaxed shadow-xs">
                       <span className="font-extrabold block mb-0.5 text-emerald-800">✨ AI工程助手</span>
                       输入您的自然语言工程需求，系统将基于离线语义规则自动计算出合适的设备拓扑、通信信道连线关系和联动配置。
                    </div>

                    {/* B. 自然语言创建工程输入区域 */}
                    <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-3 shadow-xs">
                       <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                          <span className="text-[#10A66A] font-extrabold text-[12px] flex items-center gap-1">
                             <Sparkles className="w-4 h-4 text-[#10A66A] animate-pulse animate-bounce" />
                             自然语言创建工程
                          </span>
                          <span className="text-[9px] text-zinc-400 font-bold bg-zinc-100 px-1.5 py-0.5 rounded">
                             语义组网引擎
                          </span>
                       </div>
                       
                       <p className="text-[10px] text-zinc-400 leading-normal">
                          输入工程需求，系统自动生成仿真场景、设备节点、连线关系和工程说明。
                       </p>

                       <div className="space-y-1.5">
                          <label className="text-zinc-500 font-black text-[10px] block">工程需求描述：</label>
                          <textarea
                             value={naturalLanguageInput}
                             onChange={(e) => setNaturalLanguageInput(e.target.value)}
                             placeholder="请输入工程需求，例如：创建一个智慧温室工程，包含温湿度传感器、光照传感器、边缘网关、继电器、风机和云平台。"
                             className="w-full h-24 bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-[10.5px] font-medium focus:bg-white outline-none focus:ring-1 focus:ring-[#10A66A] text-zinc-700 leading-relaxed transition-all resize-none animate-in fade-in-25 duration-100"
                          />
                       </div>

                       {/* 辅助按钮群 */}
                       <div className="flex items-center justify-between pt-1 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                               setNaturalLanguageInput("创建一个智慧温室自动化控制工程，包含温湿度传感器、光照传感器、二氧化碳传感器、Modbus网关、继电器、风机、水泵和云平台，实现环境数据采集、设备联动控制和数据上报。");
                               showToast("已重置为默认智慧温室工程描述");
                               addLog("[AI工程助手] 已重置为默认智慧温室工程描述");
                            }}
                            className="bg-zinc-50 hover:bg-zinc-100 text-zinc-500 border border-zinc-200 py-1 px-2.5 rounded font-bold text-[10px] transition cursor-pointer"
                          >
                             使用示例需求
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                               setNaturalLanguageInput("");
                               showToast("输入框已清空");
                            }}
                            className="bg-white hover:bg-zinc-50 text-zinc-400 border border-zinc-200 py-1 px-2.5 rounded font-bold text-[10px] transition cursor-pointer"
                          >
                             清空内容
                          </button>
                       </div>

                       {/* C. 快捷需求模板 (快捷按钮) */}
                       <div className="space-y-1.5 pt-1.5">
                          <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-widest block">快捷需求模板：</span>
                          <div id="ai-quick-templates" className="grid grid-cols-2 gap-1.5">
                             <button
                                type="button"
                                onClick={() => {
                                   setNaturalLanguageInput("创建一个智慧温室工程，包含温湿度传感器、光照传感器、二氧化碳传感器、Modbus网关、继电器、风机、水泵和云平台，实现环境采集、风机控制、水泵控制和数据上报。");
                                   showToast("已选择：智慧温室环境监测工程模板");
                                   addLog("[AI工程助手] 载入快捷模板：智慧温室环境监测工程");
                                }}
                                className="p-1.5 bg-emerald-50 text-emerald-800 text-[9.5px] font-bold border border-emerald-150 rounded text-left hover:bg-emerald-100/50 transition truncate cursor-pointer"
                             >
                                🌿 智慧温室环境监测
                             </button>
                             <button
                                type="button"
                                onClick={() => {
                                   setNaturalLanguageInput("创建一个智慧牧场工程，包含温湿度传感器、氨气传感器、摄像头、边缘网关、风机和云平台，实现棚舍环境监测和风机联动控制。");
                                   showToast("已选择：智慧牧场环境采集工程模板");
                                   addLog("[AI工程助手] 载入快捷模板：智慧牧场环境采集工程");
                                }}
                                className="p-1.5 bg-amber-50 text-amber-800 text-[9.5px] font-bold border border-amber-150 rounded text-left hover:bg-amber-100/50 transition truncate cursor-pointer"
                             >
                                🐑 智慧牧场环境采集
                             </button>
                             <button
                                type="button"
                                onClick={() => {
                                   setNaturalLanguageInput("创建一个智慧家居工程，包含人体传感器、门磁传感器、智能灯光、继电器、家庭网关和云平台，实现安防监测和灯光联动控制。");
                                   showToast("已选择：智慧家居联动控制工程模板");
                                   addLog("[AI工程助手] 载入快捷模板：智慧家居联动控制工程");
                                }}
                                className="p-1.5 bg-cyan-50 text-cyan-800 text-[9.5px] font-bold border border-cyan-150 rounded text-left hover:bg-cyan-100/50 transition truncate cursor-pointer"
                             >
                                🏠 智慧家居联动控制
                             </button>
                             <button
                                type="button"
                                onClick={() => {
                                   setNaturalLanguageInput("创建一个智慧矿山工程，包含甲烷传感器、粉尘传感器、定位终端、报警器、工业网关和云平台，实现矿山安全监测和异常报警。");
                                   showToast("已选择：智慧矿山安全监测工程模板");
                                   addLog("[AI工程助手] 载入快捷模板：智慧矿山安全监测工程");
                                }}
                                className="p-1.5 bg-rose-50 text-rose-800 text-[9.5px] font-bold border border-rose-150 rounded text-left hover:bg-rose-100/50 transition truncate cursor-pointer"
                             >
                                ⛏️ 智慧矿山安全监测
                             </button>
                          </div>
                       </div>

                       {/* 生成工程大按钮 */}
                       <button
                          type="button"
                          onClick={() => {
                             const text = naturalLanguageInput;
                             let projName = "通用物联网物理采集仿真工程";
                             let scene = "通用物联";
                             let objective = "根据工程自然语言描述提取，实现对应设备的仿真和拓扑分析。";
                             let devices: string[] = [];
                             let connections: Array<{ from: string; to: string }> = [];
                             let suggestions: Array<{ from: string; to: string }> = [];
                             
                             if (text.includes("智慧温室") || text.includes("温室")) {
                                projName = "智慧温室自动化控制工程";
                                scene = "智慧温室";
                                objective = "实现温湿度、光照、二氧化碳等环境数据采集，并通过 Modbus网关上报云平台，同时支持继电器控制风机和水泵。";
                                devices = ["温湿度传感器", "光照传感器", "二氧化碳传感器", "Modbus网关", "继电器", "风机", "水泵", "云平台节点"];
                                connections = [
                                   { from: "温湿度传感器 DATA", to: "Modbus网关 DI1" },
                                   { from: "光照传感器 AO", to: "Modbus网关 AI1" },
                                   { from: "二氧化碳传感器 DATA", to: "Modbus网关 DI2" },
                                   { from: "Modbus网关 MQTT", to: "云平台节点 Topic" },
                                   { from: "继电器 OUT1", to: "风机 IN" },
                                   { from: "继电器 OUT2", to: "水泵 IN" }
                                ];
                                suggestions = [
                                   { from: "电源模块 VCC", to: "风机 VCC" },
                                   { from: "电源模块 GND", to: "风机 GND" },
                                   { from: "电源模块 VCC", to: "水泵 VCC" },
                                   { from: "电源模块 GND", to: "水泵 GND" }
                                ];
                             } else if (text.includes("智慧牧场") || text.includes("牧场")) {
                                projName = "智慧牧场环境采集工程";
                                scene = "智慧牧场";
                                objective = "完成高密度棚舍里的氨气、温湿度采集记录，自动触发舍内外排风机，并上报全幅监控画面。";
                                devices = ["温湿度传感器", "氨气传感器", "摄像头", "边缘网关", "继电器", "风机", "云平台节点"];
                                connections = [
                                   { from: "温湿度传感器 DATA", to: "Modbus网关 DI1" },
                                   { from: "氨气传感器 DATA", to: "Modbus网关 DI2" },
                                   { from: "摄像头 VIDEO", to: "Modbus网关 AI1" },
                                   { from: "Modbus网关 MQTT", to: "云平台节点 Topic" },
                                   { from: "继电器 OUT1", to: "风机 IN" }
                                ];
                                suggestions = [
                                   { from: "电源模块 VCC", to: "风机 VCC" },
                                   { from: "电源模块 GND", to: "风机 GND" }
                                ];
                             } else if (text.includes("智慧家居") || text.includes("家居")) {
                                projName = "智慧家居联动控制工程";
                                scene = "智慧家居";
                                objective = "构建智能物联家庭，集成红外门磁以及智能照明，打造自动节能灯联动及防护状态云上报。";
                                devices = ["人体传感器", "门磁传感器", "智能灯光", "继电器", "家庭网关", "云平台节点"];
                                connections = [
                                   { from: "人体传感器 OUT1", to: "Modbus网关 DI1" },
                                   { from: "门磁传感器 DATA", to: "Modbus网关 DI2" },
                                   { from: "Modbus网关 MQTT", to: "云平台节点 Topic" },
                                   { from: "继电器 OUT1", to: "智能灯光 IN" }
                                ];
                                suggestions = [
                                   { from: "电源模块 VCC", to: "智能灯光 VCC" },
                                   { from: "电源模块 GND", to: "智能灯光 GND" }
                                ];
                             } else if (text.includes("智慧矿山") || text.includes("矿山")) {
                                projName = "智慧矿山安全监测工程";
                                scene = "智慧矿山";
                                objective = "全幅监测矿山下的粉尘瓦斯情况，并自动匹配现场工业级报警喇叭，保障工矿运行。";
                                devices = ["甲烷传感器", "粉尘传感器", "定位终端", "工业网关", "报警器", "云平台节点"];
                                connections = [
                                   { from: "甲烷传感器 DATA", to: "Modbus网关 DI1" },
                                   { from: "粉尘传感器 DATA", to: "Modbus网关 DI2" },
                                   { from: "定位终端 GPS", to: "Modbus网关 DI3" },
                                   { from: "Modbus网关 MQTT", to: "云平台节点 Topic" },
                                   { from: "Modbus网关 ALARM", to: "报警器 IN" }
                                ];
                                suggestions = [
                                   { from: "电源模块 VCC", to: "报警器 VCC" },
                                   { from: "电源模块 GND", to: "报警器 GND" }
                                ];
                             } else {
                                projName = "通用物联网物理采集仿真工程";
                                scene = "通用物联";
                                objective = "匹配默认物联组件设备。设备通过行业底层网关打包汇合，并通过MQTT通道实时同步给物联网云平台大盘终端。";
                                devices = ["温湿度传感器", "光照传感器", "Modbus网关", "继电器", "风机", "云平台节点"];
                                connections = [
                                   { from: "温湿度传感器 DATA", to: "Modbus网关 DI1" },
                                   { from: "光照传感器 AO", to: "Modbus网关 AI1" },
                                   { from: "Modbus网关 MQTT", to: "云平台节点 Topic" },
                                   { from: "继电器 OUT1", to: "风机 IN" }
                                ];
                                suggestions = [
                                   { from: "电源模块 VCC", to: "风机 VCC" },
                                   { from: "电源模块 GND", to: "风机 GND" }
                                ];
                             }

                             setGeneratedProject({
                                name: projName,
                                scene: scene,
                                objective: objective,
                                status: "已完成"
                             });
                             setGeneratedDevices(devices);
                             setGeneratedConnections(connections);
                             setGeneratedSuggestions(suggestions);

                             const logs = [
                               `10:50:01｜输入自然语言需求`,
                               `10:50:03｜识别场景：${scene}`,
                               `10:50:04｜匹配设备：${devices.join("、")}`,
                               `10:50:05｜生成基础连线 ${connections.length} 条`,
                               `10:50:06｜生成供电连线建议 ${suggestions.length} 条`,
                               `10:50:07｜仿真工程创建完成`
                             ];
                             setOperationLogs(logs);

                             logs.forEach(l => {
                                addLog(`[AI组网] ${l}`);
                             });

                             // Also reflect dynamically in central canvas
                             setCanvasDevices([...devices, "电源模块"]);
                             setCanvasConnections(connections);

                             showToast("✨ AI仿真工程自动组网成功！您可以点击下方按钮更新画布");
                          }}
                          className="w-full bg-[#10A66A] hover:bg-emerald-600 text-white py-2 rounded-lg font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                       >
                          🚀 生成仿真工程
                       </button>
                    </div>

                    {/* D. 生成结果展示卡片 */}
                    {generatedProject && (
                       <div className="bg-[#FAFBFB] border border-zinc-200 rounded-xl p-3.5 space-y-3.5 shadow-xs font-sans">
                          <div className="flex items-center justify-between border-b border-zinc-150 pb-2">
                             <span className="font-extrabold text-[11.5px] text-zinc-750 flex items-center gap-1">
                                <span className="inline-block w-2- h-2 w-2.5 h-2.5 rounded-full bg-[#10A66A] animate-pulse shrink-0" />
                                已生成仿真工程
                             </span>
                             <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[8.5px] font-black rounded uppercase tracking-wider border border-emerald-150">
                                状态: {generatedProject.status}
                             </span>
                          </div>

                          <div className="space-y-2 text-[10.5px]">
                             <div className="flex justify-between items-start gap-1">
                                <span className="text-zinc-400 font-bold shrink-0">工程名称：</span>
                                <span className="font-extrabold text-[#10A66A] text-right text-[11px] font-sans">{generatedProject.name}</span>
                             </div>

                             <div className="flex justify-between items-center">
                                <span className="text-zinc-400 font-bold">行业场景：</span>
                                <span className="font-bold text-zinc-700 font-sans">{generatedProject.scene}</span>
                             </div>

                             <div className="bg-white p-2 rounded border border-zinc-150 space-y-1">
                                <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider">工程核心目标</span>
                                <p className="text-zinc-600 leading-relaxed text-[10px] font-medium">{generatedProject.objective}</p>
                             </div>

                             {/* 自动添加设备列表 */}
                             <div className="space-y-1 bg-white p-2.5 rounded border border-zinc-150">
                                <div className="text-[10px] text-zinc-550 font-black flex items-center gap-1 border-b border-zinc-100 pb-1">
                                   <span className="w-1 h-3 rounded bg-[#10A66A]" />
                                   自动添加设备 ({generatedDevices.length} 台)
                                </div>
                                <ul className="space-y-1 pt-1.5 pl-1">
                                   {generatedDevices.map((dev, i) => (
                                      <li key={i} className="text-zinc-650 font-bold text-[10px] flex items-center gap-1.5">
                                         <span className="text-[#10A66A] font-extrabold text-[9px]">{i+1}.</span>
                                         {dev}
                                      </li>
                                   ))}
                                </ul>
                             </div>

                             {/* 自动生成连线 */}
                             <div className="space-y-1 bg-white p-2.5 rounded border border-zinc-150">
                                <div className="text-[10px] text-zinc-555 font-black flex items-center gap-1 border-b border-zinc-100 pb-1">
                                   <span className="w-1 h-3 rounded bg-emerald-500" />
                                   自动生成连线 ({generatedConnections.length} 条)
                                </div>
                                <ul className="space-y-1.5 pt-2 font-mono text-[9.5px]">
                                   {generatedConnections.map((conn, i) => (
                                      <li key={i} className="text-zinc-650 flex items-center justify-between bg-zinc-55 border bg-zinc-50/50 p-1 rounded border-zinc-150">
                                         <span className="font-bold text-[#10A66A] text-[9px]">{conn.from}</span>
                                         <span className="text-zinc-400 px-0.5 text-[8.5px]">──►</span>
                                         <span className="font-bold text-zinc-700 text-[9px]">{conn.to}</span>
                                      </li>
                                   ))}
                                </ul>
                             </div>

                             {/* 建议补充连线 */}
                             <div className="space-y-1 bg-white p-2.5 rounded border border-zinc-150">
                                <div className="text-[10px] text-zinc-555 font-black flex items-center gap-1 border-b border-zinc-100 pb-1">
                                   <span className="w-1 h-3 rounded bg-amber-450 bg-amber-500" />
                                   建议补充连线 ({generatedSuggestions.length} 条)
                                </div>
                                <ul className="space-y-1 pt-1.5 pl-1 text-[9.5px] font-mono">
                                   {generatedSuggestions.map((conn, i) => (
                                      <li key={i} className="text-zinc-500 flex items-center gap-1">
                                         <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                                         <span className="text-zinc-600 text-[9px]">{conn.from}</span>
                                         <span className="text-zinc-400 text-[8px] font-sans">──►</span>
                                         <span className="text-zinc-500 font-bold text-[9px]">{conn.to}</span>
                                         <span className="text-[8.5px] text-amber-600 bg-amber-50 px-1 font-sans font-bold border border-amber-100/50 rounded shrink-0 scale-90 origin-left">建议供电</span>
                                      </li>
                                   ))}
                                </ul>
                             </div>
                          </div>

                          {/* 操作动作按钮 */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-150">
                             <button
                                type="button"
                                onClick={() => {
                                   setActiveProjectMode("ai");
                                   // Change current state
                                   setCanvasDevices([...generatedDevices, "电源模块"]);
                                   setCanvasConnections(generatedConnections);
                                   showToast("🎉 已将自然语言生成结果应用到物理组网仿真画布！");
                                   addLog("[AI工程助手] 已将自然语言生成结果应用到画布。");
                                }}
                                className="bg-[#10A66A] hover:bg-emerald-600 text-white font-black py-1.5 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                             >
                                应用到画布
                             </button>

                             <button
                                type="button"
                                onClick={() => {
                                   setActiveProjectMode("ai");
                                   showToast("🔄 已重做生成并刷新当前自然语言大盘设备！");
                                   addLog("[AI工程助手] 已重新生成仿真工程。");
                                }}
                                className="bg-white border border-[#10A66A] hover:bg-emerald-50 text-[#10A66A] font-black py-1.5 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                             >
                                重新生成
                             </button>
                          </div>

                          <div className="pt-1 select-none">
                             <button
                                type="button"
                                onClick={() => {
                                   setShowExplanation(!showExplanation);
                                   showToast(showExplanation ? "已收起工程说明" : "已展开工程说明");
                                }}
                                className="w-full bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50 py-1 rounded font-bold text-[9.5px] text-center flex items-center justify-center gap-1 cursor-pointer transition-all"
                             >
                                <span>{showExplanation ? "📖 收起工程说明" : "📖 查看工程说明"}</span>
                             </button>
                          </div>
                       </div>
                    )}

                    {/* E. 工程说明大卡片 */}
                    {showExplanation && generatedProject && (
                       <div className="bg-white border border-zinc-250 rounded-xl p-3.5 space-y-2.5 shadow-xs animate-in slide-in-from-bottom duration-250">
                          <span className="text-[11px] text-[#10A66A] font-black uppercase tracking-wider block border-b border-zinc-100 pb-1">
                             📖 工程说明
                          </span>
                          <p className="text-[10.5px] text-zinc-600 leading-relaxed text-justify">
                             本工程基于<strong className="text-[#10A66A] font-black font-sans bg-emerald-50 px-1 mx-0.5 rounded border border-emerald-100/50">{generatedProject.scene}</strong>场景创建，主要实现环境数据采集、设备联动控制和数据上报。
                             {generatedProject.scene === "智慧温室" ? (
                               "温湿度传感器、光照传感器、二氧化碳传感器负责采集环境数据，Modbus网关负责汇聚数据并通过 MQTT 上报云平台。继电器用于控制风机和水泵，实现温室通风和灌溉控制。"
                             ) : (
                               "系统匹配的最佳工程节点协同运行。通过物联网智能总线数据融合上报以及本地边缘继电器触发。不仅提高了生产监控及时性，还能极大幅度的减少人工巡查损耗，确保智能化运行效率。"
                             )}
                          </p>
                          <p className="text-[10px] text-zinc-400 italic leading-relaxed border-t border-dashed border-zinc-200 pt-1.5">
                             系统已根据自然语言需求自动识别场景、匹配设备、生成基础连线，并给出需要补充的供电连线建议。
                          </p>
                       </div>
                    )}
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

      {/* 通信异常详情高品质框 */}
      {activeAnomalyDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            {/* 顶栏头部 */}
            <div className="flex items-center justify-between border-b border-rose-50 pb-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-rose-800">通信设备报文异常详情</h4>
                  <p className="text-[10px] text-zinc-400 font-medium">设备节点通信异常监控器反馈</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveAnomalyDetail(null)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 详细参数展示 */}
            <div className="space-y-2 text-[10.5px]">
              <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-150 font-bold leading-tight">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 font-medium">通信设备:</span>
                    <span className="text-zinc-800">{activeAnomalyDetail.source}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 font-medium">目标/网关:</span>
                    <span className="text-zinc-800">{activeAnomalyDetail.target}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 font-medium">通信协议:</span>
                    <span className="text-zinc-800 font-mono text-[9.5px] bg-zinc-150 px-1 py-0.1 rounded border border-zinc-200">{activeAnomalyDetail.protocol}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 font-medium">Topic/地址:</span>
                    <span className="text-[#10A66A] font-mono">{activeAnomalyDetail.topicOrAddr}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 font-medium">生成时间:</span>
                    <span className="text-zinc-600 font-mono">{activeAnomalyDetail.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 font-medium">传输方向:</span>
                    <span className="text-zinc-600">{activeAnomalyDetail.direction === "tx" || activeAnomalyDetail.direction === "下行" ? "下行 (TX)" : "上行 (RX)"}</span>
                  </div>
                </div>
              </div>

              {/* 异常载荷 HEX/JSON 内容 */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">载荷详情 / Contents</span>
                <div className="bg-zinc-950 border border-zinc-850 text-rose-400 font-mono text-[9px] p-2.5 rounded-lg break-all font-black text-center select-all tracking-wider leading-relaxed shadow-inner">
                  {activeAnomalyDetail.content}
                </div>
              </div>

              {/* 异常危害原因 */}
              <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-3 text-[10px] leading-relaxed space-y-1">
                <div className="flex items-center gap-1 font-extrabold text-rose-800">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>报文异常成因:</span>
                </div>
                <p className="text-rose-700 font-semibold pl-4.5">{activeAnomalyDetail.errorReason || "暂无捕获解析状态"}</p>
              </div>

              {/* 专家修复建议 */}
              <div className="bg-[#EAF8F1]/40 border border-emerald-100 rounded-lg p-3 text-[10px] leading-relaxed space-y-1">
                <div className="flex items-center gap-1 font-extrabold text-[#10A66A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10A66A] shrink-0" />
                  <span>推荐排错及修复建议:</span>
                </div>
                <p className="text-emerald-800 font-semibold pl-4.5">{activeAnomalyDetail.advice || "暂无捕获解析状态"}</p>
              </div>
            </div>

            {/* 功能操作操作按钮 */}
            <div className="flex items-center gap-2 justify-end pt-2 border-t border-zinc-100 select-none">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(activeAnomalyDetail.content);
                  const now = new Date();
                  const logTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                  addLog(`${logTime}｜复制原始消息文本到剪切板`);
                  showToast("已成功复制异常原始消息文本");
                }}
                className="h-8 px-3 bg-zinc-100 border border-zinc-200 text-zinc-650 font-bold hover:bg-zinc-200 transition text-[11px] rounded flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                <span>复制消息</span>
              </button>
              
              <button 
                onClick={() => {
                  setSelectedNode(activeAnomalyDetail.source);
                  setHighlightedNodes([activeAnomalyDetail.source]);
                  setTimeout(() => setHighlightedNodes([]), 1500);
                  
                  const now = new Date();
                  const logTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                  addLog(`${logTime}｜定位闪烁异常通信设备所在拓扑位置`);
                  showToast(`正在定位并闪烁：${activeAnomalyDetail.source}`);
                  setActiveAnomalyDetail(null);
                }}
                className="h-8 px-3 bg-rose-50 border border-rose-200 text-rose-700 font-black hover:bg-rose-100 transition text-[11px] rounded flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>定位设备</span>
              </button>

              <button 
                onClick={() => setActiveAnomalyDetail(null)}
                className="h-8 px-4 bg-[#10A66A] hover:bg-emerald-600 text-white font-black text-[11px] rounded cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
