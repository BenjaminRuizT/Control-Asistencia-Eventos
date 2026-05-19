import mongoose from 'mongoose';

const DrawSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    attendeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendee', required: true },
    employeeNumber: { type: String, required: true },
    pool: { type: String, enum: ['present', 'all'], required: true }
  },
  { timestamps: true }
);

export const Draw = mongoose.model('Draw', DrawSchema);
