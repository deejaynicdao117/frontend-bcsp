# frontend-bscp — Portal UI

React 19 + TypeScript + Vite + Tailwind CSS 4 front end for the Barangay Citizen Services Portal.

Full clone-and-run steps live in the [root README](../README.md) — you need the backend running first.

## Commands

```bash
npm install        # once
npm run dev        # dev server → http://localhost:5173
npm run lint       # ESLint
npm run build      # type-check (tsc) + production build to dist/
npm run preview    # serve the production build (also proxies /api)
```

## Configuration (`.env`)

Copy `.env.example` to `.env` if you need to change anything, then restart `npm run dev`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_PROXY` | `http://127.0.0.1:8000` | Where Vite forwards `/api` requests (server-side). Keep it on `localhost`. |
| `VITE_API_URL` | *(unset → `/api`)* | Absolute API base for the built app. Only set this to call the API directly. |

The browser defaults to same-origin `/api`. Vite forwards that path during `npm run dev` and `npm run preview`; a deployed static host does **not** run this Vite proxy. In production, configure the web server/CDN to reverse-proxy `/api` to Laravel, or set `VITE_API_URL` to the HTTPS API base and configure backend CORS accordingly. Do not expose the API over plain HTTP from an HTTPS site.

## Structure

```
src/
  App.tsx                    # session handling
  routes/AppRoutes.tsx       # role-protected React Router pages
  shared/                    # api client, types, session context, helpers
  components/
    ui.tsx                   # Card, Alert, badges, spinner, page header
    admin/                   # sidebar, stat card, request table
    shared/RoleHeader.tsx    # header used by staff & resident layouts
  pages/
    LoginPage.tsx
    RegisterPage.tsx         # resident-only sign-up + email code verification
    admin/                   # AdminLayout + overview/users/requests/community/reports/notifications/profile
    staff/                   # StaffLayout + document requests + community review
    residents/               # ResidentLayout + document requests + community services
```

## Routes

| URL | Page |
| --- | --- |
| `/login` | Sign in |
| `/platform`, `/platform/barangays`, `/platform/reports`, `/platform/settings` | Platform administration |
| `/admin`, `/admin/users`, `/admin/requests`, `/admin/document-types`, `/admin/community`, `/admin/reports`, `/admin/notifications`, `/admin/profile` | Barangay admin workspace |
| `/staff`, `/staff/announcements`, `/staff/community` | Staff workspace |
| `/resident`, `/resident/profile`, `/resident/complaints`, `/resident/assistance`, `/resident/announcements`, `/resident/emergency-contacts`, `/resident/evacuation-centers` | Resident workspace |

Role guards live in `src/routes/AppRoutes.tsx`; a wrong role or unknown URL redirects home. The backend independently enforces API roles.
