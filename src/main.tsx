import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'


import { HomePageScroll } from './pages/HomePageScroll/HomePageScroll'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomePageScroll/>
  </StrictMode>,
)
