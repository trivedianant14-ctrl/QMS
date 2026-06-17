import { useState } from 'react'
import { MAIN_OPTIONS, OTHERS_PLACEHOLDER, SUB_OPTIONS } from '../../data/formConfig'
import { useQueries } from '../../context/QueryContext'

const progressMap = { 1: 20, '2A': 42, '2B': 42, '2C': 42, '2D': 42, 3: 35, 4: 62, 5: 80, 6: 100 }

export default function FormShell({ embedded = false, onClose, onDone }) {
  const { addQuery } = useQueries()
  const [screen, setScreen] = useState('1')
  const [selectedOption, setSelectedOption] = useState(null)
  const [selectedSubOption, setSelectedSubOption] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [referenceText, setReferenceText] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [othersText, setOthersText] = useState('')

  const reset = () => {
    setScreen('1')
    setSelectedOption(null)
    setSelectedSubOption(null)
    setCommentText('')
    setReferenceText('')
    setAttachment(null)
    setOthersText('')
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
    addQuery({
      category: config.category,
      subOption: selectedSubOption.label,
      commentText: [
        comment && `Reason: ${comment}`,
        reference && `Reference: ${reference}`,
        media && `Attachment: ${media.type} - ${media.name}`
      ].filter(Boolean).join('\n')
    })
    setScreen('6')
  }

  const submitOthers = () => {
    addQuery({ category: 'Others', subOption: 'Others', commentText: othersText })
    setScreen('6')
  }

  return (
    <main className={embedded ? 'raq-form-page embedded' : 'raq-form-page'}>
      <section className={embedded ? 'form-shell embedded' : 'form-shell'}>
        <div className="form-head">
          {!['1', '6'].includes(screen) ? (
            <button className="form-head-btn" type="button" onClick={goBack} aria-label="Back">‹</button>
          ) : <span className="form-head-spacer" />}
          <div className="form-head-title">{embedded ? 'Report an Error' : 'Raise a query'}</div>
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
        {screen === '5' && (
          selectedOption?.id === 'wrong-answer' ? (
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
          ) : (
            <CommentScreen
              value={commentText}
              prompt={selectedSubOption?.prompt}
              onChange={setCommentText}
              onSubmit={() => submitStructured({ comment: commentText, reference: '', media: null })}
              onSkip={() => submitStructured({ comment: '', reference: '', media: null })}
            />
          )
        )}
        {screen === '6' && <SuccessScreen onReset={reset} onDone={finish} />}
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
      <div className={`char-counter ${value.trim().length >= 20 ? 'complete' : ''}`}>
        {value.trim().length} / 20 minimum{value.trim().length >= 20 ? ' ✓' : ''}
      </div>
      <button className="primary-btn" type="button" disabled={value.trim().length < 20} onClick={onSubmit}>Submit query</button>
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
          <label className="evidence-btn">
            <input type="file" accept="audio/*" onChange={(event) => handleFile('Voice note', event.target.files)} />
            Voice note
          </label>
        </div>
        {attachment && (
          <div className="attachment-pill">
            {attachment.type}: {attachment.name}
            <button type="button" onClick={() => onAttachmentChange(null)}>Remove</button>
          </div>
        )}
      </div>
      <button className="primary-btn" type="button" onClick={onSubmit}>Submit query</button>
      <button className="secondary-btn" type="button" onClick={onSkip}>Skip and submit</button>
    </>
  )
}

function CommentScreen({ value, prompt, onChange, onSubmit, onSkip }) {
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
      <button className="primary-btn" type="button" onClick={onSubmit}>Submit query</button>
      <button className="secondary-btn" type="button" onClick={onSkip}>Skip and submit</button>
    </>
  )
}

function SuccessScreen({ onReset, onDone }) {
  return (
    <div className="success-screen">
      <div className="success-icon">✓</div>
      <h1 className="form-title" style={{ marginTop: 20 }}>Query submitted</h1>
      <p className="success-body">We'll look into this and update the question if needed.</p>
      <div className="notify-banner">🔔 You'll be notified on the app when this is resolved.</div>
      <button className="primary-btn" type="button" style={{ background: 'var(--navy)', marginTop: 24 }} onClick={onDone}>
        Continue practice
      </button>
      <button className="link-btn" type="button" style={{ marginTop: 12, fontSize: 13 }} onClick={onReset}>
        Raise another query
      </button>
    </div>
  )
}
