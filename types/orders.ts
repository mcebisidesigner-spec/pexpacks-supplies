export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "payment_failed"
  | "cancelled"
  | "refunded";

export type CheckoutPayload = {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  learnerName: string;
  schoolSlug: string;
  schoolName: string;
  grade: string;
  gradeSlug: string;
  packType: "full" | "custom" | "office";
  items: string[];
  estimatedTotal: number;
  pexcoverSelected?: boolean;
  pexcoverAmount?: number;
  deliveryMethod: "school_collection" | "delivery" | "collection_point";
  notes?: string;
};


export type OrderStatusResponse = {
  success: boolean;
  status?: OrderStatus;
  orderReference?: string;
  schoolName?: string;
  grade?: string;
  estimatedTotal?: number;
  message?: string;
};
