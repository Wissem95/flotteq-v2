import type { SVGProps } from 'react';

export function Backup(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="24" cy="12" rx="14" ry="4" stroke="currentColor" strokeWidth="2" />
      <path d="M10 12V24C10 26.21 16.27 28 24 28C31.73 28 38 26.21 38 24V12" stroke="currentColor" strokeWidth="2" />
      <path d="M10 24V36C10 38.21 16.27 40 24 40C31.73 40 38 38.21 38 36V24" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
