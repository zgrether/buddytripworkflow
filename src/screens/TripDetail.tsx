import { useState } from 'react'
import { MapPin, Users, Calendar, ChevronRight, Trophy, Plus, MoreHorizontal, Check, X, Swords, Pencil, Trash2 } from 'lucide-react'
import { Screen, ViewerRole } from '../App'
import { MOCK_TRIPS, TRIP_COMMENTS, RESERVATIONS, EXPENSES, DATE_VOTES, CURRENT_USER, BBMI_EVENT } from '../data/mockData'
import { TopNav, Breadcrumb, Card, Btn, Avatar, RoleBadge, SectionLabel, TabBar, BottomNav } from '../components/ui'

const RES_ICONS: Record<string, string> = {
  accommodation: '🏨', 'tee-time': '⛳', restaurant: '🍽️',
  transportation: '🚗', activity: '🎯', show: '🎭', other: '📋',
}

function fmtDate(d: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(d).toLocaleDateString('en-US', opts || { weekday: 'short', month: 'short', day: 'numeric' })
}

// ── Location hero — SVG state silhouette ──────────────────────────

const STATE_PATHS: Record<string, { path: string; vb: string; pinX: number; pinY: number; label: string }> = {
  OR: {
    label: 'Oregon',
    vb: '0 0 200 220',
    pinX: 55, pinY: 175,
    path: 'M 170,10 L 185,10 L 190,30 L 188,80 L 190,120 L 185,160 L 160,165 L 130,168 L 80,170 L 40,172 L 10,168 L 8,140 L 5,100 L 8,60 L 12,20 L 50,14 L 100,10 Z',
  },
  AZ: {
    label: 'Arizona',
    vb: '0 0 180 200',
    pinX: 90, pinY: 100,
    path: 'M 20,10 L 160,10 L 165,80 L 162,120 L 155,165 L 100,170 L 60,165 L 20,155 L 15,100 L 18,50 Z',
  },
}

function LocationHero({ location }: { location: string }) {
  const stateCode = location.includes('OR') ? 'OR' : location.includes('AZ') ? 'AZ' : null
  const city = location.split(',')[0].trim()
  const s = stateCode ? STATE_PATHS[stateCode] : null

  if (!s) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: 'var(--bt-base)', border: '1px solid var(--bt-border)' }}>
      <svg width="48" height="52" viewBox={s.vb} style={{ flexShrink: 0 }}>
        <path d={s.path} fill="none" stroke="var(--bt-accent)" strokeWidth="2.5" strokeLinejoin="round" opacity="0.5" />
        {/* Pin */}
        <circle cx={s.pinX} cy={s.pinY} r="5" fill="var(--bt-accent)" />
        <circle cx={s.pinX} cy={s.pinY} r="9" fill="none" stroke="var(--bt-accent)" strokeWidth="1.5" opacity="0.4" />
      </svg>
      <div>
        <div className="text-sm font-semibold" style={{ color: 'var(--bt-text-1)' }}>{city}</div>
        <div className="text-xs" style={{ color: 'var(--bt-text-3)' }}>{s.label}</div>
      </div>
    </div>
  )
}

// ── Quick Info tiles ─────────────────────────────────────────────

type InfoTile = { id: string; label: string; value: string }

const DEFAULT_TILES: Record<string, InfoTile[]> = {
  'trip-bbmi-live': [
    { id: 't1', label: 'Lodge Door Code', value: '4892' },
    { id: 't2', label: 'First Tee Time',  value: '8:00 AM' },
    { id: 't3', label: 'Dinner Res',      value: '7:00 PM Gallery' },
  ],
}

function QuickInfoTiles({ isOwner, tripId }: { isOwner: boolean; tripId: string }) {
  const [tiles, setTiles] = useState<InfoTile[]>(DEFAULT_TILES[tripId] || [])
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ label: '', value: '' })

  const save = () => {
    if (!draft.label.trim() || !draft.value.trim()) return
    if (editing) {
      setTiles(ts => ts.map(t => t.id === editing ? { ...t, ...draft } : t))
      setEditing(null)
    } else {
      setTiles(ts => [...ts, { id: `t${Date.now()}`, ...draft }])
      setAdding(false)
    }
    setDraft({ label: '', value: '' })
  }

  const startEdit = (tile: InfoTile) => {
    setDraft({ label: tile.label, value: tile.value })
    setEditing(tile.id)
    setAdding(false)
  }

  const remove = (id: string) => setTiles(ts => ts.filter(t => t.id !== id))

  if (tiles.length === 0 && !isOwner) return null

  return (
    <div className="mb-2">
      <div className="flex flex-wrap gap-2">
        {tiles.map(tile => (
          <div key={tile.id}
            className="relative group flex-shrink-0 rounded-xl px-3 py-2.5"
            style={{ background: 'var(--bt-card)', border: '1px solid var(--bt-border)', flex: '1 1 calc(33% - 8px)', maxWidth: '160px', minWidth: '90px' }}>
            <div className="text-xs mb-1 truncate uppercase tracking-wide font-semibold" style={{ color: 'var(--bt-text-3)' }}>{tile.label}</div>
            <div className="font-mono font-bold text-base leading-tight" style={{ color: 'var(--bt-accent)' }}>{tile.value}</div>
            {isOwner && editing !== tile.id && (
              <div className="absolute top-1.5 right-1.5 hidden group-hover:flex gap-1">
                <button onClick={() => startEdit(tile)}
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ background: 'var(--bt-base)', border: '1px solid var(--bt-border)', cursor: 'pointer' }}>
                  <Pencil size={10} style={{ color: 'var(--bt-text-3)' }} />
                </button>
                <button onClick={() => remove(tile.id)}
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ background: 'var(--bt-base)', border: '1px solid var(--bt-border)', cursor: 'pointer' }}>
                  <Trash2 size={10} style={{ color: 'var(--bt-danger)' }} />
                </button>
              </div>
            )}
          </div>
        ))}

        {isOwner && !adding && !editing && (
          <button onClick={() => { setAdding(true); setDraft({ label: '', value: '' }) }}
            className="flex-shrink-0 rounded-xl px-3 py-2.5 flex flex-col items-center justify-center gap-1"
            style={{ background: 'transparent', border: '1px dashed var(--bt-border)', cursor: 'pointer', flex: '0 0 72px', minHeight: 64 }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--bt-accent)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--bt-border)')}>
            <Plus size={14} style={{ color: 'var(--bt-text-3)' }} />
            <span className="text-xs" style={{ color: 'var(--bt-text-3)' }}>Add</span>
          </button>
        )}
      </div>

      {(adding || editing) && (
        <div className="mt-2 flex gap-2 items-end p-3 rounded-xl"
          style={{ background: 'var(--bt-card)', border: '1px solid var(--bt-accent)40' }}>
          <div className="flex-1 flex flex-col gap-2">
            <input value={draft.label} onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
              placeholder="Label (e.g. Door Code)" autoFocus
              className="text-xs px-2.5 py-1.5 rounded-lg outline-none"
              style={{ background: 'var(--bt-base)', border: '1px solid var(--bt-border)', color: 'var(--bt-text-1)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--bt-accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--bt-border)')} />
            <input value={draft.value} onChange={e => setDraft(d => ({ ...d, value: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && save()}
              placeholder="Value (e.g. 4892)"
              className="text-xs px-2.5 py-1.5 rounded-lg outline-none"
              style={{ background: 'var(--bt-base)', border: '1px solid var(--bt-border)', color: 'var(--bt-text-1)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--bt-accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--bt-border)')} />
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <button onClick={save}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--bt-accent)', color: '#0d1117', border: 'none', cursor: 'pointer' }}>
              Save
            </button>
            <button onClick={() => { setAdding(false); setEditing(null); setDraft({ label: '', value: '' }) }}
              className="px-2 py-1.5 rounded-lg text-xs"
              style={{ background: 'transparent', border: '1px solid var(--bt-border)', color: 'var(--bt-text-3)', cursor: 'pointer' }}>
              <X size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Home tab ──────────────────────────────────────────────────────

function HomeTab({ trip, navigate, showToast, viewerRole }: {
  trip: any; navigate: (s: Screen, e?: any) => void; showToast: (m: string) => void; viewerRole: ViewerRole
}) {
  const [showAddComp, setShowAddComp] = useState(false)
  const [hasCompetition, setHasCompetition] = useState(!!trip.eventId)
  const isOwner = viewerRole === 'owner'
  const canEdit = viewerRole === 'owner' || viewerRole === 'planner'
  const isLive = trip.status === 'active'
  const ev = (isLive || hasCompetition) ? BBMI_EVENT : null
  const scores: Record<string, number> = { 'team-a': 6.5, 'team-b': 8.5 }

  return (
    <div className="flex flex-col gap-4">

      {/* Competition hero — live scoreboard OR add competition CTA */}
      {hasCompetition && ev ? (
        <div onClick={() => navigate('live-leaderboard')}
          className="rounded-xl cursor-pointer overflow-hidden"
          style={{ background: '#0a1a14', border: '1px solid var(--bt-accent)40' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--bt-accent)80')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--bt-accent)40')}>
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--bt-accent)20' }}>
            <div className="flex items-center gap-2">
              {isLive && <span className="inline-block w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--bt-accent)' }} />}
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--bt-accent)' }}>
                {isLive ? 'Competition Live · Day 3 of 4' : 'Competition · ' + ev.title}
              </span>
            </div>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bt-accent)' }}>
              Leaderboard <ChevronRight size={12} />
            </span>
          </div>
          <div className="px-4 py-4 flex items-center justify-around">
            {ev.teams.map((team, i) => {
              const score = i === 0 ? scores['team-a'] : scores['team-b']
              const isLeading = score > (i === 0 ? scores['team-b'] : scores['team-a'])
              return (
                <div key={team._id} className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ color: team.color, background: `${team.color}18`, border: `1px solid ${team.color}40` }}>
                    {team.shortName}
                  </span>
                  <span className="text-3xl font-black tabular-nums"
                    style={{ color: isLeading ? 'var(--bt-text-1)' : 'var(--bt-text-3)' }}>
                    {score}
                  </span>
                  {isLeading && <span className="text-xs font-semibold" style={{ color: 'var(--bt-accent)' }}>Leading</span>}
                </div>
              )
            })}
          </div>
        </div>
      ) : canEdit ? (
        <button onClick={() => setShowAddComp(true)}
          className="w-full rounded-xl p-4 text-left cursor-pointer"
          style={{ background: 'var(--bt-card)', border: '1px dashed var(--bt-accent)40' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--bt-accent)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--bt-accent)40')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--bt-tag-bg)', border: '1px solid var(--bt-accent)40' }}>
              <Swords size={18} style={{ color: 'var(--bt-accent)' }} />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--bt-text-1)' }}>Add a Competition</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--bt-text-3)' }}>
                Your group already has a rivalry. Give it a scoreboard.
              </div>
            </div>
            <ChevronRight size={16} className="ml-auto flex-shrink-0" style={{ color: 'var(--bt-text-3)' }} />
          </div>
        </button>
      ) : null}

      {/* Quick Info tiles */}
      <QuickInfoTiles isOwner={isOwner} tripId={trip._id} />

      {/* Destination voting */}
      {trip.comparisonMode && (
        <div onClick={() => navigate('idea-comparison', { tripId: trip._id })}
          className="flex items-center gap-3 p-4 rounded-xl cursor-pointer"
          style={{ background: 'var(--bt-tag-bg)', border: '1px solid var(--bt-accent)30' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--bt-accent)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--bt-accent)30')}>
          <span className="text-2xl">🗺️</span>
          <div className="flex-1">
            <div className="font-semibold text-sm" style={{ color: 'var(--bt-accent)' }}>Choose a Destination</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--bt-text-3)' }}>{trip.ideas.length} ideas · Voting open</div>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--bt-text-3)' }} />
        </div>
      )}

      {/* About */}
      <Card>
        <SectionLabel>About</SectionLabel>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--bt-text-1)' }}>
          {trip.description || 'No description yet.'}
        </p>
        {trip.golfCourses?.length > 0 && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--bt-border)' }}>
            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--bt-text-3)' }}>Golf Courses</div>
            <div className="flex flex-wrap gap-1.5">
              {trip.golfCourses.map((c: string) => (
                <span key={c} className="text-xs px-2 py-1 rounded-full"
                  style={{ background: 'var(--bt-tag-bg)', color: 'var(--bt-accent)', border: '1px solid var(--bt-accent)30' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
        {trip.activities?.length > 0 && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--bt-border)' }}>
            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--bt-text-3)' }}>Activities</div>
            <div className="flex flex-wrap gap-1.5">
              {trip.activities.map((a: string) => (
                <span key={a} className="text-xs px-2 py-1 rounded-full"
                  style={{ background: 'var(--bt-card)', color: 'var(--bt-text-2)', border: '1px solid var(--bt-border)' }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
        {trip.notes && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--bt-border)' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--bt-text-3)' }}>Trip Notes</div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--bt-text-2)' }}>{trip.notes}</p>
          </div>
        )}
      </Card>

      {/* Quick details */}
      <Card>
        <SectionLabel>Details</SectionLabel>
        {[
          { label: 'Status', val: trip.status.charAt(0).toUpperCase() + trip.status.slice(1) },
          { label: 'Dates', val: trip.startDate ? `${fmtDate(trip.startDate, { month: 'short', day: 'numeric' })} – ${fmtDate(trip.endDate, { month: 'short', day: 'numeric', year: '2-digit' })}` : 'TBD' },
          { label: 'Players', val: `${trip.attendees.filter((a: any) => a.status === 'in').length} confirmed / ${trip.attendees.length} invited` },
          { label: 'Cost', val: trip.costTier || 'TBD' },
        ].map(row => (
          <div key={row.label} className="flex justify-between text-sm py-2.5 border-b last:border-b-0" style={{ borderColor: 'var(--bt-border)' }}>
            <span style={{ color: 'var(--bt-text-3)' }}>{row.label}</span>
            <span className="font-medium" style={{ color: 'var(--bt-text-1)' }}>{row.val}</span>
          </div>
        ))}
      </Card>

      {showAddComp && (
        <AddCompetitionModal
          trip={trip}
          onClose={() => setShowAddComp(false)}
          onDone={() => { setHasCompetition(true); setShowAddComp(false) }}
          showToast={showToast}
        />
      )}
    </div>
  )
}

// ── Schedule tab ──────────────────────────────────────────────────

function ScheduleTab({ trip, showToast, canEdit }: { trip: any; showToast: (m: string) => void; canEdit: boolean }) {
  const reservations = RESERVATIONS.filter(r => r.tripId === trip._id)
  const dateVotes = DATE_VOTES.filter(v => v.tripId === trip._id)
  const getDateScore = (idx: number) => {
    const vs = dateVotes.filter(v => v.proposedDateIndex === idx)
    return { yes: vs.filter(v => v.availability === 'yes').length, maybe: vs.filter(v => v.availability === 'maybe').length, no: vs.filter(v => v.availability === 'no').length }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Bookings & Tee Times</SectionLabel>
          {canEdit && <Btn variant="secondary" onClick={() => showToast('Add booking — coming soon')}><Plus size={13} /> Add</Btn>}
        </div>
        {reservations.length === 0 ? (
          <Card><div className="text-center py-8 text-sm" style={{ color: 'var(--bt-text-3)' }}>No bookings yet</div></Card>
        ) : (
          <div className="flex flex-col gap-2">
            {reservations.map(r => (
              <Card key={r._id} className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0 mt-0.5">{RES_ICONS[r.type] || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--bt-text-1)' }}>{r.title}</div>
                  <div className="text-xs mb-1.5" style={{ color: 'var(--bt-text-3)' }}>
                    {fmtDate(r.date)}{r.startTime && ` · ${r.startTime}`}
                  </div>
                  {r.confirmationNumber && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'var(--bt-tag-bg)', color: 'var(--bt-accent)' }}>
                      #{r.confirmationNumber}
                    </span>
                  )}
                  {r.notes && <div className="text-xs mt-1.5" style={{ color: 'var(--bt-text-3)' }}>{r.notes}</div>}
                </div>
                {r.cost > 0 && <div className="font-bold text-sm flex-shrink-0" style={{ color: 'var(--bt-text-1)' }}>${r.cost.toLocaleString()}</div>}
              </Card>
            ))}
          </div>
        )}
      </div>
      {trip.proposedDates?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Date Voting</SectionLabel>
            {canEdit && <Btn variant="secondary" onClick={() => showToast('Propose date')}><Plus size={13} /> Propose</Btn>}
          </div>
          <div className="flex flex-col gap-2">
            {trip.proposedDates.map((pd: any, idx: number) => {
              const s = getDateScore(idx); const n = trip.attendees.length || 1
              const pct = Math.round((s.yes / n) * 100); const best = idx === 1
              return (
                <Card key={idx} style={{ border: `1px solid ${best ? 'var(--bt-accent)50' : 'var(--bt-border)'}` }}>
                  {best && <div className="text-xs font-bold mb-2" style={{ color: 'var(--bt-accent)' }}>✓ Best availability</div>}
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-semibold text-sm" style={{ color: 'var(--bt-text-1)' }}>
                      {fmtDate(pd.start, { month: 'short', day: 'numeric' })} – {fmtDate(pd.end, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <span className="font-bold" style={{ color: pct >= 60 ? 'var(--bt-accent)' : 'var(--bt-text-2)' }}>{pct}%</span>
                  </div>
                  <div className="flex h-1.5 rounded-full overflow-hidden mb-2.5" style={{ background: 'var(--bt-base)' }}>
                    <div style={{ width: `${(s.yes/n)*100}%`, background: 'var(--bt-accent)' }} />
                    <div style={{ width: `${(s.maybe/n)*100}%`, background: '#f59e0b' }} />
                    <div style={{ width: `${(s.no/n)*100}%`, background: 'var(--bt-danger)' }} />
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span style={{ color: 'var(--bt-accent)' }}>✓ {s.yes} yes</span>
                    <span style={{ color: '#f59e0b' }}>~ {s.maybe} maybe</span>
                    <span style={{ color: 'var(--bt-danger)' }}>✗ {s.no} no</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Crew tab ──────────────────────────────────────────────────────

function CrewTab({ trip, showToast, viewerRole }: { trip: any; showToast: (m: string) => void; viewerRole: ViewerRole }) {
  const isOwner = viewerRole === 'owner'
  const canEdit = viewerRole === 'owner' || viewerRole === 'planner'
  const confirmed = trip.attendees.filter((a: any) => a.status === 'in')
  const pending   = trip.attendees.filter((a: any) => a.status !== 'in')

  // Show team assignment if competition exists
  const hasTeams = !!trip.eventId
  const getTeam = (userId: string) => {
    const p = BBMI_EVENT.players.find(p => p._id === userId)
    if (!p) return null
    return BBMI_EVENT.teams.find(t => t._id === p.teamId)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Roster-in-flux notice when destination isn't locked */}
      {trip.comparisonMode && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: '#1a1200', border: '1px solid #f59e0b30' }}>
          <span className="text-base flex-shrink-0 mt-0.5">🗺️</span>
          <div>
            <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>Destination not locked yet</span>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--bt-text-3)' }}>
              The roster is still in flux. Hold off on formal invites until dates and location are confirmed.
            </p>
          </div>
        </div>
      )}
      {canEdit && (
        <Card>
          <SectionLabel>Invite Someone</SectionLabel>
          <p className="text-xs mb-3" style={{ color: 'var(--bt-text-3)' }}>
            They'll join as a Member. You can promote them to Planner after they accept.
          </p>
          <div className="flex gap-2">
            <input placeholder="Name or email"
              className="flex-1 text-sm px-3 py-2 rounded-lg outline-none"
              style={{ background: 'var(--bt-input)', border: '1px solid var(--bt-border-input)', color: 'var(--bt-text-1)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--bt-accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--bt-border-input)')} />
            <button onClick={() => showToast('Invite sent!')}
              className="text-sm font-semibold px-4 py-2 rounded-lg flex-shrink-0"
              style={{ background: 'var(--bt-accent)', color: '#0d1117', border: 'none', cursor: 'pointer' }}>
              Invite
            </button>
          </div>
        </Card>
      )}

      <div>
        <SectionLabel>Confirmed ({confirmed.length})</SectionLabel>
        <div className="flex flex-col gap-1">
          {confirmed.map((a: any, i: number) => {
            const team = hasTeams ? getTeam(a.userId) : null
            const isMe = a.userId === 'zach' || a.userId === CURRENT_USER._id
            return (
              <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-lg"
                style={{ background: isMe ? 'var(--bt-tag-bg)20' : 'transparent' }}>
                <Avatar name={a.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: 'var(--bt-text-1)' }}>{a.name}</span>
                    <RoleBadge role={a.role} />
                    {team && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={{ color: team.color, background: `${team.color}18`, border: `1px solid ${team.color}40` }}>
                        {team.shortName}
                      </span>
                    )}
                  </div>
                </div>
                {isOwner && (
                  <button onClick={() => showToast('Role menu — coming soon')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bt-text-3)' }}>
                    <MoreHorizontal size={15} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {pending.length > 0 && (
        <div>
          <SectionLabel>Pending ({pending.length})</SectionLabel>
          <div className="flex flex-col gap-1">
            {pending.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-lg">
                <Avatar name={a.name} size="sm" />
                <div className="flex-1">
                  <span className="text-sm" style={{ color: 'var(--bt-text-2)' }}>{a.name}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                  style={{ background: a.status === 'likely' ? '#1a1a0d' : 'var(--bt-card)', color: a.status === 'likely' ? '#f59e0b' : 'var(--bt-text-3)', border: `1px solid ${a.status === 'likely' ? '#f59e0b30' : 'var(--bt-border)'}` }}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── More tab ──────────────────────────────────────────────────────

function ExpenseRow({ exp, attendees, isOwner }: { exp: any; attendees: any[]; isOwner: boolean }) {
  const [editing, setEditing] = useState(false)

  const nicknameToUserId = (nickname: string) => {
    const match = attendees.find((a: any) =>
      a.name.split(' ')[0] === nickname || a.userId === nickname || a.name === nickname
    )
    return match?.userId ?? nickname
  }

  const allIds = new Set(attendees.map((a: any) => a.userId))
  const initialIds = exp.splitAmong?.length
    ? new Set(exp.splitAmong.map((s: any) => nicknameToUserId(s.name)))
    : allIds

  const [assigned, setAssigned] = useState<Set<string>>(initialIds)

  const toggle = (userId: string) => {
    setAssigned(prev => {
      const next = new Set(prev)
      if (next.has(userId)) { if (next.size > 1) next.delete(userId) }
      else next.add(userId)
      return next
    })
  }

  const perPerson = assigned.size > 0 ? Math.round(exp.amount / assigned.size) : 0

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--bt-text-1)' }}>{exp.title}</div>
          <div className="text-xs" style={{ color: 'var(--bt-text-3)' }}>
            Paid by {exp.paidByName} · {assigned.size} of {attendees.length} people
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className="font-bold text-sm" style={{ color: 'var(--bt-text-1)' }}>${exp.amount.toLocaleString()}</div>
            <div className="text-xs" style={{ color: 'var(--bt-text-3)' }}>${perPerson}/ea</div>
          </div>
          {isOwner && (
            <button onClick={() => setEditing(e => !e)}
              className="text-xs px-2 py-1 rounded"
              style={{ background: editing ? 'var(--bt-tag-bg)' : 'transparent', border: `1px solid ${editing ? 'var(--bt-accent)50' : 'var(--bt-border)'}`, color: editing ? 'var(--bt-accent)' : 'var(--bt-text-3)', cursor: 'pointer' }}>
              {editing ? 'Done' : 'Edit'}
            </button>
          )}
        </div>
      </div>
      {editing && (
        <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: 'var(--bt-border)', background: '#0d1117' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bt-text-3)' }}>Assign to</span>
            <div className="flex gap-2">
              <button onClick={() => setAssigned(new Set(attendees.map((a: any) => a.userId)))}
                className="text-xs px-2 py-0.5 rounded"
                style={{ background: 'none', border: '1px solid var(--bt-border)', color: 'var(--bt-text-3)', cursor: 'pointer' }}>All</button>
              <button onClick={() => setAssigned(new Set())}
                className="text-xs px-2 py-0.5 rounded"
                style={{ background: 'none', border: '1px solid var(--bt-border)', color: 'var(--bt-text-3)', cursor: 'pointer' }}>None</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {attendees.map((a: any) => {
              const isChecked = assigned.has(a.userId)
              return (
                <button key={a.userId} onClick={() => toggle(a.userId)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left"
                  style={{ background: isChecked ? 'var(--bt-tag-bg)' : 'transparent', border: `1px solid ${isChecked ? 'var(--bt-accent)30' : 'var(--bt-border)'}`, cursor: 'pointer' }}>
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: isChecked ? 'var(--bt-accent)' : 'transparent', border: `1.5px solid ${isChecked ? 'var(--bt-accent)' : 'var(--bt-border)'}` }}>
                    {isChecked && <Check size={10} color="#0d1117" strokeWidth={3} />}
                  </div>
                  <span className="text-xs truncate" style={{ color: isChecked ? 'var(--bt-text-1)' : 'var(--bt-text-3)' }}>
                    {a.name.split(' ')[0]}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 text-xs text-right font-semibold" style={{ color: 'var(--bt-accent)' }}>
            ${perPerson}/ea · {assigned.size} people
          </div>
        </div>
      )}
    </Card>
  )
}

function MoreTab({ trip, showToast, viewerRole }: { trip: any; showToast: (m: string) => void; viewerRole: ViewerRole }) {
  const isOwner = viewerRole === 'owner'
  const expenses = EXPENSES.filter(e => e.tripId === trip._id)
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const myShare = Math.round(total / (trip.attendees.length || 1))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Expenses</SectionLabel>
          <Btn variant="secondary" onClick={() => showToast('Add expense — coming soon')}><Plus size={13} /> Add</Btn>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[{ label: 'Trip Total', val: `$${total.toLocaleString()}`, accent: false }, { label: 'Your Share', val: `$${myShare.toLocaleString()}`, accent: true }].map(s => (
            <Card key={s.label} className="text-center">
              <div className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bt-text-3)' }}>{s.label}</div>
              <div className="text-xl font-bold" style={{ color: s.accent ? 'var(--bt-accent)' : 'var(--bt-text-1)' }}>{s.val}</div>
            </Card>
          ))}
        </div>
        {expenses.length === 0
          ? <Card><div className="text-center py-6 text-sm" style={{ color: 'var(--bt-text-3)' }}>No expenses yet</div></Card>
          : <div className="flex flex-col gap-2">{expenses.map(exp => <ExpenseRow key={exp._id} exp={exp} attendees={trip.attendees} isOwner={isOwner} />)}</div>
        }
      </div>

      {isOwner && (
        <Card style={{ border: '1px solid var(--bt-danger-border)' }}>
          <SectionLabel>Trip Settings</SectionLabel>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Assign to a Series', action: 'Link to BBMI series — coming soon' },
              { label: 'Transfer Ownership', action: 'Transfer ownership — coming soon' },
              { label: 'Archive Trip', action: 'Trip archived' },
            ].map(item => (
              <button key={item.label} onClick={() => showToast(item.action)}
                className="text-sm font-medium px-4 py-2.5 rounded-lg text-left w-full"
                style={{ background: 'transparent', border: '1px solid var(--bt-border)', color: 'var(--bt-text-1)', cursor: 'pointer' }}>
                {item.label}
              </button>
            ))}
            <button onClick={() => showToast('Delete trip — are you sure? (not implemented)')}
              className="text-sm font-semibold px-4 py-2.5 rounded-lg w-full"
              style={{ background: 'var(--bt-danger-bg)', color: 'var(--bt-danger)', border: '1px solid var(--bt-danger-border)', cursor: 'pointer' }}>
              Delete Trip
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────

export default function TripDetail({ navigate, showToast, tripId, viewerRole = 'planner' }: {
  navigate: (s: Screen, e?: any) => void
  showToast: (m: string) => void
  tripId?: string
  viewerRole?: ViewerRole
}) {
  const [tab, setTab] = useState('home')
  const trip: any = MOCK_TRIPS.find(t => t._id === tripId) || MOCK_TRIPS[0]
  const canEdit = viewerRole === 'owner' || viewerRole === 'planner'

  const tabs = [
    { id: 'home',     label: 'Home' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'crew',     label: 'Crew' },
    { id: 'more',     label: 'More' },
  ]

  return (
    <div className="min-h-screen pb-24 md:pb-0" style={{ background: 'var(--bt-base)' }}>
      <TopNav navigate={navigate} />
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-5">
        <Breadcrumb items={[{ label: 'Trips', screen: 'trips' }, { label: trip.title }]} navigate={navigate} />

        {/* Trip header card */}
        <div className="relative rounded-xl overflow-hidden mb-5 px-4 py-4"
          style={{ background: 'var(--bt-card)', border: '1px solid var(--bt-border)' }}>

          {/* State silhouette — top right corner */}
          {(() => {
            const stateCode = (trip.location || '').includes('OR') ? 'OR' : (trip.location || '').includes('AZ') ? 'AZ' : null
            const s = stateCode ? STATE_PATHS[stateCode] : null
            if (!s) return null
            return (
              <div className="absolute right-3 top-3 opacity-20 pointer-events-none">
                <svg width="52" height="58" viewBox={s.vb}>
                  <path d={s.path} fill="var(--bt-accent)" stroke="var(--bt-accent)" strokeWidth="1.5" strokeLinejoin="round" />
                  <circle cx={s.pinX} cy={s.pinY} r="6" fill="var(--bt-base)" />
                  <circle cx={s.pinX} cy={s.pinY} r="4" fill="var(--bt-accent)" />
                </svg>
              </div>
            )
          })()}

          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5 pr-14">
            <h1 className="text-xl font-bold" style={{ color: 'var(--bt-text-1)' }}>{trip.title}</h1>
            {trip.description && (
              <span className="text-sm font-normal hidden sm:inline" style={{ color: 'var(--bt-text-3)' }}>
                {trip.description.split('.')[0]}
              </span>
            )}
            {trip.costTier && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ background: '#1a1200', color: '#facc15', border: '1px solid #facc1540' }}>
                {trip.costTier}
              </span>
            )}
            {trip.status === 'active' && (
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: 'var(--bt-tag-bg)', color: 'var(--bt-accent)', border: '1px solid var(--bt-accent)40' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--bt-accent)' }} />
                LIVE
              </span>
            )}
          </div>

          {/* Location */}
          {trip.location && (
            <div className="flex items-center gap-1.5 text-sm mb-1" style={{ color: 'var(--bt-text-2)' }}>
              <MapPin size={13} />
              {trip.location}
            </div>
          )}

          {/* Dates + meta */}
          <div className="flex items-center gap-3 flex-wrap text-xs" style={{ color: 'var(--bt-text-3)' }}>
            {trip.startDate && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {fmtDate(trip.startDate, { weekday: 'short', month: 'short', day: 'numeric' })} – {fmtDate(trip.endDate, { weekday: 'short', month: 'short', day: 'numeric' })}
                {trip.startDate && trip.endDate && (() => {
                  const nights = Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000)
                  return nights > 0 ? ` · ${nights} night${nights !== 1 ? 's' : ''}` : null
                })()}
              </span>
            )}
            {trip.eventId && (
              <span className="flex items-center gap-1">
                <Trophy size={11} />
                Competition active
              </span>
            )}
          </div>

          {/* Cost estimate if available */}
          {trip.costTier && (
            <div className="text-xs mt-1.5" style={{ color: 'var(--bt-text-3)' }}>
              $ {trip.costTier === '$$$' ? 'Premium (up to $2,000/person)' : trip.costTier === '$$$$' ? 'Luxury ($2,000+/person)' : 'Moderate'} — est. per person excl. airfare
            </div>
          )}
        </div>

        <TabBar tabs={tabs} active={tab} onChange={setTab} />

        {tab === 'home'     && <HomeTab     trip={trip} navigate={navigate} showToast={showToast} viewerRole={viewerRole} />}
        {tab === 'schedule' && <ScheduleTab trip={trip} showToast={showToast} canEdit={canEdit} />}
        {tab === 'crew'     && <CrewTab     trip={trip} showToast={showToast} viewerRole={viewerRole} />}
        {tab === 'more'     && <MoreTab     trip={trip} showToast={showToast} viewerRole={viewerRole} />}
      </div>
      <BottomNav active="trips" navigate={navigate} />
    </div>
  )
}
