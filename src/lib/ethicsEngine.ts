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
 * All options tied for the most votes. Has more than one entry only when
 * there's a real tie (two or more options with the same, nonzero, top
 * count) — with no votes cast yet it falls back to just the first option,
 * same as getWinningOption.
 */
export function getWinningOptions(dilemma: Dilemma, tally: DilemmaTally) {
  const max = Math.max(...dilemma.options.map((o) => tally.perOption[o.id] || 0))
  if (max === 0) return [dilemma.options[0]]
  return dilemma.options.filter((o) => (tally.perOption[o.id] || 0) === max)
}

export function isDilemmaTied(dilemma: Dilemma, tally: DilemmaTally): boolean {
  return tally.totalVotes > 0 && getWinningOptions(dilemma, tally).length > 1
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

/**
 * Picks the dilemma where the turma was most divided (smallest margin
 * between the top two options) to headline as the final screen's "hard
 * choice". Falls back to the first dilemma if nothing was voted on yet.
 */
export function getMostContestedDilemma(votes: Vote[]): Dilemma {
  let best: Dilemma = DILEMMAS[0]
  let bestMargin = Infinity
  let bestTotal = 0
  for (const dilemma of DILEMMAS) {
    const tally = tallyDilemma(dilemma, votes)
    if (tally.totalVotes === 0) continue
    const counts = dilemma.options.map((o) => tally.perOption[o.id] || 0).sort((a, b) => b - a)
    const margin = counts[0] - (counts[1] || 0)
    if (margin < bestMargin || (margin === bestMargin && tally.totalVotes > bestTotal)) {
      bestMargin = margin
      bestTotal = tally.totalVotes
      best = dilemma
    }
  }
  return best
}

/**
 * Short narrative for what the turma just decided on a single dilemma,
 * meant to be shown right when the admin reveals its result — before
 * moving on to the next one.
 */
export function describeDilemmaResult(dilemma: Dilemma, tally: DilemmaTally): string {
  if (tally.totalVotes === 0) return 'Ninguém votou neste dilema.'

  const winners = getWinningOptions(dilemma, tally)
  if (winners.length > 1) {
    const pct = tally.perOptionPct[winners[0].id]
    const letters = winners.map((o) => o.id.toUpperCase()).join(', ')
    return `Empate entre as alternativas ${letters}, cada uma com ${pct}% dos votos. A turma não chegou a uma maioria neste dilema.`
  }

  const winner = winners[0]
  const pct = tally.perOptionPct[winner.id]
  const sortedPct = dilemma.options.map((o) => tally.perOptionPct[o.id]).sort((a, b) => b - a)
  const runnerUpPct = sortedPct[1] || 0
  const margin = pct - runnerUpPct

  const closeness = margin <= 10 && runnerUpPct > 0 ? 'com a turma dividida' : pct >= 70 ? 'em ampla maioria' : 'pela maioria'
  const valueLabels = winner.values.map((v) => VALUE_LABELS[v]).join(', ')

  return `A turma decidiu ${closeness} (${pct}% dos votos): "${winner.label}" Essa escolha prioriza ${valueLabels}.`
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

// Values offered in only 1-2 of the 24 option slots across the whole game
// (autonomia, privacidade...) barely had a real chance to be picked, so
// they'd dominate "valores sacrificados" every single session regardless
// of what the turma actually voted. Values with at least this many chances
// are preferred candidates; rare ones only fill in if not enough qualify.
const MIN_FAIR_OPPORTUNITY = 3

export function bottomValues(scores: Record<EthicalValue, number>, n = 3) {
  const opportunity = computeValueOpportunity()
  const byScore = (a: [EthicalValue, number], b: [EthicalValue, number]) =>
    a[1] - b[1] || opportunity[b[0]] - opportunity[a[0]]

  const entries = Object.entries(scores) as [EthicalValue, number][]
  const fair = entries.filter(([v]) => opportunity[v] >= MIN_FAIR_OPPORTUNITY).sort(byScore)
  const rare = entries.filter(([v]) => opportunity[v] < MIN_FAIR_OPPORTUNITY).sort(byScore)

  return [...fair, ...rare]
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
  const bottom = bottomValues(scores, 1)
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
  const sacrifice =
    bottom.length && bottom[0].score < 40
      ? ` Em contrapartida, ${VALUE_LABELS[bottom[0].value].toLowerCase()} foi o valor menos priorizado pela turma ao longo dos 6 dilemas.`
      : ''

  return `${stance} Os valores mais priorizados pela turma foram: ${topLabels}.${sacrifice}`
}
