import React, { useState } from "react";
import { Search, ChevronRight, CheckCircle2, AlertCircle, FileText, Info, Download, X, ChevronDown } from "lucide-react";

export function ExamResults() {
  const [examName, setExamName] = useState("全部");
  const [session, setSession] = useState("全部");
  const [className, setClassName] = useState("全部");
  const [status, setStatus] = useState("全部");
  const [searchKey, setSearchKey] = useState("");
  const [viewingResult, setViewingResult] = useState<any>(null);
  const [exportModal, setExportModal] = useState<"overall" | "session" | null>(null);
  const [exportSession, setExportSession] = useState("第一场");
  const [exportFormat, setExportFormat] = useState("Excel");
  const [exportRecords, setExportRecords] = useState<any[]>([]);
  const currentUserRole = "教师"; // Mock role to control visibility

  const [reviewModal, setReviewModal] = useState<any>(null);
  const [reviewScore, setReviewScore] = useState<string>("");
  const [reviewComment, setReviewComment] = useState("");


  const [results, setResults] = useState([

    {
      id: "1",
      studentName: "学生1",
      studentId: "20230101",
      className: "物联网2301班",
      examName: "物联网设备接入能力测评",
      session: "第一场",
      objectiveScore: 45,
      practicalScore: 35,
      subjectiveScore: 10,
      totalScore: 90,
      pass: true,
      status: "已批阅",
    },
    {
      id: "2",
      studentName: "学生2",
      studentId: "20230102",
      className: "物联网2301班",
      examName: "物联网设备接入能力测评",
      session: "第一场",
      objectiveScore: 42,
      practicalScore: 30,
      subjectiveScore: null,
      totalScore: 72,
      pass: false,
      status: "待人工批阅",
    },
    {
      id: "3",
      studentName: "学生3",
      studentId: "20230103",
      className: "物联网2301班",
      examName: "物联网设备接入能力测评",
      session: "第一场",
      objectiveScore: 38,
      practicalScore: 28,
      subjectiveScore: 8,
      totalScore: 74,
      pass: true,
      status: "已自动评分",
    },
    {
      id: "4",
      studentName: "学生4",
      studentId: "20230104",
      className: "物联网2301班",
      examName: "物联网设备接入能力测评",
      session: "第一场",
      objectiveScore: 30,
      practicalScore: 18,
      subjectiveScore: null,
      totalScore: 48,
      pass: false,
      status: "待人工批阅",
    },
    {
      id: "5",
      studentName: "学生5",
      studentId: "20230201",
      className: "物联网2302班",
      examName: "物联网设备接入能力测评",
      session: "第二场",
      objectiveScore: 35,
      practicalScore: 32,
      subjectiveScore: 8,
      totalScore: 75,
      pass: true,
      status: "已自动评分",
    },
    {
      id: "6",
      studentName: "学生6",
      studentId: "20230301",
      className: "工业互联网2301班",
      examName: "物联网设备接入能力测评",
      session: "第三场",
      objectiveScore: 28,
      practicalScore: 20,
      subjectiveScore: 5,
      totalScore: 53,
      pass: false,
      status: "已批阅",
    }
  ]);

  if (viewingResult) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 flex gap-6">
        <div className="flex-1">
           <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
             <div>
               <h3 className="text-xl font-black text-zinc-900">考试结果详情</h3>
               <p className="text-xs font-bold text-zinc-500 mt-1">
                 学生姓名：<strong className="text-zinc-800">{viewingResult.studentName}</strong> ｜ 学号：<strong className="text-zinc-800">{viewingResult.studentId}</strong>
               </p>
             </div>
             <button onClick={() => setViewingResult(null)} className="text-xs font-black text-zinc-400 hover:text-zinc-600">
               返回列表
             </button>
           </div>
           
           <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
               <span className="text-[10px] uppercase font-black text-zinc-400">考试信息</span>
               <div className="mt-2 space-y-1 text-xs font-bold text-zinc-700">
                 <p>考试名称：{viewingResult.examName}</p>
                 <p>考试场次：{viewingResult.session}</p>
                 <p>试卷名称：物联网设备接入理论试卷A</p>
                 <p>交卷时间：2026-06-10 10:48</p>
               </div>
             </div>
             <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#10A66A]/20">
               <span className="text-[10px] uppercase font-black text-[#10A66A]">成绩统计</span>
               <div className="mt-2 flex items-center justify-between">
                 <div>
                   <p className="text-xs font-bold text-zinc-600">总分 / 及格分数</p>
                   <p className="text-2xl font-black text-[#10A66A]">{viewingResult.totalScore} <span className="text-sm text-zinc-500">/ 60</span></p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs font-bold text-zinc-600">得分构成</p>
                   <p className="text-xs font-bold text-zinc-500 mt-1">客观题：{viewingResult.objectiveScore} / 50</p>
                   <p className="text-xs font-bold text-zinc-500">实操题：{viewingResult.practicalScore} / 40</p>
                   <p className="text-xs font-bold text-zinc-500">主观题：{viewingResult.subjectiveScore !== null ? viewingResult.subjectiveScore : "--"} / 10</p>
                 </div>
               </div>
             </div>
           </div>

           <h4 className="text-sm font-black text-zinc-900 mb-4 flex items-center gap-2">
             <CheckCircle2 className="w-4 h-4 text-[#10A66A]"/>
             客观题自动评分明细 (标识：系统自动评分)
           </h4>
           <div className="border border-zinc-200 rounded-xl overflow-hidden mb-6">
             <table className="w-full text-left">
               <thead className="bg-[#F8FAF9] border-b border-zinc-200">
                 <tr className="text-[10px] font-black text-zinc-500 uppercase">
                   <th className="p-3 pl-4">题号</th>
                   <th className="p-3">题型</th>
                   <th className="p-3 w-1/3">题干摘要</th>
                   <th className="p-3">学生答案</th>
                   <th className="p-3">标准答案</th>
                   <th className="p-3">分值</th>
                   <th className="p-3">得分</th>
                   <th className="p-3 pr-4">判分结果</th>
                 </tr>
               </thead>
               <tbody>
                 <tr className="border-b border-zinc-100 text-xs font-bold text-zinc-700">
                   <td className="p-3 pl-4 text-zinc-400">1</td>
                   <td className="p-3 text-[#10A66A]">单选题</td>
                   <td className="p-3 truncate max-w-[200px]">MQTT协议中负责消息转发的组件是？</td>
                   <td className="p-3">C</td>
                   <td className="p-3">C</td>
                   <td className="p-3">5分</td>
                   <td className="p-3 text-[#10A66A]">5分</td>
                   <td className="p-3 text-[#10A66A]">正确</td>
                 </tr>
                 <tr className="border-b border-zinc-100 text-xs font-bold text-zinc-700">
                   <td className="p-3 pl-4 text-zinc-400">2</td>
                   <td className="p-3 text-[#10A66A]">判断题</td>
                   <td className="p-3 truncate max-w-[200px]">设备物模型用于描述设备属性、事件和服务。</td>
                   <td className="p-3">正确</td>
                   <td className="p-3">正确</td>
                   <td className="p-3">3分</td>
                   <td className="p-3 text-[#10A66A]">3分</td>
                   <td className="p-3 text-[#10A66A]">正确</td>
                 </tr>
                 <tr className="border-b border-zinc-100 text-xs font-bold text-zinc-700">
                   <td className="p-3 pl-4 text-zinc-400">3</td>
                   <td className="p-3 text-[#10A66A]">多选题</td>
                   <td className="p-3 truncate max-w-[200px]">设备接入平台通常需要配置哪些内容？</td>
                   <td className="p-3">A、C</td>
                   <td className="p-3">A、C、D</td>
                   <td className="p-3">8分</td>
                   <td className="p-3 text-amber-500">5分</td>
                   <td className="p-3 text-amber-500">部分得分</td>
                 </tr>
               </tbody>
             </table>
           </div>

           <div className="mb-4">
             <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2">
               <FileText className="w-4 h-4 text-[#10A66A]"/> 
               实操题自动评分
             </h4>
             <p className="text-xs font-bold text-zinc-500 mt-1">
               系统根据实验环境操作记录、关键步骤完成情况和提交结果自动生成实操评分。
             </p>
           </div>
           
           <div className="border border-zinc-200 rounded-xl overflow-hidden mb-6">
             <table className="w-full text-left">
               <thead className="bg-[#F8FAF9] border-b border-zinc-200">
                 <tr className="text-[10px] font-black text-zinc-500 uppercase">
                   <th className="p-3 pl-4">评分项</th>
                   <th className="p-3 w-1/4">检测依据</th>
                   <th className="p-3">分值</th>
                   <th className="p-3">自动得分</th>
                   <th className="p-3">完成状态</th>
                   <th className="p-3 pr-4 w-1/4">评分说明</th>
                 </tr>
               </thead>
               <tbody>
                 <tr className="border-b border-zinc-100 text-xs font-bold text-zinc-700">
                   <td className="p-3 pl-4">设备创建与配置</td>
                   <td className="p-3 text-zinc-500">检测到设备创建记录和密钥配置</td>
                   <td className="p-3">10分</td>
                   <td className="p-3 text-[#10A66A]">10分</td>
                   <td className="p-3 text-[#10A66A]">已完成</td>
                   <td className="p-3 text-zinc-500">设备创建成功，参数完整</td>
                 </tr>
                 <tr className="border-b border-zinc-100 text-xs font-bold text-zinc-700">
                   <td className="p-3 pl-4">物模型配置</td>
                   <td className="p-3 text-zinc-500">检测到属性、事件、服务配置记录</td>
                   <td className="p-3">10分</td>
                   <td className="p-3 text-amber-500">8分</td>
                   <td className="p-3 text-amber-500">部分完成</td>
                   <td className="p-3 text-zinc-500">属性配置完整，事件配置缺失</td>
                 </tr>
                 <tr className="border-b border-zinc-100 text-xs font-bold text-zinc-700">
                   <td className="p-3 pl-4">通信参数配置</td>
                   <td className="p-3 text-zinc-500">检测到 MQTT Topic 与 Broker 配置</td>
                   <td className="p-3">10分</td>
                   <td className="p-3 text-[#10A66A]">10分</td>
                   <td className="p-3 text-[#10A66A]">已完成</td>
                   <td className="p-3 text-zinc-500">通信参数正确</td>
                 </tr>
                 <tr className="border-b border-zinc-100 text-xs font-bold text-zinc-700">
                   <td className="p-3 pl-4">数据采集与上报</td>
                   <td className="p-3 text-zinc-500">检测到传感器数据上报记录</td>
                   <td className="p-3">20分</td>
                   <td className="p-3 text-amber-500">17分</td>
                   <td className="p-3 text-amber-500">部分完成</td>
                   <td className="p-3 text-zinc-500">数据成功上报，但存在一次异常重试</td>
                 </tr>
                 <tr className="border-b border-zinc-100 text-xs font-bold text-zinc-700">
                   <td className="p-3 pl-4">实验报告提交</td>
                   <td className="p-3 text-zinc-500">检测到实验报告提交记录</td>
                   <td className="p-3">10分</td>
                   <td className="p-3 text-[#10A66A]">10分</td>
                   <td className="p-3 text-[#10A66A]">已完成</td>
                   <td className="p-3 text-zinc-500">报告已提交</td>
                 </tr>
               </tbody>
             </table>
           </div>

        </div>

        <div className="w-80 shrink-0">
           <div className="sticky top-6">
             <h4 className="text-sm font-black text-zinc-900 mb-4 tracking-tight">自动评分状态</h4>
             <div className="bg-[#F8FAF9] border border-zinc-200 rounded-xl p-5 space-y-4">
                <div>
                   <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">客观题自动评分</span>
                   <span className="text-xs font-bold text-[#10A66A] flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> 已完成</span>
                </div>
                <div>
                   <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">实操题自动评分</span>
                   <span className="text-xs font-bold text-[#10A66A] flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> 已完成</span>
                </div>
                <div>
                   <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">主观题批阅</span>
                   <span className={`text-xs font-bold ${viewingResult.status === "已批阅" ? "text-[#10A66A]" : "text-amber-500"}`}>{viewingResult.status}</span>
                </div>
                <div>
                   <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">是否通过</span>
                   <span className={`text-xs font-bold ${viewingResult.pass ? "text-[#10A66A]" : "text-red-500"}`}>{viewingResult.pass ? "通过" : "未通过"}</span>
                </div>
                <div>
                   <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">复核状态</span>
                   <span className="text-xs font-bold text-zinc-500">未复核</span>
                </div>
             </div>

             <h4 className="text-sm font-black text-zinc-900 mb-4 mt-8 tracking-tight flex items-center gap-1"><Info className="w-4 h-4 text-[#10A66A]"/> 自动评分规则说明</h4>
             <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 space-y-3">
                <div>
                   <span className="text-xs font-black text-zinc-800">客观题</span>
                   <p className="text-[10px] font-bold text-zinc-500 mt-0.5 leading-relaxed">系统根据标准答案自动判分，支持正确、错误、部分得分。</p>
                </div>
                <div>
                   <span className="text-xs font-black text-zinc-800">实操题</span>
                   <p className="text-[10px] font-bold text-zinc-500 mt-0.5 leading-relaxed">系统根据实验环境操作记录、关键步骤完成情况、数据上报结果和报告提交状态自动评分。</p>
                </div>
                <div>
                   <span className="text-xs font-black text-zinc-800">主观题</span>
                   <p className="text-[10px] font-bold text-zinc-500 mt-0.5 leading-relaxed">由教师在线批阅并填写评分与评语。</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    )
  }

  

      {reviewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-[480px] overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-[#F8FAF9]">
              <div>
                <h3 className="text-lg font-black text-zinc-900">成绩复核</h3>
                <p className="text-xs font-bold text-zinc-500 mt-1">{reviewModal.studentName} - {reviewModal.examName}</p>
              </div>
              <button onClick={() => setReviewModal(null)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <span className="text-xs font-black text-zinc-600">原总分</span>
                  <span className="text-2xl font-black text-zinc-900">{reviewModal.totalScore} <span className="text-sm">分</span></span>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">复核分数</label>
                  <input type="number" value={reviewScore} onChange={e => setReviewScore(e.target.value)} placeholder="请输入复核后的成绩" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-[#10A66A]" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">复核意见</label>
                  <textarea rows={3} value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="请输入复核修改意见或说明" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#10A66A] resize-none" />
               </div>
            </div>
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
               <button onClick={() => setReviewModal(null)} className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-600 text-xs font-black rounded-xl hover:bg-zinc-50">取消</button>
               <button onClick={() => {
                  setResults(results.map((r: any) => r.id === reviewModal.id ? { ...r, totalScore: Number(reviewScore) || r.totalScore, status: "已复核", pass: (Number(reviewScore) || r.totalScore) >= 60 } : r));
                  alert("复核结果已保存。");
                  setReviewModal(null);
               }} className="px-6 py-2.5 bg-[#10A66A] text-white text-xs font-black rounded-xl hover:bg-[#0e955f] shadow-lg shadow-emerald-500/20">提交复核</button>
            </div>
          </div>
        </div>
      )}
return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      {exportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
              <div>
                <h3 className="text-lg font-black text-zinc-900">{exportModal === "overall" ? "导出整体成绩" : "按场次导出成绩"}</h3>
                <p className="text-xs font-bold text-zinc-500 mt-1">
                  只导出所选范围内的学生成绩，导出的成绩数据可用于成绩归档、教学分析和考试结果复核。
                </p>
              </div>
              <button onClick={() => setExportModal(null)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">考试名称</label>
                     <div className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-700">物联网设备接入能力测评</div>
                  </div>
                  
                  {exportModal === "overall" ? (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">导出范围</label>
                       <div className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-[#10A66A]">全部考试场次 (117 人)</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">选择考试场次</label>
                       <div className="relative">
                         <select value={exportSession} onChange={e => setExportSession(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 appearance-none text-sm font-black text-zinc-900 outline-none focus:border-[#10A66A]">
                           <option value="第一场">第一场｜2026-06-10 09:00 - 11:00｜物联网2301班 (42人)</option>
                           <option value="第二场">第二场｜2026-06-10 14:00 - 16:00｜物联网2302班 (40人)</option>
                           <option value="第三场">第三场｜2026-06-11 14:30 - 16:30｜工业互联网2301班 (35人)</option>
                         </select>
                         <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                       </div>
                    </div>
                  )}
               </div>

               {exportModal === "session" && (
                 <div className="flex gap-4 p-4 bg-[#F8FAF9] rounded-xl border border-zinc-100">
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">导出班级</span>
                      <span className="text-sm font-black text-zinc-800">
                        {exportSession === "第一场" ? "物联网2301班" : exportSession === "第二场" ? "物联网2302班" : "工业互联网2301班"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">导出人数</span>
                      <span className="text-sm font-black text-zinc-800">
                        {exportSession === "第一场" ? "42 人" : exportSession === "第二场" ? "40 人" : "35 人"}
                      </span>
                    </div>
                 </div>
               )}

               <div className="space-y-3">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">导出格式</label>
                 <div className="flex gap-3">
                    <button onClick={() => setExportFormat("Excel")} className={`flex-1 py-3 text-sm font-black rounded-xl border transition-all ${exportFormat === "Excel" ? "bg-green-50 border-[#10A66A] text-[#10A66A]" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>Excel 文件 (.xlsx)</button>
                    <button onClick={() => setExportFormat("CSV")} className={`flex-1 py-3 text-sm font-black rounded-xl border transition-all ${exportFormat === "CSV" ? "bg-green-50 border-[#10A66A] text-[#10A66A]" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>CSV 文件 (.csv)</button>
                 </div>
               </div>

               <div className="space-y-3 pt-4 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">导出数据预览</label>
                     <span className="text-[10px] font-bold text-zinc-500">仅展示前 {exportModal === "overall" ? 6 : 2} 条记录</span>
                  </div>
                  <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left">
                       <thead className="bg-[#F8FAF9] border-b border-zinc-200">
                         <tr className="text-[10px] font-black text-zinc-500 uppercase">
                           <th className="p-2 pl-4">姓名</th>
                           <th className="p-2">学号</th>
                           <th className="p-2">班级</th>
                           <th className="p-2">场次</th>
                           <th className="p-2">总分</th>
                           <th className="p-2">是否通过</th>
                           <th className="p-2">阅卷状态</th>
                         </tr>
                       </thead>
                       <tbody className="text-xs font-bold text-zinc-700">
                         {results.filter(r => exportModal === "overall" ? true : r.session === exportSession).slice(0, exportModal === "overall" ? 6 : 2).map((r, i) => (
                           <tr key={i} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                             <td className="p-2 pl-4">{r.studentName}</td>
                             <td className="p-2 text-zinc-500">{r.studentId}</td>
                             <td className="p-2 text-zinc-500">{r.className}</td>
                             <td className="p-2">{r.session}</td>
                             <td className="p-2 text-[#10A66A]">{r.totalScore}</td>
                             <td className="p-2">{r.pass ? "通过" : "未通过"}</td>
                             <td className="p-2 text-zinc-500">{r.status}</td>
                           </tr>
                         ))}
                         {(results.filter(r => exportModal === "overall" ? true : r.session === exportSession).length === 0) && (
                            <tr><td colSpan={7} className="p-4 text-center text-zinc-400">暂无该场次数据</td></tr>
                         )}
                       </tbody>
                    </table>
                  </div>
               </div>

            </div>
            
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3 sticky bottom-0">
               <button onClick={() => setExportModal(null)} className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-600 text-xs font-black rounded-xl hover:bg-zinc-50 transition-colors">取消</button>
               <button onClick={() => {
                  const now = new Date();
                  const timeStr = `${now.getFullYear()}-06-03 10:35`; // Custom mock time
                  const count = exportModal === "overall" ? 117 : (exportSession === "第一场" ? 42 : exportSession === "第二场" ? 40 : 35);
                  setExportRecords([{
                     id: Date.now(),
                     time: timeStr,
                     type: exportModal === "overall" ? "整体成绩" : "按场次导出",
                     examName: "物联网设备接入能力测评",
                     session: exportModal === "overall" ? "全部场次" : exportSession,
                     count: count + "人",
                     format: exportFormat,
                     operator: "教师1",
                     status: "已生成"
                  }, ...exportRecords]);
                  alert(`${exportModal === "overall" ? "整体成绩" : exportSession + "成绩"}数据已生成。`);
                  setExportModal(null);
               }} className="px-6 py-2.5 bg-[#10A66A] text-white text-xs font-black rounded-xl hover:bg-[#0e955f] transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                 确认导出
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-black text-zinc-900">考试结果</h2>
        <p className="text-xs font-bold text-zinc-500 mt-1">查看学生考试成绩、自动评分结果、通过情况和阅卷状态。</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        {currentUserRole === "教师" && (
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">成绩导出</span>
             <div className="flex bg-zinc-100 p-1 rounded-xl">
               <button onClick={() => setExportModal("overall")} className="px-4 py-2 text-xs font-black text-zinc-600 hover:bg-white hover:shadow hover:text-zinc-900 rounded-lg transition-all">导出整体成绩</button>
               <button onClick={() => setExportModal("session")} className="px-4 py-2 text-xs font-black text-zinc-600 hover:bg-white hover:shadow hover:text-zinc-900 rounded-lg transition-all">按场次导出</button>
             </div>
          </div>
        )}
      </div>

      <div className="mb-6 w-full p-3 bg-[#F8FAF9] border border-[#10A66A]/20 rounded-xl flex items-start gap-3">
        <Info className="w-4 h-4 text-[#10A66A] shrink-0 mt-0.5" />
        <p className="text-xs font-bold text-zinc-600 leading-relaxed">
          仅教师或管理员可导出考试成绩数据。学生端仅支持查看个人成绩，不显示成绩导出功能。
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-zinc-50 border border-zinc-100 p-4 rounded-xl">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">考试名称</label>
          <select value={examName} onChange={e => setExamName(e.target.value)} className="w-48 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]">
            <option value="全部">全部考试</option>
            <option value="物联网设备接入能力测评">物联网设备接入能力测评</option>
            <option value="Linux基础命令阶段考试">Linux基础命令阶段考试</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">考试场次</label>
          <select value={session} onChange={e => setSession(e.target.value)} className="w-32 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]">
            <option value="全部">全部场次</option>
            <option value="第一场">第一场</option>
            <option value="第二场">第二场</option>
            <option value="第三场">第三场</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">班级</label>
          <select value={className} onChange={e => setClassName(e.target.value)} className="w-40 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]">
            <option value="全部">全部班级</option>
            <option value="物联网2301班">物联网2301班</option>
            <option value="物联网2302班">物联网2302班</option>
            <option value="工业互联网2301班">工业互联网2301班</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">阅卷状态</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-32 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]">
            <option value="全部">全部状态</option>
            <option value="已自动评分">已自动评分</option>
            <option value="待人工批阅">待人工批阅</option>
            <option value="已批阅">已批阅</option>
            <option value="待复核">待复核</option>
          </select>
        </div>
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">学生姓名 / 学号</label>
          <div className="relative">
            <input 
              type="text" 
              value={searchKey} 
              onChange={e => setSearchKey(e.target.value)} 
              placeholder="请输入学生姓名或学号"
              className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <button className="px-4 py-2 bg-[#10A66A] text-white text-xs font-black rounded-lg hover:bg-[#0e955f] transition-colors">查询</button>
          <button className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 text-xs font-black rounded-lg hover:bg-zinc-50 transition-colors">重置</button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border border-zinc-200 p-4 rounded-xl text-center">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">参考人数</span>
          <span className="text-2xl font-black text-zinc-900">42 <span className="text-xs text-zinc-500">人</span></span>
        </div>
        <div className="bg-white border border-zinc-200 p-4 rounded-xl text-center">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">已交卷</span>
          <span className="text-2xl font-black text-zinc-900">39 <span className="text-xs text-zinc-500">人</span></span>
        </div>
        <div className="bg-[#F8FAF9] border border-[#10A66A]/30 p-4 rounded-xl text-center">
          <span className="text-[10px] font-black text-[#10A66A] uppercase tracking-widest block mb-1">已自动评分</span>
          <span className="text-2xl font-black text-[#10A66A]">32 <span className="text-xs">份</span></span>
        </div>
        <div className="bg-[#FFF9F5] border border-amber-200 p-4 rounded-xl text-center">
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">待人工批阅</span>
          <span className="text-2xl font-black text-amber-600">7 <span className="text-xs">份</span></span>
        </div>
        <div className="bg-white border border-zinc-200 p-4 rounded-xl text-center">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">平均分</span>
          <span className="text-2xl font-black text-zinc-900">82.5 <span className="text-xs text-zinc-500">分</span></span>
        </div>
        <div className="bg-white border border-zinc-200 p-4 rounded-xl text-center">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">通过率</span>
          <span className="text-2xl font-black text-zinc-900">86%</span>
        </div>
      </div>

      <div className="border border-zinc-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAF9] border-b border-zinc-200">
            <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              <th className="p-3 pl-4">学生姓名</th>
              <th className="p-3">学号</th>
              <th className="p-3">班级</th>
              <th className="p-3">考试名称</th>
              <th className="p-3">场次</th>
              <th className="p-3">客观题得分</th>
              <th className="p-3">实操题得分</th>
              <th className="p-3">主观题得分</th>
              <th className="p-3">总分</th>
              <th className="p-3">通过情况</th>
              <th className="p-3">阅卷状态</th>
              <th className="p-3 pr-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => (
              <tr key={idx} className="border-b border-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-50">
                <td className="p-3 pl-4">{r.studentName}</td>
                <td className="p-3 text-zinc-500">{r.studentId}</td>
                <td className="p-3 text-zinc-500">{r.className}</td>
                <td className="p-3 text-zinc-500 truncate max-w-[150px]" title={r.examName}>{r.examName}</td>
                <td className="p-3 text-zinc-500">{r.session}</td>
                <td className="p-3">{r.objectiveScore}分</td>
                <td className="p-3">{r.practicalScore}分</td>
                <td className="p-3">{r.subjectiveScore !== null ? `${r.subjectiveScore}分` : "待批阅"}</td>
                <td className="p-3 text-[#10A66A] font-black">{r.totalScore}分</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded ${r.pass === true ? "bg-green-100 text-[#10A66A]" : r.pass === false ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-600"}`}>
                    {r.pass === true ? "通过" : r.pass === false ? "未通过" : "待确认"}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded ${r.status === "已批阅" || r.status === "已自动评分" ? "text-[#10A66A] bg-green-50" : "text-amber-600 bg-amber-50"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-3 pr-4 text-right space-x-2 whitespace-nowrap">
                  <button onClick={() => setViewingResult(r)} className="text-[#10A66A] hover:underline font-black">查看结果</button>
                  {r.status === "待人工批阅" && <button className="text-[#10A66A] hover:underline">批阅试卷</button>}
                  {(r.status === "待复核" || r.status === "已批阅") && <button onClick={() => { setReviewModal(r); setReviewScore(r.totalScore.toString()); setReviewComment(""); }} className="text-amber-600 hover:underline font-black">复核</button>}
                  {r.status === "已自动评分" && <button onClick={() => { setReviewModal(r); setReviewScore(r.totalScore.toString()); setReviewComment(""); }} className="text-amber-600 hover:underline font-black">复核</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {exportRecords.length > 0 && (
      <div className="mt-8 animate-in fade-in">
        <h3 className="text-lg font-black text-zinc-900 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-[#10A66A]"/>
          导出记录
        </h3>
        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAF9] border-b border-zinc-200">
              <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                <th className="p-3 pl-4">导出时间</th>
                <th className="p-3">导出类型</th>
                <th className="p-3">考试名称</th>
                <th className="p-3">考试场次</th>
                <th className="p-3">导出人数</th>
                <th className="p-3">导出格式</th>
                <th className="p-3">操作人</th>
                <th className="p-3">状态</th>
                <th className="p-3 pr-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {exportRecords.map((r, i) => (
                <tr key={i} className="border-b border-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-50">
                  <td className="p-3 pl-4 text-zinc-500">{r.time}</td>
                  <td className="p-3 text-zinc-900">{r.type}</td>
                  <td className="p-3 text-zinc-500">{r.examName}</td>
                  <td className="p-3">{r.session}</td>
                  <td className="p-3 text-zinc-500">{r.count}</td>
                  <td className="p-3 text-zinc-500">{r.format}</td>
                  <td className="p-3 text-zinc-500">{r.operator}</td>
                  <td className="p-3 flex items-center gap-1 mt-1"><span className="bg-green-100 text-[#10A66A] px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/>{r.status}</span></td>
                  <td className="p-3 pr-4 text-right">
                    <button className="text-[#10A66A] hover:underline font-black">下载 {r.format}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

    </div>
  )
}
