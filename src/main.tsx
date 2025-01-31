import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { HomePage } from './pages/HomePage/HomePage'
import { HomePageScroll } from './pages/HomePageScroll/HomePageScroll'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomePage/>
  </StrictMode>,
)
