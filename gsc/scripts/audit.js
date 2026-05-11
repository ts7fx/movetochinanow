#!/usr/bin/env node

/**
 * Quick GSC audit — top pages and queries for movetochinanow.com.
 *
 * Usage:
 *   npm run audit                                  # Text output
 *   npm run audit -- --json                        # JSON output
 *   npm run audit -- --filter page=/blog/          # Filter by page pattern
 */

import { querySearchAnalytics } from '../lib/gsc-client.js';
import { dateRanges } from '../lib/dates.js';
import { createOutput, parseFilters } from '../lib/output.js';

const { end, start90 } = dateRanges();
const out = createOutput();
const dimensionFilterGroups = parseFilters();

out.log(`\n=== GSC Audit: ${start90} → ${end} (90 days) ===\n`);

const pageData = await querySearchAnalytics({
  startDate: start90,
  endDate: end,
  dimensions: ['page'],
  rowLimit: 5000,
  dimensionFilterGroups,
});

const rows = pageData.rows || [];
const totals = rows.reduce(
  (acc, r) => ({
    impressions: acc.impressions + r.impressions,
    clicks: acc.clicks + r.clicks,
  }),
  { impressions: 0, clicks: 0 }
);

const stripHost = (u) =>
  u.replace('https://movetochinanow.com', '').replace('https://www.movetochinanow.com', '(www)') || '/';

out.log(`Total pages with impressions: ${rows.length}`);
out.log(`Total impressions: ${totals.impressions}`);
out.log(`Total clicks: ${totals.clicks}`);

out.log('\n=== Pages by impressions ===');
rows.sort((a, b) => b.impressions - a.impressions);
for (const r of rows.slice(0, 30)) {
  out.log(
    `  ${stripHost(r.keys[0])} | imp: ${r.impressions} | clicks: ${r.clicks} | CTR: ${(r.ctr * 100).toFixed(1)}% | pos: ${r.position.toFixed(1)}`
  );
}

out.log('\n=== Top queries (90 days) ===');
const queryData = await querySearchAnalytics({
  startDate: start90,
  endDate: end,
  dimensions: ['query'],
  rowLimit: 50,
  dimensionFilterGroups,
});
const queries = (queryData.rows || []).sort((a, b) => b.impressions - a.impressions);
for (const r of queries.slice(0, 30)) {
  out.log(
    `  "${r.keys[0]}" | imp: ${r.impressions} | clicks: ${r.clicks} | CTR: ${(r.ctr * 100).toFixed(1)}% | pos: ${r.position.toFixed(1)}`
  );
}

out.data.totals = { pages: rows.length, impressions: totals.impressions, clicks: totals.clicks };
out.data.pages = rows.map((r) => ({
  page: r.keys[0],
  impressions: r.impressions,
  clicks: r.clicks,
  ctr: r.ctr,
  position: r.position,
}));
out.data.queries = queries.map((r) => ({
  query: r.keys[0],
  impressions: r.impressions,
  clicks: r.clicks,
  ctr: r.ctr,
  position: r.position,
}));
out.finish();
