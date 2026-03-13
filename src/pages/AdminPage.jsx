import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, ToggleLeft } from 'lucide-react';
import { fetchOfficers, fetchReportTypes, fetchSubmissions, upsertSubmission } from '../lib/api';
import { getCurrentMonth, formatMonthLabel } from '../utils/helpers';
import MonthSelector from '../components/MonthSelector';
import OfficerManager from '../components/OfficerManager';
import ReportTypeManager from '../components/ReportTypeManager';
import ReportStatusPill from '../components/ReportStatusPill';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminPage() {
  const [officers, setOfficers] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(getCurrentMonth());
  const [toggling, setToggling] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, rt, s] = await Promise.all([
        fetchOfficers(),
        fetchReportTypes(),
        fetchSubmissions(month),
      ]);
      setOfficers(o);
      setReportTypes(rt);
      setSubmissions(s);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const submissionMap = {};
  for (const s of submissions) {
    submissionMap[`${s.officer_id}::${s.report_type_id}`] = s;
  }

  const handleToggle = async (officerId, reportTypeId) => {
    const key = `${officerId}::${reportTypeId}`;
    const existing = submissionMap[key];
    const newStatus = !(existing?.submitted ?? false);
    setToggling(key);
    try {
      await upsertSubmission({
        officer_id: officerId,
        report_type_id: reportTypeId,
        report_month: month,
        submitted: newStatus,
        notes: existing?.notes || '',
      });
      toast.success(`Status updated`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-500">Manage officers, report types, and overrides.</p>
        </div>
        <button
          onClick={load}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Two-column management */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <OfficerManager officers={officers} onRefresh={load} />
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <ReportTypeManager reportTypes={reportTypes} onRefresh={load} />
        </div>
      </div>

      {/* Manual Override Section */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
              <ToggleLeft size={18} className="text-brand-500" />
              Manual Override
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Toggle submission statuses for {formatMonthLabel(month)}.
            </p>
          </div>
          <MonthSelector value={month} onChange={setMonth} />
        </div>

        {officers.length === 0 || reportTypes.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            {officers.length === 0
              ? 'Add officers above to use manual override.'
              : 'Add report types above to use manual override.'}
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-3 py-2 font-semibold text-slate-600">Officer</th>
                  {reportTypes.map((rt) => (
                    <th key={rt.id} className="px-3 py-2 text-center font-semibold text-slate-600">
                      {rt.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {officers.map((officer) => (
                  <tr key={officer.id}>
                    <td className="px-3 py-2 font-medium text-slate-800">
                      {officer.full_name}
                    </td>
                    {reportTypes.map((rt) => {
                      const key = `${officer.id}::${rt.id}`;
                      const isSubmitted = submissionMap[key]?.submitted ?? false;
                      return (
                        <td key={rt.id} className="px-3 py-2 text-center">
                          <button
                            onClick={() => handleToggle(officer.id, rt.id)}
                            disabled={toggling === key}
                            className="transition-transform hover:scale-105 disabled:opacity-50"
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
        )}
      </div>
    </div>
  );
}
