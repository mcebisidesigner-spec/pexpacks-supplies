import React from "react";
import { Globe, Lock, Smartphone, Headphones } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppHref } from "@/data/contact";

const INFRA_FEATURES = [
  {
    icon: Smartphone,
    title: "Mobile-First Parent Portal",
    desc: "Parents navigate clear, teacher-approved stationery packs with one-tap checkout, instant receipts, and delivery choice.",
  },
  {
    icon: Globe,
    title: "School-Branded Digital Presence",
    desc: "A custom web experience honoring your school’s crest, color palette, and official announcements at zero development cost.",
  },
  {
    icon: Lock,
    title: "Managed SSL & Secure Cloud Hosting",
    desc: "Fast, reliable cloud infrastructure with end-to-end encryption, automated backups, and 99.9% availability.",
  },
  {
    icon: Headphones,
    title: "Dedicated Parent Customer Support",
    desc: "Pexpacks helpdesk directly resolves parent queries regarding tracking, returns, and payment options.",
  },
];

export function DigitalInfrastructure() {
  const inquiryHref = buildWhatsAppHref(
    "Hi Pexpacks, I'd like to inquire about the Digital Infrastructure package for my school."
  );

  return (
    <section className="py-[clamp(54px,7vw,96px)] relative" aria-labelledby="digital-infra-heading">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="bg-[var(--pex-navy,#1a2a40)] rounded-[24px] p-[clamp(32px,6vw,64px)] text-white relative overflow-hidden">
          <div className="grid grid-cols-1 min-[981px]:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] gap-[clamp(32px,5vw,60px)] items-center">
            <div>
              <p className="mb-[14px] text-[#5eead4] text-sm font-extrabold tracking-normal text-left">Digital infrastructure suite</p>
              <h2 id="digital-infra-heading" className="mb-[14px] text-white font-heading text-[clamp(32px,4.6vw,56px)] font-extrabold leading-[1.05] tracking-[-0.01em] text-left">
                A Digital Front Door Built Around Your School.
              </h2>
              <p className="max-w-[760px] mb-[34px] text-white/80 text-lg leading-[1.45] text-left">
                A complimentary 12-month digital infrastructure package included with
                qualifying institutional partnerships. We build, host, and maintain
                a professional digital portal tailored to your school's procurement
                calendar.
              </p>
              <div style={{ marginTop: 28 }}>
                {inquiryHref ? (
                  <Button
                    href={inquiryHref}
                    variant="primary"
                    size="md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Inquire About Digital Infrastructure</span>
                    <WhatsAppIcon
                      size={16}
                      style={{ marginLeft: 6, display: "inline" }}
                    />
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {INFRA_FEATURES.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="bg-white/[0.06] border border-white/[0.12] rounded-[14px] p-4 flex flex-col gap-1.5">
                    <h3 className="text-[14.5px] font-bold text-white m-0 flex items-center gap-2">
                      <Icon size={18} style={{ color: "#5eead4" }} />
                      <span>{item.title}</span>
                    </h3>
                    <p className="text-[12.5px] text-[#94a3b8] leading-[1.45] m-0">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type WhatsAppIconProps = {
  size: number;
  style?: React.CSSProperties;
};

function WhatsAppIcon({ size, style }: WhatsAppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={style}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
