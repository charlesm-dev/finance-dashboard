SELECT
  id::text AS "id",
  name AS "title",
  COALESCE(target_amount, 0)::float8 AS "targetAmount",
  COALESCE(current_amount, 0)::float8 AS "currentAmount",
  due_date AS "dueDate",
  created_at AS "createdAt"
FROM public.goals
WHERE user_id = 'your-user-id-here'
ORDER BY created_at DESC
LIMIT 100;
