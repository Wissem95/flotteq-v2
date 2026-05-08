import type { SVGProps } from 'react';

export function Hub(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="40" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="40" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="40" cy="40" r="3" stroke="currentColor" strokeWidth="2" />
      <line x1="11" y1="11" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="37" y1="11" x2="28" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="37" x2="20" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="37" y1="37" x2="28" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
