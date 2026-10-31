import {
  GITHUB_API_HEADERS, GITHUB_REPOS_ENDPOINT, MAX_PAGES, MAX_VISIBLE_PROJECTS, PER_PAGE,
} from "./githubProjectsConfig.ts";
import {
  buildProjectCards, classifyHttpFailure, createCacheStore, dedupeRepositories,
  isAbortError, nextRetryDelayMs, parseGitHubRepositories, parseNextLink, selectVisibleRepositories,
} from "./githubProjectsCore.ts";
import type { CacheState, CacheStore, GitHubFailure, GitHubRepositoryRecord } from "./githubTypes.ts";
import type { ProjectCardData } from "./types.ts";
import { projectCategoryImages } from "./projectPresentation.ts";

export type InitialProjects = { cards: ProjectCardData[]; cacheState: CacheState };
export type RefreshProjectsResult =
  | { ok: true; cards: ProjectCardData[]; source: "network" | "cache" }
  | { ok: false; cards: ProjectCardData[]; source: "cache" | "empty"; failure: GitHubFailure };

const COVER_PATH = ".project-cover";
const COVER_KEY = "portfolio:github-project-covers:v2";
const COVER_TTL = 30 * 60 * 1000;
const COVER_CONCURRENCY = 3;
type CoverEntry = { identity: string; filename: string | null; savedAt: number };
const coverMemory: Record<string, CoverEntry> = {};
let coverLoaded = false;
let coverPreferMemory = false;
const coverFlights = new Map<string, Promise<string | null>>();
const hydrationFlights = new Map<string, Promise<ProjectCardData[]>>();
let activeCoverRequests = 0;
const coverWaiters: Array<() => void> = [];

// A per-snapshot worker limit is insufficient when several route consumers
// hydrate different snapshots at once. Transfer permits in FIFO order across
// every cover caller (including refresh); the holder releases in finally.
function acquireCoverSlot(): Promise<void> | null {
  if (activeCoverRequests < COVER_CONCURRENCY && coverWaiters.length === 0) {
    activeCoverRequests++;
    return null;
  }
  return new Promise<void>(resolve => { coverWaiters.push(resolve); });
}

function releaseCoverSlot(): void {
  const next = coverWaiters.shift();
  if (next) next(); // transfer the occupied slot, never exceed the cap
  else activeCoverRequests--;
}

function identity(record: GitHubRepositoryRecord): string {
  return JSON.stringify([record.id, record.full_name.toLowerCase(), record.name.toLowerCase(),
    record.default_branch, record.pushed_at, COVER_PATH]);
}

function safeFilename(value: unknown): value is string {
  return safeSegment(value) && /\.(?:png|jpe?g|webp|gif|avif)$/i.test(value);
}

function safeSegment(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value !== "." && value !== ".." &&
    !value.startsWith(".") && !value.includes("..") && !/[\\/%]/.test(value) &&
    !/[\p{C}]/u.test(value);
}

function rawUrl(record: GitHubRepositoryRecord, filename: string): string {
  return `https://raw.githubusercontent.com/${encodeURIComponent(record.full_name.split("/")[0])}/${encodeURIComponent(record.name)}/${record.default_branch.split("/").map(encodeURIComponent).join("/")}/${COVER_PATH}/${encodeURIComponent(filename)}`;
}

function loadCovers(): void {
  if (coverLoaded) return;
  coverLoaded = true;
  try {
    const raw = window.localStorage.getItem(COVER_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return;
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== "object" || value === null) continue;
      const entry = value as Partial<CoverEntry>;
      if (key === entry.identity && (entry.filename === null || safeFilename(entry.filename)) &&
        typeof entry.savedAt === "number" && Number.isFinite(entry.savedAt)) {
        coverMemory[key] = { identity: key, filename: entry.filename, savedAt: entry.savedAt } as CoverEntry;
      }
    }
  } catch { coverPreferMemory = true; }
}

function cachedCover(record: GitHubRepositoryRecord, now: number): { found: boolean; url: string | null } {
  loadCovers();
  const entry = coverMemory[identity(record)];
  if (!entry || now < entry.savedAt || now - entry.savedAt >= COVER_TTL) return { found: false, url: null };
  return { found: true, url: entry.filename === null ? null : rawUrl(record, entry.filename) };
}

function saveCover(record: GitHubRepositoryRecord, filename: string | null, now: number): void {
  loadCovers();
  const key = identity(record);
  coverMemory[key] = { identity: key, filename, savedAt: now };
  if (!coverPreferMemory) {
    try { window.localStorage.setItem(COVER_KEY, JSON.stringify(coverMemory)); }
    catch { coverPreferMemory = true; }
  }
}

function cardsFor(records: readonly GitHubRepositoryRecord[], now: number): ProjectCardData[] {
  const selected = selectVisibleRepositories(records, MAX_VISIBLE_PROJECTS);
  const cards = buildProjectCards(selected, projectCategoryImages, MAX_VISIBLE_PROJECTS);
  return cards.map((card, index) => {
    const cover = cachedCover(selected[index], now).url;
    return cover ? { ...card, cardInfo: { ...card.cardInfo, image: { ...card.cardInfo.image, img: cover } } } : card;
  });
}

function validatedFile(value: unknown, record: GitHubRepositoryRecord): { name: string | null; trustworthy: boolean } {
  const invalid = { name: null, trustworthy: false };
  if (typeof value !== "object" || value === null || Array.isArray(value)) return invalid;
  const file = value as Record<string, unknown>;
  if ((file.type !== "file" && file.type !== "dir") || !safeSegment(file.name) ||
    file.path !== `${COVER_PATH}/${file.name}` || typeof file.sha !== "string" ||
    !/^[a-f0-9]{40}$/i.test(file.sha)) return invalid;
  if (file.type === "dir" || !safeFilename(file.name)) return { name: null, trustworthy: true };
  // Compare the entire URL, including the ref; no signed URL, query, userinfo or foreign host.
  return file.download_url === rawUrl(record, file.name)
    ? { name: file.name, trustworthy: true } : invalid;
}

async function discoverCover(record: GitHubRepositoryRecord, now: number): Promise<string | null> {
  const cached = cachedCover(record, now);
  if (cached.found) return cached.url;
  if (now < blockedUntil) return null;
  const key = identity(record);
  const pending = coverFlights.get(key);
  if (pending) return pending;
  const flight = (async () => {
    const waiting = acquireCoverSlot();
    if (waiting) await waiting;
    try {
      // A queued request must observe quota failures from previous holders.
      if (now < blockedUntil) return null;
      const url = `https://api.github.com/repos/${encodeURIComponent(record.full_name.split("/")[0])}/${encodeURIComponent(record.name)}/contents/${COVER_PATH}?ref=${encodeURIComponent(record.default_branch)}`;
      const response = await fetch(url, { headers: GITHUB_API_HEADERS });
      if (response.status === 403 || response.status === 429) {
        blockedUntil = Math.max(blockedUntil, classifyHttpFailure(response.status, response.headers, now).retryAt ?? now);
        return null;
      }
      if (response.status === 404) { saveCover(record, null, now); return null; }
      if (!response.ok) return null;
      const payload: unknown = await response.json();
      if (!Array.isArray(payload)) return null;
      const inspected = payload.map(item => validatedFile(item, record));
      const names = inspected.map(item => item.name).filter((name): name is string => name !== null);
      names.sort((a, b) => Number(/^cover\./i.test(b)) - Number(/^cover\./i.test(a)) ||
        a.toLowerCase().localeCompare(b.toLowerCase(), "en") || a.localeCompare(b, "en"));
      const filename = names[0] ?? null;
      // An invalid entry could be the cover itself: do not turn malformed data
      // into a durable absence. A genuine empty directory or verified non-image
      // entries do prove absence.
      if (filename !== null || inspected.every(item => item.trustworthy)) saveCover(record, filename, now);
      return filename === null ? null : rawUrl(record, filename);
    } catch { return null; }
    finally { releaseCoverSlot(); }
  })();
  coverFlights.set(key, flight);
  try { return await flight; } finally { if (coverFlights.get(key) === flight) coverFlights.delete(key); }
}

async function resolvedCards(records: readonly GitHubRepositoryRecord[], now: number): Promise<ProjectCardData[]> {
  const selected = selectVisibleRepositories(records, MAX_VISIBLE_PROJECTS);
  let next = 0;
  const workers = Array.from({ length: Math.min(COVER_CONCURRENCY, selected.length) }, async () => {
    while (next < selected.length && now >= blockedUntil) {
      const record = selected[next++];
      await discoverCover(record, now);
    }
  });
  await Promise.all(workers);
  return cardsFor(selected, now);
}

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

function fallback(now: number, failure: GitHubFailure): RefreshProjectsResult {
  const cached = getStore().read(now);
  if ((cached.state === "fresh" || cached.state === "stale") && cached.visibleRecords.length) {
    return { ok: false, cards: cardsFor(cached.records, now), source: "cache", failure };
  }
  return { ok: false, cards: [], source: "empty", failure };
}

export function readInitialProjects(now: number): InitialProjects {
  const cached = getStore().read(now);
  return {
    cacheState: cached.state,
    cards: cached.state === "fresh" && cached.visibleRecords.length
      ? cardsFor(cached.records, now) : [],
  };
}

export function hydrateCachedProjects(now: number): Promise<ProjectCardData[]> {
  const cached = getStore().read(now);
  if (cached.state !== "fresh") return Promise.resolve([]);
  const snapshot = JSON.stringify(cached.records);
  const pending = hydrationFlights.get(snapshot);
  if (pending) return pending;
  const flight = resolvedCards(cached.records, now).finally(() => {
    if (hydrationFlights.get(snapshot) === flight) hydrationFlights.delete(snapshot);
  });
  hydrationFlights.set(snapshot, flight);
  return flight;
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
        return { ok: true, cards: await resolvedCards(cached.records, now), source: "cache" };
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
      return { ok: true, cards: await resolvedCards(complete, now), source: "network" };
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
