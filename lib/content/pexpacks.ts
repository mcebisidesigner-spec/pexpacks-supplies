export const PEXPACKS_CONTENT = {
  brand: {
    promise:
      "Convenient school stationery ordering with personal help when you need it.",
    reassurance:
      "You can do most of this online, and I am here to help when something needs a closer look.",
  },
  lists: {
    short:
      "Have a stationery list? Upload it and Bro Pex will help you organise the items for you.",
    detail:
      "Upload a PDF or clear photo of your school list. You can review the suggested items before ordering, and personal help is available if something does not look right.",
    review:
      "Your list is ready to review. Check the suggested items before continuing.",
  },
  ordering: {
    findSchool:
      "Search for your school, choose the learner's grade, and review the pack before adding it to your order.",
    packPromise:
      "School packs are prepared to match the official school list where that list is available.",
  },
  support: {
    contact:
      "Still unsure? Send a message and I will help you work through it.",
    whatsapp:
      "Have a question about your list or order? Send a WhatsApp message for personal help.",
  },
  terminology: {
    cart: "order",
    checkout: "checkout",
    schoolList: "school list",
    product: "item",
    delivery: "delivery",
    customer: "customer",
    uploadList: "Upload your list",
    assistant: "Bro Pex",
    pack: "stationery pack",
  },
} as const;

export type PexpacksNotificationTone = "success" | "info" | "warning" | "error";
