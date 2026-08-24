import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, Plus, LogIn } from 'lucide-react'
import { Wordmark, PrimaryButton, SecondaryButton, Card } from '../components/ui'
import { ADMIN_PASSWORD } from '../lib/supabase'
import { setAdminAuthed, isAdminAuthed } from '../lib/localState'
import { createSession, getSessionByCode } from '../lib/db'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [authed, setAuthed] = useState(isAdminAuthed())
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)

  function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAdminAuthed(true)
      setAuthed(true)
      setError(null)
    } else {
      setError('Senha incorreta.')
    }
  }

  async function handleCreate() {
    setLoading(true)
    try {
      const session = await createSession()
      navigate(`/admin/dashboard/${session.code}`)
    } catch (err) {
      console.error(err)
      const detail =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : String(err)
      setError(`Não foi possível criar a sessão (${detail}). Confira o README na seção "Solução de problemas".`)
      setLoading(false)
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault()
    if (!joinCode.trim()) return
    setLoading(true)
    try {
      const session = await getSessionByCode(joinCode.trim())
      if (!session) {
        setError('Sessão não encontrada.')
        setLoading(false)
        return
      }
      navigate(`/admin/dashboard/${session.code}`)
    } catch (err) {
      console.error(err)
      setError('Erro ao buscar sessão.')
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

          {!authed ? (
            <>
              <h1 className="mt-6 text-2xl font-semibold text-mist-100 font-[var(--font-display)]">
                Área do apresentador
              </h1>
              <p className="mt-1 text-sm text-mist-400">Digite a senha configurada para esta apresentação.</p>
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div className="relative">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    autoFocus
                    className="w-full rounded-xl border border-ink-600 bg-ink-800 pl-11 pr-4 py-3.5 text-mist-100 placeholder:text-mist-400/50 outline-none focus:border-cyan-400"
                  />
                </div>
                {error && <p className="text-sm text-signal-red">{error}</p>}
                <PrimaryButton type="submit" className="w-full">
                  Entrar
                </PrimaryButton>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-6 text-2xl font-semibold text-mist-100 font-[var(--font-display)]">
                Painel do apresentador
              </h1>
              <p className="mt-1 text-sm text-mist-400">Crie uma nova sessão ou continue uma já existente.</p>

              <div className="mt-6 space-y-3">
                <PrimaryButton onClick={handleCreate} disabled={loading} className="w-full">
                  <Plus size={18} /> {loading ? 'Criando…' : 'Criar nova sessão'}
                </PrimaryButton>

                <form onSubmit={handleJoin} className="flex gap-2">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Código existente"
                    className="flex-1 rounded-xl border border-ink-600 bg-ink-800 px-4 py-3 font-[var(--font-mono)] text-mist-100 placeholder:text-mist-400/50 outline-none focus:border-cyan-400"
                  />
                  <SecondaryButton type="submit" disabled={loading}>
                    <LogIn size={18} />
                  </SecondaryButton>
                </form>
              </div>
              {error && <p className="text-sm text-signal-red mt-3">{error}</p>}

              <Link to="/auditoria" className="block text-center text-sm text-mist-400 hover:text-cyan-400 mt-6">
                Abrir demonstração de auditoria →
              </Link>
            </>
          )}
        </Card>
      </main>
    </div>
  )
}
