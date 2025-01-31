import { DefaultCard } from "../../components/DefaultCard/DefaultCard";
import { ProjectCardInfo } from "../../components/ProjectCardInfo/ProjectCardInfo";
import { ProjectsContent } from "../../data/data";
import { ProjectsCards } from "../../data/data";

export const ProjectsPage = () => {
    return (
        <>
            {ProjectsCards.map((card, index) => (
                <DefaultCard 
                image= {{
                    img: card.image.img,
                    alt: card.image.alt
                }}
                title= {card.title}
                description= {card.description}
                link= {card.link}
                component={<ProjectCardInfo tecnologies={ProjectsContent[index].tecnologies}/>}
                />
            ))}
        </>
    );
}