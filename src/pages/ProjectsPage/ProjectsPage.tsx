import { DefaultCard } from "../../components/DefaultCard/DefaultCard";
import { ProjectCardInfo } from "../../components/ProjectCardInfo/ProjectCardInfo";

export const ProjectsPage = () => {
    return (
        <>
            <DefaultCard 
            image= {{
                img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
                alt: 'FrontEnd Developer' 
            }}
            title= 'Sasdas Developer'
            description=""
            link="https://github.com/Xounder"
            component={<ProjectCardInfo tecnologies={['React', 'TypeScript', 'Vite', 'Tailwind', 'Angular', 'React', 'TypeScript', 'Vite', 'Tailwind', 'Angular']}/>}
            />
            <DefaultCard 
            image= {{
                img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
                alt: 'FrontEnd Developer' 
            }}
            title= 'Sasdas Developer'
            description=""
            link="https://github.com/Xounder"
            component={<ProjectCardInfo tecnologies={['React', 'TypeScript', 'Vite', 'Tailwind', 'Angular', 'React', 'TypeScript', 'Vite', 'Tailwind', 'Angular']}/>}
            />
        </>
    );
}