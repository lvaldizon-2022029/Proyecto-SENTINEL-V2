import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const formatIssues = (error: z.ZodError) =>
  error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`).join("; ");

export const validateWith = (schema: z.ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: formatIssues(parsed.error) });
  }
  req.body = parsed.data;
  next();
};
export const paginationQuerySchema = z.object({
  search: z.string().trim().max(200).optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export const validateQueryWith = (schema: z.ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
  const parsed = schema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: formatIssues(parsed.error) });
  }
  req.query = parsed.data as Request["query"];
  next();
};
