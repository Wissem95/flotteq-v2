import type { SVGProps } from 'react';

export function LockTLS(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="10" y="22" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M16 22V14C16 9.58 19.58 6 24 6C28.42 6 32 9.58 32 14V22" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="32" r="2" fill="currentColor" />
    </svg>
  );
}
