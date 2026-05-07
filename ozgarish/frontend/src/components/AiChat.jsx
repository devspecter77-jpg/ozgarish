import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader, Plus, Trash2, ChevronLeft, MoreVertical, Pencil } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const WELCOME = 'Salom! Men sizning shaxsiy rivojlanish yordamchingizman. Odatlar, maqsadlar yoki intizom haqida savol bering.'

const systemPrompt = `Sen "O'zgarish = Mukammallik" shaxsiy rivojlanish platformasining AI yordamchisisisan.

Qoidalar:
- FAQAT O'zbek tilida javob ber
- Qisqa va aniq gapir (2-4 jumla)
- Amaliy maslahat ber
- Motivatsion bo'l, lekin ortiqcha maqtama
- Faqat odatlar, maqsadlar, intizom, vaqt boshqaruvi, shaxsiy rivojlanish haqida gapir
- Boshqa mavzularda: "Bu mavzu mening soham emas, shaxsiy rivojlanish haqida savol bering" de`

const AiChat = forwardRef(function AiChat(_, ref) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('list') // 'list' | 'chat'
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatsLoading, setChatsLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null) // chatId
  const [menuOpen, setMenuOpen] = useState(null) // chatId
  const [renameChat, setRenameChat] = useState(null) // { id, title }
  const [renameInput, setRenameInput] = useState('')
  const { user, token } = useAuth()
  const bottomRef = useRef(null)

  useImperativeHandle(ref, () => ({
    openWithMessage: async (message) => {
      setOpen(true)
      try {
        const res = await fetch(`${API}/api/chats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        const chatId = data._id
        setActiveChatId(chatId)
        const initMsgs = [{ role: 'assistant', text: WELCOME }]
        setMessages(initMsgs)
        setView('chat')
        // AI ga avtomatik xabar yuborish
        setLoading(true)
        const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ]
          })
        })
        const aiData = await aiRes.json()
        const reply = aiData.choices?.[0]?.message?.content || 'Kechirasiz, javob bera olmadim.'
        const finalMsgs = [
          { role: 'assistant', text: WELCOME },
          { role: 'user', text: message },
          { role: 'assistant', text: reply }
        ]
        setMessages(finalMsgs)
        // Saqlash
        await fetch(`${API}/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ messages: finalMsgs, title: message.slice(0, 40) })
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
  }))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open && user) fetchChats()
  }, [open, user])

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })

  const fetchChats = async () => {
    setChatsLoading(true)
    try {
      const res = await fetch(`${API}/api/chats`, { headers: headers() })
      const data = await res.json()
      setChats(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setChatsLoading(false)
    }
  }

  const openChat = async (chatId) => {
    try {
      const res = await fetch(`${API}/api/chats/${chatId}`, { headers: headers() })
      const data = await res.json()
      setActiveChatId(data._id)
      setMessages(data.messages.length ? data.messages : [{ role: 'assistant', text: WELCOME }])
      setView('chat')
    } catch (e) {
      console.error(e)
    }
  }

  const newChat = async () => {
    try {
      const res = await fetch(`${API}/api/chats`, {
        method: 'POST',
        headers: headers()
      })
      const data = await res.json()
      setActiveChatId(data._id)
      setMessages([{ role: 'assistant', text: WELCOME }])
      setView('chat')
    } catch (e) {
      console.error(e)
    }
  }

  const deleteChat = async (e, chatId) => {
    e.stopPropagation()
    setMenuOpen(null)
    setConfirmDelete(chatId)
  }

  const openRename = (e, chat) => {
    e.stopPropagation()
    setMenuOpen(null)
    setRenameChat({ id: chat._id, title: chat.title })
    setRenameInput(chat.title || '')
  }

  const submitRename = async () => {
    if (!renameInput.trim()) return
    try {
      await fetch(`${API}/api/chats/${renameChat.id}/rename`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ title: renameInput.trim() })
      })
      setChats(c => c.map(ch => ch._id === renameChat.id ? { ...ch, title: renameInput.trim() } : ch))
    } catch (e) {
      console.error(e)
    } finally {
      setRenameChat(null)
    }
  }

  const confirmDeleteChat = async () => {
    try {
      await fetch(`${API}/api/chats/${confirmDelete}`, { method: 'DELETE', headers: headers() })
      setChats(c => c.filter(ch => ch._id !== confirmDelete))
    } catch (e) {
      console.error(e)
    } finally {
      setConfirmDelete(null)
    }
  }

  const saveMessages = async (msgs, firstUserMsg) => {
    if (!activeChatId) return
    const title = firstUserMsg ? firstUserMsg.slice(0, 40) : undefined
    try {
      const res = await fetch(`${API}/api/chats/${activeChatId}/messages`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ messages: msgs, title })
      })
      const updated = await res.json()
      setChats(c => {
        const exists = c.find(ch => ch._id === updated._id)
        if (exists) return c.map(ch => ch._id === updated._id ? { ...ch, title: updated.title, updatedAt: updated.updatedAt } : ch)
        return [{ _id: updated._id, title: updated.title, updatedAt: updated.updatedAt }, ...c]
      })
    } catch (e) {
      console.error(e)
    }
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const isFirst = messages.filter(m => m.role === 'user').length === 0
    const newMsgs = [...messages, { role: 'user', text: userMsg }]
    setMessages(newMsgs)
    setLoading(true)

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text })),
            { role: 'user', content: userMsg }
          ]
        })
      })
      const data = await res.json()
      if (data.error) {
        const errMsgs = [...newMsgs, { role: 'assistant', text: `Xato: ${data.error.message}` }]
        setMessages(errMsgs)
        await saveMessages(errMsgs, isFirst ? userMsg : null)
        return
      }
      const reply = data.choices?.[0]?.message?.content || 'Kechirasiz, javob bera olmadim.'
      const finalMsgs = [...newMsgs, { role: 'assistant', text: reply }]
      setMessages(finalMsgs)
      await saveMessages(finalMsgs, isFirst ? userMsg : null)
    } catch (e) {
      const errMsgs = [...newMsgs, { role: 'assistant', text: 'Xatolik: ' + e.message }]
      setMessages(errMsgs)
      await saveMessages(errMsgs, isFirst ? userMsg : null)
    } finally {
      setLoading(false)
    }
  }

  const backToList = () => {
    setView('list')
    setActiveChatId(null)
    setMessages([])
    fetchChats()
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-20 right-5 md:bottom-6 md:right-6 z-50">
        {/* Spinning ring */}
        {!open && (
          <div className="ai-btn-ring absolute inset-0 rounded-full border-2 border-dashed border-primary/40 scale-125 pointer-events-none" />
        )}
        <button
          onClick={() => setOpen(o => !o)}
          style={{ width: 80, height: 80 }}
          className={`ai-btn relative bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 transition-all duration-300`}
        >
          {open
            ? <X size={30} className="text-white" />
            : <img src="/operator.png" alt="AI" style={{ width: 68, height: 68 }} className="rounded-full object-cover" />
          }
        </button>
      </div>

      {open && (
        <div className="fixed bottom-36 right-5 md:bottom-24 md:right-6 z-50 w-80 md:w-96 h-[480px] flex flex-col bg-[#1a0f3a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-primary/10 flex-shrink-0">
            {view === 'chat' && (
              <button onClick={backToList} className="text-white/60 hover:text-white">
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <img src="/operator.png" alt="AI" className="w-8 h-8 rounded-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">AI Yordamchi</p>
              <p className="text-xs text-white/40 truncate">
                {view === 'list' ? 'Suhbatlar' : 'Shaxsiy rivojlanish'}
              </p>
            </div>
            {view === 'list' && (
              <button onClick={newChat} className="text-white/60 hover:text-white" title="Yangi chat">
                <Plus size={18} />
              </button>
            )}
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Chat list view */}
          {view === 'list' && (
            <div className="flex-1 overflow-y-auto">
              {chatsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader size={20} className="animate-spin text-white/40" />
                </div>
              ) : chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
                  <img src="/operator.png" alt="AI" className="w-12 h-12 rounded-full object-cover opacity-40" />
                  <p className="text-sm">Hali suhbat yo'q</p>
                  <button onClick={newChat}
                    className="px-4 py-2 bg-primary rounded-xl text-white text-sm hover:bg-primary-dark transition-all">
                    Yangi suhbat boshlash
                  </button>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {chats.map(chat => (
                    <div key={chat._id} onClick={() => openChat(chat._id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 cursor-pointer group transition-all relative">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <MessageCircle size={14} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{chat.title || 'Yangi suhbat'}</p>
                        <p className="text-xs text-white/30">{new Date(chat.updatedAt).toLocaleDateString('uz-UZ')}</p>
                      </div>
                      <div className="relative" onClick={e => e.stopPropagation()}>
                        <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === chat._id ? null : chat._id) }}
                          className="p-1 text-white/40 hover:text-white transition-all rounded-lg hover:bg-white/10">
                          <MoreVertical size={15} />
                        </button>
                        {menuOpen === chat._id && (
                          <div className="absolute right-0 top-7 bg-[#2a1a4a] border border-white/10 rounded-xl shadow-xl z-10 w-36 overflow-hidden">
                            <button onClick={(e) => openRename(e, chat)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-all">
                              <Pencil size={13} /> Tahrirlash
                            </button>
                            <button onClick={(e) => deleteChat(e, chat._id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-white/10 transition-all">
                              <Trash2 size={13} /> O'chirish
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat view */}
          {view === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'assistant' ? 'bg-primary' : 'bg-white/10'}`}>
                      {m.role === 'assistant' ? <img src="/operator.png" alt="AI" className="w-7 h-7 rounded-full object-cover" /> : <User size={14} />}
                    </div>
                    <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed ${m.role === 'assistant' ? 'bg-white/10 text-white' : 'bg-primary text-white'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                      <img src="/operator.png" alt="AI" className="w-7 h-7 rounded-full object-cover" />
                    </div>
                    <div className="bg-white/10 px-3 py-2 rounded-xl">
                      <Loader size={16} className="animate-spin text-white/60" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="p-3 border-t border-white/10 flex gap-2 flex-shrink-0">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Savol bering..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary" />
                <button onClick={send} disabled={loading || !input.trim()}
                  className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-primary-dark transition-all">
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {/* Rename modal */}
      {renameChat && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-[#1a0f3a] border border-white/10 rounded-2xl p-6 w-72 shadow-2xl">
            <p className="text-white font-semibold text-center mb-4">Suhbat nomini tahrirlash</p>
            <input
              value={renameInput}
              onChange={e => setRenameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitRename()}
              autoFocus
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRenameChat(null)}
                className="flex-1 py-2 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/10 transition-all">
                Bekor qilish
              </button>
              <button onClick={submitRename}
                className="flex-1 py-2 rounded-xl bg-primary text-white text-sm hover:bg-primary-dark transition-all">
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-[#1a0f3a] border border-white/10 rounded-2xl p-6 w-72 shadow-2xl">
            <p className="text-white font-semibold text-center mb-2">Suhbatni o'chirish</p>
            <p className="text-white/50 text-sm text-center mb-5">Bu suhbat butunlay o'chib ketadi. Ishonchingiz komilmi?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/10 transition-all">
                Bekor qilish
              </button>
              <button onClick={confirmDeleteChat}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600 transition-all">
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
})

export default AiChat
