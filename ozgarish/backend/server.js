import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from './models/User.js'
import authRoutes from './routes/auth.js'
import habitRoutes from './routes/habits.js'
import assessmentRoutes from './routes/assessment.js'
import chatRoutes from './routes/chat.js'
import dailyHistoryRoutes from './routes/dailyHistory.js'
import goalRoutes from './routes/goals.js'
import adminRoutes from './routes/admin.js'
import daySessionRoutes from './routes/daySession.js'
import { startDailyCron } from './cron/dailySnapshot.js'
import { startTelegramBot } from './cron/telegramBot.js'

// Passport ni bu yerda init qilamiz — env allaqachon yuklangan
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value
    const isRegister = req.query.state === 'register'
    let user = await User.findOne({ googleId: profile.id })
    if (user) return done(null, user)
    if (email) {
      user = await User.findOne({ email })
      if (user) {
        user.googleId = profile.id
        if (!user.avatar) user.avatar = profile.photos?.[0]?.value
        await user.save()
        return done(null, user)
      }
    }
    if (isRegister) {
      user = await User.create({
        fullName: profile.displayName,
        email,
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value,
        password: Math.random().toString(36).slice(-12) + 'Aa1!',
      })
      return done(null, user)
    }
    return done(null, false)
  } catch (err) {
    done(err, null)
  }
}))

const app = express()
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(passport.initialize())

app.use('/api/auth', authRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/assessment', assessmentRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/daily-history', dailyHistoryRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/day-session', daySessionRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ozgarish')
  .then(() => {
    console.log('MongoDB ulandi')
    startDailyCron()
    startTelegramBot()
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server http://localhost:${process.env.PORT || 5000} da ishlamoqda`)
    )
  })
  .catch(err => console.error('MongoDB xatosi:', err))
