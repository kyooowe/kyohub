This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## PostgreSQL data

Set `DATABASE_URL` in `.env.local` to a PostgreSQL connection string. The password, grocery, baby-needs, and budget-planner features use the same shared database workspace; their server actions provide create, read, update, and delete operations. The budget planner stores monthly budgets and recurring or one-time bills, then compares scheduled expenses across six months. Feature data is read from and written to PostgreSQL; the app does not store transaction data in browser storage.

After changing `prisma/schema.prisma`, run `npm run contract:emit` to regenerate the typed contract, then `npx prisma db init` to apply additive schema changes.

## Baby reminder push notifications

The baby-needs page can subscribe each browser/device to daily push reminders. At 9 PM Philippine time, the scheduled job checks tomorrow's reminders and sends their titles; if there are none, it sends **"No important/vaccine scheduled tomorrow"**. Notifications are sent only to devices that have enabled push reminders.

Generate a VAPID key pair once with `npx web-push generate-vapid-keys`, then configure these environment variables in your deployment (and locally in `.env.local`):

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your VAPID public key"
VAPID_PUBLIC_KEY="the same VAPID public key"
VAPID_PRIVATE_KEY="your VAPID private key"
VAPID_SUBJECT="mailto:you@example.com"
CRON_SECRET="a long random secret"
```

Keep `VAPID_PRIVATE_KEY` and `CRON_SECRET` secret. After adding the `PushSubscription` model, run `npm run contract:emit` and `npx prisma db init` to update the typed contract and apply the additive database change. The included Vercel cron schedule uses `0 13 * * *` UTC, which is 9 PM in the Philippines; configure this app on Vercel for the schedule to run.

This workspace currently has no sign-in or access control, so anyone who can reach the app can read and change the shared data. Password entries are stored as plaintext in PostgreSQL. Do not expose this app publicly until authentication, authorization, and password encryption are added.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
