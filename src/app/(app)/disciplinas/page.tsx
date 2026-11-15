"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SubjectFormDialog } from "@/components/subjects/subject-form-dialog";
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
  Progress,
} from "@/components/ui";
import { useActivities, useSubjects } from "@/hooks/use-live-data";
import { matchesSearch } from "@/lib/urgency";
import { useAuth } from "@/providers/auth-provider";
import { deleteSubject } from "@/services/subjects";
import type { Subject } from "@/types";

export default function DisciplinasPage() {
  const { user } = useAuth();
  const { search } = useSearch();
  const subjects = useSubjects();
  const activities = useActivities();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState<Subject | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () =>
      subjects.filter((s) =>
        matchesSearch(`${s.name} ${s.description}`, search)
      ),
    [subjects, search]
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(subject: Subject) {
    setEditing(subject);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!user || !deleting) return;
    setBusy(true);
    try {
      await deleteSubject(deleting.id, user.id);
      toast.success("Disciplina excluída.");
      setDeleting(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível excluir."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-up">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Minhas disciplinas
          </h1>
          <p className="mt-0.5 hidden text-sm text-muted-foreground sm:block">
            Cadastre e organize suas matérias
          </p>
        </div>
        <Button size="sm" className="shrink-0 sm:h-10 sm:px-4" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          <span className="sm:hidden">Nova</span>
          <span className="hidden sm:inline">Nova disciplina</span>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-5 w-5" />}
          title="Nenhuma disciplina encontrada"
          description={
            search
              ? "Tente outro termo de busca."
              : "Crie sua primeira disciplina para começar."
          }
          action={
            !search ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Criar disciplina
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {filtered.map((subject) => {
            const acts = activities.filter((a) => a.subjectId === subject.id);
            const done = acts.filter((a) => a.status === "concluido").length;
            const progress =
              acts.length === 0 ? 0 : Math.round((done / acts.length) * 100);

            return (
              <Card key={subject.id} className="flex flex-col">
                {/* Mobile row */}
                <CardContent className="flex min-w-0 items-center gap-1 p-3 sm:hidden">
                  <Link
                    href={`/disciplinas/${subject.id}`}
                    className="flex min-w-0 flex-1 items-center gap-2"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium leading-tight">
                        {subject.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {acts.length} ativ. · {progress}%
                      </p>
                    </div>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0"
                    aria-label="Editar"
                    onClick={() => openEdit(subject)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0"
                    aria-label="Excluir"
                    onClick={() => setDeleting(subject)}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </CardContent>

                {/* Desktop */}
                <div className="hidden flex-1 flex-col sm:flex">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/disciplinas/${subject.id}`}
                        className="min-w-0 flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <CardTitle className="truncate text-base hover:text-primary">
                            {subject.name}
                          </CardTitle>
                        </div>
                        <CardDescription className="mt-2 line-clamp-2">
                          {subject.description || "Sem descrição"}
                        </CardDescription>
                      </Link>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Editar"
                          onClick={() => openEdit(subject)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Excluir"
                          onClick={() => setDeleting(subject)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{acts.length} atividades</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <SubjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        subject={editing}
      />

      <Dialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir disciplina?</DialogTitle>
            <DialogDescription>
              Isso removerá permanentemente &quot;{deleting?.name}&quot; e todos os
              dados associados (atividades, sessões, materiais, flashcards).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={busy} onClick={() => void confirmDelete()}>
              {busy ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
