import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export function toEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    active: row.active,
    drawPool: row.draw_pool,
    timezone: row.timezone,
    theme: row.theme || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function toAttendee(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeeNumber: row.employee_number,
    name: row.name,
    region: row.region || '',
    plaza: row.plaza || '',
    store: row.store || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function toAttendance(row) {
  if (!row) return null;
  return {
    id: row.id,
    attendeeId: row.attendee_id,
    employeeNumber: row.employee_number,
    checkedInAt: row.checked_in_at,
    createdAt: row.created_at
  };
}

export function toDraw(row) {
  if (!row) return null;
  return {
    id: row.id,
    attendeeId: row.attendee_id,
    employeeNumber: row.employee_number,
    pool: row.pool,
    createdAt: row.created_at,
    attendee: toAttendee(row.attendees)
  };
}

export function assertSupabase(data, error) {
  if (error) throw new Error(error.message);
  return data;
}
