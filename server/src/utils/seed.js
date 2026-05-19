import { Event } from '../models/Event.js';

export async function ensureDefaultEvent() {
  const existing = await Event.findOne({ active: true });
  if (existing) return existing;

  return Event.create({
    title: 'Evento de Temporada',
    active: true,
    drawPool: 'present',
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
  });
}
