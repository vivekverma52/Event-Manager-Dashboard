import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Manager",
  description: "Create, manage and track events",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{
          borderBottom: "1px solid var(--border)",
          padding: "0 32px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "var(--bg)",
          zIndex: 50,
        }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              background: "var(--accent)",
              color: "#0f0f0f",
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
            }}>E</span>
            <span style={{ fontWeight: 600, color: "var(--text)", fontSize: "15px" }}>EventManager</span>
          </a>
          <a href="/events/new" className="btn btn-primary" style={{ padding: "7px 14px", fontSize: "13px" }}>
            + New Event
          </a>
        </header>
        <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
