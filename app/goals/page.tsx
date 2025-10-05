// app/goals/page.tsx
import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddGoalForm from "./AddGoalForm";
import NotificationsMenu from "@/components/NotificationsMenu";
import GoalsList from "@/components/GoalsList"; // client component ("use client" at top of its file)

export default function GoalsPage() {
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
            <nav className="flex space-x-6">
              <Link href="/" className="text-[#516778] hover:text-[#101828]">Overview</Link>
              <Link href="/transactions" className="text-[#516778] hover:text-[#101828]">Transactions</Link>
              <Link href="/goals" className="text-[#155eef] font-semibold">Goals</Link>
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#101828]">Goals</h1>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <Card className="bg-white border-[#eceff2] shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#101828] mb-4">Your goals</h3>
                <AddGoalForm />
                {/* ⬇️ Only one table: the client component handles fetching + delete */}
                <GoalsList />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
