import { useState } from 'react'
import { BBMI_EVENT, LIVE_SCORES, SABOTAGE_USED, CURRENT_USER } from '../data/mockData'

const SABOTAGE_DEFS = [
  { type: 'misdemeanor' as const, icon: '🕵️', label: 'Misdemeanor', short: 'M', desc: 'Move ball within same fairway/green' },
  { type: 'felony'      as const, icon: '💼', label: 'Felony',       short: 'F', desc: 'Steal 3 clubs for one hole' },
  { type: 'capital'     as const, icon: '☠️', label: 'Capital',      short: 'C', desc: 'Force shot to be replayed' },
]

function vsParLabel(score: number, par: number) {
  const d = score - par
  if (d <= -2) return { text: 'Eagle', color: '#f59e0b' }
  if (d === -1) return { text: 'Birdie', color: '#00d4aa' }
  if (d === 0)  return { text: 'Par', color: '#8b949e' }
  if (d === 1)  return { text: 'Bogey', color: '#c0765a' }
  if (d === 2)  return { text: 'Dbl Bogey', color: '#a05540' }
  return { text: `+${d}`, color: '#991b1b' }
}

export default function LiveScoreEntry({ onBack }: { onBack?: () => void }) {
  const round = BBMI_EVENT.rounds.find(r => r.status === 'active')!
  const myGroup = BBMI_EVENT.groups.find(g => g.playerIds.includes('p-zach'))!
  const groupPlayers = BBMI_EVENT.players.filter(p => myGroup.playerIds.includes(p._id))

  // Initialize scores from mock data, convert null→undefined
  const [scores, setScores] = useState<Record<string, (number | undefined)[]>>(() => {
    const s: Record<string, (number | undefined)[]> = {}
    groupPlayers.forEach(p => {
      s[p._id] = (LIVE_SCORES[p._id] || []).map(v => v === null ? undefined : v)
      // Pad to 18
      while (s[p._id].length < 18) s[p._id].push(undefined)
    })
    return s
  })

  const [currentHole, setCurrentHole] = useState(() => {
    // Start at first unplayed hole for current user
    const myScores = (LIVE_SCORES['p-zach'] || [])
    const first = myScores.findIndex(s => s === null)
    return first === -1 ? 0 : first
  })

  const [sabotageUsed, setSabotageUsed] = useState<Record<string, { type: string; targetId: string; hole: number }[]>>(() => {
    const s: Record<string, typeof SABOTAGE_USED[string]> = {}
    groupPlayers.forEach(p => { s[p._id] = [...(SABOTAGE_USED[p._id] || [])] })
    return s
  })

  const [showSabotage, setShowSabotage] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState('p-zach')
  const [showRules, setShowRules] = useState(false)

  const hole = round.holes[currentHole]
  const par = hole?.par ?? 4
  const isSabotage = round.format === 'sabotage'
  const currentNine = currentHole < 9 ? 0 : 1

  function setScore(playerId: string, val: number | undefined) {
    setScores(prev => {
      const arr = [...(prev[playerId] || [])]
      arr[currentHole] = val
      return { ...prev, [playerId]: arr }
    })
  }

  function addSabotage(attackerId: string, targetId: string, type: string) {
    setSabotageUsed(prev => ({
      ...prev,
      [attackerId]: [...(prev[attackerId] || []), { type, targetId, hole: currentHole + 1 }],
    }))
  }

  function canUseSabotage(attackerId: string, targetId: string, type: string) {
    const used = sabotageUsed[attackerId] || []
    const usedThisNine = used.filter(s => {
      const sNine = s.hole <= 9 ? 0 : 1
      return sNine === currentNine
    })
    // Max 3 per nine
    if (usedThisNine.length >= 3) return false
    // Only one of each type per nine
    if (usedThisNine.some(s => s.type === type)) return false
    // Same type, same target
    if (usedThisNine.some(s => s.type === type && s.targetId === targetId)) return false
    return true
  }

  function getSabotageCount(playerId: string) {
    const used = sabotageUsed[playerId] || []
    return used.filter(s => {
      const sNine = s.hole <= 9 ? 0 : 1
      return sNine === currentNine
    }).length
  }

  const teamColor = (teamId: string) => BBMI_EVENT.teams.find(t => t._id === teamId)?.color || '#666'
  const teamShort = (teamId: string) => BBMI_EVENT.teams.find(t => t._id === teamId)?.shortName || ''

  const allScoresEntered = groupPlayers.every(p => scores[p._id]?.[currentHole] !== undefined)
  const canGoNext = allScoresEntered && currentHole < 17
  const canGoPrev = currentHole > 0

  // Running totals vs par
  function runningTotal(playerId: string) {
    const s = scores[playerId] || []
    let total = 0
    for (let i = 0; i <= currentHole; i++) {
      if (s[i] !== undefined) total += (s[i] as number) - round.holes[i].par
    }
    return total
  }

  function scoreCell(val: number | undefined, par: number) {
    if (val === undefined) return null
    const diff = val - par
    if (diff <= -2) return { bg: '#f59e0b22', border: '#f59e0b', color: '#f59e0b' }   // eagle
    if (diff === -1) return { bg: '#00d4aa22', border: '#00d4aa', color: '#00d4aa' }  // birdie
    if (diff === 0)  return { bg: 'transparent', border: '#21262d', color: '#e6edf3' } // par
    if (diff === 1)  return { bg: '#c0765a22', border: '#c0765a', color: '#c0765a' }   // bogey
    return { bg: '#a0554020', border: '#a05540', color: '#a05540' }                   // double+
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #21262d', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#00d4aa', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>LIVE · {round.title.toUpperCase()}</div>
          <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: 15 }}>{round.course} · {myGroup.name}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isSabotage && (
            <button onClick={() => setShowRules(r => !r)}
              style={{ background: showRules ? '#f59e0b22' : '#161b22', border: '1px solid #f59e0b40', borderRadius: 6, color: '#f59e0b', padding: '6px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              📋 Rules
            </button>
          )}
        </div>
      </div>

      {/* Rules drawer */}
      {showRules && (
        <div style={{ background: '#1a1500', borderBottom: '1px solid #f59e0b40', padding: 14 }}>
          <div style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>💣 SABOTAGE RULES</div>
          {SABOTAGE_DEFS.map(s => (
            <div key={s.type} style={{ marginBottom: 8 }}>
              <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>{s.icon} {s.label}: </span>
              <span style={{ color: '#8b949e', fontSize: 12 }}>{s.desc}. Announce before acting.</span>
            </div>
          ))}
          <div style={{ color: '#6b7280', fontSize: 11, marginTop: 6 }}>3 per player per 9 · one of each type · cannot repeat type on same opponent same nine</div>
        </div>
      )}

      {/* Hole selector strip */}
      <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #21262d', background: '#0d1117', padding: '0 4px' }}>
        {round.holes.slice(0, 18).map((h, i) => {
          const allDone = groupPlayers.every(p => scores[p._id]?.[i] !== undefined)
          const isCurrent = i === currentHole
          const isDouble = round.modifiers.some(m => m.type === 'double' && m.holes.includes(h.hole))
          return (
            <button key={i} onClick={() => setCurrentHole(i)}
              style={{
                minWidth: 38, padding: '8px 4px', border: 'none', cursor: 'pointer', flexShrink: 0,
                background: isCurrent ? '#161b22' : 'transparent',
                borderBottom: `2px solid ${isCurrent ? '#00d4aa' : 'transparent'}`,
              }}>
              <div style={{ color: isCurrent ? '#00d4aa' : allDone ? '#e6edf3' : '#4a5568', fontSize: 11, fontWeight: isCurrent ? 700 : 400 }}>
                {isDouble ? '⚡' : ''}{i + 1}
              </div>
              <div style={{ color: '#4a5568', fontSize: 9 }}>P{h.par}</div>
            </button>
          )
        })}
      </div>

      {/* Main hole card */}
      <div style={{ padding: '16px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ color: '#8b949e', fontSize: 11, letterSpacing: 2 }}>HOLE</div>
              <div style={{ color: '#e6edf3', fontSize: 40, fontWeight: 900, lineHeight: 1 }}>{currentHole + 1}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#8b949e', fontSize: 11, letterSpacing: 2 }}>PAR</div>
              <div style={{ color: '#00d4aa', fontSize: 40, fontWeight: 900, lineHeight: 1 }}>{par}</div>
            </div>
          </div>

          {/* Modifiers on this hole */}
          {round.modifiers.filter(m => m.holes.includes(currentHole + 1)).map((m, i) => (
            <div key={i} style={{ background: '#0d1117', borderRadius: 6, padding: '6px 10px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12 }}>
                {m.type === 'ctp' ? '📍' : m.type === 'ld' ? '💨' : m.type === 'double' ? '⚡' : '✏️'}
              </span>
              <span style={{ color: '#f59e0b', fontSize: 12 }}>{m.label}</span>
            </div>
          ))}
        </div>

        {/* Score entry per player */}
        <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
          {groupPlayers.map(p => {
            const sc = scores[p._id]?.[currentHole]
            const style = scoreCell(sc, par)
            const rt = runningTotal(p._id)
            const diff = sc !== undefined ? sc - par : null
            return (
              <div key={p._id} style={{
                background: '#161b22',
                border: `1px solid ${style?.border || '#21262d'}`,
                borderRadius: 10, padding: '12px 14px',
                transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: teamColor(p.teamId), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0d1117', flexShrink: 0 }}>
                    {p.nickname.slice(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e6edf3', fontWeight: 600, fontSize: 14 }}>{p.nickname}</div>
                    <div style={{ color: '#8b949e', fontSize: 11 }}>{teamShort(p.teamId)} · Hcp {p.handicap}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: rt > 0 ? '#c0765a' : rt < 0 ? '#00d4aa' : '#8b949e', fontSize: 12, fontWeight: 600 }}>
                      {rt > 0 ? `+${rt}` : rt === 0 ? 'E' : rt}
                    </div>
                    <div style={{ color: '#4a5568', fontSize: 10 }}>thru {currentHole}</div>
                  </div>
                </div>

                {/* Score buttons */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button onClick={() => setScore(p._id, Math.max(1, (sc || par + 1) - 1))}
                    style={{ width: 36, height: 36, borderRadius: 8, background: '#21262d', border: 'none', color: '#e6edf3', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>−</button>
                  <div style={{
                    flex: 1, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, border: `1px solid ${style?.border || '#21262d'}`,
                    background: style?.bg || 'transparent',
                  }}>
                    <span style={{ color: style?.color || '#4a5568', fontSize: 20, fontWeight: 700 }}>
                      {sc !== undefined ? sc : '—'}
                    </span>
                    {diff !== null && (
                      <span style={{ color: style?.color || '#4a5568', fontSize: 11, marginLeft: 4 }}>
                        {diff === 0 ? '' : diff > 0 ? `+${diff}` : diff}
                      </span>
                    )}
                  </div>
                  <button onClick={() => setScore(p._id, (sc || par - 1) + 1)}
                    style={{ width: 36, height: 36, borderRadius: 8, background: '#21262d', border: 'none', color: '#e6edf3', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>+</button>

                  {/* Quick par / birdie / bogey */}
                  {[par - 1, par, par + 1].map(v => {
                    const label = v === par - 1 ? '-1' : v === par ? 'P' : '+1'
                    return (
                      <button key={v} onClick={() => setScore(p._id, v)}
                        style={{
                          width: 30, height: 36, borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                          background: sc === v ? (v < par ? '#00d4aa' : v === par ? '#21262d' : '#c0765a') : '#1a1f2b',
                          color: sc === v ? (v < par ? '#0d1117' : '#e6edf3') : '#6b7280',
                        }}>
                        {label}
                      </button>
                    )
                  })}
                </div>

                {sc !== undefined && (
                  <div style={{ textAlign: 'center', marginTop: 6 }}>
                    <span style={{ color: scoreCell(sc, par)?.color, fontSize: 11 }}>
                      {vsParLabel(sc, par).text}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Sabotage tracker */}
        {isSabotage && (
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => setShowSabotage(s => !s)}
              style={{
                width: '100%', background: showSabotage ? '#1a1500' : '#161b22',
                border: `1px solid ${showSabotage ? '#f59e0b40' : '#21262d'}`,
                borderRadius: 10, padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>💣</span>
                <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 14 }}>Sabotage Tracker</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {groupPlayers.map(p => {
                  const count = getSabotageCount(p._id)
                  return (
                    <span key={p._id} style={{ background: count >= 3 ? '#21262d' : '#f59e0b22', color: count >= 3 ? '#4a5568' : '#f59e0b', fontSize: 11, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                      {p.nickname.slice(0,2)}: {count}/3
                    </span>
                  )
                })}
              </div>
            </button>

            {showSabotage && (
              <div style={{ background: '#161b22', border: '1px solid #21262d', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderRadius: '0 0 10px 10px', borderTop: 'none', padding: 14 }}>
                {/* Attacker selector */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#8b949e', fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>MY PLAYER</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {groupPlayers.map(p => (
                      <button key={p._id} onClick={() => setSelectedPlayer(p._id)}
                        style={{
                          flex: 1, padding: '6px 4px', borderRadius: 6, border: `1px solid ${selectedPlayer === p._id ? teamColor(p.teamId) : '#21262d'}`,
                          background: selectedPlayer === p._id ? teamColor(p.teamId) + '22' : '#0d1117',
                          color: selectedPlayer === p._id ? '#e6edf3' : '#8b949e', fontSize: 12, cursor: 'pointer',
                        }}>
                        {p.nickname}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sabotage matrix */}
                <div style={{ color: '#8b949e', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>SABOTAGE LOG — {currentNine === 0 ? 'Front 9' : 'Back 9'}</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {groupPlayers.filter(p => p._id !== selectedPlayer).map(target => {
                    const used = (sabotageUsed[selectedPlayer] || []).filter(s => {
                      const sNine = s.hole <= 9 ? 0 : 1
                      return sNine === currentNine && s.targetId === target._id
                    })
                    return (
                      <div key={target._id} style={{ background: '#0d1117', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: teamColor(target.teamId), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#0d1117' }}>
                              {target.nickname.slice(0,2).toUpperCase()}
                            </div>
                            <span style={{ color: '#e6edf3', fontSize: 13 }}>{target.nickname}</span>
                          </div>
                          <span style={{ color: '#4a5568', fontSize: 11 }}>{used.length} used</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {SABOTAGE_DEFS.map(sd => {
                            const alreadyUsed = used.some(s => s.type === sd.type)
                            const canUse = canUseSabotage(selectedPlayer, target._id, sd.type)
                            return (
                              <button key={sd.type}
                                onClick={() => !alreadyUsed && canUse && addSabotage(selectedPlayer, target._id, sd.type)}
                                title={sd.desc}
                                style={{
                                  flex: 1, padding: '6px 4px', borderRadius: 6, cursor: alreadyUsed || !canUse ? 'not-allowed' : 'pointer',
                                  background: alreadyUsed ? '#21262d' : canUse ? '#1a1500' : '#161b22',
                                  border: `1px solid ${alreadyUsed ? '#374151' : canUse ? '#f59e0b60' : '#21262d'}`,
                                  color: alreadyUsed ? '#374151' : canUse ? '#f59e0b' : '#4a5568',
                                  fontSize: 11, fontWeight: 600, textDecoration: alreadyUsed ? 'line-through' : 'none',
                                  opacity: alreadyUsed ? 0.5 : 1,
                                }}>
                                {sd.icon} {sd.short}
                                {alreadyUsed && ' ✓'}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 10, color: '#4a5568', fontSize: 11 }}>
                  Tap to log a sabotage · Grayed = already used or limit reached
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scorecard mini-grid */}
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: 12, marginBottom: 20, overflowX: 'auto' }}>
          <div style={{ color: '#8b949e', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>SCORECARD</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
            <thead>
              <tr>
                <td style={{ color: '#4a5568', fontSize: 10, padding: '2px 4px', textAlign: 'left' }}>Player</td>
                {Array.from({ length: 9 }, (_, i) => (
                  <td key={i} style={{ color: i === currentHole % 9 && Math.floor(currentHole / 9) === 0 ? '#00d4aa' : '#4a5568', fontSize: 9, textAlign: 'center', padding: '2px 2px' }}>{i + 1}</td>
                ))}
                <td style={{ color: '#4a5568', fontSize: 9, textAlign: 'center', padding: '2px 4px' }}>Out</td>
              </tr>
            </thead>
            <tbody>
              {groupPlayers.map(p => {
                const frontScores = scores[p._id]?.slice(0, 9) || []
                const frontTotal = frontScores.reduce((s, v) => s + (v || 0), 0)
                return (
                  <tr key={p._id}>
                    <td style={{ color: '#e6edf3', fontSize: 10, padding: '3px 4px', fontWeight: 500 }}>{p.nickname}</td>
                    {frontScores.map((s, i) => {
                      const style = scoreCell(s, round.holes[i].par)
                      return (
                        <td key={i} style={{ textAlign: 'center', padding: '2px', cursor: 'pointer' }} onClick={() => setCurrentHole(i)}>
                          <div style={{
                            width: 20, height: 20, borderRadius: 3, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: style?.bg || 'transparent', border: `1px solid ${style?.border || '#21262d'}`,
                            color: style?.color || '#4a5568', fontSize: 9, fontWeight: 700,
                          }}>
                            {s !== undefined ? s : '·'}
                          </div>
                        </td>
                      )
                    })}
                    <td style={{ textAlign: 'center', color: '#e6edf3', fontSize: 10, fontWeight: 700 }}>{frontTotal || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => canGoPrev && setCurrentHole(h => h - 1)} disabled={!canGoPrev}
            style={{ flex: 1, background: canGoPrev ? '#161b22' : '#0d1117', border: `1px solid ${canGoPrev ? '#21262d' : '#161b22'}`, borderRadius: 8, color: canGoPrev ? '#e6edf3' : '#4a5568', padding: '12px', cursor: canGoPrev ? 'pointer' : 'not-allowed', fontSize: 14 }}>
            ← Hole {currentHole}
          </button>
          <button onClick={() => canGoNext && setCurrentHole(h => h + 1)} disabled={!canGoNext}
            style={{
              flex: 2, background: canGoNext ? '#00d4aa' : allScoresEntered && currentHole === 17 ? '#7c3aed' : '#21262d',
              border: 'none', borderRadius: 8, color: canGoNext ? '#0d1117' : '#4a5568',
              padding: '12px', cursor: canGoNext ? 'pointer' : 'default', fontSize: 14, fontWeight: 600,
            }}>
            {allScoresEntered && currentHole === 17 ? '🏁 Submit Round' : canGoNext ? `Hole ${currentHole + 2} →` : 'Enter all scores to continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
