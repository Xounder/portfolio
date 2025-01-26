import './MenuSectionButton.css';

import { DefaultSectionButton } from '../DefaultSectionButton/DefaultSectionButton';
import { useState } from 'react';

export const MenuSectionButton = ({ icon, alt, setCurrentSection }: { icon: string, alt: string, setCurrentSection: React.Dispatch<React.SetStateAction<string>> }) => {
    const [isActive, setIsActive] = useState(false);

    const changeCurrentSection = (sectionName: string) => {
        setCurrentSection(sectionName);
        setIsActive(false);
    }

    return (
        <div className='menu-section'>
            {isActive && (<ul className='menu-section__items'>
                <button onClick={() => changeCurrentSection('About Me')}><li>About Me</li></button>
                <button onClick={() => changeCurrentSection('Projects')}><li>Projects</li></button>
                <button onClick={() => changeCurrentSection('Experiences')}><li>Experiences</li></button>
                <button onClick={() => changeCurrentSection('Recognitions')}><li>Certificates/Awards</li></button>
                <button onClick={() => changeCurrentSection('Contact')}><li>Contact</li></button>
                <button onClick={() => setIsActive(!isActive)}><li>Close</li></button>
            </ul>)}
            <div className='menu-section__button'>
                <DefaultSectionButton icon={icon} alt={alt} onClick={() => setIsActive(!isActive)} />
            </div>
        </div>
    );
};
