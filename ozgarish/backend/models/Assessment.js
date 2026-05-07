import mongoose from 'mongoose'

const assessmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  scores: {
    intizom:   { type: Number, min: 0, max: 100 },
    hurmat:    { type: Number, min: 0, max: 100 },
    sabr:      { type: Number, min: 0, max: 100 },
    diqqat:    { type: Number, min: 0, max: 100 },
    masuliyat: { type: Number, min: 0, max: 100 },
  },
  mood: { type: String },
}, { timestamps: true })

export default mongoose.model('Assessment', assessmentSchema)
