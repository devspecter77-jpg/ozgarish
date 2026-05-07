import { Router } from 'express'
import auth from '../middleware/auth.js'
import DaySession from '../models/DaySession.js'

const router = Router()

// Bugungi sessiyani olish
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const session = await DaySession.findOne({ user: req.userId, date: today })
    res.json(session || null)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Kunni boshlash
router.post('/start', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const existing = await DaySession.findOne({ user: req.userId, date: today })
    if (existing) return res.json(existing)
    const session = await DaySession.create({
      user: req.userId, date: today,
      startedAt: new Date(), active: true, paused: false, pausedAt: null, totalPaused: 0
    })
    res.json(session)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Pause
router.post('/pause', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const session = await DaySession.findOne({ user: req.userId, date: today })
    if (!session) return res.status(404).json({ error: 'Sessiya topilmadi' })
    session.paused = true
    session.pausedAt = new Date()
    await session.save()
    res.json(session)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Resume
router.post('/resume', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const session = await DaySession.findOne({ user: req.userId, date: today })
    if (!session) return res.status(404).json({ error: 'Sessiya topilmadi' })
    if (session.pausedAt) {
      session.totalPaused = (session.totalPaused || 0) + (Date.now() - new Date(session.pausedAt).getTime())
    }
    session.paused = false
    session.pausedAt = null
    await session.save()
    res.json(session)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Reset — 0 dan boshlash
router.post('/reset', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    await DaySession.findOneAndDelete({ user: req.userId, date: today })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/history', auth, async (req, res) => {
  try {
    const sessions = await DaySession.find({ user: req.userId }).sort({ date: -1 }).limit(30)
    res.json(sessions)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
