import type { HeadingLevel } from '../../types/heading';
import React from "react";
import "./AboutMe.css";

export type AboutMeProps = {
    image: {
        img: string, 
        alt: string
    },
    title: string,
    headingLevel: HeadingLevel;
    description: string[]
}

export const AboutMe = (({image, title, description, headingLevel}: AboutMeProps) => {
    const HeadingTag = headingLevel;
    return (
        <div className="about-me">
            <div className="about-me__image">
                <img src={image.img} alt={image.alt} />
            </div>
            <div className="about-me__content">
                <HeadingTag>{title}</HeadingTag>
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