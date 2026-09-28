import React, { useState } from "react";
import { 
  BookOpen, 
  Clock, 
  ClipboardCheck, 
  ListTodo, 
  Search, 
  GraduationCap, 
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Inbox
} from "lucide-react";

interface StudentHomeProps {
  onEnterDetail: (taskId: string) => void;
  showToast: (msg: string) => void;
}

export default function StudentHome({ onEnterDetail, showToast }: StudentHomeProps) {
  const [activeTeachTab, setActiveTeachTab] = useState<"ongoing" | "completed">("ongoing");
  const [activeTaskTab, setActiveTaskTab] = useState<"teaching" | "learning" | "completed">("teaching");
  const [searchQuery, setSearchQuery] = useState("");

  const [studentTasks, setStudentTasks] = useState(() => {
    const defaultTasks = [
      {
        id: "1765522294814",
        courseName: "课程演示-物联网数据采集1765522294814",
        teacherName: "教师1",
        publishTime: "2025-12-12 14:51:46",
        taskType: "teaching",
        taskDuration: 60,
        usedDuration: 0,
        totalDuration: 60,
        progress: 0,
        status: "未进行"
      },
      {
        id: "1765502054759",
        courseName: "课程演示-物联网数据采集1765502054759",
        teacherName: "教师1",
        publishTime: "2025-12-13 09:20:16",
        taskType: "learning",
        taskDuration: 90,
        usedDuration: 35,
        totalDuration: 90,
        progress: 38.89,
        status: "进行中"
      }
    ];

    const savedTasks = localStorage.getItem("student_learning_tasks");
    const selfAdded = savedTasks ? JSON.parse(savedTasks) : [];
    
    const combined = [...defaultTasks];
    selfAdded.forEach((task: any) => {
      if (!combined.find(t => t.id === task.id)) {
        combined.push({
          id: task.id,
          courseName: task.courseName,
          teacherName: "自主学习",
          publishTime: task.joinTime,
          taskType: "learning",
          taskDuration: task.totalDuration,
          usedDuration: task.usedDuration,
          totalDuration: task.totalDuration,
          progress: task.progress,
          status: task.status
        });
      }
    });

    return combined;
  });

  const filteredTasks = studentTasks.filter(task => {
    // Search query match
    if (searchQuery.trim() && !task.courseName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Tab filter matching
    if (activeTaskTab === "teaching" && task.taskType !== "teaching") return false;
    if (activeTaskTab === "learning" && task.taskType !== "learning") return false;
    if (activeTaskTab === "completed" && task.progress < 100) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 顶部欢迎卡片 */}
      <div className="bg-gradient-to-r from-[#EAF8F1] to-[#F8FAF9] border border-[#CFEFE0] rounded-2xl p-6 relative overflow-hidden shadow-xs">
        <div className="absolute right-0 top-0 transform translate-x-4 -translate-y-4 opacity-10">
          <GraduationCap className="w-56 h-56 text-[#10A66A]" />
        </div>
        <div className="space-y-4 relative z-10">
          <div>
            <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
              Hi，学生1 同学 下午好 欢迎回来～
            </h1>
            <p className="text-xs text-[#10A66A] font-medium mt-1">今天又是收获满满的一天，开启你的物联网虚拟实训之旅吧！</p>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-[#CFEFE0]/50 text-xs text-zinc-650">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#10A66A] shrink-0" />
              <span><strong className="text-zinc-800">学院：</strong>新大陆时代科技-产品演示</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#10A66A] shrink-0" />
              <span><strong className="text-zinc-800">专业：</strong>通识教育</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#10A66A] shrink-0" />
              <span><strong className="text-zinc-800">班级：</strong>演示班级</span>
            </div>
          </div>
        </div>
      </div>

      {/* 首页中部数据统计卡片（横向排列，分为两组） */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 第一组：待完成任务和已完成任务 (占用5/12宽) */}
        <div className="lg:col-span-5 bg-white border border-[#CFEFE0] rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#1F2937] tracking-tight flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-[#10A66A] rounded-xs" />
              学习任务情况
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* 待办任务 */}
            <div className="bg-[#EAF8F1]/40 border border-[#CFEFE0] rounded-xl p-4 flex flex-col justify-between h-24 shadow-xs">
              <span className="text-zinc-500 text-xs font-bold block">待办任务</span>
              <div className="flex items-baseline gap-1 mt-auto">
                <span className="text-3xl font-black text-[#10A66A] font-mono leading-none">3</span>
                <span className="text-xs text-zinc-500 font-bold">个</span>
              </div>
            </div>

            {/* 已完成任务 */}
            <div className="bg-slate-50 border border-zinc-150 rounded-xl p-4 flex flex-col justify-between h-24 shadow-xs">
              <span className="text-zinc-500 text-xs font-bold block">已完成任务</span>
              <div className="flex items-baseline gap-1 mt-auto">
                <span className="text-3xl font-black text-zinc-450 font-mono leading-none">0</span>
                <span className="text-xs text-zinc-500 font-bold">个</span>
              </div>
            </div>
          </div>
        </div>

        {/* 第二组：学习时长和实验报告 (占用7/12宽) */}
        <div className="lg:col-span-7 bg-white border border-[#CFEFE0] rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#1F2937] tracking-tight flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-[#10A66A] rounded-xs" />
              学习时长与成果
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* 已用时长 */}
            <div className="bg-[#EAF8F1]/40 border border-[#CFEFE0] rounded-xl p-4 flex flex-col justify-between h-24 shadow-xs">
              <span className="text-zinc-500 text-xs font-bold block">已用时长</span>
              <div className="flex items-baseline gap-1 mt-auto">
                <span className="text-2.5xl font-black text-[#10A66A] font-mono leading-none">490</span>
                <span className="text-xs text-zinc-500 font-bold">分钟</span>
              </div>
            </div>

            {/* 剩余时长 */}
            <div className="bg-[#EAF8F1]/40 border border-[#CFEFE0] rounded-xl p-4 flex flex-col justify-between h-24 shadow-xs">
              <span className="text-zinc-500 text-xs font-bold block">剩余时长</span>
              <div className="flex items-baseline gap-1 mt-auto">
                <span className="text-2.5xl font-black text-[#10A66A] font-mono leading-none">10570</span>
                <span className="text-xs text-zinc-500 font-bold">分钟</span>
              </div>
            </div>

            {/* 实验报告数 */}
            <div className="bg-slate-50 border border-zinc-150 rounded-xl p-4 flex flex-col justify-between h-24 shadow-xs">
              <span className="text-zinc-500 text-xs font-bold block">实验报告数</span>
              <div className="flex items-baseline gap-1 mt-auto">
                <span className="text-2.5xl font-black text-zinc-400 font-mono leading-none">0</span>
                <span className="text-xs text-zinc-500 font-bold">份</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 我的教学任务 & 我的任务列表 区域 (左右双栏布局) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. 左侧：最新实训任务 */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[#10A66A]" />
              <span>最新实训任务</span>
            </h3>

            {/* Tabs 进行中｜已完成 */}
            <div className="flex bg-[#F8FAF9] p-0.5 rounded-lg border border-zinc-200 text-[11px] font-bold">
              <button 
                onClick={() => {
                  setActiveTeachTab("ongoing");
                  showToast("已切换到进行中任务");
                }}
                className={`px-3 py-1.2 rounded-md transition-all cursor-pointer ${
                  activeTeachTab === "ongoing" 
                    ? "bg-white text-[#10A66A] shadow-xs font-extrabold" 
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                进行中
              </button>
              <button 
                onClick={() => {
                  setActiveTeachTab("completed");
                  showToast("已切换到已完成任务");
                }}
                className={`px-3 py-1.2 rounded-md transition-all cursor-pointer ${
                  activeTeachTab === "completed" 
                    ? "bg-white text-[#10A66A] shadow-xs font-extrabold" 
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                已完成
              </button>
            </div>
          </div>

          {activeTeachTab === "ongoing" ? (
            <div className="group border border-zinc-200 bg-slate-50/50 hover:bg-white rounded-xl p-4 transition-all duration-300 shadow-xs hover:shadow-sm">
              <div className="flex gap-4">
                {/* 封面图 */}
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-[#10A66A]/80 to-[#07875A] flex flex-col items-center justify-center text-white font-black shrink-0 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 filter blur-[1px]"></div>
                  <Layers className="w-7 h-7 mb-1 opacity-90" />
                  <span className="text-[9px] font-mono tracking-wider opacity-80 uppercase">AIoT WORK</span>
                </div>
                {/* 文字及进度 */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="text-xs font-black text-zinc-900 truncate group-hover:text-[#10A66A] transition-colors" title={studentTasks[0].courseName}>
                      {studentTasks[0].courseName}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-1">
                      NO ID: {studentTasks[0].id}
                    </p>
                    <div className="flex items-center gap-3 text-[9px] text-zinc-400 font-bold mt-1.5">
                      <span>指导老师: {studentTasks[0].teacherName}</span>
                      <span>时长: {studentTasks[0].taskDuration}min</span>
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 font-mono leading-none">
                      <span>当前进度</span>
                      <span className="text-[#10A66A]">{studentTasks[0].progress.toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#10A66A] h-full rounded-full transition-all duration-300" style={{ width: `${studentTasks[0].progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 动作区 */}
              <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end">
                <button 
                  onClick={() => onEnterDetail(studentTasks[0].id)}
                  className="px-4 py-1.5 bg-[#10A66A] hover:bg-[#07875A] text-white font-extrabold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>{studentTasks[0].status === "未进行" ? "开始学习" : "继续学习"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-400 font-medium text-xs flex flex-col items-center justify-center space-y-2">
              <Inbox className="w-8 h-8 text-zinc-300" />
              <span>暂无已完成的教学任务记录</span>
            </div>
          )}
        </div>

        {/* 2. 右侧：我的任务列表 */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3 flex-wrap gap-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#10A66A]" />
              <span>我的任务列表</span>
            </h3>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="请输入课程名称进行搜索"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-xs border border-zinc-200 focus:border-[#10A66A] rounded-xl focus:outline-none transition-all placeholder:text-zinc-400 font-bold"
            />
          </div>

          {/* 任务分类标签(教学任务｜学习任务｜已完成) */}
          <div className="flex gap-1.5 border-b border-zinc-100 pb-2 flex-wrap text-xs">
            {[
              { id: "teaching", label: "教学任务" },
              { id: "learning", label: "学习任务" },
              { id: "completed", label: "已完成" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTaskTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-bold ${
                  activeTaskTab === tab.id 
                    ? "bg-[#EAF8F1] text-[#10A66A] border-[#CFEFE0] font-extrabold" 
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 任务列表展示 */}
          <div className="space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <div key={task.id} className="border border-zinc-150 rounded-xl p-3.5 hover:border-[#CFEFE0] transition-all font-medium text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shadow-xs">
                  <div className="space-y-1.5 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate" title={task.courseName}>
                      {task.courseName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-400 font-mono">
                      <span>工程编码: {task.id}</span>
                      <span>指导老师: {task.teacherName}</span>
                      <span className="text-[#10A66A] font-bold capitalize">
                        {task.taskType === "teaching" ? "教学任务" : "自修学习"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-0 pt-2 sm:pt-0 border-zinc-100">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block font-mono">耗时/总时</span>
                      <span className="font-extrabold text-[#1F2937] text-[#10A66A]">{task.usedDuration}/{task.totalDuration}min</span>
                    </div>
                    
                    <button
                      onClick={() => onEnterDetail(task.id)}
                      className="px-3.5 py-1.5 bg-[#10A66A] hover:bg-[#07875A] text-white font-extrabold rounded-lg text-[11px] cursor-pointer transition-colors whitespace-nowrap shadow-xs"
                    >
                      {task.status === "未进行" ? "开始学习" : "继续学习"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-400 font-medium text-xs">
                没有找到符合检索词或分类下的任务点
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
