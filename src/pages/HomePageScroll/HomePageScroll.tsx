import { useState, useEffect, lazy, Suspense, useRef } from "react";
import "./HomePageScroll.css";

import { MenuBar } from "../../components/MenuBar/MenuBar";
import { InfoCard } from "../../components/InfoCard/InfoCard.tsx";

import { iconsData } from "../../data/iconsData.ts";
import { sections } from "../../data/sections.ts";

import { AboutMeContent } from "../../data/data.ts";

import { motion } from "framer-motion";

const AboutMe = lazy(() =>
  import("../../components/AboutMe/AboutMe.tsx").then((module) => ({
    default: module.AboutMe,
  }))
);

const ContactForm = lazy(() =>
  import("../../components/ContactForm/ContactForm.tsx").then((module) => ({
    default: module.ContactForm,
  }))
);

const DefaultCardGroup = lazy(() =>
  import("../../components/DefaultCardGroup/DefaultCardGroup.tsx").then((module) => ({
    default: module.DefaultCardGroup,
  }))
);

export const HomePageScroll = () => {
  const [currentSection, setCurrentSection] = useState<string>("About Me");
  const [visibleSections, setVisibleSections] = useState(new Set<string>());
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  const lastSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionElement = entry.target as HTMLElement;
          const sectionName = sectionElement.dataset.section || "About Me";

          if (entry.isIntersecting) {
            setCurrentSection(sectionName);
            setVisibleSections((prevSections) => {
              const newSections = new Set(prevSections);
              newSections.add(sectionName);
              return newSections;
            });

            const menuTitle = document.querySelector(
              "header .atual-section__name h2"
            );
            const menuIcon = document.querySelector(
              "header .atual-section__icons"
            );

            if (menuTitle && menuIcon) {
              menuTitle.classList.add("visible");
              menuIcon.classList.add("visible");
            }
          }

          if (entry.target === lastSectionRef.current && entry.isIntersecting) {
            setIsFooterVisible(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sectionElements = document.querySelectorAll("section");
    sectionElements.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [currentSection]);

  return (
    <>
      <header className="home-scroll-header">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <MenuBar
            sectionName={currentSection}
            icons={iconsData[sections.indexOf(currentSection)]}
            atualPage="/scroll"
            menuSetCurrentSection={() => {}}
          />
        </motion.div>
      </header>

      <main className="home-scroll-main">
        {[ 
          { key: "About Me", Component: AboutMe },
          { key: "Projects", Component: DefaultCardGroup },
          { key: "Experiences", Component: DefaultCardGroup },
          { key: "Recognitions", Component: DefaultCardGroup },
          { key: "Contact", Component: ContactForm },
        ].map(({ key, Component }) => (
          <motion.section
            key={key}
            data-section={key}
            className={key.toLowerCase()}
            initial={{ opacity: 0, y: 300 }}
            animate={visibleSections.has(key) ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            ref={key === "Contact" ? lastSectionRef : null}
          >
            <InfoCard info={key} />
            <Suspense fallback={<p>Carregando...</p>}>
              {visibleSections.has(key) && 
                <Component 
                  cardType={key} 
                  image={{
                    img: AboutMeContent.image.img,
                    alt: AboutMeContent.image.alt
                  }} 
                  title={ AboutMeContent.title } 
                  description={ AboutMeContent.description } 
                />
              }
            </Suspense>
          </motion.section>
        ))}
      </main>

      {isFooterVisible && (
        <footer className="home-scroll-footer">
          <motion.div
            initial={{ opacity: 0, y: 500 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Suspense fallback={<p>Carregando...</p>}>
              <h4>Desenvolvido por Renan Fellipe</h4>
              <p>© 2025</p>
            </Suspense>
          </motion.div>
        </footer>
      )}
    </>
  );
};
