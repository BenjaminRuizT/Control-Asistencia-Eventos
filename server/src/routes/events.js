import { Router } from 'express';
import multer from 'multer';
import { Event } from '../models/Event.js';
import { Attendee } from '../models/Attendee.js';
import { Attendance } from '../models/Attendance.js';
import { Draw } from '../models/Draw.js';
import { requireAdmin } from '../utils/auth.js';
import { getActiveEvent } from '../utils/activeEvent.js';
import { createExportWorkbookBuffer, createTemplateWorkbookBuffer, parseAttendeesWorkbook } from '../utils/excel.js';

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

    if (title !== undefined) event.title = String(title).trim() || event.title;
    if (drawPool !== undefined) event.drawPool = drawPool === 'all' ? 'all' : 'present';
    if (theme !== undefined) {
      const currentTheme = event.theme?.toObject ? event.theme.toObject() : event.theme;
      event.theme = { ...currentTheme, ...theme };
    }

    await event.save();
    res.json(event);
  } catch (error) {
    next(error);
  }
});

router.post('/active/reset', requireAdmin, async (_req, res, next) => {
  try {
    const current = await getActiveEvent();
    current.active = false;
    await current.save();

    const event = await Event.create({
      title: 'Nuevo evento',
      active: true,
      drawPool: 'present',
      theme: current.theme
    });
    res.status(201).json(event);
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
      await Promise.all([
        Attendee.deleteMany({ eventId: event._id }),
        Attendance.deleteMany({ eventId: event._id }),
        Draw.deleteMany({ eventId: event._id })
      ]);
    }

    const operations = rows.map((row) => ({
      updateOne: {
        filter: { eventId: event._id, employeeNumber: row.employeeNumber },
        update: {
          $set: {
            name: row.name,
            region: row.region,
            plaza: row.plaza,
            store: row.store
          },
          $setOnInsert: { eventId: event._id, employeeNumber: row.employeeNumber }
        },
        upsert: true
      }
    }));

    await Attendee.bulkWrite(operations, { ordered: true });
    const total = await Attendee.countDocuments({ eventId: event._id });

    return res.json({ imported: rows.length, total, clearExisting });
  } catch (error) {
    return next(error);
  }
});

router.get('/active/export', requireAdmin, async (_req, res, next) => {
  try {
    const event = await getActiveEvent();
    const [attendees, attendances, draws] = await Promise.all([
      Attendee.find({ eventId: event._id }).sort({ name: 1 }).lean(),
      Attendance.find({ eventId: event._id }).lean(),
      Draw.find({ eventId: event._id }).populate('attendeeId').sort({ createdAt: -1 }).lean()
    ]);

    const attendanceMap = new Map(attendances.map((attendance) => [attendance.employeeNumber, attendance]));
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
