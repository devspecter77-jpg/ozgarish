import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

const defaultHabits = [
  { id: 1, name: "Vaqtida uyg'onish", icon: '🌅', done: false },
  { id: 2, name: 'Darsga tayyorlanish', icon: '📚', done: false },
  { id: 3, name: 'Kitob o\'qish', icon: '📖', done: false },
  { id: 4, name: 'Sport qilish', icon: '💪', done: false },
  { id: 5, name: 'Qo\'pol gapirmaslik', icon: '🤝', done: false },
  { id: 6, name: 'Vazifalarni vaqtida bajarish', icon: '✅', done: false },
]

const quotes = [
  "Har kun yangi men — kechagidan yaxshiroq.",
  "Intizom — erkinlikning kaliti.",
  "Kichik qadamlar katta natijalarga olib boradi.",
  "O'zgarish — mukammallik sari birinchi qadam.",
  "Bugun qilgan harakat ertangi natijani belgilaydi.",
]

export function AppProvider({ children }) {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('habits')
    return saved ? JSON.parse(saved) : defaultHabits
  })
  const [scores, setScores] = useState({ intizom: 7, hurmat: 8, sabr: 6, diqqat: 7, masuliyat: 8 })
  const [mood, setMoodState] = useState(() => {
    const saved = localStorage.getItem('mood')
    if (!saved) return null
    const { value, date } = JSON.parse(saved)
    // Faqat bugungi kun uchun
    return date === new Date().toDateString() ? value : null
  })

  const setMood = (value) => {
    setMoodState(value)
    localStorage.setItem('mood', JSON.stringify({ value, date: new Date().toDateString() }))
  }
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)])

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits))
  }, [habits])

  const toggleHabit = (id) => {
    setHabits(h => h.map(x => x.id === id ? { ...x, done: !x.done } : x))
  }

  const completedCount = habits.filter(h => h.done).length
  const totalXP = completedCount * 10 + Object.values(scores).reduce((a, b) => a + b, 0)

  return (
    <AppContext.Provider value={{ habits, toggleHabit, scores, setScores, mood, setMood, quote, completedCount, totalXP }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
