export type PackItemIconKey =
  | "notebook"
  | "pad"
  | "file"
  | "folder"
  | "layers"
  | "scroll"
  | "newspaper"
  | "book-check"
  | "sticky-note"
  | "pencil"
  | "pen"
  | "fountain-pen"
  | "marker"
  | "highlighter"
  | "crayon"
  | "paint"
  | "paintbrush"
  | "eraser"
  | "sharpener"
  | "ruler"
  | "calculator"
  | "shapes"
  | "scissors"
  | "glue"
  | "paperclip"
  | "pin"
  | "bag"
  | "backpack"
  | "box"
  | "archive"
  | "tag"
  | "bookmark"
  | "shield"
  | "flask"
  | "microscope"
  | "globe"
  | "atom"
  | "music"
  | "image"
  | "laptop"
  | "headphones"
  | "clock"
  | "bell"
  | "award"
  | "smile";

export const PACK_ITEM_ICONS: { key: PackItemIconKey; label: string }[] = [
  // Books & Paper
  { key: "notebook", label: "Notebook / Exercise Book" },
  { key: "pad", label: "Writing Pad / Exam Pad" },
  { key: "file", label: "Document / File" },
  { key: "folder", label: "Folder / Doc Wallet" },
  { key: "layers", label: "Construction Paper / Board" },
  { key: "scroll", label: "Flipchart / Poster Paper" },
  { key: "newspaper", label: "Dictionary / Text Paper" },
  { key: "book-check", label: "Textbook / Syllabus Book" },
  { key: "sticky-note", label: "Sticky Notes / Memos" },

  // Writing & Drawing
  { key: "pencil", label: "Pencil / Lead Pencil" },
  { key: "pen", label: "Pen / Ballpoint Pen" },
  { key: "fountain-pen", label: "Fountain Pen / Ink" },
  { key: "marker", label: "Felt-Tip Marker / Koki" },
  { key: "highlighter", label: "Highlighter" },
  { key: "crayon", label: "Wax Crayons / Pastels" },
  { key: "paint", label: "Paint / Palette" },
  { key: "paintbrush", label: "Paintbrush" },
  { key: "eraser", label: "Eraser / Rubber" },
  { key: "sharpener", label: "Pencil Sharpener" },

  // Math & Measurement
  { key: "ruler", label: "Ruler / Scale" },
  { key: "calculator", label: "Calculator" },
  { key: "shapes", label: "Geometry Set / Protractor" },

  // Cutting & Adhesive
  { key: "scissors", label: "Scissors / Craft Scissors" },
  { key: "glue", label: "Glue Stick / Adhesive" },
  { key: "paperclip", label: "Paperclips / Fasteners" },
  { key: "pin", label: "Pushpins / Thumb Tacks" },

  // Bags & Cases
  { key: "bag", label: "Pencil Case / Pouch" },
  { key: "backpack", label: "School Bag / Backpack" },
  { key: "box", label: "Pack / Stationery Box" },
  { key: "archive", label: "Archive / Storage Case" },
  { key: "tag", label: "Name Tag / Label Stickers" },
  { key: "bookmark", label: "Bookmark / Index Tab" },
  { key: "shield", label: "Book Covers / Pexcover" },

  // STEM & Science
  { key: "flask", label: "Chemistry / Science Flask" },
  { key: "microscope", label: "Biology / Microscope" },
  { key: "globe", label: "Geography / Globe & Atlas" },
  { key: "atom", label: "Physics / Science" },

  // Art, Music & Tech
  { key: "music", label: "Music / Recorder Instrument" },
  { key: "image", label: "Art Canvas / Drawing Pad" },
  { key: "laptop", label: "Laptop / Computer Tech" },
  { key: "headphones", label: "Headphones / Audio Kit" },
  { key: "clock", label: "Exam Timer / Wall Clock" },
  { key: "bell", label: "School Bell / Classroom" },
  { key: "award", label: "Merit Star / Certificate" },
  { key: "smile", label: "Kindergarten / Pre-School" },
];

export function isPackItemIconKey(value: string): value is PackItemIconKey {
  return PACK_ITEM_ICONS.some((icon) => icon.key === value);
}
