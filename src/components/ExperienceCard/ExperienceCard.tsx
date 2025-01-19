import './ExperienceCard.css';
import { Button } from '../Button/Button';

interface ExperienceCardProps {
    image: string;
    title: string;
    description: string;
    info: [string, string];
}

export const ExperienceCard = ({ image, title, description, info }: ExperienceCardProps) => {
    return (
        <div className='experience-card'>
            <div className='experience-card__content'>
                <img src={image} alt={title} />
                <h3>{title}</h3>
                <p>{description.length > 120 ? description.substring(0, 120) + '...' : description}</p>
            </div>
            <div className='experience-card__info'>
                <p>{info[0]}</p>
                <Button text={info[1]} size={[0.5, 1.8]} fontSize={0.7} type='button' onClick={() => {}}></Button>
            </div>
        </div>
    );
};