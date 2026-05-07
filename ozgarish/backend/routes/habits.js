import { Router } from 'express'
import auth from '../middleware/auth.js'
import Habit from '../models/Habit.js'

const router = Router()

const DEFAULT_HABITS = [
  { name: "Vaqtida uyg'onish",          icon: 'sun' },
  { name: 'Kitob o\'qish',              icon: 'book' },
  { name: 'Sport qilish',               icon: 'dumbbell' },
  { name: 'Suv ichish (2L)',             icon: 'droplets' },
  { name: 'Maqsadlarni rejalashtirish', icon: 'target' },
  { name: 'Vazifalarni vaqtida bajarish', icon: 'clock' },
]

router.get('/', auth, async (req, res) => {
  const habits = await Habit.find({ user: req.userId })

  // Faqat birinchi marta (hech qachon odat bo'lmagan yangi user)
  if (habits.length === 0) {
    const hasDeleted = await Habit.findOneWithDeleted?.({ user: req.userId })
    // Mongoose da soft delete yo'q, shuning uchun User modelda flag ishlatamiz
    const { default: User } = await import('../models/User.js')
    const user = await User.findById(req.userId)
    if (!user.habitsInitialized) {
      const created = await Habit.insertMany(
        DEFAULT_HABITS.map(h => ({ ...h, user: req.userId }))
      )
      await User.findByIdAndUpdate(req.userId, { habitsInitialized: true })
      const today = new Date().toISOString().split('T')[0]
      return res.json(created.map(h => ({
        ...h.toObject(),
        done: false,
        todayRating: null
      })))
    }
  }

  const today = new Date().toISOString().split('T')[0]
  res.json(habits.map(h => ({
    ...h.toObject(),
    done: h.completedDates.includes(today),
    todayRating: h.ratings?.find(r => r.date === today)?.percent ?? null
  })))
})

router.post('/', auth, async (req, res) => {
  const habit = await Habit.create({ ...req.body, user: req.userId })
  res.json(habit)
})

// Odatga kunlik foiz baholash
router.patch('/:id/rate', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const { percent } = req.body
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId })
    if (!habit) return res.status(404).json({ error: 'Topilmadi' })

    const idx = habit.ratings.findIndex(r => r.date === today)
    if (idx > -1) habit.ratings[idx].percent = percent
    else habit.ratings.push({ date: today, percent })

    await habit.save()
    const todayRating = habit.ratings.find(r => r.date === today)
    res.json({ percent: todayRating?.percent ?? null })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.patch('/:id/toggle', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  const habit = await Habit.findOne({ _id: req.params.id, user: req.userId })
  if (!habit) return res.status(404).json({ error: 'Topilmadi' })
  const idx = habit.completedDates.indexOf(today)
  if (idx > -1) habit.completedDates.splice(idx, 1)
  else habit.completedDates.push(today)
  await habit.save()
  res.json({ ...habit.toObject(), done: habit.completedDates.includes(today) })
})

router.patch('/:id', auth, async (req, res) => {
  try {
    const { name, icon } = req.body
    const update = {}
    if (name !== undefined) update.name = name
    if (icon !== undefined) update.icon = icon

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: update },
      { new: true }
    )
    if (!habit) return res.status(404).json({ error: 'Topilmadi' })
    const today = new Date().toISOString().split('T')[0]
    res.json({
      ...habit.toObject(),
      done: habit.completedDates.includes(today),
      todayRating: habit.ratings?.find(r => r.date === today)?.percent ?? null
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', auth, async (req, res) => {
  await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId })
  res.json({ success: true })
})

export default router
