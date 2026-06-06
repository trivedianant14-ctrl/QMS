import { useState } from 'react'
import { QUESTIONS, TOPICS } from '../data'

const P='#534AB7',PL='#EEEDFE',PD='#3C3489'
const T1='#1a1a2e',T2='#5a5a78',T3='#9898b0',BD='#e8e8f2',BG2='#f5f5fb'
const GREEN='#3B6D11',GREENBG='#EAF3DE',RED='#A32D2D',REDBG='#FCEBEB'

export default function Result({ navigate, answers, mode, viewSolution, setShowReattemptConfirm, showReattemptConfirm, handleReattempt }) {
  const [showAllWrong, setShowAllWrong] = useState(false)

  const correct = QUESTIONS.filter(q => answers[q.id] === q.correct).length
  const incorrect = QUESTIONS.filter(q => answers[q.id] && answers[q.id] !== q.correct && answers[q.id] !== 'timeout').length
  const timedOut = QUESTIONS.filter(q => answers[q.id] === 'timeout').length
  const unattempted = QUESTIONS.filter(q => !answers[q.id]).length + timedOut
  const total = QUESTIONS.length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  const qStatuses = QUESTIONS.map(q => {
    const a = answers[q.id]
    if (!a || a === 'timeout') return 'skip'
    return a === q.correct ? 'correct' : 'wrong'
  })

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
        <div style={{
          background: accuracy >= 70 ? GREENBG : accuracy >= 50 ? PL : REDBG,
          border: `1px solid ${accuracy >= 70 ? '#BFD9A5' : accuracy >= 50 ? '#C5C2F5' : '#F5BEBE'}`,
          borderRadius: 16, padding: '18px 16px', marginBottom: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1, color: accuracy >= 70 ? GREEN : accuracy >= 50 ? P : RED }}>{accuracy}%</div>
              <div style={{ fontSize: 10, color: T3, marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>accuracy</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T1, lineHeight: 1.5, marginBottom: 10 }}>{motivationalMsg}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { val: correct, label: 'correct', color: GREEN, bg: '#C8E6A8' },
                  { val: incorrect, label: 'wrong', color: RED, bg: '#F5CECE' },
                  { val: unattempted, label: 'skipped', color: T3, bg: BD },
                ].map(item => (
                  <div key={item.label} style={{ background: item.bg, borderRadius: 20, padding: '3px 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: item.color }}>{item.val}</span>
                    <span style={{ fontSize: 11, color: item.color, fontWeight: 500 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Question-by-question strip */}
        <div style={{ border: `1px solid ${BD}`, borderRadius: 14, padding: '13px 14px', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 10 }}>Your Answers</div>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
            {QUESTIONS.map((q, i) => {
              const status = qStatuses[i]
              const bg = status === 'correct' ? GREENBG : status === 'wrong' ? REDBG : BG2
              const border = status === 'correct' ? '#8DC45A' : status === 'wrong' ? '#E8A0A0' : BD
              const color = status === 'correct' ? GREEN : status === 'wrong' ? RED : T3
              const icon = status === 'correct' ? '✓' : status === 'wrong' ? '✗' : '—'
              return (
                <button key={q.id} onClick={viewSolution} style={{ flexShrink: 0, width: 44, height: 52, borderRadius: 10, border: `2px solid ${border}`, background: bg, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: T2 }}>Q{i + 1}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color }}>{icon}</span>
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            {[{ icon: '✓', label: 'Correct', color: GREEN }, { icon: '✗', label: 'Wrong', color: RED }, { icon: '—', label: 'Skipped', color: T3 }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12, color: l.color, fontWeight: 700 }}>{l.icon}</span>
                <span style={{ fontSize: 11, color: T3 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PYQ missed alert */}
        {missedPYQs.length > 0 && (
          <div style={{ background: '#FFF8E7', border: '1px solid #FFE082', borderRadius: 14, padding: '13px 14px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: '#FFE082', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#5D4037' }}>
                {missedPYQs.length} Previous Year Question{missedPYQs.length > 1 ? 's' : ''} Missed
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#8D6E63', lineHeight: 1.5, marginBottom: 8 }}>
              These appeared in real exams — prioritise reviewing them.
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {missedPYQs.map(q => (
                <button key={q.id} onClick={viewSolution} style={{ background: '#FFE082', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#5D4037', cursor: 'pointer' }}>
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
              {weakTopics.map(t => {
                const urgent = t.wrong > 0
                const accColor = t.acc >= 70 ? GREEN : t.acc >= 50 ? P : urgent ? RED : T3
                return (
                  <div key={t.id} style={{ background: urgent ? REDBG : BG2, border: `1px solid ${urgent ? '#F5BEBE' : BD}`, borderRadius: 10, padding: '10px 12px' }}>
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
                      <button onClick={viewSolution} style={{ background: urgent ? RED : P, border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: 'white', cursor: 'pointer', flexShrink: 0, marginLeft: 10 }}>
                        Review
                      </button>
                    </div>
                    <div style={{ height: 4, background: urgent ? '#F5D5D5' : BD, borderRadius: 2 }}>
                      <div style={{ height: 4, width: `${t.attempted > 0 ? t.acc : 0}%`, background: accColor, borderRadius: 2, transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ fontSize: 10, color: T3, marginTop: 4 }}>
                      {t.attempted > 0 ? `${t.acc}% accuracy · ${t.correct}/${t.total} correct` : 'Not attempted'}
                    </div>
                  </div>
                )
              })}
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
                  <button key={q.id} onClick={viewSolution} style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 10, padding: '10px 12px', cursor: 'pointer', textAlign: 'left', display: 'block', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: isSkipped ? BD : REDBG, border: `2px solid ${isSkipped ? T3 : RED}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: isSkipped ? T3 : RED }}>{qIdx + 1}</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: isSkipped ? T3 : RED }}>{isSkipped ? 'Skipped' : 'Wrong answer'}</span>
                        {q.isPYQ && (
                          <span style={{ fontSize: 9, background: '#FFE082', color: '#5D4037', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>PYQ</span>
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

        {/* Time stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[['Avg per question', `${avgTime}s`], ['Total time', totalTime]].map(([k, v]) => (
            <div key={k} style={{ border: `1px solid ${BD}`, borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: T3, marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T1 }}>{v}</div>
            </div>
          ))}
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
