import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import { HomePage } from './pages/HomePage/HomePage';
import { HomePageScroll } from './pages/HomePageScroll/HomePageScroll';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scroll" element={<HomePageScroll />} />
      </Routes>
    </BrowserRouter>
);
