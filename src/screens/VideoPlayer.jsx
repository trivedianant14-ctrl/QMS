import { useState } from 'react'

const P='#534AB7', PL='#EEEDFE', PD='#3C3489'
const T1='#1a1a2e', T2='#5a5a78', T3='#9898b0', BD='#e8e8f2', BG2='#f5f5fb'
const GREEN='#3B6D11', GREENBG='#EAF3DE'

const Toggle = ({ value, onChange }) => (
  <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, background: value ? P : BD, position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
  </div>
)

const ACTIONS = [
  {
    id: 'timestamp',
    label: 'Time\nStamp',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="9"/>
        <polyline points="12,7 12,12 15,14"/>
        <line x1="12" y1="3" x2="12" y2="1"/>
      </svg>
    ),
  },
  {
    id: 'save',
    label: 'Save',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? P : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    id: 'complete',
    label: 'Mark as\nComplete',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {active
          ? <><circle cx="12" cy="12" r="10" fill={PL} stroke={P}/><polyline points="7,12 10,15 17,9" stroke={P}/></>
          : <polyline points="20,6 9,17 4,12"/>}
      </svg>
    ),
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="13" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    id: 'share',
    label: 'Share',
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
  },
  {
    id: 'practice',
    label: 'Practice',
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5"/>
      </svg>
    ),
  },
]

export default function VideoPlayer({ navigate, currentVideo }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoNext, setAutoNext] = useState(true)
  const [markedComplete, setMarkedComplete] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [speed, setSpeed] = useState('1x')
  const [subtitles, setSubtitles] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [inQueue, setInQueue] = useState(true)
  const [queueExpanded, setQueueExpanded] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [showTimestamp, setShowTimestamp] = useState(false)
  const [timestampNote, setTimestampNote] = useState('')

  const title = currentVideo?.title || 'Introduction to Anatomical Terms'
  const duration = currentVideo?.duration || '12:00'

  const handleAction = (id) => {
    if (id === 'complete') setMarkedComplete(c => !c)
    if (id === 'save') setSaved(s => !s)
    if (id === 'practice') navigate('subject')
    if (id === 'timestamp') setShowTimestamp(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative' }}>

      {/* ── VIDEO AREA — full 16:9 YouTube-style ── */}
      <div
        onClick={() => setShowControls(c => !c)}
        style={{ background: '#0d0d1a', flexShrink: 0, position: 'relative', width: '100%', aspectRatio: '16/9', cursor: 'pointer', overflow: 'hidden' }}
      >
        {/* Top gradient */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '38%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)', pointerEvents: 'none', opacity: showControls ? 1 : 0, transition: 'opacity 0.22s ease' }} />
        {/* Bottom gradient */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '42%', background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)', pointerEvents: 'none' }} />

        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: showControls ? 1 : 0, transition: 'opacity 0.22s ease', pointerEvents: showControls ? 'auto' : 'none' }}>
          <button onClick={e => { e.stopPropagation(); navigate('videosubject') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', padding: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
          </button>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={e => e.stopPropagation()} style={{ fontSize: 11, fontWeight: 700, padding: '3px 7px', borderRadius: 5, border: '1.5px solid rgba(255,255,255,0.5)', background: 'none', color: 'rgba(255,255,255,0.9)', cursor: 'pointer' }}>CC</button>
            <button onClick={e => { e.stopPropagation(); setShowSettings(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </button>
          </div>
        </div>

        {/* Centre playback controls */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: 36, opacity: showControls ? 1 : 0, transition: 'opacity 0.22s ease', pointerEvents: showControls ? 'auto' : 'none' }}>
          <button onClick={e => e.stopPropagation()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>10</span>
          </button>
          <button onClick={e => { e.stopPropagation(); setIsPlaying(p => !p) }} style={{ width: 62, height: 62, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {isPlaying
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}><polygon points="5,3 19,12 5,21"/></svg>}
          </button>
          <button onClick={e => e.stopPropagation()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>10</span>
          </button>
        </div>

        {/* Bottom bar: time + scrubber + PiP */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 12px 10px' }}>
          {/* Time row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, opacity: showControls ? 1 : 0, transition: 'opacity 0.22s ease', pointerEvents: showControls ? 'auto' : 'none' }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>3:36</span>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{duration}</span>
              <button onClick={e => e.stopPropagation()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', display: 'flex' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="12" y="10" width="9" height="6" rx="1" fill="rgba(255,255,255,0.15)" stroke="currentColor"/></svg>
              </button>
            </div>
          </div>
          {/* Progress bar + scrubber */}
          <div style={{ position: 'relative', height: 14, display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, height: showControls ? 3 : 2, background: 'rgba(255,255,255,0.25)', borderRadius: 2, transition: 'height 0.15s' }}>
              <div style={{ height: '100%', width: '30%', background: P, borderRadius: 2 }} />
            </div>
            {showControls && (
              <div style={{ position: 'absolute', left: 'calc(30% - 6px)', width: 12, height: 12, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.5)', transition: 'opacity 0.22s ease', pointerEvents: 'none' }} />
            )}
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>

        {/* Title + meta */}
        <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid ${BD}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T1, lineHeight: 1.3, marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 11, color: T3 }}>Applied Anatomy · Ch 1 · {duration}</div>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, display: 'flex', marginTop: 2, flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </div>
          {/* Auto-Next row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2" strokeLinecap="round"><polygon points="5,4 15,12 5,20"/><line x1="19" y1="4" x2="19" y2="20"/></svg>
              <span style={{ fontSize: 12, color: T2, fontWeight: 500 }}>Auto-Next</span>
            </div>
            <Toggle value={autoNext} onChange={setAutoNext} />
          </div>
        </div>

        {/* ── ACTION BAR ── */}
        <div style={{ padding: '12px 6px', borderBottom: `1px solid ${BD}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {ACTIONS.map(a => {
              const active = (a.id === 'complete' && markedComplete) || (a.id === 'save' && saved)
              return (
                <button key={a.id} onClick={() => handleAction(a.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: active ? P : T2, minWidth: 44, padding: '2px 0' }}>
                  <div style={{ color: active ? P : T2 }}>{a.icon(active)}</div>
                  <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 400, color: active ? P : T3, textAlign: 'center', lineHeight: 1.3, whiteSpace: 'pre-line' }}>{a.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── IN QUEUE ── */}
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BD}` }}>
          <button onClick={() => setQueueExpanded(e => !e)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: queueExpanded ? 10 : 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>In Queue</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round"
              style={{ transition: 'transform 0.2s', transform: queueExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
          {queueExpanded && (inQueue ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: BG2, borderRadius: 10, border: `1px solid ${BD}` }}>
              <div style={{ width: 36, height: 26, background: '#1a1a2e', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Directional Terminology</div>
                <div style={{ fontSize: 11, color: T3, marginTop: 1 }}>10:45 · Up next</div>
              </div>
              <button onClick={e => { e.stopPropagation(); setInQueue(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, display: 'flex', padding: 4, fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: T3, paddingTop: 4 }}>Queue is empty</div>
          ))}
        </div>

        {/* ── CONTINUE WHERE YOU LEFT OFF ── */}
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BD}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: PL, border: `1.5px solid ${P}30`, borderRadius: 12 }}>
            <div style={{ width: 34, height: 26, background: PD, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: PD, fontWeight: 600, marginBottom: 5 }}>Continue where you left off</div>
              <div style={{ height: 3, background: 'rgba(83,74,183,0.15)', borderRadius: 2 }}>
                <div style={{ height: 3, width: '30%', background: P, borderRadius: 2 }} />
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: P, flexShrink: 0 }}>30%</span>
          </div>
        </div>

        {/* ── REPORT ISSUE ── */}
        <div style={{ padding: '14px 16px 24px' }}>
          <button style={{ width: '100%', padding: '13px', background: GREENBG, border: `1.5px solid #A5D6A7`, borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: GREEN, textAlign: 'center' }}>
            Having an issue? Click here to report it
          </button>
        </div>

      </div>

      {/* ── TIMESTAMP POPUP ── */}
      {showTimestamp && (
        <div onClick={() => setShowTimestamp(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '0 20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 18, padding: '20px 18px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12,7 12,12 15,14"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Add Time Stamp</div>
                  <div style={{ fontSize: 11, color: T3 }}>at 3:42</div>
                </div>
              </div>
              <button onClick={() => setShowTimestamp(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, fontSize: 20, lineHeight: 1 }}>×</button>
            </div>
            <textarea
              value={timestampNote}
              onChange={e => setTimestampNote(e.target.value)}
              placeholder="Add a note for this moment… (optional)"
              style={{ width: '100%', minHeight: 72, padding: '10px 12px', border: `1px solid ${BD}`, borderRadius: 10, fontSize: 12, color: T1, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowTimestamp(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${BD}`, background: 'white', fontSize: 13, fontWeight: 600, color: T2, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => setShowTimestamp(false)} className="btn-primary" style={{ flex: 2, fontSize: 13 }}>Save Stamp</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS SHEET ── */}
      {showSettings && (
        <div className="overlay" onClick={() => setShowSettings(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ padding: '14px 20px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Settings</span>
                <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: T3, cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 10 }}>Video Speed</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['0.5x', '1x', '1.25x', '1.5x', '2x'].map(s => (
                    <button key={s} onClick={() => setSpeed(s)} style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: `1.5px solid ${speed === s ? P : BD}`, background: speed === s ? PL : 'white', color: speed === s ? PD : T2, fontSize: 12, fontWeight: speed === s ? 700 : 400, cursor: 'pointer' }}>{s}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: `1px solid ${BD}`, marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>Quality</span>
                <span style={{ fontSize: 13, color: T2 }}>Auto ↓</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: `1px solid ${BD}`, marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>Subtitles</span>
                <Toggle value={subtitles} onChange={setSubtitles} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>Dark Mode</span>
                <Toggle value={darkMode} onChange={setDarkMode} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
