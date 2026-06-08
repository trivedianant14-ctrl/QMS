import { useState } from 'react'
import { QUESTIONS, TOPICS } from '../data'

const P='#534AB7',PL='#EEEDFE',PD='#3C3489'
const T1='#1a1a2e',T2='#5a5a78',T3='#9898b0',BD='#e8e8f2',BG2='#f5f5fb'
const GREEN='#3B6D11',RED='#A32D2D'

const RATING_LABELS = ['', 'Poor', 'Okay', 'Good', 'Great', 'Excellent']


export default function Result({ navigate, answers, mode, viewSolution, setShowReattemptConfirm, showReattemptConfirm, handleReattempt }) {
  const [showAllWrong, setShowAllWrong] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedbackNote, setFeedbackNote] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const correct = QUESTIONS.filter(q => answers[q.id] === q.correct).length
  const incorrect = QUESTIONS.filter(q => answers[q.id] && answers[q.id] !== q.correct && answers[q.id] !== 'timeout').length
  const timedOut = QUESTIONS.filter(q => answers[q.id] === 'timeout').length
  const unattempted = QUESTIONS.filter(q => !answers[q.id]).length + timedOut
  const total = QUESTIONS.length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  const wrongQs = QUESTIONS.filter(q => {
    const a = answers[q.id]
    return !a || a === 'timeout' || (a && a !== q.correct)
  })

  const missedPYQs = wrongQs.filter(q => q.isPYQ)

  const topicData = TOPICS.map(t => {
    const topicQs = QUESTIONS.filter(q => q.topicId === t.id)
    if (topicQs.length === 0) return null
    const topicCorrect = topicQs.filter(q => answers[q.id] === q.correct).length
    const topicWrong = topicQs.filter(q => answers[q.id] && answers[q.id] !== q.correct && answers[q.id] !== 'timeout').length
    const topicSkipped = topicQs.filter(q => !answers[q.id] || answers[q.id] === 'timeout').length
    const topicAttempted = topicQs.filter(q => answers[q.id] && answers[q.id] !== 'timeout').length
    const topicAcc = topicAttempted > 0 ? Math.round((topicCorrect / topicAttempted) * 100) : 0
    const pyqCount = topicQs.filter(q => q.isPYQ).length
    return { ...t, correct: topicCorrect, wrong: topicWrong, skipped: topicSkipped, attempted: topicAttempted, total: topicQs.length, acc: topicAcc, pyqCount }
  }).filter(Boolean)

  const weakTopics = topicData
    .filter(t => t.wrong > 0 || t.skipped > 0)
    .sort((a, b) => (b.wrong - a.wrong) || (b.skipped - a.skipped))

  const motivationalMsg = accuracy >= 80
    ? "Excellent work — you're well-prepared on this chapter!"
    : accuracy >= 60
    ? "Good effort! A few more practice sessions and you'll nail it."
    : accuracy >= 40
    ? "You're building up. Focus on the weak topics below and retry."
    : "Don't worry — use the explanations to build your foundation step by step."

  const avgTime = 48
  const totalTime = `${Math.floor((avgTime * total) / 60)}m ${(avgTime * total) % 60}s`

  const visibleWrongQs = showAllWrong ? wrongQs : wrongQs.slice(0, 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', color: T2, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
        <span style={{ color: T1 }}>9:41</span>
      </div>
      <div style={{ padding: '6px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <button onClick={() => navigate('subject')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Performance</span>
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px' }}>

        {/* Score header */}
        <div style={{ background: 'white', border: `1px solid ${BD}`, borderLeft: `4px solid ${accuracy >= 70 ? GREEN : accuracy >= 50 ? P : RED}`, borderRadius: 14, padding: '16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 64 }}>
              <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1, color: accuracy >= 70 ? GREEN : accuracy >= 50 ? P : RED }}>{accuracy}%</div>
              <div style={{ fontSize: 10, color: T3, marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>accuracy</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T1, lineHeight: 1.5, marginBottom: 8 }}>{motivationalMsg}</div>
              <div style={{ fontSize: 12, color: T2, marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: GREEN }}>{correct}</span> correct &nbsp;·&nbsp;
                <span style={{ fontWeight: 700, color: RED }}>{incorrect}</span> wrong &nbsp;·&nbsp;
                <span style={{ fontWeight: 700, color: T3 }}>{unattempted}</span> skipped
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: `1px solid ${BD}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                  <span style={{ fontSize: 11, color: T3 }}>{avgTime}s avg / question</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span style={{ fontSize: 11, color: T3 }}>Total: {totalTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PYQ missed alert */}
        {missedPYQs.length > 0 && (
          <div style={{ background: 'white', border: `1px solid ${BD}`, borderLeft: '3px solid #E6A817', borderRadius: 14, padding: '13px 14px', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 4 }}>
              {missedPYQs.length} Previous Year Question{missedPYQs.length > 1 ? 's' : ''} Missed
            </div>
            <div style={{ fontSize: 12, color: T3, lineHeight: 1.5, marginBottom: 10 }}>
              These appeared in real exams — prioritise reviewing them.
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {missedPYQs.map(q => (
                <button key={q.id} onClick={viewSolution} style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: T2, cursor: 'pointer' }}>
                  Q{QUESTIONS.indexOf(q) + 1} · {q.pyqExam} {q.pyqYear}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Study focus — weak topics */}
        {weakTopics.length > 0 && (
          <div style={{ border: `1px solid ${BD}`, borderRadius: 14, padding: '13px 14px', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 3 }}>Study Focus</div>
            <div style={{ fontSize: 12, color: T3, marginBottom: 10 }}>Topics where you need more practice</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {weakTopics.map(t => (
                <div key={t.id} style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T1 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>
                        {t.wrong > 0 && `${t.wrong} wrong`}
                        {t.wrong > 0 && t.skipped > 0 && ' · '}
                        {t.skipped > 0 && `${t.skipped} skipped`}
                        {t.pyqCount > 0 && ` · ${t.pyqCount} PYQ`}
                      </div>
                    </div>
                    <button onClick={viewSolution} style={{ background: 'white', border: `1.5px solid ${P}`, borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: P, cursor: 'pointer', flexShrink: 0, marginLeft: 10 }}>
                      Review
                    </button>
                  </div>
                  <div style={{ height: 3, background: BD, borderRadius: 2 }}>
                    <div style={{ height: 3, width: `${t.attempted > 0 ? t.acc : 0}%`, background: P, borderRadius: 2, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ fontSize: 10, color: T3, marginTop: 4 }}>
                    {t.attempted > 0 ? `${t.acc}% accuracy · ${t.correct}/${t.total} correct` : 'Not attempted'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wrong / skipped review list */}
        {wrongQs.length > 0 && (
          <div style={{ border: `1px solid ${BD}`, borderRadius: 14, padding: '13px 14px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Review These Questions</div>
              <div style={{ fontSize: 11, color: T3 }}>{wrongQs.length} to review</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visibleWrongQs.map(q => {
                const a = answers[q.id]
                const isSkipped = !a || a === 'timeout'
                const qIdx = QUESTIONS.indexOf(q)
                return (
                  <div key={q.id} style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 10, overflow: 'hidden' }}>
                    {/* Tappable area → view solution */}
                    <button onClick={viewSolution} style={{ padding: '10px 12px', cursor: 'pointer', textAlign: 'left', display: 'block', width: '100%', background: 'transparent', border: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', border: `1.5px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: T2 }}>{qIdx + 1}</span>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 600, color: T2 }}>{isSkipped ? 'Skipped' : 'Wrong answer'}</span>
                          {q.isPYQ && (
                            <span style={{ fontSize: 9, background: 'white', border: `1px solid ${BD}`, color: T3, borderRadius: 4, padding: '1px 5px', fontWeight: 600 }}>PYQ</span>
                          )}
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                      </div>
                      <div style={{ fontSize: 12, color: T1, lineHeight: 1.45, marginBottom: isSkipped ? 0 : 6 }}>
                        {q.text.slice(0, 85)}{q.text.length > 85 ? '…' : ''}
                      </div>
                      {!isSkipped && (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <span style={{ fontSize: 11, color: RED, fontWeight: 500 }}>✗ You: {a?.toUpperCase()}</span>
                          <span style={{ fontSize: 11, color: GREEN, fontWeight: 500 }}>✓ Correct: {q.correct?.toUpperCase()}</span>
                        </div>
                      )}
                    </button>

                  </div>
                )
              })}
            </div>
            {wrongQs.length > 3 && (
              <button onClick={() => setShowAllWrong(v => !v)} style={{ width: '100%', background: 'none', border: 'none', color: P, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 8, padding: '6px 0' }}>
                {showAllWrong ? 'Show less ↑' : `Show ${wrongQs.length - 3} more ↓`}
              </button>
            )}
          </div>
        )}


        {/* Test feedback / rating */}
        <div style={{ border: `1px solid ${BD}`, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
          {feedbackSubmitted ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 3 }}>Thanks for your feedback!</div>
              <div style={{ fontSize: 12, color: T3 }}>It helps us improve the question set.</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 3 }}>How was your experience?</div>
              <div style={{ fontSize: 12, color: T3, marginBottom: 14 }}>How did this question set feel overall — quality, clarity, usefulness?</div>

              {/* 5-star row */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setRating(n)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: `1.5px solid ${rating >= n ? P : BD}`, background: rating >= n ? PL : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={rating >= n ? P : 'none'} stroke={rating >= n ? P : BD} strokeWidth="1.8">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  </button>
                ))}
              </div>

              {/* Rating label */}
              {rating > 0 && (
                <div style={{ fontSize: 12, color: P, fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>{RATING_LABELS[rating]}</div>
              )}

              {/* Optional comment */}
              <textarea
                value={feedbackNote}
                onChange={e => setFeedbackNote(e.target.value)}
                placeholder="Anything to add? (optional)"
                style={{ width: '100%', minHeight: 60, padding: '9px 12px', border: `1px solid ${BD}`, borderRadius: 10, fontSize: 12, color: T1, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
              />

              <button
                onClick={() => { if (rating > 0) setFeedbackSubmitted(true) }}
                style={{ width: '100%', padding: '10px', borderRadius: 10, border: `1.5px solid ${rating > 0 ? P : BD}`, background: rating > 0 ? PL : 'white', cursor: rating > 0 ? 'pointer' : 'default', fontSize: 13, fontWeight: 700, color: rating > 0 ? PD : T3, transition: 'all 0.15s' }}
              >
                Submit Feedback
              </button>
            </>
          )}
        </div>

      </div>

      {/* CTAs */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderTop: `1px solid ${BD}`, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <button onClick={() => setShowReattemptConfirm(true)} className="btn-outline" style={{ flex: 1 }}>Re-Attempt</button>
        <button onClick={viewSolution} className="btn-primary" style={{ flex: 2 }}>View Solutions →</button>
      </div>

      {/* Re-attempt confirm popup */}
      {showReattemptConfirm && (
        <div className="popup-overlay">
          <div className="popup">
            <div style={{ fontSize: 17, fontWeight: 700, color: T1, marginBottom: 8 }}>Re-attempt this test?</div>
            <div style={{ fontSize: 13, color: T2, marginBottom: 20, lineHeight: 1.5, background: '#FFF3E0', border: '1px solid #FFE082', borderRadius: 10, padding: '10px 12px' }}>
              ⚠️ Only your <strong>first attempt</strong> scores are marked for review and analysis. Re-attempt scores will not affect your performance record.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowReattemptConfirm(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleReattempt} className="btn-primary" style={{ flex: 1 }}>Re-Attempt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
