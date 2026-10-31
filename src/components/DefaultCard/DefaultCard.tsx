import './DefaultCard.css';

import type { DefaultCardProps } from '../../data/types';
import { useState } from 'react';

export const DefaultCard = ({ image, title, description, link, component, headingLevel }: DefaultCardProps) => {
    const HeadingTag = headingLevel;
    // Scope the failure to this card and attempted cover; changing either resets it.
    const imageKey = `${link ?? ''}\u0000${title}\u0000${image.img}\u0000${image.fallbackImg ?? ''}`;
    const [failedKey, setFailedKey] = useState<string | null>(null);
    const useFallback = failedKey === imageKey && !!image.fallbackImg && image.fallbackImg !== image.img;
    const src = useFallback ? image.fallbackImg : image.img;
    
    return (
        <a className="default-card" href={link} target="_blank" rel="noopener noreferrer">
            {/* HTML5 anchors permit flow content: keep the existing anchor and its
                direct child/class, including the OOS-4 nested buttons, unchanged. */}
            <article className='default-card__content'>
                <div className='default-card__content__image'>
                    <img src={src} alt="" aria-hidden="true" width={image.width} height={image.height} loading="lazy" decoding="async"
                        onError={image.fallbackImg && !useFallback && image.fallbackImg !== image.img ? event => {
                            // Ignore a late error from an image that has since been replaced.
                            if (event.currentTarget.getAttribute('src') === image.img) setFailedKey(imageKey);
                        } : undefined} />
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
