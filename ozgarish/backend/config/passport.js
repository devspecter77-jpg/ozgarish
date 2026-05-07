import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'

export function initPassport() {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    passReqToCallback: true,
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value
      const isRegister = req.query.state === 'register'

      // Avval googleId bilan qidirish
      let user = await User.findOne({ googleId: profile.id })
      if (user) return done(null, user)

      // Email bilan qidirish
      if (email) {
        user = await User.findOne({ email })
        if (user) {
          user.googleId = profile.id
          if (!user.avatar) user.avatar = profile.photos?.[0]?.value
          await user.save()
          return done(null, user)
        }
      }

      // Register rejimi — yangi user yaratamiz
      if (isRegister) {
        user = await User.create({
          fullName: profile.displayName,
          email,
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value,
          password: Math.random().toString(36).slice(-12) + 'Aa1!',
        })
        return done(null, user)
      }

      // Login rejimi — hisob topilmadi
      return done(null, false)
    } catch (err) {
      done(err, null)
    }
  }))
}

export default passport
