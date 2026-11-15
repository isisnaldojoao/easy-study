import {
  addDays,
  differenceInCalendarDays,
  format,
  isBefore,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export const TIMEZONE = "America/Sao_Paulo";

/** Parse YYYY-MM-DD as a local calendar date (avoids UTC midnight shift). */
export function parseDateOnly(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/** Current calendar date in America/Sao_Paulo as YYYY-MM-DD */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function formatDisplayDate(date: string, pattern = "dd MMM yyyy") {
  return format(parseDateOnly(date), pattern, { locale: ptBR });
}

export function formatLongDate(date = todayISO()) {
  return format(parseDateOnly(date), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
}

export function daysUntil(date: string, from = todayISO()) {
  return differenceInCalendarDays(parseDateOnly(date), parseDateOnly(from));
}

export type UrgencyBucket =
  | "hoje"
  | "amanha"
  | "proximos_3"
  | "proximos_7"
  | "mais_7"
  | "atrasado";

export function urgencyBucket(date: string, from = todayISO()): UrgencyBucket {
  const days = daysUntil(date, from);
  if (days < 0) return "atrasado";
  if (days === 0) return "hoje";
  if (days === 1) return "amanha";
  if (days <= 3) return "proximos_3";
  if (days <= 7) return "proximos_7";
  return "mais_7";
}

export const urgencyLabels: Record<UrgencyBucket, string> = {
  atrasado: "Atrasado",
  hoje: "Hoje",
  amanha: "Amanhã",
  proximos_3: "Em 3d",
  proximos_7: "Em 7d",
  mais_7: "+7d",
};

export function isPastDate(date: string, from = todayISO()) {
  return isBefore(startOfDay(parseDateOnly(date)), startOfDay(parseDateOnly(from)));
}

export function addDaysISO(date: string, amount: number) {
  return format(addDays(parseDateOnly(date), amount), "yyyy-MM-dd");
}

export function parseTimeToMinutes(time?: string) {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function sessionDurationHours(startTime: string, endTime: string) {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start == null || end == null || end <= start) return 0;
  return (end - start) / 60;
}
