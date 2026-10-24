import './ExperienceCardInfo.css';

import { Button } from '../Button/Button';
import type { ExperienceCardInfoProps } from '../../data/types';

export const ExperienceCardInfo = ({ info }: ExperienceCardInfoProps) => {
    return (
        <div className="experience-card__info">
            <p>{info.type}</p>
            <Button 
                text={info.yearPeriod} 
                type="button"
            />
        </div>
    );
};
