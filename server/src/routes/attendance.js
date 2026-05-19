import { Router } from 'express';
import { getActiveEvent } from '../utils/activeEvent.js';
import { assertSupabase, supabaseAdmin, toAttendee, toAttendance } from '../utils/supabase.js';

const router = Router();

function groupCount(rows, key) {
  return rows.reduce((acc, row) => {
    const label = row[key] || `Sin ${key}`;
    acc.set(label, (acc.get(label) || 0) + 1);
    return acc;
  }, new Map());
}

router.post('/check-in', async (req, res, next) => {
  try {
    const { employeeNumber } = req.body || {};
    const normalized = String(employeeNumber || '').trim();
    if (!normalized) {
      return res.status(400).json({ message: 'Ingresa el numero de empleado.' });
    }

    const event = await getActiveEvent();
    const { data: attendeeRow, error: attendeeError } = await supabaseAdmin
      .from('attendees')
      .select('*')
      .eq('event_id', event.id)
      .eq('employee_number', normalized)
      .maybeSingle();

    assertSupabase(attendeeRow, attendeeError);
    if (!attendeeRow) {
      return res.status(404).json({ message: 'No encontramos ese numero de empleado en este evento.' });
    }

    const attendee = toAttendee(attendeeRow);
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('attendance')
      .insert({
        event_id: event.id,
        attendee_id: attendee.id,
        employee_number: normalized
      })
      .select('*')
      .single();

    if (insertError?.code === '23505') {
      const { data: existing, error: existingError } = await supabaseAdmin
        .from('attendance')
        .select('*')
        .eq('event_id', event.id)
        .eq('employee_number', normalized)
        .single();

      return res.status(200).json({
        status: 'already-registered',
        attendee,
        attendance: toAttendance(assertSupabase(existing, existingError))
      });
    }

    return res.status(201).json({
      status: 'registered',
      attendee,
      attendance: toAttendance(assertSupabase(inserted, insertError))
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/stats', async (_req, res, next) => {
  try {
    const event = await getActiveEvent();
    const [attendeesResult, attendanceResult] = await Promise.all([
      supabaseAdmin.from('attendees').select('*').eq('event_id', event.id).order('name', { ascending: true }),
      supabaseAdmin
        .from('attendance')
        .select('*, attendees(*)')
        .eq('event_id', event.id)
        .order('checked_in_at', { ascending: false })
    ]);

    const attendees = assertSupabase(attendeesResult.data, attendeesResult.error);
    const attendanceRows = assertSupabase(attendanceResult.data, attendanceResult.error);
    const total = attendees.length;
    const present = attendanceRows.length;

    const totalByRegion = groupCount(attendees, 'region');
    const presentByRegion = groupCount(attendanceRows.map((row) => row.attendees || {}), 'region');
    const byRegion = Array.from(totalByRegion.entries()).map(([label, totalCount]) => ({
      label,
      total: totalCount,
      present: presentByRegion.get(label) || 0
    }));

    const byPlaza = Array.from(groupCount(attendees, 'plaza').entries())
      .map(([label, totalCount]) => ({ label, total: totalCount }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    return res.json({
      total,
      present,
      missing: Math.max(total - present, 0),
      percent: total ? Math.round((present / total) * 100) : 0,
      recent: attendanceRows.slice(0, 8).map((item) => ({
        ...toAttendance(item),
        attendee: toAttendee(item.attendees)
      })),
      byRegion,
      byPlaza
    });
  } catch (error) {
    return next(error);
  }
});

router.use((error, _req, res, _next) => {
  console.error(error);
  res.status(400).json({ message: error.message || 'Error de asistencia.' });
});

export default router;
