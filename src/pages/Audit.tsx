import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, CheckCircle2, FlaskConical } from 'lucide-react'
import { Wordmark, Card, Pill, PrimaryButton, SecondaryButton } from '../components/ui'
import { AUDIT_PRESETS, auditCandidates, type CandidateInput } from '../lib/mockScoring'

const EMPTY_A: CandidateInput = { name: 'Candidato A', experienceYears: 3, institution: 'conhecida', cep: '90000-000', answerQuality: 'excelente' }
const EMPTY_B: CandidateInput = { name: 'Candidato B', experienceYears: 3, institution: 'conhecida', cep: '91500-000', answerQuality: 'excelente' }

export default function Audit() {
  const [a, setA] = useState<CandidateInput>(EMPTY_A)
  const [b, setB] = useState<CandidateInput>(EMPTY_B)

  const result = auditCandidates(a, b)

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="max-w-3xl mx-auto px-6 pt-8 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-mist-400 hover:text-cyan-400">
          <ArrowLeft size={15} /> Início
        </Link>
        <Wordmark size="sm" />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <Pill tone="cyan">Demonstração</Pill>
        <h1 className="mt-4 font-[var(--font-display)] text-3xl font-semibold text-mist-100 flex items-center gap-2">
          <FlaskConical className="text-cyan-400" size={28} /> Testar o HireLens
        </h1>
        <p className="mt-2 text-mist-300 max-w-xl leading-relaxed">
          Insira dois candidatos fictícios e veja como o modelo simulado do HireLens pontua cada um, e se a
          diferença de pontuação pode ser explicada por características profissionais.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {AUDIT_PRESETS.map((preset) => (
            <SecondaryButton
              key={preset.label}
              className="text-xs px-4 py-2"
              onClick={() => {
                setA(preset.a)
                setB(preset.b)
              }}
            >
              {preset.label}
            </SecondaryButton>
          ))}
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <CandidateForm value={a} onChange={setA} />
          <CandidateForm value={b} onChange={setB} />
        </div>

        <Card className={`mt-6 p-6 ${result.riskLevel === 'alto' ? 'border-signal-red/40' : result.riskLevel === 'atencao' ? 'border-signal-amber/40' : 'border-signal-green/40'}`}>
          <div className="flex items-center gap-3 mb-4">
            {result.riskLevel === 'nenhum' ? (
              <CheckCircle2 className="text-signal-green" size={22} />
            ) : (
              <AlertTriangle className={result.riskLevel === 'alto' ? 'text-signal-red' : 'text-signal-amber'} size={22} />
            )}
            <h2 className="font-semibold text-mist-100">
              {result.riskLevel === 'nenhum' ? 'Nenhum alerta crítico identificado' : '⚠️ Possível viés detectado'}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <ScoreCard label={a.name} score={result.scoreA.total} />
            <ScoreCard label={b.name} score={result.scoreB.total} />
          </div>

          <dl className="text-sm space-y-2">
            <Row label="Diferença de pontuação" value={`${result.diff} pontos`} />
            <Row label="Variável suspeita" value={result.suspiciousVariable || 'Nenhuma identificada'} />
            <Row
              label="Nível de alerta"
              value={result.riskLevel === 'alto' ? 'Alto' : result.riskLevel === 'atencao' ? 'Atenção' : 'Nenhum'}
            />
            <Row label="Ação recomendada" value={result.recommendation} />
          </dl>

          <p className="text-xs text-mist-400 mt-4 leading-relaxed">
            {result.explainedByProfessionalFactors
              ? 'A diferença pode estar relacionada a uma característica profissional relevante (experiência, formação ou qualidade da resposta).'
              : 'A diferença de pontuação não parece ser explicada pelas características profissionais apresentadas. Apenas a região (CEP) difere entre os candidatos.'}
          </p>
        </Card>

        <p className="mt-6 text-xs text-center text-mist-400">
          Este é um modelo simulado, criado apenas para fins didáticos. Nenhum dado real de candidatos é utilizado.
        </p>

        <div className="mt-8 text-center">
          <Link to="/">
            <PrimaryButton>Voltar ao início</PrimaryButton>
          </Link>
        </div>
      </main>
    </div>
  )
}

function CandidateForm({ value, onChange }: { value: CandidateInput; onChange: (v: CandidateInput) => void }) {
  return (
    <Card className="p-5">
      <input
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        className="w-full bg-transparent font-semibold text-mist-100 mb-4 outline-none border-b border-ink-700 pb-2 focus:border-cyan-400"
      />
      <div className="space-y-3">
        <Field label="Experiência (anos)">
          <input
            type="number"
            min={0}
            max={30}
            value={value.experienceYears}
            onChange={(e) => onChange({ ...value, experienceYears: Number(e.target.value) })}
            className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-base text-mist-100 outline-none focus:border-cyan-400"
          />
        </Field>
        <Field label="Formação">
          <select
            value={value.institution}
            onChange={(e) => onChange({ ...value, institution: e.target.value as CandidateInput['institution'] })}
            className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-base text-mist-100 outline-none focus:border-cyan-400"
          >
            <option value="conhecida">Instituição conhecida</option>
            <option value="pouco_conhecida">Instituição pouco conhecida</option>
          </select>
        </Field>
        <Field label="CEP">
          <input
            value={value.cep}
            onChange={(e) => onChange({ ...value, cep: e.target.value })}
            className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-base font-[var(--font-mono)] text-mist-100 outline-none focus:border-cyan-400"
          />
        </Field>
        <Field label="Qualidade da resposta">
          <select
            value={value.answerQuality}
            onChange={(e) => onChange({ ...value, answerQuality: e.target.value as CandidateInput['answerQuality'] })}
            className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-base text-mist-100 outline-none focus:border-cyan-400"
          >
            <option value="excelente">Excelente</option>
            <option value="boa">Boa</option>
            <option value="regular">Regular</option>
          </select>
        </Field>
      </div>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium uppercase tracking-wide text-mist-400 mb-1">{label}</label>
      {children}
    </div>
  )
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-800/40 p-4 text-center">
      <p className="text-xs text-mist-400 mb-1">{label}</p>
      <p className="font-[var(--font-mono)] text-3xl text-cyan-400">{score}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-ink-700/60 pb-2">
      <dt className="text-mist-400">{label}</dt>
      <dd className="text-mist-100 text-right">{value}</dd>
    </div>
  )
}
