type SchoolLogoPlaceholderProps = {
  className?: string;
  title?: string;
  width?: number;
  height?: number;
};

const DEFAULT_SIZE = 160;

export function SchoolLogoPlaceholder({
  className,
  title = "School logo placeholder",
  width = DEFAULT_SIZE,
  height = DEFAULT_SIZE,
}: SchoolLogoPlaceholderProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 160"
      role="img"
      aria-label={title}
      className={className}
      width={width}
      height={height}
    >
      <rect width="160" height="160" rx="34" fill="#f5f7f4" />
      <path fill="#1c2d38" d="M80 24 30 45v32c0 31 20 50 50 59 30-9 50-28 50-59V45L80 24Z" />
      <path fill="#2aa7a1" d="M80 39 47 53v24c0 22 13 36 33 44 20-8 33-22 33-44V53L80 39Z" />
      <path fill="#fff" d="M53 68h54v10H53zM63 87h34v9H63z" />
      <circle cx="80" cy="58" r="8" fill="#f26b5e" />
    </svg>
  );
}
