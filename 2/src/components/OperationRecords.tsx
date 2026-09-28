import { QueryRecord } from '../data';
import { Activity } from 'lucide-react';

export default function OperationRecords({ records }: { records: QueryRecord[] }) {
  return (
    <div className="bg-white border-t border-gray-200 p-4 h-48 shrink-0 flex flex-col z-20">
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 border-l-4 border-emerald-500 pl-2">
        <Activity className="w-4 h-4 text-emerald-600" /> AI应用查询记录
      </h3>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 font-medium">时间</th>
              <th className="px-4 py-2 font-medium">查询方式</th>
              <th className="px-4 py-2 font-medium">应用场景</th>
              <th className="px-4 py-2 font-medium">工具类型</th>
              <th className="px-4 py-2 font-medium">关键词</th>
              <th className="px-4 py-2 font-medium">查询结果</th>
              <th className="px-4 py-2 font-medium">操作人</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((rec, i) => (
              <tr key={i} className="hover:bg-emerald-50 transition-colors">
                <td className="px-4 py-2 text-gray-500 font-mono text-xs">{rec.time}</td>
                <td className="px-4 py-2 text-emerald-700 font-medium">{rec.method}</td>
                <td className="px-4 py-2 text-gray-800">{rec.scene}</td>
                <td className="px-4 py-2 text-gray-600">{rec.toolType}</td>
                <td className="px-4 py-2 text-gray-800 font-medium">{rec.keyword || '-'}</td>
                <td className="px-4 py-2 text-emerald-600 font-bold">{rec.result}</td>
                <td className="px-4 py-2 text-gray-500 flex items-center gap-2">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold">教</div>
                  {rec.operator}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
