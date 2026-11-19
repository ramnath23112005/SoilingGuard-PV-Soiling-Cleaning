type IconProps = { className?: string; title?: string };

export function Wordmark({ className = "", title }: IconProps) {
  return (
    <svg
      viewBox="0 0 128 34"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      fill="none"
    >
      <g
        stroke="currentColor"
        strokeWidth={4.4}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit={6}
      >
        <path d="M0 3 L12 26 L24 3" />
        <path d="M34 3 L46 17 L58 3" />
        <path d="M46 17 L46 31" />
        <path d="M71 31 L71 3 L79 3 A7.5 7.5 0 0 1 79 18 L71 18" />
        <path d="M79 18 L90 31" />
        <path d="M102 17 a11 14 0 1 0 22 0 a11 14 0 1 0 -22 0" />
      </g>
    </svg>
  );
}

export function VMark({ className = "", title }: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M0 0H32V32H0V0ZM7.3 7.5H11.8L16 21L20.2 7.5H24.7L18.4 26.8H13.6L7.3 7.5Z"
      />
    </svg>
  );
}
