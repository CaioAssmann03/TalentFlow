import type { Dilemma } from '../types'

export const DILEMMAS: Dilemma[] = [
  {
    id: 'cep',
    order: 1,
    code: 'DILEMA 01',
    title: 'O CEP',
    situation: [
      'Dois candidatos possuem experiência, formação e respostas equivalentes. A única diferença relevante entre eles é a região onde moram.',
      'Candidato A: 82 pontos. Candidato B: 68 pontos.',
      'A auditoria descobre que o CEP está influenciando o resultado do HireLens.',
    ],
    question: 'O que a TalentFlow deve fazer?',
    conflict: {
      label: 'EFICIÊNCIA × JUSTIÇA',
      description:
        'Manter uma variável como o CEP pode preservar a velocidade e a precisão estatística do modelo. Mas se essa variável funciona como proxy de características sensíveis, o processo pode se tornar sistematicamente injusto para quem mora em determinadas regiões.',
    },
    options: [
      {
        id: 'a',
        label: 'Manter o modelo, pois o CEP pode ter valor estatístico.',
        values: ['eficiencia', 'automacao', 'precisao_estatistica'],
        principleIfWinner: {
          title: 'Princípio da Eficiência Estatística',
          text: 'Variáveis com correlação estatística podem ser mantidas no modelo, desde que seu uso seja monitorado.',
        },
      },
      {
        id: 'b',
        label: 'Continuar utilizando, mas exigir revisão humana.',
        values: ['eficiencia', 'supervisao_humana', 'justica'],
        principleIfWinner: {
          title: 'Princípio da Revisão Assistida',
          text: 'Variáveis sensíveis podem influenciar a pontuação, mas decisões finais relacionadas a elas exigem revisão humana.',
        },
      },
      {
        id: 'c',
        label: 'Suspender o uso do CEP e auditar o modelo.',
        values: ['justica', 'transparencia', 'eficiencia'],
        principleIfWinner: {
          title: 'Princípio da Auditoria',
          text: 'Variáveis que possam funcionar como proxies de características sensíveis deverão ser suspensas e auditadas antes de voltar a influenciar decisões automatizadas.',
        },
      },
      {
        id: 'd',
        label: 'Suspender todo o HireLens até entender o problema.',
        values: ['seguranca', 'justica', 'automacao', 'eficiencia'],
        principleIfWinner: {
          title: 'Princípio da Precaução',
          text: 'Diante de evidência de viés sistêmico, o sistema deve ser suspenso integralmente até que a causa seja compreendida.',
        },
      },
    ],
  },
  {
    id: 'pausa',
    order: 2,
    code: 'DILEMA 02',
    title: 'A Pausa Profissional',
    situation: [
      'Ana ficou três anos sem trabalhar porque precisou cuidar de um familiar. O HireLens interpreta a pausa como um indicador negativo.',
      'Outro candidato possui histórico profissional contínuo e recebe pontuação maior, mesmo com competências equivalentes às de Ana.',
    ],
    question: 'Uma pausa profissional deve reduzir automaticamente a pontuação?',
    conflict: {
      label: 'EFICIÊNCIA × CONTEXTO INDIVIDUAL',
      description:
        'Tratar continuidade profissional como sinal positivo simplifica e acelera a triagem de milhares de currículos. Mas ignora contextos de vida legítimos, penalizando sobretudo quem exerceu cuidado familiar.',
    },
    options: [
      {
        id: 'a',
        label: 'Sim, a pausa deve reduzir a pontuação.',
        values: ['eficiencia', 'automacao'],
        principleIfWinner: {
          title: 'Princípio da Continuidade',
          text: 'A continuidade da trajetória profissional é considerada um sinal objetivo de pontuação, sem exceções automáticas.',
        },
      },
      {
        id: 'b',
        label: 'Pode ser considerada, mas nunca sozinha.',
        values: ['eficiencia', 'contexto_individual', 'igualdade'],
        principleIfWinner: {
          title: 'Princípio do Contexto Combinado',
          text: 'Nenhuma pausa profissional pode, isoladamente, determinar a eliminação de um candidato — ela deve ser lida junto de outros fatores.',
        },
      },
      {
        id: 'c',
        label: 'Não deve influenciar a pontuação.',
        values: ['justica', 'contexto_individual', 'igualdade', 'autonomia'],
        principleIfWinner: {
          title: 'Princípio da Não Discriminação por Trajetória',
          text: 'Interrupções na trajetória profissional não podem, por si só, reduzir a pontuação de um candidato.',
        },
      },
      {
        id: 'd',
        label: 'Deve gerar revisão humana.',
        values: ['supervisao_humana', 'contexto_individual', 'justica'],
        principleIfWinner: {
          title: 'Princípio da Revisão Contextual',
          text: 'Pausas profissionais identificadas pelo sistema devem ser sinalizadas para revisão humana, nunca decididas apenas pelo algoritmo.',
        },
      },
    ],
  },
  {
    id: 'sotaque',
    order: 3,
    code: 'DILEMA 03',
    title: 'O Sotaque',
    situation: [
      'Dois candidatos possuem competências equivalentes. Um deles possui sotaque regional forte.',
      'O sistema identifica diferenças nos padrões de linguagem na entrevista gravada e reduz sua pontuação.',
    ],
    question: 'A forma de falar deve influenciar a seleção?',
    conflict: {
      label: 'COMPETÊNCIA × DIVERSIDADE',
      description:
        'Avaliar comunicação pode ser relevante para vagas que dependem dela. Mas confundir sotaque regional com competência comunicativa exclui pessoas por causa de onde vieram, não do que sabem fazer.',
    },
    options: [
      {
        id: 'a',
        label: 'Sim, se comunicação for importante para a vaga.',
        values: ['eficiencia', 'competencia'],
        principleIfWinner: {
          title: 'Princípio da Relevância Funcional',
          text: 'Características de comunicação só podem ser avaliadas quando diretamente relevantes para as exigências da vaga, e nunca por sotaque em si.',
        },
      },
      {
        id: 'b',
        label: 'Sim, mas somente depois de revisão humana.',
        values: ['supervisao_humana', 'competencia', 'diversidade'],
        principleIfWinner: {
          title: 'Princípio da Revisão de Linguagem',
          text: 'Qualquer redução de pontuação associada a padrões de fala deve passar por confirmação humana antes de afetar o resultado.',
        },
      },
      {
        id: 'c',
        label: 'Sotaque não deve influenciar a avaliação profissional.',
        values: ['igualdade', 'diversidade', 'justica'],
        principleIfWinner: {
          title: 'Princípio da Não Discriminação Linguística',
          text: 'Sotaque, dialeto ou variação regional de fala não podem ser utilizados como critério de avaliação profissional.',
        },
      },
      {
        id: 'd',
        label: 'A análise de linguagem deve ser removida do processo.',
        values: ['diversidade', 'igualdade', 'seguranca'],
        principleIfWinner: {
          title: 'Princípio da Exclusão de Variáveis de Risco',
          text: 'Variáveis com alto risco de viés linguístico e cultural são removidas do modelo até que existam salvaguardas comprovadas.',
        },
      },
    ],
  },
  {
    id: 'nota69',
    order: 4,
    code: 'DILEMA 04',
    title: 'Nota 69',
    situation: [
      'O limite de aprovação automática é 70 pontos. Um candidato recebe 69.',
      'A IA recomenda eliminação automática. Nenhum recrutador humano chegará a analisar esse candidato.',
    ],
    question: 'Uma diferença de apenas um ponto deve eliminar automaticamente uma pessoa?',
    conflict: {
      label: 'AUTOMAÇÃO × SUPERVISÃO HUMANA',
      description:
        'Um corte numérico rígido é simples de aplicar em escala e trata todos os candidatos da mesma forma. Mas pontuações próximas ao limite carregam margem de erro do próprio modelo — e um ponto pode decidir uma vida.',
    },
    options: [
      {
        id: 'a',
        label: 'Sim, o critério precisa ser objetivo.',
        values: ['automacao', 'eficiencia'],
        principleIfWinner: {
          title: 'Princípio do Corte Objetivo',
          text: 'O limite de pontuação é aplicado de forma consistente para todos os candidatos, sem exceções manuais.',
        },
      },
      {
        id: 'b',
        label: 'Não, notas próximas do limite devem passar por revisão humana.',
        values: ['supervisao_humana', 'justica'],
        principleIfWinner: {
          title: 'Princípio da Supervisão Humana',
          text: 'Decisões próximas aos limites de aprovação não deverão ser tomadas exclusivamente por sistemas automatizados.',
        },
      },
      {
        id: 'c',
        label: 'Criar uma margem de tolerância.',
        values: ['justica', 'precisao_estatistica', 'eficiencia'],
        principleIfWinner: {
          title: 'Princípio da Margem de Erro',
          text: 'O sistema deve reconhecer sua própria margem de erro estatística e criar uma faixa de tolerância ao redor do limite de corte.',
        },
      },
      {
        id: 'd',
        label: 'Eliminar o sistema de pontuação com corte automático.',
        values: ['seguranca', 'justica', 'supervisao_humana'],
        principleIfWinner: {
          title: 'Princípio do Fim do Corte Automático',
          text: 'Nenhuma eliminação definitiva de candidato pode ocorrer apenas por um limite numérico automatizado.',
        },
      },
    ],
  },
  {
    id: 'segredo',
    order: 5,
    code: 'DILEMA 05',
    title: 'Segredo Comercial',
    situation: [
      'Um candidato pergunta: "Por que fui eliminado?"',
      'A TalentFlow sabe quais fatores influenciaram a pontuação, mas não quer revelar detalhes internos do modelo porque considera isso propriedade intelectual da empresa.',
    ],
    question: 'Quanto a empresa deve explicar?',
    conflict: {
      label: 'TRANSPARÊNCIA × SEGREDO COMERCIAL',
      description:
        'Proteger o modelo protege o investimento e a competitividade da empresa. Mas sem nenhuma explicação, um candidato eliminado não tem como identificar — nem contestar — uma possível injustiça.',
    },
    options: [
      {
        id: 'a',
        label: 'Não revelar nada.',
        values: ['propriedade_intelectual'],
        principleIfWinner: {
          title: 'Princípio da Confidencialidade',
          text: 'Os detalhes internos do modelo são preservados como propriedade intelectual da empresa, sem divulgação a candidatos.',
        },
      },
      {
        id: 'b',
        label: 'Explicar os principais fatores sem revelar o modelo completo.',
        values: ['transparencia', 'direito_a_explicacao', 'propriedade_intelectual'],
        principleIfWinner: {
          title: 'Princípio da Explicabilidade',
          text: 'O candidato deverá receber informações compreensíveis sobre os principais fatores que influenciaram uma decisão automatizada, sem exposição do código-fonte.',
        },
      },
      {
        id: 'c',
        label: 'Revelar toda a lógica utilizada.',
        values: ['transparencia', 'direito_a_explicacao'],
        principleIfWinner: {
          title: 'Princípio da Transparência Total',
          text: 'A lógica completa utilizada na avaliação é disponibilizada integralmente a qualquer candidato que solicitar.',
        },
      },
      {
        id: 'd',
        label: 'Permitir auditoria independente, mas preservar o código-fonte.',
        values: ['transparencia', 'privacidade', 'propriedade_intelectual'],
        principleIfWinner: {
          title: 'Princípio da Auditoria Independente',
          text: 'Auditores externos independentes podem revisar o funcionamento do modelo, preservando o sigilo do código-fonte perante o público.',
        },
      },
    ],
  },
  {
    id: 'decisao_final',
    order: 6,
    code: 'DILEMA 06',
    title: 'Decisão Final',
    situation: [
      'A empresa precisa definir, de uma vez por todas, quais decisões o HireLens poderá tomar sozinho — e quais exigem sempre um ser humano.',
    ],
    question: 'Qual deve ser o limite da automação?',
    conflict: {
      label: 'AUTOMAÇÃO × RESPONSABILIDADE',
      description:
        'Quanto mais a IA decide sozinha, mais rápido e barato é o processo. Quanto mais ela decide sozinha, mais difícil é responsabilizar alguém quando algo dá errado.',
    },
    options: [
      {
        id: 'a',
        label: 'A IA pode eliminar candidatos.',
        values: ['automacao', 'eficiencia'],
        principleIfWinner: {
          title: 'Princípio da Autonomia do Sistema',
          text: 'O HireLens pode tomar decisões de eliminação de candidatos sem intervenção humana obrigatória.',
        },
      },
      {
        id: 'b',
        label: 'A IA pode recomendar, mas não eliminar definitivamente.',
        values: ['automacao', 'supervisao_humana', 'responsabilidade'],
        principleIfWinner: {
          title: 'Princípio da Recomendação Não Vinculante',
          text: 'O HireLens pode recomendar candidatos, mas nenhuma eliminação definitiva ocorre sem confirmação humana.',
        },
      },
      {
        id: 'c',
        label: 'A IA pode organizar e pontuar, mas decisões relevantes precisam de humanos.',
        values: ['justica', 'eficiencia', 'supervisao_humana'],
        principleIfWinner: {
          title: 'Princípio do Limite da Automação',
          text: 'O sistema pode organizar, pontuar e priorizar candidatos, mas toda decisão relevante para a trajetória de uma pessoa exige responsabilidade humana.',
        },
      },
      {
        id: 'd',
        label: 'A IA não deve participar de decisões de contratação.',
        values: ['seguranca', 'justica', 'responsabilidade'],
        principleIfWinner: {
          title: 'Princípio da Exclusão da IA',
          text: 'Sistemas automatizados não devem participar, em nenhuma etapa, de decisões relacionadas à contratação de pessoas.',
        },
      },
    ],
  },
]

export const getDilemmaById = (id: string) => DILEMMAS.find((d) => d.id === id)
export const getDilemmaByIndex = (index: number) => DILEMMAS[index]
export const TOTAL_DILEMMAS = DILEMMAS.length
