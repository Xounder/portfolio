import {
  GITHUB_API_HEADERS, GITHUB_REPOS_ENDPOINT, MAX_PAGES, MAX_VISIBLE_PROJECTS, PER_PAGE,
} from "./githubProjectsConfig.ts";
import {
  buildProjectCards, classifyHttpFailure, createCacheStore, dedupeRepositories,
  isAbortError, nextRetryDelayMs, parseGitHubRepositories, parseNextLink,
} from "./githubProjectsCore.ts";
import type { CacheState, CacheStore, GitHubFailure, GitHubRepositoryRecord } from "./githubTypes.ts";
import type { ProjectCardData } from "./types.ts";
import { projectPlaceholder, projectPresentationOverrides, staticFeaturedCards } from "./projectPresentation.ts";

export type InitialProjects = { cards: ProjectCardData[]; cacheState: CacheState };
export type RefreshProjectsResult =
  | { ok: true; cards: ProjectCardData[]; source: "network" | "cache" }
  | { ok: false; cards: ProjectCardData[]; source: "cache" | "static"; failure: GitHubFailure };

let store: CacheStore | undefined;
let inFlight: Promise<RefreshProjectsResult> | null = null;
let blockedUntil = 0;
// A page-one ETag cannot validate a multi-page snapshot. Keep the validator
// bound to the normalized raw records it actually validated, not merely the
// current value of a shared localStorage key.
let lastEtag: string | null = null;
let etagSnapshot: string | null = null;

function getStore(): CacheStore {
  if (!store) {
    let storage: Storage | null = null;
    try { storage = window.localStorage; } catch { /* unavailable: memory-only store */ }
    store = createCacheStore(storage);
  }
  return store;
}

function cardsFor(records: readonly GitHubRepositoryRecord[]): ProjectCardData[] {
  return buildProjectCards(records, staticFeaturedCards, projectPresentationOverrides, projectPlaceholder, MAX_VISIBLE_PROJECTS);
}

function fallback(now: number, failure: GitHubFailure): RefreshProjectsResult {
  const cached = getStore().read(now);
  if (cached.visibleRecords.length) {
    return { ok: false, cards: cardsFor(cached.records), source: "cache", failure };
  }
  return { ok: false, cards: [...staticFeaturedCards], source: "static", failure };
}

export function readInitialProjects(now: number): InitialProjects {
  const cached = getStore().read(now);
  return {
    cacheState: cached.state,
    cards: cached.state === "fresh" && cached.visibleRecords.length
      ? cardsFor(cached.records) : [...staticFeaturedCards],
  };
}

// Do not trust a Link pointing at another host, user, route, or query. The
// sequential page check also prevents cycles and duplicated page snapshots.
function validatedNextPage(link: string, expectedPage: number): string | null {
  try {
    const url = new URL(link);
    const endpoint = new URL(GITHUB_REPOS_ENDPOINT);
    if (url.origin !== endpoint.origin || url.pathname !== endpoint.pathname ||
      url.username || url.password || url.hash || url.searchParams.size !== endpoint.searchParams.size + 1) return null;
    for (const [key, value] of endpoint.searchParams) {
      if (url.searchParams.getAll(key).length !== 1 || url.searchParams.get(key) !== value) return null;
    }
    if (url.searchParams.getAll("page").length !== 1 ||
      url.searchParams.get("page") !== String(expectedPage) ||
      url.searchParams.get("per_page") !== String(PER_PAGE)) return null;
    return url.href;
  } catch { return null; }
}

// parseNextLink deliberately returns null both for "no next" and for an
// unparseable advertised next. Only the former completes a page set.
function advertisesNext(linkHeader: string | null): boolean {
  return linkHeader !== null && /\brel\s*=\s*["']?next\b/i.test(linkHeader);
}

const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

async function performRefresh(now: number): Promise<RefreshProjectsResult> {
  if (now < blockedUntil) return fallback(now, { kind: "rate-limited", retryAt: blockedUntil });

  const records: GitHubRepositoryRecord[] = [];
  let url = GITHUB_REPOS_ENDPOINT;
  let pages = 0;
  const snapshot = getStore().read(now);
  const etag = lastEtag && etagSnapshot !== null && snapshot.records.length &&
    JSON.stringify(snapshot.records) === etagSnapshot ? lastEtag : null;
  if (!etag) {
    lastEtag = null;
    etagSnapshot = null;
  }
  while (pages < MAX_PAGES) {
    let page: GitHubRepositoryRecord[] | null = null;
    let response: Response | undefined;
    for (let attempt = 1; ; attempt++) {
      try {
        response = await fetch(url, {
          headers: {
            ...GITHUB_API_HEADERS,
            ...(pages === 0 && etag ? { "If-None-Match": etag } : {}),
          },
        });
      } catch (error) {
        if (isAbortError(error)) return fallback(now, { kind: "aborted" });
        const delay = nextRetryDelayMs(attempt);
        if (delay === null) return fallback(now, { kind: "retryable" });
        await wait(delay);
        continue;
      }

      if (response.status === 304) {
        if (pages !== 0 || !etag) return fallback(now, { kind: "terminal", status: 304 });
        const cached = getStore().read(now);
        if (!cached.records.length || JSON.stringify(cached.records) !== etagSnapshot) {
          lastEtag = null;
          etagSnapshot = null;
          return fallback(now, { kind: "terminal", status: 304 });
        }
        getStore().write(cached.records, now);
        lastEtag = response.headers.get("ETag") ?? etag;
        return { ok: true, cards: cardsFor(cached.records), source: "cache" };
      }
      if (!response.ok) {
        const failure = classifyHttpFailure(response.status, response.headers, now);
        if (failure.kind === "rate-limited") {
          blockedUntil = failure.retryAt ?? now;
          return fallback(now, failure);
        }
        const delay = failure.kind === "retryable" ? nextRetryDelayMs(attempt) : null;
        if (delay === null) return fallback(now, failure);
        await wait(delay);
        continue;
      }
      try {
        page = parseGitHubRepositories(await response.json());
      } catch (error) {
        return fallback(now, { kind: isAbortError(error) ? "aborted" : "terminal" });
      }
      if (!page) return fallback(now, { kind: "terminal" });
      break;
    }

    records.push(...page);
    pages++;
    const linkHeader = response!.headers.get("Link");
    const next = parseNextLink(linkHeader);
    if (pages === MAX_PAGES || (!next && !advertisesNext(linkHeader))) {
      const complete = dedupeRepositories(records);
      getStore().write(complete, now);
      lastEtag = pages === 1 ? response!.headers.get("ETag") : null;
      etagSnapshot = lastEtag ? JSON.stringify(complete) : null;
      return { ok: true, cards: cardsFor(complete), source: "network" };
    }
    if (!next) return fallback(now, { kind: "terminal" });
    const safeNext = validatedNextPage(next, pages + 1);
    if (!safeNext) return fallback(now, { kind: "terminal" });
    url = safeNext;
  }
  return fallback(now, { kind: "terminal" });
}

export function refreshProjects(now: number): Promise<RefreshProjectsResult> {
  if (inFlight) return inFlight;
  inFlight = performRefresh(now).finally(() => { inFlight = null; });
  return inFlight;
}
