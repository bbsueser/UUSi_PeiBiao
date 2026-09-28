/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Course, UserSession, ActiveTab } from "../types";
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal,
  Layers,
  GraduationCap,
  Play,
  Monitor,
  Video,
  Info,
  CheckCircle,
  Database,
  Terminal,
  Activity,
  Cpu,
  Bookmark,
  BrainCircuit
} from "lucide-react";

interface CourseHallProps {
  session: UserSession;
  initialSection?: string;
  onTabChange?: (tab: ActiveTab) => void;
}

export default function CourseHall({ session, onTabChange }: CourseHallProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("全部");
  const [selectedType, setSelectedType] = useState<string>("全部");
  const [searchQuery, setSearchQuery] = useState<string>("人工智能");
  const [sortBy, setSortBy] = useState<string>("默认排序");
  const [selectedTag, setSelectedTag] = useState<string>("全部");
  const [activeCourseDetails, setActiveCourseDetails] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync self-added courses from localStorage
  const [addedCourses, setAddedCourses] = useState<string[]>(() => {
    const saved = localStorage.getItem("student_added_courses");
    // Pre-join course-102 (Linux) as per requirements sample
    return saved ? JSON.parse(saved) : ["course-102"];
  });

  const handleAddLearning = (course: any) => {
    if (addedCourses.includes(course.id)) {
      if (onTabChange) onTabChange("dashboard");
      return;
    }

    const newList = [...addedCourses, course.id];
    setAddedCourses(newList);
    localStorage.setItem("student_added_courses", JSON.stringify(newList));
    
    // Also store task info for My Learning list
    const taskData = {
      id: course.id,
      courseName: course.title,
      specialty: course.specialty,
      type: course.type,
      chaptersCount: course.chaptersCount || 8,
      progress: 0,
      usedDuration: 0,
      totalDuration: 120,
      joinTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: "进行中",
      currentChapter: "第1章 课程认知与环境准备"
    };
    
    const savedTasks = localStorage.getItem("student_learning_tasks");
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    if (!tasks.find((t: any) => t.id === course.id)) {
      tasks.push(taskData);
      localStorage.setItem("student_learning_tasks", JSON.stringify(tasks));
    }
    
    showToast("课程已添加到我的学习。");
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Course data with specific additions for student autonomous learning requirement
  const COURSES_DATA: Course[] = useMemo(() => [
    {
      id: "course-101",
      title: "物联网设备开发实战",
      category: "物联技能",
      desc: "本课程介绍物联网系统的基本组成、感知层、网络层、平台层和应用层，帮助学生建立物联网系统整体认知。",
      studentsCount: 128,
      envIcons: ["cloud", "docker"],
      badge: "AI",
      color: "from-teal-500/10 to-emerald-500/10",
      accent: "#00A889",
      techIcon: "cpu",
      specialty: "物联网应用技术",
      type: "专业核心课",
      tags: ["物联网", "专业核心课", "实训课程"],
      chaptersCount: 8
    },
    {
      id: "course-102",
      title: "Linux操作系统",
      category: "系统开发",
      desc: "掌握Linux基础命令、文件系统管理、用户权限控制及Shell脚本编程，建立稳固的操作系统底座能力。",
      studentsCount: 96,
      envIcons: ["linux"],
      badge: "TB",
      color: "from-blue-500/10 to-indigo-500/10",
      accent: "#3b82f6",
      techIcon: "terminal",
      specialty: "工业互联网技术",
      type: "专业基础课",
      tags: ["Linux", "专业基础课", "实训课程"],
      chaptersCount: 10
    },
    {
      id: "course-103",
      title: "工业互联网应用开发",
      category: "应用开发",
      desc: "聚焦工业现场数据采集、边缘计算网关配置及工业APP开发实战，对接主流工业互联网平台。",
      studentsCount: 84,
      envIcons: ["cloud", "docker"],
      badge: "AI",
      color: "from-orange-500/10 to-amber-500/10",
      accent: "#f97316",
      techIcon: "activity",
      specialty: "工业互联网技术",
      type: "岗位技能课",
      tags: ["工业互联网", "岗位技能课", "实训课程"],
      chaptersCount: 7
    },
    {
      id: "course-1",
      title: "物联网设备开发实战课程指南及系统架构",
      category: "物联技能",
      desc: "围绕新大陆先进物联网实训平台，系统剖析传感器驱动编写、边缘网关通信协议等核心内容。",
      studentsCount: 2240,
      envIcons: ["cloud", "docker"],
      badge: "AI",
      color: "from-teal-500/10 to-emerald-500/10",
      accent: "#009b86",
      techIcon: "cpu",
      specialty: "物联网",
      type: "岗位技能认证",
      tags: ["物联网", "岗位技能认证", "热门课程", "实训课程"],
      chaptersCount: 12
    },
    {
      id: "course-2",
      title: "智能家居核心协议栈体系构建与故障诊断",
      category: "智能技术",
      desc: "讲解ZigBee 3.0标准、蓝牙Mesh组网机制以及Wi-Fi高效能传输的集成实训课，结合沙箱实验室环境直接控制仿真传感器，模拟多设备多网段的高速异构通信。",
      studentsCount: 1845,
      envIcons: ["linux", "cloud"],
      badge: "TB",
      color: "from-blue-500/10 to-indigo-500/10",
      accent: "#3b82f6",
      techIcon: "database",
      specialty: "物联网",
      type: "专业基础课",
      tags: ["物联网", "专业基础课", "最新课程", "推荐课程"]
    },
    {
      id: "course-3",
      title: "工业互联网传感器融合算法级应用实践",
      category: "边缘计算",
      desc: "专为工业4.0定制，深度教学传感器卡尔曼滤波去噪、数据边缘采集以及高速网关上云架构，内置新大陆独家工业实时数据统计实战系统。",
      studentsCount: 1560,
      envIcons: ["docker"],
      badge: "AI",
      color: "from-orange-500/10 to-amber-500/10",
      accent: "#f97316",
      techIcon: "terminal",
      specialty: "工业互联网",
      type: "专业核心课",
      tags: ["工业互联网", "专业核心课", "使用最多", "热门课程"]
    },
    {
      id: "course-4",
      title: "大数据仓库ETL高并发流水线底层调优",
      category: "数据架构",
      desc: "从实时数据接入层入手，讲解Flume和Kafka联动策略，深入实战Hive与Hadoop集群治理，教授新大陆企业级大型数据集市建设指标。支持多节点容器实操。",
      studentsCount: 3120,
      envIcons: ["linux", "docker"],
      badge: "AI",
      color: "from-purple-500/10 to-fuchsia-500/10",
      accent: "#a855f7",
      techIcon: "database",
      specialty: "大数据",
      type: "专业基础课",
      tags: ["大数据", "专业基础课", "使用最多", "推荐课程"]
    },
    {
      id: "course-5",
      title: "区块链联盟链通道机制 with 智能合约硬核开发",
      category: "系统开发",
      desc: "基于Hyperledger Fabric底层，系统讲解多通道数据隔离机制、Go与Solidity合约安全开发，并结合沙箱环境动手实现企业资产存证智能上链。",
      studentsCount: 1210,
      envIcons: ["linux"],
      badge: "TB",
      color: "from-rose-500/10 to-pink-500/10",
      accent: "#f43f5e",
      techIcon: "cpu",
      specialty: "区块链",
      type: "岗位技能认证",
      tags: ["区块链", "岗位技能认证", "最新课程", "实训课程"]
    },
    {
      id: "course-6",
      title: "人工智能深度学习多模态目标检测大作业",
      category: "机器视觉",
      desc: "新大陆人工智能系列王牌课程。包含YOLOv8的多机集群训练、PyTorch推理优化和Jetson嵌入式端部署。针对典型缺陷检测和车牌抓取进行真机沙盘调试。",
      studentsCount: 4235,
      envIcons: ["docker", "cloud"],
      badge: "AI",
      color: "from-sky-500/10 to-blue-500/10",
      accent: "#0ea5e9",
      techIcon: "activity",
      specialty: "人工智能",
      type: "专业核心课",
      tags: ["人工智能", "专业核心课", "热门课程", "AI课程"]
    },
    {
      id: "course-7",
      title: "物联网无线传感器网络LoRa高性能组网技术",
      category: "通信工程",
      desc: "教授LoRaWAN协议架构，从频段设置到CAD信道活动检测等全链路实训，解决多网关交叠区域冲突管理等技术硬核指标。配有完整的3D网络拓扑演示。",
      studentsCount: 960,
      envIcons: ["linux"],
      badge: "TB",
      color: "from-zinc-500/10 to-slate-500/10",
      accent: "#71717a",
      techIcon: "penguin",
      specialty: "物联网",
      type: "行业应用课",
      tags: ["物联网", "行业应用课", "使用最多", "推荐课程"]
    },
    {
      id: "course-8",
      title: "人工智能TensorFlow图像语义检测分割",
      category: "高级应用",
      desc: "探讨U-Net及DeepLabv3+在遥感测绘、机器人视觉导航中的进阶应用。学生可在GPU云端环境瞬间克隆主流框架演练千万级语义标签检测。",
      studentsCount: 2010,
      envIcons: ["cloud"],
      badge: "AI",
      color: "from-yellow-500/10 to-amber-500/10",
      accent: "#eab308",
      techIcon: "cpu",
      specialty: "人工智能",
      type: "专业核心课",
      tags: ["人工智能", "专业核心课", "热门课程", "AI课程"]
    },
    {
      id: "course-9",
      title: "工业大数据预测与Spark流计算引擎集成",
      category: "数据计算",
      desc: "针对工业级制造设备预测性维护（PHM）设计，联合实践Kafka、Spark Streaming及机器学习预测算法，内置百万级设备故障实测仿真大屏环境。",
      studentsCount: 1350,
      envIcons: ["docker", "linux"],
      badge: "AI",
      color: "from-emerald-500/10 to-green-500/10",
      accent: "#10b981",
      techIcon: "database",
      specialty: "工业互联网",
      type: "基础通识",
      tags: ["工业互联网", "基础通识", "最新课程", "推荐课程"]
    },
    {
      id: "course-10",
      title: "大数据集群监控管理（Zookeeper & Ambari）",
      category: "工程集成",
      desc: "大数据专业的核心基础必修课，讲解高可用集群选举流程，Ambari可视化管理，配有新大陆独家多节点并发自动化配置及调优仿真模拟系统。",
      studentsCount: 1620,
      envIcons: ["linux"],
      badge: "TB",
      color: "from-red-500/10 to-orange-500/10",
      accent: "#ef4444",
      techIcon: "terminal",
      specialty: "大数据",
      type: "专业核心课",
      tags: ["大数据", "专业核心课", "推荐课程", "实训课程"]
    },
    {
      id: "course-11",
      title: "区块链Fabric跨链智能路由网商对接工程",
      category: "跨链通信",
      desc: "解决智能制造与商业供应链间跨系统互联痛点，系统性剖析Hash锁及公链跨链中继机制。通过虚拟机靶场直接演示双账本跨系统即时结算。",
      studentsCount: 840,
      envIcons: ["docker"],
      badge: "AI",
      color: "from-cyan-500/10 to-blue-500/10",
      accent: "#06b6d4",
      techIcon: "cpu",
      specialty: "区块链",
      type: "岗位技能认证",
      tags: ["区块链", "岗位技能认证", "实训课程", "使用最多"]
    },
    {
      id: "course-12",
      title: "自动滑行视觉惯性SLAM技术应用导论",
      category: "机器定位",
      desc: "高级前沿人工智能工程。融合激光雷达、IMU，探索复杂场景SLAM图形建模算法与激光惯导解算。内置多传感器仿真对齐靶场。",
      studentsCount: 1100,
      envIcons: ["docker", "cloud"],
      badge: "AI",
      color: "from-indigo-500/10 to-purple-500/10",
      accent: "#6366f1",
      techIcon: "activity",
      specialty: "人工智能",
      type: "专业基础课",
      tags: ["人工智能", "专业基础课", "热门课程", "AI课程"]
    },
    {
      id: "course-13",
      title: "生成式人工智能AI大模型Prompt工程实操",
      category: "大语言模型",
      desc: "新一代AI精品实训。讲解主流开源大模型架构，动手实操Lora轻量化微调技术。沙盒环境搭载标准RAG系统，可直接调试垂直领域专属智能客服。",
      studentsCount: 3890,
      envIcons: ["cloud", "docker"],
      badge: "AI",
      color: "from-teal-500/10 to-emerald-500/10",
      accent: "#0ea5e9",
      techIcon: "activity",
      specialty: "人工智能",
      type: "技能课程",
      tags: ["人工智能", "技能课程", "热门课程", "AI课程", "推荐课程"]
    },
    {
      id: "course-14",
      title: "多模态大模型AI智能检测视觉巡检工程",
      category: "人工智能应用",
      desc: "围绕电力、智能制造安防应用，部署融合ViT和多模态图像检索的先进巡检机器人。虚拟实验室可以一键操纵巡视节点传感器。",
      studentsCount: 2650,
      envIcons: ["docker", "linux"],
      badge: "AI",
      color: "from-fuchsia-500/10 to-rose-500/10",
      accent: "#a855f7",
      techIcon: "cpu",
      specialty: "人工智能",
      type: "岗位认证课",
      tags: ["人工智能", "岗位认证课", "最新课程", "实训课程", "AI课程"]
    }
  ], []);

  // Specialty options from Screen 1
  const specialties = ["全部", "物联网", "人工智能", "工业互联网", "大数据", "区块链", "专业技术技能", "岗位课程"];

  // Course Types from Screen 1
  const courseTypes = ["全部", "岗位技能认证", "基础通识", "专业基础课", "专业核心课", "行业应用课", "技能课程", "岗位认证课"];

  // Filter & Search computation
  const filteredCourses = useMemo(() => {
    return COURSES_DATA.filter(course => {
      const matchSpecialty = selectedSpecialty === "全部" || course.specialty === selectedSpecialty;
      const matchType = selectedType === "全部" || course.type === selectedType;
      
      // Smart search that tolerates exact text as well as broad matches for screenshotting
      const matchSearch = searchQuery === "" ||
                          course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (course.tags && course.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                          (searchQuery === "人工智能" && (course.tags?.includes("AI课程") || course.badge === "AI"));
      
      let matchTag = false;
      if (selectedTag === "全部") {
        matchTag = true;
      } else {
        matchTag = !!(course.tags && course.tags.includes(selectedTag));
      }

      return matchSpecialty && matchType && matchSearch && matchTag;
    });
  }, [COURSES_DATA, selectedSpecialty, selectedType, searchQuery, selectedTag]);

  // Sorting
  const sortedCourses = useMemo(() => {
    const list = [...filteredCourses];
    if (sortBy === "最新") {
      return list.reverse();
    } else if (sortBy === "使用最多") {
      return list.sort((a, b) => b.studentsCount - a.studentsCount);
    }
    return list;
  }, [filteredCourses, sortBy]);

  // Mini environment SVG icon renderer for fidelity
  const renderEnvIcon = (type: string) => {
    switch(type) {
      case "cloud":
        return (
          <div key={type} className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200" title="云端实验环境">
            <Database className="w-3 h-3 text-sky-600" />
          </div>
        );
      case "docker":
        return (
          <div key={type} className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200" title="容器靶场">
            <Cpu className="w-3 h-3 text-amber-600" />
          </div>
        );
      case "linux":
      default:
        return (
          <div key={type} className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200" title="Linux 调试环境">
            <Terminal className="w-3 h-3 text-emerald-600" />
          </div>
        );
    }
  };

  return (
    <div id="platform-course-hall" className="min-h-screen bg-slate-50/50 pb-16 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 space-y-6">
        
        {/* Toast alerts */}
        {toastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 shadow-2xl flex items-center space-x-2 z-50 animate-in slide-in-from-top-4 duration-200">
            <Info className="w-4 h-4 text-[#009b86]" />
            <span className="font-bold">{toastMessage}</span>
          </div>
        )}

        {/* ACL Multi-Tenant Core Session Banner */}
        <div className="bg-[#e6f5f3] border border-[#009b86]/20 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-zinc-700 animate-in fade-in duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#009b86] animate-pulse" />
            <span className="font-bold text-[#009b86]">智慧教育综合实训平台 安全访问体系：</span>
            <span className="font-medium text-zinc-650">当前已登录「{session.role === "student" ? "学生" : session.role === "admin" ? "校管" : "教工"}端」专属课程大厅</span>
          </div>
          <div className="mt-1 sm:mt-0 font-mono text-[9px] text-zinc-400 font-black uppercase tracking-wider">
            ACL Token Matching: <span className="text-[#009b86] font-extrabold">SECURE_GRANTED</span>
          </div>
        </div>

        {/* Part 1: Top Hero section from Screen 1 */}
        <div id="u-course-hero" className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#009b86] to-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/10">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
                课程大厅
              </h1>
              <p className="text-xs text-zinc-500 font-medium tracking-tight">新大陆 AIoT & 智能制造高新精品实训核心课程</p>
            </div>
          </div>

          {/* Search Bar (Right Aligned) */}
          <div className="mt-4 md:mt-0 flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-80">
              <input 
                type="text"
                placeholder="请输入课程名称进行搜索" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg pl-3 pr-24 py-1.5 text-xs text-zinc-700 font-bold focus:outline-none focus:border-[#009b86] shadow-xs"
              />
              <div className="absolute right-1 top-1 flex items-center space-x-1">
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(""); showToast("已清除搜索词"); }}
                    className="h-6 px-1.5 text-zinc-400 hover:text-zinc-650 hover:bg-zinc-100 rounded text-[10px] font-black cursor-pointer transition-all"
                  >
                    重置
                  </button>
                )}
                <button 
                  onClick={() => showToast(`正在加载有关 [${searchQuery || "全部"}] 的精品工程实训...`)}
                  className="w-7 h-6 hover:bg-zinc-100 text-zinc-500 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Multiclass Categories Filter rows from Screen 1 */}
        <div id="u-course-filters" className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-xs font-bold">
          
          {/* Row 1: 专业 Specialty */}
          <div className="flex items-start">
            <span className="text-zinc-600 font-extrabold w-24 shrink-0 pt-1 text-right pr-4 text-xs tracking-wider">专业：</span>
            <div className="flex flex-wrap gap-1.5">
              {specialties.map(spec => {
                const isActive = selectedSpecialty === spec;
                return (
                  <button
                    key={spec}
                    id={`filter-spec-${spec}`}
                    onClick={() => {
                      setSelectedSpecialty(spec);
                      showToast(`已筛选专业：${spec}`);
                    }}
                    className={`px-3 py-1 rounded-full cursor-pointer transition-all ${
                      isActive 
                        ? "bg-[#10A66A] text-white shadow-xs" 
                        : "text-zinc-650 hover:bg-zinc-100"
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: 课程类型 Course Type */}
          <div className="flex items-start border-t border-zinc-100 pt-4">
            <span className="text-zinc-600 font-extrabold w-24 shrink-0 pt-1 text-right pr-4 text-xs tracking-wider">课程类型：</span>
            <div className="flex flex-wrap gap-1.5">
              {courseTypes.map(typ => {
                const isActive = selectedType === typ;
                return (
                  <button
                    key={typ}
                    id={`filter-type-${typ}`}
                    onClick={() => {
                      setSelectedType(typ);
                      showToast(`已筛选课程类型：${typ}`);
                    }}
                    className={`px-3 py-1 rounded-full cursor-pointer transition-all ${
                      isActive 
                        ? "bg-[#10A66A] text-white shadow-xs" 
                        : "text-zinc-650 hover:bg-zinc-100"
                    }`}
                  >
                    {typ}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: 标签 Filter */}
          <div className="flex items-start border-t border-zinc-100 pt-4">
            <span className="text-zinc-600 font-extrabold w-24 shrink-0 pt-1 text-right pr-4 text-xs tracking-wider">标签：</span>
            <div className="flex flex-wrap gap-1.5">
              {["全部", "热门课程", "最新课程", "使用最多", "AI课程", "实训课程", "推荐课程"].map(tag => {
                const isActive = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    id={`filter-tag-${tag}`}
                    onClick={() => {
                      setSelectedTag(tag);
                      showToast(`已筛选标签：${tag}`);
                    }}
                    className={`px-3 py-1 rounded-full cursor-pointer transition-all ${
                      isActive 
                        ? "bg-[#10A66A] text-white shadow-xs" 
                        : "text-zinc-650 hover:bg-zinc-100"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 新增：当前筛选状态指示区 */}
        <div className="bg-[#EAF8F1]/70 border border-[#10A66A]/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center text-xs gap-3 shadow-xs font-bold animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#10A66A]/10 text-[#10A66A] border border-[#10A66A]/30 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider">当前筛选</span>
            <div className="text-zinc-650 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>专业 = <span className="text-zinc-900 font-extrabold bg-zinc-100 px-1.5 py-0.5 rounded">{selectedSpecialty}</span></span>
              <span className="text-zinc-300">｜</span>
              <span>课程类型 = <span className="text-zinc-900 font-extrabold bg-zinc-100 px-1.5 py-0.5 rounded">{selectedType}</span></span>
              <span className="text-zinc-300">｜</span>
              <span>标签 = <span className="text-zinc-900 font-extrabold bg-zinc-100 px-1.5 py-0.5 rounded">{selectedTag}</span></span>
              <span className="text-zinc-300">｜</span>
              <span>课程名称 = <span className="text-[#10A66A] font-extrabold bg-zinc-100 px-1.5 py-0.5 rounded">{searchQuery || "所有课程"}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            <span className="text-[11px] text-[#10A66A] font-extrabold">
              已按专业、课程类型、标签及课程名称完成筛选，共检索到 <span className="text-sm underline decoration-2">{sortedCourses.length}</span> 门课程。
            </span>
            <button 
              onClick={() => {
                setSelectedSpecialty("全部");
                setSelectedType("全部");
                setSelectedTag("全部");
                setSearchQuery("");
                showToast("已重置所有筛选条件");
              }}
              className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-[#10A66A] rounded text-[11px] font-black cursor-pointer shadow-2xs transition-all active:scale-95"
            >
              重置筛选
            </button>
          </div>
        </div>

        {/* AI技能助手与大模型特快入口 banner */}
        <div className="bg-gradient-to-r from-emerald-500/5 via-teal-500/10 to-emerald-500/10 border border-[#10A66A]/25 rounded-xl p-4.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-3xs animate-in slide-in-from-top-3 duration-200 text-xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10A66A] to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
              <BrainCircuit className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-zinc-900 flex items-center gap-1.5 leading-none">
                AI技能助手 / 课程学习智能辅导
                <span className="text-[9.5px] bg-[#10A66A]/10 text-[#10A66A] border border-[#10A66A]/20 px-2 py-0.2 rounded font-black">
                  已关联物联网通信协议知识库
                </span>
              </h4>
              <p className="text-[11px] text-zinc-500 font-bold">
                基于课程知识库与垂类大模型，辅助解决学习难点。支持自然语言处理检索与图文耦合答疑。
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (onTabChange) onTabChange("ai_assistant");
            }}
            className="px-4 py-2 bg-[#10A66A] hover:bg-emerald-600 text-white text-xs font-extrabold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>进入“AI技能助手” &rarr;</span>
          </button>
        </div>

        {/* Part 3: Sort Toolbar */}
        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-zinc-200/85 text-xs font-bold text-zinc-600 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex space-x-6 items-center">
            {["默认排序", "最新", "使用最多"].map(sort => {
              const active = sortBy === sort;
              return (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`hover:text-[#10A66A] cursor-pointer transition-colors ${active ? "text-[#10A66A] font-extrabold" : ""}`}
                >
                  {sort}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-zinc-400 font-semibold font-mono">
            检索结果: <span className="font-extrabold text-[#10A66A]">{sortedCourses.length}</span> 门工程实训就绪
          </div>
        </div>

        {/* Part 4: Responsive Course Grid precisely replicating Screen 1 */}
        {sortedCourses.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center space-y-3">
            <Layers className="w-12 h-12 text-zinc-300 mx-auto animate-bounce-slow" />
            <p className="text-zinc-500 text-sm font-semibold">暂无符合当前筛选条件的课程</p>
            <button 
              onClick={() => { setSelectedSpecialty("全部"); setSelectedType("全部"); setSearchQuery(""); setSelectedTag("全部"); }}
              className="px-4 py-1.5 bg-[#10A66A] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#07875A]"
            >
              重置全部筛选
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCourses.map(course => (
              <div 
                key={course.id}
                id={`course-item-${course.id}`}
                className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative group"
              >
                {/* 3D Holo Preview cover precisely colored */}
                <div className={`relative h-14 shrink-0 bg-gradient-to-br ${course.color} border-b border-zinc-100 flex items-center justify-center overflow-hidden`}>
                  <div className="absolute w-24 h-24 bg-[#10A66A]/10 rounded-full blur-xl -bottom-8 pointer-events-none" />
                  
                  {/* Course Title text stamped overlays like smart assets */}
                  <div className="absolute top-3 left-4 text-left">
                    <span className="text-[11px] font-black text-zinc-800 tracking-tight block">
                      NEWLAND ACADEMY
                    </span>
                    <span className="text-[8px] text-[#10A66A] block font-mono font-black tracking-wider">LAB_INFRA_READY</span>
                  </div>

                  {/* Translucent overlay code identifier */}
                  <span className="absolute bottom-2.5 right-3 bg-[#10A66A]/10 backdrop-blur-md text-[9px] text-[#10A66A] font-mono font-extrabold px-1.5 py-0.5 rounded border border-[#10A66A]/30">
                    NLE-ID: {course.id.replace("course-", "00")}
                  </span>
                </div>

                {/* Body details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 px-4 pb-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-zinc-900 group-hover:text-[#10A66A] transition-colors line-clamp-1" title={course.title}>
                      {course.title}
                    </h3>
                    
                    {/* 所属专业、课程类型及在学人数 */}
                    <div className="grid grid-cols-2 gap-y-1 text-[11px] font-bold border-b border-zinc-100 pb-2 text-zinc-500">
                      <div>
                        专业：<span className="text-[#10A66A] font-extrabold">{course.specialty}</span>
                      </div>
                      <div className="text-right">
                        在学人数：<span className="text-zinc-850 font-mono font-extrabold">{course.studentsCount}人</span>
                      </div>
                      <div className="col-span-1 mt-0.5">
                        课程类型：<span className="text-[#10A66A] font-extrabold">{course.type}</span>
                      </div>
                      {course.chaptersCount && (
                        <div className="text-right mt-0.5">
                          章节数量：<span className="text-zinc-850 font-mono font-extrabold">{course.chaptersCount}章</span>
                        </div>
                      )}
                    </div>

                    {/* 状态标签 */}
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                         addedCourses.includes(course.id)
                           ? "bg-[#EAF8F1] text-[#10A66A] border border-[#CFEFE0]"
                           : "bg-zinc-50 text-zinc-400 border-zinc-200"
                       }`}>
                         {addedCourses.includes(course.id) ? "已加入" : "未加入"}
                       </span>
                    </div>

                    {/* 标签小徽标 */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(course.tags || []).map((t: string, idx: number) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 bg-zinc-50 hover:bg-[#10A66A]/10 text-zinc-650 hover:text-[#10A66A] rounded text-[9px] font-black border border-zinc-200/60 hover:border-[#10A66A]/25 transition-all"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-zinc-400 font-medium leading-relaxed line-clamp-2 pt-1 border-t border-dashed border-zinc-100 mt-2">
                      课程概述：{course.desc}
                    </p>
                  </div>

                  {/* Environment & Right Tag matching screen 1 */}
                  <div className="pt-2 border-t border-zinc-150 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-zinc-400 font-extrabold font-sans">实验环境:</span>
                      <div className="flex space-x-1">
                        {course.envIcons.map(icon => renderEnvIcon(icon))}
                      </div>
                    </div>

                    {/* Badge circle with purple AI or blue TB or text */}
                    <div className="flex items-center space-x-1">
                      <div className={`w-5 h-5 rounded-full ${course.badge === "AI" ? "bg-[#10A66A]/10 text-[#10A66A]" : "bg-blue-50 text-blue-600"} text-[9px] font-black flex items-center justify-center font-mono border border-current`}>
                        {course.badge}
                      </div>
                    </div>
                  </div>

                  {/* Action launcher */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddLearning(course)}
                      className={`flex-1 py-1.8 font-black text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs ${
                        addedCourses.includes(course.id)
                          ? "bg-[#EAF8F1] text-[#10A66A] border border-[#10A66A]/30 hover:bg-[#D4F0EB]"
                          : "bg-[#10A66A] text-white hover:bg-[#07875A]"
                      }`}
                    >
                      {addedCourses.includes(course.id) ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>继续学习</span>
                        </>
                      ) : (
                        <span>添加学习</span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setActiveCourseDetails(course.id);
                        showToast(`已成功挂载并激活《${course.title}》实训资源`);
                      }}
                      className="px-3 py-1.8 bg-white border border-zinc-200 text-zinc-500 hover:text-[#10A66A] hover:border-[#CFEFE0] rounded-lg transition-all cursor-pointer"
                      title="查看详情"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Interactive Lesson Drawer / Lightbox */}
        {activeCourseDetails && (
          (() => {
            const current = COURSES_DATA.find(c => c.id === activeCourseDetails);
            if (!current) return null;
            return (
              <div className="fixed inset-0 bg-zinc-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-zinc-200 overflow-hidden leading-relaxed text-xs">
                  <div className="bg-[#10A66A] text-white p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Bookmark className="w-4 h-4 fill-white animate-bounce" />
                      <span className="font-extrabold tracking-tight">课堂讲义 · 云沙箱虚拟机</span>
                    </div>
                    <button 
                      onClick={() => setActiveCourseDetails(null)}
                      className="text-white hover:text-zinc-250 font-extrabold text-xl cursor-pointer"
                    >
                      ×
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-zinc-900">{current.title}</h4>
                      <p className="text-zinc-400 font-mono text-[10px]">{current.category} · 讲师组新大陆课程大纲</p>
                    </div>

                    <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-150 space-y-2">
                      <span className="font-extrabold text-[#10A66A] block">【课案概述与实践指导】</span>
                      <p className="text-[11px] text-zinc-650 font-medium">
                        {current.desc} 在实验部分，请各位同学直接点击顶部 <strong>【实验大厅】</strong> 菜单，申请或一键启动对应的虚拟机沙盘镜像。
                      </p>
                    </div>

                    {/* VNC Stream preview mock */}
                    <div className="aspect-video bg-zinc-950 rounded-lg relative overflow-hidden flex items-center justify-center text-white">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/30 to-zinc-950 pointer-events-none" />
                      <div className="text-center space-y-2 z-10">
                        <Video className="w-8 h-8 text-white mx-auto animate-pulse" />
                        <span className="text-[10px] text-zinc-405 font-semibold font-mono block">新大陆物理多媒体 network 广播串流</span>
                        <button 
                          onClick={() => showToast("缓存微课，讲义多媒体微课极速缓存就绪")}
                          className="px-3 py-1 bg-[#10A66A] hover:bg-emerald-600 text-white font-extrabold text-[10px] rounded cursor-pointer"
                        >
                          即刻播放微课视频.mp4
                        </button>
                      </div>
                    </div>

                    {/* AI学习助手入口区块 */}
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-250/70 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[#10A66A]">
                        <span className="font-extrabold flex items-center gap-1">
                          <BrainCircuit className="w-4 h-4 animate-pulse" />
                          <span>【课程AI智能导师：解决学习难点】</span>
                        </span>
                        <span className="text-[9px] bg-[#10A66A] text-white px-2 py-0.2 rounded font-black font-sans">
                          知识库增强启用
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-650 leading-relaxed font-bold">
                        本物联网精品课已关联相应的通信协议、实验指导书本地知识库。欢迎点击下方进入“AI技能助手”，使用大模型进行图文并茂的对话答疑。
                      </p>

                      <button
                        onClick={() => {
                          setActiveCourseDetails(null);
                          if (onTabChange) onTabChange("ai_assistant");
                        }}
                        className="w-full py-2 bg-[#10A66A]/10 hover:bg-[#10A66A] hover:text-white border border-[#10A66A]/35 text-[#10A66A] text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 shadow-3xs cursor-pointer"
                      >
                        <BrainCircuit className="w-3.5 h-3.5" />
                        <span>AI技能助手：辅助解决学习难点及疑问 &rarr;</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-2">
                    <button 
                      onClick={() => setActiveCourseDetails(null)}
                      className="px-4 py-1.5 bg-white border border-zinc-250 rounded-lg font-bold text-zinc-750 hover:bg-zinc-100 cursor-pointer text-xs"
                    >
                      关闭返回
                    </button>
                    <button 
                      onClick={() => {
                        setActiveCourseDetails(null);
                        if (onTabChange) onTabChange("labs");
                      }}
                      className="px-4 py-1.5 bg-[#10A66A] hover:bg-[#07875A] text-white rounded-lg font-extrabold cursor-pointer text-xs"
                    >
                      一键启动对应仿真实验 &rarr;
                    </button>
                  </div>
                </div>
              </div>
            );
          })()
        )}

      </div>
    </div>
  );
}
