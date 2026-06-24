# Fitnexia Web

Web client for Fitnexia — built with **Next.js** (App Router) and Tailwind CSS. Connects to the shared Fitnexia API (`fitnexia-backend`).

## Shared with mobile

Keep in sync when API contracts change:

- `src/types/api.ts` — API DTOs
- `src/constants/features.ts` — feature flags
- `src/constants/labels.ts` — product copy
- `src/utils/*` — search, metrics, schedule helpers
- `src/contexts/*` — auth, classes, bookings, reviews (API-backed)
- `src/services/api.ts` — API client

API docs: `fitnexia-backend/docs/API.md`

## Get started

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL, OAuth, etc.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

```env
NEXT_PUBLIC_API_URL=https://your-api-host/fitnexia-api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `.env.example` for Google OAuth variables.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |

## Route map (parity with mobile)

| Mobile (Expo Router) | Web (Next.js) |
|----------------------|---------------|
| `/(auth)/onboarding` | `/onboarding` |
| `/(auth)/login` | `/auth/login` |
| `/(athlete)/(tabs)/home` | `/athlete/home` |
| `/class/[id]` | `/class/[id]` |
| `/book/[classId]` | `/book/[classId]` |
| `/(instructor)/(tabs)/dashboard` | `/instructor/dashboard` |
| `/(gym)/(tabs)/dashboard` | `/gym/dashboard` |
| `/create-class` | `/instructor/create-class` |
