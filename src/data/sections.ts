import { iconsData } from './iconsData';
import type { Icon } from '../types/icons';

export type SectionName = 'About Me' | 'Projects' | 'Experiences' | 'Recognitions' | 'Contact';
interface SectionEntry { name: SectionName; icons: Icon[]; }
export const sections: readonly SectionName[] = ['About Me', 'Projects', 'Experiences', 'Recognitions', 'Contact'];
const sectionRecord: Record<SectionName, SectionEntry> = {
  'About Me': { name: 'About Me', icons: iconsData[0] },
  Projects: { name: 'Projects', icons: iconsData[1] },
  Experiences: { name: 'Experiences', icons: iconsData[2] },
  Recognitions: { name: 'Recognitions', icons: iconsData[3] },
  Contact: { name: 'Contact', icons: iconsData[4] },
};
export const getSectionIcons = (name: SectionName): Icon[] => sectionRecord[name].icons;
export const getSectionIndex = (name: SectionName): number => sections.indexOf(name);
