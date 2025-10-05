"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

/** Raw from API (snake/camel mixed, nullable) */
type RawGoal = {
  id: string;
  title?: string;
  name?: string;
  target_amount?: number | string | null;
  current_amount?: number | string | null;
  targetAmount?: number | string | null;
  currentAmount?: number | string | null;
  due_date?: string | null;
  dueDate?: string | null;
};

type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  dueDate: string | null;
};

/* ---- helpers ---- */
const toNum = (v: unknown, fallback = 0): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

const normalizeGoals = (raw: RawGoal[]): Goal[] =>
  raw.map((g) => ({
    id: g.id,
    title: (g.title ?? g.name ?? "").toString(),
    targetAmount: toNum(g.target_amount ?? g.targetAmount, 0),
    currentAmount: toNum(g.current_amount ?? g.currentAmount, 0),
    dueDate: (g.due_date ?? g.dueDate) ?? null,
  }));

const formatCurrency = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

const formatDate = (d: string | null) =>
  !d ? "—" : new Date(d).toLocaleDateString();

/* ---- component ---- */
export default function GoalsList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/goals", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch goals");
      const data: RawGoal[] = await res.json();
      setGoals(normalizeGoals(data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    setDeletingId(id);
    const prev = goals;
    setGoals((g) => g.filter((x) => x.id !== id)); // optimistic

    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      setGoals(prev); // revert if failed
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-[#516778]">
        <Loader2 className="inline-block mr-2 w-4 h-4 animate-spin align-middle" />
        Loading goals…
      </div>
    );
  }

  /* === EXACT “old table” grid style, but with checkmark action === */
  return (
    <div className="space-y-1">
      {/* Header row */}
      <div className="grid grid-cols-4 gap-4 text-xs text-[#516778] font-medium pb-2 border-b border-[#eceff2]">
        <span>Goal</span>
        <span>Target</span>
        <span>Current</span>
        <span className="text-right">Due date</span>
      </div>

      {goals.length === 0 ? (
        <div className="py-12 text-center text-[#516778]">No goals yet.</div>
      ) : (
        goals.map((g) => {
          const title = g.title.trim() || "Untitled goal";
          const badge = title.slice(0, 1).toUpperCase() || "?";
          return (
            <div
              key={g.id}
              className="grid grid-cols-4 gap-4 py-3 items-center hover:bg-[#f9fafb] rounded-lg px-2 -mx-2"
            >
              {/* col 1: goal name w/ badge */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#f5f8ff] rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium text-[#155eef]">{badge}</span>
                </div>
                <span className="text-[#101828] text-sm truncate">{title}</span>
              </div>

              {/* col 2: target */}
              <span className="text-[#101828] text-sm">
                {formatCurrency(g.targetAmount)}
              </span>

              {/* col 3: current */}
              <span className="text-[#516778] text-sm">
                {formatCurrency(g.currentAmount)}
              </span>

              {/* col 4: due + checkmark (delete) on the right */}
              <div className="flex items-center justify-end space-x-2">
                <span className="text-[#516778] text-sm">{formatDate(g.dueDate)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-[#17b26a]"
                  title="Mark complete"
                  aria-label="Mark complete"
                  onClick={() => remove(g.id)}
                  disabled={deletingId === g.id}
                >
                  {deletingId === g.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
