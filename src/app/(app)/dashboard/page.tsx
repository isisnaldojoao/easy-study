"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { useSearch } from "@/components/layout/search-context";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  EmptyState,
  Progress,
} from "@/components/ui";
import {
  useActivities,
  useStudySessions,
  useSubjects,
} from "@/hooks/use-live-data";
import {
  addDaysISO,
  daysUntil,
  formatDisplayDate,
  formatLongDate,
  todayISO,
  urgencyBucket,
  urgencyLabels,
} from "@/lib/dates";
import { matchesSearch, urgencyBadgeVariant } from "@/lib/urgency";
import { ACTIVITY_TYPES } from "@/lib/constants";
import { useAuth } from "@/providers/auth-provider";
import { setStudySessionStatus } from "@/services/study-sessions";

export default function DashboardPage() {
  const { user } = useAuth();
  const { search } = useSearch();
  const subjects = useSubjects();
  const activities = useActivities();
  const sessions = useStudySessions();
  const today = todayISO();
  const in14 = addDaysISO(today, 14);

  const subjectMap = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  const filteredActivities = useMemo(
    () =>
      activities.filter((a) => {
        const subject = subjectMap.get(a.subjectId)?.name ?? "";
        return matchesSearch(`${a.title} ${subject} ${a.type}`, search);
      }),
    [activities, subjectMap, search]
  );

  const filteredSessions = useMemo(
    () =>
      sessions.filter((s) => {
        const subject = subjectMap.get(s.subjectId)?.name ?? "";
        return matchesSearch(`${s.title} ${subject}`, search);
      }),
    [sessions, subjectMap, search]
  );

  const filteredSubjects = useMemo(
    () =>
      subjects.filter((s) =>
        matchesSearch(`${s.name} ${s.description}`, search)
      ),
    [subjects, search]
  );

  const pending = filteredActivities.filter((a) => a.status !== "concluido");
  const completed = filteredActivities.filter((a) => a.status === "concluido");
  const pendingSessions = filteredSessions.filter((s) => s.status !== "concluida");
  const upcomingExams = filteredActivities.filter(
    (a) =>
      (a.type === "prova" || a.type === "trabalho") &&
      a.status !== "concluido" &&
      a.date >= today &&
      a.date <= in14
  );

  const todayActivities = filteredActivities.filter((a) => a.date === today);
  const todaySessions = filteredSessions.filter((s) => s.startDate === today);

  function typeLabel(type: string) {
    return ACTIVITY_TYPES.find((t) => t.value === type)?.label ?? type;
  }

  type UpcomingItem =
    | {
        kind: "activity";
        id: string;
        title: string;
        subjectId: string;
        date: string;
        time?: string;
        label: string;
      }
    | {
        kind: "session";
        id: string;
        title: string;
        subjectId: string;
        date: string;
        time?: string;
        label: string;
      };

  const upcoming: UpcomingItem[] = [
    ...pending
      .filter((a) => a.date >= today)
      .map((a) => ({
        kind: "activity" as const,
        id: a.id,
        title: a.title,
        subjectId: a.subjectId,
        date: a.date,
        time: a.time,
        label: typeLabel(a.type),
      })),
    ...pendingSessions
      .filter((s) => s.startDate >= today)
      .map((s) => ({
        kind: "session" as const,
        id: s.id,
        title: s.title,
        subjectId: s.subjectId,
        date: s.startDate,
        time: s.startTime,
        label: "Sessão de estudo",
      })),
  ]
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.time ?? "").localeCompare(b.time ?? "")
    )
    .slice(0, 10);

  async function toggleSession(id: string, done: boolean) {
    if (!user) return;
    try {
      await setStudySessionStatus(id, user.id, done ? "concluida" : "pendente");
      toast.success(done ? "Sessão concluída." : "Sessão reaberta.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível atualizar."
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 animate-fade-up sm:space-y-6">
      <div className="hidden sm:block">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Olá, {user?.name?.split(" ")[0] ?? "estudante"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground capitalize">
          {formatLongDate(today)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 [&>*]:min-w-0 xl:grid-cols-4">
        <StatCard
          title="Disciplinas"
          value={filteredSubjects.length}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Pendentes"
          value={pending.length + pendingSessions.length}
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <StatCard
          title="Provas/trabalhos (14d)"
          value={upcomingExams.length}
          icon={<GraduationCap className="h-4 w-4" />}
        />
        <StatCard
          title="Concluídas"
          value={completed.length}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      <div className="grid w-full gap-3 [&>*]:min-w-0 sm:gap-4 lg:grid-cols-2 lg:gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-0.5 p-3 sm:p-4">
            <CardTitle className="text-base sm:text-lg">Acontecendo hoje</CardTitle>
            <CardDescription className="hidden sm:block">
              Atividades e sessões de estudo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0 sm:space-y-3 sm:p-4 sm:pt-0">
            {todayActivities.length === 0 && todaySessions.length === 0 ? (
              <EmptyState
                className="py-6 sm:py-8"
                title="Nada para hoje"
                description="Sem atividades ou sessões agendadas."
              />
            ) : (
              <>
                {todayActivities.map((a) => (
                  <div
                    key={a.id}
                    className="flex min-w-0 items-center gap-2 rounded-lg border border-border px-2.5 py-2"
                  >
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                        {subjectMap.get(a.subjectId)?.name} · {typeLabel(a.type)}
                        {a.time ? ` · ${a.time}` : ""}
                      </p>
                    </div>
                    <Badge variant="warning" className="shrink-0 text-[10px]">
                      Hoje
                    </Badge>
                  </div>
                ))}
                {todaySessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex min-w-0 items-center gap-2 rounded-lg border border-border px-2.5 py-2"
                  >
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{s.title}</p>
                      <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                        Estudo · {subjectMap.get(s.subjectId)?.name} ·{" "}
                        {s.startTime}–{s.endTime}
                      </p>
                    </div>
                    <Badge
                      variant={s.status === "concluida" ? "success" : "secondary"}
                      className="shrink-0 text-[10px]"
                    >
                      {s.status === "concluida" ? "Feita" : "Sessão"}
                    </Badge>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="space-y-0.5 p-3 sm:p-4">
            <CardTitle className="text-base sm:text-lg">
              Próximos compromissos
            </CardTitle>
            <CardDescription className="hidden sm:block">
              Atividades e sessões de estudo pendentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0 sm:space-y-3 sm:p-4 sm:pt-0">
            {upcoming.length === 0 ? (
              <EmptyState
                className="py-6 sm:py-8"
                title="Nenhum compromisso"
                description="Cadastre atividades na disciplina ou sessões no planejamento."
              />
            ) : (
              upcoming.map((item) => {
                const bucket = urgencyBucket(item.date);
                return (
                  <div
                    key={`${item.kind}-${item.id}`}
                    className="flex min-w-0 items-center gap-2 rounded-lg border border-border px-2.5 py-2"
                  >
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                        {subjectMap.get(item.subjectId)?.name} · {item.label} ·{" "}
                        {formatDisplayDate(item.date)}
                        {item.time ? ` · ${item.time}` : ""}
                        {daysUntil(item.date) >= 0
                          ? ` · em ${daysUntil(item.date)}d`
                          : ""}
                      </p>
                    </div>
                    <Badge variant={urgencyBadgeVariant(bucket)}>
                      {urgencyLabels[bucket]}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-0.5 p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg">Minha rotina</CardTitle>
          <CardDescription className="hidden sm:block">
            Sessões de estudo de hoje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0 sm:space-y-3 sm:p-4 sm:pt-0">
          {todaySessions.length === 0 ? (
            <EmptyState
              className="py-6 sm:py-8"
              title="Sem rotina hoje"
              description="Planeje sessões em Meu planejamento."
              action={
                <Link
                  href="/planejamento"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Ir para planejamento
                </Link>
              }
            />
          ) : (
            todaySessions.map((s) => (
              <label
                key={s.id}
                className="flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-border px-2.5 py-2"
              >
                <Checkbox
                  checked={s.status === "concluida"}
                  onCheckedChange={(checked) =>
                    void toggleSession(s.id, checked === true)
                  }
                />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                    {subjectMap.get(s.subjectId)?.name} · {s.startTime}–{s.endTime}
                  </p>
                </div>
              </label>
            ))
          )}
        </CardContent>
      </Card>

      <div>
        <div className="mb-2 flex items-center justify-between sm:mb-3">
          <h2 className="text-base font-semibold sm:text-lg">Minhas disciplinas</h2>
          <Link
            href="/disciplinas"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>
        {filteredSubjects.length === 0 ? (
          <EmptyState
            title="Nenhuma disciplina"
            description="Comece cadastrando suas matérias."
            action={
              <Link
                href="/disciplinas"
                className="text-sm font-medium text-primary hover:underline"
              >
                Cadastrar disciplina
              </Link>
            }
          />
        ) : (
          <div className="grid w-full gap-2 [&>*]:min-w-0 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {filteredSubjects.map((subject) => {
              const subjectActs = activities.filter(
                (a) => a.subjectId === subject.id
              );
              const done = subjectActs.filter((a) => a.status === "concluido").length;
              const total = subjectActs.length;
              const progress = total === 0 ? 0 : Math.round((done / total) * 100);
              const nextExam = subjectActs
                .filter(
                  (a) =>
                    (a.type === "prova" || a.type === "trabalho") &&
                    a.status !== "concluido" &&
                    a.date >= today
                )
                .sort((a, b) => a.date.localeCompare(b.date))[0];

              return (
                <Link
                  key={subject.id}
                  href={`/disciplinas/${subject.id}`}
                  className="block min-w-0 w-full"
                >
                  {/* Mobile: compact row */}
                  <Card className="overflow-hidden shadow-none transition hover:border-primary/40 sm:hidden">
                    <CardContent className="flex min-w-0 items-center gap-2 overflow-hidden p-3">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium leading-tight">
                          {subject.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {total} ativ.
                          {nextExam
                            ? ` · ${formatDisplayDate(nextExam.date)}`
                            : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {progress}%
                      </span>
                    </CardContent>
                  </Card>

                  {/* Desktop / tablet */}
                  <Card className="hidden h-full transition hover:border-primary/40 sm:block">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-1 h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <div className="min-w-0">
                          <CardTitle className="text-base">{subject.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {subject.description || "Sem descrição"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{total} atividades</span>
                        <span>{progress}% concluído</span>
                      </div>
                      <Progress value={progress} />
                      <p className="text-xs text-muted-foreground">
                        Próxima prova/trabalho:{" "}
                        {nextExam
                          ? `${nextExam.title} · ${formatDisplayDate(nextExam.date)}`
                          : "—"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground sm:h-11 sm:w-11">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
