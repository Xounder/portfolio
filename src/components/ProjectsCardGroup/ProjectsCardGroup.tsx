import "./ProjectsCardGroup.css";

import { DefaultCardGroup } from "../DefaultCardGroup/DefaultCardGroup.tsx";
import { GITHUB_PROFILE_URL } from "../../data/githubProjectsConfig.ts";
import { useGitHubProjects } from "../../hooks/useGitHubProjects.ts";
import type { HeadingLevel } from "../../types/heading.ts";

export type ProjectsCardGroupProps = { headingLevel: HeadingLevel };

export const ProjectsCardGroup = ({ headingLevel }: ProjectsCardGroupProps) => {
  const { cards, isRefreshing, hasError } = useGitHubProjects();

  return (
    <div className="projects-card-group" aria-busy={isRefreshing ? true : undefined}>
      {cards.length > 0 && (
        <DefaultCardGroup cardType="Projects" cards={cards} headingLevel={headingLevel} />
      )}
      {hasError ? (
        <p className="projects-card-group__status" role="status" aria-live="polite">
          {cards.length ? "Unable to refresh projects. Showing cached projects." : "Unable to load projects. Please try again later."}
        </p>
      ) : cards.length === 0 ? (
        isRefreshing ? (
          <p className="projects-card-group__status">Refreshing projects…</p>
        ) : (
          <p className="projects-card-group__status" role="status" aria-live="polite">
            No public projects found.
          </p>
        )
      ) : null}
      <a className="projects-card-group__link" href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer">
        View all projects on GitHub
      </a>
    </div>
  );
};
