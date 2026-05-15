export type SuccessStory = {
  id: string;
  schoolName: string;
  location: string;
  challenge: string;
  solution: string;
  results: string[];
  quote: string;
  quoteAuthor: string;
  role: string;
};

export const successStories: SuccessStory[] = [
  {
    id: "1",
    schoolName: "Parktown Primary School",
    location: "Johannesburg, Gauteng",
    challenge:
      "Teachers were spending the first two weeks of the first term dealing with incorrect stationery, missing items, and off-brand cheap glue that ruined classroom work.",
    solution:
      "Partnered with PexPacks to standardize Grade R to Grade 3 stationery lists. Parents ordered directly through the PexPacks portal, and the school received all packs delivered in bulk.",
    results: [
      "100% of learners had the correct, teacher-approved brands",
      "Zero missing items on the first day of school",
      "Eliminated the admin burden of collecting stationery money",
    ],
    quote:
      "PexPacks completely changed our back-to-school experience. Instead of fielding complaints from parents about sold-out items at retail stores, we just directed them to our custom PexPacks link. The first week of term has never been this smooth.",
    quoteAuthor: "Sarah Jenkins",
    role: "Foundation Phase Head",
  },
  {
    id: "2",
    schoolName: "Crestview Academy",
    location: "Pretoria, Gauteng",
    challenge:
      "The school wanted to implement a bulk-delivery model to save parents money, but lacked the warehousing space to pack 800 individual learner boxes.",
    solution:
      "PexPacks handled the entire procurement, packing, and labeling process off-site. Pallets were delivered directly to the school hall exactly two days before term started, neatly categorized by class.",
    results: [
      "Saved parents an average of 15% compared to retail prices",
      "Over 800 customized packs successfully delivered",
      "Each box included the Pexcover service, meaning zero book-covering for parents",
    ],
    quote:
      "The logistics behind packing 800 specific grade boxes is a nightmare. PexPacks took that entirely off our hands. The delivery was flawless, and the parents were thrilled with the Pexcover add-on.",
    quoteAuthor: "David Mabena",
    role: "School Principal",
  },
  {
    id: "3",
    schoolName: "Greenwood High School",
    location: "Cape Town, Western Cape",
    challenge:
      "High school learners required highly specific items (e.g. specialized Casio calculators, specific art portfolios) that parents struggled to find in a single store.",
    solution:
      "PexPacks sourced all niche high school items directly from specialized suppliers, combining them into single, ready-to-use grade packs.",
    results: [
      "No more learners arriving without expensive specialized equipment",
      "Parents saved an average of 4 hours of driving between stores",
      "Seamless integration with the school's existing parent communication portal",
    ],
    quote:
      "Finding the exact geometry sets and scientific calculators was always a massive frustration for our parents. Knowing PexPacks sources exactly what we specify means our teachers can actually start teaching on Day 1.",
    quoteAuthor: "Elize van der Merwe",
    role: "Head of Academics",
  },
];
