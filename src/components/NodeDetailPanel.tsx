import type { SocialNode } from '../types'

interface Props {
  node: SocialNode
  onClose: () => void
}

export default function NodeDetailPanel({ node, onClose }: Props) {
  const isBlackhole = node.type === 'blackhole'
  const isCurrentUser = node.isCurrentUser

  const levelLabel =
    node.proficiency === 2
      ? 'Proficient'
      : node.proficiency === 1
      ? 'Learning'
      : 'Not Learned'

  return (
    <div className="glass-panel w-72 p-5 space-y-4 animate-slide-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-white">{node.label}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs ${isBlackhole ? 'text-purple-400' : 'text-slate-400'}`}>
              {node.category}
            </span>
            <span className="text-slate-700 text-xs">·</span>
            <span className={`text-xs ${isCurrentUser ? 'text-blue-400' : 'text-slate-500'}`}>
              {isCurrentUser ? 'My Constellation' : `@${node.userHandle}`}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white text-xl leading-none transition-colors"
        >
          ×
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{node.description}</p>

      {!isBlackhole && (
        <div className="text-xs text-slate-400">
          Level: <span className="text-white">{levelLabel}</span>
        </div>
      )}

      {node.projects.length > 0 && (
        <div>
          <span className="text-xs text-slate-500 uppercase tracking-wider">Related Projects</span>
          <ul className="mt-1.5 space-y-1">
            {node.projects.map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-blue-400">◆</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isBlackhole && (
        <div className="border-t border-slate-800 pt-3">
          <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg px-3 py-2.5">
            <p className="text-xs text-purple-300 leading-relaxed">
              🌑 This is still an unexplored area.
              <br />
              It may be an important skill for your target role.
            </p>
          </div>
        </div>
      )}

      {!isCurrentUser && (
        <div className="border-t border-slate-800 pt-3 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{
              backgroundColor: (node.userAvatarColor ?? '#888') + '33',
              border: `1.5px solid ${node.userAvatarColor ?? '#888'}`,
            }}
          >
            {node.userName[0]}
          </div>

          <div>
            <p className="text-xs text-white font-medium">{node.userName}</p>
            <p className="text-xs text-slate-500">@{node.userHandle}</p>
          </div>
        </div>
      )}
    </div>
  )
}