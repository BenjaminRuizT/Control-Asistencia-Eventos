import { Router } from 'express';
import { Attendee } from '../models/Attendee.js';
import { Attendance } from '../models/Attendance.js';
import { Draw } from '../models/Draw.js';
import { requireAdmin } from '../utils/auth.js';
import { getActiveEvent } from '../utils/activeEvent.js';

const router = Router();

async function buildPool(event, requestedPool, excludePrevious = true) {
  const pool = requestedPool || event.drawPool;
  const excluded = excludePrevious
    ? await Draw.find({ eventId: event._id, pool }).distinct('employeeNumber')
    : [];

  if (pool === 'present') {
    const presentEmployeeNumbers = await Attendance.find({ eventId: event._id }).distinct('employeeNumber');
    return Attendee.find({
      eventId: event._id,
      employeeNumber: { $in: presentEmployeeNumbers, $nin: excluded }
    }).lean();
  }

  return Attendee.find({
    eventId: event._id,
    employeeNumber: { $nin: excluded }
  }).lean();
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
    const draw = await Draw.create({
      eventId: event._id,
      attendeeId: winner._id,
      employeeNumber: winner.employeeNumber,
      pool
    });

    return res.status(201).json({ winner, draw, remaining: candidates.length - 1 });
  } catch (error) {
    return next(error);
  }
});

router.get('/history', requireAdmin, async (_req, res, next) => {
  try {
    const event = await getActiveEvent();
    const draws = await Draw.find({ eventId: event._id }).populate('attendeeId').sort({ createdAt: -1 }).lean();
    res.json(draws.map((draw) => ({ ...draw, attendee: draw.attendeeId })));
  } catch (error) {
    next(error);
  }
});

router.use((error, _req, res, _next) => {
  console.error(error);
  res.status(400).json({ message: error.message || 'Error en sorteo.' });
});

export default router;
