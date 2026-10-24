import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import { HomePage } from './pages/HomePage/HomePage';
import { HomePageScroll } from './pages/HomePageScroll/HomePageScroll';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotFound } from './components/NotFound';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scroll" element={<HomePageScroll />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
);
