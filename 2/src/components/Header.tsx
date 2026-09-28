import { Bot, Plus, RefreshCw, Search, RotateCcw, Box, Database, FileText, Type, AppWindow, Save, MonitorUp } from 'lucide-react';

interface HeaderProps {
  activeMenu: string;
  inputValue: string;
  setInputValue: (val: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onCreateSelect: () => void;
  searchKeyword: string;
  resultCount: number;
  onSaveCourseConfig?: () => void;
  courseStats?: { total: number; enabled: number; linkedApps: number; charted: number; };
}

export default function Header({ 
  activeMenu, inputValue, setInputValue, onSearch, onReset, onCreateSelect, searchKeyword, resultCount, onSaveCourseConfig, courseStats
}: HeaderProps) {
  const isKb = activeMenu === '知识库管理';
  const isCourseSettings = activeMenu === '课程AI助手设置';

  let currentModuleText = '当前模块';
  if (isKb) currentModuleText = '知识库管理';
  if (isCourseSettings) currentModuleText = '课程AI助手设置';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col shrink-0 shadow-sm z-20">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-bold text-gray-900">学科大模型平台</h1>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full border border-emerald-100 font-medium">私有化部署运行中</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span className="font-semibold text-emerald-700">AI技能助手 / {currentModuleText}</span>
              <span className="text-gray-300">|</span>
              <span>教师1</span>
            </div>
          </div>
          
          <div className="h-10 w-px bg-gray-200 mx-4"></div>

          {/* Search Area & Optional KB Stats */}
          {isKb ? (
             <div className="flex flex-col gap-2">
               <div className="flex gap-4 mb-1">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 font-medium"><Database className="w-3 h-3 text-emerald-600" /> 知识库总数: <span className="text-gray-900 font-bold">8 个</span></div>
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 font-medium"><FileText className="w-3 h-3 text-blue-600" /> 文档总数: <span className="text-gray-900 font-bold">286 个</span></div>
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 font-medium"><Type className="w-3 h-3 text-orange-600" /> 知识库总字数: <span className="text-gray-900 font-bold">128.6 万字</span></div>
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 font-medium"><AppWindow className="w-3 h-3 text-purple-600" /> 管理应用总数: <span className="text-gray-900 font-bold">18 个</span></div>
               </div>
               <div className="flex items-center gap-2 w-[450px]">
                 <div className="relative flex-1">
                   <input 
                     type="text" 
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                     placeholder="请输入课程名称、知识库名称或关键词"
                     className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                   />
                   <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
                 </div>
                 <button onClick={onSearch} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-1">
                   <Search className="w-3.5 h-3.5"/> 搜索
                 </button>
                 <button onClick={onReset} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-1">
                   <RotateCcw className="w-3.5 h-3.5"/> 重置
                 </button>
               </div>
             </div>
          ) : isCourseSettings ? (
             <div className="flex flex-col gap-2">
               <div className="flex gap-4 mb-1">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 font-medium"><Database className="w-3 h-3 text-emerald-600" /> 课程总数: <span className="text-gray-900 font-bold">{courseStats?.total || 0} 门</span></div>
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 font-medium"><FileText className="w-3 h-3 text-blue-600" /> 已启用: <span className="text-gray-900 font-bold">{courseStats?.enabled || 0} 门</span></div>
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 font-medium"><AppWindow className="w-3 h-3 text-purple-600" /> 已关联应用: <span className="text-gray-900 font-bold">{courseStats?.linkedApps || 0} 个</span></div>
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 font-medium"><MonitorUp className="w-3 h-3 text-orange-600" /> 已配置图表: <span className="text-gray-900 font-bold">{courseStats?.charted || 0} 门</span></div>
               </div>
               <div className="flex items-center gap-2 w-[450px]">
                 <div className="relative flex-1">
                   <input 
                     type="text" 
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                     placeholder="请输入课程名称或 AI 应用名称"
                     className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                   />
                   <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
                 </div>
                 <button onClick={onSearch} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-1">
                   <Search className="w-3.5 h-3.5"/> 搜索
                 </button>
                 <button onClick={onReset} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-1">
                   <RotateCcw className="w-3.5 h-3.5"/> 重置
                 </button>
               </div>
             </div>
          ) : (
            <div className="flex flex-col w-[500px]">
               <div className="flex items-center gap-2">
                 <div className="relative flex-1">
                   <input 
                     type="text" 
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                     placeholder="请输入应用名称、课程名称、关键词或应用描述"
                     className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                   />
                   <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                 </div>
                 <button onClick={onSearch} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-1.5">
                   <Search className="w-4 h-4"/> 搜索
                 </button>
                 <button onClick={onReset} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-1.5">
                   <RotateCcw className="w-4 h-4"/> 重置
                 </button>
               </div>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 shrink-0">
          {isKb ? (
            <>
              <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors border border-gray-200 shadow-sm whitespace-nowrap">
                <RefreshCw className="w-4 h-4 text-gray-500" />
                刷新统计
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors border border-gray-200 shadow-sm whitespace-nowrap">
                <Box className="w-4 h-4 text-gray-500" />
                批量管理
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-white text-emerald-700 hover:bg-emerald-50 rounded-md text-sm font-medium transition-colors border border-emerald-200 shadow-sm whitespace-nowrap">
                <FileText className="w-4 h-4" />
                导入课程资料
              </button>
              <button className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                <Plus className="w-4 h-4" />
                新建知识库
              </button>
            </>
          ) : isCourseSettings ? (
            <>
               <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors border border-gray-200 shadow-sm whitespace-nowrap">
                <RefreshCw className="w-4 h-4 text-gray-500" />
                刷新课程
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors border border-gray-200 shadow-sm whitespace-nowrap">
                <Box className="w-4 h-4 text-gray-500" />
                批量启用
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors border border-gray-200 shadow-sm whitespace-nowrap">
                <FileText className="w-4 h-4 text-gray-500" />
                导出配置
              </button>
              <button onClick={onSaveCourseConfig} className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                <Save className="w-4 h-4" />
                保存配置
              </button>
            </>
          ) : (
            <>
              <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors border border-gray-200 shadow-sm whitespace-nowrap">
                <RefreshCw className="w-4 h-4 text-gray-500" />
                刷新列表
              </button>
              <button onClick={onCreateSelect} className="flex items-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                <Plus className="w-4 h-4" />
                创建AI应用
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Search Info Footer */}
      {(searchKeyword || inputValue) && (
        <div className="mt-3 text-xs flex gap-6 text-gray-500 ml-[230px]">
          <div>当前关键词：<span className="font-semibold text-gray-800">{searchKeyword || '-'}</span></div>
          <div>搜索结果：共找到 <span className="font-semibold text-emerald-600">{resultCount}</span> 个结果</div>
        </div>
      )}
    </header>
  );
}
