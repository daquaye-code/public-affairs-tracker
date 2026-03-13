import { supabase } from './supabase';

// ── Officers ──────────────────────────────────────────────

export async function fetchOfficers() {
  const { data, error } = await supabase
    .from('officers')
    .select('*')
    .order('full_name');
  if (error) throw error;
  return data;
}

export async function addOfficer({ full_name, area_office }) {
  const { data, error } = await supabase
    .from('officers')
    .insert({ full_name, area_office })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOfficer(id, { full_name, area_office }) {
  const { data, error } = await supabase
    .from('officers')
    .update({ full_name, area_office })
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

// ── Report Types ──────────────────────────────────────────

export async function fetchReportTypes() {
  const { data, error } = await supabase
    .from('report_types')
    .select('*')
    .order('created_at');
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

// ── Submissions ───────────────────────────────────────────

export async function fetchSubmissions(reportMonth) {
  const { data, error } = await supabase
    .from('report_submissions')
    .select('*')
    .eq('report_month', reportMonth);
  if (error) throw error;
  return data;
}

export async function upsertSubmission({
  officer_id,
  report_type_id,
  report_month,
  submitted,
  notes,
  file_url,
}) {
  const now = new Date().toISOString();
  const payload = {
    officer_id,
    report_type_id,
    report_month,
    submitted,
    notes: notes || null,
    file_url: file_url || null,
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

export async function bulkUpsertSubmissions(submissions) {
  const now = new Date().toISOString();
  const payloads = submissions.map((s) => ({
    officer_id: s.officer_id,
    report_type_id: s.report_type_id,
    report_month: s.report_month,
    submitted: s.submitted,
    notes: s.notes || null,
    file_url: s.file_url || null,
    updated_at: now,
    ...(s.submitted ? { submitted_at: now } : {}),
  }));

  const { data, error } = await supabase
    .from('report_submissions')
    .upsert(payloads, {
      onConflict: 'officer_id,report_type_id,report_month',
    })
    .select();
  if (error) throw error;
  return data;
}
