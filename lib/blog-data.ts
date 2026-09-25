export type ChecklistCategory = {
  category: string;
  items: string[];
};

export type PrintableChecklist = {
  title: string;
  subtitle: string;
  description: string;
  categories: ChecklistCategory[];
  schoolTip: string;
};

export type BlogAuthor = {
  name: string;
  role: string;
  avatar?: string;
};

export type BlogArticle = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category:
    | "Parent Guides"
    | "Stationery & Prep Guides"
    | "Foundation Phase (Gr R-3)"
    | "Intermediate & Senior (Gr 4-9)"
    | "High School & STEM"
    | "Free Printables";
  phase: string;
  readTime: string;
  date: string;
  author: BlogAuthor;
  image: string;
  hasPrintable: boolean;
  printableChecklist?: PrintableChecklist;
  tags: string[];
  content: {
    intro: string[];
    sections: {
      heading: string;
      subheading?: string;
      body: string[];
      callout?: {
        title: string;
        text: string;
        type?: "info" | "warning" | "tip";
      };
    }[];
    conclusion: string[];
  };
};

export const BLOG_CATEGORIES = [
  "All Resources",
  "Parent Guides",
  "Stationery & Prep Guides",
  "Foundation Phase (Gr R-3)",
  "Intermediate & Senior (Gr 4-9)",
  "High School & STEM",
  "Free Printables",
] as const;

export type BlogCategoryFilter = (typeof BLOG_CATEGORIES)[number];

export const blogArticles: BlogArticle[] = [
  {
    id: "grade-4-transition-guide",
    slug: "grade-4-transition-guide",
    title:
      "The Grade 4 Transition: Surviving the Leap from Foundation Phase to Intermediate Phase",
    description:
      "Moving from 17mm ruling to Feint & Margin confuses many parents. Here is what every Intermediate Phase learner actually needs, plus a printable readiness checklist.",
    category: "Parent Guides",
    phase: "Intermediate Phase (Grades 4–6)",
    readTime: "6 min read",
    date: "2026-09-25",
    hasPrintable: true,
    image: "/images/blog/grade-4-transition.jpg",
    tags: [
      "Grade 4",
      "Intermediate Phase",
      "Exercise Books",
      "Stationery Checklist",
      "Parent Tips",
    ],
    author: {
      name: "Mcebisi Mhayise",
      role: "Primary Education & Stationery Specialist",
    },
    printableChecklist: {
      title: "Grade 4 Intermediate Phase Readiness Checklist",
      subtitle: "Official Pexpacks Back-to-School Readiness & Ruling Guide",
      description:
        "Tick off the required exercise books, specialized ruling formats, and daily pencil-case essentials before the first day of school.",
      categories: [
        {
          category: "Exercise Books & Rulings (The Big Shift)",
          items: [
            "8x to 10x A4 72-Page Feint & Margin Exercise Books (8.5mm spacing replaces 17mm lines)",
            "3x to 4x A4 192-Page Hardcover Feint & Margin Books (English, Afrikaans, Maths, Social Sciences)",
            "1x A4 72-Page Quad & Margin Exercise Book (mandatory for Mathematics coordinate work and calculations)",
            "1x A4 Nature Study / Irish & Margin Book (blank page on one side for diagrams, lined on reverse)",
            "1x A4 20-Pocket Display Flip File (for official circulars, test papers, and project rubrics)",
          ],
        },
        {
          category: "Daily Pencil-Case Essentials",
          items: [
            "4x HB Woodcase Graphite Pencils (Staedtler Tradition or Faber-Castell 1111 recommended)",
            "1x 30cm Clear Shatterproof Ruler (must have clear millimetre and centimetre graduations)",
            "2x Large PVC-free Dust-Free Erasers (gentle on thin 60gsm school exercise paper)",
            "1x Metal Double-Hole Pencil Sharpener with integrated shavings canister",
            "4x 43g Jumbo Glue Sticks (Pritt or Bostik — avoid watery liquid glues)",
            "1x 13cm Rounded Blunt-Nosed Safety Scissors (choose left-handed if applicable)",
            "2x Blue Medium Ballpoint Pens (keep safe until the school grants the Pen Licence in Term 2/3)",
          ],
        },
        {
          category: "Creative & Visual Work",
          items: [
            "1x 12 or 24-Pack Full-Length Woodcase Colouring Pencils (pre-sharpened)",
            "1x 4-Pack Slim Neon Highlighters (Yellow, Green, Pink, Blue for summary notes)",
            "1x Sturdy Double-Compartment Pencil Case (keeps writing tools separated from crayons)",
          ],
        },
        {
          category: "Book Protection & Organisation",
          items: [
            "Heavy-Duty 80-Micron Clear Plastic Book Covers or Pexcover Pre-Fit Sleeves",
            "Printed Subject & Learner Name Labels with school coat of arms or subject titles",
            "1x Sturdy A5 Daily School Homework Diary",
          ],
        },
      ],
      schoolTip:
        "Pro-Tip: Most South African primary schools do not allow pencil cases with fidget poppers or metal tins that clatter on wooden desks. Opt for quiet dual-zip canvas pouches.",
    },
    content: {
      intro: [
        "Ask any primary school teacher in South Africa which academic year brings the steepest learning curve, and the answer is almost unanimous: Grade 4.",
        "In Grade 3 (the culmination of the Foundation Phase), your child spent their days primarily with one nurturing teacher, wrote between wide 17mm lines, used triangular pencils, and had their day structured in gentle, familiar blocks. In Grade 4, they step into the Intermediate Phase (IP)—and the academic expectations jump dramatically.",
        "Suddenly, learners have six or seven distinct subjects, five different teachers, a rotating timetable, homework diaries, and a completely different stationery list that baffles even experienced parents. Here is your definitive roadmap to understanding the changes, avoiding expensive mistakes, and getting your child 100% prepared.",
      ],
      sections: [
        {
          heading: "1. The Great Ruling Shift: Why 17mm Disappears",
          subheading: "Say goodbye to wide lines and Irish ruling",
          body: [
            "The single biggest stationery surprise for Grade 4 parents is the ruling of the exercise books. In Foundation Phase, children write in 17mm ruling (very wide spaces with guide dashes to teach letter formation) or Irish & Margin.",
            "In Grade 4, schools switch universally to 8.5mm Feint & Margin. The lines are halved in height. Children with developing fine-motor control can feel overwhelmed trying to condense their cursive or print into half the vertical space.",
            "Furthermore, subjects now require dedicated formats. Mathematics almost always requires a Quad & Margin book (small 5mm or 7mm squares for column addition and graphing), while Natural Sciences often asks for a Nature Study book (blank on the left for drawings and feint-ruled on the right for observations).",
          ],
          callout: {
            title: "Crucial Stationery Warning",
            text: "Never buy 'Irish Ruling' for Grade 4 unless specifically requested. Irish ruling is 8.5mm feint lines with a vertical line dividing the page into two columns, which confuses Intermediate Phase paragraph writing.",
            type: "warning",
          },
        },
        {
          heading: "2. The Pen Licence Myth vs. Reality",
          subheading: "Do they write with pens in Grade 4?",
          body: [
            "A frequent question from parents is: 'Can my child finally write with blue ballpoint pens?'",
            "In South African CAPS curricula, almost all schools require Grade 4 learners to begin Term 1 strictly in pencil. Teachers use the first two terms to ensure handwriting is legible, properly sized, and disciplined within the new 8.5mm lines.",
            "Only when a child consistently demonstrates neat cursive handwriting and minimal mistakes do teachers award the coveted 'Pen Licence'. Buying expensive gel pens or erasable rollerballs in January is usually wasted money—stick to quality HB graphite pencils until the teacher's formal notice.",
          ],
          callout: {
            title: "What Teachers Recommend",
            text: "Provide your child with Staedtler Tradition 110 or Faber-Castell 1111 HB pencils. Cheaper unbranded pencils often contain brittle lead that breaks internally every time the pencil drops.",
            type: "tip",
          },
        },
        {
          heading: "3. Multiple Teachers Means Everything Must Be Labelled",
          subheading: "The end of the communal Foundation Phase crate",
          body: [
            "In Grade R through Grade 3, stationery is often pooled in communal table caddies or stored in the child's single classroom cubby.",
            "In Grade 4, learners move between classes for English, Afrikaans or isiZulu, Mathematics, Life Skills, and Natural Sciences & Technology. Books travel in heavy backpacks and get mixed up in different venues.",
            "If an exercise book or ruler does not have a clean, visible, and protected label with the learner's name, surname, and subject, it invariably disappears into the lost-and-found by week two.",
            "This is why pre-covered books with durable clear plastic (such as Pexpacks' Pexcover service) make such an impact: the subject and learner name are permanently secured under 80-micron film.",
          ],
        },
        {
          heading: "4. The 30cm Ruler and Maths Geometry Preparation",
          subheading: "Precision matters in Intermediate Phase",
          body: [
            "Foundation Phase children frequently use 15cm mini rulers. In Grade 4, a standard 30cm clear shatterproof ruler is non-negotiable. Children must draw neat margins on every single page of their feint-ruled books if the book does not have pre-printed margins.",
            "Look for rulers where the centimetre and millimetre numbers start flush with the edge of the plastic, rather than indented. This prevents measurement errors during early geometry and perimeter lessons.",
          ],
        },
      ],
      conclusion: [
        "The transition to Grade 4 is a milestone moment in your child's schooling journey. It is the bridge between early childhood and independent scholarship.",
        "Having the exact exercise book rulings, sharp HB pencils, reliable glue sticks, and neatly covered books removes classroom anxiety and lets your learner focus on what truly matters: discovering new subjects with confidence.",
        "Print out our free Grade 4 Readiness Checklist below, or simply order your school's tailored pack directly through Pexpacks to have every single item verified by teachers delivered to your door.",
      ],
    },
  },
  {
    id: "smart-budget-formula-january-rush",
    slug: "how-to-avoid-january-rush-markups-smart-budget-formula",
    title:
      "How to Avoid January Rush Markups: The Smart Parent's Budget Formula",
    description:
      "Stationery prices jump by up to 28% between December and mid-January. Learn how early pre-packing, lay-by options, and bulk essentials save thousands.",
    category: "Stationery & Prep Guides",
    phase: "All Phases (Grades R–12)",
    readTime: "5 min read",
    date: "2026-09-20",
    hasPrintable: false,
    image: "/images/blog/smart-budget.jpg",
    tags: ["Budgeting", "School Savings", "Lay-By", "Smart Shopping"],
    author: {
      name: "Nomsa Dlamini",
      role: "Consumer Finance & Family Budgeting",
    },
    content: {
      intro: [
        "Every January, South African retail malls witness the same high-stress spectacle: frantic parents wandering aisles with crumpled school stationery lists, fighting over the last pair of left-handed scissors, and discovering that prices have quietly spiked.",
        "Stationery supply chains follow predictable pricing seasons. Understanding the pricing cycle and using smarter purchasing formulas can easily save a household R800 to R1,800 per learner.",
      ],
      sections: [
        {
          heading: "1. The 28% 'Convenience Tax' in Mid-January",
          body: [
            "Independent retail surveys across Gauteng and the Western Cape show that back-to-school items purchased as loose single units between January 5th and January 20th cost between 18% and 28% more than when purchased in pre-packed bundles during October or November.",
            "Retailers capitalize on scarcity. When a specific workbook or Casio scientific calculator sells out, parents have no choice but to pay premium shelf rates or drive across town to multiple stores.",
          ],
        },
        {
          heading: "2. The Lay-By & HappyPay Splitting Advantage",
          body: [
            "Instead of absorbing a massive financial hit right after the December festive season, savvy parents spread back-to-school costs across two or three pay cheques.",
            "With Pexpacks' zero-interest lay-by and HappyPay 2-part payments, you lock in early-season bulk pricing in October/November, secure guaranteed stock, and pay comfortably before school gates open.",
          ],
          callout: {
            title: "Budget Rule of Thumb",
            text: "Never use high-interest credit cards for disposable stationery. Lay-by and BNPL splits with 0% interest protect your January cash flow without added debt.",
            type: "tip",
          },
        },
        {
          heading: "3. The False Economy of Cheap Glue and Thin Paper",
          body: [
            "Saving R5 on a generic 35g glue stick seems smart until it dries out by the third week of February. A learner ends up needing 8 cheap glue sticks across the year instead of 4 quality 43g Pritt sticks.",
            "Similarly, budget 48gsm exercise books allow ink bleed-through, ruining reverse pages and forcing teachers to ask for replacement books by Term 2. Stick to verified 60gsm paper and approved South African educational brands.",
          ],
        },
      ],
      conclusion: [
        "Beating the January rush is not just about saving money; it is about saving your peace of mind and starting the academic year calm and organised.",
        "Search your school on Pexpacks to explore pre-negotiated package discounts and customisable item selections.",
      ],
    },
  },
  {
    id: "casio-calculator-high-school-guide",
    slug: "casio-fx-82za-plus-ii-vs-fx-991za-high-school-math-calculator-guide",
    title:
      "Casio FX-82ZA Plus II vs FX-991ZA: High School Math Calculator Guide",
    description:
      "Which scientific calculator is DBE and IEB approved for Grade 8 through Matric? Demystifying natural textbook display, complex numbers, and exam rules.",
    category: "High School & STEM",
    phase: "High School & STEM (Grades 8–12)",
    readTime: "7 min read",
    date: "2026-09-15",
    hasPrintable: false,
    image: "/images/blog/casio-calculator.jpg",
    tags: ["High School", "Calculators", "STEM", "Matric", "Mathematics"],
    author: {
      name: "Dr. Kevin Naidoo",
      role: "High School Mathematics & Physics Educator",
    },
    content: {
      intro: [
        "In Grade 8, every South African high schooler meets a stationery item that will stay with them all the way to Matric finals: the scientific calculator.",
        "Browse any school stationery requirements sheet and you will see two prominent models specified: the Casio FX-82ZA Plus II and the Casio FX-991ZA Plus II. But what is the actual difference, which one does your child need, and which one is strictly permitted in final examinations?",
      ],
      sections: [
        {
          heading: "1. Casio FX-82ZA Plus II: The Universal Standard (Grades 8–12)",
          body: [
            "Developed specifically in collaboration with South African mathematics curriculum advisors, the FX-82ZA Plus II is the gold standard for Senior Phase (Grades 8–9) and FET Phase (Grades 10–12 Core Mathematics and Mathematical Literacy).",
            "It features Natural Textbook Display (fractions look like real fractions with a numerator over a denominator, not weird slashes), prime factorisation, quotient remainder calculation, and statistics with standard deviation.",
            "Most importantly: It is 100% permitted in all DBE (Department of Basic Education) and IEB examinations.",
          ],
        },
        {
          heading: "2. Casio FX-991ZA Plus II: The Advanced STEM Powerhouse",
          body: [
            "The FX-991ZA Plus II features over 417 mathematical functions, including matrix and vector calculations, numerical integration, differential calculus, complex numbers, and equation solvers.",
            "Who needs it? It is specifically designed for learners taking Advanced Programme Mathematics (AP Maths), Technical Mathematics, or university-bound STEM subjects.",
            "Important note: Because the FX-991ZA contains equation-solving capabilities, some individual high schools prohibit it for Grade 8 and 9 standard algebra tests to ensure pupils learn basic manual factorization first.",
          ],
          callout: {
            title: "Exam Regulation Advice",
            text: "Unless your school's official stationery list explicitly asks for the FX-991ZA, the FX-82ZA Plus II is the safest, teacher-preferred choice for Grades 8 through 11.",
            type: "info",
          },
        },
        {
          heading: "3. Protecting Against Calculator Theft & Battery Life",
          body: [
            "Calculators look identical in a classroom of 30 learners. Permanent engraving or hot-iron initialling on the slide-on hard case and battery door is strongly advised.",
            "Both models are powered by a standard AAA battery (FX-82ZA) or dual solar-battery (FX-991ZA), giving between two to three years of daily school usage without battery swaps.",
          ],
        },
      ],
      conclusion: [
        "Investing in an authentic, SABS-compliant Casio scientific calculator sets your high schooler up for five years of mathematical confidence.",
        "At Pexpacks, every calculator in our high school packs is 100% genuine stock sourced through official South African educational distributors.",
      ],
    },
  },
  {
    id: "foundation-phase-pencil-grip-crayons",
    slug: "foundation-phase-grip-triangular-pencils-retractable-crayons",
    title:
      "The Foundation Phase Grip: Why Triangular Pencils and Wax Retractables Matter",
    description:
      "Why occupational therapists and Grade 1 teachers insist on jumbo triangular pencils, twist crayons, and left-handed scissors for developing motor skills.",
    category: "Foundation Phase (Gr R-3)",
    phase: "Foundation Phase (Grades R–3)",
    readTime: "4 min read",
    date: "2026-09-10",
    hasPrintable: true,
    image: "/images/blog/foundation-phase.jpg",
    tags: [
      "Grade 1",
      "Grade R",
      "Foundation Phase",
      "Pencil Grip",
      "Occupational Therapy",
    ],
    author: {
      name: "Sarah Van Der Merwe",
      role: "Pediatric Occupational Therapist",
    },
    content: {
      intro: [
        "When parents look at a Grade 1 stationery list and see 'Jumbo Triangular HB Pencils' and 'Twist Retractable Crayons', it can be tempting to buy standard hexagonal pencils and traditional wax crayons from the supermarket.",
        "However, occupational therapists and early childhood educators select these specific tools for crucial biomechanical reasons.",
      ],
      sections: [
        {
          heading: "1. The Dynamic Tripod Grip",
          body: [
            "Children entering Grade R and Grade 1 are transitioning from a whole-hand palmar grasp to a refined dynamic tripod grip (thumb, index, and middle finger).",
            "Round and hexagonal pencils roll easily and slip between small fingers with underdeveloped hand muscles. Triangular pencils have three flat surfaces that naturally position the thumb and forefinger without forcing an awkward claw grasp.",
          ],
        },
        {
          heading: "2. The Problem with Standard Paper-Wrapped Crayons",
          body: [
            "Traditional paper-wrapped crayons break with the slightest excessive pressure. When a 6-year-old snaps a crayon, it often leads to frustration or disengagement.",
            "Retractable twist wax crayons protect the wax inside a durable plastic barrel. They do not break easily, do not melt onto sweaty hands, and eliminate the need for sharpening.",
          ],
          callout: {
            title: "Left-Handed Learners",
            text: "Left-handed children must be provided with true left-handed scissors (where the top blade is reversed). Using right-handed scissors in the left hand bends the paper rather than cutting it.",
            type: "warning",
          },
        },
      ],
      conclusion: [
        "By providing ergonomically appropriate tools in the Foundation Phase, we set children up for pain-free handwriting and a lifelong love of learning.",
      ],
    },
  },
];

export function getAllBlogArticles(): BlogArticle[] {
  return blogArticles;
}

export function getBlogArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find((a) => a.slug === slug);
}

export function getRelatedBlogArticles(
  currentSlug: string,
  limit = 3,
): BlogArticle[] {
  const current = getBlogArticleBySlug(currentSlug);
  const others = blogArticles.filter((a) => a.slug !== currentSlug);

  if (!current) return others.slice(0, limit);

  // Prioritize same category or phase
  const sameCategory = others.filter((a) => a.category === current.category);
  const differentCategory = others.filter((a) => a.category !== current.category);

  return [...sameCategory, ...differentCategory].slice(0, limit);
}
