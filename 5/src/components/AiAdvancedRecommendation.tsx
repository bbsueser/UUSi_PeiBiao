import React, { useState } from "react";
import { Search, Map, GitMerge, PieChart, ZoomIn, ZoomOut, Maximize, AlertCircle, Eye, EyeOff, Save, PlusCircle, Link as LinkIcon, FileText, CheckCircle2, ListChecks, CheckCircle, Activity, ListBox, List, ArrowRight, Clock, User, Filter, RefreshCw, Download, PlayCircle, Info, Target, MapPin, Check, ChevronRight } from "lucide-react";

export default function AiAdvancedRecommendation() {
  const [selectedStudent, setSelectedStudent] = useState("学生1");
  const [recommendGoal, setRecommendGoal] = useState("技能提升");
  const [recommendRange, setRecommendRange] = useState("全部课程");
  const [recommendTimeRange, setRecommendTimeRange] = useState("近30天");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const [learningOverview, setLearningOverview] = useState({
    student: "学生1",
    course: "Python基础与应用",
    score: 82,
    courseComp: 76,
    expComp: 68,
    examAvg: 74,
    weakCount: 3,
    recCount: 4,
    lastTime: new Date().toLocaleTimeString().substring(0,8),
    aiJudge: "该学生基础语法掌握较好，但数据处理、文件操作和可视化能力仍需加强，建议优先补充数据整理与图表展示相关课程。"
  });

  const defaultWeakSkills = [
    { id: "skill-pyecharts", name: "pyecharts 图表配置", currentMastery: 58, targetMastery: 80, risk: "高风险", relatedCourse: "数据可视化实训", action: "完成交互图表专项训练" },
    { id: "skill-pandas", name: "pandas 数据整理", currentMastery: 63, targetMastery: 80, risk: "需要提升", relatedCourse: "数据分析实训", action: "建议进行专项训练" },
    { id: "skill-file", name: "文件读写", currentMastery: 68, targetMastery: 80, risk: "需要提升", relatedCourse: "Python基础与应用", action: "完成文件读写强化训练" },
    { id: "skill-csv", name: "CSV 数据处理", currentMastery: 65, targetMastery: 80, risk: "需要提升", relatedCourse: "数据分析实训", action: "增强CSV的读写熟练度" },
    { id: "skill-xpath", name: "XPath 数据解析", currentMastery: 75, targetMastery: 80, risk: "需要提升", relatedCourse: "Python爬虫实训", action: "复习XPath解析" },
    { id: "skill-report", name: "综合项目报告生成", currentMastery: 78, targetMastery: 80, risk: "需要提升", relatedCourse: "综合实训", action: "增强排版与自动化" }
  ];

  const defaultCourses = [
    { id: "course-file", name: "Python文件与数据处理强化训练", level: "优先学习", skills: ["文件读写", "CSV处理", "JSON处理"], duration: "2 学时", reason: "文件读写掌握度为 68%，低于课程目标", status: "未开始", score: 92 },
    { id: "course-pandas", name: "pandas数据整理实训", level: "优先学习", skills: ["pandas基础", "数据清洗", "数据统计"], duration: "3 学时", reason: "数据整理能力掌握度为 63%，建议进行专项训练", status: "未开始", score: 89 },
    { id: "course-pyecharts", name: "pyecharts交互图表设计", level: "优先学习", skills: ["pyecharts 图表配置", "组合图表报告设计"], duration: "4 学时", reason: "可视化能力掌握度为 58%，需要重点提升", status: "未开始", score: 95 },
    { id: "course-proj", name: "Python综合项目实训", level: "巩固提升", skills: ["数据采集", "数据整理", "报告生成"], duration: "6 学时", reason: "用于巩固数据处理和可视化综合应用能力", status: "未开始", score: 84 }
  ];

  const defaultReason = {
    evidence: [
       "最近 30 天实验完成率为 68%，低于目标值 80%；",
       "文件读写实验得分 72 分，存在一定失误；",
       "pyecharts 图表训练完成次数较少；",
       "pandas 数据整理能力掌握度为 63%；",
       "技能图谱中“数据能力”和“可视化能力”节点处于提升区间。"
    ],
    conclusion: "建议学生优先补充“文件读写”和“pandas数据整理”能力，再进入“pyecharts交互图表设计”课程，最后通过 Python 综合项目完成能力闭环。"
  };

  const defaultPath = [
    { step: 1, name: "Python文件与数据处理强化训练", target: "提升文件读写、CSV处理、JSON处理能力", duration: "2 学时", priority: true, status: "未开始", cid: "course-file" },
    { step: 2, name: "pandas数据整理实训", target: "提升数据清洗、表格处理和数据统计能力", duration: "3 学时", priority: true, status: "未开始", cid: "course-pandas" },
    { step: 3, name: "pyecharts交互图表设计", target: "提升折线图、柱状图、组合图表和交互配置能力", duration: "4 学时", priority: true, status: "未开始", cid: "course-pyecharts" },
    { step: 4, name: "Python综合项目实训", target: "完成数据采集、数据整理、图表展示和报告生成闭环训练", duration: "6 学时", priority: false, status: "未开始", cid: "course-proj" }
  ];

  const [recommendGenerated, setRecommendGenerated] = useState(false);
  const [recommendGenerating, setRecommendGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");

  const [weakSkillList, setWeakSkillList] = useState<any[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [selectedWeakSkill, setSelectedWeakSkill] = useState<string|null>(null);
  const [recommendReason, setRecommendReason] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any[]>([]);
  const [recommendRecords, setRecommendRecords] = useState<any[]>([]);

  const handleGenerate = () => {
     if (recommendGenerating) return;
     setRecommendGenerating(true);
     setRecommendGenerated(false);
     
     const steps = [
        "正在分析课程学习进度...",
        "正在分析实验完成情况...",
        "正在分析考试成绩...",
        "正在匹配薄弱技能点...",
        "正在生成推荐课程..."
     ];
     
     let stepIndex = 0;
     setGenerationStep(steps[stepIndex]);
     
     const interval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
            setGenerationStep(steps[stepIndex]);
        } else {
            clearInterval(interval);
            
            setRecommendGenerating(false);
            setRecommendGenerated(true);
            setLearningOverview(prev => ({...prev, lastTime: new Date().toLocaleTimeString().substring(0,8)}));
            
            setWeakSkillList(defaultWeakSkills);
            setRecommendedCourses(defaultCourses);
            setLearningPath(defaultPath);
            setRecommendReason(defaultReason);
            
            const t = new Date().toLocaleTimeString().substring(0,8);
            setRecommendRecords([
               { time: t, student: selectedStudent, type: "技能提升", course: "pyecharts交互图表设计", skill: "pyecharts 图表配置", result: "已推荐", operator: selectedStudent },
               { time: t, student: selectedStudent, type: "课程补学", course: "pandas数据整理实训", skill: "pandas 数据整理", result: "已推荐", operator: selectedStudent }
            ]);
            
            showToast("AI进阶推荐已生成");
        }
     }, 400); // about 2s total
  };

  const handleRefresh = () => {
     setRecommendedCourses(prev => [...prev].sort(() => Math.random() - 0.5));
     setLearningOverview(prev => ({...prev, lastTime: new Date().toLocaleTimeString().substring(0,8)}));
     setRecommendReason((prev: any) => ({...prev, evidence: [
        "最近 7 天实验完成率为 " + (60 + Math.floor(Math.random()*15)) + "%，低于目标值 80%；",
        ...prev.evidence.slice(1)
     ]}));
     addRecord("刷新推荐", "-", "-", "已刷新");
     showToast("推荐结果已刷新");
  };

  const addRecord = (type: string, course: string, skill: string, result: string) => {
     const t = new Date().toLocaleTimeString().substring(0,8);
     setRecommendRecords(prev => [{ time: t, student: selectedStudent, type, course, skill, result, operator: selectedStudent }, ...prev]);
  };

  const handleJoinPlan = (courseId: string, courseName: string, skills: string) => {
      setRecommendedCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: "已加入计划" } : c));
      setLearningPath(prev => prev.map(p => p.cid === courseId ? { ...p, status: "已加入计划" } : p));
      addRecord("学习计划", courseName, skills, "已加入计划");
      showToast("已加入学习计划");
  };

  const handleSelectSkill = (skill: any) => {
      setSelectedWeakSkill(skill.id);
      setRecommendReason({
          evidence: [
              `技能【${skill.name}】当前掌握度仅为 ${skill.currentMastery}%；`,
              `未能达到设定的目标掌握度 ${skill.targetMastery}%；`,
              `关联课程《${skill.relatedCourse}》中的测试表现需提升；`,
              `风险评估为：${skill.risk}。`
          ],
          conclusion: "建议针对该能力短板：" + skill.action + "，可优先排入下一阶段学习计划。"
      });
      addRecord("查看技能", skill.relatedCourse, skill.name, "已查看技能详情");
      showToast("已查看技能详情");
  };

  return (
    <div className="w-full flex flex-col space-y-4">
        {/* Toast */}
        {toastMsg && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold tracking-wide">{toastMsg}</span>
            </div>
        )}

        {/* Header & Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#10A66A]" />
                      AI智能进阶推荐
                   </h2>
                   <p className="text-xs text-zinc-500 mt-1">根据学生课程学习、实验完成、考试成绩和技能图谱分析结果，推荐后续课程与需要提升的技能点。</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                   <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="h-9 px-3 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50 outline-none focus:ring-2 focus:ring-[#10A66A]/20 transition-all cursor-pointer">
                      <option>学生1</option>
                      <option>学生2</option>
                   </select>
                   <select value={recommendGoal} onChange={(e) => setRecommendGoal(e.target.value)} className="h-9 px-3 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50 outline-none focus:ring-2 focus:ring-[#10A66A]/20 transition-all cursor-pointer">
                      <option>技能提升</option>
                      <option>课程补学</option>
                      <option>项目强化</option>
                      <option>考试复习</option>
                   </select>
                   <select value={recommendRange} onChange={(e) => setRecommendRange(e.target.value)} className="h-9 px-3 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50 outline-none focus:ring-2 focus:ring-[#10A66A]/20 transition-all cursor-pointer">
                      <option>全部课程</option>
                      <option>当前课程相关</option>
                      <option>实验相关</option>
                      <option>薄弱技能相关</option>
                   </select>
                   <select value={recommendTimeRange} onChange={(e) => setRecommendTimeRange(e.target.value)} className="h-9 px-3 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50 outline-none focus:ring-2 focus:ring-[#10A66A]/20 transition-all cursor-pointer">
                      <option>近7天</option>
                      <option>近30天</option>
                      <option>本学期</option>
                   </select>
                   
                   <button onClick={handleGenerate} disabled={recommendGenerating} className={`h-9 px-4 ${recommendGenerating ? 'bg-[#0CA061]' : 'bg-[#10A66A] hover:bg-[#0CA061]'} text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm`}>
                      {recommendGenerating ? <RefreshCw className="w-4 h-4 animate-spin"/> : <PlayCircle className="w-4 h-4"/>} 
                      {recommendGenerating ? '生成中...' : '生成推荐'}
                   </button>

                   {recommendGenerated && (
                      <>
                        <button onClick={handleRefresh} className="h-9 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                           <RefreshCw className="w-3.5 h-3.5"/> 刷新推荐
                        </button>
                        <button onClick={() => showToast("已导出推荐报告")} className="h-9 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                           <Download className="w-3.5 h-3.5"/> 导出推荐
                        </button>
                      </>
                   )}
                </div>
            </div>
        </div>

        {/* Top: Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
            <h3 className="font-bold text-zinc-900 text-sm mb-4 flex items-center gap-1.5"><User className="w-4 h-4 text-[#10A66A]"/> 学习情况概览</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4 text-center">
                <div className="flex flex-col bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                    <span className="text-[10px] text-zinc-500 font-bold mb-1">学生</span>
                    <span className="text-xs font-black text-zinc-800">{learningOverview.student}</span>
                </div>
                <div className="flex flex-col col-span-2 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                    <span className="text-[10px] text-zinc-500 font-bold mb-1">当前课程</span>
                    <span className="text-xs font-black text-zinc-800 truncate">{learningOverview.course}</span>
                </div>
                <div className="flex flex-col bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-emerald-600 font-bold mb-1">综合技能评分</span>
                    <span className="text-lg font-black text-emerald-700 leading-none">{learningOverview.score}<span className="text-[10px] font-bold ml-0.5">分</span></span>
                </div>
                <div className="flex flex-col bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                    <span className="text-[10px] text-zinc-500 font-bold mb-1">课程完成率</span>
                    <span className="text-sm font-black text-zinc-800 leading-none">{learningOverview.courseComp}%</span>
                </div>
                <div className="flex flex-col bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                    <span className="text-[10px] text-zinc-500 font-bold mb-1">实验完成率</span>
                    <span className="text-sm font-black text-zinc-800 leading-none">{learningOverview.expComp}%</span>
                </div>
                <div className="flex flex-col bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                    <span className="text-[10px] text-zinc-500 font-bold mb-1">考试平均分</span>
                    <span className="text-sm font-black text-zinc-800 leading-none">{learningOverview.examAvg}分</span>
                </div>
                <div className="flex flex-col bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <span className="text-[10px] text-orange-600 font-bold mb-1">薄弱技能</span>
                    <span className="text-sm font-black text-orange-700 leading-none">{learningOverview.weakCount} 个</span>
                </div>
            </div>
            
            <div className="bg-[#EAF8F1] border border-[#10A66A]/20 p-3 rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 text-[#10A66A] mt-0.5 shrink-0"/>
                <div>
                   <span className="text-xs font-bold text-[#10A66A] mr-2">AI判断：</span>
                   <span className="text-xs text-zinc-700 leading-relaxed font-medium">{learningOverview.aiJudge}</span>
                </div>
                <div className="ml-auto flex items-center text-zinc-400 text-[10px] whitespace-nowrap pt-0.5">
                   近期分析时间：{learningOverview.lastTime}
                </div>
            </div>
        </div>

        {/* Empty State */}
        {!recommendGenerated && !recommendGenerating && (
           <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-12 flex flex-col items-center justify-center min-h-[400px]">
               <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-zinc-300"/>
               </div>
               <h3 className="text-zinc-800 font-black text-base mb-2">暂无推荐结果</h3>
               <p className="text-zinc-500 text-xs text-center max-w-sm leading-relaxed">
                  请点击右上角的“生成推荐”按钮，系统将根据当前学习情况智能生成推荐课程、待提升技能点和学习路径。
               </p>
           </div>
        )}

        {/* Loading State */}
        {recommendGenerating && (
           <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-12 flex flex-col items-center justify-center min-h-[400px]">
               <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="w-8 h-8 text-[#10A66A] animate-spin"/>
               </div>
               <h3 className="text-zinc-800 font-black text-base mb-3">AI 正在生成进阶推荐...</h3>
               <div className="text-[#10A66A] font-bold text-xs text-center border border-[#10A66A]/20 bg-[#EAF8F1] px-4 py-2 rounded-full shadow-sm animate-pulse">
                  {generationStep}
               </div>
           </div>
        )}

        {/* Generated Content */}
        {recommendGenerated && (
          <>
            {/* 3 Columns Layout for main content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Left: Weak Skills */}
                <div className="lg:col-span-3 flex flex-col space-y-4">
                   <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4 h-full">
                       <h3 className="font-bold text-zinc-900 text-sm mb-4 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-orange-500"/> 需要提升的技能点</h3>
                       <div className="space-y-3">
                           {weakSkillList.map((skill, index) => (
                              <div 
                                 key={skill.id} 
                                 onClick={() => handleSelectSkill(skill)}
                                 className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedWeakSkill === skill.id ? 'ring-2 ring-offset-1 ring-[#10A66A] bg-[#10A66A]/5 border-transparent' : 'border-zinc-200 hover:border-[#10A66A]/50 hover:shadow-sm bg-white'}`}
                              >
                                 <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-1.5">
                                       <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-black ${index < 3 ? 'bg-orange-100 text-orange-600' : 'bg-zinc-100 text-zinc-600'}`}>{index+1}</span>
                                       <span className="text-xs font-bold text-zinc-800">{skill.name}</span>
                                    </div>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${skill.risk === '高风险' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                       {skill.risk}
                                    </span>
                                 </div>
                                 <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1 mb-2 font-medium">
                                    <div>当前掌握度: <span className={`font-black ${skill.risk === '高风险' ? 'text-red-500' : 'text-orange-500'}`}>{skill.currentMastery}%</span></div>
                                    <div>目标: <span className="font-bold text-zinc-700">{skill.targetMastery}%</span></div>
                                 </div>
                                 
                                 <div className="w-full bg-zinc-100 rounded-full h-1.5 mb-3 overflow-hidden">
                                    <div className={`h-1.5 rounded-full ${skill.risk === '高风险' ? 'bg-red-500' : 'bg-orange-400'}`} style={{width: `${skill.currentMastery}%`}}></div>
                                 </div>
                                 
                                 <div className="text-[10px] font-medium text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-100">
                                    <div className="truncate">关联: {skill.relatedCourse}</div>
                                    <div className="text-[#10A66A] font-bold truncate mt-1">推荐: {skill.action}</div>
                                 </div>
                              </div>
                           ))}
                       </div>
                   </div>
                </div>

                {/* Middle: Recommended Courses */}
                <div className="lg:col-span-5 flex flex-col space-y-4">
                   <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4 h-full">
                       <h3 className="font-bold text-zinc-900 text-sm mb-4 flex items-center gap-1.5"><PlayCircle className="w-4 h-4 text-[#10A66A]"/> AI推荐课程</h3>
                       <div className="space-y-3">
                           {recommendedCourses.map(course => (
                               <div key={course.id} className="border border-zinc-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                                   <div className="flex justify-between items-start mb-2">
                                      <h4 className="text-sm font-black text-zinc-800 leading-tight">{course.name}</h4>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${course.level === '优先学习' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                         {course.level}
                                      </span>
                                   </div>
                                   
                                   <div className="flex flex-wrap items-center gap-x-3 gap-y-1 my-3">
                                      <div className="flex items-center text-[10px] text-zinc-500 font-medium">
                                         <span className="text-zinc-400 mr-1">匹配考点:</span>
                                         <div className="flex flex-wrap gap-1">
                                            {course.skills.map((s: string) => <span key={s} className="bg-zinc-100 px-1 rounded text-zinc-600">{s}</span>)}
                                         </div>
                                      </div>
                                      <div className="flex items-center text-[10px] text-zinc-500 font-medium ml-auto">
                                         <Clock className="w-3 h-3 text-zinc-400 mr-1"/>
                                         预计 {course.duration}
                                      </div>
                                   </div>

                                   <div className="bg-blue-50/50 p-2.5 rounded border border-blue-100 text-xs text-zinc-700 font-medium leading-relaxed mb-3">
                                      <span className="font-bold text-blue-600 mr-1">推荐原因:</span>
                                      {course.reason}
                                   </div>

                                   <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                                      <div className="flex items-center gap-2">
                                         <span className="text-[10px] text-zinc-500 font-bold">学习状态：</span>
                                         <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${course.status === '未开始' ? 'bg-zinc-100 text-zinc-600' : 'bg-emerald-50 text-emerald-600'}`}>{course.status}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                         <button className="text-xs font-bold text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => showToast(`查看课程详情：${course.name}`)}>
                                            查看课程
                                         </button>
                                         <button 
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm cursor-pointer ${course.status === '已加入计划' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' : 'bg-[#10A66A] hover:bg-[#0CA061] text-white border border-transparent'}`}
                                            onClick={() => handleJoinPlan(course.id, course.name, course.skills.join(","))}
                                         >
                                            {course.status === '已加入计划' ? <Check className="w-3.5 h-3.5"/> : <PlusCircle className="w-3.5 h-3.5"/>}
                                            {course.status === '已加入计划' ? '已加入计划' : '加入学习计划'}
                                         </button>
                                      </div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
                </div>

                {/* Right: Path and Reason */}
                <div className="lg:col-span-4 flex flex-col space-y-4">
                   {/* Reason */}
                   {recommendReason && (
                       <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
                           <h3 className="font-bold text-zinc-900 text-sm mb-3 flex items-center gap-1.5"><ListChecks className="w-4 h-4 text-[#10A66A]"/> AI推荐理由</h3>
                           <div className="space-y-3">
                              <div>
                                 <span className="text-xs font-bold text-zinc-800 mb-1.5 block">推荐依据：</span>
                                 <ul className="space-y-1.5">
                                    {recommendReason.evidence.map((ev: string, i: number) => (
                                       <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-600 font-medium leading-relaxed">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#10A66A] mt-1.5 shrink-0"></span>
                                          {ev}
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                              <div className="bg-[#EAF8F1] border border-[#10A66A]/20 p-3 rounded-lg">
                                 <span className="text-xs font-bold text-[#10A66A] block mb-1">AI结论：</span>
                                 <span className="text-xs text-zinc-700 leading-relaxed font-medium">{recommendReason.conclusion}</span>
                              </div>
                           </div>
                       </div>
                   )}

                   {/* Learning Path */}
                   <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4 flex-1">
                       <h3 className="font-bold text-zinc-900 text-sm mb-4 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-500"/> 推荐学习路径</h3>
                       
                       <div className="relative border-l-2 border-zinc-200 ml-3 space-y-5">
                           {learningPath.map((path, idx) => {
                              const isCurrent = idx === 0 || learningPath[idx-1].status === '已加入计划'; 
                              return (
                                 <div key={path.step} className="relative pl-5">
                                     <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${isCurrent && path.status !== '已加入计划' ? 'border-[#10A66A] ring-4 ring-[#10A66A]/10' : path.status === '已加入计划' ? 'border-emerald-500' : 'border-zinc-300'}`}>
                                         {path.status === '已加入计划' && <Check className="w-2.5 h-2.5 text-emerald-500"/>}
                                     </div>
                                     <div className={`border rounded-lg p-3 transition-colors ${isCurrent && path.status !== '已加入计划' ? 'border-[#10A66A]/30 bg-[#10A66A]/5' : 'border-zinc-200 bg-zinc-50'}`}>
                                         <div className="flex items-start justify-between mb-1.5">
                                             <h4 className="text-xs font-black text-zinc-800 leading-tight">
                                               第 {path.step} 步: {path.name}
                                             </h4>
                                             <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${path.priority ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-transparent text-zinc-500'}`}>
                                                {path.status === '已加入计划' ? '已加入' : path.priority ? '优先完成' : ''}
                                             </span>
                                         </div>
                                         <div className="text-[10px] text-zinc-600 font-medium leading-relaxed mb-1.5">
                                            目标：{path.target}
                                         </div>
                                         <div className="text-[10px] text-zinc-500 font-bold flex items-center">
                                            时长：{path.duration}
                                         </div>
                                     </div>
                                 </div>
                              )
                           })}
                       </div>
                   </div>
                </div>
            </div>

            {/* Bottom components: Records & Evidence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                {/* Records */}
                <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
                     <h3 className="font-bold text-zinc-900 text-sm mb-3 flex items-center gap-1.5"><Clock className="w-4 h-4 text-zinc-600"/> 推荐记录</h3>
                     <div className="overflow-x-auto">
                         <table className="w-full text-left border-collapse">
                            <thead>
                               <tr className="border-b border-zinc-200 bg-zinc-50">
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">时间</th>
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">推荐类型</th>
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">推荐课程</th>
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">关联技能点</th>
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">推荐结果</th>
                               </tr>
                            </thead>
                            <tbody>
                               {recommendRecords.map((r, i) => (
                                   <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50 text-xs text-zinc-700 font-medium">
                                      <td className="py-2 px-3">{r.time}</td>
                                      <td className="py-2 px-3 text-zinc-500">{r.type}</td>
                                      <td className="py-2 px-3 max-w-[120px] truncate">{r.course}</td>
                                      <td className="py-2 px-3 text-zinc-500 max-w-[120px] truncate">{r.skill}</td>
                                      <td className="py-2 px-3">
                                         <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.result === '已加入计划' ? 'bg-emerald-50 text-emerald-600' : r.result.includes('已生成') || r.result.includes('已刷新') || r.result.includes('已推荐') ? 'bg-blue-50 text-blue-600' : 'bg-zinc-100 text-zinc-600'}`}>
                                            {r.result}
                                         </span>
                                      </td>
                                   </tr>
                               ))}
                            </tbody>
                         </table>
                     </div>
                </div>

                {/* Evidence */}
                <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
                     <h3 className="font-bold text-zinc-900 text-sm mb-3 flex items-center gap-1.5"><Filter className="w-4 h-4 text-zinc-600"/> 分析依据</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border border-zinc-100 rounded-lg p-3 bg-zinc-50">
                            <span className="text-[10px] font-bold text-zinc-500 mb-1 block">数据来源</span>
                            <div className="text-xs font-bold text-zinc-800">课程学习进度、实验完成情况、考试成绩、技能图谱、AI诊断报告</div>
                        </div>
                        <div className="border border-zinc-100 rounded-lg p-3 bg-zinc-50">
                            <span className="text-[10px] font-bold text-zinc-500 mb-1 block">最近学习表现</span>
                            <div className="text-xs font-bold text-zinc-800">近 30 天完成实验 8 个，平均得分 74 分。</div>
                        </div>
                        <div className="border border-zinc-100 rounded-lg p-3 bg-zinc-50 md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-500 shrink-0">低于目标的能力点：</span>
                            <div className="flex flex-wrap gap-1">
                               <span className="text-[10px] font-bold bg-white text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded shadow-xs">pyecharts</span>
                               <span className="text-[10px] font-bold bg-white text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded shadow-xs">pandas基础</span>
                               <span className="text-[10px] font-bold bg-white text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded shadow-xs">文件读写</span>
                            </div>
                        </div>
                        <div className="border border-zinc-100 rounded-lg p-3 bg-zinc-50 md:col-span-2">
                            <span className="text-[10px] font-bold text-zinc-500 mb-1 block">推荐策略</span>
                            <div className="text-xs font-bold text-zinc-800">优先推荐低掌握度、高关联度、可快速补齐能力短板的课程。</div>
                        </div>
                     </div>
                </div>
            </div>
          </>
        )}
    </div>
  );
}
