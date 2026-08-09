import { cn } from "@/lib/utils";
import { useTracker } from "@/lib/tracker/store";
import type { CategoryId, Priority, Severity, Status, Ticket } from "@/lib/tracker/types";
import { STATUS_LABEL } from "@/lib/tracker/types";

export function PriorityFlag({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-tight",
        className,
      )}
      style={{
        color: `var(--${priority.toLowerCase()})`,
        borderColor: `color-mix(in oklab, var(--${priority.toLowerCase()}) 45%, transparent)`,
        backgroundColor: `color-mix(in oklab, var(--${priority.toLowerCase()}) 12%, transparent)`,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: `var(--${priority.toLowerCase()})` }}
      />
      {priority}
    </span>
  );
}

export function CategoryChip({ category }: { category: CategoryId }) {
  const { categoryMeta } = useTracker();
  const meta = categoryMeta(category);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-[11px] font-medium"
      style={{
        color: meta.colorVar,
        backgroundColor: `color-mix(in oklab, ${meta.colorVar} 14%, transparent)`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.colorVar }} />
      {meta.label}
    </span>
  );
}

export function StatusChip({ status }: { status: Status }) {
  const color =
    status === "done"
      ? "var(--success)"
      : status === "blocked"
        ? "var(--destructive)"
        : status === "in_progress"
          ? "var(--primary)"
          : "var(--muted-foreground)";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide"
      style={{
        color,
        borderColor: `color-mix(in oklab, ${color} 40%, transparent)`,
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function SeverityChip({ severity }: { severity: Severity }) {
  return (
    <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[11px] capitalize text-secondary-foreground">
      {severity}
    </span>
  );
}

export function TagChip({ tag }: { tag: string }) {
  return (
    <span className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
      #{tag}
    </span>
  );
}

export function ProgressMeter({ ticket, className }: { ticket: Ticket; className?: string }) {
  const pct = Math.min(100, Math.round((ticket.progress / Math.max(1, ticket.target)) * 100));
  const color =
    ticket.status === "done" || pct >= 100
      ? "var(--success)"
      : pct >= 75
        ? "var(--warning)"
        : "var(--primary)";
  return (
    <div className={cn("min-w-[120px]", className)}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>
          {ticket.progress}/{ticket.target} {ticket.unit}
        </span>
        <span style={{ color: pct >= 75 ? color : undefined }}>{pct}%</span>
      </div>
    </div>
  );
}

export function dueLabel(ticket: Ticket) {
  if (ticket.status === "done" && ticket.reopenAt) {
    const days = Math.ceil((new Date(ticket.reopenAt).getTime() - Date.now()) / 86400000);
    return { text: `reopens in ${Math.max(0, days)}d`, tone: "muted" as const };
  }
  if (!ticket.dueAt) return { text: "no due date", tone: "muted" as const };
  const days = Math.ceil((new Date(ticket.dueAt).getTime() - Date.now()) / 86400000);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, tone: "bad" as const };
  if (days === 0) return { text: "due today", tone: "warn" as const };
  return { text: `in ${days}d`, tone: days <= 2 ? ("warn" as const) : ("muted" as const) };
}