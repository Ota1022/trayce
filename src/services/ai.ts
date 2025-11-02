/**
 * Dual-Path AI Service
 * Provides AI generation using either Raycast AI (for Pro users) or Anthropic API (fallback)
 */

import { getPreferenceValues } from "@raycast/api";
import { useAI } from "@raycast/utils";
import { generateProcedure as generateWithAnthropic } from "./claude";
import { ClipboardItem } from "./claude";
import { SYSTEM_PROMPT, CLAUDE_CONFIG } from "./prompts";

interface Preferences {
  anthropicApiKey?: string;
  modelSelection?: string;
  maxClipboardItems: string;
}

/**
 * Format the prompt for AI generation
 * This creates a comprehensive prompt including clipboard history, metadata, and instructions
 */
function formatPrompt(
  clipboardHistory: ClipboardItem[],
  title: string,
  customInstructions?: string,
  language?: "English" | "Japanese",
): string {
  const lines: string[] = [];

  // Add language specification
  const languageInstruction =
    language === "Japanese"
      ? "IMPORTANT: Generate the entire procedure document in Japanese (日本語). Use natural, professional Japanese language throughout."
      : "Generate the procedure document in English.";

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

  lines.push(`## Clipboard History (${clipboardHistory.length} items)`);
  lines.push("");

  // Format each clipboard item
  clipboardHistory.forEach((item, index) => {
    const time = new Date(item.timestamp).toLocaleTimeString();
    const type = item.type || "text";

    lines.push(`### Item ${index + 1} (${time}) - ${type}`);

    // Add metadata if available
    if (item.tags && item.tags.length > 0) {
      lines.push(`**Tags:** ${item.tags.map((tag) => `#${tag}`).join(", ")}`);
    }

    if (item.intent) {
      lines.push(`**Intent:** ${item.intent}`);
    }

    if (item.context) {
      const contextParts: string[] = [];
      if (item.context.app) contextParts.push(`App: ${item.context.app}`);
      if (item.context.workingDirectory)
        contextParts.push(`Directory: ${item.context.workingDirectory}`);
      if (item.context.gitBranch)
        contextParts.push(`Branch: ${item.context.gitBranch}`);

      if (contextParts.length > 0) {
        lines.push(`**Context:** ${contextParts.join(" | ")}`);
      }
    }

    // Add content
    lines.push("");
    lines.push("**Content:**");
    lines.push("```");
    lines.push(item.content.trim());
    lines.push("```");
    lines.push("");
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
  if (language === "Japanese") {
    lines.push("");
    lines.push(
      "IMPORTANT: The entire document must be in Japanese (日本語), including all headings, descriptions, and explanations.",
    );
  }

  return lines.join("\n");
}

/**
 * Ensure the markdown starts with the user-provided title as H1
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
 * Custom hook for generating procedures with dual-path AI support
 * - Uses Raycast AI (free for Pro users) as primary method
 * - Falls back to Anthropic API if user provides their own key
 * - Provides clear error messages for different scenarios
 */
export function useGenerateProcedure() {
  const preferences = getPreferenceValues<Preferences>();

  /**
   * Generate procedure using the best available AI provider
   */
  async function generate(
    clipboardHistory: ClipboardItem[],
    title: string,
    customInstructions?: string,
    language?: "English" | "Japanese",
  ): Promise<{ markdown: string; provider: "raycast" | "anthropic" }> {
    if (!clipboardHistory || clipboardHistory.length === 0) {
      throw new Error("Clipboard history is empty");
    }

    // Strategy 1: If user provided API key, use Anthropic API directly
    // This gives users with API keys full control over their usage
    // If Anthropic API fails, don't try Raycast AI as user explicitly chose to use their key
    if (preferences.anthropicApiKey && preferences.anthropicApiKey.trim()) {
      const markdown = await generateWithAnthropic(
        clipboardHistory,
        title,
        preferences.anthropicApiKey,
        customInstructions,
        language,
      );
      return { markdown, provider: "anthropic" };
    }

    // Strategy 2: Try Raycast AI (for Pro users without custom API key)
    // This is free for Raycast Pro subscribers
    throw new Error(
      "Raycast AI integration requires using the hook directly in the component. Please use the Anthropic API key option for now.",
    );
  }

  return { generate };
}

/**
 * Hook for generating procedures using Raycast AI
 * This must be used directly in React components due to hook rules
 */
export function useRaycastAI(
  clipboardHistory: ClipboardItem[],
  title: string,
  customInstructions?: string,
  language?: "English" | "Japanese",
) {
  const prompt = formatPrompt(
    clipboardHistory,
    title,
    customInstructions,
    language,
  );

  // Combine system prompt and user prompt for Raycast AI
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;

  const ai = useAI(fullPrompt, {
    creativity: CLAUDE_CONFIG.temperature,
    execute: false, // Don't auto-execute, we'll trigger manually
  });

  return {
    ...ai,
    generateWithTitle: (generatedMarkdown: string) =>
      ensureTitleInMarkdown(generatedMarkdown, title),
  };
}

/**
 * Generate procedure using Anthropic API directly
 * This is a convenience wrapper around the claude.ts service
 */
export async function generateWithAnthropicAPI(
  clipboardHistory: ClipboardItem[],
  title: string,
  apiKey: string,
  customInstructions?: string,
  language?: "English" | "Japanese",
): Promise<string> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      "Anthropic API key is required. Please add it in Raycast preferences or use Raycast Pro.",
    );
  }

  return await generateWithAnthropic(
    clipboardHistory,
    title,
    apiKey,
    customInstructions,
    language,
  );
}
