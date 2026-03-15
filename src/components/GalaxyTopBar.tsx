import type { User } from '../types'

type Tab = 'my' | 'network'

interface Props {
  user: User
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onLogout: () => void
}

export default function GalaxyTopBar({ user, activeTab, onTabChange, onLogout }: Props) {
  const score      = user.readinessScore
  const scoreColor = score >= 70 ? '#4FF7A2' : score >= 50 ? '#F7C94F' : '#F74F4F'

  return (
    <div className="glass-panel flex items-center justify-between px-5 py-3 gap-4">

      {/* 로고 */}
      <div className="font-display font-black text-base tracking-tight shrink-0">
        <span className="text-white">STELLAR</span>
        <span className="text-blue-400">PATH</span>
      </div>

      {/* 탭 전환 — 중앙 */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {([
          { id: 'my',      icon: '♓', label: 'My Constellation' },
          { id: 'network', icon: '✦', label: 'Network'  },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200"
            style={{
              background:   activeTab === tab.id ? 'rgba(160,100,240,0.18)' : 'transparent',
              color:        activeTab === tab.id ? '#d8b4fe'                : 'rgba(255,255,255,0.35)',
              border:       activeTab === tab.id ? '1px solid rgba(160,100,240,0.35)' : '1px solid transparent',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 오른쪽: 정보 + 유저 */}
      <div className="flex items-center gap-4 shrink-0">

        {/* 아바타 */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: user.avatarColor+'33', border:`1.5px solid ${user.avatarColor}` }}
          >
            {user.name[0]}
          </div>
          <span className="text-sm text-slate-300 hidden sm:block">{user.name}</span>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={onLogout}
          className="text-xs text-slate-500 hover:text-white border border-slate-800
                     hover:border-slate-600 rounded-lg px-3 py-1.5 transition-colors"
        >
          sign out
        </button>
      </div>
    </div>
  )
}