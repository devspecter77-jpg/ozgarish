import jwt from 'jsonwebtoken'

export default function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Token topilmadi' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ error: 'Token noto\'g\'ri' })
  }
}
