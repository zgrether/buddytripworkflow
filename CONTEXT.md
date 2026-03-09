# BuddyTrip — Session Context

## Last Updated
2026-03-09 — Task 1.2 complete

## Current State
- buddytrip.html: ~4730 lines
- All known icon references verified against ICONS dict
- Team scores are now computed from data, not hardcoded
- Expense splits now keyed by userId, not first names
- All user IDs unified — single format (plain IDs, no prefixes)
- All votes, comments, and date polls reference stable IDs instead of array indexes

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

## Notes from 1.2
- Ideas now have `_id` fields: 'idea-scottsdale', 'idea-bandon', 'idea-scottsdale-2027'
- Proposed dates have `_id` fields: 'pd-mar-2026', 'pd-oct-2026'
- DATE_POLL windows have `_id` fields: 'dw-mar-2026', 'dw-oct-2026'
- New ideas/windows created at runtime generate IDs via `Date.now()` suffix
- IdeaComparison `IdeaCard` still receives `idx` (array position) for internal pro/con/description editing — this is fine since those operations are position-based within the local state array
- `lockedIn` state in IdeaComparison now stores idea `_id` instead of index
- `showLockConfirm` state now stores idea `_id` instead of index
- `mobileIdx` in IdeaComparison remains an index (for carousel navigation) — this is UI state, not data identity

## In Progress
- [ ] 1.3 — Add createdAt and updatedAt everywhere (Sonnet task)

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