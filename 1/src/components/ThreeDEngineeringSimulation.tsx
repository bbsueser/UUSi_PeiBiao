import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, Play, Pause, RefreshCw, Activity, Server, Box, Fan, Zap, Cpu, BellRing, CheckCircle, Sliders, Database, ArrowRight, Waves, Lock, Unlock, Monitor, Settings, AlignJustify } from "lucide-react";

type PropValue = number | boolean | string;

interface Device {
  id: string;
  name: string;
  code: string;
  online: boolean;
  propertyName: string;
  propertyValue: PropValue;
  propertyType: string;
  modelId: string;
  animationState: string;
  animationDesc: string;
}

interface SyncRecord {
  id: string;
  time: string;
  deviceName: string;
  propName: string;
  propValue: string;
  source: string;
  result: string;
  user: string;
}

interface AnimLog {
  id: string;
  time: string;
  deviceName: string;
  propChange: string;
  modelId: string;
  animChange: string;
  result: string;
}

const initialDevices: Device[] = [
  { id: "conveyor-01", name: "输送带设备", code: "CONVEYOR-01", online: true, propertyName: "speed", propertyValue: 60, propertyType: "数值型", modelId: "3D-Conveyor-Model", animationState: "中速运行", animationDesc: "物料块移动" },
  { id: "fan-01", name: "工业风机", code: "FAN-01", online: true, propertyName: "speed", propertyValue: 80, propertyType: "数值型", modelId: "3D-Fan-Model", animationState: "高速旋转", animationDesc: "叶片快速旋转" },
  { id: "valve-01", name: "控制阀门", code: "VALVE-01", online: true, propertyName: "openRate", propertyValue: 75, propertyType: "数值型(%)", modelId: "3D-Valve-Model", animationState: "阀门打开", animationDesc: "阀门角度变化" },
  { id: "pump-01", name: "水泵设备", code: "PUMP-01", online: true, propertyName: "running", propertyValue: true, propertyType: "布尔型", modelId: "3D-Pump-Model", animationState: "运行中", animationDesc: "管道水流动画" },
  { id: "light-01", name: "警示灯", code: "LIGHT-01", online: true, propertyName: "alarm", propertyValue: false, propertyType: "布尔型", modelId: "3D-Light-Model", animationState: "正常", animationDesc: "绿色常亮" },
  { id: "robot-01", name: "机械臂", code: "ROBOT-01", online: true, propertyName: "action", propertyValue: "搬运中", propertyType: "枚举型", modelId: "3D-Robot-Model", animationState: "执行动作", animationDesc: "机械臂摆动" }
];

export function ThreeDEngineeringSimulation({ onClose }: { onClose?: () => void }) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("conveyor-01");
  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  const [syncRecords, setSyncRecords] = useState<SyncRecord[]>([]);
  const [animLogs, setAnimLogs] = useState<AnimLog[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [currentTime, setCurrentTime] = useState("");
  const [lastSyncTime, setLastSyncTime] = useState("");

  const updateTime = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
    setCurrentTime(timeStr);
    return timeStr;
  };

  useEffect(() => {
    const t = updateTime();
    setLastSyncTime(t);
    const initialSyncs = initialDevices.map((d, i) => ({
      id: `s-init-${i}`, time: t, deviceName: d.name, propName: d.propertyName, propValue: String(d.propertyValue), source: "工程虚拟仿真平台", result: "成功", user: "学生1"
    }));
    setSyncRecords(initialSyncs);

    const timer = setInterval(() => {
      updateTime();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeDevice = devices.find(d => d.id === selectedDeviceId) || devices[0];

  const handleSelectDevice = (id: string) => {
    setSelectedDeviceId(id);
    addAnimLog(devices.find(d => d.id === id)?.name || "", "查看", "无变化", "无变化");
  };

  const addSyncRecord = (devName: string, prop: string, val: string) => {
    const t = updateTime();
    setSyncRecords(prev => [{
      id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, time: t, deviceName: devName, propName: prop, propValue: val, source: "工程虚拟仿真平台", result: "成功", user: "学生1"
    }, ...prev].slice(0, 50));
    setLastSyncTime(t);
  };

  const addAnimLog = (devName: string, propChange: string, modelId: string, animChange: string) => {
    const t = updateTime();
    setAnimLogs(prev => [{
      id: `a-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, time: t, deviceName: devName, propChange, modelId, animChange, result: "成功"
    }, ...prev].slice(0, 50));
  };

  const calcConveyorAnim = (speed: number) => {
    if (speed === 0) return { state: "停止运行", desc: "输送带静止" };
    if (speed <= 30) return { state: "低速运行", desc: "物料块慢速移动" };
    if (speed <= 60) return { state: "中速运行", desc: "物料块移动" };
    return { state: "高速运行", desc: "物料块快速移动" };
  };

  const calcFanAnim = (speed: number) => {
    if (speed === 0) return { state: "停止旋转", desc: "风机静止" };
    if (speed <= 50) return { state: "低速旋转", desc: "风机叶片慢速旋转" };
    if (speed <= 80) return { state: "中速旋转", desc: "风机叶片中速旋转" };
    return { state: "高速旋转", desc: "风机叶片快速旋转" };
  };

  const calcValveAnim = (rate: number) => {
    if (rate === 0) return { state: "阀门关闭", desc: "阀门关闭" };
    if (rate <= 50) return { state: "阀门半开", desc: "阀门半开部分水流" };
    return { state: "阀门打开", desc: "阀门打开水流顺畅" };
  };

  const handleChangeProperty = (id: string, newPropValue: PropValue) => {
    setDevices(prev => prev.map(dev => {
      if (dev.id === id) {
        let newState = dev.animationState;
        let newDesc = dev.animationDesc;
        const oldPropValue = dev.propertyValue;
        
        if (dev.propertyName === "speed" && dev.id === "conveyor-01") {
            const anim = calcConveyorAnim(newPropValue as number);
            newState = anim.state; newDesc = anim.desc;
        } else if (dev.propertyName === "speed" && dev.id === "fan-01") {
            const anim = calcFanAnim(newPropValue as number);
            newState = anim.state; newDesc = anim.desc;
        } else if (dev.propertyName === "openRate") {
            const anim = calcValveAnim(newPropValue as number);
            newState = anim.state; newDesc = anim.desc;
        } else if (dev.propertyName === "running") {
            newState = newPropValue ? "运行中" : "停止运行";
            newDesc = newPropValue ? "管道水流动画" : "水流动画关闭";
        } else if (dev.propertyName === "alarm") {
            newState = newPropValue ? "报警闪烁" : "正常";
            newDesc = newPropValue ? "红色闪烁" : "绿色常亮";
        } else if (dev.propertyName === "action") {
            newState = newPropValue === "待机" ? "静止待机" : newPropValue === "复位中" ? "复位动作" : "执行动作";
            newDesc = newPropValue === "待机" ? "机械臂静止" : newPropValue === "复位中" ? "机械臂复位" : "机械臂摆动";
        }

        if (oldPropValue !== newPropValue) {
           addSyncRecord(dev.name, dev.propertyName, String(newPropValue));
           addAnimLog(dev.name, `${dev.propertyName} ${oldPropValue} → ${newPropValue}`, dev.modelId, `${dev.animationState} → ${newState}`);
        }

        return { ...dev, propertyValue: newPropValue, animationState: newState, animationDesc: newDesc };
      }
      return dev;
    }));
  };

  const handleSyncProps = () => {
    showToast("设备属性值已同步");
    addAnimLog("全局系统", "主动同步请求", "全部模型", "属性重载刷新");
    setLastSyncTime(updateTime());
  };

  return (
    <div className="bg-[#16181D] min-h-screen text-zinc-300 font-sans flex flex-col overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] border border-[#10A66A] text-[#10A66A] px-6 py-2.5 rounded shadow-[0_0_20px_rgba(16,166,106,0.3)] flex items-center gap-3 animate-in slide-in-from-top fade-in font-bold">
          <CheckCircle className="w-5 h-5"/>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="h-16 bg-[#1A1B23] border-b border-[#2A2D39] flex items-center justify-between px-6 shrink-0">
         <div className="flex items-center gap-4">
            {onClose && <button onClick={onClose} className="hover:text-white transition-colors p-1" title="返回"><ChevronLeft className="w-6 h-6"/></button>}
            <div>
               <h1 className="text-lg font-black text-white tracking-wide">3D工程虚拟仿真设备联动</h1>
               <h2 className="text-[11px] text-zinc-500 mt-0.5 max-w-[500px] truncate">
                 对接工程虚拟仿真平台设备，通过设备属性值变化驱动 3D 模型运行、停止、旋转、开合、闪烁、流动等状态动效。
               </h2>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <div className="flex gap-4 text-xs">
               <div className="flex flex-col">
                  <span className="text-zinc-500 font-bold">当前平台</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1"><Server className="w-3 h-3"/> 工程虚拟仿真平台</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-zinc-500 font-bold">当前场景</span>
                  <span className="text-white">智能产线与环境监测 3D 场景</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-zinc-500 font-bold">连接状态</span>
                  <span className="text-emerald-400 flex items-center gap-1"><Activity className="w-3 h-3"/> 已连接</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-zinc-500 font-bold">在线/接入</span>
                  <span className="text-white"><span className="text-emerald-400">6</span> / 6 台</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-zinc-500 font-bold">属性同步</span>
                  <span className="text-white">实时同步</span>
               </div>
               <div className="flex flex-col pr-4 border-r border-[#2A2D39]">
                  <span className="text-zinc-500 font-bold">最近同步</span>
                  <span className="text-white font-mono">{lastSyncTime}</span>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={() => showToast("已刷新设备状态")} className="p-2 bg-[#2A2D39] hover:bg-[#3A3D49] rounded border border-[#3A3D49] text-white transition-colors flex items-center gap-1 text-xs font-bold">
                 <RefreshCw className="w-3.5 h-3.5" /> 刷新设备状态
               </button>
               <button onClick={handleSyncProps} className="p-2 bg-[#10A66A]/20 hover:bg-[#10A66A]/30 rounded border border-[#10A66A]/50 text-[#10A66A] transition-colors flex items-center gap-1 text-xs font-bold">
                 <Database className="w-3.5 h-3.5" /> 同步属性值
               </button>
               <button onClick={() => {setSimulationRunning(!simulationRunning); showToast(simulationRunning ? "仿真已暂停" : "仿真已启动");}} className={`p-2 rounded border transition-colors flex items-center gap-1 text-xs font-bold ${simulationRunning ? 'bg-[#3A3D49] border-[#4A4D59] text-white' : 'bg-blue-500/20 text-blue-400 border-blue-500/50'}`}>
                 {simulationRunning ? <><Pause className="w-3.5 h-3.5" /> 暂停仿真</> : <><Play className="w-3.5 h-3.5" /> 启动仿真</>}
               </button>
               <button onClick={() => {setDevices(initialDevices); showToast("场景与设备已复位");}} className="p-2 bg-[#2A2D39] hover:bg-[#3A3D49] rounded border border-[#3A3D49] text-zinc-300 transition-colors flex items-center gap-1 text-xs font-bold text-rose-400">
                 重置场景
               </button>
            </div>
         </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[300px] border-r border-[#2A2D39] bg-[#1A1B23] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#2A2D39] bg-[#16181E]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Server className="w-4 h-4 text-[#10A66A]"/>工程虚拟仿真平台设备</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
             {devices.map(dev => (
               <div 
                 key={dev.id} 
                 onClick={() => handleSelectDevice(dev.id)}
                 className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedDeviceId === dev.id ? 'bg-[#2A2D39]/80 border-[#10A66A] shadow-[0_0_15px_rgba(16,166,106,0.15)] ring-1 ring-[#10A66A]/50' : 'bg-[#16181E] border-[#2A2D39] hover:border-[#3A3D49]'}`}
               >
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <div className="font-bold text-sm text-white">{dev.name}</div>
                     <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{dev.code}</div>
                   </div>
                   <span className="text-[10px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-1.5 py-0.5 rounded font-bold">在线</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2 text-xs">
                   <div className="bg-[#1A1B23] p-1.5 rounded border border-[#2A2D39]">
                     <span className="text-[10px] text-zinc-500 block mb-0.5">当前属性</span>
                     <span className="font-mono text-emerald-400 font-bold">{dev.propertyName}</span> = <span className="font-mono text-white">{String(dev.propertyValue)}{dev.propertyName === 'openRate' ? '%' : ''}</span>
                   </div>
                   <div className="bg-[#1A1B23] p-1.5 rounded border border-[#2A2D39]">
                     <span className="text-[10px] text-zinc-500 block mb-0.5">绑定 3D 模型</span>
                     <span className="font-mono text-zinc-300 text-[11px] truncate block">{dev.modelId}</span>
                   </div>
                 </div>
                 <div className="mt-2 text-[11px] text-zinc-400 border-t border-[#2A2D39] pt-2 flex items-center gap-1.5">
                   <Activity className="w-3.5 h-3.5 text-[#10A66A]" /> 
                   动效状态: <strong className="text-white">{dev.animationState}</strong>
                 </div>
               </div>
             ))}
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 bg-black flex flex-col relative">
           <div className="p-4 absolute top-0 left-0 right-0 z-10 pointer-events-none flex justify-between items-start">
             <div>
               <h2 className="text-white font-black text-xl tracking-wider drop-shadow-md">3D 仿真场景</h2>
               <div className="text-zinc-400 text-sm font-bold bg-black/40 px-2 py-0.5 rounded inline-block mt-1 border border-white/10 backdrop-blur">智能产线与环境监测 3D 场景</div>
             </div>
             {simulationRunning && <div className="bg-[#10A66A]/20 border border-[#10A66A]/50 text-[#10A66A] px-3 py-1 rounded-full text-xs font-bold animate-pulse backdrop-blur">仿真引擎渲染中</div>}
           </div>

           {/* Simulated 3D Canvas Area */}
           <div className="flex-1 relative flex items-center justify-center overflow-hidden [perspective:1000px]">
             {/* 3D Grid Floor */}
             <div className="absolute inset-0 top-[20%] border-t border-emerald-900/40" style={{ transform: 'rotateX(60deg) scale(2.5)', backgroundImage: 'linear-gradient(to right, rgba(16, 166, 106, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 166, 106, 0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
             
             {/* Virtual 3D Models Layout Group */}
             <div className="relative w-[800px] h-[500px]" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(15deg) rotateY(-5deg)' }}>
                {devices.map(dev => {
                   const isSelected = selectedDeviceId === dev.id;
                   const highlightClass = isSelected ? 'ring-4 ring-[#10A66A] shadow-[0_0_30px_rgba(16,166,106,0.6)] z-20 scale-105' : 'ring-1 ring-white/10 z-10 opacity-70 scale-100 hover:opacity-100 hover:scale-105';
                   
                   // Dynamic styles mimicking 3D animation
                   let animStyle = {};
                   let extraContent = null;

                   if (dev.id === 'conveyor-01' && dev.propertyValue > 0 && simulationRunning) {
                      animStyle = { animation: `slideBg ${100/(dev.propertyValue as number)}s linear infinite` };
                      extraContent = <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(16,166,106,0.3)_20px,rgba(16,166,106,0.3)_40px)]" style={animStyle}></div>;
                   } else if (dev.id === 'fan-01' && dev.propertyValue > 0 && simulationRunning) {
                      animStyle = { animation: `spin ${100/(dev.propertyValue as number)}s linear infinite` };
                      extraContent = <Fan className="w-16 h-16 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={animStyle} />;
                   } else if (dev.id === 'valve-01') {
                      extraContent = <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-4 bg-zinc-400 origin-center transition-all duration-500" style={{ transform: `rotate(${(dev.propertyValue as number) * 0.9}deg)` }}></div>;
                   } else if (dev.id === 'pump-01' && dev.propertyValue && simulationRunning) {
                      extraContent = <div className="absolute inset-x-0 bottom-0 h-8 bg-blue-500/50 animate-pulse overflow-hidden"><div className="w-[200%] h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMTBRNSAxNSAxMCAxMFQyMCAxMFYyMEgwWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PC9zdmc+')] animate-[slideBg_2s_linear_infinite]"></div></div>;
                   } else if (dev.id === 'light-01') {
                      const isAlarm = dev.propertyValue as boolean;
                      extraContent = <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 ${isAlarm ? 'bg-red-500 border-red-300 animate-ping' : 'bg-emerald-500 border-emerald-300'}`}></div>;
                   } else if (dev.id === 'robot-01') {
                      const action = dev.propertyValue as string;
                      const rot = action === '搬运中' ? (simulationRunning ? 'animate-[swing_2s_ease-in-out_infinite]' : 'rotate-45') : action === '复位中' ? 'rotate-0' : '-rotate-12';
                      extraContent = <div className={`absolute bottom-4 left-1/2 w-4 h-24 bg-orange-500 origin-bottom transition-all duration-1000 ${rot}`}><div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-6 bg-zinc-300 rounded"></div></div>
                   }

                   let positioning = "";
                   switch(dev.id) {
                     case 'conveyor-01': positioning = "bottom-10 left-10 w-96 h-20 bg-zinc-800"; break;
                     case 'fan-01': positioning = "top-10 left-10 w-32 h-32 bg-zinc-900 rounded-full flex items-center justify-center"; break;
                     case 'valve-01': positioning = "top-32 left-[400px] w-24 h-24 bg-zinc-800 rounded-full border-8 border-zinc-700"; break;
                     case 'pump-01': positioning = "top-10 right-20 w-32 h-32 bg-zinc-800 rounded flex flex-col items-center justify-end overflow-hidden"; break;
                     case 'light-01': positioning = "top-0 right-0 w-24 h-48 bg-zinc-800"; break;
                     case 'robot-01': positioning = "bottom-10 right-32 w-32 h-40 bg-zinc-900"; break;
                   }

                   return (
                     <div key={dev.id} onClick={() => handleSelectDevice(dev.id)} className={`absolute transform-style-3d cursor-pointer transition-all duration-300 flex items-center justify-center ${positioning} ${highlightClass}`}>
                       <div className="absolute -top-8 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white border border-white/20 whitespace-nowrap backdrop-blur">{dev.modelId}</div>
                       {extraContent}
                       {(!dev.propertyValue || dev.propertyValue === 0) && dev.propertyType === '数值型' && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm px-2 py-1 border border-white/20">STOPPED</span></div>}
                     </div>
                   );
                })}
             </div>
             
             {/* Environment Panel */}
             <div className="absolute bottom-6 left-6 bg-[#16181E]/80 backdrop-blur p-4 rounded-xl border border-white/10 flex items-center gap-6">
                <div className="flex flex-col">
                   <span className="text-zinc-400 text-[10px] font-bold">工段温度</span>
                   <span className="text-2xl font-black text-white">24.5<span className="text-sm">°C</span></span>
                </div>
                <div className="flex flex-col">
                   <span className="text-zinc-400 text-[10px] font-bold">系统能耗</span>
                   <span className="text-2xl font-black text-emerald-400">1.2<span className="text-sm">kW</span></span>
                </div>
                <div className="flex flex-col">
                   <span className="text-zinc-400 text-[10px] font-bold">告警信息</span>
                   <span className="text-2xl font-black text-rose-500">0</span>
                </div>
             </div>
           </div>
        </main>

        {/* Right Sidebar - Props configuration */}
        <aside className="w-[360px] border-l border-[#2A2D39] bg-[#1A1B23] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#2A2D39] bg-[#16181E]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Sliders className="w-4 h-4 text-[#10A66A]"/>设备属性与模型动效</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
             <div className="bg-[#16181E] border border-[#2A2D39] rounded-lg overflow-hidden">
                <div className="p-3 bg-[#2A2D39]/40 border-b border-[#2A2D39]">
                  <h4 className="font-bold text-white text-sm">{activeDevice.name}</h4>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{activeDevice.code}</div>
                </div>
                <div className="p-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-zinc-500 mb-0.5">平台来源</div>
                    <div className="text-emerald-400 font-bold">工程虚拟仿真平台</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 mb-0.5">绑定模型</div>
                    <div className="text-zinc-300 font-mono font-bold truncate" title={activeDevice.modelId}>{activeDevice.modelId}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 mb-0.5">属性名称</div>
                    <div className="text-zinc-300 font-mono bg-zinc-800 px-1 py-0.5 inline-block rounded">{activeDevice.propertyName}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 mb-0.5">属性类型</div>
                    <div className="text-zinc-300">{activeDevice.propertyType}</div>
                  </div>
                </div>
             </div>

             <div className="bg-[#16181E] border border-[#2A2D39] rounded-lg p-3">
                <div className="flex justify-between items-center mb-3">
                   <h4 className="font-bold text-white flex items-center gap-2 text-sm"><Settings className="w-4 h-4 text-sky-400"/>属性调节图元控件</h4>
                   <div className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded text-[10px] font-bold border border-sky-500/20">{activeDevice.propertyName} = {String(activeDevice.propertyValue)}{activeDevice.propertyName === 'openRate' ? '%' : ''}</div>
                </div>
                
                {/* Dynamic Controls Based on Property Type */}
                {typeof activeDevice.propertyValue === "number" && (
                  <div className="space-y-4">
                     <input type="range" className="w-full h-2 bg-[#2A2D39] rounded-lg appearance-none cursor-pointer accent-[#10A66A]" 
                       min={0} max={100} value={activeDevice.propertyValue} 
                       onChange={(e) => handleChangeProperty(activeDevice.id, Number(e.target.value))}
                     />
                     <div className="grid grid-cols-4 gap-2">
                       {activeDevice.propertyName === 'openRate' ? (
                          <>
                            <button onClick={() => handleChangeProperty(activeDevice.id, 0)} className="py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white rounded text-xs transition-colors">关闭阀门</button>
                            <button onClick={() => handleChangeProperty(activeDevice.id, 50)} className="py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white rounded text-xs transition-colors">半开阀门</button>
                            <button onClick={() => handleChangeProperty(activeDevice.id, 75)} className="py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white rounded text-xs transition-colors">打开阀门</button>
                            <button onClick={() => handleChangeProperty(activeDevice.id, 100)} className="py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white rounded text-xs transition-colors">全开</button>
                          </>
                       ) : (
                          <>
                            <button onClick={() => handleChangeProperty(activeDevice.id, 0)} className="py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white rounded text-xs transition-colors hover:text-rose-400">停止</button>
                            <button onClick={() => handleChangeProperty(activeDevice.id, 30)} className="py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white rounded text-xs transition-colors">低速</button>
                            <button onClick={() => handleChangeProperty(activeDevice.id, 60)} className="py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white rounded text-xs transition-colors text-emerald-400">中速</button>
                            <button onClick={() => handleChangeProperty(activeDevice.id, 90)} className="py-1.5 bg-[#2A2D39] hover:bg-[#3A3D49] border border-[#3A3D49] text-white rounded text-xs transition-colors text-amber-400">高速</button>
                          </>
                       )}
                     </div>
                  </div>
                )}

                {typeof activeDevice.propertyValue === "boolean" && (
                  <div className="grid grid-cols-2 gap-3">
                     {activeDevice.propertyName === 'running' ? (
                       <>
                         <button onClick={() => handleChangeProperty(activeDevice.id, true)} className={`py-2 rounded font-bold text-xs transition-colors ${activeDevice.propertyValue ? 'bg-[#10A66A] text-white border border-[#10A66A]' : 'bg-[#2A2D39] text-zinc-300 border border-[#3A3D49] hover:bg-[#3A3D49]'}`}>启动水泵</button>
                         <button onClick={() => handleChangeProperty(activeDevice.id, false)} className={`py-2 rounded font-bold text-xs transition-colors ${!activeDevice.propertyValue ? 'bg-rose-500 text-white border border-rose-500' : 'bg-[#2A2D39] text-zinc-300 border border-[#3A3D49] hover:bg-[#3A3D49]'}`}>停止水泵</button>
                       </>
                     ) : (
                       <>
                         <button onClick={() => handleChangeProperty(activeDevice.id, true)} className={`py-2 rounded font-bold text-xs transition-colors ${activeDevice.propertyValue ? 'bg-red-500 text-white border border-red-500' : 'bg-[#2A2D39] text-zinc-300 border border-[#3A3D49] hover:bg-[#3A3D49]'}`}>开启报警</button>
                         <button onClick={() => handleChangeProperty(activeDevice.id, false)} className={`py-2 rounded font-bold text-xs transition-colors ${!activeDevice.propertyValue ? 'bg-emerald-500 text-white border border-emerald-500' : 'bg-[#2A2D39] text-zinc-300 border border-[#3A3D49] hover:bg-[#3A3D49]'}`}>关闭报警</button>
                       </>
                     )}
                  </div>
                )}

                {typeof activeDevice.propertyValue === "string" && (
                  <div className="grid grid-cols-3 gap-2">
                     <button onClick={() => handleChangeProperty(activeDevice.id, "待机")} className={`py-2 rounded font-bold text-xs transition-colors ${activeDevice.propertyValue === '待机' ? 'bg-[#10A66A] text-white' : 'bg-[#2A2D39] text-zinc-300 hover:bg-[#3A3D49]'}`}>机械臂待机</button>
                     <button onClick={() => handleChangeProperty(activeDevice.id, "搬运中")} className={`py-2 rounded font-bold text-xs transition-colors ${activeDevice.propertyValue === '搬运中' ? 'bg-blue-500 text-white' : 'bg-[#2A2D39] text-zinc-300 hover:bg-[#3A3D49]'}`}>机械臂搬运</button>
                     <button onClick={() => handleChangeProperty(activeDevice.id, "复位中")} className={`py-2 rounded font-bold text-xs transition-colors ${activeDevice.propertyValue === '复位中' ? 'bg-amber-500 text-white' : 'bg-[#2A2D39] text-zinc-300 hover:bg-[#3A3D49]'}`}>机械臂复位</button>
                  </div>
                )}
             </div>

             <div className="bg-[#10A66A]/10 border border-[#10A66A]/30 rounded-lg p-4 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-[#10A66A]"></div>
                 <h4 className="font-bold text-[#10A66A] mb-2 text-sm flex items-center gap-2"><Monitor className="w-4 h-4"/>联动模型动效反馈</h4>
                 <div className="space-y-1">
                   <div className="flex justify-between text-xs">
                     <span className="text-zinc-400">当前模型状态</span>
                     <span className="text-white font-bold">{activeDevice.animationState}</span>
                   </div>
                   <div className="flex justify-between text-xs">
                     <span className="text-zinc-400">动效表现</span>
                     <span className="text-emerald-400 font-bold">{activeDevice.animationDesc}</span>
                   </div>
                 </div>
             </div>

             {/* Model State Preview */}
             <div className="bg-[#16181E] border border-[#2A2D39] rounded-lg overflow-hidden flex flex-col">
                <div className="p-3 bg-[#2A2D39]/40 border-b border-[#2A2D39]">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2"><Box className="w-4 h-4 text-emerald-400"/>模型状态预览</h4>
                </div>
                <div className="p-3 grid grid-cols-2 gap-3 text-xs">
                   {devices.map(d => (
                     <div key={d.id} className="flex flex-col">
                        <span className="text-zinc-500 font-bold">{d.name.replace('设备','')}</span>
                        <span className={`font-bold mt-0.5 truncate ${d.id === selectedDeviceId ? 'text-white' : 'text-zinc-400'}`} title={d.animationState}>{d.animationState}</span>
                     </div>
                   ))}
                   <div className="flex flex-col">
                      <span className="text-zinc-500 font-bold">管道水流</span>
                      <span className="font-bold mt-0.5 truncate text-zinc-400">{devices.find(d=>d.id==='pump-01')?.propertyValue ? '流动中' : '静止'}</span>
                   </div>
                </div>
             </div>
          </div>
        </aside>
      </div>

      {/* Bottom Log Panels */}
      <div className="h-48 bg-[#1A1B23] flex border-t border-[#2A2D39] shrink-0">
         <div className="flex-1 border-r border-[#2A2D39] flex flex-col">
            <div className="h-10 bg-[#16181E] border-b border-[#2A2D39] flex items-center px-4 shrink-0 font-bold text-sm text-white">
              状态同步记录
            </div>
            <div className="flex-1 overflow-auto">
               <table className="w-full text-left text-xs">
                 <thead className="sticky top-0 bg-[#1A1B23] border-b border-[#2A2D39] text-zinc-500">
                   <tr>
                     <th className="p-2 pl-4 font-normal">时间</th>
                     <th className="p-2 font-normal">设备名称</th>
                     <th className="p-2 font-normal">属性名</th>
                     <th className="p-2 font-normal">属性值</th>
                     <th className="p-2 font-normal">同步来源</th>
                     <th className="p-2 font-normal">同步结果</th>
                     <th className="p-2 font-normal">操作人</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#2A2D39]">
                    {syncRecords.map(r => (
                      <tr key={r.id} className="hover:bg-[#2A2D39]/50 transition-colors text-zinc-300">
                         <td className="p-2 pl-4">{r.time}</td>
                         <td className="p-2">{r.deviceName}</td>
                         <td className="p-2 font-mono text-emerald-400">{r.propName}</td>
                         <td className="p-2 font-bold text-white">{r.propValue}</td>
                         <td className="p-2">{r.source}</td>
                         <td className="p-2 text-emerald-400">{r.result}</td>
                         <td className="p-2 text-zinc-500">{r.user}</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
         </div>
         <div className="flex-1 flex flex-col">
            <div className="h-10 bg-[#16181E] border-b border-[#2A2D39] flex items-center px-4 shrink-0 font-bold text-sm text-zinc-300">
              动效触发日志
            </div>
            <div className="flex-1 overflow-auto">
               <table className="w-full text-left text-xs">
                 <thead className="sticky top-0 bg-[#1A1B23] border-b border-[#2A2D39] text-zinc-500">
                   <tr>
                     <th className="p-2 pl-4 font-normal">时间</th>
                     <th className="p-2 font-normal">设备名称</th>
                     <th className="p-2 font-normal">属性变化</th>
                     <th className="p-2 font-normal">3D模型</th>
                     <th className="p-2 font-normal">动效变化</th>
                     <th className="p-2 font-normal">结果</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#2A2D39]">
                    {animLogs.map(r => (
                      <tr key={r.id} className="hover:bg-[#2A2D39]/50 transition-colors text-zinc-300">
                         <td className="p-2 pl-4">{r.time}</td>
                         <td className="p-2">{r.deviceName}</td>
                         <td className="p-2 text-sky-400">{r.propChange}</td>
                         <td className="p-2 font-mono text-zinc-400">{r.modelId}</td>
                         <td className="p-2 font-bold text-amber-400">{r.animChange}</td>
                         <td className="p-2 text-emerald-400">{r.result}</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
         </div>
      </div>
      
      {/* Absolute Add-on for Mapping Table required by instructions */}
      <div className="absolute top-[80px] right-[380px] bg-[#16181E]/95 border border-[#2A2D39] backdrop-blur rounded-lg shadow-2xl w-[600px] z-30 transition-all">
         <div className="p-2 bg-[#2A2D39]/50 border-b border-[#2A2D39] font-bold text-white text-xs flex items-center justify-between">
           <span className="flex items-center gap-1.5"><AlignJustify className="w-3.5 h-3.5 text-[#10A66A]"/> 属性值与动效映射表</span>
         </div>
         <div className="p-2">
            <table className="w-full text-left text-[10px]">
               <thead className="text-zinc-500">
                 <tr>
                   <th className="p-1 font-normal">设备</th>
                   <th className="p-1 font-normal">属性名</th>
                   <th className="p-1 font-normal">属性值</th>
                   <th className="p-1 font-normal">绑定模型</th>
                   <th className="p-1 font-normal">模型状态</th>
                   <th className="p-1 font-normal">动效表现</th>
                 </tr>
               </thead>
               <tbody className="text-zinc-300">
                 {devices.map(d => (
                   <tr key={`map-${d.id}`} className="hover:bg-[#2A2D39]/30">
                     <td className="p-1 font-bold">{d.name}</td>
                     <td className="p-1 text-emerald-400 font-mono">{d.propertyName}</td>
                     <td className="p-1">{String(d.propertyValue)}{d.propertyName==='openRate'?'%':''}</td>
                     <td className="p-1 font-mono text-zinc-500">{d.modelId}</td>
                     <td className="p-1 font-bold text-sky-400">{d.animationState}</td>
                     <td className="p-1">{d.animationDesc}</td>
                   </tr>
                 ))}
               </tbody>
            </table>
         </div>
      </div>
      <style>{`
        @keyframes slideBg {
          from { background-position: 0 0; }
          to { background-position: -40px 0; }
        }
        @keyframes swing {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
      `}</style>
    </div>
  );
}
