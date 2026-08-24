import { supabase } from './supabase'
import type { GameSession, Participant, SessionStatus, Vote } from '../types'
import { TOTAL_DILEMMAS } from '../data/dilemmas'

// ---------- Session codes ----------

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no O/0/I/1 ambiguity

export function generateSessionCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return code
}

// ---------- Sessions ----------

export async function createSession(): Promise<GameSession> {
  const code = generateSessionCode()
  const { data, error } = await supabase
    .from('sessions')
    .insert({ code, status: 'lobby', current_dilemma_index: 0 })
    .select()
    .single()
  if (error) throw error
  return data as GameSession
}

export async function getSessionByCode(code: string): Promise<GameSession | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle()
  if (error) throw error
  return data as GameSession | null
}

export async function getSessionById(id: string): Promise<GameSession | null> {
  const { data, error } = await supabase.from('sessions').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data as GameSession | null
}

export async function updateSessionStatus(sessionId: string, status: SessionStatus): Promise<GameSession> {
  const { data, error } = await supabase
    .from('sessions')
    .update({ status })
    .eq('id', sessionId)
    .select()
    .single()
  if (error) throw error
  return data as GameSession
}

export async function goToNextDilemma(session: GameSession): Promise<GameSession> {
  const nextIndex = session.current_dilemma_index + 1
  if (nextIndex >= TOTAL_DILEMMAS) {
    const { data, error } = await supabase
      .from('sessions')
      .update({ status: 'finished', finalized_at: new Date().toISOString() })
      .eq('id', session.id)
      .select()
      .single()
    if (error) throw error
    return data as GameSession
  }
  const { data, error } = await supabase
    .from('sessions')
    .update({ current_dilemma_index: nextIndex, status: 'voting' })
    .eq('id', session.id)
    .select()
    .single()
  if (error) throw error
  return data as GameSession
}

export async function resetSession(sessionId: string): Promise<GameSession> {
  await supabase.from('votes').delete().eq('session_id', sessionId)
  await supabase.from('participants').delete().eq('session_id', sessionId)
  const { data, error } = await supabase
    .from('sessions')
    .update({ status: 'lobby', current_dilemma_index: 0, finalized_at: null })
    .eq('id', sessionId)
    .select()
    .single()
  if (error) throw error
  return data as GameSession
}

export function subscribeToSession(sessionId: string, onChange: (session: GameSession) => void) {
  const channel = supabase
    .channel(`session-${sessionId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
      (payload) => onChange(payload.new as GameSession)
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

// ---------- Participants ----------

export async function joinSession(sessionId: string, nickname: string): Promise<Participant> {
  const { data, error } = await supabase
    .from('participants')
    .insert({ session_id: sessionId, nickname: nickname.trim() || 'Participante' })
    .select()
    .single()
  if (error) throw error
  return data as Participant
}

export async function countParticipants(sessionId: string): Promise<number> {
  const { count, error } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
  if (error) throw error
  return count || 0
}

export function subscribeToParticipants(sessionId: string, onChange: (count: number) => void) {
  const channel = supabase
    .channel(`participants-${sessionId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'participants', filter: `session_id=eq.${sessionId}` },
      () => {
        countParticipants(sessionId).then(onChange)
      }
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

// ---------- Votes ----------

export async function castVote(params: {
  sessionId: string
  dilemmaId: string
  participantId: string
  optionId: string
}): Promise<Vote> {
  const { data, error } = await supabase
    .from('votes')
    .insert({
      session_id: params.sessionId,
      dilemma_id: params.dilemmaId,
      participant_id: params.participantId,
      option_id: params.optionId,
    })
    .select()
    .single()
  if (error) throw error
  return data as Vote
}

export async function getMyVoteForDilemma(
  participantId: string,
  dilemmaId: string
): Promise<Vote | null> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('participant_id', participantId)
    .eq('dilemma_id', dilemmaId)
    .maybeSingle()
  if (error) throw error
  return data as Vote | null
}

export async function getVotesForSession(sessionId: string): Promise<Vote[]> {
  const { data, error } = await supabase.from('votes').select('*').eq('session_id', sessionId)
  if (error) throw error
  return (data || []) as Vote[]
}

export async function getVotesForDilemma(sessionId: string, dilemmaId: string): Promise<Vote[]> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('session_id', sessionId)
    .eq('dilemma_id', dilemmaId)
  if (error) throw error
  return (data || []) as Vote[]
}

export function subscribeToVotes(sessionId: string, onChange: (votes: Vote[]) => void) {
  const channel = supabase
    .channel(`votes-${sessionId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'votes', filter: `session_id=eq.${sessionId}` },
      () => {
        getVotesForSession(sessionId).then(onChange)
      }
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}
