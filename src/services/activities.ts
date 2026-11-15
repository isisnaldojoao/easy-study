import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { isPastDate, nowISO, todayISO } from "@/lib/dates";
import type { ActivityInput } from "@/schemas/activity";
import type { Activity, ActivityStatus } from "@/types";
import { syncActivityNotifications } from "@/services/notifications";

function resolveStatus(
  status: ActivityStatus,
  date: string
): ActivityStatus {
  if (status === "concluido") return "concluido";
  if (isPastDate(date, todayISO())) return "atrasado";
  return status === "atrasado" ? "pendente" : status;
}

export async function listActivities(userId: string) {
  const items = await db.activities.where("userId").equals(userId).toArray();
  return items.sort((a, b) =>
    a.date === b.date
      ? (a.time ?? "").localeCompare(b.time ?? "")
      : a.date.localeCompare(b.date)
  );
}

export async function listActivitiesBySubject(
  userId: string,
  subjectId: string
) {
  const items = await db.activities
    .where({ userId, subjectId })
    .toArray();
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getActivity(id: string, userId: string) {
  const activity = await db.activities.get(id);
  if (!activity || activity.userId !== userId) return null;
  return activity;
}

export async function createActivity(userId: string, input: ActivityInput) {
  if (!input.subjectId?.trim()) {
    throw new Error("Selecione uma disciplina.");
  }
  if (!input.title?.trim()) {
    throw new Error("Informe o título da atividade.");
  }
  if (!input.date) {
    throw new Error("Informe a data da atividade.");
  }

  const status = resolveStatus(input.status ?? "pendente", input.date);
  const activity: Activity = {
    id: nanoid(),
    userId,
    subjectId: input.subjectId,
    title: input.title.trim(),
    description: input.description ?? "",
    type: input.type ?? "atividade",
    date: input.date,
    time: input.time?.trim() ? input.time : undefined,
    priority: input.priority ?? "media",
    status,
    reminderSettings: input.reminderSettings?.length
      ? input.reminderSettings
      : [1],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await db.activities.add(activity);
  try {
    await syncActivityNotifications(activity);
  } catch {
    // Notifications must not block activity persistence
  }
  return activity;
}

export async function updateActivity(
  id: string,
  userId: string,
  input: ActivityInput
) {
  const existing = await getActivity(id, userId);
  if (!existing) throw new Error("Atividade não encontrada.");

  const status = resolveStatus(input.status, input.date);
  await db.activities.update(id, {
    subjectId: input.subjectId,
    title: input.title.trim(),
    description: input.description ?? "",
    type: input.type,
    date: input.date,
    time: input.time?.trim() ? input.time : undefined,
    priority: input.priority,
    status,
    reminderSettings: input.reminderSettings ?? [1],
    updatedAt: nowISO(),
  });

  const updated = await getActivity(id, userId);
  if (updated) await syncActivityNotifications(updated);
  return updated;
}

export async function setActivityStatus(
  id: string,
  userId: string,
  status: ActivityStatus
) {
  const existing = await getActivity(id, userId);
  if (!existing) throw new Error("Atividade não encontrada.");

  const next = resolveStatus(status, existing.date);
  await db.activities.update(id, { status: next, updatedAt: nowISO() });
  const updated = await getActivity(id, userId);
  if (updated) await syncActivityNotifications(updated);
  return updated;
}

export async function deleteActivity(id: string, userId: string) {
  const existing = await getActivity(id, userId);
  if (!existing) throw new Error("Atividade não encontrada.");

  await db.transaction("rw", db.activities, db.notifications, async () => {
    await db.activities.delete(id);
    const related = await db.notifications
      .where("userId")
      .equals(userId)
      .filter((n) => n.relatedActivityId === id)
      .toArray();
    await db.notifications.bulkDelete(related.map((n) => n.id));
  });
}

export async function refreshOverdueStatuses(userId: string) {
  const today = todayISO();
  const items = await db.activities.where("userId").equals(userId).toArray();
  const updates = items.filter(
    (a) =>
      a.status !== "concluido" &&
      isPastDate(a.date, today) &&
      a.status !== "atrasado"
  );

  for (const activity of updates) {
    await db.activities.update(activity.id, {
      status: "atrasado",
      updatedAt: nowISO(),
    });
    const updated = await getActivity(activity.id, userId);
    if (updated) await syncActivityNotifications(updated);
  }
}
