import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export default async function adminAuth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Token topilmadi' })
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const user = await User.findById(userId)
    if (!user || !user.isAdmin) return res.status(403).json({ error: 'Admin huquqi yo\'q' })
    req.userId = userId
    req.adminUser = user
    next()
  } catch {
    res.status(401).json({ error: 'Token noto\'g\'ri' })
  }
}
