/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ActiveTab, UserSession, AiAssistantInitContext } from "./types";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import CourseHall from "./components/CourseHall";
import LabHall from "./components/LabHall";
import ExamHall from "./components/ExamHall";
import BidSpecs from "./components/BidSpecs";
import PersonalCenter from "./components/PersonalCenter";
import AiAssistant from "./components/AiAssistant";
import TaskAssignment from "./components/TaskAssignment";
import { 
  Building2, 
  User, 
  LogOut, 
  ShieldCheck, 
  Clock, 
  Menu, 
  X,
  Layers,
  BookOpen,
  Monitor,
  Award,
  FileSpreadsheet,
  Settings,
  BrainCircuit,
  ListTodo
} from "lucide-react";

export default function App() {
  const [session, setSession] = useState<UserSession | null>({
    id: "usr-student-1",
    username: "student_demo",
    realName: "学生1",
    role: "student",
    className: "物联网2301班",
    schoolName: "北京新大陆时代科技-产品演示（华北区）",
    department: "物联网应用技术专业"
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [aiAssistantTool, setAiAssistantTool] = useState<"courseStandard" | "textbookOutline" | "questionBank" | "pptOutline">("courseStandard");
  const [aiAssistantContext, setAiAssistantContext] = useState<AiAssistantInitContext | undefined>(undefined);

  const jumpToAiTool = (tool: "courseStandard" | "textbookOutline" | "questionBank" | "pptOutline") => {
    setAiAssistantTool(tool);
    setActiveTab("ai_assistant");
    setMobileMenuOpen(false);
  };

  const jumpToAiAssistantWithContext = (context?: AiAssistantInitContext) => {
    setAiAssistantContext(context);
    setActiveTab("ai_assistant");
    setMobileMenuOpen(false);
  };

  // Clock ticks
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quick persistent session check from localStorage for developer reload tolerance
  useEffect(() => {
    const stored = localStorage.getItem("platform_session");
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("platform_session");
      }
    } else {
      const defaultStudent: UserSession = {
        id: "usr-student-1",
        username: "student_demo",
        realName: "学生1",
        role: "student",
        className: "物联网2301班",
        schoolName: "北京新大陆时代科技-产品演示（华北区）",
        department: "物联网应用技术专业"
      };
      setSession(defaultStudent);
      localStorage.setItem("platform_session", JSON.stringify(defaultStudent));
    }
  }, []);

  // Role Protection Guard: if student attempts to enter teacher-level or specs bidding pages, automatically returns them to dashboard
  useEffect(() => {
    if (session?.role === "student") {
      const forbiddenTabs = ["task_assignment", "specs", "best_practices", "product_center", "about_platform"];
      if (forbiddenTabs.includes(activeTab)) {
        setActiveTab("dashboard");
      }
    }
  }, [activeTab, session]);

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem("platform_session", JSON.stringify(newSession));
    setActiveTab("ai_assistant");
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem("platform_session");
  };

  const jumpToTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  if (!session) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="bg-[#f4f6f8] min-h-screen text-zinc-900 font-sans antialiased flex flex-col justify-between">
      
      {/* Supreme Navigation Header - Screenshot 3 Style */}
      <nav id="u-platform-nav" className="sticky top-0 z-40 bg-white text-zinc-800 border-b border-zinc-200 select-none shrink-0 text-xs font-bold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-[56px]">
            
            {/* Logo and branding - Screenshot 3 Style */}
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => jumpToTab("dashboard")}>
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded bg-[#10A66A] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Building2 className="w-5 h-5 text-white" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-black tracking-tighter text-zinc-900 leading-tight">智慧教育综合实训平台</span>
                    <span className="text-[8px] text-zinc-400 font-bold tracking-[0.2em] mt-0.5 uppercase">INTELLIGENT EDUCATION TRAINING PLATFORM</span>
                 </div>
              </div>
            </div>

            {/* Desktop list parameters - Screenshot 3 Tabs */}
            <div className="hidden lg:flex items-center gap-2">
              {[
                { tab: "dashboard" as ActiveTab, label: "首页" },
                { tab: "courses" as ActiveTab, label: "课程大厅" },
                { tab: "labs" as ActiveTab, label: "实验大厅" },
                { tab: "exams" as ActiveTab, label: "考试大厅" },
                { tab: "task_assignment" as ActiveTab, label: "实验任务" },
                { tab: "ai_assistant" as ActiveTab, label: session.role === "student" ? "AI技能助手" : "AI教师助手" },
              ].map(item => {
                const active = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => jumpToTab(item.tab)}
                    className={`px-5 py-2 rounded-lg cursor-pointer transition-all text-sm font-black relative ${
                      active 
                        ? "text-[#10A66A] bg-[#EAF8F1]" 
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    {item.label}
                    {active && <div className="absolute bottom-0 left-5 right-5 h-0.5 bg-[#10A66A] rounded-full" />}
                  </button>
                );
              })}
            </div>

            {/* Right: metadata system time and login session action drawer */}
            <div className="hidden md:flex items-center gap-6">
              {/* Logged user profile summary - Screenshot 3 Right Side */}
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => jumpToTab("personal_center")}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="text-right">
                    <span className="text-zinc-900 font-black block group-hover:text-[#10A66A] transition-colors text-sm">{session.realName}</span>
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-widest leading-none mt-1">
                      {session.role === "student" ? "STUDENT" : "INSTRUCTOR"}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#EAF8F1] flex items-center justify-center font-black text-[#10A66A] border-2 border-white shadow-sm overflow-hidden">
                    {session.role === "student" ? <User className="w-5 h-5" /> : "教"}
                  </div>
                </div>

                <div className="w-px h-6 bg-zinc-200" />

                <button
                  onClick={handleLogout}
                  title="安全退出"
                  className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-xl transition-all cursor-pointer group"
                >
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Mobile menu triggers */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-zinc-100 rounded-xl text-zinc-500 hover:text-blue-600 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {/* Mobile slide drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-zinc-900 border-t border-zinc-800 px-4 py-3 space-y-1.5 animate-in slide-in-from-top duration-200">
            {[
              { tab: "dashboard" as ActiveTab, label: "首页工作台" },
              { tab: "courses" as ActiveTab, label: "课程大厅" },
              { tab: "labs" as ActiveTab, label: "云实验沙箱" },
              { tab: "exams" as ActiveTab, label: "考试大厅" },
              { tab: "ai_assistant" as ActiveTab, label: session?.role === "student" ? "AI技能助手" : "AI教师助手" },
              { tab: "personal_center" as ActiveTab, label: "个人中心" }
            ].map(item => (
              <button
                key={item.tab}
                onClick={() => jumpToTab(item.tab)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg font-black transition-colors block text-xs cursor-pointer ${
                  activeTab === item.tab 
                    ? "bg-[#009b86] text-white" 
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Logout mobile link */}
            <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-[11px] text-zinc-400">
              <span className="font-mono">{session.realName} ({session.role})</span>
              <button
                onClick={handleLogout}
                className="text-red-400 font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>登出系统</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Supreme Dynamic Canvas Main viewport router */}
      <main className="flex-1">
        {activeTab === "dashboard" && (
          <Dashboard session={session} onTabChange={jumpToTab} onJumpToAiTool={jumpToAiTool} />
        )}
        
        {activeTab === "courses" && (
          <CourseHall session={session} onTabChange={jumpToTab} onJumpToAi={jumpToAiAssistantWithContext} />
        )}

        {activeTab === "labs" && (
          <LabHall session={session} />
        )}

        {activeTab === "exams" && (
          <ExamHall session={session} />
        )}

        {activeTab === "task_assignment" && (
          <TaskAssignment session={session} onTabChange={jumpToTab} />
        )}

        {activeTab === "ai_assistant" && (
          <AiAssistant session={session} activeTool={aiAssistantTool} setActiveTool={setAiAssistantTool} context={aiAssistantContext} />
        )}

        {["specs", "best_practices", "product_center", "about_platform"].includes(activeTab) && (
          <BidSpecs initialSubTab={activeTab as any} />
        )}

        {activeTab === "personal_center" && (
          <PersonalCenter session={session} onLogout={handleLogout} />
        )}
      </main>

    </div>
  );
}
