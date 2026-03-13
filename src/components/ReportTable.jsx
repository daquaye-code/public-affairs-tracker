import ReportStatusPill from './ReportStatusPill';

export default function ReportTable({
  officers = [],
  reportTypes = [],
  submissions = [],
  searchQuery = '',
}) {
  const submissionMap = {};
  (submissions || []).forEach((s) => {
    if (!submissionMap[s.officer_id]) submissionMap[s.officer_id] = {};
    submissionMap[s.officer_id][s.report_type_id] = s;
  });

  const filtered = (officers || []).filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.full_name.toLowerCase().includes(q) ||
      o.area_office.toLowerCase().includes(q)
    );
  });

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                Officer
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                Unit
              </th>
              {(reportTypes || []).map((rt) => (
                <th
                  key={rt.id}
                  className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap"
                >
                  {rt.name}
                </th>
              ))}
              <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">
                Progress
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((officer) => {
              const officerSubs = submissionMap[officer.id] || {};
              const submittedCount = (reportTypes || []).filter(
                (rt) => officerSubs[rt.id]?.submitted
              ).length;
              const total = (reportTypes || []).length;
              const pct = total > 0 ? Math.round((submittedCount / total) * 100) : 0;

              return (
                <tr
                  key={officer.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {officer.full_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {officer.area_office}
                  </td>
                  {(reportTypes || []).map((rt) => {
                    const sub = officerSubs[rt.id];
                    const isSubmitted = sub?.submitted ?? false;
                    return (
                      <td key={rt.id} className="px-4 py-3 text-center">
                        <ReportStatusPill submitted={isSubmitted} />
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              pct === 100
                                ? '#059669'
                                : pct >= 50
                                ? '#f59e0b'
                                : '#ef4444',
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                        {submittedCount}/{total}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={(reportTypes || []).length + 3}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  No officers match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}