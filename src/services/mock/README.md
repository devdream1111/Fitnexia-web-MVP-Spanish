# Mock V2/V3 services

Temporary UI-only data for features that are **not** yet wired to production APIs.

## Cleanup rule (required)

When a feature’s backend integration is complete:

1. Delete its `*.mock.ts` service and any mock-only UI under `components/mock-v2v3/`.
2. Remove seed types/helpers used only by that mock.
3. Drop the barrel export from `index.ts`.
4. Remove obsolete mock labels and feature-flag gates that only existed for the stub.
5. Keep production clients under `services/api.ts` and real UI components only.

### Already production-only (mocks removed)

| Feature | Production entry |
|---------|------------------|
| F-14 Live streaming | `components/live-stream/*`, `apiGetClassStream*` |
| F-29 Instructor review replies | `components/reviews/instructor-review-responses-panel.tsx`, `apiRespondToReview` |
| F-35 Metrics & analytics | `components/analytics/*`, `apiGet*Metrics` |
| F-37 Platform support | `components/support/platform-support-page.tsx`, `apiCreateSupportTicket` / `apiGetMySupportTickets` (mailto fallback if API unavailable) |
| F-38 Loyalty credits | `components/loyalty/loyalty-credits-panel.tsx`, `apiGetMyCredits` / booking `useCredits` |
| F-45 Club collections panel | `components/collections/collections-panel.tsx`, `apiGetClubCollectionsPanel` |
| F-47 Court management | `components/courts/courts-manager.tsx`, `apiListMyCourts` / `apiCreateCourt` / … |
| F-48 Court availability schedule | `components/courts/court-schedule-grid.tsx`, `apiGetMyCourtSchedule` |
| F-49 Court reservation | `components/courts/athlete-court-booking-flow.tsx`, `apiCreateCourtReservation` |
| F-50 Slot pricing | `components/courts/court-pricing-rules-panel.tsx` + `apiQuoteCourtReservation` |
| F-51 Recurring shifts | `apiCreateCourtRecurringShift` / list+cancel in athlete reservations |
| F-52 Court cancel | `apiCancelCourtReservation` + gym `CourtSettingsPanel` |
| F-53 Open games | `components/open-games/open-games-board.tsx`, `apiListOpenGames` / join / leave / cancel |

Do not reintroduce stubs for these features.
