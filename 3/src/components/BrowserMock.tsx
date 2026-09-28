/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw, ShieldAlert, ShieldCheck, Globe, Wifi, Command } from "lucide-react";

interface BrowserMockProps {
  initialUrl?: string;
  title?: string;
  children?: React.ReactNode;
}

export default function BrowserMock({ initialUrl = "https://iot.lab.edu/dashboards", title = "物联网遥测大盘", children }: BrowserMockProps) {
  const [url, setUrl] = useState<string>(initialUrl);
  const [isSecure, setIsSecure] = useState<boolean>(true);

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-lg flex flex-col w-full h-full">
      {/* macOS / Chrome styled browser header */}
      <div className="bg-zinc-100 p-3 border-b border-zinc-200 flex items-center justify-between gap-3 select-none">
        {/* Left: Window close, minimize, expand buttons */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-rose-455 bg-rose-500 border border-rose-600/30 block" />
          <span className="w-3 h-3 rounded-full bg-amber-455 bg-amber-500 border border-amber-600/30 block" />
          <span className="w-3 h-3 rounded-full bg-emerald-455 bg-emerald-500 border border-emerald-600/30 block" />
        </div>

        {/* Center-left: Navigation buttons */}
        <div className="flex items-center space-x-1 shrink-0 text-zinc-400">
          <button type="button" className="p-1 hover:bg-zinc-200 hover:text-zinc-700 rounded-md transition-colors cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="p-1 hover:bg-zinc-200 hover:text-zinc-700 rounded-md transition-colors cursor-pointer">
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="p-1 hover:bg-zinc-200 hover:text-zinc-700 rounded-md transition-colors cursor-pointer">
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Address Bar */}
        <div className="flex-1 max-w-xl bg-white border border-zinc-250/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[11px] font-mono text-zinc-650 font-bold shadow-2xs">
          <div className="flex items-center space-x-1.5 truncate">
            {isSecure ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className="text-zinc-400">secure | </span>
            <span className="truncate">{url}</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0 text-zinc-400">
            <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
            <Command className="w-3 h-3" />
          </div>
        </div>

        {/* Right: Tab Branding Label */}
        <div className="hidden sm:flex items-center space-x-1.5 shrink-0">
          <span className="text-[10px] font-extrabold text-zinc-450 uppercase tracking-widest font-mono">
            {title}
          </span>
          <Globe className="w-3.5 h-3.5 text-[#009b86]" />
        </div>
      </div>

      {/* Main Browser Canvas space */}
      <div className="flex-1 bg-zinc-50 relative overflow-hidden flex flex-col min-h-[350px]">
        {children ? children : (
          <div className="m-auto text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[#009b86] mx-auto shadow-inner animate-pulse">
              <Globe className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-zinc-800">未指定网页画布载荷</h4>
              <p className="text-[10px] text-zinc-400 max-w-sm mx-auto leading-relaxed">
                这是一个内置浏览器沙盒。通过挂载不同的 VNC 页面、ThingsBoard 遥测图、以及 Jupyter 仿真模型，学生可在同一屏内调试全功能。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
