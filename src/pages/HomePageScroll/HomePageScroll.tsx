import { useState, useEffect, lazy, Suspense, useRef } from "react";
import "./HomePageScroll.css";

import { MenuBar } from "../../components/MenuBar/MenuBar";
import { InfoCard } from "../../components/InfoCard/InfoCard.tsx";

import { getSectionIcons, sections, sectionRegistry, type SectionId, type SectionName } from "../../data/sections.ts";

import { AboutMeContent } from "../../data/data.ts";

import { m } from "framer-motion";
import { scrollFooterVariants, scrollHeaderTransition, scrollHeaderVariants, scrollRevealTransition, scrollSectionVariants } from "../../data/motion.ts";

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

/**
 * TASK-10 / W2.2 + W2.13 — lazy render targets keyed by the registry's
 * `SectionId`, created once at module scope. The ordered sections rendered by
 * this page derive from `sectionRegistry` (single source of truth for the 5
 * section names); these targets supply only the page-specific rendering
 * (lazy + heading level h3). The `lazy()` wrappers are module-stable, so the
 * dynamic-import trigger timing is unchanged.
 */
const sectionRenderTargets: Record<SectionId, () => JSX.Element> = {
  about: () => (
    <AboutMe
      image={AboutMeContent.image}
      title={AboutMeContent.title}
      description={AboutMeContent.description}
      headingLevel="h3"
    />
  ),
  projects: () => <DefaultCardGroup cardType="Projects" headingLevel="h3" />,
  experiences: () => <DefaultCardGroup cardType="Experiences" headingLevel="h3" />,
  recognitions: () => <DefaultCardGroup cardType="Recognitions" headingLevel="h3" />,
  contact: () => <ContactForm headingLevel="h3" />,
};

/** Narrowing guard: validates a string is a real SectionName using the registry. */
function isSectionName(value: string): value is SectionName {
  return sections.includes(value as SectionName);
}

export const HomePageScroll = () => {
  const [currentSection, setCurrentSection] = useState<SectionName>("About Me");
  const [visibleSections, setVisibleSections] = useState(new Set<SectionName>());
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  const lastSectionRef = useRef<HTMLDivElement | null>(null);
  // TASK-10 / W2.12 — scopes the IntersectionObserver to this page's own
  // sections. Attached to the existing `<main>` element (no new DOM wrapper),
  // and populated before this mount effect runs, so the query below is
  // correctly scoped on first execution.
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // W4.17 / R7: The planned 600px contain-intrinsic-size for content-visibility
    // is not present in current source. Do not introduce or tune it here; R7
    // considers threshold changes low-priority. Keep the observer at 0.5.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionElement = entry.target as HTMLElement;
          const rawSectionName = sectionElement.dataset.section || "About Me";

          if (!isSectionName(rawSectionName)) return;

          if (entry.isIntersecting) {
            setCurrentSection(rawSectionName);
            setVisibleSections((prevSections) => {
              const newSections = new Set(prevSections);
              newSections.add(rawSectionName);
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

    // TASK-10 / W2.12 — observe only <section> elements inside this page's
    // container (scoped query), never foreign sections elsewhere in the
    // document. The observer's root stays the viewport (unchanged), so the
    // intersection geometry — and thus the progressive reveal — is identical.
    const sectionElements =
      scrollContainerRef.current?.querySelectorAll("section") ?? [];
    sectionElements.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="home-scroll-header">
        <m.div
          variants={scrollHeaderVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={scrollHeaderTransition}
        >
          <MenuBar
            sectionName={currentSection}
            icons={getSectionIcons(currentSection)}
          />
        </m.div>
      </header>

      <main className="home-scroll-main" ref={scrollContainerRef}>
        {sectionRegistry.map((entry) => (
          <m.section
            key={entry.name}
            data-section={entry.name}
            className={entry.name.toLowerCase()}
            variants={scrollSectionVariants}
            initial="initial"
            animate={visibleSections.has(entry.name) ? "visible" : {}}
            transition={scrollRevealTransition}
            ref={entry.id === "contact" ? lastSectionRef : null}
          >
            <InfoCard info={entry.name} />
            <Suspense fallback={<p>Carregando...</p>}>
              {visibleSections.has(entry.name) && sectionRenderTargets[entry.id]()}
            </Suspense>
          </m.section>
        ))}
      </main>

      {isFooterVisible && (
        <footer className="home-scroll-footer">
          <m.div
            variants={scrollFooterVariants}
            initial="initial"
            animate="animate"
            transition={scrollRevealTransition}
          >
            <h4>Desenvolvido por Renan Fellipe</h4>
            <p>© 2025</p>
          </m.div>
        </footer>
      )}
    </>
  );
};
