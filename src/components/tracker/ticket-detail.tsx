import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { recurrenceLabel, useTracker } from "@/lib/tracker/store";
import {
  PRIORITIES,
  PRIORITY_LABEL,
  SEVERITIES,
  STATUSES,
  STATUS_LABEL,
  type RecurrenceMode,
  type Ticket,
} from "@/lib/tracker/types";
import { CategoryChip, PriorityFlag, ProgressMeter, StatusChip, TagChip } from "./badges";
import { Check, Minus, Plus, RotateCcw, Trash2 } from "lucide-react";

const RECURRENCE_MODES: RecurrenceMode[] = ["none", "daily", "weekly", "monthly", "custom"];

export function TicketDetail({
  ticket,
  onClose,
}: {
  ticket: Ticket | null;
  onClose: () => void;
}) {
  const { data, updateTicket, resolveTicket, reopenTicket, deleteTicket, addNote } = useTracker();
  const [note, setNote] = useState("");

  if (!ticket) return null;
  const project = data.projects.find((p) => p.id === ticket.projectId) ?? null;

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-primary">{ticket.key}</span>
            <PriorityFlag priority={ticket.priority} />
            <StatusChip status={ticket.status} />
          </div>
          <SheetTitle className="text-left text-lg leading-snug">{ticket.title}</SheetTitle>
          <SheetDescription className="text-left">
            <CategoryChip category={ticket.category} />
            <span className="ml-2 font-mono text-[11px]">
              {recurrenceLabel(ticket.recurrence)} · cycle #{ticket.cycles}
              {project ? ` · ${project.name}` : ""}
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-10">
          <section className="rounded-md border border-border bg-card p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Goal progress
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="size-6"
                  onClick={() =>
                    updateTicket(ticket.id, { progress: Math.max(0, ticket.progress - 1) })
                  }
                >
                  <Minus className="size-3" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="size-6"
                  onClick={() => updateTicket(ticket.id, { progress: ticket.progress + 1 })}
                >
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>
            <ProgressMeter ticket={ticket} className="min-w-full" />
            <div className="mt-3 flex gap-2">
              {ticket.status === "done" ? (
                <Button size="sm" variant="outline" onClick={() => reopenTicket(ticket.id)}>
                  <RotateCcw className="size-3.5" /> Reopen now
                </Button>
              ) : (
                <Button size="sm" onClick={() => resolveTicket(ticket.id)}>
                  <Check className="size-3.5" /> Mark goal achieved
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  deleteTicket(ticket.id);
                  onClose();
                }}
              >
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select
                value={ticket.status}
                onValueChange={(v) => updateTicket(ticket.id, { status: v as Ticket["status"] })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Escalation">
              <Select
                value={ticket.priority}
                onValueChange={(v) => updateTicket(ticket.id, { priority: v as Ticket["priority"] })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABEL[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Severity">
              <Select
                value={ticket.severity}
                onValueChange={(v) => updateTicket(ticket.id, { severity: v as Ticket["severity"] })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Parent project">
              <Select
                value={ticket.projectId ?? "none"}
                onValueChange={(v) => updateTicket(ticket.id, { projectId: v === "none" ? null : v })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent</SelectItem>
                  {data.projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </section>

          <section className="rounded-md border border-border bg-card p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Reopen logic
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Schedule">
                <Select
                  value={ticket.recurrence.mode}
                  onValueChange={(v) =>
                    updateTicket(ticket.id, {
                      recurrence: { ...ticket.recurrence, mode: v as RecurrenceMode },
                    })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_MODES.map((m) => (
                      <SelectItem key={m} value={m} className="capitalize">
                        {m === "none" ? "One-off (never reopen)" : m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Custom interval (days)">
                <Input
                  type="number"
                  min={1}
                  className="h-8"
                  disabled={ticket.recurrence.mode !== "custom"}
                  value={ticket.recurrence.intervalDays}
                  onChange={(e) =>
                    updateTicket(ticket.id, {
                      recurrence: {
                        ...ticket.recurrence,
                        intervalDays: Number(e.target.value) || 1,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Goal target">
                <Input
                  type="number"
                  min={1}
                  className="h-8"
                  value={ticket.target}
                  onChange={(e) =>
                    updateTicket(ticket.id, { target: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
              </Field>
              <Field label="Unit">
                <Input
                  className="h-8"
                  value={ticket.unit}
                  onChange={(e) => updateTicket(ticket.id, { unit: e.target.value })}
                />
              </Field>
            </div>
            {ticket.reopenAt && (
              <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                Next auto-reopen: {new Date(ticket.reopenAt).toLocaleString()}
              </p>
            )}
          </section>

          <section>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Description
            </Label>
            <Textarea
              className="mt-1.5 min-h-20"
              value={ticket.description}
              onChange={(e) => updateTicket(ticket.id, { description: e.target.value })}
            />
          </section>

          <section>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tags</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {data.tags.map((tag) => {
                const on = ticket.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() =>
                      updateTicket(ticket.id, {
                        tags: on ? ticket.tags.filter((t) => t !== tag) : [...ticket.tags, tag],
                      })
                    }
                    className={
                      on
                        ? "rounded-sm border border-primary/60 bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] text-primary"
                        : "rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:border-primary/40"
                    }
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Journal — growth log
            </h3>
            <div className="flex gap-2">
              <Textarea
                placeholder="What happened this cycle? What did you learn?"
                className="min-h-16"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button
                size="sm"
                disabled={!note.trim()}
                onClick={() => {
                  addNote(ticket.id, note.trim());
                  setNote("");
                }}
              >
                Log
              </Button>
            </div>
            <ol className="mt-4 space-y-3 border-l border-border pl-4">
              {ticket.journal.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary/70" />
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {new Date(entry.at).toLocaleString()}
                    {entry.system ? " · system" : ""}
                  </p>
                  <p
                    className={
                      entry.system
                        ? "text-sm italic text-muted-foreground"
                        : "text-sm text-foreground"
                    }
                  >
                    {entry.body}
                  </p>
                </li>
              ))}
            </ol>
            {ticket.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1">
                {ticket.tags.map((t) => (
                  <TagChip key={t} tag={t} />
                ))}
              </div>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}