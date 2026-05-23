import type { Metadata } from "next";
import Link from "next/link";
import {
  generalEmail,
  generalEmailHref,
  phoneHref,
  phoneNumber,
} from "@/data/contact";
import {
  LegalDocumentPage,
  type LegalDocumentConfig,
} from "@/components/policy/LegalDocumentPage";
import { buildMetadata } from "@/lib/seo";
import { EFFECTIVE_DATE } from "@/lib/constants";



export const metadata: Metadata = buildMetadata(
  "Delivery Policy",
  "Read the Pexpacks delivery policy for school stationery packs, handover timing, and support.",
  "/delivery-policy"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/delivery-policy",
  pageTitle: "Delivery Policy",
  metaDescription:
    "Read the Pexpacks delivery policy for school stationery packs, handover timing, and support.",
  heroEyebrow: "Delivery Policy",
  heroTitle: "How delivery and collection work",
  heroText:
    "This document explains how Pexpacks handles collection points, delivery timing, customer handover, and support when fulfilment questions come up.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "School packs, home delivery, and collection support.",
  tocHeading: "Delivery contents",
  tocAriaLabel: "Delivery policy contents",
  summaryKicker: "Delivery snapshot",
  summaryTitle: "Delivery timing is confirmed after order and stock review",
  summaryText:
    "Pexpacks confirms the final fulfilment route after checking school, grade, stock readiness, payment status, and the agreed collection or delivery method.",
  highlights: [
    {
      title: "Contact",
      content: (
        <>
          Email <a href={generalEmailHref}>{generalEmail}</a> or call{" "}
          <a href={phoneHref}>{phoneNumber}</a>.
        </>
      ),
      tone: "accent",
    },
    {
      title: "Important",
      content:
        "Delivery windows are estimates unless Pexpacks confirms a fixed timeline in writing.",
      tone: "warning",
    },
    {
      title: "Tracking help",
      content: (
        <>
          Use the <Link href="/track-order">track order page</Link> if you need
          help after an order is submitted.
        </>
      ),
    },
  ],
  sections: [
    {
      id: "delivery-options",
      eyebrow: "1",
      title: "Delivery and collection options",
      summary:
        "Available fulfilment methods depend on the pack type, the school, the area, and operational timing.",
      content: (
        <ul>
          <li>School collection points where a school arrangement exists.</li>
          <li>Home delivery where the area and order qualify.</li>
          <li>Office delivery for business or approved convenience use cases.</li>
          <li>Customer collection by prior arrangement.</li>
        </ul>
      ),
    },
    {
      id: "timing-and-preparation",
      eyebrow: "2",
      title: "Preparation, lead times, and timing",
      summary:
        "Fulfilment timing depends on stock, list verification, custom work, and seasonal demand.",
      content: (
        <>
          <p>
            Pexpacks usually confirms timing only after order details have been
            reviewed. Peak school periods, supplier lead times, list changes,
            and custom services such as Pexcover can affect preparation time.
          </p>
          <p>
            Delivery or collection windows may also depend on school calendars,
            courier routes, public holidays, and customer availability.
          </p>
        </>
      ),
    },
    {
      id: "handover-and-risk",
      eyebrow: "3",
      title: "Handover, collection, and responsibility",
      summary:
        "Orders should be checked promptly after handover so issues can be resolved quickly.",
      content: (
        <ul>
          <li>
            A delivery may be handed to the customer, an authorised recipient,
            or an approved school collection point.
          </li>
          <li>
            Customers should review pack contents, visible damage, and obvious
            shortages as soon as reasonably possible.
          </li>
          <li>
            If nobody is available for an agreed delivery, a second attempt,
            collection instruction, or support follow-up may be required.
          </li>
        </ul>
      ),
    },
    {
      id: "delivery-support",
      eyebrow: "4",
      title: "Late delivery, failed delivery, and support",
      summary:
        "Delivery issues should be raised quickly with enough detail for Pexpacks to trace the order.",
      content: (
        <>
          <p>
            Delays can happen because of incorrect addresses, school changes,
            weather, courier disruption, or supplier-side stock movement.
          </p>
          <p>
            When you contact Pexpacks about a delayed or failed delivery,
            include your name, order reference, school, grade, and the best
            callback or email contact so the fulfilment team can investigate.
          </p>
        </>
      ),
    },
  ],
  notice: (
    <p>
      If delivery details change after an order is submitted, notify Pexpacks
      immediately. Incorrect delivery information can delay fulfilment or
      collection.
    </p>
  ),
};

export default function DeliveryPolicyPage() {
  return <LegalDocumentPage {...config} />;
}
