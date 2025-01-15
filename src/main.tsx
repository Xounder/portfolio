import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Button } from './components/Button/Button.tsx'
import { ExperienceCard } from './components/ExperienceCard/ExperienceCard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Button 
      text="Click me" 
      size= {[0.6, 3.2]} 
      fontSize={1}
      onClick={() => console.log('clicked')} 
    />
    <ExperienceCard 
      image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjo0lhwc7Zb7VmLQ1D1ES0K2YkvM5wFr0aAQ&s"  title="Experience 1" 
      description="Body text for whatever you’ds like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story. asd asd as dasd a asd asdasd asdasd asda asdas dasd asdas dasdas dasd as das das das dasd asd asd  " 
      info={['Projeto de Pesquisa', '2021']} 
    />
  </StrictMode>,
)
