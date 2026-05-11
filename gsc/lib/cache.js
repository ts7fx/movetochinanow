/**
 * Response cache for GSC API calls.
 *
 * In-memory cache with file backing to survive between script runs.
 */

import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, '../data/cache');

const memCache = new Map();

export const TTL = {
  searchAnalytics: 60 * 60 * 1000,
  urlInspection: 4 * 60 * 60 * 1000,
  sitemaps: 60 * 60 * 1000,
};

function cacheKey(type, params) {
  const hash = createHash('md5').update(JSON.stringify({ type, ...params })).digest('hex');
  return `${type}-${hash}`;
}

function ensureDir() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
}

export function get(type, params) {
  const key = cacheKey(type, params);

  if (memCache.has(key)) {
    const entry = memCache.get(key);
    if (Date.now() < entry.expires) return entry.data;
    memCache.delete(key);
  }

  const fp = resolve(CACHE_DIR, `${key}.json`);
  if (existsSync(fp)) {
    try {
      const entry = JSON.parse(readFileSync(fp, 'utf-8'));
      if (Date.now() < entry.expires) {
        memCache.set(key, entry);
        return entry.data;
      }
      unlinkSync(fp);
    } catch {
      try { unlinkSync(fp); } catch {}
    }
  }

  return null;
}

export function set(type, params, data, ttlMs) {
  const key = cacheKey(type, params);
  const entry = { data, expires: Date.now() + ttlMs };

  memCache.set(key, entry);
  ensureDir();
  writeFileSync(resolve(CACHE_DIR, `${key}.json`), JSON.stringify(entry));
}
