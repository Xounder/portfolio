import "./DefaultCardGroup.css";

import { DefaultCard } from "../DefaultCard/DefaultCard";
import { ProjectCardInfo } from "../ProjectCardInfo/ProjectCardInfo";
import { ExperienceCardInfo } from "../ExperienceCardInfo/ExperienceCardInfo";

import { ProjectsCards, ProjectsContent } from "../../data/data";
import { ExperiencesCards, ExperiencesContent } from "../../data/data";
import { RecognitionsCards, RecognitionsContent } from "../../data/data";

const cardDataMap = {
  Projects: {
    cards: ProjectsCards,
    content: ProjectsContent,
    component: (index: number) => (
      <ProjectCardInfo technologies={ProjectsContent[index].technologies} />
    ),
  },
  Experiences: {
    cards: ExperiencesCards,
    content: ExperiencesContent,
    component: (index: number) => (
      <ExperienceCardInfo info={ExperiencesContent[index].info} />
    ),
  },
  Recognitions: {
    cards: RecognitionsCards,
    content: RecognitionsContent,
    component: (index: number) => (
      <ExperienceCardInfo info={RecognitionsContent[index].info} />
    ),
  },
};

export const DefaultCardGroup = ({ cardType }: { cardType: string }) => {
  const selectedData = cardDataMap[cardType as keyof typeof cardDataMap];

  const justifyContent = selectedData.cards.length === 1 ? "center" : "start";

  return (
    <div className="group-cards" style={{ justifyContent: justifyContent }}>
      {selectedData &&
        selectedData.cards.map((card, index) => (
          <DefaultCard
            key={index}
            image={{
              img: card.image.img,
              alt: card.image.alt,
            }}
            title={card.title}
            description={card.description}
            link={card.link}
            component={selectedData.component(index)}
          />
        ))}
    </div>
  );
};
