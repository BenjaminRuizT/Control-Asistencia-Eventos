import mongoose from 'mongoose';

const AttendeeSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    employeeNumber: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    region: { type: String, default: '', trim: true },
    plaza: { type: String, default: '', trim: true },
    store: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

AttendeeSchema.index({ eventId: 1, employeeNumber: 1 }, { unique: true });

export const Attendee = mongoose.model('Attendee', AttendeeSchema);
