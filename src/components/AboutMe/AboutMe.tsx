import type { AboutMeProps } from "../../data/types";
import React from "react";
import "./AboutMe.css";



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