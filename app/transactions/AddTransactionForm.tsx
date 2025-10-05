"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "Housing","Groceries","Dining","Transportation","Utilities",
  "Shopping","Income","Health","Entertainment","Education","Other",
] as const;

export default function AddTransactionForm() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState("Credit card");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState(""); // user types 10 or -9.9
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Other"); // NEW
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const num = Number(amount);
      const positive = num >= 0;
      const amountStr = `${positive ? "+" : "-"}$${Math.abs(num).toFixed(2)}`;

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          method,
          date,        // "YYYY-MM-DD"
          amount: amountStr,
          positive,
          category,    // NEW
        }),
      });
      if (!res.ok) throw new Error("Failed to create transaction");

      // clear + refresh server component
      setDescription("");
      setMethod("Credit card");
      setDate("");
      setAmount("");
      setCategory("Other"); // reset
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">{/* ← cols 6 now */}
      <input
        required
        type="text"
        placeholder="Description"
        className="border border-[#eceff2] rounded-md px-3 py-2"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select
        className="border border-[#eceff2] rounded-md px-3 py-2"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
      >
        <option>Credit card</option>
        <option>Bank account</option>
        <option>Cash</option>
        <option>Wallet</option>
      </select>

      {/* NEW: Category */}
      <select
        className="border border-[#eceff2] rounded-md px-3 py-2"
        value={category}
        onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input
        required
        type="date"
        className="border border-[#eceff2] rounded-md px-3 py-2"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        required
        type="number"
        step="0.01"
        placeholder="Amount (e.g. 750 or -19.90)"
        className="border border-[#eceff2] rounded-md px-3 py-2"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <Button type="submit" disabled={submitting} className="md:col-span-1">
        {submitting ? "Adding..." : "Add transaction"}
      </Button>
    </form>
  );
}
