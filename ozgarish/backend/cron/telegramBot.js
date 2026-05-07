import cron from 'node-cron'
import TelegramBot from 'node-telegram-bot-api'
import User from '../models/User.js'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

const morningMessages = [
  `☀️ <b>Xayrli tong!</b>\n\nBugun yangi bir kun — yangi imkoniyat!\nKunni boshlang va yaxshi odatlarni shakllantiring.\n\n💪 <i>"Har kuni kichik bir qadam — katta o'zgarishning boshlanishi."</i>`,
  `🌅 <b>Yangi kun, yangi sen!</b>\n\nBugun o'zingizni yanada yaxshilash uchun ajoyib kun.\nOdatlaringizni bajaring, maqsadlaringizga qadam qo'ying!\n\n🌟 <i>"Intizom — erkinlikning kaliti."</i>`,
  `🌄 <b>Xayrli tong, do'st!</b>\n\nHar ertalab uyg'onish — bu g'alaba.\nBugun ham o'zingizni rivojlantiring!\n\n🔥 <i>"Kechagidan yaxshiroq bo'l — bu yetarli."</i>`,
  `⭐ <b>Yangi kun muborak!</b>\n\nBugun siz uchun ajoyib imkoniyatlar kutmoqda.\n\n💡 <i>"Muvaffaqiyat — bu har kuni qilinadigan kichik harakatlar yig'indisi."</i>`,
  `🌞 <b>Xayrli tong!</b>\n\nHar bir bajarilgan odat sizni maqsadingizga yaqinlashtiradi!\n\n💎 <i>"Buyuk odamlar odatlarining mahsuli."</i>`,
]

const eveningMessages = [
  `🌙 <b>Xayrli kech!</b>\n\nBugungi kuningizni tahlil qiling.\n\n🤔 O'zingizga savol bering:\n• Bugun qanday odat bajardim?\n• Ertaga nima yaxshiroq qilaman?\n\n🌟 <i>"Har kuni o'zingizni baholash — o'sishning kaliti."</i>`,
  `🌛 <b>Kechqurun muborak!</b>\n\nBugun qanday kun bo'ldi?\n\n💭 Tahlil:\n• Bugun nimani yaxshi qildim?\n• Ertaga nima qilaman?\n\n😴 <i>Yaxshi dam oling!</i>`,
  `🌜 <b>Xayrli kech, do'st!</b>\n\nKun yakunlanmoqda. Bugungi yutuqlaringizni sanab ko'ring!\n\n🌟 <i>"Har kech o'zingizni tahlil qilgan odam — ertaga yanada kuchliroq bo'ladi."</i>`,
  `🌃 <b>Kechqurun salom!</b>\n\nBugun ham o'z yo'lingizda davom etdingiz — bu allaqachon g'alaba!\n\n💫 Yaxshi uxlash — ertangi kuchning manbai.\n\n😴 <i>Yaxshi tunlar!</i>`,
  `🌠 <b>Xayrli kech!</b>\n\nErtaga uchun reja:\n• Birinchi odatingizni bajaring\n• Maqsadingizga bir qadam qo'ying\n\n💪 <i>"Har kech yotishdan oldin ertangi g'alaba uchun reja tuz."</i>`,
]

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

async function broadcastToAll(bot, text) {
  const users = await User.find({ telegramId: { $ne: null } }).select('telegramId fullName')
  let sent = 0
  for (const u of users) {
    try {
      await bot.sendMessage(u.telegramId, text, { parse_mode: 'HTML' })
      sent++
    } catch (e) {
      // Foydalanuvchi botni bloklagan bo'lishi mumkin
      if (e.message.includes('blocked') || e.message.includes('not found')) {
        await User.findByIdAndUpdate(u._id, { telegramId: null })
      }
    }
  }
  console.log(`[Telegram] ${sent}/${users.length} userlarga yuborildi`)
}

export function startTelegramBot() {
  if (!BOT_TOKEN) {
    console.warn('[Telegram] BOT_TOKEN topilmadi')
    return
  }

  const bot = new TelegramBot(BOT_TOKEN, { polling: true })

  // Bot komandalarini ro'yxatga qo'shish — / bosilganda ko'rinadi
  bot.setMyCommands([
    { command: 'start',       description: '🚀 Botni boshlash va ma\'lumot olish' },
    { command: 'motivatsiya', description: '☀️ Ertalabki motivatsiya olish' },
    { command: 'tahlil',      description: '🌙 Kechqurungi tahlil va savol' },
    { command: 'help',        description: '📖 Yordam va komandalar ro\'yxati' },
  ]).then(() => console.log('[Telegram] Komandalar ro\'yxati o\'rnatildi'))
    .catch(e => console.error('[Telegram] Komandalar xato:', e.message))

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id
    const name = msg.from?.first_name || "Do'st"

    // Telegram ID ni User modelga saqlash (agar telefon raqam bo'yicha topilsa)
    try {
      const updated = await User.findOneAndUpdate(
        { telegramId: chatId },
        { telegramId: chatId },
        { upsert: false }
      )
      // Yangi foydalanuvchi — telegramId ni pending sifatida saqlaymiz
      // (login paytida bog'lanadi)
    } catch {}

    await bot.sendMessage(chatId,
      `👋 Salom, <b>${name}</b>!\n\n` +
      `🌟 <b>O'zgarish = Mukammallik</b> platformasiga xush kelibsiz!\n\n` +
      `📱 Bu bot sizga quyidagi imkoniyatlarni beradi:\n\n` +
      `☀️ <b>Har kuni soat 6:00</b> — ertalabki motivatsiya va kun boshlash eslatmasi\n` +
      `🌙 <b>Har kuni soat 21:00</b> — kechqurungi tahlil va o'z-o'zini baholash\n\n` +
      `🎯 <b>Platforma imkoniyatlari:</b>\n` +
      `• ✅ Kunlik odatlar trekeri\n` +
      `• 📊 O'z-o'zini baholash tizimi\n` +
      `• 🎯 Maqsadlar menejeri\n` +
      `• ⏱ Fokus taymeri (Pomodoro)\n` +
      `• 🏆 XP, level va mukofotlar\n` +
      `• 📈 Statistika va tahlil\n\n` +
      `💡 <b>Komandalar:</b>\n` +
      `/motivatsiya — hozir motivatsiya olish\n` +
      `/tahlil — kechqurungi tahlil\n` +
      `/help — yordam\n\n` +
      `🔗 Saytga kirish: <b>http://localhost:3000</b>\n\n` +
      `💪 <i>"Har kun kechagidan yaxshiroq bo'l!"</i>\n\n` +
      `✅ Endi saytga kirib login qilishingiz mumkin!`,
      { parse_mode: 'HTML' }
    )
    console.log(`[Telegram] /start: ${name} (chatId: ${chatId})`)
  })

  bot.onText(/\/motivatsiya/, async (msg) => {
    await bot.sendMessage(msg.chat.id, getRandom(morningMessages), { parse_mode: 'HTML' })
  })

  bot.onText(/\/tahlil/, async (msg) => {
    await bot.sendMessage(msg.chat.id, getRandom(eveningMessages), { parse_mode: 'HTML' })
  })

  bot.onText(/\/help/, async (msg) => {
    await bot.sendMessage(msg.chat.id,
      `📖 <b>Yordam</b>\n\n` +
      `<b>Komandalar:</b>\n` +
      `/start — botni boshlash\n` +
      `/motivatsiya — ertalabki motivatsiya\n` +
      `/tahlil — kechqurungi tahlil\n` +
      `/help — yordam\n\n` +
      `<b>Avtomatik xabarlar:</b>\n` +
      `☀️ Soat 6:00 — ertalabki motivatsiya\n` +
      `🌙 Soat 21:00 — kechqurungi tahlil\n\n` +
      `🔗 Sayt: http://localhost:3000`,
      { parse_mode: 'HTML' }
    )
  })

  bot.on('polling_error', (err) => {
    if (!err.message.includes('ETELEGRAM')) {
      console.error('[Telegram] Polling xato:', err.message)
    }
  })

  // Ertalab 6:00 Toshkent
  cron.schedule('0 6 * * *', async () => {
    console.log('[Telegram] Ertalabki xabar yuborilmoqda...')
    await broadcastToAll(bot, getRandom(morningMessages))
  }, { timezone: 'Asia/Tashkent' })

  // Kechqurun 21:00 Toshkent
  cron.schedule('0 21 * * *', async () => {
    console.log('[Telegram] Kechqurungi xabar yuborilmoqda...')
    await broadcastToAll(bot, getRandom(eveningMessages))
  }, { timezone: 'Asia/Tashkent' })

  console.log('[Telegram] ✅ Bot ishga tushdi! @ozgarish_mukammallik_bot ga /start yuboring')
}
