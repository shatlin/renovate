export default function Logo3D({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="roofGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="roofSideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="wallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="wallSideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        <linearGradient id="doorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="windowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        
        {/* Shadow Filter */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2"/>
        </filter>

        {/* Glow Effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Base/Ground */}
      <ellipse cx="50" cy="85" rx="35" ry="8" fill="#E5E7EB" opacity="0.5" />

      {/* House 3D Structure */}
      
      {/* Right Wall (3D Side) */}
      <path
        d="M 70 45 L 85 38 L 85 70 L 70 77 Z"
        fill="url(#wallSideGradient)"
        opacity="0.9"
      />
      
      {/* Front Wall */}
      <rect
        x="25"
        y="45"
        width="45"
        height="32"
        rx="2"
        fill="url(#wallGradient)"
        filter="url(#shadow)"
      />
      
      {/* Roof Right Side (3D) */}
      <path
        d="M 50 20 L 75 28 L 85 38 L 75 32 Z"
        fill="url(#roofSideGradient)"
        opacity="0.9"
      />
      
      {/* Main Roof */}
      <path
        d="M 15 45 L 50 20 L 75 32 L 70 45 L 25 45 Z"
        fill="url(#roofGradient)"
        filter="url(#shadow)"
      />
      
      {/* Chimney */}
      <rect
        x="60"
        y="30"
        width="8"
        height="15"
        rx="1"
        fill="#6B7280"
        filter="url(#shadow)"
      />
      
      {/* Chimney Top */}
      <rect
        x="58"
        y="28"
        width="12"
        height="4"
        rx="1"
        fill="#4B5563"
      />
      
      {/* Door */}
      <rect
        x="42"
        y="55"
        width="14"
        height="22"
        rx="2"
        fill="url(#doorGradient)"
        filter="url(#shadow)"
      />
      
      {/* Door Knob */}
      <circle
        cx="52"
        cy="66"
        r="1.5"
        fill="#FCD34D"
      />
      
      {/* Left Window */}
      <rect
        x="30"
        y="52"
        width="10"
        height="10"
        rx="1"
        fill="url(#windowGradient)"
        filter="url(#glow)"
      />
      
      {/* Window Cross Lines */}
      <path
        d="M 35 52 L 35 62 M 30 57 L 40 57"
        stroke="#F97316"
        strokeWidth="0.5"
      />
      
      {/* Right Window */}
      <rect
        x="58"
        y="52"
        width="10"
        height="10"
        rx="1"
        fill="url(#windowGradient)"
        filter="url(#glow)"
      />
      
      {/* Window Cross Lines */}
      <path
        d="M 63 52 L 63 62 M 58 57 L 68 57"
        stroke="#F97316"
        strokeWidth="0.5"
      />
      
      {/* Attic Window */}
      <circle
        cx="50"
        cy="35"
        r="5"
        fill="url(#windowGradient)"
        filter="url(#glow)"
      />
      
      {/* Attic Window Cross */}
      <path
        d="M 50 30 L 50 40 M 45 35 L 55 35"
        stroke="#F97316"
        strokeWidth="0.5"
      />
      
      {/* Front Path */}
      <path
        d="M 45 77 L 42 85 L 58 85 L 55 77 Z"
        fill="#9CA3AF"
        opacity="0.6"
      />
      
      {/* Decorative Stars/Sparkles */}
      <g opacity="0.8">
        <circle cx="20" cy="25" r="1" fill="#FCD34D" filter="url(#glow)" />
        <circle cx="80" cy="20" r="1" fill="#FCD34D" filter="url(#glow)" />
        <circle cx="15" cy="60" r="0.8" fill="#FCD34D" filter="url(#glow)" />
        <circle cx="85" cy="55" r="0.8" fill="#FCD34D" filter="url(#glow)" />
      </g>
    </svg>
  );
}