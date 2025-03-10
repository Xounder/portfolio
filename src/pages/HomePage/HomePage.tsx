import "./HomePage.css";
import { useEffect, useState } from "react";

import { MenuBar } from "../../components/MenuBar/MenuBar.tsx";
import { AboutMe } from "../../components/AboutMe/AboutMe.tsx";
import { ContactForm } from "../../components/ContactForm/ContactForm.tsx";
import { DefaultCardGroup } from "../../components/DefaultCardGroup/DefaultCardGroup.tsx";
import { MenuSectionButton } from "../../components/MenuSectionButton/MenuSectionButton.tsx";
import { ArrowSectionButton } from "../../components/ArrowSectionButton/ArrowSectionButton.tsx";

import { AboutMeContent } from "../../data/data";

import menuIcon from "../../assets/icons/menu-hamburguer.svg";
import leftArrow from "../../assets/icons/seta-pequena-esquerda.svg";
import rightArrow from "../../assets/icons/seta-pequena-direita.svg";
import { iconsData } from "../../data/iconsData.ts";
import { sections } from "../../data/sections.ts";

import { motion } from "framer-motion";

export const HomePage = () => {
  const [currentSection, setCurrentSection] = useState<string>(sections[0]);
  const [mainMotionValue, setMainMotionValue] = useState<number>(200);
  const [changeMotionOrientation, setChangeMotionOrientation] = useState(false);
  const [isPageReady, setIsPageReady] = useState<boolean>(false);


  const MOTION_VALUE = 100;

  const menuSetCurrentSection = (sectionName: string) => {
    setCurrentSection(sectionName);
    setMainMotionValue(MOTION_VALUE);
    setChangeMotionOrientation(true);
  };

  const scrollToEndPage = () => {
    const fakeDiv = document.createElement("div");
    fakeDiv.style.height = "200vh";
    fakeDiv.style.position = "absolute";
    fakeDiv.style.bottom = "0";
    fakeDiv.style.width = "1px";
  
    document.body.appendChild(fakeDiv);
  
    window.scrollTo({
      top: fakeDiv.offsetTop,
      behavior: "smooth",
    });
  
    setTimeout(() => {
      document.body.removeChild(fakeDiv);
    }, 500);
  };
  
  const componentsMap: Record<string, JSX.Element> = {
    "About Me": (
      <AboutMe
        image={AboutMeContent.image}
        title={AboutMeContent.title}
        description={AboutMeContent.description}
      />
    ),
    Projects: <DefaultCardGroup cardType="Projects" />,
    Experiences: <DefaultCardGroup cardType="Experiences" />,
    Recognitions: <DefaultCardGroup cardType="Recognitions" />,
    Contact: <ContactForm />,
  };

  useEffect(() => {
    scrollToEndPage();

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setIsPageReady(true);
    }, 100);

    return () => {
      document.body.style.overflow = "visible";
      document.documentElement.style.overflow = "auto";
      clearTimeout(timer);
    };
  }, []);

  if (!isPageReady) {
    return null;
  }

  return (
    <>
      <header className="home-header">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.5 }}
        >
          <MenuBar
            sectionName={currentSection}
            icons={iconsData[sections.indexOf(currentSection)]}
            atualPage="/"
            menuSetCurrentSection={menuSetCurrentSection}
          />
        </motion.div>
      </header>

      <main className="home-main">
        <motion.div
          key={currentSection}
          initial={{
            opacity: 0,
            ...(changeMotionOrientation
              ? { y: mainMotionValue }
              : { x: mainMotionValue * -1 }),
          }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{
            opacity: 0,
            ...(changeMotionOrientation
              ? { y: mainMotionValue * -1 }
              : { x: mainMotionValue }),
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="content">{componentsMap[currentSection] || null}</div>
        </motion.div>
      </main>

      <footer className="section-buttons">
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{width:"100%", height:"100%", display:"flex", justifyContent:"center"}}
        >
          <aside className="section-buttons__left-arrow">
            <ArrowSectionButton
              icon={leftArrow}
              alt="Ícone de uma flecha para a esquerda"
              onClick={() => {
                const currentIndex = sections.indexOf(currentSection);
                let nextIndex = currentIndex - 1;
                if (nextIndex < 0) nextIndex = sections.length - 1;
                setCurrentSection(sections[nextIndex]);
                setMainMotionValue(-MOTION_VALUE);
                setChangeMotionOrientation(false);
              }}
            />
          </aside>

          <div className="section-buttons__menu">
            <MenuSectionButton
              icon={menuIcon}
              alt="Ícone de um fone de ouvido"
              menuSetCurrentSection={menuSetCurrentSection}
            />
          </div>

          <aside className="section-buttons__right-arrow">
            <ArrowSectionButton
              icon={rightArrow}
              alt="Ícone de uma flecha para a direita"
              onClick={() => {
                const currentIndex = sections.indexOf(currentSection);
                let nextIndex = currentIndex + 1;
                if (nextIndex === sections.length) nextIndex = 0;
                setCurrentSection(sections[nextIndex]);
                setMainMotionValue(MOTION_VALUE);
                setChangeMotionOrientation(false);
              }}
            />
          </aside>
        </motion.div>
      </footer>
    </>
  );
};
