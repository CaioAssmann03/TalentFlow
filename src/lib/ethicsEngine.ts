import type { Dilemma, DilemmaTally, EthicalValue, GeneratedPrinciple, Vote } from '../types'
import { DILEMMAS } from '../data/dilemmas'
import { BASE_ARTICLES, VALUE_LABELS } from '../data/values'

export function tallyDilemma(dilemma: Dilemma, votes: Vote[]): DilemmaTally {
  const relevant = votes.filter((v) => v.dilemma_id === dilemma.id)
  const perOption: Record<string, number> = {}
  dilemma.options.forEach((o) => (perOption[o.id] = 0))
  relevant.forEach((v) => {
    if (perOption[v.option_id] !== undefined) perOption[v.option_id]++
  })
  const total = relevant.length
  const perOptionPct: Record<string, number> = {}
  Object.entries(perOption).forEach(([optId, count]) => {
    perOptionPct[optId] = total > 0 ? Math.round((count / total) * 100) : 0
  })
  return { dilemmaId: dilemma.id, totalVotes: total, perOption, perOptionPct }
}

export function getWinningOption(dilemma: Dilemma, tally: DilemmaTally) {
  let winnerId = dilemma.options[0].id
  let max = -1
  for (const opt of dilemma.options) {
    const count = tally.perOption[opt.id] || 0
    if (count > max) {
      max = count
      winnerId = opt.id
    }
  }
  return dilemma.options.find((o) => o.id === winnerId)!
}

/**
 * Computes a 0-100 "priority score" for every ethical value based on how
 * often that value appeared among the options the turma actually chose,
 * weighted by how many votes each option received (not just the winner).
 * This is what powers "78% priorizou Justiça" style statements.
 */
export function computeValueScores(votes: Vote[]): Record<EthicalValue, number> {
  const raw: Partial<Record<EthicalValue, number>> = {}
  let totalWeightedVotes = 0

  for (const dilemma of DILEMMAS) {
    const tally = tallyDilemma(dilemma, votes)
    for (const option of dilemma.options) {
      const count = tally.perOption[option.id] || 0
      totalWeightedVotes += count
      for (const value of option.values) {
        raw[value] = (raw[value] || 0) + count
      }
    }
  }

  const scores = {} as Record<EthicalValue, number>
  const allValues = Object.keys(VALUE_LABELS) as EthicalValue[]
  const denom = totalWeightedVotes || 1
  for (const value of allValues) {
    // Normalize against the average number of values-per-option so scores
    // land in a legible 0-100 range rather than shrinking with option count.
    const raw_score = raw[value] || 0
    scores[value] = Math.min(100, Math.round((raw_score / denom) * 100 * 2.2))
  }
  return scores
}

export function generatePrinciples(votes: Vote[]): GeneratedPrinciple[] {
  return DILEMMAS.map((dilemma) => {
    const tally = tallyDilemma(dilemma, votes)
    const winner = getWinningOption(dilemma, tally)
    return {
      id: `${dilemma.id}-${winner.id}`,
      title: winner.principleIfWinner.title,
      text: winner.principleIfWinner.text,
      fromDilemma: dilemma.code,
    }
  })
}

export interface EthicsArticleResult {
  number: string
  title: string
  text: string
  strength: 'forte' | 'moderado' | 'fraco'
  avgScore: number
}

export function generateEthicsCode(votes: Vote[]): EthicsArticleResult[] {
  const scores = computeValueScores(votes)
  return BASE_ARTICLES.map((article) => {
    const relevantScores = article.relatedValues.map((v) => scores[v] || 0)
    const avg = relevantScores.length
      ? Math.round(relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length)
      : 0
    const strength: EthicsArticleResult['strength'] = avg >= 60 ? 'forte' : avg >= 35 ? 'moderado' : 'fraco'
    const text =
      strength === 'forte' ? article.strongText : strength === 'moderado' ? article.moderateText : article.weakText
    return {
      number: article.number,
      title: article.title,
      text,
      strength,
      avgScore: avg,
    }
  })
}

export function topValues(scores: Record<EthicalValue, number>, n = 4) {
  return (Object.entries(scores) as [EthicalValue, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([value, score]) => ({ value, score, label: VALUE_LABELS[value] }))
}

/**
 * How many times each value was offered as an option across all dilemmas,
 * regardless of votes. Used to break ties among values that scored 0: a
 * value the turma could have picked often but never did was more
 * meaningfully "sacrificed" than one that was barely on the table.
 */
function computeValueOpportunity(): Record<EthicalValue, number> {
  const opportunity: Partial<Record<EthicalValue, number>> = {}
  for (const dilemma of DILEMMAS) {
    for (const option of dilemma.options) {
      for (const value of option.values) {
        opportunity[value] = (opportunity[value] || 0) + 1
      }
    }
  }
  const result = {} as Record<EthicalValue, number>
  for (const value of Object.keys(VALUE_LABELS) as EthicalValue[]) {
    result[value] = opportunity[value] || 0
  }
  return result
}

export function bottomValues(scores: Record<EthicalValue, number>, n = 3) {
  const opportunity = computeValueOpportunity()
  return (Object.entries(scores) as [EthicalValue, number][])
    .sort((a, b) => a[1] - b[1] || opportunity[b[0]] - opportunity[a[0]])
    .slice(0, n)
    .map(([value, score]) => ({ value, score, label: VALUE_LABELS[value] }))
}

/**
 * Builds the closing narrative sentence for the final screen, e.g.
 * "A decisão coletiva foi manter o HireLens, mas transformá-lo em um
 * sistema de apoio à decisão, com auditoria e supervisão humana."
 */
export function buildFinalVerdict(votes: Vote[]): string {
  const scores = computeValueScores(votes)
  const top = topValues(scores, 3)
  const automationScore = scores.automacao || 0
  const supervisionScore = scores.supervisao_humana || 0

  let stance: string
  if (supervisionScore - automationScore > 15) {
    stance =
      'A decisão coletiva foi manter o HireLens, mas transformá-lo em um sistema de apoio à decisão, com auditoria e supervisão humana antes de qualquer eliminação definitiva.'
  } else if (automationScore - supervisionScore > 15) {
    stance =
      'A decisão coletiva foi manter o HireLens com alto grau de autonomia, priorizando a velocidade do processo seletivo em relação à supervisão caso a caso.'
  } else {
    stance =
      'A decisão coletiva foi manter o HireLens em um equilíbrio entre automação e supervisão humana, sem eliminar nem liberar totalmente sua autonomia.'
  }

  const topLabels = top.map((t) => VALUE_LABELS[t.value]).join(', ')
  return `${stance} Os valores mais priorizados pela turma foram: ${topLabels}.`
}
