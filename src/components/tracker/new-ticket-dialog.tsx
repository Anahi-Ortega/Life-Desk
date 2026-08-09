import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTracker } from "@/lib/tracker/store";
import {
  PRIORITIES,
  PRIORITY_LABEL,
  SEVERITIES,
  type CategoryId,
  type Priority,
  type RecurrenceMode,
  type Severity,
} from "@/lib/tracker/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const MODES: RecurrenceMode[] = ["none", "daily", "weekly", "monthly", "custom"];

export function NewTicketDialog() {
  const { data, createTicket } = useTracker();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryId>(data.categories[0]?.id ?? "FIT");
  const [priority, setPriority] = useState<Priority>("P3");
  const [severity, setSeverity] = useState<Severity>("minor");
  const [projectId, setProjectId] = useState("none");
  const [mode, setMode] = useState<RecurrenceMode>("weekly");
  const [intervalDays, setIntervalDays] = useState(14);
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState("sessions");
  const [tags, setTags] = useState<string[]>([]);

  function submit() {
    if (!title.trim()) return;
    const t = createTicket({
      title: title.trim(),
      description,
      category,
      priority,
      severity,
      projectId: projectId === "none" ? null : projectId,
      tags,
      target,
      unit,
      recurrence: { mode, intervalDays },
    });
    toast.success(`${t.key} filed`, { description: t.title });
    setOpen(false);
    setTitle("");
    setDescription("");
    setTags([]);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" /> New ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>File a ticket</DialogTitle>
          <DialogDescription>
            The ticket ID is generated from the category prefix, e.g. FIT-0003.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Summary</Label>
            <Input
              className="mt-1.5"
              placeholder="Deadlift 3x5 progression"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Description</Label>
            <Textarea
              className="mt-1.5"
              placeholder="Acceptance criteria for this habit or task"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as CategoryId)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.id} · {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Escalation</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="mt-1.5">
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
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                <SelectTrigger className="mt-1.5">
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
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Parent project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="mt-1.5">
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
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Reopen schedule</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as RecurrenceMode)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODES.map((m) => (
                    <SelectItem key={m} value={m} className="capitalize">
                      {m === "none" ? "One-off" : m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Interval (days)</Label>
              <Input
                type="number"
                min={1}
                className="mt-1.5"
                disabled={mode !== "custom"}
                value={intervalDays}
                onChange={(e) => setIntervalDays(Number(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Goal target</Label>
              <Input
                type="number"
                min={1}
                className="mt-1.5"
                value={target}
                onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Unit</Label>
              <Input
                className="mt-1.5"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="sessions"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Tags</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {data.tags.map((tag) => {
                const on = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setTags(on ? tags.filter((t) => t !== tag) : [...tags, tag])
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
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!title.trim()}>
            Create ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}