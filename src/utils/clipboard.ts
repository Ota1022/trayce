import { Clipboard } from "@raycast/api";
import { ClipboardItem } from "../types/clipboard";

const MAX_HISTORY_ITEMS = 50;

/**
 * Get clipboard history from Raycast's clipboard manager
 * Note: Raycast API doesn't expose full clipboard history yet,
 * so we'll use a simplified approach by reading recent clipboard content
 */
export async function getClipboardHistory(
  limit: number = MAX_HISTORY_ITEMS,
): Promise<ClipboardItem[]> {
  try {
    // Raycast API only supports reading up to 5 clipboard history items (offset 0-5)
    const maxRaycastHistory = 5;
    const itemsToFetch = Math.min(limit, maxRaycastHistory);

    const items: ClipboardItem[] = [];

    // Read clipboard items using offset (0 = most recent)
    for (let offset = 0; offset < itemsToFetch; offset++) {
      try {
        const clipContent = await Clipboard.read({ offset });
        const text = clipContent?.text;

        if (text) {
          items.push({
            content: text,
            timestamp: new Date().toISOString(),
            type: detectContentType(text),
            tags: extractTags(text),
            intent: extractIntent(text),
            context: {
              app: "Clipboard History",
            },
          });
        }
      } catch (error) {
        // If offset doesn't exist, stop reading
        break;
      }
    }

    return items;
  } catch (error) {
    console.error("Error reading clipboard:", error);
    return [];
  }
}

/**
 * Detect the type of content based on patterns
 */
function detectContentType(content: string): string {
  // URL pattern
  if (/^https?:\/\/.+/.test(content.trim())) {
    return "url";
  }

  // Command pattern (starts with common CLI commands or contains $)
  if (
    /^(npm|yarn|git|cd|ls|mkdir|cp|mv|rm|docker|kubectl|cargo|go)\s/.test(
      content.trim(),
    ) ||
    content.includes("$")
  ) {
    return "command";
  }

  // Code pattern (contains common programming syntax)
  if (
    /(function|const|let|var|class|import|export|def|public|private)/.test(
      content,
    ) ||
    (content.includes("{") && content.includes("}"))
  ) {
    return "code";
  }

  // JSON pattern
  try {
    JSON.parse(content);
    return "json";
  } catch {
    // Not JSON
  }

  return "text";
}

/**
 * Extract hashtags from content
 * Looks for patterns like #setup, #debug, #config
 */
function extractTags(content: string): string[] | undefined {
  const tagPattern = /#([a-zA-Z][a-zA-Z0-9_-]*)/g;
  const tags: string[] = [];
  let match;

  while ((match = tagPattern.exec(content)) !== null) {
    tags.push(match[1].toLowerCase());
  }

  return tags.length > 0 ? tags : undefined;
}

/**
 * Extract intent/purpose from content
 * Looks for patterns like "why: <reason>" or "purpose: <reason>"
 */
function extractIntent(content: string): string | undefined {
  // Match "why:" or "purpose:" followed by the explanation
  const intentPattern = /(?:why|purpose):\s*(.+?)(?:\n|$)/i;
  const match = content.match(intentPattern);

  if (match && match[1]) {
    return match[1].trim();
  }

  // Also check for comment patterns with intent
  const commentIntentPattern = /(?:\/\/|#)\s*(?:why|purpose):\s*(.+?)(?:\n|$)/i;
  const commentMatch = content.match(commentIntentPattern);

  if (commentMatch && commentMatch[1]) {
    return commentMatch[1].trim();
  }

  return undefined;
}

/**
 * Monitor clipboard changes
 * This is a placeholder for a future implementation
 * that would continuously monitor clipboard changes
 */
export function startClipboardMonitoring(
  callback: (item: ClipboardItem) => void,
): () => void {
  let previousContent = "";

  const interval = setInterval(async () => {
    const currentContent = await Clipboard.readText();

    if (currentContent && currentContent !== previousContent) {
      previousContent = currentContent;

      callback({
        content: currentContent,
        timestamp: new Date().toISOString(),
        type: detectContentType(currentContent),
        tags: extractTags(currentContent),
        intent: extractIntent(currentContent),
        context: {
          app: "Raycast",
        },
      });
    }
  }, 1000); // Check every second

  // Return cleanup function
  return () => clearInterval(interval);
}
