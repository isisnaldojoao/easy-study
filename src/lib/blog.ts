export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  published: string;
  dateLabel: string;
  minutes: number;
  blocks: BlogBlock[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "como-o-study-flow-funciona",
    title: "Como o Study Flow funciona",
    description:
      "O mapa do semestre: conta, disciplinas, prazos, sessões, revisão e o que aparece quando você abre o início.",
    published: "2026-11-17",
    dateLabel: "17 de novembro de 2026",
    minutes: 6,
    blocks: [
      {
        type: "p",
        text: "O Study Flow guarda a rotina acadêmica num painel só. Você cria a conta, cadastra as disciplinas e passa a ver o que vence, o que estudar e o que já foi feito.",
      },
      {
        type: "p",
        text: "A conta fica no Supabase. Disciplinas, prazos, sessões, revisões e arquivos acompanham o login. No celular ou no computador, é o mesmo semestre.",
      },
      {
        type: "h2",
        text: "A ordem que faz sentido",
      },
      {
        type: "ul",
        items: [
          "Cria a conta com nome, e-mail e senha.",
          "Cadastra cada disciplina, com uma cor para reconhecer na hora.",
          "Lança provas, trabalhos, leituras e o que mais tiver data.",
          "Marca sessões de estudo com horário de início e fim.",
          "Guarda a revisão e os arquivos na mesma matéria.",
          "Abre o início no dia e estuda o que está na frente.",
        ],
      },
      {
        type: "h2",
        text: "O que cada parte faz",
      },
      {
        type: "p",
        text: "O início mostra o que é hoje, o que ainda está pendente e as provas e trabalhos dos próximos 14 dias. O calendário junta atividades e sessões na grade de dia, semana ou mês. O planejamento é a lista desses compromissos, com horas planejadas e horas já feitas.",
      },
      {
        type: "p",
        text: "A central de revisão guarda texto e flashcards ligados à disciplina. Materiais são os arquivos da matéria. Relatórios mostram se a semana rendeu: conclusão, horas e um gráfico da evolução. Configurações cuidam do nome, da senha, do tema e dos lembretes.",
      },
      {
        type: "h2",
        text: "O que acontece quando você conclui",
      },
      {
        type: "p",
        text: "Atividade e sessão têm status. Enquanto estão pendentes, entram na conta do que falta. Quando você marca como concluído, saem dessa conta e passam a contar no que já foi feito. O relatório usa exatamente esses números, sem planilha no meio.",
      },
      {
        type: "p",
        text: "Os textos seguintes entram em cada peça: prazos, calendário, revisão, arquivos e o que acontece com os seus dados.",
      },
    ],
  },
  {
    slug: "disciplinas-provas-e-prazos",
    title: "Disciplinas, provas e prazos",
    description:
      "Como a matéria vira o centro de tudo, e como uma prova ganha data, prioridade e lembrete.",
    published: "2026-11-17",
    dateLabel: "17 de novembro de 2026",
    minutes: 5,
    blocks: [
      {
        type: "p",
        text: "Disciplina é o agrupador. Prova, trabalho, sessão, revisão, flashcard e arquivo apontam para uma matéria. Sem disciplina, o resto não tem onde morar.",
      },
      {
        type: "h2",
        text: "O que você cadastra na matéria",
      },
      {
        type: "p",
        text: "Nome, uma descrição curta, uma cor e um espaço de notas. A cor aparece nas listas para você não confundir Cálculo com História. Dentro da disciplina dá para ver o progresso, os próximos compromissos, as atividades e os arquivos daquela matéria.",
      },
      {
        type: "p",
        text: "Apagar a disciplina apaga junto o que estava nela: atividades, sessões, revisões, flashcards, materiais e os lembretes dessas atividades. Não tem lixeira.",
      },
      {
        type: "h2",
        text: "Atividades",
      },
      {
        type: "p",
        text: "Atividade é qualquer coisa com data. Os tipos são prova, trabalho, atividade, questionário, seminário, leitura, revisão e outro. Cada uma tem título, descrição, disciplina, dia, hora opcional, prioridade e status.",
      },
      {
        type: "ul",
        items: [
          "Prioridade: baixa, média ou alta.",
          "Status: pendente, em andamento, concluído ou atrasado.",
          "Data no formato do dia, no fuso de São Paulo.",
          "Hora opcional, quando o compromisso tem horário.",
        ],
      },
      {
        type: "h2",
        text: "Lembrete da atividade",
      },
      {
        type: "p",
        text: "Cada atividade pode avisar no dia, 1 dia antes, 3, 5 ou 7 dias antes. O aviso entra no sino do painel quando essa data chega. Se as notificações estiverem desligadas em Configurações, o lembrete não é gerado.",
      },
      {
        type: "p",
        text: "Prova e trabalho que ainda não foram concluídos e caem nos próximos 14 dias sobem no início. É dali que sai o “o que estudar hoje”.",
      },
    ],
  },
  {
    slug: "calendario-e-planejamento",
    title: "Calendário e planejamento",
    description:
      "A grade mostra o mês. O planejamento mostra as horas. Os dois leem os mesmos compromissos.",
    published: "2026-11-17",
    dateLabel: "17 de novembro de 2026",
    minutes: 5,
    blocks: [
      {
        type: "p",
        text: "Calendário e planejamento não são duas agendas. Eles mostram as mesmas atividades e as mesmas sessões de estudo, de um jeito diferente.",
      },
      {
        type: "h2",
        text: "Calendário",
      },
      {
        type: "p",
        text: "A grade abre por dia, semana ou mês. Atividade entra no dia marcado. Sessão entra no dia de início. Dá para criar uma atividade dali, desde que já exista pelo menos uma disciplina, e dá para marcar uma atividade como concluída sem sair da grade.",
      },
      {
        type: "h2",
        text: "Sessão de estudo",
      },
      {
        type: "p",
        text: "Sessão é o bloco em que você senta para estudar. Ela tem título, disciplina, conteúdo, dia, hora de início, hora de fim, notas e status: pendente ou concluída. Não é uma prova. É o tempo que você reservou para a matéria.",
      },
      {
        type: "p",
        text: "O planejamento lista essas sessões junto com provas e atividades. No topo aparecem as horas planejadas, as horas concluídas e quantas sessões ainda estão pendentes. A hora conta pelo intervalo entre o início e o fim da sessão.",
      },
      {
        type: "h2",
        text: "O que vai para o início",
      },
      {
        type: "p",
        text: "No dia da sessão, ela aparece no início junto com as atividades daquele dia. Prova e trabalho continuam sendo atividade: o planejamento até avisa que prova vai para o painel. Você marca a sessão como feita quando o bloco acabou, e ela sai da lista do que falta.",
      },
    ],
  },
  {
    slug: "revisao-e-flashcards",
    title: "Revisão e flashcards",
    description:
      "Texto para reler a matéria e cartão para testar se ficou. Os dois ficam na central de revisão.",
    published: "2026-11-17",
    dateLabel: "17 de novembro de 2026",
    minutes: 4,
    blocks: [
      {
        type: "p",
        text: "A central de revisão tem duas abas: conteúdos e flashcards. Os dois se ligam a uma disciplina, então a revisão de Cálculo não se mistura com a de História.",
      },
      {
        type: "h2",
        text: "Conteúdo",
      },
      {
        type: "p",
        text: "Conteúdo é uma anotação com título e texto formatado: parágrafo, lista, tarefa. Dá para marcar como revisado quando você já passou por aquele material. O filtro por disciplina e a busca do topo ajudam quando a lista cresce.",
      },
      {
        type: "h2",
        text: "Flashcard",
      },
      {
        type: "p",
        text: "Flashcard tem pergunta, resposta e uma categoria. Na hora de estudar, o app mostra a pergunta, você revela a resposta e marca se acertou ou errou. No fim da leva, aparece quantas saíram certas e quantas saíram erradas.",
      },
      {
        type: "p",
        text: "O estudo usa os cartões que estão na tela. Se você filtrou uma disciplina, a leva é só dessa matéria. Sem cartão cadastrado, não tem o que virar.",
      },
      {
        type: "h2",
        text: "O que a revisão não faz",
      },
      {
        type: "p",
        text: "Ela não puxa a prova sozinha e não cria um plano de repetição espaçada. O lembrete de data continua na atividade. A revisão é o material que você abre antes dessa data.",
      },
    ],
  },
  {
    slug: "materiais-relatorios-e-lembretes",
    title: "Materiais, relatórios e lembretes",
    description:
      "O arquivo fica na matéria, o gráfico lê o que você marcou, e o sino avisa quando o prazo chega.",
    published: "2026-11-17",
    dateLabel: "17 de novembro de 2026",
    minutes: 5,
    blocks: [
      {
        type: "h2",
        text: "Materiais",
      },
      {
        type: "p",
        text: "Material é um arquivo guardado numa disciplina. Entram PDF, Word, PowerPoint, JPEG, PNG, WEBP, GIF e texto. O arquivo vai para o Storage da sua conta. Dá para abrir, baixar de novo e apagar. Para enviar, escolha a disciplina antes.",
      },
      {
        type: "p",
        text: "O arquivo aparece em outro aparelho quando você entra na mesma conta. Um PDF grande conta no espaço do projeto. Apagar o material tira o arquivo de lá.",
      },
      {
        type: "h2",
        text: "Relatórios",
      },
      {
        type: "p",
        text: "O relatório só desenha gráfico quando já existe disciplina, atividade ou sessão. Sem isso, a tela avisa que ainda não há dados.",
      },
      {
        type: "ul",
        items: [
          "Conclusão: a parte das atividades que já está concluída.",
          "Horas planejadas e horas feitas, a partir das sessões.",
          "Evolução semanal, com horas e atividades concluídas.",
          "Quais disciplinas concentraram mais hora de estudo.",
        ],
      },
      {
        type: "p",
        text: "O número sai do que você cadastrou. Não tem meta inventada nem exportação para planilha.",
      },
      {
        type: "h2",
        text: "Lembretes",
      },
      {
        type: "p",
        text: "O sino lista avisos da sua conta. Eles nascem das atividades: lembrete na data combinada, aviso de compromisso em 3 ou 7 dias, atraso e conclusão. Dá para marcar um como lido ou limpar todos.",
      },
      {
        type: "p",
        text: "Em Configurações você liga ou desliga esses avisos, escolhe o lembrete padrão de uma atividade nova e, se quiser, autoriza a notificação do próprio navegador. Sem essa permissão, o aviso continua só dentro do app.",
      },
    ],
  },
  {
    slug: "onde-seus-dados-ficam",
    title: "Onde os seus dados ficam",
    description:
      "Conta, matéria e arquivo ficam na sua conta. O que isso muda na prática.",
    published: "2026-11-17",
    dateLabel: "17 de novembro de 2026",
    minutes: 5,
    blocks: [
      {
        type: "p",
        text: "A conta do Study Flow fica no Supabase. Disciplinas, prazos, sessões, revisões, flashcards e arquivos acompanham o login. A senha fica no serviço de autenticação, não no texto da anotação. Cada pessoa só lê o que o próprio login criou.",
      },
      {
        type: "h2",
        text: "O que isso permite",
      },
      {
        type: "ul",
        items: [
          "Usar sem mensalidade.",
          "Abrir o mesmo semestre no celular e no computador.",
          "Recuperar a senha por um link no e-mail.",
          "Trocar o tema, o nome e a senha sem falar com suporte.",
        ],
      },
      {
        type: "h2",
        text: "O que isso pede",
      },
      {
        type: "p",
        text: "Entrar e salvar precisa de internet. Limpar o navegador não apaga o semestre, porque ele não mora só nesta aba. Apagar a conta no projeto é o que tira os dados.",
      },
      {
        type: "p",
        text: "O e-mail é único. Duas pessoas usam duas contas, mesmo no mesmo computador. Quem entra com o seu e-mail vê o seu painel.",
      },
      {
        type: "h2",
        text: "Configurações",
      },
      {
        type: "p",
        text: "Em Configurações dá para mudar o nome, trocar a senha informando a atual, escolher tema claro, escuro ou do sistema, definir o lembrete padrão e ligar os avisos. Nome e senha valem em qualquer aparelho em que você entrar.",
      },
      {
        type: "p",
        text: "O arquivo da disciplina fica no Storage, no caminho da sua conta. Abrir ou baixar puxa esse arquivo de novo. Apagar o material remove o arquivo junto.",
      },
    ],
  },
];

export function getPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
