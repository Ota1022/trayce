import { randomUUID } from "crypto";

/**
 * Context information for a note
 * @interface NoteContext
 */
export interface NoteContext {
  /** Application context (e.g., terminal, vscode, browser) */
  app?: string;
  /** Current working directory when note was created */
  workingDirectory?: string;
  /** Git branch if applicable */
  gitBranch?: string;
}

/**
 * Reference to clipboard content that this note is associated with
 * @interface ClipboardReference
 */
export interface ClipboardReference {
  /** The actual clipboard content */
  content: string;
  /** Content type: 'url' | 'command' | 'code' | 'json' | 'text' */
  type: string;
  /** ISO 8601 timestamp when clipboard was captured */
  timestamp: string;
}

/**
 * Note data model for user-created notes
 * @interface Note
 * @example
 * ```typescript
 * const note = createNote(
 *   "Fixed authentication bug by updating token validation",
 *   {
 *     content: "git commit -m 'fix: auth token validation'",
 *     type: "command",
 *     timestamp: "2025-10-25T14:30:00Z"
 *   }
 * );
 * ```
 */
export interface Note {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Main note text (required) - user's description of what they did */
  description: string;
  /** ISO 8601 timestamp when note was created */
  createdAt: string;
  /** Optional reference to clipboard content this note is about */
  clipboardReference?: ClipboardReference;
  /** User's intent/purpose (from 'why:' or 'purpose:' annotations) */
  intent?: string;
  /** Categorization hashtags (e.g., ['setup', 'debug', 'config']) */
  tags?: string[];
  /** Context information (app, directory, git branch) */
  context?: NoteContext;
}

/**
 * Generate a unique identifier for a note using UUID v4
 * @returns {string} A unique UUID string
 * @example
 * ```typescript
 * const id = generateNoteId();
 * console.log(id); // "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function generateNoteId(): string {
  return randomUUID();
}

/**
 * Factory function to create a new Note object
 * Automatically generates ID and timestamp
 * @param {string} description - Main note text (required)
 * @param {ClipboardReference} [clipboardReference] - Optional clipboard content reference
 * @returns {Note} A new Note object with auto-generated ID and timestamp
 * @example
 * ```typescript
 * // Create a simple note without clipboard reference
 * const note1 = createNote("Configured development environment");
 *
 * // Create a note with clipboard reference
 * const note2 = createNote(
 *   "Set up git repository",
 *   {
 *     content: "git init && git remote add origin https://github.com/user/repo.git",
 *     type: "command",
 *     timestamp: "2025-10-25T14:30:00Z"
 *   }
 * );
 *
 * // Create a note with metadata
 * const note3 = createNote("Fixed production bug");
 * note3.tags = ['bug', 'production'];
 * note3.intent = "Emergency fix for authentication issue";
 * ```
 */
export function createNote(
  description: string,
  clipboardReference?: ClipboardReference,
): Note {
  const note: Note = {
    id: generateNoteId(),
    description,
    createdAt: new Date().toISOString(),
  };

  // Only add optional fields if provided
  if (clipboardReference) {
    note.clipboardReference = clipboardReference;
  }

  return note;
}
