import type { SVGProps } from 'react';

export function Hexagon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M18 20H30M18 26H30M22 32H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
