import './DefaultCard.css';

import { ReactElement } from 'react';

export interface DefaultCardProps {
    image: { img:string, alt:string }
    title: string;
    description: string;
    link: string;
    component?: ReactElement
}
export const DefaultCard = ({ image, title, description, component}: DefaultCardProps) => {
    return (
        <a className="default-card" href={'/'} target="_blank" rel="noopener noreferrer">
            <div className='default-card__content'>
                <img src={image.img} alt={image.alt} />
                <div className='default-card__content__text'>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <div className="default-card__component">
                        {component}
                    </div>
                </div>
            </div>
            
        </a>
    );
};
