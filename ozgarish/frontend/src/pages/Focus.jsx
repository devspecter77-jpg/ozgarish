import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Coffee, Volume2, VolumeX } from 'lucide-react'

const PRESETS = [
  { key: 'focus',  label: 'Fokus',     minutes: 25 },
  { key: 'short',  label: 'Qisqa dam', minutes: 5  },
  { key: 'long',   label: 'Uzun dam',  minutes: 15 },
  { key: 'custom', label: "O'zim",     minutes: 0  },
]

function playTick(audioCtx, volume = 0.15) {
  if (!audioCtx) return
  try {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(528, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(264, audioCtx.currentTime + 0.3)
    gain.gain.setValueAtTime(volume, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4)
    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 0.4)
  } catch {}
}

function playDone(audioCtx) {
  if (!audioCtx) return
  try {
    [0, 0.3, 0.6].forEach((delay, i) => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.type = 'sine'
      const freqs = [528, 660, 792]
      osc.frequency.setValueAtTime(freqs[i], audioCtx.currentTime + delay)
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime + delay)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.6)
      osc.start(audioCtx.currentTime + delay)
      osc.stop(audioCtx.currentTime + delay + 0.6)
    })
  } catch {}
}

function StreetLamp() {
  const lampHead = (
    <div className="lamp-head">
      <div className="lamp-head-top"></div>
      <div className="lamp-light-source"></div>
      <div className="lamp-head-body">
        <div className="lamp-head-rod"></div>
        <div className="lamp-head-glass"></div>
        <div className="lamp-head-rod"></div>
        <div className="lamp-head-glass"></div>
        <div className="lamp-head-rod"></div>
      </div>
    </div>
  )
  const lampBottom = (
    <div className="lamp-bottom">
      <div className="lamp-bottom-top"></div>
      <div className="lamp-bottom-body"></div>
      <div className="lamp-bottom-bottom"></div>
    </div>
  )
  const masonryItems = [1,2,3,4,5].map(i => <div key={i} className="masonry-item"></div>)
  const masonryRows = Array.from({length:10}, (_,i) => (
    <div key={i} className="masonry-row">{masonryItems}</div>
  ))
  return (
    <div className="street-view">
      <div className="street-lamp lamp-left">
        {lampHead}<div className="lamp-rod"></div>{lampBottom}<div className="lamp-shadow"></div>
      </div>
      <div className="street-lamp lamp-right">
        {lampHead}<div className="lamp-rod"></div>{lampBottom}<div className="lamp-shadow"></div>
      </div>
      <div className="masonry-perspective">
        <div className="masonry-container">{masonryRows}</div>
      </div>
    </div>
  )
}

export default function Focus() {
  const [mode, setMode] = useState('focus')
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [soundOn, setSoundOn] = useState(true)
  const [customMin, setCustomMin] = useState(30)
  const intervalRef = useRef(null)
  const audioCtxRef = useRef(null)

  const current = PRESETS.find(m => m.key === mode) || PRESETS[0]
  const totalSeconds = mode === 'custom' ? customMin * 60 : current.minutes * 60

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
    return audioCtxRef.current
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (mode === 'focus') setSessions(n => n + 1)
            if (soundOn) playDone(audioCtxRef.current)
            return 0
          }
          if (soundOn) playTick(audioCtxRef.current)
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, mode, soundOn])

  const handleStart = () => {
    getAudioCtx()
    setRunning(r => !r)
  }

  const selectMode = (m) => {
    setMode(m.key)
    setSeconds(m.key === 'custom' ? customMin * 60 : m.minutes * 60)
    setRunning(false)
  }

  const handleCustomChange = (val) => {
    const mins = Math.max(1, Math.min(180, parseInt(val) || 1))
    setCustomMin(mins)
    if (mode === 'custom') setSeconds(mins * 60)
  }

  const reset = () => {
    setSeconds(mode === 'custom' ? customMin * 60 : current.minutes * 60)
    setRunning(false)
  }

  const displayMins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const displaySecs = String(seconds % 60).padStart(2, '0')
  const progress = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0
  const circumference = 2 * Math.PI * 90

  return (
    <div className="relative space-y-6 min-h-screen pb-8">

      {/* Background animation */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-end justify-center pb-16 opacity-40">
        <div style={{ transform: 'scale(2)', transformOrigin: 'bottom center' }}>
          <StreetLamp />
        </div>
      </div>

      <div className="relative z-10 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Fokus Taymeri</h2>
          <button onClick={() => setSoundOn(s => !s)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-all ${
              soundOn ? 'border-primary/40 text-primary-light bg-primary/10' : 'border-white/10 text-white/40'
            }`}>
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {soundOn ? 'Ovoz yoq' : "Ovoz o'ch"}
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2">
          {PRESETS.map(m => (
            <button key={m.key} onClick={() => selectMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === m.key ? 'bg-primary text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Custom time input */}
        {mode === 'custom' && (
          <div className="card flex items-center gap-4">
            <span className="text-sm text-white/60">Vaqt (daqiqa):</span>
            <input
              type="number" min="1" max="180"
              value={customMin}
              onChange={e => handleCustomChange(e.target.value)}
              onWheel={e => e.currentTarget.blur()}
              className="w-24 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white text-center outline-none focus:border-primary"
            />
            <span className="text-xs text-white/30">1–180 daqiqa</span>
          </div>
        )}

        {/* Timer circle */}
        <div className="card flex flex-col items-center py-10">
          <div className="relative w-52 h-52 mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#ffffff10" strokeWidth="8" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="#7C3AED" strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold font-mono">{displayMins}:{displaySecs}</span>
              <span className="text-white/40 text-sm mt-1">{current.label}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={reset} className="btn-ghost p-3 rounded-full">
              <RotateCcw size={22} />
            </button>
            <button onClick={handleStart}
              className="btn-primary px-10 py-3 rounded-full flex items-center gap-2 text-lg">
              {running ? <Pause size={22} /> : <Play size={22} />}
              {running ? 'Pauza' : 'Boshlash'}
            </button>
          </div>
        </div>

        {/* Sessions */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/60 text-sm">Bugungi fokus sessiyalar</p>
            <Coffee size={18} className="text-white/30" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: Math.max(sessions, 4) }).map((_, i) => (
              <div key={i} className={`w-9 h-9 rounded-full flex items-center justify-center ${i < sessions ? 'bg-primary' : 'bg-white/10'}`}>
                {i < sessions
                  ? <Play size={14} className="text-white" />
                  : <span className="w-2 h-2 rounded-full bg-white/20 block" />
                }
              </div>
            ))}
          </div>
          <p className="text-2xl font-bold mt-3">{sessions} <span className="text-white/40 text-base font-normal">sessiya</span></p>
        </div>

      </div>
    </div>
  )
}
