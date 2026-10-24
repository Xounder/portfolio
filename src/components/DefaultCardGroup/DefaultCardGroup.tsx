import "./DefaultCardGroup.css";

import type { ReactElement } from "react";

import { DefaultCard } from "../DefaultCard/DefaultCard";
import { ProjectCardInfo } from "../ProjectCardInfo/ProjectCardInfo";
import { ExperienceCardInfo } from "../ExperienceCardInfo/ExperienceCardInfo";

import { ProjectsCards } from "../../data/data";
import { ExperiencesCards } from "../../data/data";
import { RecognitionsCards } from "../../data/data";
import type { CardData } from "../../data/types";
import type { HeadingLevel } from "../../types/heading";

/** The card groups this component can render. About Me / Contact are page-level. */
type CardGroupName = "Projects" | "Experiences" | "Recognitions";

type CardDataMap = Record<
  CardGroupName,
  { cards: readonly CardData[]; component: (index: number) => ReactElement }
>;

const cardDataMap: CardDataMap = {
  Projects: {
    cards: ProjectsCards,
    component: (index: number) => (
      <ProjectCardInfo technologies={ProjectsCards[index].projectInfo.technologies} />
    ),
  },
  Experiences: {
    cards: ExperiencesCards,
    component: (index: number) => (
      <ExperienceCardInfo info={ExperiencesCards[index].expInfo.info} />
    ),
  },
  Recognitions: {
    cards: RecognitionsCards,
    component: (index: number) => (
      <ExperienceCardInfo info={RecognitionsCards[index].expInfo.info} />
    ),
  },
};

type DefaultCardGroupProps = {
  cardType: CardGroupName;
  headingLevel: HeadingLevel;
};

export const DefaultCardGroup = ({ cardType, headingLevel }: DefaultCardGroupProps) => {
  const selectedData = cardDataMap[cardType];

  return (
    <div className={`group-cards${selectedData.cards.length === 1 ? "" : " group-cards--multiple"}`}>
      {selectedData.cards.map((card, index) => (
        <DefaultCard
          key={`${card.cardInfo.link}:${card.cardInfo.title}`}
          image={card.cardInfo.image}
          title={card.cardInfo.title}
          description={card.cardInfo.description}
          link={card.cardInfo.link}
          component={selectedData.component(index)}
          headingLevel={headingLevel}
        />
      ))}
    </div>
  );
};
