/**
 * Strip HTML tags from a string and return plain text
 * @param html HTML string to parse
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(html: string): string {
  if (!html) return "";

  // Create a temporary DOM element
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Get text content (removes all HTML tags)
  return temp.textContent || temp.innerText || "";
}

/**
 * Extract and clean text from HTML, removing extra whitespace
 * @param html HTML string to parse
 * @returns Cleaned plain text
 */
export function cleanHtmlText(html: string): string {
  const plainText = stripHtmlTags(html);
  // Remove extra whitespace and newlines
  return plainText
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n");
}

/**
 * Parse HTML and get the main text content
 * Useful for getting the primary message while ignoring empty containers
 * @param html HTML string to parse
 * @returns Main text content
 */
export function getMainTextContent(html: string): string {
  if (!html) return "";

  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Get all text nodes and filter out empty ones
  const walker = document.createTreeWalker(
    temp,
    NodeFilter.SHOW_TEXT,
    null
  );

  const textParts: string[] = [];
  let node;

  while ((node = walker.nextNode())) {
    const text = (node as Text).textContent?.trim();
    if (text) {
      textParts.push(text);
    }
  }

  return textParts.join("\n").trim();
}
