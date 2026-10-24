import "./DefaultCardGroup.css";

import { DefaultCard } from "../DefaultCard/DefaultCard";
import { ProjectCardInfo } from "../ProjectCardInfo/ProjectCardInfo";
import { ExperienceCardInfo } from "../ExperienceCardInfo/ExperienceCardInfo";

import { ProjectsCards } from "../../data/data";
import { ExperiencesCards } from "../../data/data";
import { RecognitionsCards } from "../../data/data";

const cardDataMap = {
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

type CardType = keyof typeof cardDataMap;
const isValidCardType = (value: string): value is CardType => value in cardDataMap;

export const DefaultCardGroup = ({ cardType }: { cardType: string }) => {
  if (!isValidCardType(cardType)) return null;
  const selectedData = cardDataMap[cardType];

  const justifyContent = selectedData.cards.length === 1 ? "center" : "start";

  return (
    <div className="group-cards" style={{ justifyContent: justifyContent }}>
      {selectedData &&
        selectedData.cards.map((card, index) => (
          <DefaultCard
            key={index}
            image={card.cardInfo.image}
            title={card.cardInfo.title}
            description={card.cardInfo.description}
            link={card.cardInfo.link}
            component={selectedData.component(index)}
          />
        ))}
    </div>
  );
};
