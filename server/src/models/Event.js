import mongoose from 'mongoose';

const ThemeSchema = new mongoose.Schema(
  {
    preset: { type: String, default: 'sports' },
    primary: { type: String, default: '#1d4ed8' },
    secondary: { type: String, default: '#f97316' },
    accent: { type: String, default: '#22c55e' },
    background: { type: String, default: '#08111f' },
    text: { type: String, default: '#f8fafc' },
    backgroundImage: { type: String, default: '' },
    motion: { type: String, default: 'confetti' },
    layout: { type: String, default: 'stadium' },
    icon: { type: String, default: 'trophy' },
    character: { type: String, default: 'mascot' },
    intensity: { type: Number, min: 0, max: 100, default: 65 }
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true, index: true },
    drawPool: { type: String, enum: ['present', 'all'], default: 'present' },
    timezone: { type: String, default: 'America/Tijuana' },
    theme: { type: ThemeSchema, default: () => ({}) }
  },
  { timestamps: true }
);

export const Event = mongoose.model('Event', EventSchema);
