import { Check, X } from 'lucide-react';

export default function ReportStatusPill({ submitted }) {
  if (submitted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        <Check size={12} />
        Submitted
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
      <X size={12} />
      Pending
    </span>
  );
}
