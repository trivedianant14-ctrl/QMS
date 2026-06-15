import { useState } from 'react'

const P = '#534AB7', PL = '#EEEDFE', PB = '#AFA9EC', PD = '#3C3489'
const G = '#3B6D11', GL = '#EAF3DE', GB = '#97C459'
const A = '#633806', AL = '#FAEEDA', AB = '#FAC775'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0'
const BD = '#e8e8f2', BG2 = '#f5f5fb'

// Format tag colors
const FORMAT = {
  subject_preboard: { bg: AL,  color: A,  border: AB, label: 'Subject Preboard' },
  full_mock:        { bg: PL,  color: PD, border: PB, label: 'Full Mock (NASHTA)' },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const LIVE_TEST = {
  id: 0,
  name: 'NORCET 10 — Stage I',
  timeLabel: 'Today, 3:00 PM – 4:30 PM',
  duration: 90, durationLabel: '90 min', marks: '100', enrolled: 2847,
  questions: 100, totalMarks: 100, correctMarks: 1, wrongMarks: -0.33,
}

const CONFETTI = [
  { left:'8%',  color:'#FF6B6B', w:7,  h:7,  round:true,  delay:0,    dur:1.8 },
  { left:'18%', color:'#FFD93D', w:5,  h:12, round:false, delay:0.10, dur:2.0 },
  { left:'28%', color:'#3B6D11', w:8,  h:8,  round:true,  delay:0.05, dur:1.7 },
  { left:'38%', color:'#534AB7', w:11, h:5,  round:false, delay:0.15, dur:1.9 },
  { left:'48%', color:'#FF6B6B', w:7,  h:7,  round:true,  delay:0.20, dur:1.6 },
  { left:'58%', color:'#FFD93D', w:5,  h:11, round:false, delay:0,    dur:2.1 },
  { left:'68%', color:'#3B6D11', w:7,  h:7,  round:true,  delay:0.08, dur:1.8 },
  { left:'78%', color:'#534AB7', w:10, h:5,  round:false, delay:0.05, dur:2.0 },
  { left:'88%', color:'#FF6B6B', w:7,  h:7,  round:true,  delay:0.12, dur:1.7 },
  { left:'13%', color:'#FFD93D', w:5,  h:5,  round:false, delay:0.65, dur:1.8 },
  { left:'33%', color:'#534AB7', w:8,  h:8,  round:true,  delay:0.75, dur:2.0 },
  { left:'53%', color:'#3B6D11', w:5,  h:10, round:false, delay:0.70, dur:1.7 },
  { left:'73%', color:'#FFD93D', w:10, h:4,  round:true,  delay:0.80, dur:1.9 },
  { left:'91%', color:'#FF6B6B', w:7,  h:7,  round:false, delay:0.60, dur:2.1 },
]

// Upcoming — Subject Preboards
const UPCOMING_PREBOARDS = [
  { id:3,  format:'subject_preboard', recommended:true,  fullName:'Fundamentals of Nursing',          subtitle:'FON · NORCET Preboard',      date:'Sun, 22 Jun', daysOut:7,  duration:'60 min',  marks:'100', enrolled:743,  registered:false },
  { id:4,  format:'subject_preboard', recommended:true,  fullName:'Medical Surgical Nursing',         subtitle:'MSN · NORCET Preboard',      date:'Wed, 25 Jun', daysOut:10, duration:'60 min',  marks:'100', enrolled:1203, registered:false },
  { id:5,  format:'subject_preboard', recommended:false, fullName:'Community Health Nursing',         subtitle:'CHN · NORCET Preboard',      date:'Sun, 29 Jun', daysOut:14, duration:'60 min',  marks:'100', enrolled:891,  registered:false },
  { id:6,  format:'subject_preboard', recommended:false, fullName:'Obstetrics & Gynecology Nursing',  subtitle:'OBG · NORCET Preboard',      date:'Mon, 7 Jul',  daysOut:22, duration:'60 min',  marks:'100', enrolled:654,  registered:true  },
  { id:7,  format:'subject_preboard', recommended:false, fullName:'Pediatric Nursing',                subtitle:'PDR TREX · NORCET Preboard', date:'Sun, 13 Jul', daysOut:28, duration:'60 min',  marks:'100', enrolled:512,  registered:false },
]

// Upcoming — Full Mock Tests (NASHTA Series)
const UPCOMING_MOCKS = [
  { id:10, format:'full_mock', recommended:true,  fullName:'NASHTA 3 for NORCET', subtitle:'Full-length NORCET simulation · All subjects', date:'Sat, 5 Jul',  daysOut:20, duration:'120 min', marks:'200', enrolled:3241, registered:true  },
  { id:11, format:'full_mock', recommended:false, fullName:'NASHTA 4 for NORCET', subtitle:'Full-length NORCET simulation · All subjects', date:'Sat, 26 Jul', daysOut:41, duration:'120 min', marks:'200', enrolled:2103, registered:false },
  { id:12, format:'full_mock', recommended:false, fullName:'RRB NASHTA',           subtitle:'RRB Nursing · Full Mock',                      date:'Sat, 9 Aug',  daysOut:55, duration:'120 min', marks:'200', enrolled:1847, registered:false },
]

const ALL_UPCOMING = [...UPCOMING_PREBOARDS, ...UPCOMING_MOCKS]

// Past — reverse-chronological, with format tag + full nursing names + score for attempted
const PAST = [
  { id:101, fullName:'Community Health Nursing',         subtitle:'CHN · NORCET Preboard',                          format:'subject_preboard', date:'10 Jun 2025', ts:new Date('2025-06-10'), dur:'60 min',  mks:'100', score:'74',  f:true,  m:true  },
  { id:102, fullName:'NASHTA 2 for NORCET',              subtitle:'Full-length NORCET simulation · All subjects',   format:'full_mock',        date:'7 Jun 2025',  ts:new Date('2025-06-07'), dur:'120 min', mks:'200', score:null,  f:false, m:true  },
  { id:103, fullName:'Medical Surgical Nursing',         subtitle:'MSN · NORCET Preboard',                          format:'subject_preboard', date:'3 Jun 2025',  ts:new Date('2025-06-03'), dur:'60 min',  mks:'100', score:'82',  f:true,  m:true  },
  { id:104, fullName:'Fundamentals of Nursing',          subtitle:'FON · NORCET Preboard',                          format:'subject_preboard', date:'27 May 2025', ts:new Date('2025-05-27'), dur:'60 min',  mks:'100', score:null,  f:false, m:true  },
  { id:105, fullName:'NASHTA 1 for NORCET',              subtitle:'Full-length NORCET simulation · All subjects',   format:'full_mock',        date:'20 May 2025', ts:new Date('2025-05-20'), dur:'120 min', mks:'200', score:'146', f:true,  m:true  },
  { id:106, fullName:'Obstetrics & Gynecology Nursing',  subtitle:'OBG · NORCET Preboard',                          format:'subject_preboard', date:'13 May 2025', ts:new Date('2025-05-13'), dur:'60 min',  mks:'100', score:null,  f:false, m:true  },
  { id:107, fullName:'Pediatric Nursing',                subtitle:'PDR TREX · NORCET Preboard',                     format:'subject_preboard', date:'29 Apr 2025', ts:new Date('2025-04-29'), dur:'60 min',  mks:'100', score:null,  f:false, m:true  },
  { id:108, fullName:'Medical Surgical Nursing – II',    subtitle:'MSN2 · NORCET Preboard',                         format:'subject_preboard', date:'22 Apr 2025', ts:new Date('2025-04-22'), dur:'60 min',  mks:'100', score:null,  f:false, m:false },
  { id:109, fullName:'Short Subjects Nursing',           subtitle:'Short Subjects · NORCET Preboard',                format:'subject_preboard', date:'15 Apr 2025', ts:new Date('2025-04-15'), dur:'45 min',  mks:'75',  score:null,  f:false, m:false },
  { id:110, fullName:'NASHTA Series Revision',           subtitle:'Full-length NORCET simulation · All subjects',   format:'full_mock',        date:'8 Apr 2025',  ts:new Date('2025-04-08'), dur:'120 min', mks:'200', score:null,  f:false, m:false },
  { id:111, fullName:'Community Health Nursing',         subtitle:'CHN · NORCET Preboard',                          format:'subject_preboard', date:'1 Apr 2025',  ts:new Date('2025-04-01'), dur:'60 min',  mks:'100', score:'68',  f:true,  m:false },
  { id:112, fullName:'Fundamentals of Nursing',          subtitle:'FON · NORCET Preboard',                          format:'subject_preboard', date:'25 Mar 2025', ts:new Date('2025-03-25'), dur:'60 min',  mks:'100', score:null,  f:false, m:false },
  { id:113, fullName:'RRB NASHTA',                       subtitle:'RRB Nursing · Full Mock',                         format:'full_mock',        date:'18 Mar 2025', ts:new Date('2025-03-18'), dur:'120 min', mks:'200', score:null,  f:false, m:false },
]

const NOTIFICATIONS = [
  { id:1, type:'live',     title:'NORCET 8 Grand Test – Session 1',  body:'Your registered test is live right now. Join before it closes!',               time:'2 min ago',  read:false },
  { id:2, type:'upcoming', title:'Fundamentals of Nursing Preboard',  body:'Starts in 7 days on Sun, 22 Jun. Registrations are open.',                     time:'1 hr ago',   read:false },
  { id:3, type:'upcoming', title:'NASHTA 3 for NORCET',               body:'Registrations are open. Full-length mock scheduled for Sat, 5 Jul.',           time:'6 hr ago',   read:false },
  { id:4, type:'result',   title:'Community Health Nursing Preboard', body:'Results are out! You scored 74/100. View your detailed analysis.',             time:'3 days ago',  read:true  },
  { id:5, type:'result',   title:'Medical Surgical Nursing Preboard', body:'Your result for the 3 Jun test is now available. Score: 82/100.',              time:'5 days ago',  read:true  },
  { id:6, type:'result',   title:'NASHTA 1 for NORCET',               body:'Results declared. You scored 146/200 on the 20 May full mock.',               time:'12 days ago', read:true  },
]

// ─── Icons ────────────────────────────────────────────────────────────────────

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
)
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
)
const UsersIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
)
const BellIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
)
const ChevronDown = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 12,15 18,9"/></svg>
)
const ChevronUp = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18,15 12,9 6,15"/></svg>
)
const ChevronRight = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>
)

// ─── Shared sub-components ────────────────────────────────────────────────────

function MetaChip({ icon, label }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:11, color:T2, fontWeight:500 }}>
      {icon}{label}
    </span>
  )
}

function FormatTag({ format }) {
  const f = FORMAT[format]
  if (!f) return null
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, background:f.bg, color:f.color, border:`1px solid ${f.border}`, flexShrink:0 }}>
      {f.label}
    </span>
  )
}

// Sub-group header with optional tag
function SubGroupHeader({ children, tag, subtitle }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:13, fontWeight:700, color:T1 }}>{children}</span>
        {tag && <span style={{ fontSize:10, fontWeight:600, background:PL, color:PD, border:`1px solid ${PB}`, padding:'2px 8px', borderRadius:20 }}>{tag}</span>}
      </div>
      {subtitle && <div style={{ fontSize:11, color:T3, marginTop:2 }}>{subtitle}</div>}
    </div>
  )
}

// ─── Upcoming card ────────────────────────────────────────────────────────────

function UpcomingCard({ test, isRegistered, onRegisterClick }) {
  const soon = test.daysOut <= 3
  const dayBg = soon ? AL : '#EDF4FF'
  const dayColor = soon ? A : '#1A56B0'
  const dayBorder = soon ? AB : '#93B8F0'
  return (
    <div style={{ background:'white', border:`1.5px solid ${test.recommended ? GB : BD}`, borderRadius:12, overflow:'hidden', marginBottom:10 }}>
      {/* Recommended banner */}
      {test.recommended && (
        <div style={{ background:GL, borderBottom:`1px solid ${GB}`, padding:'5px 14px', display:'flex', alignItems:'center', gap:5 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill={G} stroke="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
          <span style={{ fontSize:11, fontWeight:700, color:G }}>Recommended</span>
        </div>
      )}
      <div style={{ padding:'14px 14px 12px' }}>
      {/* Top row: countdown badge | date */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 9px', borderRadius:20, fontSize:10, fontWeight:700, background:dayBg, color:dayColor, border:`1px solid ${dayBorder}` }}>
          In {test.daysOut} {test.daysOut === 1 ? 'day' : 'days'}
        </span>
        <span style={{ fontSize:11, color:T3, fontWeight:500 }}>{test.date}</span>
      </div>
      {/* Primary: full subject / test name */}
      <div style={{ fontSize:14, fontWeight:700, color:T1, lineHeight:1.4, marginBottom:3 }}>{test.fullName}</div>
      {/* Secondary: abbreviation + context */}
      <div style={{ fontSize:11, color:T3, marginBottom:8 }}>{test.subtitle}</div>
      {/* Social proof */}
      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:10 }}>
        <span style={{ color:T3, display:'flex', alignItems:'center' }}><UsersIcon /></span>
        <span style={{ fontSize:11, color:T3, fontWeight:500 }}>
          {(isRegistered ? test.enrolled + 1 : test.enrolled).toLocaleString()} students registered
        </span>
        {isRegistered && (
          <span style={{ fontSize:10, fontWeight:700, color:G, background:GL, border:`1px solid ${GB}`, padding:'1px 7px', borderRadius:20 }}>you're in!</span>
        )}
      </div>
      {/* Meta + Register */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <MetaChip icon={<ClockIcon />} label={test.duration} />
        <MetaChip icon={<StarIcon />} label={`${test.marks} Marks`} />
        <button
          onClick={() => !isRegistered && onRegisterClick(test)}
          style={{ marginLeft:'auto', padding:'6px 14px', borderRadius:8, fontSize:11, fontWeight:600, cursor:isRegistered?'default':'pointer', background:isRegistered?GL:'transparent', color:isRegistered?G:P, border:`1px solid ${isRegistered?GB:PB}` }}>
          {isRegistered ? '✓ Registered' : 'Register'}
        </button>
      </div>
      </div>
    </div>
  )
}

// ─── Past card ────────────────────────────────────────────────────────────────

function PastCard({ test }) {
  if (test.attempted) {
    return (
      <div style={{ background:'white', border:`1px solid ${BD}`, borderRadius:12, padding:'14px 14px 12px', marginBottom:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'2px 9px', borderRadius:20, fontSize:10, fontWeight:700, background:GL, color:G, border:`1px solid ${GB}` }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:G, display:'inline-block' }} />
            Result Out
          </span>
        </div>
        <div style={{ fontSize:14, fontWeight:700, color:T1, lineHeight:1.4, marginBottom:3 }}>{test.fullName}</div>
        <div style={{ fontSize:11, color:T3, marginBottom:10 }}>{test.subtitle}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:11, color:T3 }}>{test.date}</span>
          <span style={{ color:BD }}>·</span>
          <MetaChip icon={<ClockIcon />} label={test.dur} />
          {test.score && (
            <>
              <span style={{ color:BD }}>·</span>
              <span style={{ fontSize:11, fontWeight:700, color:G }}>{test.score}/{test.mks}</span>
            </>
          )}
          <button style={{ marginLeft:'auto', padding:'6px 14px', borderRadius:8, fontSize:11, fontWeight:600, background:PL, color:P, border:`1px solid ${PB}`, cursor:'pointer' }}>
            View Result
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background:AL, border:`1.5px solid ${AB}`, borderRadius:12, padding:'14px 14px 12px', marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        {/* Gold badge */}
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'2px 10px', borderRadius:20, fontSize:10, fontWeight:700, background:'#FFC533', color:'#5A3700', border:'1.5px solid #E6A800' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L15.5 8.5L24 9.7L18 15.5L19.5 24L12 20L4.5 24L6 15.5L0 9.7L8.5 8.5Z"/></svg>
          Gold
        </span>
      </div>

      {/* Test info — slightly muted */}
      <div style={{ fontSize:14, fontWeight:600, color:A, lineHeight:1.4, marginBottom:3 }}>{test.fullName}</div>
      <div style={{ fontSize:11, color:AB, marginBottom:10 }}>{test.subtitle}</div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, color:A, opacity:0.7 }}>{test.date}</span>
          <span style={{ color:AB }}>·</span>
          <span style={{ fontSize:11, color:A, opacity:0.7, display:'inline-flex', alignItems:'center', gap:3 }}><ClockIcon />{test.dur}</span>
        </div>
        <button style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, fontSize:11, fontWeight:700, background:'#FFC533', color:'#5A3700', border:'1.5px solid #E6A800', cursor:'pointer', flexShrink:0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          Upgrade to Gold
        </button>
      </div>
    </div>
  )
}

// ─── Calendar full-screen overlay ────────────────────────────────────────────

const MONTH_MAP = { Jan:'January', Feb:'February', Mar:'March', Apr:'April', May:'May', Jun:'June', Jul:'July', Aug:'August', Sep:'September', Oct:'October', Nov:'November', Dec:'December' }
const DAY_MAP   = { Sun:'Sunday', Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday', Thu:'Thursday', Fri:'Friday', Sat:'Saturday' }

function CalendarScreen({ tests, registeredIds, onRegister, onBack }) {
  const [calFilter, setCalFilter] = useState('all')
  const displayTests = calFilter === 'all' ? tests : tests.filter(t => t.format === calFilter)

  const monthGroups = []
  const seenMonths = {}
  displayTests.forEach(t => {
    const parts = t.date.split(', ')
    const [dayNum, monthAbbr] = parts[1].split(' ')
    const month  = MONTH_MAP[monthAbbr] || monthAbbr
    const dayName = DAY_MAP[parts[0]] || parts[0]
    if (!seenMonths[month]) {
      const mg = { month, dateGroups: [], _dates: {} }
      seenMonths[month] = mg
      monthGroups.push(mg)
    }
    const mg = seenMonths[month]
    if (!mg._dates[t.date]) {
      const dg = { date: t.date, daysOut: t.daysOut, dayNum, dayName, tests: [] }
      mg._dates[t.date] = dg
      mg.dateGroups.push(dg)
    }
    mg._dates[t.date].tests.push(t)
  })

  return (
    <div style={{ position:'absolute', inset:0, background:'white', zIndex:50, display:'flex', flexDirection:'column' }}>

      {/* Status bar */}
      <div style={{ padding:'12px 20px 4px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <span style={{ fontSize:13, fontWeight:600, color:T1 }}>9:41</span>
        <div style={{ display:'flex', gap:6, alignItems:'center', color:T2 }}>
          <svg width="16" height="11" viewBox="0 0 30 20" fill="currentColor"><rect x="0" y="8" width="4" height="12" rx="1" opacity="0.4"/><rect x="7" y="5" width="4" height="15" rx="1" opacity="0.6"/><rect x="14" y="2" width="4" height="18" rx="1" opacity="0.8"/><rect x="21" y="0" width="4" height="20" rx="1"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
        </div>
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'6px 16px 12px', borderBottom:`1px solid ${BD}`, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:T1, padding:0, flexShrink:0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:T1 }}>Test Calendar</div>
          <div style={{ fontSize:11, color:T3, marginTop:1 }}>Upcoming scheduled tests</div>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', gap:8, padding:'12px 16px 10px', borderBottom:`1px solid ${BD}`, flexShrink:0, overflowX:'auto' }}>
        {[
          { id:'all', label:'All' },
          { id:'subject_preboard', label:'Subject' },
          { id:'full_mock', label:'Full Mock' },
        ].map(f => {
          const active = calFilter === f.id
          return (
            <button key={f.id} onClick={() => setCalFilter(f.id)} style={{
              padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:active?700:500,
              background: active ? P : 'white',
              color: active ? 'white' : T2,
              border: `1.5px solid ${active ? P : BD}`,
              cursor:'pointer', flexShrink:0, whiteSpace:'nowrap',
            }}>{f.label}</button>
          )
        })}
      </div>

      {/* Scrollable month list */}
      <div className="scroll" style={{ flex:1, padding:'20px 16px 40px' }}>
        {monthGroups.map(mg => (
          <div key={mg.month} style={{ marginBottom:28 }}>

            {/* Month header */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
              <span style={{ fontSize:17, fontWeight:800, color:T1 }}>{mg.month}</span>
              <div style={{ flex:1, height:1.5, background:BD }} />
            </div>

            {mg.dateGroups.map(dg => (
              <div key={dg.date} style={{ marginBottom:20 }}>

                {/* Date row */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap:7 }}>
                    <span style={{ fontSize:26, fontWeight:800, color:T1, lineHeight:1 }}>{dg.dayNum}</span>
                    <span style={{ fontSize:13, fontWeight:500, color:T3 }}>{dg.dayName}</span>
                  </div>
                  <span style={{ fontSize:10, fontWeight:600, color:'#1A56B0', background:'#EDF4FF', border:'1px solid #93B8F0', padding:'3px 9px', borderRadius:20 }}>
                    In {dg.daysOut} {dg.daysOut === 1 ? 'day' : 'days'}
                  </span>
                </div>

                {/* Test cards */}
                {dg.tests.map(t => {
                  const isReg = registeredIds.has(t.id)
                  return (
                    <div key={t.id} style={{ background:'white', border:`1.5px solid ${BD}`, borderRadius:12, padding:'13px 14px', marginBottom:8, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:700, color:T1, lineHeight:1.4, marginBottom:2 }}>{t.fullName}</div>
                          <div style={{ fontSize:11, color:T3, marginBottom:6 }}>{t.subtitle}</div>
                          <div style={{ marginBottom:8 }}>
                            <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:20, background:FORMAT[t.format].bg, color:FORMAT[t.format].color, border:`1px solid ${FORMAT[t.format].border}` }}>
                              {FORMAT[t.format].label}
                            </span>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <span style={{ fontSize:11, color:T2, display:'inline-flex', alignItems:'center', gap:3 }}><ClockIcon />{t.duration}</span>
                            <span style={{ fontSize:11, color:T2, display:'inline-flex', alignItems:'center', gap:3 }}><StarIcon />{t.marks} Marks</span>
                            {isReg && (
                              <span style={{ fontSize:10, fontWeight:700, color:G, background:GL, border:`1px solid ${GB}`, padding:'1px 7px', borderRadius:20 }}>you're in!</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => !isReg && onRegister(t)}
                          style={{ padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:700, cursor:isReg?'default':'pointer', background:isReg?GL:'#1A56B0', color:isReg?G:'white', border:`1px solid ${isReg?GB:'#1A56B0'}`, flexShrink:0, marginTop:2 }}>
                          {isReg ? '✓ Registered' : 'Register'}
                        </button>
                      </div>
                    </div>
                  )
                })}

              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────

function NavBar({ navigate }) {
  const tabs = [
    { id:'home',     label:'Home',
      icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
    { id:'qbank',    label:'QBank',
      icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> },
    { id:'videos',   label:'Videos',
      icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
    { id:'livetest', label:'Tests', active:true,
      icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg> },
    { id:'buy',      label:'Buy',
      icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg> },
  ]
  return (
    <div style={{ flexShrink:0, background:'white', borderTop:`1px solid ${BD}`, display:'flex', paddingBottom:'env(safe-area-inset-bottom)' }}>
      {tabs.map(t => (
        <button key={t.id}
          onClick={() => { if (t.id === 'home' || t.id === 'qbank') navigate('home'); else if (t.id === 'videos') navigate('videos') }}
          style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'8px 0 10px', background:'none', border:'none', color:t.active ? P : T3, cursor:'pointer' }}>
          {t.icon}
          <span style={{ fontSize:10, fontWeight:t.active ? 600 : 400 }}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LiveTest({ navigate, onJoinNow, variant = 'cta' }) {
  const [manyAttempts, setManyAttempts]       = useState(false)
  const [activeCategory, setActiveCategory]   = useState('Live Test')
  const [showCalendar, setShowCalendar]       = useState(false)
  const [pastTab, setPastTab]                 = useState('full_mock')
  const [upcomingTab, setUpcomingTab]         = useState('full_mock')
  const [upcomingExpanded, setUpcomingExpanded] = useState(false)
  const [pastExpanded, setPastExpanded]       = useState(false)
  const [hybridUpcomingTab, setHybridUpcomingTab] = useState('full_mock')
  const [hybridPastExpanded, setHybridPastExpanded] = useState(false)
  const [hybridPastTab, setHybridPastTab]     = useState('full_mock')

  const [registeredIds, setRegisteredIds]     = useState(() => new Set(ALL_UPCOMING.filter(t => t.registered).map(t => t.id)))
  const [activeModal, setActiveModal]         = useState(null)
  const [showNotifs, setShowNotifs]           = useState(false)
  const [readIds, setReadIds]                 = useState(() => new Set(NOTIFICATIONS.filter(n => n.read).map(n => n.id)))

  // Past tests: attempted first (desc date), unattempted after (desc date)
  const rawPast   = PAST.map(t => ({ ...t, attempted: manyAttempts ? t.m : t.f }))
  const pastTests = [...rawPast].sort((a, b) => a.attempted !== b.attempted ? (a.attempted ? -1 : 1) : b.ts - a.ts)
  const totalPast     = pastTests.length
  const attemptedPast = pastTests.filter(t => t.attempted).length

  const calendarTests = [...ALL_UPCOMING].sort((a, b) => a.daysOut - b.daysOut)
  const filteredPast  = pastTests.filter(t => t.format === pastTab)

  const subjectPast      = pastTests.filter(t => t.format === 'subject_preboard')
  const fullPast         = pastTests.filter(t => t.format === 'full_mock')
  const subjectAttempted = subjectPast.filter(t => t.attempted).length
  const fullAttempted    = fullPast.filter(t => t.attempted).length
  const SHOW_UPCOMING = 3
  const activeList    = upcomingTab === 'subject_preboard' ? UPCOMING_PREBOARDS : UPCOMING_MOCKS
  const visibleList   = upcomingExpanded ? activeList : activeList.slice(0, SHOW_UPCOMING)
  const hasMore       = activeList.length > SHOW_UPCOMING
  const hybridList         = (hybridUpcomingTab === 'subject_preboard' ? UPCOMING_PREBOARDS : UPCOMING_MOCKS).slice(0, 2)
  const hybridPastFiltered = pastTests.filter(t => t.format === hybridPastTab)

  const CATEGORIES = ['PYQ Test', 'Subject Test', 'Daily Test', 'Mini Test', 'Live Test']

  const handleRegisterClick = (test) => setActiveModal({ type:'confirm', test })
  const handleConfirm = () => {
    setRegisteredIds(prev => new Set([...prev, activeModal.test.id]))
    setActiveModal({ type:'success', test: activeModal.test })
  }
  const handleCancel      = () => setActiveModal(null)
  const handleSuccessDone = () => setActiveModal(null)

  const unreadCount   = NOTIFICATIONS.filter(n => !readIds.has(n.id)).length
  const handleBellClick = () => { setShowNotifs(true); setReadIds(new Set(NOTIFICATIONS.map(n => n.id))) }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'white', position:'relative' }}>

      {/* Status bar */}
      <div style={{ padding:'12px 20px 4px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <span style={{ fontSize:13, fontWeight:600, color:T1 }}>9:41</span>
        <div style={{ display:'flex', gap:6, alignItems:'center', color:T2 }}>
          <svg width="16" height="11" viewBox="0 0 30 20" fill="currentColor"><rect x="0" y="8" width="4" height="12" rx="1" opacity="0.4"/><rect x="7" y="5" width="4" height="15" rx="1" opacity="0.6"/><rect x="14" y="2" width="4" height="18" rx="1" opacity="0.8"/><rect x="21" y="0" width="4" height="20" rx="1"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
        </div>
      </div>

      {/* Prototype toggle */}
      <div style={{ flexShrink:0, display:'flex', justifyContent:'center', padding:'6px 16px', background:BG2, borderBottom:`1px solid ${BD}` }}>
        <div style={{ display:'inline-flex', background:'white', border:`1px solid ${BD}`, borderRadius:20, padding:3, gap:2 }}>
          <button onClick={() => { setManyAttempts(false); setPastExpanded(false); setHybridPastExpanded(false) }}
            style={{ padding:'4px 14px', borderRadius:16, fontSize:11, fontWeight:600, background:!manyAttempts?P:'transparent', color:!manyAttempts?'white':T3, border:'none', cursor:'pointer' }}>
            Few Attempts
          </button>
          <button onClick={() => { setManyAttempts(true); setPastExpanded(false); setHybridPastExpanded(false) }}
            style={{ padding:'4px 14px', borderRadius:16, fontSize:11, fontWeight:600, background:manyAttempts?P:'transparent', color:manyAttempts?'white':T3, border:'none', cursor:'pointer' }}>
            Many Attempts
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding:'8px 20px 10px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg, ${P}, #8B82E0)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:14 }}>A</div>
          <span style={{ fontSize:17, fontWeight:700, color:T1 }}>Tests</span>
        </div>
        <button onClick={handleBellClick} style={{ position:'relative', background:'none', border:'none', color:T2, display:'flex', cursor:'pointer', padding:4 }}>
          <BellIcon />
          {unreadCount > 0 && (
            <span style={{ position:'absolute', top:0, right:0, minWidth:16, height:16, borderRadius:8, background:'#E53E3E', border:'1.5px solid white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'white', padding:'0 3px' }}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Category tab bar */}
      <div style={{ flexShrink:0, borderBottom:`1px solid ${BD}` }}>
        <div style={{ display:'flex', overflowX:'auto', padding:'0 4px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ flexShrink:0, padding:'10px 14px', fontSize:13, fontWeight:activeCategory===cat?700:500, color:activeCategory===cat?P:T2, background:'none', border:'none', borderBottom:`2px solid ${activeCategory===cat?P:'transparent'}`, cursor:'pointer', whiteSpace:'nowrap' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="scroll" style={{ flex:1 }}>
        {activeCategory === 'Live Test' ? (
          <div style={{ padding:'16px 16px 32px' }}>

            {/* ── Currently Live ── */}
            <div style={{ fontSize:13, fontWeight:700, color:T1, marginBottom:12 }}>Live Now</div>
            <div style={{ background:`linear-gradient(135deg, ${P} 0%, ${PD} 100%)`, borderRadius:14, padding:'18px 16px 16px', marginBottom:24, boxShadow:`0 4px 16px rgba(83,74,183,0.28)` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, background:'rgba(255,255,255,0.18)', color:'white', border:'1px solid rgba(255,255,255,0.32)' }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#FF6B6B', display:'inline-block', boxShadow:'0 0 0 2px rgba(255,107,107,0.4)', animation:'livePulse 1.4s ease-in-out infinite' }} />
                  LIVE
                </span>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.72)', fontWeight:500 }}>{LIVE_TEST.timeLabel}</span>
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:'white', marginBottom:12, lineHeight:1.4 }}>{LIVE_TEST.name}</div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                {[
                  { icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>, label:LIVE_TEST.durationLabel },
                  { icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>, label:`${LIVE_TEST.marks} Marks` },
                  { icon:<UsersIcon />, label:`${LIVE_TEST.enrolled.toLocaleString()} joined` },
                ].map((m, i) => (
                  <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'rgba(255,255,255,0.80)', fontWeight:500 }}>{m.icon}{m.label}</span>
                ))}
              </div>
              <button onClick={() => onJoinNow && onJoinNow(LIVE_TEST)} style={{ width:'100%', padding:'12px', borderRadius:10, background:'white', color:P, fontSize:14, fontWeight:700, border:'none', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
                Join Now
              </button>
            </div>

            {/* ── Upcoming Tests ── */}
            <div style={{ borderTop:`1px solid ${BD}`, paddingTop:16, marginBottom:24 }}>
              {variant === 'hybrid' ? (
                // ── V3: 2-card inline preview + calendar CTA below ──
                <>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:T1 }}>Upcoming Tests</span>
                    <div style={{ display:'inline-flex', background:BG2, border:`1px solid ${BD}`, borderRadius:20, padding:3, gap:2 }}>
                      {[{ id:'full_mock', label:'Full Mock' }, { id:'subject_preboard', label:'Subject' }].map(tab => {
                        const isActive = hybridUpcomingTab === tab.id
                        return (
                          <button key={tab.id}
                            onClick={() => setHybridUpcomingTab(tab.id)}
                            style={{ padding:'4px 12px', borderRadius:16, fontSize:11, fontWeight:600, background:isActive?P:'transparent', color:isActive?'white':T3, border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>
                            {tab.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  {hybridList.map(t => (
                    <UpcomingCard key={t.id} test={t} isRegistered={registeredIds.has(t.id)} onRegisterClick={handleRegisterClick} />
                  ))}
                  {/* Calendar CTA strip */}
                  <button onClick={() => setShowCalendar(true)}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:10, background:'#EDF4FF', border:'1.5px solid #93B8F0', borderRadius:10, padding:'10px 14px', cursor:'pointer', textAlign:'left', marginTop:6 }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:'#1A56B0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                    <span style={{ flex:1, fontSize:12, fontWeight:600, color:'#1A56B0' }}>View full test calendar</span>
                    <ChevronRight size={16} />
                  </button>
                </>
              ) : variant === 'cta' ? (
                // ── V1: Calendar CTA card (opens full-screen overlay) ──
                <button onClick={() => setShowCalendar(true)}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:12, background:'#EDF4FF', border:'1.5px solid #93B8F0', borderRadius:12, padding:'13px 14px', cursor:'pointer', textAlign:'left' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:'#1A56B0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#1A56B0' }}>Upcoming Test Calendar</div>
                    <div style={{ fontSize:11, color:T2, marginTop:2 }}>Tap to view all upcoming tests</div>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ) : (
                // ── V2: Full list with segmented toggle ──
                <>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:T1 }}>Upcoming Tests</span>
                    <div style={{ display:'inline-flex', background:BG2, border:`1px solid ${BD}`, borderRadius:20, padding:3, gap:2 }}>
                      {[{ id:'full_mock', label:'Full Mock' }, { id:'subject_preboard', label:'Subject' }].map(tab => {
                        const isActive = upcomingTab === tab.id
                        return (
                          <button key={tab.id}
                            onClick={() => { setUpcomingTab(tab.id); setUpcomingExpanded(false) }}
                            style={{ padding:'4px 12px', borderRadius:16, fontSize:11, fontWeight:600, background:isActive?P:'transparent', color:isActive?'white':T3, border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>
                            {tab.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  {visibleList.map(t => (
                    <UpcomingCard key={t.id} test={t} isRegistered={registeredIds.has(t.id)} onRegisterClick={handleRegisterClick} />
                  ))}
                  {hasMore && !upcomingExpanded && (
                    <button onClick={() => setUpcomingExpanded(true)}
                      style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', color:P, fontSize:12, fontWeight:600, cursor:'pointer', padding:'4px 0 0' }}>
                      {upcomingTab === 'subject_preboard' ? 'View All Subject Preboards' : 'View All Full Mocks'} <ChevronRight />
                    </button>
                  )}
                  {upcomingExpanded && (
                    <button onClick={() => setUpcomingExpanded(false)}
                      style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', color:T2, fontSize:12, fontWeight:600, cursor:'pointer', padding:'4px 0 0' }}>
                      Show fewer <ChevronUp size={14} />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* ── Past Tests ── */}
            <div style={{ borderTop:`1px solid ${BD}`, paddingTop:16 }}>
              {variant === 'hybrid' ? (
                // ── V3: Collapsed summary → expand with filter pills ──
                <>
                  {!hybridPastExpanded ? (
                    <button onClick={() => setHybridPastExpanded(true)}
                      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:12, background:BG2, border:`1px solid ${BD}`, cursor:'pointer', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:PL, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><polyline points="9,12 11,14 15,10"/></svg>
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:T1, textAlign:'left' }}>
                            {totalPast} past tests
                          </div>
                          <div style={{ fontSize:11, color:T3, marginTop:3, display:'flex', alignItems:'center', gap:6 }}>
                            <span>Subject <span style={{ color:G, fontWeight:700 }}>{subjectAttempted}</span>/{subjectPast.length}</span>
                            <span style={{ color:BD }}>·</span>
                            <span>Full Mock <span style={{ color:G, fontWeight:700 }}>{fullAttempted}</span>/{fullPast.length}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ color:T3 }}><ChevronDown size={18} /></div>
                    </button>
                  ) : (
                    <>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:T1 }}>Past Tests</span>
                        <button onClick={() => setHybridPastExpanded(false)}
                          style={{ display:'flex', alignItems:'center', gap:3, background:'none', border:'none', color:T2, fontSize:11, fontWeight:600, cursor:'pointer', padding:0 }}>
                          Collapse <ChevronUp size={13} />
                        </button>
                      </div>
                      {/* Filter pills */}
                      <div style={{ display:'flex', gap:7, marginBottom:14 }}>
                        {[{ id:'full_mock', label:'Full Mock' }, { id:'subject_preboard', label:'Subject' }].map(f => {
                          const isActive = hybridPastTab === f.id
                          return (
                            <button key={f.id} onClick={() => setHybridPastTab(f.id)} style={{
                              padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:isActive?700:500,
                              background: isActive ? P : 'white',
                              color: isActive ? 'white' : T2,
                              border: `1.5px solid ${isActive ? P : BD}`,
                              cursor:'pointer',
                            }}>{f.label}</button>
                          )
                        })}
                        <span style={{ marginLeft:'auto', fontSize:11, color:T3, alignSelf:'center' }}>
                          <span style={{ color:G, fontWeight:700 }}>{hybridPastTab === 'subject_preboard' ? subjectAttempted : fullAttempted}</span>
                          /{hybridPastTab === 'subject_preboard' ? subjectPast.length : fullPast.length} attempted
                        </span>
                      </div>
                      {hybridPastFiltered.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'24px 0', color:T3, fontSize:13 }}>No past tests in this category</div>
                      ) : (
                        hybridPastFiltered.map(t => <PastCard key={t.id} test={t} />)
                      )}
                    </>
                  )}
                </>
              ) : variant === 'cta' ? (
                // ── V1: Segmented filter tabs, always visible ──
                <>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:T1 }}>Past Tests</span>
                    <div style={{ display:'inline-flex', background:BG2, border:`1px solid ${BD}`, borderRadius:20, padding:3, gap:2 }}>
                      {[{ id:'full_mock', label:'Full-length' }, { id:'subject_preboard', label:'Subject-level' }].map(tab => {
                        const isActive = pastTab === tab.id
                        return (
                          <button key={tab.id} onClick={() => setPastTab(tab.id)}
                            style={{ padding:'4px 12px', borderRadius:16, fontSize:11, fontWeight:600, background:isActive?P:'transparent', color:isActive?'white':T3, border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>
                            {tab.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  {/* Attempt counts for both categories */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, fontSize:11 }}>
                    <span style={{ color: pastTab === 'subject_preboard' ? T1 : T3, fontWeight: pastTab === 'subject_preboard' ? 600 : 400 }}>
                      Subject{' '}
                      <span style={{ color:G, fontWeight:700 }}>{subjectAttempted}</span>
                      <span style={{ color:T3 }}>/{subjectPast.length}</span>
                    </span>
                    <span style={{ color:BD }}>·</span>
                    <span style={{ color: pastTab === 'full_mock' ? T1 : T3, fontWeight: pastTab === 'full_mock' ? 600 : 400 }}>
                      Full-length{' '}
                      <span style={{ color:G, fontWeight:700 }}>{fullAttempted}</span>
                      <span style={{ color:T3 }}>/{fullPast.length}</span>
                    </span>
                  </div>
                  {filteredPast.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'24px 0', color:T3, fontSize:13 }}>No past tests in this category</div>
                  ) : (
                    filteredPast.map(t => <PastCard key={t.id} test={t} />)
                  )}
                </>
              ) : (
                // ── V2: Collapsed summary → expand to full list ──
                <>
                  <div style={{ fontSize:13, fontWeight:700, color:T1, marginBottom:12 }}>Past Tests</div>
                  {!pastExpanded ? (
                    <button onClick={() => setPastExpanded(true)}
                      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:12, background:BG2, border:`1px solid ${BD}`, cursor:'pointer', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:PL, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><polyline points="9,12 11,14 15,10"/></svg>
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:T1, textAlign:'left' }}>
                            {totalPast} past tests
                          </div>
                          <div style={{ fontSize:11, color:T3, marginTop:3, display:'flex', alignItems:'center', gap:6 }}>
                            <span>Subject <span style={{ color:G, fontWeight:700 }}>{subjectAttempted}</span>/{subjectPast.length}</span>
                            <span style={{ color:BD }}>·</span>
                            <span>Full-length <span style={{ color:G, fontWeight:700 }}>{fullAttempted}</span>/{fullPast.length}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ color:T3 }}><ChevronDown size={18} /></div>
                    </button>
                  ) : (
                    <>
                      <button onClick={() => setPastExpanded(false)}
                        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderRadius:12, background:PL, border:`1px solid ${PB}`, cursor:'pointer', marginBottom:12 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:PD }}>
                          {totalPast} past tests
                          <span style={{ color:PB, fontWeight:500 }}> · </span>
                          <span style={{ color:G, fontWeight:700 }}>{attemptedPast} attempted</span>
                        </span>
                        <div style={{ display:'flex', alignItems:'center', gap:4, color:P }}>
                          <span style={{ fontSize:11, fontWeight:600 }}>Hide</span>
                          <ChevronUp size={14} />
                        </div>
                      </button>
                      {pastTests.map(t => <PastCard key={t.id} test={t} />)}
                    </>
                  )}
                </>
              )}
            </div>

          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60%', color:T3, gap:10 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
            <div style={{ fontSize:14, fontWeight:600, color:T2 }}>{activeCategory}</div>
            <div style={{ fontSize:12, color:T3, textAlign:'center', maxWidth:200, lineHeight:1.5 }}>Tests filtered by category will appear here</div>
          </div>
        )}
      </div>

      <NavBar navigate={navigate} />

      {/* ── Calendar screen overlay ── */}
      {showCalendar && (
        <CalendarScreen
          tests={calendarTests}
          registeredIds={registeredIds}
          onRegister={handleRegisterClick}
          onBack={() => setShowCalendar(false)}
        />
      )}

      {/* ── Notifications ── */}
      {showNotifs && (
        <div style={{ position:'absolute', inset:0, background:'white', zIndex:50, display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'12px 20px 4px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
            <span style={{ fontSize:13, fontWeight:600, color:T1 }}>9:41</span>
            <div style={{ display:'flex', gap:6, alignItems:'center', color:T2 }}>
              <svg width="16" height="11" viewBox="0 0 30 20" fill="currentColor"><rect x="0" y="8" width="4" height="12" rx="1" opacity="0.4"/><rect x="7" y="5" width="4" height="15" rx="1" opacity="0.6"/><rect x="14" y="2" width="4" height="18" rx="1" opacity="0.8"/><rect x="21" y="0" width="4" height="20" rx="1"/></svg>
              <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 20px 12px', borderBottom:`1px solid ${BD}`, flexShrink:0 }}>
            <button onClick={() => setShowNotifs(false)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:T1, padding:0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>
            </button>
            <span style={{ fontSize:16, fontWeight:700, color:T1 }}>Notifications</span>
            {unreadCount > 0 && <span style={{ background:P, color:'white', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>{unreadCount} new</span>}
          </div>
          <div className="scroll" style={{ flex:1, padding:'12px 16px 24px' }}>
            {NOTIFICATIONS.map(n => {
              const isUnread = !readIds.has(n.id)
              return (
                <div key={n.id} style={{ padding:'13px 14px', borderRadius:12, marginBottom:8, background:isUnread?'white':BG2, border:`1px solid ${BD}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
                      {isUnread && <span style={{ width:6, height:6, borderRadius:'50%', background:n.type==='live'?'#E53E3E':P, flexShrink:0, marginTop:2 }} />}
                      <span style={{ fontSize:13, fontWeight:isUnread?700:500, color:isUnread?T1:T2, lineHeight:1.4 }}>{n.title}</span>
                    </div>
                    <span style={{ fontSize:10, color:T3, flexShrink:0, marginLeft:8, marginTop:2 }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize:12, color:T3, lineHeight:1.5, marginLeft:isUnread?14:0, marginBottom:n.type==='live'?10:0 }}>{n.body}</div>
                  {n.type === 'live' && (
                    <div style={{ marginLeft:isUnread?14:0 }}>
                      <button onClick={() => { setShowNotifs(false); onJoinNow && onJoinNow(LIVE_TEST) }} style={{ padding:'7px 16px', borderRadius:8, background:P, color:'white', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>
                        Join Now
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Confirm registration popup ── */}
      {activeModal?.type === 'confirm' && (
        <div className="popup-overlay">
          <div className="popup">
            <div style={{ width:44, height:44, borderRadius:12, background:PL, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <BellIcon size={22} />
            </div>
            <div style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:8 }}>Confirm Registration</div>
            <div style={{ fontSize:13, color:T2, lineHeight:1.6, marginBottom:20 }}>
              Register for <span style={{ fontWeight:600, color:T1 }}>{activeModal.test.fullName}</span>?
              {' '}You'll be notified as soon as this test goes live.
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleCancel} style={{ flex:1, padding:'11px', borderRadius:10, background:'transparent', color:T2, border:`1px solid ${BD}`, fontSize:14, fontWeight:600, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleConfirm} style={{ flex:1, padding:'11px', borderRadius:10, background:P, color:'white', border:'none', fontSize:14, fontWeight:700, cursor:'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Registration success popup ── */}
      {activeModal?.type === 'success' && (
        <div className="popup-overlay" style={{ overflow:'hidden' }}>
          {CONFETTI.map((c, i) => (
            <div key={i} style={{ position:'absolute', top:0, left:c.left, width:c.w, height:c.h, borderRadius:c.round?'50%':2, background:c.color, animation:`confettiFall ${c.dur}s ${c.delay}s ease-in both`, zIndex:0, pointerEvents:'none' }} />
          ))}
          <div className="popup" style={{ textAlign:'center', position:'relative', zIndex:1 }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:GL, border:`3px solid ${GB}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', animation:'checkPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
            </div>
            <div style={{ fontSize:26, fontWeight:800, color:P, marginBottom:4, animation:'hooraySlide 0.4s 0.25s ease-out forwards', opacity:0 }}>Hooray! 🎉</div>
            <div style={{ fontSize:15, fontWeight:700, color:T1, marginBottom:10 }}>You're Registered!</div>
            <div style={{ fontSize:13, color:T2, lineHeight:1.6, marginBottom:22 }}>
              We'll notify you as soon as <span style={{ fontWeight:600, color:T1 }}>{activeModal.test.fullName}</span> goes live. Good luck!
            </div>
            <button onClick={handleSuccessDone} style={{ width:'100%', padding:'13px', borderRadius:12, background:P, color:'white', border:'none', fontSize:14, fontWeight:700, cursor:'pointer' }}>Got it</button>
          </div>
        </div>
      )}

    </div>
  )
}
