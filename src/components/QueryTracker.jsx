import { useState } from 'react'
import { useQueries } from '../context/QueryContext'

const P = '#534AB7', PL = '#EEEDFE', PB = '#AFA9EC', PD = '#3C3489'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'
const GREEN = '#22C55E', GREEN_BG = '#F0FDF4', GREEN_BORDER = '#86EFAC'
const ORANGE = '#E07B2A', ORANGE_BG = '#FFF3E8'

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

const AGENTS = [
  { name: 'Priya S.',  team: 'Content QA',  avatar: 'P', color: '#7C3AED' },
  { name: 'Rahul M.',  team: 'Content QA',  avatar: 'R', color: '#0369A1' },
  { name: 'Sneha T.',  team: 'Engineering', avatar: 'S', color: '#059669' },
  { name: 'Amit K.',   team: 'Educator',    avatar: 'A', color: '#DC2626' },
]

const TIMELINE_STEPS = [
  { key: 'raised',   title: 'Query raised',        desc: 'Your report has been logged',             detail: "We've received your query and it's in our review queue." },
  { key: 'received', title: 'Received by team',     desc: 'Content team has picked this up',         detail: 'Our team has acknowledged your report and will begin review shortly.' },
  { key: 'assigned', title: 'Agent assigned',       desc: null,                                       detail: 'Your query is being actively reviewed by an expert.' },
  { key: 'resolved', title: 'Query resolved',       desc: 'Issue addressed',                         detail: "We've reviewed and updated the question. Thank you for helping us improve NPrep!" },
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

// ── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          style={{ background: 'none', border: 'none', padding: 2, fontSize: 26, lineHeight: 1, cursor: 'pointer', color: s <= (hovered || value) ? '#FBBF24' : '#D1D5DB', transform: hovered === s ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.1s, color 0.1s' }}
        >★</button>
      ))}
    </div>
  )
}

// ── Timeline Step ────────────────────────────────────────────────────────────
function TimelineStep({ step, idx, activeIdx, agent, stepTimestamps, isLast }) {
  const status = idx < activeIdx ? 'done' : idx === activeIdx ? 'active' : 'pending'
  return (
    <div style={{ display: 'flex', gap: 12, opacity: status === 'pending' ? 0.38 : 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: status === 'done' ? GREEN : status === 'active' ? P : 'white', border: `2px solid ${status === 'done' ? GREEN : status === 'active' ? P : BD}`, boxShadow: status === 'active' ? `0 0 0 4px ${PL}` : 'none', animation: status === 'active' ? 'tl-pulse 2s ease-in-out infinite' : 'none', flexShrink: 0 }}>
          {status === 'done'
            ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <div style={{ width: 7, height: 7, borderRadius: '50%', background: status === 'active' ? 'white' : BD }} />}
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 24, background: idx < activeIdx ? GREEN : BD, marginTop: 2, borderRadius: 1 }} />}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: status === 'pending' ? T3 : T1 }}>{step.title}</span>
          {stepTimestamps[idx] && <span style={{ fontSize: 10, color: T3 }}>{stepTimestamps[idx]}</span>}
        </div>
        <p style={{ fontSize: 11, color: T2, lineHeight: 1.5, margin: 0 }}>
          {step.key === 'assigned' && status !== 'pending'
            ? <>{agent.name} · <strong>{agent.team}</strong></>
            : step.desc}
        </p>
        {status === 'active' && step.key === 'assigned' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7, padding: '7px 10px', background: PL, borderRadius: 8, border: `1px solid ${PB}` }}>
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
        {status === 'done' && (
          <p style={{ fontSize: 10, color: T3, marginTop: 3, lineHeight: 1.4 }}>{step.detail}</p>
        )}
      </div>
    </div>
  )
}

// ── Feedback Section ─────────────────────────────────────────────────────────
function FeedbackSection() {
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [expertOpt, setExpertOpt] = useState(false)

  if (submitted) return (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{rating >= 4 ? '🎉' : '🙏'}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 3 }}>{rating >= 4 ? 'Thanks for the love!' : 'Thanks for your feedback!'}</div>
      <div style={{ fontSize: 11, color: T2 }}>{rating >= 4 ? 'Your experience helps us improve NPrep.' : "We'll use this to do better."}</div>
    </div>
  )

  const isLow = rating > 0 && rating <= 3
  const isHigh = rating >= 4

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 8 }}>Rate this resolution</div>
      <StarRating value={rating} onChange={setRating} />
      {isLow && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, color: T2, marginBottom: 6 }}>
            We're sorry. What could we have done better? <span style={{ color: '#DC2626' }}>*</span>
          </div>
          <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
            placeholder="Tell us what went wrong..."
            style={{ width: '100%', minHeight: 72, padding: '9px 11px', border: `1px solid ${BD}`, borderRadius: 10, fontSize: 12, color: T1, resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>
      )}
      {isHigh && (
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={expertOpt} onChange={e => setExpertOpt(e.target.checked)} style={{ marginTop: 2, accentColor: P }} />
            <span style={{ fontSize: 12, color: T2 }}>I'd love to share this as a testimonial</span>
          </label>
          {expertOpt && (
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="What did we do right? (optional)"
              style={{ marginTop: 7, width: '100%', minHeight: 60, padding: '9px 11px', border: `1px solid ${PB}`, borderRadius: 10, fontSize: 12, color: T1, resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
            />
          )}
        </div>
      )}
      {rating > 0 && (
        <button onClick={() => setSubmitted(true)} disabled={isLow && !feedback.trim()}
          style={{ marginTop: 10, width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: isLow && !feedback.trim() ? '#e2e2ec' : P, color: isLow && !feedback.trim() ? T3 : 'white', fontSize: 13, fontWeight: 600, cursor: isLow && !feedback.trim() ? 'not-allowed' : 'pointer' }}
        >Submit feedback</button>
      )}
    </div>
  )
}

// ── Query Detail View ─────────────────────────────────────────────────────────
function QueryDetailView({ query, onBack, onClose }) {
  const [stage, setStage] = useState(2)
  const agent = agentForQuery(query)
  const meta = CATEGORY_META[query.category] || CATEGORY_META['Others']
  const raised = new Date(query.timestamp).getTime()
  const stepTimestamps = [
    timeAgo(query.timestamp),
    stage >= 1 ? timeAgo(new Date(raised + 300000).toISOString()) : null,
    stage >= 2 ? timeAgo(new Date(raised + 900000).toISOString()) : null,
    stage >= 3 ? 'Just now' : null,
  ]
  const STAGE_LABELS = ['Raised', 'In Review', 'Working', 'Resolved']
  const STAGE_COLORS = [P, ORANGE, '#0369A1', GREEN]

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
          <div style={{ padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: stage === 3 ? GREEN_BG : PL, color: stage === 3 ? GREEN : P, border: `1px solid ${stage === 3 ? GREEN_BORDER : PB}` }}>
            {STAGE_LABELS[stage]}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: T3, padding: 2 }}>✕</button>
        </div>
        {/* Query summary */}
        <div style={{ background: BG2, borderRadius: 9, padding: '8px 11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: meta.color }}>{meta.abbr}</div>
            <span style={{ fontSize: 10, fontWeight: 700, color: meta.color }}>{query.category}</span>
          </div>
          <div style={{ fontSize: 11, color: T2 }}>{query.sub_option}</div>
          {query.query_text && <div style={{ fontSize: 10, color: T3, marginTop: 2, fontStyle: 'italic' }}>"{query.query_text}"</div>}
        </div>
      </div>

      {/* Stage toggle */}
      <div style={{ padding: '8px 14px', background: '#FAFAFD', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <div style={{ fontSize: 9, color: T3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Simulate stage</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {STAGE_LABELS.map((label, i) => (
            <button key={i} onClick={() => setStage(i)}
              style={{ flex: 1, padding: '5px 3px', borderRadius: 7, border: `1.5px solid ${stage === i ? STAGE_COLORS[i] : BD}`, background: stage === i ? (i === 3 ? GREEN_BG : i === 0 ? PL : i === 1 ? ORANGE_BG : '#EFF6FF') : 'white', color: stage === i ? STAGE_COLORS[i] : T3, fontSize: 9, fontWeight: stage === i ? 700 : 400, cursor: 'pointer', lineHeight: 1.4, textAlign: 'center' }}
            >{i + 1}<br />{label}</button>
          ))}
        </div>
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {/* Status banner */}
        {stage < 3 && (
          <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 11, background: stage === 2 ? PL : stage === 1 ? ORANGE_BG : BG2, border: `1px solid ${stage === 2 ? PB : stage === 1 ? '#FED7AA' : BD}`, display: 'flex', alignItems: 'center', gap: 9 }}>
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
          <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 11, background: GREEN_BG, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', gap: 9 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#14532D' }}>Query resolved</div>
              <div style={{ fontSize: 10, color: '#166534' }}>The question has been reviewed and updated</div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Timeline</div>
          {TIMELINE_STEPS.map((step, idx) => (
            <TimelineStep key={step.key} step={step} idx={idx} activeIdx={stage} agent={agent} stepTimestamps={stepTimestamps} isLast={idx === TIMELINE_STEPS.length - 1} />
          ))}
        </div>

        {/* Feedback */}
        {stage === 3 && (
          <div style={{ padding: '12px', borderRadius: 12, border: `1px solid ${BD}`, background: 'white' }}>
            <FeedbackSection />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Query Card ───────────────────────────────────────────────────────────────
function QueryCard({ query, onClick }) {
  const meta = CATEGORY_META[query.category] || CATEGORY_META['Others']
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
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: query.status === 'resolved' ? GREEN_BG : PL, color: query.status === 'resolved' ? GREEN : P, border: `1px solid ${query.status === 'resolved' ? GREEN_BORDER : PB}` }}>
            {query.status === 'resolved' ? 'Resolved' : 'In review'}
          </span>
        </div>
      </div>
    </button>
  )
}

// ── Main Overlay ─────────────────────────────────────────────────────────────
export default function QueryTracker({ onClose }) {
  const { queries } = useQueries()
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const activeCount = queries.filter(q => q.status !== 'resolved').length
  const resolvedCount = queries.filter(q => q.status === 'resolved').length

  const filtered = filter === 'all' ? queries
    : filter === 'active' ? queries.filter(q => q.status !== 'resolved')
    : queries.filter(q => q.status === 'resolved')

  if (selected) return (
    <div style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <QueryDetailView query={selected} onBack={() => setSelected(null)} onClose={onClose} />
    </div>
  )

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T1 }}>My Profile</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: T2, padding: 4, lineHeight: 1, display: 'flex', alignItems: 'center' }}>✕</button>
      </div>

      {/* Profile + stats */}
      <div style={{ background: P, padding: '16px 16px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: P }}>A</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>Anant Trivedi</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>NORCET Gold 2024</div>
          </div>
        </div>
        {/* Clickable stat filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[
            { label: 'Raised', value: queries.length,  key: 'all' },
            { label: 'In review', value: activeCount,   key: 'active' },
            { label: 'Resolved',  value: resolvedCount, key: 'resolved' },
          ].map(stat => (
            <button key={stat.key} onClick={() => setFilter(stat.key)} style={{ background: filter === stat.key ? 'rgba(255,255,255,0.26)' : 'rgba(255,255,255,0.11)', border: `1.5px solid ${filter === stat.key ? 'rgba(255,255,255,0.55)' : 'transparent'}`, borderRadius: 10, padding: '9px 6px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)' }}>{stat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: '11px 16px 7px', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>My Queries</div>
          <div style={{ fontSize: 11, color: T3 }}>
            {filter === 'all' ? 'All' : filter === 'active' ? 'In review' : 'Resolved'} · {filtered.length}
          </div>
        </div>
        <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>Tap any query to see its full timeline</div>
      </div>

      {/* Full query list — no limit */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 14px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: T3, fontSize: 13 }}>No queries in this category</div>
        ) : (
          filtered.map(q => <QueryCard key={q.id} query={q} onClick={() => setSelected(q)} />)
        )}
      </div>
    </div>
  )
}
