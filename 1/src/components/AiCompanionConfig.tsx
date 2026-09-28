import React, { useState, useEffect } from "react";
import { Plus, Save, Play, Image as ImageIcon, MessageSquare, Send, CheckCircle2, User, Clock, Check, ListChecks, FileText, Settings, XCircle, RefreshCcw, Activity } from "lucide-react";

export default function AiCompanionConfig() {
  const [companionList, setCompanionList] = useState([
    {
      id: "ai-companion-001",
      nickname: "小智学伴",
      avatar: "robot-green",
      role: "技能分析师",
      personality: ["耐心细致", "积极鼓励"],
      abilities: ["学习答疑", "实验指导", "技能诊断", "学习路径推荐"],
      enabled: true,
      updatedAt: "10:20:00"
    },
    {
      id: "ai-companion-002",
      nickname: "实验助教",
      avatar: "robot-blue",
      role: "实验助教",
      personality: ["严谨专业"],
      abilities: ["实验指导"],
      enabled: false,
      updatedAt: "09:15:00"
    },
    {
      id: "ai-companion-003",
      nickname: "职业规划助手",
      avatar: "robot-purple",
      role: "职业规划顾问",
      personality: ["活泼亲和"],
      abilities: ["学习答疑", "职业能力分析"],
      enabled: false,
      updatedAt: "08:30:00"
    }
  ]);

  const [selectedCompanionId, setSelectedCompanionId] = useState("ai-companion-001");
  const [companionNickname, setCompanionNickname] = useState("小智学伴");
  const [companionAvatar, setCompanionAvatar] = useState("robot-green");
  const [companionRole, setCompanionRole] = useState("技能分析师");
  const [companionPersonality, setCompanionPersonality] = useState<string[]>(["耐心细致", "积极鼓励"]);
  const [companionAbilities, setCompanionAbilities] = useState<string[]>(["学习答疑", "实验指导", "技能诊断", "学习路径推荐"]);
  const [companionOpeningMessage, setCompanionOpeningMessage] = useState("你好，我是你的专属 AI 学伴，可以帮助你分析技能掌握情况、解答课程问题，并给出学习建议。");
  const [companionReplyStyle, setCompanionReplyStyle] = useState("先判断问题类型，再给出分步骤建议，必要时推荐对应课程和实验任务。");
  const [companionEnabled, setCompanionEnabled] = useState(true);
  const [previewDirty, setPreviewDirty] = useState(false);
  const [chatMessages, setChatMessages] = useState<{sender: "user" | "ai", text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [configRecords, setConfigRecords] = useState<any[]>([
    { time: "10:20:00", nickname: "小智学伴", field: "启用状态", content: "已启用", user: "学生1", status: "成功" },
    { time: "10:21:00", nickname: "小智学伴", field: "性格设定", content: "耐心细致、积极鼓励", user: "学生1", status: "已保存" },
    { time: "10:20:30", nickname: "小智学伴", field: "角色设定", content: "技能分析师", user: "学生1", status: "已保存" },
    { time: "10:20:00", nickname: "小智学伴", field: "昵称", content: "小智学伴", user: "学生1", status: "已保存" }
  ]);
  const [operationLogs, setOperationLogs] = useState<any[]>([
    { time: "10:19:00", action: "进入AI学伴配置页面", status: "成功" }
  ]);
  const [companionToast, setCompanionToast] = useState("");
  const [avatarUploadStatus, setAvatarUploadStatus] = useState("");

  const addLog = (action: string) => {
    const time = new Date().toLocaleTimeString().substring(0, 8);
    setOperationLogs(prev => [{ time, action, status: "成功" }, ...prev]);
  };

  const addRecord = (field: string, content: string, statusStr: string) => {
    const time = new Date().toLocaleTimeString().substring(0, 8);
    setConfigRecords(prev => [{ time, nickname: companionNickname, field, content, user: "学生1", status: statusStr }, ...prev]);
  };

  const showToast = (msg: string) => {
    setCompanionToast(msg);
    setTimeout(() => setCompanionToast(""), 3000);
  };

  const handleCreateNew = () => {
    setSelectedCompanionId("");
    setCompanionNickname("新学伴");
    setCompanionAvatar("robot-green");
    setCompanionRole("学习导师");
    setCompanionPersonality(["耐心细致"]);
    setCompanionAbilities(["学习答疑"]);
    setCompanionOpeningMessage("你好，我是新创建的AI学伴。");
    setCompanionReplyStyle("亲切自然。");
    setCompanionEnabled(false);
    setPreviewDirty(true);
    setChatMessages([]);
    showToast("已创建新的 AI 学伴配置");
    addLog("点击新建学伴");
  };

  const handleSelectCompanion = (comp: any) => {
    setSelectedCompanionId(comp.id);
    setCompanionNickname(comp.nickname);
    setCompanionAvatar(comp.avatar);
    setCompanionRole(comp.role);
    setCompanionPersonality([...comp.personality]);
    setCompanionAbilities([...comp.abilities]);
    setCompanionEnabled(comp.enabled);
    setPreviewDirty(false);
    setChatMessages([]);
    addLog(`选择学伴：${comp.nickname}`);
  };

  const handlePersonalityChange = (tag: string) => {
    setPreviewDirty(true);
    if (companionPersonality.includes(tag)) {
      setCompanionPersonality(prev => prev.filter(t => t !== tag));
    } else {
      setCompanionPersonality(prev => [...prev, tag]);
    }
    // Only log occasionally to avoid spam, we'll log when user saves or let's log select
    addLog(`修改性格：${companionPersonality.includes(tag) ? tag + '(移除)' : tag}`);
  };

  const handleAbilityChange = (ability: string) => {
    setPreviewDirty(true);
    if (companionAbilities.includes(ability)) {
      setCompanionAbilities(prev => prev.filter(a => a !== ability));
    } else {
      setCompanionAbilities(prev => [...prev, ability]);
    }
  };

  const handleUploadAvatar = () => {
    setAvatarUploadStatus("上传中...");
    setTimeout(() => {
      setAvatarUploadStatus("");
      setCompanionAvatar("custom-avatar");
      setPreviewDirty(true);
      showToast("头像上传成功");
      addLog("上传自定义头像");
      addRecord("头像", "自定义头像", "已保存草稿");
    }, 800);
  };

  const handleGenerateSettings = () => {
    setCompanionOpeningMessage(`你好，我是你的专属 AI 学伴，我目前担任【${companionRole}】，性格【${companionPersonality.join("、")}】，可以为你提供学习上的帮助。`);
    setCompanionReplyStyle(`分析型回答，重点突出，符合【${companionRole}】的专业身份设定。`);
    setPreviewDirty(true);
    showToast("已生成推荐设定");
    addLog("生成推荐设定");
  };

  const handleSendChat = (text: string) => {
    if (!text.trim()) {
       showToast("请输入试聊问题");
       return; 
    }
    setChatMessages(prev => [...prev, { sender: "user", text }]);
    setChatInput("");
    addLog(`试聊问题：${text}`);
    
    setTimeout(() => {
      let reply = `[${companionRole}] 您好！我是${companionNickname}。`;
      if (text.includes("Python")) {
        if (companionPersonality.includes("活泼亲和")) {
            reply += "哇，你最近 Python 学得超级棒哦！不过文件处理还可以再加把劲呢，建议你优先完成“文件读写训练”和“pyecharts图表实训”呀~";
        } else if (companionPersonality.includes("严谨专业")) {
            reply += "根据本次诊断的技能画像：Python基础语法掌握度85%，目前文件处理和数据可视化能力模块尚未达标。建议优先完成“文件读写训练”并参加重测。";
        } else if (companionPersonality.includes("简洁直接")) {
            reply += "Python基础不错，文件处理偏弱。去做“文件读写训练”。";
        } else {
            reply += "根据你的技能画像，Python基础语法掌握度较高，但文件处理和数据可视化能力还有提升空间。建议你优先完成“文件读写训练”和“pyecharts图表实训”，并在完成后重新生成技能诊断报告。";
        }
      } else {
        reply += `根据我的【${companionRole}】设定和【${companionAbilities.join(",")}】能力，已为你分析。这是一个非常好的问题！`;
      }
      setChatMessages(prev => [...prev, { sender: "ai", text: reply }]);
    }, 600);
  };

  const handleSave = (enable: boolean) => {
    if (!companionNickname.trim()) {
      showToast("请输入学伴昵称");
      return;
    }
    if (companionPersonality.length === 0) {
      showToast("请选择至少一种性格设定");
      return;
    }

    let id = selectedCompanionId;
    if (!id) {
       id = "ai-companion-" + Date.now();
    }
    
    const time = new Date().toLocaleTimeString().substring(0, 8);
    const updatedComp = {
       id,
       nickname: companionNickname,
       avatar: companionAvatar,
       role: companionRole,
       personality: [...companionPersonality],
       abilities: [...companionAbilities],
       enabled: enable,
       updatedAt: time
    };

    setCompanionList(prev => {
       const newList = prev.filter(c => c.id !== id).map(c => enable ? { ...c, enabled: false } : c);
       return [updatedComp, ...newList];   
    });

    setSelectedCompanionId(id);
    if (enable) setCompanionEnabled(true);
    setPreviewDirty(false);
    
    addRecord("昵称", companionNickname, "已保存");
    addRecord("角色设定", companionRole, "已保存");
    addRecord("性格设定", companionPersonality.join("、"), "已保存");
    if (enable) {
       addRecord("启用状态", "已启用", "成功");
       showToast("AI 学伴配置已保存并启用");
       addLog("保存并启用 AI 学伴");
    } else {
       showToast("AI 学伴配置已保存");
       addLog("保存配置草稿");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
         <h1 className="text-base font-black text-zinc-900">AI学伴配置</h1>
         <p className="text-xs text-zinc-500 font-semibold mt-1">为学生配置专属 AI 学伴，用于学习答疑、技能分析、实验指导和学习路径建议。</p>
      </div>

      {companionToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#10A66A] text-white text-[11px] font-black px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4"/> {companionToast}
        </div>
      )}

      {/* Main 3 columns */}
      <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Col 1: List */}
          <div className="xl:w-64 shrink-0 bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col gap-3 h-fit">
             <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                 <h3 className="font-bold text-zinc-900 text-sm">我的 AI 学伴</h3>
                 <button onClick={handleCreateNew} className="text-[#10A66A] hover:bg-[#EAF8F1] px-2 py-1.5 rounded-lg transition-colors flex items-center text-xs font-bold gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5"/> 新建学伴
                 </button>
             </div>
             <div className="space-y-2">
                 {companionList.map(comp => (
                    <div 
                      key={comp.id} 
                      onClick={() => handleSelectCompanion(comp)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedCompanionId === comp.id ? 'bg-[#EAF8F1] border-[#10A66A]' : 'bg-white border-zinc-200 hover:border-[#10A66A] hover:shadow-sm'}`}
                    >
                       <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                              {comp.avatar === 'robot-green' ? <BotIcon className="text-[#10A66A]"/> : 
                               comp.avatar === 'robot-blue' ? <BotIcon className="text-blue-500"/> :
                               comp.avatar === 'robot-purple' ? <BotIcon className="text-purple-500"/> :
                               <UserIcon className="text-orange-500"/>}
                           </div>
                           <div className="flex-1 min-w-0">
                               <div className="text-xs font-bold text-zinc-900 truncate">{comp.nickname}</div>
                               <div className="text-[10px] text-zinc-500 truncate mt-0.5">{comp.role}</div>
                           </div>
                       </div>
                       <div className="flex items-center justify-between mt-3">
                           <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${comp.enabled ? 'bg-[#10A66A] text-white' : 'bg-zinc-100 text-zinc-500'}`}>{comp.enabled ? '已启用' : '未启用'}</span>
                           <span className="text-[9px] text-zinc-400 font-mono">{comp.updatedAt}</span>
                       </div>
                    </div>
                 ))}
             </div>
          </div>

          {/* Col 2: Form */}
          <div className="flex-1 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-6">
              
              <div>
                 <h3 className="font-bold text-zinc-900 text-sm mb-4 flex items-center gap-1.5"><Settings className="w-4 h-4 text-[#10A66A]"/> 基础配置</h3>
                 
                 <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1.5">学伴昵称</label>
                        <input 
                           type="text" 
                           value={companionNickname}
                           onChange={e => { setCompanionNickname(e.target.value); setPreviewDirty(true); addLog(`修改昵称：${e.target.value}`); }}
                           className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-[#10A66A] focus:ring-1 focus:ring-[#10A66A]/20"
                           placeholder="请输入学伴昵称"
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1.5">头像设置</label>
                        <div className="flex flex-wrap items-center gap-3">
                           {['robot-green', 'robot-blue', 'robot-purple', 'human'].map(av => (
                              <div 
                                key={av}
                                onClick={() => { setCompanionAvatar(av); setPreviewDirty(true); addLog(`切换头像：${av}`); }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${companionAvatar === av ? 'ring-2 ring-offset-2 ring-[#10A66A] bg-[#EAF8F1]' : 'border border-zinc-200 hover:border-[#10A66A] bg-zinc-50'}`}
                              >
                                 <BotIcon className={av === 'robot-green' ? 'text-[#10A66A]' : av === 'robot-blue' ? 'text-blue-500' : av === 'robot-purple' ? 'text-purple-500' : 'text-orange-500'}/>
                              </div>
                           ))}
                           {companionAvatar === "custom-avatar" && (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-[#10A66A] bg-orange-100">
                                 <UserIcon className="text-orange-600"/>
                              </div>
                           )}
                           <div className="w-px h-6 bg-zinc-200 ml-1"></div>
                           <button onClick={handleUploadAvatar} className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
                               {avatarUploadStatus ? <RefreshCcw className="w-3.5 h-3.5 animate-spin"/> : <ImageIcon className="w-3.5 h-3.5"/>}
                               {avatarUploadStatus || "上传头像"}
                           </button>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1.5">角色设定</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                           {[
                             { name: "学习导师", desc: "负责学习规划、知识答疑和学习方法建议。" },
                             { name: "实验助教", desc: "负责实验步骤讲解、错误排查和操作提醒。" },
                             { name: "技能分析师", desc: "负责分析技能掌握度、薄弱能力点和提升方向。" },
                             { name: "职业规划顾问", desc: "负责结合技能画像推荐岗位方向和成长路径。" },
                             { name: "课程答疑助手", desc: "负责围绕课程知识点进行问答辅导。" }
                           ].map(r => (
                              <div 
                                key={r.name}
                                onClick={() => { setCompanionRole(r.name); setPreviewDirty(true); addLog(`选择角色：${r.name}`); }}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${companionRole === r.name ? 'border-[#10A66A] bg-[#EAF8F1]/50' : 'border-zinc-200 hover:border-[#10A66A] bg-zinc-50 hover:bg-white'}`}
                              >
                                  <div className="text-xs font-bold text-zinc-900">{r.name}</div>
                                  <div className="text-[10px] text-zinc-500 mt-1 leading-snug">{r.desc}</div>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1.5">性格设定</label>
                        <div className="flex flex-wrap gap-2">
                           {["耐心细致", "积极鼓励", "严谨专业", "活泼亲和", "简洁直接"].map(tag => (
                              <button 
                                key={tag}
                                onClick={() => handlePersonalityChange(tag)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${companionPersonality.includes(tag) ? 'border-[#10A66A] bg-[#10A66A] text-white' : 'border-zinc-200 bg-white text-zinc-600 hover:border-[#10A66A]'}`}
                              >
                                 {tag}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1.5">能力范围</label>
                        <div className="flex flex-wrap gap-3">
                           {["学习答疑", "实验指导", "技能诊断", "学习路径推荐", "考试复习建议", "职业能力分析"].map(ab => (
                              <div key={ab} className="flex items-center gap-1.5">
                                 <button
                                    onClick={() => handleAbilityChange(ab)}
                                    className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${companionAbilities.includes(ab) ? 'bg-[#10A66A]' : 'bg-zinc-300'}`}
                                 >
                                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all ${companionAbilities.includes(ab) ? 'left-[17px]' : 'left-[1px]'}`}></div>
                                 </button>
                                 <span className="text-xs font-bold text-zinc-700">{ab}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-100 pt-4">
                        <div>
                           <label className="block text-xs font-bold text-zinc-700 mb-1.5">服务对象</label>
                           <input type="text" disabled value="学生1" className="w-full bg-zinc-100 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-500 cursor-not-allowed"/>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-zinc-700 mb-1.5">适用课程</label>
                           <input type="text" disabled value="Python基础、区块链实训..." className="w-full bg-zinc-100 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-500 cursor-not-allowed"/>
                        </div>
                     </div>

                     <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
                         <label className="block text-xs font-bold text-zinc-700">启用状态</label>
                         <button onClick={() => {setCompanionEnabled(!companionEnabled); setPreviewDirty(true);}} className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${companionEnabled ? 'bg-[#10A66A]' : 'bg-zinc-300'}`}>
                             <div className={`w-4 h-4 bg-white rounded-full absolute top-[2px] transition-all shadow-sm ${companionEnabled ? 'left-[22px]' : 'left-[2px]'}`}></div>
                         </button>
                     </div>

                     <div className="border-t border-zinc-100 pt-4">
                        <label className="block text-xs font-bold text-zinc-700 mb-1.5">学伴行为设定</label>
                        <div className="space-y-3">
                           <textarea 
                              value={companionOpeningMessage}
                              onChange={e => { setCompanionOpeningMessage(e.target.value); setPreviewDirty(true); }}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-800 outline-none focus:border-[#10A66A] h-20 resize-none"
                              placeholder="开场白设定..."
                           />
                           <textarea 
                              value={companionReplyStyle}
                              onChange={e => { setCompanionReplyStyle(e.target.value); setPreviewDirty(true); }}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-800 outline-none focus:border-[#10A66A] h-20 resize-none"
                              placeholder="回答风格设定..."
                           />
                           <div className="flex items-center gap-2">
                              <button onClick={handleGenerateSettings} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded text-[11px] font-bold transition-colors cursor-pointer">生成推荐设定</button>
                              <button onClick={() => showToast("已应用设定")} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-[11px] font-bold transition-colors cursor-pointer">应用设定</button>
                           </div>
                        </div>
                     </div>

                 </div>

                 <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                    <button onClick={() => showToast("已取消")} className="px-5 py-2 rounded-lg text-zinc-500 font-bold text-xs hover:bg-zinc-100 transition-colors cursor-pointer">取消修改</button>
                    <button onClick={() => handleSave(false)} className="px-5 py-2 rounded-lg border border-[#10A66A] text-[#10A66A] font-black text-xs hover:bg-[#EAF8F1] transition-colors flex items-center gap-1.5 cursor-pointer"><Save className="w-4 h-4"/> 保存配置</button>
                    <button onClick={() => handleSave(true)} className="px-5 py-2 rounded-lg bg-[#10A66A] text-white font-black text-xs hover:bg-[#0CA061] transition-colors flex items-center gap-1.5 shadow-sm shadow-[#10A66A]/20 cursor-pointer"><CheckCircle2 className="w-4 h-4"/> 保存并启用</button>
                 </div>
              </div>

          </div>

          {/* Col 3: Preview & Chat */}
          <div className="xl:w-80 shrink-0 flex flex-col gap-5">
              
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5"><Monitor className="w-4 h-4 text-[#10A66A]"/> 学伴预览</h3>
                     <span className={`text-[10px] font-black px-2 py-0.5 rounded ${previewDirty ? 'bg-orange-100 text-orange-600' : 'bg-[#EAF8F1] text-[#10A66A]'}`}>{previewDirty ? '未保存修改' : '已保存'}</span>
                 </div>
                 
                 <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white ring-4 ring-[#EAF8F1] flex items-center justify-center mb-3 shadow-sm">
                        {companionAvatar === 'robot-green' ? <BotIcon className="text-[#10A66A] w-8 h-8"/> : 
                         companionAvatar === 'robot-blue' ? <BotIcon className="text-blue-500 w-8 h-8"/> :
                         companionAvatar === 'robot-purple' ? <BotIcon className="text-purple-500 w-8 h-8"/> :
                         <UserIcon className="text-orange-500 w-8 h-8"/>}
                    </div>
                    <div className="text-sm font-black text-zinc-900 text-center mb-1">{companionNickname || '未命名'}</div>
                    <div className="flex gap-2 justify-center mb-3">
                       <span className="text-[10px] font-bold text-[#10A66A] bg-[#EAF8F1] px-2 py-0.5 rounded uppercase">{companionRole || '未设置角色'}</span>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${companionEnabled && !previewDirty ? 'text-white bg-[#10A66A]' : 'text-zinc-500 bg-zinc-200'}`}>
                          {companionEnabled && !previewDirty ? '已启用' : '未启用'}
                       </span>
                    </div>
                    
                    <div className="w-full space-y-2">
                       <div className="flex items-start gap-2">
                          <span className="text-[10px] text-zinc-400 font-bold shrink-0 mt-0.5">性格</span>
                          <div className="flex flex-wrap gap-1">
                             {companionPersonality.map(p => <span key={p} className="text-[9px] bg-zinc-200/50 text-zinc-600 px-1.5 py-0.5 rounded">{p}</span>)}
                          </div>
                       </div>
                       <div className="flex items-start gap-2">
                          <span className="text-[10px] text-zinc-400 font-bold shrink-0 mt-0.5">能力</span>
                          <div className="flex flex-wrap gap-1">
                             {companionAbilities.map(a => <span key={a} className="text-[9px] bg-zinc-200/50 text-zinc-600 px-1.5 py-0.5 rounded">{a}</span>)}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col flex-1 min-h-[350px]">
                 <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                     <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-[#10A66A]"/> 试聊当前 AI 学伴</h3>
                 </div>
                 
                 <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#f8fcfb]">
                    <div className="flex items-center justify-center my-2">
                       <span className="text-[9px] text-zinc-400 bg-zinc-100 px-2 py-1 rounded-full font-mono">Chat Preview</span>
                    </div>
                    {chatMessages.map((m, i) => (
                       <div key={i} className={`flex max-w-[90%] ${m.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                          <div className={`p-2.5 rounded-xl text-xs font-bold leading-relaxed ${m.sender === 'user' ? 'bg-[#10A66A] text-white rounded-tr-none' : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none shadow-sm'}`}>
                             {m.text}
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="p-3 border-t border-zinc-100 bg-white rounded-b-xl">
                    <div className="flex flex-wrap gap-1 mb-2">
                       {["我最近 Python 学得怎么样？", "我的实验完成率较低怎么办？", "请帮我推荐下一步学习路径。"].map(q => (
                          <button key={q} onClick={() => handleSendChat(q)} className="text-[9px] px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-full font-medium truncate max-w-full cursor-pointer">{q}</button>
                       ))}
                    </div>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={chatInput}
                         onChange={e => setChatInput(e.target.value)}
                         onKeyDown={(e) => { if(e.key==='Enter') handleSendChat(chatInput); }}
                         placeholder="请输入你想咨询的问题"
                         className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-800 outline-none focus:border-[#10A66A]"
                       />
                       <button onClick={() => handleSendChat(chatInput)} className="bg-[#10A66A] hover:bg-[#0CA061] text-white p-2 rounded-lg transition-colors cursor-pointer shadow-xs"><Send className="w-3.5 h-3.5"/></button>
                       <button onClick={() => setChatMessages([])} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 p-2 rounded-lg transition-colors cursor-pointer" title="清空对话"><RefreshCcw className="w-3.5 h-3.5"/></button>
                    </div>
                 </div>
              </div>

          </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-2">
          {/* Config Records */}
          <div className="flex-1 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm h-64 flex flex-col">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5 mb-4"><ListChecks className="w-4 h-4 text-[#10A66A]"/> 配置记录</h3>
              <div className="flex-1 overflow-y-auto">
                 <table className="w-full text-left text-[11px]">
                     <thead className="bg-zinc-50 text-zinc-500 font-bold sticky top-0">
                         <tr>
                             <th className="p-2 border-b border-zinc-100">时间</th>
                             <th className="p-2 border-b border-zinc-100">学伴昵称</th>
                             <th className="p-2 border-b border-zinc-100">配置项</th>
                             <th className="p-2 border-b border-zinc-100">变更内容</th>
                             <th className="p-2 border-b border-zinc-100">状态</th>
                         </tr>
                     </thead>
                     <tbody className="text-zinc-700 font-medium">
                         {configRecords.map((r, i) => (
                             <tr key={i} className="hover:bg-zinc-50 border-b border-zinc-100/50 last:border-0 pointer-events-none">
                                 <td className="p-2 font-mono text-zinc-500">{r.time}</td>
                                 <td className="p-2 font-bold">{r.nickname}</td>
                                 <td className="p-2 text-zinc-500">{r.field}</td>
                                 <td className="p-2 max-w-[120px] truncate" title={r.content}>{r.content}</td>
                                 <td className="p-2"><span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${r.status === '成功' ? 'bg-[#EAF8F1] text-[#10A66A]' : 'bg-zinc-100 text-zinc-500'}`}>{r.status}</span></td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
              </div>
          </div>

          {/* Operation Logs */}
          <div className="flex-1 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm h-64 flex flex-col">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5 mb-4"><FileText className="w-4 h-4 text-[#10A66A]"/> 操作日志</h3>
              <div className="flex-1 overflow-y-auto space-y-2">
                  {operationLogs.map((log, i) => (
                     <div key={i} className="flex items-center gap-3 text-[11px] hover:bg-zinc-50 p-1.5 rounded cursor-default border border-transparent hover:border-zinc-100">
                        <span className="text-zinc-400 font-mono w-16 shrink-0">{log.time}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10A66A] shrink-0"></div>
                        <span className="text-zinc-700 font-bold flex-1">{log.action}</span>
                        <span className="bg-[#EAF8F1] text-[#10A66A] px-1.5 py-0.5 rounded text-[9px] font-black shrink-0">{log.status}</span>
                     </div>
                  ))}
              </div>
          </div>
      </div>

    </div>
  );
}

// Simple internal icon components
function BotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function Monitor({ className }: { className?: string }) {
  return (
     <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
     </svg>
  )
}
