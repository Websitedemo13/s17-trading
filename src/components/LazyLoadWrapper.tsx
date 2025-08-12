import { useState, useEffect, useRef, ReactNode, memo } from 'react';

interface LazyLoadWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  delay?: number;
  rootMargin?: string;
  threshold?: number;
}

const LazyLoadWrapper = memo(({ 
  children, 
  fallback = <div className="animate-pulse bg-muted/20 rounded-lg h-32"></div>,
  delay = 0,
  rootMargin = '100px',
  threshold = 0.1
}: LazyLoadWrapperProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, delay]);

  return (
    <div ref={ref}>
      {shouldLoad ? children : fallback}
    </div>
  );
});

LazyLoadWrapper.displayName = 'LazyLoadWrapper';

export default LazyLoadWrapper;
