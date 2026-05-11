/**
 * Environment variable loader.
 *
 * Reads OAuth client credentials, refresh token, and site URL from local .env.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseEnvFile(filePath) {
  let raw;
  try {
    raw = readFileSync(filePath, 'utf-8');
  } catch {
    return {};
  }
  const vars = {};
  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      vars[match[1]] = val;
    }
  }
  return vars;
}

let envCache;

export function getEnv() {
  if (!envCache) {
    envCache = parseEnvFile(resolve(__dirname, '../.env'));
  }
  return envCache;
}

export function getGscConfig() {
  const env = getEnv();
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GSC_REFRESH_TOKEN || env.GSC_REFRESH_TOKEN,
  };
}

export function getSiteUrl() {
  const env = getEnv();
  return process.env.GSC_SITE_URL || env.GSC_SITE_URL || 'sc-domain:movetochinanow.com';
}
