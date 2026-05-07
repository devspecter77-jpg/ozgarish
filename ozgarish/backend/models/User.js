import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, sparse: true },
  email: { type: String, sparse: true },
  googleId: { type: String, sparse: true },
  avatar: { type: String },
  password: { type: String, required: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  habitsInitialized: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  telegramId: { type: Number, default: null },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

export default mongoose.model('User', userSchema)
