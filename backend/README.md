# AngelSkies API (Cloudflare Workers)

Scales automatically with traffic and costs nothing when idle (free tier: 100k requests/day).

## One-time setup
1. Create a free Cloudflare account and install Wrangler: `npm i -g wrangler`, then `wrangler login`.
2. From this `backend/` folder:
   - `wrangler d1 create angelskies-logs` -> copy the id into wrangler.toml
   - `wrangler kv namespace create RATE` -> copy the id into wrangler.toml
   - `wrangler d1 execute angelskies-logs --remote --file=schema.sql`
3. Set secrets (typed into your terminal, never into chat):
   - `wrangler secret put PASSWORD_HASH` (SHA-256 hex of your password)
   - `wrangler secret put PIN_HASH` (SHA-256 hex of your PIN)
   - `wrangler secret put TOKEN_SECRET` (any long random string)
4. In GitHub repo Settings > Secrets > Actions add `CLOUDFLARE_API_TOKEN` (Cloudflare "Edit Cloudflare Workers" token) and `CLOUDFLARE_ACCOUNT_ID`.
5. Push to main: the workflow deploys automatically. Your API URL will be `https://angelskies-api.<your-subdomain>.workers.dev`.
