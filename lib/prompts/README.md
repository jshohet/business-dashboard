# AI Prompts

All Claude prompt templates live here. Import the builder function into the relevant API route — never inline prompts in route handlers.

## Rate limiting (TODO before production)

Every route under `/app/api/ai/` needs per-user rate limiting before going live.
Recommended: Upstash Redis + `@upstash/ratelimit`.

Setup:
1. Create a free Upstash Redis database at upstash.com
2. `npm install @upstash/ratelimit @upstash/redis`
3. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to .env.local
4. Add a shared `checkRateLimit(userId)` helper in `/lib/rate-limit.ts`
5. Call it at the top of each AI route handler before the plan gate check
