import './ProjectCardInfo.css';

import { Button } from '../Button/Button';

export type ProjectCardInfoProps = {
    technologies: string[];
}

export const ProjectCardInfo = ({ technologies }: ProjectCardInfoProps) => {
    const VISIBLE_LIMIT = 5;
    const visibletechnologies = technologies.slice(0, VISIBLE_LIMIT);
    const hiddentechnologies = technologies.slice(VISIBLE_LIMIT);

    return (
        <div className="project-card">
            <ul className="project-card__technologies">
                {visibletechnologies.map((tecnology, index) => (
                    <li key={index}>
                        <Button
                            text={tecnology}
                            type="button"
                            onClick={() => {}}
                        />
                    </li>
                ))}
                {hiddentechnologies.length > 0 && (
                    <li>
                        <Button
                            text={`More ${hiddentechnologies.length}`}
                            type="button"
                            onClick={() => {}} // Mostrar todas as tecnologias
                        />
                    </li>
                )}
            </ul>
        </div>
    );
};