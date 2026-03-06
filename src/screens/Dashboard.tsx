import { useState } from 'react'
import { MapPin, Users, Calendar, ChevronDown, ChevronUp, Plus, Trophy } from 'lucide-react'
import { Screen } from '../App'
import { MOCK_TRIPS, BBMI_EVENT } from '../data/mockData'
import { TopNav, StatusBadge, RoleBadge, BottomNav, LiveDot } from '../components/ui'

// ── Helpers ──────────────────────────────────────────────────────

function fmtDateRange(start?: string, end?: string) {
  if (!start) return null
  const s = new Date(start)
  const e = end ? new Date(end) : null
  const mo = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' })
  const dy = (d: Date) => d.toLocaleDateString('en-US', { day: 'numeric' })
  if (!e) return `${mo(s)} ${dy(s)}`
  if (s.getMonth() === e.getMonth()) return `${mo(s)} ${dy(s)}–${dy(e)}`
  return `${mo(s)} ${dy(s)} – ${mo(e)} ${dy(e)}`
}

// ── Live competition mini-scoreboard ─────────────────────────────

function LiveCompetitionBar({ navigate }: { navigate: (s: Screen, e?: any) => void }) {
  const ev = BBMI_EVENT
  const teams = ev.teams
  const scores: Record<string, number> = { 'team-a': 6.5, 'team-b': 8.5 }
  const leadingId = scores['team-b'] > scores['team-a'] ? 'team-b' : 'team-a'

  return (
    <div
      onClick={e => { e.stopPropagation(); navigate('live-leaderboard') }}
      className="mt-3 rounded-lg cursor-pointer overflow-hidden"
      style={{ background: '#0a1a14', border: '1px solid rgba(0,212,170,0.2)' }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,170,0.5)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,170,0.2)')}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        {teams.map((team, i) => {
          const score = scores[team._id] ?? 0
          const isLeading = team._id === leadingId
          return (
            <div key={team._id} className={`flex items-center gap-2 ${i === 1 ? 'flex-row-reverse' : ''}`}>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{
                  color: team.color,
                  background: `${team.color}20`,
                  border: `1px solid ${team.color}50`,
                }}
              >
                {team.shortName}
              </span>
              <span
                className="text-xl font-black tabular-nums leading-none"
                style={{ color: isLeading ? 'var(--bt-text-1)' : 'var(--bt-text-3)' }}
              >
                {score}
              </span>
            </div>
          )
        })}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-semibold" style={{ color: 'var(--bt-text-3)' }}>Day 3 · Active</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--bt-accent)' }}>Leaderboard →</span>
        </div>
      </div>
    </div>
  )
}

// ── Trip card ─────────────────────────────────────────────────────

function TripCard({
  trip,
  navigate,
}: {
  trip: (typeof MOCK_TRIPS)[0] & { status: string; comparisonMode?: boolean }
  navigate: (s: Screen, e?: any) => void
}) {
  const isLive = trip.status === 'active'
  const isPast = trip.status === 'completed'

  const baseBorder = isLive ? 'var(--bt-accent)' : 'var(--bt-border)'

  return (
    <div
      onClick={() =>
        navigate(trip.comparisonMode ? 'idea-comparison' : 'trip-detail', { tripId: trip._id })
      }
      className="relative rounded-xl cursor-pointer overflow-hidden"
      style={{
        background: 'var(--bt-card)',
        border: `1px solid ${baseBorder}`,
        opacity: isPast ? 0.65 : 1,
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--bt-accent)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = baseBorder)}
    >
      {/* Faded image */}
      {trip.imageUrl && (
        <div
          className="absolute right-0 top-0 bottom-0 w-28 md:w-36"
          style={{
            background: `url(${trip.imageUrl}) center/cover`,
            opacity: isPast ? 0.07 : 0.13,
            maskImage: 'linear-gradient(to left, rgba(0,0,0,0.9), transparent)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.9), transparent)',
          }}
        />
      )}

      {/* Left accent bar for live */}
      {isLive && (
        <div
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
          style={{ background: 'var(--bt-accent)' }}
        />
      )}

      <div className={`relative p-4 ${isLive ? 'pl-5' : ''}`}>
        {/* Title row */}
        <div className="flex items-start justify-between mb-1.5 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isLive && <LiveDot />}
            <span
              className="font-semibold text-sm md:text-base leading-snug truncate"
              style={{ color: 'var(--bt-text-1)' }}
            >
              {trip.title}
            </span>
          </div>
          <StatusBadge status={trip.status} />
        </div>

        {/* Location */}
        {trip.location && (
          <div className="flex items-center gap-1.5 text-xs mb-2.5" style={{ color: 'var(--bt-text-2)' }}>
            <MapPin size={11} />
            {trip.location}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          <RoleBadge role="Planner" />
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bt-text-3)' }}>
            <Users size={11} />
            {trip.attendees.length}
          </span>
          {trip.startDate && (
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bt-text-3)' }}>
              <Calendar size={11} />
              {fmtDateRange(trip.startDate, trip.endDate)}
            </span>
          )}
          {trip.comparisonMode && (
            <span className="text-xs font-semibold" style={{ color: 'var(--bt-accent)' }}>
              {trip.ideas.length} destinations
            </span>
          )}
        </div>

        {/* Live competition bar */}
        {isLive && <LiveCompetitionBar navigate={navigate} />}
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────

export default function Dashboard({ navigate, viewerRole }: { navigate: (s: Screen, e?: any) => void; viewerRole?: string }) {
  const [pastExpanded, setPastExpanded] = useState(false)

  const allTrips = MOCK_TRIPS
  const live     = allTrips.filter(t => t.status === 'active')
  const upcoming = allTrips.filter(t => t.status === 'planning' || t.status === 'idea')
  const past     = allTrips.filter(t => t.status === 'completed')

  return (
    <div className="min-h-screen pb-24 md:pb-0" style={{ background: 'var(--bt-base)' }}>
      <TopNav navigate={navigate} />

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: 'var(--bt-text-1)' }}>
              My Trips
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--bt-text-3)' }}>
              Welcome back, Grether
            </p>
          </div>
          <button
            onClick={() => navigate('trip-new')}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ background: 'var(--bt-accent)', color: '#0d1117', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={15} />
            New Trip
          </button>
        </div>

        {/* ── LIVE ── */}
        {live.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-block w-2 h-2 rounded-full animate-pulse-dot flex-shrink-0"
                style={{ background: 'var(--bt-live)' }}
              />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--bt-live)' }}>
                Live Now
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {live.map(t => (
                <TripCard key={t._id} trip={t as any} navigate={navigate} />
              ))}
            </div>
          </section>
        )}

        {/* ── UPCOMING ── */}
        {upcoming.length > 0 && (
          <section className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--bt-text-3)' }}>
              Upcoming
            </p>
            <div className="flex flex-col gap-3">
              {upcoming.map(t => (
                <TripCard key={t._id} trip={t as any} navigate={navigate} />
              ))}
            </div>
          </section>
        )}

        {/* ── PAST ── */}
        {past.length > 0 && (
          <section>
            <button
              onClick={() => setPastExpanded(v => !v)}
              className="flex items-center gap-1.5 mb-3"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--bt-text-3)' }}>
                Past
              </p>
              <span style={{ color: 'var(--bt-text-3)' }}>
                {pastExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
              {!pastExpanded && (
                <span className="text-xs" style={{ color: 'var(--bt-text-3)' }}>
                  {past.length} trip{past.length !== 1 ? 's' : ''}
                </span>
              )}
            </button>
            {pastExpanded && (
              <div className="flex flex-col gap-3">
                {past.map(t => (
                  <TripCard key={t._id} trip={t as any} navigate={navigate} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Empty state */}
        {live.length === 0 && upcoming.length === 0 && past.length === 0 && (
          <div
            className="text-center py-16 rounded-xl"
            style={{ border: `1px dashed var(--bt-border)` }}
          >
            <Trophy size={32} className="mx-auto mb-3" style={{ color: 'var(--bt-text-3)' }} />
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--bt-text-2)' }}>No trips yet</p>
            <p className="text-xs mb-4" style={{ color: 'var(--bt-text-3)' }}>Start planning your first adventure</p>
            <button
              onClick={() => navigate('trip-new')}
              className="text-sm font-semibold px-5 py-2 rounded-lg"
              style={{ background: 'var(--bt-accent)', color: '#0d1117', border: 'none', cursor: 'pointer' }}
            >
              + New Trip
            </button>
          </div>
        )}
      </div>

      <BottomNav active="trips" navigate={navigate} />
    </div>
  )
}
