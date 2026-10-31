import "./DefaultCardGroup.css";

import type { ReactElement } from "react";

import { DefaultCard } from "../DefaultCard/DefaultCard";
import { ProjectCardInfo } from "../ProjectCardInfo/ProjectCardInfo";
import { ExperienceCardInfo } from "../ExperienceCardInfo/ExperienceCardInfo";

import { ExperiencesCards } from "../../data/data";
import { RecognitionsCards } from "../../data/data";
import type { CardData } from "../../data/types";
import type { HeadingLevel } from "../../types/heading";

/** The card groups this component can render. About Me / Contact are page-level. */
type CardGroupName = "Projects" | "Experiences" | "Recognitions";

const renderInfo = (card: CardData): ReactElement | null => {
  switch (card.kind) {
    case "project":
      return <ProjectCardInfo technologies={card.projectInfo.technologies} />;
    case "experience":
      return <ExperienceCardInfo info={card.expInfo.info} />;
    default:
      // Malformed runtime data should leave the info slot empty.
      return null;
  }
};

type CardDataMap = Record<
  CardGroupName,
  { cards: readonly CardData[]; renderInfo: (card: CardData) => ReactElement | null }
>;

const cardDataMap: CardDataMap = {
  Projects: {
    cards: [],
    renderInfo,
  },
  Experiences: {
    cards: ExperiencesCards,
    renderInfo,
  },
  Recognitions: {
    cards: RecognitionsCards,
    renderInfo,
  },
};

export type DefaultCardGroupProps = {
  cardType: CardGroupName;
  cards?: readonly CardData[];
  headingLevel: HeadingLevel;
};

export const DefaultCardGroup = ({ cardType, cards, headingLevel }: DefaultCardGroupProps) => {
  const selectedData = cardDataMap[cardType];
  const renderedCards = cards ?? selectedData.cards;

  return (
    <div className={`group-cards${renderedCards.length === 1 ? "" : " group-cards--multiple"}`}>
      {renderedCards.map((card) => (
        <DefaultCard
          key={`${card.cardInfo.link}:${card.cardInfo.title}`}
          image={card.cardInfo.image}
          title={card.cardInfo.title}
          description={card.cardInfo.description}
          link={card.cardInfo.link}
          component={selectedData.renderInfo(card) ?? undefined}
          headingLevel={headingLevel}
        />
      ))}
    </div>
  );
};
