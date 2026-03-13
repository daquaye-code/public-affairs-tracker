import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-brand-500" />
      <p className="mt-3 text-sm text-slate-500">{message}</p>
    </div>
  );
}
