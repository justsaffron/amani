# 💒 Amani

A full-featured wedding invitation and registry platform. Host multiple events, manage separate guest lists, send email & SMS invitations, collect RSVPs, and accept gifts via Stripe — all from a beautiful dashboard.

---

## Features

- **Multiple events** — Nikah, Walima, Mehndi, or any events you need
- **Smart guest lists** — upload via CSV or add individually; assign guests to specific events
- **Personalised invites** — each guest gets a unique private link showing only their events
- **Email & SMS** — powered by Resend (email) and Twilio (SMS)
- **RSVP tracking** — real-time dashboard showing attending/pending/declined
- **Gift registry** — add items, accept Stripe payments, track funding progress
- **Multi-tenant** — friends can sign up and use it for their own weddings

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend & Backend | Next.js 14 (App Router) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js (credentials) |
| Email | Resend |
| SMS | Twilio |
| Payments | Stripe |
| Styling | Tailwind CSS |
| Hosting | Railway |

---

## Setup Guide

### Step 1 — Prerequisites

You'll need accounts for these free/freemium services:

1. **Railway** (https://railway.app) — hosting + database
2. **Resend** (https://resend.com) — email sending (3,000 free/month)
3. **Twilio** (https://twilio.com) — SMS (free trial credits)
4. **Stripe** (https://stripe.com) — payments (no monthly fee, pay per transaction)

---

### Step 2 — Deploy on Railway

1. Push this project to a GitHub repository
2. Go to https://railway.app → New Project → Deploy from GitHub repo
3. Select your repo → Railway will auto-detect Next.js

**Add a PostgreSQL database:**
- In your Railway project, click **New** → **Database** → **PostgreSQL**
- Railway will auto-set the `DATABASE_URL` environment variable

---

### Step 3 — Set Environment Variables in Railway

In your Railway service, go to **Settings → Environment Variables** and add:

```
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=<run: openssl rand -base64 32>

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> **Tip:** During testing, use Stripe test keys (`sk_test_...` / `pk_test_...`)

---

### Step 4 — Set Up Resend

1. Go to https://resend.com → sign up
2. **Verify your domain** (or use their free `@resend.dev` address for testing)
3. Copy your API key → add as `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL` to a verified sender email

---

### Step 5 — Set Up Twilio (optional, for SMS)

1. Go to https://twilio.com → sign up for free trial
2. Get your **Account SID** and **Auth Token** from the console
3. Get a **phone number** (free in trial)
4. Add all three to your Railway environment variables

> **Note:** In Twilio trial mode, you can only send SMS to verified numbers. Upgrade to send to all guests.

---

### Step 6 — Set Up Stripe

1. Go to https://stripe.com → create account
2. In the Dashboard → **Developers → API Keys** → copy your keys
3. Set up a webhook:
   - Go to **Developers → Webhooks → Add endpoint**
   - URL: `https://your-app.railway.app/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `checkout.session.expired`
   - Copy the **Signing secret** → add as `STRIPE_WEBHOOK_SECRET`

---

### Step 7 — Run Database Migrations

Once Railway deploys your app, open a terminal and run:

```bash
# Using Railway CLI (install: npm i -g @railway/cli)
railway login
railway run npx prisma db push
```

Or connect to Railway's PostgreSQL directly and run the migration.

---

### Step 8 — Local Development

```bash
# Clone and install
npm install

# Copy environment file
cp .env.example .env.local
# Fill in your values in .env.local

# Push database schema
npx prisma db push

# Start dev server
npm run dev
```

Open http://localhost:3000

---

## CSV Upload Format

Your guest list CSV should have these columns (case-insensitive):

```csv
name,email,phone
Aisha Khan,aisha@email.com,+15551234567
Omar Farooq,omar@email.com,
Sarah Ali,,+15559876543
```

Only `name` is required. Phone numbers should be in international format (e.g. `+44...` or `+1...`).

---

## Sharing With Friends

Since this is multi-tenant, anyone can sign up at your hosted URL and get their own wedding dashboard. Each couple has:
- Their own account (email + password)
- Their own URL slug (e.g. `/invite/john-jane/...`)
- Completely separate guests, events, and registry

Just share the URL with friends!

---

## Architecture Overview

```
/src/app/
├── (auth)/           # Login, Register pages
├── dashboard/        # Admin dashboard (protected)
│   ├── events/       # Create/manage events
│   ├── guests/       # Manage guest list, CSV upload
│   ├── registry/     # Gift registry management
│   ├── send/         # Send invitations
│   └── settings/     # Customise your wedding page
├── invite/[slug]/[token]/  # Guest-facing invite portal
└── api/              # All API routes
    ├── auth/         # NextAuth + registration
    ├── events/       # CRUD for events
    ├── guests/       # CRUD, CSV upload, send invites
    ├── registry/     # CRUD for registry items
    ├── rsvp/         # Guest RSVP submissions
    ├── stripe/       # Checkout + webhook
    ├── settings/     # User settings
    └── dashboard/    # Dashboard stats
```

---

## Customisation

- **Colours**: Change `tailwind.config.ts` to adjust the `blush`, `sage`, `champagne` palettes
- **Email templates**: Edit `src/lib/email.ts` to customise invitation HTML
- **SMS messages**: Edit `src/lib/sms.ts`
- **Couple branding**: Set `accentColor`, `heroMessage`, `websiteTitle` in Dashboard → Settings

---

## Support

Built with ❤️ for celebrating love. Good luck with the wedding! 💒
