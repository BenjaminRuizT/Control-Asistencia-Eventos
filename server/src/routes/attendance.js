import { Router } from 'express';
import { Attendee } from '../models/Attendee.js';
import { Attendance } from '../models/Attendance.js';
import { getActiveEvent } from '../utils/activeEvent.js';

const router = Router();

router.post('/check-in', async (req, res, next) => {
  try {
    const { employeeNumber } = req.body || {};
    const normalized = String(employeeNumber || '').trim();
    if (!normalized) {
      return res.status(400).json({ message: 'Ingresa el numero de empleado.' });
    }

    const event = await getActiveEvent();
    const attendee = await Attendee.findOne({ eventId: event._id, employeeNumber: normalized }).lean();
    if (!attendee) {
      return res.status(404).json({ message: 'No encontramos ese numero de empleado en este evento.' });
    }

    try {
      const attendance = await Attendance.create({
        eventId: event._id,
        attendeeId: attendee._id,
        employeeNumber: normalized
      });
      return res.status(201).json({ status: 'registered', attendee, attendance });
    } catch (error) {
      if (error.code === 11000) {
        const attendance = await Attendance.findOne({ eventId: event._id, employeeNumber: normalized }).lean();
        return res.status(200).json({ status: 'already-registered', attendee, attendance });
      }
      throw error;
    }
  } catch (error) {
    return next(error);
  }
});

router.get('/stats', async (_req, res, next) => {
  try {
    const event = await getActiveEvent();
    const [total, present, recent, regionStats, plazaStats] = await Promise.all([
      Attendee.countDocuments({ eventId: event._id }),
      Attendance.countDocuments({ eventId: event._id }),
      Attendance.find({ eventId: event._id }).populate('attendeeId').sort({ checkedInAt: -1 }).limit(8).lean(),
      Attendee.aggregate([
        { $match: { eventId: event._id } },
        { $group: { _id: '$region', total: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      Attendee.aggregate([
        { $match: { eventId: event._id } },
        { $group: { _id: '$plaza', total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 8 }
      ])
    ]);

    const attendanceByRegion = await Attendance.aggregate([
      { $match: { eventId: event._id } },
      { $lookup: { from: 'attendees', localField: 'attendeeId', foreignField: '_id', as: 'attendee' } },
      { $unwind: '$attendee' },
      { $group: { _id: '$attendee.region', present: { $sum: 1 } } }
    ]);

    const presentRegionMap = new Map(attendanceByRegion.map((row) => [row._id || 'Sin region', row.present]));
    const byRegion = regionStats.map((row) => ({
      label: row._id || 'Sin region',
      total: row.total,
      present: presentRegionMap.get(row._id || 'Sin region') || 0
    }));

    return res.json({
      total,
      present,
      missing: Math.max(total - present, 0),
      percent: total ? Math.round((present / total) * 100) : 0,
      recent: recent.map((item) => ({ ...item, attendee: item.attendeeId })),
      byRegion,
      byPlaza: plazaStats.map((row) => ({ label: row._id || 'Sin plaza', total: row.total }))
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
