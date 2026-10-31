export type GitHubRepositoryRecord = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  topics: string[];
  language: string | null;
  html_url: string;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  visibility: "public";
};

export type GitHubCachePayload = {
  version: 1;
  savedAt: number;
  records: GitHubRepositoryRecord[];
};

export type CacheState = "fresh" | "stale" | "missing" | "invalid";

export type CacheReadResult = {
  state: CacheState;
  /** All schema-valid records, before the course filter. */
  records: GitHubRepositoryRecord[];
  /** The same records after structural and course/exercise filtering. */
  visibleRecords: GitHubRepositoryRecord[];
};

export type ProjectImage = {
  img: string;
  alt: string;
  width: number;
  height: number;
};

export type ProjectPresentationOverride = {
  title?: string;
  description?: string;
  technologies?: string[];
  image: ProjectImage;
};

export type ProjectPresentationMap = ReadonlyMap<string, ProjectPresentationOverride>;

export type GitHubFailureKind = "rate-limited" | "retryable" | "terminal" | "aborted";

export type GitHubFailure = {
  kind: GitHubFailureKind;
  retryAt?: number;
  status?: number;
};

export type CacheStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

export type CacheStore = {
  read(now: number): CacheReadResult;
  write(records: readonly GitHubRepositoryRecord[], now: number): void;
  clear(): void;
};
