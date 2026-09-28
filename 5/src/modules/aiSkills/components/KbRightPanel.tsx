import { KnowledgeBase } from '../data';
import { Database, FileText, AppWindow, Type, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface KbRightPanelProps {
  selectedKb: KnowledgeBase | null;
}

export default function KbRightPanel({ selectedKb }: KbRightPanelProps) {
  if (!selectedKb) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6">
         <Database className="w-16 h-16 mb-4 text-gray-300" />
         <p>请在左侧列表中选择一个课程知识库</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col overflow-y-auto">
      {/* KB Details Section */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-2 mb-6">知识库详情</h2>
        
        <div className="space-y-4 text-sm">
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">课程名称：</span>
            <span className="text-gray-900 font-bold">{selectedKb.courseName}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">课程类型：</span>
            <span className="text-gray-900">{selectedKb.courseType}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">课程概述：</span>
            <span className="text-gray-900 leading-relaxed">{selectedKb.overview}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">文档数量：</span>
            <span className="text-gray-900 font-bold">{selectedKb.documentCount} 个</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">知识库总字数：</span>
            <span className="text-emerald-600 font-bold">{selectedKb.wordCount}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">管理应用数量：</span>
            <span className="text-gray-900 font-bold">{selectedKb.managedAppCount} 个</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">关联 AI 应用：</span>
            <div className="flex flex-col gap-1.5">
              {selectedKb.managedApps.map((app, idx) => (
                <span key={idx} className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-xs border border-emerald-100 font-medium">
                  <AppWindow className="w-3 h-3" /> {app}
                </span>
              ))}
              {selectedKb.managedApps.length === 0 && <span className="text-gray-400">暂无关联</span>}
            </div>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">知识库状态：</span>
            <span className={`font-semibold ${selectedKb.status === '已启用' ? 'text-emerald-600' : selectedKb.status === '待完善' ? 'text-orange-600' : 'text-blue-600'}`}>
              {selectedKb.status}
            </span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500 shrink-0 font-medium whitespace-nowrap">最近更新时间：</span>
            <span className="text-gray-900">{selectedKb.updatedAt}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-8">
          <button className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-md hover:bg-emerald-100 transition-colors border border-emerald-200">
            <FileText className="w-4 h-4" /> 查看文档
          </button>
          <button className="w-full flex items-center justify-center gap-2 py-2 bg-white text-gray-700 font-bold rounded-md hover:bg-gray-50 transition-colors border border-gray-300">
            <AppWindow className="w-4 h-4" /> 管理应用
          </button>
          <button className="w-full flex items-center justify-center gap-2 py-2 bg-white text-blue-600 font-bold rounded-md hover:bg-blue-50 transition-colors border border-blue-200">
            更新知识库
          </button>
        </div>
      </div>

      {/* App Stats Section */}
      <div className="p-6 bg-gray-50 flex-1 border-t border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-4 border-l-4 border-blue-500 pl-2">
          管理应用统计
        </h3>
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
          当前知识库已被 <span className="font-bold text-emerald-600">{selectedKb.managedAppCount}</span> 个 AI 应用调用，其中：
        </p>
        
        <div className="space-y-2 text-xs mb-4">
          <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
            <span className="text-gray-700 font-medium">课程答疑类：</span>
            <span className="font-bold text-gray-900">1 个</span>
          </div>
          <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
            <span className="text-gray-700 font-medium">实验指导类：</span>
            <span className="font-bold text-gray-900">1 个</span>
          </div>
          {selectedKb.managedAppCount > 2 && (
            <>
              <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
                <span className="text-gray-700 font-medium">考试训练类：</span>
                <span className="font-bold text-gray-900">1 个</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
                <span className="text-gray-700 font-medium">作业批改类：</span>
                <span className="font-bold text-gray-900">1 个</span>
              </div>
            </>
          )}
        </div>

        <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm text-xs">
          <div className="flex justify-between mb-1.5">
            <span className="text-gray-500">最近调用应用：</span>
            <span className="font-bold text-gray-800">{selectedKb.managedApps[0] || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">最近调用时间：</span>
            <span className="text-gray-800">今天 10:35</span>
          </div>
        </div>
      </div>
    </div>
  );
}
