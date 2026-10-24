import { MENU_FADE_DELAY_MS } from '../../data/motion';
import './MenuBar.css';

import logo from '../../assets/logo.webp';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { SectionName } from '../../data/sections';
import type { Icon } from '../../data/iconsData';

type MenuBarProps = {
    sectionName: string;
    icons: Icon[];
    /** Optional: only the home page needs to reset the section; the scroll page has no section state to reset. */
    menuSetCurrentSection?: (sectionName: SectionName) => void;
};


export const MenuBar = ({sectionName, icons, menuSetCurrentSection}: MenuBarProps) => {
    const [isVisible, setIsVisible] = useState(false);
    // TASK-10 / W2.11 — destination derived from the router instead of a
    // stringly-typed route prop compared with mixed strict/loose equality.
    // MenuBar only ever renders on `/` and `/scroll` (main.tsx routes).
    const location = useLocation();
    const isHomeRoute = location.pathname === '/';

    const renderIcons = () => {
      return icons.map((icon) => {
        const content = icon.link ? (
          <a href={icon.link} target="_blank" rel="noopener noreferrer">
            <img src={icon.icon} alt={icon.alt} />
          </a>
        ) : (
          <img src={icon.icon} alt={icon.alt} />
        );

        return <li key={icon.alt}>{content}</li>;
      });
    };

    const navigateToStart = () => {
      if (isHomeRoute) {
        menuSetCurrentSection?.("About Me");
      } else {
        window.scrollTo(0, 0);
      }
    };

    useEffect(() => {
        setIsVisible(false);
        const timerId = setTimeout(() => setIsVisible(true), MENU_FADE_DELAY_MS);
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
                <Link to={isHomeRoute ? "/scroll" : "/"}><button type="button">Change View</button></Link>
            </aside>
        </>
    )
};
