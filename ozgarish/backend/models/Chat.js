import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Yangi suhbat' },
  messages: [messageSchema],
}, { timestamps: true })

export default mongoose.model('Chat', chatSchema)
