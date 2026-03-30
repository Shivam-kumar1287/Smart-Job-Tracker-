/**
 * Reusable Logo component for Smart Job Tracker.
 * Renders an inline SVG so no external file dependency is needed.
 *
 * Props:
 *   size   – "sm" | "md" | "lg" | "xl" (default "md")
 *   light  – true for white text (use on dark backgrounds)
 *   showText – true to show "Smart Job Tracker" next to the icon
 *   className – extra wrapper classes
 */
export default function Logo({ size = "md", light = false, showText = true, className = "" }) {
  const sizes = {
    sm: { icon: 28, text: "text-base",  gap: "gap-2" },
    md: { icon: 36, text: "text-xl",    gap: "gap-2.5" },
    lg: { icon: 48, text: "text-2xl",   gap: "gap-3" },
    xl: { icon: 64, text: "text-3xl",   gap: "gap-4" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex items-center ${s.gap} ${className}`}>
      {/* Icon mark — briefcase + upward arrow */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {/* Rounded square background */}
        <rect width="64" height="64" rx="16" fill="url(#logoGrad)" />
        {/* Briefcase body */}
        <rect x="12" y="24" width="40" height="26" rx="4" fill="white" fillOpacity="0.95" />
        {/* Briefcase handle */}
        <path d="M24 24V20C24 17.7909 25.7909 16 28 16H36C38.2091 16 40 17.7909 40 20V24" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Upward arrow / rocket */}
        <path d="M32 22L32 42" stroke="url(#logoGrad)" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M26 29L32 22L38 29" stroke="url(#logoGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Small check at bottom */}
        <path d="M27 38L30 41L37 34" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>

      {showText && (
        <span className={`${s.text} font-extrabold tracking-tight leading-none select-none ${
          light
            ? "text-white"
            : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        }`}>
          Smart Job Tracker
        </span>
      )}
    </div>
  );
}
