import { useState, useEffect, lazy, Suspense, useRef } from "react";
import "./HomePageScroll.css";

import { MenuBar } from "../../components/MenuBar/MenuBar";
import { InfoCard } from "../../components/InfoCard/InfoCard.tsx";

import { sections, getSectionIcons, type SectionName } from "../../data/sections.ts";

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
  const [currentSection, setCurrentSection] = useState<SectionName>("About Me");
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
          if (!sections.includes(sectionName as SectionName)) return;
          const validSectionName = sectionName as SectionName;

          if (entry.isIntersecting) {
            setCurrentSection(validSectionName);
            setVisibleSections((prevSections) => {
              const newSections = new Set(prevSections);
              newSections.add(validSectionName);
              return newSections;
            });

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
  }, []);

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
            icons={getSectionIcons(currentSection)}
            atualPage="/scroll"
            menuSetCurrentSection={() => {}}
          />
        </motion.div>
      </header>

      <main className="home-scroll-main">
        {([
          { key: "About Me", render: () => <AboutMe image={AboutMeContent.image} title={AboutMeContent.title} description={AboutMeContent.description} headingLevel="h3" /> },
          { key: "Projects", render: () => <DefaultCardGroup cardType="Projects" headingLevel="h3" /> },
          { key: "Experiences", render: () => <DefaultCardGroup cardType="Experiences" headingLevel="h3" /> },
          { key: "Recognitions", render: () => <DefaultCardGroup cardType="Recognitions" headingLevel="h3" /> },
          { key: "Contact", render: () => <ContactForm headingLevel="h3" /> },
        ] as const).map(({ key, render }) => (
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
              {visibleSections.has(key) && render()
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
            <h4>Desenvolvido por Renan Fellipe</h4>
            <p>© 2025</p>
          </motion.div>
        </footer>
      )}
    </>
  );
};
