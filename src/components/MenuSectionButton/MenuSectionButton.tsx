import './MenuSectionButton.css';

import { DefaultSectionButton } from '../DefaultSectionButton/DefaultSectionButton';
import { useState } from 'react';
import { sections } from '../../data/sections';

type MenuSectionButtonProps = {
    icon: string;
    alt: string;
    setCurrentSection: React.Dispatch<React.SetStateAction<string>>;
};

export const MenuSectionButton = ({ icon, alt, setCurrentSection }: MenuSectionButtonProps) => {
    const [isActive, setIsActive] = useState(false);

    const changeCurrentSection = (sectionName: string) => {
        setCurrentSection(sectionName);
        setIsActive(false);
    }

    return (
        <div className='menu-section'>
            {isActive && (
                <nav>
                    <ul className='menu-section__items'>
                        {sections.map((section) => {
                            return (
                                <button key={section} onClick={() => changeCurrentSection(section)}>
                                    <li>{section}</li>
                                </button>
                            );
                        })}
                    </ul>
                </nav>
            )}
            <div className='menu-section__button'>
                <DefaultSectionButton icon={icon} alt={alt} onClick={() => setIsActive(!isActive)} />
            </div>
        </div>
    );
};
