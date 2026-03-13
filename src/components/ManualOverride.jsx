import { useState, useMemo } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { toggleSubmission } from '../lib/supabase';
import { getCurrentMonth } from '../utils/months';
import MonthSelector from './MonthSelector';
import SearchBar from './SearchBar';
import ReportStatusPill from './ReportStatusPill';

export default function ManualOverride({
  officers,
  reportTypes,
  submissions,
  onReloadSubs,
  month,
  onMonthChange,
}) {
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);

  const submissionMap = useMemo(() => {
    const map = {};
    submissions.forEach((s) => {
      const key = `${s.officer_id}__${s.report_type_id}`;
      map[key] = s;
    });
    return map;
  }, [submissions]);

  const filtered = officers.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.full_name.toLowerCase().includes(q) ||
      o.area_office.toLowerCase().includes(q)
    );
  });

  async function handleToggle(officerId, reportTypeId) {
    const key = `${officerId}__${reportTypeId}`;
    const current = submissionMap[key]?.submitted ?? false;
    setToggling(key);
    try {
      await toggleSubmission({
        officerId,
        reportTypeId,
        reportMonth: month,
        submitted: !current,
      });
      await onReloadSubs();
      toast.success(
        !current ? 'Marked as Submitted.' : 'Marked as Pending.'
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToggling(null);
    }
  }

  if (officers.length === 0 || reportTypes.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        Add officers and report types first to use manual override.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-48">
          <MonthSelector value={month} onChange={onMonthChange} />
        </div>
        <div className="w-full sm:w-56">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Filter officers..."
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2.5 text-left font-semibold text-gray-600 text-xs whitespace-nowrap">
                Officer
              </th>
              {reportTypes.map((rt) => (
                <th
                  key={rt.id}
                  className="px-3 py-2.5 text-center font-semibold text-gray-600 text-xs whitespace-nowrap"
                >
                  {rt.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50/40">
                <td className="sticky left-0 z-10 bg-white px-3 py-2.5 font-medium text-gray-900 text-xs whitespace-nowrap">
                  {o.full_name}
                </td>
                {reportTypes.map((rt) => {
                  const key = `${o.id}__${rt.id}`;
                  const sub = submissionMap[key];
                  const isSubmitted = sub?.submitted ?? false;
                  const isLoading = toggling === key;

                  return (
                    <td key={rt.id} className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => handleToggle(o.id, rt.id)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-all hover:bg-gray-100 disabled:opacity-50"
                      >
                        <ReportStatusPill submitted={isSubmitted} />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
