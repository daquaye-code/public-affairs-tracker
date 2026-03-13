/**
 * Generate an array of month strings from Jan of the previous year
 * through Dec of next year, in format "YYYY-MM".
 */
export function getMonthOptions() {
  const now = new Date();
  const startYear = now.getFullYear() - 1;
  const endYear = now.getFullYear() + 1;
  const months = [];

  for (let y = startYear; y <= endYear; y++) {
    for (let m = 1; m <= 12; m++) {
      months.push(`${y}-${String(m).padStart(2, '0')}`);
    }
  }
  return months;
}

/**
 * Return current month as "YYYY-MM".
 */
export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Format "YYYY-MM" into a human label like "March 2026".
 */
export function formatMonthLabel(monthStr) {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Export dashboard data as CSV and trigger a download.
 */
export function exportDashboardCSV({ officers, reportTypes, submissionMap, month }) {
  const headers = [
    'Officer Name',
    'Area Office',
    ...reportTypes.map((rt) => rt.name),
    'Progress',
  ];

  const rows = officers.map((officer) => {
    let submittedCount = 0;
    const statuses = reportTypes.map((rt) => {
      const key = `${officer.id}::${rt.id}`;
      const isSubmitted = submissionMap[key]?.submitted ?? false;
      if (isSubmitted) submittedCount++;
      return isSubmitted ? 'Submitted' : 'Pending';
    });
    const progress =
      reportTypes.length > 0
        ? `${submittedCount}/${reportTypes.length}`
        : '0/0';
    return [officer.full_name, officer.area_office, ...statuses, progress];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `report-tracker-${month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
