# BuddyTrip — Migration Plan

*Prototype → Supabase-backed production. Written after tasks 1.1–5.3 are complete.*

**Read first:** SCHEMA.md (database), REALTIME.md (live features), PERMISSIONS.md (RLS), README.md (screen inventory).

---

## Pre-Migration Product Decisions

These questions from TODO2.md must be answered before writing schema migrations or auth rules, because the answers change the data model or scope.

### Blocking (affects schema or auth)

| # | Question | Options | Default if skipped |
|---|----------|---------|-------------------|
| **13** | Transfer series ownership — should series ownership transfer when the owner leaves a trip, or is series ownership separate from per-trip ownership? | (a) Series has its own owner column (separate from trip owner); (b) Series owner = owner of the most recent trip in the series | Add `owner_id` to `series` table — explicit is safer |
| **16** | Competition without a trip — is this a first-class feature (new `events` row with no `trip_id`) or out of scope for v1? | (a) Allow `trip_id = null` on `events`; (b) V1 requires a trip | Skip for v1; `trip_id NOT NULL` on `events` |
| **11** | Co-planner validation at trip creation — when a user types a co-planner name, do we require a BuddyTrip account to exist, or allow ghost placeholders until they sign up? | (a) Require account — autocomplete from `users` table; (b) Allow ghost user IDs (`ghost-*`) that self-heal on sign-up | Require account for v1 (simpler RLS) |

### Non-blocking (UX, no schema impact)

These can be decided anytime during the frontend migration sprint:

- **#5** Messageboard mobile fit — CSS fix, no data change
- **#6** "New Trip" in BottomNav — swap for something more useful (e.g., Profile); BottomNav items are hardcoded
- **#7** "Dates TBD" badge on Dashboard TripCard — add a conditional render, reads existing `datePoll` field
- **#8** Custom date picker — replaces `<input type="date">`; no data change
- **#9** Tab scrollbar — CSS fix (`overflow: hidden` on tab container)
- **#12** Co-planner step UX — remove the "you must assign someone" friction; UI-only
- **#15** Message panel on Trip Home — show/hide the inline team chat; UI-only
- **#17** Quick Score — standalone scorecard with no account required; significant scope, recommend v2

---

## Permission Gaps to Resolve Before Launch

From the task 4.3 role audit. Each gap requires either a product decision or a code change:

| Gap | Current behavior | Recommended fix |
|-----|-----------------|----------------|
| Score entry has no role gate | Any visitor can submit scores | Gate on `trip_member.role IN ('owner', 'planner')`, or require being a `player` in the event |
| Members can't comment on ideas | IdeaComparison requires `canEdit` to open | Move idea commenting to TripDetail HomeTab, no `canEdit` gate |
| Quick Info Tiles gated by `isOwner` | Planners can't manage them | Change to `canEdit` (owner + planner) |
| No self-service RSVP | Members can't update own attendance | Add RSVP endpoint; anyone can update their own `trip_members.rsvp_status` |
| Dashboard shows all trips | Rob sees trips he's not a member of | Filter Dashboard query: `trip_members.user_id = auth.uid()` |

---

## Phase 0 — Infrastructure Setup

**Goal:** Supabase project ready, CI connected, local dev working.

1. Create Supabase project (choose region closest to primary users)
2. Install deps: `@supabase/supabase-js`, `@tanstack/react-query`, `@tanstack/react-query-devtools`
3. Create `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Initialize Supabase client singleton (`src/lib/supabase.ts`)
5. Initialize TanStack Query client with defaults:
   - `staleTime: 60_000` (1 min)
   - `refetchOnWindowFocus: true`
   - `retry: 1`
6. Set up Supabase CLI for local dev (`supabase start`) and migration files

---

## Phase 1 — Database

**Goal:** All 26 tables created with correct FKs, indexes, RLS policies, and triggers. No application code changes yet.

### Step 1.1 — Create tables in dependency order

Follow the creation order in SCHEMA.md §"Table Creation Order". Key notes:

- `trips` and `events` have a circular FK — use `DEFERRABLE INITIALLY DEFERRED` on `events.trip_id`
- `date_polls.locked_window_id` forward-references `date_windows` — same deferrable pattern
- Run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` before any tables (for `gen_random_uuid()`)

### Step 1.2 — Create the `round_results` view

```sql
CREATE VIEW round_results AS
  SELECT
    grs.round_id,
    grs.team_id,
    SUM(grs.points) AS total_points
  FROM group_result_scores grs
  GROUP BY grs.round_id, grs.team_id;
```

### Step 1.3 — Create computed status function

`trip_status` is never stored — it's always derived. Implement as a Postgres function for use in RLS policies and API queries:

```sql
CREATE OR REPLACE FUNCTION trip_status(t trips) RETURNS text AS $$
  SELECT CASE
    WHEN t.end_date < now() THEN 'completed'
    WHEN t.start_date <= now() THEN 'active'
    WHEN t.locked_destination IS NOT NULL
      AND EXISTS (SELECT 1 FROM date_polls dp WHERE dp.trip_id = t.id AND dp.locked_window_id IS NOT NULL)
      THEN 'ready'
    ELSE 'planning'
  END;
$$ LANGUAGE sql STABLE;
```

### Step 1.4 — Create `updated_at` trigger

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
```

Apply to: `trips`, `events`, `reservations`, `expenses`, `group_results`, `users`

### Step 1.5 — Enable RLS on all tables

```sql
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
-- repeat for all 26 tables
```

### Step 1.6 — Write RLS policies

See PERMISSIONS.md for the full permission matrix. Priority policies:

| Table | Policy | Rule |
|-------|--------|------|
| `trips` | SELECT | `id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())` |
| `trip_members` | SELECT | `trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())` |
| `messages` | SELECT | channel = 'trip': same trip; channel = 'team': same team via `team_assignments` |
| `group_result_scores` | INSERT/UPDATE | user is `owner` or `planner` on the trip (or is a `player` in the event) |
| `notification_events` | SELECT | `trip_id IN (user's trips)` |

### Step 1.7 — Seed reference data

Seed `users`, `series`, and one complete BBMI trip chain (trips → events → teams → players → team_assignments → play_groups → rounds → side_events) from the mock data in `buddytrip.html`. This gives a realistic baseline for integration testing.

---

## Phase 2 — Auth

**Goal:** Replace hardcoded `CURRENT_USER = 'zach'` with real Supabase Auth. Role switcher is removed; real user identity drives all permission checks.

### Step 2.1 — Auth flow

- Use Supabase email/password auth for v1 (magic link is a v2 enhancement)
- On sign-up: insert a `users` row with `id = auth.uid()`
- `src/hooks/useCurrentUser.ts`: wraps `supabase.auth.getUser()` + fetches `users` row

### Step 2.2 — Replace CURRENT_USER

Every reference to `CURRENT_USER` in the prototype (search for `CURRENT_USER`) becomes `useCurrentUser()`. The hook returns `{ id, name, nickname, avatar }`.

### Step 2.3 — Replace ROLE_USERS / viewerRole dev switcher

Remove the dev role switcher entirely. Role is now `trip_members.role` for the authenticated user on the current trip:

```ts
// src/hooks/useTripRole.ts
function useTripRole(tripId: string): TripRole | null {
  const { user } = useCurrentUser()
  const { data } = useQuery(['trip-member', tripId, user.id], () =>
    supabase.from('trip_members').select('role').eq('trip_id', tripId).eq('user_id', user.id).single()
  )
  return data?.role ?? null
}
```

### Step 2.4 — Auth guards

- Unauthenticated users: redirect to `/login`
- Exception: Quick Score page (TODO #17, if built) — no auth required
- Protected routes: all screens except login and Quick Score

---

## Phase 3 — Data Layer (TanStack Query)

**Goal:** All mock data objects replaced with `useQuery` hooks. No module-level data arrays remain.

Work screen by screen. For each screen, the pattern is:
1. Write the Supabase query
2. Wrap in a `useQuery` hook
3. Replace the mock data reference
4. Write the `useMutation` for any writes, with `invalidateQueries` on success

### Priority order (most impactful first)

| Screen | Key queries | Mutations |
|--------|------------|-----------|
| Dashboard | `trips` (via `trip_members`) | — |
| TripDetail | `trips`, `ideas`, `date_polls`, `date_windows`, `reservations`, `expenses`, `trip_members` | lock destination, lock dates, add idea, add reservation, add expense, manage crew |
| LiveLeaderboard | `events`, `teams`, `play_groups`, `rounds`, `group_results`, `group_result_scores`, `side_events` | submit score |
| TripMessages | `messages` (trip channel + team channel) | send message |
| IdeaComparison | `ideas`, `idea_votes`, `idea_comments` | vote, comment, lock |
| TripNew | — | create trip, create trip_members |
| CompetitionSetup | `events` (if exists) | upsert event, create teams, assign players |

### Notes on state that was module-level in the prototype

| Prototype object | Production replacement |
|-----------------|----------------------|
| `MOCK_TRIPS` | `useQuery(['trips'])` → `trip_members` join → `trips` |
| `NOTIFICATION_EVENTS` | `useQuery(['notifications', userId])` + Realtime channel |
| `ROUND_RESULTS` | `round_results` view (computed from `group_result_scores`) |
| `GROUP_RESULTS` | `group_result_scores` table |
| `TRIP_MESSAGES` | `useQuery(['messages', tripId, channel])` |
| `TEAM_ASSIGNMENTS` | `useQuery(['team-assignments', eventId])` |
| `USERS` | `useQuery(['user', id])` — fetch on demand; cache in TanStack Query |
| `IDEA_VOTES`, `DATE_VOTES` | Inlined into idea/date_poll queries (join) or polled separately (30s) |

### `scoreNonce` pattern

The prototype uses `scoreNonce` to force re-renders after module-level `GROUP_RESULTS` mutates. In production this disappears — `useMutation` calls `queryClient.invalidateQueries(['group-results', eventId])` and the view re-renders naturally.

---

## Phase 4 — Realtime

**Goal:** Wire up the 4 Supabase Realtime channels per REALTIME.md. Implement after Phase 3 so queries are already working (Realtime supplements, not replaces, the query layer).

### Implementation order (per REALTIME.md recommendation)

1. **Live leaderboard** (`group_results` / `group_result_scores`) — highest stakes, most visible
2. **Notifications** (bell count + dropdown) — cross-trip, always visible in TopNav
3. **Trip chat** (trip channel + team channel) — per-trip, open only when in TripMessages

### `group_results` channel prerequisite

`group_result_scores` needs an `event_id` denormalized column for the Supabase filter. Add a migration:

```sql
ALTER TABLE group_result_scores ADD COLUMN event_id text REFERENCES events(id);
CREATE INDEX ON group_result_scores(event_id);
```

Populate via trigger when a `group_results` row is inserted (join through `rounds` → `events`).

### Reconnect pattern

```ts
supabase.channel('system').on('system', { event: 'reconnect' }, () => {
  queryClient.invalidateQueries() // catch missed updates during disconnect
}).subscribe()
```

---

## Phase 5 — Known Gaps & Polish

These are issues documented in the prototype that aren't blocked on any phase above, but should ship before v1 launch.

### Must-fix before launch

- [ ] **Score entry role gate** — currently no check; add `useTripRole` guard (see permission gaps above)
- [ ] **Dashboard membership filter** — `trips` query must filter by `trip_members.user_id = auth.uid()`
- [ ] **Self-service RSVP** — Members need a way to update their own `trip_members.rsvp_status`
- [ ] **Co-planner validation** (pending product decision #11 above)
- [ ] **Series ownership** (pending product decision #13 above)

### Nice-to-have for launch

- [ ] Dates TBD badge on Dashboard TripCard (#7)
- [ ] Tab scrollbar fix (#9)
- [ ] Messageboard mobile fit (#5)
- [ ] Quick Info Tiles: change `isOwner` gate to `canEdit` so Planners can manage them
- [ ] Members can comment on ideas (move comment UI out of IdeaComparison)

### Post-launch (v2)

- [ ] Custom date picker (#8)
- [ ] Quick Score page — no-auth scorecard (#17)
- [ ] Competition without a trip (#16) — significant schema change (`trip_id` nullable on `events`)
- [ ] Sabotage and Skins score entry formats (only Scramble and Stableford are implemented)
- [ ] Magic link / social auth
- [ ] Multi-team events beyond 2 teams — `group_result_scores` schema already supports it; UI needs work (#14)
- [ ] Push notifications (mobile web / PWA)

---

## Migration Checklist Summary

```
Phase 0 — Infrastructure
  [ ] Supabase project created
  [ ] .env.local configured
  [ ] Supabase client + TanStack Query initialized
  [ ] supabase CLI local dev working

Phase 1 — Database
  [ ] All 26 tables created in order
  [ ] round_results VIEW created
  [ ] trip_status function created
  [ ] updated_at triggers applied
  [ ] RLS enabled on all tables
  [ ] RLS policies written and tested
  [ ] Reference data seeded

Phase 2 — Auth
  [ ] Sign-up / sign-in flows working
  [ ] useCurrentUser hook replaces CURRENT_USER
  [ ] useTripRole hook replaces viewerRole + ROLE_USERS
  [ ] Dev role switcher removed
  [ ] Auth guards on all protected routes

Phase 3 — Data Layer
  [ ] Dashboard: trips query
  [ ] TripDetail: all tab queries + mutations
  [ ] LiveLeaderboard: event/scores queries + score submit mutation
  [ ] TripMessages: messages query (trip + team channel)
  [ ] IdeaComparison: ideas/votes/comments + mutations
  [ ] TripNew: create trip mutation
  [ ] CompetitionSetup: event upsert mutation
  [ ] No module-level data arrays remain

Phase 4 — Realtime
  [ ] event_id column added to group_result_scores
  [ ] Live leaderboard Realtime channel wired
  [ ] Notifications Realtime channel wired
  [ ] Trip chat Realtime channels wired
  [ ] Reconnect/invalidate pattern implemented

Phase 5 — Gaps
  [ ] Score entry role gate
  [ ] Dashboard membership filter
  [ ] Self-service RSVP
  [ ] Pre-migration product decisions resolved (#11, #13, #16)
```
