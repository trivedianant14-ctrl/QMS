import { useState, useEffect } from 'react'
import { QUESTIONS } from '../data'

const P='#534AB7', PL='#EEEDFE', PD='#3C3489'
const T1='#1a1a2e', T2='#5a5a78', T3='#9898b0', BD='#e8e8f2', BG2='#f5f5fb'
const GREEN='#27500A', GREEN_BG='#EAF3DE', GREEN_BD='#97C459'
const RED='#791F1F', RED_BG='#FCEBEB', RED_BD='#F09595'

function SemiGauge({ pct }) {
  const r = 108, cx = 150, cy = 130
  const len = Math.PI * r
  const color = pct >= 80 ? '#3B6D11' : pct >= 60 ? P : pct >= 40 ? '#E65100' : '#A32D2D'
  const trackColor = pct >= 80 ? '#C8E6A0' : pct >= 60 ? PL : pct >= 40 ? '#FFE0B2' : '#FCEBEB'
  return (
    <svg width="100%" viewBox="0 0 300 148" style={{ overflow: 'visible', display: 'block' }}>
      <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
        fill="none" stroke={trackColor} strokeWidth="18" strokeLinecap="round" />
      <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
        fill="none" stroke={color} strokeWidth="18" strokeLinecap="round"
        strokeDasharray={`${len} ${len}`}
        strokeDashoffset={len * (1 - pct / 100)}
        style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {/* End dot */}
      {pct > 2 && (() => {
        const angle = Math.PI * (1 - pct / 100)
        const dotX = cx + r * Math.cos(Math.PI - angle)
        const dotY = cy - r * Math.sin(Math.PI - angle)
        return <circle cx={dotX} cy={dotY} r="9" fill={color} />
      })()}
    </svg>
  )
}

export default function Summary({ navigate, answers, isReattempt, handleReattempt }) {
  const correct   = QUESTIONS.filter(q => answers[q.id] === q.correct).length
  const skipped   = QUESTIONS.filter(q => answers[q.id] === 'timeout').length
  const incorrect = QUESTIONS.length - correct - skipped
  const accuracy  = Math.round((correct / QUESTIONS.length) * 100)

  const [animPct, setAnimPct] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setAnimPct(accuracy), 120)
    return () => clearTimeout(t)
  }, [accuracy])

  const getMsg = () => {
    if (accuracy >= 80) return { headline: 'Outstanding!', sub: 'You really know your stuff.' }
    if (accuracy >= 60) return { headline: 'Good effort!', sub: "You're getting there, keep it up." }
    if (accuracy >= 40) return { headline: 'Keep going!', sub: 'Practice a bit more and you\'ll nail it.' }
    return { headline: "Don't give up!", sub: 'Every attempt makes you stronger.' }
  }
  const msg = getMsg()

  const gaugeColor = accuracy >= 80 ? '#3B6D11' : accuracy >= 60 ? P : accuracy >= 40 ? '#E65100' : '#A32D2D'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', overflowY: 'auto' }}>

      {/* Status bar */}
      <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>9:41</span>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 20px 36px' }}>

        {/* Chapter context */}
        <div style={{ fontSize: 11, fontWeight: 600, color: T3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
          Anatomical Terms · Applied Anatomy
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: T1, marginBottom: 4 }}>{msg.headline}</div>
          <div style={{ fontSize: 14, color: T2, lineHeight: 1.5 }}>{msg.sub}</div>
          {isReattempt && (
            <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5, background: '#FFF8E7', border: '1px solid #FFE082', borderRadius: 20, padding: '4px 12px', fontSize: 11, color: '#B45309', fontWeight: 600 }}>
              Reattempt · Score not saved
            </div>
          )}
        </div>

        {/* Semi-circle gauge */}
        <div style={{ width: '100%', maxWidth: 300, position: 'relative', marginBottom: 4 }}>
          <SemiGauge pct={animPct} />
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: gaugeColor, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {accuracy}%
            </div>
            <div style={{ fontSize: 12, color: T3, marginTop: 2, fontWeight: 500 }}>accuracy</div>
          </div>
        </div>

        {/* Stat cards — fan layout */}
        <div style={{ display: 'flex', gap: 10, width: '100%', marginBottom: 30, alignItems: 'flex-end', marginTop: 16 }}>
          {/* Correct */}
          <div style={{ flex: 1, background: GREEN_BG, border: `1.5px solid ${GREEN_BD}`, borderRadius: 18, padding: '18px 10px 14px', textAlign: 'center', transform: 'rotate(-3deg) translateY(4px)', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: `2px solid ${GREEN_BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: GREEN, lineHeight: 1 }}>{correct}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, opacity: 0.75, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Correct</div>
          </div>

          {/* Accuracy — center, elevated */}
          <div style={{ flex: 1.15, background: PL, border: `1.5px solid ${P}`, borderRadius: 18, padding: '20px 10px 16px', textAlign: 'center', transform: 'translateY(-10px)', boxShadow: `0 6px 20px rgba(83,74,183,0.18)` }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: `2px solid ${P}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: PD, lineHeight: 1 }}>{QUESTIONS.length}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: P, opacity: 0.8, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Questions</div>
          </div>

          {/* Incorrect */}
          <div style={{ flex: 1, background: RED_BG, border: `1.5px solid ${RED_BD}`, borderRadius: 18, padding: '18px 10px 14px', textAlign: 'center', transform: 'rotate(3deg) translateY(4px)', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: `2px solid ${RED_BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: RED, lineHeight: 1 }}>{incorrect}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: RED, opacity: 0.75, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Incorrect</div>
          </div>
        </div>

        {/* Skipped row — only if any */}
        {skipped > 0 && (
          <div style={{ width: '100%', background: '#FFF8E7', border: '1px solid #FFD54F', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#B45309' }}>{skipped} question{skipped > 1 ? 's' : ''} skipped (ran out of time)</span>
          </div>
        )}

        {/* CTAs */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => navigate('result')} className="btn-primary" style={{ width: '100%', fontSize: 15, padding: '15px' }}>
            View Full Analysis →
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('subject')} className="btn-outline" style={{ flex: 1 }}>
              Go Back
            </button>
            <button onClick={handleReattempt} className="btn-outline" style={{ flex: 1 }}>
              Try Again
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
