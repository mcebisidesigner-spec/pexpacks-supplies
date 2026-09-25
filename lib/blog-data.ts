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
    | "Free Printables"
    | "Study Hacks";
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
      body?: string[];
      paragraphs?: string[];
      callout?: {
        title: string;
        text: string;
        type?: "info" | "warning" | "tip";
      };
    }[];
    conclusion?: string[];
  };
};

export const BLOG_CATEGORIES = [
  "All Resources",
  "Free Printables",
  "Parent Guides",
  "Study Hacks",
  "Stationery & Prep Guides",
  "High School & STEM",
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
      "Free Printables",
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
      schoolTip:
        "South African CAPS teachers inspect book rulings during the first week. Ensure all Feint & Margin books have ruled margins and clear protective covering.",
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
          category: "Pencil Case Essentials (Term 1 & 2 Focus)",
          items: [
            "4x Good Quality HB Graphite Pencils (Staedtler Tradition or Faber-Castell recommended)",
            "1x 30cm Shatterproof Ruler (clear plastic with millimetre calibration flush to edge)",
            "2x Large Dust-Free White Vinyl Erasers",
            "1x Metal Double-Hole Canister Pencil Sharpener (prevents shavings inside school desk)",
            "2x 40g Glue Sticks (Bostik or Pritt solvent-free formula)",
            "1x 13cm Rounded-Tip Safety Scissors (left-handed if applicable)",
            "1x 12-Pack Full-Length Triangular Colouring Pencils (resists desk-drop breakage)",
          ],
        },
        {
          category: "Measurement, Art & Craft Supplies",
          items: [
            "1x 180-Degree Transparent Mathematical Protractor (for introductory angle lessons in Term 2)",
            "1x Set of 4 Chisel-Tip Pastel Highlighters (Yellow, Green, Blue, Pink for text comprehension)",
            "1x 30cm Canvas Pencil Case (barrel pouches cannot fit a 30cm ruler without snapping)",
          ],
        },
        {
          category: "Organisation, Protection & Labelling",
          items: [
            "Pre-cut Heavy-Duty 80-Micron Clear Book Covers (or Pexcover pre-covering)",
            "Pack of 30 Self-Adhesive Printed Subject Labels (Learner Name, Grade 4, Subject)",
            "A5 Homework Diary / School Communication Book",
          ],
        },
      ],
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
          subheading: "SAY GOODBYE TO WIDE LINES AND IRISH RULING",
          paragraphs: [
            "The single biggest point of confusion on a Grade 4 stationery list is book ruling. In Grades 1 to 3, children write in exercise books ruled with 17mm line spacing—sometimes with intermediate guidelines (Irish ruling) to assist with lowercase ascenders and descenders.",
            "In Grade 4, Foundation Phase ruling is retired. Learners transition overnight to standard 8.5mm Feint & Margin (F&M). Writing on lines half the size requires fine motor discipline and spatial control.",
            "Buying the wrong ruling is the #1 mistake parents make in January. If you buy 17mm books, teachers will return them unopened on day two.",
          ],
          callout: {
            title: "Crucial Rule of Thumb for South African Schools",
            text: "Unless your school's official list specifically specifies otherwise, all standard exercise books for Grade 4 must be A4 72-page Feint & Margin (F&M) with a printed red vertical margin line.",
          },
        },
        {
          heading: "2. The Pen Licence Myth vs. Reality",
          subheading: "DO THEY WRITE WITH PENS IN GRADE 4?",
          paragraphs: [
            "A frequent question from parents is: 'Can my child finally write with blue ballpoint pens?'",
            "In South African CAPS curricula, almost all schools require Grade 4 learners to begin Term 1 strictly in pencil. Teachers use the first two terms to ensure handwriting is legible, properly sized, and disciplined within the new 8.5mm lines.",
            "Only when a child consistently demonstrates neat cursive handwriting and minimal mistakes do teachers award the coveted 'Pen Licence'. Buying expensive gel pens or erasable rollerballs in January is usually wasted money—stick to quality HB graphite pencils until the teacher's formal notice.",
          ],
          callout: {
            title: "What Teachers Recommend",
            text: "Provide your child with Staedtler Tradition 110 or Faber-Castell 1111 HB pencils. Cheaper unbranded pencils often contain brittle lead that breaks internally every time the pencil drops.",
          },
        },
        {
          heading: "3. Multiple Teachers Means Everything Must Be Labelled",
          subheading: "THE END OF THE COMMUNAL FOUNDATION PHASE CRATE",
          paragraphs: [
            "In Grade R through Grade 3, stationery is often pooled in communal table caddies or stored in the child's single classroom cubby.",
            "In Grade 4, learners move between classes for English, Afrikaans or isiZulu, Mathematics, Life Skills, and Natural Sciences & Technology. Books travel in heavy backpacks and get mixed up in different venues.",
            "If an exercise book or ruler does not have a clean, visible, and protected label with the learner's name, surname, and subject, it invariably disappears into the lost-and-found by week two.",
          ],
        },
        {
          heading: "4. The 30cm Ruler Dilemma",
          subheading: "WHY BARREL PENCIL CASES CAUSE BROKEN RULERS",
          paragraphs: [
            "Grade 4 Mathematics introduces basic geometry, perimeters, and data handling. A sturdy 30cm shatterproof ruler is used in every single lesson.",
            "Unfortunately, trendy cylinder or barrel pencil cases are only 20cm to 22cm long. Learners force their 30cm ruler in diagonally, snapping the ruler or tearing the zipper within the first fortnight.",
            "Choose a flat 33cm wide pencil case or a double-zip pouch designed to comfortably house a full-length ruler alongside pens, glue, and scissors.",
          ],
        },
      ],
      conclusion: [
        "The leap into Grade 4 is a proud milestone for both parents and learners. With the right stationery foundations and pre-labelled books, your child will enter their new classroom confident, equipped, and excited for the journey ahead.",
      ],
    },
  },
  {
    id: "pexcover-book-covering-guide",
    slug: "pexcover-book-covering-guide",
    title:
      "The Parent's Guide to Book Covering: Why Schools Require It & How Pexcover Solves It",
    description:
      "Avoid midnight contact plastic bubbles, sticky tape disasters, and peeling corners. Discover why South African schools mandate covered books and how Pexcover pre-covers books in 80-micron protection before delivery.",
    category: "Parent Guides",
    phase: "All Grades (Gr R–12)",
    readTime: "5 min read",
    date: "2026-09-26",
    image: "/images/blog/pexcover-guide.jpg",
    author: {
      name: "Mcebisi Mhayise",
      role: "Primary Education & Stationery Specialist",
    },
    tags: [
      "Pexcover",
      "Book Covering",
      "Stationery Lists",
      "Parent Tips",
      "Back to School",
    ],
    hasPrintable: false,
    content: {
      intro: [
        "Every January across South Africa, a familiar collective groan echoes through family living rooms: the dreaded book covering marathon.",
        "Equipped with rolls of sticky contact plastic, scissors that never seem sharp enough, and sellotape that splits in all the wrong places, parents spend hours trying to smooth out air bubbles on 20 or more exercise books. By midnight, fingers are sticky, corners are wrinkled, and patience has worn thin.",
        "Why do schools insist on covered exercise books, and how can parents completely eliminate this chore while still giving their children classroom-ready books on day one?",
      ],
      sections: [
        {
          heading: "1. Why Schools Insist On Covered Exercise Books",
          subheading: "PROTECTING CURRICULUM WORK OVER FOUR FULL TERMS",
          paragraphs: [
            "In both public CAPS and private IEB schools, exercise books are not just notepads—they are continuous portfolios of evidence for assessment. An exercise book must withstand being crammed into heavy backpacks, pulled in and out of desks multiple times a day, and survive rainy commutes for up to ten months.",
            "Without protective covering, cardboard covers quickly fray, moisture warps pages, and staples loosen. When books are neatly covered and named, teachers can immediately identify each learner's book on their marking pile and children take greater pride in keeping their schoolwork neat.",
          ],
        },
        {
          heading: "2. The Hidden Cost of DIY Contact Plastic",
          subheading: "AIR BUBBLES, TIME LOST, AND EXPENSIVE RE-ROLLS",
          paragraphs: [
            "Cheap rolls of adhesive plastic often stretch unevenly, creating permanent wrinkles across the cover. Even worse, if you make a mistake on an expensive hardcover book, peeling off the plastic can tear the paper beneath.",
            "By the time parents purchase four or five rolls of contact paper, heavy brown kraft paper, sellotape dispensers, and personalized name stickers, they have spent significant money—plus an entire evening of frustrating labor.",
          ],
          callout: {
            title: "What South African Teachers Say",
            text: "Teachers strongly prefer books covered with a sturdy inner paper (such as heavy brown kraft or vibrant paper) sealed under a clear protective sleeve. This prevents ink bleed-through from front covers and ensures labels remain legible all year.",
          },
        },
        {
          heading: "3. How Pexcover Works: Professional Pre-Covering",
          subheading: "DONE-FOR-YOU PROTECTION DELIVERED TO YOUR DOOR",
          paragraphs: [
            "Pexpacks created Pexcover specifically to solve this back-to-school headache. When ordering a verified stationery pack, parents can simply toggle the Pexcover option for their coverable exercise books.",
            "Each book is wrapped in heavy-duty 80-micron clear protective film with the learner's choice of paper style: classic Standard Kraft, Marbled & Print, or Solid Vibrant Colors. Every book is neatly fitted with custom printed labels displaying the learner's full name, grade, and subject.",
          ],
        },
        {
          heading: "4. How to Add Pexcover to Your Pack",
          subheading: "ONE-CLICK TOGGLE DURING CHECKOUT",
          paragraphs: [
            "When viewing your school pack in your order tray or uploading your stationery list, look for the 'Pexcover Done-For-You' card. Check the box, pick your preferred paper style, and your entire pack arrives pre-covered, labelled, and ready for school on day one.",
            "No scissors, no air bubbles, no midnight stress.",
          ],
        },
      ],
      conclusion: [
        "Book covering doesn't have to be a stressful January ritual. With Pexcover, your child receives perfectly protected, teacher-compliant exercise books that stay pristine from Term 1 through final exams.",
      ],
    },
  },
  {
    id: "high-school-study-hacks-cornell-notes-revision-guide",
    slug: "high-school-study-hacks-cornell-notes-revision-guide",
    title:
      "High School Study Hacks: The Cornell Note Method, Quad Books & Active Recall for Top Marks",
    description:
      "Transform how you revise for Grade 8 through Matric exams. Master the Cornell note-taking technique, learn why quad exercise books beat lined pages for STEM, and use our free printable revision timetable.",
    category: "Study Hacks",
    phase: "Senior & FET Phase (Grades 8–12)",
    readTime: "6 min read",
    date: "2026-09-27",
    image: "/images/blog/study-hacks.jpg",
    author: {
      name: "Nomsa Dlamini",
      role: "Consumer Finance & Academic Strategy",
    },
    tags: [
      "Study Hacks",
      "High School",
      "Exams",
      "Note Taking",
      "Matric",
      "Free Printables",
    ],
    hasPrintable: true,
    printableChecklist: {
      title: "High School Weekly Revision & Study Planner",
      subtitle: "Official Pexpacks Study Schedule & Exam Readiness Framework",
      description:
        "Daily active recall schedule, high-yield revision habits, and mandatory STEM stationery tools for Grade 8 through Matric learners.",
      schoolTip:
        "Consistent 20-minute daily review sessions beat all-night cramming. Keep revision notes strictly separated by subject flip files.",
      categories: [
        {
          category: "Daily Active Recall Habits",
          items: [
            "Summarize each lesson into Cornell note summary block within 24 hours",
            "Generate 3 flashcards or practice questions per major textbook chapter",
            "Review previous week's science formulas and math theorems using blurting method",
            "Highlight core concepts using 3-tier color coding (terms, definitions, examples)",
          ],
        },
        {
          category: "Stationery Tools That Boost Revision",
          items: [
            "Quad grid exercise books (5mm/10mm) for all mathematics and accounting workings",
            "Pastel highlighters (avoid dark neon that bleeds through 70gsm paper)",
            "0.5mm or 0.7mm gel pens for high-speed legible exam writing",
            "Clear document wallet / flip file for past examination papers and memos",
            "Casio scientific calculator with fresh backup batteries",
          ],
        },
        {
          category: "Exam Week Final Countdown",
          items: [
            "Complete 2 full past exam papers under strict timed examination conditions",
            "Mark against official DBE / IEB memorandums in contrasting red or green ink",
            "Compile formula cheat sheet for final 30-minute pre-exam memory consolidation",
            "Prepare clear exam pencil case (transparent pouch mandatory for exam venues)",
          ],
        },
      ],
    },
    content: {
      intro: [
        "Stepping into Grade 8 or preparing for Matric brings an overwhelming volume of content across seven subjects. Passive studying—re-reading textbooks or highlighting whole pages in neon yellow—is proven to be the least effective way to retain information.",
        "Top-performing learners rely on proven cognitive study techniques and specific stationery setups that turn revision into an active, high-yield habit. Here is how to upgrade your study system this term.",
      ],
      sections: [
        {
          heading: "1. The Cornell Note-Taking System",
          subheading: "DIVIDE YOUR PAGE TO MULTIPLY YOUR RETENTION",
          paragraphs: [
            "Developed at Cornell University, this method divides an A4 feint-ruled page into three distinct sections: a narrow left margin (the Cue Column), a wide right section (the Notes Area), and a 5cm block at the bottom (the Summary).",
            "During class, record key explanations in the Notes Area. Within 24 hours, write recall prompts and questions in the Cue Column. Finally, synthesize the entire page in two sentences at the bottom. When test week arrives, cover the notes and quiz yourself using only the cues.",
          ],
          callout: {
            title: "Why Color Coding Matters",
            text: "Adopt a strict 3-color highlighter convention: Yellow for core vocabulary, Orange for laws, theorems and formulas, and Green for real-world case examples. Keeping colors consistent across all subjects speeds up visual recall during exams.",
          },
        },
        {
          heading: "2. Why Quad Grid Books Beat Lined Pages for STEM",
          subheading: "MATHEMATICS, PHYSICAL SCIENCES & ACCOUNTING ACCURACY",
          paragraphs: [
            "Feint-ruled lines are designed for text, but they fail when drawing graphs, balancing chemical equations, or aligning accounting ledgers. Quad grid exercise books (either 5mm or 10mm grid) provide structural alignment.",
            "Learners who use quad books make significantly fewer transcription errors in trigonometry and algebra because numbers, exponents, and fraction bars stay strictly aligned.",
          ],
        },
        {
          heading: "3. Spaced Repetition & The 20-Minute Review",
          subheading: "CONQUERING THE FORGETTING CURVE",
          paragraphs: [
            "German psychologist Hermann Ebbinghaus discovered that within 48 hours of learning new material, the human brain forgets up to 75% of it unless actively reviewed. A quick 15-to-20 minute review session at the end of each study day resets this curve to 100%.",
            "Use our printable revision checklist below to track your daily active recall and organize your study sessions systematically.",
          ],
        },
      ],
      conclusion: [
        "High school academic success is not about working 14 hours a day—it is about working systematically with the right note-taking structure and stationery tools.",
      ],
    },
  },
  {
    id: "how-to-avoid-january-rush-markups-smart-budget-formula",
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
    tags: [
      "Budgeting",
      "Back to School",
      "Stationery Costs",
      "Money Saving",
      "Parent Tips",
    ],
    author: {
      name: "Nomsa Dlamini",
      role: "Consumer Finance & Family Budgeting",
    },
    content: {
      intro: [
        "Every year, South African families spend between R1,200 and R4,500 per learner on back-to-school stationery, workbooks, and uniform essentials.",
        "Retail pricing data reveals a stark reality: walk-in department store prices on essential stationery items spike significantly during the frantic two weeks before Term 1 commences.",
      ],
      sections: [
        {
          heading: "1. The Convenience Penalty at Mall Shelves",
          subheading: "WHAT HAPPENS IN JANUARY RETAIL",
          paragraphs: [
            "When parents shop in early January, stockouts on popular brands (Pritt, Bic, Staedtler, Croxley) force them to buy premium multipacks or inferior knockoffs that don't last.",
            "Retailers rarely run genuine promotions during peak rush weeks. Buying your packs in October or November secures off-season bulk rates.",
          ],
        },
        {
          heading: "2. The 'Buy Once, Buy Right' Quality Principle",
          subheading: "CHEAP STATIONERY ALWAYS COSTS DOUBLE",
          paragraphs: [
            "A budget 30cm ruler for R3 snaps when dropped, requiring three replacements over the term. A shatterproof ruler for R12 survives two full grades.",
            "The same applies to glue sticks: low-cost PVA glue sticks dry out inside pencil cases within four weeks, whereas quality solvent-free formulas maintain adhesion all year.",
          ],
        },
      ],
      conclusion: [
        "By planning ahead and ordering your teacher-verified pack early, you beat the markups, avoid mall queues, and start January stress-free.",
      ],
    },
  },
  {
    id: "casio-fx-82za-plus-ii-vs-fx-991za-high-school-math-calculator-guide",
    slug: "casio-fx-82za-plus-ii-vs-fx-991za-high-school-math-calculator-guide",
    title:
      "Casio FX-82ZA Plus II vs FX-991ZA: High School Math Calculator Guide",
    description:
      "Which scientific calculator is DBE and IEB approved for Grade 8 through Matric? Demystifying natural textbook display, complex numbers, and exam rules.",
    category: "High School & STEM",
    phase: "Senior & FET Phase (Grades 8–12)",
    readTime: "7 min read",
    date: "2026-09-15",
    hasPrintable: false,
    image: "/images/blog/casio-calculator.jpg",
    tags: [
      "Casio",
      "Scientific Calculators",
      "High School",
      "Mathematics",
      "Matric Exams",
    ],
    author: {
      name: "David Ndlovu",
      role: "High School STEM & Curriculum Specialist",
    },
    content: {
      intro: [
        "In Grade 8, simple four-function calculators are no longer permitted. High school mathematics requires a scientific calculator that will accompany learners through to their final Matric examinations.",
        "In South Africa, the Casio FX-82ZA Plus II and FX-991ZA Plus II dominate the classroom. Here is how to choose the right model for your child's subject choices.",
      ],
      sections: [
        {
          heading: "1. Casio FX-82ZA Plus II: The Universal Standard",
          subheading: "THE DEFAULT FOR CORE MATHS & MATHS LITERACY",
          paragraphs: [
            "Developed specifically for the South African CAPS curriculum, the FX-82ZA Plus II features 283 built-in functions, natural textbook display, and quotient remainder division.",
            "It is 100% compliant with DBE and IEB examination regulations for both Core Mathematics and Mathematical Literacy from Grade 8 through 12.",
          ],
        },
        {
          heading: "2. Casio FX-991ZA Plus II: When Is It Needed?",
          subheading: "FOR ADVANCED PROGRAMME (AP) MATHS & ENGINEERING",
          paragraphs: [
            "The FX-991ZA Plus II boasts 433 functions, including matrix calculations, vector operations, and equation solvers. It is ideal for learners taking AP Mathematics or intending to study engineering or commerce at university.",
            "Important: Some schools and examination boards restrict the FX-991ZA in standard Grade 10 exams due to its equation-solving features. Always check your school's specific calculator policy before purchasing.",
          ],
        },
      ],
      conclusion: [
        "For 90% of high school learners, the FX-82ZA Plus II is the gold standard that will last all five years of high school.",
      ],
    },
  },
  {
    id: "foundation-phase-grip-triangular-pencils-retractable-crayons",
    slug: "foundation-phase-grip-triangular-pencils-retractable-crayons",
    title:
      "Foundation Phase Pencil Grip: Triangular Pencils vs Retractable Crayons",
    description:
      "Why occupational therapists recommend jumbo triangular pencils for Grade R to 2, and why standard wax crayons cause hand fatigue during early handwriting development.",
    category: "Parent Guides",
    phase: "Foundation Phase (Grades R–3)",
    readTime: "4 min read",
    date: "2026-09-10",
    hasPrintable: false,
    image: "/images/blog/foundation-phase.jpg",
    author: {
      name: "Mcebisi Mhayise",
      role: "Primary Education & Stationery Specialist",
    },
    tags: [
      "Foundation Phase",
      "Grade R",
      "Grade 1",
      "Pencil Grip",
      "Ergonomics",
    ],
    content: {
      intro: [
        "Early handwriting development is a critical Foundation Phase milestone. Children are developing pencil grip, finger strength, and wrist stability.",
        "Choosing ergonomic stationery tools in Grade R, 1, and 2 makes a tremendous difference in preventing finger fatigue and fostering confident writing habits.",
      ],
      sections: [
        {
          heading: "1. The Ergonomic Advantage of Triangular Pencils",
          subheading: "ENCOURAGING A NATURAL TRIPOD GRIP",
          paragraphs: [
            "Standard round or hexagonal pencils often slip between small fingers, leading to awkward fist or cross-thumb grips.",
            "Jumbo triangular pencils provide three wide flat surfaces that naturally guide the thumb, index, and middle fingers into the correct mature tripod grasp.",
          ],
        },
        {
          heading: "2. Why Retractable Wax Crayons Win",
          subheading: "NO PAPER PEELING, NO BREAKAGE",
          paragraphs: [
            "Traditional paper-wrapped wax crayons snap in half easily and require constant peeling that interrupts drawing lessons.",
            "Retractable crayons house the wax in a durable plastic casing with a twist mechanism, keeping hands clean and ensuring every millimetre of crayon is used.",
          ],
        },
      ],
      conclusion: [
        "Equipping young learners with ergonomic triangular pencils builds confidence and proper handwriting mechanics from their very first day in school.",
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
