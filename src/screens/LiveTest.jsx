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
  name: 'NORCET 8 Grand Test – Session 1',
  timeLabel: 'Today, 3:00 PM – 5:00 PM',
  duration: '120 min',
  marks: '200',
  enrolled: 2847,
}

const UPCOMING = [
  { id:2, name:'Anatomy Subject Test – Series 4',  date:'Sat, 14 Jun', daysOut:2,  duration:'60 min',  marks:'100', registered:true  },
  { id:3, name:'Daily Practice Test – Physiology', date:'Mon, 16 Jun', daysOut:4,  duration:'45 min',  marks:'75',  registered:false },
  { id:4, name:'NORCET 8 Grand Test – Session 2',  date:'Sat, 21 Jun', daysOut:9,  duration:'120 min', marks:'200', registered:false },
  { id:5, name:'PYQ Revision Test – 2023 Paper',   date:'Mon, 23 Jun', daysOut:11, duration:'90 min',  marks:'150', registered:false },
  { id:6, name:'Mini Test – Pharmacology Basics',  date:'Wed, 25 Jun', daysOut:13, duration:'30 min',  marks:'50',  registered:false },
]

// f = attempted in "few attempts" scenario, m = attempted in "many attempts" scenario
const PAST = [
  { id:101, name:'Daily Practice Test – Biochemistry',  date:'10 Jun 2025', dur:'45 min',  mks:'75',  cat:'Daily Test',   f:true,  m:true  },
  { id:102, name:'NORCET 8 Mock – Full Syllabus',       date:'7 Jun 2025',  dur:'120 min', mks:'200', cat:'Subject Test', f:false, m:true  },
  { id:103, name:'PYQ Revision Test – 2022 Paper',      date:'5 Jun 2025',  dur:'90 min',  mks:'150', cat:'PYQ Test',     f:true,  m:true  },
  { id:104, name:'Mini Test – Respiratory System',      date:'3 Jun 2025',  dur:'30 min',  mks:'50',  cat:'Mini Test',    f:false, m:true  },
  { id:105, name:'Daily Practice Test – Physiology',    date:'1 Jun 2025',  dur:'45 min',  mks:'75',  cat:'Daily Test',   f:true,  m:true  },
  { id:106, name:'Anatomy Subject Test – Series 3',     date:'29 May 2025', dur:'60 min',  mks:'100', cat:'Subject Test', f:false, m:true  },
  { id:107, name:'PYQ Revision Test – 2021 Paper',      date:'26 May 2025', dur:'90 min',  mks:'150', cat:'PYQ Test',     f:false, m:true  },
  { id:108, name:'Mini Test – Cardiovascular System',   date:'24 May 2025', dur:'30 min',  mks:'50',  cat:'Mini Test',    f:true,  m:true  },
  { id:109, name:'Daily Practice Test – Microbiology',  date:'22 May 2025', dur:'45 min',  mks:'75',  cat:'Daily Test',   f:false, m:true  },
  { id:110, name:'NORCET 8 Mock – Pharmacology Focus',  date:'19 May 2025', dur:'90 min',  mks:'150', cat:'Subject Test', f:true,  m:true  },
  { id:111, name:'PYQ Revision Test – 2020 Paper',      date:'17 May 2025', dur:'90 min',  mks:'150', cat:'PYQ Test',     f:false, m:true  },
  { id:112, name:'Mini Test – Renal System',            date:'15 May 2025', dur:'30 min',  mks:'50',  cat:'Mini Test',    f:false, m:true  },
  { id:113, name:'Daily Practice Test – Pathology',     date:'13 May 2025', dur:'45 min',  mks:'75',  cat:'Daily Test',   f:true,  m:true  },
  { id:114, name:'Anatomy Subject Test – Series 2',     date:'10 May 2025', dur:'60 min',  mks:'100', cat:'Subject Test', f:false, m:true  },
  { id:115, name:'PYQ Revision Test – 2019 Paper',      date:'8 May 2025',  dur:'90 min',  mks:'150', cat:'PYQ Test',     f:false, m:true  },
  { id:116, name:'Mini Test – Nervous System',          date:'6 May 2025',  dur:'30 min',  mks:'50',  cat:'Mini Test',    f:false, m:false },
  { id:117, name:'Daily Practice Test – Community Med', date:'3 May 2025',  dur:'45 min',  mks:'75',  cat:'Daily Test',   f:false, m:false },
  { id:118, name:'NORCET 8 Mock – Full Syllabus 2',     date:'1 May 2025',  dur:'120 min', mks:'200', cat:'Subject Test', f:true,  m:false },
  { id:119, name:'PYQ Revision Test – 2018 Paper',      date:'28 Apr 2025', dur:'90 min',  mks:'150', cat:'PYQ Test',     f:false, m:false },
  { id:120, name:'Mini Test – Musculoskeletal System',  date:'26 Apr 2025', dur:'30 min',  mks:'50',  cat:'Mini Test',    f:false, m:false },
  { id:121, name:'Daily Practice Test – Surgery',       date:'24 Apr 2025', dur:'45 min',  mks:'75',  cat:'Daily Test',   f:false, m:false },
  { id:122, name:'Anatomy Subject Test – Series 1',     date:'21 Apr 2025', dur:'60 min',  mks:'100', cat:'Subject Test', f:false, m:false },
  { id:123, name:'PYQ Revision Test – 2017 Paper',      date:'19 Apr 2025', dur:'90 min',  mks:'150', cat:'PYQ Test',     f:false, m:false },
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

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 12, letterSpacing: '-0.1px' }}>
      {children}
    </div>
  )
}

function UpcomingCard({ test }) {
  const [reg, setReg] = useState(test.registered)
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
          onClick={() => setReg(r => !r)}
          style={{
            marginLeft: 'auto', padding: '6px 14px', borderRadius: 8,
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
            background: reg ? GL : 'transparent',
            color: reg ? G : P,
            border: `1px solid ${reg ? GB : PB}`,
          }}
        >
          {reg ? '✓ Registered' : 'Register'}
        </button>
      </div>
    </div>
  )
}

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

function NavBar({ navigate }) {
  const tabs = [
    {
      id: 'home', label: 'Home',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    },
    {
      id: 'qbank', label: 'QBank',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    },
    {
      id: 'videos', label: 'Videos',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
    },
    {
      id: 'livetest', label: 'Tests', active: true,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg>,
    },
    {
      id: 'buy', label: 'Buy',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
    },
  ]
  return (
    <div style={{ flexShrink: 0, background: 'white', borderTop: `1px solid ${BD}`, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(t => (
        <button key={t.id}
          onClick={() => {
            if (t.id === 'home' || t.id === 'qbank') navigate('home')
            else if (t.id === 'videos') navigate('videos')
          }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 10px', background: 'none', border: 'none', color: t.active ? P : T3, cursor: 'pointer' }}>
          {t.icon}
          <span style={{ fontSize: 10, fontWeight: t.active ? 600 : 400 }}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LiveTest({ navigate }) {
  const [manyAttempts, setManyAttempts] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Live Test')
  const [upExpanded, setUpExpanded] = useState(false)
  const [pastExpanded, setPastExpanded] = useState(false)

  const pastTests = PAST.map(t => ({ ...t, attempted: manyAttempts ? t.m : t.f }))
  const totalPast = pastTests.length
  const attemptedPast = pastTests.filter(t => t.attempted).length
  const visibleUpcoming = upExpanded ? UPCOMING : UPCOMING.slice(0, 3)
  const hasMoreUpcoming = UPCOMING.length > 3
  const CATEGORIES = ['PYQ Test', 'Subject Test', 'Daily Test', 'Mini Test', 'Live Test']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>

      {/* Status bar */}
      <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>9:41</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: T2 }}>
          <svg width="16" height="11" viewBox="0 0 30 20" fill="currentColor"><rect x="0" y="8" width="4" height="12" rx="1" opacity="0.4"/><rect x="7" y="5" width="4" height="15" rx="1" opacity="0.6"/><rect x="14" y="2" width="4" height="18" rx="1" opacity="0.8"/><rect x="21" y="0" width="4" height="20" rx="1"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
        </div>
      </div>

      {/* Prototype toggle */}
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '6px 16px', background: BG2, borderBottom: `1px solid ${BD}` }}>
        <div style={{ display: 'inline-flex', background: 'white', border: `1px solid ${BD}`, borderRadius: 20, padding: 3, gap: 2 }}>
          <button
            onClick={() => { setManyAttempts(false); setPastExpanded(false) }}
            style={{ padding: '4px 14px', borderRadius: 16, fontSize: 11, fontWeight: 600, background: !manyAttempts ? P : 'transparent', color: !manyAttempts ? 'white' : T3, border: 'none', cursor: 'pointer' }}
          >Few Attempts</button>
          <button
            onClick={() => { setManyAttempts(true); setPastExpanded(false) }}
            style={{ padding: '4px 14px', borderRadius: 16, fontSize: 11, fontWeight: 600, background: manyAttempts ? P : 'transparent', color: manyAttempts ? 'white' : T3, border: 'none', cursor: 'pointer' }}
          >Many Attempts</button>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: '8px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${P}, #8B82E0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>A</div>
          <span style={{ fontSize: 17, fontWeight: 700, color: T1 }}>Live Tests</span>
        </div>
        <button style={{ background: 'none', border: 'none', color: T2, display: 'flex', cursor: 'pointer', padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        </button>
      </div>

      {/* Category tab bar */}
      <div style={{ flexShrink: 0, borderBottom: `1px solid ${BD}` }}>
        <div style={{ display: 'flex', overflowX: 'auto', padding: '0 4px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                flexShrink: 0, padding: '10px 14px',
                fontSize: 13, fontWeight: activeCategory === cat ? 700 : 500,
                color: activeCategory === cat ? P : T2,
                background: 'none', border: 'none',
                borderBottom: `2px solid ${activeCategory === cat ? P : 'transparent'}`,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="scroll" style={{ flex: 1 }}>
        {activeCategory === 'Live Test' ? (
          <div style={{ padding: '16px 16px 32px' }}>

            {/* ── Live Now section ── */}
            <SectionLabel>Live Now</SectionLabel>
            <div style={{
              background: `linear-gradient(135deg, ${P} 0%, ${PD} 100%)`,
              borderRadius: 14, padding: '18px 16px 16px', marginBottom: 24,
              boxShadow: `0 4px 16px rgba(83,74,183,0.28)`,
            }}>
              {/* Live badge + time */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', borderRadius: 20,
                  fontSize: 10, fontWeight: 700,
                  background: 'rgba(255,255,255,0.18)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.32)',
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#FF6B6B', display: 'inline-block',
                    boxShadow: '0 0 0 2px rgba(255,107,107,0.4)',
                    animation: 'livePulse 1.4s ease-in-out infinite',
                  }} />
                  LIVE
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>{LIVE_TEST.timeLabel}</span>
              </div>
              {/* Test name */}
              <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 12, lineHeight: 1.4 }}>{LIVE_TEST.name}</div>
              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.80)', fontWeight: 500 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                  {LIVE_TEST.duration}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.80)', fontWeight: 500 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  {LIVE_TEST.marks} Marks
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.80)', fontWeight: 500 }}>
                  <UsersIcon />
                  {LIVE_TEST.enrolled.toLocaleString()} joined
                </span>
              </div>
              {/* CTA */}
              <button style={{
                width: '100%', padding: '12px', borderRadius: 10,
                background: 'white', color: P, fontSize: 14, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}>
                Join Now
              </button>
            </div>

            {/* ── Upcoming Tests section ── */}
            <SectionLabel>Upcoming Tests</SectionLabel>
            {visibleUpcoming.map(t => <UpcomingCard key={t.id} test={t} />)}
            {hasMoreUpcoming && !upExpanded && (
              <button
                onClick={() => setUpExpanded(true)}
                style={{
                  width: '100%', padding: '11px', marginBottom: 24,
                  background: 'white', border: `1px solid ${BD}`, borderRadius: 12,
                  fontSize: 13, fontWeight: 600, color: P, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                View All {UPCOMING.length} Upcoming Tests <ChevronDown size={14} />
              </button>
            )}
            {upExpanded && (
              <button
                onClick={() => setUpExpanded(false)}
                style={{
                  width: '100%', padding: '11px', marginBottom: 24,
                  background: BG2, border: `1px solid ${BD}`, borderRadius: 12,
                  fontSize: 13, fontWeight: 600, color: T2, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                Show Less <ChevronUp size={14} />
              </button>
            )}
            {!hasMoreUpcoming && <div style={{ marginBottom: 24 }} />}

            {/* ── Past Tests section ── */}
            <SectionLabel>Past Tests</SectionLabel>
            {!pastExpanded ? (
              /* Collapsed summary row */
              <button
                onClick={() => setPastExpanded(true)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 12,
                  background: BG2, border: `1px solid ${BD}`,
                  cursor: 'pointer', marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><polyline points="9,12 11,14 15,10"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>
                      {totalPast} past tests
                      <span style={{ color: T3, fontWeight: 500 }}> · </span>
                      <span style={{ color: G, fontWeight: 700 }}>{attemptedPast} attempted</span>
                    </div>
                    <div style={{ fontSize: 11, color: T3, fontWeight: 400, marginTop: 1 }}>Tap to view full history</div>
                  </div>
                </div>
                <div style={{ color: T3 }}><ChevronDown size={18} /></div>
              </button>
            ) : (
              <>
                {/* Collapse control */}
                <button
                  onClick={() => setPastExpanded(false)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 16px', borderRadius: 12,
                    background: PL, border: `1px solid ${PB}`,
                    cursor: 'pointer', marginBottom: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: PD }}>
                      {totalPast} past tests
                      <span style={{ color: PB, fontWeight: 500 }}> · </span>
                      <span style={{ color: G, fontWeight: 700 }}>{attemptedPast} attempted</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: P }}>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>Hide</span>
                    <ChevronUp size={14} />
                  </div>
                </button>
                {/* Cards */}
                {pastTests.map(t => <PastCard key={t.id} test={t} />)}
              </>
            )}

          </div>
        ) : (
          /* Other category tab — placeholder */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: T3, gap: 10 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
            <div style={{ fontSize: 14, fontWeight: 600, color: T2 }}>{activeCategory}</div>
            <div style={{ fontSize: 12, color: T3, textAlign: 'center', maxWidth: 200, lineHeight: 1.5 }}>
              Tests filtered by category will appear here
            </div>
          </div>
        )}
      </div>

      <NavBar navigate={navigate} />
    </div>
  )
}
