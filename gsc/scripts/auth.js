#!/usr/bin/env node

/**
 * One-time OAuth2 authorization for Google Search Console API.
 *
 * Usage:
 *   npm run auth
 *
 * Starts a local HTTP server on port 3456 to receive the OAuth callback.
 * After authorization, prints the refresh token to copy into .env.
 */

import { createServer } from 'http';
import { URL } from 'url';
import { google } from 'googleapis';
import { getGscConfig } from '../lib/config.js';

const PORT = parseInt(process.env.PORT || '3456', 10);
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPES = [
  'https://www.googleapis.com/auth/webmasters',
];

const { clientId, clientSecret } = getGscConfig();

if (!clientId || !clientSecret) {
  console.error('Error: Missing Google OAuth credentials.');
  console.error('Set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in gsc/.env');
  console.error('Create credentials at: https://console.cloud.google.com/apis/credentials');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('\n=== Google Search Console OAuth Authorization ===\n');
console.log('1. Open this URL in your browser:\n');
console.log(`   ${authUrl}\n`);
console.log('2. Sign in with the Google account that owns movetochinanow.com in GSC.');
console.log('3. Grant "Search Console" permission.');
console.log(`4. You will be redirected to localhost:${PORT} — the token will appear below.\n`);
console.log(`Waiting for OAuth callback on http://localhost:${PORT} ...\n`);

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname !== '/callback') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Authorization denied</h1><p>You can close this tab.</p>');
    console.error(`\nAuthorization denied: ${error}`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400);
    res.end('Missing authorization code');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>GSC Authorization successful!</h1><p>You can close this tab and return to the terminal.</p>');

    console.log('=== Authorization successful! ===\n');

    if (tokens.refresh_token) {
      console.log('Add this to your gsc/.env file:\n');
      console.log(`GSC_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    } else {
      console.log('Warning: No refresh token returned.');
      console.log('This can happen if you previously authorized this app.');
      console.log('To get a new refresh token, revoke access at:');
      console.log('https://myaccount.google.com/permissions\n');
      console.log('Then run this script again.\n');
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>Token exchange failed</h1><p>Check the terminal for details.</p>');
    console.error('\nToken exchange failed:', err.message);
  }

  server.close();
});

server.listen(PORT, () => {
  // Server started, waiting for callback
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Error: Port ${PORT} is already in use. Close the other process and try again.`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});
