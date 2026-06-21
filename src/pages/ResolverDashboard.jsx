import { useState, useMemo } from 'react'
import { useQueries } from '../context/QueryContext'
import { useNotifications } from '../context/NotificationContext'

const DEMO_RESOLVER = 'Priya S. — Content QA'
const AVATAR_CLR   = '#7C3AED'
const MAX_LOAD     = 6

const STAGES = [
  { key: 'raised',   label: 'Raised' },
  { key: 'received', label: 'In Review' },
  { key: 'assigned', label: 'Being Worked On' },
  { key: 'resolved', label: 'Resolved' },
]

const RESOLUTION_CODES = [
  { value: '',                 label: 'Select a resolution code…' },
  { value: 'answered',         label: 'Answered — Doubt resolved' },
  { value: 'content_fixed',    label: 'Content Fixed — Question updated' },
  { value: 'duplicate',        label: 'Duplicate — Already reported' },
  { value: 'not_reproducible', label: 'Not Reproducible' },
  { value: 'workaround',       label: 'Workaround Provided' },
  { value: 'escalated_eng',    label: 'Escalated to Engineering' },
]

const QUEUE_TABS = [
  { key: 'all',       icon: '📋', label: 'All Tickets'   },
  { key: 'unclaimed', icon: '🔓', label: 'Unclaimed'     },
  { key: 'content',   icon: '📄', label: 'Content'       },
  { key: 'faculty',   icon: '👩‍🏫', label: 'With Faculty' },
  { key: 'breach',    icon: '⏱',  label: 'Breaching'    },
  { key: 'escalated', icon: '⚠',  label: 'Escalated'    },
  { key: 'perf',      icon: '📊', label: 'Performance'  },
]

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 }

function getPriority(q) {
  if (q.timeline_status === 'resolved') return 'low'
  const ms = new Date(q.timestamp).getTime() + q.sla_hours * 3600000 - Date.now()
  if (ms <= 0 || ms <= 4 * 3600000) return 'high'
  if (ms <= 24 * 3600000) return 'medium'
  return 'low'
}

function slaInfo(q) {
  if (q.timeline_status === 'resolved') return { text: 'Closed', color: '#9AAABB', type: 'closed', ms: Infinity }
  const ms = new Date(q.timestamp).getTime() + q.sla_hours * 3600000 - Date.now()
  if (ms <= 0) return { text: 'Breached', color: '#EF4444', type: 'overdue', ms: 0 }
  const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000)
  const text = `${h}h ${m}m`
  if (h < 2)  return { text, color: '#EF4444', type: 'overdue', ms }
  if (h < 24) return { text, color: '#F59E0B', type: 'due-soon', ms }
  return { text, color: '#10B981', type: 'on-track', ms }
}

function timeAgo(iso) {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000)
  if (h >= 24) return `${Math.floor(h / 24)}d ago`
  if (h >= 1) return `${h}h ago`
  if (m < 1) return 'just now'
  return `${m}m ago`
}

function slaDead(q) {
  const d = new Date(new Date(q.timestamp).getTime() + q.sla_hours * 3600000)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function stageIdx(status) { return Math.max(0, STAGES.findIndex(s => s.key === status)) }
function codeLabel(code) { return RESOLUTION_CODES.find(c => c.value === code)?.label || code }
function satColor(s) { return s >= 4 ? '#10B981' : s >= 3 ? '#F59E0B' : '#EF4444' }

function buildActivity(queries) {
  const events = []
  queries.forEach(q => {
    events.push({ icon: '📝', text: `Submitted · ${q.sub_option.slice(0, 32)}`, ticket: q.ticket_id, time: q.timestamp, type: 'raised' })
    if (q.faculty_assigned_at) events.push({ icon: '👩‍🏫', text: `Auto-assigned → ${q.faculty_assigned}`, ticket: q.ticket_id, time: q.faculty_assigned_at, type: 'assign' })
    ;(q.notes || []).forEach(n => events.push({ icon: '📌', text: `Note · ${n.text.slice(0, 30)}`, ticket: q.ticket_id, time: n.timestamp, type: 'note' }))
    if (q.escalated_engineering) events.push({ icon: '⚙', text: 'Escalated to Engineering', ticket: q.ticket_id, time: q.timestamp, type: 'eng' })
    if (q.resolved_at && q.timeline_status === 'resolved') events.push({ icon: '✓', text: `Closed · ${q.resolution_code || 'resolved'}`, ticket: q.ticket_id, time: q.resolved_at, type: 'resolved' })
    if (q.feedback_type === 'thumbs_down') events.push({ icon: '⚠', text: 'Student escalated', ticket: q.ticket_id, time: q.resolved_at, type: 'esc' })
  })
  return events.filter(e => e.time).sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 12)
}

// ── Chips ─────────────────────────────────────────────────────────────────────

function PriorityDot({ priority }) {
  const c = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' }[priority] || '#C4C4D4'
  return <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: c, marginRight: 7, flexShrink: 0 }} />
}

function SlaChip({ info }) {
  const S = { 'on-track': { bg: '#F0FDF4', c: '#166534', b: '#86EFAC' }, 'due-soon': { bg: '#FFFBEB', c: '#92400E', b: '#FCD34D' }, overdue: { bg: '#FEF2F2', c: '#991B1B', b: '#FECACA' }, closed: { bg: '#F0F0F8', c: '#9AAABB', b: '#E4E4F0' } }
  const s = S[info.type] || S.closed
  return (
    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 9px', borderRadius: 999, background: s.bg, color: s.c, border: `1px solid ${s.b}`, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {info.type === 'on-track' && <span>✓</span>}{info.text}
    </span>
  )
}

function StatusChip({ status }) {
  const map = { raised: { label: 'Raised', bg: '#EFF0F7', c: '#5A6A7E' }, received: { label: 'In Review', bg: '#EDE9FE', c: '#4C1D95' }, assigned: { label: 'Working On', bg: '#EDE9FE', c: '#4C1D95' }, resolved: { label: 'Resolved', bg: '#F0FDF4', c: '#166534' } }
  const s = map[status] || { label: status, bg: '#EFF0F7', c: '#5A6A7E' }
  return <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 9px', borderRadius: 999, background: s.bg, color: s.c, whiteSpace: 'nowrap' }}>{s.label}</span>
}

// ── StatusBar ─────────────────────────────────────────────────────────────────

function StatusBar({ query, onAdvance }) {
  const currentIdx = stageIdx(query.timeline_status)
  const nextAction = (() => {
    if (query.timeline_status === 'resolved' || query.routed_to === 'faculty') return null
    if (query.timeline_status === 'raised')   return { label: 'Mark In Review →', next: 'received' }
    if (query.timeline_status === 'received') return { label: 'Mark Being Worked On →', next: 'assigned' }
    return null
  })()
  return (
    <div className="rsv-stage-bar">
      {STAGES.map((stage, i) => {
        const done = i < currentIdx; const active = i === currentIdx
        return (
          <div key={stage.key} style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
            {i > 0 && <div className={`rsv-stage-line${done ? ' rsv-stage-line--done' : ' rsv-stage-line--future'}`} />}
            <div className="rsv-stage">
              <div className={`rsv-stage-dot rsv-stage-dot--${done ? 'done' : active ? 'active' : 'future'}`}>{done ? '✓' : i + 1}</div>
              <span className={`rsv-stage-lbl rsv-stage-lbl--${done ? 'done' : active ? 'active' : 'future'}`}>{stage.label}</span>
            </div>
          </div>
        )
      })}
      {nextAction && <button type="button" className="rsv-advance-btn" onClick={() => onAdvance(nextAction.next)}>{nextAction.label}</button>}
    </div>
  )
}

// ── EscalationCard ────────────────────────────────────────────────────────────

function EscalationCard({ query, onClose }) {
  const [finalText, setFinalText] = useState(query.resolution_text || '')
  if (query.escalation_resolved) {
    return (
      <div className="rsv-esc-card rsv-esc-card--resolved">
        <div className="rsv-esc-hdr">
          <span className="rsv-esc-title rsv-esc-title--resolved">✓ Escalation Closed</span>
          {query.escalation_rating != null && <span className="rsv-esc-rating" style={{ color: satColor(query.escalation_rating) }}>{query.escalation_rating} ★</span>}
        </div>
        {query.escalation_review && <div className="rsv-esc-student-review">"{query.escalation_review}"</div>}
        <div className="rsv-esc-section">
          <div className="rsv-esc-label">Final Resolution Sent to Student</div>
          <div className="rsv-esc-text rsv-esc-text--violet">{query.resolution_text}</div>
        </div>
        {query.call_requested && <div className="rsv-esc-pill rsv-esc-pill--blue" style={{ marginTop: 8 }}>📞 Student had requested a call — fulfilled</div>}
      </div>
    )
  }
  return (
    <div className="rsv-esc-card rsv-esc-card--open">
      <div className="rsv-esc-hdr">
        <span className="rsv-esc-title rsv-esc-title--open">⚠ Student Escalated</span>
        <span className="rsv-esc-when">answered {timeAgo(query.resolved_at)} · student unsatisfied</span>
      </div>
      <div className="rsv-esc-timeline">
        <div className="rsv-esc-tl-row"><span className="rsv-esc-tl-dot rsv-esc-tl-dot--done" /><span className="rsv-esc-tl-text">Query raised <strong>{timeAgo(query.timestamp)}</strong></span></div>
        {query.faculty_assigned && <div className="rsv-esc-tl-row"><span className="rsv-esc-tl-dot rsv-esc-tl-dot--done" /><span className="rsv-esc-tl-text"><strong>{query.faculty_assigned}</strong> answered <strong>{timeAgo(query.resolved_at)}</strong></span></div>}
        <div className="rsv-esc-tl-row"><span className="rsv-esc-tl-dot rsv-esc-tl-dot--red" /><span className="rsv-esc-tl-text rsv-esc-tl-text--red">Student gave thumbs down — not satisfied with answer</span></div>
        {query.call_requested && <div className="rsv-esc-tl-row"><span className="rsv-esc-tl-dot rsv-esc-tl-dot--amber" /><span className="rsv-esc-tl-text rsv-esc-tl-text--amber">📞 Student requested a call-back</span></div>}
      </div>
      <div className="rsv-esc-section"><div className="rsv-esc-label">Why the Student Was Confused</div><div className="rsv-esc-quote">{query.query_text}</div></div>
      <div className="rsv-esc-section"><div className="rsv-esc-label">Answer Given — {query.faculty_assigned || 'Content Team'}</div><div className="rsv-esc-quote rsv-esc-quote--faculty">{query.resolution_text}</div></div>
      <div className="rsv-esc-action-box">
        <div className="rsv-esc-action-title">Your Action Required</div>
        <div className="rsv-esc-checklist">
          <div>• Review whether the explanation above was sufficient for the student</div>
          <div>• Edit the final resolution below to address the gap in understanding</div>
          {query.call_requested && <div className="rsv-esc-checklist-urgent">• ⚠ Student requested a call — arrange before closing</div>}
        </div>
        <div className="rsv-esc-label" style={{ marginTop: 14, marginBottom: 6 }}>Final Resolution (edit — this is what the student receives)</div>
        <textarea className="rsv-esc-ta" value={finalText} onChange={e => setFinalText(e.target.value)} rows={4} placeholder="Rewrite or supplement the explanation to fully resolve the doubt…" />
        <button type="button" className="rsv-esc-close-btn" disabled={!finalText.trim()} onClick={() => onClose(query.ticket_id, finalText.trim())}>Mark Escalation Resolved</button>
      </div>
    </div>
  )
}

// ── StudentSection ────────────────────────────────────────────────────────────

function StudentSection({ query }) {
  return (
    <div className="rsv-sq-section">
      <div className="rsv-sq-title">Student Query</div>
      <div className="rsv-sq-row"><span className="rsv-sq-label">Category</span><span className="rsv-sq-val">{query.category}</span></div>
      <div className="rsv-sq-row"><span className="rsv-sq-label">Sub-option</span><span className="rsv-sq-val">{query.sub_option}</span></div>
      <div className="rsv-sq-row"><span className="rsv-sq-label">Question</span><span className="rsv-sq-val">#{query.question_id} · {query.subject || query.subject_name}</span></div>
      {query.faculty_assigned && (
        <div className="rsv-sq-row">
          <span className="rsv-sq-label">Faculty</span>
          <span className="rsv-sq-val" style={{ color: '#534AB7' }}>{query.faculty_assigned}{query.faculty_assigned_at && <span style={{ color: '#5A6A7E', fontWeight: 400, marginLeft: 6 }}>(auto-assigned {timeAgo(query.faculty_assigned_at)})</span>}</span>
        </div>
      )}
      {query.query_text && <div className="rsv-sq-comment">"{query.query_text}"</div>}
      {query.question_text && <div className="rsv-sq-qblock"><div className="rsv-sq-qlabel">Question text</div><div className="rsv-sq-qtext">{query.question_text}</div></div>}
    </div>
  )
}

// ── ActionArea (Agent) ────────────────────────────────────────────────────────

function ActionArea({ query, onClaim, onRecall, onEscalate, onResolve, addNotification }) {
  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolveCode, setResolveCode] = useState('')
  const [resolveText, setResolveText] = useState('')
  if (!query) return null

  const isResolved      = query.timeline_status === 'resolved'
  const isFacultyRouted = query.routed_to === 'faculty'
  const hasFaculty      = !!query.faculty_assigned
  const isClaimed       = !!query.claimed_by
  const isEng           = query.escalated_engineering
  const isEscalated     = query.feedback_type === 'thumbs_down'
  const canMarkResolved = (query.timeline_status === 'assigned' || isClaimed) && !isFacultyRouted && !isEscalated

  if (isResolved && !isEscalated) {
    return (
      <div className="rsv-actions-area">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>✓ Resolved</span>
          {query.resolution_code && <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: '#F0FDF4', color: '#166534', border: '1px solid #86EFAC' }}>{codeLabel(query.resolution_code)}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="rsv-actions-area">
      {!isFacultyRouted && query.timeline_status === 'raised' && (
        <div className="rsv-claim-flow">
          <div className="rsv-claim-flow-title">How to resolve this ticket</div>
          <div className="rsv-claim-steps">
            <div className="rsv-claim-step rsv-claim-step--active">
              <div className="rsv-claim-step-num">1</div>
              <div><div className="rsv-claim-step-label">Claim Ticket</div><div className="rsv-claim-step-desc">Take ownership — it moves to your queue</div></div>
            </div>
            <div className="rsv-claim-step rsv-claim-step--future">
              <div className="rsv-claim-step-num">2</div>
              <div><div className="rsv-claim-step-label">Review &amp; Investigate</div><div className="rsv-claim-step-desc">Read the student's doubt, check the question, add internal notes</div></div>
            </div>
            <div className="rsv-claim-step rsv-claim-step--future">
              <div className="rsv-claim-step-num">3</div>
              <div><div className="rsv-claim-step-label">Resolve</div><div className="rsv-claim-step-desc">Pick a resolution code, write a summary, close the ticket</div></div>
            </div>
          </div>
          <div className="rsv-action-btns" style={{ marginTop: 16 }}>
            <button type="button" className="rsv-btn rsv-btn--primary rsv-btn--lg" onClick={() => onClaim(query.ticket_id)}>✋ Claim this Ticket</button>
          </div>
        </div>
      )}

      {!isFacultyRouted && isClaimed && !isResolved && (
        <div className="rsv-working-banner">
          <div className="rsv-working-badge">
            <span style={{ fontSize: 16 }}>✏️</span>
            <div>
              <div className="rsv-working-label">You're working on this</div>
              <div className="rsv-working-sub">Claimed {timeAgo(query.timestamp)} · {query.claimed_by}</div>
            </div>
          </div>
          <div className="rsv-action-btns" style={{ marginTop: 12 }}>
            {canMarkResolved && !resolveOpen && <button type="button" className="rsv-btn rsv-btn--primary rsv-btn--lg" onClick={() => setResolveOpen(true)}>✓ Mark Resolved</button>}
            {!isEng && (
              <button type="button" className="rsv-btn rsv-btn--ghost" onClick={() => { onEscalate(query.ticket_id); addNotification('General', `⚠ Escalated to Engineering: #${query.ticket_id}`, query.ticket_id) }}>
                Escalate to Engineering
              </button>
            )}
          </div>
        </div>
      )}

      {isFacultyRouted && hasFaculty && !isResolved && (
        <div className="rsv-action-btns">
          <div className="rsv-faculty-status-badge"><span>With {query.faculty_assigned}</span><span className="rsv-faculty-status-time">{timeAgo(query.faculty_assigned_at)}</span></div>
          <button type="button" className="rsv-btn rsv-btn--ghost" onClick={() => onRecall(query.ticket_id)}>Recall from Faculty</button>
        </div>
      )}

      {isEng && <div className="rsv-eng-banner"><span>⚙</span><span>Escalated to Engineering</span></div>}

      {resolveOpen && (
        <div className="rsv-resolve-form">
          <div className="rsv-resolve-form-title">Close this ticket</div>
          <select className="rsv-code-select" value={resolveCode} onChange={e => setResolveCode(e.target.value)}>
            {RESOLUTION_CODES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <textarea className="rsv-resolve-ta" placeholder="Resolution summary sent to the student (optional)…" value={resolveText} onChange={e => setResolveText(e.target.value)} rows={3} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="rsv-resolve-confirm" disabled={!resolveCode} onClick={() => { onResolve(query.ticket_id, resolveCode, resolveText); setResolveOpen(false) }}>Confirm &amp; Close Ticket</button>
            <button type="button" className="rsv-resolve-cancel" onClick={() => setResolveOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── NotesArea ─────────────────────────────────────────────────────────────────

function NotesArea({ query, onAddNote }) {
  const [noteText, setNoteText] = useState('')
  const notes = query?.notes || []
  return (
    <div className="rsv-notes-area">
      <div className="rsv-notes-title">Internal Notes{notes.length > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: '#C4C4D4' }}> {notes.length}</span>}</div>
      {notes.length === 0 && <div style={{ fontSize: 13, color: '#C4C4D4', fontStyle: 'italic', marginBottom: 12 }}>No notes yet — add context for your team.</div>}
      {[...notes].reverse().map((note, i) => (
        <div key={i} className={`rsv-note${note.type === 'revision_request' ? ' rsv-note--revision' : ''}`}>
          {note.type === 'revision_request' && <div className="rsv-note-tag">↩ Revision Requested</div>}
          <div className="rsv-note-meta"><span>{note.author}</span><span>{timeAgo(note.timestamp)}</span></div>
          <div className="rsv-note-text">{note.text}</div>
        </div>
      ))}
      {query?.timeline_status !== 'resolved' && (
        <div className="rsv-note-form">
          <textarea className="rsv-note-ta" placeholder="Add an internal note…" value={noteText} onChange={e => setNoteText(e.target.value)} rows={2} />
          <button type="button" className="rsv-note-save" disabled={!noteText.trim()} onClick={() => { onAddNote(noteText.trim()); setNoteText('') }}>Save Note</button>
        </div>
      )}
    </div>
  )
}

// ── ContextPanel ──────────────────────────────────────────────────────────────

function ContextPanel({ query, allQueries }) {
  const sla = slaInfo(query)
  const isResolved = query.timeline_status === 'resolved'
  return (
    <>
      <div className="rsv-ctx-section">
        <div className="rsv-ctx-title">Ticket Info</div>
        <div className="rsv-ctx-row"><div className="rsv-ctx-label">Raised</div><div className="rsv-ctx-value">{timeAgo(query.timestamp)}</div></div>
        <div className="rsv-ctx-row">
          <div className="rsv-ctx-label">SLA Deadline</div>
          <div className="rsv-ctx-value" style={{ color: sla.color }}>{slaDead(query)}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: sla.color, marginTop: 2 }}>{sla.text} remaining</div>
        </div>
        <div className="rsv-ctx-row"><div className="rsv-ctx-label">SLA Window</div><div className="rsv-ctx-value">{query.sla_hours}h</div></div>
        <div className="rsv-ctx-row"><div className="rsv-ctx-label">Route</div><div className="rsv-ctx-value rsv-ctx-value--violet">{query.routed_to}</div></div>
        {query.claimed_by && <div className="rsv-ctx-row"><div className="rsv-ctx-label">Claimed by</div><div className="rsv-ctx-value">{query.claimed_by}</div></div>}
        {query.faculty_assigned && <div className="rsv-ctx-row"><div className="rsv-ctx-label">Faculty</div><div className="rsv-ctx-value rsv-ctx-value--violet">{query.faculty_assigned}</div></div>}
      </div>
      {query.escalated_engineering && (
        <div className="rsv-ctx-section"><div className="rsv-ctx-title">Engineering</div><div className="rsv-eng-banner">⚙ Escalated to Engineering</div></div>
      )}
      {isResolved && (
        <div className="rsv-ctx-section">
          <div className="rsv-ctx-title">Resolution</div>
          {query.resolution_code && <div className="rsv-ctx-row"><div className="rsv-ctx-label">Code</div><span className="rsv-res-code">{codeLabel(query.resolution_code)}</span></div>}
          {query.resolution_text && <div className="rsv-res-text">"{query.resolution_text}"</div>}
          {query.satisfaction_score != null && (
            <div className="rsv-ctx-row" style={{ marginTop: 8 }}>
              <div className="rsv-ctx-label">Satisfaction</div>
              <div className="rsv-sat-score" style={{ color: satColor(query.satisfaction_score) }}>{query.satisfaction_score} ★<span style={{ fontSize: 11, color: '#9AAABB', fontWeight: 600 }}> ({(query.feedback_type || '').replace(/_/g, ' ')})</span></div>
            </div>
          )}
        </div>
      )}
      <div className="rsv-ctx-section">
        <div className="rsv-ctx-title">Queue Health</div>
        <div className="rsv-ctx-row"><div className="rsv-ctx-label">Open</div><div className="rsv-ctx-value">{allQueries.filter(q => q.timeline_status !== 'resolved').length}</div></div>
        <div className="rsv-ctx-row"><div className="rsv-ctx-label">With Faculty</div><div className="rsv-ctx-value rsv-ctx-value--violet">{allQueries.filter(q => q.faculty_assigned && q.timeline_status !== 'resolved').length}</div></div>
        <div className="rsv-ctx-row"><div className="rsv-ctx-label">Open Escalations</div><div className="rsv-ctx-value rsv-ctx-value--red">{allQueries.filter(q => q.feedback_type === 'thumbs_down' && !q.escalation_resolved).length}</div></div>
        <div className="rsv-ctx-row"><div className="rsv-ctx-label">My claimed</div><div className="rsv-ctx-value">{allQueries.filter(q => q.claimed_by === DEMO_RESOLVER && q.timeline_status !== 'resolved').length}</div></div>
      </div>
    </>
  )
}

// ── PerfPanel ─────────────────────────────────────────────────────────────────

function PerfPanel({ queries, myActive, myResolved, avgResH, avgCsat, resolvedToday, workloadPct }) {
  const activity = useMemo(() => buildActivity(queries), [queries])
  return (
    <>
      <div className="osd-right-section">
        <div className="osd-right-title">My Performance</div>
        <div style={{ fontSize: 11, color: '#C4C4D4', marginBottom: 14 }}>This week</div>
        <div style={{ marginBottom: 14 }}>
          <div className="osd-perf-label" style={{ marginBottom: 4 }}>Avg Resolution Time</div>
          <div className="osd-perf-big">{avgResH ? `${avgResH}h` : '—'}</div>
        </div>
        {avgCsat != null && (
          <div className="osd-perf-row">
            <div className="osd-perf-label">CSAT</div>
            <span style={{ fontSize: 16, fontWeight: 800, color: avgCsat >= 4 ? '#F59E0B' : '#EF4444' }}>{'★'.repeat(Math.round(avgCsat))} {avgCsat.toFixed(1)}</span>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
          {[{ label: 'Resolved today', value: resolvedToday, c: '#10B981' }, { label: 'Active', value: myActive.length, c: '#534AB7' }].map(m => (
            <div key={m.label} style={{ background: '#F8F8FC', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#9AAABB', fontWeight: 600, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: m.c }}>{m.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9AAABB', marginBottom: 5 }}>
            <span>Workload</span><span>{workloadPct}%</span>
          </div>
          <div style={{ height: 7, borderRadius: 4, background: '#F0F0F8', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${workloadPct}%`, background: workloadPct > 75 ? '#EF4444' : workloadPct > 50 ? '#F59E0B' : '#4ADE80', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>
      <div className="osd-right-section">
        <div className="osd-right-title">Recent Activity</div>
        {activity.length === 0
          ? <div style={{ fontSize: 13, color: '#C4C4D4', fontStyle: 'italic' }}>No recent activity</div>
          : activity.map((ev, i) => (
            <div key={i} className="osd-activity-item">
              <span className={`osd-act-icon osd-act-${ev.type}`}>{ev.icon}</span>
              <div>
                <div className="osd-act-text">{ev.text}</div>
                <div className="osd-act-meta"><span className="osd-act-ticket">{ev.ticket}</span><span style={{ color: '#C4C4D4' }}>·</span><span>{timeAgo(ev.time)}</span></div>
              </div>
            </div>
          ))
        }
      </div>
    </>
  )
}

// ── PerformanceView ───────────────────────────────────────────────────────────

function PerformanceView({ queries }) {
  const myResolved = queries.filter(q => q.claimed_by === DEMO_RESOLVER && q.timeline_status === 'resolved')
  const myActive   = queries.filter(q => q.claimed_by === DEMO_RESOLVER && q.timeline_status !== 'resolved')
  const scores     = myResolved.filter(q => q.satisfaction_score != null).map(q => q.satisfaction_score)
  const avgCsat    = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length) : null
  const avgResMs   = myResolved.length ? myResolved.reduce((s, q) => s + (q.resolved_at ? new Date(q.resolved_at) - new Date(q.timestamp) : 0), 0) / myResolved.length : null
  return (
    <div>
      <div className="osd-page-title">My Performance</div>
      <div style={{ fontSize: 12, color: '#9AAABB', marginBottom: 20 }}>{DEMO_RESOLVER}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Resolved', value: myResolved.length, c: '#10B981' },
          { label: 'Active', value: myActive.length, c: '#534AB7' },
          { label: 'Avg Resolution', value: avgResMs ? `${(avgResMs / 3600000).toFixed(1)}h` : '—', c: '#0D1E36' },
        ].map(m => (
          <div key={m.label} className="osd-white-card" style={{ textAlign: 'center', padding: '18px 12px' }}>
            <div style={{ fontSize: 11, color: '#9AAABB', fontWeight: 600, marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: m.c }}>{m.value}</div>
          </div>
        ))}
      </div>
      {avgCsat != null && (
        <div className="osd-white-card" style={{ marginBottom: 16 }}>
          <div className="osd-card-title">CSAT Score</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: avgCsat >= 4 ? '#F59E0B' : '#EF4444', margin: '8px 0' }}>{'★'.repeat(Math.round(avgCsat))} {avgCsat.toFixed(1)}</div>
          <div style={{ fontSize: 12, color: '#9AAABB' }}>Based on {scores.length} responses</div>
        </div>
      )}
      {myResolved.length > 0 && (
        <div className="osd-white-card">
          <div className="osd-card-title" style={{ marginBottom: 14 }}>Resolved Tickets</div>
          <table className="osd-table">
            <thead><tr><th>Ticket</th><th>Subject</th><th>Resolution Code</th><th>CSAT</th></tr></thead>
            <tbody>
              {myResolved.map(q => (
                <tr key={q.ticket_id} className="osd-tr">
                  <td><span className="osd-ticket-id">{q.ticket_id}</span></td>
                  <td style={{ fontSize: 12, color: '#5A6A7E' }}>{q.sub_option.slice(0, 35)}</td>
                  <td style={{ fontSize: 11, color: '#534AB7', fontWeight: 600 }}>{q.resolution_code || '—'}</td>
                  <td>{q.satisfaction_score != null ? <span style={{ fontSize: 12, fontWeight: 700, color: satColor(q.satisfaction_score) }}>{'★'.repeat(Math.round(q.satisfaction_score))} {q.satisfaction_score}</span> : <span style={{ color: '#C4C4D4', fontSize: 12 }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ResolverDashboard() {
  const { queries, claimTicket, resolveWithCode, escalateToEngineering, addNote, advanceStatus, closeEscalation, recallFromFaculty } = useQueries()
  const { addNotification } = useNotifications()

  const [tab,        setTab]        = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [search,     setSearch]     = useState('')
  const [sortCol,    setSortCol]    = useState('sla')
  const [sortDir,    setSortDir]    = useState('asc')

  const todayStart   = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime() })()
  const myActive     = queries.filter(q => q.claimed_by === DEMO_RESOLVER && q.timeline_status !== 'resolved')
  const myResolved   = queries.filter(q => q.claimed_by === DEMO_RESOLVER && q.timeline_status === 'resolved')
  const resolvedToday= queries.filter(q => q.resolved_at && q.claimed_by === DEMO_RESOLVER && new Date(q.resolved_at).getTime() >= todayStart).length
  const scores       = myResolved.filter(q => q.satisfaction_score != null).map(q => q.satisfaction_score)
  const avgCsat      = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : null
  const avgResMs     = myResolved.length ? myResolved.reduce((s, q) => s + (q.resolved_at ? new Date(q.resolved_at) - new Date(q.timestamp) : 0), 0) / myResolved.length : null
  const avgResH      = avgResMs ? (avgResMs / 3600000).toFixed(1) : null
  const workloadPct  = Math.round((myActive.length / MAX_LOAD) * 100)
  const unclaimed    = queries.filter(q => q.timeline_status === 'raised' && !q.claimed_by && !q.faculty_assigned && q.routed_to !== 'faculty')
  const escalatedOpen= queries.filter(q => q.feedback_type === 'thumbs_down' && !q.escalation_resolved)
  const breaching    = queries.filter(q => { if (q.timeline_status === 'resolved') return false; const ms = new Date(q.timestamp).getTime() + q.sla_hours * 3600000 - Date.now(); return ms < 4 * 3600000 })

  const tabFiltered = useMemo(() => {
    switch (tab) {
      case 'unclaimed': return unclaimed
      case 'content':   return queries.filter(q => q.routed_to === 'content' && q.timeline_status !== 'resolved')
      case 'faculty':   return queries.filter(q => q.faculty_assigned && q.timeline_status !== 'resolved')
      case 'breach':    return breaching
      case 'escalated': return escalatedOpen
      default:          return queries
    }
  }, [tab, queries, unclaimed, breaching, escalatedOpen])

  const tableData = useMemo(() => {
    let rows = tabFiltered
    if (search.trim()) { const s = search.toLowerCase(); rows = rows.filter(t => t.ticket_id.toLowerCase().includes(s) || t.sub_option.toLowerCase().includes(s) || t.category.toLowerCase().includes(s)) }
    const cmp = (a, b) => {
      if (sortCol === 'priority') { const d = PRIORITY_ORDER[getPriority(b)] - PRIORITY_ORDER[getPriority(a)]; return sortDir === 'asc' ? -d : d }
      if (sortCol === 'sla') { const ms = q => new Date(q.timestamp).getTime() + q.sla_hours * 3600000; return sortDir === 'asc' ? ms(a) - ms(b) : ms(b) - ms(a) }
      if (sortCol === 'raised') return sortDir === 'asc' ? new Date(a.timestamp) - new Date(b.timestamp) : new Date(b.timestamp) - new Date(a.timestamp)
      return 0
    }
    return [...rows].sort(cmp)
  }, [tabFiltered, search, sortCol, sortDir])

  const selectedQuery = queries.find(q => q.ticket_id === selectedId) ?? null
  const isPerf        = tab === 'perf'
  const isDetail      = !!selectedQuery && !isPerf

  const handleSort = col => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc') } }
  const SortArrow = ({ col }) => <span style={{ opacity: 0.5 }}>{sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>

  const handleClaim   = (id) => { claimTicket(id, DEMO_RESOLVER); addNotification('Content Queries', `Claimed #${id}`, id) }
  const handleAdvance = (id, next) => advanceStatus(id, next)
  const handleResolve = (id, code, text) => { resolveWithCode(id, code, text); addNotification('Content Queries', `Resolved #${id} · ${code}`, id) }
  const handleEscalate= (id) => escalateToEngineering(id)
  const handleNote    = (text) => addNote(selectedId, text, DEMO_RESOLVER)
  const handleClose   = (id, text) => { closeEscalation(id, text); addNotification('Content Queries', `Closed escalation on #${id}`, id) }
  const handleRecall  = (id) => recallFromFaculty(id)

  const tabLabel = QUEUE_TABS.find(t => t.key === tab)?.label || 'Tickets'
  const tabBadges = { unclaimed: unclaimed.length, breach: breaching.length, escalated: escalatedOpen.length }

  return (
    <div className="osd-page">
      <div className="osd-header">
        <div>
          <div className="osd-header-brand">NPrep QMS — Agent Dashboard</div>
          <div className="osd-header-sub">Content query resolution</div>
        </div>
        <div className="osd-header-right">
          <div className="osd-avatar" style={{ background: AVATAR_CLR }}>PS</div>
          <span className="osd-header-name">{DEMO_RESOLVER}</span>
        </div>
      </div>

      <div className="osd-body">

        {/* ── Sidebar ─────────────────────────────────────── */}
        <div className="osd-sidebar">
          <div className="osd-sidebar-nav">
            {QUEUE_TABS.map(t => {
              const cnt = tabBadges[t.key]
              return (
                <button key={t.key}
                  className={`osd-nav-item${tab === t.key ? ' active' : ''}${t.key === 'escalated' && escalatedOpen.length > 0 ? ' osd-nav-alert' : ''}`}
                  onClick={() => { setTab(t.key); setSelectedId(null) }}>
                  <span className="osd-nav-icon">{t.icon}</span>
                  <span>{t.label}</span>
                  {cnt > 0 && <span className={`osd-nav-badge${t.key === 'escalated' ? ' red' : ''}`}>{cnt}</span>}
                </button>
              )
            })}
          </div>
          <div className="osd-quick-glance">
            <div className="osd-qg-label">My Queue</div>
            <div className="osd-qg-row"><span>Active</span><strong>{myActive.length}</strong></div>
            <div className="osd-qg-row"><span>Resolved</span><strong style={{ color: '#10B981' }}>{myResolved.length}</strong></div>
            <div className="osd-qg-row"><span>Unclaimed</span><strong style={{ color: unclaimed.length > 0 ? '#F59E0B' : 'white' }}>{unclaimed.length}</strong></div>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8090A8', marginBottom: 5 }}>
                <span>Workload</span><span>{workloadPct}%</span>
              </div>
              <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${workloadPct}%`, background: workloadPct > 75 ? '#EF4444' : workloadPct > 50 ? '#F59E0B' : '#4ADE80', borderRadius: 4 }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content ────────────────────────────────── */}
        <div className="osd-main">
          {isPerf ? <PerformanceView queries={queries} /> :
           isDetail ? (
            <div className="rsv-detail-view">
              <button className="rsv-back-btn" onClick={() => setSelectedId(null)}>← Back to {tabLabel}</button>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span className="osd-ticket-id" style={{ fontSize: 15 }}>{selectedQuery.ticket_id}</span>
                    <StatusChip status={selectedQuery.timeline_status} />
                    <SlaChip info={slaInfo(selectedQuery)} />
                    {selectedQuery.escalated_engineering && <span className="osd-tag osd-tag--eng">⚙ Eng</span>}
                    {selectedQuery.feedback_type === 'thumbs_down' && !selectedQuery.escalation_resolved && <span className="osd-tag osd-tag--esc">⚠ Escalated</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1E36', marginBottom: 4 }}>{selectedQuery.sub_option}</div>
                  <div style={{ fontSize: 12, color: '#9AAABB' }}>{selectedQuery.category} · {selectedQuery.subject || selectedQuery.subject_name} · Raised {timeAgo(selectedQuery.timestamp)}</div>
                </div>
              </div>
              <StatusBar query={selectedQuery} onAdvance={(next) => handleAdvance(selectedId, next)} />
              {selectedQuery.feedback_type === 'thumbs_down' && <EscalationCard query={selectedQuery} onClose={handleClose} />}
              <StudentSection query={selectedQuery} />
              <ActionArea query={selectedQuery} onClaim={handleClaim} onRecall={handleRecall} onEscalate={handleEscalate} onResolve={handleResolve} addNotification={addNotification} />
              <NotesArea query={selectedQuery} onAddNote={handleNote} />
            </div>
           ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <div className="osd-page-title">{tabLabel}</div>
                <div style={{ fontSize: 12, color: '#9AAABB', marginTop: 2 }}>{tableData.length} ticket{tableData.length !== 1 ? 's' : ''}</div>
              </div>
              <div className="osd-filter-bar">
                <div className="osd-search-wrap">
                  <span className="osd-search-icon">🔍</span>
                  <input className="osd-search" placeholder="Search tickets…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="osd-white-card" style={{ padding: 0 }}>
                <table className="osd-table">
                  <thead>
                    <tr>
                      <th className="osd-th-s" onClick={() => handleSort('priority')}>Priority<SortArrow col="priority" /></th>
                      <th>Ticket ID</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th className="osd-th-s" onClick={() => handleSort('sla')}>SLA<SortArrow col="sla" /></th>
                      <th>Route</th>
                      <th className="osd-th-s" onClick={() => handleSort('raised')}>Raised<SortArrow col="raised" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: '#C4C4D4', fontSize: 13 }}>No tickets in this view</td></tr>
                    ) : tableData.map(q => {
                      const pri = getPriority(q); const sla = slaInfo(q)
                      return (
                        <tr key={q.ticket_id} className={`osd-tr osd-tr--clickable${q.feedback_type === 'thumbs_down' && !q.escalation_resolved ? ' osd-tr--esc' : ''}`} onClick={() => setSelectedId(q.ticket_id)}>
                          <td><div style={{ display: 'flex', alignItems: 'center' }}><PriorityDot priority={pri} /><span style={{ fontSize: 11, fontWeight: 600, color: '#5A6A7E', textTransform: 'capitalize' }}>{pri}</span></div></td>
                          <td>
                            <div><span className="osd-ticket-id">{q.ticket_id}</span>{q.escalated_engineering && <span className="osd-tag osd-tag--eng">⚙</span>}{q.feedback_type === 'thumbs_down' && !q.escalation_resolved && <span className="osd-tag osd-tag--esc">⚠</span>}</div>
                            <div style={{ fontSize: 10, color: '#9AAABB', marginTop: 1 }}>{q.subject || q.subject_name}</div>
                          </td>
                          <td className="osd-td-subject">{q.sub_option}</td>
                          <td><StatusChip status={q.timeline_status} /></td>
                          <td><SlaChip info={sla} /></td>
                          <td><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 6, background: q.routed_to === 'faculty' ? '#EDE9FE' : '#EFF6FF', color: q.routed_to === 'faculty' ? '#5B21B6' : '#1D4ED8' }}>{q.routed_to}</span></td>
                          <td style={{ fontSize: 11, color: '#9AAABB' }}>{timeAgo(q.timestamp)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
           )
          }
        </div>

        {/* ── Right panel ─────────────────────────────────── */}
        <div className="osd-right">
          {isDetail
            ? <ContextPanel query={selectedQuery} allQueries={queries} />
            : <PerfPanel queries={queries} myActive={myActive} myResolved={myResolved} avgResH={avgResH} avgCsat={avgCsat} resolvedToday={resolvedToday} workloadPct={workloadPct} />
          }
        </div>

      </div>
    </div>
  )
}
