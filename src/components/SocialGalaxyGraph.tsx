import { useEffect, useRef, useCallback } from 'react'
import type { SocialNode, SocialLink, User } from '../types'

interface GraphData { nodes: SocialNode[]; links: SocialLink[] }
interface Props {
  graphData: GraphData
  currentUser: User
  selectedNode: SocialNode | null
  onNodeClick: (node: SocialNode | null) => void
}

// ── 북두칠성 오프셋 ───────────────────────────────────────
// 인덱스 0 = 나 (가장 크고 밝은 별, Alkaid 자리)
// 인덱스 1~6 = 다른 유저들
const DIPPER = [
  { dx:  0.00, dy:  0.00 }, // 0 나
  { dx:  0.20, dy: -0.14 }, // 1
  { dx:  0.36, dy: -0.10 }, // 2
  { dx:  0.50, dy: -0.16 }, // 3
  { dx:  0.58, dy:  0.04 }, // 4
  { dx:  0.70, dy:  0.12 }, // 5
  { dx:  0.76, dy: -0.04 }, // 6
]

// 북두칠성 연결선
const DIPPER_LINES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]]

// 물고기자리 오프셋 (내 스킬용)
const PISCES = [
  { dx: -0.28, dy: -0.22 },
  { dx: -0.14, dy: -0.30 },
  { dx:  0.02, dy: -0.26 },
  { dx:  0.10, dy: -0.14 },
  { dx:  0.00, dy: -0.04 },
  { dx: -0.08, dy:  0.06 },
  { dx: -0.02, dy:  0.18 },
  { dx:  0.12, dy:  0.26 },
  { dx:  0.22, dy:  0.20 },
  { dx:  0.16, dy:  0.08 },
]

const PISCES_LINES = [
  [0,1],[1,2],[2,3],[3,4],[4,5],
  [5,6],[6,7],[7,8],[8,9],[9,5],
]

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: '#4F8EF7', Backend: '#F7A24F', DevOps: '#4FF7A2',
  'AI/ML':  '#C44FF7', Data:    '#F74F4F', Mobile: '#F7E94F', Other: '#888',
}

function skillColor(proficiency: number, category: string): string {
  if (proficiency === 0)  return '#6b7280'
  if (proficiency <= 50)  return '#F7C94F'
  return CATEGORY_COLORS[category] ?? '#C44FF7'
}

function nodeRadius(proficiency: number, type: string) {
  if (type === 'blackhole') return 11
  if (proficiency >= 80)   return 10
  if (proficiency >= 40)   return 7
  return 5
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, glow = false) {
  if (glow) { ctx.save(); ctx.shadowBlur = r * 4; ctx.shadowColor = color }
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const rad   = i % 2 === 0 ? r : r * 0.42
    i === 0
      ? ctx.moveTo(x + Math.cos(angle)*rad, y + Math.sin(angle)*rad)
      : ctx.lineTo(x + Math.cos(angle)*rad, y + Math.sin(angle)*rad)
  }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill()
  if (glow) ctx.restore()
}

function drawBlackhole(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  for (let i = 3; i >= 1; i--) {
    ctx.beginPath(); ctx.arc(x, y, r*(1+i*0.5), 0, Math.PI*2)
    ctx.strokeStyle = `rgba(196,79,247,${0.07/i})`; ctx.lineWidth = 1.5; ctx.stroke()
  }
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0,'#000'); g.addColorStop(0.6,'rgba(50,0,80,0.95)'); g.addColorStop(1,'rgba(120,30,180,0.6)')
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fillStyle = g; ctx.fill()
  ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = '#C44FF7'
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2)
  ctx.strokeStyle = 'rgba(196,79,247,0.7)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore()
}

// ── 노드 위치 계산 (물리 없이 고정 배치) ──────────────────
interface PlacedNode {
  node: SocialNode
  x: number; y: number
  isHero: boolean   // = 내 유저 대표 별
  dipperIdx: number // -1이면 일반 스킬
}

function buildLayout(graphData: GraphData, currentUser: User, W: number, H: number): PlacedNode[] {
  const cx = W / 2
  const cy = H / 2
  const placed: PlacedNode[] = []

  // ── 북두칠성 배치 ──
  // 중심점: 화면 왼쪽 40% 지점
  const dipperCX   = W * 0.42
  const dipperCY   = H * 0.48
  const dipperScale = Math.min(W, H) * 0.42

  // 다른 유저들의 대표 노드 (각 유저 첫 번째 스킬)
  const otherUsers = graphData.nodes
    .filter(n => !n.isCurrentUser)
    .reduce((acc, n) => {
      if (!acc.find(a => a.userHandle === n.userHandle)) acc.push(n)
      return acc
    }, [] as SocialNode[])
    .slice(0, 6)

  // 인덱스 0 = 나
  const meRepNode = graphData.nodes.find(n => n.isCurrentUser && n.type !== 'blackhole')
  if (meRepNode) {
    placed.push({
      node: meRepNode,
      x: dipperCX + DIPPER[0].dx * dipperScale,
      y: dipperCY + DIPPER[0].dy * dipperScale,
      isHero: true, dipperIdx: 0,
    })
  }

  // 인덱스 1~6 = 다른 유저 대표 별
  otherUsers.forEach((n, i) => {
    const off = DIPPER[i + 1]
    placed.push({
      node: n,
      x: dipperCX + off.dx * dipperScale,
      y: dipperCY + off.dy * dipperScale,
      isHero: false, dipperIdx: i + 1,
    })
  })

  // ── 물고기자리 배치 (내 스킬) ──
  // 중심점: 화면 오른쪽 60% 지점
  const piscesCenter = {
    x: placed[0]?.x ?? cx,
    y: placed[0]?.y ?? cy,
  }
  const piscesScale = Math.min(W, H) * 0.30

  const mySkills = graphData.nodes
    .filter(n => n.isCurrentUser)
    .slice(0, 10)

  mySkills.forEach((n, i) => {
    const off = PISCES[i % PISCES.length]
    placed.push({
      node: n,
      x: piscesCenter.x + off.dx * piscesScale,
      y: piscesCenter.y + off.dy * piscesScale,
      isHero: false, dipperIdx: -1,
    })
  })

  return placed
}

export default function SocialGalaxyGraph({ graphData, currentUser, selectedNode, onNodeClick }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const placedRef  = useRef<PlacedNode[]>([])
  const rafRef     = useRef<number>(0)
  const tRef       = useRef(0)

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const hit = placedRef.current.find(p => {
      const r = (p.isHero ? 18 : nodeRadius(p.node.proficiency, p.node.type)) + 8
      return Math.hypot(p.x - mx, p.y - my) < r
    })
    onNodeClick(hit?.node ?? null)
  }, [onNodeClick])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      placedRef.current = buildLayout(graphData, currentUser, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      tRef.current += 0.012
      const t      = tRef.current
      const W      = canvas.width
      const H      = canvas.height
      const placed = placedRef.current

      ctx.fillStyle = '#03030a'
      ctx.fillRect(0, 0, W, H)

      // ── 북두칠성 연결선 ──
      const dipperNodes = placed.filter(p => p.dipperIdx >= 0).sort((a,b) => a.dipperIdx - b.dipperIdx)
      DIPPER_LINES.forEach(([a, b]) => {
        const na = dipperNodes[a]; const nb = dipperNodes[b]
        if (!na || !nb) return
        ctx.save()
        ctx.globalAlpha = 0.18
        ctx.strokeStyle = '#7db8f7'
        ctx.lineWidth   = 0.9
        ctx.setLineDash([4, 6])
        ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke()
        ctx.restore()
      })

      // ── 물고기자리 연결선 (내 스킬) ──
      const piscesNodes = placed.filter(p => p.dipperIdx === -1)
      PISCES_LINES.forEach(([a, b]) => {
        const na = piscesNodes[a]; const nb = piscesNodes[b]
        if (!na || !nb) return
        ctx.save()
        ctx.globalAlpha = 0.20
        ctx.strokeStyle = '#a0c4ff'
        ctx.lineWidth   = 0.8
        ctx.setLineDash([3, 5])
        ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke()
        ctx.restore()
      })

      // 물고기자리 → 내 대표 별 연결
      const heroNode = dipperNodes[0]
      if (heroNode && piscesNodes[0]) {
        ctx.save()
        ctx.globalAlpha = 0.12
        ctx.strokeStyle = currentUser.avatarColor
        ctx.lineWidth   = 0.8; ctx.setLineDash([2, 8])
        ctx.beginPath(); ctx.moveTo(heroNode.x, heroNode.y); ctx.lineTo(piscesNodes[0].x, piscesNodes[0].y); ctx.stroke()
        ctx.restore()
      }

      // ── 노드 렌더링 ──
      placed.forEach(p => {
        const n          = p.node
        const isSelected = selectedNode?.id === n.id
        const pulse      = Math.sin(t * 1.1 + p.x * 0.01) * 0.08

        if (p.isHero) {
          // 내 대표 별 — 북두칠성에서 가장 크고 밝음
          const r = 14 + pulse * 3

          // 헤일로 3겹
          for (let i = 3; i >= 1; i--) {
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r*2.5*i)
            g.addColorStop(0, currentUser.avatarColor + '40')
            g.addColorStop(1, 'transparent')
            ctx.save(); ctx.beginPath(); ctx.arc(p.x, p.y, r*2.5*i, 0, Math.PI*2)
            ctx.fillStyle = g; ctx.fill(); ctx.restore()
          }
          // 별 본체
          ctx.save()
          ctx.shadowBlur = 28; ctx.shadowColor = currentUser.avatarColor
          drawStar(ctx, p.x, p.y, r, currentUser.avatarColor, true)
          ctx.restore()
          // 이름
          ctx.save()
          ctx.font = 'bold 11px "Exo 2", sans-serif'
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'
          ctx.fillText(currentUser.name, p.x, p.y + r + 16)
          ctx.restore()

        } else if (p.dipperIdx > 0) {
          // 다른 유저 대표 별
          const color = n.userAvatarColor ?? '#888'
          const r     = 7 + pulse * 1.5
          ctx.save(); ctx.shadowBlur = 14; ctx.shadowColor = color
          drawStar(ctx, p.x, p.y, r, color + 'cc', isSelected)
          ctx.restore()
          // 유저명
          ctx.save()
          ctx.globalAlpha = 0.7
          ctx.font = '9px "Exo 2", sans-serif'
          ctx.fillStyle = color; ctx.textAlign = 'center'
          ctx.fillText(`@${n.userHandle}`, p.x, p.y + r + 13)
          ctx.restore()

        } else {
          // 내 스킬 별 (물고기자리)
          const r     = nodeRadius(n.proficiency, n.type)
          const color = skillColor(n.proficiency, n.category)

          if (n.type === 'blackhole') {
            drawBlackhole(ctx, p.x, p.y, r)
          } else {
            ctx.save()
            ctx.shadowBlur = isSelected ? 18 : 8
            ctx.shadowColor = color
            drawStar(ctx, p.x, p.y, r, color + (n.proficiency >= 80 ? 'ff' : 'bb'), isSelected)
            ctx.restore()
          }

          if (isSelected) {
            ctx.beginPath(); ctx.arc(p.x, p.y, r+6, 0, Math.PI*2)
            ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.2; ctx.stroke()
          }

          ctx.font = '9px "Exo 2", sans-serif'
          ctx.textAlign = 'center'
          ctx.fillStyle = n.type === 'blackhole' ? 'rgba(196,79,247,0.8)' : 'rgba(180,195,225,0.75)'
          ctx.fillText(n.label, p.x, p.y + r + 13)
        }
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize) }
  }, [graphData, currentUser, selectedNode])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 cursor-pointer"
      onClick={handleClick}
    />
  )
}
