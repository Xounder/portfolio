import { useState, useEffect, lazy, Suspense, useRef } from "react";
import "./HomePageScroll.css";

import { MenuBar } from "../../components/MenuBar/MenuBar";
import { InfoCard } from "../../components/InfoCard/InfoCard.tsx";

import { iconsData } from "../../data/iconsData.ts";
import { sections } from "../../data/sections.ts";

import { motion } from "framer-motion";

const AboutMePage = lazy(() =>
  import("../AboutMePage/AboutMePage").then((module) => ({
    default: module.AboutMePage,
  }))
);

const ContactFormPage = lazy(() =>
  import("../ContactFormPage/ContactFormPage").then((module) => ({
    default: module.ContactFormPage,
  }))
);

const DefaultCardGroupPage = lazy(() =>
  import("../DefaultCardGroupPage/DefaultCardGroupPage").then((module) => ({
    default: module.DefaultCardGroupPage,
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
          />
        </motion.div>
      </header>

      <main className="home-scroll-main">
        {[ 
          { key: "About Me", Component: AboutMePage },
          { key: "Projects", Component: DefaultCardGroupPage },
          { key: "Experiences", Component: DefaultCardGroupPage },
          { key: "Recognitions", Component: DefaultCardGroupPage },
          { key: "Contact", Component: ContactFormPage },
        ].map(({ key, Component }) => (
          <motion.section
            key={key}
            data-section={key}
            className={key.toLowerCase()}
            initial={{ opacity: 0, y: 350 }}
            animate={visibleSections.has(key) ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            ref={key === "Contact" ? lastSectionRef : null}
          >
            <Suspense fallback={<p>Carregando...</p>}>
              <InfoCard info={key} />
              {visibleSections.has(key) && <Component cardType={key} />}
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
