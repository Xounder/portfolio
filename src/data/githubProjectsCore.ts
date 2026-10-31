import {
  BACKOFF_DELAYS_MS, CACHE_KEY, CACHE_TTL_MS, CACHE_VERSION,
  courseExclusions, DEFAULT_RATE_LIMIT_BACKOFF_MS, GITHUB_USERNAME,
  MAX_PAGES, SELF_REPOSITORY_NAME,
} from "./githubProjectsConfig.ts";
import type {
  CacheReadResult, CacheState, CacheStorage, CacheStore, GitHubCachePayload,
  GitHubFailure, GitHubRepositoryRecord, ProjectPresentationMap,
  ProjectPresentationOverride,
} from "./githubTypes.ts";
import type { ProjectCardData } from "./types.ts";

export type RepositoryEligibility = Pick<
  GitHubRepositoryRecord,
  "name" | "topics" | "description" | "fork" | "archived" | "visibility"
>;

// Match the literal path, not URL-decoded segments: userinfo, ports, queries,
// fragments, encoded separators and extra path segments must never become links.
function parseRepositoryLink(link: string): { owner: string; repo: string } | null {
  const match = /^https:\/\/github\.com\/([a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?)\/([a-z0-9._-]+)\/?$/i.exec(link);
  if (!match || match[2] === "." || match[2] === "..") return null;
  return { owner: match[1].toLowerCase(), repo: match[2].toLowerCase() };
}

function hasExpectedRepositoryIdentity(name: string, fullName: string, link: string): boolean {
  const identity = parseRepositoryLink(link);
  const fullNameParts = /^([a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?)\/([a-z0-9._-]+)$/i.exec(fullName);
  const normalizedName = name.toLowerCase();
  return identity !== null && fullNameParts !== null &&
    normalizedName !== "." && normalizedName !== ".." &&
    fullNameParts[1].toLowerCase() === GITHUB_USERNAME.toLowerCase() &&
    identity.owner === GITHUB_USERNAME.toLowerCase() &&
    fullNameParts[2].toLowerCase() === normalizedName &&
    (identity.repo === normalizedName || identity.repo === `${normalizedName}.git`);
}

function normalizeRepository(value: unknown): GitHubRepositoryRecord | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "number" || !Number.isFinite(item.id) ||
    typeof item.name !== "string" || !item.name.trim() ||
    typeof item.full_name !== "string" || !item.full_name.trim() ||
    typeof item.html_url !== "string" ||
    !hasExpectedRepositoryIdentity(item.name, item.full_name, item.html_url) ||
    typeof item.fork !== "boolean" || typeof item.archived !== "boolean" ||
    (item.private !== false && item.visibility !== "public") ||
    (item.visibility !== undefined && item.visibility !== "public") ||
    (item.private !== undefined && item.private !== false) ||
    (item.topics !== undefined && (!Array.isArray(item.topics) ||
      !item.topics.every((topic: unknown) => typeof topic === "string"))) ||
    (item.description != null && typeof item.description !== "string") ||
    (item.language != null && typeof item.language !== "string") ||
    typeof item.pushed_at !== "string" || !Number.isFinite(Date.parse(item.pushed_at))) return null;
  return {
    id: item.id, name: item.name, full_name: item.full_name,
    description: (item.description as string | null | undefined) ?? null,
    topics: (item.topics as string[] | undefined) ?? [],
    language: (item.language as string | null | undefined) ?? null,
    html_url: item.html_url, pushed_at: item.pushed_at,
    fork: item.fork, archived: item.archived, visibility: "public",
  };
}

export function parseGitHubRepositories(payload: unknown): GitHubRepositoryRecord[] | null {
  if (!Array.isArray(payload)) return null;
  const records = payload.map(normalizeRepository).filter((record): record is GitHubRepositoryRecord => record !== null);
  return records.length ? records : null;
}

export function isExcludedRepository(record: RepositoryEligibility): boolean {
  const name = record.name.toLowerCase();
  return record.visibility !== "public" || record.fork || record.archived ||
    name === GITHUB_USERNAME.toLowerCase() || name === SELF_REPOSITORY_NAME ||
    courseExclusions.excludedRepos.has(name) ||
    courseExclusions.excludedNamePatterns.some(pattern => pattern.test(name)) ||
    record.topics.some(topic => courseExclusions.excludedTopics.has(topic.toLowerCase())) ||
    (record.description !== null && courseExclusions.excludedDescriptionPatterns.some(pattern => pattern.test(record.description!)));
}

export function filterVisibleRepositories(records: readonly GitHubRepositoryRecord[]): GitHubRepositoryRecord[] {
  return records.filter(record => !isExcludedRepository(record));
}

export function dedupeRepositories(records: readonly GitHubRepositoryRecord[]): GitHubRepositoryRecord[] {
  const ids = new Set<number>();
  const names = new Set<string>();
  return records.filter(record => {
    const name = record.full_name.toLowerCase();
    if (ids.has(record.id) || names.has(name)) return false;
    ids.add(record.id);
    names.add(name);
    return true;
  });
}

export function sortNewRepositories(records: readonly GitHubRepositoryRecord[]): GitHubRepositoryRecord[] {
  return [...records].sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at) ||
    (a.full_name < b.full_name ? -1 : a.full_name > b.full_name ? 1 : 0));
}

export function getRepositorySlugFromLink(link: string): string | null {
  const identity = parseRepositoryLink(link);
  if (!identity) return null;
  const slug = identity.repo.replace(/\.git$/i, "");
  return slug ? slug.toLowerCase() : null;
}

export function humanizeRepositoryName(name: string): string {
  const humanized = name.replace(/[-_]/g, " ").trim().replace(/\s+/g, " ").toLowerCase();
  return humanized.charAt(0).toUpperCase() + humanized.slice(1);
}

export function mapRepositoryToCard(
  record: GitHubRepositoryRecord,
  override: ProjectPresentationOverride | undefined,
  placeholder: ProjectPresentationOverride,
): ProjectCardData {
  const seen = new Set<string>();
  const technologies = [...record.topics, ...(record.language ? [record.language] : [])].filter(technology => {
    const key = technology.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    kind: "project",
    cardInfo: {
      title: override?.title ?? humanizeRepositoryName(record.name),
      description: override?.description ?? (record.description?.trim() || "Public GitHub project."),
      image: override?.image ?? placeholder.image,
      link: record.html_url,
    },
    projectInfo: { technologies: override?.technologies ?? technologies },
  };
}

export function buildProjectCards(
  records: readonly GitHubRepositoryRecord[],
  featuredCards: readonly ProjectCardData[],
  overrides: ProjectPresentationMap,
  placeholder: ProjectPresentationOverride,
  limit: number,
): ProjectCardData[] {
  const featuredSlugs = new Set(featuredCards.map(card => getRepositorySlugFromLink(card.cardInfo.link ?? "")));
  const newCards = sortNewRepositories(dedupeRepositories(filterVisibleRepositories(records)))
    .filter(record => !featuredSlugs.has(record.name.toLowerCase()))
    .map(record => mapRepositoryToCard(record, overrides.get(record.name.toLowerCase()), placeholder));
  return [...featuredCards, ...newCards].slice(0, Math.max(0, limit));
}

export function parseNextLink(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(",")) {
    const match = /^\s*<([^<>\s]+)>\s*;\s*rel\s*=\s*(?:"next"|next)\s*(?:;.*)?$/i.exec(part);
    if (match) {
      try {
        const url = new URL(match[1]);
        if (url.protocol === "https:") return url.href;
      } catch { /* malformed link */ }
    }
  }
  return null;
}

export function canFetchNextPage(pagesFetched: number): boolean {
  return pagesFetched < MAX_PAGES;
}

export function createCacheStore(storage: CacheStorage | null): CacheStore {
  let memoryRaw: string | null = null;
  let preferMemory = false;
  return {
    read(now: number): CacheReadResult {
      let raw = memoryRaw;
      if (!preferMemory) {
        try { raw = storage?.getItem(CACHE_KEY) ?? memoryRaw; } catch { /* use memory */ }
      }
      if (raw === null) return { state: "missing", records: [], visibleRecords: [] };
      try {
        const payload: unknown = JSON.parse(raw);
        if (typeof payload !== "object" || payload === null || Array.isArray(payload)) throw new Error("Invalid cache");
        const { version, savedAt, records } = payload as Record<string, unknown>;
        if (version !== CACHE_VERSION || typeof savedAt !== "number" || !Number.isFinite(savedAt) ||
          !Array.isArray(records)) throw new Error("Invalid cache");
        if (records.length === 0) return { state: "missing", records: [], visibleRecords: [] };
        const parsed = parseGitHubRepositories(records);
        if (!parsed || parsed.length !== records.length) throw new Error("Invalid cache records");
        return {
          state: now >= savedAt && now - savedAt < CACHE_TTL_MS ? "fresh" : "stale",
          records: parsed, visibleRecords: filterVisibleRepositories(parsed),
        };
      } catch { return { state: "invalid", records: [], visibleRecords: [] }; }
    },
    write(records: readonly GitHubRepositoryRecord[], now: number): void {
      const valid = parseGitHubRepositories(records) ?? [];
      const payload: GitHubCachePayload = { version: 1, savedAt: now, records: valid };
      memoryRaw = JSON.stringify(payload);
      preferMemory = true;
      try {
        storage?.setItem(CACHE_KEY, memoryRaw);
        if (storage) preferMemory = false;
      } catch { /* use memory */ }
    },
    clear(): void {
      memoryRaw = null;
      preferMemory = true;
      try {
        storage?.removeItem?.(CACHE_KEY);
        if (storage?.removeItem) preferMemory = false;
      } catch { /* use memory */ }
    },
  };
}

export function classifyHttpFailure(
  status: number, headers: { get(name: string): string | null }, now: number,
): GitHubFailure {
  if (status === 403 || status === 429) {
    const retryAfter = headers.get("Retry-After")?.trim();
    const seconds = retryAfter && /^\d+(?:\.\d+)?$/.test(retryAfter) ? Number(retryAfter) : NaN;
    const date = retryAfter && !Number.isFinite(seconds) ? Date.parse(retryAfter) : NaN;
    const reset = headers.get("X-RateLimit-Reset")?.trim();
    const resetSeconds = reset && /^\d+$/.test(reset) ? Number(reset) : NaN;
    const retryAt = Number.isFinite(seconds) ? now + seconds * 1000 :
      Number.isFinite(date) ? date : Number.isFinite(resetSeconds) ? resetSeconds * 1000 :
        now + DEFAULT_RATE_LIMIT_BACKOFF_MS;
    return { kind: "rate-limited", status, retryAt: Math.max(now, retryAt) };
  }
  return { kind: status >= 500 ? "retryable" : "terminal", status };
}

export function nextRetryDelayMs(attempt: number): number | null {
  return BACKOFF_DELAYS_MS[attempt - 1] ?? null;
}

export function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

export function shouldRevalidate(cacheState: CacheState): boolean {
  return cacheState !== "fresh";
}

export function shouldRevalidateOnVisibility(visibility: string, cacheState: CacheState): boolean {
  return visibility === "visible" && shouldRevalidate(cacheState);
}
