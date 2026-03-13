import { Users, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export default function SummaryCards({ totalOfficers = 0, submitted = 0, pending = 0, rate = 0 }) {
  const cards = [
    {
      label: 'Total Officers',
      value: totalOfficers,
      icon: Users,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: 'Submitted',
      value: submitted,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Pending',
      value: pending,
      icon: Clock,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      label: 'Completion',
      value: rate + '%',
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="card p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className={'flex h-10 w-10 items-center justify-center rounded-lg ' + c.bg}>
              <c.icon size={20} className={c.color} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {c.label}
              </p>
              <p className="text-xl font-display font-semibold text-gray-900 mt-0.5">
                {c.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}