import { QUESTIONS, TOPICS } from '../data'

const P='#534AB7',PL='#EEEDFE',PD='#3C3489'
const T1='#1a1a2e',T2='#5a5a78',T3='#9898b0',BD='#e8e8f2',BG2='#f5f5fb'

function PieChart({ correct, incorrect, unattempted }) {
  const total = correct + incorrect + unattempted
  if (total === 0) return null
  const r = 54, cx = 70, cy = 70, circumference = 2 * Math.PI * r
  const cPct = correct / total, iPct = incorrect / total
  const cDash = cPct * circumference, iDash = iPct * circumference, uDash = (unattempted / total) * circumference
  const cOffset = 0, iOffset = circumference - cDash, uOffset = circumference - cDash - iDash
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {[
        { dash: cDash, gap: circumference - cDash, offset: cOffset, color: '#3B6D11' },
        { dash: iDash, gap: circumference - iDash, offset: iOffset, color: '#A32D2D' },
        { dash: uDash, gap: circumference - uDash, offset: uOffset, color: BD },
      ].map((seg, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth="18" strokeDasharray={`${seg.dash} ${seg.gap}`} strokeDashoffset={seg.offset} style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill={T1}>{Math.round((correct / total) * 100)}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill={T2}>accuracy</text>
    </svg>
  )
}

export default function Result({ navigate, answers, mode, viewSolution, setShowReattemptConfirm, showReattemptConfirm, handleReattempt }) {
  const correct = QUESTIONS.filter(q => answers[q.id] === q.correct).length
  const incorrect = QUESTIONS.filter(q => answers[q.id] && answers[q.id] !== q.correct && answers[q.id] !== 'timeout').length
  const timedOut = QUESTIONS.filter(q => answers[q.id] === 'timeout').length
  const unattempted = QUESTIONS.filter(q => !answers[q.id]).length + timedOut
  const total = QUESTIONS.length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  const topicData = TOPICS.map(t => {
    const topicQs = QUESTIONS.filter(q => q.topicId === t.id)
    const topicCorrect = topicQs.filter(q => answers[q.id] === q.correct).length
    const topicAttempted = topicQs.filter(q => answers[q.id] && answers[q.id] !== 'timeout').length
    const topicAcc = topicAttempted > 0 ? Math.round((topicCorrect / topicAttempted) * 100) : 0
    const pyqCount = topicQs.filter(q => q.isPYQ).length
    return { ...t, correct: topicCorrect, attempted: topicAttempted, total: topicQs.length, acc: topicAcc, pyqCount }
  })

  const avgTime = 48
  const totalTime = `${Math.floor((avgTime * total) / 60)}m ${(avgTime * total) % 60}s`
  const peerPct = 73

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

        {/* Score summary */}
        <div style={{ background: 'white', border: `1px solid ${BD}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <PieChart correct={correct} incorrect={incorrect} unattempted={unattempted} />
            <div style={{ flex: 1 }}>
              {[
                { label: 'Correct', val: correct, color: '#3B6D11', bg: '#EAF3DE' },
                { label: 'Incorrect', val: incorrect, color: '#A32D2D', bg: '#FCEBEB' },
                { label: 'Unattempted', val: unattempted, color: T3, bg: BG2 },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 12, color: T2 }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 4, paddingTop: 10, borderTop: `1px solid ${BD}` }}>
                <div style={{ fontSize: 10, color: T3, marginBottom: 2 }}>ACCURACY</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: accuracy >= 70 ? '#3B6D11' : accuracy >= 50 ? P : '#A32D2D' }}>{accuracy}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Analysis */}
        <div style={{ border: `1px solid ${BD}`, borderRadius: 14, padding: '13px 16px', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 10 }}>Time Analysis</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['Avg per question', `${avgTime}s`], ['Total time', totalTime]].map(([k, v]) => (
              <div key={k} style={{ background: BG2, borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: T3, marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: T1 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Peer Analysis */}
        <div style={{ border: `1px solid ${BD}`, borderRadius: 14, padding: '13px 16px', marginBottom: 12, background: '#EAF3DE' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1F4A07', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>
            Peer Analysis
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1F4A07', lineHeight: 1.5 }}>
            You performed better than <span style={{ fontSize: 20, fontWeight: 800 }}>{peerPct}%</span> of students who attempted this test.
          </div>
        </div>

        {/* Topic Wise Analysis */}
        <div style={{ border: `1px solid ${BD}`, borderRadius: 14, padding: '13px 16px', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 12 }}>Topic Wise Analysis</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topicData.map(t => {
              const barColor = t.acc >= 70 ? '#3B6D11' : t.acc >= 50 ? P : t.attempted === 0 ? BD : '#A32D2D'
              return (
                <div key={t.id} style={{ padding: '10px 12px', background: BG2, borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T1, marginBottom: 2 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: T3 }}>{t.correct}/{t.total} correct{t.pyqCount > 0 ? ` · ${t.pyqCount} PYQ${t.pyqCount > 1 ? 's' : ''}` : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: barColor }}>{t.attempted > 0 ? `${t.acc}%` : '—'}</div>
                    </div>
                  </div>
                  <div style={{ height: 5, background: BD, borderRadius: 3 }}>
                    <div style={{ height: 5, width: `${t.attempted > 0 ? t.acc : 0}%`, background: barColor, borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderTop: `1px solid ${BD}`, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <button onClick={() => setShowReattemptConfirm(true)} className="btn-outline" style={{ flex: 1 }}>Re-Attempt</button>
        <button onClick={viewSolution} className="btn-primary" style={{ flex: 2 }}>View Solution →</button>
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
