import './Button.css';

type ButtonProps = {
    text: string;
    size: [number, number];
    fontSize: number;
    type: 'button' | 'submit';
    onClick: () => void;
}

export const Button = ({ text, size, fontSize, type,  onClick }: ButtonProps) => {
    return (
        <button type={type} className="button" onClick={onClick} style={{padding: `${size[0]}em ${size[1]}em`, fontSize: `${fontSize}em`}}>
            {text}
        </button>
    );
};

