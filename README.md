# tradr

A Cardmarket pricing calculator for valuing **buy** lists and **trade** lists.

- **Buy mode** — build one list of cards and get a total price.
- **Trade mode** — build two lists ("your cards" / "their cards") and see both totals plus the difference.
- Prices are pulled from the [Cardmarket API v2.0](https://www.cardmarket.com/en/Magic/Account/API), filtered by card quality (condition), language, seller location, foiling, and more.
- Every filter has a list-wide default; card quality, language, and foiling can be overridden per card, with bulk-edit and "apply to new cards" defaults so you don't have to do it one card at a time.
- Dark-themed, responsive UI that works on desktop and mobile.

## Architecture

npm workspaces monorepo, TypeScript throughout:

```
packages/
  shared/   Domain types + Cardmarket reference data (conditions, languages,
            countries, pricing methods) + pure pricing math. The single
            source of truth used by both server and web — nothing here is
            duplicated in the other packages.
  server/   Express API. Wraps the Cardmarket API behind a PricingProvider
            interface (OAuth1 signing, request shaping, response mapping all
            live in one place: src/cardmarket/). A MockPricingProvider is
            used automatically when no API credentials are configured, so
            the app is always fully demoable.
  web/      React + Vite frontend. All state lives in a single React Context
            store (src/state/AppStateContext.tsx); all backend calls go
            through one typed client (src/api/client.ts).
```

In production, the server serves the built web app as static files and
exposes the API under `/api/*`, so the whole thing deploys as one Railway
service.

## Getting Cardmarket API credentials

1. Log into Cardmarket and go to **Account → API** (`https://www.cardmarket.com/en/Magic/Account/API`, or the equivalent under whichever game you use).
2. Create a **Dedicated App** token pair (App Token + App Secret).
3. Generate an Access Token + Access Token Secret for that app.
4. Put all four values into your `.env` (see `.env.example`) or into your Railway service's environment variables.

Without these credentials the app runs in **demo mode** — the UI works end-to-end with deterministic simulated prices and a banner tells you demo mode is active.

## Local development

Requires Node.js 18.18+.

```bash
npm install
cp .env.example .env   # fill in Cardmarket credentials, optional

npm run dev:server   # http://localhost:4000 — API only
npm run dev:web      # http://localhost:5173 — Vite dev server, proxies /api to :4000
```

Run both in separate terminals and use the Vite dev server URL while developing.

### Production build

```bash
npm run build   # builds shared -> web -> server, in that order
npm run start   # serves the built web app + API from one process
```

### Type checking

```bash
npm run typecheck
```

## Deploying to Railway

1. Push this repository to GitHub and create a new Railway project from it.
2. Railway auto-detects Node via `railway.json` (Nixpacks builder), running `npm run build` then `npm run start`.
3. In the Railway service's **Variables** tab, set:
   - `CARDMARKET_APP_TOKEN`
   - `CARDMARKET_APP_SECRET`
   - `CARDMARKET_ACCESS_TOKEN`
   - `CARDMARKET_ACCESS_TOKEN_SECRET`
   - Railway sets `PORT` automatically — the server reads it.
4. Deploy. Every push to the connected branch redeploys automatically.

## Notes on Cardmarket pricing filters

- **Lowest matching listing** (default pricing basis) fetches active articles for a product and takes the cheapest one that satisfies quality, language, foiling, signed/altered/playset, and seller-location filters.
- **Trend / 1-, 7-, 30-day average** use Cardmarket's product-level price guide, which is not broken down by condition or language — the UI surfaces a warning on affected rows so this limitation is never silent.
