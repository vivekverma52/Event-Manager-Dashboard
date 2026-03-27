Event Manager Dashboard 
## 🎯 Overview
A production-ready **Event Management System** for creating, managing events and handling participant registrations. Features a sleek dark-themed UI and robust full-stack TypeScript API.

**Key Features:**
- ✅ Full CRUD for Events (name, description, date, location)
- ✅ Participant registration per event (unique email validation)
- ✅ Event dashboard with stats (registered/cancelled) & participant management (cancel w/ reason)
- ✅ Advanced event listing: search, filter (date/location), sort (date/name)
- ✅ Responsive design, loading states, error handling, Zod validation (client/server)
- ✅ Postgres with proper schema (FK cascade delete, indexes ready)

## 🏗️ Tech Stack
- **Backend:** Node.js, Express, TypeScript, Zod, pg (Postgres)
- **Frontend:** Next.js 14 App Router, React 19, TailwindCSS (custom dark theme), Lucide icons
- **Database:** PostgreSQL
- **Validation:** Zod (client + server)
- **Deployment:** Vercel (FE), Railway (BE + DB)

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 20+
- PostgreSQL (local or cloud)
- pnpm (FE), npm (BE)

### 1. Clone & Install
```bash
git clone <your-repo> event-manager
cd event-manager
```

**Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Edit DATABASE_URL
npm run db:init      # Create tables
npm run dev          # http://localhost:4000/health
```

**Frontend:**
```bash
cd ../frontend
pnpm install
# Set NEXT_PUBLIC_API_URL=http://localhost:4000 in .env.local
pnpm dev             # http://localhost:3000
```

### Environment Variables
See `backend/.env.example`.

## 📁 Folder Structure
```
event-manager/
├── backend/          # Express API
│   ├── src/
│   │   ├── config/   # DB pool + init
│   │   ├── controllers/ # Business logic
│   │   ├── middleware/  # Zod + errors
│   │   ├── models/     # DB queries (typesafe)
│   │   └── routes/
│   └── package.json
├── frontend/         # Next.js App
│   ├── app/          # Pages: /, /events/[id], new, edit, dashboard
│   ├── lib/api.ts    # Typed API client
│   └── globals.css   # Custom Tailwind theme
└── README.md         # This file
```

## 🔗 API Documentation
Base: `http://localhost:4000/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/events` | GET | List events (?search=&date=&location=&sortBy=) |
| `/events/:id` | GET \| PUT \| DELETE | Single event |
| `/events/:id/participants` | GET | Registrations + counts |
| `/events/:id/register` | POST | Register (name, email) |
| `/registrations/:id/cancel` | PATCH | Cancel w/ reason |

**Example cURL:**
```bash
curl -X POST http://localhost:4000/api/events \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Test","date":"2024-12-01"}'
```

## 🔄 Deployment
- **Frontend (Vercel):** `pnpm build` → vercel --prod
- **Backend (Railway):** `npm run build` → railway up (auto DB)
- **AWS Alternative:** EC2 + Nginx + RDS (Dockerfiles ready)


