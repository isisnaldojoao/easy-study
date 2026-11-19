import { nowISO } from "@/lib/dates";
import { deleteOwned, getOwned, insertRow, listByUser, updateRow } from "@/lib/supabase-db";
import type { FlashcardInput, ReviewContentInput } from "@/schemas/review";
import type { Flashcard, ReviewContent } from "@/types";

export async function listReviewContents(userId: string, subjectId?: string) {
  let items = await listByUser<ReviewContent>("review_contents", userId);
  if (subjectId) items = items.filter((item) => item.subjectId === subjectId);
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createReviewContent(userId: string, input: ReviewContentInput) {
  return insertRow<ReviewContent>("review_contents", {
    id: crypto.randomUUID(),
    userId,
    subjectId: input.subjectId,
    title: input.title.trim(),
    content: input.content,
    reviewed: input.reviewed ?? false,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  });
}

export async function updateReviewContent(id: string, userId: string, input: ReviewContentInput) {
  const existing = await getOwned<ReviewContent>("review_contents", id, userId);
  if (!existing) throw new Error("Conteúdo não encontrado.");
  return updateRow<ReviewContent>("review_contents", id, userId, {
    subjectId: input.subjectId,
    title: input.title.trim(),
    content: input.content,
    reviewed: input.reviewed ?? false,
    updatedAt: nowISO(),
  });
}

export async function deleteReviewContent(id: string, userId: string) {
  const existing = await getOwned<ReviewContent>("review_contents", id, userId);
  if (!existing) throw new Error("Conteúdo não encontrado.");
  await deleteOwned("review_contents", id, userId);
}

export async function listFlashcards(userId: string, subjectId?: string) {
  let items = await listByUser<Flashcard>("flashcards", userId);
  if (subjectId) items = items.filter((item) => item.subjectId === subjectId);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createFlashcard(userId: string, input: FlashcardInput) {
  return insertRow<Flashcard>("flashcards", {
    id: crypto.randomUUID(),
    userId,
    subjectId: input.subjectId,
    question: input.question.trim(),
    answer: input.answer.trim(),
    category: input.category?.trim() || "Geral",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  });
}

export async function updateFlashcard(id: string, userId: string, input: FlashcardInput) {
  const existing = await getOwned<Flashcard>("flashcards", id, userId);
  if (!existing) throw new Error("Flashcard não encontrado.");
  return updateRow<Flashcard>("flashcards", id, userId, {
    subjectId: input.subjectId,
    question: input.question.trim(),
    answer: input.answer.trim(),
    category: input.category?.trim() || "Geral",
    updatedAt: nowISO(),
  });
}

export async function deleteFlashcard(id: string, userId: string) {
  const existing = await getOwned<Flashcard>("flashcards", id, userId);
  if (!existing) throw new Error("Flashcard não encontrado.");
  await deleteOwned("flashcards", id, userId);
}
