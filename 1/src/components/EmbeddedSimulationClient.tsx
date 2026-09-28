import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Monitor,
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
  Send,
  Camera,
  RotateCcw,
  Power,
  Maximize2,
  Minimize2,
  Settings,
  Cpu,
  Trash2,
  PlayCircle,
  Pause,
  StopCircle,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  RefreshCw,
  Plus,
  Tv,
  CheckCircle,
  Terminal as TerminalIcon,
  BookOpen,
  ArrowRight,
  Workflow
} from "lucide-react";

interface EmbeddedModule {
  id: string;
  name: string;
  category: string;
  interfaceType: string;
  pinCount?: number;
  voltage?: string;
  desc: string;
  color?: string;
}

// 静态的 32 种全量模块库
const ALL_EMBEDDED_MODULES: EmbeddedModule[] = [
  // 1. 主控芯片
  { id: "stm32f407", name: "STM32F407", category: "主控芯片", interfaceType: "LQFP", pinCount: 100, voltage: "3.3V", desc: "基于ARM Cortex-M4内核的高性能微控制器，主频高达168MHz，带DSP和FPU指令集。", color: "border-sky-500 bg-sky-50" },
  { id: "stm32f103", name: "STM32F103", category: "主控芯片", interfaceType: "LQFP", pinCount: 64, voltage: "3.3V", desc: "主打经典实用的ARM Cortex-M3内核微控制器，主频72MHz，适合各种基础型控制场景。", color: "border-cyan-500 bg-cyan-50" },

  // 2. 传感器
  { id: "pir", name: "人体红外传感器", category: "传感器", interfaceType: "GPIO", pinCount: 3, voltage: "3.3V/5V", desc: "检测人体或热释电辐射信号。有人靠近时GPIO引脚自动输出高电平。", color: "border-amber-500 bg-amber-50" },
  { id: "photoresistor", name: "光敏传感器", category: "传感器", interfaceType: "ADC", pinCount: 4, voltage: "3.3V", desc: "感知环境光照变化的模拟量。通过ADC通道传输阻值电压实现照度感知。", color: "border-amber-500 bg-amber-50" },
  { id: "mq2", name: "可燃气体传感器", category: "传感器", interfaceType: "ADC", pinCount: 4, voltage: "5V", desc: "气体探测敏感元件，当存在甲烷、液化气时，其电导率阻值随浓度模拟降低。", color: "border-amber-500 bg-amber-50" },
  { id: "dht11", name: "温湿度传感器", category: "传感器", interfaceType: "GPIO / I2C", pinCount: 4, voltage: "3.3V", desc: "包含电阻式测湿元件和NTC测温器件，向单片机单线发送2个字节温湿度采样数。", color: "border-amber-500 bg-amber-50" },
  { id: "flame", name: "火焰传感器", category: "传感器", interfaceType: "GPIO", pinCount: 3, voltage: "3.3V", desc: "对波长在 760 纳米至 1100 纳米范围内的外界明火红外光极其敏感的传感器。", color: "border-amber-500 bg-amber-50" },
  { id: "mpu6050", name: "三轴传感器", category: "传感器", interfaceType: "I2C", pinCount: 6, voltage: "3.3V", desc: "集成3轴陀螺仪和3轴加速度计的高精密机械姿态惯性测量模块卡片。", color: "border-amber-500 bg-amber-50" },
  { id: "bmp280", name: "大气压强传感器", category: "传感器", interfaceType: "I2C", pinCount: 4, voltage: "3.3V", desc: "高精度数字气压计，支持I2C/SPI通信，可实时解算局部气压值及气压海拔高度。", color: "border-amber-500 bg-amber-50" },
  { id: "buzzer", name: "蜂鸣器传感器", category: "传感器", interfaceType: "PWM", pinCount: 3, voltage: "3.3V/5V", desc: "基于多谐振荡器或PWM周期驱动的蜂鸣器，可通过调节分频占空比发生变调。", color: "border-amber-500 bg-amber-50" },
  { id: "hx711", name: "称重传感器", category: "传感器", interfaceType: "GPIO", pinCount: 4, voltage: "5V", desc: "高精度阻变式称重放大及24位差分ADC通信转换器，常用与地磅及微克微秤计量。", color: "border-amber-500 bg-amber-50" },
  { id: "soild_moisture", name: "湿度传感器", category: "传感器", interfaceType: "ADC", pinCount: 3, voltage: "3.3V", desc: "插入土壤土壤含水量探测板，通过双电极探头电阻在ADC通道输入模拟电平。", color: "border-amber-500 bg-amber-50" },
  { id: "bh1750", name: "光照度传感器", category: "传感器", interfaceType: "I2C", pinCount: 5, voltage: "3.3V", desc: "两线式数字型照度强度传感，输出字节数字可线性映射得出勒克斯(Lux)数值。", color: "border-amber-500 bg-amber-50" },
  { id: "rtc_clock", name: "RTC", category: "传感器", interfaceType: "I2C", pinCount: 4, voltage: "3.3V", desc: "外置精密RTC硬件时钟片，通过独立的纽扣电池供电，掉电仍能维持流式日历。", color: "border-amber-500 bg-amber-50" },
  { id: "piezo_vibration", name: "压电传感器", category: "传感器", interfaceType: "ADC", pinCount: 2, voltage: "3.3V", desc: "基于压电陶瓷的反向电荷原理，检测画布上的微震、机械碰撞振幅变化。", color: "border-amber-500 bg-amber-50" },
  { id: "ir_reflect", name: "红外反射传感器", category: "传感器", interfaceType: "GPIO", pinCount: 3, voltage: "3.3V", desc: "向前方发射红外线并吸收反射波段。高电平判定前方是否存在漫反射平面。", color: "border-amber-500 bg-amber-50" },
  { id: "ir_barrier", name: "红外对射传感器", category: "传感器", interfaceType: "GPIO", pinCount: 4, voltage: "3.3V", desc: "槽型红外遮挡识别栅栏，提供对射光阻断状态回传，常用于测速和安全定位。", color: "border-amber-500 bg-amber-50" },

  // 3. 显示器
  { id: "oled", name: "OLED显示器", category: "显示器", interfaceType: "I2C", pinCount: 4, voltage: "3.3V", desc: "0.96英寸SSD1306液晶点阵液晶，128x64像素极高对比度的单色显示窗口。", color: "border-purple-500 bg-purple-50" },
  { id: "segment_led", name: "数码管", category: "显示器", interfaceType: "GPIO", pinCount: 10, voltage: "5V", desc: "4位共阳极共阴扫描LED数码面板，用于简易的温湿度数据与时钟倒计时呈现。", color: "border-purple-500 bg-purple-50" },
  { id: "led_light", name: "LED", category: "显示器", interfaceType: "GPIO", pinCount: 2, voltage: "3.3V", desc: "单发光半导体发光极，高电平点亮，经典的板载指示信号等。", color: "border-purple-500 bg-purple-50" },
  { id: "breath_led", name: "呼吸灯", category: "显示器", interfaceType: "PWM", pinCount: 2, voltage: "3.3V", desc: "支持通过PWM周期级动态控制电流输出以自适应出人类呼吸节奏连续渐明亮灭。", color: "border-purple-500 bg-purple-50" },
  { id: "run_led", name: "流水灯", category: "显示器", interfaceType: "GPIO", pinCount: 8, voltage: "3.3V", desc: "8路并联排列的高密度微LED灯盘，直接连入一整组GPIO并行总线实现灯态位移。", color: "border-purple-500 bg-purple-50" },

  // 4. 总线接口
  { id: "can_bus", name: "CAN总线接口", category: "总线接口", interfaceType: "CAN", pinCount: 4, voltage: "5V", desc: "支持CAN2.0B标准，常用于汽车、工程装配和具有高电磁反射场景现场控制。", color: "border-indigo-500 bg-indigo-50" },
  { id: "rs485_bus", name: "RS485总线接口", category: "总线接口", interfaceType: "RS485", pinCount: 4, voltage: "5V", desc: "采用差分双线差态物理阻断，高容错率。最多可挂载128个端点寻址机制设备。", color: "border-indigo-500 bg-indigo-50" },

  // 5. 调试助手
  { id: "uart_helper", name: "串口调试助手", category: "调试助手", interfaceType: "UART", pinCount: 4, voltage: "3.3V", desc: "虚拟上位机串口接收面板，捕获自TX/RX输出口。支持图形波形打印与双向配置。", color: "border-rose-500 bg-rose-50" },

  // 6. 按键输入
  { id: "matrix_keyboard", name: "矩阵键盘", category: "按键输入", interfaceType: "GPIO", pinCount: 8, voltage: "3.3V", desc: "4行4列16个交叉扫频物理按键，采用交叉状态移位扫描节省单片机引脚占用。", color: "border-emerald-500 bg-emerald-50" },
  { id: "lock_switch", name: "按键开关", category: "按键输入", interfaceType: "GPIO", pinCount: 3, voltage: "3.3V", desc: "具有自锁闭和咔哒触感的物理拨码式开关，主要作为整机电源总闸切入口。", color: "border-emerald-500 bg-emerald-50" },
  { id: "micro_button", name: "按钮", category: "按键输入", interfaceType: "GPIO", pinCount: 2, voltage: "3.3V", desc: "轻微复位按钮，按下闭合电平，弹开处于拉高拉低。用于轻量模式变换。", color: "border-emerald-500 bg-emerald-50" },

  // 7. VCC/GND
  { id: "vcc_power", name: "VCC", category: "VCC/GND", interfaceType: "Power", pinCount: 1, voltage: "3.3V/5V", desc: "直流稳压参考电源，多采用标准微红导线，输出正高电平拉高物理设备源点。", color: "border-red-500 bg-red-50" },
  { id: "gnd_ground", name: "GND", category: "VCC/GND", interfaceType: "Power", pinCount: 1, voltage: "0V", desc: "电气公共参考地端点，通常绘制为黑灰导线物理极柱，用于流体力闭合。", color: "border-zinc-500 bg-zinc-50" }
];

interface CanvasNodeInstance {
  id: string;
  templateId: string;
  name: string;
  category: string;
  interfaceType: string;
  pinCount: number;
  voltage: string;
  desc: string;
  x: number;
  y: number;
  color?: string;
  connectionStatus: string;
  powerStatus: string;
}

interface CanvasWiring {
  id: string;
  fromNodeId: string;
  fromPin: string;
  toNodeId: string;
  toPin: string;
  color: string;
}

export default function EmbeddedSimulationClient({
  onClose,
  showToast
}: {
  onClose: () => void;
  showToast: (msg: string) => void;
}) {
  // 左侧导航栏选项："intro" | "guide" | "course" (默认 "guide" 操作手册)
  const [selectedNavTab, setSelectedNavTab] = useState<string>("guide");

  // 全屏状态
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 折叠分类列表，默认全部展开
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "主控芯片", "传感器", "显示器", "总线接口", "调试助手", "按键输入", "VCC/GND"
  ]);

  // 模块列表中搜索框状态
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // 仿真运行状态
  const [runStatus, setRunStatus] = useState<"运行中" | "已暂停" | "已停止">("运行中");

  // 操作日志
  const [logs, setLogs] = useState<string[]>([
    "[10:20:00] 系统启动: 虚拟仿真环境基线初始化完成。",
    "[10:20:02] 加载工程: 星链 Renode 底座容器组挂载完毕。",
    "[10:20:05] 默认就绪: 调试助手成功嗅探到串口 /dev/ttyS0，开始监视 30000 端口。"
  ]);

  // 运行时间
  const [sessionTime, setSessionTime] = useState<number>(104);

  // 串口终端输出
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "=========================================",
    "  Embedded Renode Emulator Engine v3.1   ",
    "  Smart Education Virtual IoT Terminal  ",
    "=========================================",
    "[System OK] Microcontroller layer initialized.",
    "[SSH Core] Connect to emulator node standard SSH shell.",
    "[Port Listen] Docker port range 30000-30100 is open in background.",
    "GuestOS-STM32:/# sys_status --detailed",
    "Current active UART: CONSOLE1 (BaudRate: 115200)",
    "Available ADC references: 2 (CH1: Light, CH2: GAS Oxide)",
    "GPIO Mapping layout verified.",
    "GuestOS-STM32:/# _"
  ]);
  const [terminalInput, setTerminalInput] = useState<string>("");

  // 默认加载 6 类主要设备
  const [canvasNodes, setCanvasNodes] = useState<CanvasNodeInstance[]>([
    {
      id: "node-mcu",
      templateId: "stm32f103",
      name: "STM32F103",
      category: "主控芯片",
      interfaceType: "LQFP",
      pinCount: 64,
      voltage: "3.3V",
      desc: "主打经典实用的ARM Cortex-M3内核微控制器，主频72MHz，用来桥接传感器。",
      x: 310,
      y: 90,
      connectionStatus: "已连接",
      powerStatus: "工作正常"
    },
    {
      id: "node-oled",
      templateId: "oled",
      name: "OLED显示器",
      category: "显示器",
      interfaceType: "I2C",
      pinCount: 4,
      voltage: "3.3V",
      desc: "SSD1306 0.96寸 I2C接口点阵液晶，128x64像素显示屏。",
      x: 580,
      y: 70,
      connectionStatus: "已连接",
      powerStatus: "工作正常"
    },
    {
      id: "node-led",
      templateId: "led_light",
      name: "LED",
      category: "显示器",
      interfaceType: "GPIO",
      pinCount: 2,
      voltage: "3.3V",
      desc: "单路发光二极管，高电平点亮。",
      x: 580,
      y: 220,
      connectionStatus: "已连接",
      powerStatus: "正常工作"
    },
    {
      id: "node-dht",
      templateId: "dht11",
      name: "温湿度传感器",
      category: "传感器",
      interfaceType: "GPIO / I2C",
      pinCount: 4,
      voltage: "3.3V",
      desc: "包含电阻式测湿元件和NTC测温器件，数字单线或I2C协议。",
      x: 60,
      y: 60,
      connectionStatus: "已连接",
      powerStatus: "工作正常"
    },
    {
      id: "node-vcc",
      templateId: "vcc_power",
      name: "VCC",
      category: "VCC/GND",
      interfaceType: "Power",
      pinCount: 1,
      voltage: "3.3V/5V",
      desc: "直流电源红线 VCC 供电电源端口。",
      x: 70,
      y: 230,
      connectionStatus: "已连接",
      powerStatus: "3.3V稳定供电"
    },
    {
      id: "node-gnd",
      templateId: "gnd_ground",
      name: "GND",
      category: "VCC/GND",
      interfaceType: "Power",
      pinCount: 1,
      voltage: "0V",
      desc: "地参考引脚（黑色/地极），引回电路闭合闭圈。",
      x: 70,
      y: 330,
      connectionStatus: "已连接",
      powerStatus: "接地回路"
    }
  ]);

  // 画布上已有的物理连接线
  const [wirings, setWirings] = useState<CanvasWiring[]>([
    { id: "wire-1", fromNodeId: "node-dht", fromPin: "DATA", toNodeId: "node-mcu", toPin: "PA1", color: "#10A66A" },
    { id: "wire-2", fromNodeId: "node-oled", fromPin: "SDA", toNodeId: "node-mcu", toPin: "PB7", color: "#A855F7" },
    { id: "wire-3", fromNodeId: "node-oled", fromPin: "SCL", toNodeId: "node-mcu", toPin: "PB6", color: "#A855F7" },
    { id: "wire-4", fromNodeId: "node-led", fromPin: "ANODE", toNodeId: "node-mcu", toPin: "PA5", color: "#10A66A" }
  ]);

  // 撤销/重做栈
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // 当前选中节点细节，默认选中 STM32F103 主控
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("node-mcu");

  // 拖动状态 (用于画布上的节点)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // 临时正在和画布外交互的拖拽
  const [isDragOverCanvas, setIsDragOverCanvas] = useState<boolean>(false);

  // 连线工具激活状态
  const [wiringToolActive, setWiringToolActive] = useState<boolean>(false);
  const [wirePendingStart, setWirePendingStart] = useState<{ nodeId: string; pin: string } | null>(null);

  // 时间计时器
  useEffect(() => {
    const interval = setInterval(() => {
      if (runStatus === "运行中") {
        setSessionTime(prev => prev + 1);
        // 随机产生一下终端日志
        if (Math.random() > 0.85) {
          const sensors = ["dht11", "photo", "gas"];
          const states = ["OK", "READ_STABLE", "BUS_IDLE"];
          const ranLog = `[Renode CPU] Periodic query sensor [${sensors[Math.floor(Math.random() * 3)]}] returned status ${states[Math.floor(Math.random() * 3)]}.`;
          setTerminalLogs(prev => [...prev, ranLog]);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [runStatus]);

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 生成日志
  const addLog = (text: string) => {
    const time = new Date().toTimeString().split(" ")[0];
    setLogs(prev => [`[${time}] ${text}`, ...prev.slice(0, 40)]);
  };

  // 切换折叠
  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // 模块库搜索过滤
  const filteredModulesList = useMemo(() => {
    if (!searchKeyword.trim()) return ALL_EMBEDDED_MODULES;
    return ALL_EMBEDDED_MODULES.filter(m =>
      m.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      m.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [searchKeyword]);

  // 类别数量统计
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {
      "全部": ALL_EMBEDDED_MODULES.length,
      "主控芯片": 0,
      "传感器": 0,
      "显示器": 0,
      "总线接口": 0,
      "调试助手": 0,
      "按键输入": 0,
      "VCC/GND": 0
    };
    ALL_EMBEDDED_MODULES.forEach(m => {
      if (m.category in stats) {
        stats[m.category]++;
      }
    });
    return stats;
  }, []);

  // 点击添加模块
  const handleAddNewModuleById = (templateId: string, customX?: number, customY?: number) => {
    const template = ALL_EMBEDDED_MODULES.find(m => m.id === templateId);
    if (!template) return;

    // 存入撤销历史
    setHistoryStack(prev => [...prev, JSON.stringify(canvasNodes)]);
    setRedoStack([]);

    const newId = `node-${Date.now()}-${Math.floor(Math.random() * 105)}`;
    const randomOffset = Math.floor(Math.random() * 80) - 40;
    const px = customX !== undefined ? customX : 300 + randomOffset;
    const py = customY !== undefined ? customY : 180 + randomOffset;

    const newNode: CanvasNodeInstance = {
      id: newId,
      templateId: template.id,
      name: template.name,
      category: template.category,
      interfaceType: template.interfaceType,
      pinCount: template.pinCount || 3,
      voltage: template.voltage || "3.3V",
      desc: template.desc,
      x: px,
      y: py,
      connectionStatus: "对接层连接成功(虚拟通道已通)",
      powerStatus: "由芯片+5V/I2C引脚取电(正常)"
    };

    setCanvasNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newId);
    showToast(`模块已添加在画布中：${template.name}`);
    addLog(`添加组件：向画布中新增了“${template.name}”设备，并进入属性监控。`);
    
    // 如果是串口调试助手，输出特色终端日志
    if (templateId === "uart_helper") {
      setTerminalLogs(prev => [
        ...prev,
        `[UART Assist] Added virtual USART terminal assist node near STM32.`,
        `[UART Config] BaudRate: 115200 | DataBits: 8 | StopBits: 1`,
        `[Status] Host-Terminal tunneling OK. (Listening Docker:30054)`
      ]);
    }
  };

  // 开始拖挪画布节点
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    const node = canvasNodes.find(n => n.id === nodeId);
    if (node) {
      dragOffsetRef.current = {
        x: e.clientX - node.x,
        y: e.clientY - node.y
      };
    }
  };

  // 鼠标移动拖挪中
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      e.preventDefault();
      const nodeX = e.clientX - dragOffsetRef.current.x;
      const nodeY = e.clientY - dragOffsetRef.current.y;

      // 限制拖拽边界在画布合理区内
      const boundedX = Math.max(10, Math.min(1000, nodeX));
      const boundedY = Math.max(10, Math.min(500, nodeY));

      setCanvasNodes(prev =>
        prev.map(n => (n.id === draggingNodeId ? { ...n, x: boundedX, y: boundedY } : n))
      );
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingNodeId) {
      const node = canvasNodes.find(n => n.id === draggingNodeId);
      if (node) {
        addLog(`节点拖移：完成将部件“${node.name}”的位置挪移调整。`);
      }
      setDraggingNodeId(null);
    }
  };

  // 删除设备
  const handleDeleteNode = (id: string) => {
    setHistoryStack(prev => [...prev, JSON.stringify(canvasNodes)]);
    setRedoStack([]);

    const node = canvasNodes.find(n => n.id === id);
    if (!node) return;

    setCanvasNodes(prev => prev.filter(n => n.id !== id));
    setWirings(prev => prev.filter(w => w.fromNodeId !== id && w.toNodeId !== id));

    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }

    showToast(`已成功移除模块：${node.name}`);
    addLog(`清除：画布移除了“${node.name}”及其关联的虚拟连线。`);
  };

  // 双击画布节点删除或调出属性
  const handleNodeDoubleClick = (id: string) => {
    setSelectedNodeId(id);
    showToast(`已高亮锁定组件：双击调出“${canvasNodes.find(n => n.id === id)?.name}”引脚定义`);
  };

  // 撤销
  const handleUndo = () => {
    if (historyStack.length === 0) {
      showToast("无可撤销的历史记录");
      return;
    }
    const last = historyStack[historyStack.length - 1];
    setRedoStack(prev => [...prev, JSON.stringify(canvasNodes)]);
    setCanvasNodes(JSON.parse(last));
    setHistoryStack(prev => prev.slice(0, prev.length - 1));
    showToast("已执行：撤销到上一步");
    addLog("画布历史：回退上一物理配置状态（撤销）");
  };

  // 重做
  const handleRedo = () => {
    if (redoStack.length === 0) {
      showToast("无需重做的历史记录");
      return;
    }
    const next = redoStack[redoStack.length - 1];
    setHistoryStack(prev => [...prev, JSON.stringify(canvasNodes)]);
    setCanvasNodes(JSON.parse(next));
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    showToast("已执行：重做到下一步");
    addLog("画布历史：前进到最新修改状态（重做）");
  };

  // 重置画布
  const handleResetCanvas = () => {
    if (window.confirm("确定要恢复默认挂载连接配置吗？")) {
      // 恢复默认 6 个节点
      setCanvasNodes([
        { id: "node-mcu", templateId: "stm32f103", name: "STM32F103", category: "主控芯片", interfaceType: "LQFP", pinCount: 64, voltage: "3.3V", desc: "经典实用的ARM Cortex-M3内核微控制器", x: 310, y: 90, connectionStatus: "已连接", powerStatus: "工作正常" },
        { id: "node-oled", templateId: "oled", name: "OLED显示器", category: "显示器", interfaceType: "I2C", pinCount: 4, voltage: "3.3V", desc: "0.96寸 SSD1306 点阵液晶显示屏", x: 580, y: 70, connectionStatus: "已连接", powerStatus: "工作正常" },
        { id: "node-led", templateId: "led_light", name: "LED", category: "显示器", interfaceType: "GPIO", pinCount: 2, voltage: "3.3V", desc: "发光二极管灯泡指示，点高平点亮。", x: 580, y: 220, connectionStatus: "已连接", powerStatus: "健康工作" },
        { id: "node-dht", templateId: "dht11", name: "温湿度传感器", category: "传感器", interfaceType: "GPIO / I2C", pinCount: 4, voltage: "3.3V", desc: "数字单总线，温湿度高精密传感电极片。", x: 60, y: 60, connectionStatus: "已连接", powerStatus: "工作正常" },
        { id: "node-vcc", templateId: "vcc_power", name: "VCC", category: "VCC/GND", interfaceType: "Power", pinCount: 1, voltage: "3.3V/5V", desc: "直流电源红线 VCC 供电设备极柱。", x: 70, y: 230, connectionStatus: "已连接", powerStatus: "3.3V稳定供电" },
        { id: "node-gnd", templateId: "gnd_ground", name: "GND", category: "VCC/GND", interfaceType: "Power", pinCount: 1, voltage: "0V", desc: "地参考引脚（黑灰极柱），形成封闭电路流圈。", x: 70, y: 330, connectionStatus: "已连接", powerStatus: "接地回路" }
      ]);
      setWirings([
        { id: "wire-1", fromNodeId: "node-dht", fromPin: "DATA", toNodeId: "node-mcu", toPin: "PA1", color: "#10A66A" },
        { id: "wire-2", fromNodeId: "node-oled", fromPin: "SDA", toNodeId: "node-mcu", toPin: "PB7", color: "#A855F7" },
        { id: "wire-3", fromNodeId: "node-oled", fromPin: "SCL", toNodeId: "node-mcu", toPin: "PB6", color: "#A855F7" },
        { id: "wire-4", fromNodeId: "node-led", fromPin: "ANODE", toNodeId: "node-mcu", toPin: "PA5", color: "#10A66A" }
      ]);
      setSelectedNodeId("node-mcu");
      showToast("画布连线已重算，基准挂载点还原成功");
      addLog("重置画布：已一键复位画布并同步刷新至 6 大默认节点链路。");
    }
  };

  // 外边拖进来逻辑：
  const handleDragOverCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(true);
  };

  const handleDragLeaveCanvas = () => {
    setIsDragOverCanvas(false);
  };

  const handleDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(false);
    const templateId = e.dataTransfer.getData("text/plain");
    if (!templateId) return;

    // 获取工作台画布 DOM 矩形，确定鼠标精确释放坐标
    const canvasEl = document.getElementById("embedded-draw-stage");
    if (canvasEl) {
      const rect = canvasEl.getBoundingClientRect();
      const dropX = Math.round(e.clientX - rect.left - 40);
      const dropY = Math.round(e.clientY - rect.top - 40);
      handleAddNewModuleById(templateId, dropX, dropY);
    } else {
      handleAddNewModuleById(templateId);
    }
  };

  // 连线建立
  const handlePinClickSegment = (nodeId: string, pin: string) => {
    if (!wiringToolActive) {
      showToast(`提示：在顶部工具栏中开启“连线工具”后，方可自由在两点引脚间敷设导线。`);
      return;
    }

    if (!wirePendingStart) {
      setWirePendingStart({ nodeId, pin });
      showToast(`已选中导线起点引脚：[${canvasNodes.find(n => n.id === nodeId)?.name}] - ${pin}，请继续点击其他节点脚柱终点`);
    } else {
      if (wirePendingStart.nodeId === nodeId) {
        showToast("无法将连线的起点与终点指定在同一个设备上！");
        setWirePendingStart(null);
        return;
      }

      // 建立新的虚拟导线
      const newWire: CanvasWiring = {
        id: `wire-${Date.now()}`,
        fromNodeId: wirePendingStart.nodeId,
        fromPin: wirePendingStart.pin,
        toNodeId: nodeId,
        toPin: pin,
        color: wiringColors[Math.floor(Math.random() * wiringColors.length)]
      };

      setWirings(prev => [...prev, newWire]);
      showToast(`硬导线敷设成功：[${canvasNodes.find(n => n.id === wirePendingStart.nodeId)?.name}] ${wirePendingStart.pin} ➔ [${canvasNodes.find(n => n.id === nodeId)?.name}] ${pin}`);
      addLog(`硬导线物理连接已建立: (芯针: ${wirePendingStart.pin} — ${pin})`);
      setWirePendingStart(null);
    }
  };

  const wiringColors = ["#10A66A", "#3B82F6", "#EF4444", "#F59E0B", "#A855F7", "#06B6D4"];

  // 串口输入模拟回车
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    const newLogs = [...terminalLogs, `GuestOS-STM32:/# ${cmd}`];

    let reply = `Command '${cmd}' unrecognized. Entering --help for STM32 physical register instructions.`;
    if (cmd === "help" || cmd === "?") {
      reply = "Available options: sys_status, test_led, query_dht, flash_firmware, clear";
    } else if (cmd === "sys_status") {
      reply = `CPU running rate: 100% | Registered Ports: 30000, 30001 | RAM remaining: 84KB / 128KB.`;
    } else if (cmd === "test_led") {
      reply = `[SUCCESS] Outputting PWM wave to PORTA5. Target Pin LED should be state 'blink' in 20Hz.`;
      addLog("[串口测试] 发送 test_led 指令到 STM32 控制板成功。");
    } else if (cmd === "query_dht") {
      reply = `DHT11 data packet received: HUMIDITY: 55.4% | TEMPERATURE: 24.2 °C (Parity Check checksum: OK)`;
    } else if (cmd === "clear") {
      setTerminalLogs([`GuestOS-STM32:/# _`]);
      setTerminalInput("");
      return;
    }

    setTerminalLogs([...newLogs, reply, "GuestOS-STM32:/# _"]);
    setTerminalInput("");
  };

  // 一键自愈物理防线/连线校验
  const handleAutoRepairWires = () => {
    setWirings([
      { id: "wire-1", fromNodeId: "node-dht", fromPin: "DATA", toNodeId: "node-mcu", toPin: "PA1", color: "#10A66A" },
      { id: "wire-2", fromNodeId: "node-oled", fromPin: "SDA", toNodeId: "node-mcu", toPin: "PB7", color: "#A855F7" },
      { id: "wire-3", fromNodeId: "node-oled", fromPin: "SCL", toNodeId: "node-mcu", toPin: "PB6", color: "#A855F7" },
      { id: "wire-4", fromNodeId: "node-led", fromPin: "ANODE", toNodeId: "node-mcu", toPin: "PA5", color: "#10A66A" }
    ]);
    showToast("一键自愈导线敷设完毕。6 大核心节点引脚线路已经彻底映射吻合！");
    addLog("故障修复：一键自愈连线，整机拓扑通过。");
  };

  // 手工切页或刷新
  const handleRefreshApp = () => {
    addLog("更新：刷新物理芯片寄存器堆与网络流映射。");
    showToast("虚拟Renode总线寄存器刷新完成！");
  };

  const [screenshotList, setScreenshotList] = useState<{ id: string; name: string; time: string }[]>([]);
  const handleCaptureScreen = () => {
    const time = new Date().toTimeString().split(" ")[0];
    const newId = `screen-${Date.now()}`;
    setScreenshotList(prev => [...prev, { id: newId, name: `嵌入式仿真截图_${time}.jpg`, time }]);
    showToast("已捕获画布和窗口。一键存储成功，写入本地实训成果表。");
    addLog("成果存盘：针对物理网虚实底座仿真实验，完成关键大图捕获。");
  };

  // 精准连线查找（在画线上）
  const selectedNode = canvasNodes.find(n => n.id === selectedNodeId);

  return (
    <div className={`h-[calc(100vh-56px)] max-h-[calc(100vh-56px)] flex flex-col bg-[#F8FAF9] overflow-hidden select-none text-zinc-800 font-sans`}>
      
      {/* 1. 实验环境状态栏 (白底高对比, 浅灰边框) */}
      <div className="bg-white border-b border-zinc-200 px-5 flex items-center justify-between select-none h-[52px] shrink-0 text-xs font-semibold text-zinc-650 overflow-hidden shadow-xs">
        <div className="flex items-center gap-5 whitespace-nowrap overflow-hidden">
          <div className="truncate flex items-center gap-1">
            <span className="text-zinc-400">实验环境：</span>
            <span className="text-zinc-850 font-extrabold text-sm flex items-center gap-1">
              <Cpu className="w-4 h-4 text-[#10A66A]" />
              嵌入式仿真-Renode 芯片工作台
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="truncate flex items-center gap-1">
            <span className="text-zinc-400">当前用户：</span>
            <span className="text-zinc-850 font-bold flex items-center gap-1">学生1</span>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="truncate flex items-center gap-1">
            <span className="text-zinc-400">底层拓扑类型：</span>
            <span className="text-indigo-600 font-bold">ARM Cortex-M 单片机总线底座</span>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="truncate flex items-center gap-1">
            <span className="text-zinc-400">环境状态：</span>
            <span className="inline-flex items-center gap-1 bg-[#EAF8F1] text-[#10A66A] border border-[#CFEFE0] px-2 py-0.5 rounded text-[11px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10A66A] animate-ping" />
              {runStatus}
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="truncate flex items-center gap-1">
            <span className="text-[#10A66A] font-bold">本次使用时长：</span>
            <span className="font-mono text-[#10A66A] font-extrabold text-sm">{formatDuration(sessionTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="h-7 px-3 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Power className="w-3.5 h-3.5" />
            <span>关闭环境</span>
          </button>
        </div>
      </div>

      {/* 2. 仿真工具栏 (按钮包含 icon, tooltip, 和运行状态) */}
      <div className="bg-white border-b border-zinc-200 px-5 flex items-center justify-between h-11 shrink-0 text-xs text-zinc-650 overflow-hidden select-none shadow-3xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          
          <button
            onClick={() => handleAddNewModuleById("uart_helper")}
            title="快捷导入外置串口调试助手卡片"
            className="h-7 px-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            <span>导入组件</span>
          </button>

          <button
            onClick={() => {
              showToast("已成功导出画布电路硬件连线 XML 主文件。");
              addLog("备份机制：成功在本地导出画布中 32 类元器件当前的 GPIO 全管脚映射关系树。");
            }}
            title="导出当前连线图"
            className="h-7 px-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
            <span>导出配置</span>
          </button>

          <button
            onClick={() => {
              showToast("嵌入式实训报告生成！PDF 已写入下载缓冲区。");
              addLog("实训进度：下载硬件装配和 STM32 配置报告...");
            }}
            title="一键生成实训成果图PDF"
            className="h-7 px-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#10A66A]" />
            <span>下载成果</span>
          </button>

          <button
            onClick={handleRefreshApp}
            title="清空并重启微控制器寄存器"
            className="h-7 px-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            <span>刷新总线</span>
          </button>

          <div className="w-px h-5 bg-zinc-200 mx-1.5" />

          {/* 运行、暂停、停止组 */}
          <div className="flex items-center bg-zinc-100 rounded-lg p-0.5">
            <button
              onClick={() => {
                setRunStatus("运行中");
                showToast("一键自愈微处理器时钟！物理连线自检：成功。");
                addLog("微处理器时钟：从休眠点唤醒并激活 CPU 运行状态。");
              }}
              className={`h-[24px] px-2.5 rounded text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer ${
                runStatus === "运行中" ? "bg-emerald-500 text-white shadow-xs" : "text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>运行</span>
            </button>
            <button
              onClick={() => {
                setRunStatus("已暂停");
                showToast("指令指令挂起，微处理器已处于 HALT 低电压停机模式。");
                addLog("微处理器：物理总线周期挂起，进入 PAUSE 节电停机。");
              }}
              className={`h-[24px] px-2.5 rounded text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer ${
                runStatus === "已暂停" ? "bg-amber-500 text-white shadow-xs" : "text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <Pause className="w-3.5 h-3.5" />
              <span>暂停</span>
            </button>
            <button
              onClick={() => {
                setRunStatus("已停止");
                showToast("整机虚拟断电，正在解调物理通道映射链路。");
                addLog("微处理器：整机虚拟主电闸下拉，CPU 完全关停电平。");
              }}
              className={`h-[24px] px-2.5 rounded text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer ${
                runStatus === "已停止" ? "bg-red-500 text-white shadow-xs" : "text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>停止</span>
            </button>
          </div>

          <div className="w-px h-5 bg-zinc-200 mx-1.5" />

          {/* 连线工具硬卡 */}
          <button
            onClick={() => {
              setWiringToolActive(!wiringToolActive);
              setWirePendingStart(null);
            }}
            className={`h-7 px-3.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border shadow-sm ${
              wiringToolActive 
                ? "bg-[#EAF8F1] text-[#10A66A] border-emerald-300" 
                : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            <Workflow className={`w-3.5 h-3.5 ${wiringToolActive ? "text-[#10A66A]" : "text-zinc-400"}`} />
            <span>管脚连线工具：{wiringToolActive ? "开启中" : "关闭"}</span>
          </button>

          {/* 自动补全导线 */}
          <button
            onClick={handleAutoRepairWires}
            className="h-7 px-3 bg-[#EAF8F1] border border-[#CFEFE0] hover:bg-[#D5EFE1] text-[#10A66A] rounded text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer"
          >
            <span>一键自愈导线 ➔</span>
          </button>
          
          <button
            onClick={handleCaptureScreen}
            className="h-7 px-3 bg-[#10A66A] hover:bg-emerald-600 text-white rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>一键截屏</span>
          </button>

        </div>

        <div className="flex items-center gap-2">
          {/* 画布缩放工具 */}
          <button
            onClick={() => showToast("画布视图已放大至 115%")}
            className="p-1 px-1.5 bg-zinc-50 hover:bg-zinc-100 rounded border border-zinc-200"
          >
            <ZoomIn className="w-3.5 h-3.5 text-zinc-500" />
          </button>
          <button
            onClick={() => showToast("画布视图已缩小至 85%")}
            className="p-1 px-1.5 bg-zinc-50 hover:bg-zinc-100 rounded border border-zinc-200"
          >
            <ZoomOut className="w-3.5 h-3.5 text-zinc-500" />
          </button>
          <button
            onClick={() => showToast("画布视图缩放已调整自适应：自适应网格 32x32px")}
            className="h-7 px-2.5 bg-zinc-50 hover:bg-zinc-100 rounded border border-zinc-200 font-bold"
          >
            <span>适配画布</span>
          </button>

          <div className="w-px h-4 bg-zinc-200 mx-1" />

          {/* 撤销重做 */}
          <button
            onClick={handleUndo}
            disabled={historyStack.length === 0}
            className="p-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 rounded disabled:opacity-40"
            title="撤销"
          >
            <Undo className="w-3.5 h-3.5 text-zinc-500" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 rounded disabled:opacity-40"
            title="重作"
          >
            <Redo className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          <button
            onClick={handleResetCanvas}
            title="将整个画布装载还原"
            className="h-7 px-2.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded text-[11.5px] font-bold"
          >
            <span>重置画布</span>
          </button>
        </div>
      </div>

      {/* 3. 中间核心装配区域 */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* A. 侧边一级高密度实验导航栏 */}
        <div className="w-14 bg-zinc-900 text-zinc-400 flex flex-col items-center py-4 shrink-0 border-r border-zinc-800 gap-5 select-none h-full overflow-y-auto">
          <div className="w-8 h-8 rounded bg-[#10A66A] flex items-center justify-center text-white mb-2 shadow" title="微电子仿真底座">
            <Monitor className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-5 text-center w-full grow">
            <div 
              onClick={() => setSelectedNavTab("intro")}
              className={`flex flex-col items-center gap-1 cursor-pointer group ${selectedNavTab === "intro" ? "text-white" : "hover:text-zinc-200"}`}
            >
              <div className={`w-7 h-7 rounded flex items-center justify-center transition ${selectedNavTab === "intro" ? "bg-[#10A66A] text-white" : "bg-zinc-800 text-zinc-400"}`}>
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] font-bold">环境简介</span>
            </div>

            <div 
              onClick={() => setSelectedNavTab("guide")}
              className={`flex flex-col items-center gap-1 cursor-pointer group ${selectedNavTab === "guide" ? "text-white" : "hover:text-zinc-200"}`}
            >
              <div className={`w-7 h-7 rounded flex items-center justify-center transition ${selectedNavTab === "guide" ? "bg-[#10A66A] text-white" : "bg-zinc-800 text-zinc-400"}`}>
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] font-bold">操作手册</span>
            </div>

            <div 
              onClick={() => setSelectedNavTab("course")}
              className={`flex flex-col items-center gap-1 cursor-pointer group ${selectedNavTab === "course" ? "text-white" : "hover:text-zinc-200"}`}
            >
              <div className={`w-7 h-7 rounded flex items-center justify-center transition ${selectedNavTab === "course" ? "bg-[#10A66A] text-white" : "bg-zinc-800 text-zinc-400"}`}>
                <Settings className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] font-bold">关联课程</span>
            </div>
          </div>
        </div>

        {/* B. 实验学习手册、向导和截图存储记录卡面 */}
        <div className="w-[260px] bg-white border-r border-zinc-200 flex flex-col shrink-0 h-full overflow-hidden">
          <div className="p-3 bg-zinc-50 border-b border-zinc-200 font-bold text-xs text-zinc-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-[#10A66A]" />实验指南</span>
            <span className="text-[9px] bg-zinc-200 text-zinc-600 px-1.5 py-0.2 rounded font-mono">Renode VM</span>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4 text-xs leading-relaxed text-zinc-650">
            {selectedNavTab === "intro" && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-[12.5px] text-zinc-800 border-b pb-1 flex items-center gap-1">
                  <span className="w-1 h-3.5 bg-[#10A66A] rounded-full inline-block" />
                  微控制器硬件底座
                </h4>
                <p>本仿真实验模块旨在打造全拟真的 **STM32 单片机及附属外设** 物理装配和引脚电气学实训平台。</p>
                <p>利用后台独立挂载的指令编译管道，用户敷设的每一根 PA/PB 虚拟硬连线都将实时生成 Docker 物理信道映射！</p>
                <div className="bg-zinc-50 p-2.5 rounded border border-zinc-150 text-[10.5px]">
                  <b>平台核心机制：</b>
                  <ol className="list-decimal list-inside space-y-1 mt-1 text-zinc-500">
                    <li>左侧拖拽各类组件入画布</li>
                    <li>开启顶部连线工具规划逻辑线</li>
                    <li>下方控制台发送代码进行固件烧录</li>
                  </ol>
                </div>
              </div>
            )}

            {selectedNavTab === "guide" && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-[12.5px] text-zinc-800 border-b pb-1 flex items-center gap-1">
                  <span className="w-1 h-3.5 bg-[#10A66A] rounded-full inline-block" />
                  STM32 实训引导书
                </h4>
                <div className="space-y-2 text-[11px] text-zinc-600">
                  <div className="p-2 bg-emerald-50/50 border border-emerald-100 rounded">
                     <span className="font-bold text-[#10A66A]">步骤一：</span>
                     默认画布已经加载了首选的 <b>STM32F103 主控、OLED显示器和LED灯</b>。请拖动各部件以防管脚重叠覆盖。
                  </div>
                  <div className="p-2 bg-zinc-50 border border-zinc-150 rounded">
                     <span className="font-bold text-zinc-700">步骤二：</span>
                     打开顶部<b>“管脚连线工具”</b>，单点选中 STM32 的 PB7 引脚柱，再点击温湿度传感器的 DATA 脚柱即可物理通线。
                  </div>
                  <div className="p-2 bg-zinc-50 border border-zinc-150 rounded">
                     <span className="font-bold text-zinc-700">步骤三：</span>
                     在底部串口终端输入 <code>sys_status</code> 指令，查看底层 Renode 的虚拟线程上报频率吧。
                  </div>
                </div>

                {screenshotList.length > 0 && (
                  <div className="mt-4 border-t border-zinc-150 pt-3">
                    <span className="font-bold text-zinc-700 text-[11px] block mb-2">已保存的实训截图清单：</span>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                      {screenshotList.map(item => (
                        <div key={item.id} className="p-2 bg-zinc-100 rounded border flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-zinc-600 truncate max-w-[150px]" title={item.name}>{item.name}</span>
                          <button 
                            onClick={() => {
                              setScreenshotList(prev => prev.filter(p => p.id !== item.id));
                              showToast("截图已从成果表中移除");
                            }}
                            className="text-rose-500 hover:text-red-700 font-bold"
                          >
                            移除
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedNavTab === "course" && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-[12.5px] text-zinc-800 border-b pb-1 flex items-center gap-1">
                  <span className="w-1 h-3.5 bg-[#10A66A] rounded-full inline-block" />
                  关联的主修实训课程体系
                </h4>
                <div className="space-y-1 text-[11px] text-zinc-500 font-medium">
                  <div className="flex gap-2 items-center p-1.5 hover:bg-zinc-50 rounded">
                    <span className="w-4 h-4 rounded bg-emerald-50 text-[#10A66A] text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>《ARM Cortex-M4 微控制器典型开发实训》</span>
                  </div>
                  <div className="flex gap-2 items-center p-1.5 hover:bg-zinc-50 rounded">
                    <span className="w-4 h-4 rounded bg-emerald-50 text-[#10A66A] text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>《嵌入式操作系统及外设软硬件系统装配》</span>
                  </div>
                  <div className="flex gap-2 items-center p-1.5 hover:bg-zinc-50 rounded">
                    <span className="w-4 h-4 rounded bg-emerald-50 text-[#10A66A] text-[10px] flex items-center justify-center font-bold">3</span>
                    <span>《物联网感知层技术及现场总线应用》</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* C. 模块列表区域 (宽度固定 230px, 默认清楚看到分类、合计数量、搜索框、完整模块) */}
        <div className="w-[230px] bg-white border-r border-zinc-200 flex flex-col shrink-0 h-full overflow-hidden">
          <div className="p-3 bg-zinc-50 border-b border-zinc-200">
            <div className="flex justify-between items-center mb-1">
              <span className="font-black text-xs text-zinc-850">模块列表</span>
              <span className="text-[10px] bg-[#EAF8F1] text-[#10A66A] px-1.5 py-0.2 rounded font-black">
                总数: {categoryStats["全部"]}
              </span>
            </div>
            <p className="text-[9.5px] text-zinc-400 font-bold leading-normal">
              按类型选择模块，可拖拽或点击快速添加到嵌入式画布。
            </p>
          </div>

          {/* 模块搜索框 */}
          <div className="p-2 border-b border-zinc-200 bg-white">
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                placeholder="请输入组件名"
                className="w-full bg-zinc-50 border border-zinc-250 rounded px-2 text-[11px] py-1 pl-6 focus:bg-white outline-none font-medium text-zinc-700"
              />
              <Search className="absolute left-2 top-2.5 w-3 h-3 text-zinc-400" />
            </div>
          </div>

          {/* 分类及具体卡片放置 (统计数字展示、分类默认可见) */}
          <div className="flex-1 overflow-y-auto p-1.5 bg-zinc-50/40 space-y-2 select-none">
            {["主控芯片", "传感器", "显示器", "总线接口", "调试助手", "按键输入", "VCC/GND"].map((catName) => {
              const matchedMods = filteredModulesList.filter(m => m.category === catName);
              const isExpanded = expandedCategories.includes(catName);

              return (
                <div key={catName} className="bg-white border border-zinc-150 rounded-lg overflow-hidden shrink-0">
                  <div
                    onClick={() => toggleCategory(catName)}
                    className="flex justify-between items-center py-2 px-2.5 bg-white border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer text-xs font-extrabold text-zinc-700 select-none"
                  >
                    <span className="flex items-center gap-1 text-[11px]">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
                      {catName}
                    </span>
                    <span className="text-[9.5px] bg-zinc-100 px-2 py-0.2 rounded font-mono text-zinc-500">
                      {categoryStats[catName]}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="divide-y divide-zinc-100 max-h-[200px] overflow-y-auto">
                      {matchedMods.length === 0 ? (
                        <div className="p-3 text-center text-[10px] text-zinc-400">
                          暂无符合条件的组件
                        </div>
                      ) : (
                        matchedMods.map(m => (
                          <div
                            key={m.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", m.id);
                              e.dataTransfer.effectAllowed = "copy";
                            }}
                            className="p-2 hover:bg-[#EAF8F1]/40 group transition-all duration-150 cursor-grab active:cursor-grabbing border-l-2 border-transparent hover:border-emerald-500"
                            title="点按右端 '+' 添加或直接拖入画布"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-zinc-700 truncate max-w-[140px]" title={m.name}>
                                {m.name}
                              </span>
                              <button
                                onClick={() => handleAddNewModuleById(m.id)}
                                title="点击直接物理载入此仿真元器件"
                                className="w-5 h-5 rounded bg-zinc-100 hover:bg-[#10A66A] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex gap-2 py-0.5 text-[8.5px] font-bold text-zinc-400 font-mono">
                              <span>接头: {m.interfaceType}</span>
                              {m.pinCount !== undefined && <span>引脚: {m.pinCount}P</span>}
                              <span>供电: {m.voltage}</span>
                            </div>

                            <p className="text-[8.5px] text-zinc-400 line-clamp-1 group-hover:line-clamp-none font-medium leading-relaxed leading-normal mt-0.5">
                              {m.desc}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* D. 中间白色物理网格仿真画布区域 */}
        <div className="flex-1 flex flex-col overflow-hidden h-full bg-white relative">
          
          {/* 画图主要网格面板 */}
          <div
            id="embedded-draw-stage"
            onDragOver={handleDragOverCanvas}
            onDragLeave={handleDragLeaveCanvas}
            onDrop={handleDropOnCanvas}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className={`flex-grow relative overflow-hidden transition-colors border-b border-zinc-200 select-none cursor-default ${
              isDragOverCanvas ? "bg-[#EAF8F1]/20 cursor-copy" : "bg-zinc-50"
            }`}
            style={{
              backgroundImage: "radial-gradient(#cbd5e1 1.2px, transparent 0)",
              backgroundSize: "24px 24px"
            }}
          >
            
            {/* SVG 物理阻抗、管脚连接导线 */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {wirings.map((wire) => {
                const fNode = canvasNodes.find(n => n.id === wire.fromNodeId);
                const tNode = canvasNodes.find(n => n.id === wire.toNodeId);
                if (!fNode || !tNode) return null;

                // 计算连线端点粗略近似 (根据其布局坐标向外偏移)
                const x1 = fNode.x + 60;
                const y1 = fNode.y + 35;
                const x2 = tNode.x + 60;
                const y2 = tNode.y + 35;

                // 绘制带曲折拐角阻抗的高保真双折贝塞尔线
                const dx = Math.abs(x2 - x1) * 0.5;
                const controlX1 = x1 + (x2 > x1 ? dx : -dx);
                const controlY1 = y1;
                const controlX2 = x2 + (x2 > x1 ? -dx : dx);
                const controlY2 = y2;

                const pathD = `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`;

                return (
                  <g key={wire.id} className="cursor-pointer group pointer-events-auto">
                    {/* 背景透明高能点击辅助线 */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="11"
                      className="cursor-pointer"
                      onClick={() => {
                        if (window.confirm("确定要切断此根电气管脚连线吗？")) {
                          setWirings(prev => prev.filter(w => w.id !== wire.id));
                          addLog(`管脚断连：手工切断了物理端口硬线 [${wire.fromPin} ➔ ${wire.toPin}]。`);
                          showToast("导线路径已清除。");
                        }
                      }}
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke={wire.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="group-hover:stroke-red-500 group-hover:stroke-[3.5px] transition-all"
                    />
                    {/* 电流飞梭流动动画效果 (仿 3D 电流动态) */}
                    <circle r="3.5" fill="#FFFFFF" stroke={wire.color} strokeWidth="1.5">
                      <animateMotion path={pathD} dur="3.5s" repeatCount="indefinite" />
                    </circle>
                  </g>
                );
              })}
            </svg>

            {/* 外部物件拖入时的悬浮视觉释放提示盒 */}
            {isDragOverCanvas && (
              <div className="absolute inset-5 border-2 border-dashed border-[#10A66A] bg-[#EAF8F1]/40 rounded-xl z-25 flex flex-col items-center justify-center text-center pointer-events-none animate-pulse">
                <Workflow className="w-10 h-10 text-[#10A66A] mb-2" />
                <span className="text-sm font-black text-[#10A66A]">释放起子 ➔ 自动装配入 Renode 画布底层</span>
                <span className="text-[11px] text-zinc-500 font-medium">释放鼠标按键，将在该对应坐标位置注册新组件实例</span>
              </div>
            )}

            {/* 画布元器件实例渲染 (包含支持位置拖动) */}
            {canvasNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isMcu = node.category === "主控芯片";

              return (
                <div
                  key={node.id}
                  id={node.id}
                  onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                  onDoubleClick={() => handleNodeDoubleClick(node.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                  }}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`absolute z-20 w-[140px] bg-white rounded-xl shadow-md border-2 p-2 select-none select-none transition-shadow ${
                    isSelected
                      ? "border-[#10A66A] ring-4 ring-[#EAF8F1] shadow-emerald-250/20"
                      : "border-zinc-200/90 hover:border-zinc-350"
                  } ${draggingNodeId === node.id ? "cursor-grabbing opacity-90 scale-95 shadow-lg" : "cursor-grab"}`}
                >
                  {/* MCU 或 传感器标识名称 */}
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-1 mb-1 shadow-3xs">
                    <span className="text-[8px] uppercase font-black tracking-wider px-1 rounded bg-zinc-100 font-mono text-zinc-400">
                      {node.category === "主控芯片" ? "mcu" : node.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      className="w-4 h-4 hover:bg-rose-50 rounded flex items-center justify-center text-zinc-300 hover:text-rose-500 cursor-pointer"
                      title="移除此卡片组件"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="font-extrabold text-[11.5px] text-zinc-850 truncate text-[#10A66A] whitespace-nowrap mb-0.5">
                    {node.name}
                  </div>

                  {/* 如果是 MCU，精美画出周边 12 核心触脚或引脚编号 */}
                  {isMcu ? (
                    <div className="space-y-1">
                      <div className="text-[8px] bg-[#EAF8F1] text-[#10A66A] p-1 font-bold rounded text-center">
                        64-引脚 LQFP 底座
                      </div>
                      <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-50 rounded border text-[8.5px] font-mono text-center font-extrabold text-zinc-500">
                        {["PA1", "PA5", "PB6", "PB7", "PC13", "VCC", "GND", "RST"].map(pin => (
                          <div
                            key={pin}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePinClickSegment(node.id, pin);
                            }}
                            className={`p-0.5 rounded border transition-colors cursor-pointer select-none ${
                              wirePendingStart?.nodeId === node.id && wirePendingStart?.pin === pin
                                ? "bg-amber-400 text-white border-amber-500"
                                : "bg-white hover:bg-[#EAF8F1] hover:text-[#10A66A]"
                            }`}
                          >
                            {pin}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // 其他常规元器件，显示接口特征卡片或引脚极性
                    <div className="space-y-1 text-zinc-600 font-medium">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-zinc-400">电平:</span>
                        <span className="text-zinc-700 font-mono">{node.voltage}</span>
                      </div>
                      {/* 外设接头物理极性引脚柱 */}
                      <div className="flex gap-1 justify-center pt-1 border-t border-dashed border-zinc-150">
                        {node.templateId === "oled" && ["VCC", "GND", "SCL", "SDA"].map(p => (
                          <button
                            key={p}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePinClickSegment(node.id, p);
                            }}
                            className={`px-1 text-[8.5px] font-mono font-bold rounded border ${
                              wirePendingStart?.nodeId === node.id && wirePendingStart?.pin === p
                                ? "bg-amber-400 text-white"
                                : "bg-zinc-50 text-zinc-500 hover:bg-emerald-50 hover:text-[#10A66A]"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        {node.templateId === "led_light" && ["ANODE", "CATHODE"].map(p => (
                          <button
                            key={p}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePinClickSegment(node.id, p);
                            }}
                            className={`px-1 text-[8.5px] font-mono font-bold rounded border ${
                              wirePendingStart?.nodeId === node.id && wirePendingStart?.pin === p
                                ? "bg-amber-400 text-white"
                                : "bg-zinc-50 text-zinc-500 hover:bg-emerald-50 hover:text-[#10A66A]"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        {node.templateId === "dht11" && ["VCC", "GND", "DATA"].map(p => (
                          <button
                            key={p}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePinClickSegment(node.id, p);
                            }}
                            className={`px-1 text-[8.5px] font-mono font-bold rounded border ${
                              wirePendingStart?.nodeId === node.id && wirePendingStart?.pin === p
                                ? "bg-amber-400 text-white"
                                : "bg-zinc-50 text-zinc-500 hover:bg-emerald-50 hover:text-[#10A66A]"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        {node.templateId !== "oled" && node.templateId !== "led_light" && node.templateId !== "dht11" && ["VCC", "GND", "I/O"].map(p => (
                          <button
                            key={p}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePinClickSegment(node.id, p);
                            }}
                            className="px-1 text-[8px] font-mono font-semibold rounded border bg-zinc-50 text-zinc-500 hover:bg-[#EAF8F1]"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* E. 模块属性面板 / 在选中节点时出现在中间画布右下角或固定在右侧 */}
          {selectedNode && (
            <div className="absolute right-4 bottom-4 z-20 w-[240px] bg-white border border-emerald-200 rounded-xl p-3 shadow-xl space-y-2 animate-in slide-in-from-bottom duration-150">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 shadow-3xs">
                <span className="font-extrabold text-[12px] text-zinc-800 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-[#10A66A]" />
                  模块属性树
                </span>
                <span className="text-[9px] bg-[#EAF8F1] text-[#10A66A] font-extrabold px-1.5 py-0.2 rounded">
                  {selectedNode.category}
                </span>
              </div>

              <div className="space-y-1.5 text-[10.5px] leading-relaxed">
                <div>
                  <span className="text-zinc-400 font-bold">编号：</span>
                  <span className="font-mono text-zinc-700 font-extrabold">{selectedNode.id}</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-bold">组件名称：</span>
                  <span className="text-zinc-800 font-bold">{selectedNode.name}</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-bold">通信类型：</span>
                  <span className="text-zinc-700 font-mono bg-zinc-50 px-1 border rounded">{selectedNode.interfaceType} 总线</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-bold">物理引脚：</span>
                  <span className="text-zinc-850 font-bold font-mono">{selectedNode.pinCount} 触柱</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-bold">带载供电：</span>
                  <span className="text-amber-600 font-bold font-mono">{selectedNode.voltage}</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-bold">连接状态：</span>
                  <span className="text-emerald-600 font-black tracking-wide">{selectedNode.connectionStatus}</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-bold">电源状况：</span>
                  <span className="text-indigo-600 font-semibold">{selectedNode.powerStatus}</span>
                </div>
                <div className="border-t border-dashed border-zinc-150 pt-1.5 mt-1.5 text-[8.5px] text-zinc-400 font-medium">
                  {selectedNode.desc}
                </div>
              </div>

              <div className="flex gap-1.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    showToast(`正在调试自检 [${selectedNode.name}] 底层硬件控制管脚。物理回路无空闲，阻值极高！`);
                    addLog(`硬件对齐验证：锁存自检 “${selectedNode.name}” 的全套 IO 特性。`);
                  }}
                  className="flex-1 py-1.5 bg-[#EAF8F1] hover:bg-emerald-100 text-[#10A66A] rounded font-bold text-[9.5px] transition"
                >
                  验证引脚
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteNode(selectedNode.id)}
                  className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded font-bold text-[9.5px] text-center"
                >
                  移除卡片
                </button>
              </div>
            </div>
          )}

          {/* F. 下方黑色终端窗口 Terminal Window (底设固定) */}
          <div className="h-[140px] bg-zinc-950 font-mono text-[10px] text-zinc-300 flex flex-col shrink-0 select-none border-t border-zinc-800">
            {/* 顶栏控制辅助 */}
            <div className="bg-zinc-900 px-4 py-1 flex items-center justify-between text-zinc-450 border-b border-zinc-900 select-none text-[9px] shrink-0 font-bold font-sans">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <TerminalIcon className="w-3.5 h-3.5 text-[#10A66A]" />
                嵌入式仿真本地调试终端 (Renode Shell)
              </span>
              <span className="text-[8.5px] text-zinc-500">
                服务宿主端口开放范围：30000 - 30100 (Docker桥接通道正常)
              </span>
            </div>

            {/* 终端内容区自动滚动 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5 selection:bg-[#10A66A]/40 scrollbar-none">
              {terminalLogs.map((logStr, idx) => (
                <div key={idx} className="leading-relaxed break-all font-mono">
                  {logStr.startsWith("GuestOS-STM32:/#") ? (
                    <span className="text-[#10A66A] whitespace-pre font-bold">{logStr}</span>
                  ) : logStr.startsWith("==") ? (
                    <span className="text-zinc-500">{logStr}</span>
                  ) : (
                    <span>{logStr}</span>
                  )}
                </div>
              ))}
            </div>

            {/* 模拟输入表单 */}
            <form onSubmit={handleTerminalSubmit} className="bg-zinc-900 py-1 px-3 border-t border-zinc-800 shrink-0 flex items-center gap-1.5">
              <span className="text-[#10A66A] font-bold font-mono">GuestOS-STM32:/#</span>
              <input
                type="text"
                value={terminalInput}
                onChange={e => setTerminalInput(e.target.value)}
                placeholder="在此发送 GPIO 操作指令 (如 test_led, sys_status)..."
                className="flex-1 bg-transparent border-none outline-none font-mono text-zinc-200 text-[10px] placeholder-zinc-650"
              />
              <button type="submit" className="text-[#10A66A] hover:bg-zinc-800 p-1 px-2.5 rounded font-bold text-[9px] cursor-pointer">
                发送指令
              </button>
            </form>
          </div>

        </div>

        {/* E. 物理仿真右侧操作运行记录板 (操作记录、带 10:20:00 这样行) */}
        <div className="w-[200px] bg-white border-l border-zinc-200 flex flex-col shrink-0 h-full overflow-hidden select-none">
          <div className="p-3 bg-zinc-50 border-b border-zinc-200 font-bold text-xs text-zinc-800 flex justify-between items-center shadow-3xs uppercase">
            <span>实训操作记录</span>
            <span className="px-1.5 py-0.2 bg-zinc-200 rounded text-[9.5px] scale-90 text-zinc-550">LOG</span>
          </div>

          <div className="flex-grow overflow-y-auto p-2 bg-zinc-50/10 divide-y divide-zinc-100 select-none">
            {logs.length === 0 ? (
              <div className="p-4 text-center text-[10px] text-zinc-400">
                暂无交互历史运行记录
              </div>
            ) : (
              logs.map((logLine, lIdx) => {
                // 拆分一下时钟和内容字样
                const matches = logLine.match(/^\[(.*?)\] (.*)$/);
                const time = matches ? matches[1] : "";
                const content = matches ? matches[2] : logLine;

                return (
                  <div key={lIdx} className="p-2 space-y-0.5 text-[10px] transition-colors leading-relaxed hover:bg-zinc-50/50 select-none">
                    <div className="text-[8.5px] font-bold text-zinc-400 font-mono">
                      {time || "10:20:00"}
                    </div>
                    <div className="text-zinc-600 font-medium">
                      {content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-zinc-200 bg-white space-y-2 shrink-0">
            <span className="text-[9.5px] text-zinc-400 font-bold block">硬件仿真中控服务</span>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  showToast("微控制器和 Docker 节点开始重新映射硬编固件！");
                  addLog("固件烧录：向 STM32 重新烧录 bin 指令包。");
                }}
                className="w-full py-2 bg-zinc-900 text-white font-extrabold text-[10px] rounded-lg border border-zinc-850 hover:bg-black uppercase transition cursor-pointer"
              >
                固件物理烧录 Loader
              </button>
              <div className="text-[9px] text-[#10A66A] font-black text-center flex items-center justify-center gap-1 bg-emerald-50 py-1.5 border border-emerald-150 rounded-md">
                <CheckCircle className="w-3 h-3 text-[#10A66A]" />
                <span>Renode 连接健康: 100%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
