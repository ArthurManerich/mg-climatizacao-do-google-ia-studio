import { type ReactNode, useEffect, useRef, useState } from 'react';

interface DeferredSectionProps {
  anchorId: string;
  children: ReactNode;
  placeholderClassName: string;
}

export default function DeferredSection({
  anchorId,
  children,
  placeholderClassName,
}: DeferredSectionProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const placeholder = placeholderRef.current;

    if (!placeholder || typeof window.IntersectionObserver !== 'function') {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: '900px 0px' },
    );

    observer.observe(placeholder);
    return () => observer.disconnect();
  }, []);

  if (shouldRender) return children;

  return (
    <div
      ref={placeholderRef}
      id={anchorId}
      className={placeholderClassName}
      aria-hidden="true"
    />
  );
}
