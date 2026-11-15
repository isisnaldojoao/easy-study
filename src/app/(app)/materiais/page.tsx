"use client";

import { useMemo, useRef, useState } from "react";
import { Download, FolderOpen, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useSearch } from "@/components/layout/search-context";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useMaterials, useSubjects } from "@/hooks/use-live-data";
import { ACCEPTED_MATERIAL_EXTENSIONS } from "@/lib/constants";
import { formatDisplayDate } from "@/lib/dates";
import { matchesSearch } from "@/lib/urgency";
import { useAuth } from "@/providers/auth-provider";
import {
  deleteMaterial,
  downloadMaterial,
  openMaterial,
  uploadMaterial,
} from "@/services/materials";
import type { Material } from "@/types";

export default function MateriaisPage() {
  const { user } = useAuth();
  const { search } = useSearch();
  const subjects = useSubjects();
  const materials = useMaterials();
  const inputRef = useRef<HTMLInputElement>(null);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [uploadSubjectId, setUploadSubjectId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<Material | null>(null);

  const subjectMap = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  const filtered = useMemo(
    () =>
      materials.filter((m) => {
        if (subjectFilter !== "all" && m.subjectId !== subjectFilter) return false;
        const subject = subjectMap.get(m.subjectId)?.name ?? "";
        return matchesSearch(`${m.fileName} ${subject} ${m.fileType}`, search);
      }),
    [materials, subjectFilter, subjectMap, search]
  );

  async function handleFiles(files: FileList | null) {
    if (!user || !files?.length) return;
    const subjectId = uploadSubjectId || subjects[0]?.id;
    if (!subjectId) {
      toast.error("Cadastre uma disciplina antes de enviar arquivos.");
      return;
    }
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadMaterial(user.id, subjectId, file);
      }
      toast.success(
        files.length === 1 ? "Arquivo enviado." : `${files.length} arquivos enviados.`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha no upload."
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function confirmDelete() {
    if (!user || !deleting) return;
    try {
      await deleteMaterial(deleting.id, user.id);
      toast.success("Material excluído.");
      setDeleting(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível excluir."
      );
    }
  }

  function formatSize(size: number) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Materiais
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Arquivos salvos localmente no seu navegador
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enviar arquivo</CardTitle>
          <CardDescription>
            PDF, DOCX, PPTX, imagens e TXT — armazenados no IndexedDB
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <p className="text-sm font-medium">Disciplina do upload</p>
            <Select
              value={uploadSubjectId || subjects[0]?.id || ""}
              onValueChange={setUploadSubjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a disciplina" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_MATERIAL_EXTENSIONS}
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <Button
            disabled={uploading || subjects.length === 0}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Enviando..." : "Selecionar arquivos"}
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar disciplina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as disciplinas</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-5 w-5" />}
          title="Nenhum material"
          description="Envie PDFs, slides e imagens para organizar seus estudos."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((material) => (
            <div
              key={material.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{material.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {subjectMap.get(material.subjectId)?.name} ·{" "}
                  {material.fileType.toUpperCase()} · {formatSize(material.size)} ·{" "}
                  {formatDisplayDate(material.createdAt.slice(0, 10))}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openMaterial(material)}
                >
                  Abrir
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => downloadMaterial(material)}
                >
                  <Download className="h-4 w-4" />
                  Baixar
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleting(material)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir material?</DialogTitle>
            <DialogDescription>
              Remover &quot;{deleting?.fileName}&quot; do armazenamento local.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
