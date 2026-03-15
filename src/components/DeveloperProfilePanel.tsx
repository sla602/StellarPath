import { useState } from 'react'
import type { User } from '../types'
import { getDeveloperProfile, type DeveloperProfile } from '../services/gemini'

interface Props {
  user: User
  onClose: () => void
}

export default function DeveloperProfilePanel({ user, onClose }: Props) {
  const [profile,  setProfile]  = useState<DeveloperProfile | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [generated, setGenerated] = useState(false)

  const generate = async () => {
    setLoading(true); setError(null)
    try {
      const skills = user.skills.filter(s => s.type !== 'blackhole').map(s => s.label)
      const result = await getDeveloperProfile(
        skills, user.targetRole, user.constellationName ?? 'Pisces', user.birthday
      )
      setProfile(result)
      setGenerated(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel w-80 flex flex-col animate-slide-in" style={{ maxHeight: '80vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-sm">✦</span>
          <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">Stellar Identity</span>
        </div>
        <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors text-lg">×</button>
      </div>

      <div className="overflow-y-auto flex-1 p-4 space-y-4">
        {!generated && !loading && (
          <div className="text-center space-y-4 py-4">
            <div className="text-4xl">
              {user.constellationName === 'Pisces' ? '♓' :
               user.constellationName === 'Aries' ? '♈' :
               user.constellationName === 'Taurus' ? '♉' :
               user.constellationName === 'Gemini' ? '♊' :
               user.constellationName === 'Cancer' ? '♋' :
               user.constellationName === 'Leo' ? '♌' :
               user.constellationName === 'Virgo' ? '♍' :
               user.constellationName === 'Libra' ? '♎' :
               user.constellationName === 'Scorpius' ? '♏' :
               user.constellationName === 'Sagittarius' ? '♐' :
               user.constellationName === 'Capricorn' ? '♑' :
               user.constellationName === 'Aquarius' ? '♒' : '✦'}
            </div>
            <div>
              <p className="text-white text-sm font-bold">{user.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{user.constellationName ?? 'Pisces'} · {user.targetRole}</p>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Let Gemini analyze your skills and constellation to reveal your developer archetype.
            </p>
            <button onClick={generate}
              className="w-full py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, rgba(196,79,247,0.2), rgba(79,142,247,0.2))',
                border: '1px solid rgba(196,79,247,0.4)',
                color: '#d4a0ff',
              }}>
              ✦ Reveal My Stellar Identity
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="relative w-12 h-12">
              {[0,1,2].map(i => (
                <div key={i} className="absolute inset-0 rounded-full border border-purple-400 pulse-ring"
                     style={{ animationDelay: `${i * 0.5}s` }} />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
              </div>
            </div>
            <p className="text-slate-400 text-xs font-mono text-center">
              Gemini is reading<br />your constellation...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center space-y-3 py-4">
            <p className="text-red-400 text-xs">{error}</p>
            <button onClick={generate}
              className="px-4 py-2 rounded-lg text-xs border border-slate-700 text-slate-400 hover:text-white transition-colors">
              Try Again
            </button>
          </div>
        )}

        {profile && !loading && (
          <div className="space-y-4">
            {/* Title */}
            <div className="text-center space-y-1 pb-2 border-b border-slate-800">
              <p className="text-xs text-purple-400/70 font-mono uppercase tracking-widest">Your Developer Archetype</p>
              <h3 className="text-white font-display font-bold text-lg leading-tight">{profile.title}</h3>
            </div>

            {/* Summary */}
            <div className="rounded-xl px-3 py-3"
                 style={{ background: 'rgba(196,79,247,0.06)', border: '1px solid rgba(196,79,247,0.15)' }}>
              <p className="text-xs text-slate-300 leading-relaxed">{profile.summary}</p>
            </div>

            {/* Strengths */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Core Strengths</p>
              {profile.strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-purple-400 text-xs">◆</span>
                  <span className="text-xs text-slate-200">{s}</span>
                </div>
              ))}
            </div>

            {/* Next step */}
            <div className="rounded-xl px-3 py-3"
                 style={{ background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.15)' }}>
              <p className="text-xs text-blue-400/70 font-mono uppercase tracking-wider mb-1">Next Step</p>
              <p className="text-xs text-slate-300 leading-relaxed">{profile.suggestedPath}</p>
            </div>

            {/* Constellation theme */}
            <div className="rounded-xl px-3 py-3"
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs text-slate-400/70 font-mono uppercase tracking-wider mb-1">
                {user.constellationName ?? 'Pisces'} Resonance
              </p>
              <p className="text-xs text-slate-400 leading-relaxed italic">{profile.constellationTheme}</p>
            </div>

            {/* Regenerate */}
            <button onClick={generate}
              className="w-full py-2 rounded-lg text-xs text-slate-600 hover:text-slate-400 transition-colors border border-slate-800 hover:border-slate-700">
              ↻ Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}