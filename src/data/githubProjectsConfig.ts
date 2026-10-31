export const GITHUB_USERNAME = "Xounder";
export const GITHUB_PROFILE_URL = "https://github.com/Xounder";
export const GITHUB_REPOS_ENDPOINT = "https://api.github.com/users/Xounder/repos?type=owner&sort=pushed&direction=desc&per_page=100";
export const GITHUB_API_HEADERS: Readonly<Record<string, string>> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
export const CACHE_KEY = "portfolio:github-projects:v2";
export const CACHE_VERSION = 2;
export const CACHE_TTL_MS = 30 * 60 * 1000;
export const MAX_VISIBLE_PROJECTS = 12;
export const MAX_PAGES = 3;
export const PER_PAGE = 100;
export const DEFAULT_RATE_LIMIT_BACKOFF_MS = 60_000;
export const BACKOFF_DELAYS_MS: readonly number[] = [500, 1500];
export const SELF_REPOSITORY_NAME = "portfolio";
