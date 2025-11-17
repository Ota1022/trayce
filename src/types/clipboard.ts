/**
 * Represents an item from the clipboard with metadata
 */
export interface ClipboardItem {
  /** The actual content of the clipboard item */
  content: string;
  /** ISO timestamp when the item was captured */
  timestamp: string;
  /** Content type: 'text', 'code', 'url', 'command', 'json' */
  type: string;
  /** Optional tags extracted from content (e.g., ['setup', 'debug', 'config']) */
  tags?: string[];
  /** User's purpose/reasoning (from 'why:' or 'purpose:' annotations) */
  intent?: string;
  /** Additional context about where the content was copied from */
  context?: {
    /** Application context (terminal, vscode, browser, etc.) */
    app?: string;
    /** Current working directory if applicable */
    workingDirectory?: string;
    /** Git branch if applicable */
    gitBranch?: string;
  };
}
