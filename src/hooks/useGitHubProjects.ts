import { useCallback, useEffect, useRef, useState } from "react";

import { readInitialProjects, refreshProjects } from "../data/githubProjects.ts";
import { shouldRevalidate, shouldRevalidateOnVisibility } from "../data/githubProjectsCore.ts";
import type { CacheState } from "../data/githubTypes.ts";
import type { ProjectCardData } from "../data/types.ts";

export type UseGitHubProjectsResult = {
  cards: ProjectCardData[];
  isRefreshing: boolean;
  hasError: boolean;
};

export function useGitHubProjects(): UseGitHubProjectsResult {
  const [initial] = useState(() => readInitialProjects(Date.now()));
  const [cards, setCards] = useState(initial.cards);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const cacheStateRef = useRef<CacheState>(initial.cacheState);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(false);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsRefreshing(true);
    try {
      const result = await refreshProjects(Date.now());
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      if (result.ok) {
        setCards(result.cards);
        cacheStateRef.current = "fresh";
        setHasError(false);
      } else if (result.failure.kind === "aborted") {
        setHasError(false);
      } else {
        setCards(previous => previous.length ? previous : result.cards);
        setHasError(true);
      }
    } catch {
      // Unexpected service failures must not escape to the page's ErrorBoundary.
      if (mountedRef.current && requestId === requestIdRef.current) setHasError(true);
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const requestIds = requestIdRef;
    mountedRef.current = true;
    if (shouldRevalidate(cacheStateRef.current)) void refresh();

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      try {
        // Re-read the shared store: another consumer may have refreshed it while hidden.
        cacheStateRef.current = readInitialProjects(Date.now()).cacheState;
        if (shouldRevalidateOnVisibility(document.visibilityState, cacheStateRef.current)) void refresh();
      } catch {
        if (mountedRef.current) setHasError(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      mountedRef.current = false;
      ++requestIds.current;
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refresh]);

  return { cards, isRefreshing, hasError };
}
