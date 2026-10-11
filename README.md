# Kyohub

> **A little more organized, a little less to remember.**

Kyohub is a family space for keeping everyday plans together—from grocery runs and monthly bills to baby milestones and household logins.

---

## Made for family life

| | Feature | What it helps with |
| --- | --- | --- |
| 🛒 | **Grocery planner** | Keep a separate list for each day, check items off, and browse lists by date. |
| 🗓️ | **Baby calendar** | Schedule vaccinations and important dates, add notes, and track completed needs. |
| 💰 | **Budget planner** | Set budgets by month, add recurring or one-time bills, and compare expenses across six months. |
| 🔐 | **Password manager** | Organize logins by category, search entries, and check password strength. |
| 👋 | **Simple sign-in** | Use a configured six-digit PIN to access the shared family workspace, with app settings saved across devices. |

## Get started

### Requirements

- PostgreSQL 15 or newer
- npm

### Local setup

1. Create a PostgreSQL database and copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to your database connection string and configure the authentication values below.
3. Install dependencies and create the database tables:

```bash
npm install
npx prisma db init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use Kyohub locally. `npx prisma db init` creates the tables in the database configured by `DATABASE_URL`.

### Environment settings

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. |
| `AUTH_PINS` | Comma-separated six-digit PINs allowed to sign in. |
| `AUTH_USERS` | Comma-separated `PIN:Name` pairs; each allowed PIN needs a profile name. |
| `AUTH_SECRET` | Long random secret used to sign session cookies. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public Web Push key used by the browser; set this and the server's `VAPID_PUBLIC_KEY` to the same value. |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Server-side Web Push credentials and contact subject for sending reminders. |
| `CRON_SECRET` | Secret used to authorize the scheduled reminder endpoint. |

The VAPID settings and `CRON_SECRET` are only needed for push reminders. To generate a random `AUTH_SECRET`, run `openssl rand -hex 32`.

## Push reminders

Users can enable or disable reminders for each browser or device from the baby calendar. The app sends a daily notification about the next day's vaccinations and important dates at 9 PM Philippine time. Push requires a supported browser, notification permission, and the VAPID settings above. The scheduled endpoint is `/api/cron/baby-reminders`.

## Production

Build the app and run the production server with:

```bash
npm run build
npm run start
```

Provide the same environment settings to your hosting environment. A cron scheduler must send the value of `CRON_SECRET` in the `Authorization` header when it calls the reminder endpoint.

---

## Built with

- **Framework:** Next.js 16 and React 19
- **Language:** TypeScript
- **Data:** Prisma ORM and PostgreSQL
- **UI:** Tailwind CSS 4, shadcn/ui, and Base UI
- **Charts and icons:** Recharts and Lucide React
- **Reminders:** Web Push

## A note about saved passwords

Saved password values are stored unencrypted in the database. Everyone who can access the app can read them; the PIN gate is not a substitute for secure credential storage. Avoid storing sensitive passwords and keep the app private.
