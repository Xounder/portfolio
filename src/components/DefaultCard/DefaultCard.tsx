import './DefaultCard.css';

import type { DefaultCardProps } from '../../data/types';

export const DefaultCard = ({ image, title, description, link, component, headingLevel }: DefaultCardProps) => {
    const HeadingTag = headingLevel;
    
    return (
        <a className="default-card" href={link} target="_blank" rel="noopener noreferrer">
            <div className='default-card__content'>
                <div className='default-card__content__image'>
                    <img src={image.img} alt={image.alt} />
                </div>
                <div className='default-card__content__'>
                    <div className='default-card__content__text'>
                        <HeadingTag>{title}</HeadingTag>
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
