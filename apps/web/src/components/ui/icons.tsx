import type { ReactNode } from "react";

interface IconProps {
  className?: string | undefined;
}

function Icon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "size-5"}
    >
      {children}
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function RulesIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M4 5.5C6.5 4 9.5 4 12 5.5v14C9.5 18 6.5 18 4 19.5z" />
      <path d="M20 5.5C17.5 4 14.5 4 12 5.5v14c2.5-1.5 5.5-1.5 8 0z" />
    </Icon>
  );
}

export function SheetIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M5 4h14v16H5zM9 9h6M9 13h6M9 17h3" />
    </Icon>
  );
}

export function CopyIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a1 1 0 0 1 1-1h10" />
    </Icon>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </Icon>
  );
}

export function ArrowIcon({ className }: IconProps) {
  return (
    <Icon className={className ?? "size-4"}>
      <path d="M4 12h15M14 7l5 5-5 5" />
    </Icon>
  );
}

export function BarsIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M6 19v-5M12 19V9M18 19V5" />
    </Icon>
  );
}

export function SparkStrokes({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className={className ?? "size-6"}>
      <path d="M4 14l5-2M7 6l4 4M15 3l-1 5" />
    </svg>
  );
}

export function SlidersIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </Icon>
  );
}

export function MusicIcon({ className, muted = false }: IconProps & { muted?: boolean }) {
  return (
    <Icon className={className}>
      <path d="M9 17.5V5.5l10-2v12" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="15.5" r="2.5" />
      {muted && <path d="M3.5 3.5l17 17" />}
    </Icon>
  );
}

export function SpeakerIcon({ className, muted = false }: IconProps & { muted?: boolean }) {
  return (
    <Icon className={className}>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
      {muted ? <path d="M16 9.5l5 5M21 9.5l-5 5" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" />}
    </Icon>
  );
}
