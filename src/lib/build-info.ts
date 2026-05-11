import { execSync } from 'node:child_process';

const safeGitSha = (): string => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
};

export const BUILD_COMMIT = process.env.CF_PAGES_COMMIT_SHA?.slice(0, 7) ?? safeGitSha();
export const BUILD_BRANCH = process.env.CF_PAGES_BRANCH ?? 'local';
export const BUILD_TIME = new Date().toISOString();
