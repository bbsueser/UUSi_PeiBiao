/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 硬件智能体：智能体交互控制
 * 文字/语音统一管理与查询网关下所有设备，支持输入图像进行识别与双重验证。
 * 三栏布局：左侧指令库 / 中间对话区 / 右侧实时状态面板。
 */

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  MessageSquare,
  BarChart3,
  Thermometer,
  Mic,
  Camera,
  Send,
  Play,
  Square,
  Unlock,
  Lock,
  Zap,
  Gauge,
  Bot,
  Search,
  WifiOff,
  FolderTree,
  Link2,
  X,
  Router,
  Cog,
  Fan,
  Lightbulb,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Activity,
  Droplets,
  Sun,
  Wind,
  PlugZap,
  Box,
  User
} from "lucide-react";
import type { UserSession } from "../types";

/* ============================ 类型定义 ============================ */

type DeviceType = "gateway" | "motor" | "fan" | "light" | "sensor";
type RunStatus = "running" | "stopped" | "off" | "warning";
type CommStatus = "online" | "offline";
type WorkMode = "manual" | "auto" | "high" | "low";

interface Device {
  id: string;
  name: string;
  type: DeviceType;
  model: string;
  ip: string;
  status: RunStatus;
  commStatus: CommStatus;
  protocol: string;
  firmware: string;
  wiring: string;
  indicator: string;
  lastSeen: string;
  uptime: string;
  switch?: "on" | "off";
  mode?: WorkMode;
  temp?: number;
  humidity?: number;
  light?: number;
}

type MessageRole = "user" | "system" | "success" | "error" | "rich" | "img";

interface ChatMessage {
  id: number;
  role: MessageRole;
  time: string;
  content: React.ReactNode;
}

interface AnomalyRecord {
  id: number;
  device: string;
  detail: string;
  time: string;
}

/* ============================ 静态数据 ============================ */

// 设备类型定义：覆盖灯光类、电机类、风扇类、传感器类
const deviceTypes: Record<DeviceType, { label: string; Icon: React.ElementType }> = {
  gateway: { label: "网关类", Icon: Router },
  motor: { label: "电机类", Icon: Cog },
  fan: { label: "风扇类", Icon: Fan },
  light: { label: "灯光类", Icon: Lightbulb },
  sensor: { label: "传感器类", Icon: Thermometer }
};

const initialDevices: Device[] = [
  {
    id: "gw-001",
    name: "AI硬件智能体-ECU-1251",
    type: "gateway",
    model: "研华工业通讯网关",
    ip: "192.168.1.101",
    status: "running",
    commStatus: "online",
    protocol: "Modbus TCP / MQTT",
    firmware: "V2.4.1",
    wiring: "接线正常",
    indicator: "指示灯常亮",
    lastSeen: "2026-09-18 10:42:15",
    uptime: "3天 06:12"
  },
  {
    id: "motor-001",
    name: "环形线电机",
    type: "motor",
    model: "西门子伺服电机",
    ip: "192.168.1.201",
    status: "stopped",
    commStatus: "online",
    switch: "off",
    mode: "manual",
    protocol: "Modbus RTU",
    firmware: "V1.8.0",
    wiring: "接线正常",
    indicator: "指示灯常亮",
    lastSeen: "2026-09-18 10:42:14",
    uptime: "3天 06:10"
  },
  {
    id: "motor-002",
    name: "推料电机",
    type: "motor",
    model: "ABB交流电机",
    ip: "192.168.1.202",
    status: "running",
    commStatus: "online",
    switch: "on",
    mode: "auto",
    protocol: "Modbus RTU",
    firmware: "V1.8.0",
    wiring: "接线正常",
    indicator: "指示灯常亮",
    lastSeen: "2026-09-18 10:42:15",
    uptime: "3天 06:11"
  },
  {
    id: "fan-001",
    name: "散热风扇",
    type: "fan",
    model: "工业散热风扇",
    ip: "192.168.1.203",
    status: "running",
    commStatus: "online",
    switch: "on",
    mode: "high",
    protocol: "Modbus RTU",
    firmware: "V1.5.2",
    wiring: "接线正常",
    indicator: "指示灯常亮",
    lastSeen: "2026-09-18 10:42:13",
    uptime: "3天 06:08"
  },
  {
    id: "light-001",
    name: "车间照明灯",
    type: "light",
    model: "LED工业照明",
    ip: "192.168.1.204",
    status: "off",
    commStatus: "online",
    switch: "off",
    protocol: "Modbus RTU",
    firmware: "V1.2.0",
    wiring: "接线正常",
    indicator: "指示灯熄灭",
    lastSeen: "2026-09-18 10:42:12",
    uptime: "3天 06:05"
  },
  {
    id: "light-002",
    name: "仓库照明灯",
    type: "light",
    model: "LED工业照明",
    ip: "192.168.1.206",
    status: "warning",
    commStatus: "offline",
    switch: "off",
    protocol: "Modbus RTU",
    firmware: "V1.2.0",
    wiring: "接线松动",
    indicator: "指示灯熄灭",
    lastSeen: "2026-09-18 09:15:47",
    uptime: "—"
  },
  {
    id: "sensor-001",
    name: "温湿度传感器",
    type: "sensor",
    model: "DHT11温湿度传感器",
    ip: "192.168.1.205",
    status: "running",
    commStatus: "online",
    protocol: "Modbus RTU",
    firmware: "V1.0.6",
    wiring: "接线正常",
    indicator: "指示灯常亮",
    lastSeen: "2026-09-18 10:42:15",
    uptime: "3天 06:14",
    temp: 25.3,
    humidity: 60,
    light: 850
  }
];

// 设备常见别称 → 设备 id：兼容口头叫法与历史命名
const deviceAliases: Record<string, string> = {
  堆料电机: "motor-002",
  推料电机: "motor-002",
  环形电机: "motor-001",
  环形线: "motor-001",
  散热风扇: "fan-001",
  车间灯: "light-001",
  仓库灯: "light-002",
  温湿度: "sensor-001"
};

// 现场画面分析结论文案
const visionAnalysis = {
  type: "温湿度采集与控制模块",
  conclusions: [
    "接线状态：电源、采集端子和温湿度探头已连接",
    "指示灯状态：绿色电源/运行指示灯亮起，无红色告警灯",
    "运行状态：设备已供电，采集模块处于正常运行状态"
  ]
};

/* ============================ 工具函数 ============================ */

const getStatusText = (status: RunStatus): string => {
  const texts: Record<RunStatus, string> = {
    running: "运行中",
    stopped: "已停止",
    off: "已关闭",
    warning: "故障"
  };
  return texts[status] || "未知";
};

const getModeText = (mode?: WorkMode): string => {
  if (!mode) return "—";
  const texts: Record<WorkMode, string> = {
    manual: "手动",
    auto: "自动",
    high: "高速",
    low: "低速"
  };
  return texts[mode] || "—";
};

const getDeviceTypeLabel = (type: DeviceType): string => deviceTypes[type]?.label || "未知类型";
const getDeviceIcon = (type: DeviceType): React.ElementType => deviceTypes[type]?.Icon || Box;

// 在文本中解析目标设备：优先匹配正式名称，其次匹配常见别称
const matchDeviceInText = (text: string, list: Device[]): Device | undefined => {
  const named = list.find((d) => text.includes(d.name));
  if (named) return named;
  const alias = Object.keys(deviceAliases).find((key) => text.includes(key));
  return alias ? list.find((d) => d.id === deviceAliases[alias]) : undefined;
};

// 徽章样式
type BadgeTone = "ok" | "warn" | "err" | "mute";
const badgeCls = (tone: BadgeTone): string => {
  const map: Record<BadgeTone, string> = {
    ok: "bg-emerald-50 text-emerald-600",
    warn: "bg-amber-50 text-amber-600",
    err: "bg-red-50 text-red-600",
    mute: "bg-zinc-100 text-zinc-400"
  };
  return `inline-block px-2 py-[1px] rounded-full text-[11px] font-bold whitespace-nowrap ${map[tone]}`;
};

const statusTone = (device: Device): BadgeTone =>
  device.status === "running" ? "ok" : device.status === "warning" ? "err" : device.status === "off" ? "mute" : "warn";

const StatusBadge: React.FC<{ device: Device }> = ({ device }) => (
  <span className={badgeCls(statusTone(device))}>{getStatusText(device.status)}</span>
);

const CommBadge: React.FC<{ device: Device }> = ({ device }) => {
  const online = device.commStatus === "online";
  return <span className={badgeCls(online ? "ok" : "err")}>{online ? "通信正常" : "通信中断"}</span>;
};

const OnlineBadge: React.FC<{ device: Device }> = ({ device }) => {
  const online = device.commStatus === "online";
  return <span className={badgeCls(online ? "ok" : "err")}>{online ? "在线" : "离线"}</span>;
};

// 设备图标：带渐变底色的圆角块
const DeviceIconBlock: React.FC<{ type: DeviceType; size?: number }> = ({ type, size = 48 }) => {
  const Icon = getDeviceIcon(type);
  const gradient: Record<DeviceType, string> = {
    gateway: "from-blue-500 to-blue-600",
    motor: "from-amber-500 to-amber-600",
    fan: "from-emerald-500 to-emerald-600",
    light: "from-violet-500 to-violet-600",
    sensor: "from-pink-500 to-pink-600"
  };
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-gradient-to-br ${gradient[type]} text-white shrink-0`}
      style={{ width: size, height: size }}
    >
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
};

/* ============================ 卡片渲染片段 ============================ */

const MsgHead: React.FC<{ icon: React.ElementType; title: string; tag?: string }> = ({ icon: Icon, title, tag }) => (
  <div className="flex items-center justify-between gap-2 mb-2">
    <span className="flex items-center gap-1.5 text-[13px] font-black text-zinc-900">
      <Icon className="w-3.5 h-3.5 text-[#10A66A] shrink-0" />
      {title}
    </span>
    {tag && <span className="text-[10px] font-bold text-zinc-400 whitespace-nowrap">{tag}</span>}
  </div>
);

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-4 last:mb-0">
    <div className="text-[12px] font-black text-zinc-800 pb-1 mb-2 border-b border-zinc-200">{title}</div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0.5">{children}</div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: React.ReactNode; tone?: "ok" | "warn" | "err" }> = ({ label, value, tone }) => {
  const toneCls = tone === "ok" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : tone === "err" ? "text-red-600" : "text-zinc-800";
  return (
    <div className="flex justify-between gap-2 text-[12px] py-1 border-b border-dashed border-zinc-200">
      <span className="text-zinc-400 whitespace-nowrap">{label}</span>
      <span className={`font-bold text-right ${toneCls}`}>{value}</span>
    </div>
  );
};

/* ============================ 摄像头取景（读取视频） ============================ */

// 模拟摄像头画面：取景框内播放该视频，拍摄时截取视频最后一帧作为识别输入图
const CAMERA_VIDEO_SRC = "/images/camera-preview.mp4";
// 等待视频跳转到片尾的最长时间，超时则直接截取当前帧
const CAMERA_LAST_FRAME_WAIT = 1500;
// 「正在分析…」提示到分析结论之间的间隔，模拟真实图像处理耗时
const VISION_ANALYZE_DELAY = 5500;
// 语音输入首次点击固定识别为该指令，保证演示结果稳定
const FIRST_VOICE_COMMAND = "打开车间照明灯";
// 回复节奏：查询类先给「正在检索」提示，控制类先给「正在下发」提示，避免秒回
const QUERY_THINKING_DELAY = 2400;
const COMMAND_EXECUTE_DELAY = 1800;

/* ============================ 主组件 ============================ */

export default function HardwareAgentModule({ session }: { session?: UserSession }) {
  /* ---------- 状态 ---------- */
  const [devices, setDevices] = useState<Device[]>(() => initialDevices.map((d) => ({ ...d })));
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("motor-001");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>("--");
  const [toast, setToast] = useState<{ msg: string; tone: "success" | "info" | "error" } | null>(null);
  const [visionExtra, setVisionExtra] = useState<{ co2: number; relayOn: boolean; fanSpeed: number }>({
    co2: 620,
    relayOn: false,
    fanSpeed: 0
  });
  const [anomalyLog, setAnomalyLog] = useState<AnomalyRecord[]>([]);

  // 联动控制弹窗
  const [linkageOpen, setLinkageOpen] = useState<boolean>(false);
  const [linkageSelected, setLinkageSelected] = useState<string[]>([]);
  const [linkageCommand, setLinkageCommand] = useState<string>("启动");

  // 摄像头取景框弹窗
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);

  /* ---------- 引用 ---------- */
  const msgIdRef = useRef<number>(0);
  const anomalyIdRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const toastTimerRef = useRef<number | null>(null);
  const speechWarnedRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  // 语音输入点击次数：首次点击固定识别为 FIRST_VOICE_COMMAND
  const voiceClickCountRef = useRef<number>(0);

  const currentDevice = devices.find((d) => d.id === currentDeviceId) || devices[0];
  const sensorDevice = devices.find((d) => d.type === "sensor");

  /* ---------- 定时器统一调度与卸载清理 ---------- */
  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // 取景框打开时从头播放模拟摄像画面，关闭时暂停
  useEffect(() => {
    if (!cameraOpen) return;
    const video = cameraVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
    return () => video.pause();
  }, [cameraOpen]);

  /* ---------- Toast ---------- */
  const showToast = (msg: string, tone: "success" | "info" | "error" = "success") => {
    setToast({ msg, tone });
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3000);
  };

  /* ---------- 语音播报 ---------- */
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "zh-CN";
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
        return;
      } catch {
        /* 忽略播报异常，走文字降级 */
      }
    }
    if (!speechWarnedRef.current) {
      speechWarnedRef.current = true;
      showToast("当前浏览器不支持语音播报，结果已以文字呈现", "info");
    }
  };

  /* ---------- 对话消息 ---------- */
  const addChatMessage = (role: MessageRole, content: React.ReactNode) => {
    const id = ++msgIdRef.current;
    setMessages((prev) => [...prev, { id, role, time: new Date().toLocaleTimeString(), content }]);
    return id;
  };

  // 原地更新某条消息：把占位提示替换为最终结果，避免 loading 一直停留
  const updateChatMessage = (id: number, role: MessageRole, content: React.ReactNode) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, role, content } : m)));
  };

  // 统一回复节奏：先给「处理中」提示，延迟后原地替换为结果并同步语音播报，避免秒回
  const replyWithThinking = (
    thinking: string,
    build: () => { content: React.ReactNode; speech?: string },
    delay: number = QUERY_THINKING_DELAY
  ) => {
    const pendingId = addChatMessage(
      "system",
      <span className="inline-flex items-center gap-1.5">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {thinking}
      </span>
    );
    schedule(() => {
      const { content, speech } = build();
      updateChatMessage(pendingId, "rich", content);
      if (speech) speakText(speech);
    }, delay);
  };

  // 初始欢迎消息
  useEffect(() => {
    setMessages([
      {
        id: ++msgIdRef.current,
        role: "system",
        time: "系统初始化",
        content: (
          <div>
            智能体已连接网关 <strong className="text-[#10A66A]">gw-001</strong>，已纳管{" "}
            <strong className="text-[#10A66A]">7</strong> 台设备。
            <br />
            你可以直接输入文字查询或控制所有设备，例如「查询所有设备状态」「统计各类设备数量」「打开车间照明灯」；也可以点击下方摄像按钮开启摄像头，拍摄现场设备并给出图像分析结论。
          </div>
        )
      }
    ]);
  }, []);

  // 消息自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  /* ---------- 设备总览统计 ---------- */
  const getDeviceOverviewStats = () => {
    const total = devices.length;
    const onlineCount = devices.filter((d) => d.commStatus === "online").length;
    const runningCount = devices.filter((d) => d.status === "running").length;
    const coveredTypes = (Object.keys(deviceTypes) as DeviceType[]).filter((t) => devices.some((d) => d.type === t));
    return { total, onlineCount, offlineCount: total - onlineCount, runningCount, coveredTypes };
  };

  // 全部设备统一管理卡片：自然语言总结 + 分类统计 + 设备明细表
  const renderDeviceOverviewCard = (list?: Device[], title?: string) => {
    const target = list && list.length ? list : devices;
    const s = getDeviceOverviewStats();
    const typeChips = s.coveredTypes.map((t) => {
      const count = devices.filter((d) => d.type === t).length;
      const Icon = getDeviceIcon(t);
      return (
        <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 text-zinc-500 rounded-full text-[10px] font-bold whitespace-nowrap">
          <Icon className="w-3 h-3" />
          {deviceTypes[t].label} {count}
        </span>
      );
    });

    return (
      <div className="w-full">
        <MsgHead icon={BarChart3} title={title || "网关设备统一管理与状态查询"} tag={`共 ${target.length} 台`} />
        <div className="text-[12px] text-zinc-500 leading-7 mb-2">
          已接入网关 <strong className="text-[#10A66A]">gw-001</strong> 的设备共{" "}
          <strong className="text-[#10A66A]">{s.total}</strong> 台，覆盖{" "}
          <strong className="text-[#10A66A]">{s.coveredTypes.length}</strong> 类设备（
          {s.coveredTypes.map((t) => deviceTypes[t].label).join("、")}）。当前在线 {s.onlineCount} 台，运行中 {s.runningCount} 台
          {s.offlineCount ? (
            <>
              ，其中 <span className="text-red-500 font-bold">{s.offlineCount} 台通信中断/离线</span>，建议优先排查。
            </>
          ) : (
            "，全部通信正常。"
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="flex items-baseline gap-1.5 px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-[10px] text-zinc-400 font-bold">
            <b className="text-[15px] font-black text-zinc-900">{s.total}</b>接入设备总数
          </span>
          <span className="flex items-baseline gap-1.5 px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-[10px] text-zinc-400 font-bold">
            <b className="text-[15px] font-black text-emerald-600">{s.onlineCount}</b>在线设备
          </span>
          <span className="flex items-baseline gap-1.5 px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-[10px] text-zinc-400 font-bold">
            <b className="text-[15px] font-black text-red-600">{s.offlineCount}</b>离线设备
          </span>
          <span className="flex items-baseline gap-1.5 px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-[10px] text-zinc-400 font-bold">
            <b className="text-[15px] font-black text-zinc-900">{s.runningCount}</b>运行中设备
          </span>
          {typeChips}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr>
                {["设备名称", "设备类型", "设备型号", "运行状态", "通信状态", "在线情况"].map((h) => (
                  <th key={h} className="text-left px-2 py-1.5 text-zinc-400 font-bold whitespace-nowrap border-b border-zinc-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {target.map((d) => {
                const Icon = getDeviceIcon(d.type);
                return (
                  <tr key={d.id}>
                    <td className="px-2 py-1.5 text-zinc-700 border-b border-zinc-100">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        {d.name}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-zinc-600 border-b border-zinc-100">{getDeviceTypeLabel(d.type)}</td>
                    <td className="px-2 py-1.5 text-zinc-600 border-b border-zinc-100">{d.model}</td>
                    <td className="px-2 py-1.5 border-b border-zinc-100">
                      <StatusBadge device={d} />
                    </td>
                    <td className="px-2 py-1.5 border-b border-zinc-100">
                      <CommBadge device={d} />
                    </td>
                    <td className="px-2 py-1.5 border-b border-zinc-100">
                      <OnlineBadge device={d} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 设备类型统计卡片
  const renderDeviceTypeStatCard = () => {
    const s = getDeviceOverviewStats();
    return (
      <div className="w-full">
        <MsgHead icon={FolderTree} title="设备类型统计" tag={`共 ${s.coveredTypes.length} 类`} />
        <div className="text-[12px] text-zinc-500 leading-7 mb-2">
          网关下共接入 <strong className="text-[#10A66A]">{s.total}</strong> 台设备，按类型划分为{" "}
          <strong className="text-[#10A66A]">{s.coveredTypes.length}</strong> 类，已覆盖灯光类、电机类、风扇类、传感器类等设备类型。
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr>
                {["设备类型", "接入数量", "在线数量", "设备清单"].map((h) => (
                  <th key={h} className="text-left px-2 py-1.5 text-zinc-400 font-bold whitespace-nowrap border-b border-zinc-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.coveredTypes.map((t) => {
                const list = devices.filter((d) => d.type === t);
                const online = list.filter((d) => d.commStatus === "online").length;
                const Icon = getDeviceIcon(t);
                return (
                  <tr key={t}>
                    <td className="px-2 py-1.5 text-zinc-700 border-b border-zinc-100">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        {deviceTypes[t].label}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-zinc-600 border-b border-zinc-100">{list.length} 台</td>
                    <td className="px-2 py-1.5 text-zinc-600 border-b border-zinc-100">{online} 台</td>
                    <td className="px-2 py-1.5 text-zinc-600 border-b border-zinc-100">{list.map((d) => d.name).join("、")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 离线 / 通信中断设备排查卡片
  const renderOfflineCard = () => {
    const offline = devices.filter((d) => d.commStatus !== "online");
    if (!offline.length) {
      return (
        <div className="w-full">
          <MsgHead icon={WifiOff} title="离线设备排查" />
          <div className="text-[12px] text-zinc-500 leading-7">当前网关下所有设备通信均正常，无离线设备。</div>
        </div>
      );
    }
    return (
      <div className="w-full">
        <MsgHead icon={WifiOff} title="离线设备排查" tag={`${offline.length} 台异常`} />
        <div className="text-[12px] text-zinc-500 leading-7 mb-2">
          检测到{" "}
          <span className="text-red-500 font-bold">
            {offline.length} 台设备通信中断
          </span>
          ，最近一次通信时间见下表，建议检查供电与接线状态。
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr>
                {["设备名称", "设备类型", "IP 地址", "通信状态", "在线情况", "最后通信时间"].map((h) => (
                  <th key={h} className="text-left px-2 py-1.5 text-zinc-400 font-bold whitespace-nowrap border-b border-zinc-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {offline.map((d) => {
                const Icon = getDeviceIcon(d.type);
                return (
                  <tr key={d.id}>
                    <td className="px-2 py-1.5 text-zinc-700 border-b border-zinc-100">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        {d.name}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-zinc-600 border-b border-zinc-100">{getDeviceTypeLabel(d.type)}</td>
                    <td className="px-2 py-1.5 text-zinc-600 border-b border-zinc-100">{d.ip}</td>
                    <td className="px-2 py-1.5 border-b border-zinc-100">
                      <span className={badgeCls("err")}>通信中断</span>
                    </td>
                    <td className="px-2 py-1.5 border-b border-zinc-100">
                      <span className={badgeCls("err")}>离线</span>
                    </td>
                    <td className="px-2 py-1.5 text-zinc-600 border-b border-zinc-100">{d.lastSeen}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 单台设备详情卡片：基础信息 / 运行状态 / 通信状态与在线情况（+ 传感器采集数据）
  const renderDeviceDetailCard = (device: Device) => {
    const online = device.commStatus === "online";
    const onlineTone: "ok" | "err" = online ? "ok" : "err";
    const Icon = getDeviceIcon(device.type);
    return (
      <div className="w-full">
        <MsgHead icon={ClipboardList} title={device.name} tag={device.id} />
        <div className="flex items-center gap-1.5 text-[12px] text-zinc-500 leading-7 mb-3">
          <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>
            该设备属于 <strong className="text-[#10A66A]">{getDeviceTypeLabel(device.type)}</strong>，当前运行状态{" "}
            <strong className="text-[#10A66A]">{getStatusText(device.status)}</strong>，通信{online ? "正常" : "中断"}，设备
            {online ? "在线" : "离线"}。
          </span>
        </div>

        <InfoSection title="基础信息">
          <InfoRow label="设备 ID" value={device.id} />
          <InfoRow label="设备名称" value={device.name} />
          <InfoRow label="设备类型" value={getDeviceTypeLabel(device.type)} />
          <InfoRow label="设备型号" value={device.model} />
          <InfoRow label="IP 地址" value={device.ip} />
          <InfoRow label="固件版本" value={device.firmware} />
          <InfoRow label="接入网关" value="gw-001 · 研华工业通讯网关" />
          <InfoRow label="通信协议" value={device.protocol} />
        </InfoSection>

        <InfoSection title="运行状态">
          <InfoRow
            label="运行状态"
            value={getStatusText(device.status)}
            tone={device.status === "running" ? "ok" : device.status === "warning" ? "err" : undefined}
          />
          <InfoRow label="开关状态" value={device.switch === "on" ? "开启" : device.switch === "off" ? "关闭" : "—"} />
          <InfoRow label="工作模式" value={getModeText(device.mode)} />
          <InfoRow label="接线状态" value={device.wiring} tone={device.wiring === "接线正常" ? "ok" : "err"} />
        </InfoSection>

        <InfoSection title="通信状态与在线情况">
          <InfoRow label="通信状态" value={online ? "通信正常" : "通信中断"} tone={onlineTone} />
          <InfoRow label="在线情况" value={online ? "在线" : "离线"} tone={onlineTone} />
          <InfoRow label="指示灯状态" value={device.indicator} tone={device.indicator === "指示灯常亮" ? "ok" : "warn"} />
          <InfoRow label="最后通信时间" value={device.lastSeen} />
          <InfoRow label="在线时长" value={device.uptime} />
        </InfoSection>

        {device.type === "sensor" && (
          <InfoSection title="采集数据">
            <InfoRow label="温度" value={`${Number(device.temp).toFixed(1)} °C`} />
            <InfoRow label="湿度" value={`${device.humidity} %`} />
            <InfoRow label="光照度" value={`${Math.round(Number(device.light))} lux`} />
          </InfoSection>
        )}
      </div>
    );
  };

  /* ---------- 设备切换 ---------- */
  const selectControlDevice = (deviceId: string) => {
    const target = devices.find((d) => d.id === deviceId);
    if (!target) return;
    setCurrentDeviceId(deviceId);
    addChatMessage("system", `已切换到设备: ${target.name}`);
  };

  /* ---------- 意图解析 ---------- */
  const handleUserMessage = (text: string) => {
    // 1) 现场图像分析意图
    if (/图像|图片|照片|摄像|视觉|分析|拍照|画面/.test(text)) {
      runImageAnalysis();
      return;
    }
    // 2) 设备统一管理 / 状态查询意图
    if (matchDeviceQuery(text)) return;
    // 3) 设备控制意图
    executeCommand(text);
  };

  // 设备管理查询：返回 true 表示已在对话框中给出结果
  const matchDeviceQuery = (text: string): boolean => {
    const isTypeStat = /统计|分布|分类|几类|多少类/.test(text);
    const isOffline = /离线|掉线|中断|异常|故障设备/.test(text);
    const isQuery = /查询|查看|列出|所有|全部|有哪些|哪些|状态|情况|信息|总览|几台|多少|在线|通信|详情/.test(text);

    if (!isQuery && !isTypeStat && !isOffline) return false;

    // 命中具体设备名称 / 别称 → 只回答该台设备的状态详情
    const named = matchDeviceInText(text, devices);
    if (named) {
      replyWithThinking(`正在检索 ${named.name} 的实时状态...`, () => ({
        content: renderDeviceDetailCard(named),
        speech: `已查询到 ${named.name}，当前状态${getStatusText(named.status)}，${named.commStatus === "online" ? "在线" : "离线"}`
      }));
      return true;
    }

    // 类型统计
    if (isTypeStat) {
      replyWithThinking("正在统计各类设备数量...", () => ({
        content: renderDeviceTypeStatCard(),
        speech: `网关下共接入${devices.length}台设备，共${getDeviceOverviewStats().coveredTypes.length}类`
      }));
      return true;
    }

    // 离线设备排查
    if (isOffline) {
      const offline = devices.filter((d) => d.commStatus !== "online");
      replyWithThinking("正在排查离线设备...", () => ({
        content: renderOfflineCard(),
        speech: offline.length ? `检测到${offline.length}台设备通信中断：${offline.map((d) => d.name).join("、")}` : "所有设备通信正常"
      }));
      return true;
    }

    // 指定类型：查询某一类设备
    const typeHit = (Object.keys(deviceTypes) as DeviceType[]).find((t) => {
      const word = deviceTypes[t].label.replace("类", "");
      return text.includes(word) || text.includes(deviceTypes[t].label);
    });
    if (typeHit && /类|设备/.test(text)) {
      const list = devices.filter((d) => d.type === typeHit);
      replyWithThinking(`正在检索${deviceTypes[typeHit].label}设备状态...`, () => ({
        content: renderDeviceOverviewCard(list, `${deviceTypes[typeHit].label}设备状态查询`),
        speech: `${deviceTypes[typeHit].label}共${list.length}台设备`
      }));
      return true;
    }

    // 默认：全部设备统一管理
    replyWithThinking("正在汇总全部设备运行状态...", () => {
      const s = getDeviceOverviewStats();
      return {
        content: renderDeviceOverviewCard(),
        speech: `网关下共接入${s.total}台设备，在线${s.onlineCount}台，运行中${s.runningCount}台`
      };
    });
    return true;
  };

  /* ---------- 设备控制执行 ---------- */
  const executeCommand = (command: string) => {
    let result = "";
    let success = true;
    let patch: Partial<Device> = {};

    // 统一管理：指令中点名了某台设备（含别称）时，自动把控制对象切到该设备
    const target = matchDeviceInText(command, devices);
    const activeId = target ? target.id : currentDeviceId;
    if (target && target.id !== currentDeviceId) setCurrentDeviceId(target.id);
    const dev = devices.find((d) => d.id === activeId) || currentDevice;

    // 启停控制
    if (command.includes("启动") || command.includes("开始")) {
      patch = { status: "running" };
      result = `${dev.name}已成功启动`;
      success = true;
    } else if (command.includes("停止") || command.includes("暂停")) {
      patch = { status: "stopped" };
      result = `${dev.name}已停止运行`;
      success = true;
    }
    // 开关控制
    else if (command.includes("打开") || command.includes("开启")) {
      patch = { switch: "on", status: "running" };
      result = `${dev.name}已打开`;
      success = true;
    } else if (command.includes("关闭") || command.includes("关掉")) {
      patch = { switch: "off", status: "off" };
      result = `${dev.name}已关闭`;
      success = true;
    }
    // 模式切换
    else if (command.includes("高速")) {
      patch = { mode: "high" };
      result = `${dev.name}已切换为高速模式`;
      success = true;
    } else if (command.includes("低速")) {
      patch = { mode: "low" };
      result = `${dev.name}已切换为低速模式`;
      success = true;
    } else if (command.includes("自动")) {
      patch = { mode: "auto" };
      result = `${dev.name}已切换为自动模式`;
      success = true;
    }
    // 状态查询
    else if (command.includes("查询") || command.includes("状态")) {
      result = `${dev.name}当前状态: ${getStatusText(dev.status)}, 开关: ${dev.switch === "on" ? "开启" : "关闭"}, 模式: ${
        dev.mode || "手动"
      }`;
    } else if (command.includes("传感器") || command.includes("数据")) {
      if (dev.temp) {
        result = `传感器数据: 温度 ${Number(dev.temp).toFixed(1)}°C, 湿度 ${dev.humidity}%, 光照 ${Math.round(
          Number(dev.light)
        )}lux`;
      } else {
        result = "当前设备无传感器数据";
      }
    } else {
      // 未识别到具体动作：仅切换设备，提示补充操作
      result = `已定位到设备「${dev.name}」，当前${getStatusText(dev.status)}，请告知需要执行的操作`;
      success = false;
    }

    if (Object.keys(patch).length > 0) {
      setDevices((prev) => prev.map((d) => (d.id === activeId ? { ...d, ...patch } : d)));
    }

    // 先提示指令下发中，延迟后原地替换为执行结果（状态面板随 state 自动刷新）
    const pendingId = addChatMessage(
      "system",
      <span className="inline-flex items-center gap-1.5">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        正在下发指令至 {dev.name}...
      </span>
    );

    schedule(() => {
      updateChatMessage(pendingId, success ? "success" : "system", result);
      speakText(result);
    }, COMMAND_EXECUTE_DELAY);
  };

  /* ---------- 发送消息 ---------- */
  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    addChatMessage("user", text);
    schedule(() => handleUserMessage(text), 400);
  };

  const handleInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") sendMessage();
  };

  // 快捷指令：模拟用户输入并走同一套意图解析
  const sendQuickMessage = (text: string) => {
    setInputValue("");
    addChatMessage("user", text);
    schedule(() => handleUserMessage(text), 400);
  };

  /* ---------- 摄像头取景框：点击图像按钮 → 播放视频 → 拍摄最后一帧 → 图像分析 ---------- */
  const openCameraModal = () => setCameraOpen(true);
  const closeCameraModal = () => setCameraOpen(false);

  // 用户点击图像按钮：开启摄像头取景框（读取视频）
  const sendImageMessage = () => openCameraModal();

  // 拍摄：把视频跳到片尾，截取最后一帧作为现场画面
  const capturePhoto = () => {
    const video = cameraVideoRef.current;
    if (!video) return;

    // 截帧：视频最后一帧 → canvas → 图片气泡
    const grabFrame = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const shot = canvas.toDataURL("image/jpeg", 0.92);

      closeCameraModal();

      addChatMessage(
        "img",
        <img className="block w-[320px] max-w-full aspect-video object-contain bg-black rounded-lg" src={shot} alt="摄像头拍摄画面" />
      );
      // 拍摄完成后自动进入图像分析，输出分析结论
      schedule(() => runImageAnalysis(), 400);
    };

    const duration = video.duration;
    // 视频元数据未就绪时退化为截取当前帧
    if (!Number.isFinite(duration) || duration <= 0) {
      grabFrame();
      return;
    }

    let done = false;
    let waitTimer: number | null = null;
    const finish = () => {
      if (done) return;
      done = true;
      if (waitTimer !== null) window.clearTimeout(waitTimer);
      video.removeEventListener("seeked", finish);
      grabFrame();
    };

    waitTimer = window.setTimeout(finish, CAMERA_LAST_FRAME_WAIT);
    video.addEventListener("seeked", finish);
    video.pause();
    video.currentTime = Math.max(0, duration - 0.05);
  };

  /* ---------- 现场图像分析：拍摄后输出简洁的分析结论 ---------- */
  const renderImageConclusion = () => {
    const a = visionAnalysis;
    return (
      <div className="w-full">
        <MsgHead icon={Search} title="现场图像分析结论" tag="摄像通道 CH-01 · 海康威视 DS-2CD3T46WD" />
        <div className="text-[12px] leading-7 text-zinc-600">
          <div>
            设备类型：<strong className="text-[#10A66A]">{a.type}</strong>
          </div>
          {a.conclusions.map((item) => (
            <div key={item}>- {item}</div>
          ))}
        </div>
      </div>
    );
  };

  // 图像分析流程：先显示分析中，再原地替换为分析结论
  const runImageAnalysis = () => {
    const pendingId = addChatMessage(
      "system",
      <span className="inline-flex items-center gap-1.5">
        <Search className="w-3.5 h-3.5 animate-pulse" />
        正在分析拍摄的现场画面...
      </span>
    );

    schedule(() => {
      // 结论就绪：原地替换掉「正在分析…」气泡
      updateChatMessage(pendingId, "rich", renderImageConclusion());
      speakText(`图像分析结论：设备类型 ${visionAnalysis.type}，${visionAnalysis.conclusions.join("；")}`);
    }, VISION_ANALYZE_DELAY);
  };

  /* ---------- 语音输入模拟 ---------- */
  const startVoiceInput = () => {
    if (isRecording) return;
    setIsRecording(true);
    addChatMessage("system", "正在聆听...");

    schedule(() => {
      const mockVoiceCommands = [
        "启动环形线电机",
        "打开车间照明灯",
        "切换散热风扇为高速模式",
        "查询设备状态",
        "关闭车间照明灯"
      ];
      // 首次点击语音输入固定识别为「打开车间照明灯」，之后随机
      const isFirstClick = voiceClickCountRef.current === 0;
      voiceClickCountRef.current += 1;
      const recognizedText = isFirstClick
        ? FIRST_VOICE_COMMAND
        : mockVoiceCommands[Math.floor(Math.random() * mockVoiceCommands.length)];

      addChatMessage(
        "user",
        <span className="inline-flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5" />
          语音识别: "{recognizedText}"
        </span>
      );
      setIsRecording(false);

      // 语音输入停止后自动执行指令
      schedule(() => handleUserMessage(recognizedText), 500);
    }, 1500);
  };

  /* ---------- 联动控制 ---------- */
  const showLinkageModal = () => {
    const controllable = devices.filter((d) => d.type !== "gateway" && d.type !== "sensor");
    const preset = controllable.some((d) => d.id === currentDevice.id) ? [currentDevice.id] : [];
    setLinkageSelected(preset);
    setLinkageCommand("启动");
    setLinkageOpen(true);
  };

  const closeLinkageModal = () => setLinkageOpen(false);

  const toggleLinkageDevice = (deviceId: string) => {
    setLinkageSelected((prev) => (prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]));
  };

  const executeLinkage = () => {
    if (linkageSelected.length === 0) {
      showToast("请选择至少一个设备", "error");
      return;
    }
    const command = linkageCommand;
    const deviceIds = [...linkageSelected];

    addChatMessage("user", `联动控制: ${command} ${deviceIds.length} 个设备`);

    setDevices((prev) =>
      prev.map((d) => {
        if (!deviceIds.includes(d.id)) return d;
        if (command === "启动") return { ...d, status: "running" };
        if (command === "停止") return { ...d, status: "stopped" };
        if (command === "打开") return { ...d, switch: "on", status: "running" };
        if (command === "关闭") return { ...d, switch: "off", status: "off" };
        return d;
      })
    );

    // 联动后同步刷新对话框中的设备状态卡片（基于指令推算出的最新状态）
    const linkedDevices = devices
      .filter((d) => deviceIds.includes(d.id))
      .map((d) => {
        if (command === "启动") return { ...d, status: "running" as RunStatus };
        if (command === "停止") return { ...d, status: "stopped" as RunStatus };
        if (command === "打开") return { ...d, switch: "on" as const, status: "running" as RunStatus };
        if (command === "关闭") return { ...d, switch: "off" as const, status: "off" as RunStatus };
        return d;
      });

    schedule(() => {
      addChatMessage("success", `联动执行成功! ${deviceIds.length} 个设备已${command}`);
      addChatMessage("rich", renderDeviceOverviewCard(linkedDevices, "联动执行后的设备状态"));
      speakText(`联动执行成功，${deviceIds.length} 个设备已${command}`);
    }, 500);

    closeLinkageModal();
  };

  /* ---------- 传感器数据模拟 ---------- */
  useEffect(() => {
    const interval = window.setInterval(() => {
      setDevices((prev) =>
        prev.map((d) =>
          d.type === "sensor"
            ? {
                ...d,
                temp: 25 + Math.random() * 2,
                humidity: 55 + Math.random() * 10,
                light: 800 + Math.random() * 100
              }
            : d
        )
      );
      setVisionExtra({
        co2: 600 + Math.random() * 100,
        relayOn: Math.random() > 0.4,
        fanSpeed: Math.round(1200 + Math.random() * 300)
      });
    }, 2000);
    return () => window.clearInterval(interval);
  }, []);

  // 最后更新时间
  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString());
  }, [currentDeviceId, devices]);

  /* ---------- 面板派生值 ---------- */
  const statusValueCls = (() => {
    if (currentDevice.status === "running") return "text-emerald-600";
    if (currentDevice.status === "stopped") return "text-red-600";
    if (currentDevice.status === "warning") return "text-amber-600";
    return "text-zinc-800";
  })();

  const displayName = session?.realName || "魏同学";
  const displayMeta = session?.className || session?.department || "工业物联网实验室";
  const roleText = session?.role === "teacher" ? "教师" : session?.role === "admin" ? "管理员" : "学生";

  /* ---------- 指令库配置 ---------- */
  const commandGroups: Array<{ title: string; items: Array<{ label: string; Icon: React.ElementType; action: () => void }> }> = [
    {
      title: "启停控制",
      items: [
        { label: "启动设备", Icon: Play, action: () => executeCommand("启动设备") },
        { label: "停止设备", Icon: Square, action: () => executeCommand("停止设备") }
      ]
    },
    {
      title: "开关控制",
      items: [
        { label: "打开设备", Icon: Unlock, action: () => executeCommand("打开设备") },
        { label: "关闭设备", Icon: Lock, action: () => executeCommand("关闭设备") }
      ]
    },
    {
      title: "模式切换",
      items: [
        { label: "高速模式", Icon: Zap, action: () => executeCommand("切换高速模式") },
        { label: "低速模式", Icon: Gauge, action: () => executeCommand("切换低速模式") },
        { label: "自动模式", Icon: Bot, action: () => executeCommand("切换自动模式") }
      ]
    },
    {
      title: "设备统一管理",
      items: [
        { label: "查询全部设备", Icon: BarChart3, action: () => sendQuickMessage("查询所有设备状态") },
        { label: "设备类型统计", Icon: FolderTree, action: () => sendQuickMessage("统计各类设备数量") },
        { label: "单台设备查询", Icon: Search, action: () => sendQuickMessage("查询仓库照明灯详情") },
        { label: "离线设备排查", Icon: WifiOff, action: () => sendQuickMessage("有哪些设备离线") },
        { label: "传感器数据", Icon: Thermometer, action: () => executeCommand("查询传感器数据") }
      ]
    },
    {
      title: "图像分析",
      items: [{ label: "开启摄像头拍摄并分析", Icon: Camera, action: () => sendImageMessage() }]
    },
    {
      title: "联动控制",
      items: [{ label: "多设备联动", Icon: Link2, action: () => showLinkageModal() }]
    }
  ];

  const controllableDevices = devices.filter((d) => d.type !== "gateway" && d.type !== "sensor");

  /* ---------- 渲染 ---------- */
  return (
    <div className="p-6 max-w-[1600px] mx-auto flex flex-col gap-5 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in ${
            toast.tone === "success" ? "bg-[#10A66A] text-white" : "bg-black/80 text-white"
          }`}
        >
          {toast.tone === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : toast.tone === "error" ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <MessageSquare className="w-5 h-5" />
          )}
          <span className="text-sm font-bold tracking-wide">{toast.msg}</span>
        </div>
      )}

      {/* 页面标题 + 当前用户 */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-zinc-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#10A66A]" />
            智能体交互控制
          </h1>
          <p className="text-[11px] text-zinc-400 font-bold mt-1">
            文字/语音统一管理与查询网关下所有设备，支持输入图像进行识别与双重验证
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-zinc-900 font-black block text-sm">{displayName}</span>
            <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">
              {displayMeta} · {roleText}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#EAF8F1] flex items-center justify-center font-black text-[#10A66A] border-2 border-white shadow-sm">
            {displayName ? displayName.slice(0, 1) : <User className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* 三栏布局 */}
      <div className="grid grid-cols-1 xl:grid-cols-[210px_minmax(0,1fr)_300px] gap-4 xl:h-[calc(100vh-220px)] min-h-0">
        {/* 左侧：指令库 */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col h-[320px] xl:h-auto min-h-0">
          <div className="px-3 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-1.5 text-[13px] font-black text-zinc-900">
            <BookOpen className="w-4 h-4 text-[#10A66A]" />
            指令库
          </div>
          <div className="p-2 overflow-y-auto flex-1">
            {commandGroups.map((group) => (
              <div key={group.title} className="mb-2 last:mb-0">
                <div className="text-[10px] font-bold text-zinc-400 px-2 py-1 border-b border-zinc-100">{group.title}</div>
                {group.items.map((item) => {
                  const Icon = item.Icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[12px] text-zinc-600 hover:bg-[#EAF8F1] hover:text-[#10A66A] transition-colors cursor-pointer text-left"
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 中间：对话区 */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col h-[560px] xl:h-auto min-h-0">
          <div className="px-3 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[13px] font-black text-zinc-900">
              <MessageSquare className="w-4 h-4 text-[#10A66A]" />
              网关设备智能体
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 font-bold whitespace-nowrap">当前控制对象</span>
              <select
                value={currentDeviceId}
                onChange={(e) => selectControlDevice(e.target.value)}
                className="px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] text-zinc-600 outline-none focus:border-[#10A66A] cursor-pointer max-w-[150px]"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2">
            {messages.map((msg) => {
              if (msg.role === "rich") {
                return (
                  <div key={msg.id} className="w-full self-start bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-zinc-600">
                    {msg.content}
                    <div className="text-[10px] text-zinc-400 font-bold mt-2">{msg.time}</div>
                  </div>
                );
              }
              if (msg.role === "user" || msg.role === "img") {
                return (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] self-end px-3 py-2 rounded-xl text-[12px] bg-[#10A66A] text-white ${
                      msg.role === "img" ? "p-2" : ""
                    }`}
                  >
                    {msg.content}
                    <div className="text-[10px] text-white/70 font-bold mt-1">{msg.time}</div>
                  </div>
                );
              }
              if (msg.role === "success" || msg.role === "error") {
                return (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] self-start px-3 py-2 rounded-xl text-[12px] ${
                      msg.role === "success"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-300"
                        : "bg-red-50 text-red-600 border border-red-300"
                    }`}
                  >
                    {msg.content}
                    <div className="text-[10px] text-zinc-400 font-bold mt-1">{msg.time}</div>
                  </div>
                );
              }
              return (
                <div key={msg.id} className="max-w-[80%] self-start px-3 py-2 rounded-xl text-[12px] bg-zinc-50 text-zinc-600 border border-zinc-200">
                  {msg.content}
                  <div className="text-[10px] text-zinc-400 font-bold mt-1">{msg.time}</div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center gap-2">
            <button
              onClick={startVoiceInput}
              title="语音输入"
              className={`w-11 h-11 rounded-lg text-white flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isRecording ? "bg-red-500 animate-pulse" : "bg-[#10A66A] hover:scale-105"
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={sendImageMessage}
              title="开启摄像头拍摄识别"
              className="w-11 h-11 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyPress}
              placeholder="输入指令，如：查询所有设备状态 / 统计各类设备数量..."
              className="flex-1 px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[12px] text-zinc-700 outline-none focus:border-[#10A66A]"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2.5 bg-[#10A66A] hover:bg-[#0d8f5b] text-white rounded-lg text-[12px] font-black transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              发送
            </button>
          </div>
        </div>

        {/* 右侧：状态面板 */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col h-auto xl:h-auto min-h-0 overflow-y-auto">
          <div className="px-3 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-1.5 text-[13px] font-black text-zinc-900">
            <BarChart3 className="w-4 h-4 text-[#10A66A]" />
            设备状态
          </div>
          <div className="p-3">
            {[
              { label: "运行状态", value: getStatusText(currentDevice.status), cls: statusValueCls },
              { label: "开关状态", value: currentDevice.switch === "on" ? "开启" : "关闭", cls: "text-zinc-800" },
              { label: "工作模式", value: getModeText(currentDevice.mode), cls: "text-zinc-800" },
              {
                label: "通信状态",
                value: currentDevice.commStatus === "online" ? "在线" : "离线",
                cls: currentDevice.commStatus === "online" ? "text-emerald-600" : "text-red-600"
              },
              { label: "IP地址", value: currentDevice.ip, cls: "text-zinc-800" },
              { label: "最后更新", value: lastUpdate, cls: "text-zinc-800" }
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg mb-2 last:mb-0">
                <span className="text-[11px] text-zinc-400 font-bold">{row.label}</span>
                <span className={`text-[12px] font-black ${row.cls}`}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="px-3 py-3 bg-zinc-50 border-y border-zinc-200 flex items-center gap-1.5 text-[13px] font-black text-zinc-900">
            <Thermometer className="w-4 h-4 text-[#10A66A]" />
            传感器数据
          </div>
          <div className="p-3">
            {[
              {
                label: "温度",
                Icon: Thermometer,
                value: sensorDevice?.temp !== undefined ? `${Number(sensorDevice.temp).toFixed(1)}°C` : "—"
              },
              {
                label: "湿度",
                Icon: Droplets,
                value: sensorDevice?.humidity !== undefined ? `${sensorDevice.humidity.toFixed(0)}%` : "—"
              },
              {
                label: "光照",
                Icon: Sun,
                value: sensorDevice?.light !== undefined ? `${Math.round(Number(sensorDevice.light))}lux` : "—"
              },
              { label: "CO2", Icon: Wind, value: `${visionExtra.co2.toFixed(0)} ppm` },
              { label: "继电器", Icon: PlugZap, value: visionExtra.relayOn ? "开启" : "关闭" },
              { label: "风扇转速", Icon: Fan, value: `${visionExtra.fanSpeed} rpm` }
            ].map((row) => {
              const Icon = row.Icon;
              return (
                <div key={row.label} className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg mb-2 last:mb-0">
                  <span className="text-[11px] text-zinc-400 font-bold flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {row.label}
                  </span>
                  <span className="text-[12px] font-black text-zinc-800">{row.value}</span>
                </div>
              );
            })}
          </div>

          <div className="px-3 py-3 bg-zinc-50 border-y border-zinc-200 flex items-center gap-1.5 text-[13px] font-black text-zinc-900">
            <AlertTriangle className="w-4 h-4 text-[#10A66A]" />
            异常日志
          </div>
          <div className="p-3">
            {anomalyLog.length === 0 ? (
              <div className="text-[11px] text-zinc-400 font-bold text-center py-3">暂无异常记录</div>
            ) : (
              anomalyLog.map((log) => (
                <div key={log.id} className="p-2 bg-red-50 border border-red-200 rounded-lg mb-2 last:mb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-red-600">{log.device}</span>
                    <span className="text-[10px] font-bold text-zinc-400 whitespace-nowrap">{log.time}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 leading-4">{log.detail}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 摄像头取景框弹窗：点击图像按钮后开启，拍摄时截取视频最后一帧作为识别输入图 */}
      {cameraOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl p-5 w-[92%] max-w-[760px] shadow-2xl">
            <div className="text-lg font-black text-zinc-900 flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#10A66A]" />
                开启摄像头 · 拍摄现场设备
              </span>
              <button
                onClick={closeCameraModal}
                title="关闭取景框"
                className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-3">
              <video
                ref={cameraVideoRef}
                src={CAMERA_VIDEO_SRC}
                muted
                loop
                playsInline
                className="w-full h-full object-contain block"
              />
              {/* 取景框边角（模拟摄像画面取景标尺） */}
              <span className="absolute top-3 left-3 w-5 h-5 border-t-[3px] border-l-[3px] border-[#10A66A] rounded-tl-sm z-[1]" />
              <span className="absolute top-3 right-3 w-5 h-5 border-t-[3px] border-r-[3px] border-[#10A66A] rounded-tr-sm z-[1]" />
              <span className="absolute bottom-3 left-3 w-5 h-5 border-b-[3px] border-l-[3px] border-[#10A66A] rounded-bl-sm z-[1]" />
              <span className="absolute bottom-3 right-3 w-5 h-5 border-b-[3px] border-r-[3px] border-[#10A66A] rounded-br-sm z-[1]" />
              <div className="absolute left-3 bottom-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/55 rounded text-white text-[11px] font-bold z-[1]">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                REC 摄像头已开启，对准现场设备后拍摄
              </div>
            </div>

            <div className="flex gap-2 justify-end items-center">
              <span className="mr-auto text-[11px] text-zinc-400 font-bold">拍摄将截取视频最后一帧用于图像分析</span>
              <button
                onClick={closeCameraModal}
                className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[12px] font-bold transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={capturePhoto}
                className="px-4 py-2.5 rounded-lg bg-[#10A66A] hover:bg-[#0d8f5b] text-white text-[13px] font-black transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                拍摄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 联动控制弹窗 */}
      {linkageOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl p-5 w-[90%] max-w-[500px] shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="text-lg font-black text-zinc-900 flex items-center gap-2 mb-2">
              <Link2 className="w-5 h-5 text-[#10A66A]" />
              多设备联动控制
            </div>
            <p className="text-[12px] text-zinc-500 mb-3">选择需要联动的设备，执行统一指令</p>

            <div className="flex flex-col gap-2 mb-3">
              {controllableDevices.map((device) => (
                <label
                  key={device.id}
                  className="flex items-center gap-2 p-2 bg-zinc-50 rounded-lg cursor-pointer hover:bg-zinc-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={linkageSelected.includes(device.id)}
                    onChange={() => toggleLinkageDevice(device.id)}
                    className="w-4 h-4 accent-[#10A66A] cursor-pointer"
                  />
                  <DeviceIconBlock type={device.type} size={32} />
                  <span className="text-[12px] text-zinc-700 font-bold">{device.name}</span>
                  <span className="text-[10px] text-zinc-400 font-bold ml-auto">{getStatusText(device.status)}</span>
                </label>
              ))}
            </div>

            <div className="mb-3">
              <label className="text-[11px] text-zinc-500 font-bold">执行指令:</label>
              <select
                value={linkageCommand}
                onChange={(e) => setLinkageCommand(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[12px] text-zinc-600 outline-none focus:border-[#10A66A] cursor-pointer"
              >
                <option value="启动">启动所有设备</option>
                <option value="停止">停止所有设备</option>
                <option value="打开">打开所有设备</option>
                <option value="关闭">关闭所有设备</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={closeLinkageModal}
                className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[12px] font-bold transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={executeLinkage}
                className="px-4 py-2 rounded-lg bg-[#10A66A] hover:bg-[#0d8f5b] text-white text-[12px] font-black transition-colors cursor-pointer"
              >
                执行联动
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}