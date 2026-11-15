import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(2, "Informe o nome da disciplina"),
  description: z.string().optional(),
  color: z.string().min(4, "Escolha uma cor"),
  notes: z.string().optional(),
});

export type SubjectInput = z.infer<typeof subjectSchema>;
