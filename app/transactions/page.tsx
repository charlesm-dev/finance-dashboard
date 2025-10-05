// app/transactions/page.tsx
import Link from "next/link";
import { MoreHorizontal, Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddTransactionForm from "./AddTransactionForm";

type Transaction = {
  id: string;
  description: string;
  method: string;
  date: string;
  amount: string;
  positive: boolean;
  category: string; // NEW
};

async function getTransactions(): Promise<Transaction[]> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `http://localhost:${process.env.PORT ?? 3000}`;
  const res = await fetch(`${base}/api/transactions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <header className="bg-white border-b border-[#eceff2] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#155eef] rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
              </div>
              <span className="text-xl font-semibold text-[#101828]">financy</span>
            </div>

            {/* Nav uses Link for internal routes */}
            <nav className="flex space-x-6">
              <Link href="/" className="text-[#101828] font-medium">Overview</Link>
              <Link href="/transactions" className="text-[#155eef] font-semibold">Transactions</Link>
              <Link href="/goals" className="text-[#516778] hover:text-[#101828]">Goals</Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-[#516778]">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-[#155eef] flex items-center justify-center">
              <span className="text-white text-sm font-medium">M</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}

      <main className="px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#101828]">Transactions History</h1>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <Card className="bg-white border-[#eceff2] shadow-sm">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#101828]">Check your last transactions</h3>
                  <p className="text-[#516778] text-sm">Enter negative numbers for withdrawals and positive numbers for deposits.</p>
                </div>

                <AddTransactionForm />

                <div className="space-y-1">
                  {/* 5 columns now */}
                  <div className="grid grid-cols-5 gap-4 text-xs text-[#516778] font-medium pb-2 border-b border-[#eceff2]">
                    <span>Description</span>
                    <span>Method</span>
                    <span>Category</span>
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
                    transactions.map((t) => (
                      <div key={t.id} className="grid grid-cols-5 gap-4 py-3 items-center hover:bg-[#f9fafb] rounded-lg px-2 -mx-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[#f5f8ff] rounded-lg flex items-center justify-center">
                            <span className="text-xs font-medium text-[#155eef]">
                              {t.description?.charAt(0)?.toUpperCase() ?? "•"}
                            </span>
                          </div>
                          <span className="text-[#101828] text-sm">{t.description}</span>
                        </div>

                        <span className="text-[#516778] text-sm truncate">{t.method}</span>
                        <span className="text-[#516778] text-sm truncate">{t.category ?? "Other"}</span>{/* NEW */}
                        <span className="text-[#516778] text-sm">
                          {new Date(t.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center justify-end space-x-2">
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
        </div>
      </main>
    </div>
  );
}
