import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getUserId();
  const { read } = await req.json().catch(() => ({ read: true }));
  await pool.query(
    `UPDATE public.notifications
     SET read = $1
     WHERE id = $2 AND user_id = $3`,
    [!!read, params.id, userId]
  );
  return NextResponse.json({ ok: true });
}
