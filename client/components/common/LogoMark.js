"use client";

export function LogoMark({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <defs>
        <linearGradient id="myreportMark" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#A5B4FC" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FDE68A" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path
        d="M4.5 18.5V5.5c0-.55.45-1 1-1h2.1c.55 0 1 .45 1 1v6.2l2-2.2c.19-.2.45-.32.72-.32h1.42c.86 0 1.3 1.03.7 1.63l-2.95 2.95 3.2 3.48c.6.65.14 1.7-.74 1.7H11c-.28 0-.55-.12-.74-.32l-2.3-2.6v2.2c0 .55-.45 1-1 1H5.5c-.55 0-1-.45-1-1Z"
        fill="url(#myreportMark)"
        opacity="0.95"
      />
      <path
        d="M14 18.5V8.2c0-.55.45-1 1-1h1.6c.55 0 1 .45 1 1v1.2c.95-1.15 2.2-1.75 3.75-1.75.55 0 1 .45 1 1v1.7c0 .55-.45 1-1 1-1.2 0-2.12.33-2.76.98-.64.65-.96 1.58-.96 2.79v3.36c0 .55-.45 1-1 1H15c-.55 0-1-.45-1-1Z"
        fill="url(#myreportMark)"
        opacity="0.85"
      />
      <path
        d="M4 20.5h16.8"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

