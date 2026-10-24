import './DefaultSectionButton.css';

export type DefaultSectionButtonProps = {
    icon: string;
    alt: string;
    onClick: () => void;
    ariaHidden?: boolean;
};

export const DefaultSectionButton = ({ icon, alt, onClick, ariaHidden }: DefaultSectionButtonProps) => {
    return (
        <button type="button" className='default-section-button' onClick={onClick}>
            <img src={icon} alt={alt} aria-hidden={ariaHidden} />
        </button>
    );
};
