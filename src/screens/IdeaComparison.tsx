import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Screen } from '../App'
import { MOCK_TRIPS, IDEA_VOTES, IDEA_COMMENTS, CURRENT_USER } from '../data/mockData'
import { TopNav, Breadcrumb, Card, Btn, Avatar, CostBadge, BottomNav } from '../components/ui'

export default function IdeaComparison({ navigate, showToast, tripId, viewerRole }: {
  navigate: (s: Screen, e?: any) => void
  showToast: (m: string) => void
  tripId?: string
  viewerRole?: string
}) {
  const trip: any = MOCK_TRIPS.find(t => t._id === (tripId || 'trip-1')) || MOCK_TRIPS[0]
  const ideas = trip.ideas.filter(i => !i.archived)
  const [myVote, setMyVote] = useState<number | null>(0)
  const [votes, setVotes] = useState(IDEA_VOTES)
  const [expanded, setExpanded] = useState<number | null>(null)
  // Mobile: which card is active in swipe view
  const [mobileIdx, setMobileIdx] = useState(0)
  // Auto-open comment threads that already have comments (runs after trip is resolved)
  const initialOpen = new Set(IDEA_COMMENTS.filter(c => c.tripId === (MOCK_TRIPS.find(t => t._id === (tripId || 'trip-bbmi')) || MOCK_TRIPS[0])._id).map(c => c.ideaIndex))
  const [openComments, setOpenComments] = useState<Set<number>>(initialOpen)
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({})
  const [allComments, setAllComments] = useState(IDEA_COMMENTS)

  const addComment = (ideaIndex: number) => {
    const text = commentTexts[ideaIndex]?.trim()
    if (!text) return
    setAllComments(c => [...c, {
      _id: `ic-${Date.now()}`, tripId: trip._id, ideaIndex,
      userId: CURRENT_USER._id, userName: CURRENT_USER.firstName,
      text, createdAt: new Date()
    }])
    setCommentTexts(t => ({ ...t, [ideaIndex]: '' }))
  }

  const getComments = (ideaIndex: number) =>
    allComments.filter(c => c.tripId === trip._id && c.ideaIndex === ideaIndex)

  const getCount = (idx: number) => votes.filter(v => v.tripId === trip._id && v.ideaIndex === idx).length
  const getVoters = (idx: number) => votes.filter(v => v.tripId === trip._id && v.ideaIndex === idx).map(v => v.userName)
  const maxVotes = Math.max(...ideas.map((_, i) => getCount(i)), 1)

  const handleVote = (idx: number) => {
    setMyVote(idx)
    showToast(`Voted for ${ideas[idx].title}!`)
  }

  const COST_COLORS: Record<string, string> = { '$': '#4ade80', '$$': '#facc15', '$$$': '#fb923c', '$$$$': '#f87171' }

  // Shared idea card — used for both mobile and desktop
  const IdeaCard = ({ idx, mobile = false }: { idx: number; mobile?: boolean }) => {
    const idea = ideas[idx]
    const count = getCount(idx)
    const voters = getVoters(idx)
    const isMyVote = myVote === idx
    const isLeading = count === maxVotes && count > 0
    const isExpanded = expanded === idx

    return (
      <div className="flex flex-col h-full rounded-xl overflow-hidden"
        style={{
          background: 'var(--bt-card)',
          border: `1px solid ${isMyVote ? 'var(--bt-accent)' : isLeading ? 'var(--bt-accent)50' : 'var(--bt-border)'}`,
          boxShadow: isMyVote ? '0 0 0 1px var(--bt-accent)' : 'none',
        }}>

        {/* Image */}
        <div className="relative flex-shrink-0" style={{ height: mobile ? 180 : 160 }}>
          <div className="absolute inset-0" style={{ background: `url(${idea.imageUrl}) center/cover` }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.78))' }} />

          <div className="absolute top-2.5 right-2.5 flex gap-1.5">
            {isLeading && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#78350f', color: '#fbbf24' }}>🏆 Leading</span>}
            {isMyVote && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--bt-tag-bg)', color: 'var(--bt-accent)', border: '1px solid var(--bt-accent)40' }}>✓ Picked</span>}
            <CostBadge tier={idea.costTier || '$$'} />
          </div>

          <div className="absolute bottom-2.5 left-3 right-3">
            <div className="font-bold text-white mb-0.5" style={{ fontSize: mobile ? 20 : 17 }}>{idea.title}</div>
            <div className="text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              <span>📍</span>{idea.location}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-3 md:p-4 gap-3">

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Courses', val: idea.golfCourses.length },
              { label: 'Activities', val: idea.activities.length },
              { label: 'Dates', val: idea.proposedDates.length },
            ].map(s => (
              <div key={s.label} className="rounded-lg py-2 text-center"
                style={{ background: 'var(--bt-base)', border: `1px solid var(--bt-border)` }}>
                <div className="font-bold text-base" style={{ color: 'var(--bt-text-1)' }}>{s.val}</div>
                <div className="text-xs" style={{ color: 'var(--bt-text-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Pros / Cons */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bt-accent)' }}>Pros</div>
              {idea.pros.slice(0, isExpanded ? 99 : 2).map((p, i) => (
                <div key={i} className="text-xs leading-relaxed mb-1 flex gap-1.5" style={{ color: 'var(--bt-text-2)' }}>
                  <span className="flex-shrink-0 font-bold" style={{ color: 'var(--bt-accent)' }}>+</span>{p}
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bt-danger)' }}>Cons</div>
              {idea.cons.slice(0, isExpanded ? 99 : 2).map((c, i) => (
                <div key={i} className="text-xs leading-relaxed mb-1 flex gap-1.5" style={{ color: 'var(--bt-text-2)' }}>
                  <span className="flex-shrink-0 font-bold" style={{ color: 'var(--bt-danger)' }}>−</span>{c}
                </div>
              ))}
            </div>
          </div>

          {/* Expanded detail */}
          {isExpanded && (
            <div className="flex flex-col gap-3 pt-1 border-t" style={{ borderColor: 'var(--bt-border)' }}>
              {idea.golfCourses.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--bt-text-3)' }}>⛳ Courses</div>
                  {idea.golfCourses.map((c, i) => (
                    <div key={i} className="text-xs flex items-center gap-2 mb-1" style={{ color: 'var(--bt-text-2)' }}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'var(--bt-tag-bg)', color: 'var(--bt-accent)', fontSize: 9 }}>{i + 1}</span>
                      {c}
                    </div>
                  ))}
                </div>
              )}
              {idea.accommodation && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--bt-text-3)' }}>🏨 Stay</div>
                  <p className="text-xs" style={{ color: 'var(--bt-text-2)' }}>{idea.accommodation}</p>
                </div>
              )}
              {idea.notes && (
                <div className="rounded-lg p-2.5" style={{ background: '#2a1f0d', border: '1px solid #f59e0b30' }}>
                  <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>📝 </span>
                  <span className="text-xs" style={{ color: '#d97706' }}>{idea.notes}</span>
                </div>
              )}
            </div>
          )}

          {/* Voters */}
          {voters.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {voters.slice(0, 4).map((v, i) => (
                  <div key={i} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 4 - i }}>
                    <Avatar name={v} size="sm" />
                  </div>
                ))}
              </div>
              <span className="text-xs" style={{ color: 'var(--bt-text-3)' }}>
                {voters.slice(0, 2).join(', ')}{voters.length > 2 ? ` +${voters.length - 2}` : ''} voted
              </span>
            </div>
          )}

          {/* Comment thread */}
          <div className="border-t pt-2" style={{ borderColor: 'var(--bt-border)' }}>
            <button
              onClick={() => setOpenComments(prev => {
                const next = new Set(prev)
                next.has(idx) ? next.delete(idx) : next.add(idx)
                return next
              })}
              className="flex items-center gap-1.5 text-xs py-1"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bt-text-3)' }}
            >
              <MessageSquare size={12} />
              {getComments(idx).length > 0
                ? `${getComments(idx).length} comment${getComments(idx).length !== 1 ? 's' : ''}`
                : 'Add a comment'}
            </button>
            {openComments.has(idx) && (
              <div className="mt-2 flex flex-col gap-2">
                {getComments(idx).map(c => (
                  <div key={c._id} className="flex gap-2 items-start">
                    <Avatar name={c.userName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold mr-1.5" style={{ color: 'var(--bt-text-2)' }}>{c.userName}</span>
                      <span className="text-xs" style={{ color: 'var(--bt-text-1)' }}>{c.text}</span>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--bt-text-3)' }}>
                        {c.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-1">
                  <input
                    value={commentTexts[idx] || ''}
                    onChange={e => setCommentTexts(t => ({ ...t, [idx]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addComment(idx)}
                    placeholder="Add a comment..."
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg outline-none"
                    style={{ background: 'var(--bt-input)', border: '1px solid var(--bt-border-input)', color: 'var(--bt-text-1)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--bt-accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--bt-border-input)')}
                  />
                  <button
                    onClick={() => addComment(idx)}
                    className="p-1.5 rounded-lg flex-shrink-0"
                    style={{ background: 'var(--bt-accent)', border: 'none', cursor: 'pointer' }}
                  >
                    <Send size={12} color="#0d1117" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions — push to bottom */}
          <div className="flex gap-2 mt-auto pt-1">
            <button onClick={() => setExpanded(isExpanded ? null : idx)}
              className="flex-1 text-xs font-medium py-2 rounded-lg"
              style={{ background: 'transparent', border: `1px solid var(--bt-border)`, color: 'var(--bt-text-2)', cursor: 'pointer' }}>
              {isExpanded ? 'Less ↑' : 'Details ↓'}
            </button>
            <button onClick={() => handleVote(idx)}
              className="flex-[2] text-sm font-semibold py-2 rounded-lg"
              style={{
                background: isMyVote ? 'var(--bt-tag-bg)' : 'var(--bt-accent)',
                color: isMyVote ? 'var(--bt-accent)' : '#0d1117',
                border: isMyVote ? `1px solid var(--bt-accent)40` : 'none',
                cursor: 'pointer',
              }}>
              {isMyVote ? '✓ Your Pick' : 'Vote for This'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: 'var(--bt-base)' }}>
      <TopNav navigate={navigate} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb
          items={[{ label: 'Dashboard', screen: 'trips' }, { label: trip.title, screen: 'trip-detail', extra: { tripId: trip._id } }, { label: 'Compare Ideas' }]}
          navigate={navigate} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5 md:mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1" style={{ color: 'var(--bt-text-1)' }}>
              🗺️ Where should we go?
            </h1>
            <p className="text-sm" style={{ color: 'var(--bt-text-2)' }}>
              {trip.title}
              <span className="mx-2" style={{ color: 'var(--bt-border)' }}>·</span>
              {votes.filter(v => v.tripId === trip._id).length} of {trip.attendees.length} buddies voted
            </p>
          </div>
          <div className="flex gap-2">
            <Btn variant="secondary" onClick={() => showToast('Add idea form')}>+ Add Idea</Btn>
            <Btn variant="secondary" onClick={() => navigate('trip-detail', { tripId: trip._id })}>Trip Details</Btn>
          </div>
        </div>

        {/* Vote summary bar */}
        <Card className="mb-5 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--bt-text-3)' }}>Current votes</span>
            <div className="flex gap-4 flex-1">
              {ideas.map((idea, idx) => {
                const count = getCount(idx)
                const isLeading = count === maxVotes && count > 0
                return (
                  <div key={idx} className="flex-1 flex items-center gap-2 min-w-0">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bt-base)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(count / maxVotes) * 100}%`, background: isLeading ? 'var(--bt-accent)' : 'var(--bt-text-3)' }} />
                    </div>
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: isLeading ? 'var(--bt-accent)' : 'var(--bt-text-2)' }}>{count}</span>
                    <span className="text-xs flex-shrink-0 hidden sm:block truncate max-w-20" style={{ color: 'var(--bt-text-3)' }}>{idea.title.split(' ')[0]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* ── MOBILE: swipe-style single card ─────────────────────── */}
        <div className="block md:hidden">
          {/* Tab pills for switching */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
            {ideas.map((idea, idx) => {
              const count = getCount(idx)
              const isLeading = count === maxVotes && count > 0
              return (
                <button key={idx} onClick={() => setMobileIdx(idx)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: mobileIdx === idx ? 'var(--bt-accent)' : 'var(--bt-card)',
                    color: mobileIdx === idx ? '#0d1117' : 'var(--bt-text-2)',
                    border: `1px solid ${mobileIdx === idx ? 'var(--bt-accent)' : 'var(--bt-border)'}`,
                    cursor: 'pointer',
                  }}>
                  {isLeading && '🏆 '}{idea.title.split(' ')[0]} ({count})
                </button>
              )
            })}
          </div>

          {/* Single card */}
          <IdeaCard idx={mobileIdx} mobile />

          {/* Prev / next */}
          <div className="flex justify-between mt-3">
            <button onClick={() => setMobileIdx(i => Math.max(0, i - 1))}
              disabled={mobileIdx === 0}
              className="text-sm px-4 py-2 rounded-lg disabled:opacity-30"
              style={{ background: 'var(--bt-card)', border: `1px solid var(--bt-border)`, color: 'var(--bt-text-2)', cursor: 'pointer' }}>
              ← Prev
            </button>
            <span className="text-sm self-center" style={{ color: 'var(--bt-text-3)' }}>{mobileIdx + 1} / {ideas.length}</span>
            <button onClick={() => setMobileIdx(i => Math.min(ideas.length - 1, i + 1))}
              disabled={mobileIdx === ideas.length - 1}
              className="text-sm px-4 py-2 rounded-lg disabled:opacity-30"
              style={{ background: 'var(--bt-card)', border: `1px solid var(--bt-border)`, color: 'var(--bt-text-2)', cursor: 'pointer' }}>
              Next →
            </button>
          </div>
        </div>

        {/* ── DESKTOP: side-by-side columns ───────────────────────── */}
        <div className="hidden md:grid gap-4"
          style={{ gridTemplateColumns: `repeat(${ideas.length}, 1fr)` }}>
          {ideas.map((_, idx) => <IdeaCard key={idx} idx={idx} />)}
        </div>

        {/* Trip notes */}
        {trip.notes && (
          <div className="mt-5 rounded-xl p-4 text-sm" style={{ background: '#1a1f0d', border: '1px solid var(--bt-accent)30', color: 'var(--bt-text-2)' }}>
            <span className="font-semibold" style={{ color: 'var(--bt-accent)' }}>📋 Note: </span>{trip.notes}
          </div>
        )}
      </div>

      <BottomNav active="trips" navigate={navigate} />
    </div>
  )
}
