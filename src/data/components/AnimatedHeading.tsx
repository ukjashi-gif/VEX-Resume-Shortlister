import { useState, useEffect, CSSProperties } from 'react';

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

export default function AnimatedHeading({ text, className = '', style = {} }: AnimatedHeadingProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 200); // starts after 200ms initial delay
    return () => clearTimeout(timer);
  }, []);

  const lines = text.split('\n');
  const charDelay = 30; // 30ms

  return (
    <h1 className={className} style={{ ...style, lineHeight: '1.15' }}>
      {lines.map((line, lineIndex) => {
        const lineLength = line.length;
        return (
          <span key={lineIndex} className="block whitespace-nowrap">
            {line.split('').map((char, charIndex) => {
              // Formula: (lineIndex * lineLength * charDelay) + (charIndex * charDelay)
              const delay = (lineIndex * lineLength * charDelay) + (charIndex * charDelay);
              const isSpace = char === ' ' || char === '\u00A0';
              return (
                <span
                  key={charIndex}
                  className="inline-block"
                  style={{
                    opacity: animated ? 1 : 0,
                    transform: animated ? 'translateX(0)' : 'translateX(-18px)',
                    transitionProperty: 'opacity, transform',
                    transitionDuration: '500ms',
                    transitionDelay: `${delay}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {isSpace ? '\u00A0' : char}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}
