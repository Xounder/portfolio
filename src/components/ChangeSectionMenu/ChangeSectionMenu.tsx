import './ChangeSectionMenu.css';
import { SectionButton } from '../SectionButton/SectionButton';
import { SectionButtonProps } from '../SectionButton/SectionButton';

export const ChangeSectionMenu = ({ icon, alt, onClick }: SectionButtonProps) => {
    return (
        <div className="change-section-menu">
            <ul className='change-section-menu__items'>
                <a href=""><li>About Me</li></a>
                <a href=""><li>Projects</li></a>
                <a href=""><li>Experiences</li></a>
                <a href=""><li>Certificates/Awards</li></a>
                <a href=""><li>Contact</li></a>
            </ul>
            <div className='change-section-menu__button'>
                <SectionButton icon={icon} alt={alt} onClick={onClick}/>
            </div>
        </div>
    );
};