# Crest Logistics

Premium integrated shipping and cargo tracking platform for domestic and international freight — built with Next.js, Express, PostgreSQL (Supabase), and Google Gemini AI.

## Overview

Crest Logistics is a full-stack logistics management platform that lets administrators register shipments, generate AI-powered routing insights, track packages in real time, and dispatch automated notifications to recipients via WhatsApp, SMS, or Email. Public users can track their shipments live using a tracking ID.

## Features

- **Public Shipment Tracking** — Customers track packages in real time using a Crest Tracking ID, with live status updates, route maps, and milestone history
- **Admin Operations Console** — Secure admin portal to create, edit, and manage shipments
- **AI Logistics Insights** — Google Gemini-powered route optimization, risk assessment, carrier suggestions, and auto-generated dispatch messages, with a deterministic heuristic fallback when AI is unavailable
- **Domestic Waybill Generator** — Full FedEx/USPS-style domestic shipping form with service tiers, packaging types, surcharges, and insurance options
- **Live Route Simulation** — Animate shipment progress along a route with adjustable driving hours and distance covered
- **Multi-Channel Dispatch Simulator** — Simulate WhatsApp, SMS, and Email notifications to recipients with live message previews
- **AI Support Chatbot** — In-app chat widget for customer support with human handoff escalation
- **Dark Mode** — Full light/dark theme support across the entire application

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Animation | Motion (Framer Motion) |
| Icons | Lucide React |
| Backend | Express.js |
| Database | PostgreSQL via Supabase |
| AI | Google Gemini AI (`@google/genai`) |
| Testing | Jest |
| Deployment | Vercel |

## Project Structure

```
crest-logistics/
├── server.ts                 # Express backend — API routes, AI integration
├── src/
│   ├── App.tsx               # Main application component (public + admin views)
│   ├── db.ts                 # PostgreSQL connection pool and data access functions
│   ├── types.ts               # Shared TypeScript types
│   ├── utils.ts               # Geocoding, distance calculation, sample data
│   ├── components/
│   │   ├── Header.tsx
│   │   └── TrackingMockMap.tsx
│   └── __tests__/
│       └── backend.test.ts   # Jest test suite for API endpoints
├── .env                       # Environment variables (not committed)
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (PostgreSQL database)
- A Google Gemini API key (optional — app falls back to heuristic logic without one)

### Installation

```bash
git clone https://github.com/ulrich-killian/crestlogic.git
cd crestlogic
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_postgres_connection_string
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY=your_google_maps_key   # optional
NEXT_PUBLIC_BASE_URL=http://localhost:3000                  # used by tests
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Running Tests

Start the dev server in one terminal, then run tests in another:

```bash
npm run dev      # terminal 1
npm test         # terminal 2
```

### Building for Production

```bash
npm run build
npm start
```

## Database Schema

Shipments are stored in a single `shipments` table:

```sql
CREATE TABLE shipments (
  order_id   TEXT PRIMARY KEY,
  data       JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Each shipment's full record — customer info, items, status, history, AI insights, and coordinates — is stored as a JSONB blob keyed by `order_id`.

## Admin Access

The admin console is available by clicking **Authorized Admin Login** in the navbar.

> **Demo credentials:** username `admin`, password `admin2026`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/logistics-ai` | Generate AI routing insights for a shipment |
| `GET` | `/api/shipments` | List all shipments |
| `GET` | `/api/shipments/:id` | Retrieve a single shipment by tracking ID |
| `POST` | `/api/register-shipment` | Create or update a shipment |
| `DELETE` | `/api/shipments/:id` | Delete a shipment |
| `POST` | `/api/auth` | Admin login |
| `POST` | `/api/chat` | AI support chatbot |
| `POST` | `/api/geocode` | Geocode an address to coordinates |

## Deployment

This project is configured for deployment on **Vercel**. The `.next` build output and `node_modules` are excluded from version control via `.gitignore` — Vercel regenerates them automatically during deployment.

## License

Apache-2.0