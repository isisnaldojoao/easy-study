import { ACTIVITY_TYPES, REMINDER_OPTIONS } from "@/lib/constants";
import { addDaysISO, nowISO, todayISO } from "@/lib/dates";
import { toCamel, toSnake } from "@/lib/records";
import { notifyDataChange } from "@/lib/data-sync";
import { deleteOwned, listByUser, updateRow } from "@/lib/supabase-db";
import { getSupabase } from "@/lib/supabase";
import { getCurrentUser } from "@/services/auth";
import type { Activity, AppNotification, ReminderOffset } from "@/types";

function typeLabel(type: Activity["type"]) {
  return ACTIVITY_TYPES.find((item) => item.value === type)?.label ?? type;
}

function reminderLabel(offset: ReminderOffset) {
  return REMINDER_OPTIONS.find((item) => item.value === offset)?.label ?? `${offset} dias antes`;
}

export async function listNotifications(userId: string) {
  const items = await listByUser<AppNotification>("notifications", userId);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function unreadCount(userId: string) {
  const items = await listNotifications(userId);
  return items.filter((item) => !item.read).length;
}

export async function markNotificationRead(id: string, userId: string) {
  await updateRow("notifications", id, userId, { read: true });
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await getSupabase()
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw new Error(error.message);
  notifyDataChange();
}

async function findByDedupe(userId: string, dedupeKey: string) {
  const { data, error } = await getSupabase()
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("dedupe_key", dedupeKey)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return toCamel<AppNotification>(data as Record<string, unknown>);
}

async function upsertNotification(
  notification: Omit<AppNotification, "id" | "createdAt"> & { createdAt?: string }
) {
  const existing = await findByDedupe(notification.userId, notification.dedupeKey);
  if (existing) {
    await updateRow("notifications", existing.id, notification.userId, {
      title: notification.title,
      message: notification.message,
      type: notification.type,
      scheduledAt: notification.scheduledAt,
      relatedActivityId: notification.relatedActivityId ?? null,
      relatedSessionId: notification.relatedSessionId ?? null,
    });
    return existing;
  }

  const created = {
    id: crypto.randomUUID(),
    createdAt: nowISO(),
    ...notification,
  };
  const { error } = await getSupabase().from("notifications").insert(toSnake(created));
  if (error) throw new Error(error.message);
  notifyDataChange();
  return created;
}

export async function syncActivityNotifications(activity: Activity) {
  const user = await getCurrentUser();
  if (!user || user.id !== activity.userId) return;
  if (!user.preferences.notificationsEnabled) return;

  const today = todayISO();
  const existing = (await listNotifications(activity.userId)).filter(
    (item) => item.relatedActivityId === activity.id
  );
  const keepKeys = new Set<string>();

  if (activity.status === "concluido") {
    const dedupeKey = `completed:${activity.id}`;
    keepKeys.add(dedupeKey);
    await upsertNotification({
      userId: activity.userId,
      title: "Atividade concluída",
      message: `${activity.title} foi marcada como concluída.`,
      type: "completed",
      relatedActivityId: activity.id,
      read: false,
      scheduledAt: today,
      dedupeKey,
    });
  } else if (activity.status === "atrasado") {
    const dedupeKey = `overdue:${activity.id}`;
    keepKeys.add(dedupeKey);
    await upsertNotification({
      userId: activity.userId,
      title: "Atividade atrasada",
      message: `${typeLabel(activity.type)} "${activity.title}" está atrasada.`,
      type: "overdue",
      relatedActivityId: activity.id,
      read: false,
      scheduledAt: today,
      dedupeKey,
    });
  } else {
    for (const offset of activity.reminderSettings ?? []) {
      const scheduledAt = addDaysISO(activity.date, -offset);
      if (scheduledAt > today) continue;
      const dedupeKey = `reminder:${activity.id}:${offset}`;
      keepKeys.add(dedupeKey);
      await upsertNotification({
        userId: activity.userId,
        title:
          offset === 0
            ? "Atividade para hoje"
            : offset === 1
              ? "Atividade amanhã"
              : `Lembrete — ${reminderLabel(offset)}`,
        message: `${typeLabel(activity.type)} "${activity.title}" em ${activity.date}${
          activity.time ? ` às ${activity.time}` : ""
        }.`,
        type: "reminder",
        relatedActivityId: activity.id,
        read: false,
        scheduledAt,
        dedupeKey,
      });
    }

    for (const days of ["3", "7"] as const) {
      if (activity.date !== addDaysISO(today, Number(days))) continue;
      const dedupeKey = `upcoming:${activity.id}:${days}`;
      keepKeys.add(dedupeKey);
      await upsertNotification({
        userId: activity.userId,
        title: `Compromisso em ${days} dias`,
        message: `${typeLabel(activity.type)} "${activity.title}" está chegando.`,
        type: "upcoming",
        relatedActivityId: activity.id,
        read: false,
        scheduledAt: today,
        dedupeKey,
      });
    }
  }

  const stale = existing.filter(
    (item) =>
      !keepKeys.has(item.dedupeKey) &&
      (item.type === "reminder" || item.type === "upcoming" || item.type === "overdue")
  );
  for (const item of stale) {
    await deleteOwned("notifications", item.id, activity.userId);
  }
}

export async function runNotificationEngine(userId: string) {
  const user = await getCurrentUser();
  if (!user || user.id !== userId || !user.preferences.notificationsEnabled) return;
  const activities = await listByUser<Activity>("activities", userId);
  for (const activity of activities) {
    await syncActivityNotifications(activity);
  }
}

export async function requestBrowserPushPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function showBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  new Notification(title, { body, icon: "/icons/icon-192.png" });
}
