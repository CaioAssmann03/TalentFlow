import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Wordmark, PrimaryButton, Card } from '../components/ui'
import { getSessionByCode, joinSession } from '../lib/db'
import { saveParticipant } from '../lib/localState'

export default function Participate() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [nickname, setNickname] = useState('')
  const [code, setCode] = useState(params.get('sessao') || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (code.trim().length < 4) {
      setError('Digite um código de sessão válido.')
      return
    }
    setLoading(true)
    try {
      const session = await getSessionByCode(code.trim())
      if (!session) {
        setError('Sessão não encontrada. Confira o código com o apresentador.')
        setLoading(false)
        return
      }
      const participant = await joinSession(session.id, nickname)
      saveParticipant({ id: participant.id, nickname: participant.nickname, sessionId: session.id })
      navigate(`/jogo/${session.code}`)
    } catch (err) {
      console.error(err)
      setError('Não foi possível entrar na sessão. Verifique sua conexão e tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      <header className="max-w-md w-full mx-auto px-6 pt-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-mist-400 hover:text-cyan-400">
          <ArrowLeft size={15} /> Voltar
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <Card className="w-full max-w-md p-7 animate-rise">
          <Wordmark size="sm" />
          <h1 className="mt-6 text-2xl font-semibold text-mist-100 font-[var(--font-display)]">Entrar no jogo</h1>
          <p className="mt-1 text-sm text-mist-400">
            Seus dados não são coletados. O apelido é opcional e só aparece para você.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-mist-400 mb-1.5">
                Código da sessão
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="HL-2026"
                maxLength={8}
                autoFocus
                className="w-full rounded-xl border border-ink-600 bg-ink-800 px-4 py-3.5 text-center font-[var(--font-mono)] text-lg tracking-[0.2em] text-mist-100 placeholder:text-mist-400/50 outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-mist-400 mb-1.5">
                Digite seu apelido (opcional)
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: Candidato 42"
                maxLength={30}
                className="w-full rounded-xl border border-ink-600 bg-ink-800 px-4 py-3.5 text-mist-100 placeholder:text-mist-400/50 outline-none focus:border-cyan-400"
              />
            </div>

            {error && (
              <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <PrimaryButton type="submit" disabled={loading} className="w-full">
              {loading ? 'Entrando…' : 'Entrar no jogo'} {!loading && <ArrowRight size={18} />}
            </PrimaryButton>
          </form>
        </Card>
      </main>
    </div>
  )
}
