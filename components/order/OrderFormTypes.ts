import type { GradePackTemplate } from "@/data/phasePacks";

export type ApiResponse = {
  success: boolean;
  message: string;
  submissionId?: string;
  errors?: Record<string, string>;
};

export type GradeOption = {
  id: string;
  grade: string;
  gradeSlug: string;
  price: number;
  contents: string[];
  deliveryNote: string;
};

export type SchoolSearchResult = {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
};

export type SchoolDetails = SchoolSearchResult & {
  grades: GradeOption[];
};

export type CheckoutStepId =
  | "review"
  | "details"
  | "fulfilment"
  | "confirm"
  | "submit";

export type CheckoutStep = {
  id: CheckoutStepId;
  label: string;
  helper: string;
};

export type StandardSelection = {
  mode: "standard" | "custom";
  phaseTitle: string;
  phaseSlug: string;
  pack: GradePackTemplate;
  customItems?: string;
  estimatedTotal?: number;
};

export type FulfilmentOption =
  | "School collection"
  | "Home delivery"
  | "Arrange collection";

export { PEXCOVER_PRICE } from "@/lib/constants";

export const checkoutSteps: CheckoutStep[] = [
  {
    id: "review",
    label: "Review Pack",
    helper: "Check school, grade and selected items.",
  },
  {
    id: "details",
    label: "Customer Details",
    helper: "Tell us who to contact about this order.",
  },
  {
    id: "fulfilment",
    label: "Delivery or Collection",
    helper: "Choose how you would like to receive the pack.",
  },
  {
    id: "confirm",
    label: "Confirm Order",
    helper: "Review everything before submitting.",
  },
  {
    id: "submit",
    label: "Submit Request",
    helper: "Pexpacks will confirm payment and fulfilment.",
  },
];

export type OrderFormProps = {
  initialSchool?: string;
  initialGrade?: string;
  initialPhase?: string;
  initialPackId?: string;
  initialPackType?: string;
  initialCustomItems?: string;
  initialRemovedItems?: string;
  initialEstimatedTotal?: string;
  initialDraftId?: string;
};

export const fulfilmentOptions: Array<{
  value: FulfilmentOption;
  title: string;
  text: string;
  meta: string;
  icon: string;
}> = [
  {
    value: "School collection",
    title: "School Collection",
    text: "Collect from your school or agreed handover point.",
    meta: "Best for official school pack handovers.",
    icon: "school",
  },
  {
    value: "Home delivery",
    title: "Home Delivery",
    text: "Receive your stationery pack at home.",
    meta: "Delivery fee may apply after confirmation.",
    icon: "home",
  },
  {
    value: "Arrange collection",
    title: "Arrange Collection",
    text: "We will contact you to confirm the best pickup option.",
    meta: "Useful when school collection is not available.",
    icon: "pin",
  },
];
