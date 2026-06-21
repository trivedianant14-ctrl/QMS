import { useState, useMemo } from 'react'
import { useQueries } from '../context/QueryContext'
import { useNotifications } from '../context/NotificationContext'
import { AGENTS, FACULTY } from '../data/mockAgents'

const DEMO_MANAGER = 'Manager'
const AVATAR_CLR   = '#059669'

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

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 }

const SIDEBAR_TABS = [
  { key: 'all',        icon: '📋', label: 'All Tickets'   },
  { key: 'unassigned', icon: '🔓', label: 'Unassigned'    },
  { key: 'content',    icon: '📄', label: 'Content Queue' },
  { key: 'faculty',    icon: '👩‍🏫', label: 'Faculty Queue' },
  { key: 'sla',        icon: '⏱',  label: 'SLA Risk'      },
  { key: 'escalated',  icon: '⚠',  label: 'Escalated'     },
  { key: 'team',       icon: '👥', label: 'Team View'     },
  { key: 'facview',    icon: '🎓', label: 'Faculty Load'  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPriority(q) {
  if (q.timeline_status === 'resolved') return 'low'
  const ms = new Date(q.timestamp).getTime() + q.sla_hours * 3600000 - Date.now()
  if (ms <= 0 || ms <= 4 * 3600000) return 'high'
  if (ms <= 24 * 3600000) return 'medium'
  return 'low'
}

function getSlaInfo(q) {
  if (q.timeline_status === 'resolved') return { label: 'Closed', type: 'closed' }
  const ms = new Date(q.timestamp).getTime() + q.sla_hours * 3600000 - Date.now()
  if (ms <= 0) {
    const m = Math.round(Math.abs(ms) / 60000); const h = Math.floor(m / 60)
    return { label: h > 0 ? `Overdue (${h}h ${m % 60}m)` : `Overdue (${m}m)`, type: 'overdue' }
  }
  const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000)
  if (h < 2)  return { label: `Due Soon (${h}h ${m}m)`, type: 'overdue' }
  if (h < 24) return { label: `Due Soon (${h}h ${m}m)`, type: 'due-soon' }
  return { label: 'On Track', type: 'on-track' }
}

function slaInfoDetail(q) {
  if (q.timeline_status === 'resolved') return { text: 'Closed', color: '#9AAABB', type: 'closed', ms: Infinity }
  const ms = new Date(q.timestamp).getTime() + q.sla_hours * 3600000 - Date.now()
  if (ms <= 0) return { text: 'Breached', color: '#EF4444', type: 'overdue', ms: 0 }
  const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000)
  const text = `${h}h ${m}m`
  if (h < 2)  return { text, color: '#EF4444', type: 'overdue', ms }
  if (h < 24) return { text, color: '#F59E0B', type: 'due-soon', ms }
  return { text, color: '#10B981', type: 'on-track', ms }
}

function slaDead(q) {
  const d = new Date(new Date(q.timestamp).getTime() + q.sla_hours * 3600000)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function stageIdx(status) { return Math.max(0, STAGES.findIndex(s => s.key === status)) }
function codeLabel(code) { return RESOLUTION_CODES.find(c => c.value === code)?.label || code }
function satColor(s) { return s >= 4 ? '#10B981' : s >= 3 ? '#F59E0B' : '#EF4444' }

function timeAgo(iso) {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000)
  if (h >= 24) return `${Math.floor(h / 24)}d ago`
  if (h >= 1) return `${h}h ago`
  if (m < 1) return 'just now'
  return `${m}m ago`
}

function buildActivity(queries) {
  const events = []
  queries.forEach(q => {
    events.push({ icon: '📝', text: `Student submitted · ${q.sub_option.slice(0, 30)}`, ticket: q.ticket_id, time: q.timestamp, type: 'raised' })
    if (q.faculty_assigned_at) events.push({ icon: '👩‍🏫', text: `Auto-assigned → ${q.faculty_assigned}`, ticket: q.ticket_id, time: q.faculty_assigned_at, type: 'assign' })
    if (q.escalated_engineering) events.push({ icon: '⚙', text: 'Escalated to Engineering', ticket: q.ticket_id, time: q.notes?.[0]?.timestamp || q.timestamp, type: 'eng' })
    ;(q.notes || []).forEach(n => events.push({ icon: '📌', text: `${n.author.split(' — ')[0]} added a note`, ticket: q.ticket_id, time: n.timestamp, type: 'note' }))
    if (q.resolved_at && q.timeline_status === 'resolved') events.push({ icon: '✓', text: `Closed · ${q.resolution_code || 'resolved'}`, ticket: q.ticket_id, time: q.resolved_at, type: 'resolved' })
    if (q.feedback_type === 'thumbs_down' && q.resolved_at) events.push({ icon: '⚠', text: 'Student escalated (thumbs down)', ticket: q.ticket_id, time: q.resolved_at, type: 'esc' })
  })
  return events.filter(e => e.time).sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10)
}

// ── Chips / mini components ───────────────────────────────────────────────────

function PriorityDot({ priority }) {
  const c = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' }[priority] || '#C4C4D4'
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c, marginRight: 6, flexShrink: 0 }} />
}

function SlaChip({ info }) {
  const S = { 'on-track': { bg: '#F0FDF4', c: '#166534', b: '#86EFAC' }, 'due-soon': { bg: '#FFFBEB', c: '#92400E', b: '#FCD34D' }, overdue: { bg: '#FEF2F2', c: '#991B1B', b: '#FECACA' }, closed: { bg: '#F0F0F8', c: '#9AAABB', b: '#E4E4F0' } }
  const s = S[info.type] || S.closed
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: s.bg, color: s.c, border: `1px solid ${s.b}`, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {info.type === 'on-track' && <span>✓</span>}{info.label || info.text}
    </span>
  )
}

const STATUS_INFO = { raised: { label: 'Raised', cls: 'open' }, received: { label: 'In Review', cls: 'progress' }, assigned: { label: 'Working On', cls: 'progress' }, resolved: { label: 'Resolved', cls: 'resolved' } }

function StatusChip({ status }) {
  const { label, cls } = STATUS_INFO[status] || { label: status, cls: 'open' }
  const S = { open: { bg: '#EFF0F7', c: '#5A6A7E' }, progress: { bg: '#EDE9FE', c: '#4C1D95' }, resolved: { bg: '#F0FDF4', c: '#166534' } }
  const s = S[cls] || S.open
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: s.bg, color: s.c, whiteSpace: 'nowrap' }}>{label}</span>
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#F0F0F8', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color || '#534AB7', borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#5A6A7E', minWidth: 20, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

// ── Detail-view sub-components ────────────────────────────────────────────────

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
          <div key={stage.key} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
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
        <div className="rsv-esc-section"><div className="rsv-esc-label">Final Resolution Sent to Student</div><div className="rsv-esc-text rsv-esc-text--violet">{query.resolution_text}</div></div>
      </div>
    )
  }
  return (
    <div className="rsv-esc-card rsv-esc-card--open">
      <div className="rsv-esc-hdr">
        <span className="rsv-esc-title rsv-esc-title--open">⚠ Student Escalated</span>
        <span className="rsv-esc-when">answered {timeAgo(query.resolved_at)} · student unsatisfied</span>
      </div>
      <div className="rsv-esc-section"><div className="rsv-esc-label">Why the Student Was Confused</div><div className="rsv-esc-quote">{query.query_text}</div></div>
      {query.resolution_text && <div className="rsv-esc-section"><div className="rsv-esc-label">Answer Given — {query.faculty_assigned || 'Content Team'}</div><div className="rsv-esc-quote rsv-esc-quote--faculty">{query.resolution_text}</div></div>}
      <div className="rsv-esc-action-box">
        <div className="rsv-esc-action-title">Manager Action Required</div>
        <div className="rsv-esc-checklist">
          <div>• Review whether the explanation was sufficient</div>
          <div>• Edit the final resolution below to address the gap</div>
          {query.call_requested && <div className="rsv-esc-checklist-urgent">• ⚠ Student requested a call — arrange before closing</div>}
        </div>
        <div className="rsv-esc-label" style={{ marginTop: 14, marginBottom: 6 }}>Final Resolution (edit — this is what the student receives)</div>
        <textarea className="rsv-esc-ta" value={finalText} onChange={e => setFinalText(e.target.value)} rows={4} placeholder="Rewrite or supplement the explanation…" />
        <button type="button" className="rsv-esc-close-btn" disabled={!finalText.trim()} onClick={() => onClose(query.ticket_id, finalText.trim())}>Mark Escalation Resolved</button>
      </div>
    </div>
  )
}

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
          <span className="rsv-sq-val" style={{ color: '#534AB7' }}>{query.faculty_assigned}{query.faculty_assigned_at && <span style={{ color: '#5A6A7E', fontWeight: 400, marginLeft: 6 }}>(assigned {timeAgo(query.faculty_assigned_at)})</span>}</span>
        </div>
      )}
      {query.query_text && <div className="rsv-sq-comment">"{query.query_text}"</div>}
      {query.question_text && <div className="rsv-sq-qblock"><div className="rsv-sq-qlabel">Question text</div><div className="rsv-sq-qtext">{query.question_text}</div></div>}
    </div>
  )
}

function ManagerActionArea({ query, onClaim, onEscalate, onResolve, addNotification }) {
  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolveCode, setResolveCode] = useState('')
  const [resolveText, setResolveText] = useState('')
  if (!query) return null

  const isResolved       = query.timeline_status === 'resolved'
  const isClaimed        = !!query.claimed_by
  const isEng            = query.escalated_engineering
  const isEscalated      = query.feedback_type === 'thumbs_down' && !query.escalation_resolved
  const claimedByManager = query.claimed_by === DEMO_MANAGER

  if (isResolved && !isEscalated) {
    return (
      <div className="rsv-actions-area">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>✓ Resolved</span>
          {query.resolution_code && <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: '#F0FDF4', color: '#166534', border: '1px solid #86EFAC' }}>{codeLabel(query.resolution_code)}</span>}
        </div>
        {query.claimed_by && <div style={{ fontSize: 12, color: '#9AAABB', marginTop: 6 }}>Resolved by {query.claimed_by}</div>}
      </div>
    )
  }

  return (
    <div className="rsv-actions-area">
      <div style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Manager Override</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>
              {isClaimed ? `Currently handled by: ${query.claimed_by}` : 'No agent assigned — resolve directly'}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!isClaimed && (
            <button type="button"
              style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 7, border: 'none', background: 'white', color: '#059669', cursor: 'pointer' }}
              onClick={() => onClaim(query.ticket_id, DEMO_MANAGER)}>
              ✋ Claim &amp; Handle
            </button>
          )}
          {!resolveOpen && (
            <button type="button"
              style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 7, background: isClaimed && !claimedByManager ? 'rgba(255,255,255,0.2)' : 'white', color: isClaimed && !claimedByManager ? 'white' : '#059669', cursor: 'pointer', border: isClaimed && !claimedByManager ? '1px solid rgba(255,255,255,0.5)' : 'none' }}
              onClick={() => setResolveOpen(true)}>
              {isClaimed && !claimedByManager ? '⚡ Override &amp; Resolve' : '✓ Resolve Ticket'}
            </button>
          )}
          {!isEng && (
            <button type="button"
              style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: 'white', cursor: 'pointer' }}
              onClick={() => { onEscalate(query.ticket_id); addNotification('General', `⚠ Manager escalated to Engineering: #${query.ticket_id}`, query.ticket_id) }}>
              Escalate to Engineering
            </button>
          )}
        </div>
      </div>

      {isEng && <div className="rsv-eng-banner"><span>⚙</span><span>Escalated to Engineering</span></div>}

      {resolveOpen && (
        <div className="rsv-resolve-form">
          <div className="rsv-resolve-form-title">
            Close ticket
            {!claimedByManager && isClaimed && <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600, marginLeft: 8 }}>· Manager override (was: {query.claimed_by})</span>}
          </div>
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

function NotesArea({ query, onAddNote }) {
  const [noteText, setNoteText] = useState('')
  const notes = query?.notes || []
  return (
    <div className="rsv-notes-area">
      <div className="rsv-notes-title">Internal Notes{notes.length > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: '#C4C4D4' }}> {notes.length}</span>}</div>
      {notes.length === 0 && <div style={{ fontSize: 13, color: '#C4C4D4', fontStyle: 'italic', marginBottom: 12 }}>No notes yet.</div>}
      {[...notes].reverse().map((note, i) => (
        <div key={i} className={`rsv-note${note.type === 'revision_request' ? ' rsv-note--revision' : ''}`}>
          {note.type === 'revision_request' && <div className="rsv-note-tag">↩ Revision Requested</div>}
          <div className="rsv-note-meta"><span>{note.author}</span><span>{timeAgo(note.timestamp)}</span></div>
          <div className="rsv-note-text">{note.text}</div>
        </div>
      ))}
      {query?.timeline_status !== 'resolved' && (
        <div className="rsv-note-form">
          <textarea className="rsv-note-ta" placeholder="Add a manager note…" value={noteText} onChange={e => setNoteText(e.target.value)} rows={2} />
          <button type="button" className="rsv-note-save" disabled={!noteText.trim()} onClick={() => { onAddNote(noteText.trim()); setNoteText('') }}>Save Note</button>
        </div>
      )}
    </div>
  )
}

function ContextPanel({ query, allQueries }) {
  const sla = slaInfoDetail(query)
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
              <div className="rsv-sat-score" style={{ color: satColor(query.satisfaction_score) }}>{query.satisfaction_score} ★</div>
            </div>
          )}
        </div>
      )}
      <div className="rsv-ctx-section">
        <div className="rsv-ctx-title">Queue Health</div>
        <div className="rsv-ctx-row"><div className="rsv-ctx-label">Open</div><div className="rsv-ctx-value">{allQueries.filter(q => q.timeline_status !== 'resolved').length}</div></div>
        <div className="rsv-ctx-row"><div className="rsv-ctx-label">Unassigned</div><div className="rsv-ctx-value" style={{ color: '#F59E0B' }}>{allQueries.filter(q => !q.claimed_by && !q.faculty_assigned && q.timeline_status !== 'resolved').length}</div></div>
        <div className="rsv-ctx-row"><div className="rsv-ctx-label">With Faculty</div><div className="rsv-ctx-value rsv-ctx-value--violet">{allQueries.filter(q => q.faculty_assigned && q.timeline_status !== 'resolved').length}</div></div>
        <div className="rsv-ctx-row"><div className="rsv-ctx-label">Escalated</div><div className="rsv-ctx-value rsv-ctx-value--red">{allQueries.filter(q => q.feedback_type === 'thumbs_down' && !q.escalation_resolved).length}</div></div>
      </div>
    </>
  )
}

// ── TeamView ──────────────────────────────────────────────────────────────────

function TeamView({ queries }) {
  const agentStats = AGENTS.map(a => {
    const fullName = `${a.name} — ${a.team}`
    const active   = queries.filter(q => q.claimed_by === fullName && q.timeline_status !== 'resolved')
    const resolved = queries.filter(q => q.claimed_by === fullName && q.timeline_status === 'resolved')
    const scores   = resolved.filter(q => q.satisfaction_score != null).map(q => q.satisfaction_score)
    const avgCsat  = scores.length ? (scores.reduce((x,y) => x+y,0)/scores.length) : null
    const avgResMs = resolved.length ? resolved.reduce((s, q) => s + (q.resolved_at ? new Date(q.resolved_at) - new Date(q.timestamp) : 0), 0) / resolved.length : null
    return { ...a, fullName, active: active.length, resolved: resolved.length, avgCsat, avgResH: avgResMs ? (avgResMs / 3600000).toFixed(1) : null }
  })
  const maxActive = Math.max(...agentStats.map(a => a.active), 1)
  return (
    <div>
      <div className="osd-page-title">Team Performance</div>
      <div style={{ fontSize: 12, color: '#9AAABB', marginBottom: 20 }}>All content team agents</div>
      <div className="osd-white-card">
        <div className="osd-card-title" style={{ marginBottom: 16 }}>Agent Workload &amp; Performance</div>
        <table className="osd-table">
          <thead><tr><th>Agent</th><th>Team</th><th>Active Tickets</th><th>Resolved</th><th>Avg Resolution</th><th>CSAT</th></tr></thead>
          <tbody>
            {agentStats.map(a => (
              <tr key={a.name} className="osd-tr">
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: a.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}>
                      {a.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0D1E36' }}>{a.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 11, color: '#5A6A7E' }}>{a.team}</td>
                <td style={{ minWidth: 100 }}><MiniBar value={a.active} max={maxActive} color="#534AB7" /></td>
                <td style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{a.resolved}</td>
                <td style={{ fontSize: 12, color: '#534AB7', fontWeight: 600 }}>{a.avgResH ? `${a.avgResH}h` : '—'}</td>
                <td>{a.avgCsat != null ? <span style={{ fontSize: 13, fontWeight: 700, color: a.avgCsat >= 4 ? '#F59E0B' : '#EF4444' }}>{'★'.repeat(Math.round(a.avgCsat))} {a.avgCsat.toFixed(1)}</span> : <span style={{ color: '#C4C4D4', fontSize: 12 }}>—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── FacultyView ───────────────────────────────────────────────────────────────

function FacultyView({ queries }) {
  const maxOpen = Math.max(...FACULTY.map(f => queries.filter(q => q.faculty_assigned === f.name && q.timeline_status !== 'resolved').length), 1)
  return (
    <div>
      <div className="osd-page-title">Faculty Workload</div>
      <div style={{ fontSize: 12, color: '#9AAABB', marginBottom: 20 }}>Current assignment load by faculty member</div>
      <div className="osd-white-card" style={{ marginBottom: 16 }}>
        <div className="osd-card-title" style={{ marginBottom: 16 }}>Assignment Overview</div>
        {FACULTY.map(f => {
          const open     = queries.filter(q => q.faculty_assigned === f.name && q.timeline_status !== 'resolved')
          const resolved = queries.filter(q => q.faculty_assigned === f.name && q.timeline_status === 'resolved')
          const scores   = resolved.filter(q => q.satisfaction_score != null).map(q => q.satisfaction_score)
          const avgCsat  = scores.length ? (scores.reduce((a,b) => a+b,0)/scores.length) : null
          return (
            <div key={f.name} style={{ padding: '12px 0', borderBottom: '1px solid #F0F0F8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: f.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>
                    {f.name.split(' ').filter(Boolean).map(w => w[0]).join('').replace(/[^A-Z]/g,'').slice(0,2)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0D1E36' }}>{f.name}</div>
                    <div style={{ fontSize: 10, color: '#9AAABB' }}>{f.subjects.join(' · ')}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#5A6A7E' }}>Resolved: <strong style={{ color: '#10B981' }}>{resolved.length}</strong></div>
                  {avgCsat != null && <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700 }}>{'★'.repeat(Math.round(avgCsat))} {avgCsat.toFixed(1)}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#9AAABB', minWidth: 68 }}>Open queries</span>
                <MiniBar value={open.length} max={maxOpen} color={open.length === 0 ? '#C4C4D4' : '#534AB7'} />
              </div>
              {open.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {open.map(q => <span key={q.ticket_id} style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: '#EDE9FE', color: '#534AB7' }}>{q.ticket_id}</span>)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── AssignCell ────────────────────────────────────────────────────────────────

function AssignCell({ query, queries, onAssignAgent, onAssignFaculty }) {
  const [open, setOpen] = useState(false)
  const agentOptions = AGENTS.map(a => {
    const fullName = `${a.name} — ${a.team}`
    const load = queries.filter(q => q.claimed_by === fullName && q.timeline_status !== 'resolved').length
    return { ...a, fullName, load }
  }).sort((a, b) => a.load - b.load)
  const facultyOptions = FACULTY.map(f => {
    const load = queries.filter(q => q.faculty_assigned === f.name && q.timeline_status !== 'resolved').length
    return { ...f, load }
  }).sort((a, b) => a.load - b.load)
  const loadBadge = (load) => ({ bg: load === 0 ? '#F0FDF4' : load <= 2 ? '#EDE9FE' : '#FEF2F2', c: load === 0 ? '#166534' : load <= 2 ? '#5B21B6' : '#991B1B' })
  const Row = ({ avatar, initials, name, sub, load, onClick }) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#F5F3FF'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0D1E36', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: 10, color: '#9AAABB' }}>{sub}</div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, ...loadBadge(load), flexShrink: 0 }}>{load} active</span>
    </button>
  )
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o) }} style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, border: '1.5px dashed #C4B5FD', background: '#F5F3FF', color: '#5B21B6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
        + Assign
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 100, background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0 8px 24px rgba(83,74,183,0.14)', minWidth: 230, padding: '6px 0', maxHeight: 380, overflowY: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9AAABB', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '6px 14px 4px', borderBottom: '1px solid #F0F0F8', marginBottom: 2 }}>Content Agents</div>
            {agentOptions.map(a => <Row key={a.name} avatar={a.avatar_color} initials={a.name.split(' ').map(w => w[0]).join('').slice(0, 2)} name={a.name} sub={a.team} load={a.load} onClick={() => { onAssignAgent(query.ticket_id, a.fullName); setOpen(false) }} />)}
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9AAABB', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '8px 14px 4px', borderTop: '1px solid #F0F0F8', borderBottom: '1px solid #F0F0F8', marginTop: 4, marginBottom: 2 }}>Faculty</div>
            {facultyOptions.map(f => <Row key={f.name} avatar={f.avatar_color} initials={f.name.split(' ').filter(Boolean).map(w => w[0]).join('').replace(/[^A-Z]/g, '').slice(0, 2)} name={f.name} sub={f.subjects.join(', ')} load={f.load} onClick={() => { onAssignFaculty(query.ticket_id, f.name); setOpen(false) }} />)}
          </div>
        </>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ManagerDashboard() {
  const { queries, claimTicket, assignToFaculty, advanceStatus, resolveWithCode, addNote, escalateToEngineering, closeEscalation } = useQueries()
  const { addNotification } = useNotifications()

  const [sideTab,    setSideTab]    = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [search,     setSearch]     = useState('')
  const [fStatus,    setFStatus]    = useState('all')
  const [fRoute,     setFRoute]     = useState('all')
  const [sortCol,    setSortCol]    = useState('sla')
  const [sortDir,    setSortDir]    = useState('asc')

  const todayStart     = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime() })()
  const openQueries    = queries.filter(q => q.timeline_status !== 'resolved')
  const resolvedToday  = queries.filter(q => q.resolved_at && new Date(q.resolved_at).getTime() >= todayStart).length
  const slaRiskCount   = openQueries.filter(q => { const ms = new Date(q.timestamp).getTime() + q.sla_hours * 3600000 - Date.now(); return ms > 0 && ms < 24 * 3600000 }).length
  const unassigned     = queries.filter(q => !q.claimed_by && !q.faculty_assigned && q.timeline_status !== 'resolved' && q.routed_to !== 'faculty')
  const escalatedOpen  = queries.filter(q => q.feedback_type === 'thumbs_down' && !q.escalation_resolved)
  const resolvedAll    = queries.filter(q => q.timeline_status === 'resolved')
  const allScores      = resolvedAll.filter(q => q.satisfaction_score != null).map(q => q.satisfaction_score)
  const avgCsat        = allScores.length ? (allScores.reduce((a,b)=>a+b,0)/allScores.length) : null
  const slaHit         = resolvedAll.filter(q => q.resolved_at && new Date(q.resolved_at) < new Date(new Date(q.timestamp).getTime() + q.sla_hours * 3600000)).length
  const slaRate        = resolvedAll.length ? Math.round((slaHit / resolvedAll.length) * 100) : null

  const tabFiltered = (() => {
    switch (sideTab) {
      case 'unassigned': return unassigned
      case 'content':    return queries.filter(q => q.routed_to === 'content')
      case 'faculty':    return queries.filter(q => q.routed_to === 'faculty' && q.timeline_status !== 'resolved')
      case 'sla':        return openQueries.filter(q => { const ms = new Date(q.timestamp).getTime() + q.sla_hours * 3600000 - Date.now(); return ms < 24 * 3600000 })
      case 'escalated':  return escalatedOpen
      default:           return queries
    }
  })()

  const tableData = useMemo(() => {
    let rows = tabFiltered
    if (search.trim()) { const s = search.toLowerCase(); rows = rows.filter(t => t.ticket_id.toLowerCase().includes(s) || t.sub_option.toLowerCase().includes(s) || t.category.toLowerCase().includes(s)) }
    if (fStatus !== 'all') rows = rows.filter(t => t.timeline_status === fStatus)
    if (fRoute  !== 'all') rows = rows.filter(t => t.routed_to === fRoute)
    const cmp = (a, b) => {
      if (sortCol === 'priority') { const d = PRIORITY_ORDER[getPriority(b)] - PRIORITY_ORDER[getPriority(a)]; return sortDir === 'asc' ? -d : d }
      if (sortCol === 'sla') { const ms = q => new Date(q.timestamp).getTime() + q.sla_hours * 3600000; return sortDir === 'asc' ? ms(a) - ms(b) : ms(b) - ms(a) }
      if (sortCol === 'raised') return sortDir === 'asc' ? new Date(a.timestamp) - new Date(b.timestamp) : new Date(b.timestamp) - new Date(a.timestamp)
      return 0
    }
    return [...rows].sort(cmp)
  }, [tabFiltered, search, fStatus, fRoute, sortCol, sortDir])

  const handleSort = col => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc') } }
  const SortArrow  = ({ col }) => <span style={{ opacity: 0.5 }}>{sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>
  const activity   = useMemo(() => buildActivity(queries), [queries])

  const isTableView = !['team', 'facview'].includes(sideTab)
  const selectedQuery = queries.find(q => q.ticket_id === selectedId) ?? null
  const isDetail      = !!selectedQuery && isTableView

  const handleAssign        = (ticketId, agentFullName) => { claimTicket(ticketId, agentFullName); addNotification('Content Queries', `Manager assigned #${ticketId} → ${agentFullName.split(' — ')[0]}`, ticketId) }
  const handleAssignFaculty = (ticketId, facultyName)  => { assignToFaculty(ticketId, facultyName); addNotification('Content Queries', `Manager routed #${ticketId} → Faculty: ${facultyName}`, ticketId) }
  const handleClaimMgr      = (ticketId, actor)        => { claimTicket(ticketId, actor); addNotification('Content Queries', `Manager claimed #${ticketId}`, ticketId) }
  const handleResolve       = (ticketId, code, text)   => { resolveWithCode(ticketId, code, text); addNotification('Content Queries', `Manager resolved #${ticketId} · ${code}`, ticketId) }
  const handleNote          = (text)                   => addNote(selectedId, text, DEMO_MANAGER)
  const handleClose         = (ticketId, text)         => { closeEscalation(ticketId, text); addNotification('Content Queries', `Manager closed escalation on #${ticketId}`, ticketId) }
  const handleAdvance       = (ticketId, next)         => advanceStatus(ticketId, next)

  const tabBadges = { unassigned: unassigned.length, sla: slaRiskCount, escalated: escalatedOpen.length }
  const tabLabel  = SIDEBAR_TABS.find(t => t.key === sideTab)?.label || 'Tickets'

  return (
    <div className="osd-page">
      <div className="osd-header">
        <div>
          <div className="osd-header-brand">NPrep QMS — Manager Dashboard</div>
          <div className="osd-header-sub">Team &amp; queue overview</div>
        </div>
        <div className="osd-header-right">
          <div className="osd-avatar" style={{ background: AVATAR_CLR }}>MG</div>
          <span className="osd-header-name">{DEMO_MANAGER}</span>
        </div>
      </div>

      <div className="osd-body">

        {/* ── Sidebar ─────────────────────────────────────── */}
        <div className="osd-sidebar">
          <div className="osd-sidebar-nav">
            {SIDEBAR_TABS.map(t => {
              const cnt = tabBadges[t.key]
              return (
                <button key={t.key}
                  className={`osd-nav-item${sideTab === t.key ? ' active' : ''}${t.key === 'escalated' && escalatedOpen.length > 0 ? ' osd-nav-alert' : ''}`}
                  onClick={() => { setSideTab(t.key); setSelectedId(null) }}>
                  <span className="osd-nav-icon">{t.icon}</span>
                  <span>{t.label}</span>
                  {cnt > 0 && <span className={`osd-nav-badge${t.key === 'escalated' ? ' red' : t.key === 'unassigned' ? ' amber' : ''}`}>{cnt}</span>}
                </button>
              )
            })}
          </div>
          <div className="osd-quick-glance">
            <div className="osd-qg-label">Queue Health</div>
            <div className="osd-qg-row"><span>Open</span><strong>{openQueries.length}</strong></div>
            <div className="osd-qg-row"><span>Unassigned</span><strong style={{ color: unassigned.length > 0 ? '#F59E0B' : 'white' }}>{unassigned.length}</strong></div>
            <div className="osd-qg-row"><span>Resolved today</span><strong style={{ color: '#10B981' }}>{resolvedToday}</strong></div>
            <div className="osd-qg-row"><span>SLA risk</span><strong style={{ color: slaRiskCount > 0 ? '#F59E0B' : 'white' }}>{slaRiskCount}</strong></div>
            <div className="osd-qg-row"><span>Escalated</span><strong style={{ color: escalatedOpen.length > 0 ? '#EF4444' : 'white' }}>{escalatedOpen.length}</strong></div>
            {slaRate != null && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8090A8', marginBottom: 5 }}><span>SLA hit rate</span><span>{slaRate}%</span></div>
                <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${slaRate}%`, background: slaRate >= 80 ? '#4ADE80' : slaRate >= 60 ? '#F59E0B' : '#EF4444', borderRadius: 4 }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Main content ────────────────────────────────── */}
        <div className="osd-main">
          {sideTab === 'team' ? <TeamView queries={queries} /> :
           sideTab === 'facview' ? <FacultyView queries={queries} /> :
           isDetail ? (
            <div className="rsv-detail-view">
              <button className="rsv-back-btn" onClick={() => setSelectedId(null)}>← Back to {tabLabel}</button>

              {/* Ticket header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span className="osd-ticket-id" style={{ fontSize: 15 }}>{selectedQuery.ticket_id}</span>
                    <StatusChip status={selectedQuery.timeline_status} />
                    <SlaChip info={getSlaInfo(selectedQuery)} />
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
              <ManagerActionArea
                query={selectedQuery}
                onClaim={handleClaimMgr}
                onEscalate={escalateToEngineering}
                onResolve={handleResolve}
                addNotification={addNotification}
              />
              <NotesArea query={selectedQuery} onAddNote={handleNote} />
            </div>
           ) : (
            <>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div className="osd-page-title">{tabLabel}</div>
                  {sideTab === 'unassigned' && <div style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600, marginTop: 4 }}>⚡ These tickets need an agent — assign them based on workload</div>}
                  <div style={{ fontSize: 12, color: '#9AAABB', marginTop: 2 }}>{tableData.length} ticket{tableData.length !== 1 ? 's' : ''} · click any row to open detail</div>
                </div>
              </div>
              <div className="osd-filter-bar">
                <div className="osd-search-wrap">
                  <span className="osd-search-icon">🔍</span>
                  <input className="osd-search" placeholder="Search tickets…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="osd-filter-sel" value={fStatus} onChange={e => setFStatus(e.target.value)}>
                  <option value="all">Status: All</option>
                  <option value="raised">Raised</option>
                  <option value="received">In Review</option>
                  <option value="assigned">Working On</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select className="osd-filter-sel" value={fRoute} onChange={e => setFRoute(e.target.value)}>
                  <option value="all">Route: All</option>
                  <option value="faculty">Faculty</option>
                  <option value="content">Content</option>
                  <option value="support">Support</option>
                </select>
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
                      <th>Assigned To</th>
                      <th>Score</th>
                      <th className="osd-th-s" onClick={() => handleSort('raised')}>Raised<SortArrow col="raised" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length === 0 ? (
                      <tr><td colSpan={9} style={{ textAlign: 'center', padding: '36px 0', color: '#C4C4D4', fontSize: 13 }}>No tickets in this view</td></tr>
                    ) : tableData.map(q => {
                      const pri = getPriority(q); const sla = getSlaInfo(q)
                      const assigned = q.faculty_assigned || q.claimed_by || null
                      return (
                        <tr key={q.ticket_id}
                          className={`osd-tr osd-tr--clickable${q.feedback_type === 'thumbs_down' && !q.escalation_resolved ? ' osd-tr--esc' : ''}`}
                          onClick={() => setSelectedId(q.ticket_id)}>
                          <td><div style={{ display: 'flex', alignItems: 'center' }}><PriorityDot priority={pri} /><span style={{ fontSize: 11, fontWeight: 600, color: '#5A6A7E', textTransform: 'capitalize' }}>{pri}</span></div></td>
                          <td>
                            <div><span className="osd-ticket-id">{q.ticket_id}</span>{q.escalated_engineering && <span className="osd-tag osd-tag--eng">⚙</span>}{q.feedback_type === 'thumbs_down' && !q.escalation_resolved && <span className="osd-tag osd-tag--esc">⚠</span>}</div>
                            <div style={{ fontSize: 10, color: '#9AAABB', marginTop: 1 }}>{q.subject || q.subject_name}</div>
                          </td>
                          <td className="osd-td-subject">{q.sub_option}</td>
                          <td><StatusChip status={q.timeline_status} /></td>
                          <td><SlaChip info={sla} /></td>
                          <td><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 6, background: q.routed_to === 'faculty' ? '#EDE9FE' : q.routed_to === 'support' ? '#F0FDF4' : '#EFF6FF', color: q.routed_to === 'faculty' ? '#5B21B6' : q.routed_to === 'support' ? '#166534' : '#1D4ED8' }}>{q.routed_to}</span></td>
                          <td onClick={e => e.stopPropagation()}>
                            {assigned
                              ? <span style={{ fontSize: 12, color: '#534AB7', fontWeight: 600 }}>{assigned}</span>
                              : sideTab === 'unassigned'
                                ? <AssignCell query={q} queries={queries} onAssignAgent={handleAssign} onAssignFaculty={handleAssignFaculty} />
                                : <span style={{ fontSize: 12, color: '#C4C4D4' }}>Unclaimed</span>
                            }
                          </td>
                          <td>{q.satisfaction_score != null ? <span style={{ fontSize: 12, fontWeight: 700, color: q.satisfaction_score >= 4 ? '#F59E0B' : '#EF4444' }}>{'★'.repeat(Math.round(q.satisfaction_score))} {q.satisfaction_score}</span> : <span style={{ color: '#C4C4D4', fontSize: 12 }}>—</span>}</td>
                          <td style={{ fontSize: 11, color: '#9AAABB' }}>{timeAgo(q.timestamp)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
           )}
        </div>

        {/* ── Right panel ─────────────────────────────────── */}
        <div className="osd-right">
          {isDetail ? (
            <ContextPanel query={selectedQuery} allQueries={queries} />
          ) : (
            <>
              <div className="osd-right-section">
                <div className="osd-right-title">Team Performance</div>
                <div style={{ fontSize: 10, color: '#C4C4D4', marginBottom: 14 }}>All time</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Open',      value: openQueries.length,   c: '#534AB7' },
                    { label: 'Resolved',  value: resolvedAll.length,    c: '#10B981' },
                    { label: 'SLA Risk',  value: slaRiskCount,          c: slaRiskCount > 0 ? '#F59E0B' : '#9AAABB' },
                    { label: 'Escalated', value: escalatedOpen.length,  c: escalatedOpen.length > 0 ? '#EF4444' : '#9AAABB' },
                  ].map(m => (
                    <div key={m.label} style={{ background: '#F8F8FC', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#9AAABB', fontWeight: 600, marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: m.c }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                {avgCsat != null && <div className="osd-perf-row"><div className="osd-perf-label">Avg CSAT</div><span style={{ fontSize: 16, fontWeight: 800, color: avgCsat >= 4 ? '#F59E0B' : '#EF4444' }}>{'★'.repeat(Math.round(avgCsat))} {avgCsat.toFixed(1)}</span></div>}
                {slaRate != null && <div className="osd-perf-row"><div className="osd-perf-label">SLA Hit Rate</div><span style={{ fontSize: 16, fontWeight: 800, color: slaRate >= 80 ? '#10B981' : '#F59E0B' }}>{slaRate}%</span></div>}
              </div>

              <div className="osd-right-section">
                <div className="osd-right-title">Faculty Load</div>
                {FACULTY.map(f => {
                  const open = queries.filter(q => q.faculty_assigned === f.name && q.timeline_status !== 'resolved').length
                  return (
                    <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: f.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                        {f.name.split(' ').filter(Boolean).map(w => w[0]).join('').replace(/[^A-Z]/g,'').slice(0,2)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#0D1E36', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                        <MiniBar value={open} max={3} color="#534AB7" />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: open > 0 ? '#534AB7' : '#C4C4D4', minWidth: 16, textAlign: 'right' }}>{open}</span>
                    </div>
                  )
                })}
              </div>

              <div className="osd-right-section">
                <div className="osd-right-title">Recent Activity</div>
                {activity.map((ev, i) => (
                  <div key={i} className="osd-activity-item">
                    <span className={`osd-act-icon osd-act-${ev.type}`}>{ev.icon}</span>
                    <div>
                      <div className="osd-act-text">{ev.text}</div>
                      <div className="osd-act-meta"><span className="osd-act-ticket">{ev.ticket}</span><span style={{ color: '#C4C4D4' }}>·</span><span>{timeAgo(ev.time)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
