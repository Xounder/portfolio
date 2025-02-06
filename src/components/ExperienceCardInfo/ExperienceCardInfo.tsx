import './ExperienceCardInfo.css';

import { Button } from '../Button/Button';

export interface ExperienceCardInfoProps {
    info: { type: string, yearPeriod: string };
}

export const ExperienceCardInfo = ({ info }: ExperienceCardInfoProps) => {
    return (
        <div className="experience-card__info">
            <p>{info.type}</p>
            <Button 
                text={info.yearPeriod} 
                type="button"
                onClick={() => {}}
            />
        </div>
    );
};