import { KnowledgeBase } from '../data';
import { Search, Database, FileText, Type, AppWindow, Cpu, Network, LineChart, Code, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface KnowledgeBaseListProps {
  kbs: KnowledgeBase[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchKeyword: string;
  selectedKbStatus: string;
  onSelectKbStatus: (status: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  'Python': <Code className="w-8 h-8 text-blue-600" />,
  '区块链': <Network className="w-8 h-8 text-purple-600" />,
  '物联网': <Cpu className="w-8 h-8 text-emerald-600" />,
  '数据可视化': <LineChart className="w-8 h-8 text-orange-600" />,
  '大数据': <Database className="w-8 h-8 text-indigo-600" />,
  '人工智能': <Cpu className="w-8 h-8 text-red-600" />,
  '嵌入式': <Cpu className="w-8 h-8 text-teal-600" />,
  '软件工程': <Code className="w-8 h-8 text-blue-600" />,
};

const iconBgMap: Record<string, string> = {
  'Python': 'bg-blue-100',
  '区块链': 'bg-purple-100',
  '物联网': 'bg-emerald-100',
  '数据可视化': 'bg-orange-100',
  '大数据': 'bg-indigo-100',
  '人工智能': 'bg-red-100',
  '嵌入式': 'bg-teal-100',
  '软件工程': 'bg-blue-100',
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === '已启用') return <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded font-bold"><CheckCircle className="w-3 h-3"/> 已启用</span>;
  if (status === '待完善') return <span className="inline-flex items-center gap-1 text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded font-bold"><AlertCircle className="w-3 h-3"/> 待完善</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded font-bold"><Clock className="w-3 h-3"/> 更新中</span>;
};

export default function KnowledgeBaseList({ kbs, selectedId, onSelect, searchKeyword, selectedKbStatus, onSelectKbStatus }: KnowledgeBaseListProps) {
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

  const statusTypes = ['全部状态', '已启用', '待完善', '更新中'];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          课程知识库
        </h2>

        <div className="flex items-center bg-gray-100 p-1 rounded-md">
          {statusTypes.map(type => (
            <button
              key={type}
              onClick={() => onSelectKbStatus(type)}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${selectedKbStatus === type ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {kbs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200 w-full flex-1">
          <Search className="w-16 h-16 text-gray-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">未找到相关课程知识库</h3>
          <p className="text-gray-500 text-sm">当前筛选条件下没有匹配的知识库数据。</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 relative -mx-4 px-4 overflow-x-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-6 w-full pb-4">
            {kbs.map(kb => (
              <div 
                key={kb.id} 
                onClick={() => onSelect(kb.id)}
              className={`flex flex-col bg-white border ${selectedId === kb.id ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-md' : 'border-gray-200 hover:border-emerald-300 hover:shadow-sm'} rounded-xl p-5 cursor-pointer transition-all relative group h-[260px]`}
            >
              <div className="flex items-start gap-4 mb-3">
                <div className={`p-3 rounded-lg ${iconBgMap[kb.icon] || 'bg-gray-100'} shrink-0`}>
                  {iconMap[kb.icon] || <Database className="w-8 h-8 text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {highlightKeyword(kb.courseName, searchKeyword)}
                    </h3>
                  </div>
                  <StatusBadge status={kb.status} />
                </div>
              </div>

              <p className="text-gray-600 text-xs mb-4 line-clamp-2 leading-relaxed h-8">
                {highlightKeyword(kb.overview, searchKeyword)}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-lg p-2 border border-gray-100">
                <div className="flex flex-col items-center justify-center p-1">
                  <span className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><FileText className="w-3 h-3"/> 文档数量</span>
                  <span className="font-bold text-gray-800">{kb.documentCount}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1 border-l border-r border-gray-200">
                  <span className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><Type className="w-3 h-3"/> 知识库字数</span>
                  <span className="font-bold text-gray-800">{kb.wordCount}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1">
                  <span className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><AppWindow className="w-3 h-3"/> 管理应用</span>
                  <span className="font-bold text-emerald-600">{kb.managedAppCount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                 <span className="text-[11px] text-gray-400">最近更新: {kb.updatedAt}</span>
                 <div className="flex gap-2">
                   <button className="text-xs text-emerald-600 font-medium hover:text-emerald-700" onClick={(e) => { e.stopPropagation(); onSelect(kb.id); }}>查看详情</button>
                 </div>
              </div>
              
              {/* Hover floating actions */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-white/95 backdrop-blur-sm border-t border-gray-100 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all rounded-b-xl flex gap-2 z-10 custom-actions shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                 <button className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded border border-emerald-100 hover:bg-emerald-100">管理文档</button>
                 <button className="flex-1 py-1.5 bg-white text-gray-700 text-xs font-bold rounded border border-gray-200 hover:bg-gray-50">管理应用</button>
                 <button className="flex-1 py-1.5 bg-white text-blue-600 text-xs font-bold rounded border border-blue-200 hover:bg-blue-50">更新知识库</button>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}
