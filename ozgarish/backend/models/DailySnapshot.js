import mongoose from 'mongoose'

// Har kuni soat 19:00 da avtomatik saqlanadigan kunlik snapshot
const dailySnapshotSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  habits: {
    total: Number,
    completed: Number,
    percent: Number,
    list: [{ name: String, icon: String, done: Boolean }]
  },
  assessment: {
    scores: {
      intizom: Number,
      hurmat: Number,
      sabr: Number,
      diqqat: Number,
      masuliyat: Number,
    },
    avg: Number
  }
}, { timestamps: true })

dailySnapshotSchema.index({ user: 1, date: 1 }, { unique: true })

export default mongoose.model('DailySnapshot', dailySnapshotSchema)
