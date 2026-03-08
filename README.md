# BuddyTrip

A mobile-first group trip planning and competition app. Built around BBMI (Buddy Banks Memorial Invitational) as a real-world prototype, but designed to generalize to any recurring friend group trip — golf, wine country, Disney, bachelor party, etc.

**Stack:** Single-file HTML prototype (`buddytrip.html`) — React via CDN, inline CSS variables, no build step  
**Repo also contains:** React + TypeScript + Vite scaffold in `src/` (partially synced, prototype is source of truth)  
**Status:** Active prototype — all screens functional, mock data only, no backend

---

## What It Does

BuddyTrip solves the coordination problem for recurring group trips:

- **Planning phase** — propose destinations, vote on ideas, poll dates, build a crew roster
- **Booking phase** — centralize reservations, confirmations, expenses
- **Competition** — Ryder Cup-style team scoring across multiple round formats
- **Live event** — real-time leaderboard, score entry by group, live standings
- **Communication** — trip-wide chat + private team chat thread

---

## Single-File Prototype

All active development happens in **`buddytrip.html`**. Open it directly in a browser — no server needed.

### Mock Trips

| Trip | ID | Status | Notes |
|---|---|---|------|
| BBMI 2025 | `trip-bbmi-live` | `active` (Live) | Bandon Dunes — scoring in progress |
| BBMI 2026 | `trip-bbmi` | `ready` | Scottsdale AZ — all locked, countdown showing |
| BBMI 2027 | `trip-new-deciding` | `planning` | No destination, comparison mode active |

### Mock Users / Dev Switcher

Role switcher always visible bottom-right during development:

| Role | User | Can Do |
|---|---|---|
| `owner` | Brad | Everything — settings, lock destination, transfer, delete |
| `planner` | Grether | Add/edit content, invite crew, competition setup |
| `member` | Buddy | Read-only — view content, respond to polls |

---

## Trip Status Model

Three statuses with distinct visual treatment on the Dashboard:

| Status | Badge | Trigger | Dashboard Card |
|---|---|---|---|
| `planning` | ⊞ Planning | Default | Neutral border, no accent bar |
| `ready` | ✓ Ready | Dest + date locked | Violet accent bar, countdown strip |
| `active` | ▶ LIVE | Start date reached (auto) | Teal accent bar, live dot, scoreboard strip |

**Key decision:** `active` is date-driven and automatic — no manual GO button. The day the start date arrives, the status flips. A future notification ("Your trip starts today") can accompany this.

---

## Navigation Architecture

### Bottom Nav — context-aware

**Outside a trip:** 3 items — Home · New Trip · Live  
**Inside a trip:** 4 items — Home · Trip Home · Messages · Live

- **Trip Home** — taps back to that trip's Home tab
- **Messages** — shows unread badge (red dot) when messages from others are waiting
- **Live** — always goes to live leaderboard

### Breadcrumbs

Pattern: `Trips > [Trip Name] > [Sub-screen]`

- IdeaComparison: `Trips > BBMI 2026 > Where to?`
- Messages: `Trips > BBMI 2026 > Messages`
- LiveLeaderboard: No standard breadcrumb — uses native `← TRIP HOME` in header (monospace, matches scoreboard feel)

---

## Screen Inventory

| Screen | Route Key | Status |
|---|---|---|
| Dashboard | `trips` | ✅ |
| Trip Detail | `trip-detail` | ✅ 5 tabs: Home, Schedule, Crew, Competition, More |
| Idea Comparison | `idea-comparison` | ✅ AI suggestions, comments with timestamps |
| Trip Messages | `trip-messages` | ✅ Trip Chat + Team Chat stacked |
| New Trip | `trip-new` | 🟡 Functional, needs simplification |
| Competition Setup | `comp-setup` | 🟡 Team assignment, draft mode stub |
| Live Leaderboard | `live-leaderboard` | ✅ Overview, Groups, Info, History |

---

## Home Tab — Panel Order (stable, do not reorder)

1. Trip header card
2. Destination vote panel (when voting active)
3. Date panel (when dates not locked)
4. Tab bar
5. **[Home tab content]**
   - Planning Arc (owner/planner only)
   - About card
   - Trip Chat teaser → navigates to Messages screen

---

## Destination + Date Panel Logic

### Destination Panel
- Shows when `trip.comparisonMode && !lockedDest`
- Lock stored in `DESTINATION_LOCK[tripId]`; reactive via `setLockedDest()`
- Edit button clears lock without navigating away
- Card grid: `repeat(min(count, 3), minmax(0, 1fr))`

### Date Panel
- **No dates:** date pickers + Set Dates + Poll the crew
- **Poll open:** windows, I'm in / Can't do it, Lock In, Add window
- **Confirmed (green):** compact row, Change button reopens picker
- `effectiveStartDate` priority: `lockedWindow → knownDateSet.start → trip.startDate`

---

## Messages Architecture

```js
TRIP_MESSAGES[tripId] = { trip: [...], team: [...] }
```

- **Home tab teaser:** compact unread row, stable below About card
- **Messages screen:** Trip Chat + Team Chat stacked vertically, independent scroll/draft
- **TripChat component:** `maxHeight` prop, scroll-to-bottom on mount, new-message pill when scrolled up

---

## Design System

```
--bt-accent:   #00d4aa   teal — primary, live
--bt-base:     #0d1117   page bg
--bt-card:     #161b22   card bg
--bt-danger:   red        destructive, unread
Ready color:   #a78bfa   violet
```

**Icon system:** All icons must exist in the `ICONS` dict (~line 144). Do NOT reference icon names that aren't listed. Common gotcha: `LayoutDashboard` does not exist — use `Flag` or another available icon.

---

## Key Engineering Rules

1. **Hooks at top level only** — `useState`/`useRef` cannot live inside IIFEs, nested functions, or conditionals. This has caused multiple crashes.
2. **IIFE vs Component** — use IIFEs for pure render logic. Extract to named component when you need `useRef`/`useEffect`.
3. **Reactive globals** — always pair global object mutations with a `setState` call. `DESTINATION_LOCK[id] = x; setLockedDest(x)`.

---

## Session History

**Sessions 1–9:** Scoring engine — LiveLeaderboard, LiveScoreEntry, RoundBuilder, BBMI_EVENT mock data.

**Session 10:** Trip planning layer — Dashboard, TripDetail tabs, roles, Add Competition, Quick Info tiles, expenses, IdeaComparison.

**Session 11:** Competition tab accordions, add idea/lock in, crew dot legend, planner invite stubs.

**Session 12 (this session):** Status model (planning/ready/live), destination grid layout, date panel above tabs, Edit destination wired, context-aware bottom nav (4 items in trip), Messages screen with stacked threads, TripChat scroll/unread pill, comment timestamps, breadcrumb consistency, Planning Arc hidden from members, notification trigger inventory mapped.

---

## Running

Open `buddytrip.html` directly in a browser. No build step required.
