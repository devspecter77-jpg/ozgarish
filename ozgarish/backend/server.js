import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import passport, { initPassport } from './config/passport.js'
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

initPassport()

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
