import './ProjectCardInfo.css';

import { Button } from '../Button/Button';
import type { ProjectCardInfoProps } from '../../data/types';

export const ProjectCardInfo = ({ technologies }: ProjectCardInfoProps) => {
    const VISIBLE_LIMIT = 5;
    const visibletechnologies = technologies.slice(0, VISIBLE_LIMIT);
    const hiddentechnologies = technologies.slice(VISIBLE_LIMIT);

    return (
        <div className="project-card">
            <ul className="project-card__technologies">
                {visibletechnologies.map((tecnology) => (
                    <li key={tecnology}>
                        <Button
                            text={tecnology}
                            type="button"
                        />
                    </li>
                ))}
                {hiddentechnologies.length > 0 && (
                    <li>
                        {/* Mostrar todas as tecnologias */}
                        <Button
                            text={`More ${hiddentechnologies.length}`}
                            type="button"
                        />
                    </li>
                )}
            </ul>
        </div>
    );
};
