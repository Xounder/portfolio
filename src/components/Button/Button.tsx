import './Button.css';

type ButtonProps = {
    text: string;
    size: [number, number];
    fontSize: number
    onClick: () => void;
}

export const Button = ({ text, size, fontSize, onClick }: ButtonProps) => {
    return (
        <button className="button" onClick={onClick} style={{padding: `${size[0]}em ${size[1]}em`, fontSize: `${fontSize}em`}}>
            {text}
        </button>
    );
};

