import { isPastDate, nowISO, todayISO } from "@/lib/dates";
import { deleteOwned, getOwned, insertRow, listByUser, updateRow } from "@/lib/supabase-db";
import { deleteWhere } from "@/lib/supabase-db";
import type { ActivityInput } from "@/schemas/activity";
import type { Activity, ActivityStatus } from "@/types";
import { syncActivityNotifications } from "@/services/notifications";

const table = "activities";

function resolveStatus(status: ActivityStatus, date: string): ActivityStatus {
  if (status === "concluido") return "concluido";
  if (isPastDate(date, todayISO())) return "atrasado";
  return status === "atrasado" ? "pendente" : status;
}

function sortActivities(items: Activity[]) {
  return items.sort((a, b) =>
    a.date === b.date ? (a.time ?? "").localeCompare(b.time ?? "") : a.date.localeCompare(b.date)
  );
}

export async function listActivities(userId: string) {
  return sortActivities(await listByUser<Activity>(table, userId));
}

export async function listActivitiesBySubject(userId: string, subjectId: string) {
  const items = await listActivities(userId);
  return items.filter((item) => item.subjectId === subjectId);
}

export async function getActivity(id: string, userId: string) {
  return getOwned<Activity>(table, id, userId);
}

export async function createActivity(userId: string, input: ActivityInput) {
  if (!input.subjectId?.trim()) throw new Error("Selecione uma disciplina.");
  if (!input.title?.trim()) throw new Error("Informe o título da atividade.");
  if (!input.date) throw new Error("Informe a data da atividade.");

  const activity = await insertRow<Activity>(table, {
    id: crypto.randomUUID(),
    userId,
    subjectId: input.subjectId,
    title: input.title.trim(),
    description: input.description ?? "",
    type: input.type ?? "atividade",
    date: input.date,
    time: input.time?.trim() ? input.time : null,
    priority: input.priority ?? "media",
    status: resolveStatus(input.status ?? "pendente", input.date),
    reminderSettings: input.reminderSettings?.length ? input.reminderSettings : [1],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  });

  try {
    await syncActivityNotifications(activity);
  } catch {
    // O lembrete não pode impedir de salvar a atividade.
  }
  return activity;
}

export async function updateActivity(id: string, userId: string, input: ActivityInput) {
  const existing = await getActivity(id, userId);
  if (!existing) throw new Error("Atividade não encontrada.");

  const updated = await updateRow<Activity>(table, id, userId, {
    subjectId: input.subjectId,
    title: input.title.trim(),
    description: input.description ?? "",
    type: input.type,
    date: input.date,
    time: input.time?.trim() ? input.time : null,
    priority: input.priority,
    status: resolveStatus(input.status, input.date),
    reminderSettings: input.reminderSettings ?? [1],
    updatedAt: nowISO(),
  });
  await syncActivityNotifications(updated);
  return updated;
}

export async function setActivityStatus(id: string, userId: string, status: ActivityStatus) {
  const existing = await getActivity(id, userId);
  if (!existing) throw new Error("Atividade não encontrada.");
  const updated = await updateRow<Activity>(table, id, userId, {
    status: resolveStatus(status, existing.date),
    updatedAt: nowISO(),
  });
  await syncActivityNotifications(updated);
  return updated;
}

export async function deleteActivity(id: string, userId: string) {
  const existing = await getActivity(id, userId);
  if (!existing) throw new Error("Atividade não encontrada.");
  await deleteWhere("notifications", { related_activity_id: id, user_id: userId });
  await deleteOwned(table, id, userId);
}

export async function refreshOverdueStatuses(userId: string) {
  const today = todayISO();
  const items = await listActivities(userId);
  const updates = items.filter(
    (activity) =>
      activity.status !== "concluido" &&
      isPastDate(activity.date, today) &&
      activity.status !== "atrasado"
  );

  for (const activity of updates) {
    const updated = await updateRow<Activity>(table, activity.id, userId, {
      status: "atrasado",
      updatedAt: nowISO(),
    });
    await syncActivityNotifications(updated);
  }
}
