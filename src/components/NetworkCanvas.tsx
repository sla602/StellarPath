import { useEffect, useRef, useCallback, useState } from 'react'
import type { User } from '../types'
import type { RecommendedConnection } from '../services/gemini'

const DIPPER: { dx: number; dy: number; name: string }[] = [
  { dx:  0.000, dy:  0.383, name: 'Alkaid' },
  { dx: -0.029, dy:  0.153, name: 'Mizar'  },
  { dx: -0.038, dy:  0.010, name: 'Alioth' },
  { dx: -0.042, dy: -0.134, name: 'Megrez' },
  { dx:  0.023, dy: -0.220, name: 'Phecda' },
  { dx:  0.111, dy: -0.310, name: 'Merak'  },
  { dx: -0.061, dy: -0.418, name: 'Dubhe'  },
]
const DIPPER_LINES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[3,6]]

// Pink/rose color for the user star
const ME_COLOR = '#f472b6'

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, selected = false) {
  ctx.save()
  ctx.shadowBlur = selected ? 35 : 18; ctx.shadowColor = color
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2
    const rad = i % 2 === 0 ? r : r * 0.42
    if (i === 0) ctx.moveTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad)
    else          ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad)
  }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill()
  ctx.restore()
}

interface RecommendCardProps {
  conn: RecommendedConnection; x: number; y: number
  connected: boolean; onConnect: () => void; onClose: () => void
}

function RecommendCard({ conn, x, y, connected, onConnect, onClose }: RecommendCardProps) {
  const cardW = 300
  const left   = Math.min(Math.max(x - cardW / 2, 20), window.innerWidth - cardW - 20)
  const top    = y - 220 < 80 ? y + 45 : y - 210
  return (
    <div className="absolute z-20 animate-scale-in" style={{ left, top, width: cardW }}>
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                 style={{ backgroundColor: conn.avatarColor + '33', border: `2px solid ${conn.avatarColor}` }}>
              {conn.name[0]}
            </div>
            <div>
              <p className="text-white text-base font-bold leading-tight">{conn.name}</p>
              <p className="text-sm font-semibold" style={{ color: conn.avatarColor }}>{conn.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="rounded-xl px-4 py-3 space-y-1.5"
             style={{ background: 'rgba(160,100,240,0.12)', border: '1px solid rgba(160,100,240,0.25)' }}>
          <p className="text-[10px] text-purple-400 font-mono uppercase tracking-widest">✦ Gemini Insights</p>
          <p className="text-xs text-slate-200 leading-relaxed">{conn.reason}</p>
        </div>
        {conn.sharedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {conn.sharedSkills.map((s: string) => (
              <span key={s} className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: conn.avatarColor + '20', color: conn.avatarColor, border: `1px solid ${conn.avatarColor}44` }}>
                {s}
              </span>
            ))}
          </div>
        )}
        <button onClick={onConnect}
          className="w-full py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300"
          style={connected ? {
            background: 'linear-gradient(135deg, rgba(196,79,247,0.45), rgba(168,85,247,0.65))',
            border: '1px solid rgba(196,79,247,0.9)', color: '#ffffff',
          } : {
            background: `linear-gradient(135deg, ${conn.avatarColor}44, ${conn.avatarColor}66)`,
            border: `1px solid ${conn.avatarColor}88`, color: '#ffffff',
          }}>
          {connected ? '✦ Connected' : '✦ Connect'}
        </button>
      </div>
    </div>
  )
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10 bg-[#07030f]/60 backdrop-blur-sm">
      <div className="relative w-20 h-20">
        {[0,1,2].map(i => (
          <div key={i} className="absolute inset-0 rounded-full border-2 border-purple-500/50 pulse-ring"
               style={{ animationDelay: `${i * 0.6}s` }} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-purple-400 rounded-full animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
        </div>
      </div>
      <p className="text-purple-300 text-base font-mono tracking-widest animate-pulse">Analyzing Galactic Network...</p>
    </div>
  )
}

interface PlacedConn { conn: RecommendedConnection | null; x: number; y: number; isMe: boolean; idx: number }
interface Props { currentUser: User; connections: RecommendedConnection[]; isLoading: boolean }

export default function NetworkCanvas({ currentUser, connections, isLoading }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const placedRef  = useRef<PlacedConn[]>([])
  const rafRef     = useRef<number>(0)
  const tRef       = useRef(0)
  const [selected,  setSelected]  = useState<{ conn: RecommendedConnection; x: number; y: number } | null>(null)
  const [connected, setConnected] = useState<Set<string>>(new Set())

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left, my = e.clientY - rect.top
    const hit = placedRef.current.find(p => Math.hypot(p.x - mx, p.y - my) < (p.isMe ? 45 : 40))
    if (hit && !hit.isMe && hit.conn) setSelected({ conn: hit.conn, x: hit.x, y: hit.y })
    else setSelected(null)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return

    const layout = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      const cx     = canvas.width  * 0.50
      const cy     = canvas.height * 0.52
      const spread = Math.min(canvas.width, canvas.height) * 0.75
      placedRef.current = DIPPER.map((off, i) => ({
        conn: i === 0 ? null : connections[i - 1] ?? null,
        x: cx + off.dx * spread, y: cy + off.dy * spread,
        isMe: i === 0, idx: i,
      }))
    }
    layout()
    window.addEventListener('resize', layout)

    const tick = () => {
      tRef.current += 0.012
      const t = tRef.current
      const W = canvas.width, H = canvas.height
      const placed = placedRef.current

      ctx.fillStyle = '#07030f'; ctx.fillRect(0, 0, W, H)
      if (isLoading) { rafRef.current = requestAnimationFrame(tick); return }

      // Header
      ctx.save()
      ctx.font = 'bold 24px "Exo 2", sans-serif'
      ctx.fillStyle = 'rgba(230,200,255,0.95)'
      ctx.textAlign = 'center'
      ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(180,100,255,0.6)'
      ctx.fillText('✦  Big Dipper Network', W / 2, H * 0.07)
      ctx.font = 'bold 15px "Exo 2", sans-serif'
      ctx.fillStyle = 'rgba(180,140,220,0.6)'
      ctx.shadowBlur = 0
      ctx.fillText('Gemini Professional Recommendations', W / 2, H * 0.10)
      ctx.restore()

      // Ghost lines
      DIPPER_LINES.forEach(([a, b]) => {
        const na = placed[a], nb = placed[b]; if (!na || !nb) return
        ctx.save()
        ctx.globalAlpha = 0.45; ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2.0; ctx.setLineDash([6, 10])
        ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(255,255,255,0.4)'
        ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke()
        ctx.restore()
      })

      // Active lines
      DIPPER_LINES.forEach(([a, b]) => {
        const na = placed[a], nb = placed[b]; if (!na || !nb) return
        const hasA = na.isMe || na.conn !== null
        const hasB = nb.isMe || nb.conn !== null
        if (!hasA || !hasB) return
        const isConnA = !na.isMe && na.conn && connected.has(na.conn.name)
        const isConnB = !nb.isMe && nb.conn && connected.has(nb.conn.name)
        const isConn  = isConnA || isConnB
        ctx.save()
        ctx.globalAlpha = isConn ? 0.9 : (0.4 + Math.sin(t * 0.6 + a) * 0.1)
        ctx.strokeStyle = isConn ? '#c44ff7' : 'rgba(220,180,255,0.85)'
        ctx.lineWidth   = isConn ? 2.5 : 1.5
        ctx.setLineDash(isConn ? [] : [5, 8])
        if (isConn) { ctx.shadowBlur = 15; ctx.shadowColor = '#c44ff7' }
        ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke()
        ctx.restore()
      })

      // Nodes
      placed.forEach(p => {
        const pulse      = Math.sin(t * (p.isMe ? 1.1 : 0.65) + p.idx * 0.9) * 0.15
        const isSelected = !p.isMe && selected?.conn?.name === p.conn?.name
        const isConn     = !p.isMe && p.conn !== null && connected.has(p.conn.name)

        if (p.isMe) {
          const r = 26
          // Pink radial glow
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 6)
          g.addColorStop(0, 'rgba(244,114,182,0.5)'); g.addColorStop(1, 'transparent')
          ctx.save(); ctx.beginPath(); ctx.arc(p.x, p.y, r * 6, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); ctx.restore()

          // Cross rays — pink
          const rLen = r * 4 + pulse * 7
          ;[[p.x - rLen, p.y, p.x + rLen, p.y],[p.x, p.y - rLen, p.x, p.y + rLen]].forEach(([x1,y1,x2,y2]) => {
            const gr = ctx.createLinearGradient(x1,y1,x2,y2)
            gr.addColorStop(0, 'transparent'); gr.addColorStop(0.5, 'rgba(244,114,182,0.55)'); gr.addColorStop(1, 'transparent')
            ctx.save(); ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2)
            ctx.strokeStyle = gr; ctx.lineWidth = 1.8; ctx.stroke(); ctx.restore()
          })

          drawStar(ctx, p.x, p.y, r + pulse * 4, ME_COLOR, false)

          // "You" label — pink
          ctx.save()
          ctx.font = 'bold 18px "Exo 2", sans-serif'
          ctx.fillStyle = ME_COLOR; ctx.textAlign = 'center'
          ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(244,114,182,0.6)'
          ctx.fillText(currentUser.name, p.x, p.y + 55)
          ctx.restore()

        } else if (p.conn) {
          const starColor = isConn ? '#C44FF7' : '#e8d8ff'
          const r         = isConn ? 16 : 13

          ctx.save(); ctx.globalAlpha = 0.35 + pulse
          ctx.shadowBlur = 20; ctx.shadowColor = starColor
          ctx.beginPath(); ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = starColor + '22'; ctx.fill(); ctx.restore()

          drawStar(ctx, p.x, p.y, r + pulse, starColor + (isConn ? 'ff' : 'dd'), isSelected)

          if (isConn) {
            ctx.beginPath(); ctx.arc(p.x, p.y, r + 11, 0, Math.PI * 2)
            ctx.strokeStyle = 'rgba(196,79,247,0.65)'; ctx.lineWidth = 1.8; ctx.stroke()
          }
          if (isSelected && !isConn) {
            ctx.beginPath(); ctx.arc(p.x, p.y, r + 10, 0, Math.PI * 2)
            ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5; ctx.stroke()
          }

          // Name & role — reduced but readable
          ctx.save()
          ctx.font = `bold 13px "Exo 2", sans-serif`
          ctx.fillStyle = isConn ? '#e0aaff' : isSelected ? '#ffffff' : 'rgba(215,195,255,0.88)'
          ctx.textAlign = 'center'
          ctx.shadowBlur = 4; ctx.shadowColor = 'rgba(0,0,0,0.8)'
          ctx.fillText(p.conn.name, p.x, p.y + 34)
          ctx.font = '11px "Exo 2", sans-serif'
          ctx.fillStyle = isConn ? '#C44FF7' : 'rgba(196,181,253,0.75)'
          ctx.fillText(p.conn.role, p.x, p.y + 50)
          ctx.restore()

          if (t < 6 && !isSelected && !isConn) {
            ctx.save(); ctx.globalAlpha = Math.max(0, 1 - t / 5) * 0.7
            ctx.font = '10px "Exo 2", sans-serif'; ctx.fillStyle = '#d8b4fe'; ctx.textAlign = 'center'
            ctx.fillText('click', p.x, p.y + 65); ctx.restore()
          }
        }
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', layout) }
  }, [currentUser, connections, isLoading, selected, connected])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 cursor-pointer" onClick={handleClick} />
      
      {/* Legend UI 추가: "You" 아이콘 색상을 ME_COLOR로 적용 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full glass-panel flex items-center gap-6 text-[11px] text-slate-400 font-medium tracking-wider uppercase z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ME_COLOR, boxShadow: `0 0 8px ${ME_COLOR}` }} />
          <span>You (Alkaid)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
          <span>Recommendation</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c44ff7]" />
          <span>Connected</span>
        </div>
        <div className="opacity-40 ml-2">· click to connect</div>
      </div>

      {isLoading && <LoadingOverlay />}
      {selected && (
        <RecommendCard
          conn={selected.conn} x={selected.x} y={selected.y}
          connected={connected.has(selected.conn.name)}
          onConnect={() => setConnected(prev => {
            const next = new Set(prev)
            if (next.has(selected.conn.name)) next.delete(selected.conn.name)
            else next.add(selected.conn.name)
            return next
          })}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}