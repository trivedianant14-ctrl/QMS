import { useState, useEffect, useCallback } from 'react'
import { QUESTIONS, SAVE_TAGS } from '../data'
import FormShell from '../components/form/FormShell'

const P='#534AB7',PL='#EEEDFE',PB='#AFA9EC',PD='#3C3489'
const T1='#1a1a2e',T2='#5a5a78',T3='#9898b0',BD='#e8e8f2',BG2='#f5f5fb'

const SKIP_REASONS = [
  { id: 'time',      label: 'Ran out of time' },
  { id: 'strategic', label: 'Strategic skip' },
  { id: 'blank',     label: 'Mind went blank' },
  { id: 'confusing', label: 'Confusing wording' },
  { id: 'exploring', label: 'Just exploring' },
  { id: 'unknown',   label: "Don't know this topic" },
]

function TimerRing({ timeLeft, timerPerQ }) {
  const r = 12, size = 34, cx = 17
  const circumference = 2 * Math.PI * r
  const progress = timerPerQ > 0 ? timeLeft / timerPerQ : 0
  const dashOffset = circumference * (1 - progress)
  const urgent = timeLeft <= 10
  const color = urgent ? '#A32D2D' : P
  const trackColor = urgent ? '#FCEBEB' : PL
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={trackColor} strokeWidth="3" />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cx}px`, transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
        />
      </svg>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 30 }}>
        {String(Math.floor(timeLeft / 60)).padStart(2,'0')}:{String(timeLeft % 60).padStart(2,'0')}
      </span>
    </div>
  )
}

export default function Solve({ navigate, mode, setMode, currentQ, setCurrentQ, answers, setAnswers, timerPerQ, setTimerPerQ, autoAdvance, setAutoAdvance, isReviewMode, savedQs, saveQuestion, submitTest, setShowReattemptConfirm, attemptCount }) {
  const [showSettings, setShowSettings] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [saveTag, setSaveTag] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timerPerQ)
  const [timedOut, setTimedOut] = useState(false)
  const [expandedSection, setExpandedSection] = useState('')
  const [showVisual, setShowVisual] = useState(false)
  const [visualScale, setVisualScale] = useState(1)
  const [touchStartDist, setTouchStartDist] = useState(0)
  const [touchStartScale, setTouchStartScale] = useState(1)
  const [glossaryTerm, setGlossaryTerm] = useState(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [showSkipSurvey, setShowSkipSurvey] = useState(false)
  const [skipReason, setSkipReason] = useState(null)
  const [skipNote, setSkipNote] = useState('')
  const [nudgeShownThisAttempt, setNudgeShownThisAttempt] = useState(false)
  const [showBlockMsg, setShowBlockMsg] = useState(false)

  const q = QUESTIONS[currentQ]
  const answered = answers[q?.id] !== undefined
  const selected = answers[q?.id]
  const isLastQ = currentQ === QUESTIONS.length - 1
  const isCorrect = answered && selected === q?.correct
  const alreadySaved = savedQs.find(s => s.qId === q?.id)

  // Timer — restarts on new question or when timer setting changes; stops once answered
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
  }, [currentQ, answered, timerPerQ, isReviewMode])

  // Auto-open skip survey (nudge) on first timeout in attempts 1–3
  useEffect(() => {
    if (!timedOut) return
    if (attemptCount <= 3 && !nudgeShownThisAttempt) {
      setNudgeShownThisAttempt(true)
      const t = setTimeout(() => setShowSkipSurvey(true), 700)
      return () => clearTimeout(t)
    }
  }, [timedOut]) // eslint-disable-line

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
    if (showFeedback) {
      if (optId === q.correct) return { ...base, background: '#EAF3DE', borderColor: '#97C459', color: '#1F4A07' }
      if (optId === selected && optId !== q.correct) return { ...base, background: '#FCEBEB', borderColor: '#F09595', color: '#791F1F' }
    }
    // Exam mode during active attempt: show selected option in neutral purple, others plain
    if (optId === selected) return { ...base, background: PL, borderColor: PB, color: PD }
    return { ...base, background: 'white', borderColor: BD, color: T3 }
  }

  const getDotColor = (idx) => {
    const qItem = QUESTIONS[idx]
    if (!answers[qItem.id]) return { bg: idx === currentQ ? PL : BG2, c: idx === currentQ ? P : T3, border: idx === currentQ ? PB : BD }
    if (answers[qItem.id] === 'timeout') return { bg: '#FFF3E0', c: '#E65100', border: '#FFB74D' }
    if (showFeedback) {
      if (answers[qItem.id] === qItem.correct) return { bg: '#EAF3DE', c: '#27500A', border: '#97C459' }
      return { bg: '#FCEBEB', c: '#791F1F', border: '#F09595' }
    }
    // Exam mode: answered = neutral purple dot, no correct/wrong reveal
    return { bg: PL, c: P, border: PB }
  }

  const handleNext = () => {
    if (!answered && !timedOut && !isReviewMode) {
      setShowBlockMsg(true)
      setTimeout(() => setShowBlockMsg(false), 2200)
      return
    }
    setCurrentQ(c => c + 1)
  }

  const handleSubmit = () => { setShowSubmitConfirm(false); submitTest() }
  const handleSave = () => {
    if (saveTag) {
      saveQuestion(q.id, saveTag)
      setSaveSuccess(true)
      setTimeout(() => { setShowSaveModal(false); setSaveTag(''); setSaveSuccess(false) }, 700)
    }
  }

  const skipped = QUESTIONS.filter(q => answers[q.id] === 'timeout').length
  const unanswered = QUESTIONS.filter(q => !answers[q.id]).length

  const showFeedback = mode === 'guide' || isReviewMode
  const showGuideContent = isReviewMode || (answered && mode === 'guide')
  const showPYQtag = q?.isPYQ && (mode === 'guide' || isReviewMode)

  // Reset per-question UI when navigating
  useEffect(() => {
    setAudioPlaying(false)
    setGlossaryTerm(null)
    setExpandedSection('')
    setShowSkipSurvey(false)
    setSkipReason(null)
    setSkipNote('')
    setShowBlockMsg(false)
  }, [currentQ])

  const dismissSkipSurvey = () => {
    setShowSkipSurvey(false)
    setSkipReason(null)
    setSkipNote('')
  }

  const renderExplanationText = (text, glossary) => {
    if (!text) return null
    if (!glossary || Object.keys(glossary).length === 0) return text
    const terms = Object.keys(glossary).sort((a, b) => b.length - a.length)
    const parts = []
    let remaining = text
    let k = 0
    while (remaining.length > 0) {
      let earliestIdx = Infinity
      let matchedTerm = null
      for (const term of terms) {
        const idx = remaining.toLowerCase().indexOf(term.toLowerCase())
        if (idx !== -1 && idx < earliestIdx) { earliestIdx = idx; matchedTerm = term }
      }
      if (!matchedTerm) { parts.push(<span key={k++}>{remaining}</span>); break }
      if (earliestIdx > 0) parts.push(<span key={k++}>{remaining.slice(0, earliestIdx)}</span>)
      const matched = remaining.slice(earliestIdx, earliestIdx + matchedTerm.length)
      parts.push(
        <span key={k++}
          onClick={(e) => { e.stopPropagation(); setGlossaryTerm({ term: matchedTerm, def: glossary[matchedTerm] }) }}
          style={{ color: P, fontWeight: 700, background: PL, borderRadius: 3, padding: '0 2px', cursor: 'pointer' }}>
          {matched}
        </span>
      )
      remaining = remaining.slice(earliestIdx + matchedTerm.length)
    }
    return <>{parts}</>
  }

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
            <div style={{ fontSize: 15, fontWeight: 800, color: T1, letterSpacing: '0.04em' }}>E5</div>
          </div>
          <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </button>
        </div>

        {/* Question dots — fills full width, no scroll */}
        <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {QUESTIONS.map((_, i) => {
              const dc = getDotColor(i)
              return (
                <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${dc.border}`, background: dc.bg, color: dc.c, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i + 1}
                </div>
              )
            })}
          </div>
          <button onClick={() => setShowGrid(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2, marginLeft: 4, flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
        </div>
      </div>

      {/* Scrollable question content */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 76px' }}>

        {/* Question header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T2 }}>Question {currentQ + 1}</span>
            {showPYQtag && (
              <span style={{ background: '#FFF3E0', color: '#E65100', border: '1px solid #FFCC80', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>PYQ · {q.pyqExam} {q.pyqYear}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {!isReviewMode && !answered && !timedOut && (
              <TimerRing timeLeft={timeLeft} timerPerQ={timerPerQ} />
            )}
            {(answered || timedOut || isReviewMode) && (
              <button style={{ background: 'none', border: `1px solid ${BD}`, borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: T3, display: 'flex', alignItems: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </button>
            )}
          </div>
        </div>

        {/* Question text */}
        <div style={{ background: BG2, borderRadius: 12, padding: '14px', marginBottom: 14, fontSize, color: T1, lineHeight: 1.6, fontWeight: 500 }}>{q?.text}</div>

        {/* Options */}
        <div style={{ marginBottom: timedOut || answered ? 12 : 0 }}>
          {q?.options.map(opt => (
            <button key={opt.id} onClick={() => handleAnswer(opt.id)} style={getOptStyle(opt.id)}>
              <span><span style={{ fontWeight: 700, marginRight: 8 }}>{opt.id.toUpperCase()}.</span>{opt.text}</span>
              {(answered || timedOut || isReviewMode) && showFeedback && <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, marginLeft: 8, flexShrink: 0 }}>{opt.pct}%</span>}
            </button>
          ))}
        </div>

        {/* Feedback banner + inline quick-save */}
        {isReviewMode && selected === 'timeout' && (
          <div style={{ marginBottom: 12, textAlign: 'center' }}>
            <button onClick={() => setShowSkipSurvey(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: T3, cursor: 'pointer', padding: '2px 0' }}>
              Why did you skip this question? →
            </button>
          </div>
        )}
        {selected === 'timeout' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ background: '#FFF3E0', border: '1px solid #FFB74D', borderRadius: 10, padding: '10px 14px', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#E65100', textAlign: 'center' }}>Oops you ran out of time.</div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setShowSkipSurvey(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: T3, cursor: 'pointer', padding: '2px 0' }}>
                Why did you skip this question? →
              </button>
            </div>
          </div>
        )}
        {answered && selected !== 'timeout' && showFeedback && (
          <div style={{ marginBottom: 16 }}>
            {/* Result line */}
            <div style={{ background: isCorrect ? '#EAF3DE' : '#FCEBEB', border: `1px solid ${isCorrect ? '#97C459' : '#F09595'}`, borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: isCorrect ? 0 : 4 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: isCorrect ? '#27500A' : '#791F1F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'white' }}>{isCorrect ? '✓' : '✗'}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? '#27500A' : '#791F1F' }}>
                  {isCorrect ? 'Correct' : 'Not quite'}
                </span>
                {!isCorrect && (
                  <span style={{ fontSize: 12, color: '#791F1F', fontWeight: 500 }}>
                    · You picked {selected?.toUpperCase()} · Correct: {q?.correct?.toUpperCase()}
                  </span>
                )}
              </div>
              {isCorrect && (
                <div style={{ fontSize: 12, color: '#3B6D11', textAlign: 'center' }}>Wonderful, you got this one right.</div>
              )}
            </div>

            {/* "Why it felt tempting" — shown only for wrong answers with a matching distractor */}
            {!isCorrect && (() => {
              const myDistractor = q?.distractors?.find(d => d.optId === selected)
              if (!myDistractor) return null
              return (
                <div style={{ background: '#FFFAF0', border: `1px solid ${BD}`, borderLeft: '3px solid #E6A817', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#B07800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Why option {selected?.toUpperCase()} felt right
                  </div>
                  <div style={{ fontSize: 12, color: T1, lineHeight: 1.6 }}>{myDistractor.reason}</div>
                </div>
              )
            })()}

            {/* Inline bookmark — one tap to save, no modal */}
            {!isReviewMode && (
              alreadySaved
                ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 12px', background: PL, borderRadius: 8, border: `1px solid ${PB}` }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={P} stroke={P} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                    <span style={{ fontSize: 12, fontWeight: 600, color: PD }}>Saved</span>
                    <span style={{ fontSize: 11, color: P, marginLeft: 2 }}>· {SAVE_TAGS.find(t => t.id === alreadySaved.tag)?.label}</span>
                    <button onClick={() => { setSaveTag(alreadySaved.tag); setShowSaveModal(true) }} style={{ marginLeft: 4, background: 'none', border: 'none', fontSize: 11, color: P, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Change</button>
                  </div>
                : <button onClick={() => { saveQuestion(q.id, isCorrect ? 'important' : 'wrong') }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '8px 12px', background: 'white', border: `1px solid ${BD}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: T2 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                    Save this question
                  </button>
            )}
          </div>
        )}

        {/* Guide mode content */}
        {showGuideContent && (
          <div>

            {/* Explanation */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Explanation</div>
                <button onClick={() => setAudioPlaying(a => !a)} title="Audio explanation" style={{ width: 26, height: 26, borderRadius: '50%', background: audioPlaying ? P : BG2, border: `1px solid ${audioPlaying ? PB : BD}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={audioPlaying ? 'white' : T2} strokeWidth="2.2" strokeLinecap="round">
                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
                    <path d="M15.54 8.46a5 5 0 010 7.07"/>
                    {audioPlaying && <path d="M19.07 4.93a10 10 0 010 14.14"/>}
                  </svg>
                </button>
              </div>
              <div style={{ fontSize: 13, color: T1, lineHeight: 1.7, padding: '14px', background: BG2, borderRadius: 12, border: `1px solid ${BD}` }}>
                {renderExplanationText(q?.explanation, q?.glossary)}
              </div>
            </div>

            {/* Why other options were wrong */}
            {q?.distractors?.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>Why Other Options Were Wrong</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {q.distractors.map(d => (
                    <div key={d.optId} style={{ display: 'flex', gap: 10, padding: '11px 12px', background: '#FDF4F4', border: '1px solid #F0BABA', borderRadius: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#F09595', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: 'white' }}>{d.optId.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#5a1f1f', lineHeight: 1.55 }}>{d.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related visual */}
            {q?.visual && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>Related Visual</div>
                <div onClick={() => setShowVisual(true)} style={{ borderRadius: 12, overflow: 'hidden', cursor: 'zoom-in', border: `1px solid ${BD}`, background: '#F8F7FF' }}>
                  <img src={q.visual} alt="Anatomy reference diagram" style={{ width: '100%', display: 'block' }} />
                </div>
                <div style={{ fontSize: 10, color: T3, marginTop: 5, textAlign: 'center' }}>Tap to zoom · Pinch to magnify</div>
              </div>
            )}

            {/* Clinical relevance — collapsed */}
            {q?.clinical && (
              <div style={{ marginBottom: 18, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
                <button onClick={() => setExpandedSection(expandedSection === 'clinical' ? '' : 'clinical')} style={{ width: '100%', padding: '13px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedSection === 'clinical' ? '#FFF8E7' : 'white', border: 'none', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: '#FFE082', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Clinical Relevance</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5">
                    {expandedSection === 'clinical' ? <path d="M18 15l-6-6-6 6"/> : <path d="M6 9l6 6 6-6"/>}
                  </svg>
                </button>
                {expandedSection === 'clinical' && (
                  <div style={{ padding: '12px 14px 14px', fontSize: 13, color: T2, lineHeight: 1.65, borderTop: '1px solid #FFE082', background: '#FFFDF0' }}>{q.clinical}</div>
                )}
              </div>
            )}

            {/* How to approach — collapsed */}
            {q?.approach && (
              <div style={{ marginBottom: 18, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
                <button onClick={() => setExpandedSection(expandedSection === 'approach' ? '' : 'approach')} style={{ width: '100%', padding: '13px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedSection === 'approach' ? BG2 : 'white', border: 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>How to Approach this Question</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5">
                    {expandedSection === 'approach' ? <path d="M18 15l-6-6-6 6"/> : <path d="M6 9l6 6 6-6"/>}
                  </svg>
                </button>
                {expandedSection === 'approach' && (
                  <div style={{ padding: '12px 14px 14px', fontSize: 13, color: T2, lineHeight: 1.65, borderTop: `1px solid ${BD}` }}>{q.approach}</div>
                )}
              </div>
            )}

            {/* Reference book */}
            {q?.referenceBook && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>Reference Book</div>
                <div style={{ display: 'flex', gap: 12, padding: '13px 14px', border: `1px solid ${BD}`, borderRadius: 12, alignItems: 'center', background: 'white' }}>
                  <div style={{ width: 38, height: 50, background: PL, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${PB}` }}>
                    <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                      <rect x="2" y="1" width="14" height="20" rx="2" fill={P} opacity="0.15"/>
                      <rect x="2" y="1" width="14" height="20" rx="2" stroke={P} strokeWidth="1.5"/>
                      <line x1="5" y1="7" x2="13" y2="7" stroke={P} strokeWidth="1.2" strokeLinecap="round"/>
                      <line x1="5" y1="11" x2="13" y2="11" stroke={P} strokeWidth="1.2" strokeLinecap="round"/>
                      <line x1="5" y1="15" x2="10" y2="15" stroke={P} strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 2 }}>{q.referenceBook.name}</div>
                    <div style={{ fontSize: 11, color: T2 }}>{q.referenceBook.edition}</div>
                    <div style={{ fontSize: 11, color: T3, marginTop: 1 }}>Page {q.referenceBook.page}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Learn video CTA — only in review mode (after "View Solutions") */}
            {isReviewMode && (
              <div style={{ background: '#FFF8E7', border: '1px solid #FFE082', borderRadius: 12, padding: '12px 14px', marginBottom: 8, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FFE082', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#E65100"><polygon points="5,3 19,12 5,21"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#5D4037' }}>Still unsure? Watch here to learn.</div>
                    <div style={{ fontSize: 11, color: '#8D6E63', marginTop: 2 }}>{q?.learnTopic} · Chapter overview · 12 min</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Report */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button onClick={() => setShowReport(true)} style={{ background: 'none', border: 'none', color: '#A32D2D', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Having trouble? Report</button>
        </div>
      </div>

      {/* Bottom navigation */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderTop: `1px solid ${BD}`, padding: '8px 16px 12px' }}>
        {showBlockMsg && (
          <div style={{ textAlign: 'center', marginBottom: 6, fontSize: 11, fontWeight: 600, color: '#A32D2D' }}>
            Select an answer to move on ↑
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          {currentQ > 0 && (
            <button onClick={() => setCurrentQ(c => c - 1)} className="btn-outline" style={{ flex: 1 }}>Previous</button>
          )}
          {isLastQ
            ? <button onClick={() => isReviewMode ? navigate('result') : setShowSubmitConfirm(true)} className="btn-primary" style={{ flex: 2 }}>{isReviewMode ? 'Done' : 'Submit'}</button>
            : <button onClick={handleNext} className="btn-primary" style={{ flex: currentQ === 0 ? 1 : 2, opacity: (!answered && !timedOut && !isReviewMode) ? 0.5 : 1 }}>Next →</button>
          }
        </div>
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
              {/* Font size */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T2, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question font size</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ label: 'A', size: 12 }, { label: 'A', size: 14 }, { label: 'A', size: 16 }, { label: 'A', size: 18 }].map(({ label, size }) => (
                    <button key={size} onClick={() => setFontSize(size)} style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: `2px solid ${fontSize === size ? P : BD}`, background: fontSize === size ? PL : 'white', cursor: 'pointer', fontWeight: 600, color: fontSize === size ? PD : T2, fontSize: size - 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, padding: '0 2px' }}>
                  {['12px', '14px', '16px', '18px'].map(s => <span key={s} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: T3 }}>{s}</span>)}
                </div>
              </div>

              {/* Save settings */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', paddingTop: 4, borderTop: `1px solid ${BD}` }}>
                <input type="checkbox" style={{ width: 16, height: 16, marginTop: 1, accentColor: P, flexShrink: 0, cursor: 'pointer' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>Save this setting for later</div>
                  <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>Use these as my default preferences next time</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Raise query overlay */}
      {showReport && (
        <div className="overlay" onClick={() => setShowReport(false)}>
          <div className="sheet query-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <FormShell
              embedded
              questionContext={{
                questionText: q?.text,
                questionNum: currentQ + 1,
                subjectName: 'Applied Anatomy',
                testName: 'QBank — Chapter Practice',
              }}
              onClose={() => setShowReport(false)}
              onDone={() => setShowReport(false)}
            />
          </div>
        </div>
      )}

      {/* Save question modal */}
      {showSaveModal && (
        <div className="overlay" onClick={() => { setShowSaveModal(false); setSaveTag(''); setSaveSuccess(false) }}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Save Question</span>
              <button onClick={() => { setShowSaveModal(false); setSaveTag(''); setSaveSuccess(false) }} style={{ background: 'none', border: 'none', fontSize: 22, color: T3, cursor: 'pointer' }}>×</button>
            </div>
            {saveSuccess ? (
              <div style={{ padding: '30px 20px 40px', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>✓</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Question saved!</div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      )}

      {/* Skip survey — half-sheet */}
      {showSkipSurvey && (
        <div className="overlay" onClick={dismissSkipSurvey}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ padding: '16px 20px 32px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 4 }}>Why did you skip this question?</div>
              <div style={{ fontSize: 12, color: T3, lineHeight: 1.5, marginBottom: 16 }}>Helps NPrep understand your patterns — takes 5 seconds</div>

              {/* Reason pills — 2 column grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {SKIP_REASONS.map(r => (
                  <button key={r.id}
                    onClick={() => setSkipReason(skipReason === r.id ? null : r.id)}
                    style={{ padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${skipReason === r.id ? P : BD}`, background: skipReason === r.id ? PL : 'white', cursor: 'pointer', textAlign: 'left', fontSize: 12, fontWeight: skipReason === r.id ? 700 : 500, color: skipReason === r.id ? PD : T1, lineHeight: 1.35 }}>
                    {r.label}
                  </button>
                ))}
              </div>

              {/* "Just exploring" note */}
              {skipReason === 'exploring' && (
                <div style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 8, padding: '9px 12px', marginBottom: 12, fontSize: 11, color: T2, lineHeight: 1.5 }}>
                  Got it — this won't be counted in your performance analysis.
                </div>
              )}

              {/* Optional free text */}
              <textarea
                value={skipNote}
                onChange={e => setSkipNote(e.target.value)}
                placeholder="Anything else? (optional)"
                style={{ width: '100%', minHeight: 58, padding: '9px 12px', border: `1px solid ${BD}`, borderRadius: 10, fontSize: 12, color: T1, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 14 }}
              />

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={dismissSkipSurvey} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${BD}`, background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: T2 }}>
                  Dismiss
                </button>
                <button onClick={dismissSkipSurvey} className="btn-primary" style={{ flex: 2 }}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question grid — half-sheet */}
      {showGrid && (() => {
        const gridCorrect = QUESTIONS.filter(q => answers[q.id] && answers[q.id] === q.correct).length
        const gridIncorrect = QUESTIONS.filter(q => answers[q.id] && answers[q.id] !== q.correct && answers[q.id] !== 'timeout').length
        const gridMissed = QUESTIONS.filter(q => answers[q.id] === 'timeout').length
        const gridAttempted = QUESTIONS.filter(q => !!answers[q.id]).length
        const gridUnattempted = QUESTIONS.length - gridAttempted
        const gridAccuracy = gridAttempted > 0 ? Math.round((gridCorrect / gridAttempted) * 100) : 0
        const gridAttemptedPct = Math.round((gridAttempted / QUESTIONS.length) * 100)
        return (
          <div className="overlay" onClick={() => setShowGrid(false)}>
            <div className="sheet" style={{ maxHeight: '64%' }} onClick={e => e.stopPropagation()}>
              <div className="sheet-handle" />

              {/* Header */}
              <div style={{ padding: '10px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: T1 }}>Anatomical Terms</div>
                <button onClick={() => { setShowGrid(false); setShowSettings(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2, display: 'flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                </button>
              </div>

              {/* Scrollable body */}
              <div className="scroll" style={{ overflowY: 'auto', padding: '14px 20px 16px' }}>

                {/* Stats card */}
                <div style={{ border: `1px solid ${BD}`, borderRadius: 14, padding: '13px 14px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 22 }}>
                        <div><span style={{ fontSize: 17, fontWeight: 800, color: '#27500A' }}>{String(gridCorrect).padStart(2,'0')}</span> <span style={{ fontSize: 11, color: T3 }}>Correct</span></div>
                        <div><span style={{ fontSize: 17, fontWeight: 800, color: '#791F1F' }}>{String(gridIncorrect).padStart(2,'0')}</span> <span style={{ fontSize: 11, color: T3 }}>Incorrect</span></div>
                      </div>
                      <div style={{ display: 'flex', gap: 22 }}>
                        <div><span style={{ fontSize: 17, fontWeight: 800, color: '#E65100' }}>{String(gridMissed).padStart(2,'0')}</span> <span style={{ fontSize: 11, color: T3 }}>Skipped</span></div>
                      </div>
                    </div>
                    <div style={{ paddingLeft: 16, borderLeft: `1px solid ${BD}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 64 }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: T1, lineHeight: 1 }}>{gridAccuracy}%</div>
                      <div style={{ fontSize: 10, color: T3, marginTop: 2 }}>accuracy</div>
                    </div>
                  </div>
                  {/* Progress bar — questions attempted */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: T3 }}>Questions attempted</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: T2 }}>{gridAttempted} / {QUESTIONS.length}</span>
                    </div>
                    <div style={{ height: 5, background: BG2, borderRadius: 3 }}>
                      <div style={{ height: 5, width: `${gridAttemptedPct}%`, background: P, borderRadius: 3, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                </div>

                {/* Summary + grid */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Summary</span>
                  <span style={{ fontSize: 11, color: T3 }}>{gridAttempted} / {QUESTIONS.length} attempted</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {QUESTIONS.map((_, i) => {
                    const dc = getDotColor(i)
                    const isCurrent = i === currentQ
                    return (
                      <button key={i} onClick={() => { setCurrentQ(i); setShowGrid(false) }} style={{ padding: '13px 0', borderRadius: 10, border: `2px solid ${isCurrent ? P : dc.border}`, background: dc.bg, color: dc.c, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: isCurrent ? `0 0 0 3px ${PL}` : 'none' }}>
                        {String(i + 1).padStart(2, '0')}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Resume only */}
              <div style={{ padding: '12px 20px 20px', borderTop: `1px solid ${BD}`, flexShrink: 0 }}>
                <button onClick={() => setShowGrid(false)} className="btn-primary" style={{ width: '100%' }}>Resume</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Submit confirm popup */}
      {showSubmitConfirm && (
        <div className="popup-overlay">
          <div className="popup">
            <div style={{ fontSize: 17, fontWeight: 700, color: T1, marginBottom: 8 }}>Submit test?</div>
            <div style={{ fontSize: 13, color: T2, marginBottom: 20, lineHeight: 1.5 }}>
              {unanswered > 0 ? `You have ${unanswered} question${unanswered > 1 ? 's' : ''} without an answer. These will be counted as skipped.` : skipped > 0 ? `${skipped} question${skipped > 1 ? 's were' : ' was'} skipped due to time running out.` : 'Are you sure you want to submit?'}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowSubmitConfirm(false)} className="btn-outline" style={{ flex: 1 }}>Review</button>
              <button onClick={handleSubmit} className="btn-primary" style={{ flex: 1 }}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Glossary term popup */}
      {glossaryTerm && (
        <div className="popup-overlay" onClick={() => setGlossaryTerm(null)}>
          <div className="popup" onClick={e => e.stopPropagation()} style={{ maxWidth: 286 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: P, flexShrink: 0, marginTop: 3 }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: P, lineHeight: 1.3 }}>{glossaryTerm.term}</span>
              </div>
              <button onClick={() => setGlossaryTerm(null)} style={{ background: 'none', border: 'none', fontSize: 20, color: T3, cursor: 'pointer', lineHeight: 1, marginLeft: 10, marginTop: -2 }}>×</button>
            </div>
            <div style={{ fontSize: 13, color: T2, lineHeight: 1.6 }}>{glossaryTerm.def}</div>
          </div>
        </div>
      )}

      {/* Visual lightbox — scroll to pan, pinch/buttons to zoom */}
      {showVisual && q?.visual && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.93)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <button onClick={() => { setShowVisual(false); setVisualScale(1) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: 22, lineHeight: 1 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setVisualScale(s => Math.max(1, parseFloat((s - 0.5).toFixed(1))))} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
              <span style={{ color: 'white', fontSize: 12, minWidth: 38, textAlign: 'center' }}>{Math.round(visualScale * 100)}%</span>
              <button onClick={() => setVisualScale(s => Math.min(5, parseFloat((s + 0.5).toFixed(1))))} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
            </div>
          </div>
          {/* Scrollable pan container */}
          <div
            style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: visualScale <= 1 ? 'center' : 'flex-start', justifyContent: visualScale <= 1 ? 'center' : 'flex-start' }}
            onWheel={(e) => { e.stopPropagation(); setVisualScale(s => Math.max(1, Math.min(5, s - e.deltaY * 0.005))) }}
          >
            <img
              src={q.visual}
              alt="Anatomy reference"
              style={{ display: 'block', width: `${100 * visualScale}%`, minWidth: `${100 * visualScale}%`, userSelect: 'none', touchAction: 'pan-x pan-y pinch-zoom' }}
              onTouchStart={(e) => {
                if (e.touches.length === 2) {
                  const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
                  setTouchStartDist(dist)
                  setTouchStartScale(visualScale)
                }
              }}
              onTouchMove={(e) => {
                if (e.touches.length === 2 && touchStartDist > 0) {
                  const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
                  setVisualScale(Math.max(1, Math.min(5, touchStartScale * (dist / touchStartDist))))
                }
              }}
            />
          </div>
          <div style={{ padding: '10px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 10, flexShrink: 0 }}>Scroll to pan · Pinch or +/− to zoom</div>
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
