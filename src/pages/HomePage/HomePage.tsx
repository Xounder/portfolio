import "./HomePage.css";
import { useEffect, useState } from "react";

import { MenuBar } from "../../components/MenuBar/MenuBar.tsx";
import { AboutMe } from "../../components/AboutMe/AboutMe.tsx";
import { ContactForm } from "../../components/ContactForm/ContactForm.tsx";
import { DefaultCardGroup } from "../../components/DefaultCardGroup/DefaultCardGroup.tsx";
import { MenuSectionButton } from "../../components/MenuSectionButton/MenuSectionButton.tsx";
import { DefaultSectionButton } from "../../components/DefaultSectionButton/DefaultSectionButton.tsx";
// TASK-11 / W2.4 — ArrowSectionButton component removed; its only contribution
// was the arrow-section wrapper, now inlined below. TASK-17 changes that
// single-button nav to a div; the stylesheet stays at its original path and is imported
// here at the same cascade position the old component import occupied.
import "../../components/ArrowSectionButton/ArrowSectionButton.css";

import { AboutMeContent } from "../../data/data";

import menuIcon from "../../assets/icons/menu-hamburguer.svg";
import leftArrow from "../../assets/icons/seta-pequena-esquerda.svg";
import rightArrow from "../../assets/icons/seta-pequena-direita.svg";
import { sections, getSectionEntry, getSectionIcons, getSectionIndex, type SectionId, type SectionName } from "../../data/sections.ts";
import { homeFooterVariants, homeHeaderVariants, homeTransition, PAGE_READY_DELAY_MS, SCROLL_RESTORATION_CLEANUP_MS, SCROLL_RESTORATION_SPACER_HEIGHT } from "../../data/motion.ts";

import { motion } from "framer-motion";

/**
 * TASK-10 / W2.10 / risks.md R15 — `MOTION_VALUE` hoisted to module scope.
 * UNRESOLVED DECISION (feasibility.md Open Question 2): `mainMotionValue`'s
 * initial state inside the component below is `200`, while this constant is
 * `100`. Reconciling the two would change the first-render animation, which
 * R15 forbids doing silently, and Open Question 2 has not been answered.
 * Both values are therefore preserved exactly as before — do NOT "clean up"
 * one into the other until that question is explicitly resolved.
 */
const MOTION_VALUE = 100;

/**
 * TASK-10 / W2.5 — shared wrap-around arithmetic for both arrow blocks.
 * `((index + delta) % length + length) % length` normalises JavaScript's
 * negative modulo (`-1 % 5 === -1`, not `4`), so leftward navigation from
 * index 0 wraps to the last section and rightward navigation from the last
 * section wraps to 0. Byte-identical to the two hand-rolled `if` guards it
 * replaces, for all 5 sections in both directions.
 */
function getWrappedSectionIndex(currentIndex: number, delta: number): number {
  const length = sections.length;
  return ((currentIndex + delta) % length + length) % length;
}

/**
 * TASK-10 / W2.13 — eager render targets, created once at module scope
 * (previously rebuilt on every render) and keyed by the registry's
 * `SectionId` so the 5 display-name strings exist only in `sections.ts`.
 */
const sectionRenderTargets: Record<SectionId, JSX.Element> = {
  about: (
    <AboutMe
      image={AboutMeContent.image}
      title={AboutMeContent.title}
      description={AboutMeContent.description}
      headingLevel="h2"
    />
  ),
  projects: <DefaultCardGroup cardType="Projects" headingLevel="h2" />,
  experiences: <DefaultCardGroup cardType="Experiences" headingLevel="h2" />,
  recognitions: <DefaultCardGroup cardType="Recognitions" headingLevel="h2" />,
  contact: <ContactForm headingLevel="h2" />,
};

export const HomePage = () => {
  const [currentSection, setCurrentSection] = useState<SectionName>(sections[0]);
  const [mainMotionValue, setMainMotionValue] = useState<number>(200);
  const [changeMotionOrientation, setChangeMotionOrientation] = useState(false);
  const [isPageReady, setIsPageReady] = useState<boolean>(false);


  const menuSetCurrentSection = (sectionName: SectionName) => {
    setCurrentSection(sectionName);
    setMainMotionValue(MOTION_VALUE);
    setChangeMotionOrientation(true);
  };

  const scrollToEndPage = () => {
    const fakeDiv = document.createElement("div");
    fakeDiv.style.height = SCROLL_RESTORATION_SPACER_HEIGHT;
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
    }, SCROLL_RESTORATION_CLEANUP_MS);
  };
  
  useEffect(() => {
    scrollToEndPage();

    // Capture the actual prior inline values (may be "" if set via stylesheet)
    const prevBodyOverflow = document.body.style.overflow;
    const prevDocumentElementOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setIsPageReady(true);
    }, PAGE_READY_DELAY_MS);

    return () => {
      // Restore exactly the captured inline values; empty string removes the inline declaration
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevDocumentElementOverflow;
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
          variants={homeHeaderVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={homeTransition}
        >
          <MenuBar
            sectionName={currentSection}
            icons={getSectionIcons(currentSection)}
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
          transition={homeTransition}
        >
          <div className="content">{sectionRenderTargets[getSectionEntry(currentSection).id]}</div>
        </motion.div>
      </main>

      <footer className="section-buttons">
        <motion.nav
          className="section-buttons__navigation"
          aria-label="Navegação entre seções"
          variants={homeFooterVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={homeTransition}
        >
          <div className="section-buttons__left-arrow">
            <div className="arrow-section">
              <DefaultSectionButton
                icon={leftArrow}
                alt=""
                ariaHidden={true}
                onClick={() => {
                  setCurrentSection(
                    sections[getWrappedSectionIndex(getSectionIndex(currentSection), -1)],
                  );
                  setMainMotionValue(-MOTION_VALUE);
                  setChangeMotionOrientation(false);
                }}
              />
            </div>
          </div>

          <div className="section-buttons__menu">
            <MenuSectionButton
              icon={menuIcon}
              alt="Ícone de menu hambúrguer"
              menuSetCurrentSection={menuSetCurrentSection}
            />
          </div>

          <div className="section-buttons__right-arrow">
            <div className="arrow-section">
              <DefaultSectionButton
                icon={rightArrow}
                alt=""
                ariaHidden={true}
                onClick={() => {
                  setCurrentSection(
                    sections[getWrappedSectionIndex(getSectionIndex(currentSection), 1)],
                  );
                  setMainMotionValue(MOTION_VALUE);
                  setChangeMotionOrientation(false);
                }}
              />
            </div>
          </div>
        </motion.nav>
      </footer>
    </>
  );
};
