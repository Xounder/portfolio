export const GITHUB_USERNAME = "Xounder";
export const GITHUB_PROFILE_URL = "https://github.com/Xounder";
export const GITHUB_REPOS_ENDPOINT = "https://api.github.com/users/Xounder/repos?type=owner&sort=pushed&direction=desc&per_page=100";
export const GITHUB_API_HEADERS: Readonly<Record<string, string>> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
export const CACHE_KEY = "portfolio:github-projects:v1";
export const CACHE_VERSION = 1;
export const CACHE_TTL_MS = 30 * 60 * 1000;
export const MAX_VISIBLE_PROJECTS = 12;
export const MAX_PAGES = 3;
export const PER_PAGE = 100;
export const DEFAULT_RATE_LIMIT_BACKOFF_MS = 60_000;
export const BACKOFF_DELAYS_MS: readonly number[] = [500, 1500];
export const SELF_REPOSITORY_NAME = "portfolio";

export type CourseExclusionConfig = {
  excludedRepos: ReadonlySet<string>;
  excludedNamePatterns: readonly RegExp[];
  excludedTopics: ReadonlySet<string>;
  excludedDescriptionPatterns: readonly RegExp[];
};

export const courseExclusions: CourseExclusionConfig = {
  excludedRepos: new Set([
    "react-native-dio", "node-dio", "linux-dio", "dotnet-dio",
    "microsoft-azure-essentials-dio", "dio-live-function", "dio-lab-open-source",
    "trilha-java-basico", "trilha-net-azure-desafio", "trilha-net-banco-de-dados-desafio",
    "padroes-projeto-spring", "api-rest-spring", "lab-quarkus", "minimal-api",
    "dotnet-api", "angular-blog", "angular-buzzfeed", "angular-store",
    "shoesecommerce", "first-site", "login-page", "lista-pilha-fila",
    "docker-compose", "docker-microsservice",
  ]),
  excludedNamePatterns: [/^dio-/, /^trilha-/, /-dio$/],
  excludedTopics: new Set(["dio", "digital-innovation-one", "dio-bootcamp", "dio-lab"]),
  excludedDescriptionPatterns: [/\bDIO\b/, /\bDigital Innovation One\b/i],
};
