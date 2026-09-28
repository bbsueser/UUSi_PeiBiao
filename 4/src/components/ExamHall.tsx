/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { UserSession } from "../types";
import ExamManagement from "./ExamManagement";
import { 
  Award, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ListChecks, 
  ShieldCheck,
  Building2,
  BookmarkCheck,
  ChevronRight,
  RotateCcw,
  Trophy,
  Bell,
  TrendingUp,
  Settings
} from "lucide-react";

interface ExamHallProps {
  session: UserSession;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function ExamHall({ session }: ExamHallProps) {
  const [activeTypeTab, setActiveTypeTab] = useState<"all" | "regular" | "cert" | "contest">("all");
  const [activeStatusTab, setActiveStatusTab] = useState<"all" | "upcoming" | "ongoing" | "ended">("all");

  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [showManagement, setShowManagement] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Interactive Quiz states
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);
  const [examScore, setExamScore] = useState<number>(0);

  // Anti-cheat & Exam tracking states
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examTimer, setExamTimer] = useState<number>(120 * 60); // 120 minutes in seconds
  const [timeUsed, setTimeUsed] = useState<number>(0);
  const [switchCount, setSwitchCount] = useState<number>(0);
  const [copyPasteAnomalies, setCopyPasteAnomalies] = useState<number>(0);
  const [studentExamStatus, setStudentExamStatus] = useState<"考试中" | "异常" | "预警" | "已超时" | "已交卷">("考试中");
  const [usedAttempts, setUsedAttempts] = useState<number>(0);
  
  const MAX_SWITCH = 2; // config mockup
  const EXAM_DURATION_MINS = 120;
  
  // Timer effect
  useEffect(() => {
    let interval: any;
    if (examStarted && !isExamSubmitted && studentExamStatus !== "已超时" && studentExamStatus !== "已交卷") {
      interval = setInterval(() => {
        setExamTimer(prev => {
           if(prev <= 1) {
              setStudentExamStatus("已超时");
              showToast("考试时间已结束，系统已自动交卷。");
              setIsExamSubmitted(true);
              return 0;
           }
           return prev - 1;
        });
        setTimeUsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examStarted, isExamSubmitted, studentExamStatus]);
  
  // Visibility change logic (Switch Screen)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && examStarted && !isExamSubmitted) {
         setSwitchCount(prev => {
            const next = prev + 1;
            if (next > MAX_SWITCH) {
               setStudentExamStatus("异常");
               showToast("切屏次数已超过限制，考试状态已标记为异常。");
            } else {
               showToast(`检测到屏幕切换行为，当前切屏次数：${next} / ${MAX_SWITCH}。`);
            }
            return next;
         });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [examStarted, isExamSubmitted]);

  // Prevent actions
  const handleAntiCheatAction = (e: any, actionName: string) => {
     if (examStarted && !isExamSubmitted) {
        e.preventDefault();
        setCopyPasteAnomalies(prev => prev + 1);
        showToast(`本场考试已禁止${actionName}。`);
     }
  };


  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Mock data as instructed
  const examTasks = [
    {
      id: "exam-1",
      title: "物联网基础综合测试",
      type: "regular",
      typeName: "常规考试",
      status: "upcoming",
      statusName: "即将开始",
      time: "2026-06-10 09:00",
      duration: 90,
      totalPoints: 100,
      passingPoints: 60,
      buttonText: "进入考试",
      desc: "本考试覆盖物联网传感器电路基础、基础网络拓扑架构以及无线传感网协议分析。"
    },
    {
      id: "exam-2",
      title: "1+X 物联网智能化系统集成认证测评",
      type: "cert",
      typeName: "认证测评",
      status: "ongoing",
      statusName: "进行中",
      time: "2026-06-12 14:00",
      duration: 120,
      totalPoints: 100,
      passingPoints: 60,
      buttonText: "进入测评",
      desc: "1+X职业技能等级认证专用考题，核心评测边缘网关数据通信及云端规则链分发配置能力。"
    },
    {
      id: "exam-3",
      title: "工业互联网综合应用竞赛",
      type: "contest",
      typeName: "竞赛",
      status: "upcoming",
      statusName: "未开始",
      time: "2026-06-18 10:00",
      duration: 150,
      totalPoints: 100,
      mode: "排名模式: 开启",
      buttonText: "查看详情",
      desc: "全国智慧物联竞赛华北赛区，面向数字化配电站与数字孪生工厂建设的超高精多任务大比拼。"
    },
    {
      id: "exam-4",
      title: "嵌入式开发基础考试",
      type: "regular",
      typeName: "常规考试",
      status: "ended",
      statusName: "已结束",
      time: "2026-05-28 15:00",
      duration: 60,
      totalPoints: 100,
      passingPoints: 60,
      buttonText: "查看成绩",
      desc: "考察 Renode C/C++ 芯片内核寄存器电平配置、GPIO 引脚驱动和中断处理机制的基本功考试。"
    }
  ];

  const examQuestions: Question[] = [
    {
      id: 1,
      question: "在新大陆边缘计算网关部署中，若遇到终端设备通过Modbus/RTU采集超时错误，最优先应该排查的物理接口状态或配置是：",
      options: [
        "A. 校验 ThingsBoard 平台中的 API Key 与设备凭证是否一致",
        "B. 校验 RS485 总线的 A/B 线段子连接是否反接、以及波特率/停止位是否匹配",
        "C. 校验 Jupyter Lab 所占用的物理多副本集群核心负载状况",
        "D. 重新设定 Linux 会话下的 Cron 定时任务时间步长"
      ],
      correct: 1,
      explanation: "物理层的物理连接线以及串口通信配置(波特率/数据位/停止位)是Modbus通信异常的首要排查点。"
    },
    {
      id: 2,
      question: "关于 ThingsBoard 物联网云平台中的规则节点 (Rule Node) 的说法，下列哪项是正确的？",
      options: [
        "A. 只能使用 C# 对数据流段进行过滤，不支持 JavaScript/JSON 解析",
        "B. 用作遥测数据上报的后端持久化，仅支持 MySQL 主从库，不能集成 Redis",
        "C. 允许通过拖拽和连线的方式，对遥测属性进行阈值断言、转换流以及执行反向继电器控制",
        "D. ThingsBoard 没有类似规则节点设计，一切分析均在 Linux Shell 中硬编码处理"
      ],
      correct: 2,
      explanation: "ThingsBoard的规则节点链能对遥测数据流执行高精度、流式过滤与反向设备远程指令广播。"
    }
  ];

  const handleOptionSelect = (optionIdx: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: optionIdx
    }));
  };

  const handleStartExam = (id: string, title: string) => {
    setSelectedExamId(id);
    setAnswers({});
    setCurrentQuestionIdx(0);
    setIsExamSubmitted(false);
    setExamScore(0);
    setExamStarted(false); // Reset new states
    setExamTimer(EXAM_DURATION_MINS * 60);
    setTimeUsed(0);
    setSwitchCount(0);
    setCopyPasteAnomalies(0);
    setStudentExamStatus("考试中");
  };

  const calculateScore = () => {
    let score = 0;
    examQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correct) {
        score += 50;
      }
    });
    setExamScore(score);
    setIsExamSubmitted(true);
    showToast(`作答完成！考试得分: ${score}分`);
  };

  const filteredTasks = examTasks.filter(item => {
    const matchType = activeTypeTab === "all" || item.type === activeTypeTab;
    const matchStatus = activeStatusTab === "all" || item.status === activeStatusTab;
    return matchType && matchStatus;
  });

  if (showManagement) {
    return <ExamManagement onBack={() => setShowManagement(false)} showToast={showToast} />;
  }

  return (
    <div className="bg-[#f4f6f8] min-h-screen text-zinc-800 font-sans antialiased flex flex-col justify-between">
      
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#10A66A] text-white text-xs font-black px-6 py-3 rounded-xl border border-[#CFEFE0] flex items-center gap-2 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <ShieldCheck className="w-4 h-4 text-white animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full flex-1">
        
        {/* Row 2: ACL Access Banner */}
        <div className="bg-[#EAF8F1] border border-[#10A66A]/20 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-zinc-700 font-bold shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#10A66A] animate-pulse" />
            <span className="font-extrabold text-[#10A66A]">智慧教育综合实训平台 安全访问体系：</span>
            <span>当前已登录「{session.role === "student" ? "学生" : session.role === "admin" ? "校管" : "教工"}端」统考与认证考试大厅</span>
          </div>
          <div className="mt-1 sm:mt-0 font-mono text-[9px] text-zinc-400 font-black uppercase tracking-wider">
            ACL Token Matching: <span className="text-[#10A66A] font-extrabold">SECURE_GRANTED</span>
          </div>
        </div>

        {!selectedExamId ? (
          /* ================= PAGE VIEW A: GENERAL LIST AND DASHBOARD ================= */
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Row 3: Main Room Header Card */}
            <div className="bg-white border border-[#CFEFE0] rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10A66A] to-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <FileText className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-zinc-900 tracking-tight">考试大厅</h1>
                  <p className="text-xs text-zinc-500 font-medium tracking-tight">
                    支持常规考试、认证测评、竞赛等多类型考试任务统一管理与参与。
                  </p>
                </div>
              </div>
              
              <div className="mt-3 md:mt-0 flex items-center gap-3 shrink-0">
                {session.role !== "student" && (
                  <button 
                    onClick={() => setShowManagement(true)}
                    className="font-mono text-[10px] text-[#10A66A] bg-white border border-[#10A66A] hover:bg-[#EAF8F1] px-4 py-1.5 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>考试管理</span>
                  </button>
                )}
                <div className="font-mono text-[10px] text-[#10A66A] bg-[#EAF8F1] border border-[#CFEFE0]/40 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider flex items-center gap-1.5 shadow-3xs">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span>EXAM_STANDARDS: COMPLIANT</span>
                </div>
              </div>
            </div>

            {/* Row 4: Mint Green Directive Tip Line */}
            <div className="bg-[#EAF8F1]/60 border border-[#10A66A]/20 rounded-xl p-4 flex items-center space-x-3 text-zinc-700 shadow-3xs">
              <div className="w-8 h-8 rounded-full bg-[#10A66A]/10 flex items-center justify-center text-[#10A66A] shrink-0">
                <Award className="w-4.5 h-4.5" />
              </div>
              <p className="text-[11px] font-bold leading-normal">
                考试大厅支持<strong className="text-[#10A66A] font-black underline decoration-2 mx-1">常规考试</strong>、<strong className="text-blue-600 font-black underline decoration-2 mx-1">认证测评</strong>、<strong className="text-purple-600 font-black underline decoration-2 mx-1">竞赛</strong>等多类型考试任务，学生可按考试类型与考试状态快速查看并进入考试。
              </p>
            </div>

            {/* Row 5: Horizontal Category Tab Selectors (Matching capsule switcher style) */}
            <div className="bg-white p-1.5 rounded-xl border border-zinc-200 flex flex-wrap gap-1 shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-xs font-bold transition-all">
              {[
                { type: "all", label: "全部", icon: ListChecks, badge: "4" },
                { type: "regular", label: "常规考试", icon: FileText, badge: "2" },
                { type: "cert", label: "认证测评", icon: ShieldCheck, badge: "1" },
                { type: "contest", label: "竞赛", icon: Trophy, badge: "1" }
              ].map(tab => {
                const isSelected = activeTypeTab === tab.type;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.type}
                    onClick={() => {
                      setActiveTypeTab(tab.type as any);
                      showToast(`已加载：${tab.label}`);
                    }}
                    className={`px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center space-x-2 font-black border text-xs ${
                      isSelected
                        ? "bg-[#10A66A] text-white border-[#10A66A] shadow-xs"
                        : "bg-white text-zinc-650 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-sans font-extrabold ${
                      isSelected ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                    }`}>
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Row 6: Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (8 cols): Exam Task List */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* List Header and Status Filter */}
                <div className="bg-white border border-[#CFEFE0] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-3xs">
                  <span className="text-xs font-black text-zinc-900 tracking-wider flex items-center space-x-1.5">
                    <ListChecks className="w-4 h-4 text-[#10A66A]" />
                    <span>考试任务列表</span>
                  </span>

                  {/* Status buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 font-bold text-[11px]">
                    {[
                      { status: "all", label: "全部" },
                      { status: "upcoming", label: "即将开始" },
                      { status: "ongoing", label: "进行中" },
                      { status: "ended", label: "已结束" }
                    ].map(item => {
                      const active = activeStatusTab === item.status;
                      return (
                        <button
                          key={item.status}
                          onClick={() => {
                            setActiveStatusTab(item.status as any);
                            showToast(`考试状态：${item.label}`);
                          }}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            active
                              ? "bg-[#EAF8F1] text-[#10A66A] border border-[#10A66A]/20 font-black"
                              : "bg-white text-zinc-500 hover:bg-zinc-100"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Main Exam List Rendering */}
                {filteredTasks.length === 0 ? (
                  <div className="bg-white border border-zinc-200/80 rounded-xl p-12 text-center space-y-3">
                    <AlertCircle className="w-10 h-10 text-zinc-300 mx-auto" />
                    <p className="text-zinc-500 text-xs font-semibold">没有与当前筛选匹配的考试任务记录</p>
                    <button 
                      onClick={() => { setActiveTypeTab("all"); setActiveStatusTab("all"); }}
                      className="px-3 py-1.5 bg-[#009b86] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      查看全部
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.map(task => {
                      let typePillStyle = "bg-rose-50 border-rose-200 text-rose-600";
                      if (task.type === "regular") {
                        typePillStyle = "bg-emerald-50 border-emerald-250 text-emerald-600";
                      } else if (task.type === "cert") {
                        typePillStyle = "bg-blue-50 border-blue-250 text-blue-600";
                      } else if (task.type === "contest") {
                        typePillStyle = "bg-purple-50 border-purple-250 text-purple-600";
                      }

                      let statusPillStyle = "bg-zinc-100 border-zinc-200 text-zinc-400";
                      if (task.status === "ongoing") {
                        statusPillStyle = "bg-emerald-500 text-white border-transparent font-black";
                      } else if (task.status === "upcoming") {
                        statusPillStyle = "bg-amber-500 text-white border-transparent font-black";
                      }

                      return (
                        <div
                          key={task.id}
                          className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 space-y-4 relative group"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center flex-wrap gap-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${typePillStyle}`}>
                                  {task.typeName}
                                </span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusPillStyle}`}>
                                  {task.statusName}
                                </span>
                              </div>
                              <h3 className="text-sm font-black text-zinc-900 group-hover:text-[#10A66A] transition-colors leading-tight">
                                {task.title}
                              </h3>
                            </div>
                            
                            <span className="text-[9px] font-mono text-zinc-400 font-extrabold uppercase tracking-widest shrink-0 bg-zinc-50 border border-zinc-200/50 px-2.5 py-1.5 rounded-lg">
                              TASK-ID: {task.id.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-550 leading-relaxed font-semibold">
                            {task.desc}
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] my-3 border-t border-b border-dashed border-zinc-150 py-2.5 font-mono text-zinc-500 font-bold items-center">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span>{task.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span>时长: {task.duration}分钟</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-3.5 h-3.5 text-[#10A66A] shrink-0" />
                              <span>总分: {task.totalPoints}分</span>
                            </div>
                            <div className="flex items-center space-x-1 sm:justify-end text-rose-500">
                              <Award className="w-3.5 h-3.5 shrink-0" />
                              <span>{"mode" in task ? task.mode : `及格分: ${task.passingPoints}分`}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[10px] text-zinc-400 font-bold flex items-center space-x-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#10A66A]" />
                              <span>平台统考防作弊监测系统已开启动态防护</span>
                            </span>

                            {task.status === "ongoing" && (
                              <button
                                onClick={() => handleStartExam(task.id, task.title)}
                                className="px-4 py-2 bg-[#10A66A] hover:bg-[#07875A] text-white text-xs font-black rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                              >
                                <span>{task.buttonText}</span>
                              </button>
                            )}

                            {task.status === "upcoming" && (
                              <button
                                onClick={() => {
                                  if (task.id === "exam-3") {
                                    showToast("正在载入《工业互联网竞赛大纲及全国章程解析》大纲要求...");
                                  } else {
                                    showToast(`物联网综合测试尚未激活，系统开启时间为：2026-06-10 09:00`);
                                  }
                                }}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                              >
                                <span>{task.buttonText}</span>
                              </button>
                            )}

                            {task.status === "ended" && (
                              <button
                                onClick={() => showToast("您的历史最终评分结果：嵌入式开发成绩为 85分 (总分：100分，及格分：60分)，已成功备份。")}
                                className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white text-xs font-black rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                              >
                                <span>{task.buttonText}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* Right Column (4 cols): Info Panel */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Module 1: Statistics */}
                <div className="bg-white border border-[#CFEFE0] rounded-xl p-5 space-y-4 shadow-sm">
                  <span className="text-xs font-black text-zinc-900 tracking-wider flex items-center space-x-2 border-b border-zinc-150 pb-2.5">
                    <TrendingUp className="w-4.5 h-4.5 text-[#10A66A]" />
                    <span>考试统计 (本学段)</span>
                  </span>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-[#EAF8F1] border border-[#10A66A]/20 p-3 rounded-lg">
                      <span className="text-[10px] text-zinc-400 font-extrabold block uppercase">常规考试</span>
                      <span className="text-lg font-black text-[#10A66A] font-mono">6 场</span>
                    </div>
                    <div className="bg-blue-50/40 border border-blue-200/40 p-3 rounded-lg">
                      <span className="text-[10px] text-zinc-400 font-extrabold block uppercase">认证测评</span>
                      <span className="text-lg font-black text-blue-600 font-mono font-bold">3 场</span>
                    </div>
                    <div className="bg-purple-50/40 border border-purple-200/40 p-3 rounded-lg">
                      <span className="text-[10px] text-zinc-400 font-extrabold block uppercase">竞赛</span>
                      <span className="text-lg font-black text-purple-600 font-mono font-bold">2 场</span>
                    </div>
                    <div className="bg-amber-50/50 border border-amber-200/40 p-3 rounded-lg">
                      <span className="text-[10px] text-zinc-400 font-extrabold block uppercase">进行中</span>
                      <span className="text-lg font-black text-amber-600 font-mono font-bold">1 场</span>
                    </div>
                  </div>
                </div>

                {/* Module 2: Reminders */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3.5 shadow-sm">
                  <span className="text-xs font-black text-zinc-900 tracking-wider flex items-center space-x-2 border-b border-zinc-150 pb-2.5">
                    <Bell className="w-4.5 h-4.5 text-zinc-550" />
                    <span>临近考期日程提醒</span>
                  </span>

                  <div className="space-y-3">
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-500">
                      <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 mb-1">
                        <span>TODAY SCHEDULE</span>
                        <span>暂无考试</span>
                      </div>
                      今日暂无即将开始考试
                    </div>

                    <div className="p-3 bg-[#EAF8F1]/25 border border-[#10A66A]/30 rounded-lg space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-[9px] font-mono text-[#10A66A]">
                        <span>NEAREST EXAM</span>
                        <span className="bg-amber-500 text-white rounded px-1.5 font-bold">即将开始</span>
                      </div>
                      <p className="text-zinc-800 font-extrabold">物联网基础综合测试</p>
                      <div className="flex justify-between items-center text-[9px] text-zinc-400 font-mono">
                        <span>开始时间</span>
                        <span>2026-06-10 09:00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Module 3: Instructions info */}
                <div className="bg-zinc-900 text-white rounded-xl p-5 space-y-3 shadow-md">
                  <span className="text-xs font-black text-[#10A66A] tracking-wider flex items-center space-x-2 border-b border-zinc-800 pb-2.5">
                    <Building2 className="w-4.5 h-4.5 text-[#10A66A]" />
                    <span>考试规范与大厅章程</span>
                  </span>

                  <ul className="space-y-2 text-[10.5px] text-zinc-300 font-bold list-disc pl-4 leading-relaxed">
                    <li>支持<strong>常规考试、认证考试、竞赛</strong>统一入口。</li>
                    <li>可随时通过类型 Tab 与状态快速锁定关键考卷进入作答。</li>
                    <li>所有作答记录与分数自动上传至平台服务器建档。</li>
                  </ul>
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* ================= PAGE VIEW B: SIMULATED IN-SEAT TEST COCKPIT ================= */
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-lg min-h-[500px] flex flex-col justify-between animate-in fade-in duration-300">
            
            <div className="bg-gradient-to-r from-[#10A66A] to-emerald-800 text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[10px] font-mono opacity-85 font-extrabold tracking-wider">
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[9px]">EXAM_LIVE_COCKPIT</span>
                  <span>1+X NLE-EXAM ONLINE AGENT</span>
                </div>
                <h3 className="text-xs font-black">
                  当前试卷：{examTasks.find(e => e.id === selectedExamId)?.title}
                </h3>
              </div>

              <button
                onClick={() => {
                  setSelectedExamId(null);
                  showToast("已成功返回考试大厅");
                }}
                className="px-3.5 py-1.8 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-black rounded-lg cursor-pointer transition-all"
              >
                &larr; 退出考场 返回大厅
              </button>
            </div>

            <div className="p-0 border-b border-zinc-100 bg-white sticky top-0 z-10 flex divide-x divide-zinc-100 text-[10px] font-black">
                 <div className="flex-1 p-3 flex flex-col items-center justify-center">
                    <span className="text-zinc-400 capitalize">考试状态</span>
                    <span className={`mt-1 ${studentExamStatus === "考试中" ? "text-emerald-500" : studentExamStatus === "预警" ? "text-amber-500" : (studentExamStatus==="异常" || studentExamStatus==="已超时") ? "text-rose-500" : "text-emerald-600"}`}>{studentExamStatus}</span>
                 </div>
                 <div className="flex-1 p-3 flex flex-col items-center justify-center">
                    <span className="text-zinc-400 capitalize">剩余时间</span>
                    <span className={`mt-1 font-mono text-zinc-900 ${examTimer < 600 ? "text-rose-500 animate-pulse" : ""}`}>
                       {Math.floor(examTimer/3600).toString().padStart(2,"0")}:{Math.floor((examTimer%3600)/60).toString().padStart(2,"0")}:{(examTimer%60).toString().padStart(2,"0")}
                    </span>
                 </div>
                 <div className="flex-1 p-3 flex flex-col items-center justify-center">
                    <span className="text-zinc-400 capitalize">切屏次数</span>
                    <span className={`mt-1 font-mono ${switchCount >= MAX_SWITCH ? "text-rose-500" : "text-zinc-900"}`}>{switchCount} / {MAX_SWITCH}</span>
                 </div>
                 <div className="flex-1 p-3 flex flex-col items-center justify-center">
                    <span className="text-zinc-400 capitalize">复制粘贴限制</span>
                    <span className="mt-1 text-emerald-500">已开启</span>
                 </div>
                 <div className="flex-1 p-3 flex flex-col items-center justify-center">
                    <span className="text-zinc-400 capitalize">异常行为</span>
                    <span className={`mt-1 font-mono ${copyPasteAnomalies > 0 ? "text-amber-500" : "text-zinc-900"}`}>{copyPasteAnomalies} 条</span>
                 </div>
                 <div className="flex-1 p-3 flex flex-col items-center justify-center">
                    <span className="text-zinc-400 capitalize">限考/已用</span>
                    <span className="mt-1 font-mono text-zinc-900">1 / {usedAttempts}</span>
                 </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto space-y-6 max-h-[500px]">
              
              {!examStarted ? (
                <div className="max-w-xl mx-auto space-y-6 mt-8">
                  <div className="text-center space-y-2">
                     <h2 className="text-xl font-black text-zinc-900 tracking-tight">考试作答</h2>
                     <p className="text-xs font-bold text-zinc-500 max-w-sm mx-auto">请仔细阅读考试规则并确认环境准备完毕后进入考场。</p>
                  </div>
                  
                  <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-2.5">
                     <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">考试名称：</span> <span className="text-zinc-900 font-black">{examTasks.find(e => e.id === selectedExamId)?.title}</span></div>
                     <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">考试场次：</span> <span className="text-zinc-900 font-black">第一场</span></div>
                     <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">考试时间：</span> <span className="text-zinc-900 font-black">2026-06-10 09:00 - 11:00</span></div>
                     <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">考试时长：</span> <span className="text-zinc-900 font-black">120 分钟</span></div>
                     <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">限考次数：</span> <span className="text-zinc-900 font-black">1 次</span></div>
                     
                     <div className="flex justify-between text-xs font-bold text-zinc-600 border-t border-zinc-200 border-dashed pt-2.5 mt-1"><span className="text-zinc-500">剩余次数：</span> <span className="text-zinc-900 font-black">{1 - usedAttempts} 次</span></div>
                     <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">考试状态：</span> <span className={`font-black ${usedAttempts >= 1 ? "text-rose-500" : "text-emerald-500"}`}>{usedAttempts >= 1 ? "不可再次进入" : "可进入考试"}</span></div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
                     <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                     <div className="text-xs font-bold">
                       <p className="mb-2">本场考试已开启防作弊规则：<span className="font-extrabold text-amber-900 underline decoration-2">禁止屏幕切换、禁止复制粘贴、禁止右键菜单。</span></p>
                       <p>违规操作将被实时记录至智能评测大盘。</p>
                     </div>
                  </div>

                  <button 
                     disabled={usedAttempts >= 1}
                     onClick={() => {
                        setExamStarted(true);
                        setUsedAttempts(1);
                        showToast(`《${examTasks.find(e => e.id === selectedExamId)?.title}》考位下载就绪，倒计时已启动。`);
                     }}
                     className={`w-full py-3.5 rounded-xl font-black text-sm transition-all shadow-sm ${usedAttempts >= 1 ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" : "bg-[#10A66A] text-white hover:bg-emerald-600 active:scale-95"}`}>
                     我已知晓，开始考试
                  </button>
                </div>
              ) : !isExamSubmitted ? (
                <div className="space-y-5 max-w-4xl mx-auto"
                   onCopy={e => handleAntiCheatAction(e, "复制操作")}
                   onPaste={e => handleAntiCheatAction(e, "粘贴操作")}
                   onContextMenu={e => handleAntiCheatAction(e, "右键菜单")}
                 >
                  
                  <div className="flex justify-between items-center text-[10px] font-mono font-black border-b border-zinc-100 pb-3">
                    <span className="text-[#10A66A]">
                      答题进度: {currentQuestionIdx + 1} / {examQuestions.length}
                    </span>
                    <span className="text-zinc-400">
                       {/* REMOVED MOCK */} 
                    </span>
                    <span className="text-rose-500 font-extrabold">当前分值: 100分</span>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
                    <p className="text-xs font-black text-zinc-900 leading-relaxed">
                      {examQuestions[currentQuestionIdx].id}. {examQuestions[currentQuestionIdx].question}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {examQuestions[currentQuestionIdx].options.map((opt, idx) => {
                      const isChosen = answers[currentQuestionIdx] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(idx)}
                          className={`w-full text-left p-3.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-start gap-3 ${
                            isChosen 
                              ? "bg-[#EAF8F1] border-[#10A66A]/80 text-[#10A66A]" 
                              : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center font-mono text-[10px] font-extrabold ${
                            isChosen ? "border-[#10A66A] bg-[#10A66A] text-white" : "border-zinc-300"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-relaxed">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-5 border-t border-zinc-150">
                    <button
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                      className="px-4 py-2 border border-zinc-250 text-zinc-650 bg-white font-extrabold text-xs rounded-lg cursor-pointer hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      &larr; 上一题
                    </button>

                    <div className="flex space-x-1">
                      {examQuestions.map((_, i) => (
                        <span 
                          key={i} 
                          className={`w-2.5 h-2.5 rounded-full ${i === currentQuestionIdx ? "bg-[#10A66A]" : "bg-zinc-200"}`} 
                        />
                      ))}
                    </div>

                    {currentQuestionIdx < examQuestions.length - 1 ? (
                      <button
                        onClick={() => {
                          if (answers[currentQuestionIdx] === undefined) {
                            showToast("请至少勾选一个选项。");
                            return;
                          }
                          setCurrentQuestionIdx(prev => prev + 1);
                        }}
                        className="px-5 py-2 bg-[#10A66A] hover:bg-[#07875A] text-white font-black text-xs rounded-lg cursor-pointer flex items-center gap-1 transition-all"
                      >
                        <span>下一题</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (answers[currentQuestionIdx] === undefined) {
                            showToast("请确认完成最后一题的答案采集。");
                            return;
                          }
                          calculateScore();
                        }}
                        className="px-5 py-2 bg-[#10A66A] hover:bg-[#07875A] text-white font-black text-xs rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <span>提交作答</span>
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                <div className="space-y-6 max-w-2xl mx-auto text-center py-6 animate-in zoom-in-95 duration-200">
                  
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-[#10A66A] mx-auto flex items-center justify-center relative">
                    <div className="absolute inset-2 rounded-full bg-emerald-50 border border-emerald-100 flex flex-col justify-center items-center">
                      <span className="text-2xl font-black text-rose-500 font-mono tracking-tighter">
                        {examScore}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-extrabold tracking-widest leading-3">PTS</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-zinc-900">
                      {examScore >= 60 ? "🏆 提交成功，及格通过！" : "⚠️ 评测未达及格线"}
                    </h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-bold">
                      本套统判分数已成功备案归档至平台云端教考系统数据库。
                    </p>
                  </div>

                  <div className="text-left space-y-3 bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-[11px] font-medium leading-relaxed">
                    <span className="font-extrabold text-[#10A66A] block border-b border-zinc-200 pb-2 flex items-center gap-1">
                      <BookmarkCheck className="w-4 h-4 text-[#10A66A]" />
                      <span>【诊断评价报告】</span>
                    </span>
                    
                    {examQuestions.map((q, idx) => {
                      const isCorrect = answers[idx] === q.correct;
                      return (
                        <div key={idx} className="border-b border-zinc-150 pb-3 last:border-0 last:pb-0 font-bold space-y-1">
                          <p className="text-zinc-800">
                            {idx + 1}. {q.question}
                          </p>
                          <div className="flex gap-x-4 font-mono text-[10px] my-1">
                            <span className={isCorrect ? "text-[#10A66A] block" : "text-rose-500 block"}>
                              您的选择: 选项 { (answers[idx] !== undefined) ? String.fromCharCode(65 + answers[idx]) : "未填" }
                            </span>
                            <span className="text-zinc-500 block">
                              正确参考: 选项 {String.fromCharCode(65 + q.correct)}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 italic font-medium">
                            解析: {q.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-center items-center gap-3">
                    <button
                      onClick={() => {
                        setAnswers({});
                        setCurrentQuestionIdx(0);
                        setIsExamSubmitted(false);
                        setExamScore(0);
                      }}
                      className="px-4 py-2 bg-white hover:bg-zinc-100 border border-zinc-250 text-zinc-700 text-xs font-black rounded-lg cursor-pointer transition-all flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>重新挑战本题</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedExamId(null);
                        showToast("状态已保存，返回考试大厅");
                      }}
                      className="px-5 py-2 bg-[#10A66A] hover:bg-[#07875A] text-white text-xs font-black rounded-lg cursor-pointer transition-all"
                    >
                      返回考试大厅 &rarr;
                    </button>
                  </div>

                </div>
              )}
            </div>

            <div className="bg-zinc-50 border-t border-zinc-200 p-3 text-center text-[10px] text-zinc-400 font-semibold select-none">
              智慧教育综合实训平台 统考安全终端 © 2026 同步安全环境已激活
            </div>

          </div>
        )}

      </div>

      {/* Corporate Footing and Address Disclaimer */}
      <footer id="u-exam-footer" className="w-full bg-zinc-150 py-5 px-4 text-center border-t border-zinc-200 select-none shrink-0">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <span className="text-zinc-650 font-extrabold text-xs tracking-wide">
              智慧教育综合实训平台
            </span>
            <span className="hidden sm:inline text-zinc-400">|</span>
            <span className="text-zinc-500 font-bold text-[11px]">
              实训教考管理中心 (INTELLIGENT EDUCATION TRAINING CENTER)
            </span>
          </div>
          
          <p className="text-[10px] text-zinc-400 font-semibold max-w-4xl mx-auto leading-relaxed">
            免责及版权声明：本智慧教育综合实训平台中所采用的技术大纲、仿真总线内核版权。学员在本沙箱中所产生的遥测数据和评断分析供个人和学校日常教学统考建档之用，严禁将内部接口用于商业泄密行为。
          </p>
        </div>
      </footer>

    </div>
  );
}
