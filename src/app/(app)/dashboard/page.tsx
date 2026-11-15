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
    <div className="mx-auto max-w-7xl space-y-4 overflow-x-hidden animate-fade-up sm:space-y-6">
      <div className="hidden sm:block">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Olá, {user?.name?.split(" ")[0] ?? "estudante"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground capitalize">
          {formatLongDate(today)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <StatCard
          title="Disciplinas"
          value={filteredSubjects.length}
          icon={<BookOpen className="h-3.5 w-3.5" />}
        />
        <StatCard
          title="Pendentes"
          value={pending.length + pendingSessions.length}
          icon={<ClipboardList className="h-3.5 w-3.5" />}
        />
        <StatCard
          title="Provas 14d"
          value={upcomingExams.length}
          icon={<GraduationCap className="h-3.5 w-3.5" />}
        />
        <StatCard
          title="Concluídas"
          value={completed.length}
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acontecendo hoje</CardTitle>
            <CardDescription>Atividades e sessões de estudo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayActivities.length === 0 && todaySessions.length === 0 ? (
              <EmptyState
                className="py-8"
                title="Nada para hoje"
                description="Sem atividades ou sessões agendadas."
              />
            ) : (
              <>
                {todayActivities.map((a) => (
                  <div
                    key={a.id}
                    className="flex min-w-0 items-start justify-between gap-2 rounded-xl border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {subjectMap.get(a.subjectId)?.name} · {typeLabel(a.type)}
                        {a.time ? ` · ${a.time}` : ""}
                      </p>
                    </div>
                    <Badge variant="warning" className="shrink-0">
                      Hoje
                    </Badge>
                  </div>
                ))}
                {todaySessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex min-w-0 items-start justify-between gap-2 rounded-xl border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        Estudo · {subjectMap.get(s.subjectId)?.name} ·{" "}
                        {s.startTime}–{s.endTime}
                      </p>
                    </div>
                    <Badge
                      variant={s.status === "concluida" ? "success" : "secondary"}
                      className="shrink-0"
                    >
                      {s.status === "concluida" ? "Feita" : "Sessão"}
                    </Badge>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos compromissos</CardTitle>
            <CardDescription>
              Atividades e sessões de estudo pendentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 ? (
              <EmptyState
                className="py-8"
                title="Nenhum compromisso"
                description="Cadastre atividades na disciplina ou sessões no planejamento."
              />
            ) : (
              upcoming.map((item) => {
                const bucket = urgencyBucket(item.date);
                return (
                  <div
                    key={`${item.kind}-${item.id}`}
                    className="flex min-w-0 items-start justify-between gap-2 rounded-xl border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {subjectMap.get(item.subjectId)?.name} · {item.label} ·{" "}
                        {formatDisplayDate(item.date)}
                        {item.time ? ` · ${item.time}` : ""}
                        {daysUntil(item.date) >= 0
                          ? ` · em ${daysUntil(item.date)}d`
                          : ""}
                      </p>
                    </div>
                    <Badge
                      variant={urgencyBadgeVariant(bucket)}
                      className="shrink-0"
                    >
                      {urgencyLabels[bucket]}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Minha rotina</CardTitle>
          <CardDescription>Sessões de estudo de hoje</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {todaySessions.length === 0 ? (
            <EmptyState
              className="py-8"
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
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2.5"
              >
                <Checkbox
                  checked={s.status === "concluida"}
                  onCheckedChange={(checked) =>
                    void toggleSession(s.id, checked === true)
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
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
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
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
                <Link key={subject.id} href={`/disciplinas/${subject.id}`}>
                  {/* Mobile: compact row */}
                  <Card className="min-w-0 overflow-hidden transition hover:border-primary/40 sm:hidden">
                    <CardContent className="flex items-center gap-2.5 p-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {subject.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {total} ativ. · {progress}%
                          {nextExam
                            ? ` · ${formatDisplayDate(nextExam.date)}`
                            : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
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
    <Card className="min-w-0 overflow-hidden">
      <CardContent className="flex flex-col gap-1.5 p-2.5 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
        <div className="flex items-center gap-1.5 sm:contents">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground sm:h-10 sm:w-10 sm:rounded-xl">
            {icon}
          </div>
          <p className="min-w-0 truncate text-[11px] font-medium text-muted-foreground sm:flex-1 sm:text-sm">
            {title}
          </p>
        </div>
        <p className="text-xl font-semibold tracking-tight tabular-nums sm:ml-auto sm:text-xl">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
