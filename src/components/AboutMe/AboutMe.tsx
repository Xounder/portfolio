import React from "react";
import "./AboutMe.css";

export type AboutMeProps = {
    image: {
        img: string, 
        alt: string
    },
    title: string,
    description: string[]
}

export const AboutMe = (({image, title, description}: AboutMeProps) => {
    return (
        <div className="about-me">
            <div className="about-me__image">
                <img src={image.img} alt={image.alt} />
            </div>
            <div className="about-me__content">
                <h2>{title}</h2>
                <p>
                    {description.map((text, index) => (
                        <React.Fragment key={index}>
                            {text}
                            <br />
                            <br />
                        </React.Fragment>
                    ))}    
                </p>
            </div>
        </div>
    );
});