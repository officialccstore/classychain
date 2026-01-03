'use client'

import { useEffect, useState } from 'react'

export default function Loader() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Hide loader after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-transparent to-yellow-400 opacity-20 animate-pulse"></div>
      </div>

      {/* Loader Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Animated Circle */}
        <div className="relative w-32 h-32 mb-8">
          {/* Outer rotating circle */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-400 border-r-yellow-400 animate-spin"></div>

          {/* Middle rotating circle (slower) */}
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-yellow-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>

          {/* Inner pulsing circle */}
          <div className="absolute inset-4 rounded-full border-2 border-yellow-400/50 animate-pulse"></div>

          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl animate-bounce">👟</div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-black text-white mb-4 tracking-wider">
          CLASSYCHAIN
        </h1>

        {/* Loading Text with animation */}
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 font-bold">Loading</span>
          <span className="inline-flex gap-1">
            <span className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          </span>
        </div>

        {/* Tagline */}
        <p className="text-gray-400 text-sm mt-6 tracking-widest">STEP INTO STYLE</p>
      </div>

      {/* Animated gradient lines */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
    </div>
  )
}
