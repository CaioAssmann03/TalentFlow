export interface CandidateInput {
  name: string
  experienceYears: number
  institution: 'conhecida' | 'pouco_conhecida'
  cep: string
  answerQuality: 'excelente' | 'boa' | 'regular'
}

export interface ScoreBreakdown {
  base: number
  experience: number
  institution: number
  answer: number
  regionAdjustment: number
  total: number
}

// Deterministic MOCK scoring model, built only to illustrate — in this
// demo, the CEP prefix intentionally introduces a hidden regional penalty,
// mirroring the audit finding described in the case study.
const HIGH_RISK_CEP_PREFIXES = ['9', '8']

export function scoreCandidate(c: CandidateInput): ScoreBreakdown {
  const base = 50
  const experience = Math.min(20, c.experienceYears * 4)
  const institution = c.institution === 'conhecida' ? 10 : 2
  const answer = c.answerQuality === 'excelente' ? 20 : c.answerQuality === 'boa' ? 10 : 2
  const firstDigit = c.cep.trim()[0]
  const regionAdjustment = HIGH_RISK_CEP_PREFIXES.includes(firstDigit) ? -14 : 0
  const total = Math.max(0, Math.min(100, base + experience + institution + answer + regionAdjustment))
  return { base, experience, institution, answer, regionAdjustment, total }
}

export interface AuditResult {
  scoreA: ScoreBreakdown
  scoreB: ScoreBreakdown
  diff: number
  explainedByProfessionalFactors: boolean
  suspiciousVariable: string | null
  riskLevel: 'nenhum' | 'atencao' | 'alto'
  recommendation: string
}

export function auditCandidates(a: CandidateInput, b: CandidateInput): AuditResult {
  const scoreA = scoreCandidate(a)
  const scoreB = scoreCandidate(b)
  const diff = Math.abs(scoreA.total - scoreB.total)

  const sameExperience = a.experienceYears === b.experienceYears
  const sameInstitution = a.institution === b.institution
  const sameAnswer = a.answerQuality === b.answerQuality
  const sameCepRisk = a.cep.trim()[0] === b.cep.trim()[0]

  const professionalDiffers = !sameExperience || !sameInstitution || !sameAnswer
  const explainedByProfessionalFactors = professionalDiffers || sameCepRisk

  let suspiciousVariable: string | null = null
  if (!explainedByProfessionalFactors) suspiciousVariable = 'CEP'

  let riskLevel: AuditResult['riskLevel'] = 'nenhum'
  if (!explainedByProfessionalFactors && diff >= 10) riskLevel = 'alto'
  else if (!explainedByProfessionalFactors && diff >= 5) riskLevel = 'atencao'

  const recommendation =
    riskLevel === 'alto'
      ? 'Suspender a variável de região e auditar o modelo antes de continuar utilizando esta pontuação.'
      : riskLevel === 'atencao'
      ? 'Sinalizar para revisão humana antes de decidir com base nesta diferença.'
      : 'Nenhuma ação adicional necessária — a diferença parece explicada por características profissionais.'

  return { scoreA, scoreB, diff, explainedByProfessionalFactors, suspiciousVariable, riskLevel, recommendation }
}

export const AUDIT_PRESETS: { label: string; a: CandidateInput; b: CandidateInput }[] = [
  {
    label: 'Cenário com viés (mesmo perfil, CEPs diferentes)',
    a: { name: 'Candidato A', experienceYears: 3, institution: 'conhecida', cep: '90000-000', answerQuality: 'excelente' },
    b: { name: 'Candidato B', experienceYears: 3, institution: 'conhecida', cep: '91500-000', answerQuality: 'excelente' },
  },
  {
    label: 'Cenário justo (diferença de experiência, mesmo CEP)',
    a: { name: 'Candidato A', experienceYears: 3, institution: 'conhecida', cep: '90000-000', answerQuality: 'excelente' },
    b: { name: 'Candidato B', experienceYears: 1, institution: 'conhecida', cep: '90000-000', answerQuality: 'excelente' },
  },
]
