import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { build } from "esbuild";
import {
  CACHE_KEY, CACHE_TTL_MS, CACHE_VERSION,
  DEFAULT_RATE_LIMIT_BACKOFF_MS, GITHUB_REPOS_ENDPOINT, MAX_PAGES, MAX_VISIBLE_PROJECTS,
} from "../src/data/githubProjectsConfig.ts";
import {
  buildProjectCards, canFetchNextPage, classifyHttpFailure, createCacheStore,
  dedupeRepositories, filterVisibleRepositories, isAbortError, isExcludedRepository,
  getRepositorySlugFromLink, mapRepositoryToCard, nextRetryDelayMs, parseGitHubRepositories, parseNextLink,
  shouldRevalidate, shouldRevalidateOnVisibility, selectVisibleRepositories,
} from "../src/data/githubProjectsCore.ts";
import type { CacheStorage, GitHubRepositoryRecord, ProjectCategory, ProjectImage } from "../src/data/githubTypes.ts";

const now = Date.parse("2026-01-01T00:00:00Z");
const image = { img: "local-fixture", alt: "Local image", width: 250, height: 250 };
const images: Record<ProjectCategory, ProjectImage> = { games: image, fullstack: image, api: image, frontend: image, misc: image };
let id = 1;
function record(name: string, changes: Partial<GitHubRepositoryRecord> = {}): GitHubRepositoryRecord {
  return {
    id: id++, name, full_name: `Xounder/${name}`, default_branch: "main", description: null, topics: ["project"],
    language: null, html_url: `https://github.com/Xounder/${name}`,
    pushed_at: "2025-12-01T00:00:00Z", fork: false, archived: false,
    visibility: "public", ...changes,
  };
}
function source(path: string): string {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}
let suites = 0;
async function suite(name: string, run: () => void | Promise<void>): Promise<void> {
  try { await run(); suites++; console.log(`PASS ${name}`); }
  catch (error) { console.error(`FAIL ${name}`); throw error; }
}

await suite("mapping and normalization", () => {
  const known = record("Bokumon", { description: "Original", topics: ["react"] });
  const card = mapRepositoryToCard(known, images);
  assert.equal(card.cardInfo.title, "Bokumon");
  assert.equal(card.cardInfo.description, "Original");
  assert.deepEqual(card.projectInfo.technologies, ["react"]);
  assert.deepEqual(card.cardInfo.image, { ...image, fallbackImg: image.img });
  assert.equal(card.cardInfo.link, known.html_url);
  const unknown = record("lvgl-feed-dispenser", { topics: ["C", "c", "LVGL"], language: "C" });
  const mapped = mapRepositoryToCard(unknown, images);
  assert.equal(mapped.cardInfo.title, "Lvgl feed dispenser");
  assert.equal(mapped.cardInfo.description, "Public GitHub project.");
  assert.deepEqual(mapped.projectInfo.technologies, ["C", "LVGL"]);
  assert.deepEqual(mapped.cardInfo.image, { ...image, fallbackImg: image.img });
  const invalid = { ...known, html_url: "https://example.com/Xounder/Bokumon" };
  assert.deepEqual(parseGitHubRepositories([invalid, known]), [known]);
  for (const payload of [null, {}, [invalid], [null]]) assert.equal(parseGitHubRepositories(payload), null);
  assert.deepEqual(parseGitHubRepositories([]), []);
  const normalized = parseGitHubRepositories([{ ...unknown, topics: undefined, description: undefined, language: undefined }]);
  assert.deepEqual(normalized?.[0]?.topics, []);
  assert.equal(normalized?.[0]?.description, null);
  assert.equal(normalized?.[0]?.language, null);
});

await suite("repository identity and cache identity", () => {
  const canonical = record("Bokumon");
  const variants = [canonical,
    { ...canonical, name: "BOKUMON", full_name: "xOuNdEr/bOkUmOn", html_url: "https://github.com/XOUNDER/Bokumon/" },
    { ...canonical, html_url: "https://github.com/Xounder/Bokumon.git" }];
  for (const value of variants) {
    assert.equal(parseGitHubRepositories([value])?.length, 1, value.html_url);
    assert.equal(createCacheRead(value).state, "fresh", value.html_url);
  }
  assert.equal(getRepositorySlugFromLink("https://github.com/Xounder/Bokumon.git"), "bokumon");
  const invalid = [
    { full_name: "another/Bokumon" }, { name: "Other" }, { full_name: "Xounder/Other" },
    { html_url: "https://github.com/another/Bokumon" },
    { html_url: "https://github.com/Xounder/Other" },
    { html_url: "https://github.com/Xounder/Bokumon?tab=readme" },
    { html_url: "https://github.com/Xounder/Bokumon#readme" },
    { html_url: "https://user@github.com/Xounder/Bokumon" },
    { html_url: "https://github.com:443/Xounder/Bokumon" },
    { html_url: "https://github.com/Xounder/%42okumon" },
    { html_url: "https://github.com/Xounder/Bokumon%2Fother" },
    { html_url: "https://github.com/Xounder/Bokumon/extra" },
    { html_url: "https://github.com/Xounder/Bokumon.git/extra" },
  ];
  for (const change of invalid) {
    const value = { ...canonical, ...change };
    assert.equal(parseGitHubRepositories([value]), null, JSON.stringify(change));
    assert.equal(createCacheRead(value).state, "invalid", JSON.stringify(change));
  }
});

function createCacheRead(value: unknown) {
  const raw = JSON.stringify({ version: CACHE_VERSION, savedAt: now, records: [value] });
  return createCacheStore({ getItem: () => raw, setItem: () => {} }).read(now);
}

await suite("course inclusion and topic eligibility", () => {
  const names = [
    "react-native-dio", "node-dio", "linux-dio", "dotnet-dio", "microsoft-azure-essentials-dio",
    "dio-live-function", "dio-lab-open-source", "trilha-java-basico", "trilha-net-azure-desafio",
    "trilha-net-banco-de-dados-desafio", "padroes-projeto-spring", "api-rest-spring",
    "lab-quarkus", "minimal-api", "dotnet-api", "angular-blog", "angular-buzzfeed",
    "angular-store", "shoesecommerce", "first-site", "login-page", "lista-pilha-fila",
    "docker-compose", "docker-microsservice",
  ];
  assert.equal(names.length, 24);
  for (const name of names) assert.equal(isExcludedRepository(record(name)), false, name);
  for (const name of ["dio-example", "trilha-example", "example-dio"]) assert.equal(isExcludedRepository(record(name)), false, name);
  for (const name of ["radio", "studio", "dio", "Bokumon", "TowerDefense", "Yu-Gi-Oh-Cards3D",
    "Games-in-C", "Simulation---1", "Simulation---2", "SCOH---Java"]) {
    assert.equal(isExcludedRepository(record(name)), false, name);
  }
  for (const topic of ["dio", "digital-innovation-one", "dio-bootcamp", "dio-lab"]) {
    assert.equal(isExcludedRepository(record("original", { topics: [topic.toUpperCase()] })), false, topic);
  }
  for (const description of ["Made for DIO", "Digital Innovation One assignment"]) {
    assert.equal(isExcludedRepository(record("original", { description })), false, description);
  }
  for (const word of ["curso", "course", "exercise", "exercicio", "aula", "lab", "desafio", "bootcamp"]) {
    assert.equal(isExcludedRepository(record(word, { description: word, topics: [word] })), false, word);
  }
  assert.deepEqual(filterVisibleRepositories([record("untagged", { topics: [] }), record("Bokumon")]).map(r => r.name), ["Bokumon"]);
  assert.equal(isExcludedRepository(record("api-rest-spring", { topics: [" "] })), true);
  for (const topic of ["aBoUt-Me", "ABOUTME-GITHUB"]) {
    assert.equal(isExcludedRepository(record("dio-lab", { topics: ["api", ` ${topic} `] })), true, topic);
  }
  for (const name of ["portfolio", "Xounder"]) assert.equal(isExcludedRepository(record(name)), true, name);
  for (const changes of [{ fork: true }, { archived: true }, { visibility: "private" }]) {
    assert.equal(isExcludedRepository({ ...record("independent"), ...changes } as GitHubRepositoryRecord), true);
  }
});

await suite("cache codec, TTL, raw boundary and storage failures", () => {
  const visible = record("Bokumon"), course = record("api-rest-spring");
  const store = createCacheStore(null);
  assert.equal(store.read(now).state, "missing");
  store.write([visible, course], now);
  assert.equal(store.read(now + CACHE_TTL_MS - 1).state, "fresh");
  assert.equal(store.read(now + CACHE_TTL_MS).state, "stale");
  assert.equal(store.read(now + CACHE_TTL_MS + 1).state, "stale");
  assert.equal(store.read(now - 1).state, "stale");
  assert.deepEqual(store.read(now).records.map(r => r.name), ["Bokumon", "api-rest-spring"]);
  assert.deepEqual(store.read(now).visibleRecords.map(r => r.name), ["Bokumon", "api-rest-spring"]);
  store.clear();
  assert.equal(store.read(now).state, "missing");
  let raw: string | null = null;
  const storage: CacheStorage = { getItem: key => { assert.equal(key, CACHE_KEY); return raw; },
    setItem: (key, value) => { assert.equal(key, CACHE_KEY); raw = value; },
    removeItem: () => { raw = null; } };
  const persisted = createCacheStore(storage);
  persisted.write([visible, course], now);
  assert.ok(raw);
  assert.deepEqual(JSON.parse(raw).records.map((r: GitHubRepositoryRecord) => r.name), ["Bokumon", "api-rest-spring"]);
  assert.doesNotMatch(raw, /ProjectCardData|\/assets\/|\.webp/);
  // The same fresh raw v2 snapshot, without a write or TTL/key bump, now exposes course records.
  raw = JSON.stringify({ version: CACHE_VERSION, savedAt: now, records: [course,
    record("blank-course", { topics: [" "] }), record("profile-course", { topics: ["DIO", "ABOUTME-GITHUB"] })] });
  const cachedRaw = raw;
  const reloaded = createCacheStore(storage).read(now);
  assert.equal(reloaded.state, "fresh");
  assert.deepEqual(reloaded.records.map(r => r.name), ["api-rest-spring", "blank-course", "profile-course"]);
  assert.deepEqual(reloaded.visibleRecords.map(r => r.name), ["api-rest-spring"]);
  assert.equal(raw, cachedRaw);
  for (const [value, expected] of [
    ["{broken", "invalid"],
    [JSON.stringify({ version: CACHE_VERSION + 1, savedAt: now, records: [visible] }), "invalid"],
    [JSON.stringify({ version: CACHE_VERSION, records: [visible] }), "invalid"],
    [JSON.stringify({ version: CACHE_VERSION, savedAt: now, records: {} }), "invalid"],
    [JSON.stringify({ version: CACHE_VERSION, savedAt: now, records: [] }), "fresh"],
    [JSON.stringify({ version: CACHE_VERSION, savedAt: now, records: [null] }), "invalid"],
  ] as const) {
    raw = value;
    assert.equal(persisted.read(now).state, expected);
  }
  const throwing = createCacheStore({ getItem: () => { throw Error("private"); },
    setItem: () => { throw Error("quota"); }, removeItem: () => { throw Error("private"); } });
  assert.doesNotThrow(() => throwing.write([visible], now));
  assert.deepEqual(throwing.read(now).records.map(r => r.name), ["Bokumon"]);
  throwing.clear();
  assert.equal(throwing.read(now).state, "missing");
});

await suite("pagination, dedupe, ordering and twelve-card cap", () => {
  const page = `${GITHUB_REPOS_ENDPOINT}&page=2`;
  assert.equal(parseNextLink(`<${GITHUB_REPOS_ENDPOINT}&page=3>; rel="last", <${page}>; rel="next"`), page);
  for (const header of [null, "", "not a link", `<${page}>; rel="last"`, "<bad>; rel=next"]) {
    assert.equal(parseNextLink(header), null);
  }
  assert.equal(canFetchNextPage(0), true);
  assert.equal(canFetchNextPage(2), true);
  assert.equal(canFetchNextPage(MAX_PAGES), false);
  const first = record("first");
  assert.deepEqual(dedupeRepositories([first, record("second", { id: first.id }),
    record("third", { full_name: "xounder/FIRST" }), record("fourth")]).map(r => r.name), ["first", "fourth"]);
  const a = record("alpha", { pushed_at: "2025-12-20T00:00:00Z" });
  const b = record("beta", { pushed_at: a.pushed_at });
  const older = record("older", { pushed_at: "2025-11-01T00:00:00Z" });
  const cards = buildProjectCards([older, b, a, record("Bokumon"), record("api-rest-spring")], images, MAX_VISIBLE_PROJECTS);
  assert.deepEqual(cards.map(c => c.cardInfo.title), ["Alpha", "Beta", "Api rest spring", "Bokumon", "Older"]);
  assert.deepEqual(buildProjectCards([a, record("api-rest-spring")], images,
    MAX_VISIBLE_PROJECTS).map(c => c.cardInfo.title), ["Alpha", "Api rest spring"]);
  assert.deepEqual(buildProjectCards([], images, MAX_VISIBLE_PROJECTS), []);
  const many = Array.from({ length: 20 }, (_, index) => record(`extra-${index}`));
  assert.equal(buildProjectCards(many, images, MAX_VISIBLE_PROJECTS).length, 12);
  assert.equal(selectVisibleRepositories(many, 12).length, 12);
});

await suite("HTTP failures, retry and visibility decisions", () => {
  const headers = (values: Record<string, string>) => ({ get: (name: string) => values[name] ?? null });
  assert.deepEqual(classifyHttpFailure(403, headers({ "Retry-After": "120" }), now),
    { kind: "rate-limited", status: 403, retryAt: now + 120_000 });
  assert.deepEqual(classifyHttpFailure(429, headers({ "X-RateLimit-Reset": String((now + 180_000) / 1000) }), now),
    { kind: "rate-limited", status: 429, retryAt: now + 180_000 });
  assert.equal(classifyHttpFailure(403, headers({ "Retry-After": "invalid" }), now).retryAt,
    now + DEFAULT_RATE_LIMIT_BACKOFF_MS);
  assert.equal(classifyHttpFailure(403, headers({ "Retry-After": new Date(now + 90_000).toUTCString() }), now).retryAt,
    now + 90_000);
  assert.equal(classifyHttpFailure(500, headers({}), now).kind, "retryable");
  for (const status of [400, 404]) assert.equal(classifyHttpFailure(status, headers({}), now).kind, "terminal");
  assert.deepEqual([1, 2, 3].map(nextRetryDelayMs), [500, 1500, null]);
  assert.equal(isAbortError({ name: "AbortError" }), true);
  assert.equal(isAbortError(new Error("ordinary")), false);
  for (const state of ["fresh", "stale", "missing", "invalid"] as const) {
    assert.equal(shouldRevalidate(state), state !== "fresh", state);
    assert.equal(shouldRevalidateOnVisibility("visible", state), state !== "fresh", state);
    assert.equal(shouldRevalidateOnVisibility("hidden", state), false, state);
  }
});

await suite("production wiring and source boundaries", () => {
  const home = source("src/pages/HomePage/HomePage.tsx");
  const scroll = source("src/pages/HomePageScroll/HomePageScroll.tsx");
  for (const [route, level] of [[home, "h2"], [scroll, "h3"]]) {
    assert.match(route, /ProjectsCardGroup/);
    assert.match(route, new RegExp(`<ProjectsCardGroup\\s+headingLevel="${level}"`));
    assert.doesNotMatch(route, /cardType="Projects"/);
  }
  const config = source("src/data/githubProjectsConfig.ts");
  assert.equal(GITHUB_REPOS_ENDPOINT,
    "https://api.github.com/users/Xounder/repos?type=owner&sort=pushed&direction=desc&per_page=100");
  assert.match(config, /per_page=100/);
  assert.equal(MAX_VISIBLE_PROJECTS, 12);
  assert.equal(MAX_PAGES, 3);
  const service = source("src/data/githubProjects.ts");
  const core = source("src/data/githubProjectsCore.ts");
  assert.match(service, /import\s*\{[^}]*classifyHttpFailure[^}]*\}\s*from\s*["']\.\/githubProjectsCore\.ts["']/s);
  assert.match(service, /classifyHttpFailure\(response\.status,\s*response\.headers,\s*now\)/);
  assert.match(core, /headers\.get\("Retry-After"\)/);
  assert.match(core, /headers\.get\("X-RateLimit-Reset"\)/);
  assert.match(service, /MAX_VISIBLE_PROJECTS/);
  assert.match(service, /fetch\(url,\s*\{\s*headers:/);
  assert.match(service, /GITHUB_REPOS_ENDPOINT/);
  assert.match(service, /if\s*\(!page\)\s*return fallback/);
  assert.match(service, /getStore\(\)\.write\(complete, now\)/);
  assert.match(service, /dedupeRepositories\(records\)/);
  assert.match(service, /return fallback\(now,\s*\{ kind: "terminal" \}\)/);
  assert.match(service, /cached\.visibleRecords\.length/);
  assert.doesNotMatch(service, /Authorization|VITE_|setInterval|\/assets\//);
  const presentation = source("src/data/projectPresentation.ts");
  for (const token of ["projectCategoryImages", "api-logo.webp"]) assert.ok(presentation.includes(token), token);
  assert.doesNotMatch(presentation, /https?:\/\/[^\s"']*(?:social-preview|avatar|screenshot|images\.)/i);
  const group = source("src/components/DefaultCardGroup/DefaultCardGroup.tsx");
  assert.match(group, /cards\?:\s*readonly CardData\[\]/);
  assert.doesNotMatch(group, /\[index\]/);
  assert.match(group, /selectedData\.renderInfo\(card\)/);
  const component = source("src/components/ProjectsCardGroup/ProjectsCardGroup.tsx");
  assert.match(component, /useGitHubProjects\(\)/);
  assert.match(component, /<DefaultCardGroup\s+cardType="Projects"\s+cards=\{cards\}/);
  function scan(directory: URL): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
      if (entry.isDirectory()) scan(child);
      else if (/\.(?:ts|tsx|js|jsx)$/.test(entry.name)) assert.doesNotMatch(readFileSync(child, "utf8"),
        /alwaysIncludeRepos/, child.href);
    }
  }
  scan(new URL("../src/", import.meta.url));
  const scripts = (JSON.parse(source("package.json")) as { scripts: Record<string, string> }).scripts;
  assert.equal(scripts.test, undefined);
  assert.ok(!Object.keys(scripts).some(key => /verif.*github|test/i.test(key)));
  for (const path of ["tsconfig.app.json", "tsconfig.node.json"]) {
    assert.doesNotMatch(source(path), /scripts\//, path);
  }
});

// Bundle the real browser-facing service once into an in-memory ESM module. Its
// asset imports become local data URLs; unique fragments isolate module state.
// No service logic is reimplemented, and no bundle is written to disk.
const bundle = await build({ entryPoints: ["src/data/githubProjects.ts"],
  bundle: true, write: false, platform: "node", format: "esm", loader: { ".webp": "dataurl", ".svg": "dataurl" },
  logLevel: "silent" });
const serviceUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(bundle.outputFiles[0].text)}`;
type Service = typeof import("../src/data/githubProjects.ts");
type FetchHandler = (url: string, headers: Headers) => Promise<Response> | Response;
let instance = 0;
async function serviceCase(handler: FetchHandler, run: (context: {
   service: Service; calls: { url: string; headers: Headers }[];
   coverCalls: { url: string; headers: Headers }[];
  read: () => { version: number; savedAt: number; records: GitHubRepositoryRecord[] } | null;
  coverRead: () => Record<string, { filename: string | null; savedAt: number }> | null;
  replace: (records: GitHubRepositoryRecord[], savedAt: number, version?: number) => void;
  writes: () => number;
}) => Promise<void>, coverHandler: FetchHandler = () => new Response(null, { status: 404 })): Promise<void> {
  const previousFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  let raw: string | null = null;
  let coverRaw: string | null = null;
  let writeCount = 0;
  const calls: { url: string; headers: Headers }[] = [];
  const coverCalls: { url: string; headers: Headers }[] = [];
  const storage: CacheStorage = {
    getItem: key => key === CACHE_KEY ? raw : coverRaw,
    setItem: (key, value) => { if (key === CACHE_KEY) { raw = value; writeCount++; } else coverRaw = value; },
    removeItem: key => { if (key === CACHE_KEY) raw = null; else coverRaw = null; },
  };
  try {
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: storage } });
    Object.defineProperty(globalThis, "fetch", { configurable: true, value: async (input: string, init: RequestInit) => {
       const headers = new Headers(init.headers);
       if (String(input).includes("/contents/.project-cover?")) {
         coverCalls.push({ url: String(input), headers });
         return coverHandler(String(input), headers);
       }
       calls.push({ url: String(input), headers });
      return handler(String(input), headers);
    } });
    const service = await import(`${serviceUrl}#case-${++instance}`) as Service;
    await run({ service, calls, coverCalls,
      read: () => raw === null ? null : JSON.parse(raw) as { version: number; savedAt: number; records: GitHubRepositoryRecord[] },
      coverRead: () => coverRaw === null ? null : JSON.parse(coverRaw) as Record<string, { filename: string | null; savedAt: number }>,
      replace: (records, savedAt, version = CACHE_VERSION) => { raw = JSON.stringify({ version, savedAt, records }); },
      writes: () => writeCount });
  } finally {
    if (previousFetch) Object.defineProperty(globalThis, "fetch", previousFetch);
    else Reflect.deleteProperty(globalThis, "fetch");
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
}
function response(records: GitHubRepositoryRecord[], headers: Record<string, string> = {}, status = 200): Response {
  return new Response(JSON.stringify(records), { status, headers });
}
function nextLink(target: string): Record<string, string> { return { Link: `<${target}>; rel="next"` }; }
const page2 = `${GITHUB_REPOS_ENDPOINT}&page=2`;
const page3 = `${GITHUB_REPOS_ENDPOINT}&page=3`;

await suite("service advertised-next rejection without partial cache or cards", async () => {
  const invalidLinks = [
    `<${page2}; rel="next"`, // advertised but unparseable
    `<${page2.replace("https:", "http:")}>; rel="next"`,
    `<https://evil.example/users/Xounder/repos?page=2>; rel="next"`,
    `<https://api.github.com/users/Other/repos?type=owner&sort=pushed&direction=desc&per_page=100&page=2>; rel="next"`,
    `<https://api.github.com/users/Xounder/other?type=owner&sort=pushed&direction=desc&per_page=100&page=2>; rel="next"`,
    `<${page2}&unexpected=true>; rel="next"`, `<${GITHUB_REPOS_ENDPOINT}&page=3>; rel="next"`,
    `<${GITHUB_REPOS_ENDPOINT}&page=2&page=2>; rel="next"`,
  ];
  for (const link of invalidLinks) {
    await serviceCase(() => response([record("partial-only")], { Link: link }), async ({ service, calls, read, writes }) => {
      const result = await service.refreshProjects(now);
      assert.equal(result.ok, false, link);
   assert.equal(result.source, "empty", link);
      assert.equal(result.failure.kind, "terminal", link);
      assert.ok(result.cards.every(card => card.cardInfo.title !== "Partial only"), link);
      assert.equal(calls.length, 1, link);
      assert.equal(read(), null, link);
      assert.equal(writes(), 0, link);
    });
  }
});

await suite("service absent-next, valid pages, three-page cap and page-two failure", async () => {
  await serviceCase(() => response([record("single")]), async ({ service, calls, read, writes }) => {
    const result = await service.refreshProjects(now);
    assert.equal(result.ok, true);
    assert.equal(result.source, "network");
    assert.ok(result.cards.some(card => card.cardInfo.title === "Single"));
    assert.equal(calls.length, 1);
    assert.deepEqual(read()?.records.map(r => r.name), ["single"]);
    assert.equal(writes(), 1);
  });
  await serviceCase(url => {
    if (url === GITHUB_REPOS_ENDPOINT) return response([record("one")], nextLink(page2));
    if (url === page2) return response([record("two")], nextLink(page3));
    assert.equal(url, page3);
    return response([record("three")], nextLink(`${GITHUB_REPOS_ENDPOINT}&page=4`));
  }, async ({ service, calls, read, writes }) => {
    const result = await service.refreshProjects(now);
    assert.equal(result.ok, true);
    assert.equal(result.source, "network");
    assert.deepEqual(read()?.records.map(r => r.name), ["one", "two", "three"]);
    assert.equal(calls.length, 3);
    assert.equal(writes(), 1);
  });
  await serviceCase(url => url === page2 ? new Response(null, { status: 404 }) :
    response([record("partial-only")], nextLink(page2)), async ({ service, calls, read, writes }) => {
    const result = await service.refreshProjects(now);
    assert.equal(result.ok, false);
    assert.equal(result.source, "empty");
    assert.equal(result.failure.status, 404);
    assert.ok(result.cards.every(card => card.cardInfo.title !== "Partial only"));
    assert.equal(calls.length, 2);
    assert.equal(read(), null);
    assert.equal(writes(), 0);
  });
});

await suite("service in-flight refresh shares the same promise", async () => {
  let release: ((value: Response) => void) | undefined;
  await serviceCase(() => new Promise<Response>(resolve => { release = resolve; }),
    async ({ service, calls, writes }) => {
      const first = service.refreshProjects(now);
      const second = service.refreshProjects(now + 1);
      assert.strictEqual(first, second);
      assert.equal(calls.length, 1);
      assert.ok(release);
      release(response([record("shared") ]));
      assert.equal((await first).ok, true);
      assert.equal(writes(), 1);
    });
});

await suite("service ETag 304 validates its own snapshot", async () => {
  let step = 0;
  await serviceCase((_url, headers) => {
    step++;
    if (step === 1) { assert.equal(headers.get("If-None-Match"), null); return response([record("original")], { ETag: '"v1"' }); }
    assert.equal(headers.get("If-None-Match"), '"v1"');
    return new Response(null, { status: 304 });
  }, async ({ service, read, writes }) => {
    assert.equal((await service.refreshProjects(now)).source, "network");
    const result = await service.refreshProjects(now + 5_000);
    assert.equal(result.ok, true);
    assert.equal(result.source, "cache");
    assert.equal(read()?.savedAt, now + 5_000);
    assert.deepEqual(read()?.records.map(r => r.name), ["original"]);
    assert.equal(writes(), 2);
  });
});

await suite("service ETag is omitted when cache changes before request", async () => {
  let step = 0;
  await serviceCase((_url, headers) => {
    step++;
    if (step === 1) return response([record("original")], { ETag: '"v1"' });
    assert.equal(headers.get("If-None-Match"), null);
    return response([record("replacement-network")]);
  }, async ({ service, replace, read, writes }) => {
    await service.refreshProjects(now);
    replace([record("changed-by-other-tab")], now + 1);
    const result = await service.refreshProjects(now + 5_000);
    assert.equal(result.ok, true);
    assert.equal(result.source, "network");
    assert.deepEqual(read()?.records.map(r => r.name), ["replacement-network"]);
    assert.equal(writes(), 2);
  });
});

await suite("service pending 304 cannot freshen a replaced snapshot", async () => {
  let step = 0;
  let release: ((value: Response) => void) | undefined;
  await serviceCase((_url, headers) => {
    step++;
    if (step === 1) return response([record("original")], { ETag: '"v1"' });
    assert.equal(headers.get("If-None-Match"), '"v1"');
    return new Promise<Response>(resolve => { release = resolve; });
  }, async ({ service, replace, read, writes }) => {
    await service.refreshProjects(now);
    const pending = service.refreshProjects(now + 5_000);
    assert.ok(release);
    replace([record("changed-while-pending")], now + 1);
    release(new Response(null, { status: 304 }));
    const result = await pending;
    assert.equal(result.ok, false);
    assert.equal(result.failure.status, 304);
    assert.equal(result.source, "cache");
    assert.equal(read()?.savedAt, now + 1);
    assert.deepEqual(read()?.records.map(r => r.name), ["changed-while-pending"]);
    assert.equal(writes(), 1);
  });
});

await suite("service multi-page snapshots never reuse a page-one ETag", async () => {
  let step = 0;
  await serviceCase((url, headers) => {
    step++;
    assert.equal(headers.get("If-None-Match"), null);
    if (url === GITHUB_REPOS_ENDPOINT && step === 1) return response([record("one")],
      { ...nextLink(page2), ETag: '"page-one"' });
    if (url === page2) return response([record("two")]);
    assert.equal(url, GITHUB_REPOS_ENDPOINT);
    return response([record("next-refresh")]);
  }, async ({ service, calls, read }) => {
    assert.equal((await service.refreshProjects(now)).ok, true);
    assert.equal((await service.refreshProjects(now + 5_000)).ok, true);
    assert.equal(calls.length, 3);
    assert.deepEqual(read()?.records.map(r => r.name), ["next-refresh"]);
  });
});

const sha = "a".repeat(40);
function coverFile(repo: GitHubRepositoryRecord, filename: string, changes: Record<string, unknown> = {}) {
  return { type: "file", name: filename, path: `.project-cover/${filename}`, sha,
    download_url: `https://raw.githubusercontent.com/Xounder/${repo.name}/${repo.default_branch}/.project-cover/${filename}`, ...changes };
}

await suite("service selects twelve after complete pages, with bounded cover concurrency", async () => {
  const eligible = Array.from({ length: 20 }, (_, i) => record(`repo-${i}`));
  let active = 0, peak = 0;
  await serviceCase(url => url === GITHUB_REPOS_ENDPOINT ? response([
    record("no-topics", { topics: [] }), ...eligible.slice(0, 10)], nextLink(page2)) :
    response(eligible.slice(10)), async ({ service, calls, coverCalls, read }) => {
    const result = await service.refreshProjects(now);
    assert.equal(result.ok, true);
    assert.equal(result.cards.length, 12);
    assert.equal(calls.length, 2);
    assert.equal(coverCalls.length, 12);
    assert.equal(read()?.records.length, 21);
    assert.ok(peak <= 3 && peak >= 1);
  }, async () => {
    active++; peak = Math.max(peak, active);
    await Promise.resolve();
    active--;
    return new Response(null, { status: 404 });
  });
});

await suite("service includes course cards and covers from fresh v2 cache and new pages", async () => {
  const course = record("api-rest-spring", { topics: [" DIO ", "api"],
    description: "Digital Innovation One exercise", pushed_at: "2025-12-20T00:00:00Z" });
  const lab = record("dio-lab", { topics: ["dio-lab"], pushed_at: "2025-12-19T00:00:00Z" });
  const hidden = record("profile-course", { topics: ["DIO", " AbOuT-Me "] });
  const blank = record("untagged-course", { topics: [" "] });
  const fork = record("fork-course", { topics: ["DIO"], fork: true });
  const others = Array.from({ length: 13 }, (_, index) => record(`other-${index}`));
  await serviceCase(() => { throw Error("fresh cache must not fetch catalog"); },
    async ({ service, replace, calls, coverCalls, writes }) => {
      replace([course, hidden, blank, fork], now);
      const initial = service.readInitialProjects(now);
      assert.equal(initial.cacheState, "fresh");
      assert.deepEqual(initial.cards.map(card => card.cardInfo.title), ["Api rest spring"]);
      assert.deepEqual(initial.cards[0].projectInfo.technologies, ["DIO", "api"]);
      assert.ok(initial.cards[0].cardInfo.image.img.startsWith("data:"));
      const hydrated = await service.hydrateCachedProjects(now);
      assert.match(hydrated[0].cardInfo.image.img, /api-rest-spring\/main\/\.project-cover\/cover\.png$/);
      assert.equal(coverCalls.length, 1);
      assert.equal(calls.length, 0);
      assert.equal(writes(), 0);
    }, () => response([coverFile(course, "cover.png")]));
  await serviceCase(url => url === GITHUB_REPOS_ENDPOINT ? response([blank, hidden, fork, ...others.slice(0, 8)], nextLink(page2)) :
    response([course, lab, ...others.slice(8)]),
  async ({ service, calls, coverCalls, read }) => {
    const result = await service.refreshProjects(now);
    assert.equal(result.ok, true);
    assert.deepEqual(result.cards.map(card => card.cardInfo.title).slice(0, 2), ["Api rest spring", "Dio lab"]);
    assert.equal(result.cards.length, 12);
    assert.deepEqual(result.cards[0].projectInfo.technologies, ["DIO", "api"]);
    assert.deepEqual(result.cards[1].projectInfo.technologies, ["dio-lab"]);
    assert.match(result.cards[0].cardInfo.image.img, /api-rest-spring\/main\/\.project-cover\/cover\.png$/);
    assert.match(result.cards[1].cardInfo.image.img, /dio-lab\/main\/\.project-cover\/cover\.png$/);
    assert.equal(calls.length, 2);
    assert.equal(coverCalls.length, 12);
    assert.equal(read()?.records.length, 18);
    assert.ok(!result.cards.some(card => ["Profile course", "Untagged course", "Fork course"].includes(card.cardInfo.title)));
  }, url => {
    const match = /\/repos\/Xounder\/(api-rest-spring|dio-lab)\/contents\//.exec(url);
    const selected = match?.[1] === "api-rest-spring" ? course : lab;
    return match ? response([coverFile(selected, "cover.png")]) : new Response(null, { status: 404 });
  });
});

await suite("service cover ordering, unsafe metadata, local fallback and positive TTL", async () => {
  const repo = record("poster", { default_branch: "feature/art" });
  let coverRequests = 0;
  await serviceCase(() => response([repo]), async ({ service, coverCalls, coverRead }) => {
    const first = await service.refreshProjects(now);
    assert.equal(first.cards[0].cardInfo.image.img,
      "https://raw.githubusercontent.com/Xounder/poster/feature/art/.project-cover/COVER.JpG");
    assert.ok(first.cards[0].cardInfo.image.fallbackImg?.startsWith("data:"));
    assert.equal(coverCalls.length, 1);
    assert.equal(coverCalls[0].url, "https://api.github.com/repos/Xounder/poster/contents/.project-cover?ref=feature%2Fart");
    assert.equal(Object.values(coverRead() ?? {})[0]?.filename, "COVER.JpG");
    assert.equal(service.readInitialProjects(now + 1).cards[0].cardInfo.image.img, first.cards[0].cardInfo.image.img);
    await service.hydrateCachedProjects(now + 1);
    assert.equal(coverCalls.length, 1);
    await service.hydrateCachedProjects(now + CACHE_TTL_MS);
    assert.equal(coverCalls.length, 1); // stale repository cache never hydrates
    assert.equal(coverRequests, 1);
  }, () => {
    coverRequests++;
    return new Response(JSON.stringify([
      coverFile(repo, "nested.png", { path: ".project-cover/nested/nested.png" }),
      coverFile(repo, "cover.svg"),
      coverFile(repo, "cover.webp", { download_url: "https://evil.example/x" }),
      coverFile(repo, "z.png"), coverFile(repo, "COVER.JpG"), coverFile(repo, "a.avif"),
    ]));
  });
});

await suite("service proven absence TTL, transient failures, quota shared with catalog", async () => {
  const repo = record("absence");
  let status = 404;
  await serviceCase(() => response([repo]), async ({ service, coverCalls, coverRead, calls }) => {
    await service.refreshProjects(now);
    assert.equal(coverCalls.length, 1);
    assert.equal(Object.values(coverRead() ?? {})[0]?.filename, null);
    await service.hydrateCachedProjects(now + 1);
    assert.equal(coverCalls.length, 1);
    status = 500;
    await service.hydrateCachedProjects(now + CACHE_TTL_MS - 1);
    assert.equal(coverCalls.length, 1);
    status = 429;
    await service.refreshProjects(now + CACHE_TTL_MS);
    assert.equal(coverCalls.length, 2);
    const blocked = await service.refreshProjects(now + CACHE_TTL_MS + 1);
    assert.equal(blocked.ok, false);
    assert.equal(blocked.failure.kind, "rate-limited");
    assert.equal(calls.length, 2);
  }, () => new Response(null, { status, headers: { "Retry-After": "120" } }));
});

await suite("service fresh-only cover hydration shares in-flight work and isolates unsafe response", async () => {
  const repo = record("hydrated");
  let release: ((value: Response) => void) | undefined;
  let requests = 0;
  await serviceCase(() => { throw Error("hydration must not fetch catalog"); }, async ({ service, replace, coverCalls, calls }) => {
    replace([repo], now);
    assert.equal(service.readInitialProjects(now).cards.length, 1);
    const a = service.hydrateCachedProjects(now);
    const b = service.hydrateCachedProjects(now + 1);
    assert.strictEqual(a, b);
    assert.equal(coverCalls.length, 1);
    release!(new Response(JSON.stringify([coverFile(repo, "cover.png", { download_url:
      "https://raw.githubusercontent.com/Xounder/hydrated/main/.project-cover/cover.png?signature=bad" })])));
    const cards = await a;
    assert.ok(cards[0].cardInfo.image.img.startsWith("data:"));
    assert.equal(calls.length, 0);
    await service.hydrateCachedProjects(now + 1);
    assert.equal(coverCalls.length, 2); // malformed metadata must not negative-cache
    await service.hydrateCachedProjects(now + 2);
    assert.equal(coverCalls.length, 2); // subsequent valid empty directory is negative cached
  }, () => ++requests === 1 ? new Promise<Response>(resolve => { release = resolve; }) :
    new Response("[]"));
});

await suite("service cache version, empty page, stale fallback and cover-only boundary", async () => {
  const repo = record("cached");
  await serviceCase(() => new Response(null, { status: 404 }), async ({ service, replace, calls, coverCalls }) => {
    assert.deepEqual(service.readInitialProjects(now).cards, []);
    replace([repo], now, 1);
    assert.equal(service.readInitialProjects(now).cacheState, "invalid");
    assert.deepEqual(await service.hydrateCachedProjects(now), []);
    replace([repo], now - CACHE_TTL_MS);
    assert.equal(service.readInitialProjects(now).cacheState, "stale");
    assert.deepEqual(await service.hydrateCachedProjects(now), []);
    assert.equal(coverCalls.length, 0);
    const failed = await service.refreshProjects(now);
    assert.equal(failed.source, "cache");
    assert.equal(failed.cards.length, 1);
    assert.equal(calls.length, 1);
  });
  await serviceCase(() => response([]), async ({ service, read, coverCalls }) => {
    const result = await service.refreshProjects(now);
    assert.equal(result.ok, true);
    assert.deepEqual(result.cards, []);
    assert.deepEqual(read()?.records, []);
    assert.equal(coverCalls.length, 0);
  });
});

await suite("service transient covers are not negative-cached and new push invalidates old cover", async () => {
  const repo = record("moving");
  let attempts = 0;
  await serviceCase(() => response([repo]), async ({ service, replace, coverCalls }) => {
    const initial = await service.refreshProjects(now);
    assert.equal(initial.cards.length, 1);
    assert.ok(initial.cards[0].cardInfo.image.img.startsWith("data:"));
    const second = await service.hydrateCachedProjects(now + 1);
    assert.match(second[0].cardInfo.image.img, /cover\.png$/);
    assert.equal(coverCalls.length, 2);
    replace([{ ...repo, pushed_at: "2025-12-02T00:00:00Z" }], now + 2);
    assert.ok(service.readInitialProjects(now + 2).cards[0].cardInfo.image.img.startsWith("data:"));
    assert.equal((await service.hydrateCachedProjects(now + 2)).length, 1);
    assert.equal(coverCalls.length, 3);
  }, () => ++attempts === 1 ? new Response(null, { status: 500 }) :
    new Response(JSON.stringify([coverFile(repo, "cover.png")])));
});

await suite("service unavailable storage retains verified memory records and covers", async () => {
  const repo = record("memory-only");
  await serviceCase(() => response([repo]), async ({ service, calls, coverCalls }) => {
    Object.defineProperty(globalThis, "window", { configurable: true,
      value: { get localStorage() { throw Error("storage denied"); } } });
    const result = await service.refreshProjects(now);
    assert.equal(result.ok, true);
    assert.match(result.cards[0].cardInfo.image.img, /cover\.png$/);
    assert.equal(service.readInitialProjects(now + 1).cards.length, 1);
    await service.hydrateCachedProjects(now + 1);
    assert.equal(calls.length, 1);
    assert.equal(coverCalls.length, 1);
  }, () => new Response(JSON.stringify([coverFile(repo, "cover.png")])));
});

await suite("service old cover completion cannot decorate a replaced repository identity", async () => {
  const original = record("race");
  const updated = { ...original, pushed_at: "2025-12-03T00:00:00Z", default_branch: "feature/new" };
  let releaseOld: ((response: Response) => void) | undefined;
  let releaseNew: ((response: Response) => void) | undefined;
  await serviceCase(() => { throw Error("cover hydration must not fetch catalog"); },
    async ({ service, replace, coverCalls }) => {
      replace([original], now);
      const previous = service.hydrateCachedProjects(now);
      replace([updated], now + 1);
      assert.ok(service.readInitialProjects(now + 1).cards[0].cardInfo.image.img.startsWith("data:"));
      const current = service.hydrateCachedProjects(now + 1);
      assert.notStrictEqual(current, previous);
      assert.equal(coverCalls.length, 2); // new snapshot begins before old response is released
      assert.strictEqual(service.hydrateCachedProjects(now + 1), current);
      releaseOld!(new Response(JSON.stringify([coverFile(original, "cover.png")])));
      await previous;
      assert.strictEqual(service.hydrateCachedProjects(now + 1), current); // old cleanup cannot clear newer work
      assert.ok(service.readInitialProjects(now + 2).cards[0].cardInfo.image.img.startsWith("data:"));
      releaseNew!(new Response(JSON.stringify([coverFile(updated, "cover.webp")])));
      const currentCards = await current;
      assert.deepEqual(currentCards.map(card => card.cardInfo.title), ["Race"]);
      assert.match(currentCards[0].cardInfo.image.img, /feature\/new\/\.project-cover\/cover\.webp$/);
      assert.equal(coverCalls.length, 2);
      assert.equal(coverCalls[1].url, "https://api.github.com/repos/Xounder/race/contents/.project-cover?ref=feature%2Fnew");
    }, url => new Promise<Response>(resolve => {
      if (url.endsWith("ref=main")) releaseOld = resolve;
      else releaseNew = resolve;
    }));
});

await suite("service malformed Contents entries cannot negative-cache a corrected cover", async () => {
  const repo = record("correction");
  const invalid = [
    coverFile(repo, "cover.png", { path: ".project-cover/nested/cover.png" }),
    coverFile(repo, "cover.png", { type: "symlink" }),
    coverFile(repo, "cover.png", { name: "../cover.png" }),
    coverFile(repo, "cover.png", { sha: "not-a-sha" }),
    coverFile(repo, "cover.png", { download_url: "https://evil.example/cover.png" }),
    coverFile(repo, "cover.png", { download_url: `${coverFile(repo, "cover.png").download_url}?sig=bad` }),
  ];
  for (const entry of invalid) {
    let attempt = 0;
    await serviceCase(() => response([repo]), async ({ service, coverCalls, coverRead }) => {
      const first = await service.refreshProjects(now);
      assert.ok(first.cards[0].cardInfo.image.img.startsWith("data:"));
      assert.equal(coverRead(), null);
      const corrected = await service.hydrateCachedProjects(now + 1);
      assert.match(corrected[0].cardInfo.image.img, /cover\.png$/);
      assert.equal(coverCalls.length, 2);
    }, () => new Response(JSON.stringify(++attempt === 1 ? [entry] : [coverFile(repo, "cover.png")])));
  }
});

await suite("service accepts encoded space and Unicode filename segments but rejects unsafe names", async () => {
  const repo = record("unicode");
  await serviceCase(() => response([repo]), async ({ service, coverCalls }) => {
    const result = await service.refreshProjects(now);
    assert.equal(result.ok, true);
    assert.equal(result.cards[0].cardInfo.image.img,
      "https://raw.githubusercontent.com/Xounder/unicode/main/.project-cover/cover%20photo.png");
    assert.equal(coverCalls.length, 1);
  }, () => new Response(JSON.stringify([
    coverFile(repo, "other.png", { path: ".project-cover/nested/other.png" }),
    coverFile(repo, "cover%2Ffake.png"), coverFile(repo, "../cover.png"),
    coverFile(repo, "cover\\evil.png"), coverFile(repo, "cover/photo.png"),
    coverFile(repo, "cover photo.png", { download_url:
      "https://raw.githubusercontent.com/Xounder/unicode/main/.project-cover/cover%20photo.png" }),
  ])));
  await serviceCase(() => response([repo]), async ({ service }) => {
    const result = await service.refreshProjects(now);
    assert.equal(result.cards[0].cardInfo.image.img,
      `https://raw.githubusercontent.com/Xounder/unicode/main/.project-cover/${encodeURIComponent("árvore 🎨.AVIF")}`);
  }, () => new Response(JSON.stringify([coverFile(repo, "árvore 🎨.AVIF", { download_url:
    `https://raw.githubusercontent.com/Xounder/unicode/main/.project-cover/${encodeURIComponent("árvore 🎨.AVIF")}` })])));
});

await suite("service globally caps concurrent cover HTTP across replaced cache snapshots", async () => {
  const base = record("queued");
  const snapshots = Array.from({ length: 4 }, (_, index) => ({ ...base,
    default_branch: `branch-${index}`, pushed_at: `2025-12-0${index + 1}T00:00:00Z` }));
  const releases = new Map<string, (value: Response) => void>();
  let active = 0, peak = 0;
  await serviceCase(() => { throw Error("hydration must not fetch catalog"); },
    async ({ service, replace, coverCalls }) => {
      const pending = snapshots.map((snapshot, index) => {
        replace([snapshot], now + index);
        return service.hydrateCachedProjects(now + index);
      });
      assert.equal(coverCalls.length, 3);
      assert.equal(active, 3);
      assert.equal(peak, 3);
      releases.get("branch-0")!(new Response(JSON.stringify([coverFile(snapshots[0], "cover.png")])));
      const first = await pending[0];
      assert.match(first[0].cardInfo.image.img, /branch-0\/\.project-cover\/cover\.png$/);
      assert.equal(coverCalls.length, 4); // fourth starts only after first releases its slot
      assert.equal(active, 3);
      assert.ok(peak <= 3);
      for (let index = 1; index < 4; index++) {
        const branch = `branch-${index}`;
        releases.get(branch)!(new Response(JSON.stringify([coverFile(snapshots[index], "cover.png")])));
      }
      const cards = await Promise.all(pending);
      cards.forEach((card, index) => assert.match(card[0].cardInfo.image.img,
        new RegExp(`branch-${index}/\\.project-cover/cover\\.png$`)));
      assert.equal(active, 0);
      assert.equal(peak, 3);
    }, async url => {
      const branch = new URL(url).searchParams.get("ref")!;
      active++; peak = Math.max(peak, active);
      try { return await new Promise<Response>(resolve => { releases.set(branch, resolve); }); }
      finally { active--; }
    });
});

await suite("service queued cover skips HTTP when a prior cover exhausts quota", async () => {
  const base = record("quota-queue");
  const records = Array.from({ length: 4 }, (_, index) => ({ ...base,
    default_branch: `quota-${index}`, pushed_at: `2025-12-1${index}T00:00:00Z` }));
  const releases = new Map<string, (value: Response) => void>();
  await serviceCase(() => { throw Error("hydration must not fetch catalog"); },
    async ({ service, replace, coverCalls, coverRead }) => {
      const pending = records.map((repo, index) => {
        replace([repo], now + index);
        return service.hydrateCachedProjects(now + index);
      });
      assert.equal(coverCalls.length, 3);
      releases.get("quota-0")!(new Response(null, { status: 429, headers: { "Retry-After": "120" } }));
      await pending[0];
      assert.equal(coverCalls.length, 3); // queued fourth obtained a permit but must not fetch
      releases.get("quota-1")!(new Response(null, { status: 404 }));
      releases.get("quota-2")!(new Response(null, { status: 500 }));
      await Promise.all(pending);
      assert.equal(coverCalls.length, 3);
      assert.equal(Object.values(coverRead() ?? {}).filter(value => value.filename === null).length, 1);
    }, url => new Promise<Response>(resolve => { releases.set(new URL(url).searchParams.get("ref")!, resolve); }));
});

console.log(`PASS ${suites} deterministic suites; mocked Node service, not browser, network, or deployment verification`);
