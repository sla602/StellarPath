import { useState, useCallback } from 'react'
import type { User, SocialNode } from '../types'
import { buildSocialGraphData, MOCK_OTHER_USERS } from '../assets/mockUsers'
import { getNetworkRecommendations, type RecommendedConnection } from '../services/gemini'
import MyConstellationCanvas from './MyConstellationCanvas'
import NetworkCanvas from './NetworkCanvas'
import GalaxyTopBar from './GalaxyTopBar'
import NodeDetailPanel from './NodeDetailPanel'
import SkillEditPanel from './SkillEditPanel'
import DeveloperProfilePanel from './DeveloperProfilePanel'

type Tab    = 'my' | 'network'
type Panel  = null | 'edit' | 'profile'

interface Props {
  user: User
  selectedNode: SocialNode | null
  onNodeClick: (node: SocialNode | null) => void
  onLogout: () => void
}

export default function GalaxyScreen({ user: initialUser, selectedNode, onNodeClick, onLogout }: Props) {
  const [activeTab,   setActiveTab]   = useState<Tab>('my')
  const [connections, setConnections] = useState<RecommendedConnection[]>([])
  const [netLoading,  setNetLoading]  = useState(false)
  const [netFetched,  setNetFetched]  = useState(false)
  const [activePanel, setActivePanel] = useState<Panel>(null)
  const [user,        setUser]        = useState<User>(initialUser)

  const { nodes } = buildSocialGraphData(user, MOCK_OTHER_USERS)
  const myNodes   = nodes.filter(n => n.isCurrentUser)

  const fetchRecommendations = useCallback(async () => {
    if (netFetched) return
    setNetLoading(true)
    try {
      const skillLabels = user.skills.filter(s => s.type !== 'blackhole').map(s => s.label)
      const recs = await getNetworkRecommendations(skillLabels, user.targetRole)
      setConnections(recs)
    } finally {
      setNetLoading(false)
      setNetFetched(true)
    }
  }, [user, netFetched])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    onNodeClick(null)
    setActivePanel(null)
    if (tab === 'network') fetchRecommendations()
  }

  const togglePanel = (panel: Panel) => {
    setActivePanel(prev => prev === panel ? null : panel)
    onNodeClick(null)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#03030a' }}>

      {activeTab === 'my' ? (
        <MyConstellationCanvas user={user} nodes={myNodes} selectedNode={selectedNode} onNodeClick={onNodeClick} />
      ) : (
        <NetworkCanvas currentUser={user} connections={connections} isLoading={netLoading} />
      )}

      <div className="absolute inset-0 pointer-events-none">

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 pointer-events-auto">
          <GalaxyTopBar user={user} activeTab={activeTab} onTabChange={handleTabChange} onLogout={onLogout} />
        </div>

        {/* My constellation — right action buttons + panels */}
        {activeTab === 'my' && (
          <div className="absolute right-4 top-24 flex flex-col gap-3 pointer-events-auto items-end">

            {/* Action buttons */}
            <div className="flex gap-2">
              {/* Stellar Identity button */}
              <button
                onClick={() => togglePanel('profile')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background:     activePanel === 'profile' ? 'rgba(196,79,247,0.2)' : 'rgba(10,10,26,0.8)',
                  border:         `1px solid ${activePanel === 'profile' ? 'rgba(196,79,247,0.5)' : 'rgba(196,79,247,0.15)'}`,
                  color:          activePanel === 'profile' ? '#d4a0ff' : 'rgba(180,150,220,0.6)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                ♾ Identity
              </button>

              {/* Edit Skills button */}
              <button
                onClick={() => togglePanel('edit')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background:     activePanel === 'edit' ? 'rgba(160,100,240,0.2)' : 'rgba(10,10,26,0.8)',
                  border:         `1px solid ${activePanel === 'edit' ? 'rgba(160,100,240,0.5)' : 'rgba(160,100,240,0.15)'}`,
                  color:          activePanel === 'edit' ? '#d8b4fe' : 'rgba(200,170,240,0.6)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                ✦ Edit Skills
              </button>
            </div>

            {/* Active panel */}
            {activePanel === 'edit' && (
              <SkillEditPanel
                user={user}
                onUpdate={setUser}
                onClose={() => setActivePanel(null)}
              />
            )}

            {activePanel === 'profile' && (
              <DeveloperProfilePanel
                user={user}
                onClose={() => setActivePanel(null)}
              />
            )}

            {/* Node detail (when no panel open) */}
            {activePanel === null && selectedNode && (
              <NodeDetailPanel node={selectedNode} onClose={() => onNodeClick(null)} />
            )}
          </div>
        )}

        {/* Network — node detail */}
        {activeTab === 'network' && selectedNode && (
          <div className="absolute right-4 top-24 pointer-events-auto">
            <NodeDetailPanel node={selectedNode} onClose={() => onNodeClick(null)} />
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
          {activeTab === 'my' ? (
            <div className="glass-panel flex items-center gap-4 px-5 py-2.5">
              {[
                { color: '#C44FF7', label: 'Proficient' },
                { color: '#F7C94F', label: 'Learning' },
                { color: '#FFFFFF', label: 'Not Learned' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
              ))}
              <span className="text-slate-600 text-xs">· {user.constellationName ?? 'Pisces'}</span>
            </div>
          ) : (
            <div className="glass-panel flex items-center gap-4 px-5 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-white opacity-90" />
                <span className="text-xs text-slate-400">You (Alkaid)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#e8f0ff' }} />
                <span className="text-xs text-slate-400">Recommendation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#C44FF7' }} />
                <span className="text-xs text-slate-400">Connected</span>
              </div>
              <span className="text-slate-600 text-xs">· click to connect</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}