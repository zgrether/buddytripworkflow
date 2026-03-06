import { useState } from 'react'
import { Screen } from '../App'
import { MOCK_TRIPS, TRIP_COMMENTS, RESERVATIONS, EXPENSES, DATE_VOTES, CURRENT_USER } from '../data/mockData'
import { TopNav, Breadcrumb, Card, Btn, Tag, Avatar, RoleBadge, SectionLabel, TabBar, Stepper, BottomNav } from '../components/ui'

const RES_ICONS: Record<string, string> = {
  accommodation: '🏨', 'tee-time': '⛳', restaurant: '🍽️',
  transportation: '🚗', activity: '🎯', show: '🎭', other: '📋'
}

export default function TripDetail({ navigate, showToast, tripId }: {
  navigate: (s: Screen, e?: any) => void
  showToast: (m: string) => void
  tripId?: string
}) {
  const [tab, setTab] = useState('overview')
  const [newMsg, setNewMsg] = useState('')
  const [comments, setComments] = useState(TRIP_COMMENTS)

  const trip: any = MOCK_TRIPS.find(t => t._id === (tripId || 'trip-2')) || MOCK_TRIPS[1]
  const reservations = RESERVATIONS.filter(r => r.tripId === trip._id)
  const expenses = EXPENSES.filter(e => e.tripId === trip._id)
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const myShare = Math.round(total / (trip.attendees.length || 1))
  const dateVotes = DATE_VOTES.filter(v => v.tripId === trip._id)

  const lifecycle = ['Idea', 'Planning', 'Active', 'Completed']
  const currentStep = { idea: 0, planning: 1, active: 2, completed: 3 }[trip.status] ?? 1

  const getDateScore = (idx: number) => {
    const vs = dateVotes.filter(v => v.proposedDateIndex === idx)
    return { yes: vs.filter(v => v.availability === 'yes').length, maybe: vs.filter(v => v.availability === 'maybe').length, no: vs.filter(v => v.availability === 'no').length }
  }

  const sendMessage = () => {
    if (!newMsg.trim()) return
    setComments(c => [...c, { _id: `m-${Date.now()}`, tripId: trip._id, userId: CURRENT_USER._id, userName: CURRENT_USER.firstName, text: newMsg.trim(), createdAt: new Date() }])
    setNewMsg('')
  }

  const mobilePrimaryTabs = [
    { id: 'chat',         label: '💬 Chat' },
    { id: 'reservations', label: '📋 Bookings' },
    { id: 'overview',     label: '📍 Overview' },
    { id: 'dates',        label: '📅 Dates' },
    { id: 'expenses',     label: '💰 Expenses' },
    { id: 'crew',         label: '👥 Crew' },
  ]

  const desktopTabs = [
    { id: 'overview',     label: 'Overview' },
    { id: 'dates',        label: 'Dates' },
    { id: 'reservations', label: 'Bookings' },
    { id: 'expenses',     label: 'Expenses' },
    { id: 'crew',         label: 'Crew' },
  ]

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: 'var(--bt-base)' }}>
      <TopNav navigate={navigate} />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7">
        <Breadcrumb items={[{ label: 'Dashboard', screen: 'trips' }, { label: trip.title }]} navigate={navigate} />

        {/* Trip header card */}
        <Card className="mb-4 relative overflow-hidden">
          {trip.imageUrl && (
            <div className="absolute right-0 top-0 bottom-0 w-28 md:w-40"
              style={{
                background: `url(${trip.imageUrl}) center/cover`,
                opacity: 0.12,
                maskImage: 'linear-gradient(to left, rgba(0,0,0,1), transparent)',
                WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1), transparent)',
              }} />
          )}
          <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-1.5" style={{ color: 'var(--bt-text-1)' }}>{trip.title}</h1>
              {trip.location && (
                <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--bt-text-2)' }}>
                  <span>📍</span>{trip.location}
                </div>
              )}
            </div>
            <button style={{ background: 'var(--bt-danger-bg)', color: 'var(--bt-danger)', border: `1px solid var(--bt-danger-border)`, borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
              🗑 Delete
            </button>
          </div>
        </Card>

        {/* Stepper */}
        <Card className="mb-4">
          <Stepper steps={lifecycle} current={currentStep} />
        </Card>

        {/* ── DESKTOP LAYOUT: main + chat sidebar ─────────────────── */}
        <div className="hidden md:flex gap-5">
          {/* Main panel */}
          <div className="flex-1 min-w-0">
            <TabBar tabs={desktopTabs} active={tab} onChange={setTab} />

            {/* Overview */}
            {tab === 'overview' && (
              <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2 flex flex-col gap-4">
                  <Card>
                    <SectionLabel>About this trip</SectionLabel>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--bt-text-1)' }}>{trip.description || 'No description yet.'}</p>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--bt-text-2)' }}>Activities</div>
                        <div className="flex flex-wrap gap-1.5">{trip.activities.map(a => <Tag key={a} label={a} onRemove={() => showToast('Removed')} />)}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--bt-text-2)' }}>Golf Courses</div>
                        <div className="flex flex-wrap gap-1.5">{trip.golfCourses.map(c => <Tag key={c} label={c} onRemove={() => showToast('Removed')} />)}</div>
                      </div>
                    </div>
                    {trip.accommodation && (
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--bt-border)' }}>
                        <div className="text-xs font-semibold mb-1" style={{ color: 'var(--bt-text-2)' }}>Accommodation</div>
                        <p className="text-sm" style={{ color: 'var(--bt-text-1)' }}>{trip.accommodation}</p>
                      </div>
                    )}
                    {trip.notes && (
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--bt-border)' }}>
                        <div className="text-xs font-semibold mb-1" style={{ color: 'var(--bt-text-2)' }}>Trip Tips</div>
                        <p className="text-sm" style={{ color: 'var(--bt-text-1)' }}>{trip.notes}</p>
                      </div>
                    )}
                  </Card>
                  {trip.comparisonMode && (
                    <div onClick={() => navigate('idea-comparison', { tripId: trip._id })}
                      className="flex items-center gap-3 p-4 rounded-xl cursor-pointer"
                      style={{ background: 'var(--bt-tag-bg)', border: `1px solid var(--bt-accent)40` }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--bt-accent)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--bt-accent)40')}>
                      <span className="text-2xl">🗺️</span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm" style={{ color: 'var(--bt-accent)' }}>Compare Destinations</div>
                        <div className="text-xs" style={{ color: 'var(--bt-text-3)' }}>{trip.ideas.length} ideas · Voting open</div>
                      </div>
                      <span style={{ color: 'var(--bt-text-3)' }}>→</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <Card>
                    <SectionLabel>Details</SectionLabel>
                    {[
                      { label: 'Status', val: trip.status.charAt(0).toUpperCase() + trip.status.slice(1) },
                      { label: 'Dates', val: trip.startDate ? `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(trip.endDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}` : 'TBD' },
                      { label: 'Cost', val: trip.costTier || 'TBD' },
                      { label: 'Confirmed', val: `${trip.attendees.filter(a => a.status === 'in').length} / ${trip.attendees.length}` },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between text-sm py-2 border-b last:border-b-0" style={{ borderColor: 'var(--bt-border)' }}>
                        <span style={{ color: 'var(--bt-text-3)' }}>{row.label}</span>
                        <span className="font-medium" style={{ color: 'var(--bt-text-1)' }}>{row.val}</span>
                      </div>
                    ))}
                  </Card>
                </div>
              </div>
            )}

            {/* Dates */}
            {tab === 'dates' && <DatesPanel trip={trip} dateVotes={dateVotes} getDateScore={getDateScore} showToast={showToast} />}

            {/* Bookings */}
            {tab === 'reservations' && <BookingsPanel reservations={reservations} showToast={showToast} />}

            {/* Expenses */}
            {tab === 'expenses' && <ExpensesPanel expenses={expenses} total={total} myShare={myShare} attendees={trip.attendees} showToast={showToast} />}

            {/* Crew */}
            {tab === 'crew' && <CrewPanel trip={trip} showToast={showToast} />}
          </div>

          {/* Chat sidebar — always visible on desktop */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-20">
              <ChatPanel comments={comments.filter(c => c.tripId === trip._id)} newMsg={newMsg} setNewMsg={setNewMsg} sendMessage={sendMessage} />
            </div>
          </div>
        </div>

        {/* ── MOBILE LAYOUT: tabs with chat first ─────────────────── */}
        <div className="block md:hidden">
          <TabBar tabs={mobilePrimaryTabs} active={tab} onChange={setTab} />

          {tab === 'chat'         && <ChatPanel comments={comments.filter(c => c.tripId === trip._id)} newMsg={newMsg} setNewMsg={setNewMsg} sendMessage={sendMessage} mobile />}
          {tab === 'overview'     && <MobileOverview trip={trip} navigate={navigate} showToast={showToast} />}
          {tab === 'dates'        && <DatesPanel trip={trip} dateVotes={dateVotes} getDateScore={getDateScore} showToast={showToast} />}
          {tab === 'reservations' && <BookingsPanel reservations={reservations} showToast={showToast} />}
          {tab === 'expenses'     && <ExpensesPanel expenses={expenses} total={total} myShare={myShare} attendees={trip.attendees} showToast={showToast} />}
          {tab === 'crew'         && <CrewPanel trip={trip} showToast={showToast} />}
        </div>
      </div>

      <BottomNav active="trips" navigate={navigate} />
    </div>
  )
}

// ── Sub-panels ────────────────────────────────────────────────────

function ChatPanel({ comments, newMsg, setNewMsg, sendMessage, mobile = false }: {
  comments: any[]; newMsg: string; setNewMsg: (v: string) => void; sendMessage: () => void; mobile?: boolean
}) {
  return (
    <div className={`flex flex-col ${mobile ? 'h-auto' : 'rounded-xl overflow-hidden'}`}
      style={mobile ? {} : { background: 'var(--bt-card)', border: `1px solid var(--bt-border)` }}>
      {!mobile && (
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--bt-border)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--bt-text-1)' }}>💬 Crew Chat</span>
          <span className="text-xs" style={{ color: 'var(--bt-text-3)' }}>{comments.length} messages</span>
        </div>
      )}
      <div className={`flex flex-col gap-3 overflow-y-auto p-3 md:p-4 ${mobile ? 'min-h-64' : 'flex-1'}`} style={{ maxHeight: mobile ? undefined : 480 }}>
        {comments.map(c => {
          const isMe = c.userId === CURRENT_USER._id
          return (
            <div key={c._id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <Avatar name={c.userName} size="sm" />
              <div className={`max-w-xs ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && <span className="text-xs mb-1" style={{ color: 'var(--bt-text-3)' }}>{c.userName}</span>}
                <div className="text-sm px-3 py-2 rounded-xl leading-relaxed"
                  style={{
                    background: isMe ? 'var(--bt-tag-bg)' : 'var(--bt-base)',
                    color: 'var(--bt-text-1)',
                    border: `1px solid ${isMe ? 'var(--bt-accent)30' : 'var(--bt-border)'}`,
                    borderRadius: isMe ? '12px 12px 3px 12px' : '3px 12px 12px 12px',
                  }}>
                  {c.text}
                </div>
                <span className="text-xs mt-1" style={{ color: 'var(--bt-text-3)' }}>
                  {c.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-2 p-3 md:p-4 border-t" style={{ borderColor: 'var(--bt-border)' }}>
        <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Message the crew..."
          className="flex-1 text-sm px-3 py-2 rounded-lg outline-none"
          style={{ background: 'var(--bt-input)', border: `1px solid var(--bt-border-input)`, color: 'var(--bt-text-1)' }}
          onFocus={e => (e.target.style.borderColor = 'var(--bt-accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--bt-border-input)')} />
        <button onClick={sendMessage}
          className="text-sm font-semibold px-4 py-2 rounded-lg"
          style={{ background: 'var(--bt-accent)', color: '#0d1117', border: 'none', cursor: 'pointer' }}>
          Send
        </button>
      </div>
    </div>
  )
}

function MobileOverview({ trip, navigate, showToast }: { trip: any; navigate: any; showToast: any }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <SectionLabel>About</SectionLabel>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--bt-text-1)' }}>{trip.description || 'No description yet.'}</p>
      </Card>
      <Card>
        <SectionLabel>Details</SectionLabel>
        {[
          { label: 'Status', val: trip.status.charAt(0).toUpperCase() + trip.status.slice(1) },
          { label: 'Dates', val: trip.startDate ? `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'TBD' },
          { label: 'Cost', val: trip.costTier || 'TBD' },
          { label: 'Attendees', val: `${trip.attendees.filter((a: any) => a.status === 'in').length} / ${trip.attendees.length}` },
        ].map(r => (
          <div key={r.label} className="flex justify-between text-sm py-2 border-b last:border-b-0" style={{ borderColor: 'var(--bt-border)' }}>
            <span style={{ color: 'var(--bt-text-3)' }}>{r.label}</span>
            <span className="font-medium" style={{ color: 'var(--bt-text-1)' }}>{r.val}</span>
          </div>
        ))}
      </Card>
      {trip.comparisonMode && (
        <div onClick={() => navigate('idea-comparison', { tripId: trip._id })}
          className="flex items-center gap-3 p-4 rounded-xl cursor-pointer"
          style={{ background: 'var(--bt-tag-bg)', border: `1px solid var(--bt-accent)40` }}>
          <span className="text-2xl">🗺️</span>
          <div className="flex-1">
            <div className="font-semibold text-sm" style={{ color: 'var(--bt-accent)' }}>Compare Destinations</div>
            <div className="text-xs" style={{ color: 'var(--bt-text-3)' }}>{trip.ideas.length} ideas · Voting open</div>
          </div>
          <span style={{ color: 'var(--bt-text-3)' }}>→</span>
        </div>
      )}
    </div>
  )
}

function DatesPanel({ trip, dateVotes, getDateScore, showToast }: { trip: any; dateVotes: any[]; getDateScore: (i: number) => any; showToast: any }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center mb-1">
        <SectionLabel>Proposed Dates</SectionLabel>
        <Btn variant="secondary" onClick={() => showToast('Add date')}>+ Propose</Btn>
      </div>
      {trip.proposedDates.map((pd: any, idx: number) => {
        const s = getDateScore(idx)
        const n = trip.attendees.length
        const pct = Math.round((s.yes / n) * 100)
        const best = idx === 1
        return (
          <Card key={idx} style={{ border: `1px solid ${best ? 'var(--bt-accent)60' : 'var(--bt-border)'}` }}>
            {best && <div className="text-xs font-bold mb-2" style={{ color: 'var(--bt-accent)' }}>✓ Best availability</div>}
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold text-sm" style={{ color: 'var(--bt-text-1)' }}>
                {new Date(pd.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(pd.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <span className="font-bold text-base" style={{ color: pct >= 60 ? 'var(--bt-accent)' : 'var(--bt-text-2)' }}>{pct}%</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden mb-2.5" style={{ background: 'var(--bt-base)' }}>
              <div style={{ width: `${(s.yes/n)*100}%`, background: 'var(--bt-accent)' }} />
              <div style={{ width: `${(s.maybe/n)*100}%`, background: '#f59e0b' }} />
              <div style={{ width: `${(s.no/n)*100}%`, background: 'var(--bt-danger)' }} />
            </div>
            <div className="flex gap-4 text-xs mb-3">
              <span style={{ color: 'var(--bt-accent)' }}>✓ {s.yes} yes</span>
              <span style={{ color: '#f59e0b' }}>~ {s.maybe} maybe</span>
              <span style={{ color: 'var(--bt-danger)' }}>✗ {s.no} no</span>
            </div>
            <div className="flex gap-2">
              {(['yes', 'maybe', 'no'] as const).map(v => (
                <button key={v} onClick={() => showToast(`Voted ${v}`)}
                  className="flex-1 text-xs font-semibold py-2 rounded-lg"
                  style={{
                    border: `1px solid ${v === 'yes' ? 'var(--bt-accent)40' : v === 'maybe' ? '#f59e0b40' : 'var(--bt-danger)40'}`,
                    background: v === 'yes' ? 'var(--bt-tag-bg)' : v === 'maybe' ? '#2a1f0d' : 'var(--bt-danger-bg)',
                    color: v === 'yes' ? 'var(--bt-accent)' : v === 'maybe' ? '#f59e0b' : 'var(--bt-danger)',
                    cursor: 'pointer',
                  }}>
                  {v === 'yes' ? '✓ Yes' : v === 'maybe' ? '~ Maybe' : '✗ No'}
                </button>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function BookingsPanel({ reservations, showToast }: { reservations: any[]; showToast: any }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center mb-1">
        <SectionLabel>Bookings & Reservations</SectionLabel>
        <Btn variant="primary" onClick={() => showToast('Add booking')}>+ Add</Btn>
      </div>
      {reservations.length === 0
        ? <Card><div className="text-center py-8 text-sm" style={{ color: 'var(--bt-text-3)' }}>📋 No bookings yet</div></Card>
        : reservations.map(r => (
          <Card key={r._id} className="flex gap-3 items-start">
            <span className="text-2xl flex-shrink-0">{RES_ICONS[r.type]}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--bt-text-1)' }}>{r.title}</div>
              <div className="text-xs mb-1.5" style={{ color: 'var(--bt-text-3)' }}>
                {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {r.startTime && ` · ${r.startTime}`}
              </div>
              {r.confirmationNumber && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ background: 'var(--bt-tag-bg)', color: 'var(--bt-accent)', border: 'var(--bt-accent)30' }}>
                  #{r.confirmationNumber}
                </span>
              )}
              {r.notes && <div className="text-xs mt-1.5" style={{ color: 'var(--bt-text-3)' }}>{r.notes}</div>}
            </div>
            {r.cost > 0 && <div className="font-bold text-sm flex-shrink-0" style={{ color: 'var(--bt-text-1)' }}>${r.cost.toLocaleString()}</div>}
          </Card>
        ))
      }
    </div>
  )
}

function ExpensesPanel({ expenses, total, myShare, attendees, showToast }: { expenses: any[]; total: number; myShare: number; attendees: any[]; showToast: any }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center mb-1">
        <SectionLabel>Expenses</SectionLabel>
        <Btn variant="primary" onClick={() => showToast('Add expense')}>+ Add</Btn>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[{ label: 'Total Spent', val: `$${total.toLocaleString()}`, accent: false }, { label: 'Your Share', val: `$${myShare.toLocaleString()}`, accent: true }].map(s => (
          <Card key={s.label} className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bt-text-3)' }}>{s.label}</div>
            <div className="text-xl font-bold" style={{ color: s.accent ? 'var(--bt-accent)' : 'var(--bt-text-1)' }}>{s.val}</div>
          </Card>
        ))}
      </div>
      {expenses.map(exp => (
        <Card key={exp._id} className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--bt-text-1)' }}>{exp.title}</div>
            <div className="text-xs mb-2" style={{ color: 'var(--bt-text-3)' }}>Paid by {exp.paidByName}</div>
            <div className="flex flex-wrap gap-1">
              {exp.splitAmong.map((s: any) => (
                <span key={s.name} className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--bt-tag-bg)', color: 'var(--bt-accent)', border: '1px solid var(--bt-accent)30' }}>{s.name}</span>
              ))}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-bold text-sm" style={{ color: 'var(--bt-text-1)' }}>${exp.amount.toLocaleString()}</div>
            <div className="text-xs" style={{ color: 'var(--bt-text-3)' }}>${Math.round(exp.amount / exp.splitAmong.length)}/ea</div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function CrewPanel({ trip, showToast }: { trip: any; showToast: any }) {
  return (
    <Card>
      <div className="flex gap-2 mb-4">
        <input placeholder="Name" className="flex-1 text-sm px-3 py-2 rounded-lg outline-none"
          style={{ background: 'var(--bt-input)', border: `1px solid var(--bt-border-input)`, color: 'var(--bt-text-1)' }} />
        <input placeholder="Email (optional)" className="flex-[2] text-sm px-3 py-2 rounded-lg outline-none"
          style={{ background: 'var(--bt-input)', border: `1px solid var(--bt-border-input)`, color: 'var(--bt-text-1)' }} />
        <button onClick={() => showToast('Added!')}
          className="text-sm font-semibold px-4 py-2 rounded-lg"
          style={{ background: 'var(--bt-accent)', color: '#0d1117', border: 'none', cursor: 'pointer' }}>
          + Add
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {trip.attendees.map((a: any, i: number) => (
          <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-lg"
            style={{ background: i === 1 ? 'var(--bt-tag-bg)40' : 'transparent', border: `1px solid ${i === 1 ? 'var(--bt-accent)20' : 'transparent'}` }}>
            <Avatar name={a.name} size="sm" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: 'var(--bt-text-1)' }}>{a.name}</span>
                <RoleBadge role={i === 0 ? 'Owner' : 'Planner'} />
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--bt-text-3)' }}>{a.notes || 'member@email.com'}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-right mt-2" style={{ color: 'var(--bt-text-3)' }}>{trip.attendees.length} total</div>
      <div className="border-t mt-3 pt-3" style={{ borderColor: 'var(--bt-border)' }}>
        <div className="text-xs mb-2" style={{ color: 'var(--bt-text-3)' }}>👥 People you've tripped with</div>
        <button onClick={() => showToast('Added Bob!')}
          className="text-xs px-3 py-1.5 rounded-full"
          style={{ background: 'var(--bt-card)', border: `1px solid var(--bt-border)`, color: 'var(--bt-text-1)', cursor: 'pointer' }}>
          + Bob
        </button>
      </div>
    </Card>
  )
}
