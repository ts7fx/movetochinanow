#!/usr/bin/env node

/**
 * Daily GSC snapshot — captures page performance, top queries, and daily trend
 * to data/snapshots/YYYY-MM-DD.json for historical comparison.
 *
 * Usage:
 *   npm run snapshot
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { querySearchAnalytics } from '../lib/gsc-client.js';
import { dateRanges, formatDate } from '../lib/dates.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = resolve(__dirname, '../data/snapshots');

const { end, start7, start30 } = dateRanges();
const today = formatDate(new Date());

console.log(`Capturing GSC snapshot for ${today} (data through ${end})...`);

const [pageData, queryData, dailyData] = await Promise.all([
  querySearchAnalytics({
    startDate: start30,
    endDate: end,
    dimensions: ['page'],
    rowLimit: 5000,
  }),
  querySearchAnalytics({
    startDate: start30,
    endDate: end,
    dimensions: ['query'],
    rowLimit: 1000,
  }),
  querySearchAnalytics({
    startDate: start30,
    endDate: end,
    dimensions: ['date'],
    rowLimit: 100,
  }),
]);

const rows30 = pageData.rows || [];
const queries30 = queryData.rows || [];
const daily = (dailyData.rows || []).sort((a, b) => a.keys[0].localeCompare(b.keys[0]));

const totals = daily.reduce(
  (acc, r) => ({
    impressions: acc.impressions + r.impressions,
    clicks: acc.clicks + r.clicks,
  }),
  { impressions: 0, clicks: 0 }
);

const snapshot = {
  capturedAt: today,
  dataRange: { start: start30, end },
  totals,
  daily: daily.map(r => ({
    date: r.keys[0],
    impressions: r.impressions,
    clicks: r.clicks,
    ctr: r.ctr,
    position: r.position,
  })),
  pages: rows30
    .sort((a, b) => b.impressions - a.impressions)
    .map(r => ({
      page: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: r.ctr,
      position: r.position,
    })),
  queries: queries30
    .sort((a, b) => b.impressions - a.impressions)
    .map(r => ({
      query: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: r.ctr,
      position: r.position,
    })),
};

if (!existsSync(SNAPSHOT_DIR)) mkdirSync(SNAPSHOT_DIR, { recursive: true });
const fp = resolve(SNAPSHOT_DIR, `${today}.json`);
writeFileSync(fp, JSON.stringify(snapshot, null, 2));

console.log(`\nSnapshot saved: ${fp}`);
console.log(`  30-day totals: ${totals.impressions} impressions, ${totals.clicks} clicks`);
console.log(`  Pages tracked: ${snapshot.pages.length}`);
console.log(`  Queries tracked: ${snapshot.queries.length}`);
