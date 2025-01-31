import "./InfoCard.css";

export const InfoCard = ({info} : {info: string}) => {
    return (
        <div className="info-card">
            <h2>{info}</h2>
        </div>
    );
};