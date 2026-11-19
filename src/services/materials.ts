import { toast } from "sonner";
import { ACCEPTED_MATERIAL_TYPES } from "@/lib/constants";
import { nowISO } from "@/lib/dates";
import { deleteOwned, getOwned, insertRow, listByUser } from "@/lib/supabase-db";
import { getSupabase } from "@/lib/supabase";
import type { Material } from "@/types";

const bucket = "materials";

function extensionOf(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "file";
}

export async function listMaterials(userId: string, subjectId?: string) {
  let items = await listByUser<Material>("materials", userId);
  if (subjectId) items = items.filter((item) => item.subjectId === subjectId);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function uploadMaterial(userId: string, subjectId: string, file: File) {
  if (
    !ACCEPTED_MATERIAL_TYPES.includes(file.type) &&
    !file.name.match(/\.(pdf|docx|pptx|txt|jpe?g|png|webp|gif)$/i)
  ) {
    throw new Error("Tipo de arquivo não suportado.");
  }

  const id = crypto.randomUUID();
  const storagePath = `${userId}/${id}/${file.name}`;
  const { error } = await getSupabase().storage.from(bucket).upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  return insertRow<Material>("materials", {
    id,
    userId,
    subjectId,
    fileName: file.name,
    fileType: extensionOf(file.name),
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    storagePath,
    createdAt: nowISO(),
  });
}

export async function deleteMaterial(id: string, userId: string) {
  const existing = await getOwned<Material>("materials", id, userId);
  if (!existing) throw new Error("Material não encontrado.");
  if (existing.storagePath) {
    await getSupabase().storage.from(bucket).remove([existing.storagePath]);
  }
  await deleteOwned("materials", id, userId);
}

async function fileBlob(material: Material) {
  if (!material.storagePath) throw new Error("Arquivo sem caminho no Storage.");
  const { data, error } = await getSupabase().storage.from(bucket).download(material.storagePath);
  if (error || !data) throw new Error(error?.message ?? "Não foi possível baixar o arquivo.");
  return data;
}

export async function openMaterial(material: Material) {
  try {
    const blob = await fileBlob(material);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Não foi possível abrir o arquivo.");
  }
}

export async function downloadMaterial(material: Material) {
  try {
    const blob = await fileBlob(material);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = material.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Não foi possível baixar o arquivo.");
  }
}
