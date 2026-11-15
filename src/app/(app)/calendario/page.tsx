"use client";

import { useMemo, useState } from "react";
import "temporal-polyfill/global";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import ptBrLocale from "@fullcalendar/react/locales/pt-br";
import type { DateSelectInfo, EventClickInfo } from "@fullcalendar/react";
import { toast } from "sonner";
import { ActivityFormDialog } from "@/components/activities/activity-form-dialog";
import { useSearch } from "@/components/layout/search-context";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  useActivities,
  useStudySessions,
  useSubjects,
} from "@/hooks/use-live-data";
import { ACTIVITY_TYPES } from "@/lib/constants";
import { formatDisplayDate } from "@/lib/dates";
import { matchesSearch } from "@/lib/urgency";
import { useAuth } from "@/providers/auth-provider";
import { deleteActivity, setActivityStatus } from "@/services/activities";
import type { Activity, ActivityType } from "@/types";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

type CalendarEventMeta =
  | { kind: "activity"; activity: Activity }
  | { kind: "session"; sessionId: string };

export default function CalendarioPage() {
  const { user } = useAuth();
  const { search } = useSearch();
  const subjects = useSubjects();
  const activities = useActivities();
  const sessions = useStudySessions();

  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>();
  const [viewing, setViewing] = useState<Activity | null>(null);

  const subjectMap = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  const events = useMemo(() => {
    const activityEvents = activities
      .filter((a) => {
        if (subjectFilter !== "all" && a.subjectId !== subjectFilter) return false;
        if (typeFilter !== "all" && a.type !== typeFilter) return false;
        const subject = subjectMap.get(a.subjectId)?.name ?? "";
        return matchesSearch(`${a.title} ${subject} ${a.type}`, search);
      })
      .map((a) => {
        const color = subjectMap.get(a.subjectId)?.color ?? "#0F766E";
        const start = a.time ? `${a.date}T${a.time}:00` : a.date;
        return {
          id: `activity-${a.id}`,
          title: a.title,
          start,
          allDay: !a.time,
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            kind: "activity",
            activity: a,
          } satisfies CalendarEventMeta,
        };
      });

    const sessionEvents =
      typeFilter === "all" || typeFilter === "sessao"
        ? sessions
            .filter((s) => {
              if (subjectFilter !== "all" && s.subjectId !== subjectFilter)
                return false;
              const subject = subjectMap.get(s.subjectId)?.name ?? "";
              return matchesSearch(`${s.title} ${subject}`, search);
            })
            .map((s) => {
              const color = subjectMap.get(s.subjectId)?.color ?? "#64748B";
              return {
                id: `session-${s.id}`,
                title: `Estudo: ${s.title}`,
                start: `${s.startDate}T${s.startTime}:00`,
                end: `${s.startDate}T${s.endTime}:00`,
                backgroundColor: color,
                borderColor: color,
                extendedProps: {
                  kind: "session",
                  sessionId: s.id,
                } satisfies CalendarEventMeta,
              };
            })
        : [];

    return [...activityEvents, ...sessionEvents];
  }, [activities, sessions, subjectFilter, typeFilter, subjectMap, search]);

  function handleDateSelect(info: DateSelectInfo) {
    setEditing(null);
    setDefaultDate(info.startStr.slice(0, 10));
    setFormOpen(true);
    info.view.calendar.unselect();
  }

  function handleEventClick(info: EventClickInfo) {
    const meta = info.event.extendedProps as CalendarEventMeta;
    if (meta.kind === "activity") {
      setViewing(meta.activity);
    } else {
      toast.message("Sessão de estudo", {
        description: "Edite sessões em Meu planejamento.",
      });
    }
  }

  async function removeViewing() {
    if (!user || !viewing) return;
    try {
      await deleteActivity(viewing.id, user.id);
      toast.success("Atividade excluída.");
      setViewing(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível excluir."
      );
    }
  }

  async function completeViewing() {
    if (!user || !viewing) return;
    try {
      await setActivityStatus(viewing.id, user.id, "concluido");
      toast.success("Marcada como concluída.");
      setViewing(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível atualizar."
      );
    }
  }

  function typeLabel(type: ActivityType) {
    return ACTIVITY_TYPES.find((t) => t.value === type)?.label ?? type;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Calendário
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualize atividades e sessões por dia, semana ou mês
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDefaultDate(undefined);
            setFormOpen(true);
          }}
          disabled={subjects.length === 0}
        >
          Nova atividade
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Disciplina" />
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {ACTIVITY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
              <SelectItem value="sessao">Sessões de estudo</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              classicThemePlugin,
            ]}
            locale={ptBrLocale}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            height="auto"
            selectable
            selectMirror
            dayMaxEvents
            events={events}
            select={handleDateSelect}
            eventClick={handleEventClick}
          />
        </CardContent>
      </Card>

      <ActivityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        activity={editing}
        subjects={subjects}
        defaultDate={defaultDate}
        defaultSubjectId={
          subjectFilter !== "all" ? subjectFilter : subjects[0]?.id
        }
      />

      <Dialog open={Boolean(viewing)} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
            <DialogDescription>
              {viewing && (
                <>
                  {subjectMap.get(viewing.subjectId)?.name} ·{" "}
                  {typeLabel(viewing.type)} · {formatDisplayDate(viewing.date)}
                  {viewing.time ? ` · ${viewing.time}` : ""}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {viewing?.description && (
            <p className="text-sm text-muted-foreground">{viewing.description}</p>
          )}
          <div className="flex gap-2">
            <Badge variant="outline">{viewing?.status}</Badge>
            <Badge variant="secondary">{viewing?.priority}</Badge>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => void removeViewing()}>
              Excluir
            </Button>
            {viewing && viewing.status !== "concluido" && (
              <Button variant="soft" onClick={() => void completeViewing()}>
                Concluir
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                if (!viewing) return;
                setEditing(viewing);
                setViewing(null);
                setFormOpen(true);
              }}
            >
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
