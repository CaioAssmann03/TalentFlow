import type { EthicalValue } from '../types'

export const VALUE_LABELS: Record<EthicalValue, string> = {
  eficiencia: 'Eficiência',
  justica: 'Justiça',
  precisao_estatistica: 'Precisão estatística',
  seguranca: 'Segurança',
  contexto_individual: 'Contexto individual',
  igualdade: 'Igualdade',
  autonomia: 'Autonomia',
  diversidade: 'Diversidade',
  competencia: 'Competência',
  automacao: 'Automação',
  supervisao_humana: 'Supervisão humana',
  transparencia: 'Transparência',
  privacidade: 'Privacidade',
  propriedade_intelectual: 'Propriedade intelectual',
  direito_a_explicacao: 'Direito à explicação',
  responsabilidade: 'Responsabilidade',
}

// Base articles of the ethics code. Each links to the values whose scores
// determine how strongly it is expressed in the final document. The turma's
// votes (via dilemma option -> values) drive which articles come out strong,
// moderate, or weak — the text itself is only assembled, never invented,
// from what was actually decided.
export interface BaseArticle {
  id: string
  number: string
  title: string
  relatedValues: EthicalValue[]
  strongText: string
  weakText: string
}

export const BASE_ARTICLES: BaseArticle[] = [
  {
    id: 'nao_discriminacao',
    number: '01',
    title: 'Não discriminação',
    relatedValues: ['justica', 'igualdade', 'diversidade'],
    strongText:
      'Nenhuma característica que funcione como proxy de raça, gênero, origem, região ou classe social pode influenciar, direta ou indiretamente, a pontuação de um candidato.',
    weakText:
      'Características sensíveis devem ser evitadas, mas a turma aceitou algum grau de risco estatístico em nome da eficiência do processo.',
  },
  {
    id: 'explicabilidade',
    number: '02',
    title: 'Explicabilidade',
    relatedValues: ['transparencia', 'direito_a_explicacao'],
    strongText:
      'O candidato deverá receber informações compreensíveis sobre os principais fatores que influenciaram uma decisão automatizada a seu respeito.',
    weakText:
      'A empresa pode manter parte da lógica do modelo em sigilo comercial, oferecendo explicações apenas limitadas quando solicitadas.',
  },
  {
    id: 'supervisao_humana',
    number: '03',
    title: 'Supervisão humana',
    relatedValues: ['supervisao_humana', 'responsabilidade'],
    strongText:
      'Decisões próximas aos limites de aprovação, ou com impacto definitivo sobre a trajetória de uma pessoa, não deverão ser tomadas exclusivamente por sistemas automatizados.',
    weakText:
      'A turma priorizou a velocidade do processo, aceitando que a maior parte das decisões seja tomada sem revisão humana caso a caso.',
  },
  {
    id: 'direito_contestacao',
    number: '04',
    title: 'Direito de contestação',
    relatedValues: ['direito_a_explicacao', 'contexto_individual', 'autonomia'],
    strongText:
      'Todo candidato eliminado tem o direito de contestar a decisão e solicitar que fatores de contexto individual sejam reconsiderados por uma pessoa.',
    weakText:
      'O direito de contestação existe apenas em caráter informal, sem um processo estruturado de reavaliação garantido.',
  },
  {
    id: 'auditoria_continua',
    number: '05',
    title: 'Auditoria contínua',
    relatedValues: ['precisao_estatistica', 'seguranca', 'transparencia'],
    strongText:
      'Variáveis que possam funcionar como proxies de características sensíveis deverão ser monitoradas e auditadas de forma contínua, com poder de suspender o modelo em caso de viés confirmado.',
    weakText:
      'Auditorias ocorrem apenas eventualmente, sem poder automático de suspender o sistema diante de indícios de viés.',
  },
  {
    id: 'qualidade_dados',
    number: '06',
    title: 'Qualidade e responsabilidade dos dados',
    relatedValues: ['precisao_estatistica', 'privacidade', 'competencia'],
    strongText:
      'A TalentFlow é responsável pela qualidade, atualização e adequação dos dados usados para treinar e operar o HireLens, incluindo os efeitos de ruído técnico como qualidade de áudio e vídeo.',
    weakText:
      'A responsabilidade pela qualidade dos dados é tratada como aceitável dentro de margens técnicas usuais, sem exigências adicionais.',
  },
  {
    id: 'limites_automacao',
    number: '07',
    title: 'Limites da automação',
    relatedValues: ['automacao', 'supervisao_humana', 'responsabilidade'],
    strongText:
      'O HireLens pode organizar, pontuar e priorizar candidatos, mas nenhuma decisão definitiva de eliminação pode ocorrer sem possibilidade de revisão humana.',
    weakText:
      'A turma optou por conceder ao HireLens maior autonomia para eliminar candidatos automaticamente, em nome da eficiência do processo seletivo.',
  },
]
