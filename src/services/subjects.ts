import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { nowISO } from "@/lib/dates";
import type { SubjectInput } from "@/schemas/subject";
import type { Subject } from "@/types";

export async function listSubjects(userId: string) {
  return db.subjects.where("userId").equals(userId).sortBy("name");
}

export async function getSubject(id: string, userId: string) {
  const subject = await db.subjects.get(id);
  if (!subject || subject.userId !== userId) return null;
  return subject;
}

export async function createSubject(userId: string, input: SubjectInput) {
  const subject: Subject = {
    id: nanoid(),
    userId,
    name: input.name.trim(),
    description: input.description ?? "",
    color: input.color,
    notes: input.notes ?? "",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await db.subjects.add(subject);
  return subject;
}

export async function updateSubject(
  id: string,
  userId: string,
  input: SubjectInput
) {
  const existing = await getSubject(id, userId);
  if (!existing) throw new Error("Disciplina não encontrada.");

  await db.subjects.update(id, {
    name: input.name.trim(),
    description: input.description ?? "",
    color: input.color,
    notes: input.notes ?? "",
    updatedAt: nowISO(),
  });
  return getSubject(id, userId);
}

export async function deleteSubject(id: string, userId: string) {
  const existing = await getSubject(id, userId);
  if (!existing) throw new Error("Disciplina não encontrada.");

  await db.transaction(
    "rw",
    [
      db.subjects,
      db.activities,
      db.studySessions,
      db.reviewContents,
      db.flashcards,
      db.materials,
      db.notifications,
    ],
    async () => {
      const activityIds = (
        await db.activities.where({ userId, subjectId: id }).toArray()
      ).map((a) => a.id);

      await db.activities.where({ userId, subjectId: id }).delete();
      await db.studySessions.where({ userId, subjectId: id }).delete();
      await db.reviewContents.where({ userId, subjectId: id }).delete();
      await db.flashcards.where({ userId, subjectId: id }).delete();
      await db.materials.where({ userId, subjectId: id }).delete();

      if (activityIds.length) {
        const notifications = await db.notifications
          .where("userId")
          .equals(userId)
          .toArray();
        const toDelete = notifications
          .filter(
            (n) =>
              n.relatedActivityId &&
              activityIds.includes(n.relatedActivityId)
          )
          .map((n) => n.id);
        await db.notifications.bulkDelete(toDelete);
      }

      await db.subjects.delete(id);
    }
  );
}
