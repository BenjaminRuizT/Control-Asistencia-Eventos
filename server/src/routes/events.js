import { Router } from 'express';
import multer from 'multer';
import { requireAdmin } from '../utils/auth.js';
import { getActiveEvent } from '../utils/activeEvent.js';
import { createExportWorkbookBuffer, createTemplateWorkbookBuffer, parseAttendeesWorkbook } from '../utils/excel.js';
import { assertSupabase, supabaseAdmin, toAttendee, toEvent } from '../utils/supabase.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.get('/active', async (_req, res, next) => {
  try {
    const event = await getActiveEvent();
    res.json(event);
  } catch (error) {
    next(error);
  }
});

router.patch('/active', requireAdmin, async (req, res, next) => {
  try {
    const event = await getActiveEvent();
    const { title, theme, drawPool } = req.body || {};
    const update = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) update.title = String(title).trim() || event.title;
    if (drawPool !== undefined) update.draw_pool = drawPool === 'all' ? 'all' : 'present';
    if (theme !== undefined) update.theme = { ...event.theme, ...theme };

    const { data, error } = await supabaseAdmin
      .from('events')
      .update(update)
      .eq('id', event.id)
      .select('*')
      .single();

    res.json(toEvent(assertSupabase(data, error)));
  } catch (error) {
    next(error);
  }
});

router.post('/active/reset', requireAdmin, async (_req, res, next) => {
  try {
    const current = await getActiveEvent();
    assertSupabase(
      null,
      (await supabaseAdmin.from('events').update({ active: false, updated_at: new Date().toISOString() }).eq('id', current.id)).error
    );

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({
        title: 'Nuevo evento',
        active: true,
        draw_pool: 'present',
        timezone: current.timezone,
        theme: current.theme
      })
      .select('*')
      .single();

    res.status(201).json(toEvent(assertSupabase(data, error)));
  } catch (error) {
    next(error);
  }
});

router.get('/template', async (_req, res, next) => {
  try {
    const buffer = await createTemplateWorkbookBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename="template-asistentes.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

router.post('/active/import', requireAdmin, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Sube un archivo Excel .xlsx.' });
    }

    const event = await getActiveEvent();
    const rows = await parseAttendeesWorkbook(req.file.buffer);
    const clearExisting = req.body.clearExisting === 'true';

    if (clearExisting) {
      await supabaseAdmin.from('draws').delete().eq('event_id', event.id);
      await supabaseAdmin.from('attendance').delete().eq('event_id', event.id);
      await supabaseAdmin.from('attendees').delete().eq('event_id', event.id);
    }

    const payload = rows.map((row) => ({
      event_id: event.id,
      employee_number: row.employeeNumber,
      name: row.name,
      region: row.region,
      plaza: row.plaza,
      store: row.store,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabaseAdmin
      .from('attendees')
      .upsert(payload, { onConflict: 'event_id,employee_number' });

    assertSupabase(null, error);

    const { count, error: countError } = await supabaseAdmin
      .from('attendees')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id);

    assertSupabase(null, countError);
    return res.json({ imported: rows.length, total: count || 0, clearExisting });
  } catch (error) {
    return next(error);
  }
});

router.get('/active/export', requireAdmin, async (_req, res, next) => {
  try {
    const event = await getActiveEvent();
    const [attendeesResult, attendancesResult, drawsResult] = await Promise.all([
      supabaseAdmin.from('attendees').select('*').eq('event_id', event.id).order('name', { ascending: true }),
      supabaseAdmin.from('attendance').select('*').eq('event_id', event.id),
      supabaseAdmin
        .from('draws')
        .select('*, attendees(*)')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false })
    ]);

    const attendees = assertSupabase(attendeesResult.data, attendeesResult.error).map(toAttendee);
    const attendances = assertSupabase(attendancesResult.data, attendancesResult.error);
    const draws = assertSupabase(drawsResult.data, drawsResult.error).map((draw) => ({
      ...draw,
      attendeeId: toAttendee(draw.attendees),
      createdAt: draw.created_at
    }));

    const attendanceMap = new Map(
      attendances.map((attendance) => [
        attendance.employee_number,
        { employeeNumber: attendance.employee_number, checkedInAt: new Date(attendance.checked_in_at) }
      ])
    );

    const buffer = await createExportWorkbookBuffer({ event, attendees, attendanceMap, draws });
    res.setHeader('Content-Disposition', `attachment; filename="reporte-${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } catch (error) {
    return next(error);
  }
});

router.use((error, _req, res, _next) => {
  console.error(error);
  res.status(400).json({ message: error.message || 'No se pudo procesar la solicitud.' });
});

export default router;
