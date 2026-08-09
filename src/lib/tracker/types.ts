/** A category code such as "FIT" — user-extendable, so this is a plain string. */
export type CategoryId = string;

export interface Category {
  id: CategoryId;
  label: string;
  /** any CSS color value: a token like var(--cat-fit) or a hex string */
  colorVar: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "CLN", label: "Cleaning", colorVar: "var(--cat-clean)" },
  { id: "MNY", label: "Money", colorVar: "var(--cat-money)" },
  { id: "FIT", label: "Fitness", colorVar: "var(--cat-fit)" },
  { id: "HOB", label: "Hobby", colorVar: "var(--cat-hobby)" },
  { id: "MND", label: "Mind", colorVar: "var(--cat-mind)" },
];

/** Palette offered when creating a new category. */
export const CATEGORY_PALETTE = [
  "#7dd3fc",
  "#a3e635",
  "#fbbf24",
  "#fb7185",
  "#c084fc",
  "#34d399",
  "#f97316",
  "#94a3b8",
];

export type Priority = "P1" | "P2" | "P3" | "P4" | "P5";
export const PRIORITIES: Priority[] = ["P1", "P2", "P3", "P4", "P5"];
export const PRIORITY_LABEL: Record<Priority, string> = {
  P1: "P1 · Critical",
  P2: "P2 · High",
  P3: "P3 · Medium",
  P4: "P4 · Low",
  P5: "P5 · Someday",
};

export type Severity = "blocker" | "major" | "minor" | "trivial";
export const SEVERITIES: Severity[] = ["blocker", "major", "minor", "trivial"];

export type Status = "open" | "in_progress" | "blocked" | "done";
export const STATUSES: Status[] = ["open", "in_progress", "blocked", "done"];
export const STATUS_LABEL: Record<Status, string> = {
  open: "Open",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Resolved",
};

export type RecurrenceMode = "none" | "daily" | "weekly" | "monthly" | "custom";

export interface Recurrence {
  mode: RecurrenceMode;
  /** used when mode === "custom" */
  intervalDays: number;
}

export interface JournalEntry {
  id: string;
  at: string;
  body: string;
  system?: boolean;
}

export interface Ticket {
  id: string;
  key: string;
  category: CategoryId;
  title: string;
  description: string;
  priority: Priority;
  severity: Severity;
  status: Status;
  projectId: string | null;
  tags: string[];
  /** goal progress: current / target units (reps, dollars, sessions, rooms...) */
  progress: number;
  target: number;
  unit: string;
  recurrence: Recurrence;
  /** when a resolved recurring ticket reopens */
  reopenAt: string | null;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
  cycles: number;
  journal: JournalEntry[];
}

export interface Project {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
}

export interface TrackerData {
  tickets: Ticket[];
  projects: Project[];
  tags: string[];
  categories: Category[];
  counters: Record<string, number>;
}