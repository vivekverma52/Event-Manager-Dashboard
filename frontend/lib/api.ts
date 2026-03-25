const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface Event {
  id: number;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: number;
  event_id: number;
  participant_name: string;
  participant_email: string;
  status: "registered" | "cancelled";
  cancel_reason: string | null;
  registered_at: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: { field: string; message: string }[];
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw data as ApiError;
  return data;
}

export const api = {
  events: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ success: true; data: Event[]; count: number }>(`/api/events${qs}`);
    },
    get: (id: number) =>
      request<{ success: true; data: Event }>(`/api/events/${id}`),
    create: (body: Omit<Event, "id" | "created_at" | "updated_at">) =>
      request<{ success: true; data: Event }>("/api/events", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: number, body: Partial<Omit<Event, "id" | "created_at" | "updated_at">>) =>
      request<{ success: true; data: Event }>(`/api/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    delete: (id: number) =>
      request<{ success: true; message: string }>(`/api/events/${id}`, { method: "DELETE" }),
  },
  registrations: {
    list: (eventId: number) =>
      request<{ success: true; data: Registration[]; counts: { registered: number; cancelled: number }; event: Event }>(
        `/api/events/${eventId}/participants`
      ),
    register: (eventId: number, body: { participant_name: string; participant_email: string }) =>
      request<{ success: true; data: Registration }>(`/api/events/${eventId}/register`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    cancel: (id: number, reason: string) =>
      request<{ success: true; data: Registration }>(`/api/registrations/${id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      }),
  },
};

export function formatDate(dateStr: string) {
  const d = new Date(dateStr.slice(0, 10) + "T00:00:00");
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "error" in err) {
    const e = err as ApiError;
    if (e.details?.length) {
      return e.details.map((d) => d.message).join(", ");
    }
    return e.error;
  }
  return "Something went wrong. Please try again.";
}
