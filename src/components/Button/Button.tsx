import './Button.css';

type ButtonProps = {
    text: string;
    type: 'button' | 'submit';
    onClick: () => void;
}

export const Button = ({ text, type,  onClick }: ButtonProps) => {
    return (
        <button type={type} className="button" onClick={onClick}>
            {text}
        </button>
    );
};

