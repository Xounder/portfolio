import './ProjectCardInfo.css';

import { Button } from '../Button/Button';

export type ProjectCardInfoProps = {
    tecnologies: string[];
}

export const ProjectCardInfo = ({ tecnologies }: ProjectCardInfoProps) => {
    const VISIBLE_LIMIT = 6;
    const visibleTecnologies = tecnologies.slice(0, VISIBLE_LIMIT);
    const hiddenTecnologies = tecnologies.slice(VISIBLE_LIMIT);

    return (
        <div className="project-card">
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
        </div>
    );
};