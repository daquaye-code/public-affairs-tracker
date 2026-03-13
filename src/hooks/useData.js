import { useState, useEffect, useCallback } from 'react';
import {
  fetchOfficers,
  fetchReportTypes,
  fetchSubmissions,
} from '../lib/supabase';

export function useOfficers() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchOfficers();
      setOfficers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { officers, loading, error, reload: load };
}

export function useReportTypes() {
  const [reportTypes, setReportTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchReportTypes();
      setReportTypes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { reportTypes, loading, error, reload: load };
}

export function useSubmissions(reportMonth) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!reportMonth) return;
    try {
      setLoading(true);
      const data = await fetchSubmissions(reportMonth);
      setSubmissions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [reportMonth]);

  useEffect(() => {
    load();
  }, [load]);

  return { submissions, loading, error, reload: load };
}
