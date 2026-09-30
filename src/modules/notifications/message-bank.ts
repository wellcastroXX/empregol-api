/**
 * Banco de mensagens de engajamento (push / in-app / e-mail).
 * Transcrito do documento "Empregol — Banco de mensagens de engajamento".
 *
 * Este módulo é só o CONTEÚDO + metadados. O motor de disparo (agendador,
 * gatilhos de evento, regras de limite/silêncio/prioridade e o envio via FCM)
 * consome estes dados. Variáveis {como_esta} são resolvidas no envio.
 */

export type Audience = 'ATHLETE' | 'CLUB';
export type Channel = 'PUSH' | 'IN_APP' | 'EMAIL';

/** Destino ao tocar na notificação (mapeado para rotas no app). */
export type DeepLink =
  | 'COMPLETE_PROFILE'
  | 'EDIT_PROFILE'
  | 'ADD_VIDEO'
  | 'ADD_PHOTO'
  | 'SUPPORT_NETWORK'
  | 'MY_PROFILE'
  | 'WHO_VIEWED'
  | 'CONVERSATION'
  | 'VACANCY'
  | 'OPPORTUNITY'
  | 'WEEKLY_SUMMARY'
  | 'HOME'
  | 'SHARE'
  | 'CONTENT'
  | 'CLUB_PROFILE'
  | 'SEARCH_ATHLETES'
  | 'NEW_VACANCY'
  | 'HOW_IT_WORKS'
  | 'FILTER_RESULTS'
  | 'ATHLETE_PROFILE'
  | 'INTERESTED'
  | 'SAVED_LISTS'
  | 'CONVERSATIONS'
  | 'RATE_HIRING';

export type TriggerKind = 'EVENT' | 'SCHEDULED' | 'INACTIVITY' | 'CALENDAR' | 'SEQUENCE';

export type Category =
  | 'onboarding'
  | 'activity'
  | 'streak'
  | 'content'
  | 'reactivation'
  | 'milestone'
  | 'calendar';

export type EngagementMessage = {
  id: string;
  audience: Audience;
  category: Category;
  channels: Channel[];
  /** Descrição humana do gatilho (do PDF). */
  when: string;
  /** Gatilho para o motor: EVENT (evento), SCHEDULED/INACTIVITY (tempo), CALENDAR, SEQUENCE. */
  trigger: { kind: TriggerKind; code: string; params?: Record<string, unknown> };
  title: string;
  body: string;
  /** Texto alternativo quando variáveis obrigatórias estão vazias. */
  fallbackBody?: string;
  deepLink: DeepLink;
  /**
   * Prioridade p/ conflito no mesmo dia (menor = ganha):
   * 1 atividade/marcos · 2 boas-vindas · 3 sequência semanal · 4 calendário ·
   * 5 conteúdo · 6 reativação.
   */
  priority: number;
  /** Variante escolhida conforme autorização do clube mostrar o nome. */
  requiresClubNameAuth?: boolean;
  /** IDs que alternam no mesmo gatilho (ex.: AT-35 / 35b / 35c; conteúdo quinzenal). */
  rotatesWith?: string[];
  /** Condição extra (perfil incompleto, sem vídeo, etc.) — avaliada no motor. */
  condition?: string;
};

/* ───────────────────────── PARTE 1 · ATLETA (40) ───────────────────────── */

const ATHLETE: EngagementMessage[] = [
  // ── Boas-vindas e primeiros passos ──
  {
    id: 'AT-01',
    audience: 'ATHLETE',
    category: 'onboarding',
    channels: ['PUSH', 'IN_APP'],
    when: 'Logo após concluir o cadastro',
    trigger: { kind: 'EVENT', code: 'SIGNUP' },
    title: 'Bem-vindo ao time, {nome}!',
    body: 'Seu perfil já existe. Agora bora deixar ele pronto pra ser visto pelos clubes.',
    deepLink: 'COMPLETE_PROFILE',
    priority: 2,
  },
  {
    id: 'AT-02',
    audience: 'ATHLETE',
    category: 'onboarding',
    channels: ['PUSH'],
    when: '1 h após o cadastro, se perfil < 50%',
    trigger: { kind: 'SCHEDULED', code: 'SIGNUP_PLUS', params: { hours: 1 } },
    condition: 'profileCompletion < 50',
    title: 'Falta pouco pro seu perfil entrar em campo',
    body: 'Coloque sua posição e seus últimos clubes. Leva 2 minutos.',
    deepLink: 'EDIT_PROFILE',
    priority: 2,
  },
  {
    id: 'AT-03',
    audience: 'ATHLETE',
    category: 'onboarding',
    channels: ['PUSH'],
    when: 'Dia 1, se não tem vídeo',
    trigger: { kind: 'SCHEDULED', code: 'SIGNUP_PLUS', params: { days: 1 } },
    condition: 'hasVideo == false',
    title: 'Clube contrata o que vê',
    body: 'Suba seus melhores lances. Um bom vídeo vale mais que mil palavras.',
    deepLink: 'ADD_VIDEO',
    priority: 2,
  },
  {
    id: 'AT-04',
    audience: 'ATHLETE',
    category: 'onboarding',
    channels: ['PUSH'],
    when: 'Dia 2, se não tem foto',
    trigger: { kind: 'SCHEDULED', code: 'SIGNUP_PLUS', params: { days: 2 } },
    condition: 'hasPhoto == false',
    title: 'Cadê você, {nome}?',
    body: 'Perfil sem foto parece banco de reservas. Coloca uma foto e aparece pro jogo.',
    deepLink: 'ADD_PHOTO',
    priority: 2,
  },
  {
    id: 'AT-05',
    audience: 'ATHLETE',
    category: 'onboarding',
    channels: ['PUSH'],
    when: 'Dia 3, se perfil < 80%',
    trigger: { kind: 'SCHEDULED', code: 'SIGNUP_PLUS', params: { days: 3 } },
    condition: 'profileCompletion < 80',
    title: 'Seu perfil está {perc}% pronto',
    body: 'Completa o que falta e entra no radar dos clubes que buscam {posicao}.',
    deepLink: 'EDIT_PROFILE',
    priority: 2,
  },
  {
    id: 'AT-06',
    audience: 'ATHLETE',
    category: 'onboarding',
    channels: ['IN_APP', 'EMAIL'],
    when: 'Dia 5',
    trigger: { kind: 'SCHEDULED', code: 'SIGNUP_PLUS', params: { days: 5 } },
    title: 'Você não joga sozinho',
    body: 'Conheça a rede de apoio da Empregol: jurídico, nutrição, psicologia, físico e financeiro.',
    deepLink: 'SUPPORT_NETWORK',
    priority: 2,
  },
  {
    id: 'AT-07',
    audience: 'ATHLETE',
    category: 'onboarding',
    channels: ['PUSH', 'IN_APP'],
    when: 'Quando o perfil chega a 100%',
    trigger: { kind: 'EVENT', code: 'PROFILE_100' },
    title: 'Perfil 100%. Agora é com o radar.',
    body: 'Seu perfil está completo e visível para clubes e agentes verificados.',
    deepLink: 'MY_PROFILE',
    priority: 2,
  },

  // ── Gatilhos de atividade (prioridade máxima) ──
  {
    id: 'AT-10',
    audience: 'ATHLETE',
    category: 'activity',
    channels: ['PUSH'],
    when: 'Um clube visualizou o perfil (clube não autorizou mostrar o nome)',
    trigger: { kind: 'EVENT', code: 'CLUB_VIEWED' },
    title: 'Tem clube de olho em você 👀',
    body: 'Um clube da {serie} viu seu perfil hoje. Mantém tudo atualizado.',
    fallbackBody: 'Um clube viu seu perfil hoje. Mantém tudo atualizado.',
    deepLink: 'WHO_VIEWED',
    priority: 1,
  },
  {
    id: 'AT-10b',
    audience: 'ATHLETE',
    category: 'activity',
    channels: ['PUSH'],
    when: 'Um clube visualizou o perfil (clube autorizou mostrar o nome)',
    trigger: { kind: 'EVENT', code: 'CLUB_VIEWED' },
    title: 'O {clube} viu seu perfil 👀',
    body: 'Tem clube de olho em você. Mantém tudo atualizado.',
    deepLink: 'WHO_VIEWED',
    priority: 1,
    requiresClubNameAuth: true,
  },
  {
    id: 'AT-11',
    audience: 'ATHLETE',
    category: 'activity',
    channels: ['PUSH'],
    when: 'Um clube salvou o perfil (clube não autorizou mostrar o nome)',
    trigger: { kind: 'EVENT', code: 'CLUB_SAVED' },
    title: 'Você entrou na lista de um clube',
    body: 'Esse é o momento de caprichar nos detalhes do seu perfil.',
    deepLink: 'MY_PROFILE',
    priority: 1,
  },
  {
    id: 'AT-11b',
    audience: 'ATHLETE',
    category: 'activity',
    channels: ['PUSH'],
    when: 'Um clube salvou o perfil (clube autorizou mostrar o nome)',
    trigger: { kind: 'EVENT', code: 'CLUB_SAVED' },
    title: 'Você entrou na lista do {clube}',
    body: 'Esse é o momento de caprichar nos detalhes do seu perfil.',
    deepLink: 'MY_PROFILE',
    priority: 1,
    requiresClubNameAuth: true,
  },
  {
    id: 'AT-12',
    audience: 'ATHLETE',
    category: 'activity',
    channels: ['PUSH', 'IN_APP'],
    when: 'Mensagem nova de clube ou agente',
    trigger: { kind: 'EVENT', code: 'NEW_MESSAGE' },
    title: '{remetente} mandou mensagem',
    body: 'Responde rápido: quem responde primeiro sai na frente.',
    deepLink: 'CONVERSATION',
    priority: 1,
  },
  {
    id: 'AT-13',
    audience: 'ATHLETE',
    category: 'activity',
    channels: ['PUSH'],
    when: 'Nova vaga compatível com a posição',
    trigger: { kind: 'EVENT', code: 'NEW_VACANCY_MATCH' },
    title: 'Vaga nova pra {posicao}',
    body: '{clube} está buscando {posicao} em {cidade}. Veja se é pra você.',
    deepLink: 'VACANCY',
    priority: 1,
  },
  {
    id: 'AT-14',
    audience: 'ATHLETE',
    category: 'activity',
    channels: ['PUSH'],
    when: 'Peneira ou avaliação na região',
    trigger: { kind: 'EVENT', code: 'TRYOUT_NEARBY' },
    title: 'Peneira perto de você',
    body: 'Tem avaliação em {cidade} no dia {data}. Bora?',
    deepLink: 'OPPORTUNITY',
    priority: 1,
  },
  {
    id: 'AT-15',
    audience: 'ATHLETE',
    category: 'activity',
    channels: ['PUSH', 'EMAIL'],
    when: 'Toda segunda-feira, 12 h',
    trigger: { kind: 'SCHEDULED', code: 'WEEKLY', params: { weekday: 1, hour: 12 } },
    title: 'Sua semana no radar',
    body: '{n_visualizacoes} visualizações e {n_vagas} vagas novas para {posicao}. Confere.',
    deepLink: 'WEEKLY_SUMMARY',
    priority: 3,
  },
  {
    id: 'AT-16',
    audience: 'ATHLETE',
    category: 'activity',
    channels: ['PUSH'],
    when: '7 dias sem editar o perfil',
    trigger: { kind: 'INACTIVITY', code: 'NO_PROFILE_EDIT', params: { days: 7 } },
    title: 'Atualiza teu jogo',
    body: 'Treinou, jogou, evoluiu? Atualize seus números e mostre que continua em movimento.',
    deepLink: 'EDIT_PROFILE',
    priority: 3,
  },

  // ── Sequência semanal (estilo Duolingo) ──
  {
    id: 'AT-17',
    audience: 'ATHLETE',
    category: 'streak',
    channels: ['IN_APP'],
    when: 'Ao completar mais uma semana seguida',
    trigger: { kind: 'EVENT', code: 'STREAK_WEEK' },
    title: '{n} semanas seguidas em campo 🔥',
    body: 'Você apareceu todas as semanas. Não quebra a sequência!',
    deepLink: 'HOME',
    priority: 3,
  },
  {
    id: 'AT-18',
    audience: 'ATHLETE',
    category: 'streak',
    channels: ['PUSH'],
    when: 'Domingo 18 h, se ainda não abriu o app na semana',
    trigger: { kind: 'SCHEDULED', code: 'WEEKLY', params: { weekday: 0, hour: 18 } },
    condition: 'openedThisWeek == false',
    title: 'Sua sequência acaba hoje',
    body: 'Abre o app e mantém suas {n} semanas em campo.',
    deepLink: 'HOME',
    priority: 3,
  },
  {
    id: 'AT-19',
    audience: 'ATHLETE',
    category: 'streak',
    channels: ['IN_APP'],
    when: 'Quando a sequência é perdida',
    trigger: { kind: 'EVENT', code: 'STREAK_LOST' },
    title: 'Sequência zerada. Bola pra frente.',
    body: 'Todo craque já ficou no banco. Começa uma nova sequência hoje.',
    deepLink: 'HOME',
    priority: 3,
  },

  // ── Conteúdo de carreira (quinzenal, alternando) ──
  {
    id: 'AT-20',
    audience: 'ATHLETE',
    category: 'content',
    channels: ['PUSH'],
    when: 'Quinzenal, quinta-feira 19 h',
    trigger: { kind: 'SCHEDULED', code: 'BIWEEKLY', params: { weekday: 4, hour: 19 } },
    rotatesWith: ['AT-20', 'AT-21', 'AT-22', 'AT-23'],
    title: 'Como se apresentar para um clube',
    body: '3 coisas que o clube olha primeiro no seu perfil. Leitura de 1 minuto.',
    deepLink: 'CONTENT',
    priority: 5,
  },
  {
    id: 'AT-21',
    audience: 'ATHLETE',
    category: 'content',
    channels: ['PUSH'],
    when: 'Quinzenal, alternando',
    trigger: { kind: 'SCHEDULED', code: 'BIWEEKLY', params: { weekday: 4, hour: 19 } },
    rotatesWith: ['AT-20', 'AT-21', 'AT-22', 'AT-23'],
    title: 'Antes de assinar, lê isso',
    body: 'Os cuidados que todo atleta deve ter antes de assinar um contrato.',
    deepLink: 'CONTENT',
    priority: 5,
  },
  {
    id: 'AT-22',
    audience: 'ATHLETE',
    category: 'content',
    channels: ['PUSH'],
    when: 'Quinzenal, alternando',
    trigger: { kind: 'SCHEDULED', code: 'BIWEEKLY', params: { weekday: 4, hour: 19 } },
    rotatesWith: ['AT-20', 'AT-21', 'AT-22', 'AT-23'],
    title: 'Sem clube não é sem treino',
    body: 'Como manter a forma durante uma transição de carreira.',
    deepLink: 'CONTENT',
    priority: 5,
  },
  {
    id: 'AT-23',
    audience: 'ATHLETE',
    category: 'content',
    channels: ['PUSH'],
    when: 'Quinzenal, alternando',
    trigger: { kind: 'SCHEDULED', code: 'BIWEEKLY', params: { weekday: 4, hour: 19 } },
    rotatesWith: ['AT-20', 'AT-21', 'AT-22', 'AT-23'],
    title: 'Cabeça também treina',
    body: 'Ficar sem clube pesa. Conheça o apoio psicológico da rede Empregol.',
    deepLink: 'SUPPORT_NETWORK',
    priority: 5,
  },

  // ── Reativação ──
  {
    id: 'AT-30',
    audience: 'ATHLETE',
    category: 'reactivation',
    channels: ['PUSH'],
    when: '3 dias sem abrir o app',
    trigger: { kind: 'INACTIVITY', code: 'INACTIVE', params: { days: 3 } },
    title: 'O radar sentiu sua falta',
    body: 'Clubes estão buscando {posicao} agora. Dá uma passada.',
    deepLink: 'HOME',
    priority: 6,
  },
  {
    id: 'AT-31',
    audience: 'ATHLETE',
    category: 'reactivation',
    channels: ['PUSH'],
    when: '7 dias sem abrir',
    trigger: { kind: 'INACTIVITY', code: 'INACTIVE', params: { days: 7 } },
    title: 'Uma semana fora de campo',
    body: 'Clube gosta de perfil ativo. Volta pro jogo, {nome}.',
    deepLink: 'HOME',
    priority: 6,
  },
  {
    id: 'AT-32',
    audience: 'ATHLETE',
    category: 'reactivation',
    channels: ['PUSH'],
    when: '14 dias sem abrir',
    trigger: { kind: 'INACTIVITY', code: 'INACTIVE', params: { days: 14 } },
    title: 'Tá no banco, {nome}?',
    body: 'A bola não para. Seu perfil também não deveria.',
    deepLink: 'HOME',
    priority: 6,
  },
  {
    id: 'AT-33',
    audience: 'ATHLETE',
    category: 'reactivation',
    channels: ['PUSH', 'EMAIL'],
    when: '30 dias sem abrir',
    trigger: { kind: 'INACTIVITY', code: 'INACTIVE', params: { days: 30 } },
    title: 'Faz um mês que você sumiu',
    body: 'Nesse tempo, {n_buscas} buscas por {posicao} foram feitas. Não fica de fora.',
    deepLink: 'HOME',
    priority: 6,
  },
  {
    id: 'AT-34',
    audience: 'ATHLETE',
    category: 'reactivation',
    channels: ['PUSH', 'EMAIL'],
    when: '60 dias sem abrir',
    trigger: { kind: 'INACTIVITY', code: 'INACTIVE', params: { days: 60 } },
    title: 'Contrato pode acabar. Carreira, não.',
    body: 'Todo grande jogador já passou por uma fase difícil. O radar continua ligado pra você.',
    deepLink: 'HOME',
    priority: 6,
  },
  {
    id: 'AT-35',
    audience: 'ATHLETE',
    category: 'reactivation',
    channels: ['PUSH'],
    when: 'A cada 30 dias depois dos 60 (alternar os textos)',
    trigger: { kind: 'SEQUENCE', code: 'INACTIVE_MONTHLY_AFTER_60', params: { everyDays: 30 } },
    rotatesWith: ['AT-35', 'AT-35b', 'AT-35c'],
    title: 'Seu próximo capítulo ainda não foi escrito',
    body: 'Atualize seu perfil e deixe os clubes te encontrarem. A gente tá junto.',
    deepLink: 'EDIT_PROFILE',
    priority: 6,
  },
  {
    id: 'AT-35b',
    audience: 'ATHLETE',
    category: 'reactivation',
    channels: ['PUSH'],
    when: 'Alternativa da AT-35',
    trigger: { kind: 'SEQUENCE', code: 'INACTIVE_MONTHLY_AFTER_60', params: { everyDays: 30 } },
    rotatesWith: ['AT-35', 'AT-35b', 'AT-35c'],
    title: 'Talento não tem prazo de validade',
    body: 'Tem clube procurando {posicao}. Volta pro app e mostra teu futebol.',
    deepLink: 'HOME',
    priority: 6,
  },
  {
    id: 'AT-35c',
    audience: 'ATHLETE',
    category: 'reactivation',
    channels: ['PUSH'],
    when: 'Alternativa da AT-35',
    trigger: { kind: 'SEQUENCE', code: 'INACTIVE_MONTHLY_AFTER_60', params: { everyDays: 30 } },
    rotatesWith: ['AT-35', 'AT-35b', 'AT-35c'],
    title: 'A bola ainda vai rolar pra você',
    body: 'Um perfil atualizado é o primeiro passo. Não para agora, {nome}.',
    deepLink: 'EDIT_PROFILE',
    priority: 6,
  },

  // ── Marcos e celebrações ──
  {
    id: 'AT-40',
    audience: 'ATHLETE',
    category: 'milestone',
    channels: ['PUSH', 'IN_APP'],
    when: 'Primeira visualização de um clube',
    trigger: { kind: 'EVENT', code: 'FIRST_VIEW' },
    title: 'Primeiro olheiro na área!',
    body: 'Um clube viu seu perfil pela primeira vez. É só o começo.',
    deepLink: 'WHO_VIEWED',
    priority: 1,
  },
  {
    id: 'AT-41',
    audience: 'ATHLETE',
    category: 'milestone',
    channels: ['IN_APP'],
    when: '10, 50 e 100 visualizações',
    trigger: { kind: 'EVENT', code: 'VIEWS_MILESTONE', params: { at: [10, 50, 100] } },
    title: '{n} clubes já te viram',
    body: 'Seu futebol está circulando. Compartilhe essa conquista.',
    deepLink: 'SHARE',
    priority: 1,
  },
  {
    id: 'AT-42',
    audience: 'ATHLETE',
    category: 'milestone',
    channels: ['PUSH'],
    when: 'Aniversário do atleta',
    trigger: { kind: 'CALENDAR', code: 'BIRTHDAY' },
    title: 'Parabéns, {nome}! 🎂',
    body: 'Que esse novo ano venha com gol, contrato e muita saúde. O time Empregol torce por você.',
    deepLink: 'HOME',
    priority: 1,
  },
  {
    id: 'AT-43',
    audience: 'ATHLETE',
    category: 'milestone',
    channels: ['PUSH', 'IN_APP'],
    when: '1 ano de cadastro',
    trigger: { kind: 'CALENDAR', code: 'SIGNUP_ANNIVERSARY' },
    title: '1 ano de Empregol',
    body: 'Obrigado por jogar com a gente. Bora pra mais uma temporada?',
    deepLink: 'MY_PROFILE',
    priority: 1,
  },
  {
    id: 'AT-44',
    audience: 'ATHLETE',
    category: 'milestone',
    channels: ['PUSH', 'IN_APP'],
    when: 'Atleta marcado como contratado',
    trigger: { kind: 'EVENT', code: 'HIRED' },
    title: 'Contrato assinado! 🏆',
    body: 'Parabéns, {nome}. E a gente continua junto: a rede de apoio segue com você.',
    deepLink: 'SHARE',
    priority: 1,
  },
  {
    id: 'AT-45',
    audience: 'ATHLETE',
    category: 'milestone',
    channels: ['PUSH'],
    when: '30 dias após a contratação',
    trigger: { kind: 'SCHEDULED', code: 'HIRED_PLUS', params: { days: 30 } },
    title: 'Como tá a adaptação no {clube}?',
    body: 'Conte pra gente e lembre: jurídico, nutrição e psicologia seguem à disposição.',
    deepLink: 'SUPPORT_NETWORK',
    priority: 1,
  },

  // ── Datas do calendário do futebol ──
  {
    id: 'AT-50',
    audience: 'ATHLETE',
    category: 'calendar',
    channels: ['PUSH', 'EMAIL'],
    when: 'Abertura da janela de transferências',
    trigger: { kind: 'CALENDAR', code: 'TRANSFER_WINDOW_OPEN' },
    title: 'A janela abriu',
    body: 'Clubes estão montando elenco agora. Seu perfil está em dia?',
    deepLink: 'EDIT_PROFILE',
    priority: 4,
  },
  {
    id: 'AT-51',
    audience: 'ATHLETE',
    category: 'calendar',
    channels: ['PUSH'],
    when: 'Fim de temporada / fim dos estaduais',
    trigger: { kind: 'CALENDAR', code: 'SEASON_END' },
    title: 'Temporada acabou. E agora?',
    body: 'É hora dos clubes planejarem o próximo ano. Deixe seu perfil pronto.',
    deepLink: 'EDIT_PROFILE',
    priority: 4,
  },
  {
    id: 'AT-52',
    audience: 'ATHLETE',
    category: 'calendar',
    channels: ['PUSH'],
    when: 'Uma semana antes do início das competições',
    trigger: { kind: 'CALENDAR', code: 'COMPETITION_START', params: { daysBefore: 7 } },
    title: 'A bola vai rolar',
    body: 'Ainda dá tempo de ser contratado. Atualize vídeos e números.',
    deepLink: 'EDIT_PROFILE',
    priority: 4,
  },
];

/* ───────────────────────── PARTE 2 · CLUBE (22) ───────────────────────── */

const CLUB: EngagementMessage[] = [
  // ── Boas-vindas e primeiros passos ──
  {
    id: 'CL-01',
    audience: 'CLUB',
    category: 'onboarding',
    channels: ['PUSH', 'EMAIL'],
    when: 'Logo após concluir o cadastro',
    trigger: { kind: 'EVENT', code: 'SIGNUP' },
    title: 'Bem-vindo à Empregol, {clube}',
    body: 'Atletas de todo o Brasil estão a uma busca de distância. Vamos montar seu elenco?',
    deepLink: 'HOME',
    priority: 2,
  },
  {
    id: 'CL-02',
    audience: 'CLUB',
    category: 'onboarding',
    channels: ['PUSH'],
    when: '1 h após o cadastro, se perfil do clube incompleto',
    trigger: { kind: 'SCHEDULED', code: 'SIGNUP_PLUS', params: { hours: 1 } },
    condition: 'clubProfileComplete == false',
    title: 'Complete o perfil do clube',
    body: 'Escudo, série e cidade passam confiança aos atletas e agilizam as respostas.',
    deepLink: 'CLUB_PROFILE',
    priority: 2,
  },
  {
    id: 'CL-03',
    audience: 'CLUB',
    category: 'onboarding',
    channels: ['PUSH'],
    when: 'Dia 1, se ainda não fez nenhuma busca',
    trigger: { kind: 'SCHEDULED', code: 'SIGNUP_PLUS', params: { days: 1 } },
    condition: 'searchCount == 0',
    title: 'Faça sua primeira busca',
    body: 'Filtre por posição, idade e região e veja quem está disponível agora.',
    deepLink: 'SEARCH_ATHLETES',
    priority: 2,
  },
  {
    id: 'CL-04',
    audience: 'CLUB',
    category: 'onboarding',
    channels: ['PUSH'],
    when: 'Dia 2, se não salvou nenhum filtro',
    trigger: { kind: 'SCHEDULED', code: 'SIGNUP_PLUS', params: { days: 2 } },
    condition: 'savedFilters == 0',
    title: 'Salve sua busca',
    body: 'A gente avisa quando aparecer atleta com o perfil que você procura.',
    deepLink: 'SEARCH_ATHLETES',
    priority: 2,
  },
  {
    id: 'CL-05',
    audience: 'CLUB',
    category: 'onboarding',
    channels: ['PUSH', 'EMAIL'],
    when: 'Dia 3, se não publicou vaga',
    trigger: { kind: 'SCHEDULED', code: 'SIGNUP_PLUS', params: { days: 3 } },
    condition: 'vacancyCount == 0',
    title: 'Publique uma vaga',
    body: 'Diga o que procura e deixe os atletas certos chegarem até você.',
    deepLink: 'NEW_VACANCY',
    priority: 2,
  },
  {
    id: 'CL-06',
    audience: 'CLUB',
    category: 'onboarding',
    channels: ['IN_APP'],
    when: 'Dia 5',
    trigger: { kind: 'SCHEDULED', code: 'SIGNUP_PLUS', params: { days: 5 } },
    title: 'Sem comissão na contratação',
    body: 'Na Empregol, o clube encontra e contrata sem pagar comissão sobre o contrato.',
    deepLink: 'HOW_IT_WORKS',
    priority: 2,
  },

  // ── Gatilhos de atividade ──
  {
    id: 'CL-10',
    audience: 'CLUB',
    category: 'activity',
    channels: ['PUSH'],
    when: 'Novos atletas compatíveis com um filtro salvo',
    trigger: { kind: 'EVENT', code: 'NEW_ATHLETES_MATCH_FILTER' },
    title: '{n} atletas novos para {posicao}',
    body: 'Chegaram atletas que batem com seus filtros. Veja antes da concorrência.',
    deepLink: 'FILTER_RESULTS',
    priority: 1,
  },
  {
    id: 'CL-11',
    audience: 'CLUB',
    category: 'activity',
    channels: ['PUSH', 'IN_APP'],
    when: 'Atleta respondeu uma mensagem',
    trigger: { kind: 'EVENT', code: 'ATHLETE_REPLIED' },
    title: '{atleta} respondeu',
    body: 'Continue a conversa enquanto o interesse está quente.',
    deepLink: 'CONVERSATION',
    priority: 1,
  },
  {
    id: 'CL-12',
    audience: 'CLUB',
    category: 'activity',
    channels: ['PUSH'],
    when: 'Atleta de uma lista salva atualizou o perfil',
    trigger: { kind: 'EVENT', code: 'SAVED_ATHLETE_UPDATED' },
    title: '{atleta} subiu vídeo novo',
    body: 'Um atleta da sua lista atualizou o perfil. Vale a olhada.',
    deepLink: 'ATHLETE_PROFILE',
    priority: 1,
  },
  {
    id: 'CL-13',
    audience: 'CLUB',
    category: 'activity',
    channels: ['PUSH'],
    when: 'Vaga publicada recebeu interessados',
    trigger: { kind: 'EVENT', code: 'VACANCY_INTERESTED' },
    title: '{n} atletas querem a sua vaga',
    body: 'Tem atleta interessado na vaga de {posicao}. Confira os perfis.',
    deepLink: 'INTERESTED',
    priority: 1,
  },
  {
    id: 'CL-14',
    audience: 'CLUB',
    category: 'activity',
    channels: ['EMAIL', 'IN_APP'],
    when: 'Toda segunda-feira, 9 h',
    trigger: { kind: 'SCHEDULED', code: 'WEEKLY', params: { weekday: 1, hour: 9 } },
    title: 'Seu radar da semana',
    body: '{n_novos} atletas novos na sua região e {n_interessados} interessados nas suas vagas.',
    deepLink: 'WEEKLY_SUMMARY',
    priority: 3,
  },
  {
    id: 'CL-15',
    audience: 'CLUB',
    category: 'activity',
    channels: ['PUSH'],
    when: 'Vaga aberta há 14 dias sem nenhuma ação',
    trigger: { kind: 'SCHEDULED', code: 'VACANCY_STALE', params: { days: 14 } },
    title: 'Sua vaga está parada',
    body: 'Revise os interessados ou ajuste o que procura para receber novos perfis.',
    deepLink: 'VACANCY',
    priority: 3,
  },

  // ── Calendário do futebol ──
  {
    id: 'CL-20',
    audience: 'CLUB',
    category: 'calendar',
    channels: ['PUSH', 'EMAIL'],
    when: '30 dias antes da janela de transferências',
    trigger: { kind: 'CALENDAR', code: 'TRANSFER_WINDOW', params: { daysBefore: 30 } },
    title: 'Faltam 30 dias para a janela',
    body: 'Comece a mapear atletas agora e feche o elenco sem correria.',
    deepLink: 'SEARCH_ATHLETES',
    priority: 4,
  },
  {
    id: 'CL-21',
    audience: 'CLUB',
    category: 'calendar',
    channels: ['PUSH'],
    when: '7 dias antes da janela',
    trigger: { kind: 'CALENDAR', code: 'TRANSFER_WINDOW', params: { daysBefore: 7 } },
    title: 'A janela abre em 7 dias',
    body: 'Sua lista está pronta? Revise os atletas salvos.',
    deepLink: 'SAVED_LISTS',
    priority: 4,
  },
  {
    id: 'CL-22',
    audience: 'CLUB',
    category: 'calendar',
    channels: ['EMAIL'],
    when: 'Fim da temporada',
    trigger: { kind: 'CALENDAR', code: 'SEASON_END' },
    title: 'Planejamento da próxima temporada',
    body: 'Veja atletas com contrato encerrado e monte o elenco do próximo ano.',
    deepLink: 'SEARCH_ATHLETES',
    priority: 4,
  },

  // ── Reativação ──
  {
    id: 'CL-30',
    audience: 'CLUB',
    category: 'reactivation',
    channels: ['PUSH'],
    when: '7 dias sem acessar',
    trigger: { kind: 'INACTIVITY', code: 'INACTIVE', params: { days: 7 } },
    title: '{n_novos} atletas novos desde a sua última visita',
    body: 'Tem {posicao} disponível na sua região. Dá uma olhada.',
    deepLink: 'SEARCH_ATHLETES',
    priority: 6,
  },
  {
    id: 'CL-31',
    audience: 'CLUB',
    category: 'reactivation',
    channels: ['PUSH', 'EMAIL'],
    when: '14 dias sem acessar',
    trigger: { kind: 'INACTIVITY', code: 'INACTIVE', params: { days: 14 } },
    title: 'Seu próximo reforço pode estar aqui',
    body: 'Novos atletas entram toda semana. Não deixe a concorrência chegar antes.',
    deepLink: 'SEARCH_ATHLETES',
    priority: 6,
  },
  {
    id: 'CL-32',
    audience: 'CLUB',
    category: 'reactivation',
    channels: ['EMAIL'],
    when: '30 dias sem acessar',
    trigger: { kind: 'INACTIVITY', code: 'INACTIVE', params: { days: 30 } },
    title: 'O mercado não parou',
    body: 'Neste mês, {n_novos} atletas se cadastraram. Seus filtros continuam salvos.',
    deepLink: 'FILTER_RESULTS',
    priority: 6,
  },
  {
    id: 'CL-33',
    audience: 'CLUB',
    category: 'reactivation',
    channels: ['EMAIL'],
    when: '60 dias sem acessar (última)',
    trigger: { kind: 'INACTIVITY', code: 'INACTIVE', params: { days: 60 } },
    title: 'Seu radar continua ligado',
    body: 'Quando precisar de reforço, é só voltar. Seus filtros e listas estão guardados.',
    deepLink: 'HOME',
    priority: 6,
  },

  // ── Marcos ──
  {
    id: 'CL-40',
    audience: 'CLUB',
    category: 'milestone',
    channels: ['IN_APP'],
    when: 'Primeiro contato enviado a um atleta',
    trigger: { kind: 'EVENT', code: 'FIRST_CONTACT_SENT' },
    title: 'Primeiro contato feito!',
    body: 'Boa. Acompanhe a resposta pela aba de conversas.',
    deepLink: 'CONVERSATIONS',
    priority: 1,
  },
  {
    id: 'CL-41',
    audience: 'CLUB',
    category: 'milestone',
    channels: ['PUSH', 'IN_APP'],
    when: 'Clube marca um atleta como contratado',
    trigger: { kind: 'EVENT', code: 'MARKED_HIRED' },
    title: 'Negócio fechado! 🤝',
    body: 'Parabéns pela contratação. Conte como foi e ajude outros clubes.',
    deepLink: 'RATE_HIRING',
    priority: 1,
  },
  {
    id: 'CL-42',
    audience: 'CLUB',
    category: 'milestone',
    channels: ['EMAIL'],
    when: '30 dias após a contratação',
    trigger: { kind: 'SCHEDULED', code: 'HIRING_PLUS', params: { days: 30 } },
    title: 'Como está o {atleta}?',
    body: 'Sua avaliação ajuda o atleta e fortalece a comunidade Empregol.',
    deepLink: 'RATE_HIRING',
    priority: 1,
  },
];

export const MESSAGE_BANK: EngagementMessage[] = [...ATHLETE, ...CLUB];

export const MESSAGE_BY_ID: Record<string, EngagementMessage> = Object.fromEntries(
  MESSAGE_BANK.map((m) => [m.id, m]),
);

/* ───────────────────────── Regras de envio ───────────────────────── */

export const ENGAGEMENT_RULES = {
  limits: {
    pushPerDay: 1,
    pushPerWeek: 4,
    emailPerWeek: 2,
  },
  /** Menor número = maior prioridade quando cai mais de uma no mesmo dia. */
  priorityOrder: ['activity', 'onboarding', 'streak', 'calendar', 'content', 'reactivation'],
  quietHours: { startHour: 22, endHour: 8, tz: 'America/Sao_Paulo' },
  sendWindows: {
    ATHLETE: { weekdays: [[11, 13], [18, 21]], weekendAllDay: true },
    CLUB: { weekdays: [[9, 11], [14, 17]], weekendAllDay: false },
  },
  reactivation: {
    // A sequência para quando o usuário volta e recomeça do zero se sumir de novo.
    resetsOnReturn: true,
    // Atleta: após 60d, 1 incentivo/mês (AT-35 alternando) até voltar/optar por sair.
    athleteMonthlyAfter60: true,
    // Clube: após 60d (CL-33), não enviar mais nada.
    clubStopAfter60: true,
  },
} as const;

/* ───────────────────────── Variáveis ───────────────────────── */

export const VARIABLE_FALLBACKS: Record<string, string | null> = {
  nome: 'craque',
  posicao: 'a sua posição',
  cidade: '', // omitir o trecho
  data: '', // omitir o trecho
  clube: 'um clube',
  serie: 'um clube', // "um clube" (sem a série)
  atleta: 'um atleta',
  remetente: 'um clube',
  perc: '', // sempre presente
  n: null, // não enviar se 0
  n_visualizacoes: null,
  n_vagas: null,
  n_buscas: null,
  n_novos: null,
  n_interessados: null,
};
