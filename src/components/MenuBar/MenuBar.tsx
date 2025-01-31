import './MenuBar.css';

import logo from '../../assets/logo.png';

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

    return (
        <>
            <div className='atual-section'>
                <div className='atual-section__name'>
                    <img src={logo} alt="" />
                    <h2>{sectionName}</h2>
                </div>
                <ul className='atual-section__icons'>
                    {renderIcons()}
                </ul>
            </div>

            <aside className='change-view'>
                <button>Change View</button>
            </aside>
        </>
    )
};
