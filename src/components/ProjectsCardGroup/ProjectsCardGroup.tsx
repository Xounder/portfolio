import "./ProjectsCardGroup.css";

import { DefaultCardGroup } from "../DefaultCardGroup/DefaultCardGroup.tsx";
import { GITHUB_PROFILE_URL } from "../../data/githubProjectsConfig.ts";
import { useGitHubProjects } from "../../hooks/useGitHubProjects.ts";
import type { HeadingLevel } from "../../types/heading.ts";
import githubIcon from "../../assets/icons/github.svg";

export type ProjectsCardGroupProps = { headingLevel: HeadingLevel };

export const ProjectsCardGroup = ({ headingLevel }: ProjectsCardGroupProps) => {
  const { cards, isRefreshing, hasError } = useGitHubProjects();

  return (
    <div className="projects-card-group" aria-busy={isRefreshing ? true : undefined}>
      <DefaultCardGroup
        cardType="Projects"
        cards={cards}
        headingLevel={headingLevel}
        trailingContent={
          <a className="projects-card-group__link" href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer">
            <img src={githubIcon} alt="" aria-hidden="true" />
            <span>View all projects on GitHub</span>
            <span className="projects-card-group__arrow" aria-hidden="true">↗</span>
          </a>
        }
      />
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
    </div>
  );
};
