import { z } from "zod";

// Issue schema
const IssueSchema = z.object({
  message: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]),
});

// Full review schema
const ReviewSchema = z.object({
  issues: z.array(IssueSchema),
  suggestions: z.array(z.string()).optional(),
  score: z.number().min(0).max(10),
  summary: z.string().min(1),
});

// Reflection schema  
const ReflectionSchema = z.object({
  validIssues: z.array(
    z.object({
      message: z.string(),
      severity: z.string(),
      valid: z.boolean(),
    })
  ),
  removedIssues: z.array(z.any()),
  confidence: z.number().min(0).max(1),
  finalScore: z.number().min(0).max(10),
  notes: z.string(),
});

// Validation functions

export function validateReview(data) {
  return ReviewSchema.safeParse(data);
}

export function validateReflection(data) {
  return ReflectionSchema.safeParse(data);
}
