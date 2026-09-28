import { CourseConfig, CourseConfigRecord } from '../data';
import { Database, FileText, CheckCircle, Clock, AlertCircle, Settings, BookOpen, Layers, LayoutGrid, Monitor, LineChart, Code, Cpu, Network } from 'lucide-react';
import { useState } from 'react';

interface CourseSettingsListProps {
  courses: CourseConfig[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchKeyword: string;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  'Python': <Code className="w-5 h-5 text-blue-600" />,
  '区块链': <Network className="w-5 h-5 text-purple-600" />,
  '物联网': <Cpu className="w-5 h-5 text-emerald-600" />,
  '数据可视化': <LineChart className="w-5 h-5 text-orange-600" />,
  '大数据': <Database className="w-5 h-5 text-indigo-600" />,
  '人工智能': <Cpu className="w-5 h-5 text-red-600" />,
  '嵌入式': <Cpu className="w-5 h-5 text-teal-600" />,
  '软件工程': <Code className="w-5 h-5 text-blue-600" />,
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

export default function CourseSettingsList({ courses, selectedId, onSelect, searchKeyword, selectedStatus, onSelectStatus }: CourseSettingsListProps) {
  
  const StatusBadge = ({ enabled }: { enabled: boolean }) => {
    return enabled 
      ? <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">已启用</span>
      : <span className="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded font-bold">待配置</span>;
  };

  const statusTypes = ['全部', '已启用', '未启用', '待配置'];

  return (
    <div className="flex flex-col gap-3 h-full border-r border-gray-200 bg-white w-[280px] shrink-0 overflow-hidden">
      <div className="p-4 pb-2 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3 border-l-4 border-emerald-500 pl-2">
          课程列表
        </h2>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {statusTypes.map(type => (
            <button
              key={type}
              onClick={() => onSelectStatus(type)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${selectedStatus === type ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-500 border border-transparent hover:bg-gray-100'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 relative">
        {courses.map(course => (
          <div 
            key={course.id} 
            onClick={() => onSelect(course.id)}
            className={`flex flex-col border ${selectedId === course.id ? 'bg-emerald-50/50 border-emerald-400 shadow-sm' : 'bg-white border-gray-200 hover:border-emerald-300'} rounded-lg p-3 cursor-pointer transition-all relative group`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`p-1.5 rounded-lg ${iconBgMap[course.icon] || 'bg-gray-100'} shrink-0`}>
                {iconMap[course.icon] || <BookOpen className="w-5 h-5 text-gray-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-gray-900 truncate">
                  {course.courseName}
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">AI助手:</span>
                <StatusBadge enabled={course.aiAssistantEnabled} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">关联应用:</span>
                <span className="font-medium text-gray-700">{course.linkedAiApps.length} 个</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">展示状态:</span>
                <span className={`font-medium ${course.showInLargeModel ? 'text-blue-600' : 'text-gray-400'}`}>
                  {course.showInLargeModel ? '大模型展示' : '暂不展示'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">暂无课程</div>
        )}
      </div>
    </div>
  );
}
