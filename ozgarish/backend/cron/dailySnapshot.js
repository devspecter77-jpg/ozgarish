import cron from 'node-cron'
import User from '../models/User.js'
import Habit from '../models/Habit.js'
import Assessment from '../models/Assessment.js'
import DailySnapshot from '../models/DailySnapshot.js'

export function startDailyCron() {
  // Har kuni soat 19:00 da ishlaydi (server vaqti)
  cron.schedule('0 19 * * *', async () => {
    console.log('[Cron] Kunlik snapshot saqlanmoqda...')
    const today = new Date().toISOString().split('T')[0]

    try {
      const users = await User.find({}, '_id')

      for (const { _id: userId } of users) {
        // Habits
        const habits = await Habit.find({ user: userId })
        const habitList = habits.map(h => ({
          name: h.name,
          icon: h.icon,
          done: h.completedDates.includes(today)
        }))
        const completed = habitList.filter(h => h.done).length
        const total = habitList.length
        const percent = total ? Math.round(completed / total * 100) : 0

        // Assessment
        const assessment = await Assessment.findOne({ user: userId, date: today })
        const scores = assessment?.scores || null
        const avg = scores
          ? +(Object.values(scores).reduce((a, b) => a + b, 0) / 5).toFixed(1)
          : null

        // Upsert — bir kun uchun faqat bitta snapshot
        await DailySnapshot.findOneAndUpdate(
          { user: userId, date: today },
          {
            user: userId,
            date: today,
            habits: { total, completed, percent, list: habitList },
            assessment: scores ? { scores, avg } : null
          },
          { upsert: true, new: true }
        )
      }

      console.log(`[Cron] ${users.length} ta foydalanuvchi uchun snapshot saqlandi`)
    } catch (e) {
      console.error('[Cron] Xato:', e.message)
    }
  }, {
    timezone: 'Asia/Tashkent'
  })

  console.log('[Cron] Kunlik snapshot cron ishga tushdi (har kuni 19:00 Toshkent vaqti)')
}
