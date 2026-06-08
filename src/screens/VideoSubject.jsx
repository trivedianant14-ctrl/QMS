import { useState } from 'react'
import { VIDEO_CHAPTERS } from '../data'

const P='#534AB7', PL='#EEEDFE', PD='#3C3489'
const T1='#1a1a2e', T2='#5a5a78', T3='#9898b0', BD='#e8e8f2', BG2='#f5f5fb'
const GREEN='#3B6D11', GREENBG='#EAF3DE'

export default function VideoSubject({ navigate, setCurrentVideo }) {
  const [expandedChapter, setExpandedChapter] = useState(null)
  const [showTutorModal, setShowTutorModal] = useState(false)
  const [playingVideo, setPlayingVideo] = useState(VIDEO_CHAPTERS[0]?.videos[0] || null)
  const [playingChapter, setPlayingChapter] = useState(VIDEO_CHAPTERS[0] || null)

  const chapters = VIDEO_CHAPTERS

  const handlePlayVideo = (chapter, video) => {
    setPlayingVideo(video)
    setPlayingChapter(chapter)
  }

  const watchedCount = (ch) => ch.videos.filter(v => v.watched).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

      {/* Status bar */}
      <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>9:41</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: T2 }}>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: '4px 16px 10px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <button onClick={() => navigate('videos')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: T1, flex: 1 }}>Video Lectures</span>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2, display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2, display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
      </div>

      {/* Video player area */}
      <div
        onClick={() => { setCurrentVideo(playingVideo); navigate('videoplayer') }}
        style={{ background: '#0d0d1a', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
      >
        {/* Controls overlay */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>10</span>
          </button>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}><polygon points="5,3 19,12 5,21"/></svg>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>10</span>
          </button>
        </div>
        {/* Top icons */}
        <div style={{ position: 'absolute', top: 10, right: 12, display: 'flex', gap: 12 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, padding: '2px 6px', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 4 }}>CC</button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </button>
        </div>
        {/* Progress bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.15)' }}>
          <div style={{ height: 3, width: '0%', background: P }} />
        </div>
        {/* Tap to open hint */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(255,255,255,0.12)', borderRadius: 6, padding: '3px 8px' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Tap to open player</span>
        </div>
      </div>

      {/* Now Playing info */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Now Playing</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 1 }}>{playingVideo?.title || '—'}</div>
            <div style={{ fontSize: 11, color: T3 }}>00:00 / {playingVideo?.duration || '—'}</div>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, display: 'flex', marginTop: 2 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>

        {/* Instructor card */}
        <button onClick={() => setShowTutorModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: PL, border: `1px solid ${P}22`, borderRadius: 12, padding: '10px 12px', marginTop: 10, cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: P, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>A</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Aman Singhal</div>
            <div style={{ fontSize: 11, color: T2, marginTop: 1 }}>Faculty · Applied Anatomy</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: P, display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            About
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </button>
      </div>

      {/* Chapters list */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '12px 14px 4px' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chapters</span>
        </div>

        {chapters.map((ch, idx) => {
          const watched = watchedCount(ch)
          const isExpanded = expandedChapter === ch.id
          const isPlaying = playingChapter?.id === ch.id

          return (
            <div key={ch.id} style={{ borderBottom: `1px solid ${BD}` }}>
              {/* Chapter row */}
              <button
                onClick={() => setExpandedChapter(isExpanded ? null : ch.id)}
                style={{ width: '100%', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, background: isPlaying ? PL : 'white', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: isPlaying ? P : T3, minWidth: 20 }}>{idx + 1}.</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: isPlaying ? PD : T1 }}>{ch.name}</span>
                <span style={{ fontSize: 11, color: T3, marginRight: 4 }}>{watched}/{ch.videos.length}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5">
                  {isExpanded ? <path d="M18 15l-6-6-6 6"/> : <path d="M6 9l6 6 6-6"/>}
                </svg>
              </button>

              {/* Expanded video list */}
              {isExpanded && (
                <div style={{ background: BG2 }}>
                  {ch.videos.map((v, vi) => {
                    const isActive = playingVideo?.id === v.id
                    return (
                      <button
                        key={v.id}
                        onClick={() => { handlePlayVideo(ch, v); setCurrentVideo(v); navigate('videoplayer') }}
                        style={{ width: '100%', padding: '10px 14px 10px 44px', display: 'flex', alignItems: 'center', gap: 10, background: isActive ? PL : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderTop: `1px solid ${BD}` }}
                      >
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: isActive ? P : v.watched ? GREENBG : 'white', border: `1px solid ${isActive ? P : v.watched ? '#97C459' : BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isActive
                            ? <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                            : v.watched
                              ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                              : <span style={{ fontSize: 10, fontWeight: 600, color: T3 }}>{vi + 1}</span>
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? PD : T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                          <div style={{ fontSize: 11, color: T3, marginTop: 1 }}>{v.duration}</div>
                        </div>
                        <button onClick={e => e.stopPropagation()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, display: 'flex', padding: 4 }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </button>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {/* Tutor modal */}
      {showTutorModal && (
        <div onClick={() => setShowTutorModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '0 20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 22, padding: '24px 20px 20px', width: '100%', position: 'relative' }}>

            {/* Close */}
            <button onClick={() => setShowTutorModal(false)} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: '50%', background: BG2, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {/* Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${P}, #8B82E0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, boxShadow: `0 4px 16px rgba(83,74,183,0.25)` }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>A</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: T1 }}>Aman Singhal</div>
              <div style={{ fontSize: 12, color: T3, marginTop: 3 }}>MBBS · Faculty, Applied Anatomy</div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
              {[['5', 'Subjects'], ['25', 'Lectures'], ['12K', 'Students']].map(([val, label]) => (
                <div key={label} style={{ flex: 1, background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: PD }}>{val}</div>
                  <div style={{ fontSize: 10, color: T3, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Bio */}
            <div style={{ fontSize: 12, color: T2, lineHeight: 1.65, marginBottom: 16, background: BG2, borderRadius: 12, padding: '12px 14px' }}>
              8+ years of teaching experience in Applied Anatomy for nursing and paramedical students. Known for simplifying complex concepts with clinical correlations and high-yield exam strategies.
            </div>

            {/* CTA */}
            <button onClick={() => setShowTutorModal(false)} className="btn-primary" style={{ width: '100%', fontSize: 13 }}>
              Got it
            </button>

          </div>
        </div>
      )}

    </div>
  )
}
