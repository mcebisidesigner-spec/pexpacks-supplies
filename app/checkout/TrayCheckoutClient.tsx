'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePackTrayStore } from '@/store/usePackTrayStore'
import type { TrayPackItem } from '@/store/usePackTrayStore'
import { calculateTrayTotal } from '@/lib/order/calculateTrayTotal'
import { formatCurrency } from '@/lib/formatCurrency'
import { PEXCOVER_PRICE } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import clsx from 'clsx'
import styles from '@/app/checkout/Checkout.module.css'

type FulfilmentOption =
  | 'school_collection'
  | 'home_delivery'
  | 'arranged_collection'
type ContactMethod = 'whatsapp' | 'phone' | 'email'
type CheckoutSummarySection = 'details' | 'delivery'

const contactOptions: { value: ContactMethod; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Phone call' },
  { value: 'email', label: 'Email' },
]

const fulfilmentOptions: {
  value: FulfilmentOption
  title: string
  description: string
  note: string
}[] = [
  {
    value: 'school_collection',
    title: 'School collection',
    description: 'Please pick up your stationery pack from the school or the designated handover point.',
    note: 'Included',
  },
  {
    value: 'home_delivery',
    title: 'Home delivery',
    description:
      'Home delivery will incur additional charges, which will be confirmed separately.',
    note: 'Address required',
  },
  {
    value: 'arranged_collection',
    title: 'Arranged collection',
    description: 'You can choose your own delivery location. We will contact you to confirm your preferred option.',
    note: 'We will confirm',
  },
]

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function normalisePhone(value: string) {
  const trimmed = value.trim()
  if (trimmed.startsWith('+')) {
    return `+${trimmed.slice(1).replace(/\D/g, '')}`
  }
  const digits = trimmed.replace(/\D/g, '')
  if (digits.startsWith('0027') && digits.length >= 13) {
    return `+27${digits.slice(4)}`
  }
  return digits
}

function isLikelySaPhone(value: string) {
  const normalised = normalisePhone(value)
  const digits = normalised.replace(/\D/g, '')
  return (
    (digits.startsWith('0') && digits.length === 10) ||
    (digits.startsWith('27') && digits.length === 11) ||
    (digits.startsWith('0027') && digits.length === 13)
  )
}

function fulfilmentToApiMethod(option: FulfilmentOption) {
  if (option === 'school_collection') return 'school_collection'
  if (option === 'home_delivery') return 'delivery'
  return 'collection_point'
}

function getPackTotal(pack: TrayPackItem) {
  return pack.totalPrice + (pack.wantsPexcover ? PEXCOVER_PRICE : 0)
}

function getItemLineTotal(item: TrayPackItem['items'][number]) {
  return typeof item.unitPrice === 'number'
    ? item.unitPrice * item.quantity
    : null
}

function getPackItemPreview(pack: TrayPackItem) {
  return pack.items.slice(0, 4)
}

function FulfilmentIcon({ option }: { option: FulfilmentOption }) {
  if (option === 'school_collection') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )
  }

  if (option === 'home_delivery') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-7V8Z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </svg>
  )
}

export function TrayCheckoutClient() {
  const router = useRouter()
  const packs = usePackTrayStore((s) => s.packs)
  const openTray = usePackTrayStore((s) => s.openTray)
  const updatePackDetails = usePackTrayStore((s) => s.updatePackDetails)

  const [expandedPacks, setExpandedPacks] = useState<Record<string, boolean>>(
    {},
  )
  const [editNameIndex, setEditNameIndex] = useState<number | null>(null)
  const [learnerInputs, setLearnerInputs] = useState<string[]>(() =>
    packs.map((p) => p.learnerName || ''),
  )

  const [fullName, setFullName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [preferredContactMethod, setPreferredContactMethod] =
    useState<ContactMethod>('whatsapp')
  const [consent, setConsent] = useState(false)

  const [fulfilmentOption, setFulfilmentOption] =
    useState<FulfilmentOption>('school_collection')
  const [multiSchoolDrop, setMultiSchoolDrop] = useState<string | null>(null)
  const [address, setAddress] = useState('')
  const [suburb, setSuburb] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [orderReference, setOrderReference] = useState<string | null>(null)

  const [mobileSectionSummaryOpen, setMobileSectionSummaryOpen] = useState<
    Record<CheckoutSummarySection, boolean>
  >({
    details: true,
    delivery: true,
  })
  const fieldRefs = useRef<
    Record<string, HTMLInputElement | HTMLTextAreaElement | null>
  >({})
  const sectionRefs = useRef<
    Record<CheckoutSummarySection, HTMLElement | null>
  >({
    details: null,
    delivery: null,
  })
  const consentRef = useRef<HTMLElement | null>(null)
  const summaryRef = useRef<HTMLElement | null>(null)

  const total = useMemo(() => calculateTrayTotal(packs), [packs])

  const pexcoverCount = useMemo(
    () => packs.filter((p) => p.wantsPexcover).length,
    [packs],
  )
  const pexcoverTotal = pexcoverCount * PEXCOVER_PRICE
  const itemsTotal = total - pexcoverTotal

  const uniqueSchools = useMemo(() => {
    const map = new Map<string, { name: string; slug: string }>()
    packs.forEach((p) => {
      if (p.schoolSlug && p.schoolName && !map.has(p.schoolSlug)) {
        map.set(p.schoolSlug, { name: p.schoolName, slug: p.schoolSlug })
      }
    })
    return Array.from(map.values())
  }, [packs])

  const isSingleSchool = uniqueSchools.length <= 1
  const deliveryExpanded = fulfilmentOption === 'home_delivery'
  const canSubmit = packs.length > 0 && total > 0 && !submitting
  const detailsSectionHasErrors = Boolean(
    errors.fullName ||
    errors.buyerPhone ||
    errors.buyerEmail ||
    Object.keys(errors).some((key) => key.startsWith('learner_')),
  )
  const showDetailsHiddenWarning =
    detailsSectionHasErrors && !mobileSectionSummaryOpen.details

  const toggleMobileSectionSummary = useCallback(
    (section: CheckoutSummarySection) => {
      setMobileSectionSummaryOpen((current) => ({
        ...current,
        [section]: !current[section],
      }))
    },
    [],
  )

  useEffect(() => {
    setLearnerInputs((prev) => {
      if (prev.length === packs.length) return prev
      return packs.map((pack, index) => prev[index] ?? pack.learnerName ?? '')
    })
  }, [packs])

  useEffect(() => {
    if (isSingleSchool && fulfilmentOption === 'school_collection') {
      setMultiSchoolDrop(uniqueSchools[0]?.slug ?? null)
    }
  }, [fulfilmentOption, isSingleSchool, uniqueSchools])

  const deliveryAddressSummary = useMemo(() => {
    return [address, suburb, city, province, postalCode]
      .filter(Boolean)
      .join(', ')
  }, [address, suburb, city, province, postalCode])

  const handleLearnerNameChange = useCallback(
    (index: number, value: string) => {
      setLearnerInputs((prev) => {
        const next = [...prev]
        next[index] = value
        return next
      })
    },
    [],
  )

  const handleLearnerNameBlur = useCallback(
    (index: number) => {
      const pack = packs[index]
      if (!pack) return
      const name = learnerInputs[index]?.trim() || ''
      if (name !== (pack.learnerName || '')) {
        updatePackDetails(pack.id, name, pack.wantsPexcover || false)
      }
      setEditNameIndex(null)
    },
    [packs, learnerInputs, updatePackDetails],
  )

  const handleLearnerNameKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter') {
        ;(e.target as HTMLInputElement).blur()
      }
      if (e.key === 'Escape') {
        setLearnerInputs((prev) => {
          const next = [...prev]
          next[index] = packs[index]?.learnerName || ''
          return next
        })
        setEditNameIndex(null)
      }
    },
    [packs],
  )

  const handleBackToOrder = useCallback(() => {
    openTray()
    router.back()
  }, [openTray, router])

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function getSectionForError(field: string): CheckoutSummarySection | null {
    if (
      field === 'fullName' ||
      field === 'buyerPhone' ||
      field === 'buyerEmail'
    ) {
      return 'details'
    }

    if (
      field === 'address' ||
      field === 'suburb' ||
      field === 'city' ||
      field === 'province' ||
      field === 'multiSchoolDrop'
    ) {
      return 'delivery'
    }

    return null
  }

  function guideToIncompleteField(field: string) {
    const section = getSectionForError(field)
    const learnerMatch = field.match(/^learner_(\d+)$/)

    if (section) {
      setMobileSectionSummaryOpen((current) => ({
        ...current,
        [section]: true,
      }))
    }

    if (learnerMatch) {
      setEditNameIndex(Number(learnerMatch[1]))
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const fieldNode = fieldRefs.current[field]
        const target =
          fieldNode ||
          (learnerMatch ? summaryRef.current : null) ||
          (field === 'consent' ? consentRef.current : null) ||
          (section ? sectionRefs.current[section] : null)

        target?.scrollIntoView({ behavior: 'smooth', block: 'center' })

        if (fieldNode) {
          fieldNode.focus({ preventScroll: true })
        } else if (target instanceof HTMLElement) {
          target.focus({ preventScroll: true })
        }
      })
    })
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {}

    if (packs.length === 0)
      nextErrors.packs = 'Choose a school pack before checkout.'
    if (total <= 0)
      nextErrors.total = 'Your order total must be greater than zero.'
    if (!fullName.trim() || fullName.trim().length < 2)
      nextErrors.fullName = 'Please enter your full name.'
    if (!buyerPhone.trim())
      nextErrors.buyerPhone = 'Please enter your phone number.'
    else if (!isLikelySaPhone(buyerPhone))
      nextErrors.buyerPhone = 'Please enter a valid South African phone number.'
    if (!buyerEmail.trim())
      nextErrors.buyerEmail = 'Please enter your email address.'
    else if (!isValidEmail(buyerEmail.trim()))
      nextErrors.buyerEmail = 'Please enter a valid email address.'

    for (let i = 0; i < packs.length; i++) {
      if (!learnerInputs[i]?.trim()) {
        nextErrors[`learner_${i}`] = `Please enter a name for learner ${i + 1}.`
      }
    }

    if (deliveryExpanded) {
      if (!address.trim())
        nextErrors.address = 'Please enter the delivery address.'
      if (!suburb.trim()) nextErrors.suburb = 'Please enter the suburb.'
      if (!city.trim()) nextErrors.city = 'Please enter the city.'
      if (!province.trim()) nextErrors.province = 'Please enter the province.'
    }

    if (
      fulfilmentOption === 'school_collection' &&
      uniqueSchools.length > 1 &&
      !multiSchoolDrop
    ) {
      nextErrors.multiSchoolDrop =
        'Select which school the box should be dropped at.'
    }
    if (!consent)
      nextErrors.consent = 'Please accept the order processing consent.'

    setErrors(nextErrors)

    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      guideToIncompleteField(firstError)
    }

    return Object.keys(nextErrors).length === 0
  }

  async function handlePay() {
    if (submitting) return
    if (!validate()) return

    setSubmitError(null)
    setSubmitting(true)

    const notes = [
      deliveryNotes.trim() ? `Notes: ${deliveryNotes.trim()}` : '',
      deliveryExpanded ? `Address: ${deliveryAddressSummary}` : '',
      preferredContactMethod
        ? `Preferred contact: ${preferredContactMethod}`
        : '',
    ]
      .filter(Boolean)
      .join(' | ')

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: fullName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          buyerPhone: normalisePhone(buyerPhone),
          packs: packs.map((pack, pi) => ({
            learnerName:
              learnerInputs[pi]?.trim() || pack.learnerName?.trim() || '',
            schoolSlug: pack.schoolSlug || '',
            schoolName: pack.schoolName || '',
            grade: pack.grade || '',
            gradeSlug: pack.gradeSlug || '',
            packName: pack.packName,
            packMode: pack.packMode,
            items: pack.items.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
            totalPrice: pack.totalPrice,
            modifications: pack.modifications,
            wantsPexcover: pack.wantsPexcover || false,
            pexcoverPrice: pack.wantsPexcover ? PEXCOVER_PRICE : 0,
            basePackPrice: pack.totalPrice,
          })),
          isTrayOrder: true,
          estimatedTotal: total,
          deliveryMethod: fulfilmentToApiMethod(fulfilmentOption),
          primarySchoolSlug:
            uniqueSchools.length > 1
              ? multiSchoolDrop
              : uniqueSchools[0]?.slug || packs[0]?.schoolSlug || '',
          notes: notes || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.orderReference) {
        const msg =
          result.errors && typeof result.errors === 'object'
            ? Object.values(result.errors).join('. ')
            : result.error || 'Unable to submit your order'
        throw new Error(msg)
      }

      if (typeof result.url === 'string' && result.url) {
        window.location.href = result.url
        return
      }

      setOrderReference(result.orderReference)
      setOrderSubmitted(true)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'We could not submit your order right now. Please try again or contact Pexpacks on WhatsApp.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (orderSubmitted && orderReference) {
    return (
      <div className={styles.checkoutShell}>
        <div className={styles.emptyCheckout}>
          <p className={styles.checkoutKicker}>Order Confirmed</p>
          <h1>Thank you for your order!</h1>
          <p>Your order reference is <strong>{orderReference}</strong>.</p>
          <p>We will be in touch shortly with payment and delivery details.</p>
          <Button href="/schools" variant="primary" size="lg">
            Browse more packs
          </Button>
        </div>
      </div>
    )
  }

  if (packs.length === 0) {
    return (
      <div className={styles.checkoutShell}>
        <div className={styles.emptyCheckout}>
          <p className={styles.checkoutKicker}>Checkout</p>
          <h1>No packs in your order.</h1>
          <p>Choose a school pack before checkout.</p>
          <Button href="/schools" variant="primary" size="lg">
            Find a school pack
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.checkoutShell}>
      <header className={styles.checkoutHeader}>
        <button
          type="button"
          className={styles.backToOrder}
          onClick={handleBackToOrder}
        >
          Back to order
        </button>
        <a
          href="https://wa.me/27763456622?text=Hi Pexpacks, I need help with checkout."
          target="_blank"
          rel="noopener noreferrer"
          className={styles.helpLink}
        >
          Need help?
        </a>
      </header>

      <div className={styles.checkoutGrid}>
        <section className={clsx(styles.stepCard, styles.checkoutHero)}>
          <p className={styles.checkoutKicker}>Checkout</p>
          <h1>Review your packs and confirm your order.</h1>
          <p>
            Add your details, choose delivery or collection, and submit your
            order. We will be in touch with payment details.
          </p>
        </section>

        <form
          className={styles.mainColumn}
          aria-label="Checkout details"
          onSubmit={(e) => e.preventDefault()}
        >
          <section
            ref={(node) => {
              sectionRefs.current.details = node
            }}
            tabIndex={-1}
            className={clsx(styles.checkoutSection, showDetailsHiddenWarning && styles.checkoutSectionWarning)}
            aria-labelledby="customer-details-heading"
          >
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>1</span>
              <div>
                <h2 id="customer-details-heading">Your details</h2>
                <p>
                  We use these details for order updates and delivery or
                  collection support.
                </p>
              </div>
              <button
                type="button"
                className={styles.mobileSummaryToggle}
                onClick={() => toggleMobileSectionSummary('details')}
                aria-expanded={mobileSectionSummaryOpen.details}
                aria-controls="customer-details-summary"
              >
                {mobileSectionSummaryOpen.details
                  ? 'Hide Summary'
                  : 'View Summary'}
              </button>
            </div>
            <div
              id="customer-details-summary"
              className={clsx(styles.mobileCollapsibleSummary, mobileSectionSummaryOpen.details && styles.mobileCollapsibleSummaryOpen)}
            >
              <div className={styles.formGrid}>
                <Input
                  id="fullName"
                  ref={(node) => {
                    fieldRefs.current.fullName = node
                  }}
                  label="Full name"
                  helper="We use this to confirm your order and payment updates."
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    clearFieldError('fullName')
                  }}
                  placeholder="e.g. Sarah Dlamini"
                  error={errors.fullName}
                  autoComplete="name"
                />
                <Input
                  id="buyerPhone"
                  ref={(node) => {
                    fieldRefs.current.buyerPhone = node
                  }}
                  label="Phone number"
                  helper="WhatsApp or call is fastest for support."
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => {
                    setBuyerPhone(e.target.value)
                    clearFieldError('buyerPhone')
                  }}
                  placeholder="e.g. 078 003 6048"
                  error={errors.buyerPhone}
                  autoComplete="tel"
                />
                <Input
                  id="buyerEmail"
                  ref={(node) => {
                    fieldRefs.current.buyerEmail = node
                  }}
                  label="Email address"
                  helper="Used for order updates and payment confirmation."
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => {
                    setBuyerEmail(e.target.value)
                    clearFieldError('buyerEmail')
                  }}
                  placeholder="name@example.com"
                  error={errors.buyerEmail}
                  autoComplete="email"
                />
                <fieldset className={styles.contactMethodGroup}>
                  <legend>Preferred contact method</legend>
                  <p>
                    Choose how we should reach you if the order needs a quick
                    check.
                  </p>
                  <div className={styles.segmentedOptions}>
                    {contactOptions.map((option) => (
                      <label
                        key={option.value}
                        className={clsx(styles.segmentedOption, preferredContactMethod === option.value && styles.segmentedOptionActive)}
                      >
                        <input
                          type="radio"
                          name="preferredContactMethod"
                          value={option.value}
                          checked={preferredContactMethod === option.value}
                          onChange={() =>
                            setPreferredContactMethod(option.value)
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              {packs.map((pack, index) => {
                const errKey = `learner_${index}`
                return errors[errKey] ? (
                  <p key={errKey} className={styles.fieldError}>
                    Learner {index + 1} ({pack.packName}): {errors[errKey]}
                  </p>
                ) : null
              })}
            </div>
            {showDetailsHiddenWarning ? (
              <p className={styles.mobileHiddenSummaryWarning} role="alert">
                Fill in your details (Click "View Summary")
              </p>
            ) : null}
          </section>

          <section
            ref={(node) => {
              sectionRefs.current.delivery = node
            }}
            tabIndex={-1}
            className={styles.checkoutSection}
            aria-labelledby="fulfilment-heading"
          >
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>2</span>
              <div>
                <h2 id="fulfilment-heading">Delivery or collection</h2>
                <p>Choose how you want to receive this order.</p>
              </div>
              <button
                type="button"
                className={styles.mobileSummaryToggle}
                onClick={() => toggleMobileSectionSummary('delivery')}
                aria-expanded={mobileSectionSummaryOpen.delivery}
                aria-controls="fulfilment-summary"
              >
                {mobileSectionSummaryOpen.delivery
                  ? 'Hide Summary'
                  : 'View Summary'}
              </button>
            </div>

            <div
              id="fulfilment-summary"
              className={clsx(styles.mobileCollapsibleSummary, mobileSectionSummaryOpen.delivery && styles.mobileCollapsibleSummaryOpen)}
            >
              <fieldset className={styles.optionFieldset}>
                <legend className={styles.srOnly}>
                  Delivery or collection method
                </legend>
                <div className={styles.deliveryOptions}>
                  {fulfilmentOptions.map((option) => (
                    <label
                      key={option.value}
                      className={clsx(styles.deliveryOption, fulfilmentOption === option.value && styles.deliveryOptionSelected)}
                    >
                      <input
                        type="radio"
                        name="fulfilment"
                        value={option.value}
                        checked={fulfilmentOption === option.value}
                        onChange={() => {
                          setFulfilmentOption(option.value)
                          clearFieldError('multiSchoolDrop')
                        }}
                      />
                      <div className={styles.deliveryOptionHeader}>
                        <span className={styles.deliveryIcon}>
                          <FulfilmentIcon option={option.value} />
                        </span>
                        <strong>{option.title}</strong>
                      </div>
                      <p className={styles.deliveryDescription}>
                        {option.description}
                      </p>
                      <span className={styles.deliveryBadge}>
                        {option.note}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {fulfilmentOption === 'school_collection' &&
              uniqueSchools.length > 1 ? (
                <div className={styles.schoolDropoffGroup}>
                  <p className={styles.schoolDropoffLabel}>
                    Which school should the main box be dropped at?
                  </p>
                  <div className={styles.schoolDropoffRow}>
                    {uniqueSchools.map((school) => {
                      const isSelected = multiSchoolDrop === school.slug
                      return (
                        <label
                          key={school.slug}
                          className={clsx(styles.schoolDropoffCard, isSelected && styles.schoolDropoffCardActive)}
                        >
                          <input
                            type="radio"
                            name="multiSchoolDrop"
                            value={school.slug}
                            checked={isSelected}
                            onChange={() => {
                              setMultiSchoolDrop(school.slug)
                              clearFieldError('multiSchoolDrop')
                            }}
                            className={styles.schoolDropoffRadio}
                          />
                          <span className={styles.schoolDropoffText}>
                            {school.name}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                  {errors.multiSchoolDrop ? (
                    <p className={styles.fieldError}>
                      {errors.multiSchoolDrop}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {deliveryExpanded ? (
                <div className={styles.addressPanel}>
                  <Input
                    id="address"
                    ref={(node) => {
                      fieldRefs.current.address = node
                    }}
                    label="Address line"
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value)
                      clearFieldError('address')
                    }}
                    placeholder="e.g. 42 Main Road"
                    error={errors.address}
                    autoComplete="street-address"
                  />
                  <Input
                    id="suburb"
                    ref={(node) => {
                      fieldRefs.current.suburb = node
                    }}
                    label="Suburb"
                    type="text"
                    value={suburb}
                    onChange={(e) => {
                      setSuburb(e.target.value)
                      clearFieldError('suburb')
                    }}
                    placeholder="e.g. Gardens"
                    error={errors.suburb}
                  />
                  <Input
                    id="city"
                    ref={(node) => {
                      fieldRefs.current.city = node
                    }}
                    label="City"
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value)
                      clearFieldError('city')
                    }}
                    placeholder="e.g. Cape Town"
                    error={errors.city}
                  />
                  <Input
                    id="province"
                    ref={(node) => {
                      fieldRefs.current.province = node
                    }}
                    label="Province"
                    type="text"
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value)
                      clearFieldError('province')
                    }}
                    placeholder="e.g. Western Cape"
                    error={errors.province}
                  />
                  <Input
                    id="postalCode"
                    label="Postal code"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 8001"
                    autoComplete="postal-code"
                  />
                </div>
              ) : null}

              <Textarea
                id="deliveryNotes"
                label="Delivery notes (optional)"
                helper="Add gate codes, collection notes, or anything the Pexpacks team should know."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                rows={4}
                className={styles.deliveryNotesField}
              />
            </div>
          </section>

          <section
            ref={consentRef}
            tabIndex={-1}
            className={styles.consentCard}
            aria-label="Consent"
          >
            <label className={styles.consentField}>
              <input
                ref={(node) => {
                  fieldRefs.current.consent = node
                }}
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked)
                  clearFieldError('consent')
                }}
                aria-invalid={!!errors.consent}
              />
              <span>
                I agree that Pexpacks may process my personal information to
                complete this order, send order updates, and contact
                me about delivery or collection. I have read and agree to the{' '}
                <a href="/privacy-policy" target="_blank">
                  privacy policy
                </a>
                ,{' '}
                <a href="/terms" target="_blank">
                  terms of use
                </a>
                ,{' '}
                <a href="/delivery-policy" target="_blank">
                  delivery policy
                </a>
                ,{' '}
                <a href="/happy-pay-terms" target="_blank">
                  Happy Pay terms
                </a>
                , and{' '}
                <a href="/returns-refunds-policy" target="_blank">
                  returns &amp; refunds policy
                </a>
                .
              </span>
            </label>
            {errors.consent ? (
              <p className={styles.fieldError}>{errors.consent}</p>
            ) : null}
          </section>

          {submitError ? (
            <p className={styles.formStatusError} role="alert">
              {submitError}
            </p>
          ) : null}
        </form>

        <aside
          ref={summaryRef}
          tabIndex={-1}
          className={styles.summaryColumn}
          aria-labelledby="order-summary-heading"
        >
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <div>
                <p className={styles.checkoutKicker}>Your order</p>
                <h2 id="order-summary-heading">Order summary</h2>
              </div>
              <span>
                {packs.length} {packs.length === 1 ? 'pack' : 'packs'}
              </span>
            </div>

            <div className={styles.orderSummaryList}>
              {packs.map((pack, index) => {
                const isExpanded = !!expandedPacks[pack.id]
                const previewItems = getPackItemPreview(pack)
                const hiddenCount = Math.max(
                  pack.items.length - previewItems.length,
                  0,
                )
                const learnerName = learnerInputs[index]?.trim()
                const learnerLabel = learnerName
                  ? `Learner ${index + 1}: ${learnerName}`
                  : `Learner ${index + 1}: Add learner name`
                return (
                  <article key={pack.id} className={styles.orderPackCard}>
                    <div className={styles.orderPackTop}>
                      <div>
                        {editNameIndex === index ? (
                          <Input
                            ref={(node) => {
                              fieldRefs.current[`learner_${index}`] = node
                            }}
                            type="text"
                            value={learnerInputs[index] || ''}
                            onChange={(e) =>
                              handleLearnerNameChange(index, e.target.value)
                            }
                            onBlur={() => handleLearnerNameBlur(index)}
                            onKeyDown={(e) =>
                              handleLearnerNameKeyDown(e, index)
                            }
                            placeholder="Learner name"
                            aria-label={`Learner ${index + 1} name`}
                            autoFocus
                          />
                        ) : (
                          <button
                            type="button"
                            className={clsx(styles.orderPackLearnerLabel, errors[`learner_${index}`] && styles.orderPackLearnerLabelError)}
                            onClick={() => setEditNameIndex(index)}
                            aria-label={`Edit learner ${index + 1} name`}
                          >
                            {learnerLabel}
                          </button>
                        )}
                      </div>
                      <strong className={styles.orderPackPrice}>
                        {formatCurrency(getPackTotal(pack))}
                      </strong>
                    </div>

                    <div className={styles.orderPackBody}>
                      <h3>{pack.packName}</h3>
                      <p>
                        {pack.schoolName || 'School pack'}
                        {pack.grade ? ` · ${pack.grade}` : ''}
                      </p>
                      <div className={styles.orderPackBadges}>
                        <span>
                          {pack.packMode === 'full'
                            ? 'Full pack'
                            : 'Customised'}
                        </span>
                        <span>
                          {pack.items.length}{' '}
                          {pack.items.length === 1 ? 'item' : 'items'}
                        </span>
                        {pack.wantsPexcover ? <span>Pexcover</span> : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.itemsToggle}
                      aria-expanded={isExpanded}
                      aria-controls={`pack-items-${pack.id}`}
                      onClick={() =>
                        setExpandedPacks((prev) => ({
                          ...prev,
                          [pack.id]: !prev[pack.id],
                        }))
                      }
                    >
                      <span>{isExpanded ? 'Hide items' : 'View items'}</span>
                      <span aria-hidden="true">{isExpanded ? '-' : '+'}</span>
                    </button>

                    {isExpanded ? (
                      <ul
                        id={`pack-items-${pack.id}`}
                        className={styles.itemisedList}
                      >
                        {previewItems.map((item, itemIndex) => {
                          const lineTotal = getItemLineTotal(item)
                          return (
                            <li key={`${pack.id}-${item.name}-${itemIndex}`}>
                              <span>{item.name}</span>
                              <span>Qty {item.quantity}</span>
                              {lineTotal !== null ? (
                                <strong>{formatCurrency(lineTotal)}</strong>
                              ) : null}
                            </li>
                          )
                        })}
                        {pack.wantsPexcover ? (
                          <li className={styles.itemisedPexcover}>
                            <span>
                              Pexcover <em>(Book covering)</em>
                            </span>
                            <span />
                            <strong>{formatCurrency(PEXCOVER_PRICE)}</strong>
                          </li>
                        ) : null}
                        {hiddenCount > 0 ? (
                          <li className={styles.itemisedMore}>
                            + {hiddenCount} more items in this pack
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                  </article>
                )
              })}
            </div>

            <div className={styles.summaryTotals}>
              <div>
                <span>Pack subtotal</span>
                <strong>{formatCurrency(itemsTotal)}</strong>
              </div>
              {pexcoverCount > 0 ? (
                <div className={styles.pexcoverSummary}>
                  <span>
                    Pexcover <em>(Book covering)</em> x{pexcoverCount}
                  </span>
                  <strong>{formatCurrency(pexcoverTotal)}</strong>
                </div>
              ) : null}
              {fulfilmentOption === 'home_delivery' ? (
                <div>
                  <span>Delivery fee</span>
                  <strong>To confirm</strong>
                </div>
              ) : null}
              <div className={styles.summaryGrandTotal}>
                <span>Final amount</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>

            {errors.packs || errors.total ? (
              <p className={styles.formStatusError} role="alert">
                {errors.packs || errors.total}
              </p>
            ) : null}

            <Button
              type="button"
              variant="primary"
              size="lg"
              className={clsx(styles.fullWidth, styles.desktopPayButton)}
              onClick={handlePay}
              disabled={!canSubmit}
              aria-busy={submitting}
            >
              {submitting
                ? 'Preparing your order...'
                : 'Confirm Order'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className={styles.fullWidth}
              onClick={handleBackToOrder}
            >
              Edit order
            </Button>

            <p className={styles.summarySecurity}>
              Your order details are secure. Pexpacks will never share your
              information.
            </p>
          </div>
        </aside>
      </div>

      <div className={styles.mobileStickyCta}>
        <Button
          type="button"
          variant="primary"
          className={styles.fullWidth}
          onClick={handlePay}
          disabled={!canSubmit}
          aria-busy={submitting}
        >
          {submitting
            ? 'Preparing...'
            : `Confirm Order ${formatCurrency(total)}`}
        </Button>
      </div>
    </div>
  )
}
