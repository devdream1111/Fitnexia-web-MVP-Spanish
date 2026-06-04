# Fitnexia Web

Web client for Fitnexia — **same MVP functionality** as [fitnexia-mobile](../fitnexia-mobile), built with **Next.js 15** (App Router) and Tailwind CSS.

## Shared with mobile

Copied/synced from the mobile app (keep in sync when contracts change):

- `src/types/api.ts` — API DTOs
- `src/constants/features.ts` — feature flags
- `src/constants/labels.ts` — product copy
- `src/data/mock.ts` — mock data
- `src/utils/*` — search, metrics, schedule helpers
- `src/contexts/*` — auth, classes, reviews (in-memory mock)

API docs live in the mobile repo: `../fitnexia-mobile/docs/API.md`

## Get started

```bash
cd fitnexia-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Flow matches mobile:

1. Onboarding → Login
2. **Quick demo**: Athlete / Coach / Gym
3. Same role tabs and flows (search, book, instructor dashboard, gym metrics, etc.)

## Environment

```env
NEXT_PUBLIC_API_URL=https://api.staging.fitnexia.com/v1
```

Not used until the API client is wired; mock auth/data work offline.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |

## Route map (parity with mobile)

| Mobile (Expo Router) | Web (Next.js) |
|----------------------|---------------|
| `/(auth)/onboarding` | `/auth/onboarding` |
| `/(auth)/login` | `/auth/login` |
| `/(athlete)/(tabs)/home` | `/athlete/home` |
| `/class/[id]` | `/class/[id]` |
| `/book/[classId]` | `/book/[classId]` |
| `/(instructor)/(tabs)/dashboard` | `/instructor/dashboard` |
| `/(gym)/(tabs)/metrics` | `/gym/metrics` |
| `/create-class` | `/create-class` |

## Next steps

1. Extract `types`, `constants`, `data`, `utils` into a shared `packages/` workspace.
2. Add `services/api-client.ts` and persist auth (cookies / secure storage).
3. Align remaining profile sub-screens with mobile pixel-detail where needed.
