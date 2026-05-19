import { Router } from 'express';
import { requireAdmin } from '../utils/auth.js';
import { getActiveEvent } from '../utils/activeEvent.js';
import { assertSupabase, supabaseAdmin, toAttendee, toDraw } from '../utils/supabase.js';

const router = Router();

async function buildPool(event, requestedPool, excludePrevious = true) {
  const pool = requestedPool || event.drawPool;
  const excludedResult = excludePrevious
    ? await supabaseAdmin.from('draws').select('employee_number').eq('event_id', event.id).eq('pool', pool)
    : { data: [], error: null };

  const excluded = new Set(assertSupabase(excludedResult.data, excludedResult.error).map((row) => row.employee_number));

  if (pool === 'present') {
    const { data, error } = await supabaseAdmin
      .from('attendance')
      .select('attendees(*)')
      .eq('event_id', event.id);

    return assertSupabase(data, error)
      .map((row) => toAttendee(row.attendees))
      .filter((attendee) => attendee && !excluded.has(attendee.employeeNumber));
  }

  const { data, error } = await supabaseAdmin
    .from('attendees')
    .select('*')
    .eq('event_id', event.id)
    .order('name', { ascending: true });

  return assertSupabase(data, error)
    .map(toAttendee)
    .filter((attendee) => !excluded.has(attendee.employeeNumber));
}

router.get('/pool', async (req, res, next) => {
  try {
    const event = await getActiveEvent();
    const pool = req.query.pool === 'all' ? 'all' : event.drawPool;
    const candidates = await buildPool(event, pool, req.query.excludePrevious !== 'false');
    res.json({ pool, count: candidates.length, candidates });
  } catch (error) {
    next(error);
  }
});

router.post('/winner', requireAdmin, async (req, res, next) => {
  try {
    const event = await getActiveEvent();
    const pool = req.body?.pool === 'all' ? 'all' : event.drawPool;
    const excludePrevious = req.body?.excludePrevious !== false;
    const candidates = await buildPool(event, pool, excludePrevious);

    if (!candidates.length) {
      return res.status(409).json({ message: 'No hay candidatos disponibles para el sorteo.' });
    }

    const winner = candidates[Math.floor(Math.random() * candidates.length)];
    const { data, error } = await supabaseAdmin
      .from('draws')
      .insert({
        event_id: event.id,
        attendee_id: winner.id,
        employee_number: winner.employeeNumber,
        pool
      })
      .select('*')
      .single();

    return res.status(201).json({
      winner,
      draw: toDraw(assertSupabase(data, error)),
      remaining: candidates.length - 1
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/history', requireAdmin, async (_req, res, next) => {
  try {
    const event = await getActiveEvent();
    const { data, error } = await supabaseAdmin
      .from('draws')
      .select('*, attendees(*)')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false });

    res.json(assertSupabase(data, error).map(toDraw));
  } catch (error) {
    next(error);
  }
});

router.use((error, _req, res, _next) => {
  console.error(error);
  res.status(400).json({ message: error.message || 'Error en sorteo.' });
});

export default router;
