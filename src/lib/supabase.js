import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ─── Officers ────────────────────────────────────────────────────

export async function fetchOfficers() {
  const { data, error } = await supabase
    .from('officers')
    .select('*')
    .order('full_name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addOfficer(fullName, areaOffice) {
  const { data, error } = await supabase
    .from('officers')
    .insert({ full_name: fullName, area_office: areaOffice })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOfficer(id, fullName, areaOffice) {
  const { data, error } = await supabase
    .from('officers')
    .update({ full_name: fullName, area_office: areaOffice })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteOfficer(id) {
  const { error } = await supabase.from('officers').delete().eq('id', id);
  if (error) throw error;
}

// ─── Report Types ────────────────────────────────────────────────

export async function fetchReportTypes() {
  const { data, error } = await supabase
    .from('report_types')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addReportType(name) {
  const { data, error } = await supabase
    .from('report_types')
    .insert({ name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateReportType(id, name) {
  const { data, error } = await supabase
    .from('report_types')
    .update({ name })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReportType(id) {
  const { error } = await supabase.from('report_types').delete().eq('id', id);
  if (error) throw error;
}

// ─── Submissions ─────────────────────────────────────────────────

export async function fetchSubmissions(reportMonth) {
  const { data, error } = await supabase
    .from('report_submissions')
    .select('*')
    .eq('report_month', reportMonth);
  if (error) throw error;
  return data;
}

export async function upsertSubmission({
  officerId,
  reportTypeId,
  reportMonth,
  submitted,
  notes,
  fileUrl,
}) {
  const now = new Date().toISOString();
  const payload = {
    officer_id: officerId,
    report_type_id: reportTypeId,
    report_month: reportMonth,
    submitted,
    notes: notes || null,
    file_url: fileUrl || null,
    updated_at: now,
  };

  if (submitted) {
    payload.submitted_at = now;
  }

  const { data, error } = await supabase
    .from('report_submissions')
    .upsert(payload, {
      onConflict: 'officer_id,report_type_id,report_month',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleSubmission({
  officerId,
  reportTypeId,
  reportMonth,
  submitted,
}) {
  const now = new Date().toISOString();
  const payload = {
    officer_id: officerId,
    report_type_id: reportTypeId,
    report_month: reportMonth,
    submitted,
    updated_at: now,
  };

  if (submitted) {
    payload.submitted_at = now;
  }

  const { data, error } = await supabase
    .from('report_submissions')
    .upsert(payload, {
      onConflict: 'officer_id,report_type_id,report_month',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
