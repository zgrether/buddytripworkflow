/**
 * BuddyTrip — Complete TypeScript Interfaces
 *
 * These interfaces define every entity in the BuddyTrip data model.
 * They are the definitive schema for the Supabase migration — each
 * top-level interface maps to a database table (or a column on one).
 *
 * Naming conventions:
 *   - IDs are plain strings: 'brad', 'trip-bbmi', 'idea-scottsdale'
 *   - Dates stored as ISO strings (YYYY-MM-DD) for date-only fields
 *   - Timestamps stored as Date objects (maps to timestamptz in Postgres)
 *   - Foreign keys end with `Id` (tripId, userId, eventId, etc.)
 */

// ─── Core Entities ───────────────────────────────────────────────

/** Registered user. Maps to `users` table. */
export interface User {
  _id: string
  name: string           // Full name: "Zach Grether"
  nickname: string       // Display name: "Grether"
  email: string
  firstName?: string     // Only present on CURRENT_USER; derivable from name
}

/** Recurring trip series (e.g., "BBMI"). Maps to `series` table. */
export interface Series {
  _id: string
  name: string           // Short name: "BBMI"
  fullName: string       // Full name: "The Buddy Banks Memorial Invitational"
  years: string          // Display string: "2019–present"
  trips: number          // Count of trips in this series
}

// ─── Trip ────────────────────────────────────────────────────────

/** A trip. The central entity. Maps to `trips` table. */
export interface Trip {
  _id: string
  title: string
  location: string | null           // Set directly or derived from lockedDestination
  costTier: string | null           // '$' | '$$' | '$$$' | '$$$$'
  imageUrl: string | null
  description: string
  startDate: string | null          // ISO date (YYYY-MM-DD)
  endDate: string | null            // ISO date (YYYY-MM-DD)
  accommodation: string | null
  notes: string | null
  activities: string[]
  golfCourses: string[]
  comparisonMode: boolean           // true = destination voting active
  proposedDates: ProposedDate[]
  eventId: string | null            // FK → Event._id (competition linked to this trip)
  lockedDestination: LockedDestination | null
  datePoll: DatePoll | null

  // Nested in prototype; separate tables in production
  attendees: TripMember[]
  ideas: Idea[]
}

/** Destination lock state. Embedded on Trip in prototype; could be a column or separate entity. */
export interface LockedDestination {
  title: string                     // Name of the locked destination
  location: string                  // Location string (often same as title)
  createdAt: Date                   // When it was locked
}

/** Date poll state. Embedded on Trip in prototype; separate table in production. */
export interface DatePoll {
  open: boolean                     // Whether the poll is accepting votes
  lockedId: string | null           // FK → DateWindow._id (winning window)
  windows: DateWindow[]
  votes: DatePollVote[]
}

/** A date window option within a DatePoll. */
export interface DateWindow {
  _id: string
  start: string                     // ISO date (YYYY-MM-DD)
  end: string                       // ISO date (YYYY-MM-DD)
}

/** A vote on a date window within a DatePoll. */
export interface DatePollVote {
  windowId: string                  // FK → DateWindow._id
  userId: string                    // FK → User._id
  answer: 'yes' | 'no'
  createdAt: Date
}

/** A proposed date range on a trip (separate from DatePoll windows). */
export interface ProposedDate {
  _id: string
  start: string                     // ISO date (YYYY-MM-DD)
  end: string                       // ISO date (YYYY-MM-DD)
}

// ─── Trip Membership ─────────────────────────────────────────────

export type TripRole = 'Owner' | 'Planner' | 'Member'
export type RsvpStatus = 'in' | 'likely' | 'maybe' | 'out'

/** A user's membership on a trip. Maps to `trip_members` table. */
export interface TripMember {
  name: string                      // Denormalized display name (resolve via USERS in production)
  userId: string                    // FK → User._id
  status: RsvpStatus
  role: TripRole
  joinedAt: Date
}

// ─── Destination Ideas & Voting ──────────────────────────────────

/** A destination idea for a trip in comparison mode. Maps to `ideas` table. */
export interface Idea {
  _id: string
  title: string
  location: string
  description: string
  golfCourses: string[]
  activities: string[]
  costTier: string | null
  proposedDates: { start: string; end: string }[]
  pros: string[]
  cons: string[]
  imageUrl: string | null
  accommodation?: string
  notes?: string
  archived: boolean
}

/** A vote for a destination idea. Maps to `idea_votes` table. */
export interface IdeaVote {
  tripId: string                    // FK → Trip._id
  ideaId: string                    // FK → Idea._id
  userId: string                    // FK → User._id
  createdAt: Date
}

/** A comment on a destination idea. Maps to `idea_comments` table. */
export interface IdeaComment {
  _id: string
  tripId: string                    // FK → Trip._id
  ideaId: string                    // FK → Idea._id
  userId: string                    // FK → User._id
  text: string
  createdAt: Date
}

// ─── Date Voting (Legacy/Alternate) ──────────────────────────────
// Note: DATE_VOTES exists alongside datePoll.votes in the prototype.
// In production, consolidate into one pattern (DatePoll is preferred).

/** A vote on a proposed date (module-level DATE_VOTES array). */
export interface DateVote {
  tripId: string                    // FK → Trip._id
  dateId: string                    // FK → ProposedDate._id
  userId: string                    // FK → User._id
  availability: 'yes' | 'maybe' | 'no'
  createdAt: Date
}

// ─── Competition / Event ─────────────────────────────────────────

export type EventStatus = 'active' | 'completed' | 'upcoming'
export type RoundFormat = 'scramble' | 'stableford' | 'sabotage' | 'skins'
export type RoundStatus = 'upcoming' | 'active' | 'submitted' | 'closed'

/** A competition event linked to a trip. Maps to `events` table. */
export interface Event {
  _id: string
  tripId: string                    // FK → Trip._id
  title: string
  subtitle: string
  motto: string
  location: string
  dates: string                     // Display string: "March 11–14, 2025"
  status: EventStatus

  // Nested in prototype; separate tables in production
  teams: Team[]
  players: Player[]
  groups: PlayGroup[]
  rounds: Round[]
  sides: SideEvent[]
}

/** A team within a competition. Maps to `teams` table. */
export interface Team {
  _id: string
  name: string                      // "Team Hammer"
  shortName: string                 // "HAMMER"
  color: string                     // Hex color: "#00e676"
  colorDim: string                  // Dimmed variant: "#00e67640"
}

/** A player in a competition (roster entry). Maps to `players` table. */
export interface Player {
  _id: string                       // Same as User._id
  name: string                      // Denormalized display name
  nickname: string                  // Denormalized nickname
  handicap: number
}

/** Team assignment — links a user to a team for a specific event. Maps to `team_assignments` table. */
export interface TeamAssignment {
  eventId: string                   // FK → Event._id
  teamId: string                    // FK → Team._id
  userId: string                    // FK → User._id
}

/** A playing group (foursome). Maps to `play_groups` table. */
export interface PlayGroup {
  _id: string
  name: string                      // "Group 1"
  teeTime: string                   // "8:00 AM"
  playerIds: string[]               // FK[] → Player._id (User._id)
}

/** A round of competition. Maps to `rounds` table. */
export interface Round {
  _id: string
  day: number                       // 1-indexed day number
  title: string                     // "Day 1 — Scramble"
  course: string                    // "Bandon Dunes"
  format: RoundFormat
  status: RoundStatus
  pointsAvailable: number           // Total points up for grabs this round
}

/** A side event (non-golf competition). Maps to `side_events` table. */
export interface SideEvent {
  _id: string
  name: string                      // "Hammerschlagen"
  icon: string                      // Emoji: "🔨"
  pointsAvailable: number
  status: 'complete' | 'upcoming'
  result: Record<string, number>    // { [teamId]: points } — e.g., { 'team-a': 1, 'team-b': 0 }
}

// ─── Scoring ─────────────────────────────────────────────────────

/**
 * Round result — aggregate score for a round, keyed by teamId.
 * Maps to `round_results` table.
 *
 * In the prototype, ROUND_RESULTS is `{ [roundId]: RoundResult }`.
 * Each RoundResult has team scores plus metadata.
 */
export interface RoundResult {
  [teamId: string]: number          // Points per team (e.g., 'team-a': 2.5)
  submittedBy: string               // FK → User._id (last submitter)
  createdAt: Date
}

/**
 * Group result — per-group score within a round.
 * Maps to `group_results` table.
 *
 * In the prototype, GROUP_RESULTS is `{ [roundId]: { [groupId]: GroupResult } }`.
 * Values are 0 (loss), 0.5 (halve), or 1 (win) per team.
 */
export interface GroupResult {
  [teamId: string]: number          // 0 | 0.5 | 1 per team
  submittedBy: string               // FK → User._id
  createdAt: Date
}

// ─── Logistics ───────────────────────────────────────────────────

export type ReservationType = 'accommodation' | 'tee-time' | 'restaurant' | 'transport'

/** A booking or reservation. Maps to `reservations` table. */
export interface Reservation {
  _id: string
  tripId: string                    // FK → Trip._id
  type: ReservationType
  title: string
  date: string                      // ISO date (YYYY-MM-DD)
  startTime: string                 // "3:00 PM"
  confirmationNumber: string
  cost: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

// ─── Expenses ────────────────────────────────────────────────────

/** A trip expense. Maps to `expenses` table. */
export interface Expense {
  _id: string
  tripId: string                    // FK → Trip._id
  title: string
  amount: number
  paidByUserId: string              // FK → User._id
  splitAmong: ExpenseSplit[]
  createdAt: Date
  updatedAt: Date
}

/** An expense split assignment. Maps to `expense_splits` table. */
export interface ExpenseSplit {
  userId: string                    // FK → User._id
  // amount?: number               // Per-person override (not yet implemented; currently even split)
}

// ─── Messages ────────────────────────────────────────────────────

export type MessageChannel = 'trip' | 'team'

/** A chat message. Maps to `messages` table. */
export interface Message {
  _id: string
  userId: string                    // FK → User._id
  text: string
  createdAt: Date
  // In production, add these columns:
  // tripId: string                 // FK → Trip._id
  // channel: MessageChannel        // 'trip' | 'team'
  // teamId?: string                // FK → Team._id (required when channel = 'team')
}

// ─── Notifications ───────────────────────────────────────────────

export type NotificationType =
  | 'destination_locked'
  | 'dates_locked'
  | 'crew_added'
  | 'chat_message'
  | 'score_submitted'

/** Payload shapes per notification type. */
export interface NotificationPayloads {
  destination_locked: { destination: string }
  dates_locked: { dateRange: string }
  crew_added: { memberName: string }
  chat_message: { preview: string }
  score_submitted: { roundTitle: string }
}

/** An in-app notification event. Maps to `notification_events` table. */
export interface NotificationEvent {
  _id: string
  type: NotificationType
  tripId: string                    // FK → Trip._id
  actorId: string                   // FK → User._id (who triggered it)
  payload: NotificationPayloads[NotificationType]
  createdAt: Date
  readAt: Date | null               // null = unread
}

// ─── Series History (Display-Only) ───────────────────────────────

/** Per-user historical stats for a series. Component-local in prototype. */
export interface SeriesHistory {
  years: string[]                   // Years participated: ['2019', '2020', ...]
  wins: number
  losses: number
  hcp: number                       // Current handicap
}

/** A past participant record for "frequently trips with" display. */
export interface PastParticipant {
  userId: string                    // FK → User._id
  name: string                      // Denormalized display name
  hasAccount: boolean               // Whether they have a BuddyTrip account
}

// ─── Quick Info Tiles ────────────────────────────────────────────

/** A custom info tile on the trip home screen. Maps to `quick_info_tiles` table. */
export interface QuickInfoTile {
  id: string
  label: string                     // "Door Code", "Wifi", etc.
  value: string                     // "4892", "BandonGuest", etc.
  // In production, add:
  // tripId: string                 // FK → Trip._id
  // createdBy: string              // FK → User._id
  // createdAt: Date
}

// ─── Derived Types (Not Stored) ──────────────────────────────────

/** Trip status — computed by getTripStatus(trip), never stored. */
export type TripStatus = 'planning' | 'ready' | 'active' | 'completed'

/**
 * Score summary — returned by computeScores(event, roundResults).
 * Keys are teamIds plus 'remaining'.
 */
export type ScoreSummary = Record<string, number>
// e.g., { 'team-a': 10, 'team-b': 13, remaining: 12 }
