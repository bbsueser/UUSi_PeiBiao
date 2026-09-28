/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserSession } from "../types";
import { 
  User, 
  Settings, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle, 
  Activity, 
  Clock, 
  MapPin, 
  BookOpen, 
  Lock, 
  Award, 
  Sparkles,
  Building2
} from "lucide-react";

interface PersonalCenterProps {
  session: UserSession;
  onLogout: () => void;
}

export default function PersonalCenter({ session, onLogout }: PersonalCenterProps) {
  const [activePassword, setActivePassword] = useState<string>("******");
  const [showToast, setShowToast] = useState<boolean>(false);

  const stats = [
    { label: "累计完成学时", value: "32.5 小时", sub: "本周新增 3.5h", icon: Clock, color: "text-[#10A66A]" },
    { label: "已通过课程数", value: "11 Mapped", sub: "进行中课程: 4", icon: BookOpen, color: "text-[#10A66A]" },
    { label: "已验证 1+X 勋章", value: "3 枚核准", sub: "2 枚正在审评", icon: Award, color: "text-amber-500" }
  ];

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="bg-[#F8FAF9] min-h-screen text-zinc-800 font-sans antialiased text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#10A66A] text-white text-xs px-5 py-3 rounded-lg border border-[#CFEFE0] flex items-center gap-2 shadow-xl animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="font-bold">平台配置参数由于多副本隔离已自动同步到本地！</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left panel: Info outline */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-[#CFEFE0] rounded-xl p-5 shadow-xs text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                {/* Avatar */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#10A66A] to-emerald-600 text-white font-black text-2xl flex items-center justify-center border-4 border-white shadow-md">
                  {session.realName.substring(0, 1)}
                </div>
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#10A66A] border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold" title="在线">
                  ✓
                </span>
              </div>

              <div>
                <h2 className="text-sm font-black text-zinc-900">{session.realName}</h2>
                <span className="text-[10px] font-mono text-zinc-400 font-bold">STUDENT-ID: {session.id}</span>
              </div>

              <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#CFEFE0] inline-block text-[10px] font-mono text-zinc-500 font-bold uppercase">
                系统角色: <span className="text-[#10A66A] font-black">{session.role === "student" ? "在读学员" : "教研/讲师核心管理员"}</span>
              </div>

              <div className="border-t border-zinc-100 pt-4 space-y-2.5 text-left text-[11px] font-bold text-zinc-650">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>机构：{session.schoolName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>分部：{session.department}</span>
                </div>
                {session.className && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>排班：{session.className}</span>
                  </div>
                )}
              </div>

              {/* Log out */}
              <button
                onClick={onLogout}
                className="w-full py-1.8 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-black text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>注销退出系统</span>
              </button>
            </div>
          </div>

          {/* Right panel: Settings and stats */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 3 cards stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((st, idx) => {
                const Icon = st.icon;
                return (
                  <div key={idx} className="bg-white border border-[#CFEFE0] rounded-xl p-4 shadow-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-extrabold">{st.label}</span>
                      <Icon className={`w-4 h-4 ${st.color}`} />
                    </div>
                    <p className="text-base font-black text-zinc-900 font-mono tracking-tight">{st.value}</p>
                    <span className="text-[10px] text-zinc-400 font-medium font-mono">{st.sub}</span>
                  </div>
                );
              })}
            </div>

            {/* Profile Config Sandbox Form */}
            <div className="bg-white border border-[#CFEFE0] rounded-xl p-5 shadow-xs space-y-4">
              <span className="text-xs font-black text-zinc-900 block pb-2 border-b border-zinc-100 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-[#10A66A]" />
                <span>实训系统安全参数自配置</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-zinc-650">绑定用户名</label>
                  <input 
                    type="text" 
                    value={session.username}
                    disabled 
                    className="w-full bg-zinc-100 border border-zinc-200 rounded-lg px-3 py-1.5 font-mono font-bold text-zinc-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-zinc-650">终端密匙授权码</label>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      value={activePassword}
                      disabled 
                      className="w-full bg-zinc-100 border border-zinc-200 rounded-lg px-3 py-1.5 font-mono font-bold text-zinc-500 cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setActivePassword(activePassword === "******" ? "platform-secret-key-2026" : "******");
                        triggerToast();
                      }}
                      className="px-3 bg-zinc-100 border border-zinc-250 hover:bg-zinc-200 rounded-lg font-bold cursor-pointer"
                    >
                      显示
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5 text-amber-750">
                <span className="font-extrabold flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>【多全真沙盒隔离自律指引】</span>
                </span>
                <p className="leading-relaxed font-semibold">
                  由于 人工智能算法训练平台 部署的是无损、免损坏、零时延隔离全容器集群。学生通过 VNC 所产生的任何遥测模拟波形皆缓存在该沙盒卷中，如果发生任何命令越权，系统将在每天凌晨 04:00 自动执行一键回源重构。请随时将关键代码备份到个人的云端 VSCode 中或提交仓库。
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
