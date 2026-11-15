"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Eye,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/review/rich-text-editor";
import { useSearch } from "@/components/layout/search-context";
import {
  Badge,
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
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@/components/ui";
import {
  useFlashcards,
  useReviewContents,
  useSubjects,
} from "@/hooks/use-live-data";
import { matchesSearch } from "@/lib/urgency";
import { useAuth } from "@/providers/auth-provider";
import {
  flashcardSchema,
  reviewContentSchema,
  type FlashcardInput,
  type ReviewContentInput,
} from "@/schemas/review";
import {
  createFlashcard,
  createReviewContent,
  deleteFlashcard,
  deleteReviewContent,
  updateFlashcard,
  updateReviewContent,
} from "@/services/review";
import type { Flashcard, ReviewContent } from "@/types";

export default function RevisaoPage() {
  const { user } = useAuth();
  const { search } = useSearch();
  const subjects = useSubjects();
  const contents = useReviewContents();
  const flashcards = useFlashcards();
  const [subjectFilter, setSubjectFilter] = useState("all");

  const [contentOpen, setContentOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ReviewContent | null>(null);
  const [deletingContent, setDeletingContent] = useState<ReviewContent | null>(null);

  const [cardOpen, setCardOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [deletingCard, setDeletingCard] = useState<Flashcard | null>(null);

  const [studyMode, setStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  const subjectMap = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  const filteredContents = useMemo(
    () =>
      contents.filter((c) => {
        if (subjectFilter !== "all" && c.subjectId !== subjectFilter) return false;
        const subject = subjectMap.get(c.subjectId)?.name ?? "";
        return matchesSearch(`${c.title} ${subject}`, search);
      }),
    [contents, subjectFilter, subjectMap, search]
  );

  const filteredCards = useMemo(
    () =>
      flashcards.filter((c) => {
        if (subjectFilter !== "all" && c.subjectId !== subjectFilter) return false;
        const subject = subjectMap.get(c.subjectId)?.name ?? "";
        return matchesSearch(
          `${c.question} ${c.answer} ${c.category} ${subject}`,
          search
        );
      }),
    [flashcards, subjectFilter, subjectMap, search]
  );

  const studyDeck = filteredCards;
  const currentCard = studyDeck[studyIndex];

  function startStudy() {
    if (studyDeck.length === 0) {
      toast.error("Cadastre flashcards para estudar.");
      return;
    }
    setStudyMode(true);
    setStudyIndex(0);
    setRevealed(false);
    setStats({ correct: 0, wrong: 0 });
  }

  function markAnswer(correct: boolean) {
    setStats((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
    }));
    setRevealed(false);
    if (studyIndex + 1 >= studyDeck.length) {
      toast.success(
        `Sessão finalizada: ${stats.correct + (correct ? 1 : 0)} certas, ${
          stats.wrong + (correct ? 0 : 1)
        } erradas.`
      );
      setStudyMode(false);
      return;
    }
    setStudyIndex((i) => i + 1);
  }

  async function removeContent() {
    if (!user || !deletingContent) return;
    try {
      await deleteReviewContent(deletingContent.id, user.id);
      toast.success("Conteúdo excluído.");
      setDeletingContent(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível excluir."
      );
    }
  }

  async function removeCard() {
    if (!user || !deletingCard) return;
    try {
      await deleteFlashcard(deletingCard.id, user.id);
      toast.success("Flashcard excluído.");
      setDeletingCard(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível excluir."
      );
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Central de revisão
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conteúdos ricos e flashcards para fixar a matéria
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Disciplina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="soft" onClick={startStudy} disabled={studyDeck.length === 0}>
            <Sparkles className="h-4 w-4" />
            Modo estudo
          </Button>
        </div>
      </div>

      {studyMode && currentCard ? (
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Modo estudo</CardTitle>
              <Badge variant="outline">
                {studyIndex + 1}/{studyDeck.length}
              </Badge>
            </div>
            <CardDescription>
              Certas: {stats.correct} · Erradas: {stats.wrong} ·{" "}
              {subjectMap.get(currentCard.subjectId)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-muted/60 p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pergunta
              </p>
              <p className="mt-2 text-lg font-medium">{currentCard.question}</p>
            </div>
            {revealed ? (
              <div className="rounded-2xl border border-primary/20 bg-accent/40 p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Resposta
                </p>
                <p className="mt-2 text-base">{currentCard.answer}</p>
              </div>
            ) : (
              <Button onClick={() => setRevealed(true)} className="w-full sm:w-auto">
                <Eye className="h-4 w-4" />
                Revelar resposta
              </Button>
            )}
            {revealed && (
              <div className="flex flex-wrap gap-2">
                <Button variant="soft" onClick={() => markAnswer(true)}>
                  <Check className="h-4 w-4" />
                  Acertei
                </Button>
                <Button variant="outline" onClick={() => markAnswer(false)}>
                  <X className="h-4 w-4" />
                  Errei
                </Button>
                <Button variant="ghost" onClick={() => setStudyMode(false)}>
                  Sair
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="contents">
        <TabsList>
          <TabsTrigger value="contents">Conteúdos</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
        </TabsList>

        <TabsContent value="contents" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingContent(null);
                setContentOpen(true);
              }}
              disabled={subjects.length === 0}
            >
              <Plus className="h-4 w-4" />
              Novo conteúdo
            </Button>
          </div>
          {filteredContents.length === 0 ? (
            <EmptyState
              title="Nenhum conteúdo"
              description="Crie anotações ricas para revisar depois."
            />
          ) : (
            <div className="space-y-3">
              {filteredContents.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription>
                          {subjectMap.get(item.subjectId)?.name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={item.reviewed ? "success" : "secondary"}>
                          {item.reviewed ? "Revisado" : "Pendente"}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingContent(item);
                            setContentOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeletingContent(item)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose prose-sm dark:prose-invert line-clamp-4 max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="flashcards" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingCard(null);
                setCardOpen(true);
              }}
              disabled={subjects.length === 0}
            >
              <Plus className="h-4 w-4" />
              Novo flashcard
            </Button>
          </div>
          {filteredCards.length === 0 ? (
            <EmptyState
              title="Nenhum flashcard"
              description="Crie perguntas e respostas para o modo estudo."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredCards.map((card) => (
                <Card key={card.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {card.category}
                        </Badge>
                        <CardTitle className="text-base">{card.question}</CardTitle>
                        <CardDescription>
                          {subjectMap.get(card.subjectId)?.name}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingCard(card);
                            setCardOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeletingCard(card)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {card.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ReviewContentDialog
        open={contentOpen}
        onOpenChange={setContentOpen}
        content={editingContent}
        subjects={subjects}
        defaultSubjectId={subjectFilter !== "all" ? subjectFilter : undefined}
      />

      <FlashcardDialog
        open={cardOpen}
        onOpenChange={setCardOpen}
        card={editingCard}
        subjects={subjects}
        defaultSubjectId={subjectFilter !== "all" ? subjectFilter : undefined}
      />

      <Dialog
        open={Boolean(deletingContent)}
        onOpenChange={(o) => !o && setDeletingContent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conteúdo?</DialogTitle>
            <DialogDescription>
              Remover &quot;{deletingContent?.title}&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingContent(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void removeContent()}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingCard)}
        onOpenChange={(o) => !o && setDeletingCard(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir flashcard?</DialogTitle>
            <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCard(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void removeCard()}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewContentDialog({
  open,
  onOpenChange,
  content,
  subjects,
  defaultSubjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ReviewContent | null;
  subjects: { id: string; name: string }[];
  defaultSubjectId?: string;
}) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewContentInput>({
    resolver: zodResolver(reviewContentSchema),
    defaultValues: {
      subjectId: "",
      title: "",
      content: "",
      reviewed: false,
    },
  });

  const html = watch("content");

  useEffect(() => {
    if (!open) return;
    reset(
      content
        ? {
            subjectId: content.subjectId,
            title: content.title,
            content: content.content,
            reviewed: content.reviewed,
          }
        : {
            subjectId: defaultSubjectId ?? subjects[0]?.id ?? "",
            title: "",
            content: "<p></p>",
            reviewed: false,
          }
    );
  }, [open, content, reset, defaultSubjectId, subjects]);

  async function onSubmit(data: ReviewContentInput) {
    if (!user) return;
    setSubmitting(true);
    try {
      if (content) {
        await updateReviewContent(content.id, user.id, data);
        toast.success("Conteúdo atualizado.");
      } else {
        await createReviewContent(user.id, data);
        toast.success("Conteúdo criado.");
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {content ? "Editar conteúdo" : "Novo conteúdo"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Disciplina</Label>
            <Controller
              control={control}
              name="subjectId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
            <Label htmlFor="review-title">Título</Label>
            <Input id="review-title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Conteúdo</Label>
            <RichTextEditor
              value={html}
              onChange={(v) => setValue("content", v, { shouldValidate: true })}
            />
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content.message}</p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Controller
              control={control}
              name="reviewed"
              render={({ field }) => (
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            Já revisei este conteúdo
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FlashcardDialog({
  open,
  onOpenChange,
  card,
  subjects,
  defaultSubjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Flashcard | null;
  subjects: { id: string; name: string }[];
  defaultSubjectId?: string;
}) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FlashcardInput>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      subjectId: "",
      question: "",
      answer: "",
      category: "Geral",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      card
        ? {
            subjectId: card.subjectId,
            question: card.question,
            answer: card.answer,
            category: card.category,
          }
        : {
            subjectId: defaultSubjectId ?? subjects[0]?.id ?? "",
            question: "",
            answer: "",
            category: "Geral",
          }
    );
  }, [open, card, reset, defaultSubjectId, subjects]);

  async function onSubmit(data: FlashcardInput) {
    if (!user) return;
    setSubmitting(true);
    try {
      if (card) {
        await updateFlashcard(card.id, user.id, data);
        toast.success("Flashcard atualizado.");
      } else {
        await createFlashcard(user.id, data);
        toast.success("Flashcard criado.");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card ? "Editar flashcard" : "Novo flashcard"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Disciplina</Label>
            <Controller
              control={control}
              name="subjectId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fc-category">Categoria</Label>
            <Input id="fc-category" {...register("category")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fc-q">Pergunta</Label>
            <Textarea id="fc-q" rows={3} {...register("question")} />
            {errors.question && (
              <p className="text-xs text-destructive">{errors.question.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fc-a">Resposta</Label>
            <Textarea id="fc-a" rows={3} {...register("answer")} />
            {errors.answer && (
              <p className="text-xs text-destructive">{errors.answer.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
