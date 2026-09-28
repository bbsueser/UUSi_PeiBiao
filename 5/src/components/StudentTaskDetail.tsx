import React, { useState } from "react";
import { 
  ArrowLeft,
  BookOpen, 
  Clock, 
  User, 
  Monitor,
  Zap,
  Check,
  CheckCircle,
  Maximize2,
  RefreshCcw,
  X,
  FileText,
  PenTool,
  Camera,
  Send,
  Info,
  BookOpen as BookIcon,
  BrainCircuit,
  Image,
  Layers,
  ListOrdered,
  Save,
  Layout,
  ChevronRight
} from "lucide-react";
import ExperimentEnvironmentClient from "./ExperimentEnvironmentClient";
import { experimentEnvironments } from "../data/environments";

interface StudentTaskDetailProps {
  taskId: string;
  onBack: () => void;
  showToast: (msg: string) => void;
}

export default function StudentTaskDetail({ taskId, onBack, showToast }: StudentTaskDetailProps) {
  // 1. Basic Learning States
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(4243); // 01:10:43
  
  // 2. Navigation State (Left Sidebar)
  const [activeMenu, setActiveMenu] = useState<"intro" | "guidebook" | "manual" | "notes" | "ai" | "screenshots" | "courses">("intro");

  // 3. Environment State
  const environmentId = "iot-data-collection"; 
  const targetEnv = experimentEnvironments.find(e => e.id === environmentId) || experimentEnvironments[0];

  // Timer Effect
  React.useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':');
  };

  const handleCapture = () => {
    showToast("当前屏幕已保存至截图记录。");
  };

  return (
    <div id="u-student-task-detail" className="h-screen flex flex-col bg-[#F8FAF9] animate-in fade-in duration-300 overflow-hidden font-sans antialiased text-zinc-800">
      
      {/* 顶部白色导航栏 */}
      <div className="h-14 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-6">
           <button 
             onClick={onBack}
             className="flex items-center gap-2 text-zinc-500 hover:text-[#10A66A] font-bold text-sm transition-colors cursor-pointer group"
           >
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
             <span>返回首页</span>
           </button>
           <div className="w-px h-5 bg-zinc-200 mx-2" />
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#10A66A] flex items-center justify-center text-white">
                 <Monitor className="w-5 h-5" />
              </div>
              <h1 className="text-base font-black text-zinc-900 tracking-tight">实验环境：工程虚拟仿真</h1>
           </div>
        </div>

        <div className="flex items-center gap-10">
           <div className="flex items-center gap-2.5 px-4 py-1.5 bg-[#EAF8F1] border border-[#CFEFE0] rounded-full shadow-inner">
              <Clock className="w-4 h-4 text-[#10A66A]" />
              <span className="text-xs font-bold text-zinc-500">耗时：</span>
              <span className="text-xs font-black text-[#10A66A] font-mono tracking-widest">{formatTime(elapsedSeconds)}</span>
           </div>

           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right">
                   <p className="text-xs font-black text-zinc-900">学生1</p>
                   <p className="text-[10px] text-zinc-400 font-bold tracking-widest leading-none">ST-001</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#10A66A] flex items-center justify-center text-white font-black text-base shadow-sm border border-white">
                   学
                </div>
              </div>
              <div className="w-px h-5 bg-zinc-200" />
              <button className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer">
                 <X className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>

      {/* 任务详情统计条 */}
      <div className="h-10 bg-white border-b border-zinc-100 px-6 flex items-center gap-10 shrink-0 overflow-x-auto scrollbar-none shadow-sm z-10">
         <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">当前进度</span>
            <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
               <div className="h-full bg-[#10A66A]" style={{ width: "25%" }} />
            </div>
            <span className="text-[10px] font-black text-[#10A66A]">25.00%</span>
         </div>
         <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">指导教师</span>
            <span className="text-[11px] font-black text-zinc-700">马云海</span>
         </div>
         <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">任务类型</span>
            <span className="text-[11px] font-black text-[#10A66A] bg-[#EAF8F1] px-2 py-0.5 rounded">仿真实验</span>
         </div>
         <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">任务进度</span>
            <span className="text-[11px] font-black text-zinc-700">1 / 4 阶段</span>
         </div>
      </div>

      {/* 主体分屏区域 */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 左侧：学习资料与工具区 (32%) */}
        <div className="w-[32%] bg-white border-r border-zinc-200 flex flex-col shadow-[4px_0_12px_rgba(0,0,0,0.02)] z-10">
           <div className="h-10 px-6 flex items-center justify-between bg-[#F8FAF9] border-b border-zinc-100 shrink-0">
              <span className="text-[11px] font-black text-zinc-800 tracking-tight flex items-center gap-2">
                 <BookOpen className="w-3.5 h-3.5 text-[#10A66A]" />
                 学习资料与工具
              </span>
           </div>

           <div className="flex-1 flex overflow-hidden">
              {/* 竖向导航菜单 */}
              <div className="w-16 bg-white border-r border-zinc-50 flex flex-col items-center py-6 gap-6 shrink-0">
                 {[
                   { id: "intro", label: "简介", icon: Info },
                   { id: "guidebook", label: "指导书", icon: BookIcon },
                   { id: "manual", label: "操作手册", icon: ListOrdered },
                   { id: "notes", label: "学习笔记", icon: PenTool },
                   { id: "ai", label: "AI咨询", icon: BrainCircuit },
                   { id: "screenshots", label: "截屏记录", icon: Image },
                   { id: "courses", label: "关联课程", icon: Layers },
                 ].map(item => (
                   <button 
                     key={item.id}
                     onClick={() => setActiveMenu(item.id as any)}
                     className={`flex flex-col items-center gap-1.5 transition-all group ${activeMenu === item.id ? "text-[#10A66A]" : "text-zinc-400 hover:text-[#10A66A]"}`}
                   >
                     <div className={`p-2 rounded-xl transition-all ${activeMenu === item.id ? "bg-[#EAF8F1] shadow-sm ring-1 ring-[#CFEFE0]" : "group-hover:bg-zinc-50"}`}>
                        <item.icon className="w-5 h-5 shadow-sm" />
                     </div>
                     <span className="text-[9px] font-black whitespace-nowrap">{item.label}</span>
                   </button>
                 ))}
              </div>

              {/* 内容动态展示区 */}
              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                 <div className="h-12 flex items-center px-6 border-b border-zinc-50 shrink-0 font-sans">
                    <h3 className="text-xs font-black text-zinc-900 flex items-center gap-2">
                       <span className="w-1 h-3.5 bg-[#10A66A] rounded-full" />
                       {activeMenu === "intro" && "实验简介"}
                       {activeMenu === "guidebook" && "课程指导书"}
                       {activeMenu === "manual" && "操作手册"}
                       {activeMenu === "notes" && "学习笔记"}
                       {activeMenu === "ai" && "AI 咨询服务"}
                       {activeMenu === "screenshots" && "截屏记录"}
                       {activeMenu === "courses" && "关联课程"}
                    </h3>
                 </div>

                 <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-100">
                    {/* 1. 简介 */}
                    {activeMenu === "intro" && (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-4">
                           <h4 className="text-[11px] font-black text-zinc-800">实训目标</h4>
                           <p className="text-[11px] text-zinc-500 font-bold leading-relaxed">掌握物联网数据采集报文结构，验证传感器接入云平台的通讯全流程。涵盖网关配置、协议解析与数据上传。</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-[#F8FAF9] p-3 rounded-xl border border-zinc-100">
                              <p className="text-[8px] text-zinc-400 font-black mb-1 uppercase tracking-widest">任务时限</p>
                              <p className="text-[11px] font-black text-zinc-700">120 分钟</p>
                           </div>
                           <div className="bg-[#F8FAF9] p-3 rounded-xl border border-zinc-100">
                              <p className="text-[8px] text-zinc-400 font-black mb-1 uppercase tracking-widest">当前状态</p>
                              <p className="text-[11px] font-black text-[#10A66A]">进行中</p>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* 2. 指导书 */}
                    {activeMenu === "guidebook" && (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="p-4 bg-[#EAF8F1] border border-[#CFEFE0] rounded-xl text-[11px] font-black text-[#10A66A] flex justify-between items-center cursor-pointer hover:bg-[#DFF5E9] transition-all">
                           <span>物联网实训指导书_V3.1.pdf</span>
                           <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="space-y-4 text-[10px] text-zinc-500 font-medium leading-loose">
                           <p>【实训环境】人工智能算法训练平台 物理仿真沙箱控制台。</p>
                           <p>【连接要求】设置 MQTT 端口为 1883，认证模式选择 Token 验证。</p>
                           <p>【注意事项】所有子设备接入前需完成资产 ID 在云端的注册。</p>
                        </div>
                      </div>
                    )}

                    {/* 3. 手册 */}
                    {activeMenu === "manual" && (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        {[
                          { s: "Step 01", t: "平台注册与沙箱初始化" },
                          { s: "Step 02", t: "环境拓扑构建与布线" },
                          { s: "Step 03", t: "通信参数映射配置" },
                          { s: "Step 04", t: "数据流验证与报告提交" }
                        ].map((s, i) => (
                           <div key={i} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl hover:border-[#10A66A] transition-all cursor-pointer">
                              <span className="text-[9px] text-[#10A66A] font-black uppercase">{s.s}</span>
                              <h6 className="text-[11px] font-black text-zinc-800">{s.t}</h6>
                           </div>
                        ))}
                      </div>
                    )}

                    {/* 4. 笔记 */}
                    {activeMenu === "notes" && (
                      <div className="h-full flex flex-col gap-4 animate-in fade-in duration-300">
                        <textarea 
                           className="flex-1 w-full bg-zinc-50 rounded-xl p-4 text-[11px] font-medium border border-zinc-100 outline-none focus:border-[#CFEFE0] resize-none"
                           placeholder="在此输入并记录您的实训过程与报文分析..."
                        />
                        <button className="py-2 bg-[#10A66A] text-white rounded-lg text-[10px] font-black shadow-lg shadow-emerald-500/10 active:scale-95 transition-all">
                           <Save className="w-3.5 h-3.5 inline mr-1" /> 保存当前笔记
                        </button>
                      </div>
                    )}

                    {/* 5. AI 咨询 */}
                    {activeMenu === "ai" && (
                      <div className="h-full flex flex-col animate-in fade-in duration-300">
                        <div className="flex-1 bg-zinc-50 rounded-xl p-4 overflow-y-auto space-y-4 mb-4 font-sans">
                           <div className="flex gap-2">
                              <div className="w-6 h-6 rounded-lg bg-[#10A66A] flex items-center justify-center text-white shrink-0"><BrainCircuit className="w-3.5 h-3.5" /></div>
                              <div className="bg-white border border-[#CFEFE0] p-2.5 rounded-xl text-[10px] font-medium text-zinc-600 shadow-sm">
                                 你好，我是 AI 助手。有什么可以帮您的？
                              </div>
                           </div>
                        </div>
                        <div className="relative">
                           <input placeholder="请输入您的问题..." className="w-full border border-zinc-200 rounded-xl pl-4 pr-10 py-2.5 text-[10px] font-bold outline-none focus:border-[#10A66A]" />
                           <button className="absolute right-2 top-2 p-1.5 bg-[#10A66A] text-white rounded-lg shadow-sm"><Send className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    )}

                    {/* 6. 截屏记录 */}
                    {activeMenu === "screenshots" && (
                       <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                          {[1, 2].map(i => (
                             <div key={i} className="aspect-video bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-center text-zinc-300 group relative cursor-pointer hover:border-[#10A66A] transition-all">
                                <Image className="w-6 h-6" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                   <Maximize2 className="w-4 h-4 text-white" />
                                </div>
                             </div>
                          ))}
                       </div>
                    )}

                    {activeMenu === "courses" && (
                       <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="bg-zinc-900 text-white rounded-xl p-4">
                             <h5 className="text-[11px] font-black">物联网通信技术及应用实训</h5>
                             <p className="text-[9px] text-zinc-500 mt-1 uppercase tracking-widest font-black">PROGRESS: 25%</p>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* 内容底部操作栏 */}
                 <div className="p-4 border-t border-zinc-100 flex gap-2 shrink-0 bg-zinc-50/50">
                    <button className="flex-1 py-1.8 bg-white border border-zinc-200 text-zinc-500 text-[10px] font-black rounded-lg">学习简介</button>
                    <button className="flex-1 py-1.8 bg-[#10A66A] text-white text-[10px] font-black rounded-lg shadow-sm shadow-emerald-600/10">完成学习</button>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：实验环境区 (68%) */}
        <div className="flex-1 flex flex-col bg-[#F1F3F5] overflow-hidden relative">
           {/* 页签 */}
           <div className="h-10 px-4 flex items-end gap-1 shrink-0">
              <div className="h-9 px-6 bg-white border border-zinc-200 border-b-white rounded-t-lg flex items-center gap-3 text-[11px] font-black text-[#10A66A] z-10 shadow-[0_-2px_6px_rgba(0,0,0,0.02)]">
                 <Monitor className="w-3.5 h-3.5" />
                 <span>工程虚拟仿真</span>
                 <div className="w-1.5 h-1.5 bg-[#10A66A] rounded-full animate-pulse" />
              </div>
              <button className="h-9 w-9 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"><X className="w-4 h-4" /></button>
           </div>

           {/* 工具栏 */}
           <div className="h-10 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0 z-10">
              <div className="flex items-center gap-1.5">
                 {["新建", "导入", "导出", "撤销", "重做", "对齐"].map(btn => (
                   <button key={btn} className="px-2.5 py-1 text-[10px] font-black text-zinc-500 hover:text-[#10A66A] hover:bg-[#EAF8F1] rounded transition-all">{btn}</button>
                 ))}
                 <div className="w-px h-4 bg-zinc-200 mx-2" />
                 <button className="p-1.5 text-zinc-400 hover:text-[#10A66A] rounded transition-all"><RefreshCcw className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-4">
                 <button 
                  onClick={handleCapture}
                  className="px-4 py-1.5 bg-[#EAF8F1] text-[#10A66A] hover:bg-[#10A66A] hover:text-white border border-[#CFEFE0] rounded-lg text-[10px] font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                 >
                    <Camera className="w-4 h-4" />
                    立即截屏
                 </button>
              </div>
           </div>

           {/* 画布 */}
           <div className="flex-1 relative overflow-hidden bg-white">
              <ExperimentEnvironmentClient 
                envId={environmentId} 
                onCapture={handleCapture}
                showToast={showToast}
                isEmbedded={true}
              />
           </div>
        </div>
      </div>
    </div>
  );
}
