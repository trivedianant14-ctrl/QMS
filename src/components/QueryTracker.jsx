import { useState } from 'react'
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

// ── Thumbs Feedback (replaces star rating) ──────────────────────────────────
function ThumbsFeedback({ agent }) {
  const [choice, setChoice] = useState(null) // 'up' | 'down'

  if (choice === 'up') return (
    <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#14532D', marginBottom: 4 }}>Great, glad it helped!</div>
      <div style={{ fontSize: 12, color: T2, lineHeight: 1.5 }}>
        Your ticket is now closed. Keep learning — NPrep's got your back.
      </div>
    </div>
  )

  if (choice === 'down') return (
    <div style={{ padding: '10px 0 4px' }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>📞</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: T1, marginBottom: 4 }}>We're reopening your ticket</div>
        <div style={{ fontSize: 12, color: T2, lineHeight: 1.6 }}>
          {agent.name} from <strong>{agent.team}</strong> will call you shortly to understand your doubt better and resolve it properly.
        </div>
      </div>
      <div style={{ background: ORANGE_BG, border: `1px solid #FED7AA`, borderRadius: 10, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: agent.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>{agent.avatar}</span>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>{agent.name} · {agent.team}</div>
            <div style={{ fontSize: 10, color: ORANGE }}>Will reach out within 24 hours</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: '#92400E', borderTop: `1px solid #FED7AA`, paddingTop: 7, marginTop: 2 }}>
          Ticket status changed to <strong>Escalated</strong>. You'll get a notification before the call.
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 4 }}>Did this resolve your issue?</div>
      <div style={{ fontSize: 11, color: T2, marginBottom: 14 }}>Your feedback helps us close the loop or escalate if needed.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Thumbs UP */}
        <button
          onClick={() => setChoice('up')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 10px', borderRadius: 12, border: `1.5px solid ${GREEN_BORDER}`, background: GREEN_BG, cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = `0 4px 12px rgba(34,197,94,0.2)` }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <span style={{ fontSize: 28 }}>👍</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#14532D' }}>Yes, got it!</span>
          <span style={{ fontSize: 10, color: '#166534', textAlign: 'center', lineHeight: 1.4 }}>Issue is resolved</span>
        </button>
        {/* Thumbs DOWN */}
        <button
          onClick={() => setChoice('down')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 10px', borderRadius: 12, border: `1.5px solid ${RED_BORDER}`, background: RED_BG, cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = `0 4px 12px rgba(220,38,38,0.15)` }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <span style={{ fontSize: 28 }}>👎</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: RED }}>Still confused</span>
          <span style={{ fontSize: 10, color: '#B91C1C', textAlign: 'center', lineHeight: 1.4 }}>Need more help</span>
        </button>
      </div>
    </div>
  )
}

// ── Timeline Step ────────────────────────────────────────────────────────────
function TimelineStep({ step, idx, activeIdx, agent, stepTimestamps, isLast, query }) {
  const [expanded, setExpanded] = useState(false)
  const status = idx < activeIdx ? 'done' : idx === activeIdx ? 'active' : 'pending'
  const meta = CATEGORY_META[query?.category] || CATEGORY_META['Others']
  const isExpandable = (step.key === 'raised' || step.key === 'resolved') && status !== 'pending'

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
            <ThumbsFeedback agent={agent} />
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

// ── Profile Header ───────────────────────────────────────────────────────────
function ProfileHeader({ queries, filter, setFilter }) {
  const activeCount = queries.filter(q => q.status !== 'resolved').length
  const resolvedCount = queries.filter(q => q.status === 'resolved').length

  const STAT_ITEMS = [
    { label: 'Raised',    value: queries.length, key: 'all',      color: P,       bg: PL,       border: PB },
    { label: 'In Review', value: activeCount,     key: 'active',   color: ORANGE,  bg: ORANGE_BG, border: '#FED7AA' },
    { label: 'Resolved',  value: resolvedCount,   key: 'resolved', color: GREEN,   bg: GREEN_BG,  border: GREEN_BORDER },
  ]

  return (
    <div style={{ flexShrink: 0 }}>
      {/* Avatar + name */}
      <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 14, background: 'white', borderBottom: `1px solid ${BD}` }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${P} 0%, ${PD} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 16px rgba(83,74,183,0.32)` }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>A</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T1, letterSpacing: '-0.3px' }}>Anant Trivedi</div>
          <div style={{ fontSize: 12, color: T2, marginTop: 2 }}>NORCET Gold 2024</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5, padding: '2px 8px', background: PL, borderRadius: 20, border: `1px solid ${PB}` }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: P }}>Student · STU-2024-1429</span>
          </div>
        </div>
      </div>

      {/* Stats card */}
      <div style={{ margin: '12px 16px', borderRadius: 14, border: `1px solid ${BD}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '10px 14px 8px', background: BG2, borderBottom: `1px solid ${BD}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your Queries</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'white' }}>
          {STAT_ITEMS.map((stat, i) => (
            <button key={stat.key} onClick={() => setFilter(stat.key)}
              style={{ padding: '12px 6px', textAlign: 'center', cursor: 'pointer', border: 'none', background: filter === stat.key ? stat.bg : 'white', borderRight: i < 2 ? `1px solid ${BD}` : 'none', borderBottom: `3px solid ${filter === stat.key ? stat.color : 'transparent'}`, transition: 'all 0.15s' }}
            >
              <div style={{ fontSize: 24, fontWeight: 900, color: stat.color, letterSpacing: '-1px' }}>{stat.value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: T3, marginTop: 2 }}>{stat.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Overlay ─────────────────────────────────────────────────────────────
export default function QueryTracker({ onClose }) {
  const { queries } = useQueries()
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const byFilter = filter === 'all' ? queries
    : filter === 'active' ? queries.filter(q => q.status !== 'resolved')
    : queries.filter(q => q.status === 'resolved')

  const q = search.trim().toLowerCase()
  const filtered = q
    ? byFilter.filter(x =>
        x.category?.toLowerCase().includes(q) ||
        x.sub_option?.toLowerCase().includes(q) ||
        x.query_text?.toLowerCase().includes(q) ||
        ticketId(x.id).toLowerCase().includes(q)
      )
    : byFilter

  if (selected) return (
    <div style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <QueryDetailView query={selected} onBack={() => setSelected(null)} onClose={onClose} />
    </div>
  )

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F7F7FB', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'white', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T1 }}>My Profile</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: T2, padding: 4, lineHeight: 1, display: 'flex', alignItems: 'center' }}>✕</button>
      </div>

      {/* Profile header + stats */}
      <ProfileHeader queries={queries} filter={filter} setFilter={setFilter} />

      {/* My Queries section label + search */}
      <div style={{ padding: '10px 16px 8px', background: 'white', borderBottom: `1px solid ${BD}`, flexShrink: 0, marginTop: 0 }}>
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
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 14px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: T3, fontSize: 13 }}>No queries found</div>
        ) : (
          filtered.map(q => <QueryCard key={q.id} query={q} onClick={() => setSelected(q)} />)
        )}
      </div>
    </div>
  )
}
