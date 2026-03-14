'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

// Footprint shape (top-down view)
function Footprint() {
  return (
    <svg width="11" height="17" viewBox="0 0 11 17" fill="currentColor">
      <ellipse cx="5.5" cy="13.5" rx="3" ry="2.5" />
      <ellipse cx="5.5" cy="8"    rx="3.8" ry="4.5" />
      <ellipse cx="5.5" cy="3"    rx="4.2" ry="3" />
    </svg>
  )
}

// Top-down shoe silhouette (facing right by default)
function ShoeTop() {
  return (
    <svg width="26" height="15" viewBox="0 0 26 15" fill="currentColor">
      <path d="M23,1.5 C25,1.5 26,4 26,7.5 C26,11 25,13.5 23,13.5 L4,13.5 C2,13.5 0,11.5 0,9 L0,6 C0,3.5 2,1.5 4,1.5 Z" />
      <rect x="6" y="5.5" width="11" height="4" rx="1.5" fill="white" opacity="0.25" />
      <ellipse cx="23" cy="7.5" rx="2.2" ry="4.5" fill="white" opacity="0.18" />
    </svg>
  )
}

const PRINTS = 8
const ORBIT_R = 46  // px radius

export default function Loader() {
  const pathname = usePathname()
  const [barFill, setBarFill] = useState(false)
  const [fading, setFading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setBarFill(true)))
    const t1 = setTimeout(() => setFading(true), 1800)
    const t2 = setTimeout(() => setDone(true), 2500)
    return () => { cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (pathname?.startsWith('/admin')) return null
  if (done) return null

  return (
    <>
      <style>{`
        @keyframes ccShoeOrbit {
          from { transform: translateX(-50%) translateY(-50%) rotate(0deg)   translateX(${ORBIT_R}px); }
          to   { transform: translateX(-50%) translateY(-50%) rotate(360deg) translateX(${ORBIT_R}px); }
        }
        @keyframes ccPrintGlow {
          0%   { opacity: 0.88; }
          18%  { opacity: 0.42; }
          38%  { opacity: 0.1;  }
          62%  { opacity: 0.1;  }
          82%  { opacity: 0.42; }
          100% { opacity: 0.88; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
        style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.7s ease' }}
      >
        <div className="flex flex-col items-center select-none">

          {/* ── Circular shoeprint orbit ── */}
          <div
            style={{
              position: 'relative',
              width: ORBIT_R * 2 + 40,
              height: ORBIT_R * 2 + 40,
            }}
          >
            {/* Shoeprints at fixed positions */}
            {Array.from({ length: PRINTS }).map((_, i) => {
              const angleDeg = i * (360 / PRINTS) - 90  // start at top
              const angleRad = (angleDeg * Math.PI) / 180
              const cx = ORBIT_R * Math.cos(angleRad)
              const cy = ORBIT_R * Math.sin(angleRad)
              // alternate left/right prints by flipping on even indices
              const flip = i % 2 === 0 ? 1 : -1
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `calc(50% + ${cx}px)`,
                    top:  `calc(50% + ${cy}px)`,
                    transform: `translate(-50%, -50%) rotate(${angleDeg + 90}deg) scaleX(${flip})`,
                    color: '#1a1a1a',
                    animation: `ccPrintGlow 2s linear infinite`,
                    animationDelay: `${-(i * (2 / PRINTS)).toFixed(3)}s`,
                  }}
                >
                  <Footprint />
                </div>
              )
            })}

            {/* Orbiting shoe (top-down view, faces direction of travel) */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                color: '#111111',
                animation: `ccShoeOrbit 2s linear infinite`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))',
              }}
            >
              <ShoeTop />
            </div>
          </div>

          {/* Brand name */}
          <h1
            className="font-black text-black uppercase tracking-[0.1em]"
            style={{ fontSize: 'clamp(1.5rem, 6vw, 2.6rem)', marginTop: 8 }}
          >
            CLASSYCHAIN
          </h1>

          {/* Divider */}
          <div className="flex items-center gap-3 my-3">
            <div className="h-px w-14 bg-black/15" />
            <div className="w-1 h-1 bg-black/30 rotate-45" />
            <div className="h-px w-14 bg-black/15" />
          </div>

          {/* Progress bar */}
          <div className="w-44 h-px bg-black/[0.08] relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-black"
              style={{
                width: barFill ? '100%' : '0%',
                transition: barFill ? 'width 1.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
              }}
            />
          </div>

          <p className="text-black/30 text-[9px] font-bold tracking-[0.45em] uppercase mt-4">
            Premium Footwear
          </p>
        </div>
      </div>
    </>
  )
}
