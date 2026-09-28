import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, ChevronLeft, Layers, Lock, EyeOff, ArrowUpToLine, ArrowDownToLine, 
  Copy, ClipboardPaste, FolderPlus, Play, X, Zap, Cloud, Database, Link as LinkIcon, Map, 
  Activity, Settings, PenTool, Image as ImageIcon, FileText, BarChart, Bell, 
  ToggleRight, SlidersHorizontal, Monitor, Cpu, Server, Save, Eye, Send, RefreshCw
} from 'lucide-react';

export function TwoDDesigner({ setView }: { setView: (v: string) => void }) {
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // Status
  const [simulationPlatformConnected, setSimulationPlatformConnected] = useState(true);
  const [propertySyncRecords, setPropertySyncRecords] = useState<any[]>([
    { time: "09:05:12", devName: "输送带设备", pName: "speed", val: 60, cName: "输送带状态组件", result: "成功", user: "参林奇" },
    { time: "09:05:01", devName: "控制阀门", pName: "openRate", val: 75, cName: "阀门开度组件", result: "成功", user: "参林奇" }
  ]);
  const [componentStateChangeRecords, setComponentStateChangeRecords] = useState<any[]>([
    { time: "09:05:12", devName: "输送带设备", propChange: "speed 0 → 60", compName: "输送带状态组件", stateChange: "停止 → 中速运行", result: "成功" },
    { time: "09:05:01", devName: "控制阀门", propChange: "openRate 0 → 75", compName: "阀门开度组件", stateChange: "关闭 → 打开", result: "成功" }
  ]);
  const [recentlySynced, setRecentlySynced] = useState("刚刚");

  const [leftTab, setLeftTab] = useState<"layers" | "components">("layers");
  const [rightTab, setRightTab] = useState<"devices" | "mapping" | "preview">("mapping");
  const [bottomTab, setBottomTab] = useState<"syncRecords" | "changeRecords">("syncRecords");
  
  const [scale, setScale] = useState(0.6);

  // Initial Devices
  const initialDevices = [
    { id: "conveyor-01", name: "输送带设备", code: "CONVEYOR-01", online: true, properties: { speed: 60, running: true, load: 42 } },
    { id: "fan-01", name: "工业风机", code: "FAN-01", online: true, properties: { speed: 1200, temperature: 48, status: "运行中" } },
    { id: "valve-01", name: "控制阀门", code: "VALVE-01", online: true, properties: { openRate: 75, pressure: 0.36, status: "开启" } },
    { id: "pump-01", name: "水泵设备", code: "PUMP-01", online: true, properties: { running: true, pressure: 0.42, flow: 22 } },
    { id: "light-01", name: "警示灯", code: "LIGHT-01", online: true, properties: { alarm: false, lightStatus: "绿色常亮" } },
    { id: "robot-01", name: "机械臂", code: "ROBOT-01", online: true, properties: { action: "搬运中", axisAngle: 68, cycleCount: 128 } },
  ];
  const [simulationDeviceList, setSimulationDeviceList] = useState(initialDevices);

  // Active Device
  const [selectedDeviceId, setSelectedDeviceId] = useState("conveyor-01");

  // Canvas Components
  const [componentBindingList, setComponentBindingList] = useState([
    { cId: "comp-title", cName: "页面标题", dId: null, pName: null, type: "title" },
    { cId: "comp-conveyor", cName: "输送带状态组件", dId: "conveyor-01", pName: "speed", type: "conveyor" },
    { cId: "comp-fan", cName: "风机状态组件", dId: "fan-01", pName: "speed", type: "fan" },
    { cId: "comp-valve", cName: "阀门开度组件", dId: "valve-01", pName: "openRate", type: "valve" },
    { cId: "comp-pump", cName: "水泵状态组件", dId: "pump-01", pName: "running", type: "pump" },
    { cId: "comp-light", cName: "警示灯状态组件", dId: "light-01", pName: "alarm", type: "light" },
    { cId: "comp-robot", cName: "机械臂动作组件", dId: "robot-01", pName: "action", type: "robot" },
    { cId: "comp-flow", cName: "管道流量组件", dId: "pump-01", pName: "flow", type: "flow" }
  ]);
  const [selectedComponentId, setSelectedComponentId] = useState("comp-conveyor");

  // State calculations
  const getDevice = (id: string) => simulationDeviceList.find(d => d.id === id);
  const getPropVal = (dId: string, pName: string) => (getDevice(dId)?.properties as any)?.[pName];

  const getConveyorState = (speed: number) => {
    if (speed === 0) return { label: "停止", color: "text-zinc-500", border: "border-zinc-500/50", bg: "bg-zinc-900", bar: "bg-zinc-600", anim: "duration-0" };
    if (speed <= 50) return { label: "低速运行", color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-900/20", bar: "bg-emerald-500", anim: "animate-pulse duration-1000" };
    if (speed <= 80) return { label: "中速运行", color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-900/20", bar: "bg-emerald-400", anim: "animate-pulse duration-500" };
    return { label: "高速运行", color: "text-amber-400", border: "border-amber-500/50", bg: "bg-amber-900/20", bar: "bg-amber-400", anim: "animate-pulse duration-200" };
  };

  const getFanState = (speed: number) => {
    if (speed === 0) return { label: "停止", color: "text-zinc-500", border: "border-zinc-500/50", bg: "bg-zinc-900", iconStyle: "" };
    if (speed <= 800) return { label: "低速", color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-900/20", iconStyle: "animate-spin duration-1000" };
    if (speed <= 1200) return { label: "中速", color: "text-teal-400", border: "border-teal-500/50", bg: "bg-teal-900/20", iconStyle: "animate-spin duration-500" };
    return { label: "高速", color: "text-amber-400", border: "border-amber-500/50", bg: "bg-amber-900/20", iconStyle: "animate-spin duration-200" };
  };

  const getValveState = (rate: number) => {
    if (rate === 0) return { label: "关闭", color: "text-zinc-500", border: "border-zinc-500/50", bg: "bg-zinc-900", ring: "text-zinc-600" };
    if (rate <= 50) return { label: "半开", color: "text-amber-400", border: "border-amber-500/50", bg: "bg-amber-900/20", ring: "text-amber-500" };
    return { label: "打开", color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-900/20", ring: "text-emerald-500" };
  };

  const getPumpState = (running: boolean) => {
    if (running) return { label: "运行中", color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-900/20" };
    return { label: "停止", color: "text-zinc-500", border: "border-zinc-500/50", bg: "bg-zinc-900" };
  };

  const getLightState = (alarm: boolean) => {
    if (alarm) return { label: "报警", color: "text-red-500", border: "border-red-500/50", bg: "bg-red-900/20", blink: "animate-pulse" };
    return { label: "正常", color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-900/20", blink: "" };
  };

  const getRobotState = (action: string) => {
    if (action === "待机") return { label: "待机", color: "text-zinc-500", border: "border-zinc-500/50", bg: "bg-zinc-900", iconStyle: "" };
    if (action === "搬运中") return { label: "执行中", color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-900/20", iconStyle: "animate-bounce" };
    return { label: "复位中", color: "text-blue-400", border: "border-blue-500/50", bg: "bg-blue-900/20", iconStyle: "animate-pulse" };
  };
  
  const getFlowState = (flow: number) => {
    if (flow === 0) return { label: "无流量", color: "text-zinc-500", border: "border-zinc-500/50", bg: "bg-zinc-900" };
    if (flow <= 10) return { label: "低流量", color: "text-amber-400", border: "border-amber-500/50", bg: "bg-amber-900/20" };
    if (flow <= 30) return { label: "正常流量", color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-900/20" };
    return { label: "高流量", color: "text-red-400", border: "border-red-500/50", bg: "bg-red-900/20" };
  };

  const getComponentDisplayState = (cId: string, dId: string, pName: string, val: any) => {
    if (cId === "comp-conveyor") return getConveyorState(val).label;
    if (cId === "comp-fan") return getFanState(val).label;
    if (cId === "comp-valve") return getValveState(val).label;
    if (cId === "comp-pump") return getPumpState(val).label;
    if (cId === "comp-light") return getLightState(val).label;
    if (cId === "comp-robot") return getRobotState(val).label;
    if (cId === "comp-flow") return getFlowState(val).label;
    return val;
  };

  const changeDeviceProperty = (dId: string, pName: string, newValue: any) => {
    const dev = getDevice(dId);
    if (!dev) return;
    const oldVal = dev.properties[pName as keyof typeof dev.properties];
    if (oldVal === newValue) return;

    setSimulationDeviceList(prev => prev.map(d => {
      if (d.id === dId) {
        return { ...d, properties: { ...d.properties, [pName]: newValue } };
      }
      return d;
    }));

    // Find bindings
    const comp = componentBindingList.find(c => c.dId === dId && c.pName === pName);
    const timeStr = new Date().toLocaleTimeString();

    if (comp) {
      const oldState = getComponentDisplayState(comp.cId!, dId, pName, oldVal);
      const newState = getComponentDisplayState(comp.cId!, dId, pName, newValue);
      
      setComponentStateChangeRecords(prev => [{
        time: timeStr,
        devName: dev.name,
        propChange: `${pName} ${oldVal} → ${newValue}`,
        compName: comp.cName,
        stateChange: `${oldState} → ${newState}`,
        result: "成功"
      }, ...prev].slice(0, 50));
    }

    setPropertySyncRecords(prev => [{
      time: timeStr,
      devName: dev.name,
      pName,
      val: newValue,
      cName: comp?.cName || "-",
      result: "成功",
      user: "参林奇"
    }, ...prev].slice(0, 50));

    setRecentlySynced("刚刚");
    showToast(`${dev.name} ${pName} 修改为 ${newValue}`);
  };

  return (
    <div className="bg-[#1E1E1E] h-screen flex flex-col font-sans text-zinc-300 fixed inset-0 z-50 overflow-hidden">
      {toast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-[#10A66A] text-white text-sm px-4 py-2 font-bold rounded shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="w-4 h-4"/><span>{toast}</span>
          </div>
      )}

      {/* Top Toolbar */}
      <div className="h-14 bg-[#252526] border-b border-[#333] flex items-center justify-between px-4 shrink-0 shadow-sm relative z-20">
         <div className="flex items-center gap-4">
            <button onClick={() => setView("home")} className="text-zinc-400 hover:text-white p-1.5 rounded hover:bg-[#333] transition-colors"><ChevronLeft className="w-5 h-5"/></button>
            <div className="flex items-center gap-2">
               <span className="w-6 h-6 bg-[#10A66A] rounded flex items-center justify-center text-white font-bold text-[10px]">2D</span>
               <span className="text-sm font-bold text-white">工程设备状态监控看板</span>
            </div>
         </div>
         
         <div className="flex items-center justify-center gap-1 bg-[#1E1E1E] border border-[#333] rounded-md p-1">
            <button onClick={() => { setSimulationPlatformConnected(true); showToast("工程虚拟仿真平台连接成功"); }} className="px-3 py-1.5 text-xs text-white hover:bg-[#333] rounded transition-colors flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5"/><span>工程仿真设备</span></button>
            <button onClick={() => setRightTab("mapping")} className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center gap-1.5 ${rightTab === 'mapping' ? 'bg-[#10A66A]/20 text-[#10A66A]' : 'text-zinc-400 hover:text-white hover:bg-[#333]'}`}><Settings className="w-3.5 h-3.5"/><span>属性映射</span></button>
            <button onClick={() => setRightTab("preview")} className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center gap-1.5 ${rightTab === 'preview' ? 'bg-[#10A66A]/20 text-[#10A66A]' : 'text-zinc-400 hover:text-white hover:bg-[#333]'}`}><Eye className="w-3.5 h-3.5"/><span>状态预览</span></button>
            <div className="w-px h-4 bg-[#333] mx-1"></div>
            <button className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-[#333] rounded transition-colors flex items-center gap-1.5"><Save className="w-3.5 h-3.5"/><span>保存</span></button>
            <button className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-[#333] rounded transition-colors flex items-center gap-1.5"><Play className="w-3.5 h-3.5"/><span>预览</span></button>
            <button onClick={() => showToast("已发布为2D应用")} className="px-3 py-1.5 text-xs bg-[#10A66A]/10 text-[#10A66A] hover:bg-[#10A66A]/20 rounded transition-colors flex items-center gap-1.5"><Send className="w-3.5 h-3.5"/><span>发布</span></button>
         </div>
      </div>

      <div className="bg-[#111] px-4 py-2 flex items-center gap-6 border-b border-[#333] text-[10px] text-zinc-400 shrink-0">
         <div>当前应用：<span className="text-white font-bold">工程设备状态监控看板</span></div>
         <div>数据来源：<span className="text-white">工程虚拟仿真平台</span></div>
         <div className="flex items-center gap-1.5">连接状态：<span className={`w-2 h-2 rounded-full ${simulationPlatformConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,166,106,0.8)]' : 'bg-red-500'}`}></span><span className={simulationPlatformConnected ? "text-emerald-400" : "text-red-500"}>{simulationPlatformConnected ? "已连接" : "未连接"}</span></div>
         <div>当前仿真项目：<span className="text-white">智能产线虚拟仿真</span></div>
         <div>当前仿真场景：<span className="text-white">设备状态联动展示</span></div>
         <div>接入设备：<span className="text-blue-400 font-mono font-bold">6 </span> 台</div>
         <div>组件绑定：<span className="text-emerald-400 font-mono font-bold">8 </span> 个</div>
         <div className="flex items-center gap-1.5 flex-1 justify-end">
           <span>属性同步：</span><span className="text-emerald-400">实时同步</span>
           <span className="ml-2">最近同步：</span><span className="text-zinc-300">{recentlySynced}</span>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
         {/* Left Panel */}
         <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col z-20 shrink-0">
            <div className="flex border-b border-[#333]">
               <button onClick={() => setLeftTab("layers")} className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${leftTab === 'layers' ? 'border-[#10A66A] text-[#10A66A]' : 'border-transparent text-zinc-400 hover:text-zinc-300'}`}>图层管理</button>
               <button onClick={() => setLeftTab("components")} className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${leftTab === 'components' ? 'border-[#10A66A] text-[#10A66A]' : 'border-transparent text-zinc-400 hover:text-zinc-300'}`}>组件库</button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
               {leftTab === "layers" && componentBindingList.map(c => (
                 <div key={c.cId} onClick={() => setSelectedComponentId(c.cId)} className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${selectedComponentId === c.cId ? 'bg-[#10A66A]/20 text-[#10A66A] border border-[#10A66A]/30' : 'hover:bg-[#333] text-zinc-300 border border-transparent'}`}>
                   <div className="flex items-center gap-2 text-xs">
                     <Layers className="w-3.5 h-3.5 opacity-70"/>
                     <span className="truncate w-32 font-medium">{c.cName}</span>
                   </div>
                   {c.dId && <div className="flex items-center gap-1"><span className="text-[10px] text-emerald-400 opacity-60">已绑定</span><LinkIcon className="w-3 h-3 text-emerald-500 opacity-60"/></div>}
                 </div>
               ))}
               {leftTab === "components" && (
                 <div className="p-2 text-center text-zinc-500 text-xs mt-4">组件内容已隐藏</div>
               )}
            </div>
         </div>

         {/* Center Canvas Area */}
         <div className="flex-1 bg-[#1A1A1A] relative overflow-hidden flex flex-col">
            <div className="absolute left-6 top-4 bottom-4 w-72 bg-[#1E1E1E]/95 backdrop-blur border border-[#333] rounded-lg shadow-2xl flex flex-col z-30 pointer-events-auto">
               <div className="px-4 py-3 border-b border-[#333] text-sm font-bold text-white flex justify-between items-center bg-[#252526] rounded-t-lg">
                 <div className="flex items-center gap-2"><Server className="w-4 h-4 text-blue-400"/> 仿真设备列表</div>
                 <span className="bg-[#10A66A]/20 text-[#10A66A] text-[10px] px-1.5 py-0.5 rounded">6 台</span>
               </div>
               <div className="flex-1 overflow-y-auto p-2 space-y-2">
                 {simulationDeviceList.map(dev => {
                    const isActive = selectedDeviceId === dev.id;
                    const boundComps = componentBindingList.filter(c => c.dId === dev.id);
                    return (
                      <div key={dev.id} onClick={() => setSelectedDeviceId(dev.id)} className={`p-3 rounded border cursor-pointer transition-all ${isActive ? 'border-[#10A66A] bg-[#10A66A]/5' : 'border-[#333] bg-[#252526] hover:border-[#555]'}`}>
                         <div className="flex justify-between items-center mb-2">
                           <div className="font-bold text-xs text-white flex items-center gap-1.5 truncate max-w-[150px]"><Cpu className="w-3.5 h-3.5 text-zinc-400"/> {dev.name}</div>
                           <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">在线</span>
                         </div>
                         <div className="text-[10px] text-zinc-500 font-mono mb-2">{dev.code}</div>
                         <div className="grid grid-cols-2 gap-1 mb-2">
                           {Object.entries(dev.properties).map(([k, v]) => (
                             <div key={k} className="text-[10px] bg-[#111] px-1.5 py-1 rounded truncate flex flex-col">
                               <span className="text-zinc-500">{k}</span>
                               <span className="text-blue-400 font-mono font-bold">{v.toString()}</span>
                             </div>
                           ))}
                         </div>
                         {boundComps.length > 0 && (
                           <div className="text-[10px] text-zinc-400 border-t border-[#333] pt-2 flex items-center gap-1">
                              <LinkIcon className="w-3 h-3 text-emerald-500"/>
                              已绑定 {boundComps.length} 个组件
                           </div>
                         )}
                      </div>
                    )
                 })}
               </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#0b0c10] flex items-center justify-center relative">
               <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'center center' }} className="bg-[#0f111a] shadow-2xl relative border border-[#333] shrink-0 overflow-hidden select-none transition-transform">
                  {/* Grid Background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#10A66A10_1px,transparent_1px),linear-gradient(to_bottom,#10A66A10_1px,transparent_1px)] bg-[size:100px_100px] opacity-20"></div>
                  
                  {/* Title */}
                  <div className="absolute top-10 left-10 text-white text-4xl font-bold tracking-widest flex items-center gap-4">
                     <span className="w-2 h-10 bg-[#10A66A]"></span>工程设备状态监控看板
                  </div>

                  {/* Conveyor */}
                  <div className={`absolute top-[180px] left-[450px] w-[500px] h-[200px] border-2 ${getConveyorState(getPropVal('conveyor-01', 'speed')).border} ${getConveyorState(getPropVal('conveyor-01', 'speed')).bg} ${selectedComponentId === 'comp-conveyor' ? 'ring-4 ring-[#10A66A] ring-offset-4 ring-offset-[#0f111a]' : ''} rounded-xl p-6 transition-all duration-300 flex flex-col justify-between`}>
                    <div className="flex justify-between items-start">
                       <div>
                         <div className="text-white text-xl font-bold mb-1">输送带状态组件</div>
                         <div className="text-zinc-400 text-sm">仿真设备属性: conveyor-01 / speed</div>
                       </div>
                       <div className={`px-3 py-1 rounded text-sm font-bold border ${getConveyorState(getPropVal('conveyor-01', 'speed')).border} ${getConveyorState(getPropVal('conveyor-01', 'speed')).color}`}>
                         {getConveyorState(getPropVal('conveyor-01', 'speed')).label}
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-5xl font-mono font-bold text-white tracking-tighter">{getPropVal('conveyor-01', 'speed')} <span className="text-xl text-zinc-500">RPM</span></div>
                       <div className="flex-1 h-4 bg-[#111] rounded-full overflow-hidden relative border border-[#333]">
                          <div className={`absolute inset-y-0 left-0 w-3/4 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:40px_40px] ${getConveyorState(getPropVal('conveyor-01', 'speed')).bar} ${getConveyorState(getPropVal('conveyor-01', 'speed')).anim}`}></div>
                       </div>
                    </div>
                    <div className="absolute top-0 left-0 px-2 py-1 bg-[#10A66A] text-white text-[10px] font-bold rounded-tl-xl rounded-br-lg">已绑定</div>
                  </div>

                  {/* Fan */}
                  <div className={`absolute top-[180px] left-[1000px] w-[300px] h-[200px] border-2 ${getFanState(getPropVal('fan-01', 'speed')).border} ${getFanState(getPropVal('fan-01', 'speed')).bg} ${selectedComponentId === 'comp-fan' ? 'ring-4 ring-[#10A66A] ring-offset-4 ring-offset-[#0f111a]' : ''} rounded-xl p-6 transition-all duration-300 flex flex-col items-center justify-center relative`}>
                    <div className="text-white text-lg font-bold mb-4 w-full text-center border-b border-white/10 pb-2 flex justify-between items-center"><span className="text-sm bg-[#10A66A]/20 text-[#10A66A] px-2 py-0.5 rounded">仿真设备属性</span>工业风机状态</div>
                    <Settings className={`w-16 h-16 mb-4 ${getFanState(getPropVal('fan-01', 'speed')).color} ${getFanState(getPropVal('fan-01', 'speed')).iconStyle}`} />
                    <div className={`text-lg font-bold ${getFanState(getPropVal('fan-01', 'speed')).color}`}>{getPropVal('fan-01', 'speed')} RPM | {getFanState(getPropVal('fan-01', 'speed')).label}</div>
                  </div>

                  {/* Valve */}
                  <div className={`absolute top-[180px] left-[1350px] w-[300px] h-[200px] border-2 ${getValveState(getPropVal('valve-01', 'openRate')).border} ${getValveState(getPropVal('valve-01', 'openRate')).bg} ${selectedComponentId === 'comp-valve' ? 'ring-4 ring-[#10A66A] ring-offset-4 ring-offset-[#0f111a]' : ''} rounded-xl p-6 transition-all duration-300 flex flex-col items-center justify-center relative`}>
                    <div className="absolute top-0 left-0 px-2 py-1 bg-[#10A66A] text-white text-[10px] font-bold rounded-tl-xl rounded-br-lg">已绑定</div>
                    <div className="text-white text-lg font-bold mb-2">控制阀门开度</div>
                    <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                       <svg className="w-full h-full -rotate-90">
                         <circle cx="48" cy="48" r="40" fill="none" stroke="#222" strokeWidth="8"/>
                         <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (getPropVal('valve-01', 'openRate') / 100))} className={`transition-all duration-500 ${getValveState(getPropVal('valve-01', 'openRate')).ring}`}/>
                       </svg>
                       <div className="absolute font-bold text-white text-xl">{getPropVal('valve-01', 'openRate')}%</div>
                    </div>
                    <div className={`text-sm font-bold ${getValveState(getPropVal('valve-01', 'openRate')).color}`}>{getValveState(getPropVal('valve-01', 'openRate')).label}</div>
                  </div>

                  {/* Pump */}
                  <div className={`absolute top-[420px] left-[450px] w-[300px] h-[200px] border-2 ${getPumpState(getPropVal('pump-01', 'running')).border} ${getPumpState(getPropVal('pump-01', 'running')).bg} ${selectedComponentId === 'comp-pump' ? 'ring-4 ring-[#10A66A] ring-offset-4 ring-offset-[#0f111a]' : ''} rounded-xl p-6 transition-all duration-300 flex flex-col justify-between relative`}>
                     <div className="absolute top-0 left-0 px-2 py-1 bg-[#10A66A] text-white text-[10px] font-bold rounded-tl-xl rounded-br-lg">仿真设备属性</div>
                     <div className="text-white text-lg font-bold border-b border-white/10 pb-2 flex justify-between items-center pl-16">
                        水泵运行状态
                        <span className={`w-3 h-3 rounded-full ${getPropVal('pump-01', 'running') ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                     </div>
                     <div className="flex justify-between items-end">
                       <div>
                         <div className="text-zinc-400 text-sm mb-1">当前压力</div>
                         <div className="text-3xl font-mono text-white">{getPropVal('pump-01', 'pressure')} <span className="text-sm text-zinc-500">MPa</span></div>
                       </div>
                       <div className={`text-lg font-bold px-3 py-1 rounded border ${getPumpState(getPropVal('pump-01', 'running')).border} ${getPumpState(getPropVal('pump-01', 'running')).color}`}>{getPumpState(getPropVal('pump-01', 'running')).label}</div>
                     </div>
                  </div>
                  
                  {/* Flow Pipe */}
                  <div className={`absolute top-[420px] left-[800px] w-[500px] h-[200px] border-2 ${getFlowState(getPropVal('pump-01', 'flow')).border} ${getFlowState(getPropVal('pump-01', 'flow')).bg} ${selectedComponentId === 'comp-flow' ? 'ring-4 ring-[#10A66A] ring-offset-4 ring-offset-[#0f111a]' : ''} rounded-xl p-6 transition-all duration-300 flex flex-col justify-between relative`}>
                     <div className="absolute top-0 left-0 px-2 py-1 bg-[#10A66A] text-white text-[10px] font-bold rounded-tl-xl rounded-br-lg">已绑定</div>
                     <div className="flex justify-between items-center">
                        <div className="text-white text-xl font-bold flex items-center gap-2">管道流量组件</div>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getFlowState(getPropVal('pump-01', 'flow')).border} ${getFlowState(getPropVal('pump-01', 'flow')).color}`}>
                           {getFlowState(getPropVal('pump-01', 'flow')).label}
                        </div>
                     </div>
                     <div className="flex items-center gap-4 w-full px-4">
                        <div className="text-2xl font-mono text-white whitespace-nowrap">{getPropVal('pump-01', 'flow')} <span className="text-sm text-zinc-500">L/min</span></div>
                        <div className="flex-1 h-8 bg-[#111] rounded-full overflow-hidden relative border border-[#333] shadow-inner">
                           <div style={{ width: `${Math.min(100, Math.max(0, getPropVal('pump-01', 'flow') * 2))}%` }} className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${getPropVal('pump-01', 'flow') > 0 ? 'bg-blue-500' : 'bg-transparent'}`}>
                               {getPropVal('pump-01', 'flow') > 0 && <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>}
                           </div>
                        </div>
                     </div>
                     <style>{`@keyframes slide { from { background-position: 0 0; } to { background-position: 40px 0; } }`}</style>
                  </div>

                  {/* Robot */}
                  <div className={`absolute top-[660px] left-[450px] w-[500px] h-[200px] border-2 ${getRobotState(getPropVal('robot-01', 'action')).border} ${getRobotState(getPropVal('robot-01', 'action')).bg} ${selectedComponentId === 'comp-robot' ? 'ring-4 ring-[#10A66A] ring-offset-4 ring-offset-[#0f111a]' : ''} rounded-xl p-6 transition-all duration-300 flex flex-col justify-between relative`}>
                     <div className="flex justify-between items-center">
                        <div className="text-white text-xl font-bold flex items-center gap-2">
                           <Activity className={`w-6 h-6 ${getRobotState(getPropVal('robot-01', 'action')).color} ${getRobotState(getPropVal('robot-01', 'action')).iconStyle}`} />
                           机械臂动作组件
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getRobotState(getPropVal('robot-01', 'action')).border} ${getRobotState(getPropVal('robot-01', 'action')).color}`}>
                           {getRobotState(getPropVal('robot-01', 'action')).label}
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                           <div className="text-zinc-400 text-xs mb-1">工作循环计数</div>
                           <div className="text-2xl font-mono text-blue-400">{getPropVal('robot-01', 'cycleCount')} <span className="text-xs text-zinc-500">次</span></div>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                           <div className="text-zinc-400 text-xs mb-1">末端轴角度</div>
                           <div className="text-2xl font-mono text-purple-400">{getPropVal('robot-01', 'axisAngle')} <span className="text-xs text-zinc-500">°</span></div>
                        </div>
                     </div>
                     <div className="absolute top-0 left-0 px-2 py-1 bg-[#10A66A] text-white text-[10px] font-bold rounded-tl-xl rounded-br-lg">已绑定</div>
                  </div>

                  {/* Alarm Light */}
                  <div className={`absolute top-[660px] left-[1000px] w-[300px] h-[200px] border-2 ${getLightState(getPropVal('light-01', 'alarm')).border} ${getLightState(getPropVal('light-01', 'alarm')).bg} ${selectedComponentId === 'comp-light' ? 'ring-4 ring-[#10A66A] ring-offset-4 ring-offset-[#0f111a]' : ''} rounded-xl p-6 transition-all duration-300 flex flex-col justify-center items-center relative`}>
                     <div className="absolute top-0 left-0 px-2 py-1 bg-[#10A66A] text-white text-[10px] font-bold rounded-tl-xl rounded-br-lg">仿真设备属性</div>
                     <div className="text-white text-lg font-bold mb-6">安全警示灯状态</div>
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center relative ${getPropVal('light-01', 'alarm') ? 'bg-red-500' : 'bg-emerald-500'}`}>
                        <div className={`absolute inset-0 rounded-full ${getPropVal('light-01', 'alarm') ? 'bg-red-500 animate-ping opacity-75' : 'bg-emerald-500 opacity-20'}`}></div>
                     </div>
                     <div className={`mt-4 text-xl font-bold ${getLightState(getPropVal('light-01', 'alarm')).color} ${getLightState(getPropVal('light-01', 'alarm')).blink}`}>
                        {getLightState(getPropVal('light-01', 'alarm')).label}
                     </div>
                     {getPropVal('light-01', 'alarm') && <div className="absolute top-4 right-4 text-red-500 font-bold bg-red-500/20 px-2 py-1 rounded animate-pulse">设备告警</div>}
                  </div>

                  <div className="absolute top-[80px] right-[80px] border border-[#444] bg-[#1E1E1E]/80 backdrop-blur rounded p-4 shadow-xl">
                      <div className="text-white font-bold mb-2">设备状态总览表格</div>
                      <table className="text-xs text-left w-64 border-collapse">
                        <thead><tr className="border-b border-[#444] text-zinc-400"><th>设备</th><th>状态</th></tr></thead>
                        <tbody>
                          {componentBindingList.filter(c => c.dId).map((c, i) => (
                             <tr key={i} className="border-b border-[#333]"><td className="py-1 text-zinc-300">{c.dId}</td><td className="py-1 text-blue-400">{getComponentDisplayState(c.cId, c.dId!, c.pName!, getPropVal(c.dId!, c.pName!))}</td></tr>
                          ))}
                        </tbody>
                      </table>
                  </div>

               </div>
            </div>

            {/* Scale controls */}
            <div className="absolute bottom-4 right-4 bg-[#252526] border border-[#333] rounded-md flex items-center shadow-lg p-1">
               <button onClick={() => setScale(Math.max(0.2, scale - 0.1))} className="p-1 px-2 text-zinc-400 hover:text-white rounded transition-colors">-</button>
               <span className="text-xs text-white px-2 font-mono">{Math.round(scale * 100)}%</span>
               <button onClick={() => setScale(scale + 0.1)} className="p-1 px-2 text-zinc-400 hover:text-white rounded transition-colors">+</button>
            </div>
         </div>

         {/* Right Panel */}
         <div className="w-[450px] bg-[#252526] border-l border-[#333] flex flex-col z-20 shrink-0">
            <div className="flex border-b border-[#333] shrink-0">
               <button onClick={() => setRightTab("mapping")} className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${rightTab === 'mapping' ? 'border-[#10A66A] text-[#10A66A]' : 'border-transparent text-zinc-400 hover:text-zinc-300'}`}>设备属性映射</button>
               <button onClick={() => setRightTab("devices")} className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${rightTab === 'devices' ? 'border-[#10A66A] text-[#10A66A]' : 'border-transparent text-zinc-400 hover:text-zinc-300'}`}>工程仿真设备</button>
               <button onClick={() => setRightTab("preview")} className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${rightTab === 'preview' ? 'border-[#10A66A] text-[#10A66A]' : 'border-transparent text-zinc-400 hover:text-zinc-300'}`}>组件状态预览</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
               {rightTab === "devices" && (
                 <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-[#1A1C1E] p-4 rounded border border-[#333] space-y-3">
                       <div className="flex items-center gap-2 mb-2">
                          <Server className="w-5 h-5 text-blue-400" />
                          <span className="text-sm font-bold text-white">工程虚拟仿真平台设备</span>
                       </div>
                       <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                          <div className="text-zinc-500">平台名称</div><div className="text-white text-right">工程虚拟仿真平台</div>
                          <div className="text-zinc-500">连接状态</div><div className="text-emerald-400 text-right font-bold">已连接</div>
                          <div className="text-zinc-500">当前项目</div><div className="text-white text-right">智能产线虚拟仿真</div>
                          <div className="text-zinc-500">当前场景</div><div className="text-white text-right">设备状态联动展示</div>
                          <div className="text-zinc-500">同步方式</div><div className="text-emerald-400 text-right bg-emerald-500/10 px-1 py-0.5 rounded ml-auto">实时同步</div>
                          <div className="text-zinc-500">刷新频率</div><div className="text-white text-right font-mono">2 秒 / 次</div>
                          <div className="text-zinc-500">仿真设备数量</div><div className="text-blue-400 font-mono text-right font-bold">6 台</div>
                          <div className="text-zinc-500">设备属性数量</div><div className="text-blue-400 font-mono text-right font-bold">18 个</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <button onClick={() => showToast("测试连接成功：工程虚拟仿真平台连接正常")} className="py-2.5 bg-[#1e1e1e] border border-[#444] hover:bg-[#333] text-zinc-300 text-xs font-bold rounded transition-colors">测试连接</button>
                       <button onClick={() => { setRecentlySynced("刚刚"); showToast("工程虚拟仿真平台设备已同步"); }} className="py-2.5 bg-[#10A66A]/20 border border-[#10A66A]/50 hover:bg-[#10A66A]/30 text-[#10A66A] text-xs font-bold rounded transition-colors flex justify-center items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5"/> 同步设备</button>
                       <button onClick={() => showToast("属性值已刷新")} className="py-2.5 bg-[#1e1e1e] border border-[#444] hover:bg-[#333] text-zinc-300 text-xs font-bold rounded transition-colors">刷新属性值</button>
                       <button onClick={() => showToast("映射规则已保存")} className="py-2.5 bg-[#1e1e1e] border border-[#444] hover:bg-[#333] text-zinc-300 text-xs font-bold rounded transition-colors">保存映射</button>
                    </div>
                 </div>
               )}

               {rightTab === "mapping" && (
                 <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="space-y-2">
                       <div className="flex items-center justify-between border-b border-[#333] pb-2">
                          <div className="text-sm font-bold text-white">设备属性与组件状态配置</div>
                       </div>
                       
                       {/* Control Panel based on selected Component/Device */}
                       <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-4 space-y-4 shadow-inner">
                          <div className="flex items-center justify-between text-xs mb-2">
                             <div className="text-zinc-400">当前选中设备</div>
                             <select value={selectedDeviceId} onChange={e => setSelectedDeviceId(e.target.value)} className="bg-[#252526] border border-[#444] text-white p-1 rounded outline-none w-48 text-right">
                                {simulationDeviceList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                             </select>
                          </div>
                          
                          <div className="border-t border-[#333] pt-4">
                             <div className="flex items-center gap-2 mb-3 text-[#10A66A] font-bold text-sm">
                                <SlidersHorizontal className="w-4 h-4"/> 属性值调节
                             </div>

                             {selectedDeviceId === "conveyor-01" && (
                                <div className="space-y-3">
                                  <div className="flex justify-between text-xs text-zinc-400"><span>属性: speed</span><span className="text-blue-400 font-bold font-mono px-2 bg-blue-500/10 rounded">{getPropVal("conveyor-01", "speed")}</span></div>
                                  <input type="range" min="0" max="100" value={getPropVal("conveyor-01", "speed")} onChange={e => changeDeviceProperty("conveyor-01", "speed", Number(e.target.value))} className="w-full accent-blue-500" />
                                  <div className="grid grid-cols-4 gap-1">
                                     <button onClick={() => changeDeviceProperty("conveyor-01", "speed", 0)} className="py-1.5 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-[#444] font-bold">停止</button>
                                     <button onClick={() => changeDeviceProperty("conveyor-01", "speed", 30)} className="py-1.5 text-[10px] bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 rounded border border-emerald-500/30 font-bold">低速</button>
                                     <button onClick={() => changeDeviceProperty("conveyor-01", "speed", 60)} className="py-1.5 text-[10px] bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 rounded border border-emerald-500/30 font-bold">中速</button>
                                     <button onClick={() => changeDeviceProperty("conveyor-01", "speed", 90)} className="py-1.5 text-[10px] bg-amber-900/40 hover:bg-amber-900/60 text-amber-500 rounded border border-amber-500/30 font-bold">高速</button>
                                  </div>
                                </div>
                             )}

                             {selectedDeviceId === "fan-01" && (
                                <div className="space-y-3">
                                  <div className="flex justify-between text-xs text-zinc-400"><span>属性: speed</span><span className="text-blue-400 font-bold font-mono px-2 bg-blue-500/10 rounded">{getPropVal("fan-01", "speed")}</span></div>
                                  <input type="range" min="0" max="2000" step="100" value={getPropVal("fan-01", "speed")} onChange={e => changeDeviceProperty("fan-01", "speed", Number(e.target.value))} className="w-full accent-teal-500" />
                                  <div className="grid grid-cols-4 gap-1">
                                     <button onClick={() => changeDeviceProperty("fan-01", "speed", 0)} className="py-1.5 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-[#444] font-bold">停止</button>
                                     <button onClick={() => changeDeviceProperty("fan-01", "speed", 600)} className="py-1.5 text-[10px] bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 rounded border border-emerald-500/30 font-bold">低速</button>
                                     <button onClick={() => changeDeviceProperty("fan-01", "speed", 1000)} className="py-1.5 text-[10px] bg-teal-900/40 hover:bg-teal-900/60 text-teal-400 rounded border border-teal-500/30 font-bold">中速</button>
                                     <button onClick={() => changeDeviceProperty("fan-01", "speed", 1500)} className="py-1.5 text-[10px] bg-amber-900/40 hover:bg-amber-900/60 text-amber-500 rounded border border-amber-500/30 font-bold">高速</button>
                                  </div>
                                </div>
                             )}

                             {selectedDeviceId === "valve-01" && (
                                <div className="space-y-3">
                                  <div className="flex justify-between text-xs text-zinc-400"><span>属性: openRate</span><span className="text-blue-400 font-bold font-mono px-2 bg-blue-500/10 rounded">{getPropVal("valve-01", "openRate")}%</span></div>
                                  <input type="range" min="0" max="100" value={getPropVal("valve-01", "openRate")} onChange={e => changeDeviceProperty("valve-01", "openRate", Number(e.target.value))} className="w-full accent-green-500" />
                                  <div className="grid grid-cols-3 gap-2">
                                     <button onClick={() => changeDeviceProperty("valve-01", "openRate", 0)} className="py-1.5 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-[#444] font-bold">关闭</button>
                                     <button onClick={() => changeDeviceProperty("valve-01", "openRate", 45)} className="py-1.5 text-[10px] bg-amber-900/40 hover:bg-amber-900/60 text-amber-500 rounded border border-amber-500/30 font-bold">半开</button>
                                     <button onClick={() => changeDeviceProperty("valve-01", "openRate", 100)} className="py-1.5 text-[10px] bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 rounded border border-emerald-500/30 font-bold">打开</button>
                                  </div>
                                </div>
                             )}

                             {selectedDeviceId === "pump-01" && (
                                <div className="space-y-3">
                                  <div className="flex justify-between text-xs text-zinc-400"><span>属性: running</span><span className="text-blue-400 font-bold font-mono px-2 bg-blue-500/10 rounded">{getPropVal("pump-01", "running") ? 'true' : 'false'}</span></div>
                                  <div className="grid grid-cols-2 gap-2">
                                     <button onClick={() => changeDeviceProperty("pump-01", "running", true)} className={`py-2 text-[10px] rounded border font-bold transition-colors ${getPropVal("pump-01", "running") ? 'bg-emerald-600/20 text-emerald-400 border-emerald-600/50' : 'bg-zinc-800 border-[#444] text-zinc-400'}`}>启动水泵</button>
                                     <button onClick={() => changeDeviceProperty("pump-01", "running", false)} className={`py-2 text-[10px] rounded border font-bold transition-colors ${!getPropVal("pump-01", "running") ? 'bg-zinc-600/30 text-white border-zinc-500' : 'bg-zinc-800 border-[#444] text-zinc-400'}`}>停止水泵</button>
                                  </div>
                                </div>
                             )}

                             {selectedDeviceId === "light-01" && (
                                <div className="space-y-3">
                                  <div className="flex justify-between text-xs text-zinc-400"><span>属性: alarm</span><span className="text-blue-400 font-bold font-mono px-2 bg-blue-500/10 rounded">{getPropVal("light-01", "alarm") ? 'true' : 'false'}</span></div>
                                  <div className="grid grid-cols-2 gap-2">
                                     <button onClick={() => changeDeviceProperty("light-01", "alarm", false)} className={`py-2 text-[10px] rounded border font-bold transition-colors ${!getPropVal("light-01", "alarm") ? 'bg-emerald-600/20 text-emerald-400 border-emerald-600/50' : 'bg-zinc-800 border-[#444] text-zinc-400'}`}>正常</button>
                                     <button onClick={() => changeDeviceProperty("light-01", "alarm", true)} className={`py-2 text-[10px] rounded border font-bold transition-colors ${getPropVal("light-01", "alarm") ? 'bg-red-600/20 text-red-400 border-red-600/50' : 'bg-zinc-800 border-[#444] text-zinc-400'}`}>报警</button>
                                  </div>
                                </div>
                             )}

                             {selectedDeviceId === "robot-01" && (
                                <div className="space-y-3">
                                  <div className="flex justify-between text-xs text-zinc-400"><span>属性: action</span><span className="text-blue-400 font-bold font-mono px-2 bg-blue-500/10 rounded">{getPropVal("robot-01", "action")}</span></div>
                                  <select value={getPropVal("robot-01", "action")} onChange={e => changeDeviceProperty("robot-01", "action", e.target.value)} className="w-full bg-[#111] border border-[#444] text-xs text-white p-2 rounded outline-none accent-purple-500">
                                     <option value="待机">待机</option>
                                     <option value="搬运中">搬运中</option>
                                     <option value="复位中">复位中</option>
                                  </select>
                                  <div className="grid grid-cols-3 gap-2">
                                     <button onClick={() => changeDeviceProperty("robot-01", "action", "待机")} className="py-1.5 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-[#444] font-bold">待机</button>
                                     <button onClick={() => changeDeviceProperty("robot-01", "action", "搬运中")} className="py-1.5 text-[10px] bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 rounded border border-emerald-500/30 font-bold">搬运中</button>
                                     <button onClick={() => changeDeviceProperty("robot-01", "action", "复位中")} className="py-1.5 text-[10px] bg-blue-900/40 hover:bg-blue-900/60 text-blue-400 rounded border border-blue-500/30 font-bold">复位中</button>
                                  </div>
                                </div>
                             )}

                             {/* Provide bind/unbind buttons uniformly */}
                             <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#333]">
                                <button onClick={() => showToast("已选择设备")} className="flex-1 py-1.5 bg-[#252526] hover:bg-[#333] border border-[#444] rounded text-[10px] font-bold">选择设备</button>
                                <button onClick={() => showToast("已选择属性")} className="flex-1 py-1.5 bg-[#252526] hover:bg-[#333] border border-[#444] rounded text-[10px] font-bold">选择属性</button>
                                <button onClick={() => showToast("属性绑定成功")} className="flex-1 py-1.5 bg-[#10A66A]/20 text-[#10A66A] hover:bg-[#10A66A]/30 border border-[#10A66A]/50 rounded text-[10px] font-bold">绑定属性</button>
                                <button onClick={() => showToast("属性解除绑定")} className="flex-1 py-1.5 bg-red-900/20 text-red-500 hover:bg-red-900/30 border border-red-900/50 rounded text-[10px] font-bold">解除绑定</button>
                             </div>
                          </div>
                       </div>

                       {/* Static Info mapping table */}
                       <div className="pt-2 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                            <span>映射规则</span>
                            <button onClick={() => showToast("应用状态规则")} className="px-2 py-1 bg-[#252526] border border-[#444] text-zinc-300 rounded text-[10px] hover:bg-[#333]">应用状态规则</button>
                          </div>
                          
                          <div className="overflow-x-auto border border-[#333] rounded-lg">
                             <table className="w-full text-left text-[10px] whitespace-nowrap">
                               <thead className="bg-[#1A1A1A] text-zinc-400">
                                  <tr>
                                    <th className="px-2 py-2 border-b border-[#333]">模块(属性)</th>
                                    <th className="px-2 py-2 border-b border-[#333]">阈值范围</th>
                                    <th className="px-2 py-2 border-b border-[#333]">绑定组件(表现)</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-[#333]">
                                  {/* Conveyor */}
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">输送带<span className="text-blue-500 font-mono ml-1 text-[9px]">speed</span></td><td className="px-2 py-1.5 font-mono text-[9px]">0</td><td className="px-2 py-1.5">输送带组件<span className="ml-1 text-zinc-500 bg-zinc-900 text-[9px] px-1 rounded border border-zinc-700">停止</span></td></tr>
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">输送带<span className="text-blue-500 font-mono ml-1 text-[9px]">speed</span></td><td className="px-2 py-1.5 font-mono text-[9px]">1-50</td><td className="px-2 py-1.5">输送带组件<span className="ml-1 text-emerald-400 bg-emerald-900/30 text-[9px] px-1 rounded border border-emerald-700/50">低速运行</span></td></tr>
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">输送带<span className="text-blue-500 font-mono ml-1 text-[9px]">speed</span></td><td className="px-2 py-1.5 font-mono text-[9px]">51-80</td><td className="px-2 py-1.5">输送带组件<span className="ml-1 text-emerald-400 bg-emerald-900/30 text-[9px] px-1 rounded border border-emerald-700/50">中速运行</span></td></tr>
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">输送带<span className="text-blue-500 font-mono ml-1 text-[9px]">speed</span></td><td className="px-2 py-1.5 font-mono text-[9px]">81-100</td><td className="px-2 py-1.5">输送带组件<span className="ml-1 text-amber-400 bg-amber-900/30 text-[9px] px-1 rounded border border-amber-700/50">高速运行</span></td></tr>

                                  {/* Fan */}
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">工业风机<span className="text-blue-500 font-mono ml-1 text-[9px]">speed</span></td><td className="px-2 py-1.5 font-mono text-[9px]">0</td><td className="px-2 py-1.5">风机组件<span className="ml-1 text-zinc-500 bg-zinc-900 text-[9px] px-1 rounded border border-zinc-700">停止</span></td></tr>
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">工业风机<span className="text-blue-500 font-mono ml-1 text-[9px]">speed</span></td><td className="px-2 py-1.5 font-mono text-[9px]">1-800</td><td className="px-2 py-1.5">风机组件<span className="ml-1 text-emerald-400 bg-emerald-900/30 text-[9px] px-1 rounded border border-emerald-700/50">低速</span></td></tr>
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">工业风机<span className="text-blue-500 font-mono ml-1 text-[9px]">speed</span></td><td className="px-2 py-1.5 font-mono text-[9px]">801-1200</td><td className="px-2 py-1.5">风机组件<span className="ml-1 text-teal-400 bg-teal-900/30 text-[9px] px-1 rounded border border-teal-700/50">中速</span></td></tr>
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">工业风机<span className="text-blue-500 font-mono ml-1 text-[9px]">speed</span></td><td className="px-2 py-1.5 font-mono text-[9px]">&gt;1200</td><td className="px-2 py-1.5">风机组件<span className="ml-1 text-amber-400 bg-amber-900/30 text-[9px] px-1 rounded border border-amber-700/50">高速</span></td></tr>

                                  {/* Valve */}
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">控制阀门<span className="text-blue-500 font-mono ml-1 text-[9px]">openRate</span></td><td className="px-2 py-1.5 font-mono text-[9px]">0%</td><td className="px-2 py-1.5">阀门组件<span className="ml-1 text-zinc-500 bg-zinc-900 text-[9px] px-1 rounded border border-zinc-700">关闭</span></td></tr>
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">控制阀门<span className="text-blue-500 font-mono ml-1 text-[9px]">openRate</span></td><td className="px-2 py-1.5 font-mono text-[9px]">1%-50%</td><td className="px-2 py-1.5">阀门组件<span className="ml-1 text-amber-400 bg-amber-900/30 text-[9px] px-1 rounded border border-amber-700/50">半开</span></td></tr>
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">控制阀门<span className="text-blue-500 font-mono ml-1 text-[9px]">openRate</span></td><td className="px-2 py-1.5 font-mono text-[9px]">51%-100%</td><td className="px-2 py-1.5">阀门组件<span className="ml-1 text-emerald-400 bg-emerald-900/30 text-[9px] px-1 rounded border border-emerald-700/50">打开</span></td></tr>
                                  
                                  {/* Pump */}
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">水泵设备<span className="text-blue-500 font-mono ml-1 text-[9px]">running</span></td><td className="px-2 py-1.5 font-mono text-[9px]">true</td><td className="px-2 py-1.5">水泵组件<span className="ml-1 text-emerald-400 bg-emerald-900/30 text-[9px] px-1 rounded border border-emerald-700/50">运行中</span></td></tr>
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">水泵设备<span className="text-blue-500 font-mono ml-1 text-[9px]">running</span></td><td className="px-2 py-1.5 font-mono text-[9px]">false</td><td className="px-2 py-1.5">水泵组件<span className="ml-1 text-zinc-500 bg-zinc-900 text-[9px] px-1 rounded border border-zinc-700">停止</span></td></tr>

                                  {/* Light */}
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">警示灯<span className="text-blue-500 font-mono ml-1 text-[9px]">alarm</span></td><td className="px-2 py-1.5 font-mono text-[9px]">false</td><td className="px-2 py-1.5">警示灯组件<span className="ml-1 text-emerald-400 bg-emerald-900/30 text-[9px] px-1 rounded border border-emerald-700/50">正常</span></td></tr>
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">警示灯<span className="text-blue-500 font-mono ml-1 text-[9px]">alarm</span></td><td className="px-2 py-1.5 font-mono text-[9px]">true</td><td className="px-2 py-1.5">警示灯组件<span className="ml-1 text-red-400 bg-red-900/30 text-[9px] px-1 rounded border border-red-700/50">报警</span></td></tr>

                                  {/* Robot */}
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">机械臂<span className="text-blue-500 font-mono ml-1 text-[9px]">action</span></td><td className="px-2 py-1.5 font-mono text-[9px]">待机</td><td className="px-2 py-1.5">机械臂组件<span className="ml-1 text-zinc-500 bg-zinc-900 text-[9px] px-1 rounded border border-zinc-700">待机</span></td></tr>
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">机械臂<span className="text-blue-500 font-mono ml-1 text-[9px]">action</span></td><td className="px-2 py-1.5 font-mono text-[9px]">搬运中</td><td className="px-2 py-1.5">机械臂组件<span className="ml-1 text-emerald-400 bg-emerald-900/30 text-[9px] px-1 rounded border border-emerald-700/50">执行中</span></td></tr>
                                  <tr className="hover:bg-[#333]"><td className="px-2 py-1.5 text-zinc-300">机械臂<span className="text-blue-500 font-mono ml-1 text-[9px]">action</span></td><td className="px-2 py-1.5 font-mono text-[9px]">复位中</td><td className="px-2 py-1.5">机械臂组件<span className="ml-1 text-blue-400 bg-blue-900/30 text-[9px] px-1 rounded border border-blue-700/50">复位中</span></td></tr>
                               </tbody>
                             </table>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {rightTab === "preview" && (
                 <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="text-sm font-bold text-white border-b border-[#333] pb-2">组件状态预览</div>
                    <div className="space-y-2">
                       {componentBindingList.filter(c => c.dId).map((c, i) => {
                          const val = getPropVal(c.dId!, c.pName!);
                          const stateStr = getComponentDisplayState(c.cId, c.dId!, c.pName!, val);
                          let colorClass = "text-emerald-400 border-emerald-500/30 bg-emerald-900/10";
                          if (["停止", "关闭", "待机", "无流量"].includes(stateStr)) colorClass = "text-zinc-500 border-zinc-700 bg-zinc-900/30";
                          if (["高速运行", "高速", "半开", "低流量"].includes(stateStr)) colorClass = "text-amber-400 border-amber-500/30 bg-amber-900/10";
                          if (["报警", "高流量"].includes(stateStr)) colorClass = "text-red-500 border-red-500/30 bg-red-900/10";
                          if (["复位中", "打开"].includes(stateStr)) colorClass = "text-blue-400 border-blue-500/30 bg-blue-900/10";

                          return (
                            <div key={i} className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-[#333] rounded">
                               <div className="text-xs text-zinc-300">{c.cName}</div>
                               <div className={`text-xs font-bold px-2 py-1 rounded border ${colorClass}`}>{stateStr} {typeof val === 'number' && typeof val !== 'boolean' ? `(${val})` : ''}</div>
                            </div>
                          )
                       })}
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Bottom Panel */}
      <div className="h-56 bg-[#1E1E1E] border-t border-[#333] flex shrink-0 z-20">
         {/* Sync Records */}
         <div className="flex-1 border-r border-[#333] flex flex-col min-w-0">
            <div className="px-4 py-2 text-xs font-bold bg-[#1A1C1E] border-b border-[#333] flex items-center gap-1.5 text-[#10A66A]">
               <Database className="w-3.5 h-3.5"/>设备属性同步记录
            </div>
            <div className="flex-1 overflow-y-auto">
               <table className="w-full text-left border-collapse text-[10px]">
                  <thead className="bg-[#252526] sticky top-0 border-b border-[#333] z-10">
                     <tr>
                        <th className="p-2 pl-4 text-zinc-500 font-medium">时间</th>
                        <th className="p-2 text-zinc-500 font-medium">设备名称</th>
                        <th className="p-2 text-zinc-500 font-medium">属性名</th>
                        <th className="p-2 text-zinc-500 font-medium whitespace-nowrap">属性值</th>
                        <th className="p-2 text-zinc-500 font-medium whitespace-nowrap">绑定组件</th>
                        <th className="p-2 text-zinc-500 font-medium">同步结果</th>
                        <th className="p-2 text-zinc-500 font-medium">操作人</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333] font-mono">
                     {propertySyncRecords.length === 0 ? (
                        <tr><td colSpan={7} className="p-4 text-center text-zinc-600 font-sans">暂无属性同步记录，请修改属性值触发同步</td></tr>
                     ) : (
                        propertySyncRecords.map((r, i) => (
                           <tr key={i} className="hover:bg-[#2A2D2E]">
                              <td className="p-1 px-4 text-zinc-400 whitespace-nowrap">{r.time}</td>
                              <td className="p-1 text-zinc-300 font-sans font-bold whitespace-nowrap">{r.devName}</td>
                              <td className="p-1 text-blue-400 font-bold whitespace-nowrap">{r.pName}</td>
                              <td className="p-1 text-amber-400 font-bold whitespace-nowrap">{r.val.toString()}</td>
                              <td className="p-1 text-zinc-300 font-sans whitespace-nowrap">{r.cName}</td>
                              <td className="p-1 text-emerald-400 font-sans whitespace-nowrap">{r.result}</td>
                              <td className="p-1 text-zinc-500 font-sans whitespace-nowrap">{r.user}</td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Change Records */}
         <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-2 text-xs font-bold bg-[#1A1C1E] border-b border-[#333] flex items-center gap-1.5 text-[#10A66A]">
               <Activity className="w-3.5 h-3.5"/>组件状态变化记录
            </div>
            <div className="flex-1 overflow-y-auto">
               <table className="w-full text-left border-collapse text-[10px]">
                  <thead className="bg-[#252526] sticky top-0 border-b border-[#333] z-10 whitespace-nowrap">
                     <tr>
                        <th className="p-2 pl-4 text-zinc-500 font-medium">时间</th>
                        <th className="p-2 text-zinc-500 font-medium">设备名称</th>
                        <th className="p-2 text-zinc-500 font-medium">属性变化</th>
                        <th className="p-2 text-zinc-500 font-medium">绑定组件</th>
                        <th className="p-2 text-zinc-500 font-medium">组件状态变化</th>
                        <th className="p-2 text-zinc-500 font-medium">结果</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333] font-mono whitespace-nowrap">
                     {componentStateChangeRecords.length === 0 ? (
                        <tr><td colSpan={6} className="p-4 text-center text-zinc-600 font-sans">暂无组件状态变化记录，请修改属性值查看变化</td></tr>
                     ) : (
                        componentStateChangeRecords.map((r, i) => (
                           <tr key={i} className="hover:bg-[#2A2D2E]">
                              <td className="p-1 px-4 text-zinc-400">{r.time}</td>
                              <td className="p-1 text-zinc-300 font-sans font-bold">{r.devName}</td>
                              <td className="p-1 text-blue-400 font-bold">{r.propChange}</td>
                              <td className="p-1 text-zinc-300 font-sans">{r.compName}</td>
                              <td className="p-1 text-amber-500 font-sans font-bold">{r.stateChange}</td>
                              <td className="p-1 text-emerald-400 font-sans">{r.result}</td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
