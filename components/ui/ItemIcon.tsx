import React from "react";
import {
  BookOpen,
  Book,
  FileText,
  Folder,
  Layers,
  Scroll,
  Newspaper,
  BookCheck,
  StickyNote,
  Pencil,
  PencilLine,
  Pen,
  PenTool,
  Highlighter,
  Sparkles,
  Palette,
  Paintbrush,
  Eraser,
  Compass,
  Ruler,
  Calculator,
  Shapes,
  Scissors,
  Stamp,
  Paperclip,
  Pin,
  Briefcase,
  Backpack,
  Package,
  Box,
  Archive,
  Tag,
  Bookmark,
  Shield,
  FlaskConical,
  Microscope,
  Globe,
  Atom,
  Music,
  Image,
  Laptop,
  Headphones,
  Clock,
  Bell,
  Award,
  Smile,
} from "lucide-react";

type ItemIconProps = {
  name?: string;
  className?: string;
  size?: number;
};

export function ItemIcon({ name, className = "", size = 20 }: ItemIconProps) {
  const props = { size, className };

  switch (name) {
    case "notebook":
      return <BookOpen {...props} />;
    case "pad":
      return <Book {...props} />;
    case "file":
      return <FileText {...props} />;
    case "folder":
      return <Folder {...props} />;
    case "layers":
      return <Layers {...props} />;
    case "scroll":
      return <Scroll {...props} />;
    case "newspaper":
      return <Newspaper {...props} />;
    case "book-check":
      return <BookCheck {...props} />;
    case "sticky-note":
      return <StickyNote {...props} />;
    case "pencil":
      return <Pencil {...props} />;
    case "pen":
      return <PencilLine {...props} />;
    case "fountain-pen":
      return <Pen {...props} />;
    case "marker":
      return <PenTool {...props} />;
    case "highlighter":
      return <Highlighter {...props} />;
    case "crayon":
      return <Sparkles {...props} />;
    case "paint":
      return <Palette {...props} />;
    case "paintbrush":
      return <Paintbrush {...props} />;
    case "eraser":
      return <Eraser {...props} />;
    case "sharpener":
      return <Compass {...props} />;
    case "ruler":
      return <Ruler {...props} />;
    case "calculator":
      return <Calculator {...props} />;
    case "shapes":
      return <Shapes {...props} />;
    case "scissors":
      return <Scissors {...props} />;
    case "glue":
      return <Stamp {...props} />;
    case "paperclip":
      return <Paperclip {...props} />;
    case "pin":
      return <Pin {...props} />;
    case "bag":
      return <Briefcase {...props} />;
    case "backpack":
      return <Backpack {...props} />;
    case "box":
      return <Package {...props} />;
    case "archive":
      return <Archive {...props} />;
    case "tag":
      return <Tag {...props} />;
    case "bookmark":
      return <Bookmark {...props} />;
    case "shield":
      return <Shield {...props} />;
    case "flask":
      return <FlaskConical {...props} />;
    case "microscope":
      return <Microscope {...props} />;
    case "globe":
      return <Globe {...props} />;
    case "atom":
      return <Atom {...props} />;
    case "music":
      return <Music {...props} />;
    case "image":
      return <Image {...props} />;
    case "laptop":
      return <Laptop {...props} />;
    case "headphones":
      return <Headphones {...props} />;
    case "clock":
      return <Clock {...props} />;
    case "bell":
      return <Bell {...props} />;
    case "award":
      return <Award {...props} />;
    case "smile":
      return <Smile {...props} />;
    default:
      return <Box {...props} />;
  }
}
