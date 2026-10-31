import placeholderImage from "../assets/images/api-logo.webp";
import { ProjectsCards } from "./data.ts";
import { GITHUB_PROFILE_URL } from "./githubProjectsConfig.ts";
import { getRepositorySlugFromLink, isExcludedRepository } from "./githubProjectsCore.ts";
import type { ProjectPresentationMap, ProjectPresentationOverride } from "./githubTypes.ts";
import type { ProjectCardData } from "./types.ts";

export const PROJECT_PROFILE_URL = GITHUB_PROFILE_URL;

export const projectPlaceholder: ProjectPresentationOverride = {
  image: {
    img: placeholderImage,
    alt: "Project preview placeholder",
    width: 250,
    height: 250,
  },
};

export const staticFeaturedCards: readonly ProjectCardData[] = ProjectsCards.filter(card => {
  const name = getRepositorySlugFromLink(card.cardInfo.link ?? "");
  return name !== null && !isExcludedRepository({
    name,
    topics: [],
    description: card.cardInfo.description,
    fork: false,
    archived: false,
    visibility: "public",
  });
});

export const projectPresentationOverrides: ProjectPresentationMap = new Map(
  staticFeaturedCards.map(card => [
    getRepositorySlugFromLink(card.cardInfo.link ?? "")!,
    {
      title: card.cardInfo.title,
      description: card.cardInfo.description,
      technologies: card.projectInfo.technologies,
      image: card.cardInfo.image,
    },
  ]),
);
