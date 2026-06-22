import React, { useState, useRef } from 'react'
import { useQueries } from '../context/QueryContext'

const P = '#534AB7', PL = '#EEEDFE', PB = '#AFA9EC', PD = '#3C3489'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'
const GREEN = '#22C55E', GREEN_BG = '#F0FDF4', GREEN_BORDER = '#86EFAC'
const ORANGE = '#E07B2A', ORANGE_BG = '#FFF3E8'
const RED = '#DC2626', RED_BG = '#FEF2F2', RED_BORDER = '#FECACA'

const CATEGORY_META = {
  'Problem with the Answer':    { color: '#DC2626', bg: '#FEF2F2', abbr: '✗' },
  "Can't See Something":        { color: '#2563EB', bg: '#EFF6FF', abbr: '👁' },
  'I Have a Doubt':             { color: '#16A34A', bg: '#F0FDF4', abbr: '?' },
  'Problem with this Question': { color: '#EA580C', bg: '#FFF7ED', abbr: '!' },
  Others:                       { color: '#7C3AED', bg: '#F5F3FF', abbr: '…' },
  'Wrong Answer':               { color: '#DC2626', bg: '#FEF2F2', abbr: '✗' },
  'Explanation Gap':            { color: '#16A34A', bg: '#F0FDF4', abbr: '?' },
  'Not the Right Question':     { color: '#EA580C', bg: '#FFF7ED', abbr: '!' },
}

const STAGE_FROM_STATUS = { raised: 0, received: 1, assigned: 2, resolved: 3 }
const STAGE_LABELS = ['Raised', 'In Review', 'Working', 'Resolved']
const STAGE_COLORS = [P, ORANGE, '#0369A1', GREEN]

const AGENTS = [
  { name: 'Priya S.',  team: 'Content QA',  avatar: 'P', color: '#7C3AED' },
  { name: 'Rahul M.',  team: 'Content QA',  avatar: 'R', color: '#0369A1' },
  { name: 'Sneha T.',  team: 'Engineering', avatar: 'S', color: '#059669' },
  { name: 'Amit K.',   team: 'Educator',    avatar: 'A', color: '#DC2626' },
]

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function ticketId(id) {
  return '#NP-' + String(id).slice(-5).padStart(5, '0')
}

function agentForQuery(query) {
  return AGENTS[(query.id || 0) % AGENTS.length]
}

// ── Thumbs Feedback ──────────────────────────────────────────────────────────
function ThumbsFeedback({ resolvedAt }) {
  // steps: 'prompt' | 'call_confirm' | 'call_enter' | 'call_otp' | 'call_done' | 'up'
  const [step, setStep] = useState('prompt')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [otpError, setOtpError] = useState(false)
  const [usedOwnNumber, setUsedOwnNumber] = useState(true)
  const ref0 = useState(null), ref1 = useState(null), ref2 = useState(null), ref3 = useState(null)
  const otpInputRefs = [
    React.useRef(), React.useRef(), React.useRef(), React.useRef()
  ]

  const DEMO_NUMBER = '+91 98765 43210'

  const resolvedTime = resolvedAt ? new Date(resolvedAt).getTime() : Date.now()
  const expiresAt = resolvedTime + 48 * 3600000
  const remainingMs = expiresAt - Date.now()
  const remainingH = Math.max(0, Math.ceil(remainingMs / 3600000))
  const isExpired = remainingMs <= 0

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[idx] = val; setOtp(next); setOtpError(false)
    if (val && idx < 3) otpInputRefs[idx + 1].current?.focus()
  }
  const handleOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpInputRefs[idx - 1].current?.focus()
  }
  const verifyOtp = () => {
    if (otp.join('') === '0000') { setStep('call_done') }
    else { setOtpError(true); setOtp(['', '', '', '']); otpInputRefs[0].current?.focus() }
  }

  if (isExpired) return (
    <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: T1, marginBottom: 6 }}>Ticket auto-closed</div>
      <div style={{ fontSize: 11, color: T2, lineHeight: 1.6 }}>The 48-hour response window has passed. This ticket has been automatically closed.</div>
      <div style={{ marginTop: 10, fontSize: 11, color: P }}>Still have a doubt? Raise a new query and our team will help.</div>
    </div>
  )

  if (step === 'up') return (
    <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#14532D', marginBottom: 4 }}>Great, glad it helped!</div>
      <div style={{ fontSize: 12, color: T2, lineHeight: 1.5 }}>Your ticket is now closed. Keep learning — NPrep's got your back.</div>
    </div>
  )

  // Call confirmed — no agent details shown
  if (step === 'call_done') return (
    <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>📞</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: T1, marginBottom: 6 }}>
        {usedOwnNumber ? 'Ok cool!' : 'Got it!'}
      </div>
      <div style={{ fontSize: 12, color: T2, lineHeight: 1.7, marginBottom: 14 }}>
        {usedOwnNumber
          ? 'One of our agents will be reviewing your query and will shortly be contacting you.'
          : 'Someone from our team will shortly be calling you on your updated number.'}
      </div>
      <div style={{ background: ORANGE_BG, border: `1px solid #FED7AA`, borderRadius: 10, padding: '12px 14px', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE, animation: 'tl-pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>Our team will call you within 24 hours</span>
        </div>
        <div style={{ fontSize: 11, color: '#92400E', paddingLeft: 16 }}>You'll get a notification before the call.</div>
      </div>
    </div>
  )

  // "Is this the correct number?"
  if (step === 'call_confirm') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setStep('prompt')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, display: 'flex', padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Is this the correct number?</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: BG2, border: `1px solid ${BD}`, marginBottom: 16 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.2" strokeLinecap="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.64a19.79 19.79 0 01-2.93-8.63A2 2 0 012.11 0H5a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
        </svg>
        <span style={{ fontSize: 15, fontWeight: 700, color: T1, letterSpacing: '0.04em' }}>{DEMO_NUMBER}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button onClick={() => { setUsedOwnNumber(false); setStep('call_enter') }} style={{ padding: '11px', borderRadius: 10, background: 'white', color: T2, border: `1px solid ${BD}`, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          No, use different
        </button>
        <button onClick={() => { setUsedOwnNumber(true); setStep('call_done') }} style={{ padding: '11px', borderRadius: 10, background: P, color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          Yes, call me
        </button>
      </div>
    </div>
  )

  // Enter new number
  if (step === 'call_enter') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setStep('call_confirm')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, display: 'flex', padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Enter your number</div>
          <div style={{ fontSize: 10, color: T2 }}>We'll send a one-time OTP to verify</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div style={{ padding: '10px 11px', borderRadius: 10, border: `1px solid ${BD}`, background: BG2, fontSize: 13, fontWeight: 600, color: T2, flexShrink: 0 }}>+91</div>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="10-digit mobile number"
          inputMode="numeric"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${phone.length === 10 ? P : BD}`, fontSize: 13, color: T1, outline: 'none', fontFamily: 'inherit' }}
        />
      </div>
      <button
        disabled={phone.length !== 10}
        onClick={() => setStep('call_otp')}
        style={{ width: '100%', padding: '12px', borderRadius: 10, background: phone.length === 10 ? P : BG2, color: phone.length === 10 ? 'white' : T3, border: 'none', fontSize: 13, fontWeight: 700, cursor: phone.length === 10 ? 'pointer' : 'default' }}
      >
        Send OTP
      </button>
    </div>
  )

  // OTP verification
  if (step === 'call_otp') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <button onClick={() => { setOtp(['','','','']); setOtpError(false); setStep('call_enter') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, display: 'flex', padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Enter OTP</div>
      </div>
      <div style={{ fontSize: 11, color: T2, marginBottom: 16 }}>Sent to +91 {phone}</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 10 }}>
        {[0,1,2,3].map(idx => (
          <input key={idx} ref={otpInputRefs[idx]}
            value={otp[idx]} maxLength={1} inputMode="numeric"
            onChange={e => handleOtpChange(idx, e.target.value)}
            onKeyDown={e => handleOtpKey(idx, e)}
            style={{ width: 50, height: 56, textAlign: 'center', fontSize: 24, fontWeight: 800, color: otpError ? RED : T1, borderRadius: 10, border: `2px solid ${otpError ? RED_BORDER : otp[idx] ? P : BD}`, outline: 'none', fontFamily: 'inherit', background: otpError ? RED_BG : 'white', transition: 'border-color 0.15s' }}
          />
        ))}
      </div>
      {otpError && <div style={{ textAlign: 'center', fontSize: 11, color: RED, marginBottom: 10 }}>Incorrect OTP. Please try again.</div>}
      <button
        disabled={otp.join('').length < 4}
        onClick={verifyOtp}
        style={{ width: '100%', padding: '12px', borderRadius: 10, background: otp.join('').length === 4 ? P : BG2, color: otp.join('').length === 4 ? 'white' : T3, border: 'none', fontSize: 13, fontWeight: 700, cursor: otp.join('').length === 4 ? 'pointer' : 'default' }}
      >
        Verify &amp; Confirm Call
      </button>
    </div>
  )

  // Step 1: Prompt (thumbs up / down)
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 4 }}>Did this resolve your issue?</div>
      <div style={{ fontSize: 11, color: T2, marginBottom: 12 }}>Your feedback helps us close the loop or escalate if needed.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <button onClick={() => setStep('up')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 10px', borderRadius: 12, border: `1.5px solid ${GREEN_BORDER}`, background: GREEN_BG, cursor: 'pointer' }}
        >
          <span style={{ fontSize: 28 }}>👍</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#14532D' }}>Yes, got it!</span>
          <span style={{ fontSize: 10, color: '#166534', textAlign: 'center', lineHeight: 1.4 }}>Issue is resolved</span>
        </button>
        <button onClick={() => setStep('call_confirm')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 10px', borderRadius: 12, border: `1.5px solid ${RED_BORDER}`, background: RED_BG, cursor: 'pointer' }}
        >
          <span style={{ fontSize: 28 }}>👎</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: RED }}>Still confused</span>
          <span style={{ fontSize: 10, color: '#B91C1C', textAlign: 'center', lineHeight: 1.4 }}>Need more help</span>
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', background: remainingH <= 12 ? '#FFF7ED' : BG2, borderRadius: 8, border: `1px solid ${remainingH <= 12 ? '#FED7AA' : BD}` }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={remainingH <= 12 ? ORANGE : T3} strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span style={{ fontSize: 10, color: remainingH <= 12 ? '#92400E' : T2, fontWeight: remainingH <= 12 ? 600 : 400 }}>
          {remainingH}h left to respond · auto-closes if no action
        </span>
      </div>
    </div>
  )
}

// ── Inline mini voice recorder (for escalation form) ──────────────────────────
function MiniVoiceRecorder({ onDurationChange }) {
  const [recState, setRecState] = useState('idle')
  const [audioURL, setAudioURL] = useState(null)
  const [duration, setDuration] = useState(0)
  const mrRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const finalDurRef = useRef(0)

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        setAudioURL(URL.createObjectURL(new Blob(chunksRef.current, { type: 'audio/webm' })))
        stream.getTracks().forEach(t => t.stop())
        setRecState('done')
        onDurationChange?.(finalDurRef.current)
      }
      mr.start(); mrRef.current = mr; setRecState('rec'); setDuration(0); finalDurRef.current = 0
      timerRef.current = setInterval(() => setDuration(d => { finalDurRef.current = d + 1; return d + 1 }), 1000)
    } catch { /* mic denied */ }
  }
  const stop = () => { mrRef.current?.state === 'recording' && mrRef.current.stop(); clearInterval(timerRef.current) }
  const remove = () => { if (audioURL) URL.revokeObjectURL(audioURL); setAudioURL(null); setDuration(0); finalDurRef.current = 0; setRecState('idle'); onDurationChange?.(0) }
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (recState === 'idle') return (
    <button type="button" onClick={start} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 20, background: 'white', border: `1px solid ${BD}`, color: T2, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
      Add voice note
    </button>
  )
  if (recState === 'rec') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 20, background: '#FEF2F2', border: `1px solid ${RED_BORDER}` }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: RED, animation: 'tl-pulse 1s ease-in-out infinite', flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: RED, fontFamily: 'monospace' }}>{fmt(duration)}</span>
      <button onClick={stop} style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 12, background: RED, color: 'white', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Stop</button>
    </div>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 20, background: PL, border: `1px solid ${PB}` }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round"><path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
      <audio src={audioURL} controls style={{ height: 24, flex: 1 }} />
      <button onClick={remove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
    </div>
  )
}

// ── Call Request Flow (number verification) ──────────────────────────────────
function CallRequestFlow({ agent, onClose }) {
  const DEMO_NUMBER = '+91 98765 43210'
  const [step, setStep] = useState('confirm') // confirm | enter | otp | done
  const [phone, setPhone] = useState('')
  const [finalPhone, setFinalPhone] = useState(DEMO_NUMBER)
  const [otp, setOtp] = useState(['', '', '', ''])
  const [otpError, setOtpError] = useState(false)
  const ref0 = useRef(), ref1 = useRef(), ref2 = useRef(), ref3 = useRef()
  const otpRefs = [ref0, ref1, ref2, ref3]

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[idx] = val; setOtp(next); setOtpError(false)
    if (val && idx < 3) otpRefs[idx + 1].current?.focus()
  }
  const handleOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs[idx - 1].current?.focus()
  }
  const verifyOtp = () => {
    if (otp.join('') === '0000') { setFinalPhone('+91 ' + phone); setStep('done') }
    else { setOtpError(true); setOtp(['', '', '', '']); ref0.current?.focus() }
  }

  if (step === 'done') return (
    <div style={{ padding: '14px 14px 10px', borderRadius: 12, background: '#F0FDF4', border: '1.5px solid #86EFAC' }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 30, marginBottom: 6 }}>📞</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#14532D', marginBottom: 3 }}>Call Requested!</div>
        <div style={{ fontSize: 11, color: '#166534', lineHeight: 1.6 }}>
          {agent.name} from <strong>{agent.team}</strong> will call you on <strong>{finalPhone}</strong> within 24 hours.
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: 9, border: '1px solid #86EFAC', padding: '9px 11px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: agent.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>{agent.avatar}</span>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#14532D' }}>{agent.name} · {agent.team}</div>
          <div style={{ fontSize: 10, color: '#166534' }}>Will call you within 24 hours</div>
        </div>
      </div>
    </div>
  )

  if (step === 'confirm') return (
    <div style={{ padding: 14, borderRadius: 12, border: `1px solid ${BD}`, background: 'white' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 3 }}>Is this your number?</div>
      <div style={{ fontSize: 11, color: T2, marginBottom: 12 }}>We'll reach out on this number to help resolve your doubt.</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 10, background: BG2, border: `1px solid ${BD}`, marginBottom: 14 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.2" strokeLinecap="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.64a19.79 19.79 0 01-2.93-8.63A2 2 0 012.11 0H5a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
        </svg>
        <span style={{ fontSize: 15, fontWeight: 700, color: T1, letterSpacing: '0.04em' }}>{DEMO_NUMBER}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button onClick={() => setStep('enter')} style={{ padding: '11px', borderRadius: 10, background: 'white', color: T2, border: `1px solid ${BD}`, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>No, use different</button>
        <button onClick={() => setStep('done')} style={{ padding: '11px', borderRadius: 10, background: P, color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Yes, call me</button>
      </div>
    </div>
  )

  if (step === 'enter') return (
    <div style={{ padding: 14, borderRadius: 12, border: `1px solid ${BD}`, background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setStep('confirm')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, display: 'flex', padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Enter your number</div>
          <div style={{ fontSize: 10, color: T2 }}>We'll send a one-time OTP to verify</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div style={{ padding: '10px 11px', borderRadius: 10, border: `1px solid ${BD}`, background: BG2, fontSize: 13, fontWeight: 600, color: T2, flexShrink: 0 }}>+91</div>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="10-digit mobile number"
          inputMode="numeric"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${phone.length === 10 ? P : BD}`, fontSize: 13, color: T1, outline: 'none', fontFamily: 'inherit' }}
        />
      </div>
      <button
        disabled={phone.length !== 10}
        onClick={() => setStep('otp')}
        style={{ width: '100%', padding: '12px', borderRadius: 10, background: phone.length === 10 ? P : BG2, color: phone.length === 10 ? 'white' : T3, border: 'none', fontSize: 13, fontWeight: 700, cursor: phone.length === 10 ? 'pointer' : 'default' }}
      >
        Send OTP
      </button>
    </div>
  )

  // step === 'otp'
  return (
    <div style={{ padding: 14, borderRadius: 12, border: `1px solid ${BD}`, background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <button onClick={() => { setOtp(['','','','']); setOtpError(false); setStep('enter') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, display: 'flex', padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Enter OTP</div>
      </div>
      <div style={{ fontSize: 11, color: T2, marginBottom: 16 }}>Sent to +91 {phone}</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 10 }}>
        {[0,1,2,3].map(idx => (
          <input key={idx} ref={otpRefs[idx]}
            value={otp[idx]} maxLength={1} inputMode="numeric"
            onChange={e => handleOtpChange(idx, e.target.value)}
            onKeyDown={e => handleOtpKey(idx, e)}
            style={{ width: 50, height: 56, textAlign: 'center', fontSize: 24, fontWeight: 800, color: otpError ? RED : T1, borderRadius: 10, border: `2px solid ${otpError ? RED_BORDER : otp[idx] ? P : BD}`, outline: 'none', fontFamily: 'inherit', background: otpError ? RED_BG : 'white', transition: 'border-color 0.15s' }}
          />
        ))}
      </div>
      {otpError && (
        <div style={{ textAlign: 'center', fontSize: 11, color: RED, marginBottom: 10 }}>Incorrect OTP. Please try again.</div>
      )}
      <button
        disabled={otp.join('').length < 4}
        onClick={verifyOtp}
        style={{ width: '100%', padding: '12px', borderRadius: 10, background: otp.join('').length === 4 ? P : BG2, color: otp.join('').length === 4 ? 'white' : T3, border: 'none', fontSize: 13, fontWeight: 700, cursor: otp.join('').length === 4 ? 'pointer' : 'default' }}
      >
        Verify &amp; Request Call
      </button>
    </div>
  )
}

// ── Call Request Section (write / voice / call) ───────────────────────────────
function CallRequestSection({ agent }) {
  const [additionalText, setAdditionalText] = useState('')
  const [voiceDuration, setVoiceDuration] = useState(0)
  const [showCallFlow, setShowCallFlow] = useState(false)

  return (
    <div style={{ marginTop: 14, padding: 14, borderRadius: 12, border: `1px solid ${BD}`, background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Still have a doubt?</div>
      </div>
      <div style={{ fontSize: 11, color: T2, marginBottom: 12, lineHeight: 1.5 }}>
        Write or record what's still unclear — our team will get back to you, or you can request a call.
      </div>

      <textarea
        value={additionalText}
        onChange={e => setAdditionalText(e.target.value)}
        placeholder="Describe what's still unclear... (optional)"
        style={{ width: '100%', minHeight: 76, borderRadius: 10, border: `1.5px solid ${additionalText.trim() ? P : BD}`, padding: '9px 11px', fontSize: 12, color: T1, resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6, background: BG2, transition: 'border-color 0.15s', marginBottom: 10 }}
      />

      <div style={{ marginBottom: 12 }}>
        <MiniVoiceRecorder onDurationChange={setVoiceDuration} />
      </div>

      {showCallFlow
        ? <CallRequestFlow agent={agent} onClose={() => setShowCallFlow(false)} />
        : (
          <button
            onClick={() => setShowCallFlow(true)}
            style={{ width: '100%', padding: '12px', borderRadius: 10, background: P, color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.64a19.79 19.79 0 01-2.93-8.63A2 2 0 012.11 0H5a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            Request a Call
          </button>
        )
      }
    </div>
  )
}

// ── Timeline Step ────────────────────────────────────────────────────────────
function TimelineStep({ step, idx, activeIdx, agent, stepTimestamps, isLast, query }) {
  const status = idx < activeIdx ? 'done' : idx === activeIdx ? 'active' : 'pending'
  const meta = CATEGORY_META[query?.category] || CATEGORY_META['Others']
  const isExpandable = (step.key === 'raised' || step.key === 'resolved') && status !== 'pending'

  // Default open: 'raised' until an agent is assigned (stage < 2);
  // 'resolved' while within the 48h feedback window
  const defaultExpanded = (() => {
    if (step.key === 'raised') return activeIdx < 2
    if (step.key === 'resolved' && query?.resolved_at) {
      return Date.now() < new Date(query.resolved_at).getTime() + 48 * 3600000
    }
    return false
  })()
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div style={{ display: 'flex', gap: 12, opacity: status === 'pending' ? 0.35 : 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: status === 'done' ? GREEN : status === 'active' ? P : 'white', border: `2px solid ${status === 'done' ? GREEN : status === 'active' ? P : BD}`, boxShadow: status === 'active' ? `0 0 0 4px ${PL}` : 'none', animation: status === 'active' ? 'tl-pulse 2s ease-in-out infinite' : 'none', flexShrink: 0 }}>
          {status === 'done'
            ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <div style={{ width: 7, height: 7, borderRadius: '50%', background: status === 'active' ? 'white' : BD }} />}
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, minHeight: expanded ? 32 : 22, background: idx < activeIdx ? GREEN : BD, marginTop: 2, borderRadius: 1 }} />}
      </div>

      <div style={{ paddingBottom: isLast ? 0 : 18, flex: 1, minWidth: 0 }}>
        <div
          onClick={isExpandable ? () => setExpanded(e => !e) : undefined}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3, cursor: isExpandable ? 'pointer' : 'default', userSelect: 'none' }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: status === 'pending' ? T3 : T1 }}>{step.title}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {stepTimestamps[idx] && <span style={{ fontSize: 10, color: T3 }}>{stepTimestamps[idx]}</span>}
            {isExpandable && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            )}
          </div>
        </div>

        <p style={{ fontSize: 11, color: T2, lineHeight: 1.5, margin: 0 }}>
          {step.key === 'assigned' && status !== 'pending'
            ? <>{agent.name} · <strong>{agent.team}</strong></>
            : step.desc}
        </p>

        {status === 'active' && step.key === 'assigned' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '8px 10px', background: PL, borderRadius: 8, border: `1px solid ${PB}` }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: agent.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>{agent.avatar}</span>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: PD }}>{agent.name}</div>
              <div style={{ fontSize: 10, color: P }}>{agent.team}</div>
            </div>
            <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: GREEN, animation: 'tl-pulse 1.5s ease-in-out infinite' }} />
          </div>
        )}

        {expanded && step.key === 'raised' && query && (
          <div style={{ marginTop: 8, background: BG2, borderRadius: 9, border: `1px solid ${BD}`, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Your original report</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: meta.color, flexShrink: 0 }}>{meta.abbr}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: meta.color }}>{query.category}</span>
            </div>
            <div style={{ fontSize: 11, color: T1, fontWeight: 500, marginBottom: 4 }}>{query.sub_option}</div>
            {query.query_text && (
              <div style={{ fontSize: 11, color: T2, fontStyle: 'italic', lineHeight: 1.5, paddingTop: 6, borderTop: `1px solid ${BD}` }}>
                "{query.query_text}"
              </div>
            )}
          </div>
        )}

        {expanded && step.key === 'resolved' && query?.resolution_text && (
          <div style={{ marginTop: 8, background: GREEN_BG, borderRadius: 9, border: `1px solid ${GREEN_BORDER}`, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Resolution</div>
            <p style={{ fontSize: 11, color: '#14532D', lineHeight: 1.6, margin: 0 }}>{query.resolution_text}</p>
            <div style={{ marginTop: 8, paddingTop: 6, borderTop: `1px solid ${GREEN_BORDER}`, fontSize: 10, color: '#166534' }}>
              Resolved by {agent.name} · {agent.team}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Query Detail View ─────────────────────────────────────────────────────────
function QueryDetailView({ query, onBack, onClose }) {
  const stage = STAGE_FROM_STATUS[query.timeline_status] ?? query.demo_stage ?? 0
  const agent = agentForQuery(query)
  const meta = CATEGORY_META[query.category] || CATEGORY_META['Others']

  const raised = new Date(query.timestamp).getTime()
  const stepTimestamps = [
    timeAgo(query.timestamp),
    stage >= 1 ? timeAgo(new Date(raised + 300000).toISOString()) : null,
    stage >= 2 ? timeAgo(new Date(raised + 900000).toISOString()) : null,
    stage >= 3 ? timeAgo(new Date(raised + 3600000 * 18).toISOString()) : null,
  ]

  const TIMELINE_STEPS = [
    { key: 'raised',   title: 'Query raised',    desc: 'Your report has been logged' },
    { key: 'received', title: 'Received by team', desc: 'Content team has picked this up' },
    { key: 'assigned', title: 'Agent assigned',   desc: null },
    { key: 'resolved', title: 'Query resolved',   desc: 'Issue addressed' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', padding: 2 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T1 }}>{ticketId(query.id)}</div>
            <div style={{ fontSize: 10, color: T3 }}>Raised {timeAgo(query.timestamp)}</div>
          </div>
          <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: stage === 3 ? GREEN_BG : PL, color: stage === 3 ? GREEN : P, border: `1px solid ${stage === 3 ? GREEN_BORDER : PB}` }}>
            {STAGE_LABELS[stage]}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: T3, padding: 2, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ background: BG2, borderRadius: 9, padding: '8px 11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: meta.color }}>{meta.abbr}</div>
            <span style={{ fontSize: 10, fontWeight: 700, color: meta.color }}>{query.category}</span>
          </div>
          <div style={{ fontSize: 11, color: T2 }}>{query.sub_option}</div>
        </div>
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {/* Status banner */}
        {stage < 3 && (
          <div style={{ marginBottom: 16, padding: '10px 13px', borderRadius: 11, background: stage === 2 ? PL : stage === 1 ? ORANGE_BG : BG2, border: `1px solid ${stage === 2 ? PB : stage === 1 ? '#FED7AA' : BD}`, display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: STAGE_COLORS[stage], flexShrink: 0, animation: 'tl-pulse 1.5s ease-in-out infinite' }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: stage === 2 ? PD : stage === 1 ? '#92400E' : T1 }}>
                {stage === 0 && 'Your query has been received'}
                {stage === 1 && 'Our team is reviewing this'}
                {stage === 2 && `${agent.name} is working on your query`}
              </div>
              <div style={{ fontSize: 10, color: T2, marginTop: 1 }}>
                {stage === 0 && 'Estimated response within 48 hours'}
                {stage === 1 && 'An agent will be assigned shortly'}
                {stage === 2 && "You'll be notified once resolved"}
              </div>
            </div>
          </div>
        )}
        {stage === 3 && (
          <div style={{ marginBottom: 16, padding: '10px 13px', borderRadius: 11, background: GREEN_BG, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', gap: 9 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#14532D' }}>Query resolved</div>
              <div style={{ fontSize: 10, color: '#166534' }}>The question has been reviewed and updated</div>
            </div>
          </div>
        )}

        {/* Question context */}
        {(query.subject_name || query.test_name || query.question_text) && (
          <div style={{ marginBottom: 16, borderRadius: 11, border: `1px solid ${BD}`, overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', background: BG2, borderBottom: `1px solid ${BD}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              <span style={{ fontSize: 10, fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Question Context</span>
            </div>
            <div style={{ padding: '10px 12px', background: 'white' }}>
              {(query.subject_name || query.test_name) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: query.question_text ? 9 : 0 }}>
                  {query.subject_name && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: PL, color: P, border: `1px solid ${PB}` }}>
                      {query.subject_name}
                    </span>
                  )}
                  {query.test_name && (
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: BG2, color: T2, border: `1px solid ${BD}` }}>
                      {query.test_name}
                    </span>
                  )}
                  {query.question_num && (
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: BG2, color: T3, border: `1px solid ${BD}` }}>
                      Q{query.question_num}
                    </span>
                  )}
                </div>
              )}
              {query.question_text && (
                <div style={{ fontSize: 11, color: T1, lineHeight: 1.6, fontStyle: 'italic', borderLeft: `3px solid ${PB}`, paddingLeft: 10 }}>
                  "{query.question_text.length > 140 ? query.question_text.slice(0, 137) + '…' : query.question_text}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Timeline</div>
          {TIMELINE_STEPS.map((step, idx) => (
            <TimelineStep key={step.key} step={step} idx={idx} activeIdx={stage} agent={agent} stepTimestamps={stepTimestamps} isLast={idx === TIMELINE_STEPS.length - 1} query={query} />
          ))}
        </div>

        {/* Thumbs feedback — only when resolved */}
        {stage === 3 && (
          <div style={{ padding: '14px', borderRadius: 12, border: `1px solid ${BD}`, background: 'white' }}>
            <ThumbsFeedback resolvedAt={query.resolved_at} />
          </div>
        )}

      </div>
    </div>
  )
}

// ── Query Card ───────────────────────────────────────────────────────────────
function QueryCard({ query, onClick }) {
  const meta = CATEGORY_META[query.category] || CATEGORY_META['Others']
  const stage = STAGE_FROM_STATUS[query.timeline_status] ?? query.demo_stage ?? 0
  return (
    <button onClick={onClick}
      style={{ width: '100%', textAlign: 'left', background: 'white', border: `1px solid ${BD}`, borderRadius: 11, padding: '11px 13px', cursor: 'pointer', display: 'block', transition: 'box-shadow 0.15s, border-color 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = PB; e.currentTarget.style.boxShadow = `0 2px 10px rgba(83,74,183,0.08)` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: meta.color, flexShrink: 0 }}>{meta.abbr}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: meta.color }}>{query.category}</div>
          <div style={{ fontSize: 12, color: T1, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{query.sub_option}</div>
        </div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2" strokeLinecap="round"><polyline points="9,18 15,12 9,6"/></svg>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: T3, fontFamily: 'monospace' }}>{ticketId(query.id)}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 10, color: T3 }}>{timeAgo(query.timestamp)}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: stage === 3 ? GREEN_BG : stage === 2 ? PL : stage === 1 ? ORANGE_BG : BG2, color: stage === 3 ? GREEN : stage === 2 ? P : stage === 1 ? ORANGE : T2, border: `1px solid ${stage === 3 ? GREEN_BORDER : stage === 2 ? PB : stage === 1 ? '#FED7AA' : BD}` }}>
            {STAGE_LABELS[stage]}
          </span>
        </div>
      </div>
    </button>
  )
}

// ── Profile Home (landing page) ──────────────────────────────────────────────
function ProfileHome({ queries, onOpenQueries, onClose }) {
  const activeCount = queries.filter(q => q.status !== 'resolved').length
  const resolvedCount = queries.filter(q => q.status === 'resolved').length

  const MenuRow = ({ icon, title, subtitle, badge, onClick, disabled }) => (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ width: '100%', textAlign: 'left', background: 'white', border: `1px solid ${BD}`, borderRadius: 14, padding: '14px 16px', cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'box-shadow 0.15s, border-color 0.15s', opacity: disabled ? 0.5 : 1 }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = PB; e.currentTarget.style.boxShadow = `0 2px 12px rgba(83,74,183,0.1)` } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 11, background: PL, border: `1px solid ${PB}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T1 }}>{title}</div>
        <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>{subtitle}</div>
      </div>
      {badge && (
        <div style={{ padding: '3px 9px', borderRadius: 20, background: PL, border: `1px solid ${PB}`, fontSize: 11, fontWeight: 700, color: P, flexShrink: 0 }}>{badge}</div>
      )}
      {!disabled && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
          <polyline points="9,18 15,12 9,6"/>
        </svg>
      )}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'white', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T1 }}>My Profile</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: T2, padding: 4, lineHeight: 1, display: 'flex', alignItems: 'center' }}>✕</button>
      </div>

      {/* Avatar + name */}
      <div style={{ padding: '20px 18px 18px', display: 'flex', alignItems: 'center', gap: 14, background: 'white', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${P} 0%, ${PD} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 16px rgba(83,74,183,0.3)` }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: 'white' }}>A</span>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T1, letterSpacing: '-0.3px' }}>Anant Trivedi</div>
          <div style={{ fontSize: 12, color: T2, marginTop: 2 }}>NORCET Gold 2024</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5, padding: '2px 8px', background: PL, borderRadius: 20, border: `1px solid ${PB}` }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: P }}>Student · STU-2024-1429</span>
          </div>
        </div>
      </div>

      {/* Menu cards */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10, background: BG2 }}>
        <MenuRow
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/></svg>}
          title="Your Queries"
          subtitle={`${queries.length} total · ${activeCount} in review · ${resolvedCount} resolved`}
          badge={activeCount > 0 ? `${activeCount} active` : undefined}
          onClick={onOpenQueries}
        />
        <MenuRow
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
          title="Your Collection"
          subtitle="Bookmarks, saved questions and notes"
          disabled
        />
      </div>
    </div>
  )
}

// ── Queries Sub-view ──────────────────────────────────────────────────────────
function QueriesView({ queries, onBack, onClose, onSelect }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const activeCount = queries.filter(q => q.status !== 'resolved').length
  const resolvedCount = queries.filter(q => q.status === 'resolved').length

  const byFilter = filter === 'all' ? queries
    : filter === 'active' ? queries.filter(q => q.status !== 'resolved')
    : queries.filter(q => q.status === 'resolved')

  const sq = search.trim().toLowerCase()
  const filtered = sq
    ? byFilter.filter(x =>
        x.category?.toLowerCase().includes(sq) ||
        x.sub_option?.toLowerCase().includes(sq) ||
        x.query_text?.toLowerCase().includes(sq) ||
        ticketId(x.id).toLowerCase().includes(sq)
      )
    : byFilter

  const STAT_ITEMS = [
    { label: 'Raised',    value: queries.length, key: 'all',      color: P,      bg: PL,        border: PB },
    { label: 'In Review', value: activeCount,     key: 'active',  color: ORANGE, bg: ORANGE_BG, border: '#FED7AA' },
    { label: 'Resolved',  value: resolvedCount,   key: 'resolved', color: GREEN,  bg: GREEN_BG,  border: GREEN_BORDER },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'white', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', padding: 2 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: T1 }}>Your Queries</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: T2, padding: 4, lineHeight: 1, display: 'flex', alignItems: 'center' }}>✕</button>
      </div>

      {/* Stats — clickable filters */}
      <div style={{ flexShrink: 0, borderBottom: `1px solid ${BD}`, background: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {STAT_ITEMS.map((stat, i) => (
            <button key={stat.key} onClick={() => setFilter(stat.key)}
              style={{ padding: '14px 6px', textAlign: 'center', cursor: 'pointer', border: 'none', background: filter === stat.key ? stat.bg : 'white', borderRight: i < 2 ? `1px solid ${BD}` : 'none', borderBottom: `3px solid ${filter === stat.key ? stat.color : 'transparent'}`, transition: 'all 0.15s' }}
            >
              <div style={{ fontSize: 26, fontWeight: 900, color: stat.color, letterSpacing: '-1px' }}>{stat.value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: T3, marginTop: 3 }}>{stat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Section label + search toggle */}
      <div style={{ padding: '10px 16px 8px', background: 'white', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: searchOpen ? 8 : 0 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Query History</div>
            {!searchOpen && <div style={{ fontSize: 11, color: T3, marginTop: 1 }}>Tap any query to see its full timeline</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!searchOpen && <span style={{ fontSize: 11, color: T3 }}>{filter === 'all' ? 'All' : filter === 'active' ? 'In review' : 'Resolved'} · {filtered.length}</span>}
            <button
              onClick={() => { setSearchOpen(o => !o); if (searchOpen) setSearch('') }}
              style={{ background: searchOpen ? PL : 'none', border: `1px solid ${searchOpen ? PB : BD}`, borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: searchOpen ? P : T2, transition: 'all 0.15s' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              {!searchOpen && <span style={{ fontSize: 11, fontWeight: 600 }}>Search</span>}
            </button>
          </div>
        </div>
        {searchOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: BG2, border: `1.5px solid ${search ? PB : BD}`, borderRadius: 10, padding: '7px 10px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by category, issue, or ticket ID..." style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 12, color: T1, fontFamily: 'inherit' }} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, fontSize: 14, padding: 0, lineHeight: 1, display: 'flex' }}>✕</button>}
          </div>
        )}
        {searchOpen && <div style={{ fontSize: 10, color: T3, marginTop: 5 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}{search ? ` for "${search}"` : ''}</div>}
      </div>

      {/* Query list */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 14px 24px', display: 'flex', flexDirection: 'column', gap: 8, background: BG2 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: T3, fontSize: 13 }}>No queries found</div>
        ) : (
          filtered.map(q => <QueryCard key={q.id} query={q} onClick={() => onSelect(q)} />)
        )}
      </div>
    </div>
  )
}

// ── Main Overlay ─────────────────────────────────────────────────────────────
export default function QueryTracker({ onClose }) {
  const { queries } = useQueries()
  const [view, setView] = useState('profile') // 'profile' | 'queries' | 'detail'
  const [selected, setSelected] = useState(null)

  const openQuery = (q) => { setSelected(q); setView('detail') }

  if (view === 'detail' && selected) return (
    <div style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <QueryDetailView query={selected} onBack={() => setView('queries')} onClose={onClose} />
    </div>
  )

  if (view === 'queries') return (
    <div style={{ position: 'absolute', inset: 0, background: BG2, zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <QueriesView queries={queries} onBack={() => setView('profile')} onClose={onClose} onSelect={openQuery} />
    </div>
  )

  return (
    <div style={{ position: 'absolute', inset: 0, background: BG2, zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ProfileHome queries={queries} onOpenQueries={() => setView('queries')} onClose={onClose} />
    </div>
  )
}
