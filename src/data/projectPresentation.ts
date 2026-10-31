import api from "../assets/images/api-logo.webp";
import frontend from "../assets/images/project-frontend.svg";
import fullstack from "../assets/images/project-fullstack.svg";
import games from "../assets/images/project-games.svg";
import misc from "../assets/images/project-misc.svg";
import type { ProjectCategory, ProjectImage } from "./githubTypes.ts";

export const projectCategoryImages: Readonly<Record<ProjectCategory, ProjectImage>> = {
  frontend: { img: frontend, alt: "Frontend project illustration", width: 500, height: 314 },
  fullstack: { img: fullstack, alt: "Full-stack project illustration", width: 500, height: 314 },
  games: { img: games, alt: "Game project illustration", width: 500, height: 314 },
  misc: { img: misc, alt: "Project illustration", width: 500, height: 314 },
  api: { img: api, alt: "API project illustration", width: 250, height: 250 },
};
