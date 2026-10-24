/**
 * Shared icon type — single source of truth for icon shape.
 * Kept separate from components to avoid data↔component coupling.
 */
export type Icon = {
  readonly icon: string;
  readonly alt: string;
  readonly link?: string;
};
