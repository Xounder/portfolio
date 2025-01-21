import './ProjectCard.css';

import { Button } from '../Button/Button';
import { DefaultCard, DefaultCardProps } from '../DefaultCard/DefaultCard';

interface ProjectCardProps {
    cardInfo: DefaultCardProps;
    tecnologies: string[];
    link: string;
}

export const ProjectCard = ({ cardInfo: { image, title, description }, tecnologies, link }: ProjectCardProps) => {
    const VISIBLE_LIMIT = 6;
    const visibleTecnologies = tecnologies.slice(0, VISIBLE_LIMIT);
    const hiddenTecnologies = tecnologies.slice(VISIBLE_LIMIT);

    return (
        <a className="project-card" href={link} target="_blank" rel="noopener noreferrer">
            <DefaultCard image={image} title={title} description={description} />
            <ul className="project-card__tecnologies">
                {visibleTecnologies.map((tecnology, index) => (
                    <li key={index}>
                        <Button
                            text={tecnology}
                            size={[0.6, 1.3]}
                            fontSize={0.7}
                            type="button"
                            onClick={() => {}}
                        />
                    </li>
                ))}
                {hiddenTecnologies.length > 0 && (
                    <li>
                        <Button
                            text={`More ${hiddenTecnologies.length}`}
                            size={[0.6, 1.3]}
                            fontSize={0.7}
                            type="button"
                            onClick={() => {}} // Mostrar todas as tecnologias
                        />
                    </li>
                )}
            </ul>
        </a>
    );
};