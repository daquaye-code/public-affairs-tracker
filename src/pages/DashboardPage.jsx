import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, UserPlus, FilePlus2 } from 'lucide-react';
import { fetchOfficers, fetchReportTypes, fetchSubmissions } from '../lib/supabase';
import { getCurrentMonth, formatMonthLabel } from '../utils/months';
import { exportToCsv } from '../utils/csv';
import MonthSelector from '../components/MonthSelector';
import SearchBar from '../components/SearchBar';
import SummaryCards from '../components/SummaryCards';
import ReportTable from '../components/ReportTable';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function DashboardPage() {
  const [month, setMonth] = useState(getCurrentMonth);
  const [search, setSearch] = useState('');
  const [officers, setOfficers] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    try {
      setLoading(true);
      const [o, rt, s] = await Promise.all([
        fetchOfficers(),
        fetchReportTypes(),
        fetchSubmissions(month),
      ]);
      setOfficers(o || []);
      setReportTypes(rt || []);
      setSubmissions(s || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Reload everything when the page mounts or month changes
  useEffect(() => {
    loadAll();
  }, [month]);

  // Auto-refresh every 15 seconds so the dashboard stays live
  useEffect(() => {
    const interval = setInterval(loadAll, 15000);
    return () => clearInterval(interval);
  }, [month]);

  const stats = useMemo(() => {
    const totalOfficers = officers.length;
    const totalReportSlots = totalOfficers * reportTypes.length;

    const submissionMap = {};
    submissions.forEach((s) => {
      const key = `${s.officer_id}__${s.report_type_id}`;
      submissionMap[key] = s;
    });

    let submittedCount = 0;
    officers.forEach((o) => {
      reportTypes.forEach((rt) => {
        const key = `${o.id}__${rt.id}`;
        if (submissionMap[key]?.submitted) submittedCount++;
      });
    });

    const pending = totalReportSlots - submittedCount;
    const rate =
      totalReportSlots > 0
        ? Math.round((submittedCount / totalReportSlots) * 100)
        : 0;

    return { totalOfficers, submitted: submittedCount, pending, rate };
  }, [officers, reportTypes, submissions]);

  function handleExport() {
    const headers = [
      'Officer',
      'Unit',
      ...reportTypes.map((rt) => rt.name),
      'Progress',
    ];

    const submissionMap = {};
    submissions.forEach((s) => {
      if (!submissionMap[s.officer_id]) submissionMap[s.officer_id] = {};
      submissionMap[s.officer_id][s.report_type_id] = s;
    });

    const rows = officers.map((o) => {
      const officerSubs = submissionMap[o.id] || {};
      const statuses = reportTypes.map((rt) =>
        officerSubs[rt.id]?.submitted ? 'Submitted' : 'Pending'
      );
      const done = reportTypes.filter(
        (rt) => officerSubs[rt.id]?.submitted
      ).length;
      return [o.full_name, o.area_office, ...statuses, `${done}/${reportTypes.length}`];
    });

    exportToCsv(`report-tracker-${month}.csv`, headers, rows);
  }

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  if (officers.length === 0 && reportTypes.length === 0) {
    return (
      <EmptyState
        title="No data yet"
        description="Get started by adding officers and report types in the Admin panel."
        action={<Link to="/admin" className="btn-primary">Go to Admin</Link>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">
            Public Affairs Report Tracker
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Submission status for {formatMonthLabel(month)}
          </p>
        </div>
        <button onClick={handleExport} className="btn-secondary w-fit">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-56">
          <MonthSelector value={month} onChange={setMonth} />
        </div>
        <div className="w-full sm:w-64">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search officers..."
          />
        </div>
      </div>

      <SummaryCards
        totalOfficers={stats.totalOfficers}
        submitted={stats.submitted}
        pending={stats.pending}
        rate={stats.rate}
      />

      {officers.length === 0 && (
        <EmptyState
          title="No officers found"
          description="Add officers in the Admin panel to see them here."
          action={
            <Link to="/admin" className="btn-primary">
              <UserPlus size={16} />
              Add Officers
            </Link>
          }
        />
      )}

      {reportTypes.length === 0 && (
        <EmptyState
          title="No report types defined"
          description="Create report types in the Admin panel. They will appear as columns here."
          action={
            <Link to="/admin" className="btn-primary">
              <FilePlus2 size={16} />
              Add Report Types
            </Link>
          }
        />
      )}

      {officers.length > 0 && reportTypes.length > 0 && (
        <ReportTable
          officers={officers}
          reportTypes={reportTypes}
          submissions={submissions}
          searchQuery={search}
        />
      )}
    </div>
  );
}