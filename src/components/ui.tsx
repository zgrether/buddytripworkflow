import { ReactNode } from 'react'
import { Screen } from '../App'

// ── Nav ──────────────────────────────────────────────────────────
export function TopNav({ navigate }: { navigate: (s: Screen, e?: any) => void }) {
  return (
    <nav className="sticky top-0 z-50 flex items-center h-14 px-4 md:px-6 border-b"
      style={{ background: 'var(--bt-base)', borderColor: 'var(--bt-border)' }}>
      <button onClick={() => navigate('trips')}
        className="flex items-center gap-2 mr-4 md:mr-8"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <span style={{ color: 'var(--bt-accent)', fontSize: 18 }}>⛳</span>
        <span className="font-bold text-sm md:text-base hidden sm:block" style={{ color: 'var(--bt-text-1)' }}>BuddyTrip</span>
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <NavBtn onClick={() => navigate('scoreboard')}>
          <span style={{ color: 'var(--bt-accent)' }}>⚡</span>
          <span className="hidden sm:inline">Quick score</span>
        </NavBtn>
        <NavBtn onClick={() => navigate('trips')}>
          <span className="hidden sm:inline">⊞ Dashboard</span>
          <span className="sm:hidden">🏠</span>
        </NavBtn>
        <button className="flex items-center gap-1 text-sm px-2 py-1 rounded"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bt-text-2)' }}>
          <span>👤</span>
          <span className="hidden md:inline"> Grether ▾</span>
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bt-text-3)', fontSize: 16 }}>☀</button>
      </div>
    </nav>
  )
}

function NavBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
      style={{ background: 'none', border: `1px solid var(--bt-border)`, color: 'var(--bt-text-1)', cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--bt-accent)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--bt-border)')}>
      {children}
    </button>
  )
}

// ── Breadcrumb ───────────────────────────────────────────────────
export function Breadcrumb({ items, navigate }: { items: { label: string; screen?: Screen; extra?: any }[]; navigate: (s: Screen, e?: any) => void }) {
  return (
    <div className="flex items-center gap-1.5 text-sm mb-5" style={{ color: 'var(--bt-text-3)' }}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span>›</span>}
          {item.screen
            ? <button onClick={() => navigate(item.screen!, item.extra)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bt-text-3)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--bt-text-1)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--bt-text-3)')}>
                {item.label}
              </button>
            : <span className="font-medium" style={{ color: 'var(--bt-text-1)' }}>{item.label}</span>}
        </span>
      ))}
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick, style = {} }: {
  children: ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties
}) {
  return (
    <div onClick={onClick}
      className={`rounded-xl p-4 md:p-5 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ background: 'var(--bt-card)', border: `1px solid var(--bt-border)`, ...style }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--bt-accent)')}
      onMouseLeave={e => onClick && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--bt-border)')}>
      {children}
    </div>
  )
}

// ── Badges ───────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    active:    { label: 'LIVE',      color: 'var(--bt-accent)',   bg: 'var(--bt-tag-bg)',  icon: '▶' },
    planning:  { label: 'Planning',  color: 'var(--bt-planning)', bg: 'var(--bt-blue-bg)', icon: '⊞' },
    idea:      { label: 'Idea',      color: 'var(--bt-accent)',   bg: 'var(--bt-tag-bg)',  icon: '💡' },
    completed: { label: 'Completed', color: 'var(--bt-text-3)',   bg: 'var(--bt-card)',    icon: '✓' },
  }
  const c = cfg[status] || cfg.idea
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}30` }}>
      <span style={{ fontSize: 9 }}>{c.icon}</span>{c.label}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  const cfg: Record<string, { color: string; bg: string }> = {
    Owner:   { color: 'var(--bt-owner)',   bg: 'var(--bt-owner-bg)' },
    Planner: { color: 'var(--bt-accent)',  bg: 'var(--bt-tag-bg)'   },
  }
  const c = cfg[role] || { color: 'var(--bt-text-2)', bg: 'var(--bt-card)' }
  return (
    <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}40` }}>
      {role}
    </span>
  )
}

export function Tag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ color: 'var(--bt-accent)', background: 'var(--bt-tag-bg)', border: `1px solid var(--bt-accent)33` }}>
      {label}
      {onRemove && <button onClick={onRemove} className="opacity-50 hover:opacity-100"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 13 }}>×</button>}
    </span>
  )
}

export function CostBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = { '$': '#4ade80', '$$': '#facc15', '$$$': '#fb923c', '$$$$': '#f87171' }
  return (
    <span className="text-xs font-bold px-1.5 py-0.5 rounded"
      style={{ color: colors[tier] || '#facc15', background: '#00000066' }}>
      {tier}
    </span>
  )
}

// ── Button ───────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export function Btn({ children, onClick, variant = 'primary', className = '', disabled = false }: {
  children: ReactNode; onClick?: () => void; variant?: BtnVariant; className?: string; disabled?: boolean
}) {
  const v: Record<BtnVariant, React.CSSProperties> = {
    primary:   { background: 'var(--bt-accent)',   color: '#0d1117',          border: 'none' },
    secondary: { background: 'transparent',         color: 'var(--bt-text-1)', border: `1px solid var(--bt-border)` },
    danger:    { background: 'var(--bt-danger-bg)', color: 'var(--bt-danger)', border: `1px solid var(--bt-danger-border)` },
    ghost:     { background: 'transparent',         color: 'var(--bt-text-2)', border: 'none' },
  }
  return (
    <button onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={v[variant]}>
      {children}
    </button>
  )
}

// ── Input ────────────────────────────────────────────────────────
export function Input({ placeholder, value, onChange, className = '', onKeyDown, autoFocus }: {
  placeholder?: string; value?: string; onChange?: (v: string) => void;
  className?: string; onKeyDown?: (e: React.KeyboardEvent) => void; autoFocus?: boolean
}) {
  return (
    <input placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
      onKeyDown={onKeyDown} autoFocus={autoFocus}
      className={`w-full text-sm px-3 py-2 rounded-lg outline-none ${className}`}
      style={{ background: 'var(--bt-input)', border: `1px solid var(--bt-border-input)`, color: 'var(--bt-text-1)' }}
      onFocus={e => (e.target.style.borderColor = 'var(--bt-accent)')}
      onBlur={e => (e.target.style.borderColor = 'var(--bt-border-input)')} />
  )
}

// ── Avatar ───────────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const hue = (name.charCodeAt(0) * 47 + (name.charCodeAt(name.length - 1) || 0) * 13) % 360
  const sz = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' }[size]
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
      style={{ background: `hsl(${hue},35%,22%)`, border: `1px solid hsl(${hue},40%,32%)`, color: `hsl(${hue},60%,72%)` }}>
      {initials}
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--bt-text-3)' }}>{children}</p>
}

// ── Live dot ──────────────────────────────────────────────────────
export function LiveDot() {
  return <span className="inline-block w-2 h-2 rounded-full animate-pulse-dot flex-shrink-0" style={{ background: 'var(--bt-live)' }} />
}

// ── Tab bar ───────────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex overflow-x-auto no-scrollbar border-b mb-5 md:mb-6" style={{ borderColor: 'var(--bt-border)' }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          className="flex-shrink-0 text-sm font-medium px-4 py-2.5 transition-colors"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: active === tab.id ? 'var(--bt-accent)' : 'var(--bt-text-2)',
            borderBottom: active === tab.id ? `2px solid var(--bt-accent)` : '2px solid transparent',
            marginBottom: -1,
          }}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ── Lifecycle stepper ─────────────────────────────────────────────
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => (
        <div key={step} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: i <= current ? 'var(--bt-accent)' : 'var(--bt-base)',
                color: i <= current ? '#0d1117' : 'var(--bt-text-3)',
                border: i > current ? `2px solid var(--bt-border)` : 'none',
              }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className="text-xs whitespace-nowrap hidden sm:block"
              style={{ color: i === current ? 'var(--bt-accent)' : 'var(--bt-text-3)', fontWeight: i === current ? 700 : 400 }}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-2 mb-0 sm:mb-5"
              style={{ background: i < current ? 'var(--bt-accent)' : 'var(--bt-border)' }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Mobile bottom nav ─────────────────────────────────────────────
export function BottomNav({ active, navigate }: { active: string; navigate: (s: Screen) => void }) {
  const items = [
    { id: 'trips',      icon: '🏠', label: 'Home' },
    { id: 'trip-new',   icon: '✈️', label: 'New Trip' },
    { id: 'scoreboard', icon: '🏆', label: 'Scores' },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex md:hidden border-t z-40 safe-bottom"
      style={{ background: 'var(--bt-card)', borderColor: 'var(--bt-border)' }}>
      {items.map(item => (
        <button key={item.id} onClick={() => navigate(item.id as Screen)}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: active === item.id ? 'var(--bt-accent)' : 'var(--bt-text-3)' }}>
          <span className="text-xl leading-none">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}
