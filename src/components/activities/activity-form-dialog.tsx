"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ACTIVITY_PRIORITIES,
  ACTIVITY_STATUSES,
  ACTIVITY_TYPES,
  REMINDER_OPTIONS,
} from "@/lib/constants";
import { todayISO } from "@/lib/dates";
import { activitySchema, type ActivityInput } from "@/schemas/activity";
import { createActivity, updateActivity } from "@/services/activities";
import type { Activity, Subject } from "@/types";
import { useAuth } from "@/providers/auth-provider";
import { useSubjects } from "@/hooks/use-live-data";
import {
  Button,
  Checkbox,
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

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity | null;
  subjects?: Subject[];
  defaultSubjectId?: string;
  defaultDate?: string;
}

export function ActivityFormDialog({
  open,
  onOpenChange,
  activity,
  subjects: subjectsProp,
  defaultSubjectId,
  defaultDate,
}: ActivityFormDialogProps) {
  const { user } = useAuth();
  const liveSubjects = useSubjects();
  const subjects = subjectsProp?.filter(Boolean) ?? liveSubjects;
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(activity);
  const defaultReminder = user?.preferences.defaultReminderDays ?? 1;
  const wasOpen = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ActivityInput>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      subjectId: "",
      title: "",
      description: "",
      type: "atividade",
      date: todayISO(),
      time: "",
      priority: "media",
      status: "pendente",
      reminderSettings: [1],
    },
  });

  const reminders = watch("reminderSettings") ?? [];

  // Reset only when the dialog opens — ignore subjects[] identity churn
  useEffect(() => {
    const justOpened = open && !wasOpen.current;
    wasOpen.current = open;
    if (!justOpened) return;

    const firstSubjectId = defaultSubjectId || subjects[0]?.id || "";

    reset(
      activity
        ? {
            subjectId: activity.subjectId,
            title: activity.title,
            description: activity.description,
            type: activity.type,
            date: activity.date,
            time: activity.time ?? "",
            priority: activity.priority,
            status: activity.status === "atrasado" ? "pendente" : activity.status,
            reminderSettings: activity.reminderSettings?.length
              ? activity.reminderSettings
              : [defaultReminder],
          }
        : {
            subjectId: firstSubjectId,
            title: "",
            description: "",
            type: "prova",
            date: defaultDate ?? todayISO(),
            time: "",
            priority: "media",
            status: "pendente",
            reminderSettings: [defaultReminder],
          }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-init on open
  }, [open, activity?.id, defaultSubjectId, defaultDate, defaultReminder, reset]);

  // If subjects load after open and subjectId is still empty, fill it once
  useEffect(() => {
    if (!open || activity) return;
    const current = watch("subjectId");
    if (!current && subjects[0]?.id) {
      setValue("subjectId", defaultSubjectId || subjects[0].id);
    }
  }, [open, activity, subjects, defaultSubjectId, setValue, watch]);

  async function onSubmit(data: ActivityInput) {
    if (!user) return;
    if (!data.subjectId) {
      toast.error("Selecione uma disciplina.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: ActivityInput = {
        ...data,
        description: data.description ?? "",
        time: data.time ?? "",
        status: data.status ?? "pendente",
        reminderSettings: data.reminderSettings?.length
          ? data.reminderSettings
          : [defaultReminder],
      };
      if (isEdit && activity) {
        await updateActivity(activity.id, user.id, payload);
        toast.success("Atividade atualizada.");
      } else {
        await createActivity(user.id, payload);
        toast.success("Atividade criada.");
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

  function onInvalid() {
    toast.error("Preencha os campos obrigatórios da atividade.");
  }

  function toggleReminder(value: (typeof REMINDER_OPTIONS)[number]["value"]) {
    const current = reminders;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value].sort((a, b) => a - b);
    setValue("reminderSettings", next, { shouldValidate: true });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar atividade" : "Nova atividade"}
          </DialogTitle>
          <DialogDescription>
            Cadastre provas, trabalhos e outros compromissos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
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
            <Label htmlFor="activity-title">Título</Label>
            <Input id="activity-title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="activity-description">Descrição</Label>
            <Textarea id="activity-description" rows={3} {...register("description")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_PRIORITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="activity-date">Data</Label>
              <Input id="activity-date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="activity-time">Horário</Label>
              <Input id="activity-time" type="time" {...register("time")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_STATUSES.filter((s) => s.value !== "atrasado").map(
                      (s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Lembretes</Label>
            <div className="flex flex-wrap gap-3">
              {REMINDER_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Checkbox
                    checked={reminders.includes(opt.value)}
                    onCheckedChange={() => toggleReminder(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
