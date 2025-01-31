import { AboutMe } from "../../components/AboutMe/AboutMe";
import { AboutMeContent } from "../../data/data";

export const AboutMePage = () => {
    return (
        <AboutMe 
            image={AboutMeContent.image}
            title={AboutMeContent.title}
            description={AboutMeContent.description}    
        />
    );
};