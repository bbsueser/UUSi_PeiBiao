import React, { useState } from "react";
import { Search, ChevronRight, CheckCircle2, AlertCircle, FileText, Info, Download, X, Clock, StopCircle, RefreshCw } from "lucide-react";

export function ExamMonitor() {
  const [examName, setExamName] = useState("全部");
  const [sessionName, setSessionName] = useState("全部");
  const [className, setClassName] = useState("全部");
  const [examStatus, setExamStatus] = useState("全部");
  const [anomalyStatus, setAnomalyStatus] = useState("全部");
  const [searchKey, setSearchKey] = useState("");
  
  const [viewingDetail, setViewingDetail] = useState<any>(null);

  const [monitors, setMonitors] = useState([
    {
      id: "1",
      studentName: "学生1",
      studentId: "20230101",
      className: "物联网2301班",
      examName: "物联网设备接入能力测评",
      session: "第一场",
      status: "考试中",
      timeUsed: "00:35:20",
      timeRemaining: "01:24:40",
      switchCount: 0,
      copyPasteAnomalies: 0,
      attempts: "1 / 1",
      anomalyStatus: "正常",
      logs: []
    },
    {
      id: "2",
      studentName: "学生2",
      studentId: "20230102",
      className: "物联网2301班",
      examName: "物联网设备接入能力测评",
      session: "第一场",
      status: "考试中",
      timeUsed: "00:42:10",
      timeRemaining: "01:17:50",
      switchCount: 2,
      copyPasteAnomalies: 1,
      attempts: "1 / 1",
      anomalyStatus: "预警",
      logs: [
        { time: "2026-06-10 09:12", type: "屏幕切换", status: "已记录" },
        { time: "2026-06-10 09:20", type: "屏幕切换", status: "已记录" },
        { time: "2026-06-10 09:25", type: "复制操作", status: "已阻止" }
      ]
    },
    {
      id: "3",
      studentName: "学生3",
      studentId: "20230103",
      className: "物联网2301班",
      examName: "物联网设备接入能力测评",
      session: "第一场",
      status: "考试中",
      timeUsed: "00:50:30",
      timeRemaining: "01:09:30",
      switchCount: 3,
      copyPasteAnomalies: 2,
      attempts: "1 / 1",
      anomalyStatus: "异常",
      logs: [
        { time: "2026-06-10 09:18", type: "屏幕切换", status: "已记录", notes: "学生离开考试页面" },
        { time: "2026-06-10 09:26", type: "粘贴操作", status: "已阻止", notes: "本场考试禁止粘贴" },
        { time: "2026-06-10 09:34", type: "屏幕切换", status: "已记录" },
        { time: "2026-06-10 09:40", type: "屏幕切换超限", status: "已标记异常", notes: "超过允许切屏次数" }
      ]
    },
    {
      id: "4",
      studentName: "学生4",
      studentId: "20230104",
      className: "物联网2301班",
      examName: "物联网设备接入能力测评",
      session: "第一场",
      status: "已交卷",
      timeUsed: "01:10:00",
      timeRemaining: "00:50:00",
      switchCount: 0,
      copyPasteAnomalies: 0,
      attempts: "1 / 1",
      anomalyStatus: "正常",
      logs: []
    }
  ]);
  
  const [cheatLogs, setCheatLogs] = useState([
    {
      time: "2026-06-10 09:40",
      studentName: "学生3",
      studentId: "20230103",
      session: "第一场",
      type: "屏幕切换超限",
      count: "3次",
      status: "已标记异常",
      notes: "超过允许切屏次数"
    },
    {
      time: "2026-06-10 09:26",
      studentName: "学生3",
      studentId: "20230103",
      session: "第一场",
      type: "粘贴操作",
      count: "1次",
      status: "已阻止",
      notes: "本场考试禁止粘贴"
    },
    {
      time: "2026-06-10 09:18",
      studentName: "学生3",
      studentId: "20230103",
      session: "第一场",
      type: "屏幕切换",
      count: "1次",
      status: "已记录",
      notes: "学生离开考试页面"
    }
  ]);

  if (viewingDetail) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 flex gap-6">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
            <div>
               <h3 className="text-xl font-black text-zinc-900">考试异常详情</h3>
               <p className="text-xs font-bold text-zinc-500 mt-1">
                 学生：<strong className="text-zinc-800">{viewingDetail.studentName}</strong> ({viewingDetail.studentId})
               </p>
            </div>
            <button onClick={() => setViewingDetail(null)} className="text-xs font-black text-zinc-400 hover:text-zinc-600">返回监控列表</button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
             <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-400 uppercase">考试状态</span>
                <p className="text-sm font-black text-zinc-900">{viewingDetail.status}</p>
             </div>
             <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-400 uppercase">考试次数</span>
                <p className="text-sm font-black text-zinc-900">{viewingDetail.attempts}</p>
             </div>
             <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-400 uppercase">切屏次数</span>
                <p className="text-sm font-black text-zinc-900">{viewingDetail.switchCount} / 2</p>
             </div>
             <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-400 uppercase">异常状态</span>
                <p className={`text-sm font-black \${viewingDetail.anomalyStatus === '异常' ? 'text-red-500' : viewingDetail.anomalyStatus === '预警' ? 'text-amber-500' : 'text-[#10A66A]'}`}>{viewingDetail.anomalyStatus}</p>
             </div>
          </div>

          <h4 className="text-sm font-black text-zinc-900 mb-4 tracking-tight">异常记录</h4>
          <div className="border border-zinc-200 rounded-xl overflow-hidden mb-6">
             <table className="w-full text-left">
               <thead className="bg-[#F8FAF9] border-b border-zinc-200">
                 <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                   <th className="p-3 pl-4">时间</th>
                   <th className="p-3">异常类型</th>
                   <th className="p-3">处理状态</th>
                   <th className="p-3">备注</th>
                 </tr>
               </thead>
               <tbody>
                 {viewingDetail.logs.map((log: any, idx: number) => (
                   <tr key={idx} className="border-b border-zinc-100 text-xs font-bold text-zinc-700">
                     <td className="p-3 pl-4 text-zinc-500">{log.time}</td>
                     <td className="p-3">{log.type}</td>
                     <td className="p-3">
                        <span className={`px-2 py-0.5 rounded \${log.status === "已标记异常" ? 'bg-red-50 text-red-600' : log.status === "已阻止" ? 'bg-amber-50 text-amber-600' : 'bg-zinc-100 text-zinc-600'}`}>
                           {log.status}
                        </span>
                     </td>
                     <td className="p-3 text-zinc-500">{log.notes || "--"}</td>
                   </tr>
                 ))}
                 {viewingDetail.logs.length === 0 && (
                   <tr><td colSpan={4} className="p-6 text-center text-zinc-400">暂无异常记录</td></tr>
                 )}
               </tbody>
             </table>
          </div>

          {(viewingDetail.status === "考试中") && (
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-zinc-100">
              <button 
                onClick={() => {
                   setMonitors(monitors.map(m => m.id === viewingDetail.id ? { ...m, anomalyStatus: "异常" } : m));
                   setViewingDetail({ ...viewingDetail, anomalyStatus: "异常" });
                }}
                className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 text-xs font-black rounded-xl hover:bg-red-100 transition-colors">
                标记异常
              </button>
              <button 
                onClick={() => {
                   alert("已允许学生继续考试。");
                }}
                className="px-6 py-2.5 bg-amber-50 text-amber-600 border border-amber-200 text-xs font-black rounded-xl hover:bg-amber-100 transition-colors">
                允许继续考试
              </button>
              <button 
                onClick={() => {
                   setMonitors(monitors.map(m => m.id === viewingDetail.id ? { ...m, status: "已交卷", anomalyStatus: "正常" } : m));
                   setViewingDetail({ ...viewingDetail, status: "已交卷", anomalyStatus: "正常" });
                }}
                className="px-6 py-2.5 bg-zinc-800 text-white text-xs font-black rounded-xl hover:bg-zinc-900 transition-colors">
                强制交卷
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6">
        <h2 className="text-xl font-black text-zinc-900">考试状态监控</h2>
        <p className="text-xs font-bold text-zinc-500 mt-1">实时查看学生考试状态、剩余时间、切屏次数、复制粘贴异常和交卷情况。</p>
      </div>

      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white border border-zinc-200 p-4 rounded-xl text-center">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">应考人数</span>
          <span className="text-2xl font-black text-zinc-900">42 <span className="text-xs text-zinc-500">人</span></span>
        </div>
        <div className="bg-[#F8FAF9] border border-[#10A66A]/30 p-4 rounded-xl text-center">
          <span className="text-[10px] font-black text-[#10A66A] uppercase tracking-widest block mb-1">正在考试</span>
          <span className="text-2xl font-black text-[#10A66A]">36 <span className="text-xs">人</span></span>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-center">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">已交卷</span>
          <span className="text-2xl font-black text-zinc-700">4 <span className="text-xs">人</span></span>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-center">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">未进入</span>
          <span className="text-2xl font-black text-zinc-400">2 <span className="text-xs">人</span></span>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center">
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-1">异常考试</span>
          <span className="text-2xl font-black text-red-500">3 <span className="text-xs">人</span></span>
        </div>
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center">
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block mb-1">超时交卷</span>
          <span className="text-2xl font-black text-orange-500">1 <span className="text-xs">人</span></span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-zinc-50 border border-zinc-100 p-4 rounded-xl">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">考试名称</label>
          <select value={examName} onChange={e => setExamName(e.target.value)} className="w-36 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]">
            <option value="全部">全部考试</option>
            <option value="物联网设备接入能力测评">物联网设备接入能力测评</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">考试场次</label>
          <select value={sessionName} onChange={e => setSessionName(e.target.value)} className="w-32 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]">
            <option value="全部">全部场次</option>
            <option value="第一场">第一场</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">班级</label>
          <select value={className} onChange={e => setClassName(e.target.value)} className="w-36 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]">
            <option value="全部">全部班级</option>
            <option value="物联网2301班">物联网2301班</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">考试状态</label>
          <select value={examStatus} onChange={e => setExamStatus(e.target.value)} className="w-28 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]">
            <option value="全部">全部</option>
            <option value="考试中">考试中</option>
            <option value="已交卷">已交卷</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">异常状态</label>
          <select value={anomalyStatus} onChange={e => setAnomalyStatus(e.target.value)} className="w-28 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]">
            <option value="全部">全部</option>
            <option value="正常">正常</option>
            <option value="预警">预警</option>
            <option value="异常">异常</option>
          </select>
        </div>
        <div className="space-y-1 flex-1 min-w-[150px]">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">姓名 / 学号</label>
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

      <div className="border border-zinc-200 rounded-xl overflow-hidden mb-8">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAF9] border-b border-zinc-200">
            <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              <th className="p-3 pl-4">学生姓名</th>
              <th className="p-3">学号</th>
              <th className="p-3">班级</th>
              <th className="p-3">考试名称 / 场次</th>
              <th className="p-3">考试状态</th>
              <th className="p-3">已用时间</th>
              <th className="p-3">剩余时间</th>
              <th className="p-3">切屏次数</th>
              <th className="p-3">复制粘贴异常</th>
              <th className="p-3">考试次数</th>
              <th className="p-3">异常状态</th>
              <th className="p-3 pr-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {monitors.map((m, idx) => (
              <tr key={idx} className="border-b border-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-50">
                <td className="p-3 pl-4">{m.studentName}</td>
                <td className="p-3 text-zinc-500">{m.studentId}</td>
                <td className="p-3 text-zinc-500">{m.className}</td>
                <td className="p-3 text-zinc-500">
                   <div className="truncate max-w-[120px]" title={m.examName}>{m.examName}</div>
                   <div className="text-[10px] mt-0.5">{m.session}</div>
                </td>
                <td className="p-3">
                   <span className={`px-2 py-0.5 rounded flex w-fit items-center gap-1 \${m.status === '考试中' ? 'bg-green-50 text-[#10A66A]' : 'bg-emerald-50 text-emerald-600'}`}>
                     {m.status === '考试中' ? <RefreshCw className="w-3 h-3 animate-spin"/> : <CheckCircle2 className="w-3 h-3"/>}
                     {m.status}
                   </span>
                </td>
                <td className="p-3">{m.timeUsed}</td>
                <td className="p-3 font-mono text-zinc-800">{m.timeRemaining}</td>
                <td className="p-3 text-zinc-500">{m.switchCount}/2</td>
                <td className="p-3 text-zinc-500">{m.copyPasteAnomalies}次</td>
                <td className="p-3 text-zinc-500">{m.attempts}</td>
                <td className="p-3">
                   <span className={`px-2 py-0.5 rounded \${m.anomalyStatus === '异常' ? 'bg-red-50 text-red-600' : m.anomalyStatus === '预警' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-[#10A66A]'}`}>
                     {m.anomalyStatus}
                   </span>
                </td>
                <td className="p-3 pr-4 text-right">
                  <button onClick={() => setViewingDetail(m)} className="text-[#10A66A] hover:underline font-black">查看详情</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-black text-zinc-900 mb-4 flex items-center gap-2">
           <AlertCircle className="w-5 h-5 text-red-500" />
           防作弊记录
        </h3>
        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAF9] border-b border-zinc-200">
              <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                <th className="p-3 pl-4">记录时间</th>
                <th className="p-3">学生姓名</th>
                <th className="p-3">学号</th>
                <th className="p-3">考试场次</th>
                <th className="p-3">异常类型</th>
                <th className="p-3">触发次数</th>
                <th className="p-3">处理状态</th>
                <th className="p-3">处理说明</th>
              </tr>
            </thead>
            <tbody>
              {cheatLogs.map((log, idx) => (
                <tr key={idx} className="border-b border-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-50">
                  <td className="p-3 pl-4 text-zinc-500">{log.time}</td>
                  <td className="p-3">{log.studentName}</td>
                  <td className="p-3 text-zinc-500">{log.studentId}</td>
                  <td className="p-3 text-zinc-500">{log.session}</td>
                  <td className="p-3">{log.type}</td>
                  <td className="p-3 text-zinc-500">{log.count}</td>
                  <td className="p-3">
                     <span className={`px-2 py-0.5 rounded \${log.status === '已标记异常' ? 'bg-red-50 text-red-600' : log.status === '已阻止' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                       {log.status}
                     </span>
                  </td>
                  <td className="p-3 text-zinc-500">{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
