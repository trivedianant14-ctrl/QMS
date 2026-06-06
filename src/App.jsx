import { useState } from 'react'
import Home from './screens/Home'
import Subject from './screens/Subject'
import PreTest from './screens/PreTest'
import Solve from './screens/Solve'
import Result from './screens/Result'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [mode, setMode] = useState('guide')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timerPerQ, setTimerPerQ] = useState(60)
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [savedQs, setSavedQs] = useState([])
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [showReattemptConfirm, setShowReattemptConfirm] = useState(false)

  const navigate = (s) => setScreen(s)

  const startAttempt = (selectedMode) => {
    setMode(selectedMode)
    setCurrentQ(0)
    setAnswers({})
    setIsReviewMode(false)
    setScreen('solve')
  }

  const saveQuestion = (qId, tag) => {
    setSavedQs(prev => {
      const exists = prev.find(s => s.qId === qId)
      if (exists) return prev.map(s => s.qId === qId ? { ...s, tag } : s)
      return [...prev, { qId, tag }]
    })
  }

  const submitTest = () => {
    setScreen('result')
  }

  const handleReattempt = () => {
    setShowReattemptConfirm(false)
    setCurrentQ(0)
    setAnswers({})
    setIsReviewMode(false)
    setScreen('solve')
  }

  const viewSolution = () => {
    setIsReviewMode(true)
    setCurrentQ(0)
    setScreen('solve')
  }

  const sharedProps = {
    navigate, mode, setMode,
    currentQ, setCurrentQ,
    answers, setAnswers,
    timerPerQ, setTimerPerQ,
    autoAdvance, setAutoAdvance,
    isReviewMode,
    savedQs, saveQuestion,
    bannerDismissed, setBannerDismissed,
    startAttempt, submitTest,
    showReattemptConfirm, setShowReattemptConfirm,
    handleReattempt, viewSolution,
  }

  return (
    <div className="phone">
      {screen === 'home' && <Home {...sharedProps} />}
      {screen === 'subject' && <Subject {...sharedProps} />}
      {screen === 'pretest' && <PreTest {...sharedProps} />}
      {screen === 'solve' && <Solve {...sharedProps} />}
      {screen === 'result' && <Result {...sharedProps} />}
    </div>
  )
}
