import './HomePage.css';
import { useState } from 'react';

import { Icon, MenuBar } from '../../components/MenuBar/MenuBar.tsx'
import { AboutMePage } from '../AboutMePage/AboutMePage.tsx'
import { ProjectsPage } from '../ProjectsPage/ProjectsPage.tsx';
import { ExperiencesPage } from '../ExperiencesPage/ExperiencesPage.tsx';
import { RecognitionsPage } from '../RecognitionsPage/RecognitionsPage.tsx';
import { ContactFormPage } from '../ContactFormPage/ContactFormPage.tsx';
import { MenuSectionButton } from '../../components/MenuSectionButton/MenuSectionButton.tsx';
import { ArrowSectionButton } from '../../components/ArrowSectionButton/ArrowSectionButton.tsx'

import menuIcon from '../../assets/icons/menu-hamburguer.svg';
import leftArrow from '../../assets/icons/seta-pequena-esquerda.svg';
import rightArrow from '../../assets/icons/seta-pequena-direita.svg';

import basketBallIcon from '../../assets/icons/basquetebol.svg';
import houseIcon from '../../assets/icons/casa.svg';
import screenIcon from '../../assets/icons/tela.svg';

import earphonesIcon from '../../assets/icons/fones-de-ouvido.svg';
import codeIcon from '../../assets/icons/codigo-simples.svg';
import coffeeIcon from '../../assets/icons/quente-como-uma-caneca.svg';

import openBookIcon from '../../assets/icons/livro-alt.svg';
import suitCaseIcon from '../../assets/icons/pasta-em-branco.svg';
import notesIcon from '../../assets/icons/caderno.svg';


import closedBookIcon from '../../assets/icons/marcador-de-livro.svg';
import achievementIcon from '../../assets/icons/distintivo.svg';


import youtubeIcon from '../../assets/icons/youtube.svg';
import githubIcon from '../../assets/icons/github.svg';
import linkedinIcon from '../../assets/icons/linkedin.svg';
import instagramIcon from '../../assets/icons/instagram.svg';


export const HomePage = () => {
    const sections: string[] = ['About Me', 'Projects', 'Experiences', 'Recognitions', 'Contact'];
    const sectionIcons: Icon[][] = [
                [{icon: basketBallIcon, alt: 'Ícone de basquetebol'}, {icon: houseIcon, alt: 'Ícone de casa'},{icon: screenIcon, alt: 'Ícone de tela'}],
                [{icon: earphonesIcon, alt: 'Ícone de fones'}, {icon: codeIcon, alt: 'Ícone de código'},{icon: coffeeIcon, alt: 'Ícone de café'}],
                [{icon: openBookIcon, alt: 'Ícone de livro aberto'}, {icon: suitCaseIcon, alt: 'Ícone de maleta'},{icon: notesIcon, alt: 'Ícone de notas'}],
                [{icon: closedBookIcon, alt: 'Ícone de livro fechado'}, {icon: achievementIcon, alt: 'Ícone de medalha'},{icon: notesIcon, alt: 'Ícone de notas'}],
                [{icon: githubIcon, alt: 'Ícone de github', link: 'https://github.com/Xounder'}, {icon: linkedinIcon, alt: 'Ícone de linkedin', link: 'https://www.linkedin.com/in/renan-fellipe/'}, {icon: youtubeIcon, alt: 'Ícone de youtube', link: 'https://www.youtube.com/@xounder'},  {icon: instagramIcon, alt: 'Ícone de instagram', link: 'https://www.instagram.com/renan.llipe/'}]
            ];   
    const [currentSection, setCurrentSection] = useState(0);

    return (
        <>
            <header>
                <MenuBar 
                sectionName={sections[currentSection]}
                icons={sectionIcons[currentSection]}
                />
            </header>
        
            <main>
                <div>
                    {sections[currentSection] === 'About Me' && <AboutMePage/>}
                    {sections[currentSection] === 'Projects' && <ProjectsPage/>}
                    {sections[currentSection] === 'Experiences' && <ExperiencesPage/>}
                    {sections[currentSection] === 'Recognitions' && <RecognitionsPage/>}
                    {sections[currentSection] === 'Contact' && <ContactFormPage/>}
                </div>
            </main>
            
            <footer className='section-buttons'>
                <aside className='section-buttons__left-arrow'>
                    <ArrowSectionButton 
                        icon={leftArrow}
                        alt="Ícone de uma flecha para a esquerda" 
                        onClick={() => { 
                            let index = currentSection - 1;
                            if (index < 0) index = sections.length - 1;
                            setCurrentSection(index); 
                        }}
                    />   
                </aside>
        
                <div className='section-buttons__menu'>
                    <MenuSectionButton
                        icon={menuIcon}
                        alt="Ícone de um fone de ouvido" 
                    />
                </div>
        
                <aside className='section_buttons__right-arrow'>
                    <ArrowSectionButton
                        icon={rightArrow}
                        alt="Ícone de uma flecha para a direita" 
                        onClick={() => {
                            let index = currentSection + 1;
                            if (index === sections.length) index = 0;
                            setCurrentSection(index); 
                        }}
                    />   
                </aside>
            </footer>
        </>
    );
}