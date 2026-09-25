'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export function RetailVsPexpacksSlider() {
  const [sliderPos, setSliderPos] = useState<number>(50)
  const [isInteracting, setIsInteracting] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef<boolean>(false)
  const hasAutoSweptRef = useRef<boolean>(false)

  // Calculate position from mouse or touch event
  const updatePositionFromEvent = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const offsetX = clientX - rect.left
    const newPos = Math.max(0, Math.min(100, (offsetX / rect.width) * 100))
    setSliderPos(newPos)
  }, [])

  // Mouse & Touch Drag Handlers
  const handleStart = (clientX: number) => {
    isDraggingRef.current = true
    setIsInteracting(true)
    updatePositionFromEvent(clientX)
  }

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDraggingRef.current) return
      updatePositionFromEvent(clientX)
    },
    [updatePositionFromEvent],
  )

  const handleEnd = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX)
    const onMouseUp = () => handleEnd()
    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches[0]) {
        handleMove(e.touches[0].clientX)
      }
    }
    const onTouchEnd = () => handleEnd()

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [handleMove, handleEnd])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    setIsInteracting(true)
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setSliderPos((prev) => Math.max(0, prev - 5))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setSliderPos((prev) => Math.min(100, prev + 5))
    }
  }

  // Auto-sweep intro hint animation on initial scroll into view
  useEffect(() => {
    if (hasAutoSweptRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !isInteracting && !hasAutoSweptRef.current) {
          hasAutoSweptRef.current = true
          let startTime: number | null = null

          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const elapsed = timestamp - startTime

            if (isInteracting) return // Stop if user takes over

            if (elapsed < 2400) {
              // Smooth sine wave oscillation 50% -> 35% -> 65% -> 50%
              const progress = elapsed / 2400
              const wave = Math.sin(progress * Math.PI * 2) * 16
              setSliderPos(50 + wave)
              requestAnimationFrame(animate)
            } else {
              setSliderPos(50)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 },
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [isInteracting])

  // Dynamic box loading opacity & scaling based on slider position (0% retail = empty, 100% Pexpacks = fully loaded)
  const box1Opacity = Math.min(1, Math.max(0, (sliderPos - 10) / 25))
  const box2Opacity = Math.min(1, Math.max(0, (sliderPos - 40) / 25))
  const box3Opacity = Math.min(1, Math.max(0, (sliderPos - 70) / 20))

  return (
    <section className="py-[clamp(36px,6vw,72px)] bg-pex-bg-soft" aria-label="Retail run versus Pexpacks comparison">
      <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8">
        <div className="relative bg-card border border-pex-border rounded-card md:rounded-[clamp(20px,3vw,28px)] p-4 sm:p-[clamp(20px,3vw,36px)] shadow-card">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-[clamp(16px,2.5vw,24px)] gap-4 flex-wrap max-sm:flex-col max-sm:items-start max-sm:gap-1.5">
            <p className="text-pex-keppel text-sm font-semibold leading-tight normal-case m-0 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pex-keppel inline-block animate-pulse" aria-hidden="true" />
              DRAG THE LINE
            </p>
            <h2 className="text-pex-navy font-heading text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold m-0 leading-[1.02] tracking-normal text-balance">
              DIY vs. Pexpacks ready
            </h2>
          </div>

          {/* Interactive Split Frame */}
          <div
            ref={containerRef}
            className="relative w-full min-h-[clamp(320px,38vw,380px)] max-sm:min-h-[390px] rounded-[clamp(16px,2vw,22px)] overflow-hidden select-none cursor-ew-resize [touch-action:pan-y] shadow-[inset_0_2px_6px_rgba(0,0,0,0.05)]"
            onMouseDown={(e) => handleStart(e.clientX)}
            onTouchStart={(e) => {
              if (e.touches[0]) handleStart(e.touches[0].clientX)
            }}
            role="slider"
            aria-label="Drag comparison slider between DIY shopping and Pexpacks ready"
            aria-valuenow={Math.round(sliderPos)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {/* Layer 1: Dark Teal Pexpacks Side (Bottom) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#153b3f] to-[#0d282b] text-white p-[clamp(24px,4vw,40px)] max-sm:p-[18px] flex flex-col justify-between">
              <span className="self-start bg-white/15 backdrop-blur-md text-white text-xs font-bold py-1.5 px-3.5 rounded-full border border-white/20">
                Pexpacks ready
              </span>
              <h3 className="font-heading text-[clamp(24px,3.8vw,42px)] font-extrabold leading-[1.1] text-white my-[clamp(12px,2vw,20px)] max-w-[580px] tracking-[-0.01em]">
                Zero trips. 100% exact list. Delivered to your door.
              </h3>
              <div className="flex gap-[clamp(10px,2vw,16px)] max-sm:gap-2 flex-wrap">
                <div className="bg-white/[0.08] border border-white/15 backdrop-blur-md rounded-[14px] py-[clamp(10px,1.8vw,16px)] px-[clamp(14px,2vw,20px)] max-sm:py-2.5 max-sm:px-3 min-w-[130px] max-sm:min-w-[110px] flex-1">
                  <div className="text-[clamp(18px,2.2vw,24px)] font-extrabold text-emerald-400 mb-0.5">100% Ready</div>
                  <div className="text-[clamp(11px,1.2vw,13px)] text-white/80 font-semibold leading-[1.2]">Labelled, checked, and delivered</div>
                </div>
                <div className="bg-white/[0.08] border border-white/15 backdrop-blur-md rounded-[14px] py-[clamp(10px,1.8vw,16px)] px-[clamp(14px,2vw,20px)] max-sm:py-2.5 max-sm:px-3 min-w-[130px] max-sm:min-w-[110px] flex-1">
                  <div className="text-[clamp(18px,2.2vw,24px)] font-extrabold text-emerald-400 mb-0.5">&lt; 2 mins</div>
                  <div className="text-[clamp(11px,1.2vw,13px)] text-white/80 font-semibold leading-[1.2]">Order online in under 2 mins</div>
                </div>
              </div>
            </div>

            {/* Layer 2: Light Peach Retail Side (Top clipped) */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#fff4f0] to-[#ffe9e2] text-pex-navy p-[clamp(24px,4vw,40px)] max-sm:p-[18px] flex flex-col justify-between pointer-events-none z-[2]"
              style={{ clipPath: `inset(0 calc(100% - ${sliderPos}%) 0 0)` }}
            >
              <span className="self-start bg-white text-slate-800 text-xs font-bold py-1.5 px-3.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                DIY shopping
              </span>
              <h3 className="font-heading text-[clamp(24px,3.8vw,42px)] font-extrabold leading-[1.1] text-pex-navy my-[clamp(12px,2vw,20px)] max-w-[580px] tracking-[-0.01em]">
                More trips. More gaps. More last–minute stress.
              </h3>
              <div className="flex gap-[clamp(10px,2vw,16px)] max-sm:gap-2 flex-wrap">
                <div className="bg-white border border-slate-100 rounded-[14px] py-[clamp(10px,1.8vw,16px)] px-[clamp(14px,2vw,20px)] max-sm:py-2.5 max-sm:px-3 shadow-[0_4px_14px_rgba(15,23,42,0.04)] min-w-[130px] max-sm:min-w-[110px] flex-1">
                  <div className="text-[clamp(18px,2.2vw,24px)] font-extrabold text-pex-coral mb-0.5">3–4 hrs</div>
                  <div className="text-[clamp(11px,1.2vw,13px)] text-slate-500 font-semibold leading-[1.2]">Driving, parking, queuing</div>
                </div>
                <div className="bg-white border border-slate-100 rounded-[14px] py-[clamp(10px,1.8vw,16px)] px-[clamp(14px,2vw,20px)] max-sm:py-2.5 max-sm:px-3 shadow-[0_4px_14px_rgba(15,23,42,0.04)] min-w-[130px] max-sm:min-w-[110px] flex-1">
                  <div className="text-[clamp(18px,2.2vw,24px)] font-extrabold text-pex-coral mb-0.5">Risk</div>
                  <div className="text-[clamp(11px,1.2vw,13px)] text-slate-500 font-semibold leading-[1.2]">Missing or sold–out items</div>
                </div>
              </div>
            </div>

            {/* Split Divider Line */}
            <div className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.25)] z-10 -translate-x-1/2 pointer-events-none" style={{ left: `${sliderPos}%` }}>
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 max-sm:w-[42px] max-sm:h-[42px] rounded-full bg-white border border-slate-200/90 shadow-[0_8px_24px_rgba(15,23,42,0.2)] flex items-center justify-center text-pex-navy cursor-ew-resize pointer-events-auto transition-[transform,box-shadow] duration-150 hover:scale-110 hover:shadow-[0_12px_28px_rgba(33,158,154,0.3)] focus-visible:scale-110 focus-visible:shadow-[0_12px_28px_rgba(33,158,154,0.3)] focus-visible:outline-none"
                aria-hidden="true"
                title="Drag left or right to compare"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="-mt-0.5 -ml-1.5"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="-mt-0.5 -mr-1.5"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Track with Synced Delivery Van */}
          <div className="relative mt-[clamp(46px,5vw,64px)] max-sm:mt-[54px] pt-6 max-sm:pt-[42px] border-t border-dashed border-slate-300">
            <div className="flex justify-between items-center text-[clamp(11px,1.2vw,13px)] font-bold">
              <span className="text-slate-400">DIY stress</span>
              <span className="text-pex-keppel">Pexpacks ready</span>
            </div>

            {/* Delivery Van SVG tied to sliderPos */}
            <div
              className="absolute top-[-56px] max-sm:top-[-40px] -translate-x-1/2 transition-[left,transform] duration-[60ms,200ms] ease-out pointer-events-none"
              style={{
                left: `${sliderPos}%`,
                transform: `translateX(-50%) scaleX(${sliderPos < 50 ? -1 : 1})`,
              }}
            >
              <div className="flex flex-col items-center drop-shadow-[0_8px_18px_rgba(15,23,42,0.18)] [&_svg]:max-sm:w-[122px] [&_svg]:max-sm:h-[68px]">
                <svg
                  width="140"
                  height="78"
                  viewBox="0 0 180 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* CARGO BOXES (DYNAMICALLY LOADED AS TRUCK MOVES TO PEXPACKS READY) */}
                  {/* Box 1 (Left Cargo Box) */}
                  <g
                    style={{
                      opacity: box1Opacity,
                      transform: `scale(${0.75 + box1Opacity * 0.25})`,
                      transformOrigin: '97px 42px',
                      transition: 'opacity 120ms ease-out, transform 120ms ease-out',
                    }}
                  >
                    <rect x="74" y="24" width="46" height="36" rx="3" fill="#E59866" stroke="#B45309" strokeWidth="1.5" />
                    <line x1="97" y1="24" x2="97" y2="60" stroke="#1E293B" strokeWidth="2" />
                    <rect x="80" y="34" width="34" height="16" rx="2" fill="#FFFFFF" />
                    <circle cx="85" cy="42" r="3" fill="#219E9A" />
                    <text x="99" y="44.5" fill="#1A2A40" fontSize="6" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                      PEXPACKS
                    </text>
                  </g>

                  {/* Box 2 (Right Cargo Box) */}
                  <g
                    style={{
                      opacity: box2Opacity,
                      transform: `scale(${0.75 + box2Opacity * 0.25})`,
                      transformOrigin: '147px 42px',
                      transition: 'opacity 120ms ease-out, transform 120ms ease-out',
                    }}
                  >
                    <rect x="124" y="24" width="46" height="36" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
                    <line x1="147" y1="24" x2="147" y2="60" stroke="#1E293B" strokeWidth="2" />
                    <rect x="130" y="34" width="34" height="16" rx="2" fill="#FFFFFF" />
                    <circle cx="135" cy="42" r="3" fill="#FF6F59" />
                    <text x="149" y="44.5" fill="#1A2A40" fontSize="6" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                      PEXPACKS
                    </text>
                  </g>

                  {/* Box 3 (Top Stacked Box) */}
                  <g
                    style={{
                      opacity: box3Opacity,
                      transform: `scale(${0.75 + box3Opacity * 0.25})`,
                      transformOrigin: '122px 13px',
                      transition: 'opacity 120ms ease-out, transform 120ms ease-out',
                    }}
                  >
                    <rect x="98" y="4" width="48" height="20" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                    <rect x="106" y="8" width="32" height="12" rx="2" fill="#FFFFFF" />
                    <circle cx="110" cy="14" r="2.5" fill="#219E9A" />
                    <text x="124" y="16.5" fill="#1A2A40" fontSize="5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                      PEXPACKS
                    </text>
                  </g>

                  {/* TRUCK CABIN & FLATBED BODY (MATCHING ATTACHED REFERENCE IMAGE STYLE IN PEXPACKS COLOURS) */}
                  {/* Flatbed Cargo Rail & Side Wall */}
                  <rect x="70" y="60" width="104" height="16" fill="#FF6F59" stroke="#E11D48" strokeWidth="1.5" />
                  <rect x="70" y="56" width="104" height="5" fill="#E11D48" />

                  {/* Cabin Body Front (Sloping hood, curved roof) */}
                  <path
                    d="M6 82 L16 52 C20 44 26 30 38 28 H66 V82 H6 Z"
                    fill="#FF6F59"
                    stroke="#E11D48"
                    strokeWidth="1.5"
                  />

                  {/* Windshield & Side Window (Dark Tint with Sheen) */}
                  <path
                    d="M26 40 C30 34 34 32 40 32 H62 V58 H22 Z"
                    fill="#1E293B"
                  />
                  <path
                    d="M30 38 C33 35 36 34 40 34 H58 V46 H26 Z"
                    fill="rgba(255,255,255,0.22)"
                  />

                  {/* Side Door Outline & Handle */}
                  <path d="M22 58 H64 V78 H22 Z" fill="none" stroke="#E11D48" strokeWidth="1.5" />
                  <rect x="52" y="62" width="8" height="3" rx="1.5" fill="#1E293B" />

                  {/* Side Mirror */}
                  <rect x="16" y="44" width="8" height="16" rx="4" fill="#1E293B" />
                  <rect x="18" y="46" width="4" height="12" rx="2" fill="#219E9A" />

                  {/* Headlight & Indicator */}
                  <path d="M6 62 C6 58 10 58 10 62 V72 H6 Z" fill="#FBBF24" />
                  <rect x="8" y="73" width="3" height="4" rx="1" fill="#F97316" />

                  {/* Front Bumper (Metallic Grey) */}
                  <rect x="0" y="74" width="14" height="14" rx="3" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />

                  {/* Rear Tail Light & Bumper */}
                  <rect x="172" y="64" width="4" height="10" rx="1" fill="#E11D48" />
                  <rect x="172" y="76" width="6" height="10" rx="2" fill="#475569" />

                  {/* WHEELS & RIMS (MATCHING REFERENCE IMAGE DETAILED RIMS) */}
                  {/* Front Wheel */}
                  <circle cx="34" cy="82" r="16" fill="#1E293B" />
                  <circle cx="34" cy="82" r="10" fill="#475569" />
                  <circle cx="34" cy="82" r="6" fill="#CBD5E1" />
                  <circle cx="34" cy="82" r="2.5" fill="#1E293B" />

                  {/* Rear Wheel */}
                  <circle cx="142" cy="82" r="16" fill="#1E293B" />
                  <circle cx="142" cy="82" r="10" fill="#475569" />
                  <circle cx="142" cy="82" r="6" fill="#CBD5E1" />
                  <circle cx="142" cy="82" r="2.5" fill="#1E293B" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
