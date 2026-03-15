import { useEffect, useRef, useCallback } from 'react'
import type { User, SocialNode } from '../types'
import { CONSTELLATIONS, getConstellationByBirthday } from '../assets/constellations'

function skillColor(proficiency: number): string {
  if (proficiency === 0) return '#FFFFFF'
  if (proficiency === 1) return '#F7C94F'
  return '#C44FF7'
}

function nodeRadius(proficiency: number): number {
  if (proficiency >= 2) return 14
  if (proficiency >= 1) return 11
  return 8
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, glow = false) {
  if (glow) { ctx.save(); ctx.shadowBlur = r * 4; ctx.shadowColor = color }
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2
    const rad = i % 2 === 0 ? r : r * 0.42
    if (i === 0) ctx.moveTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad)
    else         ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad)
  }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill()
  if (glow) ctx.restore()
}

function pickStarIndices(totalStars: number, skillCount: number): number[] {
  if (skillCount <= 0 || totalStars <= 0) return []
  if (skillCount >= totalStars) return Array.from({ length: totalStars }, (_, i) => i)
  const last = totalStars - 1
  const raw  = Array.from({ length: skillCount }, (_, i) =>
    Math.round((i / Math.max(skillCount - 1, 1)) * last)
  )
  const deduped: number[] = []
  raw.forEach(idx => {
    let next = idx
    while (deduped.includes(next) && next < totalStars - 1) next++
    while (deduped.includes(next) && next > 0) next--
    if (!deduped.includes(next)) deduped.push(next)
  })
  return deduped.sort((a, b) => a - b)
}

interface PlacedSkill { node: SocialNode; x: number; y: number; starIndex: number }

interface Props {
  user: User
  nodes: SocialNode[]
  selectedNode: SocialNode | null
  onNodeClick: (n: SocialNode | null) => void
}

export default function MyConstellationCanvas({ user, nodes, selectedNode, onNodeClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const placedRef = useRef<PlacedSkill[]>([])
  const rafRef    = useRef<number>(0)
  const tRef      = useRef(0)

  const constDef = (() => {
    if (user.birthday) {
      const [, m, d] = user.birthday.split('-').map(Number)
      return getConstellationByBirthday(m, d)
    }
    return CONSTELLATIONS.find(c => c.name === (user.constellationName ?? 'Pisces')) ?? CONSTELLATIONS[2]
  })()

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left, my = e.clientY - rect.top
    const hit = placedRef.current.find(p => Math.hypot(p.x - mx, p.y - my) < nodeRadius(p.node.proficiency) + 10)
    onNodeClick(hit?.node ?? null)
  }, [onNodeClick])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return

    const layout = () => {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight
      const cx = canvas.width / 2, cy = canvas.height / 2
      const spread = Math.min(canvas.width, canvas.height) * 0.72
      const mySkills    = nodes.filter(n => n.type !== 'blackhole')
      const starIndices  = pickStarIndices(constDef.stars.length, mySkills.length)
      placedRef.current  = mySkills.slice(0, constDef.stars.length).map((n, i) => {
        const starIndex = starIndices[i] ?? i
        const s = constDef.stars[starIndex] ?? constDef.stars[i] ?? { dx: 0, dy: 0 }
        return { node: n, starIndex, x: cx + s.dx * spread, y: cy + s.dy * spread }
      })
    }
    layout()
    window.addEventListener('resize', layout)

    const tick = () => {
      tRef.current += 0.012
      const t = tRef.current
      const W = canvas.width, H = canvas.height
      const cx = W / 2, cy = H / 2
      const spread = Math.min(W, H) * 0.72

      ctx.fillStyle = '#03030a'; ctx.fillRect(0, 0, W, H)

      // Constellation name
      ctx.save()
      // Constellation name — clear and prominent
      ctx.font = `bold 20px "Exo 2", sans-serif`
      ctx.fillStyle = 'rgba(230,200,255,0.92)'
      ctx.textAlign = 'center'
      ctx.shadowBlur = 16; ctx.shadowColor = 'rgba(180,100,255,0.6)'
      ctx.fillText(`${constDef.symbol}  ${constDef.name}`, W / 2, H * 0.12)
      ctx.shadowBlur = 0
      ctx.restore()

      const projected = constDef.stars.map(s => ({ x: cx + s.dx * spread, y: cy + s.dy * spread }))

      // ── GHOST OUTLINE (full constellation) ──
      // Ghost lines — bright, clearly visible
      constDef.lines.forEach(([a, b]) => {
        const sa = projected[a], sb = projected[b]; if (!sa || !sb) return
        ctx.save()
        ctx.globalAlpha = 0.4
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 1.0
        ctx.setLineDash([4, 6])
        ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sb.x, sb.y); ctx.stroke()
        ctx.restore()
      })

      // Ghost star dots — hollow circles for empty positions
      projected.forEach((s, i) => {
        const hasSkill = placedRef.current.some(p => p.starIndex === i)
        ctx.save()
        ctx.globalAlpha = hasSkill ? 0.0 : 0.30
        ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1; ctx.stroke()
        ctx.restore()
      })

      // ── ACTIVE LINES (skill-to-skill) ──
      const placedByIndex = new Map(placedRef.current.map(p => [p.starIndex, p] as const))
      constDef.lines.forEach(([a, b]) => {
        const pa = placedByIndex.get(a), pb = placedByIndex.get(b); if (!pa || !pb) return
        const lineAlpha = 0.7 + Math.sin(t * 1.5 + a) * 0.2
        ctx.save()
        ctx.globalAlpha = lineAlpha
        ctx.strokeStyle = 'rgba(200,160,255,0.9)'
        ctx.lineWidth = 1.1
        ctx.setLineDash([4, 5])
        ctx.shadowBlur = 6; ctx.shadowColor = '#7090ff'
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke()
        ctx.restore()
      })

      // ── SKILL STARS ──
      placedRef.current.forEach(p => {
        const n = p.node
        const r = nodeRadius(n.proficiency)
        const color = skillColor(n.proficiency)
        const isSelected = selectedNode?.id === n.id
        const pulse = Math.sin(t * 0.85 + p.x * 0.01) * 0.07

        // Glow halo
        ctx.save()
        ctx.globalAlpha = 0.28 + pulse
        ctx.shadowBlur = 18; ctx.shadowColor = color
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2)
        ctx.fillStyle = color + '22'; ctx.fill()
        ctx.restore()

        // Star shape
        ctx.save()
        ctx.shadowBlur = isSelected ? 24 : 10; ctx.shadowColor = color
        drawStar(ctx, p.x, p.y, r + pulse * 1.5, color + (n.proficiency >= 2 ? 'ff' : 'cc'), isSelected)
        ctx.restore()

        // Selection ring
        if (isSelected) {
          ctx.beginPath(); ctx.arc(p.x, p.y, r + 8, 0, Math.PI * 2)
          ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3.0; ctx.stroke()
        }

        // Label
        ctx.font = 'bold 14px "Exo 2", sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'top'
        ctx.fillStyle = color + 'cc'
        ctx.fillText(n.label, p.x, p.y + r + 6)
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', layout) }
  }, [nodes, selectedNode, constDef])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 cursor-pointer" onClick={handleClick} />
  )
}