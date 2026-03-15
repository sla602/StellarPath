import { useState } from 'react'
import type { AuthMode, User, SkillInput, SkillCategory } from '../types'
import { buildUserFromInputs } from '../services/auth'
import { getConstellationByBirthday } from '../assets/constellations'
import {
  getSuggestedSkillsForTargetRole,
  type SuggestedSkill,
} from '../services/gemini'

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: '#4F8EF7', Backend: '#F7A24F', DevOps: '#4FF7A2',
  'AI/ML': '#a78bfa', Data: '#F74F4F', Mobile: '#F7E94F', Other: '#94a3b8',
}
function skillPillColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#94a3b8'
}

type Level = 'none' | 'learning' | 'master'

const LEVEL_META: Record<
  Level,
  { label: string; color: string; bg: string; border: string; proficiency: number }
> = {
  none: {
    label: 'Not Learned',
    color: '#FFFFFF',
    bg: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.24)',
    proficiency: 0,
  },
  learning: {
    label: 'Learning',
    color: '#F7C94F',
    bg: 'rgba(247,201,79,0.12)',
    border: 'rgba(247,201,79,0.4)',
    proficiency: 1,
  },
  master: {
    label: 'Proficient',
    color: '#C44FF7',
    bg: 'rgba(196,79,247,0.12)',
    border: 'rgba(196,79,247,0.4)',
    proficiency: 2,
  },
}

const LEVELS: Level[] = ['none', 'learning', 'master']

interface SelectedSkill extends SkillInput {
  level: Level
}

function SkillCard({
  skill,
  onLevelChange,
  onRemove,
}: {
  skill: SelectedSkill
  onLevelChange: (level: Level) => void
  onRemove: () => void
}) {
  const meta = LEVEL_META[skill.level]

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200"
      style={{ backgroundColor: meta.bg, borderColor: meta.border }}
    >
      <span className="text-sm text-white flex-1 font-medium">{skill.label}</span>

      <div className="flex gap-1 shrink-0">
        {LEVELS.map((lv) => {
          const lm = LEVEL_META[lv]
          const active = skill.level === lv

          return (
            <button
              key={lv}
              type="button"
              onClick={() => onLevelChange(lv)}
              className="px-2 py-0.5 rounded-md text-xs font-bold transition-all duration-150"
              style={{
                backgroundColor: active ? lm.bg : 'transparent',
                border: `1px solid ${active ? lm.color : 'rgba(255,255,255,0.07)'}`,
                color: active ? lm.color : 'rgba(255,255,255,0.25)',
              }}
            >
              {lm.label}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="text-slate-700 hover:text-red-400 transition-colors text-base leading-none ml-1"
      >
        ×
      </button>
    </div>
  )
}

interface Props {
  mode: AuthMode
  onSuccess: (user: User) => void
  onClose: () => void
  onModeSwitch: (mode: AuthMode) => void
}

export default function AuthModal({
  mode,
  onSuccess,
  onClose,
  onModeSwitch,
}: Props) {
  const [step, setStep] = useState<'info' | 'skills' | 'done'>('info')
  const [loading, setLoading] = useState(false)
  const [generatingSkills, setGeneratingSkills] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthday, setBirthday] = useState('')

  // Step 2
  const [targetRole, setTargetRole] = useState('')
  const [suggestedSkills, setSuggestedSkills] = useState<SuggestedSkill[]>([])
  const [skills, setSkills] = useState<SelectedSkill[]>([])

  const isLogin = mode === 'login'

  const addSuggestedSkill = (s: { label: string; category: SkillCategory }) => {
    const exists = skills.find((sk) => sk.label === s.label)
    if (exists) return

    setSkills((prev) => [
      ...prev,
      {
        label: s.label,
        category: s.category,
        proficiency: LEVEL_META.learning.proficiency,
        level: 'learning',
      },
    ])
  }

  const changeLevel = (label: string, level: Level) => {
    setSkills((prev) =>
      prev.map((sk) =>
        sk.label === label
          ? { ...sk, level, proficiency: LEVEL_META[level].proficiency }
          : sk
      )
    )
  }

  const handleStep1 = () => {
    setError(null)

    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 4) {
      setError('Please enter a password of at least 4 characters.')
      return
    }

    if (!isLogin && name.trim().length < 2) {
      setError('Please enter a name of at least 2 characters.')
      return
    }

    setStep('skills')
  }

  const handleGenerateSkills = async () => {
    setError(null)

    if (!targetRole.trim()) {
      setError('Please enter a target role first.')
      return
    }

    setGeneratingSkills(true)

    try {
      const result = await getSuggestedSkillsForTargetRole(targetRole, [])
      setSuggestedSkills(result)
      setSkills([])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate skills.')
    } finally {
      setGeneratingSkills(false)
    }
  }

  const handleStep2 = async () => {
    const validSkills: SkillInput[] = skills
      .filter((s) => s.level !== 'none')
      .map((s) => ({
        label: s.label,
        category: s.category,
        proficiency: s.proficiency,
      }))

    if (!targetRole.trim()) {
      setError('Please enter your target role.')
      return
    }

    if (suggestedSkills.length === 0) {
      setError('Please generate skills first.')
      return
    }

    if (validSkills.length === 0) {
      setError('Please select at least 1 skill.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      await new Promise((r) => setTimeout(r, 500))

      const user = buildUserFromInputs(
        isLogin ? 'Explorer' : name,
        email,
        targetRole,
        validSkills,
        birthday || undefined
      )

      if (isLogin) {
        onSuccess(user)
      } else {
        setStep('done')
        setTimeout(() => onSuccess(user), 1400)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const selectedLabels = new Set(skills.map((s) => s.label))
  const hasGeneratedSkills = suggestedSkills.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

      <div
        className="relative glass-panel w-full max-w-md p-8 animate-scale-in"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-600 hover:text-white text-xl transition-colors"
        >
          ×
        </button>

        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="text-5xl animate-bounce-once">✦</div>
            <h2 className="font-display font-bold text-2xl text-white text-center">
              Sign Up Successful!
            </h2>
            <p className="text-slate-400 text-sm text-center">
              You are ready to enter StellarPath.
            </p>
            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {step === 'info' && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="text-2xl mb-2">✦</div>
              <h2 className="font-display font-bold text-xl text-white">
                {isLogin ? "You're back!" : 'Join StellarPath'}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                {isLogin
                  ? 'Your constellation is waiting for you.'
                  : 'Create your constellation and explore your future.'}
              </p>
            </div>

            <div className="space-y-3">
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStep1()}
                className="input-field"
              />

              {!isLogin && (
                <div>
                  <label className="label">
                    Birthday <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="input-field"
                    style={{ colorScheme: 'dark' }}
                  />
                  {birthday &&
                    (() => {
                      const [, m, d] = birthday.split('-').map(Number)
                      const c = getConstellationByBirthday(m, d)
                      return (
                        <p className="text-xs mt-1.5 text-blue-400/70">
                          {c.symbol} {c.name} — Your skills will shine through the {c.name}{' '}
                          constellation.
                        </p>
                      )
                    })()}
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <button type="button" onClick={handleStep1} className="btn-primary w-full py-3.5 text-sm">
              Next →
            </button>

            <p className="text-center text-xs text-slate-600">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  onModeSwitch(isLogin ? 'signup' : 'login')
                  setStep('info')
                  setError(null)
                }}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        )}

        {step === 'skills' && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="font-display font-bold text-xl text-white">
                Generate Role-Based Skills
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Enter your target role and let Gemini generate relevant skill suggestions.
              </p>
            </div>

            <div>
              <label className="label">Target Role</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Frontend Engineer, ML Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={handleGenerateSkills}
                  disabled={generatingSkills || !targetRole.trim()}
                  className={`btn-primary px-4 py-3 text-sm whitespace-nowrap ${
                    generatingSkills || !targetRole.trim()
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {generatingSkills ? 'Generating...' : 'Generate Skills'}
                </button>
              </div>
            </div>

            {!hasGeneratedSkills && (
              <div className="rounded-xl border border-white/8 px-4 py-5 text-sm text-slate-500">
                Gemini skill suggestions will appear here after you click{' '}
                <span className="text-slate-300">Generate Skills</span>.
              </div>
            )}

            {hasGeneratedSkills && (
              <>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((lv) => (
                    <div key={lv} className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: LEVEL_META[lv].color }}
                      />
                      <span className="text-xs" style={{ color: LEVEL_META[lv].color }}>
                        {LEVEL_META[lv].label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Category color legend */}
                <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Category Colors</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                      <div key={cat} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-xs" style={{ color: color }}>{cat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Gemini Skill Suggestions</label>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedSkills.map((s) => {
                      const added = selectedLabels.has(s.label)

                      return (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => addSuggestedSkill(s)}
                          disabled={added}
                          title={s.reason}
                          className="px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 border"
                          style={{
                            borderColor: added ? skillPillColor(s.category) : 'rgba(255,255,255,0.08)',
                            backgroundColor: added ? skillPillColor(s.category) + '22' : 'transparent',
                            color: added ? skillPillColor(s.category) : '#94a3b8',
                            cursor: added ? 'default' : 'pointer',
                          }}
                        >
                          {added ? '✓ ' : '+ '}
                          {s.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {skills.length > 0 && (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {skills.map((s, i) => (
                      <SkillCard
                        key={s.label}
                        skill={s}
                        onLevelChange={(lv) => changeLevel(s.label, lv)}
                        onRemove={() => setSkills((prev) => prev.filter((_, j) => j !== i))}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('info')
                  setError(null)
                }}
                className="btn-ghost flex-1 py-3 text-sm"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleStep2}
                disabled={loading || !hasGeneratedSkills}
                className={`btn-primary flex-1 py-3 text-sm ${
                  loading || !hasGeneratedSkills ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading
                  ? 'Processing...'
                  : isLogin
                  ? '🌌 Enter My Constellation'
                  : '✦ Complete Constellation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}