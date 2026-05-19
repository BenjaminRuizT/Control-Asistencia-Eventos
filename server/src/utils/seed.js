import { assertSupabase, supabaseAdmin, toEvent } from './supabase.js';

export async function ensureDefaultEvent() {
  const { data: existing, error: findError } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  assertSupabase(existing, findError);
  if (existing) return toEvent(existing);

  const { data, error } = await supabaseAdmin.from('events').insert({
    title: 'Evento de Temporada',
    active: true,
    draw_pool: 'present',
    theme: {
      preset: 'sports',
      primary: '#1d4ed8',
      secondary: '#f97316',
      accent: '#22c55e',
      background: '#08111f',
      text: '#f8fafc',
      motion: 'confetti',
      layout: 'stadium',
      icon: 'trophy'
    }
  }).select('*').single();

  return toEvent(assertSupabase(data, error));
}
