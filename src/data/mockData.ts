export const CURRENT_USER = { _id: 'zach', name: 'Zach Grether', firstName: 'Zach', nickname: 'Grether', email: 'zgrether@gmail.com' }

function standardHoles(pars: number[]) {
  return pars.map((par, i) => ({ hole: i + 1, par }))
}

export const BBMI_EVENT = {
  _id: 'bbmi-2025',
  tripId: 'trip-bbmi-live',
  title: 'BBMI 2025',
  subtitle: 'Buddy Banks Memorial Invitational',
  motto: '"If You\'re Not First, You\'re Last"',
  location: 'Bandon Dunes, OR',
  dates: 'March 11–14, 2025',
  status: 'active' as const,
  competitionType: 'RYDER_CUP' as const,

  teams: [
    { _id: 'team-a', name: 'Team Hammer', shortName: 'Hammer', color: '#00d4aa', colorDim: '#0d2a22' },
    { _id: 'team-b', name: 'Team Anvil',  shortName: 'Anvil',  color: '#f97316', colorDim: '#2a1200' },
  ],

  players: [
    { _id: 'p-brad',    name: 'Brad Giesler',     nickname: 'Brad',    teamId: 'team-a', handicap: 8,  groupId: 'g1' },
    { _id: 'p-zach',    name: 'Zach Grether',     nickname: 'Grether', teamId: 'team-a', handicap: 12, groupId: 'g2' },
    { _id: 'p-tyler',   name: 'Tyler Larson',     nickname: 'Tyler',   teamId: 'team-a', handicap: 14, groupId: 'g3' },
    { _id: 'p-ben',     name: 'Ben Bartkus',      nickname: 'Ben',     teamId: 'team-a', handicap: 16, groupId: 'g4' },
    { _id: 'p-merling', name: 'Jeremy Merling',   nickname: 'Merling', teamId: 'team-a', handicap: 10, groupId: 'g1' },
    { _id: 'p-steve',   name: 'Steve Bartkus',    nickname: 'Steve',   teamId: 'team-a', handicap: 18, groupId: 'g2' },
    { _id: 'p-fach',    name: 'Matt Facchine',    nickname: 'Fach',    teamId: 'team-a', handicap: 15, groupId: 'g3' },
    { _id: 'p-llama',   name: 'Llama Schumacher', nickname: 'Llama',   teamId: 'team-a', handicap: 20, groupId: 'g4' },
    { _id: 'p-jd',      name: 'JD Shumpert',      nickname: 'JD',      teamId: 'team-b', handicap: 7,  groupId: 'g1' },
    { _id: 'p-rob',     name: 'Rob Drupp',         nickname: 'Rob',     teamId: 'team-b', handicap: 11, groupId: 'g2' },
    { _id: 'p-charlie', name: 'Charlie Piper',     nickname: 'Charlie', teamId: 'team-b', handicap: 13, groupId: 'g3' },
    { _id: 'p-bj',      name: 'BJ Dames',          nickname: 'BJ',      teamId: 'team-b', handicap: 17, groupId: 'g4' },
    { _id: 'p-jrob',    name: 'John Robinson',     nickname: 'JRob',    teamId: 'team-b', handicap: 9,  groupId: 'g1' },
    { _id: 'p-buddy',   name: 'Buddy Banks',       nickname: 'Buddy',   teamId: 'team-b', handicap: 19, groupId: 'g2' },
    { _id: 'p-frank',   name: 'Frank Damen',       nickname: 'Frank',   teamId: 'team-b', handicap: 16, groupId: 'g3' },
    { _id: 'p-taj',     name: 'Tajar Varghese',    nickname: 'Taj',     teamId: 'team-b', handicap: 22, groupId: 'g4' },
  ],

  groups: [
    { _id: 'g1', name: 'Group 1', teeTime: '8:00 AM', playerIds: ['p-brad','p-merling','p-jd','p-jrob'] },
    { _id: 'g2', name: 'Group 2', teeTime: '8:12 AM', playerIds: ['p-zach','p-steve','p-rob','p-buddy'] },
    { _id: 'g3', name: 'Group 3', teeTime: '8:24 AM', playerIds: ['p-tyler','p-fach','p-charlie','p-frank'] },
    { _id: 'g4', name: 'Group 4', teeTime: '8:36 AM', playerIds: ['p-ben','p-llama','p-bj','p-taj'] },
  ],

  rounds: [
    {
      _id: 'r1', day: 1, title: 'Scramble', course: 'Bandon Dunes', format: 'scramble' as const,
      status: 'complete' as const, pointsAvailable: 4,
      pointDistribution: { win: 1, tie: 0.5, loss: 0 },
      modifiers: [
        { type: 'ctp', holes: [4, 12], value: 0.5, label: 'CTP (-0.5 strokes)' },
        { type: 'ld',  holes: [7],     value: 0.5, label: 'Longest Drive (-0.5 strokes)' },
      ],
      specialRules: 'No moving tee boxes. Played from whites.',
      holes: standardHoles([4,4,4,4,5,3,5,3,4, 4,3,4,4,5,3,4,4,5]),
    },
    {
      _id: 'r2', day: 2, title: 'Stableford', course: 'Bandon Trails', format: 'stableford' as const,
      status: 'complete' as const, pointsAvailable: 4,
      pointDistribution: { win: 1, tie: 0.5, loss: 0 },
      modifiers: [],
      specialRules: 'Scoring: Eagle=9, Birdie=6, Par=4, Bogey=2, Double=1, Triple+=0. Full handicap applied.',
      holes: standardHoles([4,3,4,4,5,4,3,4,5, 4,3,5,4,4,3,4,5,4]),
    },
    {
      _id: 'r3', day: 3, title: 'Sabotage', course: 'Pacific Dunes', format: 'sabotage' as const,
      status: 'active' as const, pointsAvailable: 4,
      pointDistribution: { win: 1, tie: 0.5, loss: 0 },
      modifiers: [
        { type: 'ctp', holes: [3, 11], value: 1, label: 'CTP (-1 stroke, holes 3 & 11)' },
        { type: 'ld',  holes: [6],     value: 1, label: 'Longest Drive (-1 stroke, hole 6)' },
      ],
      specialRules: '3 sabotages per player per 9. One of each type. May not use same type on same opponent twice per 9.',
      holes: standardHoles([4,4,3,4,5,3,4,4,5, 3,4,4,4,5,3,4,4,5]),
    },
    {
      _id: 'r4', day: 4, title: 'Skins', course: 'Old Macdonald', format: 'skins' as const,
      status: 'upcoming' as const, pointsAvailable: 4,
      pointDistribution: { win: 1, tie: 0.5, loss: 0 },
      modifiers: [
        { type: 'double', holes: [16, 17, 18], value: 2, label: '⚡ Three Glorious Finishing Holes (2× skins)' },
        { type: 'ctp',    holes: [9],          value: 1, label: 'CTP hole 9 (-1 stroke)' },
      ],
      specialRules: 'Low score wins the hole. Ties carry over. Holes 16–18 worth 2 skins each.',
      holes: standardHoles([4,4,5,3,4,4,5,3,4, 4,3,5,4,4,5,3,4,5]),
    },
  ],

  sides: [
    { _id: 's1', name: 'Pool',           icon: '🎱', pointsAvailable: 5, status: 'complete' as const, result: { 'team-a': 2,   'team-b': 3   } },
    { _id: 's2', name: 'Hammerschlagen', icon: '🔨', pointsAvailable: 5, status: 'complete' as const, result: { 'team-a': 3,   'team-b': 2   } },
    { _id: 's3', name: 'Pick-Em',        icon: '🏈', pointsAvailable: 5, status: 'complete' as const, result: { 'team-a': 1,   'team-b': 4   } },
    { _id: 's4', name: 'Cornhole',       icon: '🌽', pointsAvailable: 5, status: 'upcoming' as const, result: { 'team-a': 0,   'team-b': 0   } },
  ],
}

export const LIVE_SCORES: Record<string, (number | null)[]> = {
  'p-brad':    [4,3,4,5,5,4,4,3,5, 4,3,5,4,4, null,null,null,null],
  'p-merling': [4,4,5,4,6,3,4,4,5, 5,4,5,5,3, null,null,null,null],
  'p-jd':      [3,4,3,4,5,3,4,3,4, 4,3,4,3,4, null,null,null,null],
  'p-jrob':    [4,4,4,5,5,4,5,4,5, 4,4,5,4,5, null,null,null,null],
  'p-zach':    [5,4,4,5,6,3,5,4,4, 4,3,5, null,null,null,null,null,null],
  'p-steve':   [5,5,4,6,6,4,5,5,6, 5,4,6, null,null,null,null,null,null],
  'p-rob':     [4,4,3,5,5,3,4,4,5, 4,3,4, null,null,null,null,null,null],
  'p-buddy':   [5,5,5,5,6,4,5,5,6, 5,4,6, null,null,null,null,null,null],
  'p-tyler':   [4,4,3,5,5,4,4,3,5, null,null,null,null,null,null,null,null,null],
  'p-fach':    [5,4,4,5,6,3,4,4,6, null,null,null,null,null,null,null,null,null],
  'p-charlie': [4,3,3,4,5,3,4,3,4, null,null,null,null,null,null,null,null,null],
  'p-frank':   [5,4,4,5,6,4,5,4,5, null,null,null,null,null,null,null,null,null],
  'p-ben':     [5,4,4,5,6, null,null,null,null,null,null,null,null,null,null,null,null,null],
  'p-llama':   [6,5,5,6,7, null,null,null,null,null,null,null,null,null,null,null,null,null],
  'p-bj':      [4,4,3,5,5, null,null,null,null,null,null,null,null,null,null,null,null,null],
  'p-taj':     [5,5,4,6,6, null,null,null,null,null,null,null,null,null,null,null,null,null],
}

export const SABOTAGE_USED: Record<string, { type: 'misdemeanor'|'felony'|'capital'; targetId: string; hole: number }[]> = {
  'p-brad':    [{ type: 'capital',     targetId: 'p-jrob',    hole: 3 }],
  'p-merling': [],
  'p-jd':      [{ type: 'misdemeanor', targetId: 'p-brad',    hole: 7 }, { type: 'felony', targetId: 'p-merling', hole: 11 }],
  'p-jrob':    [{ type: 'capital',     targetId: 'p-brad',    hole: 5 }],
}

export const ROUND_RESULTS: Record<string, Record<string, number>> = {
  'r1': { 'team-a': 2.5, 'team-b': 1.5 },
  'r2': { 'team-a': 1.5, 'team-b': 2.5 },
}

// ─── Trips ────────────────────────────────────────────────────────────────────

export const MOCK_TRIPS = [
  // LIVE trip — BBMI 2025 in progress at Bandon Dunes
  {
    _id: 'trip-bbmi-live',
    title: 'BBMI 2025',
    location: 'Bandon Dunes, OR',
    status: 'active' as const,
    costTier: '$$$$',
    imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80',
    description: 'The Buddy Banks Memorial Invitational. 16 players, 4 days, Ryder Cup format. Day 3 underway — Sabotage round at Pacific Dunes.',
    startDate: '2025-03-11',
    endDate: '2025-03-14',
    accommodation: 'Bandon Dunes Lodge — Door code: 4892',
    notes: 'Caddies confirmed for all rounds. Walking only, no carts. Proper attire required on course.',
    activities: ['Golf', 'Hammerschlagen', 'Poker', 'Cards'],
    golfCourses: ['Bandon Dunes', 'Bandon Trails', 'Pacific Dunes', 'Old Macdonald'],
    attendees: BBMI_EVENT.players.map(p => ({
      name: p.name,
      userId: p._id,
      status: 'in' as const,
      role: p._id === 'p-brad' ? 'Owner' : p._id === 'p-zach' ? 'Planner' : 'Member',
    })),
    comparisonMode: false,
    ideas: [],
    proposedDates: [],
    eventId: 'bbmi-2025',
    createdAt: new Date('2024-06-01'),
  },
  // UPCOMING trip — BBMI 2026 planning
  {
    _id: 'trip-bbmi',
    title: 'BBMI 2026',
    location: 'Scottsdale, AZ',
    status: 'planning' as const,
    costTier: '$$$',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    description: 'Annual BBMI. Destination still being voted on — Scottsdale vs Bandon return.',
    startDate: '2026-03-09',
    endDate: '2026-03-12',
    accommodation: 'TBD — voting on destination first',
    notes: 'Need 6 firm commitments before booking anything.',
    activities: ['Golf', 'Poker', 'Hammerschlagen'],
    golfCourses: [],
    attendees: [
      { name: 'Brad Giesler',  userId: 'brad',    status: 'in'     as const, role: 'Owner'   },
      { name: 'Zach Grether',  userId: 'zach',    status: 'in'     as const, role: 'Planner' },
      { name: 'JD Shumpert',   userId: 'jd',      status: 'in'     as const, role: 'Planner' },
      { name: 'Rob Drupp',     userId: 'rob',      status: 'in'     as const, role: 'Member'  },
      { name: 'Charlie Piper', userId: 'charlie',  status: 'likely' as const, role: 'Member'  },
      { name: 'Tyler Larson',  userId: 'tyler',    status: 'in'     as const, role: 'Member'  },
      { name: 'Ben Bartkus',   userId: 'ben',      status: 'maybe'  as const, role: 'Member'  },
      { name: 'BJ Dames',      userId: 'bj',       status: 'in'     as const, role: 'Member'  },
    ],
    comparisonMode: true,
    ideas: [
      {
        title: 'Scottsdale Desert Escape', location: 'Scottsdale, AZ',
        description: '300 days of sunshine, saguaro cacti framing every shot, legendary nightlife.',
        golfCourses: ['TPC Scottsdale', 'We-Ko-Pa (Saguaro)', 'Troon North (Monument)'],
        activities: ['Golf', 'Pool time', 'Old Town Scottsdale', 'Desert hiking'],
        costTier: '$$$', proposedDates: [{ start: '2026-03-09', end: '2026-03-12' }],
        pros: ['300 days sun', 'World-class courses', 'Great nightlife'],
        cons: ['Expensive', 'Long flights for east-coasters'],
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        accommodation: 'Luxury rental home in North Scottsdale', notes: 'March is prime season.', archived: false,
      },
      {
        title: 'Bandon Dunes Return', location: 'Bandon, OR',
        description: 'The best golf in the US. Links-style, no carts, pure game.',
        golfCourses: ['Bandon Dunes', 'Pacific Dunes', 'Bandon Trails', 'Old Macdonald'],
        activities: ['Golf', 'Whiskey tasting', 'Cards'],
        costTier: '$$$$', proposedDates: [{ start: '2026-03-09', end: '2026-03-12' }],
        pros: ['Best golf in USA', 'Legendary setting', 'Only thing to do is golf'],
        cons: ['Very expensive', 'Remote', 'Weather unpredictable'],
        imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&q=80',
        accommodation: 'Lodge on-site', notes: 'Book 12+ months out.', archived: false,
      },
    ],
    proposedDates: [
      { start: '2026-03-09', end: '2026-03-12' },
      { start: '2026-10-05', end: '2026-10-08' },
    ],
    eventId: null,
    createdAt: new Date('2025-01-15'),
  },
]

export const IDEA_VOTES = [
  { tripId: 'trip-bbmi', ideaIndex: 0, userId: 'brad',    userName: 'Brad'    },
  { tripId: 'trip-bbmi', ideaIndex: 0, userId: 'zach',    userName: 'Zach'    },
  { tripId: 'trip-bbmi', ideaIndex: 1, userId: 'jd',      userName: 'JD'      },
  { tripId: 'trip-bbmi', ideaIndex: 1, userId: 'rob',     userName: 'Rob'     },
  { tripId: 'trip-bbmi', ideaIndex: 0, userId: 'tyler',   userName: 'Tyler'   },
  { tripId: 'trip-bbmi', ideaIndex: 1, userId: 'charlie', userName: 'Charlie' },
]

export const DATE_VOTES = [
  { tripId: 'trip-bbmi', proposedDateIndex: 0, userId: 'brad',  userName: 'Brad',  availability: 'yes'   },
  { tripId: 'trip-bbmi', proposedDateIndex: 0, userId: 'zach',  userName: 'Zach',  availability: 'yes'   },
  { tripId: 'trip-bbmi', proposedDateIndex: 0, userId: 'jd',    userName: 'JD',    availability: 'yes'   },
  { tripId: 'trip-bbmi', proposedDateIndex: 0, userId: 'rob',   userName: 'Rob',   availability: 'maybe' },
  { tripId: 'trip-bbmi', proposedDateIndex: 1, userId: 'brad',  userName: 'Brad',  availability: 'no'    },
  { tripId: 'trip-bbmi', proposedDateIndex: 1, userId: 'zach',  userName: 'Zach',  availability: 'yes'   },
]

export const TRIP_COMMENTS = [
  { _id: 'c1', tripId: 'trip-bbmi-live', userId: 'p-brad',  userName: 'Brad',    text: "Pacific Dunes is playing tough. Wind off the ocean all morning.", createdAt: new Date('2025-03-13T09:15:00') },
  { _id: 'c2', tripId: 'trip-bbmi-live', userId: 'p-jd',    userName: 'JD',      text: "Door code for the lodge is 4892 if anyone forgot.", createdAt: new Date('2025-03-11T14:00:00') },
  { _id: 'c3', tripId: 'trip-bbmi-live', userId: 'p-zach',  userName: 'Grether', text: "Dinner res at 7pm. Everyone be back by 6:30.", createdAt: new Date('2025-03-13T11:30:00') },
  { _id: 'c4', tripId: 'trip-bbmi-live', userId: 'p-buddy', userName: 'Buddy',   text: "Hammer better enjoy the lead while it lasts 😤", createdAt: new Date('2025-03-13T12:45:00') },
  { _id: 'c5', tripId: 'trip-bbmi',      userId: 'brad',    userName: 'Brad',    text: "Scottsdale in March is perfect. TPC is a must.", createdAt: new Date('2025-02-01T09:00:00') },
  { _id: 'c6', tripId: 'trip-bbmi',      userId: 'jd',      userName: 'JD',      text: "Bandon > everything. We said we'd go back.", createdAt: new Date('2025-02-03T14:22:00') },
  { _id: 'c7', tripId: 'trip-bbmi',      userId: 'zach',    userName: 'Grether', text: "Vote above. Need 6 firm before I book anything.", createdAt: new Date('2025-02-10T08:15:00') },
]

export const RESERVATIONS = [
  { _id: 'res-1', tripId: 'trip-bbmi-live', type: 'accommodation', title: 'Bandon Dunes Lodge', date: '2025-03-11', startTime: '3:00 PM', confirmationNumber: 'BD-8821', cost: 6400, notes: '4 nights, 8 rooms. Check-out Mar 15.' },
  { _id: 'res-2', tripId: 'trip-bbmi-live', type: 'tee-time',      title: 'Bandon Dunes — Round 1 Scramble', date: '2025-03-11', startTime: '8:00 AM', confirmationNumber: 'TT-1101', cost: 1800, notes: '4 groups of 4. Caddies included.' },
  { _id: 'res-3', tripId: 'trip-bbmi-live', type: 'tee-time',      title: 'Bandon Trails — Round 2 Stableford', date: '2025-03-12', startTime: '8:00 AM', confirmationNumber: 'TT-1102', cost: 1800, notes: '' },
  { _id: 'res-4', tripId: 'trip-bbmi-live', type: 'tee-time',      title: 'Pacific Dunes — Round 3 Sabotage', date: '2025-03-13', startTime: '8:00 AM', confirmationNumber: 'TT-1103', cost: 1800, notes: 'Best course on property.' },
  { _id: 'res-5', tripId: 'trip-bbmi-live', type: 'tee-time',      title: 'Old Macdonald — Round 4 Skins', date: '2025-03-14', startTime: '8:00 AM', confirmationNumber: 'TT-1104', cost: 1600, notes: 'Final round. Stakes doubled on 16–18.' },
  { _id: 'res-6', tripId: 'trip-bbmi-live', type: 'restaurant',    title: 'Gallery Restaurant — Night 1 Dinner', date: '2025-03-11', startTime: '7:00 PM', confirmationNumber: 'GAL-449', cost: 0, notes: 'Pre-paid with lodge package.' },
]

export const EXPENSES = [
  { _id: 'exp-1', tripId: 'trip-bbmi-live', title: 'Lodge & Rooms', amount: 6400, paidByName: 'Brad', splitAmong: BBMI_EVENT.players.map(p => ({ name: p.nickname })) },
  { _id: 'exp-2', tripId: 'trip-bbmi-live', title: 'Round 1 Greens Fees', amount: 1800, paidByName: 'Brad', splitAmong: BBMI_EVENT.players.map(p => ({ name: p.nickname })) },
  { _id: 'exp-3', tripId: 'trip-bbmi-live', title: 'Round 2 Greens Fees', amount: 1800, paidByName: 'JD', splitAmong: BBMI_EVENT.players.map(p => ({ name: p.nickname })) },
  { _id: 'exp-4', tripId: 'trip-bbmi-live', title: 'Van Rental (airport)', amount: 420, paidByName: 'Grether', splitAmong: BBMI_EVENT.players.map(p => ({ name: p.nickname })) },
  { _id: 'exp-5', tripId: 'trip-bbmi-live', title: 'Night 2 Bar Tab', amount: 680, paidByName: 'Grether', splitAmong: BBMI_EVENT.players.map(p => ({ name: p.nickname })) },
]

export const MOCK_EVENT = BBMI_EVENT

// ─── Idea comments (contextual, per-destination) ──────────────────────────────
export const IDEA_COMMENTS = [
  { _id: 'ic-1', tripId: 'trip-bbmi', ideaIndex: 0, userId: 'brad',    userName: 'Brad',    text: "TPC Scottsdale is bucket list. We do this.", createdAt: new Date('2025-02-02T10:00:00') },
  { _id: 'ic-2', tripId: 'trip-bbmi', ideaIndex: 0, userId: 'tyler',   userName: 'Tyler',   text: "We-Ko-Pa Saguaro is world class. Second vote for Scottsdale.", createdAt: new Date('2025-02-04T09:00:00') },
  { _id: 'ic-3', tripId: 'trip-bbmi', ideaIndex: 0, userId: 'charlie', userName: 'Charlie', text: "Flights are way easier from my end. +1", createdAt: new Date('2025-02-11T11:30:00') },
  { _id: 'ic-4', tripId: 'trip-bbmi', ideaIndex: 1, userId: 'jd',      userName: 'JD',      text: "We literally said we'd go back. Nothing compares.", createdAt: new Date('2025-02-03T14:22:00') },
  { _id: 'ic-5', tripId: 'trip-bbmi', ideaIndex: 1, userId: 'rob',     userName: 'Rob',     text: "Old Macdonald for the final round. That's the one.", createdAt: new Date('2025-02-05T16:00:00') },
]
