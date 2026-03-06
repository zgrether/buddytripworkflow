import { useState } from 'react'
import { Screen } from '../App'
import { MOCK_EVENT } from '../data/mockData'
import { TopNav, Avatar, BottomNav, LiveDot, SectionLabel } from '../components/ui'

export default function Scoreboard({ navigate }: { navigate: (s: Screen, e?: any) => void }) {
  const [activeGame, setActiveGame] = useState(0)
  const ev: any = MOCK_EVENT as any
  const game = ev.games[activeGame]

  const getScores = (gid: string) => ev.scores.filter(s => s.gameId === gid)
  const teamTotal = (tid: string, gid: string) => getScores(gid).filter(s => s.teamId === tid).reduce((n, s) => n + s.final, 0)
  const teamOverall = (tid: string) => ev.games.slice(0, 2).reduce((n, g) => n + teamTotal(tid, g._id), 0)

  const [alpha, bravo] = ev.teams
  const aTotal = teamOverall(alpha._id)
  const bTotal = teamOverall(bravo._id)
  const alphaLeads = aTotal < bTotal // golf: lower is better

  const gameScores = getScores(game._id)
    .map(s => ({ ...s, player: ev.players.find(p => p._id === s.playerId), team: ev.teams.find(t => t._id === s.teamId) }))
    .sort((a, b) => a.final - b.final)

  const lowScore = gameScores[0]?.final ?? 0

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: 'var(--bt-base)' }}>
      <TopNav navigate={navigate} />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 md:py-7">

        {/* Header */}
        <div className="flex items-start justify-between mb-5 md:mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LiveDot />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--bt-accent)' }}>Live Scoreboard</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--bt-text-1)' }}>{ev.title}</h1>
          </div>
          <button onClick={() => navigate('trip-detail', { tripId: 'trip-1' })}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--bt-card)', border: `1px solid var(--bt-border)`, color: 'var(--bt-text-2)', cursor: 'pointer' }}>
            ← Trip
          </button>
        </div>

        {/* ── Layout: stacked mobile / side-by-side desktop ── */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-5">

          {/* Left: Team battle + game tabs + leaderboard */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Team battle card */}
            <div className="rounded-xl p-4 md:p-5" style={{ background: 'var(--bt-card)', border: `1px solid var(--bt-border)` }}>
              <div className="text-xs font-bold uppercase tracking-widest text-center mb-4" style={{ color: 'var(--bt-text-3)' }}>Overall Standings</div>
              <div className="flex items-center gap-3 md:gap-4">
                {/* Alpha */}
                <TeamBlock team={alpha} total={aTotal} isLeading={alphaLeads} />

                {/* VS */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--bt-base)', color: 'var(--bt-text-3)', border: `1px solid var(--bt-border)` }}>
                    vs
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--bt-text-3)' }}>
                    {Math.abs(aTotal - bTotal)} strokes
                  </div>
                </div>

                {/* Bravo */}
                <TeamBlock team={bravo} total={bTotal} isLeading={!alphaLeads} />
              </div>
            </div>

            {/* Game tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
              {ev.games.map((g, i) => (
                <button key={g._id} onClick={() => setActiveGame(i)}
                  className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    background: activeGame === i ? 'var(--bt-accent)' : 'var(--bt-card)',
                    color: activeGame === i ? '#0d1117' : 'var(--bt-text-2)',
                    border: `1px solid ${activeGame === i ? 'var(--bt-accent)' : 'var(--bt-border)'}`,
                    cursor: 'pointer',
                  }}>
                  Rd {i + 1}: {g.title.split(' ').slice(0, 2).join(' ')}
                </button>
              ))}
            </div>

            {/* Leaderboard */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bt-card)', border: `1px solid var(--bt-border)` }}>
              {/* Header row */}
              <div className="grid px-4 py-2.5 border-b"
                style={{ gridTemplateColumns: '28px 1fr 52px 52px', borderColor: 'var(--bt-border)' }}>
                {['#', 'Player', 'Raw', 'Net'].map(h => (
                  <div key={h} className="text-xs font-semibold uppercase tracking-wider text-right first:text-left"
                    style={{ color: 'var(--bt-text-3)' }}>{h}</div>
                ))}
              </div>

              {gameScores.map((s, rank) => {
                const isTop = rank === 0
                const diff = s.final - lowScore
                return (
                  <div key={s._id || rank}
                    className="grid items-center px-4 py-3 border-b last:border-b-0"
                    style={{ gridTemplateColumns: '28px 1fr 52px 52px', borderColor: 'var(--bt-border)', background: isTop ? `${s.team?.color}12` : 'transparent' }}>

                    <div className="text-sm">
                      {isTop ? '🏆' : <span className="font-bold" style={{ color: 'var(--bt-text-3)' }}>{rank + 1}</span>}
                    </div>

                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: `${s.team?.color}22`, border: `2px solid ${s.team?.color}`, color: s.team?.color }}>
                        {s.player?.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: 'var(--bt-text-1)' }}>{s.player?.name}</div>
                        <div className="text-xs" style={{ color: 'var(--bt-text-3)' }}>{s.team?.name} · hdcp {s.player?.handicap}</div>
                      </div>
                    </div>

                    <div className="text-sm text-right" style={{ color: 'var(--bt-text-3)' }}>{s.raw}</div>

                    <div className="text-right">
                      <span className="text-base font-bold" style={{ color: isTop ? 'var(--bt-accent)' : 'var(--bt-text-1)' }}>{s.final}</span>
                      {!isTop && diff > 0 && <span className="text-xs ml-1" style={{ color: 'var(--bt-text-3)' }}>+{diff}</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Rules */}
            <p className="text-xs text-center" style={{ color: 'var(--bt-text-3)' }}>{game.rules}</p>
          </div>

          {/* Right sidebar — team rosters (desktop only) */}
          <div className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">
            {ev.teams.map(team => {
              const teamPlayers = ev.players.filter(p => p.events.some(e => e.teamId === team._id))
              const gameId = game._id
              return (
                <div key={team._id} className="rounded-xl overflow-hidden"
                  style={{ background: 'var(--bt-card)', border: `1px solid var(--bt-border)` }}>
                  <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--bt-border)' }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: team.color }} />
                    <span className="font-semibold text-sm" style={{ color: 'var(--bt-text-1)' }}>{team.name}</span>
                    <span className="ml-auto font-bold text-base" style={{ color: teamOverall(team._id) < teamOverall(ev.teams.find(t => t._id !== team._id)!._id) ? 'var(--bt-accent)' : 'var(--bt-text-2)' }}>
                      {teamOverall(team._id)}
                    </span>
                  </div>
                  {teamPlayers.map(p => {
                    const score = getScores(gameId).find(s => s.playerId === p._id)
                    return (
                      <div key={p._id} className="flex items-center gap-2.5 px-4 py-2.5 border-b last:border-b-0"
                        style={{ borderColor: 'var(--bt-border)' }}>
                        <Avatar name={p.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: 'var(--bt-text-1)' }}>{p.name}</div>
                          <div className="text-xs" style={{ color: 'var(--bt-text-3)' }}>hdcp {p.handicap}</div>
                        </div>
                        {score && (
                          <span className="text-sm font-bold" style={{ color: 'var(--bt-text-1)' }}>{score.final}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* Quick score entry CTA */}
            <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bt-tag-bg)', border: `1px solid var(--bt-accent)40` }}>
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--bt-accent)' }}>⚡ Quick Score Entry</div>
              <div className="text-xs mb-3" style={{ color: 'var(--bt-text-3)' }}>On the course? Enter scores fast.</div>
              <button className="w-full text-sm font-semibold py-2 rounded-lg"
                style={{ background: 'var(--bt-accent)', color: '#0d1117', border: 'none', cursor: 'pointer' }}>
                Enter Scores
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="scoreboard" navigate={navigate} />
    </div>
  )
}

function TeamBlock({ team, total, isLeading }: { team: any; total: number; isLeading: boolean }) {
  return (
    <div className="flex-1 text-center">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-lg md:text-xl font-black"
        style={{ background: `${team.color}22`, border: `2px solid ${team.color}`, color: team.color }}>
        {team.name[7] || team.name[0]}
      </div>
      <div className="text-xs md:text-sm font-semibold mb-0.5 truncate" style={{ color: 'var(--bt-text-1)' }}>{team.name}</div>
      <div className="text-2xl md:text-3xl font-black" style={{ color: isLeading ? 'var(--bt-accent)' : 'var(--bt-text-1)' }}>{total}</div>
      {isLeading && <div className="text-xs font-bold mt-0.5" style={{ color: 'var(--bt-accent)' }}>LEADING</div>}
    </div>
  )
}
