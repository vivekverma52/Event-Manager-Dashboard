"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, Event, extractErrorMessage, formatDate } from "@/lib/api";
import { z } from "zod";

const registerSchema = z.object({
  participant_name: z.string().min(1, "Name is required").max(200, "Too long"),
  participant_email: z.string().email("Invalid email address"),
});

type RegForm = { participant_name: string; participant_email: string };
type RegErrors = Partial<Record<keyof RegForm, string>>;

export default function EventDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RegForm>({ participant_name: "", participant_email: "" });
  const [formErrors, setFormErrors] = useState<RegErrors>({});
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState("");
  const [regError, setRegError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.events.get(id);
        setEvent(res.data);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const set = (field: keyof RegForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    setRegError("");
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess("");
    setRegError("");

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: RegErrors = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0] as keyof RegForm] = err.message;
      });
      setFormErrors(fieldErrors);
      return;
    }

    setRegLoading(true);
    try {
      await api.registrations.register(id, result.data);
      setRegSuccess("You have successfully registered for this event!");
      setForm({ participant_name: "", participant_email: "" });
      setShowForm(false);
    } catch (err) {
      setRegError(extractErrorMessage(err));
    } finally {
      setRegLoading(false);
    }
  };

  if (loading) return (
    <div style={{ color: "var(--text-muted)", padding: "40px 0" }}>Loading…</div>
  );

  if (error) return (
    <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: "var(--radius)", padding: "16px", color: "#fca5a5" }}>
      {error}
    </div>
  );

  if (!event) return null;

  return (
    <div style={{ maxWidth: "680px" }}>
      <div style={{ marginBottom: "24px" }}>
        <a href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "13px" }}>← Events</a>
      </div>

      {/* Event card */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", gap: "12px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600 }}>{event.name}</h1>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <a href={`/events/${event.id}/edit`} className="btn btn-ghost" style={{ fontSize: "13px", padding: "6px 14px" }}>Edit</a>
            <a href={`/events/${event.id}/dashboard`} className="btn btn-ghost" style={{ fontSize: "13px", padding: "6px 14px" }}>Dashboard</a>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div>
            <span className="label">ID</span>
            <span style={{ fontFamily: "monospace", fontSize: "13px" }}>#{event.id}</span>
          </div>
          <div>
            <span className="label">Date</span>
            <span style={{ fontSize: "14px" }}>{formatDate(event.date)}</span>
          </div>
          <div>
            <span className="label">Location</span>
            <span style={{ fontSize: "14px" }}>{event.location || "—"}</span>
          </div>
        </div>

        {event.description && (
          <div>
            <span className="label">Description</span>
            <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>{event.description}</p>
          </div>
        )}
      </div>

      {/* Apply section */}
      {regSuccess && (
        <div style={{ background: "#14532d", border: "1px solid #166534", borderRadius: "var(--radius)", padding: "12px 16px", color: "#86efac", marginBottom: "16px", fontSize: "14px" }}>
          ✓ {regSuccess}
        </div>
      )}

      {!showForm ? (
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ fontSize: "14px" }}>
          Apply to this Event
        </button>
      ) : (
        <div className="card">
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "18px" }}>Apply to this Event</h2>

          {regError && (
            <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: "var(--radius)", padding: "10px 14px", color: "#fca5a5", marginBottom: "16px", fontSize: "13px" }}>
              {regError}
            </div>
          )}

          <form onSubmit={handleApply} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label className="label">Your Name *</label>
              <input className="input" placeholder="Full name" value={form.participant_name} onChange={set("participant_name")} />
              {formErrors.participant_name && <p className="field-error">{formErrors.participant_name}</p>}
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.participant_email} onChange={set("participant_email")} />
              {formErrors.participant_email && <p className="field-error">{formErrors.participant_email}</p>}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="btn btn-primary" disabled={regLoading}>
                {regLoading ? "Submitting…" : "Submit Application"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setFormErrors({}); setRegError(""); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
