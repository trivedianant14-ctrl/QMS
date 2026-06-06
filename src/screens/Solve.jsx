import { useState, useEffect, useCallback } from 'react'
import { QUESTIONS, SAVE_TAGS } from '../data'

const P='#534AB7',PL='#EEEDFE',PB='#AFA9EC',PD='#3C3489'
const T1='#1a1a2e',T2='#5a5a78',T3='#9898b0',BD='#e8e8f2',BG2='#f5f5fb'

const REPORT_OPTIONS = {
  technical: ['App is crashing or freezing', 'Question not loading properly', 'Options not selectable', 'Other technical issue'],
  content: ['Wrong answer marked as correct', 'Explanation is incorrect', 'Grammatical or spelling error', 'Question is out of syllabus'],
}

export default function Solve({ navigate, mode, setMode, currentQ, setCurrentQ, answers, setAnswers, timerPerQ, setTimerPerQ, autoAdvance, setAutoAdvance, isReviewMode, savedQs, saveQuestion, submitTest, setShowReattemptConfirm }) {
  const [showSettings, setShowSettings] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [reportType, setReportType] = useState('technical')
  const [reportSub, setReportSub] = useState('')
  const [saveTag, setSaveTag] = useState('')
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timerPerQ)
  const [timedOut, setTimedOut] = useState(false)
  const [expandedSection, setExpandedSection] = useState('explanation')

  const q = QUESTIONS[currentQ]
  const answered = answers[q?.id] !== undefined
  const selected = answers[q?.id]
  const isLastQ = currentQ === QUESTIONS.length - 1
  const isCorrect = answered && selected === q?.correct
  const alreadySaved = savedQs.find(s => s.qId === q?.id)

  // Timer
  useEffect(() => {
    if (isReviewMode || answered || !q) return
    setTimeLeft(timerPerQ)
    setTimedOut(false)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setTimedOut(true)
          setAnswers(a => ({ ...a, [q.id]: 'timeout' }))
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [currentQ, q?.id])

  const handleAnswer = (optId) => {
    if (answered || timedOut || isReviewMode) return
    setAnswers(a => ({ ...a, [q.id]: optId }))
    setTimedOut(false)
    if (autoAdvance && currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(c => c + 1), 800)
    }
  }

  const getOptStyle = (optId) => {
    const base = { width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid', textAlign: 'left', cursor: answered || timedOut || isReviewMode ? 'default' : 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, transition: 'all 0.15s' }
    if (!answered && !timedOut && !isReviewMode) return { ...base, background: 'white', borderColor: BD, color: T1 }
    if (optId === q.correct) return { ...base, background: '#EAF3DE', borderColor: '#97C459', color: '#1F4A07' }
    if (optId === selected && optId !== q.correct) return { ...base, background: '#FCEBEB', borderColor: '#F09595', color: '#791F1F' }
    return { ...base, background: 'white', borderColor: BD, color: T3 }
  }

  const getDotColor = (idx) => {
    const qItem = QUESTIONS[idx]
    if (!answers[qItem.id]) return { bg: idx === currentQ ? PL : BG2, c: idx === currentQ ? P : T3, border: idx === currentQ ? PB : BD }
    if (answers[qItem.id] === 'timeout') return { bg: '#FFF3E0', c: '#E65100', border: '#FFB74D' }
    if (answers[qItem.id] === qItem.correct) return { bg: '#EAF3DE', c: '#27500A', border: '#97C459' }
    return { bg: '#FCEBEB', c: '#791F1F', border: '#F09595' }
  }

  const handleSubmit = () => { setShowSubmitConfirm(false); submitTest() }
  const handleSave = () => { if (saveTag) { saveQuestion(q.id, saveTag); setShowSaveModal(false); setSaveTag('') } }

  const unattempted = QUESTIONS.filter(q => !answers[q.id]).length

  const showGuideContent = answered && (mode === 'guide' || isReviewMode)
  const showPYQtag = q?.isPYQ && (mode === 'guide' || isReviewMode)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, borderBottom: `1px solid ${BD}` }}>
        <div style={{ padding: '12px 16px 4px', display: 'flex', justifyContent: 'space-between', color: T2, fontSize: 13, fontWeight: 600 }}>
          <span style={{ color: T1 }}>9:41</span>
        </div>
        <div style={{ padding: '4px 16px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => isReviewMode ? navigate('result') : setShowExitConfirm(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, fontSize: 20, lineHeight: 1, display: 'flex', alignItems: 'center', fontWeight: 700 }}>✕</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T1 }}>Anatomical Terms</div>
            <div style={{ fontSize: 10, color: P, fontWeight: 600 }}>{isReviewMode ? 'Review Mode' : mode === 'guide' ? 'Guide Mode' : 'Exam Mode'}</div>
          </div>
          <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </button>
        </div>

        {/* Question dots */}
        <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 5, overflowX: 'auto', flex: 1 }}>
            {QUESTIONS.map((_, i) => {
              const dc = getDotColor(i)
              return (
                <button key={i} onClick={() => setCurrentQ(i)} style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${dc.border}`, background: dc.bg, color: dc.c, fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i + 1}
                </button>
              )
            })}
          </div>
          <button onClick={() => setShowGrid(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2, marginLeft: 4, flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
        </div>
      </div>

      {/* Scrollable question content */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px' }}>

        {/* Question header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T2 }}>Question {currentQ + 1}</span>
            {showPYQtag && (
              <span style={{ background: '#FFF3E0', color: '#E65100', border: '1px solid #FFCC80', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>PYQ · {q.pyqExam} {q.pyqYear}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!isReviewMode && (
              <div style={{ fontSize: 12, fontWeight: 700, color: timeLeft <= 10 ? '#A32D2D' : T3, background: timeLeft <= 10 ? '#FCEBEB' : BG2, padding: '3px 8px', borderRadius: 20 }}>{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</div>
            )}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
            {answered && (
              <button onClick={() => { setSaveTag(alreadySaved?.tag || ''); setShowSaveModal(true) }} style={{ background: alreadySaved ? PL : 'none', border: `1px solid ${alreadySaved ? PB : BD}`, borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: alreadySaved ? P : T3, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={alreadySaved ? P : 'none'} stroke={alreadySaved ? P : 'currentColor'} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                <span style={{ fontSize: 10, fontWeight: 600 }}>Save</span>
              </button>
            )}
          </div>
        </div>

        {/* Question text */}
        <div style={{ background: BG2, borderRadius: 12, padding: '14px', marginBottom: 14, fontSize: 14, color: T1, lineHeight: 1.6, fontWeight: 500 }}>{q?.text}</div>

        {/* Options */}
        <div style={{ marginBottom: timedOut || answered ? 12 : 0 }}>
          {q?.options.map(opt => (
            <button key={opt.id} onClick={() => handleAnswer(opt.id)} style={getOptStyle(opt.id)}>
              <span><span style={{ fontWeight: 700, marginRight: 8 }}>{opt.id.toUpperCase()}.</span>{opt.text}</span>
              {(answered || timedOut) && <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, marginLeft: 8, flexShrink: 0 }}>{opt.pct}%</span>}
            </button>
          ))}
        </div>

        {/* Feedback banner */}
        {timedOut && !answered && (
          <div style={{ background: '#FFF3E0', border: '1px solid #FFB74D', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, fontWeight: 600, color: '#E65100', textAlign: 'center' }}>⏱ Oops! You ran out of time.</div>
        )}
        {answered && selected !== 'timeout' && (
          <div style={{ background: isCorrect ? '#EAF3DE' : '#FCEBEB', border: `1px solid ${isCorrect ? '#97C459' : '#F09595'}`, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, fontWeight: 600, color: isCorrect ? '#27500A' : '#791F1F', textAlign: 'center' }}>
            {isCorrect ? '✓ Wonderful! You got this right.' : '✗ Incorrect. Check the explanation below.'}
          </div>
        )}

        {/* Guide mode content */}
        {showGuideContent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'explanation', label: 'Explanation', content: q?.explanation },
              { id: 'references', label: 'References', content: q?.references },
              { id: 'learn', label: 'Learn More', content: `Topic: ${q?.learnTopic} — Click to open related video content.` },
            ].map(sec => (
              <div key={sec.id} style={{ border: `1px solid ${BD}`, borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setExpandedSection(expandedSection === sec.id ? '' : sec.id)} style={{ width: '100%', padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedSection === sec.id ? BG2 : 'white', border: 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{sec.label}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5">{expandedSection === sec.id ? <path d="M18 15l-6-6-6 6"/> : <path d="M6 9l6 6 6-6"/>}</svg>
                </button>
                {expandedSection === sec.id && (
                  <div style={{ padding: '12px 14px', fontSize: 13, color: T2, lineHeight: 1.6, borderTop: `1px solid ${BD}` }}>{sec.content}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Report */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => setShowReport(true)} style={{ background: 'none', border: 'none', color: '#A32D2D', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Having trouble? Report</button>
        </div>
      </div>

      {/* Bottom navigation */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderTop: `1px solid ${BD}`, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <button onClick={() => currentQ > 0 && setCurrentQ(c => c - 1)} className="btn-outline" style={{ flex: 1 }} disabled={currentQ === 0}>Previous</button>
        {isLastQ
          ? <button onClick={() => !isReviewMode && setShowSubmitConfirm(true)} className="btn-primary" style={{ flex: 2 }}>{isReviewMode ? 'Done' : 'Submit'}</button>
          : <button onClick={() => setCurrentQ(c => c + 1)} className="btn-primary" style={{ flex: 2 }}>Next →</button>
        }
      </div>

      {/* ---- OVERLAYS ---- */}

      {/* Settings half-sheet */}
      {showSettings && (
        <div className="overlay" onClick={() => setShowSettings(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Session Settings</span>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: T3, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '16px 20px 30px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Mode toggle */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T2, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['guide', 'exam'].map(m => (
                    <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${mode === m ? P : BD}`, background: mode === m ? PL : 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: mode === m ? PD : T2 }}>
                      {m === 'guide' ? 'Guide Mode' : 'Exam Mode'}
                    </button>
                  ))}
                </div>
              </div>
              {/* Timer */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T2, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time per question</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[45, 60, 90, 120].map(t => (
                    <button key={t} onClick={() => setTimerPerQ(t)} style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: `2px solid ${timerPerQ === t ? P : BD}`, background: timerPerQ === t ? PL : 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: timerPerQ === t ? PD : T2 }}>
                      {t}s
                    </button>
                  ))}
                </div>
              </div>
              {/* Auto advance */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>Auto-advance</div>
                  <div style={{ fontSize: 11, color: T3 }}>Move to next question automatically after answering</div>
                </div>
                <button onClick={() => setAutoAdvance(a => !a)} style={{ width: 44, height: 24, borderRadius: 12, background: autoAdvance ? P : BD, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: autoAdvance ? 22 : 2, transition: 'left 0.2s' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report half-sheet */}
      {showReport && (
        <div className="overlay" onClick={() => { setShowReport(false); setReportSubmitted(false) }}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Report Question</span>
              <button onClick={() => { setShowReport(false); setReportSubmitted(false) }} style={{ background: 'none', border: 'none', fontSize: 22, color: T3, cursor: 'pointer' }}>×</button>
            </div>
            {reportSubmitted ? (
              <div style={{ padding: '30px 20px 40px', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>✓</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 6 }}>Report submitted</div>
                <div style={{ fontSize: 13, color: T2 }}>Thank you. Our team will review this question.</div>
                <button onClick={() => { setShowReport(false); setReportSubmitted(false) }} className="btn-primary" style={{ marginTop: 20, width: '100%' }}>Done</button>
              </div>
            ) : (
              <div style={{ padding: '16px 20px 30px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issue type</div>
                {['technical', 'content'].map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: `1px solid ${BD}`, cursor: 'pointer' }}>
                    <input type="radio" name="reportType" value={type} checked={reportType === type} onChange={() => { setReportType(type); setReportSub('') }} style={{ width: 16, height: 16, accentColor: P }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{type === 'technical' ? 'Technical error' : 'Content error'}</div>
                      <div style={{ fontSize: 11, color: T3 }}>{type === 'technical' ? 'App or display issues' : 'Wrong answer, explanation, or question text'}</div>
                    </div>
                  </label>
                ))}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T2, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Describe the issue</div>
                  {REPORT_OPTIONS[reportType].map(opt => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', cursor: 'pointer' }}>
                      <input type="radio" name="reportSub" value={opt} checked={reportSub === opt} onChange={() => setReportSub(opt)} style={{ width: 16, height: 16, accentColor: P }} />
                      <span style={{ fontSize: 13, color: T1 }}>{opt}</span>
                    </label>
                  ))}
                </div>
                <button onClick={() => reportSub && setReportSubmitted(true)} className="btn-primary" style={{ width: '100%', marginTop: 16, opacity: reportSub ? 1 : 0.5 }}>Submit Report</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save question modal */}
      {showSaveModal && (
        <div className="overlay" onClick={() => setShowSaveModal(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Save Question</span>
              <button onClick={() => setShowSaveModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: T3, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '12px 20px 30px' }}>
              <div style={{ fontSize: 12, color: T2, marginBottom: 14 }}>Why are you saving this question?</div>
              {SAVE_TAGS.map(tag => (
                <label key={tag.id} onClick={() => setSaveTag(tag.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 10, border: `2px solid ${saveTag === tag.id ? tag.border : BD}`, background: saveTag === tag.id ? tag.bg : 'white', cursor: 'pointer', marginBottom: 8 }}>
                  <input type="radio" name="savetag" checked={saveTag === tag.id} onChange={() => setSaveTag(tag.id)} style={{ width: 16, height: 16, accentColor: tag.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: saveTag === tag.id ? tag.color : T1 }}>{tag.label}</span>
                </label>
              ))}
              <button onClick={handleSave} className="btn-primary" style={{ width: '100%', marginTop: 8, opacity: saveTag ? 1 : 0.5 }}>Save Question</button>
            </div>
          </div>
        </div>
      )}

      {/* Question grid overlay */}
      {showGrid && (
        <div className="popup-overlay" onClick={() => setShowGrid(false)}>
          <div className="popup" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Question Overview</span>
              <button onClick={() => setShowGrid(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: T3, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 16 }}>
              {QUESTIONS.map((_, i) => {
                const dc = getDotColor(i)
                return <button key={i} onClick={() => { setCurrentQ(i); setShowGrid(false) }} style={{ aspectRatio: '1', borderRadius: 8, border: `1.5px solid ${dc.border}`, background: dc.bg, color: dc.c, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{i + 1}</button>
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[{ bg: '#EAF3DE', c: '#27500A', b: '#97C459', l: 'Correct' }, { bg: '#FCEBEB', c: '#791F1F', b: '#F09595', l: 'Wrong' }, { bg: '#FFF3E0', c: '#E65100', b: '#FFB74D', l: 'Timed out' }, { bg: BG2, c: T3, b: BD, l: 'Not attempted' }].map(item => (
                <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: item.bg, border: `1px solid ${item.b}` }} />
                  <span style={{ fontSize: 11, color: T2 }}>{item.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit confirm popup */}
      {showSubmitConfirm && (
        <div className="popup-overlay">
          <div className="popup">
            <div style={{ fontSize: 17, fontWeight: 700, color: T1, marginBottom: 8 }}>Submit test?</div>
            <div style={{ fontSize: 13, color: T2, marginBottom: 20, lineHeight: 1.5 }}>
              {unattempted > 0 ? `You have ${unattempted} unattempted question${unattempted > 1 ? 's' : ''}. Unattempted questions will be marked as incorrect.` : 'Are you sure you want to submit?'}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowSubmitConfirm(false)} className="btn-outline" style={{ flex: 1 }}>Review</button>
              <button onClick={handleSubmit} className="btn-primary" style={{ flex: 1 }}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Exit confirm */}
      {showExitConfirm && (
        <div className="popup-overlay">
          <div className="popup">
            <div style={{ fontSize: 17, fontWeight: 700, color: T1, marginBottom: 8 }}>Exit attempt?</div>
            <div style={{ fontSize: 13, color: T2, marginBottom: 20, lineHeight: 1.5 }}>Your progress will be saved. You can continue from where you left off.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowExitConfirm(false)} className="btn-outline" style={{ flex: 1 }}>Continue</button>
              <button onClick={() => { setShowExitConfirm(false); navigate('subject') }} className="btn-primary" style={{ flex: 1 }}>Exit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
