import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, CLAUDE_CONFIG } from "./prompts";

export interface ClipboardItem {
  content: string;
  timestamp: string;
  type?: string; // 'text', 'code', 'url', etc.
  tags?: string[]; // e.g., ['setup', 'debug', 'config']
  intent?: string; // User's purpose/reasoning (from 'why:' annotations)
  context?: {
    app?: string; // Application context (terminal, vscode, browser, etc.)
    workingDirectory?: string; // Current directory if applicable
    gitBranch?: string; // Git branch if applicable
  };
}

export async function generateProcedure(
  clipboardHistory: ClipboardItem[],
  title: string,
  apiKey: string | undefined,
  customInstructions?: string,
  language?: string,
): Promise<string> {
  if (!clipboardHistory || clipboardHistory.length === 0) {
    throw new Error("Clipboard history is empty");
  }

  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      "Anthropic API key is required. Please add it in Raycast preferences or upgrade to Raycast Pro.",
    );
  }

  const userPrompt = formatClipboardHistoryPrompt(
    clipboardHistory,
    title,
    customInstructions,
    language,
  );

  try {
    const client = new Anthropic({
      apiKey,
      timeout: 60000, // 60 seconds
      maxRetries: 2, // Retry failed requests
    });

    const message = await client.messages.create({
      model: CLAUDE_CONFIG.defaultModel,
      max_tokens: CLAUDE_CONFIG.maxTokens,
      temperature: CLAUDE_CONFIG.temperature,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Ensure the markdown starts with the user-provided title
    const markdown = ensureTitleInMarkdown(textContent.text, title);
    return markdown;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate procedure: ${error.message}`);
    }
    throw new Error("Failed to generate procedure: Unknown error");
  }
}

/**
 * Ensure the markdown starts with the user-provided title as H1
 * Replaces the first H1 if it exists, or prepends the title if not
 */
function ensureTitleInMarkdown(markdown: string, title: string): string {
  const lines = markdown.split("\n");

  // Check if the first non-empty line is an H1
  let firstContentIndex = 0;
  while (firstContentIndex < lines.length && !lines[firstContentIndex].trim()) {
    firstContentIndex++;
  }

  if (firstContentIndex < lines.length) {
    const firstLine = lines[firstContentIndex].trim();
    // If first line is an H1 (starts with single # followed by space, not ##), replace it
    if (firstLine.match(/^#\s/)) {
      lines[firstContentIndex] = `# ${title}`;
      return lines.join("\n");
    }
  }

  // If no H1 found at the start, prepend the title
  return `# ${title}\n\n${markdown}`;
}

/**
 * Format tags as a string (e.g., "#setup, #debug")
 */
function formatTags(tags: string[]): string {
  return tags.map((tag) => `#${tag}`).join(", ");
}

/**
 * Format context information as a string
 */
function formatContext(context: ClipboardItem["context"]): string | null {
  if (!context) return null;

  const contextParts: string[] = [];
  if (context.app) contextParts.push(`App: ${context.app}`);
  if (context.workingDirectory)
    contextParts.push(`Directory: ${context.workingDirectory}`);
  if (context.gitBranch) contextParts.push(`Branch: ${context.gitBranch}`);

  return contextParts.length > 0 ? contextParts.join(" | ") : null;
}

/**
 * Format a single clipboard item for the prompt
 */
function formatClipboardItem(item: ClipboardItem, index: number): string {
  const lines: string[] = [];
  const time = new Date(item.timestamp).toLocaleTimeString();
  const type = item.type || "text";

  lines.push(`### Item ${index + 1} (${time}) - ${type}`);

  // Add metadata if available
  if (item.tags && item.tags.length > 0) {
    lines.push(`**Tags:** ${formatTags(item.tags)}`);
  }

  if (item.intent) {
    lines.push(`**Intent:** ${item.intent}`);
  }

  const contextStr = formatContext(item.context);
  if (contextStr) {
    lines.push(`**Context:** ${contextStr}`);
  }

  // Add content
  lines.push("");
  lines.push("**Content:**");
  lines.push("```");
  lines.push(item.content.trim());
  lines.push("```");
  lines.push("");

  return lines.join("\n");
}

function formatClipboardHistoryPrompt(
  history: ClipboardItem[],
  title: string,
  customInstructions?: string,
  language?: string,
): string {
  const lines: string[] = [];

  // Add language specification
  const targetLanguage = language || "English";
  const languageInstruction =
    targetLanguage.toLowerCase() === "english"
      ? "Generate the procedure document in English."
      : `IMPORTANT: Generate the entire procedure document in ${targetLanguage}. Use natural, professional ${targetLanguage} language throughout.`;

  lines.push(languageInstruction);
  lines.push("");
  lines.push(
    `Here is a developer's clipboard history from a work session with metadata. Please analyze it and create a clear, step-by-step procedure document with the title "${title}":`,
  );
  lines.push("");

  // Add custom instructions if provided
  if (customInstructions) {
    lines.push("## Custom Instructions");
    lines.push(customInstructions);
    lines.push("");
  }

  lines.push(`## Clipboard History (${history.length} items)`);
  lines.push("");

  // Format each clipboard item
  history.forEach((item, index) => {
    lines.push(formatClipboardItem(item, index));
  });

  lines.push(
    `Please create a comprehensive procedure document from this clipboard history with the title "${title}". The document MUST start with a level 1 heading using the exact title provided: # ${title}`,
  );
  lines.push(
    'Use the tags to organize steps by purpose, incorporate intent information to explain the "why" behind actions, and include relevant context details. Focus on clarity and practical usefulness.',
  );

  // Reinforce custom instructions if provided
  if (customInstructions) {
    lines.push("");
    lines.push(
      "Remember to follow the custom instructions provided above when generating the procedure.",
    );
  }

  // Reinforce language requirement
  if (targetLanguage.toLowerCase() !== "english") {
    lines.push("");
    lines.push(
      `IMPORTANT: The entire document must be in ${targetLanguage}, including all headings, descriptions, and explanations.`,
    );
  }

  return lines.join("\n");
}
