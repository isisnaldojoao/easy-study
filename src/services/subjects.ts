import { nowISO } from "@/lib/dates";
import { deleteOwned, deleteWhere, getOwned, insertRow, listByUser, updateRow } from "@/lib/supabase-db";
import { getSupabase } from "@/lib/supabase";
import type { SubjectInput } from "@/schemas/subject";
import type { Subject } from "@/types";

const table = "subjects";

export async function listSubjects(userId: string) {
  const items = await listByUser<Subject>(table, userId);
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSubject(id: string, userId: string) {
  return getOwned<Subject>(table, id, userId);
}

export async function createSubject(userId: string, input: SubjectInput) {
  return insertRow<Subject>(table, {
    id: crypto.randomUUID(),
    userId,
    name: input.name.trim(),
    description: input.description ?? "",
    color: input.color,
    notes: input.notes ?? "",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  });
}

export async function updateSubject(id: string, userId: string, input: SubjectInput) {
  return updateRow<Subject>(table, id, userId, {
    name: input.name.trim(),
    description: input.description ?? "",
    color: input.color,
    notes: input.notes ?? "",
    updatedAt: nowISO(),
  });
}

export async function deleteSubject(id: string, userId: string) {
  const existing = await getSubject(id, userId);
  if (!existing) throw new Error("Disciplina não encontrada.");

  const materials = await listByUser<{ subjectId: string; storagePath?: string }>("materials", userId);
  const paths = materials
    .filter((item) => item.subjectId === id)
    .map((item) => item.storagePath)
    .filter((path): path is string => Boolean(path));
  if (paths.length) {
    await getSupabase().storage.from("materials").remove(paths);
  }

  await deleteWhere("subjects", { id, user_id: userId });
}
