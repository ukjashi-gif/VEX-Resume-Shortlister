import { useState, useEffect, ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay: number; // in milliseconds
  duration?: number; // in milliseconds, defaults to 1000
  className?: string;
}

export default function FadeIn({ children, delay, duration = 1000, className = '' }: FadeInProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ease-out ${visible ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
