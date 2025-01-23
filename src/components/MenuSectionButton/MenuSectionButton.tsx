import './MenuSectionButton.css';

import { DefaultSectionButton } from '../DefaultSectionButton/DefaultSectionButton';
import { useState } from 'react';

export const MenuSectionButton = ({ icon, alt}: { icon: string, alt: string}) => {
    const [isActive, setIsActive] = useState(false);

    return (
        <div className='menu-section'>
            {isActive && (<ul className='menu-section__items'>
                <a href=""><li>About Me</li></a>
                <a href=""><li>Projects</li></a>
                <a href=""><li>Experiences</li></a>
                <a href=""><li>Certificates/Awards</li></a>
                <a href=""><li>Contact</li></a>
            </ul>)}
            <div className='menu-section__button'>
                <DefaultSectionButton icon={icon} alt={alt} onClick={() => setIsActive(!isActive)}/>
            </div>
        </div>
    );
};