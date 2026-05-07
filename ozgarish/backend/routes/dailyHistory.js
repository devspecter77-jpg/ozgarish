import { Router } from 'express'
import auth from '../middleware/auth.js'
import Habit from '../models/Habit.js'
import Assessment from '../models/Assessment.js'
import DailySnapshot from '../models/DailySnapshot.js'
import Goal from '../models/Goal.js'

const router = Router()

// Barcha kunlar ro'yxati — har biri uchun mini statistika bilan
router.get('/dates', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Snapshotlar
    const snapshots = await DailySnapshot.find({ user: req.userId }).sort({ date: -1 })
    const snapshotMap = {}
    snapshots.forEach(s => { snapshotMap[s.date] = s })

    // Bugungi live data
    const [habits, assessments] = await Promise.all([
      Habit.find({ user: req.userId }),
      Assessment.find({ user: req.userId, date: today }).select('date scores')
    ])

    const todayHasActivity =
      habits.some(h => h.completedDates.includes(today)) ||
      assessments.length > 0

    const dateSet = new Set(Object.keys(snapshotMap))
    // Bugungi sana DOIM qo'shiladi — ertalabdan boshlab
    dateSet.add(today)

    // Har bir sana uchun mini statistika
    const dates = [...dateSet].sort((a, b) => b.localeCompare(a)).map(date => {
      if (snapshotMap[date]) {
        const s = snapshotMap[date]
        const assessAvg = s.assessment?.avg ?? null
        return {
          date,
          habitPercent: s.habits?.percent ?? 0,
          habitCompleted: s.habits?.completed ?? 0,
          habitTotal: s.habits?.total ?? 0,
          assessAvg,
          fromSnapshot: true
        }
      }
      // Bugun — live
      if (date === today) {
        const completed = habits.filter(h => h.completedDates.includes(today)).length
        const total = habits.length
        const percent = total ? Math.round(completed / total * 100) : 0
        const assess = assessments[0]
        const assessAvg = assess?.scores
          ? Math.round(Object.values(assess.scores).reduce((a, b) => a + b, 0) / 5)
          : null
        return { date, habitPercent: percent, habitCompleted: completed, habitTotal: total, assessAvg, fromSnapshot: false }
      }
      return { date, habitPercent: 0, habitCompleted: 0, habitTotal: 0, assessAvg: null, fromSnapshot: false }
    })

    res.json(dates)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Bitta kun uchun to'liq statistika
router.get('/:date', auth, async (req, res) => {
  try {
    const { date } = req.params

    const snapshot = await DailySnapshot.findOne({ user: req.userId, date })
    if (snapshot) {
      const [assessment, goals] = await Promise.all([
        Assessment.findOne({ user: req.userId, date }),
        Goal.find({ user: req.userId })
      ])
      const goalsForDate = goals.filter(g => {
        const created = new Date(g.createdAt).toISOString().split('T')[0]
        return created <= date
      })
      return res.json({
        date,
        habits: snapshot.habits,
        assessment: assessment ? {
          scores: assessment.scores,
          avg: assessment.scores
            ? Math.round(Object.values(assessment.scores).reduce((a, b) => a + b, 0) / 5)
            : null
        } : snapshot.assessment || null,
        goals: goalsForDate,
        fromSnapshot: true
      })
    }

    // Live data
    const [habits, assessment, goals] = await Promise.all([
      Habit.find({ user: req.userId }),
      Assessment.findOne({ user: req.userId, date }),
      Goal.find({ user: req.userId })
    ])

    const habitList = habits.map(h => ({
      _id: h._id, name: h.name, icon: h.icon,
      done: h.completedDates.includes(date),
      todayRating: h.ratings?.find(r => r.date === date)?.percent ?? null
    }))
    const completed = habitList.filter(h => h.done).length

    const goalsForDate = goals.filter(g => {
      const created = new Date(g.createdAt).toISOString().split('T')[0]
      return created <= date
    })

    res.json({
      date,
      habits: { total: habits.length, completed, percent: habits.length ? Math.round(completed / habits.length * 100) : 0, list: habitList },
      assessment: assessment ? {
        scores: assessment.scores,
        avg: assessment.scores ? Math.round(Object.values(assessment.scores).reduce((a, b) => a + b, 0) / 5) : null
      } : null,
      goals: goalsForDate,
      fromSnapshot: false
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
