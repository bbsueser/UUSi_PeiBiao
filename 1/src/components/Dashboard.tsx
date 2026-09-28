/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { UserSession, ActiveTab } from "../types";
import StudentHome from "./StudentHome";
import StudentLearning from "./StudentLearning";
import StudentTaskDetail from "./StudentTaskDetail";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  Building2, 
  Clock, 
  BookOpen, 
  ClipboardCheck, 
  ChevronRight, 
  Sparkles, 
  BrainCircuit,
  GraduationCap,
  ListTodo,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Briefcase,
  Layers
} from "lucide-react";

interface DashboardProps {
  session: UserSession;
  onTabChange: (tab: ActiveTab) => void;
  onJumpToAiTool?: (tool: "courseStandard" | "textbookOutline" | "questionBank" | "pptOutline") => void;
}

export default function Dashboard({ session, onTabChange, onJumpToAiTool }: DashboardProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Student study hours trend logic over past 7 days (defined at top to satisfy Rules of Hooks)
  const trendData = useMemo(() => [
    { day: "05-27", "学习时长": 96 },
    { day: "05-28", "学习时长": 112 },
    { day: "05-29", "学习时长": 105 },
    { day: "05-30", "学习时长": 134 },
    { day: "05-31", "学习时长": 142 },
    { day: "06-01", "学习时长": 128 },
    { day: "06-02", "学习时长": 138 }
  ], []);

  // Default tasks data
  const studentTasks = useMemo(() => [
    {
      id: "tsk-1",
      name: "物联网设备接入实验任务",
      course: "物联网设备开发实战",
      chapter: "第4章 设备接入与数据上报",
      type: "实验实训",
      duration: 120,
      usedTime: 78,
      timeLeft: 42,
      deadline: "2026-06-10 18:00",
      status: "进行中",
      actionText: "继续学习",
      reportStatus: "未提交",
      score: "--",
      comment: "暂无"
    },
    {
      id: "tsk-2",
      name: "MQTT通信协议章节学习",
      course: "物联网设备开发实战",
      chapter: "第3章 MQTT通信协议",
      type: "课程学习",
      duration: 90,
      usedTime: 0,
      timeLeft: 90,
      deadline: "2026-06-12 18:00",
      status: "待完成",
      actionText: "开始学习",
      reportStatus: "未开启",
      score: "--",
      comment: "暂无"
    },
    {
      id: "tsk-3",
      name: "Linux基础命令练习",
      course: "Linux操作系统",
      chapter: "第2章 常用命令",
      type: "章节作业",
      duration: 80,
      usedTime: 80,
      timeLeft: 0,
      deadline: "2026-06-09 18:00",
      status: "已完成",
      actionText: "查看详情",
      reportStatus: "已评分",
      score: "88",
      comment: "命令掌握扎实，报告书写规范。"
    },
    {
      id: "tsk-4",
      name: "行业云平台数据上报实验",
      course: "工业互联网应用开发",
      chapter: "第5章 数据上报与可视化",
      type: "实验实训",
      duration: 120,
      usedTime: 110,
      timeLeft: 60,
      deadline: "2026-06-12 18:00",
      status: "已退回",
      actionText: "重新提交",
      reportStatus: "已退回",
      score: "待重做",
      comment: "实验报告配置步骤截图不够完整完整，请修正后再复交。"
    },
    {
      id: "tsk-5",
      name: "嵌入式系统中断处理作业",
      course: "嵌入式系统开发",
      chapter: "第3章 外设与中断系统",
      type: "章节作业",
      duration: 60,
      usedTime: 0,
      timeLeft: 60,
      deadline: "2026-06-15 18:00",
      status: "待完成",
      actionText: "开始学习",
      reportStatus: "未开启",
      score: "--",
      comment: "暂无"
    },
    {
      id: "tsk-6",
      name: "边缘节点控制逻辑设计",
      course: "边缘计算技术应用",
      chapter: "第4章 EdgeX Foundry实战",
      type: "实验实训",
      duration: 150,
      usedTime: 45,
      timeLeft: 105,
      deadline: "2026-06-14 18:00",
      status: "进行中",
      actionText: "继续学习",
      reportStatus: "未提交",
      score: "--",
      comment: "暂无"
    }
  ], []);

  const studentReports = useMemo(() => [
    {
      id: "rep-1",
      name: "物联网设备接入实验报告",
      course: "物联网设备开发实战",
      status: "已提交",
      submitTime: "2026-06-09 16:20",
      score: "92",
      comment: "设备注册及规则引擎配置非常完整，运行流畅。"
    },
    {
      id: "rep-2",
      name: "行业云平台数据上报实验报告",
      course: "工业互联网应用开发",
      status: "已退回",
      submitTime: "2026-06-08 15:40",
      score: "待重做",
      comment: "实验报告内配置数据不完整，请重新提交。"
    },
    {
      id: "rep-3",
      name: "Linux基础命令练习报告",
      course: "Linux操作系统",
      status: "已评分",
      submitTime: "2026-06-07 17:10",
      score: "88",
      comment: "核心文件权限及命令测试结果无误，格式优异。"
    }
  ], []);

  const studentCourseProgress = useMemo(() => [
    {
      id: "cp-1",
      course: "物联网设备开发实战",
      progress: 76,
      completedTasks: 8,
      totalTasks: 11,
      usedTime: 18.5
    },
    {
      id: "cp-2",
      course: "Linux操作系统",
      progress: 68,
      completedTasks: 5,
      totalTasks: 8,
      usedTime: 10.2
    },
    {
      id: "cp-3",
      course: "工业互联网应用开发",
      progress: 54,
      completedTasks: 4,
      totalTasks: 9,
      usedTime: 8.6
    },
    {
      id: "cp-4",
      course: "边缘计算技术应用",
      progress: 42,
      completedTasks: 3,
      totalTasks: 7,
      usedTime: 5.2
    }
  ], []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Student Workspace States
  const [studentActiveTab, setStudentActiveTab] = useState<string>("home");
  const [studentTaskFilter, setStudentTaskFilter] = useState<string>("待完成");
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<any>(null);

  // Filter tasks based on selected status
  const filteredStudentTasks = useMemo(() => {
    if (studentTaskFilter === "全部任务") {
      return studentTasks;
    }
    return studentTasks.filter(item => item.status === studentTaskFilter);
  }, [studentTasks, studentTaskFilter]);

  // Sync selectedTaskDetail default
  useEffect(() => {
    if (session.role === "student" && !selectedTaskDetail) {
      setSelectedTaskDetail(studentTasks[0]);
    }
  }, [session, selectedTaskDetail, studentTasks]);

  // Student custom interactive states
  const [taskProgress, setTaskProgress] = useState<number>(0);
  const [taskStatus, setTaskStatus] = useState<"未进行" | "进行中">("未进行");
  const [taskTimeUsed, setTaskTimeUsed] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [teachTaskTab, setTeachTaskTab] = useState<"progress" | "completed">("progress");
  const [taskListCategory, setTaskListCategory] = useState<"teaching" | "learning" | "completed">("teaching");

  // End of student data hooks definitions


  // Student Mode render branch (early return for clean separation)
  if (session.role === "student") {
    const LayersIcon = Layers;
    return (
      <div className="bg-[#f4f6f8] min-h-screen text-zinc-800 font-sans antialiased pb-12 select-none">
      {/* Floating Custom Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10A66A] text-white text-xs px-5 py-3 rounded-lg border border-[#CFEFE0] flex items-center gap-2 shadow-xl animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left sidebar navigation matching requested student workbench layout */}
            <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl p-4 space-y-2.5 shadow-xs sticky top-20">
              <span className="text-[10px] text-zinc-450 font-sans font-black uppercase tracking-wider px-3 block">菜单导航</span>
              <div className="space-y-1">
                {[
                  { id: "home", label: "首页工作台", icon: LayersIcon },
                  { id: "learning", label: "我的学习", icon: BookOpen },
                  { id: "tasks", label: "我的任务", icon: ListTodo },
                  { id: "reports", label: "实验报告", icon: ClipboardCheck },
                  { id: "records", label: "学习记录", icon: Clock },
                ].map(menuItem => {
                  const Icon = menuItem.icon;
                  const active = studentActiveTab === menuItem.id;
                  return (
                    <button
                      key={menuItem.id}
                      onClick={() => {
                        setStudentActiveTab(menuItem.id);
                        showToast(`已切换至 - 【${menuItem.label}】`);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg font-black transition-all text-xs flex items-center justify-between cursor-pointer ${
                      active
                        ? "bg-[#10A66A] text-white shadow-xs font-extrabold"
                        : "text-zinc-600 hover:text-[#10A66A] hover:bg-[#EAF8F1]"
                    }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{menuItem.label}</span>
                      </div>
                      {menuItem.id === "tasks" && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${active ? "bg-white text-[#009b86]" : "bg-zinc-100 text-zinc-500"}`}>
                          6
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-zinc-150 pt-3 mt-4">
                <button
                  onClick={() => onTabChange("personal_center")}
                  className="w-full text-left px-3.5 py-2 rounded-lg font-black text-xs text-zinc-650 hover:text-[#009b86] hover:bg-[#e6f5f3] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-zinc-400" />
                  <span>个人中心</span>
                </button>
              </div>
            </div>

            {/* Right main workspace content panel */}
            <div className="lg:col-span-10 space-y-6">
              
              {/* PAGE MAIN HEADER WITH METADATA INFORMATION */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#e6f5f3] text-[#009b86] text-[10px] px-2.5 py-1 rounded font-black flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#009b86] animate-pulse" />
                      <span>学生系统在线</span>
                    </span>
                    <span className="text-zinc-450 text-xs font-medium">Hi，学生1，欢迎回来。</span>
                  </div>
                  <h1 className="text-xl font-black text-zinc-900 tracking-tight">学生工作台</h1>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                    查看学习任务、任务时长、实验报告和课程学习进度。
                  </p>
                </div>
                
                <div className="text-left md:text-right shrink-0 bg-zinc-50 border border-zinc-200/60 p-3 rounded-xl min-w-[200px]">
                  <span className="text-[10px] text-zinc-400 font-mono block font-bold uppercase tracking-wider">今日学习概览</span>
                  <span className="text-xs font-bold text-zinc-755 block mt-0.5">最近更新时间：2026-06-02 09:30</span>
                  <span className="text-[10px] text-[#009b86] font-extrabold flex items-center gap-0.5 mt-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>智能实验评测环境准备完成</span>
                  </span>
                </div>
              </div>

              {/* VIEW: HOME SUB-TAB */}
              {studentActiveTab === "home" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* METRIC HORIZONTAL STATS CARDS ARRAY */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    {/* Stat Card 1 */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between hover:border-[#009b86]/30 transition-all duration-300">
                      <div className="space-y-1">
                        <span className="text-zinc-500 text-xs font-bold block">待完成任务</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-black text-zinc-900 leading-none">6</span>
                          <span className="text-xs text-zinc-500 font-medium">个</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 block leading-tight">当前需完成的实验任务</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200/20 shrink-0">
                        <ListTodo className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between hover:border-[#009b86]/30 transition-all duration-300">
                      <div className="space-y-1">
                        <span className="text-zinc-500 text-xs font-bold block">已完成任务</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-black text-zinc-900 leading-none">18</span>
                          <span className="text-xs text-zinc-500 font-medium">个</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 block leading-tight">已完成提交的学习任务</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#e6f5f3] flex items-center justify-center text-[#009b86] border border-teal-200/20 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between hover:border-[#009b86]/30 transition-all duration-300">
                      <div className="space-y-1">
                        <span className="text-zinc-500 text-xs font-bold block">已用时长</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-black text-zinc-900 leading-none">42.5</span>
                          <span className="text-xs text-zinc-500 font-medium">小时</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 block leading-tight">累计学习与实验用时</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200/20 shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between hover:border-[#009b86]/30 transition-all duration-300">
                      <div className="space-y-1">
                        <span className="text-zinc-500 text-xs font-bold block">剩余时长</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-black text-rose-600 leading-none">8.5</span>
                          <span className="text-xs text-zinc-500 font-medium">小时</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 block leading-tight">预计剩余学习时长</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-200/20 shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Stat Card 5 */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between hover:border-[#009b86]/30 transition-all duration-300">
                      <div className="space-y-1">
                        <span className="text-zinc-500 text-xs font-bold block">实验报告数</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-black text-zinc-900 leading-none">12</span>
                          <span className="text-xs text-zinc-500 font-medium">份</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 block leading-tight">已提交的实验报告数量</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 border border-teal-200/20 shrink-0">
                        <ClipboardCheck className="w-5 h-5" />
                      </div>
                    </div>

                  </div>

                  {/* SPLIT PANEL AREA */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT LAYOUT: CORE TASKS AND DETAIL VIEWER */}
                    <div className="lg:col-span-8 space-y-6">
                      
                      {/* MY TASKS LIST WITH FILTERS */}
                      <div className="bg-white border border-[#e4e4e7] rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="border-b border-zinc-100 pb-3 flex justify-between items-center flex-wrap gap-2">
                          <div className="space-y-0.5">
                            <h3 className="text-xs font-black text-zinc-900 flex items-center gap-1.5 uppercase">
                              <ListTodo className="w-4 h-4 text-[#009b86]" />
                              <span>我的任务</span>
                            </h3>
                            <button 
                              onClick={() => { setStudentTaskFilter("全部任务"); showToast("已展现全部任务。"); }}
                              className="text-[10px] text-zinc-450 block hover:text-[#009b86] text-left"
                            >
                              查看待完成、进行中和已完成任务。
                            </button>
                          </div>
                          <span className="text-[11px] font-mono text-[#009b86] font-extrabold bg-[#e6f5f3] px-2 py-0.5 rounded">待处理急件：{studentTasks.filter(t => t.status !== "已完成").length}项</span>
                        </div>

                        {/* Filters switches */}
                        <div className="flex flex-wrap items-center gap-1">
                          {["全部任务", "待完成", "进行中", "已完成", "已退回"].map((st) => {
                            const isAct = studentTaskFilter === st;
                            return (
                              <button
                                key={st}
                                onClick={() => {
                                  setStudentTaskFilter(st);
                                  showToast(`筛选视图：【${st}】`);
                                }}
                                className={`px-3 py-1 text-xs cursor-pointer rounded-full transition-all border ${
                                  isAct 
                                    ? "bg-[#009b86] text-white border-[#009b86] font-bold" 
                                    : "bg-white text-zinc-650 hover:bg-zinc-50 border-zinc-200"
                                }`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>

                        {/* List responsive table */}
                        <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-xs bg-white text-[11px]">
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left border-collapse">
                              <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-450 font-bold text-[10px] uppercase">
                                  <th className="p-3 pl-4">任务名称</th>
                                  <th className="p-3">课程资源</th>
                                  <th className="p-3">资源章节</th>
                                  <th className="p-3">任务类型</th>
                                  <th className="p-3 text-center">时长</th>
                                  <th className="p-3 text-center">已用</th>
                                  <th className="p-3 text-center">剩余</th>
                                  <th className="p-3">截止时间</th>
                                  <th className="p-3">完成状态</th>
                                  <th className="p-3 pr-4 text-right">操作</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredStudentTasks.length === 0 ? (
                                  <tr>
                                    <td colSpan={10} className="p-8 text-center text-zinc-400 font-medium">当前检索无此类状态任务。</td>
                                  </tr>
                                ) : (
                                  filteredStudentTasks.map((tsk) => {
                                    const selected = selectedTaskDetail?.id === tsk.id;
                                    return (
                                      <tr
                                        key={tsk.id}
                                        onClick={() => setSelectedTaskDetail(tsk)}
                                        className={`border-b border-zinc-150 transition-colors cursor-pointer ${selected ? "bg-[#e6f5f3]/30" : "hover:bg-zinc-50/50"}`}
                                      >
                                        <td className="p-3 pl-4 font-black text-zinc-900">{tsk.name}</td>
                                        <td className="p-3 text-zinc-600 truncate max-w-[124px]">{tsk.course}</td>
                                        <td className="p-3 text-zinc-550 truncate max-w-[140px]">{tsk.chapter}</td>
                                        <td className="p-3 font-semibold text-zinc-500">{tsk.type}</td>
                                        <td className="p-3 text-center font-mono font-medium">{tsk.duration}分钟</td>
                                        <td className="p-3 text-center font-mono font-medium">{tsk.usedTime}分钟</td>
                                        <td className="p-3 text-center font-mono font-medium">{tsk.timeLeft}分钟</td>
                                        <td className="p-3 text-zinc-500 font-mono text-[10px]">{tsk.deadline}</td>
                                        <td className="p-3">
                                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] inline-block ${
                                            tsk.status === "待完成"
                                              ? "bg-zinc-100 text-zinc-550 border border-zinc-200"
                                              : tsk.status === "进行中"
                                              ? "bg-blue-50 text-blue-600 border border-blue-150"
                                              : tsk.status === "已完成"
                                              ? "bg-[#e6f5f3] text-[#009b86] border border-teal-200"
                                              : "bg-red-50 text-red-650 border border-red-150"
                                          }`}>
                                            {tsk.status}
                                          </span>
                                        </td>
                                        <td className="p-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            onClick={() => {
                                              setSelectedTaskDetail(tsk);
                                              showToast(`载入任务并选择：${tsk.name}`);
                                            }}
                                            className={`px-2.5 py-1 text-[10px] rounded font-bold cursor-pointer transition-all ${
                                              tsk.status === "待完成"
                                                ? "bg-[#009b86] text-white hover:bg-emerald-700"
                                                : tsk.status === "进行中"
                                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                                : tsk.status === "已退回"
                                                ? "bg-red-600 text-white hover:bg-red-700"
                                                : "bg-[#e6f5f3] text-[#009b86] border border-[#009b86]/20 hover:bg-teal-100"
                                            }`}
                                          >
                                            {tsk.actionText}
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>

                      {/* TASK DETAIL PANEL AREA (ACTIVE SELECTION) */}
                      {selectedTaskDetail && (
                        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in slide-in-from-bottom duration-200">
                          <div className="border-b border-zinc-100 pb-2.5 flex justify-between items-center">
                            <h3 className="text-xs font-black text-zinc-900 flex items-center gap-1.5 font-sans uppercase">
                              <Briefcase className="w-4 h-4 text-[#009b86]" />
                              <span>任务详情</span>
                            </h3>
                            <span className="text-[10px] font-mono font-bold text-[#009b86] uppercase bg-[#e6f5f3] px-2 py-0.5 rounded">Active Focus ID: {selectedTaskDetail.id}</span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-zinc-950">{selectedTaskDetail.name}</h4>
                            <p className="text-[11px] text-zinc-500 font-medium">查看并配合进度要求开始、完成该教学资源任务点。</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                            <div className="p-3 bg-zinc-50 rounded-xl space-y-1 border border-zinc-100">
                              <span className="text-zinc-400 block text-[10px] font-bold">课程与章节：</span>
                              <span className="font-extrabold text-zinc-800 block truncate">{selectedTaskDetail.course}</span>
                              <span className="text-zinc-500 font-medium block text-[10px] truncate leading-none">{selectedTaskDetail.chapter}</span>
                            </div>

                            <div className="p-3 bg-zinc-50 rounded-xl space-y-1 border border-zinc-100">
                              <span className="text-zinc-400 block text-[10px] font-bold">任务归属分类：</span>
                              <span className="font-extrabold text-zinc-800 block">{selectedTaskDetail.type}</span>
                              <span className="text-zinc-500 font-mono block text-[10px] leading-none">分配：{selectedTaskDetail.duration}分钟</span>
                            </div>

                            <div className="p-3 bg-zinc-50 rounded-xl space-y-1 border border-zinc-100">
                              <span className="text-zinc-400 block text-[10px] font-bold">已耗时长 ｜ 剩余时间：</span>
                              <div className="font-extrabold text-zinc-800 flex justify-between">
                                <span>已用: <span className="font-mono text-zinc-650">{selectedTaskDetail.usedTime}m</span></span>
                                <span>剩余: <span className="font-mono text-rose-600">{selectedTaskDetail.timeLeft}m</span></span>
                              </div>
                              <span className="text-zinc-400 block text-[10px] leading-none">截至：{selectedTaskDetail.deadline}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1">
                            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                              <span className="text-zinc-400 block text-[10px] font-bold">当前实验报告书状态：</span>
                              <span className="font-extrabold text-[#009b86] block text-[11.5px]">{selectedTaskDetail.reportStatus}</span>
                            </div>

                            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                              <span className="text-zinc-400 block text-[10px] font-bold">作业打分反馈：</span>
                              <span className="font-black text-rose-600 text-sm font-mono block leading-none">{selectedTaskDetail.score}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-rose-50/20 border border-rose-100 rounded-xl text-xs space-y-1">
                            <span className="text-[#009b86] font-bold block text-[10px]">教师评语：</span>
                            <span className="font-black text-zinc-700 block text-[11px] leading-relaxed">{selectedTaskDetail.comment}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100">
                            <button
                              onClick={() => showToast(`已启动线上虚拟环境：【${selectedTaskDetail.name}】`)}
                              className="px-4.5 py-1.8 text-white bg-[#009b86] hover:bg-emerald-700 font-extrabold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>进入学习</span>
                            </button>

                            <button
                              onClick={() => showToast(`打开实验报告编辑器，准备提交：【${selectedTaskDetail.name}】`)}
                              className="px-4.5 py-1.8 text-[#009b86] bg-[#e6f5f3] hover:bg-teal-150 border border-[#009b86]/10 font-extrabold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span>提交报告</span>
                            </button>

                            <button
                              onClick={() => showToast(`转入大纲页面查看：${selectedTaskDetail.chapter}`)}
                              className="px-4.5 py-1.8 text-zinc-600 bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-extrabold rounded-lg flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>查看章节</span>
                            </button>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* RIGHT COLUMN: FOCUS NOTIFICATIONS, TIMEPROGRESS, INLINE REPORT SUMMARIES */}
                    <div className="lg:col-span-4 space-y-6">
                      
                      {/* VI. 待完成任务重点展示 CARD */}
                      <div className="bg-white border border-zinc-200 rounded-2xl p-4.5 shadow-xs space-y-3.5">
                        <div className="border-b border-zinc-100 pb-2 flex justify-between items-center">
                          <h3 className="text-xs font-black text-zinc-950 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span>待完成任务提醒</span>
                          </h3>
                          <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.2 rounded font-mono"> urgent </span>
                        </div>

                        {/* List literal specifications counts */}
                        <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9.5px]">
                          <div className="p-2 border border-zinc-100 bg-zinc-50 rounded-lg">
                            <span className="text-zinc-500 font-semibold block leading-none">待完成</span>
                            <span className="font-black text-zinc-800 text-sm block mt-1.5">6 个</span>
                          </div>
                          <div className="p-2 border border-amber-100 bg-amber-50 rounded-lg font-black text-amber-700">
                            <span className="block leading-none">今日需</span>
                            <span className="text-sm block mt-1.5">2 个</span>
                          </div>
                          <div className="p-2 border border-rose-100 bg-rose-50 rounded-lg font-black text-rose-700">
                            <span className="block leading-none">即将截止</span>
                            <span className="text-sm block mt-1.5">1 个</span>
                          </div>
                          <div className="p-2 border border-red-100 bg-red-50 rounded-lg font-black text-red-700">
                            <span className="block leading-none">被退回</span>
                            <span className="text-sm block mt-1.5">1 个</span>
                          </div>
                        </div>

                        {/* Items rows selection trigger details on click */}
                        <div className="space-y-2 text-xs">
                          <div
                            onClick={() => {
                              const tsk = studentTasks.find(t=>t.id === "tsk-2");
                              if (tsk) { setSelectedTaskDetail(tsk); setStudentTaskFilter("待完成"); showToast("定位至待完成：MQTT任务"); }
                            }}
                            className="p-3 bg-amber-50/40 border border-amber-150 rounded-xl hover:border-amber-400 cursor-pointer transition-all space-y-1"
                          >
                            <span className="font-black text-zinc-900 block leading-tight">1. MQTT通信协议章节学习</span>
                            <span className="text-[10px] text-zinc-550 block font-mono">截止：2026-06-12 18:00</span>
                          </div>

                          <div
                            onClick={() => {
                              const tsk = studentTasks.find(t=>t.id === "tsk-1");
                              if (tsk) { setSelectedTaskDetail(tsk); setStudentTaskFilter("进行中"); showToast("定位至进行中：物联网设备接入实验"); }
                            }}
                            className="p-3 bg-blue-50/40 border border-blue-150 rounded-xl hover:border-blue-400 cursor-pointer transition-all space-y-1"
                          >
                            <span className="font-black text-zinc-900 block leading-tight">2. 物联网设备接入实验任务</span>
                            <span className="text-[10px] text-zinc-550 block font-mono">剩余时间：42分钟</span>
                          </div>

                          <div
                            onClick={() => {
                              const tsk = studentTasks.find(t=>t.id === "tsk-4");
                              if (tsk) { setSelectedTaskDetail(tsk); setStudentTaskFilter("已退回"); showToast("定位至已退回待修改：行业云平台实验"); }
                            }}
                            className="p-3 bg-rose-50/40 border border-rose-150 rounded-xl hover:border-rose-450 cursor-pointer transition-all space-y-1"
                          >
                            <span className="font-extrabold text-zinc-950 block leading-tight">3. 行业云平台数据上报实验</span>
                            <span className="text-[10px] text-zinc-450 block font-mono">已退回，请补充配置资料</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setStudentTaskFilter("全部任务");
                            showToast("已重置任务列表，展示全部可读任务。");
                          }}
                          className="w-full text-center py-2 text-xs bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-all font-black text-zinc-650 rounded-lg cursor-pointer"
                        >
                          查看全部任务
                        </button>
                      </div>

                      {/* VII. 学习时长统计区域 PROGRESS CARD */}
                      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="border-b border-zinc-100 pb-2 flex justify-between items-center">
                          <h3 className="text-xs font-black text-zinc-950 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#009b86]" />
                            <span>学习时长统计</span>
                          </h3>
                          <span className="text-[10px] text-[#009b86] font-bold">120小时专业学分</span>
                        </div>

                        {/* Progress slider bar matching 83% */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-baseline text-xs font-black text-zinc-900 leading-none">
                            <span>已用: <span className="text-[#009b86] font-mono font-extrabold">42.5 小时</span></span>
                            <span>剩余: <span className="text-zinc-500 font-mono">8.5 小时</span></span>
                          </div>
                          
                          <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-150">
                            <div className="bg-[#009b86] h-full rounded-full" style={{ width: "83%" }} />
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 font-mono">
                            <span>任务总时长：51小时</span>
                            <span className="text-[#009b86] font-bold text-[10.5px]">进度：83%</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-[#e6f5f3]/40 border border-[#009b86]/10 rounded-xl text-[10px] text-zinc-600 font-extrabold leading-normal">
                          当前任务整体完成进度约 83%。
                        </div>

                        {/* Breakdown block items */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 bg-zinc-50 rounded-xl text-center space-y-1">
                            <span className="text-zinc-400 block text-[9.5px] font-bold">本周学习时长</span>
                            <span className="font-black text-zinc-850 text-sm">6.8 <span className="text-[10px] text-zinc-450 font-normal">小时</span></span>
                          </div>
                          <div className="p-2.5 bg-zinc-50 rounded-xl text-center space-y-1">
                            <span className="text-zinc-400 block text-[9.5px] font-bold">今日学习时长</span>
                            <span className="font-black text-zinc-850 text-sm">1.2 <span className="text-[10px] text-zinc-450 font-normal">小时</span></span>
                          </div>
                        </div>
                      </div>

                      {/* VIII. 实验报告区域 */}
                      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3.5">
                        <div className="border-b border-zinc-100 pb-2 flex justify-between items-center">
                          <h3 className="text-xs font-black text-zinc-950 flex items-center gap-1.5">
                            <ClipboardCheck className="w-4 h-4 text-[#009b86]" />
                            <span>实验报告</span>
                          </h3>
                          <span className="text-[10px] text-[#009b86] font-mono font-black border border-[#009b86]/20 px-1.5 py-0.2 rounded"> Report </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px] leading-tight">
                          <div className="p-1.5 bg-zinc-50 rounded-lg text-zinc-600">
                            <span className="font-bold block">已提交</span>
                            <span className="text-[#009b86] font-black text-xs block mt-1">12 份</span>
                          </div>
                          <div className="p-1.5 bg-zinc-50 rounded-lg text-zinc-600">
                            <span className="font-bold block">待提交</span>
                            <span className="text-amber-500 font-black text-xs block mt-1">3 份</span>
                          </div>
                          <div className="p-1.5 bg-zinc-50 rounded-lg text-zinc-600">
                            <span className="font-bold block">已评分</span>
                            <span className="text-blue-600 font-black text-xs block mt-1">9 份</span>
                          </div>
                          <div className="p-1.5 bg-zinc-50 rounded-lg text-zinc-600">
                            <span className="font-bold block">待修改</span>
                            <span className="text-red-500 font-black text-xs block mt-1">1 份</span>
                          </div>
                        </div>

                        {/* Reports rows literal block */}
                        <div className="space-y-2 pt-1 font-medium text-xs">
                          {studentReports.map((item, idy) => (
                            <div key={idy} className="p-3 bg-zinc-50/55 border border-zinc-150 rounded-xl space-y-2">
                              <div className="flex justify-between items-start gap-1">
                                <span className="font-extrabold text-zinc-900 block truncate max-w-[170px] leading-tight">{item.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold leading-none ${
                                  item.status === "已提交" 
                                    ? "bg-blue-50 text-blue-755 border border-blue-100" 
                                    : item.status === "已退回"
                                    ? "bg-rose-50 text-rose-505 border border-rose-100"
                                    : "bg-[#e6f5f3] text-[#009b86]"
                                }`}>{item.status}</span>
                              </div>

                              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                                <span className="truncate max-w-[130px]">目录: {item.course}</span>
                                <span>得分: <span className="text-red-500 font-extrabold">{item.score}</span></span>
                              </div>

                              <div className="flex items-center justify-between text-[10px] border-t border-zinc-200/50 pt-1.5 leading-none">
                                <span className="text-zinc-400">{item.submitTime}</span>
                                <button
                                  onClick={() => showToast(item.status === "已退回" ? "载入修改编辑器" : "提取并查验最终报告单页")}
                                  className="text-[#009b86] font-bold hover:text-emerald-700"
                                >
                                  {item.status === "已退回" ? "修改报告" : "查看报告"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* IX. 课程学习进度区域 */}
                      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="border-b border-zinc-100 pb-2 flex justify-between items-center">
                          <h3 className="text-xs font-black text-zinc-950 flex items-center gap-1.5 animate-pulse">
                            <BookOpen className="w-4 h-4 text-[#009b86]" />
                            <span>课程学习进度</span>
                          </h3>
                          <span className="text-[10px] text-[#009b86] font-bold">在修4门本季课程</span>
                        </div>

                        <div className="space-y-3.5">
                          {studentCourseProgress.map((item, idz) => (
                            <div key={idz} className="space-y-1.5 text-xs">
                              <div className="flex justify-between items-baseline">
                                <span className="font-extrabold text-zinc-900">{item.course}</span>
                                <span className="font-mono text-[#009b86] font-bold">{item.progress}%</span>
                              </div>
                              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-150">
                                <div className="bg-[#009b86] h-full rounded-full" style={{ width: `${item.progress}%` }} />
                              </div>
                              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                                <span>完成任务: {item.completedTasks}/{item.totalTasks}</span>
                                <span>用时: {item.usedTime}小时</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* VIEW: SERVICES & ADVANCED LEARNING (MY_LEARNING) */}
              {studentActiveTab === "learning" && (
                <div className="space-y-6 animate-in fade-in duration-200 bg-white border border-zinc-200 p-6 rounded-2xl">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-base font-black text-zinc-950">我的学习大厅</h2>
                    <p className="text-xs text-zinc-500">深入追踪当前所学的所有物联网微缩场景实践和边缘智能算法练习课程。</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    {studentCourseProgress.map((item, idx) => (
                      <div key={idx} className="p-5 border border-zinc-200/90 rounded-2xl hover:border-[#009b86]/45 bg-zinc-50/20 space-y-4 font-medium">
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className="text-[9px] bg-[#e6f5f3] tracking-wider text-[#009b86] font-bold px-2 py-0.5 rounded uppercase">课程模块 {idx + 1}</span>
                            <h3 className="font-black text-sm text-zinc-900">{item.course}</h3>
                          </div>
                          <span className="text-lg font-black font-mono text-[#009b86]">{item.progress}%</span>
                        </div>

                        <div className="space-y-2">
                          <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#009b86] h-full" style={{ width: `${item.progress}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-450">
                            <span>总大纲掌握点完成：{item.progress}%</span>
                            <span>消耗时长：{item.usedTime} 小时</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-zinc-200/60 grid grid-cols-2 gap-3 text-center text-xs">
                          <div className="p-2 bg-white border border-zinc-200 rounded-lg">
                            <span className="block text-zinc-400 text-[10px]">完成任务书</span>
                            <span className="block text-sm font-black text-zinc-800 mt-1">{item.completedTasks} / {item.totalTasks}</span>
                          </div>
                          <div className="p-2 bg-white border border-zinc-200 rounded-lg">
                            <span className="block text-zinc-400 text-[10px]">实验报告书</span>
                            <span className="block text-sm font-black text-[#009b86] mt-1">已评分 {Math.min(item.completedTasks, 3)} 份</span>
                          </div>
                        </div>

                        <button
                          onClick={() => showToast(`载入课程：${item.course} 的全套教学资源`)}
                          className="w-full text-center py-2 bg-[#009b86] hover:bg-emerald-700 text-white font-black rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          继续开始该课程内容点学习
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: ALL ASSIGNED TASKS (MY_TASKS) */}
              {studentActiveTab === "tasks" && (
                <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-zinc-100 pb-4 flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-black text-zinc-950">全部任务列表大厅</h2>
                      <p className="text-xs text-zinc-500">汇总展示教师发配并对口测验的全部任务资源点明细情况。</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {studentTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTaskDetail(task);
                          showToast(`已点选任务：${task.name}`);
                        }}
                        className={`p-4 border rounded-2xl cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 font-medium text-xs ${
                          selectedTaskDetail?.id === task.id
                            ? "bg-[#e6f5f3]/20 border-[#009b86]/80"
                            : "bg-zinc-50/50 border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        <div className="space-y-2 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9.5px] px-2 py-0.5 rounded font-bold border uppercase leading-none ${
                              task.status === "待完成"
                                ? "bg-zinc-100 text-zinc-550 border-zinc-250"
                                : task.status === "进行中"
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : task.status === "已完成"
                                ? "bg-[#e6f5f3] text-[#009b86] border-teal-200"
                                : "bg-red-50 text-red-650 border-red-200"
                            }`}>
                              {task.status}
                            </span>
                            <span className="text-[10px] text-zinc-400">截止至：{task.deadline}</span>
                          </div>
                          <h3 className="font-extrabold text-[#18181b] block">{task.name}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-zinc-500 text-[10px]">
                            <span>大纲归口: {task.course}</span>
                            <span>章节节选: {task.chapter}</span>
                            <span>类型: <span className="font-black text-[#009b86] font-mono">{task.type}</span></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4.5 justify-between md:justify-end shrink-0 border-t md:border-t-0 pt-3.5 md:pt-0 border-zinc-200/60 text-xs">
                          <div className="text-right">
                            <span className="text-zinc-400 block text-[9px] font-bold">实践时长分配：</span>
                            <span className="font-extrabold text-zinc-755 block mt-0.5 whitespace-nowrap">
                              共计 <span className="font-mono text-[#009b86]">{task.duration}分钟</span> (剩余：{task.timeLeft}分)
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTaskDetail(task);
                              showToast(`转入执行：【${task.name}】`);
                            }}
                            className="px-4 py-2 bg-[#009b86] hover:bg-emerald-700 text-white rounded-lg text-xs font-black transition-colors cursor-pointer"
                          >
                            {task.actionText}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: DETAILED REPORTS VIEWS (REPORTS) */}
              {studentActiveTab === "reports" && (
                <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-base font-black text-zinc-950">我的实验报告归类汇总册</h2>
                    <p className="text-xs text-zinc-500">查验已完成物理硬件注册、MQTT协议消息订阅发布实验或边缘计算设计后的报告核实单。</p>
                  </div>

                  <div className="space-y-4">
                    {studentReports.map((rep) => (
                      <div key={rep.id} className="p-5 border border-zinc-200 bg-zinc-50/50 rounded-2xl hover:border-zinc-350 transition-all space-y-3">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div className="space-y-1 text-xs">
                            <span className="text-[9.5px] text-zinc-400 font-mono">REPORT INDEX: {rep.id}</span>
                            <h3 className="font-black text-[13.5px] text-zinc-900 leading-tight">{rep.name}</h3>
                            <span className="text-[11px] text-zinc-500 block">关联核心课程: {rep.course}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-zinc-400 block font-bold">最终评分反馈</span>
                            <span className="text-xl font-black text-rose-600 font-mono block mt-1 leading-none">{rep.score}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-white border border-zinc-150 rounded-xl text-xs space-y-1">
                          <span className="text-[#009b86] font-bold text-[10px] block uppercase tracking-wider font-sans">教师评分意见：</span>
                          <p className="text-zinc-650 leading-relaxed font-bold">{rep.comment}</p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-zinc-200/50 text-zinc-400 leading-none">
                          <span>出库保存时间：{rep.submitTime}</span>
                          <button
                            onClick={() => showToast(`正在向浏览器申请并导出报告：${rep.name}`)}
                            className="px-3.5 py-1.5 bg-[#e6f5f3] hover:bg-teal-100 border border-[#009b86]/25 rounded text-[#009b86] font-black cursor-pointer transition-colors"
                          >
                            {rep.status === "已退回" ? "修改重新提交" : "查阅完整报告书面"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: STUDY LOG TIMELINE (RECORDS) */}
              {studentActiveTab === "records" && (
                <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-base font-black text-zinc-950">学习成长与考勤记录</h2>
                    <p className="text-xs text-zinc-500">跟踪并核算从学期开始时的第一步到完成各实验报告的阶段成果。</p>
                  </div>

                  <div className="relative border-l border-zinc-200 pl-6 ml-4 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1.5 bg-[#009b86] w-2.5 h-2.5 rounded-full ring-4 ring-[#e6f5f3]" />
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] text-zinc-400 font-mono block font-bold leading-none">2026-06-02 09:12 UTC</span>
                        <h4 className="font-extrabold text-zinc-900 text-sm">完成了课程学时测试：第三章 MQTT 离线自评测</h4>
                        <p className="text-zinc-500 font-medium">自主通过在线MQTT订阅发布机制实验模拟课，并存入自测归底。</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[31px] top-1.5 bg-blue-600 w-2.5 h-2.5 rounded-full ring-4 ring-blue-50" />
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] text-zinc-400 font-mono block font-bold leading-none">2026-06-01 15:42 UTC</span>
                        <h4 className="font-extrabold text-zinc-900 text-sm">正式提交存底：物联网设备接入在线实验报告</h4>
                        <p className="text-zinc-500 font-medium">配置完全套物联网规则引擎，通过模拟终端将遥测数据完整递交并由AI完成首轮排错。</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[31px] top-1.5 bg-zinc-450 w-2.5 h-2.5 rounded-full ring-4 ring-zinc-100 bg-zinc-400" />
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] text-zinc-400 font-mono block font-bold leading-none">2026-05-31 10:20 UTC</span>
                        <h4 className="font-extrabold text-zinc-900 text-sm">选修启航点：Linux操作系统及其核心常用指令</h4>
                        <p className="text-zinc-500 font-medium">开启在修新课大纲第二章进阶课学练习，完成全组模拟指令输入与验证。</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    );
  }

  // trendData is now defined at the top of the component to satisfy React Rules of Hooks

  // AI Tools definitions
  const aiTools = [
    {
      id: "courseStandard" as const,
      name: "AI课标",
      desc: "快速生成课程标准框架与教学目标。",
      badge: "标准定制"
    },
    {
      id: "textbookOutline" as const,
      name: "AI大纲",
      desc: "辅助设计教材大纲、章节结构与知识模块。",
      badge: "架构规划"
    },
    {
      id: "pptOutline" as const,
      name: "AI课件",
      desc: "根据课程主题生成 PPT 大纲与课件内容。",
      badge: "内容提炼"
    },
    {
      id: "questionBank" as const,
      name: "AI题库",
      desc: "按知识点、题型和难度生成题库内容。",
      badge: "智能命题"
    }
  ];

  // Specific task datasets
  const taskOverview = [
    { name: "今日待处理任务", value: 8, color: "text-[#10A66A] bg-[#EAF8F1]" },
    { name: "待评分报告", value: 15, color: "text-amber-600 bg-amber-50" },
    { name: "进行中任务", value: 12, color: "text-blue-600 bg-blue-50" },
    { name: "已完成任务", value: 24, color: "text-purple-600 bg-purple-50" }
  ];

  const tasksList = [
    { name: "物联网设备接入实验任务", class: "物联网 2301", rate: 92 },
    { name: "MQTT通信协议章节学习", class: "物联网 2302", rate: 85 },
    { name: "行业云平台数据上报实验", class: "人工智能 2301", rate: 78 },
    { name: "Linux基础命令练习", class: "工业互联网 2301", rate: 95 }
  ];

  // Classes & Courses
  const classesList = [
    { name: "物联网 2301 班", students: 42, activeTasks: 5 },
    { name: "物联网 2302 班", students: 39, activeTasks: 4 },
    { name: "人工智能 2301 班", students: 45, activeTasks: 3 },
    { name: "工业互联网 2301 班", students: 36, activeTasks: 2 }
  ];

  const coursesList = [
    { name: "物联网设备开发实战", students: 81, tasksCount: 12, updateTime: "2026-06-01" },
    { name: "Linux操作系统", students: 45, tasksCount: 8, updateTime: "2026-05-28" },
    { name: "边缘计算技术应用", students: 36, tasksCount: 10, updateTime: "2026-05-30" },
    { name: "工业互联网应用开发", students: 42, tasksCount: 6, updateTime: "2026-06-02" }
  ];

  return (
    <div className="bg-[#f4f6f8] min-h-screen text-zinc-800 font-sans antialiased pb-12">
      
      {/* Floating Custom Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#009b86] text-white text-xs px-5 py-3 rounded-lg border border-teal-400 flex items-center gap-2 shadow-xl animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header / Title block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#EAF8F1] text-[#10A66A] text-[10px] px-2.5 py-1 rounded font-black flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10A66A] animate-pulse" />
                <span>教师工作台</span>
              </span>
              <span className="text-zinc-400 text-xs font-mono font-medium">Hi，教师1 老师，欢迎回来。</span>
            </div>
            <h1 className="text-xl font-black text-zinc-900 tracking-tight">教师工作台</h1>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
              查看教学任务、班级课程与 AI 教学工具，辅助教师完成课程建设和教学管理。
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1.5 pb-0.5">
              <button
                onClick={() => {
                  localStorage.setItem("teacher_active_subtab", "assign");
                  onTabChange("task_assignment");
                }}
                className="px-4 py-2 text-white bg-[#10A66A] hover:bg-emerald-700 font-black rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>下发任务</span>
              </button>
              
              <button
                onClick={() => {
                  localStorage.setItem("teacher_active_subtab", "my_teaching_tasks");
                  onTabChange("task_assignment");
                }}
                className="px-4 py-2 text-[#10A66A] bg-[#EAF8F1] hover:bg-teal-150 border border-[#10A66A]/20 font-black rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>我的教学</span>
              </button>
            </div>
          </div>
          
          <div className="text-left md:text-right shrink-0 bg-zinc-50 border border-zinc-200/60 p-3 rounded-xl min-w-[200px]">
            <span className="text-[10px] text-zinc-400 font-mono block font-bold uppercase tracking-wider">今日教学概览</span>
            <span className="text-xs font-bold text-zinc-700 block mt-0.5">最近更新时间：2026-06-02 09:30</span>
            <span className="text-[10px] text-[#10A66A] font-extrabold flex items-center gap-1 mt-1 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              <span>智能云评测服务状态正常</span>
            </span>
          </div>
        </div>

        {/* Four Key Metrics Cards */}
        <div id="u-dashboard-metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1 */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-[#10A66A]/30 transition-all duration-300">
            <div className="space-y-1.5">
              <span className="text-zinc-500 text-xs font-bold block">下发任务</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-zinc-900 leading-none">36</span>
                <span className="text-xs text-zinc-500 font-medium">个</span>
              </div>
              <span className="text-[10px] text-zinc-450 block leading-tight">当前已下发的学习与实验任务</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#EAF8F1] flex items-center justify-center text-[#10A66A] border border-[#10A66A]/10 shrink-0">
              <ClipboardCheck className="w-5.5 h-5.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-[#009b86]/30 transition-all duration-300">
            <div className="space-y-1.5">
              <span className="text-zinc-500 text-xs font-bold block">任务时长</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-zinc-900 leading-none">128</span>
                <span className="text-xs text-zinc-500 font-medium">小时</span>
              </div>
              <span className="text-[10px] text-zinc-450 block leading-tight">学生累计任务学习时长</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#e6f5f3] flex items-center justify-center text-[#009b86] border border-[#009b86]/10 shrink-0">
              <Clock className="w-5.5 h-5.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-[#009b86]/30 transition-all duration-300">
            <div className="space-y-1.5">
              <span className="text-zinc-500 text-xs font-bold block">班级数量</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-zinc-900 leading-none">4</span>
                <span className="text-xs text-zinc-500 font-medium">个</span>
              </div>
              <span className="text-[10px] text-zinc-450 block leading-tight">当前负责教学班级</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#e6f5f3] flex items-center justify-center text-[#009b86] border border-[#009b86]/10 shrink-0">
              <Building2 className="w-5.5 h-5.5" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-[#009b86]/30 transition-all duration-300">
            <div className="space-y-1.5">
              <span className="text-zinc-500 text-xs font-bold block">课程数量</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-zinc-900 leading-none">12</span>
                <span className="text-xs text-zinc-500 font-medium">门</span>
              </div>
              <span className="text-[10px] text-zinc-450 block leading-tight">已开设或已购买课程</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#e6f5f3] flex items-center justify-center text-[#009b86] border border-[#009b86]/10 shrink-0">
              <BookOpen className="w-5.5 h-5.5" />
            </div>
          </div>

        </div>

        {/* AI Tools Quick Access Grid */}
        <div className="space-y-3.5">
          <div className="flex items-baseline justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-black text-zinc-900 flex items-center gap-1.5 uppercase">
                <BrainCircuit className="w-4 h-4 text-[#009b86]" />
                <span>AI工具集</span>
              </h2>
              <span className="text-[10px] text-zinc-400 font-medium block">
                面向课程建设与教学准备的智能辅助工具。
              </span>
            </div>
            <button 
              onClick={() => onTabChange("ai_assistant")}
              className="text-[11px] text-[#009b86] hover:text-emerald-700 font-black cursor-pointer flex items-center gap-0.5 transition-colors"
            >
              <span>查看全部AI工具</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div id="u-ai-tools-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiTools.map((tool) => (
              <div 
                key={tool.id}
                className="bg-white border border-zinc-200/90 hover:border-[#009b86] rounded-2xl p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-zinc-900 group-hover:text-[#009b86] transition-colors">
                      {tool.name}
                    </span>
                    <span className="bg-[#e6f5f3] text-[#009b86] text-[9px] px-1.5 py-0.5 rounded font-black font-mono">
                      {tool.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium leading-relaxed min-h-[32px]">
                    {tool.desc}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (onJumpToAiTool) {
                      onJumpToAiTool(tool.id);
                    } else {
                      onTabChange("ai_assistant");
                    }
                    showToast(`已成功载入并切换到【${tool.name}】`);
                  }}
                  className="w-full py-1.8 cursor-pointer rounded-lg text-center text-xs font-black bg-zinc-50 hover:bg-[#009b86] border border-zinc-200 group-hover:border-[#009b86]/30 text-zinc-700 hover:text-white transition-all duration-300 block"
                >
                  立即使用
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic task list & recharts Trend (Two column layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Task List Overview */}
          <div className="lg:col-span-7 bg-white border border-zinc-200/95 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
              <h3 className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                <ListTodo className="w-4 h-4 text-[#009b86]" />
                <span>教学任务概览</span>
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono font-semibold">实测总纲数据</span>
            </div>

            {/* Quick status counters */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {taskOverview.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl border border-zinc-100 bg-zinc-50/50">
                  <span className="text-zinc-400 text-[9px] font-sans font-bold block tracking-tight truncate">
                    {item.name}
                  </span>
                  <span className={`text-sm md:text-base font-black tracking-tight mt-1 inline-block px-2.5 py-0.5 rounded-lg ${item.color}`}>
                    {item.value} <span className="text-[9px] font-normal">个</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Dynamic Task rows */}
            <div className="space-y-2.5 pt-2">
              <p className="text-[10px] text-zinc-400 font-sans font-black uppercase tracking-wider">进行中的学生实训班表列表：</p>
              
              {tasksList.map((task, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 hover:bg-zinc-100/50 transition-colors text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 font-medium"
                >
                  <div className="space-y-1">
                    <span className="text-zinc-950 font-black block text-[11.5px] truncate max-w-sm md:max-w-md">{task.name}</span>
                    <span className="text-[10px] text-zinc-400 block font-semibold">关联班级 ｜ {task.class}</span>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4">
                    {/* Rate */}
                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className="text-zinc-550 text-[10px]">任务完成率:</span>
                      <div className="w-20 bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-[#009b86] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${task.rate}%` }}
                        />
                      </div>
                      <span className="text-[#009b86] text-[11px] font-black w-8 text-right">{task.rate}%</span>
                    </div>

                    <button 
                      onClick={() => showToast(`载入任务【${task.name}】的详细教学报告`)}
                      className="px-2.5 py-1 text-[10px] bg-white border border-zinc-200 hover:border-[#009b86] text-zinc-650 hover:text-[#009b86] font-bold rounded-md hover:shadow-xs transition-all cursor-pointer"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right: Study hours graph & extra progression stats */}
          <div className="lg:col-span-5 bg-white border border-zinc-200/95 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
              <h3 className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#009b86]" />
                <span>教学数据趋势</span>
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono font-semibold">近7日统计</span>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-44 w-full select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorStudyHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009b86" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#009b86" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#a1a1aa" 
                    fontSize={10} 
                    fontFamily="mono" 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#a1a1aa" 
                    fontSize={10} 
                    fontFamily="mono" 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: 11, background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: 8 }}
                    labelStyle={{ fontWeight: "bold", color: "#18181b" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="学习时长" 
                    stroke="#009b86" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorStudyHours)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Simulated indicators */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-zinc-50 border border-zinc-200/40 rounded-xl space-y-1">
                <span className="text-zinc-500 font-bold block text-[10px]">平均任务完成率</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-zinc-900">78%</span>
                  <span className="text-[9px] text-[#009b86] font-mono">&uarr; 3.2%</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200/40 rounded-xl space-y-1">
                <span className="text-zinc-500 font-bold block text-[10px]">学生平均学习时长</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-zinc-900">3.6</span>
                  <span className="text-xs text-zinc-500 font-medium">小时</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200/40 rounded-xl space-y-1">
                <span className="text-zinc-500 font-bold block text-[10px]">报告自动提交率</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-zinc-900">82%</span>
                  <span className="text-xs text-zinc-400 font-semibold font-mono">符合教学要求</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200/40 rounded-xl space-y-1">
                <span className="text-zinc-500 font-bold block text-[10px]">AI教辅工具调用</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-zinc-900">24</span>
                  <span className="text-xs text-zinc-500 font-medium">次</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Classes and Courses row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Class Overview */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
              <h3 className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#009b86]" />
                <span>我的班级概览</span>
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono font-semibold">4 个负责班级</span>
            </div>

            <div className="space-y-2.5">
              {classesList.map((cls, idx) => (
                <div 
                  key={idx}
                  className="p-3 border border-zinc-100 hover:border-[#009b86]/30 bg-zinc-50/50 rounded-xl flex items-center justify-between text-xs transition-colors"
                >
                  <div className="space-y-1">
                    <span className="font-black text-zinc-900 block">{cls.name}</span>
                    <span className="text-[10px] text-zinc-450 font-medium block">
                      班级学生数 ｜ <span className="text-zinc-700 font-extrabold">{cls.students} 人</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                      进行中任务 {cls.activeTasks} 个
                    </span>
                    <button 
                      onClick={() => showToast(`打开班级【${cls.name}】的详细考勤与实训数据`)}
                      className="text-zinc-400 hover:text-[#009b86] cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courses Overview */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
              <h3 className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#009b86]" />
                <span>我的课程概览</span>
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono font-semibold">12 门总课程</span>
            </div>

            <div className="space-y-2.5">
              {coursesList.map((course, idx) => (
                <div 
                  key={idx}
                  className="p-3 border border-zinc-100 hover:border-[#009b86]/30 bg-zinc-50/50 rounded-xl flex items-center justify-between text-xs transition-colors"
                >
                  <div className="space-y-1">
                    <span className="font-black text-zinc-900 block truncate max-w-[200px] sm:max-w-xs">{course.name}</span>
                    <span className="text-[10px] text-zinc-450 font-medium block">
                      学生数 <span className="text-zinc-700 font-extrabold">{course.students}</span> ｜ 任务数 <span className="text-zinc-700 font-extrabold">{course.tasksCount}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      更新：{course.updateTime}
                    </span>
                    <button 
                      onClick={() => showToast(`打开课程【${course.name}】的内容规划大纲`)}
                      className="text-zinc-400 hover:text-[#009b86] cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
