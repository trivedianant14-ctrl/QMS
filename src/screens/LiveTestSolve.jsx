import { useState, useEffect } from 'react'
import { QUESTIONS } from '../data'

// NORCET navy theme
const NAVY='#1f3a68', NAVY_D='#162d52', NAVY_L='#dce5f0'
const GRUN='#2eaa3a', GRUN_L='#d4f0d8'
const DIAM='#d94a4a'
const PURP='#8a4ed4'
const WRN_BG='#fff3cd', WRN_BD='#ffc107', WRN_C='#856404'
const T1='#222', T2='#555', T3='#888', BD='#ddd', BG='#f5f5f5'

// NPrep purple — loading/analysis only
const P='#534AB7', PL='#EEEDFE'
const G='#3B6D11', GL='#EAF3DE', GB='#97C459'
const R='#791F1F', RL='#FCEBEB', RB='#F09595'
const A='#633806', AL='#FAEEDA', AB='#FAC775'
const TX1='#1a1a2e', TX2='#5a5a78', TX3='#9898b0', BDX='#e8e8f2', BG2='#f5f5fb'

const REPORT_OPTIONS = {
  technical: ['App is crashing or freezing','Question not loading','Options not selectable','Timer not working','Other technical issue'],
  content: ['Wrong answer marked correct','Explanation is incorrect','Grammatical or spelling error','Question is out of syllabus','Other content issue'],
}

// Group QUESTIONS by topicName into exam sections
const buildSections = () => {
  const map = {}, order = []
  QUESTIONS.forEach((q, idx) => {
    if (!map[q.topicName]) { map[q.topicName] = []; order.push(q.topicName) }
    map[q.topicName].push(idx)
  })
  return order.map((name, i) => ({ id: String.fromCharCode(65 + i), name, qIdxs: map[name] }))
}
const SECTIONS = buildSections()

// NORCET-style status shape: house=answered, diamond=notanswered, circle=marked
function QShape({ status, num, isCurrent, size = 34, onClick }) {
  const base = {
    width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: Math.floor(size * 0.33), fontWeight: 700, cursor: 'pointer', flexShrink: 0,
    position: 'relative', userSelect: 'none', boxSizing: 'border-box',
    outline: isCurrent ? '2.5px solid #ff8800' : 'none', outlineOffset: 1,
  }
  if (status === 'answered')
    return <div onClick={onClick} style={{ ...base, background: GRUN, color: 'white', clipPath: 'polygon(0 30%,50% 0,100% 30%,100% 100%,0 100%)' }}>{num}</div>
  if (status === 'notanswered')
    return <div onClick={onClick} style={{ ...base, background: DIAM, color: 'white', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }}>{num}</div>
  if (status === 'marked')
    return <div onClick={onClick} style={{ ...base, background: PURP, color: 'white', borderRadius: '50%' }}>{num}</div>
  if (status === 'answeredmarked')
    return (
      <div onClick={onClick} style={{ ...base, background: PURP, color: 'white', borderRadius: '50%' }}>
        {num}
        <div style={{ position: 'absolute', bottom: 1, right: 1, width: Math.round(size * 0.28), height: Math.round(size * 0.28), background: GRUN, borderRadius: '50%', border: '1.5px solid white' }} />
      </div>
    )
  return <div onClick={onClick} style={{ ...base, background: '#ddd', color: '#555', border: '1px solid #bbb' }}>{num}</div>
}

const gBtn  = (x={}) => ({ padding:'8px 12px', fontSize:12, fontWeight:600, border:'1px solid #999', background:'linear-gradient(#fafafa,#dcdcdc)', cursor:'pointer', borderRadius:2, color:T1, ...x })
const gPrim = (x={}) => ({ ...gBtn(), background:`linear-gradient(${NAVY},${NAVY_D})`, color:'white', border:`1px solid ${NAVY_D}`, ...x })
const gDngr = (x={}) => ({ ...gBtn(), background:'linear-gradient(#e85050,#b03030)', color:'white', border:'1px solid #903030', ...x })

const fmtSec = s => {
  const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sc=s%60
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`
}

export default function LiveTestSolve({ navigate, test }) {
  const totalSecs = (test?.duration || 120) * 60
  const cm = test?.correctMarks || 1
  const wm = test?.wrongMarks || -0.25

  const initTimers = () => SECTIONS.map(sec => Math.round((sec.qIdxs.length / QUESTIONS.length) * totalSecs))

  const [curSec, setCurSec]                       = useState(0)
  const [curQLocal, setCurQLocal]                 = useState(0)
  const [sectionTimers, setSectionTimers]         = useState(initTimers)
  const [sectionLocked, setSectionLocked]         = useState(() => SECTIONS.map(() => false))
  const [answers, setAnswers]                     = useState({})
  const [markedIds, setMarkedIds]                 = useState(new Set())
  const [visitedIds, setVisitedIds]               = useState(() => {
    const s = new Set()
    const first = QUESTIONS[SECTIONS[0]?.qIdxs[0]]
    if (first) s.add(first.id)
    return s
  })
  const [showGrid, setShowGrid]                   = useState(false)
  const [gridSec, setGridSec]                     = useState(0)
  const [showExitConfirm, setShowExitConfirm]     = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showReport, setShowReport]               = useState(false)
  const [reportType, setReportType]               = useState('technical')
  const [reportSubs, setReportSubs]               = useState(new Set())
  const [reportNote, setReportNote]               = useState('')
  const [reportSubmitted, setReportSubmitted]     = useState(false)
  const [imageZoom, setImageZoom]                 = useState(1)
  const [phase, setPhase]                         = useState('test')
  const [finalResults, setFinalResults]           = useState(null)

  const section      = SECTIONS[curSec]
  const curGlobalIdx = section.qIdxs[curQLocal]
  const q            = QUESTIONS[curGlobalIdx]
  const selected     = answers[q?.id]
  const isMarked     = markedIds.has(q?.id)
  const isLocked     = sectionLocked[curSec]
  const isLastQInSec = curQLocal === section.qIdxs.length - 1
  const isLastSec    = curSec === SECTIONS.length - 1
  const isLastQ      = isLastQInSec && isLastSec

  const totalTimeLeft = sectionTimers.reduce((a, b) => a + b, 0)
  const timerStr = fmtSec(totalTimeLeft)

  const getStatus = (gIdx) => {
    const qi = QUESTIONS[gIdx]
    const ans = !!answers[qi.id], mrk = markedIds.has(qi.id)
    if (ans && mrk) return 'answeredmarked'
    if (ans) return 'answered'
    if (mrk) return 'marked'
    if (visitedIds.has(qi.id)) return 'notanswered'
    return 'notvisited'
  }

  const counts = { answered:0, notanswered:0, marked:0, answeredmarked:0, notvisited:0 }
  QUESTIONS.forEach((_, i) => { counts[getStatus(i)]++ })

  const computeAndFinalize = () => {
    let correct=0, wrong=0, unattempted=0
    const topicMap = {}
    QUESTIONS.forEach(qi => {
      if (!topicMap[qi.topicName]) topicMap[qi.topicName] = { correct:0, wrong:0, unattempted:0 }
      if (!answers[qi.id])                    { unattempted++; topicMap[qi.topicName].unattempted++ }
      else if (answers[qi.id] === qi.correct) { correct++;    topicMap[qi.topicName].correct++ }
      else                                    { wrong++;      topicMap[qi.topicName].wrong++ }
    })
    setFinalResults({ correct, wrong, unattempted, score: parseFloat((correct*cm + wrong*wm).toFixed(2)), timeTaken: totalSecs - totalTimeLeft, topicMap })
    setPhase('loading')
  }

  // Tick current section timer
  useEffect(() => {
    if (phase !== 'test') return
    const id = setInterval(() => setSectionTimers(prev => {
      const next = [...prev]
      if (next[curSec] > 0) next[curSec]--
      return next
    }), 1000)
    return () => clearInterval(id)
  }, [curSec, phase])

  // Lock section when its timer hits 0; auto-submit when all expire
  useEffect(() => {
    if (phase !== 'test') return
    let changed = false
    const newLocked = [...sectionLocked]
    sectionTimers.forEach((t, i) => { if (t === 0 && !newLocked[i]) { newLocked[i] = true; changed = true } })
    if (changed) setSectionLocked(newLocked)
    if (sectionTimers.every(t => t === 0)) computeAndFinalize()
  }, [sectionTimers])

  useEffect(() => {
    if (phase !== 'loading') return
    const id = setTimeout(() => setPhase('analysis'), 2500)
    return () => clearTimeout(id)
  }, [phase])

  useEffect(() => {
    if (q) setVisitedIds(prev => new Set([...prev, q.id]))
    setImageZoom(1)
  }, [curSec, curQLocal])

  const goNext = () => {
    if (!isLastQInSec) setCurQLocal(l => l+1)
    else if (!isLastSec) { setCurSec(s => s+1); setCurQLocal(0) }
  }
  const goPrev = () => {
    if (curQLocal > 0) setCurQLocal(l => l-1)
    else if (curSec > 0) { const ps = curSec-1; setCurSec(ps); setCurQLocal(SECTIONS[ps].qIdxs.length-1) }
  }
  const handleAnswer   = (optId) => { if (!isLocked) setAnswers(a => ({ ...a, [q.id]: optId })) }
  const handleClear    = () => { if (!isLocked) setAnswers(a => { const n={...a}; delete n[q.id]; return n }) }
  const handleMarkNext = () => {
    if (!isLocked) setMarkedIds(prev => { const n=new Set(prev); n.has(q.id)?n.delete(q.id):n.add(q.id); return n })
    goNext()
  }
  const handleSaveNext = () => { if (isLastQ) setShowSubmitConfirm(true); else goNext() }
  const handleSubmit   = () => { setShowSubmitConfirm(false); computeAndFinalize() }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (phase === 'loading') return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'white' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 32px' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', border:`5px solid ${PL}`, borderTop:`5px solid ${P}`, animation:'spin 0.85s linear infinite', marginBottom:32 }} />
        <div style={{ fontSize:20, fontWeight:800, color:TX1, marginBottom:8, textAlign:'center' }}>Preparing your analysis</div>
        <div style={{ fontSize:13, color:TX3, textAlign:'center', lineHeight:1.6 }}>Calculating score and subject performance…</div>
      </div>
      <div style={{ height:5, background:BG2, flexShrink:0, position:'relative' }}>
        <div style={{ position:'absolute', left:0, top:0, height:'100%', background:P, borderRadius:3, animation:'progressFill 2.4s ease forwards' }} />
      </div>
    </div>
  )

  // ── Analysis ─────────────────────────────────────────────────────────────
  if (phase === 'analysis' && finalResults) {
    const r = finalResults, total = QUESTIONS.length
    const accuracy = total > 0 ? Math.round((r.correct/total)*100) : 0
    const fmtT = s => { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60; return h>0?`${h}h ${m}m`:m>0?`${m}m ${sc}s`:`${sc}s` }
    const ac  = accuracy>=60?G:accuracy>=40?A:R
    const ab2 = accuracy>=60?GL:accuracy>=40?AL:RL
    const ab3 = accuracy>=60?GB:accuracy>=40?AB:RB
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', background:BG2 }}>
        <div style={{ background:NAVY, flexShrink:0, padding:'28px 16px 14px', display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => navigate('livetest')} style={{ background:'none', border:'none', cursor:'pointer', color:'white', padding:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>
          </button>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'white' }}>Test Results</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)', marginTop:1 }}>{test?.name||'Live Test'}</div>
          </div>
        </div>
        <div className="scroll" style={{ flex:1, padding:'16px 16px 80px' }}>
          <div style={{ background:'white', borderRadius:12, padding:'24px 20px', marginBottom:10, textAlign:'center', border:`1px solid ${BDX}` }}>
            <div style={{ fontSize:10, fontWeight:600, color:TX3, letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:14 }}>Your Score</div>
            <div><span style={{ fontSize:54, fontWeight:900, color:NAVY }}>{r.score}</span><span style={{ fontSize:20, color:TX3 }}> / {total}</span></div>
            <div style={{ marginTop:12, display:'inline-flex', alignItems:'center', background:ab2, border:`1px solid ${ab3}`, borderRadius:20, padding:'5px 16px' }}>
              <span style={{ fontSize:13, fontWeight:700, color:ac }}>{accuracy}% Accuracy</span>
            </div>
            <div style={{ marginTop:10, fontSize:11, color:TX3 }}>⏱ {fmtT(r.timeTaken)} taken</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
            {[{label:'Correct',value:r.correct,fg:G,bg:GL,bd:GB},{label:'Wrong',value:r.wrong,fg:R,bg:RL,bd:RB},{label:'Skipped',value:r.unattempted,fg:TX3,bg:BG2,bd:BDX}].map(c => (
              <div key={c.label} style={{ background:'white', border:`1px solid ${c.bd}`, borderRadius:10, padding:'14px 8px', textAlign:'center' }}>
                <div style={{ fontSize:26, fontWeight:800, color:c.fg }}>{c.value}</div>
                <div style={{ fontSize:10, color:c.fg, fontWeight:600, marginTop:3 }}>{c.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:TX2, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>Subject Performance</div>
          {Object.entries(r.topicMap).map(([name, t]) => {
            const tt = t.correct+t.wrong+t.unattempted
            const pct = tt>0?Math.round((t.correct/tt)*100):0
            const fg = pct>=60?G:pct>=40?A:R, bar = pct>=60?GB:pct>=40?AB:RB
            return (
              <div key={name} style={{ background:'white', borderRadius:10, padding:'14px 16px', marginBottom:8, border:`1px solid ${BDX}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:TX1 }}>{name}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:fg }}>{pct}%</span>
                </div>
                <div style={{ display:'flex', gap:5, marginBottom:8 }}>
                  {[{v:t.correct,c:G,bg:GL,bd:GB,s:'✓'},{v:t.wrong,c:R,bg:RL,bd:RB,s:'✗'},{v:t.unattempted,c:TX3,bg:BG2,bd:BDX,s:'—'}].map(x=>(
                    <span key={x.s} style={{ fontSize:10, color:x.c, background:x.bg, padding:'2px 8px', borderRadius:20, border:`1px solid ${x.bd}` }}>{x.s} {x.v}</span>
                  ))}
                </div>
                <div style={{ height:4, background:BG2, borderRadius:2 }}><div style={{ height:'100%', width:`${pct}%`, background:bar, borderRadius:2 }}/></div>
              </div>
            )
          })}
        </div>
        <div style={{ flexShrink:0, padding:'12px 16px 20px', borderTop:`1px solid ${BDX}`, background:'white' }}>
          <button onClick={() => navigate('livetest')} style={{ ...gPrim({ width:'100%', padding:'12px', fontSize:13 }) }}>Back to Live Tests</button>
        </div>
      </div>
    )
  }

  // ── Main test screen ─────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'white' }}>

      {/* Navy header */}
      <div style={{ flexShrink:0, background:NAVY }}>

        {/* Status bar */}
        <div style={{ padding:'10px 14px 4px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, fontWeight:600, color:'white' }}>9:41</span>
          <div style={{ display:'flex', gap:6, alignItems:'center', color:'white' }}>
            <svg width="16" height="11" viewBox="0 0 30 20" fill="currentColor"><rect x="0" y="8" width="4" height="12" rx="1" opacity="0.6"/><rect x="7" y="5" width="4" height="15" rx="1" opacity="0.75"/><rect x="14" y="2" width="4" height="18" rx="1" opacity="0.9"/><rect x="21" y="0" width="4" height="20" rx="1"/></svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="white"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="white" opacity="0.5"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="white"/></svg>
          </div>
        </div>

        {/* Title + global timer */}
        <div style={{ padding:'4px 12px 8px', display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={() => setShowExitConfirm(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.8)', fontSize:18, lineHeight:1, padding:0, flexShrink:0 }}>✕</button>
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'white' }}>{test?.name||'AIIMS NORCET'}</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, marginTop:1 }}>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.6)' }}>Total Time Remaining:</span>
              <span style={{ fontSize:14, fontWeight:900, color: totalTimeLeft<=300?'#ff8080':'#ffcc44', letterSpacing:'0.05em', fontVariantNumeric:'tabular-nums' }}>{timerStr}</span>
            </div>
          </div>
          <button onClick={() => { setGridSec(curSec); setShowGrid(true) }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.8)', flexShrink:0, display:'flex', padding:0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
        </div>

        {/* Candidate bar */}
        <div style={{ background:'rgba(0,0,0,0.22)', padding:'6px 14px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:40, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:700, color:'white', flexShrink:0 }}>A</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'white' }}>Anant Trivedi</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)' }}>Roll No: 10024156 · Nursing Officer</div>
          </div>
          <div style={{ fontSize:11, textAlign:'right', flexShrink:0 }}>
            <span style={{ color:'#7fff88', fontWeight:700 }}>+{cm}</span>
            <span style={{ color:'rgba(255,255,255,0.45)' }}> / </span>
            <span style={{ color:'#ff8080', fontWeight:700 }}>{wm}</span>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{ display:'flex', overflowX:'auto', borderTop:'1px solid rgba(255,255,255,0.15)', scrollbarWidth:'none' }}>
          {SECTIONS.map((sec, i) => {
            const isAct = i===curSec, isLk = sectionLocked[i], st = sectionTimers[i]
            return (
              <div key={sec.id} onClick={() => { setCurSec(i); setCurQLocal(0) }} style={{
                flexShrink:0, padding:'6px 12px 7px', cursor:'pointer',
                borderRight:'1px solid rgba(255,255,255,0.1)',
                borderBottom: isAct?'2.5px solid #ffcc44':'2.5px solid transparent',
                background: isAct?'rgba(255,255,255,0.12)':isLk?'rgba(0,0,0,0.18)':'transparent',
              }}>
                <div style={{ fontSize:11, fontWeight:isAct?700:500, color:isLk?'rgba(255,255,255,0.35)':'white', whiteSpace:'nowrap' }}>
                  {sec.id}: {sec.name.length>14?sec.name.slice(0,14)+'…':sec.name}
                </div>
                <div style={{ fontSize:10, marginTop:1, fontVariantNumeric:'tabular-nums', color:isLk?'#ff8080':st<=120?'#ffcc44':'rgba(255,255,255,0.5)' }}>
                  {isLk?'Locked':`⏱ ${fmtSec(st)}`}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Question body */}
      <div className="scroll" style={{ flex:1, paddingBottom:116 }}>

        {isLocked && (
          <div style={{ background:WRN_BG, border:`1px solid ${WRN_BD}`, color:WRN_C, padding:'8px 16px', fontSize:12, lineHeight:1.5 }}>
            This section's time has expired. You can review your answers but cannot modify them.
          </div>
        )}

        {/* Question header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px 8px', borderBottom:'1px solid #eee' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:13, fontWeight:700, color:T1 }}>Question No. {curQLocal+1}</span>
            {isMarked && <span style={{ fontSize:10, fontWeight:700, background:'#f0e8ff', color:PURP, border:`1px solid ${PURP}55`, padding:'2px 7px', borderRadius:20 }}>★ Marked</span>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:11, color:T3 }}>Marks:</span>
            <span style={{ fontSize:11, fontWeight:700, color:GRUN }}>+{cm}</span>
            <span style={{ fontSize:11, color:T3 }}>/</span>
            <span style={{ fontSize:11, fontWeight:700, color:DIAM }}>−{Math.abs(wm)}</span>
            <button onClick={() => setShowReport(true)} style={{ background:'none', border:'none', cursor:'pointer', color:T3, fontSize:10, display:'flex', alignItems:'center', gap:2, paddingLeft:6, paddingRight:0 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Report
            </button>
          </div>
        </div>

        {/* Question text */}
        <div style={{ padding:'14px 16px 12px', fontSize:14, color:T1, lineHeight:1.75 }}>{q?.text}</div>

        {/* Image */}
        {q?.visual && (
          <div style={{ position:'relative', borderTop:'1px solid #eee', borderBottom:'1px solid #eee', background:'#f8f8f8', height:200, overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, overflow:imageZoom>1?'auto':'hidden' }}>
              <img src={q.visual} alt="" style={{ display:'block', width:imageZoom>1?`${imageZoom*100}%`:'100%', height:imageZoom>1?'auto':'100%', objectFit:imageZoom>1?undefined:'contain', minHeight:imageZoom>1?'100%':undefined }} />
            </div>
            {imageZoom>1 && <div style={{ position:'absolute', top:8, left:8, padding:'2px 7px', borderRadius:4, background:'rgba(255,255,255,0.92)', border:'1px solid #ddd', fontSize:10, fontWeight:700, color:T2, pointerEvents:'none', zIndex:1 }}>{imageZoom}×</div>}
            <button onClick={() => setImageZoom(z => z>=2?1:parseFloat((z+0.5).toFixed(1)))} style={{ position:'absolute', bottom:8, right:8, zIndex:1, width:32, height:32, borderRadius:4, background:'rgba(255,255,255,0.94)', border:'1px solid #ddd', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              {imageZoom<2
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              }
            </button>
          </div>
        )}

        {/* Options — NORCET (A)(B)(C)(D) radio style */}
        <div>
          {q?.options.map((opt, oi) => {
            const isSel = selected===opt.id
            return (
              <div key={opt.id} onClick={() => handleAnswer(opt.id)} style={{
                display:'flex', alignItems:'flex-start', gap:10, padding:'11px 16px',
                borderBottom: oi<q.options.length-1?'1px solid #f0f0f0':'none',
                cursor: isLocked?'default':'pointer',
                background: isSel?'#eaf5ec':'white',
              }}>
                <input type="radio" readOnly checked={isSel} disabled={isLocked} style={{ marginTop:3, cursor:isLocked?'default':'pointer', accentColor:NAVY, flexShrink:0 }} />
                <div style={{ flex:1, fontSize:14, lineHeight:1.6, color:isSel?NAVY:T1 }}>
                  <span style={{ fontWeight:700 }}>({String.fromCharCode(65+oi)}) </span>{opt.text}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:BG, borderTop:'1px solid #bbb', padding:'8px 12px 14px' }}>
        <div style={{ display:'flex', gap:6, marginBottom:6 }}>
          <button onClick={handleMarkNext} disabled={isLocked} style={{ ...gBtn({ flex:1, background:isMarked?'linear-gradient(#ede0ff,#c9a8f5)':undefined, color:isMarked?PURP:T1, opacity:isLocked?0.45:1 }) }}>
            {isMarked?'★ Marked for Review':'Mark for Review & Next'}
          </button>
          <button onClick={handleClear} disabled={isLocked} style={{ ...gBtn({ opacity:isLocked?0.45:1 }) }}>Clear Response</button>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={goPrev} disabled={curSec===0&&curQLocal===0} style={{ ...gBtn({ flex:1, opacity:(curSec===0&&curQLocal===0)?0.4:1 }) }}>« Previous</button>
          <button onClick={handleSaveNext} style={{ ...gPrim({ flex:2, fontSize:13 }) }}>{isLastQ?'Submit Exam':'Save & Next »'}</button>
        </div>
      </div>

      {/* Question Palette overlay */}
      {showGrid && (
        <div className="overlay" onClick={() => setShowGrid(false)}>
          <div className="sheet" style={{ maxHeight:'84%' }} onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ background:NAVY, padding:'10px 16px 12px', flexShrink:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'white' }}>Question Palette</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', marginTop:2 }}>{counts.answered} answered · {counts.notanswered} not answered · {counts.notvisited} not visited</div>
            </div>
            {/* Legend */}
            <div style={{ padding:'10px 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 10px', borderBottom:`1px solid ${BD}`, flexShrink:0, background:'white' }}>
              {[['answered','Answered'],['notanswered','Not Answered'],['notvisited','Not Visited'],['marked','Marked for Review'],['answeredmarked','Answered & Marked']].map(([st, label], li) => (
                <div key={st} style={{ display:'flex', alignItems:'center', gap:6, gridColumn:li===4?'1 / span 2':undefined }}>
                  <QShape status={st} num="" size={22} />
                  <span style={{ fontSize:11, color:T2 }}>{label}</span>
                </div>
              ))}
            </div>
            {/* Section tabs */}
            <div style={{ display:'flex', overflowX:'auto', borderBottom:`1px solid ${BD}`, background:BG, flexShrink:0, scrollbarWidth:'none' }}>
              {SECTIONS.map((sec, i) => (
                <div key={sec.id} onClick={() => setGridSec(i)} style={{
                  flexShrink:0, padding:'7px 12px', cursor:'pointer', whiteSpace:'nowrap',
                  fontSize:11, fontWeight:gridSec===i?700:500, color:gridSec===i?NAVY:T2,
                  borderBottom:gridSec===i?`2px solid ${NAVY}`:'2px solid transparent',
                }}>
                  {sec.id}: {sec.name.length>14?sec.name.slice(0,14)+'…':sec.name}
                </div>
              ))}
            </div>
            <div className="scroll" style={{ flex:1, padding:'12px 16px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, justifyItems:'center' }}>
                {SECTIONS[gridSec].qIdxs.map((gIdx, localIdx) => (
                  <QShape key={gIdx} status={getStatus(gIdx)} num={localIdx+1} isCurrent={gridSec===curSec&&localIdx===curQLocal} size={36}
                    onClick={() => { setCurSec(gridSec); setCurQLocal(localIdx); setShowGrid(false) }} />
                ))}
              </div>
            </div>
            <div style={{ padding:'10px 16px 20px', borderTop:`1px solid ${BD}`, flexShrink:0, display:'flex', gap:8 }}>
              <button onClick={() => setShowGrid(false)} style={{ ...gBtn({ flex:1 }) }}>Resume</button>
              <button onClick={() => { setShowGrid(false); setShowSubmitConfirm(true) }} style={{ ...gPrim({ flex:2 }) }}>Submit Exam</button>
            </div>
          </div>
        </div>
      )}

      {/* Submit confirm */}
      {showSubmitConfirm && (
        <div className="popup-overlay">
          <div className="popup" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ background:NAVY, padding:'11px 16px' }}>
              <div style={{ fontSize:14, fontWeight:700, color:'white', textAlign:'center' }}>Submit Exam</div>
            </div>
            <div style={{ padding:'12px 16px 4px', fontSize:13, color:T1, lineHeight:1.6 }}>
              Are you sure? Once submitted, you cannot make changes.
            </div>
            <div style={{ margin:'8px 16px', background:BG, border:`1px solid ${BD}` }}>
              {[['Answered',counts.answered,GRUN],['Not Answered',counts.notanswered,DIAM],['Marked for Review',counts.marked,PURP],['Answered & Marked',counts.answeredmarked,PURP],['Not Visited',counts.notvisited,T3],['Total Questions',QUESTIONS.length,T1]].map(([label,value,color]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 12px', borderBottom:`1px solid ${BD}` }}>
                  <span style={{ fontSize:12, color:T2 }}>{label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:'10px 16px 16px', display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button onClick={() => setShowSubmitConfirm(false)} style={{ ...gBtn() }}>Cancel</button>
              <button onClick={handleSubmit} style={{ ...gDngr() }}>Yes, Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Exit confirm */}
      {showExitConfirm && (
        <div className="popup-overlay">
          <div className="popup">
            <div style={{ fontSize:15, fontWeight:700, color:T1, marginBottom:10 }}>Exit Exam?</div>
            <div style={{ fontSize:13, color:T2, lineHeight:1.7, marginBottom:20 }}>Your responses will be saved. You can return anytime within the live test window.</div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowExitConfirm(false)} style={{ ...gBtn({ flex:1 }) }}>Continue</button>
              <button onClick={() => { setShowExitConfirm(false); navigate('livetest') }} style={{ ...gDngr({ flex:1 }) }}>Exit</button>
            </div>
          </div>
        </div>
      )}

      {/* Report issue */}
      {showReport && (
        <div className="overlay" onClick={() => { setShowReport(false); setReportSubmitted(false); setReportSubs(new Set()); setReportNote('') }}>
          <div className="sheet" style={{ maxHeight:'88%' }} onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            {reportSubmitted ? (
              <div style={{ padding:'30px 20px 40px', textAlign:'center' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:GRUN_L, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:24, color:GRUN }}>✓</div>
                <div style={{ fontSize:15, fontWeight:700, color:T1, marginBottom:6 }}>Report submitted</div>
                <div style={{ fontSize:13, color:T2 }}>Our team will review this question.</div>
                <button onClick={() => { setShowReport(false); setReportSubmitted(false); setReportSubs(new Set()); setReportNote('') }} style={{ ...gPrim({ marginTop:20, width:'100%', padding:'12px', borderRadius:2 }) }}>Done</button>
              </div>
            ) : (
              <>
                <div style={{ padding:'14px 20px 10px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${BD}`, flexShrink:0 }}>
                  <span style={{ fontSize:16, fontWeight:700, color:T1 }}>Report an Issue</span>
                  <button onClick={() => setShowReport(false)} style={{ background:'none', border:'none', fontSize:22, color:T3, cursor:'pointer' }}>×</button>
                </div>
                <div className="scroll" style={{ flex:1, padding:'16px 20px 30px' }}>
                  <div style={{ display:'flex', gap:16, marginBottom:18 }}>
                    {['technical','content'].map(type => (
                      <label key={type} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                        <input type="radio" name="rtype" checked={reportType===type} onChange={() => { setReportType(type); setReportSubs(new Set()) }} style={{ width:18, height:18, accentColor:NAVY }} />
                        <span style={{ fontSize:13, fontWeight:600, color:T1 }}>{type==='technical'?'Technical':'Content'}</span>
                      </label>
                    ))}
                  </div>
                  {REPORT_OPTIONS[reportType].map(opt => (
                    <label key={opt} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:'1px solid #f0f0f0', cursor:'pointer' }}>
                      <input type="checkbox" checked={reportSubs.has(opt)} onChange={() => setReportSubs(prev => { const n=new Set(prev); n.has(opt)?n.delete(opt):n.add(opt); return n })} style={{ width:18, height:18, accentColor:NAVY, flexShrink:0 }} />
                      <span style={{ fontSize:13, color:T1 }}>{opt}</span>
                    </label>
                  ))}
                  <textarea value={reportNote} onChange={e => setReportNote(e.target.value)} placeholder="Describe the issue… (optional)" style={{ width:'100%', minHeight:72, padding:'10px 12px', border:`1px solid ${BD}`, borderRadius:4, fontSize:13, color:T1, resize:'none', fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginTop:14, marginBottom:16 }} />
                  <button onClick={() => setReportSubmitted(true)} disabled={reportSubs.size===0} style={{ width:'100%', padding:'12px', background:reportSubs.size===0?BG:NAVY, color:reportSubs.size===0?T3:'white', border:'none', fontSize:14, fontWeight:700, cursor:reportSubs.size===0?'not-allowed':'pointer', borderRadius:2 }}>Submit Report</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
