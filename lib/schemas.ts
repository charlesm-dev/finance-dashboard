// lib/schemas.ts
import { z } from "zod";

export const goalCreateSchema = z.object({
  title: z.string().min(1),
  targetAmount: z.number().finite().nonnegative(),
  currentAmount: z.number().finite().nonnegative().optional(),
  dueDate: z
    .string()
    .optional()
    .refine(v => !v || !Number.isNaN(Date.parse(v)), "Invalid date"),
});

export const goalUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  targetAmount: z.number().finite().nonnegative().optional(),
  currentAmount: z.number().finite().nonnegative().optional(),
  dueDate: z
    .string()
    .optional()
    .refine(v => !v || !Number.isNaN(Date.parse(v)), "Invalid date"),
});
