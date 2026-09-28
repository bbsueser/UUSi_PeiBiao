/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { UserSession } from "../types";
import { 
  Terminal, 
  Cpu, 
  Play, 
  Power, 
  RefreshCw, 
  Monitor, 
  ChevronRight,
  ChevronLeft,
  Search,
  Activity,
  Info,
  SlidersHorizontal,
  BookOpen,
  Clock,
  Eye,
  CheckCircle,
  X,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Award,
  BookMarked
} from "lucide-react";
import ExperimentEnvironmentClient from "./ExperimentEnvironmentClient";
import IndustryCloudConsole from "./IndustryCloudConsole";
import { ThreeDDesigner } from "./ThreeDDesigner";
import { TwoDDesigner } from "./TwoDDesigner";
import { ThreeDEngineeringSimulation } from "./ThreeDEngineeringSimulation";
import BlockchainIDEClient from "./BlockchainIDEClient";
import { ExperimentEnvironment, experimentEnvironments } from "../data/environments";

// Deterministic mock course details helper
const getCourseDetails = (courseName: string, index: number, envType: string) => {
  const types = ["岗位课程", "专业技术技能", "课程实训", "综合项目"];
  const type = types[index % types.length];
  
  // Deterministic but realistic mock outputs
  const matchPercent = 95 + ((index * 2 + courseName.length) % 5); // 95% to 99%
  const enrolledCount = 180 + ((index * 53 + courseName.length * 7) % 320); // realistic student counts
  const hours = 24 + ((index * 8 + courseName.length * 4) % 40); // 24, 32, 40, 48
  
  const levels = ["初级", "中级", "高级"];
  const level = levels[(index + courseName.length) % levels.length];
  
  return {
    name: courseName,
    type: type,
    matchDegree: `${matchPercent}%`,
    enrolledCount: `${enrolledCount}人`,
    suggestedHours: `${hours}学时`,
    difficulty: level
  };
};

interface LabHallProps {
  session: UserSession;
}

// Highly stylized decorative SVG cards representing real interface mockups
function LabCoverPlaceholder({ avatarLogo, name }: { avatarLogo: string; name: string }) {
  let illustration = null;

  if (avatarLogo === "blockchain-sim") {
    // 区块链基础仿真平台: 深蓝科技背景
    return (
      <div id={`u-lab-cover-${avatarLogo}`} className="w-full h-[140px] bg-gradient-to-br from-[#0B1120] to-[#0f172a] rounded-t-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a_1px,transparent_1px)] bg-[size:16px_16px] opacity-30" />
        <div className="absolute top-2 right-2 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="relative z-10 scale-95 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center w-full h-full">
          <svg className="w-full h-full text-blue-500" viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            {/* Hexagons */}
            <polygon points="50,15 65,22.5 65,37.5 50,45 35,37.5 35,22.5" fill="rgba(37,99,235,0.2)" stroke="rgba(59,130,246,0.8)" strokeWidth="1.5" />
            <polygon points="25,5 40,12.5 40,27.5 25,35 10,27.5 10,12.5" className="opacity-50" />
            <polygon points="75,5 90,12.5 90,27.5 75,35 60,27.5 60,12.5" className="opacity-50" />
            
            {/* Connections */}
            <line x1="40" y1="20" x2="45" y2="25" stroke="rgba(59,130,246,0.6)" />
            <line x1="60" y1="20" x2="55" y2="25" stroke="rgba(59,130,246,0.6)" />
            <line x1="35" y1="37.5" x2="25" y2="45" stroke="rgba(59,130,246,0.4)" strokeDasharray="2,2" />
            <line x1="65" y1="37.5" x2="75" y2="45" stroke="rgba(59,130,246,0.4)" strokeDasharray="2,2" />
            
            <circle cx="50" cy="30" r="3" fill="#60a5fa" stroke="none" />
          </svg>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0" />
      </div>
    );
  }

  if (avatarLogo === "simulation") {
    // 1. 工程虚拟仿真: 网格画布和设备节点
    illustration = (
      <svg className="w-16 h-16 text-[#10A66A]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="56" height="56" rx="8" className="stroke-[#10A66A]/20" strokeWidth="1" />
        <path d="M4 16h56 M16 4v56 M32 4v56 M48 4v56 M4 32h56 M4 48h56" className="stroke-[#10A66A]/10" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="20" cy="24" r="6" fill="#EAF8F1" stroke="#10A66A" strokeWidth="2" />
        <circle cx="44" cy="40" r="6" fill="#EAF8F1" stroke="#10A66A" strokeWidth="2" />
        <path d="M26 24h12v10" stroke="#10A66A" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M38 34l3 3-3 3" stroke="#10A66A" strokeWidth="2" />
        <rect x="34" y="21" width="8" height="6" rx="1" fill="#10A66A" />
      </svg>
    );
  } else if (avatarLogo === "3d") {
    // 2. 3D应用设计器: 三维场景或模型界面
    illustration = (
      <svg className="w-16 h-16 text-[#10A66A]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 6 L56 18 L56 46 L32 58 L8 46 L8 18 Z" className="stroke-[#10A66A]/30" strokeWidth="1" />
        <path d="M32 6 V58 M8 18 L32 32 L56 18" stroke="#10A66A" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="5" fill="#10A66A" />
        <path d="M32 32l16-8 M32 32L16 24 M32 32v18" stroke="#10A66A" strokeWidth="2" />
        <path d="M41 16l4 2-4 2" stroke="#10A66A" strokeWidth="1" />
      </svg>
    );
  } else if (avatarLogo === "cloud") {
    // 3. 行业云: 云平台数据看板
    illustration = (
      <svg className="w-16 h-16 text-[#10A66A]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 38 C14 38 12 35 12 30 C12 25 16 22 22 22 C24 16 30 14 36 16 C42 18 46 22 46 28 C50 28 52 31 52 35 C52 39 49 42 44 42 H22" fill="#EAF8F1" stroke="#10A66A" strokeWidth="2" />
        <line x1="20" y1="48" x2="44" y2="48" stroke="#10A66A" strokeWidth="1.5" />
        <line x1="24" y1="53" x2="40" y2="53" stroke="#10A66A" strokeWidth="1" />
        <line x1="32" y1="42" x2="32" y2="48" stroke="#10A66A" strokeWidth="2" />
        <circle cx="32" cy="27" r="3" fill="#10A66A" />
      </svg>
    );
  } else if (avatarLogo === "renode") {
    // 4. Renode: 终端窗口或嵌入式仿真界面
    illustration = (
      <svg className="w-16 h-16 text-[#10A66A]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="10" width="52" height="44" rx="4" fill="#EAF8F1" stroke="#10A66A" />
        <path d="M6 22h52" stroke="#10A66A" strokeWidth="1.5" />
        <circle cx="12" cy="16" r="2" fill="#10A66A" />
        <circle cx="18" cy="16" r="2" fill="#10A66A" />
        <path d="M12 32l5 5-5 5" stroke="#10A66A" strokeWidth="2" />
        <line x1="20" y1="42" x2="34" y2="42" stroke="#10A66A" strokeWidth="2.5" />
      </svg>
    );
  } else if (avatarLogo === "tb") {
    // 5. ThingsBoard: 物联网看板
    illustration = (
      <svg className="w-16 h-16 text-[#10A66A]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="8" width="52" height="48" rx="6" className="stroke-[#10A66A]/20" strokeWidth="1" />
        <rect x="10" y="12" width="20" height="16" rx="2" fill="#EAF8F1" stroke="#10A66A" strokeWidth="1.5" />
        <rect x="34" y="12" width="20" height="26" rx="2" className="stroke-[#10A66A]/50" strokeWidth="1" />
        <rect x="10" y="32" width="20" height="20" rx="2" className="stroke-[#10A66A]/50" strokeWidth="1" />
        <circle cx="44" cy="25" r="4" fill="#10A66A" />
        <line x1="38" y1="30" x2="50" y2="30" stroke="#10A66A" strokeWidth="1.5" />
        <path d="M14 24h12l-6-8z" fill="#10A66A" stroke="#10A66A" strokeWidth="1" />
      </svg>
    );
  } else if (avatarLogo === "2d") {
    // 6. 2D应用设计器
    illustration = (
      <svg className="w-16 h-16 text-[#10A66A]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="10" width="48" height="44" rx="4" className="stroke-[#10A66A]/20" strokeWidth="1" />
        <path d="M14 18h36v20H14z" fill="#EAF8F1" stroke="#10A66A" strokeWidth="2" />
        <circle cx="32" cy="28" r="4" stroke="#10A66A" strokeWidth="1.5" />
        <line x1="18" y1="45" x2="46" y2="45" stroke="#10A66A" strokeWidth="2" />
        <circle cx="20" cy="45" r="2.5" fill="#10A66A" stroke="none" />
        <circle cx="44" cy="45" r="2.5" fill="#10A66A" stroke="none" />
      </svg>
    );
  } else if (avatarLogo === "labeling") {
    // 7. 数据标注
    illustration = (
      <svg className="w-16 h-16 text-[#10A66A]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="12" y="12" width="40" height="40" rx="4" className="stroke-[#10A66A]/20" strokeWidth="1" />
        <rect x="18" y="18" width="28" height="28" rx="2" fill="#EAF8F1" stroke="#10A66A" strokeWidth="2" />
        <circle cx="18" cy="18" r="3" fill="#10A66A" />
        <circle cx="46" cy="18" r="3" fill="#10A66A" />
        <circle cx="46" cy="46" r="3" fill="#10A66A" />
        <circle cx="18" cy="46" r="3" fill="#10A66A" />
        <path d="M26 32h12 M32 26v12" stroke="#10A66A" strokeWidth="2" />
      </svg>
    );
  } else if (avatarLogo === "vscode") {
    // 8. VSCode: 代码编辑器界面
    illustration = (
      <svg className="w-16 h-16 text-[#10A66A]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="8" width="52" height="48" rx="4" fill="#EAF8F1" stroke="#10A66A" />
        <path d="M18 8v48 M6 18h52" stroke="#10A66A" strokeWidth="1" />
        <path d="M26 28l4 4-4 4 m10-4h-4 m6 6h-6" stroke="#10A66A" strokeWidth="2" />
        <line x1="12" y1="24" x2="12" y2="40" stroke="#10A66A" strokeWidth="1.5" />
      </svg>
    );
  } else if (avatarLogo === "jupyter") {
    // 9. Jupyter: Notebook 页面
    illustration = (
      <svg className="w-16 h-16 text-[#10A66A]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="6" width="48" height="52" rx="4" className="stroke-[#10A66A]/20" strokeWidth="1" />
        <circle cx="32" cy="32" r="16" fill="#EAF8F1" stroke="#10A66A" strokeWidth="2" />
        <circle cx="32" cy="12" r="4" fill="#10A66A" />
        <circle cx="32" cy="52" r="4" fill="#10A66A" />
        <path d="M24 32h16" stroke="#10A66A" strokeWidth="3" />
      </svg>
    );
  } else if (avatarLogo === "linux") {
    // 10. Linux: 终端命令行界面
    illustration = (
      <svg className="w-16 h-16 text-[#10A66A]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="10" width="52" height="44" rx="6" fill="#18181b" stroke="#10A66A" strokeWidth="2" />
        <path d="M12 24l5 4-5 4" stroke="#10A66A" strokeWidth="2" />
        <line x1="20" y1="32" x2="32" y2="32" stroke="#10A66A" strokeWidth="2.5" />
        <text x="36" y="34" className="fill-[#10A66A] font-mono font-bold text-[8px]" stroke="none">SYS</text>
      </svg>
    );
  } else if (avatarLogo === "mysql") {
    // 11. MySQL: 数据库终端或数据表
    illustration = (
      <svg className="w-16 h-16 text-[#10A66A]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="56" height="56" rx="8" className="stroke-[#10A66A]/20" strokeWidth="1" />
        <ellipse cx="32" cy="16" rx="16" ry="6" fill="#EAF8F1" stroke="#10A66A" strokeWidth="2" />
        <path d="M16 16v12c0 3.3 7 6 16 6s16-2.7 16-6V16" stroke="#10A66A" strokeWidth="2" />
        <path d="M16 28v12c0 3.3 7 6 16 6s16-2.7 16-6V28" stroke="#10A66A" strokeWidth="2" />
      </svg>
    );
  } else if (avatarLogo === "scratch") {
    // 12. 图形化编程: 积木编程界面
    illustration = (
      <svg className="w-16 h-16 text-[#10A66A]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 20 h12 c1 0 2 1 2 2 v2 c0 1 1 2 2 2 h8 c1 0 2-1 2-2 v-2 c0-1 1-2 2-2 h16 a4 4 0 0 1 4 4 v16 a4 4 0 0 1-4 4 H10 a4 4 0 0 1-4-4 V24 a4 4 0 0 1 4-4 Z" fill="#EAF8F1" stroke="#10A66A" strokeWidth="2" />
        <circle cx="16" cy="32" r="3" fill="#10A66A" />
        <line x1="24" y1="32" x2="48" y2="32" stroke="#10A66A" strokeWidth="2.5" />
      </svg>
    );
  } else {
    // 13-16. 组合型、区块链等默认
    illustration = (
      <svg className="w-16 h-16 text-[#10A66A]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="8" width="48" height="48" rx="8" className="stroke-[#10A66A]/30" strokeWidth="1" />
        <circle cx="24" cy="24" r="8" fill="#EAF8F1" stroke="#10A66A" strokeWidth="2" />
        <circle cx="40" cy="40" r="8" fill="#EAF8F1" stroke="#10A66A" strokeWidth="2" />
        <line x1="32" y1="24" x2="32" y2="40" stroke="#10A66A" strokeWidth="1.5" />
        <line x1="24" y1="32" x2="40" y2="32" stroke="#10A66A" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <div id={`u-lab-cover-${avatarLogo}`} className="w-full h-[140px] bg-gradient-to-br from-white to-zinc-50 border-b border-zinc-150 rounded-t-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Mesh Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#eefcf4_1px,transparent_1px),linear-gradient(to_bottom,#eefcf4_1px,transparent_1px)] bg-[size:12px_12px] opacity-60" />
      
      {/* Decorative colored glow */}
      <div className="absolute top-2 left-2 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl" />
      <div className="absolute bottom-2 right-2 w-16 h-16 bg-[#10A66A]/5 rounded-full blur-xl" />
      
      {/* Illustration Center */}
      <div className="relative z-10 scale-95 transition-transform duration-300 group-hover:scale-105">
        {illustration}
      </div>

      {/* Decorative accent lines at the bottom */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-[#10A66A]/0 via-[#10A66A]/30 to-[#10A66A]/0" />
    </div>
  );
}

export default function LabHall({ session }: LabHallProps) {
  // Navigation states
  const [currentPage, setCurrentPage] = useState<"experimentHall" | "environmentClient" | "industryCloudConsole" | "threeDDesigner" | "twoDDesigner" | "ideClient" | "threeDEngineering">("experimentHall");
  const [threeDDesignerInitialView, setThreeDDesignerInitialView] = useState<"appList" | "editor">("appList");
  const [twoDDesignerInitialView, setTwoDDesignerInitialView] = useState<"appList" | "editor">("appList");
  const [selectedEnvironment, setSelectedEnvironment] = useState<any | null>(null);

  // Selected for sidebar Details Drawer
  const [activeDetailsLab, setActiveDetailsLab] = useState<ExperimentEnvironment | null>(null);
  const [coursesListCollapsed, setCoursesListCollapsed] = useState<boolean>(false);

  // Search & Filter system states (Optimized matching the requirements!)
  const [filterCategory, setFilterCategory] = useState<string>("全部");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("全部");
  const [filterSubCategory, setFilterSubCategory] = useState<string>("全部");
  
  // Sorting state: 默认排序｜最多课程｜最多浏览｜使用最多
  const [activeSort, setActiveSort] = useState<string>("默认排序");

  const [searchQuery, setSearchQuery] = useState<string>(""); 
  const [tempSearchQuery, setTempSearchQuery] = useState<string>("");

  // Local boot status trackers
  const [bootStates, setBootStates] = useState<Record<string, { status: "未启动" | "启动中" | "运行中"; progress: number; outputLog: string[] }>>({});

  // Toast notifications
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Static filters mapping
  const categories = ["全部", "平台型", "组合型", "容器型", "虚拟系统"];
  const specialties = ["全部", "物联网", "人工智能", "工业互联网", "大数据", "区块链", "软件开发", "网络安全"];
  const subCategories = ["全部", "岗位课程", "专业技术技能", "课程实训", "综合项目"];
  const sortOptions = ["默认排序", "最多课程", "最多浏览", "使用最多"];

  // Filter handlers
  const handleQuery = () => {
    setSearchQuery(tempSearchQuery);
    showToast("筛选结果已更新");
  };

  const handleReset = () => {
    setTempSearchQuery("");
    setSearchQuery("");
    setFilterCategory("全部");
    setFilterSpecialty("全部");
    setFilterSubCategory("全部");
    setActiveSort("默认排序");
    showToast("所有筛选已重置");
  };

  // Filtering + Sorting computations (Memoized)
  const filteredAndSortedLabs = useMemo(() => {
    // 1. Filtering Phase
    let result = experimentEnvironments.filter(lab => {
      // Category Filter (including special Virtual System match)
      if (filterCategory !== "全部") {
        if (filterCategory === "虚拟系统") {
          if (!lab.isVirtualSystem) return false;
        } else {
          if (lab.type !== filterCategory) return false;
        }
      }

      // Specialty Filter
      if (filterSpecialty !== "全部") {
        if (!lab.specialties.includes(filterSpecialty)) return false;
      }

      // SubCategory Filter
      if (filterSubCategory !== "全部") {
        if (lab.subCategory !== filterSubCategory) return false;
      }

      // Search Query Filter (Matches Name, description, or specialties)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = lab.name.toLowerCase().includes(query);
        const matchDesc = lab.desc.toLowerCase().includes(query);
        const matchSpec = lab.specialties.some(s => s.toLowerCase().includes(query));
        const matchCourse = lab.courseList.some(c => c.toLowerCase().includes(query));
        if (!matchName && !matchDesc && !matchSpec && !matchCourse) return false;
      }

      return true;
    });

    // 2. Sorting Phase
    if (activeSort === "最多课程") {
      result = [...result].sort((a, b) => b.coursesCount - a.coursesCount);
    } else if (activeSort === "最多浏览") {
      result = [...result].sort((a, b) => b.viewsCount - a.viewsCount);
    } else if (activeSort === "使用最多") {
      result = [...result].sort((a, b) => b.durationMinutes - a.durationMinutes);
    }

    return result;
  }, [filterCategory, filterSpecialty, filterSubCategory, searchQuery, activeSort]);

  // Handle client loader / preview detail trigger
  const handleExperience = (lab: ExperimentEnvironment) => {
    setActiveDetailsLab(lab);
    setCoursesListCollapsed(false);
    showToast(`查阅 ${lab.name} 详情`);
  };

  // Launch simulated environments boot logs sequence
  const startSimulatedEnvironment = (id: string, name: string) => {
    setBootStates(prev => ({
      ...prev,
      [id]: {
        status: "启动中",
        progress: 10,
        outputLog: [`[SYSTEM] 正在请求分配物理节点资源...`, `[DOCKER] 初始化 ${id} 虚拟机沙盘上下文镜像...`]
      }
    }));

    const stages = [
      { p: 25, log: `[SYSTEM] 沙盒内核挂载完成，正在配置轻量级端口转发...` },
      { p: 50, log: `[NETWORK] 绑定本地服务端口，打通边缘总线连接...` },
      { p: 75, log: `[DOCKER] 正在挂接物联网组件、测试脚本底座...` },
      { p: 100, log: `[OK] 实验软件模块服务启动完毕！您可以进入交互控制台。` }
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        const target = stages[currentStage];
        setBootStates(prev => {
          const current = prev[id] || { status: "启动中", progress: 0, outputLog: [] };
          return {
            ...prev,
            [id]: {
              status: target.p === 100 ? "运行中" : "启动中",
              progress: target.p,
              outputLog: [...current.outputLog, target.log]
            }
          };
        });
        currentStage++;
      } else {
        clearInterval(interval);
        showToast(`${name} 容器环境已成功部署并开始运行。`);
      }
    }, 400);
  };

  // Turn off / Reset simulating environment
  const resetSimulatedEnvironment = (id: string) => {
    setBootStates(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    showToast("容器节点已释放，状态已重置。");
  };

  // Handle Launching standard engineering simulator client
  const launchEngineeringSimulator = (lab: ExperimentEnvironment) => {
    setSelectedEnvironment(lab);
    setCurrentPage("environmentClient");
    showToast(`正在装载工程虚拟仿真实验画布...`);
  };

  // Fixed specific metrics for UI
  const totalCount = 16;
  const platformTypeCount = 6;
  const compositeTypeCount = 5;
  const containerTypeCount = 5;
  const totalMatchedCoursesSum = 48;

  return (
    <div id="u-lab-hall-root" className={`bg-[#F8FAF9] min-h-screen text-zinc-800 font-sans antialiased ${currentPage === "experimentHall" ? "pb-24" : ""}`}>
      
      {/* Dynamic Toast System */}
      {toast && (
        <div id="u-lab-toast" className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#10A66A] text-white text-xs font-semibold px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-in slide-in-from-top-3 duration-300">
          <CheckCircle className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {currentPage === "experimentHall" ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          
          {activeDetailsLab ? (
            /* --- 实验环境详情页面 (Details Subpage View) --- */
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* 页面顶部：实验环境名称和类型标签 */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setActiveDetailsLab(null);
                        showToast("返回实验大厅");
                      }}
                      className="group flex items-center gap-1.5 text-zinc-400 hover:text-[#10A66A] text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                      <span>返回实验大厅</span>
                    </button>
                    
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <span className="text-xs bg-[#EAF8F1] text-[#10A66A] border border-[#CFEFE0] px-3 py-1 rounded-md font-bold uppercase tracking-wider">
                        {activeDetailsLab.type}
                      </span>
                      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                        {activeDetailsLab.name}
                      </h1>
                    </div>
                  </div>
                  
                  {/* 使用状态 */}
                  <div className="flex items-center gap-3">
                    {activeDetailsLab.id === "engineering-simulation" ? (
                      <span className="bg-emerald-50 text-[#10A66A] border border-[#CFEFE0] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10A66A] animate-pulse" />
                        <span>智能沙盒 ｜ 直连使用</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl text-xs font-bold text-zinc-650">
                        <span className="text-zinc-400">使用状态:</span>
                        <span className={`${bootStates[activeDetailsLab.id]?.status === "运行中" ? "text-[#10A66A]" : "text-zinc-500"} flex items-center gap-1.5`}>
                          <div className={`w-2 h-2 rounded-full ${bootStates[activeDetailsLab.id]?.status === "运行中" ? "bg-[#10A66A]" : bootStates[activeDetailsLab.id]?.status === "启动中" ? "bg-amber-400 animate-spin" : "bg-zinc-300"}`} />
                          <span>{bootStates[activeDetailsLab.id]?.status || "未启动"}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 页面主体：左侧信息 + 右侧统计与操作 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* 页面主体左侧显示环境信息 */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* 1. 实验环境描述 */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-zinc-150">
                      <div className="w-1.5 h-4 bg-[#10A66A] rounded-full" />
                      <h3 className="text-sm font-bold text-zinc-800">实验环境描述</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-xs text-zinc-600 leading-relaxed font-medium bg-[#F8FAF9] p-4 rounded-xl border border-emerald-50 text-justify">
                        {activeDetailsLab.desc}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="p-4 bg-zinc-50/60 border border-zinc-200 rounded-xl space-y-2">
                          <span className="text-[10px] text-zinc-400 font-bold block bg-white border border-zinc-150 w-fit px-2.5 py-0.5 rounded-md">
                            关联专业方向
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {activeDetailsLab.specialties.map(spec => (
                              <span key={spec} className="bg-emerald-50 text-[#10A66A] border border-[#CFEFE0] px-2.5 py-1 rounded text-[10px] font-bold">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-zinc-50/60 border border-zinc-200 rounded-xl space-y-2">
                          <span className="text-[10px] text-zinc-400 font-bold block bg-white border border-zinc-150 w-fit px-2.5 py-0.5 rounded-md">
                            课程实训定位
                          </span>
                          <span className="text-xs text-zinc-700 font-bold block pt-1.5 pl-0.5">
                            {activeDetailsLab.subCategory} 环境模块
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. 关联课程列表 */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-150">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-[#10A66A] rounded-full" />
                        <h3 className="text-sm font-bold text-zinc-800">关联课程列表</h3>
                      </div>
                      <span className="text-[10px] text-[#10A66A] font-bold bg-[#EAF8F1] px-2 py-0.5 rounded-md">
                        已匹配 {activeDetailsLab.courseList.length} 门课程体系
                      </span>
                    </div>
                    
                    {activeDetailsLab.courseList.length === 0 ? (
                      <div className="bg-zinc-50 border border-[#E4E4E5] rounded-xl p-12 text-center space-y-2 text-zinc-400 font-medium">
                        <BookOpen className="w-8 h-8 mx-auto text-zinc-350" />
                        <div className="text-xs">该实验环境暂未关联具体的课程体系</div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-zinc-650 border-collapse min-w-[600px]">
                          <thead>
                            <tr className="border-b border-zinc-150 text-zinc-400 font-bold bg-[#F8FAF9]/60">
                              <th className="p-3 font-bold pb-2.5">课程名称</th>
                              <th className="p-3 font-bold pb-2.5 text-center">课程类型</th>
                              <th className="p-3 font-bold pb-2.5 text-center">匹配度</th>
                              <th className="p-3 font-bold pb-2.5 text-center">已修人数</th>
                              <th className="p-3 font-bold pb-2.5 text-center">建议学时</th>
                              <th className="p-3 font-bold pb-2.5 text-center">难度等级</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {activeDetailsLab.courseList.map((course, idx) => {
                              const details = getCourseDetails(course, idx, activeDetailsLab.type);
                              return (
                                <tr key={idx} className="hover:bg-[#F8FAF9]/40 transition-colors">
                                  <td className="p-3 font-bold text-zinc-800 flex items-center gap-2.5">
                                    <span className="w-5 h-5 bg-[#EAF8F1] text-[#10A66A] text-[10px] rounded-md flex items-center justify-center font-bold shrink-0">
                                      {idx + 1}
                                    </span>
                                    <span className="truncate max-w-[200px]" title={course}>{course}</span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="bg-zinc-50 text-zinc-600 border border-zinc-200 px-2.5 py-0.5 rounded text-[10px] font-medium">
                                      {details.type}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center text-[#10A66A] font-extrabold text-xs">
                                    {details.matchDegree}
                                  </td>
                                  <td className="p-3 text-center text-zinc-500 font-medium">
                                    {details.enrolledCount}
                                  </td>
                                  <td className="p-3 text-center text-emerald-800 font-bold">
                                    {details.suggestedHours}
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                                      details.difficulty === "高级" 
                                        ? "bg-rose-50 text-rose-600 border-rose-150" 
                                        : details.difficulty === "中级" 
                                        ? "bg-amber-50 text-amber-600 border-amber-150" 
                                        : "bg-emerald-50 text-[#10A66A] border-[#CFEFE0]"
                                    }`}>
                                      {details.difficulty}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>

                {/* 页面主体右侧显示环境使用统计数据 */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* 运行与统计数据 */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-zinc-150">
                      <div className="w-1.5 h-4 bg-[#10A66A] rounded-full" />
                      <h3 className="text-sm font-bold text-zinc-800">使用统计与数据</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* 累计使用时长 */}
                      <div className="p-4 bg-gradient-to-br from-[#10A66A]/5 to-[#10A66A]/0 border border-[#CFEFE0]/50 rounded-2xl space-y-1 relative overflow-hidden group">
                        <div className="absolute top-3.5 right-4 opacity-10 group-hover:opacity-25 transition-opacity">
                          <Clock className="w-10 h-10 text-[#10A66A]" />
                        </div>
                        <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase block">累计使用时长</span>
                        <div className="flex items-baseline gap-1.5 pt-1">
                          <span className="text-2xl font-black text-[#10A66A] tracking-tight">
                            {activeDetailsLab.durationStr.split(" ")[0]}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400">
                            {activeDetailsLab.durationStr.split(" ")[1] || "分钟"}
                          </span>
                        </div>
                        <div className="text-[9px] text-[#10A66A] font-semibold pt-1 bg-white/50 w-fit px-1.5 py-0.5 rounded border border-[#CFEFE0]/30 mt-2">
                          高频实训课推荐环境
                        </div>
                      </div>

                      {/* 累计访问量 */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1 relative overflow-hidden group">
                        <div className="absolute top-3.5 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Eye className="w-10 h-10 text-zinc-650" />
                        </div>
                        <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase block">累计访问量</span>
                        <div className="flex items-baseline gap-1.5 pt-1">
                          <span className="text-2xl font-black text-zinc-800 tracking-tight">
                            {activeDetailsLab.viewsCount}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400">次访问</span>
                        </div>
                        <div className="text-[9px] text-zinc-400 font-medium pt-1 mt-2">
                          物联网基地高权威授权认证
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 资源控制与功能启动台 */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-zinc-150">
                      <div className="w-1.5 h-4 bg-[#10A66A] rounded-full" />
                      <h3 className="text-sm font-bold text-zinc-800">实验装载面板</h3>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs text-zinc-500 leading-relaxed font-semibold bg-[#F8FAF9] p-3 rounded-lg border border-zinc-150 text-justify">
                        该环境已打包并挂载云原生算力镜像，你可以随时在云沙箱中唤醒并在命令行中执行开发连线。
                      </p>

                      <div className="pt-1 select-none">
                        {activeDetailsLab.id === "engineering-simulation" ? (
                          <button
                            onClick={() => launchEngineeringSimulator(activeDetailsLab)}
                            className="w-full py-3 bg-[#10A66A] hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <PlayCircle className="w-4.5 h-4.5" />
                            <span>开启工程虚拟仿真实验</span>
                          </button>
                        ) : activeDetailsLab.id === "industry-cloud" ? (
                          <button
                            onClick={() => {
                               setSelectedEnvironment(activeDetailsLab);
                               setCurrentPage("industryCloudConsole");
                            }}
                            className="w-full py-3 bg-[#10A66A] hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Terminal className="w-4.5 h-4.5" />
                            <span>进入平台控制台</span>
                          </button>
                        ) : (
                          <div className="space-y-3">
                            {bootStates[activeDetailsLab.id]?.status === "运行中" ? (
                              <div className="space-y-3">
                                 <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2 text-[#07875A] font-bold text-[10px] leading-relaxed">
                                    <div className="w-2 h-2 rounded-full bg-[#10A66A] shrink-0 animate-pulse" />
                                    <span>云服务器节点挂载成功：IP地址已绑定</span>
                                 </div>
                                 <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                         if (activeDetailsLab.id === "3d-designer") {
                                            setSelectedEnvironment(activeDetailsLab);
                                            setCurrentPage("threeDEngineering");
                                         } else if (activeDetailsLab.id === "2d-designer") {
                                            setSelectedEnvironment(activeDetailsLab);
                                            setTwoDDesignerInitialView("appList");
                                            setCurrentPage("twoDDesigner");
                                         } else if (activeDetailsLab.id === "renode" || activeDetailsLab.id === "engineering-simulation" || activeDetailsLab.id === "jupyter") {
                                            setSelectedEnvironment(activeDetailsLab);
                                            setCurrentPage("environmentClient");
                                         } else if (activeDetailsLab.id === "blockchain-env") {
                                            setSelectedEnvironment(activeDetailsLab);
                                            setCurrentPage("ideClient");
                                         } else {
                                            showToast(`已成功打开交互控制台。正在连通 ${activeDetailsLab.name} 底座...`);
                                         }
                                      }}
                                      className="flex-1 py-3 bg-[#10A66A] hover:bg-[#07875A] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                    >
                                       <Terminal className="w-4 h-4" />
                                       <span>进入控制台</span>
                                    </button>
                                    <button
                                      onClick={() => resetSimulatedEnvironment(activeDetailsLab.id)}
                                      className="py-3 bg-rose-50 text-rose-500 hover:bg-rose-100 px-4 font-bold text-xs rounded-xl transition-all flex items-center justify-center cursor-pointer border border-rose-155"
                                      title="关停资源，重置状态"
                                    >
                                       <Power className="w-4.5 h-4.5" />
                                    </button>
                                 </div>
                              </div>
                            ) : bootStates[activeDetailsLab.id]?.status === "启动中" ? (
                              <div className="space-y-3">
                                 <div className="bg-zinc-900 text-zinc-350 font-mono text-[9px] p-3 rounded-lg space-y-1 h-[85px] overflow-y-auto border border-zinc-800">
                                    {bootStates[activeDetailsLab.id]?.outputLog.map((logStr, lIdx) => (
                                       <div key={lIdx} className="truncate select-text">
                                          <span className="text-[#10A66A] mr-1.5">{">"}</span>{logStr}
                                       </div>
                                    ))}
                                 </div>
                                 <div className="w-full bg-zinc-100 rounded-full h-1 overflow-hidden">
                                    <div className="bg-[#10A66A] h-full transition-all duration-300" style={{ width: `${bootStates[activeDetailsLab.id]?.progress}%` }} />
                                 </div>
                                 <button
                                   disabled
                                   className="w-full py-3 bg-zinc-50 text-zinc-400 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-2 border border-zinc-200"
                                 >
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                                    <span>底层算力初始载入中 ({bootStates[activeDetailsLab.id]?.progress}%)</span>
                                 </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startSimulatedEnvironment(activeDetailsLab.id, activeDetailsLab.name)}
                                className="w-full py-3 bg-[#10A66A] hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Play className="w-4.5 h-4.5" />
                                <span>激活并一键启动环境</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          ) : (
            <>
              {/* Section One: Title and Stats Row */}
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-2 border-b border-zinc-150 text-zinc-700">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                {/* Clean decorative icon badge */}
                <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-150">
                  <Cpu className="w-5 h-5 text-[#10A66A]" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">实验大厅</h1>
              </div>
              <p className="text-sm text-zinc-500 font-medium">
                多类型实验环境支撑课程实训、项目实践、虚拟仿真和在线开发。
              </p>
            </div>

            {/* Title statistics widget under requirement */}
            <div className="bg-white border border-zinc-200 py-3.5 px-5 rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.01)] flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-500 font-medium shrink-0">
              <div className="flex items-center gap-1.5 border-r border-zinc-150 pr-5">
                <span className="text-zinc-400">实验环境总数:</span>
                <span className="text-sm font-bold text-[#10A66A]">{totalCount} 个</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-zinc-150 pr-5">
                <span className="text-zinc-400">平台型:</span>
                <span className="text-sm font-bold text-emerald-700">{platformTypeCount} 个</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-zinc-150 pr-5">
                <span className="text-zinc-400">组合型:</span>
                <span className="text-sm font-bold text-emerald-700">{compositeTypeCount} 个</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-zinc-150 pr-5">
                <span className="text-zinc-400">容器型:</span>
                <span className="text-sm font-bold text-emerald-700">{containerTypeCount} 个</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400">匹配课程:</span>
                <span className="text-sm font-bold text-[#10A66A]">{totalMatchedCoursesSum} 门</span>
              </div>
            </div>
          </div>

          {/* Section Two: Filters and Search Board */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-xs text-zinc-700">
            
            {/* Structured Multi Filter Selectors Layout */}
            <div className="space-y-3.5">
              {/* Type Category Selection */}
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <span className="text-zinc-400 w-24 shrink-0 font-bold tracking-wider">分类 :</span>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-md border text-xs cursor-pointer transition-all font-medium ${
                        filterCategory === cat 
                          ? "bg-[#EAF8F1] border-[#CFEFE0] text-[#10A66A] font-semibold" 
                          : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-350"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialty Directions Filtering */}
              <div className="flex flex-col md:flex-row md:items-start md:pt-1.5 gap-3">
                <span className="text-zinc-400 w-24 shrink-0 font-bold tracking-wider mt-1.5">专业 :</span>
                <div className="flex flex-wrap gap-1.5">
                  {specialties.map(spec => (
                    <button
                      key={spec}
                      onClick={() => setFilterSpecialty(spec)}
                      className={`px-3.5 py-1.5 rounded-md border text-xs cursor-pointer transition-all font-medium ${
                        filterSpecialty === spec 
                          ? "bg-[#EAF8F1] border-[#CFEFE0] text-[#10A66A] font-semibold" 
                          : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-350"
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub Categories Filter */}
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <span className="text-zinc-400 w-24 shrink-0 font-bold tracking-wider">子类 :</span>
                <div className="flex flex-wrap gap-1.5">
                  {subCategories.map(sub => (
                    <button
                      key={sub}
                      onClick={() => setFilterSubCategory(sub)}
                      className={`px-3.5 py-1.5 rounded-md border text-xs cursor-pointer transition-all font-medium ${
                        filterSubCategory === sub 
                          ? "bg-[#EAF8F1] border-[#CFEFE0] text-[#10A66A] font-semibold" 
                          : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-350"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Keyword Search & Reset Bar */}
            <div className="pt-3.5 border-t border-zinc-150 flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <input 
                  type="text" 
                  placeholder="请输入关键字进行搜索"
                  value={tempSearchQuery}
                  onChange={(e) => setTempSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-700 font-medium outline-none focus:bg-white focus:border-[#10A66A] transition-all"
                />
                <div className="absolute left-3 top-2.5">
                  <Search className="w-4 h-4 text-zinc-400" />
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto self-end">
                <button 
                  onClick={handleQuery}
                  className="px-5 py-2.5 bg-[#10A66A] hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm w-1/2 md:w-24"
                >
                  <span>筛选</span>
                </button>
                <button 
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-xs rounded-lg transition-all flex items-center justify-center cursor-pointer w-1/2 md:w-24"
                >
                  <span>重置</span>
                </button>
              </div>
            </div>

          </div>

          {/* Section Three: Sorting Tab Bar & Environment Showcase Grid */}
          <div className="space-y-4">
            
            {/* Sorting Tab Bar (Green underlines / Green text based on requirement) */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2 bg-transparent text-xs">
              <div className="flex items-center gap-6">
                <span className="text-zinc-400 font-semibold tracking-wider">排序筛选:</span>
                <div className="flex items-center gap-5">
                  {sortOptions.map(option => {
                    const isActive = activeSort === option;
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          setActiveSort(option);
                          showToast(`排列规则已调整为：${option}`);
                        }}
                        className={`py-1 relative cursor-pointer font-bold transition-all ${
                          isActive 
                            ? "text-[#10A66A]" 
                            : "text-zinc-500 hover:text-[#10A66A]/80"
                        }`}
                      >
                        <span>{option}</span>
                        {isActive && (
                          <div className="absolute -bottom-[10px] left-0 right-0 h-0.5 bg-[#10A66A]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-zinc-400 font-medium">
                展示结果 <span className="text-zinc-700 font-bold">{filteredAndSortedLabs.length}</span> / {totalCount} 个环境
              </div>
            </div>

            {/* Split Grid for Drawer / List view */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left card grid */}
              <div className={`${activeDetailsLab ? "lg:col-span-8" : "lg:col-span-12"} space-y-6 transition-all duration-300`}>
                
                {filteredAndSortedLabs.length === 0 ? (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-16 text-center space-y-4">
                     <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-[#10A66A]">
                        <SlidersHorizontal className="w-6 h-6" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-zinc-800">暂无符合条件的实验环境</h4>
                        <p className="text-xs text-zinc-400">您可以尝试更换其他专业方向或清空查找条件。</p>
                     </div>
                     <button 
                       onClick={handleReset}
                       className="px-5 py-2 bg-[#10A66A] hover:bg-emerald-650 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                     >
                       清空筛选
                     </button>
                  </div>
                ) : (
                  <div className={`grid grid-cols-1 md:grid-cols-2 ${activeDetailsLab ? "xl:grid-cols-2" : "xl:grid-cols-4"} gap-6`}>
                    {filteredAndSortedLabs.map(lab => {
                      const isSelected = activeDetailsLab?.id === lab.id;
                      const bootState = bootStates[lab.id];
                      return (
                        <div
                          key={lab.id}
                          onClick={() => handleExperience(lab)}
                          className={`bg-white border rounded-2xl overflow-hidden transition-all flex flex-col group cursor-pointer relative shadow-[0_2px_6px_rgba(0,0,0,0.015)] h-[410px] ${
                            isSelected 
                              ? "border-[#10A66A] ring-2 ring-[#10A66A]/80 shadow-md" 
                              : "border-zinc-200 hover:border-[#10A66A] hover:shadow-md hover:scale-[1.005]"
                          }`}
                        >
                          {/* Image area with strict aspect ratio */}
                          <div className="relative h-[140px] shrink-0">
                            <LabCoverPlaceholder avatarLogo={lab.avatarLogo} name={lab.name} />
                            
                            {/* Type Label: light green background + dark green text */}
                            <div className="absolute top-3 right-3 bg-[#EAF8F1] text-[#10A66A] text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs border border-[#CFEFE0]">
                               {lab.type}
                            </div>

                            {/* Status bar overlays for booting */}
                            {bootState?.status === "运行中" && (
                              <div className="absolute inset-x-0 bottom-0 bg-[#10A66A]/90 text-white text-[9.5px] font-semibold text-center py-1 flex items-center justify-center gap-1">
                                 <RefreshCw className="w-3 h-3 animate-spin" />
                                 <span>实验虚拟机实例在线运行中</span>
                              </div>
                            )}

                            {bootState?.status === "启动中" && (
                              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4 space-y-2">
                                 <div className="w-full bg-zinc-100 rounded-full h-1 overflow-hidden">
                                    <div className="bg-[#10A66A] h-full transition-all" style={{ width: `${bootState.progress}%` }} />
                                  </div>
                                  <span className="text-[10px] text-[#10A66A] font-bold">环境部署中: {bootState.progress}%</span>
                              </div>
                            )}
                          </div>

                          {/* Middle/Details Textual Area */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                             {/* Name and description strictly limited to 2 lines */}
                             <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 justify-between">
                                   <h3 className="text-[14px] font-bold text-zinc-900 group-hover:text-[#10A66A] transition-colors truncate">{lab.name}</h3>
                                   <div className="flex items-center gap-1 text-[9.5px] font-semibold shrink-0 text-emerald-600 bg-[#EAF8F1] px-1.5 py-0.5 rounded">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#10A66A]" />
                                      <span>可用</span>
                                   </div>
                                </div>
                                <p className="text-[11px] text-zinc-400 font-medium leading-relaxed line-clamp-2 min-h-[34px]">
                                   {lab.desc}
                                </p>
                             </div>

                             {/* Bottom specialties/course pill labels */}
                             <div className="space-y-3 Pt-1 border-t border-zinc-100">
                                {/* Hot courses & Professional direction label matching */}
                                <div className="flex flex-wrap items-center gap-1 min-h-[22px]">
                                  {lab.courseList.length > 0 ? (
                                    <span className="bg-[#EAF8F1] text-[#10A66A] text-[9.5px] px-1.5 py-0.5 rounded font-semibold truncate max-w-full">
                                      推荐: {lab.courseList[0]}
                                    </span>
                                  ) : (
                                    <span className="bg-zinc-100 text-zinc-550 text-[9.5px] px-1.5 py-0.5 rounded font-semibold">
                                      {lab.specialties[0]} · 实训环境
                                    </span>
                                  )}
                                </div>

                                {/* Bottom Statistics with Icons */}
                                <div className="grid grid-cols-3 gap-1 pt-1.5 text-[9.5px] text-zinc-400 font-medium">
                                   <div className="flex items-center gap-1" title="匹配课程数">
                                      <BookOpen className="w-3.5 h-3.5 text-emerald-600/70" />
                                      <span className="truncate">{lab.coursesCount} 门课程</span>
                                   </div>
                                   <div className="flex items-center gap-1" title="累计使用时长">
                                      <Clock className="w-3.5 h-3.5 text-emerald-600/70" />
                                      <span className="truncate">{lab.durationStr}</span>
                                   </div>
                                   <div className="flex items-center gap-1" title="历史浏览人数">
                                      <Eye className="w-3.5 h-3.5 text-emerald-600/70" />
                                      <span className="truncate">{lab.viewsCount} 人</span>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* Footer with custom stylized "立即体验" button */}
                          <div className="px-4 pb-4">
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 if (lab.id === "blockchain-basic-simulation") {
                                   setSelectedEnvironment(lab);
                                   setCurrentPage("environmentClient");
                                 } else if (lab.id === "blockchain-env") {
                                   setSelectedEnvironment(lab);
                                   setCurrentPage("ideClient");
                                 } else {
                                   handleExperience(lab);
                                 }
                               }}
                               className="w-full text-center py-2 bg-white group-hover:bg-[#10A66A] group-hover:text-white text-[#10A66A] border border-[#CFEFE0] group-hover:border-[#10A66A] text-[11.5px] font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 shadow-2xs group-hover:shadow-[0_4px_10px_rgba(16,166,106,0.15)]"
                             >
                               <span>立即体验</span>
                               <ChevronRight className="w-4 h-4" />
                             </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Sidebar Detail Frame (Drawer in current page layout representation) */}
              {activeDetailsLab && (
                <div 
                  id="u-lab-details-sidebar" 
                  className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] space-y-5 sticky top-28 animate-in slide-in-from-right-4 duration-300"
                >
                  {/* Title and control area */}
                  <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-[#EAF8F1] text-[#10A66A] px-2 py-0.5 rounded font-semibold uppercase tracking-wider">{activeDetailsLab.type}</span>
                      <h2 className="text-base font-bold text-zinc-900 mt-1">{activeDetailsLab.name}</h2>
                    </div>
                    <button 
                      onClick={() => setActiveDetailsLab(null)}
                      className="p-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 rounded-full cursor-pointer transition-all"
                      title="关闭窗口"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Environment details metrics list */}
                  <div className="space-y-3.5 text-xs text-zinc-650">
                    
                    {/* Active dynamic state display */}
                    <div className="flex justify-between items-center py-2 border-b border-zinc-50">
                      <span className="text-zinc-400">使用状态</span>
                      {activeDetailsLab.id === "engineering-simulation" ? (
                        <span className="text-[#10A66A] font-semibold flex items-center gap-1.5">
                           <div className="w-2 h-2 rounded-full bg-[#10A66A] animate-pulse" />
                           <span>无需分配 / 直接使用</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-zinc-700 flex items-center gap-1.5">
                           <div className={`w-2 h-2 rounded-full ${bootStates[activeDetailsLab.id]?.status === "运行中" ? "bg-[#10A66A]" : bootStates[activeDetailsLab.id]?.status === "启动中" ? "bg-amber-400 animate-spin" : "bg-zinc-300"}`} />
                           <span>{bootStates[activeDetailsLab.id]?.status || "未启动"}</span>
                        </span>
                      )}
                    </div>

                    {/* Associated specialties */}
                    <div className="flex justify-between items-start py-2 border-b border-zinc-50">
                       <span className="text-zinc-400">关联专业</span>
                       <div className="flex gap-1.5 flex-wrap justify-end max-w-[180px]">
                          {activeDetailsLab.specialties.map(spec => (
                             <span key={spec} className="bg-zinc-50 text-zinc-600 px-2 py-0.5 border border-zinc-150 rounded text-[10px] font-medium">
                                {spec}
                             </span>
                          ))}
                       </div>
                    </div>

                    {/* Associated courses sum */}
                    <div className="flex justify-between items-center py-2 border-b border-zinc-50">
                       <span className="text-zinc-400">匹配课程数量</span>
                       <span className="text-[#10A66A] font-bold">{activeDetailsLab.coursesCount} 门涵盖</span>
                    </div>

                    {/* Detail intro explanation paragraph */}
                    <div className="space-y-1">
                       <span className="text-zinc-400 block pb-1">环境简介</span>
                       <p className="text-zinc-600 leading-relaxed bg-zinc-50/50 p-3 rounded-lg border border-zinc-100 font-medium">
                          {activeDetailsLab.desc}
                       </p>
                    </div>

                    {/* Collapsible associated dynamic courses schema */}
                    <div className="space-y-1.5">
                       <button 
                         onClick={() => setCoursesListCollapsed(!coursesListCollapsed)}
                         className="w-full text-left font-semibold text-zinc-800 flex justify-between items-center hover:text-[#10A66A] transition-all"
                       >
                          <span className="flex items-center gap-1.5">
                             <BookMarked className="w-4 h-4 text-zinc-400" />
                             <span>对应教学体系课程 ({activeDetailsLab.courseList.length})</span>
                          </span>
                          {coursesListCollapsed ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                       </button>

                       {!coursesListCollapsed && (
                         <div className="bg-zinc-50 border border-zinc-150 rounded-lg p-2.5 max-h-[140px] overflow-y-auto space-y-1.5">
                            {activeDetailsLab.courseList.length === 0 ? (
                              <div className="text-[10px] text-zinc-400 py-4 text-center">
                                该环境暂未关联特指主修课程体系
                              </div>
                            ) : (
                              activeDetailsLab.courseList.map((course, idx) => (
                                 <div key={idx} className="flex gap-2 items-center text-[10px] font-medium text-zinc-600">
                                    <span className="w-3.5 h-3.5 bg-[#EAF8F1] text-[#10A66A] text-[9.5px] font-bold rounded flex items-center justify-center shrink-0">
                                       {idx + 1}
                                    </span>
                                    <span className="truncate">{course}</span>
                                 </div>
                              ))
                            )}
                         </div>
                       )}
                    </div>

                    {/* Quick controls execution buttons */}
                    <div className="pt-3 border-t border-zinc-100">
                       {activeDetailsLab.id === "engineering-simulation" ? (
                         <button
                           onClick={() => launchEngineeringSimulator(activeDetailsLab)}
                           className="w-full py-2.5 bg-[#10A66A] hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                         >
                           <PlayCircle className="w-4 h-4" />
                           <span>打开仿真控制台</span>
                         </button>
                       ) : (
                         <div className="space-y-2">
                           {bootStates[activeDetailsLab.id]?.status === "运行中" ? (
                             <div className="space-y-2">
                                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2 text-[#07875A] font-medium text-[10px] leading-relaxed">
                                   <div className="w-2 h-2 rounded-full bg-[#10A66A] shrink-0 animate-ping" />
                                   <span>虚拟机节点挂载完成：运行网络IP 172.18.0.4</span>
                                </div>
                                <div className="flex gap-2">
                                   <button
                                     onClick={() => {
                                        showToast(`本地连接已构建。进入 ${activeDetailsLab.name} 调试终端`);
                                     }}
                                     className="flex-1 py-2.5 bg-[#10A66A] hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                   >
                                      <Terminal className="w-3.5 h-3.5" />
                                      <span>控制台</span>
                                   </button>
                                   <button
                                     onClick={() => resetSimulatedEnvironment(activeDetailsLab.id)}
                                     className="py-2.5 bg-rose-50 text-rose-500 hover:bg-rose-100 px-3 font-semibold text-xs rounded-lg transition-all flex items-center justify-center cursor-pointer"
                                     title="关停资源，重置状态"
                                   >
                                      <Power className="w-4 h-4" />
                                   </button>
                                </div>
                             </div>
                           ) : bootStates[activeDetailsLab.id]?.status === "启动中" ? (
                             <div className="space-y-2.5">
                                {/* Boot logs display console mock screen */}
                                <div className="bg-zinc-900 text-zinc-300 font-mono text-[9px] p-2.5 rounded-lg space-y-1 h-[70px] overflow-y-auto border border-zinc-800">
                                   {bootStates[activeDetailsLab.id]?.outputLog.map((logStr, lIdx) => (
                                      <div key={lIdx} className="truncate">
                                         <span className="text-[#10A66A] mr-1">{">"}</span>{logStr}
                                      </div>
                                   ))}
                                </div>
                                <div className="w-full bg-zinc-100 rounded-full h-1 overflow-hidden">
                                   <div className="bg-[#10A66A] h-full transition-all duration-300" style={{ width: `${bootStates[activeDetailsLab.id]?.progress}%` }} />
                                </div>
                                <button
                                  disabled
                                  className="w-full py-2.5 bg-zinc-100 text-zinc-400 font-bold text-xs rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                   <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                                   <span>容器初始化中... ({bootStates[activeDetailsLab.id]?.progress}%)</span>
                                </button>
                             </div>
                           ) : (
                             <button
                               onClick={() => startSimulatedEnvironment(activeDetailsLab.id, activeDetailsLab.name)}
                               className="w-full py-2.5 bg-[#10A66A] hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                             >
                               <Play className="w-4 h-4" />
                               <span>启动环境</span>
                             </button>
                           )}
                         </div>
                       )}
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}

    </div>
      ) : currentPage === "industryCloudConsole" ? (
        <div className="h-[calc(100vh-56px)] flex flex-col animate-in fade-in duration-300">
           <IndustryCloudConsole 
             showToast={showToast}
             onClose={() => setCurrentPage("experimentHall")}
             onOpen3DDesigner={(opts) => {
               if (opts?.view) setThreeDDesignerInitialView(opts.view);
               setCurrentPage("threeDDesigner");
             }}
             onOpen2DDesigner={(opts) => {
               if (opts?.view) setTwoDDesignerInitialView(opts.view);
               setCurrentPage("twoDDesigner");
             }}
           />
        </div>
      ) : currentPage === "threeDEngineering" ? (
        <div className="h-[calc(100vh-56px)] flex flex-col animate-in fade-in duration-300">
           <ThreeDEngineeringSimulation onClose={() => setCurrentPage("experimentHall")} />
        </div>
      ) : currentPage === "threeDDesigner" ? (
        <div className="h-[calc(100vh-56px)] flex flex-col animate-in fade-in duration-300">
           <ThreeDDesigner 
             onClose={() => setCurrentPage("experimentHall")} 
             initialView={threeDDesignerInitialView}
           />
        </div>
      ) : currentPage === "twoDDesigner" ? (
        <div className="h-[calc(100vh-56px)] flex flex-col animate-in fade-in duration-300">
           <TwoDDesigner 
             onClose={() => setCurrentPage("experimentHall")} 
             initialView={twoDDesignerInitialView}
           />
        </div>
      ) : currentPage === "ideClient" ? (
        <div className="h-[calc(100vh-56px)] flex flex-col animate-in fade-in duration-300">
           <BlockchainIDEClient
             showToast={showToast}
             onClose={() => setCurrentPage("experimentHall")}
           />
        </div>
      ) : (
        <div className="h-[calc(100vh-56px)] flex flex-col animate-in fade-in duration-300">
           <div className="flex-1 overflow-hidden">
              <ExperimentEnvironmentClient 
                envId={selectedEnvironment?.id || ""} 
                showToast={showToast} 
                onClose={() => setCurrentPage("experimentHall")}
                isEmbedded={false}
              />
           </div>
        </div>
      )}
    </div>
  );
}
