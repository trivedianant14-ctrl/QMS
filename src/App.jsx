import { useState, useRef } from 'react'
import Home from './screens/Home'
import Subject from './screens/Subject'
import PreTest from './screens/PreTest'
import Solve from './screens/Solve'
import Result from './screens/Result'
import Saved from './screens/Saved'
import Summary from './screens/Summary'
import Videos from './screens/Videos'
import VideoSubject from './screens/VideoSubject'
import VideoPlayer from './screens/VideoPlayer'
import LiveTest from './screens/LiveTest'
import LiveTestPreTest from './screens/LiveTestPreTest'
import LiveTestSolve from './screens/LiveTestSolve'
import { QUESTIONS } from './data'

const SCREEN_DEPTH = {
  home: 0,
  subject: 1, videos: 1, saved: 1, livetest: 1,
  pretest: 2, videosubject: 2, livetestpretest: 2,
  solve: 3, videoplayer: 3, livetestsolve: 3,
  summary: 4, result: 4,
}

const EXISTING_USER_SAVES = [
  { qId: 1, tag: 'wrong' },
  { qId: 3, tag: 'important' },
  { qId: 5, tag: 'tricky' },
  { qId: 2, tag: 'revision' },
]

export default function App() {
  const [screen, setScreen] = useState('livetest')
  const [currentLiveTest, setCurrentLiveTest] = useState(null)
  const [mode, setMode] = useState('guide')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timerPerQ, setTimerPerQ] = useState(60)
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [isNewUser, setIsNewUser] = useState(true)
  const [savedQs, setSavedQs] = useState([])
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [showReattemptConfirm, setShowReattemptConfirm] = useState(false)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [sessions, setSessions] = useState([])
  const [isReattempt, setIsReattempt] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [savedVideos, setSavedVideos] = useState([])
  const [savedResources, setSavedResources] = useState([])
  const [liveTestVariant, setLiveTestVariant] = useState('cta')
  const animDirRef = useRef('forward')

  const goTo = (next) => {
    const currDepth = SCREEN_DEPTH[screen] ?? 0
    const nextDepth = SCREEN_DEPTH[next] ?? 0
    if (next === 'result' || next === 'summary') {
      animDirRef.current = 'up'
    } else if (next === 'solve') {
      animDirRef.current = 'forward'
    } else if (nextDepth >= currDepth) {
      animDirRef.current = 'forward'
    } else {
      animDirRef.current = 'backward'
    }
    setScreen(next)
  }

  const toggleUserMode = () => {
    const switchingToExisting = isNewUser
    setIsNewUser(prev => !prev)
    setSavedQs(switchingToExisting ? EXISTING_USER_SAVES : [])
    setBannerDismissed(false)
  }

  const navigate = goTo

  const startAttempt = (selectedMode) => {
    setMode(selectedMode)
    setCurrentQ(0)
    setAnswers({})
    setIsReviewMode(false)
    setAttemptCount(c => c + 1)
    goTo('solve')
  }

  const saveQuestion = (qId, tag) => {
    setSavedQs(prev => {
      const exists = prev.find(s => s.qId === qId)
      if (exists) return prev.map(s => s.qId === qId ? { ...s, tag } : s)
      return [...prev, { qId, tag }]
    })
  }

  const unsaveQuestion = (qId) => {
    setSavedQs(prev => prev.filter(s => s.qId !== qId))
  }

  const submitTest = () => {
    const correct = QUESTIONS.filter(q => answers[q.id] === q.correct).length
    const total = QUESTIONS.length
    const accuracy = Math.round((correct / total) * 100)
    const hasFirstAttempt = sessions.some(s => s.chapterId === 1)
    if (!hasFirstAttempt) {
      setSessions(prev => [...prev, {
        id: Date.now(),
        chapterId: 1,
        chapterName: 'Anatomical Terms',
        subjectName: 'Applied Anatomy',
        mode,
        answers: { ...answers },
        correct,
        total,
        accuracy,
        completedAt: Date.now(),
      }])
      setIsReattempt(false)
    } else {
      setIsReattempt(true)
    }
    goTo('result')
  }

  const viewAnalysis = () => {
    const firstSession = sessions.find(s => s.chapterId === 1)
    if (firstSession) setAnswers(firstSession.answers)
    setIsReattempt(false)
    goTo('result')
  }

  const handleReattempt = () => {
    setShowReattemptConfirm(false)
    setCurrentQ(0)
    setAnswers({})
    setIsReviewMode(false)
    setAttemptCount(c => c + 1)
    goTo('solve')
  }

  const saveVideo = (v) => setSavedVideos(prev => prev.some(x => x.id === v.id) ? prev : [...prev, v])
  const unsaveVideo = (id) => setSavedVideos(prev => prev.filter(v => v.id !== id))
  const saveResource = (r) => setSavedResources(prev => prev.some(x => x.id === r.id) ? prev : [...prev, r])
  const unsaveResource = (id) => setSavedResources(prev => prev.filter(r => r.id !== id))

  const viewSolution = () => {
    setIsReviewMode(true)
    setCurrentQ(0)
    goTo('solve')
  }

  // Derived stats from real sessions
  const todayStr = new Date().toDateString()
  const todayQs = sessions
    .filter(s => new Date(s.completedAt).toDateString() === todayStr)
    .reduce((sum, s) => sum + s.total, 0)
  const overallAcc = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length)
    : 0
  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null

  const sharedProps = {
    navigate, mode, setMode,
    currentQ, setCurrentQ,
    answers, setAnswers,
    timerPerQ, setTimerPerQ,
    autoAdvance, setAutoAdvance,
    isReviewMode,
    isNewUser, toggleUserMode,
    savedQs, saveQuestion, unsaveQuestion,
    bannerDismissed, setBannerDismissed,
    startAttempt, submitTest,
    showReattemptConfirm, setShowReattemptConfirm,
    handleReattempt, viewSolution,
    sessions, todayQs, overallAcc, lastSession,
    isReattempt, viewAnalysis,
    attemptCount,
    savedVideos, unsaveVideo, savedResources, unsaveResource,
  }

  const VARIANTS = [
    { id: 'cta', label: 'Calendar CTA', desc: 'Card link → date list view', icon: '📅' },
    { id: 'full', label: 'Full List', desc: 'Segmented tab → card grid', icon: '📋' },
  ]

  return (
    <div className="desktop-wrapper">
      <div className="phone">
        <div key={screen} className={`screen-trans screen-${animDirRef.current}`}>
          {screen === 'home' && <Home {...sharedProps} />}
          {screen === 'subject' && <Subject {...sharedProps} />}
          {screen === 'pretest' && <PreTest {...sharedProps} />}
          {screen === 'solve' && <Solve {...sharedProps} />}
          {screen === 'summary' && <Summary {...sharedProps} />}
          {screen === 'result' && <Result {...sharedProps} />}
          {screen === 'saved' && <Saved {...sharedProps} />}
          {screen === 'videos' && <Videos navigate={navigate} isNewUser={isNewUser} toggleUserMode={toggleUserMode} />}
          {screen === 'videosubject' && <VideoSubject navigate={navigate} setCurrentVideo={setCurrentVideo} />}
          {screen === 'videoplayer' && <VideoPlayer navigate={navigate} currentVideo={currentVideo} savedVideos={savedVideos} saveVideo={saveVideo} unsaveVideo={unsaveVideo} savedResources={savedResources} saveResource={saveResource} unsaveResource={unsaveResource} />}
          {screen === 'livetest' && <LiveTest navigate={navigate} onJoinNow={(test) => { setCurrentLiveTest(test); navigate('livetestpretest') }} variant={liveTestVariant} />}
          {screen === 'livetestpretest' && <LiveTestPreTest navigate={navigate} test={currentLiveTest} />}
          {screen === 'livetestsolve' && <LiveTestSolve navigate={navigate} test={currentLiveTest} />}
        </div>
      </div>

      {/* Desktop-only variant switcher — shown only on Live Test screen */}
      {screen === 'livetest' && (
        <div className="version-sidebar">
          <div style={{ fontSize:10, fontWeight:700, color:'#9898b0', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>
            Upcoming Section
          </div>
          {VARIANTS.map(v => {
            const active = liveTestVariant === v.id
            return (
              <button key={v.id} onClick={() => setLiveTestVariant(v.id)} style={{
                width:'100%', textAlign:'left', padding:'11px 12px', borderRadius:10, marginBottom:8,
                background: active ? '#EEEDFE' : 'white',
                border: `1.5px solid ${active ? '#534AB7' : '#e8e8f2'}`,
                cursor:'pointer', display:'flex', flexDirection:'column', gap:4,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ fontSize:15 }}>{v.icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color: active ? '#534AB7' : '#1a1a2e' }}>{v.label}</span>
                  {active && <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'#534AB7', flexShrink:0 }} />}
                </div>
                <div style={{ fontSize:11, color:'#9898b0', paddingLeft:22 }}>{v.desc}</div>
              </button>
            )
          })}
          <div style={{ marginTop:6, padding:'10px 12px', background:'#f5f5fb', borderRadius:8 }}>
            <div style={{ fontSize:10, color:'#9898b0', lineHeight:1.6 }}>
              Compare both layouts side-by-side by toggling above. Changes apply inside the mobile frame only.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
