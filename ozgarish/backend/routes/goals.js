import { Router } from 'express'
import auth from '../middleware/auth.js'
import Goal from '../models/Goal.js'

const router = Router()

router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.userId }).sort({ createdAt: -1 })
    res.json(goals)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', auth, async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, user: req.userId })
    res.json(goal)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// toggle AVVAL kelishi kerak — /:id dan oldin
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.userId })
    if (!goal) return res.status(404).json({ error: 'Topilmadi' })
    goal.done = !goal.done
    await goal.save()
    res.json(goal)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.patch('/:id', auth, async (req, res) => {
  try {
    const { text, type, icon } = req.body
    const update = {}
    if (text !== undefined) update.text = text
    if (type !== undefined) update.type = type
    if (icon !== undefined) update.icon = icon

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: update },
      { new: true }
    )
    if (!goal) return res.status(404).json({ error: 'Topilmadi' })
    res.json(goal)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.userId })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
