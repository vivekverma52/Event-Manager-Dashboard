import { z } from "zod";

export const createEventSchema = z.object({
  name: z
    .string()
    .min(1, "Event name is required")
    .max(200, "Event name too long"),
  description: z.string().max(2000, "Description too long").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  location: z.string().max(300, "Location too long").optional(),
});

export const updateEventSchema = z.object({
  name: z
    .string()
    .min(1, "Event name is required")
    .max(200, "Event name too long")
    .optional(),
  description: z.string().max(2000, "Description too long").optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  location: z.string().max(300, "Location too long").optional(),
});

export const createRegistrationSchema = z.object({
  participant_name: z
    .string()
    .min(1, "Participant name is required")
    .max(200, "Name too long"),
  participant_email: z.string().email("Invalid email address"),
});

export const cancelRegistrationSchema = z.object({
  reason: z
    .string()
    .min(1, "Cancel reason is required")
    .max(500, "Reason too long"),
});

export const eventFilterSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  sortBy: z
    .enum(["date_asc", "date_desc", "name_asc", "name_desc"])
    .optional(),
});
