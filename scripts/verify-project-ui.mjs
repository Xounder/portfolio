import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';

const runtime = `
export const state = globalThis.__uiState ??= { slots: [], cursor: 0, effects: [], cleanup: [], active: true };
export function reset() { state.slots = []; state.cursor = 0; state.effects = []; state.cleanup = []; state.active = true; }
export function render(fn) { state.cursor = 0; return fn(); }
export function flush() { for (const effect of state.effects.splice(0)) state.cleanup.push(effect()); }
export function unmount() { for (const cleanup of state.cleanup.splice(0)) cleanup?.(); state.active = false; }
export function useState(initial) { const i = state.cursor++; if (!(i in state.slots)) state.slots[i] = typeof initial === 'function' ? initial() : initial; return [state.slots[i], value => { state.slots[i] = typeof value === 'function' ? value(state.slots[i]) : value; }]; }
export function useRef(initial) { const i = state.cursor++; return state.slots[i] ??= { current: initial }; }
export function useCallback(fn) { state.cursor++; return fn; }
export function useEffect(fn) { const i = state.cursor++; if (!(i in state.slots)) { state.slots[i] = true; state.effects.push(fn); } }
export function jsx(type, props) { return { type, props: props ?? {} }; }
export const jsxs = jsx;
export const Fragment = 'fragment';
`;
const service = `
export const mock = globalThis.__uiMock ??= { initial: { cards: [], cacheState: 'missing' }, refresh: async () => ({ ok: true, cards: [], source: 'network' }), hydrate: async () => [], refreshCalls: 0, hydrateCalls: 0 };
export const readInitialProjects = () => mock.initial;
export const refreshProjects = now => { mock.refreshCalls++; return mock.refresh(now); };
export const hydrateCachedProjects = now => { mock.hydrateCalls++; return mock.hydrate(now); };
`;
const output = await build({ entryPoints: ['src/data/projectPresentation.ts', 'src/components/DefaultCard/DefaultCard.tsx', 'src/components/DefaultCardGroup/DefaultCardGroup.tsx', 'src/components/ProjectsCardGroup/ProjectsCardGroup.tsx', 'src/hooks/useGitHubProjects.ts', 'virtual:runtime', 'virtual:service'], bundle: true, jsx: 'automatic', format: 'esm', platform: 'node', write: false, outdir: 'out', plugins: [{ name: 'ui-boundaries', setup(b) {
  b.onResolve({ filter: /^virtual:/ }, args => ({ path: args.path, namespace: 'virtual' }));
  b.onLoad({ filter: /.*/, namespace: 'virtual' }, args => ({ contents: args.path === 'virtual:runtime' ? runtime : service, loader: 'js' }));
  b.onResolve({ filter: /^react(?:\/jsx-runtime)?$/ }, () => ({ path: 'virtual:runtime', namespace: 'virtual' }));
  b.onResolve({ filter: /githubProjects\.ts$/ }, () => ({ path: 'virtual:service', namespace: 'virtual' }));
  b.onResolve({ filter: /\.(?:svg|webp|css)$/ }, args => ({ path: args.path, namespace: 'asset' }));
  b.onLoad({ filter: /.*/, namespace: 'asset' }, args => ({ contents: `export default ${JSON.stringify(args.path)};`, loader: 'js' }));
} }] });
const modules = await Promise.all(output.outputFiles.map(file => import('data:text/javascript;base64,' + Buffer.from(file.contents).toString('base64'))));
const byName = name => modules[output.outputFiles.findIndex(file => file.path.replaceAll('\\', '/').endsWith('/' + name + '.js') || file.path.replaceAll('\\', '/').endsWith('/virtual_' + name + '.js'))];
const rt = byName('runtime');
const { mock } = byName('service');
const { projectCategoryImages: images } = byName('projectPresentation');
const { DefaultCard } = byName('DefaultCard');
const { DefaultCardGroup } = byName('DefaultCardGroup');
const { ProjectsCardGroup } = byName('ProjectsCardGroup');
const { useGitHubProjects } = byName('useGitHubProjects');
const nodes = (node, type) => !node || typeof node !== 'object' ? [] : [ ...(node.type === type || (typeof type === 'function' && node.type?.name === type.name) ? [node] : []), ...Object.values(node.props ?? {}).flatMap(child => Array.isArray(child) ? child.flatMap(n => nodes(n, type)) : nodes(child, type)) ];
const settle = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
function card(src, fallbackImg, title = 'Project') { return { kind: 'project', cardInfo: { title, description: 'A project', link: 'https://github.com/Xounder/project', image: { img: src, fallbackImg, alt: '', width: 500, height: 314 } }, projectInfo: { technologies: [] } }; }
function showCard(image, title = 'Project') { return rt.render(() => DefaultCard({ image, title, link: 'url', description: 'desc', headingLevel: 'h2' })); }
rt.reset();
const remote = card('remote', 'local').cardInfo.image;
let tree = showCard(remote); let img = nodes(tree, 'img')[0];
assert.equal(img.props.src, 'remote'); assert.equal(img.props.alt, ''); assert.equal(img.props.width, 500);
img.props.onError({ currentTarget: { getAttribute: () => 'remote' } });
tree = showCard(remote); img = nodes(tree, 'img')[0]; assert.equal(img.props.src, 'local'); assert.equal(img.props.onError, undefined);
img = nodes(showCard({ ...remote, img: 'new-remote' }), 'img')[0]; assert.equal(img.props.src, 'new-remote');
img.props.onError({ currentTarget: { getAttribute: () => 'old-remote' } });
assert.equal(nodes(showCard({ ...remote, img: 'new-remote' }), 'img')[0].props.src, 'new-remote');
assert.equal(nodes(showCard(remote, 'another card'), 'img')[0].props.src, 'remote');
assert.equal(nodes(showCard({ ...remote, fallbackImg: 'remote' }), 'img')[0].props.onError, undefined);
assert.equal(nodes(showCard({ ...remote, fallbackImg: undefined }), 'img')[0].props.onError, undefined);
assert.deepEqual(Object.keys(images).sort(), ['api', 'frontend', 'fullstack', 'games', 'misc'].sort());
for (const category of ['frontend', 'fullstack', 'games', 'misc']) {
  const asset = images[category];
  const svg = readFileSync(new URL('../src/assets/images/' + asset.img.split('/').at(-1), import.meta.url), 'utf8');
  assert.match(svg, /viewBox="0 0 500 314"/); assert.equal(asset.width, 500); assert.equal(asset.height, 314);
}
assert.match(images.api.img, /api-logo\.webp$/);
assert.equal(nodes(DefaultCardGroup({ cardType: 'Projects', headingLevel: 'h2' }), DefaultCard).length, 0);
assert.equal(nodes(DefaultCardGroup({ cardType: 'Projects', headingLevel: 'h2', cards: [card('remote', 'local')] }), DefaultCard).length, 1);
assert.equal(nodes(DefaultCardGroup({ cardType: 'Experiences', headingLevel: 'h2' }), DefaultCard).length, 1);
assert.equal(nodes(DefaultCardGroup({ cardType: 'Recognitions', headingLevel: 'h2' }), DefaultCard).length, 6);
const listeners = new Map(); globalThis.document = { visibilityState: 'visible', addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
let resolveRefresh; mock.initial = { cards: [], cacheState: 'missing' }; mock.refresh = () => new Promise(resolve => { resolveRefresh = resolve; });
rt.reset(); let hook = rt.render(useGitHubProjects); rt.flush(); hook = rt.render(useGitHubProjects); assert.equal(hook.isRefreshing, true);
assert.equal(mock.hydrateCalls, 0);
rt.unmount(); rt.reset(); let loading = rt.render(() => ProjectsCardGroup({ headingLevel: 'h2' })); rt.flush();
loading = rt.render(() => ProjectsCardGroup({ headingLevel: 'h2' }));
assert.equal(nodes(loading, 'div')[0].props['aria-busy'], true);
assert.match(nodes(loading, 'p')[0].props.children, /Refreshing projects/);
rt.unmount(); rt.reset(); rt.render(useGitHubProjects); rt.flush();
resolveRefresh({ ok: false, cards: [], source: 'empty', failure: { kind: 'terminal' } }); await settle();
hook = rt.render(useGitHubProjects); assert.equal(hook.hasError, true); assert.equal(hook.cards.length, 0); assert.equal(hook.isRefreshing, false);
rt.unmount(); rt.reset(); mock.refresh = async () => ({ ok: false, cards: [], source: 'empty', failure: { kind: 'terminal' } });
rt.render(() => ProjectsCardGroup({ headingLevel: 'h2' })); rt.flush(); await settle();
let group = rt.render(() => ProjectsCardGroup({ headingLevel: 'h2' })); assert.match(nodes(group, 'p')[0].props.children, /Unable to load/);
rt.unmount(); assert.equal(listeners.size, 0);
mock.initial = { cards: [card('cached', 'local')], cacheState: 'fresh' };
let resolveHydrate; mock.hydrate = () => new Promise(resolve => { resolveHydrate = resolve; });
rt.reset(); hook = rt.render(useGitHubProjects); rt.flush(); assert.equal(mock.hydrateCalls, 1);
hook = rt.render(useGitHubProjects); assert.equal(hook.isRefreshing, true); assert.equal(hook.cards.length, 1);
rt.unmount(); resolveHydrate([card('late', 'local')]); await settle();
hook = rt.render(useGitHubProjects); assert.equal(hook.cards[0].cardInfo.image.img, 'cached');
// A cached failure displays verified cards, not the empty-error message.
rt.reset(); mock.initial = { cards: [card('cached', 'local')], cacheState: 'stale' };
mock.refresh = async () => ({ ok: false, cards: [card('verified', 'local')], source: 'cache', failure: { kind: 'rate-limited' } });
hook = rt.render(useGitHubProjects); rt.flush(); await settle(); hook = rt.render(useGitHubProjects);
assert.equal(hook.cards[0].cardInfo.image.img, 'verified'); assert.equal(hook.hasError, true);
rt.unmount(); rt.reset(); rt.render(() => ProjectsCardGroup({ headingLevel: 'h2' })); rt.flush(); await settle();
group = rt.render(() => ProjectsCardGroup({ headingLevel: 'h2' })); assert.match(nodes(group, 'p')[0].props.children, /Showing cached/); rt.unmount();
// Initial hydration must not fetch repository pages.
rt.reset(); mock.initial = { cards: [card('cached', 'local')], cacheState: 'fresh' };
mock.hydrate = async () => [card('hydrated', 'local')]; const count = mock.refreshCalls;
rt.render(useGitHubProjects); rt.flush(); await settle(); hook = rt.render(useGitHubProjects);
assert.equal(hook.cards[0].cardInfo.image.img, 'hydrated'); assert.equal(mock.refreshCalls, count); rt.unmount();
// A later visibility refresh supersedes an unresolved initial cover hydration.
rt.reset(); mock.initial = { cards: [card('cached', 'local')], cacheState: 'fresh' };
mock.hydrate = () => new Promise(resolve => { resolveHydrate = resolve; });
let resolveLaterRefresh; mock.refresh = () => new Promise(resolve => { resolveLaterRefresh = resolve; });
rt.render(useGitHubProjects); rt.flush();
mock.initial = { cards: [], cacheState: 'stale' }; listeners.get('visibilitychange')();
resolveLaterRefresh({ ok: true, cards: [card('newer', 'local')], source: 'network' }); await settle();
resolveHydrate([card('outdated', 'local')]); await settle();
hook = rt.render(useGitHubProjects); assert.equal(hook.cards[0].cardInfo.image.img, 'newer'); rt.unmount();
console.log('PASS project UI production card, category artwork, shared groups, hook hydration and error states');
