import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { ArrowSectionButton } from './components/ArrowSectionButton/ArrowSectionButton.tsx'

import earphonesIcon from './assets/icons/fones-de-ouvido.svg';
import menuIcon from './assets/icons/menu-hamburguer.svg';
import leftArrow from './assets/icons/seta-pequena-esquerda.svg';
import rightArrow from './assets/icons/seta-pequena-direita.svg';

import { MenuSectionButton } from './components/MenuSectionButton/MenuSectionButton.tsx';


import { MenuBar } from './components/MenuBar/MenuBar.tsx'

import { AboutMePage } from './pages/AboutMePage/AboutMePage.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <header>
      <MenuBar 
      icons={[
        {icon: earphonesIcon, alt: 'Icone de um fone de ouvido'},
        {icon: earphonesIcon, alt: 'Icone de um fone de ouvido'},
        {icon: earphonesIcon, alt: 'Icone de um fone de ouvido'}
      ]}
      />
    </header>

    <main>
      <AboutMePage/>
    </main>
    
    <section className='section-buttons'>
      <aside className='section-buttons__left-arrow'>
        <ArrowSectionButton 
          icon={leftArrow}
          alt="Ícone de uma flecha para a esquerda" 
          onClick={() => console.log('clicked')}
        />   
      </aside>

      <aside className='section-buttons__menu'>
        <MenuSectionButton
            icon={menuIcon}
            alt="Ícone de um fone de ouvido" 
        />
      </aside>

      <aside className='section_buttons__right-arrow'>
        <ArrowSectionButton
          icon={rightArrow}
          alt="Ícone de uma flecha para a direita" 
          onClick={() => console.log('clicked')}
        />   
      </aside>
    </section>


  </StrictMode>,
)
