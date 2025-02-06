import './DefaultCard.css';

import { ReactElement } from 'react';

export interface DefaultCardProps {
    image: { img:string, alt:string }
    title: string;
    description: string;
    link?: string;
    component?: ReactElement
}
export const DefaultCard = ({ image, title, description, link, component}: DefaultCardProps) => {
    
    return (
        <a className="default-card" href={link} target="_blank" rel="noopener noreferrer">
            <div className='default-card__content'>
                <div className='default-card__content__image'>
                    <img src={image.img} alt={image.alt} />
                </div>
                <div className='default-card__content__'>
                    <div className='default-card__content__text'>
                        <h3>{title}</h3>
                        <p>{description}</p>
                    </div>
                    <div className="default-card__content__component">
                        {component}
                    </div>
                </div>
            </div>
            
        </a>
    );
};
