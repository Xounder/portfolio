import './ChangeSectionMenu.css';
import { SectionButton } from '../SectionButton/SectionButton';
import { SectionButtonProps } from '../SectionButton/SectionButton';

export const ChangeSectionMenu = ({ icon, alt, onClick }: SectionButtonProps) => {
    return (
        <div className="change-section-menu">
            <div className='change-section-menu__button'>
                <SectionButton icon={icon} alt={alt} onClick={onClick}/>
            </div>
            <ul className='change-section-menu__items'>
                <li><a href="">About Me</a></li>
                <li><a href="">Projects</a></li>
                <li><a href="">Experiences</a></li>
                <li><a href="">Certificates/Awards</a></li>
                <li><a href="">Contact</a></li>
            </ul>
        </div>
    );
};