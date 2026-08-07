export function getGradeOrder(text: string): number {
  if (!text) return 999;
  const str = text.toLowerCase();
  if (/\bgrade\s*r\b|\bgrade\s*0\b|\bgrade\s*00\b/i.test(str)) {
    return 0;
  }
  const match = str.match(/grade\s*(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  const numMatch = str.match(/\b(\d+)\b/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }
  return 999;
}
