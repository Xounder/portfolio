import type { ReactElement } from "react";
import type { HeadingLevel } from "../types/heading";
import type { ProjectImage } from "./githubTypes.ts";

/**
 * Data-facing shapes shared by `data.ts` and the components that render them.
 *
 * TYPES ONLY — no runtime values, so the data layer stays serialisable
 * (prerender-readiness). Nothing here may import from `src/components/`:
 * the dependency must run `components -> data/types`, never the reverse.
 *
 * Every shape below was moved here verbatim; fields and optionality are unchanged.
 */

/** `AboutMe` content. `headingLevel` is presentation, supplied by the route. */
export type AboutMeProps = {
  image: {
    img: string;
    alt: string;
    width: number;
    height: number;
  };
  title: string;
  description: string[];
  headingLevel: HeadingLevel;
};

/** `DefaultCard` props. `headingLevel` is presentation, supplied by the route. */
export interface DefaultCardProps {
  image: ProjectImage;
  title: string;
  description: string;
  link?: string;
  component?: ReactElement;
  headingLevel: HeadingLevel;
}

/** `ExperienceCardInfo` payload — drives the info line and the year button. */
export interface ExperienceCardInfoProps {
  info: { type: string; yearPeriod: string };
}

/** `ProjectCardInfo` payload — the technology buttons under a project card. */
export type ProjectCardInfoProps = {
  technologies: string[];
};

/**
 * A card as stored in data: the card's own props minus the route-supplied
 * `headingLevel`. Data must never carry a presentation prop.
 */
export type CardInfo = Omit<DefaultCardProps, "headingLevel">;

/** One arm of `CardData` — a project card, tagged `kind: "project"`. */
export type ProjectCardData = {
  kind: "project";
  cardInfo: CardInfo;
  projectInfo: ProjectCardInfoProps;
};

/** One arm of `CardData` — an experience or recognition card, tagged `kind: "experience"`. */
export type ExperienceCardData = {
  kind: "experience";
  cardInfo: CardInfo;
  expInfo: ExperienceCardInfoProps;
};

/**
 * Both card groups as ONE discriminated union: `kind` says which info payload
 * is present, so consumers narrow on it instead of casting a lookup key.
 */
export type CardData = ProjectCardData | ExperienceCardData;
