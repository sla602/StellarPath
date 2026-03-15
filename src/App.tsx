import { useState, useCallback } from 'react'
import type { AppStep, AuthMode, User, SocialNode } from './types'
import LandingScreen from './components/LandingScreen'
import AuthModal     from './components/AuthModal'
import BurstScreen   from './components/BurstScreen'
import GalaxyScreen  from './components/GalaxyScreen'

const LOADING_MESSAGES = [
  '✦ Passing through the wormhole...',
  '✦ Creating constellation structure...',
  '✦ Detecting black holes...',
  '✦ Preparing star map...',
]

export default function App() {
  const [step,         setStep]         = useState<AppStep>('landing')
  const [authMode,     setAuthMode]     = useState<AuthMode>('signup')
  const [showAuth,     setShowAuth]     = useState(false)
  const [currentUser,  setCurrentUser]  = useState<User | null>(null)
  const [selectedNode, setSelectedNode] = useState<SocialNode | null>(null)

  const handleAuthOpen = useCallback((mode: AuthMode) => {
    setAuthMode(mode); setShowAuth(true)
  }, [])

  const handleAuthSuccess = useCallback((user: User) => {
    setCurrentUser(user)
    setShowAuth(false)
    setStep('burst')
  }, [])

  const handleBurstComplete = useCallback(() => setStep('galaxy'), [])

  const handleLogout = useCallback(() => {
    setCurrentUser(null); setSelectedNode(null); setStep('landing')
  }, [])

  return (
    <>
      <div className="stars-bg" />

      {step === 'landing' && (
        <LandingScreen onAuthOpen={handleAuthOpen} />
      )}

      {showAuth && (
        <AuthModal
          mode={authMode}
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuth(false)}
          onModeSwitch={setAuthMode}
        />
      )}

      {step === 'burst' && currentUser && (
        <BurstScreen user={currentUser} onComplete={handleBurstComplete} />
      )}

      {step === 'galaxy' && currentUser && (
        <GalaxyScreen
          user={currentUser}
          selectedNode={selectedNode}
          onNodeClick={setSelectedNode}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}