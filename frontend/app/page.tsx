"use client";
import { useEffect, useState, useCallback } from "react";
import { api, Event, formatDate, extractErrorMessage } from "@/lib/api";

const SORT_OPTIONS = [
  { value: "", label: "Sort: Default" },
  { value: "date_asc", label: "Date ↑" },
  { value: "date_desc", label: "Date ↓" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
];

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [sortBy, setSortBy] = useState("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterDate) params.date = filterDate;
      if (filterLocation) params.location = filterLocation;
      if (sortBy) params.sortBy = sortBy;
      const res = await api.events.list(params);
      setEvents(res.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, filterDate, filterLocation, sortBy]);

  useEffect(() => {
    const t = setTimeout(fetchEvents, 300);
    return () => clearTimeout(t);
  }, [fetchEvents]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.events.delete(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(extractErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const hasFilters = search || filterDate || filterLocation || sortBy;

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "4px" }}>Events</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          {loading ? "Loading…" : `${events.length} event${events.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 160px 150px", gap: "10px", marginBottom: "16px" }}>
        <input className="input" placeholder="Search by name or description…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input className="input" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ colorScheme: "dark" }} />
        <input className="input" placeholder="Filter by location" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} />
        <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ cursor: "pointer" }}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {hasFilters && (
        <div style={{ marginBottom: "16px" }}>
          <button className="btn btn-ghost" onClick={() => { setSearch(""); setFilterDate(""); setFilterLocation(""); setSortBy(""); }} style={{ fontSize: "12px", padding: "5px 12px" }}>
            ✕ Clear filters
          </button>
        </div>
      )}

      {error && (
        <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: "var(--radius)", padding: "12px 16px", color: "#fca5a5", marginBottom: "20px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      {!loading && events.length === 0 && !error ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius)" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>📅</div>
          <p style={{ marginBottom: "16px" }}>{hasFilters ? "No events match your filters." : "No events yet."}</p>
          {!hasFilters && <a href="/events/new" className="btn btn-primary">Create your first event</a>}
        </div>
      ) : (
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 150px 150px 200px", gap: "16px", padding: "10px 20px", background: "#111", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <span>ID</span><span>Event</span><span>Date</span><span>Location</span><span>Actions</span>
          </div>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 150px 150px 200px", gap: "16px", padding: "16px 20px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                  {Array.from({ length: 5 }).map((_, j) => <div key={j} style={{ height: "14px", borderRadius: "4px", background: "var(--border)" }} />)}
                </div>
              ))
            : events.map((event, idx) => (
                <div key={event.id}
                  style={{ display: "grid", gridTemplateColumns: "60px 1fr 150px 150px 200px", gap: "16px", padding: "14px 20px", borderBottom: idx < events.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#1f1f1f")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-muted)" }}>#{event.id}</span>
                  <div>
                    <a href={`/events/${event.id}`} style={{ fontWeight: 500, color: "var(--text)", textDecoration: "none", display: "block", marginBottom: "2px", transition: "color 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}>
                      {event.name}
                    </a>
                    {event.description && <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.description}</span>}
                  </div>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{formatDate(event.date)}</span>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{event.location || "—"}</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <a href={`/events/${event.id}`} className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "12px" }}>View</a>
                    <a href={`/events/${event.id}/edit`} className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "12px" }}>Edit</a>
                    <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: "12px" }} onClick={() => handleDelete(event.id)} disabled={deletingId === event.id}>
                      {deletingId === event.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
