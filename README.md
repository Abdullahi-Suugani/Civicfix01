# CivicFix — Community Problem Reporting Platform

A full-stack scaffold for CivicFix: citizens report public infrastructure
issues with photos and a map pin; city staff track, prioritize, and resolve
them through an admin dashboard.

```
civicfix/
├── backend/     Express API + Prisma + PostgreSQL
└── frontend/    React (Vite) + Tailwind + Leaflet + Recharts
```

## What's included

- **Auth** — register/login/logout, forgot/reset password, JWT + bcrypt, role-based access control (Citizen / Moderator / Admin)
- **Reports** — full CRUD, image upload, search/filter/sort/pagination, status timeline, comments, save/favorite
- **Map** — Leaflet + OpenStreetMap, color-coded markers, click-to-pin location picker with "use my location"
- **Admin dashboard** — stat cards, charts (reports by month/category/status, resolution rate), recent reports/users tables, CSV export, category & user management
- **AI features** — report analysis, staff recommendations, AI-assisted report writing, and natural-language report search
- **Citizen dashboard** — my reports, saved reports, activity timeline, personal stats, profile & settings
- **Notifications** — in-app notifications on status changes and new comments
- **Design** — a custom "civic paper / ticket stub" visual system (see Design notes below), dark-mode-ready Tailwind tokens, loading skeletons, empty states, toasts

## What's stubbed (documented, not wired to a real provider)

- **Image storage** uses local disk (`backend/src/uploads`) via Multer, not Cloudinary. Swapping to Cloudinary only touches `backend/src/middleware/upload.js` — see the snippet below.
- **Email** (password reset, verification) logs to the server console instead of sending. Swap in SendGrid/SES/Postmark in `auth.controller.js`.
- **Real-time** — Socket.io is wired up server-side (`src/index.js`, rooms per report) and the client dependency is installed, but live-push events aren't emitted from every mutation yet. Notifications currently work via polling on page load. Extending this is a matter of calling `io.to(`report:${id}`).emit(...)` from the relevant controllers and subscribing in the frontend.

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env       # set DATABASE_URL and OPENAI_API_KEY
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed                # creates categories + demo admin/citizen + sample reports
npm run dev                  # http://localhost:5000
```

Demo logins after seeding:

- Admin: `admin@civicfix.gov` / `Admin123!`
- Citizen: `citizen@example.com` / `Citizen123!`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`, so run the backend first.


## Swapping local uploads for Cloudinary

```bash
npm install cloudinary multer-storage-cloudinary
```

```js
// backend/src/middleware/upload.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "civicfix" },
});
```

Everywhere else in the app already just stores/returns a URL string, so this is a drop-in swap.

## API overview

| Method          | Route                                                                            | Notes                                       |
| --------------- | -------------------------------------------------------------------------------- | ------------------------------------------- |
| POST            | `/api/auth/register`, `/login`, `/logout`, `/forgot-password`, `/reset-password` |                                             |
| GET             | `/api/auth/me`                                                                   | current user                                |
| GET/POST        | `/api/reports`                                                                   | list (search/filter/sort/paginate) & create |
| GET/PUT/DELETE  | `/api/reports/:id`                                                               |                                             |
| POST            | `/api/reports/:id/save`                                                          | toggle favorite                             |
| GET             | `/api/reports/mine/saved`                                                        |                                             |
| GET             | `/api/categories` (+ admin POST/PUT/DELETE)                                      |                                             |
| GET/POST/DELETE | `/api/comments`                                                                  |                                             |
| GET/PUT         | `/api/notifications`                                                             |                                             |
| GET/PUT/DELETE  | `/api/users`                                                                     | admin                                       |
| GET             | `/api/dashboard/statistics`                                                      | admin/moderator analytics                   |

All protected routes expect `Authorization: Bearer <token>`.

## Design notes

Palette: deep civic navy `#16324A`, blue `#2F6690`, teal `#0E7C7B`, green
`#2F9E44` (resolved), amber `#E8A33D` (priority/CTA), red `#D64545`
(critical/rejected), on a warm "paper" background `#F6F5F1`. Display type is
Space Grotesk, body is Inter, and data/stats/status badges use IBM Plex Mono
to read like stamped municipal paperwork. Report cards are styled as ticket
stubs with a perforated edge, and status badges render as mono, uppercase
"stamps" rather than soft pill badges — a nod to the permit-and-ticket
vocabulary of civic offices, without going full skeuomorphic.

## Known limitations of this scaffold

- Image uploads are local-disk only until Cloudinary is wired in (fine for local dev, not for multi-instance production).
- Email is stubbed to console output.
- No automated test suite included.
- SQLite is used by default for zero-config setup; swap to Postgres for production per the instructions above.

