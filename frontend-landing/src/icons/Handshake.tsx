import type { SVGProps } from 'react';

export function Handshake(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6 28L14 20L20 26L26 20L34 26L42 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 20L18 16M34 26L38 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 26L24 30L28 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
