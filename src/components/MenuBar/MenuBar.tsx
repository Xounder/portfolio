import './MenuBar.css';

import logo from '../../assets/logo.png';

type MenuBarProps = {
    icons: Icons[]
};

type Icons = {
    icon:string;
    alt:string;
}

export const MenuBar = ({icons}: MenuBarProps) => {
    return (
        <>
            <div className='atual-section'>
                <div className='atual-section__name'>
                    <img src={logo} alt="" />
                    <h2>About Me</h2>
                </div>
                <ul className='atual-section__icons'>
                    {icons.map((icon, index) => (
                        <li key={index}><img src={icon.icon} alt={icon.alt}/></li>
                    ))}
                </ul>
            </div>
        </>
    )
};
