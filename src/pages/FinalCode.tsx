import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ScrollText, Swords } from 'lucide-react'
import { Wordmark, Card, Pill, LoadingScreen, ValueBar, SecondaryButton } from '../components/ui'
import type { GameSession, Vote } from '../types'
import { getSessionByCode, getVotesForSession } from '../lib/db'
import {
  buildFinalVerdict,
  computeValueScores,
  generateEthicsCode,
  generatePrinciples,
  getMostContestedDilemma,
  topValues,
  bottomValues,
} from '../lib/ethicsEngine'

export default function FinalCode() {
  const { code } = useParams<{ code: string }>()
  const [session, setSession] = useState<GameSession | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!code) return
    getSessionByCode(code).then((s) => {
      if (!s) {
        setNotFound(true)
        return
      }
      setSession(s)
      getVotesForSession(s.id).then(setVotes)
    })
  }, [code])

  if (notFound) return <NotFoundScreen />
  if (!session) return <LoadingScreen label="Compilando o Código de Ética…" />

  const scores = computeValueScores(votes)
  const top = topValues(scores, 4)
  const bottom = bottomValues(scores, 3)
  const articles = generateEthicsCode(votes)
  const principles = generatePrinciples(votes)
  const verdict = buildFinalVerdict(votes)

  // Main conflict: pick the dilemma with the closest vote split as the
  // headline "hard choice" to illustrate, defaulting to eficiência × justiça
  // when nothing was voted on yet.
  const highlightDilemma = getMostContestedDilemma(votes)

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="max-w-3xl mx-auto px-6 pt-8 flex items-center justify-between">
        <Wordmark size="sm" />
        <Link to="/" className="text-sm text-mist-400 hover:text-cyan-400">
          Início
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center animate-rise">
          <Pill tone="cyan">A turma decidiu</Pill>
          <h1 className="mt-4 font-[var(--font-display)] text-3xl md:text-4xl font-semibold text-mist-100">
            Código de Ética do HireLens
          </h1>
          <p className="mt-3 text-mist-300 max-w-xl mx-auto leading-relaxed">{verdict}</p>
        </div>

        <section className="mt-10 grid md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-mist-100 mb-4 uppercase tracking-wide">Valores priorizados</h3>
            <div className="space-y-3">
              {top.map((v) => (
                <ValueBar key={v.value} label={v.label} score={v.score} tone="green" />
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-mist-100 mb-4 uppercase tracking-wide">Valores sacrificados</h3>
            <div className="space-y-3">
              {bottom.map((v) => (
                <ValueBar key={v.value} label={v.label} score={v.score} tone="red" />
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-6">
          <Card className="p-5 border-signal-amber/30">
            <div className="flex items-center gap-2 mb-2">
              <Swords size={16} className="text-signal-amber" />
              <h3 className="text-sm font-semibold text-signal-amber uppercase tracking-wide">
                {highlightDilemma.conflict.label}
              </h3>
            </div>
            <p className="text-sm text-mist-300 leading-relaxed">{highlightDilemma.conflict.description}</p>
          </Card>
        </section>

        <section className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <ScrollText size={18} className="text-cyan-400" />
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-mist-100">
              Código de Ética do HireLens
            </h2>
          </div>
          <div className="space-y-3">
            {articles.map((a) => (
              <Card key={a.number} className="p-5">
                <div className="flex items-start gap-4">
                  <span className="font-[var(--font-mono)] text-xs text-cyan-400 mt-0.5">{a.number}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-mist-100 mb-1">{a.title}</h4>
                    <p className="text-sm text-mist-300 leading-relaxed">{a.text}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-[var(--font-display)] text-xl font-semibold text-mist-100 mb-4">
            Princípios gerados a partir dos dilemas
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {principles.map((p) => (
              <Card key={p.id} className="p-4">
                <p className="text-[11px] font-[var(--font-mono)] text-mist-400 mb-1">{p.fromDilemma}</p>
                <h4 className="text-sm font-semibold text-mist-100 mb-1">{p.title}</h4>
                <p className="text-xs text-mist-300 leading-relaxed">{p.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <footer className="mt-14 text-center">
          <p className="text-mist-400 text-sm italic max-w-md mx-auto leading-relaxed">
            "Não buscamos uma IA que nunca erre. Buscamos uma IA que possa ser auditada, questionada e impedida de
            transformar um possível erro em uma decisão definitiva."
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/auditoria">
              <SecondaryButton>Testar o HireLens</SecondaryButton>
            </Link>
          </div>
        </footer>
      </main>
    </div>
  )
}

function NotFoundScreen() {
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-6 text-center">
      <div>
        <p className="text-mist-100 text-lg font-semibold">Sessão não encontrada</p>
        <p className="text-mist-400 text-sm mt-1">Confira o código com o apresentador.</p>
      </div>
    </div>
  )
}
