# Business Dashboard

Operational dashboard for retail/food stores with store-isolated data.

Stack:

- Next.js (App Router) + React + Tailwind CSS
- Prisma + PostgreSQL
- Auth.js (NextAuth v5 beta, credentials auth)

## Implemented So Far (Phase 1 through Phase 5)

- Authentication:
  - Sign up with store creation
  - Sign in with credentials
  - Protected dashboard routes
- Basic dashboard UI:
  - Overview cards (revenue, sales entries, employees)
- Manual data entry:
  - Sales entry form
  - Employee form
  - Employee availability form
- Analytics:
  - Daily revenue trend chart
  - Weekly revenue chart
  - Peak hour detection from sales distribution
  - 7-day trend analysis vs previous 7 days
- Smart Scheduling:
  - Demand-based staffing requirement per hour
  - Weekly shift suggestions for next 7 days
  - Availability-aware assignment (max 8h/day and 40h/week)
  - Coverage gap detection for understaffed slots
- Inventory Forecasting:
  - Product-level inventory logging (ordered, sold, waste)
  - Day-of-week demand forecast for next 7 days
  - Recommended order quantity per product/day
- Waste + Efficiency Tracking:
  - Waste percentage overall and by product
  - Labor cost vs revenue tracking
  - Auto-generated alerts (overstaffing patterns and high waste products)
- Multi-tenant data model:
  - Each user belongs to one store
  - Queries are scoped by store
- Phase 5 polish:
  - Improved dashboard shell responsiveness and mobile nav behavior
  - Feature shortcut cards on overview page
  - Demo data seeding pipeline
  - Deployment checklist and production env template

## Project Structure

- `app/(auth)/login` and `app/(auth)/signup`: auth screens
- `app/dashboard`: protected dashboard pages
- `app/dashboard/actions.ts`: server actions for manual data entry
- `auth.ts`: Auth.js config and callbacks
- `proxy.ts`: route protection matcher
- `prisma/schema.prisma`: data model
- `lib/prisma.ts`: Prisma client singleton

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
copy .env.example .env
```

3. Set `DATABASE_URL` in `.env` to your PostgreSQL database.

4. Run migrations:

```bash
npm run prisma:migrate -- --name init
```

5. Generate Prisma client:

```bash
npm run prisma:generate
```

6. Start development server:

```bash
npm run dev
```

App runs at http://localhost:3000.

## Seed Demo Data

Run:

```bash
npm run prisma:seed
```

Demo account created:

- Email: demo@storepilot.app
- Password: DemoPass123!

## Validation Commands

```bash
npm run lint
npm run build
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel setup, env vars, and post-deploy checks.
