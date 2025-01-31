import { DefaultCard } from "../../components/DefaultCard/DefaultCard";
import { ExperienceCardInfo } from "../../components/ExperienceCardInfo/ExperienceCardInfo";
import { ExperiencesContent } from "../../data/data";
import { ExperiencesCards } from "../../data/data";

export const ExperiencesPage = () => {
    return (
      <>
        {ExperiencesCards.map((card, index) => (
          <DefaultCard 
            key={index}
            image={card.image}
            title={card.title}
            description={card.description}
            link={card.link}
            component={<ExperienceCardInfo info={ExperiencesContent[index].info}/>}
          />
        ))}
      </>
    );
}