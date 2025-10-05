import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export async function POST() {
  const userId = await getUserId();
  await pool.query(
    `UPDATE public.notifications
     SET read = TRUE
     WHERE user_id = $1 AND read = FALSE`,
    [userId]
  );
  return NextResponse.json({ ok: true });
}
