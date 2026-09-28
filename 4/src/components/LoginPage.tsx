/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserSession } from "../types";
import { Info, Eye, EyeOff } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback to student_demo if left blank for seamless zero-config previewing
    const finalUsername = username.trim() || "student_demo";
    const finalPassword = password.trim() || "123456";

    if (finalPassword !== "123456") {
      setErrorMsg("密码不正确 (默认密码为 123456)");
      return;
    }

    // Determine role based on username
    let role: "student" | "teacher" | "admin" = "student";
    let realName = "学生1";
    let className = "演示班级";
    let schoolName = "北京新大陆时代科技-产品演示（华北区）";
    let department = "通识教育";

    if (finalUsername.includes("teacher") || finalUsername === "admin" || finalUsername === "admin_master") {
      role = "teacher";
      realName = "教师1";
      className = "系统教研与考试组主任";
      schoolName = "北京新大陆时代科技-产品演示（华北区）";
      department = "中德智能网联合作示范实训基地";
    }

    onLoginSuccess({
      id: "usr-" + Math.floor(Math.random() * 9000 + 1000),
      username: finalUsername,
      realName,
      role,
      className,
      schoolName,
      department
    });
  };

  const handleQuickFill = (role: "student" | "teacher") => {
    if (role === "student") {
      setUsername("student_demo");
      setPassword("123456");
    } else {
      setUsername("admin_master");
      setPassword("123456");
    }
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-850 font-sans antialiased text-xs flex flex-col lg:flex-row">
      {/* Left Side: Brand Logo Header & Beautiful Skyscrapers Card Container */}
      <div className="flex-1 lg:max-w-[55%] xl:max-w-[58%] p-6 lg:p-10 flex flex-col justify-between bg-white">
        
        {/* Header containing name and green/teal double dots */}
        <div className="flex items-center space-x-2 select-none mb-6 lg:mb-0">
          <div className="flex space-x-1.5 shrink-0 items-center">
            <span className="w-3.5 h-3.5 rounded-full bg-[#10A66A] inline-block" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#34D399] inline-block" />
          </div>
          <h1 className="text-sm md:text-base font-black tracking-tight text-zinc-900 font-display">
            智联网综合实践平台
          </h1>
        </div>

        {/* Skyscrapers Rounded Card Visual with custom text overlay card */}
        <div className="relative flex-1 min-h-[320px] lg:min-h-[500px] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-end p-6 md:p-8 lg:p-10 ring-1 ring-zinc-100">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop" 
            alt="Intelligent Space"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />
          {/* Gentle black shroud for high fidelity look */}
          <div className="absolute inset-0 bg-black/5 select-none pointer-events-none" />

          {/* Glowing Translucent Emerald Card overlay in low portion of skyscrapers */}
          <div className="relative z-10 bg-[#10A66A] bg-opacity-[0.92] backdrop-blur-md rounded-2xl p-6 md:p-8 text-white space-y-4 border border-white/10 max-w-xl shadow-xl">
            <div className="space-y-1">
              <h2 className="text-base md:text-lg font-black tracking-tight/tight leading-tight">
                协同共享，创新赋能
              </h2>
              <p className="text-xs md:text-sm font-bold text-emerald-50">
                智网统一实践空间，让教与学更高效
              </p>
            </div>
            <div className="border-t border-white/20 pt-4">
              <p className="text-[10px] md:text-[11px] leading-relaxed text-emerald-50/85 font-medium font-sans">
                Collaborative sharing, innovative empowerment. Unified IoT practice workspace designed to streamline laboratory teaching, simplify setup, and elevate learning efficiency.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Quick Active Gateway Status & Login Action Container */}
      <div className="w-full lg:max-w-[45%] xl:max-w-[42%] flex flex-col justify-between bg-white p-6 lg:p-10 border-t lg:border-t-0 lg:border-l border-zinc-100 min-h-[500px] lg:min-h-screen">
        
        {/* Active Engine Gateway Status Top Level Indicators */}
        <div className="hidden sm:flex items-center justify-between select-none text-[10px] text-zinc-400 font-bold font-mono">
          <span>TLS SECURE GATEWAY ACTIVE</span>
          <div className="flex items-center space-x-1.5 text-zinc-500 font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>容器引擎正常</span>
          </div>
        </div>

        {/* Center: Interactive Welcome back Form & Inputs */}
        <div className="m-auto w-full max-w-sm py-8 space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight">
              欢迎登录
            </h2>
            <div className="w-12 h-1 bg-[#10A66A] rounded-full" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-150 rounded-lg text-red-650 flex items-center gap-2 text-xs font-bold leading-relaxed animate-in fade-in duration-200">
                <Info className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Input - Username */}
            <div className="space-y-1">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.8 text-xs text-zinc-800 font-bold placeholder-zinc-400 focus:outline-none focus:border-[#10A66A] focus:ring-1 focus:ring-[#10A66A]/20 transition-all font-sans"
                placeholder="用户名"
              />
            </div>

            {/* Input - Password */}
            <div className="relative space-y-1">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg pl-4 pr-10 py-2.8 text-xs text-zinc-800 font-bold placeholder-zinc-400 focus:outline-none focus:border-[#10A66A] focus:ring-1 focus:ring-[#10A66A]/20 transition-all font-sans"
                placeholder="密码"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Solid Active Emerald Button */}
            <button 
              type="submit"
              className="w-full py-2.8 bg-[#10A66A] hover:bg-[#07875A] active:bg-[#056D49] text-white text-xs font-black rounded-lg shadow-sm transition-all duration-150 cursor-pointer text-center tracking-wider font-sans mt-2"
            >
              登录
            </button>

          </form>
        </div>

        {/* Corporate Legal & Registration Footer */}
        <div className="text-right select-none text-[10px] text-zinc-400 font-semibold font-sans border-t border-zinc-100 pt-4 leading-normal">
          Copyright 北京新大陆时代科技有限公司 京ICP备15057567号
        </div>

      </div>
    </div>
  );
}

