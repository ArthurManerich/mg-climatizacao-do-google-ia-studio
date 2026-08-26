let criticalRenderPromise: Promise<void> | undefined;

/** Lets above-the-fold content and its image finish before background data reads. */
export function waitForCriticalRender(): Promise<void> {
  if (import.meta.env.MODE === 'test' || typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve();
  }

  criticalRenderPromise ??= new Promise((resolve) => {
    const schedule = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => resolve(), { timeout: 1_000 });
      } else {
        globalThis.setTimeout(resolve, 0);
      }
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }
  });

  return criticalRenderPromise;
}

export function waitForSectionProximity(sectionId: string): Promise<void> {
  if (
    import.meta.env.MODE === 'test' ||
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    !('IntersectionObserver' in window)
  ) {
    return Promise.resolve();
  }

  const section = document.getElementById(sectionId);
  if (!section) return Promise.resolve();

  return new Promise((resolve) => {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      resolve();
    }, { rootMargin: '800px 0px' });

    observer.observe(section);
  });
}
