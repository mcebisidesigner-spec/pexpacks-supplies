export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  date: string;
  author: string;
  category: string;
  image: string;
};

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "ultimate-grade-1-stationery-checklist",
    title: "The Ultimate Grade 1 Stationery Checklist",
    excerpt: "Starting Grade 1 is a huge milestone! Here is exactly what your child needs to hit the ground running on their first day.",
    content: [
      "Starting Grade 1 is a huge milestone for both parents and children. While the new uniforms and backpacks are exciting, the stationery list can often feel overwhelming.",
      "Most Grade 1 lists require specific items designed for little hands learning to write and cut for the first time.",
      "Here are the absolute essentials you will find on almost every South African Grade 1 list:",
      "1. Jumbo Triangular Pencils: Standard pencils are too thin for 6-year-olds learning grip. Triangular jumbo pencils encourage the correct tripod grip.",
      "2. Retractable Wax Crayons (Monamis): Regular crayons snap easily. Retractable crayons last much longer and don't stain hands.",
      "3. Blunt-Nosed Scissors: Safety first! Ensure you buy left-handed scissors if your child is left-handed, it makes a massive difference.",
      "4. Quality Glue Sticks: Avoid cheap glue that dries out. Stick to trusted brands like Pritt or Bostik, and buy at least 4 for the year.",
      "5. A3 Whiteboard & Markers: Many schools use these for interactive desk work.",
      "Remember, if you order through PexPacks, we source all these specific requirements directly from your school's official list and pack them for you—saving you the hassle of hunting down jumbo pencils at three different stores!"
    ],
    date: "2023-10-15",
    author: "PexPacks Team",
    category: "Parenting Tips",
    image: "/images/hero-school-delivery.webp",
  },
  {
    id: "2",
    slug: "how-to-label-school-supplies-efficiently",
    title: "How to Label School Supplies Efficiently",
    excerpt: "Don't spend hours writing your child's name on 50 separate crayons. Follow these quick tips to label stationery efficiently.",
    content: [
      "If there is one universal truth about primary school, it is this: Unlabelled stationery will disappear within the first week.",
      "But labelling 50 separate pencils, crayons, and glues can be a nightmare. Here is how to do it efficiently:",
      "1. Order Pre-Printed Wrap Labels: Instead of writing the name 100 times, invest in a sheet of wrap-around sticker labels. They peel off and wrap securely around pens and pencils without falling off.",
      "2. The Clear Tape Trick: If you are writing by hand, the ink will rub off from sweaty little fingers. Always wrap a piece of clear Sellotape tightly over the written label to protect it.",
      "3. Label the Lids AND the Bases: Kids lose lids constantly. If you only label the lid of a Pritt or a marker, the actual marker will end up in the lost-and-found.",
      "4. Engrave Expensive Items: For calculators or expensive geometry sets, consider a cheap etching tool or scratching the initials into the plastic.",
      "Did you know? PexPacks ensures that everything arrives neatly packed per child, making the labelling process much more organised since you don't have to sort through a massive family pile of supplies first."
    ],
    date: "2023-11-02",
    author: "PexPacks Team",
    category: "Guides",
    image: "/images/unboxing-G7.webp",
  },
  {
    id: "3",
    slug: "why-teachers-prefer-specific-brands",
    title: "Why Teachers Ask for Specific Stationery Brands",
    excerpt: "Ever wondered why the school list specifies 'Pritt' instead of generic glue, or 'Staedtler' instead of cheaper pencils? Here's the inside scoop.",
    content: [
      "As a parent, looking at a stationery list and seeing specific, sometimes premium brands requested can be frustrating. Why does it have to be a specific brand of glue or a specific make of scissors?",
      "Teachers don't ask for these brands to be difficult. They ask for them based on years of classroom experience.",
      "Here is why brand matters in the classroom:",
      "1. Glue That Actually Sticks: Generic glue sticks often dry out within a week or lose their adhesion, causing worksheets to fall out of exercise books. Teachers prefer brands like Pritt because the work stays glued all year.",
      "2. Pencils That Don't Break Internally: Cheap pencils often have brittle lead. When dropped, the lead shatters inside the wood. When the child sharpens it, the tip keeps falling out. Quality pencils save time and frustration.",
      "3. Erasers That Don't Smudge: A bad eraser will tear the paper or leave a massive black smudge, ruining the child's hard work.",
      "At PexPacks, we strictly follow the school's requested brands. If your school asks for a specific brand, that is exactly what goes into the box, ensuring your child has exactly what the teacher knows works best."
    ],
    date: "2023-11-20",
    author: "PexPacks Team",
    category: "Education",
    image: "/images/office-packs.png",
  }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
