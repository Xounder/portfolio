import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Button } from './components/Button/Button.tsx'
import { ProjectCard } from './components/ProjectCard/ProjectCard.tsx'

import { SectionButton } from './components/SectionButton/SectionButton.tsx'
import earphonesIcon from './assets/icons/fones-de-ouvido.svg';
import menuIcon from './assets/icons/menu-hamburguer.svg';

import { ChangeSectionMenu } from './components/ChangeSectionMenu/ChangeSectionMenu.tsx';

import { ContactForm } from './components/ContactForm/ContactForm.tsx'

import { MenuBar } from './components/MenuBar/MenuBar.tsx'
import { ExperienceCard } from './components/ExperienceCard/ExperienceCard.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MenuBar 
    icons={[
      {icon: earphonesIcon, alt: 'Icone de um fone de ouvido'},
      {icon: earphonesIcon, alt: 'Icone de um fone de ouvido'},
      {icon: earphonesIcon, alt: 'Icone de um fone de ouvido'}
    ]}
    />

    <Button 
      text="Click me" 
      size= {[0.6, 3.2]} 
      fontSize={1}
      type='button'
      onClick={() => console.log('clicked')} 
    />

    <ChangeSectionMenu
        icon={menuIcon}
        alt="Ícone de um fone de ouvido" 
        onClick={() => console.log('clicked')}
      />

    <ContactForm/>
    
    <ExperienceCard 
      cardInfo={
        {
          image: { 
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
            alt: 'FrontEnd Developer' 
          },
          title: 'FrontEnd Developer',
          description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.'
        } 
      }
      info={
        {
          type: 'FrontEnd', 
          yearPeriod: '2022'
        }
      }
    />
    <ExperienceCard 
      cardInfo={
        {
          image: { 
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
            alt: 'FrontEnd Developer' 
          },
          title: 'Sasdas Developer',
          description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.'
        } 
      }
      info={
        {
          type: 'FrontEnd', 
          yearPeriod: '2022'
        }
      }
    />

  <ProjectCard 
      cardInfo={
        {
          image: {
            img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s",
            alt: "Project 1" 
          },
          title: "Project 1",
          description: "Body text for whatever you’ds like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story. asd asd as dasd a asd asdasd asdasd asda asdas dasd asdas dasdas dasd as das das das dasd asd asd  " 
        }
      }
      tecnologies={ ['React', 'TypeScript', 'Vite', 'Tailwind', 'Angular', 'React', 'TypeScript', 'Vite', 'Tailwind', 'Angular'] } 
      link="https://github.com/Xounder"
    />

    <SectionButton 
      icon={earphonesIcon}
      alt="Ícone de um fone de ouvido" 
      onClick={() => console.log('clicked')}
    />


  </StrictMode>,
)
