import mongoose from 'mongoose'

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['7kun', '30kun', 'yillik'], default: '7kun' },
  icon: { type: String, default: 'target' },
  done: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Goal', goalSchema)
