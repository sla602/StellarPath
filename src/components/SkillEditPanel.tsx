import { useState } from 'react'
import type { User, SkillNode, SkillCategory } from '../types'
import { getSuggestedSkillsForTargetRole, type SuggestedSkill } from '../services/gemini'

type Level = 'none' | 'learning' | 'master'

const LEVEL_META: Record<Level, { label: string; color: string; proficiency: number }> = {
  none:     { label: 'Not Learned', color: '#FFFFFF', proficiency: 0 },
  learning: { label: 'Learning',    color: '#F7C94F', proficiency: 1 },
  master:   { label: 'Proficient',  color: '#C44FF7', proficiency: 2 },
}
const LEVELS: Level[] = ['learning', 'master']

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: '#4F8EF7', Backend: '#F7A24F', DevOps: '#4FF7A2',
  'AI/ML':  '#a78bfa', Data:    '#F74F4F', Mobile: '#F7E94F', Other: '#94a3b8',
}

function profToLevel(p: number): Level {
  if (p === 0) return 'none'
  if (p === 1) return 'learning'
  return 'master'
}

interface Props {
  user: User
  onUpdate: (updated: User) => void
  onClose: () => void
}

export default function SkillEditPanel({ user, onUpdate, onClose }: Props) {
  const [tab,             setTab]             = useState<'list' | 'add'>('list')
  const [suggested,       setSuggested]       = useState<SuggestedSkill[]>([])
  const [generating,      setGenerating]      = useState(false)
  const [genError,        setGenError]        = useState<string | null>(null)
  const [targetRole,      setTargetRole]      = useState(user.targetRole ?? '')

  const existingLabels = new Set(user.skills.map(s => s.label))

  const handleLevelChange = (skillId: string, level: Level) => {
    const proficiency = LEVEL_META[level].proficiency
    const type = level === 'none' ? 'blackhole' : level === 'learning' ? 'learning' : 'owned'
    onUpdate({ ...user, skills: user.skills.map(s => s.id === skillId ? { ...s, proficiency, type } : s) })
  }

  const handleDelete = (skillId: string) => {
    onUpdate({ ...user, skills: user.skills.filter(s => s.id !== skillId) })
  }

  const handleAdd = (label: string, category: SkillCategory) => {
    if (existingLabels.has(label)) return
    const newSkill: SkillNode = {
      id: `me_${Date.now()}_${label.toLowerCase().replace(/\s+/g, '_')}`,
      label, category, proficiency: 1, type: 'learning',
      projects: [], description: `${label} — ${category}`, ownerId: user.id,
    }
    onUpdate({ ...user, skills: [...user.skills, newSkill] })
  }

  const handleGenerate = async () => {
    setGenError(null)
    setGenerating(true)
    try {
      const existing = user.skills.map(s => s.label)
      const result   = await getSuggestedSkillsForTargetRole(targetRole || user.targetRole, existing)
      setSuggested(result)
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Failed to generate.')
    } finally {
      setGenerating(false)
    }
  }

  const displaySkills = user.skills.filter(s => s.type !== 'blackhole')

  return (
    <div className="glass-panel w-80 flex flex-col animate-slide-in" style={{ maxHeight: '78vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex gap-1">
          {(['list', 'add'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
              style={{
                background:  tab === t ? 'rgba(160,100,240,0.18)' : 'transparent',
                color:       tab === t ? '#d8b4fe' : 'rgba(255,255,255,0.3)',
                border:      tab === t ? '1px solid rgba(160,100,240,0.35)' : '1px solid transparent',
              }}>
              {t === 'list' ? `My Skills (${displaySkills.length})` : '+ Add'}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors text-lg">×</button>
      </div>

      <div className="overflow-y-auto flex-1 p-3">

        {/* ── List tab ── */}
        {tab === 'list' && (
          <div className="space-y-1.5">
            {displaySkills.length === 0 && (
              <p className="text-slate-600 text-xs text-center py-4">Add skills to shape your constellation.</p>
            )}
            {displaySkills.map(skill => {
              const level     = profToLevel(skill.proficiency)
              const levelMeta = LEVEL_META[level]
              return (
                <div key={skill.id} className="flex items-center gap-2 px-2.5 py-2 rounded-xl border"
                     style={{
                       background:   levelMeta.color === '#FFFFFF' ? 'rgba(255,255,255,0.06)' : levelMeta.color + '10',
                       borderColor:  levelMeta.color === '#FFFFFF' ? 'rgba(255,255,255,0.18)' : levelMeta.color + '30',
                     }}>
                  <span className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[skill.category] ?? '#888' }} />
                  <span className="text-xs text-white flex-1 font-medium">{skill.label}</span>
                  <div className="flex gap-0.5">
                    {LEVELS.map(lv => {
                      const lm = LEVEL_META[lv]; const active = level === lv
                      return (
                        <button key={lv} onClick={() => handleLevelChange(skill.id, lv)}
                          className="w-5 h-5 rounded-md transition-all" title={lm.label}
                          style={{
                            backgroundColor: active ? lm.color + '33' : 'transparent',
                            border: `1px solid ${active ? lm.color : 'rgba(255,255,255,0.08)'}`,
                          }}>
                          <span className="text-xs" style={{ color: active ? lm.color : 'rgba(255,255,255,0.2)' }}>
                            {lv === 'learning' ? '▲' : '★'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <button onClick={() => handleDelete(skill.id)}
                    className="text-slate-700 hover:text-red-400 transition-colors text-sm ml-0.5">×</button>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Add tab ── */}
        {tab === 'add' && (
          <div className="space-y-3">
            {/* Role input + Generate button */}
            <div className="space-y-2">
              <label className="text-[11px] text-slate-500 uppercase tracking-wider block">Target Role</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  placeholder={user.targetRole || 'e.g. Frontend Engineer'}
                  className="input-field flex-1 text-xs py-2"
                />
                <button onClick={handleGenerate} disabled={generating}
                  className="px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0"
                  style={{
                    background:  generating ? 'rgba(160,100,240,0.1)' : 'linear-gradient(135deg, rgba(160,100,240,0.3), rgba(196,79,247,0.4))',
                    border:      '1px solid rgba(160,100,240,0.4)',
                    color:       generating ? 'rgba(200,160,255,0.4)' : '#d8b4fe',
                    cursor:      generating ? 'not-allowed' : 'pointer',
                  }}>
                  {generating ? '...' : '✦ Ask'}
                </button>
              </div>
            </div>

            {genError && <p className="text-red-400 text-xs">{genError}</p>}

            {/* Empty state */}
            {suggested.length === 0 && !generating && (
              <div className="rounded-xl px-3 py-5 text-center"
                   style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-2xl mb-2">✦</p>
                <p className="text-xs text-slate-500">Enter a role and click <span className="text-slate-300">Ask</span></p>
                <p className="text-xs text-slate-600 mt-1">Gemini will suggest skills to add.</p>
              </div>
            )}

            {/* Loading */}
            {generating && (
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="relative w-8 h-8">
                  {[0,1,2].map(i => (
                    <div key={i} className="absolute inset-0 rounded-full border border-purple-400 pulse-ring"
                         style={{ animationDelay: `${i * 0.5}s` }} />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-mono">Gemini is thinking...</p>
              </div>
            )}

            {/* Suggested pills */}
            {suggested.length > 0 && !generating && (
              <>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider">
                  Suggestions — click to add
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggested.map(s => {
                    const added     = existingLabels.has(s.label)
                    const catColor  = CATEGORY_COLORS[s.category] ?? '#94a3b8'
                    return (
                      <button key={s.label}
                        onClick={() => !added && handleAdd(s.label, s.category)}
                        className="px-2.5 py-1 rounded-full text-xs font-medium transition-all border"
                        style={{
                          borderColor:     added ? catColor : 'rgba(255,255,255,0.08)',
                          backgroundColor: added ? catColor + '22' : 'transparent',
                          color:           added ? catColor : '#94a3b8',
                          cursor:          added ? 'default' : 'pointer',
                        }}
                        title={s.reason}>
                        {added ? '✓ ' : '+ '}{s.label}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}