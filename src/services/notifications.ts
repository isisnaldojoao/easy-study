import { nanoid } from "nanoid";
import {
  ACTIVITY_TYPES,
  REMINDER_OPTIONS,
} from "@/lib/constants";
import { db } from "@/lib/db";
import { addDaysISO, nowISO, todayISO } from "@/lib/dates";
import type { Activity, AppNotification, ReminderOffset } from "@/types";
import { getCurrentUser } from "@/services/auth";

function typeLabel(type: Activity["type"]) {
  return ACTIVITY_TYPES.find((t) => t.value === type)?.label ?? type;
}

function reminderLabel(offset: ReminderOffset) {
  return (
    REMINDER_OPTIONS.find((r) => r.value === offset)?.label ??
    `${offset} dias antes`
  );
}

export async function listNotifications(userId: string) {
  const items = await db.notifications.where("userId").equals(userId).toArray();
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function unreadCount(userId: string) {
  const items = await db.notifications.where("userId").equals(userId).toArray();
  return items.filter((n) => !n.read).length;
}

export async function markNotificationRead(id: string, userId: string) {
  const item = await db.notifications.get(id);
  if (!item || item.userId !== userId) return;
  await db.notifications.update(id, { read: true });
}

export async function markAllNotificationsRead(userId: string) {
  const items = await db.notifications.where("userId").equals(userId).toArray();
  await db.notifications.bulkPut(items.map((n) => ({ ...n, read: true })));
}

async function upsertNotification(
  notification: Omit<AppNotification, "id" | "createdAt"> & {
    createdAt?: string;
  }
) {
  const existing = await db.notifications
    .where("dedupeKey")
    .equals(notification.dedupeKey)
    .first();

  if (existing) {
    if (existing.userId !== notification.userId) return existing;
    await db.notifications.update(existing.id, {
      title: notification.title,
      message: notification.message,
      type: notification.type,
      scheduledAt: notification.scheduledAt,
      relatedActivityId: notification.relatedActivityId,
      relatedSessionId: notification.relatedSessionId,
    });
    return existing;
  }

  const created: AppNotification = {
    id: nanoid(),
    createdAt: nowISO(),
    ...notification,
  };
  await db.notifications.add(created);
  return created;
}

export async function syncActivityNotifications(activity: Activity) {
  const user = await getCurrentUser();
  if (!user || user.id !== activity.userId) return;
  if (!user.preferences.notificationsEnabled) return;

  const today = todayISO();
  const existing = await db.notifications
    .where("userId")
    .equals(activity.userId)
    .filter((n) => n.relatedActivityId === activity.id)
    .toArray();

  // Remove stale unread reminder/upcoming keys that no longer apply
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
    for (const offset of activity.reminderSettings) {
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

    const daysAhead = ["3", "7"] as const;
    for (const days of daysAhead) {
      const target = addDaysISO(today, Number(days));
      if (activity.date !== target) continue;
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
    (n) =>
      !keepKeys.has(n.dedupeKey) &&
      (n.type === "reminder" || n.type === "upcoming" || n.type === "overdue")
  );
  if (stale.length) {
    await db.notifications.bulkDelete(stale.map((n) => n.id));
  }
}

/** Run reminder generation for all user activities (local "backend" routine). */
export async function runNotificationEngine(userId: string) {
  const user = await db.users.get(userId);
  if (!user?.preferences.notificationsEnabled) return;

  const activities = await db.activities.where("userId").equals(userId).toArray();
  for (const activity of activities) {
    await syncActivityNotifications(activity);
  }
}

export async function requestBrowserPushPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function showBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  new Notification(title, { body, icon: "/icons/icon-192.png" });
}
