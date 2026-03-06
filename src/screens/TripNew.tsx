import { useState } from 'react'
import { Screen } from '../App'
import { TopNav, Breadcrumb, Card, Btn, Input, CostBadge, BottomNav } from '../components/ui'

const AI_IDEAS = [
  { title: 'Hilton Head Island Classic', location: 'Hilton Head Island, SC', desc: 'Sea-island golf charm — moss-draped oaks, lagoons at every turn, and Harbour Town.', courses: 5, costTier: '$$', img: 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=500&q=80' },
  { title: 'Streamsong Hidden Gem', location: 'Bowling Green, FL', desc: 'World-class golf resort in the middle of nowhere — built on former phosphate mines.', courses: 3, costTier: '$$$', img: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=500&q=80' },
  { title: 'Amelia Island Getaway', location: 'Amelia Island, FL', desc: 'Florida barrier island with a real small-town feel. Great courses, great food.', courses: 5, costTier: '$$$', img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80' },
  { title: 'Whistling Straits', location: 'Kohler, WI', desc: '2021 Ryder Cup host. Looks like it was airlifted from the Irish coast.', courses: 4, costTier: '$$$$', img: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500&q=80' },
  { title: 'Ozarks Golf Adventure', location: 'Branson, MO', desc: 'Overlooked by the golf world but shouldn\'t be. Mountain topography, great value.', courses: 5, costTier: '$', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80' },
  { title: 'Ireland Links Tour', location: 'County Clare & Kerry', desc: 'Ancient landscapes, winds that humble you, and pints that heal you.', courses: 5, costTier: '$$$$', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80' },
  { title: 'Sandhills Budget Run', location: 'Southern Pines, NC', desc: 'Pinehurst-adjacent quality at a fraction of the resort prices.', courses: 5, costTier: '$$', img: 'https://images.unsplash.com/photo-1432163683234-f3cb0b96f9e5?w=500&q=80' },
  { title: 'Myrtle Beach Classic', location: 'Myrtle Beach, SC', desc: 'Wide variety of courses, great value, easy drive for most of the crew.', courses: 6, costTier: '$$', img: 'https://images.unsplash.com/photo-1510674783038-5b3a5edb4167?w=500&q=80' },
  { title: 'Scottsdale Desert Escape', location: 'Scottsdale, AZ', desc: '300 days of sunshine, saguaro cacti on every fairway, legendary nightlife.', courses: 5, costTier: '$$$', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80' },
  { title: 'Virginia Beach Golf Week', location: 'Virginia Beach, VA', desc: 'Solid value-play destination with enough courses for a full week.', courses: 5, costTier: '$$', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80' },
]

type Mode = 'pick' | 'scratch' | 'quick'

export default function TripNew({ navigate, showToast }: {
  navigate: (s: Screen, e?: any) => void
  showToast: (m: string) => void
}) {
  const [tripName, setTripName] = useState('')
  const [selectedIdeas, setSelectedIdeas] = useState<number[]>([])
  const [mode, setMode] = useState<Mode>('pick')

  const toggleIdea = (i: number) => {
    setSelectedIdeas(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : prev.length < 4 ? [...prev, i] : prev
    )
  }

  const handleCreate = () => {
    if (!tripName.trim()) { showToast('Enter a trip name first'); return }
    showToast('Trip created!')
    navigate('idea-comparison', { tripId: 'trip-1' })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: 'var(--bt-base)' }}>
      <TopNav navigate={navigate} />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb items={[{ label: 'Dashboard', screen: 'trips' }, { label: 'Plan a Trip' }]} navigate={navigate} />

        {/* Page title */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 mb-1" style={{ color: 'var(--bt-text-1)' }}>
            <span style={{ color: 'var(--bt-accent)' }}>💡</span> Plan a Trip
          </h1>
          <p className="text-sm md:text-base" style={{ color: 'var(--bt-text-2)' }}>Name your trip, then choose how to get started.</p>
        </div>

        {/* Trip name — always visible, always first */}
        <Card className="mb-6 md:mb-8">
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--bt-text-2)' }}>
            Trip name <span style={{ color: 'var(--bt-danger)' }}>*</span>
          </label>
          <Input
            value={tripName}
            onChange={setTripName}
            placeholder="e.g. Myrtle Beach Golf Trip 2025"
            autoFocus
            className="text-base py-3"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          {tripName.trim() && (
            <p className="text-xs mt-2" style={{ color: 'var(--bt-text-3)' }}>
              Now pick how you want to start ↓
            </p>
          )}
        </Card>

        {/* Mode picker */}
        <div className="grid grid-cols-3 gap-3 mb-6 md:mb-8">
          {[
            { id: 'pick' as Mode,    icon: '✦',  label: 'Pick an idea',      desc: 'Browse curated destinations' },
            { id: 'scratch' as Mode, icon: '🗺️', label: 'From scratch',      desc: 'Build your own idea' },
            { id: 'quick' as Mode,   icon: '⚡',  label: 'Quick trip',        desc: 'I know where we\'re going' },
          ].map(opt => (
            <button key={opt.id} onClick={() => setMode(opt.id)}
              className="text-left p-3 md:p-4 rounded-xl transition-colors"
              style={{
                background: mode === opt.id ? 'var(--bt-tag-bg)' : 'var(--bt-card)',
                border: `1px solid ${mode === opt.id ? 'var(--bt-accent)' : 'var(--bt-border)'}`,
                cursor: 'pointer',
              }}>
              <div className="text-lg md:text-2xl mb-1 md:mb-2">{opt.icon}</div>
              <div className="text-xs md:text-sm font-semibold mb-0.5" style={{ color: mode === opt.id ? 'var(--bt-accent)' : 'var(--bt-text-1)' }}>{opt.label}</div>
              <div className="text-xs hidden md:block" style={{ color: 'var(--bt-text-3)' }}>{opt.desc}</div>
            </button>
          ))}
        </div>

        {/* ── PICK AN IDEA ─────────────────────────────────────────── */}
        {mode === 'pick' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base md:text-lg font-semibold" style={{ color: 'var(--bt-text-1)' }}>
                  ✦ Browse destinations
                </h2>
                <p className="text-xs md:text-sm mt-0.5" style={{ color: 'var(--bt-text-3)' }}>
                  Pick up to 4 — buddies vote on their favorite
                  {selectedIdeas.length > 0 && <span style={{ color: 'var(--bt-accent)' }}> · {selectedIdeas.length} selected</span>}
                </p>
              </div>
              {selectedIdeas.length > 0 && (
                <Btn variant="ghost" onClick={() => setSelectedIdeas([])}>Clear</Btn>
              )}
            </div>

            {/* 1-col mobile / 2-col md / 2-col lg (nice card size) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6">
              {AI_IDEAS.map((idea, i) => {
                const isSelected = selectedIdeas.includes(i)
                const isDisabled = selectedIdeas.length >= 4 && !isSelected
                return (
                  <div key={i} onClick={() => !isDisabled && toggleIdea(i)}
                    className="rounded-xl overflow-hidden transition-all"
                    style={{
                      background: 'var(--bt-card)',
                      border: `1px solid ${isSelected ? 'var(--bt-accent)' : 'var(--bt-border)'}`,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.5 : 1,
                      boxShadow: isSelected ? '0 0 0 1px var(--bt-accent)' : 'none',
                    }}>

                    {/* Image */}
                    <div className="relative h-28 md:h-36" style={{ background: `url(${idea.img}) center/cover` }}>
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.75))' }} />

                      {/* Badges */}
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <CostBadge tier={idea.costTier} />
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 left-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--bt-accent)', color: '#0d1117' }}>
                            #{selectedIdeas.indexOf(i) + 1}
                          </span>
                        </div>
                      )}

                      {/* Location */}
                      <div className="absolute bottom-2 left-3 text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
                        <span>📍</span>{idea.location}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-3 md:p-4">
                      <div className="font-semibold text-sm md:text-base mb-1" style={{ color: 'var(--bt-text-1)' }}>{idea.title}</div>
                      <div className="text-xs leading-relaxed mb-2 line-clamp-2" style={{ color: 'var(--bt-text-3)' }}>{idea.desc}</div>
                      <div className="text-xs flex items-center gap-1" style={{ color: 'var(--bt-accent)' }}>
                        <span>⛳</span> {idea.courses} courses
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── FROM SCRATCH ─────────────────────────────────────────── */}
        {mode === 'scratch' && (
          <Card className="mb-6">
            <h2 className="font-semibold mb-4" style={{ color: 'var(--bt-text-1)' }}>Build your destination idea</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Destination', placeholder: 'e.g. Scottsdale, AZ' },
                { label: 'Date hint', placeholder: 'e.g. Oct 2025, spring sometime' },
                { label: 'Accommodation idea', placeholder: 'e.g. Rental house, resort...' },
                { label: 'Golf courses', placeholder: 'e.g. TPC Scottsdale...' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--bt-text-3)' }}>{f.label.toUpperCase()}</label>
                  <Input placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--bt-text-3)' }}>DESCRIPTION</label>
              <textarea placeholder="What makes this destination great for your crew?"
                className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-none"
                rows={3}
                style={{ background: 'var(--bt-input)', border: `1px solid var(--bt-border-input)`, color: 'var(--bt-text-1)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--bt-accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--bt-border-input)')} />
            </div>
          </Card>
        )}

        {/* ── QUICK TRIP ──────────────────────────────────────────── */}
        {mode === 'quick' && (
          <Card className="mb-6">
            <h2 className="font-semibold mb-4" style={{ color: 'var(--bt-text-1)' }}>Quick trip setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Location', placeholder: 'e.g. Las Vegas, NV' },
                { label: 'Dates', placeholder: 'e.g. Jun 5–8, 2025' },
                { label: 'Accommodation', placeholder: 'e.g. Aria Resort' },
                { label: 'Invite code (optional)', placeholder: 'e.g. VEGAS25' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--bt-text-3)' }}>{f.label.toUpperCase()}</label>
                  <Input placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CTA row — sticky on mobile */}
        <div className="flex items-center justify-between gap-3 py-4 md:py-0 
                        sticky bottom-16 md:static md:mb-0
                        px-0 md:px-0 -mx-0"
          style={{ background: 'var(--bt-base)' }}>
          <Btn variant="secondary" onClick={() => navigate('trips')}>Cancel</Btn>
          <div className="flex items-center gap-3">
            {mode === 'pick' && selectedIdeas.length > 0 && (
              <span className="text-sm hidden md:block" style={{ color: 'var(--bt-text-3)' }}>
                {selectedIdeas.length} idea{selectedIdeas.length > 1 ? 's' : ''} selected
              </span>
            )}
            <button onClick={handleCreate} disabled={!tripName.trim()}
              className="text-sm font-semibold px-5 py-2 rounded-lg transition-opacity"
              style={{
                background: tripName.trim() ? 'var(--bt-accent)' : 'var(--bt-border)',
                color: tripName.trim() ? '#0d1117' : 'var(--bt-text-3)',
                border: 'none', cursor: tripName.trim() ? 'pointer' : 'not-allowed',
              }}>
              {selectedIdeas.length > 1
                ? `Create Trip with ${selectedIdeas.length} ideas →`
                : selectedIdeas.length === 1
                  ? `Create Trip with ${AI_IDEAS[selectedIdeas[0]].title.split(' ')[0]} →`
                  : 'Create Trip →'}
            </button>
          </div>
        </div>
      </div>

      <BottomNav active="trip-new" navigate={navigate} />
    </div>
  )
}
