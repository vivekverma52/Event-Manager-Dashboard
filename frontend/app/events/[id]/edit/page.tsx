"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, Event, extractErrorMessage } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Event name is required").max(200, "Too long"),
  description: z.string().max(2000, "Too long").optional(),
  date: z.string().min(1, "Date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  location: z.string().max(300, "Too long").optional(),
});

type FormData = { name: string; description: string; date: string; location: string };
type FieldErrors = Partial<Record<keyof FormData, string>>;

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [event, setEvent] = useState<Event | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [form, setForm] = useState<FormData>({ name: "", description: "", date: "", location: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.events.get(id);
        const e = res.data;
        setEvent(e);
        setForm({
          name: e.name,
          description: e.description || "",
          date: e.date.slice(0, 10),
          location: e.location || "",
        });
      } catch (err) {
        setFetchError(extractErrorMessage(err));
      } finally {
        setFetchLoading(false);
      }
    };
    fetch();
  }, [id]);

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
        fieldErrors[err.path[0] as keyof FormData] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      await api.events.update(id, result.data);
      router.push(`/events/${id}`);
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (fetchLoading) return <div style={{ color: "var(--text-muted)", padding: "40px 0" }}>Loading…</div>;

  if (fetchError) return (
    <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: "var(--radius)", padding: "16px", color: "#fca5a5" }}>
      {fetchError}
    </div>
  );

  if (!event) return null;

  return (
    <div style={{ maxWidth: "560px" }}>
      <div style={{ marginBottom: "28px" }}>
        <a href={`/events/${id}`} style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "13px" }}>← Back to event</a>
        <h1 style={{ fontSize: "22px", fontWeight: 600, marginTop: "8px" }}>Edit Event</h1>
      </div>

      {apiError && (
        <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: "var(--radius)", padding: "12px 16px", color: "#fca5a5", marginBottom: "20px", fontSize: "14px" }}>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label className="label">Event Name *</label>
          <input className="input" value={form.name} onChange={set("name")} />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input" value={form.description} onChange={set("description")} rows={4} style={{ resize: "vertical" }} />
          {errors.description && <p className="field-error">{errors.description}</p>}
        </div>

        <div>
          <label className="label">Date *</label>
          <input className="input" type="date" value={form.date} onChange={set("date")} style={{ colorScheme: "dark" }} />
          {errors.date && <p className="field-error">{errors.date}</p>}
        </div>

        <div>
          <label className="label">Location</label>
          <input className="input" value={form.location} onChange={set("location")} />
          {errors.location && <p className="field-error">{errors.location}</p>}
        </div>

        <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <a href={`/events/${id}`} className="btn btn-ghost">Cancel</a>
        </div>
      </form>
    </div>
  );
}
