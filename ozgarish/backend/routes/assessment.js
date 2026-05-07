import { Router } from 'express'
import auth from '../middleware/auth.js'
import Assessment from '../models/Assessment.js'

const router = Router()

router.get('/today', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  const assessment = await Assessment.findOne({ user: req.userId, date: today })
  res.json(assessment || null)
})

router.post('/', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  const assessment = await Assessment.findOneAndUpdate(
    { user: req.userId, date: today },
    { ...req.body, user: req.userId, date: today },
    { upsert: true, new: true }
  )
  res.json(assessment)
})

router.get('/history', auth, async (req, res) => {
  const history = await Assessment.find({ user: req.userId }).sort({ date: -1 }).limit(30)
  res.json(history)
})

export default router
