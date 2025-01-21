import './MenuSectionButton.css';

import { DefaultSectionButton, DefaultSectionButtonProps } from '../DefaultSectionButton/DefaultSectionButton';

export const MenuSectionButton = ({ icon, alt, onClick }: DefaultSectionButtonProps) => {
    return (
        <div className='menu-section'>
            <ul className='menu-section__items'>
                <a href=""><li>About Me</li></a>
                <a href=""><li>Projects</li></a>
                <a href=""><li>Experiences</li></a>
                <a href=""><li>Certificates/Awards</li></a>
                <a href=""><li>Contact</li></a>
            </ul>
            <div className='menu-section__button'>
                <DefaultSectionButton icon={icon} alt={alt} onClick={onClick}/>
            </div>
        </div>
    );
};