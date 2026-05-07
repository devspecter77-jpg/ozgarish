import express from 'express'
import auth from '../middleware/auth.js'
import Chat from '../models/Chat.js'

const router = express.Router()

// Barcha chatlarni olish
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.userId })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 })
    res.json(chats)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Bitta chatni olish (xabarlar bilan)
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.userId })
    if (!chat) return res.status(404).json({ error: 'Chat topilmadi' })
    res.json(chat)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Yangi chat yaratish
router.post('/', auth, async (req, res) => {
  try {
    const chat = await Chat.create({ user: req.userId, messages: [] })
    res.json(chat)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Chatga xabar qo'shish va title yangilash
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { messages, title } = req.body
    const chat = await Chat.findOne({ _id: req.params.id, user: req.userId })
    if (!chat) return res.status(404).json({ error: 'Chat topilmadi' })

    chat.messages = messages
    if (title) chat.title = title
    await chat.save()
    res.json(chat)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Chat nomini tahrirlash
router.patch('/:id/rename', auth, async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title: req.body.title },
      { new: true }
    )
    if (!chat) return res.status(404).json({ error: 'Chat topilmadi' })
    res.json(chat)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Chatni o'chirish
router.delete('/:id', auth, async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, user: req.userId })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
