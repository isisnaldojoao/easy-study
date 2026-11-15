import { z } from "zod";

export const commitmentKindSchema = z.enum([
  "sessao",
  "prova",
  "trabalho",
  "atividade",
  "questionario",
  "seminario",
  "leitura",
  "revisao",
  "outro",
]);

export const studySessionSchema = z
  .object({
    kind: commitmentKindSchema,
    subjectId: z.string().min(1, "Selecione a disciplina"),
    title: z.string().min(2, "Informe o título"),
    content: z.string(),
    startDate: z.string().min(1, "Informe a data"),
    startTime: z.string().min(1, "Informe o horário inicial"),
    endTime: z.string(),
    notes: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "sessao") {
      if (!data.endTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o horário final",
          path: ["endTime"],
        });
      } else if (data.endTime <= data.startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Horário final deve ser após o inicial",
          path: ["endTime"],
        });
      }
    }
  });

export type StudySessionInput = z.infer<typeof studySessionSchema>;
export type CommitmentKind = z.infer<typeof commitmentKindSchema>;
