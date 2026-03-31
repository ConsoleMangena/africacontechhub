# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Africa ConTech Hub — a construction management SaaS connecting Aspirational Builders, Professional Contractors, and Material Suppliers. Django backend + React/TypeScript frontend, deployed via Docker on DigitalOcean.

## Tech Stack

- **Backend:** Django 4.2+, Django REST Framework, Supabase (PostgreSQL + JWT auth), Gunicorn
- **Frontend:** React 19, TypeScript, Vite, TanStack Router (file-based routing), TanStack Query, shadcn/ui, TailwindCSS, Zustand
- **AI:** Gemini 3.1 Pro/Flash via `langchain-anthropic`, MCP servers
- **Auth:** Supabase JWT — frontend gets token from Supabase, Axios interceptor injects it, Django custom backend verifies it
- **Deploy:** Docker Compose, Nginx reverse proxy, Let's Encrypt SSL

## Common Commands

### Frontend (`frontend/`)
```bash
npm run dev          # Start dev server
npm run build        # Vite production build
npm run build:ci     # Typecheck + build
npm run lint         # ESLint
npm run format       # Prettier
```

### Backend (`backend/`)
```bash
python manage.py runserver          # Dev server
python manage.py migrate            # Run migrations
python manage.py makemigrations     # Create migrations
python manage.py test apps.<app>    # Run tests for one app
```

### Docker
```bash
docker compose up --build           # Local dev (backend:8000, frontend:80)
docker compose -f docker-compose.prod.yml up -d --build  # Production
./deploy.sh deploy                  # Full production deploy (pull, build, migrate, restart)
```

## Architecture

### Backend (`backend/`)
- **Config:** `config/settings.py`, `config/urls.py`
- **Apps follow pattern:** `models.py`, `views.py`, `urls.py`, `serializers.py`, `admin.py`
- **Domain apps:** `builder_dashboard` (B2C), `contractor_dashboard` (B2B), `supplier_dashboard`, `billing`, `admin_dashboard`
- **Shared:** `core` (common models/utilities), `authentication` (Supabase JWT backend)
- **AI:** `ai_architecture` (chat, image analysis, document processing), `architectural_studio`
- **API pattern:** All endpoints under `/api/v1/[domain]/[resource]`
- **Rate limits:** 20/min anon, 120/min authenticated, 30/min AI chat, 10/min AI generate

### Frontend (`frontend/src/`)
- **Routing:** TanStack Router file-based — `routes/_authenticated/` for protected pages, `routes/(auth)/` for public
- **Route tree auto-generated:** `routeTree.gen.ts` — do not edit manually
- **API layer:** `services/api.ts` — Axios instance with Supabase JWT injection, token caching/refresh
- **State:** Zustand (`stores/auth-store.ts`) for auth, TanStack Query for server state, React Context for theme/direction/font
- **Components:** `components/ui/` is shadcn/ui primitives; `components/` for app-level reusable components; `features/` for domain logic
- **Path alias:** `@/*` maps to `src/*`
- **Forms:** React Hook Form + Zod validation

### Integration Flow
Frontend → Supabase auth → Axios interceptor adds Bearer token → Django `SupabaseAuthentication` backend verifies JWT → DRF views

## Environment Variables

Backend: `SECRET_KEY`, `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`, `CORS_ALLOWED_ORIGINS`
Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`

See `.env.production.example` for full list.
