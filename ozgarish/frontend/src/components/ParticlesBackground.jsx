import { useEffect, useRef } from 'react'

export default function ParticlesBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let particles = []
    let W = 0, H = 0
    let frame = 0
    const mouse = { x: -9999, y: -9999, radius: 180 }
    const COUNT = 130
    const CONNECT = 150

    const mkParticle = () => ({
      x:         Math.random() * W,
      y:         Math.random() * H,
      vx:        (Math.random() - 0.5) * 0.6,
      vy:        (Math.random() - 0.5) * 0.6,
      r:         Math.random() * 2.5 + 1.2,
      waveAmp:   Math.random() * 0.35 + 0.1,
      waveFreq:  Math.random() * 0.018 + 0.006,
      wavePhase: Math.random() * Math.PI * 2,
      waveDir:   Math.random() < 0.5 ? 1 : -1,
    })

    const init = () => {
      const parent = canvas.parentElement
      const rect = parent ? parent.getBoundingClientRect() : null
      W = (rect && rect.width  > 0) ? rect.width  : window.innerWidth
      H = (rect && rect.height > 0) ? rect.height : 600
      canvas.width  = W
      canvas.height = H
      // Zarrachalarni canvas o'lchami tayyor bo'lgandan keyin yaratish
      particles = []
      for (let i = 0; i < COUNT; i++) particles.push(mkParticle())
    }

    // DOM tayyor bo'lguncha kutish
    const initTimer = setTimeout(init, 80)

    const loop = () => {
      frame++
      ctx.clearRect(0, 0, W, H)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // To'lqin harakati
        const wave = Math.sin(frame * p.waveFreq + p.wavePhase) * p.waveAmp
        p.vx += wave * p.waveDir * 0.04
        p.vy += wave * (1 - Math.abs(p.waveDir)) * 0.04

        // Mouse attraction
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius
          p.vx += (dx / dist) * force * 0.3
          p.vy += (dy / dist) * force * 0.3
        }

        p.vx *= 0.97
        p.vy *= 0.97
        p.x += p.vx
        p.y += p.vy

        // Wrap
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0

        // Dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        const isDark = document.documentElement.classList.contains('dark') ||
          !document.documentElement.classList.contains('light')
        ctx.fillStyle = isDark ? 'rgba(167,139,250,0.75)' : 'rgba(109,40,217,0.5)'
        ctx.fill()

        // Lines
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const ddx = p.x - q.x
          const ddy = p.y - q.y
          const d = Math.sqrt(ddx * ddx + ddy * ddy)
          if (d < CONNECT) {
            ctx.beginPath()
            const alpha = (1 - d / CONNECT) * 0.4
            ctx.strokeStyle = isDark
              ? `rgba(167,139,250,${alpha})`
              : `rgba(109,40,217,${alpha * 0.7})`
            ctx.lineWidth = 1
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(loop)
    }

    loop()

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    const onResize = () => init()

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(initTimer)
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        background: 'transparent',
        display: 'block',
      }}
    />
  )
}
