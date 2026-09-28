/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Cpu, 
  Layers, 
  ExternalLink,
  BookOpen,
  Award,
  Building2,
  Bookmark,
  CheckCircle,
  FileCheck,
  Server,
  Terminal,
  FileText
} from "lucide-react";

interface BidSpecsProps {
  initialSubTab?: "specs" | "best_practices" | "product_center" | "about_platform";
}

export default function BidSpecs({ initialSubTab = "specs" }: BidSpecsProps) {
  const [subTab, setSubTab] = useState<"specs" | "best_practices" | "product_center" | "about_platform">(initialSubTab);

  const specsList = [
    {
      module: "1. 全真隔离式容器沙箱底座",
      items: [
        "支持一键秒级挂载独立 Linux Terminal / VSCode IDE / Jupyter Lab 共享算力实验容器。",
        "物理级多租户资源隔离模式，各学员虚拟机实例完全独立，避免网络端口或运行库进程互相泄露冲突。",
        "自带 VNC 屏幕串流协议，支持高流畅度 60FPS 2D/3D 仿真画质投屏，内置双向剪贴板与物理多点电触触控配对。"
      ]
    },
    {
      module: "2. Renode 多核高精度硬件仿真模块",
      items: [
        "集成 Cortex-M、Cortex-A 及 RISC-V 核心的多核总线级硬件仿真内核，直接对寄存器级线脚进行断言反馈。",
        "支持 I2C、SPI、UART、RS485 等物理级硬件总线时序动态采样，学员可自行编写仿真驱动协议。",
        "自带 GPIO 线脚逻辑分析仪仿真仪，支持波形输出、逻辑状态即时导出、高低电平调试跟踪。"
      ]
    },
    {
      module: "3. 1+X 智能评测自动化记分一体化设计",
      items: [
        "支持物联网智能化系统集成与应用职业水平大卷的自动下发、在线倒计时答题及智能交卷判定。",
        "内置 NLE-Testing 控制流和测试例，支持学员在命令行终端一键执行 nle-test 测试脚本，抓取物理级实验断言结果并提交考绩大本。",
        "与北京新大陆时代科技有限公司合作联盟标准全面兼容，自带全国 1+X 证书库双向打通配对。"
      ]
    }
  ];

  const productsList = [
    { title: "NLE-AIoT-Platform (平台核心控制流台)" },
    { title: "NLE-Renode-Simulator (高精芯片级总线仿真仪)" },
    { title: "NLE-VNC-Streamer (高性能云端流媒体底盘)" },
    { title: "NLE-Exam-Assessor (1+X 智能自动化考绩大盘)" }
  ];

  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-800 font-sans antialiased text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Sub-tab selection menu for these institutional sections */}
        <div id="u-specs-navbar" className="bg-white p-2.5 rounded-xl border border-zinc-200.5 flex flex-wrap gap-2 shadow-xs border-zinc-200">
          <button
            onClick={() => setSubTab("specs")}
            className={`px-4 py-2 rounded-lg font-black transition-all cursor-pointer ${
              subTab === "specs" 
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-zinc-650 hover:bg-zinc-100"
            }`}
          >
            本平台投标技术规格参数
          </button>
          
          <button
            onClick={() => setSubTab("product_center")}
            className={`px-4 py-2 rounded-lg font-black transition-all cursor-pointer ${
              subTab === "product_center" 
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-zinc-650 hover:bg-zinc-100"
            }`}
          >
            平台组件化硬件配置
          </button>

          <button
            onClick={() => setSubTab("best_practices")}
            className={`px-4 py-2 rounded-lg font-black transition-all cursor-pointer ${
              subTab === "best_practices" 
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-zinc-650 hover:bg-zinc-100"
            }`}
          >
            高校智能网联教学最佳实践
          </button>

          <button
            onClick={() => setSubTab("about_platform")}
            className={`px-4 py-2 rounded-lg font-black transition-all cursor-pointer ${
              subTab === "about_platform" 
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-zinc-650 hover:bg-zinc-100"
            }`}
          >
            关于平台 / 合作伙伴
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs min-h-[400px] leading-relaxed">
          
          {/* SubTab 1:specs */}
          {subTab === "specs" && (
            <div className="space-y-6">
              <div className="border-b border-zinc-150 pb-3">
                <h2 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  <span>人工智能算法训练平台 招标核心参数对照表</span>
                </h2>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Procurement Bidding Technical Specifications and Indicators</p>
              </div>

              <div className="space-y-5">
                {specsList.map((sec, idx) => (
                  <div key={idx} className="space-y-2.5">
                    <h3 className="text-xs font-black text-[#009b86] flex items-center gap-1">
                      <Bookmark className="w-3.5 h-3.5 text-blue-500 fill-current" />
                      <span>{sec.module}</span>
                    </h3>
                    <ul className="pl-6 space-y-1.5 list-disc text-zinc-750 font-semibold font-sans">
                      {sec.items.map((item, itemIdx) => (
                        <li key={itemIdx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 2: product_center */}
          {subTab === "product_center" && (
            <div className="space-y-6">
              <div className="border-b border-zinc-150 pb-3">
                <h2 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  <span>平台产品矩阵与硬件授权组件</span>
                </h2>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Hardware-in-loop Products Portfolio</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { title: "NLE-AIoT-Platform (平台核心控制流台)" },
                  { title: "NLE-Renode-Simulator (高精芯片级总线仿真仪)" },
                  { title: "NLE-VNC-Streamer (高性能云端流媒体底盘)" },
                  { title: "NLE-Exam-Assessor (智能自动化考绩大盘)" }
                ].map((prod, idx) => (
                  <div key={idx} className="p-4 border border-zinc-200 rounded-xl hover:shadow-xs transition-all space-y-2 bg-zinc-50/50">
                    <h3 className="text-xs font-extrabold text-[#009b86] flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[#009b86]" />
                      <span>{prod.title}</span>
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      专人硬件标号：NLE-EDU-{(idx+1)*12}-V4。配备实训授权证书套件。集成边缘核心模组、全真容器底座、高可用串口通信路由。
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 3: best_practices */}
          {subTab === "best_practices" && (
            <div className="space-y-6">
              <div className="border-b border-zinc-150 pb-3">
                <h2 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>全国标杆职业院校 智慧智能网联实验室实施方案</span>
                </h2>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">National Academic Best Practices and Lab Operations</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#009b86]/5 border border-[#009b86]/20 rounded-xl space-y-2">
                  <h3 className="font-extrabold text-zinc-900 flex items-center gap-1">
                    <Award className="w-4 h-4 text-[#009b86]" />
                    <span>北京信息科技应用学院 1+X 模式探索</span>
                  </h3>
                  <p className="text-zinc-650 leading-relaxed font-semibold">
                    该校通过一键部署云沙箱环境，将 <strong>《传感器技应用》</strong> 以及 <strong>《嵌入式仿真》</strong> 自主加入期中期末自动评分测试，使考绩库合格率整体攀升 24%，极速实现线上评卷，彻底告别了传统烧录验证的繁琐机制。
                  </p>
                </div>

                <div className="p-4 bg-blue-50/20 border border-blue-200 rounded-xl space-y-2">
                  <h3 className="font-extrabold text-zinc-900 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>中德智能网联研究院 实验多租户高并发演练</span>
                  </h3>
                  <p className="text-zinc-650 leading-relaxed font-semibold">
                    在全国竞赛集训期间，人工智能算法训练平台经受了单系统并发拉起 240+ 独立 Jupyter 节点及 ThingsBoard 遥测端点的性能考验，物理宿主机资源开销良好，沙盒秒级清理回档，完全防范了学员文件篡改事故。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 4: about_platform */}
          {subTab === "about_platform" && (
            <div className="space-y-6">
              <div className="border-b border-zinc-150 pb-3">
                <h2 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>关于人工智能算法训练平台与合作伙伴的联合愿景</span>
                </h2>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Strategic Joint Ventures and Education Goals</p>
              </div>

              <div className="space-y-4 text-zinc-700 leading-relaxed font-semibold font-sans">
                <p>
                  人工智能算法训练平台（智能物联网虚拟教研大盘）是一套深度融合容器计算与微处理器仿真的多能级工程教学沙箱。 我们与相关科技集团建立高维战略同盟，打通 1+X 认证底层。
                </p>
                <p>
                  我们坚信，未来的物联网开发不唯纸上、不唯实体。采用高性价比、无损损耗、全时在线的云仿真实验室，能为千百所大专本科院校学生缩减 80% 的实训设备折旧开支，使每一位同学都能自主享有一台秒级回档的微型物理物联网核心套件。
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
