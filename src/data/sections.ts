import { iconsData } from './iconsData';
import type { Icon } from '../types/icons';

/**
 * Section registry — single source of truth for section identity, icon pairing
 * and render-target linkage (TASK-10 / W2.2).
 *
 * Render *targets* deliberately live outside this module, in each page's
 * module-scope map keyed by `SectionId`: `HomePage` renders eagerly at heading
 * level h2, while `HomePageScroll` renders lazily at h3 — importing the
 * components here would eagerly pull the `/scroll` lazy chunks into the `/`
 * bundle and would tie `sections.ts` into the component graph. `SectionId` is
 * the stable, non-copy key that lets those sibling maps derive from this
 * registry without repeating the 5 display-name strings anywhere else
 * (TASK-10 edge case: "keep sections.ts data-only (name + icons) and put the
 * render targets in a sibling module").
 */
export type SectionName =
  | 'About Me'
  | 'Projects'
  | 'Experiences'
  | 'Recognitions'
  | 'Contact';

export type SectionId =
  | 'about'
  | 'projects'
  | 'experiences'
  | 'recognitions'
  | 'contact';

export interface SectionEntry {
  readonly id: SectionId;
  readonly name: SectionName;
  readonly icons: Icon[];
}

export const sectionRegistry = [
  { id: 'about', name: 'About Me', icons: iconsData[0] },
  { id: 'projects', name: 'Projects', icons: iconsData[1] },
  { id: 'experiences', name: 'Experiences', icons: iconsData[2] },
  { id: 'recognitions', name: 'Recognitions', icons: iconsData[3] },
  { id: 'contact', name: 'Contact', icons: iconsData[4] },
] as const satisfies readonly SectionEntry[];

/**
 * Ordered list of section names, derived from the registry.
 * Using `readonly` prevents accidental mutation and narrows the type to the union.
 */
export const sections: readonly SectionName[] = sectionRegistry.map((s) => s.name);

/**
 * Type-safe replacement for `Object.fromEntries(...) as Record<K, V>`.
 * `K` is inferred from the entries themselves (the registry's literal `name`
 * types), so `Record<K, V>` describes exactly the keys present at runtime.
 * The single assertion here is confined to this generic and cannot overstate
 * key coverage — coverage is enforced at the call site instead (see below).
 */
function recordFromEntries<K extends string, V>(
  entries: readonly (readonly [K, V])[],
): Record<K, V> {
  const record = {} as Record<K, V>;
  for (const [key, value] of entries) {
    record[key] = value;
  }
  return record;
}

/**
 * Record for O(1) total lookup — structural totality, no non-null assertions.
 * Keys are exactly the SectionName union; a non-SectionName input is a type error.
 * Compile-time exhaustiveness: the `Record<SectionName, SectionEntry>` annotation
 * fails if a SectionName member is missing from the registry (K would not cover
 * it), and extra names are rejected by `satisfies readonly SectionEntry[]` above.
 */
const sectionRecord: Record<SectionName, SectionEntry> = recordFromEntries(
  sectionRegistry.map((entry) => [entry.name, entry] as const),
);

/**
 * Total lookup: returns the full registry entry for a known section.
 * Input is narrowed to `SectionName`, so the result is always a registered
 * entry (never `undefined`).
 */
export function getSectionEntry(sectionName: SectionName): SectionEntry {
  return sectionRecord[sectionName];
}

/**
 * Total lookup: returns the icon array for a known section.
 * The input is narrowed to `SectionName`, so the result is always `Icon[]` (never `undefined`).
 * Uses a Record for structural exhaustiveness — no `find` + `!` needed.
 */
export function getSectionIcons(sectionName: SectionName): Icon[] {
  return sectionRecord[sectionName].icons;
}

/**
 * Position of each section within `sectionRegistry` (equivalently, within
 * `sections`) — i.e. the index used to navigate the ordered list. Built as a
 * typed Record so the lookup is total: input is `SectionName`, and the record
 * covers every registered name, so the result is always a valid 0–4 index.
 * Replaces the former linear index-of lookup on the names list (TASK-10
 * acceptance: no such lookup may remain anywhere in the codebase).
 */
const sectionIndexRecord: Record<SectionName, number> = recordFromEntries(
  sectionRegistry.map((entry, index) => [entry.name, index] as const),
);

export function getSectionIndex(sectionName: SectionName): number {
  return sectionIndexRecord[sectionName];
}
