import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    attendeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendee', required: true },
    employeeNumber: { type: String, required: true, trim: true },
    checkedInAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

AttendanceSchema.index({ eventId: 1, employeeNumber: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', AttendanceSchema);
