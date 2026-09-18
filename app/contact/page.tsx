import type { Metadata } from 'next'
import { Mail, Phone, MessageSquare } from 'lucide-react'
import { ContactForm } from '@/components/forms/ContactForm'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/marketing/PageHero'
import { SectionHeader } from '@/components/marketing/SectionHeader'
import {
  generalEmail,
  generalEmailHref,
  hasWhatsAppNumber,
  orderWhatsAppHref,
  phoneHref,
  phoneNumber,
  ordersEmail,
  ordersEmailHref,
} from '@/data/contact'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata(
  'Contact',
  'Contact Pexpacks for school stationery orders, school partnerships and supplier enquiries.',
  '/contact',
)

export const dynamic = 'force-static'

type ContactPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

function resolveContactPrefill(
  params: Record<string, string | string[] | undefined>,
) {
  const type = firstValue(params.type).trim().toLowerCase()
  const subject = firstValue(params.subject).trim()
  const notes = firstValue(params.notes).trim()
  const businessName = firstValue(params.businessName).trim()

  const initialEnquiryType =
    type === 'bulk' || type === 'quote'
      ? 'General enquiry'
      : type === 'partner' || type === 'school-partnership'
        ? 'School partnership'
        : type === 'parent' || type === 'order'
          ? 'Parent order'
          : type === 'supplier'
            ? 'Supplier partnership'
            : 'General enquiry'

  const initialMessage = [
    subject ? `I am enquiring about ${subject}.` : '',
    notes,
  ]
    .filter(Boolean)
    .join('\n\n')

  return {
    initialEnquiryType,
    initialMessage,
    initialBusinessName: businessName,
  }
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = searchParams ? await searchParams : {}
  const prefill = resolveContactPrefill(params)

  return (
    <>
      <PageHero
        eyebrow="We're here"
        title="Talk to Pexpacks"
        text="Have a question about your order, school pack, or partnership enquiry? Our dedicated Gauteng support team is here to help you get quick answers."
        panelText="Service area"
        panelTitle="We currently service Gauteng"
      >
        <div className="flex flex-col sm:flex-row gap-3 mt-5 items-stretch sm:items-center">
          <Button href="#contact-form" variant="primary" className="min-h-[44px]">
            Send a Message
          </Button>
          <Button href="/faq" variant="white" className="min-h-[44px]">
            Contact FAQs
          </Button>
        </div>
      </PageHero>

      <section className="py-12 sm:py-20 bg-slate-50" id="contact-form">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <ContactForm {...prefill} />

            <div className="flex flex-col gap-7 h-full">
              {/* 🟢 LIVE SUPPORT STATUS */}
              <div className="rounded-[20px] border border-teal-600/15 bg-teal-600/[0.05] p-5 flex items-center gap-4 shadow-xs">
                <div className="relative w-3.5 h-3.5 bg-emerald-500 rounded-full shrink-0">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-sm font-extrabold text-[#1a2a40] m-0">
                    Gauteng Support Desk Active
                  </h2>
                  <span className="text-xs text-slate-500 mt-0.5">
                    Live chat active • WhatsApp response time &lt; 5 mins
                  </span>
                </div>
              </div>

              {/* SERVICE LEVEL AGREEMENTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex flex-col gap-1.5 shadow-xs">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600">School Partners</span>
                  <h3 className="text-lg font-extrabold text-[#1a2a40] m-0">&lt; 2 Hours</h3>
                  <span className="text-[12.5px] text-slate-600 leading-snug">
                    Dedicated School Relations Lead callback.
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex flex-col gap-1.5 shadow-xs">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600">Bulk / Quotes</span>
                  <h3 className="text-lg font-extrabold text-[#1a2a40] m-0">&lt; 4 Hours</h3>
                  <span className="text-[12.5px] text-slate-600 leading-snug">
                    Custom line-item quotation prepared.
                  </span>
                </div>
              </div>

              {/* "WHAT HAPPENS NEXT?" TIMELINE */}
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 sm:px-7 shadow-xs">
                <h2 className="text-base font-extrabold text-[#1a2a40] mb-5">
                  Your Response Timeline
                </h2>
                <div className="relative flex flex-col gap-5 pl-2 before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  <div className="relative flex gap-4 items-start">
                    <span className="w-5 h-5 rounded-full border-2 border-teal-600 bg-teal-600 text-white grid place-items-center z-10 shrink-0 mt-0.5 text-[11px] font-extrabold">1</span>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[14.5px] font-bold text-[#1a2a40] m-0">Submit Request</h3>
                      <p className="text-xs text-slate-500 leading-relaxed m-0">
                        Submit your contact form with your exact needs.
                      </p>
                    </div>
                  </div>
                  <div className="relative flex gap-4 items-start">
                    <span className="w-5 h-5 rounded-full border-2 border-teal-600 bg-teal-600 text-white grid place-items-center z-10 shrink-0 mt-0.5 text-[11px] font-extrabold">2</span>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[14.5px] font-bold text-[#1a2a40] m-0">
                        Gauteng Fast-Track Router
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed m-0">
                        Your request is automatically fast-tracked to the
                        correct department.
                      </p>
                    </div>
                  </div>
                  <div className="relative flex gap-4 items-start">
                    <span className="w-5 h-5 rounded-full border-2 border-teal-600 bg-teal-600 text-white grid place-items-center z-10 shrink-0 mt-0.5 text-[11px] font-extrabold">3</span>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[14.5px] font-bold text-[#1a2a40] m-0">Direct Outreach</h3>
                      <p className="text-xs text-slate-500 leading-relaxed m-0">
                        A support representative contacts you on WhatsApp or
                        phone to finalize details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTACT DETAILS CHANNELS */}
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-7 shadow-xs flex flex-col gap-4">
                <SectionHeader
                  eyebrow="Reach out direct"
                  title="Contact details"
                  text="Reach out directly through standard support paths."
                />
                <div className="flex flex-col gap-3.5 pt-2">
                  <div className="flex items-start gap-3 text-[14.5px] text-slate-700 leading-snug">
                    <Mail className="w-4.5 h-4.5 text-teal-600 shrink-0 mt-0.5" />
                    <strong className="text-[#1a2a40] font-bold min-w-[80px]">General enquiries:</strong>
                    <a href={generalEmailHref} className="text-teal-600 font-semibold underline underline-offset-3 hover:opacity-80 transition-opacity">{generalEmail}</a>
                  </div>
                  <div className="flex items-start gap-3 text-[14.5px] text-slate-700 leading-snug">
                    <Mail className="w-4.5 h-4.5 text-teal-600 shrink-0 mt-0.5" />
                    <strong className="text-[#1a2a40] font-bold min-w-[80px]">Place an order:</strong>
                    <a href={ordersEmailHref} className="text-teal-600 font-semibold underline underline-offset-3 hover:opacity-80 transition-opacity">{ordersEmail}</a>
                  </div>
                  <div className="flex items-start gap-3 text-[14.5px] text-slate-700 leading-snug">
                    <Mail className="w-4.5 h-4.5 text-teal-600 shrink-0 mt-0.5" />
                    <strong className="text-[#1a2a40] font-bold min-w-[80px]">Happy Pay &amp; payment enquiries:</strong>
                    <a href={generalEmailHref} className="text-teal-600 font-semibold underline underline-offset-3 hover:opacity-80 transition-opacity">{generalEmail}</a>
                  </div>
                  <div className="flex items-start gap-3 text-[14.5px] text-slate-700 leading-snug">
                    <Phone className="w-4.5 h-4.5 text-teal-600 shrink-0 mt-0.5" />
                    <strong className="text-[#1a2a40] font-bold min-w-[80px]">Telephone:</strong>
                    <a href={phoneHref} className="text-teal-600 font-semibold underline underline-offset-3 hover:opacity-80 transition-opacity">{phoneNumber}</a>
                  </div>
                  <div className="flex items-start gap-3 text-[14.5px] text-slate-700 leading-snug">
                    <MessageSquare className="w-4.5 h-4.5 text-teal-600 shrink-0 mt-0.5" />
                    <strong className="text-[#1a2a40] font-bold min-w-[80px]">WhatsApp:</strong>
                    {hasWhatsAppNumber ? (
                      <a href={orderWhatsAppHref} className="text-teal-600 font-semibold underline underline-offset-3 hover:opacity-80 transition-opacity">Start prefilled chat</a>
                    ) : (
                      <span className="text-slate-400">Currently offline</span>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <Button href="/partnership" variant="outline" className="min-h-[44px]">Partner With Us</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
