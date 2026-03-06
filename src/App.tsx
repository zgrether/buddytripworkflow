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

export type ViewerRole = 'owner' | 'planner' | 'member'

export type AppState = { screen: Screen; tripId?: string; toast?: string; viewerRole: ViewerRole }

const ROLE_USERS: Record<ViewerRole, { name: string; desc: string }> = {
  owner:   { name: 'Brad',    desc: 'Full control' },
  planner: { name: 'Grether', desc: 'Can edit' },
  member:  { name: 'Buddy',   desc: 'Read-only' },
}

export default function App() {
  const [state, setState] = useState<AppState>({ screen: 'trips', viewerRole: 'planner' })

  const navigate = (screen: Screen, extra?: Partial<AppState>) => {
    setState(s => ({ ...s, screen, tripId: undefined, ...extra, toast: s.toast }))
    window.scrollTo(0, 0)
  }
  const showToast = (msg: string) => {
    setState(s => ({ ...s, toast: msg }))
    setTimeout(() => setState(s => ({ ...s, toast: undefined })), 2800)
  }
  const setRole = (viewerRole: ViewerRole) => setState(s => ({ ...s, viewerRole }))

  return (
    <>
      {state.screen === 'trips'            && <Dashboard navigate={navigate} viewerRole={state.viewerRole} />}
      {state.screen === 'trip-new'         && <TripNew navigate={navigate} showToast={showToast} />}
      {state.screen === 'trip-detail'      && <TripDetail navigate={navigate} showToast={showToast} tripId={state.tripId} viewerRole={state.viewerRole} />}
      {state.screen === 'idea-comparison'  && <IdeaComparison navigate={navigate} showToast={showToast} tripId={state.tripId} viewerRole={state.viewerRole} />}
      {state.screen === 'scoreboard'       && <Scoreboard navigate={navigate} />}
      {state.screen === 'round-builder'    && <RoundBuilder onDone={() => navigate('live-leaderboard')} />}
      {state.screen === 'live-score'       && <LiveScoreEntry onBack={() => navigate('live-leaderboard')} />}
      {state.screen === 'live-leaderboard' && <LiveLeaderboard onBack={() => navigate('trips')} onEnterScore={() => navigate('live-score')} />}

      {/* Dev role switcher — always visible */}
      <div style={{
        position: 'fixed', bottom: 80, right: 16, zIndex: 200,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {/* Quick nav shortcuts */}
        {state.screen === 'trips' && (<>
          <button onClick={() => navigate('round-builder')}
            style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#e6edf3', padding: '8px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', boxShadow: '0 4px 16px #000' }}>
            ⚙️ Round Builder
          </button>
          <button onClick={() => navigate('live-leaderboard')}
            style={{ background: '#00d4aa', border: 'none', borderRadius: 8, color: '#0d1117', padding: '8px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 4px 16px #000' }}>
            ⛳ Live Leaderboard
          </button>
        </>)}

        {/* Role switcher */}
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 16px #000' }}>
          <div style={{ padding: '5px 10px 4px', fontSize: 10, fontWeight: 700, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #21262d' }}>
            Viewing as
          </div>
          {(Object.entries(ROLE_USERS) as [ViewerRole, { name: string; desc: string }][]).map(([role, info]) => (
            <button key={role} onClick={() => setRole(role)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '6px 10px', border: 'none', cursor: 'pointer', fontSize: 12,
                background: state.viewerRole === role ? '#0d2a22' : 'transparent',
                color: state.viewerRole === role ? '#00d4aa' : '#8b949e',
                fontWeight: state.viewerRole === role ? 700 : 400,
                borderLeft: state.viewerRole === role ? '2px solid #00d4aa' : '2px solid transparent',
              }}>
              {info.name} <span style={{ opacity: 0.6, fontSize: 10 }}>({info.desc})</span>
            </button>
          ))}
        </div>
      </div>

      {state.toast && (
        <div className="fixed z-[200] left-1/2 -translate-x-1/2 bottom-20 md:bottom-6 flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-xl shadow-2xl animate-slide-up"
          style={{ background: 'var(--bt-card)', color: 'var(--bt-text-1)', border: `1px solid var(--bt-accent)50` }}>
          <span style={{ color: 'var(--bt-accent)' }}>✓</span> {state.toast}
        </div>
      )}
    </>
  )
}
