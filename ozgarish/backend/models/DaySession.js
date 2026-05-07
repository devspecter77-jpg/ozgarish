import mongoose from 'mongoose'

const daySessionSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:         { type: String, required: true },
  startedAt:    { type: Date, required: true },
  paused:       { type: Boolean, default: false },
  pausedAt:     { type: Date, default: null },
  totalPaused:  { type: Number, default: 0 }, // ms
  active:       { type: Boolean, default: true },
}, { timestamps: true })

daySessionSchema.index({ user: 1, date: 1 }, { unique: true })

export default mongoose.model('DaySession', daySessionSchema)
