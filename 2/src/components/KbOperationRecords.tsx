import { KbRecord } from '../data';
import { Activity } from 'lucide-react';

export default function KbOperationRecords({ records }: { records: KbRecord[] }) {
  return (
    <div className="bg-white border-t border-gray-200 p-4 h-48 shrink-0 flex flex-col z-20">
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 border-l-4 border-emerald-500 pl-2">
        <Activity className="w-4 h-4 text-emerald-600" /> 知识库管理记录
      </h3>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 text-xs">
            <tr>
              <th className="px-4 py-2 font-medium">时间</th>
              <th className="px-4 py-2 font-medium">操作类型</th>
              <th className="px-4 py-2 font-medium">课程知识库</th>
              <th className="px-4 py-2 font-medium">文档数量</th>
              <th className="px-4 py-2 font-medium">知识库字数</th>
              <th className="px-4 py-2 font-medium">管理应用</th>
              <th className="px-4 py-2 font-medium">操作人</th>
              <th className="px-4 py-2 font-medium">结果</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((rec, i) => (
              <tr key={i} className="hover:bg-emerald-50 transition-colors">
                <td className="px-4 py-2 text-gray-500 font-mono text-xs">{rec.time}</td>
                <td className="px-4 py-2 text-emerald-700 font-medium">{rec.action}</td>
                <td className="px-4 py-2 text-gray-800 font-bold">{rec.courseName}</td>
                <td className="px-4 py-2 text-gray-600">{rec.documentCount}</td>
                <td className="px-4 py-2 text-gray-600">{rec.wordCount}</td>
                <td className="px-4 py-2 text-gray-600">{rec.managedAppCount}</td>
                <td className="px-4 py-2 text-gray-500 flex items-center gap-2">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold">教</div>
                  {rec.operator}
                </td>
                <td className="px-4 py-2 text-emerald-600 font-bold">{rec.result}</td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">暂无操作记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
