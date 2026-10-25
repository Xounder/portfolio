import type { Icon } from '../types/icons';
import { socialProfiles } from './seo';

export type { Icon };

// D/B convention is per usage, not per asset: repeated card imagery is decorative
// when the adjacent card title already names it; a profile photo in AboutMe is
// content-bearing. Contact icons inside icon-only links MUST keep meaningful alt
// text to name their links. Optional follow-up: audit other repeated icons before
// marking individual unlinked instances decorative; never hide a link's only name.

import basketBallIcon from '../assets/icons/basquetebol.svg';
import houseIcon from '../assets/icons/casa.svg';
import screenIcon from '../assets/icons/tela.svg';

import earphonesIcon from '../assets/icons/fones-de-ouvido.svg';
import codeIcon from '../assets/icons/codigo-simples.svg';
import coffeeIcon from '../assets/icons/quente-como-uma-caneca.svg';

import openBookIcon from '../assets/icons/livro-alt.svg';
import suitCaseIcon from '../assets/icons/pasta-em-branco.svg';
import notesIcon from '../assets/icons/caderno.svg';

import closedBookIcon from '../assets/icons/marcador-de-livro.svg';
import achievementIcon from '../assets/icons/distintivo.svg';
import annotateIcon from '../assets/icons/editar.svg';

import youtubeIcon from '../assets/icons/youtube.svg';
import githubIcon from '../assets/icons/github.svg';
import linkedinIcon from '../assets/icons/linkedin.svg';
import instagramIcon from '../assets/icons/instagram.svg';

export const iconsData: Icon[][] = [
  // About Me
  [
    { icon: basketBallIcon, alt: 'Ícone de basquetebol' },
    { icon: houseIcon, alt: 'Ícone de casa' },
    { icon: screenIcon, alt: 'Ícone de tela' },
  ],
  // Projects
  [
    { icon: earphonesIcon, alt: 'Ícone de fones' },
    { icon: codeIcon, alt: 'Ícone de código' },
    { icon: coffeeIcon, alt: 'Ícone de café' },
  ],
  // Experiences
  [
    { icon: openBookIcon, alt: 'Ícone de livro aberto' },
    { icon: suitCaseIcon, alt: 'Ícone de maleta' },
    { icon: annotateIcon, alt: 'Ícone de notas' },
  ],
  // Recognitions
  [
    { icon: closedBookIcon, alt: 'Ícone de livro fechado' },
    { icon: achievementIcon, alt: 'Ícone de medalha' },
    { icon: notesIcon, alt: 'Ícone de notas' },
  ],
  // Contact
  [
    { icon: githubIcon, alt: 'GitHub', link: socialProfiles.github },
    { icon: linkedinIcon, alt: 'LinkedIn', link: socialProfiles.linkedin },
    { icon: youtubeIcon, alt: 'YouTube', link: socialProfiles.youtube },
    { icon: instagramIcon, alt: 'Instagram', link: socialProfiles.instagram },
  ],
];
