// Small, hand-drawn icon set used across the app instead of emoji.
// Kept dependency-free (no icon package) — plain 24x24 stroke icons.

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function CameraIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.4a1.5 1.5 0 0 0 1.2-.6l.9-1.2A1.5 1.5 0 0 1 10.2 4.6h3.6a1.5 1.5 0 0 1 1.2.6l.9 1.2a1.5 1.5 0 0 0 1.2.6h2.4A1.5 1.5 0 0 1 21 8.5V17a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17V8.5Z" />
      <circle cx="12" cy="12.5" r="3.4" />
    </svg>
  );
}

export function GraduationCapIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="m2.5 9 9.5-4.5L21.5 9 12 13.5 2.5 9Z" />
      <path d="M6 11.2V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.8" />
      <path d="M21.5 9v5.5" />
    </svg>
  );
}

export function Volume2Icon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9.5v5h3.2L12 18.3V5.7L7.2 9.5H4Z" />
      <path d="M16.2 9a4.2 4.2 0 0 1 0 6" />
      <path d="M18.6 6.6a7.8 7.8 0 0 1 0 10.8" />
    </svg>
  );
}

export function StopCircleIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

export function CopyIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15 8.5V6.5A2 2 0 0 0 13 4.5H6a2 2 0 0 0-2 2V13a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 6.5h15" />
      <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
      <path d="M6.5 6.5 7.2 19a2 2 0 0 0 2 1.9h5.6a2 2 0 0 0 2-1.9l.7-12.5" />
      <path d="M10.2 10.5v6" />
      <path d="M13.8 10.5v6" />
    </svg>
  );
}

export function PlayIcon(props) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function MenuIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function CheckCircleIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.2 12.3 2.4 2.4 5.2-5.4" />
    </svg>
  );
}

export function XCircleIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </svg>
  );
}

export function SparkleIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4.5 13.4 9.4 18.3 10.8 13.4 12.2 12 17.1 10.6 12.2 5.7 10.8 10.6 9.4 12 4.5Z" />
    </svg>
  );
}
