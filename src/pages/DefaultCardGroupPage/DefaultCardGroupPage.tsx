import { useRef } from "react";
import "./DefaultCardGroupPage.css";

import { DefaultCard } from "../../components/DefaultCard/DefaultCard";

import { ProjectCardInfo } from "../../components/ProjectCardInfo/ProjectCardInfo";
import { ProjectsContent } from "../../data/data";
import { ProjectsCards } from "../../data/data";

import { ExperienceCardInfo } from "../../components/ExperienceCardInfo/ExperienceCardInfo";
import { ExperiencesContent } from "../../data/data";
import { ExperiencesCards } from "../../data/data";

import { RecognitionsContent } from "../../data/data";
import { RecognitionsCards } from "../../data/data";

export const DefaultCardGroupPage = ({cardType} : {cardType: string}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = (event: React.WheelEvent) => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop += event.deltaY;
      }
    };

    return (
        <>
            <div className="group-cards" ref={scrollRef} onWheel={handleScroll}>
                {cardType === "Projects" && ProjectsCards.map((card, index) => (
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

                {cardType === "Experiences" && ExperiencesCards.map((card, index) => (
                    <DefaultCard 
                    image= {{
                        img: card.image.img,
                        alt: card.image.alt
                    }}
                    title= {card.title}
                    description= {card.description}
                    link= {card.link}
                    component={<ExperienceCardInfo info={ExperiencesContent[index].info}/>}
                    />
                ))}

                {cardType === "Recognitions" && RecognitionsCards.map((card, index) => (
                    <DefaultCard 
                    image= {{
                        img: card.image.img,
                        alt: card.image.alt
                    }}
                    title= {card.title}
                    description= {card.description}
                    link= {card.link}
                    component={<ExperienceCardInfo info={RecognitionsContent[index].info}/>}
                    />  
                ))}
            </div>
        </>
    );
}