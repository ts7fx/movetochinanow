# gsc — Google Search Console for movetochinanow.com

Node.js ES module project for querying GSC API: search performance, URL inspection, sitemaps.

## One-time setup

1. Create OAuth credentials at https://console.cloud.google.com/apis/credentials
   - Type: **Desktop app** (redirect URI is handled by the local callback server)
2. Copy `.env.example` → `.env`, fill in `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
3. Confirm `GSC_SITE_URL` matches your GSC property:
   - Domain property → `sc-domain:movetochinanow.com`
   - URL prefix → `https://movetochinanow.com/`
4. `npm run auth` → opens browser, after consent copy printed `GSC_REFRESH_TOKEN` into `.env`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run auth` | One-time OAuth (writes refresh token to terminal) |
| `npm run audit` | Top pages + top queries (90 days) |
| `npm run research` | Daily trend, high-imp/low-CTR queries, query→page mapping, country/device, search appearance |
| `npm run snapshot` | Save 30-day perf snapshot to `data/snapshots/YYYY-MM-DD.json` |

All scripts support `--json` for machine-readable output. `audit` and `research` accept `--filter`:

```bash
npm run audit -- --json | jq '.totals'
npm run research -- --filter query=china
npm run audit -- --filter page=/blog/
```

`--filter` syntax: `dimension=expression` (contains) or `dimension:operator=expression`.
Operators: `contains`, `equals`, `notContains`, `notEquals`, `includingRegex`, `excludingRegex`.

## Architecture

- `lib/config.js` — Loads `.env`, exports `getGscConfig()` and `getSiteUrl()`
- `lib/gsc-client.js` — OAuth2 client + retry + cache. Exports `querySearchAnalytics`, `inspectUrl`, `listSitemaps`, `submitSitemap`
- `lib/cache.js` — In-memory + file-backed response cache (`data/cache/`). TTL: search analytics 1h, URL inspection 4h
- `lib/dates.js` — `dateRanges()` returns 7/30/90-day windows ending 3 days ago (GSC data lag)
- `lib/output.js` — `--json` mode + `--filter` parsing

GSC data lag: results from the last ~3 days are not yet final, so all queries end at `today - 3`.
