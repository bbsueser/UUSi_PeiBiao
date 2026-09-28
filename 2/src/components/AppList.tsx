import { AiApp } from '../data';
import { Search, PlusCircle, X } from 'lucide-react';

interface AppListProps {
  apps: AiApp[];
  aiAppList: AiApp[];
  selectedId: string | null;
  selectedToolType: string;
  onSelectToolType: (type: string) => void;
  searchKeyword: string;
  selectedSceneCategory: string;
  onClearScene: () => void;
  onClearToolType: () => void;
  onClearKeyword: () => void;
  onClearAll: () => void;
  onSelect: (id: string) => void;
  onEdit: (app: AiApp) => void;
  onDelete: (app: AiApp) => void;
  onCreateApp: () => void;
}

export default function AppList({ 
  apps, aiAppList, selectedId, onSelect, onEdit, onDelete, onCreateApp, selectedToolType, onSelectToolType, searchKeyword, selectedSceneCategory, onClearScene, onClearToolType, onClearKeyword, onClearAll 
}: AppListProps) {

  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword) return text;
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === keyword.toLowerCase() ? <span key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{part}</span> : part
        )}
      </>
    );
  };

  const toolTypes = ['全部类型', '对话助手', '知识库问答', '工作流应用', '智能体应用', '表单生成', '批改工具', '分析工具', '插件工具'];

  const hasFilters = selectedSceneCategory !== '全部场景' || selectedToolType !== '全部类型' || searchKeyword;

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Filter Area */}
      <div className="flex flex-col gap-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-700 whitespace-nowrap">工具类型：</span>
          <div className="flex flex-wrap gap-2">
            {toolTypes.map(type => {
              const count = type === '全部类型' ? aiAppList.length : aiAppList.filter(a => a.toolType === type).length;
              return (
                <button
                  key={type}
                  onClick={() => onSelectToolType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-1.5 ${selectedToolType === type ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600'}`}
                >
                  {type}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedToolType === type ? 'bg-emerald-100' : 'bg-gray-100'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-4 py-2 border-t border-gray-100 flex-wrap">
             <span className="text-sm font-bold text-gray-700 whitespace-nowrap">当前筛选条件：</span>
             <div className="flex flex-wrap gap-2 items-center">
                {selectedSceneCategory !== '全部场景' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 border border-gray-200 text-xs text-gray-700">
                    应用场景: <span className="font-semibold">{selectedSceneCategory}</span>
                    <button onClick={onClearScene} className="hover:text-red-500 ml-1"><X className="w-3 h-3"/></button>
                  </span>
                )}
                {selectedToolType !== '全部类型' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 border border-gray-200 text-xs text-gray-700">
                    工具类型: <span className="font-semibold">{selectedToolType}</span>
                    <button onClick={onClearToolType} className="hover:text-red-500 ml-1"><X className="w-3 h-3"/></button>
                  </span>
                )}
                {searchKeyword && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                    关键词: <span className="font-semibold">{searchKeyword}</span>
                    <button onClick={onClearKeyword} className="hover:text-red-500 ml-1"><X className="w-3 h-3"/></button>
                  </span>
                )}

                <button onClick={onClearAll} className="ml-2 text-xs text-gray-500 hover:text-emerald-600 font-medium underline underline-offset-2">
                  清空全部筛选
                </button>
             </div>
             <div className="ml-auto text-sm text-gray-500">
               搜索结果：共找到 <span className="font-bold text-emerald-600">{apps.length}</span> 个 AI 应用
             </div>
          </div>
        )}
      </div>
      
      {/* List Area */}
      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
          <Search className="w-16 h-16 text-gray-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">未找到相关 AI 应用</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md text-center">
            当前关键词未匹配到已有 AI 应用，可尝试更换关键词，或点击“创建AI应用”新建应用。
          </p>
          <div className="flex gap-4">
            <button onClick={onClearAll} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              清空搜索
            </button>
            <button onClick={onCreateApp} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700">
              <PlusCircle className="w-4 h-4" /> 创建AI应用
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {apps.map(app => (
            <div 
              key={app.id} 
              onClick={() => onSelect(app.id)}
              className={`flex flex-col bg-white border ${selectedId === app.id ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-md' : 'border-gray-200 hover:border-emerald-300 hover:shadow-sm'} rounded-xl p-5 cursor-pointer transition-all h-full relative group`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1 pr-4">
                  {highlightKeyword(app.name, searchKeyword)}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${app.status === '已发布' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : app.status === '草稿' ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                  {highlightKeyword(app.status, searchKeyword)}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded border border-blue-100 font-medium">
                  {highlightKeyword(app.scene, searchKeyword)}
                </span>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded border border-purple-100 font-medium">
                  {highlightKeyword(app.toolType, searchKeyword)}
                </span>
                <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[10px] rounded border border-gray-200 font-medium">
                  {highlightKeyword(app.course, searchKeyword)}
                </span>
              </div>

              <p className="text-gray-600 text-xs mb-4 line-clamp-2 leading-relaxed flex-1">
                {highlightKeyword(app.description, searchKeyword)}
              </p>

              <div className="flex flex-col gap-1.5 mb-4 border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>创建方式：<span className="text-gray-700">{highlightKeyword(app.createMode, searchKeyword)}</span></span>
                  <span>使用量：<span className="font-semibold text-emerald-600">{app.usageCount}</span> 次</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>最近更新：<span className="text-gray-700">{app.updatedAt}</span></span>
                  <span className="truncate max-w-[150px]" title={app.knowledgeBases.join(', ')}>知识库：<span className="text-gray-700">{app.knowledgeBases.length > 0 ? `${app.knowledgeBases.length}个` : '无'}</span></span>
                </div>
                {searchKeyword && (
                    <div className="mt-2 text-[10px] bg-yellow-50 text-yellow-800 p-1.5 rounded">
                        <span className="font-semibold">匹配关键词：</span> {searchKeyword}
                    </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
                <button className="flex-1 py-1.5 px-2 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold hover:bg-emerald-100 transition-colors">查看</button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(app); }} 
                  className="flex-1 py-1.5 px-2 bg-white border border-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  编辑
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(app); }} 
                  className="flex-1 py-1.5 px-2 bg-white border border-gray-200 text-red-600 rounded text-xs font-semibold hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  删除
                </button>
                <button 
                   onClick={(e) => e.stopPropagation()}
                   className="flex-1 py-1.5 px-2 bg-white border border-gray-200 text-gray-600 rounded text-xs font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  运行记录
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
