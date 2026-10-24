import "./AboutMe.css";
import type { AboutMeProps } from "../../data/types";

export const AboutMe = (({image, title, description, headingLevel}: AboutMeProps) => {
    const HeadingTag = headingLevel;

    return (
        <div className="about-me">
            <div className="about-me__image">
                <img src={image.img} alt={image.alt} />
            </div>
            <div className="about-me__content">
                <HeadingTag>{title}</HeadingTag>
                {description.map((text) => (
                    <p key={text}>{text}</p>
                ))}
            </div>
        </div>
    );
});
