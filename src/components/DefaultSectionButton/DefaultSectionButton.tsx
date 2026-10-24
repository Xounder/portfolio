import './DefaultSectionButton.css';

export type DefaultSectionButtonProps = {
    icon: string;
    alt: string;
    onClick: () => void;
};

export const DefaultSectionButton = ({ icon, alt, onClick }: DefaultSectionButtonProps) => {
    return (
        <button type="button" className='default-section-button' onClick={onClick}>
            <img src={icon} alt={alt} />
        </button>
    );
};