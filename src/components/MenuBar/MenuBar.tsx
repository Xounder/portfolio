import './MenuBar.css';

import logo from '../../assets/logo.png';
import { useEffect, useState } from 'react';

type MenuBarProps = {
    sectionName: string;
    icons: Icon[]
};

export type Icon = {
    icon:string;
    alt:string;
    link?:string;
}

export const MenuBar = ({sectionName, icons}: MenuBarProps) => {
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

    useEffect(() => {
        setIsVisible(false);
        setTimeout(() => setIsVisible(true), 200);
    }, [sectionName]);

    return (
        <>
            <div className='atual-section'>
                <img src={logo} alt="" />
                <div className='atual-section__content'>
                    <h2 className={isVisible ? 'visible' : ''}>{sectionName}</h2>
                    <ul className={`atual-section__content__icons ${isVisible ? 'visible' : ''}`}>
                        {renderIcons()}
                    </ul>
                </div>
            </div>

            <aside className='change-view'>
                <button>Change View</button>
            </aside>
        </>
    )
};
