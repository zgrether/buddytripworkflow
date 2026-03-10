# BuddyTrip — Session Context

## Last Updated
2026-03-10 — Task 4.2 complete

## Current State
- buddytrip.html: ~5240 lines — navigation fixes + empty states
- types.ts: ~300 lines — complete TypeScript interfaces for all entities
- All known icon references verified against ICONS dict
- Team scores are now computed from data, not hardcoded
- Expense splits now keyed by userId, not first names
- DESTINATION_LOCK and DATE_POLL globals eliminated — data now lives on trip objects as `lockedDestination` and `datePoll`
- All user IDs unified — single format (plain IDs, no prefixes)
- All votes, comments, and date polls reference stable IDs instead of array indexes
- Trip status is now derived dynamically via getTripStatus(trip) — no status field on trip objects
- In-app notification system live — bell icon in TopNav with unread count, dropdown panel, 4 triggers wired
- PERMISSIONS.md created — complete permission matrix for all actions × roles, with RLS migration notes

## Completed Tasks
- [x] 0.1 — Send icon added to ICONS dict (line 197)
- [x] 0.2 — Competition Explainer icon rendering fix (line 1679)
- [x] 0.3 — computeTeamScores(event) function added (~line 462); replaces hardcoded scores in Dashboard, HomeTab (TripDetail), and LiveLeaderboard
- [x] 0.4 — EXPENSES splitAmong changed from { name } to { userId }; ExpenseRow now uses userId as Set key and resolves display names via nameById lookup
- [x] 0.5 — Dashboard greeting now uses ROLE_USERS[viewerRole].name, updates with dev role switcher
- [x] 1.1 — Unified user identity: removed `p-` prefix from all 16 BBMI_EVENT player `_id` values, updated group `playerIds` arrays, fixed attendee role mapping comparisons, removed `p-` prefix from BBMI_HISTORY userIds, removed `user-` prefix from KNOWN_ACCOUNTS userIds, fixed TripSettingsPanel transfer filter (`'user-brad'` → `'brad'`)

## Notes from 0.3
- Old hardcoded values (6.5/8.5) did NOT match mock data — they were arbitrary placeholders
- Computed values from ROUND_RESULTS + sides[].result: team-a: 10, team-b: 13

## Notes from 1.1
- Three identity patterns existed: CURRENT_USER._id='zach', players._id='p-zach', attendees.userId='zach'
- Standardized on plain IDs without prefixes: 'brad', 'zach', 'jd', etc.
- The `ghost-` prefix for manually-added no-account users was left as-is (different concept — runtime-generated placeholder IDs)
- SERIES_HISTORY was already keyed by unprefixed IDs — no change needed
- computeTeamScores only uses team IDs (team-a, team-b) — no impact
- Expense splitAmong uses BBMI_EVENT.players.map(p => ({ userId: p._id })) — now generates unprefixed IDs, matching attendees and nameById lookups

## Completed Tasks (continued)
- [x] 1.2 — Replaced array indexes with stable IDs for votes: added `_id` to ideas, proposedDates, and DATE_POLL windows; replaced `ideaIndex` with `ideaId` in IDEA_VOTES, IDEA_COMMENTS, and all component logic (TripDetail HomeTab, IdeaComparison); replaced `proposedDateIndex` with `dateId` in DATE_VOTES; replaced `windowIdx` with `windowId` in DATE_POLL votes; replaced `lockedIdx` with `lockedId`; ensured all new idea/window creation generates `_id`

## Notes from 1.4
- TEAM_ASSIGNMENTS lives at module level, after BBMI_EVENT closes and before MOCK_TRIPS
- getTeamId(eventId, userId) returns null if not assigned — safe for future trips where a player has no team yet
- The `t.members?.includes()` pattern in TripMessages was dead code (no `members` array on team objects) — replaced with the correct getTeamId lookup
- computeTeamScores is unaffected — it never read teamId from players, it only reads team-keyed point totals from ROUND_RESULTS and sides[].result
- Next task (1.5) is the symmetric cleanup: remove groupId from player objects and rely solely on groups[].playerIds

## Notes from 1.3
- DESTINATION_LOCK pre-populated for 'trip-bbmi-live' with `{ title: 'Bandon Dunes', location: 'Bandon Dunes, OR', createdAt: new Date('2024-08-20') }` — this represents the trip that was already booked
- ROUND_RESULTS now has `submittedBy` and `createdAt`; `computeTeamScores` was already safe (uses `if (teamId in totals)` guard — non-team keys skipped without any code change)
- Dates tell a story: BBMI 2025 lodging booked Nov 2024, greens fees Nov 2024, expenses logged during the March 2025 trip; BBMI 2026 idea votes in Jan 2026, date poll votes in Feb 2026; BBMI 2027 attendees joined Feb 2026
- `updatedAt` added to EXPENSES and RESERVATIONS only (immutable records like votes don't warrant it)
- All runtime vote/lock creation handlers now stamp `createdAt: new Date()` at the moment of interaction

## Notes from 1.2
- Ideas now have `_id` fields: 'idea-scottsdale', 'idea-bandon', 'idea-scottsdale-2027'
- Proposed dates have `_id` fields: 'pd-mar-2026', 'pd-oct-2026'
- DATE_POLL windows have `_id` fields: 'dw-mar-2026', 'dw-oct-2026'
- New ideas/windows created at runtime generate IDs via `Date.now()` suffix
- IdeaComparison `IdeaCard` still receives `idx` (array position) for internal pro/con/description editing — this is fine since those operations are position-based within the local state array
- `lockedIn` state in IdeaComparison now stores idea `_id` instead of index
- `showLockConfirm` state now stores idea `_id` instead of index
- `mobileIdx` in IdeaComparison remains an index (for carousel navigation) — this is UI state, not data identity

## Completed Tasks (continued)
- [x] 1.3 — Added createdAt/updatedAt/joinedAt/submittedBy timestamps to all mock data objects: IDEA_VOTES, DATE_VOTES, DATE_POLL votes, DESTINATION_LOCK, EXPENSES, RESERVATIONS, ROUND_RESULTS, and trip attendees across all 3 MOCK_TRIPS entries; also updated all runtime vote/lock creation handlers to stamp new Date()
- [x] 1.4 — Normalized team membership: created TEAM_ASSIGNMENTS array `[{ eventId, teamId, userId }]`, added getTeamId(eventId, userId) helper, removed teamId from all 16 BBMI_EVENT.players objects, updated 4 component call sites (TripDetail teams accordion, LiveLeaderboard team roster, LiveLeaderboard group player chips, TripMessages myTeam lookup)
- [x] 1.5 — Normalized group assignments: removed groupId from all 16 BBMI_EVENT.players objects; groups[].playerIds was already the sole source of truth and no component read p.groupId, so no component changes needed
- [x] 1.6 — Created USERS lookup object (19 entries: all 16 BBMI players + mike/paul/lance from invite flow); removed userName from IDEA_VOTES, DATE_VOTES, IDEA_COMMENTS, TRIP_MESSAGES; removed name from DATE_POLL votes; changed paidByName → paidByUserId on EXPENSES; updated 7 render sites and 4 runtime creation handlers to resolve names via USERS[userId]

## Notes from 1.6
- USERS keyed by plain userId (same format as all other IDs since task 1.1)
- Render pattern: `USERS[id]?.nickname || id` for display names; `USERS[id]?.name || id` for Avatar (needs full name for initials)
- paidByName 'Grether' mapped to paidByUserId 'zach' — nickname resolved at render time
- KNOWN_ACCOUNTS inline in TripSettingsPanel left as-is (it's a component-local lookup for the invite flow; 1.6 notes it's now redundant and can be replaced with USERS in a future cleanup)
- Phase 1 data model tasks are now complete (1.1–1.6)
- [x] 2.1 — Lifted MOCK_TRIPS to App-level useState; TripNew.handleFinish now builds a real trip object and pushes it onto state; all 5 consuming components (Dashboard, TripDetail, CompetitionSetup, IdeaComparison, TripMessages) updated to accept trips prop; no component reads MOCK_TRIPS directly any more
- [x] 2.2 — Added getTripStatus(trip) function; removed status field from all 3 MOCK_TRIPS entries and TripNew.handleFinish template; replaced all trip.status / t.status reads (Dashboard filters ×4, TripCard ×3, TripDetail isLive, TripDetail header badge) with getTripStatus() calls

## Notes from 2.1
- MOCK_TRIPS remains as the module-level initializer — `useState(MOCK_TRIPS)` in App
- setTrips passed to TripNew only; all other screens are read-only consumers of trips
- New trip shape mirrors existing trips: comparisonMode=true when 2+ ideas, comparisonMode=false when known destination or 1 idea
- 1-idea vote path creates the trip with comparisonMode=false and no ideas[] — user will see the normal planning view (destination can be set from there)
- Attendees array seeded with CURRENT_USER as Owner (joinedAt: new Date())
- DESTINATION_LOCK, DATE_POLL are still module-level mutable objects — task 3.2 will move them onto trip objects once trips are stateful (which they now are)

## Notes from 2.2
- getTripStatus(trip) placed immediately before computeTeamScores (after all mock data is defined so DESTINATION_LOCK and DATE_POLL are in scope)
- Status derivation order: completed (end date in past) → active (start date today or earlier) → ready (dest + dates locked) → planning
- DESTINATION_LOCK[trip._id] checked for locked destination; also handles non-comparisonMode trips that have trip.location directly
- DATE_POLL[trip._id]?.lockedId checked for locked date window; also handles trips with trip.startDate directly
- No status field exists anywhere in the data layer — fully derived at render time

## Completed Tasks (continued)
- [x] 2.3 — Built notification event layer: NOTIFICATION_EVENTS array with 5 seed entries, pushNotification() helper, formatNotification() + notificationIcon() + notificationColor() display helpers, bell icon in TopNav with unread count badge, dropdown panel with time-ago formatting and click-to-navigate, mark-as-read on open; wired 4 triggers (destination locked, dates locked, crew added, chat message); score_submitted trigger ready for task 2.4

## Notes from 2.3
- NOTIFICATION_EVENTS is a module-level array (same pattern as DESTINATION_LOCK, DATE_POLL) — will move to trip-level or server state in migration
- pushNotification() generates unique IDs via `Date.now()` + random suffix
- App-level state uses a `notifNonce` counter to force re-renders when new notifications are pushed (since the array itself is module-level)
- `notifyAndRefresh` callback passed as `notify` prop to TripDetail, IdeaComparison, TripMessages — the 3 screens with mutation handlers
- `notifications` and `onMarkAllRead` props passed through all 7 screen components → TopNav via `navProps` spread
- TopNav now accepts `notifications` and `onMarkAllRead` props; renders bell icon (accent-colored when unread), unread count badge (red, caps at 9+), and a dropdown panel with click-outside-to-close
- TripChat component gained `onSend` callback prop — called after message is added to state, used by TripMessages to fire chat_message notifications
- TripSettingsPanel gained `notify` prop — used by handleAddToRoster and quickAdd for crew_added notifications
- 5 seed notifications: 2 historical (read), 3 recent (2 unread) — bell shows "2" on first load
- Notification event schema: `{ _id, type, tripId, actorId, payload, createdAt, readAt }`
- Supported types: destination_locked, dates_locked, crew_added, chat_message, score_submitted
- Score submitted trigger: no score entry UI exists yet (task 2.4), but the type is fully supported in seed data and display helpers — wire-up will be a single `notify()` call when score entry is built
- Dropdown shows up to 20 most recent events, sorted newest first, with type-specific icons and accent colors
- Clicking a notification navigates to that trip's detail view

## Completed Tasks (continued)
- [x] 2.4 — Built ScoreEntry component and GROUP_RESULTS data layer; wired group card tap handler in LiveLeaderboard Groups tab; score submission updates GROUP_RESULTS → aggregates into ROUND_RESULTS → recomputes via computeTeamScores; fires score_submitted notification; scramble and stableford fully functional; sabotage and skins show "not yet implemented" stub

## Notes from 2.4
- GROUP_RESULTS is a new module-level object: `{ [roundId]: { [groupId]: { 'team-a': pts, 'team-b': pts, submittedBy, createdAt } } }`
- Each group is worth 1 point total. Result is win (1-0), halve (0.5-0.5), or loss (0-1). Ryder Cup format.
- `aggregateGroupResults(roundId)` sums all group results for a round into ROUND_RESULTS, preserving the latest submitter as submittedBy
- Seed data: GROUP_RESULTS pre-populated for rounds r1 and r2 with per-group breakdowns that sum to match existing ROUND_RESULTS values (2.5-1.5 and 1.5-2.5)
- ScoreEntry component: bottom-sheet overlay with group roster (split by team), 3-way result selector (Team A wins / Halved / Team B wins), points preview, submit button
- Existing results shown with green "Scored" indicator and score on group cards; unscored groups show "Enter score" with edit icon
- Groups tab header now uses active round data dynamically instead of hardcoded "Round 3 · Sabotage · Pacific Dunes"
- `scoreNonce` state forces re-render of LiveLeaderboard when scores change (since GROUP_RESULTS is module-level)
- LiveLeaderboard now accepts `notify` prop; App passes `notifyAndRefresh` to it
- Score_submitted notification now fully wired (was stubbed in 2.3)
- Sabotage and skins formats show a stub with format-specific message: "Sabotage elimination tracking coming soon" / "Skins payouts coming soon"
- Round 3 (active) is Sabotage format — tapping a group opens the stub. To test full score entry, change round r3's format to 'scramble' or r3's status to test with a scramble round.

## Completed Tasks (continued)
- [x] 2.5 — Implemented team chat privacy: restructured TRIP_MESSAGES[tripId].team from a flat array to an object keyed by teamId; TripMessages and TripDetail now use getTeamId() to load only the current user's team channel; added "You're not on a team yet" placeholder for unassigned users; added team-b seed messages; corrected rob's message (he's team-b per TEAM_ASSIGNMENTS)

## Notes from 2.5
- TRIP_MESSAGES[tripId].team shape changed: was `[...msgs]`, now `{ 'team-a': [...], 'team-b': [...] }`
- TripMessages: myTeamId = getTeamId(BBMI_EVENT._id, CURRENT_USER._id); myTeamMsgs = TRIP_MESSAGES[tripId]?.team?.[myTeamId] || []
- TripDetail inline teamMessages uses same pattern via myTripDetailTeamId variable
- Dev role switcher does NOT affect team visibility — team is fixed by TEAM_ASSIGNMENTS regardless of viewerRole
- 'trip-new-deciding' team changed from [] to {} to match new shape

## Completed Tasks (continued)
- [x] 2.6 — Added expense creation: AddExpenseForm in MoreTab with title, amount, paid-by dropdown, split-among checkboxes; pushes to EXPENSES array and updates local expenseList state; gated on canEdit; Trip Total and Your Share update after add

## Notes from 2.6
- AddExpenseForm is a nested function inside MoreTab (same scope as ExpenseRow)
- MoreTab now owns `expenseList` state (initialized from EXPENSES.filter) and `addExpenseOpen` state
- On submit: push to EXPENSES module-level array + setExpenseList(EXPENSES.filter(...)) to trigger re-render
- Add button hidden while form is open; Cancel/submit both call onClose() which sets addExpenseOpen=false
- "Just me" shortcut in split-among resets to Set([paidBy]) — sensible default when someone pays solo
- Per-person preview only shows when parsedAmount > 0
- Phase 2 (Missing Features) is now complete (2.1–2.6)

## Completed Tasks (continued)
- [x] 3.1 — Extracted scoring engine into pure function computeScores(event, roundResults): parameter instead of ROUND_RESULTS global, returns { ...teamTotals, remaining }; removed manual remaining calc from LiveLeaderboard; all 3 call sites updated; old computeTeamScores removed

## Notes from 3.1
- computeScores(event, roundResults) — both arguments required at every call site
- remaining = totalPossible - awarded, where totalPossible = sum(r.pointsAvailable) + sum(s.pointsAvailable)
- awarded = Object.values(totals).reduce(...) — sums all team point totals
- The `remaining` key in the return object doesn't collide with any team ID since team IDs are 'team-a'/'team-b'
- LiveLeaderboard previously computed totalPossible + remaining inline — those 2 lines removed, replaced with scores.remaining
- scoreNonce still needed to force LiveLeaderboard re-render when GROUP_RESULTS mutates (computeScores is pure but LiveLeaderboard is a plain function call, not a hook)

## Completed Tasks (continued)
- [x] 3.2 — Replaced DESTINATION_LOCK / DATE_POLL globals with trip-level state: added `lockedDestination` and `datePoll` fields to all 3 MOCK_TRIPS entries and TripNew template; updated getTripStatus() to read from trip object; TripDetail lockedDest/setLockedDest now derived from trip state via setTrips; syncDatePoll now writes via setTrips; IdeaComparison lock/unlock/override all write via setTrips; removed both module-level globals; passed setTrips prop to TripDetail and IdeaComparison from App

## Notes from 3.2
- `lockedDestination` shape: `{ title, location, createdAt }` or `null` — same shape as old DESTINATION_LOCK values
- `datePoll` shape: `{ open, lockedId, windows: [], votes: [] }` or `null` — same shape as old DATE_POLL values
- TripDetail's `lockedDest` is now a derived value (`trip.lockedDestination || null`), not useState — avoids stale state divergence
- TripDetail's `setLockedDest` is a convenience function that calls `setTrips(ts => ts.map(...))`
- TripDetail's `syncDatePoll` now calls `setTrips` instead of mutating the module-level DATE_POLL object
- IdeaComparison writes destination lock directly via `setTrips` (3 write sites: lock confirm, reopen vote, manual override)
- TripNew sets `lockedDestination` on new trips with known destination (title + location from form input)
- getTripStatus() now reads `trip.lockedDestination` and `trip.datePoll` instead of globals — no functional change
- No `scoreNonce` equivalent needed — destination lock and date poll changes now trigger React re-renders naturally via `setTrips`
## Completed Tasks (continued)
- [x] 3.3 — Created PERMISSIONS.md: audited every isOwner (25), canEdit (43), viewerRole (3), and member.role (2) check in the prototype; documented all actions across 10 categories (Trip Management, Destination, Ideas, Dates, Quick Info Tiles, Crew, Competition, Logistics, Expenses, Messages); included RLS migration notes and 5 open questions for production

## Notes from 3.3
- Three-tier model: Owner (full control), Planner (planning authority), Member (vote/chat/view)
- `isOwner` gates: destination lock/unlock, crew role management, trip settings, quick info tiles, expense editing, idea removal
- `canEdit` (Owner+Planner) gates: description editing, idea/destination addition, date management, competition setup, crew addition, expense creation
- No role check: destination voting, date voting, idea commenting, chat messaging, score entry
- Team chat privacy is enforced by TEAM_ASSIGNMENTS lookup, not by role — all 3 roles see only their own team's chat
- Score entry (LiveLeaderboard) has NO role gating at all — flagged as open question for production
- TripSettingsPanel (series, transfer, archive, delete) is fully owner-gated at the render level (line 2991)
- `isMe` pattern prevents self-promotion/demotion/removal — uses hardcoded userId mapping per role (Owner→brad, Planner→zach, Member→rob)
## Completed Tasks (continued)
- [x] 3.4 — Created types.ts with complete TypeScript interfaces for all 25+ entities: User, Series, Trip (with LockedDestination, DatePoll, DateWindow, DatePollVote, ProposedDate), TripMember, Idea, IdeaVote, IdeaComment, DateVote, Event, Team, Player, TeamAssignment, PlayGroup, Round, SideEvent, RoundResult, GroupResult, Reservation, Expense, ExpenseSplit, Message, NotificationEvent (with typed payloads), SeriesHistory, PastParticipant, QuickInfoTile, TripStatus, ScoreSummary

## Notes from 3.4
- `types.ts` is a reference document, not imported by the prototype — it defines the migration target schema
- Each top-level interface maps to a database table; embedded interfaces (DatePoll, LockedDestination) annotated as column-or-table decisions
- Union types defined for enums: TripRole, RsvpStatus, RoundFormat, RoundStatus, EventStatus, MessageChannel, NotificationType, ReservationType, TripStatus
- NotificationPayloads uses a mapped type so payload shape is type-safe per notification type
- DATE_VOTES and DatePollVote coexist in the prototype (different field names: dateId/availability vs windowId/answer) — noted for consolidation during migration
- RoundResult and GroupResult use index signatures for team scores plus fixed metadata fields (submittedBy, createdAt) — in production, normalize into separate columns
- QuickInfoTile is component-local state in the prototype (not persisted to module-level data) — needs tripId and createdBy in production
- Message in prototype lacks tripId/channel/teamId (inferred from TRIP_MESSAGES nesting) — production table needs explicit columns
- ExpenseSplit.amount is commented as not-yet-implemented (currently even split)
- SeriesHistory and PastParticipant are component-local display data; in production, derive from trip_members + events tables
- lockedDestination stored as Trip field per PLAYBOOK decision point 3.4 (not separate entity)
## Completed Tasks (continued)
- [x] 4.1 — Audited all list/section areas for empty states; added 3 fixes: (1) Dashboard Past Trips section was declared but never rendered — now shows collapsible toggle with count below Upcoming; (2) Dashboard shows an icon + message + New Trip CTA when live/ready/upcoming are all empty; (3) Schedule tab "No bookings yet" enriched with ClipboardList icon and canEdit CTA hint

## Notes from 4.1
- `past` array and `pastExpanded` state were already declared at Dashboard top (lines 924, 928) — the section was just never in the JSX
- Empty state for no trips only fires when all three sections (live/ready/upcoming) are empty — past trips section renders separately below
- Schedule tab Add button was already visible for canEdit; the empty state message now points to it explicitly
- All other sections already had appropriate empty states (expenses, messages, description, ideas, date panel, competition)
## Completed Tasks (continued)
- [x] 4.2 — Audited all 7 screen navigation paths; fixed 4 bugs: (1) LiveLeaderboard "← TRIP HOME" hardcoded 'trip-bbmi-live' — now accepts tripId prop with fallback; (2) all 3 navigate('live-leaderboard') call sites now pass tripId; (3) TripNew breadcrumb root changed 'Dashboard' → 'Trips' for consistency; (4) CompetitionSetup mode picker had no Cancel button — added "← Cancel" back to trip-detail

## Notes from 4.2
- Navigation audit: 7 screens × multiple entry/exit points checked
- All breadcrumbs now consistent: root always "Trips" (screen: 'trips')
- LiveLeaderboard is tightly coupled to BBMI mock data but tripId is now wired through; 'trip-bbmi-live' fallback handles direct URL access
- CompetitionSetup already had breadcrumb "Trips > {trip} > Competition Setup" and correct post-submit navigation; the only gap was the mode picker had no explicit Cancel
- All other paths (TripDetail tabs, IdeaComparison, TripMessages, TripNew) had correct round-trip navigation already
- Next task: 4.3 — Test the complete user journey per role (Opus recommended — consider switching models)

## In Progress
- (none)

## Known Issues / Notes
- raw.githubusercontent.com blocked in Claude chat container
- ICONS dict: any missing icon fails silently (empty SVG, no error)

## Next Session Start Instructions
Read PLAYBOOK.md and CONTEXT.md before touching any code.
Work one task at a time. Update CONTEXT.md before ending session.

## CONTEXT.md instructions
Update CONTEXT.md with what we completed, what's in progress, and any notes the next session needs.
Upon completion of task, review suggested model for next task and tell me when I should switch to a different model for the next task when you write your summary.
Upon completion of task, commit all changes to a separate feature branch, push to remote, and create a PR.
