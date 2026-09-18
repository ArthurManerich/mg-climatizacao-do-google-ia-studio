let criticalRenderPromise: Promise<void> | undefined;

// A stalled image must not block data indefinitely. This is a deadline, not a delay:
// normal load still schedules immediately, with the existing 1s idle budget.
export const CRITICAL_RENDER_MAX_WAIT_MS = 3_000;

/** Lets above-the-fold content and its image finish before background data reads. */
export function waitForCriticalRender(): Promise<void> {
  if (import.meta.env.MODE === 'test' || typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve();
  }

  criticalRenderPromise ??= new Promise((resolve) => {
    let finished = false;
    let scheduled = false;
    let idleId: number | undefined;
    let nextTask: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.removeEventListener('load', schedule);
      clearTimeout(deadline);
      if (nextTask !== undefined) clearTimeout(nextTask);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      resolve();
    };
    const schedule = () => {
      if (finished || scheduled) return;
      scheduled = true;
      window.removeEventListener('load', schedule);
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(finish, { timeout: 1_000 });
      } else {
        nextTask = globalThis.setTimeout(finish, 0);
      }
    };
    const deadline = globalThis.setTimeout(finish, CRITICAL_RENDER_MAX_WAIT_MS);

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
