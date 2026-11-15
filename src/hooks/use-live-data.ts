"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useAuth } from "@/providers/auth-provider";

export function useSubjects() {
  const { user } = useAuth();
  return useLiveQuery(
    () => (user ? db.subjects.where("userId").equals(user.id).sortBy("name") : []),
    [user?.id],
    []
  );
}

export function useActivities() {
  const { user } = useAuth();
  return useLiveQuery(
    async () => {
      if (!user) return [];
      const items = await db.activities.where("userId").equals(user.id).toArray();
      return items.sort((a, b) =>
        a.date === b.date
          ? (a.time ?? "").localeCompare(b.time ?? "")
          : a.date.localeCompare(b.date)
      );
    },
    [user?.id],
    []
  );
}

export function useStudySessions() {
  const { user } = useAuth();
  return useLiveQuery(
    async () => {
      if (!user) return [];
      const items = await db.studySessions
        .where("userId")
        .equals(user.id)
        .toArray();
      return items.sort((a, b) =>
        a.startDate === b.startDate
          ? a.startTime.localeCompare(b.startTime)
          : a.startDate.localeCompare(b.startDate)
      );
    },
    [user?.id],
    []
  );
}

export function useNotifications() {
  const { user } = useAuth();
  return useLiveQuery(
    async () => {
      if (!user) return [];
      const items = await db.notifications
        .where("userId")
        .equals(user.id)
        .toArray();
      return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    [user?.id],
    []
  );
}

export function useReviewContents(subjectId?: string) {
  const { user } = useAuth();
  return useLiveQuery(
    async () => {
      if (!user) return [];
      let items = await db.reviewContents
        .where("userId")
        .equals(user.id)
        .toArray();
      if (subjectId) items = items.filter((i) => i.subjectId === subjectId);
      return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    [user?.id, subjectId],
    []
  );
}

export function useFlashcards(subjectId?: string) {
  const { user } = useAuth();
  return useLiveQuery(
    async () => {
      if (!user) return [];
      let items = await db.flashcards.where("userId").equals(user.id).toArray();
      if (subjectId) items = items.filter((i) => i.subjectId === subjectId);
      return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    [user?.id, subjectId],
    []
  );
}

export function useMaterials(subjectId?: string) {
  const { user } = useAuth();
  return useLiveQuery(
    async () => {
      if (!user) return [];
      let items = await db.materials.where("userId").equals(user.id).toArray();
      if (subjectId) items = items.filter((i) => i.subjectId === subjectId);
      return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    [user?.id, subjectId],
    []
  );
}
