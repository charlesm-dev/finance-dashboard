"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  onCreated?: () => void; // parent can refresh list without full page reload
};

export default function AddGoalForm({ onCreated }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          targetAmount: parseFloat(targetAmount),
          dueDate: dueDate || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create goal");

      // clear inputs
      setTitle("");
      setTargetAmount("");
      setDueDate("");

      // allow parent to update its list (preferred)
      onCreated?.();

      // fallback: refresh any server components on the page
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
      <input
        required
        type="text"
        placeholder="Goal title"
        className="border border-[#eceff2] rounded-md px-3 py-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        required
        type="number"
        step="0.01"
        placeholder="Target amount"
        className="border border-[#eceff2] rounded-md px-3 py-2"
        value={targetAmount}
        onChange={(e) => setTargetAmount(e.target.value)}
      />
      <input
        type="date"
        className="border border-[#eceff2] rounded-md px-3 py-2"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add goal"}
      </Button>
    </form>
  );
}
