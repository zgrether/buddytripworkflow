import { useState } from 'react'
import { BBMI_EVENT } from '../data/mockData'
import {
  Users, RefreshCw, Flag, BarChart2, Skull, Zap, Target,
  MapPin, Wind, Bolt, Umbrella, Smile, Pencil,
  CheckCircle, AlertCircle, MinusCircle, X, Trash2, CloudRain,
  ArrowLeft, ChevronRight, Save, CheckSquare
} from 'lucide-react'

// ─── Static data ───────────────────────────────────────────────────────────────

const FORMATS = [
  { id: 'scramble',   label: 'Scramble',    desc: 'Team plays one ball. Best shot each time.',                              icon: 'scramble' },
  { id: 'bestball',   label: 'Best Ball',   desc: 'Each player plays their own. Best score per hole counts for team.',       icon: 'bestball' },
  { id: 'stroke',     label: 'Stroke Play', desc: 'Individual gross/net scores. Sum to team total.',                         icon: 'stroke' },
  { id: 'stableford', label: 'Stableford',  desc: 'Points per hole vs par. Eagle=9, Birdie=6, Par=4, Bogey=2, Double=1.',   icon: 'stableford' },
  { id: 'skins',      label: 'Skins',       desc: 'Low score wins hole. Ties carry over. Double-value finale possible.',     icon: 'skins' },
  { id: 'sabotage',   label: 'Sabotage',    desc: 'Stroke play + 3 consumable sabotages per nine.',                         icon: 'sabotage' },
  { id: 'manual',     label: 'Side Event',  desc: 'Result entered manually at end (pool, cornhole, pick-em, etc.)',          icon: 'manual' },
]

const MODIFIER_CATALOG = [
  { id: 'ctp',      icon: 'mappin',    label: 'Closest to Pin',     summary: 'Named hole(s): player closest to pin earns a stroke bonus.',                     fields: [{id:'holes',label:'Which holes?',placeholder:'e.g. 4, 12'},{id:'value',label:'Bonus (strokes)',placeholder:'e.g. 1'}] },
  { id: 'ld',       icon: 'wind',      label: 'Longest Drive',      summary: 'Named hole(s): longest drive in fairway earns a stroke bonus.',                   fields: [{id:'holes',label:'Which holes?',placeholder:'e.g. 7'},{id:'value',label:'Bonus (strokes)',placeholder:'e.g. 1'}] },
  { id: 'double',   icon: 'zap',       label: 'Double-Value Holes', summary: 'Specific holes where points/skins count 2x. Classic for the final stretch.',      fields: [{id:'holes',label:'Which holes?',placeholder:'e.g. 16, 17, 18'},{id:'label',label:'What to call it',placeholder:'e.g. Three Glorious Finishing Holes'}] },
  { id: 'sandy',    icon: 'umbrella',  label: 'Sandy',              summary: 'Player hits from a bunker and still makes par or better -- earns a stroke bonus.', fields: [{id:'value',label:'Bonus (strokes)',placeholder:'e.g. 1'}] },
  { id: 'threeputt',icon: 'smile',     label: '3-Putt Penalty',     summary: 'Any player who 3-putts gets a stroke penalty added to their score.',              fields: [{id:'value',label:'Penalty (strokes)',placeholder:'e.g. 1'}] },
  { id: 'custom',   icon: 'pencil',    label: 'Custom Rule',        summary: 'Anything else -- a special hole, a bet, an annual tradition.',                     fields: [{id:'label',label:'Rule name / description',placeholder:'e.g. Closest to the pin on 9 wins the side pot'},{id:'holes',label:'Applies to holes (optional)',placeholder:'e.g. 9, or leave blank for all'},{id:'value',label:'Value / note',placeholder:'e.g. 1 stroke or $5'}] },
]

// Mock course search results
const COURSE_SEARCH_RESULTS: Record<string, { name: string; location: string; holes: HoleData[] }> = {
  'bandon dunes': {
    name: 'Bandon Dunes Golf Course',
    location: 'Bandon, OR',
    holes: [
      {hole:1,par:4,hcp:7},{hole:2,par:4,hcp:11},{hole:3,par:4,hcp:5},{hole:4,par:4,hcp:15},{hole:5,par:5,hcp:1},
      {hole:6,par:3,hcp:17},{hole:7,par:5,hcp:3},{hole:8,par:3,hcp:13},{hole:9,par:4,hcp:9},
      {hole:10,par:4,hcp:8},{hole:11,par:4,hcp:12},{hole:12,par:3,hcp:18},{hole:13,par:5,hcp:2},
      {hole:14,par:4,hcp:10},{hole:15,par:4,hcp:6},{hole:16,par:3,hcp:16},{hole:17,par:5,hcp:4},{hole:18,par:4,hcp:14},
    ],
  },
  'pacific dunes': {
    name: 'Pacific Dunes',
    location: 'Bandon, OR',
    holes: [
      {hole:1,par:4,hcp:5},{hole:2,par:5,hcp:11},{hole:3,par:3,hcp:17},{hole:4,par:4,hcp:1},{hole:5,par:4,hcp:7},
      {hole:6,par:3,hcp:15},{hole:7,par:4,hcp:3},{hole:8,par:4,hcp:13},{hole:9,par:4,hcp:9},
      {hole:10,par:3,hcp:16},{hole:11,par:4,hcp:6},{hole:12,par:4,hcp:12},{hole:13,par:5,hcp:2},
      {hole:14,par:4,hcp:10},{hole:15,par:4,hcp:8},{hole:16,par:4,hcp:4},{hole:17,par:3,hcp:18},{hole:18,par:5,hcp:14},
    ],
  },
}

const DEFAULT_18_HOLES: HoleData[] = Array.from({length: 18}, (_, i) => ({ hole: i+1, par: 4, hcp: i+1 }))

// ─── Types ─────────────────────────────────────────────────────────────────────

interface HoleData { hole: number; par: number; hcp: number }
type Step = 'format' | 'details' | 'handicaps' | 'modifiers' | 'points' | 'review'
type HandicapMode = 'none' | 'profile' | 'manual'
interface ActiveMod { catalogId: string; fields: Record<string, string> }

const STEPS: {id: Step; label: string}[] = [
  {id:'format',label:'Format'},{id:'details',label:'Details'},{id:'handicaps',label:'Handicaps'},
  {id:'modifiers',label:'Modifiers'},{id:'points',label:'Points'},{id:'review',label:'Review'},
]

// ─── Sub-components ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width:'100%', background:'#0d1117', border:'1px solid #374151', borderRadius:8,
  color:'#e6edf3', padding:'11px 14px', fontSize:15, boxSizing:'border-box', fontFamily:'inherit',
}

// Course search + scorecard entry
function CourseStep({ holes, onConfirm }: { holes: HoleData[] | null; onConfirm: (name: string, holes: HoleData[]) => void }) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<typeof COURSE_SEARCH_RESULTS | null>(null)
  const [mode, setMode] = useState<'search'|'manual'|'confirmed'>('search')
  const [manualHoles, setManualHoles] = useState<HoleData[]>(holes || DEFAULT_18_HOLES.map(h => ({...h})))
  const [confirmedName, setConfirmedName] = useState('')

  function doSearch() {
    setSearching(true)
    setTimeout(() => {
      const q = query.toLowerCase()
      const found: typeof COURSE_SEARCH_RESULTS = {}
      Object.entries(COURSE_SEARCH_RESULTS).forEach(([k, v]) => {
        if (k.includes(q) || v.name.toLowerCase().includes(q)) found[k] = v
      })
      setResults(found)
      setSearching(false)
    }, 600)
  }

  function selectResult(key: string) {
    const r = COURSE_SEARCH_RESULTS[key]
    onConfirm(r.name, r.holes)
    setConfirmedName(r.name)
    setMode('confirmed')
  }

  function saveManual() {
    onConfirm(query || 'Custom Course', manualHoles)
    setConfirmedName(query || 'Custom Course')
    setMode('confirmed')
  }

  function updateHole(i: number, field: 'par'|'hcp', val: number) {
    setManualHoles(h => h.map((row, idx) => idx === i ? {...row, [field]: val} : row))
  }

  const PAR_OPTS = [3,4,5]

  if (mode === 'confirmed') {
    return (
      <div style={{background:'#0f1f14', border:'1px solid #00d4aa40', borderRadius:10, padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <div style={{color:'#00d4aa', fontSize:11, fontWeight:700}}>✓ COURSE LOADED</div>
          <div style={{color:'#e6edf3', fontSize:15, fontWeight:600}}>{confirmedName}</div>
        </div>
        <button onClick={() => setMode('search')} style={{background:'#21262d', border:'none', borderRadius:6, color:'#8b949e', padding:'6px 12px', cursor:'pointer', fontSize:13}}>
          Change
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{marginBottom:10, display:'flex', gap:8}}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="Search course name…"
          style={{...inputStyle, flex:1}}
        />
        <button onClick={doSearch} disabled={!query} style={{background: query ? '#00d4aa':'#21262d', border:'none', borderRadius:8, color: query?'#0d1117':'#4a5568', padding:'0 18px', cursor: query?'pointer':'not-allowed', fontWeight:700, fontSize:14, flexShrink:0}}>
          {searching ? '…' : 'Search'}
        </button>
      </div>

      {/* Search results */}
      {results !== null && (
        <div style={{marginBottom:12}}>
          {Object.keys(results).length === 0 ? (
            <div style={{color:'#8b949e', fontSize:13, padding:'10px 0', marginBottom:4}}>
              No courses found. Try another name, or enter scorecard manually below.
            </div>
          ) : (
            Object.entries(results).map(([k, r]) => (
              <button key={k} onClick={() => selectResult(k)}
                style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#161b22', border:'1px solid #21262d', borderRadius:10, padding:'12px 14px', cursor:'pointer', marginBottom:8, textAlign:'left'}}>
                <div>
                  <div style={{color:'#e6edf3', fontWeight:600, fontSize:15}}>{r.name}</div>
                  <div style={{color:'#4a5568', fontSize:12, marginTop:2}}>{r.location} · 18 holes · scorecard available</div>
                </div>
                <span style={{color:'#00d4aa', fontSize:18, flexShrink:0}}>›</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Manual entry toggle */}
      <button onClick={() => setMode(m => m === 'manual' ? 'search' : 'manual')}
        style={{width:'100%', background:'transparent', border:'1px dashed #374151', borderRadius:10, color:'#8b949e', padding:'12px', cursor:'pointer', fontSize:14, marginBottom: mode === 'manual' ? 14 : 0}}>
        {mode === 'manual' ? '▲ Hide manual entry' : '✏️ Enter scorecard manually'}
      </button>

      {mode === 'manual' && (
        <div>
          <div style={{color:'#4a5568', fontSize:12, marginBottom:12, lineHeight:1.5}}>
            Set par and handicap index (difficulty rating) for each hole. Par defaults to 4. Handicap index 1 = hardest hole, 18 = easiest — used for stroke allocation.
          </div>
          <div style={{background:'#161b22', border:'1px solid #21262d', borderRadius:10, overflow:'hidden', marginBottom:12}}>
            <div style={{display:'grid', gridTemplateColumns:'32px 1fr 80px 80px', padding:'8px 14px', borderBottom:'1px solid #0d1117'}}>
              <span style={{color:'#4a5568', fontSize:11}}>#</span>
              <span style={{color:'#4a5568', fontSize:11}}>HOLE</span>
              <span style={{color:'#4a5568', fontSize:11, textAlign:'center' as const}}>PAR</span>
              <span style={{color:'#4a5568', fontSize:11, textAlign:'center' as const}}>HCP IDX</span>
            </div>
            {manualHoles.map((h, i) => (
              <div key={i} style={{display:'grid', gridTemplateColumns:'32px 1fr 80px 80px', padding:'8px 14px', borderBottom: i < 17 ? '1px solid #0d1117' : 'none', alignItems:'center', background: i % 2 === 0 ? 'transparent' : '#0a0e15'}}>
                <span style={{color:'#374151', fontSize:12}}>{h.hole}</span>
                <span style={{color:'#8b949e', fontSize:13}}>{i < 9 ? 'Front' : 'Back'} {(i%9)+1}</span>
                {/* Par selector */}
                <div style={{display:'flex', gap:2, justifyContent:'center'}}>
                  {PAR_OPTS.map(p => (
                    <button key={p} onClick={() => updateHole(i,'par',p)}
                      style={{width:22, height:22, borderRadius:4, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, background: h.par===p ? '#00d4aa':'#21262d', color: h.par===p?'#0d1117':'#8b949e'}}>
                      {p}
                    </button>
                  ))}
                </div>
                {/* HCP index */}
                <div style={{display:'flex', alignItems:'center', gap:4, justifyContent:'center'}}>
                  <button onClick={() => updateHole(i,'hcp', Math.max(1, h.hcp-1))} style={{width:22, height:22, background:'#21262d', border:'none', borderRadius:4, color:'#8b949e', cursor:'pointer', fontSize:14}}>−</button>
                  <span style={{color:'#e6edf3', fontSize:13, minWidth:22, textAlign:'center' as const}}>{h.hcp}</span>
                  <button onClick={() => updateHole(i,'hcp', Math.min(18, h.hcp+1))} style={{width:22, height:22, background:'#21262d', border:'none', borderRadius:4, color:'#8b949e', cursor:'pointer', fontSize:14}}>+</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={saveManual}
            style={{width:'100%', background:'#00d4aa', border:'none', borderRadius:10, color:'#0d1117', padding:'13px', fontWeight:700, fontSize:15, cursor:'pointer'}}>
            Save Scorecard
          </button>
        </div>
      )}
    </div>
  )
}

// Modifier card with expand-to-fill
function ModifierCard({ mod, isAdded, onAdd, onRemove }: { mod: typeof MODIFIER_CATALOG[number]; isAdded: boolean; onAdd: (f: Record<string,string>) => void; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [fields, setFields] = useState<Record<string,string>>({})

  return (
    <div style={{background: isAdded?'#0f1f14':'#161b22', border:`1px solid ${isAdded?'#00d4aa50':expanded?'#374151':'#21262d'}`, borderRadius:12, overflow:'hidden'}}>
      <button onClick={() => !isAdded && setExpanded(e=>!e)}
        style={{width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'transparent', border:'none', cursor: isAdded?'default':'pointer', textAlign:'left'}}>
        <span style={{flexShrink:0}}><ModIcon id={mod.icon} size={20} color={isAdded ? '#00d4aa' : '#8b949e'} /></span>
        <div style={{flex:1}}>
          <div style={{color: isAdded?'#00d4aa':'#e6edf3', fontWeight:600, fontSize:16}}>{mod.label}</div>
          <div style={{color:'#8b949e', fontSize:13, marginTop:2, lineHeight:1.4}}>{mod.summary}</div>
        </div>
        {isAdded ? (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:2}}>
            <span style={{color:'#00d4aa', fontSize:16}}>✓</span>
            <button onClick={e=>{e.stopPropagation(); onRemove()}} style={{background:'none', border:'none', color:'#4a5568', cursor:'pointer', fontSize:11, padding:0}}>remove</button>
          </div>
        ) : (
          <span style={{color:'#4a5568', fontSize:18, transform: expanded?'rotate(180deg)':'none', transition:'transform 0.2s'}}>▼</span>
        )}
      </button>
      {expanded && !isAdded && (
        <div style={{padding:'0 16px 16px', borderTop:'1px solid #21262d'}}>
          <div style={{paddingTop:14, display:'grid', gap:10, marginBottom:14}}>
            {mod.fields.map(f => (
              <div key={f.id}>
                <div style={{color:'#8b949e', fontSize:12, letterSpacing:1, marginBottom:6}}>{f.label.toUpperCase()}</div>
                <input value={fields[f.id]||''} onChange={e => setFields(fs=>({...fs,[f.id]:e.target.value}))} placeholder={f.placeholder} style={inputStyle} />
              </div>
            ))}
          </div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={() => {onAdd({...fields}); setExpanded(false)}}
              style={{flex:1, background:'#00d4aa', border:'none', borderRadius:8, color:'#0d1117', padding:'12px', fontWeight:700, fontSize:15, cursor:'pointer'}}>
              + Add This Modifier
            </button>
            <button onClick={() => setExpanded(false)} style={{background:'#21262d', border:'none', borderRadius:8, color:'#8b949e', padding:'12px 16px', cursor:'pointer', fontSize:15}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────


// ── Format icon helper ─────────────────────────────────────────────────────────
function FormatIcon({ id, size = 24, color = '#8b949e' }: { id: string; size?: number; color?: string }) {
  const s = { width: size, height: size, color, strokeWidth: 1.5, flexShrink: 0 } as React.CSSProperties & { strokeWidth: number }
  switch (id) {
    case 'scramble':   return <Users style={s} />
    case 'bestball':   return <RefreshCw style={s} />
    case 'stroke':     return <Flag style={s} />
    case 'stableford': return <BarChart2 style={s} />
    case 'skins':      return <Skull style={s} />
    case 'sabotage':   return <Zap style={s} />
    case 'manual':     return <Target style={s} />
    default:           return <Flag style={s} />
  }
}


// ── Modifier icon helper ────────────────────────────────────────────────────────
function ModIcon({ id, size = 20, color = '#8b949e' }: { id: string; size?: number; color?: string }) {
  const s = { width: size, height: size, color, strokeWidth: 1.5, flexShrink: 0 } as React.CSSProperties & { strokeWidth: number }
  switch (id) {
    case 'mappin':   return <MapPin style={s} />
    case 'wind':     return <Wind style={s} />
    case 'zap':      return <Zap style={s} />
    case 'umbrella': return <Umbrella style={s} />
    case 'smile':    return <Smile style={s} />
    case 'pencil':   return <Pencil style={s} />
    default:         return <Target style={s} />
  }
}


function CancelRoundPanel({ onCancel, onDelete, onDismiss, teams }: {
  onCancel?: () => void
  onDelete?: () => void
  onDismiss: () => void
  teams: typeof BBMI_EVENT.teams
}) {
  const [step, setStep] = useState<'choose'|'cancel-points'>('choose')
  const [teamPts, setTeamPts] = useState<Record<string,string>>({})

  if (step === 'cancel-points') return (
    <div style={{background:'#161b22', border:'1px solid #374151', borderRadius:12, padding:16}}>
      <div style={{fontSize:28, textAlign:'center' as const, marginBottom:8}}>🌧️☂️</div>
      <div style={{color:'#e6edf3', fontSize:16, fontWeight:700, marginBottom:6, textAlign:'center' as const}}>Sorry to hear about your day.</div>
      <div style={{color:'#8b949e', fontSize:14, marginBottom:18, lineHeight:1.5, textAlign:'center' as const}}>
        Did anyone settle points over axe throwing or something? If partial results need to count, enter them below. Otherwise skip — the round just marks as Rained Out.
      </div>
      {teams.map(t => (
        <div key={t._id} style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
          <div style={{width:10, height:10, borderRadius:'50%', background:t.color, flexShrink:0}} />
          <span style={{color:'#e6edf3', fontSize:15, flex:1}}>{t.name}</span>
          <input type="number" value={teamPts[t._id]||''} onChange={e=>setTeamPts(p=>({...p,[t._id]:e.target.value}))}
            placeholder="pts or 0"
            style={{width:88, background:'#0d1117', border:'1px solid #374151', borderRadius:8, color:'#00d4aa', padding:'10px 0', fontSize:20, fontWeight:700, textAlign:'center' as const}} />
        </div>
      ))}
      <div style={{display:'grid', gap:8, marginTop:8}}>
        <button onClick={onCancel}
          style={{background:'#f59e0b', border:'none', borderRadius:8, color:'#0d1117', padding:'13px', fontWeight:700, fontSize:15, cursor:'pointer'}}>
          🌧️ Mark as Rained Out {Object.values(teamPts).some(v=>v)?'& Save Points':''}
        </button>
        <button onClick={onDismiss} style={{background:'none', border:'none', color:'#4a5568', cursor:'pointer', fontSize:13, padding:'6px'}}>Never mind</button>
      </div>
    </div>
  )

  return (
    <div style={{background:'#1a0a0a', border:'1px solid #ef444430', borderRadius:12, padding:16}}>
      <div style={{color:'#ef4444', fontSize:15, fontWeight:600, marginBottom:6}}>Cancel or delete this round?</div>
      <div style={{color:'#8b949e', fontSize:13, marginBottom:16, lineHeight:1.5}}>
        Cancel keeps a record and lets you log any partial results. Delete wipes it completely.
      </div>
      <div style={{display:'grid', gap:8}}>
        <button onClick={() => setStep('cancel-points')}
          style={{background:'#21262d', border:'1px solid #374151', borderRadius:8, color:'#f59e0b', padding:'12px', cursor:'pointer', fontSize:14, fontWeight:600}}>
          🌧️ Cancel Round — keep record + log any results
        </button>
        <button onClick={onDelete}
          style={{background:'#1a0a0a', border:'1px solid #ef444430', borderRadius:8, color:'#ef4444', padding:'12px', cursor:'pointer', fontSize:14, fontWeight:600}}>
          🗑️ Delete Round — remove permanently
        </button>
        <button onClick={onDismiss} style={{background:'none', border:'none', color:'#4a5568', cursor:'pointer', fontSize:13, padding:'6px'}}>Never mind</button>
      </div>
    </div>
  )
}


export default function RoundBuilder({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState<Step>('format')
  const [format, setFormat] = useState('')
  const [title, setTitle] = useState('')
  const [courseHoles, setCourseHoles] = useState<HoleData[] | null>(null)
  const [courseName, setCourseName] = useState('')
  const [day, setDay] = useState('3')
  const [holes, setHoles] = useState(18)
  const [description, setDescription] = useState('')
  const [specialRules, setSpecialRules] = useState('')
  const [handicapMode, setHandicapMode] = useState<HandicapMode>('none')
  const [playerHandicaps, setPlayerHandicaps] = useState<Record<string,number>>({})
  const [activeMods, setActiveMods] = useState<Record<string, ActiveMod>>({})
  const [pointDist, setPointDist] = useState([1, 0.5, 0])
  const [manualOverride, setManualOverride] = useState(false)
  const [manualResults, setManualResults] = useState<Record<string,string>>({})
  const [saved, setSaved] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const { teams, players, groups } = BBMI_EVENT
  const stepIdx = STEPS.findIndex(s => s.id === step)
  const goNext = () => { const n = STEPS[stepIdx+1]; if (n) setStep(n.id) }
  const goBack = () => { const p = STEPS[stepIdx-1]; if (p) setStep(p.id) }

  const teamColor = (tid: string) => teams.find(t => t._id === tid)?.color || '#666'
  const teamShort = (tid: string) => teams.find(t => t._id === tid)?.shortName || ''

  const addMod = (id: string, fields: Record<string,string>) => setActiveMods(m => ({...m,[id]:{catalogId:id,fields}}))
  const removeMod = (id: string) => setActiveMods(m => { const n={...m}; delete n[id]; return n })

  // Validation: three tiers
  // draft = minimum to save as placeholder; ready = can go live; advisory = never block
  type ValTier = 'draft' | 'ready' | 'advisory'
  const validations: {label:string; ok:boolean; tier:ValTier; detail:string; navStep:Step}[] = [
    { label: 'Format selected',    ok: !!format,          tier: 'draft',    detail: FORMATS.find(f=>f.id===format)?.label || '',                        navStep: 'format'    },
    { label: 'Round name',         ok: !!title.trim(),    tier: 'draft',    detail: title || '',                                                          navStep: 'details'   },
    { label: 'Course & scorecard', ok: !!courseHoles,     tier: 'ready',    detail: courseName || 'Needed before round goes live',                        navStep: 'details'   },
    { label: 'Groups assigned',    ok: groups.length > 0, tier: 'ready',    detail: `${groups.length} groups / ${groups.length*4} players`,               navStep: 'details'   },
    { label: 'Point distribution', ok: pointDist.some(v=>v>0) || manualOverride, tier: 'ready', detail: manualOverride ? 'Manual post-round entry' : pointDist.join(' / '), navStep: 'points' },
    { label: 'Handicaps',          ok: true,              tier: 'advisory', detail: handicapMode==='none'?'None (raw scores)':handicapMode==='profile'?'From profiles':`Manual — ${Object.values(playerHandicaps).filter(v=>v>0).length} players`, navStep: 'handicaps' },
    { label: 'Modifiers',          ok: true,              tier: 'advisory', detail: Object.keys(activeMods).length===0?'None':Object.keys(activeMods).map(id=>MODIFIER_CATALOG.find(m=>m.id===id)?.label).join(', '), navStep: 'modifiers' },
    { label: 'Scoring rubric',     ok: !!description,     tier: 'advisory', detail: description?'Added':'Players may not know how scoring works',          navStep: 'details'   },
  ]
  const canSaveDraft = validations.filter(v => v.tier === 'draft').every(v => v.ok)
  const canSaveReady = validations.filter(v => v.tier !== 'advisory').every(v => v.ok)
  const missingForReady = validations.filter(v => v.tier === 'ready' && !v.ok)

  const POINT_PRESETS = [
    {label:'4 pts — 4 groups', values:[1,0.5,0]},
    {label:'10 pts ranked',    values:[4,3,2,1]},
    {label:'20 pts ranked',    values:[8,6,4,2]},
    {label:'Winner-take-all',  values:[10,0]},
  ]

  // saved can be 'draft' | 'ready'
  const [savedAs, setSavedAs] = useState<'draft'|'ready'|null>(null)
  if (savedAs) return (
    <div style={{minHeight:'100vh', background:'#0d1117', display:'flex', alignItems:'center', justifyContent:'center', padding:24}}>
      <div style={{textAlign:'center', maxWidth:360}}>
        <div style={{fontSize:64, marginBottom:16}}>{savedAs==='ready'?'✅':'📋'}</div>
        <div style={{color: savedAs==='ready'?'#00d4aa':'#f59e0b', fontFamily:'monospace', fontSize:12, letterSpacing:3, marginBottom:10}}>
          {savedAs==='ready'?'ROUND SAVED':'SAVED AS DRAFT'}
        </div>
        <div style={{color:'#e6edf3', fontSize:24, fontWeight:700, marginBottom:8}}>{title}</div>
        <div style={{color:'#8b949e', fontSize:14, marginBottom:8}}>{courseName||'Course TBD'} · {holes} holes</div>
        <div style={{background:'#161b22', border:'1px solid #21262d', borderRadius:10, padding:'12px 16px', marginBottom:28, color:'#8b949e', fontSize:13, lineHeight:1.5}}>
          {savedAs==='ready'
            ? 'Round is ready. Score entry opens when the first group tees off, or any organizer can start it from the leaderboard.'
            : 'Placeholder saved. It shows on the schedule as upcoming. Fill in the remaining details before the round starts.'}
        </div>
        <button onClick={onDone} style={{background: savedAs==='ready'?'#00d4aa':'#f59e0b', color:'#0d1117', border:'none', borderRadius:10, padding:'14px 36px', fontWeight:700, cursor:'pointer', fontSize:16}}>
          Back to Leaderboard
        </button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#0d1117', fontFamily:'system-ui, -apple-system, sans-serif'}}>
      {/* Header */}
      <div style={{borderBottom:'1px solid #21262d', padding:'14px 20px', display:'flex', alignItems:'center', gap:14}}>
        <button onClick={onDone} style={{background:'none', border:'none', color:'#8b949e', cursor:'pointer', fontSize:22, padding:0}}>←</button>
        <div style={{flex:1}}>
          <div style={{color:'#00d4aa', fontFamily:'monospace', fontSize:11, letterSpacing:2}}>ROUND BUILDER</div>
          <div style={{color:'#e6edf3', fontWeight:700, fontSize:17}}>BBMI 2025 · Bandon Dunes</div>
        </div>
      </div>

      {/* Step bar */}
      <div style={{display:'flex', borderBottom:'1px solid #21262d', overflowX:'auto'}}>
        {STEPS.map((s, i) => {
          const done = i < stepIdx, active = s.id === step
          return (
            <button key={s.id} onClick={() => i <= stepIdx && setStep(s.id)}
              style={{flex:1, minWidth:60, padding:'11px 4px', border:'none', cursor: i<=stepIdx?'pointer':'default', background: active?'#161b22':'transparent', borderBottom:`2px solid ${active?'#00d4aa':'transparent'}`, color: active?'#00d4aa': done?'#e6edf3':'#4a5568', fontSize:12, fontWeight: active?700:400}}>
              {done ? '✓ ' : ''}{s.label}
            </button>
          )
        })}
      </div>

      <div style={{maxWidth:640, margin:'0 auto', padding:'24px 18px'}}>

        {/* ─── FORMAT ──────────────────────────────────────────── */}
        {step === 'format' && (<>
          <div style={{color:'#e6edf3', fontSize:22, fontWeight:700, marginBottom:4}}>Choose a format</div>
          <div style={{color:'#8b949e', fontSize:14, marginBottom:22}}>What kind of round are you playing?</div>
          <div style={{display:'grid', gap:10}}>
            {FORMATS.map(f => (
              <button key={f.id} onClick={() => setFormat(f.id)}
                style={{display:'flex', alignItems:'center', gap:16, background: format===f.id?'#1a2f1f':'#161b22', border:`1px solid ${format===f.id?'#00d4aa':'#21262d'}`, borderRadius:12, padding:'15px 18px', cursor:'pointer', textAlign:'left'}}>
                <FormatIcon id={f.icon} size={26} color={format === f.id ? '#00d4aa' : '#8b949e'} />
                <div style={{flex:1}}>
                  <div style={{color: format===f.id?'#00d4aa':'#e6edf3', fontWeight:600, fontSize:17}}>{f.label}</div>
                  <div style={{color:'#8b949e', fontSize:13, marginTop:3, lineHeight:1.4}}>{f.desc}</div>
                </div>
                {format===f.id && <span style={{color:'#00d4aa', fontSize:20}}>✓</span>}
              </button>
            ))}
          </div>
        </>)}

        {/* ─── DETAILS ─────────────────────────────────────────── */}
        {step === 'details' && (<>
          <div style={{color:'#e6edf3', fontSize:22, fontWeight:700, marginBottom:4}}>Round details</div>
          <div style={{color:'#8b949e', fontSize:14, marginBottom:22}}>Name this round, set the course, and describe what you're playing.</div>

          {/* Round name */}
          <div style={{marginBottom:18}}>
            <div style={{color:'#8b949e', fontSize:12, letterSpacing:1, marginBottom:8}}>ROUND NAME</div>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Sabotage — Pacific Dunes" style={{...inputStyle, fontSize:16, padding:'13px 16px'}} />
          </div>

          {/* Day / holes */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:18}}>
            <div>
              <div style={{color:'#8b949e', fontSize:12, letterSpacing:1, marginBottom:8}}>DAY</div>
              <select value={day} onChange={e=>setDay(e.target.value)} style={{width:'100%', background:'#161b22', border:'1px solid #21262d', borderRadius:10, color:'#e6edf3', padding:'13px 14px', fontSize:16}}>
                {[1,2,3,4,5].map(d => <option key={d} value={d}>Day {d}</option>)}
              </select>
            </div>
            <div>
              <div style={{color:'#8b949e', fontSize:12, letterSpacing:1, marginBottom:8}}>HOLES</div>
              <select value={holes} onChange={e=>setHoles(Number(e.target.value))} style={{width:'100%', background:'#161b22', border:'1px solid #21262d', borderRadius:10, color:'#e6edf3', padding:'13px 14px', fontSize:16}}>
                <option value={9}>9 holes</option>
                <option value={18}>18 holes</option>
              </select>
            </div>
          </div>

          {/* Course search */}
          <div style={{marginBottom:18}}>
            <div style={{color:'#8b949e', fontSize:12, letterSpacing:1, marginBottom:8}}>
              COURSE & SCORECARD
              {courseHoles && <span style={{color:'#00d4aa', marginLeft:8}}>✓ loaded</span>}
            </div>
            <CourseStep
              holes={courseHoles}
              onConfirm={(name, holeData) => { setCourseName(name); setCourseHoles(holeData) }}
            />
          </div>

          {/* Scoring rubric */}
          <div style={{marginBottom:18}}>
            <div style={{color:'#8b949e', fontSize:12, letterSpacing:1, marginBottom:8}}>SCORING RUBRIC</div>
            <textarea value={description} onChange={e=>setDescription(e.target.value)}
              placeholder="Describe how this round works. Shown to all players and on the round card. e.g. Low net stroke play per group. Each group is its own competition. Winning group earns 1 point for their team."
              rows={4} style={{...inputStyle, fontSize:14, padding:'13px 16px', resize:'vertical' as const, lineHeight:1.5}} />
          </div>

          {format === 'sabotage' && (
            <div style={{marginBottom:18}}>
              <div style={{color:'#8b949e', fontSize:12, letterSpacing:1, marginBottom:8}}>SABOTAGE RULE CHANGES THIS YEAR</div>
              <textarea value={specialRules} onChange={e=>setSpecialRules(e.target.value)}
                placeholder="Any modifications from last year? e.g. Capital Felony may only be used once per 9."
                rows={3} style={{...inputStyle, fontSize:14, padding:'13px 16px', resize:'vertical' as const, lineHeight:1.5}} />
            </div>
          )}

          {/* Groups preview */}
          <div>
            <div style={{color:'#8b949e', fontSize:12, letterSpacing:1, marginBottom:12}}>GROUPS ({groups.length} foursomes)</div>
            <div style={{display:'grid', gap:8}}>
              {groups.map(g => {
                const gp = players.filter(p => g.playerIds.includes(p._id))
                return (
                  <div key={g._id} style={{background:'#161b22', border:'1px solid #21262d', borderRadius:10, padding:'12px 14px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                      <span style={{color:'#e6edf3', fontWeight:600, fontSize:15}}>{g.name}</span>
                      <span style={{color:'#4a5568', fontSize:13}}>⏰ {g.teeTime}</span>
                    </div>
                    <div style={{display:'flex', flexWrap:'wrap' as const, gap:6}}>
                      {gp.map(p => (
                        <span key={p._id} style={{background: teamColor(p.teamId)+'22', color: teamColor(p.teamId), fontSize:13, padding:'3px 10px', borderRadius:20, fontWeight:500}}>
                          {p.nickname}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>)}

        {/* ─── HANDICAPS ───────────────────────────────────────── */}
        {step === 'handicaps' && (<>
          <div style={{color:'#e6edf3', fontSize:22, fontWeight:700, marginBottom:4}}>Handicaps</div>
          <div style={{color:'#8b949e', fontSize:14, marginBottom:22}}>Level the playing field before you tee off.</div>

          <div style={{display:'grid', gap:10, marginBottom:24}}>
            {([
              {id:'none'    as HandicapMode, icon:'🚫', label:'No handicaps',       desc:'Raw scores. May the best ball-striker win.'},
              {id:'profile' as HandicapMode, icon:'👤', label:'From player profiles', desc:'Pull each player\'s USGA handicap index from their profile and apply to this course.'},
              {id:'manual'  as HandicapMode, icon:'✍️', label:'Set manually',        desc:'You already had the conversation on the first tee. Just enter the agreed strokes.'},
            ] as {id:HandicapMode;icon:string;label:string;desc:string}[]).map(opt => (
              <button key={opt.id} onClick={() => setHandicapMode(opt.id)}
                style={{display:'flex', alignItems:'center', gap:14, background: handicapMode===opt.id?'#1a2f1f':'#161b22', border:`1px solid ${handicapMode===opt.id?'#00d4aa':'#21262d'}`, borderRadius:12, padding:'15px 18px', cursor:'pointer', textAlign:'left'}}>
                <span style={{fontSize:26, flexShrink:0}}>{opt.icon}</span>
                <div style={{flex:1}}>
                  <div style={{color: handicapMode===opt.id?'#00d4aa':'#e6edf3', fontWeight:600, fontSize:17}}>{opt.label}</div>
                  <div style={{color:'#8b949e', fontSize:13, marginTop:3}}>{opt.desc}</div>
                </div>
                {handicapMode===opt.id && <span style={{color:'#00d4aa', fontSize:20}}>✓</span>}
              </button>
            ))}
          </div>

          {/* Profile mode — read-only display */}
          {handicapMode === 'profile' && (
            <div style={{background:'#161b22', border:'1px solid #21262d', borderRadius:12, overflow:'hidden', marginBottom:14}}>
              {players.map((p, i) => (
                <div key={p._id} style={{display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom: i<players.length-1?'1px solid #0d1117':'none'}}>
                  <div style={{width:36, height:36, borderRadius:'50%', background: teamColor(p.teamId), display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#0d1117', flexShrink:0}}>
                    {p.nickname.slice(0,2).toUpperCase()}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{color:'#e6edf3', fontSize:15, fontWeight:500}}>{p.name}</div>
                    <div style={{color:'#4a5568', fontSize:12}}>{teamShort(p.teamId)}</div>
                  </div>
                  <div style={{textAlign:'right' as const}}>
                    <div style={{color:'#00d4aa', fontWeight:700, fontSize:18}}>+{p.handicap}</div>
                    <div style={{color:'#4a5568', fontSize:10}}>from profile</div>
                  </div>
                </div>
              ))}
              {!courseHoles && (
                <div style={{padding:'10px 14px', background:'#1a1200', borderTop:'1px solid #0d1117'}}>
                  <span style={{color:'#f59e0b', fontSize:13}}>⚠️ Course scorecard needed to apply profile handicaps to specific holes — add it in Details.</span>
                </div>
              )}
            </div>
          )}

          {/* Manual entry */}
          {handicapMode === 'manual' && (<>
            <div style={{color:'#8b949e', fontSize:12, letterSpacing:1, marginBottom:12}}>STROKE ADJUSTMENTS PER PLAYER</div>
            <div style={{background:'#161b22', border:'1px solid #21262d', borderRadius:12, overflow:'hidden', marginBottom:14}}>
              {players.map((p, i) => (
                <div key={p._id} style={{display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom: i<players.length-1?'1px solid #0d1117':'none'}}>
                  <div style={{width:36, height:36, borderRadius:'50%', background: teamColor(p.teamId), display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#0d1117', flexShrink:0}}>
                    {p.nickname.slice(0,2).toUpperCase()}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{color:'#e6edf3', fontSize:15, fontWeight:500}}>{p.name}</div>
                    <div style={{color:'#4a5568', fontSize:12}}>{teamShort(p.teamId)}</div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <button onClick={() => setPlayerHandicaps(h => ({...h,[p._id]:Math.max(0,(h[p._id]||0)-1)}))}
                      style={{width:38, height:38, borderRadius:8, background:'#21262d', border:'none', color:'#e6edf3', cursor:'pointer', fontSize:22, fontWeight:700}}>−</button>
                    <div style={{color:(playerHandicaps[p._id]||0)>0?'#00d4aa':'#4a5568', fontWeight:800, fontSize:22, minWidth:36, textAlign:'center' as const}}>
                      {playerHandicaps[p._id]||0}
                    </div>
                    <button onClick={() => setPlayerHandicaps(h => ({...h,[p._id]:(h[p._id]||0)+1}))}
                      style={{width:38, height:38, borderRadius:8, background:'#21262d', border:'none', color:'#e6edf3', cursor:'pointer', fontSize:22, fontWeight:700}}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:'#0d1117', borderRadius:10, padding:'12px 14px', color:'#4a5568', fontSize:13, lineHeight:1.5}}>
              Strokes applied to hardest holes by handicap index. 7 strokes → subtract 1 from score on the 7 hardest holes.
            </div>
          </>)}
        </>)}

        {/* ─── MODIFIERS ───────────────────────────────────────── */}
        {step === 'modifiers' && (<>
          <div style={{color:'#e6edf3', fontSize:22, fontWeight:700, marginBottom:4}}>Modifiers</div>
          <div style={{color:'#8b949e', fontSize:14, marginBottom:14, lineHeight:1.5}}>
            Optional rules that add bonuses, penalties, or special holes. Tap any to read what it does and add it to this round.
          </div>
          {Object.keys(activeMods).length > 0 && (
            <div style={{background:'#0d1117', border:'1px solid #00d4aa30', borderRadius:8, padding:'8px 12px', marginBottom:14, color:'#00d4aa', fontSize:13}}>
              ✓ {Object.keys(activeMods).length} modifier{Object.keys(activeMods).length>1?'s':''} added to this round
            </div>
          )}
          <div style={{display:'grid', gap:10, marginBottom:10}}>
            {MODIFIER_CATALOG.map(mod => (
              <ModifierCard key={mod.id} mod={mod} isAdded={!!activeMods[mod.id]} onAdd={f=>addMod(mod.id,f)} onRemove={()=>removeMod(mod.id)} />
            ))}
          </div>
          {format==='sabotage' && (
            <div style={{marginTop:8, background:'#1a1500', border:'1px solid #f59e0b30', borderRadius:12, padding:16}}>
              <div style={{color:'#f59e0b', fontSize:13, fontWeight:700, marginBottom:12}}>💣 Sabotage — built-in rules</div>
              {[
                {name:'Misdemeanor 🕵️',rule:'Pick up opponent\'s ball, relocate anywhere on same surface. Announce first.'},
                {name:'Felony 💼',rule:'Confiscate any 3 clubs (putter OK) for the rest of the hole. Announce before tee shot.'},
                {name:'Capital Felony ☠️',rule:'Force any shot to be replayed. Announce before the stroke.'},
              ].map(s => (
                <div key={s.name} style={{marginBottom:10}}>
                  <div style={{color:'#f59e0b', fontSize:14, fontWeight:600}}>{s.name}</div>
                  <div style={{color:'#8b949e', fontSize:13, marginTop:3, lineHeight:1.4}}>{s.rule}</div>
                </div>
              ))}
              <div style={{color:'#6b7280', fontSize:12, paddingTop:10, borderTop:'1px solid #21262d'}}>3 per player per 9 · one of each type · no repeating same type on same opponent within 9</div>
            </div>
          )}
        </>)}

        {/* ─── POINTS ──────────────────────────────────────────── */}
        {step === 'points' && (<>
          <div style={{color:'#e6edf3', fontSize:22, fontWeight:700, marginBottom:4}}>Point distribution</div>
          <div style={{color:'#8b949e', fontSize:14, marginBottom:22}}>How many BBMI points does this round award?</div>

          <div style={{color:'#8b949e', fontSize:12, letterSpacing:1, marginBottom:12}}>QUICK PRESETS</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20}}>
            {POINT_PRESETS.map(p => {
              const active = JSON.stringify(pointDist) === JSON.stringify(p.values)
              return (
                <button key={p.label} onClick={() => setPointDist(p.values)}
                  style={{background: active?'#1a2f1f':'#161b22', border:`1px solid ${active?'#00d4aa':'#21262d'}`, borderRadius:10, padding:'12px 14px', cursor:'pointer', textAlign:'left' as const}}>
                  <div style={{color: active?'#00d4aa':'#e6edf3', fontSize:14, fontWeight:600}}>{p.label}</div>
                  <div style={{color:'#4a5568', fontSize:12, marginTop:2}}>{p.values.map((v,i)=>`${i+1}st: ${v}`).join(' · ')}</div>
                </button>
              )
            })}
          </div>

          <div style={{color:'#8b949e', fontSize:12, letterSpacing:1, marginBottom:12}}>OR ADJUST PER FINISH</div>
          <div style={{background:'#161b22', border:'1px solid #21262d', borderRadius:12, overflow:'hidden', marginBottom:20}}>
            {['1st 🥇','2nd 🥈','Tie 🤝'].map((place, i) => (
              <div key={place} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom: i<2?'1px solid #0d1117':'none'}}>
                <span style={{color:'#e6edf3', fontSize:17}}>{place}</span>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <button onClick={() => setPointDist(d => d.map((v,j) => j===i?Math.max(0,v-0.5):v))}
                    style={{width:38, height:38, borderRadius:8, background:'#21262d', border:'none', color:'#e6edf3', cursor:'pointer', fontSize:22}}>−</button>
                  <div style={{color:'#00d4aa', fontWeight:800, fontSize:24, minWidth:44, textAlign:'center' as const}}>{pointDist[i]??0}</div>
                  <button onClick={() => setPointDist(d => d.map((v,j) => j===i?v+0.5:v))}
                    style={{width:38, height:38, borderRadius:8, background:'#21262d', border:'none', color:'#e6edf3', cursor:'pointer', fontSize:22}}>+</button>
                </div>
              </div>
            ))}
            <div style={{padding:'12px 16px', background:'#0d1117', display:'flex', justifyContent:'space-between'}}>
              <span style={{color:'#4a5568', fontSize:13}}>Total across {groups.length} groups</span>
              <span style={{color:'#e6edf3', fontWeight:700, fontSize:14}}>{(pointDist.reduce((s,v)=>s+v,0)*groups.length).toFixed(1)} pts possible</span>
            </div>
          </div>

          {/* Manual override */}
          <div style={{background:'#161b22', border:`1px solid ${manualOverride?'#f59e0b40':'#21262d'}`, borderRadius:12, padding:16}}>
            <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12}}>
              <div style={{flex:1}}>
                <div style={{color:'#e6edf3', fontSize:16, fontWeight:600}}>Manual result entry</div>
                <div style={{color:'#8b949e', fontSize:13, marginTop:4, lineHeight:1.4}}>Skip the math. After the round, just type in the final points per team.</div>
              </div>
              <button onClick={() => setManualOverride(v=>!v)}
                style={{width:50, height:28, borderRadius:14, border:'none', cursor:'pointer', background: manualOverride?'#f59e0b':'#374151', position:'relative', transition:'background 0.2s', flexShrink:0, marginTop:2}}>
                <div style={{width:22, height:22, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left: manualOverride?25:3, transition:'left 0.2s'}} />
              </button>
            </div>
            {manualOverride && (
              <div style={{marginTop:14, paddingTop:14, borderTop:'1px solid #21262d'}}>
                <div style={{color:'#8b949e', fontSize:12, letterSpacing:1, marginBottom:12}}>ENTER FINAL POINTS AFTER ROUND</div>
                {teams.map(team => (
                  <div key={team._id} style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
                    <div style={{width:10, height:10, borderRadius:'50%', background:team.color, flexShrink:0}} />
                    <span style={{color:'#e6edf3', fontSize:16, flex:1}}>{team.name}</span>
                    <input type="number" value={manualResults[team._id]||''} onChange={e=>setManualResults(r=>({...r,[team._id]:e.target.value}))}
                      placeholder="pts" style={{width:88, background:'#0d1117', border:'1px solid #374151', borderRadius:8, color:'#00d4aa', padding:'10px 0', fontSize:22, fontWeight:700, textAlign:'center' as const}} />
                  </div>
                ))}
                <div style={{color:'#f59e0b', fontSize:12}}>⚠️ Leave blank for now — fill this in after the round ends.</div>
              </div>
            )}
          </div>
        </>)}

        {/* REVIEW */}
        {step === 'review' && (<>
          <div style={{color:'#e6edf3', fontSize:22, fontWeight:700, marginBottom:4}}>Review & save</div>
          <div style={{color:'#8b949e', fontSize:14, marginBottom:22}}>
            {canSaveReady ? 'Everything looks good — ready to go live.' : canSaveDraft ? 'Missing some details — save as a placeholder now and fill in the rest later.' : 'Fix the required fields to save.'}
          </div>

          {/* Validation checklist */}
          <div style={{background:'#161b22', border:'1px solid #21262d', borderRadius:12, overflow:'hidden', marginBottom:16}}>
            {validations.map((v, i) => {
              const isBlockingDraft = v.tier === 'draft' && !v.ok
              const isBlockingReady = v.tier === 'ready' && !v.ok
              const isAdvisoryWarn  = v.tier === 'advisory' && !v.ok
              const dotColor = isBlockingDraft ? '#ef4444' : isBlockingReady ? '#f59e0b' : isAdvisoryWarn ? '#4a5568' : '#00d4aa'
              const dotChar  = isBlockingDraft ? '!' : isBlockingReady ? '!' : isAdvisoryWarn ? '–' : '✓'
              const dotBg    = isBlockingDraft ? '#ef444420' : isBlockingReady ? '#f59e0b15' : isAdvisoryWarn ? 'transparent' : '#00d4aa22'
              return (
                <div key={v.label} style={{display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom: i<validations.length-1?'1px solid #0d1117':'none'}}>
                  <div style={{width:22, height:22, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, background:dotBg, color:dotColor}}>
                    {dotChar}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{color: v.ok?'#e6edf3': isBlockingDraft?'#ef4444': isBlockingReady?'#f59e0b':'#4a5568', fontSize:14, fontWeight: v.ok?400:600}}>
                      {v.label}
                      {v.tier==='draft' && <span style={{color:'#374151', fontSize:11, marginLeft:6}}>required</span>}
                      {v.tier==='ready' && !v.ok && <span style={{color:'#4a5568', fontSize:11, marginLeft:6}}>needed to go live</span>}
                    </div>
                    {v.detail && <div style={{color:'#4a5568', fontSize:12, marginTop:1}}>{v.detail}</div>}
                  </div>
                  {!v.ok && v.tier !== 'advisory' && (
                    <button onClick={() => setStep(v.navStep)} style={{background:'#21262d', border:'none', borderRadius:6, color:'#8b949e', padding:'5px 10px', cursor:'pointer', fontSize:12, flexShrink:0}}>
                      Fix
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Two save buttons — draft and ready */}
          {canSaveReady ? (
            <button onClick={() => setSavedAs('ready')}
              style={{width:'100%', background:'#00d4aa', color:'#0d1117', border:'none', borderRadius:12, padding:'18px', fontWeight:700, fontSize:18, cursor:'pointer', marginBottom:10}}>
              Save Round
            </button>
          ) : canSaveDraft ? (<>
            <button onClick={() => setSavedAs('draft')}
              style={{width:'100%', background:'#f59e0b', color:'#0d1117', border:'none', borderRadius:12, padding:'18px', fontWeight:700, fontSize:17, cursor:'pointer', marginBottom:8}}>
              Save as Draft Placeholder
            </button>
            <div style={{color:'#4a5568', fontSize:12, textAlign:'center' as const, marginBottom:16}}>
              Shows on the schedule as upcoming. Fix {missingForReady.length} more item{missingForReady.length>1?'s':''} before the round can go live.
            </div>
          </>) : (
            <div style={{background:'#1a0a0a', border:'1px solid #ef444430', borderRadius:10, padding:'12px 14px', marginBottom:16}}>
              <div style={{color:'#ef4444', fontSize:14, fontWeight:600}}>Add a format and round name to save.</div>
            </div>
          )}

          {/* Cancel / Delete — revealed on tap */}
          {!showDelete ? (
            <div style={{textAlign:'center' as const, marginTop:8}}>
              <button onClick={() => setShowDelete(true)} style={{background:'none', border:'none', color:'#374151', cursor:'pointer', fontSize:13, textDecoration:'underline'}}>
                Cancel or delete this round
              </button>
            </div>
          ) : (
            <CancelRoundPanel
              onCancel={onDone}
              onDelete={onDone}
              onDismiss={() => setShowDelete(false)}
              teams={teams}
            />
          )}
        </>)}

        {/* Nav */}
        <div style={{display:'flex', gap:10, marginTop:28}}>
          {stepIdx > 0 && (
            <button onClick={goBack} style={{flex:1, background:'#161b22', border:'1px solid #21262d', borderRadius:10, color:'#e6edf3', padding:'14px', cursor:'pointer', fontSize:15}}>← Back</button>
          )}
          {step !== 'review' && (
            <button onClick={goNext} disabled={step==='format'&&!format}
              style={{flex:2, background: (step==='format'&&!format)?'#21262d':'#00d4aa', border:'none', borderRadius:10, color:(step==='format'&&!format)?'#4a5568':'#0d1117', padding:'14px', cursor:(step==='format'&&!format)?'not-allowed':'pointer', fontSize:15, fontWeight:600}}>
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
