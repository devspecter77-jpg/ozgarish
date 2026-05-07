# O'zgarish = Mukammallik

Shaxsiy rivojlanish platformasi — odatlar, maqsadlar, baholash va fokus taymeri.

## Loyiha tuzilmasi

```
ozgarish/
├── backend/    # Node.js + Express + MongoDB
└── frontend/   # React + Vite + Tailwind
```

## Local ishga tushirish

### Backend
```bash
cd backend
cp .env.example .env
# .env faylini to'ldiring
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

## Render.com ga deploy qilish

### Backend (Web Service)
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Root Directory:** `ozgarish/backend`
- **Environment Variables:** `.env.example` dagi barcha o'zgaruvchilarni qo'shing

### Frontend (Static Site)
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Root Directory:** `ozgarish/frontend`
- **Environment Variables:**
  - `VITE_API_URL` = backend Render URL (masalan: `https://ozgarish-backend.onrender.com`)
  - `VITE_GROQ_API_KEY` = Groq API key
  - `VITE_GEMINI_API_KEY` = Gemini API key

## Texnologiyalar

- **Backend:** Node.js, Express, MongoDB Atlas, JWT, Passport (Google OAuth)
- **Frontend:** React 18, Vite, Tailwind CSS, Recharts
- **AI:** Groq (llama-3.3-70b-versatile)
- **Bot:** Telegram Bot API
