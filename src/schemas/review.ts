import { z } from "zod";

export const reviewContentSchema = z.object({
  subjectId: z.string().min(1, "Selecione a disciplina"),
  title: z.string().min(2, "Informe o título"),
  content: z.string().min(1, "Adicione o conteúdo"),
  reviewed: z.boolean().optional(),
});

export const flashcardSchema = z.object({
  subjectId: z.string().min(1, "Selecione a disciplina"),
  question: z.string().min(2, "Informe a pergunta"),
  answer: z.string().min(1, "Informe a resposta"),
  category: z.string().optional(),
});

export type ReviewContentInput = z.infer<typeof reviewContentSchema>;
export type FlashcardInput = z.infer<typeof flashcardSchema>;
