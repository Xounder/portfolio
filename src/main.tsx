import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import { HomePage } from './pages/HomePage/HomePage';
import { MotionProvider } from './MotionProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotFound } from './components/NotFound';

const HomePageScroll = lazy(() =>
  import('./pages/HomePageScroll/HomePageScroll').then(({ HomePageScroll }) => ({ default: HomePageScroll })),
);

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <MotionProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scroll" element={<HomePageScroll />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionProvider>
  </ErrorBoundary>
);
