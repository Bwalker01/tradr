# tradr

A Cardmarket-style pricing calculator for valuing **buy** lists and **trade** lists.

- **Buy mode** — build one list of cards and get a total price.
- **Trade mode** — build two lists ("your cards" / "their cards") and see both totals plus the difference.
- Prices are pulled from the best available data source per game (see [Pricing sources](#pricing-sources) below), filtered by card quality (condition), language, seller location, foiling, and more where the source supports it.
- Every filter has a list-wide default; card quality, language, and foiling can be overridden per card, with bulk-edit and "apply to new cards" defaults so you don't have to do it one card at a time.
- Dark-themed, responsive UI that works on desktop and mobile.

## Pricing sources

Cardmarket's own API currently isn't accepting new direct-access applications, so pricing is sourced per game via `PricingProvider` implementations, chosen automatically:

| Game | Source | Notes |
| --- | --- | --- |
| Magic: the Gathering | [Scryfall](https://scryfall.com/docs/api) | Free, no API key. Republishes Cardmarket's own EUR price guide (an aggregate market value per printing/foiling) — **not** individual seller listings. Quality and language filters are informational only for this source; seller-location filtering is unavailable and disabled in the UI. |
| Yu-Gi-Oh!, Pokémon, Flesh and Blood | Demo (simulated) | No live source wired up yet — see `MockPricingProvider`. |

If Cardmarket API credentials are configured (see below), `CardmarketPricingProvider` is used for **every** game instead, restoring full per-listing filtering (quality, language, seller location, signed/altered/playset) — it's the most accurate source when available, so it takes priority whenever it's configured. Each game's live status, source, and limitations are served from a single static registry (`GAME_CATALOG` in `packages/shared/src/constants.ts`) — update that one file if this picture changes (e.g. when Cardmarket access reopens, or another game gets a live source).

## Architecture

npm workspaces monorepo, TypeScript throughout:

```
packages/
  shared/   Domain types + reference data (conditions, languages, countries,
            pricing methods, the game catalog) + pure pricing math. The
            single source of truth used by both server and web — nothing
            here is duplicated in the other packages.
  server/   Express API. Each pricing source (Cardmarket, Scryfall) is a
            PricingProvider implementation with its own client module
            (src/cardmarket/, src/scryfall/); a GameRouterProvider dispatches
            per game to the right one, falling back to MockPricingProvider so
            the app is always fully demoable even with zero configuration.
  web/      React + Vite frontend. All state lives in a single React Context
            store (src/state/AppStateContext.tsx), including the fetched game
            catalog; all backend calls go through one typed client
            (src/api/client.ts).
```

In production, the server serves the built web app as static files and
exposes the API under `/api/*`, so the whole thing deploys as one Railway
service.

## Getting Cardmarket API credentials (optional)

Cardmarket's API access program is currently closed to new applicants. If and when you do get access:

1. Log into Cardmarket and go to **Account → API** (`https://www.cardmarket.com/en/Magic/Account/API`).
2. Create a **Dedicated App** token pair (App Token + App Secret).
3. Generate an Access Token + Access Token Secret for that app.
4. Put all four values into your `.env` (see `.env.example`) or into your Railway service's environment variables.

Once configured, `CardmarketPricingProvider` is used for every game automatically — no other changes needed. Without these credentials the app uses the per-game sources described above.

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
3. Optionally, in the Railway service's **Variables** tab, set the four `CARDMARKET_*` variables (see above) if you have Cardmarket API access. Railway sets `PORT` automatically — the server reads it.
4. Deploy. Every push to the connected branch redeploys automatically.

No configuration is required for Magic: the Gathering pricing to work — Scryfall needs no API key.
