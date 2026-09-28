import React, { useState } from "react";
import { 
  BookOpen, 
  Search, 
  HelpCircle,
  CheckCircle,
  Clock,
  Layers,
  Inbox,
  Award,
  User,
  Calendar,
  ChevronRight
} from "lucide-react";

interface StudentLearningProps {
  onEnterDetail: (taskId: string) => void;
  showToast: (msg: string) => void;
}

export default function StudentLearning({ onEnterDetail, showToast }: StudentLearningProps) {
  const [learningQuery, setLearningQuery] = useState("");

  const [courseTasks, setCourseTasks] = useState(() => {
    const assignedTasks = [
      {
        id: "1765522294814",
        courseName: "课程演示-物联网数据采集1765522294814",
        specialty: "物联网应用技术",
        type: "实训任务",
        currentChapter: "第一单元 传感器认知",
        progress: 0,
        usedDuration: 0,
        totalDuration: 60,
        joinTime: "2025-12-12 14:51",
        status: "未进行"
      },
      {
        id: "1765502054759",
        courseName: "课程演示-物联网数据采集1765502054759",
        specialty: "物联网应用技术",
        type: "学习任务",
        currentChapter: "第二单元 串口通信",
        progress: 38.89,
        usedDuration: 35,
        totalDuration: 90,
        joinTime: "2025-12-13 09:20",
        status: "进行中"
      }
    ];

    const savedTasks = localStorage.getItem("student_learning_tasks");
    const selfAdded = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Merge, preventing duplicates
    const combined = [...assignedTasks];
    selfAdded.forEach((task: any) => {
      if (!combined.find(t => t.id === task.id)) {
        combined.push(task);
      }
    });

    return combined;
  });

  const filtered = courseTasks.filter(item => {
    if (learningQuery.trim()) {
      return item.courseName.toLowerCase().includes(learningQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 头部摘要 */}
      <div className="bg-white border border-[#CFEFE0] p-6 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#10A66A] animate-pulse" />
            <span>我的学习</span>
          </h1>
          <p className="text-xs text-zinc-500 font-medium tracking-tight">查看已添加课程、进行中学习任务和课程学习进度。</p>
        </div>

        {/* 搜索工具 */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            value={learningQuery}
            onChange={(e) => setLearningQuery(e.target.value)}
            placeholder="输入课程或任务名称检索"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-xs border border-zinc-200 rounded-xl focus:border-[#10A66A] focus:outline-none transition-all placeholder:text-zinc-455 font-bold"
          />
        </div>
      </div>

      {/* 进行中课程列表 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-3.5 bg-[#10A66A] rounded-full" />
          <h2 className="text-sm font-black text-slate-900">进行中课程</h2>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {filtered.length > 0 ? (
            filtered.map(task => (
              <div key={task.id} className="bg-white border border-[#CFEFE0] rounded-2xl p-5 hover:border-[#10A66A]/40 transition-all duration-300 shadow-sm group">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* 左侧基本信息 */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold text-[#1F2937] text-[15px] group-hover:text-[#10A66A] transition-colors leading-tight">
                          {task.courseName}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-400 font-bold">
                          <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-[#10A66A]/60" />专业方向: <span className="text-zinc-650">{task.specialty}</span></span>
                          <span className="flex items-center gap-1.5"><Inbox className="w-3.5 h-3.5 text-[#10A66A]/60" />课程类型: <span className="text-zinc-650">{task.type}</span></span>
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#10A66A]/60" />加入时间: <span className="text-zinc-650 font-mono">{task.joinTime}</span></span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black border uppercase leading-none ${
                        task.status === "未进行" ? "bg-slate-50 text-zinc-400 border-zinc-200" : "bg-[#EAF8F1] text-[#10A66A] border-[#CFEFE0]/40"
                      }`}>
                         {task.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-[#F8FAF9] rounded-xl border border-[#CFEFE0]/50">
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold block">当前章节</span>
                        <span className="text-xs text-zinc-800 font-black truncate block" title={task.currentChapter}>{task.currentChapter}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold block">学习进度</span>
                        <span className="text-xs text-[#10A66A] font-mono font-black">{task.progress.toFixed(2)}%</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold block">已用时长</span>
                        <span className="text-xs text-zinc-800 font-mono font-black">{task.usedDuration} 分钟</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold block">剩余时长</span>
                        <span className="text-xs text-rose-500 font-mono font-black">{task.totalDuration - task.usedDuration} 分钟</span>
                      </div>
                    </div>
                  </div>

                  {/* 右侧进度及操作 */}
                  <div className="lg:w-48 flex flex-col justify-center items-center gap-4 lg:border-l lg:border-zinc-100 lg:pl-6">
                    <div className="w-full space-y-2">
                       <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-[#10A66A] h-full rounded-full transition-all duration-500" 
                            style={{ width: `${task.progress}%` }} 
                          />
                       </div>
                    </div>
                    <button
                      onClick={() => onEnterDetail(task.id)}
                      className="w-full py-2.5 bg-[#10A66A] hover:bg-[#07875A] text-white font-black text-xs rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>{task.status === "未进行" ? "开始学习" : "继续学习"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 bg-white border border-[#CFEFE0] rounded-2xl text-center text-zinc-400 flex flex-col items-center justify-center space-y-2 shadow-xs">
              <Inbox className="w-12 h-12 text-zinc-200" />
              <span className="font-bold">暂无进行中的实训课程</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
