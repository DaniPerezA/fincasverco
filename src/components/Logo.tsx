export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Fincas Verco"
    >
      {/* Edificios que dibujan una F sutil */}
      <path
        d="M7 32V12a1 1 0 011-1h6a1 1 0 011 1v20H7z"
        fill="currentColor"
      />
      <path
        d="M17 32V17a1 1 0 011-1h5a1 1 0 011 1v16h-7z"
        fill="currentColor"
      />
      <path
        d="M26 32V20a1 1 0 011-1h5a1 1 0 011 1v12h-7z"
        fill="currentColor"
      />
      {/* Barra superior y media de la F */}
      <rect x="7" y="11" width="20" height="3" rx="1" fill="currentColor" />
      <rect x="7" y="20" width="14" height="2.5" rx="1" fill="currentColor" />
      {/* Manos bajo los edificios que dibujan una V sutil */}
      <path
        d="M6 34c1.5-2 3-3.5 5-4.5 1-.5 2-.5 2.5.5.3.6.2 1.3-.2 1.8-.5.7-1.5 1.2-2.5 1.8-1.2.7-2.5 1.5-3.8 2.5-.6.4-1.3.4-1.8-.1-.4-.4-.4-1.1-.2-2z"
        fill="currentColor"
      />
      <path
        d="M34 34c-1.5-2-3-3.5-5-4.5-1-.5-2-.5-2.5.5-.3.6-.2 1.3.2 1.8.5.7 1.5 1.2 2.5 1.8 1.2.7 2.5 1.5 3.8 2.5.6.4 1.3.4 1.8-.1.4-.4.4-1.1.2-2z"
        fill="currentColor"
      />
    </svg>
  );
}
