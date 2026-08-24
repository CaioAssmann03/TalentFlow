// Participant identity is intentionally stored in sessionStorage, not
// localStorage. localStorage is shared across every tab of the same
// browser/origin, so if two participants join from two tabs on the same
// device (e.g. testing on a laptop), the second join would silently
// overwrite the first tab's identity too. sessionStorage is scoped to a
// single tab, so each tab keeps its own participant even on the same
// device/browser — which also matches real usage, where each student's
// phone is its own "tab" anyway.

const PARTICIPANT_KEY_PREFIX = 'hirelens.participant.'
const ADMIN_AUTH_KEY = 'hirelens.admin.authed'

export interface StoredParticipant {
  id: string
  nickname: string
  sessionId: string
}

export function saveParticipant(p: StoredParticipant) {
  sessionStorage.setItem(PARTICIPANT_KEY_PREFIX + p.sessionId, JSON.stringify(p))
}

export function getStoredParticipant(sessionId: string): StoredParticipant | null {
  const raw = sessionStorage.getItem(PARTICIPANT_KEY_PREFIX + sessionId)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredParticipant
  } catch {
    return null
  }
}

export function clearStoredParticipant(sessionId: string) {
  sessionStorage.removeItem(PARTICIPANT_KEY_PREFIX + sessionId)
}

export function setAdminAuthed(value: boolean) {
  if (value) sessionStorage.setItem(ADMIN_AUTH_KEY, '1')
  else sessionStorage.removeItem(ADMIN_AUTH_KEY)
}

export function isAdminAuthed(): boolean {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === '1'
}

// Tracks which dilemma indices this participant has already voted on
// locally, as a fast client-side guard in addition to the DB check.
export function markVotedLocally(sessionId: string, dilemmaId: string) {
  const key = `hirelens.voted.${sessionId}`
  const raw = sessionStorage.getItem(key)
  const set = new Set<string>(raw ? JSON.parse(raw) : [])
  set.add(dilemmaId)
  sessionStorage.setItem(key, JSON.stringify(Array.from(set)))
}

export function hasVotedLocally(sessionId: string, dilemmaId: string): boolean {
  const key = `hirelens.voted.${sessionId}`
  const raw = sessionStorage.getItem(key)
  if (!raw) return false
  const set = new Set<string>(JSON.parse(raw))
  return set.has(dilemmaId)
}
