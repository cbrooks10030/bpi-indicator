type IconProps = { className?: string };

const base = "h-6 w-6";

export function Icon({ name, className }: { name: string; className?: string }) {
  const map: Record<string, (p: IconProps) => JSX.Element> = {
    chart: Chart,
    pulse: Pulse,
    layers: Layers,
    gap: Gap,
    target: Target,
    bell: Bell,
  };
  const Cmp = map[name] ?? Chart;
  return <Cmp className={className ?? base} />;
}

export function Chart({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l3-4 3 3 4-6" />
    </svg>
  );
}
export function Pulse({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </svg>
  );
}
export function Layers({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  );
}
export function Gap({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="6" height="7" rx="1" />
      <rect x="14" y="13" width="6" height="7" rx="1" />
      <path d="M7 11v2M17 11v2" />
    </svg>
  );
}
export function Target({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}
export function Bell({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  );
}
export function Check({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
export function Discord({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.3 4.4A19.8 19.8 0 0015.4 3l-.2.4a18.3 18.3 0 015 .9c-2.2-1-4.3-1.3-6.2-1.3s-4 .3-6.2 1.3c1.6-.6 3.3-.9 5-1L12.6 3A19.8 19.8 0 003.7 4.4C1.1 8.3.4 12.1.8 15.9A19.9 19.9 0 006.8 19l.5-.7c-1-.3-1.9-.7-2.7-1.2l.7-.5c3.6 1.7 7.6 1.7 11.2 0l.7.5c-.8.5-1.7.9-2.7 1.2l.5.7a19.9 19.9 0 006-3.1c.5-4.4-.7-8.2-2.7-11.5zM9 14.3c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" />
    </svg>
  );
}
