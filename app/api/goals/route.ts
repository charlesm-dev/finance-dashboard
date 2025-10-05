// app/api/goals/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { goalCreateSchema } from "@/lib/schemas";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getUserId();
  const { rows } = await pool.query(
    `
    SELECT
      id::text                           AS "id",
      name                                AS "title",
      COALESCE(target_amount, 0)::float8  AS "targetAmount",
      COALESCE(current_amount, 0)::float8 AS "currentAmount",
      due_date                            AS "dueDate",
      created_at                          AS "createdAt"
    FROM public.goals
    WHERE user_id = $1
    ORDER BY due_date NULLS LAST, created_at DESC
    `,
    [userId]
  );
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = goalCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const userId = await getUserId();
  const { title, targetAmount, dueDate, currentAmount = 0 } = parsed.data;

  const { rows } = await pool.query(
    `
    INSERT INTO public.goals (user_id, name, target_amount, current_amount, due_date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id::text                           AS "id",
      name                                AS "title",
      COALESCE(target_amount, 0)::float8  AS "targetAmount",
      COALESCE(current_amount, 0)::float8 AS "currentAmount",
      due_date                            AS "dueDate",
      created_at                          AS "createdAt"
    `,
    [userId, title, targetAmount, currentAmount, dueDate ?? null]
  );

  return NextResponse.json(rows[0], { status: 201 });
}
