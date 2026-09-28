import React, { useState, useEffect } from "react";
import { 
    Search, Map, GitMerge, PieChart, ZoomIn, ZoomOut, Maximize, AlertCircle, Eye, EyeOff, Save, 
    PlusCircle, Link as LinkIcon, FileText, CheckCircle2, ListChecks, CheckCircle, Activity, 
    ListBox, List, ArrowRight, Clock, User, Filter, RefreshCw, Download, PlayCircle, Info, Target, 
    MapPin, Check, ChevronRight, BarChart2, ShieldAlert, Zap, Server, Cpu, Code
} from "lucide-react";

const getRadarPoint = (value: number, idx: number, total: number, size: number) => {
    const center = size / 2;
    const radius = (size / 2) - 10;
    const angle = (Math.PI * 2 * idx) / total - Math.PI / 2;
    const r = (value / 100) * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
};

const RadarChart = ({ data }: { data: number[] }) => {
    const size = 160;
    const center = size / 2;
    const points = data.map((v, i) => getRadarPoint(v, i, data.length, size)).join(" ");
    const bgLevels = [20, 40, 60, 80, 100];

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
           {bgLevels.map((level) => (
              <polygon 
                 key={level} 
                 points={data.map((_, i) => getRadarPoint(level, i, data.length, size)).join(" ")}
                 stroke="#E4E4E7" 
                 strokeWidth="1" 
                 fill="none" 
              />
           ))}
           {data.map((_, i) => (
              <line 
                 key={i} 
                 x1={center} 
                 y1={center} 
                 x2={getRadarPoint(100, i, data.length, size).split(',')[0]} 
                 y2={getRadarPoint(100, i, data.length, size).split(',')[1]} 
                 stroke="#E4E4E7" 
                 strokeWidth="1" 
               />
           ))}
           <polygon 
               points={points} 
               fill="rgba(16, 166, 106, 0.2)" 
               stroke="#10A66A" 
               strokeWidth="2" 
               className="transition-all duration-500"
           />
           {data.map((v, i) => {
               const p = getRadarPoint(v, i, data.length, size).split(',');
               return <circle key={`c-${i}`} cx={p[0]} cy={p[1]} r="3" fill="#10A66A" className="transition-all duration-500"/>
           })}
        </svg>
    )
};

const TrendChart = ({ points, className }: { points: string, className?: string }) => {
    return (
        <svg viewBox="0 0 120 60" className={`w-full h-full ${className || ''}`} preserveAspectRatio="none">
             <polyline points={points} fill="none" stroke="#10A66A" strokeWidth="2.5" className="transition-all duration-500" />
             <circle cx={points.split(' ').pop()?.split(',')[0]} cy={points.split(' ').pop()?.split(',')[1]} r="3" fill="#10A66A" />
        </svg>
    )
};

export default function LearningEngagementAnalysis() {
  const [selectedStudent, setSelectedStudent] = useState("学生1");
  const [selectedCourse, setSelectedCourse] = useState("物联网综合实训");
  const [selectedExperiment, setSelectedExperiment] = useState("全部实验");
  const [selectedTimeRange, setSelectedTimeRange] = useState("近30天");
  const [engagementDimension, setEngagementDimension] = useState("全部维度");
  
  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const [engagementGenerated, setEngagementGenerated] = useState(false);
  const [engagementGenerating, setEngagementGenerating] = useState(false);
  const [engagementRefreshing, setEngagementRefreshing] = useState(false);
  const [generationStep, setGenerationStep] = useState("");

  const [dimensionScores, setDimensionScores] = useState({ score: 78, platform: 86, softExp: 74, hardExp: 69, hardOp: 72, softOp: 81 });
  
  const [engagementOverview, setEngagementOverview] = useState({
      level: "中等参与", state: "需加强实验过程投入", lastTime: "", trend: "0,40 20,45 40,35 60,60 80,55 100,70 120,50"
  });

  const [engagementAnalysisRecords, setEngagementAnalysisRecords] = useState<any[]>([]);
  const [engagementOperationLogs, setEngagementOperationLogs] = useState<any[]>([]);

  const [aiEngagementConclusion, setAiEngagementConclusion] = useState<any>(null);
  const [riskAlerts, setRiskAlerts] = useState<any>(null);
  const [improvementSuggestions, setImprovementSuggestions] = useState<any>(null);
  
  const [joinedImprovementPlan, setJoinedImprovementPlan] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const addOperationLog = (type: string, content: string, result: string = "成功") => {
      const time = new Date().toLocaleTimeString('zh-CN', {hour12: false}).substring(0,8);
      setEngagementOperationLogs(prev => [{ time, type, content, result, operator: selectedStudent }, ...prev]);
  };

  const addAnalysisRecord = (dim: string, score: number, risk: string) => {
      const time = new Date().toLocaleTimeString('zh-CN', {hour12: false}).substring(0,8);
      setEngagementAnalysisRecords(prev => [{
          time, student: selectedStudent, course: selectedCourse, dim, score: score + "分", risk, operator: selectedStudent, result: "成功"
      }, ...prev]);
  };

  const mockData = {
      platform: [
          { time: "16:20:00", type: "访问页面", module: "实验大厅", duration: "18分钟", result: "有效" },
          { time: "15:40:00", type: "查看资料", module: "课程手册", duration: "12分钟", result: "有效" },
          { time: "14:30:00", type: "AI提问", module: "AI技能助手", duration: "3分钟", result: "有效" },
          { time: "13:10:00", type: "进入考试", module: "考试大厅", duration: "45分钟", result: "完成" }
      ],
      softExp: [
          { time: "16:05:00", exp: "Python数据处理实验", actionType: "运行代码", content: "执行 pandas 数据清洗代码", result: "成功" },
          { time: "15:50:00", exp: "Python数据处理实验", actionType: "调试代码", content: "修复 DataFrame 字段错误", result: "成功" },
          { time: "15:30:00", exp: "pyecharts图表实验", actionType: "运行代码", content: "生成柱状图", result: "失败" },
          { time: "15:35:00", exp: "pyecharts图表实验", actionType: "修改代码", content: "修复图表配置项", result: "成功" }
      ],
      hardExp: [
          { time: "14:20:00", exp: "温湿度采集实验", step: "设备接入", record: "接入温湿度传感器", result: "成功" },
          { time: "14:28:00", exp: "温湿度采集实验", step: "接线验证", record: "检测 VCC/GND 接线", result: "成功" },
          { time: "14:35:00", exp: "继电器控制实验", step: "设备调试", record: "继电器状态切换失败", result: "失败" },
          { time: "14:42:00", exp: "继电器控制实验", step: "重新调试", record: "修复控制引脚配置", result: "成功" }
      ],
      hardOp: [
          { time: "13:10:00", device: "温湿度传感器", action: "接入设备", result: "成功", issue: "-" },
          { time: "13:20:00", device: "Modbus网关", action: "配置通信参数", result: "成功", issue: "-" },
          { time: "13:30:00", device: "继电器模块", action: "切换开关状态", result: "失败", issue: "未完成供电接线" },
          { time: "13:40:00", device: "继电器模块", action: "重新接线", result: "成功", issue: "VCC/GND 已修复" }
      ],
      softOp: [
          { time: "10:10:00", env: "Jupyter", action: "代码编辑", content: "修改 pandas 数据处理代码", result: "成功" },
          { time: "10:18:00", env: "Jupyter", action: "运行代码", content: "生成 pyecharts 折线图", result: "成功" },
          { time: "10:30:00", env: "VSCode", action: "保存文件", content: "保存 main.py", result: "成功" },
          { time: "10:42:00", env: "区块链开发环境", action: "编译合约", content: "编译 Storage 合约", result: "成功" },
          { time: "10:50:00", env: "工程虚拟仿真", action: "发送数据", content: "上传温湿度数据", result: "成功" }
      ],
      conclusion: {
          overall: "学生整体学习参与度为中等，平台行为和软件操作表现较好，硬件实验过程和硬件操作参与不足。",
          strengths: [
              "1. 平台访问频率较稳定；",
              "2. 软件代码编辑和运行次数较多；",
              "3. AI助手提问行为积极；",
              "4. 软件实验过程有一定调试行为。"
          ],
          risks: [
              "1. 硬件实验完成率较低；",
              "2. 接线验证和设备调试记录不足；",
              "3. 硬件操作失败次数偏多；",
              "4. 实验复盘记录较少。"
          ],
          suggestion: "建议优先补充硬件实验过程训练，重点完成传感器接入、网关配置、继电器控制和串口通信实验，同时保持软件操作训练频率。"
      },
      risksCard: {
          level: "中风险",
          items: [
              "硬件实验过程参与不足",
              "硬件操作失败率偏高",
              "实验任务提交不及时"
          ],
          actions: [
              "1. 安排硬件实验专项训练；",
              "2. 增加接线验证练习；",
              "3. 完成实验后提交复盘记录；",
              "4. 每周至少完成 2 次硬件相关实验。"
          ]
      },
      improvs: [
          "1. 温湿度传感器接入实验",
          "2. 网关通信参数配置实验",
          "3. 继电器控制实验",
          "4. 串口通信调试实验",
          "5. pyecharts数据可视化实验"
      ]
  };

  const handleGenerate = () => {
     if (engagementGenerating) return;
     if (!selectedStudent) {
         showToast("请选择学生");
         return;
     }
     if (!selectedCourse) {
         showToast("请选择课程");
         return;
     }
     
     setEngagementGenerating(true);
     setEngagementGenerated(false);
     addOperationLog("生成分析", `生成${selectedStudent}学习参与度分析`);
     
     const steps = [
        "正在读取平台访问行为...",
        "正在统计软件实验过程...",
        "正在分析硬件实验过程...",
        "正在识别硬件操作记录...",
        "正在整理软件操作日志...",
        "正在生成AI分析结论..."
     ];
     
     let stepIndex = 0;
     setGenerationStep(steps[stepIndex]);
     
     const interval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
            setGenerationStep(steps[stepIndex]);
        } else {
            clearInterval(interval);
            setEngagementGenerating(false);
            setEngagementGenerated(true);
            setEngagementOverview(prev => ({...prev, lastTime: new Date().toLocaleTimeString('zh-CN', {hour12: false}).substring(0,8)}));
            setAiEngagementConclusion(mockData.conclusion);
            setRiskAlerts(mockData.risksCard);
            setImprovementSuggestions(mockData.improvs);
            addAnalysisRecord("全部维度", 78, "中风险");
            showToast("学习参与度分析已生成");
        }
     }, 300); // reduced timeout for smoother experience
  };

  const handleRefresh = () => {
      if (!engagementGenerated) {
          showToast("请先生成参与度分析");
          return;
      }
      setEngagementRefreshing(true);
      
      setTimeout(() => {
          setDimensionScores({
             score: 81, platform: 88, softExp: 76, hardExp: 72, hardOp: 75, softOp: 84
          });
          setEngagementOverview(prev => ({
             ...prev, 
             lastTime: new Date().toLocaleTimeString('zh-CN', {hour12: false}).substring(0,8),
             trend: "0,45 20,40 40,30 60,65 80,60 100,75 120,65" // new trend
          }));
          addOperationLog("刷新分析", `刷新${selectedStudent}分析结果`);
          addAnalysisRecord(engagementDimension, 81, "中风险");
          setEngagementRefreshing(false);
          showToast("参与度分析已刷新");
      }, 800);
  };

  const handleDimensionSwitch = (dim: string) => {
      setEngagementDimension(dim);
      addOperationLog("切换维度", `查看${dim}分析`);
      if (engagementGenerated) {
         let currentScore = dimensionScores.score;
         if (dim === '平台行为') currentScore = dimensionScores.platform;
         if (dim === '软件实验过程') currentScore = dimensionScores.softExp;
         if (dim === '硬件实验过程') currentScore = dimensionScores.hardExp;
         if (dim === '硬件操作') currentScore = dimensionScores.hardOp;
         if (dim === '软件操作') currentScore = dimensionScores.softOp;
         addAnalysisRecord(dim, currentScore, "中风险");
      }
  };

  const handleJoinPlan = () => {
      setJoinedImprovementPlan(true);
      addOperationLog("加入计划", "加入硬件实验提升计划");
      showToast("已加入提升计划");
  };

  const handleExport = () => {
      if (!engagementGenerated) {
          showToast("请先生成参与度分析");
          return;
      }
      addOperationLog("生成报告", "生成参与度分析报告");
      setReportGenerated(true);
      showToast("参与度分析报告已生成");
  };

  const renderDimensionContent = () => {
      if (engagementDimension === "全部维度") {
          return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
                  {[
                      { name: "平台行为", score: dimensionScores.platform, level: "积极参与", stats: "登录次数 18 次，学习时长 1260 分钟，资料查看 42 次", risk: "正常", icon: <User className="w-5 h-5 text-emerald-500"/>, riskColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                      { name: "软件实验过程", score: dimensionScores.softExp, level: "一般参与", stats: "实验启动 12 次，代码运行 58 次，调试次数 16 次", risk: "需关注", icon: <Code className="w-5 h-5 text-blue-500"/>, riskColor: "text-orange-600 bg-orange-50 border-orange-100" },
                      { name: "硬件实验过程", score: dimensionScores.hardExp, level: "参与不足", stats: "硬件实验 5 次，接线记录 9 次，设备调试 6 次", risk: "风险", icon: <Cpu className="w-5 h-5 text-orange-500"/>, riskColor: "text-red-600 bg-red-50 border-red-100" },
                      { name: "硬件操作", score: dimensionScores.hardOp, level: "一般参与", stats: "传感器接入 8 次，网关配置 4 次，继电器控制 5 次", risk: "需关注", icon: <Zap className="w-5 h-5 text-zinc-500"/>, riskColor: "text-orange-600 bg-orange-50 border-orange-100" },
                      { name: "软件操作", score: dimensionScores.softOp, level: "较好参与", stats: "代码编辑 72 次，文件保存 30 次，运行日志 64 条", risk: "正常", icon: <Server className="w-5 h-5 text-purple-500"/>, riskColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  ].map(dim => (
                      <div key={dim.name} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                  {dim.icon}
                                  <h4 className="font-bold text-zinc-800 text-sm">{dim.name}</h4>
                              </div>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${dim.riskColor}`}>{dim.risk}</span>
                          </div>
                          <div className="text-2xl font-black text-zinc-900 mb-1">{dim.score}<span className="text-xs text-zinc-500 font-bold ml-1">分</span></div>
                          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mb-2">
                              <div className="h-full bg-[#10A66A] rounded-full transition-all duration-500" style={{ width: `${dim.score}%`}}></div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 mb-3">
                              <span>表现等级</span>
                              <span className="text-zinc-700">{dim.level}</span>
                          </div>
                          <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-100 text-[10px] text-zinc-600 font-medium leading-relaxed mb-3 h-[42px]">
                              关键指标：{dim.stats}
                          </div>
                          <button onClick={() => handleDimensionSwitch(dim.name)} className="w-full py-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-200">
                             查看详情
                          </button>
                      </div>
                  ))}
              </div>
          );
      }

      const getDetails = () => {
          switch(engagementDimension) {
              case "平台行为":
                  return {
                      title: "平台行为分析",
                      stats: [
                          { label: "登录次数", val: "18 次" }, { label: "累计在线时长", val: "1260 分钟" }, { label: "课程访问次数", val: "36 次" },
                          { label: "学习资料查看次数", val: "42 次" }, { label: "AI助手提问次数", val: "15 次" }, { label: "考试大厅访问次数", val: "4 次" },
                          { label: "实验大厅访问次数", val: "21 次" }, { label: "最近活跃时间", val: "今天 16:20" }
                      ],
                      headers: ["时间", "行为类型", "页面模块", "停留时长", "结果"],
                      lines: mockData.platform,
                      conclusion: "学生平台访问频率较高，学习资料查看和AI提问行为较稳定，说明具备较好的自主学习习惯。"
                  };
              case "软件实验过程":
                  return {
                      title: "软件实验过程分析",
                      stats: [
                          { label: "实验启动次数", val: "12 次" }, { label: "代码运行次数", val: "58 次" }, { label: "代码调试次数", val: "16 次" },
                          { label: "任务提交次数", val: "8 次" }, { label: "实验完成率", val: "72%" }, { label: "平均实验时长", val: "46 分钟" },
                          { label: "错误修复次数", val: "11 次" }, { label: "过程完整度", val: "74%" }
                      ],
                      headers: ["时间", "实验名称", "操作类型", "操作内容", "结果"],
                      lines: mockData.softExp,
                      conclusion: "学生软件实验过程参与度中等，代码运行和调试行为较多，但部分实验任务提交不及时，建议加强实验后总结和结果提交。"
                  };
              case "硬件实验过程":
                  return {
                      title: "硬件实验过程分析",
                      stats: [
                          { label: "硬件实验进入次数", val: "5 次" }, { label: "硬件实验累计时长", val: "230 分钟" }, { label: "接线验证次数", val: "9 次" },
                          { label: "设备调试次数", val: "6 次" }, { label: "数据采集次数", val: "7 次" }, { label: "仿真联动次数", val: "4 次" },
                          { label: "实验完成率", val: "62%" }, { label: "过程完整度", val: "69%" }
                      ],
                      headers: ["时间", "实验名称", "硬件环节", "过程记录", "结果"],
                      lines: mockData.hardExp,
                      conclusion: "学生硬件实验过程参与度偏低，尤其在接线验证、设备调试和实验复盘方面记录不足，建议增加硬件实验过程训练。"
                  };
              case "硬件操作":
                  return {
                      title: "硬件操作分析",
                      stats: [
                          { label: "传感器接入次数", val: "8 次" }, { label: "网关配置次数", val: "4 次" }, { label: "继电器控制次数", val: "5 次" },
                          { label: "电源模块配置次数", val: "3 次" }, { label: "RFID 读写次数", val: "2 次" }, { label: "串口通信次数", val: "6 次" },
                          { label: "硬件错误次数", val: "4 次" }, { label: "操作规范性", val: "72%" }
                      ],
                      headers: ["时间", "硬件设备", "操作类型", "操作结果", "问题说明"],
                      lines: mockData.hardOp,
                      conclusion: "学生能够完成基础传感器接入，但在执行器控制、网关参数配置和供电接线方面仍存在不稳定情况。"
                  };
              case "软件操作":
                  return {
                      title: "软件操作分析",
                      stats: [
                          { label: "代码编辑次数", val: "72 次" }, { label: "文件保存次数", val: "30 次" }, { label: "运行命令次数", val: "64 次" },
                          { label: "调试断点次数", val: "9 次" }, { label: "数据导入次数", val: "6 次" }, { label: "图表生成次数", val: "8 次" },
                          { label: "接口请求次数", val: "12 次" }, { label: "软件操作规范性", val: "81%" }
                      ],
                      headers: ["时间", "软件环境", "操作类型", "操作内容", "结果"],
                      lines: mockData.softOp,
                      conclusion: "学生软件操作参与度较好，代码编辑、运行和调试行为较充分，但复杂项目中的接口请求和数据可视化操作仍需加强。"
                  };
              default: return null;
          }
      };

      const detail = getDetails();
      if (!detail) return null;

      return (
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm animate-in fade-in">
              <h3 className="font-bold text-zinc-900 text-base mb-4 flex items-center gap-2"><ListChecks className="w-5 h-5 text-[#10A66A]"/> {detail.title}</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                 {detail.stats.map((s, i) => (
                    <div key={i} className="bg-zinc-50 border border-zinc-100 rounded-lg p-3">
                       <div className="text-[10px] text-zinc-500 font-bold mb-1">{s.label}</div>
                       <div className="text-sm font-black text-zinc-800 truncate">{s.val}</div>
                    </div>
                 ))}
              </div>
              
              <div className="bg-[#EAF8F1] border border-[#10A66A]/20 p-3 rounded-lg mb-4 flex items-start gap-2">
                 <Info className="w-4 h-4 text-[#10A66A] mt-0.5 shrink-0"/>
                 <div>
                    <span className="text-xs font-bold text-[#10A66A] mr-1 block mb-0.5">AI分析结论：</span>
                    <span className="text-xs text-zinc-700 leading-relaxed font-medium">{detail.conclusion}</span>
                 </div>
              </div>

              <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-zinc-50 border-b border-zinc-200">
                          {detail.headers.map((h: string) => <th key={h} className="py-2 px-3 text-[10px] font-bold text-zinc-500">{h}</th>)}
                       </tr>
                    </thead>
                    <tbody className="text-xs font-medium text-zinc-700">
                        {detail.lines.map((l: any, i: number) => {
                            const vals = Object.values(l);
                            return (
                                <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50">
                                   {vals.map((v: any, idx: number) => (
                                      <td key={idx} className="py-2 px-3">
                                         {String(v).includes('失败') ? <span className="text-red-500">{v}</span> : 
                                          String(v).includes('成功') || String(v).includes('完成') ? <span className="text-emerald-500">{v}</span> : v}
                                      </td>
                                   ))}
                                </tr>
                            )
                        })}
                    </tbody>
                 </table>
              </div>
              
              {engagementDimension === "平台行为" && (
                  <div className="mt-5 border border-zinc-200 rounded-lg p-4">
                     <h4 className="text-xs font-bold text-zinc-700 mb-2">近7天平台活跃趋势</h4>
                     <div className="h-24 w-full">
                         <TrendChart points={engagementOverview.trend} />
                     </div>
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="w-full flex flex-col space-y-4">
        {toastMsg && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold tracking-wide">{toastMsg}</span>
            </div>
        )}

        {/* Header & Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4 sticky top-0 z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#10A66A]" />
                      学习参与度分析
                   </h2>
                   <p className="text-xs text-zinc-500 mt-1">从平台行为、软件实验过程、硬件实验过程、硬件操作和软件操作五个维度分析学生学习参与情况。</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                   <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="h-9 px-3 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50 outline-none focus:ring-2 focus:ring-[#10A66A]/20 transition-all cursor-pointer">
                      <option>学生1</option>
                      <option>学生2</option>
                   </select>
                   <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="h-9 px-3 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50 outline-none focus:ring-2 focus:ring-[#10A66A]/20 transition-all cursor-pointer">
                      <option>物联网综合实训</option>
                      <option>Python基础应用</option>
                   </select>
                   <select value={selectedExperiment} onChange={(e) => setSelectedExperiment(e.target.value)} className="h-9 px-3 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50 outline-none focus:ring-2 focus:ring-[#10A66A]/20 transition-all cursor-pointer">
                      <option>全部实验</option>
                      <option>温湿度采集实验</option>
                      <option>继电器控制实验</option>
                   </select>
                   <select value={selectedTimeRange} onChange={(e) => setSelectedTimeRange(e.target.value)} className="h-9 px-3 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50 outline-none focus:ring-2 focus:ring-[#10A66A]/20 transition-all cursor-pointer">
                      <option>近7天</option>
                      <option>近30天</option>
                      <option>本学期</option>
                      <option>全部</option>
                   </select>
                   <select value={engagementDimension} onChange={(e) => handleDimensionSwitch(e.target.value)} className="h-9 px-3 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-white outline-none focus:ring-2 focus:ring-[#10A66A]/20 transition-all cursor-pointer">
                      <option>全部维度</option>
                      <option>平台行为</option>
                      <option>软件实验过程</option>
                      <option>硬件实验过程</option>
                      <option>硬件操作</option>
                      <option>软件操作</option>
                   </select>
                   
                   <button onClick={handleGenerate} disabled={engagementGenerating} className={`h-9 px-4 ${engagementGenerating ? 'bg-[#0CA061]' : 'bg-[#10A66A] hover:bg-[#0CA061]'} text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm`}>
                      {engagementGenerating ? <RefreshCw className="w-4 h-4 animate-spin"/> : <PlayCircle className="w-4 h-4"/>} 
                      {engagementGenerating ? '分析中...' : '生成参与度分析'}
                   </button>

                   <button onClick={handleRefresh} disabled={!engagementGenerated || engagementRefreshing} className={`h-9 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${!engagementGenerated ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <RefreshCw className={`w-3.5 h-3.5 ${engagementRefreshing ? 'animate-spin' : ''}`}/> {engagementRefreshing ? '刷新中...' : '刷新分析'}
                   </button>
                   <button onClick={handleExport} disabled={!engagementGenerated} className={`h-9 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${!engagementGenerated ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Download className="w-3.5 h-3.5"/> 导出报告
                   </button>
                </div>
            </div>
        </div>

        {/* Empty State */}
        {!engagementGenerated && !engagementGenerating && (
           <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-12 flex flex-col items-center justify-center min-h-[400px]">
               <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-zinc-300"/>
               </div>
               <h3 className="text-zinc-800 font-black text-base mb-2">暂无参与度分析结果</h3>
               <p className="text-zinc-500 text-xs text-center max-w-sm leading-relaxed">
                  请选择学生、课程和时间范围后，点击“生成参与度分析”，系统将从平台行为、软件实验过程、硬件实验过程、硬件操作和软件操作五个维度生成学习参与度分析结果。
               </p>
           </div>
        )}

        {/* Loading State */}
        {engagementGenerating && (
           <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-12 flex flex-col items-center justify-center min-h-[400px]">
               <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="w-8 h-8 text-[#10A66A] animate-spin"/>
               </div>
               <h3 className="text-zinc-800 font-black text-base mb-3">AI 正在进行参与度分析...</h3>
               <div className="text-[#10A66A] font-bold text-xs text-center border border-[#10A66A]/20 bg-[#EAF8F1] px-4 py-2 rounded-full shadow-sm animate-pulse">
                  {generationStep}
               </div>
           </div>
        )}

        {/* Generated Content */}
        {engagementGenerated && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top: Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
                 <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex flex-col items-center justify-center min-w-[120px] shrink-0 border-r border-zinc-100 pr-6">
                        <span className="text-[10px] text-zinc-500 font-bold mb-1">综合参与度评分</span>
                        <div className="text-3xl font-black text-[#10A66A] leading-none mb-1">{dimensionScores.score}<span className="text-sm font-bold ml-1 text-zinc-500">分</span></div>
                        <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 mt-1">{engagementOverview.level}</div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3 w-full">
                       <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-lg text-center">
                           <span className="text-[10px] text-zinc-500 font-bold block mb-1">平台行为得分</span>
                           <span className="text-lg font-black text-zinc-800">{dimensionScores.platform}分</span>
                       </div>
                       <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-lg text-center">
                           <span className="text-[10px] text-zinc-500 font-bold block mb-1">软件实验过程得分</span>
                           <span className="text-lg font-black text-zinc-800">{dimensionScores.softExp}分</span>
                       </div>
                       <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-center">
                           <span className="text-[10px] text-orange-600 font-bold block mb-1">硬件实验过程得分</span>
                           <span className="text-lg font-black text-orange-700">{dimensionScores.hardExp}分</span>
                       </div>
                       <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-lg text-center">
                           <span className="text-[10px] text-zinc-500 font-bold block mb-1">硬件操作得分</span>
                           <span className="text-lg font-black text-zinc-800">{dimensionScores.hardOp}分</span>
                       </div>
                       <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-lg text-center">
                           <span className="text-[10px] text-zinc-500 font-bold block mb-1">软件操作得分</span>
                           <span className="text-lg font-black text-zinc-800">{dimensionScores.softOp}分</span>
                       </div>
                    </div>
                    
                    <div className="w-24 h-24 shrink-0 hidden lg:block">
                        <RadarChart data={[dimensionScores.platform, dimensionScores.softExp, dimensionScores.hardExp, dimensionScores.hardOp, dimensionScores.softOp]} />
                    </div>
                 </div>

                 <div className="mt-5 bg-[#EAF8F1] border border-[#10A66A]/20 p-3 rounded-lg flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#10A66A] mt-0.5 shrink-0"/>
                    <div>
                       <span className="text-xs font-bold text-[#10A66A] mr-2">AI判断：</span>
                       <span className="text-xs text-zinc-700 leading-relaxed font-medium">该学生平台登录与学习访问较稳定，但硬件实验过程参与度偏低，硬件接线、设备调试和实验复盘记录不足，建议加强硬件实验训练和过程记录。</span>
                    </div>
                    <div className="ml-auto flex flex-col items-end text-[10px] whitespace-nowrap gap-1 pt-0.5">
                       <span className="text-zinc-500 font-bold">学习状态: <span className="text-orange-600">{engagementOverview.state}</span></span>
                       <span className="text-zinc-400">近期分析时间：{engagementOverview.lastTime}</span>
                    </div>
                 </div>
            </div>

            {/* Dimention Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
                {["全部维度", "平台行为", "软件实验过程", "硬件实验过程", "硬件操作", "软件操作"].map(dim => (
                   <button 
                       key={dim}
                       onClick={() => handleDimensionSwitch(dim)}
                       className={`px-4 py-2 shrink-0 rounded-lg text-xs font-bold transition-all border ${engagementDimension === dim ? 'bg-[#EAF8F1] border-[#10A66A] text-[#10A66A] shadow-sm' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
                   >
                     {dim}
                   </button>
                ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Left Area (Details / All dimension cards) */}
                <div className="lg:col-span-8 flex flex-col min-w-0">
                    {renderDimensionContent()}
                </div>

                {/* Right Area (Conclusion, Risk, Improv) */}
                <div className="lg:col-span-4 flex flex-col space-y-4">
                     {/* Conclusion */}
                     {aiEngagementConclusion && (
                         <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
                              <h3 className="font-bold text-zinc-900 text-sm mb-3 flex items-center gap-1.5"><Activity className="w-4 h-4 text-[#10A66A]"/> AI参与度分析结论</h3>
                              
                              <div className="space-y-4">
                                  <div>
                                     <span className="text-xs font-bold text-zinc-800 mb-1 block">综合判断：</span>
                                     <p className="text-xs text-zinc-600 font-medium leading-relaxed">{aiEngagementConclusion.overall}</p>
                                  </div>
                                  <div>
                                     <span className="text-[11px] font-bold text-emerald-600 mb-1 block">优势表现：</span>
                                     <ul className="text-xs text-zinc-600 font-medium leading-relaxed space-y-1">
                                        {aiEngagementConclusion.strengths.map((str: string, i: number) => <li key={i}>{str}</li>)}
                                     </ul>
                                  </div>
                                  <div>
                                     <span className="text-[11px] font-bold text-orange-600 mb-1 block">风险表现：</span>
                                     <ul className="text-xs text-zinc-600 font-medium leading-relaxed space-y-1">
                                        {aiEngagementConclusion.risks.map((str: string, i: number) => <li key={i}>{str}</li>)}
                                     </ul>
                                  </div>
                                  <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded text-xs text-zinc-700 font-medium shadow-xs">
                                     <span className="font-bold block mb-1">改进建议：</span>
                                     {aiEngagementConclusion.suggestion}
                                  </div>
                              </div>
                         </div>
                     )}

                     {/* Risk Alert */}
                     {riskAlerts && (
                         <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -z-0"></div>
                              <h3 className="font-bold text-zinc-900 text-sm mb-3 flex items-center gap-1.5 relative z-10"><ShieldAlert className="w-4 h-4 text-red-500"/> 参与度风险提醒</h3>
                              
                              <div className="flex items-center gap-2 mb-3 relative z-10">
                                 <span className="text-[10px] text-zinc-500 font-bold">风险等级：</span>
                                 <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">{riskAlerts.level}</span>
                              </div>
                              <div className="space-y-3 relative z-10">
                                  <div>
                                     <span className="text-[11px] font-bold text-zinc-800 mb-1 block">风险项：</span>
                                     <ul className="space-y-1">
                                        {riskAlerts.items.map((item: string, i: number) => (
                                            <li key={i} className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>{item}
                                            </li>
                                        ))}
                                     </ul>
                                  </div>
                                  <div className="bg-orange-50 border border-orange-100 p-2.5 rounded">
                                     <span className="text-[11px] font-bold text-orange-800 mb-1 block">建议措施：</span>
                                     <ul className="text-[11px] text-orange-700 font-medium leading-relaxed space-y-0.5">
                                        {riskAlerts.actions.map((act: string, i: number) => <li key={i}>{act}</li>)}
                                     </ul>
                                  </div>
                              </div>
                         </div>
                     )}

                     {/* Improv Suggestions */}
                     {improvementSuggestions && (
                         <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
                             <h3 className="font-bold text-zinc-900 text-sm mb-3 flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-500"/> 参与度提升建议</h3>
                             
                             <div className="mb-4">
                                 <span className="text-[11px] font-bold text-zinc-800 mb-1 block">建议任务：</span>
                                 <ul className="space-y-1.5 border border-zinc-100 rounded-lg p-3 bg-zinc-50">
                                     {improvementSuggestions.map((item: string, i: number) => (
                                         <li key={i} className="text-xs text-zinc-700 font-medium flex items-start gap-1">
                                             <CheckCircle className="w-3.5 h-3.5 text-[#10A66A] shrink-0 mt-0.5"/>
                                             {item}
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                             <div className="flex flex-col gap-2">
                                <button 
                                    onClick={handleJoinPlan} 
                                    disabled={joinedImprovementPlan}
                                    className={`w-full py-2 text-xs font-bold rounded-lg transition-colors border shadow-sm flex items-center justify-center gap-1 ${joinedImprovementPlan ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-[#10A66A] hover:bg-[#0CA061] text-white border-transparent'}`}
                                >
                                    {joinedImprovementPlan ? <Check className="w-4 h-4"/> : <PlusCircle className="w-4 h-4"/>}
                                    {joinedImprovementPlan ? '已加入提升计划' : '加入提升计划'}
                                </button>
                                <button 
                                    onClick={handleExport}
                                    disabled={reportGenerated}
                                    className={`w-full py-2 text-xs font-bold rounded-lg transition-colors border shadow-sm flex items-center justify-center gap-1 ${reportGenerated ? 'bg-zinc-100 text-zinc-400 border-zinc-200' : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200'}`}
                                >
                                   <FileText className="w-4 h-4"/>
                                   {reportGenerated ? '参与度报告已生成' : '生成参与度报告'}
                                </button>
                             </div>
                         </div>
                     )}
                </div>
            </div>

            {/* Bottom: Records & Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Records */}
                <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
                     <div className="flex justify-between items-center mb-3">
                         <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5"><Clock className="w-4 h-4 text-zinc-600"/> 参与度分析记录</h3>
                     </div>
                     <div className="overflow-x-auto border border-zinc-100 rounded-lg">
                         <table className="w-full text-left border-collapse">
                            <thead>
                               <tr className="border-b border-zinc-200 bg-zinc-50">
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">时间</th>
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">学生</th>
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">分析维度</th>
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">综合评分</th>
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">结果</th>
                               </tr>
                            </thead>
                            <tbody>
                               {engagementAnalysisRecords.map((r, i) => (
                                   <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50 text-xs text-zinc-700 font-medium">
                                      <td className="py-2 px-3">{r.time}</td>
                                      <td className="py-2 px-3 font-bold">{r.student}</td>
                                      <td className="py-2 px-3">{r.dim}</td>
                                      <td className="py-2 px-3 text-[#10A66A] font-bold">{r.score}</td>
                                      <td className="py-2 px-3 text-emerald-600">{r.result}</td>
                                   </tr>
                               ))}
                               {engagementAnalysisRecords.length === 0 && (
                                   <tr>
                                       <td colSpan={5} className="py-4 text-center text-xs text-zinc-400">暂无分析记录</td>
                                   </tr>
                               )}
                            </tbody>
                         </table>
                     </div>
                </div>

                {/* Operation Logs */}
                <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
                     <h3 className="font-bold text-zinc-900 text-sm mb-3 flex items-center gap-1.5"><List className="w-4 h-4 text-zinc-600"/> 操作日志</h3>
                     <div className="overflow-y-auto max-h-[200px] border border-zinc-100 rounded-lg">
                         <table className="w-full text-left border-collapse">
                            <thead>
                               <tr className="bg-zinc-50 sticky top-0 border-b border-zinc-200">
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">时间</th>
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">操作类型</th>
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">操作内容</th>
                                  <th className="py-2 px-3 text-[10px] font-bold text-zinc-500">结果</th>
                               </tr>
                            </thead>
                            <tbody>
                               {engagementOperationLogs.map((log, i) => (
                                   <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50 text-xs text-zinc-700 font-medium">
                                      <td className="py-2 px-3">{log.time}</td>
                                      <td className="py-2 px-3">{log.type}</td>
                                      <td className="py-2 px-3 truncate max-w-[150px]" title={log.content}>{log.content}</td>
                                      <td className="py-2 px-3 text-emerald-600">{log.result}</td>
                                   </tr>
                               ))}
                               {engagementOperationLogs.length === 0 && (
                                   <tr>
                                       <td colSpan={4} className="py-4 text-center text-xs text-zinc-400">暂无操作日志</td>
                                   </tr>
                               )}
                            </tbody>
                         </table>
                     </div>
                </div>
            </div>

          </div>
        )}
    </div>
  );
}
