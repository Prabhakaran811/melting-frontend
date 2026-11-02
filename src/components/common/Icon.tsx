import type { ReactNode } from "react";

const PATHS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  flame: (
    <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.3 1.2 1 1.8 1.8 2C11 8.5 11 5.5 12 3z" />
  ),
  factory: (
    <>
      <path d="M3 21V11l6 4v-4l6 4V5h4v16z" />
      <path d="M7 21v-3M12 21v-3M17 21v-3" />
    </>
  ),
  inspect: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
      <path d="m8.5 11 1.8 1.8 3.2-3.6" />
    </>
  ),
  reports: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16v-5M12 16V8M16 16v-3" />
    </>
  ),
  admin: (
    <>
      <path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6z" />
      <path d="m9 12 2.2 2.2L15 10.5" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  panel: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </>
  ),
  bell: (
    <>
      <path d="M6 17v-6a6 6 0 1 1 12 0v6l1.5 2h-15z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </>
  ),
  logout: (
    <>
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
      <path d="m16 8 4 4-4 4" />
      <path d="M20 12H9" />
    </>
  ),
  

edit: (
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
  </>
),

power: (
  <>
    <path d="M12 2v10" />
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
  </>
),

trash: (
  <>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </>
),


  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </>
  ),
  master: (
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </>
),

} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

type Props = {
  name: IconName;
  size?: number;
  className?: string;
};

export default function Icon({ name, size = 20, className }: Props) {
  return (
    <svg
  className={className}
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth={2.2}
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"
>
  {PATHS[name]}
</svg>
  );
}