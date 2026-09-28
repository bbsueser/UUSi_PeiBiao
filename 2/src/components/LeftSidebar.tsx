import { LayoutGrid, Database, MessageSquare, BookOpen, Settings, Send, History, Cpu, FileText, Bot } from 'lucide-react';
import { AiApp, KnowledgeBase } from '../data';

interface LeftSidebarProps {
  activeMenu: string;
  setActiveMenu: (m: string) => void;
  // KB Props
  kbList: KnowledgeBase[];
  selectedCourseType: string;
  onSelectCourseType: (c: string) => void;
  // App Props
  aiAppList: AiApp[];
  selectedSceneCategory: string;
  onSelectSceneCategory: (c: string) => void;
  onCreateSelect: () => void;
}

export default function LeftSidebar({
  activeMenu, setActiveMenu,
  kbList, selectedCourseType, onSelectCourseType,
  aiAppList, selectedSceneCategory, onSelectSceneCategory, onCreateSelect
}: LeftSidebarProps) {
  
  const aiAppCategories = ['全部场景', '课程教学', '实验指导', '学习辅导', '考试训练', '作业批改', '学情分析', '技能诊断', '知识问答', '教学备课'];
  const kbCourseTypes = ['全部课程', '编程开发', '区块链', '物联网', '数据分析', '人工智能'];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shrink-0 overflow-y-auto flex flex-col">
      {/* Target Module: AI技能助手 */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">AI技能助手</h2>
        <ul className="space-y-1">
          {[
            { name: 'AI问答助手', icon: <Bot className="w-4 h-4" /> },
            { name: '课程答疑', icon: <MessageSquare className="w-4 h-4" /> },
            { name: '实验指导', icon: <Cpu className="w-4 h-4" /> },
            { name: '技能提升', icon: <LineChartIcon className="w-4 h-4" /> },
            { name: '学习路径推荐', icon: <BookOpen className="w-4 h-4" /> },
            { name: '知识库管理', icon: <Database className="w-4 h-4" /> },
            { name: '课程AI助手设置', icon: <Settings className="w-4 h-4" /> },
            { name: '问答记录', icon: <History className="w-4 h-4" /> },
            { name: '应用配置', icon: <Settings className="w-4 h-4" /> }
          ].map(item => (
            <li key={item.name}>
              <button 
                onClick={() => setActiveMenu(item.name)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors border ${activeMenu === item.name ? 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm' : 'text-gray-600 hover:bg-gray-100 border-transparent'}`}
              >
                {item.icon} {item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">其他模块</h2>
        <ul className="space-y-1">
          <li>
            <button 
              onClick={() => setActiveMenu('AI应用管理')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors border ${activeMenu === 'AI应用管理' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm' : 'text-gray-500 hover:bg-gray-100 border-transparent'}`}
            >
              <LayoutGrid className="w-4 h-4" /> AI应用管理
            </button>
          </li>
        </ul>
      </div>

      {/* Filters (Dynamic based on active module) */}
      <div className="p-4 flex-1">
        {activeMenu === '知识库管理' ? (
          <>
            <h3 className="text-sm font-bold text-gray-900 mb-3 px-2 flex items-center gap-2 border-l-4 border-emerald-500 hover:bg-gray-50 cursor-pointer">
              课程类型
            </h3>
            <ul className="space-y-1 mb-6">
              {kbCourseTypes.map(cat => {
                const count = cat === '全部课程' ? kbList.length : kbList.filter(k => k.courseType === cat).length;
                const matches = (cat === '全部课程' && selectedCourseType === '全部类型') || selectedCourseType === cat;
                return (
                  <li key={cat}>
                    <button 
                      onClick={() => onSelectCourseType(cat === '全部课程' ? '全部类型' : cat)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ${matches ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'}`}
                    >
                      <span>{cat}</span>
                      <span className={`text-xs px-1.5 rounded-full ${matches ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : activeMenu === '课程AI助手设置' ? null : (
          <>
            <h3 className="text-sm font-bold text-gray-900 mb-3 px-2 flex items-center gap-2 border-l-4 border-emerald-500 hover:bg-gray-50 cursor-pointer">
              应用场景分类
            </h3>
            <ul className="space-y-1 mb-6">
              {aiAppCategories.map(cat => {
                const count = cat === '全部场景' ? aiAppList.length : aiAppList.filter(a => a.scene === cat).length;
                return (
                  <li key={cat}>
                    <button 
                      onClick={() => onSelectSceneCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ${selectedSceneCategory === cat ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'}`}
                    >
                      <span>{cat}</span>
                      <span className={`text-xs px-1.5 rounded-full ${selectedSceneCategory === cat ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function LineChartIcon({className}:{className?:string}){return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>}
