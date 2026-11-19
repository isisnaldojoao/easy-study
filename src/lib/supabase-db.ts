import { notifyDataChange } from "@/lib/data-sync";
import { asDate, toCamel, toSnake } from "@/lib/records";
import { getSupabase } from "@/lib/supabase";

function unwrap<T>(data: T, error: { message: string } | null) {
  if (error) throw new Error(error.message);
  return data;
}

export async function listByUser<T>(
  table: string,
  userId: string
) {
  const { data, error } = await getSupabase()
    .from(table)
    .select("*")
    .eq("user_id", userId);
  const rows = unwrap(data ?? [], error) as Record<string, unknown>[];
  return rows.map((row) => normalizeDates(toCamel<T>(row)));
}

export async function getOwned<T>(table: string, id: string, userId: string) {
  const { data, error } = await getSupabase()
    .from(table)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return normalizeDates(toCamel<T>(data as Record<string, unknown>));
}

export async function insertRow<T>(table: string, row: object) {
  const { data, error } = await getSupabase()
    .from(table)
    .insert(toSnake(row))
    .select("*")
    .single();
  const created = unwrap(data, error) as Record<string, unknown>;
  notifyDataChange();
  return normalizeDates(toCamel<T>(created));
}

export async function updateRow<T>(
  table: string,
  id: string,
  userId: string,
  patch: object
) {
  const { data, error } = await getSupabase()
    .from(table)
    .update(toSnake(patch))
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Registro não encontrado.");
  notifyDataChange();
  return normalizeDates(toCamel<T>(data as Record<string, unknown>));
}

export async function deleteOwned(table: string, id: string, userId: string) {
  const { error } = await getSupabase()
    .from(table)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  notifyDataChange();
}

export async function deleteWhere(
  table: string,
  filters: Record<string, string>
) {
  let query = getSupabase().from(table).delete();
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }
  const { error } = await query;
  if (error) throw new Error(error.message);
  notifyDataChange();
}

function normalizeDates<T>(row: T): T {
  const record = row as T & { date?: string; startDate?: string; scheduledAt?: string };
  if (record.date) record.date = String(asDate(record.date));
  if (record.startDate) record.startDate = String(asDate(record.startDate));
  if (record.scheduledAt) record.scheduledAt = String(asDate(record.scheduledAt));
  return record;
}
