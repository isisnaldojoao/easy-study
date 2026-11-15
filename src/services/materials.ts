import { nanoid } from "nanoid";
import { ACCEPTED_MATERIAL_TYPES } from "@/lib/constants";
import { db } from "@/lib/db";
import { nowISO } from "@/lib/dates";
import type { Material } from "@/types";

function extensionOf(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "file";
}

export async function listMaterials(userId: string, subjectId?: string) {
  let items = await db.materials.where("userId").equals(userId).toArray();
  if (subjectId) items = items.filter((i) => i.subjectId === subjectId);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function uploadMaterial(
  userId: string,
  subjectId: string,
  file: File
) {
  if (!ACCEPTED_MATERIAL_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx|pptx|txt|jpe?g|png|webp|gif)$/i)) {
    throw new Error("Tipo de arquivo não suportado.");
  }

  const material: Material = {
    id: nanoid(),
    userId,
    subjectId,
    fileName: file.name,
    fileType: extensionOf(file.name),
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    blob: file,
    createdAt: nowISO(),
  };

  await db.materials.add(material);
  return material;
}

export async function deleteMaterial(id: string, userId: string) {
  const existing = await db.materials.get(id);
  if (!existing || existing.userId !== userId) {
    throw new Error("Material não encontrado.");
  }
  await db.materials.delete(id);
}

export function openMaterial(material: Material) {
  const url = URL.createObjectURL(material.blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function downloadMaterial(material: Material) {
  const url = URL.createObjectURL(material.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = material.fileName;
  a.click();
  URL.revokeObjectURL(url);
}
