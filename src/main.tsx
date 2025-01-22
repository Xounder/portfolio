import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Button } from './components/Button/Button.tsx'

import { ArrowSectionButton } from './components/ArrowSectionButton/ArrowSectionButton.tsx'
import earphonesIcon from './assets/icons/fones-de-ouvido.svg';
import menuIcon from './assets/icons/menu-hamburguer.svg';

import { MenuSectionButton } from './components/MenuSectionButton/MenuSectionButton.tsx';

import { ContactForm } from './components/ContactForm/ContactForm.tsx'

import { MenuBar } from './components/MenuBar/MenuBar.tsx'
import { ExperienceCardInfo } from './components/ExperienceCardInfo/ExperienceCardInfo.tsx'
import { ProjectCardInfo } from './components/ProjectCardInfo/ProjectCardInfo.tsx'
import { DefaultCard } from './components/DefaultCard/DefaultCard.tsx'

import { AboutMe } from './components/AboutMe/AboutMe.tsx'


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

    

    <ContactForm/>

    <DefaultCard 
      image= {{
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
        alt: 'FrontEnd Developer' 
      }}
      title= 'Sasdas Developer'
      description= 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.'
      link="https://github.com/Xounder"
      component= {<ExperienceCardInfo info={{ type: 'FrontEnd', yearPeriod: '2022' }}/>}
    />
    <DefaultCard 
      image= {{
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
        alt: 'FrontEnd Developer' 
      }}
      title= 'Sasdas Developer'
      description= 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.'
      link="https://github.com/Xounder"
      component= {<ExperienceCardInfo info={{ type: 'FrontEnd', yearPeriod: '2022' }}/>}
    />

    <MenuSectionButton
        icon={menuIcon}
        alt="Ícone de um fone de ouvido" 
        onClick={() => console.log('clicked')}
    />
    
    <ArrowSectionButton 
      icon={earphonesIcon}
      alt="Ícone de um fone de ouvido" 
      onClick={() => console.log('clicked')}
    />

    <DefaultCard 
      image= {{
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
        alt: 'FrontEnd Developer' 
      }}
      title= 'Sasdas Developer'
      description= 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, eaque.'
      link="https://github.com/Xounder"
      component={<ProjectCardInfo tecnologies={['React', 'TypeScript', 'Vite', 'Tailwind', 'Angular', 'React', 'TypeScript', 'Vite', 'Tailwind', 'Angular']}/>} 
    />   


    <AboutMe 
      image={
        {
          img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s',
          alt: 'FrontEnd Developer'
        }
      }
      title='Renan Fellipe'
      description={[
        "Eu sou apaixonado pela área de tecnologia e jogos. Concluí o ensino médio técnico em Eletroeletrônica e atualmente curso Engenharia da Computação, ambos no Instituto Federal do Maranhão (IFMA).",
        "Possuo habilidades em Python, Java, Angular, SQL, e conhecimentos em APIs REST, microsserviços, NoSQL, C#, Docker, Kubernetes, e Cloud (AWS e Azure).",
      ]}
    />


  </StrictMode>,
)
