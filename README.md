# BuddyTrip

A mobile-first group trip planning and golf competition app. Built for the BBMI (Buddy Banks Memorial Invitational) as a real-world prototype, but designed to generalize to any recurring friend group trip.

**Stack:** React + TypeScript + Vite + Tailwind + Lucide React  
**Status:** Active prototype — screens functional, mock data only, no backend yet

---

## What It Does

BuddyTrip solves the coordination problem for recurring group trips:

- **Planning phase** — propose destinations, vote on dates, build a crew roster
- **Booking phase** — centralize reservations, tee times, confirmations, expenses
- **Competition** — Ryder Cup-style team scoring across multiple round formats (Scramble, Stableford, Sabotage, Skins)
- **Live event** — real-time leaderboard, score entry by group, live standings

---

## Screens

| Screen | File | Status |
|---|---|---|
| Dashboard | `screens/Dashboard.tsx` | ✅ Complete |
| Trip Detail (4 tabs) | `screens/TripDetail.tsx` | ✅ Complete |
| Idea Comparison | `screens/IdeaComparison.tsx` | ✅ Complete |
| Live Leaderboard | `screens/LiveLeaderboard.tsx` | ✅ Complete |
| Live Score Entry | `screens/LiveScoreEntry.tsx` | ✅ Complete |
| Round Builder | `screens/RoundBuilder.tsx` | ✅ Complete |
| Trip New | `screens/TripNew.tsx` | 🟡 Stub — needs simplification |
| Scoreboard | `screens/Scoreboard.tsx` | 🟡 Redundant (superseded by LiveLeaderboard) |

---

## Design System

CSS variables in `src/index.css`:

```
--bt-base:     #0d1117   (page background)
--bt-card:     #161b22   (card background)
--bt-accent:   #00d4aa   (teal — primary action, live indicators)
--bt-text-1/2/3          (text hierarchy)
--bt-border              (default border)
--bt-danger              (red for destructive actions)
--bt-tag-bg:   #0d2a22   (teal-tinted tag backgrounds)
```

Team colors: Hammer `#00d4aa` (teal) · Anvil `#f97316` (orange)  
Score colors: Eagle `#f59e0b` · Birdie `#00d4aa` · Par gray · Bogey `#c0765a`

Shared components in `src/components/ui.tsx`:
`TopNav`, `BottomNav`, `Card`, `Btn`, `Avatar`, `TabBar`, `StatusBadge`, `RoleBadge`, `SectionLabel`, `LiveDot`, `Breadcrumb`, `Stepper`

---

## Role System

Three viewer roles control what each user sees and can do:

| Role | Can Do |
|---|---|
| `owner` | Everything — Trip Settings, delete, transfer, expense split editing, crew menus, Quick Info tile editing |
| `planner` | Add/edit content — expenses, bookings, invite crew, competition setup |
| `member` | Read-only — view all content, add expenses |

Dev role switcher is always visible bottom-right. Represents: Brad (Owner) · Grether (Planner) · Buddy (Member).

---

## Session History

### Sessions 1–9 — Scoring Engine
Built the full golf scoring system:
- `LiveLeaderboard` with Overview, Live Groups, Trip Info, History tabs
- `LiveScoreEntry` for hole-by-hole input
- `RoundBuilder` 6-step wizard (format → groups → handicaps → sides → preview)
- Round formats: Scramble, Stableford, Sabotage (last-place elimination), Skins
- BBMI_EVENT mock data: 16 players, 2 teams, 4 rounds at Bandon Dunes

### Session 10 — Trip Planning Layer
Built the full trip planning layer on top of the scoring engine.

**Dashboard** — Live Now / Upcoming / Past sections, competition bar on live card, past trips collapsed by default.

**TripDetail 4-tab restructure:**
- Home: competition hero or Add Competition CTA, Quick Info tiles, destination voting, about/details
- Schedule: reservations with confirmation numbers, date voting with availability bars  
- Crew: role + team badges, roster-in-flux warning when destination not locked
- More: expenses with split editing, trip settings (owner only)

**Role-aware rendering** throughout all tabs via `ViewerRole` passed from App.tsx.

**Add Competition flow** — modal with team assignment (pre-seeded from BBMI data), review step, launch. Transforms Home tab hero from CTA to live scoreboard. Competition is an event, not a settings toggle.

**Quick Info tiles** — owner-editable grid on Home tab. Any label/value pair (door codes, tee times, dinner reservations). Crew sees read-only. Owner sees hover pencil/trash controls and a dashed Add tile.

**Trip header card** — compact card with title, cost badge, location, dates, night count, cost estimate, and a faint state silhouette SVG (OR/AZ) in the corner.

**Expense editing** — any role can add. Owner edits per-person splits via checkbox grid with All/None shortcuts and live per-person recalculation.

**IdeaComparison** — contextual comment threads per destination, auto-expands when comments exist.

---

## Mock Data

Two trips in `src/data/mockData.ts`:

| Trip | ID | Status | Location |
|---|---|---|---|
| BBMI 2025 | `trip-bbmi-live` | active | Bandon Dunes, OR |
| BBMI 2026 | `trip-bbmi` | planning | Scottsdale, AZ |

BBMI_EVENT: 2 teams (Hammer/Anvil), 16 players in 4 groups, 4 rounds (Scramble ✅, Stableford ✅, Sabotage 🔴 live, Skins upcoming)

---

## Running Locally

```bash
npm install
npm run dev
```

Build distributable single-file HTML:
```bash
npm run build
# inline dist/assets/* into dist/index.html
```
