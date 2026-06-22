import { useState, useRef, useEffect } from 'react'
import { MAIN_OPTIONS, OTHERS_PLACEHOLDER, SUB_OPTIONS } from '../../data/formConfig'
import { useQueries } from '../../context/QueryContext'

const progressMap = { 1: 20, '2A': 42, '2B': 42, '2C': 42, '2D': 42, 3: 35, 4: 62, 5: 80, 6: 100 }

export default function FormShell({ embedded = false, onClose, onDone, questionContext = {} }) {
  const { addQuery } = useQueries()
  const [screen, setScreen] = useState('1')
  const [selectedOption, setSelectedOption] = useState(null)
  const [selectedSubOption, setSelectedSubOption] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [referenceText, setReferenceText] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [othersText, setOthersText] = useState('')
  const [submittedId, setSubmittedId] = useState(null)

  const reset = () => {
    setScreen('1')
    setSelectedOption(null)
    setSelectedSubOption(null)
    setCommentText('')
    setReferenceText('')
    setAttachment(null)
    setOthersText('')
    setSubmittedId(null)
  }

  const finish = () => {
    reset()
    if (onDone) onDone()
  }

  const chooseMain = (option) => {
    setSelectedOption(option)
    setSelectedSubOption(null)
    window.setTimeout(() => setScreen(option.screenKey), 150)
  }

  const goBack = () => {
    if (screen === '4') setScreen('3')
    else if (screen === '5') setScreen(selectedOption?.screenKey || '1')
    else if (['2A', '2B', '2C', '2D'].includes(screen)) setScreen('1')
    else if (screen === '3') setScreen('1')
  }

  const submitStructured = ({ comment = commentText, reference = referenceText, media = attachment } = {}) => {
    const config = SUB_OPTIONS[selectedOption.screenKey]
    const id = addQuery({
      category: config.category,
      subOption: selectedSubOption.label,
      commentText: [
        comment && `Reason: ${comment}`,
        reference && `Reference: ${reference}`,
        media && `Attachment: ${media.type} - ${media.name}`
      ].filter(Boolean).join('\n'),
      subjectName: questionContext.subjectName,
      testName: questionContext.testName,
      questionText: questionContext.questionText,
      questionNum: questionContext.questionNum,
    })
    setSubmittedId(id)
    setScreen('6')
  }

  const submitOthers = () => {
    const id = addQuery({
      category: 'Others', subOption: 'Others', commentText: othersText,
      subjectName: questionContext.subjectName,
      testName: questionContext.testName,
      questionText: questionContext.questionText,
      questionNum: questionContext.questionNum,
    })
    setSubmittedId(id)
    setScreen('6')
  }

  return (
    <main className={embedded ? 'raq-form-page embedded' : 'raq-form-page'}>
      <section className={embedded ? 'form-shell embedded' : 'form-shell'}>
        <div className="form-head">
          {!['1', '6'].includes(screen) ? (
            <button className="form-head-btn" type="button" onClick={goBack} aria-label="Back">‹</button>
          ) : <span className="form-head-spacer" />}
          <div className="form-head-title">Raise a Query</div>
          {embedded && screen !== '6' ? (
            <button className="form-head-btn" type="button" onClick={onClose} aria-label="Close">×</button>
          ) : <span className="form-head-spacer" />}
          <div className="form-progress" aria-hidden="true">
            <span style={{ width: `${progressMap[screen]}%` }} />
          </div>
        </div>
        <div className="form-body">

        {screen === '1' && <Screen1 selectedOption={selectedOption} onChoose={chooseMain} onOthers={() => setScreen('3')} />}
        {['2A', '2B', '2C', '2D'].includes(screen) && (
          <SubOptionScreen
            screenKey={screen}
            selectedSubOption={selectedSubOption}
            onSelect={setSelectedSubOption}
            onContinue={() => {
              setCommentText('')
              setReferenceText('')
              setAttachment(null)
              setScreen('5')
            }}
          />
        )}
        {screen === '3' && <OthersInterstitial onChoose={chooseMain} onNone={() => setScreen('4')} />}
        {screen === '4' && (
          <OthersText
            value={othersText}
            onChange={setOthersText}
            onSubmit={submitOthers}
          />
        )}
        {screen === '5' && (() => {
          // Sub-options that get full evidence panel (voice + reference + photo)
          const FULL_EVIDENCE = ['answer-wrong', 'book-different', 'multi-correct']
          const isWrongAnswer = selectedOption?.id === 'wrong-answer'
          const needsFullEvidence = isWrongAnswer && FULL_EVIDENCE.includes(selectedSubOption?.id)
          // No voice for: wrong-answer simple subs, cant-see, and two specific not-right-q subs
          const NO_VOICE_NOT_RIGHT = ['already-seen', 'wrong-language']
          const isTextOnly = (isWrongAnswer && !needsFullEvidence)
            || selectedOption?.id === 'cant-see'
            || (selectedOption?.id === 'not-right-q' && NO_VOICE_NOT_RIGHT.includes(selectedSubOption?.id))

          if (needsFullEvidence) return (
            <WrongAnswerEvidenceScreen
              value={commentText}
              referenceValue={referenceText}
              attachment={attachment}
              prompt={selectedSubOption?.prompt}
              onChange={setCommentText}
              onReferenceChange={setReferenceText}
              onAttachmentChange={setAttachment}
              onSubmit={() => submitStructured()}
              onSkip={() => submitStructured({ comment: '', reference: '', media: null })}
            />
          )
          return (
            <CommentScreen
              value={commentText}
              prompt={selectedSubOption?.prompt}
              onChange={setCommentText}
              onSubmit={() => submitStructured({ comment: commentText, reference: '', media: null })}
              onSkip={() => submitStructured({ comment: '', reference: '', media: null })}
              showVoice={!isTextOnly}
            />
          )
        })()}
        {screen === '6' && <SuccessScreen onReset={reset} onDone={finish} queryId={submittedId} />}
        </div>
      </section>
    </main>
  )
}

function Screen1({ selectedOption, onChoose, onOthers }) {
  return (
    <>
      <h1 className="form-title">What's the issue?</h1>
      <p className="form-subtitle">Select the option that best describes your problem</p>
      <div className="main-options">
        {MAIN_OPTIONS.map(option => (
          <button
            key={option.id}
            type="button"
            className={`main-card ${selectedOption?.id === option.id ? 'selected' : ''}`}
            onClick={() => onChoose(option)}
          >
            <span className="main-copy">
              <span className="main-title">{option.title}</span>
              <span className="main-subtitle">{option.subtitle}</span>
            </span>
            <span className="chevron">&gt;</span>
          </button>
        ))}
      </div>
      <p className="others-link">
        Still can't find it? <button className="link-btn" type="button" onClick={onOthers}>Tell us in your own words</button>
      </p>
    </>
  )
}

function SubOptionScreen({ screenKey, selectedSubOption, onSelect, onContinue }) {
  const config = SUB_OPTIONS[screenKey]
  return (
    <>
      <h1 className="form-title small">{config.header}</h1>
      <p className="form-subtitle">Select the closest match</p>
      <div className="sub-options">
        {config.options.map(option => (
          <button
            key={option.id}
            type="button"
            className={`sub-option-row ${selectedSubOption?.id === option.id ? 'selected' : ''}`}
            onClick={() => onSelect(option)}
          >
            <span className="radio-dot" />
            <span className="sub-label">{option.label}</span>
          </button>
        ))}
      </div>
      <button className="primary-btn" type="button" disabled={!selectedSubOption} onClick={onContinue}>Continue</button>
    </>
  )
}

function OthersInterstitial({ onChoose, onNone }) {
  return (
    <div className="others-gate">
      <div className="warning-icon">!</div>
      <h1 className="form-title small">Before you continue -</h1>
      <p className="form-subtitle">Does your issue fit any of these?</p>
      <div className="chip-grid">
        {MAIN_OPTIONS.map(option => (
          <button className="chip" key={option.id} type="button" onClick={() => onChoose(option)}>
            {option.title}
          </button>
        ))}
      </div>
      <button className="link-btn" type="button" onClick={onNone}>No, none of these</button>
    </div>
  )
}

function OthersText({ value, onChange, onSubmit }) {
  const [voiceDuration, setVoiceDuration] = useState(0)
  const hasText = value.trim().length >= 20
  const hasVoice = voiceDuration >= 10
  const canSubmit = hasText || hasVoice

  return (
    <>
      <h1 className="form-title small">Tell us in your own words</h1>
      <p className="form-subtitle">Describe what's wrong so we can fix it.</p>
      <textarea
        required
        value={value}
        placeholder={OTHERS_PLACEHOLDER}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className={`char-counter ${hasText ? 'complete' : ''}`}>
        {hasText
          ? `${value.trim().length} chars ✓`
          : `${value.trim().length} / 20 · or record 10s voice`}
      </div>
      <VoiceRecorder onDurationChange={setVoiceDuration} />
      {hasVoice && !hasText && (
        <div className="char-counter complete" style={{ marginTop: -6 }}>Voice note ready ✓</div>
      )}
      <button className="primary-btn" type="button" disabled={!canSubmit} onClick={onSubmit}>Submit query</button>
    </>
  )
}

function WrongAnswerEvidenceScreen({
  value,
  referenceValue,
  attachment,
  prompt,
  onChange,
  onReferenceChange,
  onAttachmentChange,
  onSubmit,
  onSkip
}) {
  const handleFile = (type, fileList) => {
    const file = fileList?.[0]
    if (!file) return
    onAttachmentChange({ type, name: file.name })
  }

  return (
    <>
      <div className="comment-title">
        <h1 className="form-title small">Why do you feel this is wrong?</h1>
        <span className="optional">(optional)</span>
      </div>
      <p className="form-subtitle">Tell us why the shown option or marked answer seems incorrect.</p>
      <textarea
        value={value}
        placeholder={prompt || 'For example: Google says ___, but this answer says ___...'}
        onChange={(event) => onChange(event.target.value)}
        style={{ minHeight: 82 }}
      />
      <label className="reference-field">
        <span>Reference or source <em>(optional)</em></span>
        <input
          value={referenceValue}
          placeholder="Book, class note, Google result, website, or teacher reference"
          onChange={(event) => onReferenceChange(event.target.value)}
        />
      </label>
      <div className="evidence-block">
        <div className="evidence-label">Add evidence <span>(optional)</span></div>
        <div className="evidence-actions">
          <label className="evidence-btn">
            <input type="file" accept="image/*" onChange={(event) => handleFile('Photo', event.target.files)} />
            Photo
          </label>
        </div>
        {attachment && (
          <div className="attachment-pill">
            {attachment.type}: {attachment.name}
            <button type="button" onClick={() => onAttachmentChange(null)}>Remove</button>
          </div>
        )}
      </div>
      <VoiceRecorder />
      <button className="primary-btn" type="button" onClick={onSubmit}>Submit query</button>
      <button className="secondary-btn" type="button" onClick={onSkip}>Skip and submit</button>
    </>
  )
}

function CommentScreen({ value, prompt, onChange, onSubmit, onSkip, showVoice = true }) {
  return (
    <>
      <div className="comment-title">
        <h1 className="form-title small">Want to add more detail?</h1>
        <span className="optional">(optional)</span>
      </div>
      <textarea
        value={value}
        placeholder={prompt}
        onChange={(event) => onChange(event.target.value)}
        style={{ minHeight: 100 }}
      />
      {showVoice && <VoiceRecorder />}
      <button className="primary-btn" type="button" onClick={onSubmit}>Submit query</button>
      <button className="secondary-btn" type="button" onClick={onSkip}>Skip and submit</button>
    </>
  )
}

function VoiceRecorder({ onDurationChange }) {
  const [recState, setRecState] = useState('idle')
  const [audioURL, setAudioURL] = useState(null)
  const [duration, setDuration] = useState(0)
  const mrRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const finalDurationRef = useRef(0)

  useEffect(() => () => {
    clearInterval(timerRef.current)
    if (audioURL) URL.revokeObjectURL(audioURL)
  }, [audioURL])

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioURL(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
        setRecState('recorded')
        onDurationChange?.(finalDurationRef.current)
      }
      mr.start()
      mrRef.current = mr
      setRecState('recording')
      setDuration(0)
      finalDurationRef.current = 0
      timerRef.current = setInterval(() => {
        setDuration(d => {
          finalDurationRef.current = d + 1
          return d + 1
        })
      }, 1000)
    } catch {
      // mic access denied — silently ignore
    }
  }

  const stop = () => {
    if (mrRef.current?.state === 'recording') mrRef.current.stop()
    clearInterval(timerRef.current)
  }

  const remove = () => {
    if (audioURL) URL.revokeObjectURL(audioURL)
    setAudioURL(null)
    setDuration(0)
    finalDurationRef.current = 0
    setRecState('idle')
    onDurationChange?.(0)
  }

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (recState === 'idle') return (
    <button type="button" className="voice-idle-btn" onClick={start}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
        <path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
      Add voice note
    </button>
  )

  if (recState === 'recording') return (
    <div className="voice-recording-bar">
      <span className="voice-dot" />
      <span className="voice-timer">{fmt(duration)}</span>
      <button type="button" className="voice-stop-btn" onClick={stop}>Stop</button>
    </div>
  )

  return (
    <div className="voice-recorded-bar">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
        <path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
      <audio src={audioURL} controls className="voice-audio" />
      <button type="button" className="voice-delete-btn" onClick={remove} aria-label="Remove voice note">✕</button>
    </div>
  )
}

function SuccessScreen({ onReset, onDone, queryId }) {
  const ticketDisplay = queryId
    ? '#NP-' + String(queryId).slice(-5).padStart(5, '0')
    : null

  return (
    <div className="success-screen">
      <div className="success-icon">✓</div>
      <h1 className="form-title" style={{ marginTop: 16 }}>Query submitted!</h1>
      <p className="success-body">We'll review this and update the question if needed.</p>

      {ticketDisplay && (
        <div style={{ width: '100%', margin: '14px 0 10px', background: 'var(--primary-light)', border: '1.5px dashed var(--primary-border)', borderRadius: 12, padding: '12px 16px', textAlign: 'left' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Your Ticket ID</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary-dark)', letterSpacing: '1px', fontFamily: 'monospace' }}>{ticketDisplay}</div>
          <div style={{ fontSize: 10, color: '#7070a0', marginTop: 4 }}>Save this to track or reference your query</div>
        </div>
      )}

      <div style={{ width: '100%', background: '#f0f7ff', border: '1px solid #c7deff', borderRadius: 10, padding: '10px 13px', textAlign: 'left', fontSize: 12, color: '#1e3a5f', lineHeight: 1.6 }}>
        <span style={{ fontWeight: 700 }}>Track your query:</span> open your profile and tap{' '}
        <span style={{ background: 'white', border: '1px solid #c7deff', borderRadius: 5, padding: '0 5px', fontWeight: 600, fontSize: 11 }}>My Queries</span>
        {' '}to see live status updates.
      </div>

      <div className="notify-banner" style={{ marginTop: 10 }}>🔔 You'll be notified when this is resolved.</div>

      <button className="primary-btn" type="button" style={{ background: 'var(--navy)', marginTop: 20 }} onClick={onDone}>
        Continue practice
      </button>
      <button className="link-btn" type="button" style={{ marginTop: 10, fontSize: 13 }} onClick={onReset}>
        Raise another query
      </button>
    </div>
  )
}
