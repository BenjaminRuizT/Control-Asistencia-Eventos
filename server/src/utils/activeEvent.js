import { Event } from '../models/Event.js';
import { ensureDefaultEvent } from './seed.js';

export async function getActiveEvent() {
  const event = await Event.findOne({ active: true });
  return event || ensureDefaultEvent();
}
