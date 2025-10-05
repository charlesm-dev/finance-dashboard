import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getUserId();
  const { rows } = await pool.query(
    `SELECT
       id::text               AS "id",
       title                  AS "title",
       body                   AS "body",
       href                   AS "href",
       read                   AS "read",
       created_at             AS "createdAt"
     FROM public.notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [userId]
  );
  return NextResponse.json(rows);
}
