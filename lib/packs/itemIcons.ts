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
  | "book-open-text"
  | "book-marked"
  | "notebook-pen"
  | "notebook-tabs"
  | "file-check"
  | "file-spreadsheet"
  | "clipboard"
  | "clipboard-list"
  | "clipboard-check"
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
  | "pen-line"
  | "pencil-ruler"
  | "brush"
  | "paint-bucket"
  | "signature"
  | "ruler"
  | "calculator"
  | "shapes"
  | "ruler-dimension"
  | "drafting-compass"
  | "triangle"
  | "pi"
  | "scissors"
  | "glue"
  | "paperclip"
  | "pin"
  | "stamp"
  | "bag"
  | "backpack"
  | "box"
  | "archive"
  | "tag"
  | "bookmark"
  | "shield"
  | "briefcase"
  | "shopping-bag"
  | "folders"
  | "package"
  | "flask"
  | "microscope"
  | "globe"
  | "atom"
  | "beaker"
  | "test-tube"
  | "test-tubes"
  | "dna"
  | "thermometer"
  | "music"
  | "image"
  | "laptop"
  | "headphones"
  | "clock"
  | "bell"
  | "award"
  | "smile"
  | "palette"
  | "images"
  | "frame"
  | "speaker"
  | "monitor"
  | "keyboard"
  | "mouse"
  | "printer"
  | "smartphone"
  | "tablet"
  | "graduation-cap"
  | "school"
  | "bus"
  | "medal"
  | "trophy"
  | "tags"
  | "map-pin"
  | "grid-3x3"
  | "layout-grid"
  | "type"
  | "spell-check"
  | "languages"
  | "align-left";

export const PACK_ITEM_ICONS: { key: PackItemIconKey; label: string }[] = [
  // ── Books & Paper ──────────────────────────────────────────────
  { key: "notebook", label: "Notebook / Exercise Book" },
  { key: "pad", label: "Writing Pad / Exam Pad" },
  { key: "file", label: "Document / File" },
  { key: "folder", label: "Folder / Doc Wallet" },
  { key: "layers", label: "Construction Paper / Board" },
  { key: "scroll", label: "Flipchart / Poster Paper" },
  { key: "newspaper", label: "Dictionary / Text Paper" },
  { key: "book-check", label: "Textbook / Syllabus Book" },
  { key: "sticky-note", label: "Sticky Notes / Memos" },
  { key: "book-open-text", label: "Open Textbook / Reading Book" },
  { key: "book-marked", label: "Reference Book / Marked Page" },
  { key: "notebook-pen", label: "Notebook with Pen / Journal" },
  { key: "notebook-tabs", label: "Tabbed Notebook / Planner" },
  { key: "file-check", label: "Completed Document / Signed Form" },
  { key: "file-spreadsheet", label: "Spreadsheet / Data Sheet" },
  { key: "clipboard", label: "Clipboard / Board" },
  { key: "clipboard-list", label: "Checklist / Shopping List" },
  { key: "clipboard-check", label: "Completed Checklist / Verified" },

  // ── Writing & Drawing ──────────────────────────────────────────
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
  { key: "pen-line", label: "Fine-Tip Pen / Fineliner" },
  { key: "pencil-ruler", label: "Technical Drawing / Drafting" },
  { key: "brush", label: "Art Brush / Paint Brush" },
  { key: "paint-bucket", label: "Paint Bucket / Fill Tool" },
  { key: "signature", label: "Signature / Calligraphy" },

  // ── Math & Measurement ─────────────────────────────────────────
  { key: "ruler", label: "Ruler / Scale" },
  { key: "calculator", label: "Calculator" },
  { key: "shapes", label: "Geometry Set / Protractor" },
  { key: "ruler-dimension", label: "Dimension Ruler / Technical Measure" },
  { key: "drafting-compass", label: "Drafting Compass / Engineering" },
  { key: "triangle", label: "Triangle / Set Square" },
  { key: "pi", label: "Pi / Math Symbol" },

  // ── Cutting & Adhesive ─────────────────────────────────────────
  { key: "scissors", label: "Scissors / Craft Scissors" },
  { key: "glue", label: "Glue Stick / Adhesive" },
  { key: "paperclip", label: "Paperclips / Fasteners" },
  { key: "pin", label: "Pushpins / Thumb Tacks" },
  { key: "stamp", label: "Stamp / Seal / Date Stamp" },

  // ── Bags & Cases ───────────────────────────────────────────────
  { key: "bag", label: "Pencil Case / Pouch" },
  { key: "backpack", label: "School Bag / Backpack" },
  { key: "box", label: "Pack / Stationery Box" },
  { key: "archive", label: "Archive / Storage Case" },
  { key: "tag", label: "Name Tag / Label Stickers" },
  { key: "bookmark", label: "Bookmark / Index Tab" },
  { key: "shield", label: "Book Covers / Pexcover" },
  { key: "briefcase", label: "Briefcase / Professional Bag" },
  { key: "shopping-bag", label: "Shopping Bag / Gift Bag" },
  { key: "folders", label: "Multiple Folders / File Organizer" },
  { key: "package", label: "Package / Parcel / Delivery" },

  // ── STEM & Science ─────────────────────────────────────────────
  { key: "flask", label: "Chemistry / Science Flask" },
  { key: "microscope", label: "Biology / Microscope" },
  { key: "globe", label: "Geography / Globe & Atlas" },
  { key: "atom", label: "Physics / Science" },
  { key: "beaker", label: "Beaker / Lab Equipment" },
  { key: "test-tube", label: "Test Tube / Experiment" },
  { key: "test-tubes", label: "Test Tubes / Lab Set" },
  { key: "dna", label: "DNA Helix / Biology" },
  { key: "thermometer", label: "Thermometer / Temperature" },

  // ── Art, Music & Tech ──────────────────────────────────────────
  { key: "music", label: "Music / Recorder Instrument" },
  { key: "image", label: "Art Canvas / Drawing Pad" },
  { key: "laptop", label: "Laptop / Computer Tech" },
  { key: "headphones", label: "Headphones / Audio Kit" },
  { key: "clock", label: "Exam Timer / Wall Clock" },
  { key: "bell", label: "School Bell / Classroom" },
  { key: "award", label: "Merit Star / Certificate" },
  { key: "smile", label: "Kindergarten / Pre-School" },
  { key: "palette", label: "Color Palette / Swatches" },
  { key: "images", label: "Photo Collection / Gallery" },
  { key: "frame", label: "Picture Frame / Art Frame" },
  { key: "speaker", label: "Speaker / Audio Output" },
  { key: "monitor", label: "Computer Monitor / Screen" },
  { key: "keyboard", label: "Computer Keyboard" },
  { key: "mouse", label: "Computer Mouse / Pointer" },
  { key: "printer", label: "Printer / Output Device" },
  { key: "smartphone", label: "Mobile Phone / Smartphone" },
  { key: "tablet", label: "Tablet Device / iPad" },

  // ── School ─────────────────────────────────────────────────────
  { key: "graduation-cap", label: "Graduation Cap / Academic" },
  { key: "school", label: "School Building / Campus" },
  { key: "bus", label: "School Bus / Transport" },
  { key: "medal", label: "Medal / Achievement" },
  { key: "trophy", label: "Trophy / Winner / Champion" },

  // ── Tags & Markers ─────────────────────────────────────────────
  { key: "tags", label: "Multiple Tags / Labels" },
  { key: "map-pin", label: "Map Pin / Location Marker" },

  // ── Layout & Text ──────────────────────────────────────────────
  { key: "grid-3x3", label: "Graph Paper / Grid" },
  { key: "layout-grid", label: "Layout Grid / Dashboard" },
  { key: "type", label: "Text / Typography" },
  { key: "spell-check", label: "Spell Check / Proofreading" },
  { key: "languages", label: "Languages / Translation" },
  { key: "align-left", label: "Left Alignment / Text Format" },
];

export function isPackItemIconKey(value: string): value is PackItemIconKey {
  return PACK_ITEM_ICONS.some((icon) => icon.key === value);
}
