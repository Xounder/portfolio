import './MenuSectionButton.css';

import { DefaultSectionButton } from '../DefaultSectionButton/DefaultSectionButton';
import { useState } from 'react';
import { sections } from '../../data/sections';

type MenuSectionButtonProps = {
    icon: string;
    alt: string;
    currentSection: string;
    setCurrentSection: React.Dispatch<React.SetStateAction<string>>;
};

export const MenuSectionButton = ({ icon, alt, currentSection, setCurrentSection }: MenuSectionButtonProps) => {
    const [isActive, setIsActive] = useState(false);

    const changeCurrentSection = (sectionName: string) => {
        setCurrentSection(sectionName);
        setIsActive(false);
    }

    return (
        <div className='menu-section'>
            {isActive && (
                <ul className='menu-section__items'>
                    {sections.map((section) => {
                        if (section === currentSection) return null;
                        return (
                            <button key={section} onClick={() => changeCurrentSection(section)}>
                                <li>{section}</li>
                            </button>
                        );
                    })}
                    <button onClick={() => setIsActive(!isActive)}>
                        <li>Close</li>
                    </button>
                </ul>
            )}
            <div className='menu-section__button'>
                <DefaultSectionButton icon={icon} alt={alt} onClick={() => setIsActive(!isActive)} />
            </div>
        </div>
    );
};
