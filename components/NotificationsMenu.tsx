"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  body?: string;
  href?: string | null;
  read: boolean;
  createdAt: string; // ISO
};


export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.read).length,
    [items]
  );

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        const data: Notification[] = await res.json();
        if (!cancelled) setItems(data);
      } catch (e) {
        // noop or toast
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  const markRead = async (id: string) => {
    // optimistic
    setItems((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map(n => ({ ...n, read: true })));
    await fetch(`/api/notifications/mark-all-read`, { method: "POST" });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-[#516778]">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f04438] text-white text-[10px] flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[360px] p-0 overflow-hidden border-[#eceff2]"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#eceff2] bg-white">
          <div className="font-semibold text-[#101828]">Notifications</div>
          <button
            className={cn(
              "text-xs text-[#516778] hover:text-[#101828]",
              unreadCount === 0 && "opacity-50 cursor-default"
            )}
            onClick={unreadCount ? markAllRead : undefined}
          >
            Mark all as read
          </button>
        </div>

        <div className="max-h-[360px] overflow-auto bg-white">
          {loading ? (
            <div className="py-10 flex items-center justify-center text-[#516778]">
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-[#516778]">No notifications</div>
          ) : (
            <ul className="divide-y divide-[#eceff2]">
              {items.map((n) => (
                <li key={n.id} className="p-4 hover:bg-[#f9fafb]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#101828] truncate">{n.title}</span>
                        {!n.read && (
                          <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-[#eff6ff] text-[#155eef]">
                            New
                          </span>
                        )}
                      </div>
                      {n.body && (
                        <p className="text-sm text-[#516778] mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                      )}
                      <p className="text-xs text-[#667085] mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {n.href && (
                        <a
                          href={n.href}
                          className="text-xs text-[#155eef] hover:underline"
                          onClick={() => markRead(n.id)}
                        >
                          Open
                        </a>
                      )}
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="p-1 rounded hover:bg-[#f2f4f7]"
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <Check className="w-4 h-4 text-[#155eef]" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
