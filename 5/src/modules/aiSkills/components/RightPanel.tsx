import { AiApp } from '../data';
import { CheckCircle2, MessageSquare, ListTodo, Edit, X, Save, Copy, FileText, Eye, Sparkles, Database, Layout } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface RightPanelProps {
  selectedApp: AiApp | null;
  createMode: 'none' | 'select' | 'dialog' | 'info';
  editingAppId: string | null;
  searchKeyword: string;
  onCreateDialog: () => void;
  onCreateInfo: () => void;
  onCancelCreate: () => void;
  onCancelEdit: () => void;
  onSave: (app: AiApp) => void;
  onDelete: () => void;
  onEdit: () => void;
}

export default function RightPanel({ 
  selectedApp, createMode, editingAppId, searchKeyword,
  onCreateDialog, onCreateInfo, onCancelCreate, onCancelEdit, onSave, onDelete, onEdit
}: RightPanelProps) {

  if (createMode === 'select') {
    return <SelectCreationModePanel onCreateDialog={onCreateDialog} onCreateInfo={onCreateInfo} onCancel={onCancelCreate} />;
  }

  if (createMode === 'dialog') {
    return <DialogCreatePanel onCancel={onCancelCreate} onSave={onSave} />;
  }

  if (createMode === 'info' || editingAppId) {
    return <InfoCreatePanel app={editingAppId ? selectedApp : null} onCancel={editingAppId ? onCancelEdit : onCancelCreate} onSave={onSave} />;
  }

  if (!selectedApp) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6">
         <BotIcon className="w-16 h-16 mb-4 text-gray-300" />
         <p>请在左侧列表中选择一个 AI 应用</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col overflow-y-auto">
      {/* App Details Section */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-2 mb-6">应用详情</h2>
        
        <div className="space-y-4 text-sm">
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">应用名称：</span>
            <span className="text-gray-900 font-bold">{selectedApp.name}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">应用场景：</span>
            <span className="text-gray-900">{selectedApp.scene}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">工具类型：</span>
            <span className="text-gray-900">{selectedApp.toolType}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">所属课程：</span>
            <span className="text-gray-900">{selectedApp.course}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">应用状态：</span>
            <span className={`font-semibold ${selectedApp.status === '已发布' ? 'text-emerald-600' : selectedApp.status === '草稿' ? 'text-gray-600' : 'text-orange-600'}`}>
              {selectedApp.status}
            </span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">创建方式：</span>
            <span className="text-gray-900">{selectedApp.createMode}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">关联知识库：</span>
            <div className="flex flex-col gap-1.5">
              {selectedApp.knowledgeBases.map((kb, idx) => (
                <span key={idx} className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-100">
                  <Database className="w-3 h-3" /> {kb}
                </span>
              ))}
              {selectedApp.knowledgeBases.length === 0 && <span className="text-gray-400">无</span>}
            </div>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">应用能力：</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedApp.capabilities.map((cap, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{cap}</span>
              ))}
            </div>
          </div>

          {searchKeyword && (
             <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
               <div className="text-xs font-bold text-yellow-800 mb-1">匹配说明：</div>
               <div className="text-xs text-yellow-700 leading-relaxed">
                 该应用命中关键词“<span className="font-bold">{searchKeyword}</span>”，请查看高亮标记。
               </div>
             </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-8">
          <button onClick={onEdit} className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-md hover:bg-emerald-100 transition-colors border border-emerald-200">
            <Edit className="w-4 h-4" /> 编辑应用
          </button>
          <button onClick={onDelete} className="w-full flex items-center justify-center gap-2 py-2 bg-white text-red-600 font-bold rounded-md hover:bg-red-50 transition-colors border border-red-200">
            删除应用
          </button>
          <button className="w-full flex items-center justify-center gap-2 py-2 bg-white text-gray-600 font-bold rounded-md hover:bg-gray-50 transition-colors border border-gray-200">
            查看运行记录
          </button>
        </div>
      </div>

      {/* Category Info Section */}
      <div className="p-6 bg-gray-50 flex-1">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
          <Layout className="w-4 h-4 text-emerald-600" /> 分类说明
        </h3>
        <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
          <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
            <span className="font-bold text-gray-800 block mb-1">应用场景：</span>
            用于区分 AI 应用服务的教学业务场景，例如课程教学、实验指导、考试训练、学情分析等。
          </div>
          <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
            <span className="font-bold text-gray-800 block mb-1">工具类型：</span>
            用于区分 AI 应用的功能形态，例如对话助手、知识库问答、工作流应用、智能体应用、批改工具和分析工具等。
          </div>
          <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
            <span className="font-bold text-gray-800 block mb-1">模糊查询：</span>
            支持通过应用名称、课程名称、应用描述、知识库名称和关键词快速查找相关 AI 应用。
          </div>
        </div>
      </div>

    </div>
  );
}

// ----- Dummy components to prevent breaking -----
function BotIcon({ className }: { className?: string }) { return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>; }

function SelectCreationModePanel({ onCreateDialog, onCreateInfo, onCancel }: { onCreateDialog: () => void, onCreateInfo: () => void, onCancel: () => void }) {
  return (
    <div className="h-full bg-white flex flex-col p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-2">选择创建 AI 应用方式</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
      </div>

      <div className="flex-1 space-y-6 flex flex-col justify-start mt-2">
        <div onClick={onCreateDialog} className="group cursor-pointer border border-emerald-200 hover:border-emerald-500 hover:shadow-md bg-emerald-50/40 rounded-xl p-6 transition-all relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
             <Sparkles className="w-24 h-24 text-emerald-600" />
           </div>
           <div className="flex items-start gap-4 relative z-10">
             <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
                <MessageSquare className="w-8 h-8"/>
             </div>
             <div>
               <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-emerald-700 transition-colors">对话引导式创建</h3>
               <p className="text-sm text-gray-600 leading-relaxed mb-3">
                 系统通过多轮自然语言对话，自动采集您的需求并生成应用配置。适合刚接触应用配置、或希望快速生成应用的教师使用。
               </p>
               <div className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full font-medium">适合：课程答疑、学习辅导等快速搭建场景</div>
             </div>
           </div>
        </div>

        <div onClick={onCreateInfo} className="group cursor-pointer border border-gray-200 hover:border-emerald-500 hover:shadow-md bg-white rounded-xl p-6 transition-all relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
             <FileText className="w-24 h-24 text-gray-600" />
           </div>
           <div className="flex items-start gap-4 relative z-10">
             <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <ListTodo className="w-8 h-8"/>
             </div>
             <div>
               <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-emerald-700 transition-colors">信息引导式创建</h3>
               <p className="text-sm text-gray-600 leading-relaxed mb-3">
                 通过填写结构化的配置表单，精确控制应用的各类参数、能力模型和知识库挂载。适合需要专业或定制化设置的场景。
               </p>
               <div className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">适合：专业能力评估、技能诊断等精确控制场景</div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function DialogCreatePanel({ onCancel, onSave }: { onCancel: () => void, onSave: (app: AiApp) => void }) {
  const [messages, setMessages] = useState([
    { role: 'system', content: '您好！我是AI应用构建助手。请问您想要创建一个什么类型的AI应用？您可以告诉我它的用途、面向人群等。' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = () => {
    if(!inputMsg.trim()) return;
    setMessages([...messages, { role: 'user', content: inputMsg }]);
    setInputMsg('');
    setIsGenerating(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'system', content: '好的，我已经理解您的需求。正在为您生成AI应用配置...' }]);
      
      setTimeout(() => {
        setIsGenerating(false);
      }, 1500);
    }, 1000);
  };

  const handleDraftSave = () => {
    onSave({
      id: "app-" + Date.now(),
      name: "新生成应用 (草稿)",
      scene: "未分类",
      toolType: "对话助手",
      course: "通用",
      status: "草稿",
      createMode: "对话引导式创建",
      knowledgeBases: [],
      usageCount: 0,
      updatedAt: "刚刚",
      description: "通过对话自动生成的AI助手",
      capabilities: ["通用对话"]
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-bold text-lg text-gray-800">对话引导式创建</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-center mt-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 w-full text-center shadow-sm">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-emerald-500 animate-pulse" />
              <div className="text-sm font-bold text-gray-700 mb-1">正在配置应用参数...</div>
              <div className="text-xs text-gray-500">正在生成系统提示词及能力模型挂载</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        {!isGenerating && messages.length > 2 && (
           <div className="mb-3 flex gap-2">
             <button onClick={handleDraftSave} className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-md text-sm hover:bg-emerald-700 transition-colors">
               采用配置并保存草稿
             </button>
           </div>
        )}
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="输入您的需求，例如：我需要一个能解答Python基础题的助手"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button onClick={handleSend} disabled={isGenerating || !inputMsg.trim()} className="p-2 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 disabled:opacity-50">
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCreatePanel({ app, onCancel, onSave }: { app: AiApp | null, onCancel: () => void, onSave: (app: AiApp) => void }) {
  const [formData, setFormData] = useState({
    name: app?.name || '',
    scene: app?.scene || '课程教学',
    toolType: app?.toolType || '对话助手',
    course: app?.course || '',
    description: app?.description || ''
  });

  const handleSave = () => {
    if(!formData.name.trim()) return alert('请输入名称');
    onSave({
      id: app ? app.id : "app-" + Date.now(),
      name: formData.name,
      scene: formData.scene,
      toolType: formData.toolType,
      course: formData.course || "通用",
      status: app ? app.status : "草稿",
      createMode: app ? app.createMode : "信息引导式创建",
      knowledgeBases: app ? app.knowledgeBases : [],
      usageCount: app ? app.usageCount : 0,
      updatedAt: "刚刚",
      description: formData.description,
      capabilities: app ? app.capabilities : ["通用对话"]
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-bold text-lg text-gray-800">{app ? '编辑AI应用' : '信息引导式创建'}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">应用名称 <span className="text-red-500">*</span></label>
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="例如：Python答疑助手" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">应用场景</label>
            <select value={formData.scene} onChange={e => setFormData({...formData, scene: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white">
              <option>全部场景</option>
              <option>课程教学</option>
              <option>实验指导</option>
              <option>学习辅导</option>
              <option>考试训练</option>
              <option>作业批改</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">工具类型</label>
            <select value={formData.toolType} onChange={e => setFormData({...formData, toolType: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white">
              <option>对话助手</option>
              <option>知识库问答</option>
              <option>智能体应用</option>
              <option>工作流应用</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">所属课程</label>
          <input type="text" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-emerald-500 outline-none" placeholder="例如：Python基础与应用" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">应用描述</label>
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-24 resize-none focus:ring-emerald-500 outline-none" placeholder="简要描述应用的功能和用途..." />
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-gray-700 text-sm">关联知识库资源</span>
            <button className="text-xs text-emerald-600 font-medium">+ 挂载知识库</button>
          </div>
          <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded text-center border border-dashed border-gray-200">
            暂未挂载知识库资源
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
        <button onClick={onCancel} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded shadow-sm hover:bg-gray-50">取消</button>
        <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded shadow-sm hover:bg-emerald-700 flex items-center gap-1.5"><Save className="w-4 h-4"/>保存</button>
      </div>
    </div>
  );
}
