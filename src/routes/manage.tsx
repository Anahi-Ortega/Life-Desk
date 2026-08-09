import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/tracker/shell";
import { Button } from "@/components/ui/button";
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
import { recurrenceLabel, useTracker } from "@/lib/tracker/store";
import {
  CATEGORY_PALETTE,
  type CategoryId,
  type RecurrenceMode,
} from "@/lib/tracker/types";
import { CategoryChip, PriorityFlag } from "@/components/tracker/badges";
import { Lock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const MODES: RecurrenceMode[] = ["none", "daily", "weekly", "monthly", "custom"];

export const Route = createFileRoute("/manage")({
  head: () => ({
    meta: [
      { title: "Projects, Tags & Reopen Logic — LifeDesk" },
      {
        name: "description",
        content:
          "Group tickets under parent projects, curate your tag taxonomy, and override the default reopen schedule for individual habit tickets.",
      },
      { property: "og:title", content: "Projects, Tags & Reopen Logic — LifeDesk" },
      {
        property: "og:description",
        content: "Edit parent projects, tags and per-ticket recurrence overrides.",
      },
    ],
  }),
  component: Manage,
});

function Manage() {
  const {
    data,
    addProject,
    updateProject,
    deleteProject,
    addTag,
    renameTag,
    deleteTag,
    updateTicket,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useTracker();

  const [pName, setPName] = useState("");
  const [pCat, setPCat] = useState<CategoryId>(data.categories[0]?.id ?? "HOB");
  const [pDesc, setPDesc] = useState("");
  const [newTag, setNewTag] = useState("");
  const [cCode, setCCode] = useState("");
  const [cLabel, setCLabel] = useState("");
  const [cColor, setCColor] = useState(CATEGORY_PALETTE[0]!);

  return (
    <Shell>
      <h1 className="text-xl font-semibold tracking-tight">Configuration</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Parent projects, tag taxonomy, and per-ticket reopen overrides.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Categories
          </h2>
          <div className="rounded-md border border-border bg-card p-3">
            <div className="flex gap-2">
              <Input
                className="h-8 w-20 font-mono text-xs uppercase"
                placeholder="TRV"
                maxLength={4}
                value={cCode}
                onChange={(e) => setCCode(e.target.value.toUpperCase())}
              />
              <Input
                className="h-8 flex-1 text-xs"
                placeholder="Travel"
                value={cLabel}
                onChange={(e) => setCLabel(e.target.value)}
              />
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {CATEGORY_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use color ${color}`}
                  onClick={() => setCColor(color)}
                  className={
                    "size-5 rounded-full border transition-transform " +
                    (cColor === color ? "scale-110 border-foreground" : "border-transparent")
                  }
                  style={{ backgroundColor: color }}
                />
              ))}
              <Button
                size="sm"
                className="ml-auto h-8"
                disabled={!cCode.trim()}
                onClick={() => {
                  const created = addCategory({
                    id: cCode,
                    label: cLabel,
                    colorVar: cColor,
                  });
                  if (!created) {
                    toast.error("That category code is already in use.");
                    return;
                  }
                  toast.success(`${created} added`, {
                    description: `New tickets can be filed as ${created}-0001.`,
                  });
                  setCCode("");
                  setCLabel("");
                }}
              >
                Add
              </Button>
            </div>
            <ul className="mt-3 space-y-1.5">
              {data.categories.map((c) => {
                const used = data.tickets.filter((t) => t.category === c.id).length;
                return (
                  <li key={c.id} className="flex items-center gap-2">
                    <label
                      className="relative size-5 shrink-0 cursor-pointer rounded-full border border-border"
                      style={{ backgroundColor: c.colorVar }}
                      title="Change color"
                    >
                      <input
                        type="color"
                        aria-label={`${c.id} color`}
                        className="absolute inset-0 size-full cursor-pointer opacity-0"
                        value={/^#/.test(c.colorVar) ? c.colorVar : "#7dd3fc"}
                        onChange={(e) => updateCategory(c.id, { colorVar: e.target.value })}
                      />
                    </label>
                    <span className="w-9 shrink-0 font-mono text-[11px] font-semibold text-primary">
                      {c.id}
                    </span>
                    <Input
                      className="h-7 text-xs"
                      defaultValue={c.label}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== c.label) updateCategory(c.id, { label: v });
                      }}
                    />
                    <span className="w-6 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                      {used}
                    </span>
                    {used > 0 || data.categories.length <= 1 ? (
                      <span
                        className="flex size-7 shrink-0 items-center justify-center text-muted-foreground"
                        title="In use by tickets — cannot delete"
                      >
                        <Lock className="size-3.5" />
                      </span>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 shrink-0 text-destructive"
                        onClick={() => deleteCategory(c.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Codes become ticket ID prefixes and can&apos;t be renamed once used.
            </p>
          </div>
        </section>

        <section className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Parent projects
          </h2>
          {data.projects.map((p) => {
            const children = data.tickets.filter((t) => t.projectId === p.id);
            const done = children.filter((t) => t.status === "done").length;
            const pct = children.length ? Math.round((done / children.length) * 100) : 0;
            return (
              <div key={p.id} className="rounded-md border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Input
                    className="h-8 max-w-xs font-medium"
                    value={p.name}
                    onChange={(e) => updateProject(p.id, { name: e.target.value })}
                  />
                  <Select
                    value={p.category}
                    onValueChange={(v) => updateProject(p.id, { category: v as CategoryId })}
                  >
                    <SelectTrigger className="h-8 w-36">
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
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                    {done}/{children.length} resolved · {pct}%
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-destructive"
                    onClick={() => deleteProject(p.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <Textarea
                  className="mt-2 min-h-14 text-sm"
                  value={p.description}
                  onChange={(e) => updateProject(p.id, { description: e.target.value })}
                />
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <ul className="mt-2 space-y-1">
                  {children.map((t) => (
                    <li key={t.id} className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-primary">{t.key}</span>
                      <span className="truncate text-muted-foreground">{t.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <div className="rounded-md border border-dashed border-border p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              New project
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <Input
                className="h-8 max-w-xs"
                placeholder="Project name"
                value={pName}
                onChange={(e) => setPName(e.target.value)}
              />
              <Select value={pCat} onValueChange={(v) => setPCat(v as CategoryId)}>
                <SelectTrigger className="h-8 w-36">
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
              <Input
                className="h-8 flex-1"
                placeholder="Goal / outcome"
                value={pDesc}
                onChange={(e) => setPDesc(e.target.value)}
              />
              <Button
                size="sm"
                disabled={!pName.trim()}
                onClick={() => {
                  addProject({ name: pName.trim(), category: pCat, description: pDesc });
                  setPName("");
                  setPDesc("");
                }}
              >
                <Plus className="size-4" /> Add
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tags
          </h2>
          <div className="rounded-md border border-border bg-card p-3">
            <div className="flex gap-2">
              <Input
                className="h-8 font-mono text-xs"
                placeholder="new-tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <Button
                size="sm"
                disabled={!newTag.trim()}
                onClick={() => {
                  addTag(newTag);
                  setNewTag("");
                }}
              >
                Add
              </Button>
            </div>
            <ul className="mt-3 space-y-1.5">
              {data.tags.map((tag) => (
                <li key={tag} className="flex items-center gap-2">
                  <Input
                    className="h-7 font-mono text-xs"
                    defaultValue={tag}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v && v !== tag) renameTag(tag, v);
                    }}
                  />
                  <span className="w-8 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                    {data.tickets.filter((t) => t.tags.includes(tag)).length}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-destructive"
                    onClick={() => deleteTag(tag)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Reopen logic overrides
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Any ticket can fall outside its default cycle — set its own schedule or interval here.
        </p>
        <div className="mt-3 overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Summary</th>
                <th className="px-3 py-2 font-medium">Area</th>
                <th className="px-3 py-2 font-medium">Esc.</th>
                <th className="px-3 py-2 font-medium">Schedule</th>
                <th className="px-3 py-2 font-medium">Interval</th>
                <th className="px-3 py-2 font-medium">Parent</th>
              </tr>
            </thead>
            <tbody>
              {data.tickets.map((t) => (
                <tr key={t.id} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2 font-mono text-xs text-primary">{t.key}</td>
                  <td className="max-w-[220px] truncate px-3 py-2">{t.title}</td>
                  <td className="px-3 py-2">
                    <CategoryChip category={t.category} />
                  </td>
                  <td className="px-3 py-2">
                    <PriorityFlag priority={t.priority} />
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={t.recurrence.mode}
                      onValueChange={(v) =>
                        updateTicket(t.id, {
                          recurrence: { ...t.recurrence, mode: v as RecurrenceMode },
                        })
                      }
                    >
                      <SelectTrigger className="h-7 w-32 text-xs">
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
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        className="h-7 w-16 text-xs"
                        disabled={t.recurrence.mode !== "custom"}
                        value={t.recurrence.intervalDays}
                        onChange={(e) =>
                          updateTicket(t.id, {
                            recurrence: {
                              ...t.recurrence,
                              intervalDays: Number(e.target.value) || 1,
                            },
                          })
                        }
                      />
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {recurrenceLabel(t.recurrence)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={t.projectId ?? "none"}
                      onValueChange={(v) =>
                        updateTicket(t.id, { projectId: v === "none" ? null : v })
                      }
                    >
                      <SelectTrigger className="h-7 w-40 text-xs">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Label className="sr-only">config</Label>
    </Shell>
  );
}