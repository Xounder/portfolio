import type { Transition, Variants } from "framer-motion";

/** Existing timings, in seconds for framer-motion and milliseconds for timers. */
export const MOTION_DURATION_SECONDS = 0.5;
export const SCROLL_HEADER_DURATION_SECONDS = 0.4;
export const SCROLL_REVEAL_DURATION_SECONDS = 0.6;
export const SCROLL_REVEAL_OFFSET = 300;
export const SCROLL_FOOTER_OFFSET = 500;
export const MENU_FADE_DELAY_MS = 200;
export const PAGE_READY_DELAY_MS = 100;
export const SCROLL_RESTORATION_CLEANUP_MS = 500;
export const SCROLL_RESTORATION_SPACER_HEIGHT = "200vh";

export const homeTransition: Transition = { duration: MOTION_DURATION_SECONDS };
export const scrollHeaderTransition: Transition = {
  duration: SCROLL_HEADER_DURATION_SECONDS,
  ease: "easeOut",
};
export const scrollRevealTransition: Transition = {
  duration: SCROLL_REVEAL_DURATION_SECONDS,
  ease: "easeOut",
};

export const homeHeaderVariants: Variants = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

export const homeFooterVariants: Variants = {
  initial: { opacity: 0, y: 0 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 0 },
};

export const scrollHeaderVariants: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

export const scrollSectionVariants: Variants = {
  initial: { opacity: 0, y: SCROLL_REVEAL_OFFSET },
  visible: { opacity: 1, y: 0 },
};

export const scrollFooterVariants: Variants = {
  initial: { opacity: 0, y: SCROLL_FOOTER_OFFSET },
  animate: { opacity: 1, y: 0 },
};
