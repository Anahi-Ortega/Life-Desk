import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_CATEGORIES,
  type Category,
  type CategoryId,
  type Project,
  type Recurrence,
  type Ticket,
  type TrackerData,
} from "./types";
import { seedData } from "./seed";

const STORAGE_KEY = "life-tracker.v1";

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function recurrenceDays(r: Recurrence): number | null {
  switch (r.mode) {
    case "daily":
      return 1;
    case "weekly":
      return 7;
    case "monthly":
      return 30;
    case "custom":
      return Math.max(1, r.intervalDays || 1);
    default:
      return null;
  }
}

export function recurrenceLabel(r: Recurrence) {
  const d = recurrenceDays(r);
  if (!d) return "One-off";
  if (r.mode === "custom") return `Every ${d}d`;
  return r.mode.charAt(0).toUpperCase() + r.mode.slice(1);
}

function addDays(from: Date, days: number) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Backfill fields added after the first release so old saved data keeps working. */
function migrate(data: TrackerData): TrackerData {
  const categories =
    Array.isArray(data.categories) && data.categories.length
      ? data.categories
      : DEFAULT_CATEGORIES.map((c) => ({ ...c }));
  const known = new Set(categories.map((c) => c.id));
  // any ticket pointing at a category that no longer exists gets one restored
  const extra: Category[] = [];
  for (const t of data.tickets ?? []) {
    if (!known.has(t.category)) {
      known.add(t.category);
      extra.push({ id: t.category, label: t.category, colorVar: "var(--muted-foreground)" });
    }
  }
  const all = [...categories, ...extra];
  const counters = { ...(data.counters ?? {}) };
  for (const c of all) if (typeof counters[c.id] !== "number") counters[c.id] = 0;
  return { ...data, categories: all, counters };
}

/** Reopen any resolved recurring tickets whose schedule has come due. */
function runReopenCycle(data: TrackerData): TrackerData {
  const now = Date.now();
  let changed = false;
  const tickets = data.tickets.map((t) => {
    if (t.status !== "done" || !t.reopenAt) return t;
    if (new Date(t.reopenAt).getTime() > now) return t;
    changed = true;
    const days = recurrenceDays(t.recurrence) ?? 1;
    return {
      ...t,
      status: "open" as const,
      progress: 0,
      cycles: t.cycles + 1,
      dueAt: addDays(new Date(), days),
      reopenAt: null,
      updatedAt: new Date().toISOString(),
      journal: [
        {
          id: uid(),
          at: new Date().toISOString(),
          body: `Auto-reopened by ${recurrenceLabel(t.recurrence).toLowerCase()} schedule — cycle #${t.cycles + 1}.`,
          system: true,
        },
        ...t.journal,
      ],
    };
  });
  return changed ? { ...data, tickets } : data;
}

interface TrackerContextValue {
  data: TrackerData;
  ready: boolean;
  createTicket: (input: {
    title: string;
    category: CategoryId;
    description?: string;
    priority: Ticket["priority"];
    severity: Ticket["severity"];
    projectId: string | null;
    tags: string[];
    target: number;
    unit: string;
    recurrence: Recurrence;
  }) => Ticket;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;
  resolveTicket: (id: string) => void;
  reopenTicket: (id: string) => void;
  deleteTicket: (id: string) => void;
  addNote: (id: string, body: string) => void;
  addProject: (p: Omit<Project, "id">) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTag: (tag: string) => void;
  renameTag: (from: string, to: string) => void;
  deleteTag: (tag: string) => void;
  addCategory: (input: { id: string; label: string; colorVar: string }) => string | null;
  updateCategory: (id: CategoryId, patch: Partial<Omit<Category, "id">>) => void;
  deleteCategory: (id: CategoryId) => void;
  categoryMeta: (id: CategoryId) => Category;
}

const TrackerContext = createContext<TrackerContextValue | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TrackerData>(() => seedData());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let loaded: TrackerData | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw) as TrackerData;
    } catch {
      loaded = null;
    }
    setData(runReopenCycle(migrate(loaded ?? seedData())));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable */
    }
  }, [data, ready]);

  const mutate = useCallback((fn: (d: TrackerData) => TrackerData) => {
    setData((d) => fn(d));
  }, []);

  const patchTicket = useCallback(
    (id: string, fn: (t: Ticket) => Ticket) =>
      mutate((d) => ({
        ...d,
        tickets: d.tickets.map((t) => (t.id === id ? fn(t) : t)),
      })),
    [mutate],
  );

  const value = useMemo<TrackerContextValue>(() => {
    return {
      data,
      ready,
      createTicket: (input) => {
        const now = new Date().toISOString();
        const next = (data.counters[input.category] ?? 0) + 1;
        const days = recurrenceDays(input.recurrence);
        const ticket: Ticket = {
          id: uid(),
          key: `${input.category}-${String(next).padStart(4, "0")}`,
          category: input.category,
          title: input.title,
          description: input.description ?? "",
          priority: input.priority,
          severity: input.severity,
          status: "open",
          projectId: input.projectId,
          tags: input.tags,
          progress: 0,
          target: Math.max(1, input.target),
          unit: input.unit || "steps",
          recurrence: input.recurrence,
          reopenAt: null,
          dueAt: days ? addDays(new Date(), days) : null,
          createdAt: now,
          updatedAt: now,
          cycles: 1,
          journal: [{ id: uid(), at: now, body: "Ticket opened.", system: true }],
        };
        mutate((d) => ({
          ...d,
          tickets: [ticket, ...d.tickets],
          counters: { ...d.counters, [input.category]: next },
          tags: Array.from(new Set([...d.tags, ...input.tags])),
        }));
        return ticket;
      },
      updateTicket: (id, patch) =>
        patchTicket(id, (t) => ({ ...t, ...patch, updatedAt: new Date().toISOString() })),
      resolveTicket: (id) =>
        patchTicket(id, (t) => {
          const days = recurrenceDays(t.recurrence);
          const now = new Date();
          return {
            ...t,
            status: "done",
            progress: t.target,
            updatedAt: now.toISOString(),
            reopenAt: days ? addDays(now, days) : null,
            journal: [
              {
                id: uid(),
                at: now.toISOString(),
                body: days
                  ? `Goal achieved. Scheduled to reopen in ${days} day${days > 1 ? "s" : ""}.`
                  : "Goal achieved. Closed permanently.",
                system: true,
              },
              ...t.journal,
            ],
          };
        }),
      reopenTicket: (id) =>
        patchTicket(id, (t) => ({
          ...t,
          status: "open",
          progress: 0,
          reopenAt: null,
          updatedAt: new Date().toISOString(),
          journal: [
            { id: uid(), at: new Date().toISOString(), body: "Reopened manually.", system: true },
            ...t.journal,
          ],
        })),
      deleteTicket: (id) => mutate((d) => ({ ...d, tickets: d.tickets.filter((t) => t.id !== id) })),
      addNote: (id, body) =>
        patchTicket(id, (t) => ({
          ...t,
          updatedAt: new Date().toISOString(),
          journal: [{ id: uid(), at: new Date().toISOString(), body }, ...t.journal],
        })),
      addProject: (p) => mutate((d) => ({ ...d, projects: [...d.projects, { ...p, id: uid() }] })),
      updateProject: (id, patch) =>
        mutate((d) => ({
          ...d,
          projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deleteProject: (id) =>
        mutate((d) => ({
          ...d,
          projects: d.projects.filter((p) => p.id !== id),
          tickets: d.tickets.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)),
        })),
      addTag: (tag) =>
        mutate((d) =>
          !tag.trim() || d.tags.includes(tag.trim())
            ? d
            : { ...d, tags: [...d.tags, tag.trim()] },
        ),
      renameTag: (from, to) =>
        mutate((d) => ({
          ...d,
          tags: d.tags.map((t) => (t === from ? to.trim() : t)),
          tickets: d.tickets.map((t) => ({
            ...t,
            tags: t.tags.map((x) => (x === from ? to.trim() : x)),
          })),
        })),
      deleteTag: (tag) =>
        mutate((d) => ({
          ...d,
          tags: d.tags.filter((t) => t !== tag),
          tickets: d.tickets.map((t) => ({ ...t, tags: t.tags.filter((x) => x !== tag) })),
        })),
      addCategory: ({ id, label, colorVar }) => {
        const code = id.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
        if (!code || data.categories.some((c) => c.id === code)) return null;
        mutate((d) => ({
          ...d,
          categories: [...d.categories, { id: code, label: label.trim() || code, colorVar }],
          counters: { ...d.counters, [code]: d.counters[code] ?? 0 },
        }));
        return code;
      },
      updateCategory: (id, patch) =>
        mutate((d) => ({
          ...d,
          categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteCategory: (id) =>
        mutate((d) =>
          d.tickets.some((t) => t.category === id) || d.categories.length <= 1
            ? d
            : {
                ...d,
                categories: d.categories.filter((c) => c.id !== id),
                projects: d.projects.map((p) =>
                  p.category === id
                    ? { ...p, category: d.categories.find((c) => c.id !== id)!.id }
                    : p,
                ),
              },
        ),
      categoryMeta: (id) =>
        data.categories.find((c) => c.id === id) ??
        ({ id, label: id, colorVar: "var(--muted-foreground)" } as Category),
    };
  }, [data, ready, mutate, patchTicket]);

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error("useTracker must be used inside TrackerProvider");
  return ctx;
}