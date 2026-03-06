# BuddyTrip — TODO

---

## 🔥 Next Session Priority

### 1. TripNew — Simplify the creation flow
The current `TripNew.tsx` is a stub and needs a real implementation. Keep it tight — the goal is to get a trip created fast, not fill out a form.

**Fields at creation time only:**
- Trip name (required)
- Dates or "TBD" toggle
- Location (free text, can be vague like "TBD — Pacific Northwest")
- Invite by name/email (optional, can skip)

Everything else (description, courses, activities, competition, expenses) lives in TripDetail after creation. The mental model: create is a 30-second act, filling it in happens over weeks.

**UX target:** Single scrollable form, no wizard/stepper, one big "Create Trip" button. Name autofocused on open.

---

### 2. Competition Setup — Teams screen
Currently "Add Competition" assigns teams but has no concept of *how* teams are formed. Two modes needed:

**Manual Assignment (default)**
- Owner assigns everyone to a team
- Team names are editable
- Already mostly built in AddCompetitionModal — just needs to be the explicit default path

**Captain's Draft (optional)**
- Owner designates 2 captains
- Owner sets draft order (serpentine suggested, manually reorderable via drag or up/down)
- Owner clicks "Start Draft" — first captain gets email notification
- Captain selects a player → added to team → advances to next captain
- Repeat until all players drafted
- Non-captain players see a "waiting to be drafted" state

**Placement in flow:** Competition Setup screen should live between TripDetail Home tab CTA and the existing AddCompetitionModal. Think of it as Step 0: "How do you want to form teams?"

---

### 3. Trip Settings — Owner screen
Currently just a list of buttons in the More tab. Needs real structure:

**Settings to implement:**
- [ ] Assign to Series (link trip to BBMI series object — series survives ownership changes)
- [ ] Transfer Ownership (show crew list, pick new owner, confirm)
- [ ] Competition on/off — suspend rounds (don't delete), show suspended state in Home tab hero
- [ ] Archive trip — moves to Past on Dashboard, read-only
- [ ] Delete trip — destructive confirm dialog, "type the trip name to confirm" pattern

**Series concept:** A Series is a named recurring event (e.g. "BBMI") that owns the historical record. Individual trips belong to a series. Ownership of a trip can transfer; the series record doesn't move.

---

## 🟡 Backlog (lower priority, good problems to have)

### Crew invite flow
The roster is intentionally loose during planning. Once destination is locked, the invite flow matters. Needs design work before building:
- Account lookup (does this person have a BuddyTrip account?)
- If yes: send in-app invite, they accept/decline
- If no: send email invite link, they join on first open
- Planner promotion: after accepting, owner can promote from Member → Planner
- Bulk invite: paste a list of emails

### Expense improvements
- Settlement view: who owes who, net amounts
- Mark as paid
- Receipt photo attachment (future)
- Export to CSV/Venmo note

### Dashboard — "Welcome back" personalization
Currently hardcoded to "Welcome back, Grether". Should reflect the active role from the dev switcher (and eventually real auth).

### Past trips
Currently collapsed on Dashboard with a toggle. Long-term: searchable, filterable by series, shows series win/loss record.

### Scoring — Sabotage format details
The Sabotage round format (last-place elimination) needs its elimination logic wired into the score entry and leaderboard. Currently shows as active but doesn't process eliminations.

---

## ✅ Done

- [x] Scoring engine (LiveLeaderboard, LiveScoreEntry, RoundBuilder)
- [x] Dashboard with Live/Upcoming/Past sections
- [x] TripDetail 4-tab structure (Home, Schedule, Crew, More)
- [x] Role system (Owner / Planner / Member) + dev switcher
- [x] Add Competition modal with team assignment
- [x] Quick Info tiles (owner-editable, crew read-only)
- [x] Trip header card with state silhouette SVG
- [x] Expense split editing (per-person assignment)
- [x] IdeaComparison with contextual comment threads
- [x] Date voting with availability bars
- [x] Roster-in-flux warning when destination not locked
- [x] Navigation fixed (Dashboard → TripDetail)
