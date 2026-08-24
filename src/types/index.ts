export type EthicalValue =
  | 'eficiencia'
  | 'justica'
  | 'precisao_estatistica'
  | 'seguranca'
  | 'contexto_individual'
  | 'igualdade'
  | 'autonomia'
  | 'diversidade'
  | 'competencia'
  | 'automacao'
  | 'supervisao_humana'
  | 'transparencia'
  | 'privacidade'
  | 'propriedade_intelectual'
  | 'direito_a_explicacao'
  | 'responsabilidade'

export interface DilemmaOption {
  id: string // 'a' | 'b' | 'c' | 'd'
  label: string
  values: EthicalValue[]
  principleIfWinner: {
    title: string
    text: string
  }
}

export interface Dilemma {
  id: string // stable slug, also used as dilemma_id in db
  order: number
  code: string // "DILEMA 1"
  title: string
  situation: string[] // paragraphs
  question: string
  options: DilemmaOption[]
  conflict: {
    label: string // "EFICIÊNCIA × JUSTIÇA"
    description: string
  }
}

export type SessionStatus =
  | 'lobby' // created, waiting for participants
  | 'voting' // current dilemma open for votes
  | 'closed' // current dilemma voting closed, result can be revealed
  | 'revealed' // result revealed for current dilemma
  | 'finished' // all dilemmas done, ethics code generated

export interface GameSession {
  id: string
  code: string
  status: SessionStatus
  current_dilemma_index: number
  created_at: string
  finalized_at: string | null
}

export interface Participant {
  id: string
  session_id: string
  nickname: string
  created_at: string
}

export interface Vote {
  id: string
  session_id: string
  dilemma_id: string
  participant_id: string
  option_id: string
  created_at: string
}

export interface DilemmaTally {
  dilemmaId: string
  totalVotes: number
  perOption: Record<string, number> // optionId -> count
  perOptionPct: Record<string, number>
}

export interface ValueScore {
  value: EthicalValue
  score: number // 0-100
}

export interface GeneratedPrinciple {
  id: string
  title: string
  text: string
  fromDilemma: string
}
