import { useEffect, useRef, useState } from 'react'
import type { AuthMode } from '../types'

// 북두칠성 실제 비율 좌표 (Big Dipper)
const BIG_DIPPER = [
  { x: 0.72, y: 0.30, r: 2.8, opacity: 0.22, name: 'Dubhe'  },
  { x: 0.65, y: 0.36, r: 2.2, opacity: 0.18, name: 'Merak'  },
  { x: 0.60, y: 0.44, r: 2.0, opacity: 0.16, name: 'Phecda' },
  { x: 0.64, y: 0.50, r: 1.8, opacity: 0.16, name: 'Megrez' },
  { x: 0.55, y: 0.54, r: 1.8, opacity: 0.14, name: 'Alioth' },
  { x: 0.46, y: 0.50, r: 1.6, opacity: 0.13, name: 'Mizar'  },
  { x: 0.38, y: 0.46, r: 1.4, opacity: 0.11, name: 'Alkaid' },
]
const HERO = BIG_DIPPER[0]

// 순환 서브타이틀
const SUBTITLES = [
  'Your network is your constellation',
  'Your network is your constellation',
  'Discover the stars that haven\'t shone yet',
]

interface Props {
  onAuthOpen: (mode: AuthMode) => void
}

export default function LandingScreen({ onAuthOpen }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rafRef       = useRef<number>(0)
  const tRef         = useRef(0)
  const [subIdx, setSubIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSubIdx(i => (i + 1) % SUBTITLES.length), 3000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      tRef.current += 0.010
      const t = tRef.current
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // 희미한 연결선
      ctx.save()
      ctx.setLineDash([3, 7])
      BIG_DIPPER.forEach((star, i) => {
        if (i === 0) return
        const prev = BIG_DIPPER[i - 1]
        ctx.globalAlpha = 0.055 + Math.sin(t * 0.5 + i) * 0.015
        ctx.strokeStyle = '#5577aa'
        ctx.lineWidth   = 0.7
        ctx.beginPath()
        ctx.moveTo(prev.x * W, prev.y * H)
        ctx.lineTo(star.x  * W, star.y  * H)
        ctx.stroke()
      })
      ctx.setLineDash([])
      ctx.restore()

      // 다른 6개 별 (희미)
      BIG_DIPPER.slice(1).forEach((star, i) => {
        const pulse = Math.sin(t * 0.7 + i * 1.3) * 0.04
        ctx.save()
        ctx.globalAlpha = star.opacity + pulse
        ctx.shadowBlur  = 5
        ctx.shadowColor = '#8ab4d8'
        ctx.beginPath()
        ctx.arc(star.x * W, star.y * H, star.r, 0, Math.PI * 2)
        ctx.fillStyle = '#c8dff5'
        ctx.fill()
        ctx.restore()
      })

      // 주인공 별 (Dubhe)
      const hx    = HERO.x * W
      const hy    = HERO.y * H
      const pulse = Math.sin(t * 1.1) * 0.12

      // 헤일로 3겹
      for (let i = 3; i >= 1; i--) {
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 35 + i * 16)
        g.addColorStop(0, `rgba(160,100,240,${(0.06 + pulse * 0.02) / i})`)
        g.addColorStop(1, 'rgba(160,100,240,0)')
        ctx.save()
        ctx.beginPath()
        ctx.arc(hx, hy, 35 + i * 16, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
        ctx.restore()
      }

      // 중간 글로우
      const mid = ctx.createRadialGradient(hx, hy, 0, hx, hy, 18)
      mid.addColorStop(0,   `rgba(220,190,255,${0.95 + pulse * 0.05})`)
      mid.addColorStop(0.5, `rgba(160,100,240,${0.55 + pulse * 0.05})`)
      mid.addColorStop(1,   'rgba(160,100,240,0)')
      ctx.save(); ctx.beginPath(); ctx.arc(hx, hy, 18, 0, Math.PI * 2); ctx.fillStyle = mid; ctx.fill(); ctx.restore()

      // 별 핵심
      ctx.save()
      ctx.shadowBlur = 28 + pulse * 12; ctx.shadowColor = '#c084fc'
      ctx.beginPath(); ctx.arc(hx, hy, 4.5 + pulse * 1.2, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'; ctx.fill()
      ctx.restore()

      // 십자 광선 (4방향 + 대각 2방향)
      const rLen = 42 + pulse * 6
      ;[
        [hx - rLen, hy,           hx + rLen, hy,           1.0],
        [hx,        hy - rLen,    hx,        hy + rLen,    1.0],
        [hx - rLen * 0.6, hy - rLen * 0.6, hx + rLen * 0.6, hy + rLen * 0.6, 0.45],
        [hx + rLen * 0.6, hy - rLen * 0.6, hx - rLen * 0.6, hy + rLen * 0.6, 0.45],
      ].forEach(([x1, y1, x2, y2, strength]) => {
        const g = ctx.createLinearGradient(x1, y1, x2, y2)
        g.addColorStop(0,   'transparent')
        g.addColorStop(0.5, `rgba(210,170,255,${(0.28 + pulse * 0.08) * strength})`)
        g.addColorStop(1,   'transparent')
        ctx.save(); ctx.beginPath()
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
        ctx.strokeStyle = g; ctx.lineWidth = strength > 0.5 ? 1 : 0.6; ctx.stroke()
        ctx.restore()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* 하단 그라디언트 */}
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#03030a] to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-16 px-4">

        {/* 배지 */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 animate-fade-up"
          style={{ background: 'rgba(160,100,240,0.08)', border: '1px solid rgba(160,100,240,0.2)', animationDelay: '0.1s' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-purple-300/80 text-xs font-mono tracking-widest uppercase">Powered by Gemini AI</span>
        </div>

        {/* 헤드라인 */}
        <div className="text-center mb-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="font-display font-black leading-none tracking-tight">
            <span className="block text-5xl md:text-7xl text-white mb-1">Stellar</span>
            <span className="block text-5xl md:text-7xl text-glow-blue">Path</span>
          </h1>
        </div>

        {/* 순환 서브타이틀 */}
        <div className="h-8 flex items-center justify-center mb-10 animate-fade-up" style={{ animationDelay: '0.35s' }}>
          <p key={subIdx} className="text-slate-400 text-base md:text-lg text-center animate-fade-in">
            {SUBTITLES[subIdx]}
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <button onClick={() => onAuthOpen('signup')} className="btn-primary flex-1 py-4 text-sm">
            ✦ Create My Constellation
          </button>
          <button onClick={() => onAuthOpen('login')} className="btn-ghost flex-1 py-4 text-sm">
            Log In
          </button>
        </div>

        {/* 소셜 프루프 */}
        <div className="flex items-center gap-3 mt-8 animate-fade-up" style={{ animationDelay: '0.7s' }}>
          <div className="flex -space-x-2">
            {['#a855f7','#C44FF7','#4FF7A2','#F7A24F'].map((c, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-[#03030a]"
                   style={{ backgroundColor: c + '55', borderColor: c + '88' }} />
            ))}
          </div>
          <span className="text-slate-600 text-xs">
            Already <span className="text-slate-400">127 people</span> have made their constellations. Join them!
          </span>
        </div>
      </div>
    </div>
  )
}