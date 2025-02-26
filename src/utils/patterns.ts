const AVAILABLE_PATTERNS = ["charlie-brown", "texture", "topography"];

export function getRandomPattern() {
  const pattern =
    AVAILABLE_PATTERNS[Math.floor(Math.random() * AVAILABLE_PATTERNS.length)]!;
  return pattern;
}

export function getPatternUrl(pattern: string) {
  return `/patterns/${pattern}.svg`;
}
