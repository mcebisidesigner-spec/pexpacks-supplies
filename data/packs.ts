export type MainCategory = {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: "school" | "office" | "package";
};

export type Pack = {
  id: string;
  name: string;
  category: "School" | "Office" | "PexPacks";
  subcategory?: string;
  description: string;
  bestFor: string;
  includes: string[];
  benefits?: string[];
  priceLabel: string;
  cta: string;
  href: string;
};

export const mainCategories: MainCategory[] = [
  {
    title: "School Packs",
    description: "Stationery packs prepared around school lists, grade needs and learner readiness.",
    href: "/schools",
    cta: "Find Your School Pack",
    icon: "school"
  },
  {
    title: "Office Packs",
    description: "Monthly stationery and admin packs for SMEs, teams and home offices.",
    href: "/office-packs",
    cta: "View Office Stationery Packs",
    icon: "office"
  },
  {
    title: "Order a Pack",
    description: "Send a school, office or household pack enquiry and let PexPacks confirm the details.",
    href: "/order",
    cta: "Start an Order Enquiry",
    icon: "package"
  }
];

export const trustBadges = [
  "Save time & money",
  "Packed for your school list",
  "Delivered or ready for collection"
];

export const schoolPackBenefits = [
  "Prepared according to school stationery lists",
  "Exercise books included per learner",
  "Grade-specific items checked before packing",
  "Delivery or collection options",
  "Parent prepayment options supported"
];

export const processSteps = [
  "Find your school",
  "Choose your grade",
  "Confirm your pack",
  "Order online",
  "Start school ready"
];

export const homeProcessSteps = [
  {
    title: "Find your school",
    text: "Search for a school or choose the pack category that fits your need."
  },
  {
    title: "Choose the grade or pack",
    text: "Pick the stationery, office or household pack that matches the situation."
  },
  {
    title: "We pack it",
    text: "PexPacks prepares the essentials and confirms collection or delivery."
  }
];

export const whyChoosePexPacks = [
  {
    title: "Ready-packed convenience",
    text: "We prepare complete packs so you do not need to buy items one by one."
  },
  {
    title: "School-list accuracy",
    text: "School packs are built around grade needs and official stationery lists where available."
  },
  {
    title: "Built for busy households",
    text: "Breakfast, lunch, hygiene and home packs help families stay prepared."
  },
  {
    title: "SME office support",
    text: "Office packs keep small teams stocked without wasting time on small purchases."
  },
  {
    title: "School and community impact",
    text: "PexPacks supports partner schools with digital visibility and sponsor access."
  }
];

export const featuredPacks: Pack[] = [
  {
    id: "grade-r-school-pack",
    name: "Grade R School Pack",
    category: "School",
    subcategory: "Foundation",
    description: "A starter stationery kit for early learning, class activities and daily school readiness.",
    bestFor: "Grade R learners",
    includes: ["Exercise books", "Wax crayons", "Glue stick", "Safety scissors", "Scrapbook"],
    priceLabel: "Request price",
    cta: "View Grade R Stationery Packs",
    href: "/schools"
  },
  {
    id: "grade-4-school-pack",
    name: "Grade 4 School Pack",
    category: "School",
    subcategory: "Primary",
    description: "Exercise books, pens, pencils, ruler and classroom basics for primary school learners.",
    bestFor: "Primary school learners",
    includes: ["Exercise books", "Pens", "Pencils", "Ruler", "Eraser", "Sharpener"],
    priceLabel: "Request price",
    cta: "View Grade 4 Stationery Packs",
    href: "/schools"
  },
  {
    id: "high-school-pack",
    name: "High School Pack",
    category: "School",
    subcategory: "High School",
    description: "A practical pack for subject notebooks, writing tools, exam pads and senior learner needs.",
    bestFor: "Grade 8 to Matric learners",
    includes: ["Subject books", "Pens", "Pencils", "Highlighters", "Files", "Exam pad"],
    priceLabel: "Request price",
    cta: "View High School Stationery Packs",
    href: "/schools"
  },
  {
    id: "home-office-starter-pack",
    name: "Home Office Starter Pack",
    category: "Office",
    subcategory: "Office",
    description: "A clean desk setup with stationery and admin basics for work-from-home routines.",
    bestFor: "Freelancers and home offices",
    includes: ["Notebooks", "Pens", "Sticky notes", "Folders", "Correction tape", "Desk basics"],
    priceLabel: "Request quote",
    cta: "View Home Office Pack",
    href: "/office-packs"
  },
  {
    id: "breakfast-pack",
    name: "Breakfast Pack",
    category: "PexPacks",
    subcategory: "Breakfast",
    description: "A practical morning convenience pack that helps families and learners start prepared.",
    bestFor: "Families and learners",
    includes: ["Cereal option", "Long-life milk", "Fruit option", "Snack", "Serviette"],
    priceLabel: "Request price",
    cta: "Enquire About Breakfast Packs",
    href: "/contact?type=pexpacks"
  },
  {
    id: "hygiene-pack",
    name: "Hygiene Pack",
    category: "PexPacks",
    subcategory: "Hygiene",
    description: "Everyday hygiene essentials packed for school, home, sponsorship and emergency support.",
    bestFor: "Learners, families and sponsors",
    includes: ["Soap", "Toothpaste", "Toothbrush", "Sanitary items", "Tissues"],
    priceLabel: "Request price",
    cta: "Enquire About Hygiene Packs",
    href: "/contact?type=pexpacks"
  }
];

export const pexpacks: Pack[] = [
  {
    id: "breakfast-family-pack",
    name: "Breakfast Family Pack",
    category: "PexPacks",
    subcategory: "Breakfast",
    description: "A simple breakfast pack for busy school mornings and weekly household planning.",
    bestFor: "Families with learners",
    includes: ["Cereal", "Long-life milk", "Fruit option", "Snack bars"],
    benefits: ["Faster mornings", "Simple weekly planning", "Sponsor-friendly option"],
    priceLabel: "Request price",
    cta: "Enquire",
    href: "/contact?type=pexpacks"
  },
  {
    id: "lunch-pack",
    name: "Lunch Pack",
    category: "PexPacks",
    subcategory: "Lunch",
    description: "Packed lunch basics for school, work, community drives and sponsored learner support.",
    bestFor: "Learners and working households",
    includes: ["Sandwich option", "Juice", "Snack", "Fruit option"],
    benefits: ["Ready for the day", "Useful for sponsors", "Easy to scale"],
    priceLabel: "Request price",
    cta: "Enquire",
    href: "/contact?type=pexpacks"
  },
  {
    id: "hygiene-essentials-pack",
    name: "Hygiene Essentials Pack",
    category: "PexPacks",
    subcategory: "Hygiene",
    description: "Personal care basics prepared for homes, learners, donors and community support.",
    bestFor: "Learners and family support",
    includes: ["Soap", "Toothbrush", "Toothpaste", "Tissues", "Sanitary items"],
    benefits: ["Dignified support", "Practical contents", "Easy donor fulfilment"],
    priceLabel: "Request price",
    cta: "Enquire",
    href: "/contact?type=sponsorship"
  },
  {
    id: "home-basics-pack",
    name: "Home Basics Pack",
    category: "PexPacks",
    subcategory: "Home Basics",
    description: "Household essentials packed for monthly convenience and emergency top-ups.",
    bestFor: "Busy households",
    includes: ["Cleaning basics", "Tissues", "Laundry item", "Kitchen basics"],
    benefits: ["Monthly convenience", "Fewer errands", "Practical staples"],
    priceLabel: "Request price",
    cta: "Enquire",
    href: "/contact?type=pexpacks"
  },
  {
    id: "learner-care-pack",
    name: "Learner Care Pack",
    category: "PexPacks",
    subcategory: "Learner Care",
    description: "A support pack for learners who need school-day essentials beyond stationery.",
    bestFor: "Sponsored learner programmes",
    includes: ["Snack", "Hygiene basics", "Notebook", "Pen", "Water bottle option"],
    benefits: ["Learner support", "Visible impact", "School campaign ready"],
    priceLabel: "Request price",
    cta: "Sponsor",
    href: "/partner-with-schools#sponsor"
  },
  {
    id: "baby-care-pack",
    name: "Baby Care Pack",
    category: "PexPacks",
    subcategory: "Baby Care",
    description: "Helpful baby-care basics for family support drives and everyday home convenience.",
    bestFor: "Young families and donors",
    includes: ["Wipes", "Baby soap", "Nappy option", "Cream", "Blanket option"],
    benefits: ["Family support", "Practical essentials", "Giftable format"],
    priceLabel: "Request price",
    cta: "Enquire",
    href: "/contact?type=pexpacks"
  },
  {
    id: "study-pack",
    name: "Study Pack",
    category: "PexPacks",
    subcategory: "Study Packs",
    description: "Study-session essentials for learners preparing for tests, exams and projects.",
    bestFor: "Senior learners and students",
    includes: ["Exam pad", "Pens", "Highlighters", "Sticky notes", "Snack"],
    benefits: ["Exam ready", "Focused contents", "Useful for school campaigns"],
    priceLabel: "Request price",
    cta: "Enquire",
    href: "/contact?type=pexpacks"
  },
  {
    id: "emergency-home-pack",
    name: "Emergency Home Pack",
    category: "PexPacks",
    subcategory: "Emergency Packs",
    description: "A practical essentials pack for urgent household support and community relief.",
    bestFor: "Families and community donors",
    includes: ["Food basics", "Hygiene basics", "Cleaning basics", "Torch option"],
    benefits: ["Fast support", "Prepared essentials", "Community-friendly"],
    priceLabel: "Request price",
    cta: "Enquire",
    href: "/contact?type=sponsorship"
  }
];

export const pexpacksCategories = [
  "All",
  "Breakfast",
  "Lunch",
  "Hygiene",
  "Home Basics",
  "Learner Care",
  "Baby Care",
  "Study Packs",
  "Emergency Packs"
];

export const sponsorshipExamples = [
  "Sponsor a learner pack",
  "Sponsor a breakfast pack",
  "Sponsor a classroom pack",
  "Sponsor a school website",
  "Sponsor a hygiene pack"
];
