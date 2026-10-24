import './MenuBar.css';

import logo from '../../assets/logo.webp';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SectionName } from '../../data/sections';
import type { Icon } from '../../types/icons';


type MenuBarProps = {
    sectionName: string;
    icons: Icon[];
    atualPage: string;
    menuSetCurrentSection: (sectionName: SectionName) => void;
};



export const MenuBar = ({sectionName, icons, atualPage, menuSetCurrentSection}: MenuBarProps) => {
    const [isVisible, setIsVisible] = useState(false);

    const renderIcons = () => {
        return icons.map((icon, index) => {
            const content = icon.link ? (
                <a href={icon.link} target="_blank" rel="noopener noreferrer">
                    <img src={icon.icon} alt={icon.alt} />
                </a>
            ) : (
                <img src={icon.icon} alt={icon.alt} />
            );
    
            return <li key={index}>{content}</li>;
        });
    };

    const navigateToStart = () => {
        return atualPage === '/' ? menuSetCurrentSection("About Me") : window.scrollTo(0, 0);
    };

    useEffect(() => {
        setIsVisible(false);
        const timerId = setTimeout(() => setIsVisible(true), 200);
        return () => clearTimeout(timerId);
    }, [sectionName]);

    return (
        <>
            <div className='atual-section'>
                <img src={logo} alt="logo" onClick={() => { navigateToStart() }}/>
                <div className='atual-section__content'>
                    <h1 className={isVisible ? 'visible' : ''}>{sectionName}</h1>
                    <ul className={`atual-section__content__icons ${isVisible ? 'visible' : ''}`}>
                        {renderIcons()}
                    </ul>
                </div>
            </div>

            <aside className='change-view'>
                <Link to={atualPage == '/' ? "/scroll" : "/"}><button type="button">Change View</button></Link>;
            </aside>
        </>
    )
};
