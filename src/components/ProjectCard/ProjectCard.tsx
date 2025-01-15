import './ProjectCard.css';
import { Button } from '../Button/Button';

interface ProjectCardProps {
    image: string;
    title: string;
    description: string;
    tecnologies: string[];
    link: string;
}

export const ProjectCard = ({ image, title, description, tecnologies, link }: ProjectCardProps) => {
    return (
        <a className="project-card" href={link} target="_blank" rel="noopener noreferrer">
            <div className='project-card__content'>
                <img src={image} alt={title} />
                <h3>{title}</h3>
                <p>{description.length > 120 ? description.substring(0, 120) + '...' : description}</p>
            </div>
            <ul className='project-card__tecnologies'>
                {tecnologies.map((tecnology, index) => (
                    <li key={index}><Button text={tecnology} size={[0.6, 1.3]} fontSize={0.7} onClick={() => {}}></Button></li>
                ))}
            </ul>
        </a>
    );
};