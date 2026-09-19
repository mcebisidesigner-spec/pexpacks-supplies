import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ContactRound,
  MapPin,
  Pencil,
  School,
  ShieldCheck,
  ShoppingBag,
  Truck,
  TriangleAlert,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getSchoolProfile } from "@/lib/admin/school-profile";

interface SchoolProfilePageProps {
  params: Promise<{ id: string }>;
}

interface ProfileCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "green" | "amber" | "blue";
  valueTone?: "green" | "amber";
  compact?: boolean;
}

interface AttentionItem {
  title: string;
  detail: string;
  tone: "clear" | "warning" | "danger";
}

const toneIconStyles = {
  green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  blue: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
};

const toneValueStyles = {
  green: "text-emerald-400",
  amber: "text-amber-400",
};

function ProfileCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  valueTone,
  compact = false,
}: ProfileCardProps) {
  return (
    <article className="flex flex-col min-w-0 min-h-[154px] sm:min-h-[174px] p-5 border border-slate-800 rounded-lg bg-[#070d18]">
      <div className="flex items-center justify-between gap-3 mb-4.5">
        <span className="text-slate-400 text-[11px] font-extrabold leading-tight uppercase tracking-wider">{label}</span>
        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${toneIconStyles[tone]}`} aria-hidden="true">
          <Icon size={19} strokeWidth={1.9} />
        </span>
      </div>
      <strong
        className={`text-white font-black overflow-hidden text-ellipsis break-words leading-tight ${
          compact ? "text-[15px] leading-snug" : "text-xl sm:text-2xl"
        } ${valueTone ? toneValueStyles[valueTone] : ""}`}
      >
        {value}
      </strong>
      <span className="mt-2 text-slate-400 text-xs leading-relaxed break-words">{detail}</span>
    </article>
  );
}

function formatPartnerSince(value: string | null): string {
  if (!value) return "Partnership date not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `Partner since ${new Intl.DateTimeFormat("en-ZA", {
    month: "short",
    year: "numeric",
  }).format(date)}`;
}

export default async function SchoolProfilePage({ params }: SchoolProfilePageProps) {
  await requireAdmin({ permission: "schools.view" });
  const { id } = await params;
  const profile = await getSchoolProfile(id);
  if (!profile) notFound();

  const { school } = profile;
  const attention: AttentionItem[] = [];

  if (school.status !== "active" || !school.published) {
    attention.push({
      title: school.status === "archived" ? "School is hidden" : "School is not publicly active",
      detail: "The school and its grade packs are not currently available on the public website.",
      tone: "danger",
    });
  }
  if (profile.pendingOrders > 0) {
    attention.push({
      title: `${profile.pendingOrders} pending ${profile.pendingOrders === 1 ? "order" : "orders"}`,
      detail: "These orders still need payment or fulfilment attention.",
      tone: "warning",
    });
  }
  if (profile.visiblePacks === 0) {
    attention.push({
      title: "No visible grade packs",
      detail: "Parents cannot buy a pack for this school until at least one pack is visible.",
      tone: "danger",
    });
  }
  if (!school.principal || (!school.email && !school.telephone) || !school.address) {
    attention.push({
      title: "School profile needs information",
      detail: "Add the missing principal, contact, or address details used by the operations team.",
      tone: "warning",
    });
  }
  if (profile.visiblePacks > 0 && !profile.acceptsDelivery && !profile.acceptsCollection) {
    attention.push({
      title: "No fulfilment option configured",
      detail: "Visible packs need a delivery or school collection option.",
      tone: "danger",
    });
  }
  if (attention.length === 0) {
    attention.push({
      title: "All clear",
      detail: "Nothing needs your attention right now.",
      tone: "clear",
    });
  }

  const addressDetail = [school.city, school.province].filter(Boolean).join(", ");
  const profileHref = `/admin/schools/${school.slug || school.id}`;

  const toneAttentionIconStyles = {
    clear: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-rose-400",
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto pb-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-7 min-h-[132px] p-4.5 sm:px-4.5 pb-6 border-b border-slate-800">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 mb-3.5 text-emerald-400 text-[13px] font-extrabold uppercase tracking-wide">
            <ShieldCheck size={16} aria-hidden="true" />
            School profile
          </span>
          <h1 className="m-0 text-white text-2xl sm:text-3xl md:text-[38px] font-black leading-tight tracking-tight uppercase break-words">{school.name}</h1>
          <p className="mt-2.5 text-slate-400 text-[13px] leading-relaxed">This information is private and used for business with the school.</p>
        </div>
        <Link href={profileHref} className="inline-flex items-center justify-center gap-2.5 min-w-[146px] min-h-[44px] px-5 border border-slate-700/80 rounded-lg bg-slate-900/60 text-slate-200 text-sm font-extrabold hover:border-emerald-500 hover:text-emerald-400 transition-colors w-full sm:w-auto">
          <Pencil size={16} aria-hidden="true" />
          Edit Info
        </Link>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 pt-7 px-0 sm:px-4.5" aria-label="School information and activity">
        <ProfileCard
          label="Principal name"
          value={school.principal || "Not recorded"}
          detail={school.email || "No principal email recorded"}
          icon={CalendarDays}
          tone="amber"
          valueTone={school.principal ? "amber" : undefined}
          compact
        />
        <ProfileCard
          label="School contacts"
          value={school.telephone || "Not recorded"}
          detail={
            [school.email, school.address].filter(Boolean).join(" | ") ||
            "No email or physical address recorded"
          }
          icon={ContactRound}
          tone="amber"
          compact
        />
        <ProfileCard
          label="Official partner"
          value={school.is_partner ? school.custom_badge || "Pexpacks partner" : "Not partnered"}
          detail={school.is_partner ? formatPartnerSince(school.partner_since) : "Partnership not active"}
          icon={School}
          tone="blue"
          valueTone={school.is_partner ? "amber" : undefined}
          compact
        />
        <ProfileCard
          label="School address"
          value={school.address || "Not recorded"}
          detail={addressDetail || school.district || "Location not recorded"}
          icon={MapPin}
          tone="green"
          compact
        />
        <ProfileCard
          label="Packs bought"
          value={profile.packsBought.toLocaleString("en-ZA")}
          detail={`${profile.paidOrders.toLocaleString("en-ZA")} paid ${profile.paidOrders === 1 ? "order" : "orders"}`}
          icon={ShoppingBag}
          tone="blue"
        />
        <ProfileCard
          label="Pending orders"
          value={profile.pendingOrders.toLocaleString("en-ZA")}
          detail="Awaiting payment or fulfilment"
          icon={Clock3}
          tone="amber"
          valueTone={profile.pendingOrders > 0 ? "amber" : undefined}
        />
        <ProfileCard
          label="Home delivery"
          value={profile.acceptsDelivery ? "Accepted" : "Not available"}
          detail={`${profile.deliveryPackCount} of ${profile.visiblePacks} visible packs`}
          icon={Truck}
          tone={profile.acceptsDelivery ? "green" : "amber"}
          valueTone={profile.acceptsDelivery ? "green" : "amber"}
        />
        <ProfileCard
          label="Parent collection"
          value={profile.acceptsCollection ? "Accepted" : "Non-accepted"}
          detail={
            profile.acceptsCollection
              ? "Parents may collect stationery for this school"
              : "Parent collection is not accepted by this school"
          }
          icon={UsersRound}
          tone={profile.acceptsCollection ? "green" : "amber"}
          valueTone={profile.acceptsCollection ? "green" : "amber"}
        />
      </section>

      <section className="pt-8 px-0 sm:px-4.5" aria-labelledby="attention-heading">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 mb-4">
          <h2 id="attention-heading" className="m-0 text-white text-xl font-bold tracking-tight">What needs attention</h2>
          <span className="text-slate-400 text-xs">Actionable alerts for this school.</span>
        </div>
        <div className="border border-dashed border-slate-700/80 rounded-lg bg-[#070d18] divide-y divide-slate-800">
          {attention.map((item) => {
            const Icon =
              item.tone === "clear"
                ? CheckCircle2
                : item.tone === "warning"
                  ? CircleAlert
                  : TriangleAlert;
            return (
              <div className="flex items-start gap-4 min-h-[82px] p-4.5 sm:px-5.5" key={`${item.title}-${item.detail}`}>
                <Icon
                  className={`shrink-0 mt-0.5 ${toneAttentionIconStyles[item.tone]}`}
                  size={22}
                  aria-hidden="true"
                />
                <div>
                  <strong className="block text-white text-sm font-semibold">{item.title}</strong>
                  <span className="block mt-1 text-slate-400 text-xs leading-relaxed">{item.detail}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
