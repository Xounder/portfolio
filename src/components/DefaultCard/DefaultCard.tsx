import './DefaultCard.css';

import type { DefaultCardProps } from '../../data/types';

export const DefaultCard = ({ image, title, description, link, component, headingLevel }: DefaultCardProps) => {
    const HeadingTag = headingLevel;
    
    return (
        <a className="default-card" href={link} target="_blank" rel="noopener noreferrer">
            {/* HTML5 anchors permit flow content: keep the existing anchor and its
                direct child/class, including the OOS-4 nested buttons, unchanged. */}
            <article className='default-card__content'>
                <div className='default-card__content__image'>
                    <img src={image.img} alt="" aria-hidden="true" />
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
            </article>
            
        </a>
    );
};
