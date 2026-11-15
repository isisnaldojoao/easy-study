"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SUBJECT_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { subjectSchema, type SubjectInput } from "@/schemas/subject";
import { createSubject, updateSubject } from "@/services/subjects";
import type { Subject } from "@/types";
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
  Textarea,
} from "@/components/ui";

interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject | null;
}

export function SubjectFormDialog({
  open,
  onOpenChange,
  subject,
}: SubjectFormDialogProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(subject);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      description: "",
      color: SUBJECT_COLORS[0],
      notes: "",
    },
  });

  const color = watch("color");

  useEffect(() => {
    if (!open) return;
    reset(
      subject
        ? {
            name: subject.name,
            description: subject.description,
            color: subject.color,
            notes: subject.notes,
          }
        : {
            name: "",
            description: "",
            color: SUBJECT_COLORS[0],
            notes: "",
          }
    );
  }, [open, subject, reset]);

  async function onSubmit(data: SubjectInput) {
    if (!user) return;
    setSubmitting(true);
    try {
      if (isEdit && subject) {
        await updateSubject(subject.id, user.id, data);
        toast.success("Disciplina atualizada.");
      } else {
        await createSubject(user.id, data);
        toast.success("Disciplina criada.");
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar disciplina" : "Nova disciplina"}
          </DialogTitle>
          <DialogDescription>
            Organize suas matérias com nome, descrição e cor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject-name">Nome</Label>
            <Input id="subject-name" placeholder="Ex.: Cálculo I" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subject-description">Descrição</Label>
            <Textarea
              id="subject-description"
              rows={3}
              placeholder="Opcional"
              {...register("description")}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Cor ${c}`}
                  onClick={() => setValue("color", c, { shouldValidate: true })}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition",
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-xs text-destructive">{errors.color.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subject-notes">Anotações</Label>
            <Textarea
              id="subject-notes"
              rows={3}
              placeholder="Notas gerais da disciplina"
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
