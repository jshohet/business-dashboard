# Deployment Guide

## 1) Prepare Environment Variables

Set the following on Vercel:

- DATABASE_URL
- AUTH_SECRET
- AUTH_TRUST_HOST=true
- NEXTAUTH_URL=https://your-vercel-domain

Use [.env.production.example](.env.production.example) as reference.

## 2) Database Migration in Production

Before or immediately after first deploy, run:

- npm run prisma:generate
- npx prisma migrate deploy

Use a CI step or a one-time secure terminal in your deployment workflow.

## 3) Seed Demo Data (Optional)

To load demo data in non-production or preview environments:

- npm run prisma:seed

Demo credentials created by seed:

- Email: demo@storepilot.app
- Password: DemoPass123!

## 4) Deploy to Vercel

1. Push repository to GitHub.
2. Import project in Vercel.
3. Add environment variables.
4. Deploy.

Recommended settings:

- Framework Preset: Next.js
- Build Command: npm run build
- Install Command: npm install

## 5) Post-deploy Checks

- Sign up and login flow works.
- Dashboard routes are protected.
- Analytics charts load.
- Scheduling page generates suggestions.
- Inventory and efficiency modules can save records.
