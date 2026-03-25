"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, extractErrorMessage } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Event name is required").max(200, "Too long"),
  description: z.string().max(2000, "Too long").optional(),
  date: z.string().min(1, "Date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  location: z.string().max(300, "Too long").optional(),
});

type FormData = { name: string; description: string; date: string; location: string };
type FieldErrors = Partial<Record<keyof FormData, string>>;

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ name: "", description: "", date: "", location: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await api.events.create(result.data as Parameters<typeof api.events.create>[0]);
      router.push(`/events/${res.data.id}`);
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "560px" }}>
      <div style={{ marginBottom: "28px" }}>
        <a href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "13px" }}>← Events</a>
        <h1 style={{ fontSize: "22px", fontWeight: 600, marginTop: "8px" }}>Create Event</h1>
      </div>

      {apiError && (
        <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: "var(--radius)", padding: "12px 16px", color: "#fca5a5", marginBottom: "20px", fontSize: "14px" }}>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label className="label">Event Name *</label>
          <input className="input" placeholder="e.g. Annual Tech Conference" value={form.name} onChange={set("name")} />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            placeholder="What is this event about?"
            value={form.description}
            onChange={set("description")}
            rows={4}
            style={{ resize: "vertical" }}
          />
          {errors.description && <p className="field-error">{errors.description}</p>}
        </div>

        <div>
          <label className="label">Date *</label>
          <input className="input" type="date" value={form.date} onChange={set("date")} style={{ colorScheme: "dark" }} />
          {errors.date && <p className="field-error">{errors.date}</p>}
        </div>

        <div>
          <label className="label">Location</label>
          <input className="input" placeholder="e.g. New York, NY" value={form.location} onChange={set("location")} />
          {errors.location && <p className="field-error">{errors.location}</p>}
        </div>

        <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating…" : "Create Event"}
          </button>
          <a href="/" className="btn btn-ghost">Cancel</a>
        </div>
      </form>
    </div>
  );
}
