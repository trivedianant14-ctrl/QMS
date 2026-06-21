import { createContext, useContext, useState } from 'react'
import { mockQueries } from '../data/mockQueries'
import { FACULTY } from '../data/mockAgents'

const QueryContext = createContext(null)

export const FACULTY_ROUTED = {
  'Problem with the Answer': [
    'The answer shown is wrong',
    'My book / teacher says something different',
    'More than 1 option looks correct',
  ],
  'I Have a Doubt': [
    'Why is this the correct answer?',
    "I didn't understand the explanation",
    'Why is this option wrong?',
  ],
}

export const CONTENT_ROUTED = {
  'Problem with the Answer': [
    "Explanation / rationale doesn't match the answer",
    'I answered this but it shows unattempted',
    "I selected the right answer but it's marked wrong",
  ],
  "Can't See Something": [
    'Image in the question is not loading',
    'Option text is missing or has symbols',
    'Explanation / table / formula is not showing',
    'Question is cut off or incomplete',
  ],
  'Problem with this Question': [
    'The question itself is wrong',
    "I've already seen this question",
    'Question is in the wrong language',
    'This is not in my syllabus',
    'This belongs to a different topic or chapter',
  ],
}

export function deriveRouting(category, subOption) {
  if (FACULTY_ROUTED[category]?.includes(subOption)) return 'faculty'
  if (category === 'Others') return 'support'
  return 'content'
}

export function deriveSubject(questionId) {
  const d = questionId % 10
  if (d <= 3) return 'Anatomy'
  if (d <= 5) return 'Pharmacology'
  if (d <= 7) return 'Medical Surgical Nursing'
  return 'Community Health Nursing'
}

export const SATISFACTION_SCORES = {
  thumbs_up: 4.5,
  auto_closed: 3.5,
  thumbs_down: 1.5,
  escalation_resolved: null,
}

export function QueryProvider({ children }) {
  const [queries, setQueries] = useState(mockQueries)
  const [resolvedAck, setResolvedAck] = useState(() => new Set())
  const [rrMap, setRrMap] = useState({})

  const pickFaculty = (subject, currentQueries) => {
    const eligible = FACULTY.filter(f => f.subjects.includes(subject))
    if (eligible.length === 0) return null
    if (eligible.length === 1) return eligible[0].name
    const loads = eligible.map(f => ({
      name: f.name,
      load: currentQueries.filter(q => q.faculty_assigned === f.name && q.timeline_status !== 'resolved').length,
    }))
    const minLoad = Math.min(...loads.map(l => l.load))
    const atMin = loads.filter(l => l.load === minLoad)
    if (atMin.length === eligible.length) {
      const idx = (rrMap[subject] ?? 0) % eligible.length
      setRrMap(prev => ({ ...prev, [subject]: idx + 1 }))
      return eligible[idx].name
    }
    if (atMin.length === 1) return atMin[0].name
    const tied = eligible.filter(f => atMin.some(a => a.name === f.name))
    const idx = (rrMap[subject] ?? 0) % tied.length
    setRrMap(prev => ({ ...prev, [subject]: idx + 1 }))
    return tied[idx].name
  }

  const addQuery = (newQuery) => {
    const id = Date.now()
    const questionId = Math.floor(Math.random() * 90000) + 10000
    const subject = deriveSubject(questionId)
    const routed_to = deriveRouting(newQuery.category, newQuery.subOption)
    let facultyAssigned = null
    let facultyAssignedAt = null
    if (routed_to === 'faculty') {
      facultyAssigned = pickFaculty(subject, queries)
      if (facultyAssigned) facultyAssignedAt = new Date().toISOString()
    }
    setQueries(prev => [{
      id,
      ticket_id: 'NP-' + id.toString(36).toUpperCase().slice(-6),
      question_id: questionId,
      subject_name: newQuery.subjectName || 'QBank Practice',
      test_name: newQuery.testName || 'Chapter Practice',
      question_text: newQuery.questionText || '',
      question_num: newQuery.questionNum || null,
      category: newQuery.category,
      sub_option: newQuery.subOption,
      query_text: newQuery.commentText || '',
      status: 'active',
      timeline_status: facultyAssigned ? 'assigned' : 'raised',
      demo_stage: 0,
      resolver_team: getResolverTeam(newQuery.category),
      sla_hours: getSLA(newQuery.category),
      timestamp: new Date().toISOString(),
      resolved_at: null, resolution_text: null, resolution_code: null,
      claimed_by: null, notes: [], faculty_review_pending: false,
      escalated_engineering: false, subject, routed_to,
      faculty_assigned: facultyAssigned, faculty_assigned_at: facultyAssignedAt,
      satisfaction_score: null, feedback_type: null,
      escalation_rating: null, escalation_review: null, escalation_resolved: false,
      call_requested: false,
    }, ...prev])
    return id
  }

  const ackResolvedQuery = (id) => {
    setResolvedAck(prev => new Set([...prev, id]))
  }

  const claimTicket = (ticketId, claimedBy) => {
    setQueries(prev => prev.map(q =>
      q.ticket_id === ticketId
        ? { ...q, claimed_by: claimedBy, timeline_status: 'received' }
        : q
    ))
  }

  const assignToFaculty = (ticketId, facultyName) => {
    setQueries(prev => prev.map(q =>
      q.ticket_id === ticketId
        ? { ...q, faculty_assigned: facultyName, faculty_assigned_at: new Date().toISOString(), routed_to: 'faculty', timeline_status: 'assigned' }
        : q
    ))
  }

  const advanceStatus = (ticketId, newStatus, claimedBy) => {
    setQueries(prev => prev.map(q =>
      q.ticket_id === ticketId
        ? { ...q, timeline_status: newStatus, ...(claimedBy ? { claimed_by: claimedBy } : {}) }
        : q
    ))
  }

  const resolveWithCode = (ticketId, code, text) => {
    setQueries(prev => prev.map(q =>
      q.ticket_id === ticketId
        ? { ...q, status: 'resolved', timeline_status: 'resolved', demo_stage: 3,
            resolved_at: new Date().toISOString(), resolution_code: code || null,
            resolution_text: text || q.resolution_text || null }
        : q
    ))
  }

  const resolveTicket = (ticketId, resolutionText) => {
    setQueries(prev => prev.map(q =>
      q.ticket_id === ticketId
        ? { ...q, status: 'resolved', timeline_status: 'resolved', demo_stage: 3,
            resolved_at: new Date().toISOString(), resolution_text: resolutionText || 'Resolved.' }
        : q
    ))
  }

  const facultyResolve = (ticketId, resolutionText, resolutionAttachment) => {
    setQueries(prev => prev.map(q =>
      q.ticket_id === ticketId
        ? { ...q, status: 'resolved', timeline_status: 'resolved', demo_stage: 3,
            resolved_at: new Date().toISOString(), resolution_text: resolutionText,
            resolution_attachment: resolutionAttachment || null,
            faculty_review_pending: false, resolution_code: 'answered' }
        : q
    ))
  }

  const approveResolution = (ticketId, finalText) => {
    setQueries(prev => prev.map(q =>
      q.ticket_id === ticketId
        ? { ...q, faculty_review_pending: false,
            resolution_text: finalText != null ? finalText : q.resolution_text,
            status: 'resolved', timeline_status: 'resolved', demo_stage: 3,
            resolved_at: new Date().toISOString() }
        : q
    ))
  }

  const requestRevision = (ticketId, note, author) => {
    setQueries(prev => prev.map(q =>
      q.ticket_id === ticketId
        ? { ...q, faculty_review_pending: false, resolution_text: null, resolution_attachment: null,
            notes: [...(q.notes || []), { text: note, author, timestamp: new Date().toISOString(), type: 'revision_request' }] }
        : q
    ))
  }

  const addNote = (ticketId, text, author) => {
    setQueries(prev => prev.map(q =>
      q.ticket_id === ticketId
        ? { ...q, notes: [...(q.notes || []), { text, author, timestamp: new Date().toISOString() }] }
        : q
    ))
  }

  const escalateToEngineering = (ticketId) => {
    setQueries(prev => prev.map(q =>
      q.ticket_id === ticketId ? { ...q, escalated_engineering: true } : q
    ))
  }

  const closeEscalation = (ticketId, finalText) => {
    setQueries(prev => prev.map(q =>
      q.ticket_id === ticketId
        ? { ...q, escalation_resolved: true, resolution_text: finalText || q.resolution_text,
            feedback_type: 'escalation_resolved', satisfaction_score: q.satisfaction_score ?? 3.5 }
        : q
    ))
  }

  const recallFromFaculty = (ticketId) => {
    setQueries(prev => prev.map(q =>
      q.ticket_id === ticketId
        ? { ...q, faculty_assigned: null, faculty_assigned_at: null, routed_to: 'content', faculty_review_pending: false }
        : q
    ))
  }

  const setFeedback = (ticketId, feedbackType) => {
    setQueries(prev => prev.map(q => {
      if (q.ticket_id !== ticketId) return q
      const score = SATISFACTION_SCORES[feedbackType] ?? null
      return { ...q, feedback_type: feedbackType, satisfaction_score: score }
    }))
  }

  const setEscalationRating = (ticketId, rating, reviewText) => {
    setQueries(prev => prev.map(q => {
      if (q.ticket_id !== ticketId) return q
      return { ...q, escalation_rating: rating, escalation_review: reviewText || null,
        escalation_resolved: true, satisfaction_score: rating ?? 3.5, feedback_type: 'escalation_resolved' }
    }))
  }

  const setCallRequested = (ticketId) => {
    setQueries(prev => prev.map(q =>
      q.ticket_id === ticketId ? { ...q, call_requested: true } : q
    ))
  }

  const unresolvedNotifCount = queries.filter(
    q => q.timeline_status === 'resolved' && !resolvedAck.has(q.id)
  ).length

  return (
    <QueryContext.Provider value={{
      queries, addQuery, resolvedAck, ackResolvedQuery, unresolvedNotifCount,
      claimTicket, assignToFaculty, advanceStatus, resolveWithCode, resolveTicket,
      facultyResolve, approveResolution, requestRevision,
      addNote, escalateToEngineering, closeEscalation, recallFromFaculty,
      setFeedback, setEscalationRating, setCallRequested,
    }}>
      {children}
    </QueryContext.Provider>
  )
}

export function useQueries() {
  const value = useContext(QueryContext)
  if (!value) throw new Error('useQueries must be used inside QueryProvider')
  return value
}

function getResolverTeam(category) {
  const map = {
    'Wrong Answer': 'Content QA', 'Problem with the Answer': 'Content QA',
    "Can't See Something": 'Engineering', 'Need Help': 'Educator',
    'I Have a Doubt': 'Educator', 'Not the Right Question': 'Content QA',
    'Problem with this Question': 'Content QA', Others: 'Ops Triage',
  }
  return map[category] || 'Ops Triage'
}

function getSLA(category) {
  const map = {
    'Wrong Answer': 48, 'Problem with the Answer': 48, "Can't See Something": 24,
    'Need Help': 72, 'I Have a Doubt': 72, 'Not the Right Question': 48,
    'Problem with this Question': 48, Others: 24,
  }
  return map[category] || 48
}
