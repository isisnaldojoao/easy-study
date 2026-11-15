import { z } from "zod";

export const activitySchema = z.object({
  subjectId: z.string().min(1, "Selecione a disciplina"),
  title: z.string().min(2, "Informe o título"),
  description: z.string().optional(),
  type: z.enum([
    "prova",
    "trabalho",
    "atividade",
    "questionario",
    "seminario",
    "leitura",
    "revisao",
    "outro",
  ]),
  date: z.string().min(1, "Informe a data"),
  time: z.string().optional(),
  priority: z.enum(["baixa", "media", "alta"]),
  status: z.enum(["pendente", "em_andamento", "concluido", "atrasado"]),
  reminderSettings: z
    .array(
      z.union([
        z.literal(0),
        z.literal(1),
        z.literal(3),
        z.literal(5),
        z.literal(7),
      ])
    )
    .optional(),
});

export type ActivityInput = z.infer<typeof activitySchema>;
