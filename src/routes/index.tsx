import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/tracker/shell";
import { TicketDetail } from "@/components/tracker/ticket-detail";
import {
  CategoryChip,
  PriorityFlag,
  ProgressMeter,
  SeverityChip,
  StatusChip,
  dueLabel,
} from "@/components/tracker/badges";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { recurrenceLabel, useTracker } from "@/lib/tracker/store";
import { PRIORITIES, type Ticket } from "@/lib/tracker/types";
import { ArrowDown, ArrowUp, Check, RepeatIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LifeDesk — Habit & Hobby Ticket Board" },
      {
        name: "description",
        content:
          "Track habits, chores and hobbies like a bug tracker: category ticket IDs, P1–P5 escalation, goal progress, auto-reopening schedules and a growth journal.",
      },
      { property: "og:title", content: "LifeDesk — Habit & Hobby Ticket Board" },
      {
        property: "og:description",
        content:
          "A ticketing system for your life: FIT-0001, MNY-0002, P1–P5 escalation, recurring reopen logic and per-ticket journals.",
      },
    ],
  }),
  component: Board,
});

type SortKey = "key" | "priority" | "severity" | "status" | "progress" | "due" | "category";
type Focus = "open" | "p1" | "near" | "overdue" | "blocked";

const FOCUS_LABEL: Record<Focus, string> = {
  open: "Open tickets",
  p1: "P1 escalations",
  near: "Near goal (≥75%)",
  overdue: "Overdue",
  blocked: "Blocked",
};

function matchesFocus(t: Ticket, focus: Focus) {
  switch (focus) {
    case "open":
      return t.status !== "done";
    case "p1":
      return t.status !== "done" && t.priority === "P1";
    case "near":
      return t.status !== "done" && t.progress / Math.max(1, t.target) >= 0.75;
    case "overdue":
      return t.status !== "done" && !!t.dueAt && new Date(t.dueAt).getTime() < Date.now();
    case "blocked":
      return t.status === "blocked";
  }
}

function Board() {
  const { data, ready, resolveTicket } = useTracker();
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [prio, setPrio] = useState<string>("all");
  const [showResolved, setShowResolved] = useState(true);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "priority", dir: 1 });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = data.tickets.filter((t) => {
      if (focus && !matchesFocus(t, focus)) return false;
      if (cat !== "all" && t.category !== cat) return false;
      if (prio !== "all" && t.priority !== prio) return false;
      if (!showResolved && t.status === "done") return false;
      if (!q) return true;
      return (
        t.key.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
      );
    });
    const sevRank = { blocker: 0, major: 1, minor: 2, trivial: 3 } as const;
    const statusRank = { blocked: 0, in_progress: 1, open: 2, done: 3 } as const;
    const val = (t: Ticket) => {
      switch (sort.key) {
        case "key":
          return t.key;
        case "priority":
          return t.priority;
        case "severity":
          return sevRank[t.severity];
        case "status":
          return statusRank[t.status];
        case "category":
          return t.category;
        case "progress":
          return t.progress / Math.max(1, t.target);
        case "due":
          return t.dueAt ? new Date(t.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      }
    };
    return [...filtered].sort((a, b) => {
      const av = val(a);
      const bv = val(b);
      if (av === bv) return a.key.localeCompare(b.key);
      return (av > bv ? 1 : -1) * sort.dir;
    });
  }, [data.tickets, query, cat, prio, showResolved, focus, sort]);

  const counts: Record<Focus, number> = {
    open: data.tickets.filter((t) => matchesFocus(t, "open")).length,
    p1: data.tickets.filter((t) => matchesFocus(t, "p1")).length,
    near: data.tickets.filter((t) => matchesFocus(t, "near")).length,
    overdue: data.tickets.filter((t) => matchesFocus(t, "overdue")).length,
    blocked: data.tickets.filter((t) => matchesFocus(t, "blocked")).length,
  };
  const filtersActive =
    !!focus || cat !== "all" || prio !== "all" || !showResolved || query.trim() !== "";

  function clearFilters() {
    setFocus(null);
    setCat("all");
    setPrio("all");
    setShowResolved(true);
    setQuery("");
  }

  function toggleFocus(next: Focus) {
    setFocus((f) => (f === next ? null : next));
    if (next !== "open") setShowResolved(true);
  }

  const ticket = data.tickets.find((t) => t.id === selected) ?? null;

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  }

  return (
    <Shell>
      <h1 className="text-xl font-semibold tracking-tight">Active queue</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every habit, chore and hobby is a ticket. Resolve it, and it reopens on schedule.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(["open", "p1", "near", "overdue", "blocked"] as Focus[]).map((f) => (
          <Stat
            key={f}
            label={FOCUS_LABEL[f]}
            value={ready ? counts[f] : 0}
            tone={
              f === "p1"
                ? "var(--p1)"
                : f === "near"
                  ? "var(--success)"
                  : f === "overdue"
                    ? "var(--warning)"
                    : f === "blocked"
                      ? "var(--destructive)"
                      : undefined
            }
            active={focus === f}
            onClick={() => toggleFocus(f)}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search key, summary or #tag…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8 w-56 font-mono text-xs"
        />
        <FilterGroup
          value={cat}
          onChange={setCat}
          options={[
            { value: "all", label: "All areas" },
            ...data.categories.map((c) => ({ value: c.id, label: c.id })),
          ]}
        />
        <FilterGroup
          value={prio}
          onChange={setPrio}
          options={[
            { value: "all", label: "All P" },
            ...PRIORITIES.map((p) => ({ value: p, label: p })),
          ]}
        />
        <Button
          size="sm"
          variant={showResolved ? "secondary" : "outline"}
          className="h-8"
          onClick={() => setShowResolved((v) => !v)}
        >
          {showResolved ? "Resolved: shown" : "Resolved: hidden"}
        </Button>
        {filtersActive && (
          <Button size="sm" variant="ghost" className="h-8" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="mt-3 font-mono text-[11px] text-muted-foreground">
        Showing {ready ? rows.length : 0} of {ready ? data.tickets.length : 0} tickets
        {focus ? ` · focus: ${FOCUS_LABEL[focus]}` : ""}
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <Th onClick={() => toggleSort("key")} sort={sort} k="key">
                ID
              </Th>
              <Th onClick={() => toggleSort("priority")} sort={sort} k="priority">
                Esc.
              </Th>
              <th className="px-3 py-2 font-medium">Summary</th>
              <Th onClick={() => toggleSort("category")} sort={sort} k="category">
                Area
              </Th>
              <Th onClick={() => toggleSort("status")} sort={sort} k="status">
                Status
              </Th>
              <Th onClick={() => toggleSort("severity")} sort={sort} k="severity">
                Severity
              </Th>
              <Th onClick={() => toggleSort("progress")} sort={sort} k="progress">
                Goal
              </Th>
              <Th onClick={() => toggleSort("due")} sort={sort} k="due">
                Cycle
              </Th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {(ready ? rows : []).map((t) => {
              const due = dueLabel(t);
              const project = data.projects.find((p) => p.id === t.projectId);
              return (
                <tr
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-accent/40"
                >
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold text-primary">
                    {t.key}
                  </td>
                  <td className="px-3 py-2.5">
                    <PriorityFlag priority={t.priority} />
                  </td>
                  <td className="max-w-[280px] px-3 py-2.5">
                    <div className="truncate font-medium">{t.title}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                      {project ? <span className="truncate">↳ {project.name}</span> : null}
                      {t.tags.slice(0, 2).map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <CategoryChip category={t.category} />
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusChip status={t.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <SeverityChip severity={t.severity} />
                  </td>
                  <td className="px-3 py-2.5">
                    <ProgressMeter ticket={t} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <RepeatIcon className="size-3 text-muted-foreground" />
                      {recurrenceLabel(t.recurrence)}
                    </div>
                    <div
                      className="font-mono text-[10px]"
                      style={{
                        color:
                          due.tone === "bad"
                            ? "var(--destructive)"
                            : due.tone === "warn"
                              ? "var(--warning)"
                              : "var(--muted-foreground)",
                      }}
                    >
                      {due.text}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {t.status !== "done" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        title="Mark goal achieved"
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveTicket(t.id);
                        }}
                      >
                        <Check className="size-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
            {ready && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  No tickets match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TicketDetail ticket={ticket} onClose={() => setSelected(null)} />
    </Shell>
  );
}

function Stat({
  label,
  value,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone?: string | undefined;
  active?: boolean | undefined;
  onClick?: (() => void) | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "rounded-md border bg-card p-3 text-left transition-colors hover:bg-accent/40 " +
        (active ? "border-primary bg-accent/30 ring-1 ring-primary/40" : "border-border")
      }
      style={active && tone ? { borderColor: tone } : undefined}
    >
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold" style={{ color: tone }}>
        {value}
      </div>
    </button>
  );
}

function FilterGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-border">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={
            "px-2.5 py-1.5 font-mono text-[11px] transition-colors " +
            (value === o.value
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-accent")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Th({
  children,
  onClick,
  sort,
  k,
}: {
  children: React.ReactNode;
  onClick: () => void;
  sort: { key: SortKey; dir: 1 | -1 };
  k: SortKey;
}) {
  const active = sort.key === k;
  return (
    <th className="px-3 py-2 font-medium">
      <button
        onClick={onClick}
        className={
          "inline-flex items-center gap-1 " + (active ? "text-primary" : "hover:text-foreground")
        }
      >
        {children}
        {active &&
          (sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
      </button>
    </th>
  );
}
