import { useEffect, useRef, useState } from 'react'
import type { User } from '../types'

interface Props {
  user: User
  onComplete: () => void
}

// ── 물고기자리 별 좌표 (상대 오프셋, 0~1 스케일) ────────────
// 물고기자리는 두 물고기가 리본으로 연결된 형태
// 위쪽 물고기(4개) + 연결부(2개) + 아래쪽 물고기(4개) = 10개
const PISCES_OFFSETS = [
  // 위쪽 물고기
  { dx: -0.28, dy: -0.22 },
  { dx: -0.14, dy: -0.30 },
  { dx:  0.02, dy: -0.26 },
  { dx:  0.10, dy: -0.14 },
  // 연결 리본
  { dx:  0.00, dy: -0.04 },
  { dx: -0.08, dy:  0.06 },
  // 아래쪽 물고기
  { dx: -0.02, dy:  0.18 },
  { dx:  0.12, dy:  0.26 },
  { dx:  0.22, dy:  0.20 },
  { dx:  0.16, dy:  0.08 },
]

// 물고기자리 연결선 인덱스 쌍
const PISCES_LINES = [
  [0,1],[1,2],[2,3],[3,4],   // 위 물고기
  [4,5],                      // 리본
  [5,6],[6,7],[7,8],[8,9],[9,5], // 아래 물고기
]

// ── 북두칠성 오프셋 (소셜 네트워크용, 나중에 GalaxyScreen에서 사용) ──
// 유저 별 = 인덱스 0 (Alkaid, 가장 아래/크게)
export const BIG_DIPPER_OFFSETS = [
  { dx:  0.00, dy:  0.00 }, // 0 = 나 (유저) — 가장 크고 밝음
  { dx:  0.18, dy: -0.12 }, // 1 Mizar
  { dx:  0.32, dy: -0.08 }, // 2 Alioth
  { dx:  0.44, dy: -0.14 }, // 3 Megrez
  { dx:  0.52, dy:  0.06 }, // 4 Phecda
  { dx:  0.62, dy:  0.14 }, // 5 Merak
  { dx:  0.68, dy: -0.02 }, // 6 Dubhe
]

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: '#4F8EF7', Backend: '#F7A24F', DevOps: '#4FF7A2',
  'AI/ML':  '#C44FF7', Data:    '#F74F4F', Mobile: '#F7E94F', Other: '#888',
}

function skillColor(proficiency: number): string {
  if (proficiency === 0) return '#FFFFFF'   // Not Learned — white
  if (proficiency === 1) return '#F7C94F'   // Learning — yellow
  return '#C44FF7'                           // Proficient — purple
}

// ── 타입 ──────────────────────────────────────────────────
interface StarState {
  x: number; y: number
  px: number; py: number   // 명시적 선언
  r: number; color: string
  opacity: number; scale: number
  born: boolean; bornAt: number
  label: string
}

interface Particle {
  x: number; y: number; vx: number; vy: number
  life: number; r: number; color: string
}

export default function BurstScreen({ user, onComplete }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const animRef      = useRef<number>(0)
  const [statusText, setStatusText] = useState('Constellation initializing...')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const W  = canvas.width
    const H  = canvas.height
    const cx = W / 2
    const cy = H * 0.50   // 화면 중앙

    // ── 파티클 풀 ──
    const particles: Particle[] = []
    const addBurst = (x: number, y: number, color: string, count = 16) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
        const speed = 1.2 + Math.random() * 2.8
        particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: 1, r: 1.2 + Math.random()*2, color })
      }
    }

    // ── 스킬 → 물고기자리 위치 매핑 ──
    const skills = user.skills.filter(s => s.type !== 'blackhole').slice(0, 10)
    const spread = Math.min(W, H) * 0.38

    const stars: StarState[] = skills.map((skill, i) => {
      const off = PISCES_OFFSETS[i % PISCES_OFFSETS.length]
      const sx  = cx + off.dx * spread
      const sy  = cy + off.dy * spread
      return {
        x: sx, y: sy, px: sx, py: sy,
        r: skill.proficiency >= 80 ? 9 : skill.proficiency >= 40 ? 7 : 5,
        color: skillColor(skill.proficiency),
        opacity: 0, scale: 0, born: false, bornAt: 0,
        label: skill.label,
      }
    })

    // ── 유저(중앙) 별 ──
    const hero = { opacity: 0, scale: 0, born: false, bornAt: 0 }

    const startTime  = performance.now()
    const HERO_AT    = 400
    const STAR_START = 1000
    const STAR_GAP   = 260
    const DONE_AT    = STAR_START + skills.length * STAR_GAP + 900
    let completed    = false

    const draw = (now: number) => {
      const elapsed = now - startTime
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#03030a'
      ctx.fillRect(0, 0, W, H)

      // 파티클
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy
        p.vx *= 0.95; p.vy *= 0.95
        p.life -= 0.022
        if (p.life <= 0) { particles.splice(i, 1); continue }
        ctx.save()
        ctx.globalAlpha = p.life * 0.75
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI*2)
        ctx.fillStyle = p.color; ctx.fill()
        ctx.restore()
      }

      // ── 유저 별 ──
      if (elapsed > HERO_AT && !hero.born) {
        hero.born = true; hero.bornAt = elapsed
        addBurst(cx, cy, user.avatarColor, 30)
        setStatusText(`✦ ${user.name}'s constellation is being created...`)
      }
      if (hero.born) {
        const age    = elapsed - hero.bornAt
        hero.opacity = Math.min(1, age / 350)
        hero.scale   = Math.min(1, age / 260) * (1 + Math.max(0, 1 - age/260) * 0.5)

        // 외곽 글로우
        ctx.save()
        ctx.globalAlpha = hero.opacity * 0.3
        ctx.shadowBlur  = 40 * hero.scale; ctx.shadowColor = user.avatarColor
        ctx.beginPath(); ctx.arc(cx, cy, 22 * hero.scale, 0, Math.PI*2)
        ctx.fillStyle = user.avatarColor; ctx.fill()
        ctx.restore()
        // 핵심
        ctx.save()
        ctx.globalAlpha = hero.opacity
        ctx.shadowBlur  = 18 * hero.scale; ctx.shadowColor = user.avatarColor
        ctx.beginPath(); ctx.arc(cx, cy, 8 * hero.scale, 0, Math.PI*2)
        ctx.fillStyle = '#fff'; ctx.fill()
        ctx.restore()
        // 이름
        if (hero.opacity > 0.6) {
          ctx.save()
          ctx.globalAlpha = hero.opacity * 0.9
          ctx.font = 'bold 12px "Exo 2", sans-serif'
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'
          ctx.fillText(user.name, cx, cy + 24)
          ctx.restore()
        }
      }

      // ── 스킬 별들 (물고기자리 모양으로 순서대로 등장) ──
      stars.forEach((star, i) => {
        const appearAt = STAR_START + i * STAR_GAP
        if (elapsed > appearAt && !star.born) {
          star.born = true; star.bornAt = elapsed
          addBurst(star.x, star.y, star.color, 12)
          setStatusText(`✦ ${star.label} star appearing`)
        }
        if (!star.born) return

        const age    = elapsed - star.bornAt
        star.opacity = Math.min(1, age / 300)
        star.scale   = Math.min(1, age / 220) * (1 + Math.max(0, 1 - age/220) * 0.55)
        star.px      = star.x
        star.py      = star.y

        // 물고기자리 연결선 그리기
        PISCES_LINES.forEach(([a, b]) => {
          if (b !== i && a !== i) return
          const other = stars[a === i ? b : a]
          if (!other?.born) return
          const progress = Math.min(1, (age - 60) / 320)
          if (progress <= 0) return
          const tx = star.x + (other.x - star.x) * (a === i ? progress : 1)
          const ty = star.y + (other.y - star.y) * (a === i ? progress : 1)
          ctx.save()
          ctx.globalAlpha = Math.min(star.opacity, other.opacity) * 0.35
          ctx.strokeStyle = '#7db8f7'
          ctx.lineWidth   = 0.8
          ctx.setLineDash([3, 5])
          ctx.beginPath(); ctx.moveTo(star.x, star.y); ctx.lineTo(tx, ty); ctx.stroke()
          ctx.restore()
        })

        // 처음 별은 유저에서 연결선
        if (i === 0 && star.opacity > 0.2 && hero.opacity > 0.2) {
          const prog = Math.min(1, (age - 50) / 280)
          ctx.save()
          ctx.globalAlpha = star.opacity * 0.25
          ctx.strokeStyle = user.avatarColor
          ctx.lineWidth   = 0.8; ctx.setLineDash([3,6])
          ctx.beginPath(); ctx.moveTo(cx, cy)
          ctx.lineTo(cx + (star.x - cx)*prog, cy + (star.y - cy)*prog)
          ctx.stroke(); ctx.restore()
        }

        // 별 글로우
        ctx.save()
        ctx.globalAlpha = star.opacity * 0.4
        ctx.shadowBlur  = 14*star.scale; ctx.shadowColor = star.color
        ctx.beginPath(); ctx.arc(star.x, star.y, star.r*1.8*star.scale, 0, Math.PI*2)
        ctx.fillStyle = star.color; ctx.fill()
        ctx.restore()
        // 별 핵심
        ctx.save()
        ctx.globalAlpha = star.opacity
        ctx.shadowBlur  = 10*star.scale; ctx.shadowColor = star.color
        ctx.beginPath(); ctx.arc(star.x, star.y, star.r*star.scale, 0, Math.PI*2)
        ctx.fillStyle = star.color; ctx.fill()
        ctx.restore()
        // 레이블
        if (star.opacity > 0.55) {
          ctx.save()
          ctx.globalAlpha = star.opacity * 0.85
          ctx.font = '10px "Exo 2", sans-serif'
          ctx.fillStyle = star.color; ctx.textAlign = 'center'
          ctx.fillText(star.label, star.x, star.y + star.r + 13)
          ctx.restore()
        }
      })

      // 완료
      if (elapsed > DONE_AT && !completed) {
        completed = true
        setStatusText('🌌 Universe Map Opening...')
        setTimeout(onComplete, 600)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [user, onComplete])

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-3 z-10">
        <p key={statusText} className="text-slate-400 text-sm font-mono animate-fade-in">
          {statusText}
        </p>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"
                 style={{ animationDelay: `${i*0.3}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}