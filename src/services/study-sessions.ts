import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { nowISO, sessionDurationHours } from "@/lib/dates";
import type { SessionStatus, StudySession } from "@/types";

export type StudySessionFields = {
  subjectId: string;
  title: string;
  content?: string;
  startDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
};

export async function listStudySessions(userId: string) {
  const items = await db.studySessions.where("userId").equals(userId).toArray();
  return items.sort((a, b) =>
    a.startDate === b.startDate
      ? a.startTime.localeCompare(b.startTime)
      : a.startDate.localeCompare(b.startDate)
  );
}

export async function createStudySession(
  userId: string,
  input: StudySessionFields
) {
  const session: StudySession = {
    id: nanoid(),
    userId,
    subjectId: input.subjectId,
    title: input.title.trim(),
    content: input.content ?? "",
    startDate: input.startDate,
    startTime: input.startTime,
    endTime: input.endTime,
    notes: input.notes ?? "",
    status: "pendente",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await db.studySessions.add(session);
  return session;
}

export async function updateStudySession(
  id: string,
  userId: string,
  input: StudySessionFields
) {
  const existing = await db.studySessions.get(id);
  if (!existing || existing.userId !== userId) {
    throw new Error("Sessão não encontrada.");
  }

  await db.studySessions.update(id, {
    subjectId: input.subjectId,
    title: input.title.trim(),
    content: input.content ?? "",
    startDate: input.startDate,
    startTime: input.startTime,
    endTime: input.endTime,
    notes: input.notes ?? "",
    updatedAt: nowISO(),
  });
  return db.studySessions.get(id);
}

export async function setStudySessionStatus(
  id: string,
  userId: string,
  status: SessionStatus
) {
  const existing = await db.studySessions.get(id);
  if (!existing || existing.userId !== userId) {
    throw new Error("Sessão não encontrada.");
  }
  await db.studySessions.update(id, { status, updatedAt: nowISO() });
  return db.studySessions.get(id);
}

export async function deleteStudySession(id: string, userId: string) {
  const existing = await db.studySessions.get(id);
  if (!existing || existing.userId !== userId) {
    throw new Error("Sessão não encontrada.");
  }
  await db.studySessions.delete(id);
}

export function computeSessionStats(sessions: StudySession[]) {
  const planned = sessions.reduce(
    (acc, s) => acc + sessionDurationHours(s.startTime, s.endTime),
    0
  );
  const doneSessions = sessions.filter((s) => s.status === "concluida");
  const doneHours = doneSessions.reduce(
    (acc, s) => acc + sessionDurationHours(s.startTime, s.endTime),
    0
  );
  return {
    plannedHours: Number(planned.toFixed(1)),
    doneHours: Number(doneHours.toFixed(1)),
    completed: doneSessions.length,
    pending: sessions.filter((s) => s.status === "pendente").length,
  };
}
