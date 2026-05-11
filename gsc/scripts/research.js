#!/usr/bin/env node

/**
 * Deep GSC research — trends, CTR opportunities, query→page mapping,
 * country/device breakdown, search appearance.
 *
 * Usage:
 *   npm run research                                # Text output
 *   npm run research -- --json                      # JSON output
 *   npm run research -- --filter query=china        # Filter
 */

import { querySearchAnalytics } from '../lib/gsc-client.js';
import { dateRanges } from '../lib/dates.js';
import { createOutput, parseFilters } from '../lib/output.js';

const { end, start30, start90 } = dateRanges();
const out = createOutput();
const dimensionFilterGroups = parseFilters();

const stripHost = (u) =>
  u.replace('https://movetochinanow.com', '').replace('https://www.movetochinanow.com', '(www)') || '/';

// 1. Daily trend
out.log('=== DAILY TREND (last 30 days) ===');
const dailyData = await querySearchAnalytics({
  startDate: start30,
  endDate: end,
  dimensions: ['date'],
  rowLimit: 100,
});
const dailyRows = (dailyData.rows || []).sort((a, b) => a.keys[0].localeCompare(b.keys[0]));
let totalImpressions = 0, totalClicks = 0;
for (const r of dailyRows) {
  totalImpressions += r.impressions;
  totalClicks += r.clicks;
  out.log(`  ${r.keys[0]} | imp: ${r.impressions} | clicks: ${r.clicks} | pos: ${r.position.toFixed(1)}`);
}
out.log(`  TOTAL: ${totalImpressions} impressions, ${totalClicks} clicks`);
out.data.daily = dailyRows.map(r => ({ date: r.keys[0], impressions: r.impressions, clicks: r.clicks, position: r.position }));
out.data.dailyTotals = { impressions: totalImpressions, clicks: totalClicks };

// 2. High-impression / low-CTR queries
out.log('\n=== HIGH IMPRESSION / LOW CTR QUERIES (90 days) ===');
const queryData90 = await querySearchAnalytics({
  startDate: start90,
  endDate: end,
  dimensions: ['query'],
  rowLimit: 200,
  dimensionFilterGroups,
});
const queries90 = (queryData90.rows || [])
  .filter(r => r.impressions >= 2)
  .sort((a, b) => b.impressions - a.impressions);
for (const r of queries90.slice(0, 30)) {
  out.log(`  "${r.keys[0]}" | imp: ${r.impressions} | clicks: ${r.clicks} | CTR: ${(r.ctr * 100).toFixed(1)}% | pos: ${r.position.toFixed(1)}`);
}
out.data.highImpLowCtr = queries90.slice(0, 30).map(r => ({ query: r.keys[0], impressions: r.impressions, clicks: r.clicks, ctr: r.ctr, position: r.position }));

// 3. Query → page mapping
out.log('\n=== QUERY -> PAGE MAPPING (90 days) ===');
const qpData = await querySearchAnalytics({
  startDate: start90,
  endDate: end,
  dimensions: ['query', 'page'],
  rowLimit: 500,
  dimensionFilterGroups,
});
const qpRows = (qpData.rows || [])
  .filter(r => r.impressions >= 2)
  .sort((a, b) => b.impressions - a.impressions);
for (const r of qpRows.slice(0, 40)) {
  out.log(`  "${r.keys[0]}" -> ${stripHost(r.keys[1])} | imp: ${r.impressions} | clicks: ${r.clicks} | pos: ${r.position.toFixed(1)}`);
}
out.data.queryPageMapping = qpRows.slice(0, 40).map(r => ({ query: r.keys[0], page: r.keys[1], impressions: r.impressions, clicks: r.clicks, position: r.position }));

// 4. Country breakdown
out.log('\n=== COUNTRY BREAKDOWN (90 days) ===');
const countryData = await querySearchAnalytics({
  startDate: start90,
  endDate: end,
  dimensions: ['country'],
  rowLimit: 20,
});
const countryRows = (countryData.rows || []).sort((a, b) => b.impressions - a.impressions);
for (const r of countryRows) {
  out.log(`  ${r.keys[0]} | imp: ${r.impressions} | clicks: ${r.clicks} | pos: ${r.position.toFixed(1)}`);
}
out.data.countries = countryRows.map(r => ({ country: r.keys[0], impressions: r.impressions, clicks: r.clicks, position: r.position }));

// 5. Device breakdown
out.log('\n=== DEVICE BREAKDOWN (90 days) ===');
const deviceData = await querySearchAnalytics({
  startDate: start90,
  endDate: end,
  dimensions: ['device'],
  rowLimit: 10,
});
for (const r of (deviceData.rows || [])) {
  out.log(`  ${r.keys[0]} | imp: ${r.impressions} | clicks: ${r.clicks} | CTR: ${(r.ctr * 100).toFixed(1)}% | pos: ${r.position.toFixed(1)}`);
}
out.data.devices = (deviceData.rows || []).map(r => ({ device: r.keys[0], impressions: r.impressions, clicks: r.clicks, ctr: r.ctr, position: r.position }));

// 6. Search appearance (rich results, etc.)
out.log('\n=== SEARCH APPEARANCE (90 days) ===');
try {
  const appearanceData = await querySearchAnalytics({
    startDate: start90,
    endDate: end,
    dimensions: ['searchAppearance'],
    rowLimit: 20,
  });
  if (appearanceData.rows && appearanceData.rows.length > 0) {
    out.data.searchAppearance = [];
    for (const r of appearanceData.rows) {
      out.log(`  ${r.keys[0]} | imp: ${r.impressions} | clicks: ${r.clicks}`);
      out.data.searchAppearance.push({ type: r.keys[0], impressions: r.impressions, clicks: r.clicks });
    }
  } else {
    out.log('  No rich result appearances detected');
    out.data.searchAppearance = [];
  }
} catch (err) {
  out.log(`  Error: ${err.message?.substring(0, 60)}`);
}

out.log('\n=== Research complete ===');
out.finish();
