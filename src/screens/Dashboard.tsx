import { useState } from 'react'
import { Screen } from '../App'
import { MOCK_TRIPS } from '../data/mockData'
import { TopNav, StatusBadge, RoleBadge, SectionLabel, BottomNav, LiveDot } from '../components/ui'

export default function Dashboard({ navigate }: { navigate: (s: Screen, e?: any) => void }) {
  const [showGuide, setShowGuide] = useState(true)
  const [search, setSearch] = useState('')

  const live     = MOCK_TRIPS.filter(t => t.status === 'active')
  const upcoming = MOCK_TRIPS.filter(t => t.status === 'planning' || t.status === 'idea')
  const past     = MOCK_TRIPS.filter(t => t.status === 'completed')

  const filter = (arr: typeof MOCK_TRIPS) =>
    search
      ? arr.filter(t =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          (t.location || '').toLowerCase().includes(search.toLowerCase()))
      : arr

  const TripCard = ({ trip }: { trip: typeof MOCK_TRIPS[0] }) => {
    const isLive = trip.status === 'active'
    return (
      <div onClick={() => navigate(trip.comparisonMode ? 'idea-comparison' : 'trip-detail', { tripId: trip._id })}
        className="relative rounded-xl p-4 cursor-pointer overflow-hidden transition-colors"
        style={{ background: 'var(--bt-card)', border: `1px solid ${isLive ? 'var(--bt-accent)60' : 'var(--bt-border)'}` }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--bt-accent)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = isLive ? 'var(--bt-accent)60' : 'var(--bt-border)')}>

        {/* Faded map silhouette */}
        {trip.imageUrl && (
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32"
            style={{
              background: `url(${trip.imageUrl}) center/cover`,
              opacity: 0.13,
              maskImage: 'linear-gradient(to left, rgba(0,0,0,0.9), transparent)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.9), transparent)',
            }} />
        )}

        <div className="relative">
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              {isLive && <LiveDot />}
              <span className="font-semibold text-sm md:text-base truncate" style={{ color: 'var(--bt-text-1)' }}>{trip.title}</span>
            </div>
            <StatusBadge status={trip.status} />
          </div>

          {trip.location && (
            <div className="flex items-center gap-1 text-xs mb-2.5" style={{ color: 'var(--bt-text-2)' }}>
              <span>📍</span>{trip.location}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <RoleBadge role="Owner" />
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bt-text-3)' }}>
              <span>👥</span>{trip.attendees.length}
            </span>
            {trip.startDate && (
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--bt-text-3)' }}>
                <span>📅</span>
                {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {trip.endDate && '–' + new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {trip.comparisonMode && (
              <span className="text-xs font-semibold" style={{ color: 'var(--bt-accent)' }}>
                ⚡ {trip.ideas.length} ideas
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: 'var(--bt-base)' }}>
      <TopNav navigate={navigate} />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">

        {/* Page header */}
        <div className="flex items-start justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--bt-text-1)' }}>My Trips</h1>
            <p className="text-sm md:text-base" style={{ color: 'var(--bt-text-2)' }}>Welcome back, Grether</p>
          </div>
          <button onClick={() => navigate('trip-new')}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ background: 'var(--bt-accent)', color: '#0d1117', border: 'none', cursor: 'pointer' }}>
            + New Trip
          </button>
        </div>

        {/* Start a trip guide */}
        {showGuide && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Start a Trip</SectionLabel>
              <button onClick={() => setShowGuide(false)}
                className="text-xs"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bt-text-3)' }}>
                Hide ▲
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: '💡', title: "Still figuring it out?",   desc: 'Brainstorm destinations and compare ideas', screen: 'trip-new' as Screen },
                { icon: '🗺️', title: "Know where you're going?",  desc: 'Set dates, invite friends, start planning',  screen: 'trip-new' as Screen },
                { icon: '⛳', title: "Already on the ground?",    desc: 'Jump straight into scoring — you\'re here',  screen: 'scoreboard' as Screen },
              ].map((item, i) => (
                <div key={i} onClick={() => navigate(item.screen)}
                  className="flex items-start gap-3 p-3 md:p-4 rounded-xl cursor-pointer transition-colors"
                  style={{ background: 'var(--bt-card)', border: `1px solid var(--bt-border)` }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--bt-accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--bt-border)')}>
                  <span className="text-lg md:text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="text-xs md:text-sm font-semibold mb-0.5" style={{ color: 'var(--bt-text-1)' }}>{item.title}</div>
                    <div className="text-xs leading-relaxed hidden sm:block" style={{ color: 'var(--bt-text-2)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6 md:mb-8">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--bt-text-3)' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search trips..."
            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl outline-none"
            style={{ background: 'var(--bt-card)', border: `1px solid var(--bt-border)`, color: 'var(--bt-text-1)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--bt-accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--bt-border)')} />
        </div>

        {/* LIVE */}
        {filter(live).length > 0 && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--bt-live)' }} />
              <SectionLabel>LIVE</SectionLabel>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filter(live).map(t => <TripCard key={t._id} trip={t} />)}
            </div>
          </div>
        )}

        {/* UPCOMING */}
        {filter(upcoming).length > 0 && (
          <div className="mb-6 md:mb-8">
            <SectionLabel>Upcoming</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filter(upcoming).map(t => <TripCard key={t._id} trip={t} />)}
            </div>
          </div>
        )}

        {/* PAST */}
        <div className="mb-6">
          <SectionLabel>Past</SectionLabel>
          {filter(past).length === 0
            ? <p className="text-sm" style={{ color: 'var(--bt-text-3)' }}>No completed trips yet.</p>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filter(past).map(t => <TripCard key={t._id} trip={t} />)}
              </div>
          }
        </div>
      </div>

      <BottomNav active="trips" navigate={navigate} />
    </div>
  )
}
