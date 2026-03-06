import { useState } from 'react'
import { BBMI_EVENT, LIVE_SCORES, ROUND_RESULTS } from '../data/mockData'

// ─── Constants ────────────────────────────────────────────────────────────────

const TRIP_INFO = {
  accommodation: { name: 'Bandon Dunes Lodge', doorCode: '4821#', checkIn: 'March 11, 3:00 PM', checkOut: 'March 15, 11:00 AM', notes: 'Bags at pro shop before check-in. Ask for oceanview side.' },
  schedule: [
    { day: 'Tue 3/11', label: 'Arrival',    today: false, items: ['3:00 PM — Check in (door: 4821#)', '5:00 PM — Practice round, Bandon Preserve', '7:30 PM — Dinner, McKay\'s Market Grill'] },
    { day: 'Wed 3/12', label: 'Scramble',   today: false, items: ['9:00 AM — Tee off, Bandon Dunes', '1:00 PM — Pool / Hammerschlagen', '7:00 PM — Dinner TBD'] },
    { day: 'Thu 3/13', label: 'Stableford', today: false, items: ['8:00 AM — Tee off, Bandon Trails', '1:30 PM — Pick-Em results', '6:30 PM — Cornhole'] },
    { day: 'Fri 3/14', label: 'Sabotage ← TODAY', today: true, items: ['7:00 AM — Breakfast (don\'t be late)', '8:00 AM — Tee off, Pacific Dunes', '7:00 PM — Final dinner + awards'] },
    { day: 'Sat 3/15', label: 'Skins — Last Day', today: false, items: ['7:30 AM — Three Glorious Finishing Holes briefing', '8:00 AM — Tee off, Old Macdonald', '12:00 PM — BBMI Champion crowned', '3:00 PM — Checkout'] },
  ],
  links: [
    { label: 'Bandon Dunes Resort', url: '#', icon: '🏌️' },
    { label: 'Venmo: @brad-giesler', url: '#', icon: '💵' },
    { label: 'Shared flight tracker', url: '#', icon: '✈️' },
    { label: 'BBMI 2025 Rules Card', url: '#', icon: '📋' },
  ],
}

// This trip IS part of a series — controls whether History tab appears
const IS_SERIES_TRIP = true
const SERIES_NAME = 'BBMI'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupStatus(groupId: string) {
  const group = BBMI_EVENT.groups.find(g => g._id === groupId)!
  const groupPlayers = BBMI_EVENT.players.filter(p => group.playerIds.includes(p._id))
  const activeRound = BBMI_EVENT.rounds.find(r => r.status === 'active')!

  const holesPerPlayer = groupPlayers.map(p => {
    const sc = LIVE_SCORES[p._id] || []
    return sc.reduce((last: number, v, i) => (v !== null && v !== undefined ? i + 1 : last), 0)
  })
  const holesDone = Math.max(0, ...holesPerPlayer)
  const isComplete = holesDone >= 18

  const teamVsPar: Record<string, number> = {}
  groupPlayers.forEach(p => {
    const sc = LIVE_SCORES[p._id] || []
    let diff = 0
    for (let i = 0; i < holesDone; i++) {
      const v = sc[i]
      if (v !== null && v !== undefined) diff += (v as number) - (activeRound.holes[i]?.par || 4)
    }
    if (teamVsPar[p.teamId] === undefined) teamVsPar[p.teamId] = 0
    teamVsPar[p.teamId] += diff
  })
  return { holesDone, teamVsPar, groupPlayers, activeRound, isComplete }
}

// ─── Group Scorecard Detail ───────────────────────────────────────────────────

function GroupDetail({ groupId, onBack }: { groupId: string; onBack: () => void }) {
  const { holesDone, teamVsPar, groupPlayers, activeRound, isComplete } = groupStatus(groupId)
  const group = BBMI_EVENT.groups.find(g => g._id === groupId)!
  const teams = BBMI_EVENT.teams
  const vpA = teamVsPar['team-a'] || 0
  const vpB = teamVsPar['team-b'] || 0

  const teamColor = (tid: string) => teams.find(t => t._id === tid)?.color || '#888'
  const teamShort = (tid: string) => teams.find(t => t._id === tid)?.shortName || ''

  function scoreStyle(val: number | null | undefined, par: number) {
    if (val == null) return { bg: 'transparent', border: '#21262d', color: '#374151' }
    const d = val - par
    if (d <= -2) return { bg: '#f59e0b22', border: '#f59e0b', color: '#f59e0b' }
    if (d === -1) return { bg: '#00d4aa22', border: '#00d4aa', color: '#00d4aa' }
    if (d === 0)  return { bg: 'transparent', border: '#374151', color: '#8b949e' }
    if (d === 1)  return { bg: '#c0765a15', border: '#c0765a', color: '#c0765a' }
    return { bg: '#a0554015', border: '#a05540', color: '#a05540' }
  }

  function runVsPar(pid: string) {
    const sc = LIVE_SCORES[pid] || []
    return sc.reduce((sum: number, v, i) => v != null ? sum + (v as number) - (activeRound.holes[i]?.par || 4) : sum, 0)
  }

  const aLeads = vpA < vpB, bLeads = vpB < vpA

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #21262d', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 22, padding: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isComplete ? (
              <span style={{ background: '#21262d', color: '#8b949e', fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 10 }}>COMPLETE ✓</span>
            ) : (
              <>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00d4aa', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ color: '#00d4aa', fontSize: 11, letterSpacing: 2, fontFamily: 'monospace' }}>LIVE</span>
              </>
            )}
          </div>
          <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: 16 }}>{group.name} · {activeRound.title}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#4a5568', fontSize: 12 }}>
            {isComplete ? 'Final' : holesDone === 0 ? 'Not started' : `Thru ${holesDone}`}
          </div>
          {/* Hole progress bar */}
          <div style={{ width: 72, height: 3, borderRadius: 2, background: '#21262d', marginTop: 4, overflow: 'hidden' }}>
            <div style={{ width: `${Math.round((holesDone / 18) * 100)}%`, height: '100%', borderRadius: 2, background: isComplete ? '#374151' : '#00d4aa', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ color: '#374151', fontSize: 10, marginTop: 2 }}>
            {isComplete ? '18 / 18' : `${holesDone} / 18`}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: 16 }}>
        {/* Match result / status */}
        <div style={{
          background: isComplete ? '#0d1117' : '#161b22',
          border: `1px solid ${isComplete ? '#374151' : '#21262d'}`,
          borderRadius: 12, padding: 16, marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            {[{ id: 'team-a', vp: vpA }, { id: 'team-b', vp: vpB }].map((t, i) => {
              const team = teams.find(tm => tm._id === t.id)!
              const winning = i === 0 ? aLeads : bLeads
              return (
                <div key={t.id} style={{ flex: 1, textAlign: i === 0 ? 'left' : 'right' }}>
                  <div style={{ color: team.color, fontSize: 11, fontWeight: 700 }}>{team.shortName}</div>
                  <div style={{ color: winning ? team.color : '#8b949e', fontSize: 44, fontWeight: 900, lineHeight: 1 }}>
                    {t.vp > 0 ? `+${t.vp}` : t.vp === 0 ? 'E' : t.vp}
                  </div>
                </div>
              )
            })}
            <div style={{ color: '#374151', fontWeight: 900, fontSize: 18, padding: '0 6px' }}>VS</div>
          </div>
          <div style={{ height: 5, borderRadius: 3, overflow: 'hidden', background: '#21262d', display: 'flex', marginBottom: 8 }}>
            <div style={{ flex: Math.max(0.1, 5 - (vpA - vpB)), background: teams[0].color, transition: 'flex 0.4s' }} />
            <div style={{ flex: Math.max(0.1, 5 + (vpA - vpB)), background: teams[1].color }} />
          </div>
          <div style={{ textAlign: 'center', color: isComplete ? '#e6edf3' : '#8b949e', fontSize: 13, fontWeight: isComplete ? 700 : 400 }}>
            {vpA === vpB ? (isComplete ? '🤝 Tied — half point each' : 'All square') :
              `${vpA < vpB ? teams[0].shortName : teams[1].shortName} ${isComplete ? 'wins' : 'leads'} by ${Math.abs(vpA - vpB)} strokes`}
            {isComplete && ' · Final'}
          </div>
        </div>

        {/* Players */}
        <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
          {groupPlayers.map(p => {
            const sc = LIVE_SCORES[p._id] || []
            const vp = runVsPar(p._id)
            const lastIdx = sc.reduce((last: number, v, i) => v != null ? i : last, -1)
            const lastScore = lastIdx >= 0 ? sc[lastIdx] as number : null
            const lastPar = lastIdx >= 0 ? activeRound.holes[lastIdx]?.par || 4 : 4
            const lastDiff = lastScore != null ? lastScore - lastPar : null
            return (
              <div key={p._id} style={{ background: '#161b22', border: `1px solid ${teamColor(p.teamId)}30`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: teamColor(p.teamId), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0d1117', flexShrink: 0 }}>
                  {p.nickname.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#e6edf3', fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                  <div style={{ color: '#4a5568', fontSize: 12 }}>{teamShort(p.teamId)} · Hcp {p.handicap} · Thru {Math.max(0, lastIdx + 1)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: vp < 0 ? '#00d4aa' : vp > 0 ? '#c0765a' : '#8b949e', fontWeight: 800, fontSize: 22 }}>
                    {vp > 0 ? `+${vp}` : vp === 0 ? 'E' : vp}
                  </div>
                  {lastDiff != null && (
                    <div style={{ fontSize: 11, color: lastDiff < 0 ? '#00d4aa' : lastDiff > 0 ? '#c0765a' : '#4a5568' }}>
                      {lastDiff === -1 ? '🐦' : lastDiff === 0 ? 'par' : `+${lastDiff}`} last
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Hole progress — neutral fill bar */}
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#8b949e', fontSize: 12 }}>
              {isComplete ? '✓ Round complete' : holesDone === 0 ? 'Not started' : `Hole ${holesDone} of 18`}
            </span>
            <span style={{ color: '#4a5568', fontSize: 12 }}>
              {isComplete ? 'Final' : holesDone > 0 ? `${18 - holesDone} to play` : `Tee time ${group.teeTime}`}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', background: '#21262d' }}>
            <div style={{
              width: `${Math.round((holesDone / 18) * 100)}%`,
              height: '100%',
              borderRadius: 3,
              background: isComplete ? '#374151' : '#00d4aa',
              transition: 'width 0.5s ease',
              minWidth: holesDone > 0 ? 6 : 0,
            }} />
          </div>
        </div>

        {/* Scorecard — front / back */}
        {[0, 9].map(start => (
          <div key={start} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: 12, marginBottom: 10, overflowX: 'auto' }}>
            <div style={{ color: '#4a5568', fontSize: 11, marginBottom: 8 }}>{start === 0 ? 'FRONT 9' : 'BACK 9'}</div>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <td style={{ color: '#4a5568', fontSize: 9, padding: '2px 8px 2px 2px' }}>PLAYER</td>
                  {activeRound.holes.slice(start, start + 9).map(h => (
                    <td key={h.hole} style={{ textAlign: 'center', padding: '2px 2px', minWidth: 22 }}>
                      <div style={{ color: '#4a5568', fontSize: 9 }}>{h.hole}</div>
                      <div style={{ color: '#374151', fontSize: 8 }}>p{h.par}</div>
                    </td>
                  ))}
                  <td style={{ textAlign: 'center', color: '#4a5568', fontSize: 9, padding: '2px 4px' }}>Tot</td>
                </tr>
              </thead>
              <tbody>
                {groupPlayers.map(p => {
                  const sc = LIVE_SCORES[p._id] || []
                  const nine = sc.slice(start, start + 9)
                  const nineTotal = nine.reduce((s, v) => s + (v != null ? (v as number) : 0), 0)
                  const ninePlayed = nine.filter(v => v != null).length
                  return (
                    <tr key={p._id}>
                      <td style={{ color: teamColor(p.teamId), fontSize: 10, fontWeight: 600, padding: '3px 8px 3px 2px' }}>{p.nickname}</td>
                      {nine.map((sv, i) => {
                        const par = activeRound.holes[start + i]?.par || 4
                        const s = scoreStyle(sv as number | null | undefined, par)
                        return (
                          <td key={i} style={{ padding: 2, textAlign: 'center' }}>
                            <div style={{ width: 22, height: 22, borderRadius: 3, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 9, fontWeight: 700 }}>
                              {sv != null ? (sv as number) : '·'}
                            </div>
                          </td>
                        )
                      })}
                      <td style={{ textAlign: 'center', color: '#e6edf3', fontSize: 10, fontWeight: 700 }}>{ninePlayed > 0 ? nineTotal : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
    </div>
  )
}

// ─── Main Leaderboard ─────────────────────────────────────────────────────────

type Tab = 'overview' | 'groups' | 'info' | 'history'

export default function LiveLeaderboard({ onBack, onEnterScore }: { onBack?: () => void; onEnterScore?: () => void }) {
  const { teams, rounds, sides } = BBMI_EVENT
  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview'    },
    { id: 'groups',   label: 'Live Groups' },
    { id: 'info',     label: 'Trip Info'   },
    ...(IS_SERIES_TRIP ? [{ id: 'history' as Tab, label: 'History' }] : []),
  ]
  const [tab, setTab] = useState<Tab>('overview')
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  if (openGroup) return <GroupDetail groupId={openGroup} onBack={() => setOpenGroup(null)} />

  const [teamA, teamB] = teams
  const totalPts = (tid: string) => {
    let pts = 0
    Object.values(ROUND_RESULTS).forEach(r => { pts += (r as any)[tid] || 0 })
    sides.filter(s => s.status === 'complete').forEach(s => { pts += (s.result as any)[tid] || 0 })
    return pts
  }
  const ptsA = totalPts('team-a'), ptsB = totalPts('team-b')
  const totalPossible = rounds.reduce((s, r) => s + r.pointsAvailable, 0) + sides.reduce((s, sd) => s + sd.pointsAvailable, 0)
  const remaining = totalPossible - ptsA - ptsB
  const activeRound = rounds.find(r => r.status === 'active')

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0d1117', borderBottom: '1px solid #21262d' }}>
        <div style={{ padding: '10px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 22, padding: 0 }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00d4aa', display: 'inline-block', animation: 'livePulse 2s infinite' }} />
              <span style={{ color: '#00d4aa', fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>LIVE · BBMI 2025</span>
            </div>
            <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: 16 }}>Day 3 of 4 · Pacific Dunes</div>
          </div>
          {onEnterScore && (
            <button onClick={onEnterScore} style={{ background: '#00d4aa', color: '#0d1117', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              ⛳ My Score
            </button>
          )}
        </div>
        <div style={{ display: 'flex' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: '9px 4px', border: 'none', cursor: 'pointer', background: 'transparent', borderBottom: `2px solid ${tab === t.id ? '#00d4aa' : 'transparent'}`, color: tab === t.id ? '#00d4aa' : '#8b949e', fontSize: 12, fontWeight: tab === t.id ? 700 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: 16 }}>

        {/* ── OVERVIEW ───────────────────────────────────────── */}
        {tab === 'overview' && (<>
          {/* Hero */}
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 14, padding: '20px 20px 16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 14 }}>
              {[{ t: teamA, pts: ptsA }, { t: teamB, pts: ptsB }].map((item, idx) => (
                <div key={item.t._id} style={{ flex: 1, textAlign: idx === 0 ? 'left' : 'right' }}>
                  <div style={{ color: item.t.color, fontSize: 12, fontWeight: 800 }}>{item.t.name.toUpperCase()}</div>
                  <div style={{ color: item.t.color, fontSize: 76, fontWeight: 900, lineHeight: 1 }}>{item.pts}</div>
                  <div style={{ color: '#4a5568', fontSize: 11 }}>points</div>
                </div>
              ))}
            </div>
            <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', background: '#21262d', display: 'flex', marginBottom: 8 }}>
              <div style={{ width: `${(ptsA / Math.max(ptsA + ptsB, 1)) * 100}%`, background: teamA.color, transition: 'width 0.6s', minWidth: 4 }} />
              <div style={{ flex: 1, background: teamB.color, minWidth: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#4a5568' }}>{remaining} pts still in play</span>
              <span style={{ color: ptsA > ptsB ? teamA.color : ptsB > ptsA ? teamB.color : '#8b949e', fontWeight: 700 }}>
                {ptsA === ptsB ? 'Tied' : `${ptsA > ptsB ? teamA.shortName : teamB.shortName} leads +${Math.abs(ptsA - ptsB)}`}
              </span>
            </div>
          </div>

          {/* Breakdown */}
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 56px 36px', padding: '8px 14px', borderBottom: '1px solid #0d1117' }}>
              <span style={{ color: '#4a5568', fontSize: 11, letterSpacing: 1 }}>EVENT</span>
              <span style={{ color: teamA.color, fontSize: 11, fontWeight: 700, textAlign: 'center' as const }}>{teamA.shortName}</span>
              <span style={{ color: teamB.color, fontSize: 11, fontWeight: 700, textAlign: 'center' as const }}>{teamB.shortName}</span>
              <span style={{ color: '#4a5568', fontSize: 10, textAlign: 'center' as const }}>Max</span>
            </div>

            {rounds.map(r => {
              const res = (ROUND_RESULTS as any)[r._id]
              const isActive = r.status === 'active'
              const isUpcoming = r.status === 'upcoming'
              const isComplete = r.status === 'complete'
              return (
                <div key={r._id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 56px 56px 36px',
                    padding: isActive ? '13px 14px' : '11px 14px',
                    borderBottom: '1px solid #0d1117', alignItems: 'center',
                    opacity: isUpcoming ? 0.4 : 1,
                    cursor: isActive ? 'pointer' : 'default',
                    background: isActive ? '#0d1a10' : 'transparent',
                    borderLeft: isActive ? '3px solid #00d4aa' : '3px solid transparent',
                  }}
                  onClick={isActive ? () => setTab('groups') : undefined}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* Status indicator */}
                      {isActive && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00d4aa', flexShrink: 0, animation: 'livePulse 2s infinite' }} />}
                      {isComplete && <span style={{ color: '#374151', fontSize: 10 }}>✓</span>}
                      <span style={{ color: '#e6edf3', fontSize: 13, fontWeight: 500 }}>Day {r.day}: {r.title}</span>
                    </div>
                    <div style={{ color: isActive ? '#00d4aa' : isUpcoming ? '#4a5568' : '#374151', fontSize: 11, paddingLeft: isActive ? 13 : isComplete ? 13 : 0 }}>
                      {r.course} · {isActive ? 'On course now — tap to see groups' : isUpcoming ? 'Not started' : '✓ Final'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' as const }}>
                    <span style={{ color: res ? (res['team-a'] > res['team-b'] ? teamA.color : '#8b949e') : '#374151', fontWeight: 800, fontSize: 16 }}>{res ? res['team-a'] : '—'}</span>
                  </div>
                  <div style={{ textAlign: 'center' as const }}>
                    <span style={{ color: res ? (res['team-b'] > res['team-a'] ? teamB.color : '#8b949e') : '#374151', fontWeight: 800, fontSize: 16 }}>{res ? res['team-b'] : '—'}</span>
                  </div>
                  <div style={{ textAlign: 'center' as const, color: '#374151', fontSize: 12 }}>{r.pointsAvailable}</div>
                </div>
              )
            })}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 56px 36px', padding: '6px 14px', borderBottom: '1px solid #0d1117' }}>
              <span style={{ color: '#374151', fontSize: 10, letterSpacing: 1 }}>SIDE EVENTS</span>
              <span /><span /><span />
            </div>
            {sides.map(s => {
              const ra = (s.result as any)['team-a'], rb = (s.result as any)['team-b']
              return (
                <div key={s._id} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 56px 36px', padding: '10px 14px', borderBottom: '1px solid #0d1117', alignItems: 'center', opacity: s.status === 'upcoming' ? 0.4 : 1 }}>
                  <div>
                    <div style={{ color: '#e6edf3', fontSize: 13 }}>{s.icon} {s.name}</div>
                    <div style={{ color: s.status === 'complete' ? '#374151' : '#4a5568', fontSize: 11 }}>{s.status === 'complete' ? '✓ Final' : 'Upcoming'}</div>
                  </div>
                  <div style={{ textAlign: 'center' as const }}><span style={{ color: s.status === 'complete' ? (ra >= rb ? teamA.color : '#8b949e') : '#374151', fontWeight: 700, fontSize: 15 }}>{s.status === 'complete' ? ra : '—'}</span></div>
                  <div style={{ textAlign: 'center' as const }}><span style={{ color: s.status === 'complete' ? (rb >= ra ? teamB.color : '#8b949e') : '#374151', fontWeight: 700, fontSize: 15 }}>{s.status === 'complete' ? rb : '—'}</span></div>
                  <div style={{ textAlign: 'center' as const, color: '#374151', fontSize: 12 }}>{s.pointsAvailable}</div>
                </div>
              )
            })}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 56px 36px', padding: '12px 14px', background: '#0d1117' }}>
              <span style={{ color: '#8b949e', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>TOTAL</span>
              <span style={{ color: teamA.color, fontWeight: 900, fontSize: 22, textAlign: 'center' as const }}>{ptsA}</span>
              <span style={{ color: teamB.color, fontWeight: 900, fontSize: 22, textAlign: 'center' as const }}>{ptsB}</span>
              <span style={{ color: '#374151', fontSize: 12, textAlign: 'center' as const }}>{totalPossible}</span>
            </div>
          </div>

          {/* Rosters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {teams.map(team => (
              <div key={team._id} style={{ background: '#161b22', border: `1px solid ${team.color}25`, borderRadius: 10, padding: 12 }}>
                <div style={{ color: team.color, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{team.name}</div>
                {BBMI_EVENT.players.filter(p => p.teamId === team._id).map(p => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: team.color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: team.color, flexShrink: 0 }}>
                      {p.nickname.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ color: '#e6edf3', fontSize: 12 }}>{p.nickname}</span>
                    <span style={{ color: '#374151', fontSize: 10, marginLeft: 'auto' }}>+{p.handicap}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>)}

        {/* ── GROUPS ─────────────────────────────────────────── */}
        {tab === 'groups' && (<>
          <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 14 }}>Tap any group for the full scorecard. Your group is highlighted.</div>
          {BBMI_EVENT.groups.map(group => {
            const { holesDone, teamVsPar, isComplete } = groupStatus(group._id)
            const groupPlayers = BBMI_EVENT.players.filter(p => group.playerIds.includes(p._id))
            const vpA = teamVsPar['team-a'] || 0, vpB = teamVsPar['team-b'] || 0
            const isMyGroup = group._id === 'g2'
            const aLeads = vpA < vpB, bLeads = vpB < vpA
            const leadTeam = aLeads ? teamA : bLeads ? teamB : null
            const ar = BBMI_EVENT.rounds.find(r => r.status === 'active')!

            return (
              <button key={group._id} onClick={() => setOpenGroup(group._id)}
                style={{
                  width: '100%', display: 'block', textAlign: 'left', cursor: 'pointer',
                  background: isMyGroup ? '#0f1f14' : isComplete ? '#0d1117' : '#161b22',
                  border: `1px solid ${isMyGroup ? '#00d4aa50' : isComplete ? '#374151' : '#21262d'}`,
                  borderRadius: 12, padding: 14, marginBottom: 10,
                  opacity: isComplete ? 0.8 : 1,
                }}>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      {/* On course vs complete indicator */}
                      {isComplete ? (
                        <span style={{ background: '#21262d', color: '#8b949e', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>FINAL ✓</span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#00d4aa15', borderRadius: 10, padding: '1px 7px' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00d4aa', display: 'inline-block', animation: 'livePulse 2s infinite' }} />
                          <span style={{ color: '#00d4aa', fontSize: 10, fontWeight: 700 }}>ON COURSE</span>
                        </span>
                      )}
                      {isMyGroup && <span style={{ background: '#00d4aa22', color: '#00d4aa', fontSize: 10, padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>YOU</span>}
                    </div>
                    <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: 15 }}>{group.name}</div>
                    <div style={{ color: '#4a5568', fontSize: 12, marginTop: 1 }}>
                      {isComplete ? `${group.teeTime} · Finished` : holesDone === 0 ? `Tees off ${group.teeTime}` : `Thru hole ${holesDone}`}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {leadTeam ? <>
                      <div style={{ color: leadTeam.color, fontSize: 13, fontWeight: 700 }}>{leadTeam.shortName} {isComplete ? 'wins' : 'leads'}</div>
                      <div style={{ color: leadTeam.color, fontSize: 11 }}>{Math.abs(vpA - vpB)} strokes</div>
                    </> : holesDone > 0 ? (
                      <div style={{ color: '#8b949e', fontSize: 13, fontWeight: 700 }}>{isComplete ? '🤝 Halved' : 'All square'}</div>
                    ) : (
                      <div style={{ color: '#4a5568', fontSize: 12 }}>Not started</div>
                    )}
                  </div>
                </div>

                {/* Player pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {groupPlayers.map(p => {
                    const team = teams.find(t => t._id === p.teamId)!
                    const sc = LIVE_SCORES[p._id] || []
                    const vp = sc.reduce((sum: number, v, i) => v != null ? sum + (v as number) - (ar.holes[i]?.par || 4) : sum, 0)
                    const played = sc.filter(v => v != null).length
                    return (
                      <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#0d1117', border: `1px solid ${team.color}30`, borderRadius: 6, padding: '4px 8px' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: team.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: '#0d1117', flexShrink: 0 }}>
                          {p.nickname.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ color: '#e6edf3', fontSize: 12 }}>{p.nickname}</span>
                        {played > 0 && <span style={{ color: vp < 0 ? '#00d4aa' : vp > 0 ? '#c0765a' : '#8b949e', fontSize: 11, fontWeight: 700 }}>{vp > 0 ? `+${vp}` : vp === 0 ? 'E' : vp}</span>}
                      </div>
                    )
                  })}
                </div>

                {/* Hole progress bar — neutral, shows how far through the round */}
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#4a5568', fontSize: 11 }}>
                      {isComplete ? 'Round complete' : holesDone === 0 ? 'Not started' : `Hole ${holesDone} of 18`}
                    </span>
                    <span style={{ color: '#4a5568', fontSize: 11 }}>Tap for scorecard ›</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, overflow: 'hidden', background: '#21262d' }}>
                    <div style={{
                      width: `${Math.round((holesDone / 18) * 100)}%`,
                      height: '100%',
                      borderRadius: 2,
                      background: isComplete ? '#374151' : '#00d4aa',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              </button>
            )
          })}
        </>)}

        {/* ── TRIP INFO ──────────────────────────────────────── */}
        {tab === 'info' && (<>
          {/* Door code — biggest thing on the page */}
          <div style={{ background: '#0d1117', border: '2px solid #00d4aa30', borderRadius: 12, padding: '16px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#8b949e', fontSize: 11, letterSpacing: 2, marginBottom: 4 }}>🔑 DOOR CODE</div>
              <div style={{ color: '#00d4aa', fontSize: 48, fontWeight: 900, fontFamily: 'monospace', letterSpacing: 8, lineHeight: 1 }}>{TRIP_INFO.accommodation.doorCode}</div>
              <div style={{ color: '#4a5568', fontSize: 12, marginTop: 6 }}>{TRIP_INFO.accommodation.name}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[{ label: 'CHECK IN', val: TRIP_INFO.accommodation.checkIn }, { label: 'CHECK OUT', val: TRIP_INFO.accommodation.checkOut }].map(item => (
              <div key={item.label} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ color: '#4a5568', fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: '#e6edf3', fontSize: 13, fontWeight: 600 }}>{item.val}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <div style={{ color: '#8b949e', fontSize: 11, letterSpacing: 1, marginBottom: 14 }}>📅 SCHEDULE</div>
            {TRIP_INFO.schedule.map((day, di) => (
              <div key={di} style={{ marginBottom: di < TRIP_INFO.schedule.length - 1 ? 16 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ background: day.today ? '#00d4aa' : '#21262d', color: day.today ? '#0d1117' : '#8b949e', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {day.day}
                  </div>
                  <div style={{ color: day.today ? '#00d4aa' : '#e6edf3', fontSize: 13, fontWeight: 600 }}>{day.label}</div>
                </div>
                {day.items.map((item, ii) => (
                  <div key={ii} style={{ color: '#8b949e', fontSize: 13, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${day.today ? '#00d4aa30' : '#21262d'}` }}>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
            {TRIP_INFO.links.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < TRIP_INFO.links.length - 1 ? '1px solid #0d1117' : 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: 20 }}>{l.icon}</span>
                <span style={{ color: '#e6edf3', fontSize: 14, flex: 1 }}>{l.label}</span>
                <span style={{ color: '#00d4aa', fontSize: 18 }}>›</span>
              </div>
            ))}
          </div>

          <div style={{ color: '#4a5568', fontSize: 12, textAlign: 'center' as const }}>Organizers can edit trip info · Tap any item to copy</div>
        </>)}

        {/* ── HISTORY (series trips only) ─────────────────────── */}
        {tab === 'history' && IS_SERIES_TRIP && (<>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
            <div>
              <div style={{ color: '#e6edf3', fontWeight: 800, fontSize: 20 }}>{SERIES_NAME} All-Time</div>
              <div style={{ color: '#8b949e', fontSize: 13 }}>2005–2025 · 20 years running</div>
            </div>
          </div>

          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '8px 14px', borderBottom: '1px solid #0d1117' }}>
              <span style={{ color: '#4a5568', fontSize: 11, letterSpacing: 1 }}>ALL-TIME LEADERS — pts/event</span>
            </div>
            {[
              { name: 'Brad Giesler',   ppg: 3.13, wins: 8 },
              { name: 'BJ Dames',       ppg: 3.10, wins: 5 },
              { name: 'Jeremy Merling', ppg: 3.00, wins: 5 },
              { name: 'Buddy Banks',    ppg: 2.87, wins: 7 },
              { name: 'JD Shumpert',    ppg: 2.75, wins: 6 },
              { name: 'Rob Drupp',      ppg: 2.69, wins: 4 },
              { name: 'Zach Grether',   ppg: 2.69, wins: 5 },
            ].map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid #0d1117' }}>
                <span style={{ color: i < 3 ? '#f59e0b' : '#4a5568', fontSize: 13, fontWeight: 700, minWidth: 24 }}>#{i + 1}</span>
                <span style={{ color: '#e6edf3', fontSize: 14, flex: 1 }}>{p.name}</span>
                <span style={{ color: '#8b949e', fontSize: 12 }}>{p.wins}W</span>
                <span style={{ color: '#00d4aa', fontWeight: 800, fontSize: 15, minWidth: 36, textAlign: 'right' as const }}>{p.ppg.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {[
            { year: 2025, team: 'Ham, Egg & Cheese Biscuit', players: 'JD / Facchine / Charlie / Buddy',    location: 'Bandon Dunes, OR' },
            { year: 2022, team: 'Spearmint Rhino',           players: 'Tyler / Damen / Rob / JRob',          location: 'Baltusrol, NJ'    },
            { year: 2021, team: 'JDDD',                      players: 'JD / Merling / BJ / Frank',           location: 'Erin Hills, WI'   },
            { year: 2019, team: 'Bone Thugs-N-HarbourTown',  players: 'JD / Rob / BJ / Charlie…',            location: 'Harbour Town, SC' },
            { year: 2018, team: 'Those Who Showed',          players: 'Buddy / Brad / Zach / Billy…',        location: 'Streamsong, FL'   },
            { year: 2017, team: 'The Orphans',               players: 'Fach / Damen / Zach / JRob',          location: 'Whistling Straits, WI' },
            { year: 2016, team: '"The Deplorables"',         players: 'Zach / Brad / Tyler / Drew…',         location: 'Kohler, WI'       },
            { year: 2015, team: '"I Like Big Putts…"',       players: 'Brad / Rob / JRob / Baldacci',        location: 'Hilton Head, SC'  },
            { year: 2014, team: '"No Cupcakes"',             players: 'Fach / JD / Zach / BJ',               location: 'Hilton Head, SC'  },
            { year: 2013, team: '"Future Leaders…"',         players: 'Brad / Bill / Buddy / Merling…',      location: 'Myrtle Beach, SC' },
            { year: 2012, team: '"Catsplosion!"',            players: 'Brad / Damen / Zach / BJ',            location: 'Myrtle Beach, SC' },
            { year: 2011, team: '"Slow and Unremarkable"',   players: 'Brad / JRob / Buddy',                 location: 'Kiawah, SC'       },
            { year: 2010, team: '"Putt Pirates"',            players: 'JD / Zach / Buddy',                   location: 'Pinehurst, NC'    },
            { year: 2009, team: '"Not Golfing, Butt Welding"',players:'Brad / Zach / Buddy',                 location: 'Myrtle Beach, SC' },
            { year: 2008, team: '"S.S. J-Rob"',              players: 'Charlie / JD / JRob',                 location: 'Myrtle Beach, SC' },
            { year: 2007, team: '"Old, South, Old"',         players: 'Bill / Charlie / Buddy',              location: 'Myrtle Beach, SC' },
          ].map((entry, i) => (
            <div key={entry.year} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid #21262d' }}>
              <div style={{ minWidth: 46, textAlign: 'center' as const }}>
                <div style={{ color: i === 0 ? '#f59e0b' : '#8b949e', fontWeight: 800, fontSize: 16 }}>{entry.year}</div>
                {i === 0 && <div style={{ color: '#f59e0b', fontSize: 9 }}>★ LATEST</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#e6edf3', fontWeight: 600, fontSize: 14 }}>{entry.team}</div>
                <div style={{ color: '#8b949e', fontSize: 12, marginTop: 2 }}>{entry.players}</div>
                <div style={{ color: '#374151', fontSize: 11, marginTop: 1 }}>📍 {entry.location}</div>
              </div>
            </div>
          ))}
        </>)}
      </div>

      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>
    </div>
  )
}
