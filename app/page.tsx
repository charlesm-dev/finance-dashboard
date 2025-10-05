// app/page.tsx
import { Bell, Calendar, MoreHorizontal, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import NotificationsMenu from "@/components/NotificationsMenu";

type Transaction = {
  id: string;
  description: string;
  method: string;
  date: string;     // ISO string expected
  amount: string;   // e.g. "+$750.00" or "-$19.90"
  positive: boolean;
  category: string; // enum label from DB
};

function parseAmountToNumber(amount: string): number {
  const sign = amount.trim().startsWith("-") ? -1 : 1;
  const num = Number(amount.replace(/[^\d.]/g, ""));
  return sign * (Number.isFinite(num) ? num : 0);
}

type Slice = { label: string; value: number; pct: number; color: string };

function buildCategorySlices(transactions: Transaction[]): Slice[] {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    const v = parseAmountToNumber(t.amount);
    if (v < 0) {
      const key = t.category?.trim() || "Other";
      totals.set(key, (totals.get(key) ?? 0) + Math.abs(v));
    }
  }

  const entries = [...totals.entries()];
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return [];

  entries.sort((a, b) => b[1] - a[1]);
  const top = entries.slice(0, 5);
  const rest = entries.slice(5);
  const otherVal = rest.reduce((s, [, v]) => s + v, 0);
  const finalEntries = otherVal > 0 ? [...top, ["Other", otherVal] as const] : top;

  const palette = ["#9e77ed", "#f04438", "#0ba5ec", "#17b26a", "#4e5ba6", "#f59e0b", "#06b6d4"];
  return finalEntries.map(([label, value], i) => ({
    label,
    value,
    pct: value / total,
    color: palette[i % palette.length],
  }));
}

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

/* ========= NEW HELPERS for real % badges ========= */
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfPrevMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}
function sumTotalsInRange(transactions: Transaction[], start: Date, end: Date) {
  let income = 0, expenses = 0;
  for (const t of transactions) {
    const dt = new Date(t.date);
    if (!(dt >= start && dt < end)) continue;
    const v = parseAmountToNumber(t.amount);
    if (v < 0) expenses += Math.abs(v);
    else income += v;
  }
  return { income, expenses, balance: income - expenses };
}
function pctChange(curr: number, prev: number): number | null {
  if (!Number.isFinite(prev) || Math.abs(prev) < 1e-9) return null; // avoid /0
  return ((curr - prev) / Math.abs(prev)) * 100;
}
/** invert=true means “up is bad” (e.g., Expenses), so colors flip. */
function formatDelta(delta: number | null, { invert = false } = {}) {
  if (delta === null) return { text: "—", cls: "text-[#516778]" };
  const up = delta > 0;
  const arrow = up ? "↑" : delta < 0 ? "↓" : "→";
  const val = Math.abs(delta).toFixed(1) + "%";
  const good = invert ? !up : up;
  const bad  = invert ? up  : !up;

  let cls = "text-[#516778]";
  if (good && delta !== 0) cls = "text-[#17b26a]"; // green
  if (bad  && delta !== 0) cls = "text-[#f04438]"; // red
  return { text: `${arrow} ${val}`, cls };
}
/* ================================================== */

async function getTransactions(): Promise<Transaction[]> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `http://localhost:${process.env.PORT ?? 3000}`;
  const res = await fetch(`${base}/api/transactions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export default async function Dashboard() {
  const transactions = await getTransactions();
  const slices = buildCategorySlices(transactions);

  // this month vs last month (for real % badges)
  const now = new Date();
  const thisStart = startOfMonth(now);
  const prevStart = startOfPrevMonth(now);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthLabel = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
  }).format(thisStart);


  const curr = sumTotalsInRange(transactions, thisStart, nextMonthStart);
  const prev = sumTotalsInRange(transactions, prevStart, thisStart);

  const incomeDelta   = pctChange(curr.income,   prev.income);
  const expensesDelta = pctChange(curr.expenses, prev.expenses);
  const balanceDelta  = pctChange(curr.balance,  prev.balance);

  const incomeBadge   = formatDelta(incomeDelta);                 // up = good
  const expensesBadge = formatDelta(expensesDelta, { invert: true }); // up = bad
  const balanceBadge  = formatDelta(balanceDelta);                // up = good

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <header className="bg-white border-b border-[#eceff2] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#155eef] rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm transform rotate-45" />
              </div>
              <span className="text-xl font-semibold text-[#101828]">financy</span>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="text-[#155eef] font-semibold">Overview</Link>
              <Link href="/transactions" className="text-[#516778] hover:text-[#101828]">Transactions</Link>
              <Link href="/goals" className="text-[#516778] hover:text-[#101828]">Goals</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationsMenu />
            <div className="w-8 h-8 rounded-full bg-[#155eef] flex items-center justify-center">
              <span className="text-white text-sm font-medium">M</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="px-6 py-8">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#101828]">Hello!</h1>
          <p className="text-sm text-[#516778]">
            Summary for <span className="font-medium text-[#101828]">{monthLabel}</span>
          </p>
        </div>

        {/* Stats (now using real deltas + this-month totals) */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-[#eceff2]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#516778] text-sm">Balance</span>
                <span className={`text-sm font-medium ${balanceBadge.cls}`}>{balanceBadge.text}</span>
              </div>
              <div className="text-3xl font-bold text-[#101828]">{formatCurrency(curr.balance)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#eceff2]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#516778] text-sm">Incomes</span>
                <span className={`text-sm font-medium ${incomeBadge.cls}`}>{incomeBadge.text}</span>
              </div>
              <div className="text-3xl font-bold text-[#101828]">{formatCurrency(curr.income)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#eceff2]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#516778] text-sm">Expenses</span>
                <span className={`text-sm font-medium ${expensesBadge.cls}`}>{expensesBadge.text}</span>
              </div>
              <div className="text-3xl font-bold text-[#101828]">{formatCurrency(curr.expenses)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#dcfae6] border-[#17b26a] cursor-pointer hover:bg-[#dcfae6]/80">
            <CardContent>
              <Link href="/transactions" className="p-6 block">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#17b26a] rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">+</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#101828]">Add income</div>
                    <div className="text-sm text-[#516778]">Create an income manually</div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-[#fee4e2] border-[#f04438] cursor-pointer hover:bg-[#fee4e2]/80">
            <CardContent className="p-6">
              <Link href="/transactions" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#f04438] rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">-</span>
                </div>
                <div>
                  <div className="font-semibold text-[#101828]">Add expense</div>
                  <div className="text-sm text-[#516778]">Create an expense manually</div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-[#eff6ff] border-[#155eef] cursor-pointer hover:bg-[#eff6ff]/80">
            <CardContent className="p-6">
              <Link href="/goals" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#155eef] rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">+</span>
                </div>
                <div>
                  <div className="font-semibold text-[#101828]">Add Goals</div>
                  <div className="text-sm text-[#516778]">Add goals manually</div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Bottom */}
        <div className="grid grid-cols-2 gap-8">
          {/* Expenses by category */}
          <Card className="bg-white border-[#eceff2]">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-[#101828] mb-6">Expenses by category</h3>
              {slices.length === 0 ? (
                <div className="py-12 text-center text-[#516778]">No expense data yet.</div>
              ) : (
                <div className="flex items-center space-x-8">
                  {/* Donut */}
                  <div className="w-48 h-48 relative">
                    {(() => {
                      const r = 80;
                      const c = 2 * Math.PI * r;
                      let offset = 0;
                      return (
                        <svg className="w-full h-full" viewBox="0 0 200 200">
                          <circle cx="100" cy="100" r={r} fill="none" stroke="#eceff2" strokeWidth="40" />
                          {slices.map((s) => {
                            const len = s.pct * c;
                            const el = (
                              <circle
                                key={s.label}
                                cx="100"
                                cy="100"
                                r={r}
                                fill="none"
                                stroke={s.color}
                                strokeWidth="40"
                                strokeDasharray={`${len} ${c - len}`}
                                strokeDashoffset={-offset}
                                transform="rotate(-90 100 100)"
                              />
                            );
                            offset += len;
                            return el;
                          })}
                        </svg>
                      );
                    })()}
                  </div>

                  {/* Legend */}
                  <div className="space-y-4 min-w-[220px]">
                    {slices.map((s) => (
                      <div key={s.label} className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-[#516778] truncate">{s.label}</span>
                        <span className="text-[#101828] font-medium ml-auto">
                          {(s.pct * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Last transactions */}
          <Card className="bg-white border-[#eceff2]">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#101828]">Last transactions</h3>
                <p className="text-[#516778] text-sm">Check your last transactions</p>
              </div>

              <div className="space-y-1">
                <div className="grid grid-cols-4 gap-4 text-xs text-[#516778] font-medium pb-2 border-b border-[#eceff2]">
                  <span>Description</span>
                  <span>Method</span>
                  <span>Date</span>
                  <span className="text-right">Amount</span>
                </div>

                {transactions.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#f5f8ff] flex items-center justify-center mb-3">
                      <MoreHorizontal className="w-5 h-5 text-[#516778]" />
                    </div>
                    <h4 className="text-[#101828] font-medium mb-1">No transactions yet</h4>
                    <p className="text-[#516778] text-sm">When you add your first transaction, it will appear here.</p>
                  </div>
                ) : (
                  transactions.slice(0, 7).map((t) => (
                    <div key={t.id} className="grid grid-cols-4 gap-4 py-3 items-center hover:bg-[#f9fafb] rounded-lg px-2 -mx-2">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 bg-[#f5f8ff] rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-[#155eef]">
                            {t.description?.charAt(0)?.toUpperCase() ?? "•"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[#101828] text-sm truncate">{t.description}</div>
                          <span className="mt-0.5 inline-block text-[11px] px-1.5 py-0.5 bg-[#eff6ff] text-[#155eef] rounded">
                            {t.category || "Other"}
                          </span>
                        </div>
                      </div>

                      <span className="text-[#516778] text-sm truncate">{t.method}</span>
                      <span className="text-[#516778] text-sm">{new Date(t.date).toLocaleDateString()}</span>
                      <div className="flex items-center justify-end">
                        <span className={`text-sm font-medium ${t.positive ? "text-[#17b26a]" : "text-[#101828]"}`}>
                          {t.amount}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
