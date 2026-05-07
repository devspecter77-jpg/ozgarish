import mongoose from 'mongoose'

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  icon: { type: String, default: '✅' },
  completedDates: [{ type: String }], // 'YYYY-MM-DD' format
  ratings: [{
    date: { type: String }, // 'YYYY-MM-DD'
    percent: { type: Number, min: 0, max: 100 }
  }]
}, { timestamps: true })

export default mongoose.model('Habit', habitSchema)
