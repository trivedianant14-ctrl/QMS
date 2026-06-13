import { useState } from 'react'

const P = '#534AB7', PL = '#EEEDFE', PB = '#AFA9EC', PD = '#3C3489'
const G = '#3B6D11', GL = '#EAF3DE', GB = '#97C459'
const A = '#633806', AL = '#FAEEDA', AB = '#FAC775'
const R = '#791F1F', RL = '#FCEBEB', RB = '#F09595'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0'
const BD = '#e8e8f2', BG2 = '#f5f5fb'

const FALLBACK_TEST = {
  name: 'NORCET 8 Grand Test – Session 1',
  questions: 200,
  duration: 120,
  totalMarks: 200,
  correctMarks: 1,
  wrongMarks: -0.25,
}

const INSTRUCTIONS = [
  'This test has 200 questions to be answered in 120 minutes. Manage your time carefully.',
  'Each question carries 1 mark. A penalty of 0.25 marks applies for every wrong answer.',
  'Unattempted questions carry no marks and no negative marking.',
  'Once the test begins, it cannot be paused. Do not close or refresh the screen.',
  'Each question has exactly one correct answer out of four options.',
  'You can navigate freely between questions using the question grid or Previous / Next buttons.',
  'Use "Mark for Review" to flag a question and return to it later.',
  'Click "Submit" only when you are done — the test will end and results will be generated immediately.',
  'Your screen will auto-submit if the timer reaches zero.',
]

const QUESTION_STATUSES = [
  { color: T3,       bg: BG2,  border: BD,  label: 'Not Visited',                  desc: 'You have not opened this question yet.' },
  { color: R,        bg: RL,   border: RB,  label: 'Not Answered',                 desc: 'Opened but no option selected.' },
  { color: G,        bg: GL,   border: GB,  label: 'Answered',                     desc: 'An option has been selected and saved.' },
  { color: PD,       bg: PL,   border: PB,  label: 'Marked for Review',            desc: 'Flagged for later — no answer saved.' },
  { color: PD,       bg: PL,   border: GB,  label: 'Answered & Marked for Review', desc: 'Answer saved and also flagged to revisit.' },
]

const BUTTONS = [
  { label: 'Save & Next',        desc: 'Saves your selected answer and moves to the next question.' },
  { label: 'Mark for Review',    desc: 'Flags the question for later review and moves forward.' },
  { label: 'Clear Response',     desc: 'Removes your selected option without saving.' },
  { label: 'Previous',           desc: 'Goes back to the previous question without changing your answer.' },
]

function SectionHeader({ children }) {
  return (
    <div style={{ fontSize:13, fontWeight:700, color:T1, marginBottom:10, marginTop:20 }}>
      {children}
    </div>
  )
}

export default function LiveTestPreTest({ navigate, test }) {
  const [agreed, setAgreed] = useState(false)
  const t = test || FALLBACK_TEST

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'white' }}>

      {/* Status bar */}
      <div style={{ padding:'12px 20px 4px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <span style={{ fontSize:13, fontWeight:600, color:T1 }}>9:41</span>
        <div style={{ display:'flex', gap:6, alignItems:'center', color:T1 }}>
          <svg width="16" height="11" viewBox="0 0 30 20" fill="currentColor"><rect x="0" y="8" width="4" height="12" rx="1" opacity="0.4"/><rect x="7" y="5" width="4" height="15" rx="1" opacity="0.6"/><rect x="14" y="2" width="4" height="18" rx="1" opacity="0.8"/><rect x="21" y="0" width="4" height="20" rx="1"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
        </div>
      </div>

      {/* Nav header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 20px 12px', borderBottom:`1px solid ${BD}`, flexShrink:0 }}>
        <button onClick={() => navigate('livetest')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:T1, padding:0, flexShrink:0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:700, color:T1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.name}</div>
          <div style={{ fontSize:11, color:T3, marginTop:1 }}>Read instructions carefully before starting</div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="scroll" style={{ flex:1, padding:'0 16px' }}>

        {/* Test summary grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, background:BD, borderRadius:14, overflow:'hidden', marginTop:16, border:`1px solid ${BD}` }}>
          {[
            { value: t.questions,    unit: 'Questions' },
            { value: `${t.duration} min`, unit: 'Duration' },
            { value: t.totalMarks,   unit: 'Total Marks' },
          ].map((cell, i) => (
            <div key={i} style={{ background:'white', padding:'14px 10px', textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:700, color:P, marginBottom:2 }}>{cell.value}</div>
              <div style={{ fontSize:10, fontWeight:500, color:T3 }}>{cell.unit}</div>
            </div>
          ))}
        </div>

        {/* Marking scheme */}
        <SectionHeader>Marking Scheme</SectionHeader>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ flex:1, background:GL, border:`1px solid ${GB}`, borderRadius:10, padding:'12px', textAlign:'center' }}>
            <div style={{ fontSize:18, fontWeight:700, color:G }}>+{t.correctMarks}</div>
            <div style={{ fontSize:11, color:G, fontWeight:500, marginTop:2 }}>Correct Answer</div>
          </div>
          <div style={{ flex:1, background:RL, border:`1px solid ${RB}`, borderRadius:10, padding:'12px', textAlign:'center' }}>
            <div style={{ fontSize:18, fontWeight:700, color:R }}>{t.wrongMarks}</div>
            <div style={{ fontSize:11, color:R, fontWeight:500, marginTop:2 }}>Wrong Answer</div>
          </div>
          <div style={{ flex:1, background:BG2, border:`1px solid ${BD}`, borderRadius:10, padding:'12px', textAlign:'center' }}>
            <div style={{ fontSize:18, fontWeight:700, color:T3 }}>0</div>
            <div style={{ fontSize:11, color:T3, fontWeight:500, marginTop:2 }}>Unattempted</div>
          </div>
        </div>

        {/* Instructions */}
        <SectionHeader>Instructions</SectionHeader>
        <div style={{ background:BG2, border:`1px solid ${BD}`, borderRadius:12, padding:'4px 4px' }}>
          {INSTRUCTIONS.map((text, i) => (
            <div key={i} style={{ display:'flex', gap:10, padding:'10px 12px', borderBottom: i < INSTRUCTIONS.length - 1 ? `1px solid ${BD}` : 'none' }}>
              <span style={{ width:20, height:20, borderRadius:'50%', background:PL, color:PD, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>{i + 1}</span>
              <span style={{ fontSize:12, color:T2, lineHeight:1.55 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Question status legend */}
        <SectionHeader>Question Status Colors</SectionHeader>
        <div style={{ background:BG2, border:`1px solid ${BD}`, borderRadius:12, overflow:'hidden' }}>
          {QUESTION_STATUSES.map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderBottom: i < QUESTION_STATUSES.length - 1 ? `1px solid ${BD}` : 'none', background:'white' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:s.bg, border:`2px solid ${s.border}`, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:T1, marginBottom:1 }}>{s.label}</div>
                <div style={{ fontSize:11, color:T3 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Button guide */}
        <SectionHeader>Buttons in the Test</SectionHeader>
        <div style={{ background:BG2, border:`1px solid ${BD}`, borderRadius:12, overflow:'hidden', marginBottom:24 }}>
          {BUTTONS.map((b, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'11px 14px', borderBottom: i < BUTTONS.length - 1 ? `1px solid ${BD}` : 'none', background:'white' }}>
              <span style={{ flexShrink:0, padding:'3px 10px', borderRadius:6, background:PL, color:PD, fontSize:11, fontWeight:600, border:`1px solid ${PB}`, marginTop:1, whiteSpace:'nowrap' }}>{b.label}</span>
              <span style={{ fontSize:12, color:T2, lineHeight:1.55 }}>{b.desc}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Fixed footer */}
      <div style={{ flexShrink:0, padding:'14px 16px', borderTop:`1px solid ${BD}`, background:'white' }}>
        {/* Checkbox row */}
        <button
          onClick={() => setAgreed(a => !a)}
          style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:12, background:'none', border:'none', cursor:'pointer', textAlign:'left', width:'100%', padding:0 }}
        >
          <div style={{
            width:20, height:20, borderRadius:5, flexShrink:0, marginTop:1,
            background: agreed ? P : 'white',
            border: `2px solid ${agreed ? P : BD}`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            {agreed && (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,6 5,9 10,3"/>
              </svg>
            )}
          </div>
          <span style={{ fontSize:13, color: agreed ? T1 : T2, fontWeight: agreed ? 600 : 400, lineHeight:1.5 }}>
            I have read and understood all the instructions
          </span>
        </button>

        {/* Start button */}
        <button
          disabled={!agreed}
          style={{
            width:'100%', padding:'13px', borderRadius:12,
            background: agreed ? P : BG2,
            color: agreed ? 'white' : T3,
            fontSize:15, fontWeight:700, border:'none',
            cursor: agreed ? 'pointer' : 'default',
            transition:'background 0.15s, color 0.15s',
          }}
        >
          Start Test
        </button>
      </div>

    </div>
  )
}
