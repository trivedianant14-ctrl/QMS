import { useState } from 'react'
import { TOPICS } from '../data'

const P='#534AB7',PL='#EEEDFE',PB='#AFA9EC',PD='#3C3489'
const T1='#1a1a2e',T2='#5a5a78',T3='#9898b0',BD='#e8e8f2',BG2='#f5f5fb'

export default function PreTest({ navigate, startAttempt, mode, setMode }) {
  const [localMode, setLocalMode] = useState(mode)

  const handleAttempt = () => {
    setMode(localMode)
    startAttempt(localMode)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      {/* Status */}
      <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', color: T2, fontSize: 13, fontWeight: 600 }}>
        <span style={{ color: T1 }}>9:41</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: '6px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${BD}` }}>
        <button onClick={() => navigate('subject')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Anatomical Terms</span>
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '20px 16px 0' }}>

          {/* Mode selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Mode</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { id: 'guide', label: 'Guide Mode', desc: 'Solution will be visible immediately after you attempt the question.' },
                { id: 'exam', label: 'Exam Mode', desc: 'Solution will be visible after you attempt all the question.' },
              ].map(m => (
                <button key={m.id} onClick={() => setLocalMode(m.id)} style={{ flex: 1, padding: '12px 10px', borderRadius: 12, border: `2px solid ${localMode === m.id ? P : BD}`, background: localMode === m.id ? PL : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: localMode === m.id ? PD : T1, marginBottom: 5 }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: localMode === m.id ? P : T3, lineHeight: 1.4 }}>{m.desc}</div>
                  {localMode === m.id && <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: P }} /><span style={{ fontSize: 10, color: P, fontWeight: 600 }}>Selected</span></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter info */}
          <div style={{ background: BG2, borderRadius: 12, padding: '12px 14px', marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: P, marginBottom: 2 }}>Applied Anatomy</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: T1, marginBottom: 4 }}>Anatomical Terms</div>
            <div style={{ fontSize: 12, color: T3 }}>21 Ques</div>
          </div>

          {/* Topics list */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Topics in this chapter</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TOPICS.map((t, i) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: BG2, borderRadius: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: P }}>{i + 1}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: T1, marginBottom: 2 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: T3 }}>{t.qs} Qs{t.pyqs > 0 ? ` · ${t.pyqs} PYQ${t.pyqs > 1 ? 's' : ''}` : ''}</div>
                  </div>
                  {t.pyqs > 0 && (
                    <span style={{ background: '#FFF3E0', color: '#E65100', border: '1px solid #FFCC80', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>PYQ</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reference video CTA */}
          <div style={{ background: '#FFF8E7', border: '1px solid #FFE082', borderRadius: 12, padding: '12px 14px', marginBottom: 24, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FFE082', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#E65100"><polygon points="5,3 19,12 5,21"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#5D4037' }}>Want to revise before attempting? Watch the chapter video first.</div>
                <div style={{ fontSize: 11, color: '#8D6E63' }}>Chapter overview · 12 min</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2.5" style={{ marginLeft: 'auto' }}><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${BD}`, display: 'flex', gap: 10, background: 'white' }}>
        <button onClick={() => navigate('subject')} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
        <button onClick={handleAttempt} className="btn-primary" style={{ flex: 2 }}>Attempt</button>
      </div>
    </div>
  )
}
