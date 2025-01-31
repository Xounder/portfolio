import { DefaultCard } from "../../components/DefaultCard/DefaultCard";
import { ExperienceCardInfo } from "../../components/ExperienceCardInfo/ExperienceCardInfo";
import { RecognitionsContent } from "../../data/data";
import { RecognitionsCards } from "../../data/data";

export const RecognitionsPage = () => {
    return (
      <>
        {RecognitionsCards.map((card, index) => (
          <DefaultCard
            key={index}
            image={card.image}
            title={card.title}
            description={card.description}
            link={card.link}
            component={<ExperienceCardInfo info={RecognitionsContent[index].info} />}
          />
        ))}
      </>
    );
}