import './SectionButton.css';

type SectionButtonProps = {
    icon: string;
    alt: string;
    onClick: () => void;
};

export const SectionButton = ({ icon, alt, onClick }: SectionButtonProps) => {
    return (
        <button className='section-button' onClick={onClick}>
            <img src={icon} alt={alt} />
        </button>
    );
};