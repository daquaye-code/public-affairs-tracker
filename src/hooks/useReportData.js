import { useState, useEffect, useCallback } from 'react';
import { fetchOfficers, fetchReportTypes, fetchSubmissions } from '../lib/api';

/**
 * Central data hook that loads officers, report types, and submissions
 * for a given month. Provides a refresh function for manual reloads.
 */
export function useReportData(month) {
  const [officers, setOfficers] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  // Build a lookup map: "officerId::reportTypeId" => submission record
  const submissionMap = {};
  for (const s of submissions) {
    submissionMap[`${s.officer_id}::${s.report_type_id}`] = s;
  }

  return {
    officers,
    reportTypes,
    submissions,
    submissionMap,
    loading,
    error,
    refresh: load,
  };
}
