import { useState } from 'react';
import { Users, FileText, ToggleLeft, Lock } from 'lucide-react';
import { useOfficers, useReportTypes, useSubmissions } from '../hooks/useData';
import { getCurrentMonth } from '../utils/months';
import OfficerManager from '../components/OfficerManager';
import ReportTypeManager from '../components/ReportTypeManager';
import ManualOverride from '../components/ManualOverride';
import LoadingSpinner from '../components/LoadingSpinner';

const ADMIN_PASSWORD = 'ssnit2026';

const tabs = [
  { id: 'officers', label: 'Officers', icon: Users },
  { id: 'report-types', label: 'Report Types', icon: FileText },
  { id: 'override', label: 'Manual Override', icon: ToggleLeft },
];

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('officers');
  const [overrideMonth, setOverrideMonth] = useState(getCurrentMonth);

  const { officers, loading: loadingOfficers, reload: reloadOfficers } = useOfficers();
  const { reportTypes, loading: loadingTypes, reload: reloadTypes } = useReportTypes();
  const {
    submissions,
    loading: loadingSubs,
    reload: reloadSubs,
  } = useSubmissions(overrideMonth);

  function handleLogin(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setUnlocked(true);
      setError('');
    } else {
      setError('Incorrect password. Try again.');
    }
  }

  if (!unlocked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card p-6 sm:p-8 w-full max-w-sm">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
              <Lock size={22} className="text-brand-600" />
            </div>
            <h2 className="font-display text-lg font-semibold text-gray-900">
              Admin Access
            </h2>
            <p className="text-sm text-gray-500 text-center">
              Enter the admin password to continue.
            </p>
          </div>
          <div>
            <input
              type="password"
              className="input mb-3"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
            />
            {error && (
              <p className="text-xs text-red-600 mb-3">{error}</p>
            )}
            <button onClick={handleLogin} className="btn-primary w-full">
              Unlock
            </button>
          </div>
        </div>
      </div>
    );
  }

  const loading = loadingOfficers || loadingTypes;

  if (loading) return <LoadingSpinner message="Loading admin..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">
          Admin Panel
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage officers, report types, and override statuses.
        </p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="card p-5 sm:p-6">
        {activeTab === 'officers' && (
          <OfficerManager officers={officers} onReload={reloadOfficers} />
        )}
        {activeTab === 'report-types' && (
          <ReportTypeManager reportTypes={reportTypes} onReload={reloadTypes} />
        )}
        {activeTab === 'override' && (
          <ManualOverride
            officers={officers}
            reportTypes={reportTypes}
            submissions={submissions}
            onReloadSubs={reloadSubs}
            month={overrideMonth}
            onMonthChange={setOverrideMonth}
          />
        )}
      </div>
    </div>
  );
}