"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ACTIVITY_TYPES } from "@/lib/constants";
import { todayISO } from "@/lib/dates";
import {
  studySessionSchema,
  type CommitmentKind,
  type StudySessionInput,
} from "@/schemas/session";
import { createActivity, updateActivity } from "@/services/activities";
import {
  createStudySession,
  updateStudySession,
} from "@/services/study-sessions";
import type { Activity, StudySession, Subject } from "@/types";
import { useAuth } from "@/providers/auth-provider";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";

const KIND_OPTIONS: { value: CommitmentKind; label: string }[] = [
  { value: "sessao", label: "Sessão de estudo" },
  ...ACTIVITY_TYPES.map((t) => ({ value: t.value as CommitmentKind, label: t.label })),
];

interface SessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: StudySession | null;
  /** When editing an activity created as prova/trabalho etc. */
  activity?: Activity | null;
  subjects: Subject[];
  defaultSubjectId?: string;
  defaultDate?: string;
  defaultKind?: CommitmentKind;
}

export function SessionFormDialog({
  open,
  onOpenChange,
  session,
  activity,
  subjects,
  defaultSubjectId,
  defaultDate,
  defaultKind = "sessao",
}: SessionFormDialogProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(session || activity);
  const wasOpen = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<StudySessionInput>({
    resolver: zodResolver(studySessionSchema),
    defaultValues: {
      kind: "sessao",
      subjectId: "",
      title: "",
      content: "",
      startDate: todayISO(),
      startTime: "08:00",
      endTime: "09:00",
      notes: "",
    },
  });

  const kind = watch("kind");
  const isStudySession = kind === "sessao";

  useEffect(() => {
    const justOpened = open && !wasOpen.current;
    wasOpen.current = open;
    if (!justOpened) return;

    if (activity) {
      reset({
        kind: activity.type,
        subjectId: activity.subjectId,
        title: activity.title,
        content: activity.description,
        startDate: activity.date,
        startTime: activity.time || "08:00",
        endTime: "09:00",
        notes: "",
      });
      return;
    }

    if (session) {
      reset({
        kind: "sessao",
        subjectId: session.subjectId,
        title: session.title,
        content: session.content,
        startDate: session.startDate,
        startTime: session.startTime,
        endTime: session.endTime,
        notes: session.notes,
      });
      return;
    }

    reset({
      kind: defaultKind,
      subjectId: defaultSubjectId ?? subjects[0]?.id ?? "",
      title: "",
      content: "",
      startDate: defaultDate ?? todayISO(),
      startTime: "08:00",
      endTime: "09:00",
      notes: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, session?.id, activity?.id, defaultSubjectId, defaultDate, defaultKind, reset]);

  async function onSubmit(data: StudySessionInput) {
    if (!user) return;
    setSubmitting(true);
    try {
      if (data.kind === "sessao") {
        const payload = {
          subjectId: data.subjectId,
          title: data.title,
          content: data.content ?? "",
          startDate: data.startDate,
          startTime: data.startTime,
          endTime: data.endTime || data.startTime,
          notes: data.notes ?? "",
        };
        if (session) {
          await updateStudySession(session.id, user.id, payload);
          toast.success("Sessão atualizada.");
        } else {
          await createStudySession(user.id, payload);
          toast.success("Sessão de estudo criada.");
        }
      } else {
        const payload = {
          subjectId: data.subjectId,
          title: data.title.trim(),
          description: (data.content || data.notes || "") as string,
          type: data.kind,
          date: data.startDate,
          time: data.startTime || "",
          priority: "alta" as const,
          status: "pendente" as const,
          reminderSettings: [1] as (0 | 1 | 3 | 5 | 7)[],
        };
        if (activity) {
          await updateActivity(activity.id, user.id, payload);
          toast.success("Atividade atualizada.");
        } else {
          await createActivity(user.id, payload);
          toast.success(
            data.kind === "prova"
              ? "Prova cadastrada — já aparece no dashboard."
              : "Atividade cadastrada — já aparece no dashboard."
          );
        }
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar compromisso" : "Novo compromisso"}
          </DialogTitle>
          <DialogDescription>
            Escolha o tipo: prova e trabalho vão para o dashboard como avaliação.
            Sessão de estudo fica no seu planejamento de horas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Controller
              control={control}
              name="kind"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isEdit}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KIND_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {!isStudySession && (
              <p className="text-xs text-primary">
                Isso será uma atividade acadêmica (aparece em Início, calendário e
                disciplinas).
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Disciplina</Label>
            <Controller
              control={control}
              name="subjectId"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.subjectId && (
              <p className="text-xs text-destructive">{errors.subjectId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="session-title">Título</Label>
            <Input
              id="session-title"
              placeholder={isStudySession ? "Ex.: Revisar capítulo 3" : "Ex.: Prova de algoritmos"}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="session-content">Detalhes</Label>
            <Textarea id="session-content" rows={2} {...register("content")} />
          </div>

          <div className={`grid gap-4 ${isStudySession ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            <div className="space-y-1.5">
              <Label htmlFor="session-date">Data</Label>
              <Input id="session-date" type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="session-start">
                {isStudySession ? "Início" : "Horário"}
              </Label>
              <Input id="session-start" type="time" {...register("startTime")} />
              {errors.startTime && (
                <p className="text-xs text-destructive">{errors.startTime.message}</p>
              )}
            </div>
            {isStudySession && (
              <div className="space-y-1.5">
                <Label htmlFor="session-end">Fim</Label>
                <Input id="session-end" type="time" {...register("endTime")} />
                {errors.endTime && (
                  <p className="text-xs text-destructive">{errors.endTime.message}</p>
                )}
              </div>
            )}
          </div>

          {isStudySession && (
            <div className="space-y-1.5">
              <Label htmlFor="session-notes">Observações</Label>
              <Textarea id="session-notes" rows={2} {...register("notes")} />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || subjects.length === 0}>
              {submitting ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
