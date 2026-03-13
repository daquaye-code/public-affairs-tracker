import { useState, useEffect, useMemo } from 'react';
import { Send, FileText, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOfficers, useReportTypes, useSubmissions } from '../hooks/useData';
import { getCurrentMonth, formatMonthLabel } from '../utils/months';
import { upsertSubmission } from '../lib/supabase';
import MonthSelector from '../components/MonthSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Link } from 'react-router-dom';

export default function SubmissionPage() {
  const [month, setMonth] = useState(getCurrentMonth);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  const { officers, loading: loadingOfficers } = useOfficers();
  const { reportTypes, loading: loadingTypes } = useReportTypes();
  const { submissions, loading: loadingSubs, reload: reloadSubs } = useSubmissions(month);

  const loading = loadingOfficers || loadingTypes || loadingSubs;

  const selectedOfficer = useMemo(
    () => (officers || []).find((o) => o.id === selectedOfficerId),
    [officers, selectedOfficerId]
  );

  useEffect(() => {
    if (!selectedOfficerId || !(reportTypes || []).length) {
      setFormData({});
      return;
    }

    const existingMap = {};
    (submissions || [])
      .filter((s) => s.officer_id === selectedOfficerId)
      .forEach((s) => {
        existingMap[s.report_type_id] = {
          submitted: s.submitted,
          notes: s.notes || '',
        };
      });

    const newFormData = {};
    (reportTypes || []).forEach((rt) => {
      newFormData[rt.id] = existingMap[rt.id] || { submitted: false, notes: '' };
    });
    setFormData(newFormData);
  }, [selectedOfficerId, reportTypes, submissions]);

  function toggleSubmitted(rtId) {
    setFormData((prev) => ({
      ...prev,
      [rtId]: { ...prev[rtId], submitted: !prev[rtId]?.submitted },
    }));
  }

  function updateNotes(rtId, notes) {
    setFormData((prev) => ({
      ...prev,
      [rtId]: { ...prev[rtId], notes },
    }));
  }

  async function handleSave() {
    if (!selectedOfficerId) {
      toast.error('Please select an officer first.');
      return;
    }
    if ((reportTypes || []).length === 0) {
      toast.error('No report types configured.');
      return;
    }

    setSaving(true);
    try {
      const promises = (reportTypes || []).map((rt) => {
        const entry = formData[rt.id] || { submitted: false, notes: '' };
        return upsertSubmission({
          officerId: selectedOfficerId,
          reportTypeId: rt.id,
          reportMonth: month,
          submitted: entry.submitted,
          notes: entry.notes,
          fileUrl: null,
        });
      });
      await Promise.all(promises);
      await reloadSubs();
      toast.success('Submission saved successfully!');
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading..." />;

  if ((officers || []).length === 0) {
    return (
      <EmptyState
        title="No officers yet"
        description="An admin needs to add officers before submissions can be made."
        action={<Link to="/admin" className="btn-primary">Go to Admin</Link>}
      />
    );
  }

  if ((reportTypes || []).length === 0) {
    return (
      <EmptyState
        title="No report types defined"
        description="An admin needs to create report types before submissions can be made."
        action={<Link to="/admin" className="btn-primary">Go to Admin</Link>}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">
          Submit Reports
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Mark your report submissions for the selected month.
        </p>
      </div>

      <div className="card p-5 sm:p-6 space-y-5">
        <div>
          <label className="label">Officer</label>
          <select
            className="select"
            value={selectedOfficerId}
            onChange={(e) => setSelectedOfficerId(e.target.value)}
          >
            <option value="">Select your name...</option>
            {(officers || []).map((o) => (
              <option key={o.id} value={o.id}>
                {o.full_name}
              </option>
            ))}
          </select>
        </div>

        {selectedOfficer && (
          <div>
            <label className="label">Unit</label>
            <div className="input bg-gray-50 text-gray-600 cursor-not-allowed">
              {selectedOfficer.area_office}
            </div>
          </div>
        )}

        <div>
          <label className="label">Report Month</label>
          <MonthSelector value={month} onChange={setMonth} />
        </div>

        {selectedOfficerId && (
          <div className="space-y-3">
            <label className="label">Report Submissions</label>
            {(reportTypes || []).map((rt) => {
              const entry = formData[rt.id] || { submitted: false, notes: '' };
              return (
                <div
                  key={rt.id}
                  className={`rounded-xl border p-4 transition-all ${
                    entry.submitted
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          entry.submitted
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <FileText size={16} />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">
                        {rt.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSubmitted(rt.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                        entry.submitted ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          entry.submitted ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="mt-3">
                    <div className="relative">
                      <MessageSquare
                        size={14}
                        className="absolute left-3 top-2.5 text-gray-400"
                      />
                      <input
                        type="text"
                        className="input pl-8 py-2 text-xs"
                        placeholder="Add a note (optional)"
                        value={entry.notes}
                        onChange={(e) => updateNotes(rt.id, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedOfficerId && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Send size={16} />
                Save Submission
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}