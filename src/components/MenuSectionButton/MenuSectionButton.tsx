import "./MenuSectionButton.css";

import { DefaultSectionButton } from "../DefaultSectionButton/DefaultSectionButton";
import { useState } from "react";
import { sections, type SectionName } from "../../data/sections";

type MenuSectionButtonProps = {
  icon: string;
  alt: string;
  menuSetCurrentSection: (sectionName: SectionName) => void;
  ariaHidden?: boolean;
};

export const MenuSectionButton = ({
  icon,
  alt,
  menuSetCurrentSection,
  ariaHidden,
}: MenuSectionButtonProps) => {
  const [isActive, setIsActive] = useState(false);

  const changeCurrentSection = (sectionName: SectionName) => {
    menuSetCurrentSection(sectionName);
    setIsActive(false);
  };

  return (
    <div className="menu-section">
      {isActive && (
        <nav>
          <ul className="menu-section__items">
            {sections.map((section) => {
              return (
                <li key={section}>
                  <button type="button" onClick={() => changeCurrentSection(section)}>
                    {section}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
      <div className="menu-section__button">
        <DefaultSectionButton
          icon={icon}
          alt={alt}
          ariaHidden={ariaHidden}
          onClick={() => setIsActive(!isActive)}
        />
      </div>
    </div>
  );
};
