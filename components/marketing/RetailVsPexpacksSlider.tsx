'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './RetailVsPexpacksSlider.module.css'

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
    <section className={styles.section} aria-label="Retail run versus Pexpacks comparison">
      <div className={styles.inner}>
        <div className={styles.cardContainer}>
          {/* Card Header */}
          <div className={styles.cardHeader}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              DRAG THE LINE
            </p>
            <h2 className={styles.title}>Hands-on vs. Pexpacks ready</h2>
          </div>

          {/* Interactive Split Frame */}
          <div
            ref={containerRef}
            className={styles.comparisonFrame}
            onMouseDown={(e) => handleStart(e.clientX)}
            onTouchStart={(e) => {
              if (e.touches[0]) handleStart(e.touches[0].clientX)
            }}
            role="slider"
            aria-label="Drag comparison slider between hands-on shopping and Pexpacks ready"
            aria-valuenow={Math.round(sliderPos)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {/* Layer 1: Dark Teal Pexpacks Side (Bottom) */}
            <div className={styles.rightLayer}>
              <span className={styles.badgePexpacks}>Pexpacks ready</span>
              <h3 className={styles.headlinePexpacks}>
                Zero trips. 100% exact list. Delivered to your door.
              </h3>
              <div className={styles.statsRow}>
                <div className={styles.statCardDark}>
                  <div className={styles.statCardDarkValue}>100% Ready</div>
                  <div className={styles.statCardDarkLabel}>Labelled, checked, and delivered</div>
                </div>
                <div className={styles.statCardDark}>
                  <div className={styles.statCardDarkValue}>&lt; 2 mins</div>
                  <div className={styles.statCardDarkLabel}>Order online in under 2 mins</div>
                </div>
              </div>
            </div>

            {/* Layer 2: Light Peach Retail Side (Top clipped) */}
            <div
              className={styles.leftLayer}
              style={{ clipPath: `inset(0 calc(100% - ${sliderPos}%) 0 0)` }}
            >
              <span className={styles.badgeRetail}>Hands-on shopping</span>
              <h3 className={styles.headlineRetail}>
                More trips. More gaps. More last–minute stress.
              </h3>
              <div className={styles.statsRow}>
                <div className={styles.statCardLight}>
                  <div className={styles.statCardLightValue}>3–4 hrs</div>
                  <div className={styles.statCardLightLabel}>Driving, parking, queuing</div>
                </div>
                <div className={styles.statCardLight}>
                  <div className={styles.statCardLightValue}>Risk</div>
                  <div className={styles.statCardLightLabel}>Missing or sold–out items</div>
                </div>
              </div>
            </div>

            {/* Split Divider Line */}
            <div className={styles.dividerLine} style={{ left: `${sliderPos}%` }}>
              <div
                className={styles.handleButton}
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
                  style={{ margin: '-2px 0 0 -6px' }}
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
                  style={{ margin: '-2px -6px 0 0' }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Track with Synced Delivery Van */}
          <div className={styles.trackArea}>
            <div className={styles.trackLabels}>
              <span className={styles.labelStress}>Hands-on stress</span>
              <span className={styles.labelReady}>Pexpacks ready</span>
            </div>

            {/* Delivery Van SVG tied to sliderPos */}
            <div className={styles.truckWrapper} style={{ left: `${sliderPos}%` }}>
              <div className={styles.truckContainer}>
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
