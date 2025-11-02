import { randomUUID } from "crypto";

/**
 * Procedure data model for AI-generated procedure documents
 * @interface Procedure
 * @example
 * ```typescript
 * const procedure = createProcedure(
 *   "Setup Development Environment",
 *   "# Setup Development Environment\n\n## Overview\n...",
 *   ["note-id-1", "note-id-2"]
 * );
 * ```
 */
export interface Procedure {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Procedure title (extracted from markdown H1 or auto-generated) */
  title: string;
  /** The full generated procedure markdown content */
  markdown: string;
  /** ISO 8601 timestamp when procedure was created */
  createdAt: string;
  /** ISO 8601 timestamp when procedure was last updated */
  updatedAt: string;
  /** IDs of notes that were used to generate this procedure */
  sourceNoteIds: string[];
  /** Categorization tags inherited from source notes */
  tags?: string[];
}

/**
 * Generate a unique identifier for a procedure using UUID v4
 * @returns {string} A unique UUID string
 * @example
 * ```typescript
 * const id = generateProcedureId();
 * console.log(id); // "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function generateProcedureId(): string {
  return randomUUID();
}

/**
 * Extract title from markdown content (first H1 heading)
 * @param {string} markdown - Markdown content
 * @returns {string} Extracted title or fallback
 * @example
 * ```typescript
 * const markdown = "# My Procedure\n\nContent here...";
 * const title = extractTitleFromMarkdown(markdown);
 * console.log(title); // "My Procedure"
 * ```
 */
export function extractTitleFromMarkdown(markdown: string): string {
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim();
  }

  // Fallback: use first line or generic title
  const firstLine = markdown.split("\n")[0].trim();
  return firstLine || "Untitled Procedure";
}

/**
 * Factory function to create a new Procedure object
 * Automatically generates ID and timestamps
 * @param {string} markdown - The generated procedure markdown content
 * @param {string[]} sourceNoteIds - IDs of notes used to generate this
 * @param {string[]} [tags] - Optional tags inherited from notes
 * @param {string} [userTitle] - Optional user-provided title (takes precedence over extracted title)
 * @returns {Procedure} A new Procedure object with auto-generated ID and timestamps
 * @example
 * ```typescript
 * // Create a procedure with user-provided title
 * const procedure = createProcedure(
 *   "# Setup Guide\n\n## Prerequisites\n...",
 *   ["note-1", "note-2"],
 *   ["setup", "configuration"],
 *   "My Custom Setup Guide"
 * );
 * ```
 */
export function createProcedure(
  markdown: string,
  sourceNoteIds: string[],
  tags?: string[],
  userTitle?: string,
): Procedure {
  const now = new Date().toISOString();
  // Use user-provided title if available, otherwise extract from markdown
  const title = userTitle || extractTitleFromMarkdown(markdown);

  const procedure: Procedure = {
    id: generateProcedureId(),
    title,
    markdown,
    createdAt: now,
    updatedAt: now,
    sourceNoteIds,
  };

  // Only add tags if provided
  if (tags && tags.length > 0) {
    procedure.tags = tags;
  }

  return procedure;
}
