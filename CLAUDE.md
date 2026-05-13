@AGENTS.md

# StoreOps — Project Context for Claude Code

## What this product is

StoreOps is a B2B SaaS tool for store managers, franchise owners, and multi-location operators (QSR, franchise, retail). The founder took a Starbucks store from unranked to #19 in the entire Northeast on every KPI in 30 days as acting manager. StoreOps automates that system: data-driven KPI tracking, AI drift detection, AI-powered ordering cadences, and coaching scripts — all built so a store manager can run it without a spreadsheet or an MBA.

**This is a real product being taken to market, not a practice project.** Every decision should reflect that.

## Pricing tiers

| Plan | Price | Locations | Key features |
|---|---|---|---|
| Starter | $49/mo | 1 | KPI dashboard, ordering cadence, weekly email alerts |
| Operator | $99/mo | Up to 5 | Everything + AI drift diagnosis, AI ordering, multi-location view, Slack/SMS alerts |
| Enterprise | $299/mo | 6–50 | Everything + AI weekly ops report, AI coaching scripts, API/CSV integrations |

> Note: The dashboard layout currently shows `$5/mo` — this is outdated and must be updated before any pricing-related work.

## Stack

- **Framework:** Next.js 16 App Router (see AGENTS.md — this version has breaking changes from 14)
- **Language:** TypeScript (strict mode always)
- **Styles:** Tailwind CSS v4
- **Database/ORM:** Prisma + PostgreSQL
- **Auth:** next-auth v5 beta (`/auth.ts` at root, JWT sessions)
- **Payments:** Stripe (singleton at `/lib/stripe.ts`)
- **Validation:** Zod
- **AI:** Anthropic Claude API via `@anthropic-ai/sdk` — use model `claude-sonnet-4-6`
- **Email:** Resend (not yet installed — install when needed)

## Key file locations

```
/auth.ts                    — next-auth config (credentials provider, JWT callbacks)
/lib/prisma.ts              — Prisma client singleton
/lib/stripe.ts              — Stripe client singleton
/lib/anthropic.ts           — Anthropic client singleton (to be created)
/lib/prompts/               — ALL AI prompt templates live here, never inline
/app/(auth)/                — login, signup pages
/app/dashboard/             — protected app shell
/app/api/                   — API route handlers
/prisma/schema.prisma       — database schema
/prisma/migrations/         — migration history
```

## Design system

The app uses an editorial/industrial aesthetic that matches the waitlist page (`storeops-waitlist.html`):
- **Fonts:** DM Serif Display (headings), DM Sans (body)
- **Color palette:** ink `#0f0e0c`, paper `#f5f2eb`, accent/red `#c84b2f`, amber `var(--amber)` for active/pro states
- Keep UI consistent with the existing dashboard — dark header, light content area

## Security — non-negotiable rules

1. **Never expose secrets.** No API keys, database URLs, webhook secrets, or tokens in code, comments, or logs. All secrets live in `.env.local` only. If a new env var is needed, add a placeholder to `.env.local` and `.env.example` and flag it explicitly.

2. **Every API route must be authenticated.** Use `auth()` from `@/auth` at the top of every route handler. If the user is not authenticated, return `401` immediately before any logic runs.

3. **Every API route must verify ownership.** After authenticating, confirm the requested resource (location, KPI entry, report, etc.) belongs to the authenticated user's store/account. Never trust IDs from the request body without checking ownership in the database.

4. **AI routes must check plan tier.** Before calling the Anthropic API, verify the user's plan allows the feature. Return a structured paywall response (not a 403 error) if they're on the wrong tier:
   ```json
   { "error": "upgrade_required", "required_plan": "operator", "upgrade_url": "/dashboard/settings/billing" }
   ```

5. **Rate-limit AI routes.** AI calls are expensive. Add basic rate limiting (by user ID) on all `/api/ai/*` routes.

6. **Validate all inputs with Zod.** Every POST/PATCH body must be parsed with a Zod schema before touching the database. Return `400` with the Zod error if validation fails.

## AI feature rules

- **All prompts live in `/lib/prompts/`.** Never inline a prompt string in a route handler.
- **Never call the Anthropic API from the client side.** All AI calls go through `/app/api/ai/` server-side route handlers.
- **Always save AI input + output to `ai_reports` table** for debugging and audit.
- **Comment every Anthropic API call** to explain what the prompt is doing and why — these are the hardest parts to understand later.
- Use `claude-sonnet-4-6` as the model for all AI features.

## Git / deployment rules

- **Always ask before pushing**, even if pushing is allowed. State what will be pushed and to where, and wait for confirmation.
- **Never commit `.env.local`** or any file containing real secrets.
- **Never use `--no-verify`** to skip hooks.
- Prefer small, focused commits over large ones.

## How to approach every request

Before writing code for any request:
1. Ask any clarifying questions that could change the implementation.
2. Flag anything that seems like it could be done better, or a tradeoff the user should know about.
3. If a task touches security, payments, or AI costs, explicitly call that out before starting.

Do not begin coding until the approach is confirmed.
