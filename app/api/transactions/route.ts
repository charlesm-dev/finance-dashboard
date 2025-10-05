import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const { rows } = await pool.query(`
    SELECT
      id::text AS id,
      description,
      method,
      date,
      amount,
      positive,
      category              -- <- MUST be included, no alias change
    FROM transactions
    ORDER BY date DESC, id DESC
  `);
  return NextResponse.json(rows);
}

const createSchema = z.object({
  description: z.string().min(1),
  method: z.string().min(1),
  date: z.string(),
  amount: z.string(),
  positive: z.boolean(),
  category: z.string().min(1).default("Other"), // if you used ENUM, consider z.enum([...])
});

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { description, method, date, amount, positive, category } = parsed.data;

  const { rows } = await pool.query(
    `
    INSERT INTO transactions (description, method, date, amount, positive, category)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id::text AS id,
      description, method, date, amount, positive, category
    `,
    [description, method, date, amount, positive, category]
  );

  return NextResponse.json(rows[0], { status: 201 });
}
