import { useState } from 'react'

const P = '#534AB7', PL = '#EEEDFE', PB = '#AFA9EC', PD = '#3C3489'
const G = '#3B6D11', GL = '#EAF3DE', GB = '#97C459'
const A = '#633806', AL = '#FAEEDA', AB = '#FAC775'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0'
const BD = '#e8e8f2', BG2 = '#f5f5fb'

const CAT_COLORS = {
  'PYQ Test':     { bg: PL,        color: PD,        border: PB },
  'Subject Test': { bg: AL,        color: A,         border: AB },
  'Daily Test':   { bg: '#EDF4FF', color: '#1A56B0', border: '#93B8F0' },
  'Mini Test':    { bg: GL,        color: G,         border: GB },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const LIVE_TEST = {
  id: 0,
  name: 'NORCET 8 Grand Test – Session 1',
  timeLabel: 'Today, 3:00 PM – 5:00 PM',
  duration: 120,
  durationLabel: '120 min',
  marks: '200',
  enrolled: 2847,
  questions: 200,
  totalMarks: 200,
  correctMarks: 1,
  wrongMarks: -0.25,
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

const UPCOMING = [
  { id:2, name:'Anatomy Subject Test – Series 4',  date:'Sat, 14 Jun', daysOut:2,  duration:'60 min',  marks:'100', registered:true  },
  { id:3, name:'Daily Practice Test – Physiology', date:'Mon, 16 Jun', daysOut:4,  duration:'45 min',  marks:'75',  registered:false },
  { id:4, name:'NORCET 8 Grand Test – Session 2',  date:'Sat, 21 Jun', daysOut:9,  duration:'120 min', marks:'200', registered:false },
  { id:5, name:'PYQ Revision Test – 2023 Paper',   date:'Mon, 23 Jun', daysOut:11, duration:'90 min',  marks:'150', registered:false },
  { id:6, name:'Mini Test – Pharmacology Basics',  date:'Wed, 25 Jun', daysOut:13, duration:'30 min',  marks:'50',  registered:false },
]

// f = attempted in "few" scenario, m = attempted in "many" scenario
// dateSort is a numeric timestamp used for reliable sorting
const PAST = [
  { id:101, name:'Daily Practice Test – Biochemistry',  date:'10 Jun 2025', ts: new Date('2025-06-10'), dur:'45 min',  mks:'75',  cat:'Daily Test',   f:true,  m:true  },
  { id:102, name:'NORCET 8 Mock – Full Syllabus',       date:'7 Jun 2025',  ts: new Date('2025-06-07'), dur:'120 min', mks:'200', cat:'Subject Test', f:false, m:true  },
  { id:103, name:'PYQ Revision Test – 2022 Paper',      date:'5 Jun 2025',  ts: new Date('2025-06-05'), dur:'90 min',  mks:'150', cat:'PYQ Test',     f:true,  m:true  },
  { id:104, name:'Mini Test – Respiratory System',      date:'3 Jun 2025',  ts: new Date('2025-06-03'), dur:'30 min',  mks:'50',  cat:'Mini Test',    f:false, m:true  },
  { id:105, name:'Daily Practice Test – Physiology',    date:'1 Jun 2025',  ts: new Date('2025-06-01'), dur:'45 min',  mks:'75',  cat:'Daily Test',   f:true,  m:true  },
  { id:106, name:'Anatomy Subject Test – Series 3',     date:'29 May 2025', ts: new Date('2025-05-29'), dur:'60 min',  mks:'100', cat:'Subject Test', f:false, m:true  },
  { id:107, name:'PYQ Revision Test – 2021 Paper',      date:'26 May 2025', ts: new Date('2025-05-26'), dur:'90 min',  mks:'150', cat:'PYQ Test',     f:false, m:true  },
  { id:108, name:'Mini Test – Cardiovascular System',   date:'24 May 2025', ts: new Date('2025-05-24'), dur:'30 min',  mks:'50',  cat:'Mini Test',    f:true,  m:true  },
  { id:109, name:'Daily Practice Test – Microbiology',  date:'22 May 2025', ts: new Date('2025-05-22'), dur:'45 min',  mks:'75',  cat:'Daily Test',   f:false, m:true  },
  { id:110, name:'NORCET 8 Mock – Pharmacology Focus',  date:'19 May 2025', ts: new Date('2025-05-19'), dur:'90 min',  mks:'150', cat:'Subject Test', f:true,  m:true  },
  { id:111, name:'PYQ Revision Test – 2020 Paper',      date:'17 May 2025', ts: new Date('2025-05-17'), dur:'90 min',  mks:'150', cat:'PYQ Test',     f:false, m:true  },
  { id:112, name:'Mini Test – Renal System',            date:'15 May 2025', ts: new Date('2025-05-15'), dur:'30 min',  mks:'50',  cat:'Mini Test',    f:false, m:true  },
  { id:113, name:'Daily Practice Test – Pathology',     date:'13 May 2025', ts: new Date('2025-05-13'), dur:'45 min',  mks:'75',  cat:'Daily Test',   f:true,  m:true  },
  { id:114, name:'Anatomy Subject Test – Series 2',     date:'10 May 2025', ts: new Date('2025-05-10'), dur:'60 min',  mks:'100', cat:'Subject Test', f:false, m:true  },
  { id:115, name:'PYQ Revision Test – 2019 Paper',      date:'8 May 2025',  ts: new Date('2025-05-08'), dur:'90 min',  mks:'150', cat:'PYQ Test',     f:false, m:true  },
  { id:116, name:'Mini Test – Nervous System',          date:'6 May 2025',  ts: new Date('2025-05-06'), dur:'30 min',  mks:'50',  cat:'Mini Test',    f:false, m:false },
  { id:117, name:'Daily Practice Test – Community Med', date:'3 May 2025',  ts: new Date('2025-05-03'), dur:'45 min',  mks:'75',  cat:'Daily Test',   f:false, m:false },
  { id:118, name:'NORCET 8 Mock – Full Syllabus 2',     date:'1 May 2025',  ts: new Date('2025-05-01'), dur:'120 min', mks:'200', cat:'Subject Test', f:true,  m:false },
  { id:119, name:'PYQ Revision Test – 2018 Paper',      date:'28 Apr 2025', ts: new Date('2025-04-28'), dur:'90 min',  mks:'150', cat:'PYQ Test',     f:false, m:false },
  { id:120, name:'Mini Test – Musculoskeletal System',  date:'26 Apr 2025', ts: new Date('2025-04-26'), dur:'30 min',  mks:'50',  cat:'Mini Test',    f:false, m:false },
  { id:121, name:'Daily Practice Test – Surgery',       date:'24 Apr 2025', ts: new Date('2025-04-24'), dur:'45 min',  mks:'75',  cat:'Daily Test',   f:false, m:false },
  { id:122, name:'Anatomy Subject Test – Series 1',     date:'21 Apr 2025', ts: new Date('2025-04-21'), dur:'60 min',  mks:'100', cat:'Subject Test', f:false, m:false },
  { id:123, name:'PYQ Revision Test – 2017 Paper',      date:'19 Apr 2025', ts: new Date('2025-04-19'), dur:'90 min',  mks:'150', cat:'PYQ Test',     f:false, m:false },
]

// ─── Notifications data ───────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'live',
    title: 'NORCET 8 Grand Test – Session 1',
    body: 'Your registered test is live right now. Join before it closes!',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'upcoming',
    title: 'Anatomy Subject Test – Series 4',
    body: 'Starts in 2 days on Sat, 14 Jun. You\'re registered — stay prepared.',
    time: '1 hr ago',
    read: false,
  },
  {
    id: 3,
    type: 'upcoming',
    title: 'NORCET 8 Grand Test – Session 2',
    body: 'Registrations are open. Test scheduled for Sat, 21 Jun.',
    time: '6 hr ago',
    read: false,
  },
  {
    id: 4,
    type: 'result',
    title: 'PYQ Revision Test – 2022 Paper',
    body: 'Results are out! View your score and detailed analysis.',
    time: '3 days ago',
    read: true,
  },
  {
    id: 5,
    type: 'result',
    title: 'Daily Practice Test – Biochemistry',
    body: 'Your result for the 10 Jun test is now available.',
    time: '4 days ago',
    read: true,
  },
  {
    id: 6,
    type: 'result',
    title: 'Daily Practice Test – Physiology',
    body: 'Results declared. Check how you performed on 1 Jun test.',
    time: '12 days ago',
    read: true,
  },
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
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9"/>
  </svg>
)
const ChevronUp = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18,15 12,9 6,15"/>
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ─── Shared sub-components ────────────────────────────────────────────────────

function CatTag({ cat }) {
  const c = CAT_COLORS[cat] || { bg: BG2, color: T2, border: BD }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 600,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      flexShrink: 0,
    }}>{cat}</span>
  )
}

function MetaChip({ icon, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: T2, fontWeight: 500 }}>
      {icon}{label}
    </span>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 12 }}>
      {children}
    </div>
  )
}

// ─── Upcoming card — register state + callback are lifted up ──────────────────

function UpcomingCard({ test, isRegistered, onRegisterClick }) {
  const soon = test.daysOut <= 3
  const dayBg = soon ? AL : '#EDF4FF'
  const dayColor = soon ? A : '#1A56B0'
  const dayBorder = soon ? AB : '#93B8F0'
  return (
    <div style={{ background: 'white', border: `1px solid ${BD}`, borderRadius: 12, padding: '14px 14px 12px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: dayBg, color: dayColor, border: `1px solid ${dayBorder}` }}>
          In {test.daysOut} {test.daysOut === 1 ? 'day' : 'days'}
        </span>
        <span style={{ fontSize: 11, color: T3, fontWeight: 500 }}>{test.date}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 10, lineHeight: 1.45 }}>{test.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <MetaChip icon={<ClockIcon />} label={test.duration} />
        <MetaChip icon={<StarIcon />} label={`${test.marks} Marks`} />
        <button
          onClick={() => !isRegistered && onRegisterClick(test)}
          style={{
            marginLeft: 'auto', padding: '6px 14px', borderRadius: 8,
            fontSize: 11, fontWeight: 600,
            cursor: isRegistered ? 'default' : 'pointer',
            background: isRegistered ? GL : 'transparent',
            color: isRegistered ? G : P,
            border: `1px solid ${isRegistered ? GB : PB}`,
          }}
        >
          {isRegistered ? '✓ Registered' : 'Register'}
        </button>
      </div>
    </div>
  )
}

// ─── Past card ────────────────────────────────────────────────────────────────

function PastCard({ test }) {
  if (test.attempted) {
    return (
      <div style={{ background: 'white', border: `1px solid ${BD}`, borderRadius: 12, padding: '14px 14px 12px', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: GL, color: G, border: `1px solid ${GB}` }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: G, display: 'inline-block' }} />
            Result Out
          </span>
          <CatTag cat={test.cat} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 10, lineHeight: 1.45 }}>{test.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: T3 }}>{test.date}</span>
          <span style={{ color: BD }}>·</span>
          <MetaChip icon={<ClockIcon />} label={test.dur} />
          <span style={{ color: BD }}>·</span>
          <MetaChip icon={<StarIcon />} label={`${test.mks} Marks`} />
          <button style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: PL, color: P, border: `1px solid ${PB}`, cursor: 'pointer' }}>
            View Result
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: '14px 14px 12px', marginBottom: 10, opacity: 0.68 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'white', color: T3, border: `1px solid ${BD}` }}>
          Not Attempted
        </span>
        <CatTag cat={test.cat} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: T2, marginBottom: 10, lineHeight: 1.45 }}>{test.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: T3 }}>{test.date}</span>
        <span style={{ color: BD }}>·</span>
        <span style={{ fontSize: 11, color: T3, display: 'inline-flex', alignItems: 'center', gap: 3 }}><ClockIcon />{test.dur}</span>
        <span style={{ color: BD }}>·</span>
        <span style={{ fontSize: 11, color: T3, display: 'inline-flex', alignItems: 'center', gap: 3 }}><StarIcon />{test.mks} Marks</span>
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
          onClick={() => {
            if (t.id === 'home' || t.id === 'qbank') navigate('home')
            else if (t.id === 'videos') navigate('videos')
          }}
          style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'8px 0 10px', background:'none', border:'none', color:t.active ? P : T3, cursor:'pointer' }}>
          {t.icon}
          <span style={{ fontSize:10, fontWeight:t.active ? 600 : 400 }}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LiveTest({ navigate, onJoinNow }) {
  const [manyAttempts, setManyAttempts]   = useState(false)
  const [activeCategory, setActiveCategory] = useState('Live Test')
  const [upExpanded, setUpExpanded]       = useState(false)
  const [pastExpanded, setPastExpanded]   = useState(false)

  // Registration state — lifted here so modals can render at page level
  const [registeredIds, setRegisteredIds] = useState(
    () => new Set(UPCOMING.filter(t => t.registered).map(t => t.id))
  )
  // activeModal: null | { type: 'confirm' | 'success', test }
  const [activeModal, setActiveModal]     = useState(null)

  // Notification bell — track read IDs
  const [showNotifs, setShowNotifs]       = useState(false)
  const [readIds, setReadIds]             = useState(
    () => new Set(NOTIFICATIONS.filter(n => n.read).map(n => n.id))
  )

  // Past tests: attempted first (desc date), then unattempted (desc date)
  const rawPast   = PAST.map(t => ({ ...t, attempted: manyAttempts ? t.m : t.f }))
  const pastTests = [...rawPast].sort((a, b) => {
    if (a.attempted !== b.attempted) return a.attempted ? -1 : 1
    return b.ts - a.ts
  })
  const totalPast    = pastTests.length
  const attemptedPast = pastTests.filter(t => t.attempted).length

  const visibleUpcoming  = upExpanded ? UPCOMING : UPCOMING.slice(0, 3)
  const hasMoreUpcoming  = UPCOMING.length > 3
  const registeredUpcoming = UPCOMING.filter(t => registeredIds.has(t.id))
  const CATEGORIES = ['PYQ Test', 'Subject Test', 'Daily Test', 'Mini Test', 'Live Test']

  // Register flow handlers
  const handleRegisterClick = (test) => setActiveModal({ type: 'confirm', test })
  const handleConfirm = () => {
    const test = activeModal.test
    setRegisteredIds(prev => new Set([...prev, test.id]))
    setActiveModal({ type: 'success', test })
  }
  const handleCancel      = () => setActiveModal(null)
  const handleSuccessDone = () => setActiveModal(null)

  // Bell handlers
  const unreadCount = NOTIFICATIONS.filter(n => !readIds.has(n.id)).length
  const handleBellClick = () => {
    setShowNotifs(true)
    setReadIds(new Set(NOTIFICATIONS.map(n => n.id)))
  }
  const hasBadge = unreadCount > 0

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
          <button onClick={() => { setManyAttempts(false); setPastExpanded(false) }}
            style={{ padding:'4px 14px', borderRadius:16, fontSize:11, fontWeight:600, background:!manyAttempts ? P : 'transparent', color:!manyAttempts ? 'white' : T3, border:'none', cursor:'pointer' }}>
            Few Attempts
          </button>
          <button onClick={() => { setManyAttempts(true); setPastExpanded(false) }}
            style={{ padding:'4px 14px', borderRadius:16, fontSize:11, fontWeight:600, background:manyAttempts ? P : 'transparent', color:manyAttempts ? 'white' : T3, border:'none', cursor:'pointer' }}>
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
        {/* Bell with badge */}
        <button onClick={handleBellClick}
          style={{ position:'relative', background:'none', border:'none', color:T2, display:'flex', cursor:'pointer', padding:4 }}>
          <BellIcon />
          {hasBadge && (
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
              style={{ flexShrink:0, padding:'10px 14px', fontSize:13, fontWeight:activeCategory === cat ? 700 : 500, color:activeCategory === cat ? P : T2, background:'none', border:'none', borderBottom:`2px solid ${activeCategory === cat ? P : 'transparent'}`, cursor:'pointer', whiteSpace:'nowrap' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="scroll" style={{ flex:1 }}>
        {activeCategory === 'Live Test' ? (
          <div style={{ padding:'16px 16px 32px' }}>

            {/* ── Live Now ── */}
            <SectionLabel>Live Now</SectionLabel>
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
                <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'rgba(255,255,255,0.80)', fontWeight:500 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                  {LIVE_TEST.durationLabel}
                </span>
                <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'rgba(255,255,255,0.80)', fontWeight:500 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  {LIVE_TEST.marks} Marks
                </span>
                <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'rgba(255,255,255,0.80)', fontWeight:500 }}>
                  <UsersIcon />{LIVE_TEST.enrolled.toLocaleString()} joined
                </span>
              </div>
              <button onClick={() => onJoinNow && onJoinNow(LIVE_TEST)} style={{ width:'100%', padding:'12px', borderRadius:10, background:'white', color:P, fontSize:14, fontWeight:700, border:'none', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
                Join Now
              </button>
            </div>

            {/* ── Upcoming Tests ── */}
            <SectionLabel>Upcoming Tests</SectionLabel>
            {visibleUpcoming.map(t => (
              <UpcomingCard key={t.id} test={t} isRegistered={registeredIds.has(t.id)} onRegisterClick={handleRegisterClick} />
            ))}
            {hasMoreUpcoming && !upExpanded && (
              <button onClick={() => setUpExpanded(true)}
                style={{ width:'100%', padding:'11px', marginBottom:24, background:'white', border:`1px solid ${BD}`, borderRadius:12, fontSize:13, fontWeight:600, color:P, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                View All {UPCOMING.length} Upcoming Tests <ChevronDown size={14} />
              </button>
            )}
            {upExpanded && (
              <button onClick={() => setUpExpanded(false)}
                style={{ width:'100%', padding:'11px', marginBottom:24, background:BG2, border:`1px solid ${BD}`, borderRadius:12, fontSize:13, fontWeight:600, color:T2, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                Show Less <ChevronUp size={14} />
              </button>
            )}
            {!hasMoreUpcoming && <div style={{ marginBottom:24 }} />}

            {/* ── Past Tests ── */}
            <SectionLabel>Past Tests</SectionLabel>
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
                      <span style={{ color:T3, fontWeight:500 }}> · </span>
                      <span style={{ color:G, fontWeight:700 }}>{attemptedPast} attempted</span>
                    </div>
                    <div style={{ fontSize:11, color:T3, fontWeight:400, marginTop:1 }}>Tap to view full history</div>
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

          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60%', color:T3, gap:10 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
            <div style={{ fontSize:14, fontWeight:600, color:T2 }}>{activeCategory}</div>
            <div style={{ fontSize:12, color:T3, textAlign:'center', maxWidth:200, lineHeight:1.5 }}>
              Tests filtered by category will appear here
            </div>
          </div>
        )}
      </div>

      <NavBar navigate={navigate} />

      {/* ── Notifications — full screen ── */}
      {showNotifs && (
        <div style={{ position:'absolute', inset:0, background:'white', zIndex:50, display:'flex', flexDirection:'column' }}>

          {/* Header */}
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
            {unreadCount > 0 && (
              <span style={{ background:P, color:'white', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, marginLeft:2 }}>{unreadCount} new</span>
            )}
          </div>

          {/* List */}
          <div className="scroll" style={{ flex:1, padding:'12px 16px 24px' }}>
            {NOTIFICATIONS.map(n => {
              const isUnread = !readIds.has(n.id)
              const isLive   = n.type === 'live'
              return (
                <div key={n.id} style={{
                  padding:'13px 14px', borderRadius:12, marginBottom:8,
                  background: isUnread ? 'white' : BG2,
                  border:`1px solid ${BD}`,
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
                      {isUnread && <span style={{ width:6, height:6, borderRadius:'50%', background: isLive ? '#E53E3E' : P, flexShrink:0, marginTop:2 }} />}
                      <span style={{ fontSize:13, fontWeight: isUnread ? 700 : 500, color: isUnread ? T1 : T2, lineHeight:1.4 }}>{n.title}</span>
                    </div>
                    <span style={{ fontSize:10, color:T3, flexShrink:0, marginLeft:8, marginTop:2 }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize:12, color:T3, lineHeight:1.5, marginLeft: isUnread ? 14 : 0, marginBottom: isLive ? 10 : 0 }}>{n.body}</div>
                  {isLive && (
                    <div style={{ marginLeft: isUnread ? 14 : 0 }}>
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
              Register for <span style={{ fontWeight:600, color:T1 }}>{activeModal.test.name}</span>?
              {' '}You'll be notified as soon as this test goes live.
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleCancel}
                style={{ flex:1, padding:'11px', borderRadius:10, background:'transparent', color:T2, border:`1px solid ${BD}`, fontSize:14, fontWeight:600, cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={handleConfirm}
                style={{ flex:1, padding:'11px', borderRadius:10, background:P, color:'white', border:'none', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Registration success popup (Hooray! gamified) ── */}
      {activeModal?.type === 'success' && (
        <div className="popup-overlay" style={{ overflow:'hidden' }}>
          {/* Confetti particles */}
          {CONFETTI.map((c, i) => (
            <div key={i} style={{
              position:'absolute', top:0, left:c.left,
              width:c.w, height:c.h,
              borderRadius: c.round ? '50%' : 2,
              background: c.color,
              animation: `confettiFall ${c.dur}s ${c.delay}s ease-in both`,
              zIndex:0, pointerEvents:'none',
            }} />
          ))}
          <div className="popup" style={{ textAlign:'center', position:'relative', zIndex:1 }}>
            {/* Animated check circle */}
            <div style={{
              width:72, height:72, borderRadius:'50%',
              background:GL, border:`3px solid ${GB}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 14px',
              animation:'checkPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <div style={{ fontSize:26, fontWeight:800, color:P, marginBottom:4, animation:'hooraySlide 0.4s 0.25s ease-out forwards', opacity:0 }}>
              Hooray! 🎉
            </div>
            <div style={{ fontSize:15, fontWeight:700, color:T1, marginBottom:10 }}>You're Registered!</div>
            <div style={{ fontSize:13, color:T2, lineHeight:1.6, marginBottom:22 }}>
              We'll notify you as soon as{' '}
              <span style={{ fontWeight:600, color:T1 }}>{activeModal.test.name}</span>{' '}
              goes live. Good luck!
            </div>
            <button onClick={handleSuccessDone}
              style={{ width:'100%', padding:'13px', borderRadius:12, background:P, color:'white', border:'none', fontSize:14, fontWeight:700, cursor:'pointer' }}>
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
