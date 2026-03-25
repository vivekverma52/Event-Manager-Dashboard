"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, Event, Registration, extractErrorMessage, formatDate } from "@/lib/api";

export default function DashboardPage() {
  const params = useParams();
  const id = Number(params.id);

  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [counts, setCounts] = useState({ registered: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cancel modal state
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.registrations.list(id);
        setEvent(res.event);
        setRegistrations(res.data);
        setCounts(res.counts);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const openCancel = (regId: number) => {
    setCancellingId(regId);
    setCancelReason("");
    setCancelError("");
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setCancelError("Please provide a reason for cancellation.");
      return;
    }
    setCancelLoading(true);
    setCancelError("");
    try {
      const res = await api.registrations.cancel(cancellingId!, cancelReason);
      setRegistrations((prev) => prev.map((r) => r.id === cancellingId! ? res.data : r));
      setCounts((prev) => ({ registered: prev.registered - 1, cancelled: prev.cancelled + 1 }));
      setCancellingId(null);
    } catch (err) {
      setCancelError(extractErrorMessage(err));
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <div style={{ color: "var(--text-muted)", padding: "40px 0" }}>Loading…</div>;

  if (error) return (
    <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: "var(--radius)", padding: "16px", color: "#fca5a5" }}>
      {error}
    </div>
  );

  if (!event) return null;

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <a href={`/events/${id}`} style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "13px" }}>← Back to event</a>
      </div>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "4px" }}>Dashboard</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{event.name} · {formatDate(event.date)}</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
        {[
          { label: "Total Registrations", value: counts.registered + counts.cancelled },
          { label: "Registered", value: counts.registered },
          { label: "Cancelled", value: counts.cancelled },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: "28px", fontWeight: 600, marginBottom: "4px" }}>{stat.value}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Participants table */}
      {registrations.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius)" }}>
          No registrations yet.
        </div>
      ) : (
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 120px 130px", gap: "16px", padding: "10px 20px", background: "#111", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <span>Participant</span>
            <span>Registered</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {registrations.map((reg, idx) => (
            <div key={reg.id}
              style={{ display: "grid", gridTemplateColumns: "1fr 200px 120px 130px", gap: "16px", padding: "14px 20px", borderBottom: idx < registrations.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center", transition: "background 0.1s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1f1f1f")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: "14px", marginBottom: "2px" }}>{reg.participant_name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{reg.participant_email}</div>
                {reg.status === "cancelled" && reg.cancel_reason && (
                  <div style={{ fontSize: "11px", color: "#fca5a5", marginTop: "4px" }}>
                    Reason: {reg.cancel_reason}
                  </div>
                )}
              </div>

              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {new Date(reg.registered_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
              </span>

              <span>
                <span className={`badge ${reg.status === "registered" ? "badge-green" : "badge-red"}`}>
                  {reg.status}
                </span>
              </span>

              <span>
                {reg.status === "registered" ? (
                  <button
                    className="btn btn-danger"
                    style={{ padding: "4px 12px", fontSize: "12px" }}
                    onClick={() => openCancel(reg.id)}
                  >
                    Cancel
                  </button>
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Cancel modal */}
      {cancellingId !== null && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px",
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "440px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>Cancel Registration</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "18px" }}>
              Please provide a reason for cancelling this registration.
            </p>

            {cancelError && (
              <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: "var(--radius)", padding: "10px 14px", color: "#fca5a5", marginBottom: "14px", fontSize: "13px" }}>
                {cancelError}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label className="label">Reason *</label>
              <textarea
                className="input"
                placeholder="e.g. Participant requested cancellation"
                value={cancelReason}
                onChange={(e) => { setCancelReason(e.target.value); setCancelError(""); }}
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn btn-danger" onClick={handleCancel} disabled={cancelLoading} style={{ flex: 1 }}>
                {cancelLoading ? "Cancelling…" : "Confirm Cancellation"}
              </button>
              <button className="btn btn-ghost" onClick={() => setCancellingId(null)} disabled={cancelLoading}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
