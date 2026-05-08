import type { SVGProps } from 'react';

export function FlagFR(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="6" y="10" width="12" height="28" fill="#0055A4" />
      <rect x="18" y="10" width="12" height="28" fill="white" stroke="currentColor" strokeWidth="0.5" />
      <rect x="30" y="10" width="12" height="28" fill="#EF4135" />
    </svg>
  );
}
