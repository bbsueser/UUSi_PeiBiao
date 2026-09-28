import React, { useState, useEffect } from "react";
import { Search, Map as MapIcon, GitMerge, PieChart, ZoomIn, ZoomOut, Maximize, AlertCircle, Eye, EyeOff, Save, PlusCircle, Link as LinkIcon, FileText, CheckCircle2, ListChecks, CheckCircle, Activity, ListBox, List } from "lucide-react";

const cx = 400;
const cy = 300;

const getInitialData = () => {
    const rawData = [
      { id: "root", name: "Python综合能力", category: "综合能力", mastery: 82, practiceCount: 50, course: "-", experiment: "-", score: 82, risk: "低", suggestion: "继续保持" },
      { id: "cat-base", name: "基础能力", category: "基础能力", mastery: 92, parent: "root" },
      { id: "cat-code", name: "编码能力", category: "编码能力", mastery: 86, parent: "root" },
      { id: "cat-data", name: "数据能力", category: "数据能力", mastery: 65, parent: "root" },
      { id: "cat-vis", name: "可视化能力", category: "可视化能力", mastery: 58, parent: "root" },
      { id: "cat-proj", name: "项目能力", category: "项目能力", mastery: 75, parent: "root" },
      { id: "skill-var", name: "变量", category: "基础能力", mastery: 95, practiceCount: 20, course: "Python基础与应用", experiment: "变量与表达式", score: 96, risk: "低", suggestion: "继续保持", parent: "cat-base" },
      { id: "skill-type", name: "数据类型", category: "基础能力", mastery: 90, practiceCount: 15, course: "Python基础与应用", experiment: "数据类型转换", score: 92, risk: "低", suggestion: "继续保持", parent: "cat-base" },
      { id: "skill-func", name: "函数", category: "编码能力", mastery: 86, practiceCount: 12, course: "Python基础与应用", experiment: "函数封装实验", score: 88, risk: "低", suggestion: "加强参数传递练习", parent: "cat-code" },
      { id: "skill-mod", name: "模块", category: "编码能力", mastery: 85, practiceCount: 10, course: "Python基础与应用", experiment: "模块化开发", score: 86, risk: "低", suggestion: "了解包的导入方式", parent: "cat-code" },
      { id: "skill-file", name: "文件读写", category: "数据能力", mastery: 68, practiceCount: 6, course: "Python基础与应用", experiment: "文件操作实验", score: 72, risk: "中", suggestion: "建议完成文件读写强化训练", parent: "cat-data" },
      { id: "skill-csv", name: "CSV处理", category: "数据能力", mastery: 65, practiceCount: 5, course: "数据分析实训", experiment: "CSV读写应用", score: 70, risk: "中", suggestion: "增强CSV的读写熟练度", parent: "cat-data" },
      { id: "skill-pandas", name: "pandas基础", category: "数据能力", mastery: 63, practiceCount: 4, course: "数据分析实训", experiment: "数据整理实验", score: 69, risk: "中", suggestion: "建议补充数据清洗任务", parent: "cat-data" },
      { id: "skill-mat", name: "matplotlib", category: "可视化能力", mastery: 62, practiceCount: 5, course: "数据可视化实训", experiment: "基础图表绘制", score: 65, risk: "中", suggestion: "熟悉各类基础图形API", parent: "cat-vis" },
      { id: "skill-pyecharts", name: "pyecharts", category: "可视化能力", mastery: 58, practiceCount: 3, course: "数据可视化实训", experiment: "交互图表实验", score: 61, risk: "高", suggestion: "该学生在 pyecharts 图表组件方面已有提升，但组合图表和交互配置仍需继续训练。", parent: "cat-vis" },
      { id: "skill-spider", name: "爬虫采集", category: "项目能力", mastery: 75, practiceCount: 8, course: "Python爬虫实训", experiment: "网页采集实验", score: 80, risk: "中", suggestion: "建议复习 XPath 与 BeautifulSoup", parent: "cat-proj" },
      { id: "skill-clean", name: "数据整理", category: "项目能力", mastery: 72, practiceCount: 7, course: "综合实训", experiment: "业务数据清洗", score: 76, risk: "中", suggestion: "加强异常值与空值处理", parent: "cat-proj" },
      { id: "skill-report", name: "报告生成", category: "项目能力", mastery: 78, practiceCount: 9, course: "综合实训", experiment: "多维报告生成", score: 82, risk: "低", suggestion: "增强排版与自动化", parent: "cat-proj" }
    ];
  
    const cats = rawData.filter(d => d.parent === 'root');
    let idxData = rawData.map(d => {
        if (d.id === 'root') return { ...d, pos: { x: cx, y: cy } };
        return d;
    });
    
    cats.forEach((c:any, i:number) => {
        const angle = (i / cats.length) * Math.PI * 2 - Math.PI/2;
        const r = 120;
        const cPos = { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
        const catObj = idxData.find(x => x.id === c.id);
        if (catObj) catObj.pos = cPos;
    });
  
    const getSkillPos = (catId: string, skillIdx: number, skillTotal: number) => {
       const catIdx = cats.findIndex((c:any) => c.id === catId);
       const baseAngle = (catIdx / cats.length) * Math.PI * 2 - Math.PI/2;
       const spread = Math.PI / 3; 
       const angle = baseAngle - spread/2 + (skillTotal > 1 ? (skillIdx / (skillTotal - 1)) * spread : 0);
       let r = 240;
       // Add some layout variations to avoid overlaps
       if (skillIdx % 2 !== 0) r += 20;
       return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    };
  
    idxData = idxData.map((d: any) => {
        if (d.parent && d.parent !== 'root') {
            const cSkills = rawData.filter(sk => sk.parent === d.parent);
            const skillIdx = cSkills.findIndex(sk => sk.id === d.id);
            return { ...d, pos: getSkillPos(d.parent, skillIdx, cSkills.length) };
        }
        return d;
    });
  
    return idxData;
};

export default function SkillGraphAnalysis() {
  const [skillGraphData, setSkillGraphData] = useState<any[]>(() => getInitialData());
  const [graphRefreshKey, setGraphRefreshKey] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState("");
  
  const [currentGraphType, setCurrentGraphType] = useState<"outline" | "network" | "tree" | "ring">("network");
  const [selectedStudent, setSelectedStudent] = useState("学生1");
  const [selectedCourse, setSelectedCourse] = useState("Python基础与应用");
  const [analysisRange, setAnalysisRange] = useState("全部技能");
  const [timeRange, setTimeRange] = useState("近30天");
  
  const [selectedSkillNode, setSelectedSkillNode] = useState<any>(null);
  const [highlightWeakSkills, setHighlightWeakSkills] = useState(false);
  const [showRelationLines, setShowRelationLines] = useState(true);
  const [graphZoom, setGraphZoom] = useState(100);
  const [aiAnalysisSummary, setAiAnalysisSummary] = useState({
      score: 82,
      adv: "变量、数据类型、函数、流程控制",
      weak: "pyecharts、pandas基础、文件读写",
      risk: "可视化能力和数据处理能力低于课程目标，需要进行专项提升。",
      path: "先完成文件读写强化训练，再完成 pandas 数据整理任务，最后完成 pyecharts 组合图表训练。"
  });
  
  const [graphOperationLogs, setGraphOperationLogs] = useState<any[]>([
     { time: new Date().toLocaleTimeString().substring(0,8), type: "访问", graph: "无", content: "进入技能图谱分析页面", result: "成功", user: "学生1" }
  ]);
  const [graphToast, setGraphToast] = useState("");
  const [improvementPlan, setImprovementPlan] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setGraphToast(msg);
    setTimeout(() => setGraphToast(""), 3000);
  };

  const getTypeName = (t: string) => t === 'network' ? '网图' : t === 'tree' ? '树图' : t === 'outline' ? '大纲' : '环形图';

  const addLog = (type: string, graph: string, content: string) => {
    const time = new Date().toLocaleTimeString().substring(0, 8);
    setGraphOperationLogs(prev => [{ time, type, graph, content, result: "成功", user: selectedStudent }, ...prev]);
  };

  const handleGenerateGraph = () => {
    setSelectedSkillNode(null);
    setHighlightWeakSkills(false);
    setGraphZoom(100);
    showToast("技能图谱已生成");
    addLog("生成图谱", getTypeName(currentGraphType), `生成 ${selectedCourse} 技能图谱`);
  };

  const handleRefreshAnalysis = () => {
    const timeNow = new Date().toLocaleTimeString().substring(0, 8);
    // Perturb data
    const newData = skillGraphData.map(node => {
       if (node.id !== 'root' && node.id.startsWith('skill-')) {
          const newMastery = Math.min(100, node.mastery + Math.floor(Math.random() * 8) + 1);
          return {
             ...node,
             mastery: newMastery,
             score: newMastery + Math.floor(Math.random() * 5),
             risk: newMastery >= 80 ? '低' : newMastery >= 60 ? '中' : '高',
             pos: node.pos ? { x: node.pos.x + (Math.random() * 20 - 10), y: node.pos.y + (Math.random() * 20 - 10) } : undefined
          };
       }
       return node;
    });

    // Update categories masteries too optionally, but for visuals we just rely on the new data
    const root = newData.find(d => d.id === 'root');
    if (root) {
        root.mastery = 85;
        root.score = 85;
    }

    setSkillGraphData(newData);
    setGraphRefreshKey(prev => prev + 1);
    setLastRefreshTime(timeNow);
    
    if (selectedSkillNode) {
       setSelectedSkillNode(newData.find(d => d.id === selectedSkillNode.id));
    }
    
    setAiAnalysisSummary({
        score: 85,
        adv: "变量、数据类型、函数、模块",
        weak: "pyecharts、matplotlib",
        risk: "可视化能力仍低于课程目标，但较上次分析已有提升。",
        path: "先完成 pyecharts 组合图表训练，再完成 pandas 数据整理任务。"
    });

    addLog("刷新分析", getTypeName(currentGraphType), `刷新 ${selectedCourse} 技能图谱数据`);
    showToast("技能图谱已刷新");
  };

  const handleSwitchGraph = (type: "outline" | "network" | "tree" | "ring") => {
    setCurrentGraphType(type);
    setGraphZoom(100);
    const typeName = getTypeName(type);
    showToast(`已切换至${typeName}`);
    const currentName = getTypeName(currentGraphType);
    addLog("切换图谱", typeName, `从${currentName}切换到${typeName}`);
  };

  const handleNodeClick = (node: any) => {
    setSelectedSkillNode(node);
    const typeName = getTypeName(currentGraphType);
    addLog("查看技能", typeName, `查看 ${node.name} 技能详情`);
  };

  const handleNodeDragDrag = (nodeId: string, dx: number, dy: number) => {
      setSkillGraphData(prev => prev.map(n => {
         if (n.id === nodeId && n.pos) {
            return { ...n, pos: { x: n.pos.x + dx, y: n.pos.y + dy } };
         }
         return n;
      }));
  };

  const handleNodeDragEnd = (nodeId: string) => {
      const node = skillGraphData.find((n:any) => n.id === nodeId);
      const typeName = getTypeName(currentGraphType);
      if (node) addLog("拖拽节点", typeName, `移动 ${node.name} 节点位置`);
  };

  const handleHighlightWeak = () => {
    setHighlightWeakSkills(!highlightWeakSkills);
    const typeName = getTypeName(currentGraphType);
    if (!highlightWeakSkills) {
       addLog("高亮薄弱项", typeName, `高亮薄弱技能`);
       showToast("已高亮薄弱项");
    } else {
       addLog("取消高亮", typeName, `取消高亮薄弱技能`);
    }
  };

  const handleSaveView = () => {
    const typeName = getTypeName(currentGraphType);
    addLog("保存视图", typeName, `保存当前技能图谱视图`);
    showToast("当前视图已保存");
  };

  const handleAddPlan = () => {
    if (selectedSkillNode) {
       if (!improvementPlan.includes(selectedSkillNode.id)) {
           setImprovementPlan([...improvementPlan, selectedSkillNode.id]);
           const typeName = getTypeName(currentGraphType);
           addLog("加入计划", typeName, `将 ${selectedSkillNode.name} 加入提升计划`);
           showToast("已加入提升计划");
       } else {
           showToast("已在提升计划中");
       }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {graphToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#10A66A] text-white text-[11px] font-black px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4"/> {graphToast}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
         <h1 className="text-base font-black text-zinc-900">技能图谱分析</h1>
         <p className="text-xs text-zinc-500 font-semibold mt-1">通过网状图、树状图和环形图多维展示学生技能掌握情况、能力关联关系和薄弱能力点。</p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Left: Filters */}
          <div className="xl:w-64 shrink-0 bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col gap-4 h-fit">
             <h3 className="font-bold text-zinc-900 text-sm border-b border-zinc-100 pb-2">图谱数据筛选</h3>
             
             <div className="space-y-3">
                 <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">学生</label>
                    <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-[#10A66A]">
                       <option value="学生1">学生1</option>
                       <option value="学生2">学生2</option>
                    </select>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">课程</label>
                    <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-[#10A66A]">
                       <option value="Python基础与应用">Python基础与应用</option>
                       <option value="物联网开发应用">物联网开发应用</option>
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">分析范围</label>
                    <select value={analysisRange} onChange={e => setAnalysisRange(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-[#10A66A]">
                       <option value="全部技能">全部技能</option>
                       <option value="基础能力">基础能力</option>
                       <option value="编码能力">编码能力</option>
                       <option value="可视化能力">可视化能力</option>
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">时间范围</label>
                    <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-[#10A66A]">
                       <option value="近7天">近7天</option>
                       <option value="近30天">近30天</option>
                       <option value="本学期">本学期</option>
                       <option value="全部">全部</option>
                    </select>
                 </div>
             </div>

             <div className="flex flex-col gap-2 mt-2">
                 <button onClick={handleGenerateGraph} className="w-full bg-[#10A66A] hover:bg-[#0CA061] text-white py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 transition-colors shadow-sm">
                    <Search className="w-4 h-4"/> 生成技能图谱
                 </button>
                 <button onClick={handleRefreshAnalysis} className="w-full bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 transition-colors cursor-pointer">
                    刷新分析
                 </button>
                 <button onClick={() => showToast("已导出图谱数据")} className="w-full bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 transition-colors cursor-pointer">
                    导出图谱
                 </button>
             </div>
          </div>

          {/* Middle: Graph View */}
          <div className="flex-1 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col">
             
             {/* Graph Type & Controls */}
             <div className="flex flex-wrap items-center justify-between mb-4 pb-4 border-b border-zinc-100 gap-4">
                 
                 <div className="flex bg-zinc-100 p-1 rounded-lg">
                    <button 
                       onClick={() => handleSwitchGraph('outline')} 
                       className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${currentGraphType === 'outline' ? 'bg-white text-[#10A66A] shadow-xs' : 'text-zinc-600 hover:text-zinc-900'}`}
                    >
                       <List className="w-4 h-4"/> 大纲
                    </button>
                    <button 
                       onClick={() => handleSwitchGraph('tree')} 
                       className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${currentGraphType === 'tree' ? 'bg-white text-[#10A66A] shadow-xs' : 'text-zinc-600 hover:text-zinc-900'}`}
                    >
                       <GitMerge className="w-4 h-4 rotate-180"/> 树图
                    </button>
                    <button 
                       onClick={() => handleSwitchGraph('network')} 
                       className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${currentGraphType === 'network' ? 'bg-white text-[#10A66A] shadow-xs' : 'text-zinc-600 hover:text-zinc-900'}`}
                    >
                       <MapIcon className="w-4 h-4"/> 网图
                    </button>
                    <button 
                       onClick={() => handleSwitchGraph('ring')} 
                       className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${currentGraphType === 'ring' ? 'bg-white text-[#10A66A] shadow-xs' : 'text-zinc-600 hover:text-zinc-900'}`}
                    >
                       <PieChart className="w-4 h-4"/> 环形图
                    </button>
                 </div>

                 <div className="flex items-center gap-1.5">
                    <button onClick={() => setGraphZoom(z => z + 10)} className="w-7 h-7 flex flex-col justify-center items-center bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded text-zinc-600 cursor-pointer"><ZoomIn className="w-3.5 h-3.5"/></button>
                    <button onClick={() => setGraphZoom(z => Math.max(10, z - 10))} className="w-7 h-7 flex flex-col justify-center items-center bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded text-zinc-600 cursor-pointer"><ZoomOut className="w-3.5 h-3.5"/></button>
                    <button onClick={() => { setGraphZoom(100); setSkillGraphData(getInitialData()); showToast("已重置图谱和节点位置"); }} className="w-7 h-7 flex flex-col justify-center items-center bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded text-zinc-600 cursor-pointer" title="重置视图"><Maximize className="w-3.5 h-3.5"/></button>
                    <div className="w-px h-4 bg-zinc-200 mx-1"></div>
                    <button onClick={handleHighlightWeak} className={`h-7 px-2 flex justify-center items-center border rounded text-[11px] font-bold cursor-pointer transition-colors ${highlightWeakSkills ? 'bg-orange-100 border-orange-200 text-orange-600' : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-600'}`}><AlertCircle className="w-3.5 h-3.5 mr-1"/> 高亮薄弱项</button>
                    {currentGraphType === 'network' && (
                       <button onClick={() => setShowRelationLines(!showRelationLines)} className="h-7 px-2 flex justify-center items-center border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 rounded text-[11px] font-bold text-zinc-600 cursor-pointer">
                          {showRelationLines ? <EyeOff className="w-3.5 h-3.5 mr-1"/> : <Eye className="w-3.5 h-3.5 mr-1"/>}
                          {showRelationLines ? '隐藏关联线' : '显示关联线'}
                       </button>
                    )}
                    <button onClick={handleSaveView} className="h-7 px-2 flex justify-center items-center border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 rounded text-[11px] font-bold text-[#10A66A] cursor-pointer"><Save className="w-3.5 h-3.5 mr-1"/> 保存当前视图</button>
                 </div>
             </div>
             
             <div className="mb-2">
                 <h3 className="font-bold text-zinc-900 text-sm">
                    {currentGraphType === 'network' ? '技能网图' : currentGraphType === 'tree' ? '技能树图' : currentGraphType === 'outline' ? '技能大纲' : '技能环形图'}
                 </h3>
                 <p className="text-[11px] text-zinc-500 mt-0.5">
                    {currentGraphType === 'network' ? '展示技能之间的关联关系，支持拖拽节点，大小代表掌握度，连线表示技能依赖或关联强度。' : 
                     currentGraphType === 'tree' ? '按照课程知识结构展示技能层级，便于查看学生从基础到综合应用的能力路径。' : 
                     currentGraphType === 'outline' ? '技能节点列表查看和摘要分析' :
                     '通过环形层级展示学生各类技能掌握占比，内圈为技能大类，外圈为具体能力点。'}
                 </p>
             </div>

             {/* Graph Render Area */}
             <div className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden relative min-h-[400px]">
                
                {/* SVG/CSS Visualization Container */}
                <div 
                   className="absolute inset-0 flex items-center justify-center transition-transform duration-0 origin-center"
                   style={{ transform: `scale(${graphZoom / 100})` }}
                >
                   {currentGraphType === 'network' && <NetworkGraph key={graphRefreshKey} data={skillGraphData} selectedNode={selectedSkillNode} highlightWeak={highlightWeakSkills} showLines={showRelationLines} onNodeClick={handleNodeClick} onNodeDrag={handleNodeDragDrag} onNodeDragEnd={handleNodeDragEnd} zoom={graphZoom} />}
                   {currentGraphType === 'tree' && <TreeGraph key={graphRefreshKey} data={skillGraphData} selectedNode={selectedSkillNode} highlightWeak={highlightWeakSkills} onNodeClick={handleNodeClick} />}
                   {currentGraphType === 'ring' && <RingGraph key={graphRefreshKey} data={skillGraphData} selectedNode={selectedSkillNode} highlightWeak={highlightWeakSkills} onNodeClick={handleNodeClick} />}
                   {currentGraphType === 'outline' && <OutlineGraph key={graphRefreshKey} data={skillGraphData} selectedNode={selectedSkillNode} highlightWeak={highlightWeakSkills} onNodeClick={handleNodeClick} />}
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur border border-zinc-200 rounded-lg p-3 shadow-sm text-[10px] font-bold flex flex-col gap-2 pointer-events-none">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#10A66A]"></span> 掌握良好 (80%以上)</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-400"></span> 需要提升 (60%-79%)</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> 薄弱风险 (60%以下)</div>
                    {currentGraphType === 'network' && <div className="mt-1 pt-1 border-t border-zinc-100 text-zinc-500">节点大小: 练习次数/掌握度</div>}
                    {currentGraphType === 'network' && <div className="text-zinc-500">连线: 依赖关系</div>}
                </div>
             </div>

          </div>

          {/* Right: Details & Summary */}
          <div className="xl:w-72 shrink-0 flex flex-col gap-4">
             
             {/* AI Summary Card */}
             <div className="bg-white border text-white border-zinc-200 rounded-xl p-5 shadow-sm overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#10A66A] rounded-bl-full opacity-10"></div>
                 <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5 mb-3"><Activity className="w-4 h-4 text-[#10A66A]"/> AI分析摘要</h3>
                 
                 <div className="mb-4 text-center">
                    <div className="text-3xl font-black text-[#10A66A]">{aiAnalysisSummary.score}<span className="text-xs text-zinc-500 font-bold ml-1">分</span></div>
                    <div className="text-[10px] uppercase font-bold bg-[#EAF8F1] text-[#10A66A] inline-block px-2 py-0.5 rounded mt-1">综合技能评分</div>
                 </div>

                 <div className="space-y-3">
                    <div>
                       <div className="text-[10px] font-bold text-zinc-500 mb-1">优势技能</div>
                       <div className="flex flex-wrap gap-1">
                          {aiAnalysisSummary.adv.split("、").map((k) => (
                             <span key={k} className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">{k}</span>
                          ))}
                       </div>
                    </div>
                    <div>
                       <div className="text-[10px] font-bold text-zinc-500 mb-1">薄弱技能</div>
                       <div className="flex flex-wrap gap-1">
                          {aiAnalysisSummary.weak.split("、").map((k) => (
                             <span key={k} className="text-[10px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">{k}</span>
                          ))}
                       </div>
                    </div>
                    <div className="text-xs text-zinc-700 leading-relaxed font-medium bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                       <span className="font-bold text-red-500 mr-1">风险提示:</span>
                       {aiAnalysisSummary.risk}
                    </div>
                    <div className="text-xs text-zinc-700 leading-relaxed font-medium bg-blue-50 p-2 rounded-lg border border-blue-100">
                       <span className="font-bold text-blue-600 mr-1">推荐路径:</span>
                       {aiAnalysisSummary.path}
                    </div>
                 </div>
             </div>

             {/* Node Detail Card */}
             <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex-1 flex flex-col">
                 <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5 mb-3 pb-3 border-b border-zinc-100"><FileText className="w-4 h-4 text-[#10A66A]"/> 技能详情</h3>
                 
                 {!selectedSkillNode ? (
                    <div className="flex-1 flex items-center justify-center text-center text-xs text-zinc-400 font-bold p-6">
                       请在左侧图谱中选择技能节点查看详情。
                    </div>
                 ) : (
                    <div className="space-y-4 animate-in fade-in duration-200 overflow-y-auto pr-1">
                       <div className="flex items-center justify-between">
                           <div className="font-black text-base text-zinc-900">{selectedSkillNode.name}</div>
                           <div className="text-[10px] font-bold bg-[#EAF8F1] text-[#10A66A] px-2 py-0.5 rounded">{selectedSkillNode.category}</div>
                       </div>

                       <div className="grid grid-cols-2 gap-2">
                           <div className="bg-zinc-50 p-2 rounded-lg text-center">
                              <div className="text-[10px] font-bold text-zinc-500 mb-0.5">掌握度</div>
                              <div className={`text-lg font-black ${selectedSkillNode.mastery >= 80 ? 'text-[#10A66A]' : selectedSkillNode.mastery >= 60 ? 'text-orange-500' : 'text-red-500'}`}>{selectedSkillNode.mastery}%</div>
                           </div>
                           <div className="bg-zinc-50 p-2 rounded-lg text-center">
                              <div className="text-[10px] font-bold text-zinc-500 mb-0.5">练习次数</div>
                              <div className="text-lg font-black text-zinc-800">{selectedSkillNode.practiceCount || 0}次</div>
                           </div>
                       </div>

                       <div className="space-y-2 text-xs">
                           <div className="flex items-start justify-between py-1 border-b border-zinc-50">
                              <span className="text-zinc-500 font-bold">风险等级</span>
                              <span className={`font-black ${selectedSkillNode.risk==='高' ? 'text-red-500' : selectedSkillNode.risk==='中' ? 'text-orange-500' : 'text-[#10A66A]'}`}>{selectedSkillNode.risk || '低'}</span>
                           </div>
                           <div className="flex items-start justify-between py-1 border-b border-zinc-50">
                              <span className="text-zinc-500 font-bold">最近成绩</span>
                              <span className="font-bold text-zinc-800">{selectedSkillNode.score || '-'}分</span>
                           </div>
                           <div className="flex flex-col py-1 border-b border-zinc-50 gap-1 mt-1">
                              <span className="text-zinc-500 font-bold">关联课程</span>
                              <span className="font-medium text-zinc-800">{selectedSkillNode.course || '-'}</span>
                           </div>
                           <div className="flex flex-col py-1 gap-1">
                              <span className="text-zinc-500 font-bold">关联实验</span>
                              <span className="font-medium text-zinc-800">{selectedSkillNode.experiment || '-'}</span>
                           </div>
                       </div>

                       <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                           <div className="text-[10px] font-bold text-amber-600 mb-1">AI分析结论</div>
                           <div className="text-xs text-amber-800 font-medium leading-relaxed">
                              {selectedSkillNode.name === 'pyecharts' ? '该学生对 pyecharts 图表组件和组合图表配置掌握不足，交互图表设计能力较弱。' : 
                               `学生在【${selectedSkillNode.name}】上的表现一般，有进一步提升的空间。`}
                           </div>
                       </div>
                       
                       <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-2">
                           <div className="text-[10px] font-bold text-blue-600 mb-1">提升建议</div>
                           <div className="text-xs text-blue-800 font-medium leading-relaxed">
                              {selectedSkillNode.suggestion || '建议多进行相关题目的练习。'}
                           </div>
                           {selectedSkillNode.name === 'pyecharts' && (
                              <div className="mt-2 text-xs font-bold text-blue-900 border-t border-blue-100 pt-2">
                                 <div>推荐任务:</div>
                                 <ol className="list-decimal pl-4 mt-1 font-medium space-y-0.5">
                                    <li>pyecharts折线图训练</li>
                                    <li>pyecharts柱状图训练</li>
                                    <li>组合图表报告实训</li>
                                 </ol>
                              </div>
                           )}
                       </div>

                       <div className="flex flex-col gap-2 pt-2">
                           {improvementPlan.includes(selectedSkillNode.id) ? (
                              <button disabled className="w-full bg-[#EAF8F1] text-[#10A66A] py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 cursor-not-allowed">
                                  <CheckCircle className="w-4 h-4"/> 已加入提升计划
                              </button>
                           ) : (
                              <button onClick={handleAddPlan} className="w-full bg-[#10A66A] hover:bg-[#0CA061] text-white py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-[#10A66A]/20">
                                  <PlusCircle className="w-4 h-4"/> 加入提升计划
                              </button>
                           )}
                           <div className="flex gap-2">
                              <button className="flex-1 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer">查看关联实验</button>
                              <button className="flex-1 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer">生成专项建议</button>
                           </div>
                       </div>
                    </div>
                 )}
             </div>

          </div>
      </div>

      {/* Operation Logs */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col h-64 mt-2">
         <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5 mb-4"><ListChecks className="w-4 h-4 text-[#10A66A]"/> 图谱操作日志</h3>
         <div className="flex-1 overflow-y-auto">
             <table className="w-full text-left text-[11px]">
                 <thead className="bg-zinc-50 text-zinc-500 font-bold sticky top-0">
                     <tr>
                         <th className="p-2 border-b border-zinc-100 w-24">时间</th>
                         <th className="p-2 border-b border-zinc-100 w-32">操作类型</th>
                         <th className="p-2 border-b border-zinc-100 w-24">图谱类型</th>
                         <th className="p-2 border-b border-zinc-100">操作内容</th>
                         <th className="p-2 border-b border-zinc-100 w-20">结果</th>
                         <th className="p-2 border-b border-zinc-100 w-20">操作人</th>
                     </tr>
                 </thead>
                 <tbody className="text-zinc-700 font-medium">
                     {graphOperationLogs.map((log, i) => (
                         <tr key={i} className="hover:bg-zinc-50 border-b border-zinc-100/50 last:border-0 pointer-events-none">
                             <td className="p-2 font-mono text-zinc-500">{log.time}</td>
                             <td className="p-2 font-bold text-zinc-800">{log.type}</td>
                             <td className="p-2"><span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-bold">{log.graph}</span></td>
                             <td className="p-2 truncate" title={log.content}>{log.content}</td>
                             <td className="p-2"><span className="bg-[#EAF8F1] text-[#10A66A] px-1.5 py-0.5 rounded text-[9px] font-black">{log.result}</span></td>
                             <td className="p-2">{log.user}</td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      </div>

    </div>
  );
}


// Subcomponents for visual graphs
function getColor(mastery: number) {
  if (mastery >= 80) return '#10A66A'; // Green
  if (mastery >= 60) return '#F97316'; // Orange
  return '#EF4444'; // Red
}

function NetworkGraph({ data, selectedNode, highlightWeak, showLines, onNodeClick, onNodeDrag, onNodeDragEnd, zoom }: any) {
  const root = data.find((d:any) => d.id === 'root');
  const cats = data.filter((d:any) => d.parent === 'root');
  const skills = data.filter((d:any) => d.parent && d.parent !== 'root');

  const nx = (id: string) => data.find((x:any) => x.id === id)?.pos?.x || 400;
  const ny = (id: string) => data.find((x:any) => x.id === id)?.pos?.y || 300;

  const isHighlighted = (node: any) => {
     if (!highlightWeak) return false;
     if (!node.mastery) return false;
     return node.mastery < 70;
  };

  const isFaded = (node: any) => {
     if (!highlightWeak) return false;
     return node.mastery >= 70;
  };

  const [draggedNode, setDraggedNode] = React.useState<string|null>(null);

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.target.setPointerCapture(e.pointerId);
    setDraggedNode(id);
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggedNode) {
       onNodeDrag(draggedNode, e.movementX / (zoom / 100), e.movementY / (zoom / 100));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggedNode) {
       e.target.releasePointerCapture(e.pointerId);
       setDraggedNode(null);
       onNodeDragEnd(draggedNode);
    }
  };

  return (
     <svg 
         width="800" 
         height="600" 
         className="stroke-zinc-300 pointer-events-auto"
         onPointerMove={handlePointerMove}
         onPointerUp={handlePointerUp}
     >
        {/* Draw lines first */}
        {showLines && cats.map((c:any) => (
           <line key={`line-root-${c.id}`} x1={nx('root')} y1={ny('root')} x2={nx(c.id)} y2={ny(c.id)} strokeWidth="2" strokeDasharray="4" className={isFaded(c) ? 'opacity-20 transition-opacity' : 'opacity-60 transition-opacity'} />
        ))}
        {showLines && skills.map((s:any) => {
           return <line key={`line-cat-${s.id}`} x1={nx(s.parent)} y1={ny(s.parent)} x2={nx(s.id)} y2={ny(s.id)} strokeWidth="1.5" className={isFaded(s) ? 'opacity-20 transition-opacity' : 'opacity-60 transition-opacity'} />;
        })}

        {/* Root Node */}
        {root && (
            <g transform={`translate(${nx('root')}, ${ny('root')})`} 
               onPointerDown={(e) => handlePointerDown(e, 'root')}
               className="cursor-move"
            >
            <circle r="40" fill="#fff" stroke="#10A66A" strokeWidth="3" className="shadow-sm" />
            <text textAnchor="middle" dy="4" className="text-[12px] font-black fill-zinc-800 pointer-events-none select-none">Python综合</text>
            <text textAnchor="middle" dy="18" className="text-[9px] font-bold fill-[#10A66A] pointer-events-none select-none">{root.mastery}%</text>
            </g>
        )}

        {/* Category Nodes */}
        {cats.map((c:any) => (
           <g key={c.id} transform={`translate(${nx(c.id)}, ${ny(c.id)})`} 
              className={`transition-opacity duration-300 cursor-move ${isFaded(c) ? 'opacity-30' : 'opacity-100'}`}
              onPointerDown={(e) => handlePointerDown(e, c.id)}
           >
              <circle r="30" fill="#fff" stroke={getColor(c.mastery)} strokeWidth="2" />
              <text textAnchor="middle" dy="3" className="text-[10px] font-bold fill-zinc-700 pointer-events-none select-none">{c.name}</text>
              <text textAnchor="middle" dy="14" className="text-[8px] font-bold fill-zinc-500 pointer-events-none select-none">{c.mastery}%</text>
           </g>
        ))}

        {/* Skill Nodes */}
        {skills.map((s:any) => {
           const hoveredOrSelected = selectedNode?.id === s.id;
           const hl = isHighlighted(s);
           const fd = isFaded(s);
           const rad = Math.max(16, Math.min(28, (s.mastery / 100) * 20 + 8)); // visual scaling based on mastery/practice
           
           return (
              <g 
                key={s.id} 
                transform={`translate(${nx(s.id)}, ${ny(s.id)})`} 
                onPointerDown={(e) => { handlePointerDown(e, s.id); onNodeClick(s); }}
                className={`cursor-move transition-opacity duration-300 ${fd ? 'opacity-30' : 'opacity-100'}`}
              >
                 {hoveredOrSelected && <circle r={rad+6} fill="none" stroke={hl ? '#F97316' : '#10A66A'} strokeWidth="2" className="animate-pulse" />}
                 <circle r={rad} fill={hl ? '#FFF7ED' : '#fff'} stroke={getColor(s.mastery)} strokeWidth={hoveredOrSelected || hl ? '3' : '2'} className="hover:shadow-lg transition-all" />
                 <text textAnchor="middle" dy="3" className={`text-[9px] font-bold ${hl ? 'fill-orange-600' : 'fill-zinc-800'} pointer-events-none select-none`}>{s.name}</text>
                 <text textAnchor="middle" dy="14" className="text-[8px] font-bold fill-zinc-500 pointer-events-none select-none">{s.mastery}%</text>
                 
                 <title>{s.name}&#10;掌握度: {s.mastery}%&#10;练习: {s.practiceCount}次</title>
              </g>
           )
        })}
     </svg>
  );
}

function OutlineGraph({ data, selectedNode, highlightWeak, onNodeClick }: any) {
  const cats = data.filter((d:any) => d.parent === 'root');

  return (
      <div className="p-6 h-full w-full overflow-y-auto space-y-4 max-h-[600px] flex flex-col items-center">
         <div className="w-full max-w-4xl space-y-4">
             {cats.map((c:any) => {
                const skills = data.filter((d:any) => d.parent === c.id);
                return (
                   <div key={c.id} className="bg-white border text-zinc-900 border-zinc-200 rounded-lg p-4 shadow-sm w-full animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-100">
                         <div className="font-bold text-sm text-zinc-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{backgroundColor: getColor(c.mastery)}}></span>
                            {c.name}
                         </div>
                         <div className="text-[11px] font-black" style={{color: getColor(c.mastery)}}>掌握度：{c.mastery}%</div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 z-10 w-full">
                         {skills.map((s:any) => {
                            const isWk = highlightWeak && s.mastery < 70;
                            const sel = selectedNode?.id === s.id;
                            return (
                               <div 
                                  key={s.id}
                                  onClick={() => onNodeClick(s)}
                                  className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between items-start gap-2 shadow-xs hover:shadow-sm ${sel ? 'ring-2 ring-offset-1 ring-[#10A66A]' : ''} ${isWk ? 'bg-orange-50 border-orange-200' : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200'}`}
                               >
                                  <span className={`text-xs font-bold truncate w-full ${isWk ? 'text-orange-700' : 'text-zinc-700'}`}>{s.name}</span>
                                  <div className="flex w-full justify-between items-center">
                                     <span className="text-[10px] text-zinc-500 font-medium">练习 {s.practiceCount} 次</span>
                                     <span className="text-[11px] font-black" style={{color: getColor(s.mastery)}}>{s.mastery}%</span>
                                  </div>
                               </div>
                            )
                         })}
                      </div>
                   </div>
                )
             })}
         </div>
      </div>
  )
}

function TreeGraph({ data, selectedNode, highlightWeak, onNodeClick }: any) {
  // Simple CSS driven flex tree layout 
  const root = data.find((d:any) => d.id === 'root');
  const cats = data.filter((d:any) => d.parent === 'root');
  
  const isWeak = (n:any) => highlightWeak && n.mastery < 70;
  
  const [expandedCats, setExpandedCats] = React.useState<string[]>(cats.map((c:any) => c.id));

  const toggleCat = (id: string) => {
     if (expandedCats.includes(id)) setExpandedCats(expandedCats.filter(cid => cid !== id));
     else setExpandedCats([...expandedCats, id]);
  };
  
  return (
     <div className="flex flex-col items-center justify-center p-8 w-full h-full min-w-[800px]">
        {/* Root */}
        <div className="bg-white border-2 border-[#10A66A] rounded-xl px-6 py-3 font-black text-sm text-zinc-800 shadow-md z-10 relative">
            {root.name} <span className="text-[#10A66A] ml-2">{root.mastery}%</span>
            <div className="absolute w-px h-6 bg-zinc-300 left-1/2 -bottom-6"></div>
        </div>
        
        {/* Horizontal Connector */}
        <div className="h-6 mt-6 border-t-2 border-zinc-300 relative w-[90%] flex justify-between z-0">
             {cats.map((c:any) => (
                <div key={`h-c-${c.id}`} className="relative flex flex-col items-center w-48">
                    <div className="absolute w-px h-6 bg-zinc-300 left-1/2 -top-6"></div>
                </div>
             ))}
        </div>

        {/* Categories row */}
        <div className="flex w-[90%] justify-between -mt-2">
            {cats.map((c:any) => {
               const skills = data.filter((d:any) => d.parent === c.id);
               const isExpanded = expandedCats.includes(c.id);
               return (
                  <div key={c.id} className="flex flex-col items-center w-48 transition-all">
                      {/* Cat Node */}
                      <div 
                         onClick={() => toggleCat(c.id)}
                         className="bg-white border cursor-pointer hover:border-[#10A66A] border-zinc-300 rounded-lg px-4 py-2 font-bold text-xs text-zinc-700 shadow-sm z-10 relative w-32 text-center mb-6 transition-all"
                      >
                         <div className="flex justify-between items-center">
                            <span>{c.name}</span>
                            <span className="text-zinc-400 text-[10px] w-4">{isExpanded ? '-' : '+'}</span>
                         </div>
                         {isExpanded && <div className="absolute w-px h-6 bg-zinc-200 left-1/2 -bottom-6"></div>}
                      </div>
                      
                      {/* Skills Dropdown */}
                      {isExpanded && (
                          <div className="flex flex-col gap-3 relative w-full items-center animate-in slide-in-from-top-2 duration-200">
                              <div className="absolute w-px h-full bg-zinc-200 left-1/2 z-0 -top-2"></div>
                              {skills.map((s:any) => {
                                  const sel = selectedNode?.id === s.id;
                                  const wk = isWeak(s);
                                  return (
                                    <div 
                                       key={s.id}
                                       onClick={() => onNodeClick(s)}
                                       className={`relative z-10 bg-white border-2 rounded-lg px-3 py-1.5 w-36 text-center cursor-pointer transition-all hover:shadow-md ${sel ? 'ring-2 ring-offset-1 ring-[#10A66A]' : ''} ${wk ? 'border-orange-400 bg-orange-50' : 'border-zinc-200'}`}
                                       style={{ borderColor: !wk ? getColor(s.mastery) : undefined }}
                                    >
                                       <div className={`text-[10px] font-bold ${wk ? 'text-orange-700' : 'text-zinc-800'}`}>{s.name}</div>
                                       <div className="flex justify-between items-center mt-1">
                                          <span className="text-[9px] text-zinc-500">{s.mastery}%</span>
                                          {s.mastery >= 80 ? <CheckCircle2 className="w-3 h-3 text-[#10A66A]"/> : wk ? <AlertCircle className="w-3 h-3 text-orange-500"/> : null}
                                       </div>
                                    </div>
                                  )
                              })}
                          </div>
                      )}
                  </div>
               )
            })}
        </div>
     </div>
  )
}

function RingGraph({ data, selectedNode, highlightWeak, onNodeClick }: any) {
  // Using pure SVG paths for donut rings
  const cats = data.filter((d:any) => d.parent === 'root');
  const skills = data.filter((d:any) => d.parent && d.parent !== 'root');
  const cx = 400;
  const cy = 300;
  
  const [activeCat, setActiveCat] = React.useState<string | null>(null);

  // Render arc helper
  const createArc = (x:number, y:number, rInner:number, rOuter:number, startAngle:number, endAngle:number) => {
     // SVG uses angles where 0 is east. Let's shift by -Math.PI/2 to start at north.
     const s = startAngle - Math.PI/2;
     const e = endAngle - Math.PI/2;
     
     const x1 = x + Math.cos(s) * rInner;
     const y1 = y + Math.sin(s) * rInner;
     const x2 = x + Math.cos(s) * rOuter;
     const y2 = y + Math.sin(s) * rOuter;
     const x3 = x + Math.cos(e) * rOuter;
     const y3 = y + Math.sin(e) * rOuter;
     const x4 = x + Math.cos(e) * rInner;
     const y4 = y + Math.sin(e) * rInner;
     
     const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
     
     return [
       `M ${x1} ${y1}`,
       `L ${x2} ${y2}`,
       `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
       `L ${x4} ${y4}`,
       `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
       'Z'
     ].join(' ');
  };

  const catAngles = new Map();
  let currentAngle = 0;
  
  return (
      <svg width="800" height="600">
         {/* Center */}
         <g transform={`translate(${cx}, ${cy})`}>
            <circle r="70" fill="#fff" className="shadow-lg drop-shadow-md"/>
            <text textAnchor="middle" dy="-5" className="text-[10px] font-bold fill-zinc-400">综合评分</text>
            <text textAnchor="middle" dy="25" className="text-4xl font-black fill-[#10A66A]">82</text>
         </g>

         {/* Inner Ring (Categories) */}
         <g>
            {cats.map((c:any, i:number) => {
               const sliceAngle = (Math.PI * 2) / cats.length;
               const start = currentAngle;
               const end = start + sliceAngle;
               const mid = start + sliceAngle/2 - Math.PI/2;
               
               const arcPath = createArc(cx, cy, 80, 140, start, end);
               
               catAngles.set(c.id, { start, end, sliceAngle });
               currentAngle = end;

               const tx = cx + Math.cos(mid) * 110;
               const ty = cy + Math.sin(mid) * 110;

               const isFaded = activeCat && activeCat !== c.id;

               return (
                 <g 
                   key={`ring-cat-${c.id}`} 
                   onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
                   className={`cursor-pointer transition-opacity duration-300 ${isFaded ? 'opacity-30' : 'opacity-90 hover:opacity-100'}`}
                 >
                    <path d={arcPath} fill={getColor(c.mastery)} className="stroke-white stroke-[2px]" />
                    <text x={tx} y={ty} textAnchor="middle" dy="4" className="text-[10px] font-bold fill-white pointer-events-none">{c.name}</text>
                 </g>
               )
            })}
         </g>

         {/* Outer Ring (Skills) */}
         <g>
            {cats.map((c:any) => {
                const cSkills = skills.filter((s:any) => s.parent === c.id);
                const { start, sliceAngle } = catAngles.get(c.id) || {start:0, sliceAngle:0};
                
                let curSkillStart = start;
                const skillSlice = sliceAngle / cSkills.length;
                const isCatFaded = activeCat && activeCat !== c.id;
                
                return cSkills.map((s:any) => {
                   const sEnd = curSkillStart + skillSlice;
                   const smid = curSkillStart + skillSlice/2 - Math.PI/2;
                   const arcPath = createArc(cx, cy, 145, 220, curSkillStart, sEnd);
                   curSkillStart = sEnd;

                   const sel = selectedNode?.id === s.id;
                   const wk = highlightWeak && s.mastery < 70;
                   const fd = (highlightWeak && s.mastery >= 70) || (activeCat && activeCat !== c.id);

                   const tx = cx + Math.cos(smid) * 182;
                   const ty = cy + Math.sin(smid) * 182;
                   
                   return (
                     <g 
                       key={`ring-skill-${s.id}`} 
                       className={`cursor-pointer transition-opacity duration-300 ${fd ? 'opacity-20' : 'opacity-100 hover:opacity-80'}`}
                       onClick={() => onNodeClick(s)}
                     >
                        <path 
                           d={arcPath} 
                           fill={wk ? '#FB923C' : getColor(s.mastery)} 
                           className={`stroke-white ${sel ? 'stroke-[4px]' : 'stroke-[2px]'}`}
                           opacity={0.8}
                        />
                        <text x={tx} y={ty} textAnchor="middle" dy="4" className="text-[9px] font-bold fill-white pointer-events-none drop-shadow-md">{s.name}</text>
                     </g>
                   )
                });
            })}
         </g>
      </svg>
  )
}
