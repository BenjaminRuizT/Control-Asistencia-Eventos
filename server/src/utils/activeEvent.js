import { ensureDefaultEvent } from './seed.js';
import { assertSupabase, supabaseAdmin, toEvent } from './supabase.js';

export async function getActiveEvent() {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  assertSupabase(data, error);
  return toEvent(data) || ensureDefaultEvent();
}
