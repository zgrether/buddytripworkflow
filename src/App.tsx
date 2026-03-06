import { useState } from 'react'
import Dashboard from './screens/Dashboard'
import TripDetail from './screens/TripDetail'
import TripNew from './screens/TripNew'
import IdeaComparison from './screens/IdeaComparison'
import Scoreboard from './screens/Scoreboard'
import RoundBuilder from './screens/RoundBuilder'
import LiveScoreEntry from './screens/LiveScoreEntry'
import LiveLeaderboard from './screens/LiveLeaderboard'

export type Screen =
  | 'trips' | 'trip-detail' | 'trip-new' | 'idea-comparison' | 'scoreboard'
  | 'round-builder' | 'live-score' | 'live-leaderboard'

export type AppState = { screen: Screen; tripId?: string; toast?: string }

export default function App() {
  const [state, setState] = useState<AppState>({ screen: 'trips' })

  const navigate = (screen: Screen, extra?: Partial<AppState>) => {
    setState(s => ({ ...s, screen, tripId: undefined, ...extra, toast: s.toast }))
    window.scrollTo(0, 0)
  }
  const showToast = (msg: string) => {
    setState(s => ({ ...s, toast: msg }))
    setTimeout(() => setState(s => ({ ...s, toast: undefined })), 2800)
  }

  return (
    <>
      {state.screen === 'trips'            && <Dashboard navigate={navigate} />}
      {state.screen === 'trip-new'         && <TripNew navigate={navigate} showToast={showToast} />}
      {state.screen === 'trip-detail'      && <TripDetail navigate={navigate} showToast={showToast} tripId={state.tripId} />}
      {state.screen === 'idea-comparison'  && <IdeaComparison navigate={navigate} showToast={showToast} tripId={state.tripId} />}
      {state.screen === 'scoreboard'       && <Scoreboard navigate={navigate} />}
      {state.screen === 'round-builder'    && <RoundBuilder onDone={() => navigate('live-leaderboard')} />}
      {state.screen === 'live-score'       && <LiveScoreEntry onBack={() => navigate('live-leaderboard')} />}
      {state.screen === 'live-leaderboard' && <LiveLeaderboard onBack={() => navigate('trips')} onEnterScore={() => navigate('live-score')} />}

      {state.screen === 'trips' && (
        <div style={{ position: 'fixed', bottom: 80, right: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 100 }}>
          <button onClick={() => navigate('round-builder')}
            style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, color: '#e6edf3', padding: '10px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', boxShadow: '0 4px 16px #000' }}>
            ⚙️ Round Builder →
          </button>
          <button onClick={() => navigate('live-leaderboard')}
            style={{ background: '#00d4aa', border: 'none', borderRadius: 10, color: '#0d1117', padding: '10px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 4px 16px #000' }}>
            ⛳ BBMI Live Leaderboard →
          </button>
        </div>
      )}

      {state.toast && (
        <div className="fixed z-[200] left-1/2 -translate-x-1/2 bottom-20 md:bottom-6 flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-xl shadow-2xl animate-slide-up"
          style={{ background: 'var(--bt-card)', color: 'var(--bt-text-1)', border: `1px solid var(--bt-accent)50` }}>
          <span style={{ color: 'var(--bt-accent)' }}>✓</span> {state.toast}
        </div>
      )}
    </>
  )
}
