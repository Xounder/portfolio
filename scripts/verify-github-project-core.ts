import assert from "node:assert/strict";
import {
  buildProjectCards, classifyProject, classifyHttpFailure, createCacheStore,
  mapRepositoryToCard, parseGitHubRepositories, parseNextLink, selectVisibleRepositories,
} from "../src/data/githubProjectsCore.ts";
import { CACHE_KEY, CACHE_TTL_MS, CACHE_VERSION } from "../src/data/githubProjectsConfig.ts";
import type { CacheStorage, GitHubRepositoryRecord, ProjectCategory, ProjectImage } from "../src/data/githubTypes.ts";

const now = Date.parse("2025-12-31T00:00:00Z");
const images = Object.fromEntries(["games", "fullstack", "api", "frontend", "misc"].map(category =>
  [category, { img: `/assets/${category}.svg`, alt: category, width: 250, height: 250 }])) as Record<ProjectCategory, ProjectImage>;
let id = 1;
function repo(name: string, changes: Partial<GitHubRepositoryRecord> = {}): GitHubRepositoryRecord {
  return { id: id++, name, full_name: `Xounder/${name}`, default_branch: "feature/cover",
    html_url: `https://github.com/Xounder/${name}`, description: null, topics: ["api"],
    language: "TypeScript", pushed_at: "2025-11-01T00:00:00Z", fork: false,
    archived: false, visibility: "public", ...changes };
}
function parsed(value: unknown): GitHubRepositoryRecord[] | null { return parseGitHubRepositories([value]); }

assert.equal(CACHE_VERSION, 2);
assert.equal(CACHE_KEY, "portfolio:github-projects:v2");
assert.equal(CACHE_TTL_MS, 30 * 60 * 1000);
assert.deepEqual(parseGitHubRepositories([]), []);
assert.equal(parseGitHubRepositories([null, {}]), null);
assert.equal(parseGitHubRepositories({}), null);
const original = repo("original", { topics: [" API ", "api", "  ", "Games", "games"] });
assert.deepEqual(parsed(original)?.[0]?.topics, ["API", "Games"]);
assert.deepEqual(parsed({ ...original, topics: undefined })?.[0]?.topics, []);
assert.equal(parsed({ ...original, default_branch: undefined }), null);
for (const branch of ["", " ", "/main", "main/", "a//b", "a/../b", ".hidden", "a/.hidden", "a.lock", "a/b.lock", "a@{b", "a%2fb", "a\\b", "a?b", "a..b", "@"])
  assert.equal(parsed({ ...original, default_branch: branch }), null, branch);
for (const branch of ["main", "feature/cover", "release/v1.2", "fix/a-b_c"])
  assert.equal(parsed({ ...original, default_branch: branch })?.[0]?.default_branch, branch);
for (const invalid of [
  { full_name: "Attacker/original" }, { html_url: "https://github.com/Attacker/original" },
  { html_url: "https://github.com/Xounder/original/extra" },
  { html_url: "https://github.com/Xounder/original?x=1" },
  { html_url: "https://user@github.com/Xounder/original" },
  { name: "other" }, { id: -1 }, { pushed_at: "2999-01-01T00:00:00Z" },
  { pushed_at: "yesterday" }, { pushed_at: "2025-02-30T00:00:00Z" }, { topics: ["api", 3] },
]) assert.equal(parsed({ ...original, ...invalid }), null, JSON.stringify(invalid));
assert.deepEqual(parseGitHubRepositories([{ ...original, default_branch: null }, original])?.[0]?.default_branch, "feature/cover");

for (const [topics, category] of [
  [[" games ", "api", "frontend"], "games"], [["FULL-STACK", "api"], "fullstack"],
  [[" frontend ", "BACKEND"], "fullstack"], [["api", "react"], "api"],
  [["react"], "frontend"], [["javascript", "ai"], "misc"], [[], "misc"],
] as [string[], ProjectCategory][]) assert.equal(classifyProject(topics), category);
for (const topic of ["game", "games", "jogo", "jogos", "gamedev"])
  assert.equal(classifyProject([` ${topic.toUpperCase()} `]), "games", topic);
for (const topic of ["backend", "api", "rest-api"])
  assert.equal(classifyProject([topic]), "api", topic);
for (const topic of ["frontend", "html", "css", "react", "vue", "angular"])
  assert.equal(classifyProject([topic]), "frontend", topic);
for (const topics of [["jogos", "fullstack", "backend"], ["jogo", "frontend", "backend", "api"]])
  assert.equal(classifyProject(topics), "games", topics.join(","));
for (const topics of [["fullstack", "api"], ["full-stack", "backend"], ["frontend", "backend"], [" backend ", " FRONTEND "]])
  assert.equal(classifyProject(topics), "fullstack", topics.join(","));
assert.equal(classifyProject(["backend", "html"]), "api");
assert.equal(classifyProject(["css", "javascript", "ai"]), "frontend");
assert.equal(classifyProject(["javascript"]), "misc");
assert.equal(classifyProject(["ai"]), "misc");

const candidates = [
  repo("early", { pushed_at: "2025-10-01T00:00:00Z" }),
  repo("late", { pushed_at: "2025-12-01T00:00:00Z", topics: [" API ", "api", " "] }),
  repo("late", { pushed_at: "2025-11-01T00:00:00Z" }),
  repo("clone", { id: 2, pushed_at: "2025-09-01T00:00:00Z" }),
  repo("blank", { topics: [" "] }), repo("missing", { topics: [] }),
  repo("profile", { topics: ["Game", " ABOUT-ME "] }),
  repo("other-profile", { topics: [" aBoUtMe-GiThUb ", "API"] }),
  repo("course", { topics: ["api", "DIO"] }), repo("dio-lab", { topics: ["api"] }),
  repo("api-rest-spring", { description: "Digital Innovation One assignment", topics: ["rest-api"] }),
  repo("dio-lesson", { topics: ["DIO"] }),
  repo("portfolio"), repo("Xounder"), repo("fork", { fork: true }),
  repo("archived", { archived: true }), repo("private", { visibility: "private" as "public" }),
  repo("spoof", { full_name: "Other/spoof" }),
];
const eligible = selectVisibleRepositories(candidates, 12);
assert.deepEqual(eligible.map(r => r.name), ["late", "api-rest-spring", "course", "dio-lab", "dio-lesson", "early"]);
assert.deepEqual(selectVisibleRepositories(candidates, 1).map(r => r.name), ["late"]);
for (const topic of ["about-me", "aboutme-github"])
  assert.deepEqual(buildProjectCards([repo(`excluded-${topic}`, { topics: ["jogos", ` ${topic.toUpperCase()} `] })], images, 12), [], topic);
assert.deepEqual(selectVisibleRepositories(candidates, -1), []);
const tied = [repo("z"), repo("a")];
assert.deepEqual(selectVisibleRepositories(tied, 12).map(r => r.name), ["a", "z"]);
const many = Array.from({ length: 15 }, (_, n) => repo(`item-${n}`, { pushed_at: `2025-11-${String(n + 1).padStart(2, "0")}T00:00:00Z` }));
assert.equal(selectVisibleRepositories(many, 12).length, 12);
const card = mapRepositoryToCard(eligible[0], images);
assert.equal(card.cardInfo.title, "Late");
assert.equal(card.cardInfo.description, "Public GitHub project.");
assert.equal(card.cardInfo.link, eligible[0].html_url);
assert.deepEqual(card.projectInfo.technologies, ["API"]);
assert.deepEqual(card.cardInfo.image, { ...images.api, fallbackImg: images.api.img });
assert.deepEqual(buildProjectCards(candidates, images, 12).map(c => c.cardInfo.title),
  ["Late", "Api rest spring", "Course", "Dio lab", "Dio lesson", "Early"]);
assert.deepEqual(buildProjectCards(candidates, images, 12)[2].projectInfo.technologies, ["api", "DIO"]);
assert.deepEqual(buildProjectCards([], images, 12), []);
assert.equal(mapRepositoryToCard(repo("game-test", { topics: ["GAMES"] }), images).cardInfo.image.fallbackImg, images.games.img);

const data = new Map<string, string>();
const storage: CacheStorage = {
  getItem: key => data.get(key) ?? null,
  setItem: (key, value) => { data.set(key, value); },
  removeItem: key => { data.delete(key); },
};
let cache = createCacheStore(storage);
cache.write([original], now);
assert.equal(JSON.parse(data.get(CACHE_KEY)!).version, 2);
assert.deepEqual(cache.read(now).records[0].topics, ["API", "Games"]);
assert.equal(cache.read(now + CACHE_TTL_MS - 1).state, "fresh");
assert.equal(cache.read(now + CACHE_TTL_MS).state, "stale");
// A fresh, previously course-filtered v2 snapshot is re-evaluated on read, not flushed or rewritten.
const cachedCourse = repo("api-rest-spring", { topics: ["DIO"], description: "Digital Innovation One assignment" });
data.set(CACHE_KEY, JSON.stringify({ version: CACHE_VERSION, savedAt: now,
  records: [cachedCourse, repo("no-topics", { topics: [" "] }),
    repo("profile-topic", { topics: ["API", " AbOuT-Me "] })] }));
const originalRaw = data.get(CACHE_KEY);
const reevaluated = createCacheStore(storage).read(now);
assert.equal(reevaluated.state, "fresh");
assert.deepEqual(reevaluated.records.map(r => r.name), ["api-rest-spring", "no-topics", "profile-topic"]);
assert.deepEqual(reevaluated.visibleRecords.map(r => r.name), ["api-rest-spring"]);
assert.equal(data.get(CACHE_KEY), originalRaw);
cache.write([], now);
assert.deepEqual(cache.read(now), { state: "fresh", records: [], visibleRecords: [] });
assert.equal(cache.read(now + CACHE_TTL_MS).state, "stale");
for (const raw of ["{", JSON.stringify({ version: 1, savedAt: now, records: [original] }),
  JSON.stringify({ version: 2, savedAt: now, records: [{ ...original, default_branch: null }] }),
  JSON.stringify({ version: 2, savedAt: now, records: [original, {}] })]) {
  data.set(CACHE_KEY, raw);
  assert.equal(createCacheStore(storage).read(now).state, "invalid");
}
data.delete(CACHE_KEY);
cache = createCacheStore(storage);
cache.write([original], now);
cache.write([{ ...original, default_branch: "../oops" }], now + 1);
assert.equal(cache.read(now).records[0].default_branch, "feature/cover");
const quota = createCacheStore({ getItem: () => { throw Error("unavailable"); }, setItem: () => { throw Error("quota"); } });
quota.write([original], now);
assert.equal(quota.read(now).state, "fresh");
quota.clear();
assert.equal(quota.read(now).state, "missing");
assert.equal(parseNextLink('<https://api.github.com/next>; rel="next"'), "https://api.github.com/next");
assert.equal(classifyHttpFailure(429, { get: () => null }, now).kind, "rate-limited");
console.log("PASS core selection, mapping, identity, schema-v2 cache and helper assertions");
