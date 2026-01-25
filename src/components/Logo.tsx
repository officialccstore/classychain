export function Logo({ size = 'md', variant = 'default' }: { size?: 'sm' | 'md' | 'lg'; variant?: 'default' | 'light' | 'dark' }) {
  const textSizeClasses = {
    sm: 'text-xs sm:text-xs md:text-sm lg:text-base',
    md: 'text-sm sm:text-base md:text-lg lg:text-xl',
    lg: 'text-base sm:text-lg md:text-2xl lg:text-3xl',
  }

  const colorClasses = {
    default: 'text-yellow-500',
    light: 'text-white',
    dark: 'text-gray-900',
  }

  return (
    <div className={`${colorClasses[variant]} font-black tracking-wider ${textSizeClasses[size]}`}>
      CC
    </div>
  )
}

export function LogoWithText({ size = 'md', variant = 'default' }: { size?: 'sm' | 'md' | 'lg'; variant?: 'default' | 'light' | 'dark' }) {
  const textSizeClasses = {
    sm: 'text-sm sm:text-base md:text-lg lg:text-2xl',
    md: 'text-lg sm:text-xl md:text-3xl lg:text-4xl',
    lg: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  }

  const taglineSizeClasses = {
    sm: 'text-[10px] sm:text-xs md:text-xs lg:text-sm',
    md: 'text-xs sm:text-xs md:text-sm lg:text-sm',
    lg: 'text-xs sm:text-sm md:text-sm lg:text-sm',
  }

  const colorTextClasses = {
    default: 'text-gray-900',
    light: 'text-white',
    dark: 'text-gray-900',
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
      <div className={`${colorTextClasses[variant]} font-black tracking-tight ${textSizeClasses[size]}`} style={{ fontFamily: '"Zalando Sans Expanded", sans-serif', fontOpticalSizing: 'auto' }}>
        CLASSY CHAIN
      </div>
    </div>
  )
}
