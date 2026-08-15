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
import styles from "./SchoolProfile.module.css";

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
    <article className={styles.profileCard}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>{label}</span>
        <span className={`${styles.cardIcon} ${styles[`cardIcon${tone}`]}`} aria-hidden="true">
          <Icon size={19} strokeWidth={1.9} />
        </span>
      </div>
      <strong
        className={`${styles.cardValue} ${compact ? styles.cardValueCompact : ""} ${valueTone ? styles[`cardValue${valueTone}`] : ""}`}
      >
        {value}
      </strong>
      <span className={styles.cardDetail}>{detail}</span>
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

  return (
    <div className={styles.page}>
      <header className={styles.profileHeader}>
        <div className={styles.identity}>
          <span className={styles.kicker}>
            <ShieldCheck size={16} aria-hidden="true" />
            School profile
          </span>
          <h1>{school.name}</h1>
          <p>This information is private and used for business with the school.</p>
        </div>
        <Link href={profileHref} className={styles.editButton}>
          <Pencil size={16} aria-hidden="true" />
          Edit Info
        </Link>
      </header>

      <section className={styles.profileGrid} aria-label="School information and activity">
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
          detail={school.email || "No school email recorded"}
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
          value={profile.acceptsCollection ? "Accepted" : "Not available"}
          detail={`${profile.collectionPackCount} of ${profile.visiblePacks} visible packs`}
          icon={UsersRound}
          tone={profile.acceptsCollection ? "green" : "amber"}
          valueTone={profile.acceptsCollection ? "green" : "amber"}
        />
      </section>

      <section className={styles.attentionSection} aria-labelledby="attention-heading">
        <div className={styles.attentionHeading}>
          <h2 id="attention-heading">What needs attention</h2>
          <span>Actionable alerts for this school.</span>
        </div>
        <div className={styles.attentionList}>
          {attention.map((item) => {
            const Icon =
              item.tone === "clear"
                ? CheckCircle2
                : item.tone === "warning"
                  ? CircleAlert
                  : TriangleAlert;
            return (
              <div className={styles.attentionItem} key={`${item.title}-${item.detail}`}>
                <Icon
                  className={`${styles.attentionIcon} ${styles[`attentionIcon${item.tone}`]}`}
                  size={22}
                  aria-hidden="true"
                />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
