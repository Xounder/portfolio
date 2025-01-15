import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Button } from './components/Button/Button.tsx'
import { ProjectCard } from './components/ProjectCard/ProjectCard.tsx'

import { SectionButton } from './components/SectionButton/SectionButton.tsx'
import fonesDeOuvidoIcon from './assets/fones-de-ouvido.svg';

import { ChangeSectionMenu } from './components/ChangeSectionMenu/ChangeSectionMenu.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Button 
      text="Click me" 
      size= {[0.6, 3.2]} 
      fontSize={1}
      onClick={() => console.log('clicked')} 
    />
    <ProjectCard 
      image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s"  title="Project 1" 
      description="Body text for whatever you’ds like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story. asd asd as dasd a asd asdasd asdasd asda asdas dasd asdas dasdas dasd as das das das dasd asd asd  " 
      tecnologies={['React', 'TypeScript', 'Vite', 'Tailwind', 'Angular']} 
      link="https://github.com/AndresLopezDev"
    />
    <SectionButton 
      icon={fonesDeOuvidoIcon} 
      alt="Ícone de um fone de ouvido" 
      onClick={() => console.log('clicked')}
    />

  <ChangeSectionMenu 
      icon={fonesDeOuvidoIcon} 
      alt="Ícone de um fone de ouvido" 
      onClick={() => console.log('clicked')}
    />
  </StrictMode>,
)
