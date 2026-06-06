import { useState } from 'react'
import { SUBJECTS } from '../data'

const P = '#534AB7', PL = '#EEEDFE', PB = '#AFA9EC', PD = '#3C3489'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'

const NavBar = ({ navigate }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
    { id: 'qbank', label: 'QBank', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>, active: true },
    { id: 'videos', label: 'Videos', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
    { id: 'tests', label: 'Tests', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg> },
    { id: 'buy', label: 'Buy', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg> },
  ]
  return (
    <div style={{ flexShrink: 0, background: 'white', borderTop: `1px solid ${BD}`, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => t.id === 'qbank' && navigate('home')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 10px', background: 'none', border: 'none', color: t.active ? P : T3, cursor: 'pointer' }}>
          {t.icon}
          <span style={{ fontSize: 10, fontWeight: t.active ? 600 : 400 }}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

export default function Home({ navigate, savedQs, bannerDismissed, setBannerDismissed, unsaveQuestion, isNewUser, toggleUserMode }) {
  const todayQs = isNewUser ? 0 : 12
  const overallAcc = isNewUser ? 0 : 71
  const isFirstTime = isNewUser
  const [continueDismissed, setContinueDismissed] = useState(false)
  const [showSubjectIdx, setShowSubjectIdx] = useState(false)

  const displaySubjects = isNewUser
    ? SUBJECTS.map(s => ({ ...s, done: 0, accuracy: 0 }))
    : SUBJECTS

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
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '6px 16px', background: '#F5F5FB', borderBottom: `1px solid ${BD}` }}>
        <div style={{ display: 'inline-flex', background: 'white', border: `1px solid ${BD}`, borderRadius: 20, padding: 3, gap: 2 }}>
          <button onClick={() => !isNewUser && toggleUserMode()} style={{ padding: '4px 16px', borderRadius: 16, fontSize: 11, fontWeight: 600, background: isNewUser ? P : 'transparent', color: isNewUser ? 'white' : T3, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>New User</button>
          <button onClick={() => isNewUser && toggleUserMode()} style={{ padding: '4px 16px', borderRadius: 16, fontSize: 11, fontWeight: 600, background: !isNewUser ? P : 'transparent', color: !isNewUser ? 'white' : T3, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>Returning User</button>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: '6px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: `1px solid ${BD}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${P}, #8B82E0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>A</div>
          <span style={{ fontSize: 17, fontWeight: 700, color: T1 }}>Question Bank</span>
        </div>
        <button style={{ background: 'none', border: 'none', color: T2, display: 'flex' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
      </div>

      {/* Stats strip — first-time vs returning */}
      <div style={{ flexShrink: 0, padding: '10px 16px', borderBottom: `1px solid ${BD}`, background: 'white' }}>
        {isFirstTime ? (
          /* First-time: direction CTA */
          <div style={{ background: 'white', border: `1px solid ${BD}`, borderRadius: 14, padding: '16px 14px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T1, marginBottom: 5 }}>Start your first practice session</div>
            <div style={{ fontSize: 12, color: T3, lineHeight: 1.5, marginBottom: 14 }}>Your accuracy and daily progress will appear here once you begin</div>
            <button onClick={() => navigate('pretest')} className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>Attempt →</button>
          </div>
        ) : (
          /* Returning: progress stats */
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: `1px solid ${BD}`, borderRadius: 14, padding: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: T3, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Daily Progress</div>
              <span style={{ fontSize: 26, fontWeight: 700, color: T1 }}>{todayQs}</span>
              <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>Question Attempted</div>
            </div>
            <div style={{ marginLeft: 14, textAlign: 'center', background: BG2, borderRadius: 10, padding: '8px 14px' }}>
              <div style={{ fontSize: 11, color: T3, marginBottom: 2 }}>Overall Accuracy</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: overallAcc >= 70 ? '#3B6D11' : overallAcc >= 50 ? P : '#A32D2D' }}>{overallAcc}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 88 }}>

        {/* AIR Banner */}
        {!bannerDismissed && (
          <div style={{ margin: '14px 16px 0', background: `linear-gradient(135deg, #3730A3 0%, #534AB7 50%, #7C73E6 100%)`, borderRadius: 16, padding: '16px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', bottom: -30, left: 40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <button onClick={() => setBannerDismissed(true)} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 24, height: 24, color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>★ AIR 15</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: 600, lineHeight: 1.5, marginBottom: 12 }}>How Qbank helped AIR 15 in their journey</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 20, padding: '5px 12px', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Read More →</button>
            </div>
          </div>
        )}

        {/* Saved questions — first-time: educational info box; returning: CTA link */}
        <div style={{ margin: '10px 16px 0' }}>
          {isFirstTime ? (
            /* Guided info box — looks like a tip, still clickable to saved screen */
            <div onClick={() => navigate('saved')} style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T1, marginBottom: 3 }}>
                    Use <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round" style={{ display: 'inline', verticalAlign: 'middle', marginBottom: 1 }}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> to view your Saved Questions
                  </div>
                  <div style={{ fontSize: 11, color: T3, lineHeight: 1.5 }}>You can log questions as tricky, wrong, important or weak areas — for analysis.</div>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => navigate('saved')} style={{ width: '100%', background: PL, border: `1px solid ${PB}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: PD, flex: 1 }}>Click Here to view your saved questions</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
        </div>

        {/* Subjects */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T1 }}>Subjects</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: P, background: PL, padding: '2px 8px', borderRadius: 20 }}>E5</span>
            <button onClick={() => setShowSubjectIdx(true)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: T2, display: 'flex', alignItems: 'center', padding: 2 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {displaySubjects.map(s => {
              const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0
              const barColor = s.accuracy >= 70 ? '#3B6D11' : s.accuracy >= 50 ? P : s.done === 0 ? BD : '#A32D2D'
              return (
                <button key={s.id} onClick={() => navigate('subject')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', background: 'white', border: `1px solid ${BD}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T1, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                    <div style={{ height: 4, background: BG2, borderRadius: 2, marginBottom: 3 }}>
                      <div style={{ height: 4, width: `${pct}%`, background: barColor, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 10, color: T3 }}>{s.done}/{s.total} Qs{s.done > 0 ? ` · ${s.accuracy}% accuracy` : ' · not started'}</div>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              )
            })}
          </div>
        </div>

      </div>

      {/* Subjects index sheet */}
      {showSubjectIdx && (
        <div className="overlay" onClick={() => setShowSubjectIdx(false)}>
          <div className="sheet" style={{ maxHeight: '80%' }} onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Subject Index</span>
              <button onClick={() => setShowSubjectIdx(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: T3, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {displaySubjects.map((s, i) => {
                const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0
                return (
                  <button key={s.id} onClick={() => { setShowSubjectIdx(false); navigate('subject') }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: `1px solid ${BD}`, background: 'none', border: 'none', borderBottom: `1px solid ${BD}`, cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T3, minWidth: 22 }}>{String(i + 1).padStart(2, '0')}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: T3 }}>{s.done > 0 ? `${s.done}/${s.total} Qs · ${s.accuracy}% accuracy` : `${s.total} Qs · not started`}</div>
                    </div>
                    {s.done > 0 && (
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: P }}>{pct}%</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sticky continue + nav — continue hidden for first-time users */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white' }}>
        {!isFirstTime && !continueDismissed && (
          <div style={{ padding: '8px 16px 6px', borderTop: `1px solid ${BD}` }}>
            <div style={{ display: 'flex', alignItems: 'center', background: PL, border: `1px solid ${PB}`, borderRadius: 10, overflow: 'hidden' }}>
              <button onClick={() => navigate('pretest')} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', minWidth: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={P} style={{ flexShrink: 0 }}><polygon points="5,3 19,12 5,21"/></svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: P, marginBottom: 1 }}>Continue where you left off</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: PD, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Applied Anatomy · Anatomical Terms</div>
                </div>
                <span style={{ background: P, borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', flexShrink: 0 }}>Resume →</span>
              </button>
              <button onClick={() => setContinueDismissed(true)} style={{ padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', color: PB, fontSize: 18, display: 'flex', alignItems: 'center', flexShrink: 0, alignSelf: 'stretch' }}>×</button>
            </div>
          </div>
        )}
        <NavBar navigate={navigate} />
      </div>
    </div>
  )
}
