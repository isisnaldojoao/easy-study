import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { nowISO } from "@/lib/dates";
import type { FlashcardInput, ReviewContentInput } from "@/schemas/review";
import type { Flashcard, ReviewContent } from "@/types";

export async function listReviewContents(userId: string, subjectId?: string) {
  let items = await db.reviewContents.where("userId").equals(userId).toArray();
  if (subjectId) items = items.filter((i) => i.subjectId === subjectId);
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createReviewContent(
  userId: string,
  input: ReviewContentInput
) {
  const item: ReviewContent = {
    id: nanoid(),
    userId,
    subjectId: input.subjectId,
    title: input.title.trim(),
    content: input.content,
    reviewed: input.reviewed ?? false,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await db.reviewContents.add(item);
  return item;
}

export async function updateReviewContent(
  id: string,
  userId: string,
  input: ReviewContentInput
) {
  const existing = await db.reviewContents.get(id);
  if (!existing || existing.userId !== userId) {
    throw new Error("Conteúdo não encontrado.");
  }
  await db.reviewContents.update(id, {
    subjectId: input.subjectId,
    title: input.title.trim(),
    content: input.content,
    reviewed: input.reviewed ?? false,
    updatedAt: nowISO(),
  });
  return db.reviewContents.get(id);
}

export async function deleteReviewContent(id: string, userId: string) {
  const existing = await db.reviewContents.get(id);
  if (!existing || existing.userId !== userId) {
    throw new Error("Conteúdo não encontrado.");
  }
  await db.reviewContents.delete(id);
}

export async function listFlashcards(userId: string, subjectId?: string) {
  let items = await db.flashcards.where("userId").equals(userId).toArray();
  if (subjectId) items = items.filter((i) => i.subjectId === subjectId);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createFlashcard(userId: string, input: FlashcardInput) {
  const card: Flashcard = {
    id: nanoid(),
    userId,
    subjectId: input.subjectId,
    question: input.question.trim(),
    answer: input.answer.trim(),
    category: input.category?.trim() || "Geral",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await db.flashcards.add(card);
  return card;
}

export async function updateFlashcard(
  id: string,
  userId: string,
  input: FlashcardInput
) {
  const existing = await db.flashcards.get(id);
  if (!existing || existing.userId !== userId) {
    throw new Error("Flashcard não encontrado.");
  }
  await db.flashcards.update(id, {
    subjectId: input.subjectId,
    question: input.question.trim(),
    answer: input.answer.trim(),
    category: input.category?.trim() || "Geral",
    updatedAt: nowISO(),
  });
  return db.flashcards.get(id);
}

export async function deleteFlashcard(id: string, userId: string) {
  const existing = await db.flashcards.get(id);
  if (!existing || existing.userId !== userId) {
    throw new Error("Flashcard não encontrado.");
  }
  await db.flashcards.delete(id);
}
