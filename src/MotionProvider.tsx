import { useEffect, useState, type ReactNode } from 'react';
import { LazyMotion } from 'framer-motion';
import { loadFeaturesForLazyMotion, loadMotionFeatures } from './motionFeatures';

function MotionReady({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    let mounted = true;
    // Child effects run before LazyMotion's parent effect. Defer the ready
    // update one microtask after import resolution so LazyMotion's handler
    // installs the renderer before any m component is mounted.
    loadFeaturesForLazyMotion().then(() => {
      queueMicrotask(() => { if (mounted) setReady(true); });
    });
    loadMotionFeatures().catch((reason: unknown) => {
      if (mounted) setError(reason);
    });
    return () => { mounted = false; };
  }, []);

  if (error) throw error;
  return ready ? children : null;
}

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeaturesForLazyMotion} strict>
      <MotionReady>{children}</MotionReady>
    </LazyMotion>
  );
}
