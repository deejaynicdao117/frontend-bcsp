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

The browser always calls same-origin `/api`, so the app works on `localhost`, a LAN IP, or an HTTPS dev tunnel without CORS or mixed-content errors.

## Structure

```
src/
  App.tsx                    # session handling + all react-router routes
  shared/                    # api client, types, session context, helpers
  components/
    ui.tsx                   # Card, Alert, badges, spinner, page header
    admin/                   # sidebar, stat card, request table
    shared/RoleHeader.tsx    # header used by staff & resident layouts
  pages/
    LoginPage.tsx
    admin/                   # AdminLayout + overview/users/requests/community/reports/notifications/profile
    staff/                   # StaffLayout + document requests + community review
    residents/               # ResidentLayout + document requests + community services
```

## Routes

| URL | Page |
| --- | --- |
| `/login` | Sign in |
| `/admin`, `/admin/users`, `/admin/requests`, `/admin/community`, `/admin/reports`, `/admin/notifications`, `/admin/profile` | Admin workspace |
| `/staff`, `/staff/community` | Staff workspace |
| `/resident`, `/resident/services` | Resident workspace |

Role guards live in `src/App.tsx`; a wrong role or unknown URL redirects home.
