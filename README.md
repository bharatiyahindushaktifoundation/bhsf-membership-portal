# Bharatiya Hindu Shakti Foundation — Membership Management Portal

A full-stack membership management portal: public homepage, online membership
application with OTP verification, and an admin panel for managing the
organizational hierarchy, members, departments, activities, news, and gallery.

```
/client   React (Vite) + Tailwind CSS frontend
/server   Node.js + Express backend (MVC), PostgreSQL via Prisma ORM
```

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express.js (MVC: controllers / routes / middleware)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Phone OTP (mocked SMS by default; pluggable real SMS provider), JWT for admin sessions
- **Uploads:** Multer (validated by type/size)
- **QR Codes:** `qrcode`
- **PDF generation:** `pdfkit` (ID cards, member list export)
- **Excel export:** `exceljs`

## Prerequisites

- Node.js 18+
- A running PostgreSQL instance (local or hosted)

## 1. Backend Setup

```bash
cd server
cp .env.example .env
# edit .env: set DATABASE_URL to your PostgreSQL connection string
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed          # creates the admin account, sample hierarchy, departments
npm run dev            # starts the API on http://localhost:5000
```

> **Note:** In this build environment, `npx prisma generate` could not download
> its query engine binary because outbound network access is restricted to a
> fixed allowlist. On a normal machine with standard internet access this
> command works out of the box. If you hit the same "Failed to fetch sha256
> checksum" error behind a restrictive firewall, allow access to
> `binaries.prisma.sh`, or set `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` as a
> temporary workaround.

### OTP behavior

By default `OTP_MODE=mock` in `.env`. Requested OTPs are printed to the
**server console** instead of being sent via SMS, so the whole flow (applicant
verification and admin login) can be tested end-to-end without SMS
credentials. To go live, set `OTP_MODE=live` and wire up a real SMS gateway
(e.g. MSG91, Twilio) inside `server/src/utils/otp.js`.

### Default admin login

The seed script creates an admin using `ADMIN_PHONE` / `ADMIN_NAME` from
`.env` (defaults: `9999999999` / `Super Admin`). Log in on
`/admin/login` with that phone number; the OTP will appear in the server
console.

## 2. Frontend Setup

```bash
cd client
npm install
npm run dev            # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` requests to
`http://localhost:5000`, so no CORS configuration is needed in development.

## 3. Build for production

```bash
cd client && npm run build     # outputs static assets to client/dist
cd server && npm start          # serve the API (point a static host / reverse proxy at client/dist)
```

## Project Structure

```
server/
  prisma/
    schema.prisma      # all database tables
    seed.js             # admin, sample hierarchy, departments, home content
  src/
    app.js              # Express app configuration
    server.js            # entry point
    config/db.js          # Prisma client singleton
    controllers/           # one file per feature (auth, members, applications, ...)
    routes/                 # one file per feature, aggregated in routes/index.js
    middleware/               # auth guard, multer upload, error handler, validation
    utils/                     # OTP, JWT, member ID, QR, PDF, Excel helpers
    uploads/                    # uploaded files (photos, id proofs, gallery, ...)

client/
  src/
    main.jsx / App.jsx    # routes
    layouts/                # PublicLayout, AdminLayout
    pages/public/             # Home, Membership Application, Activities, News, Gallery
    pages/admin/                # Dashboard, Members, Applications, Org Structure,
                                  # Departments, Activities, News, Gallery, Settings, ID Card
    components/                   # shared UI (Modal, ConfirmDialog, Spinner, StatusBadge, ...)
    contexts/AuthContext.jsx        # admin session state
    hooks/                           # useAuth, useLocationHierarchy (cascading dropdowns)
    services/                         # Axios API client + per-feature service modules
```

## Feature Summary

- **Home page:** hero, about, objectives, ongoing activities, latest news, photo/video gallery, contact — all editable by the admin under **Settings**.
- **Organizational hierarchy:** State → District → Assembly → Mandal (Circle) → Village Panchayat, full CRUD under **Organization Structure**.
- **Online membership application:** public form with cascading location dropdowns, phone OTP verification, photo + ID proof upload; submissions start as `PENDING`.
- **Admin login:** phone OTP, JWT session.
- **Admin dashboard:** total members, pending applications, approved members.
- **Member management:** approve/reject applications, add/edit/delete members, filter by Assembly/Mandal/Panchayat, search by name/phone/member ID.
- **Member ID card:** auto-generated member ID on approval, printable/downloadable PDF card with photo, details, and a QR code encoding the member ID.
- **Departments:** manage designations (Chairman, Editor, etc.) and assign them to members.
- **Activities:** CRUD with categories, images, and reports; publicly viewable.
- **News:** CRUD, shown on the homepage.
- **Gallery:** multi-photo upload, YouTube or uploaded videos.
- **Export:** member list to Excel and PDF, respecting active filters.
- **Security:** only the last 4 Aadhaar digits are stored, uploads are validated by MIME type and size, all admin APIs are JWT-protected.

## Environment Variables

See `server/.env.example` for the full list (database connection, JWT secret,
OTP mode/expiry, admin bootstrap credentials, upload size limit).

## What's intentionally excluded

Per the project scope, this build does **not** include: payment gateway,
donations, chat, notifications, email system, attendance tracking,
analytics, multi-admin role permissions, bulk import, a mobile app,
multi-language support, event registration, a public member directory, or
social login.
