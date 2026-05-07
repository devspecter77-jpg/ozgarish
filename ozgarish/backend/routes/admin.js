import { Router } from 'express'
import jwt from 'jsonwebtoken'
import adminAuth from '../middleware/adminAuth.js'
import User from '../models/User.js'
import Habit from '../models/Habit.js'
import Goal from '../models/Goal.js'
import Assessment from '../models/Assessment.js'
import Chat from '../models/Chat.js'

const router = Router()
const ADMIN_PHONE = '+998 91 405 84 81'
const ADMIN_PASSWORD = 'adminJF'

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    if (phone !== ADMIN_PHONE || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Telefon yoki parol noto\'g\'ri' })
    }
    // Admin userni topish yoki yaratish
    let admin = await User.findOne({ phone: ADMIN_PHONE })
    if (!admin) {
      admin = await User.create({
        fullName: 'Admin',
        phone: ADMIN_PHONE,
        password: ADMIN_PASSWORD,
        isAdmin: true,
      })
    } else if (!admin.isAdmin) {
      admin.isAdmin = true
      await admin.save()
    }
    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' })
    res.json({ token })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Barcha userlar
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: { $ne: true } })
      .select('-password')
      .sort({ createdAt: -1 })
    res.json(users)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Bitta user statistikasi
router.get('/users/:id/stats', adminAuth, async (req, res) => {
  try {
    const uid = req.params.id
    const [habits, goals, assessments, chats] = await Promise.all([
      Habit.find({ user: uid }),
      Goal.find({ user: uid }),
      Assessment.find({ user: uid }).sort({ date: -1 }).limit(30),
      Chat.find({ user: uid }).select('title updatedAt').sort({ updatedAt: -1 })
    ])
    const today = new Date().toISOString().split('T')[0]
    res.json({
      habits: {
        total: habits.length,
        completedToday: habits.filter(h => h.completedDates.includes(today)).length,
        list: habits.map(h => ({ name: h.name, icon: h.icon, totalDays: h.completedDates.length }))
      },
      goals: {
        total: goals.length,
        completed: goals.filter(g => g.done).length,
        list: goals
      },
      assessments: assessments.map(a => ({
        date: a.date,
        avg: a.scores ? Math.round(Object.values(a.scores).reduce((x, y) => x + y, 0) / 5) : 0,
        scores: a.scores
      })),
      chats: chats.slice(0, 10)
    })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Userni tahrirlash
router.patch('/users/:id', adminAuth, async (req, res) => {
  try {
    const { fullName, phone, email } = req.body
    const update = {}
    if (fullName) update.fullName = fullName
    if (phone !== undefined) update.phone = phone
    if (email !== undefined) update.email = email
    const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).select('-password')
    if (!user) return res.status(404).json({ error: 'Topilmadi' })
    res.json(user)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Userni o'chirish
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    await Habit.deleteMany({ user: req.params.id })
    await Goal.deleteMany({ user: req.params.id })
    await Assessment.deleteMany({ user: req.params.id })
    await Chat.deleteMany({ user: req.params.id })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Umumiy statistika
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalHabits, totalGoals, totalChats] = await Promise.all([
      User.countDocuments({ isAdmin: { $ne: true } }),
      Habit.countDocuments(),
      Goal.countDocuments(),
      Chat.countDocuments()
    ])
    const today = new Date().toISOString().split('T')[0]
    const activeToday = await Habit.distinct('user', { completedDates: today })
    res.json({ totalUsers, totalHabits, totalGoals, totalChats, activeToday: activeToday.length })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
