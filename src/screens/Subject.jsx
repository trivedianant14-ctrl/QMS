import { useState } from 'react'
import { CHAPTERS } from '../data'

const P='#534AB7',PL='#EEEDFE',PB='#AFA9EC',PD='#3C3489'
const T1='#1a1a2e',T2='#5a5a78',T3='#9898b0',BD='#e8e8f2',BG2='#f5f5fb'

const NavBar = ({ navigate }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
    { id: 'qbank', label: 'QBank', active: true, icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> },
    { id: 'videos', label: 'Videos', icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
    { id: 'tests', label: 'Tests', icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg> },
    { id: 'buy', label: 'Buy', icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg> },
  ]
  return (
    <div style={{ flexShrink: 0, background: 'white', borderTop: `1px solid ${BD}`, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => { if (t.id === 'home') navigate('home'); else if (t.id === 'qbank') navigate('home'); else if (t.id === 'videos') navigate('videos'); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 10px', background: 'none', border: 'none', color: t.active ? P : T3, cursor: 'pointer' }}>
          {t.icon}
          <span style={{ fontSize: 10, fontWeight: t.active ? 600 : 400 }}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

const IDX_CHAPTERS = ['Anatomical Terms', 'Skeletal System', 'Muscular System', 'Nervous System', 'Cardiovascular System', 'Respiratory System', 'Integumentary System', 'Endocrine System']

export default function Subject({ navigate, isNewUser, sessions, viewSolution, viewAnalysis }) {
  const [filter, setFilter] = useState('all')
  const [showIdx, setShowIdx] = useState(false)
  const [showStudyPlan, setShowStudyPlan] = useState(false)

  // Real session data for chapter 1
  const ch1Sessions = (sessions || []).filter(s => s.chapterId === 1)
  const latestCh1 = ch1Sessions.length > 0 ? ch1Sessions[ch1Sessions.length - 1] : null

  const displayChapters = CHAPTERS.map(c => {
    // Chapter 1 gets dynamic state from real sessions
    if (c.id === 1 && latestCh1) {
      return {
        ...c,
        state: 'completed',
        res: { correct: latestCh1.correct, total: latestCh1.total, pct: latestCh1.accuracy },
      }
    }
    // Other chapters: new user sees all unattempted, returning user sees hardcoded data
    if (isNewUser) return { ...c, state: 'unattempted', prog: undefined, res: undefined }
    return c
  })

  const doneChapters = displayChapters.filter(c => c.state === 'completed').length
  const totalChapters = displayChapters.length
  const pctDone = totalChapters > 0 ? Math.round((doneChapters / totalChapters) * 100) : 0

  const visible = displayChapters.filter(c => {
    if (filter === 'all') return true
    if (filter === 'free') return c.id <= 2
    if (filter === 'completed') return c.state === 'completed'
    if (filter === 'unattempted') return c.state === 'unattempted'
    if (filter === 'paused') return c.state === 'paused'
    return true
  })

  const renderCard = (c) => {
    if (c.state === 'completed') return (
      <div key={c.id} style={{ border: `1px solid #97C459`, borderRadius: 14, padding: 13, marginBottom: 10, background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2" strokeLinecap="round" opacity={0.5}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{c.name}</span>
          </div>
          <span style={{ background: '#EAF3DE', color: '#27500A', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>✓ Done</span>
        </div>
        <div style={{ fontSize: 11, color: T2, marginBottom: 9 }}>{c.res.correct}/{c.res.total} correct · {c.res.pct}% accuracy</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <button className="btn-sm-outline" onClick={viewSolution}>Solutions</button>
          <button className="btn-sm-primary" onClick={viewAnalysis}>View Analysis →</button>
        </div>
      </div>
    )

    if (c.state === 'paused') return (
      <div key={c.id} style={{ border: `1px solid #FAC775`, borderRadius: 14, padding: 13, marginBottom: 10, background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2" strokeLinecap="round" opacity={0.5}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{c.name}</span>
          </div>
          <span style={{ background: '#FAEEDA', color: '#633806', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>Paused</span>
        </div>
        <div style={{ fontSize: 11, color: T2, marginBottom: 9 }}>{c.prog.total} Ques</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <button className="btn-sm-purple-outline" onClick={() => navigate('videosubject')}>Learn</button>
          <button className="btn-sm-primary" onClick={() => navigate('pretest')}>Resume →</button>
        </div>
      </div>
    )

    return (
      <div key={c.id} style={{ border: `1px solid ${BD}`, borderRadius: 14, padding: 13, marginBottom: 10, background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2" strokeLinecap="round" opacity={0.5}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{c.name}</span>
        </div>
        <div style={{ fontSize: 11, color: T3, marginBottom: 9 }}>{c.qs} Ques</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          {c.vid && <button className="btn-sm-purple-outline" onClick={() => navigate('videosubject')}>Learn</button>}
          <button className="btn-sm-primary" onClick={() => navigate('pretest')}>Attempt</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>9:41</span>
        <div style={{ display: 'flex', gap: 6, color: T2 }}>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
        </div>
      </div>

      <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', padding: 2 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Applied Anatomy </span>
          <span style={{ fontSize: 11, color: T3 }}>(E5)</span>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <button onClick={() => setShowIdx(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
      </div>

      <button onClick={() => setShowStudyPlan(true)} style={{ padding: '9px 16px 10px', background: PL, borderBottom: `1px solid ${PB}`, flexShrink: 0, border: 'none', borderBottom: `1px solid ${PB}`, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={PD} strokeWidth="2.2" strokeLinecap="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: PD }}>Toppers complete this in 10 days</span>
          </div>
          <span style={{ fontSize: 10, color: P, fontWeight: 500 }}>{doneChapters}/{totalChapters} chapters</span>
        </div>
        <div style={{ height: 4, background: PB, borderRadius: 3, marginBottom: 6 }}>
          <div style={{ height: 4, width: `${pctDone}%`, background: P, borderRadius: 3 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: P, fontWeight: 600 }}>View your study plan to finish in 10 days</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </button>

      <div style={{ padding: '8px 16px', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {['all', 'free', 'completed', 'unattempted', 'paused'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 13px', borderRadius: 20, fontSize: 11, border: `1px solid ${filter === f ? PB : BD}`, background: filter === f ? PL : 'transparent', color: filter === f ? PD : T3, fontWeight: filter === f ? 600 : 400, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}>
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', paddingBottom: 80 }}>
        {visible.length > 0
          ? visible.map(c => renderCard(c))
          : <div style={{ textAlign: 'center', padding: '40px 0', color: T3, fontSize: 13 }}>No chapters match this filter</div>}
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <NavBar navigate={navigate} />
      </div>

      {showStudyPlan && (
        <div className="overlay" onClick={() => setShowStudyPlan(false)}>
          <div className="sheet" style={{ maxHeight: '82%' }} onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Your 10-Day Study Plan</div>
                <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>Applied Anatomy · {doneChapters}/{totalChapters} chapters done</div>
              </div>
              <button onClick={() => setShowStudyPlan(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: T3, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {/* Progress summary */}
            <div style={{ padding: '0 20px 12px' }}>
              <div style={{ background: PL, border: `1px solid ${PB}`, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: PD, fontWeight: 600, marginBottom: 4 }}>Overall Progress</div>
                  <div style={{ height: 5, background: 'white', borderRadius: 3 }}>
                    <div style={{ height: 5, width: `${pctDone}%`, background: P, borderRadius: 3, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: PD }}>{pctDone}%</div>
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 20px' }}>
              {[
                { days: 'Day 1–2', chapter: 'Anatomical Terms', qs: 20, tip: 'Start here — foundation for everything.' },
                { days: 'Day 3–4', chapter: 'Skeletal System', qs: 30, tip: 'High-yield PYQ zone.' },
                { days: 'Day 5', chapter: 'Muscular System', qs: 25, tip: 'Focus on muscle actions.' },
                { days: 'Day 6–7', chapter: 'Nervous System', qs: 40, tip: 'Heaviest chapter — take your time.' },
                { days: 'Day 8', chapter: 'Cardiovascular System', qs: 28, tip: 'Clinical correlations matter.' },
                { days: 'Day 9', chapter: 'Respiratory System', qs: 22, tip: 'Quick but important.' },
                { days: 'Day 10', chapter: 'Revision + Mock Test', qs: null, tip: 'Review weak areas & attempt all chapters.' },
              ].map((row, i) => {
                const chData = displayChapters.find(c => c.name === row.chapter)
                const done = chData?.state === 'completed'
                const isToday = !done && displayChapters.filter(c => c.state === 'completed').length === i
                return (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    {/* Timeline dot */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#EAF3DE' : isToday ? P : 'white', border: `2px solid ${done ? '#97C459' : isToday ? P : BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {done
                          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          : isToday
                            ? <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                            : <span style={{ fontSize: 9, fontWeight: 700, color: T3 }}>{i + 1}</span>}
                      </div>
                      {i < 6 && <div style={{ width: 2, flex: 1, background: done ? '#97C459' : BD, minHeight: 10, marginTop: 2 }} />}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, paddingBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: isToday ? P : T3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.days}</span>
                        {done && <span style={{ fontSize: 10, background: '#EAF3DE', color: '#27500A', borderRadius: 10, padding: '1px 8px', fontWeight: 600 }}>Done ✓</span>}
                        {isToday && <span style={{ fontSize: 10, background: PL, color: P, borderRadius: 10, padding: '1px 8px', fontWeight: 600 }}>Up next</span>}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 2 }}>{row.chapter}</div>
                      <div style={{ fontSize: 11, color: T3, marginBottom: 4 }}>
                        {row.qs ? `${row.qs} questions` : 'Revision session'}{isToday ? '' : ''}
                      </div>
                      <div style={{ fontSize: 11, color: T2, fontStyle: 'italic' }}>{row.tip}</div>
                      {isToday && (
                        <button onClick={() => { setShowStudyPlan(false); }} className="btn-primary" style={{ marginTop: 8, padding: '7px 16px', fontSize: 11 }}>
                          Start now →
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {showIdx && (
        <div className="overlay" onClick={() => setShowIdx(false)}>
          <div className="sheet" style={{ maxHeight: '75%' }} onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Chapter index</span>
              <button onClick={() => setShowIdx(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: T3, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {IDX_CHAPTERS.map((ch, i) => {
                const f = displayChapters.find(c => c.name === ch)
                const badge = f ? (f.state === 'completed' ? <span style={{ background: '#EAF3DE', color: '#27500A', fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>Done</span> : f.state === 'paused' ? <span style={{ background: '#FAEEDA', color: '#633806', fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>Paused</span> : null) : null
                return (
                  <div key={i} style={{ padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${BD}`, cursor: 'pointer' }}>
                    <span style={{ fontSize: 12, color: T3, minWidth: 20, fontWeight: 500 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: T1, flex: 1 }}>{ch}</span>
                    {badge}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
