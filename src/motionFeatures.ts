// Keep the feature bundle out of the initial static import graph.
const features = import('./domAnimationFeatures').then(({ default: domAnimation }) => domAnimation);
const safeFeatures = features.catch(() => new Promise<never>(() => {}));

export const loadMotionFeatures = () => features;

// LazyMotion in the installed framer-motion version has no rejection handler
// for its async features. MotionReady reports failures via ErrorBoundary; keep
// LazyMotion's own promise pending on failure to avoid an unhandled rejection.
export const loadFeaturesForLazyMotion = () => safeFeatures;
