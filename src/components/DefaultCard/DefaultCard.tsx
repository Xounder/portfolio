import './DefaultCard.css';


export interface DefaultCardProps {
    image: { img:string, alt:string }
    title: string;
    description: string;
}
export const DefaultCard = ({ image, title, description }: DefaultCardProps) => {
    return (
        <div className='default-card'>
            <div className='default-card__content'>
                <img src={image.img} alt={image.alt} />
                <div className='default-card__content__text'>
                    <h3>{title}</h3>
                    <p>{description.length > 120 ? description.substring(0, 120) + '...' : description}</p>
                </div>
            </div>
        </div>
    );
};
