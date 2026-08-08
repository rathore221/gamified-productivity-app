export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />
      <circle cx="20" cy="20" r="12.5" stroke="white" strokeOpacity="0.3" strokeWidth="2" fill="none" />
      <path d="M22.5 11 L15 22 H19.5 L17.5 31 L26 18.5 H21 L22.5 11Z" fill="white" />
    </svg>
  )
}