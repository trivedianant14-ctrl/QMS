import { useState } from 'react'
import { VIDEO_SUBJECTS } from '../data'

const P='#534AB7', PL='#EEEDFE', PB='#AFA9EC', PD='#3C3489'
const T1='#1a1a2e', T2='#5a5a78', T3='#9898b0', BD='#e8e8f2', BG2='#f5f5fb'

const YEAR_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 1, label: '1st Year' },
  { id: 2, label: '2nd Year' },
  { id: 3, label: '3rd Year' },
  { id: 4, label: '4th Year' },
]

const NavBar = ({ navigate }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
    { id: 'qbank', label: 'QBank', icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> },
    { id: 'videos', label: 'Videos', active: true, icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
    { id: 'tests', label: 'Tests', icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg> },
    { id: 'buy', label: 'Buy', icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg> },
  ]
  return (
    <div style={{ background: 'white', borderTop: `1px solid ${BD}`, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => { if (t.id === 'home') navigate('home'); else if (t.id === 'qbank') navigate('home'); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 10px', background: 'none', border: 'none', color: t.active ? P : T3, cursor: 'pointer' }}>
          {t.icon}
          <span style={{ fontSize: 10, fontWeight: t.active ? 600 : 400 }}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

export default function Videos({ navigate, isNewUser, toggleUserMode }) {
  const [yearFilter, setYearFilter] = useState('all')

  const subjects = isNewUser
    ? VIDEO_SUBJECTS.map(s => ({ ...s, watched: 0 }))
    : VIDEO_SUBJECTS

  const filtered = yearFilter === 'all'
    ? subjects
    : subjects.filter(s => s.year === yearFilter)

  const countFor = (y) => y === 'all' ? VIDEO_SUBJECTS.length : VIDEO_SUBJECTS.filter(s => s.year === y).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Status bar */}
      <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>9:41</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: T2 }}>
          <svg width="16" height="11" viewBox="0 0 30 20" fill="currentColor"><rect x="0" y="8" width="4" height="12" rx="1" opacity="0.4"/><rect x="7" y="5" width="4" height="15" rx="1" opacity="0.6"/><rect x="14" y="2" width="4" height="18" rx="1" opacity="0.8"/><rect x="21" y="0" width="4" height="20" rx="1"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
        </div>
      </div>

      {/* Prototype toggle strip */}
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '6px 16px', background: BG2, borderBottom: `1px solid ${BD}` }}>
        <div style={{ display: 'inline-flex', background: 'white', border: `1px solid ${BD}`, borderRadius: 20, padding: 3, gap: 2 }}>
          <button onClick={() => !isNewUser && toggleUserMode()} style={{ padding: '4px 16px', borderRadius: 16, fontSize: 11, fontWeight: 600, background: isNewUser ? P : 'transparent', color: isNewUser ? 'white' : T3, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>New User</button>
          <button onClick={() => isNewUser && toggleUserMode()} style={{ padding: '4px 16px', borderRadius: 16, fontSize: 11, fontWeight: 600, background: !isNewUser ? P : 'transparent', color: !isNewUser ? 'white' : T3, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>Returning User</button>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: '4px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: T1 }}>Video Lectures</span>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', color: T2 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2, display: 'flex' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2, display: 'flex' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>

      {/* New user — start here card */}
      {isNewUser && (
        <div style={{ flexShrink: 0, padding: '12px 16px', borderBottom: `1px solid ${BD}` }}>
          <div onClick={() => navigate('videosubject')} style={{ borderRadius: 16, overflow: 'hidden', cursor: 'pointer', border: `1px solid ${BD}` }}>
            {/* Top gradient band */}
            <div style={{ background: `linear-gradient(135deg, ${PD} 0%, ${P} 60%, #8B82E0 100%)`, padding: '16px 16px 14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}><polygon points="5,3 19,12 5,21"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Recommended for you</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'white', lineHeight: 1.3 }}>Start your first lecture</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>Fundamentals of Nursing · 6 lectures</div>
              </div>
            </div>
            {/* Bottom info row */}
            <div style={{ background: BG2, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P }}>P</span>
                </div>
                <span style={{ fontSize: 12, color: T2, fontWeight: 500 }}>Priya Sharma</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: P, borderRadius: 20, padding: '5px 12px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>Begin</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Watching — hidden for new users */}
      {!isNewUser && <div style={{ flexShrink: 0, background: 'white', borderBottom: `1px solid ${BD}`, padding: '10px 16px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T2, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Continue Watching</div>
        <div onClick={() => navigate('videosubject')} style={{ height: 160, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
          {/* Thumbnail */}
          <div style={{ flex: 1, background: '#1a1a2e', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}><polygon points="5,3 19,12 5,21"/></svg>
            </div>
            <div style={{ position: 'absolute', bottom: 8, right: 10, background: 'rgba(0,0,0,0.55)', borderRadius: 4, padding: '2px 6px', fontSize: 10, color: 'white', fontWeight: 600 }}>12:34</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.15)' }}>
              <div style={{ height: 3, width: '50%', background: P }} />
            </div>
          </div>
          {/* Info bar */}
          <div style={{ padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: BG2, gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Body Planes & Directional Terms</div>
              <div style={{ fontSize: 11, color: T3, marginTop: 1 }}>Aman Singhal · Applied Anatomy Ch 1</div>
            </div>
            <button className="btn-primary" style={{ padding: '6px 14px', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>Resume</button>
          </div>
        </div>
      </div>}

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 70 }}>

        {/* Rapid Revision banner */}
        <div style={{ margin: '12px 16px 0', background: '#FFF8E7', border: '1px solid #FFE082', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FFE082', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2.2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#5D4037' }}>Rapid Revision 2.0</div>
            <div style={{ fontSize: 11, color: '#8D6E63' }}>Nursing under 100 hours</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </div>

        {/* Subjects section */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subjects</div>

          {/* Year filter chips */}
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 10, marginBottom: 2 }}>
            {YEAR_FILTERS.map(f => {
              const count = countFor(f.id)
              const active = yearFilter === f.id
              return (
                <button key={f.id} onClick={() => setYearFilter(f.id)} style={{ padding: '5px 13px', borderRadius: 20, border: `1.5px solid ${active ? P : BD}`, background: active ? PL : 'white', color: active ? PD : T2, fontSize: 12, fontWeight: active ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {f.label} <span style={{ opacity: 0.65 }}>({count})</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Subject list */}
        <div style={{ padding: '4px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => {
            const pct = s.totalLectures > 0 ? Math.round((s.watched / s.totalLectures) * 100) : 0
            return (
              <button key={s.id} onClick={() => navigate('videosubject')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'white', border: `1px solid ${BD}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: P }}>{s.name[0]}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: T3, marginBottom: 5 }}>{s.tutor} · {s.watched}/{s.totalLectures} watched</div>
                  <div style={{ height: 3, background: BG2, borderRadius: 2 }}>
                    <div style={{ height: 3, width: `${pct}%`, background: pct === 100 ? '#3B6D11' : P, borderRadius: 2 }} />
                  </div>
                </div>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            )
          })}
        </div>

      </div>

      {/* Bottom nav */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <NavBar navigate={navigate} />
      </div>

    </div>
  )
}
