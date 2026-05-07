import { Router } from 'express'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import User from '../models/User.js'

const router = Router()
const sign = (id) => jwt.sign({ userId: id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })

// Ro'yxatdan o'tish
router.post('/register', async (req, res) => {
  try {
    const { fullName, phone, password } = req.body
    if (!fullName || !phone || !password)
      return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' })
    if (await User.findOne({ phone }))
      return res.status(400).json({ error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' })
    const user = await User.create({ fullName, phone, password })
    res.json({ token: sign(user._id), user: { id: user._id, fullName: user.fullName, phone: user.phone, level: user.level, xp: user.xp, streak: user.streak } })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Kirish
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    if (!phone || !password)
      return res.status(400).json({ error: 'Telefon va parolni kiriting' })

    const user = await User.findOne({ phone })

    // Google orqali ro'yxatdan o'tgan user parol bilan kira olmaydi
    if (user && user.googleId && !user.password) {
      return res.status(400).json({ error: 'Bu hisob Google orqali yaratilgan. Google bilan kiring.' })
    }

    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ error: 'Telefon raqam yoki parol noto\'g\'ri' })

    res.json({ token: sign(user._id), user: { id: user._id, fullName: user.fullName, phone: user.phone, level: user.level, xp: user.xp, streak: user.streak } })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Google OAuth - boshlash (login)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))

// Google OAuth - boshlash (register - yangi user yaratadi)
router.get('/google/register', (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: 'register'
  })(req, res, next)
})

// Google OAuth - callback
router.get('/google/callback', (req, res, next) => {
  const isRegister = req.query.state === 'register'

  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err) return res.redirect('http://localhost:3000/login?error=not_registered')

    // Register rejimi — user topilmasa yangi yaratamiz
    if (!user && isRegister) {
      // Passport profile ni olish uchun boshqa yo'l kerak
      // state orqali isRegister ni passport strategiyasiga uzatamiz
      return res.redirect('http://localhost:3000/register?error=google_failed')
    }

    if (!user) {
      return res.redirect('http://localhost:3000/login?error=not_registered')
    }

    const token = sign(user._id)
    const userData = encodeURIComponent(JSON.stringify({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
    }))
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?token=${token}&user=${userData}`)
  })(req, res, next)
})

// Profil
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Token topilmadi' })
    const { userId } = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const user = await User.findById(userId).select('-password')
    res.json(user)
  } catch {
    res.status(401).json({ error: 'Avtorizatsiya xatosi' })
  }
})

// Telegram ID bog'lash
router.post('/link-telegram', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Token kerak' })
    const { userId } = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const { telegramId } = req.body
    await User.findByIdAndUpdate(userId, { telegramId })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
