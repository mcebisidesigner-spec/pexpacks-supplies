"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const RetailVsPexpacksSlider = dynamic(
  () =>
    import("@/components/marketing/RetailVsPexpacksSlider").then(
      (m) => m.RetailVsPexpacksSlider,
    ),
);

const FaqMarquee = dynamic(
  () => import("@/components/shared/FaqMarquee").then((m) => m.FaqMarquee),
);

const TestimonialMarquee = dynamic(
  () =>
    import("@/components/shared/TestimonialMarquee").then(
      (m) => m.TestimonialMarquee,
    ),
);

const HappyPayBanner = dynamic(
  () =>
    import("@/components/bnpl/HappyPayBanner").then((m) => m.HappyPayBanner),
);

const HappyPaySteps = dynamic(
  () => import("@/components/bnpl/HappyPaySteps").then((m) => m.HappyPaySteps),
);

export {
  RetailVsPexpacksSlider,
  FaqMarquee,
  TestimonialMarquee,
  HappyPayBanner,
  HappyPaySteps,
};
