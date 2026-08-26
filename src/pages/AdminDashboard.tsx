import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  Users,
  Play,
  Lock,
  Eye,
  SkipForward,
  FlagOff,
  RotateCcw,
  QrCode,
  Tv,
  X,
  CheckCircle2,
} from 'lucide-react'
import { Wordmark, PrimaryButton, SecondaryButton, DangerButton, Card, Pill, LoadingScreen, OptionBar } from '../components/ui'
import type { GameSession, SessionStatus, Vote } from '../types'
import {
  getSessionByCode,
  getSessionById,
  subscribeToSession,
  subscribeToParticipants,
  countParticipants,
  subscribeToVotes,
  getVotesForSession,
  updateSessionStatus,
  goToNextDilemma,
  resetSession,
} from '../lib/db'
import { isAdminAuthed } from '../lib/localState'
import { getDilemmaByIndex, TOTAL_DILEMMAS } from '../data/dilemmas'
import { tallyDilemma, describeDilemmaResult, isDilemmaTied } from '../lib/ethicsEngine'

const STATUS_LABEL: Record<SessionStatus, string> = {
  lobby: 'Aguardando início',
  voting: 'Votação aberta',
  closed: 'Votação encerrada',
  revealed: 'Resultado revelado',
  finished: 'Jogo finalizado',
}

export default function AdminDashboard() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<GameSession | null>(null)
  const [participantCount, setParticipantCount] = useState(0)
  const [votes, setVotes] = useState<Vote[]>([])
  const [busy, setBusy] = useState(false)
  const [presentation, setPresentation] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!isAdminAuthed()) {
      navigate('/admin')
    }
  }, [navigate])

  useEffect(() => {
    if (!code) return
    let unsubs: Array<() => void> = []
    let sid: string | null = null
    getSessionByCode(code).then((s) => {
      if (!s) {
        setNotFound(true)
        return
      }
      setSession(s)
      sid = s.id
      countParticipants(s.id).then(setParticipantCount)
      getVotesForSession(s.id).then(setVotes)
      unsubs.push(subscribeToSession(s.id, setSession))
      unsubs.push(subscribeToParticipants(s.id, setParticipantCount))
      unsubs.push(subscribeToVotes(s.id, setVotes))
    })
    // Fallback poll: Supabase Realtime can lag or drop an event on the free
    // tier, which would otherwise leave the admin panel stuck showing a
    // stale status/vote count. This keeps the panel eventually-consistent
    // even if a realtime event is missed.
    const poll = setInterval(() => {
      if (!sid) return
      getSessionById(sid).then((s) => s && setSession(s))
      getVotesForSession(sid).then(setVotes)
    }, 4000)
    return () => {
      unsubs.forEach((u) => u())
      clearInterval(poll)
    }
  }, [code])

  const refreshVotes = useCallback(() => {
    if (!session) return
    getVotesForSession(session.id).then(setVotes)
  }, [session])

  if (notFound) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center text-mist-100">
        Sessão não encontrada.
      </div>
    )
  }
  if (!session) return <LoadingScreen label="Carregando painel…" />

  const dilemma = getDilemmaByIndex(session.current_dilemma_index)
  const tally = dilemma ? tallyDilemma(dilemma, votes.filter((v) => v.dilemma_id === dilemma.id)) : null
  const isLast = session.current_dilemma_index === TOTAL_DILEMMAS - 1

  async function runAction(fn: () => Promise<GameSession | void>) {
    setBusy(true)
    try {
      const updated = await fn()
      if (updated) setSession(updated)
      refreshVotes()
    } catch (err) {
      console.error(err)
      alert('Ação falhou. Confira sua conexão com o Supabase e tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  if (presentation) {
    return (
      <PresentationView
        session={session}
        participantCount={participantCount}
        tally={tally}
        onExit={() => setPresentation(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="max-w-4xl mx-auto px-6 pt-6 flex items-center justify-between flex-wrap gap-3">
        <Wordmark size="sm" />
        <div className="flex items-center gap-2 flex-wrap">
          <Pill tone="cyan">Sessão {session.code}</Pill>
          <Pill tone="default">{STATUS_LABEL[session.status]}</Pill>
          <span className="inline-flex items-center gap-1.5 text-xs text-mist-400 font-[var(--font-mono)]">
            <Users size={14} /> {participantCount}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          {dilemma ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Pill tone="cyan">{dilemma.code}</Pill>
                  {session.status === 'revealed' && tally && isDilemmaTied(dilemma, tally) && (
                    <Pill tone="amber">Empate</Pill>
                  )}
                </div>
                <span className="text-xs text-mist-400 font-[var(--font-mono)]">
                  {session.current_dilemma_index + 1} / {TOTAL_DILEMMAS}
                </span>
              </div>
              <h1 className="font-[var(--font-display)] text-xl font-semibold text-mist-100 mb-3">
                {dilemma.title}
              </h1>
              <p className="text-sm text-mist-300 leading-relaxed mb-4">{dilemma.situation[0]}</p>
              <p className="text-sm font-medium text-mist-100 mb-4">{dilemma.question}</p>

              <div className="space-y-3">
                {dilemma.options.map((opt) => {
                  const count = tally?.perOption[opt.id] || 0
                  const pct = tally?.perOptionPct[opt.id] || 0
                  const max = tally ? Math.max(...Object.values(tally.perOption)) : 0
                  const showNumbers = session.status === 'revealed'
                  return (
                    <OptionBar
                      key={opt.id}
                      letter={opt.id}
                      label={opt.label}
                      pct={showNumbers ? pct : 0}
                      count={showNumbers ? count : 0}
                      isLeading={showNumbers && count === max && max > 0}
                    />
                  )
                })}
              </div>
              {session.status !== 'revealed' && (
                <p className="text-xs text-mist-400 mt-3">
                  {tally?.totalVotes || 0} votos recebidos até agora (oculto dos participantes e da tela até a
                  revelação).
                </p>
              )}
              {session.status === 'revealed' && tally && (
                <p
                  className={`text-sm rounded-xl px-4 py-3 mt-4 leading-relaxed border ${
                    isDilemmaTied(dilemma, tally)
                      ? 'text-signal-amber bg-signal-amber/5 border-signal-amber/20'
                      : 'text-cyan-400 bg-cyan-500/5 border-cyan-500/20'
                  }`}
                >
                  {describeDilemmaResult(dilemma, tally)}
                </p>
              )}
            </Card>
          ) : (
            <Card className="p-6 text-mist-300">Jogo finalizado.</Card>
          )}

          <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2">
            {session.status === 'lobby' && (
              <PrimaryButton className="w-full sm:w-auto" disabled={busy} onClick={() => runAction(() => updateSessionStatus(session.id, 'voting'))}>
                <Play size={18} /> Abrir votação
              </PrimaryButton>
            )}
            {session.status === 'voting' && (
              <PrimaryButton className="w-full sm:w-auto" disabled={busy} onClick={() => runAction(() => updateSessionStatus(session.id, 'closed'))}>
                <Lock size={18} /> Encerrar votação
              </PrimaryButton>
            )}
            {session.status === 'closed' && (
              <>
                <PrimaryButton className="w-full sm:w-auto" disabled={busy} onClick={() => runAction(() => updateSessionStatus(session.id, 'revealed'))}>
                  <Eye size={18} /> Revelar resultado
                </PrimaryButton>
                <SecondaryButton className="w-full sm:w-auto" disabled={busy} onClick={() => runAction(() => goToNextDilemma(session))}>
                  <SkipForward size={18} /> {isLast ? 'Finalizar sem revelar' : 'Pular para o próximo dilema'}
                </SecondaryButton>
              </>
            )}
            {session.status === 'revealed' && !isLast && (
              <PrimaryButton className="w-full sm:w-auto" disabled={busy} onClick={() => runAction(() => goToNextDilemma(session))}>
                <SkipForward size={18} /> Próximo dilema
              </PrimaryButton>
            )}
            {session.status === 'revealed' && isLast && (
              <PrimaryButton className="w-full sm:w-auto" disabled={busy} onClick={() => runAction(() => goToNextDilemma(session))}>
                <FlagOff size={18} /> Finalizar jogo
              </PrimaryButton>
            )}
            {session.status === 'finished' && (
              <Link to={`/final/${session.code}`} className="block w-full sm:inline-block sm:w-auto">
                <PrimaryButton className="w-full sm:w-auto">Ver Código de Ética gerado</PrimaryButton>
              </Link>
            )}
            <SecondaryButton className="w-full sm:w-auto" onClick={() => setPresentation(true)}>
              <Tv size={18} /> Modo apresentação
            </SecondaryButton>
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-mist-400 mb-3">Entrar no jogo</h3>
            <Link to={`/admin/qr/${session.code}`}>
              <SecondaryButton className="w-full">
                <QrCode size={16} /> Ver QR Code
              </SecondaryButton>
            </Link>
          </Card>

          <Card className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-mist-400 mb-3">Sessão</h3>
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between">
                <dt className="text-mist-400">Código</dt>
                <dd className="font-[var(--font-mono)] text-mist-100">{session.code}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist-400">Status</dt>
                <dd className="text-mist-100">{STATUS_LABEL[session.status]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist-400">Participantes</dt>
                <dd className="text-mist-100">{participantCount}</dd>
              </div>
            </dl>
            <DangerButton
              className="w-full mt-4"
              disabled={busy}
              onClick={() => {
                if (confirm('Reiniciar a sessão apaga todos os votos e participantes. Confirmar?')) {
                  runAction(() => resetSession(session.id))
                }
              }}
            >
              <RotateCcw size={16} /> Reiniciar sessão
            </DangerButton>
          </Card>
        </aside>
      </main>
    </div>
  )
}

function PresentationView({
  session,
  participantCount,
  tally,
  onExit,
}: {
  session: GameSession
  participantCount: number
  tally: ReturnType<typeof tallyDilemma> | null
  onExit: () => void
}) {
  const dilemma = getDilemmaByIndex(session.current_dilemma_index)
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col p-6 md:p-10">
      <div className="flex items-center justify-between mb-6 md:mb-10 flex-wrap gap-3">
        <Wordmark size="md" />
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2 text-mist-300 font-[var(--font-mono)]">
            <Users size={20} /> {participantCount}
          </span>
          <button onClick={onExit} className="text-mist-400 hover:text-cyan-400" aria-label="Sair do modo apresentação">
            <X size={24} />
          </button>
        </div>
      </div>

      {dilemma && (
        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <Pill tone="cyan">{dilemma.code}</Pill>
            {session.status === 'revealed' && tally && isDilemmaTied(dilemma, tally) && (
              <Pill tone="amber">Empate</Pill>
            )}
          </div>
          <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-5xl font-semibold text-mist-100 mt-4 mb-4 md:mb-6">
            {dilemma.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-mist-300 leading-relaxed mb-6 md:mb-8">
            {dilemma.situation[0]}
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-medium text-mist-100 mb-6 md:mb-8">{dilemma.question}</p>

          <div className="space-y-4">
            {dilemma.options.map((opt) => {
              const showNumbers = session.status === 'revealed'
              const count = tally?.perOption[opt.id] || 0
              const pct = tally?.perOptionPct[opt.id] || 0
              const max = tally ? Math.max(...Object.values(tally.perOption)) : 0
              return (
                <div key={opt.id} className="flex items-start sm:items-center gap-3 md:gap-4">
                  <span className="font-[var(--font-mono)] text-base md:text-lg text-mist-400 w-6 md:w-8 shrink-0">
                    {opt.id.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-base md:text-lg text-mist-100 mb-1.5">{opt.label}</p>
                    {showNumbers && (
                      <div className="h-2.5 md:h-3 w-full rounded-full bg-ink-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            count === max && max > 0 ? 'bg-cyan-400' : 'bg-ink-600'
                          }`}
                          style={{ width: `${Math.max(1, pct)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  {showNumbers && (
                    <span className="font-[var(--font-mono)] text-base md:text-xl text-cyan-400 w-12 md:w-16 text-right shrink-0">
                      {pct}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          {session.status === 'revealed' && (
            <>
              <p className="mt-6 text-mist-400 font-[var(--font-mono)] flex items-center gap-2 text-sm md:text-base">
                <CheckCircle2 size={18} className="text-signal-green shrink-0" /> {tally?.totalVotes || 0} votos registrados
              </p>
              {tally && (
                <p
                  className={`mt-3 text-base md:text-lg leading-relaxed ${
                    isDilemmaTied(dilemma, tally) ? 'text-signal-amber' : 'text-cyan-400'
                  }`}
                >
                  {describeDilemmaResult(dilemma, tally)}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
