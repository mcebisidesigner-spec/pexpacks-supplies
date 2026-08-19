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
            <h2 className={styles.title}>Retail run vs. Pexpacks ready</h2>
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
            aria-label="Drag comparison slider between retail shopping and Pexpacks ready"
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
              <span className={styles.badgeRetail}>Retail shopping</span>
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
                  <polyline points="9 18 15 12 9 6" style={{ display: 'none' }} />
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

          {/* Bottom Track with Synced Delivery Truck Graphic */}
          <div className={styles.trackArea}>
            <div className={styles.trackLabels}>
              <span className={styles.labelStress}>Retail stress</span>
              <span className={styles.labelReady}>Pexpacks ready</span>
            </div>

            {/* Delivery Truck SVG tied to sliderPos */}
            <div className={styles.truckWrapper} style={{ left: `${sliderPos}%` }}>
              <div className={styles.truckContainer}>
                {/* SVG Delivery Truck with Stacked Stationery Boxes */}
                <svg
                  width="68"
                  height="42"
                  viewBox="0 0 80 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* Stacked Boxes on Truck Bed */}
                  <rect x="18" y="16" width="14" height="12" rx="2" fill="#F59E0B" />
                  <rect x="20" y="7" width="12" height="10" rx="2" fill="#FF6F59" />
                  <rect x="31" y="12" width="13" height="16" rx="2" fill="#10B981" />
                  {/* Box ribbons / straps */}
                  <line x1="25" y1="16" x2="25" y2="28" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                  <line x1="26" y1="7" x2="26" y2="17" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                  <line x1="37" y1="12" x2="37" y2="28" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />

                  {/* Truck Body Base */}
                  <rect x="12" y="27" width="34" height="12" rx="2" fill="#133E42" />

                  {/* Truck Cabin */}
                  <path
                    d="M45 22C45 20.8954 45.8954 20 47 20H60C62.2091 20 64 21.7909 64 24V39H45V22Z"
                    fill="#0D9488"
                  />
                  {/* Cabin Window */}
                  <path
                    d="M50 23H58C59.1046 23 60 23.8954 60 25V30H50V23Z"
                    fill="#E0F2FE"
                  />

                  {/* Bumper & Grill */}
                  <rect x="63" y="32" width="4" height="6" rx="1" fill="#64748B" />

                  {/* Front Wheels */}
                  <circle cx="24" cy="39" r="6" fill="#1E293B" />
                  <circle cx="24" cy="39" r="2.5" fill="#E2E8F0" />

                  {/* Rear Wheels */}
                  <circle cx="54" cy="39" r="6" fill="#1E293B" />
                  <circle cx="54" cy="39" r="2.5" fill="#E2E8F0" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
