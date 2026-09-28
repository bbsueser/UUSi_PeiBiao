import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
      <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <span className="font-medium text-sm">{message}</span>
      </div>
    </div>
  );
}
