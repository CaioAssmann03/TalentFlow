import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Hourglass, Users } from 'lucide-react'
import { Wordmark, Card, Pill, LoadingScreen, OptionBar } from '../components/ui'
import type { GameSession, Vote } from '../types'
import {
  castVote,
  countParticipants,
  getMyVoteForDilemma,
  getSessionByCode,
  getSessionById,
  getVotesForDilemma,
  subscribeToParticipants,
  subscribeToSession,
  subscribeToVotes,
} from '../lib/db'
import { getStoredParticipant, hasVotedLocally, markVotedLocally } from '../lib/localState'
import { getDilemmaByIndex } from '../data/dilemmas'
import { tallyDilemma, describeDilemmaResult } from '../lib/ethicsEngine'

export default function Game() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<GameSession | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)
  const [myVoteOptionId, setMyVoteOptionId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const participant = session ? getStoredParticipant(session.id) : null

  useEffect(() => {
    if (!code) return
    let unsubSession: (() => void) | undefined
    let unsubParticipants: (() => void) | undefined
    let sid: string | null = null
    getSessionByCode(code).then((s) => {
      if (!s) {
        setNotFound(true)
        return
      }
      setSession(s)
      const stored = getStoredParticipant(s.id)
      if (!stored) {
        navigate(`/participar?sessao=${s.code}`)
        return
      }
      sid = s.id
      countParticipants(s.id).then(setParticipantCount)
      unsubSession = subscribeToSession(s.id, (updated) => setSession(updated))
      unsubParticipants = subscribeToParticipants(s.id, setParticipantCount)
    })
    // Fallback poll in case a realtime event on `sessions` is missed — keeps
    // the participant screen from getting stuck on an old dilemma/status.
    const poll = setInterval(() => {
      if (!sid) return
      getSessionById(sid).then((s) => s && setSession(s))
    }, 4000)
    return () => {
      unsubSession?.()
      unsubParticipants?.()
      clearInterval(poll)
    }
  }, [code, navigate])

  const dilemma = session ? getDilemmaByIndex(session.current_dilemma_index) : null

  const refreshVotes = useCallback(() => {
    if (!session || !dilemma) return
    getVotesForDilemma(session.id, dilemma.id).then(setVotes)
  }, [session, dilemma])

  useEffect(() => {
    if (!session || !dilemma) return
    refreshVotes()
    const unsub = subscribeToVotes(session.id, (all) => setVotes(all.filter((v) => v.dilemma_id === dilemma.id)))
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, dilemma?.id])

  useEffect(() => {
    if (!session || !dilemma || !participant) return
    setVoteError(null)
    if (hasVotedLocally(session.id, dilemma.id)) {
      getMyVoteForDilemma(participant.id, dilemma.id).then((v) => setMyVoteOptionId(v?.option_id || null))
    } else {
      setMyVoteOptionId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.current_dilemma_index])

  useEffect(() => {
    if (session?.status === 'finished') {
      navigate(`/final/${session.code}`)
    }
  }, [session?.status, session, navigate])

  async function handleVote(optionId: string) {
    if (!session || !dilemma || !participant || submitting || myVoteOptionId) return
    setSubmitting(true)
    setVoteError(null)
    try {
      await castVote({
        sessionId: session.id,
        dilemmaId: dilemma.id,
        participantId: participant.id,
        optionId,
      })
      markVotedLocally(session.id, dilemma.id)
      setMyVoteOptionId(optionId)
    } catch (err) {
      console.error(err)
      // A duplicate-vote conflict (same participant, same dilemma) means
      // this participant already has a vote recorded server-side — resync
      // instead of just failing, so the UI doesn't stay stuck.
      const existing = await getMyVoteForDilemma(participant.id, dilemma.id).catch(() => null)
      if (existing) {
        markVotedLocally(session.id, dilemma.id)
        setMyVoteOptionId(existing.option_id)
      } else {
        setVoteError('Não foi possível registrar seu voto. Verifique sua conexão e tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-mist-100 text-lg font-semibold">Sessão não encontrada</p>
          <p className="text-mist-400 text-sm mt-1">Confira o código com o apresentador.</p>
        </div>
      </div>
    )
  }

  if (!session || !dilemma) return <LoadingScreen label="Conectando à sessão…" />

  const tally = tallyDilemma(dilemma, votes)
  const showResults = session.status === 'revealed'

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      <header className="max-w-2xl w-full mx-auto px-6 pt-6 flex items-center justify-between">
        <Wordmark size="sm" />
        <div className="flex items-center gap-2 text-xs text-mist-400 font-[var(--font-mono)]">
          <Users size={14} /> {participantCount}
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <Pill tone="cyan">{dilemma.code}</Pill>
          <span className="text-xs text-mist-400 font-[var(--font-mono)]">
            {session.current_dilemma_index + 1} / 6
          </span>
        </div>

        <h1 className="font-[var(--font-display)] text-2xl font-semibold text-mist-100 mb-4">{dilemma.title}</h1>

        <Card className="p-5 mb-6">
          {dilemma.situation.map((p, i) => (
            <p key={i} className="text-sm text-mist-300 leading-relaxed mb-2 last:mb-0">
              {p}
            </p>
          ))}
        </Card>

        <h2 className="font-semibold text-mist-100 mb-3">{dilemma.question}</h2>

        {session.status === 'lobby' && (
          <WaitCard icon={<Hourglass size={18} />} text="Aguardando o apresentador abrir a votação…" />
        )}

        {(session.status === 'voting' || session.status === 'closed') && !showResults && (
          <div className="space-y-3">
            {dilemma.options.map((opt) => {
              const selected = myVoteOptionId === opt.id
              const disabled = Boolean(myVoteOptionId) || session.status === 'closed'
              return (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  disabled={disabled}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    selected
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : disabled
                      ? 'border-ink-700 bg-ink-800/30 opacity-50'
                      : 'border-ink-700 bg-ink-800/40 hover:border-cyan-500/50 active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-[var(--font-mono)] text-xs w-6 h-6 rounded-full flex items-center justify-center border shrink-0 ${
                        selected ? 'border-cyan-400 text-cyan-400' : 'border-ink-600 text-mist-400'
                      }`}
                    >
                      {opt.id.toUpperCase()}
                    </span>
                    <span className="text-sm text-mist-100 leading-snug flex-1 min-w-0">{opt.label}</span>
                    {selected && <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />}
                  </div>
                </button>
              )
            })}
            {voteError && (
              <p className="text-center text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
                {voteError}
              </p>
            )}
            {myVoteOptionId && (
              <p className="text-center text-sm text-cyan-400 pt-2">
                ✓ Decisão confirmada. Aguardando os demais participantes…
              </p>
            )}
            {session.status === 'closed' && !myVoteOptionId && (
              <p className="text-center text-sm text-signal-amber pt-2">A votação foi encerrada.</p>
            )}
          </div>
        )}

        {showResults && (
          <div className="space-y-3">
            <p className="text-sm text-cyan-400 bg-cyan-500/5 border border-cyan-500/20 rounded-xl px-4 py-3 leading-relaxed">
              {describeDilemmaResult(dilemma, tally)}
            </p>
            {dilemma.options.map((opt) => {
              const max = Math.max(...Object.values(tally.perOption))
              const isLeading = tally.perOption[opt.id] === max && max > 0
              return (
                <OptionBar
                  key={opt.id}
                  letter={opt.id}
                  label={opt.label}
                  pct={tally.perOptionPct[opt.id]}
                  count={tally.perOption[opt.id]}
                  isLeading={isLeading}
                />
              )
            })}
            <p className="text-center text-xs text-mist-400 pt-2 font-[var(--font-mono)]">
              {tally.totalVotes} {tally.totalVotes === 1 ? 'voto registrado' : 'votos registrados'}
            </p>
            <WaitCard icon={<Hourglass size={18} />} text="Aguardando o próximo dilema…" />
          </div>
        )}
      </main>
    </div>
  )
}

function WaitCard({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Card className="p-6 flex items-center gap-3 justify-center text-mist-400">
      <span className="text-cyan-400">{icon}</span>
      <span className="text-sm">{text}</span>
    </Card>
  )
}
