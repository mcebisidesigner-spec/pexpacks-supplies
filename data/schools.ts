export type GradePack = {
  id: string;
  grade: string;
  gradeSlug: string;
  price: number;
  contents: string[];
  deliveryNote: string;
  availability: "in-stock" | "pre-order" | "seasonal";
};

export type School = {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
  logo: string;
  isPartnerSchool: boolean;
  grades: GradePack[];
};

export const schools: School[] = [
  {
    id: "school-parktown-primary",
    name: "Parktown Primary",
    slug: "parktown-primary",
    city: "Johannesburg",
    province: "Gauteng",
    logo: "/images/school-logo-placeholder.svg",
    isPartnerSchool: true,
    grades: [
      {
        id: "parktown-grade-r",
        grade: "Grade R",
        gradeSlug: "grade-r",
        price: 699,
        contents: ["Exercise books", "Wax crayons", "Glue stick", "Safety scissors", "Scrapbook"],
        deliveryNote: "Prepared for delivery before school starts.",
        availability: "seasonal"
      },
      {
        id: "parktown-grade-4",
        grade: "Grade 4",
        gradeSlug: "grade-4",
        price: 799,
        contents: ["10 exercise books", "Blue pens", "HB pencils", "30 cm ruler", "Colour pencils", "Glue stick", "Eraser"],
        deliveryNote: "Prepared for delivery before school starts.",
        availability: "in-stock"
      },
      {
        id: "parktown-grade-7",
        grade: "Grade 7",
        gradeSlug: "grade-7",
        price: 849,
        contents: ["Exercise books", "Pens", "Pencils", "Mathematical set", "Colour pencils", "Files"],
        deliveryNote: "Prepared for delivery before school starts.",
        availability: "pre-order"
      }
    ]
  },
  {
    id: "school-northcliff-high",
    name: "Northcliff High",
    slug: "northcliff-high",
    city: "Johannesburg",
    province: "Gauteng",
    logo: "/images/school-logo-placeholder.svg",
    isPartnerSchool: false,
    grades: [
      {
        id: "northcliff-grade-8",
        grade: "Grade 8",
        gradeSlug: "grade-8",
        price: 899,
        contents: ["Exercise books", "Blue pens", "Pencils", "Highlighters", "Files"],
        deliveryNote: "Availability confirmed during order follow-up.",
        availability: "pre-order"
      },
      {
        id: "northcliff-grade-10",
        grade: "Grade 10",
        gradeSlug: "grade-10",
        price: 949,
        contents: ["Exercise books", "Pens", "Pencils", "Exam pad", "Files", "Mathematical set"],
        deliveryNote: "Availability confirmed during order follow-up.",
        availability: "pre-order"
      }
    ]
  },
  {
    id: "school-durbanville-primary",
    name: "Durbanville Primary",
    slug: "durbanville-primary",
    city: "Cape Town",
    province: "Western Cape",
    logo: "/images/school-logo-placeholder.svg",
    isPartnerSchool: false,
    grades: [
      {
        id: "durbanville-grade-1",
        grade: "Grade 1",
        gradeSlug: "grade-1",
        price: 699,
        contents: ["Exercise books", "Pencils", "Crayons", "Glue stick", "Scissors"],
        deliveryNote: "Availability confirmed during order follow-up.",
        availability: "pre-order"
      },
      {
        id: "durbanville-grade-4",
        grade: "Grade 4",
        gradeSlug: "grade-4",
        price: 799,
        contents: ["Exercise books", "Pens", "Pencils", "Ruler", "Colour pencils", "Eraser"],
        deliveryNote: "Availability confirmed during order follow-up.",
        availability: "pre-order"
      }
    ]
  },
  {
    id: "school-soweto-academy",
    name: "Soweto Academy",
    slug: "soweto-academy",
    city: "Soweto",
    province: "Gauteng",
    logo: "/images/school-logo-placeholder.svg",
    isPartnerSchool: true,
    grades: [
      {
        id: "soweto-grade-3",
        grade: "Grade 3",
        gradeSlug: "grade-3",
        price: 749,
        contents: ["Exercise books", "HB pencils", "Colour pencils", "Glue stick", "Ruler", "Reading folder"],
        deliveryNote: "School collection and home delivery options available.",
        availability: "in-stock"
      },
      {
        id: "soweto-grade-6",
        grade: "Grade 6",
        gradeSlug: "grade-6",
        price: 829,
        contents: ["Exercise books", "Blue pens", "Pencils", "Exam pad", "Files", "Maths set"],
        deliveryNote: "School collection and home delivery options available.",
        availability: "in-stock"
      }
    ]
  },
  {
    id: "school-morningside-prep",
    name: "Morningside Prep",
    slug: "morningside-prep",
    city: "Sandton",
    province: "Gauteng",
    logo: "/images/school-logo-placeholder.svg",
    isPartnerSchool: false,
    grades: [
      {
        id: "morningside-grade-2",
        grade: "Grade 2",
        gradeSlug: "grade-2",
        price: 729,
        contents: ["Exercise books", "Crayons", "Pencils", "Glue stick", "Eraser", "Sharpener"],
        deliveryNote: "Prepared according to the supplied stationery list.",
        availability: "pre-order"
      },
      {
        id: "morningside-grade-5",
        grade: "Grade 5",
        gradeSlug: "grade-5",
        price: 819,
        contents: ["Exercise books", "Blue pens", "Pencils", "Colour pencils", "Files", "Glue stick"],
        deliveryNote: "Prepared according to the supplied stationery list.",
        availability: "pre-order"
      }
    ]
  }
];

export const allGrades = Array.from(new Set(schools.flatMap((school) => school.grades.map((grade) => grade.grade))));
export const allCities = Array.from(new Set(schools.map((school) => school.city)));
