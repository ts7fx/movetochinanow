/**
 * Google Search Console API client.
 *
 * Methods: search analytics, URL inspection, sitemap management.
 * Features: automatic retry with exponential backoff, response caching.
 */

import { google } from 'googleapis';
import { getGscConfig, getSiteUrl } from './config.js';
import * as cache from './cache.js';

let cachedClient;

async function withRetry(fn, { retries = 2, delay = 5000 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const code = err.code || err.response?.status;
      const msg = err.message || '';
      const isRetryable = code === 429 || code === 503 ||
        msg.includes('quota') || msg.includes('Rate Limit') || msg.includes('UNAVAILABLE');

      if (attempt < retries && isRetryable) {
        const waitMs = delay * (attempt + 1);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      throw err;
    }
  }
}

export function createGscClient() {
  if (cachedClient) return cachedClient;

  const { clientId, clientSecret, refreshToken } = getGscConfig();

  if (!clientId || !clientSecret) {
    throw new Error('Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in gsc/.env');
  }
  if (!refreshToken) {
    throw new Error('Missing GSC_REFRESH_TOKEN. Run: npm run auth');
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });

  cachedClient = google.searchconsole({ version: 'v1', auth: oauth2 });
  return cachedClient;
}

export async function querySearchAnalytics(options) {
  const {
    startDate,
    endDate,
    dimensions = ['query', 'page'],
    dimensionFilterGroups,
    rowLimit = 1000,
    startRow = 0,
    type = 'web',
  } = options;

  const cacheParams = { startDate, endDate, dimensions, dimensionFilterGroups, rowLimit, startRow, type };
  const cached = cache.get('searchAnalytics', cacheParams);
  if (cached) return cached;

  const client = createGscClient();
  const siteUrl = getSiteUrl();

  const body = { startDate, endDate, dimensions, rowLimit, startRow, type };
  if (dimensionFilterGroups) {
    body.dimensionFilterGroups = dimensionFilterGroups;
  }

  const data = await withRetry(async () => {
    const res = await client.searchanalytics.query({
      siteUrl,
      requestBody: body,
    });
    return res.data;
  });

  cache.set('searchAnalytics', cacheParams, data, cache.TTL.searchAnalytics);
  return data;
}

export async function inspectUrl(inspectionUrl) {
  const cacheParams = { inspectionUrl };
  const cached = cache.get('urlInspection', cacheParams);
  if (cached) return cached;

  const client = createGscClient();
  const siteUrl = getSiteUrl();

  const data = await withRetry(async () => {
    const res = await client.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl,
        siteUrl,
      },
    });
    return res.data;
  });

  cache.set('urlInspection', cacheParams, data, cache.TTL.urlInspection);
  return data;
}

export async function listSitemaps() {
  const cached = cache.get('sitemaps', {});
  if (cached) return cached;

  const client = createGscClient();
  const siteUrl = getSiteUrl();

  const data = await withRetry(async () => {
    const res = await client.sitemaps.list({ siteUrl });
    return res.data.sitemap || [];
  });

  cache.set('sitemaps', {}, data, cache.TTL.sitemaps);
  return data;
}

export async function submitSitemap(sitemapUrl) {
  const client = createGscClient();
  const siteUrl = getSiteUrl();

  await withRetry(async () => {
    await client.sitemaps.submit({ siteUrl, feedpath: sitemapUrl });
  });
}

export async function getPagePerformance(startDate, endDate) {
  const data = await querySearchAnalytics({
    startDate,
    endDate,
    dimensions: ['page'],
    rowLimit: 1000,
  });

  return (data.rows || []).map(row => ({
    page: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}

export async function getTopQueries(startDate, endDate, limit = 100) {
  const data = await querySearchAnalytics({
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: limit,
  });

  return (data.rows || []).map(row => ({
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}
