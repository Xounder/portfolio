import { useState, useEffect } from "react";
import "./HomePageScroll.css";

import { MenuBar } from "../../components/MenuBar/MenuBar";
import { AboutMePage } from "../AboutMePage/AboutMePage";
import { ContactFormPage } from "../ContactFormPage/ContactFormPage";
import { InfoCard } from "../../components/InfoCard/InfoCard.tsx";

import { iconsData } from "../../data/iconsData.ts";
import { sections } from "../../data/sections.ts";
import { DefaultCardGroupPage } from "../DefaultCardGroupPage/DefaultCardGroupPage.tsx";

import { motion } from "framer-motion";

export const HomePageScroll = () => {
  const [currentSection, setCurrentSection] = useState<string>("About Me");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionElement = entry.target as HTMLElement;
          const sectionName = sectionElement.dataset.section || "";

          if (entry.isIntersecting) {
            setCurrentSection(sectionName);

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
          } else {
            const menuTitle = document.querySelector(
              "header .atual-section__name h2"
            );
            const menuIcon = document.querySelector(
              "header .atual-section__icons"
            );

            if (menuTitle && menuIcon) {
              menuTitle.classList.remove("visible");
              menuIcon.classList.remove("visible");
            }
          }
        });
      },
      { threshold: 0.85 }
    );

    const sectionElements = document.querySelectorAll("section");
    sectionElements.forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }} 
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5 }}
      >
        <header>
          <MenuBar
            sectionName={currentSection}
            icons={iconsData[sections.indexOf(currentSection)]}
            atualPage="/scroll"
          />
        </header>

        <main>
          <section className="about" data-section="About Me">
            <InfoCard info="About Me"></InfoCard>
            <AboutMePage />
          </section>

          <section className="projects" data-section="Projects">
            <InfoCard info="Projects"></InfoCard>
            <DefaultCardGroupPage cardType="Projects" />
          </section>

          <section className="experiences" data-section="Experiences">
            <InfoCard info="Experiences"></InfoCard>
            <DefaultCardGroupPage cardType="Experiences" />
          </section>

          <section className="recognitions" data-section="Recognitions">
            <InfoCard info="Recognitions"></InfoCard>
            <DefaultCardGroupPage cardType="Recognitions" />
          </section>

          <section className="contact" data-section="Contact">
            <InfoCard info="Contact"></InfoCard>
            <ContactFormPage />
          </section>
        </main>

        <footer>
          <h4>Desenvolved By Renan Fellipe</h4>
          <p>© 2025</p>
        </footer>
      </motion.div>
    </>
  );
};
