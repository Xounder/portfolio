import './ArrowSectionButton.css';

import { DefaultSectionButton, DefaultSectionButtonProps } from '../DefaultSectionButton/DefaultSectionButton';

export const ArrowSectionButton = ({ icon, alt, onClick }: DefaultSectionButtonProps) => {
    return (
        <nav className='arrow-section'>
            <DefaultSectionButton icon={icon} alt={alt} onClick={onClick} />
        </nav>
    );
};