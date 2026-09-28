import React, { useState } from "react";
import { Search, Info, CheckCircle2, ChevronRight, Save, X } from "lucide-react";

export function ExamGrading() {
  const [examName, setExamName] = useState("全部");
  const [session, setSession] = useState("全部");
  const [className, setClassName] = useState("全部");
  const [status, setStatus] = useState("全部");
  const [searchKey, setSearchKey] = useState("");
  const [gradingDoc, setGradingDoc] = useState<any>(null);
  const [reviewModal, setReviewModal] = useState<any>(null);
  const [reviewScore, setReviewScore] = useState<string>("");
  const [reviewComment, setReviewComment] = useState("");
  
  // mock data
  const [papers, setPapers] = useState([
    {
      id: "1",
      studentName: "学生2",
      studentId: "20230102",
      className: "物联网2301班",
      examName: "物联网设备接入能力测评",
      paperName: "物联网设备接入理论试卷A",
      objectiveScore: 42,
      practicalScore: 30,
      pendingCount: 2,
      currentTotal: 72,
      status: "待人工批阅",
      answers: [
        {
          id: "q1",
          type: "简答题",
          content: "简述设备接入物联网平台的一般流程。",
          reference: "包括创建设备、配置物模型、设置通信参数、上传传感器数据和查看平台数据。",
          studentAnswer: "设备接入前需要创建设备，配置密钥和通信参数，然后通过 MQTT 上传数据到平台。",
          fullScore: 10,
          score: 8,
          comment: "回答基本完整，建议补充物模型配置和数据看板验证步骤。"
        },
        {
          id: "q2",
          type: "实验报告",
          content: "提交物联网设备接入实验报告。",
          systemCheck: "报告已提交，包含设备配置截图和数据上报结果。",
          fullScore: 10,
          score: 9,
          comment: "报告结构清晰，数据结果完整。"
        }
      ]
    },
    {
      id: "2",
      studentName: "学生4",
      studentId: "20230104",
      className: "物联网2301班",
      examName: "物联网设备接入能力测评",
      paperName: "物联网设备接入理论试卷A",
      objectiveScore: 30,
      practicalScore: 18,
      pendingCount: 2,
      currentTotal: 48,
      status: "待人工批阅",
      answers: [
        {
          id: "q1",
          type: "简答题",
          content: "简述设备接入物联网平台的一般流程。",
          reference: "包括创建设备、配置物模型、设置通信参数、上传传感器数据和查看平台数据。",
          studentAnswer: "先创建设备，然后接入平台。",
          fullScore: 10,
          score: 4,
          comment: "回答不够完整，缺少具体步骤。"
        },
        {
          id: "q2",
          type: "实验报告",
          content: "提交物联网设备接入实验报告。",
          systemCheck: "报告已提交，但缺少数据上报结果截图。",
          fullScore: 10,
          score: 6,
          comment: "报告不完整，缺少关键截图。"
        }
      ]
    }
  ]);

  const handleSave = () => {
    alert("批阅内容已保存。");
  };

  const handleSubmit = () => {
    if (gradingDoc) {
      setPapers(papers.map(p => p.id === gradingDoc.id ? { ...p, status: "已批阅" } : p));
      setGradingDoc(null);
      alert("试卷批阅已提交。");
    }
  };

  const handleScoreChange = (qId: string, newScore: number) => {
    if (!gradingDoc) return;
    const newAnswers = gradingDoc.answers.map((a: any) => a.id === qId ? { ...a, score: newScore } : a);
    const newAddition = newAnswers.reduce((acc: number, a: any) => acc + (a.score || 0), 0);
    setGradingDoc({ ...gradingDoc, answers: newAnswers, currentTotal: gradingDoc.objectiveScore + gradingDoc.practicalScore + newAddition });
  };

  const handleCommentChange = (qId: string, text: string) => {
    if (!gradingDoc) return;
    const newAnswers = gradingDoc.answers.map((a: any) => a.id === qId ? { ...a, comment: text } : a);
    setGradingDoc({ ...gradingDoc, answers: newAnswers });
  };

  if (gradingDoc) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 flex gap-6">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-zinc-900">在线批阅</h3>
              <p className="text-xs font-bold text-zinc-500 mt-1">为学生客观题或实验报告打分并填写评语。</p>
            </div>
            <button onClick={() => setGradingDoc(null)} className="text-xs font-black text-zinc-400 hover:text-zinc-600">返回列表</button>
          </div>

          <div className="flex flex-wrap gap-6 bg-zinc-50 p-4 rounded-xl border border-zinc-100 mb-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black text-zinc-400">学生信息</span>
              <p className="text-xs font-bold text-zinc-800">{gradingDoc.studentName} ({gradingDoc.studentId})</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black text-zinc-400">考试名称</span>
              <p className="text-xs font-bold text-zinc-800">{gradingDoc.examName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black text-zinc-400">试卷名称</span>
              <p className="text-xs font-bold text-zinc-800">{gradingDoc.paperName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black text-zinc-400">自动评分</span>
              <p className="text-xs font-bold text-zinc-600">客观题 {gradingDoc.objectiveScore}分 ｜ 实操题 {gradingDoc.practicalScore}分</p>
            </div>
            <div className="space-y-1 ml-auto text-right">
              <span className="text-[10px] uppercase font-black text-[#10A66A]">当前总分</span>
              <p className="text-xl font-black text-[#10A66A]">{gradingDoc.currentTotal} <span className="text-sm">分</span></p>
            </div>
          </div>

          <div className="space-y-6">
            {gradingDoc.answers.map((answer: any, idx: number) => (
              <div key={answer.id} className="border border-zinc-200 rounded-xl overflow-hidden">
                 <div className="bg-[#F8FAF9] border-b border-zinc-200 p-4 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <span className="text-xs font-black text-white bg-[#10A66A] w-6 h-6 rounded flex items-center justify-center">Q{idx + 1}</span>
                     <span className="text-xs font-black text-[#10A66A] bg-green-100 px-2 py-0.5 rounded">{answer.type}</span>
                     <span className="text-xs font-bold text-zinc-600">分值：{answer.fullScore} 分</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-black text-zinc-700">教师评分：</span>
                     <input 
                        type="number" 
                        min={0} 
                        max={answer.fullScore}
                        value={answer.score}
                        onChange={(e) => handleScoreChange(answer.id, Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-white border border-zinc-200 rounded text-center text-sm font-black text-[#10A66A] outline-none focus:border-[#10A66A]"
                     />
                     <span className="text-xs font-bold text-zinc-500">/{answer.fullScore}</span>
                   </div>
                 </div>
                 <div className="p-4 space-y-4 bg-white">
                   <div className="space-y-1">
                     <span className="text-[10px] font-black text-zinc-400 uppercase">题干</span>
                     <p className="text-sm font-bold text-zinc-800">{answer.content}</p>
                   </div>
                   <div className="p-3 bg-zinc-50 rounded-lg space-y-1 border border-zinc-100">
                     <span className="text-[10px] font-black text-zinc-400 uppercase">参考答案</span>
                     <p className="text-xs font-bold text-zinc-600">{answer.reference || "--"}</p>
                   </div>
                   <div className="p-3 bg-blue-50 rounded-lg space-y-1 border border-blue-100">
                     <span className="text-[10px] font-black text-blue-400 uppercase">学生回答 / 系统检测</span>
                     <p className="text-sm font-bold text-zinc-800">{answer.studentAnswer || answer.systemCheck}</p>
                   </div>
                   <div className="space-y-1 pt-2">
                     <span className="text-[10px] font-black text-zinc-400 uppercase">教师评语</span>
                     <textarea 
                       rows={2} 
                       value={answer.comment}
                       onChange={(e) => handleCommentChange(answer.id, e.target.value)}
                       className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs font-bold text-zinc-700 outline-none focus:border-[#10A66A] resize-none"
                       placeholder="请输入给学生的评语反馈..."
                     />
                   </div>
                 </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-zinc-100">
             <button onClick={handleSave} className="px-6 py-2.5 bg-zinc-100 text-zinc-600 font-black text-xs rounded-xl hover:bg-zinc-200 transition-colors">保存批阅</button>
             <button onClick={handleSubmit} className="px-6 py-2.5 bg-[#10A66A] text-white font-black text-xs rounded-xl hover:bg-[#0e955f] transition-colors shadow-lg shadow-emerald-500/20">提交批阅</button>
          </div>
        </div>
      </div>
    );
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
                  <span className="text-2xl font-black text-zinc-900">{reviewModal.currentTotal} <span className="text-sm">分</span></span>
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
                  setPapers(papers.map(p => p.id === reviewModal.id ? { ...p, currentTotal: Number(reviewScore) || p.currentTotal, status: "已复核" } : p));
                  alert("复核结果已保存。");
                  setReviewModal(null);
               }} className="px-6 py-2.5 bg-[#10A66A] text-white text-xs font-black rounded-xl hover:bg-[#0e955f] shadow-lg shadow-emerald-500/20">提交复核</button>
            </div>
          </div>
        </div>
      )}

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6">
        <h2 className="text-xl font-black text-zinc-900">阅卷评分</h2>
        <p className="text-xs font-bold text-zinc-500 mt-1">教师可在线查看学生答卷，对主观题、实操报告和异常试卷进行批阅与复核。</p>
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
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">班级</label>
          <select value={className} onChange={e => setClassName(e.target.value)} className="w-40 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]">
            <option value="全部">全部班级</option>
            <option value="物联网2301班">物联网2301班</option>
            <option value="物联网2302班">物联网2302班</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">阅卷状态</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-32 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]">
            <option value="全部">全部状态</option>
            <option value="待人工批阅">待人工批阅</option>
            <option value="已批阅">已批阅</option>
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

      <div className="border border-zinc-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAF9] border-b border-zinc-200">
            <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              <th className="p-3 pl-4">学生姓名</th>
              <th className="p-3">学号</th>
              <th className="p-3">班级</th>
              <th className="p-3">考试名称</th>
              <th className="p-3">试卷名称</th>
              <th className="p-3">客观题得分</th>
              <th className="p-3">实操题自动得分</th>
              <th className="p-3">待批阅题数</th>
              <th className="p-3">当前总分</th>
              <th className="p-3">阅卷状态</th>
              <th className="p-3 pr-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((p, idx) => (
              <tr key={idx} className="border-b border-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-50">
                <td className="p-3 pl-4">{p.studentName}</td>
                <td className="p-3 text-zinc-500">{p.studentId}</td>
                <td className="p-3 text-zinc-500">{p.className}</td>
                <td className="p-3 text-zinc-500 truncate max-w-[120px]" title={p.examName}>{p.examName}</td>
                <td className="p-3 text-zinc-500 truncate max-w-[150px]" title={p.paperName}>{p.paperName}</td>
                <td className="p-3 text-zinc-500">{p.objectiveScore}分</td>
                <td className="p-3 text-zinc-500">{p.practicalScore}分</td>
                <td className="p-3"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{p.pendingCount} 题</span></td>
                <td className="p-3 text-[#10A66A] font-black">{p.currentTotal}分</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded ${p.status === "已批阅" ? "text-[#10A66A] bg-green-50" : "text-amber-600 bg-amber-50"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 pr-4 text-right">
                  {p.status === "待人工批阅" ? (
                    <button onClick={() => setGradingDoc(p)} className="text-[#10A66A] hover:underline font-black">进入批阅</button>
                  ) : (
                    <div className="space-x-2">
                      <button onClick={() => setGradingDoc(p)} className="text-zinc-500 hover:underline font-black">查看批阅</button>
                      <button onClick={() => { setReviewModal(p); setReviewScore(p.currentTotal.toString()); setReviewComment(""); }} className="text-amber-600 hover:underline font-black">复核</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
