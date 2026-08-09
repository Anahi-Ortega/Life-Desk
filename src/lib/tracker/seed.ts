import { DEFAULT_CATEGORIES } from "./types";
import type { CategoryId, Recurrence, Ticket, TrackerData } from "./types";

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}

let n = 0;
const id = () => `seed-${++n}`;

function rec(mode: Recurrence["mode"], intervalDays = 1): Recurrence {
  return { mode, intervalDays };
}

interface SeedInput {
  category: CategoryId;
  num: number;
  title: string;
  description: string;
  priority: Ticket["priority"];
  severity: Ticket["severity"];
  status: Ticket["status"];
  projectId: string | null;
  tags: string[];
  progress: number;
  target: number;
  unit: string;
  recurrence: Recurrence;
  dueIn: number | null;
  notes: string[];
}

function ticket(s: SeedInput): Ticket {
  return {
    id: id(),
    key: `${s.category}-${String(s.num).padStart(4, "0")}`,
    category: s.category,
    title: s.title,
    description: s.description,
    priority: s.priority,
    severity: s.severity,
    status: s.status,
    projectId: s.projectId,
    tags: s.tags,
    progress: s.progress,
    target: s.target,
    unit: s.unit,
    recurrence: s.recurrence,
    reopenAt: s.status === "done" && s.recurrence.mode !== "none" ? iso(3) : null,
    dueAt: s.dueIn === null ? null : iso(s.dueIn),
    createdAt: iso(-30),
    updatedAt: iso(-1),
    cycles: 1,
    journal: s.notes.map((body, i) => ({ id: `${id()}-n${i}`, at: iso(-i - 1), body })),
  };
}

export function seedData(): TrackerData {
  const projects = [
    { id: "prj-home", name: "Home Reset 2026", category: "CLN" as CategoryId, description: "Get the whole house on a sustainable maintenance loop." },
    { id: "prj-debt", name: "Debt Free by Q4", category: "MNY" as CategoryId, description: "Kill the card balances and build a 3-month buffer." },
    { id: "prj-strength", name: "Strength Base", category: "FIT" as CategoryId, description: "Barbell fundamentals, 3x/week, progressive overload." },
    { id: "prj-guitar", name: "Guitar: Year One", category: "HOB" as CategoryId, description: "From open chords to playing two full songs by ear." },
  ];

  const tickets: Ticket[] = [
    ticket({
      category: "FIT", num: 1, title: "Squat 3x5 progression", description: "Add 5lb per session while form holds. Log bar weight and RPE each time.",
      priority: "P1", severity: "major", status: "in_progress", projectId: "prj-strength",
      tags: ["strength", "gym"], progress: 8, target: 12, unit: "sessions", recurrence: rec("weekly"), dueIn: 2,
      notes: ["185lb x 3x5. Left knee cave on rep 4 of set 3 — cue knees out next time.", "Warmup ladder is working better than jumping straight to work sets."],
    }),
    ticket({
      category: "FIT", num: 2, title: "Walk 8k steps", description: "Daily baseline movement. Counts even if split across the day.",
      priority: "P3", severity: "minor", status: "done", projectId: "prj-strength",
      tags: ["cardio", "daily"], progress: 1, target: 1, unit: "day", recurrence: rec("daily"), dueIn: 0,
      notes: ["Hit 9.4k. Evening loop around the park is the easiest win of the day."],
    }),
    ticket({
      category: "MNY", num: 1, title: "Pay down card balance", description: "Snowball the highest APR card first. Target $2,400 this quarter.",
      priority: "P1", severity: "blocker", status: "open", projectId: "prj-debt",
      tags: ["debt", "monthly"], progress: 900, target: 2400, unit: "dollars", recurrence: rec("monthly"), dueIn: 9,
      notes: ["Autopay bumped to $300. APR is 24.9% — this is the most expensive line in the budget."],
    }),
    ticket({
      category: "MNY", num: 2, title: "Weekly budget review", description: "Reconcile accounts, categorize spend, note one leak to close.",
      priority: "P2", severity: "major", status: "in_progress", projectId: "prj-debt",
      tags: ["review", "weekly"], progress: 3, target: 4, unit: "reviews", recurrence: rec("weekly"), dueIn: 3,
      notes: ["Takeout was $180 over. Cooking Sunday batch meals cut it in half last month."],
    }),
    ticket({
      category: "CLN", num: 1, title: "Deep clean kitchen", description: "Counters, hood filter, fridge purge, floor mop.",
      priority: "P2", severity: "minor", status: "open", projectId: "prj-home",
      tags: ["kitchen", "biweekly"], progress: 1, target: 4, unit: "zones", recurrence: rec("custom", 14), dueIn: 5,
      notes: ["Hood filter degreaser soak works way better than scrubbing."],
    }),
    ticket({
      category: "CLN", num: 2, title: "Laundry cycle", description: "Wash, dry, fold, put away — put away is the part that gets skipped.",
      priority: "P4", severity: "trivial", status: "blocked", projectId: "prj-home",
      tags: ["chores", "weekly"], progress: 2, target: 3, unit: "loads", recurrence: rec("weekly"), dueIn: -1,
      notes: ["Blocked: dryer vent needs cleaning, clothes take two cycles to dry."],
    }),
    ticket({
      category: "HOB", num: 1, title: "Learn Blackbird intro", description: "Fingerstyle intro at 80% tempo, clean, from memory.",
      priority: "P3", severity: "minor", status: "in_progress", projectId: "prj-guitar",
      tags: ["guitar", "practice"], progress: 14, target: 30, unit: "practice days", recurrence: rec("daily"), dueIn: 1,
      notes: ["Bar 6 transition is the wall. Slowed to 60bpm and it finally clicked.", "Recorded a take today — timing drifts when I stop counting out loud."],
    }),
    ticket({
      category: "HOB", num: 2, title: "Finish sci-fi novel", description: "20 pages a night. No skipping to the end.",
      priority: "P5", severity: "trivial", status: "open", projectId: null,
      tags: ["reading"], progress: 210, target: 420, unit: "pages", recurrence: rec("none"), dueIn: 20,
      notes: ["Halfway. The middle act drags but the world-building pays off."],
    }),
    ticket({
      category: "MND", num: 1, title: "Morning journal", description: "Ten minutes, three lines: state, intention, friction.",
      priority: "P2", severity: "minor", status: "open", projectId: null,
      tags: ["journal", "daily"], progress: 5, target: 7, unit: "days", recurrence: rec("daily"), dueIn: 0,
      notes: ["Streak of 5. Doing it before coffee makes it stick."],
    }),
  ];

  return {
    tickets,
    projects,
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    tags: ["strength", "gym", "cardio", "daily", "weekly", "biweekly", "monthly", "debt", "review", "kitchen", "chores", "guitar", "practice", "reading", "journal"],
    counters: { CLN: 2, MNY: 2, FIT: 2, HOB: 2, MND: 1 },
  };
}