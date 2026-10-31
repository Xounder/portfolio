import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { build } from "esbuild";
import {
  CACHE_KEY, CACHE_TTL_MS, CACHE_VERSION, courseExclusions,
  DEFAULT_RATE_LIMIT_BACKOFF_MS, GITHUB_REPOS_ENDPOINT, MAX_PAGES, MAX_VISIBLE_PROJECTS,
} from "../src/data/githubProjectsConfig.ts";
import {
  buildProjectCards, canFetchNextPage, classifyHttpFailure, createCacheStore,
  dedupeRepositories, filterVisibleRepositories, isAbortError, isExcludedRepository,
  getRepositorySlugFromLink, mapRepositoryToCard, nextRetryDelayMs, parseGitHubRepositories, parseNextLink,
  shouldRevalidate, shouldRevalidateOnVisibility,
} from "../src/data/githubProjectsCore.ts";
import type { CacheStorage, GitHubRepositoryRecord, ProjectPresentationOverride } from "../src/data/githubTypes.ts";
import type { ProjectCardData } from "../src/data/types.ts";

const now = Date.parse("2026-01-01T00:00:00Z");
const image = { img: "local-fixture", alt: "Local image", width: 250, height: 250 };
const placeholder: ProjectPresentationOverride = { image };
let id = 1;
function record(name: string, changes: Partial<GitHubRepositoryRecord> = {}): GitHubRepositoryRecord {
  return {
    id: id++, name, full_name: `Xounder/${name}`, description: null, topics: [],
    language: null, html_url: `https://github.com/Xounder/${name}`,
    pushed_at: "2025-12-01T00:00:00Z", fork: false, archived: false,
    visibility: "public", ...changes,
  };
}
function featured(name: string): ProjectCardData {
  return { kind: "project", cardInfo: { title: name, description: "Featured", image,
    link: `https://github.com/Xounder/${name}` }, projectInfo: { technologies: [] } };
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
  const override = { title: "Custom", description: "Curated", technologies: ["TypeScript"], image };
  const card = mapRepositoryToCard(known, override, placeholder);
  assert.equal(card.cardInfo.title, "Custom");
  assert.equal(card.cardInfo.description, "Curated");
  assert.deepEqual(card.projectInfo.technologies, ["TypeScript"]);
  assert.deepEqual(card.cardInfo.image, image);
  assert.equal(card.cardInfo.link, known.html_url);
  const unknown = record("lvgl-feed-dispenser", { topics: ["C", "c", "LVGL"], language: "C" });
  const mapped = mapRepositoryToCard(unknown, undefined, placeholder);
  assert.equal(mapped.cardInfo.title, "Lvgl feed dispenser");
  assert.equal(mapped.cardInfo.description, "Public GitHub project.");
  assert.deepEqual(mapped.projectInfo.technologies, ["C", "LVGL"]);
  assert.deepEqual(mapped.cardInfo.image, image);
  const invalid = { ...known, html_url: "https://example.com/Xounder/Bokumon" };
  assert.deepEqual(parseGitHubRepositories([invalid, known]), [known]);
  for (const payload of [null, {}, [], [invalid], [null]]) assert.equal(parseGitHubRepositories(payload), null);
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

await suite("course exclusions, featured conflict, and source parity", () => {
  const names = [
    "react-native-dio", "node-dio", "linux-dio", "dotnet-dio", "microsoft-azure-essentials-dio",
    "dio-live-function", "dio-lab-open-source", "trilha-java-basico", "trilha-net-azure-desafio",
    "trilha-net-banco-de-dados-desafio", "padroes-projeto-spring", "api-rest-spring",
    "lab-quarkus", "minimal-api", "dotnet-api", "angular-blog", "angular-buzzfeed",
    "angular-store", "shoesecommerce", "first-site", "login-page", "lista-pilha-fila",
    "docker-compose", "docker-microsservice",
  ];
  assert.equal(courseExclusions.excludedRepos.size, 24);
  assert.deepEqual([...courseExclusions.excludedRepos].sort(), names.sort());
  for (const name of names) assert.equal(isExcludedRepository(record(name)), true, name);
  for (const name of ["dio-example", "trilha-example", "example-dio"]) assert.equal(isExcludedRepository(record(name)), true, name);
  for (const name of ["radio", "studio", "dio", "Bokumon", "TowerDefense", "Yu-Gi-Oh-Cards3D",
    "Games-in-C", "Simulation---1", "Simulation---2", "SCOH---Java"]) {
    assert.equal(isExcludedRepository(record(name)), false, name);
  }
  for (const topic of ["dio", "digital-innovation-one", "dio-bootcamp", "dio-lab"]) {
    assert.equal(isExcludedRepository(record("original", { topics: [topic.toUpperCase()] })), true, topic);
  }
  for (const description of ["Made for DIO", "Digital Innovation One assignment"]) {
    assert.equal(isExcludedRepository(record("original", { description })), true, description);
  }
  for (const word of ["curso", "course", "exercise", "exercicio", "aula", "lab", "desafio", "bootcamp"]) {
    assert.equal(isExcludedRepository(record(word, { description: word, topics: [word] })), false, word);
  }
  const curated = ["api-rest-spring", "minimal-api", "dotNET-Api", "angular-blog",
    "angular-buzzfeed", "angular-store", "Bokumon", "ShoesEcommerce"];
  assert.deepEqual(filterVisibleRepositories(curated.map(name => record(name))).map(r => r.name), ["Bokumon"]);
  for (const name of curated) {
    const live = record(name, { description: "A public project", topics: ["typescript"] });
    const cached = parseGitHubRepositories([live])![0];
    const staticLike = { name, topics: [], description: "Featured project", fork: false,
      archived: false, visibility: "public" as const };
    assert.equal(isExcludedRepository(live), isExcludedRepository(cached), name);
    assert.equal(isExcludedRepository(cached), isExcludedRepository(staticLike), name);
  }
  for (const changes of [{ fork: true }, { archived: true }, { visibility: "private" }]) {
    assert.equal(isExcludedRepository({ ...record("independent"), ...changes } as GitHubRepositoryRecord), true);
  }
});

await suite("cache codec, TTL, raw boundary and storage failures", () => {
  const visible = record("Bokumon"), excluded = record("api-rest-spring");
  const store = createCacheStore(null);
  assert.equal(store.read(now).state, "missing");
  store.write([visible, excluded], now);
  assert.equal(store.read(now + CACHE_TTL_MS - 1).state, "fresh");
  assert.equal(store.read(now + CACHE_TTL_MS).state, "stale");
  assert.equal(store.read(now + CACHE_TTL_MS + 1).state, "stale");
  assert.equal(store.read(now - 1).state, "stale");
  assert.deepEqual(store.read(now).records.map(r => r.name), ["Bokumon", "api-rest-spring"]);
  assert.deepEqual(store.read(now).visibleRecords.map(r => r.name), ["Bokumon"]);
  store.clear();
  assert.equal(store.read(now).state, "missing");
  let raw: string | null = null;
  const storage: CacheStorage = { getItem: key => { assert.equal(key, CACHE_KEY); return raw; },
    setItem: (key, value) => { assert.equal(key, CACHE_KEY); raw = value; },
    removeItem: () => { raw = null; } };
  const persisted = createCacheStore(storage);
  persisted.write([visible, excluded], now);
  assert.ok(raw);
  assert.deepEqual(JSON.parse(raw).records.map((r: GitHubRepositoryRecord) => r.name), ["Bokumon", "api-rest-spring"]);
  assert.doesNotMatch(raw, /ProjectCardData|\/assets\/|\.webp/);
  for (const [value, expected] of [
    ["{broken", "invalid"],
    [JSON.stringify({ version: CACHE_VERSION + 1, savedAt: now, records: [visible] }), "invalid"],
    [JSON.stringify({ version: CACHE_VERSION, records: [visible] }), "invalid"],
    [JSON.stringify({ version: CACHE_VERSION, savedAt: now, records: {} }), "invalid"],
    [JSON.stringify({ version: CACHE_VERSION, savedAt: now, records: [] }), "missing"],
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
  const cards = buildProjectCards([older, b, a, record("Bokumon"), record("api-rest-spring")],
    [featured("Bokumon"), featured("TowerDefense")], new Map(), placeholder, MAX_VISIBLE_PROJECTS);
  assert.deepEqual(cards.map(c => c.cardInfo.title), ["Bokumon", "TowerDefense", "Alpha", "Beta", "Older"]);
  assert.deepEqual(buildProjectCards([a, record("api-rest-spring")], [], new Map(), placeholder,
    MAX_VISIBLE_PROJECTS).map(c => c.cardInfo.title), ["Alpha"]);
  assert.deepEqual(buildProjectCards([], [featured("Bokumon")], new Map(), placeholder,
    MAX_VISIBLE_PROJECTS).map(c => c.cardInfo.title), ["Bokumon"]);
  const many = Array.from({ length: 20 }, (_, index) => record(`extra-${index}`));
  assert.equal(buildProjectCards(many, [featured("Bokumon")], new Map(), placeholder, MAX_VISIBLE_PROJECTS).length, 12);
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

await suite("static production wiring and source boundaries", () => {
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
  assert.match(service, /if\s*\(cached\.visibleRecords\.length\)/);
  assert.doesNotMatch(service, /Authorization|VITE_|setInterval|\.webp|\/assets\//);
  const presentation = source("src/data/projectPresentation.ts");
  for (const token of ["ProjectsCards", "isExcludedRepository", "api-logo.webp"]) assert.ok(presentation.includes(token), token);
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
  bundle: true, write: false, platform: "node", format: "esm", loader: { ".webp": "dataurl" },
  logLevel: "silent" });
const serviceUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(bundle.outputFiles[0].text)}`;
type Service = typeof import("../src/data/githubProjects.ts");
type FetchHandler = (url: string, headers: Headers) => Promise<Response> | Response;
let instance = 0;
async function serviceCase(handler: FetchHandler, run: (context: {
  service: Service; calls: { url: string; headers: Headers }[];
  read: () => { version: number; savedAt: number; records: GitHubRepositoryRecord[] } | null;
  replace: (records: GitHubRepositoryRecord[], savedAt: number) => void;
  writes: () => number;
}) => Promise<void>): Promise<void> {
  const previousFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  let raw: string | null = null;
  let writeCount = 0;
  const calls: { url: string; headers: Headers }[] = [];
  const storage: CacheStorage = {
    getItem: () => raw,
    setItem: (_key, value) => { raw = value; writeCount++; },
    removeItem: () => { raw = null; },
  };
  try {
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: storage } });
    Object.defineProperty(globalThis, "fetch", { configurable: true, value: async (input: string, init: RequestInit) => {
      const headers = new Headers(init.headers);
      calls.push({ url: String(input), headers });
      return handler(String(input), headers);
    } });
    const service = await import(`${serviceUrl}#case-${++instance}`) as Service;
    await run({ service, calls,
      read: () => raw === null ? null : JSON.parse(raw) as { version: number; savedAt: number; records: GitHubRepositoryRecord[] },
      replace: (records, savedAt) => { raw = JSON.stringify({ version: CACHE_VERSION, savedAt, records }); },
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
      assert.equal(result.source, "static", link);
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
    assert.equal(result.source, "static");
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

console.log(`PASS ${suites} deterministic suites; mocked Node service, not browser, network, or deployment verification`);
