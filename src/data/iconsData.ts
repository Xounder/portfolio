import { Icon } from '../components/MenuBar/MenuBar';

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
    { icon: notesIcon, alt: 'Ícone de notas' },
  ],
  // Recognitions
  [
    { icon: closedBookIcon, alt: 'Ícone de livro fechado' },
    { icon: achievementIcon, alt: 'Ícone de medalha' },
    { icon: notesIcon, alt: 'Ícone de notas' },
  ],
  // Contact
  [
    { icon: githubIcon, alt: 'Ícone de github', link: 'https://github.com/Xounder' },
    { icon: linkedinIcon, alt: 'Ícone de linkedin', link: 'https://www.linkedin.com/in/renan-fellipe/' },
    { icon: youtubeIcon, alt: 'Ícone de youtube', link: 'https://www.youtube.com/@xounder' },
    { icon: instagramIcon, alt: 'Ícone de instagram', link: 'https://www.instagram.com/renan.llipe/' },
  ],
];
