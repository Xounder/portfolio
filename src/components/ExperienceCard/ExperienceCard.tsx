import './ExperienceCard.css';

import { Button } from '../Button/Button';
import { DefaultCard, DefaultCardProps } from '../DefaultCard/DefaultCard';

interface ExperienceCardProps {
    cardInfo: DefaultCardProps
    info: { type: string, yearPeriod: string };
}

export const ExperienceCard = ({ cardInfo: { image, title, description }, info }: ExperienceCardProps) => {
    return (
        <div className='experience-card'>
            <DefaultCard 
                image={image}
                title={title} 
                description={description}
            />
            <div className='experience-card__info'>
                <p>{info.type}</p>
                <Button 
                    text={info.yearPeriod} 
                    size={[0.5, 1.8]} 
                    fontSize={0.7} 
                    type='button' 
                    onClick={() => {}}
                />
            </div>
        </div>
    );
};