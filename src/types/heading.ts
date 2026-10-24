/**
 * Shared heading tag union — components render the level supplied by the route.
 * `/` nests sections directly under the MenuBar `h1`, so they use `h2`;
 * `/scroll` nests them under the `InfoCard` `h2`, so they use `h3`.
 * Kept as a literal union (not `string`) so a missing/typo'd level is a type error.
 */
export type HeadingLevel = "h2" | "h3";
