// app/api/goals/[id]/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: goalId } = await ctx.params;  // await params
  const userId = await getUserId();

  const { rows: gRows } = await pool.query(
    `
    SELECT
      id::text AS id,
      COALESCE(name, 'Untitled goal') AS title,
      COALESCE(target_amount, 0) AS target_amount,
      COALESCE(current_amount, 0) AS current_amount
    FROM public.goals
    WHERE id = $1 AND user_id = $2
    `,
    [goalId, userId]
  );
  if (gRows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const g = gRows[0];

  await pool.query(
    `DELETE FROM public.goals WHERE id = $1 AND user_id = $2`,
    [goalId, userId]
  );

  // ✅ No stray brace here
  await pool.query(
    `
    INSERT INTO public.notifications (user_id, title, body, href)
    VALUES ($1, $2, $3, $4)
    `,
    [
      userId,
      "Goal completed ✅",
      `You completed your "${g.title}" goal!`,
      "/goals",
    ]
  );

  return NextResponse.json({ ok: true });
}
